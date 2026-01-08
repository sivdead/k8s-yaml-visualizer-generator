
import React, { useState } from 'react';
import { ServiceResource } from '../../types';
import { Input, Label, Select, SectionTitle } from '../FormComponents';
import { Network, Activity, Plus, Trash2, Globe } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';
import { CommentSection } from './shared/CommentSection';

interface Props {
  data: ServiceResource;
  onChange: (data: ServiceResource) => void;
}

export const ServiceForm: React.FC<Props> = ({ data, onChange }) => {
  const { t } = useLanguage();
  const [newIP, setNewIP] = useState('');

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

      <div className="mt-6">
        <div className="flex items-center justify-between mb-4">
          <h4 className="font-semibold text-slate-800">{t.service.portConfig}</h4>
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
            <div key={index} className="p-4 bg-slate-50 rounded-lg border border-slate-200 relative group">
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

      <div className="mt-8 border-t border-slate-100 pt-6">
        <div className="flex items-center gap-2 mb-4">
          <Globe size={18} className="text-slate-400" />
          <h4 className="font-semibold text-slate-800">{t.service.externalIPs}</h4>
        </div>

        <div className="space-y-3">
          {data.spec.externalIPs?.map((ip, idx) => (
            <div key={idx} className="flex items-center gap-2 group">
              <div className="flex-1 bg-slate-100 px-3 py-2 rounded-md border border-slate-200 text-sm font-mono text-slate-700">
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
