---
layout: post
title: web server apache tomcat11-13-SSI How To
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

## SSI

Server Side Includes (SSI) 是一种在 HTML 页面中放置的指令，在服务器上评估页面时执行。

它们允许您向现有的 HTML 页面添加动态生成的内容，而无需通过 CGI 程序或其他动态技术提供整个页面。

在 Tomcat 中，当您将 Tomcat 用作 HTTP 服务器并且需要 SSI 支持时，可以添加 SSI 支持。通常在开发期间进行这样的操作，当您不想运行诸如 Apache 等网络服务器时。

Tomcat 的 SSI 支持实现了与 Apache 相同的 SSI 指令。有关使用 SSI 指令的信息，请参阅 Apache SSI 介绍。

SSI 支持可作为 servlet 和过滤器提供。您应该使用其中一种来提供 SSI 支持，但不要同时使用两者。

基于 Servlet 的 SSI 支持是使用类 org.apache.catalina.ssi.SSIServlet 实现的。传统上，将此 servlet 映射到 URL 模式 "*.shtml"。

基于过滤器的 SSI 支持是使用类 org.apache.catalina.ssi.SSIFilter 实现的。传统上，将此过滤器映射到 URL 模式 "*.shtml"，尽管它可以映射到 "*"，因为它将基于 MIME 类型选择性地启用/禁用 SSI 处理。contentType 初始参数允许您将 SSI 处理应用于 JSP 页面、JavaScript 或任何其他您希望的内容。

默认情况下，Tomcat 中禁用了 SSI 支持。

### 安装

注意 - SSI 指令可用于执行Tomcat JVM 外部的程序。

要使用 SSI servlet，请从 $CATALINA_BASE/conf/web.xml 中删除围绕 SSI servlet 和 servlet-mapping 配置的 XML 注释。

要使用 SSI 过滤器，请从 $CATALINA_BASE/conf/web.xml 中删除围绕 SSI 过滤器和 filter-mapping 配置的 XML 注释。

只有标记为特权的上下文才能使用 SSI 功能（请参阅 Context 元素的 privileged 属性）。

### Servlet 配置

有几个 servlet init 参数可用于配置 SSI servlet 的行为。

- buffered - 此 servlet 的输出是否应该被缓冲？（0=false, 1=true）默认值为 0（false）。
- debug - 此 servlet 记录的消息的调试详细级别。默认为 0。
- expires - 具有 SSI 指令的页面过期之前的秒数。默认行为是为每个请求评估所有 SSI 指令。
- isVirtualWebappRelative - "虚拟" SSI 指令路径是否应被解释为相对于上下文根，而不是服务器根？默认值为 false。
- inputEncoding - 如果无法从资源本身确定编码，则假定用于 SSI 资源的编码。默认为默认平台编码。
- outputEncoding - 用于 SSI 处理结果的编码。默认为 UTF-8。
- allowExec - 是否启用 exec 命令？默认为 false。

### 过滤器配置

有几个过滤器 init 参数可用于配置 SSI 过滤器的行为。

- contentType - 必须匹配的正则表达式模式，然后才能应用 SSI 处理。在构建自己的模式时，不要忘记 MIME 内容类型后面可能跟随的可选字符集，格式为 "mime/type; charset=set"。默认为 "text/x-server-parsed-html(;.*)?"。
- debug - 此过滤器记录的消息的调试详细级别。默认为 0。
- expires - 具有 SSI 指令的页面过期之前的秒数。默认行为是为每个请求评估所有 SSI 指令。
- isVirtualWebappRelative - "虚拟" SSI 指令路径是否应被解释为相对于上下文根，而不是服务器根？默认值为 false。
- allowExec - 是否启用 exec 命令？默认为 false。

### 指令

通过将 SSI 指令嵌入到由 SSI servlet 处理的 HTML 文档中来调用 Server Side Includes。指令采用 HTML 注释的形式。将指令替换为在将页面发送到客户端之前解释它的结果。指令的一般形式为：

```
<!--#directive [param=value] -->
```

指令包括：

- config - 用于设置 SSI 错误消息、由 SSI 处理的文件大小和日期格式的 SSI 错误消息。
- echo - 将被变量的值替换。
- exec - 用于在主机系统上运行命令。
- include - 插入内容。
- flastmod - 返回文件上次修改的时间。
- fsize - 返回文件大小。
- printenv - 返回所有已定义变量的列表。
- set - 用于将值赋给用户定义的变量。
- if、elif、endif、else - 用于创建条件部分。

有关使用 SSI 指令的更多信息，请参阅 Apache SSI 介绍。

### 变量

SSI 变量通过 jakarta.servlet.ServletRequest 对象上的请求属性实现，并不限于 SSI servlet。以 "java."、"javax."、"sun" 或 "org.apache.catalina.ssi.SSIMediator." 开头的变量名称为保留变量，不能使用。

SSI servlet 当前实现了以下变量：

（变量名 - 描述）

- AUTH_TYPE - 用户的身份验证类型：BASIC、FORM 等。
- CONTENT_LENGTH - 从表单传递的数据的长度（以字节或字符数）。
- CONTENT_TYPE - 查询数据的 MIME 类型，例如 "text/html"。
- DATE_GMT - GMT 中的当前日期和时间。
- DATE_LOCAL - 本地时区中的当前日期和时间。
- DOCUMENT_NAME

 - 当前文件。
- DOCUMENT_URI - 文件的虚拟路径。
- GATEWAY_INTERFACE - 服务器使用的通用网关接口的修订版本（如果已启用）："CGI/1.1"。
- HTTP_ACCEPT - 客户端可以接受的 MIME 类型列表。
- HTTP_ACCEPT_ENCODING - 客户端可以接受的压缩类型列表。
- HTTP_ACCEPT_LANGUAGE - 客户端可以接受的语言列表。
- HTTP_CONNECTION - 客户端连接管理方式："Close" 或 "Keep-Alive"。
- HTTP_HOST - 客户端请求的网站。
- HTTP_REFERER - 客户端链接的文档的 URL。
- HTTP_USER_AGENT - 客户端用于发出请求的浏览器。
- LAST_MODIFIED - 当前文件的上次修改日期和时间。
- PATH_INFO - 传递给 servlet 的额外路径信息。
- PATH_TRANSLATED - 变量 PATH_INFO 的翻译版本。
- QUERY_STRING - URL 中 "?" 后面的查询字符串。
- QUERY_STRING_UNESCAPED - 所有已解码的查询字符串，其中所有 shell 元字符都已使用 "\" 转义。
- REMOTE_ADDR - 发出请求的用户的远程 IP 地址。
- REMOTE_HOST - 发出请求的用户的远程主机名。
- REMOTE_PORT - 发出请求的用户的远程 IP 地址的端口号。
- REMOTE_USER - 用户的经过身份验证的名称。
- REQUEST_METHOD - 发出信息请求的方法："GET"、"POST" 等。
- REQUEST_URI - 客户端最初请求的网页。
- SCRIPT_FILENAME - 服务器上当前网页的位置。
- SCRIPT_NAME - 网页的名称。
- SERVER_ADDR - 服务器的 IP 地址。
- SERVER_NAME - 服务器的主机名或 IP 地址。
- SERVER_PORT - 服务器接收请求的端口号。
- SERVER_PROTOCOL - 服务器使用的协议。例如，"HTTP/1.1"。
- SERVER_SOFTWARE - 正在响应客户端请求的服务器软件的名称和版本。
- UNIQUE_ID - 用于标识当前会话的令牌（如果已建立会话）。



# 参考资料

https://tomcat.apache.org/tomcat-11.0-doc/ssl-howto.html

* any list
{:toc}