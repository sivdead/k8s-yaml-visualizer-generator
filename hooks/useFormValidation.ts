import { useState, useCallback } from 'react';

export interface ValidationError {
    field: string;
    message: string;
}

export interface ValidationResult {
    isValid: boolean;
    errors: ValidationError[];
}

/**
 * K8s 资源验证规则
 */
export const validators = {
    // 名称验证 - 必须符合 K8s DNS-1123 标准
    name: (value: string): string | null => {
        if (!value || value.trim() === '') {
            return '名称不能为空';
        }
        if (value.length > 253) {
            return '名称不能超过 253 个字符';
        }
        if (!/^[a-z0-9]([-a-z0-9]*[a-z0-9])?$/.test(value)) {
            return '名称必须由小写字母、数字和连字符组成，且以字母或数字开头和结尾';
        }
        return null;
    },

    // 命名空间验证
    namespace: (value: string): string | null => {
        if (!value || value.trim() === '') {
            return '命名空间不能为空';
        }
        if (!/^[a-z0-9]([-a-z0-9]*[a-z0-9])?$/.test(value)) {
            return '命名空间必须由小写字母、数字和连字符组成';
        }
        return null;
    },

    // 镜像验证
    image: (value: string): string | null => {
        if (!value || value.trim() === '') {
            return '镜像不能为空';
        }
        return null;
    },

    // 端口验证
    port: (value: number | string): string | null => {
        const numValue = typeof value === 'string' ? parseInt(value, 10) : value;
        if (isNaN(numValue) || numValue < 1 || numValue > 65535) {
            return '端口必须是 1-65535 之间的数字';
        }
        return null;
    },

    // 副本数验证
    replicas: (value: number | string): string | null => {
        const numValue = typeof value === 'string' ? parseInt(value, 10) : value;
        if (isNaN(numValue) || numValue < 0) {
            return '副本数必须是非负整数';
        }
        return null;
    },

    // 必填字段验证
    required: (value: string, fieldName: string): string | null => {
        if (!value || value.trim() === '') {
            return `${fieldName}不能为空`;
        }
        return null;
    },

    // Cron 表达式验证
    cronSchedule: (value: string): string | null => {
        if (!value || value.trim() === '') {
            return 'Cron 表达式不能为空';
        }
        // 简单验证：5 个空格分隔的部分
        const parts = value.trim().split(/\s+/);
        if (parts.length !== 5) {
            return 'Cron 表达式必须包含 5 个字段（分 时 日 月 周）';
        }
        return null;
    },

    // 存储大小验证
    storage: (value: string): string | null => {
        if (!value || value.trim() === '') {
            return '存储大小不能为空';
        }
        if (!/^\d+(\.\d+)?(Ki|Mi|Gi|Ti|Pi|Ei)?$/.test(value)) {
            return '存储格式无效，例如: 8Gi, 500Mi';
        }
        return null;
    },
};

/**
 * 表单验证 Hook
 */
export function useFormValidation<T extends Record<string, any>>() {
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [touched, setTouched] = useState<Record<string, boolean>>({});

    const validate = useCallback((field: string, value: any, validator: (val: any) => string | null) => {
        const error = validator(value);
        setErrors(prev => {
            if (error) {
                return { ...prev, [field]: error };
            } else {
                const { [field]: _, ...rest } = prev;
                return rest;
            }
        });
        return error === null;
    }, []);

    const touch = useCallback((field: string) => {
        setTouched(prev => ({ ...prev, [field]: true }));
    }, []);

    const getError = useCallback((field: string): string | undefined => {
        return touched[field] ? errors[field] : undefined;
    }, [errors, touched]);

    const hasError = useCallback((field: string): boolean => {
        return touched[field] && !!errors[field];
    }, [errors, touched]);

    const clearErrors = useCallback(() => {
        setErrors({});
        setTouched({});
    }, []);

    const isFormValid = useCallback(() => {
        return Object.keys(errors).length === 0;
    }, [errors]);

    return {
        errors,
        touched,
        validate,
        touch,
        getError,
        hasError,
        clearErrors,
        isFormValid,
    };
}
