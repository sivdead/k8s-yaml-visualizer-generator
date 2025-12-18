
import React, { useState, useEffect, useCallback } from 'react';
import { toYaml, downloadYaml } from './services/yamlUtils';
import { defaultDeployment, defaultService, defaultConfigMap, defaultIngress, defaultPVC } from './services/templates';
import { ResourceType, K8sResource } from './types';
import { DeploymentForm } from './components/forms/DeploymentForm';
import { ServiceForm } from './components/forms/ServiceForm';
import { ConfigMapForm } from './components/forms/ConfigMapForm';
import { IngressForm } from './components/forms/IngressForm';
import { PVCForm } from './components/forms/PVCForm';
import { AiAssistant } from './components/AiAssistant';
import { LanguageProvider, useLanguage } from './contexts/LanguageContext';
import { 
  Box, 
  Layers, 
  FileText, 
  Download, 
  Copy, 
  Check, 
  Wand2,
  Globe,
  HardDrive,
  Languages
} from 'lucide-react';

const AppContent = () => {
  const { t, language, setLanguage } = useLanguage();
  const [resourceType, setResourceType] = useState<ResourceType>('deployment');
  const [formData, setFormData] = useState<K8sResource>(defaultDeployment);
  const [yamlOutput, setYamlOutput] = useState('');
  const [copied, setCopied] = useState(false);
  const [isAiOpen, setIsAiOpen] = useState(false);

  // Resizable Preview State
  const [previewWidth, setPreviewWidth] = useState(500);
  const [isDragging, setIsDragging] = useState(false);
  const [isDesktop, setIsDesktop] = useState(typeof window !== 'undefined' ? window.innerWidth >= 1024 : true);

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
        // Calculate new width based on distance from right edge
        const newWidth = document.body.clientWidth - mouseMoveEvent.clientX;
        // Min 300px, Max 1200px
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
      document.body.style.userSelect = '';
      document.body.style.cursor = '';
    };
  }, [isDragging, resize, stopResizing]);


  // Reset form when resource type changes
  const handleTypeChange = (type: ResourceType) => {
    setResourceType(type);
    switch (type) {
      case 'deployment':
        setFormData(defaultDeployment);
        break;
      case 'service':
        setFormData(defaultService);
        break;
      case 'configmap':
        setFormData(defaultConfigMap);
        break;
      case 'ingress':
        setFormData(defaultIngress);
        break;
      case 'pvc':
        setFormData(defaultPVC);
        break;
      default:
        setFormData(defaultDeployment);
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

  const NavItem = ({ type, label, icon: Icon }: { type: ResourceType; label: string; icon: any }) => (
    <button
      onClick={() => handleTypeChange(type)}
      className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 ${
        resourceType === type 
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
        
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider px-4 mb-2">{t.nav.workloads}</div>
          <NavItem type="deployment" label={t.nav.deployment} icon={Layers} />
          
          <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider px-4 mb-2 mt-6">{t.nav.network}</div>
          <NavItem type="service" label={t.nav.service} icon={Box} />
          <NavItem type="ingress" label={t.nav.ingress} icon={Globe} />
          
          <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider px-4 mb-2 mt-6">{t.nav.config}</div>
          <NavItem type="configmap" label={t.nav.configmap} icon={FileText} />
          <NavItem type="pvc" label={t.nav.pvc} icon={HardDrive} />
        </nav>

        <div className="p-4 border-t border-slate-200 bg-slate-50">
          <div className="text-xs text-slate-500">
            {t.nav.apiKey}: <span className={process.env.API_KEY ? "text-green-600 font-medium" : "text-red-500 font-medium"}>
              {process.env.API_KEY ? t.nav.active : t.nav.missing}
            </span>
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

             <button 
              onClick={() => setIsAiOpen(true)}
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-violet-600 to-indigo-600 text-white rounded-md text-sm font-medium hover:opacity-90 transition-all shadow-md shadow-indigo-200"
            >
              <Wand2 size={16} />
              {t.header.ai}
            </button>
            <div className="h-6 w-px bg-slate-200 mx-1"></div>
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
          <div className="flex-1 overflow-y-auto p-6 bg-slate-50 min-w-[320px]">
            <div className="max-w-3xl mx-auto bg-white rounded-xl shadow-sm border border-slate-200 p-6">
              {resourceType === 'deployment' && (
                <DeploymentForm 
                  data={formData as any} 
                  onChange={(d) => setFormData(d)} 
                />
              )}
              {resourceType === 'service' && (
                <ServiceForm 
                  data={formData as any} 
                  onChange={(d) => setFormData(d)} 
                />
              )}
              {resourceType === 'configmap' && (
                <ConfigMapForm 
                  data={formData as any}
                  onChange={(d) => setFormData(d)}
                />
              )}
              {resourceType === 'ingress' && (
                <IngressForm 
                  data={formData as any}
                  onChange={(d) => setFormData(d)}
                />
              )}
               {resourceType === 'pvc' && (
                <PVCForm 
                  data={formData as any}
                  onChange={(d) => setFormData(d)}
                />
              )}
            </div>
          </div>

          {/* Resizer Handle (Desktop Only) */}
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
               <pre className="font-mono text-sm text-[#d4d4d4] leading-relaxed">
                 <code>{yamlOutput}</code>
               </pre>
             </div>
          </div>
        </div>
      </main>

      <AiAssistant 
        isOpen={isAiOpen} 
        onClose={() => setIsAiOpen(false)}
        onApply={(data) => setFormData(data)}
        resourceType={resourceType}
      />

    </div>
  );
};

const App = () => (
  <LanguageProvider>
    <AppContent />
  </LanguageProvider>
);

export default App;
