import React from 'react';
import { Container, Volume, EnvVar, EnvFromSource, VolumeMount, Probe } from '../../types';
import { Input, Label, Select, CollapsibleSection } from '../FormComponents';
import { Cpu, Trash2, Zap } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';

// Shared Components
import { ResourceLimitsSection } from './shared/ResourceLimitsSection';
import { EnvVarsSection } from './shared/EnvVarsSection';
import { VolumeMountsSection } from './shared/VolumeMountsSection';
import { ProbeForm } from './shared/ProbeForm';

interface ContainerSectionProps {
    container: Container;
    containerIndex: number;
    containerType: 'containers' | 'initContainers';
    availableVolumes: Volume[];
    onUpdateField: (type: 'containers' | 'initContainers', idx: number, field: string, value: any) => void;
    onUpdateResources: (type: 'containers' | 'initContainers', cIdx: number, resType: 'requests' | 'limits', key: 'cpu' | 'memory', value: string) => void;
    onAddEnvVar: (type: 'containers' | 'initContainers', cIdx: number, env: EnvVar) => void;
    onRemoveEnvVar: (type: 'containers' | 'initContainers', cIdx: number, eIdx: number) => void;
    onAddEnvFrom: (type: 'containers' | 'initContainers', cIdx: number, envFrom: EnvFromSource) => void;
    onRemoveEnvFrom: (type: 'containers' | 'initContainers', cIdx: number, eIdx: number) => void;
    onAddVolumeMount: (type: 'containers' | 'initContainers', cIdx: number, mount: VolumeMount) => void;
    onRemoveVolumeMount: (type: 'containers' | 'initContainers', cIdx: number, mIdx: number) => void;
    onUpdateProbe: (cIdx: number, probeType: 'livenessProbe' | 'readinessProbe', field: string, value: any) => void;
    onRemove: (type: 'containers' | 'initContainers', idx: number) => void;
    canRemove: boolean;
    /** Available ConfigMaps for smart selection in env vars */
    availableConfigMaps?: { name: string; keys: string[] }[];
    /** Available Secrets for smart selection in env vars */
    availableSecrets?: { name: string; keys: string[] }[];
}

/**
 * 容器配置区块组件，整合所有容器相关配置
 */
export const ContainerSection: React.FC<ContainerSectionProps> = ({
    container,
    containerIndex,
    containerType,
    availableVolumes,
    onUpdateField,
    onUpdateResources,
    onAddEnvVar,
    onRemoveEnvVar,
    onAddEnvFrom,
    onRemoveEnvFrom,
    onAddVolumeMount,
    onRemoveVolumeMount,
    onUpdateProbe,
    onRemove,
    canRemove,
    availableConfigMaps = [],
    availableSecrets = [],
}) => {
    const { t } = useLanguage();

    return (
        <CollapsibleSection
            title={container.name || `${containerType === 'initContainers' ? 'Init ' : ''}Container ${containerIndex + 1}`}
            icon={containerType === 'initContainers' ? <Zap size={18} className="text-amber-500" /> : <Cpu size={18} />}
            defaultOpen={containerType === 'containers' && containerIndex === 0}
        >
            <div className="relative pt-6">
                {canRemove && (
                    <button
                        onClick={() => onRemove(containerType, containerIndex)}
                        className="absolute top-0 right-0 p-1.5 text-slate-400 hover:text-red-500 transition-colors"
                        title={t.common.delete}
                    >
                        <Trash2 size={18} />
                    </button>
                )}

                {/* Basic Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                    <div>
                        <Label>{t.deploy.containerName}</Label>
                        <Input
                            value={container.name}
                            onChange={(e) => onUpdateField(containerType, containerIndex, 'name', e.target.value)}
                        />
                    </div>
                    <div>
                        <Label>{t.deploy.image}</Label>
                        <Input
                            value={container.image}
                            onChange={(e) => onUpdateField(containerType, containerIndex, 'image', e.target.value)}
                        />
                    </div>
                    <div>
                        <Label>{t.deploy.pullPolicy}</Label>
                        <Select
                            value={container.imagePullPolicy}
                            onChange={(e) => onUpdateField(containerType, containerIndex, 'imagePullPolicy', e.target.value)}
                        >
                            <option value="Always">Always</option>
                            <option value="IfNotPresent">IfNotPresent</option>
                            <option value="Never">Never</option>
                        </Select>
                    </div>
                    {containerType === 'containers' && (
                        <div>
                            <Label>{t.common.port}</Label>
                            <Input
                                type="number"
                                value={(container.ports || [])[0]?.containerPort}
                                onChange={(e) => {
                                    const newPorts = [...(container.ports || [])];
                                    newPorts[0] = { containerPort: parseInt(e.target.value) || 80 };
                                    onUpdateField(containerType, containerIndex, 'ports', newPorts);
                                }}
                            />
                        </div>
                    )}
                </div>

                {/* Command & Args */}
                <div className="grid grid-cols-2 gap-4 mb-6">
                    <div>
                        <Label>{t.deploy.containerCommand}</Label>
                        <Input
                            placeholder='e.g. /bin/sh -c'
                            value={(container.command || []).join(' ')}
                            onChange={(e) => onUpdateField(containerType, containerIndex, 'command', e.target.value.split(' ').filter(s => s.length > 0))}
                        />
                    </div>
                    <div>
                        <Label>{t.deploy.containerArgs}</Label>
                        <Input
                            placeholder='e.g. "echo hello"'
                            value={(container.args || []).join(' ')}
                            onChange={(e) => onUpdateField(containerType, containerIndex, 'args', e.target.value.split(' ').filter(s => s.length > 0))}
                        />
                    </div>
                </div>

                {/* Sub-sections */}
                <div className="space-y-6">
                    {/* Resources */}
                    <ResourceLimitsSection
                        container={container}
                        containerIndex={containerIndex}
                        containerType={containerType}
                        onUpdateResources={onUpdateResources}
                    />

                    {/* Env Vars */}
                    <EnvVarsSection
                        container={container}
                        containerIndex={containerIndex}
                        containerType={containerType}
                        onAddEnvVar={onAddEnvVar}
                        onRemoveEnvVar={onRemoveEnvVar}
                        onAddEnvFrom={onAddEnvFrom}
                        onRemoveEnvFrom={onRemoveEnvFrom}
                        availableConfigMaps={availableConfigMaps}
                        availableSecrets={availableSecrets}
                    />

                    {/* Volume Mounts */}
                    <VolumeMountsSection
                        container={container}
                        containerIndex={containerIndex}
                        containerType={containerType}
                        availableVolumes={availableVolumes}
                        onAddVolumeMount={onAddVolumeMount}
                        onRemoveVolumeMount={onRemoveVolumeMount}
                    />

                    {/* Probes - Only for main containers */}
                    {containerType === 'containers' && (
                        <div className="space-y-4">
                            <ProbeForm
                                probe={container.livenessProbe}
                                probeType="livenessProbe"
                                title={t.deploy.livenessProbe}
                                onChange={(field, value) => onUpdateProbe(containerIndex, 'livenessProbe', field, value)}
                            />
                            <ProbeForm
                                probe={container.readinessProbe}
                                probeType="readinessProbe"
                                title={t.deploy.readinessProbe}
                                onChange={(field, value) => onUpdateProbe(containerIndex, 'readinessProbe', field, value)}
                            />
                        </div>
                    )}
                </div>
            </div>
        </CollapsibleSection>
    );
};
