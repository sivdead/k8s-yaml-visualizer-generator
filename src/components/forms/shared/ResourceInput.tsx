import React, { useState, useEffect } from 'react';

interface ResourceInputProps {
    value?: string;
    onChange: (val: string) => void;
    type: 'cpu' | 'memory';
}

/**
 * CPU/Memory 资源输入控件，带单位选择器
 */
export const ResourceInput: React.FC<ResourceInputProps> = ({
    value = '',
    onChange,
    type
}) => {
    const hasValue = value !== undefined && value !== '';
    // Regex to match number and optional suffix
    const match = (value || '').match(/^([0-9.]+)([a-zA-Z]*)$/);
    const numericVal = match ? match[1] : (hasValue && !isNaN(parseFloat(value!)) ? value : '');
    const extractedSuffix = match ? match[2] : '';

    const defaultUnit = type === 'cpu' ? 'm' : 'Mi';
    // Use state to track preferred unit even when input is empty.
    // If value exists, use its suffix. If not, use default.
    const [unit, setUnit] = useState(hasValue ? extractedSuffix : defaultUnit);

    // Sync state if external value has a specific unit that differs from local state
    useEffect(() => {
        if (hasValue && extractedSuffix !== unit) {
            setUnit(extractedSuffix);
        }
    }, [extractedSuffix, hasValue, unit]);

    const handleChangeNum = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value;
        if (val === '') {
            onChange('');
        } else {
            onChange(`${val}${unit}`);
        }
    };

    const handleChangeUnit = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const newUnit = e.target.value;
        setUnit(newUnit);
        if (numericVal) {
            onChange(`${numericVal}${newUnit}`);
        }
    };

    return (
        <div className="flex w-full">
            <input
                type="number"
                min="0"
                step={type === 'cpu' ? '0.1' : '1'}
                value={numericVal}
                onChange={handleChangeNum}
                placeholder={type === 'cpu' ? '100' : '128'}
                className="flex-1 min-w-0 w-full rounded-l-md border border-r-0 border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 px-3 py-2 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:z-10 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            />
            <select
                value={unit}
                onChange={handleChangeUnit}
                className="w-20 rounded-r-md border border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 px-2 py-2 text-sm text-slate-600 dark:text-slate-200 focus:z-10 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all cursor-pointer"
            >
                {type === 'cpu' ? (
                    <>
                        <option value="m">m</option>
                        <option value="">Core</option>
                    </>
                ) : (
                    <>
                        <option value="Mi">Mi</option>
                        <option value="Gi">Gi</option>
                        <option value="Ti">Ti</option>
                        <option value="Ki">Ki</option>
                        <option value="">B</option>
                    </>
                )}
            </select>
        </div>
    );
};
