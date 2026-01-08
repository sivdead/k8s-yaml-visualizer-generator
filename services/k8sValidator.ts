import { z } from 'zod';
import {
    deploymentSchema,
    serviceSchema,
    configMapSchema,
    secretSchema,
    ingressSchema,
    pvcSchema,
    cronJobSchema,
} from '../validation/schemas';
import { K8sResource, ResourceType } from '../types';

export interface ValidationError {
    path: string;
    message: string;
    messageKey?: string;  // For i18n lookup
    messageParams?: Record<string, string>;  // For message interpolation
    severity: 'error' | 'warning';
}

export interface ValidationResult {
    valid: boolean;
    errors: ValidationError[];
    warnings: ValidationError[];
}

/**
 * 获取资源类型对应的 Schema
 */
const getSchemaForKind = (kind: string): z.ZodType | null => {
    switch (kind) {
        case 'Deployment':
            return deploymentSchema;
        case 'Service':
            return serviceSchema;
        case 'ConfigMap':
            return configMapSchema;
        case 'Secret':
            return secretSchema;
        case 'Ingress':
            return ingressSchema;
        case 'PersistentVolumeClaim':
            return pvcSchema;
        case 'CronJob':
            return cronJobSchema;
        default:
            return null;
    }
};

/**
 * K8s 最佳实践检查 - 返回带有 messageKey 的警告
 */
const checkBestPractices = (resource: K8sResource): ValidationError[] => {
    const warnings: ValidationError[] = [];

    // 检查 metadata.labels
    if (!resource.metadata.labels || Object.keys(resource.metadata.labels).length === 0) {
        warnings.push({
            path: 'metadata.labels',
            message: '',  // Will be filled by UI using messageKey
            messageKey: 'missingLabels',
            severity: 'warning',
        });
    }

    // 检查常用标签
    const labels = resource.metadata.labels || {};
    if (!labels['app'] && !labels['app.kubernetes.io/name']) {
        warnings.push({
            path: 'metadata.labels',
            message: '',
            messageKey: 'missingAppLabel',
            severity: 'warning',
        });
    }

    // Deployment 特定检查
    if (resource.kind === 'Deployment') {
        const deployment = resource as any;

        // 检查资源限制
        const containers = deployment.spec?.template?.spec?.containers || [];
        containers.forEach((container: any, idx: number) => {
            if (!container.resources?.limits) {
                warnings.push({
                    path: `spec.template.spec.containers[${idx}].resources.limits`,
                    message: '',
                    messageKey: 'missingLimits',
                    messageParams: { name: container.name },
                    severity: 'warning',
                });
            }
            if (!container.resources?.requests) {
                warnings.push({
                    path: `spec.template.spec.containers[${idx}].resources.requests`,
                    message: '',
                    messageKey: 'missingRequests',
                    messageParams: { name: container.name },
                    severity: 'warning',
                });
            }

            // 检查健康检查
            if (!container.livenessProbe && !container.readinessProbe) {
                warnings.push({
                    path: `spec.template.spec.containers[${idx}]`,
                    message: '',
                    messageKey: 'missingProbes',
                    messageParams: { name: container.name },
                    severity: 'warning',
                });
            }

            // 检查镜像标签
            if (container.image && (container.image.endsWith(':latest') || !container.image.includes(':'))) {
                warnings.push({
                    path: `spec.template.spec.containers[${idx}].image`,
                    message: '',
                    messageKey: 'latestTag',
                    messageParams: { name: container.name },
                    severity: 'warning',
                });
            }
        });

        // 检查副本数
        if (deployment.spec?.replicas === 1) {
            warnings.push({
                path: 'spec.replicas',
                message: '',
                messageKey: 'singleReplica',
                severity: 'warning',
            });
        }
    }

    // Service 特定检查
    if (resource.kind === 'Service') {
        const service = resource as any;
        if (service.spec?.type === 'LoadBalancer') {
            warnings.push({
                path: 'spec.type',
                message: '',
                messageKey: 'loadBalancerCost',
                severity: 'warning',
            });
        }
    }

    // Ingress 特定检查
    if (resource.kind === 'Ingress') {
        const ingress = resource as any;
        if (!ingress.spec?.ingressClassName) {
            warnings.push({
                path: 'spec.ingressClassName',
                message: '',
                messageKey: 'missingIngressClass',
                severity: 'warning',
            });
        }
    }

    return warnings;
};

/**
 * 验证 K8s 资源
 */
export const validateK8sResource = (resource: K8sResource): ValidationResult => {
    const errors: ValidationError[] = [];
    const warnings: ValidationError[] = [];

    // 获取对应的 schema
    const schema = getSchemaForKind(resource.kind);

    if (!schema) {
        return {
            valid: true,
            errors: [],
            warnings: [{
                path: 'kind',
                message: '',
                messageKey: 'unknownKind',
                messageParams: { kind: resource.kind },
                severity: 'warning',
            }],
        };
    }

    // 使用 Zod 进行结构验证
    const result = schema.safeParse(resource);

    if (!result.success) {
        result.error.issues.forEach((issue) => {
            errors.push({
                path: issue.path.join('.'),
                message: issue.message,  // Zod messages are kept as-is for now
                severity: 'error',
            });
        });
    }

    // 添加最佳实践警告
    warnings.push(...checkBestPractices(resource));

    return {
        valid: errors.length === 0,
        errors,
        warnings,
    };
};

/**
 * 获取资源类型标识
 */
export const getResourceTypeFromKind = (kind: string): ResourceType | null => {
    const mapping: Record<string, ResourceType> = {
        'Deployment': 'deployment',
        'Service': 'service',
        'ConfigMap': 'configmap',
        'Secret': 'secret',
        'Ingress': 'ingress',
        'PersistentVolumeClaim': 'pvc',
        'CronJob': 'cronjob',
    };
    return mapping[kind] || null;
};
