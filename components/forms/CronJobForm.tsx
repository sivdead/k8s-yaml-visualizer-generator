import React from 'react';
import { CronJobResource } from '../../types';
import { Clock, Box } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';

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
            <div className="space-y-4">
                <h3 className="text-lg font-medium text-slate-800 flex items-center gap-2">
                    <Clock size={20} className="text-blue-500" />
                    {t.form?.metadata || 'Metadata'}
                </h3>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Name</label>
                        <input
                            type="text"
                            value={data.metadata.name}
                            onChange={(e) => handleMetadataChange('name', e.target.value)}
                            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Namespace</label>
                        <input
                            type="text"
                            value={data.metadata.namespace}
                            onChange={(e) => handleMetadataChange('namespace', e.target.value)}
                            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                        />
                    </div>
                </div>
            </div>

            <div className="space-y-4">
                <h3 className="text-lg font-medium text-slate-800 flex items-center gap-2">
                    <Clock size={20} className="text-orange-500" />
                    Schedule
                </h3>
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Cron Expression</label>
                    <input
                        type="text"
                        value={data.spec.schedule}
                        onChange={(e) => handleSpecChange('schedule', e.target.value)}
                        placeholder="*/5 * * * *"
                        className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none font-mono"
                    />
                    <p className="mt-1 text-xs text-slate-500">
                        Example: "0 0 * * *" (Daily), "*/15 * * * *" (Every 15 mins)
                    </p>
                </div>
            </div>

            <div className="space-y-4">
                <h3 className="text-lg font-medium text-slate-800 flex items-center gap-2">
                    <Box size={20} className="text-green-500" />
                    Job Container
                </h3>

                <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Container Name</label>
                        <input
                            type="text"
                            value={container.name}
                            onChange={(e) => handleContainerChange(0, 'name', e.target.value)}
                            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Image</label>
                            <input
                                type="text"
                                value={container.image}
                                onChange={(e) => handleContainerChange(0, 'image', e.target.value)}
                                className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Image Pull Policy</label>
                            <select
                                value={container.imagePullPolicy}
                                onChange={(e) => handleContainerChange(0, 'imagePullPolicy', e.target.value)}
                                className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none bg-white"
                            >
                                <option value="Always">Always</option>
                                <option value="IfNotPresent">IfNotPresent</option>
                                <option value="Never">Never</option>
                            </select>
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Command (JSON Array)</label>
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
                            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none font-mono"
                        />
                        <div className="mt-1 flex gap-2">
                            <button className="text-xs text-blue-600 underline" onClick={() => handleContainerChange(0, 'command', ["/bin/sh", "-c", "echo hello"])}>Set Default</button>
                            <button className="text-xs text-blue-600 underline" onClick={() => handleContainerChange(0, 'command', undefined)}>Clear</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
