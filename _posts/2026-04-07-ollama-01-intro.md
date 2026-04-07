---
layout: post 
title: Ollama 构建开放模型
date: 2026-04-07 21:01:55 +0800
categories: [AI]
tags: [ai, llm]
published: true
---

# Ollama

开始使用开放模型进行构建。

## 下载

### macOS

```shell
curl -fsSL https://ollama.com/install.sh | sh
```

或[手动下载](https://ollama.com/download/Ollama.dmg)

### Windows

```shell
irm https://ollama.com/install.ps1 | iex
```

或[手动下载](https://ollama.com/download/OllamaSetup.exe)

### Linux

```shell
curl -fsSL https://ollama.com/install.sh | sh
```

[手动安装说明](https://docs.ollama.com/linux#manual-install)

### Docker

官方的 [Ollama Docker 镜像](https://hub.docker.com/r/ollama/ollama) `ollama/ollama` 可在 Docker Hub 上获取。

### 库

- [ollama-python](https://github.com/ollama/ollama-python)
- [ollama-js](https://github.com/ollama/ollama-js)

### 社区

- [Discord](https://discord.gg/ollama)
- [𝕏 (Twitter)](https://x.com/ollama)
- [Reddit](https://reddit.com/r/ollama)

## 快速开始

```
ollama
```

系统会提示您运行模型，或者将 Ollama 连接到您现有的智能体或应用程序，例如 `claude`、`codex`、`openclaw` 等。

### 编码

要启动特定的集成：

```
ollama launch claude
```

支持的集成包括 [Claude Code](https://docs.ollama.com/integrations/claude-code)、[Codex](https://docs.ollama.com/integrations/codex)、[Droid](https://docs.ollama.com/integrations/droid) 和 [OpenCode](https://docs.ollama.com/integrations/opencode)。

### AI 助手

使用 [OpenClaw](https://docs.ollama.com/integrations/openclaw) 将 Ollama 转变为跨 WhatsApp、Telegram、Slack、Discord 等的个人 AI 助手：

```
ollama launch openclaw
```

### 与模型聊天

运行并与 [Gemma 3](https://ollama.com/library/gemma3) 聊天：

```
ollama run gemma3
```

完整列表请参见 [ollama.com/library](https://ollama.com/library)。

更多详情请参阅[快速入门指南](https://docs.ollama.com/quickstart)。

## REST API

Ollama 提供了用于运行和管理模型的 REST API。

```
curl http://localhost:11434/api/chat -d '{
  "model": "gemma3",
  "messages": [{
    "role": "user",
    "content": "Why is the sky blue?"
  }],
  "stream": false
}'
```

有关所有端点的信息，请参阅 [API 文档](https://docs.ollama.com/api)。

### Python

```
pip install ollama
```

```python
from ollama import chat

response = chat(model='gemma3', messages=[
  {
    'role': 'user',
    'content': 'Why is the sky blue?',
  },
])
print(response.message.content)
```

### JavaScript

```
npm i ollama
```

```javascript
import ollama from "ollama";

const response = await ollama.chat({
  model: "gemma3",
  messages: [{ role: "user", content: "Why is the sky blue?" }],
});
console.log(response.message.content);
```

## 支持的后端

- [llama.cpp](https://github.com/ggml-org/llama.cpp) 项目，由 Georgi Gerganov 创建。

## 文档

- [CLI 参考](https://docs.ollama.com/cli)
- [REST API 参考](https://docs.ollama.com/api)
- [导入模型](https://docs.ollama.com/import)
- [模型文件参考](https://docs.ollama.com/modelfile)
- [从源码构建](https://github.com/ollama/ollama/blob/main/docs/development.md)

## 社区集成

> 想添加您的项目？请发起拉取请求。

### 聊天界面

#### Web

- [Open WebUI](https://github.com/open-webui/open-webui) - 可扩展的自托管 AI 界面
- [Onyx](https://github.com/onyx-dot-app/onyx) - 互联的 AI 工作区
- [LibreChat](https://github.com/danny-avila/LibreChat) - 增强版 ChatGPT 克隆，支持多提供商
- [Lobe Chat](https://github.com/lobehub/lobe-chat) - 现代聊天框架，带有插件生态系统（[文档](https://lobehub.com/docs/self-hosting/examples/ollama)）
- [NextChat](https://github.com/ChatGPTNextWeb/ChatGPT-Next-Web) - 跨平台 ChatGPT UI（[文档](https://docs.nextchat.dev/models/ollama)）
- [Perplexica](https://github.com/ItzCrazyKns/Perplexica) - AI 驱动的搜索引擎，开源的 Perplexity 替代品
- [big-AGI](https://github.com/enricoros/big-AGI) - 面向专业人士的 AI 套件
- [Lollms WebUI](https://github.com/ParisNeo/lollms-webui) - 多模型 Web 界面
- [ChatOllama](https://github.com/sugarforever/chat-ollama) - 带知识库的聊天机器人
- [Bionic GPT](https://github.com/bionic-gpt/bionic-gpt) - 本地部署 AI 平台
- [Chatbot UI](https://github.com/ivanfioravanti/chatbot-ollama) - ChatGPT 风格 Web 界面
- [Hollama](https://github.com/fmaclen/hollama) - 极简 Web 界面
- [Chatbox](https://github.com/Bin-Huang/Chatbox) - 桌面和 Web AI 客户端
- [chat](https://github.com/swuecho/chat) - 面向团队的聊天 Web 应用
- [Ollama RAG Chatbot](https://github.com/datvodinh/rag-chatbot.git) - 使用 RAG 与多个 PDF 聊天
- [Tkinter-based client](https://github.com/chyok/ollama-gui) - Python 桌面客户端

#### 桌面

- [Dify.AI](https://github.com/langgenius/dify) - LLM 应用开发平台
- [AnythingLLM](https://github.com/Mintplex-Labs/anything-llm) - 面向 Mac、Windows 和 Linux 的全能 AI 应用
- [Maid](https://github.com/Mobile-Artificial-Intelligence/maid) - 跨平台移动和桌面客户端
- [Witsy](https://github.com/nbonamy/witsy) - 面向 Mac、Windows 和 Linux 的 AI 桌面应用
- [Cherry Studio](https://github.com/kangfenmao/cherry-studio) - 多提供商桌面客户端
- [Ollama App](https://github.com/JHubi1/ollama-app) - 跨平台客户端，支持桌面和移动端
- [PyGPT](https://github.com/szczyglis-dev/py-gpt) - 面向 Linux、Windows 和 Mac 的 AI 桌面助手
- [Alpaca](https://github.com/Jeffser/Alpaca) - 面向 Linux 和 macOS 的 GTK4 客户端
- [SwiftChat](https://github.com/aws-samples/swift-chat) - 跨平台，包括 iOS、Android 和 Apple Vision Pro
- [Enchanted](https://github.com/AugustDev/enchanted) - 原生 macOS 和 iOS 客户端
- [RWKV-Runner](https://github.com/josStorer/RWKV-Runner) - 多模型桌面运行器
- [Ollama Grid Search](https://github.com/dezoito/ollama-grid-search) - 评估和比较模型
- [macai](https://github.com/Renset/macai) - 面向 Ollama 和 ChatGPT 的 macOS 客户端
- [AI Studio](https://github.com/MindWorkAI/AI-Studio) - 多提供商桌面 IDE
- [Reins](https://github.com/ibrahimcetin/reins) - 参数调优和推理模型支持
- [ConfiChat](https://github.com/1runeberg/confichat) - 注重隐私，支持可选加密
- [LLocal.in](https://github.com/kartikm7/llocal) - Electron 桌面客户端
- [MindMac](https://mindmac.app) - Mac 版 AI 聊天客户端
- [Msty](https://msty.app) - 多模型桌面客户端
- [BoltAI for Mac](https://boltai.com) - Mac 版 AI 聊天客户端
- [IntelliBar](https://intellibar.app/) - macOS AI 助手
- [Kerlig AI](https://www.kerlig.com/) - macOS AI 写作助手
- [Hillnote](https://hillnote.com) - Markdown 优先的 AI 工作区
- [Perfect Memory AI](https://www.perfectmemory.ai/) - 通过屏幕和会议历史进行个性化的生产力 AI

#### 移动端

- [Ollama Android Chat](https://github.com/sunshine0523/OllamaServer) - 一键在 Android 上运行 Ollama

> 上面列出的 SwiftChat、Enchanted、Maid、Ollama App、Reins 和 ConfiChat 也支持移动平台。

### 代码编辑器与开发

- [Cline](https://github.com/cline/cline) - 用于多文件/全仓库编码的 VS Code 扩展
- [Continue](https://github.com/continuedev/continue) - 适用于任何 IDE 的开源 AI 代码助手
- [Void](https://github.com/voideditor/void) - 开源 AI 代码编辑器，Cursor 替代品
- [Copilot for Obsidian](https://github.com/logancyang/obsidian-copilot) - Obsidian 的 AI 助手
- [twinny](https://github.com/rjmacarthy/twinny) - Copilot 和 Copilot Chat 替代品
- [gptel Emacs client](https://github.com/karthink/gptel) - Emacs 的 LLM 客户端
- [Ollama Copilot](https://github.com/bernardo-bruning/ollama-copilot) - 将 Ollama 用作 GitHub Copilot
- [Obsidian Local GPT](https://github.com/pfrankov/obsidian-local-gpt) - Obsidian 的本地 AI
- [Ellama Emacs client](https://github.com/s-kostyaev/ellama) - Emacs 的 LLM 工具
- [orbiton](https://github.com/xyproto/orbiton) - 无配置文本编辑器，支持 Ollama 制表符补全
- [AI ST Completion](https://github.com/yaroslavyaroslav/OpenAI-sublime-text) - Sublime Text 4 AI 助手
- [VT Code](https://github.com/vinhnx/vtcode) - 基于 Rust 的终端编码智能体，使用 Tree-sitter
- [QodeAssist](https://github.com/Palm1r/QodeAssist) - Qt Creator 的 AI 编码助手
- [AI Toolkit for VS Code](https://aka.ms/ai-tooklit/ollama-docs) - Microsoft 官方 VS Code 扩展
- [Open Interpreter](https://docs.openinterpreter.com/language-model-setup/local-models/ollama) - 计算机的自然语言界面

### 库与 SDK

- [LiteLLM](https://github.com/BerriAI/litellm) - 面向 100+ LLM 提供商的统一 API
- [Semantic Kernel](https://github.com/microsoft/semantic-kernel/tree/main/python/semantic_kernel/connectors/ai/ollama) - Microsoft AI 编排 SDK
- [LangChain4j](https://github.com/langchain4j/langchain4j) - Java LangChain（[示例](https://github.com/langchain4j/langchain4j-examples/tree/main/ollama-examples/src/main/java)）
- [LangChainGo](https://github.com/tmc/langchaingo/) - Go LangChain（[示例](https://github.com/tmc/langchaingo/tree/main/examples/ollama-completion-example)）
- [Spring AI](https://github.com/spring-projects/spring-ai) - Spring 框架 AI 支持（[文档](https://docs.spring.io/spring-ai/reference/api/chat/ollama-chat.html)）
- [LangChain](https://python.langchain.com/docs/integrations/chat/ollama/) 和 [LangChain.js](https://js.langchain.com/docs/integrations/chat/ollama/) 及[示例](https://js.langchain.com/docs/tutorials/local_rag/)
- [Ollama for Ruby](https://github.com/crmne/ruby_llm) - Ruby LLM 库
- [any-llm](https://github.com/mozilla-ai/any-llm) - Mozilla 的统一 LLM 接口
- [OllamaSharp for .NET](https://github.com/awaescher/OllamaSharp) - .NET SDK
- [LangChainRust](https://github.com/Abraxas-365/langchain-rust) - Rust LangChain（[示例](https://github.com/Abraxas-365/langchain-rust/blob/main/examples/llm_ollama.rs)）
- [Agents-Flex for Java](https://github.com/agents-flex/agents-flex) - Java 智能体框架（[示例](https://github.com/agents-flex/agents-flex/tree/main/agents-flex-llm/agents-flex-llm-ollama/src/test/java/com/agentsflex/llm/ollama)）
- [Elixir LangChain](https://github.com/brainlid/langchain) - Elixir LangChain
- [Ollama-rs for Rust](https://github.com/pepperoni21/ollama-rs) - Rust SDK
- [LangChain for .NET](https://github.com/tryAGI/LangChain) - .NET LangChain（[示例](https://github.com/tryAGI/LangChain/blob/main/examples/LangChain.Samples.OpenAI/Program.cs)）
- [chromem-go](https://github.com/philippgille/chromem-go) - 支持 Ollama 嵌入的 Go 向量数据库（[示例](https://github.com/philippgille/chromem-go/tree/v0.5.0/examples/rag-wikipedia-ollama)）
- [LangChainDart](https://github.com/davidmigloz/langchain_dart) - Dart LangChain
- [LlmTornado](https://github.com/lofcz/llmtornado) - 面向多个推理 API 的统一 C# 接口
- [Ollama4j for Java](https://github.com/ollama4j/ollama4j) - Java SDK
- [Ollama for Laravel](https://github.com/cloudstudio/ollama-laravel) - Laravel 集成
- [Ollama for Swift](https://github.com/mattt/ollama-swift) - Swift SDK
- [LlamaIndex](https://docs.llamaindex.ai/en/stable/examples/llm/ollama/) 和 [LlamaIndexTS](https://ts.llamaindex.ai/modules/llms/available_llms/ollama) - LLM 应用的数据框架
- [Haystack](https://github.com/deepset-ai/haystack-integrations/blob/main/integrations/ollama.md) - AI 流水线框架
- [Firebase Genkit](https://firebase.google.com/docs/genkit/plugins/ollama) - Google AI 框架
- [Ollama-hpp for C++](https://github.com/jmont-dev/ollama-hpp) - C++ SDK
- [PromptingTools.jl](https://github.com/svilupp/PromptingTools.jl) - Julia LLM 工具包（[示例](https://svilupp.github.io/PromptingTools.jl/dev/examples/working_with_ollama)）
- [Ollama for R - rollama](https://github.com/JBGruber/rollama) - R SDK
- [Portkey](https://portkey.ai/docs/welcome/integration-guides/ollama) - AI 网关
- [Testcontainers](https://testcontainers.com/modules/ollama/) - 基于容器的测试
- [LLPhant](https://github.com/theodo-group/LLPhant?tab=readme-ov-file#ollama) - PHP AI 框架

### 框架与智能体

- [AutoGPT](https://github.com/Significant-Gravitas/AutoGPT/blob/master/docs/content/platform/ollama.md) - 自主 AI 智能体平台
- [crewAI](https://github.com/crewAIInc/crewAI) - 多智能体编排框架
- [Strands Agents](https://github.com/strands-agents/sdk-python) - AWS 的模型驱动智能体构建
- [Cheshire Cat](https://github.com/cheshire-cat-ai/core) - AI 助手框架
- [any-agent](https://github.com/mozilla-ai/any-agent) - Mozilla 的统一智能体框架接口
- [Stakpak](https://github.com/stakpak/agent) - 开源 DevOps 智能体
- [Hexabot](https://github.com/hexastack/hexabot) - 对话式 AI 构建器
- [Neuro SAN](https://github.com/cognizant-ai-lab/neuro-san-studio) - 多智能体编排（[文档](https://github.com/cognizant-ai-lab/neuro-san-studio/blob/main/docs/user_guide.md#ollama)）

### RAG 与知识库

- [RAGFlow](https://github.com/infiniflow/ragflow) - 基于深度文档理解的 RAG 引擎
- [R2R](https://github.com/SciPhi-AI/R2R) - 开源 RAG 引擎
- [MaxKB](https://github.com/1Panel-dev/MaxKB/) - 开箱即用的 RAG 聊天机器人
- [Minima](https://github.com/dmayboroda/minima) - 本地部署或完全本地的 RAG
- [Chipper](https://github.com/TilmanGriesel/chipper) - 使用 Haystack RAG 的 AI 界面
- [ARGO](https://github.com/xark-argo/argo) - 在 Mac/Windows/Linux 上的 RAG 与深度研究
- [Archyve](https://github.com/nickthecook/archyve) - 支持 RAG 的文档库
- [Casibase](https://casibase.org) - 具备 RAG 和 SSO 的 AI 知识库
- [BrainSoup](https://www.nurgo-software.com/products/brainsoup) - 原生客户端，支持 RAG 和多智能体自动化

### 机器人与消息

- [LangBot](https://github.com/RockChinQ/LangBot) - 多平台消息机器人，支持智能体和 RAG
- [AstrBot](https://github.com/Soulter/AstrBot/) - 多平台聊天机器人，支持 RAG 和插件
- [Discord-Ollama Chat Bot](https://github.com/kevinthedang/discord-ollama) - TypeScript Discord 机器人
- [Ollama Telegram Bot](https://github.com/ruecat/ollama-telegram) - Telegram 机器人
- [LLM Telegram Bot](https://github.com/innightwolfsleep/llm_telegram_bot) - 用于角色扮演的 Telegram 机器人

### 终端与 CLI

- [aichat](https://github.com/sigoden/aichat) - 全能 LLM CLI，带有 Shell 助手、RAG 和 AI 工具
- [oterm](https://github.com/ggozad/oterm) - Ollama 的终端客户端
- [gollama](https://github.com/sammcj/gollama) - 基于 Go 的 Ollama 模型管理器
- [tlm](https://github.com/yusufcanb/tlm) - 本地 shell 副驾驶
- [tenere](https://github.com/pythops/tenere) - LLM 的 TUI
- [ParLlama](https://github.com/paulrobello/parllama) - Ollama 的 TUI
- [llm-ollama](https://github.com/taketwo/llm-ollama) - [Datasette 的 LLM CLI](https://llm.datasette.io/en/stable/) 的插件
- [ShellOracle](https://github.com/djcopley/ShellOracle) - Shell 命令建议
- [LLM-X](https://github.com/mrdjohnson/llm-x) - LLM 的渐进式 Web 应用
- [cmdh](https://github.com/pgibler/cmdh) - 自然语言转 shell 命令
- [VT](https://github.com/vinhnx/vt.ai) - 极简多模态 AI 聊天应用

### 生产力与应用

- [AppFlowy](https://github.com/AppFlowy-IO/AppFlowy) - AI 协作工作区，自托管的 Notion 替代品
- [Screenpipe](https://github.com/mediar-ai/screenpipe) - 24/7 屏幕和麦克风录制，支持 AI 搜索
- [Vibe](https://github.com/thewh1teagle/vibe) - 转录和分析会议
- [Page Assist](https://github.com/n4ze3m/page-assist) - 用于 AI 辅助浏览的 Chrome 扩展
- [NativeMind](https://github.com/NativeMindBrowser/NativeMindExtension) - 私有的设备端浏览器 AI 助手
- [Ollama Fortress](https://github.com/ParisNeo/ollama_proxy_server) - Ollama 的安全代理
- [1Panel](https://github.com/1Panel-dev/1Panel/) - 基于 Web 的 Linux 服务器管理
- [Writeopia](https://github.com/Writeopia/Writeopia) - 集成 Ollama 的文本编辑器
- [QA-Pilot](https://github.com/reid41/QA-Pilot) - GitHub 代码仓库理解
- [Raycast extension](https://github.com/MassimilianoPasquini97/raycast_ollama) - Raycast 中的 Ollama
- [Painting Droid](https://github.com/mateuszmigas/painting-droid) - 集成 AI 的绘图应用
- [Serene Pub](https://github.com/doolijb/serene-pub) - AI 角色扮演应用
- [Mayan EDMS](https://gitlab.com/mayan-edms/mayan-edms) - 支持 Ollama 工作流的文档管理
- [TagSpaces](https://www.tagspaces.org) - 文件管理，支持 [AI 标记](https://docs.tagspaces.org/ai/)

### 可观测性与监控

- [Opik](https://www.comet.com/docs/opik/cookbook/ollama) - 调试、评估和监控 LLM 应用
- [OpenLIT](https://github.com/openlit/openlit) - 面向 Ollama 和 GPU 的 OpenTelemetry 原生监控
- [Lunary](https://lunary.ai/docs/integrations/ollama) - LLM 可观测性，包含分析和 PII 脱敏
- [Langfuse](https://langfuse.com/docs/integrations/ollama) - 开源 LLM 可观测性
- [HoneyHive](https://docs.honeyhive.ai/integrations/ollama) - 面向智能体的 AI 可观测性与评估
- [MLflow Tracing](https://mlflow.org/docs/latest/llms/tracing/index.html#automatic-tracing) - 开源 LLM 可观测性

### 数据库与嵌入

- [pgai](https://github.com/timescale/pgai) - 作为向量数据库的 PostgreSQL（[指南](https://github.com/timescale/pgai/blob/main/docs/vectorizer-quick-start.md)）
- [MindsDB](https://github.com/mindsdb/mindsdb/blob/staging/mindsdb/integrations/handlers/ollama_handler/README.md) - 将 Ollama 与 200+ 数据平台连接
- [chromem-go](https://github.com/philippgille/chromem-go/blob/v0.5.0/embed_ollama.go) - 用于 Go 的可嵌入向量数据库（[示例](https://github.com/philippgille/chromem-go/tree/v0.5.0/examples/rag-wikipedia-ollama)）
- [Kangaroo](https://github.com/dbkangaroo/kangaroo) - AI 驱动的 SQL 客户端

### 基础设施与部署

#### 云

- [Google Cloud](https://cloud.google.com/run/docs/tutorials/gpu-gemma2-with-ollama)
- [Fly.io](https://fly.io/docs/python/do-more/add-ollama/)
- [Koyeb](https://www.koyeb.com/deploy/ollama)
- [Harbor](https://github.com/av/harbor) - 容器化 LLM 工具包，以 Ollama 为默认后端

#### 包管理器

- [Pacman](https://archlinux.org/packages/extra/x86_64/ollama/)
- [Homebrew](https://formulae.brew.sh/formula/ollama)
- [Nix package](https://search.nixos.org/packages?show=ollama&from=0&size=50&sort=relevance&type=packages&query=ollama)
- [Helm Chart](https://artifacthub.io/packages/helm/ollama-helm/ollama)
- [Gentoo](https://github.com/gentoo/guru/tree/master/app-misc/ollama)
- [Flox](https://flox.dev/blog/ollama-part-one)
- [Guix channel](https://codeberg.org/tusharhero/ollama-guix)


# 参考资料

* any list
{:toc}