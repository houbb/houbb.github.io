---
layout: post
title: 从零手写实现 apache Tomcat-01-入门介绍
date:  2016-11-7 17:13:40 +0800
categories: [Web]
tags: [tomcat, server, web]
published: true
---


# 创作缘由

平时使用 tomcat 等 web 服务器不可谓不多，但是一直一知半解。

于是想着自己实现一个简单版本，学习一下 tomcat 的精髓。

# Tomcat 是什么？

Tomcat 就像一个餐馆的厨房，它负责接收顾客（用户）的点餐（请求），然后根据菜单（你的 Java Web 应用）来制作菜肴（生成网页）。

这个过程中，厨师（Tomcat）需要遵循一定的食谱（Servlet 和 JSP 规范），确保每个菜肴（网页）都符合顾客的期待。

### Tomcat 的作用：

1. **接收请求**：当用户通过浏览器访问网站时，Tomcat 会接收到这个请求。
2. **处理请求**：Tomcat 会根据请求的内容，找到对应的 Java 程序（Servlet 或 JSP 页面）来处理这个请求。
3. **生成响应**：处理完请求后，Tomcat 会生成一个响应，通常是一个新的网页，然后发送回用户的浏览器。

### Tomcat 的特点：

1. **开源免费**：Tomcat 是完全开源的，这意味着你可以免费使用它，并且可以看到它的源代码。
2. **轻量级**：相比于其他一些 Java 应用服务器，Tomcat 更轻量，启动更快，占用资源更少。
3. **易于使用**：Tomcat 的配置相对简单，容易上手，适合初学者和小型项目。
4. **广泛支持**：由于 Tomcat 的流行，很多 Java Web 开发相关的工具和框架都支持 Tomcat。

### 如何使用 Tomcat？

1. **下载安装**：从 Apache 官网下载 Tomcat，然后解压到一个目录。
2. **部署应用**：将你的 Java Web 应用（通常是 WAR 文件）放到 Tomcat 的 `webapps` 目录下。
3. **启动服务**：运行 Tomcat 的启动脚本（比如 `startup.bat` 或 `startup.sh`），Tomcat 就会开始监听网络请求。
4. **访问应用**：在浏览器中输入 Tomcat 的地址（通常是 `http://localhost:8080`），你就可以看到应用的首页了。

### Tomcat 的局限性：

- **功能有限**：对于大型企业级应用，Tomcat 可能不够强大，因为它缺少一些高级功能，比如复杂的事务管理、安全性等。
- **性能问题**：虽然 Tomcat 轻量，但在高并发的情况下，它可能不如专业的应用服务器表现出色。

### 总结：

Tomcat 就像一个小型的餐馆厨房，它适合做一些简单的菜肴（小型 Web 应用），而且成本低廉，操作简便。

但如果你要举办一场大型的宴会（大型 Web 应用），可能就需要一个更大、更专业的厨房（如 JBoss、WebLogic 等）了。

# 怎么实现一个 tomcat 呢？

Tomcat就像是一个用Java语言搭起来的大舞台，专门用来演出那些用Java编写的网页剧。想要玩得转Tomcat，你最好对Java语言有所了解。

搭建Tomcat的过程，就像是搭积木。首先，你得用Java写一个启动类，这个类就是整个服务器的大脑。然后，用Java的`ServerSocket`这个工具来监听网络上的敲门声，也就是连接请求。一旦有人来敲门，服务器就得看看人家想要啥，然后根据需求给出回应。

接下来，我们要让服务器学会处理网页请求。这就需要一个叫做Servlet的小家伙，它是一个接口，你需要写一个类来实现这个接口。这个类得有几个特定的动作，比如准备（`init()`）、服务（`service()`）和收工（`destroy()`）。在服务动作里，Servlet得判断人家是用什么方式来请求的，比如是GET还是POST，然后做出相应的反应。

服务器还得能处理那些不需要服务器现场制作的静态文件，比如图片、网页模板或者CSS样式表。这些文件就像是现成的道具，直接从硬盘里拿出来给人家就行。

当然，对于那些需要服务器现场制作的动态网页，比如JSP，服务器就得根据请求的信息，现场编个网页，然后发回去。

此外，服务器还得能处理基本的网页请求，比如GET和POST，并且能读懂人家的请求信息，知道人家想访问哪个页面，还带了什么额外的信息。

控制服务器的开关也很重要。你得写个方法来控制服务器的启动和停止。启动时，要准备好要用的东西，比如确定用哪个端口号，设置好线程池。关闭时，要确保资源都收拾干净，网络连接也都断开。

最后，你可以通过编写几个简单的Servlet和一些静态文件，然后在浏览器里测试你的服务器。确保服务器能够正确处理各种请求，并且返回正确的结果。

虽然这只是Tomcat的入门阶段，但要打造一个完整的Tomcat，还有很多东西要考虑，比如怎么让多个请求同时处理（多线程）、怎么高效管理数据库连接（连接池）、怎么记住每个访客的身份（会话管理）、怎么保护服务器不受坏蛋的攻击（安全问题）等等。

咱们可以一步步来，先搞定这些基本的，再慢慢增加新的功能。

# 从零手写例子

## 项目简介

```
 /\_/\  
( o.o ) 
 > ^ <
```

mini-cat 是简易版本的 tomcat 实现。别称【嗅虎】(心有猛虎，轻嗅蔷薇。)

开源地址：[https://github.com/houbb/minicat](https://github.com/houbb/minicat)

## 特性

- 简单的启动实现/netty 支持

- servlet 支持

- 静态网页支持

- filter/listener 支持

- wars 支持

## 快速开始

### maven 依赖

```xml
<dependency>
    <groupId>com.github.houbb</groupId>
    <artifactId>minicat</artifactId>
    <version>0.7.0</version>
</dependency>
```

### 启动测试

运行测试类 `MiniCatBootstrapMain#main`

```java
MiniCatBootstrap bootstrap = new MiniCatBootstrap();
bootstrap.start();
```

启动日志：

```
[INFO] [2024-04-03 11:09:15.178] [main] [c.g.h.m.s.s.WebXmlServletManager.register] - [MiniCat] register servlet, url=/my, servlet=com.github.houbb.minicat.support.servlet.MyMiniCatHttpServlet
[INFO] [2024-04-03 11:09:15.180] [Thread-0] [c.g.h.m.b.MiniCatBootstrap.startSync] - [MiniCat] start listen on port 8080
[INFO] [2024-04-03 11:09:15.180] [Thread-0] [c.g.h.m.b.MiniCatBootstrap.startSync] - [MiniCat] visit url http://127.0.0.1:8080
```

页面访问：[http://127.0.0.1:8080](http://127.0.0.1:8080)

响应：

```
http://127.0.0.1:8080
```

### 测试

servlet: http://127.0.0.1:8080/my

html: http://127.0.0.1:8080/index.html

## 开源地址

开源地址：[https://github.com/houbb/minicat](https://github.com/houbb/minicat)

开源不易，欢迎 fork+star~~~ 鼓励一下作者

# 系列文章

点击 {阅读原文}，获得更好的阅读体验

## 手写实现系列

[从零手写实现 apache Tomcat-01-入门介绍](https://houbb.github.io/2016/11/07/web-server-tomcat-02-hand-write-overview)

[从零手写实现 apache Tomcat-02-web.xml 入门详细介绍](https://houbb.github.io/2016/11/07/web-server-tomcat-02-hand-write-web-xml)

[从零手写实现 tomcat-03-基本的 socket 实现](https://houbb.github.io/2016/11/07/web-server-tomcat-03-hand-write-simple-socket)

[从零手写实现 tomcat-04-请求和响应的抽象](https://houbb.github.io/2016/11/07/web-server-tomcat-04-hand-write-request-and-resp)

[从零手写实现 tomcat-05-servlet 处理支持](https://houbb.github.io/2016/11/07/web-server-tomcat-05-hand-write-servlet-web-xml)

[从零手写实现 tomcat-06-servlet bio/thread/nio/netty 池化处理](https://houbb.github.io/2016/11/07/web-server-tomcat-06-hand-write-thread-pool)

[从零手写实现 tomcat-07-war 如何解析处理三方的 war 包？](https://houbb.github.io/2016/11/07/web-server-tomcat-07-hand-write-war)

[从零手写实现 tomcat-08-tomcat 如何与 springboot 集成？](https://houbb.github.io/2016/11/07/web-server-tomcat-08-hand-write-embed)

[从零手写实现 tomcat-09-servlet 处理类](https://houbb.github.io/2016/11/07/web-server-tomcat-09-hand-write-servlet)

[从零手写实现 tomcat-10-static resource 静态资源文件](https://houbb.github.io/2016/11/07/web-server-tomcat-10-hand-write-static-resource)

[从零手写实现 tomcat-11-filter 过滤器](https://houbb.github.io/2016/11/07/web-server-tomcat-11-hand-write-filter)

[从零手写实现 tomcat-12-listener 监听器](https://houbb.github.io/2016/11/07/web-server-tomcat-12-hand-write-listener)


## tomcat11 系列文章

如果你对 tomcat 不是很熟，可以阅读下面的系列。

目前的最新版本, tomcat11: 

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

--------------------------------------------------------------------------------------------------------------------------------------------

# chat

## Q: tomcat 有哪些核心能力？

Tomcat 是一个功能强大的开源 Servlet 容器和 Web 服务器，具有多种核心能力，包括但不限于以下几点：

1. **Servlet 和 JSP 支持**：
   Tomcat 提供了完整的 Servlet 和 JSP 规范的支持。
   
   Servlet 是 Java 编写的服务器端程序，用于处理客户端的请求并生成响应。JSP（JavaServer Pages）允许在 HTML 页面中嵌入 Java 代码，使得动态生成页面变得更加方便。

2. **HTTP 服务器功能**：
   Tomcat 不仅仅是一个 Servlet 容器，还是一个完整的 HTTP 服务器，能够处理 HTTP 请求和响应。它支持 HTTP/1.1 协议，并能够处理 GET、POST 等常见的 HTTP 请求方法。

3. **连接池管理**：
   Tomcat 提供了连接池功能，用于管理数据库连接、HTTP 连接等资源。连接池可以提高系统的性能和吞吐量，并且能够有效地管理资源的分配和释放。

4. **多版本支持**：
   Tomcat 允许在同一台服务器上部署多个 Web 应用程序，并支持不同版本的 Servlet 和 JSP 规范。这使得在同一服务器上运行多个应用程序变得更加灵活。

5. **安全性**：
   Tomcat 提供了一系列的安全功能，包括用户身份认证、访问控制、SSL/TLS 支持等。它支持基于角色的访问控制（Role-Based Access Control，RBAC），可以限制用户对特定资源的访问权限。

6. **Session 管理**：
   Tomcat 提供了 Session 管理功能，用于跟踪用户的会话状态。它支持基于 Cookie 和 URL 重写的会话跟踪机制，并提供了会话持久化功能，允许将会话数据存储到数据库或其他存储介质中。

7. **集群和负载均衡**：
   Tomcat 支持集群部署和负载均衡，可以通过配置多个 Tomcat 实例组成一个集群，以提高系统的可用性和性能。它支持多种负载均衡策略，包括基于权重的负载均衡、基于会话的负载均衡等。

8. **管理和监控**：
   Tomcat 提供了管理和监控功能，允许管理员通过 Web 界面或命令行工具管理和监控 Tomcat 服务器。它提供了各种管理工具，包括管理控制台、管理 API、日志记录和性能监控等。

这些都是 Tomcat 的一些核心能力，使其成为一个流行的 Web 应用程序服务器和 Servlet 容器。

#  开源的手写项目

```
https://github.com/shenshaoming/tomcat
https://github.com/OliverLiy/MyTomcatDemo
https://github.com/CoderXiaohui/mini-tomcat
https://www.cnblogs.com/isdxh/p/14199711.html
https://github.com/Rainyn/myTomcat
https://www.jianshu.com/p/dce1ee01fb90
https://github.com/thestyleofme/minicat-parent
https://github.com/nmyphp/mytomcat
```

* any list
{:toc}