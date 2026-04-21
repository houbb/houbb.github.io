---
layout: post 
title: Thunderbolt 由你掌控的 AI：自由选择模型，掌握你的数据，消除厂商锁定。
date: 2026-04-21 21:01:55 +0800
categories: [Ai]
tags: [finance, ai]
published: true
---


# Thunderbolt

**由你掌控的 AI：自由选择模型，掌握你的数据，消除厂商锁定。**

> ⚠️ **我们很高兴 Thunderbolt 获得了大量关注，同时也希望说明该项目仍处于早期阶段并在积极开发中**。

目前，我们的目标用户是希望在本地（on-prem）部署的企业客户。我们鼓励你自行托管并进行尝试，但目前仍存在一些需要注意的限制：
>
> * 虽然我们最终计划让 Thunderbolt 完全支持离线优先（offline-first），但目前仍依赖认证和搜索功能（不过你可以在应用的集成界面中禁用搜索）。你可以[使用 Docker 部署你自己的后端](./deploy/README.md)，并注册以便在本地进行测试。
> * 你需要自行添加模型提供方——我们目前尚未提供公共推理端点。我们建议如果你希望进行免费的本地推理，可以将 Thunderbolt 与 [Ollama](https://ollama.com) 或 [llama.cpp](https://github.com/ggml-org/llama.cpp) 一起使用；或者你也可以在设置中添加任意兼容 OpenAI 的模型提供方 API Key。

Thunderbolt 是一个开源、跨平台的 AI 客户端，可以在任意环境中进行本地部署（on-prem）。

* 🌐 支持所有主流桌面与移动平台：Web、iOS、Android、Mac、Linux 和 Windows
* 🧠 兼容前沿模型、本地模型以及本地部署模型
* 🙋 提供企业级功能、支持以及 FDE（前端工程师）服务

**Thunderbolt 正在积极开发中，目前正在进行安全审计，并为企业级生产环境做好准备。**

---

## 需要帮助？

发现了 Bug？有新的想法？

* 我们正在积极完善文档、社区和路线图。目前，最好的联系方式是：[提交 Issue](https://github.com/thunderbird/thunderbolt/issues)

---

## 贡献

欢迎任何人的贡献。

* **开发**：[开发指南](./docs/development.md) 将帮助你快速上手
* 请务必阅读 [Mozilla 社区参与指南](https://www.mozilla.org/about/governance/policies/participation/)

---

## 文档

* [FAQ](./docs/faq.md) - 常见问题
* [部署](./deploy/README.md) - 使用 Docker Compose 或 Kubernetes 自托管
* [开发](./docs/development.md) - 快速开始、环境配置与测试
* [架构](./docs/architecture.md) - 系统架构与图示
* [功能与路线图](./docs/roadmap.md) - 平台与功能状态
* [Claude Code 技能](./docs/claude-code.md) - Slash 命令、自动化与子树同步
* [Storybook](./docs/storybook.md) - 构建、测试与组件文档
* [Vite Bundle 分析器](./docs/vite-bundle-analyzer.md) - 分析前端打包体积
* [Tauri 签名密钥](./docs/tauri-signing-keys.md) - 生成与管理发布签名密钥
* [发布流程](./RELEASE.md) - 创建与发布新版本的说明
* [遥测](./TELEMETRY.md) - 数据收集与隐私政策说明

---

## 行为准则

请阅读我们的[行为准则](./CODE_OF_CONDUCT.md)。所有 Thunderbolt 社区参与者均需遵守该准则以及 [Mozilla 社区参与指南](https://www.mozilla.org/about/governance/policies/participation/)。

---

## 安全

如果你发现安全漏洞，请通过我们的[漏洞报告表单](https://github.com/thunderbird/thunderbolt/security/advisories/new)负责任地进行报告。请**不要**通过公开的 GitHub Issue 提交安全漏洞。

---

## 许可证

Thunderbolt 采用 [Mozilla Public License 2.0](./LICENSE) 授权。


# 参考资料

* any list
{:toc}