---
layout: post
title: web server apache Tomcat 入门介绍+windows 部署
date:  2016-11-7 17:13:40 +0800
categories: [Web]
tags: [tomcat, server, web]
published: true
---


# Tomcat

Apache [Tomcat®](http://tomcat.apache.org/) 软件是 Java Servlet、JavaServer Pages、Java Expression Language 和 Java WebSocket 技术的开源实现。

## 简洁

Apache Tomcat是一个开源的、免费的Servlet容器，由Apache软件基金会的Jakarta项目开发。它实现了对Servlet和JSP规范的支持，并且可以作为一个Web服务器来使用，尽管它在处理静态资源方面的能力不如专业的Web服务器如Apache或Nginx。Tomcat广泛应用于中小型Web项目中，并且因其轻量级和易用性而受到Java开发者的青睐。

### 架构与组件

Tomcat的架构设计包括几个关键组件，如Catalina（Servlet容器）、Connecor（连接器）、Coyote（请求处理器）等，它们共同协作处理客户端请求并返回响应。

### 应用场景

Tomcat通常用于开发和测试环境，也适用于生产环境中的大规模、高并发的互联网产品部署。它可以与Apache HTTP Server或Nginx等Web服务器集成，以实现负载均衡和集群化部署，提高系统的可用性和可伸缩性。

### 配置与管理

Tomcat提供了丰富的配置选项，允许用户根据需要调整JVM设置、服务器参数、Web应用配置等。此外，Tomcat还支持通过JMX、Ant等方式进行Web应用的部署管理。

# windows 下详细的部署步骤

在Windows下部署WAR包到Tomcat服务器可以通过以下步骤完成：

**步骤 1：下载和安装Tomcat**

1. 访问[Tomcat官方网站](https://tomcat.apache.org/)，下载最新的Tomcat二进制分发版本（例如，Tomcat 9）。
2. 解压下载的Tomcat压缩文件到你选择的目录，比如 `C:\`。

**步骤 2：准备WAR文件**

确保你有一个可用的WAR文件，可以是通过构建你的Java Web应用程序得到的，或者是从其他地方获取的。假设你的WAR文件是 `myapp.war`。

**步骤 3：部署WAR文件到Tomcat**

1. 打开Windows资源管理器，找到Tomcat安装目录，进入 `webapps` 文件夹，比如 `C:\apache-tomcat-9.0.0\webapps`。
2. 将你的WAR文件（`myapp.war`）复制或移动到 `webapps` 文件夹中。

**步骤 4：启动Tomcat服务器**

1. 打开命令提示符（Command Prompt）。
2. 导航到Tomcat安装目录的 `bin` 文件夹，比如 `C:\apache-tomcat-9.0.0\bin`。
3. 运行 `startup.bat` 文件来启动Tomcat服务器。

**步骤 5：访问部署的Web应用程序**

一旦Tomcat服务器启动，你可以通过浏览器访问你的Web应用程序。默认情况下，Tomcat监听端口是8080。在浏览器中输入 `http://localhost:8080/myapp`（假设`myapp`是你的Web应用程序的上下文路径）即可访问你的Web应用程序。

**注意：**
- 如果端口8080已经被占用，你可以在 `conf` 目录中的 `server.xml` 文件中修改端口配置。
- 如果你需要停止Tomcat服务器，只需在 `bin` 目录中运行 `shutdown.bat` 文件。

通过这些步骤，你应该能够在Windows上成功部署WAR文件到Tomcat服务器。


# Catalina

```catalina``` 位于 **bin** 包下，是 Tomcat 的主要 shell。

```
root@iZuf60ahcky4k4nfv470juZ:~/tool/tomcat/tomcat9/bin# pwd
/root/tool/tomcat/tomcat9/bin
root@iZuf60ahcky4k4nfv470juZ:~/tool/tomcat/tomcat9/bin# ls
bootstrap.jar  catalina.sh         commons-daemon.jar            configtest.bat  daemon.sh   digest.sh           replay_pid2015.log  setclasspath.sh  shutdown.sh  startup.sh       tomcat-native.tar.gz  tool-wrapper.sh  version.sh
catalina.bat   catalina-tasks.xml  commons-daemon-native.tar.gz  configtest.sh   digest.bat  hs_err_pid2015.log  setclasspath.bat    shutdown.bat     startup.bat  tomcat-juli.jar  tool-wrapper.bat      version.bat
``` 

您可以使用带参数的命令进行操作：

```
root@iZuf60ahcky4k4nfv470juZ:~/tool/tomcat/tomcat9/bin# ./catalina.sh 
Using CATALINA_BASE:   /root/tool/tomcat/tomcat9
Using CATALINA_HOME:   /root/tool/tomcat/tomcat9
Using CATALINA_TMPDIR: /root/tool/tomcat/tomcat9/temp
Using JRE_HOME:        /root/tool/jdk/jdk1.8.0_112
Using CLASSPATH:       /root/tool/tomcat/tomcat9/bin/bootstrap.jar:/root/tool/tomcat/tomcat9/bin/tomcat-juli.jar
Usage: catalina.sh ( commands ... )
commands:
  debug             在调试器中启动 Catalina
  debug -security   使用安全管理器调试 Catalina
  jpda start        在 JPDA 调试器下启动 Catalina
  run               在当前窗口中启动 Catalina
  run -security     在当前窗口中使用安全管理器启动 Catalina
  start             在一个独立的窗口中启动 Catalina
  start -security   在一个独立的窗口中使用安全管理器启动 Catalina
  stop              停止 Catalina，等待最多 5 秒钟以结束进程
  stop n            停止 Catalina，等待最多 n 秒钟以结束进程
  stop -force       停止 Catalina，等待最多 5 秒钟，如果仍在运行则使用 kill -KILL
  stop n -force     停止 Catalina，等待最多 n 秒钟，如果仍在运行则使用 kill -KILL
  configtest        对 server.xml 运行基本语法检查 - 检查退出码以获取结果
  version           您正在运行哪个版本的 Tomcat？
```

* any list
{:toc}