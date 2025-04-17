---
layout: post
title: 蓝鲸作业平台(Job)是一套运维脚本管理系统，具备海量任务并发处理能力
date:  2019-4-1 19:24:57 +0800
categories: [Monitor]
tags: [monitor, apm, api, ci, devops, sf]
published: true
---


# JOB

> **重要提示**: `master` 分支在开发过程中可能处于 *不稳定或者不可用状态* 。
请通过[releases](https://github.com/tencent/bk-job/releases) 而非 `master` 去获取稳定的二进制文件。

蓝鲸作业平台(Job)是一套运维脚本管理系统，具备海量任务并发处理能力。

除了支持脚本执行、文件分发、定时任务等一系列基础运维场景以外，还支持通过流程调度能力将零碎的单个任务组装成一个自动化作业流程；

而每个作业都可做为一个原子节点，提供给上层或周边系统/平台使用，实现跨系统调度自动化。

## Benefits

### 安全可靠的高危命令检测能力

作为底层面向服务器OS的原子操作平台，对用户操作指令是否合规、安全的检测至关重要！

作业平台支持通过正则表达式设置各种不同脚本语言的高危命令语句检测规则，并且提供被阻拦的操作日志；即便是周边系统通过 API 形式调度执行，也能够被实时检测拦截，让服务器操作更安全！

### 完善的脚本版本管理

云化脚本版本管理模式，贴合现代化开放协同的理念，协作者之间借助平台便捷的共享脚本资源；利用版本管理功能，您可以很好的控制版本的上/下线状态，并能够在出安全漏洞时快速禁用、及时止损！

### 作业编排，一切皆场景

当一个操作场景需要多个步骤串联执行时，如果手工一个个去点击执行，那么效率实在太低了！并且，也没办法很好的沉淀下来，方便后续持续使用和维护。

作业平台的作业管理功能很好的解决了这个问题，用户可以在「作业模板」中配置好相应的执行步骤，然后再根据需求场景衍生对应的「执行方案」；如此，即清晰的区分开作业模板和实例的关系，避免强耦合关系，也便于后续对使用场景的管理和维护。

### 原汁原味的 Cron 定时任务

保留了 Linux 原生的 Crontab 定时任务使用习惯，让运维同仁能够更平滑、快速的上手；更有贴心的监测功能助您发现及时掌握定时任务的动向和执行情况。

### 高扩展性的文件源管理能力

在文件分发的需求场景中，我们除了从远程服务器、本地文件作为传输源以外，还可能需要从对象存储、FTP、Samba等不同的文件系统/服务获取文件；

为了满足这种多元化的文件源对接诉求，我们开放了文件源插件的能力，支持开发者根据自己的文件系统类型开发插件对接作业平台的文件源管理模块，从而实现从不同文件系统分发的能力。

bk-job 提供了快速执行、任务编排、定时执行等核心服务，多重组合，满足企业不同场景的需求：

- **快速执行**：提供临时性且多变的快速一次性操作入口，用完即走
- **任务编排**：对于重复性的操作组合，可以通过编排功能将其沉淀为“作业”，方便管理和使用
- **定时执行**：支持用户按业务逻辑诉求设置周期性或一次性的定期执行计划
- **脚本管理**：将脚本以云化模式统一管理，更好的支持作业编排和周边系统调度的灵活度
- **账号管理**：管理服务器OS的执行账户，如Linux的 root，Windows的 administrator 等等
- **消息通知**：满足业务按管理需求设置任务不同状态的执行结果消息通知
- **文件源管理**：开放文件源对接插件能力，满足从不同文件系统类型拉取文件并传输的诉求
- **运营分析**：提供平台的运营统计数据展示，助力管理员更全方位的了解平台的运行情况
- **平台管理**：丰富的平台管理员工具，包括但不仅限于信息更改、消息渠道设置、高危语句检测规则、功能限制设置、公共脚本管理、后台服务状态展示等等

## Overview

- [架构设计](docs/overview/architecture.md)
- [代码目录](docs/overview/code_framework.md)
- [设计理念](docs/overview/design.md)

## Features

详情可见蓝鲸官网[作业平台产品白皮书](https://bk.tencent.com/docs/document/6.0/125/5748)

## Getting started
- [下载与编译](docs/overview/source_compile.md)
- [部署与运维](docs/overview/operation.md)

## Support
1. [GitHub讨论区](https://github.com/Tencent/bk-job/discussions)

## BlueKing Community
- [BK-BCS](https://github.com/Tencent/bk-bcs)：蓝鲸容器管理平台是以容器技术为基础，为微服务业务提供编排管理的基础服务平台。
- [BK-CI](https://github.com/Tencent/bk-ci)：蓝鲸持续集成平台是一个免费并开源的CI服务，让开发者可以自动化构建-测试-发布工作流，持续、快速、高质量地交付产品。
- [BK-CMDB](https://github.com/Tencent/bk-cmdb)：蓝鲸配置平台（蓝鲸CMDB）是一个面向资产及应用的企业级配置管理平台。
- [BK-PaaS](https://github.com/Tencent/bk-PaaS)：蓝鲸PaaS平台是一个开放式的开发平台，让开发者可以方便快捷地创建、开发、部署和管理SaaS应用。
- [BK-SOPS](https://github.com/Tencent/bk-sops)：蓝鲸标准运维（SOPS）是通过可视化的图形界面进行任务流程编排和执行的系统，是蓝鲸体系中一款轻量级的调度编排类SaaS产品。

## Contributing
- 关于 bk-job 分支管理、issue 以及 pr 规范，请阅读 [Contributing](CONTRIBUTING.md)
- [腾讯开源激励计划](https://opensource.tencent.com/contribution) 鼓励开发者的参与和贡献，期待你的加入

## License
BK-JOB 是基于 MIT 协议， 详细请参考 [LICENSE](LICENSE.txt)

我们承诺未来不会更改适用于交付给任何人的当前项目版本的开源许可证（MIT 协议）。

# BK-JOB的设计理念

- 批量执行：满足多业务、多主机、高并发完成脚本/文件分发任务
- 安全管控：对执行者权限、脚本本身安全性进行有效检查与拦截
- 资源复用：对脚本、作业、执行目标等通用资源进行抽象，提供复用途径
- 上层应用：基于执行内容提供上层记录、检索、统计分析、流程编排等场景服务
- 灵活扩展：文件源管理部分采用可扩展架构，支持通过文件源接入点接入多种异构文件源

# 蓝鲸作业平台(BK-JOB)架构设计

## 介绍

蓝鲸作业平台(简称**bk-job** )是蓝鲸的**基础原子平台**之一，通过蓝鲸管控平台(GSE)的**“文件管道”和“命令管道”**，提供了作业编排、脚本执行、文件分发等能力。

![BluekingArchitecture](https://github.com/TencentBlueKing/bk-job/raw/master/docs/resource/img/bk_architecture_cn.png?raw=true)

## 作业平台整体架构

![Architecture](https://github.com/TencentBlueKing/bk-job/blob/master/docs/resource/img/architecture.png?raw=true)

### 前端(FrontEnd)

  使用ES6语法，采用MVVM框架vue.js，通过webpack4打包构建。

### 后端(BackEnd)

基于Java编写，采用主流的SpringBoot+SpringCloud框架的微服务架构设计。以下按各微服务模块进行介绍：

  - **配置中心：** 二进制版本的配置中心，统一管理所有微服务的配置信息。
  - **Job 网关：** 微服务网关，负责认证、限流、请求路由等。
  - **作业管理：** 作业管理微服务，负责管理作业平台中的多种资源，具体包含脚本、账号、作业模板、执行方案、消息通知、全局设置等。
  - **执行引擎：** 作业执行微服务，对接蓝鲸GSE，负责向GSE提交文件分发/脚本执行任务、拉取任务日志、流转任务状态。
  - **执行日志服务：** 日志管理微服务，对接底层MongoDB，负责存储脚本执行、文件分发及文件源文件下载过程中产生的日志。
  - **定时任务：** 定时任务微服务，基于Quartz定时引擎，实现bk-job的定时任务调度与管理。
  - **备份归档：** 备份管理微服务，负责bk-job中的作业导入导出及作业执行流水历史数据的定期归档任务。
  - **统计分析：** 统计分析微服务，为首页异常作业提示与运营分析模块提供后台接口，调度大量定时任务从其他微服务模块获取元数据进行分析与统计，生成分析结果数据与统计数据，为bk-job提供运营数据支撑、提高平台易用性。
  - **文件源网关：** 文件网关微服务，通过与FileWorker通信对接多种不同类型的第三方文件源（如对象存储、文件系统存储等），负责调度文件源文件下载任务，与执行引擎配合完成第三方文件源文件分发。
  - **文件源接入点：** 文件源接入点，独立于其他bk-job后台微服务的可扩展模块，可部署多个实例，与文件网关进行通信，对接不同类型的第三方文件源，是文件下载任务的执行者。

### 存储、基础中间件

  - **Consul：** 仅用于物理部署方式，用作服务发现。需要搭建Consul Server， 以及在bk-job微服务部署的所在机器上同时安装Consul并以 Agent方式运行。
  - **RabbitMQ：** 消息队列服务。作业执行模块使用 RabbitMQ 实现基于消息的事件驱动任务调度引擎
  - **MySQL：** bk-job的主数据库存储，存储微服务的关系型数据。
  - **Redis：** 分布式缓存，用于实现分布式锁、数据缓存等。
  - **MongoDB：** bk-job的作业执行日志数据库，用于存储脚本执行/文件分发过程中产生的日志数据。
  - **NFS：** 一方面用于本地分发文件场景中存储用户上传的本地文件，另一方面用于存储作业导入或导出时生成的临时文件。

# 蓝鲸作业平台(BK-JOB)的代码结构

[English](code_framework.en.md) | 简体中文

```shell script
|- bk-job
  |- docs
  |- scripts
  |- src
    |- backend
    |- frontend
  |- support-files
  |- versionLogs
```
## 工程源码(src)
工程混合了vue/java/shell等几种语言，按功能划分为前端、后端、支撑文件、版本日志、运维脚本等子目录。
### 前端代码(frontend)
```shell script
|- bk-job/src
  |- frontend/src
    |- lib   # 依赖的第三方库源码
    |- src
      |- common     # 公共模块
      |- components # 公共交互组件
      |- css        # 全局css
      |- domain   
        |- model            # 业务模型
        |- service          # 后端api服务
        |- source           # 后端api配置
        |- variable-object  # 服务于前端逻辑的变量对象
      |- i18n       # 全局公用的国际化
      |- images     # 静态资源图片
      |- router     # 路由配置
      |- store      # 状态管理
      |- utils      # 公共方法
      |- views      # 系统模块
        |- account-manage          # 账号管理
          |- index.vue                # 模块入口
          |- local.js                 # 模块国际化
          |- routes.js                # 模块路由表配置
        |- cron-job                   # 定时任务
        |- dangerous-rule-manage   # 高危语句配置
        |- dashboard               # 运营分析
        |- detect-records          # 高危语句拦截记录
        |- executive-history       # 任务执行历史
        |- fast-execution          # 快速执行
        |- file-manage             # 文件管理
        |- home                    # 业务概览
        |- notify-manage           # 消息通知
        |- plan-manage             # 执行方案管理
        |- public-script-manage    # 公共脚本管理
        |- script-manage           # 脚本管理
        |- script-template         # 脚本模板
        |- service-state           # 服务状态
        |- setting                 # 全局设置
        |- task-manage             # 作业管理
        |- ticket-manage           # 凭证管理
        |- white-ip                # IP白名单
        |- 404.vue                 # 路由404页面
        |- business-permission.vue # 无业务权限页面
        |- index.vue               # 系统模块入口文件
      |- App.vue            # 页面渲染入口
      |- iframe-app.vue     # 通过iframe访问时页面渲染入口
      |- layout-new.vue     # 导航布局
      |- main.js            # 前端入口文件
    |- index-dev.html    # dev本地开发服务入口
    |- index.html        # build服务入口
    |- webpack.config.js # webpack配置
```

### 后端微服务代码(backend)
```shell script
|- bk-job/src
  |- backend
    |- buildSrc     # 自定义Gradle Task，实现打包过程中的特殊操作
    |- commons      # 公共模块
      |- cmdb-sdk   # 对接蓝鲸配置平台(CMDB)公共代码
      |- cmdb-sdk-ext  # 在CMDB-SDK基础上加入Redis限流器
      |- common        # 通用常量、异常等公共代码
      |- common-i18n   # 国际化
      |- common-iam    # 对接蓝鲸权限中心
      |- common-redis  # Redis操作
      |- common-security   # 安全控制
      |- common-spring-ext # 通用Spring扩展(自定义listener、processor等)
      |- common-statistics # 通用统计相关
      |- common-utils  # 通用工具类
      |- common-web    # Web工具(filter、interceptor等)
      |- esb-sdk    # 对接蓝鲸ESB
      |- gse-sdk    # 对接蓝鲸GSE
      |- paas-sdk   # 对接蓝鲸PaaS平台
    |- job-analysis # 统计分析微服务
      |- api-job-analysis     # API定义抽象层
      |- boot-job-analysis    # 启动类及相关配置
      |- model-job-analysis   # JOOQ自动生成的表结构模型类存放目录
      |- service-job-analysis # 业务逻辑实现层
    |- job-backup   # 备份管理微服务
    |- job-config   # 配置中心微服务
    |- job-crontab  # 定时任务微服务
    |- job-execute  # 作业执行微服务
    |- job-file-gateway     # 文件网关微服务
    |- job-file-worker      # 文件源接入点实现
    |- job-file-worker-sdk  # 文件源接入点公共逻辑SDK
    |- job-gateway  # 微服务网关
    |- job-logsvr   # 日志管理微服务
    |- job-manage   # 作业管理微服务
    |- upgrader     # 版本间升级辅助工具
```

### 支撑文件(support-files)
```shell script
|- bk-job/support-files
  |- bkiam     # 存放记录权限模型变更的迁移文件
  |- sql       # 存放记录MySQL数据库表结构变更的迁移文件
  |- templates # 存放各微服务部署时需要用环境变量替换的配置模板文件
```

### 版本日志(versionLogs)
存放中英文两种语言的版本日志与对应的前端资源生成脚本。

### 运维脚本(scripts)
存放后台各微服务的启动/停止/重启等操作的运维脚本。



# 参考资料

https://github.com/TencentBlueKing/bk-job

* any list
{:toc}