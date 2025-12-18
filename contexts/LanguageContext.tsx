
import React, { createContext, useContext, useState, ReactNode } from 'react';

type Language = 'en' | 'zh';

export const translations = {
  en: {
    common: {
      name: 'Name',
      namespace: 'Namespace',
      metadata: 'Metadata',
      add: 'Add',
      cancel: 'Cancel',
      generate: 'Generate',
      delete: 'Delete',
      type: 'Type',
      key: 'Key',
      value: 'Value',
      port: 'Port',
      protocol: 'Protocol',
      selectOrType: 'Select or type...',
      requiredName: 'Please enter a name.',
    },
    nav: {
      workloads: 'Workloads',
      network: 'Network',
      config: 'Config & Storage',
      deployment: 'Deployment',
      service: 'Service',
      ingress: 'Ingress',
      configmap: 'ConfigMap',
      pvc: 'PVC',
      apiKey: 'Current API Key status',
      active: 'Active',
      missing: 'Missing',
    },
    header: {
      config: 'Configuration',
      ai: 'AI Assistant',
      copy: 'Copy',
      copied: 'Copied',
      export: 'Export',
      preview: 'PREVIEW'
    },
    deploy: {
      specs: 'Specifications',
      replicas: 'Replicas',
      containerConfig: 'Container Configuration',
      containers: 'Containers',
      addContainer: 'Add Container',
      initContainers: 'Init Containers',
      addInitContainer: 'Add Init Container',
      containerName: 'Container Name',
      image: 'Image',
      pullPolicy: 'Image Pull Policy',
      resources: 'Resource Constraints',
      requests: 'Requests',
      limits: 'Limits',
      cpu: 'CPU',
      memory: 'Memory',
      envVars: 'Environment Variables',
      volumes: 'Volumes Definition',
      mounts: 'Container Mounts',
      security: 'Security & Access',
      lifecycle: 'Lifecycle Hooks',
      addVar: 'Add Variable',
      addVol: 'Add Volume',
      claimName: 'Claim Name',
      pathHost: 'Path on Host',
      mountPath: 'Mount Path',
      readOnly: 'Read Only',
      pullSecret: 'Image Pull Secrets',
      postStart: 'PostStart Command',
      preStop: 'PreStop Command',
      containerCommand: 'Command',
      containerArgs: 'Arguments',
      guaranteed: 'Guaranteed',
      max: 'Max',
      volType: 'Type',
      volName: 'Volume Name',
      resName: 'Resource Name',
      secName: 'Secret Name',
      cmName: 'ConfigMap Name',
      tempStorage: 'Temporary storage for pod lifetime.',
      noteVolName: "Note: 'Volume Name' must match a volume defined in the section above.",
      alertEnvName: "Please enter an environment variable name.",
      alertVolName: "Please enter a volume name.",
      alertMount: "Please provide both a volume name and a mount path.",
      alertSecret: "Please enter a secret name.",
      healthChecks: 'Health Checks & Probes',
      livenessProbe: 'Liveness Probe',
      readinessProbe: 'Readiness Probe',
      probeType: 'Probe Type',
      initialDelay: 'Initial Delay (s)',
      period: 'Period (s)',
      timeout: 'Timeout (s)',
      failureThreshold: 'Failure Threshold',
      httpPath: 'HTTP Path',
      httpPort: 'HTTP Port',
      tcpPort: 'TCP Port',
      execCommand: 'Exec Command',
    },
    service: {
      networking: 'Networking',
      serviceType: 'Service Type',
      portConfig: 'Port Configuration',
      targetPort: 'Target Port',
      addPort: 'Add Port',
      portName: 'Port Name',
      externalIPs: 'External IPs',
      addIP: 'Add IP',
      ipPlaceholder: 'e.g. 192.168.1.100'
    },
    ingress: {
      annotations: 'Annotations',
      addAnnot: 'Add Annotation',
      controller: 'Controller Settings',
      className: 'Ingress Class Name',
      desc: 'Define which Ingress controller should implement the Ingress (e.g., nginx, alb, traefik).',
      rules: 'Rules & Paths',
      host: 'Host',
      path: 'Path',
      pathType: 'Type',
      serviceName: 'Service Name',
      servicePort: 'Service Port',
      addPath: 'Add Path',
      addRule: 'Add Host Rule',
    },
    configmap: {
      data: 'Data Configuration',
      filename: 'File Name / Key',
      content: 'Value / Content',
      addEntry: 'Add Data Entry',
    },
    pvc: {
      storage: 'Storage Configuration',
      request: 'Storage Request (Size)',
      className: 'Storage Class Name',
      volumeMode: 'Volume Mode',
      accessModes: 'Access Modes',
      note: 'Note: A volume can only be mounted using one access mode at a time, even if it supports many.',
      leaveEmpty: 'Leave empty to use the cluster\'s default StorageClass.'
    },
    ai: {
      title: 'AI Generator',
      desc: 'Describe your {resource} needs',
      placeholder: 'e.g., A {resource} for an nginx server using port 80 with 3 replicas...',
      powered: 'Powered by Gemini 2.5 Flash: The AI will strictly follow Kubernetes schemas to generate a valid configuration.',
      error: 'Could not generate a valid configuration. Please try again.',
      apiError: 'Failed to contact Gemini API. Check your API key.'
    }
  },
  zh: {
    common: {
      name: '名称',
      namespace: '命名空间',
      metadata: '元数据',
      add: '添加',
      cancel: '取消',
      generate: '生成',
      delete: '删除',
      type: '类型',
      key: '键',
      value: '值',
      port: '端口',
      protocol: '协议',
      selectOrType: '选择或输入...',
      requiredName: '请输入名称。',
    },
    nav: {
      workloads: '工作负载',
      network: '网络',
      config: '配置与存储',
      deployment: 'Deployment',
      service: 'Service',
      ingress: 'Ingress',
      configmap: 'ConfigMap',
      pvc: 'PVC',
      apiKey: 'API Key 状态',
      active: '有效',
      missing: '缺失',
    },
    header: {
      config: '配置',
      ai: 'AI 助手',
      copy: '复制',
      copied: '已复制',
      export: '导出',
      preview: '预览'
    },
    deploy: {
      specs: '规格 (Specs)',
      replicas: '副本数 (Replicas)',
      containerConfig: '容器配置',
      containers: '容器列表',
      addContainer: '添加容器',
      initContainers: '初始化容器 (Init Containers)',
      addInitContainer: '添加初始化容器',
      containerName: '容器名称',
      image: '镜像',
      pullPolicy: '拉取策略',
      resources: '资源限制',
      requests: '请求 (Requests)',
      limits: '上限 (Limits)',
      cpu: 'CPU',
      memory: '内存',
      envVars: '环境变量',
      volumes: '存储卷定义',
      mounts: '卷挂载',
      security: '安全与权限',
      lifecycle: '生命周期钩子',
      addVar: '添加变量',
      addVol: '添加存储卷',
      claimName: 'Claim 名称',
      pathHost: '主机路径',
      mountPath: '挂载路径',
      readOnly: '只读',
      pullSecret: '镜像拉取密钥',
      postStart: '启动后命令 (PostStart)',
      preStop: '停止前命令 (PreStop)',
      containerCommand: '命令 (Command)',
      containerArgs: '参数 (Args)',
      guaranteed: '保障资源',
      max: '最大资源',
      volType: '卷类型',
      volName: '卷名称',
      resName: '资源名称',
      secName: 'Secret 名称',
      cmName: 'ConfigMap 名称',
      tempStorage: 'Pod 生命周期内的临时存储。',
      noteVolName: "注意：'卷名称' 必须与上方定义的部分匹配。",
      alertEnvName: "请输入环境变量名称。",
      alertVolName: "请输入卷名称。",
      alertMount: "请提供卷名称和挂载路径。",
      alertSecret: "请输入密钥名称。",
      healthChecks: '健康检查 (Health Checks)',
      livenessProbe: '存活探针 (Liveness Probe)',
      readinessProbe: '就绪探针 (Readiness Probe)',
      probeType: '探针类型',
      initialDelay: '初始延迟 (秒)',
      period: '检测周期 (秒)',
      timeout: '超时时间 (秒)',
      failureThreshold: '失败阈值',
      httpPath: 'HTTP 路径',
      httpPort: 'HTTP 端口',
      tcpPort: 'TCP 端口',
      execCommand: '执行命令',
    },
    service: {
      networking: '网络配置',
      serviceType: '服务类型',
      portConfig: '端口配置',
      targetPort: '目标端口',
      addPort: '添加端口',
      portName: '端口名称',
      externalIPs: '外部 IP (External IPs)',
      addIP: '添加 IP',
      ipPlaceholder: '例如 192.168.1.100'
    },
    ingress: {
      annotations: '注解 (Annotations)',
      addAnnot: '添加注解',
      controller: '控制器设置',
      className: 'Ingress 类名',
      desc: '定义实现 Ingress 的控制器 (例如: nginx, alb, traefik)。',
      rules: '路由规则',
      host: '域名 (Host)',
      path: '路径',
      pathType: '路径类型',
      serviceName: '服务名称',
      servicePort: '服务端口',
      addPath: '添加路径',
      addRule: '添加规则',
    },
    configmap: {
      data: '数据配置',
      filename: '文件名 / 键',
      content: '值 / 内容',
      addEntry: '添加数据项',
    },
    pvc: {
      storage: '存储配置',
      request: '存储大小 (Request)',
      className: '存储类名 (StorageClass)',
      volumeMode: '卷模式',
      accessModes: '访问模式',
      note: '注意：一个卷一次只能使用一种访问模式挂载，即使它支持多种。',
      leaveEmpty: '留空以使用集群默认的 StorageClass。'
    },
    ai: {
      title: 'AI 生成器',
      desc: '描述您的 {resource} 需求',
      placeholder: '例如：一个 {resource}，使用 nginx 镜像，监听 80 端口，3 个副本...',
      powered: '由 Gemini 2.5 Flash 提供支持：AI 将严格遵循 Kubernetes Schema 生成有效配置。',
      error: '无法生成有效配置，请重试。',
      apiError: '连接 Gemini API 失败，请检查 API Key。'
    }
  }
};

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: typeof translations['en'];
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<Language>('en');

  const value = {
    language,
    setLanguage,
    t: translations[language],
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
