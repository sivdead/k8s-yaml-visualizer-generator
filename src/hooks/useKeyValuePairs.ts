import { useState, useEffect } from 'react';

/**
 * Hook to manage key-value pairs for ConfigMap and Secret data
 * Converts between Record<string, string> and Array<{key, value}> for easier UI manipulation
 */
export function useKeyValuePairs(
    data: Record<string, string>,
    onChange: (data: Record<string, string>) => void
) {
    const [entries, setEntries] = useState<{ key: string; value: string }[]>([]);

    // Sync entries from data prop
    useEffect(() => {
        setEntries(Object.entries(data).map(([key, value]) => ({ key, value })));
    }, [data]);

    const updateEntry = (index: number, field: 'key' | 'value', val: string) => {
        const newEntries = [...entries];
        newEntries[index] = { ...newEntries[index], [field]: val };
        setEntries(newEntries);
        syncData(newEntries);
    };

    const addEntry = () => {
        setEntries([...entries, { key: '', value: '' }]);
        // Don't sync immediately to avoid empty key issues
    };

    const removeEntry = (index: number) => {
        const newEntries = entries.filter((_, i) => i !== index);
        setEntries(newEntries);
        syncData(newEntries);
    };

    const syncData = (currentEntries: { key: string; value: string }[]) => {
        const dataObj: Record<string, string> = {};
        currentEntries.forEach(e => {
            if (e.key) dataObj[e.key] = e.value;
        });
        onChange(dataObj);
    };

    return { entries, updateEntry, addEntry, removeEntry };
}
