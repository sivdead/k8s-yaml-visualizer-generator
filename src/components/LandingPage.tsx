import React from 'react';
import { Link } from 'react-router-dom';
import {
  Box,
  Layers,
  Globe,
  FileText,
  HardDrive,
  Key,
  Clock,
  Play,
  Server,
  Database,
  TrendingUp,
  Upload,
  Download,
  Eye,
  Shield,
  Zap,
  Users,
  ArrowRight,
  Lightbulb,
  GitBranch,
  MonitorSmartphone,
  CheckCircle,
  Github
} from 'lucide-react';
import { useTheme } from '../contexts/AppContext';

const RESOURCE_TYPES = [
  { type: 'deployment', label: 'Deployment', icon: Layers, desc: 'Stateless workloads with rolling updates' },
  { type: 'service', label: 'Service', icon: Box, desc: 'Expose pods over a stable network endpoint' },
  { type: 'ingress', label: 'Ingress', icon: Globe, desc: 'HTTP/S routing with host and path rules' },
  { type: 'configmap', label: 'ConfigMap', icon: FileText, desc: 'Non-sensitive configuration data' },
  { type: 'secret', label: 'Secret', icon: Key, desc: 'Sensitive data with auto Base64 encoding' },
  { type: 'pvc', label: 'PVC', icon: HardDrive, desc: 'Persistent storage claims' },
  { type: 'statefulset', label: 'StatefulSet', icon: Database, desc: 'Stable identity and persistent storage' },
  { type: 'daemonset', label: 'DaemonSet', icon: Server, desc: 'Run one pod on every node' },
  { type: 'cronjob', label: 'CronJob', icon: Clock, desc: 'Scheduled recurring tasks' },
  { type: 'job', label: 'Job', icon: Play, desc: 'One-off batch workloads' },
  { type: 'hpa', label: 'HPA', icon: TrendingUp, desc: 'Autoscale by CPU/memory metrics' },
];

export const LandingPage: React.FC = () => {
  const { isDark } = useTheme();

  return (
    <div className={`min-h-screen ${isDark ? 'bg-slate-900 text-slate-100' : 'bg-white text-slate-900'}`}>
      {/* Hero Section */}
      <section className={`border-b ${isDark ? 'border-slate-800' : 'border-slate-100'}`}>
        <div className="max-w-5xl mx-auto px-6 py-20 text-center">
          <div className="inline-flex items-center gap-2 mb-6 px-4 py-1.5 rounded-full text-sm font-medium bg-blue-50 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300">
            <Zap size={14} />
            Free &middot; No sign-up &middot; Runs in your browser
          </div>
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight leading-tight mb-6">
            No Kubernetes dashboard?<br />
            <span className="text-blue-600">Build manifests visually.</span>
          </h1>
          <p className={`text-lg md:text-xl max-w-2xl mx-auto mb-10 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
            A lightweight visual manifest builder for teams without a control panel.
            Faster than hand-writing YAML, more controllable than pure AI generation.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link
              to="/deployment"
              className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg text-base font-semibold hover:bg-blue-700 transition-colors shadow-lg shadow-blue-600/20"
            >
              Start Building
              <ArrowRight size={18} />
            </Link>
            <a
              href="#how-it-works"
              className={`inline-flex items-center gap-2 px-6 py-3 rounded-lg text-base font-semibold border transition-colors ${
                isDark ? 'border-slate-700 text-slate-300 hover:bg-slate-800' : 'border-slate-200 text-slate-700 hover:bg-slate-50'
              }`}
            >
              See how it works
            </a>
          </div>
        </div>
      </section>

      {/* Core Value Props */}
      <section className={`border-b ${isDark ? 'border-slate-800' : 'border-slate-100'}`}>
        <div className="max-w-5xl mx-auto px-6 py-16">
          <div className="grid md:grid-cols-3 gap-8">
            <div className={`p-6 rounded-xl border ${isDark ? 'border-slate-700 bg-slate-800/50' : 'border-slate-200 bg-slate-50'}`}>
              <div className="w-10 h-10 rounded-lg bg-green-100 dark:bg-green-900/40 flex items-center justify-center mb-4">
                <Shield size={20} className="text-green-600" />
              </div>
              <h3 className="text-lg font-semibold mb-2">No sign-up required</h3>
              <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                No account, no tracking, no data leaves your browser. Everything runs locally.
              </p>
            </div>
            <div className={`p-6 rounded-xl border ${isDark ? 'border-slate-700 bg-slate-800/50' : 'border-slate-200 bg-slate-50'}`}>
              <div className="w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-900/40 flex items-center justify-center mb-4">
                <MonitorSmartphone size={20} className="text-blue-600" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Browser-only</h3>
              <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                No CLI to install, no server to maintain. Open the URL and start building.
              </p>
            </div>
            <div className={`p-6 rounded-xl border ${isDark ? 'border-slate-700 bg-slate-800/50' : 'border-slate-200 bg-slate-50'}`}>
              <div className="w-10 h-10 rounded-lg bg-purple-100 dark:bg-purple-900/40 flex items-center justify-center mb-4">
                <Upload size={20} className="text-purple-600" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Import existing YAML</h3>
              <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                Paste an existing manifest, edit it visually, and export a clean result.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How it Works / Demo Placeholder */}
      <section id="how-it-works" className={`border-b ${isDark ? 'border-slate-800' : 'border-slate-100'}`}>
        <div className="max-w-5xl mx-auto px-6 py-16">
          <h2 className="text-2xl font-bold text-center mb-4">How it works</h2>
          <p className={`text-center mb-10 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
            Configure visually on the left, see real-time YAML on the right. Copy or download when ready.
          </p>
          <div className={`rounded-xl border-2 border-dashed p-12 text-center ${isDark ? 'border-slate-700 bg-slate-800/30' : 'border-slate-300 bg-slate-50'}`}>
            <div className="flex items-center justify-center gap-8 flex-wrap">
              <div className={`flex flex-col items-center gap-2 p-4 rounded-lg ${isDark ? 'bg-slate-800' : 'bg-white'} shadow-sm border ${isDark ? 'border-slate-700' : 'border-slate-200'}`}>
                <Eye size={28} className="text-blue-500" />
                <span className="text-sm font-medium">1. Fill the form</span>
              </div>
              <ArrowRight size={20} className={isDark ? 'text-slate-600' : 'text-slate-400'} />
              <div className={`flex flex-col items-center gap-2 p-4 rounded-lg ${isDark ? 'bg-slate-800' : 'bg-white'} shadow-sm border ${isDark ? 'border-slate-700' : 'border-slate-200'}`}>
                <FileText size={28} className="text-green-500" />
                <span className="text-sm font-medium">2. See live YAML</span>
              </div>
              <ArrowRight size={20} className={isDark ? 'text-slate-600' : 'text-slate-400'} />
              <div className={`flex flex-col items-center gap-2 p-4 rounded-lg ${isDark ? 'bg-slate-800' : 'bg-white'} shadow-sm border ${isDark ? 'border-slate-700' : 'border-slate-200'}`}>
                <Download size={28} className="text-purple-500" />
                <span className="text-sm font-medium">3. Copy or export</span>
              </div>
            </div>
            <p className={`mt-6 text-xs ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
              Try it now &mdash; click &quot;Start Building&quot; above
            </p>
          </div>
        </div>
      </section>

      {/* Import / Edit / Export - prominent workflow */}
      <section className={`border-b ${isDark ? 'border-slate-800' : 'border-slate-100'}`}>
        <div className="max-w-5xl mx-auto px-6 py-16">
          <h2 className="text-2xl font-bold text-center mb-10">Import, edit, export</h2>
          <div className="grid md:grid-cols-3 gap-6 text-center">
            <div>
              <div className="w-12 h-12 rounded-full bg-purple-100 dark:bg-purple-900/40 flex items-center justify-center mx-auto mb-3">
                <Upload size={22} className="text-purple-600" />
              </div>
              <h3 className="font-semibold mb-1">Import existing YAML</h3>
              <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                Paste any supported K8s manifest and load it into the visual editor.
              </p>
            </div>
            <div>
              <div className="w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900/40 flex items-center justify-center mx-auto mb-3">
                <Eye size={22} className="text-blue-600" />
              </div>
              <h3 className="font-semibold mb-1">Edit visually</h3>
              <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                Change fields with forms instead of hunting through indentation.
              </p>
            </div>
            <div>
              <div className="w-12 h-12 rounded-full bg-green-100 dark:bg-green-900/40 flex items-center justify-center mx-auto mb-3">
                <Download size={22} className="text-green-600" />
              </div>
              <h3 className="font-semibold mb-1">Export clean manifest</h3>
              <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                Download or copy production-ready YAML. Multi-resource export supported.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Who is this for */}
      <section className={`border-b ${isDark ? 'border-slate-800' : 'border-slate-100'}`}>
        <div className="max-w-5xl mx-auto px-6 py-16">
          <h2 className="text-2xl font-bold text-center mb-10">Who is this for?</h2>
          <div className="grid sm:grid-cols-2 gap-4 max-w-2xl mx-auto">
            {[
              { icon: Users, text: 'Small teams without a dedicated platform team' },
              { icon: Zap, text: 'Solo developers shipping to Kubernetes' },
              { icon: Server, text: 'Homelab and k3s users' },
              { icon: Shield, text: 'Teams without Rancher, KubeSphere, or an internal portal' },
            ].map((item, i) => (
              <div key={i} className={`flex items-center gap-3 p-4 rounded-lg border ${isDark ? 'border-slate-700 bg-slate-800/50' : 'border-slate-200 bg-slate-50'}`}>
                <item.icon size={18} className="text-blue-500 flex-shrink-0" />
                <span className="text-sm">{item.text}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Typical Use Cases */}
      <section className={`border-b ${isDark ? 'border-slate-800' : 'border-slate-100'}`}>
        <div className="max-w-5xl mx-auto px-6 py-16">
          <h2 className="text-2xl font-bold text-center mb-10">Typical use cases</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                title: 'Build from scratch',
                desc: 'I don\'t have a K8s dashboard, but I need to configure a Deployment and Service for my app.',
                cta: 'deployment',
              },
              {
                title: 'Edit existing YAML',
                desc: 'I have an old manifest and want to visually tweak it instead of editing raw YAML by hand.',
                cta: 'deployment',
              },
              {
                title: 'Scaffold for GitOps',
                desc: 'I want to quickly build a manifest skeleton, then copy it into my GitOps repo or CI pipeline.',
                cta: 'deployment',
              },
            ].map((item, i) => (
              <div key={i} className={`p-6 rounded-xl border ${isDark ? 'border-slate-700 bg-slate-800/50' : 'border-slate-200 bg-slate-50'}`}>
                <h3 className="font-semibold mb-2">{item.title}</h3>
                <p className={`text-sm mb-4 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>{item.desc}</p>
                <Link to={`/${item.cta}`} className="text-sm text-blue-600 hover:text-blue-700 font-medium inline-flex items-center gap-1">
                  Try it <ArrowRight size={14} />
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* After Generation - what to do */}
      <section className={`border-b ${isDark ? 'border-slate-800' : 'border-slate-100'}`}>
        <div className="max-w-3xl mx-auto px-6 py-16">
          <h2 className="text-2xl font-bold text-center mb-4">What happens after you generate?</h2>
          <p className={`text-center mb-8 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
            This tool creates manifests &mdash; it doesn't replace your deployment workflow.
          </p>
          <div className={`p-6 rounded-xl border ${isDark ? 'border-slate-700 bg-slate-800/50' : 'border-slate-200 bg-slate-50'}`}>
            <ul className="space-y-3">
              {[
                'Copy the YAML into your Git repo, CI pipeline, or apply directly with kubectl.',
                'Use with ArgoCD, Flux, or any GitOps tool — the output is standard K8s YAML.',
                'This tool helps you create manifests, not replace your GitOps flow.',
              ].map((text, i) => (
                <li key={i} className="flex items-start gap-3">
                  <CheckCircle size={16} className="text-green-500 mt-0.5 flex-shrink-0" />
                  <span className={`text-sm ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>{text}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* Why not AI-only? */}
      <section className={`border-b ${isDark ? 'border-slate-800' : 'border-slate-100'}`}>
        <div className="max-w-3xl mx-auto px-6 py-16 text-center">
          <div className="w-12 h-12 rounded-full bg-amber-100 dark:bg-amber-900/40 flex items-center justify-center mx-auto mb-4">
            <Lightbulb size={22} className="text-amber-600" />
          </div>
          <h2 className="text-2xl font-bold mb-4">Why not just use AI?</h2>
          <p className={`text-base max-w-xl mx-auto ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
            AI can draft manifests. This tool helps you <strong>inspect, edit, and control them visually</strong>.
            You see every field, understand every value, and export exactly what you intend to deploy.
          </p>
        </div>
      </section>

      {/* Supported Resource Types */}
      <section className={`border-b ${isDark ? 'border-slate-800' : 'border-slate-100'}`}>
        <div className="max-w-5xl mx-auto px-6 py-16">
          <h2 className="text-2xl font-bold text-center mb-4">Supported resource types</h2>
          <p className={`text-center mb-10 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
            11 Kubernetes resource types, each with a dedicated visual editor.
          </p>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {RESOURCE_TYPES.map((r) => (
              <Link
                key={r.type}
                to={`/${r.type}`}
                className={`flex items-center gap-3 p-4 rounded-lg border transition-colors ${
                  isDark
                    ? 'border-slate-700 bg-slate-800/50 hover:border-blue-600 hover:bg-slate-800'
                    : 'border-slate-200 bg-white hover:border-blue-300 hover:bg-blue-50'
                }`}
              >
                <r.icon size={18} className="text-blue-500 flex-shrink-0" />
                <div className="min-w-0">
                  <div className="font-medium text-sm">{r.label}</div>
                  <div className={`text-xs truncate ${isDark ? 'text-slate-500' : 'text-slate-500'}`}>{r.desc}</div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Footer CTA */}
      <section>
        <div className="max-w-5xl mx-auto px-6 py-16 text-center">
          <h2 className="text-2xl font-bold mb-4">Ready to build?</h2>
          <p className={`mb-8 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
            Pick a resource type and start configuring. No sign-up, no install.
          </p>
          <Link
            to="/deployment"
            className="inline-flex items-center gap-2 px-8 py-3 bg-blue-600 text-white rounded-lg text-base font-semibold hover:bg-blue-700 transition-colors shadow-lg shadow-blue-600/20"
          >
            Start with Deployment
            <ArrowRight size={18} />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className={`border-t ${isDark ? 'border-slate-800' : 'border-slate-100'}`}>
        <div className="max-w-5xl mx-auto px-6 py-6 flex items-center justify-center">
          <a
            href="https://github.com/sivdead/k8s-yaml-visualizer-generator"
            target="_blank"
            rel="noopener noreferrer"
            className={`inline-flex items-center gap-2 text-sm font-medium transition-colors ${
              isDark ? 'text-slate-400 hover:text-slate-200' : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            <Github size={18} />
            GitHub
          </a>
        </div>
      </footer>
    </div>
  );
};
