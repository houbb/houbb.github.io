---
layout: post
title: java web mvc-03-JFinal
date:  2016-5-14 11:58:26 +0800
categories: [WEB]
tags: [web, mvc]
published: true
---

# 拓展阅读

[Spring Web MVC-00-重学 mvc](https://houbb.github.io/2019/12/25/springmvc-00-index)

[mvc-01-Model-View-Controller 概览](https://houbb.github.io/2016/05/14/mvc-01-overview)

[web mvc-03-JFinal](https://houbb.github.io/2016/05/14/mvc-03-jfinal-intro)

[web mvc-04-Apache Wicket](https://houbb.github.io/2016/05/14/mvc-04-apache-whicket-intro)

[web mvc-05-JSF JavaServer Faces](https://houbb.github.io/2016/05/14/mvc-05-jsf-intro)

[web mvc-06-play framework intro](https://houbb.github.io/2016/05/14/mvc-06-play-framework-intro)

[web mvc-07-Vaadin](https://houbb.github.io/2016/05/14/mvc-07-Vaadin)

[web mvc-08-Grails](https://houbb.github.io/2016/05/14/mvc-08-Grails)

# 拓展阅读

> [The jdbc pool for java.(java 手写 jdbc 数据库连接池实现)](https://github.com/houbb/jdbc-pool)

> [The simple mybatis.（手写简易版 mybatis）](https://github.com/houbb/mybatis)


# JFinal

JFinal 是基于 Java 语言的极速 WEB + ORM 开发框架，其核心设计目标是开发迅速、代码量少、学习简单、功能强大、轻量级、易扩展、Restful。

自动扫描映射设计的若干缺点：引入新概念(如注解)增加学习成本、性能低、jar 包扫描可靠性与安全性低

> [JFinal](http://www.jfinal.com/)

# Hello World

- pom.xml

```xml
<project xmlns="http://maven.apache.org/POM/4.0.0" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
         xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 http://maven.apache.org/maven-v4_0_0.xsd">
    <modelVersion>4.0.0</modelVersion>
    <groupId>com.ryo</groupId>
    <artifactId>JFinal</artifactId>
    <packaging>war</packaging>
    <version>1.0-SNAPSHOT</version>
    <name>JFinal Maven Webapp</name>
    <url>http://maven.apache.org</url>

    <properties>
        <project.build.sourceEncoding>UTF-8</project.build.sourceEncoding>
        <plugin.tomcat.version>2.2</plugin.tomcat.version>
        <maven-surefire-plugin.version>2.18.1</maven-surefire-plugin.version>
        <maven-compiler-plugin.version>3.3</maven-compiler-plugin.version>
    </properties>


    <dependencies>
        <dependency>
            <groupId>com.jfinal</groupId>
            <artifactId>jfinal</artifactId>
            <version>2.2</version>
        </dependency>
    </dependencies>


    <build>
        <plugins>
            <plugin>
                <groupId>org.apache.tomcat.maven</groupId>
                <artifactId>tomcat7-maven-plugin</artifactId>
                <version>${plugin.tomcat.version}</version>
                <configuration>
                    <port>8080</port>
                    <path>/</path>
                    <uriEncoding>${project.build.sourceEncoding}</uriEncoding>
                </configuration>
            </plugin>

            <plugin>
                <groupId>org.apache.maven.plugins</groupId>
                <artifactId>maven-surefire-plugin</artifactId>
                <version>${maven-surefire-plugin.version}</version>
                <configuration>
                    <skipTests>true</skipTests>
                    <testFailureIgnore>true</testFailureIgnore>
                </configuration>
            </plugin>

            <plugin>
                <groupId>org.apache.maven.plugins</groupId>
                <artifactId>maven-compiler-plugin</artifactId>
                <version>${maven-compiler-plugin.version}</version>
                <configuration>
                    <source>1.8</source>
                    <target>1.8</target>
                </configuration>
            </plugin>
        </plugins>
    </build>
</project>
```

- HelloController.java

```java
package com.ryo.controller;

import com.jfinal.core.Controller;

/**
 * Created by 侯彬彬 on 2016/6/20.
 */
public class HelloController extends Controller {
    public void index() {
        renderText("Hello World!");
    }
}
```

- ApplicationConfig.java

```java
package com.ryo.controller;

import com.jfinal.config.*;
import com.jfinal.core.JFinal;

/**
 * Created by 侯彬彬 on 2016/6/20.
 */
public class ApplicationConfig extends JFinalConfig {
    public void configConstant(Constants constants) {
        constants.setDevMode(true);
    }

    public void configRoute(Routes routes) {
        routes.add("/hello", HelloController.class);
    }

    public void configPlugin(Plugins plugins) {

    }

    public void configInterceptor(Interceptors interceptors) {

    }

    public void configHandler(Handlers handlers) {

    }

    public static void main(String[] args) {
        JFinal.start("src/main/webapp", 80, "/", 5);
    }
}
```

- web.xml

```xml
<!DOCTYPE web-app PUBLIC
 "-//Sun Microsystems, Inc.//DTD Web Application 2.3//EN"
 "http://java.sun.com/dtd/web-app_2_3.dtd" >

<web-app>
  <display-name>Archetype Created Web Application</display-name>

  <filter>
    <filter-name>jfinal</filter-name>
    <filter-class>com.jfinal.core.JFinalFilter</filter-class>
    <init-param>
      <param-name>configClass</param-name>
      <param-value>com.ryo.controller.ApplicationConfig</param-value>
    </init-param>
  </filter>

  <filter-mapping>
    <filter-name>jfinal</filter-name>
    <url-pattern>/*</url-pattern>
  </filter-mapping>
</web-app>
```

# chat

## 详细介绍一下 JFinal

JFinal 是一个基于 Java 的轻量级 Web 框架，专注于快速开发和高性能。以下是 JFinal 的详细介绍，包括其特点、架构、使用示例和优缺点。

### 主要特点

1. **轻量级**：JFinal 体积小巧，仅需一个 jar 包，核心库大小不到 500 KB，非常适合构建小型和中型应用。
2. **高性能**：JFinal 内置高性能的 Jetty 服务器，支持异步处理，性能表现优异。
3. **简单易用**：JFinal 提供简洁的 API 和注解，降低了学习曲线，适合快速开发。
4. **内置插件**：JFinal 内置了丰富的插件，如 ActiveRecord、I18n、AOP、Cache 等，方便扩展和集成。
5. **前后端分离**：JFinal 支持 RESTful 风格的 API 开发，适合前后端分离的项目架构。
6. **开箱即用**：JFinal 提供了许多开箱即用的功能，如表单验证、国际化、多数据源支持等，极大地提高了开发效率。

### 核心架构

JFinal 的核心架构包括以下几个部分：

1. **Controller**：处理 HTTP 请求的控制器类，负责接收请求、调用业务逻辑、返回响应。
2. **Route**：用于配置 URL 路由，将 URL 映射到相应的控制器和方法。
3. **Interceptor**：拦截器，用于在请求处理前后进行额外的处理，如权限验证、日志记录等。
4. **ActiveRecord**：一个轻量级的 ORM 框架，简化了数据库操作，支持事务、缓存等功能。
5. **Plugin**：插件机制，允许用户通过插件扩展框架的功能，如数据库连接池、缓存等。

### 使用示例

下面是一个简单的 JFinal 应用示例：

**1. 引入依赖**

在 Maven 项目中引入 JFinal 依赖：

```xml
<dependency>
    <groupId>com.jfinal</groupId>
    <artifactId>jfinal</artifactId>
    <version>4.9.11</version>
</dependency>
```

**2. 定义控制器**

创建一个控制器类，用于处理 HTTP 请求：

```java
public class HelloController extends Controller {
    public void index() {
        renderText("Hello, JFinal!");
    }
}
```

**3. 配置路由**

配置 URL 路由，将 URL 映射到控制器：

```java
public class AppConfig extends JFinalConfig {
    @Override
    public void configRoute(Routes me) {
        me.add("/hello", HelloController.class);
    }
}
```

**4. 启动应用**

创建一个启动类，启动 JFinal 应用：

```java
public class Application {
    public static void main(String[] args) {
        JFinal.start("src/main/webapp", 8080, "/", 5);
    }
}
```

运行上述代码后，访问 `http://localhost:8080/hello`，你将看到 "Hello, JFinal!"。

### 优缺点

**优点：**

1. **简洁轻量**：JFinal 的代码简洁，配置简单，适合快速开发和小型应用。
2. **高性能**：内置 Jetty 服务器，支持异步处理，性能优越。
3. **功能丰富**：内置 ActiveRecord、插件机制、拦截器等，功能完善。
4. **快速开发**：提供开箱即用的功能，极大地提高了开发效率。
5. **社区支持**：JFinal 有一个活跃的社区，提供了丰富的文档和示例代码。

**缺点：**

1. **功能有限**：相对于 Spring Boot 等大型框架，JFinal 的功能可能显得不足，尤其在大型项目中。
2. **生态系统**：JFinal 的生态系统相对较小，第三方插件和工具不如 Spring 生态丰富。
3. **学习曲线**：尽管 JFinal 简单易用，但对于习惯了其他框架的开发者来说，仍然需要一定的学习成本。

### 总结

JFinal 是一个非常适合快速开发和高性能应用的轻量级 Java Web 框架。

它的简洁性和易用性使得开发者能够在短时间内构建出高质量的 Web 应用。

尽管在大型项目中可能存在功能和生态系统的限制，但对于中小型项目来说，JFinal 无疑是一个非常不错的选择。

## 为什么现在不太使用 jfinal 了？

虽然 JFinal 在一段时间内受到了一些开发者的欢迎，但它在近年来的使用率有所下降，主要原因包括以下几点：

### 1. 新兴框架的崛起
随着技术的发展，出现了许多新的 Web 框架，这些框架在设计、功能和易用性上都有显著的改进。例如：

- **Spring Boot**：提供了强大的依赖注入、自动配置和丰富的生态系统，使得开发变得更加简单和高效。
- **Spring Cloud**：为微服务架构提供了一整套解决方案，适用于构建分布式系统。
- **Vert.x**：一个高性能的、反应式编程框架，适用于构建实时 Web 应用。

### 2. 生态系统和社区支持
JFinal 的生态系统和社区支持相对较小。相比之下，Spring 框架和其相关项目（如 Spring Boot、Spring Cloud）拥有庞大的社区和丰富的第三方插件和工具，这使得开发者更倾向于使用这些框架。

### 3. 功能和灵活性
虽然 JFinal 轻量级且高性能，但在功能和灵活性上可能不如其他框架全面。例如：

- **Spring** 提供了更强大的依赖注入和 AOP 功能。
- **Spring Boot** 提供了自动配置、嵌入式服务器和丰富的启动器，极大地简化了项目配置和依赖管理。

### 4. 微服务架构的兴起
随着微服务架构的普及，开发者更倾向于选择那些专门为微服务设计的框架，如 Spring Cloud。这些框架提供了更好的工具链和支持，用于构建和管理微服务。而 JFinal 的设计更多地面向传统的单体应用架构，无法很好地适应微服务架构的需求。

### 5. 学习曲线和企业接受度
虽然 JFinal 简单易用，但对于已经熟悉其他框架（如 Spring）的开发者来说，转向 JFinal 需要一定的学习成本。此外，大多数企业在招聘时更倾向于选择使用主流框架（如 Spring）的开发者，这进一步减少了 JFinal 的使用率。

### 6. 项目和维护
JFinal 的开发和维护相对较少。相比之下，Spring 框架由 Pivotal 团队和广大的开源社区持续维护和更新，提供了更多的新特性和修复。

### 总结

尽管 JFinal 是一个轻量级且高性能的框架，但在功能、生态系统、社区支持和现代开发需求方面，它逐渐被更强大、更灵活的框架所取代。

开发者更倾向于选择那些在功能全面、社区活跃和企业接受度高的框架，以满足现代 Web 应用和微服务架构的需求。

* any list
{:toc}