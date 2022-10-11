---
layout: post
title:  maven 启动 springboot 报错 Unable to start EmbeddedWebApplicationContext due to missing EmbeddedServletContainerFactory bean
date:  2022-09-12 21:22:02 +0800
categories: [WEB]
tags: [web, springboot, maven, error, in-action, sh]
published: true
---

# 报错

maven 启动 springboot 项目报错：

```
2022-09-14 10:58:17.373 ERROR [] 16204 --- [           main] o.s.boot.SpringApplication               : Application startup failed

org.springframework.context.ApplicationContextException: Unable to start embedded container; nested exception is org.springframework.context.ApplicationContextException: Unable to start EmbeddedWebApplicationContext due to missing EmbeddedServletContainerFactory bean.
```

这个项目在有的 idea 上是可以的。

# 原因1

之前我将此SpringBoot项目部署在本地的Tomcat上运行，在pom.xml文件中做了如下修改：

```xml
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-web</artifactId>
    <exclusions>
        <exclusion>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-tomcat</artifactId>
        </exclusion>
    </exclusions>
</dependency>
```

将SpirngBoot自带的tomcat去除了，在使用类启动的时候缺少tomcat就会报错，将代码注释掉，就可以正常启动

```xml
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-web</artifactId>
</dependency>
```

ps: 这种我测试了一下，依然报错。

# 原因2


## maven provideed

`spring-boot-starter-tomcat` 在 maven 中的 scope 为  provideed。

provided 依赖只有在当JDK 或者一个容器已提供该依赖之后才使用。

例如， 如果你开发了一个web 应用，你可能在编译 classpath 中需要可用的Servlet API 来编译一个servlet，但是你不会想要在打包好的WAR 中包含这个Servlet API；

这个 Servlet API JAR 由你的应用服务器或者servlet 容器提供。已提供范围的依赖在编译classpath （不是运行时）可用。它们不是传递性的，也不会被打包。

## idea 本身的机制问题

在 Intellij Idea 15 中使用maven时，所有 scope 为 provided 的依赖都是不会被加入到 classpath 中的，目前该bug尚未被修复(bug report)。

如果你的web应用是部署到容器中的，那么这个bug不会影响使用，因为web应用中provided的依赖在容器运行时会被提供。

如果你做Spring Boot开发，有带provided的依赖时，直接在IDE中运行项目会导致ClassNotFound异常。

解决方案有二：

1. 使用spring-boot:run这个 maven goal 运行程序。但这样会失去 Idea 的 debug功能，不推荐。

2. 点击IDE右侧的Maven Projects, 找到spring-boot:run，右键选择 debug 运行，如图：

![img](https://img-blog.csdn.net/20180227115941764?watermark/2/text/aHR0cDovL2Jsb2cuY3Nkbi5uZXQvd2F0ZXJkZW1v/font/5a6L5L2T/fontsize/400/fill/I0JBQkFCMA==/dissolve/70)


ps: 实测，采用方案2是可以的。

# 参考资料

https://blog.csdn.net/sinat_36553913/article/details/79891381

https://blog.csdn.net/waterdemo/article/details/79386388


* any list
{:toc}
