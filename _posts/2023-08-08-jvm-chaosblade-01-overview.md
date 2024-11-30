---
layout: post
title: ChaosBlade-01-测试混沌工程平台整体介绍
date:  2023-08-08 +0800
categories: [JVM]
tags: [jvm, bytebuddy, bytecode, chaos-engineering, sh]
published: true
---

# 简介

ChaosBlade 是阿里巴巴 2019 年开源的混沌工程项目，包含混沌工程实验工具 chaosblade 和混沌工程平台 chaosblade-box，旨在通过混沌工程帮助企业解决云原生过程中高可用问题。

实验工具 chaosblade 支持 3 大系统平台，4 种编程语言应用，共涉及 200 多的实验场景，3000 多个实验参数，可以精细化的控制实验范围。 

混沌工程平台 chaosblade-box 支持实验工具托管，除已托管 chaosblade 外，还支持 Litmuschaos 实验工具。

已登记使用企业 40 多家，其中已在工商银行、中国移动、小米、京东等企业中落地使用。

# 特性优势

ChaosBlade 具有以下核心优势特性：

丰富的实验场景：包含基础资源（CPU、内存、网络、磁盘、进程、内核、文件等）、多语言应用服务（Java、C++、NodeJS、Golang 等）、Kubernetes 平台（覆盖 Container、Pod、Node 资源场景，包含上述实验场景）。

多维度实验方式：支持从主机到 Kubernetes 资源，再到应用维度进行实验编排。

多样化的执行方式：除了使用平台白屏化操作，还可以通过工具自带的 blade 工具或者 kubectl、编码的方式执行。

便捷的场景扩展能力：所有的实验场景遵循混沌实验模型实现，并且不同层次场景对应不同的执行器，实现简单，易于扩展。

实验工具自动化部署：无需手动部署实验工具，实现实验工具在主机或集群上自动化部署。

支持开源实验工具托管：平台可托管业界主流的实验工具，如自身的 chaosblade 和外部的 litmuschaos 等。

统一混沌实验用户界面：用户无需关心不同工具的使用方式，在统一用户界面进行混沌实验。

集成云原生生态：采用 Helm 部署管理，集成 Prometheus 监控，支持云原生实验工具托管等。

# 架构概览

![struct](https://chaosblade.io/assets/images/overall-architecture-7e874671c3f84bc5392272edad1453dc.png)

ChaosBlade 支持多种环境部署与演练，包括 linux、docker、kubernetes 集群及各类云厂商环境。

ChaosBlade 主要包括以下几个组件：

ChaosBlade-Box Console：ChaosBlade 可视化组件，主要提供一套用户友好的 Web 界面，用户可以通过该界面进行混沌工程实验的编排与操作管理。

ChaosBlade-Box Server：核心逻辑组件，主要负责混沌工程实验的管理与编排，探针与应用管理。包括组件，Chaos Engine：演练引擎，包括流程编排、安全管控、演练报告等功能；Chaos Runner：演练执行器，兼容多种执行工具；Chaos Experinece：演练经验库等。

Agent：核心逻辑组件，部署在用户终端的主机或 Kubernetes 集群内，主要负责和 ChaosBlade-Box Server 建联上报心跳并作为命令下发通道。

ChaosBlade：主要执行工具，能在主机和 Kubernetes 等不同环境上执行故障注入，能对系统网络设备、文件系统、内核及系统上运行的应用等进行故障干扰。

# 规划

ChaosBlade 未来以云原生为基础，提供面向多集群、多环境、多语言的混沌工程平台和混沌工程实验工具。

实验工具继续聚焦在实验场景丰富度和稳定性方面，支持更多的 Kubernetes 资源场景和规范应用服务实验场景标准，提供多语言实验场景标准实现。

混沌工程平台聚焦在简化混沌工程部署实施方面，后续会托管更多的混沌实验工具和兼容主流的平台，实现场景推荐，提供业务、系统监控集成，输出实验报告，在易用的基础上完成混沌工程操作闭环。

# ChaosBlade 工具使用快速入门

本文档介绍如何直接通过端侧工具 ChaosBlade 运行混沌工程实验

## 简介

混沌工程实验除了可以通过可视化界面，直接进行编排和注入，ChaosBlade 混沌工程端侧工具本身也可直接执行，其本身支持以下多种方式运行：

Cli 命令行模式：直接通过命令行方式执行演练，可直接执行主机环境和 Kubernetes 环境下运行
Yaml 文件模式：该方式只对 Kubernetes 集群进行演练时使用，使用 yaml 配置文件创建演练 通过定义 chaosblade crd 资源的方式
Server 模式：即利用./blade server start 将 ChaosBlade 工具作为一个 server 启动，然后再通过 http 远程调用的方式下发命令

## 实验准备

第一步，工具包下载

下载二进制工具包 chaosblade-1.7.2-linux-amd64.tar.gz

```
wget https://github.com/chaosblade-io/chaosblade/releases/download/v1.7.2/chaosblade-1.7.2-linux-amd64.tar.gz
```

第二步，工具解压

```
tar -xvf chaosblade-1.7.2-linux-amd64.tar.gz -o /opt/chaosblade
```

## 准备验证

进入解压包本地所放置的路径，通过./blade version或./blade v来查看是否可用，预期结果如下：

```
[root@test chaosblade]# cd /opt/chaosblade
[root@test chaosblade]# ./blade version
version: 1.7.2
env: #1 SMP Tue May 26 11:42:35 UTC 2020 x86_64
build-time: Thu Oct 20 02:18:52 UTC 2022
```





# 参考资料

https://chaosblade.io/docs

* any list
{:toc}