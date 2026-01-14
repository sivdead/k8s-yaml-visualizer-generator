import { Node, Edge } from '@xyflow/react';
import { K8sResource, ResourceType } from '../../types';

/**
 * 资源节点数据
 */
export interface ResourceNodeData extends Record<string, unknown> {
    /** 显示的标签（资源名称） */
    label: string;
    /** 资源类型 */
    resourceType: ResourceType;
    /** 完整的资源对象 */
    resource: K8sResource;
    /** 是否被选中 */
    isSelected?: boolean;
    /** 资源的 namespace */
    namespace: string;
}

/**
 * 边的类型，用于区分不同的连接关系
 */
export type EdgeType =
    | 'selector'        // Service -> Workload (通过 selector)
    | 'ingress-backend' // Ingress -> Service (通过 backend)
    | 'configmap-ref'   // Workload -> ConfigMap (通过 env 或 volume)
    | 'secret-ref'      // Workload -> Secret (通过 env 或 volume)
    | 'pvc-ref'         // Workload -> PVC (通过 volume)
    | 'hpa-target';     // HPA -> Workload (通过 scaleTargetRef)

/**
 * 拓扑节点
 */
export type TopologyNode = Node<ResourceNodeData>;

/**
 * 拓扑边的额外数据
 */
export interface TopologyEdgeData extends Record<string, unknown> {
    /** 边的类型 */
    edgeType: EdgeType;
    /** 连接描述 */
    description?: string;
}

/**
 * 拓扑边
 */
export type TopologyEdge = Edge<TopologyEdgeData>;

/**
 * 资源类型对应的颜色配置
 */
export const RESOURCE_COLORS: Record<ResourceType, { bg: string; border: string; text: string }> = {
    deployment: { bg: '#dbeafe', border: '#3b82f6', text: '#1e40af' },
    statefulset: { bg: '#fce7f3', border: '#ec4899', text: '#9d174d' },
    daemonset: { bg: '#fef3c7', border: '#f59e0b', text: '#92400e' },
    job: { bg: '#d1fae5', border: '#10b981', text: '#065f46' },
    cronjob: { bg: '#e0e7ff', border: '#6366f1', text: '#3730a3' },
    service: { bg: '#ccfbf1', border: '#14b8a6', text: '#0f766e' },
    ingress: { bg: '#fce7f3', border: '#f472b6', text: '#be185d' },
    configmap: { bg: '#f3e8ff', border: '#a855f7', text: '#7c3aed' },
    secret: { bg: '#fee2e2', border: '#ef4444', text: '#b91c1c' },
    pvc: { bg: '#fed7aa', border: '#fb923c', text: '#c2410c' },
    hpa: { bg: '#cffafe', border: '#06b6d4', text: '#0e7490' },
};

/**
 * 边类型对应的颜色
 */
export const EDGE_COLORS: Record<EdgeType, string> = {
    'selector': '#3b82f6',
    'ingress-backend': '#f472b6',
    'configmap-ref': '#a855f7',
    'secret-ref': '#ef4444',
    'pvc-ref': '#fb923c',
    'hpa-target': '#06b6d4',
};
