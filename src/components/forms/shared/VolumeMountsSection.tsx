import React, { useState } from 'react';
import { Container, Volume, VolumeMount } from '../../../types';
import { Input } from '../../FormComponents';
import { HardDrive, Plus, Trash2 } from 'lucide-react';
import { useLanguage } from '../../../contexts/LanguageContext';
import { useToast } from '../../../contexts/AppContext';

interface VolumeMountsSectionProps {
    container: Container;
    containerIndex: number;
    containerType: 'containers' | 'initContainers';
    availableVolumes: Volume[];
    onAddVolumeMount: (type: 'containers' | 'initContainers', cIdx: number, mount: VolumeMount) => void;
    onRemoveVolumeMount: (type: 'containers' | 'initContainers', cIdx: number, mIdx: number) => void;
}

/**
 * 卷挂载管理组件
 */
export const VolumeMountsSection: React.FC<VolumeMountsSectionProps> = ({
    container,
    containerIndex,
    containerType,
    availableVolumes,
    onAddVolumeMount,
    onRemoveVolumeMount,
}) => {
    const { t } = useLanguage();
    const { addToast } = useToast();
    const id = `${containerType}-${containerIndex}`;

    const [newMountName, setNewMountName] = useState('');
    const [newMountPath, setNewMountPath] = useState('');
    const [newMountReadOnly, setNewMountReadOnly] = useState(false);

    const handleAddMount = () => {
        if (!newMountName || !newMountPath) {
            addToast(t.deploy.alertMount, 'warning');
            return;
        }

        const mount: VolumeMount = {
            name: newMountName,
            mountPath: newMountPath,
            readOnly: newMountReadOnly ? true : undefined,
        };

        onAddVolumeMount(containerType, containerIndex, mount);

        setNewMountName('');
        setNewMountPath('');
        setNewMountReadOnly(false);
    };

    return (
        <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-lg border border-slate-200 dark:border-slate-700">
            <h4 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3 flex items-center gap-2">
                <HardDrive size={16} />
                {t.deploy.mounts}
            </h4>
            <div className="space-y-2">
                {container.volumeMounts?.map((mount, mIdx) => (
                    <div key={mIdx} className="flex gap-2 items-center bg-white dark:bg-slate-800 p-2 border dark:border-slate-700 rounded shadow-sm text-xs dark:text-slate-200">
                        <span className="font-bold">{mount.name}</span> → <span>{mount.mountPath}</span>
                        {mount.readOnly && <span className="text-amber-600 dark:text-amber-500 text-xs">(RO)</span>}
                        <button
                            type="button"
                            onClick={() => onRemoveVolumeMount(containerType, containerIndex, mIdx)}
                            className="ml-auto text-red-500 hover:text-red-400"
                        >
                            <Trash2 size={14} />
                        </button>
                    </div>
                ))}
                <div className="flex gap-2 items-end bg-slate-100 dark:bg-slate-800/50 p-2 rounded border border-slate-200 dark:border-slate-700">
                    <div className="flex-1">
                        <Input
                            list={`vol-list-${id}`}
                            placeholder="Vol Name"
                            value={newMountName}
                            onChange={(e) => setNewMountName(e.target.value)}
                        />
                        <datalist id={`vol-list-${id}`}>
                            {availableVolumes.map((v) => (
                                <option key={v.name} value={v.name} />
                            ))}
                        </datalist>
                    </div>
                    <div className="flex-1">
                        <Input
                            placeholder="/path"
                            value={newMountPath}
                            onChange={(e) => setNewMountPath(e.target.value)}
                        />
                    </div>
                    <label className="flex items-center gap-1 text-xs text-slate-600 whitespace-nowrap">
                        <input
                            type="checkbox"
                            checked={newMountReadOnly}
                            onChange={(e) => setNewMountReadOnly(e.target.checked)}
                            className="rounded border-slate-300"
                        />
                        {t.deploy.readOnly}
                    </label>
                    <button
                        type="button"
                        onClick={handleAddMount}
                        className="bg-blue-600 text-white p-2 rounded"
                    >
                        <Plus size={16} />
                    </button>
                </div>
                <p className="text-xs text-slate-400 italic">{t.deploy.noteVolName}</p>
            </div>
        </div>
    );
};
