---
layout: post 
title: Shannon — 由 Keygraph 打造的 AI 渗透测试工具
date: 2026-04-07 21:01:55 +0800
categories: [AI]
tags: [ai, llm, safe]
published: true
---

# Shannon — 由 Keygraph 打造的 AI 渗透测试工具

[![Trendshift](https://trendshift.io/api/badge/repositories/15604)](https://trendshift.io/repositories/15604)

Shannon 是一个面向 Web 应用和 API 的自治型白盒 AI 渗透测试工具。
它分析你的源代码，识别攻击向量，并执行真实漏洞利用，在问题进入生产环境之前加以验证。

---

[![Join Discord](./assets/discord.png)](https://discord.gg/9ZqQPuhJB7)
[![Visit Keygraph.io](./assets/Keygraph_Button.png)](https://keygraph.io/)

---

</div>

---

## Shannon 是什么？

Shannon 是由 Keygraph 开发的 AI 渗透测试工具。它通过将源代码分析与实时漏洞利用相结合，对 Web 应用及其底层 API 执行白盒安全测试。

Shannon 会分析你的 Web 应用源代码以识别潜在攻击向量，然后使用浏览器自动化和命令行工具，对运行中的应用及其 API 执行真实攻击（注入攻击、认证绕过、SSRF、XSS）。最终报告中仅包含具有可运行 PoC（概念验证）的漏洞。

---

## 为什么需要 Shannon

得益于像 Claude Code 和 Cursor 这样的工具，你的团队可以持续不断地交付代码。但你的渗透测试呢？可能一年才做一次。这会造成一个**巨大的安全缺口**。在其余 364 天中，你可能在不知情的情况下将漏洞发布到生产环境。

Shannon 通过提供按需、自动化的渗透测试来弥补这一缺口，可以对每一次构建或发布进行测试。

---

## Shannon 实战

Shannon 在 OWASP 的 Juice Shop 中识别出了 20+ 个漏洞，包括认证绕过和数据库外泄。
[完整报告 →](sample-reports/shannon-report-juice-shop.md)

```md
![Demo](assets/shannon-action.gif)
```

---

## 功能特性

* **完全自治运行**：一条命令即可启动完整渗透测试。Shannon 可自动处理 2FA/TOTP 登录（包括 SSO）、浏览器导航、漏洞利用以及报告生成，无需人工干预。
* **可复现的 PoC 漏洞利用**：最终报告仅包含已验证、可利用的漏洞，并附带可复制执行的 PoC。无法被利用的漏洞不会被报告。
* **OWASP 漏洞覆盖**：识别并验证注入、XSS、SSRF 以及认证/授权问题，更多类别正在开发中。
* **代码感知的动态测试**：通过源代码分析指导攻击策略，并通过浏览器与 CLI 实际攻击验证结果。
* **集成安全工具**：在侦察与发现阶段使用 Nmap、Subfinder、WhatWeb、Schemathesis。
* **并行处理**：漏洞分析与利用阶段在所有攻击类别上并行执行。

---

## 产品线

Shannon 由 Keygraph 开发，提供两个版本：

| 版本               | 许可证      | 适用场景              |
| ---------------- | -------- | ----------------- |
| **Shannon Lite** | AGPL-3.0 | 本地应用测试            |
| **Shannon Pro**  | 商业版      | 需要统一 AppSec 平台的组织 |

> **本仓库包含 Shannon Lite**，即核心自治 AI 渗透测试框架。
> **Shannon Pro** 是 Keygraph 的一体化 AppSec 平台。

> [!IMPORTANT]
> **仅支持白盒测试。** Shannon Lite 需要访问源代码。

---

## Shannon Pro：架构概览

Shannon Pro 是一个一体化应用安全平台，通过两阶段流水线运行：

### 阶段 1：Agent 化静态分析

* **数据流分析（SAST）**：识别输入源与危险 sink，并追踪路径
* **点位问题检测（SAST）**：弱加密、硬编码凭证、不安全配置等
* **业务逻辑安全测试**：发现应用不变量并生成 fuzz 测试
* **SCA 可达性分析**：判断漏洞是否真实可达
* **Secrets 检测**：正则 + LLM 检测并验证有效性

### 阶段 2：自治动态渗透测试

将静态分析结果注入攻击队列，执行真实漏洞利用。

### 静态-动态关联

核心能力：
静态分析发现的漏洞必须通过真实攻击验证，并映射回源码位置。

---

## 📋 目录

（结构保持不变，略）

---

## ⚙️ 安装与使用

### 前置条件

* Docker（容器运行时）
* Node.js 18+（用于 npx）
* pnpm（用于构建）
* AI 提供商凭证（任选其一）

---

### 🚀 快速开始（推荐）

```bash
# 1. 配置凭证
npx @keygraph/shannon setup

# 或环境变量
export ANTHROPIC_API_KEY=your-api-key

# 2. 运行测试
npx @keygraph/shannon start -u https://your-app.com -r /path/to/your-repo
```

---

### Clone & Build

```bash
git clone https://github.com/KeygraphHQ/shannon.git
cd shannon

pnpm install
pnpm build

./shannon start -u https://your-app.com -r /path/to/your-repo
```

---

### 常用命令

```bash
# 查看日志
npx @keygraph/shannon logs <workspace>

# 状态
npx @keygraph/shannon status

# 停止
npx @keygraph/shannon stop
```

---

### Workspace（工作空间）

* 每次运行都会创建 workspace
* 支持断点续跑
* 数据存储在：

  * 本地：`./workspaces/`
  * npx：`~/.shannon/workspaces/`

---

### 输出结构

```text
workspaces/{hostname}_{sessionId}/
├── session.json
├── workflow.log
├── agents/
├── prompts/
└── deliverables/
    └── comprehensive_security_assessment_report.md
```

---

## 示例报告

### OWASP Juice Shop

* 发现 20+ 漏洞
* 包含 SQL 注入、权限提升、SSRF 等

👉 [查看完整报告](sample-reports/shannon-report-juice-shop.md)

---

## Benchmark

Shannon Lite 在 XBOW 基准测试中达到了 **96.15%（100/104 exploits）**

👉 [完整结果](https://github.com/KeygraphHQ/xbow-validation-benchmarks/blob/main/xben-benchmark-results/)

---

## 架构

```
Pre-Recon → Recon → 漏洞分析 → 漏洞利用 → 报告
```

### 核心机制

* 多 Agent 架构
* 白盒 + 黑盒结合
* “无利用，不报告”原则

---

## ⚠️ 使用声明

### 1. 不要在生产环境运行

该工具会主动执行攻击，可能修改数据。

---

### 2. 合法使用

必须获得系统所有者授权。

---

### 3. LLM 限制

* 可能存在幻觉
* 需要人工验证

---

### 4. 覆盖范围

当前支持：

* 认证/授权问题
* 注入
* XSS
* SSRF

---

### 5. 成本与性能

* 时间：约 1~1.5 小时
* 成本：约 $50（取决于模型）

---

## 📄 许可证

Shannon Lite 使用 **AGPL-3.0** 许可证。

---

## 🤝 社区与支持

* [Discord](https://discord.gg/cmctpMBXwE)
* [GitHub Issues](https://github.com/KeygraphHQ/shannon/issues)
* [Discussions](https://github.com/KeygraphHQ/shannon/discussions)

---

## 📬 联系方式

* Email: [shannon@keygraph.io](mailto:shannon@keygraph.io)
* 官网: [https://keygraph.io](https://keygraph.io)


# 参考资料

* any list
{:toc}