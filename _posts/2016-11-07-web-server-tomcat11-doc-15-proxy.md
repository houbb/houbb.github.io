---
layout: post
title: web server apache tomcat11-15-proxy
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

### 代理支持如何操作

#### 介绍

在使用标准配置的 Tomcat 时，Web 应用程序可以请求处理请求的服务器名称和端口号。

当 Tomcat 以 HTTP/1.1 连接器独立运行时，它通常报告请求中指定的服务器名称和连接器侦听的端口号。

关键的 servlet API 调用包括：

- `ServletRequest.getServerName()`: 返回发送请求的服务器的主机名。

- `ServletRequest.getServerPort()`: 返回发送请求的服务器的端口号。

- `ServletRequest.getLocalName()`: 返回接收请求的 IP 接口的主机名。

- `ServletRequest.getLocalPort()`: 返回接收请求的 IP 接口的端口号。

然而，当在代理服务器后运行时（或将 Web 服务器配置为代理），您可能希望管理这些调用返回的值。

#### Apache httpd 代理支持

Apache httpd 1.3 版及更高版本支持一个可选的模块（mod_proxy），该模块配置 Web 服务器以充当代理服务器。这可以用于将特定 Web 应用程序的请求转发到 Tomcat 实例，而无需配置像 mod_jk 这样的 Web 连接器。要实现这一点，您需要执行以下任务：

1. 配置您的 Apache 副本，以包含 mod_proxy 模块。如果您从源代码构建，则最简单的方法是在 ./configure 命令行上包含 --enable-module=proxy 指令。
2. 如果尚未为您添加，请确保在 Apache 启动时通过在 httpd.conf 文件中使用以下指令加载 mod_proxy 模块：

   ```
   LoadModule proxy_module {path-to-modules}/mod_proxy.so
   ```
   
3. 对于您希望转发到 Tomcat 的每个 Web 应用程序，在 httpd.conf 文件中包含两个指令。例如，要转发上下文路径为 /myapp 的应用程序：

   ```
   ProxyPass         /myapp  http://localhost:8081/myapp
   ProxyPassReverse  /myapp  http://localhost:8081/myapp
   ```

   这告诉 Apache 将形如 http://localhost/myapp/* 的 URL 转发到端口 8081 上侦听的 Tomcat 连接器。

4. 配置您的 Tomcat 副本以包含一个特殊的 `<Connector>` 元素，并具有适当的代理设置，例如：

   ```
   <Connector port="8081" ...
                 proxyName="www.mycompany.com"
                 proxyPort="80"/>
   ```

   这将导致此 Web 应用程序中的 Servlet 认为所有代理请求都是发往 www.mycompany.com 的端口 80。

可以省略 `<Connector>` 元素中的 proxyName 属性。如果您这样做，则 request.getServerName() 返回 Tomcat 正在运行的主机名。在上面的示例中，它将是 localhost。

如果您还有一个 `<Connector>` 侦听端口 8080（嵌套在同一个 Service 元素中），则对任一端口的请求将共享相同的虚拟主机和 Web 应用程序。

您可能希望使用操作系统的 IP 过滤功能来限制对端口 8081（在此示例中）的连接，只允许来自运行 Apache 的服务器。

或者，您可以设置一系列仅通过代理访问的 Web 应用程序，如下所示：

1. 配置另一个只包含代理端口 `<Connector>` 的 `<Service>`。

2. 为通过代理访问的虚拟主机和 Web 应用程序配置适当的 Engine、Host 和 Context 元素。

3. 可选地，像前面描述的那样使用 IP 过滤器保护端口 8081。

通过 Apache 代理时，Web 服务器将在其访问日志中记录这些请求。因此，您通常希望禁用 Tomcat 本身执行的任何访问日志记录。

以这种方式代理请求时，所有针对配置的 Web 应用程序的请求都将由 Tomcat 处理（包括针对静态内容的请求）。您可以通过使用 mod_jk Web 连接器而不是 mod_proxy 来提高性能。

mod_jk 可以配置为使 Web 服务器提供未在 Web 应用程序的部署描述符 (/WEB-INF/web.xml) 中定义的过滤器或安全约束处理的静态内容。

# 参考资料

https://tomcat.apache.org/tomcat-11.0-doc/proxy-howto.html

* any list
{:toc}