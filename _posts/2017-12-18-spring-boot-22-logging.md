---
layout: post
title:  Spring Boot-22-logging 日志详解
date:  2017-12-19 14:43:25 +0800
categories: [Spring]
tags: [spring, web, springboot]
published: true
---

# 序言

大家好，我是老马。

平时一直在使用 springboot，却总感觉对于其理解不深入，于是有两个这个系列的整理。

主要是为了系统的学习一下 springboot，残缺补漏一下。主要翻译自官方文档，结合自己的实际使用。

[springboot 学习笔记（一）引导类特性详解](https://www.toutiao.com/item/6916083152544956932/)

[springboot 学习笔记（二）外部化配置详解](https://www.toutiao.com/item/6916084329705734660/)

[springboot 教程（三）如何实现配置与环境隔离？](https://www.toutiao.com/item/6916471106937569803/)

# 场景

日志是为了问题排查定位，是非常必要的功能。

springboot 默认配置的 logging 就可以非常方便我们使用，不过还有一些细节，值得我们学习一下。

# logging

springboot 默认使用 common logging 进行内部的日志输出。

当然，业界最有希望一统天下的就是 slf4j 这套接口标准。

当我们使用 starter 时，默认使用 logback 作为日志实现。

# 日志格式

我们截取一段日志格式如下：

```
2021-01-11 19:41:08.821  INFO 1300 --- [           main] c.g.h.s.boot.learn.profile.Application   : Starting Application on hackerone with PID 1300 (D:\github\spring-boot-learn\spring-boot-profile\target\classes started by Administrator in D:\github\spring-boot-learn)
2021-01-11 19:41:08.824  INFO 1300 --- [           main] c.g.h.s.boot.learn.profile.Application   : The following profiles are active: prod
2021-01-11 19:41:08.883  INFO 1300 --- [           main] ationConfigEmbeddedWebApplicationContext : Refreshing org.springframework.boot.context.embedded.AnnotationConfigEmbeddedWebApplicationContext@195092a: startup date [Mon Jan 11 19:41:08 CST 2021]; root of context hierarchy
2021-01-11 19:41:10.221  INFO 1300 --- [           main] s.b.c.e.t.TomcatEmbeddedServletContainer : Tomcat initialized with port(s): 18080 (http)
2021-01-11 19:41:10.232  INFO 1300 --- [           main] o.apache.catalina.core.StandardService   : Starting service [Tomcat]
2021-01-11 19:41:10.233  INFO 1300 --- [           main] org.apache.catalina.core.StandardEngine  : Starting Servlet Engine: Apache Tomcat/8.5.23
```

输出以下项目：

- 日期和时间：毫秒精度，易于排序。

- 日志级别：错误，警告，信息，调试或跟踪。

- 进程ID。

- `---` 分隔符用于区分实际日志消息的开始。

- 线程名称：用方括号括起来（对于控制台输出可能会被截断）。

- 记录器名称：这通常是源类名称（通常缩写）。

- 日志消息。

一般情况下，这些配置就已经足够了，不过还是建议添加一个 traceId，这样更加便于问题排查。

你可以阅读：

[java 注解自动输出日志新增拦截器与过滤器](https://www.toutiao.com/item/6876649344028639748/)

[java 注解结合 spring aop 日志唯一标识](https://www.toutiao.com/item/6869387773523165707/)

[java 注解结合 spring aop 实现自动输出日志](https://www.toutiao.com/item/6867898642200527364/)

# 控台日志

## 调整日志级别

一般情况下是 INFO 级别，如果我们想调整日志级别怎么办呢？

有两种方式：

（1）命令行指定

```
$ java -jar myapp.jar --debug
```

（2）配置文件指定

在 `application.properties` 文件中添加 

```
debug=true
```

效果如下：

```
2021-01-11 20:32:03.694  INFO 8764 --- [           main] c.g.h.s.boot.learn.profile.Application   : The following profiles are active: prod
2021-01-11 20:32:03.694 DEBUG 8764 --- [           main] o.s.boot.SpringApplication               : Loading source class com.github.houbb.spring.boot.learn.profile.Application
2021-01-11 20:32:03.754 DEBUG 8764 --- [           main] o.s.b.c.c.ConfigFileApplicationListener  : Activated profiles prod
```

## 彩色输出

彩色输出可以让我们更加方便的在控台看出日志的级别。

ERROR 一般是红色，WARN 一般是黄色。

我们的视觉永远更加敏锐一些，不过这也只局限于控台日志，当真输出到文件时，还是白纸黑字。

# 文件输出

生产中，日志需要长期保留，所以需要输出到对应的文件中。

不过一般实践中，**都会直接使用 logback.xml 之类的配置**，所以这里只做简单的介绍。

## 文件名称

默认是只输出到控台的。我们可以指定输出的路径，名称可以是确切的位置，也可以相对于当前目录。

- 指定文件

```
# 写入指定的日志文件。
logging.file.name = my.log
```

- 指定文件夹

```
# 将spring.log写入指定目录。
logging.file.path = /var/log
```

## 日志的归档

生成的日志量一般比较大，磁盘都是有限的，所以一般都会对 3 天以上的日志进行归档。

单个的日志文件也不能太大，一般 500M 一个文件。

# 日志级别

我们有时针对不同的类，希望看到的日志级别可能不同。

比如希望看到 mapper 对应的详细 sql，一般开启 DEBUG 级别。

对于一些中间件 mq 之类的，可能只关心 WARN 以上级别。

这些都可以通过配置方便的指定：

```
logging.level.root=warn
logging.level.org.springframework.web=debug
logging.level.org.hibernate=error
```

# 日志组

发现这个功能还是比较强大的，个人感觉就是把一系列的包归为一个组，可以更加方便的配置日志级别等。

实现方式：

```
logging.group.tomcat=org.apache.catalina,org.apache.coyote,org.apache.tomcat
```

这样就可以把 `org.apache.catalina` 和 `org.apache.coyote,org.apache.tomcat` 都认为是 `logging.group.tomcat` 这个组。

我们可以使用下面的方式，统一修改日志级别：

```
logging.level.tomcat=trace
```

## 内置

当然，springboot 有一些开箱即用的内置策略：

- web

包含：

```
org.springframework.core.codec, 
org.springframework.http, 
org.springframework.web, 
org.springframework.boot.actuate.endpoint.web, 
org.springframework.boot.web.servlet.ServletContextInitializerBeans
```

- sql

包含：

```
org.springframework.jdbc.core, 
org.hibernate.SQL, 
org.jooq.tools.LoggerListener
```

# logback 拓展

针对 logback，spring 还做了一些拓展功能，让其变得更加强大。

## 特定 profile 的配置

通过 `<springProfile>` 标记，您可以根据活动的Spring概要文件有选择地包括或排除配置部分，在 <configuration>` 元素内的任何位置都支持这个属性。

这样才做了 profile 与配置的更加强大的整合。

```xml
<springProfile name="staging">
    <!-- configuration to be enabled when the "staging" profile is active -->
</springProfile>

<springProfile name="dev | staging">
    <!-- configuration to be enabled when the "dev" or "staging" profiles are active -->
</springProfile>

<springProfile name="!production">
    <!-- configuration to be enabled when the "production" profile is not active -->
</springProfile>
```

## 特定环境的配置

`<springProperty>` 标记使您可以从Spring Environment中公开属性，以在Logback中使用。 

```xml
<springProperty scope="context" name="fluentHost" source="myapp.fluentd.host"
        defaultValue="localhost"/>
<appender name="FLUENT" class="ch.qos.logback.more.appenders.DataFluentAppender">
    <remoteHost>${fluentHost}</remoteHost>
    ...
</appender>
```

# 不同的环境指定不同的配置

## 场景说明

一般情况下 springboot 可以通过 -P 指定不同的环境配置，当然如果有配置中心的情况下，就不希望使用 -P 指定环境了。

## 配置修改

默认为  logback.xml

我们新建一个 logback-dev.xml

配置如下:

```xml
<root level="INFO">
     <appender-ref ref="STDOUT"/>
</root>
```

dev 环境输出到控台，便于测试。

## 启动 jvm 参数

```
-Dlogging.config=classpath:logback-dev.xml
```

这样本地就可以以 logback-dev.xml 配置为准。


# 小结

希望本文对你有帮助，如果有其他想法的话，也可以评论区和大家分享哦。

各位极客的点赞收藏转发，是老马持续写作的最大动力！

我是老马，期待与你的下次重逢。

# 参考资料

https://docs.spring.io/spring-boot/docs/2.4.1/maven-plugin/reference/htmlsingle/#help

* any list
{:toc}
