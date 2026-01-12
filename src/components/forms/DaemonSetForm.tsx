import React from 'react';
import { DaemonSetResource, Container, EnvVar, EnvFromSource, Volume, VolumeMount } from '../../types';
import { Server, Box } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';
import { CommentSection } from './shared/CommentSection';
import { ContainerSection } from './ContainerSection';

interface Props {
    data: DaemonSetResource;
    onChange: (data: DaemonSetResource) => void;
}

export const DaemonSetForm: React.FC<Props> = ({ data, onChange }) => {
    const { t } = useLanguage();

    const updateMeta = (field: string, value: string) => {
        onChange({
            ...data,
            metadata: { ...data.metadata, [field]: value }
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
        const newVolume: Volume = {
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
                    <Server size={20} className="text-blue-500 dark:text-blue-400" />
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

            {/* Selector */}
            <div className="space-y-4">
                <h3 className="text-lg font-medium text-slate-800 dark:text-slate-200 flex items-center gap-2">
                    <Box size={20} className="text-purple-500 dark:text-purple-400" />
                    Pod Selector
                </h3>
                <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-lg border border-slate-200 dark:border-slate-700">
                    <p className="text-xs text-slate-500 dark:text-slate-400 mb-3">
                        DaemonSet runs one pod on each node. Labels are used to identify pods.
                    </p>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">App Label</label>
                            <input
                                type="text"
                                value={data.spec.selector.matchLabels.app || ''}
                                onChange={(e) => updateSelector({ ...data.spec.selector.matchLabels, app: e.target.value })}
                                placeholder="my-daemonset"
                                className="w-full rounded-md border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                            />
                        </div>
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
