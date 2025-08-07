---
layout: post
title: AI MCP(大模型上下文)-15-流程控制中最重要的可视化 DSL 开源工具
date: 2025-4-15 17:51:19 +0800
categories: [AI]
tags: [ai, mcp, sh]
published: true
---

# chat

## dify 中的工作流 DSL + 画布感觉很好用，这一块有开源可以复用的组件吗？

确实，Dify 中的工作流功能（Workflow DSL + 可视化画布）结合了底层强大的表达能力和上层易用的交互界面，适用于 AI 流程编排、任务自动化、Agent 路由等场景，非常实用。

关于这块是否有开源可复用的组件，分成两个层面来看：


# TOPIC

https://github.com/didi/LogicFlow

---

### ✅ 1. **画布可视化部分（前端 UI 组件）**

这是工作流体验的关键。你可以考虑以下开源项目来实现类似的可视化工作流编排能力：

#### 🔹 [**React Flow**](https://reactflow.dev/)

* ⭐ Star 数：\~20k+
* 技术栈：React + TypeScript
* 特点：支持节点连线、拖拽、缩放、嵌套、节点配置、MiniMap 等
* 应用案例：n8n、Dify、Langflow 等都有使用或借鉴它
* 优势：社区成熟、文档清晰、易拓展
* 常与 Zustand 或 Redux 搭配使用状态管理

#### 🔹 [**JointJS / Rappid**](https://www.jointjs.com/)

* ⭐ 更重一点的方案，适合工业级应用
* 免费版 JointJS 功能还可以，但商业版 Rappid 才是真正强大

#### 🔹 [**Diagram** (by Tldraw 作者)](https://github.com/tldraw/tldraw)

* 更偏“自由画布”，可用作辅助 UX 改造

#### 🔹 [**Flowise**](https://github.com/FlowiseAI/Flowise)

* 虽然是完整的 LLM 流程引擎，但你可以 fork 它的前端画布（基于 React Flow + 自定义节点系统）

---

### ✅ 2. **DSL 编排执行引擎（后端逻辑）**

Dify 中的 DSL 本质上是一种声明式的 JSON/Graph 配置，类似于：

```json
{
  "nodes": [
    {"id": "input", "type": "input"},
    {"id": "llm", "type": "llm", "prompt": "Summarize: {{input.text}}"}
  ],
  "edges": [
    {"source": "input", "target": "llm"}
  ]
}
```

要实现类似功能，你可以参考：

#### 🔸 [**LangGraph**](https://github.com/langchain-ai/langgraph)

* 来自 LangChain 官方的有向图 DSL + 状态执行框架
* 支持循环、条件分支、消息传递等复杂控制流
* 构建 AI Agent 网络非常方便
* 适合做复杂 Agent Workflows 的后端执行引擎

#### 🔸 [**Flowise Backend**](https://github.com/FlowiseAI/Flowise/tree/main/packages/server)

* 完整的 Node.js + TypeScript 后端流程执行引擎
* 每个节点是一个模块，支持 LLM、Tools、Code、Function 等

#### 🔸 [**Dify Server 源码**](https://github.com/langgenius/dify)

* 虽然没有把 DSL 抽象出来为一个独立模块，但你可以分析 `workflows/` 目录下的逻辑抽象方式

---

### ✅ 3. **完整类似 Dify 的开源替代品（可参考/借鉴）**

| 名称                  | 前端画布               | DSL 执行            | 说明           |
| ------------------- | ------------------ | ----------------- | ------------ |
| **Dify**            | ✅（React Flow）      | ✅（Python 执行逻辑）    | 功能全面，建议直接读源码 |
| **Flowise**         | ✅（React Flow）      | ✅（Node.js DSL 执行） | 更开放，适合快速二次开发 |
| **Langflow**        | ✅（Streamlit + 网络图） | ✅（LangChain）      | 不够灵活，不适合大项目  |
| **Superagent**      | ❌                  | ✅                 | 更偏 Agent 管理  |
| **CrewAI (计划支持画布)** | ❌                  | ✅                 | Agent 编排核心   |

---

### ✅ 总结：你可以这样组合构建你自己的 Dify 式工作流系统

| 目标       | 推荐方案                                     |
| -------- | ---------------------------------------- |
| 前端可视化画布  | React Flow（+ Tailwind + Zustand）         |
| 节点定义系统   | 自定义 React 节点组件                           |
| DSL 结构设计 | 借鉴 Dify / LangGraph 的节点-边 JSON 表达法       |
| 后端执行框架   | Python（FastAPI）或 Node（Flowise server 模型） |
| 节点执行逻辑   | plugin 机制，支持 LLM、工具调用、自定义函数              |

---

如果你具体想知道：**怎么把 React Flow 用在你的 Vue 项目中，或想定制某种 DSL 结构设计规范**，我也可以帮你细化方案。你是想复用部分功能，还是打造类似平台？

## 不一定需要是 LLM 我主要想要的是流程控制+节点关系+属性之类的。希望可以在作业平台、测试平台之类、规则引擎的复用这个可视化配置能力

明白了 ✅

你并不是只关注 LLM/Agent，而是想要一种通用的 **流程控制 + 节点连接 + 属性配置 + 可视化画布** 的能力 —— 类似于：

- 低代码平台的流程编排器
- 作业调度平台（如 Airflow）中的 DAG 可视化
- 自动化测试流程定义器
- 规则引擎（if/else 分支 + 动作）的配置界面
- 可扩展组件 + 属性面板 + 连线机制

这样的功能，在 **多个系统中都可复用** —— 这是一个非常实际且通用的诉求 👍

---

## ✅ 推荐开源方案（可复用组件）

### 1. **React Flow**（首选）
- [https://reactflow.dev](https://reactflow.dev)
- ⭐ 最流行、通用性最强的节点式可视化库
- 可视化连接节点 + 属性面板（你自定义即可）+ 拖拽/缩放/保存 JSON 状态
- 很多开源平台（n8n、Flowise、Dify、Langflow）都用它

👉 用它可以实现你要的“通用流程引擎 UI + 节点配置系统”

#### 功能支持：
- ✅ 节点连接（DAG 或有环流程）
- ✅ 节点属性配置（你定义属性表单）
- ✅ 连线控制（控制连接合法性）
- ✅ 保存为 DSL / JSON
- ✅ 画布拖拽缩放 + minimap
- ✅ 自定义节点渲染（展示图标、状态、进度等）

#### 你可以构建的结构：
```json
{
  "nodes": [
    {
      "id": "1",
      "type": "start",
      "data": { "label": "Start", "env": "dev" },
      "position": { "x": 100, "y": 100 }
    },
    {
      "id": "2",
      "type": "sql-task",
      "data": { "query": "SELECT * FROM user" },
      "position": { "x": 300, "y": 100 }
    }
  ],
  "edges": [
    { "source": "1", "target": "2", "type": "smoothstep" }
  ]
}
```

---

### 2. **Vue Flow**（如果你是 Vue 项目）
- [https://vueflow.dev/](https://vueflow.dev/)
- ⭐ Vue 生态下对标 React Flow 的项目
- 同样支持自定义节点、拖拽、属性、缩放、连接等
- 文档也不错，易上手

---

### 3. **Drawflow**（Vue 可选方案）
- GitHub: [https://github.com/jerosoler/Drawflow](https://github.com/jerosoler/Drawflow)
- 更轻量，支持拖动连线，自定义组件等
- 缺点是维护较弱、API 老旧

---

### 4. **Node-RED**（如果想要配合后端逻辑）
- [https://nodered.org/](https://nodered.org/)
- 虽然是面向 IoT/流程的完整平台，但它的画布、属性面板、节点连接系统都可以参考
- 后端用 JSON 执行 flow，本地或远程部署
- 缺点是使用门槛偏高，不容易与现代前端（Vue/React）集成

---

## ✅ 实现建议（如何组件化 & 复用）

你可以封装一个“流程配置组件”，通用于多个场景：

| 模块 | 功能 | 说明 |
|------|------|------|
| 🌐 FlowCanvas.vue / FlowCanvas.tsx | 主画布组件 | 使用 React Flow 或 Vue Flow，封装为组件 |
| 🔌 节点组件库 | 可注册的节点类型 | 每种类型：执行 SQL、发送 API、判断条件、触发通知等 |
| ⚙️ 属性面板 | 显示选中节点的属性表单 | 根据类型动态渲染不同表单（用 form-engine / 自定义组件） |
| 🧠 状态管理 | 用于保存 node/edge 的 JSON | 可以导出为 DSL/JSON，后端可解析 |
| 🔁 后端执行器（可选） | 将 JSON 转为执行流程 | 比如测试平台执行流程、规则引擎触发动作等 |

---

## ✅ 典型应用案例场景

| 你平台的场景 | 画布用法 |
|--------------|----------|
| 🧪 自动化测试平台 | 编排测试步骤（调用接口、执行SQL、检查状态等） |
| 🧰 运维作业平台 | 类似 Airflow 的 DAG 画布，表示任务执行流程 |
| ⚖️ 规则引擎 | 条件判断 + 动作配置（if-else 路由节点） |
| 🤖 自动化工具流 | 多个操作串联，如“监听 Kafka → 判断数据 → 写库” |
| 📜 业务流程配置 | 可视化定义审批流、调度策略等 |

---

## ✅ 总结

| 需求 | 推荐方案 |
|------|-----------|
| 通用流程图 UI | ✅ React Flow / Vue Flow |
| 节点属性配置 | ✅ 使用表单组件绑定 `node.data` |
| 多平台复用 | ✅ 封装为组件 / npm 包 |
| 后端执行 | ✅ 定义统一 JSON DSL + 解释执行器 |
| 类似参考 | Flowise、Dify、NodeRED、n8n、Airflow UI |

---

需要的话我可以直接帮你设计：
- 节点配置 JSON 格式（DSL）
- 节点类型注册机制
- 属性面板动态渲染方案
- Vue 或 React 的组件封装结构

你现在前端是 Vue 还是 React？目标平台更偏测试还是运维方向？我可以更具体地给你一份复用方案。

## 技术对比

以下是对文章\*\*《前端流程图插件对比选型，这一篇就够了》\*\*的 Markdown 格式总结：

---

## 前端流程图插件对比选型（总结）

**来源：** 稀土掘金 作者：WayneX，通过 CSDN 转载 ([CSDN博客][1], [掘金][2])

### 支持的流程图库（共 6 款）

* **vue‑flow**（Vue 版本的 ReactFlow）
* **butterfly**（阿里巴巴开源图编辑引擎）
* **JointJS**（闭源收费，功能全面）
* **AntV G6**（AntV 图可视化引擎）
* **jsPlumb**（专注拖拽连接线）
* **Flowchart.js**（轻量语法流程图）

---



## LOGIC-FLOW

A flow chart editing framework focus on business customization. 专注于业务自定义的流程图编辑框架，支持实现脑图、ER图、UML、工作流等各种图编辑场景。

https://github.com/didi/LogicFlow



### 各库简介与优缺点

#### vue‑flow

* **优点**：轻松上手（缩放、平移、拖拽、选择等）；高度可定制；性能优异（链路变更仅重渲染必要部分）；提供背景、小地图、控件等组件；组件化设计便于组合。
* **缺点**：更新频次低（截至 2022 年进入首次迭代）；在国内社区较少，资料不多 ([CSDN博客][1])

#### butterfly

* **优点**：基于 DOM、易上手；提供高度定制化功能，如自定义节点、锚点；适配多个技术栈（jQuery、butterfly‑react、butterfly‑vue）。
* **缺点**：对 Vue 的支持不理想，官方更偏向 React，Vue 版本仅支持 Vue2 并且在 Vue3 上使用需额外封装 ([CSDN博客][1])

#### JointJS

* **特点**：适合创建静态或全交互式图表，如流程编排、演示工具等。
* **缺点**：闭源并且收费，通常不作为首选 ([CSDN博客][1])

#### AntV G6

* **优点**：属于 AntV 大平台，社区成熟；支持丰富图表类型（关系图、流程图、树图等）；高性能、功能全面且可定制。
* **缺点**：学习曲线陡峭，文档尚有提升空间 ([CSDN博客][1])

#### jsPlumb

* **优点**：API 简洁易用，文档丰富；连接线功能强大（支持直线、曲线、箭头等），可适用于多种场景。
* **缺点**：文档更新不够及时；在处理大量节点和连接时性能可能成为瓶颈 ([CSDN博客][1])

#### Flowchart.js

* **优点**：使用简单快捷，几行语法即可绘制流程图；易于跨平台集成（如 markdown 编辑器）。
* **缺点**：定制能力有限；语法需学习；社区活跃度相对较低 ([CSDN博客][1])

---

### 总体对比分析

| 维度       | 推荐对象／优势库                                                   |
| -------- | ---------------------------------------------------------- |
| 功能与灵活性   | **Butterfly**、**G6**、**JointJS** 功能最为全面灵活，支持拖拽、缩放、动画等交互特性。 |
| Vue 生态集成 | **vue‑flow** 与 Vue 整合紧密，开发体验佳。                             |
| 轻量实现     | **jsPlumb** 专注连接交互；**Flowchart.js** 适合简单快速流程图绘制。           |
| 生态与社区支持  | **AntV G6** 背靠大厂生态，社区与文档优势明显。                              |
| 学习成本     | **G6** 学习曲线较陡；**Flowchart.js** 简洁适用于快速上手。                  |

---

### 建议选择指南

* **追求高度定制和强大功能** → 选择 **AntV G6** 或 **Butterfly**。
* **使用 Vue 技术栈** → 推荐 **vue‑flow**。
* **重交互连接，结构简单** → 可考虑 **jsPlumb**。
* **快速绘制简单流程图，无需复杂互动** → **Flowchart.js** 是首选。
* **需要商业级复杂流程编辑** → 可考虑 **JointJS**，但需考虑授权和成本因素。

---

以上为文章核心内容 Markdown 提炼，希望对你选型决策有帮助！如果你有具体使用场景（如 Vue 项目或需要支持动画/实时协作），欢迎告诉我，我可以进一步推荐合适的库或写一些简单代码示例。

[1]: https://blog.csdn.net/xgangzai/article/details/133592957?utm_source=chatgpt.com "前端流程图插件对比选型，这一篇就够了-CSDN博客"
[2]: https://juejin.cn/post/7251835247595110457?utm_source=chatgpt.com "前端流程图插件对比选型前端领域有多种流程库可供选择 ..."



# 参考资料


* any list
{:toc}