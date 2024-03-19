---
layout: post
title: Docker-官方教程-00-Overview
date:  2019-12-18 11:34:23 +0800
categories: [Docker]
tags: [docker, sh]
published: true
excerpt: Docker Overview 概览
---

# Docker 概览

Docker是一个开发，运输和运行应用程序的开放平台。 

Docker使您可以将应用程序与基础架构分离，以便快速交付软件。 

使用Docker，您可以像管理应用程序一样管理基础架构。 

通过利用Docker的方法快速发送，测试和部署代码，您可以显着减少编写代码和在生产中运行代码之间的延迟。

# Docker平台

Docker提供了在称为容器的松散隔离环境中打包和运行应用程序的功能。

隔离和安全性允许您在给定主机上同时运行多个容器。容器是轻量级的，因为它们不需要管理程序的额外负载，而是直接在主机内核中运行。

这意味着您可以在给定硬件组合上运行比使用虚拟机时更多的容器。

您甚至可以在实际虚拟机的主机中运行Docker容器！

Docker提供工具和平台来管理容器的生命周期：

1. 使用容器开发应用程序及其支持组件。

2. 容器成为分发和测试应用程序的单元。

3. 准备就绪后，将应用程序部署到生产环境中，作为容器或协调服务。无论您的生产环境是本地数据中心，云提供商还是两者的混合，这都是一样的。

# Docker 引擎

Docker Engine是一个客户端 - 服务器应用程序，包含以下主要组件：

1. 服务器，是一种长时间运行的程序，称为守护程序进程（dockerd命令）。

2. 一个REST API，它指定程序可以用来与守护进程通信并指示它做什么的接口。

3. 命令行界面（CLI）客户端（docker命令）。

![engine-components-flow](https://docs.docker.com/engine/images/engine-components-flow.png)

CLI使用Docker REST API通过脚本或直接CLI命令控制Docker守护程序或与之交互。 

许多其他Docker应用程序使用底层API和CLI。

守护程序创建和管理Docker对象，例如图像，容器，网络和卷。

注意：Docker是根据开源Apache 2.0许可证授权的。

有关更多详细信息，请参阅下面的Docker Architecture。

# Docker 能做什么

## 快速，一致地交付您的应用程序

Docker允许开发人员使用提供应用程序和服务的本地容器在标准化环境中工作，从而简化了开发生命周期。

容器非常适合持续集成和持续交付（CI / CD）工作流程。

请考虑以下示例场景：

1. 您的开发人员在本地编写代码并使用Docker容器与同事共享他们的工作。

2. 他们使用Docker将他们的应用程序推入测试环境并执行自动和手动测试。

3. 当开发人员发现错误时，他们可以在开发环境中修复它们，并将它们重新部署到测试环境中进行测试和验证。

4. 测试完成后，获取客户的修复就像将更新的图像推送到生产环境一样简单。

5. 响应式部署和扩展

## Docker基于容器的平台允许高度可移植的工作负载。 

Docker容器可以在开发人员的本地笔记本电脑上，在数据中心的物理或虚拟机上，在云提供商上，或在混合环境中运行。

Docker的可移植性和轻量级特性还可以轻松地动态管理工作负载，按照业务需求即时扩展或拆除应用程序和服务。

## 在同一硬件上运行更多工作负载

Docker轻巧而快速。它为基于管理程序的虚拟机提供了一种可行的，经济高效的替代方案，因此您可以使用更多的计算容量来实现业务目标。 

Docker非常适合高密度环境以及需要用更少资源完成更多工作的中小型部署。


# Docker架构

Docker使用客户端 - 服务器架构。 

Docker客户端与Docker守护进程通信，后者负责构建，运行和分发Docker容器。 

Docker客户端和守护程序可以在同一系统上运行，也可以将Docker客户端连接到远程Docker守护程序。 

Docker客户端和守护程序使用REST API，通过UNIX套接字或网络接口进行通信。

![architecture.svg](https://docs.docker.com/engine/images/architecture.svg)

## Docker守护进程

Docker守护程序（dockerd）侦听Docker API请求并管理Docker对象，如图像，容器，网络和卷。守护程序还可以与其他守护程序通信以管理Docker服务。

## Docker客户端

Docker客户端（docker）是许多Docker用户与Docker交互的主要方式。

当您使用诸如docker run之类的命令时，客户端会将这些命令发送到dockerd，后者将其执行。 docker命令使用Docker API。 Docker客户端可以与多个守护进程通信。

## Docker注册表

Docker注册表存储Docker镜像。 Docker Hub和Docker Cloud是任何人都可以使用的公共注册表，Docker配置为默认在Docker Hub上查找图像。

您甚至可以运行自己的私人注册表。如果您使用Docker Datacenter（DDC），它包括Docker Trusted Registry（DTR）。

使用docker pull或docker run命令时，将从配置的注册表中提取所需的映像。

使用docker push命令时，映像将被推送到配置的注册表。

Docker商店允许您购买和出售Docker图像或免费分发。

例如，您可以从软件供应商处购买包含应用程序或服务的Docker映像，并使用该映像将应用程序部署到测试，登台和生产环境中。您可以通过提取新版本的映像并重新部署容器来升级应用程序。

## Docker对象

使用Docker时，您将创建和使用图像，容器，网络，卷，插件和其他对象。 

本节简要介绍其中一些对象。

### image

图像是一个只读模板，其中包含有关创建Docker容器的说明。

通常，图像基于另一个图像，并带有一些额外的自定义。例如，您可以构建基于ubuntu映像的映像，但安装Apache Web服务器和应用程序，以及运行应用程序所需的配置详细信息。

您可以创建自己的图像，也可以只使用其他人创建的图像并在注册表中发布。

要构建自己的映像，可以使用简单的语法创建Dockerfile，以定义创建映像和运行映像所需的步骤。 

Dockerfile中的每条指令都在图像中创建一个图层。更改Dockerfile并重建映像时，仅重建已更改的那些层。

与其他虚拟化技术相比，这是使图像如此轻量，小巧和快速的部分原因。

### container

容器是图像的可运行实例。您可以使用Docker API或CLI创建，启动，停止，移动或删除容器。

您可以将容器连接到一个或多个网络，将存储连接到它，甚至可以根据其当前状态创建新映像。

默认情况下，容器与其他容器及其主机相对隔离。您可以控制容器的网络，存储或其他基础子系统与其他容器或主机的隔离程度。

容器由其图像以及您在创建或启动时为其提供的任何配置选项定义。删除容器后，对其状态的任何未存储在持久存储中的更改都将消失。

### service

服务允许您跨多个Docker守护程序扩展容器，这些守护程序一起作为具有多个管理器和工作程序的群组一起工作。 

swarm的每个成员都是Docker守护程序，并且守护进程都使用Docker API进行通信。 

服务允许您定义所需的状态，例如在任何给定时间必须可用的服务的副本数。 

默认情况下，服务在所有工作节点之间进行负载平衡。 

对于消费者来说，Docker服务似乎是一个单独的应用程序。 Docker Engine支持Docker 1.12及更高版本中的swarm模式。


# 基础技术

Docker是用Go编写的，它利用Linux内核的几个功能来提供其功能。

## 命名空间

Docker使用称为命名空间的技术来提供称为容器的隔离工作空间。当您运行容器时，Docker会为该容器创建一组名称空间。

这些命名空间提供了一层隔离。容器的每个方面都在一个单独的命名空间中运行，其访问权限仅限于该命名空间。

Docker Engine在Linux上使用以下命名空间：

```
pid命名空间：进程隔离（PID：进程ID）。
net命名空间：管理网络接口（NET：Networking）。
ipc名称空间：管理对IPC资源的访问（IPC：进程间通信）。
mnt命名空间：管理文件系统挂载点（MNT：Mount）。
uts命名空间：隔离内核和版本标识符。 （悉尼科技大学：Unix分时系统）。
```

## 对照组

Linux上的Docker Engine还依赖于另一种称为控制组（cgroups）的技术。 cgroup将应用程序限制为特定的一组资源。控制组允许Docker Engine将可用的硬件资源共享给容器，并可选择强制执行限制和约束。例如，您可以限制特定容器的可用内存。

## 联盟文件系统

联合文件系统或UnionFS是通过创建层来操作的文件系统，使它们非常轻量和快速。 

Docker Engine使用UnionFS为容器提供构建块。 

Docker Engine可以使用多种UnionFS变体，包括AUFS，btrfs，vfs和DeviceMapper。

## 容器格式

Docker Engine将命名空间，控制组和UnionFS组合到一个称为容器格式的包装器中。

默认的容器格式是libcontainer。

将来，Docker可以通过与BSD Jails或Solaris Zones等技术集成来支持其他容器格式。

# 参考资料

https://docs.docker.com/engine/docker-overview/

* any list
{:toc}