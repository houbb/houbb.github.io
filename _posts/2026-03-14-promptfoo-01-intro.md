---
layout: post
title: promptfoo：LLM 评估与红队测试
date: 2026-03-13 21:01:55 +0800
categories: [AI]
tags: [ai, speech, sh]
published: true
---

# promptfoo：LLM 评估与红队测试

`promptfoo` 是一个 **面向开发者的本地工具，用于测试 LLM 应用**。
停止依赖反复试错的方法 —— 开始构建 **安全、可靠的 AI 应用**。

官网 · Getting Started · Red Teaming · 文档 · Discord

---

# 快速开始

```bash
# 安装并初始化项目
npx promptfoo@latest init

# 运行第一次评估
npx promptfoo eval
```

查看：

* Getting Started（评估）
* Red Teaming（漏洞扫描）

以了解更多信息。

---

# 使用 Promptfoo 可以做什么？

* **测试你的 Prompt 与模型**，并进行自动化评估
* 通过 **红队测试（Red Teaming）与漏洞扫描** 保护 LLM 应用
* **并排比较模型性能**（OpenAI、Anthropic、Azure、Bedrock、Ollama 等）
* 在 **CI/CD 流程中自动执行检查**
* 在 **Pull Request 中进行代码扫描**，检查与 LLM 相关的安全与合规问题
* **与团队共享评估结果**

---

# 实际效果

（此处原文展示 UI 示例）

---

# 也支持命令行

（原文展示 CLI 示例）

---

# 还可以生成安全漏洞报告

（原文展示报告示例）

---

# 为什么选择 Promptfoo？

* 🚀 **开发者优先（Developer-first）**
  速度快，支持实时重载（live reload）和缓存

* 🔒 **隐私保护（Private）**
  LLM 评估 **100% 本地运行**，你的 Prompt 不会离开本机

* 🔧 **灵活（Flexible）**
  支持 **任意 LLM API 或编程语言**

* 💪 **生产验证（Battle-tested）**
  已在 **服务超过 1000 万用户的生产应用**中使用

* 📊 **数据驱动（Data-driven）**
  用指标而不是直觉来做决策

* 🤝 **开源（Open source）**
  MIT 许可证，并拥有活跃社区

---

# 了解更多

* 📚 完整文档（Full Documentation）
* 🔐 红队测试指南（Red Teaming Guide）
* 🎯 快速开始（Getting Started）
* 💻 CLI 使用说明
* 📦 Node.js 包
* 🤖 支持的模型

---

# 贡献（Contributing）

欢迎贡献代码！

请查看 **贡献指南（contributing guide）** 以开始参与。

你也可以加入 **Discord 社区**进行交流和获得帮助。

---

# 项目简介（About）

测试你的 **Prompt、Agent 和 RAG 系统**。
为 LLM 提供 **AI 红队测试、渗透测试（pentesting）和漏洞扫描**。
比较 **GPT、Claude、Gemini、Llama 等模型的性能**。

使用 **简单的声明式配置**，并支持 **命令行与 CI/CD 集成**。 ([GitHub][1])


# 参考资料

* any list
{:toc}