---
layout: post
title: 从零手写实现 apache Tomcat-01-入门介绍
date:  2016-11-7 17:13:40 +0800
categories: [Web]
tags: [tomcat, server, web]
published: true
---


# 怎么实现一个 tomcat 呢？

想要自己搞个简化版的Tomcat，可以这么一步步来：

1. **搞懂Tomcat是啥**：
   - Tomcat就是用Java写的一个开源服务器，能跑Java写的网页程序。
   - 它用的是Java语言，所以得有点Java基础。

2. **搭建个基础的HTTP服务器**：
   - 用Java写个类，作为服务器的启动点。
   - 用Java的`ServerSocket`来监听网上的连接请求。
   - 一旦有人连上，就读他们的请求，分析他们想要啥。
   - 根据他们要的，给回相应的回答。

3. **实现Servlet的功能**：
   - 写个类来处理网页请求，这个类得实现Servlet接口。
   - 实现接口得写几个特定的方法，比如初始化(`init()`)、服务(`service()`)和销毁(`destroy()`)。
   - 在`service()`方法里，看是哪种请求（比如GET或POST），然后调用对应的处理方法。

4. **搞定静态文件**：
   - 对于图片、网页、样式表这些静态文件，直接从硬盘上读出来，然后发给请求的人就行。
   - 收到请求后，看看人家是要静态文件还是动态网页。

5. **处理动态网页**：
   - 对于需要服务器实时生成的网页，比如JSP，就得在服务器上现做。
   - 有人请求这种网页，就根据请求的信息，现场编个网页，然后发回去。

6. **处理基本的请求**：
   - 能处理基本的网页请求，比如GET和POST。
   - 能读懂请求的信息，知道人家要访问哪个网页，还带了什么参数。

7. **启动和关闭服务器**：
   - 写个方法来控制服务器的开和关。
   - 开服务器的时候，得准备好要用的东西，比如端口号、线程池。
   - 关服务器的时候，得把资源清理干净，把网络连接关了。

8. **测试你的服务器**：
   - 写几个简单的Servlet和静态文件，然后在浏览器里试试你的服务器。
   - 确保服务器能正确处理各种请求，返回正确的结果。

要做出完整的Tomcat，还有很多东西要考虑，比如多线程、连接池、会话管理、安全问题等等。

咱们可以一步步来，先搞定核心功能。

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