import { z } from 'zod';

// ============ 通用验证规则 ============

/**
 * K8s DNS-1123 子域名规范
 * - 最多 253 字符
 * - 只能包含小写字母、数字和连字符
 * - 必须以字母或数字开头和结尾
 */
export const k8sNameSchema = z
    .string()
    .min(1, '名称不能为空')
    .max(253, '名称不能超过 253 个字符')
    .regex(
        /^[a-z0-9]([-a-z0-9]*[a-z0-9])?$/,
        '名称必须由小写字母、数字和连字符组成，且以字母或数字开头和结尾'
    );

/**
 * K8s 命名空间验证
 */
export const k8sNamespaceSchema = z
    .string()
    .min(1, '命名空间不能为空')
    .regex(
        /^[a-z0-9]([-a-z0-9]*[a-z0-9])?$/,
        '命名空间必须由小写字母、数字和连字符组成'
    );

/**
 * 容器镜像验证
 */
export const containerImageSchema = z
    .string()
    .min(1, '镜像不能为空');

/**
 * 端口号验证 (1-65535)
 */
export const portSchema = z
    .number()
    .min(1, '端口必须大于 0')
    .max(65535, '端口不能超过 65535');

/**
 * 副本数验证
 */
export const replicasSchema = z
    .number()
    .min(0, '副本数不能为负数')
    .int('副本数必须为整数');

/**
 * 存储大小验证 (如 1Gi, 500Mi)
 */
export const storageSchema = z
    .string()
    .min(1, '存储大小不能为空')
    .regex(
        /^\d+(\.\d+)?(Ki|Mi|Gi|Ti|Pi|Ei)?$/,
        '存储格式无效，例如: 8Gi, 500Mi'
    );

/**
 * Cron 表达式验证
 */
export const cronScheduleSchema = z
    .string()
    .min(1, 'Cron 表达式不能为空')
    .refine(
        (val) => val.trim().split(/\s+/).length === 5,
        'Cron 表达式必须包含 5 个字段（分 时 日 月 周）'
    );

/**
 * 资源配额验证 (CPU/Memory)
 */
export const resourceQuantitySchema = z
    .string()
    .optional()
    .refine(
        (val) => !val || /^(\d+(\.\d+)?)(m|Mi|Gi|Ki)?$/.test(val),
        '资源格式无效，例如: 100m, 256Mi, 1Gi'
    );

// ============ 元数据 Schema ============

export const metadataSchema = z.object({
    name: k8sNameSchema,
    namespace: k8sNamespaceSchema,
    labels: z.record(z.string(), z.string()).optional(),
    annotations: z.record(z.string(), z.string()).optional(),
});

// ============ 容器相关 Schema ============

export const envVarSchema = z.object({
    name: z.string().min(1, '环境变量名不能为空'),
    value: z.string().optional(),
    valueFrom: z.object({
        configMapKeyRef: z.object({
            name: z.string(),
            key: z.string(),
        }).optional(),
        secretKeyRef: z.object({
            name: z.string(),
            key: z.string(),
        }).optional(),
        fieldRef: z.object({
            fieldPath: z.string(),
        }).optional(),
    }).optional(),
});

export const volumeMountSchema = z.object({
    name: z.string().min(1, '卷名称不能为空'),
    mountPath: z.string().min(1, '挂载路径不能为空'),
    readOnly: z.boolean().optional(),
});

export const probeSchema = z.object({
    httpGet: z.object({
        path: z.string().min(1, '路径不能为空'),
        port: portSchema,
        scheme: z.string().optional(),
    }).optional(),
    tcpSocket: z.object({
        port: portSchema,
    }).optional(),
    exec: z.object({
        command: z.array(z.string()),
    }).optional(),
    initialDelaySeconds: z.number().min(0).optional(),
    periodSeconds: z.number().min(1).optional(),
    timeoutSeconds: z.number().min(1).optional(),
    successThreshold: z.number().min(1).optional(),
    failureThreshold: z.number().min(1).optional(),
});

export const containerSchema = z.object({
    name: z.string().min(1, '容器名称不能为空'),
    image: containerImageSchema,
    imagePullPolicy: z.string(),
    ports: z.array(z.object({
        containerPort: portSchema,
    })).optional(),
    resources: z.object({
        requests: z.object({
            cpu: resourceQuantitySchema,
            memory: resourceQuantitySchema,
        }).optional(),
        limits: z.object({
            cpu: resourceQuantitySchema,
            memory: resourceQuantitySchema,
        }).optional(),
    }).optional(),
    env: z.array(envVarSchema).optional(),
    volumeMounts: z.array(volumeMountSchema).optional(),
    livenessProbe: probeSchema.optional(),
    readinessProbe: probeSchema.optional(),
});

// ============ 资源 Schema ============

/**
 * Deployment 资源验证
 */
export const deploymentSchema = z.object({
    apiVersion: z.string(),
    kind: z.literal('Deployment'),
    metadata: metadataSchema,
    spec: z.object({
        replicas: replicasSchema,
        selector: z.object({
            matchLabels: z.record(z.string(), z.string()),
        }),
        template: z.object({
            metadata: z.object({
                labels: z.record(z.string(), z.string()),
            }),
            spec: z.object({
                containers: z.array(containerSchema).min(1, '至少需要一个容器'),
                initContainers: z.array(containerSchema).optional(),
                volumes: z.array(z.any()).optional(),
                imagePullSecrets: z.array(z.object({ name: z.string() })).optional(),
            }),
        }),
    }),
});

/**
 * Service 资源验证
 */
export const serviceSchema = z.object({
    apiVersion: z.string(),
    kind: z.literal('Service'),
    metadata: metadataSchema,
    spec: z.object({
        type: z.enum(['ClusterIP', 'NodePort', 'LoadBalancer']),
        selector: z.record(z.string(), z.string()),
        ports: z.array(z.object({
            name: z.string().optional(),
            protocol: z.string(),
            port: portSchema,
            targetPort: portSchema,
        })).min(1, '至少需要一个端口'),
        externalIPs: z.array(z.string()).optional(),
    }),
});

/**
 * ConfigMap 资源验证
 */
export const configMapSchema = z.object({
    apiVersion: z.string(),
    kind: z.literal('ConfigMap'),
    metadata: metadataSchema,
    data: z.record(z.string(), z.string()),
});

/**
 * Secret 资源验证
 */
export const secretSchema = z.object({
    apiVersion: z.string(),
    kind: z.literal('Secret'),
    metadata: metadataSchema,
    type: z.string(),
    data: z.record(z.string(), z.string()),
    stringData: z.record(z.string(), z.string()).optional(),
});

/**
 * Ingress 资源验证
 */
export const ingressSchema = z.object({
    apiVersion: z.string(),
    kind: z.literal('Ingress'),
    metadata: metadataSchema,
    spec: z.object({
        ingressClassName: z.string().optional(),
        rules: z.array(z.object({
            host: z.string().optional(),
            http: z.object({
                paths: z.array(z.object({
                    path: z.string().min(1, '路径不能为空'),
                    pathType: z.enum(['Prefix', 'Exact', 'ImplementationSpecific']),
                    backend: z.object({
                        service: z.object({
                            name: z.string().min(1, '服务名不能为空'),
                            port: z.object({
                                number: portSchema,
                            }),
                        }),
                    }),
                })),
            }),
        })),
    }),
});

/**
 * PVC 资源验证
 */
export const pvcSchema = z.object({
    apiVersion: z.string(),
    kind: z.literal('PersistentVolumeClaim'),
    metadata: metadataSchema,
    spec: z.object({
        accessModes: z.array(z.string()).min(1, '至少需要一个访问模式'),
        storageClassName: z.string().optional(),
        volumeMode: z.string().optional(),
        resources: z.object({
            requests: z.object({
                storage: storageSchema,
            }),
        }),
    }),
});

/**
 * CronJob 资源验证
 */
export const cronJobSchema = z.object({
    apiVersion: z.string(),
    kind: z.literal('CronJob'),
    metadata: metadataSchema,
    spec: z.object({
        schedule: cronScheduleSchema,
        jobTemplate: z.object({
            spec: z.object({
                template: z.object({
                    spec: z.object({
                        containers: z.array(containerSchema).min(1, '至少需要一个容器'),
                        restartPolicy: z.string(),
                        imagePullSecrets: z.array(z.object({ name: z.string() })).optional(),
                    }),
                }),
            }),
        }),
    }),
});

// ============ 导出类型 ============

export type DeploymentSchema = z.infer<typeof deploymentSchema>;
export type ServiceSchema = z.infer<typeof serviceSchema>;
export type ConfigMapSchema = z.infer<typeof configMapSchema>;
export type SecretSchema = z.infer<typeof secretSchema>;
export type IngressSchema = z.infer<typeof ingressSchema>;
export type PVCSchema = z.infer<typeof pvcSchema>;
export type CronJobSchema = z.infer<typeof cronJobSchema>;

// ============ 验证辅助函数 ============

/**
 * 验证单个字段
 */
export function validateField<T extends z.ZodType>(
    schema: T,
    value: unknown
): { success: boolean; error?: string } {
    const result = schema.safeParse(value);
    if (result.success) {
        return { success: true };
    }
    return {
        success: false,
        error: result.error.issues[0]?.message || '验证失败',
    };
}

/**
 * 验证完整资源
 */
export function validateResource<T extends z.ZodType>(
    schema: T,
    data: unknown
): { success: boolean; errors: Record<string, string> } {
    const result = schema.safeParse(data);
    if (result.success) {
        return { success: true, errors: {} };
    }

    const errors: Record<string, string> = {};
    result.error.issues.forEach((err) => {
        const path = err.path.join('.');
        errors[path] = err.message;
    });

    return { success: false, errors };
}
