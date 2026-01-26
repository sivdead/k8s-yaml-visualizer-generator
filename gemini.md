# K8s YAML Visualizer Generator - Development Guide

## 项目概述 / Project Overview

This is a visual Kubernetes YAML configuration generator built with React + TypeScript + Vite.

## 资源智能关联模式 / Smart Resource Association Patterns

### 核心概念 / Core Concept

The application maintains a `savedConfigs` state in `App.tsx` that stores all user-created K8s resources. These resources can be used to provide smart suggestions and auto-completion when creating new resources that reference existing ones.

### 实现模式 / Implementation Pattern

#### 1. 传递资源数据 / Passing Resource Data

Forms that need access to other saved resources receive them via `savedResources` prop:

```tsx
// In App.tsx
<ServiceForm 
  data={formData} 
  onChange={setFormData} 
  savedResources={savedConfigs.map(c => c.data)}  // ← 传递已保存资源
/>
```

#### 2. 组件接口定义 / Component Interface

Add `savedResources` to your form's Props interface:

```tsx
interface Props {
  data: YourResourceType;
  onChange: (data: YourResourceType) => void;
  /** 已保存的资源列表，用于智能关联 */
  savedResources?: K8sResource[];
}
```

#### 3. 过滤和提取资源 / Filtering and Extracting Resources

Use `useMemo` to filter relevant resources and extract useful data:

```tsx
import { isConfigMap, isSecret } from '../../utils/typeGuards';

const configMapOptions = useMemo(() => {
  return savedResources
    .filter(r => isConfigMap(r))
    .map(r => ({
      name: r.metadata.name,
      keys: Object.keys((r as ConfigMapResource).data || {}),
    }));
}, [savedResources]);
```

#### 4. 提供快速选择 UI / Quick Selection UI

Use a styled dropdown with the ⚡ icon to indicate smart selection:

```tsx
{configMapOptions.length > 0 && (
  <div className="flex items-center gap-1">
    <Zap size={12} className="text-blue-500" />
    <select
      className="text-xs px-1.5 py-0.5 rounded border border-blue-300 ..."
      value=""
      onChange={(e) => handleQuickSelect(e.target.value)}
    >
      <option value="">⚡ Select</option>
      {configMapOptions.map((cm, idx) => (
        <option key={idx} value={cm.name}>{cm.name}</option>
      ))}
    </select>
  </div>
)}
```

### 现有智能关联示例 / Existing Smart Association Examples

| 场景 / Scenario | 源组件 / Source | 目标组件 / Target | 实现位置 / Implementation |
|---|---|---|---|
| Service → Deployment | ServiceForm | Workload Selector | `ServiceForm.tsx:30-39` |
| Ingress → Service | IngressForm | Backend Service | `IngressForm.tsx:22-29` |
| Deployment → ConfigMap/Secret | EnvVarsSection | Env Vars | **待实现 / To be implemented** |

### 类型守卫 / Type Guards

Always use type guards from `utils/typeGuards.ts` for safe type checking:

```tsx
import { isConfigMap, isSecret, isDeployment } from '../../utils/typeGuards';

if (isConfigMap(resource)) {
  // TypeScript now knows this is ConfigMapResource
  const keys = Object.keys(resource.data);
}
```

---

## 组件结构 / Component Structure

### 表单组件 / Form Components

- `src/components/forms/` - 各资源类型的表单组件
- `src/components/forms/shared/` - 共享子组件（EnvVarsSection, ProbeForm 等）

### 共享组件开发规范 / Shared Component Guidelines

1. **Props 传递**: 如需访问外部资源，通过 props 逐层传递
2. **国际化**: 使用 `useLanguage()` hook 获取翻译
3. **样式**: 使用 Tailwind CSS，支持 dark mode (`dark:` 前缀)
4. **Toast 通知**: 使用 `useToast()` hook 显示消息

---

## 国际化 / Internationalization

翻译文件位于 `src/contexts/LanguageContext.tsx`，添加新翻译:

```tsx
// 在 translations 对象中添加
deploy: {
  // ...existing
  selectConfigMap: 'Select ConfigMap',  // 新增
  selectSecret: 'Select Secret',
}
```

---

## 测试说明 / Testing Notes

目前项目未配置自动化测试框架。验证更改时:

1. **本地开发**: `npm run dev`
2. **手动测试步骤**:
   - 创建并保存一个 ConfigMap / Secret
   - 创建 Deployment，在环境变量中测试智能选择
   - 验证生成的 YAML 是否正确

---

## 开发流程建议 / Development Workflow

1. 在 `TASKLIST.md` 中标记任务为进行中 `[/]`
2. 实现功能，遵循现有代码模式
3. 测试功能正常工作
4. 更新 `TASKLIST.md` 标记为完成 `[x]`
