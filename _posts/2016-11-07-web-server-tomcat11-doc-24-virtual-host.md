---
layout: post
title: web server apache tomcat11-24-Virtual Hosting and Tomcat
date:  2016-11-7 17:13:40 +0800
categories: [Web]
tags: [tomcat, server, web]
published: true
---



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