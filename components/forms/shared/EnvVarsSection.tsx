import React, { useState } from 'react';
import { Container, EnvVar, EnvFromSource } from '../../../types';
import { Input, Select } from '../../FormComponents';
import { Key, Plus, Trash2 } from 'lucide-react';
import { useLanguage } from '../../../contexts/LanguageContext';
import { useToast } from '../../../contexts/AppContext';

interface EnvVarsSectionProps {
    container: Container;
    containerIndex: number;
    containerType: 'containers' | 'initContainers';
    onAddEnvVar: (type: 'containers' | 'initContainers', cIdx: number, env: EnvVar) => void;
    onRemoveEnvVar: (type: 'containers' | 'initContainers', cIdx: number, eIdx: number) => void;
    onAddEnvFrom: (type: 'containers' | 'initContainers', cIdx: number, envFrom: EnvFromSource) => void;
    onRemoveEnvFrom: (type: 'containers' | 'initContainers', cIdx: number, eIdx: number) => void;
}

/**
 * 环境变量管理组件 (env + envFrom)
 */
export const EnvVarsSection: React.FC<EnvVarsSectionProps> = ({
    container,
    containerIndex,
    containerType,
    onAddEnvVar,
    onRemoveEnvVar,
    onAddEnvFrom,
    onRemoveEnvFrom,
}) => {
    const { t } = useLanguage();
    const { addToast } = useToast();
    const id = `${containerType}-${containerIndex}`;

    // Local state for adding new env vars
    const [newEnvName, setNewEnvName] = useState('');
    const [newEnvType, setNewEnvType] = useState<'value' | 'configMap' | 'secret'>('value');
    const [newEnvValue, setNewEnvValue] = useState('');
    const [newEnvRefName, setNewEnvRefName] = useState('');
    const [newEnvRefKey, setNewEnvRefKey] = useState('');
    const [newEnvFromName, setNewEnvFromName] = useState('');
    const [newEnvFromType, setNewEnvFromType] = useState<'configMap' | 'secret'>('configMap');

    const handleAddEnvVar = () => {
        if (!newEnvName) {
            addToast(t.deploy.alertEnvName, 'warning');
            return;
        }

        let newEnv: EnvVar = { name: newEnvName };
        if (newEnvType === 'value') {
            newEnv.value = newEnvValue;
        } else if (newEnvType === 'configMap') {
            newEnv.valueFrom = {
                configMapKeyRef: {
                    name: newEnvRefName,
                    key: newEnvRefKey,
                },
            };
        } else if (newEnvType === 'secret') {
            newEnv.valueFrom = {
                secretKeyRef: {
                    name: newEnvRefName,
                    key: newEnvRefKey,
                },
            };
        }

        onAddEnvVar(containerType, containerIndex, newEnv);

        // Reset state
        setNewEnvName('');
        setNewEnvValue('');
        setNewEnvRefName('');
        setNewEnvRefKey('');
    };

    const handleAddEnvFrom = () => {
        if (!newEnvFromName) return;

        const envFrom: EnvFromSource = newEnvFromType === 'configMap'
            ? { configMapRef: { name: newEnvFromName } }
            : { secretRef: { name: newEnvFromName } };

        onAddEnvFrom(containerType, containerIndex, envFrom);
        setNewEnvFromName('');
    };

    return (
        <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
            <h4 className="text-sm font-semibold text-slate-700 mb-3 flex items-center gap-2">
                <Key size={16} />
                {t.deploy.envVars}
            </h4>

            {/* Existing Env Vars */}
            <div className="space-y-2 mb-4">
                {container.env?.map((env, eIdx) => (
                    <div key={eIdx} className="flex gap-2 items-center bg-white p-2 border rounded shadow-sm text-xs">
                        <span className="font-bold text-slate-700 min-w-[80px]">{env.name}</span>
                        <span className="text-slate-400">→</span>
                        {env.value !== undefined ? (
                            <span className="flex-1 truncate text-slate-600 font-mono">{env.value}</span>
                        ) : env.valueFrom?.configMapKeyRef ? (
                            <span className="flex-1 truncate text-blue-600 flex items-center gap-1">
                                <span className="bg-blue-50 px-1 rounded border border-blue-100">CM</span>
                                {env.valueFrom.configMapKeyRef.name} : {env.valueFrom.configMapKeyRef.key}
                            </span>
                        ) : env.valueFrom?.secretKeyRef ? (
                            <span className="flex-1 truncate text-purple-600 flex items-center gap-1">
                                <span className="bg-purple-50 px-1 rounded border border-purple-100">Secret</span>
                                {env.valueFrom.secretKeyRef.name} : {env.valueFrom.secretKeyRef.key}
                            </span>
                        ) : (
                            <span className="flex-1 text-slate-400 italic">other ref</span>
                        )}
                        <button
                            type="button"
                            onClick={() => onRemoveEnvVar(containerType, containerIndex, eIdx)}
                            className="text-red-500"
                        >
                            <Trash2 size={14} />
                        </button>
                    </div>
                ))}
            </div>

            {/* Add New Env Var */}
            <div className="bg-slate-100 p-2 rounded border border-slate-200 space-y-2">
                <div className="flex gap-2">
                    <div className="flex-1">
                        <Input
                            placeholder="Variable Name"
                            value={newEnvName}
                            onChange={(e) => setNewEnvName(e.target.value)}
                        />
                    </div>
                    <div className="w-1/3">
                        <Select
                            value={newEnvType}
                            onChange={(e) => setNewEnvType(e.target.value as any)}
                        >
                            <option value="value">{t.deploy.envValType}</option>
                            <option value="configMap">{t.deploy.envRefType} (CM)</option>
                            <option value="secret">{t.deploy.envRefType} (Secret)</option>
                        </Select>
                    </div>
                </div>

                <div className="flex gap-2 items-center">
                    {newEnvType === 'value' ? (
                        <div className="flex-1">
                            <Input
                                placeholder="Value"
                                value={newEnvValue}
                                onChange={(e) => setNewEnvValue(e.target.value)}
                            />
                        </div>
                    ) : (
                        <>
                            <div className="flex-1">
                                <Input
                                    placeholder={newEnvType === 'configMap' ? t.deploy.cmName : t.deploy.secName}
                                    value={newEnvRefName}
                                    onChange={(e) => setNewEnvRefName(e.target.value)}
                                />
                            </div>
                            <div className="flex-1">
                                <Input
                                    placeholder={t.deploy.cmKey}
                                    value={newEnvRefKey}
                                    onChange={(e) => setNewEnvRefKey(e.target.value)}
                                />
                            </div>
                        </>
                    )}
                    <button
                        type="button"
                        onClick={handleAddEnvVar}
                        className="bg-blue-600 text-white p-2 rounded h-[38px] w-[38px] flex items-center justify-center hover:bg-blue-700 transition-colors"
                    >
                        <Plus size={16} />
                    </button>
                </div>
            </div>

            {/* Env From (Bulk Load) */}
            <div className="mt-4 pt-4 border-t border-slate-200">
                <h5 className="text-xs font-semibold text-slate-500 mb-2 uppercase tracking-tight">
                    {t.deploy.envFrom}
                </h5>
                <div className="space-y-2">
                    {container.envFrom?.map((ef, efIdx) => (
                        <div key={efIdx} className="flex gap-2 items-center bg-white p-2 border rounded shadow-sm text-xs">
                            {ef.configMapRef ? (
                                <>
                                    <span className="font-bold text-blue-600 bg-blue-50 px-1 rounded border border-blue-100">CM</span>
                                    <span className="flex-1 font-mono text-slate-700">{ef.configMapRef.name}</span>
                                </>
                            ) : ef.secretRef ? (
                                <>
                                    <span className="font-bold text-purple-600 bg-purple-50 px-1 rounded border border-purple-100">Secret</span>
                                    <span className="flex-1 font-mono text-slate-700">{ef.secretRef.name}</span>
                                </>
                            ) : null}
                            <button
                                type="button"
                                onClick={() => onRemoveEnvFrom(containerType, containerIndex, efIdx)}
                                className="text-red-500"
                            >
                                <Trash2 size={14} />
                            </button>
                        </div>
                    ))}
                    <div className="flex gap-2">
                        <div className="w-24">
                            <Select
                                value={newEnvFromType}
                                onChange={(e) => setNewEnvFromType(e.target.value as any)}
                            >
                                <option value="configMap">ConfigMap</option>
                                <option value="secret">Secret</option>
                            </Select>
                        </div>
                        <Input
                            placeholder={newEnvFromType === 'configMap' ? t.deploy.cmName : t.deploy.secName}
                            value={newEnvFromName}
                            onChange={(e) => setNewEnvFromName(e.target.value)}
                        />
                        <button
                            type="button"
                            onClick={handleAddEnvFrom}
                            className="bg-slate-600 text-white p-2 rounded h-[38px] w-[38px] flex items-center justify-center hover:bg-slate-700 transition-colors"
                        >
                            <Plus size={16} />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};
