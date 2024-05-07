---
layout: post
title: AI-02-openui 允许您使用想象力描述用户界面，然后看到其实时渲染。
date: 2024-02-20 21:01:55 +0800
categories: [AI]
tags: [ai, aigc, sh]
published: true
---


# OpenUI

构建用户界面组件可能会很乏味。OpenUI旨在使这个过程有趣、快速且灵活。

我们在[W&B](https://wandb.com)也在使用这个工具来测试和原型化我们构建强大应用程序的下一代工具，这些应用程序是建立在LLM之上的。

## 概览

![演示](https://github.com/wandb/openui/blob/main/assets/demo.gif)

OpenUI允许您使用想象力描述用户界面，然后看到其实时渲染。您可以请求更改并将HTML转换为React、Svelte、Web组件等。这就像[v0](https://v0.dev)一样，但是开源且没有那么精致 :stuck_out_tongue_closed_eyes:。

## 实时演示

[尝试演示](https://openui.fly.dev)

## 本地运行

您也可以在本地运行OpenUI并使用[Ollama](https://ollama.com)提供的模型。[安装Ollama](https://ollama.com/download)并拉取一个模型，比如[CodeLlama](https://ollama.com/library/codellama)，然后假设您已经安装了git和Python：

```bash
git clone https://github.com/wandb/openui
cd openui/backend
# 您可能想要从虚拟环境中执行此操作
pip install .
# 必须设置此项以使用OpenAI模型，请在此处查找您的API密钥：https://platform.openai.com/api-keys
export OPENAI_API_KEY=xxx
python -m openui
```

### Docker Compose

> 免责声明：这可能会非常慢。如果您有GPU，则可能需要将`ollama`容器的标签更改为支持GPU的标签。如果您在Mac上运行，请按照上述说明操作，并在本机运行Ollama，以充分利用M1/M2。

您可以从根目录运行：

```bash
docker-compose up -d
docker exec -it openui-ollama-1 ollama pull llava
```

如果您的OPENAI_API_KEY已在环境中设置，则只需从`OPENAI_API_KEY`行中删除`=xxx`。您也可以在上述命令中用您选择的开源模型替换`llava`*（[llava](https://ollama.com/library/llava)目前是唯一支持图像的Ollama模型之一）*。现在，您应该能够访问[http://localhost:7878](http://localhost:7878)上的OpenUI。

*如果您对前端或后端进行更改，您需要运行`docker-compose build`才能将它们反映在服务中。*

### Docker

您可以从`/backend`目录手动构建和运行docker文件：

```bash
docker build . -t wandb/openui --load
docker run -p 7878:7878 -e OPENAI_API_KEY wandb/openui
```

现在您可以转到[http://localhost:7878](http://localhost:7878)

## 开发

此存储库中配置了一个[开发容器](https://github.com/wandb/openui/blob/main/.devcontainer/devcontainer.json)，这是最快速的入门方式。

### Codespace

<img src="https://github.com/wandb/openui/raw/main/assets/codespace.png" alt="New with options..." width="500" />

在创建Codespace时选择更多选项，然后选择**使用选项新建...**。如果您想要非常快的启动时间，请选择美国西部地区。您还需要配置您的OPENAI_API_KEY密钥，或者如果要尝试Ollama，只需将其设置为`xxx`*（您至少需要16GB的内存）*。

进入代码空间后，您可以在一个终端中运行服务器：`python -m openui --dev`。然后在一个新的终端中：

```bash
cd /workspaces/openui/frontend
npm run dev
```

这应该会在端口5173上打开另一个服务，这是您想要访问的服务。对前端和后端的所有更改都将自动重新加载并反映在您的浏览器中。

### Ollama

Codespace自动安装ollama并下载`llava`模型。您可以使用`ollama list`验证Ollama是否正在运行，如果失败，请打开一个新终端并运行`ollama serve`。在Codespaces中，我们在启动时拉取llava，因此您应该在列表中看到它。您可以从应用程序左上角的设置齿轮图标中选择Ollama模型。您拉取的任何模型，例如`ollama pull llama`，都将显示在设置模态中。

<img src="https://github.com/wandb/openui/raw/main/assets/ollama.png" width="500" alt="选择Ollama模型" />


### 资源

请参阅[frontend](./frontend/README.md)和[backend](./backend/README.md)目录中的自述文件。

# chat

## 详细介绍一下 https://github.com/wandb/openui/

OpenUI 是由 W&B（Weights & Biases）开发的一个开源项目，旨在简化构建用户界面（UI）组件的过程，使其更加有趣、快速和灵活。以下是关于 OpenUI 的详细介绍：

### 项目目标
- OpenUI 旨在让开发者能够通过想象力描述 UI，然后实时看到它被渲染出来。它允许用户请求更改，并将 HTML 转换为 React、Svelte、Web Components 等。

### 概述
- OpenUI 允许用户使用自然语言描述他们想要的 UI 组件，然后这些描述可以被转换成实际的 UI 组件代码。它是一个开源工具，用于测试和原型设计，以构建基于大型语言模型（LLMs）的下一代强大应用程序。

### 实时演示
- 项目页面提供了一个实时演示，用户可以尝试 OpenUI 的功能。

### 本地运行
- 用户可以在本地运行 OpenUI，并使用 Ollama 可用的模型。需要先安装 Ollama 并拉取一个模型，如 CodeLlama。然后，假设用户已经安装了 git 和 python，可以按照提供的步骤运行 OpenUI。

### Docker Compose
- 用户也可以使用 Docker Compose 来运行 OpenUI。需要注意的是，这种方式可能会比较慢，如果用户有 GPU，可能需要更改 `ollama` 容器的标签以支持 GPU。对于 Mac 用户，建议按照上面的指示本地运行 Ollama 以利用 M1/M2 芯片的优势。

### Docker
- 用户还可以手动从 `/backend` 目录构建和运行 Docker 文件。

### 开发
- 该项目配置了开发容器，这是最快开始使用的方式。
- 项目还支持 Codespace，允许用户在云端开发环境中进行开发。

### Ollama
- Codespace 会自动安装 Ollama 并下载 `llava` 模型。用户可以通过 `ollama list` 命令来验证 Ollama 是否正在运行。在 Codespace 中，`llava` 会在启动时被拉取，因此应该可以在列表中看到。

### 资源
- 用户可以参考前端和后端目录中的自述文件，以获取更多关于如何使用 OpenUI 的信息。

OpenUI 的开发和运行依赖于一些外部工具和模型，如 Ollama 和 OpenAI 的 API。它为开发者提供了一种快速迭代和原型设计的方法，特别是对于那些希望利用最新的 AI 技术来加速 UI 开发过程的人。通过 OpenUI，开发者可以更专注于创意和设计，而不是繁琐的编码工作。

# 参考资料

https://github.com/wandb/openui/blob/main/README.md

* any list
{:toc}
