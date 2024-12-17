---
layout: post
title: Devops-05-Devops roadMap
date:  2016-10-14 10:15:54 +0800
categories: [Devops]
tags: [devops, ci, sh]
published: true
---

# 拓展阅读

[Devops-01-devops 是什么？](https://houbb.github.io/2016/10/14/devops-01-overview)

[Devops-02-Jpom 简而轻的低侵入式在线构建、自动部署、日常运维、项目监控软件](https://houbb.github.io/2016/10/14/devops-02-jpom)

[代码质量管理 SonarQube-01-入门介绍](https://houbb.github.io/2016/10/14/devops-sonarqube-01-intro)

[项目管理平台-01-jira 入门介绍 缺陷跟踪管理系统，为针对缺陷管理、任务追踪和项目管理的商业性应用软件](https://houbb.github.io/2016/10/14/project-manage-jira-01-intro)

[项目管理平台-01-Phabricator 入门介绍 一套集成的强大工具，帮助公司构建更高质量的软件](https://houbb.github.io/2016/10/14/project-manage-phabricator-01-overview)

[持续集成平台 01 jenkins 入门介绍](https://houbb.github.io/2016/10/14/devops-jenkins-01-intro)

[持续集成平台 02 jenkins plugin 插件](https://houbb.github.io/2016/10/14/devops-jenkins-02-plugin)

# DevOps

1、PLAN   开发团队根据客户的目标指定开发计划
 
2、CODE    根据"PLAN(开发计划)" 开始编写代码，需要将不同版本("稳定"/"最新")的代码存储在一个库中
 
3、Build   代码编写完成后，需要将代码构建打包并且运行
 
4、Test    成功构建项目后，需要测试代码是否存在BUG或者错误
 
5、DEPLOY   代码经过"手动调试"和"自动化测试"后，认为可以部署了，选一个稳定版本部署
 
6、OPERATE   运维团队将代码部署到生产环境中
 
7、MONITOR   项目部署上线后，需要持续的监控产品
 
8、INTEGRATE   然后将监控阶段收到的反馈发送回PLAN阶段，整体反复的流程就是DEVOPS的核心(ci/cd)

# DevOps 路线图 2024

这是成为 DevOps 工程师的逐步指南，附带相关学习资源的链接。

如果你想了解更多关于 DevOps 的内容，务必订阅 **[我的新闻通讯](https://newsletter.techworld-with-milan.com/)**。

## 支持我的工作

如果你觉得这个资源库对你有帮助，可以通过 Patreon 支持我：

[![Patreon](patreon.png)](https://www.patreon.com/techworld_with_milan)

## 免责声明

> 这个路线图的目的是让你了解 DevOps 的整体发展方向。如果你不确定接下来应该学什么，它将为你提供一些指引，而不是鼓励你选择当前的流行或趋势工具。你应该理解为什么某个工具在某些情况下比其他工具更适用，并且记住，流行和趋势不总是意味着最适合该工作的工具。

## 给个星星！:star:

如果你喜欢或者正在使用这个项目来学习或开始你的解决方案，请给它点个星星，谢谢！

![DevOps 路线图](DevOps%20Roadmap.png)

## PDF 版本

[![DevOps 路线图](pdfversion.png)](DevOps%20Roadmap.pdf)

下载 [PDF 版本](DevOps%20Roadmap.pdf)。

## 目录

- [DevOps 工程师学习资源（大多免费）](#learning-resources-for-devops-engineers-mostly-free)
  - [1. GIT](#1-git)
  - [2. 学习一门编程语言](#2-learn-one-programming-language)
  - [3. 学习 Linux 与脚本编程](#3-learn-linux--scripting)
  - [4. 学习网络与安全](#4-learn-networking--security)
  - [5. 学习服务器管理](#5-learn-server-management)
  - [6. 学习容器](#6-learn-containers)
  - [7. 学习容器编排](#7-learn-container-orchestration)
  - [8. 学习基础设施即代码](#8-learn-infrastructure-as-a-code)
  - [9. 学习 CI/CD](#9-learn-cicd)
  - [10. 学习监控与可观察性](#10-learn-monitoring--observability)
  - [11. 学习一种云服务提供商](#11-learn-one-cloud-provider)
  - [12. 学习软件工程实践](#12-learn-software-engineering-practices)
- [其他资源](#additional-resources)
  - [工具](#tools)
  - [书籍](#books)

## DevOps 工程师学习资源（大多免费）

### 1. GIT

你所有的资源（文件）将保存在 Git 仓库中。这些文件不仅是 **应用程序代码**，也是 **基础设施即代码**。

**Git** 是一个免费的源代码管理工具，用于追踪源代码中的更改，允许多个开发者协同工作进行非线性开发。

最受欢迎的两个 Git 平台是 **GitLab** 和 **GitHub**。

你需要学习 Git 命令，比如 `git clone`、`git branch`、`git merge`，以及如何通过拉取请求协作开发项目。

学习资源：

- [Pro Git 书籍](https://git-scm.com/book/en/v2) <sup>免费</sup>
- [Atlassian 学习 Git](https://www.atlassian.com/git) <sup>免费</sup>
- [Learn Git Branching](https://learngitbranching.js.org/) <sup>免费</sup>
- [CodeAcademy 学习 Git & GitHub](https://www.codecademy.com/learn/learn-git) <sup>免费</sup>
- [Git Command Explorer](https://gitexplorer.com/) <sup>免费</sup>
- [Git Immersion](https://gitimmersion.com/index.html) <sup>免费</sup>
- [A Visual Git Reference](http://marklodato.github.io/visual-git-guide/index-en.html) <sup>免费</sup>

### 2. 学习一门编程语言

作为一名工程师，建议至少掌握一种编程语言，用于编写 **自动化脚本**。

一些适合 DevOps 的流行编程语言包括 **Python、Go 和 JavaScript**。

Python 是一门多范式语言。作为一种解释型语言，代码在编写后会立即执行，其语法允许以不同方式编写代码。

**Python** 常常被推荐作为新手程序员的第一门语言，因为它注重可读性、一致性和易用性。

在这里，你需要学习编程语言的基本概念，如语法、if/else 语句、循环、数据结构等。

学习资源：

- [《自动化无聊的事情》书籍](https://automatetheboringstuff.com/) <sup>免费</sup>
- [《Python 编程快速入门》](https://ehmatthes.github.io/pcc/) <sup>免费</sup>
- [《现代 JavaScript 教程》](https://javascript.info/) <sup>免费</sup>
- [《JavaScript 初学者快速教程》](https://www.youtube.com/watch?v=hdI2bqOjy3c) <sup>免费</sup>
- [《高效 JavaScript》第三版](https://eloquentjavascript.net/)，Marjin Haverbeke <sup>免费书籍</sup>
- [Go 示例教程](https://gobyexample.com/) <sup>免费</sup>

### 3. 学习 Linux 与脚本编程

操作系统作为计算机用户与硬件之间的桥梁，旨在提供一个用户可以方便有效地运行程序的环境。

由于大多数服务器使用 **Linux 操作系统**，你需要熟悉 Linux 及其命令行界面（CLI）。

一个易于入门的发行版是 **Ubuntu**。

此外，你还需要学习 **脚本编程**，以便自动化开发和运维任务。

在这里，你可以学习特定于操作系统的语言，如 **Bash 或 Powershell**，也可以选择跨平台的语言，如 Python 或 Go。

学习资源：

- [操作系统概述](https://www.tutorialspoint.com/operating_system/os_overview.htm) <sup>免费</sup>
- [Shell 脚本教程](https://www.shellscript.sh/) <sup>免费</sup>
- [PowerShell 初学者教程：学习 PowerShell 脚本编程](https://www.guru99.com/powershell-tutorial.html)  <sup>免费</sup>
- [Bash 参考手册](https://www.gnu.org/savannah-checkouts/gnu/bash/manual/bash.html) <sup>免费</sup>
- [终极指南：开始使用 Ubuntu](https://itsfoss.com/getting-started-with-ubuntu/) <sup>免费</sup>
- [FreeBSD 手册](https://docs.freebsd.org/en/books/handbook/) <sup>免费</sup>
- [Linux 命令手册](https://www.freecodecamp.org/news/the-linux-commands-handbook/) <sup>免费</sup>

### 4. 学习网络与安全

**网络协议** 是一套确定数据如何在同一网络中不同设备之间传输的规则。它使连接的设备能够相互通信，而不管它们的内部流程、结构或设计有何不同。

在这一部分，你需要了解网络是如何工作的，如何配置 **防火墙**，理解 **DNS** 的工作原理，**OSI 模型**，IP 地址，端口等。

学习资源：

- [OSI 模型解释](https://www.cloudflare.com/en-gb/learning/ddos/glossary/open-systems-interconnection-model-osi/) <sup>免费</sup>
- [计算机网络：自顶向下的方法](https://www.amazon.com/Computer-Networking-Top-Down-Approach-7th/dp/0133594149) <sup>书籍</sup> [视频内容](https://www.youtube.com/playlist?list=PLByK_3hwzY3Tysh-SY9MKZhMm9wIfNOas) <sup>视频</sup>
- [TCP/IP 和网络基础知识：为 IT 专业人员](https://www.pluralsight.com/courses/tcpip-networking-it-pros) <sup>Pluralsight 课程</sup>
- [DevSecOps：掌握 CI/CD 安全 | DevOps 流水线](https://www.udemy.com/course/devsecops/) <sup>Udemy 课程</sup>
- [在 DevOps 中的安全实践：确保持续的安全性、部署和交付](https://www.amazon.com/Hands-Security-DevOps-continuous-deployment/dp/1788995503) <sup>书籍</sup>
- [Securing DevOps: 安全云](https://www.amazon.com/Securing-DevOps-Security-Julien-Vehent/dp/1617294136/) <sup>书籍</sup>

### 5. 学习服务器管理

服务器管理包括所有必需的基础设施监控和维护，确保服务器能够可靠运行并保持最佳性能。**有效的服务器管理策略**的主要目标是：

- 最小化服务器的慢响应和停机时间，同时最大化可靠性。
- 构建安全的服务器环境。
- 随着时间推移，根据组织的需求扩展服务器及相关操作。

在这一部分，你需要了解 **正向代理与反向代理**、**缓存服务器**，以及如何操作 **Web 服务器**，如 Nginx、Apache 或 IIS。

学习资源：

- [什么是反向代理？](https://www.cloudflare.com/en-gb/learning/cdn/glossary/reverse-proxy/) <sup>免费</sup>
- [缓存服务器](https://networkencyclopedia.com/cache-server/) <sup>免费</sup>
- [正向代理与反向代理：区别](https://oxylabs.io/blog/reverse-proxy-vs-forward-proxy) <sup>免费</sup>
- [什么是负载均衡？](https://www.cloudflare.com/en-gb/learning/performance/what-is-load-balancing/) <sup>免费</sup>
- [什么是防火墙？](https://www.checkpoint.com/cyber-hub/network-security/what-is-firewall/) <sup>免费</sup>
- [NGINX 手册](https://www.freecodecamp.org/news/the-nginx-handbook/) <sup>免费</sup>
- [学习 Apache 服务器](https://www.twaino.com/en/blog/website-creation/apache-server-2/) <sup>免费</sup>
- [学习 IIS](https://www.dnsstuff.com/windows-iis-server-tools) <sup>免费</sup>

### 6. 学习容器

**容器** 是一种标准的软件单元，打包了代码及其所有依赖，使得应用程序可以在不同的计算环境中快速、可靠地运行。

**Docker** 是目前最流行的容器技术。

Docker 容器镜像是一个轻量级、独立的可执行软件包，包含了运行应用程序所需的一切：代码、运行时、系统工具、系统库和设置。

你需要了解如何运行容器，Docker 网络、卷、Dockerfile 以及如何使用 Docker-Compose 启动多个容器。

学习资源：

- [什么是容器？](https://cloud.google.com/learn/what-are-containers) <sup>免费</sup>
- [从基础开始学习容器](https://iximiuz.com/en/posts/container-learning-path/) <sup>免费</sup>
- [Docker 初学者教程 by TechWorld with Nana](https://www.youtube.com/watch?v=3c-iBn73dDE) <sup>免费</sup>
- [Docker 精通：从 Docker Captain 学 Kubernetes + Swarm](https://www.udemy.com/course/docker-mastery/) <sup>Udemy 课程</sup>
- [什么是服务网格？](https://www.redhat.com/en/topics/microservices/what-is-a-service-mesh) <sup>免费</sup>
- [使用 Kubernetes 进行 DevOps](https://devopswithkubernetes.com/) <sup>免费</sup>

### 7. 学习容器编排

容器编排 **自动化** 容器的部署、管理、扩展和网络配置。

容器编排可用于任何使用容器的环境。它可以帮助你在不同的环境中部署相同的应用程序，而无需重新设计它。而且，容器中的微服务使得编排服务变得更容易，包括存储、网络和安全。

你需要了解 **Kubernetes** 的工作原理，以及如何管理 Kubernetes 集群并在其上部署应用程序。

学习资源：

- [Kubernetes 初学者速成课程 by TechWorld with Nana](https://www.youtube.com/watch?v=s_o8dwzRlu4) <sup>免费</sup>
- [Kubernetes 起源、发展及重要性](https://thenewstack.io/primer-how-kubernetes-came-to-be-what-it-is-and-why-you-should-care/) <sup>文章</sup>
- [认证 Kubernetes 管理员（CKA）与练习测试](https://www.udemy.com/course/certified-kubernetes-administrator-with-practice-tests/) <sup>Udemy 课程</sup>
- [从零到精通 Kubernetes 课程 by KodeKloud](https://kodekloud.com/learning-path-kubernetes/) <sup>课程</sup>
- [了解何时使用集群服务、Ingress 或 API 网关](https://gateway-api.sigs.k8s.io) <sup>免费</sup>
- [了解服务网格解决的难题（使用抽象 smi-spec.io）](https://linkerd.io/2.12/features/) <sup>免费</sup>
- [学习如何自动化 TLS](https://cert-manager.io/docs/) 和 [DNS](https://github.com/kubernetes-sigs/external-dns) <sup>免费</sup>
- [Kubernetes 从入门到精通](https://www.amazon.com/_/dp/1491935677?tag=oreilly20-20) <sup>书籍</sup>
- [Kubernetes 学习路径 - 从零到英雄，微软 50 天学习计划](https://azure.microsoft.com/en-us/resources/kubernetes-learning-path/) <sup>免费</sup>

### 8. 学习基础设施即代码（IaC）

**IaC**，即基础设施即代码，指的是使用技术和工具来定义基础设施，通常采用 YAML 或 JSON 等标记语言。基础设施即代码使工程师能够自动化环境的设置和拆除，通过按需提供黄金复制环境，加速并降低部署风险。

**Terraform** 是最流行的基础设施配置工具，还有其他工具，如 Ansible、Chef、Puppet 和 Vagrant。

你需要了解如何进行 **基础设施配置** 和 **配置管理**。

学习资源：

- [GUI、CLI、API：学习基础设施即代码的基本术语](https://thenewstack.io/guis-cli-apis-learn-basic-terms-of-infrastructure-as-code/) <sup>免费</sup>
- [官方 Terraform 教程](https://learn.hashicorp.com/terraform) <sup>免费</sup>
- [Terraform 综合指南](https://blog.gruntwork.io/a-comprehensive-guide-to-terraform-b3d32832baca) <sup>免费</sup>
- [像专业人士一样自动化 Terraform 文档！](https://medium.com/google-cloud/automate-terraform-documentation-like-a-pro-ed3e19998808) <sup>免费</sup>
- [编写可复用的 Terraform 模块](https://thomasthornton.cloud/2022/06/02/writing-reusable-terraform-modules/) <sup>免费</sup>
- [什么是 Istio？](https://www.redhat.com/en/topics/microservices/what-is-istio) <sup>免费</sup>
- [Puppet 概览](https://puppet.com/docs/puppet/latest/puppet_overview.html) <sup>免费</sup>
- [Puppet 课程](https://training.puppet.com/) <sup>免费和付费</sup>
- [Ansible 入门](https://docs.ansible.com/ansible/latest/getting_started/) <sup>免费</sup>
- [学习 Ansible 基础](https://www.redhat.com/en/topics/automation/learning-ansible-tutorial)
- [开始使用 Red Hat Ansible](https://www.ansible.com/resources/get-started) <sup>免费和付费</sup>
- [精通 Ansible](https://www.udemy.com/course/mastering-ansible/) <sup>Udemy 课程</sup>
- [学习 Chef](https://learn.chef.io/) <sup>免费</sup>

### 9. 学习 CI/CD

**持续集成/持续部署 (CI/CD)** 是一种通过将 **自动化** 引入到应用程序开发的各个阶段，从而频繁地向客户交付应用程序的方法。CI/CD 是解决集成新代码可能对开发和运维团队造成问题的解决方案。

CI/CD 引入了持续的自动化和 **持续的** 监控，贯穿于应用程序的整个生命周期，从集成和测试阶段到交付和部署阶段。这些连接的实践通常被称为 "**CI/CD 管道**"，并由开发和运维团队支持。

CI/CD 管道包含 **不同阶段**，例如：**构建、测试和部署**，但可能还包括更多的活动：

- 从版本控制中检查代码并进行构建
- 设置不同类型的批准阶段
- 管理环境变量
- 重启服务
- 执行测试
- 以及更多...

你需要了解如何设置 CI/CD 服务器，集成代码并自动触发管道，以及构建和包管理工具。

一些 **流行的 CI/CD 工具** 包括 Jenkins、TeamCity、CircleCI、Bamboo、GitLab 和 Azure DevOps。

学习资源：

- [持续集成](https://martinfowler.com/articles/continuousIntegration.html) <sup>免费</sup>
- [CI/CD 管道：温和的入门介绍](https://semaphoreci.com/blog/cicd-pipeline) <sup>免费</sup>
- [GitLab 教程](https://docs.gitlab.com/ee/tutorials/) <sup>免费</sup>
- [开始使用 GitLab CI/CD](https://docs.gitlab.com/ee/ci/quick_start/) <sup>免费</sup>
- [Jenkins，从零到英雄：成为 DevOps Jenkins 大师](https://www.udemy.com/course/jenkins-from-zero-to-hero) <sup>Udemy 课程</sup>
- [学习 GitHub Actions](https://learn.microsoft.com/en-us/users/githubtraining/collections/n5p4a5z7keznp5) <sup>免费</sup>
- [GitHub Actions 的工作流语法](https://docs.github.com/en/actions/using-workflows/workflow-syntax-for-github-actions) <sup>免费</sup>
- [学习 Azure DevOps](https://milan.milanovic.org/post/ci-cd-with-azure-devops-yaml/) <sup>免费</sup>
- [GitLab Cheatsheets](https://dev.to/jphi_baconnais/series/12928) <sup>免费</sup>

### 10. 学习监控与可观察性

监控涉及从规划、开发、集成与测试、部署到运营的整个开发过程。它提供了对生产环境中应用程序、服务和基础设施状态的完整和 **实时的视图**。

当我们的软件处于 **生产环境** 中时，尤其需要跟踪我们基础设施和应用程序中的各种问题。

最流行的两种工具是 **Prometheus** 和 **Grafana**。

你需要了解如何设置监控并可视化数据。

学习资源：

- [什么是可观察性？全面的初学者指南](https://devopscube.com/what-is-observability/) <sup>免费</sup>
- [监控微服务的方式、原因和背景](https://thenewstack.io/the-hows-whys-and-whats-of-monitoring-microservices/) <sup>免费</sup>
- [DevOps 监控](https://www.atlassian.com/devops/devops-tools/devops-monitoring) <sup>免费</sup>
- [应用基本与高级监控技术](https://thenewstack.io/applying-basic-vs-advanced-monitoring-techniques/) <sup>免费</sup>
- [学习 Prometheus](https://prometheus.io/docs/tutorials/getting_started/) <sup>免费</sup>
- [学习 Grafana](https://grafana.com/tutorials/) <sup>免费</sup>
- [Elastic Stack](https://www.elastic.co/guide/index.html) <sup>免费</sup>

### 11. 学习一个云服务提供商

云服务提供商提供了一层 API 用于抽象基础设施，并根据安全性和计费边界进行资源配置。

虽然云服务运行在数据中心的服务器上，但通过巧妙的抽象，使得与单一 "平台" 或大型应用程序的交互成为可能。

通过云服务提供商快速配置、管理和保护资源的能力，是现代 DevOps 成功和复杂性的关键。

目前市场上最流行的云服务提供商是 **AWS**、**Azure** 和 **Google Cloud**。

你需要了解如何管理用户与管理、网络、虚拟服务器等。

学习资源：

- [考试 AZ-900：微软 Azure 基础](https://learn.microsoft.com/en-us/certifications/exams/az-900) <sup>免费</sup>
- [微软 Azure 基础认证课程（AZ-900）](https://www.youtube.com/watch?v=NKEFWyqJ5XA) <sup>免费</sup>
- [AZ-900 | 微软 Azure 基础全课程、免费练习测试、网站与学习指南](https://www.youtube.com/watch?v=NPEsD6n9A_I&list=PLGjZwEtPN7j-Q59JYso3L4_yoCjj2syrM) <sup>免费</sup>
- [终极 AWS 认证云从业者 - 2022](https://www.udemy.com/course/aws-certified-cloud-practitioner-new) <sup>Udemy</sup>
- [AWS 开发者 by A Cloud Guru](https://acloudguru.com/learning-paths/aws-developer) <sup>学习路径</sup>

### 12. 学习软件工程实践

作为一名 DevOps 工程师，你可能会与其他开发人员一起工作在敏捷环境中，例如 **Scrum**。

因此，了解 **SDLC** 的不同部分，以及其中使用的工具非常重要。

此外，了解 **自动化测试** 的工作原理也是一个好主意，因为你需要在 CI/CD 中设置它。

你需要了解 **Scrum**、**SDLC** 的所有阶段，以及 **自动化测试** 的工作原理等。

学习资源：

- [什么是 Scrum？](https://www.atlassian.com/agile/scrum) <sup>免费</sup>
- [了解 Scrum 的方式](https://www.scrum.org/resources/ways-learn-about-scrum) <sup>免费</sup>
- [软件开发生命周期（SDLC）阶段与模型](https://www.guru99.com/software-development-life-cycle-tutorial.html) <sup>免费</sup>
- [Jira 中的敏捷初学者指南：课程介绍](https://university.atlassian.com/student/page/1117976-the-beginner-s-guide-to-agile-in-jira-course-description?sid_i=8) <sup>免费</sup>
- [学习 SAFe](https://www.scaledagileframework.com/) <sup>免费</sup>
- [学习自动化测试](https://blog.testproject.io/2020/03/26/automation-testing-for-beginners-ultimate-guide/) <sup>免费</sup>
- [GitLab - DevOps 初学者指南](https://page.gitlab.com/resources-ebook-beginners-guide-devops.html) <sup>免费</sup>
- [常见 SDLC 模型](https://www.scaler.com/blog/software-development-life-cycle/#common-sdlc-models) <sup>免费</sup>

## 额外资源

### 工具

- **工作跟踪**：**[Asana](https://asana.com/)**，**[Monday](https://monday.com/)**，**[Jira](https://www.atlassian.com/software/jira)**，**[Trello](https://trello.com/)**，**[Azure Boards](https://azure.microsoft.com/en-au/products/devops/boards/)**。
- **源代码控制**：**[Git](https://git-scm.com/)**，**[Github](https://github.com/)**，**[GitLab](https://about.gitlab.com/)**，**[BitBucket](https://bitbucket.org/)**，**[Azure DevOps](https://azure.microsoft.com/en-us/products/devops)**。
- **CI/CD**：**[Jenkins](https://www.jenkins.io/)**，**[Team City](https://www.jetbrains.com/teamcity/)**，**[Github Actions](https://github.com/features/actions)**，**[Travis CI](https://www.travis-ci.com/)**，**[Bamboo](https://www.atlassian.com/software/bamboo)**，**[Circle CI](https://circleci.com/)**，**[Azure Pipelines](https://azure.microsoft.com/en-us/products/devops/pipelines/)**，**[Octopus Deploy](https://octopus.com/)**，**[Harness](https://www.harness.io/)**，**[CloudBees CodeShip](https://www.cloudbees.com/products/codeship)**。
- **源代码分析**：**[SonarQube](https://www.sonarsource.com/products/sonarqube/)**，**[Veracode](https://www.veracode.com/)**。
- **构件管理**：**[Artifactory](https://jfrog.com/artifactory/)**，**[Docker 容器注册](https://docs.docker.com/registry/)**，**[npm](https://www.npmjs.com/)**，**[Yarn](https://yarnpkg.com/)**，**[NuGet](https://www.nuget.org/)**。
- **配置管理**：**[Terraform](https://www.terraform.io/)**，**[Ansible](https://www.ansible.com/)**，**[Puppet](https://www.puppet.com/)**，**[Chef](https://www.chef.io/)**。
- **容器编排**：**[Docker](https://www.docker.com/)**，**[Kubernetes](https://kubernetes.io/)**，**[Red Hat OpenShift](https://www.redhat.com/en/technologies/cloud-computing/openshift)**。
- **监控**：**[Prometheus](https://prometheus.io/)**，**[Grafana](https://grafana.com/)**，**[Splunk](https://www.splunk.com/)**，**[Dynatrace](https://www.dynatrace.com/)**，**[Kibana](https://www.elastic.co/kibana/)**。

![DevOps 路线图](devops%20tools.png)

### 书籍

- **[DevOps 手册：如何在技术组织中创建世界级的敏捷性、可靠性和安全性](https://amzn.to/3IJPv0h)**，Gene Kim, Patrick Debois, John Willis, Jez Humble

    本书介绍了产品开发、质量保证、IT 运维和信息安全。对于新接触 DevOps 或想深入了解 DevOps 各个组成部分如何协同工作的人来说，是一本很好的读物。

- **[Accelerate: 精益软件与 DevOps 科学：构建与扩展高性能技术组织](https://amzn.to/3XRShoA)**，Nicole Forsgren, Jez Humble, Gene Kim

    本书介绍了如何衡量软件交付性能的发现和科学。对于向高层管理推广 DevOps，是一本极好的工具书。

- **[持续交付：通过构建、测试和部署自动化实现可靠的软件发布](https://amzn.to/3XRShoA)**，Jez Humble, David Farley

    本书介绍了自动化架构管理和数据迁移的概念。许多后来成为标准的部署流水线概念均来自这本书。涵盖了配置即代码、构建与部署自动化以及高效的测试技术等内容。

- **[团队拓扑：为快速流动组织业务和技术团队](https://amzn.to/3Zb83fl)**，Matthew Skelton, Manuel Pais

    本书讨论了如何组织团队，以便能够快速将价值传递给客户。它提供了四种基本的团队拓扑：流线型团队、赋能团队、复杂子系统团队和平台团队，可以根据不同的组织背景进行组合和调整。

- **[有效的 DevOps：在大规模范围内构建协作、亲和力和工具文化](https://amzn.to/3Za5aLH)**，Jennifer Davis, Ryn Daniels

    本书提供了有效的团队协调方法，展示了如何打破信息孤岛、监控关系，并修复团队之间和团队内部可能出现的误解。

- **[凤凰计划：关于 IT、DevOps 和帮助您的业务获胜的小说](https://amzn.to/3Z6VSQG)**，Gene Kim, Kevin Behr, George Spafford

    这是一本关于工作效率和沟通的经典小说。IT 工作就像是制造工厂的工作，必须建立系统来简化工作流程。它是一本值得一读的书。

- **[站点可靠性工程](https://sre.google/books/)**，Betsy Beyer, Chris Jones, Jennifer Petoff, Niall Richard Murphy

    本书解释了 Google 开发、部署和监控的整个生命周期，以及如何管理世界上最大的软件系统（即 SRE）。任何自认为偏向 DevOps 中 "Ops" 方面的人员，或想加强 Dev 和 Ops 团队之间联系的人都应该阅读这本书。

![DevOps 书籍](DevOpsBooks.jpg)

## DevOps 作为汉堡包（DaaB）

我们甚至可以将这个路线图展示为一个汉堡包：)

![DevOps 作为汉堡包](DevOpsBurger.jpg)

## 结语

如果您认为路线图可以改进，请提交 PR 进行更新，并提交任何问题。同时，我会继续改进此路线图，您可能希望将此仓库收藏，以便以后访问。

## 贡献

- 提交带有改进的 Pull Request
- 在问题中讨论想法
- 扩散消息

## 许可证

[![许可证](https://img.shields.io/badge/License-Apache_2.0-blue.svg)](https://opensource.org/licenses/Apache-2.0)

## 作者

- [Dr. Milan Milanović](https://milan.milanovic.org) -  3MD 首席技术官
- [Romano Roth](https://romanoroth.com) - Zühlke 首席 DevOps 专家

* any list
{:toc}



