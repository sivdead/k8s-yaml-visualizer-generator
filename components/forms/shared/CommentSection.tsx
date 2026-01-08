import React from 'react';
import { MessageSquare } from 'lucide-react';
import { useLanguage } from '../../../contexts/LanguageContext';

interface CommentSectionProps {
    value?: string;
    onChange: (comment: string) => void;
}

/**
 * YAML 注释输入组件
 * 用户输入的内容将在生成的 YAML 顶部以 # 注释形式显示
 */
export const CommentSection: React.FC<CommentSectionProps> = ({ value = '', onChange }) => {
    const { t } = useLanguage();

    return (
        <div className="mb-4 p-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
                <MessageSquare size={16} className="text-amber-600 dark:text-amber-400" />
                <label className="text-sm font-medium text-amber-800 dark:text-amber-300">
                    {t.common?.comment || '备注/注释'}
                </label>
            </div>
            <textarea
                value={value}
                onChange={(e) => onChange(e.target.value)}
                placeholder={t.common?.commentPlaceholder || '添加注释说明，将显示在 YAML 文件顶部...'}
                className="w-full h-20 rounded-md border border-amber-300 dark:border-amber-700 bg-white dark:bg-slate-800 px-3 py-2 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all resize-none"
            />
            <p className="mt-1 text-xs text-amber-600 dark:text-amber-400">
                {t.common?.commentHint || '注释内容将以 # 开头显示在生成的 YAML 文件顶部'}
            </p>
        </div>
    );
};
