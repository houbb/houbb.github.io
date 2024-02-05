---
layout: post
title: Java Servlet 教程-02-hello world
date:  2018-09-28 14:43:52 +0800
categories: [Java]
tags: [web, servlet, java, sh]
published: true
excerpt: Java Servlet 教程之入门案例 hello world
---

# 快速开始

我们来写一个最简单的 hello world 项目，来对 servlet 有个最直观的认识。

## 项目结构

```
.
├── java
│   └── com
│       └── github
│           └── houbb
│               └── servlet
│                   └── learn
│                       └── base
│                           └── hello
│                               ├── Hello.java
└── webapp
    ├── WEB-INF
    │   └── web.xml
    └── index.html
```

## pom.xml 设置

使用 maven 做项目 jar 管理。

- servlet-api

```xml
<dependency>
    <groupId>javax.servlet</groupId>
    <artifactId>servlet-api</artifactId>
    <version>2.5</version>
    <scope>provided</scope>
</dependency>
```

- 指定打包方式为 war 包

```xml
<packaging>war</packaging>
```

- tomcat7 插件

你可以将项目打包为 *.war 然后放到 tomcat 下启动，此处为了方便使用了 tomcat7-maven-plugin。

整体如下:

- pom.xml

```xml
<?xml version="1.0" encoding="UTF-8"?>
<project xmlns="http://maven.apache.org/POM/4.0.0"
         xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
         xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 http://maven.apache.org/xsd/maven-4.0.0.xsd">
    <parent>
        <artifactId>servlet</artifactId>
        <groupId>com.ryo</groupId>
        <version>1.0-SNAPSHOT</version>
    </parent>
    <modelVersion>4.0.0</modelVersion>
    <packaging>war</packaging>

    <artifactId>servlet-base</artifactId>

    <properties>
        <project.build.sourceEncoding>UTF-8</project.build.sourceEncoding>
        <plugin.tomcat.version>2.2</plugin.tomcat.version>
    </properties>

    <dependencies>
        <dependency>
            <groupId>javax.servlet</groupId>
            <artifactId>servlet-api</artifactId>
            <version>2.5</version>
            <scope>provided</scope>
        </dependency>

        <dependency>
            <groupId>org.apache.tomcat</groupId>
            <artifactId>tomcat-servlet-api</artifactId>
            <version>9.0.0.M8</version>
            <scope>provided</scope>
        </dependency>
    </dependencies>

    <build>
        <finalName>servlet</finalName>
        <plugins>
            <plugin>
                <groupId>org.apache.tomcat.maven</groupId>
                <artifactId>tomcat7-maven-plugin</artifactId>
                <version>${plugin.tomcat.version}</version>
                <configuration>
                    <port>8081</port>
                    <path>/</path>
                    <uriEncoding>${project.build.sourceEncoding}</uriEncoding>
                </configuration>
            </plugin>
        </plugins>
    </build>

    <build>
        <finalName>servlet</finalName>
        <plugins>
            <plugin>
                <groupId>org.apache.tomcat.maven</groupId>
                <artifactId>tomcat7-maven-plugin</artifactId>
                <version>${plugin.tomcat.version}</version>
                <configuration>
                    <port>8081</port>
                    <path>/</path>
                    <uriEncoding>${project.build.sourceEncoding}</uriEncoding>
                </configuration>
            </plugin>
        </plugins>
    </build>
</project>
```

## web.xml

```xml
<?xml version="1.0" encoding="UTF-8"?>
<web-app version="2.4"
         xmlns="http://java.sun.com/xml/ns/j2ee"
         xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
         xsi:schemaLocation="http://java.sun.com/xml/ns/j2ee http://java.sun.com/xml/ns/j2ee/web-app_2_4.xsd">

    <servlet>
        <servlet-name>hello</servlet-name>
        <servlet-class>com.github.houbb.servlet.learn.base.hello.Hello</servlet-class>
    </servlet>
    <servlet-mapping>
        <servlet-name>hello</servlet-name>
        <url-pattern>/hello</url-pattern>
    </servlet-mapping>

    <!--默认的欢迎页面-->
    <welcome-file-list>
        <welcome-file>/index.html</welcome-file>
    </welcome-file-list>

</web-app>
```

指定了 url 与 Servlet 类之间的映射。

当我们访问 `/hello` 的时候，会调用对应的 `Hello` Servlet 类进行处理。

## 代码

- Hello.java

```java
import java.io.IOException;
import java.io.PrintWriter;

import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

/**
 * 入门测试
 */
public class Hello extends HttpServlet {
    private static final long serialVersionUID = -6775862788735743674L;

    @Override
    protected void doGet(HttpServletRequest req, HttpServletResponse resp) throws IOException {
        resp.setContentType("text/html");

        // 实际的逻辑是在这里
        PrintWriter out = resp.getWriter();
        out.println("<h1>hello</h1>");
    }
}
```

- index.html

```html
<!DOCTYPE html>
<html>
<body>
Hello Servlet!
</body>
</html>
```

## 启动

直接启动 tomcat7:run 运行当前 war。

打开浏览器 [http://localhost:8081/](http://localhost:8081/)，默认显示的是：

```
Hello Servlet!
```

## 访问 url

打开浏览器 [http://localhost:8081/hello](http://localhost:8081/hello)，显示的是：

```
hello
```

也就是我们在 `Hello` 类中返回的 html 内容。

# 基于注解实现

如果你使用过 springmvc 一定会发现，`web.xml` 中的配置太麻烦了。

当然，Servlet 中我们也可以使用注解来简化这一配置。

- HelloAnnotation.java

```java
import java.io.IOException;
import java.io.PrintWriter;

import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

/**
 * 入门注解测试
 */
@WebServlet("/hello/annotation")
public class HelloAnnotation extends HttpServlet {
    private static final long serialVersionUID = 491287664925808862L;

    @Override
    protected void doGet(HttpServletRequest req, HttpServletResponse resp) throws IOException {
        resp.setContentType("text/html");

        // 实际的逻辑是在这里
        PrintWriter out = resp.getWriter();
        out.println("<h1>hello annotation</h1>");
    }
}
```

## 访问

和上面一样，打开浏览器 [http://localhost:8081/hello/annotation](http://localhost:8081/hello/annotation)，显示的是：

```
hello annotation
```

# 源码地址

源码参见[servlet 入门案例](https://github.com/houbb/servlet-learn/tree/master/servlet-base)

* any list
{:toc}