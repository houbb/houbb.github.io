---
layout: post
title: web server apache tomcat11-28-Windows Service
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



# Tomcat 监控应用程序

Tomcat11w 是一个用于监控和配置 Tomcat 服务的图形用户界面应用程序。

## 命令行指令

每个命令行指令的格式为 `//XX[//ServiceName]`。

如果省略了 //ServiceName 组件，则假定服务名为文件名减去 w 后缀。因此，默认服务名为 Tomcat11。

可用的命令行指令包括：

- //ES	编辑服务配置	这是默认操作。如果未提供任何选项，则调用此操作。启动允许修改、启动和停止服务配置的图形用户界面应用程序。
- //MS	监视服务	启动图形用户界面应用程序并将其最小化到系统托盘。
- //MR	监视并运行服务	启动图形用户界面应用程序并将其最小化到系统托盘。如果服务当前未运行，则启动服务。
- //MQ	监视退出	停止任何正在运行的服务监视器。

# Tomcat 服务应用程序

Tomcat11 是一个用于将 Tomcat 11 作为 Windows 服务运行的服务应用程序。

## 命令行指令

每个命令行指令的格式为 `//XX[//ServiceName]`。

可用的命令行指令包括：

- //TS	作为控制台应用程序运行服务	这是默认操作。如果未提供任何选项，则调用此操作。ServiceName 是没有 exe 后缀的可执行文件的名称，即 Tomcat11。
- //RS	运行服务	仅从 ServiceManager 调用。
- //ES	启动服务	执行服务。
- //SS	停止服务	停止服务。
- //US	更新服务参数	更新服务参数。
- //IS	安装服务	安装服务。
- //DS	删除服务	停止服务（如果正在运行）。
- //PS	打印服务	打印（重新）创建当前配置的命令。
- `//PP[//seconds]`	暂停服务	默认为 60 秒。
- //VS	版本	打印版本并退出。
- //?	帮助	打印用法并退出。

## 命令行参数

每个命令行参数都以 -- 为前缀。如果命令行参数以 ++ 前缀，并且参数支持多个值，则其值将附加到现有选项上。

参数名称	默认值	描述
--Description	服务名称描述（最多 1024 个字符）
--DisplayName	ServiceName	服务显示名称
--Install	procrun.exe //RS//ServiceName	安装镜像
--Startup	手动	服务启动模式可以是 auto 或 manual
++DependsOn		此服务所依赖的服务列表。使用 # 或 ; 字符分隔依赖服务。
++Environment		提供给服务的环境变量列表，格式为 key=value。使用 # 或 ; 字符分隔它们。如果需要在值中使用 # 或 ; 字符，则整个值必须用单引号括起来。
--User		用于运行可执行文件的用户帐户。仅在 StartMode 为 java 或 exe 时使用，并允许作为没有 LogonAsService 权限的帐户运行应用程序作为服务。
--Password		由 --User 参数设置的用户帐户的密码
--ServiceUser		指定服务应以其运行的帐户名称。使用形式为 DomainName\UserName 的帐户名称。服务进程将作为此用户登录。如果帐户属于内置域，可以指定 .\UserName。请注意，服务控制管理器不接受标准名称的本地化形式，因此要使用它们，您需要适当地指定 NT Authority\LocalService、NT Authority\NetworkService 或 LocalSystem。
--ServicePassword		由 --ServiceUser 参数设置的用户帐户的密码
--LibraryPath		用于定位 JVM 的 DLL 的搜索路径。此目录将添加到 PATH 环境变量的前面，并作为 SetDLLDirectory 函数的参数。
--JavaHome	JAVA_HOME	设置与 JAVA_HOME 环境变量定义的不同的 JAVA_HOME
--Jvm	auto	使用自动（即从 Windows 注册表中查找 JVM）或指定 jvm.dll 的完整路径。您可以在此处使用环境变量扩展。
++JvmOptions	-Xrs	以 -D 或 -X 形式传递给 JVM 的选项列表。选项使用 # 或 ; 字符分隔。如果需要嵌入 # 或 ; 字符，请将它们放在单引号内。（在 exe 模式中不使用。）
++JvmOptions9		在运行 Java 9 或更高版本时传递给 JVM 的 -D 或 -X 形式的选项列表。选项使用 # 或 ; 字符分隔。如果需要嵌入 # 或 ; 字符，请将它们放在单引号内。（在 exe 模式中不使用。）
--Classpath	设置 Java 类路径。（在 exe 模式中不使用。）
--JvmMs		初始内存池大小（以 MiB 为单位）。（在 exe 模式中不使用。）
--JvmMx		最大内存池大小（以 MiB 为单位）。（在 exe 模式中不使用。）
--JvmSs		线程堆栈大小（以 KiB 为单位）。（在 exe 模式中不使用。）
--StartMode	jvm、Java 或 exe 中的一个。模式如下：
jvm - 在进程内启动 Java。依赖于 jvm.dll，请参阅 --Jvm。
Java - 与 exe 相同，但自动使用默认的 Java 可执行文件，即 %JAVA_HOME%\bin\java.exe。确保正确设置了 JAVA_HOME，或者使用 --JavaHome 提供正确的位置。如果两者都没有设置，procrun 将尝试从 Windows 注册表中找到默认的 JDK（而不是 JRE）。
exe - 将镜像作为单独的进程运行
--StartImage	将要运行的可

执行文件。仅适用于 exe 模式。
--StartPath	启动图像可执行文件的工作路径。
--StartClass	主类，包含启动方法。适用于 jvm 和 Java 模式。（在 exe 模式中不使用。）
--StartMethod	main	如果与 main 不同，则为方法名
++StartParams	将传递给 StartImage 或 StartClass 的参数列表。参数使用 # 或 ; 字符分隔。
--StopMode	jvm、Java 或 exe 中的一个。有关详细信息，请参阅 --StartMode。
--StopImage	在停止服务信号上运行的可执行文件。仅适用于 exe 模式。
--StopPath	停止图像可执行文件的工作路径。不适用于 jvm 模式。
--StopClass	在停止服务信号上将使用的类。适用于 jvm 和 Java 模式。
--StopMethod	main	如果与 main 不同，则为方法名
--StopParams	将传递给 StopImage 或 StopClass 的参数列表。参数使用 # 或 ; 字符分隔。
++StopTimeout	无超时	定义 procrun 等待服务正常退出的超时时间（以秒为单位）。
--LogPath	%SystemRoot%\System32\LogFiles\Apache	定义日志路径。如有必要，将创建该目录。
--LogPrefix	commons-daemon	定义服务日志文件名前缀。日志文件将在 LogPath 目录中创建，并附带 .YEAR-MONTH-DAY 后缀
--LogLevel	Info	定义日志级别，可以是 Error、Info、Warn 或 Debug。（大小写不敏感）。
--LogJniMessages	0	将此设置为非零值（例如 1）以捕获 procrun 日志文件中的 JVM jni 调试消息。如果正在使用 stdout/stderr 重定向，则不需要。仅适用于 jvm 模式。
--StdOutput		重定向的 stdout 文件名。如果命名为 auto，则文件将在 LogPath 中创建，名称为 service-stdout.YEAR-MONTH-DAY.log。
--StdError		重定向的 stderr 文件名。如果命名为 auto，则文件将在 LogPath 中创建，名称为 service-stderr.YEAR-MONTH-DAY.log。
--PidFile		定义用于存储运行进程 ID 的文件名。实际文件将在 LogPath 目录中创建。

## 安装服务

手动安装服务的最安全方式是使用提供的 service.bat 脚本。运行此脚本需要管理员权限。如果需要，可以使用 /user 开关指定用于安装服务的用户。

注意：如果启用了用户帐户控制（UAC），则在脚本启动 'Tomcat11.exe' 时，将要求您提供额外的权限。
如果要将额外的选项作为 PR_* 环境变量传递给服务安装程序，您必须在操作系统中全局配置它们，或者以提升的权限运行设置它们的程序（例如，右键单击 cmd.exe 并选择“以管理员身份运行”；在 Windows 8（或更高版本）或 Windows Server 2012（或更高版本）中，您可以通过在资源管理器中单击“文件”菜单栏上的“打开命令提示符”来为当前目录打开一个提升的命令提示符）。有关详细信息，请参阅问题 56143。

安装名为 'Tomcat11' 的服务：

```
C:\> service.bat install
```

还有第二个可选参数，可以让您指定服务的名称，如在 Windows 服务中显示的。

安装名为 'MyService' 的服务：

```
C:\> service.bat install MyService
```

当使用非默认名称安装服务时，tomcat11.exe 和 tomcat11w.exe 可能会被重命名以匹配所选服务名称。要执行此操作，请使用 --rename 选项。

使用重命名安装名为 'MyService' 的服务：

```
C:\> service.bat install MyService --rename
```

如果使用 tomcat11.exe，您需要使用 //IS 参数。

安装名为 'Tomcat11' 的服务：

```
C:\> tomcat11 //IS//Tomcat11 --DisplayName="Apache Tomcat 11" ^
     --Install="C:\Program Files\Tomcat\bin\tomcat11.exe" --Jvm=auto ^
     --StartMode=jvm --StopMode=jvm ^
     --StartClass=org.apache.catalina.startup.Bootstrap --StartParams=start ^
     --StopClass=org.apache.catalina.startup.Bootstrap --StopParams=stop
```

## 更新服务

要更新服务参数，您需要使用 //US 参数。

更新名为 'Tomcat11' 的服务：

```
C:\> tomcat11 //US//Tomcat11 --Description="Apache Tomcat Server - https://tomcat.apache.org/ " ^
     --Startup=auto --Classpath=%JAVA_HOME%\lib\tools.jar;%CATALINA_HOME%\bin\bootstrap.jar
```

如果为服务提供了可选名称，则需要像这样指定它：

更新名为 'MyService' 的服务：

```
C:\> tomcat11 //US//MyService --Description="Apache Tomcat Server - https://tomcat.apache.org/ " ^
     --Startup=auto --Classpath=%JAVA_HOME%\lib\tools.jar;%CATALINA_HOME%\bin\bootstrap.jar
```

## 删除服务

要删除服务，您需要使用 //DS 参数。
如果服务正在运行，将停止然后删除它。

删除名为 'Tomcat11' 的服务：

```
C:\> tomcat11 //DS//Tomcat11
```

如果为服务提供了可选名称，则需要像这样指定它：

删除名为 'MyService' 的服务：

```
C:\> tomcat11 //DS//MyService
```

## 调试服务

要以控制台模式运行服务，您需要使用 //TS 参数。服务的关闭可以通过按下 CTRL+C 或 CTRL+BREAK 来发起。如果将 tomcat11.exe 重命名为 testservice.exe，则可以直接执行 testservice.exe，并且默认情况下将执行此命令模式。

在控制台模式下运行名为 'Tomcat11' 的服务：

```
C:\> tomcat11 //TS//Tomcat11 [additional arguments]
```

或者简单地执行：

```
C:\> tomcat11
```

## 多个实例

Tomcat 支持安装多个实例。您可以在不同的 IP/端口组合上运行单个 Tomcat 安装，或者在不同的 IP/端口上运行多个 Tomcat 版本，每个版本运行一个或多个实例。

每个实例文件夹需要具有以下结构：

- conf
- logs
- temp
- webapps
- work

至少，conf 应包含从 CATALINA_HOME\conf\ 复制的以下文件的副本。未复制和编辑的任何文件将默认从 CATALINA_HOME\conf 中获取，即 CATALINA_BASE\conf 文件会覆盖 CATALINA_HOME\conf 中的默认值。

- server.xml
- web.xml

您必须编辑 CATALINA_BASE\conf\server.xml 来指定实例侦听的唯一 IP/端口。

找到包含 `Connector port="8080"` ... 的行，并添加 address 属性和/或更新端口号，以指定唯一的 IP/端口组合。

要安装实例，首先将 CATALINA_HOME 环境变量设置为 Tomcat 安装目录的名称。然后创建第二个环境变量 CATALINA_BASE，并将其指向实例文件夹。然后运行 "service.bat install" 命令并指定服务名称。

```
set CATALINA_HOME=c:\tomcat_11
set CATALINA_BASE=c:\tomcat_11\instances\instance1
service.bat install instance1
```

要修改服务设置，您可以运行 tomcat11w //ES//instance1。

对于其他实例，创建额外的实例文件夹，更新 CATALINA_BASE 环境变量，并再次运行 "service.bat install"。


# 参考资料

https://tomcat.apache.org/tomcat-11.0-doc/windows-service-howto.html

* any list
{:toc}