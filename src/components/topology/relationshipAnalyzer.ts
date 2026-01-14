import {
    K8sResource,
    DeploymentResource,
    ServiceResource,
    IngressResource,
    ConfigMapResource,
    SecretResource,
    PersistentVolumeClaimResource,
    DaemonSetResource,
    StatefulSetResource,
    HPAResource,
    JobResource,
    CronJobResource,
    Container,
    Volume,
} from '../../types';
import {
    TopologyNode,
    TopologyEdge,
    EdgeType,
    ResourceNodeData,
} from './topologyTypes';
import {
    isDeployment,
    isService,
    isConfigMap,
    isIngress,
    isPVC,
    isSecret,
    isCronJob,
    isJob,
    isDaemonSet,
    isStatefulSet,
    isHPA,
} from '../../utils/typeGuards';

/**
 * 将资源类型映射到 ResourceType
 */
function getResourceType(resource: K8sResource): ResourceNodeData['resourceType'] {
    if (isDeployment(resource)) return 'deployment';
    if (isStatefulSet(resource)) return 'statefulset';
    if (isDaemonSet(resource)) return 'daemonset';
    if (isJob(resource)) return 'job';
    if (isCronJob(resource)) return 'cronjob';
    if (isService(resource)) return 'service';
    if (isIngress(resource)) return 'ingress';
    if (isConfigMap(resource)) return 'configmap';
    if (isSecret(resource)) return 'secret';
    if (isPVC(resource)) return 'pvc';
    if (isHPA(resource)) return 'hpa';
    return 'deployment'; // fallback
}

/**
 * 生成唯一的节点 ID
 */
function getNodeId(resource: K8sResource): string {
    return `${resource.kind}-${resource.metadata.namespace}-${resource.metadata.name}`;
}

/**
 * 检查两个 labels 是否匹配（selector 匹配 labels）
 */
function labelsMatch(selector: Record<string, string>, labels: Record<string, string>): boolean {
    return Object.entries(selector).every(([key, value]) => labels[key] === value);
}

/**
 * 获取工作负载的 labels（用于 Service selector 匹配）
 */
function getWorkloadLabels(resource: K8sResource): Record<string, string> | null {
    if (isDeployment(resource) || isStatefulSet(resource) || isDaemonSet(resource)) {
        return resource.spec.template.metadata.labels;
    }
    return null;
}

/**
 * 获取工作负载的 containers
 */
function getContainers(resource: K8sResource): Container[] {
    if (isDeployment(resource) || isStatefulSet(resource) || isDaemonSet(resource)) {
        return [
            ...(resource.spec.template.spec.initContainers || []),
            ...resource.spec.template.spec.containers,
        ];
    }
    if (isJob(resource)) {
        return resource.spec.template.spec.containers;
    }
    if (isCronJob(resource)) {
        return resource.spec.jobTemplate.spec.template.spec.containers;
    }
    return [];
}

/**
 * 获取工作负载的 volumes
 */
function getVolumes(resource: K8sResource): Volume[] {
    if (isDeployment(resource) || isStatefulSet(resource) || isDaemonSet(resource)) {
        return resource.spec.template.spec.volumes || [];
    }
    if (isJob(resource)) {
        return resource.spec.template.spec.volumes || [];
    }
    return [];
}

/**
 * 从 containers 中提取引用的 ConfigMap 名称
 */
function extractConfigMapRefs(containers: Container[], volumes: Volume[]): string[] {
    const refs = new Set<string>();

    // 从环境变量中提取
    containers.forEach(container => {
        container.env?.forEach(env => {
            if (env.valueFrom?.configMapKeyRef?.name) {
                refs.add(env.valueFrom.configMapKeyRef.name);
            }
        });
        container.envFrom?.forEach(envFrom => {
            if (envFrom.configMapRef?.name) {
                refs.add(envFrom.configMapRef.name);
            }
        });
    });

    // 从 volumes 中提取
    volumes.forEach(volume => {
        if (volume.configMap?.name) {
            refs.add(volume.configMap.name);
        }
    });

    return Array.from(refs);
}

/**
 * 从 containers 中提取引用的 Secret 名称
 */
function extractSecretRefs(containers: Container[], volumes: Volume[]): string[] {
    const refs = new Set<string>();

    // 从环境变量中提取
    containers.forEach(container => {
        container.env?.forEach(env => {
            if (env.valueFrom?.secretKeyRef?.name) {
                refs.add(env.valueFrom.secretKeyRef.name);
            }
        });
        container.envFrom?.forEach(envFrom => {
            if (envFrom.secretRef?.name) {
                refs.add(envFrom.secretRef.name);
            }
        });
    });

    // 从 volumes 中提取
    volumes.forEach(volume => {
        if (volume.secret?.secretName) {
            refs.add(volume.secret.secretName);
        }
    });

    return Array.from(refs);
}

/**
 * 从 volumes 中提取 PVC 引用
 */
function extractPVCRefs(volumes: Volume[]): string[] {
    const refs = new Set<string>();

    volumes.forEach(volume => {
        if (volume.persistentVolumeClaim?.claimName) {
            refs.add(volume.persistentVolumeClaim.claimName);
        }
    });

    return Array.from(refs);
}

/**
 * 分析资源间的关系，生成拓扑节点和边
 */
export function analyzeRelationships(resources: K8sResource[]): {
    nodes: TopologyNode[];
    edges: TopologyEdge[];
} {
    const nodes: TopologyNode[] = [];
    const edges: TopologyEdge[] = [];
    const resourceMap = new Map<string, K8sResource>();

    // 第一遍：创建所有节点和资源映射
    resources.forEach((resource, index) => {
        const nodeId = getNodeId(resource);
        const resourceType = getResourceType(resource);

        // 根据资源类型计算初始位置（分层布局）
        const layerMap: Record<string, number> = {
            ingress: 0,
            service: 1,
            deployment: 2,
            statefulset: 2,
            daemonset: 2,
            job: 2,
            cronjob: 2,
            configmap: 3,
            secret: 3,
            pvc: 3,
            hpa: 1,
        };

        const layer = layerMap[resourceType] ?? 2;
        const xOffset = layer * 280;
        const yOffset = index * 100;

        nodes.push({
            id: nodeId,
            type: 'resourceNode',
            position: { x: xOffset, y: yOffset },
            data: {
                label: resource.metadata.name,
                resourceType,
                resource,
                namespace: resource.metadata.namespace,
            },
        });

        resourceMap.set(nodeId, resource);
    });

    // 第二遍：分析关系并创建边
    resources.forEach(resource => {
        const sourceId = getNodeId(resource);

        // Service -> Workload (通过 selector)
        if (isService(resource)) {
            const service = resource as ServiceResource;
            const selector = service.spec.selector;

            if (selector && Object.keys(selector).length > 0) {
                resources.forEach(target => {
                    const targetLabels = getWorkloadLabels(target);
                    if (targetLabels && labelsMatch(selector, targetLabels)) {
                        const targetId = getNodeId(target);
                        edges.push({
                            id: `${sourceId}-${targetId}-selector`,
                            source: sourceId,
                            target: targetId,
                            type: 'smoothstep',
                            animated: true,
                            data: {
                                edgeType: 'selector' as EdgeType,
                                description: `Selector: ${JSON.stringify(selector)}`,
                            },
                        });
                    }
                });
            }
        }

        // Ingress -> Service (通过 backend)
        if (isIngress(resource)) {
            const ingress = resource as IngressResource;

            ingress.spec.rules?.forEach(rule => {
                rule.http?.paths?.forEach(path => {
                    const serviceName = path.backend.service.name;
                    const targetService = resources.find(
                        r => isService(r) && r.metadata.name === serviceName
                    );

                    if (targetService) {
                        const targetId = getNodeId(targetService);
                        edges.push({
                            id: `${sourceId}-${targetId}-ingress`,
                            source: sourceId,
                            target: targetId,
                            type: 'smoothstep',
                            animated: true,
                            data: {
                                edgeType: 'ingress-backend' as EdgeType,
                                description: `Path: ${path.path}`,
                            },
                        });
                    }
                });
            });
        }

        // HPA -> Workload (通过 scaleTargetRef)
        if (isHPA(resource)) {
            const hpa = resource as HPAResource;
            const targetRef = hpa.spec.scaleTargetRef;

            const targetWorkload = resources.find(r => {
                if (targetRef.kind === 'Deployment' && isDeployment(r)) {
                    return r.metadata.name === targetRef.name;
                }
                if (targetRef.kind === 'StatefulSet' && isStatefulSet(r)) {
                    return r.metadata.name === targetRef.name;
                }
                return false;
            });

            if (targetWorkload) {
                const targetId = getNodeId(targetWorkload);
                edges.push({
                    id: `${sourceId}-${targetId}-hpa`,
                    source: sourceId,
                    target: targetId,
                    type: 'smoothstep',
                    animated: true,
                    data: {
                        edgeType: 'hpa-target' as EdgeType,
                        description: `Target: ${targetRef.kind}/${targetRef.name}`,
                    },
                });
            }
        }

        // Workload -> ConfigMap/Secret/PVC
        const containers = getContainers(resource);
        const volumes = getVolumes(resource);

        if (containers.length > 0 || volumes.length > 0) {
            // ConfigMap 引用
            const configMapRefs = extractConfigMapRefs(containers, volumes);
            configMapRefs.forEach(cmName => {
                const targetCM = resources.find(
                    r => isConfigMap(r) && r.metadata.name === cmName
                );
                if (targetCM) {
                    const targetId = getNodeId(targetCM);
                    edges.push({
                        id: `${sourceId}-${targetId}-configmap`,
                        source: sourceId,
                        target: targetId,
                        type: 'smoothstep',
                        data: {
                            edgeType: 'configmap-ref' as EdgeType,
                            description: `ConfigMap: ${cmName}`,
                        },
                    });
                }
            });

            // Secret 引用
            const secretRefs = extractSecretRefs(containers, volumes);
            secretRefs.forEach(secretName => {
                const targetSecret = resources.find(
                    r => isSecret(r) && r.metadata.name === secretName
                );
                if (targetSecret) {
                    const targetId = getNodeId(targetSecret);
                    edges.push({
                        id: `${sourceId}-${targetId}-secret`,
                        source: sourceId,
                        target: targetId,
                        type: 'smoothstep',
                        data: {
                            edgeType: 'secret-ref' as EdgeType,
                            description: `Secret: ${secretName}`,
                        },
                    });
                }
            });

            // PVC 引用
            const pvcRefs = extractPVCRefs(volumes);
            pvcRefs.forEach(pvcName => {
                const targetPVC = resources.find(
                    r => isPVC(r) && r.metadata.name === pvcName
                );
                if (targetPVC) {
                    const targetId = getNodeId(targetPVC);
                    edges.push({
                        id: `${sourceId}-${targetId}-pvc`,
                        source: sourceId,
                        target: targetId,
                        type: 'smoothstep',
                        data: {
                            edgeType: 'pvc-ref' as EdgeType,
                            description: `PVC: ${pvcName}`,
                        },
                    });
                }
            });
        }
    });

    // 重新计算节点位置（简单分层布局）
    const layerGroups: Record<number, TopologyNode[]> = {};
    nodes.forEach(node => {
        const layerMap: Record<string, number> = {
            ingress: 0,
            service: 1,
            hpa: 1,
            deployment: 2,
            statefulset: 2,
            daemonset: 2,
            job: 2,
            cronjob: 2,
            configmap: 3,
            secret: 3,
            pvc: 3,
        };
        const layer = layerMap[node.data.resourceType] ?? 2;
        if (!layerGroups[layer]) {
            layerGroups[layer] = [];
        }
        layerGroups[layer].push(node);
    });

    // 根据层重新定位
    Object.keys(layerGroups).forEach(layerKey => {
        const layer = parseInt(layerKey);
        const nodesInLayer = layerGroups[layer];
        nodesInLayer.forEach((node, idx) => {
            node.position = {
                x: layer * 300 + 50,
                y: idx * 120 + 50,
            };
        });
    });

    return { nodes, edges };
}
