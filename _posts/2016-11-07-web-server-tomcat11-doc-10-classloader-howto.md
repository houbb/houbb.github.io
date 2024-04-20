---
layout: post
title: web server apache tomcat11-10-Class Loader How-To
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

...

## 概述

像许多服务器应用程序一样，Tomcat 安装了各种类加载器（即实现 java.lang.ClassLoader 的类），以允许容器的不同部分以及在容器上运行的 Web 应用程序访问不同的类和资源库。

此机制用于提供 Servlet 规范 2.4 版中定义的功能，特别是第 9.4 节和第 9.6 节。

在 Java 环境中，类加载器被安排成父子树。通常，当类加载器被要求加载特定的类或资源时，它首先将请求委托给父类加载器，然后仅在父类加载器无法找到请求的类或资源时才查看自己的存储库。

请注意，Web 应用程序类加载器的模型与此略有不同，如下所述，但主要原则相同。

当启动 Tomcat 时，它创建了一组类加载器，这些类加载器按以下父子关系组织，其中父类加载器位于子类加载器之上：

```
      Bootstrap
          |
       System
          |
       Common
       /     \
  Webapp1   Webapp2 ...
```

每个类加载器的特性，包括它们可见的类和资源的来源，将在以下部分详细讨论。

### 类加载器定义

如上图所示，Tomcat 在初始化时创建以下类加载器：

- **Bootstrap** — 此类加载器包含 Java 虚拟机提供的基本运行时类，以及位于系统扩展目录 ($JAVA_HOME/jre/lib/ext) 中的任何 JAR 文件中的类。注意：一些 JVM 可能将其实现为一个以上的类加载器，或者它可能根本不可见（作为类加载器）。
  
- **System** — 此类加载器通常是从 CLASSPATH 环境变量的内容初始化的。所有这些类对于 Tomcat 内部类和 Web 应用程序都是可见的。但是，标准的 Tomcat 启动脚本 ($CATALINA_HOME/bin/catalina.sh 或 %CATALINA_HOME%\bin\catalina.bat) 完全忽略 CLASSPATH 环境变量本身的内容，并且改为从以下存储库构建 System 类加载器：
    - $CATALINA_HOME/bin/bootstrap.jar — 包含用于初始化 Tomcat 服务器的 main() 方法，以及它依赖的类加载器实现类。
    - $CATALINA_BASE/bin/tomcat-juli.jar 或 $CATALINA_HOME/bin/tomcat-juli.jar — 日志记录实现类。这些包括对 java.util.logging API 的增强类，称为 Tomcat JULI，以及 Tomcat 内部使用的 Apache Commons Logging 库的包重命名副本。有关更多详细信息，请参阅日志记录文档。
    - 如果 $CATALINA_BASE/bin 中存在 tomcat-juli.jar，则会使用它，而不是 $CATALINA_HOME/bin 中的 tomcat-juli.jar。在某些日志记录配置中，这很有用。
    - $CATALINA_HOME/bin/commons-daemon.jar — 来自 Apache Commons Daemon 项目的类。此 JAR 文件不包含在 catalina.bat|.sh 脚本构建的 CLASSPATH 中，但是在 bootstrap.jar 的清单文件中引用了它。
  
- **Common** — 此类加载器包含了对 Tomcat 内部类和所有 Web 应用程序都可见的其他类。
  
  通常情况下，应用程序类不应放在此处。此类加载器搜索的位置由 $CATALINA_BASE/conf/catalina.properties 中的 common.loader 属性定义。默认设置将按照它们列出的顺序搜索以下位置：
    - $CATALINA_BASE/lib 中未打包的类和资源
    - $CATALINA_BASE/lib 中的 JAR 文件
    - $CATALINA_HOME/lib 中未打包的类和资源
    - $CATALINA_HOME/lib 中的 JAR 文件

默认情况下，这包括以下内容：
- annotations-api.jar — Jakarta Annotations 2.1.1 类。
- catalina.jar — Tomcat 的 Catalina servlet 容器部分的实现。
- catalina-ant.jar — 可选。用于与 Manager web 应用程序一起使用的 Tomcat Catalina Ant 任务。
- catalina-ha.jar — 可

选。基于 Tribes 构建的提供会话集群功能的高可用性包。
- catalina-ssi.jar — 可选。服务器端包含模块。
- catalina-storeconfig.jar — 可选。从当前状态生成 XML 配置文件。
- catalina-tribes.jar — 可选。高可用性包使用的组通信包。
- ecj-*.jar — 可选。用于将 JSP 编译为 Servlet 的 Eclipse JDT Java 编译器。
- el-api.jar — 可选。EL 6.0 API。
- jakartaee-migration-*-shaded.jar — 可选。提供将 Web 应用程序从 Java EE 8 转换为 Jakarta EE 9 的功能。
- jasper.jar — 可选。Tomcat Jasper JSP 编译器和运行时。
- jasper-el.jar — 可选。Tomcat EL 实现。
- jaspic-api.jar — Jakarta Authentication 3.0 API。
- jsp-api.jar — 可选。Jakarta Pages 4.0 API。
- servlet-api.jar — Jakarta Servlet 6.1 API。
- tomcat-api.jar — Tomcat 定义的几个接口。
- tomcat-coyote.jar — Tomcat 连接器和实用程序类。
- tomcat-dbcp.jar — 可选。基于 Apache Commons Pool 2 和 Apache Commons DBCP 2 的包重命名副本的数据库连接池实现。
- tomcat-i18n-**.jar — 可选的 JAR，包含其他语言的资源包。由于默认包含了每个单独 JAR 中的默认包，因此如果不需要对消息进行国际化，则可以安全地删除它们。
- tomcat-jdbc.jar — 可选。另一种数据库连接池实现，称为 Tomcat JDBC 池。有关更多详细信息，请参阅文档。
- tomcat-jni.jar — 提供与 Tomcat Native 库的集成。
- tomcat-util.jar — Apache Tomcat 各个组件使用的公共类。
- tomcat-util-scan.jar — 提供 Tomcat 使用的类扫描功能。
- tomcat-websocket.jar — 可选。Jakarta WebSocket 2.1 实现。
- websocket-api.jar — 可选。Jakarta WebSocket 2.1 API。
- websocket-client-api.jar — 可选。Jakarta WebSocket 2.1 客户端 API。

- **WebappX** — 为部署在单个 Tomcat 实例中的每个 Web 应用程序创建一个类加载器。您的 Web 应用程序的 /WEB-INF/classes 目录中的所有未打包的类和资源，以及您的 Web 应用程序的 /WEB-INF/lib 目录下的 JAR 文件中的类和资源，都会对该 Web 应用程序可见，但对其他 Web 应用程序不可见。

如上所述，Web 应用程序类加载器与默认的 Java 委托模型有所不同（根据 Servlet 规范 2.4 第 9.7.2 节 Web 应用程序类加载器的建议）。当处理对 Web 应用程序的 WebappX 类加载器的加载类的请求时，此类加载器首先会查找本地存储库，而不是委托给父级再查找。但也有一些例外。JRE 基本类的一部分无法被覆盖。有一些例外，比如可以使用可升级模块功能覆盖的 XML 解析器组件。最后，对于由 Tomcat 实现的规范（Servlet、JSP、EL、WebSocket），Web 应用程序类加载器始终首先委托。Tomcat 中的所有其他类加载器都遵循通常的委派模式。

因此，从 Web 应用程序的角度来看，类或资源加载按以下顺序查找存储库：

1. JVM 的 Bootstrap 类
2. 您的 Web 应用程序的 /WEB-INF/classes
3. 您的 Web 应用程序的 /WEB-INF/lib/*.jar
4. System 类加载器类（上文描述）
5. Common 类加载器类（上文描述）

如果 Web 应用程序类加载器配置为 `<Loader delegate="true"/>`，则顺序变为：

1. JVM 的 Bootstrap 类
2. System 类加载器类（上文描述）
3. Common 类加载器类（上文描述）
4. 您的 Web 应用程序的 /WEB-INF/classes
5. 您的 Web 应用程序的 /WEB-INF/lib/*.jar


## XML解析器和Java

在旧版本的Tomcat中，您可以简单地替换Tomcat库目录中的XML解析器，以更改所有Web应用程序使用的解析器。然而，在运行现代版本的Java时，这种技术将不会有效，因为通常的类加载器委托过程总是会优先选择JDK内部的实现，而不是这个解析器。

Java支持一种称为可升级模块的机制，允许替换在JCP之外创建的API（即W3C的DOM和SAX）。它还可以用于更新XML解析器的实现。

请注意，覆盖任何JRE组件都存在风险。如果覆盖组件不提供100%兼容的API（例如，Xerces提供的API与JRE提供的XML API不完全兼容），那么Tomcat和/或部署的应用程序可能会遇到错误。

### 高级配置

还可以配置更复杂的类加载器层次结构。请参见下面的图表。默认情况下，服务器和共享类加载器未定义，并且使用上面显示的简化层次结构。可以通过在 conf/catalina.properties 中定义 server.loader 和/或 shared.loader 属性的值来使用此更复杂的层次结构。

```
  Bootstrap
      |
    System
      |
    Common
     /  \
Server  Shared
         /  \
   Webapp1  Webapp2 ...
```

服务器类加载器仅对Tomcat内部可见，对Web应用程序完全不可见。

共享类加载器对所有Web应用程序可见，可用于在所有Web应用程序之间共享代码。但是，对此共享代码的任何更新都将需要重新启动Tomcat。



# 参考资料

https://tomcat.apache.org/tomcat-11.0-doc/class-loader-howto.html

* any list
{:toc}