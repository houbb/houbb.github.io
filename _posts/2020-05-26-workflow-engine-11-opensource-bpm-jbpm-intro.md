---
layout: post
title: 工作流引擎-10-开源 BPM 项目 jbpm
date:  2020-5-26 16:05:35 +0800
categories: [Engine]
tags: [engine, workflow-engine, workflow, bpm, flow]
published: true
---


## 快速链接

**主页：** [http://jbpm.org/](http://jbpm.org/)

**业务应用：** [https://start.jbpm.org/](https://start.jbpm.org/)

**文档：** [https://docs.jboss.org/jbpm/release/latestFinal/jbpm-docs/html\_single/](https://docs.jboss.org/jbpm/release/latestFinal/jbpm-docs/html_single/)

**JIRA 问题追踪：** [https://issues.jboss.org/projects/JBPM/summary](https://issues.jboss.org/projects/JBPM/summary)

## 关于 jBPM

**jBPM** 是一个用于构建业务应用程序的工具包，旨在帮助自动化业务流程和决策。

**jBPM** 可以作为独立服务使用，也可以嵌入到自定义服务中。它不依赖于任何特定框架，可灵活地用于：

* 传统 JEE 应用程序（war/ear 部署）
* SpringBoot 或 Thorntail（前称 WildFly Swarm）- uberjar 部署
* 独立的 Java 程序

**jBPM** 是开源软件，遵循 Apache 软件许可证发布。

它完全由 Java™ 编写，可运行在任何 JVM 上，同时也可在 Maven Central 仓库中获取。

## 从源码构建

1. 获取源码：

```
git clone git@github.com:kiegroup/jbpm.git
```

如果你没有 GitHub 账号，可以使用以下命令：

```
git clone https://github.com/kiegroup/jbpm.git jbpm
```

2. 使用 Maven 构建：

```
cd jbpm
mvn clean install -DskipTests
```

## 参与贡献 jBPM

欢迎所有贡献！在开始之前，请阅读 [开发 Drools 和 jBPM 指南](https://github.com/kiegroup/droolsjbpm-build-bootstrap/blob/main/README.md)。

## 获取帮助

点击 [此链接](http://jbpm.org/community/getHelp.html) 获取以下内容的信息：

* **在用户组提问**
* **报告**和**创建问题**
* 与 jBPM 开发人员和社区**聊天**
* 获取**客户支持**

## 指南

关于 jBPM 有很多优质资料（包括图书），这里列出了一些比较有代表性的供快速参考：

* [入门指南 - 使用 Docker](https://www.jbpm.org/learn/gettingStartedUsingDocker.html)：使用 Docker 镜像分发的入门指南和视频资源
* [入门指南 - 使用单一压缩包分发](https://www.jbpm.org/learn/gettingStartedUsingSingleZipDistribution.html)：使用单一 Zip 分发包的入门指南和视频资源
* [加速你的业务](http://mswiderski.blogspot.com/) 博客：包含大量 jBPM 开发人员的优质内容
* [Slideshare 演示文稿](https://www.slideshare.net/krisverlaenen/presentations)：包含众多 jBPM 相关的演示和幻灯片
* [start.jBPM.org](https://start.jbpm.org/)：你可以在此网站上开始构建你的 jBPM 业务应用程序

# 参考资料

https://github.com/kiegroup/jbpm

* any list
{:toc}