---
layout: post
title: 工作流引擎-05-流程引擎（Process Engine）Camunda 8 协调跨人、系统和设备的复杂业务流程
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

# Camunda 8 协调跨人、系统和设备的复杂业务流程

Camunda 8 提供可扩展、按需的流程自动化服务。

它集成了强大的 BPMN 流程和 DMN 决策执行引擎，并配备了用于协同建模、运营管理和分析的工具。

本代码仓库包含 Camunda 8 的核心执行集群组件：

* [Zeebe](https://docs.camunda.io/docs/components/zeebe/zeebe-overview/) - Camunda 8 的云原生流程引擎。
* [Tasklist](https://docs.camunda.io/docs/components/tasklist/introduction-to-tasklist/) - 完成人工输入的任务。
* [Operate](https://docs.camunda.io/docs/components/operate/operate-introduction/) - 管理、监控并排查你的流程。
* [Optimize](https://docs.camunda.io/optimize/components/what-is-optimize/) - 识别系统瓶颈以优化流程。

除了核心执行集群组件，Camunda 8 技术栈还包括：

* [Console](https://docs.camunda.io/docs/components/console/introduction-to-console/) - 使用 Console 配置和部署集群。
* [Web Modeler](https://docs.camunda.io/docs/components/modeler/about-modeler/) - Web 应用程序，用于建模 BPMN、DMN 和表单，可部署或启动流程实例。
* [Desktop Modeler](https://docs.camunda.io/docs/next/components/modeler/desktop-modeler/) - 桌面建模工具，用于在本地流程项目中建模 BPMN、DMN 和表单。
* [Connectors](https://docs.camunda.io/docs/next/components/connectors/introduction-to-connectors/) - 使用连接器集成外部系统。

使用 Camunda 8，你可以：

* 使用 [BPMN 2.0](https://www.omg.org/spec/BPMN/2.0.2/) 以可视化方式定义流程
* 自由选择编程语言
* 使用 [Docker](https://www.docker.com/) 和 [Kubernetes](https://kubernetes.io/) 部署
* 构建可响应来自 [Kafka](https://kafka.apache.org/) 和其他消息队列的消息的流程
* 横向扩展以应对高并发
* 具备容错能力（无需关系型数据库）
* 导出流程数据用于监控与分析
* 参与活跃的开发者社区

[了解更多请访问 camunda.com](https://camunda.com/platform/)

---

## 当前状态

想了解我们正在开发的内容，可查看 [GitHub issues](https://github.com/camunda/camunda/issues?q=is%3Aissue+is%3Aopen+sort%3Aupdated-desc) 和 [最新提交](https://github.com/camunda/camunda/commits/main)。

---

## 实用链接

* [发布记录](https://github.com/camunda/camunda/releases)
* [预构建 Docker 镜像](https://hub.docker.com/r/camunda/zeebe/tags?page=1&ordering=last_updated)
* [构建其他平台的 Docker 镜像指南](/zeebe/docs/building_docker_images.md)
* [博客](https://camunda.com/blog/category/process-automation-as-a-service/)
* [文档首页](https://docs.camunda.io)
* [问题追踪器](https://github.com/camunda/camunda/issues)
* [用户论坛](https://forum.camunda.io)
* [贡献指南](/CONTRIBUTING.md)

---

## 新用户推荐文档

* [什么是 Camunda Platform 8？](https://docs.camunda.io/docs/components/concepts/what-is-camunda-platform-8/)
* [快速入门教程](https://docs.camunda.io/docs/guides/)
* [技术概念](https://docs.camunda.io/docs/components/zeebe/technical-concepts/)
* [BPMN 流程](https://docs.camunda.io/docs/components/modeler/bpmn/bpmn-primer/)
* [安装与配置](https://docs.camunda.io/docs/self-managed/zeebe-deployment/)
* [Java 客户端](https://docs.camunda.io/docs/apis-clients/java-client/)
* [Spring SDK](https://docs.camunda.io/docs/apis-tools/spring-zeebe-sdk/getting-started/)

---

## 贡献

请阅读 [贡献指南](/CONTRIBUTING.md)。

---

## 行为准则

本项目遵守 [Camunda 行为准则](https://camunda.com/events/code-conduct/)。
参与本项目即代表你同意遵守该准则。如发现任何不当行为，请尽快[举报](https://camunda.com/events/code-conduct/reporting-violations/)。

---

## 发布周期

请参阅我们的 [发布政策](https://camunda.com/release-policy/)，了解版本发布节奏、维护周期等信息。

---

## 许可证

Zeebe、Operate 和 Tasklist 的源代码在
[Camunda 许可证 1.0 版本](/licenses/CAMUNDA-LICENSE-1.0.txt) 下发布，
以下部分除外，它们使用 [Apache 许可证 2.0 版本](/licenses/APACHE-2.0.txt) 进行发布。
具体请参考各源文件说明。

以下内容使用 [Apache 许可证 2.0 版本](/licenses/APACHE-2.0.txt) 发布：

* Java 客户端 ([clients/java](/clients/java))
* Spring SDK ([spring-boot-starter-camunda-sdk](/clients/spring-boot-starter-camunda-sdk))
* Exporter API ([exporter-api](/zeebe/exporter-api))
* 协议定义 ([protocol](/zeebe/protocol))
* 网关协议实现 ([gateway-protocol-impl](/zeebe/gateway-protocol-impl))
* BPMN 模型 API ([bpmn-model](/zeebe/bpmn-model))

---

### 关于 gRPC 代码生成的说明

Zeebe 网关协议（API）定义位于
[gateway-protocol](/zeebe/gateway-protocol/src/main/proto/gateway.proto)，其授权遵循
[Camunda 许可证 1.0](/licenses/CAMUNDA-LICENSE-1.0.txt)。
使用 gRPC 工具生成协议存根（stub）代码不被视为创建衍生作品，Camunda 许可证 1.0 不对生成的存根代码施加任何许可限制。


# 参考资料

> [https://github.com/search?q=activiti&type=repositories&p=1](https://github.com/search?q=activiti&type=repositories&p=1)

* any list
{:toc}