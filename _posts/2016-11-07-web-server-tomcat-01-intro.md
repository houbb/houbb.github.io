---
layout: post
title: web server apache Tomcat 入门介绍
date:  2016-11-7 17:13:40 +0800
categories: [Web]
tags: [tomcat, server, web]
published: false
---

# Tomcat

Apache [Tomcat®](http://tomcat.apache.org/) 软件是 Java Servlet、JavaServer Pages、Java Expression Language 和 Java WebSocket 技术的开源实现。

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