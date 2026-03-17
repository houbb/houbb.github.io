---
layout: post
title: Deep Agents 是一个简单的 agent harness（运行框架），实现了这些能力，同时它是开源的，并且可以方便地扩展自定义工具和指令
date: 2026-03-17 21:01:55 +0800
categories: [AI]
tags: [ai, sh]
published: true
---


# 🚀🧠 Deep Agents

Agent 正在越来越多地处理**长周期任务（long-horizon tasks）**，其任务长度大约每 7 个月翻倍！但长周期任务通常涉及几十次工具调用，这会带来成本和可靠性挑战。

像 Claude Code、Manus 这样的主流 agent 使用了一些共同原则来解决这些问题，包括：

* 任务执行前的规划（planning）
* 计算机访问能力（shell + 文件系统）
* 子 agent 委派（sub-agent delegation）

`deepagents` 是一个简单的 agent harness（运行框架），实现了这些能力，同时它是开源的，并且可以方便地扩展自定义工具和指令。 ([GitHub][1])

---

## 📚 资源

* 文档（Documentation）：完整概览和 API 参考
* 快速入门仓库（Quickstarts Repo）：示例和用例
* CLI：带有 skills、memory、HITL（human-in-the-loop）工作流的交互式命令行界面

---

## 🚀 快速开始

你可以为 `deepagents` 提供自定义工具。下面示例中，我们额外提供一个 `tavily` 搜索工具（会加入内置工具集合）：

```python
pip install deepagents tavily-python
```

设置环境变量 `TAVILY_API_KEY`：

```python
import os
from deepagents import create_deep_agent
from tavily import TavilyClient

tavily_client = TavilyClient(api_key=os.environ["TAVILY_API_KEY"])

def internet_search(query: str, max_results: int = 5):
    """执行网络搜索"""
    return tavily_client.search(query, max_results=max_results)

agent = create_deep_agent(
    tools=[internet_search],
    system_prompt="Conduct research and write a polished report.",
)

result = agent.invoke({
    "messages": [{"role": "user", "content": "What is LangGraph?"}]
})
```

通过 `create_deep_agent` 创建的 agent，本质上是一个 **LangGraph 的 StateGraph**，因此可以支持：

* streaming（流式输出）
* human-in-the-loop
* memory（记忆）
* Studio 调试

---

## 自定义 Deep Agents

`create_deep_agent` 支持多个参数配置：

---

### `model`

默认模型为：

```
"claude-sonnet-4-5-20250929"
```

你可以替换为任意 LangChain 模型：

```python
from langchain.chat_models import init_chat_model
from deepagents import create_deep_agent

model = init_chat_model("openai:gpt-4o")

agent = create_deep_agent(
    model=model,
)
```

---

### `system_prompt`

可以传入自定义系统提示词（会附加在默认 middleware 指令之后）。

建议：

* ✅ 定义领域工作流（如研究步骤、分析流程）
* ✅ 提供具体示例
* ✅ 增加专业指导（如任务 batching）
* ✅ 定义停止条件和资源限制
* ✅ 解释工具之间的协作方式

不建议：

* ❌ 重复解释工具功能（middleware 已包含）
* ❌ 重复默认提示
* ❌ 与默认指令冲突

---

### `tools`

添加自定义工具：

```python
def internet_search(query: str) -> str:
    return tavily_client.search(query)

agent = create_deep_agent(tools=[internet_search])
```

也可以接入 MCP 工具（通过 langchain-mcp-adapters）：

```python
from langchain_mcp_adapters.client import MultiServerMCPClient

mcp_client = MultiServerMCPClient(...)
mcp_tools = await mcp_client.get_tools()

agent = create_deep_agent(tools=mcp_tools)
```

---

### `middleware`

通过 middleware 扩展 agent 生命周期：

```python
from langchain_core.tools import tool
from langchain.agents.middleware import AgentMiddleware

@tool
def get_weather(city: str) -> str:
    return f"The weather in {city} is sunny."

class WeatherMiddleware(AgentMiddleware):
    tools = [get_weather]

agent = create_deep_agent(middleware=[WeatherMiddleware()])
```

---

### `subagents`

主 agent 可通过 `task` 工具委派子 agent：

```python
research_subagent = {
    "name": "research-agent",
    "description": "用于深入研究问题",
    "system_prompt": "You are an expert researcher",
    "tools": [internet_search],
}

agent = create_deep_agent(subagents=[research_subagent])
```

支持传入完整 LangGraph：

```python
from deepagents import CompiledSubAgent

agent = create_deep_agent(
    subagents=[CompiledSubAgent(...)]
)
```

---

### `interrupt_on`（人类参与）

支持 Human-in-the-loop：

```python
agent = create_deep_agent(
    tools=[get_weather],
    interrupt_on={
        "get_weather": {
            "allowed_decisions": ["approve", "edit", "reject"]
        }
    }
)
```

---

### `backend`（文件系统）

支持多种文件系统后端：

```python
from deepagents.backends import FilesystemBackend

agent = create_deep_agent(
    backend=FilesystemBackend(root_dir="/path/to/project"),
)
```

支持：

* StateBackend（默认，内存态）
* FilesystemBackend（本地磁盘）
* StoreBackend（持久化）
* CompositeBackend（混合路由）

---

### 长期记忆（Long-term Memory）

通过 `CompositeBackend` 实现跨会话记忆：

```python
from deepagents.backends import CompositeBackend, StateBackend, StoreBackend

agent = create_deep_agent(
    backend=CompositeBackend(
        default=StateBackend(),
        routes={"/memories/": StoreBackend(...)}
    ),
)
```

用途：

* 用户偏好持久化
* 知识库构建
* 跨对话研究进度保存

---

## 内置工具（Built-in Tools）

每个 agent 默认包含以下工具：

| 工具          | 描述                    |
| ----------- | --------------------- |
| write_todos | 创建/管理任务列表             |
| read_todos  | 读取任务                  |
| ls          | 列出目录                  |
| read_file   | 读取文件                  |
| write_file  | 写入文件                  |
| edit_file   | 修改文件                  |
| glob        | 文件匹配                  |
| grep        | 内容搜索                  |
| execute     | 执行 shell（需支持 sandbox） |
| task        | 子 agent 调度            |

---

## 内置 Middleware

| Middleware               | 作用                 |
| ------------------------ | ------------------ |
| TodoListMiddleware       | 任务规划               |
| FilesystemMiddleware     | 文件操作               |
| SubAgentMiddleware       | 子 agent            |
| SummarizationMiddleware  | 自动摘要（>170k tokens） |
| PromptCachingMiddleware  | Prompt 缓存          |
| PatchToolCallsMiddleware | 修复工具调用             |
| HumanInTheLoopMiddleware | 人工审批               |

---

## 内置 Prompt

系统会自动注入：

### TodoListMiddleware

* 何时使用 todo
* 如何标记完成
* 使用最佳实践

### FilesystemMiddleware

* 文件工具说明
* 路径规则（必须 `/` 开头）
* 大上下文处理策略

### SubAgentMiddleware

* task 工具说明
* 子 agent 使用场景
* 生命周期（spawn → run → return → reconcile）

---

## 核心能力总结（从 README 抽象）

* 规划能力（Todo-based planning）
* 上下文管理（Filesystem offloading）
* 子 agent 分治（Sub-agent isolation）
* 长期记忆（Memory backend）
* 人机协同（HITL）
* middleware 扩展架构

这些能力共同构成一个“**深度 agent（Deep Agent）范式**”。 ([GitHub][2])

---

## License

MIT

---

# 一句话总结（技术抽象）

`deepagents` 本质上是一个：

> **“基于 LangGraph 的 agent runtime + 工具编排 + 多 agent 分治框架”**


# 参考资料

* any list
{:toc}