---
layout: post
title:  jsp 学习笔记-01-JSP 整合 springboot
date:  2020-08-09 10:37:20 +0800
categories: [web]
tags: [web, http, sf]
published: true
---


# 旧瓶装新酒

0202 年了，可是你永远也无法想象还有公司在使用 JSP。

这种感觉就像 jdk14 已经出来了，你还要去维护一个 jdk7，不 jdk6 的项目。

现实总是这样残酷，总会有各种骨灰级的项目交接到我们手上，如果没有，那么是一种幸运；如果有，那么就只能正面去迎接这种挑战。

# springboot 整合 jsp

> 完整代码 [https://github.com/houbb/jsp-learn](https://github.com/houbb/jsp-learn)

## 代码结构

```
├─java
│  └─com
│      └─github
│          └─houbb
│              └─jsp
│                  └─learn
│                      └─hello
│                          │  JspApplication.java
│                          │
│                          └─controller
│                                  IndexController.java
│
├─resources
│      application.properties
│
└─webapp
    └─WEB-INF
        └─jsp
                index.jsp
```

## pom.xml

这里主要是引入 jsp 和 springboot 的依赖包。

```xml
<?xml version="1.0" encoding="UTF-8"?>
<project xmlns="http://maven.apache.org/POM/4.0.0"
         xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
         xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 http://maven.apache.org/xsd/maven-4.0.0.xsd">
    <modelVersion>4.0.0</modelVersion>

    <groupId>org.example</groupId>
    <artifactId>jsp-learn</artifactId>
    <version>1.0-SNAPSHOT</version>
    <packaging>war</packaging>

    <parent>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-parent</artifactId>
        <version>2.0.1.RELEASE</version>
        <relativePath/> <!-- lookup parent from repository -->
    </parent>

    <properties>
        <project.build.sourceEncoding>UTF-8</project.build.sourceEncoding>
        <project.reporting.outputEncoding>UTF-8</project.reporting.outputEncoding>
        <java.version>1.8</java.version>
    </properties>

    <dependencies>
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-web</artifactId>
        </dependency>

        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-tomcat</artifactId>
        </dependency>
        <dependency>
            <groupId>org.apache.tomcat.embed</groupId>
            <artifactId>tomcat-embed-jasper</artifactId>
        </dependency>
        <!-- servlet支持 -->
        <dependency>
            <groupId>javax.servlet</groupId>
            <artifactId>javax.servlet-api</artifactId>
        </dependency>

        <!-- jstl 支持 -->
        <dependency>
            <groupId>javax.servlet</groupId>
            <artifactId>jstl</artifactId>
        </dependency>
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-test</artifactId>
            <scope>test</scope>
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

</project>
```


注意：我在使用 maven 多模块测试的时候，发现自测一直失败，所以这个 demo 是最基础的 maven 单模块项目。

## 配置文件

- application.properties

```
spring.mvc.view.prefix=/WEB-INF/jsp/
spring.mvc.view.suffix=.jsp
```

指定了 view 所在的文件夹，指定了试 view 文件后缀。

- index.jsp 

这个文件，一定要按照我们指定的路径，放在 `webapp/WEB-INF/jsp/` 目录下。

```jsp
<!DOCTYPE html>
<%@page contentType="text/html; charset=UTF-8" language="java"%>
<html lang="en">
<head>
    <title>title</title>
</head>
<body>
this is index jsp
</body>
</html>
```

作为入门测试代码，这里就不演示什么技术了，最简单的一个 jsp 页面。

## java 代码

- IndexController.java

```java
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;

/**
 * @author binbin.hou
 * @since 1.0.0
 */
@Controller
public class IndexController {

    @GetMapping(value="/index")
    public String index() {
        return "index";
    }

}
```

- JspApplication.java

```java
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

/**
 * @author binbin.hou
 * @since 1.0.0
 */
@SpringBootApplication
public class JspApplication {

    public static void main(String[] args) {
        SpringApplication.run(JspApplication.class, args);
    }

}
```

## 启动测试

直接运行 main() 方法，浏览器访问 [localhost:8080/index](localhost:8080/index) 即可。

页面返回内容：

```
this is index jsp
```

# 小结

这里演示了一个最简单的 springboot 整合 jsp 的例子。

后续我们将演示，如何通过 jsp 实现文件的下载和上传。

* any list
{:toc}