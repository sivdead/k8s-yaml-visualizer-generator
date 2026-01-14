
import React from 'react';
import { ConfigMapResource } from '../../types';
import { Input, Label, SectionTitle } from '../FormComponents';
import { FileText, Plus, Trash2, Box } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';
import { CommentSection } from './shared/CommentSection';
import { useKeyValuePairs } from '../../hooks/useKeyValuePairs';
import { LabelsAnnotationsSection } from './shared/LabelsAnnotationsSection';

interface Props {
  data: ConfigMapResource;
  onChange: (data: ConfigMapResource) => void;
}

export const ConfigMapForm: React.FC<Props> = ({ data, onChange }) => {
  const { t, language } = useLanguage();

  const { entries, updateEntry, addEntry, removeEntry } = useKeyValuePairs(
    data.data,
    (newData) => onChange({ ...data, data: newData })
  );

  const updateMeta = (field: string, value: string) => {
    onChange({
      ...data,
      metadata: { ...data.metadata, [field]: value }
    });
  };

  const updateLabels = (labels: Record<string, string>) => {
    onChange({ ...data, metadata: { ...data.metadata, labels } });
  };

  const updateAnnotations = (annotations: Record<string, string> | undefined) => {
    onChange({ ...data, metadata: { ...data.metadata, annotations } });
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

      {/* Labels & Annotations */}
      <div className="mt-2">
        <details className="group">
          <summary className="cursor-pointer text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 transition-colors">
            {language === 'zh' ? '▸ 标签与注解' : '▸ Labels & Annotations'}
          </summary>
          <div className="mt-3">
            <LabelsAnnotationsSection
              labels={data.metadata.labels}
              annotations={data.metadata.annotations}
              onLabelsChange={updateLabels}
              onAnnotationsChange={updateAnnotations}
            />
          </div>
        </details>
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
