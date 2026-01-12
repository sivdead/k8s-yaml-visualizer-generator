import React from 'react';
import { CronJobResource } from '../../types';
import { Clock, Box } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';
import { CommentSection } from './shared/CommentSection';

interface Props {
    data: CronJobResource;
    onChange: (data: CronJobResource) => void;
}

export const CronJobForm: React.FC<Props> = ({ data, onChange }) => {
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

    const handleContainerChange = (index: number, field: string, value: any) => {
        const newContainers = [...data.spec.jobTemplate.spec.template.spec.containers];
        newContainers[index] = { ...newContainers[index], [field]: value };

        onChange({
            ...data,
            spec: {
                ...data.spec,
                jobTemplate: {
                    spec: {
                        template: {
                            spec: {
                                ...data.spec.jobTemplate.spec.template.spec,
                                containers: newContainers
                            }
                        }
                    }
                }
            }
        });
    };

    const container = data.spec.jobTemplate.spec.template.spec.containers[0];

    return (
        <div className="space-y-6">
            <CommentSection
                value={data._comment}
                onChange={(comment) => onChange({ ...data, _comment: comment })}
            />
            <div className="space-y-4">
                <h3 className="text-lg font-medium text-slate-800 dark:text-slate-200 flex items-center gap-2">
                    <Clock size={20} className="text-blue-500 dark:text-blue-400" />
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

            <div className="space-y-4">
                <h3 className="text-lg font-medium text-slate-800 dark:text-slate-200 flex items-center gap-2">
                    <Clock size={20} className="text-orange-500 dark:text-orange-400" />
                    {t.cronjob.schedule}
                </h3>
                <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">{t.cronjob.cronExpression}</label>
                    <input
                        type="text"
                        value={data.spec.schedule}
                        onChange={(e) => handleSpecChange('schedule', e.target.value)}
                        placeholder="*/5 * * * *"
                        className="w-full rounded-md border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none font-mono"
                    />
                    <p className="mt-1 text-xs text-slate-500">
                        {t.cronjob.cronHint}
                    </p>
                </div>
            </div>

            <div className="space-y-4">
                <h3 className="text-lg font-medium text-slate-800 dark:text-slate-200 flex items-center gap-2">
                    <Box size={20} className="text-green-500 dark:text-green-400" />
                    {t.cronjob.jobContainer}
                </h3>

                <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-lg border border-slate-200 dark:border-slate-700 space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">{t.job.containerName}</label>
                        <input
                            type="text"
                            value={container.name}
                            onChange={(e) => handleContainerChange(0, 'name', e.target.value)}
                            className="w-full rounded-md border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">{t.deploy.image}</label>
                            <input
                                type="text"
                                value={container.image}
                                onChange={(e) => handleContainerChange(0, 'image', e.target.value)}
                                className="w-full rounded-md border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">{t.deploy.pullPolicy}</label>
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
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">{t.cronjob.commandJson}</label>
                        <input
                            type="text"
                            value={JSON.stringify(container.command || [])}
                            onChange={(e) => {
                                try {
                                    const parsed = JSON.parse(e.target.value);
                                    handleContainerChange(0, 'command', parsed);
                                } catch (e) {
                                    // Allow typing invalid json momentarily, or handle better with string split
                                }
                            }}
                            placeholder='["/bin/sh", "-c", "echo hello"]'
                            className="w-full rounded-md border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none font-mono"
                        />
                        <div className="mt-1 flex gap-2">
                            <button className="text-xs text-blue-600 underline" onClick={() => handleContainerChange(0, 'command', ["/bin/sh", "-c", "echo hello"])}>{t.cronjob.setDefault}</button>
                            <button className="text-xs text-blue-600 underline" onClick={() => handleContainerChange(0, 'command', undefined)}>{t.cronjob.clear}</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
