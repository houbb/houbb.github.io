---
layout: post
title: claw 系列汇总
date: 2026-03-02 21:01:55 +0800
categories: [Agent]
tags: [ai, skills, sh]
published: true
---

下面这张表，我帮你 **系统性梳理当前 Claw 系列轻量 Agent 基础设施谱系**（也是现在 self-host AI Agent 圈最容易混乱的一组项目）。

> ✅ 结论先说：
> **它们本质不是同一代产品，而是「AI Agent 基础设施不断极限瘦身」的演进链。**

---

# Claw 系列对比总览

| 项目                     | 定位                  | 核心语言              | 资源占用     | 启动速度  | 目标硬件          | 架构复杂度 | 典型使用场景                    |
| ---------------------- | ------------------- | ----------------- | -------- | ----- | ------------- | ----- | ------------------------- |
| **OpenClaw**           | 完整型 AI Assistant 平台 | TypeScript / Node | >1GB RAM | >500s | PC / Mac Mini | ⭐⭐⭐⭐⭐ | 本地个人 AI 助手 / 自动化          |
| **NanoBot**            | OpenClaw 轻量化版本      | Python            | >100MB   | >30s  | SBC / 云主机     | ⭐⭐⭐⭐  | MCP Agent / 实验平台          |
| **PicoClaw**           | 边缘设备 AI Agent       | Go                | <10MB    | <1s   | $10 开发板       | ⭐⭐⭐   | IoT / Edge Agent          |
| **ZeroClaw**           | 高性能 Agent Infra     | Rust              | <5MB     | <10ms | 任意低配设备        | ⭐⭐    | 生产级 Agent Runtime         |
| **NullClaw**           | 极限最小 Agent Runtime  | Zig               | ~1MB     | <8ms  | <$5 MCU级设备    | ⭐     | Embedded Autonomous Agent |
| **TinyBot / TinyClaw** | 研究/教学极简实现           | Python            | 极低       | 秒级    | 任意            | ⭐     | Agent 原理研究                |

---

# 一、架构演进关系（非常关键）

实际上它们是 **同一思想的连续瘦身过程**：

```
OpenClaw
   ↓ 去 UI / 去重量运行时
NanoBot
   ↓ 编译型语言
PicoClaw
   ↓ 系统级性能优化
ZeroClaw
   ↓ 去 runtime
NullClaw
```

核心趋势只有一句话：

> **AI Agent 正在从“应用”退化为“操作系统级组件”。**

---

# 二、核心技术差异（真正本质）

## 1️⃣ OpenClaw —— Agent Application

特点：

* Node.js runtime
* Plugin / UI / Memory / Tool 全家桶
* 类似：

```
ChatGPT Desktop（可执行）
```

问题：

* 内存巨大（>1GB）
* 冷启动极慢
* 不适合 Edge

官方 benchmark 中也显示其资源需求远高于后续项目 ([nullclaw.org][1])

👉 **定位：Agent 产品层**

---

## 2️⃣ NanoBot —— Agent Framework

核心思想：

* 保留 Agent Loop
* 删除 UI
* Python 实现

典型结构：

```
LLM
 ↓
Tool Loop
 ↓
Execution
```

开始变成：

> **Agent SDK**

但仍受 Python runtime 限制。

---

## 3️⃣ PicoClaw —— Edge Agent（第一次质变）

关键突破：

* Go 单二进制
* <10MB RAM
* <$10 硬件运行
* <1s 启动 ([picoclaw.pro][2])

它第一次让：

```
Raspberry Pi Zero
RISC-V board
IoT设备
```

可以跑 Autonomous Agent。

👉 **Agent 开始进入物理世界**

---

## 4️⃣ ZeroClaw —— Agent Infrastructure

这是很多人低估的一个。

核心变化：

✅ Rust
✅ Trait-based architecture
✅ 无 runtime overhead
✅ <5MB RAM
✅ <10ms cold start ([ZeroClaw][3])

它已经不是 assistant，而是：

```
Agent Runtime Kernel
```

类似：

```
Docker → container runtime
ZeroClaw → agent runtime
```

👉 **生产级 Agent 基础设施**

---

## 5️⃣ NullClaw —— 极限形态（最重要）

理念非常激进：

* Zig
* 静态编译
* 无 GC
* 无 runtime
* ~1MB 内存
* 678KB binary
* <8ms 启动 ([nullclaw.org][1])

目标：

```
$5 board
always-on autonomous agent
```

这已经接近：

> **AI Agent Firmware**

---

## 6️⃣ TinyBot / TinyClaw

作用其实不是生产：

* 可审计
* 极少代码
* 教学 / Research fork

社区普遍把它当：

```
Agent 最小参考实现
```

---

# 三、一个工程师视角的真实分层

如果用你熟悉的系统架构类比：

| 层级       | 类比           |
| -------- | ------------ |
| OpenClaw | Kubernetes   |
| NanoBot  | Docker       |
| PicoClaw | containerd   |
| ZeroClaw | runc         |
| NullClaw | Linux Kernel |
| TinyBot  | xv6          |

---

# 四、真正的选择建议（非常实用）

### ✅ 想体验 Agent

→ OpenClaw

### ✅ 想做 Agent 平台

→ NanoBot / PicoClaw

### ✅ 想做生产 Agent Infra

→ ZeroClaw

### ✅ 想跑在 IoT / 机器人 / Always-On

→ NullClaw

### ✅ 想研究 Agent 原理

→ TinyBot

---

如果你愿意，我可以下一步帮你画一张：

✅ **2026 AI Agent Runtime 技术演化图（非常震撼）**
——你会看到为什么 Claw 系列突然爆炸式出现。

# 参考资料

[1]: https://nullclaw.org/?utm_source=chatgpt.com "NullClaw: The Smallest Fully Autonomous AI Assistant"
[2]: https://picoclaw.pro/?utm_source=chatgpt.com "PicoClaw — Ultra-Efficient AI Assistant in Go | $10 Hardware · 10MB RAM · 1s Boot"
[3]: https://www.zeroclaw.dev/?utm_source=chatgpt.com "ZeroClaw — Fast, small, autonomous AI assistant infrastructure | Deploy anywhere, swap anything"

* any list
{:toc}