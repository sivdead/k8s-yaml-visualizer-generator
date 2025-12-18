
import React, { useState } from 'react';
import { DeploymentResource, EnvVar, Volume, Container, Probe } from '../../types';
import { Input, Label, Select, CollapsibleSection } from '../FormComponents';
import { Box, Layers, Cpu, Plus, Trash2, Key, Shield, PlayCircle, Activity, HardDrive, Database, FileText, Folder, Play, HeartPulse } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';

interface Props {
  data: DeploymentResource;
  onChange: (data: DeploymentResource) => void;
}

export const DeploymentForm: React.FC<Props> = ({ data, onChange }) => {
  const { t } = useLanguage();
  
  // Env Var State (temporary for each container's "Add" section)
  const [newEnvNames, setNewEnvNames] = useState<Record<number, string>>({});
  const [newEnvTypes, setNewEnvTypes] = useState<Record<number, 'value' | 'configMap' | 'secret' | 'fieldRef'>>({});
  const [newEnvValues, setNewEnvValues] = useState<Record<number, string>>({});
  const [newEnvRefNames, setNewEnvRefNames] = useState<Record<number, string>>({});
  const [newEnvRefKeys, setNewEnvRefKeys] = useState<Record<number, string>>({});
  const [newEnvFieldPaths, setNewEnvFieldPaths] = useState<Record<number, string>>({});

  // Volume State (Pod level)
  const [newVolName, setNewVolName] = useState('');
  const [newVolType, setNewVolType] = useState<'pvc' | 'configMap' | 'secret' | 'emptyDir' | 'hostPath'>('pvc');
  const [newVolClaim, setNewVolClaim] = useState('');
  const [newVolRefName, setNewVolRefName] = useState('');
  const [newVolPath, setNewVolPath] = useState('');

  // Mount State (per container)
  const [newMountNames, setNewMountNames] = useState<Record<number, string>>({});
  const [newMountPaths, setNewMountPaths] = useState<Record<number, string>>({});
  const [newMountReadOnlys, setNewMountReadOnlys] = useState<Record<number, boolean>>({});
  
  const [newSecretName, setNewSecretName] = useState('');

  const containers = data.spec.template.spec.containers || [];
  const initContainers = data.spec.template.spec.initContainers || [];
  const volumes = data.spec.template.spec.volumes || [];

  // --- Helper Functions ---

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

  // --- Container Management ---

  const addContainer = () => {
    const newContainer: Container = {
      name: `container-${containers.length + 1}`,
      image: 'nginx:1.25',
      imagePullPolicy: 'Always',
      ports: [{ containerPort: 80 }],
      env: [],
      lifecycle: {},
      volumeMounts: []
    };
    updateTemplateSpec('containers', [...containers, newContainer]);
  };

  const removeContainer = (idx: number) => {
    if (containers.length <= 1) return;
    updateTemplateSpec('containers', containers.filter((_, i) => i !== idx));
  };

  const updateContainer = (idx: number, field: string, value: any) => {
    const newContainers = [...containers];
    newContainers[idx] = { ...newContainers[idx], [field]: value };
    updateTemplateSpec('containers', newContainers);
  };

  const updateResources = (cIdx: number, type: 'requests' | 'limits', key: 'cpu' | 'memory', value: string) => {
    const container = containers[cIdx];
    const currentResources = container.resources || {};
    const typeObj = currentResources[type] || { cpu: '', memory: '' };
    
    const newResources = {
      ...currentResources,
      [type]: {
        ...typeObj,
        [key]: value
      }
    };
    updateContainer(cIdx, 'resources', newResources);
  };

  // --- Probe Logic ---

  const updateProbe = (cIdx: number, probeType: 'livenessProbe' | 'readinessProbe', field: string, value: any) => {
    const container = containers[cIdx];
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
         const newContainer = { ...container };
         delete newContainer[probeType];
         const newContainers = [...containers];
         newContainers[cIdx] = newContainer;
         updateTemplateSpec('containers', newContainers);
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

    updateContainer(cIdx, probeType, newProbe);
  };

  // --- Environment Variables Logic ---

  const addEnvVar = (cIdx: number) => {
    const name = newEnvNames[cIdx];
    if (!name) {
      alert(t.deploy.alertEnvName);
      return;
    }
    
    const type = newEnvTypes[cIdx] || 'value';
    const newEnv: EnvVar = { name };

    if (type === 'value') {
      newEnv.value = newEnvValues[cIdx] || '';
    } else if (type === 'configMap') {
      newEnv.valueFrom = {
        configMapKeyRef: { name: newEnvRefNames[cIdx] || '', key: newEnvRefKeys[cIdx] || '' }
      };
    } else if (type === 'secret') {
      newEnv.valueFrom = {
        secretKeyRef: { name: newEnvRefNames[cIdx] || '', key: newEnvRefKeys[cIdx] || '' }
      };
    } else if (type === 'fieldRef') {
      newEnv.valueFrom = {
        fieldRef: { fieldPath: newEnvFieldPaths[cIdx] || '' }
      };
    }

    const currentEnv = containers[cIdx].env || [];
    updateContainer(cIdx, 'env', [...currentEnv, newEnv]);
    
    // Reset per-container state
    setNewEnvNames({ ...newEnvNames, [cIdx]: '' });
    setNewEnvValues({ ...newEnvValues, [cIdx]: '' });
    setNewEnvRefNames({ ...newEnvRefNames, [cIdx]: '' });
    setNewEnvRefKeys({ ...newEnvRefKeys, [cIdx]: '' });
    setNewEnvFieldPaths({ ...newEnvFieldPaths, [cIdx]: '' });
  };

  const removeEnvVar = (cIdx: number, eIdx: number) => {
    const currentEnv = containers[cIdx].env || [];
    updateContainer(cIdx, 'env', currentEnv.filter((_, i) => i !== eIdx));
  };

  // --- Volumes Logic ---
  
  const addVolume = () => {
    if (!newVolName) {
      alert(t.deploy.alertVolName);
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

  // --- Volume Mounts Logic ---

  const addVolumeMount = (cIdx: number) => {
    const name = newMountNames[cIdx];
    const path = newMountPaths[cIdx];
    if (!name || !path) {
      alert(t.deploy.alertMount);
      return;
    }
    const currentMounts = containers[cIdx].volumeMounts || [];
    updateContainer(cIdx, 'volumeMounts', [...currentMounts, { 
      name, 
      mountPath: path,
      readOnly: newMountReadOnlys[cIdx] ? true : undefined
    }]);
    setNewMountNames({ ...newMountNames, [cIdx]: '' });
    setNewMountPaths({ ...newMountPaths, [cIdx]: '' });
    setNewMountReadOnlys({ ...newMountReadOnlys, [cIdx]: false });
  };

  const removeVolumeMount = (cIdx: number, mIdx: number) => {
    const currentMounts = containers[cIdx].volumeMounts || [];
    updateContainer(cIdx, 'volumeMounts', currentMounts.filter((_, i) => i !== mIdx));
  };

  // --- Lifecycle Logic ---

  const updateLifecycle = (cIdx: number, type: 'postStart' | 'preStop', commandStr: string) => {
    const container = containers[cIdx];
    const currentLifecycle = container.lifecycle || {};
    
    if (!commandStr.trim()) {
      const newLifecycle = { ...currentLifecycle };
      delete newLifecycle[type];
      updateContainer(cIdx, 'lifecycle', newLifecycle);
      return;
    }

    const commandArray = commandStr.split(' ').filter(s => s.length > 0);
    updateContainer(cIdx, 'lifecycle', {
      ...currentLifecycle,
      [type]: { exec: { command: commandArray } }
    });
  };

  const renderProbeForm = (cIdx: number, probeKey: 'livenessProbe' | 'readinessProbe', title: string) => {
    const container = containers[cIdx];
    const probe = container[probeKey];
    const type = probe?.httpGet ? 'http' : probe?.tcpSocket ? 'tcp' : probe?.exec ? 'exec' : 'none';
    
    return (
      <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
         <div className="flex items-center gap-2 mb-3">
             {probeKey === 'livenessProbe' ? <HeartPulse size={16} className="text-red-500"/> : <PlayCircle size={16} className="text-green-500"/>}
             <h4 className="font-medium text-slate-800">{title}</h4>
         </div>
         <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
               <Label>{t.deploy.probeType}</Label>
               <Select value={type} onChange={(e) => updateProbe(cIdx, probeKey, 'type', e.target.value)}>
                  <option value="none">None</option>
                  <option value="http">HTTP Get</option>
                  <option value="tcp">TCP Socket</option>
                  <option value="exec">Exec Command</option>
               </Select>
            </div>
         </div>
         {type !== 'none' && (
             <div className="space-y-4">
                 <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div>
                        <Label>{t.deploy.initialDelay}</Label>
                        <Input type="number" value={probe?.initialDelaySeconds || ''} onChange={(e) => updateProbe(cIdx, probeKey, 'initialDelaySeconds', parseInt(e.target.value))} />
                    </div>
                    <div>
                        <Label>{t.deploy.period}</Label>
                        <Input type="number" value={probe?.periodSeconds || ''} onChange={(e) => updateProbe(cIdx, probeKey, 'periodSeconds', parseInt(e.target.value))} />
                    </div>
                    <div>
                        <Label>{t.deploy.timeout}</Label>
                        <Input type="number" value={probe?.timeoutSeconds || ''} onChange={(e) => updateProbe(cIdx, probeKey, 'timeoutSeconds', parseInt(e.target.value))} />
                    </div>
                    <div>
                        <Label>{t.deploy.failureThreshold}</Label>
                        <Input type="number" value={probe?.failureThreshold || ''} onChange={(e) => updateProbe(cIdx, probeKey, 'failureThreshold', parseInt(e.target.value))} />
                    </div>
                 </div>
                 <div className="border-t border-slate-200 pt-3">
                     {type === 'http' && (
                        <div className="grid grid-cols-2 gap-4">
                            <div><Label>{t.deploy.httpPath}</Label><Input value={probe?.httpGet?.path || '/'} onChange={(e) => updateProbe(cIdx, probeKey, 'httpGet.path', e.target.value)} /></div>
                            <div><Label>{t.deploy.httpPort}</Label><Input type="number" value={probe?.httpGet?.port || 80} onChange={(e) => updateProbe(cIdx, probeKey, 'httpGet.port', parseInt(e.target.value))} /></div>
                        </div>
                     )}
                     {type === 'tcp' && (
                        <div><Label>{t.deploy.tcpPort}</Label><Input type="number" value={probe?.tcpSocket?.port || 80} onChange={(e) => updateProbe(cIdx, probeKey, 'tcpSocket.port', parseInt(e.target.value))} /></div>
                     )}
                     {type === 'exec' && (
                        <div><Label>{t.deploy.execCommand}</Label><Input placeholder='e.g. cat /tmp/healthy' value={(probe?.exec?.command || []).join(' ')} onChange={(e) => updateProbe(cIdx, probeKey, 'exec.command', e.target.value.split(' ').filter(s => s.length > 0))} /></div>
                     )}
                 </div>
             </div>
         )}
      </div>
    );
  };

  return (
    <div className="space-y-2">
      <CollapsibleSection title={t.common.metadata} icon={<Box size={20} />} defaultOpen={true}>
        <div className="grid grid-cols-2 gap-4">
          <div><Label>{t.common.name}</Label><Input value={data.metadata.name} onChange={(e) => updateMeta('name', e.target.value)} /></div>
          <div><Label>{t.common.namespace}</Label><Input value={data.metadata.namespace} onChange={(e) => updateMeta('namespace', e.target.value)} /></div>
        </div>
      </CollapsibleSection>

      <CollapsibleSection title={t.deploy.specs} icon={<Layers size={20} />} defaultOpen={true}>
        <div className="grid grid-cols-2 gap-4">
          <div><Label>{t.deploy.replicas}</Label><Input type="number" min={0} value={data.spec.replicas} onChange={(e) => updateSpec('replicas', parseInt(e.target.value) || 1)} /></div>
        </div>
      </CollapsibleSection>

      {/* --- Main Containers List --- */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2 px-2">
          <div className="flex items-center gap-2 text-slate-800 font-semibold">
            <Cpu size={20} className="text-blue-600" />
            {t.deploy.containers}
          </div>
          <button 
            type="button" 
            onClick={addContainer}
            className="flex items-center gap-1 text-xs bg-blue-600 text-white px-2 py-1 rounded hover:bg-blue-700 transition-colors"
          >
            <Plus size={14} /> {t.deploy.addContainer}
          </button>
        </div>

        <div className="space-y-4">
          {containers.map((container, cIdx) => (
            <CollapsibleSection 
              key={cIdx} 
              title={container.name || `Container ${cIdx + 1}`} 
              icon={<Cpu size={18} />} 
              defaultOpen={cIdx === 0}
            >
              <div className="relative pt-6">
                {containers.length > 1 && (
                  <button 
                    onClick={() => removeContainer(cIdx)}
                    className="absolute top-0 right-0 p-1.5 text-slate-400 hover:text-red-500 transition-colors"
                    title={t.common.delete}
                  >
                    <Trash2 size={18} />
                  </button>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  <div><Label>{t.deploy.containerName}</Label><Input value={container.name} onChange={(e) => updateContainer(cIdx, 'name', e.target.value)} /></div>
                  <div><Label>{t.deploy.image}</Label><Input value={container.image} onChange={(e) => updateContainer(cIdx, 'image', e.target.value)} /></div>
                  <div>
                    <Label>{t.deploy.pullPolicy}</Label>
                    <Select value={container.imagePullPolicy} onChange={(e) => updateContainer(cIdx, 'imagePullPolicy', e.target.value)}>
                      <option value="Always">Always</option><option value="IfNotPresent">IfNotPresent</option><option value="Never">Never</option>
                    </Select>
                  </div>
                  <div>
                    <Label>{t.common.port}</Label>
                    <Input type="number" value={(container.ports || [])[0]?.containerPort} onChange={(e) => {
                      const newPorts = [...(container.ports || [])];
                      newPorts[0] = { containerPort: parseInt(e.target.value) || 80 };
                      updateContainer(cIdx, 'ports', newPorts);
                    }} />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-6">
                   <div><Label>{t.deploy.containerCommand}</Label><Input placeholder='e.g. /bin/sh -c' value={(container.command || []).join(' ')} onChange={(e) => updateContainer(cIdx, 'command', e.target.value.split(' ').filter(s => s.length > 0))} /></div>
                   <div><Label>{t.deploy.containerArgs}</Label><Input placeholder='e.g. "echo hello"' value={(container.args || []).join(' ')} onChange={(e) => updateContainer(cIdx, 'args', e.target.value.split(' ').filter(s => s.length > 0))} /></div>
                </div>

                {/* --- Sub-sections for this specific container --- */}
                <div className="space-y-6">
                  <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
                    <h4 className="text-sm font-semibold text-slate-700 mb-3 flex items-center gap-2"><Activity size={16} />{t.deploy.resources}</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="grid grid-cols-2 gap-3">
                        <div className="col-span-2 text-xs text-slate-500 font-medium uppercase tracking-tight">{t.deploy.requests}</div>
                        <div><Label>{t.deploy.cpu}</Label><Input placeholder="100m" value={container.resources?.requests?.cpu || ''} onChange={(e) => updateResources(cIdx, 'requests', 'cpu', e.target.value)} /></div>
                        <div><Label>{t.deploy.memory}</Label><Input placeholder="128Mi" value={container.resources?.requests?.memory || ''} onChange={(e) => updateResources(cIdx, 'requests', 'memory', e.target.value)} /></div>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div className="col-span-2 text-xs text-slate-500 font-medium uppercase tracking-tight">{t.deploy.limits}</div>
                        <div><Label>{t.deploy.cpu}</Label><Input placeholder="500m" value={container.resources?.limits?.cpu || ''} onChange={(e) => updateResources(cIdx, 'limits', 'cpu', e.target.value)} /></div>
                        <div><Label>{t.deploy.memory}</Label><Input placeholder="512Mi" value={container.resources?.limits?.memory || ''} onChange={(e) => updateResources(cIdx, 'limits', 'memory', e.target.value)} /></div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
                    <h4 className="text-sm font-semibold text-slate-700 mb-3 flex items-center gap-2"><Key size={16} />{t.deploy.envVars}</h4>
                    <div className="space-y-2">
                      {container.env?.map((env, eIdx) => (
                        <div key={eIdx} className="flex gap-2 items-center bg-white p-2 border rounded shadow-sm text-xs">
                          <span className="font-bold text-slate-700">{env.name}</span>
                          <span className="flex-1 truncate text-slate-500">
                            {env.value || env.valueFrom?.configMapKeyRef?.key || '...'}
                          </span>
                          <button type="button" onClick={() => removeEnvVar(cIdx, eIdx)} className="text-red-500"><Trash2 size={14}/></button>
                        </div>
                      ))}
                      <div className="flex gap-2 items-end bg-slate-100 p-2 rounded border border-slate-200">
                        <div className="flex-1">
                          <Input placeholder="Key" value={newEnvNames[cIdx] || ''} onChange={(e) => setNewEnvNames({ ...newEnvNames, [cIdx]: e.target.value })} />
                        </div>
                        <div className="flex-1">
                          <Input placeholder="Value" value={newEnvValues[cIdx] || ''} onChange={(e) => setNewEnvValues({ ...newEnvValues, [cIdx]: e.target.value })} />
                        </div>
                        <button type="button" onClick={() => addEnvVar(cIdx)} className="bg-blue-600 text-white p-2 rounded"><Plus size={16}/></button>
                      </div>
                    </div>
                  </div>

                  <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
                    <h4 className="text-sm font-semibold text-slate-700 mb-3 flex items-center gap-2"><HardDrive size={16} />{t.deploy.mounts}</h4>
                    <div className="space-y-2">
                       {container.volumeMounts?.map((mount, mIdx) => (
                         <div key={mIdx} className="flex gap-2 items-center bg-white p-2 border rounded shadow-sm text-xs">
                            <span className="font-bold">{mount.name}</span> → <span>{mount.mountPath}</span>
                            <button type="button" onClick={() => removeVolumeMount(cIdx, mIdx)} className="ml-auto text-red-500"><Trash2 size={14}/></button>
                         </div>
                       ))}
                       <div className="flex gap-2 items-end bg-slate-100 p-2 rounded border border-slate-200">
                          <div className="flex-1">
                            <Input list={`vol-list-${cIdx}`} placeholder="Vol Name" value={newMountNames[cIdx] || ''} onChange={(e) => setNewMountNames({ ...newMountNames, [cIdx]: e.target.value })} />
                            <datalist id={`vol-list-${cIdx}`}>{volumes.map(v => <option key={v.name} value={v.name} />)}</datalist>
                          </div>
                          <div className="flex-1">
                            <Input placeholder="/path" value={newMountPaths[cIdx] || ''} onChange={(e) => setNewMountPaths({ ...newMountPaths, [cIdx]: e.target.value })} />
                          </div>
                          <button type="button" onClick={() => addVolumeMount(cIdx)} className="bg-blue-600 text-white p-2 rounded"><Plus size={16}/></button>
                       </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    {renderProbeForm(cIdx, 'livenessProbe', t.deploy.livenessProbe)}
                    {renderProbeForm(cIdx, 'readinessProbe', t.deploy.readinessProbe)}
                  </div>
                </div>
              </div>
            </CollapsibleSection>
          ))}
        </div>
      </div>

      <CollapsibleSection title={t.deploy.volumes} icon={<Database size={20} />}>
        <div className="space-y-3">
          {volumes.map((vol, idx) => (
             <div key={idx} className="flex gap-2 items-center bg-slate-50 p-3 border rounded text-sm">
                <div className="flex-1 font-semibold">{vol.name}</div>
                <button type="button" onClick={() => removeVolume(idx)} className="text-red-500"><Trash2 size={16} /></button>
             </div>
          ))}
          <div className="bg-slate-100 p-3 rounded-lg border border-slate-200">
             <div className="grid grid-cols-2 gap-2 mb-2">
                <div><Label>{t.deploy.volName}</Label><Input value={newVolName} onChange={(e) => setNewVolName(e.target.value)} /></div>
                <div>
                   <Label>{t.deploy.volType}</Label>
                   <Select value={newVolType} onChange={(e) => setNewVolType(e.target.value as any)}>
                      <option value="pvc">PVC</option><option value="configMap">ConfigMap</option><option value="secret">Secret</option><option value="emptyDir">EmptyDir</option><option value="hostPath">HostPath</option>
                   </Select>
                </div>
             </div>
             <button type="button" onClick={addVolume} className="w-full py-2 bg-blue-600 text-white rounded hover:bg-blue-700 flex items-center justify-center gap-2 text-sm"><Plus size={16} /> {t.deploy.addVol}</button>
          </div>
        </div>
      </CollapsibleSection>

      <CollapsibleSection title={t.deploy.security} icon={<Shield size={20} />}>
        <div className="space-y-3">
          <Label>{t.deploy.pullSecret}</Label>
          <div className="grid grid-cols-[1fr_auto] gap-2 items-end">
            <Input value={newSecretName} onChange={(e) => setNewSecretName(e.target.value)} />
            <button type="button" onClick={() => {
              const current = data.spec.template.spec.imagePullSecrets || [];
              updateTemplateSpec('imagePullSecrets', [...current, { name: newSecretName }]);
              setNewSecretName('');
            }} className="px-3 py-2 bg-blue-600 text-white rounded transition-colors h-[38px] flex items-center justify-center"><Plus size={18} /></button>
          </div>
        </div>
      </CollapsibleSection>
    </div>
  );
};
