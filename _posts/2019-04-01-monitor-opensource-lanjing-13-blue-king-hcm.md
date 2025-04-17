---
layout: post
title: 蓝鲸云管理平台（BK-HCM）
date:  2019-4-1 19:24:57 +0800
categories: [Monitor]
tags: [monitor, apm, api, monitor, devops, sf]
published: true
---


# BK-HCM

蓝鲸云管理平台（BK-HCM）在蓝鲸体系下，为业务提供混合云架构下对IaaS层资源统一纳管与治理能力，同时具备部分PaaS服务的管理能力。

在提升资源运营效率的同时，规范资源管理流程，辅助业务提效降本。

## Overview

* [设计理念](docs/overview/design.md)
* [架构设计](docs/overview/architecture.md)
* [代码目录](docs/overview/code_framework.md)

## Features

* 多云管理：支持多个公有云的资源管理，如腾讯云、华为云、亚马逊云、微软云、谷歌云等。
* 统一管理模式：统一多云的操作管理，降低用户的云使用门槛，提升业务效率。
* 生命周期管理：云资源的全生命周期管理，如购买、新建、操作配置、回收、销毁、释放等操作。
* 云账号管理：多云账号的纳管和API密钥托管。
* 云资源同步：与云上的资源实时同步。
* IaaS资源管理：对基础设施服务进行管理操作，如主机、硬盘、镜像、VPC、子网、安全组、网络接口、路由表的资源管理操作。
* PaaS资源管理：支持部分PaaS资源的管理，如CLB等。
* 简化权限管理：提供灵活的权限管理方式，屏蔽云上复杂的权限体系。
* 操作审计：用户操作行为的审计与回溯。

## Getting started

* [下载与编译](docs/overview/source_compile.md)
* [安装部署](docs/overview/installation.md)
* [API使用说明见这里](docs/api-docs)

## Roadmap

* [版本日志](docs/support-file/changelog/ch)

# BK-HCM 的设计理念
---
BK-HCM 是基于微服务架构设计的，整体分为四层：
+ 访问层：提供web服务界面；系统的API服务网关，外界API调用通过APIGateway访问接入层进行转发
+ 服务层: 根据应用场景对资源管理层的原子接口进行封装提供服务
+ 资源层: 对资源类型进行抽象和管理，提供原子接口服务
+ 基础设施层: 提供系统所需的数据存储、第三方系统调用、服务发现等基础服务

为了加强系统的重用性，维护性，扩展性，按高内聚低耦合原则设计架构，按模块的功能和关联关系进行划分：
+ 对外的web服务负责系统和用户的交互，不向系统其他服务提供功能，是一个独立的功能层级，属于访问层
+ 系统需要对外提供API服务，涉及系统整体的负载均衡、限流、安全防护等功能，属于访问层
+ 系统的内部服务划分为统一的服务层，实现业务逻辑并对外提供服务。按照功能划分为两层，底层是用于数据访问的资源管理层，实现资源自身管理相关的业务逻辑，不同资源之间区分清晰。上层是面向业务场景的应用场景层，聚合多个服务的功能实现复杂场景
+ 系统使用的基础服务划分为统一的基础设施层，提供与业务逻辑无关的基础功能

设计 BK-HCM 微服务架构时充分考虑了以下原则：
+ 单一职责原则：每个微服务应该只负责一项业务功能，并且将其拆分为更小、更独立的服务单元
+ 微服务自治原则：每个微服务都应该是自治的，即它可以独立部署、扩展和升级，不依赖于其他服务的决策
+ 水平扩展原则：微服务应该可以水平扩展，以应对不同规模和负载的需求
+ 服务发现和注册：微服务应该使用服务发现和注册机制，以便其他服务可以找到它们所依赖的服务
+ 隔离原则：微服务应该相互隔离，以保护系统在某些服务故障或耗费过多资源的情况下依然可靠
+ 可观察性原则：微服务应该为其操作和性能提供可观察性，以便系统管理员和开发人员可以监视和诊断服务的运行情况

# 蓝鲸云管平台的架构设计

![bk-hcm.png](https://github.com/TencentBlueKing/bk-hcm/raw/master/docs/resource/img/art.png)

蓝鲸云管理平台整体为分层的微服务设计，可以分为以下四层：

1. **访问层**: 提供web服务界面和系统的API服务网关
    + web-server: 提供前端专用接口如查询用户、组织架构信息等功能，通过接入层调用系统中提供的API接口
    + api-server: 对外提供统一的API接口服务，将请求转发到服务层

2. **服务层**: 根据应用场景对资源管理层的原子接口进行封装提供服务，基于操作的相关度分为以下几种微服务:
    + cloud-server: 提供云资源相关业务场景操作，包括云资源的增删改查操作和创建异步任务申请云资源等场景，如创建云资源时需要调用cloud-service接口创建云资源，等待云资源创建成功后调用data-service接口写入数据，再调用CMDB的SDK将数据同步过去
    + auth-server: 提供权限相关功能
    + 待开发服务: admin-server（系统管理）、task-server（异步任务服务）

3. **资源层**: 对资源类型进行抽象和管理，提供原子接口服务，划分为以下几种微服务:
    + data-service: 负责操作DB数据，通过内置的DAO层操作数据，提供云资源数据操作的原子接口
    + hc-service: 负责对接云SDK，提供多云统一的云上资源操作的原子接口，并可以通过data-service将相关数据写入db
    + 待开发服务: event-server（云事件服务）

4. **基础设施层**: 提供系统所需的数据存储、第三方系统调用、服务发现等基础服务
    + MySQL: 数据库用于存储云资源数据
    + ETCD: 服务注册与发现功功能，从而使系统能保持高可用
    + 云: 需要对接多云进行云资源操作，数据均来自云云上。封装多云的云资源操作SDK为统一的SDK，由cloud-service使用对外提供服务
    + 第三方系统调用: 将第三方系统调用封装为SDK提供服务，目前需要对接以下几种第三方系统:
        + APIGateway: 蓝鲸API服务网关，所有第三方API均通过APIGateway进行调用，的前端front也通过APIGateway调用web-server进行用户验证
        + CMDB: 封装CMDB的查询业务、操作云主机等接口为SDK，由cloud-server使用封装场景
        + IAM: 封装IAM的鉴权接口为SDK，由auth-server使用进行鉴权。因为目前IAM无法进行用户认证，所以直接调用auth-server查询权限数据
        + ITSM: 通过可自定义设计的流程模块，覆盖IT服务中的不同管理活动或应用场景帮助企业用户规范内部管理流程，由cloud-server封装调用


# 蓝鲸云管理平台

![image](https://github.com/TencentBlueKing/bk-hcm/raw/master/docs/resource/img/code.png)

## 1. web-server & front
cmd/web-server是基于开源go-restful 框架构建，前端项目front基于vue.js构建

## 2. api_server
cmd/api-server基于开源go-restful 框架构建

## 3. 服务层
均基于go-restful框架构建，划分为以下微服务：
* cmd/cloud-server
* cmd/auth-server
* admin-server(待构建)
* task-server(待构建)

## 4. 资源层
均基于go-restful框架构建，划分为以下微服务：
* cmd/data-service
* cmd/hc-service
* event-server(待构建)

## 4. pkg

* api 服务协议的请求与响应结构体定义
* dal 封装mysql相关操作
* serviced 服务注册与发现相关操作
* adaptor 封装多云相关操作
* cc 配置中心相关操作
* criteria 枚举常量定义和错误校验
* handler http通用handler
* logs 日志相关操作
* rest http框架
* runtime 微服务运行时所需的工具
* version 版本信息
* cryptography 加密相关操作
* tools 封装通用工具
* metrics prometheus监控相关配置
* thirdparty 调用第三方相关操作


# 参考资料

https://github.com/TencentBlueKing/bk-user

* any list
{:toc}