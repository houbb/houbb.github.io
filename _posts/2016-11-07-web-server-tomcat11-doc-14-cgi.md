---
layout: post
title: web server apache tomcat11-14-CGI
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


**Introduction**

CGI (Common Gateway Interface) 定义了 Web 服务器与外部内容生成程序（通常称为 CGI 程序或 CGI 脚本）交互的方式。

在 Tomcat 中，当您将 Tomcat 用作 HTTP 服务器并且需要 CGI 支持时，可以添加 CGI 支持。通常在开发期间进行这样的操作，当您不想运行诸如 Apache httpd 等网络服务器时。Tomcat 的 CGI 支持与 Apache httpd 的兼容性很高，但有一些限制（例如，只有一个 cgi-bin 目录）。

CGI 支持是使用 servlet 类 org.apache.catalina.servlets.CGIServlet 实现的。传统上，将此 servlet 映射到 URL 模式 "/cgi-bin/*"。

默认情况下，Tomcat 中禁用了 CGI 支持。

### 安装

注意 - CGI 脚本用于执行 Tomcat JVM 外部的程序。

要启用 CGI 支持：

在默认的 $CATALINA_BASE/conf/web.xml 文件中有注释的示例 servlet 和 servlet-mapping 元素，用于 CGI servlet。要在 Web 应用程序中启用 CGI 支持，请将该 servlet 和 servlet-mapping 声明复制到 Web 应用程序的 WEB-INF/web.xml 文件中。

取消注释 $CATALINA_BASE/conf/web.xml 文件中的 servlet 和 servlet-mapping 可以一次为所有已安装的 Web 应用程序启用 CGI。

在您的 Web 应用程序的 Context 元素上设置 privileged="true"。

只有标记为特权的 Context 才允许使用 CGI servlet。请注意，修改全局的 $CATALINA_BASE/conf/context.xml 文件会影响所有 Web 应用程序。有关详细信息，请参阅 Context 文档。

### 配置

有几个 servlet init 参数可用于配置 CGI servlet 的行为。

- cgiMethods - 逗号分隔的 HTTP 方法列表。使用这些方法之一的请求将被传递给 CGI 脚本以生成响应。默认值为 GET,POST。使用 * 可以使脚本处理所有请求，而不管方法如何。除非被该参数的配置覆盖，否则使用 HEAD、OPTIONS 或 TRACE 的请求将由超类处理。
- cgiPathPrefix - CGI 搜索路径将从 web 应用程序根目录 + File.separator + 此前缀开始。默认情况下没有值，这将导致将 web 应用程序根目录用作搜索路径。建议的值是 WEB-INF/cgi。
- cmdLineArgumentsDecoded - 如果启用了命令行参数（通过 enableCmdLineArguments）并且 Tomcat 在 Windows 上运行，则每个解码的命令行参数必须匹配此模式，否则请求将被拒绝。这是为了防止已知问题从 Java 传递命令行参数到 Windows。这些问题可能导致远程代码执行。有关这些问题的更多信息，请参阅 Markus Wulftange 的博客和 Daniel Colascione 的存档博客。
- cmdLineArgumentsEncoded - 如果启用了命令行参数（通过 enableCmdLineArguments），则每个已编码的命令行参数必须匹配此模式，否则请求将被拒绝。默认匹配 RFC3875 定义的允许值，格式为 [\w\Q%;/?:@&,$-.!~*'()\E]+。
- enableCmdLineArguments - 是否从查询字符串生成命令行参数，参见 RFC 3875 第 4.4 节？默认值为 false。
- environment-variable- - 要设置为 CGI 脚本执行环境的环境。变量的名称取自参数名称。要配置名为 FOO 的环境变量，请配置名为 environment-variable-FOO 的参数。参数值将用作环境变量值。默认情况下没有环境变量。
- executable - 用于运行脚本的可执行文件的名称。如果脚本本身是可执行的（例如，exe 文件），则可以将此参数明确设置为空字符串。默认为 perl。
- executable-arg-1、executable-arg-2 等 - 可执行文件的其他参数。这些参数在 CGI 脚本名称之前。默认情况下没有其他参数。
- envHttpHeaders - 用于选择作为环境变量传递给 CGI 进程的 HTTP 标头的正则表达式。请注意，在匹配之前标头会转换为大写，并且整个标头名称必须与模式匹配。默认值为 `ACCEPT[-0-9A-Z]*|CACHE-CONTROL|COOKIE|HOST|IF-[-0-9A-Z]*|REFERER|USER-AGENT`。
- parameterEncoding - 用于 CGI servlet 的参数编码的名称。默认值为 System.getProperty("file.encoding","UTF-8")。即系统默认编码，如果该系统属性不可用，则为 UTF-8。
- passShellEnvironment - 是否应将来自 Tomcat 进程的 shell 环境变量（如果有）传递给 CGI 脚本？默认为 false。
- stderrTimeout - 在终止 CGI 进程之前等待读取 stderr 完成的时间（以毫秒为单位）。默认为 2000。

执行的 CGI 脚本取决于 CGI Servlet 的配置以及请求如何映射到 CGI Servlet。CGI 搜索路径从 web 应用程序根目录 + File.separator + cgiPathPrefix 开始。然后搜索 pathInfo（如果不为 null），否则搜索 servletPath。

搜索从第一个路径段开始，并逐个扩展一个路径段，直到不再剩余路径段（导致 404）或找到脚本。任何剩余的路径段都将作为 PATH_INFO 环境变量传递给脚本。


# 参考资料

https://tomcat.apache.org/tomcat-11.0-doc/cgi-howto.html

* any list
{:toc}