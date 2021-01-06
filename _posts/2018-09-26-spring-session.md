---
layout: post
title: Spring Session 入门教程
date:  2018-09-26 14:24:33 +0800
categories: [Spring]
tags: [web, spring, session, distributed, sh]
published: true
---

# Spring Session

[Spring Session](https://spring.io/projects/spring-session) 为管理用户会话信息提供了API和实现。

## 特性

Spring会话使支持集群会话变得很简单，无需绑定到特定于应用程序容器的解决方案。它还提供了透明的集成:

- HttpSession

允许以中立的方式替换应用程序容器(即Tomcat)中的HttpSession，支持在header中提供会话id，以使用RESTful api

- WebSocket

提供了在接收到WebSocket消息时保持HttpSession活动的能力

- WebSession

允许以应用容器中立的方式替换Spring WebFlux的WebSession

## 模块

Spring Session由以下模块组成:

- Spring Session Core 

提供核心的Spring会话功能和api

- Spring Session Data Redis

提供了SessionRepository和ReactiveSessionRepository实现，支持Redis和配置

- Spring Session JDBC 

提供了支持关系数据库和配置的SessionRepository实现

- Spring Session Hazelcast 

提供了支持Hazelcast和配置的SessionRepository实现


# 快速开始

## 准备工作

[Maven](https://houbb.github.io/2016/10/22/maven)

[Docker Redis](https://houbb.github.io/2018/05/06/docker-redis) 启动

```
$ docker ps
CONTAINER ID        IMAGE               COMMAND                  CREATED             STATUS              PORTS                    NAMES
b8dfa9422adb        redis               "docker-entrypoint.s…"   2 weeks ago         Up 5 seconds        0.0.0.0:6379->6379/tcp   out-redis
```

## 项目配置

- 目录结构

```
.
├── java
│   └── com
│       └── github
│           └── houbb
│               └── spring
│                   └── boot
│                       └── session
│                           ├── Application.java
│                           ├── config
│                           │   └── HttpSessionConfig.java
│                           └── controller
│                               └── ExampleController.java
└── resources
    └── application.properties
```

- pom.xml

相关配置文件

```xml
<parent>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-parent</artifactId>
    <version>1.5.9.RELEASE</version>
</parent>

<dependencies>
    <dependency>
        <groupId>org.springframework.session</groupId>
        <artifactId>spring-session</artifactId>
    </dependency>
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-web</artifactId>
    </dependency>
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-data-redis</artifactId>
    </dependency>
</dependencies>
<build>
    <plugins>
        <plugin>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-maven-plugin</artifactId>
        </plugin>
    </plugins>
</build>
```

- application.properties

指定 redis 相关配置

```
spring.redis.host=127.0.0.1
spring.redis.password=
spring.redis.port=6379
```

## 代码

- Application.java

```java
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class Application {
    public static void main(String[] args) {
        SpringApplication.run(Application.class, args);
    }
}
```

- HttpSessionConfig.java

指定使用 Redis 作为实现。

```java
import org.springframework.session.data.redis.config.annotation.web.http.EnableRedisHttpSession;

@EnableRedisHttpSession
public class HttpSessionConfig {
}
```

- ExampleController.java

指定简单的 Contronller 方法

```java
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import javax.servlet.http.HttpServletRequest;

@RestController
public class ExampleController {

    @RequestMapping("/set")
    public String set(HttpServletRequest req) {
        req.getSession().setAttribute("testKey", "testValue");
        return "设置session:testKey=testValue";
    }

    @RequestMapping("/query")
    public String query(HttpServletRequest req) {
        Object value = req.getSession().getAttribute("testKey");
        return "查询Session：\"testKey\"=" + value;
    }
}
```

## 测试

### 设置后查看

- 启动 Application

- 执行设置方法

浏览器访问 [http://localhost:8080/set](http://localhost:8080/set)

页面显示

```
设置session:testKey=testValue
```

- 执行查询

浏览器访问 [http://localhost:8080/query](http://localhost:8080/query)

页面显示

```
查询Session："testKey"=testValue
```

- redis 查看

`reids-cli` 进入 redis 命令行。

`key *` 查看所有信息

```
127.0.0.1:6379> keys *
1) "spring:session:sessions:expires:33ec8125-5db7-4d3b-983e-969bc0d9227a"
2) "spring:session:expirations:1537950780000"
3) "spring:session:sessions:33ec8125-5db7-4d3b-983e-969bc0d9227a"
```

## 清空后在查看

- redis 清空

`flushall` 清空数据

```
127.0.0.1:6379> flushall
OK
127.0.0.1:6379> keys *
(empty list or set)
```

- 执行查询

浏览器访问 [http://localhost:8080/query](http://localhost:8080/query)

页面显示

```
查询Session："testKey"=null
```

# 参考资料

https://spring.io/projects/spring-session#overview

https://yq.aliyun.com/articles/371442

- 实现原理

[实现原理](https://blog.csdn.net/wojiaolinaaa/article/details/62424642)

[Spring Session 内部实现原理（源码分析）](https://www.jianshu.com/p/1001e9e2cfcf)

* any list
{:toc}