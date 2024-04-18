---
layout: post
title: test framework-01-MeterSphere  一站式开源持续测试平台，为软件质量保驾护航
date:  2016-4-26 12:53:12 +0800
categories: [Test]
tags: [junit, framework, open-source, test]
published: true
---

# MeterSphere

MeterSphere 一站式开源持续测试平台，为软件质量保驾护航。

搞测试，就选 MeterSphere！

MeterSphere 是一站式开源持续测试平台, 涵盖测试跟踪、接口测试、UI 测试和性能测试等功能，全面兼容 JMeter、Selenium 等主流开源标准，有效助力开发和测试团队充分利用云弹性进行高度可扩展的自动化测试，加速高质量的软件交付，推动中国测试行业整体效率的提升。

![MeterSphere](https://camo.githubusercontent.com/1164d8fe7a0798154961194aad0cb129f170f0c984adf1c7a242ec0034931550/68747470733a2f2f6d657465727370686572652e6f73732d636e2d68616e677a686f752e616c6979756e63732e636f6d2f696d672f6d732d6172636869746563747572652e706e67)

## MeterSphere 的功能

测试跟踪: 对接主流项目管理平台，测试过程全链路跟踪管理；列表脑图模式自由切换，用例编写更简单、测试报告更清晰；
接口测试: 比 JMeter 易用，比 Postman 强大； API 管理、Mock 服务、场景编排、多协议支持，你想要的全都有；
UI 测试: 基于 Selenium 浏览器自动化，高度可复用的测试脚本； 无需复杂的代码编写，人人都可开展的低代码自动化测试；
性能测试: 兼容 JMeter 的同时补足其分布式、监控与报告以及管理短板; 轻松帮助团队实现高并发、分布式的性能压测，完成压测任务的统一调度与管理。

## MeterSphere 的优势

开源：基于开源、兼容开源；按月发布新版本、日均下载安装超过100次、被大量客户验证；
一站式：一个产品全面涵盖测试跟踪、接口测试、UI测试、性能测试等功能并形成联动；
全生命周期：一个产品全满足从测试计划、测试执行到测试报告分析的全生命周期需求；
持续测试：无缝对接 Bug 管理工具和持续集成工具等，能将测试融入持续交付和 DevOps 体系；
团队协作：支持团队协作和资产沉淀，无论团队规模如何，总有适合的落地方式。

## UI

![页面效果](https://camo.githubusercontent.com/d5b8f034509d2255415debd38ab99832c38530e2d772a568730ceee52c639a5f/68747470733a2f2f7777772e66697432636c6f75642e636f6d2f6d657465727370686572652f696d616765732f6d732d64617368626f6172642e6a706567)

## 技术栈

后端: Spring Boot
前端: Vue.js
中间件: MySQL, Kafka, MinIO
基础设施: Docker, Kubernetes
测试引擎: JMeter

# 快速开始

## 一键安装

仅需两步快速安装 MeterSphere：

准备一台不小于 8 G内存的 64位 Linux 主机；

以 root 用户执行如下命令一键安装 MeterSphere。

```
curl -sSL https://resource.fit2cloud.com/metersphere/metersphere/releases/latest/download/quick_start.sh | bash
```
# window10 安装笔记

> [Windows 单机部署](https://metersphere.io/docs/v2.x/installation/offline_installation_windows/)

## 依赖

windows10 WSL

Ubuntu 

docker

这个可以看其他的文章。

## 下载

在 [https://github.com/metersphere/metersphere/releases](https://github.com/metersphere/metersphere/releases) 下载安装包

# 小结

直接使用这种成熟的开源工具，不过一般需要针对权限这一部分进行二次开发。

# 参考资料

https://github.com/metersphere/metersphere

* any list
{:toc}