---
layout: post
title: 工作流引擎-18-开源审批流项目之 plumdo-work 工作流，表单，报表结合的多模块系统
date:  2020-5-26 16:05:35 +0800
categories: [Engine]
tags: [engine, workflow-engine, workflow, bpm, flow]
published: true
---

## 工作流引擎系列

[工作流引擎-00-流程引擎概览](https://houbb.github.io/2020/05/26/workflow-engine-00-overview)

[工作流引擎-01-Activiti 是领先的轻量级、以 Java 为中心的开源 BPMN 引擎，支持现实世界的流程自动化需求](https://houbb.github.io/2020/05/26/workflow-engine-01-activiti)

[工作流引擎-02-BPM OA ERP 区别和联系](https://houbb.github.io/2020/05/26/workflow-engine-02-bpm-oa-erp)

[工作流引擎-03-聊一聊流程引擎](https://houbb.github.io/2020/05/26/workflow-engine-03-chat-what-is-flow)

[工作流引擎-04-流程引擎 activiti 优秀开源项目](https://houbb.github.io/2020/05/26/workflow-engine-04-activiti-opensource)

[工作流引擎-05-流程引擎 Camunda 8 协调跨人、系统和设备的复杂业务流程](https://houbb.github.io/2020/05/26/workflow-engine-05-camunda-intro)

[工作流引擎-06-流程引擎 Flowable、Activiti 与 Camunda 全维度对比分析](https://houbb.github.io/2020/05/26/workflow-engine-06-compare)

[工作流引擎-07-流程引擎 flowable-engine 入门介绍](https://houbb.github.io/2020/05/26/workflow-engine-07-flowable-intro)

[工作流引擎-08-流程引擎 flowable-engine 优秀开源项目](https://houbb.github.io/2020/05/26/workflow-engine-08-flowable-opensource)

[工作流引擎-09-XState 是一个 JavaScript 和 TypeScript 的状态管理库，它使用状态机和状态图来建模逻辑](https://houbb.github.io/2020/05/26/workflow-engine-09-xstate-intro)

[工作流引擎-10-什么是 BPM?](https://houbb.github.io/2020/05/26/workflow-engine-10-bpm-intro)

[工作流引擎-11-开源 BPM 项目 jbpm](https://houbb.github.io/2020/05/26/workflow-engine-11-opensource-bpm-jbpm-intro)

[工作流引擎-12-开源 BPM 项目 foxbpm](https://houbb.github.io/2020/05/26/workflow-engine-12-opensource-bpm-foxbpm-intro)

[工作流引擎-13-开源 BPM 项目 UFLO2](https://houbb.github.io/2020/05/26/workflow-engine-13-opensource-bpm-uflo-intro)

[工作流引擎-14-开源审批流项目之 RuoYi-vue + flowable 6.7.2 的工作流管理](https://houbb.github.io/2020/05/26/workflow-engine-14-opensource-ruoyi-flowable-intro)

[工作流引擎-15-开源审批流项目之 RuoYi-Vue-Plus 进行二次开发扩展Flowable工作流功能](https://houbb.github.io/2020/05/26/workflow-engine-15-opensource-ruoyi-flowable-plus-intro)

[工作流引擎-16-开源审批流项目之 整合Flowable官方的Rest包](https://houbb.github.io/2020/05/26/workflow-engine-16-opensource-flowable-ui-intro)

[工作流引擎-17-开源审批流项目之 flowable workflow designer based on vue and bpmn.io](https://houbb.github.io/2020/05/26/workflow-engine-17-opensource-workflow-bpmn-modeler-intro)

[工作流引擎-18-开源审批流项目之 plumdo-work 工作流，表单，报表结合的多模块系统](https://houbb.github.io/2020/05/26/workflow-engine-18-opensource-plumdo-work-intro)

# 工作流平台（未经同意禁止做商业用途）

[plumdo-work](https://github.com/wengwh/plumdo-work/) 流程，表单，报表，手动配置生成实际工作流

[Github](https://github.com/wengwh/plumdo-work) | [Gitee](https://gitee.com/wengwh/plumdo-work)

## Demo 演示

[系统控制台](http://work.plumdo.com) 

[表单设计器](https://wengwh.github.io/plumdo-work)

![Aaron Swartz](https://raw.githubusercontent.com/wengwh/plumdo-work/master/docs/design.png)

## 模块介绍

>  前端工程

| 模块名称      |          备注说明           |
| :---------:   | :-------------------------: |
| work-admin    |          管理台        |
| form-modeler  | 表单模型（设计，明细） |
| flow-modeler  | 流程模型（设计，监控） |

>  后端工程

| 模块名称          |          备注说明           |
| :-------------:   |   :-----------------------: |
| common-module     | 项目公共模块  |
| identity-service  | 人员接口      |
| flow-service      | 流程接口      |
| form-service      | 表单接口      |


## 下载搭建环境
下载项目 `git clone https://github.com/wengwh/plumdo-work.git`

> 前端构建

```bash
下载安装nodejs 地址:http://nodejs.cn/download/
npm install -g bower #安装bower
npm install -g gulp #安装gulp 

cd html #进入html目录

如果环境没有翻墙情况，使用淘宝镜像做node-sass，否则会出现下载失败
set SASS_BINARY_SITE=https://npm.taobao.org/mirrors/node-sass

npm install #安装npm依赖库

#安装成功
cd work-admin #进入相对应目录
bower i   #安装bower依赖的第三方库
gulp serve  #执行gulp进行开发
```

```bash
"E:\kibana\node_modules\node-sass\build\binding.sln" (default target) (1) ->
(_src_\libsass target) ->
  MSBUILD : error MSB3428: 未能加载 Visual C++ 组件“VCBuild.exe”。要解决此问题
，1) 安装 .NET Fr
amework 2.0 SDK；2) 安装 Microsoft Visual Studio 2005；或 3) 如果将该组件安装到
了其他位置，请将其位置添加到
系统路径中。 [E:\kibana\node_modules\node-sass\build\binding.sln]

出现上面环境问题，可以执行
npm install -g node-gyp 
npm install –global –production windows-build-tools
npm install #继续安装npm依赖库
```


> 后端构建

```bash
cd java #进入java目录
mvn eclipse:eclipse #eclipse编辑器做示例
```



## 相关技术

>  前端技术
 
| 技术名称           |          备注说明           |
| :-------------:    |    :----------------------: |
| Yeoman Bower Gulp  |          构建工具           |
| AngularJS v1       |          MVVM框架           |
| Bootstrap v3       |          UI框架             |

>  后端技术

| 技术名称              |          备注说明         |
| :----------------:    |   :---------------------: |
| Java v1.8             |         编码语言          |
| Maven                 |         构建工具          |
| SpringBoot            |代码框架（后续springcloud）|
| Flowable JPA Mybatis  |         第三方组件        |
| Mysql                 |          数据库           |


## 文件介绍
```
deploy:部署文件
html:前端页面模块
java:后端服务模块

部署说明：docker部署
安装docker-compose
执行docker-compose build
执行docker-compose up -d
```

## 功能介绍
```
目前只完成表单设计器，流程接口和设计器

缺少：
表单的数据保存和使用
表单与流程的交互
报表整个模块
流程跟踪图

```

# 参考资料

https://github.com/Nayacco/workflow-bpmn-modeler

* any list
{:toc}