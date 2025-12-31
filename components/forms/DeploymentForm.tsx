
import React, { useState, useEffect } from 'react';
import { DeploymentResource, EnvVar, EnvFromSource, Volume, Container, Probe } from '../../types';
import { Input, Label, Select, CollapsibleSection } from '../FormComponents';
import { Box, Layers, Cpu, Plus, Trash2, Key, Shield, PlayCircle, Activity, HardDrive, Database, HeartPulse, Zap } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';

interface Props {
  data: DeploymentResource;
  onChange: (data: DeploymentResource) => void;
}

const ResourceInput = ({ 
  value = '', 
  onChange, 
  type 
}: { 
  value?: string, 
  onChange: (val: string) => void, 
  type: 'cpu' | 'memory' 
}) => {
  const hasValue = value !== undefined && value !== '';
  // Regex to match number and optional suffix
  const match = (value || '').match(/^([0-9.]+)([a-zA-Z]*)$/);
  const numericVal = match ? match[1] : (hasValue && !isNaN(parseFloat(value!)) ? value : '');
  const extractedSuffix = match ? match[2] : '';

  const defaultUnit = type === 'cpu' ? 'm' : 'Mi';
  // Use state to track preferred unit even when input is empty.
  // If value exists, use its suffix. If not, use default.
  const [unit, setUnit] = useState(hasValue ? extractedSuffix : defaultUnit);

  // Sync state if external value has a specific unit that differs from local state
  useEffect(() => {
    if (hasValue && extractedSuffix !== unit) {
      setUnit(extractedSuffix);
    }
  }, [extractedSuffix, hasValue, unit]);

  const handleChangeNum = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    if (val === '') {
      onChange('');
    } else {
      onChange(`${val}${unit}`);
    }
  };

  const handleChangeUnit = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newUnit = e.target.value;
    setUnit(newUnit);
    if (numericVal) {
      onChange(`${numericVal}${newUnit}`);
    }
  };

  return (
    <div className="flex w-full">
      <input
        type="number"
        min="0"
        step={type === 'cpu' ? '0.1' : '1'}
        value={numericVal}
        onChange={handleChangeNum}
        placeholder={type === 'cpu' ? '100' : '128'}
        className="flex-1 min-w-0 w-full rounded-l-md border border-r-0 border-slate-300 bg-white px-3 py-2 text-sm placeholder:text-slate-400 focus:z-10 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
      />
      <select
        value={unit}
        onChange={handleChangeUnit}
        className="w-20 rounded-r-md border border-slate-300 bg-slate-50 px-2 py-2 text-sm text-slate-600 focus:z-10 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all cursor-pointer"
      >
        {type === 'cpu' ? (
          <>
            <option value="m">m</option>
            <option value="">Core</option>
          </>
        ) : (
          <>
            <option value="Mi">Mi</option>
            <option value="Gi">Gi</option>
            <option value="Ti">Ti</option>
            <option value="Ki">Ki</option>
            <option value="">B</option>
          </>
        )}
      </select>
    </div>
  );
};

export const DeploymentForm: React.FC<Props> = ({ data, onChange }) => {
  const { t } = useLanguage();
  
  // Temporary state for "Add" sections
  const [newEnvNames, setNewEnvNames] = useState<Record<string, string>>({});
  const [newEnvTypes, setNewEnvTypes] = useState<Record<string, 'value' | 'configMap'>>({});
  const [newEnvValues, setNewEnvValues] = useState<Record<string, string>>({});
  const [newEnvCmNames, setNewEnvCmNames] = useState<Record<string, string>>({});
  const [newEnvCmKeys, setNewEnvCmKeys] = useState<Record<string, string>>({});
  
  const [newEnvFromCmNames, setNewEnvFromCmNames] = useState<Record<string, string>>({});

  const [newMountNames, setNewMountNames] = useState<Record<string, string>>({});
  const [newMountPaths, setNewMountPaths] = useState<Record<string, string>>({});
  const [newMountReadOnlys, setNewMountReadOnlys] = useState<Record<string, boolean>>({});

  // Volume State (Pod level)
  const [newVolName, setNewVolName] = useState('');
  const [newVolType, setNewVolType] = useState<'pvc' | 'configMap' | 'secret' | 'emptyDir' | 'hostPath'>('pvc');
  const [newVolClaim, setNewVolClaim] = useState('');
  const [newVolRefName, setNewVolRefName] = useState('');
  const [newVolPath, setNewVolPath] = useState('');
  
  const [newSecretName, setNewSecretName] = useState('');

  const containers = data.spec.template.spec.containers || [];
  const initContainers = data.spec.template.spec.initContainers || [];
  const volumes = data.spec.template.spec.volumes || [];
  const pullSecrets = data.spec.template.spec.imagePullSecrets || [];

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

  const addContainer = (type: 'containers' | 'initContainers') => {
    const list = data.spec.template.spec[type] || [];
    const newContainer: Container = {
      name: `${type === 'initContainers' ? 'init-' : ''}container-${list.length + 1}`,
      image: 'busybox:1.36',
      imagePullPolicy: 'Always',
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

  // --- Probe Logic ---

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

  // --- Environment Variables Logic ---

  const addEnvVar = (type: 'containers' | 'initContainers', cIdx: number) => {
    const id = `${type}-${cIdx}`;
    const name = newEnvNames[id];
    const envType = newEnvTypes[id] || 'value';

    if (!name) {
      alert(t.deploy.alertEnvName);
      return;
    }

    let newEnv: EnvVar = { name };
    if (envType === 'value') {
       newEnv.value = newEnvValues[id] || '';
    } else {
       newEnv.valueFrom = {
         configMapKeyRef: {
           name: newEnvCmNames[id] || '',
           key: newEnvCmKeys[id] || ''
         }
       };
    }
    
    const list = [...(data.spec.template.spec[type] || [])];
    const container = list[cIdx];
    container.env = [...(container.env || []), newEnv];
    
    updateTemplateSpec(type, list);
    
    // Reset state
    setNewEnvNames({ ...newEnvNames, [id]: '' });
    setNewEnvValues({ ...newEnvValues, [id]: '' });
    setNewEnvCmNames({ ...newEnvCmNames, [id]: '' });
    setNewEnvCmKeys({ ...newEnvCmKeys, [id]: '' });
  };

  const removeEnvVar = (type: 'containers' | 'initContainers', cIdx: number, eIdx: number) => {
    const list = [...(data.spec.template.spec[type] || [])];
    const container = list[cIdx];
    container.env = (container.env || []).filter((_, i) => i !== eIdx);
    updateTemplateSpec(type, list);
  };

  const addEnvFrom = (type: 'containers' | 'initContainers', cIdx: number) => {
    const id = `${type}-${cIdx}`;
    const name = newEnvFromCmNames[id];
    if (!name) return;

    const list = [...(data.spec.template.spec[type] || [])];
    const container = list[cIdx];
    container.envFrom = [...(container.envFrom || []), { configMapRef: { name } }];

    updateTemplateSpec(type, list);
    setNewEnvFromCmNames({ ...newEnvFromCmNames, [id]: '' });
  };

  const removeEnvFrom = (type: 'containers' | 'initContainers', cIdx: number, eIdx: number) => {
    const list = [...(data.spec.template.spec[type] || [])];
    const container = list[cIdx];
    container.envFrom = (container.envFrom || []).filter((_, i) => i !== eIdx);
    updateTemplateSpec(type, list);
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

  const addVolumeMount = (type: 'containers' | 'initContainers', cIdx: number) => {
    const id = `${type}-${cIdx}`;
    const name = newMountNames[id];
    const path = newMountPaths[id];
    if (!name || !path) {
      alert(t.deploy.alertMount);
      return;
    }
    const list = [...(data.spec.template.spec[type] || [])];
    const container = list[cIdx];
    container.volumeMounts = [...(container.volumeMounts || []), { 
      name, 
      mountPath: path,
      readOnly: newMountReadOnlys[id] ? true : undefined
    }];
    
    updateTemplateSpec(type, list);
    
    setNewMountNames({ ...newMountNames, [id]: '' });
    setNewMountPaths({ ...newMountPaths, [id]: '' });
    setNewMountReadOnlys({ ...newMountReadOnlys, [id]: false });
  };

  const removeVolumeMount = (type: 'containers' | 'initContainers', cIdx: number, mIdx: number) => {
    const list = [...(data.spec.template.spec[type] || [])];
    const container = list[cIdx];
    container.volumeMounts = (container.volumeMounts || []).filter((_, i) => i !== mIdx);
    updateTemplateSpec(type, list);
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

  const renderContainer = (container: Container, cIdx: number, type: 'containers' | 'initContainers') => {
    const id = `${type}-${cIdx}`;
    const list = data.spec.template.spec[type] || [];
    const currentEnvType = newEnvTypes[id] || 'value';
    
    return (
      <CollapsibleSection 
        key={id} 
        title={container.name || `${type === 'initContainers' ? 'Init ' : ''}Container ${cIdx + 1}`} 
        icon={type === 'initContainers' ? <Zap size={18} className="text-amber-500" /> : <Cpu size={18} />} 
        defaultOpen={type === 'containers' && cIdx === 0}
      >
        <div className="relative pt-6">
          {(type === 'initContainers' || list.length > 1) && (
            <button 
              onClick={() => removeContainer(type, cIdx)}
              className="absolute top-0 right-0 p-1.5 text-slate-400 hover:text-red-500 transition-colors"
              title={t.common.delete}
            >
              <Trash2 size={18} />
            </button>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div><Label>{t.deploy.containerName}</Label><Input value={container.name} onChange={(e) => updateContainerField(type, cIdx, 'name', e.target.value)} /></div>
            <div><Label>{t.deploy.image}</Label><Input value={container.image} onChange={(e) => updateContainerField(type, cIdx, 'image', e.target.value)} /></div>
            <div>
              <Label>{t.deploy.pullPolicy}</Label>
              <Select value={container.imagePullPolicy} onChange={(e) => updateContainerField(type, cIdx, 'imagePullPolicy', e.target.value)}>
                <option value="Always">Always</option><option value="IfNotPresent">IfNotPresent</option><option value="Never">Never</option>
              </Select>
            </div>
            {type === 'containers' && (
              <div>
                <Label>{t.common.port}</Label>
                <Input type="number" value={(container.ports || [])[0]?.containerPort} onChange={(e) => {
                  const newPorts = [...(container.ports || [])];
                  newPorts[0] = { containerPort: parseInt(e.target.value) || 80 };
                  updateContainerField(type, cIdx, 'ports', newPorts);
                }} />
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4 mb-6">
             <div><Label>{t.deploy.containerCommand}</Label><Input placeholder='e.g. /bin/sh -c' value={(container.command || []).join(' ')} onChange={(e) => updateContainerField(type, cIdx, 'command', e.target.value.split(' ').filter(s => s.length > 0))} /></div>
             <div><Label>{t.deploy.containerArgs}</Label><Input placeholder='e.g. "echo hello"' value={(container.args || []).join(' ')} onChange={(e) => updateContainerField(type, cIdx, 'args', e.target.value.split(' ').filter(s => s.length > 0))} /></div>
          </div>

          <div className="space-y-6">
            {/* Resources */}
            <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
              <h4 className="text-sm font-semibold text-slate-700 mb-3 flex items-center gap-2"><Activity size={16} />{t.deploy.resources}</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="grid grid-cols-2 gap-3">
                  <div className="col-span-2 text-xs text-slate-500 font-medium uppercase tracking-tight">{t.deploy.requests}</div>
                  <div>
                    <Label>{t.deploy.cpu}</Label>
                    <ResourceInput 
                      type="cpu" 
                      value={container.resources?.requests?.cpu} 
                      onChange={(val) => updateResources(type, cIdx, 'requests', 'cpu', val)} 
                    />
                  </div>
                  <div>
                    <Label>{t.deploy.memory}</Label>
                    <ResourceInput 
                      type="memory" 
                      value={container.resources?.requests?.memory} 
                      onChange={(val) => updateResources(type, cIdx, 'requests', 'memory', val)} 
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="col-span-2 text-xs text-slate-500 font-medium uppercase tracking-tight">{t.deploy.limits}</div>
                  <div>
                    <Label>{t.deploy.cpu}</Label>
                    <ResourceInput 
                      type="cpu" 
                      value={container.resources?.limits?.cpu} 
                      onChange={(val) => updateResources(type, cIdx, 'limits', 'cpu', val)} 
                    />
                  </div>
                  <div>
                    <Label>{t.deploy.memory}</Label>
                    <ResourceInput 
                      type="memory" 
                      value={container.resources?.limits?.memory} 
                      onChange={(val) => updateResources(type, cIdx, 'limits', 'memory', val)} 
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Env Vars */}
            <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
              <h4 className="text-sm font-semibold text-slate-700 mb-3 flex items-center gap-2"><Key size={16} />{t.deploy.envVars}</h4>
              
              {/* Existing Env Vars */}
              <div className="space-y-2 mb-4">
                {container.env?.map((env, eIdx) => (
                  <div key={eIdx} className="flex gap-2 items-center bg-white p-2 border rounded shadow-sm text-xs">
                    <span className="font-bold text-slate-700 min-w-[80px]">{env.name}</span>
                    <span className="text-slate-400">→</span>
                    {env.value !== undefined ? (
                       <span className="flex-1 truncate text-slate-600 font-mono">{env.value}</span>
                    ) : env.valueFrom?.configMapKeyRef ? (
                       <span className="flex-1 truncate text-blue-600 flex items-center gap-1">
                          <span className="bg-blue-50 px-1 rounded border border-blue-100">CM</span> 
                          {env.valueFrom.configMapKeyRef.name} : {env.valueFrom.configMapKeyRef.key}
                       </span>
                    ) : (
                       <span className="flex-1 text-slate-400 italic">other ref</span>
                    )}
                    <button type="button" onClick={() => removeEnvVar(type, cIdx, eIdx)} className="text-red-500"><Trash2 size={14}/></button>
                  </div>
                ))}
              </div>

              {/* Add New Env Var */}
              <div className="bg-slate-100 p-2 rounded border border-slate-200 space-y-2">
                 <div className="flex gap-2">
                    <div className="flex-1">
                      <Input placeholder="Variable Name" value={newEnvNames[id] || ''} onChange={(e) => setNewEnvNames({ ...newEnvNames, [id]: e.target.value })} />
                    </div>
                    <div className="w-1/3">
                      <Select 
                        value={currentEnvType} 
                        onChange={(e) => setNewEnvTypes({ ...newEnvTypes, [id]: e.target.value as any })}
                      >
                         <option value="value">{t.deploy.envValType}</option>
                         <option value="configMap">{t.deploy.envRefType} (CM)</option>
                      </Select>
                    </div>
                 </div>
                 
                 <div className="flex gap-2 items-center">
                    {currentEnvType === 'value' ? (
                       <div className="flex-1">
                         <Input placeholder="Value" value={newEnvValues[id] || ''} onChange={(e) => setNewEnvValues({ ...newEnvValues, [id]: e.target.value })} />
                       </div>
                    ) : (
                       <>
                         <div className="flex-1">
                           <Input placeholder={t.deploy.cmName} value={newEnvCmNames[id] || ''} onChange={(e) => setNewEnvCmNames({ ...newEnvCmNames, [id]: e.target.value })} />
                         </div>
                         <div className="flex-1">
                           <Input placeholder={t.deploy.cmKey} value={newEnvCmKeys[id] || ''} onChange={(e) => setNewEnvCmKeys({ ...newEnvCmKeys, [id]: e.target.value })} />
                         </div>
                       </>
                    )}
                    <button type="button" onClick={() => addEnvVar(type, cIdx)} className="bg-blue-600 text-white p-2 rounded h-[38px] w-[38px] flex items-center justify-center hover:bg-blue-700 transition-colors"><Plus size={16}/></button>
                 </div>
              </div>

              {/* Env From (Bulk Load) */}
              <div className="mt-4 pt-4 border-t border-slate-200">
                <h5 className="text-xs font-semibold text-slate-500 mb-2 uppercase tracking-tight">{t.deploy.envFrom}</h5>
                <div className="space-y-2">
                   {container.envFrom?.map((ef, efIdx) => ef.configMapRef && (
                      <div key={efIdx} className="flex gap-2 items-center bg-white p-2 border rounded shadow-sm text-xs">
                         <span className="font-bold text-blue-600 bg-blue-50 px-1 rounded border border-blue-100">CM</span>
                         <span className="flex-1 font-mono text-slate-700">{ef.configMapRef.name}</span>
                         <button type="button" onClick={() => removeEnvFrom(type, cIdx, efIdx)} className="text-red-500"><Trash2 size={14}/></button>
                      </div>
                   ))}
                   <div className="flex gap-2">
                      <Input placeholder={t.deploy.cmName} value={newEnvFromCmNames[id] || ''} onChange={(e) => setNewEnvFromCmNames({ ...newEnvFromCmNames, [id]: e.target.value })} />
                      <button type="button" onClick={() => addEnvFrom(type, cIdx)} className="bg-slate-600 text-white p-2 rounded h-[38px] w-[38px] flex items-center justify-center hover:bg-slate-700 transition-colors"><Plus size={16}/></button>
                   </div>
                </div>
              </div>
            </div>

            {/* Volume Mounts */}
            <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
              <h4 className="text-sm font-semibold text-slate-700 mb-3 flex items-center gap-2"><HardDrive size={16} />{t.deploy.mounts}</h4>
              <div className="space-y-2">
                 {container.volumeMounts?.map((mount, mIdx) => (
                   <div key={mIdx} className="flex gap-2 items-center bg-white p-2 border rounded shadow-sm text-xs">
                      <span className="font-bold">{mount.name}</span> → <span>{mount.mountPath}</span>
                      <button type="button" onClick={() => removeVolumeMount(type, cIdx, mIdx)} className="ml-auto text-red-500"><Trash2 size={14}/></button>
                   </div>
                 ))}
                 <div className="flex gap-2 items-end bg-slate-100 p-2 rounded border border-slate-200">
                    <div className="flex-1">
                      <Input list={`vol-list-${id}`} placeholder="Vol Name" value={newMountNames[id] || ''} onChange={(e) => setNewMountNames({ ...newMountNames, [id]: e.target.value })} />
                      <datalist id={`vol-list-${id}`}>{volumes.map(v => <option key={v.name} value={v.name} />)}</datalist>
                    </div>
                    <div className="flex-1">
                      <Input placeholder="/path" value={newMountPaths[id] || ''} onChange={(e) => setNewMountPaths({ ...newMountPaths, [id]: e.target.value })} />
                    </div>
                    <button type="button" onClick={() => addVolumeMount(type, cIdx)} className="bg-blue-600 text-white p-2 rounded"><Plus size={16}/></button>
                 </div>
              </div>
            </div>

            {/* Probes - Only for main containers */}
            {type === 'containers' && (
              <div className="space-y-4">
                {renderProbeForm(cIdx, 'livenessProbe', t.deploy.livenessProbe)}
                {renderProbeForm(cIdx, 'readinessProbe', t.deploy.readinessProbe)}
              </div>
            )}
          </div>
        </div>
      </CollapsibleSection>
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

      {/* --- Init Containers --- */}
      <div className="mb-8 mt-4">
        <div className="flex items-center justify-between mb-2 px-2">
          <div className="flex items-center gap-2 text-slate-800 font-semibold">
            <Zap size={20} className="text-amber-500" />
            {t.deploy.initContainers}
          </div>
          <button 
            type="button" 
            onClick={() => addContainer('initContainers')}
            className="flex items-center gap-1 text-xs bg-amber-500 text-white px-2 py-1 rounded hover:bg-amber-600 transition-colors shadow-sm"
          >
            <Plus size={14} /> {t.deploy.addInitContainer}
          </button>
        </div>
        <div className="space-y-4">
          {initContainers.map((container, idx) => renderContainer(container, idx, 'initContainers'))}
          {initContainers.length === 0 && (
            <div className="text-xs text-slate-400 italic px-2 py-1">No init containers defined.</div>
          )}
        </div>
      </div>

      {/* --- Main Containers --- */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2 px-2">
          <div className="flex items-center gap-2 text-slate-800 font-semibold">
            <Cpu size={20} className="text-blue-600" />
            {t.deploy.containers}
          </div>
          <button 
            type="button" 
            onClick={() => addContainer('containers')}
            className="flex items-center gap-1 text-xs bg-blue-600 text-white px-2 py-1 rounded hover:bg-blue-700 transition-colors shadow-sm"
          >
            <Plus size={14} /> {t.deploy.addContainer}
          </button>
        </div>
        <div className="space-y-4">
          {containers.map((container, idx) => renderContainer(container, idx, 'containers'))}
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
          
          {/* Display existing pull secrets */}
          {pullSecrets.length > 0 && (
            <div className="space-y-2 mb-3">
              {pullSecrets.map((secret, idx) => (
                <div key={idx} className="flex gap-2 items-center bg-slate-50 p-2 border rounded text-xs">
                  <Key size={14} className="text-slate-400" />
                  <span className="flex-1 font-medium text-slate-700">{secret.name}</span>
                  <button 
                    type="button" 
                    onClick={() => {
                      const newSecrets = pullSecrets.filter((_, i) => i !== idx);
                      updateTemplateSpec('imagePullSecrets', newSecrets.length > 0 ? newSecrets : undefined);
                    }} 
                    className="text-red-500 hover:text-red-700 transition-colors"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Input to add new pull secret */}
          <div className="grid grid-cols-[1fr_auto] gap-2 items-end">
            <Input 
              placeholder="secret-name"
              value={newSecretName} 
              onChange={(e) => setNewSecretName(e.target.value)} 
            />
            <button 
              type="button" 
              onClick={() => {
                if (!newSecretName.trim()) return;
                const current = pullSecrets;
                updateTemplateSpec('imagePullSecrets', [...current, { name: newSecretName.trim() }]);
                setNewSecretName('');
              }} 
              className="px-3 py-2 bg-blue-600 text-white rounded transition-colors h-[38px] flex items-center justify-center"
            >
              <Plus size={18} />
            </button>
          </div>
        </div>
      </CollapsibleSection>
    </div>
  );
};
