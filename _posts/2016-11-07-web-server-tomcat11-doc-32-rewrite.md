---
layout: post
title: web server apache tomcat11-32-rewrite
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


# Rewrite Valve 重写阀门

## 介绍
重写阀门实现了 URL 重写功能，与 Apache HTTP Server 中的 mod_rewrite 非常相似。

## 配置
重写阀门配置为使用 org.apache.catalina.valves.rewrite.RewriteValve 类名的阀门。

重写阀门可以配置为作为 Host 中添加的阀门。有关如何配置的信息，请参阅虚拟服务器文档。它将使用一个包含重写指令的 rewrite.config 文件，必须放置在 Host 配置文件夹中。

它也可以在 webapp 的 context.xml 中。然后阀门将使用一个包含重写指令的 rewrite.config 文件，它必须放置在 web 应用程序的 WEB-INF 文件夹中。

## 指令
rewrite.config 文件包含一系列指令，这些指令与 mod_rewrite 中使用的指令非常相似，特别是中心的 RewriteRule 和 RewriteCond 指令。以 # 字符开头的行被视为注释，并将被忽略。

注意：本节是 mod_rewrite 文档的修改版本，版权归 1995-2006 年间的 Apache Software Foundation 所有，并根据 Apache License，Version 2.0 许可。

### RewriteCond
语法：RewriteCond TestString CondPattern

RewriteCond 指令定义了一个规则条件。一个或多个 RewriteCond 可以在 RewriteRule 指令之前。然后只有当 URI 的当前状态与其模式匹配，并且满足这些条件时，才使用以下规则。

TestString 是一个字符串，除了纯文本外，还可以包含以下扩展结构：

- RewriteRule 反向引用：这些是形式为 $N（0 <= N <= 9）的反向引用，提供对模式的分组部分（括号内）的访问，从当前一组 RewriteCond 条件中的 RewriteRule 中。
- RewriteCond 反向引用：这些是形式为 %N（1 <= N <= 9）的反向引用，提供对模式的分组部分（同样是在括号内）的访问，从当前条件组中的最后一个匹配的 RewriteCond 中。
- RewriteMap 扩展：这些是形式为 ${mapname:key|default} 的扩展。有关更多详细信息，请参阅 RewriteMap 的文档。
- 服务器变量：这些是形式为 %{NAME_OF_VARIABLE} 的变量，其中 NAME_OF_VARIABLE 可以是以下列表中提取的字符串：
  - HTTP headers：
    - HTTP_USER_AGENT
    - HTTP_REFERER
    - HTTP_COOKIE
    - HTTP_FORWARDED
    - HTTP_HOST
    - HTTP_PROXY_CONNECTION
    - HTTP_ACCEPT
  - 连接和请求：
    - REMOTE_ADDR
    - REMOTE_HOST
    - REMOTE_PORT
    - REMOTE_USER
    - REMOTE_IDENT
    - REQUEST_METHOD
    - SCRIPT_FILENAME
    - REQUEST_PATH
    - CONTEXT_PATH
    - SERVLET_PATH
    - PATH_INFO
    - QUERY_STRING
    - AUTH_TYPE
  - 服务器内部：
    - DOCUMENT_ROOT
    - SERVER_NAME
    - SERVER_ADDR
    - SERVER_PORT
    - SERVER_PROTOCOL
    - SERVER_SOFTWARE
  - 日期和时间：
    - TIME_YEAR
    - TIME_MON
    - TIME_DAY
    - TIME_HOUR
    - TIME_MIN
    - TIME_SEC
    - TIME_WDAY
    - TIME
  - 特殊项：
    - THE_REQUEST
    - REQUEST_URI
    - REQUEST_FILENAME
    - HTTPS

这些变量都对应于相应命名的 HTTP MIME 头和 Servlet API 方法。大多数在本手册的其他地方或 CGI 规范中有文档。对于重写阀门特有的那些，包括以下内容。

- REQUEST_PATH：对应于用于映射的完整路径。
- CONTEXT_PATH：对应于映射上下文的路径。
- SERVLET_PATH：对应于 Servlet 路径。
- THE_REQUEST：浏览器发送到服务器的完整 HTTP 请求行（例如，“GET /index.html HTTP/1.1”）。这不包括浏览器发送的任何其他头。
- REQUEST_URI：HTTP 请求行中请求的资源。 （在上面的示例中，这将是“/index.html”）。
- REQUEST_FILENAME：匹配请求的文件或脚本的完整本地文件系统路径。
- HTTPS：如果连接使用 SSL/TLS，则将包含文本“on”，否则为“off”。

你还应该注意以下事项：

- 变量 SCRIPT_FILENAME 和 REQUEST_FILENAME 包含相同的值 - Apache 服务器内部 request_rec 结构的 filename 字段的值。第一个名称是常用的 CGI 变量名，而第二个是 REQUEST_URI 的适

当对应项（其中包含 request_rec 的 uri 字段的值）。
- %{ENV:variable}，其中 variable 可以是任何 Java 系统属性，也是可用的。
- %{SSL:variable}，其中 variable 是 SSL 环境变量的名称，已实现，但除了 SSL_SESSION_RESUMED、SSL_SECURE_RENEG、SSL_COMPRESS_METHOD、SSL_TLS_SNI、SSL_SRP_USER、SSL_SRP_USERINFO、SSL_CLIENT_VERIFY、SSL_CLIENT_SAN_OTHER_msUPN_n、SSL_CLIENT_CERT_RFC4523_CEA 等与服务器证书相关的变量外。使用 OpenSSL 时，以 SSL_SERVER_ 为前缀的变量不可用。例如：%{SSL:SSL_CIPHER_USEKEYSIZE} 可以扩展为 128。
- %{HTTP:header}，其中 header 可以是任何 HTTP MIME 头名称，始终可以用于获取 HTTP 请求中发送的头的值。例如：%{HTTP:Proxy-Connection} 是 HTTP 头 'Proxy-Connection:' 的值。

CondPattern 是条件模式，一个正则表达式，它应用于当前 TestString 的实例。首先评估 TestString，然后与 CondPattern 匹配。

记住：CondPattern 是一个 Perl 兼容的正则表达式，带有一些附加功能：

- 您可以使用 '!' 字符（叹号）作为模式字符串的前缀来指定非匹配模式。
- 有一些 CondPattern 的特殊变体。您还可以使用以下之一而不是真实的正则表达式字符串：
  - `<CondPattern`（词法上较小）
  - `>CondPattern`（词法上较大）
  - '=CondPattern'（词法上相等）
  - '-d'（是目录）
  - '-f'（是常规文件）
  - '-s'（是常规文件，带有大小）
  
这些测试的所有结果也可以用感叹号 ('!') 作为前缀来否定它们的含义。

您还可以通过将 [flags] 作为 RewriteCond 指令的第三个参数附加，其中 flags 是以下任何一个或多个逗号分隔的列表中的任何一个，来设置 CondPattern 的特殊标志：
- 'nocase|NC'（不区分大小写）
- 'ornext|OR'（下一个条件）
  
示例：

要根据请求的 'User-Agent:' 标头重写站点的首页，您可以使用以下内容：

```
RewriteCond %{HTTP_USER_AGENT} ^Mozilla.*
RewriteRule ^/$ /homepage.max.html [L]

RewriteCond %{HTTP_USER_AGENT} ^Lynx.*
RewriteRule ^/$ /homepage.min.html [L]

RewriteRule ^/$ /homepage.std.html [L]
```

解释：如果使用将自身标识为 'Mozilla' 的浏览器（包括 Netscape Navigator、Mozilla 等），则获得 max 首页（可能包括帧或其他特殊功能）。

如果使用 Lynx 浏览器（基于终端），则获得 min 首页（可能是专为简单的纯文本浏览而设计的版本）。

如果这些条件都不适用（使用任何其他浏览器，或者您的浏览器将自身标识为非标准内容），则获得 std（标准）首页。

# 参考资料

https://tomcat.apache.org/tomcat-11.0-doc/rewrite.html

* any list
{:toc}