---
layout: post
title: 一个基于 React Three Fiber 和 WebGPU 构建的 3D 建筑编辑器
date: 2026-03-25 21:01:55 +0800
categories: [JS]
tags: [js, editor]
published: true
---

# Pascal Editor

一个基于 React Three Fiber 和 WebGPU 构建的 3D 建筑编辑器。 ([GitHub][1])

---

## 仓库架构

这是一个使用 Turborepo 管理的 monorepo，包含三个主要包：

```
editor-v2/
├── apps/
│   └── editor/          # Next.js 应用
├── packages/
│   ├── core/            # Schema 定义、状态管理、系统
│   └── viewer/          # 3D 渲染组件
```

### 职责分离

| 包                  | 职责                                         |
| ------------------ | ------------------------------------------ |
| @pascal-app/core   | 节点 schema、场景状态（Zustand）、系统（几何生成）、空间查询、事件总线 |
| @pascal-app/viewer | 基于 React Three Fiber 的 3D 渲染、默认相机/控制、后处理   |
| apps/editor        | UI 组件、工具、自定义行为、编辑器特有系统                     |

viewer 负责使用合理默认值渲染场景，editor 在其基础上扩展交互工具、选择管理和编辑能力。 ([GitHub][1])

---

## 状态存储（Stores）

每个包都有自己的 Zustand store 用于状态管理：

| Store     | 包                  | 职责                                                          |
| --------- | ------------------ | ----------------------------------------------------------- |
| useScene  | @pascal-app/core   | 场景数据：节点、根节点 ID、脏节点、CRUD 操作；持久化到 IndexedDB，并通过 Zundo 实现撤销/重做 |
| useViewer | @pascal-app/viewer | Viewer 状态：当前选择（建筑/楼层/区域）、显示模式（堆叠/爆炸/单独）、相机模式                |
| useEditor | apps/editor        | 编辑器状态：当前工具、结构层可见性、面板状态、编辑器偏好                                |

访问方式：

```js
// React 中订阅
const nodes = useScene((state) => state.nodes)
const levelId = useViewer((state) => state.selection.levelId)
const activeTool = useEditor((state) => state.tool)

// React 外访问
const node = useScene.getState().nodes[id]
useViewer.getState().setSelection({ levelId: 'level_123' })
```

---

## 核心概念

### 节点（Nodes）

节点是描述 3D 场景的数据基本单位，所有节点继承 `BaseNode`：

```
BaseNode {
  id: string              // 自动生成（带类型前缀，如 "wall_abc123"）
  type: string            // 类型标识
  parentId: string | null // 父节点
  visible: boolean
  camera?: Camera         // 可选相机信息
  metadata?: JSON         // 任意元数据
}
```

节点层级结构：

```
Site
└── Building
    └── Level
        ├── Wall → Item（门/窗）
        ├── Slab
        ├── Ceiling → Item（灯）
        ├── Roof
        ├── Zone
        ├── Scan（3D参考）
        └── Guide（2D参考）
```

节点以扁平结构存储（`Record<id, Node>`），通过 `parentId` 和 `children` 表示关系。 ([GitHub][1])

---

### 场景状态（Scene State）

由 `@pascal-app/core` 中的 Zustand 管理：

```
useScene.getState() = {
  nodes: Record<id, AnyNode>,
  rootNodeIds: string[],
  dirtyNodes: Set<string>,

  createNode(node, parentId),
  updateNode(id, updates),
  deleteNode(id),
}
```

中间件：

* Persist：持久化到 IndexedDB（排除临时节点）
* Temporal（Zundo）：支持 50 步撤销/重做 ([GitHub][1])

---

### 场景注册表（Scene Registry）

用于将节点 ID 映射到 Three.js 对象：

```
sceneRegistry = {
  nodes: Map<id, Object3D>,
  byType: {
    wall: Set<id>,
    item: Set<id>,
    zone: Set<id>,
  }
}
```

组件通过 `useRegistry` 注册：

```js
const ref = useRef<Mesh>(null!)
useRegistry(node.id, 'wall', ref)
```

作用：避免遍历场景树，直接访问 3D 对象。 ([GitHub][1])

---

### 节点渲染器（Node Renderers）

每种节点对应一个 React 渲染组件：

```
SceneRenderer
└── NodeRenderer
    ├── BuildingRenderer
    ├── LevelRenderer
    ├── WallRenderer
    ├── SlabRenderer
    ├── ZoneRenderer
    ├── ItemRenderer
```

模式：

1. 创建 mesh/group
2. 注册到 registry
3. 由系统更新几何

示例：

```jsx
const WallRenderer = ({ node }) => {
  const ref = useRef<Mesh>(null!)
  useRegistry(node.id, 'wall', ref)

  return (
    <mesh ref={ref}>
      <boxGeometry args={[0, 0, 0]} />
      <meshStandardMaterial />
      {node.children.map(id => <NodeRenderer key={id} nodeId={id} />)}
    </mesh>
  )
}
```

---

## 技术栈

* React 19 + Next.js 16
* Three.js（WebGPU 渲染）
* React Three Fiber + Drei
* Zustand（状态管理）
* Zod（schema 校验）
* Zundo（撤销/重做）
* three-bvh-csg（布尔几何运算）
* Turborepo（monorepo 管理）
* Bun（包管理器） ([GitHub][1])

---

## 快速开始

### 开发模式

在项目根目录运行：

```bash
# 安装依赖
bun install

# 启动开发环境
bun dev
```

该命令会：

1. 构建 `@pascal-app/core` 和 `@pascal-app/viewer`
2. 监听包变化
3. 启动 Next.js 编辑器开发服务

访问：

```
http://localhost:3000
```

---

## 总结（给你一个技术视角的补充）

这个 README 本质上表达的是一个非常清晰的架构设计思想：

* **Core（数据+系统）**
* **Viewer（纯渲染）**
* **Editor（交互+工具）**

本质是典型的：

> **ECS（Entity + System） + React 渲染分层架构**

如果你是做平台/引擎（你之前提到自动化测试平台），这个设计其实非常值得借鉴：

* “系统（system）驱动状态变化”
* “渲染与业务彻底解耦”
* “扁平数据结构 + registry 加速访问”

# 参考资料

* any list
{:toc}