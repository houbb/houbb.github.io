---
layout: post
title: 流程控制-02-vue3项目创建流程引擎前端 demo
date: 2025-8-9 02:30:30 +0800
categories: [FLOW]
tags: [flow, vue3, sh]
published: true
---


# 项目创建

```
npm create vite@latest logic-flow-demo -- --template vue


cd logic-flow-demo
  npm install
  npm run dev
```

## 报错

```
6 packages are looking for funding
  run `npm fund` for details

> logic-flow-demo@0.0.0 dev
> vite

error when starting dev server:
TypeError: crypto.hash is not a function
    at getHash (file:///D:/vue-demo/logic-flow-demo/node_modules/vite/dist/node/chunks/dep-eRCq8YxU.js:2789:21)
    at getLockfileHash (file:///D:/vue-demo/logic-flow-demo/node_modules/vite/dist/node/chunks/dep-eRCq8YxU.js:11745:9)
    at getDepHash (file:///D:/vue-demo/logic-flow-demo/node_modules/vite/dist/node/chunks/dep-eRCq8YxU.js:11748:23)
    at initDepsOptimizerMetadata (file:///D:/vue-demo/logic-flow-demo/node_modules/vite/dist/node/chunks/dep-eRCq8YxU.js:11201:53)
    at createDepsOptimizer (file:///D:/vue-demo/logic-flow-demo/node_modules/vite/dist/node/chunks/dep-eRCq8YxU.js:34854:17)
    at new DevEnvironment (file:///D:/vue-demo/logic-flow-demo/node_modules/vite/dist/node/chunks/dep-eRCq8YxU.js:35619:109)
    at Object.defaultCreateClientDevEnvironment [as createEnvironment] (file:///D:/vue-demo/logic-flow-demo/node_modules/vite/dist/node/chunks/dep-eRCq8YxU.js:36038:9)
    at _createServer (file:///D:/vue-demo/logic-flow-demo/node_modules/vite/dist/node/chunks/dep-eRCq8YxU.js:28464:132)
    at async CAC.<anonymous> (file:///D:/vue-demo/logic-flow-demo/node_modules/vite/dist/node/cli.js:573:18)

```

### 版本

```
$ node -v
v20.10.0
```

### 解决方式 降级到 Node 20.10 能跑的 Vite 版本


```bash
npm install vite@5.4.10 @vitejs/plugin-vue@5.1.4 --save-dev
```

然后清理依赖缓存并重装：

```bash
rm -rf node_modules package-lock.json
npm install
npm run dev
```

## 效果

http://localhost:5173/ 可以查看效果


# vue logic-flow 入门

当然可以！下面给你一个用 Vue 3 搭配 LogicFlow 的最简入门例子，帮你快速在 Vue 3 项目里集成 LogicFlow 画布。

---

### 1. 安装 LogicFlow

```bash
npm install @logicflow/core
```

---

### 2. 在 Vue 3 组件中使用 LogicFlow

```vue
<template>
  <div ref="lfContainer" class="logicflow-container"></div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'
import LogicFlow from '@logicflow/core'

const lfContainer = ref(null)
let lf = null

onMounted(() => {
  lf = new LogicFlow({
    container: lfContainer.value,
    width: 800,
    height: 600,
  })

  lf.render()

  // 添加一个节点示例
  lf.addNode({
    id: 'node1',
    type: 'rect',
    x: 100,
    y: 100,
    text: 'Hello LogicFlow',
  })
})

onBeforeUnmount(() => {
  // 组件卸载时销毁实例，避免内存泄漏
  if (lf) {
    lf.destroy()
    lf = null
  }
})
</script>

<style>
.logicflow-container {
  border: 1px solid #ddd;
  width: 800px;
  height: 600px;
}
</style>
```

### 说明

* 我们用 `ref` 获取容器 DOM。
* `new LogicFlow()` 初始化画布，传入容器和尺寸。
* `lf.render()` 渲染画布。
* `lf.addNode()` 动态添加一个矩形节点。
* 组件销毁时调用 `lf.destroy()` 做清理。

到这里我们完成一个最简单的 demo。




# chat

## 报错

```
  File: D:/vue-demo/logic-flow-demo/src/components/FlowEditor.vue:10:13
  1  |  import { ref, onMounted, onBeforeUnmount } from 'vue'
  2  |    import LogicFlow from '@logicflow/core'
  3  |    import '@logicflow/core/dist/style.css'
     |              ^
  4  |
  5  |
      at TransformPluginContext._formatError (file:///D:/vue-demo/logic-flow-demo/node_modules/vite/dist/node/chunks/dep-C6uTJdX2.js:49258:41)
      at TransformPluginContext.error (file:///D:/vue-demo/logic-flow-demo/node_modules/vite/dist/node/chunks/dep-C6uTJdX2.js:49253:16)
      at normalizeUrl (file:///D:/vue-demo/logic-flow-demo/node_modules/vite/dist/node/chunks/dep-C6uTJdX2.js:64291:23)
      at async file:///D:/vue-demo/logic-flow-demo/node_modules/vite/dist/node/chunks/dep-C6uTJdX2.js:64423:39
      at async Promise.all (index 2)
      at async TransformPluginContext.transform (file:///D:/vue-demo/logic-flow-demo/node_modules/vite/dist/node/chunks/dep-C6uTJdX2.js:64350:7)
      at async PluginContainer.transform (file:///D:/vue-demo/logic-flow-demo/node_modules/vite/dist/node/chunks/dep-C6uTJdX2.js:49099:18)
      at async loadAndTransform (file:///D:/vue-demo/logic-flow-demo/node_modules/vite/dist/node/chunks/dep-C6uTJdX2.js:51977:27)
      at async viteTransformMiddleware (file:///D:/vue-demo/logic-flow-demo/node_modules/vite/dist/node/chunks/dep-C6uTJdX2.js:62105:24) (x2)
```

确认下本地的 `@logicflow/core/dist/index.css` 是这个文件，修正下即可。

## n8n dify 他们的是基于什么组件实现的？核心是如何实现的？

很棒的问题！想了解 n8n 和 dify 这类**可视化工作流/流程编辑器**的底层核心及用到的技术组件，以下是我整理的深度分析：

---

## 1. n8n 的核心技术栈和实现

### 核心架构

* **前端**
  n8n 的 Web 前端主要用 **React** 编写，核心流程编辑器用的是 **React Flow** 组件库（或自己基于类似理念实现的流程画布）。
  React Flow 是一个 React 专用的、专注节点拖拽、连线和编辑的库，提供画布缩放、节点连接、连线断开、拖拽交互等功能。

* **节点和连接**
  节点表示工作流中的任务（API调用、数据处理等），每个节点有输入和输出端口，可以拖拽连接形成执行顺序。
  节点数据结构包含节点参数、状态、连接关系。

* **工作流执行引擎**
  n8n 里，流程设计与执行是分离的，前端只负责流程可视化，后端用 Node.js 运行工作流逻辑，支持异步执行、重试、条件分支等。

### 关键点

* **React Flow**
  [https://reactflow.dev/](https://reactflow.dev/)

  * 开源，支持节点拖拽、连线、选中、删除、缩放等核心画布功能
  * 节点自定义渲染，方便扩展各种节点UI
  * 内置丰富事件支持流程交互

* **状态管理**
  n8n 前端使用 React Context 和自定义hooks管理节点数据和连线状态。

---

## 2. dify 的核心技术栈和实现

dify（字节跳动开源的 AI 工作流平台）目前官方并未公开完整的技术细节源码，但从公开演示和一些社区信息看，dify的可视化流程编辑：

* **基于 LogicFlow**
  dify 官网示例和文档中多次提到使用 LogicFlow 作为流程图底层实现，LogicFlow 是阿里团队开源的流程图编辑器，专注图的可视化、拖拽和连线。

* **二次开发和定制**
  dify 在 LogicFlow 之上做了大量定制，包含丰富的节点类型、流程控制逻辑、拖拽左侧组件面板、节点属性编辑器、右键菜单、多选操作等。

* **Vue3 + TypeScript** 技术栈
  dify 的前端更多使用 Vue3 + Pinia 进行状态管理，配合 LogicFlow 做可视化拖拽。

---

## 3. 这些平台核心是如何实现的？

### 核心要素总结

| 核心功能      | 具体实现说明                                                         |
| --------- | -------------------------------------------------------------- |
| **画布交互**  | 基于流程图引擎（React Flow / LogicFlow / X6等），支持节点拖拽、连线、缩放、框选、复制粘贴等交互。 |
| **节点定义**  | 节点可自定义，包含显示内容、输入输出端口、参数配置，动态渲染节点 UI。                           |
| **连线逻辑**  | 节点间连线代表流程执行路径，连线可拖拽创建和删除，支持校验（端口兼容性、循环等）。                      |
| **状态管理**  | 画布数据（节点、连线、画布位置、选中状态）存在于前端状态管理库中，保持画布与数据同步。                    |
| **属性面板**  | 选中节点时，显示节点参数配置面板，支持表单式编辑，实时同步回画布节点数据。                          |
| **流程序列化** | 流程图结构以 JSON 格式保存，方便持久化、导入导出和远程同步。                              |
| **流程执行**  | 前端设计的流程导出成执行图，后端工作流引擎解析执行，支持异步、条件、重试、错误处理。                     |

---

## 4. 总结

| 平台   | 画布组件       | 技术栈          | 备注                     |
| ---- | ---------- | ------------ | ---------------------- |
| n8n  | React Flow | React + Node | React Flow 开源，社区活跃     |
| dify | LogicFlow  | Vue3 + TS    | 基于 LogicFlow 二次开发，定制丰富 |

---

## 5. 如果你想自己做类似功能

* **推荐先用 LogicFlow（Vue3）或 React Flow（React）快速搭建拖拽画布**
* **设计节点模型和连接规则**
* **做节点属性编辑面板，绑定状态管理**
* **实现流程导入导出和执行逻辑接口**

---

如果你想，我可以帮你写个基于 LogicFlow 的**Vue3 拖拽流程编辑器示例**，包含：

* 左侧节点拖拽面板
* 中间画布节点拖拽连线
* 右侧属性编辑器

一步步教你实现一个基础版的 n8n/dify 流程编辑器。你觉得怎么样？


# 参考资料

* any list
{:toc}