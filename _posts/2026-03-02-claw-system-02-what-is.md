---
layout: post
title: claw 技术的本质是什么？以 nanoclaw 为例子，核心技术？
date: 2026-03-02 21:01:55 +0800
categories: [Agent]
tags: [ai, skills, sh]
published: true
---


# claw 技术的本质是什么？以 nanoclaw 为例子，核心技术？

这个问题问到了 **Claw 系列真正的技术核心**。
很多人误以为 Claw 是：

> 一个 Agent 框架 / 一个 AI 项目 / 一个自动化工具

实际上 **完全不是**。

---

# 一句话本质

> **Claw 技术的本质 = 把 LLM 从「聊天模型」降维为「可调度执行单元（Executable Cognitive Loop）」**

也就是：

```
LLM ≠ Chat
LLM = Runtime Decision Engine
```

Claw 做的事情，是把 **推理能力工程化**。

---

# 一、传统 AI Agent 的根本问题

在 Claw 出现前，大多数 Agent 架构：

```
User
 ↓
Prompt
 ↓
LLM
 ↓
Tool Call
 ↓
Return
```

问题非常严重：

| 问题           | 本质            |
| ------------ | ------------- |
| 每一步重新 Prompt | 无状态           |
| Token 巨大     | 成本爆炸          |
| 推理不可控        | 不稳定           |
| 无长期执行能力      | 不能 autonomous |
| 启动慢          | 无法常驻          |

本质一句话：

> **LLM 只是被当成 API 调用**

而不是系统组件。

---

# 二、Claw 的核心思想（革命点）

Claw 引入了一个关键抽象：

## ✅ Cognitive Loop（认知循环）

以 **NanoClaw** 为例：

```
┌─────────────┐
│   Memory    │
└──────┬──────┘
       ↓
┌─────────────┐
│   Planner   │  ← LLM
└──────┬──────┘
       ↓
┌─────────────┐
│   Executor  │
└──────┬──────┘
       ↓
┌─────────────┐
│ Environment │
└─────────────┘
```

循环运行：

```
observe → think → act → update
```

这一步极其关键。

---

# 三、NanoClaw 的核心技术拆解

NanoClaw 不是缩小版 OpenClaw。

它第一次把 Agent 拆成 **最小可运行认知系统**。

---

## 1️⃣ Agent Loop Runtime（核心中的核心）

NanoClaw 内部实际上只有一个东西：

```python
while True:
    state = observe()
    decision = llm.plan(state)
    result = execute(decision)
    memory.update(result)
```

听起来简单。

但这里发生了三件革命性事情：

---

### ✅ LLM 从 Request → Scheduler

传统：

```
调用 LLM
等待结果
结束
```

NanoClaw：

```
LLM 决定下一步系统行为
```

LLM 成为：

> **行为调度器**

---

### ✅ 持久执行上下文（Persistent Context）

NanoClaw 不再：

```
每次重新 prompt
```

而是：

```
Agent State Machine
```

保存：

* 当前任务状态
* 执行历史
* 工具结果
* 世界模型

这类似：

```
CPU Register + Process State
```

---

### ✅ Tool = System Call

这是 Claw 最大的工程思想。

NanoClaw 中：

```
tool.call()
```

等价于：

```
syscall()
```

例如：

| Tool  | OS 类比           |
| ----- | --------------- |
| 浏览器   | network syscall |
| 文件写入  | fs syscall      |
| shell | process syscall |
| API   | IPC             |

所以：

> **Agent ≈ 用户态程序**
>
> **Tool ≈ 内核能力**

---

## 2️⃣ Memory Virtualization（极关键）

NanoClaw 不把全部历史丢给 LLM。

而是：

```
Working Memory
+
Long-term Memory
+
Retrieval
```

类似：

```
CPU Cache
RAM
Disk
```

LLM 永远只看到：

```
最小必要上下文
```

结果：

✅ Token 降低
✅ 推理稳定
✅ 可长期运行

---

## 3️⃣ Event-driven Agent（隐藏核心）

NanoClaw 实际是：

```
Event Loop
```

而不是聊天循环。

```
file_changed
timer_tick
message_arrived
sensor_update
```

触发：

```
Agent Think
```

这一步让 Agent 可以：

✅ Always-on
✅ Reactive
✅ Autonomous

---

## 4️⃣ Deterministic Shell（工程关键）

NanoClaw 强制：

```
LLM 只输出结构化 Action
```

例如：

```json
{
  "action": "write_file",
  "path": "/a.py"
}
```

而不是自然语言。

这解决：

* hallucination 执行
* prompt injection
* 不可预测行为

---

# 四、真正的本质类比（最准确）

NanoClaw 做的事情相当于：

| 历史技术         | 对应       |
| ------------ | -------- |
| Linux Kernel | 进程调度     |
| Docker       | 容器运行     |
| NanoClaw     | Agent 运行 |
| LLM          | CPU      |

所以：

> **Claw = Agent Operating System Primitive**

---

# 五、为什么 Claw 会突然爆发？

因为一个临界点出现了：

```
LLM 推理成本 ↓
模型延迟 ↓
本地模型 ↑
```

导致：

以前：

```
Agent = 云服务
```

现在：

```
Agent = 常驻进程
```

Claw 正好填补：

> **AI Runtime 缺失层**

---

# 六、最深层一句话总结

NanoClaw 的核心技术不是 AI。

而是：

> **把“思考”变成一种可调度、可持久、可执行的系统循环。**

---

如果你愿意，我可以下一步给你拆一个更底层的东西：

👉 **为什么 Claw 本质上正在走向 “AI Kernel”**
（以及为什么 NullClaw 看起来像 Linux 0.01）。

# 参考资料

* any list
{:toc}