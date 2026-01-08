
import React, { useState, useEffect } from 'react';
import { IngressResource } from '../../types';
import { Input, Label, Select, SectionTitle } from '../FormComponents';
import { Globe, Trash2, Plus, Route, Server, Tag } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';
import { CommentSection } from './shared/CommentSection';

interface Props {
  data: IngressResource;
  onChange: (data: IngressResource) => void;
}

export const IngressForm: React.FC<Props> = ({ data, onChange }) => {
  const { t } = useLanguage();
  const [annotations, setAnnotations] = useState<{ key: string; value: string }[]>([]);

  // Sync annotations from props to local state on load
  useEffect(() => {
    if (data.metadata.annotations) {
      setAnnotations(Object.entries(data.metadata.annotations).map(([key, value]) => ({ key, value })));
    } else {
      setAnnotations([]);
    }
  }, [data.metadata.annotations]);

  const updateMeta = (field: string, value: string) => {
    onChange({
      ...data,
      metadata: { ...data.metadata, [field]: value }
    });
  };

  // --- Annotation Logic ---
  const syncAnnotations = (currentAnnotations: { key: string; value: string }[]) => {
    const annotObj: Record<string, string> = {};
    currentAnnotations.forEach(a => {
      if (a.key) annotObj[a.key] = a.value;
    });
    onChange({
      ...data,
      metadata: { ...data.metadata, annotations: annotObj }
    });
  };

  const addAnnotation = () => {
    // Only update local state, don't sync to parent yet (avoids clearing empty row)
    setAnnotations([...annotations, { key: '', value: '' }]);
  };

  const removeAnnotation = (idx: number) => {
    const newAnnot = annotations.filter((_, i) => i !== idx);
    setAnnotations(newAnnot);
    syncAnnotations(newAnnot);
  };

  const changeAnnotation = (idx: number, field: 'key' | 'value', val: string) => {
    const newAnnot = [...annotations];
    newAnnot[idx] = { ...newAnnot[idx], [field]: val };
    setAnnotations(newAnnot);
    syncAnnotations(newAnnot);
  };

  // --- Spec Logic ---
  const updateSpec = (field: string, value: any) => {
    onChange({
      ...data,
      spec: { ...data.spec, [field]: value }
    });
  };

  const addRule = () => {
    const newRule = {
      host: 'example.com',
      http: {
        paths: [
          {
            path: '/',
            pathType: 'Prefix' as const,
            backend: {
              service: { name: 'my-service', port: { number: 80 } }
            }
          }
        ]
      }
    };
    updateSpec('rules', [...(data.spec.rules || []), newRule]);
  };

  const removeRule = (index: number) => {
    const newRules = [...(data.spec.rules || [])];
    newRules.splice(index, 1);
    updateSpec('rules', newRules);
  };

  const updateRuleHost = (index: number, host: string) => {
    const newRules = [...data.spec.rules];
    newRules[index].host = host;
    updateSpec('rules', newRules);
  };

  // --- Path Logic ---
  const addPath = (ruleIndex: number) => {
    const newRules = [...data.spec.rules];
    newRules[ruleIndex].http.paths.push({
      path: '/',
      pathType: 'Prefix',
      backend: { service: { name: 'my-service', port: { number: 80 } } }
    });
    updateSpec('rules', newRules);
  };

  const removePath = (ruleIndex: number, pathIndex: number) => {
    const newRules = [...data.spec.rules];
    newRules[ruleIndex].http.paths.splice(pathIndex, 1);
    updateSpec('rules', newRules);
  };

  const updatePath = (ruleIndex: number, pathIndex: number, field: string, value: any) => {
    const newRules = [...data.spec.rules];
    const pathItem = newRules[ruleIndex].http.paths[pathIndex];

    if (field === 'serviceName') {
      pathItem.backend.service.name = value;
    } else if (field === 'servicePort') {
      pathItem.backend.service.port.number = parseInt(value) || 0;
    } else {
      (pathItem as any)[field] = value;
    }

    updateSpec('rules', newRules);
  };


  return (
    <div className="space-y-6">
      <CommentSection
        value={data._comment}
        onChange={(comment) => onChange({ ...data, _comment: comment })}
      />
      <SectionTitle title={t.common.metadata} icon={<Globe size={20} />} />
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

      {/* Annotations */}
      <div className="mt-4">
        <Label>{t.ingress.annotations}</Label>
        <div className="space-y-2 mt-2">
          {annotations.map((annot, idx) => (
            <div key={idx} className="flex gap-2 items-center">
              <Input
                placeholder="nginx.ingress.kubernetes.io/rewrite-target"
                value={annot.key}
                onChange={(e) => changeAnnotation(idx, 'key', e.target.value)}
              />
              <Input
                placeholder="/"
                value={annot.value}
                onChange={(e) => changeAnnotation(idx, 'value', e.target.value)}
              />
              <button
                type="button"
                onClick={() => removeAnnotation(idx)}
                className="p-2 text-slate-400 hover:text-red-500 transition-colors"
              >
                <Trash2 size={16} />
              </button>
            </div>
          ))}
          <button
            type="button"
            onClick={addAnnotation}
            className="text-sm text-blue-600 font-medium hover:text-blue-700 flex items-center gap-1 mt-1"
          >
            <Plus size={14} /> {t.ingress.addAnnot}
          </button>
        </div>
      </div>

      <SectionTitle title={t.ingress.controller} icon={<Server size={20} />} />

      <div>
        <Label>{t.ingress.className}</Label>
        <Input
          value={data.spec.ingressClassName || ''}
          onChange={(e) => updateSpec('ingressClassName', e.target.value)}
          placeholder="nginx"
        />
        <p className="text-xs text-slate-500 mt-1">
          {t.ingress.desc}
        </p>
      </div>

      <SectionTitle title={t.ingress.rules} icon={<Route size={20} />} />

      <div className="space-y-6 mt-4">
        {data.spec.rules.map((rule, rIdx) => (
          <div key={rIdx} className="border border-slate-200 rounded-lg overflow-hidden">
            <div className="bg-slate-100 px-4 py-3 border-b border-slate-200 flex justify-between items-center">
              <div className="flex-1 mr-4">
                <Label>{t.ingress.host}</Label>
                <Input
                  value={rule.host}
                  onChange={(e) => updateRuleHost(rIdx, e.target.value)}
                  placeholder="example.com"
                />
              </div>
              <button
                type="button"
                onClick={() => removeRule(rIdx)}
                className="text-red-500 hover:bg-red-50 p-2 rounded"
              >
                <Trash2 size={16} />
              </button>
            </div>

            <div className="p-4 bg-slate-50 space-y-3">
              {rule.http.paths.map((path, pIdx) => (
                <div key={pIdx} className="grid grid-cols-12 gap-2 items-end bg-white p-3 rounded shadow-sm border border-slate-100">
                  <div className="col-span-3">
                    <Label>{t.ingress.path}</Label>
                    <Input
                      value={path.path}
                      onChange={(e) => updatePath(rIdx, pIdx, 'path', e.target.value)}
                    />
                  </div>
                  <div className="col-span-3">
                    <Label>{t.ingress.pathType}</Label>
                    <Select
                      value={path.pathType}
                      onChange={(e) => updatePath(rIdx, pIdx, 'pathType', e.target.value)}
                    >
                      <option value="Prefix">Prefix</option>
                      <option value="Exact">Exact</option>
                      <option value="ImplementationSpecific">ImplSpecific</option>
                    </Select>
                  </div>
                  <div className="col-span-3">
                    <Label>{t.ingress.serviceName}</Label>
                    <Input
                      value={path.backend.service.name}
                      onChange={(e) => updatePath(rIdx, pIdx, 'serviceName', e.target.value)}
                    />
                  </div>
                  <div className="col-span-2">
                    <Label>{t.common.port}</Label>
                    <Input
                      type="number"
                      value={path.backend.service.port.number}
                      onChange={(e) => updatePath(rIdx, pIdx, 'servicePort', e.target.value)}
                    />
                  </div>
                  <div className="col-span-1 flex justify-center pb-2">
                    <button
                      type="button"
                      onClick={() => removePath(rIdx, pIdx)}
                      className="text-slate-400 hover:text-red-500"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))}
              <button
                type="button"
                onClick={() => addPath(rIdx)}
                className="w-full py-2 border border-dashed border-slate-300 rounded text-sm text-slate-500 hover:border-blue-500 hover:text-blue-600 flex items-center justify-center gap-1"
              >
                <Plus size={14} /> {t.ingress.addPath}
              </button>
            </div>
          </div>
        ))}

        <button
          type="button"
          onClick={addRule}
          className="px-4 py-2 bg-slate-800 text-white rounded-md hover:bg-slate-700 text-sm font-medium flex items-center gap-2"
        >
          <Plus size={16} /> {t.ingress.addRule}
        </button>
      </div>

    </div>
  );
};
