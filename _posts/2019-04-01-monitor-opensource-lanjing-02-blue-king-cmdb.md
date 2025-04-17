---
layout: post
title: 蓝鲸智云配置平台(BlueKing CMDB)
date:  2019-4-1 19:24:57 +0800
categories: [Monitor]
tags: [monitor, apm, api, cmdb, devops, ITIL, sf]
published: true
---

# 蓝鲸配置平台，一个面向应用的CMDB!

蓝鲸配置平台是一款面向应用的CMDB，在ITIL体系里，CMDB是构建其它流程的基石，在蓝鲸智云体系里亦是如此，它为上层应用提供了各种运维场景的配置服务；

它是企业IT管理体系的核心，通过提供配置管理服务，以数据和模型相结合映射应用间的关系，保证数据的准确和一致性；并以整合的思路推进，最终面向应用消费，发挥配置服务的价值。

## 功能特性

![FS](https://raw.githubusercontent.com/TencentBlueKing/bk-cmdb/master/docs/wiki/img/cmdb_feature.png)

## 定位

垂直形态的企业IT体系遵循的是从下至上的结构，底层配置服务的可靠性、可塑性和可扩展性，很大程度上决定了上层应用的广度；

所以，构建或选择一套完善的配置服务平台对于企业来说很是关键，它必须是能够满足随着企业发展延伸的各种需求场景扩展，反之当企业的IT体系在已经成熟的情况下，再去选择更换底层配置系统就会带来灾难性的变迁工程。

## 价值

蓝鲸配置平台承载了其上层诸多应用和平台的运维场景配置服务，经历过了数百款腾讯游戏业务的复杂需求场景的考验。

蓝鲸配置平台提供了全新自定义CI管理，用户不仅可以方便地实现内置CI属性的拓展，同时也能够根据不同的企业需求动态新增CI和关联关系。

除此之外，新推出的主机数据快照、自动发现、变更事件主动推送等功能增强了CMDB的联动能力，提升配置录入的效率和配置信息的准确性。

在技术构建上，架构的核心聚焦于资源，我们把CMDB管理的原子资源分为主机、进程和通用对象三种类型，并构建了对这些资源的原子操作层。

在这些原子操作之上，我们构建了更贴近用户操作的场景层，场景层通过对不同资源的组合操作来完成用户的请求。

相较于传统web系统，蓝鲸配置平台使用Golang作为开发语言，系统的运行效率得到较大提升。此外采用了微服务架构设计，系统的部署发布可以支持传统方式和容器方式。

在真实的业务运营场景中，支持把主机、存储、中间件、网络设备等各类企业IT资源纳入到CMDB的管理中。

业务运维人员能够根据实际需要，在CMDB中建设业务资源拓扑、导入资源以及状态管理。

通过无缝对接发布变更、监控、故障处理等自动化运维系统，进而实现以CMDB为核心的资源管理和自动化运维。

# 蓝鲸配置平台（蓝鲸CMDB）

> **重要提示**: `master` 分支在开发过程中可能处于 *不稳定或者不可用状态* 。

请通过[releases](https://github.com/TencentBlueKing/bk-cmdb/releases) 而非 `master` 去获取稳定的二进制文件。

蓝鲸配置平台（蓝鲸CMDB）是一个面向资产及应用的企业级配置管理平台。

蓝鲸配置平台提供了全新自定义模型管理，用户不仅可以方便地实现内置模型属性的拓展，同时也能够根据不同的企业需求随时新增模型和关联关系，把网络、中间件、虚拟资源等纳入到CMDB的管理中。

除此之外还增加了更多符合场景需要的新功能：机器数据快照、数据自动发现、变更事件主动推送、更加精细的权限管理、可拓展的业务拓扑等功能。

在技术构建上，架构的核心聚焦于资源，我们把CMDB管理的原子资源分为主机、进程和通用对象三种类型，并构建了对这些资源的原子操作层。

在这些原子操作之上，我们构建了更贴近用户操作的场景层，场景层通过对不同资源的组合操作来完成用户的请求。

## Overview
* [设计理念](docs/overview/design.md)
* [架构设计](docs/overview/architecture.md)
* [代码目录](docs/overview/code_framework.md)
* [数据库表结构设计](docs/db/README.md)

## Features
* 拓扑化的主机管理：主机基础属性、主机快照数据、主机归属关系管理
* 组织架构管理：可扩展的基于业务的组织架构管理
* 模型管理：既能管理业务、集群、主机等内置模型，也能自定义模型
* 进程管理：基于模块的主机进程管理
* 事件注册与推送：提供基于回调方式的事件注册与推送
* 通用权限管理：灵活的基于用户组的权限管理
* 操作审计：用户操作行为的审计与回溯

如果想了解以上功能的详细说明，请参考[功能说明](https://bk.tencent.com/docs/markdown/CMDB/UserGuide/Introduce/Overview.md)

## Experience
* [在线体验蓝鲸CMDB](https://cmdb-exp.bktencent.com/start) 🔥 **用户名密码：admin:admin**
* [极速体验容器化部署蓝鲸CMDB](docs/wiki/container-support.md)

## Getting started
* [下载与编译](docs/overview/source_compile.md)
* [安装部署](docs/overview/installation.md)
* [版本升级说明](docs/wiki/db_upgrade.md)
* [API使用说明见这里](docs/apidoc/)
* [使用CMDB开源版替换社区版](docs/overview/upgrade-from-ce.md)
* [使用Helm部署CMDB到K8S环境](docs/support-file/helm/README.md)

## Roadmap
* [版本日志](docs/support-file/changelog/release.md)

## Support
- [wiki](https://github.com/TencentBlueKing/bk-cmdb/wiki)
- [白皮书](https://docs.bk.tencent.com/cmdb/)
- [蓝鲸论坛](https://bk.tencent.com/s-mart/community)
- [蓝鲸 DevOps 在线视频教程](https://bk.tencent.com/s-mart/video/)
- [蓝鲸社区版交流1群](https://jq.qq.com/?_wv=1027&k=5zk8F7G)
- 技术交流QQ群(305496802), 扫码入群戳[这里](docs/resource/img/qq.png)

## BlueKing Community
- [BK-CI](https://github.com/Tencent/bk-ci)：蓝鲸持续集成平台是一个开源的持续集成和持续交付系统，可以轻松将你的研发流程呈现到你面前。
- [BK-BCS](https://github.com/Tencent/bk-bcs)：蓝鲸容器管理平台是以容器技术为基础，为微服务业务提供编排管理的基础服务平台。
- [BK-PaaS](https://github.com/Tencent/bk-PaaS)：蓝鲸PaaS平台是一个开放式的开发平台，让开发者可以方便快捷地创建、开发、部署和管理SaaS应用。
- [BK-SOPS](https://github.com/Tencent/bk-sops)：标准运维（SOPS）是通过可视化的图形界面进行任务流程编排和执行的系统，是蓝鲸体系中一款轻量级的调度编排类SaaS产品。


## Contributing
如果你有好的意见或建议，欢迎给我们提 Issues 或 Pull Requests，为蓝鲸开源社区贡献力量。关于bk-cmdb分支管理、Issue 以及 PR 规范，
请阅读 [Contributing Guide](docs/CONTRIBUTING.md)。

[腾讯开源激励计划](https://opensource.tencent.com/contribution) 鼓励开发者的参与和贡献，期待你的加入。

## License

项目基于 MIT 协议，详细请参考 [LICENSE](LICENSE.txt)。

我们承诺未来不会更改适用于交付给任何人的当前项目版本的开源许可证（MIT 协议）。



# BK-CMDB 3.0的设计理念

BK-CMDB 3.0 是基于微服务架构设计的，整体分为四层，除了API网关和最底层的存储，中间的逻辑部分按照资源的操作边界进行了分层，分为业务场景层和资源管理层。

业务场景层中有各种贴近业务的场景服务，每个服务都有清晰的边界。场景服务与场景服务之间没有直接的耦合，并且每个场景服务都是无状态的，去中心化部署的。

资源管理层中有各种管理资源的抽象控制器，我们称之为controller，这个controller代理了对该资源的所有操作。

对每个场景层的服务而言，服务的逻辑是对各种资源的操作组合；对资源管理层的服务而言，服务的调用方都是各种不同的场景。

采用这种基于资源的分层设计，充分发挥了微服务架构中服务复用的特点，在实际应用中有几个好处：

* 可扩展性强
* 易于监控
* 系统热更新

## 可扩展性

如果业务场景需要扩展，只需要重新开发新的场景层服务，并复用资源管理层的服务和接口。新增的服务并不影响现有各服务的功能。

同样如果需要增加新的管理资源类型，只需要新开发对应的资源管理服务，并不影响既有资源管理服务的运行和场景层服务的功能。

## 易于监控

将资源的原子管理和复杂的场景分开，可以将资源操作的情况标准化、流程化，资源变更的捕获和推送也更精确。

同时，场景层只聚焦于专有场景的业务逻辑，在链路监控上的处理也更明确清晰。

## 系统热更新

得益于微服务架构的特点，资源管理和场景类服务分层处理后，新增的场景服务，和新增的资源管理服务都可以在不影响线上环境既有部署的情况下增量发布，并通过类似蓝绿发布或金丝雀发布的方式控制灰度的过程。

# 架构设计

# 蓝鲸智云配置平台的架构设计

![bk-cmdb.png](https://github.com/TencentBlueKing/bk-cmdb/blob/master/docs/resource/img/art_en.png?raw=true) 


蓝鲸智云配置平台（以下简称配置平台）整体为分层的微服务设计，可以分为以下四层：


1. **资源层（store）**：提供系统所需的资源存储、消息队列以及缓存系统服务


2. **服务层(service layer)**： 服务层划分为两大模块

    1. **资源管理模块**： 在配置平台中我们把资源类型进行了抽象，提供原子接口服务，支持横向扩展，每一类资源由一类微服务进程来管理。
    
    
    2. **业务场景模块**： 业务场景模块是基于资源管理模块的原子接口对应用场景的封装，基于操作的相关度，目前划分出【admin、auth、cloud、datacollection、operation、host、process、synchronize、task、topo】几个微服务。
      - admin服务负责系统的配置刷新、初始化数据写入等操作；
      - event服务负责系统的事件订阅与推送服务；
      - process、topo、host、cloud分别负责系统进程、拓扑模型、主机、云数据的使用场景；
      - datacollection 服务负责系统快照数据的接收与写入；
      - operation 服务提供与运营统计相关功能；
      - synchronize 服务提供数据同步功能；
      - auth 服务提供权限相关功能；
      - task 服务提供异步任务管理。


3. **接口层(api)**： 这一层是系统的api服务网关。

4. **web层(web)**： web层是系统提供的web服务。通过配置平台提供的web服务界面，用户可以进行资源的操作。

在架构图中有一点未体现出来的就是连接所有系统微服务的服务发现功能，基于zookeeper node watch 机制，我们构建了系统的服务注册与发现功能，从而使系统能保持高可用。 

为了规避微服务部署中配置文件的管理问题，我们基于zookeeper 构建了系统的配置中心服务，所有的配置文件在系统启动之初就通过admin-server 刷入 zookeeper ，每个进程只需要在zookeeper 中取自己需要的配置文件。

这两个模块的存在保证了系统的高可用以及服务的易用性。

# 蓝鲸智云配置平台的代码结构

# 蓝鲸智云配置平台的代码结构

![bk-cmdb.png](https://github.com/TencentBlueKing/bk-cmdb/blob/master/docs/resource/img/code.png?raw=true) 


## 1. web-server & ui

web-server是基于gin打造的web服务器， ui目录基于vue.js构建

## 2. test & tools

test 目录为系统服务的调用示例，tools 目录为客户端管理工具和辅助脚本工具


## 3. api_server

api-server基于开源go-restful 框架构建

## 4. scene_server

scene_server基于go-restful框架构建，以下为划分的微服务目录：
* admin_server
* auth_server
* cloud_server
* datacollection
* event_server
* host_server
* operation_server
* proc_server
* synchronize_server
* task_server
* topo_server


## 5. source_controller

source_controller基于go-restful框架构建，提供提供原子接口服务

## 6. common & storage & 
common 目录为项目的公共依赖库，storage是项目对存储接入的封装，thirdpartyclient是项目对第三方客户端接入的封装

# 数据库表结构设计

*说明：蓝鲸配置平台（蓝鲸CMDB）项目底层使用MongoDB进行数据存储，MongoDB是一个面向文档的数据库，因此它没有传统的表结构，而是使用集合（Collection）和文档（Document）来组织数据，本目录下文档中涉及的表结构和字段解释仅供参考，请以实际环境中的结构为准。*

## 表结构文档分类及作用

| 作用             | 分类文档                                              |
|----------------|---------------------------------------------------|
| 内置模型相关表        | [built-in_model](built-in_model.md)               |
| 业务下相关资源表       | [business](business.md)                           |
| 云资源相关功能表       | [cloud_resource](cloud_resource.md)               |
| 容器数据纳管功能相关表    | [container_data_manage](container_data_manage.md) |
| 字段组合模板功能相关表    | [field_template](field_template.md)               |
| 主机属性自动应用功能相关表  | [host_apply_rule](host_apply_rule.md)             |
| 实例相关表          | [instance](instance.md)                           |
| 主线模型相关表        | [mainline_model](mainline_model.md)               |
| 模型相关表          | [model](model.md)                                 |
| 运营分析功能相关表      | [operational_analysis](operational_analysis.md)   |
| 管控区域相关表        | [plat](plat.md)                                   |
| 服务模板功能相关表      | [service_template](service_template.md)           |
| 集群模板功能相关表      | [set_template](set_template.md)                   |
| 异步任务相关表        | [task](task.md)                                   |
| 资源目录用户自定义配置相关表 | [user_custom](user_custom.md)                     |
| 资源变更事件相关表      | [watch](watch.md)                                 |
| 不归属任何一种分类的表    | [other](other.md)                                 |


# 参考资料

[蓝鲸](https://github.com/TencentBlueKing/bk-cmdb)

* any list
{:toc}