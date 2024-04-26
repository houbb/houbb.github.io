---
layout: post
title: web server apache tomcat11-22-logging 日志
date:  2016-11-7 17:13:40 +0800
categories: [Web]
tags: [tomcat, server, web]
published: true
---

# 前言

整理这个官方翻译的系列，原因是网上大部分的 tomcat 版本比较旧，此版本为 v11 最新的版本。

## 开源项目

> 从零手写实现 tomcat [minicat](https://github.com/houbb/minicat) 别称【嗅虎】心有猛虎，轻嗅蔷薇。

## 系列文章

[web server apache tomcat11-01-官方文档入门介绍](https://houbb.github.io/2016/11/07/web-server-tomcat11-doc-01-intro)

[web server apache tomcat11-02-setup 启动](https://houbb.github.io/2016/11/07/web-server-tomcat11-doc-02-setup)

[web server apache tomcat11-03-deploy 如何部署](https://houbb.github.io/2016/11/07/web-server-tomcat11-doc-03-deploy)

[web server apache tomcat11-04-manager 如何管理？](https://houbb.github.io/2016/11/07/web-server-tomcat11-doc-04-manager)

[web server apache tomcat11-06-Host Manager App -- Text Interface](https://houbb.github.io/2016/11/07/web-server-tomcat11-doc-06-host-manager)

[web server apache tomcat11-07-Realm Configuration](https://houbb.github.io/2016/11/07/web-server-tomcat11-doc-07-relam)

[web server apache tomcat11-08-JNDI Resources](https://houbb.github.io/2016/11/07/web-server-tomcat11-doc-08-jndi)

[web server apache tomcat11-09-JNDI Datasource](https://houbb.github.io/2016/11/07/web-server-tomcat11-doc-09-jdbc-datasource)

[web server apache tomcat11-10-Class Loader](https://houbb.github.io/2016/11/07/web-server-tomcat11-doc-10-classloader-howto)

[web server apache tomcat11-11-Jasper 2 JSP Engine](https://houbb.github.io/2016/11/07/web-server-tomcat11-doc-11-jsps)

[web server apache tomcat11-12-SSL/TLS Configuration](https://houbb.github.io/2016/11/07/web-server-tomcat11-doc-12-ssl)

[web server apache tomcat11-13-SSI](https://houbb.github.io/2016/11/07/web-server-tomcat11-doc-13-ssi)

[web server apache tomcat11-14-CGI](https://houbb.github.io/2016/11/07/web-server-tomcat11-doc-14-cgi)

...

### 简介

Apache Tomcat 的内部日志记录使用了 JULI，这是 Apache Commons Logging 的打包重命名分支，被硬编码为使用 java.util.logging 框架。这确保了 Tomcat 的内部日志记录和任何 Web 应用程序日志记录保持独立，即使一个 Web 应用程序使用了 Apache Commons Logging。

要配置 Tomcat 使用替代的日志记录框架进行内部日志记录，请按照替代日志记录框架提供的指令，重定向使用 java.util.logging 的应用程序的日志记录。请注意，替代的日志记录框架需要能够在存在不同类加载器中具有相同名称的不同记录器的环境中工作。

在 Apache Tomcat 上运行的 Web 应用程序可以：

- 使用任何其选择的日志记录框架。
- 使用系统日志记录 API，java.util.logging。
- 使用由 Java Servlets 规范提供的日志记录 API，jakarta.servlet.ServletContext.log(...)

不同 Web 应用程序使用的日志记录框架是独立的。有关更多详情，请参阅类加载。唯一的例外是 java.util.logging。如果您的日志记录库直接或间接地使用了它，那么它的某些元素将在 Web 应用程序之间共享，因为它是由系统类加载器加载的。

### Java 日志记录 API — java.util.logging

Apache Tomcat 具有 java.util.logging API 的几个关键元素的自己的实现。这个实现被称为 JULI。其中的关键组件是一个自定义的 LogManager 实现，它了解正在 Tomcat 上运行的不同 Web 应用程序（及其不同的类加载器）。它支持每个应用程序私有的日志记录配置。它还在 Web 应用程序从内存中卸载时受到 Tomcat 的通知，以便清除对其类的引用，防止内存泄漏。

当启动 Java 时，通过提供特定的系统属性来启用此 java.util.logging 实现。Apache Tomcat 的启动脚本会为您执行此操作，但如果您使用不同的工具来运行 Tomcat（如 jsvc，或在 IDE 中运行 Tomcat），则应自行处理它们。

有关 java.util.logging 的更多详细信息可在 JDK 的文档和其 java.util.logging 包的 Javadoc 页面中找到。

### Servlets 日志记录 API

对 jakarta.servlet.ServletContext.log(...) 的调用来写日志消息是由内部的 Tomcat 日志记录处理的。这样的消息被记录到名为

```
org.apache.catalina.core.ContainerBase.[${engine}].[${host}].[${context}]
```

的类别中。此日志记录根据 Tomcat 日志记录配置执行。您无法在 Web 应用程序中覆盖它。

Servlets 日志记录 API 早于现在由 Java 提供的 java.util.logging API。因此，它并不提供太多选项。例如，您无法控制日志级别。不过，可以注意到，在 Apache Tomcat 实现中，对 ServletContext.log(String) 或 GenericServlet.log(String) 的调用是以 INFO 级别记录的。对 ServletContext.log(String, Throwable) 或 GenericServlet.log(String, Throwable) 的调用是以 SEVERE 级别记录的。

### 控制台

在 Unix 上运行 Tomcat 时，控制台输出通常会重定向到名为 catalina.out 的文件中。该名称可使用环境变量进行配置。（参见启动脚本）。所有写入到 System.err/out 的内容都将被捕获到该文件中。这可能包括：

- 由 java.lang.ThreadGroup.uncaughtException(...) 打印的未捕获异常
- 如果通过系统信号请求了线程转储，则线程转储

在 Windows 上作为服务运行时，控制台输出也会被捕获和重定向，但文件名不同。

Apache Tomcat 中的默认日志记录配置将相同的

消息写入控制台和日志文件。这在开发时使用 Tomcat 时非常方便，但在生产环境中通常是不需要的。

仍在使用 System.out 或 System.err 的旧应用程序可以通过在 Context 上设置 swallowOutput 属性来欺骗。如果将属性设置为 true，则在请求处理过程中对 System.out/err 的调用将被拦截，并将其输出通过 jakarta.servlet.ServletContext.log(...) 调用馈送到日志子系统中。
请注意，swallowOutput 功能实际上是一个技巧，它有其局限性。它仅适用于对 System.out/err 的直接调用，并且仅在请求处理周期中起作用。它可能无法拦截由应用程序创建的其他线程中的日志记录框架。它不能用于拦截那些自己写入系统流的日志记录框架，因为它们早在重定向发生之前就开始，并且可能直接获得对流的引用。

### 访问日志记录

访问日志记录是一个相关但不同的功能，它作为一个阀门实现。它使用自包含的逻辑来写入其日志文件。访问日志记录的基本要求是处理大量连续数据而不增加太多开销，因此它仅使用 Apache Commons Logging 用于自身的调试消息。这种实现方法避免了额外的开销和潜在的复杂配置。有关其配置的更多详细信息，请参阅阀门文档，其中包括各种报告格式。

### 使用 java.util.logging（默认）

JDK 提供的 java.util.logging 的默认实现过于受限，以至于无法使用。关键限制是无法实现每个 Web 应用程序的日志记录，因为配置是基于 VM 的。因此，在默认配置下，Tomcat 将替换默认的 LogManager 实现为一个容器友好型的实现，称为 JULI，它解决了这些缺陷。

JULI 支持与标准 JDK java.util.logging 相同的配置机制，使用编程方法或属性文件。主要区别在于可以设置每个类加载器属性文件（这样就可以轻松地重新部署友好的 Web 应用程序配置），并且属性文件支持扩展结构，允许更自由地定义处理程序并将其分配给记录器。

JULI 默认启用，并支持每个类加载器配置，除了常规的全局 java.util.logging 配置之外。这意味着日志记录可以在以下层次进行配置：

- 全局配置。通常在 ${catalina.base}/conf/logging.properties 文件中完成。该文件由 java.util.logging.config.file 系统属性指定，该属性由启动脚本设置。如果该文件不可读或未配置，则默认使用 JRE 中的 ${java.home}/lib/logging.properties 文件。
- 在 Web 应用程序中。该文件将是 WEB-INF/classes/logging.properties

JRE 中的默认 logging.properties 指定了一个 ConsoleHandler，将日志路由到 System.err。Apache Tomcat 中默认的 conf/logging.properties 还添加了几个 AsyncFileHandler，用于写入文件。

处理程序的日志级别阈值默认为 INFO，可以使用 SEVERE、WARNING、INFO、CONFIG、FINE、FINER、FINEST 或 ALL 进行设置。您还可以针对特定的包来收集日志，并指定一个级别。

要为 Tomcat 的部分内部启用调试日志记录，应同时配置适当的记录器和适当的处理程序，以使用 FINEST 或 ALL 级别。例如：

```
org.apache.catalina.session.level=ALL
java.util.logging.ConsoleHandler.level=ALL
```

在启用调试日志记录时，建议将其限制在可能的最窄范围内，因为调试日志记录可能会产生大量信息。

JULI 使用的配置与纯 java.util.logging 支持的配置

相同，但使用了一些扩展，以便更好地灵活地配置记录器和处理程序。主要的区别包括：

- 可以向处理程序名称添加前缀，以便可以实例化单个类的多个处理程序。前缀是一个以数字开头、以 '.' 结尾的字符串。例如，22foobar. 是一个有效的前缀。
- 对于包含 ${systemPropertyName} 的属性值，将执行系统属性替换。
- 如果使用实现了 org.apache.juli.WebappProperties 接口的类加载器（Tomcat 的 Web 应用程序类加载器会这样做），则还会对 ${classloader.webappName}、${classloader.hostName} 和 ${classloader.serviceName} 进行属性替换，分别替换为 Web 应用程序名称、主机名和服务名称。
- 默认情况下，如果日志记录器具有关联处理程序，则日志记录器将不委托给其父级。可以使用 loggerName.useParentHandlers 属性更改每个记录器的此行为，该属性接受布尔值。
- 根记录器可以使用 .handlers 属性定义其处理程序集。
- 默认情况下，日志文件将在文件系统上保留 90 天。可以使用 handlerName.maxDays 属性为每个处理程序更改此设置。如果属性的指定值 ≤0，则日志文件将永远保留在文件系统上，否则它们将保留指定的最大天数。
- 还有一些其他的实现类，可以与 Java 提供的实现类一起使用。值得注意的是 org.apache.juli.FileHandler 和 org.apache.juli.AsyncFileHandler。

org.apache.juli.FileHandler 支持日志的缓冲。默认情况下，不启用缓冲。要配置它，请使用处理程序的 bufferSize 属性。值为 0 使用系统默认缓冲（通常将使用 8K 缓冲）。值 <0 强制在每次日志写入时刷新写入器。值 >0 使用具有定义值的 BufferedOutputStream，但请注意还会应用系统默认缓冲。

org.apache.juli.AsyncFileHandler 是 FileHandler 的子类，它将日志消息排队并异步写入日志文件。可以通过设置一些系统属性来配置其附加行为。

示例 logging.properties 文件，放置在 $CATALINA_BASE/conf 中：

```
handlers = 1catalina.org.apache.juli.FileHandler, \
           2localhost.org.apache.juli.FileHandler, \
           3manager.org.apache.juli.FileHandler, \
           java.util.logging.ConsoleHandler

.handlers = 1catalina.org.apache.juli.FileHandler, java.util.logging.ConsoleHandler

############################################################
# Handler specific properties.
# Describes specific configuration info for Handlers.
############################################################

1catalina.org.apache.juli.FileHandler.level = FINE
1catalina.org.apache.juli.FileHandler.directory = ${catalina.base}/logs
1catalina.org.apache.juli.FileHandler.prefix = catalina.
1catalina.org.apache.juli.FileHandler.maxDays = 90
1catalina.org.apache.juli.FileHandler.encoding = UTF-8

2localhost.org.apache.juli.FileHandler.level = FINE
2localhost.org.apache.juli.FileHandler.directory = ${catalina.base}/logs
2localhost.org.apache.juli.FileHandler.prefix = localhost.
2localhost.org.apache.juli.FileHandler.maxDays = 90
2localhost.org.apache.juli.FileHandler.encoding = UTF-8

3manager.org.apache.juli.FileHandler.level = FINE
3manager.org.apache.juli.FileHandler.directory = ${catalina.base}/logs
3manager.org.apache.juli.FileHandler.prefix = manager.
3manager.org.apache.juli.FileHandler.bufferSize = 16384
3manager.org.apache.juli.FileHandler.maxDays = 90
3manager.org.apache.juli.FileHandler.encoding = UTF-8

java.util.logging.ConsoleHandler.level = FINE
java.util.logging.ConsoleHandler.formatter = java.util.logging.OneLineFormatter
java.util.logging.ConsoleHandler.encoding = UTF-8

############################################################
# Facility specific properties.
# Provides extra control for each logger.
############################################################

org.apache.catalina.core.ContainerBase.[Catalina].[localhost].level = INFO
org.apache.catalina.core.ContainerBase.[Catalina].[localhost].handlers = \
   2localhost.org.apache.juli.FileHandler

org.apache.catalina.core.ContainerBase.[Catalina].[localhost].[/manager].level = INFO
org.apache.catalina.core.ContainerBase.[Catalina].[localhost].[/manager].handlers = \
   3manager.org.apache.juli.FileHandler

# For example, set the org.apache.catalina.util.LifecycleBase logger to log
# each component that extends LifecycleBase changing state:
#org.apache.catalina.util.LifecycleBase.level = FINE
```

Example logging.properties for the servlet-examples web application to be placed in WEB-INF/classes inside the web application:

```
handlers = org.apache.juli.FileHandler, java.util.logging.ConsoleHandler

############################################################
# Handler specific properties.
# Describes specific configuration info for Handlers.
############################################################

org.apache.juli.FileHandler.level = FINE
org.apache.juli.FileHandler.directory = ${catalina.base}/logs
org.apache.juli.FileHandler.prefix = ${classloader.webappName}.

java.util.logging.ConsoleHandler.level = FINE
java.util.logging.ConsoleHandler.formatter = java.util.logging.OneLineFormatter
```

# 文档参考

请查阅以下资源获取更多信息：

Apache Tomcat 的 org.apache.juli 包的 Javadoc。

Oracle Java 11 的 java.util.logging 包的 Javadoc。

## 生产使用考虑事项

您可能需要注意以下事项：

考虑从配置中移除 ConsoleHandler。默认情况下（通过 .handlers 设置），日志会同时发送到 FileHandler 和 ConsoleHandler。后者的输出通常会被捕获到一个文件中，比如 catalina.out。因此，您最终会得到相同消息的两份拷贝。
考虑移除那些您不使用的应用程序的 FileHandlers。例如，host-manager 的一个。
处理程序默认使用系统默认编码来写入日志文件。可以使用 encoding 属性进行配置。请参阅 Javadoc 获取详细信息。
考虑配置访问日志。


# 参考资料

https://tomcat.apache.org/tomcat-11.0-doc/monitoring.html

* any list
{:toc}