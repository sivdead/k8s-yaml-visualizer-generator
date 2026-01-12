import React from 'react';
import { HPAResource } from '../../types';
import { TrendingUp, Target } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';
import { CommentSection } from './shared/CommentSection';

interface Props {
    data: HPAResource;
    onChange: (data: HPAResource) => void;
}

export const HPAForm: React.FC<Props> = ({ data, onChange }) => {
    const { t } = useLanguage();

    const handleMetadataChange = (field: string, value: string) => {
        onChange({
            ...data,
            metadata: { ...data.metadata, [field]: value }
        });
    };

    const handleScaleTargetChange = (field: string, value: string) => {
        onChange({
            ...data,
            spec: {
                ...data.spec,
                scaleTargetRef: {
                    ...data.spec.scaleTargetRef,
                    [field]: value
                }
            }
        });
    };

    const handleSpecChange = (field: string, value: any) => {
        onChange({
            ...data,
            spec: { ...data.spec, [field]: value }
        });
    };

    return (
        <div className="space-y-6">
            <CommentSection
                value={data._comment}
                onChange={(comment) => onChange({ ...data, _comment: comment })}
            />

            {/* Metadata */}
            <div className="space-y-4">
                <h3 className="text-lg font-medium text-slate-800 dark:text-slate-200 flex items-center gap-2">
                    <TrendingUp size={20} className="text-blue-500 dark:text-blue-400" />
                    {t.common.metadata}
                </h3>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">{t.common.name}</label>
                        <input
                            type="text"
                            value={data.metadata.name}
                            onChange={(e) => handleMetadataChange('name', e.target.value)}
                            className="w-full rounded-md border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">{t.common.namespace}</label>
                        <input
                            type="text"
                            value={data.metadata.namespace}
                            onChange={(e) => handleMetadataChange('namespace', e.target.value)}
                            className="w-full rounded-md border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                        />
                    </div>
                </div>
            </div>

            {/* Scale Target */}
            <div className="space-y-4">
                <h3 className="text-lg font-medium text-slate-800 dark:text-slate-200 flex items-center gap-2">
                    <Target size={20} className="text-purple-500 dark:text-purple-400" />
                    {t.hpa.scaleTarget}
                </h3>

                <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-lg border border-slate-200 dark:border-slate-700 space-y-4">
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                        {t.hpa.scaleTargetHint}
                    </p>

                    <div className="grid grid-cols-3 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">{t.hpa.kind}</label>
                            <select
                                value={data.spec.scaleTargetRef.kind}
                                onChange={(e) => handleScaleTargetChange('kind', e.target.value)}
                                className="w-full rounded-md border border-slate-300 dark:border-slate-600 px-3 py-2 text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:outline-none bg-white dark:bg-slate-700"
                            >
                                <option value="Deployment">Deployment</option>
                                <option value="StatefulSet">StatefulSet</option>
                                <option value="ReplicaSet">ReplicaSet</option>
                            </select>
                        </div>
                        <div className="col-span-2">
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">{t.hpa.resourceName}</label>
                            <input
                                type="text"
                                value={data.spec.scaleTargetRef.name}
                                onChange={(e) => handleScaleTargetChange('name', e.target.value)}
                                placeholder="my-deployment"
                                className="w-full rounded-md border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* Scaling Configuration */}
            <div className="space-y-4">
                <h3 className="text-lg font-medium text-slate-800 dark:text-slate-200 flex items-center gap-2">
                    <TrendingUp size={20} className="text-green-500 dark:text-green-400" />
                    {t.hpa.scalingConfig}
                </h3>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">{t.hpa.minReplicas}</label>
                        <input
                            type="number"
                            min="1"
                            value={data.spec.minReplicas}
                            onChange={(e) => handleSpecChange('minReplicas', parseInt(e.target.value) || 1)}
                            className="w-full rounded-md border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                        />
                        <p className="mt-1 text-xs text-slate-500">{t.hpa.minReplicasHint}</p>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">{t.hpa.maxReplicas}</label>
                        <input
                            type="number"
                            min={data.spec.minReplicas}
                            value={data.spec.maxReplicas}
                            onChange={(e) => handleSpecChange('maxReplicas', parseInt(e.target.value) || 1)}
                            className="w-full rounded-md border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                        />
                        <p className="mt-1 text-xs text-slate-500">{t.hpa.maxReplicasHint}</p>
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                        {t.hpa.targetCPU}
                        <span className="text-xs text-slate-500 ml-1">(optional)</span>
                    </label>
                    <input
                        type="number"
                        min="1"
                        max="100"
                        value={data.spec.targetCPUUtilizationPercentage || ''}
                        onChange={(e) => handleSpecChange('targetCPUUtilizationPercentage', e.target.value ? parseInt(e.target.value) : undefined)}
                        placeholder="80"
                        className="w-full rounded-md border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    />
                    <p className="mt-1 text-xs text-slate-500">
                        {t.hpa.targetCPUHint}
                    </p>
                </div>
            </div>
        </div>
    );
};
