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


* any list
{:toc}