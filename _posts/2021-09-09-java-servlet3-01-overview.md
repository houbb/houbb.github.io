---
layout: post
title: Java Servlet3.1 规范-01-概览 servlet 是什么？
date:  2021-09-09 14:49:58 +0800
categories: [Java]
tags: [web, servlet, servlet3, sh]
published: true
---

# 什么是 Servlet

servlet 是基于 Java 的 Web 组件，由容器进行管理，来生成动态内容。

像其他基于 Java 的组件技术一样，servlet 也是基于平台无关的 Java 类格式，被编译为平台无关的字节码，可以被基于 Java 技术的 Web 服务器动态加载并运行。

容器（Container），有时候也叫做 servlet 引擎，是 Web 服务器为支持 servlet 功能扩展的部分。

客户端通过 servlet 容器实现的 request/response paradigm（请求/应答模式） 与 Servlet 进行交互。

# 什么是 Servlet 容器

Servlet Container（Servlet 容器） 是 Web 服务器或者应用服务器的一部分，用于提供基于请求/响应发送模式的网络服务，解码基于 MIME 的请求，并且格式化基于 MIME 的响应。

Servlet 容器同时也包含和管理他们的生命周期里 Servlet。

Servlet 容器可以嵌入到宿主的 Web 服务器中，或者通过 Web 服务器的本地扩展 API 单独作为附加组件安装。Servelt 容器也可能内嵌或安装到启用 Web 功能的应用服务器中。

所有的 Servlet 容器必须支持 HTTP 协议用于请求和响应，但额外的基于 请求/响应 的协议，如 HTTPS (HTTP over SSL)的支持是可选的。对于 HTTP 规范需要版本，容器必须支持 HTTP/1.0 和 HTTP/1.1。

因为容器或许支持 RFC2616 (HTTP/1.1)描述的缓存机制，缓存机制可能在将客户端请求交给 Servlet 处理之前修改它们，也可能在将 Servlet 生成的响应发送给客户端之前修改它们，或者可能根据 RFC2616 规范直接对请求作出响应而不交给 Servlet 进行处理。

Servlet 容器应该使 Servlet 执行在一个安全限制的环境中。

在 Java 平台标准版（J2SE, v.1.3 或更高） 或者 Java平台企业版(Java EE, v.1.3 或更高) 的环境下，这些限制应该被放置在 Java 平台定义的安全许可架构中。

比如，高端的应用服务器为了保证容器的其他组件不受到负面影响可能会限制 Thread 对象的创建。

Java SE 7 是构建 Servlet 容器最低的 Java平 台版本。

# 一个例子

以下是一个典型的事件序列：

1. 客户端（如 web 浏览器）要访问 Web 服务器，并发送一个 HTTP 请求；

2. Web 服务器接收到请求并且交给 servlet 容器处理，servlet 容器可以运行在与宿主 Web 服务器同一个进程中，也可以是同一主机的不同进程，或者位于不同的主机的 Web 服务器中，对请求进行处理。

3. servlet 容器根据 servlet 配置选择相应的 servlet，并调用代表请求和响应的对象。

4. servlet 通过请求对象得到远程用户，HTTP POST 参数和其他有关数据可能作为请求的一部分随请求一起发送过来。Servlet 执行我们编写的任意的逻辑，然后动态产生响应内容发送回客户端。发送数据到客户端是通过响应对象完成的。

5. 一旦 servlet 完成请求的处理，servlet 容器必须确保响应正确的输出，并且将控制权还给宿主 Web 服务器。

# Servlet 与其他技术的对比

从功能上看，servlet 位于Common Gateway Interface（公共网关接口，简称 CGI）程序和私有的服务器扩展如 Netscape Server API（NSAPI）或 Apache Modules 这两者之间。

相对于其他服务器扩展机制 Servlet 有如下优势：

* 它们通常比 CGI 脚本更快，因为采用不同的处理模型。

* 它们采用标准的 API 从而支持更多的Web 服务器。

* 它们拥有 Java 编程语言的所有优势，包括容易开发和平台无关。

* 它们可以访问 Java 平台提供的大量的 API。

# 与 Java EE 的关系

Java Servlet API 3.1 版本是 Java 平台企业版 7 版本必须的 API。

Servlet 容器和 servlet 被部署到平台中时，为了能在 Java EE 环境中执行，必须满足 JavaEE 规范中描述的额外的一些要求。

# 与 Servlet 2.5 规范的兼容性

## 处理注解

在 Servlet 2.5 中, metadata-complete 只影响在部署时的注释扫描。 

web-fragments 的概念在 servlet 2.5 并不存在。

然而在 servlet 3.0 和之后,metadata-complete 影响扫描所有的在部署时指定部署信息和 web-fragments 注释。

注释的版本的描述符必须不影响你扫描在一个web应用程序。

除非 metadata-complete 指定，规范的一个特定版本的实现必须扫描所有配置的支持的注解。


# 参考地址

[原始地址](https://download.oracle.com/otndocs/jcp/servlet-3_1-fr-eval-spec/index.html)

[SUMMARY.md](https://github.com/waylau/servlet-3.1-specification/blob/master/SUMMARY.md)

* any list
{:toc}