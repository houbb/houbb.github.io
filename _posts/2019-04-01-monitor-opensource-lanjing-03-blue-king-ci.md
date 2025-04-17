---
layout: post
title: 蓝鲸持续集成平台(蓝盾) ci
date:  2019-4-1 19:24:57 +0800
categories: [Monitor]
tags: [monitor, apm, api, ci, devops, ITIL, sf]
published: true
---

# CI

> **重要提示**: `master` 分支在开发过程中可能处于 *不稳定或者不可用状态* 。

请通过[releases](https://github.com/tencent/bk-ci/releases) 而非 `master` 去获取稳定的二进制文件。

bk-ci是一个免费并开源的CI服务，可助你自动化构建-测试-发布工作流，持续、快速、高质量地交付你的产品。

使用bk-ci屏蔽掉所有研发流程中的繁琐环节，让你聚焦于编码。它通常被用于：
- 工程编译
- 静态代码检查
- 运行测试用例，及时发现BUG
- 部署与发布

bk-ci提供了流水线、代码检查、代码库、凭证管理、环境管理、研发商店、编译加速、制品库 8 大核心服务，多重组合，满足企业不同场景的需求：

- **流水线**：将团队现有的研发流程以可视化方式呈现出来，编译、测试、部署，一条流水线搞定
- **代码检查**：提供专业的代码检查解决方案，检查缺陷、安全漏洞、规范等多种维度代码问题，为产品质量保驾护航。
- **代码库**：将企业内已有的代码托管服务关联至bk-ci
- **凭证管理**：为代码库、流水线等服务提供不同类型的凭据、证书管理功能
- **环境管理**：可以将企业内部的开发编译机托管至bk-ci
- **研发商店**：由流水线插件和流水线模板组成，插件用于对接企业内部的各种第三方服务，模板助力企业内部的研发流程规范化
- **编译加速**：基于蓝鲸自研加速引擎，支持C/C++编译、UE4 代码编译、UE4 Shader 编译等多场景下的加速，让构建任务飞起来
- **制品库**：基于分布式存储，可无限扩展，数据持久化使用对象存储，支持COS、S3。功能包含制品扫描、分发、晋级、代理、包管理等，提供多种依赖源仓库，如generic(二进制文件)、maven、npm、pypi、oci、docker、helm、composer、nuget

## Overview
- [架构设计](docs/overview/architecture.md)
- [代码目录](docs/overview/code_framework.md)
- [设计理念](docs/overview/design.md)

## Features
- 持续集成和持续交付: 由于框架的可扩展性，bk-ci既可以用作简单的CI场景，也可以成为企业内所有项目的持续交付中心
- 所见即所得:  bk-ci提供了灵活的可视化编排流水线，动动指尖，将研发流程描述与此
- 架构平行可扩展: 灵活的架构设计可以随意横向扩容，满足企业大规模使用
- 分布式: bk-ci可以便捷的管控多台构建机，助你更快的跨多平台构建、测试和部署
- 流水线插件: bk-ci拥有完善的插件开发体系，其具备了低门槛、灵活可扩展等特性
- 流水线模板: 流水线模板将是企业内部推行研发规范的一大助力
- 代码检查规则集：沉淀团队的代码要求，并能跨项目共享和升级
- 制品库：单一可信源，统一制品仓库，方便管理，提供软件供应链保护

## Experience
- [bk-ci in docker](https://hub.docker.com/r/blueking/bk-ci)
- [bk-repo in docker](https://hub.docker.com/r/bkrepo/bkrepo)

## Getting started
- [下载与编译](docs/overview/source_compile.md)
- [一分钟安装部署](docs/overview/installation.md)
- [独立部署制品库](docs/storage/README.md)

## Support
1. [GitHub讨论区](https://github.com/Tencent/bk-ci/discussions)
2. QQ群：495299374

## BlueKing Community

- [BK-BCS](https://github.com/Tencent/bk-bcs)：蓝鲸容器管理平台是以容器技术为基础，为微服务业务提供编排管理的基础服务平台。
- [BK-CMDB](https://github.com/Tencent/bk-cmdb)：蓝鲸配置平台（蓝鲸CMDB）是一个面向资产及应用的企业级配置管理平台。
- [BK-JOB](https://github.com/Tencent/bk-job)：蓝鲸作业平台(Job)是一套运维脚本管理系统，具备海量任务并发处理能力。
- [BK-PaaS](https://github.com/Tencent/bk-PaaS)：蓝鲸PaaS平台是一个开放式的开发平台，让开发者可以方便快捷地创建、开发、部署和管理SaaS应用。
- [BK-SOPS](https://github.com/Tencent/bk-sops)：蓝鲸标准运维（SOPS）是通过可视化的图形界面进行任务流程编排和执行的系统，是蓝鲸体系中一款轻量级的调度编排类SaaS产品。
- [BK-Repo](https://github.com/Tencentblueking/bk-repo)：蓝鲸制品库平台是一套为企业提供各种类型制品包存储、代理、分发、晋级、扫描、依赖包管理的持续交付平台。
- [BK-Turbo](https://github.com/Tencentblueking/bk-turbo): 蓝鲸编译加速平台为CI场景下提供UE、C/C++等多种语言的编译加速服务能力

## Contributing
- 关于 bk-ci 分支管理、issue 以及 pr 规范，请阅读 [Contributing](CONTRIBUTING.md)
- [腾讯开源激励计划](https://opensource.tencent.com/contribution) 鼓励开发者的参与和贡献，期待你的加入


## License
BK-CI 是基于 MIT 协议， 详细请参考 [LICENSE](LICENSE.txt)

我们承诺未来不会更改适用于交付给任何人的当前项目版本的开源许可证（MIT 协议）。

# BK-CI 的设计理念

在技术架构上，bk-ci自研了一套持续集成框架和流水线引擎，目的是增强平台安全性、稳定性和可扩展性，保证服务的高可用。
- 我们把研发体系中需要的每个单独功能抽离成一个微服务，通过分解巨大单体式应用为多个服务方法来分解复杂模块，这样就保证了每个服务相对简单，结构清晰，方便测试；
- 微服务体系还会对接企业内其他团队的服务，每一个服务都可以加入到bk-ci中为整个研发体系提供服务；
- 可以水平的动态扩展子服务，遇到性能瓶颈时可以弹性的增加子服务来满足业务需求；
- 一个微服务的异常不会导致其它微服务同时异常。通过隔离、融断等技术可以避免极大的提升微服务的可靠性；
- 微服务还可以保证我们每个子服务可以独立部署和灰度，加快后台服务的迭代，使平台本身的持续交付成为可能。

# 蓝鲸持续集成平台(BK-CI)架构设计

![struct](https://github.com/TencentBlueKing/bk-ci/blob/master/docs/resource/img/architecture.png?raw=true)

蓝鲸持续集成平台(简称**bk-ci** )是基于 kotlin/java/js/go/lua/shell等多种语言编写实现的，采用完全前后分离，插件式开发，具备高可用可扩展的服务架构设计：

- **前端&接口网关(WebAPI Gateway & FrontEnd) ：**

  - **WebAPI Gateway：** 由OpenResty负责，包含了对接用户登录及身份鉴权，和后端API的**Consul**服务发现转发的lua脚本及Nginx配置
  - **FrontEnd：** 基于VUE的纯前端工程，包含一序列的js,img和html等静态资源。

- **后端服务(MicroService BackEnd)：** 基于Kotlin/Java编写，采用SpringCloud框架的微服务架构设计，以下按各微服务模块的启动顺序介绍：

  - **Project：** 项目管理，负责管理流水线的项目，多个模块依赖于此。
  - **Log：** 构建日志服务，负责接收构建的日志的转发存储和查询输出。
  - **Ticket：** 凭证管理服务，存储用户的凭证信息，比如代码库帐号密码/SSL/Token等信息。
  - **Repository:** 代码库管理服务，存储用户的代码库，依赖于Ticket的联动。
  - **Artifactory:** 制品构件服务，该服务只实现了简化版的存取构件功能，可扩展对接自己的存储系统。
  - **Environment:** 构建机服务，导入构建机以及用环境管理构建机集群用于构建调度的并发。
  - **Store：** 研发商店服务，负责管理流水线扩展插件和流水线模板功能，包括插件&模板升级上下架，与process和artifactory联动。
  - **Process：** 流水线管理，负责管理流水线以及流水线编排调度功能的核心服务。
  - **Dispatch：** 构建（机）调度，负责接收流水线的构建机启动事件，分发给相应构建机处理。
  - **Plugin：** 服务的插件扩展服务，目前为空，主要是用于提供给后续扩展一些与前端页面联动的后台服务，比如对接各类CD平台，测试平台，质量检查平台等等，与前端页面配置，想象空间很大。

- **资源服务层(Resource)：** 包括提供存储和必须的基础中间件等。
  - **Storage(存储服务):** 存储服务/中间件等一序列依赖的基础环境。
    - **MySQL/MariaDB：** bk-ci的主数据库存储，可用mysql 5.7.2 /mariadb 10.x存储以上所有微服务的关系型数据。
    - **Redis：** 核心服务缓存，3.x版本，缓存构建机信息和构建时的信息和提供分布式锁操作等等。
    - **ElasticSearch：** 日志存储，log模块对接ES来对构建的日志做存取。
    - **RabbitMQ：** 核心消息队列服务，bk-ci的流水线事件机制是基于RabbitMQ来流转事件消息的。
    - **FileSystem：** 这块主要为artifactory提供服务，用于存储插件，构建产物等二进制文件服务，可对接文件或者云存储类，扩展在artifactory服务模块。
    - **Consul：** 作为微服务的服务发现Server，需要搭建Consul Server， 以及在bk-ci微服务部署的所在机器上同时安装Consul并以 Agent方式运行。  组建集群可以直接用bk-ci微服务部署机器(2台)上直接以consul server和agent方式直接启动，以减少对机器数的需求。

  - **Agent(构建机):**   构建机是负责运行CI打包编译构建的一台服务器/PC，是由比如go，gcc，java，python，nodejs等等编译环境依赖，再加上运行由bk-ci提供编写实现的两部分服务进程：
    - **Agent：** 由Golang编写实现，分DevopsDaemon和DevopsAgent两个进程 ：
      - **DevopsDaemon：** 负责守护和启动DevopsAgent。
      - **DevopsAgent：** 负责与**Dispatch**和**Environment**微服务通信，负责整个**Agent**的升级和**Worker**(任务执行器) 进程的启动和销毁工作。
    - **Worker：** 由Kotlin编写实现，是一个命名为agent.jar的文件，任务真正的执行者。被**DevopsAgent**通过jre来拉起运行，之后会负责与**Process微服务模块**通信，领取插件任务并执行和上报结果(**Log&Process**)。


# 蓝鲸持续集成平台(BK-CI)的代码结构


```
|- bk-ci
  |- docs  
  |- scripts
  |- src
    |- agent
    |- backend
    |- frontend
    |- gateway
  |- support-files
```

## 工程源码(src)

工程是混合了vue/lua/kotlin/java/go/shell 等几种语言，按分层逻辑分网关、前端、后端、Agent、流水线插件等工程

### 网关工程代码(gateway)

```
|- bk-ci/src
  |- gateway
    |- html     # 存放各种状态码的HTML标准模板，可替换
    |- lua      # 存放lua脚本
      |- *.lua  # 包含一些lua脚本，主要关注init.lua 脚本，包含了一些重要配置
      |- resty  # 包含resty公用代码，比如MD5，uuid，cookie等开源实现
    |- *.conf   # 包含各类conf配置，主要关注server.devops.conf和auth.conf配置文件
```

网关采用OpenResty，其基于Nginx与Lua的高性能Web服务器，通过lua脚本扩展实现对接Consul的微服务路由发现，以及用户鉴权身份认证的对接功能。 



### 前端代码(frontend)
```
|- bk-ci/src
  |- frontend
    |- devops-atomstore   # 研发商店 Store
    |- devops-codelib     # 代码库管理 Code
    |- devops-environment # 环境管理 Env
    |- devops-pipeline    # 流水线 Pipeline
    |- devops-ticket      # 凭证管理 Ticket
    |- devops-nav         # 顶部菜单导航 Nav
    |- svg-sprites        # 矢量图片
      
```

前端基于VUE开发。按服务模块划分目录结构。




### 后端微服务(kotlin/gradle)&Agent代码(go)

```
|- bk-ci/src
  |- agent         # agent基于go语言编写，用于在构建机上运行DevopsDaemon&DevopsAgent
  |- backend
    |- project                  # 项目微服务总目录
      |- api-project            # api定义抽象层
      |- api-project-sample     # 默认与对接不同平台有差异的部分的api定义抽象层
      |- api-project-blueking   # 对接蓝鲸特有差异api定义抽象层
      |- api-project-op         # 运营后台操作类api定义抽象层
      |- biz-project            # api和业务服务实现层，如有一些需要扩展抽象则会放到sample示例实现
      |- biz-project-blueking   # 对接蓝鲸平台的业务服务实现
      |- biz-project-sample     # 业务服务实现扩展示例，主要是示例如何扩展实现
      |- biz-project-op         # 运营后台操作类api的实现
      |- boot-process           # 构建springboot微服务包，设置依赖构建并输出到release目录
      |- model-process          # 使用JOOQ从db中动态生成的PO，表结构有变更需要clean后重新build
    |- boot-assembly            # 用于构建单体微服务，整合所有微服务的单体jar包
    |- common                   # 通用模块
      |- common-auth            # 权限模块
        |- common-auth-api      # 权限模块的接口抽象
        |- common-auth-provider   # 权限模块接口实现
    |- dispatch    # 构建调度微服务总目录
    |- environment # 环境管理微服务总目录
    |- log         # 日志微服务总目录
    |- artifactory # 构件仓库微服务总目录
    |- process     # 流水线微服务总目录
    |- release     # 本地打包生成的目录，输出jar的目录
    |- repository  # 代码仓库微服务总目录
    |- store       # 研发商店微服务总目录
    |- ticket      # 凭证微服务总目录
    |- worker      # 构建机worker子模块
      |- worker-agent   # 构建机中的agent.jar 用于收发构建任务，可gradle依赖引入新增功能
      |- worker-api-sdk # 与后端微服务通信定义的各类api的实现和抽象
      |- worker-common  # agent.jar依赖通用实现和api抽象
      |- worker-plugin-archive # 与构件归档相关的内置任务插件的实现，被引入到agent中
      |- worker-plugin-scm     # 与拉取代码相关实现的内置git任务插件的实现，被引入到agent中
```



### 流水线插件SDK&Demo(java/maven)

该SDK是用于开发流水线插件的Java版SDK，编写出来的插件将在研发商店Store上架提供给使用者安装，最后在流水线中可以选择使用。 具体看目录里面的readme


```
|- bk-ci/src
  |- pipeline-plugin
    |- bksdk    # 插件SDK
    |- demo     # 一个流水线插件的starter示例, 后续开发插件自行管理代码，不存放到此处。
```

## 配置文件模板(support-files)

```
|- bk-ci/support-files
  |- agent-package  # 在部署初始化时需要分发到主程序目录下，用于存放agent安装包供下载
  |- file           # 在部署初始化时需要分发到application-artifactory.yml指定的目录下
  |- sql            # sql初始化脚本，在开发编译时就需要先初始化，否则JOOQ无法正常生成PO
  |- template       # 所有需要做替换部署配置/脚本文件
```

- template 目录文件说明:
  - 文件中的 #表示当前文件的相对路径分隔符号，如#etc#bkci#common.yml   ，假设蓝鲸总根目录在/data/bkee/， 则表示该文件最终要改名后最终路径是/data/bkee/etc/ci/common.yml
  - 关于占位符号 ，则看support-files/README.md

## 安装脚本(scripts)

存放一些自动化安装替换脚本。待补充。

```
|- bk-ci
  |- scripts
    |- bkenv.properties   # 用到的一些配置变量定义，需要人工去修改 
    |- render_tpl         # shell脚本，用于帮助用户快速的替换所有配置并放到指定目录下去。
```





# 参考资料

https://github.com/TencentBlueKing/bk-ci

* any list
{:toc}