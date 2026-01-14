# K8s YAML Visualizer Generator - 任务清单

> 最后更新: 2026-01-08
> 
> 说明: 请根据需要调整优先级 (P0-P3)，勾选表示已完成，删除表示不需要

---

## 🔧 代码质量优化 (P1)

### 组件拆分
- [x] 拆分 `DeploymentForm.tsx` (760行) 为更小的子组件
  - [x] `ContainerSection.tsx` - 容器配置区块
  - [x] `shared/ResourceInput.tsx` - CPU/Memory 输入
  - [x] `shared/ProbeForm.tsx` - 健康检查探针
  - [x] `shared/ResourceLimitsSection.tsx` - 资源限制
  - [x] `shared/EnvVarsSection.tsx` - 环境变量
  - [x] `shared/VolumeMountsSection.tsx` - 卷挂载

### 类型安全
- [x] 移除 `App.tsx` 中的 `as any` 类型断言
- [x] 使用 discriminated union 优化资源类型判断
- [x] 添加表单数据的运行时验证 (Zod/Yup)

### 状态管理
- [x] 评估是否引入 Zustand 进行状态管理
- [x] 抽取表单逻辑到自定义 hooks

---

## ✨ 功能增强 - 短期 (P1)

### 用户体验
- [x] YAML 预览区语法高亮 (使用 Prism 或 highlight.js)
- [x] 添加全局暗色模式开关
- [x] 表单实时验证反馈 (替代 alert)
- [x] 添加 Toast 通知组件

### 核心功能
- [x] 多资源组合导出 (合并为单个 YAML，使用 --- 分隔)
- [x] 生成的 YAML 进行 K8s 规范校验
- [x] 支持 YAML 注释 (用户可添加说明)

---

## 🗺️ 拓扑视图 (P2)

> 使用 @xyflow/react 实现资源关系可视化

- [x] 设计拓扑视图数据结构
- [x] 实现资源节点组件 (使用 @xyflow/react)
- [x] 自动生成资源间连接关系
  - Deployment → Service (通过 selector)
  - Service → Ingress (通过 backend)
  - Deployment → ConfigMap/Secret (通过 env/volume 引用)
  - Deployment → PVC (通过 volume)
- [x] 支持从拓扑视图点击编辑资源

---

## 📦 更多资源类型 (P2)

- [x] StatefulSet
- [x] DaemonSet
- [x] Job (单次任务)
- [x] HorizontalPodAutoscaler (HPA)
- [ ] NetworkPolicy
- [ ] ServiceAccount
- [ ] Role / RoleBinding
- [ ] LimitRange / ResourceQuota

---

## 📋 模板与预设 (P2)

- [ ] 内置常见应用模板库
  - [ ] Nginx 反向代理
  - [ ] Redis 单机版
  - [ ] MySQL / PostgreSQL
  - [ ] Node.js 应用
  - [ ] Spring Boot 应用
- [ ] 支持用户自定义模板
- [ ] 模板导入/导出

---

## 🔗 智能关联 (P2)

- [x] 创建 Service 时自动建议关联已有 Deployment 的 selector
- [x] 创建 Ingress 时自动补全已有 Service 名称
- [ ] Deployment 环境变量智能关联 ConfigMap/Secret
- [ ] 统一管理项目中所有 Labels，支持复用
- [ ] 批量修改多个资源的 namespace

---

## 📝 导出增强 (P3)

- [ ] 导出为 Kustomize 结构 (base + overlays)
- [ ] 导出为 Helm Chart 模板
- [ ] 支持批量下载 (ZIP 包含所有资源)
- [ ] 生成 kubectl apply 命令脚本

---

## 🤖 AI 辅助 (P3)

- [ ] 自然语言生成 YAML (如 "创建一个3副本的nginx应用")
- [ ] 配置最佳实践建议
- [ ] 资源用量推荐 (基于应用类型)
- [ ] YAML 错误智能修复建议

---

## ☁️ 云端能力 (P3)

- [ ] 用户登录系统
- [ ] 配置云端同步
- [ ] 分享配置链接
- [ ] 团队协作 workspace

---

## 🐳 集群集成 (P3)

- [ ] 连接真实 K8s 集群 (通过 kubeconfig)
- [ ] 查看集群现有资源
- [ ] 一键部署生成的 YAML
- [ ] 资源状态实时监控

---

## 📊 高级功能 (P3)

- [ ] 两个配置的 Diff 对比视图
- [ ] 配置版本历史记录
- [ ] Undo/Redo 操作支持
- [ ] 键盘快捷键支持

---

## 💄 UI/UX 优化 (持续)

- [ ] 移动端响应式布局优化
- [ ] 添加引导 Tour (新用户指引)
- [ ] 表单字段帮助 tooltip
- [ ] 加载状态骨架屏

---

## 📖 文档与测试

- [ ] 完善 README 使用文档
- [ ] 添加组件单元测试
- [ ] 添加 E2E 测试 (Playwright)
- [ ] 贡献者指南

---

## 备注

请在此记录任何额外的想法或需求：

- 
- 
- 

