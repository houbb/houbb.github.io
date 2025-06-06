---
layout: post
title: 工作流引擎-02-BPM OA ERP 区别和联系
date:  2020-5-26 16:05:35 +0800
categories: [Engine]
tags: [engine, workflow-engine, workflow, bpm, flow]
published: true
---

# 前言

大家好，我是老马。

最近想设计一款审批系统，于是了解一下关于流程引擎的知识。

下面是一些的流程引擎相关资料。

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

# 前言

在全球著名咨询机构Gartner公布的“2008年十大战略性技术”中，BPM(Business Process Management)业务流程管理技术位列所有IT技术榜首，部署BPM将是企业提高组织内部的敏捷性、促进业务流程的改进以及增强灵活性和适应性的关键且带有战略性的决策。

尽管BPM技术在国内从概念、方法、产品到客户认识都还存在诸多问题，不甚清晰，但BPM技术和客户认知正在以不可逆转的速度高速成长，2009-2012年将会成为企业部署BPM的关键阶段。

在面对信息瞬息万变的商业竞争环境和微利时代，IT部门追求长期稳定而业务部门却要求更加灵活和敏捷，很多cio在面对新一轮的IT投资计划时无不更加谨慎和敏锐，BPM和ERP、OA的区别关系，先上ERP还是先上BPM一度成为讨论的焦点话题。 

# ERP 与 BPM

ERP(Enterprise Resource Planning,企业资源计划)，以MRP(物料资源计划)、MRPII为核心，其管理思想一般围绕供应链、生产制造和财务为核心。

而BPM从提升企业整体业务绩效、降低反馈周期和适应变化调整为目标，以流程为导向焦聚客户体验和核心价值。

首先在实施范围上，ERP以企业的业务职能部门为核心而BPM则从上至下，贯穿企业内部、外部组织。

ERP和BPM存在孑然不同的管理结构特征：ERP属于面向业务交易类（作业层）的微观紧密集成，如ERP制造策略按订单介入时间点，提供面向库存生产(MTS)、面向订单生产(MTO)、面向订单装配(ATO)、面向订单设计(ETO)。

而BPM则面向战略决策、运营管理类（高层）提供宏观敏捷协作，从提升企业整体业务绩效、降低反馈周期和适应变化调整为目标，例如围绕客户订单满意度的采购、设计、生产、配送、安装、售后等一系列过程化流程管理。

BPM在实施过程中更关注为企业树立一种理念，对现有业务进行全面分析梳理，确定重要流程持续化，而ERP则是希望企业进行深度变革，创造一个新的业务、组织模型。

我们可以将企业的经营活动分为战略层、运营层和作业层，完整的IT信息系统规划提供对这三个层面的支持，BPM得以有效集成ERP作业层管理将使得企业战略、决策和作业的敏捷化、自动化提升到一个前所未有的新高度。

# OA 与 BPM

OA(Office Automation,办公自动化)，旨在使企业内部人员方便快捷地共享信息，高效地协同工作，OA在以人为本的高效协作在中国企业管理软件领域将其发挥到了极致，成为企业部署协同管理的基础。

企业经营管控是对企业的组织（人）和业务过程（事）的管控，OA系统重在强调以个人为中心的信息协作，自主发散、行为无序的将信息通过协作工具进行传递和沟通，而BPM则是以端到端为中心的协作（人与人、人与系统、系统与系统），重视企业从战略到执行至上而下的流程化、规范化管理，重视全局的管控模式和不断优化，在管理结构上通常以流程为主线，提倡规范化、持续优化的绩效管理模式。

BPM能够增强OA在管理规范性和管控方面的不足，由于OA概念定义的边界模糊，管控观念和技术手段缺乏统一，随着协同市场的成熟，在未来可能会被作为BPM整体解决方案的一部分融合其中，继而BPM将进一步完善协同管理理念，BPM技术将成为未来协同产品的核心技术，成为企业跨组织、组织内、跨部门、部门内、个人的统一协作流程管控平台。 

尽管BPM在提升企业响应速度、降低管理成本、减少工作失误率和提高自动化程度方面弥补了ERP在企业运营、战略层管控的不足，但是选择BPM与ERP的集成仍然需要有策略和目标。

企业在BPM与ERP集成目标的突破口： 

## 弥补ERP流程管控能力的不足（外延和内伸） 

- 利用BPM对各类费用审批实施流程自动化，后端集成到ERP系统 

- 利用BPM处理前端客户线索、研发、订单、开具发票等流程，后端集成到ERP系统 

- 利用BPM扩展物料采购、BOM变更等，后端集成到ERP系统 

- 利用BPM实现对资产周期过程控制（采购、入库、领用、转移、维修、报废等） 

- 突发性流程控制，例如对紧急订单处理、紧急发货处理等，后端集成到ERP系统 

- 利用BPM增强人力资源流程，例如招聘、入职、请假、异动流程 

## BPM为实施ERP开路 

- 梳理流程 

- 上报、审批、变更ERP主数据和授权

# 参考资料

[BPM与ERP、OA系统的区别和关系](https://www.cnblogs.com/sap-ronny/articles/8295207.html)

* any list
{:toc}