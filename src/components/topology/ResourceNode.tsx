import React, { memo } from 'react';
import { Handle, Position, type NodeProps, type Node } from '@xyflow/react';
import {
    Layers,
    Box,
    Globe,
    FileText,
    HardDrive,
    Key,
    Clock,
    Play,
    Server,
    Database,
    TrendingUp,
} from 'lucide-react';
import { ResourceNodeData, RESOURCE_COLORS } from './topologyTypes';
import { ResourceType } from '../../types';
import { useTheme } from '../../contexts/AppContext';

/**
 * 获取资源类型对应的图标
 */
const getResourceIcon = (type: ResourceType) => {
    const iconMap: Record<ResourceType, React.ComponentType<{ size?: number; className?: string }>> = {
        deployment: Layers,
        statefulset: Database,
        daemonset: Server,
        job: Play,
        cronjob: Clock,
        service: Box,
        ingress: Globe,
        configmap: FileText,
        secret: Key,
        pvc: HardDrive,
        hpa: TrendingUp,
    };
    return iconMap[type] || Layers;
};

/**
 * 获取资源类型的显示名称
 */
const getResourceDisplayName = (type: ResourceType): string => {
    const nameMap: Record<ResourceType, string> = {
        deployment: 'Deployment',
        statefulset: 'StatefulSet',
        daemonset: 'DaemonSet',
        job: 'Job',
        cronjob: 'CronJob',
        service: 'Service',
        ingress: 'Ingress',
        configmap: 'ConfigMap',
        secret: 'Secret',
        pvc: 'PVC',
        hpa: 'HPA',
    };
    return nameMap[type] || type;
};

/**
 * 自定义资源节点组件
 */
const ResourceNodeComponent: React.FC<NodeProps<Node<ResourceNodeData>>> = ({ data, selected }) => {
    const { isDark } = useTheme();
    const { label, resourceType, namespace } = data;
    const colors = RESOURCE_COLORS[resourceType];
    const Icon = getResourceIcon(resourceType);

    return (
        <div
            className={`
        px-4 py-3 rounded-xl shadow-lg border-2 min-w-[160px] max-w-[220px]
        transition-all duration-200 cursor-pointer
        ${selected ? 'ring-2 ring-offset-2 ring-blue-500 scale-105' : 'hover:scale-102'}
      `}
            style={{
                backgroundColor: isDark ? '#1e293b' : colors.bg,
                borderColor: selected ? '#3b82f6' : colors.border,
            }}
        >
            {/* 输入 Handle */}
            <Handle
                type="target"
                position={Position.Left}
                className="!w-3 !h-3 !border-2"
                style={{
                    backgroundColor: isDark ? '#334155' : '#fff',
                    borderColor: colors.border,
                }}
            />

            {/* 节点内容 */}
            <div className="flex items-center gap-3">
                {/* 图标 */}
                <div
                    className="p-2 rounded-lg"
                    style={{
                        backgroundColor: colors.border,
                    }}
                >
                    <Icon size={18} className="text-white" />
                </div>

                {/* 文本信息 */}
                <div className="flex-1 overflow-hidden">
                    <div
                        className="text-xs font-medium uppercase tracking-wide opacity-70"
                        style={{ color: isDark ? '#94a3b8' : colors.text }}
                    >
                        {getResourceDisplayName(resourceType)}
                    </div>
                    <div
                        className="text-sm font-bold truncate"
                        style={{ color: isDark ? '#f1f5f9' : colors.text }}
                        title={label}
                    >
                        {label}
                    </div>
                    <div
                        className="text-xs opacity-50 truncate"
                        style={{ color: isDark ? '#64748b' : colors.text }}
                    >
                        {namespace}
                    </div>
                </div>
            </div>

            {/* 输出 Handle */}
            <Handle
                type="source"
                position={Position.Right}
                className="!w-3 !h-3 !border-2"
                style={{
                    backgroundColor: isDark ? '#334155' : '#fff',
                    borderColor: colors.border,
                }}
            />
        </div>
    );
};

export const ResourceNode = memo(ResourceNodeComponent);
