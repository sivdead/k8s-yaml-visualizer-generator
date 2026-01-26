
import { K8sResource, ResourceType } from '../types';
import {
    defaultDeployment,
    defaultService,
    defaultConfigMap,
    defaultIngress,
    defaultPVC,
    defaultSecret,
    defaultStatefulSet,
    defaultHPA
} from './templates';

export interface Template {
    id: string;
    name: string;
    description: string;
    icon?: string; // We can use lucide icon names or just handle it in UI
    resources: {
        type: ResourceType;
        data: K8sResource;
        nameSuffix?: string; // e.g. "-service" to append to base name
    }[];
}

const createResource = <T extends K8sResource>(base: T, overrides: Partial<T> | any): T => {
    const merged = JSON.parse(JSON.stringify(base));

    // Deep merge helper could be better, but for now simple property override
    if (overrides.metadata) {
        merged.metadata = { ...merged.metadata, ...overrides.metadata };
    }
    if (overrides.spec) {
        if (merged.kind === 'Service' && overrides.spec) {
            merged.spec = { ...merged.spec, ...overrides.spec };
        } else if ((merged.kind === 'Deployment' || merged.kind === 'StatefulSet') && overrides.spec) {
            // Careful merging for nested objects
            merged.spec = {
                ...merged.spec,
                ...overrides.spec,
                template: {
                    ...merged.spec.template,
                    ...overrides.spec?.template,
                    spec: {
                        ...merged.spec.template.spec,
                        ...overrides.spec?.template?.spec,
                    }
                }
            };
        } else {
            merged.spec = { ...merged.spec, ...overrides.spec };
        }
    }
    if (overrides.data) {
        merged.data = { ...merged.data, ...overrides.data };
    }

    return merged;
};

export const TEMPLATES: Template[] = [
    {
        id: 'nginx-basic',
        name: 'Nginx Static Site',
        description: 'A simple Nginx server serving a static HTML page from a ConfigMap.',
        resources: [
            {
                type: 'configmap',
                data: createResource(defaultConfigMap, {
                    metadata: { name: 'nginx-html' },
                    data: {
                        "index.html": "<html><body><h1>Hello from K8s Gen!</h1></body></html>"
                    }
                })
            },
            {
                type: 'deployment',
                data: createResource(defaultDeployment, {
                    metadata: { name: 'nginx-app' },
                    spec: {
                        replicas: 2,
                        selector: { matchLabels: { app: 'nginx-app' } },
                        template: {
                            metadata: { labels: { app: 'nginx-app' } },
                            spec: {
                                containers: [{
                                    name: 'nginx',
                                    image: 'nginx:alpine',
                                    ports: [{ containerPort: 80 }],
                                    volumeMounts: [{ name: 'html-volume', mountPath: '/usr/share/nginx/html' }]
                                }],
                                volumes: [{
                                    name: 'html-volume',
                                    configMap: { name: 'nginx-html' }
                                }]
                            }
                        }
                    }
                })
            },
            {
                type: 'service',
                data: createResource(defaultService, {
                    metadata: { name: 'nginx-service', labels: { app: 'nginx-app' } },
                    spec: {
                        selector: { app: 'nginx-app' },
                        ports: [{ port: 80, targetPort: 80 }]
                    }
                })
            }
        ]
    },
    {
        id: 'redis-standalone',
        name: 'Redis Standalone',
        description: 'Single replica Redis instance with a Service.',
        resources: [
            {
                type: 'deployment',
                data: createResource(defaultDeployment, {
                    metadata: { name: 'redis-master' },
                    spec: {
                        replicas: 1,
                        selector: { matchLabels: { app: 'redis', role: 'master' } },
                        template: {
                            metadata: { labels: { app: 'redis', role: 'master' } },
                            spec: {
                                containers: [{
                                    name: 'redis',
                                    image: 'redis:7-alpine',
                                    ports: [{ containerPort: 6379 }]
                                }]
                            }
                        }
                    }
                })
            },
            {
                type: 'service',
                data: createResource(defaultService, {
                    metadata: { name: 'redis-service' },
                    spec: {
                        selector: { app: 'redis', role: 'master' },
                        ports: [{ port: 6379, targetPort: 6379 }]
                    }
                })
            }
        ]
    },
    {
        id: 'mysql-stateful',
        name: 'MySQL Stateful',
        description: 'MySQL database with Persistent Volume and Root Password Secret.',
        resources: [
            {
                type: 'secret',
                data: createResource(defaultSecret, {
                    metadata: { name: 'mysql-block-secret' },
                    data: { "mysql-root-password": "change-me-base64-encoded" } // In a real app we'd auto-gen this or prompt
                })
            },
            {
                type: 'service',
                data: createResource(defaultService, {
                    metadata: { name: 'mysql' },
                    spec: {
                        selector: { app: 'mysql' },
                        ports: [{ port: 3306, targetPort: 3306 }],
                        clusterIP: 'None' // Headless for StatefulSet
                    }
                })
            },
            {
                type: 'pvc',
                data: createResource(defaultPVC, {
                    metadata: { name: 'mysql-pvc-template' }, // Just a template placeholder if needed, mostly used in SS volumeClaimTemplates
                    spec: {
                        resources: { requests: { storage: '10Gi' } }
                    }
                })
            },
            {
                type: 'statefulset',
                data: createResource(defaultStatefulSet, {
                    metadata: { name: 'mysql-db' },
                    spec: {
                        serviceName: 'mysql',
                        replicas: 1,
                        selector: { matchLabels: { app: 'mysql' } },
                        template: {
                            metadata: { labels: { app: 'mysql' } },
                            spec: {
                                containers: [{
                                    name: 'mysql',
                                    image: 'mysql:8.0',
                                    ports: [{ containerPort: 3306 }],
                                    env: [{
                                        name: 'MYSQL_ROOT_PASSWORD',
                                        valueFrom: { secretKeyRef: { name: 'mysql-block-secret', key: 'mysql-root-password' } }
                                    }],
                                    volumeMounts: [{ name: 'data', mountPath: '/var/lib/mysql' }]
                                }]
                            }
                        },
                        volumeClaimTemplates: [{
                            metadata: { name: 'data' },
                            spec: {
                                accessModes: ["ReadWriteOnce"],
                                resources: { requests: { storage: "10Gi" } }
                            }
                        }]
                    }
                })
            }
        ]
    },
    {
        id: 'nodejs-app',
        name: 'Node.js Web App',
        description: 'Standard Node.js deployment with Service and Ingress.',
        resources: [
            {
                type: 'deployment',
                data: createResource(defaultDeployment, {
                    metadata: { name: 'node-app' },
                    spec: {
                        replicas: 3,
                        selector: { matchLabels: { app: 'node-app' } },
                        template: {
                            metadata: { labels: { app: 'node-app' } },
                            spec: {
                                containers: [{
                                    name: 'app',
                                    image: 'my-node-app:v1',
                                    ports: [{ containerPort: 3000 }],
                                    env: [{ name: 'NODE_ENV', value: 'production' }]
                                }]
                            }
                        }
                    }
                })
            },
            {
                type: 'service',
                data: createResource(defaultService, {
                    metadata: { name: 'node-service' },
                    spec: {
                        selector: { app: 'node-app' },
                        ports: [{ port: 80, targetPort: 3000 }]
                    }
                })
            },
            {
                type: 'ingress',
                data: createResource(defaultIngress, {
                    metadata: { name: 'node-ingress' },
                    spec: {
                        rules: [{
                            host: 'app.example.com',
                            http: {
                                paths: [{
                                    path: '/',
                                    pathType: 'Prefix',
                                    backend: {
                                        service: {
                                            name: 'node-service',
                                            port: { number: 80 }
                                        }
                                    }
                                }]
                            }
                        }]
                    }
                })
            }
        ]
    },
    {
        id: 'springboot-hpa',
        name: 'Spring Boot + HPA',
        description: 'Java Spring Boot application with Autoscaling configured.',
        resources: [
            {
                type: 'deployment',
                data: createResource(defaultDeployment, {
                    metadata: { name: 'spring-app' },
                    spec: {
                        replicas: 2, // Initial
                        selector: { matchLabels: { app: 'spring-app' } },
                        template: {
                            metadata: { labels: { app: 'spring-app' } },
                            spec: {
                                containers: [{
                                    name: 'app',
                                    image: 'my-spring-app:latest',
                                    ports: [{ containerPort: 8080 }],
                                    resources: {
                                        requests: { cpu: "500m", memory: "512Mi" },
                                        limits: { cpu: "1", memory: "1Gi" }
                                    },
                                    // Spring Boot Actuator/Health check usually
                                    livenessProbe: {
                                        httpGet: { path: "/actuator/health", port: 8080 },
                                        initialDelaySeconds: 30,
                                        periodSeconds: 10
                                    }
                                }]
                            }
                        }
                    }
                })
            },
            {
                type: 'service',
                data: createResource(defaultService, {
                    metadata: { name: 'spring-service' },
                    spec: {
                        selector: { app: 'spring-app' },
                        ports: [{ port: 80, targetPort: 8080 }]
                    }
                })
            },
            {
                type: 'hpa',
                data: createResource(defaultHPA, {
                    metadata: { name: 'spring-hpa' },
                    spec: {
                        scaleTargetRef: {
                            apiVersion: "apps/v1",
                            kind: "Deployment",
                            name: "spring-app"
                        },
                        minReplicas: 2,
                        maxReplicas: 10,
                        targetCPUUtilizationPercentage: 70
                    }
                })
            }
        ]
    }
];
