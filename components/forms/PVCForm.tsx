
import React from 'react';
import { PersistentVolumeClaimResource } from '../../types';
import { Input, Label, SectionTitle, Select } from '../FormComponents';
import { HardDrive, Box } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';

interface Props {
  data: PersistentVolumeClaimResource;
  onChange: (data: PersistentVolumeClaimResource) => void;
}

export const PVCForm: React.FC<Props> = ({ data, onChange }) => {
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

  const updateResources = (value: string) => {
    onChange({
      ...data,
      spec: {
        ...data.spec,
        resources: {
          requests: {
            storage: value
          }
        }
      }
    });
  };

  const handleAccessModeChange = (mode: string, checked: boolean) => {
    const currentModes = new Set(data.spec.accessModes);
    if (checked) {
      currentModes.add(mode);
    } else {
      currentModes.delete(mode);
    }
    updateSpec('accessModes', Array.from(currentModes));
  };

  return (
    <div className="space-y-6">
      {/* Metadata */}
      <div>
        <SectionTitle title={t.common.metadata} icon={<Box size={20} />} />
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
      </div>

      {/* Storage Specs */}
      <div>
        <SectionTitle title={t.pvc.storage} icon={<HardDrive size={20} />} />
        
        <div className="space-y-4">
           {/* Capacity and Class */}
           <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>{t.pvc.request}</Label>
              <Input 
                value={data.spec.resources.requests.storage} 
                onChange={(e) => updateResources(e.target.value)}
                placeholder="8Gi"
              />
            </div>
            <div>
              <Label>{t.pvc.className}</Label>
              <Input 
                value={data.spec.storageClassName || ''} 
                onChange={(e) => updateSpec('storageClassName', e.target.value || undefined)}
                placeholder="standard"
              />
              <p className="text-xs text-slate-500 mt-1">
                {t.pvc.leaveEmpty}
              </p>
            </div>
          </div>

          {/* Volume Mode */}
          <div>
             <Label>{t.pvc.volumeMode}</Label>
             <Select
                value={data.spec.volumeMode || 'Filesystem'}
                onChange={(e) => updateSpec('volumeMode', e.target.value)}
             >
               <option value="Filesystem">Filesystem</option>
               <option value="Block">Block</option>
             </Select>
          </div>

          {/* Access Modes */}
          <div className="p-4 bg-slate-50 rounded-lg border border-slate-200">
            <Label>{t.pvc.accessModes}</Label>
            <div className="flex flex-col gap-3 mt-3">
              {['ReadWriteOnce', 'ReadOnlyMany', 'ReadWriteMany', 'ReadWriteOncePod'].map((mode) => (
                <label key={mode} className="flex items-center gap-2 text-sm text-slate-700 cursor-pointer">
                  <input 
                    type="checkbox"
                    checked={data.spec.accessModes.includes(mode)}
                    onChange={(e) => handleAccessModeChange(mode, e.target.checked)}
                    className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                  />
                  {mode}
                </label>
              ))}
            </div>
            <p className="text-xs text-slate-500 mt-2">
              {t.pvc.note}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
