---
layout: post
title: 工作流引擎-07-流程引擎（Process Engine） flowable-engine 入门介绍
date:  2020-5-26 16:05:35 +0800
categories: [Engine]
tags: [engine, workflow-engine, workflow, bpm, flow]
published: true
---

# Flowable (V7)

项目主页：[https://www.flowable.org/](https://www.flowable.org/)

## flowable / flowəb(ə)l /

* 一个紧凑且高效的工作流与业务流程管理（BPM）平台，面向开发者、系统管理员和业务用户。
* 一个极其快速、经过验证的 BPMN 2 流程引擎，使用 Java 编写。它是 Apache 2.0 许可的开源项目，并有一个活跃的社区支持。
* 可嵌入 Java 应用运行，或作为服务部署在服务器、集群或云端。完美集成 Spring，提供丰富的 Java 和 REST API，是编排人工或系统任务的理想引擎。

---

## 简介

### 许可证

Flowable 根据 Apache V2 许可证分发（[http://www.apache.org/licenses/LICENSE-2.0.html）。](http://www.apache.org/licenses/LICENSE-2.0.html）。)

### 下载地址

Flowable 的下载页面：
👉 [https://www.flowable.org/downloads.html](https://www.flowable.org/downloads.html)

### 源码

发布包中包含大部分源代码（以 JAR 文件形式）。完整源代码托管于：
👉 [https://github.com/flowable/flowable-engine](https://github.com/flowable/flowable-engine)

### JDK 17+

Flowable V7 运行需 Java 17 或更高版本。
你可以使用 Linux 发行版自带的 JDK，也可以前往 [adoptium.net](https://adoptium.net/) 并点击“*Latest LTS Release*”按钮获取最新长期支持版本。
该页面还提供了安装说明。安装完成后，运行 `java -version` 命令即可确认 JDK 是否正确安装。

📌 旧版本 [Flowable V6](https://github.com/flowable/flowable-engine/tree/flowable6.x) 仍在维护，并支持 Java 8 及以上版本。

### Flowable Design

Flowable 提供免费的 Flowable Cloud Design 应用，可用于建模 CMMN、BPMN、DMN 等模型类型。
你可以在以下页面注册账号开始使用：
👉 [https://www.flowable.com/account/open-source](https://www.flowable.com/account/open-source)

### 参与贡献

想为 Flowable 做出贡献？请查看：
👉 [https://github.com/flowable/flowable-engine/wiki](https://github.com/flowable/flowable-engine/wiki)

### 问题反馈

每一位开发者都应该阅读这篇关于如何提出好问题的经典文章：
👉 [http://www.catb.org/\~esr/faqs/smart-questions.html](http://www.catb.org/~esr/faqs/smart-questions.html)

阅读后，如有问题或建议，你可以在论坛发帖或在 GitHub 上创建 issue：

* 问答与讨论区： [https://forum.flowable.org](https://forum.flowable.org)
* 问题反馈（Issue）： [https://github.com/flowable/flowable-engine/issues](https://github.com/flowable/flowable-engine/issues)

---

如你还有其他 Flowable 相关文档或技术说明，也可以继续发给我，我可以帮你翻译完整并整理成中文文档。


# 参考资料

> [https://github.com/search?q=activiti&type=repositories&p=1](https://github.com/search?q=activiti&type=repositories&p=1)

* any list
{:toc}