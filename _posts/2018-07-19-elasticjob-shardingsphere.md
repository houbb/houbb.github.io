---
layout: post
title:  shardingsphere-elasticjob 分布式调度作业框架
date:  2018-07-19 14:50:41 +0800
categories: [Quartz]
tags: [quartz, job, distributed, sh]
published: true
---

# ElasticJob

ElasticJob 是一个分布式调度解决方案，由两个独立的项目 ElasticJob-Lite 和 ElasticJob-Cloud 组成。

通过灵活调度、资源管理、作业管理等功能，打造适合互联网场景的分布式调度解决方案，通过开放式架构设计提供多元化的作业生态系统。 它为每个项目使用统一的作业 API。 开发者只需一次代码，可随意部署。

ElasticJob 于 2020 年 5 月 28 日成为 Apache ShardingSphere 子项目。

# 介绍

使用 ElasticJob 的开发人员再也不用担心作业横向扩展等非功能性需求，可以更加专注于业务编码。 

同时也可以释放运营商，让他们不用担心高可用和管理，只需添加服务器就可以自动运行

# ElasticJob-Lite

提供分布式任务分片服务的轻量级、去中心化解决方案。

![ElasticJob-Lite](https://camo.githubusercontent.com/17da1bf55dd820d1b752a89b3f1e9a22b142a0ed29b402669c8fd91766f9026f/68747470733a2f2f7368617264696e677370686572652e6170616368652e6f72672f656c61737469636a6f622f63757272656e742f696d672f6172636869746563747572652f656c61737469636a6f625f6c6974652e706e67)

# ElasticJob-Cloud

使用 Mesos 来管理和隔离资源。

![ElasticJob-Cloud](https://camo.githubusercontent.com/de49ad7e5821892b062ce613e55c24fe22c901ef0a617fdcf5843b20974d44d6/68747470733a2f2f7368617264696e677370686572652e6170616368652e6f72672f656c61737469636a6f622f63757272656e742f696d672f6172636869746563747572652f656c61737469636a6f625f636c6f75642e706e67)


## 特征

- 弹性时间表

支持分布式系统中的作业分片和高可用

横向扩展以提高吞吐量和效率

作业处理能力随资源分配灵活可扩展

- 资源分配

在合适的时间和分配的资源执行工作

将相同的作业聚合到相同的作业执行器

将资源动态附加到新分配的作业

- 工作管理

故障转移

失火

分布式环境不稳定时的自诊断和恢复

- 工作依赖（TODO）

基于 DAG 的作业依赖

基于 DAG 的作业项依赖

- 就业开放生态系统

统一作业 api 以进行扩展

支持丰富的作业类型库，如数据流、脚本、HTTP、文件、大数据

专注业务SDK，可配合Spring IOC

- 管理控制台

工作管理

作业事件跟踪查询

注册中心管理

环境要求

# 参考资料

https://github.com/apache/shardingsphere-elasticjob




* any list
{:toc}