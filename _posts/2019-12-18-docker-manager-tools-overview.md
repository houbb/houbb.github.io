---
layout: post
title:  Docker 常见编排管理工具介绍
date:  2019-12-18 11:34:23 +0800
categories: [Docker]
tags: [docker, k8, sh]
published: true
---

# 什么是编排？

编排（译者注：Orchestration，翻译为编排）是指同时管理多个容器的行为。

当你刚开始玩Docker的时候，你只需要操作一个容器。

紧接着你学习了网络并得知把所有进程都放入同一个容器中并不合适，然后不知不觉你就发现自己已经建立了多容器的基础架构。

你第一次尝试可能不会感到复杂，但是当使用两个或者三个容器的时候，你就会觉得很麻烦。

手动连接容器、管理卷，很快你就乱了，应该有更好更实用的工具来做这件事。

这个更实用的工具称为Fig。

# FIG

Fig 是Orchard的一个产品并很快成为自动化Docker容器编排一个事实标准，目前Fig已经被Docker公司收购并成为官方支持的解决方案。

Fig 是一个基于Docker的用于快速搭建开发环境的工具，目前Fig团队已经加入Docker公司。

Fig 通过一个配置文件来管理多个Docker容器，非常适合组合使用多个容器进行开发的场景。

Fig 可以和Docker一起来构建基于Docker的复杂应用。

本文详细介绍了Fig的安装以及使用。

## 安装

fig 只能运行在 liunx 系统。

目前在 windows 环境下无法使用。

直接使用 ubuntu 镜像先安装一下。

```
docker run -it a679032e6a0e /bin/bash
```

a679032e6a0e 是我本地的一个


# 其他编排工具

## Kubernetes

Kubernetes是市场上最重要、最受欢迎的容器编排引擎，简称K8S。

最初是Google的一个项目，现在成千上万的团队使用它来部署生产中的容器，谷歌声称每周使用Kubernetes运行数十亿个容器。

该工具通过将组成应用的容器分组为pods进行工作，以便于管理和发现。

![Kubernetes](http://5b0988e595225.cdn.sohucs.com/images/20180430/f4831051f6754de2b470a67ac6a95738.png)

## Docker Swarm

Swarm是Docker解决开发人员如何在许多服务器上编排和调度容器的问题。

Swarm已经被包含在Docker Engine中，并且提供了高级特性，例如服务发现，负载均衡，扩展和安全性。

它提供免费社区版

![swarm](http://5b0988e595225.cdn.sohucs.com/images/20180430/29ee9d43dc594d799fbaa5e4530f0eb1.png)

## Cloud Foundry Diego

Cloud Foundry使用Diego架构来管理"garden"环境中的应用容器。

Garden遵循Linux的Open Container Initiative容器托管指南，并通过Diego的其他组件提取。

Diego元素通过云控制器提供应用调度和管理功能。

![Cloud Foundry Diego](http://5b0988e595225.cdn.sohucs.com/images/20180430/e844ddba9f884b7e9edcc874f854af6f.jpeg)

## Marathon

Marathon是建立在Apache Mesos上的私有生产级平台即服务（PaaS）。

Marathon框架有望扩展Docker化应用，并在必要时扩展到更多节点以增加可用资源池。

它也可以作为一个容器编排工具，为容器化的工作负载提供故障恢复。

Marathon 自动处理硬件或软件故障，并确保应用程序"始终在线"。

![Marathon](http://5b0988e595225.cdn.sohucs.com/images/20180430/3b17ecc0a14347118226a2f70532456a.png)

## HashiCorp Nomad

在Linux，Mac和Windows的支持下，Nomad是一款能够调度所有虚拟化，Docker化和独立应用程序的单一二进制工具。

从单个容器到数千个群体，Nomad允许你在几分钟内于5000台主机上运行100万个容器。

Nomad通过在更少的服务器上有效地分配更多的应用程序来帮助提高密度，同时降低成本。

![HashiCorp Nomad](http://5b0988e595225.cdn.sohucs.com/images/20180430/0dca8c72b54e4cc795550980ba78e93b.png)

## Helios

Helios成为了Spotify的内部工具，可确保数百个微服务器在数千台服务器上高效工作。

它能够大规模部署和管理容器，并且配备了基于HTTP的API以及命令行客户端。

Helios不需要特定的网络拓扑; 它只需要一个ZooKeeper集群和一个运行该工具的机器上的JVM。

这是一个开源项目。

## Rancher

Rancher不仅仅是一个容器编排器，还是一个用于在生产环境中运行Docker的完整容器管理平台。

RancherOS是一个基于容器的操作系统（OS），能够提供许多基础架构服务，如全局和本地负载平衡，多主机联网和卷快照。

Rancher集成了本地Docker管理功能，如Docker Machine和Swarm。

![Rancher](http://5b0988e595225.cdn.sohucs.com/images/20180430/1f66952963bd4a76b55516260f9d0bc8.png)

## Nebula

Nebula是为Docker编排而创建的一个开源项目，旨在管理大规模集群。

该工具通过按需缩放每个项目组件来实现此目的。

该项目的目标是充当物联网设备的Docker Orchestrator，以及CDN或边缘计算等分布式服务。

Nebula能够通过一个API调用同时更新全球数以万计的物联网设备。

Nebula旨在帮助开发人员和操作人员处理物联网设备，就像分布式Docker化应用程序一样。

![Nebula](http://5b0988e595225.cdn.sohucs.com/images/20180430/f3f2c77e76914043b59211b70624767c.png)

# 拓展阅读

[K8S 入门学习](https://houbb.github.io/2018/08/18/docker-manager-k8-01-overview)

## 更多学习



# 参考资料

《第一本 Docker 书》

* any list
{:toc}
