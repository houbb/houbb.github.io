---
layout: post
title:  TeamCity
date:  2018-01-03 22:48:51 +0800
categories: [CI]
tags: [idea, ci]
published: true
---


# TeamCity

[TeamCity](https://www.jetbrains.com/teamcity/?fromMenu) is Powerful Continuous Integration out of the box.

类似于 [jenkins](https://jenkins.io/)，可以对项目进行持续集成。

优势：可以和 idea 编辑器无缝集成。


# 基础介绍


- 支持的平台

> [TeamCity 10.x and 2017.x Supported Platforms and Environments](https://confluence.jetbrains.com/display/TCD10/TeamCity+Documentation#TeamCityDocumentation-map)

- 持续集成

[Continuous Integration](https://www.martinfowler.com/articles/continuousIntegration.html) is a software development practice in 
which developers commit code changes into a shared repository several times a day.

- TeamCity
 
> [TeamCity 的作用及基本概念](https://confluence.jetbrains.com/display/TCD10/Continuous+Integration+with+TeamCity) 


# Quick Start

> [Installation Quick Start](https://confluence.jetbrains.com/display/TCD10/Installation+Quick+Start)


## 环境

- 操作系统环境

```
$ sw_vers
ProductName:	Mac OS X
ProductVersion:	10.13.1
BuildVersion:	17B1003
```

- JDK

确保 JDK 正确安装

```
$ java -version
java version "1.8.0_91"
Java(TM) SE Runtime Environment (build 1.8.0_91-b14)
Java HotSpot(TM) 64-Bit Server VM (build 25.91-b14, mixed mode)
```

- JAVA_HOME

确保 `JAVA_HOME` 已经正确配置

```
$ echo $JAVA_HOME
/Library/Java/JavaVirtualMachines/jdk1.8.0_91.jdk/Contents/Home
```

## 下载

- Download

> [TeamCity-2017.2.1.tar.gz](https://download.jetbrains.8686c.com/teamcity/TeamCity-2017.2.1.tar.gz)

将下载后的文件放在你想放的位置，比如我放在 `/Users/houbinbin/it/tools/teamcity`，我们称之为 `${teamcityHome}`

- Unzip

```
tar zxf TeamCity-2017.2.1.tar.gz
```

解压后进入加压文件夹(TeamCity)，内容如下：

```
$ pwd
/Users/houbinbin/it/tools/teamcity/TeamCity

$ ls
BUILD_50732		Tomcat-running.txt	buildAgent		devPackage		licenses		temp
TeamCity-readme.txt	bin			conf			lib			service.properties	webapps
houbinbindeMacBook-Pro:TeamCity houbinbin$ 
```

## 运行 

- Start


```
$   runAll.sh start
```


日志如下：

```
$ pwd
/Users/houbinbin/it/tools/teamcity/TeamCity/bin

$ runAll.sh start
Spawning TeamCity restarter in separate process
TeamCity restarter running with PID 62846
Starting TeamCity build agent...
Starting TeamCity Build Agent Launcher...
Agent home directory is /Users/houbinbin/IT/tools/teamcity/TeamCity/buildAgent
Current Java runtime version is 1.8 
Lock file: /Users/houbinbin/IT/tools/teamcity/TeamCity/buildAgent/logs/buildAgent.properties.lock 
Using no lock 
Done [63456], see log at /Users/houbinbin/it/tools/teamcity/TeamCity/buildAgent/logs/teamcity-agent.log
```


默认访问 [http://localhost:8111/](http://localhost:8111/)

<label class="label label-info">修改默认端口</label>

你可以在 `${teamcityHome}/conf/server.xml` 文件中修改 `<Connector>` 节点：

```xml
<Connector port="8111"></Connector>
```

- Stop

```
runAll.sh stop
```

## 初次访问

- Data Directory

直接访问初始页面，确定一下 **Data Directory**，我的默认为

```
/Users/houbinbin/.BuildServer
```

直接继续点击 <button class="btn btn-primary">Proceed</button>

- 数据库链接设置

我选择使用 MySQL，JDBC driver 默认没有提供，你可以根据提示下载放到指定的目录。

下载地址：[http://dev.mysql.com/downloads/connector/j.](http://dev.mysql.com/downloads/connector/j.)

解压后放置的目录：`/Users/houbinbin/.BuildServer/lib/jdbc`

```
$ mv mysql-connector-java-5.1.45-bin.jar /Users/houbinbin/.BuildServer/lib/jdbc
$ pwd
/Users/houbinbin/.BuildServer/lib/jdbc
$ ls
mysql-connector-java-5.1.45-bin.jar
```

然后点击 <button class="btn btn-default">Refresh JDBC drivers</button>，提示不再有说明成功。

- 创建数据库用于存储信息

创建数据库 `teamcity`

- 指定链接信息

```
Database host[:port]:  （此处默认不填，系统会使用默认本地，默认端口）
Database name*:  teamcity
User name:  root  
Password:   XXX
```

配置完成点击 <button class="btn btn-primary">Proceed</button>

系统将会初始化一系列东西，请耐心等待。

- 接受协议

初始化完成后会有一份协议，确认之后可继续。

# 创建项目

> [Configure and Run Your First Build](https://confluence.jetbrains.com/display/TCD10/Configure+and+Run+Your+First+Build)

## Create Administrator Account

创建管理员账号。为了测试方便，我们创建用户 admin/123456。

## My Settings & Tools

初始页面如下：

(1) 中间邮件处填写你的邮箱，并保存可以收到系统的提示。

(2) 左上角点击 [projects](http://localhost:8111/overview.html) 以创建项目。

![2018-01-03-idea-teamcity-mysetting.png](https://raw.githubusercontent.com/houbb/resource/master/img/idea/teamcity/2018-01-03-idea-teamcity-mysetting.png)


## Create project

- 指定代码仓库

我们直接点击按钮 **+Create project** 添加一个项目。

默认使用 **From a repository URL**，我们用 [github](https://github.com/houbb/animation) 的项目来测试。

```
Parent project: *	<Root project>
Repository URL: *	https://github.com/houbb/animation
Username:	houbb
Password:   XXX	
```

配置完成点击 <button class="btn btn-primary">Proceed</button>

然后会提示 `VCS repository connection has been verified. `，确认项目信息无误后直接点击按钮 <button class="btn btn-primary">Proceed</button>。


- 构建 Steps

Auto-detected Build Steps 系统直接分析出这是一个 maven 项目，我勾选 Maven，并点击 <button class="btn btn-info">Use selected</button>

这里可以添加多个步骤，简单起见，我使用默认的步骤。(可点击 `Edit` 进行编辑)

![2018-01-03-idea-teamcity-steps.png](https://raw.githubusercontent.com/houbb/resource/master/img/idea/teamcity/2018-01-03-idea-teamcity-steps.png)

- 运行

直接点击上方 `run` 按钮，执行指定的步骤。

可以在 build log 中查看运行日志。

- 构建 Triggers

即何时触发构建操作，可以定时，或是在每次提交进行。此处暂时不做研究。

## 和 IDEA 的集成

开头就说过，这和 idea 是同一家公司的产品。

直接在 idea plugins 中下载安装 `teamcity` 插件，重启并且登录即可。



 






* any list
{:toc}





