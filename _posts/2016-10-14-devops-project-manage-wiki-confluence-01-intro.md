---
layout: post
title: 项目管理文档 wiki-01-Confluence 简单介绍
date:  2016-10-14 10:15:54 +0800
categories: [Devops]
tags: [devops, project-manage, wiki]
published: true
---

# 拓展阅读


[Devops-01-devops 是什么？](https://houbb.github.io/2016/10/14/devops-01-overview)

[Devops-02-Jpom 简而轻的低侵入式在线构建、自动部署、日常运维、项目监控软件](https://houbb.github.io/2016/10/14/devops-02-jpom)

[代码质量管理 SonarQube-01-入门介绍](https://houbb.github.io/2016/10/14/devops-sonarqube-01-intro)

[项目管理平台-01-jira 入门介绍 缺陷跟踪管理系统，为针对缺陷管理、任务追踪和项目管理的商业性应用软件](https://houbb.github.io/2016/10/14/project-manage-jira-01-intro)

[项目管理平台-01-Phabricator 入门介绍 一套集成的强大工具，帮助公司构建更高质量的软件](https://houbb.github.io/2016/10/14/project-manage-phabricator-01-overview)

[持续集成平台 01 jenkins 入门介绍](https://houbb.github.io/2016/10/14/devops-jenkins-01-intro)

[持续集成平台 02 jenkins plugin 插件](https://houbb.github.io/2016/10/14/devops-jenkins-02-plugin)


[test coverate-05-测试覆盖率 SonarQube 是一个综合性的代码质量管理平台，其中包含了对测试覆盖率的支持](https://houbb.github.io/2016/04/26/test-coverage-05-sonarqube)

[Docker learn-29-docker 安装 sonarQube with mysql](https://houbb.github.io/2019/12/18/docker-learn-29-install-devops-sonar)


# Confluence 简介

Confluence是一个企业级的Wiki软件，可用于在企业、部门、团队内部进行信息共享和协同编辑。

## 能做什么？

团队将日常的工作任务进度管理、技术知识分享、开发文档、操作手册、文档附件都放置入Confluence中进行统一管理，富文本编辑器使文档内容支持更加丰富，（一般confluence配套使用jira，jira专注于项目bug管理，更多请【百度jira】）

## 基础概念

Confluence的使用并不复杂，只需掌握如下几个基础概念。空间（Space）空间是Confluence系统中的一个区域，用于存储wiki页面，并可实现对空间中的所有文档进行统一的权限管理。
通常，我们可以针对每个项目单独创建一个空间，然后将与该项目相关的文档信息放置到该空间中，并只对项目成员开设访问/编辑权限。
除了项目空间，每个成员都有一个个人空间。平时成员可以将工作总结或笔记等文档放置到自己的空间中；对于对团队有帮助的文档，就可以将文档移动至团队项目空间中。

### Dashboard

Dashboard是Confluence系统的主页，在Dashboard界面中包含了Confluence站点中的所有空间列表，以及最近更新内容的列表。

### 页面（Page）

在Confluence系统中，页面是存储和共享信息的主要方式。

页面可以互相链接、连接、组织和访问，并以树状结构进行组织，放置于空间之中。页面遵循所见即所得的编辑方式，操作上简单易用。更强大的地方在于，页面支持大量的内容展现形式，除了富文本文档外，还包括图表、视频、附件（可预览）、流程图、公式等等；如果还不够，还可以通过海量的第三方插件进行扩展。

在页面中可以通过@其它成员，通知相关成员查看文档。文档保存成功后，被@的成员就会收到邮件，并可根据邮件中的链接访问到该文档，然后进行评论或者协同编辑。

### 模板（template）

创建页面时除了采用空白文档，也可以选择模板。模板是在空白文档的基础上，根据特定需求添加了一些文档要素，可辅助用户更好更快地创建文档。

Confluence内置了大量的模板，可辅助用于项目工作的各个环节，包括产品需求、会议记录、决策记录、指导手册（How-to）、回顾记录、工作计划、任务报告等等。并且由于Confluence和JIRA是同一家公司的产品，在Confluence中可以和JIRA进行无缝衔接，实现对产品质量实现更好的展现。

如果对Confluence自带的模板不满意，还可以对模板进行调整，或者根据自己的需求创建其它类型的模板。

### 权限（Permission）

在安全性方面，Confluence具有完善和精细的权限控制，可以很好地控制用户在Wiki中创建、编辑内容和添加注释。

权限控制分3个维度，分别是团队（Group），个人（Individual Users），匿名用户（Anonymous）。

使用团队级的权限控制时，需要在Confluence服务器中对公司员工进行分组，好处在于配置比较方便，只需要对整个团队进行统一的权限配置。

但在实际项目中，经常会存在同一个项目包含多个跨团队成员的情况，这个时候就不适合采用团队权限配置方式，只能采用逐个添加成员的方式，并对各个成员分别配置权限。
另外一种情况，就是对于未登录的用户，以及项目成员以外的用户，可以开设部分权限，例如只读（View）。

* any list
{:toc}
