
import React from 'react';
import { X, Server, Database, Layout, Box, Activity } from 'lucide-react';
import { TEMPLATES, Template } from '../../services/templateLibrary';
import { K8sResource, ResourceType } from '../../types';

interface TemplateModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSelectTemplate: (resources: { type: ResourceType; data: K8sResource }[]) => void;
}

const TemplateIcon = ({ id }: { id: string }) => {
    if (id.includes('nginx') || id.includes('node')) return <Server className="text-blue-500" />;
    if (id.includes('redis') || id.includes('mysql')) return <Database className="text-red-500" />;
    if (id.includes('spring')) return <Activity className="text-green-500" />;
    return <Box className="text-slate-500" />;
};

export const TemplateModal: React.FC<TemplateModalProps> = ({ isOpen, onClose, onSelectTemplate }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backpack-mode">
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-2xl w-full max-w-4xl overflow-hidden flex flex-col max-h-[90vh]">
                {/* Header */}
                <div className="p-6 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
                    <div className="flex items-center gap-3">
                        <Layout size={24} />
                        <div>
                            <h2 className="font-bold text-xl">Template Library</h2>
                            <p className="text-blue-100 text-sm">Start from a pre-configured stack</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="hover:bg-white/20 p-2 rounded-lg transition-colors"
                    >
                        <X size={24} />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 overflow-y-auto bg-slate-50 dark:bg-slate-900 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {TEMPLATES.map((template) => (
                        <div
                            key={template.id}
                            className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-5 hover:shadow-lg hover:border-blue-400 dark:hover:border-blue-500 transition-all cursor-pointer group"
                            onClick={() => {
                                onSelectTemplate(template.resources);
                                onClose();
                            }}
                        >
                            <div className="flex items-start justify-between mb-4">
                                <div className="p-3 bg-slate-100 dark:bg-slate-700 rounded-lg group-hover:bg-blue-50 dark:group-hover:bg-slate-600 transition-colors">
                                    <TemplateIcon id={template.id} />
                                </div>
                                <div className="text-xs font-semibold text-slate-500 bg-slate-100 dark:bg-slate-700 px-2 py-1 rounded">
                                    {template.resources.length} Resource{template.resources.length > 1 ? 's' : ''}
                                </div>
                            </div>

                            <h3 className="font-bold text-lg text-slate-800 dark:text-white mb-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                                {template.name}
                            </h3>

                            <p className="text-sm text-slate-500 dark:text-slate-400 mb-4 line-clamp-2">
                                {template.description}
                            </p>

                            <div className="flex flex-wrap gap-2 mt-auto">
                                {template.resources.map((res, idx) => (
                                    <span key={idx} className="text-[10px] uppercase font-bold tracking-wider text-slate-400 border border-slate-200 dark:border-slate-600 px-1.5 py-0.5 rounded">
                                        {res.type}
                                    </span>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>

                {/* Footer */}
                <div className="p-4 bg-white dark:bg-slate-800 border-t border-slate-100 dark:border-slate-700 text-center text-xs text-slate-400">
                    Select a template to load its resources into your workspace.
                </div>
            </div>
        </div>
    );
};
