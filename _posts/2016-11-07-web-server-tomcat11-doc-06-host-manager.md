---
layout: post
title: web server apache tomcat11-06-Host Manager App -- Text Interface
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


## 简介

Tomcat 主机管理器应用程序使您能够在 Tomcat 中创建、删除和管理虚拟主机。本操作指南最好与以下文档一起使用：

- [虚拟主机 How-To](#) 获取有关虚拟主机的更多信息。
- [主机容器](#) 获取有关虚拟主机的底层 XML 配置和属性描述的更多信息。

Tomcat 主机管理器应用程序是 Tomcat 安装的一部分，默认情况下可以使用以下上下文访问：/host-manager。您可以以下列方式使用主机管理器：

- 利用图形用户界面，可通过以下地址访问：{服务器}:{端口}/host-manager/html。
- 利用一组适用于脚本编写的最小 HTTP 请求。您可以在以下地址访问此模式：{服务器}:{端口}/host-manager/text。

这两种方式都可以添加、删除、启动和停止虚拟主机。通过使用 persist 命令可以持久化更改。本文档重点介绍文本界面。有关图形界面的更多信息，请参阅主机管理器应用程序 -- HTML 界面。

## 配置管理器应用程序访问权限

以下描述使用 $CATALINA_HOME 来引用基本的 Tomcat 目录。它是您安装 Tomcat 的目录，例如 C:\tomcat9 或 /usr/share/tomcat9。

主机管理器应用程序需要具有以下角色之一的用户：

- admin-gui - 对于图形 Web 界面使用此角色。
- admin-script - 对于脚本 Web 界面使用此角色。

要启用对主机管理器应用程序文本界面的访问权限，请为您的 Tomcat 用户授予适当的角色，或创建具有正确角色的新用户。例如，打开 ${CATALINA_BASE}/conf/tomcat-users.xml 并输入以下内容：

```xml
<user username="test" password="chang3m3N#w" roles="admin-script"/>
```

无需进行进一步的设置。现在，当您访问 {服务器}:{端口}/host-manager/text/${COMMAND} 时，您可以使用创建的凭据登录。例如：

```bash
$ curl -u ${USERNAME}:${PASSWORD} http://localhost:8080/host-manager/text/list
```

## 命令列表

支持以下命令：

- list
- add
- remove
- start
- stop
- persist

在以下子节中，假设用户名和密码为 test:test。对于您的环境，请使用前面部分创建的凭据。

### List 命令

使用 list 命令查看您的 Tomcat 实例上可用的虚拟主机。

示例命令：

```bash
curl -u test:test http://localhost:8080/host-manager/text/list
```

示例响应：

```
OK - Listed hosts
localhost:
```

### Add 命令

使用 add 命令添加新的虚拟主机。用于 add 命令的参数：

- String name: 虚拟主机的名称。必填
- String aliases: 虚拟主机的别名。
- String appBase: 将由此虚拟主机提供服务的应用程序的基本路径。提供相对或绝对路径。
- Boolean manager: 如果为 true，则将 Manager 应用程序添加到虚拟主机。您可以通过 /manager 上下文访问它。
- Boolean autoDeploy: 如果为 true，则 Tomcat 会自动重新部署放置在 appBase 目录中的应用程序。
- Boolean deployOnStartup: 如果为 true，则 Tomcat 会在启动时自动部署放置在 appBase 目录中的应用程序。
- Boolean deployXML: 如果为 true，则会读取并使用 /META-INF/context.xml 文件。
- Boolean copyXML: 如果为 true，则 Tomcat 会复制 /META-INF/context.xml 文件，并使用原始副本，而不管应用程序的 /META-INF/context.xml 文件的更新。

示例命令：

```bash
curl -u test:test "http://localhost:8080/host-manager/text/add?name=www.awesomeserver.com&aliases=awesomeserver.com&appBase=/mnt/appDir&deployOnStartup=true"
```

示例响应：

```
add: Adding host [www.awesomeserver.com]
```

### Remove 命令

使用 remove 命令删除虚拟主机。用于 remove 命令的参数：

- String name: 要删除的虚拟主机的名称。必填

示例命令：

```bash
curl -u test:test http://localhost:8080/host-manager/text/remove?name=www.awesomeserver.com
```

示例响应：

```
remove: Removing host [www.awesomeserver.com]
```

### Start 命令

使用 start 命令启动虚拟主机。用于 start 命令的参数：

- String name: 要启动的虚拟主机的名称。必填

示例命令：

```bash
curl -u test:test http://localhost:8080/host-manager/text/start?name=www.awesomeserver.com
```

示例响应：

```
OK - Host www.awesomeserver.com started
```

### Stop 命令

使用 stop 命令停止虚拟主机。用于 stop 命令的参数：

- String name: 要停止的虚拟主机的名称。必填

示例命令：

```bash
curl -u test:test http://localhost:8080/host-manager/text/stop?name=www.awesomeserver.com
```

示例响应：

```
OK - Host www.awesomeserver.com stopped
```

### Persist 命令

使用 persist 命令将虚拟主机持久化到 server.xml 中。用于 persist 命令的参数：

- String name: 要持久化的虚拟主机的名称。必填

此功能默认情况下处于禁用状态。要启用此选项，您必须首先配置 Store

ConfigLifecycleListener 监听器。要执行此操作，请将以下监听器添加到您的 server.xml 中：

```xml
<Listener className="org.apache.catalina.storeconfig.StoreConfigLifecycleListener"/>
```

示例命令：

```bash
curl -u test:test http://localhost:8080/host-manager/text/persist?name=www.awesomeserver.com
```

示例响应：

```
OK - Configuration persisted
```

示例手动条目：

```xml
<Host appBase="www.awesomeserver.com" name="www.awesomeserver.com" deployXML="false" unpackWARs="false">
</Host>
```




# 参考资料

https://tomcat.apache.org/tomcat-11.0-doc/host-manager-howto.html


* any list
{:toc}