---
layout: post
title: javaer 转型 ai 学习之路-07-AI Agent 的核心原理（为什么 LLM 能调用工具）
date: 2026-03-13 21:01:55 +0800
categories: [AI]
tags: [ai, sh]
published: true
---


理解 **AI Agent** 的关键，是先打破一个误解：

> LLM 本身 **不会真正“调用工具”**。

LLM 只是 **生成文本**。
所谓 Agent 的“工具调用”，其实是 **系统把文本解析成工具调用指令，然后执行工具，再把结果返回给 LLM**。

所以 Agent 本质是：

```text
LLM
+ Tools
+ Memory
+ Workflow
```

下面我们从原理到工程实现一步一步拆解。

---

# 一、Agent 的本质结构

一个最小的 Agent 系统包含 4 个组件：

```text
用户
↓
LLM（思考）
↓
Tool（执行）
↓
Observation（结果）
↓
LLM（继续思考）
```

循环直到任务完成。

这个模式最早来自 **ReAct** 思想。

* ReAct: Synergizing Reasoning and Acting in Language Models

核心思想：

```text
Reasoning + Acting
```

---

# 二、Agent 为什么能调用工具

LLM 实际做的是 **生成一个“调用工具的描述”**。

例如用户问：

```text
北京现在天气怎么样？
```

系统提供一个工具：

```text
get_weather(city)
```

LLM 生成的内容可能是：

```json
{
  "tool": "get_weather",
  "arguments": {
    "city": "北京"
  }
}
```

系统解析 JSON：

```text
调用工具
```

返回：

```json
{
  "temperature": "22C",
  "weather": "sunny"
}
```

再给 LLM：

```text
Observation: 北京天气22C 晴天
```

LLM 再生成：

```text
北京现在天气晴朗，气温22度。
```

所以：

```text
LLM 只是在生成工具调用的文本
```

系统在背后执行。

---

# 三、Agent 的循环（核心）

Agent 实际执行流程是一个 **循环**：

```text
用户问题
↓
LLM 思考
↓
是否调用工具？
↓
调用工具
↓
得到结果
↓
继续思考
↓
输出最终答案
```

很多框架叫：

```text
Agent Loop
```

---

# 四、Agent Prompt（关键）

Agent 能调用工具，核心是 **Prompt 设计**。

典型 Agent prompt：

```text
You are an AI assistant.

You have access to the following tools:

1. search
2. calculator
3. weather_api

When you need information, call a tool.

Use this format:

Thought: ...
Action: tool_name
Action Input: ...
Observation: ...
```

LLM 就会学会输出：

```text
Thought: 我需要天气信息
Action: weather_api
Action Input: 北京
```

这就是 Agent 的核心机制。

---

# 五、Function Calling（现代方式）

现在主流 LLM 都支持：

```text
Function Calling
```

例如：

* ChatGPT
* Claude
* Qwen

可以直接定义工具：

```json
{
  "name": "get_weather",
  "description": "Get weather info",
  "parameters": {
    "type": "object",
    "properties": {
      "city": {
        "type": "string"
      }
    }
  }
}
```

LLM 会自动返回：

```json
tool_call
```

系统执行即可。

---

# 六、Agent 的三大能力

Agent 能工作的核心是三种能力：

### 1 Reasoning（推理）

LLM 规划步骤：

```text
先查资料
再计算
最后总结
```

---

### 2 Tool Use（工具）

工具可以是：

```text
API
数据库
搜索引擎
代码执行
```

例如：

```text
Google search
SQL query
Python interpreter
```

---

### 3 Memory（记忆）

Agent 需要记住：

```text
历史对话
工具结果
任务状态
```

例如：

```text
Short-term memory
Long-term memory
```

---

# 七、Agent 架构

一个完整 Agent 系统通常包含：

```text
User
↓
Agent Controller
↓
LLM
↓
Tool Router
↓
Tools
↓
Memory
```

组件：

1 Agent Controller
2 Tool Registry
3 Memory Store
4 LLM

---

# 八、Agent 的工具类型

常见工具：

### 搜索

```text
web search
vector search
```

---

### 数据工具

```text
SQL
API
知识库
```

---

### 执行工具

```text
Python
Shell
Workflow
```

---

# 九、Agent 与 RAG 的关系

很多人分不清：

RAG vs Agent。

区别：

| RAG  | Agent |
| ---- | ----- |
| 检索知识 | 执行任务  |
| 一次调用 | 多轮调用  |
| 简单架构 | 复杂系统  |

例如：

用户问：

```text
公司年收入是多少？
```

RAG：

```text
检索财报
```

---

用户问：

```text
帮我分析公司财报
```

Agent：

```text
查财报
计算数据
生成报告
```

---

# 十、Multi-Agent

复杂任务会使用：

```text
多个 Agent
```

例如：

```text
Research Agent
Coding Agent
Review Agent
```

代表框架：

* CrewAI
* AutoGPT
* LangGraph

---

# 十一、Agent 的最大问题

Agent 目前最大问题是：

```text
不稳定
```

原因：

### 1 LLM 推理不确定

可能：

```text
乱调用工具
```

---

### 2 规划能力有限

复杂任务容易：

```text
迷失
```

---

### 3 成本高

多轮推理：

```text
token 消耗大
```

---

# 十二、企业 Agent 的真实模式

大部分企业其实不用：

```text
Auto Agent
```

而是：

```text
Workflow Agent
```

结构：

```text
LLM
+
固定流程
```

例如：

```text
Step1 检索知识
Step2 生成答案
Step3 校验
```

稳定很多。

---

# 十三、Agent 的本质（最重要结论）

Agent 并不是：

```text
LLM 自动完成所有事情
```

而是：

```text
LLM
+
Tool
+
Workflow
+
Memory
```

也就是说：

```text
Agent = AI 操作系统
```

---

# 下一步学习建议

如果你已经理解：

* LLM
* Embedding
* RAG
* Agent

下一步最关键的是：

**AI 系统架构（AI Platform）**

因为真正企业落地需要：

```text
Prompt管理
Agent管理
模型路由
RAG服务
工具管理
```

这才是 **AI 架构师真正要设计的系统**。


# 参考资料

* any list
{:toc}