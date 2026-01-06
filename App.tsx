
import React, { useState, useEffect, useCallback } from 'react';
import { toYaml, downloadYaml, parseYaml } from './services/yamlUtils';
import { defaultDeployment, defaultService, defaultConfigMap, defaultIngress, defaultPVC } from './services/templates';
import { ResourceType, K8sResource } from './types';
import { DeploymentForm } from './components/forms/DeploymentForm';
import { ServiceForm } from './components/forms/ServiceForm';
import { ConfigMapForm } from './components/forms/ConfigMapForm';
import { IngressForm } from './components/forms/IngressForm';
import { PVCForm } from './components/forms/PVCForm';
import { ImportModal } from './components/modals/ImportModal';
import { LanguageProvider, useLanguage } from './contexts/LanguageContext';
import {
  Box,
  Layers,
  FileText,
  Download,
  Copy,
  Check,
  Globe,
  HardDrive,
  Languages,
  Save,
  Trash2,
  FolderOpen,
  X,
  Upload
} from 'lucide-react';

interface SavedConfig {
  id: string;
  name: string;
  type: ResourceType;
  data: K8sResource;
  timestamp: number;
}

const STORAGE_KEY = 'k8s_generator_saved_configs';

const AppContent = () => {
  const { t, language, setLanguage } = useLanguage();
  const [resourceType, setResourceType] = useState<ResourceType>('deployment');
  const [formData, setFormData] = useState<K8sResource>(defaultDeployment);
  const [yamlOutput, setYamlOutput] = useState('');
  const [copied, setCopied] = useState(false);
  const [savedConfigs, setSavedConfigs] = useState<SavedConfig[]>([]);
  const [isSaveModalOpen, setIsSaveModalOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [configName, setConfigName] = useState('');

  // Resizable Preview State
  const [previewWidth, setPreviewWidth] = useState(500);
  const [isDragging, setIsDragging] = useState(false);
  const [isDesktop, setIsDesktop] = useState(typeof window !== 'undefined' ? window.innerWidth >= 1024 : true);

  // Load saved configs on mount
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        setSavedConfigs(JSON.parse(stored));
      } catch (e) {
        console.error("Failed to load saved configs", e);
      }
    }
  }, []);

  // Sync saved configs to localStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(savedConfigs));
  }, [savedConfigs]);

  // Update YAML when form data changes
  useEffect(() => {
    setYamlOutput(toYaml(formData));
  }, [formData]);

  // Handle window resize for responsive layout
  useEffect(() => {
    const handleResize = () => setIsDesktop(window.innerWidth >= 1024);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Drag Resizing Logic
  const startResizing = useCallback(() => {
    setIsDragging(true);
  }, []);

  const stopResizing = useCallback(() => {
    setIsDragging(false);
  }, []);

  const resize = useCallback(
    (mouseMoveEvent: MouseEvent) => {
      if (isDragging) {
        const newWidth = document.body.clientWidth - mouseMoveEvent.clientX;
        if (newWidth > 300 && newWidth < 1200) {
          setPreviewWidth(newWidth);
        }
      }
    },
    [isDragging]
  );

  useEffect(() => {
    if (isDragging) {
      window.addEventListener("mousemove", resize);
      window.addEventListener("mouseup", stopResizing);
      document.body.style.userSelect = 'none';
      document.body.style.cursor = 'col-resize';
    } else {
      window.removeEventListener("mousemove", resize);
      window.removeEventListener("mouseup", stopResizing);
      document.body.style.userSelect = '';
      document.body.style.cursor = '';
    }
    return () => {
      window.removeEventListener("mousemove", resize);
      window.removeEventListener("mouseup", stopResizing);
    };
  }, [isDragging, resize, stopResizing]);

  const handleTypeChange = (type: ResourceType) => {
    setResourceType(type);
    switch (type) {
      case 'deployment': setFormData(defaultDeployment); break;
      case 'service': setFormData(defaultService); break;
      case 'configmap': setFormData(defaultConfigMap); break;
      case 'ingress': setFormData(defaultIngress); break;
      case 'pvc': setFormData(defaultPVC); break;
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(yamlOutput);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    downloadYaml(`${formData.metadata.name}-${resourceType}.yaml`, yamlOutput);
  };

  const handleSaveConfig = () => {
    if (!configName.trim()) return;
    const newConfig: SavedConfig = {
      id: Date.now().toString(),
      name: configName.trim(),
      type: resourceType,
      data: JSON.parse(JSON.stringify(formData)), // Deep copy
      timestamp: Date.now()
    };
    setSavedConfigs([newConfig, ...savedConfigs]);
    setIsSaveModalOpen(false);
    setConfigName('');
  };

  const loadConfig = (config: SavedConfig) => {
    setResourceType(config.type);
    setFormData(config.data);
  };

  const handleImport = (yamlContent: string) => {
    const parsed = parseYaml(yamlContent);
    if (!parsed || !parsed.kind) {
      throw new Error("Invalid YAML: Missing 'kind' field");
    }

    const kindMap: Record<string, ResourceType> = {
      'Deployment': 'deployment',
      'Service': 'service',
      'ConfigMap': 'configmap',
      'Ingress': 'ingress',
      'PersistentVolumeClaim': 'pvc'
    };

    const type = kindMap[parsed.kind];
    if (!type) {
      throw new Error(`Unsupported resource kind: ${parsed.kind}`);
    }

    setResourceType(type);
    setFormData(parsed);
  };

  const deleteConfig = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setSavedConfigs(savedConfigs.filter(c => c.id !== id));
  };

  const NavItem = ({ type, label, icon: Icon }: { type: ResourceType; label: string; icon: any }) => (
    <button
      onClick={() => handleTypeChange(type)}
      className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 ${resourceType === type
          ? 'bg-blue-50 text-blue-700 shadow-sm border border-blue-100'
          : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
        }`}
    >
      <Icon size={18} />
      {label}
    </button>
  );

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row font-sans">

      {/* Sidebar */}
      <aside className="w-full md:w-64 bg-white border-r border-slate-200 flex-shrink-0 flex flex-col h-screen sticky top-0">
        <div className="p-6 border-b border-slate-100">
          <div className="flex items-center gap-2 text-blue-600">
            <div className="p-2 bg-blue-600 rounded-lg text-white">
              <Box size={24} />
            </div>
            <span className="font-bold text-xl text-slate-900 tracking-tight">K8s Gen</span>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-2 overflow-y-auto custom-scrollbar">
          <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider px-4 mb-2">{t.nav.workloads}</div>
          <NavItem type="deployment" label={t.nav.deployment} icon={Layers} />

          <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider px-4 mb-2 mt-6">{t.nav.network}</div>
          <NavItem type="service" label={t.nav.service} icon={Box} />
          <NavItem type="ingress" label={t.nav.ingress} icon={Globe} />

          <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider px-4 mb-2 mt-6">{t.nav.config}</div>
          <NavItem type="configmap" label={t.nav.configmap} icon={FileText} />
          <NavItem type="pvc" label={t.nav.pvc} icon={HardDrive} />

          <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider px-4 mb-2 mt-8 flex items-center gap-2">
            <FolderOpen size={14} /> {t.nav.saved}
          </div>
          <div className="space-y-1">
            {savedConfigs.length === 0 ? (
              <div className="px-4 py-2 text-xs text-slate-400 italic">{t.nav.noSaved}</div>
            ) : (
              savedConfigs.map(config => (
                <div
                  key={config.id}
                  onClick={() => loadConfig(config)}
                  className="group flex items-center justify-between px-4 py-2 rounded-md text-xs font-medium text-slate-600 hover:bg-slate-100 cursor-pointer transition-colors"
                >
                  <div className="truncate flex-1">
                    <span className="text-blue-500 font-bold mr-1">[{config.type.slice(0, 3).toUpperCase()}]</span>
                    {config.name}
                  </div>
                  <button
                    onClick={(e) => deleteConfig(config.id, e)}
                    className="opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-red-500 transition-all"
                  >
                    <Trash2 size={12} />
                  </button>
                </div>
              ))
            )}
          </div>
        </nav>

        <div className="p-4 border-t border-slate-200 bg-slate-50">
          <div className="text-xs text-slate-400 italic">
            Visual YAML Builder v1.2
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* Header */}
        <header className="bg-white border-b border-slate-200 p-4 flex justify-between items-center shadow-sm z-10 flex-shrink-0">
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-semibold text-slate-800 capitalize">
              {t.nav[resourceType]} {t.header.config}
            </h1>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setLanguage(language === 'en' ? 'zh' : 'en')}
              className="flex items-center gap-1.5 px-3 py-2 text-slate-600 hover:bg-slate-100 rounded-md text-sm font-medium transition-colors border border-slate-200"
            >
              <Languages size={16} />
              {language === 'en' ? '中文' : 'English'}
            </button>

            <div className="h-6 w-px bg-slate-200 mx-1"></div>

            <button
              onClick={() => setIsSaveModalOpen(true)}
              className="flex items-center gap-2 px-3 py-2 text-blue-600 hover:bg-blue-50 rounded-md text-sm font-medium transition-colors border border-blue-100"
            >
              <Save size={16} />
              {t.header.save}
            </button>

            <button
              onClick={() => setIsImportModalOpen(true)}
              className="flex items-center gap-2 px-3 py-2 text-slate-600 hover:bg-slate-100 rounded-md text-sm font-medium transition-colors border border-slate-200"
            >
              <Upload size={16} />
              {t.header.import || "Import"}
            </button>

            <button
              onClick={handleCopy}
              className="flex items-center gap-2 px-3 py-2 text-slate-600 hover:bg-slate-100 rounded-md text-sm font-medium transition-colors border border-slate-200"
            >
              {copied ? <Check size={16} className="text-green-600" /> : <Copy size={16} />}
              {copied ? t.header.copied : t.header.copy}
            </button>
            <button
              onClick={handleDownload}
              className="flex items-center gap-2 px-3 py-2 bg-slate-900 text-white rounded-md text-sm font-medium hover:bg-slate-800 transition-colors"
            >
              <Download size={16} />
              {t.header.export}
            </button>
          </div>
        </header>

        {/* Content Split */}
        <div className="flex-1 flex flex-col lg:flex-row overflow-hidden relative">

          {/* Form Area */}
          <div className="flex-1 overflow-y-auto p-6 bg-slate-50 min-w-[320px] custom-scrollbar">
            <div className="max-w-3xl mx-auto bg-white rounded-xl shadow-sm border border-slate-200 p-6">
              {resourceType === 'deployment' && <DeploymentForm data={formData as any} onChange={setFormData} />}
              {resourceType === 'service' && <ServiceForm data={formData as any} onChange={setFormData} />}
              {resourceType === 'configmap' && <ConfigMapForm data={formData as any} onChange={setFormData} />}
              {resourceType === 'ingress' && <IngressForm data={formData as any} onChange={setFormData} />}
              {resourceType === 'pvc' && <PVCForm data={formData as any} onChange={setFormData} />}
            </div>
          </div>

          {/* Resizer Handle */}
          <div
            className="hidden lg:flex w-1 hover:w-1.5 bg-slate-200 hover:bg-blue-500 cursor-col-resize items-center justify-center transition-all z-20 flex-shrink-0 border-l border-slate-200"
            onMouseDown={startResizing}
          >
          </div>

          {/* Preview Area */}
          <div
            className="w-full bg-[#1e1e1e] flex flex-col border-l border-slate-800 shadow-xl flex-shrink-0"
            style={{ width: isDesktop ? previewWidth : '100%' }}
          >
            <div className="p-3 bg-[#252526] text-slate-400 text-xs font-mono border-b border-[#333] flex justify-between items-center">
              <span>{t.header.preview}: {formData.metadata.name}.yaml</span>
              <span className="text-[10px] px-2 py-0.5 rounded bg-blue-900 text-blue-200">YAML</span>
            </div>
            <div className="flex-1 overflow-auto p-4 custom-scrollbar">
              <pre className="font-mono text-sm text-[#d4d4d4] leading-relaxed whitespace-pre-wrap break-all lg:whitespace-pre lg:break-normal">
                <code>{yamlOutput}</code>
              </pre>
            </div>
          </div>
        </div>
      </main>

      {/* Save Modal */}
      {isSaveModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm overflow-hidden flex flex-col">
            <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-blue-600 text-white">
              <div className="flex items-center gap-2">
                <Save size={18} />
                <h2 className="font-semibold">{t.header.saveTitle}</h2>
              </div>
              <button onClick={() => setIsSaveModalOpen(false)} className="hover:bg-white/20 p-1 rounded transition-colors">
                <X size={20} />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">{t.header.configName}</label>
                <input
                  type="text"
                  autoFocus
                  className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  value={configName}
                  onChange={(e) => setConfigName(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSaveConfig()}
                  placeholder="e.g. Production Nginx"
                />
              </div>
              <button
                onClick={handleSaveConfig}
                disabled={!configName.trim()}
                className="w-full py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700 transition-colors disabled:opacity-50"
              >
                {t.header.saveBtn}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Import Modal */}
      <ImportModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        onImport={handleImport}
      />
    </div>
  );
};

import { Analytics } from '@vercel/analytics/react';

const App = () => (
  <LanguageProvider>
    <AppContent />
    <Analytics />
  </LanguageProvider>
);

export default App;
