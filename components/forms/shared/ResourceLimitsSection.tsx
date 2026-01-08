import React from 'react';
import { Container } from '../../../types';
import { Label } from '../../FormComponents';
import { ResourceInput } from './ResourceInput';
import { Activity } from 'lucide-react';
import { useLanguage } from '../../../contexts/LanguageContext';

interface ResourceLimitsSectionProps {
    container: Container;
    containerIndex: number;
    containerType: 'containers' | 'initContainers';
    onUpdateResources: (
        type: 'containers' | 'initContainers',
        cIdx: number,
        resType: 'requests' | 'limits',
        key: 'cpu' | 'memory',
        value: string
    ) => void;
}

/**
 * 资源限制配置区块 (CPU/Memory requests & limits)
 */
export const ResourceLimitsSection: React.FC<ResourceLimitsSectionProps> = ({
    container,
    containerIndex,
    containerType,
    onUpdateResources,
}) => {
    const { t } = useLanguage();

    return (
        <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
            <h4 className="text-sm font-semibold text-slate-700 mb-3 flex items-center gap-2">
                <Activity size={16} />
                {t.deploy.resources}
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Requests */}
                <div className="grid grid-cols-2 gap-3">
                    <div className="col-span-2 text-xs text-slate-500 font-medium uppercase tracking-tight">
                        {t.deploy.requests}
                    </div>
                    <div>
                        <Label>{t.deploy.cpu}</Label>
                        <ResourceInput
                            type="cpu"
                            value={container.resources?.requests?.cpu}
                            onChange={(val) => onUpdateResources(containerType, containerIndex, 'requests', 'cpu', val)}
                        />
                    </div>
                    <div>
                        <Label>{t.deploy.memory}</Label>
                        <ResourceInput
                            type="memory"
                            value={container.resources?.requests?.memory}
                            onChange={(val) => onUpdateResources(containerType, containerIndex, 'requests', 'memory', val)}
                        />
                    </div>
                </div>
                {/* Limits */}
                <div className="grid grid-cols-2 gap-3">
                    <div className="col-span-2 text-xs text-slate-500 font-medium uppercase tracking-tight">
                        {t.deploy.limits}
                    </div>
                    <div>
                        <Label>{t.deploy.cpu}</Label>
                        <ResourceInput
                            type="cpu"
                            value={container.resources?.limits?.cpu}
                            onChange={(val) => onUpdateResources(containerType, containerIndex, 'limits', 'cpu', val)}
                        />
                    </div>
                    <div>
                        <Label>{t.deploy.memory}</Label>
                        <ResourceInput
                            type="memory"
                            value={container.resources?.limits?.memory}
                            onChange={(val) => onUpdateResources(containerType, containerIndex, 'limits', 'memory', val)}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};
