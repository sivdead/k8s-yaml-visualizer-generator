import React from 'react';
import { SecretResource } from '../../types';
import { Key, Plus, Trash2 } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';
import { CommentSection } from './shared/CommentSection';

interface Props {
    data: SecretResource;
    onChange: (data: SecretResource) => void;
}

export const SecretForm: React.FC<Props> = ({ data, onChange }) => {
    const { t } = useLanguage();

    const handleMetadataChange = (field: string, value: string) => {
        onChange({
            ...data,
            metadata: { ...data.metadata, [field]: value }
        });
    };

    const handleDataChange = (key: string, value: string) => {
        onChange({
            ...data,
            data: { ...data.data, [key]: value }
        });
    };

    const addDataField = () => {
        onChange({
            ...data,
            data: { ...data.data, [`key-${Object.keys(data.data).length + 1}`]: '' }
        });
    };

    const removeDataField = (keyToRemove: string) => {
        const newData = { ...data.data };
        delete newData[keyToRemove];
        onChange({
            ...data,
            data: newData
        });
    };

    return (
        <div className="space-y-6">
            <CommentSection
                value={data._comment}
                onChange={(comment) => onChange({ ...data, _comment: comment })}
            />
            <div className="space-y-4">
                <h3 className="text-lg font-medium text-slate-800 dark:text-slate-200 flex items-center gap-2">
                    <Key size={20} className="text-blue-500 dark:text-blue-400" />
                    {t.form?.metadata || 'Metadata'}
                </h3>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Name</label>
                        <input
                            type="text"
                            value={data.metadata.name}
                            onChange={(e) => handleMetadataChange('name', e.target.value)}
                            className="w-full rounded-md border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Namespace</label>
                        <input
                            type="text"
                            value={data.metadata.namespace}
                            onChange={(e) => handleMetadataChange('namespace', e.target.value)}
                            className="w-full rounded-md border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                        />
                    </div>
                </div>
            </div>

            <div className="space-y-4">
                <div className="flex justify-between items-center">
                    <h3 className="text-lg font-medium text-slate-800 dark:text-slate-200">Data (Key-Value)</h3>
                    <button
                        onClick={addDataField}
                        className="flex items-center gap-1 text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium"
                    >
                        <Plus size={16} />
                        Add Data
                    </button>
                </div>

                <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-lg border border-slate-200 dark:border-slate-700">
                    <div className="text-xs text-slate-500 dark:text-slate-400 mb-4">
                        Values entered here are treated as plain text and will be automatically Base64 encoded in the generated YAML.
                    </div>
                    {Object.entries(data.data).map(([key, value], index) => (
                        <div key={index} className="flex gap-3 mb-3 items-start">
                            <input
                                type="text"
                                value={key}
                                placeholder="Key"
                                onChange={(e) => {
                                    const newKey = e.target.value;
                                    const newData = { ...data.data };
                                    delete newData[key];
                                    newData[newKey] = value;
                                    onChange({ ...data, data: newData });
                                }}
                                className="flex-1 rounded-md border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                            />
                            <input
                                type="text"
                                value={value}
                                placeholder="Value"
                                onChange={(e) => handleDataChange(key, e.target.value)}
                                className="flex-1 rounded-md border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none font-mono"
                            />
                            <button
                                onClick={() => removeDataField(key)}
                                className="p-2 text-slate-400 hover:text-red-500 transition-colors"
                            >
                                <Trash2 size={16} />
                            </button>
                        </div>
                    ))}
                    {Object.keys(data.data).length === 0 && (
                        <div className="text-center py-8 text-slate-400 text-sm italic">
                            No data entries. Click "Add Data" to start.
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
