---
layout: post
title: AI MCP(大模型上下文)-03-open webui 介绍 是一个可扩展、功能丰富且用户友好的本地部署 AI 平台，支持完全离线运行。
date: 2025-4-15 17:51:19 +0800
categories: [AI]
tags: [ai, mcp, sh]
published: true
---


# AI MCP 系列

[AgentGPT-01-入门介绍](https://houbb.github.io/2025/04/03/ai-brower-agent-01-agentGPT)

[Browser-use 是连接你的AI代理与浏览器的最简单方式](https://houbb.github.io/2025/04/03/ai-brower-agent-02-browser-use)

[AI MCP(大模型上下文)-01-入门介绍](https://houbb.github.io/2025/04/15/ai-mcp-01-intro)

[AI MCP(大模型上下文)-02-awesome-mcp-servers 精选的 MCP 服务器](https://houbb.github.io/2025/04/15/ai-mcp-02-awesome-servers)

[AI MCP(大模型上下文)-03-open webui 介绍 是一个可扩展、功能丰富且用户友好的本地部署 AI 平台，支持完全离线运行。](https://houbb.github.io/2025/04/15/ai-mcp-03-open-webui)

[AI MCP(大模型上下文)-04-n8n 为技术团队打造的安全工作流自动化平台](https://houbb.github.io/2025/04/15/ai-mcp-04-n8n)

[AI MCP(大模型上下文)-05-anything-llm AnythingLLM 您一直在寻找的全方位AI应用程序](https://houbb.github.io/2025/04/15/ai-mcp-05-anything-llm)

[AI MCP(大模型上下文)-06-maxkb 强大易用的企业级 AI 助手](https://houbb.github.io/2025/04/15/ai-mcp-06-maxkb)

[AI MCP(大模型上下文)-07-dify 入门介绍](https://houbb.github.io/2025/04/15/ai-mcp-07-dify-intro)

[AI MCP(大模型上下文)-08-分享一些好用的 Dify DSL 工作流程](https://houbb.github.io/2025/04/15/ai-mcp-08-awesome-dify-workflow)

[AI MCP(大模型上下文)-09-基于Dify自主创建的AI应用DSL工作流](https://houbb.github.io/2025/04/15/ai-mcp-09-difyaia)

[AI MCP(大模型上下文)-10-Activepieces 一个开源的 Zapier 替代方案](https://houbb.github.io/2025/04/15/ai-mcp-10-activepieces)

[AI MCP(大模型上下文)-11-微软 Playwright MCP server](https://houbb.github.io/2025/04/15/ai-mcp-11-playwright-mcp)

[AI MCP(大模型上下文)-12-AWS MCP](https://houbb.github.io/2025/04/15/ai-mcp-12-aws-mcp)

[AI MCP(大模型上下文)-13-github MCP](https://houbb.github.io/2025/04/15/ai-mcp-13-github-mcp)

# Open WebUI 中文文档 👋

**Open WebUI 是一个可扩展、功能丰富且用户友好的本地部署 AI 平台，支持完全离线运行。** 

支持多种 LLM 后端（如 Ollama 和 OpenAI 兼容 API），内置 RAG 推理引擎，是强大的 AI 部署解决方案。

![Open WebUI Demo](https://github.com/open-webui/open-webui/blob/main/demo.gif?raw=true)

> 💡 **企业版需求？** 立即[联系我们销售团队](mailto:sales@openwebui.com)，获取 **定制主题与品牌**、**服务等级协议 (SLA)**、**长期支持版本 (LTS)** 等更多增强功能！

更多信息请访问：[Open WebUI 官方文档](https://docs.openwebui.com)

---

## 🌟 核心功能

- 🚀 **快速安装**：通过 Docker 或 Kubernetes（kubectl/kustomize/helm）轻松部署，支持 `:ollama` 与 `:cuda` 镜像标签。

- 🤝 **Ollama/OpenAI 接口集成**：支持连接 OpenAI 兼容接口，同时可使用 Ollama 模型，兼容 LMStudio、GroqCloud、Mistral、OpenRouter 等。

- 🛡️ **细粒度权限与用户分组**：管理员可自定义用户角色和权限，提升安全性和灵活性。

- 📱 **响应式设计**：支持桌面、笔记本与移动设备自适应界面。

- 📱 **PWA 支持**：移动端提供类原生应用体验，可在本地离线访问。

- ✒️🔢 **支持 Markdown 与 LaTeX**：提供更丰富的文本交互能力。

- 🎤📹 **语音与视频通话**：支持免手动语音视频聊天，增强交互性。

- 🛠️ **模型构建器**：Web UI 上可视化构建 Ollama 模型，支持角色/代理管理、模型导入、聊天界面自定义。

- 🐍 **Python 函数调用**：支持 BYOF（Bring Your Own Function），原生集成纯 Python 函数与 LLM。

- 📚 **本地 RAG 支持**：集成文档进聊天，使用 `#` 加文档名快速检索。

- 🔍 **RAG 搜索引擎接入**：支持 SearXNG、Google PSE、Brave、DuckDuckGo、TavilySearch、Bing 等。

- 🌐 **网页浏览功能**：使用 `#网址` 直接加载网页内容并在聊天中引用。

- 🎨 **图像生成集成**：支持本地（AUTOMATIC1111、ComfyUI）与外部（OpenAI DALL·E）图像生成。

- ⚙️ **多模型会话**：可同时调用多个模型进行交互，组合输出结果。

- 🔐 **基于角色的访问控制（RBAC）**：限制模型拉取/创建权限，仅限管理员操作。

- 🌍 **多语言支持**：支持国际化，欢迎贡献翻译！

- 🧩 **Pipelines 插件系统**：支持注入自定义逻辑、Python 库，示例包括函数调用、使用限制、多语言翻译、有害内容过滤等。

- 🛠️ **持续更新**：持续迭代优化，新增功能与修复不断推出。

更多功能请访问：[功能总览](https://docs.openwebui.com/features)

---

## 🚀 安装指南

### 使用 Python pip 安装

1. 安装：
```bash
pip install open-webui
```

2. 运行：
```bash
open-webui serve
```
访问地址：[http://localhost:8080](http://localhost:8080)

### 使用 Docker 快速启动

- **默认配置本地 Ollama**：
```bash
docker run -d -p 3000:8080 --add-host=host.docker.internal:host-gateway -v open-webui:/app/backend/data --name open-webui --restart always ghcr.io/open-webui/open-webui:main
```

- **远程 Ollama 服务**：
```bash
docker run -d -p 3000:8080 -e OLLAMA_BASE_URL=https://example.com -v open-webui:/app/backend/data --name open-webui --restart always ghcr.io/open-webui/open-webui:main
```

- **GPU CUDA 加速**：
```bash
docker run -d -p 3000:8080 --gpus all --add-host=host.docker.internal:host-gateway -v open-webui:/app/backend/data --name open-webui --restart always ghcr.io/open-webui/open-webui:cuda
```

- **仅使用 OpenAI API**：
```bash
docker run -d -p 3000:8080 -e OPENAI_API_KEY=your_secret_key -v open-webui:/app/backend/data --name open-webui --restart always ghcr.io/open-webui/open-webui:main
```

- **集成 Ollama 的镜像（GPU 支持）**：
```bash
docker run -d -p 3000:8080 --gpus=all -v ollama:/root/.ollama -v open-webui:/app/backend/data --name open-webui --restart always ghcr.io/open-webui/open-webui:ollama
```

- **集成 Ollama 的镜像（仅 CPU）**：
```bash
docker run -d -p 3000:8080 -v ollama:/root/.ollama -v open-webui:/app/backend/data --name open-webui --restart always ghcr.io/open-webui/open-webui:ollama
```

访问地址：[http://localhost:3000](http://localhost:3000)

---

### 其他安装方式

支持非 Docker 部署、Docker Compose、Kustomize、Helm 等。请访问：[安装文档](https://docs.openwebui.com/getting-started/)

---

## 🛠️ 故障排查

常见连接失败多为容器内无法访问 Ollama 服务。建议加上 `--network=host` 解决。

**示例：**
```bash
docker run -d --network=host -v open-webui:/app/backend/data -e OLLAMA_BASE_URL=http://127.0.0.1:11434 --name open-webui --restart always ghcr.io/open-webui/open-webui:main
```

### 使用 Watchtower 自动更新
```bash
docker run --rm -v /var/run/docker.sock:/var/run/docker.sock containrrr/watchtower --run-once open-webui
```

---

## 🌙 Dev 分支说明

`:dev` 标签包含最新实验功能，可能存在不稳定或未完成特性。
```bash
docker run -d -p 3000:8080 -v open-webui:/app/backend/data --name open-webui --add-host=host.docker.internal:host-gateway --restart always ghcr.io/open-webui/open-webui:dev
```

### 离线模式

设置环境变量防止联网下载模型：
```bash
export HF_HUB_OFFLINE=1
```

---

## 👥 社区与支持

- 💬 Discord 社区：[https://discord.gg/openwebui](https://discord.gg/openwebui)
- 🐦 X（推特）：[https://x.com/openwebui](https://x.com/openwebui)
- 🌐 官网：[https://openwebui.com](https://openwebui.com)
- 🐙 GitHub 项目主页：[https://github.com/open-webui/open-webui](https://github.com/open-webui/open-webui)

---

## 📜 许可证

本项目基于 [BSD-3-Clause License](LICENSE) 开源协议。

---

由 [Timothy Jaeryang Baek](https://github.com/tjbck) 创建，让我们一起让 Open WebUI 更加出色！💪




# 参考资料

https://github.com/open-webui/open-webui

* any list
{:toc}