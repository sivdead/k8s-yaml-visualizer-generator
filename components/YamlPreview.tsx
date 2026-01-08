import React from 'react';
import { Highlight, themes } from 'prism-react-renderer';

interface YamlPreviewProps {
    code: string;
    filename: string;
}

/**
 * YAML 语法高亮预览组件
 */
export const YamlPreview: React.FC<YamlPreviewProps> = ({ code, filename }) => {
    return (
        <div className="w-full bg-[#1e1e1e] flex flex-col border-l border-slate-800 shadow-xl h-full">
            <div className="p-3 bg-[#252526] text-slate-400 text-xs font-mono border-b border-[#333] flex justify-between items-center flex-shrink-0">
                <span>PREVIEW: {filename}</span>
                <span className="text-[10px] px-2 py-0.5 rounded bg-blue-900 text-blue-200">YAML</span>
            </div>
            <div className="flex-1 overflow-auto p-4 custom-scrollbar">
                <Highlight
                    theme={themes.vsDark}
                    code={code}
                    language="yaml"
                >
                    {({ className, style, tokens, getLineProps, getTokenProps }) => (
                        <pre
                            className={`${className} font-mono text-sm leading-relaxed`}
                            style={{ ...style, background: 'transparent', margin: 0 }}
                        >
                            {tokens.map((line, i) => (
                                <div key={i} {...getLineProps({ line })} className="table-row">
                                    <span className="table-cell pr-4 text-slate-600 select-none text-right w-8">
                                        {i + 1}
                                    </span>
                                    <span className="table-cell">
                                        {line.map((token, key) => (
                                            <span key={key} {...getTokenProps({ token })} />
                                        ))}
                                    </span>
                                </div>
                            ))}
                        </pre>
                    )}
                </Highlight>
            </div>
        </div>
    );
};
