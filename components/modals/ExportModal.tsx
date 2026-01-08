import React, { useState } from 'react';
import { K8sResource, ResourceType } from '../../types';
import { toYaml, downloadYaml } from '../../services/yamlUtils';
import { X, Download, Check, Copy, FileDown } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';

interface SavedConfig {
    id: string;
    name: string;
    type: ResourceType;
    data: K8sResource;
    timestamp: number;
}

interface ExportModalProps {
    isOpen: boolean;
    onClose: () => void;
    savedConfigs: SavedConfig[];
    currentConfig: K8sResource;
    currentType: ResourceType;
}

/**
 * 多资源组合导出模态框
 */
export const ExportModal: React.FC<ExportModalProps> = ({
    isOpen,
    onClose,
    savedConfigs,
    currentConfig,
    currentType,
}) => {
    const { t } = useLanguage();
    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set(['current']));
    const [copied, setCopied] = useState(false);

    if (!isOpen) return null;

    const toggleSelection = (id: string) => {
        const newSelection = new Set(selectedIds);
        if (newSelection.has(id)) {
            newSelection.delete(id);
        } else {
            newSelection.add(id);
        }
        setSelectedIds(newSelection);
    };

    const generateCombinedYaml = (): string => {
        const yamls: string[] = [];

        // Current config
        if (selectedIds.has('current')) {
            yamls.push(toYaml(currentConfig));
        }

        // Saved configs
        savedConfigs.forEach((config) => {
            if (selectedIds.has(config.id)) {
                yamls.push(toYaml(config.data));
            }
        });

        return yamls.join('\n---\n');
    };

    const handleCopy = () => {
        navigator.clipboard.writeText(generateCombinedYaml());
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handleDownload = () => {
        const combinedYaml = generateCombinedYaml();
        const count = selectedIds.size;
        const filename = count === 1
            ? `${currentConfig.metadata.name}.yaml`
            : `k8s-resources-${count}.yaml`;
        downloadYaml(filename, combinedYaml);
    };

    const getTypeLabel = (type: ResourceType): string => {
        const labels: Record<ResourceType, string> = {
            deployment: 'DEP',
            service: 'SVC',
            configmap: 'CM',
            ingress: 'ING',
            pvc: 'PVC',
            secret: 'SEC',
            cronjob: 'CJ',
        };
        return labels[type];
    };

    return (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[80vh]">
                {/* Header */}
                <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-800 text-white">
                    <div className="flex items-center gap-2">
                        <FileDown size={18} />
                        <h2 className="font-semibold">导出资源</h2>
                    </div>
                    <button onClick={onClose} className="hover:bg-white/20 p-1 rounded transition-colors">
                        <X size={20} />
                    </button>
                </div>

                {/* Content */}
                <div className="p-4 flex-1 overflow-y-auto">
                    <p className="text-sm text-slate-600 mb-4">
                        选择要导出的资源，多个资源将合并为单个 YAML 文件（使用 <code className="bg-slate-100 px-1 rounded">---</code> 分隔）
                    </p>

                    {/* Selection List */}
                    <div className="space-y-2">
                        {/* Current Config */}
                        <label
                            className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${selectedIds.has('current')
                                    ? 'bg-blue-50 border-blue-200'
                                    : 'bg-slate-50 border-slate-200 hover:bg-slate-100'
                                }`}
                        >
                            <input
                                type="checkbox"
                                checked={selectedIds.has('current')}
                                onChange={() => toggleSelection('current')}
                                className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                            />
                            <span className="text-xs font-bold px-1.5 py-0.5 rounded bg-green-100 text-green-700">
                                {getTypeLabel(currentType)}
                            </span>
                            <span className="flex-1 font-medium text-slate-800">
                                {currentConfig.metadata.name}
                            </span>
                            <span className="text-xs text-slate-400">当前编辑</span>
                        </label>

                        {/* Saved Configs */}
                        {savedConfigs.map((config) => (
                            <label
                                key={config.id}
                                className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${selectedIds.has(config.id)
                                        ? 'bg-blue-50 border-blue-200'
                                        : 'bg-slate-50 border-slate-200 hover:bg-slate-100'
                                    }`}
                            >
                                <input
                                    type="checkbox"
                                    checked={selectedIds.has(config.id)}
                                    onChange={() => toggleSelection(config.id)}
                                    className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                                />
                                <span className="text-xs font-bold px-1.5 py-0.5 rounded bg-blue-100 text-blue-700">
                                    {getTypeLabel(config.type)}
                                </span>
                                <span className="flex-1 font-medium text-slate-800">{config.name}</span>
                                <span className="text-xs text-slate-400">
                                    {new Date(config.timestamp).toLocaleDateString()}
                                </span>
                            </label>
                        ))}

                        {savedConfigs.length === 0 && (
                            <div className="text-center py-4 text-sm text-slate-400">
                                暂无已保存的配置
                            </div>
                        )}
                    </div>
                </div>

                {/* Footer */}
                <div className="p-4 border-t border-slate-100 bg-slate-50 flex items-center justify-between">
                    <span className="text-sm text-slate-500">
                        已选择 <strong className="text-slate-800">{selectedIds.size}</strong> 个资源
                    </span>
                    <div className="flex gap-2">
                        <button
                            onClick={handleCopy}
                            disabled={selectedIds.size === 0}
                            className="flex items-center gap-2 px-3 py-2 text-slate-600 hover:bg-slate-200 rounded-md text-sm font-medium transition-colors border border-slate-200 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {copied ? <Check size={16} className="text-green-600" /> : <Copy size={16} />}
                            {copied ? '已复制' : '复制'}
                        </button>
                        <button
                            onClick={handleDownload}
                            disabled={selectedIds.size === 0}
                            className="flex items-center gap-2 px-4 py-2 bg-slate-800 text-white rounded-md text-sm font-medium hover:bg-slate-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <Download size={16} />
                            下载 YAML
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};
