import React, { useMemo } from 'react';
import { AlertCircle, AlertTriangle, CheckCircle, Shield, Lightbulb, Info } from 'lucide-react';
import { validateK8sResource, ValidationResult, ValidationError } from '../services/k8sValidator';
import { K8sResource } from '../types';
import { useLanguage } from '../contexts/LanguageContext';

interface ValidationPanelProps {
    resource: K8sResource;
    showDetails?: boolean;
}

const getLocalizedMessage = (
    error: ValidationError,
    validationT: Record<string, string>
): string => {
    if (error.messageKey && validationT[error.messageKey]) {
        let message = validationT[error.messageKey];
        if (error.messageParams) {
            Object.entries(error.messageParams).forEach(([key, value]) => {
                message = message.replace(`{${key}}`, value);
            });
        }
        return message;
    }
    return error.message;
};

const getCategoryLabel = (category?: string, language?: string): string => {
    if (language === 'zh') {
        switch (category) {
            case 'production-tip': return '生产建议';
            case 'recommendation': return '优化建议';
            default: return '建议';
        }
    }
    switch (category) {
        case 'production-tip': return 'Production tip';
        case 'recommendation': return 'Recommendation';
        default: return 'Suggestion';
    }
};

const getCategoryIcon = (category?: string) => {
    switch (category) {
        case 'production-tip': return <Lightbulb size={14} className="text-blue-500 mt-0.5 flex-shrink-0" />;
        case 'recommendation': return <Info size={14} className="text-sky-500 mt-0.5 flex-shrink-0" />;
        default: return <AlertTriangle size={14} className="text-amber-500 mt-0.5 flex-shrink-0" />;
    }
};

export const ValidationPanel: React.FC<ValidationPanelProps> = ({ resource, showDetails = true }) => {
    const { t, language } = useLanguage();
    const validationT = (t as any).validation || {};

    const validation = useMemo(() => validateK8sResource(resource), [resource]);

    const { valid, errors, warnings } = validation;

    const titleText = validationT.title || 'K8s Spec Validation';
    const validText = validationT.passed || 'Validation Passed';
    const errorText = validationT.errors || 'error(s)';
    const tipsText = language === 'zh' ? '条建议' : 'tip(s)';

    if (!showDetails) {
        return (
            <div className="flex items-center gap-2">
                {valid ? (
                    errors.length === 0 && warnings.length === 0 ? (
                        <CheckCircle size={16} className="text-green-500" />
                    ) : (
                        <Lightbulb size={16} className="text-blue-500" />
                    )
                ) : (
                    <AlertCircle size={16} className="text-red-500" />
                )}
                <span className="text-xs text-slate-500">
                    {valid
                        ? (warnings.length > 0 ? `${warnings.length} ${tipsText}` : validText)
                        : `${errors.length} ${errorText}`
                    }
                </span>
            </div>
        );
    }

    return (
        <div className="border border-slate-200 dark:border-slate-700 rounded-lg overflow-hidden bg-white dark:bg-slate-800">
            <div className={`px-3 py-2 flex items-center justify-between ${!valid
                ? 'bg-red-50 dark:bg-red-900/30 border-b border-red-200 dark:border-red-800'
                : warnings.length > 0
                    ? 'bg-blue-50 dark:bg-blue-900/30 border-b border-blue-200 dark:border-blue-800'
                    : 'bg-green-50 dark:bg-green-900/30 border-b border-green-200 dark:border-green-800'
                }`}>
                <div className="flex items-center gap-2">
                    <Shield size={16} className={
                        !valid ? 'text-red-500' : warnings.length > 0 ? 'text-blue-500' : 'text-green-500'
                    } />
                    <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                        {titleText}
                    </span>
                </div>
                <div className="flex items-center gap-3 text-xs">
                    {errors.length > 0 && (
                        <span className="flex items-center gap-1 text-red-600 dark:text-red-400">
                            <AlertCircle size={12} />
                            {errors.length} {errorText}
                        </span>
                    )}
                    {warnings.length > 0 && (
                        <span className="flex items-center gap-1 text-blue-600 dark:text-blue-400">
                            <Lightbulb size={12} />
                            {warnings.length} {tipsText}
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
                                    <div className="flex items-center gap-2">
                                        <span className="text-[10px] font-semibold uppercase tracking-wider text-red-600 dark:text-red-400">
                                            Error
                                        </span>
                                        <code className="text-xs text-slate-500 dark:text-slate-400 truncate">
                                            {err.path}
                                        </code>
                                    </div>
                                    <p className="text-sm text-slate-700 dark:text-slate-300">
                                        {getLocalizedMessage(err, validationT)}
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
                                {getCategoryIcon(warn.category)}
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2">
                                        <span className={`text-[10px] font-semibold uppercase tracking-wider ${
                                            warn.category === 'production-tip' ? 'text-blue-600 dark:text-blue-400' : 'text-sky-600 dark:text-sky-400'
                                        }`}>
                                            {getCategoryLabel(warn.category, language)}
                                        </span>
                                        <code className="text-xs text-slate-500 dark:text-slate-400 truncate">
                                            {warn.path}
                                        </code>
                                    </div>
                                    <p className="text-sm text-slate-700 dark:text-slate-300">
                                        {getLocalizedMessage(warn, validationT)}
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
