---
layout: post
title: zeroclaw 入门介绍
date: 2026-03-02 21:01:55 +0800
categories: [Agent]
tags: [ai, skills, sh]
published: true
---

以下为你提供内容的 **严格中文翻译**（保持原 Markdown / HTML 结构、技术含义与信息完整，不扩写、不删减、不改写）。

<h1 align="center">ZeroClaw 🦀</h1>

<p align="center">
  <strong>零额外开销。零妥协。100% Rust。100% 无绑定。</strong><br>
  ⚡️ <strong>可运行于任意仅拥有 <5MB RAM 的硬件：相比 OpenClaw 内存降低 99%，成本比 Mac mini 低 98%！</strong>
</p>
```

---

<p align="center">

由 Harvard、MIT 与 Sundai.Club 社区的学生与成员共同构建。

</p>

---

<p align="center">
🌐 <strong>语言：</strong>
English · 简体中文 · 日本語 · Русский · Français · Tiếng Việt · Ελληνικά
</p>

---

<p align="center">
<a href="#quick-start">快速开始</a> |
<a href="docs/one-click-bootstrap.md">一键安装</a> |
<a href="docs/README.md">文档中心</a> |
<a href="docs/SUMMARY.md">文档目录</a>
</p>

---

<p align="center">
<strong>快速入口：</strong>
Reference · Operations · Troubleshoot · Security · Hardware · Contribute
</p>

---

<p align="center">
<strong>快速、小巧、完全自治的框架</strong><br />
可部署于任意环境。所有组件均可替换。
</p>

---

<p align="center">

ZeroClaw 是用于 **Agent 化工作流（agentic workflows）** 的 **运行时框架（runtime framework）** ——
它提供基础设施，对模型、工具、记忆与执行进行抽象，使 Agent 能够 **一次构建，处处运行**。

</p>

<p align="center">
<code>基于 Trait 的架构 · 默认安全运行时 · Provider / Channel / Tool 可替换 · 全组件插件化</code>
</p>

---

## 📢 公告（Announcements）

用于发布重要通知（破坏性变更、安全公告、维护窗口及版本阻塞信息）。

| 日期（UTC）    | 级别 | 通知                                                                                                                  | 操作                                      |
| ---------- | -- | ------------------------------------------------------------------------------------------------------------------- | --------------------------------------- |
| 2026-02-19 | 严重 | 我们 **与** `openagen/zeroclaw`、`zeroclaw.org`、`zeroclaw.net` **不存在任何关联**。这些域名当前指向 `openagen/zeroclaw` fork，并正在冒充官方项目。 | 请勿信任这些来源的信息、二进制文件、募资或公告。仅使用官方仓库与认证社交账号。 |
| 2026-02-21 | 重要 | 官方网站已上线：[zeroclawlabs.ai](https://zeroclawlabs.ai)。目前仍存在冒充行为，请勿参与任何未经官方渠道发布的投资或募资活动。                                | 请以官方 GitHub 仓库作为唯一可信来源，并关注官方社交账号获取更新。   |
| 2026-02-19 | 重要 | Anthropic 更新了认证与凭证使用条款。Claude Code OAuth Token（Free / Pro / Max）仅允许用于 Claude Code 与 Claude.ai，在其他产品或工具中使用可能违反服务条款。  | 请暂时避免 Claude Code OAuth 集成，以防账号风险。      |

---

## ✨ 功能特性（Features）

* 🏎️ **默认精简运行时**
  常见 CLI 与状态工作流在发布版本中仅占用数 MB 内存。

* 💰 **低成本部署**
  面向低成本开发板与小型云实例设计，无重量级运行时依赖。

* ⚡ **极速冷启动**
  单二进制 Rust Runtime，使命令与守护进程几乎瞬时启动。

* 🌍 **可移植架构**
  单一二进制可运行于 ARM、x86 与 RISC-V，Provider / Channel / Tool 均可替换。

* 🔍 **研究阶段能力**
  在生成回复前主动通过工具收集信息并进行验证，从而降低幻觉问题。

---

## 为什么团队选择 ZeroClaw

* **默认轻量**：Rust 单二进制、启动快、内存占用低
* **安全设计**：设备配对、严格沙箱、显式白名单、Workspace 隔离
* **完全可替换**：核心系统全部基于 Trait（Provider / Channel / Tool / Memory / Tunnel）
* **无厂商锁定**：支持 OpenAI 兼容 Provider 与可插拔自定义 Endpoint

---

## 🚀 快速开始（Quick Start）

### 方式 1：Homebrew（macOS / Linuxbrew）

```bash
brew install zeroclaw
```

---

### 方式 2：Clone + Bootstrap

```bash
git clone https://github.com/zeroclaw-labs/zeroclaw.git
cd zeroclaw
./bootstrap.sh
```

> 注意：源码构建需要约 **2GB 内存** 与 **6GB 磁盘空间**。
> 对资源受限设备，可使用：

```bash
./bootstrap.sh --prefer-prebuilt
```

下载预编译二进制。

---

### 方式 3：Cargo 安装

```bash
cargo install zeroclaw
```

---

## 首次运行

```bash
# 启动网关（提供 Web Dashboard API/UI）
zeroclaw gateway

# 打开启动日志中显示的 Dashboard 地址
# 默认：http://127.0.0.1:3000/

# 或直接聊天
zeroclaw chat "Hello!"
```

详细安装方式参见：

```
docs/one-click-bootstrap.md
```

---

## 安装文档（权威来源）

请以仓库文档作为安装与配置的唯一事实来源：

* README Quick Start
* docs/one-click-bootstrap.md
* docs/getting-started/README.md

Issue 评论仅提供参考背景，不属于官方安装文档。

---

## Benchmark 对比（ZeroClaw vs OpenClaw）

本地机器测试（macOS arm64，2026 年 2 月），统一换算至 0.8GHz 边缘设备。

|       | OpenClaw      | NanoBot        | PicoClaw        | ZeroClaw 🦀 |
| ----- | ------------- | -------------- | --------------- | ----------- |
| 语言    | TypeScript    | Python         | Go              | **Rust**    |
| 内存    | > 1GB         | > 100MB        | < 10MB          | **< 5MB**   |
| 启动时间  | > 500s        | > 30s          | < 1s            | **< 10ms**  |
| 二进制大小 | ~28MB         | N/A            | ~8MB            | **~8.8MB**  |
| 成本    | Mac Mini $599 | Linux SBC ~$50 | Linux Board $10 | **任意硬件**    |

说明：

* ZeroClaw 使用 release build + `/usr/bin/time -l` 测量
* OpenClaw 依赖 Node.js（约额外 390MB 内存）
* NanoBot 依赖 Python Runtime
* PicoClaw 与 ZeroClaw 为静态二进制
* 表中 RAM 为运行时内存，占用不包含编译阶段

---

完整文档：

```
docs/README.md
docs/SUMMARY.md
```

---

## ⚠️ 官方仓库与冒充警告

**唯一官方 ZeroClaw 仓库：**

```
https://github.com/zeroclaw-labs/zeroclaw
```

任何其他声称为 ZeroClaw 或暗示与 ZeroClaw Labs 有关联的仓库、组织或域名均 **未经授权**。

已知非官方 Fork 将列于：

```
TRADEMARK.md
```

若发现冒充行为，请提交 Issue。

---

## License（许可证）

ZeroClaw 采用双许可证模式：

| License    | 使用场景          |
| ---------- | ------------- |
| MIT        | 开源、研究、学术、个人使用 |
| Apache 2.0 | 专利保护、机构或商业部署  |

你可任选其一使用。

贡献者默认同时授予两种许可证授权，详见：

```
CLA.md
```

---

## 贡献（Contributing）

参见：

```
CONTRIBUTING.md
CLA.md
```

实现 Trait 并提交 PR 即可参与贡献。

---

**ZeroClaw** — 零开销。零妥协。可部署于任意环境。所有组件均可替换。🦀

---

## Star 历史

（Star History 图表）

---

✅ 本段内容翻译完成（严格对应原文）。

---

如果你后面准备继续翻译 **docs/** 或架构文档，我可以帮你统一成：

* 技术书级中文
* Agent / Runtime 术语统一版本
* 或 OpenClaw / NanoBot / ZeroClaw 横向对照版

直接继续发即可。

# 参考资料

https://github.com/zeroclaw-labs/zeroclaw/blob/main/docs/i18n/zh-CN/README.md

* any list
{:toc}