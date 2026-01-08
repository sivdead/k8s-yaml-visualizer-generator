import React from 'react';

interface FormFieldProps {
    label: string;
    error?: string;
    required?: boolean;
    children: React.ReactNode;
    helpText?: string;
}

/**
 * 表单字段包装组件，显示标签、错误信息和帮助文本
 */
export const FormField: React.FC<FormFieldProps> = ({
    label,
    error,
    required = false,
    children,
    helpText,
}) => {
    return (
        <div className="space-y-1">
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                {label}
                {required && <span className="text-red-500 ml-0.5">*</span>}
            </label>
            <div className={error ? 'relative' : ''}>
                {children}
            </div>
            {error && (
                <p className="text-xs text-red-500 flex items-center gap-1 mt-1">
                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    {error}
                </p>
            )}
            {helpText && !error && (
                <p className="text-xs text-slate-400">{helpText}</p>
            )}
        </div>
    );
};

interface ValidatedInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    error?: string;
}

/**
 * 带验证状态的输入框
 */
export const ValidatedInput: React.FC<ValidatedInputProps> = ({
    error,
    className = '',
    ...props
}) => {
    const baseClass = 'w-full rounded-md border px-3 py-2 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:border-transparent transition-all';
    const normalClass = 'border-slate-300 bg-white focus:ring-blue-500 dark:bg-slate-700 dark:border-slate-600 dark:text-white';
    const errorClass = 'border-red-400 bg-red-50 focus:ring-red-500 dark:bg-red-900/20 dark:border-red-600';

    return (
        <input
            {...props}
            className={`${baseClass} ${error ? errorClass : normalClass} ${className}`}
        />
    );
};
