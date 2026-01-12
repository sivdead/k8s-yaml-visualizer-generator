

import { DeploymentResource, ServiceResource, ConfigMapResource, IngressResource, PersistentVolumeClaimResource, SecretResource, CronJobResource, JobResource, DaemonSetResource, StatefulSetResource, HPAResource } from '../types';

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

export const defaultSecret: SecretResource = {
  apiVersion: 'v1',
  kind: 'Secret',
  metadata: {
    name: 'my-secret',
    namespace: 'default'
  },
  type: 'Opaque',
  data: {
    "api-key": "secret-value"
  }
};

export const defaultCronJob: CronJobResource = {
  apiVersion: 'batch/v1',
  kind: 'CronJob',
  metadata: {
    name: 'my-cronjob',
    namespace: 'default',
    labels: { app: 'my-cronjob' }
  },
  spec: {
    schedule: '*/5 * * * *',
    jobTemplate: {
      spec: {
        template: {
          spec: {
            containers: [
              {
                name: 'my-cronjob-container',
                image: 'busybox',
                imagePullPolicy: 'IfNotPresent',
                command: ['/bin/sh', '-c', 'date; echo Hello from the Kubernetes cluster']
              }
            ],
            restartPolicy: 'OnFailure'
          }
        }
      }
    }
  }
};

export const defaultJob: JobResource = {
  apiVersion: 'batch/v1',
  kind: 'Job',
  metadata: {
    name: 'my-job',
    namespace: 'default',
    labels: { app: 'my-job' }
  },
  spec: {
    completions: 1,
    parallelism: 1,
    backoffLimit: 6,
    template: {
      spec: {
        containers: [
          {
            name: 'my-job-container',
            image: 'busybox:latest',
            imagePullPolicy: 'IfNotPresent',
            command: ['/bin/sh', '-c', 'echo "Job completed successfully" && sleep 10']
          }
        ],
        restartPolicy: 'Never'
      }
    }
  }
};

export const defaultDaemonSet: DaemonSetResource = {
  apiVersion: 'apps/v1',
  kind: 'DaemonSet',
  metadata: {
    name: 'my-daemonset',
    namespace: 'default',
    labels: { app: 'my-daemonset' }
  },
  spec: {
    selector: {
      matchLabels: { app: 'my-daemonset' }
    },
    template: {
      metadata: {
        labels: { app: 'my-daemonset' }
      },
      spec: {
        containers: [
          {
            name: 'my-daemonset-container',
            image: 'nginx:latest',
            imagePullPolicy: 'IfNotPresent',
            ports: [{ containerPort: 80 }]
          }
        ]
      }
    }
  }
};

export const defaultStatefulSet: StatefulSetResource = {
  apiVersion: 'apps/v1',
  kind: 'StatefulSet',
  metadata: {
    name: 'my-statefulset',
    namespace: 'default',
    labels: { app: 'my-statefulset' }
  },
  spec: {
    serviceName: 'my-service',
    replicas: 3,
    selector: {
      matchLabels: { app: 'my-statefulset' }
    },
    template: {
      metadata: {
        labels: { app: 'my-statefulset' }
      },
      spec: {
        containers: [
          {
            name: 'my-statefulset-container',
            image: 'nginx:latest',
            imagePullPolicy: 'IfNotPresent',
            ports: [{ containerPort: 80 }]
          }
        ]
      }
    }
  }
};

export const defaultHPA: HPAResource = {
  apiVersion: 'autoscaling/v1',
  kind: 'HorizontalPodAutoscaler',
  metadata: {
    name: 'my-hpa',
    namespace: 'default'
  },
  spec: {
    scaleTargetRef: {
      apiVersion: 'apps/v1',
      kind: 'Deployment',
      name: 'my-app'
    },
    minReplicas: 1,
    maxReplicas: 10,
    targetCPUUtilizationPercentage: 80
  }
};
