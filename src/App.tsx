import React, { useState, useEffect, useCallback, lazy, Suspense } from 'react';
import { Routes, Route, Navigate, useNavigate, useParams, useLocation, NavLink } from 'react-router-dom';
import { toYaml, downloadYaml, parseYaml } from './services/yamlUtils';
import { defaultDeployment, defaultService, defaultConfigMap, defaultIngress, defaultPVC, defaultSecret, defaultCronJob, defaultJob, defaultDaemonSet, defaultStatefulSet, defaultHPA } from './services/templates';
import { ResourceType, K8sResource } from './types';
import { isDeployment, isService, isConfigMap, isIngress, isPVC, isSecret, isCronJob, isJob, isDaemonSet, isStatefulSet, isHPA } from './utils/typeGuards';
import { trackEvent } from './utils/analytics';
import { ToastContainer } from './components/ToastContainer';
import { SeoContent } from './components/SeoContent';
import { LanguageProvider, useLanguage } from './contexts/LanguageContext';
import { AppContextProvider, useTheme, useToast } from './contexts/AppContext';
import { Analytics } from '@vercel/analytics/react';
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
  Upload,
  Key,
  Clock,
  Moon,
  Sun,
  Play,
  Server,
  Database,
  TrendingUp,
  Network,
  LayoutGrid
} from 'lucide-react';

const DeploymentForm = lazy(() => import('./components/forms/DeploymentForm').then(module => ({ default: module.DeploymentForm })));
const ServiceForm = lazy(() => import('./components/forms/ServiceForm').then(module => ({ default: module.ServiceForm })));
const ConfigMapForm = lazy(() => import('./components/forms/ConfigMapForm').then(module => ({ default: module.ConfigMapForm })));
const IngressForm = lazy(() => import('./components/forms/IngressForm').then(module => ({ default: module.IngressForm })));
const PVCForm = lazy(() => import('./components/forms/PVCForm').then(module => ({ default: module.PVCForm })));
const SecretForm = lazy(() => import('./components/forms/SecretForm').then(module => ({ default: module.SecretForm })));
const CronJobForm = lazy(() => import('./components/forms/CronJobForm').then(module => ({ default: module.CronJobForm })));
const JobForm = lazy(() => import('./components/forms/JobForm').then(module => ({ default: module.JobForm })));
const DaemonSetForm = lazy(() => import('./components/forms/DaemonSetForm').then(module => ({ default: module.DaemonSetForm })));
const StatefulSetForm = lazy(() => import('./components/forms/StatefulSetForm').then(module => ({ default: module.StatefulSetForm })));
const HPAForm = lazy(() => import('./components/forms/HPAForm').then(module => ({ default: module.HPAForm })));
const ImportModal = lazy(() => import('./components/modals/ImportModal').then(module => ({ default: module.ImportModal })));
const ExportModal = lazy(() => import('./components/modals/ExportModal').then(module => ({ default: module.ExportModal })));
const TemplateModal = lazy(() => import('./components/modals/TemplateModal').then(module => ({ default: module.TemplateModal })));
const YamlPreview = lazy(() => import('./components/YamlPreview').then(module => ({ default: module.YamlPreview })));
const ValidationPanel = lazy(() => import('./components/ValidationPanel').then(module => ({ default: module.ValidationPanel })));
const TopologyView = lazy(() => import('./components/topology').then(module => ({ default: module.TopologyView })));

interface SavedConfig {
  id: string;
  name: string;
  type: ResourceType;
  data: K8sResource;
  timestamp: number;
}

const STORAGE_KEY = 'k8s_generator_saved_configs';

const VALID_TYPES: ResourceType[] = [
  'deployment', 'service', 'configmap', 'ingress', 'pvc', 'secret',
  'cronjob', 'job', 'daemonset', 'statefulset', 'hpa'
];

// Helper to get default data by type
const getDefaultData = (type: ResourceType): K8sResource => {
  switch (type) {
    case 'deployment': return JSON.parse(JSON.stringify(defaultDeployment));
    case 'service': return JSON.parse(JSON.stringify(defaultService));
    case 'configmap': return JSON.parse(JSON.stringify(defaultConfigMap));
    case 'ingress': return JSON.parse(JSON.stringify(defaultIngress));
    case 'pvc': return JSON.parse(JSON.stringify(defaultPVC));
    case 'secret': return JSON.parse(JSON.stringify(defaultSecret));
    case 'cronjob': return JSON.parse(JSON.stringify(defaultCronJob));
    case 'job': return JSON.parse(JSON.stringify(defaultJob));
    case 'daemonset': return JSON.parse(JSON.stringify(defaultDaemonSet));
    case 'statefulset': return JSON.parse(JSON.stringify(defaultStatefulSet));
    case 'hpa': return JSON.parse(JSON.stringify(defaultHPA));
    default: return JSON.parse(JSON.stringify(defaultDeployment));
  }
};

const SEO_BASE_URL = 'https://k8sgen.sivd.dev';

const SEO_META: Record<ResourceType, { title: string; description: string; keywords: string }> = {
  deployment: {
    title: 'Kubernetes Deployment YAML Generator',
    description: 'Create Kubernetes Deployment manifests instantly. Configure replicas, containers, probes, and labels visually.',
    keywords: 'kubernetes deployment yaml, k8s deployment example, deployment manifest generator'
  },
  service: {
    title: 'Kubernetes Service YAML Generator',
    description: 'Generate Kubernetes Service YAML with ClusterIP, NodePort, and LoadBalancer options.',
    keywords: 'kubernetes service yaml, k8s service manifest, clusterip nodeport loadbalancer'
  },
  configmap: {
    title: 'Kubernetes ConfigMap YAML Generator',
    description: 'Build Kubernetes ConfigMap manifests with key-value pairs for app configuration.',
    keywords: 'kubernetes configmap yaml, configmap example, k8s config data'
  },
  ingress: {
    title: 'Kubernetes Ingress YAML Builder',
    description: 'Create Kubernetes Ingress manifests with host rules, paths, backends, and TLS settings.',
    keywords: 'kubernetes ingress yaml, ingress nginx example, k8s ingress rules'
  },
  pvc: {
    title: 'PersistentVolumeClaim YAML Generator',
    description: 'Generate PersistentVolumeClaim YAML with storage class, access mode, and capacity settings.',
    keywords: 'kubernetes pvc yaml, persistent volume claim example, k8s storage manifest'
  },
  secret: {
    title: 'Kubernetes Secret YAML Generator',
    description: 'Generate Kubernetes Secret YAML safely for Opaque and Docker registry credentials.',
    keywords: 'kubernetes secret yaml, dockerconfigjson secret, k8s secret manifest'
  },
  cronjob: {
    title: 'Kubernetes CronJob YAML Generator',
    description: 'Create Kubernetes CronJob YAML for scheduled workloads with retry and template settings.',
    keywords: 'kubernetes cronjob yaml, cronjob schedule k8s, scheduled job manifest'
  },
  job: {
    title: 'Kubernetes Job YAML Generator',
    description: 'Create one-off Kubernetes Job manifests with completions, parallelism, and retry limits.',
    keywords: 'kubernetes job yaml, k8s batch job example, job manifest generator'
  },
  daemonset: {
    title: 'Kubernetes DaemonSet YAML Generator',
    description: 'Build DaemonSet YAML to run pods on every node for logs, monitoring, and platform agents.',
    keywords: 'kubernetes daemonset yaml, daemonset example, run pod on every node'
  },
  statefulset: {
    title: 'Kubernetes StatefulSet YAML Generator',
    description: 'Generate StatefulSet YAML for stateful workloads with stable identities and storage templates.',
    keywords: 'kubernetes statefulset yaml, statefulset example, volumeclaimtemplates'
  },
  hpa: {
    title: 'HorizontalPodAutoscaler YAML Generator',
    description: 'Create HPA YAML to autoscale workloads by CPU and memory usage thresholds.',
    keywords: 'kubernetes hpa yaml, autoscaling manifest, horizontal pod autoscaler example'
  }
};

const SEO_FAQ: Record<ResourceType, Array<{ question: string; answer: string }>> = {
  deployment: [
    {
      question: 'What is a Kubernetes Deployment used for?',
      answer: 'Deployment manages stateless workloads with replica scaling and rolling updates.'
    },
    {
      question: 'How do I generate a Deployment YAML quickly?',
      answer: 'Use this visual form, configure replicas and containers, then copy or export YAML directly.'
    }
  ],
  service: [
    {
      question: 'When should I use a Kubernetes Service?',
      answer: 'Use Service to expose Pods behind a stable virtual IP and load-balance traffic.'
    },
    {
      question: 'Which Service type should I choose?',
      answer: 'Use ClusterIP for internal traffic, NodePort for node-level access, and LoadBalancer for public cloud exposure.'
    }
  ],
  configmap: [
    {
      question: 'What is ConfigMap in Kubernetes?',
      answer: 'ConfigMap stores non-sensitive configuration such as environment values and app settings.'
    },
    {
      question: 'How do I mount ConfigMap values into Pods?',
      answer: 'Reference the ConfigMap using env, envFrom, or volume mounts in workload manifests.'
    }
  ],
  ingress: [
    {
      question: 'Why use Kubernetes Ingress?',
      answer: 'Ingress provides host/path based HTTP routing and TLS termination for Services.'
    },
    {
      question: 'What does ingressClassName do?',
      answer: 'ingressClassName selects the Ingress controller, such as nginx, to process rules.'
    }
  ],
  pvc: [
    {
      question: 'What is a PersistentVolumeClaim?',
      answer: 'PVC is a storage request that binds to a PersistentVolume for durable data.'
    },
    {
      question: 'How do I set PVC size and mode?',
      answer: 'Configure accessModes and resources.requests.storage according to your storage class capabilities.'
    }
  ],
  secret: [
    {
      question: 'What should be stored in a Kubernetes Secret?',
      answer: 'Store sensitive values such as passwords, tokens, and registry credentials in Secret.'
    },
    {
      question: 'Should I use data or stringData?',
      answer: 'Use stringData for easier authoring; Kubernetes converts it to encoded data automatically.'
    }
  ],
  cronjob: [
    {
      question: 'When should I use CronJob?',
      answer: 'Use CronJob for scheduled tasks such as backups, sync jobs, and periodic maintenance.'
    },
    {
      question: 'How do I validate cron syntax for Kubernetes?',
      answer: 'Set spec.schedule with a valid cron expression and verify it before deployment.'
    }
  ],
  job: [
    {
      question: 'What is Kubernetes Job used for?',
      answer: 'Job runs finite tasks and tracks completion with retries and optional parallelism.'
    },
    {
      question: 'How do I control retry behavior in Job?',
      answer: 'Use spec.backoffLimit and restartPolicy to define retry and failure behavior.'
    }
  ],
  daemonset: [
    {
      question: 'Why use DaemonSet instead of Deployment?',
      answer: 'DaemonSet runs one Pod on each selected node, ideal for node-level agents.'
    },
    {
      question: 'Can DaemonSet target specific nodes?',
      answer: 'Yes, use nodeSelector, affinity, and tolerations to control placement.'
    }
  ],
  statefulset: [
    {
      question: 'What workloads need StatefulSet?',
      answer: 'StatefulSet fits databases and systems that require stable identity and persistent storage.'
    },
    {
      question: 'How is StatefulSet different from Deployment?',
      answer: 'StatefulSet preserves pod identity and ordered rollout, while Deployment focuses on stateless scaling.'
    }
  ],
  hpa: [
    {
      question: 'What does HPA do in Kubernetes?',
      answer: 'HPA automatically scales replicas up or down based on resource metrics.'
    },
    {
      question: 'What should I configure first for HPA?',
      answer: 'Set scaleTargetRef, minReplicas, maxReplicas, and the target metric threshold.'
    }
  ]
};

const upsertMeta = (selector: string, create: () => HTMLElement, updater: (element: HTMLElement) => void): void => {
  const existing = document.head.querySelector<HTMLElement>(selector);
  const element = existing ?? create();
  updater(element);
  if (!existing) {
    document.head.appendChild(element);
  }
};

const SeoHead = ({ type }: { type: ResourceType }) => {
  useEffect(() => {
    const meta = SEO_META[type];
    const routeUrl = `${SEO_BASE_URL}/${type}`;
    const fullTitle = `${meta.title} | K8s YAML Generator`;

    document.title = fullTitle;

    upsertMeta('meta[name="description"]', () => {
      const tag = document.createElement('meta');
      tag.setAttribute('name', 'description');
      return tag;
    }, (tag) => tag.setAttribute('content', meta.description));

    upsertMeta('meta[name="keywords"]', () => {
      const tag = document.createElement('meta');
      tag.setAttribute('name', 'keywords');
      return tag;
    }, (tag) => tag.setAttribute('content', meta.keywords));

    upsertMeta('link[rel="canonical"]', () => {
      const link = document.createElement('link');
      link.setAttribute('rel', 'canonical');
      return link;
    }, (link) => link.setAttribute('href', routeUrl));

    upsertMeta('meta[property="og:url"]', () => {
      const tag = document.createElement('meta');
      tag.setAttribute('property', 'og:url');
      return tag;
    }, (tag) => tag.setAttribute('content', routeUrl));

    upsertMeta('meta[property="og:title"]', () => {
      const tag = document.createElement('meta');
      tag.setAttribute('property', 'og:title');
      return tag;
    }, (tag) => tag.setAttribute('content', fullTitle));

    upsertMeta('meta[property="og:description"]', () => {
      const tag = document.createElement('meta');
      tag.setAttribute('property', 'og:description');
      return tag;
    }, (tag) => tag.setAttribute('content', meta.description));

    upsertMeta('meta[property="twitter:url"]', () => {
      const tag = document.createElement('meta');
      tag.setAttribute('property', 'twitter:url');
      return tag;
    }, (tag) => tag.setAttribute('content', routeUrl));

    upsertMeta('meta[property="twitter:title"]', () => {
      const tag = document.createElement('meta');
      tag.setAttribute('property', 'twitter:title');
      return tag;
    }, (tag) => tag.setAttribute('content', fullTitle));

    upsertMeta('meta[property="twitter:description"]', () => {
      const tag = document.createElement('meta');
      tag.setAttribute('property', 'twitter:description');
      return tag;
    }, (tag) => tag.setAttribute('content', meta.description));

    const jsonLdPayload = {
      '@context': 'https://schema.org',
      '@type': 'SoftwareApplication',
      name: 'K8s YAML Generator',
      headline: meta.title,
      applicationCategory: 'DeveloperApplication',
      operatingSystem: 'Any',
      offers: {
        '@type': 'Offer',
        price: '0',
        priceCurrency: 'USD'
      },
      description: meta.description,
      url: routeUrl
    };

    upsertMeta('script#route-jsonld', () => {
      const script = document.createElement('script');
      script.id = 'route-jsonld';
      script.type = 'application/ld+json';
      return script;
    }, (script) => {
      script.textContent = JSON.stringify(jsonLdPayload);
    });

    const faqJsonLdPayload = {
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: SEO_FAQ[type].map((item) => ({
        '@type': 'Question',
        name: item.question,
        acceptedAnswer: {
          '@type': 'Answer',
          text: item.answer
        }
      }))
    };

    upsertMeta('script#route-faq-jsonld', () => {
      const script = document.createElement('script');
      script.id = 'route-faq-jsonld';
      script.type = 'application/ld+json';
      return script;
    }, (script) => {
      script.textContent = JSON.stringify(faqJsonLdPayload);
    });
  }, [type]);

  return null;
};

const AppContent = () => {
  const { t, language, setLanguage } = useLanguage();
  const { isDark, toggleTheme } = useTheme();
  const { addToast } = useToast();

  const navigate = useNavigate();
  const location = useLocation();
  const { type } = useParams<{ type: string }>();

  // Validate type from URL or default to deployment
  const resourceType = (VALID_TYPES.includes(type as ResourceType) ? type : 'deployment') as ResourceType;

  // Form State
  const [formData, setFormData] = useState<K8sResource>(() => getDefaultData(resourceType));
  const [yamlOutput, setYamlOutput] = useState('');
  const [copied, setCopied] = useState(false);
  const [savedConfigs, setSavedConfigs] = useState<SavedConfig[]>([]);
  const [isSaveModalOpen, setIsSaveModalOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [configName, setConfigName] = useState('');
  const [viewMode, setViewMode] = useState<'form' | 'topology'>('form');
  const [editingConfigId, setEditingConfigId] = useState<string | null>(null);
  const [isTemplateModalOpen, setIsTemplateModalOpen] = useState(false);

  // Resizable Preview State
  const [previewWidth, setPreviewWidth] = useState(500);
  const [isDragging, setIsDragging] = useState(false);
  const [isDesktop, setIsDesktop] = useState(typeof window !== 'undefined' ? window.innerWidth >= 1024 : true);
  const [isConfigsLoaded, setIsConfigsLoaded] = useState(false);

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
    setIsConfigsLoaded(true);
  }, []);

  // Sync saved configs to localStorage
  useEffect(() => {
    if (isConfigsLoaded) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(savedConfigs));
    }
  }, [savedConfigs, isConfigsLoaded]);

  // Handle Route Changes & Data Loading
  useEffect(() => {
    if (location.state && location.state.loadFromConfig && location.state.data) {
      // Logic for loading a saved config
      setFormData(location.state.data);
      if (location.state.name) setConfigName(location.state.name);
      if (location.state.id) setEditingConfigId(location.state.id);
      // Clear state to prevent persistence on refresh if desired? 
      // Actually keeping it is fine for reload
    } else {
      // Normal navigation - reset to defaults
      setFormData(getDefaultData(resourceType));
      setConfigName('');
      setEditingConfigId(null);
    }
  }, [resourceType, location.state]);

  useEffect(() => {
    trackEvent('resource_page_view', {
      resource_type: resourceType,
      path: location.pathname
    });
  }, [resourceType, location.pathname]);

  // Update YAML when form data changes
  useEffect(() => {
    setYamlOutput(toYaml(formData));
  }, [formData]);

  // Handle window resize
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

  const handleCopy = () => {
    navigator.clipboard.writeText(yamlOutput);
    setCopied(true);
    trackEvent('yaml_copy_click', {
      resource_type: resourceType,
      yaml_length: yamlOutput.length
    });
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    downloadYaml(`${formData.metadata.name}-${resourceType}.yaml`, yamlOutput);
    trackEvent('yaml_download_click', {
      resource_type: resourceType,
      resource_name: formData.metadata.name
    });
  };

  const handleSaveConfig = () => {
    if (!configName.trim()) return;

    if (editingConfigId) {
      setSavedConfigs(savedConfigs.map(c =>
        c.id === editingConfigId
          ? {
            ...c,
            name: configName.trim(),
            type: resourceType,
            data: JSON.parse(JSON.stringify(formData)),
            timestamp: Date.now()
          }
          : c
      ));
      addToast(t.common.updated || 'Configuration updated', 'success');
      trackEvent('config_update', { resource_type: resourceType });
    } else {
      const newConfig: SavedConfig = {
        id: Date.now().toString(),
        name: configName.trim(),
        type: resourceType,
        data: JSON.parse(JSON.stringify(formData)),
        timestamp: Date.now()
      };
      setSavedConfigs([newConfig, ...savedConfigs]);
      addToast(t.common.saved || 'Configuration saved', 'success');
      trackEvent('config_save', { resource_type: resourceType });
    }

    setIsSaveModalOpen(false);
    setConfigName('');
    setEditingConfigId(null);
  };

  const loadConfig = (config: SavedConfig) => {
    // Navigate to the correct route with state
    trackEvent('saved_config_open', {
      resource_type: config.type,
      config_name: config.name
    });
    navigate(`/${config.type}`, {
      state: {
        loadFromConfig: true,
        data: config.data,
        id: config.id,
        name: config.name
      }
    });
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
      'PersistentVolumeClaim': 'pvc',
      'Secret': 'secret',
      'CronJob': 'cronjob',
      'Job': 'job',
      'DaemonSet': 'daemonset',
      'StatefulSet': 'statefulset',
      'HorizontalPodAutoscaler': 'hpa'
    };

    const type = kindMap[parsed.kind];
    if (!type) {
      throw new Error(`Unsupported resource kind: ${parsed.kind}`);
    }

    // Must navigate to the new type's route, carrying the imported data
    navigate(`/${type}`, {
      state: {
        loadFromConfig: true,
        data: parsed,
        id: null,
        name: ''
      }
    });
    trackEvent('yaml_import', { resource_type: type });
  };

  const deleteConfig = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setSavedConfigs(savedConfigs.filter(c => c.id !== id));
  };

  const handleLoadTemplate = (resources: { type: ResourceType; data: K8sResource }[]) => {
    // 1. Add all resources to savedConfigs
    const newConfigs: SavedConfig[] = resources.map(res => ({
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      name: res.data.metadata.name,
      type: res.type,
      data: res.data,
      timestamp: Date.now()
    }));

    setSavedConfigs(prev => [...newConfigs, ...prev]);

    // 2. Load the first resource into the form
    if (resources.length > 0) {
      const first = resources[0];
      navigate(`/${first.type}`, {
        state: {
          loadFromConfig: true,
          data: first.data,
          // We don't link it to the saved config ID immediately to avoid overwriting the template saved copy unless user explicitly saves over it
          // OR we can link it. Let's not link it for safety, treat it as a fresh load.
          // actually user probably wants to edit THAT config.
          id: newConfigs[0].id,
          name: newConfigs[0].name
        }
      });
    }

    addToast(t.common.imported || 'Template loaded successfully', 'success');
    trackEvent('template_load', {
      resource_count: resources.length,
      first_resource_type: resources[0]?.type ?? 'unknown'
    });
  };

  const NavItem = ({ type, label, icon: Icon }: { type: ResourceType; label: string; icon: any }) => (
    <NavLink
      to={`/${type}`}
      onClick={() => trackEvent('resource_nav_click', { from_resource: resourceType, to_resource: type })}
      className={({ isActive }) => `
        w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200
        ${isActive
          ? 'bg-blue-50 text-blue-700 shadow-sm border border-blue-100'
          : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
        }
      `}
    >
      <Icon size={18} />
      {label}
    </NavLink>
  );

  const formLoadingFallback = (
    <div className={`rounded-lg border p-4 text-sm ${isDark ? 'border-slate-700 text-slate-300' : 'border-slate-200 text-slate-500'}`}>
      Loading editor...
    </div>
  );

  return (
    <div className={`min-h-screen flex flex-col md:flex-row font-sans ${isDark ? 'bg-slate-900' : 'bg-slate-50'}`}>
      <SeoHead type={resourceType} />

      {/* Sidebar */}
      <aside className={`w-full md:w-64 border-r flex-shrink-0 flex flex-col h-screen sticky top-0 ${isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'}`}>
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
          <NavItem type="statefulset" label="StatefulSet" icon={Database} />
          <NavItem type="daemonset" label="DaemonSet" icon={Server} />
          <NavItem type="job" label="Job" icon={Play} />
          <NavItem type="cronjob" label="CronJob" icon={Clock} />

          <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider px-4 mb-2 mt-6">{t.nav.network}</div>
          <NavItem type="service" label={t.nav.service} icon={Box} />
          <NavItem type="ingress" label={t.nav.ingress} icon={Globe} />

          <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider px-4 mb-2 mt-6">{t.nav.config}</div>
          <NavItem type="configmap" label={t.nav.configmap} icon={FileText} />
          <NavItem type="pvc" label={t.nav.pvc} icon={HardDrive} />
          <NavItem type="secret" label="Secret" icon={Key} />

          <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider px-4 mb-2 mt-6">Autoscaling</div>
          <NavItem type="hpa" label="HPA" icon={TrendingUp} />

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
            Visual YAML Builder v1.3
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* Header */}
        <header className={`border-b p-4 flex justify-between items-center shadow-sm z-10 flex-shrink-0 ${isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'}`}>
          <div className="flex items-center gap-4">
            <div className="flex flex-col">
              <h1 className={`text-xl font-semibold capitalize ${isDark ? 'text-white' : 'text-slate-800'}`}>
                {viewMode === 'form' ? `${t.nav[resourceType]} ${t.header.config}` : (language === 'zh' ? '资源拓扑' : 'Resource Topology')}
              </h1>
              {viewMode === 'form' && (
                <span className="text-xs text-slate-500 hidden md:block">
                  https://k8sgen.sivd.dev/{resourceType}
                </span>
              )}
            </div>

            {/* View Mode Toggle */}
            <div className={`flex rounded-lg border overflow-hidden ${isDark ? 'border-slate-600' : 'border-slate-200'}`}>
              <button
                onClick={() => setViewMode('form')}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium transition-colors ${viewMode === 'form'
                  ? 'bg-blue-600 text-white'
                  : isDark ? 'text-slate-400 hover:bg-slate-700' : 'text-slate-600 hover:bg-slate-100'
                  }`}
              >
                <LayoutGrid size={14} />
                {language === 'zh' ? '表单' : 'Form'}
              </button>
              <button
                onClick={() => setViewMode('topology')}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium transition-colors ${viewMode === 'topology'
                  ? 'bg-blue-600 text-white'
                  : isDark ? 'text-slate-400 hover:bg-slate-700' : 'text-slate-600 hover:bg-slate-100'
                  }`}
              >
                <Network size={14} />
                {language === 'zh' ? '拓扑' : 'Topology'}
              </button>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setLanguage(language === 'en' ? 'zh' : 'en')}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-md text-sm font-medium transition-colors border ${isDark ? 'text-slate-300 hover:bg-slate-700 border-slate-600' : 'text-slate-600 hover:bg-slate-100 border-slate-200'}`}
            >
              <Languages size={16} />
              {language === 'en' ? '中文' : 'English'}
            </button>

            <button
              onClick={toggleTheme}
              className={`flex items-center gap-1.5 p-2 rounded-md text-sm font-medium transition-colors border ${isDark ? 'text-amber-400 hover:bg-slate-700 border-slate-600' : 'text-slate-600 hover:bg-slate-100 border-slate-200'}`}
              title={isDark ? 'Light Mode' : 'Dark Mode'}
            >
              {isDark ? <Sun size={16} /> : <Moon size={16} />}
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
              onClick={() => setIsTemplateModalOpen(true)}
              className="flex items-center gap-2 px-3 py-2 text-slate-600 hover:bg-slate-100 rounded-md text-sm font-medium transition-colors border border-slate-200"
            >
              <LayoutGrid size={16} />
              Templates
            </button>

            <button
              onClick={handleCopy}
              className="flex items-center gap-2 px-3 py-2 text-slate-600 hover:bg-slate-100 rounded-md text-sm font-medium transition-colors border border-slate-200"
            >
              {copied ? <Check size={16} className="text-green-600" /> : <Copy size={16} />}
              {copied ? t.header.copied : t.header.copy}
            </button>
            <button
              onClick={() => setIsExportModalOpen(true)}
              className="flex items-center gap-2 px-3 py-2 bg-slate-900 text-white rounded-md text-sm font-medium hover:bg-slate-800 transition-colors"
            >
              <Download size={16} />
              {t.header.export}
            </button>
          </div>
        </header>

        {/* Content Split */}
        <div className="flex-1 flex flex-col lg:flex-row overflow-hidden relative">
          {viewMode === 'form' ? (
            <>
              {/* Form Area */}
              <div className={`flex-1 overflow-y-auto p-6 min-w-[320px] custom-scrollbar ${isDark ? 'bg-slate-900' : 'bg-slate-50'}`}>
                <div className={`max-w-3xl mx-auto rounded-xl shadow-sm border p-6 ${isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'}`}>
                  <Suspense fallback={formLoadingFallback}>
                    {isDeployment(formData) && <DeploymentForm data={formData} onChange={setFormData} savedResources={savedConfigs.map(c => c.data)} />}
                    {isService(formData) && <ServiceForm data={formData} onChange={setFormData} savedResources={savedConfigs.map(c => c.data)} />}
                    {isConfigMap(formData) && <ConfigMapForm data={formData} onChange={setFormData} />}
                    {isIngress(formData) && <IngressForm data={formData} onChange={setFormData} savedResources={savedConfigs.map(c => c.data)} />}
                    {isPVC(formData) && <PVCForm data={formData} onChange={setFormData} />}
                    {isSecret(formData) && <SecretForm data={formData} onChange={setFormData} />}
                    {isCronJob(formData) && <CronJobForm data={formData} onChange={setFormData} />}
                    {isJob(formData) && <JobForm data={formData} onChange={setFormData} />}
                    {isDaemonSet(formData) && <DaemonSetForm data={formData} onChange={setFormData} savedResources={savedConfigs.map(c => c.data)} />}
                    {isStatefulSet(formData) && <StatefulSetForm data={formData} onChange={setFormData} savedResources={savedConfigs.map(c => c.data)} />}
                    {isHPA(formData) && <HPAForm data={formData} onChange={setFormData} />}
                  </Suspense>
                </div>
                <div className={`max-w-3xl mx-auto mt-6 rounded-xl shadow-sm border p-6 ${isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'}`}>
                  <SeoContent type={resourceType} />
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
                className={`flex-shrink-0 flex flex-col overflow-hidden ${isDark ? 'bg-slate-800' : 'bg-white'}`}
                style={{ width: isDesktop ? previewWidth : '100%' }}
              >
                {/* Validation Panel */}
                <div className="flex-shrink-0 p-3 border-b border-slate-200 dark:border-slate-700">
                  <Suspense fallback={<div className="text-sm text-slate-500">Loading validation...</div>}>
                    <ValidationPanel resource={formData} showDetails={true} />
                  </Suspense>
                </div>
                {/* YAML Preview */}
                <div className="flex-1 overflow-hidden">
                  <Suspense fallback={<div className="p-3 text-sm text-slate-500">Loading YAML preview...</div>}>
                    <YamlPreview
                      code={yamlOutput}
                      filename={`${formData.metadata.name}.yaml`}
                    />
                  </Suspense>
                </div>
              </div>
            </>
          ) : (
            /* Topology View */
            <Suspense fallback={<div className="p-6 text-sm text-slate-500">Loading topology view...</div>}>
              <TopologyView
                resources={savedConfigs.map(c => c.data)}
                onNodeClick={(resource, type) => {
                  navigate(`/${type}`, { state: { loadFromConfig: true, data: resource } });
                  setViewMode('form');
                }}
              />
            </Suspense>
          )}
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
                {editingConfigId ? (t.common.updateBtn || 'Update') : t.header.saveBtn}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Import Modal */}
      {isImportModalOpen && (
        <Suspense fallback={null}>
          <ImportModal
            isOpen={isImportModalOpen}
            onClose={() => setIsImportModalOpen(false)}
            onImport={handleImport}
          />
        </Suspense>
      )}

      {/* Export Modal */}
      {isExportModalOpen && (
        <Suspense fallback={null}>
          <ExportModal
            isOpen={isExportModalOpen}
            onClose={() => setIsExportModalOpen(false)}
            savedConfigs={savedConfigs}
            currentConfig={formData}
            currentType={resourceType}
          />
        </Suspense>
      )}

      {/* Template Modal */}
      {isTemplateModalOpen && (
        <Suspense fallback={null}>
          <TemplateModal
            isOpen={isTemplateModalOpen}
            onClose={() => setIsTemplateModalOpen(false)}
            onSelectTemplate={handleLoadTemplate}
          />
        </Suspense>
      )}
    </div>
  );
};

const App = () => (
  <AppContextProvider>
    <LanguageProvider>
      <Routes>
        <Route path="/" element={<Navigate to="/deployment" replace />} />
        <Route path="/:type" element={<AppContent />} />
      </Routes>
      <ToastContainer />
      <Analytics />
    </LanguageProvider>
  </AppContextProvider>
);

export default App;
