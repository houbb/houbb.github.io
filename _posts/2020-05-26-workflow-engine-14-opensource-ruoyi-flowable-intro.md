---
layout: post
title: 工作流引擎-14-开源审批流项目之 RuoYi-vue + flowable 6.7.2 的工作流管理
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

## 平台简介

基于RuoYi-vue  + Flowable 6.8.x 的工作流管理平台 ~

- 不定时同步[RuoYi-Vue](https://gitee.com/y_project/RuoYi-Vue)至最新版本。
- 前端采用Vue、Element UI。
- 后端采用Spring Boot、Spring Security、Redis & Jwt。
- 权限认证使用Jwt，支持多终端认证系统。
- 支持加载动态权限菜单，多方式轻松权限控制.
- 项目地址：[Gitee](https://gitee.com/tony2y/RuoYi-flowable.git)&nbsp;&nbsp;&nbsp;[Github](https://github.com/tony2y/RuoYi-flowable.git)
- 特别鸣谢：[RuoYi-Vue](https://gitee.com/y_project/RuoYi-Vue)

## 内置功能

- 在线流程设计器
- 在线流程表单设计器
- 单节点配置表单
- 多实例会签任务
- 任务节点配置任务/执行监听器
- 动态配置任务候选人
- 其它流程相关功能点

## 演示地址

- 开源版演示地址：http://open.tony2y.top
- Vue2 / Vue3 演示地址(付费版)：http://vue3.tony2y.top
- 移动端演示(h5)地址：http://mobile.tony2y.top
- 使用文档：https://www.yuque.com/u1024153/icipor

## 其它业务系统

- [[ 智慧农业认养系统 ]](https://gitee.com/tony2y/smart-breed)：基于Java + SpringBoot + Mybatis Plus + Redis + Vue + antdv，支持认养、商城、营销、会员、进销存、多租户等功能，包含小程序，系统管理后台。

- [[ 智慧景区管理系统 ]](https://gitee.com/tony2y/scenic-spot)：基于Java + SpringBoot + Mybatis Plus + Redis + Vue + antdv，支持景区管理、售票、地块管理、认养、商城、农资管理、积分兑换等功能，包含小程序，系统管理后台。

## 演示图

<table>
    <tr>
        <td><img src="https://foruda.gitee.com/images/1672821697044447970/6bc09d47_2042292.png"/></td>
        <td><img src="https://foruda.gitee.com/images/1672821770531098361/972cf362_2042292.png"/></td>
    </tr> 
    <tr>
        <td><img src="https://foruda.gitee.com/images/1725580931106887779/326bf7f6_2042292.png"/></td>
        <td><img src="https://foruda.gitee.com/images/1725580975079462113/f13c15f8_2042292.png"/></td>
    </tr>
    <tr>
        <td><img src="https://foruda.gitee.com/images/1725581014458193305/f58bf176_2042292.png"/></td>
        <td><img src="https://foruda.gitee.com/images/1725581065882554528/be686bb6_2042292.png"/></td>
    </tr>
    <tr>
        <td><img src="https://foruda.gitee.com/images/1725581121073519190/3f99f2fc_2042292.png"/></td>
        <td><img src="https://foruda.gitee.com/images/1725581177903309316/70d24a73_2042292.png"/></td>
    </tr>
	<tr>
        <td><img src="https://foruda.gitee.com/images/1672214208441821384/b90c26be_2042292.png"/></td>
        <td><img src="https://foruda.gitee.com/images/1672214266396146807/3e6408a3_2042292.png"/></td>
    </tr>	 
    <tr>
        <td><img src="https://foruda.gitee.com/images/1672214318671690501/80c425ed_2042292.png"/></td>
        <td><img src="https://foruda.gitee.com/images/1672214425678628903/251c4200_2042292.png"/></td>
    </tr>
</table>

## 推荐

大家在使用本项目时，推荐结合贺波老师的书

[《深入Flowable流程引擎：核心原理与高阶实战》](https://item.jd.com/14804836.html)学习。

这本书得到了Flowable创始人Tijs Rademakers亲笔作序推荐，对系统学习和深入掌握Flowable的用法非常有帮助。

<img src="https://foruda.gitee.com/images/1727432593738798662/46c08088_2042292.png" width="800" height="1000"/>

# 参考资料

https://github.com/tony2y/RuoYi-flowable

* any list
{:toc}