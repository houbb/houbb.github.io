---
layout: post
title:  Spring Cloud
date:  2018-09-06 08:25:14 +0800
categories: [Spring]
tags: [spring, sh]
published: false
excerpt: Spring Cloud 架构初探
---

# Spring Cloud

[Spring Cloud](http://projects.spring.io/spring-cloud/) 为开发人员提供了工具来快速构建分布式系统中的一些常见模式(例如配置管理、服务发现、断路器、智能路由、微代理、控制总线、一次性令牌、全局锁、领导选举、分布式会话、集群状态)。

分布式系统的协调导致了锅炉板模式，使用Spring云开发人员可以快速地支持实现这些模式的服务和应用程序。

它们将在任何分布式环境中都能很好地工作，包括开发人员自己的笔记本电脑、裸金属数据中心和云计算等托管平台。

## 特性

Spring Cloud 侧重于为典型用例提供良好的开箱即用体验，并提供可扩展性机制来覆盖其他人。

- 分布式/版本配置

- 服务注册及发现

- 路由

- service-to-service 调用

- 负载平衡

- 断路器

- 全球锁

- 领导选举和集群国家

- 分布式消息

# 拓展阅读

## spring cloud 与 spring boot

[springboot](https://houbb.github.io/2017/12/19/spring-boot)

Spring Boot 是 Spring 的一套快速配置脚手架，可以基于Spring Boot 快速开发单个微服务，Spring Cloud是一个基于Spring Boot实现的云应用开发工具；

Spring Boot专注于快速、方便集成的单个微服务个体，Spring Cloud关注全局的服务治理框架；

Spring Boot使用了默认大于配置的理念，很多集成方案已经帮你选择好了，能不配置就不配置。

Spring Cloud很大的一部分是基于Spring Boot来实现，可以不基于Spring Boot吗？不可以。

Spring Boot可以离开Spring Cloud独立使用开发项目，但是Spring Cloud离不开Spring Boot，属于依赖的关系。

```
Spring -> Spring Boot > Spring Cloud
```

# 参考资料

- spring-cloud

http://projects.spring.io/spring-cloud/

[spring cloud 中国](https://springcloud.cc/)

- 教程

[史上最简单的 SpringCloud 教程](https://blog.csdn.net/forezp/article/details/70148833)

[Spring Cloud 系列文章](http://www.ityouknow.com/spring-cloud.html)

[Spring Cloud](http://blog.didispace.com/categories/Spring-Cloud/)

* any list
{:toc}