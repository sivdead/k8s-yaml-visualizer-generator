import React, { useState, useEffect, useRef } from 'react';
import { Input, Label, SectionTitle } from '../../FormComponents';
import { Tag, Trash2, Plus, FileText } from 'lucide-react';
import { useLanguage } from '../../../contexts/LanguageContext';

interface LabelsAnnotationsProps {
    labels?: Record<string, string>;
    annotations?: Record<string, string>;
    onLabelsChange: (labels: Record<string, string>) => void;
    onAnnotationsChange: (annotations: Record<string, string>) => void;
    /** 不可编辑的系统 labels（如 app: xxx），显示但不可删除 */
    systemLabels?: Record<string, string>;
}

interface KeyValueItem {
    key: string;
    value: string;
}

/**
 * Labels 和 Annotations 编辑组件
 */
export const LabelsAnnotationsSection: React.FC<LabelsAnnotationsProps> = ({
    labels = {},
    annotations = {},
    onLabelsChange,
    onAnnotationsChange,
    systemLabels = {},
}) => {
    const { t, language } = useLanguage();

    // 将 Record 转换为可编辑的数组（过滤掉系统 labels）
    const [labelItems, setLabelItems] = useState<KeyValueItem[]>(() => {
        return Object.entries(labels)
            .filter(([key]) => !Object.keys(systemLabels).includes(key))
            .map(([key, value]) => ({ key, value }));
    });

    const [annotItems, setAnnotItems] = useState<KeyValueItem[]>(() => {
        return Object.entries(annotations || {}).map(([key, value]) => ({ key, value }));
    });

    // 保存上一次的 props 值，用于检测是否是真正的外部更新
    const prevLabelsRef = useRef<string>(JSON.stringify(labels));
    const prevAnnotationsRef = useRef<string>(JSON.stringify(annotations || {}));

    // 同步 labels 从 props（只在外部真正变化时）
    useEffect(() => {
        const currentLabelsStr = JSON.stringify(labels);
        if (currentLabelsStr !== prevLabelsRef.current) {
            prevLabelsRef.current = currentLabelsStr;
            const userLabels = Object.entries(labels)
                .filter(([key]) => !Object.keys(systemLabels).includes(key))
                .map(([key, value]) => ({ key, value }));
            setLabelItems(userLabels);
        }
    }, [labels, systemLabels]);

    // 同步 annotations 从 props（只在外部真正变化时）
    useEffect(() => {
        const currentAnnotationsStr = JSON.stringify(annotations || {});
        if (currentAnnotationsStr !== prevAnnotationsRef.current) {
            prevAnnotationsRef.current = currentAnnotationsStr;
            const items = Object.entries(annotations || {}).map(([key, value]) => ({ key, value }));
            setAnnotItems(items);
        }
    }, [annotations]);

    // 同步 labels 到父组件
    const syncLabels = (items: KeyValueItem[]) => {
        const newLabels: Record<string, string> = { ...systemLabels };
        items.forEach(item => {
            if (item.key.trim()) {
                newLabels[item.key] = item.value;
            }
        });
        // 更新 prevRef 以防止 useEffect 重置状态
        prevLabelsRef.current = JSON.stringify(newLabels);
        onLabelsChange(newLabels);
    };

    // 同步 annotations 到父组件
    const syncAnnotations = (items: KeyValueItem[]) => {
        const newAnnotations: Record<string, string> = {};
        items.forEach(item => {
            if (item.key.trim()) {
                newAnnotations[item.key] = item.value;
            }
        });
        const result = Object.keys(newAnnotations).length > 0 ? newAnnotations : {};
        // 更新 prevRef 以防止 useEffect 重置状态
        prevAnnotationsRef.current = JSON.stringify(result);
        onAnnotationsChange(result);
    };

    // Labels 操作
    const addLabel = () => {
        const newItems = [...labelItems, { key: '', value: '' }];
        setLabelItems(newItems);
    };

    const updateLabel = (idx: number, field: 'key' | 'value', val: string) => {
        const newItems = [...labelItems];
        newItems[idx] = { ...newItems[idx], [field]: val };
        setLabelItems(newItems);
        syncLabels(newItems);
    };

    const removeLabel = (idx: number) => {
        const newItems = labelItems.filter((_, i) => i !== idx);
        setLabelItems(newItems);
        syncLabels(newItems);
    };

    // Annotations 操作
    const addAnnotation = () => {
        const newItems = [...annotItems, { key: '', value: '' }];
        setAnnotItems(newItems);
    };

    const updateAnnotation = (idx: number, field: 'key' | 'value', val: string) => {
        const newItems = [...annotItems];
        newItems[idx] = { ...newItems[idx], [field]: val };
        setAnnotItems(newItems);
        syncAnnotations(newItems);
    };

    const removeAnnotation = (idx: number) => {
        const newItems = annotItems.filter((_, i) => i !== idx);
        setAnnotItems(newItems);
        syncAnnotations(newItems);
    };

    return (
        <div className="space-y-4">
            {/* Labels Section */}
            <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-200 dark:border-purple-800">
                <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                        <Tag size={16} className="text-purple-600 dark:text-purple-400" />
                        <h4 className="font-semibold text-slate-800 dark:text-slate-200">
                            {language === 'zh' ? '标签 (Labels)' : 'Labels'}
                        </h4>
                    </div>
                    <button
                        type="button"
                        onClick={addLabel}
                        className="flex items-center gap-1 text-xs px-2 py-1 bg-purple-100 text-purple-700 hover:bg-purple-200 dark:bg-purple-800/30 dark:text-purple-300 rounded border border-purple-300 dark:border-purple-700"
                    >
                        <Plus size={12} />
                        {language === 'zh' ? '添加' : 'Add'}
                    </button>
                </div>

                {/* System Labels (read-only) */}
                {Object.keys(systemLabels).length > 0 && (
                    <div className="mb-2">
                        <div className="text-xs text-slate-500 dark:text-slate-400 mb-1">
                            {language === 'zh' ? '系统标签 (自动同步)' : 'System Labels (auto-synced)'}
                        </div>
                        <div className="flex flex-wrap gap-1">
                            {Object.entries(systemLabels).map(([key, value]) => (
                                <span
                                    key={key}
                                    className="inline-flex items-center gap-1 px-2 py-0.5 bg-purple-100 dark:bg-purple-900/50 text-purple-700 dark:text-purple-300 rounded text-xs font-mono"
                                >
                                    {key}: {value}
                                </span>
                            ))}
                        </div>
                    </div>
                )}

                {/* User Labels */}
                <div className="space-y-2">
                    {labelItems.map((item, idx) => (
                        <div key={idx} className="flex items-center gap-2">
                            <Input
                                placeholder="Key"
                                value={item.key}
                                onChange={(e) => updateLabel(idx, 'key', e.target.value)}
                                className="flex-1 text-sm"
                            />
                            <span className="text-slate-400">:</span>
                            <Input
                                placeholder="Value"
                                value={item.value}
                                onChange={(e) => updateLabel(idx, 'value', e.target.value)}
                                className="flex-1 text-sm"
                            />
                            <button
                                type="button"
                                onClick={() => removeLabel(idx)}
                                className="p-1.5 text-slate-400 hover:text-red-500 transition-colors"
                            >
                                <Trash2 size={14} />
                            </button>
                        </div>
                    ))}
                    {labelItems.length === 0 && Object.keys(systemLabels).length === 0 && (
                        <p className="text-xs text-slate-400 italic">
                            {language === 'zh' ? '暂无自定义标签' : 'No custom labels'}
                        </p>
                    )}
                </div>
            </div>

            {/* Annotations Section */}
            <div className="p-4 bg-teal-50 dark:bg-teal-900/20 rounded-lg border border-teal-200 dark:border-teal-800">
                <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                        <FileText size={16} className="text-teal-600 dark:text-teal-400" />
                        <h4 className="font-semibold text-slate-800 dark:text-slate-200">
                            {language === 'zh' ? '注解 (Annotations)' : 'Annotations'}
                        </h4>
                    </div>
                    <button
                        type="button"
                        onClick={addAnnotation}
                        className="flex items-center gap-1 text-xs px-2 py-1 bg-teal-100 text-teal-700 hover:bg-teal-200 dark:bg-teal-800/30 dark:text-teal-300 rounded border border-teal-300 dark:border-teal-700"
                    >
                        <Plus size={12} />
                        {language === 'zh' ? '添加' : 'Add'}
                    </button>
                </div>

                <div className="space-y-2">
                    {annotItems.map((item, idx) => (
                        <div key={idx} className="flex items-center gap-2">
                            <Input
                                placeholder="kubernetes.io/name"
                                value={item.key}
                                onChange={(e) => updateAnnotation(idx, 'key', e.target.value)}
                                className="flex-1 text-sm"
                            />
                            <span className="text-slate-400">:</span>
                            <Input
                                placeholder="Value"
                                value={item.value}
                                onChange={(e) => updateAnnotation(idx, 'value', e.target.value)}
                                className="flex-1 text-sm"
                            />
                            <button
                                type="button"
                                onClick={() => removeAnnotation(idx)}
                                className="p-1.5 text-slate-400 hover:text-red-500 transition-colors"
                            >
                                <Trash2 size={14} />
                            </button>
                        </div>
                    ))}
                    {annotItems.length === 0 && (
                        <p className="text-xs text-slate-400 italic">
                            {language === 'zh' ? '暂无注解' : 'No annotations'}
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
};
