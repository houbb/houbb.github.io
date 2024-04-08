---
layout: post 
title: tomcat11 官方文档-01-apache tomcat 入门介绍 + Apache Taglibs
date:  2016-11-7 17:13:40 +0800
categories: [Web]
tags: [tomcat, server, web]
published: true
---

# 拓展阅读

[Netty 权威指南-01-BIO 案例](https://houbb.github.io/2019/05/10/netty-definitive-gudie-01-bio)

[Netty 权威指南-02-NIO 案例](https://houbb.github.io/2019/05/10/netty-definitive-gudie-02-nio)

[Netty 权威指南-03-AIO 案例](https://houbb.github.io/2019/05/10/netty-definitive-gudie-03-aio)

[Netty 权威指南-04-为什么选择 Netty？Netty 入门教程](https://houbb.github.io/2019/05/10/netty-definitive-gudie-04-why-netty)

# 前言

针对 tomcat 11 的文档简单翻译。

目前网上的翻译信息都比较老。

文档版本：Version 11.0.0-M18, Mar 9 2024

# Apache Tomcat®

Apache Tomcat® 软件是 Jakarta Servlet、Jakarta Server Pages、Jakarta Expression Language、Jakarta WebSocket、Jakarta Annotations 和 Jakarta Authentication 规范的开源实现。这些规范是 Jakarta EE 平台的一部分。

Jakarta EE 平台是 Java EE 平台的演进。Tomcat 10 及更高版本实现了作为 Jakarta EE 一部分开发的规范。

Tomcat 9 及更早版本实现了作为 Java EE 一部分开发的规范。

Apache Tomcat 软件是在开放和参与式环境中开发的，并在 Apache 许可证第 2 版下发布。

Apache Tomcat 项目旨在成为来自世界各地最优秀开发者的合作。我们邀请您参与此开放式开发项目。要了解更多参与信息，请点击此处。

Apache Tomcat 软件驱动着各种行业和组织中的大型、关键性网络应用。这些用户及其故事列在 PoweredBy 维基页面上。

Apache Tomcat、Tomcat、Apache、Apache 羽毛标志和 Apache Tomcat 项目标志是 Apache 软件基金会的商标。

2024-03-25 发布了 Tomcat 10.1.20

Apache Tomcat 项目自豪地宣布发布 Apache Tomcat 10.1.20 版本。此版本实现了 Jakarta EE 10 平台的规范。

在 Tomcat 9 及更早版本上运行的应用程序将无法在 Tomcat 10 上运行，需要进行更改。为 Tomcat 9 及更早版本设计的基于 Java EE 的应用程序可以放置在 $CATALINA_BASE/webapps-javaee 目录中，Tomcat 将自动将其转换为 Jakarta EE 并复制到 webapps 目录中。使用 Apache Tomcat 迁移工具 for Jakarta EE 工具执行此转换，该工具也可作为单独的离线下载提供。

此版本中的显著变化包括：

- 修复重新加载 TLS 配置和文件时的回归。

- 在成功的 FORM 身份验证后恢复保存的 POST 请求时，请确保恢复请求正文时不会损坏 URI、查询字符串或协议。

- 对 Writer 和 OutputStream 进行错误处理对齐。确保一旦响应被回收使用就会触发 NullPointerException，前提是 discardFacades 配置为默认值 true。


有关这些更改的详细信息以及所有其他更改，请参阅 Tomcat 10.1 更新日志。

下载

2024-03-25 发布了 Tomcat 8.5.100

Apache Tomcat 项目自豪地宣布发布 Apache Tomcat 8.5.100 版本。此版本实现了 Java EE 7 平台的规范。与 8.5.99 相比，显著变化包括：

- 修复重新加载 TLS 配置和文件时的回归。

- 在成功的 FORM 身份验证后恢复保存的 POST 请求时，请确保恢复请求正文时不会损坏 URI、查询字符串或协议。

- 对 Writer 和 OutputStream 进行错误处理对齐。确保一旦响应被回收使用就会触发 NullPointerException，前提是 discardFacades 配置为默认值 true。

有关这些更改的详细信息以及所有其他更改，请参阅 Tomcat 8 更新日志。

请注意，Apache Tomcat 8.5.x 将于 2024 年 3 月 31 日到达终止生命周期 (EOL)。Apache Tomcat 8.5.100 很可能是 Apache Tomcat 8.5 的最后一个版本。

下载

2024-03-14 发布了 Tomcat 9.0.87
Apache Tomcat 项目自豪地宣布发布 Apache Tomcat 9.0.87 版本。此版本实现了 Java EE 8 平台的规范。与 9.0.86 相比，显著变化包括：

- 在成功的 FORM 身份验证后恢复保存的 POST 请求时，请确保恢复请求正文时不会损坏 URI、查询字符串或协议。

- 对 Writer 和 OutputStream 进行错误处理对齐。确保一旦响应被回收使用就会触发 NullPointerException，前提是 discardFacades 配置为默认值 true。

- 现在，使用 Executor 元素配置的标准线程池实现现在实现了 ExecutorService，以更好地支持 NIO2 或其他功能。

有关这些更改的详细信息以及所有其他更改，请参阅 Tomcat 9 更新日志。

下载

2024-03-14 发布了 Tomcat 11.0.0-M18

Apache Tomcat 项目自豪地宣布发布 Apache Tomcat 11.0.0-M18 (alpha) 版本。此版本是一个里程碑版本，面向 Jakarta EE 11。

Tomcat 10 及更高版本的用户应注意，由于将 Java EE 从 Oracle 转移到 Eclipse Foundation 的过程中，从 Java EE 到 Jakarta EE 的移动导致所有实现的 API 的主要包已从 javax.* 更改为 jakarta.*。这几乎肯定需要代码更改，以使应用程序从 Tomcat 9 及更早版本迁移到 Tomcat 10 及更高版本。可用迁移工具来帮助此过程。

此版本中的显著变化包括：

- 将最低 Java 版本降低到 Java 17

- 在成功的 FORM 身份验证后恢复保存的 POST 请求时，请确保恢复请求正文时不会损坏 URI、查询字符串或协议。

- 对 Writer 和 OutputStream 进行错误处理对齐。确保一旦响应被回收使用就会触发 NullPointerException，前提是 discardFacades 配置为默认值 true。

有关这些更改的详细信息以及所有其他更改，请参阅 Tomcat 11 (alpha) 更新日志。

下载

2024-02-12 发布了 Tomcat Native 1.3.0
Apache Tomcat 项目自豪地宣布发布 Tomcat Native 1.3.0 版本。这是 1.3.x 分支的第一个版本。与 1.2.x 相比，显著变化包括：

- 支持的最低 OpenSSL 版本为 1.1.1

- 支持的最低 APR 版本为 1.6.3

- 此版本中的 Windows 二进制文件已使用 OpenSSL 3.0.13 构建


下载 | 1.3.0 更新日志

2024-02-08 发布了 Tomcat Native 2.0.7
Apache Tomcat 项目自豪地宣布发布 Tomcat Native 2.0.7 版本。与 2.0.6 相比，显著变化包括：

将 Windows 上默认的密码提示与 httpd 对齐
此版本中的 Windows 二进制文件已使用 OpenSSL 3.0.13 构建
下载 | 2.0.5 更新日志

2024-02-06 发布了 Jakarta EE 迁移工具 1.0.8
Apache Tomcat 项目自豪地宣布发布 Jakarta EE 迁移工具 1.0.8 版本。与版本 1.0.7 相比，此版本包含了许多 bug 修复和改进。

此版本中的显著变化包括：

将 .ear 文件识别为归档文件
在转换过程中包括 .jspf 和 .tagf 文件
更新依赖项
有关这些更改的详细信息以及所有其他更改，请参阅更新日志。

下载

2023-10-03 发布了 Tomcat Native 1.2.39
Apache Tomcat 项目自豪地宣布发布 Tomcat Native 1.2.39 版本。与 1.2.38 相比，显著变化包括：

如果使用了不安全的 optionalNoCA 证书验证选项，则禁用 OCSP
此版本中的 Windows 二进制文件已使用 OpenSSL 3.0.11 构建
下载 | 1.2.39 更新日志

2023-09-12 发布了 Tomcat Connectors 1.2.49
Apache Tomcat 项目自豪地宣布发布 Apache Tomcat Connectors 1.2.49 版本。此版本修复了先前版本中发现的一些错误。

下载 | 1.2.49 更新日志

2015-03-17 发布了 Apache Standard Taglib 1.2.5
Apache Tomcat 项目自豪地宣布发布 Standard Taglib 1.2.5 版本。此标签库提供了 JSTL 1.2 规范的 Apache 实现。

1.2.5 版本是一个次要的错误修复版本，回滚了 1.2.1 中的一个更改，其中 `<c:import>` 在 POST 操作期间修改了 HTTP 方法，并且修复了一个在启动时导致 AccessControlException 的问题，除非授予了读取 accessExternalEntity 属性的权限。

请参阅标签库部分以获取更多详细信息。

下载 | 更改

2013-11-11 发布了 Tomcat Maven 插件 2.2
Apache Tomcat 团队很高兴地宣布发布 Tomcat Maven 插件 2.2 版本。更新日志在这里可用。

Apache Tomcat Maven 插件提供了在 Apache Tomcat Servlet 容器中操作 WAR 项目的目标。

二进制文件可从 Maven 存储库中获取。您应在项目的插件配置中指定版本：

```xml
<plugin>
  <groupId>org.apache.tomcat.maven</groupId>
  <artifactId>tomcat7-maven-plugin</artifactId>
  <version>2.2</version>
</plugin>
```

或

```xml
<plugin>
  <groupId>org.apache.tomcat.maven</groupId>
  <artifactId>tomcat6-maven-plugin</artifactId>
  <version>2.2</version>
</plugin>
```

旧消息
查看以前的公告。


# Apache Taglibs

Apache Taglibs 提供了用于 Java 服务器页面 (JSP) 的标签库的开源实现。

特别是，它托管了 Apache Standard Taglib，这是 Java 标准标签库 (JSTL) 规范的开源实现。

Apache Standard Taglib
Apache Standard Taglib 实现了 JSTL 1.2，并支持由 JSP 容器评估的请求时间表达式。

此外，可以通过以下两种方式之一启用对使用 1.0 表达式语言标签的应用程序的兼容性：

使用 -jstlel jar 通过使用 JSTL 本身最初定义的 EL 实现来支持 JSTL 1.0 EL 表达式。

使用 -compat jar 通过使用容器的 EL 实现来支持 JSTL 1.0 EL 表达式，以利用更新版本中的新功能和潜在的性能改进。
下载 | 变更

有关使用该库的更详细信息，请参阅 README 文件。

出于性能原因，XML 标签直接使用 Apache Xalan 来评估 XPath 表达式。Xalan 2.7.1 实现 jars xalan.jar 和 serializer.jar 必须添加到类路径中。

标准标签库 jars 可以与 web 应用程序一起打包在其 /WEB-INF/lib 目录中，或者通过将它们添加到容器的类路径中，可以使它们对所有应用程序可用。

## Jakarta Taglibs

Apache Taglibs 最初作为 Apache Jakarta 项目的一部分开发。该项目已正式退役，原始标签库已移至 Apache Attic。

# Maven 插件

Apache Tomcat Maven 插件提供了在 Apache Tomcat® Servlet 容器中操作 WAR 项目的目标。

您可以通过 Apache Maven 运行您的 War Apache Maven 项目，而无需将 WAR 文件部署到 Apache Tomcat 实例中。

更多详细信息可在 Maven 生成的网站中找到：

## 主干文档（正在开发中）

版本 2.2（发布版本：2013-11-11）
版本 2.1（发布版本：2013-02-25）
版本 2.0（发布版本：2012-09-14）
版本 2.0-beta-1（发布版本：2012-02-01）

## 源代码

源代码位于以下 git 存储库中：https://gitbox.apache.org/repos/asf/tomcat-maven-plugin.git，也在以下位置进行了镜像：https://github.com/apache/tomcat-maven-plugin。

## Bug 跟踪

要使用的 Bug 跟踪器是 ASF Jira 实例：https://bz.apache.org/jira/browse/MTOMCAT

# 开源地址

https://github.com/houbb/minicat

# 参考资料

https://tomcat.apache.org/

* any list
{:toc}