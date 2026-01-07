
export type ResourceType = 'deployment' | 'service' | 'configmap' | 'ingress' | 'pvc' | 'secret' | 'cronjob';

export interface BaseResource {
  apiVersion: string;
  kind: string;
  metadata: {
    name: string;
    namespace: string;
    labels?: Record<string, string>;
    annotations?: Record<string, string>;
  };
}

export interface LifecycleHandler {
  exec?: {
    command: string[];
  };
}

export interface EnvVar {
  name: string;
  value?: string;
  valueFrom?: {
    configMapKeyRef?: {
      name: string;
      key: string;
    };
    secretKeyRef?: {
      name: string;
      key: string;
    };
    fieldRef?: {
      fieldPath: string;
    };
  };
}

export interface EnvFromSource {
  configMapRef?: {
    name: string;
  };
  secretRef?: {
    name: string;
  };
  prefix?: string;
}

export interface Volume {
  name: string;
  persistentVolumeClaim?: {
    claimName: string;
  };
  configMap?: {
    name: string;
  };
  secret?: {
    secretName: string;
  };
  emptyDir?: {};
  hostPath?: {
    path: string;
    type?: string;
  };
}

export interface VolumeMount {
  name: string;
  mountPath: string;
  readOnly?: boolean;
}

export interface Probe {
  httpGet?: {
    path: string;
    port: number;
    scheme?: string;
  };
  tcpSocket?: {
    port: number;
  };
  exec?: {
    command: string[];
  };
  initialDelaySeconds?: number;
  periodSeconds?: number;
  timeoutSeconds?: number;
  successThreshold?: number;
  failureThreshold?: number;
}

export interface Container {
  name: string;
  image: string;
  imagePullPolicy: string;
  ports?: Array<{ containerPort: number }>;
  resources?: {
    requests?: { cpu: string; memory: string };
    limits?: { cpu: string; memory: string };
  };
  env?: Array<EnvVar>;
  envFrom?: Array<EnvFromSource>;
  volumeMounts?: Array<VolumeMount>;
  lifecycle?: {
    postStart?: LifecycleHandler;
    preStop?: LifecycleHandler;
  };
  command?: string[];
  args?: string[];
  livenessProbe?: Probe;
  readinessProbe?: Probe;
}

export interface DeploymentResource extends BaseResource {
  kind: 'Deployment';
  spec: {
    replicas: number;
    selector: {
      matchLabels: Record<string, string>;
    };
    template: {
      metadata: {
        labels: Record<string, string>;
      };
      spec: {
        volumes?: Array<Volume>;
        imagePullSecrets?: Array<{ name: string }>;
        initContainers?: Array<Container>;
        containers: Array<Container>;
      };
    };
  };
}

export interface ServiceResource extends BaseResource {
  kind: 'Service';
  spec: {
    type: 'ClusterIP' | 'NodePort' | 'LoadBalancer';
    selector: Record<string, string>;
    ports: Array<{
      name?: string;
      protocol: string;
      port: number;
      targetPort: number;
    }>;
    externalIPs?: string[];
  };
}

export interface ConfigMapResource extends BaseResource {
  kind: 'ConfigMap';
  data: Record<string, string>;
}

export interface IngressResource extends BaseResource {
  kind: 'Ingress';
  spec: {
    ingressClassName?: string;
    rules: Array<{
      host?: string;
      http: {
        paths: Array<{
          path: string;
          pathType: 'Prefix' | 'Exact' | 'ImplementationSpecific';
          backend: {
            service: {
              name: string;
              port: {
                number: number;
              };
            };
          };
        }>;
      };
    }>;
  };
}

export interface PersistentVolumeClaimResource extends BaseResource {
  kind: 'PersistentVolumeClaim';
  spec: {
    accessModes: string[];
    storageClassName?: string;
    volumeMode?: string;
    resources: {
      requests: {
        storage: string;
      };
    };
  };
}

export interface SecretResource extends BaseResource {
  kind: 'Secret';
  type: string; // e.g. Opaque
  data: Record<string, string>;
  stringData?: Record<string, string>; // We might just use data in our internal state for simplicity, or handle both.
}

export interface JobTemplateSpec {
  spec: {
    template: {
      spec: {
        containers: Array<Container>;
        restartPolicy: string;
        imagePullSecrets?: Array<{ name: string }>;
      };
    };
  };
}

export interface CronJobResource extends BaseResource {
  kind: 'CronJob';
  spec: {
    schedule: string; // e.g. "*/5 * * * *"
    jobTemplate: JobTemplateSpec;
  };
}

export type K8sResource = DeploymentResource | ServiceResource | ConfigMapResource | IngressResource | PersistentVolumeClaimResource | SecretResource | CronJobResource;
