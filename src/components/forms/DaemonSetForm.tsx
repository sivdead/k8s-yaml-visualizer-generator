import React, { useState } from 'react';
import { DaemonSetResource, EnvVar, EnvFromSource, Volume, Container, Probe, VolumeMount } from '../../types';
import { Input, Label, Select, CollapsibleSection } from '../FormComponents';
import { Box, Server, Plus, Trash2, Database, Zap, Cpu } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';
import { useToast } from '../../contexts/AppContext';
import { CommentSection } from './shared/CommentSection';
import { ContainerSection } from './ContainerSection';

interface Props {
    data: DaemonSetResource;
    onChange: (data: DaemonSetResource) => void;
}

export const DaemonSetForm: React.FC<Props> = ({ data, onChange }) => {
    const { t } = useLanguage();
    const { addToast } = useToast();

    const [newVolName, setNewVolName] = useState('');
    const [newVolType, setNewVolType] = useState<'pvc' | 'configMap' | 'secret' | 'emptyDir' | 'hostPath'>('pvc');
    const [newVolClaim, setNewVolClaim] = useState('');
    const [newVolRefName, setNewVolRefName] = useState('');
    const [newVolPath, setNewVolPath] = useState('');

    const containers = data.spec.template.spec.containers || [];
    const initContainers = data.spec.template.spec.initContainers || [];
    const volumes = data.spec.template.spec.volumes || [];

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

    const updateTemplateSpec = (field: string, value: any) => {
        onChange({
            ...data,
            spec: {
                ...data.spec,
                template: {
                    ...data.spec.template,
                    spec: { ...data.spec.template.spec, [field]: value }
                }
            }
        });
    };

    const addContainer = (type: 'containers' | 'initContainers') => {
        const list = data.spec.template.spec[type] || [];
        const newContainer: Container = {
            name: `${type === 'initContainers' ? 'init-' : ''}container-${list.length + 1}`,
            image: 'nginx:latest',
            imagePullPolicy: 'IfNotPresent',
            env: [],
            volumeMounts: []
        };
        if (type === 'containers') {
            newContainer.ports = [{ containerPort: 80 }];
        }
        updateTemplateSpec(type, [...list, newContainer]);
    };

    const removeContainer = (type: 'containers' | 'initContainers', idx: number) => {
        const list = data.spec.template.spec[type] || [];
        if (type === 'containers' && list.length <= 1) return;
        updateTemplateSpec(type, list.filter((_, i) => i !== idx));
    };

    const updateContainerField = (type: 'containers' | 'initContainers', idx: number, field: string, value: any) => {
        const list = [...(data.spec.template.spec[type] || [])];
        list[idx] = { ...list[idx], [field]: value };
        updateTemplateSpec(type, list);
    };

    const updateResources = (type: 'containers' | 'initContainers', cIdx: number, resType: 'requests' | 'limits', key: 'cpu' | 'memory', value: string) => {
        const list = [...(data.spec.template.spec[type] || [])];
        const container = list[cIdx];
        const currentResources = container.resources || {};
        const typeObj = currentResources[resType] || { cpu: '', memory: '' };

        container.resources = {
            ...currentResources,
            [resType]: {
                ...typeObj,
                [key]: value
            }
        };
        updateTemplateSpec(type, list);
    };

    const updateProbe = (cIdx: number, probeType: 'livenessProbe' | 'readinessProbe', field: string, value: any) => {
        const list = [...containers];
        const container = list[cIdx];
        const currentProbe = container[probeType] || {};

        let newProbe = { ...currentProbe };

        if (field === 'type') {
            delete newProbe.httpGet;
            delete newProbe.tcpSocket;
            delete newProbe.exec;

            if (value === 'http') newProbe.httpGet = { path: '/', port: 80 };
            if (value === 'tcp') newProbe.tcpSocket = { port: 80 };
            if (value === 'exec') newProbe.exec = { command: [] };
            if (value === 'none') {
                delete container[probeType];
                updateTemplateSpec('containers', list);
                return;
            }
        } else if (field.startsWith('httpGet.')) {
            const key = field.split('.')[1] as keyof NonNullable<Probe['httpGet']>;
            newProbe.httpGet = { ...(newProbe.httpGet || { path: '/', port: 80 }), [key]: value };
        } else if (field.startsWith('tcpSocket.')) {
            const key = field.split('.')[1] as keyof NonNullable<Probe['tcpSocket']>;
            newProbe.tcpSocket = { ...(newProbe.tcpSocket || { port: 80 }), [key]: value };
        } else if (field.startsWith('exec.')) {
            const key = field.split('.')[1];
            newProbe.exec = { ...(newProbe.exec || { command: [] }), [key]: value };
        } else {
            // @ts-ignore
            newProbe[field] = value;
        }

        container[probeType] = newProbe;
        updateTemplateSpec('containers', list);
    };

    const addEnvVar = (type: 'containers' | 'initContainers', cIdx: number, env: EnvVar) => {
        const list = [...(data.spec.template.spec[type] || [])];
        const container = list[cIdx];
        container.env = [...(container.env || []), env];
        updateTemplateSpec(type, list);
    };

    const removeEnvVar = (type: 'containers' | 'initContainers', cIdx: number, eIdx: number) => {
        const list = [...(data.spec.template.spec[type] || [])];
        const container = list[cIdx];
        container.env = (container.env || []).filter((_, i) => i !== eIdx);
        updateTemplateSpec(type, list);
    };

    const addEnvFrom = (type: 'containers' | 'initContainers', cIdx: number, envFrom: EnvFromSource) => {
        const list = [...(data.spec.template.spec[type] || [])];
        const container = list[cIdx];
        container.envFrom = [...(container.envFrom || []), envFrom];
        updateTemplateSpec(type, list);
    };

    const removeEnvFrom = (type: 'containers' | 'initContainers', cIdx: number, eIdx: number) => {
        const list = [...(data.spec.template.spec[type] || [])];
        const container = list[cIdx];
        container.envFrom = (container.envFrom || []).filter((_, i) => i !== eIdx);
        updateTemplateSpec(type, list);
    };

    const addVolumeMount = (type: 'containers' | 'initContainers', cIdx: number, mount: VolumeMount) => {
        const list = [...(data.spec.template.spec[type] || [])];
        const container = list[cIdx];
        container.volumeMounts = [...(container.volumeMounts || []), mount];
        updateTemplateSpec(type, list);
    };

    const removeVolumeMount = (type: 'containers' | 'initContainers', cIdx: number, mIdx: number) => {
        const list = [...(data.spec.template.spec[type] || [])];
        const container = list[cIdx];
        container.volumeMounts = (container.volumeMounts || []).filter((_, i) => i !== mIdx);
        updateTemplateSpec(type, list);
    };

    const addVolume = () => {
        if (!newVolName) {
            addToast('Please enter volume name', 'warning');
            return;
        }
        const vol: Volume = { name: newVolName };
        switch (newVolType) {
            case 'pvc': vol.persistentVolumeClaim = { claimName: newVolClaim }; break;
            case 'configMap': vol.configMap = { name: newVolRefName }; break;
            case 'secret': vol.secret = { secretName: newVolRefName }; break;
            case 'emptyDir': vol.emptyDir = {}; break;
            case 'hostPath': vol.hostPath = { path: newVolPath }; break;
        }
        updateTemplateSpec('volumes', [...volumes, vol]);
        setNewVolName(''); setNewVolClaim(''); setNewVolRefName(''); setNewVolPath('');
    };

    const removeVolume = (index: number) => {
        updateTemplateSpec('volumes', volumes.filter((_, i) => i !== index));
    };

    return (
        <div className="space-y-2">
            <CommentSection
                value={data._comment}
                onChange={(comment) => onChange({ ...data, _comment: comment })}
            />

            <CollapsibleSection title={t.common?.metadata || 'Metadata'} icon={<Server size={20} />} defaultOpen={true}>
                <div className="grid grid-cols-2 gap-4">
                    <div><Label>{t.common.name}</Label><Input value={data.metadata.name} onChange={(e) => updateMeta('name', e.target.value)} /></div>
                    <div><Label>{t.common.namespace}</Label><Input value={data.metadata.namespace} onChange={(e) => updateMeta('namespace', e.target.value)} /></div>
                </div>
            </CollapsibleSection>

            <CollapsibleSection title={t.daemonset.podSelector} icon={<Box size={20} />} defaultOpen={true}>
                <p className="text-xs text-slate-500 dark:text-slate-400 mb-3">
                    {t.daemonset.podSelectorHint}
                </p>
                <div>
                    <Label>{t.daemonset.appLabel}</Label>
                    <Input
                        value={data.spec.selector.matchLabels.app || ''}
                        onChange={(e) => updateSelector({ ...data.spec.selector.matchLabels, app: e.target.value })}
                        placeholder="my-daemonset"
                    />
                </div>
            </CollapsibleSection>

            {/* Init Containers */}
            <div className="mb-8 mt-4">
                <div className="flex items-center justify-between mb-2 px-2">
                    <div className="flex items-center gap-2 text-slate-800 dark:text-slate-200 font-semibold">
                        <Zap size={20} className="text-amber-500" />
                        {t.daemonset.initContainers}
                    </div>
                    <button
                        type="button"
                        onClick={() => addContainer('initContainers')}
                        className="flex items-center gap-1 text-xs bg-amber-500 text-white px-2 py-1 rounded hover:bg-amber-600 transition-colors shadow-sm"
                    >
                        <Plus size={14} /> {t.daemonset.addInitContainer}
                    </button>
                </div>
                <div className="space-y-4">
                    {initContainers.map((container, idx) => (
                        <ContainerSection
                            key={`initContainers-${idx}`}
                            container={container}
                            containerIndex={idx}
                            containerType="initContainers"
                            availableVolumes={volumes}
                            onUpdateField={updateContainerField}
                            onUpdateResources={updateResources}
                            onAddEnvVar={addEnvVar}
                            onRemoveEnvVar={removeEnvVar}
                            onAddEnvFrom={addEnvFrom}
                            onRemoveEnvFrom={removeEnvFrom}
                            onAddVolumeMount={addVolumeMount}
                            onRemoveVolumeMount={removeVolumeMount}
                            onUpdateProbe={updateProbe}
                            onRemove={removeContainer}
                            canRemove={true}
                        />
                    ))}
                    {initContainers.length === 0 && (
                        <div className="text-xs text-slate-400 italic px-2 py-1">{t.daemonset.noInitContainers}</div>
                    )}
                </div>
            </div>

            {/* Main Containers */}
            <div className="mb-4">
                <div className="flex items-center justify-between mb-2 px-2">
                    <div className="flex items-center gap-2 text-slate-800 dark:text-slate-200 font-semibold">
                        <Cpu size={20} className="text-blue-600" />
                        {t.daemonset.containers}
                    </div>
                    <button
                        type="button"
                        onClick={() => addContainer('containers')}
                        className="flex items-center gap-1 text-xs bg-blue-600 text-white px-2 py-1 rounded hover:bg-blue-700 transition-colors shadow-sm"
                    >
                        <Plus size={14} /> {t.daemonset.addContainer}
                    </button>
                </div>
                <div className="space-y-4">
                    {containers.map((container, idx) => (
                        <ContainerSection
                            key={`containers-${idx}`}
                            container={container}
                            containerIndex={idx}
                            containerType="containers"
                            availableVolumes={volumes}
                            onUpdateField={updateContainerField}
                            onUpdateResources={updateResources}
                            onAddEnvVar={addEnvVar}
                            onRemoveEnvVar={removeEnvVar}
                            onAddEnvFrom={addEnvFrom}
                            onRemoveEnvFrom={removeEnvFrom}
                            onAddVolumeMount={addVolumeMount}
                            onRemoveVolumeMount={removeVolumeMount}
                            onUpdateProbe={updateProbe}
                            onRemove={removeContainer}
                            canRemove={containers.length > 1}
                        />
                    ))}
                </div>
            </div>

            <CollapsibleSection title={t.daemonset.volumes} icon={<Database size={20} />}>
                <div className="space-y-3">
                    {volumes.map((vol, idx) => (
                        <div key={idx} className="flex gap-2 items-center bg-slate-50 dark:bg-slate-800 p-3 border dark:border-slate-700 rounded text-sm dark:text-slate-200">
                            <div className="flex-1 font-semibold">{vol.name}</div>
                            <button type="button" onClick={() => removeVolume(idx)} className="text-red-500 hover:text-red-400"><Trash2 size={16} /></button>
                        </div>
                    ))}
                    <div className="bg-slate-100 dark:bg-slate-800/50 p-3 rounded-lg border border-slate-200 dark:border-slate-700">
                        <div className="grid grid-cols-2 gap-2 mb-2">
                            <div><Label>{t.daemonset.volumeName}</Label><Input value={newVolName} onChange={(e) => setNewVolName(e.target.value)} /></div>
                            <div>
                                <Label>{t.common.type}</Label>
                                <Select value={newVolType} onChange={(e) => setNewVolType(e.target.value as any)}>
                                    <option value="pvc">PVC</option><option value="configMap">ConfigMap</option><option value="secret">Secret</option><option value="emptyDir">EmptyDir</option><option value="hostPath">HostPath</option>
                                </Select>
                            </div>
                        </div>
                        {newVolType === 'pvc' && (
                            <div className="mb-2"><Label>{t.daemonset.claimName}</Label><Input value={newVolClaim} onChange={(e) => setNewVolClaim(e.target.value)} /></div>
                        )}
                        {(newVolType === 'configMap' || newVolType === 'secret') && (
                            <div className="mb-2"><Label>{t.daemonset.resourceName}</Label><Input value={newVolRefName} onChange={(e) => setNewVolRefName(e.target.value)} /></div>
                        )}
                        {newVolType === 'hostPath' && (
                            <div className="mb-2"><Label>{t.daemonset.hostPath}</Label><Input value={newVolPath} onChange={(e) => setNewVolPath(e.target.value)} /></div>
                        )}
                        {newVolType === 'emptyDir' && (
                            <p className="text-xs text-slate-500 mb-2">{t.daemonset.tempStorage}</p>
                        )}
                        <button type="button" onClick={addVolume} className="w-full py-2 bg-blue-600 text-white rounded hover:bg-blue-700 flex items-center justify-center gap-2 text-sm"><Plus size={16} /> {t.daemonset.addVolume}</button>
                    </div>
                </div>
            </CollapsibleSection>
        </div>
    );
};
