---
layout: post
title: 监控平台是蓝鲸智云官方推出的一款业务观测产品，具有丰富的数据采集能力，大数据处理能力，强大的平台扩展能力
date:  2019-4-1 19:24:57 +0800
categories: [Monitor]
tags: [monitor, apm, api, monitor, devops, sf]
published: true
---


# Monitor

蓝鲸智云监控平台(BLUEKING-MONITOR)是蓝鲸智云官方推出的一款监控平台产品，除了具有丰富的数据采集能力，大规模的数据处理能力，简单易用，还提供更多的平台扩展能力。

依托于蓝鲸 PaaS，有别于传统的 CS 结构，在整个蓝鲸生态中可以形成监控的闭环能力。

致力于满足不同的监控场景需求和能力，提高监控的及时性、准确性、智能化，为在线业务保驾护航。

## Overview
* [设计理念](docs/overview/design.md)
* [架构设计](docs/overview/architecture.md)
* [代码目录](docs/overview/code_framework.md)

## Features

TODO


## Getting Started
* [下载与编译](https://bk.tencent.com/download_version_list/)
* [安装部署](https://bk.tencent.com/docs/markdown/ZH/DeploymentGuides/7.1/install-co-suite.md)

## Support
- [产品文档](https://bk.tencent.com/docs/document/6.0/134/6143)
- [蓝鲸论坛](https://bk.tencent.com/s-mart/community)

## BlueKing Community
* [BK-CMDB](https://github.com/Tencent/bk-cmdb)：蓝鲸配置平台（蓝鲸 CMDB）是一个面向资产及应用的企业级配置管理平台。
- [BK-CI](https://github.com/Tencent/bk-ci)：蓝鲸持续集成平台是一个开源的持续集成和持续交付系统，可以轻松将你的研发流程呈现到你面前。
- [BK-BCS](https://github.com/Tencent/bk-bcs)：蓝鲸容器管理平台是以容器技术为基础，为微服务业务提供编排管理的基础服务平台。
- [BK-BCS-SaaS](https://github.com/Tencent/bk-bcs-saas)：蓝鲸容器管理平台 SaaS 基于原生 Kubernetes 和 Mesos 自研的两种模式，提供给用户高度可扩展、灵活易用的容器产品服务。
- [BK-PaaS](https://github.com/Tencent/bk-PaaS)：蓝鲸 PaaS 平台是一个开放式的开发平台，让开发者可以方便快捷地创建、开发、部署和管理 SaaS 应用。
- [BK-SOPS](https://github.com/Tencent/bk-sops)：标准运维（SOPS）是通过可视化的图形界面进行任务流程编排和执行的系统，是蓝鲸体系中一款轻量级的调度编排类 SaaS 产品。

## Contributing
如果你有好的意见或建议，欢迎给我们提 Issues 或 Pull Requests，为蓝鲸开源社区贡献力量。关于 bk-monitor 分支管理、Issue 以及 PR 规范，
请阅读 [Contributing Guide](docs/CONTRIBUTING.md)。

[腾讯开源激励计划](https://opensource.tencent.com/contribution) 鼓励开发者的参与和贡献，期待你的加入。


## License
项目基于 MIT 协议， 详细请参考 [LICENSE](LICENSE.txt) 。

# 蓝鲸监控平台(BK-MONITOR)设计理念

![设计优势图](https://github.com/TencentBlueKing/bk-monitor/raw/master/docs/resource/img/design.png?raw=true)

## 生态闭环

依托蓝鲸 PaaS 深度整合了 CMDB，故障自愈，日志平台，作业平台，节点管理，数据平台，工单等能力。随着生态的完善监控的智能化将更加强大

## 开箱即用
默认的主机，进程采集展示，系统事件，策略配置，可以满足基本的开箱即用

## 支持采集管理

可以满足采集器的在线调试、安装和日常维护，避免了日常的采集器同步困扰

## 告警能力

灵活的策略配置满足单机，单实例，集群，多维度等告警需求；内置了 8 种检测算法；多种告警收敛等防止告警风暴等

## 采集扩展

支持通过 HTTP、SDK 自定义上报时序和事件数据，支持远程采集，解决不能部署监控 Agent 的需求

支持 Exporter、等开源插件： 支持 Prometheus 的 Exporter 数据采集格式，可以简单的将 Exporter 迁移至监控平台的插件


# 蓝鲸监控平台(BK-MONITOR)架构

![产品架构图](https://github.com/TencentBlueKing/bk-monitor/raw/master/docs/resource/img/architecture.png?raw=true)

从下至上依次介绍:

- 管控平台：蓝鲸 PaaS 的优势，可以满足不同的云区域的需求，满足文件、命令、数据的基本需求。并且整个监控平台也是建立在蓝鲸的 PaaS 平台之上
- 依赖服务：是在蓝鲸工作的过程中需要依赖的蓝鲸 SaaS。分为强依赖缺一不可，增强型有配套功能会更加的强大
- 监控服务层：监控的核心服务能力，每个服务都可以独立配置和复用，满足上层监控场景和需求的复杂需求。每块能力都是可以不断的补充
- 监控场景：针对不同的监控场景有更加专业的场景来满足用户的问题定位。当前主要是主机监控和服务拨测
- 用户层：用户可以直接接触到监控的一些途径

# 代码架构

## Overview

![代码架构图](https://github.com/TencentBlueKing/bk-monitor/raw/master/docs/resource/img/code.png?raw=true)

代码分为三层：应用层、资源层、适配层。

## 应用层

应用层按应用类型分为：web、alarm backends

- web：web 应用服务
- alarm backends：告警后台服务

### web

web应用服务根据应用场景，细分为：

- [frontend](#)：基于蓝鲸PaaS平台托管的蓝鲸监控SaaS的web后台服务，为前端提供api
- [api services](#)：可单独部署的api 服务

### alarm backends

- [告警后台](#)

## 资源层

资源层主要给应用层提供通用业务逻辑。

## 适配层

适配层主要实现各依赖模块对应的原子api，供资源层resource调用组装。

## 公共模块

### models

- db模型定义
- 蓝鲸监控内部数据模型定义

### utils

工具函数

### core

框架

## healthz

自监控服务

## 资源模板

### static

### template(todo 需要去掉)

## 其他

- docs
- scripts
- locale
- tests

----

## 这是一个示例

- docs
	- api
		- apidocs
		- extend

- scripts	
	- githooks
	- pack
- locale
- utils
	- common				// 通用工具类
		- patchs
			- monkey.py
	- host.py
- models
- resource
	- cc
		- resource.py
		- models.py
	- job
	- bkmonitor
		- plugin
	- bkdata
- adapter
	- cc
		- define.py
		- enterprise
		- community
		- tencent
	- job
- core
	- esb 	// 剥离sdk
- conf
- web
	- account
	- metadata
	- query
	- api_service
	- frontend
		- plugin
		- weixin
- healthz
- alarm_backends
- tests
- template
- static

# 参考资料

https://github.com/TencentBlueKing/bk-monitor

* any list
{:toc}