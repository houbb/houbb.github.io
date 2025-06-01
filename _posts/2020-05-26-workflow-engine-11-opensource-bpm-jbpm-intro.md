---
layout: post
title: 工作流引擎-11-开源 BPM 项目 jbpm
date:  2020-5-26 16:05:35 +0800
categories: [Engine]
tags: [engine, workflow-engine, workflow, bpm, flow]
published: true
---

## 工作流引擎系列

[工作流引擎-00-流程引擎概览](https://houbb.github.io/2020/05/26/workflow-engine-00-overview)

[工作流引擎-01-Activiti 是领先的轻量级、以 Java 为中心的开源 BPMN 引擎，支持现实世界的流程自动化需求](https://houbb.github.io/2020/05/26/workflow-engine-01-activiti)

[工作流引擎-02-BPM OA ERP 区别和联系](https://houbb.github.io/2020/05/26/workflow-engine-02-bpm-oa-erp)

[工作流引擎-03-聊一聊流程引擎](https://houbb.github.io/2020/05/26/workflow-engine-03-chat-what-is-flow)

[工作流引擎-04-流程引擎 activiti 优秀开源项目](https://houbb.github.io/2020/05/26/workflow-engine-04-activiti-opensource)

[工作流引擎-05-流程引擎 Camunda 8 协调跨人、系统和设备的复杂业务流程](https://houbb.github.io/2020/05/26/workflow-engine-05-camunda-intro)

[工作流引擎-06-流程引擎 Flowable、Activiti 与 Camunda 全维度对比分析](https://houbb.github.io/2020/05/26/workflow-engine-06-compare)

[工作流引擎-07-流程引擎 flowable-engine 入门介绍](https://houbb.github.io/2020/05/26/workflow-engine-07-flowable-intro)

[工作流引擎-08-流程引擎 flowable-engine 优秀开源项目](https://houbb.github.io/2020/05/26/workflow-engine-08-flowable-opensource)

[工作流引擎-09-XState 是一个 JavaScript 和 TypeScript 的状态管理库，它使用状态机和状态图来建模逻辑](https://houbb.github.io/2020/05/26/workflow-engine-09-xstate-intro)

[工作流引擎-10-什么是 BPM?](https://houbb.github.io/2020/05/26/workflow-engine-10-bpm-intro)

[工作流引擎-11-开源 BPM 项目 jbpm](https://houbb.github.io/2020/05/26/workflow-engine-11-opensource-bpm-jbpm-intro)

[工作流引擎-12-开源 BPM 项目 foxbpm](https://houbb.github.io/2020/05/26/workflow-engine-12-opensource-bpm-foxbpm-intro)

[工作流引擎-13-开源 BPM 项目 UFLO2](https://houbb.github.io/2020/05/26/workflow-engine-13-opensource-bpm-uflo-intro)

[工作流引擎-14-开源审批流项目之 RuoYi-vue + flowable 6.7.2 的工作流管理](https://houbb.github.io/2020/05/26/workflow-engine-14-opensource-ruoyi-flowable-intro)

[工作流引擎-15-开源审批流项目之 RuoYi-Vue-Plus 进行二次开发扩展Flowable工作流功能](https://houbb.github.io/2020/05/26/workflow-engine-15-opensource-ruoyi-flowable-plus-intro)

[工作流引擎-16-开源审批流项目之 整合Flowable官方的Rest包](https://houbb.github.io/2020/05/26/workflow-engine-16-opensource-flowable-ui-intro)

[工作流引擎-17-开源审批流项目之 flowable workflow designer based on vue and bpmn.io](https://houbb.github.io/2020/05/26/workflow-engine-17-opensource-workflow-bpmn-modeler-intro)

[工作流引擎-18-开源审批流项目之 plumdo-work 工作流，表单，报表结合的多模块系统](https://houbb.github.io/2020/05/26/workflow-engine-18-opensource-plumdo-work-intro)

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