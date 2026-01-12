import React from 'react';
import { StatefulSetResource, Container } from '../../types';
import { Database, Box, HardDrive } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';
import { CommentSection } from './shared/CommentSection';
import { ContainerSection } from './ContainerSection';

interface Props {
    data: StatefulSetResource;
    onChange: (data: StatefulSetResource) => void;
}

export const StatefulSetForm: React.FC<Props> = ({ data, onChange }) => {
    const { t } = useLanguage();

    const updateMeta = (field: string, value: string) => {
        onChange({
            ...data,
            metadata: { ...data.metadata, [field]: value }
        });
    };

    const updateSpec = (field: string, value: any) => {
        onChange({
            ...data,
            spec: { ...data.spec, [field]: value }
        });
    };

    const updateSelector = (labels: Record<string, string>) => {
        onChange({
            ...data,
            spec: {
                ...data.spec,
                selector: { matchLabels: labels },
                template: {
                    ...data.spec.template,
                    metadata: { labels }
                }
            }
        });
    };

    const addContainer = (type: 'containers' | 'initContainers') => {
        const newContainer: Container = {
            name: type === 'containers' ? `container-${data.spec.template.spec.containers.length + 1}` : `init-${(data.spec.template.spec.initContainers?.length || 0) + 1}`,
            image: 'nginx:latest',
            imagePullPolicy: 'IfNotPresent'
        };

        const containers = type === 'containers' ? data.spec.template.spec.containers : (data.spec.template.spec.initContainers || []);

        onChange({
            ...data,
            spec: {
                ...data.spec,
                template: {
                    ...data.spec.template,
                    spec: {
                        ...data.spec.template.spec,
                        [type]: [...containers, newContainer]
                    }
                }
            }
        });
    };

    const removeContainer = (type: 'containers' | 'initContainers', idx: number) => {
        const containers = type === 'containers' ? data.spec.template.spec.containers : (data.spec.template.spec.initContainers || []);
        onChange({
            ...data,
            spec: {
                ...data.spec,
                template: {
                    ...data.spec.template,
                    spec: {
                        ...data.spec.template.spec,
                        [type]: containers.filter((_, i) => i !== idx)
                    }
                }
            }
        });
    };

    const updateContainer = (type: 'containers' | 'initContainers', idx: number, updatedContainer: Container) => {
        const containers = type === 'containers' ? data.spec.template.spec.containers : (data.spec.template.spec.initContainers || []);
        const newContainers = [...containers];
        newContainers[idx] = updatedContainer;

        onChange({
            ...data,
            spec: {
                ...data.spec,
                template: {
                    ...data.spec.template,
                    spec: {
                        ...data.spec.template.spec,
                        [type]: newContainers
                    }
                }
            }
        });
    };

    const addVolume = () => {
        const newVolume = {
            name: `volume-${(data.spec.template.spec.volumes?.length || 0) + 1}`,
            emptyDir: {}
        };

        onChange({
            ...data,
            spec: {
                ...data.spec,
                template: {
                    ...data.spec.template,
                    spec: {
                        ...data.spec.template.spec,
                        volumes: [...(data.spec.template.spec.volumes || []), newVolume]
                    }
                }
            }
        });
    };

    const removeVolume = (index: number) => {
        onChange({
            ...data,
            spec: {
                ...data.spec,
                template: {
                    ...data.spec.template,
                    spec: {
                        ...data.spec.template.spec,
                        volumes: data.spec.template.spec.volumes?.filter((_, i) => i !== index)
                    }
                }
            }
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
                    <Database size={20} className="text-blue-500 dark:text-blue-400" />
                    {t.common?.metadata || 'Metadata'}
                </h3>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Name</label>
                        <input
                            type="text"
                            value={data.metadata.name}
                            onChange={(e) => updateMeta('name', e.target.value)}
                            className="w-full rounded-md border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Namespace</label>
                        <input
                            type="text"
                            value={data.metadata.namespace}
                            onChange={(e) => updateMeta('namespace', e.target.value)}
                            className="w-full rounded-md border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                        />
                    </div>
                </div>
            </div>

            {/* StatefulSet Configuration */}
            <div className="space-y-4">
                <h3 className="text-lg font-medium text-slate-800 dark:text-slate-200 flex items-center gap-2">
                    <HardDrive size={20} className="text-purple-500 dark:text-purple-400" />
                    StatefulSet Configuration
                </h3>

                <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-lg border border-slate-200 dark:border-slate-700 space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Service Name</label>
                            <input
                                type="text"
                                value={data.spec.serviceName}
                                onChange={(e) => updateSpec('serviceName', e.target.value)}
                                placeholder="my-service"
                                className="w-full rounded-md border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                            />
                            <p className="mt-1 text-xs text-slate-500">Headless service name for network identity</p>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Replicas</label>
                            <input
                                type="number"
                                min="1"
                                value={data.spec.replicas}
                                onChange={(e) => updateSpec('replicas', parseInt(e.target.value) || 1)}
                                className="w-full rounded-md border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">App Label</label>
                        <input
                            type="text"
                            value={data.spec.selector.matchLabels.app || ''}
                            onChange={(e) => updateSelector({ ...data.spec.selector.matchLabels, app: e.target.value })}
                            placeholder="my-statefulset"
                            className="w-full rounded-md border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                        />
                    </div>
                </div>
            </div>

            {/* Containers */}
            <ContainerSection
                containers={data.spec.template.spec.containers}
                initContainers={data.spec.template.spec.initContainers}
                volumes={data.spec.template.spec.volumes}
                onAddContainer={addContainer}
                onRemoveContainer={removeContainer}
                onUpdateContainer={updateContainer}
                onAddVolume={addVolume}
                onRemoveVolume={removeVolume}
            />
        </div>
    );
};
