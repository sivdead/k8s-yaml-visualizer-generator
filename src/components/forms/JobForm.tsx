import React from 'react';
import { JobResource } from '../../types';
import { Play, Box } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';
import { CommentSection } from './shared/CommentSection';

interface Props {
    data: JobResource;
    onChange: (data: JobResource) => void;
}

export const JobForm: React.FC<Props> = ({ data, onChange }) => {
    const { t } = useLanguage();

    const handleMetadataChange = (field: string, value: string) => {
        onChange({
            ...data,
            metadata: { ...data.metadata, [field]: value }
        });
    };

    const handleSpecChange = (field: string, value: any) => {
        onChange({
            ...data,
            spec: { ...data.spec, [field]: value }
        });
    };

    const handleTemplateSpecChange = (field: string, value: any) => {
        onChange({
            ...data,
            spec: {
                ...data.spec,
                template: {
                    ...data.spec.template,
                    spec: {
                        ...data.spec.template.spec,
                        [field]: value
                    }
                }
            }
        });
    };

    const handleContainerChange = (index: number, field: string, value: any) => {
        const newContainers = [...data.spec.template.spec.containers];
        newContainers[index] = { ...newContainers[index], [field]: value };
        handleTemplateSpecChange('containers', newContainers);
    };

    const container = data.spec.template.spec.containers[0];

    return (
        <div className="space-y-6">
            <CommentSection
                value={data._comment}
                onChange={(comment) => onChange({ ...data, _comment: comment })}
            />

            {/* Metadata Section */}
            <div className="space-y-4">
                <h3 className="text-lg font-medium text-slate-800 dark:text-slate-200 flex items-center gap-2">
                    <Play size={20} className="text-blue-500 dark:text-blue-400" />
                    {t.form?.metadata || 'Metadata'}
                </h3>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Name</label>
                        <input
                            type="text"
                            value={data.metadata.name}
                            onChange={(e) => handleMetadataChange('name', e.target.value)}
                            className="w-full rounded-md border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Namespace</label>
                        <input
                            type="text"
                            value={data.metadata.namespace}
                            onChange={(e) => handleMetadataChange('namespace', e.target.value)}
                            className="w-full rounded-md border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                        />
                    </div>
                </div>
            </div>

            {/* Job Configuration */}
            <div className="space-y-4">
                <h3 className="text-lg font-medium text-slate-800 dark:text-slate-200 flex items-center gap-2">
                    <Play size={20} className="text-purple-500 dark:text-purple-400" />
                    Job Configuration
                </h3>

                <div className="grid grid-cols-3 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                            Completions
                            <span className="text-xs text-slate-500 ml-1">(optional)</span>
                        </label>
                        <input
                            type="number"
                            min="1"
                            value={data.spec.completions || ''}
                            onChange={(e) => handleSpecChange('completions', e.target.value ? parseInt(e.target.value) : undefined)}
                            placeholder="1"
                            className="w-full rounded-md border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                        />
                        <p className="mt-1 text-xs text-slate-500">Number of successful completions</p>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                            Parallelism
                            <span className="text-xs text-slate-500 ml-1">(optional)</span>
                        </label>
                        <input
                            type="number"
                            min="1"
                            value={data.spec.parallelism || ''}
                            onChange={(e) => handleSpecChange('parallelism', e.target.value ? parseInt(e.target.value) : undefined)}
                            placeholder="1"
                            className="w-full rounded-md border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                        />
                        <p className="mt-1 text-xs text-slate-500">Max parallel pods</p>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                            Backoff Limit
                            <span className="text-xs text-slate-500 ml-1">(optional)</span>
                        </label>
                        <input
                            type="number"
                            min="0"
                            value={data.spec.backoffLimit !== undefined ? data.spec.backoffLimit : ''}
                            onChange={(e) => handleSpecChange('backoffLimit', e.target.value ? parseInt(e.target.value) : undefined)}
                            placeholder="6"
                            className="w-full rounded-md border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                        />
                        <p className="mt-1 text-xs text-slate-500">Retry limit before failure</p>
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Restart Policy</label>
                    <select
                        value={data.spec.template.spec.restartPolicy}
                        onChange={(e) => handleTemplateSpecChange('restartPolicy', e.target.value)}
                        className="w-full rounded-md border border-slate-300 dark:border-slate-600 px-3 py-2 text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:outline-none bg-white dark:bg-slate-700"
                    >
                        <option value="Never">Never</option>
                        <option value="OnFailure">OnFailure</option>
                    </select>
                    <p className="mt-1 text-xs text-slate-500">
                        Never: Don't restart on failure | OnFailure: Restart on failure
                    </p>
                </div>
            </div>

            {/* Container Configuration */}
            <div className="space-y-4">
                <h3 className="text-lg font-medium text-slate-800 dark:text-slate-200 flex items-center gap-2">
                    <Box size={20} className="text-green-500 dark:text-green-400" />
                    Container
                </h3>

                <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-lg border border-slate-200 dark:border-slate-700 space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Container Name</label>
                        <input
                            type="text"
                            value={container.name}
                            onChange={(e) => handleContainerChange(0, 'name', e.target.value)}
                            className="w-full rounded-md border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Image</label>
                            <input
                                type="text"
                                value={container.image}
                                onChange={(e) => handleContainerChange(0, 'image', e.target.value)}
                                placeholder="busybox:latest"
                                className="w-full rounded-md border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Image Pull Policy</label>
                            <select
                                value={container.imagePullPolicy}
                                onChange={(e) => handleContainerChange(0, 'imagePullPolicy', e.target.value)}
                                className="w-full rounded-md border border-slate-300 dark:border-slate-600 px-3 py-2 text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:outline-none bg-white dark:bg-slate-700"
                            >
                                <option value="Always">Always</option>
                                <option value="IfNotPresent">IfNotPresent</option>
                                <option value="Never">Never</option>
                            </select>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Command (JSON Array)</label>
                        <input
                            type="text"
                            value={JSON.stringify(container.command || [])}
                            onChange={(e) => {
                                try {
                                    const parsed = JSON.parse(e.target.value);
                                    handleContainerChange(0, 'command', parsed);
                                } catch (e) {
                                    // Allow typing invalid json momentarily
                                }
                            }}
                            placeholder='["/bin/sh", "-c", "echo hello && sleep 30"]'
                            className="w-full rounded-md border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none font-mono"
                        />
                        <div className="mt-1 flex gap-2">
                            <button
                                type="button"
                                className="text-xs text-blue-600 dark:text-blue-400 hover:underline"
                                onClick={() => handleContainerChange(0, 'command', ["/bin/sh", "-c", "echo 'Job completed successfully'"])}
                            >
                                Set Example
                            </button>
                            <button
                                type="button"
                                className="text-xs text-blue-600 dark:text-blue-400 hover:underline"
                                onClick={() => handleContainerChange(0, 'command', undefined)}
                            >
                                Clear
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
