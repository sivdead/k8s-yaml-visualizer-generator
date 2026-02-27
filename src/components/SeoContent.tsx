import React from 'react';
import { Link } from 'react-router-dom';
import { ResourceType } from '../types';

interface SeoGuide {
  heading: string;
  summary: string;
  useCases: string[];
  keyFields: string[];
  sampleYaml: string;
}

const RESOURCE_LABELS: Record<ResourceType, string> = {
  deployment: 'Deployment',
  service: 'Service',
  configmap: 'ConfigMap',
  ingress: 'Ingress',
  pvc: 'PVC',
  secret: 'Secret',
  cronjob: 'CronJob',
  job: 'Job',
  daemonset: 'DaemonSet',
  statefulset: 'StatefulSet',
  hpa: 'HPA'
};

const RELATED_LINKS: Record<ResourceType, ResourceType[]> = {
  deployment: ['service', 'ingress', 'hpa'],
  service: ['deployment', 'ingress', 'configmap'],
  configmap: ['deployment', 'statefulset', 'secret'],
  ingress: ['service', 'deployment', 'secret'],
  pvc: ['statefulset', 'deployment', 'daemonset'],
  secret: ['deployment', 'ingress', 'configmap'],
  cronjob: ['job', 'configmap', 'secret'],
  job: ['cronjob', 'configmap', 'secret'],
  daemonset: ['configmap', 'secret', 'service'],
  statefulset: ['service', 'pvc', 'hpa'],
  hpa: ['deployment', 'statefulset', 'service']
};

const ALL_TYPES: ResourceType[] = [
  'deployment',
  'service',
  'configmap',
  'ingress',
  'pvc',
  'secret',
  'cronjob',
  'job',
  'daemonset',
  'statefulset',
  'hpa'
];

const SEO_GUIDES: Record<ResourceType, SeoGuide> = {
  deployment: {
    heading: 'Kubernetes Deployment YAML Guide',
    summary: 'Use Deployment for stateless applications that need rolling updates and replica management.',
    useCases: ['Web API services', 'Frontend web servers', 'Background workers with zero-downtime updates'],
    keyFields: ['spec.replicas', 'spec.selector.matchLabels', 'spec.template.spec.containers'],
    sampleYaml: `apiVersion: apps/v1
kind: Deployment
metadata:
  name: demo-api
spec:
  replicas: 3
  selector:
    matchLabels:
      app: demo-api
  template:
    metadata:
      labels:
        app: demo-api
    spec:
      containers:
        - name: api
          image: nginx:stable`
  },
  service: {
    heading: 'Kubernetes Service YAML Guide',
    summary: 'Service exposes Pods over a stable virtual IP and load balances traffic to matching workloads.',
    useCases: ['Expose Deployment internally', 'Publish app through NodePort/LoadBalancer', 'Stable DNS for app-to-app calls'],
    keyFields: ['spec.type', 'spec.selector', 'spec.ports[].targetPort'],
    sampleYaml: `apiVersion: v1
kind: Service
metadata:
  name: demo-api-svc
spec:
  type: ClusterIP
  selector:
    app: demo-api
  ports:
    - port: 80
      targetPort: 8080`
  },
  configmap: {
    heading: 'Kubernetes ConfigMap YAML Guide',
    summary: 'ConfigMap stores non-sensitive configuration and can be consumed as env vars or mounted files.',
    useCases: ['Application config values', 'Feature flags', 'Mounting config files into containers'],
    keyFields: ['metadata.name', 'data', 'envFrom/configMapRef integration'],
    sampleYaml: `apiVersion: v1
kind: ConfigMap
metadata:
  name: app-config
data:
  LOG_LEVEL: info
  APP_MODE: production`
  },
  ingress: {
    heading: 'Kubernetes Ingress YAML Guide',
    summary: 'Ingress manages HTTP/S routing into Services by host and path rules.',
    useCases: ['Host-based routing', 'Path-based routing', 'TLS termination for multiple services'],
    keyFields: ['spec.ingressClassName', 'spec.rules[].host', 'spec.rules[].http.paths[]'],
    sampleYaml: `apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: demo-ingress
spec:
  ingressClassName: nginx
  rules:
    - host: demo.example.com
      http:
        paths:
          - path: /
            pathType: Prefix
            backend:
              service:
                name: demo-api-svc
                port:
                  number: 80`
  },
  pvc: {
    heading: 'Kubernetes PVC YAML Guide',
    summary: 'PersistentVolumeClaim requests durable storage for Pods and stateful workloads.',
    useCases: ['Database storage', 'File uploads', 'Any workload requiring data persistence'],
    keyFields: ['spec.accessModes', 'spec.resources.requests.storage', 'spec.storageClassName'],
    sampleYaml: `apiVersion: v1
kind: PersistentVolumeClaim
metadata:
  name: data-pvc
spec:
  accessModes:
    - ReadWriteOnce
  resources:
    requests:
      storage: 10Gi`
  },
  secret: {
    heading: 'Kubernetes Secret YAML Guide',
    summary: 'Secret stores sensitive values such as tokens, credentials, and API keys.',
    useCases: ['Database passwords', 'Docker registry auth', 'API tokens for external services'],
    keyFields: ['type', 'data/stringData', 'env.valueFrom.secretKeyRef'],
    sampleYaml: `apiVersion: v1
kind: Secret
metadata:
  name: app-secret
type: Opaque
stringData:
  DB_PASSWORD: change-me
  API_TOKEN: token-value`
  },
  cronjob: {
    heading: 'Kubernetes CronJob YAML Guide',
    summary: 'CronJob runs Jobs on a schedule using standard cron expression syntax.',
    useCases: ['Nightly backups', 'Periodic data sync', 'Scheduled maintenance tasks'],
    keyFields: ['spec.schedule', 'spec.jobTemplate', 'spec.concurrencyPolicy'],
    sampleYaml: `apiVersion: batch/v1
kind: CronJob
metadata:
  name: nightly-backup
spec:
  schedule: "0 2 * * *"
  jobTemplate:
    spec:
      template:
        spec:
          containers:
            - name: backup
              image: alpine:3.20
          restartPolicy: OnFailure`
  },
  job: {
    heading: 'Kubernetes Job YAML Guide',
    summary: 'Job runs finite workloads and tracks completion with retries and parallelism controls.',
    useCases: ['Data migrations', 'Batch processing', 'One-off maintenance scripts'],
    keyFields: ['spec.completions', 'spec.parallelism', 'spec.backoffLimit'],
    sampleYaml: `apiVersion: batch/v1
kind: Job
metadata:
  name: db-migrate
spec:
  backoffLimit: 3
  template:
    spec:
      containers:
        - name: migrate
          image: alpine:3.20
      restartPolicy: Never`
  },
  daemonset: {
    heading: 'Kubernetes DaemonSet YAML Guide',
    summary: 'DaemonSet ensures one Pod copy runs on each node (or selected nodes).',
    useCases: ['Log collectors', 'Monitoring agents', 'Node-level security tooling'],
    keyFields: ['spec.selector', 'spec.template', 'spec.template.spec.nodeSelector/tolerations'],
    sampleYaml: `apiVersion: apps/v1
kind: DaemonSet
metadata:
  name: node-agent
spec:
  selector:
    matchLabels:
      app: node-agent
  template:
    metadata:
      labels:
        app: node-agent
    spec:
      containers:
        - name: agent
          image: alpine:3.20`
  },
  statefulset: {
    heading: 'Kubernetes StatefulSet YAML Guide',
    summary: 'StatefulSet manages stateful Pods with stable network identity and persistent storage.',
    useCases: ['Databases', 'Message queues', 'Distributed systems requiring stable identity'],
    keyFields: ['spec.serviceName', 'spec.volumeClaimTemplates', 'spec.replicas'],
    sampleYaml: `apiVersion: apps/v1
kind: StatefulSet
metadata:
  name: demo-db
spec:
  serviceName: demo-db
  replicas: 2
  selector:
    matchLabels:
      app: demo-db
  template:
    metadata:
      labels:
        app: demo-db
    spec:
      containers:
        - name: db
          image: mysql:8`
  },
  hpa: {
    heading: 'HorizontalPodAutoscaler YAML Guide',
    summary: 'HPA scales a target workload up or down based on observed metrics.',
    useCases: ['Autoscale APIs by CPU', 'Reduce cost during idle periods', 'Handle traffic spikes automatically'],
    keyFields: ['spec.scaleTargetRef', 'spec.minReplicas', 'spec.maxReplicas'],
    sampleYaml: `apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: demo-api-hpa
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: demo-api
  minReplicas: 2
  maxReplicas: 10`
  }
};

export const SeoContent: React.FC<{ type: ResourceType }> = ({ type }) => {
  const guide = SEO_GUIDES[type];
  const relatedLinks = RELATED_LINKS[type];

  return (
    <article className="space-y-4">
      <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">{guide.heading}</h2>
      <p className="text-sm text-slate-600 dark:text-slate-300">{guide.summary}</p>

      <section>
        <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-200 mb-2">Common use cases</h3>
        <ul className="list-disc pl-5 space-y-1 text-sm text-slate-600 dark:text-slate-300">
          {guide.useCases.map(item => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </section>

      <section>
        <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-200 mb-2">Fields to review</h3>
        <ul className="list-disc pl-5 space-y-1 text-sm text-slate-600 dark:text-slate-300">
          {guide.keyFields.map(field => (
            <li key={field}>
              <code className="bg-slate-100 dark:bg-slate-700 px-1 rounded">{field}</code>
            </li>
          ))}
        </ul>
      </section>

      <section>
        <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-200 mb-2">Example YAML</h3>
        <pre className="text-xs p-3 rounded-lg overflow-x-auto bg-slate-900 text-slate-100">
          <code>{guide.sampleYaml}</code>
        </pre>
      </section>

      <section className="space-y-2">
        <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-200">Related generators</h3>
        <p className="text-sm text-slate-600 dark:text-slate-300">
          Explore related Kubernetes manifest builders:
        </p>
        <div className="flex flex-wrap gap-2">
          {relatedLinks.map((resource) => (
            <Link
              key={resource}
              to={`/${resource}`}
              className="inline-flex items-center px-3 py-1.5 rounded-md text-xs font-medium border border-blue-200 text-blue-700 bg-blue-50 hover:bg-blue-100 transition-colors"
            >
              {RESOURCE_LABELS[resource]} YAML Generator
            </Link>
          ))}
        </div>
      </section>

      <section className="space-y-2">
        <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-200">All Kubernetes resource pages</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
          {ALL_TYPES.filter((resource) => resource !== type).map((resource) => (
            <Link
              key={resource}
              to={`/${resource}`}
              className="text-xs px-3 py-2 rounded-md border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:border-blue-300 hover:text-blue-700 dark:hover:text-blue-300 transition-colors"
            >
              Kubernetes {RESOURCE_LABELS[resource]} YAML
            </Link>
          ))}
        </div>
      </section>
    </article>
  );
};
