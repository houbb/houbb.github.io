---
layout: post
title: Java Servlet 教程-01-概览
date:  2018-09-28 14:43:52 +0800
categories: [Java]
tags: [web, servlet, java, sh]
published: true
excerpt: Java Servlet 教程之概览
---

# Servlet

## 概念

servlet是用于扩展和增强Web服务器的Java平台技术。

servlet提供了一种基于组件的、独立于平台的方法来构建基于web的应用程序，而不受CGI程序的性能限制。

与专有的服务器扩展机制(如Netscape服务器API或Apache模块)不同，servlet是独立于服务器和平台的。这使您可以自由地为您的服务器、平台和工具选择“最佳品种”策略。

servlet可以访问所有Java API，包括访问企业数据库的JDBC API。servlet还可以访问特定于http的调用库，并获得成熟Java语言的所有好处，包括可移植性、性能、可重用性和崩溃保护。

如今，servlet是构建交互式Web应用程序的流行选择。

## 容器

第三方servlet容器可用于Apache Web服务器、Microsoft IIS等。

Servlet容器通常是Web和应用服务器的组件，如BEA WebLogic应用服务器、IBM WebSphere、Sun Java系统Web服务器、Sun Java系统应用服务器等。

## JSP

您可能想了解有关JavaServer Pages (JSP)技术的最新信息。

JSP技术是servlet技术的扩展，该技术的创建是为了支持编辑HTML和XML页面。

它使固定或静态模板数据与动态内容相结合变得更加容易。

即使您很喜欢编写servlet，也有几个令人信服的理由来研究JSP技术作为现有工作的补充。

## vs CGI

Java Servlet 通常情况下与使用 CGI（Common Gateway Interface，公共网关接口）实现的程序可以达到异曲同工的效果。但是相比于 CGI，Servlet 有以下几点优势：

- 性能明显更好。

- Servlet 在 Web 服务器的地址空间内执行。这样它就没有必要再创建一个单独的进程来处理每个客户端请求。

- Servlet 是独立于平台的，因为它们是用 Java 编写的。

- 服务器上的 Java 安全管理器执行了一系列限制，以保护服务器计算机上的资源。因此，Servlet 是可信的。

- Java 类库的全部功能对 Servlet 来说都是可用的。它可以通过 sockets 和 RMI 机制与 applets、数据库或其他软件进行交互。

# 与 J2EE 的关系

Servlet是J2EE 规范中的一种，主要是为了扩展java作为web服务的功能。

他的作用就是为java程序提供一个统一的web应用的规范，方便程序员统一的使用这种规范来编写程序，应用容器可以使用提供的规范来实现自己的特性。

# 与 Tomcat 的关系

Tomcat 是Web应用服务器,是一个Servlet/JSP容器。 

Tomcat 作为Servlet容器,负责处理客户请求,把请求传送给Servlet,并将Servlet的响应传送回给客户。

而Servlet是一种运行在支持Java语言的服务器上的组件。 Servlet最常见的用途是扩展Java Web服务器功能,提供非常安全的,可移植的,易于使用的CGI替代品。

从http协议中的请求和响应可以得知，浏览器发出的请求是一个请求文本，而浏览器接收到的也应该是一个响应文本。

但是在上面这个图中，并不知道是如何转变的，只知道浏览器发送过来的请求也就是request，我们响应回去的就用response。忽略了其中的细节，现在就来探究一下。

![tomcat-servlet](https://raw.githubusercontent.com/houbb/resource/master/img/web/servlet/20180927-servlet-tomcat.png)

①：Tomcat将http请求文本接收并解析，然后封装成HttpServletRequest类型的request对象，所有的HTTP头数据读可以通过request对象调用对应的方法查询到。

②：Tomcat同时会要响应的信息封装为HttpServletResponse类型的response对象，通过设置response属性就可以控制要输出到浏览器的内容，然后将response交给tomcat，tomcat就会将其变成响应文本的格式发送给浏览器

Java Servlet API 是Servlet容器(tomcat)和servlet之间的接口，它定义了serlvet的各种方法，还定义了Servlet容器传送给Servlet的对象类，其中最重要的就是ServletRequest和ServletResponse。所以说我们在编写servlet时，需要实现Servlet接口，按照其规范进行操作。

# 个人感想

平时的工作中，使用 spring mvc 注解用来用去，其实一直没有深究过其本质是什么。

- Web

我们每一个 web 服务，就是客户端和服务端文件信息的交换。

底层全部依赖于 [HTTP 协议](https://houbb.github.io/2018/09/25/protocol-http)。

- Servlet

Servlet 是一套标准，甚至可以简单的理解为接口。

这些接口是无法单独运行的，就需要依赖于容器(Container)。

比如常见的 [Tomcat](https://houbb.github.io/2018/09/05/container-tomcat) 和 [Jetty](https://houbb.github.io/2018/09/05/container-jetty)。

# 为什么需要容器来处理 servlet 请求呢？

这样肯定带来了额外的开销，但是为什么这么做呢？

除却开发的成本较高，维护统一这些不谈。

我们先看看容器有哪些功能。

## 通信支持

Servlet 与 Web 之间的通信，容器都会帮我们处理。

我们只需要专心关注于业务。

## 生命周期

Servlet 的生命周期与资源分配，容器都会帮我们处理好。

## 多线程支持

Servlet 不是线程安全的，这点我们在使用的时候要谨慎。

但是 Tomcat 在处理的时候，每一个请求都会新建一个线程去处理，声明周期结束后，会自动销毁。

线程方面，已经方便处理很多。

## 声明方式实现安全

利用容器配置，我们改下 `*.xml` 配置即可进行相关设置。

而不用重新修改 Java 代码，相对安全便捷。

## JSP 支持

JSP 功能以前是多么强大，正是容器将其翻译成为 java 的。

当然，建议使用 [Freemarker](https://houbb.github.io/2016/05/07/freemarker) 或者 [Velocity](https://houbb.github.io/2018/06/08/velocity) 

# Spring MVC 

基于 java 注解对 Servlet 进行一系列的封装，大大简化我们的开发难度。

后面我们会手写一个简化版的 spring mvc。

# 参考资料

[Java Servlet Technology Documentation](https://www.oracle.com/technetwork/java/docs-142916.html)

[《Java Servlet 3.1 规范》](https://waylau.gitbooks.io/servlet-3-1-specification/)

[Head First Servlet & JSP 书籍地址](https://www.jianshu.com/p/4bf26f56d300)

[servlet 系列教程](http://www.runoob.com/servlet/servlet-tutorial.html)

- servlet 如何工作

[tomcat-servlet](https://www.mulesoft.com/cn/tcat/tomcat-servlet)

[servlet的本质是什么，它是如何工作的？](https://www.zhihu.com/question/21416727)

- Servlet 线程安全

[Servlet是线程安全的吗？](https://www.cnblogs.com/chanshuyi/p/5052426.html)

* any list
{:toc}