---
layout: post
title: web server apache tomcat11-02-setup 启动
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

# 简介

在不同的平台上设置 Tomcat 运行有几种方法。

主要的文档是一个名为 RUNNING.txt 的文件。如果以下信息没有回答您的一些问题，我们鼓励您参考该文件。

## Windows

在 Windows 上安装 Tomcat 可以使用 Windows 安装程序轻松完成。它的界面和功能类似于其他基于向导的安装程序，只有少量感兴趣的项目。

- 作为服务安装：无论选择了什么设置，Tomcat 都将安装为 Windows 服务。在组件页面上使用复选框将服务设置为“自动”启动，这样当 Windows 启动时，Tomcat 就会自动启动。为了最佳安全性，服务应以单独的用户身份运行，并降低权限（请参阅 Windows Services 管理工具及其文档）。
- Java 位置：安装程序将提供一个默认的 JRE 用于运行服务。安装程序使用注册表确定 Java 17 或更高版本 JRE 的基本路径，包括作为完整 JDK 的一部分安装的 JRE。如果找不到 JRE，则安装程序首先会查找 JRE，仅在找不到 JRE 时才会查找 JDK。最后，如果未找到 JRE 或 JDK，安装程序将尝试使用 JAVA_HOME 环境变量。不强制使用安装程序检测到的默认 JRE，任何安装的 Java 17 或更高版本 JRE 都可以使用。
- 系统托盘图标：当 Tomcat 作为服务运行时，运行时将不会有任何系统托盘图标。请注意，选择在安装结束时运行 Tomcat 时，即使 Tomcat 安装为服务，也将使用系统托盘图标。
- 默认值：安装程序使用 `/C=<config file>` 命令行参数可以覆盖默认值。配置文件使用 name=value 格式，每对都在单独的行上。

可用配置选项的名称为：

```
   JavaHome
   TomcatPortShutdown
   TomcatPortHttp
   TomcatMenuEntriesEnable
   TomcatShortcutAllUsers
   TomcatServiceDefaultName
   TomcatServiceName
   TomcatServiceFileName
   TomcatServiceManagerFileName
   TomcatAdminEnable
   TomcatAdminUsername
   TomcatAdminPassword
   TomcatAdminRoles
```

   使用 /C=... 以及 /S 和 /D= 可以执行完全配置的无人值守 Apache Tomcat 安装。有关如何将 Tomcat 作为 Windows 服务管理的信息，请参阅 Windows Service How-To。
- 安装程序将创建快捷方式，允许启动和配置 Tomcat。重要的是要注意，只有在 Tomcat 运行时才能使用 Tomcat 管理 Web 应用程序。

## Unix 守护程序

Tomcat 可以使用 commons-daemon 项目的 jsvc 工具作为守护程序运行。jsvc 的源代码 tarball 包含在 Tomcat 二进制文件中，并且需要进行编译。构建 jsvc 需要 C ANSI 编译器（如 GCC）、GNU Autoconf 和 JDK。

在运行脚本之前，JAVA_HOME 环境变量应设置为 JDK 的基本路径。或者，在调用 ./configure 脚本时，可以使用 --with-java 参数指定 JDK 的路径，例如 ./configure --with-java=/usr/java。

使用以下命令应该会生成一个编译好的 jsvc 二进制文件，位于 $CATALINA_HOME/bin 文件夹中。这假设使用 GNU TAR，并且 CATALINA_HOME 是一个环境变量，指向 Tomcat 安装的基本路径。

请注意，在 FreeBSD 系统上应使用 GNU make (gmake) 而不是本机 BSD make。

```bash
cd $CATALINA_HOME/bin
tar xvfz commons-daemon-native.tar.gz
cd commons-daemon-1.1.x-native-src/unix
./configure
make
cp jsvc ../..
cd ../..
```

然后，可以使用以下命令将 Tomcat 作为守护程序运行。

```bash
CATALINA_BASE=$CATALINA_HOME
cd $CATALINA_HOME
./bin/jsvc \
    -classpath $CATALINA_HOME/bin/bootstrap.jar:$CATALINA_HOME/bin/tomcat-juli.jar \
    -outfile $CATALINA_BASE/logs/catalina.out \
    -errfile $CATALINA_BASE/logs/catalina.err \
    --add-opens=java.base/java.lang=ALL-UNNAMED \
    --add-opens=java.base/java.io=ALL-UNNAMED \
    --add-opens=java.base/java.util=ALL-UNNAMED \
    --add-opens=java.base/java.util.concurrent=ALL-UNNAMED \
    --add-opens=java.rmi/sun.rmi.transport=ALL-UNNAMED \
    -Dcatalina.home=$CATALINA_HOME \
    -Dcatalina.base=$CATALINA_BASE \
    -Djava.util.logging.manager=org.apache.juli.ClassLoaderLogManager \
    -Djava.util.logging.config.file=$CATALINA_BASE/conf/logging.properties \
    org.apache.catalina.startup.Bootstrap
```

如果 JVM 默认使用服务器 VM 而不是客户端 VM，您可能还需要指定 -jvm server。这已在 OSX 上观察到。

jsvc 还有其他有用的参数，例如 -user，它在守护程序初始化完成后导致切换到另一个用户。例如，这允许将 Tomcat 作为非特权用户运行，同时仍能够使用特权端口。请注意，如果使用此选项并作为 root 启动 Tomcat，则需要禁用 org.apache.catalina.security.SecurityListener 检查，以防止作为 root 运行时 Tomcat 启动。

jsvc --help 将返回完整的 jsvc 使用信息。特别是，-debug 选项用于调试运行 jsvc 时

的问题。

# 参考资料

https://tomcat.apache.org/tomcat-11.0-doc/setup.html

* any list
{:toc}