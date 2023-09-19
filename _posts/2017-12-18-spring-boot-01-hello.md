---
layout: post
title:  Spring Boot-01-入门案例
date:  2017-12-19 14:43:25 +0800
categories: [Spring]
tags: [spring, spring, springboot]
published: true
---

# Spring Boot

[Spring Boot](https://projects.spring.io/spring-boot/)旨在让您尽快起步并开始运行，最少的Spring前期配置。

Spring Boot 对构建可用于生产的应用程序持坚定态度。

# Hello World

> [完整代码](https://github.com/houbb/spring-boot/tree/master/spring-boot-hello) 

## 项目结构

```
│  pom.xml
└─src
    └─main
        ├─java
        │  └─com
        │      └─ryo
        │          └─spring
        │              └─boot
        │                  └─learn
        │                      └─hw
        │                          └─controller
        │                                  SampleController.java
```

## 文件内容

- pom.xml

引入指定的 jar

```xml
<parent>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-parent</artifactId>
    <version>1.5.9.RELEASE</version>
</parent>
<dependencies>
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-web</artifactId>
    </dependency>
</dependencies>
```

- SampleController.java

```java
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.EnableAutoConfiguration;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseBody;

@Controller
@EnableAutoConfiguration
public class SampleController {

    @RequestMapping("/")
    @ResponseBody
    String home() {
        return "Hello World!";
    }

    public static void main(String[] args) throws Exception {
        SpringApplication.run(SampleController.class, args);
    }

}
```

## 运行

直接运行 `SampleController.main()`，日志如下:

```
  .   ____          _            __ _ _
 /\\ / ___'_ __ _ _(_)_ __  __ _ \ \ \ \
( ( )\___ | '_ | '_| | '_ \/ _` | \ \ \ \
 \\/  ___)| |_)| | | | | || (_| |  ) ) ) )
  '  |____| .__|_| |_|_| |_\__, | / / / /
 =========|_|==============|___/=/_/_/_/
 :: Spring Boot ::        (v1.5.9.RELEASE)

2017-12-19 15:18:50.620  INFO 6676 --- [           main] c.r.s.b.l.h.controller.SampleController  : Starting SampleController on bbhou-PC with PID 6676 (D:\CODE\fork\spring-boot-learn\spring-boot-learn-hw\target\classes started by bbhou in D:\CODE\fork\spring-boot-learn)
2017-12-19 15:18:50.623  INFO 6676 --- [           main] c.r.s.b.l.h.controller.SampleController  : No active profile set, falling back to default profiles: default
2017-12-19 15:18:50.664  INFO 6676 --- [           main] ationConfigEmbeddedWebApplicationContext : Refreshing org.springframework.boot.context.embedded.AnnotationConfigEmbeddedWebApplicationContext@1c72da34: startup date [Tue Dec 19 15:18:50 CST 2017]; root of context hierarchy
2017-12-19 15:18:51.621  INFO 6676 --- [           main] s.b.c.e.t.TomcatEmbeddedServletContainer : Tomcat initialized with port(s): 8080 (http)
2017-12-19 15:18:51.628  INFO 6676 --- [           main] o.apache.catalina.core.StandardService   : Starting service [Tomcat]
2017-12-19 15:18:51.629  INFO 6676 --- [           main] org.apache.catalina.core.StandardEngine  : Starting Servlet Engine: Apache Tomcat/8.5.23
2017-12-19 15:18:51.738  INFO 6676 --- [ost-startStop-1] o.a.c.c.C.[Tomcat].[localhost].[/]       : Initializing Spring embedded WebApplicationContext
2017-12-19 15:18:51.738  INFO 6676 --- [ost-startStop-1] o.s.web.context.ContextLoader            : Root WebApplicationContext: initialization completed in 1079 ms
2017-12-19 15:18:51.839  INFO 6676 --- [ost-startStop-1] o.s.b.w.servlet.ServletRegistrationBean  : Mapping servlet: 'dispatcherServlet' to [/]
2017-12-19 15:18:51.843  INFO 6676 --- [ost-startStop-1] o.s.b.w.servlet.FilterRegistrationBean   : Mapping filter: 'characterEncodingFilter' to: [/*]
2017-12-19 15:18:51.843  INFO 6676 --- [ost-startStop-1] o.s.b.w.servlet.FilterRegistrationBean   : Mapping filter: 'hiddenHttpMethodFilter' to: [/*]
2017-12-19 15:18:51.844  INFO 6676 --- [ost-startStop-1] o.s.b.w.servlet.FilterRegistrationBean   : Mapping filter: 'httpPutFormContentFilter' to: [/*]
2017-12-19 15:18:51.844  INFO 6676 --- [ost-startStop-1] o.s.b.w.servlet.FilterRegistrationBean   : Mapping filter: 'requestContextFilter' to: [/*]
2017-12-19 15:18:52.093  INFO 6676 --- [           main] s.w.s.m.m.a.RequestMappingHandlerAdapter : Looking for @ControllerAdvice: org.springframework.boot.context.embedded.AnnotationConfigEmbeddedWebApplicationContext@1c72da34: startup date [Tue Dec 19 15:18:50 CST 2017]; root of context hierarchy
2017-12-19 15:18:52.152  INFO 6676 --- [           main] s.w.s.m.m.a.RequestMappingHandlerMapping : Mapped "{[/]}" onto java.lang.String com.ryo.spring.boot.learn.hw.controller.SampleController.home()
2017-12-19 15:18:52.156  INFO 6676 --- [           main] s.w.s.m.m.a.RequestMappingHandlerMapping : Mapped "{[/error]}" onto public org.springframework.http.ResponseEntity<java.util.Map<java.lang.String, java.lang.Object>> org.springframework.boot.autoconfigure.web.BasicErrorController.error(javax.servlet.http.HttpServletRequest)
2017-12-19 15:18:52.157  INFO 6676 --- [           main] s.w.s.m.m.a.RequestMappingHandlerMapping : Mapped "{[/error],produces=[text/html]}" onto public org.springframework.web.servlet.ModelAndView org.springframework.boot.autoconfigure.web.BasicErrorController.errorHtml(javax.servlet.http.HttpServletRequest,javax.servlet.http.HttpServletResponse)
2017-12-19 15:18:52.181  INFO 6676 --- [           main] o.s.w.s.handler.SimpleUrlHandlerMapping  : Mapped URL path [/webjars/**] onto handler of type [class org.springframework.web.servlet.resource.ResourceHttpRequestHandler]
2017-12-19 15:18:52.182  INFO 6676 --- [           main] o.s.w.s.handler.SimpleUrlHandlerMapping  : Mapped URL path [/**] onto handler of type [class org.springframework.web.servlet.resource.ResourceHttpRequestHandler]
2017-12-19 15:18:52.208  INFO 6676 --- [           main] o.s.w.s.handler.SimpleUrlHandlerMapping  : Mapped URL path [/**/favicon.ico] onto handler of type [class org.springframework.web.servlet.resource.ResourceHttpRequestHandler]
2017-12-19 15:18:52.320  INFO 6676 --- [           main] o.s.j.e.a.AnnotationMBeanExporter        : Registering beans for JMX exposure on startup
2017-12-19 15:18:52.368  INFO 6676 --- [           main] s.b.c.e.t.TomcatEmbeddedServletContainer : Tomcat started on port(s): 8080 (http)
2017-12-19 15:18:52.373  INFO 6676 --- [           main] c.r.s.b.l.h.controller.SampleController  : Started SampleController in 1.965 seconds (JVM running for 2.962)
```

## 访问

打开浏览器访问 [http://localhost:8080/](http://localhost:8080/)

内容如下:

```
Hello World!
```

# 小结

和 spring mvc 相比，简单太多。确切的说，很多东西都被**默认配置**好了。

而且我相信，这也不单单是简化版的 spring mvc 而已。

本实战系列用于记录 springboot 的实际使用和学习笔记。

拓展阅读：

[面试官：知道 springboot 的启动原理吗？](https://www.toutiao.com/item/6905286288581100046/)

希望本文对比有所帮助，如果喜欢，欢迎点赞转发收藏一波。

我是老马，期待与你的下次相遇。

* any list
{:toc}
