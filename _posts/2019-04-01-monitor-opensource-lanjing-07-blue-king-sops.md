---
layout: post
title: 蓝鲸智云标准运维(SOPS)
date:  2019-4-1 19:24:57 +0800
categories: [Monitor]
tags: [monitor, apm, api, ci, devops, sf]
published: true
---

# SOPS 

标准运维（SOPS）是通过可视化的图形界面进行任务流程编排和执行的系统，是腾讯蓝鲸产品体系中一款轻量级的调度编排类SaaS产品。

标准运维有两大核心服务。一个是流程编排服务：基于腾讯蓝鲸PaaS平台的API网关服务，对接企业内部各个系统 API的能力，
将在多系统间切换的工作模式整合到一个流程中，实现一键自动化调度。另一个是自助化服务：标准运维屏蔽了底层系统之间的差异，
让运维人员可以将业务日常的运维工作交给产品、开发、测试等人员执行，实现业务发布、变更等日常工作的自助化，除此之外，为降低非运维人员的操作成本，
标准运维与蓝鲸PaaS平台深度整合，为用户提供了“轻应用”和“职能化”功能，提高自助率。

标准运维后台使用 Python 作为开发语言，使用 Django 开发框架；前端使用 Vue 开发页面，使用 jQuery 开发标准插件，通过配置式的开发模式，
不断降低用户开发标准插件前端表单的难度。

> 底层流程引擎 SDK：[bamboo-engine](https://github.com/TencentBlueKing/bamboo-engine)

## Overview
- [架构设计](docs/overview/architecture.md)
- [代码目录](docs/overview/code_structure.md)
- [使用场景](docs/overview/usecase.md)


## Features
- 多元接入支持：标准运维对接了蓝鲸通知、作业平台、配置平台等服务，作为官方标准插件库提供服务，还支持用户自定义接入企业内部系统，定制开发标准插件。
- 可视化流程编排：通过拖拽方式组合标准插件节点到一个流程模板。
- 多种流程模式：支持标准插件节点的串行、并行，支持子流程，可以根据全局参数自动选择分支执行，节点失败处理机制可配置。
- 参数引擎：支持参数共享，支持参数替换。
- 可交互的任务执行：任务执行中可以随时暂停、继续、撤销，节点失败后可以重试、跳过。
- 通用权限管理：通过配置平台同步业务角色，支持流程模板的使用权限控制。

了解更多功能，请参考[标准运维白皮书](https://bk.tencent.com/docs/)


## Getting started
- [开发环境后台部署](docs/install/dev_deploy.md)
- [开发环境前端部署](docs/install/dev_web.md)
- [正式环境源码部署](docs/install/source_code_deploy.md)
- [正式环境上传部署](docs/install/upload_pack_deploy.md)
- [移动端部署](docs/install/mobile_deploy.md)
- [标准插件开发](docs/develop/dev_plugins.md)
- [标准插件开发最佳实践](docs/develop/dev_plugin_best_practices.md)
- [标准运维开发者工具包](docs/develop/bksops-developer-tools.md)


## Usage
- [API使用说明](https://bk.tencent.com/docs/document/6.0/167/13157)
- [标准插件说明](docs/features/plugin_usage.md)
- [标准插件远程加载](docs/features/remote_plugins.md)
- [变量引擎](docs/features/variables_engine.md)
- [Tag使用和开发说明](docs/develop/tag_usage_dev.md)
- [移动端使用说明](docs/features/mobile.md)
- [redis 部署模式支持](docs/features/redis_usage.md)
- [版本升级注意事项](docs/ops/version_update_notes.md)
- [故障排查手册](docs/ops/fault_detection_manual.md)

## Releases
- [已发布版本](https://github.com/TencentBlueKing/bk-sops/releases)

## BlueKing Community

- [BK-CMDB](https://github.com/Tencent/bk-cmdb)：蓝鲸配置平台（蓝鲸 CMDB）是一个面向资产及应用的企业级配置管理平台。
- [BK-CI](https://github.com/Tencent/bk-ci)：蓝鲸持续集成平台是一个开源的持续集成和持续交付系统，可以轻松将你的研发流程呈现到你面前。
- [BK-BCS](https://github.com/Tencent/bk-bcs)：蓝鲸容器管理平台是以容器技术为基础，为微服务业务提供编排管理的基础服务平台。
- [BK-PaaS](https://github.com/Tencent/bk-paas)：蓝鲸 PaaS 平台是一个开放式的开发平台，让开发者可以方便快捷地创建、开发、部署和管理 SaaS 应用。
- [BK-SOPS](https://github.com/TencentBlueKing/bk-sops)：标准运维（SOPS）是通过可视化的图形界面进行任务流程编排和执行的系统，是蓝鲸体系中一款轻量级的调度编排类 SaaS 产品。
- [BK-JOB](https://github.com/Tencent/bk-job)：蓝鲸作业平台(Job)是一套运维脚本管理系统，具备海量任务并发处理能力。

## Support
- [源码](https://github.com/TencentBlueKing/bk-sops/tree/master)
- [wiki](https://github.com/TencentBlueKing/bk-sops/wiki)
- [白皮书](https://bk.tencent.com/docs/)
- [蓝鲸论坛](https://bk.tencent.com/s-mart/community)
- [蓝鲸 DevOps 在线视频教程](https://bk.tencent.com/s-mart/video/)
- 联系我们，加入腾讯蓝鲸运维开发交流群：878501914

## Contributing
如果你有好的意见或建议，欢迎给我们提 Issues 或 Pull Requests，为蓝鲸开源社区贡献力量。关于标准运维分支管理、Issue 以及 PR 规范，
请阅读 [Contributing Guide](docs/CONTRIBUTING.md)。

[腾讯开源激励计划](https://opensource.tencent.com/contribution) 鼓励开发者的参与和贡献，期待你的加入。

## FAQ
[FAQ](docs/wiki/faq.md)


## License
标准运维是基于 MIT 协议， 详细请参考 [LICENSE](LICENSE.txt) 。

我们承诺未来不会更改适用于交付给任何人的当前项目版本的开源许可证（MIT 协议）。

# 使用场景

标准运维主要用于运维场景，如业务发布、变更、开区、扩缩容、故障处理等执行类操作；通过接入自定义插件，对接企业内其他系统，如单据系统、

版本管理系统等，也能应用到监控告警、配置管理、开发工具、企业IT、办公应用等场景。

# 架构设计

![](https://github.com/TencentBlueKing/bk-sops/raw/master/docs/resource/img/architecture.png?raw=true)

这是标准运维的逻辑架构图，可以分为四层：

- API 网关层

主要负责通过API网关和第三方平台进行交互，标准运维插件的实际执行就是通过这一层把请求分发给依赖的系统。

- 流程引擎层

负责解析上层的任务实例，映射节点插件对应的服务，并通过底层的蓝鲸API网关调用其他系统的API（如配置平台的创建集群，作业平台的快速执行脚本等），流程引擎还包括了具体的任务执行引擎和流程控制、上下文管理等模块。

- 任务管理层

主要对应标准运维的任务编排和任务控制功能，任务编排包含基础单元插件框架和插件展示层，任务控制包括创建任务实例的模板校验和参数校验，以及任务实例执行时给用户提供的操作接口如暂停、继续、撤销任务等。

- 接入层

包含权限控制、API接口和数据统计等。

# 代码目录

![](https://github.com/TencentBlueKing/bk-sops/raw/master/docs/resource/img/code_structure.png?raw=true)

代码主要可以分为蓝鲸开发框架层 framework、流程引擎服务层 pipeline、标准运维业务层 gcloud 以及前端展示层 web。

- framework

  蓝鲸基于 django 框架的二次封装架构，主要提供 SaaS 运营在蓝鲸 PaaS 上的基础配置和服务。

  config：工程各部署环境配置，如本地环境、测试环境、正式环境，以及路由配置。

  blueapps：新版开发框架核心模块，包括蓝鲸统一登录、鉴权、中间件和公共函数。

  packages：蓝鲸 API Gateway SDK，包括配置平台、作业平台等提供的API。

- pipeline、pipeline_web、pipeline_plugins

  自研的流程引擎框架，主要包含任务流程编排页面和任务流程执行服务。

  conf：默认配置。

  core：参考 BPMN2.0 规范，定义了一些核心元素如 Activity、网关、事件和数据对象 Data，以及 pipeline 的整体结构。

  models：存储结构定义和相关的方法。

  engine：runtime 执行逻辑和任务状态管理。

  log：日志持久化存储和管理。

  parser：前端数据结构解析。

  validators：数据校验，如环状结构检测和数据合法性校验。

  component_framework：插件框架和插件定义。

  variables：全局变量定义。

  contrib：扩展功能，如数据统计和前端 API。
  
  pipeline_web：前端数据适配层，支持前端画布生成的流程数据。
  
  pipeline_plugins：标准运维官方插件库和全局自定义变量。

- gcloud

  基于流程引擎框架封装的业务适配层，包含业务权限控制、流程模板管理、任务管理、业务配置、API 等功能。

  conf：配置动态适配层。

  core：业务核心逻辑，权限控制，业务首页。

  utils：公共函数和模块。

  tasktmpl3：流程模板管理。

  taskflow3：任务管理。

  webservice3：数据资源 API 管理。

  config：业务配置。

  apigw：对外 API 模块。

- web

  前端资源，包括 webpack 配置和静态资源。

  frontend：主要包括流程编排 desktop 模块，该模块是基于 vue 实现的。

  static：插件 components 和变量 variables 的前端定义文件，都放在各自模块的 static 目录下。

  templates：包含首页和 django admin 需要的页面。

  locale：国际化翻译文件。



# 参考资料

https://github.com/TencentBlueKing/bk-job

* any list
{:toc}