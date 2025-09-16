---
layout: post
title: spring 项目 bean 直接 maven 打包，另一个项目如何正常使用？
date: 2025-9-16 20:40:12 +0800
categories: [AI]
tags: [ai, deepseek, sh]
published: true
---


# 背景

假设我们有一个 service 模块，但是希望被 2 个不同的项目依赖。

这个 service 实现比较复杂，各种 spring bean 注入之类的。

又应该如何正常使用呢？

本文演示一下。

# 模块 springboot-invoke-service-noauto

## 说明

模拟一个普通的服务类

## pom.xml

```xml
<?xml version="1.0" encoding="UTF-8"?>
<project xmlns="http://maven.apache.org/POM/4.0.0"
         xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
         xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 http://maven.apache.org/xsd/maven-4.0.0.xsd">
    <modelVersion>4.0.0</modelVersion>

    <groupId>org.example</groupId>
    <artifactId>springboot-invoke-service-noauto</artifactId>
    <version>1.0-SNAPSHOT</version>

    <properties>
        <maven.compiler.source>8</maven.compiler.source>
        <maven.compiler.target>8</maven.compiler.target>
        <project.build.sourceEncoding>UTF-8</project.build.sourceEncoding>
    </properties>

    <parent>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-parent</artifactId>
        <version>2.7.14</version>
    </parent>

    <dependencies>
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-web</artifactId>
        </dependency>
    </dependencies>

</project>
```


## 注入类

一个注入了其他类的 service 类

```java
package org.example.springboot.invoke.noauto.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class UserService {

    @Autowired
    private UserDal userDal;

    public void queryById() {
        System.out.println("UserService#queryById");
        userDal.selectById();
    }

}
```

## 打包

```
mvn clean install
```

# 模块 springboot-invoke-app-noauto

模拟调用的地方

## 引入

引入刚才的依赖

```xml
    <dependencies>
        <dependency>
            <groupId>org.example</groupId>
            <artifactId>springboot-invoke-service-noauto</artifactId>
            <version>1.0-SNAPSHOT</version>
        </dependency>
    </dependencies>
```

## Application#main

```java
package org.example.springboot.invoke.app.noauto;

import org.example.springboot.invoke.noauto.service.UserService;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.ApplicationContext;

@SpringBootApplication
public class Application {

    public static void main(String[] args) {
        ApplicationContext ctx = SpringApplication.run(Application.class, args);

        // 启动时直接调用
        UserService userService = ctx.getBean(UserService.class);
        userService.queryById();
    }

}
```

## 效果

此时结果：

```
2025-09-16 19:28:36.039  INFO 24148 --- [           main] o.s.b.w.embedded.tomcat.TomcatWebServer  : Tomcat started on port(s): 8080 (http) with context path ''
2025-09-16 19:28:36.046  INFO 24148 --- [           main] o.e.s.invoke.app.noauto.Application      : Started Application in 2.378 seconds (JVM running for 2.749)
Exception in thread "main" org.springframework.beans.factory.NoSuchBeanDefinitionException: No qualifying bean of type 'org.example.springboot.invoke.noauto.service.UserService' available
	at org.springframework.beans.factory.support.DefaultListableBeanFactory.getBean(DefaultListableBeanFactory.java:351)
	at org.springframework.beans.factory.support.DefaultListableBeanFactory.getBean(DefaultListableBeanFactory.java:342)
	at org.springframework.context.support.AbstractApplicationContext.getBean(AbstractApplicationContext.java:1175)
	at org.example.springboot.invoke.app.noauto.Application.main(Application.java:15)
```

# 如何解决？

## 方式1-指定扫描包

我们指定一下 springboot 的扫描包，包含依赖的地方即可。

```java
@SpringBootApplication(scanBasePackages = "org.example.springboot.invoke.noauto.service")
public class Application {

    public static void main(String[] args) {
        //...
    }

}
```

效果：

```
2025-09-16 19:34:02.673  INFO 17536 --- [           main] o.e.s.invoke.app.noauto.Application      : Started Application in 2.538 seconds (JVM running for 2.905)
UserService#queryById
UserDal#selectById
```

## 方式2-service 包指定为 starter

### 实现类

作为对比，我们在新建 auto 模块

- UserService.java 实现类似

```java
package org.example.springboot.invoke.service.auto;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class UserService {

    @Autowired
    private UserDal userDal;

    public void queryById() {
        System.out.println("UserService#queryById");
        userDal.selectById();
    }

}
```

### 自定义 starter

本 springboot 为 2.x

定义一个扫描的类

```java
package org.example.springboot.invoke.service.auto;

import org.springframework.context.annotation.ComponentScan;
import org.springframework.context.annotation.Configuration;

/**
 * 自动配置类
 * 当 starter 被引入时，会自动扫描指定包下的所有组件
 */
@Configuration
@ComponentScan(basePackages = "org.example.springboot.invoke.service.auto")
public class InvokeServiceAutoConfiguration {
}
```

指定 `spring.factories` 指定 springboot 的自动启动策略

```
org.springframework.boot.autoconfigure.EnableAutoConfiguration=org.example.springboot.invoke.service.auto.InvokeServiceAutoConfiguration
```

### 打包

当前的项目打包

```
mvn clean install
```

### 测试验证

引入

```xml
<dependency>
            <groupId>org.example</groupId>
            <artifactId>springboot-invoke-service-auto</artifactId>
            <version>1.0-SNAPSHOT</version>
</dependency>
```

启动

```java
package org.example.springboot.invoke.app.auto;

import org.example.springboot.invoke.service.auto.UserService;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.ApplicationContext;

@SpringBootApplication
public class Application {

    public static void main(String[] args) {
        ApplicationContext ctx = SpringApplication.run(Application.class, args);

        // 启动时直接调用
        UserService userService = ctx.getBean(UserService.class);
        userService.queryById();
    }

}
```

日志：

```
2025-09-16 19:46:46.061  INFO 22280 --- [           main] o.e.s.invoke.app.auto.Application        : Started Application in 2.528 seconds (JVM running for 2.963)
UserService#queryById
UserDal#selectById
```

直接正常加载启用。

# 小结

两种方式都可以。

可以结合自己的场景使用。

* any list
{:toc}