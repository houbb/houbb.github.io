---
layout: post
title: Apifox API 文档、API 调试、API Mock、API 自动化测试 Apifox = Postman + Swagger + Mock + JMeter
date: 2021-08-29 21:01:55 +0800
categories: [Tool]
tags: [tool, doc, sh]
published: true
---

# ApiFox

[Apifox](https://www.apifox.cn/) 是API 文档、API 调试、API Mock、API 自动化测试，一体化协作平台

## 特性

### API 文档设计

可视化 API 文档管理，零学习成本。

支持数据模型，接口之间可以复用相同数据结构。

接口文档完全遵循 OpenAPI(Swagger) 规范。

支持在线分享 API 文档，方便与外部团队协作。

### API 调试

Postman 有的功能 Apifox 都有（如环境变量、前置/后置脚本、Cookie/Session 全局共享等），并且比 Postman 更高效好用。

自动校验数据结构：校验返回的数据结构是否符合文档定义，自动发现接口数据异常。

可视化的断言、提取变量、数据库（SQL）操作等功能。

支持接口用例功能（一个接口多个用例）。

### API 自动化测试

完善的 API 场景测试（流程测试）功能，保证接口数据的正确性。

可视化的断言、提取变量、数据库（SQL）操作等功能。

支持自定义前置/后置脚本，自动校验数据正确性。脚本语法 100% 兼容 Postman，降低学习成本。

支持调用 javascript、java、python、php、js、BeanShell、go、shell、ruby、lua 等语言代码。

### API 数据 Mock

零配置即可 mock 出非常人性化的数据（根据 API 文档智能 mock）。

内置 Mock.js 规则引擎，非常方便 mock 出各种数据，并支持定义数据结构时设置 mock 规则。

支持根据不同参数值返回不同数据内容。

### CI 持续集成

支持命令行方式运行 API 测试 (Apifox CLI)。

支持集成 Jenkins 等持续集成工具。

### 数据库操作

支持读取数据库数据，作为 API 请求参数使用。

支持读取数据库数据，用来校验(断言) API 请求是否成功。

### 自动生成代码

根据接口/模型定义，自动生成各种语言/框架的业务代码和 API 请求代码。

支持 TypeScript、Java、Go、Swift、ObjectiveC、Kotlin、Dart、C++、C#、Rust 等 130 种语言及框架。

支持自定义代码模板，自动生成符合自己团队的架构规范的代码，满足各种个性化的需求。

支持 HTTP、TCP、RPC

支持 HTTP(s) 接口管理。

支持 Socket (TCP) 接口管理。

后续将会支持 GraphQL、Dubbo、gRPC、WebSocket 等协议接口。

### 数据导入/导出

支持导出 OpenAPI (Swagger)、Markdown、Html 等数据格式。

支持导入 OpenAPI (Swagger)、Postman、HAR、RAP2、JMeter、YApi、Eolinker、NEI、RAML、DOClever 、Apizza 、DOCWAY、ShowDoc、apiDoc、I/O Docs、WADL、Google Discovery 等数据格式。

### 团队协作

接口数据云端同步，实时更新。

成熟的团队/项目权限管理，支持管理员、普通成员、只读成员等角色设置，满足各类企业的需求。

# 小结

很多工具越来越趋向于整合，开源免费。

会导致这片市场很难出现竞争者。

# 参考资料

https://github.com/YeDaxia/JApiDocs

* any list
{:toc}