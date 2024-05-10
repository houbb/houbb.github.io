---
layout: post
title: AI-10-openai Assistant 旨在让每个人都能访问一个优秀的基于聊天的大型语言模型
date: 2024-02-20 21:01:55 +0800
categories: [AI]
tags: [ai, aigc, chatgpt, gpt, sh]
published: true
---

### 开放助手项目概述

Open-Assistant 旨在让每个人都能访问一个优秀的基于聊天的大型语言模型。

我们相信，通过这样做，我们将在语言创新方面引发一场革命。就像稳定扩散帮助世界以新的方式制作艺术和图像一样，我们希望开放助手能够通过改进语言本身来改善世界。

### 有用的链接

- [数据收集](https://open-assistant.io)
- [聊天](https://open-assistant.io/chat)
- [项目文档](https://projects.laion.ai/Open-Assistant/)

### 如何尝试

#### 与AI聊天

聊天前端现在已经上线 [这里](https://open-assistant.io/chat)。登录并开始聊天！请尝试在聊天时对助手的响应进行点赞或点踩。

#### 贡献数据收集

数据收集前端现在已经上线 [这里](https://open-assistant.io/)。登录并开始承担任务！我们希望收集大量高质量的数据。通过提交、排名和标记模型提示和响应，您将直接帮助改进开放助手的功能。

#### 本地运行开发设置（无需聊天）

**除非您要为开发过程做出贡献，否则无需在本地运行项目。上面的网站链接将带您进入公共网站，您可以在其中使用数据收集应用程序和聊天功能。**

如果您想要在本地进行开发，可以使用 Docker 设置运行整个所需的堆栈，包括网站、后端和相关的依赖服务。

要启动演示，请在存储库的根目录中运行以下命令（如果出现问题，请查看 [此常见问题解答](https://projects.laion.ai/Open-Assistant/docs/faq#docker-compose-instead-of-docker-compose)）：

```sh
docker compose --profile ci up --build --attach-dependencies
```

> **注意：** 在具有 M1 芯片的 MacOS 上运行时，您必须使用：`DB_PLATFORM=linux/x86_64 docker compose ...`

然后，导航到 `http://localhost:3000`（启动可能需要一些时间），并与网站交互。

> **注意：** 如果构建过程出现问题，请查看 [常见问题解答](https://projects.laion.ai/Open-Assistant/docs/faq) 中有关 Docker 的条目。

> **注意：** 当通过电子邮件登录时，请导航到 `http://localhost:1080` 以获取神奇的电子邮件登录链接。

> **注意：** 如果您想在标准化的开发环境（即 ["devcontainer"](https://code.visualstudio.com/docs/devcontainers/containers)）中使用 [vscode 本地](https://code.visualstudio.com/docs/devcontainers/create-dev-container#_create-a-devcontainerjson-file) 或在 Web 浏览器中使用 [GitHub Codespaces](https://github.com/features/codespaces)，您可以使用提供的 [.devcontainer](.devcontainer/) 文件夹。

#### 本地运行开发设置以进行聊天

**除非您要为开发过程做出贡献，否则无需在本地运行项目。上面的网站链接将带您进入公共网站，您可以在其中使用数据收集应用程序和聊天功能。**

**还请注意，本地设置仅用于开发，并不意味着作为本地聊天机器人使用，除非您知道自己在做什么。**

如果您知道自己在做什么，那么请查看 `inference` 文件夹以启动推理系统，或者在上述命令中使用 `--profile inference` 以及 `--profile ci`。

### 愿景和计划

我们不会止步于复制 ChatGPT。我们希望构建未来的助手，能够不仅仅写电子邮件和求职信，还能做有意义的工作，使用 API，动态研究信息等等，并且可以由任何人进行个性化和扩展。我们希望以开放和可访问的方式实现这一目标，这意味着我们不仅需要构建一个出色的助手，还要使其足够小巧和高效，以便在消费者硬件上运行。

### 计划

##### 我们希望尽快以最快速度达到初始MVP，方法是遵循 [InstructGPT 论文](https://arxiv.org/abs/2203.02155) 中概述的3个步骤

1. 收集高质量的人类生成的指令-完成样本（提示+响应），目标>50k。我们设计了一种众包过程来收集和审查提示。我们不想在洪水/有毒/垃圾/垃圾/个人信息数据上进行训练。我们将有一个排行榜来激励社区，显示进度和最活跃的用户。我们将给予排名前几名的贡献者一些奖品。
2. 对于收集到的每个提示，我们将抽样多个完成。然后将一个提示的完成随机显示给用户，以将它们从最好到最差进行排名。同样，这应该是众包的，例如，我们需要处理不可靠的潜在恶意用户。至少需要收集多个独立用户的投票，以测量总体一致性。收集的排名数据将用于训练奖励模型。
3. 现在根据提示和奖励模型进行 RLHF 训练阶段。

然后，我们可以采用产生的模型，并继续进行下一轮迭代的完成抽样步骤2。

### 幻灯片

- [愿景和路线图](https://docs.google.com/presentation/d/1n7IrAOVOqwdYgiYrXc8Sj0He8krn5MVZO_iLkCjTtu0/edit?usp=sharing)
- [重要数据结构](https://docs.google.com/presentation/d/1iaX_nxasVWlvPiSNs0cllR9L_1neZq0RJxd6MFEalUY/edit?usp=sharing)

### 如何帮助

所有开源项目都始于像您这样的人。

开源是一种信念，即如果我们合作，我们就能共同将我们的知识和技术赠送给世界，以造福人类。

查看我们的[贡献指南](CONTRIBUTING.md)以开始。

# 参考资料

https://github.com/LAION-AI/Open-Assistant

* any list
{:toc}
