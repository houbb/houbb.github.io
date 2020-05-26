---
layout: post
title: 工作流概览-01-Activiti
date:  2020-5-26 16:05:35 +0800
categories: [Flow]
tags: [spring, workflow, sf]
published: true
---

# 什么是Activiti

在解释activiti之前我们看一下什么是工作流。

工作流(Workflow)，就是“业务过程的部分或整体在计算机应用环境下的自动化”，它主要解决的是“使在多个参与者之间按照某种预定义的规则传递文档、信息或任务的过程自动进行，从而实现某个预期的业务目标，或者促使此目标的实现”。

我的理解是，工作流将一套大的业务逻辑分解成业务逻辑段， 并统一控制这些业务逻辑段的执行条件，执行顺序以及相互通信。 

实现业务逻辑的分解和解耦。

Activiti是一个开源的工作流引擎，它实现了BPMN 2.0规范，可以发布设计好的流程定义，并通过api进行流程调度。

BPMN即业务流程建模与标注（Business Process Model and Notation，BPMN) ，描述流程的基本符号，包括这些图元如何组合成一个业务流程图（Business Process Diagram）。

# 基本表

activiti5.13使用了23张表支持整个工作流框架，底层使用mybatis操作数据库。这些数据库表为

1) ACT_RE_*: 'RE'表示repository。 这个前缀的表包含了流程定义相关的静态资源（图片，规则等）。

2) ACT_RU_*: 'RU'表示runtime。 运行时表，包含流程实例，任务，变量，异步任务等运行中的数据。流程结束时这些记录会被删除。

3) ACT_ID_*: 'ID'表示identity。 这些表包含用户和组的信息。

4) ACT_HI_*: 'HI'表示history。 这些表包含历史数据，比如历史流程实例，变量，任务等。

5) ACT_GE_*: 通用数据，bytearray表保存文件等字节流对象。

# 基本流程

工作流进行的基本过程如下:

```
定义流程(框架外) -> 部署流程定义 -> 启动流程实例, 框架移动到任务1 -> 拾取组任务 -> 办理个人任务, 框架移动到任务2 -> 拾取组任务 -> 办理个人任务...
```

组任务是多个用户都可以完成的任务。

没有组任务直接办理个人任务; 有组任务需先通过拾取将组任务变成个人任务, 然后再办理。

个人任务/组任务在表中的区别

个人任务: 表act_ru_task的ASSIGNEE段即指定的办理人

组任务: 表act_ru_task的ASSIGNEE段为null, 相关信息在表act_ru_identitylink中, 组任务1见userid段;  

组任务2见groupid段, 当然还需查询act_id_xxx表才能精确到人.


# 参考资料

[Activiti](https://blog.csdn.net/carolzhang8406/article/details/79450818)

* any list
{:toc}