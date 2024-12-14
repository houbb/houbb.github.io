---
layout: post
title: Devops-04-持续部署（Continuous deployment，缩写为CD）
date:  2016-10-14 10:15:54 +0800
categories: [Devops]
tags: [devops, ci, sh]
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

# DevOps

1、PLAN   开发团队根据客户的目标指定开发计划
 
2、CODE    根据"PLAN(开发计划)" 开始编写代码，需要将不同版本("稳定"/"最新")的代码存储在一个库中
 
3、Build   代码编写完成后，需要将代码构建打包并且运行
 
4、Test    成功构建项目后，需要测试代码是否存在BUG或者错误
 
5、DEPLOY   代码经过"手动调试"和"自动化测试"后，认为可以部署了，选一个稳定版本部署
 
6、OPERATE   运维团队将代码部署到生产环境中
 
7、MONITOR   项目部署上线后，需要持续的监控产品
 
8、INTEGRATE   然后将监控阶段收到的反馈发送回PLAN阶段，整体反复的流程就是DEVOPS的核心(ci/cd)


# 持续部署

持续部署（英语：Continuous deployment，缩写为CD），是一种软件工程方法，意指在软件开发流程中，以自动化方式，频繁而且持续性的，将软件部署到生产环境（production environment）中，使软件产品能够快速的发展[1][2][3]。

持续部署可以整合到持续整合与持续交付（Continuous delivery）的流程之中。

# chat

## 
## 其他开源

[蓝鲸持续集成平台(蓝盾)](https://github.com/TencentBlueKing/bk-ci)

* any list
{:toc}



