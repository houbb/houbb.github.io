---
layout: post
title: web server apache tomcat11-03-deploy 如何部署
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

....

# Tomcat Web 应用部署

## 简介

部署是指将 Web 应用程序（无论是第三方 WAR 文件还是自定义的 Web 应用程序）安装到 Tomcat 服务器的过程。

在 Tomcat 服务器内，可以通过多种方式来完成 Web 应用程序的部署。

- 静态部署：在启动 Tomcat 之前设置 Web 应用程序。
- 动态部署：通过直接操作已部署的 Web 应用程序（依赖自动部署功能）或通过使用 Tomcat Manager Web 应用程序来远程部署。

Tomcat Manager 是一个 Web 应用程序，可以以交互方式（通过 HTML GUI）或以编程方式（通过基于 URL 的 API）来部署和管理 Web 应用程序。

有许多依赖于 Manager Web 应用程序的部署方式。

Apache Tomcat 提供了用于 Apache Ant 构建工具的任务。

Apache Tomcat Maven 插件项目提供了与 Apache Maven 的集成。

还有一个称为 Client Deployer 的工具，可以从命令行使用，并提供了额外的功能，例如编译和验证 Web 应用程序，以及将 Web 应用程序打包成 Web 应用资源（WAR）文件。

## 安装

对于静态部署 Web 应用程序，不需要安装，因为 Tomcat 默认提供了此功能。对于使用 Tomcat Manager 的部署功能，虽然需要一些配置（如 Tomcat Manager 手册中详细说明的那样），但不需要安装。但是，如果要使用 Tomcat Client Deployer (TCD)，则需要安装。

TCD 不包含在 Tomcat 核心发行版中，因此必须从下载区域单独下载。下载通常标记为 apache-tomcat-11.0.x-deployer。

TCD 的先决条件是 Apache Ant 1.6.2+ 和 Java 安装。您的环境应定义一个 ANT_HOME 环境值，指向 Ant 安装的根目录，以及一个 JAVA_HOME 值，指向您的 Java 安装。

另外，您应确保 Ant 的 ant 命令和 Java 的 javac 编译器命令可以在您的操作系统提供的命令 shell 中运行。

1. 下载 TCD 分发包。

2. TCD 分发包不需要解压到任何现有的 Tomcat 安装中，它可以解压到任何位置。

3. 阅读《使用 Tomcat Client Deployer》文档。

## 关于 Context

在讨论 Web 应用程序的部署时，需要理解 Context 的概念。Context 是 Tomcat 所称的 Web 应用程序。

为了在 Tomcat 中配置 Context，需要一个 Context 描述符。Context 描述符只是一个包含与 Context 相关的 Tomcat 配置的 XML 文件，例如命名资源或会话管理器配置。在较早版本的 Tomcat 中，Context 描述符配置的内容通常存储在 Tomcat 的主配置文件 server.xml 中，但现在已不鼓励这样做（尽管目前仍然有效）。

Context 描述符不仅帮助 Tomcat 知道如何配置 Context，还帮助其他工具（如 Tomcat Manager 和 TCD）正确执行其功能。

Context 描述符的位置包括：

- `$CATALINA_BASE/conf/[enginename]/[hostname]/[webappname].xml`

- `$CATALINA_BASE/webapps/[webappname]/META-INF/context.xml`

第一种情况的文件命名为 `[webappname].xml`，而第二种情况的文件命名为 context.xml。如果没有为 Context 提供 Context 描述符，Tomcat 将使用默认值配置 Context。

## 在 Tomcat 启动时部署

如果您不想使用 Tomcat Manager 或 TCD，则需要将 Web 应用程序静态部署到 Tomcat，然后启动 Tomcat。您需要将 Web 应用程序部署到称为 appBase 的位置，该位置由 Host 指定。您可以将所谓的“已解压” Web 应用程序（即非压缩的）复制到此位置，也可以将压缩的 Web 应用程序资源 .WAR 文件复制到此位置。

在默认的情况下，位于主机（默认主机为“localhost”）appBase 属性（默认 appBase 为“$CATALINA_BASE/webapps”）指定的位置中存在的 Web 应用程序仅在 Host 的 deployOnStartup 属性为“true”时才会在 Tomcat 启动时部署。

在这种情况下，以下部署顺序将在 Tomcat 启动时发生：

1. 首先部署任何 Context 描述符。

2. 然后部署任何未被任何 Context 描述符引用的已解压的 Web 应用程序。如果它们在 appBase 中有一个关联的 .WAR 文件，并且该文件比已解压的 Web 应用程序更新，则将删除已解压的目录，并重新部署 Web 应用程序。

3. 部署 .WAR 文件。

## 在运行的 Tomcat 服务器上部署

可以将 Web 应用程序部署到运行中的 Tomcat 服务器上。

如果 Host 的 autoDeploy 属性设置为“true”，则 Host 将尝试根据需要动态部署和更新 Web 应用程序，例如

，如果新的 .WAR 放入了 appBase 中。要使此功能正常工作，Host 需要启用后台处理，这是默认配置。

autoDeploy 设置为“true”并且运行中的 Tomcat 允许：

- 将 .WAR 文件复制到 Host 的 appBase 中进行部署。

- 将已解压的 Web 应用程序复制到 Host 的 appBase 中进行部署。

- 如果提供了新的 .WAR 文件，则重新部署已经部署的 Web 应用程序。在这种情况下，将删除已解压的 Web 应用程序，并重新展开 .WAR。请注意，如果 Host 配置为不展开 .WAR（unpackWARs 属性设置为“false”），则不会执行展开操作，此时 Web 应用程序将作为压缩的存档重新部署。

- 如果更新了 /WEB-INF/web.xml 文件（或任何其他定义为 WatchedResource 的资源），则重新加载 Web 应用程序。

- 如果更新了从中部署了 Web 应用程序的 Context 描述符文件，则重新部署 Web 应用程序。

- 如果由 Web 应用程序使用的全局或每个主机的 Context 描述符文件已更新，则重新部署依赖的 Web 应用程序。

- 如果在 `$CATALINA_BASE/conf/[enginename]/[hostname]/` 目录中添加了一个文件（文件名对应于先前部署的 Web 应用程序的 Context 路径），则重新部署 Web 应用程序。

- 如果删除了其文档基址（docBase）的 Web 应用程序，则卸载它。请注意，在 Windows 上，这假定启用了反锁定功能（参见 Context 配置），否则无法删除正在运行的 Web 应用程序的资源。
  
请注意，还可以在加载器中配置 Web 应用程序重新加载，这样加载的类将被跟踪以进行更改。

## 使用 Tomcat Manager 进行部署

Tomcat Manager 在自己的手册页面中进行了详细介绍。

## 使用客户端部署包进行部署

最后，可以使用 Tomcat 客户端部署程序来部署 Web 应用程序。这是一个可以用来验证、编译、压缩为 .WAR，并将 Web 应用程序部署到生产或开发 Tomcat 服务器的包。应该注意，此功能使用 Tomcat Manager，因此目标 Tomcat 服务器应该正在运行。

假设用户熟悉 Apache Ant 以使用 TCD。Apache Ant 是一个脚本化的构建工具。TCD 包含一个预打包的构建脚本。只需要对 Apache Ant 有一些基本的了解（如本页中列出的安装，并熟悉使用操作系统命令 shell 和配置环境变量）。

TCD 包含 Ant 任务，用于 JSP 编译的 Jasper 页面编译器，以及用于验证 Web 应用程序 Context 描述符的任务。验证器任务（类 org.apache.catalina.ant.ValidatorTask）仅允许一个参数：已解压的 Web 应用程序的基本路径。

TCD 使用已解压的 Web 应用程序作为输入（请参阅下面使用的属性列表）。通过 deployer 进行编程部署的 Web 应用程序可以在 /META-INF/context.xml 中包含 Context 描述符。

TCD 包含一个可立即使用的 Ant 脚本，具有以下目标：

- compile（默认）：编译和验证 Web 应用程序。这可以独立使用，不需要运行的 Tomcat 服务器。编译的应用程序仅在关联的 Tomcat X.Y.Z 服务器发布中运行，并不能保证在另一个 Tomcat 发布中工作，因为 Jasper 生成的代码依赖于其运行时组件。还应该注意，此目标还会自动编译位于 /WEB-INF/classes 文件夹中的任何 Java 源文件。
- deploy：将 Web 应用程序（已编译或未编译）部署到 Tomcat 服务器。
- undeploy：卸载 Web 应用程序
- start：启动 Web 应用程序
- reload：重新加载 Web 应用程序
- stop：停止 Web 应用程序

为了配置部署，需要在 TCD 安装目录根目录下创建一个名为 deployer.properties 的文件。在此文件中，每行添加以下名称=值对：

此外，您需要确保为目标 Tomcat Manager（TCD 使用的）设置了用户，否则 TCD 将无法与 Tomcat Manager 进行身份验证，部署将失败。

要执行此操作，请参阅 Tomcat Manager 页面。

# 参考资料

https://tomcat.apache.org/tomcat-11.0-doc/deployer-howto.html

* any list
{:toc}