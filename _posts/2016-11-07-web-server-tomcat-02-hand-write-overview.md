---
layout: post
title: 从零手写实现 apache Tomcat-01-入门介绍
date:  2016-11-7 17:13:40 +0800
categories: [Web]
tags: [tomcat, server, web]
published: true
---


# 自己如何实现？

要实现一个简单版本的Tomcat，整体思路如下

1. **了解 Tomcat 的基本原理**：
   - Tomcat 是一个开源的 Java Servlet 容器和 Web 服务器，它能够运行 Java Servlet 和 JavaServer Pages。
   - Tomcat 是基于 Java 的，它是用 Java 编写的。

2. **创建一个简单的 HTTP 服务器**：
   - 创建一个 Java 类，作为你的 HTTP 服务器的入口点。
   - 使用 Java 的 `ServerSocket` 类监听来自客户端的连接。
   - 接受客户端连接后，读取客户端的请求，并解析其中的 HTTP 请求头。
   - 根据请求头中的信息，返回相应的 HTTP 响应。

3. **实现 Servlet 功能**：
   - 创建一个类来处理 Servlet 请求。这个类需要实现 Servlet 接口。
   - 实现 Servlet 接口需要实现一系列的生命周期方法，如 `init()`、`service()` 和 `destroy()`。
   - 在 `service()` 方法中，根据 HTTP 请求的类型（GET、POST 等），调用相应的处理方法。

4. **处理静态资源**：
   - 对于静态资源（如 HTML、CSS、JS 文件），你可以直接读取文件内容，并将其作为响应的一部分返回给客户端。
   - 在接收到 HTTP 请求后，解析请求路径，确定请求的资源是静态资源还是 Servlet 请求。

5. **处理动态资源**：
   - 对于动态资源（如 JSP 页面），你需要在服务器端动态生成页面内容。
   - 当收到对动态资源的请求时，根据请求的信息动态生成 HTML 页面，并将其作为响应的一部分返回给客户端。

6. **简单的请求处理**：
   - 实现简单的 HTTP 请求处理，包括支持 GET 和 POST 方法。
   - 解析请求头，获取请求路径和请求参数。

7. **启动和停止服务器**：
   - 实现一个方法来启动和停止服务器。
   - 在服务器启动时，初始化必要的资源，如端口、线程池等。
   - 在服务器停止时，释放资源并关闭服务器的 Socket 连接。

8. **测试你的服务器**：
   - 创建一些简单的 Servlet 和静态资源，并在浏览器中测试你的服务器。
   - 确保服务器能够正确地处理各种类型的请求，并能够返回正确的响应。

要实现完整的 Tomcat 功能，还需要考虑更多的细节，如多线程支持、连接池、Session 管理、安全性等。

我们可以循序渐进，先实现一些核心的能力。

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

## https://github.com/shenshaoming/tomcat

手写tomcat
netty的jar包位于resources下，就引入来说相对麻烦，各位不好意思了。
version1.0:实现了监听端口,但时不时会服务器就会崩溃.
version2.0:通过增加访问队列修复了崩溃的bug.
version3.0:能够通过服务器访问本地(服务器)的文件,默认是D盘下的文件,D盘就相当于WEB_ROOT路径
version3.1:实现多线程bio监听端口
version4.0:能够通过服务器访问Servlet程序
version4.1:通过扫描包和注解的形式,实现了类似SpringMvc的机制
version4.2:当Servlet注解中的value重复时抛出异常
version5.0:由开启线程改为线程池.
version5.1:改为由ThreadPoolExecutor创建线程池
version5.2:从BIO监听模型改为NIO模型
version5.3:从NIO模型改为基于Netty的NIO模型
version5.4:加入过滤器,收到请求时,要先去访问所有的过滤器

## https://github.com/OliverLiy/MyTomcatDemo

## https://github.com/CoderXiaohui/mini-tomcat

https://www.cnblogs.com/isdxh/p/14199711.html

## https://github.com/Rainyn/myTomcat

手写Tomcat，参考

https://www.jianshu.com/p/dce1ee01fb90

## https://github.com/thestyleofme/minicat-parent

## https://github.com/nmyphp/mytomcat


* any list
{:toc}