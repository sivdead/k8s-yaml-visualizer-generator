import React, { useCallback, useMemo } from 'react';
import {
    ReactFlow,
    Controls,
    Background,
    BackgroundVariant,
    MiniMap,
    useNodesState,
    useEdgesState,
    NodeMouseHandler,
    ConnectionLineType,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';

import { K8sResource, ResourceType } from '../../types';
import { ResourceNode } from './ResourceNode';
import { analyzeRelationships } from './relationshipAnalyzer';
import { RESOURCE_COLORS, EDGE_COLORS, TopologyEdge, ResourceNodeData } from './topologyTypes';
import { useTheme } from '../../contexts/AppContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { Network, AlertCircle } from 'lucide-react';

// 自定义节点类型
const nodeTypes = {
    resourceNode: ResourceNode,
};

interface TopologyViewProps {
    /** 所有已保存的资源 */
    resources: K8sResource[];
    /** 点击节点时的回调 */
    onNodeClick?: (resource: K8sResource, type: ResourceType) => void;
}

/**
 * 拓扑视图组件
 */
export const TopologyView: React.FC<TopologyViewProps> = ({
    resources,
    onNodeClick,
}) => {
    const { isDark } = useTheme();
    const { language } = useLanguage();

    // 分析资源关系
    const { initialNodes, initialEdges } = useMemo(() => {
        const { nodes, edges } = analyzeRelationships(resources);
        return { initialNodes: nodes, initialEdges: edges };
    }, [resources]);

    const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
    const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

    // 当资源变化时更新节点和边
    React.useEffect(() => {
        const { nodes: newNodes, edges: newEdges } = analyzeRelationships(resources);
        setNodes(newNodes);
        setEdges(newEdges);
    }, [resources, setNodes, setEdges]);

    // 处理节点点击
    const handleNodeClick: NodeMouseHandler = useCallback((event, node) => {
        if (onNodeClick && node.data) {
            const data = node.data as ResourceNodeData;
            onNodeClick(data.resource, data.resourceType);
        }
    }, [onNodeClick]);

    // 自定义边样式
    const styledEdges = useMemo(() => {
        return edges.map((edge) => {
            const typedEdge = edge as TopologyEdge;
            const edgeType = typedEdge.data?.edgeType;
            const color = edgeType ? EDGE_COLORS[edgeType] : '#64748b';

            return {
                ...edge,
                style: {
                    stroke: color,
                    strokeWidth: 2,
                },
                labelStyle: {
                    fill: color,
                    fontSize: 10,
                },
            };
        });
    }, [edges]);

    // MiniMap 节点颜色
    const nodeColor = useCallback((node: any) => {
        const type = node.data?.resourceType as ResourceType;
        return type ? RESOURCE_COLORS[type].border : '#64748b';
    }, []);

    // 空状态
    if (resources.length === 0) {
        return (
            <div
                className={`flex-1 flex flex-col items-center justify-center gap-4 p-8
          ${isDark ? 'bg-slate-900 text-slate-400' : 'bg-slate-50 text-slate-500'}`}
            >
                <div className={`p-4 rounded-full ${isDark ? 'bg-slate-800' : 'bg-slate-100'}`}>
                    <AlertCircle size={48} className="opacity-50" />
                </div>
                <div className="text-center">
                    <h3 className="text-lg font-semibold mb-2">
                        {language === 'zh' ? '暂无资源' : 'No Resources'}
                    </h3>
                    <p className="text-sm opacity-75 max-w-md">
                        {language === 'zh'
                            ? '保存一些 K8s 资源配置后，它们将显示在此拓扑视图中，并自动分析资源间的依赖关系。'
                            : 'Save some K8s resource configurations and they will appear in this topology view with their relationships automatically analyzed.'
                        }
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className={`flex-1 ${isDark ? 'bg-slate-900' : 'bg-slate-50'}`}>
            <ReactFlow
                nodes={nodes}
                edges={styledEdges}
                onNodesChange={onNodesChange}
                onEdgesChange={onEdgesChange}
                onNodeClick={handleNodeClick}
                nodeTypes={nodeTypes}
                connectionLineType={ConnectionLineType.SmoothStep}
                fitView
                fitViewOptions={{
                    padding: 0.2,
                    includeHiddenNodes: false,
                }}
                minZoom={0.3}
                maxZoom={2}
                attributionPosition="bottom-left"
            >
                <Controls
                    className={isDark ? 'react-flow__controls-dark' : ''}
                    style={{
                        backgroundColor: isDark ? '#1e293b' : '#fff',
                        borderColor: isDark ? '#334155' : '#e2e8f0',
                    }}
                />
                <MiniMap
                    nodeColor={nodeColor}
                    maskColor={isDark ? 'rgba(15, 23, 42, 0.8)' : 'rgba(241, 245, 249, 0.8)'}
                    style={{
                        backgroundColor: isDark ? '#0f172a' : '#f8fafc',
                        border: isDark ? '1px solid #334155' : '1px solid #e2e8f0',
                    }}
                />
                <Background
                    variant={BackgroundVariant.Dots}
                    gap={20}
                    size={1}
                    color={isDark ? '#334155' : '#cbd5e1'}
                />
            </ReactFlow>

            {/* 图例 */}
            <div
                className={`absolute bottom-4 right-4 p-3 rounded-lg shadow-lg border text-xs
          ${isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'}`}
            >
                <div className={`font-semibold mb-2 flex items-center gap-2 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                    <Network size={14} />
                    {language === 'zh' ? '连接类型' : 'Edge Types'}
                </div>
                <div className="space-y-1.5">
                    {Object.entries(EDGE_COLORS).map(([type, color]) => (
                        <div key={type} className="flex items-center gap-2">
                            <div
                                className="w-4 h-0.5 rounded"
                                style={{ backgroundColor: color }}
                            />
                            <span className={isDark ? 'text-slate-400' : 'text-slate-600'}>
                                {type.replace(/-/g, ' ')}
                            </span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default TopologyView;
