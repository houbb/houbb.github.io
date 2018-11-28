---
layout: post
title: Spring Cloud
date: 2018-11-28 19:30:44 +0800
categories: [Distributed]
tags: [distributed, spring-cloud, rpc, sh]
published: true
excerpt: Spring Cloud 入门介绍
---

# Spring Cloud 

[Spring Cloud](http://projects.spring.io/spring-cloud/) 为开发人员提供了快速构建分布式系统中一些常见模式的工具(例如配置管理、服务发现、断路器、智能路由、微代理、控制总线、一次性令牌、全局锁、领导选举、分布式会话、集群状态)。
分布式系统的协调导致了锅炉板模式，
使用Spring云开发人员可以快速地提供实现这些模式的服务和应用程序。
它们将在任何分布式环境中工作得很好，包括开发人员自己的笔记本电脑、裸金属数据中心，以及云代工等托管平台。

## 特性

Spring Cloud专注于为典型的用例和可扩展机制提供良好的盒装经验，以覆盖其他人。

- 分布式/版本配置

- 服务注册和发现

- 路由

- `service - to - service` 调用

- 负载平衡

- 断路器

- 全球锁

- 领导选举和集群国家

- 分布式消息

Spring Cloud 采用了一种非常声明性的方法，通常您只需要更改类路径和 `/` 或注释就可以获得大量的fetaures。


# 快速开始

## maven 引入 jar

```xml
<parent>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-parent</artifactId>
    <version>2.0.1.RELEASE</version>
</parent>
<dependencyManagement>
    <dependencies>
        <dependency>
            <groupId>org.springframework.cloud</groupId>
            <artifactId>spring-cloud-dependencies</artifactId>
            <version>Finchley.RELEASE</version>
            <type>pom</type>
            <scope>import</scope>
        </dependency>
    </dependencies>
</dependencyManagement>
<dependencies>
    <dependency>
        <groupId>org.springframework.cloud</groupId>
        <artifactId>spring-cloud-starter-config</artifactId>
    </dependency>
    <dependency>
        <groupId>org.springframework.cloud</groupId>
        <artifactId>spring-cloud-starter-netflix-eureka-client</artifactId>
    </dependency>
</dependencies>
```

## Application.java

发现客户端的代码

```java
@SpringBootApplication
@EnableDiscoveryClient
public class Application {
	public static void main(String[] args) {
		SpringApplication.run(Application.class, args);
	}
}
```

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