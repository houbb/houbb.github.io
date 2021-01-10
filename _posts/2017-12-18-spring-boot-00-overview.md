---
layout: post
title: Spring Boot-00-overview 概览
date:  2016-06-19 16:57:12 +0800
categories: [Spring]
tags: [spring boot, spring, springboot]
published: true
---

# Spring Boot

对构建可用于生产的Spring应用程序持坚定态度。

[Spring Boot](http://projects.spring.io/spring-boot/) 倾向于使用约定而非配置，它旨在使您尽快启动并运行。

## 是什么

Spring Boot简化了基于Spring的应用开发，通过少量的代码就能创建一个独立的、产品级别的Spring应用。 

Spring Boot为Spring平台及第三方库提供开箱即用的设置，这样你就可以有条不紊地开始。

多数Spring Boot应用只需要很少的Spring配置。

Spring Boot是由Pivotal团队提供的全新框架，其设计目的是用来简化新Spring应用的初始搭建以及开发过程。

该框架使用了特定的方式来进行配置，从而使开发人员不再需要定义样板化的配置。用我的话来理解，就是Spring Boot其实不是什么新的框架，它默认配置了很多框架的使用方式，就像maven整合了所有的jar包，Spring Boot整合了所有的框架（不知道这样比喻是否合适）。

Spring Boot的核心思想就是约定大于配置，一切自动完成。

采用 Spring Boot 可以大大的简化你的开发模式，所有你想集成的常用框架，它都有对应的组件支持。

ps: 感觉这点和 maven 是比较类似的。

## You need

- jdk1.8 or later;

- Maven 3.0+

<div class="UML">
    Title: Hello World
    create->build & run:
    build & run->visit:
    visit->result:
</div>

# Hello World

- create

> /src/main/java/com/ryo/controller/HelloWorld.java

```java
package com.ryo.controller;

import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RestController;

/**
 * Created by houbinbin on 16/6/19.
 */
@RestController
@RequestMapping("hello")
public class HelloWorld {
    @RequestMapping(method = RequestMethod.GET)
    public String hello() {
        return "SUCCESS";
    }
}
```

> /src/main/java/com/ryo/Application.java

```java
package com.ryo;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

/**
 * Created by houbinbin on 16/6/19.
 */
@SpringBootApplication
public class Application {
    public static void main(String args[]) {
        SpringApplication.run(Application.class, args);
    }
}
```

> pom.xml

```xml
<?xml version="1.0" encoding="UTF-8"?>
<project xmlns="http://maven.apache.org/POM/4.0.0" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 http://maven.apache.org/xsd/maven-4.0.0.xsd">
    <modelVersion>4.0.0</modelVersion>

    <groupId>com.ryo</groupId>
    <artifactId>springboot</artifactId>
    <version>1.0.0</version>

    <properties>
        <!--spring-boot-->
        <spring-boot.version>1.3.5.RELEASE</spring-boot.version>
    </properties>

    <dependencies>
        <!--spring-boot-->
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-web</artifactId>
            <version>${spring-boot.version}</version>
        </dependency>
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-test</artifactId>
            <version>${spring-boot.version}</version>
        </dependency>
    </dependencies>


    <build>
        <plugins>
            <plugin>
                <groupId>org.springframework.boot</groupId>
                <artifactId>spring-boot-maven-plugin</artifactId>
                <version>${spring-boot.version}</version>
            </plugin>
        </plugins>
    </build>
</project>
```

- build & run

```xml
$ mvn clean install
```

and then, use

```
maven projects -> Plugins -> spring-boot -> spring-boot:run
```

to start spring-boot.

- console run info

```
  .   ____          _            __ _ _
 /\\ / ___'_ __ _ _(_)_ __  __ _ \ \ \ \
( ( )\___ | '_ | '_| | '_ \/ _` | \ \ \ \
 \\/  ___)| |_)| | | | | || (_| |  ) ) ) )
  '  |____| .__|_| |_|_| |_\__, | / / / /
 =========|_|==============|___/=/_/_/_/
 :: Spring Boot ::        (v1.3.5.RELEASE)

2016-06-19 17:13:05.025  INFO 7555 --- [           main] com.ryo.Application                      : Starting Application on houbinbindeMacBook-Pro.local with PID 7555 (/Users/houbinbin/IT/code/springboot/target/classes started by houbinbin in /Users/houbinbin/IT/code/springboot)
2016-06-19 17:13:05.028  INFO 7555 --- [           main] com.ryo.Application                      : No active profile set, falling back to default profiles: default
2016-06-19 17:13:05.135  INFO 7555 --- [           main] ationConfigEmbeddedWebApplicationContext : Refreshing org.springframework.boot.context.embedded.AnnotationConfigEmbeddedWebApplicationContext@29724e51: startup date [Sun Jun 19 17:13:05 CST 2016]; root of context hierarchy
2016-06-19 17:13:06.088  INFO 7555 --- [           main] s.b.c.e.t.TomcatEmbeddedServletContainer : Tomcat initialized with port(s): 8080 (http)
2016-06-19 17:13:06.098  INFO 7555 --- [           main] o.apache.catalina.core.StandardService   : Starting service Tomcat
2016-06-19 17:13:06.099  INFO 7555 --- [           main] org.apache.catalina.core.StandardEngine  : Starting Servlet Engine: Apache Tomcat/8.0.33
2016-06-19 17:13:06.162  INFO 7555 --- [ost-startStop-1] o.a.c.c.C.[Tomcat].[localhost].[/]       : Initializing Spring embedded WebApplicationContext
2016-06-19 17:13:06.163  INFO 7555 --- [ost-startStop-1] o.s.web.context.ContextLoader            : Root WebApplicationContext: initialization completed in 1030 ms
2016-06-19 17:13:06.351  INFO 7555 --- [ost-startStop-1] o.s.b.c.e.ServletRegistrationBean        : Mapping servlet: 'dispatcherServlet' to [/]
2016-06-19 17:13:06.354  INFO 7555 --- [ost-startStop-1] o.s.b.c.embedded.FilterRegistrationBean  : Mapping filter: 'characterEncodingFilter' to: [/*]
2016-06-19 17:13:06.354  INFO 7555 --- [ost-startStop-1] o.s.b.c.embedded.FilterRegistrationBean  : Mapping filter: 'hiddenHttpMethodFilter' to: [/*]
2016-06-19 17:13:06.354  INFO 7555 --- [ost-startStop-1] o.s.b.c.embedded.FilterRegistrationBean  : Mapping filter: 'httpPutFormContentFilter' to: [/*]
2016-06-19 17:13:06.354  INFO 7555 --- [ost-startStop-1] o.s.b.c.embedded.FilterRegistrationBean  : Mapping filter: 'requestContextFilter' to: [/*]
2016-06-19 17:13:06.573  INFO 7555 --- [           main] s.w.s.m.m.a.RequestMappingHandlerAdapter : Looking for @ControllerAdvice: org.springframework.boot.context.embedded.AnnotationConfigEmbeddedWebApplicationContext@29724e51: startup date [Sun Jun 19 17:13:05 CST 2016]; root of context hierarchy
2016-06-19 17:13:06.621  INFO 7555 --- [           main] s.w.s.m.m.a.RequestMappingHandlerMapping : Mapped "{[/hello],methods=[GET]}" onto public java.lang.String com.ryo.controller.HelloWorld.hello()
2016-06-19 17:13:06.623  INFO 7555 --- [           main] s.w.s.m.m.a.RequestMappingHandlerMapping : Mapped "{[/error]}" onto public org.springframework.http.ResponseEntity<java.util.Map<java.lang.String, java.lang.Object>> org.springframework.boot.autoconfigure.web.BasicErrorController.error(javax.servlet.http.HttpServletRequest)
2016-06-19 17:13:06.623  INFO 7555 --- [           main] s.w.s.m.m.a.RequestMappingHandlerMapping : Mapped "{[/error],produces=[text/html]}" onto public org.springframework.web.servlet.ModelAndView org.springframework.boot.autoconfigure.web.BasicErrorController.errorHtml(javax.servlet.http.HttpServletRequest,javax.servlet.http.HttpServletResponse)
2016-06-19 17:13:06.641  INFO 7555 --- [           main] o.s.w.s.handler.SimpleUrlHandlerMapping  : Mapped URL path [/webjars/**] onto handler of type [class org.springframework.web.servlet.resource.ResourceHttpRequestHandler]
2016-06-19 17:13:06.641  INFO 7555 --- [           main] o.s.w.s.handler.SimpleUrlHandlerMapping  : Mapped URL path [/**] onto handler of type [class org.springframework.web.servlet.resource.ResourceHttpRequestHandler]
2016-06-19 17:13:06.667  INFO 7555 --- [           main] o.s.w.s.handler.SimpleUrlHandlerMapping  : Mapped URL path [/**/favicon.ico] onto handler of type [class org.springframework.web.servlet.resource.ResourceHttpRequestHandler]
2016-06-19 17:13:06.736  INFO 7555 --- [           main] o.s.j.e.a.AnnotationMBeanExporter        : Registering beans for JMX exposure on startup
2016-06-19 17:13:06.783  INFO 7555 --- [           main] s.b.c.e.t.TomcatEmbeddedServletContainer : Tomcat started on port(s): 8080 (http)
2016-06-19 17:13:06.786  INFO 7555 --- [           main] com.ryo.Application                      : Started Application in 1.953 seconds (JVM running for 3.939)
```

- visit in browser, input

```
http://localhost:8080/hello
```

- result

```
SUCCESS
```

# 参考资料

https://www.cnblogs.com/ityouknow/p/7508306.html

[springboot依赖的一些配置：spring-boot-dependencies、spring-boot-starter-parent、io.spring.platform](https://www.cnblogs.com/ld-mars/p/11714151.html)

[完整文档](https://docs.spring.io/spring-boot/docs/2.4.1/reference/htmlsingle/)

* any list
{:toc}