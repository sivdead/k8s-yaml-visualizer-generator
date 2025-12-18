
import React, { useState } from 'react';
import { generateK8sResource } from '../services/geminiService';
import { K8sResource, ResourceType } from '../types';
import { Wand2, Loader2, X } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onApply: (resource: K8sResource) => void;
  resourceType: ResourceType;
}

export const AiAssistant: React.FC<Props> = ({ isOpen, onClose, onApply, resourceType }) => {
  const { t } = useLanguage();
  const [prompt, setPrompt] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleGenerate = async () => {
    if (!prompt.trim()) return;
    
    setIsLoading(true);
    setError(null);
    try {
      const result = await generateK8sResource(prompt, resourceType);
      if (result && result.resource) {
        onApply(result.resource);
        onClose();
      } else {
        setError(t.ai.error);
      }
    } catch (err) {
        setError(t.ai.apiError);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
        <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
          <div className="flex items-center gap-2">
            <Wand2 size={20} />
            <h2 className="font-semibold text-lg">{t.ai.title}</h2>
          </div>
          <button onClick={onClose} className="hover:bg-white/20 p-1 rounded transition-colors">
            <X size={20} />
          </button>
        </div>
        
        <div className="p-6 space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">
              {t.ai.desc.replace('{resource}', resourceType)}
            </label>
            <textarea 
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder={t.ai.placeholder.replace('{resource}', resourceType)}
              className="w-full h-32 p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none text-sm"
            />
          </div>

          {error && (
            <div className="p-3 bg-red-50 text-red-600 text-sm rounded-md border border-red-200">
              {error}
            </div>
          )}

          <div className="text-xs text-slate-500 bg-slate-50 p-3 rounded">
            {t.ai.powered}
          </div>
        </div>

        <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end gap-3">
          <button 
            onClick={onClose}
            className="px-4 py-2 text-slate-700 font-medium hover:bg-slate-200 rounded-lg transition-colors"
          >
            {t.common.cancel}
          </button>
          <button 
            onClick={handleGenerate}
            disabled={isLoading || !prompt.trim()}
            className="flex items-center gap-2 px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? <Loader2 className="animate-spin" size={18} /> : <Wand2 size={18} />}
            {t.common.generate}
          </button>
        </div>
      </div>
    </div>
  );
};
