import React from 'react';
import { useToast } from '../contexts/AppContext';
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from 'lucide-react';

/**
 * Toast 通知容器组件
 */
export const ToastContainer: React.FC = () => {
    const { toasts, removeToast } = useToast();

    if (toasts.length === 0) return null;

    const getIcon = (type: string) => {
        switch (type) {
            case 'success': return <CheckCircle size={18} className="text-green-500" />;
            case 'error': return <AlertCircle size={18} className="text-red-500" />;
            case 'warning': return <AlertTriangle size={18} className="text-amber-500" />;
            default: return <Info size={18} className="text-blue-500" />;
        }
    };

    const getBgColor = (type: string) => {
        switch (type) {
            case 'success': return 'bg-green-50 border-green-200 dark:bg-green-900/30 dark:border-green-800';
            case 'error': return 'bg-red-50 border-red-200 dark:bg-red-900/30 dark:border-red-800';
            case 'warning': return 'bg-amber-50 border-amber-200 dark:bg-amber-900/30 dark:border-amber-800';
            default: return 'bg-blue-50 border-blue-200 dark:bg-blue-900/30 dark:border-blue-800';
        }
    };

    return (
        <div className="fixed top-4 right-4 z-[100] flex flex-col gap-2 max-w-sm">
            {toasts.map((toast) => (
                <div
                    key={toast.id}
                    className={`flex items-center gap-3 px-4 py-3 rounded-lg border shadow-lg animate-slide-in ${getBgColor(toast.type)}`}
                >
                    {getIcon(toast.type)}
                    <span className="flex-1 text-sm text-slate-800 dark:text-slate-200">{toast.message}</span>
                    <button
                        onClick={() => removeToast(toast.id)}
                        className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
                    >
                        <X size={16} />
                    </button>
                </div>
            ))}
        </div>
    );
};
