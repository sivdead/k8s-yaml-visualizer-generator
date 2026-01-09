import React from 'react';
import { Probe } from '../../../types';
import { Input, Label, Select } from '../../FormComponents';
import { HeartPulse, PlayCircle } from 'lucide-react';
import { useLanguage } from '../../../contexts/LanguageContext';

interface ProbeFormProps {
    probe?: Probe;
    probeType: 'livenessProbe' | 'readinessProbe';
    title: string;
    onChange: (field: string, value: any) => void;
}

/**
 * 健康检查探针配置组件 (Liveness / Readiness)
 */
export const ProbeForm: React.FC<ProbeFormProps> = ({
    probe,
    probeType,
    title,
    onChange
}) => {
    const { t } = useLanguage();
    const type = probe?.httpGet ? 'http' : probe?.tcpSocket ? 'tcp' : probe?.exec ? 'exec' : 'none';

    return (
        <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-lg border border-slate-200 dark:border-slate-700">
            <div className="flex items-center gap-2 mb-3">
                {probeType === 'livenessProbe'
                    ? <HeartPulse size={16} className="text-red-500 dark:text-red-400" />
                    : <PlayCircle size={16} className="text-green-500 dark:text-green-400" />
                }
                <h4 className="font-medium text-slate-800 dark:text-slate-200">{title}</h4>
            </div>
            <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                    <Label>{t.deploy.probeType}</Label>
                    <Select value={type} onChange={(e) => onChange('type', e.target.value)}>
                        <option value="none">None</option>
                        <option value="http">HTTP Get</option>
                        <option value="tcp">TCP Socket</option>
                        <option value="exec">Exec Command</option>
                    </Select>
                </div>
            </div>
            {type !== 'none' && (
                <div className="space-y-4">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div>
                            <Label>{t.deploy.initialDelay}</Label>
                            <Input
                                type="number"
                                value={probe?.initialDelaySeconds || ''}
                                onChange={(e) => onChange('initialDelaySeconds', parseInt(e.target.value))}
                            />
                        </div>
                        <div>
                            <Label>{t.deploy.period}</Label>
                            <Input
                                type="number"
                                value={probe?.periodSeconds || ''}
                                onChange={(e) => onChange('periodSeconds', parseInt(e.target.value))}
                            />
                        </div>
                        <div>
                            <Label>{t.deploy.timeout}</Label>
                            <Input
                                type="number"
                                value={probe?.timeoutSeconds || ''}
                                onChange={(e) => onChange('timeoutSeconds', parseInt(e.target.value))}
                            />
                        </div>
                        <div>
                            <Label>{t.deploy.failureThreshold}</Label>
                            <Input
                                type="number"
                                value={probe?.failureThreshold || ''}
                                onChange={(e) => onChange('failureThreshold', parseInt(e.target.value))}
                            />
                        </div>
                    </div>
                    <div className="border-t border-slate-200 dark:border-slate-700 pt-3">
                        {type === 'http' && (
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <Label>{t.deploy.httpPath}</Label>
                                    <Input
                                        value={probe?.httpGet?.path || '/'}
                                        onChange={(e) => onChange('httpGet.path', e.target.value)}
                                    />
                                </div>
                                <div>
                                    <Label>{t.deploy.httpPort}</Label>
                                    <Input
                                        type="number"
                                        value={probe?.httpGet?.port || 80}
                                        onChange={(e) => onChange('httpGet.port', parseInt(e.target.value))}
                                    />
                                </div>
                            </div>
                        )}
                        {type === 'tcp' && (
                            <div>
                                <Label>{t.deploy.tcpPort}</Label>
                                <Input
                                    type="number"
                                    value={probe?.tcpSocket?.port || 80}
                                    onChange={(e) => onChange('tcpSocket.port', parseInt(e.target.value))}
                                />
                            </div>
                        )}
                        {type === 'exec' && (
                            <div>
                                <Label>{t.deploy.execCommand}</Label>
                                <Input
                                    placeholder='e.g. cat /tmp/healthy'
                                    value={(probe?.exec?.command || []).join(' ')}
                                    onChange={(e) => onChange('exec.command', e.target.value.split(' ').filter(s => s.length > 0))}
                                />
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};
