---
layout: post
title: cmdb-03-开源项目 veops/cmdb
date: 2025-7-13 14:12:33 +0800
categories: [CMDB]
tags: [cmdb, sh]
published: true
---


# veops 系列

<h3 align="center">A one-stop operations and maintenance platform focused on efficiency</h3>

-------

### 🛠️ Main Projects

| Project                                                   | Status                                                                                                                                                                                                                                                                                      | Description                                                                                |
|-----------------------------------------------------------|---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|-----------------------------------------------------------------------------------|
| [CMDB](https://github.com/veops/cmdb)                     | <a href="https://github.com/veops/cmdb/releases"><img alt="CMDB" src="https://img.shields.io/github/release/veops/cmdb.svg" /></a> <a href="https://github.com/veops/cmdb/blob/master/LICENSE"><img src="https://img.shields.io/badge/License-AGPLv3-brightgreen" alt="License: GPLv3"></a> | Configuration and Management of IT resources   
| [OneTerm](https://github.com/veops/oneterm)               | <a href="https://github.com/veops/oneterm/releases"><img alt="oneterm release" src="https://img.shields.io/github/release/veops/oneterm.svg" /></a> <img src="https://img.shields.io/badge/License-AGPLv3-brightgreen" alt="License: GPLv3"></a>                                             | Provide secure access and control over all infrastructure
| [OneOps-deploy ](https://github.com/veops/OneOps-deploy ) | <a href="https://github.com/veops/OneOps-deploy/blob/main/LICENSE"><img src="https://img.shields.io/badge/License-AGPLv3-brightgreen" alt="License: GPLv3"></a>                                                                                                                             | OneOps one-click deployment, currently includes CMDB and OneTerm
| [messenger](https://github.com/veops/messenger)           | <a href="https://github.com/veops/messenger/blob/main/LICENSE"><img src="https://img.shields.io/github/license/veops/messenger" alt="Apache License 2.0"></a>                                                                                                                               | A simple and lightweight message sending service
| [ops-tools](https://github.com/veops/ops-tools)           | <a href="https://github.com/veops/ops-tools/blob/main/LICENSE"><img src="https://img.shields.io/github/license/veops/ops-tools" alt="Apache License 2.0"></a>                                                                                                                               | Common practices and code for operations and maintenance
| [ACL](https://github.com/veops/acl)                       | <a href="https://github.com/veops/acl/releases"><img alt="ACL" src="https://img.shields.io/github/release/veops/acl.svg" /></a> <a href="https://github.com/veops/acl/blob/main/LICENSE"><img src="https://img.shields.io/github/license/veops/acl" alt="Apache License 2.0"></a>            | A general permission control management system
| [go-ansiterm](https://github.com/veops/go-ansiterm)       | <a href="https://github.com/veops/acl/blob/main/LICENSE"><img src="https://img.shields.io/github/license/veops/go-ansiterm" alt="Apache License 2.0"></a>                                                                                                                                           | A Linux terminal emulator similar to pyte


### 🌐 Official Links

- **Website**: [Visit Our Website](https://veops.cn/#hero)
- **Documentation**: [Read the Documentation](https://veops.cn/docs/)


# 前言

简单、轻量、通用的运维配置管理数据库

## 系统介绍

维易CMDB是一个简洁、轻量且高度可定制的运维配置管理数据库（CMDB）。

它支持灵活的模型配置和资源自动发现，旨在为企业提供便捷的资产管理解决方案，帮助运维团队高效地管理 IT 基础设施和服务。

- 产品文档：[https://veops.cn/docs/](https://veops.cn/docs/)
- 在线体验：[https://cmdb.veops.cn](https://cmdb.veops.cn)
  - 用户名：demo 或者 admin
  - 密码：123456
- **重要提示**：`master` 分支在开发过程中可能处于**不稳定的状态**。

请通过 [releases](https://github.com/veops/cmdb/releases) 获取最新稳定版本。

### 主要功能

- **自定义模型和模型关系**：支持模型属性的自定义，包括下拉列表、字体颜色、计算属性等高级功能，满足不同业务需求。
- **自动发现资源**：支持计算机、网络设备、存储设备、数据库、中间件、公有云资源等自动发现。
- **多维度视图展示**：包括资源视图、层级视图、关系视图等，帮助运维人员全面管理资源。
- **细粒度权限控制**：通过精确的访问控制和完备的操作日志保障系统的安全性。
- **全面的资源搜索功能**：支持灵活的资源和关系搜索，快速定位和操作资源。
- **集成 IP 地址管理（IPAM）和数据中心基础设施管理（DCIM）**：简化网络资源和数据中心设备的管理。

更多详细功能，请移步 [维易科技官网](https://veops.cn) 进行了解。

### 系统优势

- 灵活性
  + 无需指定固定运维场景，支持自由配置并内置多种模板
  + 支持自动发现和入库 IT 资产，快速搭建资产管理系统
- 安全性
  + 细粒度的权限控制机制，确保资源管理的安全性
  + 完整的操作日志记录，便于审计和问题追踪
- 多应用
  + 提供多种视图展示方式，满足不同场景的需求
  + 强大的 API 接口，支持深度集成
  + 支持定义属性触发器和计算属性，增强数据处理能力

### 技术栈

+ 后端：Python [3.8-3.11]
+ 数据存储：MySQL、Redis
+ 前端：Vue.js
+ UI组件库：Ant Design Vue

### 系统概览

<table style="border-collapse: collapse;">
  <tr>
    <td style="padding: 5px;background-color:#fff;">
      <img width="400" src="https://github.com/user-attachments/assets/6d2df835-ae93-4d91-9bd9-213c270eca7a"/>
    </td>
    <td style="padding: 5px;background-color:#fff;">
      <img width="400" src="https://github.com/user-attachments/assets/cb8b598a-a1f9-4c74-adf1-6e59aea2c9b3"/>
    </td>
  </tr>

  <tr>
    <td style="padding: 5px;background-color:#fff;">
      <img width="400" src="https://github.com/user-attachments/assets/b440224f-53c3-4b7f-a9be-285d7a4b848f"/>
    </td>
    <td style="padding: 5px;background-color:#fff;">
      <img width="400" src="https://github.com/user-attachments/assets/f457d5a0-b60b-4949-b94e-020f4c61444b"/>
    </td>
  </tr>
</table>

## 快速开始

### 1. 搭建

+ 方案一：Docker 一键快速构建

  - 第1步: 安装 Docker 环境和 Docker Compose（v2）
  - 第2步: 拷贝项目代码, `git clone https://github.com/veops/cmdb.git`
  - 第3步：进入主目录并启动, `docker compose up -d`

+ 方案二：[本地开发环境搭建](docs/local.md)
+ 方案三：[Makefile 安装](docs/makefile.md)

### 2. 访问
- 打开浏览器并访问: [http://127.0.0.1:8000](http://127.0.0.1:8000)
- 用户名: demo 或者 admin
- 密码: 123456

## 接入公司

+ 欢迎使用开源CMDB的公司和团队，在 [#112](https://github.com/veops/cmdb/issues/112) 登记

## 代码贡献
我们欢迎所有开发者贡献代码，改善和扩展这个项目。请先阅读我们的[贡献指南](docs/CONTRIBUTING.md)。此外，您还可以通过社交媒体、活动和分享来支持 Veops 的开源。

<a href="https://github.com/veops/cmdb/graphs/contributors">
  <img src="https://contrib.rocks/image?repo=veops/cmdb" />
</a>

## 更多开源

- [OneTerm](https://github.com/veops/oneterm): 一款简单、轻量、灵活的堡垒机服务。
- [messenger](https://github.com/veops/messenger): 一个简单轻量的消息发送服务。
- [ACL](https://github.com/veops/acl): 一个简单通用的权限管理系统设计与实践。

## 相关文章

- <a href="https://mp.weixin.qq.com/s/v3eANth64UBW5xdyOkK3tg" target="_blank">尽可能通用的运维CMDB的设计与实践(Ⅰ) - 概览</a>
- <a href="https://mp.weixin.qq.com/s/rQaf4AES7YJsyNQG_MKOLg" target="_blank">尽可能通用的运维CMDB的设计与实践(ⅠⅠ) - 自动发现</a>
- <a href="https://github.com/veops/cmdb/tree/master/docs/cmdb_api.md" target="_blank">CMDB接口文档</a>


# 尽可能通用的运维CMDB的设计与实践(Ⅰ) - 概览

CMDB是配置管理数据库的简称，本文所阐述的CMDB只专注于存储运维相关的资源数据，有别于应用系统的配置管理。

实际上企业一般都是自己内部的运维团队按照公司的运维场景需求设计和构建的CMDB，因为很少能有开源产品能满足他们的需求，或者是个性化的需求二次开发比较难以实现，所以他们都选择了自主研发，而不是使用开源。

因此，要实现一个尽可能通用、灵活、可扩展的运维资源数据的配置和管理系统，系统必须要满足:

运维人员能根据企业的运维场景和需求，自己去构建存储的数据模型，以及模型之间的关系

提供丰富的API，尤其是在数据和关系检索要做到通用，便于二次开发

用户可以方便的订阅自己关心的数据，有丰富的图表展示

数据的自动发现和细粒度的权限控制

基于上述理念，设计并实现了一个CMDB，并开源出来，希望能得到大家的积极反馈，系统将持续不断得改进。

在线Demo: https://cmdb.veops.cn 用户名: demo 或者 admin 密码: 123456

Github开源地址为：https://github.com/veops/cmdb

## 总体架构

![总体架构](https://mmbiz.qpic.cn/sz_mmbiz_png/qI6rweQTemtI5VbwVMDAL0aZl7krCpm3vJbhc2qQClAFqiaIFra2Hq1LZRfXO739UYKAzS3QhicN5oqNSiaASyMlA/640?wx_fmt=png&tp=webp&wxfrom=5&wx_lazy=1)


如图1，CMDB自下而上被划分为4层: 存储层、数据层、API、UI，图中的CIType可以理解为数据模型，例如物理机、虚拟机、应用、网卡、软件等。CI是配置项，即CIType的实例, 例如具体的1台物理机就是1个CI。下面概要介绍一下这4层。

存储层：主要用来存储CIType和CI，以及它们之间的关系。

· Mysql: 所有数据的持久化存储

· Redis: 数据缓存，主要是用户、属性、CIType、权限等的数据缓存，减少Mysql访问压力，提升API的响应速度

· Elasticsearch: 主要存储CI的实例数据，用来检索CI。实际上ES是一个可选的方案，CI数据的检索默认是通过Mysql+Redis来实现的，当然CI的实例数若超过一定数量级，考虑到查询效率，建议使用ES。

数据层：描述了模型数据和实例数据，以及它们之间的关系。在这一层首先需要运维按照具体的应用场景来完成模型的构建。模型包括属性，属性有不同的值的类型，且有一些检验规则，比如唯一、必须等的校验，在系统层面避免脏数据的录入。总结下来，运维CMDB实际上主要包括下面4种类型的数据：

1. 硬件数据：物理机、宿主机、机柜、网络设备、网卡、硬盘、内存等等

2. 软件数据：docker、mysql、redis、tomcat等等

3. 业务数据：应用、产品线、事业部等等

4. 关系数据：上面3种类型数据之间的关系

当然，每个公司的运维场景各异，用户都可以按照自己的需求来设计数据模型。

API层: 对UI提供一套统一、透明的调用接口，对下层各数据模块实行接口抽象与封装。要尽可能实现通用，要求CI和CI relation的查询API必须做到通用和灵活，要考虑到用户各种各样的查询需求，本系统实现了对应的2个API，基本上满足了前端对数据查询的所有需求。

UI层: 实际上就是web portal，用户直接访问CMDB的门户。核心功能主要包括：模型配置、资源视图、关系视图、树形视图和权限管理这5个核心模块。下面将对这5个功能模块进行阐述。

### 模型配置

![模型配置](https://mmbiz.qpic.cn/sz_mmbiz_jpg/qI6rweQTemtI5VbwVMDAL0aZl7krCpm30RHkTZXqOiablMH9zMA3Cm6kUcicfVOATsPk75f6JRdVrVw0e2sicG6qw/640?wx_fmt=jpeg&tp=webp&wxfrom=5&wx_lazy=1)

除非是大型的成熟的企业，否则很难在开始就完全能够定义清楚运维的数据模型。

因为企业在不断成长和发展的过程中，运维的场景和需求也是在不断的变化的，所以，通用的CMDB一定要能够让管理员方便对CIType进行动态的修改。

如图2所示, 要完成动态建模，至少要能增删改CIType，给CIType定义属性，也可以从属性库直接复用已存在的属性，

属性可以有校验规则，以便尽可能保证数据的准确性。

属性值的类型支持以下5种：

1）整数类型

2）浮点数

3）日期类型: date, datetime, time

4）文本类型

5）json类型

此外，还可以构建CIType之间的关系，比如事业部包含产品线，产品线包含应用，应用部署在物理机，应用部署在docker上。

![类型](https://mmbiz.qpic.cn/sz_mmbiz_png/qI6rweQTemtI5VbwVMDAL0aZl7krCpm3BibGtUnMjT4L0LPFwWyiauia9UYHKk9wM1SoaIclg9OO7UdpiaiaHWMvibVg/640?wx_fmt=png&tp=webp&wxfrom=5&wx_lazy=1)

![2](https://mmbiz.qpic.cn/sz_mmbiz_png/qI6rweQTemtI5VbwVMDAL0aZl7krCpm3nbIXIkeJvK3bib6kv81kR6HEetsvg7ZRhoDmcclpQAeM46EjegtYSjA/640?wx_fmt=png&tp=webp&wxfrom=5&wx_lazy=1)

图3和图4分别是对CIType的增删改和CIType的属性进行定义。

下图5则是对关系视图进行定义，比如构建服务树，这个将在下面关系视图进行详细的阐述。

![5](https://mmbiz.qpic.cn/sz_mmbiz_png/qI6rweQTemtI5VbwVMDAL0aZl7krCpm3cjy8BLiaxhd5JSLZoZia9lj2Vicob9QDc0MoAVKjMqz2fTP9HsQJlbWtA/640?wx_fmt=png&tp=webp&wxfrom=5&wx_lazy=1)

### 资源视图

资源视图即CI数据的检索。为了保证系统的通用、灵活，CI数据检索的API要能按照CI的属性进行各种条件过滤查询，而且这个API要尽可能覆盖用户不同的查询需求。

CI的通用查询API实现了搜索表达式的查询，表达式支持AND、OR、NOT、IN、RANGE、COMPARISON的组合查询，如图6所示。

![资源视图](https://mmbiz.qpic.cn/sz_mmbiz_png/qI6rweQTemtI5VbwVMDAL0aZl7krCpm3MVuRQ0MZcvNxaRIicic2FyZ6Zfk8rEy4LwaZJibImMyfc2BvTX51UicMlA/640?wx_fmt=png&tp=webp&wxfrom=5&wx_lazy=1)

如图7，用户能够订阅自己关心的资源视图，比如物理机、应用等。

- 图7. 用户订阅关心的资源视图

![图7. 用户订阅关心的资源视图](https://mmbiz.qpic.cn/sz_mmbiz_png/qI6rweQTemtI5VbwVMDAL0aZl7krCpm3LruzGKDAuElOygYicGQvnHxgLhepwYqUwwgFicHjOMHtqeH9BV29qwYg/640?wx_fmt=png&tp=webp&wxfrom=5&wx_lazy=1)

图8则是用户订阅的资源视图的数据展示，我们可以根据属性字段查询，另外也提供了批量修改、下载、删除等操作，也可以查看CI的生命周期，以及它的关联CI。

- 图8. 资源视图

![资源视图](https://mmbiz.qpic.cn/sz_mmbiz_png/qI6rweQTemtI5VbwVMDAL0aZl7krCpm3bticPicAPJAApeozYqeHq0wX4UYIiaky1ksHcpVpU11GJBW6yUibPP3WwQ/640?wx_fmt=png&tp=webp&wxfrom=5&wx_lazy=1)

### 资源层级

资源层级视图实际上是资源视图按照树形目录的方式来进行展示。

用户可以订阅某一个CIType按照不同属性分level来展示，比如物理机，我们可以定义: IDC -> 环境 -> 状态 3个属性分层的视图，如图9所示，用树形展示。

这样方便了不同角色的用户可以按需来设计资源的统计展示方式，树形视图是单类CI实例数据的展示，不涉及到CI之间关系。

- 图9. 树形视图

![资源层级](https://mmbiz.qpic.cn/sz_mmbiz_png/qI6rweQTemtI5VbwVMDAL0aZl7krCpm3IFpAzO5pichqmaO38kZQHiaCBSRDgTCuBhJsZtsz7iaLTn9BWKK9ITNPg/640?wx_fmt=png&tp=webp&wxfrom=5&wx_lazy=1)

### 关系视图

关系视图是CI之间的关系，并用树形的方式来进行呈现。

同样为了保证系统的通用性，CI关系查询和CI实例的查询API一样要灵活且通用，本系统实现的CI关系查询API是使用方法类似于上文提到的CI的查询API，只不过多了2个参数：root_id 搜索的根节点的ci_id和level搜索的层级，也就是说可以从某一个CI出发，去查询离该CI任一level的CI，如图10所示。

从根节点root出发可以搜索level=1的关系节点，也可以直接搜索level=2或者n的任一一层节点。

- 图10 关系查询

![10](https://mmbiz.qpic.cn/sz_mmbiz_png/qI6rweQTemtI5VbwVMDAL0aZl7krCpm3Nvcv5L8ibybc1B1p5yNpiavmnUJEQR1EkJibLvVDbibZO3ibE9lnlZDM7og/640?wx_fmt=png&tp=webp&wxfrom=5&wx_lazy=1)



关系视图是由管理员根据需求来进行定义，然后授权给不同的角色来使用。

举个例子: 事业部 -> 产品线 -> 应用 定义这样的一个关系视图,我们命名为服务树, 树的节点是这3层CI, 具体的数据展示是应用下面的所有资源，可以是物理机，也可以是docker，如图11所示。

- 图11. 关系视图-服务树

![关系视图-服务树](https://mmbiz.qpic.cn/sz_mmbiz_png/qI6rweQTemtI5VbwVMDAL0aZl7krCpm3wlsKEbTFlLqic5MCShRn9PlbUTTHzN9DCt2RWnjB54jckUV5gMFONdw/640?wx_fmt=png&tp=webp&wxfrom=5&wx_lazy=1)

### 权限管理

权限管理：系统提供了基于角色的访问权限控制，支持角色继承，其设计也是比较灵活，可以按需实现比较细粒度的权限控制，目前可以按照CIType和关系视图来进行权限控制，主要包括增、删、改、查的权限控制。

![权限管理](https://mmbiz.qpic.cn/sz_mmbiz_png/qI6rweQTemtI5VbwVMDAL0aZl7krCpm3C0OqrVQLORltwsYMPBwmib4qfv8e06979ic1rmHlNQDbhrM5DEJYfEzQ/640?wx_fmt=png&tp=webp&wxfrom=5&wx_lazy=1) 

# 自动发现

上一篇文章对CMDB的整体的建设思路和设计实践做了一个概要的描述。

我们知道CMDB是运维的基石，也是运维最权威的数据库，建设CMDB最大的难点和痛点其实就在如何保证数据权威性，因为CMDB最大的作用在于被信任和消费，比如自动化运维、监控、ITSM、DevOps等其他周边系统。

维护CMDB数据的常用方法无外乎3种:

## 1 自动发现

这是最常用的采集数据的方法，比如服务器、网络设备、应用、软件等数据都可以通过自动发现的方式录入到CMDB里，以保证数据的准备性和及时性。

## 2 流程

流程是为了规范运维的操作与变更，对每个运维资源的生命周期进行管理，所以ITSM本身和CMDB是息息相关，ITSM的流程输出很多都会直接反馈到CMDB里，以保证数据的准确。

## 3 人工

一些数据比如负责人、位置信息需要人工去完善，也可以通过计算属性的方式自动填充。当然为避免人工遗漏或出错，要尽可能使用前面2种方法。

本文重点讲解维易开源CMDB对自动发现的一些思考和实践，自动发现正如其字面意思，就是自动的去发现各种各样的运维资源，资源的变更能及时的反馈到CMDB里，降低了人力维护数据的成本。

自动发现的建设一般分为3步: 创建自动发现规则、模型关联自动发现规则、执行自动发现。

接下来我们对这3步进行简要的阐述。


## 自动发现规则

维易开源CMDB的自动发现规则主要包括3大类:

### 1.内置插件和自定义插件

内置插件是把物理机、虚拟机、硬盘、网卡的发现内置到了OneAgent(注：维易统一运维探针OneAgent，可在官网免费申请https://veops.cn)里。

点开内置插件的自动发现规则，呈现的是采集的属性列表，如下图所示：

![自动发现](https://mmbiz.qpic.cn/sz_mmbiz_png/qI6rweQTemuCVeAia3Uxrqgt3euK2BIiaWicG4CUmCndlT0GVM4UIdztWGxicHBykNDSeBEarNjNu2103sINh7Kw4A/640?wx_fmt=png&tp=webp&wxfrom=5&wx_lazy=1)

自定义插件实际上是可以实现其他所有采集需求的，比如MySQL、Nginx、Tomcat等常用的一些软件自动发现，实现一个自定义的插件很简单，就是一段python脚本:

```python

# -*- coding:utf-8 -*-

import json


class AutoDiscovery(object):

    @property
    def unique_key(self):
        """

        :return: 返回唯一属性的名字
        """
        return

    @staticmethod
    def attributes():
        """
        定义属性字段
        :return: 返回属性字段列表, 列表项是(名称, 类型, 描述), 名称必须是英文
        类型: String Integer Float Date DateTime Time JSON
        例如:
        return [
            ("ci_type", "String", "模型名称"),
            ("private_ip", "String", "内网IP, 多值逗号分隔")
        ]
        """
        return []

    @staticmethod
    def run():
        """
        执行入口, 返回采集的属性值
        :return: 返回一个列表, 列表项是字典, 字典key是属性名称, value是属性值
        例如:
        return [dict(ci_type="server", private_ip="192.168.1.1")]
        """
        return []


if __name__ == "__main__":
    result = AutoDiscovery().run()
    if isinstance(result, list):
        print("AutoDiscovery::Result::{}".format(json.dumps(result)))
    else:
        print("ERROR: 采集返回必须是列表")
```

### 2.网络设备的自动发现

这个发现能力同样内置在OneAgent里，通过SNMP等网络协议去采集网络设备，目前实现的主要包括交换机、路由器、防火墙、打印机。

![网络设备的自动发现](https://mmbiz.qpic.cn/sz_mmbiz_png/qI6rweQTemuCVeAia3Uxrqgt3euK2BIiaW4vB4V1ByP0kVEe9QD8du2Ls4ib1sydzMZtKeTLicLHBH9FpnIYXJpCQg/640?wx_fmt=png&tp=webp&wxfrom=5&wx_lazy=1)

### 3.公有云资源的发现

通过对接公有云厂商的开放API，主动定时轮训的方式去获取公有云资源，目前集成了阿里云、腾讯云、华为云、AWS的云主机的自动发现，后续会扩充云资源的发现。

当然如果本身在云主机上部署了OneAgent，实际上也是可以用内置的虚拟机的自动发现插件来进行采集。

##  模型关联自动发现规则

### 1.模型属性自动发现

以网卡为例进行说明，主要包括属性映射和执行配置:

1) 属性映射

关联上内置的网卡自动发现规则后，模型的属性名和自动发现规则的属性名会进行自动匹配，如果名字不一样则需要人工来匹配。

实际上每个模型可以应用多个自动发现规则，每个规则里可能采集了模型的部分属性。

2) 执行配置

首先指定自动发现规则执行的目标机器，可以的选项有：

所有节点，比如物理机、虚拟机等，但是必须管理员才能配置为所有节点。

具体的某个节点，比如公有云资源的自动发现或者网络设备的自动发现，都是指定具体的某个节点去执行的。

从CMDB里选择，比如网卡，可以选择CMDB里所有的物理机去执行。

![cmdb](https://mmbiz.qpic.cn/sz_mmbiz_png/qI6rweQTemuCVeAia3Uxrqgt3euK2BIiaWUZsgQ9Ob38Lia775KDo2DJ1Qt5MAILE2L8qh2TLECt9xjd6Z8ZsjWFg/640?wx_fmt=png&tp=webp&wxfrom=5&wx_lazy=1)

其次可选择是否自动入库，一般来说自动发现的准确率如果接近100%，那么可以直接选择自动入库，即自动发现的实例会直接入库为CI。如果选择不自动入库，实例会先进入自动发现资源池，然后需要人工批量入库为CI。

### 2.关系自动发现

关系自动发现配置极其简单，还是以网卡为例进行说明：

如下图所示，只需配置网卡采集的属性sn(物理机的序列号，实际上对网卡模型来说是冗余字段)和物理机模型的序列号建立关系即可，当采集上来的网卡入库CMDB时，会用字段来建立和物理机之间的关系。

![关系自动发现](https://mmbiz.qpic.cn/sz_mmbiz_png/qI6rweQTemuCVeAia3Uxrqgt3euK2BIiaWHMicXKibr06hMrQKZ4QTe3P93DWhpce8GfibckH87oibCJ56ODtdicXqWibA/640?wx_fmt=png&tp=webp&wxfrom=5&wx_lazy=1)


## 执行自动发现

模型关联好自动发现规则之后，OneAgent会自动定时同步其所在节点的自动发现规则，然后执行自动发现规则，如果采集的数据和上一次采集有异同，则推送数据到服务端。

# 参考资料

https://github.com/veops/cmdb

https://mp.weixin.qq.com/s/v3eANth64UBW5xdyOkK3tg

https://mp.weixin.qq.com/s/rQaf4AES7YJsyNQG_MKOLg

* any list
{:toc}