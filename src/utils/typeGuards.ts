import {
    K8sResource,
    ResourceType,
    DeploymentResource,
    ServiceResource,
    ConfigMapResource,
    IngressResource,
    PersistentVolumeClaimResource,
    SecretResource,
    CronJobResource,
    JobResource,
    DaemonSetResource,
    StatefulSetResource,
    HPAResource
} from '../types';

/**
 * Type guards for K8s resources
 */
export function isDeployment(resource: K8sResource): resource is DeploymentResource {
    return resource.kind === 'Deployment';
}

export function isService(resource: K8sResource): resource is ServiceResource {
    return resource.kind === 'Service';
}

export function isConfigMap(resource: K8sResource): resource is ConfigMapResource {
    return resource.kind === 'ConfigMap';
}

export function isIngress(resource: K8sResource): resource is IngressResource {
    return resource.kind === 'Ingress';
}

export function isPVC(resource: K8sResource): resource is PersistentVolumeClaimResource {
    return resource.kind === 'PersistentVolumeClaim';
}

export function isSecret(resource: K8sResource): resource is SecretResource {
    return resource.kind === 'Secret';
}

export function isCronJob(resource: K8sResource): resource is CronJobResource {
    return resource.kind === 'CronJob';
}

export function isJob(resource: K8sResource): resource is JobResource {
    return resource.kind === 'Job';
}

export function isDaemonSet(resource: K8sResource): resource is DaemonSetResource {
    return resource.kind === 'DaemonSet';
}

export function isStatefulSet(resource: K8sResource): resource is StatefulSetResource {
    return resource.kind === 'StatefulSet';
}

export function isHPA(resource: K8sResource): resource is HPAResource {
    return resource.kind === 'HorizontalPodAutoscaler';
}

/**
 * Get resource type from K8sResource
 */
export function getResourceType(resource: K8sResource): ResourceType {
    const kindMap: Record<string, ResourceType> = {
        'Deployment': 'deployment',
        'Service': 'service',
        'ConfigMap': 'configmap',
        'Ingress': 'ingress',
        'PersistentVolumeClaim': 'pvc',
        'Secret': 'secret',
        'CronJob': 'cronjob',
        'Job': 'job',
        'DaemonSet': 'daemonset',
        'StatefulSet': 'statefulset',
        'HorizontalPodAutoscaler': 'hpa'
    };
    return kindMap[resource.kind] || 'deployment';
}
