---
layout: post 
title: Shannon — Keygraph 出品的 AI 渗透测试工具
date: 2026-04-23 21:01:55 +0800
categories: [Ai]
tags: [safe, ai]
published: true
---

# Shannon — Keygraph 出品的 AI 渗透测试工具

Shannon 是一款面向 Web 应用和 API 的自主化白盒 AI 渗透测试工具。

它会分析你的源代码，识别攻击路径，并执行真实攻击以在漏洞进入生产环境之前验证它们。

## 什么是 Shannon？

Shannon 是由 Keygraph 开发的 AI 渗透测试工具。它通过结合源代码分析与实时攻击执行，对 Web 应用及其底层 API 进行白盒安全测试。

Shannon 会分析你的 Web 应用源代码以识别潜在攻击路径，然后使用浏览器自动化和命令行工具，对运行中的应用及其 API 执行真实攻击（如注入攻击、认证绕过、SSRF、XSS）。最终报告中只包含那些**具有可验证利用路径的漏洞**。

**Shannon 存在的原因**

得益于 Claude Code 和 Cursor 等工具，你的团队可以持续不断地交付代码。但渗透测试？通常一年才做一次。这造成了一个巨大的安全空窗期。在剩下的 364 天里，你可能在不知情的情况下将漏洞发布到生产环境。

Shannon 通过提供按需执行的自动化渗透测试来填补这一空白，可在每次构建或发布时运行。

---

## Shannon 实战演示

Shannon 在 OWASP Juice Shop 中识别出 20+ 个漏洞，包括认证绕过和数据库数据泄露。
[完整报告 →](sample-reports/shannon-report-juice-shop.md)

![Demo](assets/shannon-action.gif)

---

## 功能特性

* **完全自主运行**：一条命令启动完整渗透测试流程。Shannon 自动处理 2FA/TOTP 登录（包括 SSO）、浏览器导航、漏洞利用和报告生成，无需人工干预。
* **可复现的 PoC 攻击**：最终报告仅包含已验证、可利用的漏洞，并附带可直接复制执行的 PoC。无法利用的漏洞不会被报告。
* **OWASP 漏洞覆盖**：支持检测并验证注入、XSS、SSRF、认证/授权漏洞，更多类别正在开发中。
* **代码感知的动态测试**：先分析源代码制定攻击策略，再通过浏览器和 CLI 实际攻击验证结果。
* **内置安全工具集成**：在侦察阶段使用 Nmap、Subfinder、WhatWeb、Schemathesis。
* **并行处理**：漏洞分析与利用阶段可并行执行多个攻击类别。

---

## 产品线

Shannon 由 Keygraph 开发，提供两个版本：

| 版本               | 许可       | 适用场景                                                   |
| ---------------- | -------- | ------------------------------------------------------ |
| **Shannon Lite** | AGPL-3.0 | 本地测试自己的应用                                              |
| **Shannon Pro**  | 商业版      | 需要统一 AppSec 平台（SAST、SCA、密钥检测、业务逻辑测试、自动渗透）并集成 CI/CD 的组织 |

> **本仓库包含 Shannon Lite**，即核心自动化 AI 渗透测试框架。
> **Shannon Pro** 是 Keygraph 的一体化 AppSec 平台，集成 SAST、SCA、密钥扫描、业务逻辑测试和自动渗透测试，并在统一流程中进行关联分析。所有漏洞均附带可运行的 PoC。

> [!IMPORTANT]
> **仅支持白盒测试。** Shannon Lite 设计用于**源代码可访问**的应用安全测试。
> 它需要访问应用源码及仓库结构。

---

## Shannon Pro：架构概览

Shannon Pro 是一个一体化应用安全平台，无需拼接多个 SAST、SCA、密钥扫描和渗透测试工具。它采用两阶段流程：**Agent 驱动的静态分析 + 自动化 AI 渗透测试**。两阶段结果会进行交叉关联，确保每个漏洞都有 PoC 且能定位到具体代码。

### 第一阶段：Agent 静态分析

Shannon Pro 将代码转化为代码属性图（CPG），融合：

* AST（抽象语法树）
* 控制流图
* 程序依赖图

并执行五类分析：

* **数据流分析（SAST）**：识别输入源与危险操作（sink），追踪路径，并由 LLM 判断当前上下文中的过滤是否安全。
* **点问题检测（SAST）**：检测单点漏洞（弱加密、硬编码凭证、不安全配置、缺失安全头、弱随机数、关闭证书验证、宽松 CORS）。
* **业务逻辑安全测试（SAST）**：自动推导业务规则（如“只能访问自己数据”），生成攻击并构造 PoC。
* **SCA（含可达性分析）**：判断漏洞代码是否实际可达，而不是仅标记 CVE。
* **密钥检测**：结合正则和 LLM 检测，并通过只读 API 验证有效性。

---

### 第二阶段：自动化动态渗透测试

与 Shannon Lite 相同的多 Agent 流程（侦察、分析、利用、报告），但会将静态分析结果注入攻击队列。

---

### 静态-动态关联

这是核心差异点：

静态分析发现的漏洞（如 SQL 注入路径）不会直接报告，而是：

→ 交给攻击 Agent 实际利用
→ 成功后回溯到代码位置

---

### 部署模型

支持自托管 Runner（类似 GitHub Actions）：

* 数据平面：运行在客户环境内（含代码和 LLM 调用）
* 控制平面：Keygraph 仅负责调度和报告 UI

---

## 功能对比

| 能力    | Shannon Lite | Shannon Pro         |
| ----- | ------------ | ------------------- |
| 许可    | AGPL-3.0     | 商业                  |
| 静态分析  | Prompt 代码分析  | 完整 SAST/SCA/密钥/业务逻辑 |
| 动态测试  | 自动渗透         | 自动渗透 + 关联分析         |
| 引擎    | Prompt       | CPG + LLM           |
| 业务逻辑  | 无            | 自动推导与攻击             |
| CI/CD | 手动           | 原生支持                |
| 部署    | CLI          | 云或自托管               |

---

## 安装与使用

### 前置条件

* Docker
* Node.js 18+
* pnpm（构建模式）
* AI 凭证（Anthropic / Bedrock / Vertex）

---

### 快速开始

```bash
npx @keygraph/shannon setup
export ANTHROPIC_API_KEY=your-api-key
npx @keygraph/shannon start -u https://your-app.com -r /path/to/repo
```

---

### Clone & Build

```bash
git clone https://github.com/KeygraphHQ/shannon.git
cd shannon

export ANTHROPIC_API_KEY="your-api-key"

pnpm install
pnpm build

./shannon start -u https://your-app.com -r /path/to/repo
```

---

### 常用命令

```bash
npx @keygraph/shannon logs <workspace>
npx @keygraph/shannon status
npx @keygraph/shannon stop
```

---

### 输出结果

目录结构：

```
workspaces/{hostname}_{sessionId}/
├── session.json
├── workflow.log
├── agents/
├── prompts/
└── deliverables/
    └── comprehensive_security_assessment_report.md
```

---

## 架构

五阶段流程：

```
预侦察 → 侦察 → 漏洞分析 → 漏洞利用 → 报告
```

---

## 免责声明

### ⚠️ 使用说明

* ❗ 会执行真实攻击（可能修改数据）
* ❗ 不要在生产环境运行
* ❗ 必须获得授权
* ❗ 需要人工验证结果

---

### 成本

* 时间：约 1~1.5 小时
* 成本：约 $50

---

## License

AGPL-3.0

---

## 社区

* Discord
* GitHub Issues
* Discussions

---

## 联系方式

* 邮箱：[shannon@keygraph.io](mailto:shannon@keygraph.io)


# 参考资料

* any list
{:toc}