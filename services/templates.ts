
import { DeploymentResource, ServiceResource, ConfigMapResource, IngressResource, PersistentVolumeClaimResource } from '../types';

export const defaultDeployment: DeploymentResource = {
  apiVersion: 'apps/v1',
  kind: 'Deployment',
  metadata: {
    name: 'my-app',
    namespace: 'default',
    labels: { app: 'my-app' }
  },
  spec: {
    replicas: 1,
    selector: {
      matchLabels: { app: 'my-app' }
    },
    template: {
      metadata: {
        labels: { app: 'my-app' }
      },
      spec: {
        volumes: [],
        imagePullSecrets: [],
        initContainers: [],
        containers: [
          {
            name: 'my-app-container',
            image: 'nginx:1.25',
            imagePullPolicy: 'Always',
            ports: [{ containerPort: 80 }],
            env: [],
            lifecycle: {},
            volumeMounts: []
          }
        ]
      }
    }
  }
};

export const defaultService: ServiceResource = {
  apiVersion: 'v1',
  kind: 'Service',
  metadata: {
    name: 'my-service',
    namespace: 'default',
    labels: { app: 'my-app' }
  },
  spec: {
    type: 'ClusterIP',
    selector: { app: 'my-app' },
    ports: [
      {
        protocol: 'TCP',
        port: 80,
        targetPort: 80
      }
    ]
  }
};

export const defaultConfigMap: ConfigMapResource = {
  apiVersion: 'v1',
  kind: 'ConfigMap',
  metadata: {
    name: 'my-config',
    namespace: 'default'
  },
  data: {
    "config.json": "{\"key\": \"value\"}",
    "UI_THEME": "dark"
  }
};

export const defaultIngress: IngressResource = {
  apiVersion: 'networking.k8s.io/v1',
  kind: 'Ingress',
  metadata: {
    name: 'my-ingress',
    namespace: 'default',
    annotations: {
      "nginx.ingress.kubernetes.io/rewrite-target": "/"
    }
  },
  spec: {
    ingressClassName: 'nginx',
    rules: [
      {
        host: 'example.com',
        http: {
          paths: [
            {
              path: '/',
              pathType: 'Prefix',
              backend: {
                service: {
                  name: 'my-service',
                  port: { number: 80 }
                }
              }
            }
          ]
        }
      }
    ]
  }
};

export const defaultPVC: PersistentVolumeClaimResource = {
  apiVersion: 'v1',
  kind: 'PersistentVolumeClaim',
  metadata: {
    name: 'my-pvc',
    namespace: 'default',
    labels: {}
  },
  spec: {
    accessModes: ['ReadWriteOnce'],
    resources: {
      requests: {
        storage: '8Gi'
      }
    },
    storageClassName: 'standard',
    volumeMode: 'Filesystem'
  }
};
