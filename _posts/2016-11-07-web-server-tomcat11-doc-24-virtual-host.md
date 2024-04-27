---
layout: post
title: web server apache tomcat11-24-Virtual Hosting and Tomcat
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


## 假设

为了本教程的目的，请假设您拥有一个开发主机，其中有两个主机名，ren 和 stimpy。

还假设有一个运行的Tomcat实例，所以 $CATALINA_HOME 指的是它的安装位置，也许是 /usr/local/tomcat。

此外，本教程使用Unix风格的路径分隔符和命令；如果您使用Windows，请相应修改。

## server.xml

最简单的情况下，编辑您的 server.xml 文件的 Engine 部分如下所示：

```xml
<Engine name="Catalina" defaultHost="ren">
    <Host name="ren"    appBase="renapps"/>
    <Host name="stimpy" appBase="stimpyapps"/>
</Engine>
```

请注意，每个主机的 appBase 下的目录结构不应该相互重叠。

查阅引擎和主机元素的其他属性的配置文档。

## Webapps 目录

为每个虚拟主机创建目录：

```bash
mkdir $CATALINA_HOME/renapps
mkdir $CATALINA_HOME/stimpyapps
```

## 配置您的上下文

### 一般

上下文通常位于 appBase 目录下。例如，要在 ren 主机中以 war 文件的形式部署 foobar 上下文，使用 $CATALINA_HOME/renapps/foobar.war。

请注意，ren 的默认或 ROOT 上下文将部署为 $CATALINA_HOME/renapps/ROOT.war（WAR文件）或 $CATALINA_HOME/renapps/ROOT（目录）。

**注意：** 上下文的 docBase 绝对不能与主机的 appBase 相同。

### context.xml - 方法 #1

在您的上下文中，创建一个 META-INF 目录，然后将上下文定义放在其中，文件命名为 context.xml，即 $CATALINA_HOME/renapps/ROOT/META-INF/context.xml。这样做使部署更加简单，特别是如果您正在分发一个 WAR 文件。

### context.xml - 方法 #2

在 $CATALINA_HOME/conf/Catalina 下创建一个与您的虚拟主机对应的结构，例如：

```bash
mkdir $CATALINA_HOME/conf/Catalina/ren
mkdir $CATALINA_HOME/conf/Catalina/stimpy
```

请注意，结束目录名 "Catalina" 表示与上面显示的 Engine 元素的 name 属性相对应。

现在，对于您的默认 webapps，添加：

```bash
$CATALINA_HOME/conf/Catalina/ren/ROOT.xml
$CATALINA_HOME/conf/Catalina/stimpy/ROOT.xml
```

如果您想要为每个主机使用Tomcat管理器web应用程序，您还需要在此处添加：

```bash
cd $CATALINA_HOME/conf/Catalina
cp localhost/manager.xml ren/
cp localhost/manager.xml stimpy/
```

## 每个主机的默认值

您可以通过在主机特定的 xml 目录中指定新值，在 conf/context.xml 和 conf/web.xml 中找到的默认值。

根据我们之前的例子，您可以使用 $CATALINA_HOME/conf/Catalina/ren/web.xml.default 来自定义命名为 ren 的虚拟主机中部署的所有 webapps 的默认值。

## 更多信息

请查阅上下文元素的其他属性的配置文档。



# 参考资料

https://tomcat.apache.org/tomcat-11.0-doc/apr.html

* any list
{:toc}