---
layout: post
title:  Spring Cloud
date:  2018-07-19 11:56:39 +0800
categories: [Spring]
tags: [spring, cloud, micro service, sh]
published: true
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

# Quick Start

## jar

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

* any list
{:toc}