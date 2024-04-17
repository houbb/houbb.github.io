---
layout: post
title: web server apache tomcat11-04-manager 如何管理？
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


# 简介

在许多生产环境中，具有能够部署新的 Web 应用程序或取消部署现有应用程序的能力而无需关闭和重新启动整个容器非常有用。

此外，您可以请求现有应用程序重新加载自身，即使您尚未在 Tomcat 服务器配置文件中声明其可重新加载。

为了支持这些功能，Tomcat 包括一个 Web 应用程序（默认安装在上下文路径 /manager），支持以下功能：

| 功能                                                         | 描述                                                                                   |
|------------------------------------------------------------|----------------------------------------------------------------------------------------|
| 从 WAR 文件的上传内容部署新的 Web 应用程序                     |                                                                                         |
| 从服务器文件系统上指定的上下文路径部署新的 Web 应用程序             |                                                                                         |
| 列出当前部署的 Web 应用程序以及当前为这些 Web 应用程序活动的会话                            |                                                                                         |
| 重新加载现有的 Web 应用程序，以反映 /WEB-INF/classes 或 /WEB-INF/lib 内容的更改                |                                                                                         |
| 列出操作系统和 JVM 属性值                                                   |                                                                                         |
| 列出可用的全局 JNDI 资源，供准备嵌套在 <Context> 部署描述中的 <ResourceLink> 元素的部署工具使用 |                                                                                         |
| 启动已停止的应用程序（使其再次可用）                                                      |                                                                                         |
| 停止现有应用程序（使其不可用），但不取消部署它                                               |                                                                                         |
| 取消部署已部署的 Web 应用程序并删除其文档基目录（除非它是从文件系统部署的）                       |                                                                                         |

默认的 Tomcat 安装包括为默认虚拟主机配置的 Manager 应用程序的实例。

如果您创建了额外的虚拟主机，您可能希望将 Manager 应用程序的实例添加到其中一个或多个主机中。

要将 Manager Web 应用程序上下文的实例添加到新主机上，请在 $CATALINA_BASE/conf/[enginename]/[hostname] 文件夹中安装 manager.xml 上下文配置文件。

以下是一个示例：

```xml
<Context privileged="true" antiResourceLocking="false"
         docBase="${catalina.home}/webapps/manager">
  <CookieProcessor className="org.apache.tomcat.util.http.Rfc6265CookieProcessor"
                   sameSiteCookies="strict" />
  <Valve className="org.apache.catalina.valves.RemoteAddrValve"
         allow="127\.\d+\.\d+\.\d+|::1|0:0:0:0:0:0:0:1" />
  <Manager sessionAttributeValueClassNameFilter="java\.lang\.(?:Boolean|Integer|Long|Number|String)|org\.apache\.catalina\.filters\.CsrfPreventionFilter\$LruCache(?:\$1)?|java\.util\.(?:Linked)?HashMap"/>
</Context>
```

有三种使用 Manager Web 应用程序的方式：

1. 作为带有用户界面的应用程序，您可以在浏览器中使用。以下是一个示例 URL，您可以将 localhost 替换为您的网站主机名：http://localhost:8080/manager/html 。
2. 仅使用 HTTP 请求的最小版本，适用于由系统管理员设置的脚本使用。命令作为请求 URI 的一部分给出，响应以易于解析和处理的简单文本形式呈现。有关更多信息，请参阅支持的 Manager 命令。
3. 适用于 Ant（版本 1.4 或更高版本）构建工具的便捷任务定义集。有关更多信息，请参阅使用 Ant 执行 Manager 命令。


# 配置 Manager 应用程序访问

以下描述使用变量名 $CATALINA_BASE 来引用相对路径解析的基本目录。

如果您尚未通过设置 CATALINA_BASE 目录来配置 Tomcat 以用于多个实例，则 $CATALINA_BASE 将设置为 $CATALINA_HOME 的值，即您安装 Tomcat 的目录。

使用默认设置将允许互联网上的任何人执行您服务器上的 Manager 应用程序是相当不安全的。

因此，Manager 应用程序附带了这样一个要求：任何试图使用它的人必须进行身份验证，使用具有其中一个 manager-xxx 角色的用户名和密码（角色名称取决于所需的功能）。

此外，默认用户文件（$CATALINA_BASE/conf/tomcat-users.xml）中没有分配给这些角色的用户名。

因此，默认情况下完全禁用了对 Manager 应用程序的访问。

您可以在 Manager Web 应用程序的 web.xml 文件中找到角色名称。可用的角色包括：

- manager-gui — 访问 HTML 界面。
- manager-status — 仅访问 "服务器状态" 页面。
- manager-script — 访问本文档中描述的面向工具友好的纯文本界面，以及 "服务器状态" 页面。
- manager-jmx — 访问 JMX 代理接口和 "服务器状态" 页面。

HTML 界面受到 CSRF（跨站点请求伪造）攻击的保护，但文本和 JMX 界面无法受到保护。这意味着被允许访问文本和 JMX 界面的用户在使用 Web 浏览器访问 Manager 应用程序时必须小心。为了保持 CSRF 保护：

- 如果您使用 Web 浏览器使用具有 manager-script 或 manager-jmx 角色的用户访问 Manager 应用程序（例如用于测试纯文本或 JMX 界面），之后必须关闭所有浏览器窗口以终止会话。如果您不关闭浏览器并访问其他站点，您可能会成为 CSRF 攻击的受害者。
- 建议永远不要将 manager-script 或 manager-jmx 角色授予具有 manager-gui 角色的用户。

请注意，JMX 代理接口实际上是 Tomcat 的类似低级根的管理接口。如果知道要调用的命令，可以做很多事情。启用 manager-jmx 角色时应谨慎。

要启用对 Manager Web 应用程序的访问，您必须创建新的用户名/密码组合并将其中一个 manager-xxx 角色与之关联，或者将 manager-xxx 角色添加到现有用户名/密码组合中。由于本文档的大部分内容都是使用文本界面，因此此示例将使用角色名称 manager-script。用户名/密码的配置方式取决于您正在使用的 Realm 实现：

- UserDatabaseRealm 和 MemoryUserDatabase，或 MemoryRealm — UserDatabaseRealm 和 MemoryUserDatabase 配置在默认的 $CATALINA_BASE/conf/server.xml 中。MemoryUserDatabase 和 MemoryRealm 默认读取位于 $CATALINA_BASE/conf/tomcat-users.xml 的 XML 格式文件，可以使用任何文本编辑器进行编辑。

此文件包含每个个人用户的 XML `<user>`，可能类似于以下内容：

```xml
<user username="craigmcc" password="secret" roles="standard,manager-script" />
```

它定义了此个人用于登录的用户名和密码，以及他们关联的角色名称。您可以将 manager-script 角色添加到一个或多个现有用户的逗号分隔的角色属性中，并/或创建具有分配了该角色的新用户。

- DataSourceRealm — 您的用户和角色信息存储在通过 JDBC 访问的数据库中。将 manager-script 角色添加到一个或多个现有用户，并/或按照您环境的标准程序创建一个或多个分配了此角色的新用户。

- JNDIRealm — 您的用户和角色信息存储在通过 LDAP 访问的目录服务器中。将 manager-script 角色添加到一个或多个现有用户，并/或按照您环境的标准程序创建一个或多个分配了此角色的新用户。

当您首次尝试发出下一节中描述的 Manager 命令之一时，将要求您使用 BASIC 身份验证登录。您输入的用户名和密码无关紧要，只要它们识别出具有 manager-script 角色的有效用户。

除了密码限制之外，还可以通过添加 RemoteAddrValve 或 RemoteHostValve 来限制对 Manager Web 应用程序的访问。

有关详细信息，请参阅阀门文档。以下是通过 IP 地址限制对 localhost 的访问的示例：

```xml
<Context privileged="true">
         <Valve className="org.apache.catalina.valves.RemoteAddrValve"
                allow="127\.0\.0\.1"/>
</Context>
```

# HTML 用户友好界面

Manager Web 应用程序的用户友好的 HTML 界面位于以下位置：

[http://{host}:{port}/manager/html](http://{host}:{port}/manager/html)

如上所述，您需要 manager-gui 角色才能访问它。有一份单独的文档提供了有关此界面的帮助。请参阅：

[HTML Manager documentation](https://tomcat.apache.org/tomcat-9.0-doc/manager-howto.html#Manager_HTML_Interface)

HTML 界面受到 CSRF（跨站点请求伪造）攻击的保护。每次访问 HTML 页面都会生成一个随机令牌，该令牌存储在您的会话中，并包含在页面上的所有链接中。如果您的下一个操作没有正确的令牌值，则将拒绝该操作。如果令牌已过期，您可以从 Manager 的主页面或“列出应用程序”页面重新开始。

## 支持的 Manager 命令

Manager 应用程序知道如何处理的所有命令都在一个单独的请求 URI 中指定，如下所示：

```
http://{host}:{port}/manager/text/{command}?{parameters}
```

其中 {host} 和 {port} 表示 Tomcat 运行的主机名和端口号，{command} 表示您希望执行的 Manager 命令，{parameters} 表示特定于该命令的查询参数。在下面的示例中，根据您的安装情况适当地自定义主机和端口。

这些命令通常由 HTTP GET 请求执行。/deploy 命令有一个通过 HTTP PUT 请求执行的表单。

## 常见参数

大多数命令接受以下一个或多个查询参数：

- path - 您正在处理的 Web 应用程序的上下文路径（包括前导斜杠）。要选择 ROOT Web 应用程序，请指定“/”。
  > 注意：不可能对 Manager 应用程序本身执行管理命令。
  > 注意：如果未显式指定路径参数，则将使用标准上下文命名规则从 config 参数或（如果未提供 config 参数）war 参数派生路径和版本。
- version - 此 Web 应用程序的版本，由并行部署功能使用。如果您在需要路径的任何地方使用并行部署，则必须除了路径之外指定一个版本，并且组合路径和版本必须唯一，而不仅仅是路径。
  > 注意：如果未显式指定路径，则忽略版本参数。
- war - Web 应用程序存档（WAR）文件的 URL，或包含 Web 应用程序的目录的路径名，或包含 Context 配置 ".xml" 文件的路径名。您可以使用以下任何格式的 URL：
  - file:/absolute/path/to/a/directory - 包含 Web 应用程序解压版本的目录的绝对路径。此目录将附加到您指定的上下文路径，而不进行任何更改。
  - file:/absolute/path/to/a/webapp.war - Web 应用程序存档（WAR）文件的绝对路径。这仅适用于 /deploy 命令，并且是该命令唯一可接受的格式。
  - file:/absolute/path/to/a/context.xml - 包含 Context 配置元素的 Web 应用程序上下文配置 ".xml" 文件的绝对路径。
  - directory - Host 的应用程序基目录中的 Web 应用程序上下文的目录名称。
  - webapp.war - Host 的应用程序基目录中位于的 Web 应用程序 WAR 文件的名称。

每个命令将以 text/plain 格式（即不带 HTML 标记的纯 ASCII 文本）返回响应，使人类和程序都可以轻松阅读。

响应的第一行将以 OK 或 FAIL 开头，指示请求的命令是否成功。在失败的情况下，第一行的其余部分将包含遇到的问题的描述。一些命令包括如下所述的其他信息行。

国际化说明 - Manager 应用程序在资源包中查找其消息字符串，因此可能已为您的平台翻译了这些字符串。以下示例显示了消息的英文版本。

# 远程部署新应用程序存档（WAR）

执行此 HTTP PUT 请求时，指定请求数据为上传的 Web 应用程序存档（WAR）文件，并将其安装到相应虚拟主机的 appBase 目录中，并从指定的路径派生用于添加到 appBase 的 WAR 文件的名称。稍后可以通过使用 /undeploy 命令来卸载该应用程序（并删除相应的 WAR 文件）。

此命令由 HTTP PUT 请求执行。

.WAR 文件可能包括特定于 Tomcat 的部署配置，方法是在 /META-INF/context.xml 中包含一个 Context 配置 XML 文件。

URL 参数包括：

- update：设置为 true 时，将首先卸载任何现有更新。默认值设置为 false。
- tag：指定标记名称，这允许将已部署的 Web 应用程序与标记或标签相关联。如果需要时，可以仅使用标记稍后重新部署 Web 应用程序。
- config：Context 配置 ".xml" 文件的 URL，格式为 file:/absolute/path/to/a/context.xml。这必须是包含 Context 配置元素的 Web 应用程序 Context 配置 ".xml" 文件的绝对路径。

## 注意 - 此命令是 /undeploy 命令的逻辑相反。

如果安装和启动成功，您将收到如下响应：

```
OK - Deployed application at context path /foo
```

否则，响应将以 FAIL 开头，并包含错误消息。导致问题的可能原因包括：

- 在路径 /foo 处已存在应用程序。
- 当前运行的所有 Web 应用程序的上下文路径必须是唯一的。因此，您必须使用此上下文路径卸载现有的 Web 应用程序，或者为新应用程序选择不同的上下文路径。可以在 URL 上指定 update 参数，并将其值设置为 true 以避免此错误。在这种情况下，在执行部署之前将对现有应用程序执行卸载操作。
- 遇到异常。尝试启动新 Web 应用程序时遇到异常。检查 Tomcat 日志以获取详细信息，但可能的解释包括在解析 /WEB-INF/web.xml 文件时遇到问题，或者在初始化应用程序事件侦听器和过滤器时遇到丢失的类。

## 从本地路径部署新应用程序

部署并启动一个新的 Web 应用程序，附加到指定的上下文路径（该路径不能由任何其他 Web 应用程序使用）。此命令是 /undeploy 命令的逻辑相反。

此命令由 HTTP GET 请求执行。有多种不同的方法可以使用 deploy 命令。

## 部署先前部署的 Web 应用程序

```
http://localhost:8080/manager/text/deploy?path=/footoo&tag=footag
```

这可以用于部署先前部署的 Web 应用程序，该应用程序已使用 tag 属性部署。请注意，Manager Web 应用程序的工作目录将包含先前部署的 WAR；移除它将导致部署失败。

## 通过 URL 部署目录或 WAR

部署位于 Tomcat 服务器上的 Web 应用程序目录或 ".war" 文件。如果未指定路径，则从目录名称或 war 文件名称派生路径和版本。war 参数指定一个 URL（包括 file: 方案），用于目录或 Web 应用程序存档（WAR）文件。有关引用 WAR 文件的 URL 的支持语法，请参阅 java.net.JarURLConnection 类的 Javadoc 页面。仅使用引用整个 WAR 文件的 URL。

在此示例中，位于 Tomcat 服务器上的目录 /path/to/foo 中的 Web 应用程序被部署为名为 /footoo 的 Web 应用程序上下文。

```
http://localhost:8080/manager/text/deploy?path=/footoo&war=file:/path/to/foo
```

在此示例中，位于 Tomcat 服务器上的 ".war" 文件 /path/to/bar.war 被部署为名为 /bar 的 Web 应用程序上下文。请注意，没有路径参数，因此上下文路径默认为不包含 ".war" 扩展名的 Web 应用程序存档文件的名称。

```
http://localhost:8080/manager/text/deploy?war=file:/path/to/bar.war
```

## 从 Host appBase 部署目录或 WAR

部署位于 Host appBase 目录中的 Web 应用程序目录或 ".war" 文件。路径和可选版本是从目录或 war 文件名称派生的。

在此示例中，位于 Tomcat 服务器的 Host appBase 目录中的名为 foo 的子目录中的 Web 应用程序被部署为名为 /foo 的 Web 应用程序上下文。请注意，所使用的上下文路径是 Web 应用程序目录的名称。

```
http://localhost:8080/manager/text/deploy?war=foo
```

在此示例中，位于 Tomcat 服务器的 Host appBase 目录中的名为 bar.war 的 ".war" 文件被部署为名为 /bar 的 Web 应用程序上下文。

```
http://localhost:8080/manager/text/deploy?war=bar.war
```

## 使用 Context 配置 ".xml" 文件部署

如果 Host 的 deployXML 标志设置为 true，则可以使用 Context 配置 ".xml" 文件以及可选的 ".war" 文件或 Web 应用程序目录部署 Web 应用程序。部署 Web 应用程序使用上下文 ".xml" 配置文件时，不使用上下文路径。

Context 配置 ".xml" 文件可以包含有效的 XML，用于 Web 应用程序上下文，就像它在 Tomcat server.xml 配置文件中配置一样。以下是一个示例：

```xml
<Context path="/foobar" docBase="/path/to/application

/foobar">
</Context>
```

当可选的 war 参数设置为 Web 应用程序 ".war" 文件或目录的 URL 时，它将覆盖上下文配置 ".xml" 文件中配置的任何 docBase。

以下是使用 Context 配置 ".xml" 文件部署应用程序的示例。

```
http://localhost:8080/manager/text/deploy?config=file:/path/context.xml
```

以下是使用 Context 配置 ".xml" 文件和位于服务器上的 Web 应用程序 ".war" 文件部署应用程序的示例。

```
http://localhost:8080/manager/text/deploy?config=file:/path/context.xml&war=file:/path/bar.war
```

# 部署说明

如果主机配置为 unpackWARs=true 并且您部署了一个 WAR 文件，则该 WAR 文件将解压缩到主机 appBase 目录中的一个目录中。

如果应用程序 WAR 文件或目录安装在主机 appBase 目录中，并且主机配置了 autoDeploy=true，或者上下文路径必须与目录名称或不带 ".war" 扩展名的 WAR 文件名匹配。

为了安全起见，当不受信任的用户可以管理 Web 应用程序时，可以将主机 deployXML 标志设置为 false。这可以防止不受信任的用户使用配置 XML 文件部署 Web 应用程序，并且还可以防止他们部署位于其主机 appBase 之外的应用程序目录或 ".war" 文件。

## 部署响应

如果安装和启动成功，您将收到如下响应：

```
OK - Deployed application at context path /foo
```

否则，响应将以 FAIL 开头，并包含一个错误消息。可能导致问题的原因包括：

- 在路径 /foo 处已存在应用程序。
- 当前运行的所有 Web 应用程序的上下文路径必须是唯一的。因此，您必须使用此上下文路径卸载现有的 Web 应用程序，或者为新应用程序选择不同的上下文路径。可以在 URL 上指定 update 参数，并将其值设置为 true 以避免此错误。在这种情况下，在执行部署之前将对现有应用程序执行卸载操作。
- 文档基目录不存在或不是可读目录。
- 遇到异常。尝试启动新 Web 应用程序时遇到异常。检查 Tomcat 日志以获取详细信息，但可能的解释包括在解析 /WEB-INF/web.xml 文件时遇到问题，或者在初始化应用程序事件侦听器和过滤器时遇到丢失的类。
- 指定了无效的应用程序 URL。您指定的目录或 Web 应用程序的 URL 无效。此类 URL 必须以 file: 开头，WAR 文件的 URL 必须以 ".war" 结尾。
- 指定了无效的上下文路径。上下文路径必须以斜杠字符开头。要引用 ROOT Web 应用程序，请使用 "/"。
- 上下文路径必须与目录或 WAR 文件名匹配。如果应用程序 WAR 文件或目录安装在主机 appBase 目录中，并且主机配置了 autoDeploy=true，上下文路径必须与目录名称或不带 ".war" 扩展名的 WAR 文件名匹配。
- 只能安装主机 Web 应用程序目录中的 Web 应用程序。如果主机 deployXML 标志设置为 false，则如果尝试部署位于主机 appBase 目录之外的 Web 应用程序目录或 ".war" 文件，将会发生此错误。

## 当前已部署应用程序列表

```
http://localhost:8080/manager/text/list
```

列出当前部署的所有 Web 应用程序的上下文路径、当前状态（正在运行或已停止）和活动会话数。在启动 Tomcat 后立即获得的典型响应可能如下所示：

```
OK - Listed applications for virtual host localhost
/webdav:running:0:webdav
/examples:running:0:examples
/manager:running:0:manager
/:running:0:ROOT
/test:running:0:test##2
/test:running:0:test##1
```

## 重新加载现有应用程序

```
http://localhost:8080/manager/text/reload?path=/examples
```

信号一个现有应用程序关闭并重新加载。当 Web 应用程序上下文不可重新加载，并且您已更新 /WEB-INF/classes 目录中的类或属性文件，或者当您已在 /WEB-INF/lib 目录中添加或更新了 jar 文件时，这可能会很有用。

如果此命令成功，您将看到如下响应：

```
OK - Reloaded application at context path /examples
```

否则，响应将以 FAIL 开头，并包含一个错误消息。可能导致问题的原因包括：

- 遇到异常。尝试重新启动 Web 应用程序时遇到异常。检查 Tomcat 日志以获取详细信息。

- 指定了无效的上下文路径。上下文路径必须以斜杠字符开头。要引用 ROOT Web 应用程序，请使用 "/"。

- 路径 /foo 没有上下文存在。没有部署在您指定的上下文路径上的应用程序。

- 未指定上下文路径。路径参数是必需的。

- 在路径 /foo 部署的 WAR 上不支持重新加载。目前，当直接从 WAR 文件部署 Web 应用程序时，不支持应用程序重新加载（以获取类或 web.xml 文件的更改）。仅当从解压缩的目录部署 Web 应用程序时才起作用。如果使用 WAR 文件，则应该先卸载，然后再次部署或使用 update 参数重新部署应用程序以获取您的更改。

# 列出操作系统和 JVM 属性

```
http://localhost:8080/manager/text/serverinfo
```

列出有关 Tomcat 版本、操作系统和 JVM 属性的信息。

如果发生错误，响应将以 FAIL 开头，并包含错误消息。可能导致问题的原因包括：

- 遇到异常。尝试枚举系统属性时遇到异常。检查 Tomcat 日志以获取详细信息。

# 列出可用的全局 JNDI 资源

```
http://localhost:8080/manager/text/resources[?type=xxxxx]
```

列出可用于上下文配置文件中资源链接的全局 JNDI 资源。如果指定了 type 请求参数，则该值必须是您感兴趣的资源类型的完全限定 Java 类名（例如，您可以指定 javax.sql.DataSource 来获取所有可用 JDBC 数据源的名称）。如果不指定 type 请求参数，则将返回所有类型的资源。

根据是否指定了 type 请求参数，正常响应的第一行将是：

```
OK - Listed global resources of all types
```

或

```
OK - Listed global resources of type xxxxx
```

接下来是每个资源的一行。每行由以冒号字符（":"）分隔的字段组成，如下所示：

- 全局资源名称：此全局 JNDI 资源的名称，在 <ResourceLink> 元素的 global 属性中使用。
- 全局资源类型：此全局 JNDI 资源的完全限定 Java 类名。

如果发生错误，响应将以 FAIL 开头，并包含错误消息。可能导致问题的原因包括：

- 遇到异常。尝试枚举全局 JNDI 资源时遇到异常。检查 Tomcat 日志以获取详细信息。
- 没有可用的全局 JNDI 资源。您正在运行的 Tomcat 服务器已配置为没有全局 JNDI 资源。

# 会话统计信息

```
http://localhost:8080/manager/text/sessions?path=/examples
```

显示 Web 应用程序的默认会话超时时间，以及当前活动会话的数量，这些会话在其实际超时时间的一分钟范围内。例如，在重新启动 Tomcat 后，然后执行 /examples Web 应用程序中的一个 JSP 示例，您可能会得到类似以下的内容：

```
OK - Session information for application at context path /examples
Default maximum session inactive interval 30 minutes
<1 minutes: 1 sessions
1 - <2 minutes: 1 sessions
```

# 失效会话

```
http://localhost:8080/manager/text/expire?path=/examples&idle=num
```

显示会话统计信息（类似于上面的 /sessions 命令）并将超过 num 分钟空闲的会话失效。要使所有会话失效，请使用 &idle=0 。

```
OK - Session information for application at context path /examples
Default maximum session inactive interval 30 minutes
1 - <2 minutes: 1 sessions
3 - <4 minutes: 1 sessions
>0 minutes: 2 sessions were expired
```

实际上，/sessions 和 /expire 是相同命令的同义词。区别在于是否存在 idle 参数。

# 启动现有应用程序

```
http://localhost:8080/manager/text/start?path=/examples
```

信号停止的应用程序重新启动，并重新使其可用。例如，如果您的应用程序所需的数据库暂时不可用，则停止和启动是有用的。通常，最好停止依赖于此数据库的 Web 应用程序，而不是让用户持续遇到数据库异常。

如果此命令成功，您将看到如下响应：

```
OK - Started application at context path /examples
```

否则，响应将以 FAIL 开头，并包含错误消息。可能导致问题的原因包括：

- 遇到异常。尝试启动 Web 应用程序时遇到异常。检查 Tomcat 日志以获取详细信息。
- 指定了无效的上下文路径。上下文路径必须以斜杠字符开头。要引用 ROOT Web 应用程序，请使用 "/"。
- 路径 /foo 没有上下文存在。没有部署在您指定的上下文路径上的应用程序。


- 未指定上下文路径。路径参数是必需的。

# 停止现有应用程序

```
http://localhost:8080/manager/text/stop?path=/examples
```

发送信号给现有应用程序，使其不可用，但保持部署状态。任何在应用程序停止时发出的请求将会收到 HTTP 错误 404，并且此应用程序将显示为 "stopped" 在应用程序列表命令中。

如果此命令成功，您将看到如下响应：

```
OK - Stopped application at context path /examples
```

否则，响应将以 FAIL 开头，并包含错误消息。可能导致问题的原因包括：

- 遇到异常。尝试停止 Web 应用程序时遇到异常。检查 Tomcat 日志以获取详细信息。
- 指定了无效的上下文路径。上下文路径必须以斜杠字符开头。要引用 ROOT Web 应用程序，请使用 "/"。
- 路径 /foo 没有上下文存在。没有部署在您指定的上下文路径上的应用程序。
- 未指定上下文路径。路径参数是必需的。

# 卸载现有应用程序

```
http://localhost:8080/manager/text/undeploy?path=/examples
```

警告 - 此命令将删除位于 appBase 目录（通常为 "webapps"）中的任何 Web 应用程序工件。这将删除应用程序的 .WAR 文件（如果存在）、以解压形式部署或从 .WAR 扩展出的应用程序目录以及位于 $CATALINA_BASE/conf/[enginename]/[hostname]/ 目录中的 XML 上下文定义。如果您只是想将应用程序停用，请改用 /stop 命令。

发送信号给现有应用程序，使其优雅地关闭，并将其从 Tomcat 中删除（这也使得此上下文路径可供以后重新使用）。此外，如果位于此虚拟主机的 appBase 目录中存在文档根目录，则该目录将被删除。此命令是 /deploy 命令的逻辑相反。

如果此命令成功，您将看到如下响应：

```
OK - Undeployed application at context path /examples
```

否则，响应将以 FAIL 开头，并包含错误消息。可能导致问题的原因包括：

- 遇到异常。尝试取消部署 Web 应用程序时遇到异常。检查 Tomcat 日志以获取详细信息。
- 指定了无效的上下文路径。上下文路径必须以斜杠字符开头。要引用 ROOT Web 应用程序，请使用 "/"。
- 指定的名称为 /foo 的上下文不存在。没有使用您指定的名称部署的应用程序。
- 未指定上下文路径。路径参数是必需的。


## 使用 JMX 代理 Servlet

### 什么是 JMX 代理 Servlet

JMX 代理 Servlet 是一个轻量级代理，用于获取和设置 Tomcat 内部状态。（或者任何已通过 MBean 公开的类）它的使用方式不太用户友好，但 UI 对于集成命令行脚本进行监视和更改 Tomcat 内部状态非常有帮助。您可以通过代理执行两种操作：获取信息和设置信息。为了真正理解 JMX 代理 Servlet，您应该对 JMX 有一般的了解。如果您不知道 JMX 是什么，那么准备好感到困惑吧。

### JMX 查询命令

JMX 查询命令的形式如下：

```
http://webserver/manager/jmxproxy/?qry=STUFF
```

其中 `STUFF` 是您希望执行的 JMX 查询。例如，以下是您可能希望运行的一些查询：

- `qry=*%3Atype%3DRequestProcessor%2C*` --> 类型为 `RequestProcessor`，这将定位所有可以处理请求并报告其状态的工作进程。
- `qry=*%3Aj2eeType=Servlet%2c*` --> `j2eeType=Servlet`，返回所有已加载的 Servlet。
- `qry=Catalina%3Atype%3DEnvironment%2Cresourcetype%3DGlobal%2Cname%3DsimpleValue` --> `Catalina:type=Environment,resourcetype=Global,name=simpleValue`，按给定名称查找特定的 MBean。

如果不提供 `qry` 参数，则将显示所有 MBean。我们真的建议查看 tomcat 源代码并了解 JMX 规范，以更好地了解您可能运行的所有查询的功能。

### JMX 获取命令

JMXProxyServlet 还支持一个 "get" 命令，您可以使用它来获取特定 MBean 属性的值。获取命令的一般形式如下：

```
http://webserver/manager/jmxproxy/?get=BEANNAME&att=MYATTRIBUTE&key=MYKEY
```

您必须提供以下参数：

- `get`：完整的 bean 名称
- `att`：您希望获取的属性
- `key`：（可选）复合数据 MBean 属性的键

如果一切顺利，那么它会显示 OK，否则将显示错误消息。例如，假设我们希望获取当前的堆内存数据：

```
http://webserver/manager/jmxproxy/?get=java.lang:type=Memory&att=HeapMemoryUsage
```

或者，如果您只想要 "used" 键：

```
http://webserver/manager/jmxproxy/?get=java.lang:type=Memory&att=HeapMemoryUsage&key=used
```

### JMX 设置命令

现在您可以查询 MBean，是时候操作 Tomcat 的内部状态了！设置命令的一般形式是：

```
http://webserver/manager/jmxproxy/?set=BEANNAME&att=MYATTRIBUTE&val=NEWVALUE
```

因此，您需要提供 3 个请求参数：

- `set`：完整的 bean 名称
- `att`：您希望更改的属性
- `val`：新值

如果一切顺利，那么它会显示 OK，否则将显示错误消息。例如，假设我们希望在运行时将 ErrorReportValve 的调试级别提高。以下将把调试级别设置为 10。

```
http://localhost:8080/manager/jmxproxy/
?set=Catalina%3Atype%3DValve%2Cname%3DErrorReportValve%2Chost%3Dlocalhost
&att=debug&val=10
```

我的结果是（您的结果可能有所不同）：

```
Result: ok
```

如果传入了一个错误的值，我看到的是这样的情况。以下是我使用的 URL，我尝试将调试级别设置为 'cow'：

```
http://localhost:8080/manager/jmxproxy/
?set=Catalina%3Atype%3DValve%2Cname%3DErrorReportValve%2Chost%3Dlocalhost
&att=debug&val=cow
```

当我尝试时，我的结果是：

```
Error: java.lang.NumberFormatException: For input string: "cow"
```

### JMX 调用命令

调用命令使得可以在 MBean 上调用方法。命令的一般形式是：

```
http://webserver/manager/jmxproxy/?invoke=BEANNAME&op=METHODNAME&ps=COMMASEPARATEDPARAMETERS
```

例如，要调用 Service 的 findConnectors() 方法，请使用：

```
http://localhost:8080/manager/jmxproxy/
?invoke=Catalina%3Atype%3DService&op=findConnectors&ps=
```

### 使用 Ant 执行 Manager 命令

除了通过 HTTP 请求执行 Manager 命令的能力外，如上所述，Tomcat 还包含了一组方便的 Ant（版本 1.4 或更高版本）构建工具的任务定义。为了使用这些命令，您必须执行以下设置操作：

1. 从 https://ant.apache.org 下载 Ant 的二进制分发版。您必须使用 1.4 版本或更高版本。
2. 在方便的目录中安装 Ant 分发版（在本文档的其余部分中称为 ANT_HOME）。
3. 将 $ANT_HOME/bin 目录添加到您的 PATH 环境变量中。
4. 在 Tomcat 用户数据库中配置至少一个用户名/密码组合，该

组合包括 manager-script 角色。

要在 Ant 中使用自定义任务，您必须首先使用 <import> 元素声明它们。因此，您的 build.xml 文件可能如下所示：

```xml
<project name="My Application" default="compile" basedir=".">

  <!-- 配置 Web 应用程序构建目录 -->
  <property name="build"    value="${basedir}/build"/>

  <!-- 配置此应用程序的上下文路径 -->
  <property name="path"     value="/myapp"/>

  <!-- 配置用于访问 Manager 应用程序的属性 -->
  <property name="url"      value="http://localhost:8080/manager/text"/>
  <property name="username" value="myusername"/>
  <property name="password" value="mypassword"/>

  <!-- 配置 Tomcat 安装路径 -->
  <property name="catalina.home" value="/usr/local/apache-tomcat"/>

  <!-- 配置 Manager 应用程序的自定义 Ant 任务 -->
  <import file="${catalina.home}/bin/catalina-tasks.xml"/>

  <!-- 可执行目标 -->
  <target name="compile" description="Compile web application">
    <!-- ... 在 ${build} 子目录中构建 Web 应用程序，并生成 ${path}.war ... -->
  </target>

  <target name="deploy" description="Install web application"
          depends="compile">
    <deploy url="${url}" username="${username}" password="${password}"
            path="${path}" war="file:${build}${path}.war"/>
  </target>

  <target name="reload" description="Reload web application"
          depends="compile">
    <reload  url="${url}" username="${username}" password="${password}"
            path="${path}"/>
  </target>

  <target name="undeploy" description="Remove web application">
    <undeploy url="${url}" username="${username}" password="${password}"
            path="${path}"/>
  </target>

</project>
```

注意：通过上面的导入定义资源任务会覆盖 Ant 1.7 中添加的资源数据类型。

如果您希望使用资源数据类型，您需要使用 Ant 的命名空间支持修改 catalina-tasks.xml 将 Tomcat 任务分配给它们自己的命名空间。

现在，您可以执行像 `ant deploy` 这样的命令来将应用程序部署到运行中的 Tomcat 实例，或者 `ant reload` 来告诉 Tomcat 重新加载它。另请注意，此 build.xml 文件中的大多数有趣的值都被定义为可替换属性，因此您可以从命令行覆盖它们的值。例如，您可能认为在 build.xml 文件的源代码中包含真实的 manager 密码是一种安全风险。

为了避免这种情况，请省略 password 属性，并从命令行指定它：

```
ant -Dpassword=secret deploy
```

## 任务输出捕获

使用 Ant 版本 1.6.2 或更高版本，Catalina 任务提供了在属性或外部文件中捕获它们的输出的选项。它们直接支持 `<redirector>` 类型属性的以下子集：

| 属性 | 描述 | 是否必需 |
| --- | --- | --- |
| output | 要写入输出的文件的名称。如果错误流也没有被重定向到文件或属性，它将显示在此输出中。 | 否 |
| error | 命令的标准错误应重定向到的文件。 | 否 |
| logError | 当您希望在 Ant 的日志中看到错误输出时，以及当您将输出重定向到文件/属性时使用此属性。错误输出将不包含在输出文件/属性中。如果使用 error 或 errorProperty 属性重定向错误，这将不起作用。 | 否 |
| append | 输出和错误文件是否应追加还是覆盖。默认为 false。 | 否 |
| createemptyfiles | 即使为空，输出和错误文件是否应创建。默认为 true。 | 否 |
| outputproperty | 命令的输出应存储在其中的属性名称。除非将错误流重定向到单独的文件或流，否则此属性将包含错误输出。 | 否 |
| errorproperty | 命令的标准错误应存储在其中的属性名称。 | 否 |

还可以指定一些其他属性：

| 属性 | 描述 | 是否必需 |
| --- | --- | --- |
| alwaysLog | 当您希望在 Ant 的日志中看到您正在捕获的输出时，使用此属性。除非您正在捕获任务输出，否则不能使用它。默认为 false。在 Ant 1.6.3 中，该属性将由 `<redirector>` 直接支持。 | 否 |
| failonerror | 当您希望避免任何管理器命令处理错误终止 ant 执行时使用此属性。默认为 true。如果您想要捕获错误输出，则必须将其设置为 false，否则在捕获任何内容之前，执行将终止。此属性仅对管理器命令执行起作用，任何错误或缺失的命令属性仍将导致 Ant 执行终止。 | 否 |

它们还支持嵌入的 `<redirector>` 元素，在其中可以指定其完整的属性集，但输入、inputstring 和 inputencoding 即使被接受，也不会被使用，因为在这种情况下没有意义。

有关 `<redirector>` 元素属性的详细信息，请参阅 Ant 手册。

以下是显示如何使用此输出重定向支持的示例构建文件片段：

```xml
<target name="manager.deploy"
    depends="context.status"
    if="context.notInstalled">
    <deploy url="${mgr.url}"
        username="${mgr.username}"
        password="${mgr.password}"
        path="${mgr.context.path}"
        config="${mgr.context.descriptor}"/>
</target>

<target name="manager.deploy.war"
    depends="context.status"
    if="context.deployable">
    <deploy url="${mgr.url}"
        username="${mgr.username}"
        password="${mgr.password}"
        update="${mgr.update}"
        path="${mgr.context.path}"
        war="${mgr.war.file}"/>
</target>

<target name="context.status">
    <property name="running" value="${mgr.context.path}:running"/>
    <property name="stopped" value="${mgr.context.path}:stopped"/>

    <list url="${mgr.url}"
        outputproperty="ctx.status"
        username="${mgr.username}"
        password="${mgr.password}">
    </list>

    <condition property="context.running">
        <contains string="${ctx.status}" substring="${running}"/>
    </condition>
    <condition property="context.stopped">
        <contains string="${ctx.status}" substring="${stopped}"/>
    </condition>
    <condition property="context.notInstalled">
        <and>
            <isfalse value="${context.running}"/>
            <isfalse value="${context.stopped}"/>
        </and>
    </condition>
    <condition property="context.deployable">
        <or>
            <istrue value="${context.notInstalled}"/>
            <and>
                <istrue value="${context.running}"/>
                <istrue value="${mgr.update}"/>
            </and>
            <and>
                <istrue value="${context.stopped}"/>
                <istrue value="${mgr.update}"/>
            </and>
        </or>
    </condition>
    <condition property="context.undeployable">
        <or>
            <istrue value="${context.running}"/>
            <istrue value="${context.stopped}"/>
        </or>
    </condition>
</target>
```

**警告：** 即使它没有太多意义，并且总是一个坏主意，调用一个 Catalina 任务多次，设置不良的 Ant 任务依赖链可能会导致在同一个 Ant 运行中调用一个任务多次，即使不是故意的。当您从该任务捕获输出时，应该小心，因为这可能会导致意外的结果：

- 当在属性中捕获时，您将只在第一次调用时找到输出，因为 Ant 属性是不可变的，一旦设置就无法更改。

- 当在文件中捕获时，每次运行都会覆盖它，您将只在最后一次调用输出中找到它，除非您使用 append="true" 属性，在这种情况下，您将看到每个任务调用的输出都附加到文件中。

# 参考资料

https://tomcat.apache.org/tomcat-11.0-doc/deployer-howto.html

* any list
{:toc}