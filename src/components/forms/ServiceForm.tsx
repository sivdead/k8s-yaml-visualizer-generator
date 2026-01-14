
import React, { useState, useMemo } from 'react';
import { ServiceResource, K8sResource, DeploymentResource, StatefulSetResource, DaemonSetResource } from '../../types';
import { Input, Label, Select, SectionTitle } from '../FormComponents';
import { Network, Activity, Plus, Trash2, Globe, Zap } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';
import { CommentSection } from './shared/CommentSection';
import { isDeployment, isStatefulSet, isDaemonSet } from '../../utils/typeGuards';

interface Props {
  data: ServiceResource;
  onChange: (data: ServiceResource) => void;
  /** 已保存的资源列表，用于智能关联 */
  savedResources?: K8sResource[];
}

/** 从工作负载中提取 template labels */
function getWorkloadLabels(resource: K8sResource): Record<string, string> | null {
  if (isDeployment(resource) || isStatefulSet(resource) || isDaemonSet(resource)) {
    return (resource as DeploymentResource | StatefulSetResource | DaemonSetResource).spec.template.metadata.labels;
  }
  return null;
}

export const ServiceForm: React.FC<Props> = ({ data, onChange, savedResources = [] }) => {
  const { t } = useLanguage();
  const [newIP, setNewIP] = useState('');

  // 获取所有可选择的工作负载及其 labels
  const workloadOptions = useMemo(() => {
    return savedResources
      .filter(r => isDeployment(r) || isStatefulSet(r) || isDaemonSet(r))
      .map(r => ({
        name: r.metadata.name,
        kind: r.kind,
        labels: getWorkloadLabels(r) || {},
      }))
      .filter(w => Object.keys(w.labels).length > 0);
  }, [savedResources]);

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

  const updatePort = (index: number, field: string, value: any) => {
    const newPorts = [...data.spec.ports];
    newPorts[index] = { ...newPorts[index], [field]: value };
    onChange({
      ...data,
      spec: { ...data.spec, ports: newPorts }
    });
  };

  const addPort = () => {
    const newPorts = [...data.spec.ports, { protocol: 'TCP', port: 80, targetPort: 80, name: `port-${data.spec.ports.length + 1}` }];
    onChange({
      ...data,
      spec: { ...data.spec, ports: newPorts }
    });
  };

  const removePort = (index: number) => {
    if (data.spec.ports.length <= 1) return; // Keep at least one port
    const newPorts = data.spec.ports.filter((_, i) => i !== index);
    onChange({
      ...data,
      spec: { ...data.spec, ports: newPorts }
    });
  };

  const addExternalIP = () => {
    if (!newIP.trim()) return;
    const currentIPs = data.spec.externalIPs || [];
    if (currentIPs.includes(newIP.trim())) return;

    updateSpec('externalIPs', [...currentIPs, newIP.trim()]);
    setNewIP('');
  };

  const removeExternalIP = (index: number) => {
    const currentIPs = data.spec.externalIPs || [];
    const newIPs = currentIPs.filter((_, i) => i !== index);
    updateSpec('externalIPs', newIPs.length > 0 ? newIPs : undefined);
  };

  return (
    <div className="space-y-4">
      <CommentSection
        value={data._comment}
        onChange={(comment) => onChange({ ...data, _comment: comment })}
      />
      <SectionTitle title={t.common.metadata} icon={<Activity size={20} />} />
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>{t.common.name}</Label>
          <Input
            value={data.metadata.name}
            onChange={(e) => updateMeta('name', e.target.value)}
          />
        </div>
        <div>
          <Label>{t.common.namespace}</Label>
          <Input
            value={data.metadata.namespace}
            onChange={(e) => updateMeta('namespace', e.target.value)}
          />
        </div>
      </div>

      <SectionTitle title={t.service.networking} icon={<Network size={20} />} />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label>{t.service.serviceType}</Label>
          <Select
            value={data.spec.type}
            onChange={(e) => updateSpec('type', e.target.value)}
          >
            <option value="ClusterIP">ClusterIP</option>
            <option value="NodePort">NodePort</option>
            <option value="LoadBalancer">LoadBalancer</option>
          </Select>
        </div>
      </div>

      {/* Selector Section */}
      <div className="mt-6 p-4 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-200 dark:border-amber-800">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Activity size={16} className="text-amber-600 dark:text-amber-400" />
            <h4 className="font-semibold text-slate-800 dark:text-slate-200">{t.service.selector || 'Pod Selector'}</h4>
          </div>
          {/* Quick Select Workload */}
          {workloadOptions.length > 0 && (
            <div className="flex items-center gap-2">
              <Zap size={14} className="text-blue-500" />
              <select
                className="text-xs px-2 py-1 rounded border border-blue-300 dark:border-blue-600 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                value=""
                onChange={(e) => {
                  const selected = workloadOptions.find(w => `${w.kind}/${w.name}` === e.target.value);
                  if (selected) {
                    updateSpec('selector', { ...selected.labels });
                  }
                }}
              >
                <option value="">{t.service.selectWorkload || '⚡ Quick Select Workload'}</option>
                {workloadOptions.map((w, idx) => (
                  <option key={idx} value={`${w.kind}/${w.name}`}>
                    {w.kind}: {w.name} ({Object.entries(w.labels).map(([k, v]) => `${k}=${v}`).join(', ')})
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>
        <p className="text-xs text-slate-500 dark:text-slate-400 mb-3">
          {t.service.selectorHint || 'Labels to match backend Pods. Use Quick Select to auto-fill from saved workloads.'}
        </p>
        <div className="space-y-2">
          {Object.entries(data.spec.selector || {}).map(([key, value], idx) => (
            <div key={idx} className="flex items-center gap-2">
              <Input
                placeholder="Key"
                value={key}
                onChange={(e) => {
                  const newSelector = { ...data.spec.selector };
                  const oldValue = newSelector[key];
                  delete newSelector[key];
                  if (e.target.value) {
                    newSelector[e.target.value] = oldValue;
                  }
                  updateSpec('selector', newSelector);
                }}
                className="flex-1"
              />
              <span className="text-slate-400">:</span>
              <Input
                placeholder="Value"
                value={value}
                onChange={(e) => {
                  const newSelector = { ...data.spec.selector, [key]: e.target.value };
                  updateSpec('selector', newSelector);
                }}
                className="flex-1"
              />
              <button
                type="button"
                onClick={() => {
                  const newSelector = { ...data.spec.selector };
                  delete newSelector[key];
                  updateSpec('selector', Object.keys(newSelector).length > 0 ? newSelector : { app: '' });
                }}
                className="p-2 text-slate-400 hover:text-red-500 transition-colors"
              >
                <Trash2 size={16} />
              </button>
            </div>
          ))}
          <button
            type="button"
            onClick={() => {
              const newKey = `label-${Object.keys(data.spec.selector || {}).length + 1}`;
              updateSpec('selector', { ...data.spec.selector, [newKey]: '' });
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-100 text-amber-700 hover:bg-amber-200 dark:bg-amber-800/30 dark:text-amber-300 dark:hover:bg-amber-800/50 rounded-md text-xs font-medium transition-colors border border-amber-300 dark:border-amber-700"
          >
            <Plus size={14} />
            {t.service.addSelector || 'Add Selector'}
          </button>
        </div>
      </div>

      <div className="mt-6">
        <div className="flex items-center justify-between mb-4">
          <h4 className="font-semibold text-slate-800 dark:text-slate-200">{t.service.portConfig}</h4>
          <button
            type="button"
            onClick={addPort}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 text-blue-700 hover:bg-blue-100 rounded-md text-xs font-medium transition-colors border border-blue-200"
          >
            <Plus size={14} />
            {t.service.addPort}
          </button>
        </div>

        <div className="space-y-4">
          {data.spec.ports.map((port, index) => (
            <div key={index} className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-200 dark:border-slate-700 relative group">
              {data.spec.ports.length > 1 && (
                <button
                  type="button"
                  onClick={() => removePort(index)}
                  className="absolute top-2 right-2 p-1.5 text-slate-400 hover:text-red-500 transition-colors"
                >
                  <Trash2 size={16} />
                </button>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="col-span-1">
                  <Label>{t.service.portName}</Label>
                  <Input
                    placeholder="http"
                    value={port.name || ''}
                    onChange={(e) => updatePort(index, 'name', e.target.value)}
                  />
                </div>
                <div className="col-span-1">
                  <Label>{t.common.port}</Label>
                  <Input
                    type="number"
                    value={port.port}
                    onChange={(e) => updatePort(index, 'port', parseInt(e.target.value) || 0)}
                  />
                </div>
                <div className="col-span-1">
                  <Label>{t.service.targetPort}</Label>
                  <Input
                    type="number"
                    value={port.targetPort}
                    onChange={(e) => updatePort(index, 'targetPort', parseInt(e.target.value) || 0)}
                  />
                </div>
                <div className="col-span-1">
                  <Label>{t.common.protocol}</Label>
                  <Select
                    value={port.protocol}
                    onChange={(e) => updatePort(index, 'protocol', e.target.value)}
                  >
                    <option value="TCP">TCP</option>
                    <option value="UDP">UDP</option>
                    <option value="SCTP">SCTP</option>
                  </Select>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-8 border-t border-slate-100 dark:border-slate-700 pt-6">
        <div className="flex items-center gap-2 mb-4">
          <Globe size={18} className="text-slate-400 dark:text-slate-500" />
          <h4 className="font-semibold text-slate-800 dark:text-slate-200">{t.service.externalIPs}</h4>
        </div>

        <div className="space-y-3">
          {data.spec.externalIPs?.map((ip, idx) => (
            <div key={idx} className="flex items-center gap-2 group">
              <div className="flex-1 bg-slate-100 dark:bg-slate-800 px-3 py-2 rounded-md border border-slate-200 dark:border-slate-700 text-sm font-mono text-slate-700 dark:text-slate-300">
                {ip}
              </div>
              <button
                type="button"
                onClick={() => removeExternalIP(idx)}
                className="p-2 text-slate-400 hover:text-red-500 transition-colors"
              >
                <Trash2 size={16} />
              </button>
            </div>
          ))}

          <div className="flex gap-2">
            <Input
              placeholder={t.service.ipPlaceholder}
              value={newIP}
              onChange={(e) => setNewIP(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && addExternalIP()}
            />
            <button
              type="button"
              onClick={addExternalIP}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700 transition-colors whitespace-nowrap"
            >
              <Plus size={16} />
              {t.service.addIP}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
