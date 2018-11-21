---
layout: post
title: Logback-01-intro
date: 2018-11-19 08:11:55 +0800
categories: [Log]
tags: [log, sh]
published: true
excerpt: Logback 入门介绍，使用简介
---

# Logback

[Logback](https://logback.qos.ch/) 旨在作为流行的log4j项目的后续版本，从而恢复log4j离开的位置。

Logback旨在成为流行的log4j项目的后续版本。它由log4j的创始人CekiGülcü设计。

它建立在设计工业强度测井系统的十年经验之上。

由此产生的产品，即 back，比所有现有的测井系统更快并且占地面积更小，有时候是大幅度的。

同样重要的是，logback提供了其他日志记录系统中缺少的独特且非常有用的功能。

## 模块

Logback的体系结构足够通用，以便在不同情况下应用。

目前，logback分为三个模块：logback-core，logback-classic和logback-access。

logback-core模块为其他两个模块奠定了基础。 

logback-classic模块可以被同化为log4j的显着改进版本。

此外，logback-classic本身实现了SLF4J API，因此您可以在logback和其他日志框架（如log4j或java.util.logging（JUL））之间来回切换。

logback-access模块​​与Servlet容器（如Tomcat和Jetty）集成，以提供HTTP访问日志功能。

请注意，您可以在logback-core之上轻松构建自己的模块。

# 快速开始

你可以在 [logback-learn-base](https://github.com/houbb/logback-learn/tree/master/logback-learn-base) 下载源代码。

## 项目结构

```
│  pom.xml
│
└─src
    └─main
        ├─java
        │  └─com
        │      └─github
        │          └─houbb
        │              └─logback
        │                  └─learn
        │                      └─base
        │                              Main.java
        │
        └─resources
                logback.xml
```

## jar 的引入

本项目使用 Maven 管理 Jar

- pom.xml

引入 logback

```xml
<dependency>
    <groupId>ch.qos.logback</groupId>
    <artifactId>logback-classic</artifactId>
    <version>1.0.13</version>
</dependency>
```

- logback.xml

相关配置如下：

```xml
<?xml version="1.0" encoding="UTF-8"?>
<configuration>

    <appender name="STDOUT" class="ch.qos.logback.core.ConsoleAppender">
        <layout class="ch.qos.logback.classic.PatternLayout">
            <Pattern>%d{HH:mm:ss.SSS} [%thread] %-5level %logger{36} - %msg%n</Pattern>
        </layout>
    </appender>

    <logger name="com.github.houbb.logback.learn.base" level="TRACE"/>

    <root level="debug">
        <appender-ref ref="STDOUT" />
    </root>

</configuration>
```

注意：`com.github.houbb.logback.learn.base` 这个是我测试的对应包，在测试时你可以根据自己需要进行调整。

- Main.java

最简单的方法，模拟使用日志。

```java
package com.github.houbb.logback.learn.base;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

/**
 * @author binbin.hou
 * @date 2018/11/19 11:41
 */
public class Main {

    private static final Logger LOG = LoggerFactory.getLogger(Main.class);

    public static void main(String[] args) {
        LOG.trace("Hello World!");
        LOG.debug("How are you today?");
        LOG.info("I am fine.");
        LOG.warn("I love programming.");
        LOG.error("I am programming.");
    }

}
```

ps: 你会发现这里直接使用的是 SFL4j 的接口。

## 日志信息

测试日志信息如下：

```
11:45:40,911 |-INFO in ch.qos.logback.classic.LoggerContext[default] - Could NOT find resource [logback.groovy]
11:45:40,911 |-INFO in ch.qos.logback.classic.LoggerContext[default] - Could NOT find resource [logback-test.xml]
11:45:40,911 |-INFO in ch.qos.logback.classic.LoggerContext[default] - Found resource [logback.xml] at [file:/D:/github/logback-learn/logback-learn-base/target/classes/logback.xml]
11:45:40,996 |-INFO in ch.qos.logback.classic.joran.action.ConfigurationAction - debug attribute not set
11:45:41,012 |-INFO in ch.qos.logback.core.joran.action.AppenderAction - About to instantiate appender of type [ch.qos.logback.core.ConsoleAppender]
11:45:41,032 |-INFO in ch.qos.logback.core.joran.action.AppenderAction - Naming appender as [STDOUT]
11:45:41,148 |-WARN in ch.qos.logback.core.ConsoleAppender[STDOUT] - This appender no longer admits a layout as a sub-component, set an encoder instead.
11:45:41,148 |-WARN in ch.qos.logback.core.ConsoleAppender[STDOUT] - To ensure compatibility, wrapping your layout in LayoutWrappingEncoder.
11:45:41,148 |-WARN in ch.qos.logback.core.ConsoleAppender[STDOUT] - See also http://logback.qos.ch/codes.html#layoutInsteadOfEncoder for details
11:45:41,148 |-INFO in ch.qos.logback.classic.joran.action.LoggerAction - Setting level of logger [com.github.houbb.logback.learn.base] to TRACE
11:45:41,148 |-INFO in ch.qos.logback.classic.joran.action.RootLoggerAction - Setting level of ROOT logger to DEBUG
11:45:41,148 |-INFO in ch.qos.logback.core.joran.action.AppenderRefAction - Attaching appender named [STDOUT] to Logger[ROOT]
11:45:41,148 |-INFO in ch.qos.logback.classic.joran.action.ConfigurationAction - End of configuration.
11:45:41,148 |-INFO in ch.qos.logback.classic.joran.JoranConfigurator@2a098129 - Registering current configuration as safe fallback point

11:45:41.163 [main] TRACE c.g.houbb.logback.learn.base.Main - Hello World!
11:45:41.163 [main] DEBUG c.g.houbb.logback.learn.base.Main - How are you today?
11:45:41.163 [main] INFO  c.g.houbb.logback.learn.base.Main - I am fine.
11:45:41.163 [main] WARN  c.g.houbb.logback.learn.base.Main - I love programming.
11:45:41.163 [main] ERROR c.g.houbb.logback.learn.base.Main - I am programming.
```

最下面的就是我们相应的日志信息，上面有一些配置加载的信息，我们后面会逐渐介绍。


# 特性

我们要从 log4j 切换到 logback，肯定是因为 logback 有足够的优势，能够吸引我们去切换。

- 优先于log4j进行logback的原因

Logback对log4j进行了大量改进，无论大小。它们太多了，无法详尽地列举。然而，这里是从log4j切换到logback的原因的非详尽列表。请记住，logback在概念上与log4j非常相似，因为两个项目都是由同一个开发人员创建的。如果您已熟悉log4j，您将很快感到宾至如归。如果你喜欢log4j，你可能会喜欢logback。

## 更快的实施

基于我们之前关于log4j的工作，已经重写了logback内部，以便在某些关键执行路径上执行大约十倍的速度。不仅logback组件更快，而且内存占用更少。

## 大量的测试

Logback包含了在几年和无数小时工作中开发的大量测试。虽然log4j也经过测试，但logback将测试带到了完全不同的水平。在我们看来，这是优先于log4j进行logback的最重要原因。您希望您的日志框架即使在不利条件下也能够坚如磐石且可靠。

## logback-classic本身就说SLF4J

由于logback-classic中的Logger类本身实现了SLF4J API，因此在调用带有logback-classic作为底层实现的SLF4J记录器时，会产生零开销。此外，由于logback-classic强烈鼓励使用SLF4J作为其客户端API，如果需要切换到log4j或j.u.l.，可以通过将一个jar文件替换为另一个jar文件来实现。您无需通过SLF4J API触摸代码记录。这可以大大减少切换日志框架所涉及的工作。

## 广泛的文档

Logback随附详细且不断更新的文档。

## XML或Groovy中的配置文件

配置logback的传统方法是通过XML文件。文档中的大多数示例都使用此XML语法。

但是，从logback版本0.9.22开始，也支持用Groovy编写的配置文件。与XML相比，Groovy风格的配置更直观，更一致，并且语法更短。

还有一个工具可以自动将logback.xml文件迁移到logback.groovy。

## 自动重新加载配置文件

Logback-classic可以在修改后自动重新加载其配置文件。扫描过程快速，无争用，并且动态扩展到数百个线程上每秒数百万次调用。它在应用程序服务器中也能很好地运行，更常见的是在JEE环境中，因为它不涉及创建单独的扫描线程。

## 从 I/O 故障中顺利恢复
Logback的FileAppender及其所有子类（包括RollingFileAppender）可以从I/O故障中正常恢复。

因此，如果文件服务器暂时失败，则不再需要重新启动应用程序以使日志记录再次运行。

一旦文件服务器恢复，相关的logback appender将从之前的错误状态透明地快速恢复。

## 自动删除旧的日志存档

通过设置TimeBasedRollingPolicy或SizeAndTimeBasedFNATP的maxHistory属性，可以控制最大归档文件数。如果您的滚动策略要求每月滚动并且您希望保留一年的日志，只需将maxHistory属性设置为12.将自动删除超过12个月的存档日志文件。

## 自动压缩存档的日志文件

RollingFileAppender可以在翻转期间自动压缩归档日志文件。压缩始终以异步方式发生，因此即使对于大型日志文件，也不会在压缩期间阻止应用程序。

## 谨慎的模式

在谨慎模式下，在多个JVM上运行的多个FileAppender实例可以安全地写入同一个日志文件。由于某些限制，谨慎模式扩展到RollingFileAppender。

## Lilith

Lilith是一个用于logback的日志记录和访问事件查看器。

它与log4j的 chainsaw 相当，只不过Lilith设计用于处理大量的测井数据而不会退缩。

## 条件处理配置文件

开发人员经常需要在针对不同环境（如开发，测试和生产）的多个logback配置文件之间进行操作。

这些配置文件有很多共同之处，仅在少数几个地方有所不同。

为了避免重复，logback支持在 `<if>`，`<then>`和`<else>`元素的帮助下对配置文件进行条件处理，以便单个配置文件可以充分地针对多个环境。

## 过滤器

Logback提供了大量的过滤功能，远远超出了log4j所提供的功能。

例如，假设您在生产服务器上部署了业务关键型应用程序。在处理大量事务的情况下，将日志记录级别设置为WARN，以便仅记录警告和错误。

现在想象一下，您遇到了一个可以在生产系统上重现的错误，但由于这两个环境（生产/测试）之间存在未指定的差异，因此在测试平台上仍然难以捉摸。

使用log4j，您唯一的选择是将生产系统上的日志记录级别降低到DEBUG以尝试识别问题。不幸的是，这将产生大量的记录数据，使分析变得困难。更重要的是，广泛的日志记录会影响应用程序在生产系统上的性能。

使用logback，您可以选择将所有用户的日志记录保持在WARN级别，除了负责识别问题的一个用户Alice。当Alice登录时，她将以DEBUG级别登录，而其他用户可以继续登录WARN级别。这个专长可以通过在配置文件中添加4行XML来实现。在本手册的相关部分中搜索MDCFilter。

## SiftingAppender

SiftingAppender是一个非常多才多艺的appender。它可用于根据任何给定的运行时属性分离（或筛选）日志记录。

例如，SiftingAppender可以根据用户会话分离日志记录事件，以便每个用户生成的日志进入不同的日志文件，每个用户一个日志文件。

## 堆栈跟踪包装数据

当logback打印异常时，堆栈跟踪将包含打包数据。 

以下是logback-demo Web应用程序生成的示例堆栈跟踪。

```
14:28:48.835 [btpool0-7] INFO  c.q.l.demo.prime.PrimeAction - 99 is not a valid value
java.lang.Exception: 99 is invalid
  at ch.qos.logback.demo.prime.PrimeAction.execute(PrimeAction.java:28) [classes/:na]
  at org.apache.struts.action.RequestProcessor.processActionPerform(RequestProcessor.java:431) [struts-1.2.9.jar:1.2.9]
  at org.apache.struts.action.RequestProcessor.process(RequestProcessor.java:236) [struts-1.2.9.jar:1.2.9]
  at org.apache.struts.action.ActionServlet.doPost(ActionServlet.java:432) [struts-1.2.9.jar:1.2.9]
  at javax.servlet.http.HttpServlet.service(HttpServlet.java:820) [servlet-api-2.5-6.1.12.jar:6.1.12]
  at org.mortbay.jetty.servlet.ServletHolder.handle(ServletHolder.java:502) [jetty-6.1.12.jar:6.1.12]
  at ch.qos.logback.demo.UserServletFilter.doFilter(UserServletFilter.java:44) [classes/:na]
  at org.mortbay.jetty.servlet.ServletHandler$CachedChain.doFilter(ServletHandler.java:1115) [jetty-6.1.12.jar:6.1.12]
  at org.mortbay.jetty.servlet.ServletHandler.handle(ServletHandler.java:361) [jetty-6.1.12.jar:6.1.12]
  at org.mortbay.jetty.webapp.WebAppContext.handle(WebAppContext.java:417) [jetty-6.1.12.jar:6.1.12]
  at org.mortbay.jetty.handler.ContextHandlerCollection.handle(ContextHandlerCollection.java:230) [jetty-6.1.12.jar:6.1.12]
```

从上面可以看出，应用程序正在使用Struts 1.2.9版，并在jetty版本6.1.12下部署。 

因此，堆栈跟踪将快速告知读者介入异常的类以及它们所属的包和包版本。 

当您的客户向您发送堆栈跟踪时，作为开发人员，您将不再需要让他们向您发送有关他们正在使用的软件包版本的信息。 

该信息将成为堆栈跟踪的一部分。 

## Logback-access

Logback-access，即带有大脑的HTTP访问日志记录，是logback的一个组成部分

最后但并非最不重要的是，logback-access模块是logback发行版的一部分，它与Servlet容器（如Jetty或Tomcat）集成，以提供丰富而强大的HTTP访问日志功能。 由于logback-access是初始设计的一部分，因此您喜欢的所有logback-classic功能也可用于logback-access。

## 综上所述

我们列出了一些优先考虑log4j的logback的原因。 鉴于logback建立在我们之前关于log4j的工作上，简单地说，logback只是一个更好的log4j。


# 拓展阅读

[log4j2](https://houbb.github.io/2016/05/21/Log4j2)

[slf4j](https://houbb.github.io/2018/08/27/slf4j)

[日志最佳实践](https://houbb.github.io/2018/01/07/how-to-log)


# 项目管理的哲学

当 logback 被广泛的使用之后，版本的更迭替换就要考虑很多东西。

## jdk

比如 jdk8 的使用，就通过问卷调查的形式。

[Logback JDK version](https://doodle.com/poll/s7n3wk59694pmnbs)

我觉得这是一种很赞的方式，让反馈从使用者的角度出发，而不只是作者本人考量。

# 参考资料

[快速开始](https://wiki.base22.com/btg/how-to-setup-slf4j-and-logback-in-a-web-app-fast-35488048.html)

[how-to-setup-slf4j-and-logback-in-a-web-app-fast](https://wiki.base22.com/btg/how-to-setup-slf4j-and-logback-in-a-web-app-fast-35488048.html)

[logback 语法](https://logback.qos.ch/manual/index.html)

* any list
{:toc}