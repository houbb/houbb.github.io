---
layout: post
title:  CSTP2.0 Deploy
date:  2017-10-16 13:59:13 +0800
categories: [Work]
tags: [deploy]
published: true
---


# CSTP2.0

【CSTP】负责内容的接收和转发(ActiveMQ)，【Mule】负责接收到转发的数据并且入库。

## JDK

- 常见命令

```
C:\Users\bbhou>java -version
java version "1.8.0_144"
Java(TM) SE Runtime Environment (build 1.8.0_144-b01)
Java HotSpot(TM) 64-Bit Server VM (build 25.144-b01, mixed mode)

C:\Users\bbhou>echo %JAVA_HOME%
C:\Program Files\Java\jdk1.8.0_144

C:\Users\bbhou>echo %path%
C:\ProgramData\Oracle\Java\javapath;C:\Windows\system32;C:\Windows;C:\Windows\Sy
stem32\Wbem;C:\Windows\System32\WindowsPowerShell\v1.0\;C:\Program Files (x86)\M
icrosoft SQL Server\100\Tools\Binn\;C:\Program Files\Microsoft SQL Server\100\To
ols\Binn\;C:\Program Files\Microsoft SQL Server\100\DTS\Binn\;C:\Program Files (
x86)\Microsoft SQL Server\100\Tools\Binn\VSShell\Common7\IDE\;C:\Program Files (
x86)\Microsoft Visual Studio 9.0\Common7\IDE\PrivateAssemblies\;C:\Program Files
 (x86)\Microsoft SQL Server\100\DTS\Binn\;C:\Program Files\TortoiseSVN\bin;C:\Pr
ogram Files\Java\jdk1.8.0_144\bin;C:\Program Files\Java\jdk1.8.0_144\jre\bin;D:\
Program Files\Git\cmd;D:\Maven\apache-maven-3.3.9\bin;C:\Program Files\MySQL\MyS
QL Utilities 1.6\;D:\Ruby23-x64\bin;D:\Wind\Wind.NET.Client\WindNET\bin\;D:\Mave
n\apache-maven-3.3.9\bin

C:\Users\bbhou>echo %CLASSPATH%
.;C:\Program Files\Java\jdk1.8.0_144\lib;C:\Program Files\Java\jdk1.8.0_144\lib\
tools.jar
```

- jdk/jre

> [JRE 和 JDK 的区别是什么？](https://www.zhihu.com/question/20317448)

1. jre 支持运行

2. jdk 支持开发

对于原来的 JDK，如果不是 **1.7**。那么直接卸载重装。

一、卸载

【Windows】→【控制面板】→【程序和功能】

直接对 JDK 相关的 2 个软件卸载即可。(Java SE DEV-kit 卸载后会要求重启电脑，建议后卸载。)

二、安装

[Download](http://www.oracle.com/technetwork/java/javase/downloads/java-archive-downloads-javase7-521261.html) JDK7 或者使用安装包。

直接双击运行即可。

记住 JDK 的安装路径。(建议**默认，不要修改**。)

以 JDK8 为例，可能是这样的：

```
C:\Program Files\Java\jdk1.8.0_144\
```

三、配置

 计算机→属性→高级系统设置→高级→环境变量
 
- JAVA_HOME

系统变量→新建变量 

注意：末尾不需要 `\`
 
```
变量名：    JAVA_HOME
变量值：    C:\Program Files\Java\jdk1.8.0_144
```

- Path

系统变量→寻找 Path 变量→编辑

在变量值最后输入 `%JAVA_HOME%\bin;%JAVA_HOME%\jre\bin;`

注意：原来 Path 的变量值末尾有没有 `;` 号，如果没有，先输入 `;` 号再输入上面的代码

- CLASSPATH

系统变量→新建 CLASSPATH 变量

```
变量名：    CLASSPATH
变量值：    .;%JAVA_HOME%\lib;%JAVA_HOME%\lib\tools.jar
```

四、验证

```
C:\Users\bbhou>java -version
java version "1.8.0_144"
Java(TM) SE Runtime Environment (build 1.8.0_144-b01)
Java HotSpot(TM) 64-Bit Server VM (build 25.144-b01, mixed mode)
```

## ActiveMQ


一、下载

[activemq-5151-release](http://activemq.apache.org/activemq-5151-release.html) 下载，或者使用已有软件包。

二、部署

目录结构：

```
bin
conf
data
docs
examples
lib
webapps
webapps-demo
activemq-all-5.15.1.jar
LICENSE
NOTICE
README.txt
```

日志在 data 目录下。

- bin 

直接进入 **bin** 文件夹, 文件如下：

```
win32
win64
activemq
activemq-admin.bat
activemq.bat
activemq.jar
wrapper.jar
```

根据当前计算机为 64/32 位，进入对应的 win32/win64 文件夹。(以 win64 为例)

- bin/win64

```
activemq.bat
InstallService.bat
UninstallService.bat
wrapper.conf
wrapper.dll
wrapper.exe
```

【注意】：请右键，以管理员身份运行。

`InstallService.bat` 可将 ActiveMQ 打成 windows 服务；

`UninstallService.bat` 可卸载此服务。


三、查看及配置

- 查看

cmd 输入

```
services.msc
```

进入服务列表。可以看到 **ActiveMQ**。

- 配置

配置此服务为开机自启动（默认就是自动）：

右键→属性→启动类型-自动

- 启动

右键→启动

- 判断是否启动成功

浏览器输入(admin/admin)：

```
http://localhost:8161/admin/
```

PS: 对于 MQ 信息的清理

原来的 MQ 可能包含脏数据。直接将 **Queues**、**Topics** 下的信息删除即可。

## CSTP

- 目录结构

```
bin
conf
data
lib
logs
```

- 安装服务

`bin/InstallApp-NT.bat` 以 **管理员的身份运行**。

- 配置信息

`conf` 目录文件下。

## Mule

一、下载

[mulesoft](https://developer.mulesoft.com/) 获取。或者使用已有的软件包。

如软件包

**E:\CSTP-DEPLOY\HY_MULE_SERVER**

目录结构如下：

```
.mule
apps
bin
conf
docs
domains
examples
lib
LICENSE.txt
logs
MIGRATION.txt
README.txt
src
```

二、配置

计算机→属性→高级系统设置→高级→环境变量
 
- MULE_HOME

系统变量→新建变量 MULE_HOME

```
变量名：    MULE_HOME
变量值：    E:\CSTP-DEPLOY\HY_MULE_SERVER
```

- 测试

```
$   echo %MULE_HOME%
E:\CSTP-DEPLOY\HY_MULE_SERVER
```

注意：为了保证 MULE_HOME 生效，建议**重启电脑**

三、放置待运行的压缩包

`PROJECT_NAME.zip` 直接放在 **apps** 中。

备注：当运行时，此压缩包会被解压。并生成对应的 `PROJECT_NAME.txt`，说明运行成功了。

如何运行呢？下面的。

四、运行

此运行，只是简单用于测试。

准备工作：确保 ActiveMQ 已经正常启动。

在执行三之后，直接运行 **bin/mule.bat** 

五、Windows 服务

`HY_MULE_SERVER\bin\InstallApp-NT.bat` 用于安装服务。

`HY_MULE_SERVER\bin\UninstallApp-NT.bat` 用于卸载服务。


注意：

1) 为了避免权限问题。右键→以管理员方式运行。

2) 设置服务为自动。且启动项目。

如果正确启动，可以在 [ActiveMQ](http://localhost:8161/admin/) 页面上看到对应的 Queue/Topics 的连接信息。

六、日志

日志目录在 **HY_MULE_SERVER\logs** 下。


## Tomcat

将对应的 Project.war 放在 **webapps** 文件夹下。

直接运行 `bin/startup.bat` 启动项目。


# TD

【TD】负责下载文件。【Kettle】负责解析入库。

对于大文件或者不标准的文件，入库有问题。【补丁】来解决。

TD 环境问题，不一定能下载下来。

记住 **username/password**，直接在本地也可以下载。

## TD

- 目录结构

```
bin
conf
lib
logs
```

- 安装服务

`bin/InstallApp-NT.bat` 打包 windows 服务。

## Kettle

倒_(:зゝ∠)_

## 补丁

Kettle 解析大 Excel 报错。（OOM）

Excel 格式不标准，则使用流的方式进行读。






















* any list
{:toc}












 

