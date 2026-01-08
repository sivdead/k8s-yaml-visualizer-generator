import React, { useMemo } from 'react';
import { AlertCircle, AlertTriangle, CheckCircle, Shield } from 'lucide-react';
import { validateK8sResource, ValidationResult } from '../services/k8sValidator';
import { K8sResource } from '../types';
import { useLanguage } from '../contexts/LanguageContext';

interface ValidationPanelProps {
    resource: K8sResource;
    showDetails?: boolean;
}

/**
 * K8s 规范校验面板
 */
export const ValidationPanel: React.FC<ValidationPanelProps> = ({ resource, showDetails = true }) => {
    const { language } = useLanguage();

    const validation = useMemo(() => validateK8sResource(resource), [resource]);

    const { valid, errors, warnings } = validation;

    // 标题文本
    const titleText = language === 'zh' ? 'K8s 规范校验' : 'K8s Spec Validation';
    const validText = language === 'zh' ? '校验通过' : 'Validation Passed';
    const errorText = language === 'zh' ? '个错误' : ' error(s)';
    const warningText = language === 'zh' ? '个警告' : ' warning(s)';

    if (!showDetails) {
        // 简洁模式：只显示状态图标
        return (
            <div className="flex items-center gap-2">
                {valid ? (
                    errors.length === 0 && warnings.length === 0 ? (
                        <CheckCircle size={16} className="text-green-500" />
                    ) : (
                        <AlertTriangle size={16} className="text-amber-500" />
                    )
                ) : (
                    <AlertCircle size={16} className="text-red-500" />
                )}
                <span className="text-xs text-slate-500">
                    {valid
                        ? (warnings.length > 0 ? `${warnings.length}${warningText}` : validText)
                        : `${errors.length}${errorText}`
                    }
                </span>
            </div>
        );
    }

    return (
        <div className="border border-slate-200 dark:border-slate-700 rounded-lg overflow-hidden">
            {/* 头部 */}
            <div className={`px-3 py-2 flex items-center justify-between ${!valid
                    ? 'bg-red-50 dark:bg-red-900/30 border-b border-red-200 dark:border-red-800'
                    : warnings.length > 0
                        ? 'bg-amber-50 dark:bg-amber-900/30 border-b border-amber-200 dark:border-amber-800'
                        : 'bg-green-50 dark:bg-green-900/30 border-b border-green-200 dark:border-green-800'
                }`}>
                <div className="flex items-center gap-2">
                    <Shield size={16} className={
                        !valid ? 'text-red-500' : warnings.length > 0 ? 'text-amber-500' : 'text-green-500'
                    } />
                    <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                        {titleText}
                    </span>
                </div>
                <div className="flex items-center gap-3 text-xs">
                    {errors.length > 0 && (
                        <span className="flex items-center gap-1 text-red-600 dark:text-red-400">
                            <AlertCircle size={12} />
                            {errors.length}{errorText}
                        </span>
                    )}
                    {warnings.length > 0 && (
                        <span className="flex items-center gap-1 text-amber-600 dark:text-amber-400">
                            <AlertTriangle size={12} />
                            {warnings.length}{warningText}
                        </span>
                    )}
                    {errors.length === 0 && warnings.length === 0 && (
                        <span className="flex items-center gap-1 text-green-600 dark:text-green-400">
                            <CheckCircle size={12} />
                            {validText}
                        </span>
                    )}
                </div>
            </div>

            {/* 详情列表 */}
            {(errors.length > 0 || warnings.length > 0) && (
                <div className="max-h-48 overflow-y-auto">
                    {errors.map((err, idx) => (
                        <div
                            key={`error-${idx}`}
                            className="px-3 py-2 border-b border-slate-100 dark:border-slate-700 last:border-b-0 bg-white dark:bg-slate-800"
                        >
                            <div className="flex items-start gap-2">
                                <AlertCircle size={14} className="text-red-500 mt-0.5 flex-shrink-0" />
                                <div className="flex-1 min-w-0">
                                    <code className="text-xs text-slate-500 dark:text-slate-400 block truncate">
                                        {err.path}
                                    </code>
                                    <p className="text-sm text-slate-700 dark:text-slate-300">
                                        {err.message}
                                    </p>
                                </div>
                            </div>
                        </div>
                    ))}
                    {warnings.map((warn, idx) => (
                        <div
                            key={`warning-${idx}`}
                            className="px-3 py-2 border-b border-slate-100 dark:border-slate-700 last:border-b-0 bg-white dark:bg-slate-800"
                        >
                            <div className="flex items-start gap-2">
                                <AlertTriangle size={14} className="text-amber-500 mt-0.5 flex-shrink-0" />
                                <div className="flex-1 min-w-0">
                                    <code className="text-xs text-slate-500 dark:text-slate-400 block truncate">
                                        {warn.path}
                                    </code>
                                    <p className="text-sm text-slate-700 dark:text-slate-300">
                                        {warn.message}
                                    </p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};
