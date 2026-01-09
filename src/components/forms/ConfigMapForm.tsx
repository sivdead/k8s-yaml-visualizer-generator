
import React, { useState, useEffect } from 'react';
import { ConfigMapResource } from '../../types';
import { Input, Label, SectionTitle } from '../FormComponents';
import { FileText, Plus, Trash2, Box } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';
import { CommentSection } from './shared/CommentSection';

interface Props {
  data: ConfigMapResource;
  onChange: (data: ConfigMapResource) => void;
}

export const ConfigMapForm: React.FC<Props> = ({ data, onChange }) => {
  const { t } = useLanguage();
  // Convert Record<string, string> to Array for easier UI manipulation
  const [entries, setEntries] = useState<{ key: string; value: string }[]>([]);

  useEffect(() => {
    if (data.data) {
      setEntries(Object.entries(data.data).map(([key, value]) => ({ key, value })));
    }
  }, [data]);

  const updateMeta = (field: string, value: string) => {
    onChange({
      ...data,
      metadata: { ...data.metadata, [field]: value }
    });
  };

  const updateEntry = (index: number, field: 'key' | 'value', val: string) => {
    const newEntries = [...entries];
    newEntries[index] = { ...newEntries[index], [field]: val };
    setEntries(newEntries);
    syncData(newEntries);
  };

  const addEntry = () => {
    const newEntries = [...entries, { key: '', value: '' }];
    setEntries(newEntries);
    // Don't sync immediately on add to avoid empty key issues, wait for input
  };

  const removeEntry = (index: number) => {
    const newEntries = entries.filter((_, i) => i !== index);
    setEntries(newEntries);
    syncData(newEntries);
  };

  const syncData = (currentEntries: { key: string; value: string }[]) => {
    const dataObj: Record<string, string> = {};
    currentEntries.forEach(e => {
      if (e.key) dataObj[e.key] = e.value;
    });
    onChange({
      ...data,
      data: dataObj
    });
  };

  return (
    <div className="space-y-6">
      <CommentSection
        value={data._comment}
        onChange={(comment) => onChange({ ...data, _comment: comment })}
      />
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

      <SectionTitle title={t.configmap.data} icon={<FileText size={20} />} />
      <div className="space-y-4">
        {entries.map((entry, idx) => (
          <div key={idx} className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-200 dark:border-slate-700 relative group">
            <button
              onClick={() => removeEntry(idx)}
              className="absolute top-2 right-2 p-1 text-slate-400 hover:text-red-500 transition-colors"
            >
              <Trash2 size={16} />
            </button>
            <div className="space-y-3">
              <div>
                <Label>{t.configmap.filename}</Label>
                <Input
                  value={entry.key}
                  onChange={(e) => updateEntry(idx, 'key', e.target.value)}
                  placeholder="config.json"
                />
              </div>
              <div>
                <Label>{t.configmap.content}</Label>
                <textarea
                  value={entry.value}
                  onChange={(e) => updateEntry(idx, 'value', e.target.value)}
                  className="w-full h-32 rounded-md border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 px-3 py-2 text-sm text-slate-900 dark:text-white font-mono placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  placeholder="{}"
                />
              </div>
            </div>
          </div>
        ))}

        <button
          onClick={addEntry}
          className="w-full py-3 border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-lg text-slate-500 dark:text-slate-400 hover:border-blue-500 hover:text-blue-600 dark:hover:border-blue-400 dark:hover:text-blue-400 transition-colors flex items-center justify-center gap-2 font-medium"
        >
          <Plus size={18} />
          {t.configmap.addEntry}
        </button>
      </div>
    </div>
  );
};
