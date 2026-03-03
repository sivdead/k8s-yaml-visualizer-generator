import { promises as fs } from 'node:fs';
import path from 'node:path';

const DIST_DIR = path.resolve(process.cwd(), 'dist');
const INDEX_FILE = path.join(DIST_DIR, 'index.html');
const BASE_URL = 'https://k8sgen.sivd.dev';

const ROUTES = [
  {
    type: 'deployment',
    title: 'Kubernetes Deployment YAML Generator',
    description: 'Create Kubernetes Deployment manifests with replicas, containers, probes, and labels.',
    heading: 'Deployment YAML Generator',
    intro: 'Use this page to build Deployment manifests for stateless applications with rolling updates.',
    points: ['Set replicas and labels carefully', 'Review container image and ports', 'Add probes before production rollout'],
    example: `apiVersion: apps/v1
kind: Deployment
metadata:
  name: demo-api
spec:
  replicas: 3`
  },
  {
    type: 'service',
    title: 'Kubernetes Service YAML Generator',
    description: 'Generate Kubernetes Service YAML for ClusterIP, NodePort, and LoadBalancer traffic patterns.',
    heading: 'Service YAML Generator',
    intro: 'Use Service manifests to expose Pods behind a stable endpoint and selector.',
    points: ['Match selector labels with workload labels', 'Check service type for environment', 'Verify port and targetPort mapping'],
    example: `apiVersion: v1
kind: Service
metadata:
  name: demo-api-svc
spec:
  type: ClusterIP`
  },
  {
    type: 'configmap',
    title: 'Kubernetes ConfigMap YAML Generator',
    description: 'Build Kubernetes ConfigMap manifests for environment values and file-based application config.',
    heading: 'ConfigMap YAML Generator',
    intro: 'Use ConfigMaps for non-sensitive configuration injected into workloads.',
    points: ['Store plain configuration only', 'Reference keys in env/envFrom', 'Version config changes with app rollout'],
    example: `apiVersion: v1
kind: ConfigMap
metadata:
  name: app-config
data:
  APP_MODE: production`
  },
  {
    type: 'ingress',
    title: 'Kubernetes Ingress YAML Builder',
    description: 'Create Ingress YAML with host/path routing and TLS for Kubernetes services.',
    heading: 'Ingress YAML Builder',
    intro: 'Use Ingress for HTTP and HTTPS routing into one or more internal services.',
    points: ['Set ingress class name', 'Define host/path routing rules', 'Configure TLS certificate secrets'],
    example: `apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: demo-ingress
spec:
  ingressClassName: nginx`
  },
  {
    type: 'pvc',
    title: 'PersistentVolumeClaim YAML Generator',
    description: 'Generate PVC manifests with storage class, capacity, and access mode settings.',
    heading: 'PersistentVolumeClaim YAML Generator',
    intro: 'Use PVC manifests to request persistent storage for stateful workloads.',
    points: ['Pick correct access mode', 'Set realistic storage request', 'Use cluster-compatible storage class'],
    example: `apiVersion: v1
kind: PersistentVolumeClaim
metadata:
  name: data-pvc
spec:
  accessModes:
    - ReadWriteOnce`
  },
  {
    type: 'secret',
    title: 'Kubernetes Secret YAML Generator',
    description: 'Generate Secret YAML for credentials, tokens, and other sensitive application values.',
    heading: 'Secret YAML Generator',
    intro: 'Use Secrets for sensitive values and inject them via env vars or mounted files.',
    points: ['Avoid committing secret values to git', 'Use stringData for readability', 'Reference keys from workloads'],
    example: `apiVersion: v1
kind: Secret
metadata:
  name: app-secret
type: Opaque`
  },
  {
    type: 'cronjob',
    title: 'Kubernetes CronJob YAML Generator',
    description: 'Build scheduled CronJob manifests with cron syntax and Job template options.',
    heading: 'CronJob YAML Generator',
    intro: 'Use CronJob to run repeatable workloads on a fixed schedule.',
    points: ['Validate cron expression', 'Set restart policy to OnFailure', 'Review concurrency and history limits'],
    example: `apiVersion: batch/v1
kind: CronJob
metadata:
  name: nightly-backup
spec:
  schedule: "0 2 * * *"`
  },
  {
    type: 'job',
    title: 'Kubernetes Job YAML Generator',
    description: 'Create one-off batch Job manifests with retries, completions, and parallelism controls.',
    heading: 'Job YAML Generator',
    intro: 'Use Job for finite tasks such as data migration or batch processing.',
    points: ['Set backoffLimit for retry behavior', 'Tune completions and parallelism', 'Use restartPolicy Never or OnFailure'],
    example: `apiVersion: batch/v1
kind: Job
metadata:
  name: db-migrate
spec:
  backoffLimit: 3`
  },
  {
    type: 'daemonset',
    title: 'Kubernetes DaemonSet YAML Generator',
    description: 'Build DaemonSet manifests to run one Pod instance on each cluster node.',
    heading: 'DaemonSet YAML Generator',
    intro: 'Use DaemonSet for node-level agents such as logging, security, or monitoring.',
    points: ['Use node selectors and tolerations', 'Validate resource requests on every node', 'Ensure safe rolling update strategy'],
    example: `apiVersion: apps/v1
kind: DaemonSet
metadata:
  name: node-agent
spec:
  selector:
    matchLabels:
      app: node-agent`
  },
  {
    type: 'statefulset',
    title: 'Kubernetes StatefulSet YAML Generator',
    description: 'Create StatefulSet YAML with stable identity and persistent storage templates.',
    heading: 'StatefulSet YAML Generator',
    intro: 'Use StatefulSet for workloads that need stable hostnames and persistent data.',
    points: ['Configure serviceName for stable DNS', 'Define volumeClaimTemplates', 'Scale carefully with data replication in mind'],
    example: `apiVersion: apps/v1
kind: StatefulSet
metadata:
  name: demo-db
spec:
  serviceName: demo-db`
  },
  {
    type: 'hpa',
    title: 'HorizontalPodAutoscaler YAML Generator',
    description: 'Generate HPA YAML to autoscale workloads based on resource metrics.',
    heading: 'HorizontalPodAutoscaler YAML Generator',
    intro: 'Use HPA to adjust Pod replicas automatically based on traffic and utilization.',
    points: ['Set realistic min and max replicas', 'Target the correct Deployment/StatefulSet', 'Track scaling behavior in metrics'],
    example: `apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: demo-api-hpa
spec:
  minReplicas: 2`
  }
];

const escapeHtml = (value) =>
  value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');

const updateTag = (html, pattern, replacement) => {
  if (!pattern.test(html)) {
    return html;
  }
  return html.replace(pattern, replacement);
};

const buildFallbackContent = (route) => {
  const points = route.points.map(point => `<li>${escapeHtml(point)}</li>`).join('');
  const quickLinks = ROUTES
    .filter(item => item.type !== route.type)
    .map(item => `<a href="/${item.type}">${escapeHtml(item.title)}</a>`)
    .join(' | ');

  return `
  <main id="seo-fallback" style="max-width:960px;margin:0 auto;padding:24px 16px;font-family:Inter,Arial,sans-serif;line-height:1.6;color:#0f172a;">
    <h1 style="font-size:30px;margin:0 0 12px;">${escapeHtml(route.heading)}</h1>
    <p style="margin:0 0 16px;">${escapeHtml(route.intro)}</p>
    <h2 style="font-size:20px;margin:20px 0 8px;">What to check</h2>
    <ul style="margin:0 0 16px 20px;">${points}</ul>
    <h2 style="font-size:20px;margin:20px 0 8px;">Minimal example</h2>
    <pre style="margin:0 0 16px;background:#0f172a;color:#e2e8f0;padding:12px;border-radius:8px;overflow:auto;"><code>${escapeHtml(route.example)}</code></pre>
    <h2 style="font-size:20px;margin:20px 0 8px;">Related generators</h2>
    <p style="margin:0 0 8px;">${quickLinks}</p>
    <p style="margin:0;color:#475569;font-size:14px;">This static content helps search engines index route-specific pages even before JavaScript executes.</p>
  </main>`;
};

const buildFaqJsonLd = (route) => {
  const payload = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: `What is Kubernetes ${route.heading.replace(' YAML Generator', '')} used for?`,
        acceptedAnswer: {
          '@type': 'Answer',
          text: route.intro
        }
      },
      {
        '@type': 'Question',
        name: `How can I generate ${route.type} YAML quickly?`,
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Use the visual editor on this page, then copy or export the generated YAML manifest.'
        }
      }
    ]
  };

  return JSON.stringify(payload);
};

const HOMEPAGE = {
  title: 'Free Kubernetes YAML Generator Online - K8s Deployment & Service Manifest Builder',
  description: 'Free online Kubernetes YAML generator. Build deployment, service, ingress, configmap, secret, job, and cronjob manifests visually with real-time preview and validation.',
  faq: [
    {
      question: 'What is a Kubernetes YAML generator?',
      answer: 'A Kubernetes YAML generator is a tool that helps you create valid Kubernetes manifest files through a visual interface instead of writing YAML by hand. It reduces syntax errors and speeds up the configuration process for deployments, services, and other K8s resources.'
    },
    {
      question: 'Is this Kubernetes YAML generator free?',
      answer: 'Yes, this tool is completely free and runs entirely in your browser. No sign-up, no server-side processing, and no data leaves your machine.'
    },
    {
      question: 'What Kubernetes resources can I generate?',
      answer: 'You can generate YAML for Deployments, Services, Ingress, ConfigMaps, Secrets, PersistentVolumeClaims, Jobs, CronJobs, DaemonSets, StatefulSets, and HorizontalPodAutoscalers.'
    }
  ]
};

const RESOURCE_DESCRIPTIONS = {
  deployment: 'Create Deployment manifests for stateless apps with rolling updates, replicas, and probes.',
  service: 'Generate ClusterIP, NodePort, and LoadBalancer Service manifests for exposing Pods.',
  configmap: 'Build ConfigMap manifests for non-sensitive environment and file-based configuration.',
  ingress: 'Create Ingress rules with host/path routing and TLS for HTTP/HTTPS traffic.',
  pvc: 'Generate PersistentVolumeClaim manifests with storage class and access mode settings.',
  secret: 'Build Secret manifests for credentials, tokens, and other sensitive values.',
  cronjob: 'Create scheduled CronJob manifests with cron syntax and job template options.',
  job: 'Generate one-off batch Job manifests with retries and parallelism controls.',
  daemonset: 'Build DaemonSet manifests to run one Pod per node for logging, monitoring, etc.',
  statefulset: 'Create StatefulSet manifests with stable identity and persistent storage templates.',
  hpa: 'Generate HPA manifests to autoscale workloads based on CPU/memory metrics.'
};

const buildHomepageFallback = () => {
  const resourceLinks = ROUTES.map(route =>
    `<li><a href="/${route.type}" style="color:#2563eb;text-decoration:underline;">${escapeHtml(route.title)}</a> &mdash; ${escapeHtml(RESOURCE_DESCRIPTIONS[route.type])}</li>`
  ).join('\n      ');

  return `
  <main id="seo-fallback" style="max-width:960px;margin:0 auto;padding:24px 16px;font-family:Inter,Arial,sans-serif;line-height:1.6;color:#0f172a;">
    <h1 style="font-size:30px;margin:0 0 12px;">Kubernetes YAML Generator &mdash; Free Online K8s Manifest Builder</h1>
    <p style="font-size:18px;margin:0 0 16px;">Build production-ready Kubernetes YAML manifests visually. Free, online, no sign-up required.</p>
    <p style="margin:0 0 16px;">Stop writing Kubernetes YAML from scratch. This visual generator lets you configure Deployments, Services, Ingress, ConfigMaps, Secrets, and more through an intuitive form interface with real-time YAML preview. Every manifest is validated against Kubernetes best practices before you copy or export.</p>

    <h2 style="font-size:20px;margin:20px 0 8px;">Features</h2>
    <ul style="margin:0 0 16px 20px;">
      <li>Visual form builder for 11 Kubernetes resource types</li>
      <li>Real-time YAML preview with syntax highlighting</li>
      <li>Built-in validation against Kubernetes best practices</li>
      <li>Import existing YAML to edit visually</li>
      <li>Export to file or copy to clipboard</li>
      <li>Topology view to visualize resource relationships</li>
      <li>Works entirely in the browser &mdash; no server, no sign-up</li>
    </ul>

    <h2 style="font-size:20px;margin:20px 0 8px;">Supported Kubernetes Resources</h2>
    <ul style="margin:0 0 16px 20px;">
      ${resourceLinks}
    </ul>

    <h2 style="font-size:20px;margin:20px 0 8px;">Quick Example: Deployment YAML</h2>
    <pre style="margin:0 0 16px;background:#0f172a;color:#e2e8f0;padding:12px;border-radius:8px;overflow:auto;"><code>apiVersion: apps/v1
kind: Deployment
metadata:
  name: my-app
  labels:
    app: my-app
spec:
  replicas: 3
  selector:
    matchLabels:
      app: my-app
  template:
    metadata:
      labels:
        app: my-app
    spec:
      containers:
        - name: my-app
          image: nginx:1.25
          ports:
            - containerPort: 80</code></pre>

    <h2 style="font-size:20px;margin:20px 0 8px;">Frequently Asked Questions</h2>
    <dl style="margin:0 0 16px;">
      <dt style="font-weight:600;margin:8px 0 4px;">What is a Kubernetes YAML generator?</dt>
      <dd style="margin:0 0 8px 0;">A Kubernetes YAML generator helps you create valid K8s manifest files through a visual interface instead of writing YAML by hand, reducing syntax errors and speeding up configuration.</dd>
      <dt style="font-weight:600;margin:8px 0 4px;">Is this tool free?</dt>
      <dd style="margin:0 0 8px 0;">Yes, completely free. It runs entirely in your browser with no sign-up and no server-side processing.</dd>
      <dt style="font-weight:600;margin:8px 0 4px;">What resources can I generate?</dt>
      <dd style="margin:0 0 8px 0;">Deployments, Services, Ingress, ConfigMaps, Secrets, PVCs, Jobs, CronJobs, DaemonSets, StatefulSets, and HPAs.</dd>
    </dl>

    <p style="margin:0;color:#475569;font-size:14px;">This static content helps search engines index the homepage before JavaScript executes.</p>
  </main>`;
};

const buildHomepageFaqJsonLd = () => {
  const payload = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: HOMEPAGE.faq.map(item => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: item.answer
      }
    }))
  };
  return JSON.stringify(payload);
};

const addHreflangTags = (html, url) => {
  // Remove any existing hreflang tags first to avoid duplicates
  let result = html.replace(/<link rel="alternate" hreflang="[^"]*" href="[^"]*" ?\/?>\s*/g, '');
  const hreflang = `  <link rel="alternate" hreflang="x-default" href="${url}" />\n  <link rel="alternate" hreflang="en" href="${url}" />\n`;
  return updateTag(result, /<\/head>/i, `${hreflang}</head>`);
};

const generate = async () => {
  const indexHtml = await fs.readFile(INDEX_FILE, 'utf8');

  for (const route of ROUTES) {
    const routeUrl = `${BASE_URL}/${route.type}`;
    const fullTitle = `${route.title} | K8s YAML Generator`;
    let html = indexHtml;

    html = updateTag(html, /<title>[\s\S]*?<\/title>/i, `<title>${escapeHtml(fullTitle)}</title>`);
    html = updateTag(html, /<link rel="canonical" href="[^"]*" ?\/?>/i, `<link rel="canonical" href="${routeUrl}" />`);
    html = updateTag(html, /<meta name="description"[\s\S]*?content="[^"]*"[^>]*>/i, `<meta name="description" content="${escapeHtml(route.description)}" />`);
    html = updateTag(html, /<meta property="og:url" content="[^"]*" ?\/?>/i, `<meta property="og:url" content="${routeUrl}" />`);
    html = updateTag(html, /<meta property="og:title" content="[^"]*" ?\/?>/i, `<meta property="og:title" content="${escapeHtml(fullTitle)}" />`);
    html = updateTag(html, /<meta property="og:description"[\s\S]*?content="[^"]*"[^>]*>/i, `<meta property="og:description" content="${escapeHtml(route.description)}" />`);
    html = updateTag(html, /<meta property="twitter:url" content="[^"]*" ?\/?>/i, `<meta property="twitter:url" content="${routeUrl}" />`);
    html = updateTag(html, /<meta property="twitter:title" content="[^"]*" ?\/?>/i, `<meta property="twitter:title" content="${escapeHtml(fullTitle)}" />`);
    html = updateTag(html, /<meta property="twitter:description"[\s\S]*?content="[^"]*"[^>]*>/i, `<meta property="twitter:description" content="${escapeHtml(route.description)}" />`);
    html = addHreflangTags(html, routeUrl);
    html = updateTag(
      html,
      /<\/head>/i,
      `  <script id="route-faq-jsonld" type="application/ld+json">${buildFaqJsonLd(route)}</script>\n</head>`
    );
    html = updateTag(html, /<body>/i, `<body>${buildFallbackContent(route)}`);
    html = updateTag(
      html,
      /<\/body>/i,
      `  <script>document.getElementById('seo-fallback')?.remove();</script>\n</body>`
    );

    const outFile = path.join(DIST_DIR, `${route.type}.html`);
    await fs.writeFile(outFile, html, 'utf8');
  }

  // --- Homepage prerendering (in-place modification of dist/index.html) ---
  let homepageHtml = indexHtml;
  homepageHtml = updateTag(homepageHtml, /<title>[\s\S]*?<\/title>/i, `<title>${escapeHtml(HOMEPAGE.title)}</title>`);
  homepageHtml = updateTag(homepageHtml, /<meta name="description"[\s\S]*?content="[^"]*"[^>]*>/i, `<meta name="description" content="${escapeHtml(HOMEPAGE.description)}" />`);
  homepageHtml = updateTag(homepageHtml, /<meta property="og:title" content="[^"]*" ?\/?>/i, `<meta property="og:title" content="${escapeHtml(HOMEPAGE.title)}" />`);
  homepageHtml = updateTag(homepageHtml, /<meta property="og:description"[\s\S]*?content="[^"]*"[^>]*>/i, `<meta property="og:description" content="${escapeHtml(HOMEPAGE.description)}" />`);
  homepageHtml = updateTag(homepageHtml, /<meta property="twitter:title" content="[^"]*" ?\/?>/i, `<meta property="twitter:title" content="${escapeHtml(HOMEPAGE.title)}" />`);
  homepageHtml = updateTag(homepageHtml, /<meta property="twitter:description"[\s\S]*?content="[^"]*"[^>]*>/i, `<meta property="twitter:description" content="${escapeHtml(HOMEPAGE.description)}" />`);
  homepageHtml = addHreflangTags(homepageHtml, `${BASE_URL}/`);
  homepageHtml = updateTag(
    homepageHtml,
    /<\/head>/i,
    `  <script id="homepage-faq-jsonld" type="application/ld+json">${buildHomepageFaqJsonLd()}</script>\n</head>`
  );
  homepageHtml = updateTag(homepageHtml, /<body>/i, `<body>${buildHomepageFallback()}`);
  homepageHtml = updateTag(
    homepageHtml,
    /<\/body>/i,
    `  <script>document.getElementById('seo-fallback')?.remove();</script>\n</body>`
  );
  await fs.writeFile(INDEX_FILE, homepageHtml, 'utf8');

  console.log(`Generated ${ROUTES.length} prerendered route HTML files + homepage fallback.`);
};

generate().catch((error) => {
  console.error('Failed to generate prerendered pages:', error);
  process.exitCode = 1;
});
