---
layout: post
title:  SOFABoot-03-sofaboot 介绍
date:  2022-07-09 09:22:02 +0800
categories: [SOFA]
tags: [sofa, sofastack, sh]
published: true
---

## 前言

大家好，我是老马。

sofastack 其实出来很久了，第一次应该是在 2022 年左右开始关注，但是一直没有深入研究。

最近想学习一下 SOFA 对于生态的设计和思考。

## sofaboot 系列

[SOFABoot-00-sofaboot 概览](https://houbb.github.io/2022/07/09/sofastack-sofaboot-00-overview)

[SOFABoot-01-蚂蚁金服开源的 sofaboot 是什么黑科技？](https://houbb.github.io/2022/07/09/sofastack-sofaboot-01-intro)

[SOFABoot-02-模块化隔离方案](https://houbb.github.io/2022/07/09/sofastack-sofaboot-02-module-iosolation)

[SOFABoot-03-sofaboot 介绍](https://houbb.github.io/2022/07/09/sofastack-sofaboot-03-intro)

[SOFABoot-04-快速开始](https://houbb.github.io/2022/07/09/sofastack-sofaboot-04-quick-start)

[SOFABoot-05-依赖管理](https://houbb.github.io/2022/07/09/sofastack-sofaboot-05-depency-solve)

[SOFABoot-06-健康检查](https://houbb.github.io/2022/07/09/sofastack-sofaboot-06-health-check)

[SOFABoot-07-版本查看](https://houbb.github.io/2022/07/09/sofastack-sofaboot-07-version)

[SOFABoot-08-启动加速](https://houbb.github.io/2022/07/09/sofastack-sofaboot-08-speed-up)

[SOFABoot-09-模块隔离](https://houbb.github.io/2022/07/09/sofastack-sofaboot-09-module-isolation)

[SOFABoot-10-聊一聊 sofatboot 的十个问题](https://houbb.github.io/2022/07/09/sofastack-sofaboot-10-chat-10-q)

# SOFABoot

SOFABoot 是蚂蚁金服开源的基于 Spring Boot 的研发框架，它在 Spring Boot 的基础上，提供了诸如 Readiness Check，类隔离，日志空间隔离等能力。

在增强了 Spring Boot 的同时，SOFABoot 提供了让用户可以在 Spring Boot 中非常方便地使用 SOFA 中间件的能力。

你可以在[发布历史](https://github.com/sofastack/sofa-boot/releases)中查看所有的发布报告，SOFABoot 版本和 Spring Boot 版本对应关系如下：

| SOFABoot 版本 	| Spring Boot 版本 |
|:----|:----| 
| 2.3.x 	        | 1.4.2.RELEASE |
| 2.4.x 	        | 1.4.2.RELEASE |
| 2.5.x 	        | 1.5.16.RELEASE |
| 3.0.x 	        | 2.0.3.RELEASE |
| 3.1.x 	        | 2.1.0.RELEASE |
| 3.2.x 	        | 2.1.0.RELEASE |
| 3.3.0～3.3.1 	    | 2.1.11.RELEASE |
| 3.3.2 及以后 	    | 2.1.13.RELEASE |

即 SOFABoot 2.3.x 和 2.4.x 系列版本构建在 Spring Boot 1.4.2.RELEASE 基础之上；

SOFABoot 2.5.x 系列版本构建在 Spring Boot 1.5.x 基础之上；

SOFABoot 3.x 系列版本将构建在 Spring Boot 2.x 基础之上。

你可以在发布历史中查看获取所有的历史版本代码。

另外为了方便社区同学能够基于最新开发版本的 SOFABoot 进行开发学习，我们会发布当前开发分支的 SNAPSHOT 版本。

为顺利从中央仓库拉取 SNAPSHOT 包，需要在本地 maven setting.xml 文件增加如下 profile 配置:

```xml
<profile>
    <id>default</id>
    <activation>
        <activeByDefault>true</activeByDefault>
    </activation>
    <repositories>
        <repository>
            <snapshots>
                <enabled>true</enabled>
            </snapshots>
            <id>maven-snapshot</id>
            <url>https://oss.sonatype.org/content/repositories/snapshots</url>
        </repository>
    </repositories>
    <pluginRepositories>
        <pluginRepository>
            <snapshots>
                <enabled>true</enabled>
            </snapshots>
            <id>maven-snapshot</id>
            <url>https://oss.sonatype.org/content/repositories/snapshots</url>
        </pluginRepository>
    </pluginRepositories>
</profile>
```

目前 SOFABoot 最新版本为 3.1.0，基于 Spring Boot 2.1.0.RELEASE, 支持 JDK11。

# 功能描述

SOFABoot 在 Spring Boot 基础上，提供了以下能力：

- 扩展 Spring Boot 健康检查的能力：在 Spring Boot 健康检查能力基础上，提供了 Readiness Check 的能力，保证应用实例安全上线。

- 提供模块化开发的能力：基于 Spring 上下文隔离提供模块化开发能力，每个 SOFABoot 模块使用独立的 Spring 上下文，避免不同 SOFABoot 模块间的 BeanId冲
突。

- 增加模块并行加载和 Spring Bean 异步初始化能力，加速应用启动；

- 增加日志空间隔离的能力：中间件框架自动发现应用的日志实现依赖并独立打印日志，避免中间件和应用日志实现绑定，通过 sofa-common-tools 实现。

- 增加类隔离的能力：基于 SOFAArk 框架提供类隔离能力，方便使用者解决各种类冲突问题。

- 增加中间件集成管理的能力：统一管控、提供中间件统一易用的编程接口、每一个 SOFA 中间件都是独立可插拔的组件。

- 提供完全兼容 Spring Boot的能力：SOFABoot 基于 Spring Boot 的基础上进行构建，并且完全兼容 Spring Boot。


# 应用场景

SOFABoot 本身就脱胎于蚂蚁金服内部对于 Spring Boot 的实践，补充了 Spring Boot 在大规模金融级生产场景下一些不足的地方，所以 SOFABoot 特别适合于这样的场景。

当然，SOFABoot 的每个组件都是可选的，用户可以灵活选择其中的功能来使用，比如如果仅仅想在 Spring Boot 下面引入 SOFA 中间件，可以不需引入 SOFABoot 中的类隔离能力。

# 小结

本节我们主要介绍了 SOFABoot 的入门使用，以及如何解决模块化开发的实战。

说起模块化我们也可以想到 OSGi 以及 jdk9 的 module 支持，不过每一种解决方案都有对应的优势和限制。

SOFABoot 解决了模块的隔离，SOFAArk 则专注于解决类的隔离，我们下一节一起来学习下 SOFA 的另一个神器 SOFAArk。

希望本文对你有所帮助，如果喜欢，欢迎点赞收藏转发一波。

我是老马，期待与你的下次相遇。

# 参考资料

https://mp.weixin.qq.com/s/r9F8qYw8PIcyjGR2yS0Jzg

* any list
{:toc}