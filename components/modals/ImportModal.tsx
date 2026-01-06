import React, { useState } from 'react';
import { X, Upload, AlertCircle } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';

interface ImportModalProps {
    isOpen: boolean;
    onClose: () => void;
    onImport: (content: string) => void;
}

export const ImportModal = ({ isOpen, onClose, onImport }: ImportModalProps) => {
    const [content, setContent] = useState('');
    const [error, setError] = useState<string | null>(null);
    const { t } = useLanguage();

    if (!isOpen) return null;

    const handleImport = () => {
        if (!content.trim()) return;
        try {
            setError(null);
            onImport(content);
            onClose();
            setContent('');
        } catch (e: any) {
            setError(e.message || "Failed to parse YAML");
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col h-[80vh] md:h-auto">
                <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-900 text-white">
                    <div className="flex items-center gap-2">
                        <Upload size={18} />
                        <h2 className="font-semibold">Import YAML</h2>
                    </div>
                    <button onClick={onClose} className="hover:bg-white/20 p-1 rounded transition-colors">
                        <X size={20} />
                    </button>
                </div>

                <div className="p-6 flex-1 flex flex-col overflow-hidden">
                    <div className="mb-4 text-sm text-slate-600">
                        Paste your existing Kubernetes YAML configuration below to load it into the editor.
                        Supported kinds: Deployment, Service, ConfigMap, Ingress, PVC.
                    </div>

                    <textarea
                        className="flex-1 w-full rounded-md border border-slate-300 p-4 font-mono text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none resize-none bg-slate-50 overflow-auto"
                        placeholder="apiVersion: v1&#10;kind: Service&#10;metadata:&#10;  name: my-service..."
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        spellCheck={false}
                    />

                    {error && (
                        <div className="mt-4 p-3 bg-red-50 text-red-700 rounded-md text-sm flex items-start gap-2 border border-red-100">
                            <AlertCircle size={16} className="mt-0.5 flex-shrink-0" />
                            <div className="whitespace-pre-wrap font-mono text-xs">{error}</div>
                        </div>
                    )}
                </div>

                <div className="p-4 border-t border-slate-100 bg-slate-50 flex justify-end gap-3">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 text-slate-600 hover:bg-slate-200 rounded-md text-sm font-medium transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleImport}
                        disabled={!content.trim()}
                        className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                        <Upload size={16} />
                        Import Configuration
                    </button>
                </div>
            </div>
        </div>
    );
};
