---
layout: post
title: 项目管理平台-01-BugClose 入门介绍 
date:  2016-10-14 10:15:54 +0800
categories: [Devops]
tags: [devops, project-manage]
published: false
---

# 拓展阅读

[Devops-01-devops 是什么？](https://houbb.github.io/2016/10/14/devops-01-overview)

[Devops-02-Jpom 简而轻的低侵入式在线构建、自动部署、日常运维、项目监控软件](https://houbb.github.io/2016/10/14/devops-02-jpom)

[代码质量管理 SonarQube-01-入门介绍](https://houbb.github.io/2016/10/14/devops-sonarqube-01-intro)

[项目管理平台-01-jira 入门介绍 缺陷跟踪管理系统，为针对缺陷管理、任务追踪和项目管理的商业性应用软件](https://houbb.github.io/2016/10/14/project-manage-jira-01-intro)

[项目管理平台-01-Phabricator 入门介绍 一套集成的强大工具，帮助公司构建更高质量的软件](https://houbb.github.io/2016/10/14/project-manage-phabricator-01-overview)

[持续集成平台 01 jenkins 入门介绍](https://houbb.github.io/2016/10/14/devops-jenkins-01-intro)


# BugClose

> [bug close](https://www.bugclose.com/)

> [jira](https://www.atlassian.com/software/jira)

可在中国开源网站上借鉴类似的软件。

可针对此流程，自己设计一个练手。

# 简单设想

简单易用，支持扩展。

1.支持i18n
2.支持自定义
3.支持插件扩展

# 基础功能

## 用户模块

> 权限

1.每个任务只应该属于一个人。但是可以被多个人关注。

## 项目模块

> 包含不同的项目(Project)。

后期考虑将每次提交与项目关联，便于查看。

## 工作流模块

每个任务支持评论。附件。任务之间支持关联。(tree)

- 任务类别

> Require, Task, Bug, Improve, Optimize, Release 

1.  每次开发都应该源于Require(需求)——源于客户或者自身提出的一次开发需求。
2.  每个TASK(任务)都应该隶属于某个Require——根据具体需求拆分出的任务。
3.  每个BUG(缺陷)都应该隶属于某个TASK——开发过程中，TASK完成无法完成预期的需求。
4.  每个Improve(改进)都应该隶属于某个TASK——TASK完成后可以继续完善。出于对用户的使用，观赏等需求。受益方是使用者。
5.  每个Optimize(优化)应该隶属于某个TASK或者Project——代码优化，结构优化，性能调优等。受益方是开发者。
6.  每次项目发布之前都应该有Release(发布计划)。包含本期需求设计的所有TASK, 代码修改，脚本修改等。可是使用TAG(标签)，获取所有本期信息。

以上工作流后期支持自定义扩展。

- 优先级

一般优先级只是一种约定，用户自己使用时可自己定义。但是有些约定：

>  Critical, Primary, Normal, Secondary
 
1. Critical(紧急)一般为临时性遇到的问题，需要最优先处理。
2. Primary(主要)一个开发过程中比较核心的位置，需要优先处理。
3. Normal(正常)正常开发，按照正常进度开发即可。
4. Secondary(次要)延迟开发。如果有其他任务，可考虑优先完成其他任务，当前TASK有时间再做处理。

工作流中的每一样东西都应该有优先级。可设置自定义的优先级。

- Status

> Open, Handling, Resolved, Testing, Closed, Delay

1. Open(打开) 当任务被创建OR重新打开，任务应该处理Open状态。
2. Handling(处理中) 当任务被着手开发或者评审拆分等，处于Handling状态。
3. Resolved(解决) 当任务开发或者分析完毕，处于Resolved状态。
4. Testing(测试中) 当任务Resolved后进行测试验证，处于Testing状态。测试无问题，进入
5. Closed(关闭)  当任务Testing完毕后且没有问题，则进入Closed状态。或者其他原因，无需开发等，也可以直接关闭。
6. Delay(延期)  当任务由于排期或者其他原因造成不能按照进度进行时，可切到Delay.

注意：
1. 需要考虑添加状态保护，状态切换需要条件。具体可在讨论。

- TAG

> 支持默认标签，以及自定义扩展。

独立模块。可以用于标识几乎所有的东西。
如对Project, User, Wiki, Task...都可以打标签。 有利于快速查询及分类统计。

## 统计模块

1.对当前的任务进度等进行统计。每个人的完成量各方面。支持自定义。

* any list
{:toc}