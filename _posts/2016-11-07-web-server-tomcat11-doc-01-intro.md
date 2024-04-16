---
layout: post
title: web server apache tomcat11-01-官方文档入门介绍
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

[web server apache tomcat11-15-proxy](https://houbb.github.io/2016/11/07/web-server-tomcat11-doc-15-proxy)

[web server apache tomcat11-16-mbean](https://houbb.github.io/2016/11/07/web-server-tomcat11-doc-16-mbean)

[web server apache tomcat11-17-default-servlet](https://houbb.github.io/2016/11/07/web-server-tomcat11-doc-17-default-servlet)

[web server apache tomcat11-18-clusting 集群](https://houbb.github.io/2016/11/07/web-server-tomcat11-doc-18-clusting)

[web server apache tomcat11-19-load balance 负载均衡](https://houbb.github.io/2016/11/07/web-server-tomcat11-doc-19-load-balance)

[web server apache tomcat11-20-connectors 连接器](https://houbb.github.io/2016/11/07/web-server-tomcat11-doc-20-connectors)

[web server apache tomcat11-21-monitor and management 监控与管理](https://houbb.github.io/2016/11/07/web-server-tomcat11-doc-21-monitor)

[web server apache tomcat11-22-logging 日志](https://houbb.github.io/2016/11/07/web-server-tomcat11-doc-22-logging)

[web server apache tomcat11-23-APR](https://houbb.github.io/2016/11/07/web-server-tomcat11-doc-23-apr)

[web server apache tomcat11-24-Virtual Hosting and Tomcat](https://houbb.github.io/2016/11/07/web-server-tomcat11-doc-24-virtual-host)

[web server apache tomcat11-25-Advanced IO and Tomcat](https://houbb.github.io/2016/11/07/web-server-tomcat11-doc-25-aio)

[web server apache tomcat11-26-maven jars](https://houbb.github.io/2016/11/07/web-server-tomcat11-doc-26-maven-jars)

[web server apache tomcat11-27-Security Considerations](https://houbb.github.io/2016/11/07/web-server-tomcat11-doc-27-security)

[web server apache tomcat11-28-Windows Service](https://houbb.github.io/2016/11/07/web-server-tomcat11-doc-28-windows-service)

[web server apache tomcat11-29-Windows Authentication](https://houbb.github.io/2016/11/07/web-server-tomcat11-doc-29-windows-auth)

[web server apache tomcat11-30-The Tomcat JDBC Connection Pool](https://houbb.github.io/2016/11/07/web-server-tomcat11-doc-30-tomcat-jdbc-pool)

[web server apache tomcat11-31-websocket](https://houbb.github.io/2016/11/07/web-server-tomcat11-doc-31-websocket)

[web server apache tomcat11-32-rewrite](https://houbb.github.io/2016/11/07/web-server-tomcat11-doc-32-rewrite)

[web server apache tomcat11-33-CDI](https://houbb.github.io/2016/11/07/web-server-tomcat11-doc-33-cdi)

[web server apache tomcat11-34-Ahead of Time compilation support](https://houbb.github.io/2016/11/07/web-server-tomcat11-doc-34-aot)

# 简介

对于管理员和 Web 开发人员来说，在开始之前，有一些重要的信息您应该熟悉。本文档作为对 Tomcat 容器背后一些概念和术语的简要介绍，以及在需要帮助时应该去哪里的指南。

## 术语

在阅读这些文档的过程中，您会遇到许多术语；一些是特定于 Tomcat 的，而另一些是由 Servlet 和 JSP 规范定义的。

- 上下文（Context）- 简而言之，上下文是一个 Web 应用程序。

如果您发现需要添加更多术语到此部分，请告诉我们。

## 目录和文件

以下是一些关键的 Tomcat 目录：

- /bin - 启动、关闭和其他脚本。*.sh 文件（对于 Unix 系统）是 *.bat 文件（对于 Windows 系统）的功能副本。由于 Win32 命令行缺少某些功能，因此这里有一些额外的文件。
- /conf - 配置文件和相关的 DTD。这里最重要的文件是 server.xml。这是容器的主要配置文件。
- /logs - 默认情况下存放日志文件。
- /webapps - 这是您的 Web 应用程序的位置。

## CATALINA_HOME 和 CATALINA_BASE

在文档中，有两个属性的引用：

- CATALINA_HOME：代表您的 Tomcat 安装的根目录，例如 /home/tomcat/apache-tomcat-11.0.0 或 C:\Program Files\apache-tomcat-11.0.0。
- CATALINA_BASE：代表特定 Tomcat 实例的运行时配置的根目录。如果您想在一台机器上运行多个 Tomcat 实例，请使用 CATALINA_BASE 属性。

如果您将这两个属性设置为不同的位置，那么 CATALINA_HOME 位置包含静态资源，例如 .jar 文件或二进制文件。CATALINA_BASE 位置包含配置文件、日志文件、部署的应用程序以及其他运行时要求。

## 为什么使用 CATALINA_BASE

默认情况下，CATALINA_HOME 和 CATALINA_BASE 指向同一个目录。当您需要在一台机器上运行多个 Tomcat 实例时，手动设置 CATALINA_BASE。这样做有以下好处：

- 更容易管理升级到较新版本的 Tomcat。因为所有具有单个 CATALINA_HOME 位置的实例共享一组 .jar 文件和二进制文件，您可以轻松地将文件升级到较新版本，并将更改传播到使用相同 CATALIA_HOME 目录的所有 Tomcat 实例。
- 避免重复使用相同的静态 .jar 文件。
- 可以共享某些设置，例如 setenv shell 或 bat 脚本文件（取决于您的操作系统）。

## CATALINA_BASE 的内容

在开始使用 CATALINA_BASE 之前，请先考虑并创建 CATALINA_BASE 使用的目录树。请注意，如果您没有创建所有推荐的目录，Tomcat 将自动创建这些目录。如果它无法创建所需的目录，例如由于权限问题，Tomcat 将无法启动，或者可能无法正常工作。

考虑以下目录列表：

- 包含 setenv.sh、setenv.bat 和 tomcat-juli.jar 文件的 bin 目录。
  - 推荐：否。
  - 查找顺序：首先检查 CATALINA_BASE；然后回退到 CATALINA_HOME。
- 包含要添加到类路径的其他资源的 lib 目录。
  - 推荐：是，如果您的应用程序依赖于外部库。
  - 查找顺序：首先检查 CATALINA_BASE；其次加载 CATALINA_HOME。
- 用于特定实例日志文件的 logs 目录。
  - 推荐：是。
- 用于自动加载的 Web 应用程序的 webapps 目录。
  - 推荐：是，如果您要部署应用程序。
  - 查找顺序：仅检查 CATALINA_BASE。
- 包含已部署的 Web 应用程序的临时工作目录的 work 目录。
  - 推荐：是。
- JVM 用于临时文件的 temp 目录。
  - 推荐：是。

我们建议您不要更改 tomcat-juli.jar 文件。但是，如果您需要自己的日志记录实现，可以将 tomcat-juli.jar 文件替换为特定 Tomcat 实例的 CATALINA_BASE 位置。

我们还建议您将所有配置文件从 CATALINA_HOME/conf 目录复制到 CATALINA_BASE/conf/ 目录。如果在 CATALINA_BASE 中缺少配置文件，将不会回退到 CATALINA_HOME。因此，这可能会导致失败。

至少，CATALINA_BASE 必须包含：

- conf/server.xml
- conf/web.xml
  - 包括 conf 目录。否则，Tomcat 将无法启动，或无法正常工作。

有关高级配置信息，请参阅 RUNNING.txt 文件。

## 如何使用 CATALINA_BASE

CATALINA_BASE 属性是一个环境变量。您可以在执行 Tomcat 启动脚本之前设置它，例如：

- 在 Unix 上：CATALINA_BASE=/tmp/tomcat_base1 bin/catalina.sh start
- 在 Windows 上：CATALINA_BASE=C:\tomcat_base1 bin/catalina.bat start

## 配置 Tomcat

本节将向您介绍在配置容器期间使用的基本信息。

所有配置文件中的信息都在启动时读取，这意味着对文件的任何更改都需要重新启动容器。

## 寻求帮助

虽然我们已尽力确保这些文档写得清晰易懂，但我们可能会漏

掉一些内容。以下是一些网站和邮件列表，以防您遇到困难。

请注意，一些问题和解决方案在不同版本的 Tomcat 之间可能会有所不同。

在网络上搜索时，会有一些文档与 Tomcat 11 无关，而仅与早期版本有关。

- [当前文档](current_document_link) - 大多数文档将列出潜在的问题。请务必彻底阅读相关文档，这将节省您大量的时间和精力。没有什么比搜索网络更好的了，只是发现答案一直在您眼前！
- [Tomcat FAQ](tomcat_faq_link)
- [Tomcat Wiki](tomcat_wiki_link)
- [jGuru 的 Tomcat FAQ](jguru_tomcat_faq_link)
- [Tomcat 邮件列表档案](tomcat_mailing_list_archives_link) - 许多网站存档了 Tomcat 邮件列表。由于链接随时间而变化，请点击此处搜索 Google。
- [TOMCAT-USER 邮件列表](tomcat_user_mailing_list_link) - 您可以在此订阅。如果您没有收到回复，那么您的问题可能已在列表存档或常见问题解答中得到了解答。尽管有时会提出并回答一般的 Web 应用程序开发问题，但请将您的问题重点放在 Tomcat 特定问题上。
- [TOMCAT-DEV 邮件列表](tomcat_dev_mailing_list_link) - 您可以在此订阅。此列表专用于讨论 Tomcat 本身的开发。有关 Tomcat 配置以及开发和运行应用程序时遇到的问题，通常更适合在 TOMCAT-USER 列表上讨论。

如果您认为文档中应该包含某些内容，请务必在 TOMCAT-DEV 列表上让我们知道。

# 参考资料

https://tomcat.apache.org/tomcat-11.0-doc/introduction.html

* any list
{:toc}