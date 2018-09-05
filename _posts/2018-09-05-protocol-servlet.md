---
layout: post
title:  Servlet
date:  2018-09-05 11:45:07 +0800
categories: [Protocol]
tags: [servlet, protocol, sf]
published: true
excerpt: Servlet 相关知识点总结。
---

# Servlet

[Servlet](https://www.oracle.com/technetwork/java/overview-137084.html) 是用于扩展和增强Web服务器的Java平台技术。

servlet提供了一种基于组件的、独立于平台的方法来构建基于web的应用程序，而不受CGI程序的性能限制。与专有的服务器扩展机制(如Netscape服务器API或Apache模块)不同，servlet是独立于服务器和平台的。这使您可以自由地为您的服务器、平台和工具选择“最佳品种”策略。

servlet可以访问所有Java API，包括访问企业数据库的JDBC API。servlet还可以访问特定于http的调用库，并获得成熟Java语言的所有好处，包括可移植性、性能、可重用性和崩溃保护。

如今，servlet 是构建交互式Web应用程序的流行选择。第三方servlet容器可用于Apache Web服务器、Microsoft IIS等。Servlet容器通常是Web和应用服务器的组件，如BEA WebLogic应用服务器、IBM WebSphere、Sun Java系统Web服务器、Sun Java系统应用服务器等。

## 通用 Servlet

一般来说，通用Servlet由javax.servlet.GenericServlet实作Servlet界面。

程序设计人员可以通过使用或继承这个类来实现通用Servlet应用。

## HttpServlet

`javax.servlet.http.HttpServlet` 实现了专门用于响应HTTP请求的Servlet，
提供了响应对应HTTP标准请求的doGet()、doPost()等方法。

## 与 jsp 的关系

Java服务器页面（JSP）是HttpServlet的扩展。由于HttpServlet大多是用来响应HTTP请求，并返回Web页面（例如HTML、XML），所以不可避免地，在编写servlet时会涉及大量的HTML内容，这给servlet的书写效率和可读性带来很大障碍，JSP便是在这个基础上产生的。其功能是使用HTML的书写格式，在适当的地方加入Java代码片段，将程序员从复杂的HTML中解放出来，更专注于servlet本身的内容。

JSP在首次被访问的时候被应用服务器转换为servlet，在以后的运行中，容器直接调用这个servlet，而不再访问JSP页面。

JSP的实质仍然是servlet。

JSP 技术是 servlet技术的扩展，该技术的创建是为了支持编辑HTML和XML页面。它使固定或静态模板数据与动态内容相结合变得更加容易。

# 常见问题

## Servlet 生命周期

Servlet体系结构是建立在 Java 多线程机制上的，它的生命周期由 Web 容器负责。

当客户端第一次请求某个 Servlet 时，Servlet 容器将会根据 web.xml 的配置文件实例化这个 Servlet 类。当有新的客户端请求该 Servlet 时，一般不会再实例化该 Servlet 类。

当有多个请求时，Servlet 容器会起多个线程来访问同一个 Servlet 实例的 service() 方法，如果该 Servlet 实例中有共享的实例变量，需要注意多线程安全问题。

Servlet 生命周期定义了 Servlet 从创建到毁灭的整个过程，总共分为四个步骤。

- 调用 init() 方法初始化

- 调用 service() 方法来处理客户端的请求

- 调用 destroy() 方法释放资源，标记自身为可回收被垃圾回收器回收

### init

init 方法被设计成只调用一次。它在第一次创建 Servlet 时被调用，用于 Servlet的初始化，初始化的数据，可以在整个生命周期中使用。

### service

service() 方法是执行实际任务的主要方法。 Servlet 容器（Tomcat、Jetty等）调用 service() 方法来处理来自客户端（浏览器）的请求，并把相应结果返回给客户端。

每次 Servlet 容器接收到一个 Http 请求， Servlet 容器会产生一个新的线程并调用 Servlet实例的 service 方法。 

service 方法会检查 HTTP 请求类型（GET、POST、PUT、DELETE 等），并在适当的时候调用 doGet、doPost、doPut、doDelete 方法。

所以，在编码请求处理逻辑的时候，我们只需要关注 doGet()、或doPost()的具体实现即可。

### destroy

destroy() 方法也只会被调用一次，在 Servlet 生命周期结束时调用。

destroy() 方法主要用来清扫“战场”，执行如关闭数据库连接、释放资源等行为。

调用 destroy 方法之后，servlet 对象被标记为垃圾回收，等待 JVM 的垃圾回收器进行处理。

## Servlet 安全性问题

Servlet不是线程安全的。

要保证是无状态的。

## forward/redirect 区别

直接转发方式（Forward），客户端和浏览器只发出一次请求，Servlet、HTML、JSP或其它信息资源，由第二个信息资源响应该请求，在请求对象request中，保存的对象对于每个信息资源是共享的。

间接转发方式（Redirect）实际是两次HTTP请求，服务器端在响应第一次请求的时候，让浏览器再向另外一个URL发出请求，从而达到转发的目的。

### 间接请求转发(Redirect)

间接转发方式，有时也叫重定向，它一般用于避免用户的非正常访问。

例如：用户在没有登录的情况下访问后台资源，Servlet可以将该HTTP请求重定向到登录页面，让用户登录以后再访问。

在Servlet中，通过调用response对象的SendRedirect()方法，告诉浏览器重定向访问指定的URL，示例代码如下：　

```java
//Servlet中处理get请求的方法
public void doGet(HttpServletRequest request,HttpServletResponse response){
//请求重定向到另外的资源
    response.sendRedirect("资源的URL");
}
```

### 直接请求转发(Forward)

接转发方式用的更多一些，一般说的请求转发指的就是直接转发方式。

Web应用程序大多会有一个控制器。由控制器来控制请求应该转发给那个信息资源。

然后由这些信息资源处理请求，处理完以后还可能转发给另外的信息资源来返回给用户，这个过程就是经典的MVC模式。

`javax.serlvet.RequestDispatcher` 接口是请求转发器必须实现的接口，由Web容器为Servlet提供实现该接口的对象，通过调用该接口的forward()方法到达请求转发的目的，示例代码如下：

```java
//Servlet里处理get请求的方法
public void doGet(HttpServletRequest request , HttpServletResponse response){
   //获取请求转发器对象，该转发器的指向通过getRequestDisPatcher()的参数设置
   RequestDispatcher requestDispatcher =request.getRequestDispatcher("资源的URL");
   //调用forward()方法，转发请求      
   requestDispatcher.forward(request,response);    
}
```

- 技巧

其实，通过浏览器就可以观察到服务器端使用了那种请求转发方式。

当单击某一个超链接时，浏览器的地址栏会出现当前请求的地址，如果服务器端响应完成以后，发现地址栏的地址变了，则证明是间接的请求转发。

相反，如果地址没有发生变化，则代表的是直接请求转发或者没有转发。

- 二者区别

答：Forward和Redirect代表了两种请求转发方式：直接转发和间接转发。

对应到代码里，分别是RequestDispatcher类的forward()方法和HttpServletRequest类的sendRedirect()方法。

对于间接方式，服务器端在响应第一次请求的时候，让浏览器再向另外一个URL发出请求，从而达到转发的目的。它本质上是两次HTTP请求，对应两个request对象。

对于直接方式，客户端浏览器只发出一次请求，Servlet把请求转发给Servlet、HTML、JSP或其它信息资源，由第2个信息资源响应该请求，两个信息资源共享同一个request对象。

## get/post 区别

### 一般理解

GET后退按钮/刷新无害，POST数据会被重新提交（浏览器应该告知用户数据会被重新提交）。

GET书签可收藏，POST为书签不可收藏。

GET能被缓存，POST不能缓存 。

GET编码类型`application/x-www-form-url`，POST编码类型`encodedapplication/x-www-form-urlencoded` 或 `multipart/form-data`。为二进制数据使用多重编码。

GET历史参数保留在浏览器历史中。POST参数不会保存在浏览器历史中。

GET对数据长度有限制，当发送数据时，GET 方法向 URL 添加数据；URL 的长度是受限制的（URL 的最大长度是 2048 个字符）。POST无限制。

GET只允许 ASCII 字符。POST没有限制。也允许二进制数据。

与 POST 相比，GET 的安全性较差，因为所发送的数据是 URL 的一部分。在发送密码或其他敏感信息时绝不要使用 GET ！POST 比 GET 更安全，因为参数不会被保存在浏览器历史或 web 服务器日志中。

GET的数据在 URL 中对所有人都是可见的。POST的数据不会显示在 URL 中。

### RFC7231 的原文翻译

GET的语义是请求获取指定的资源。

GET方法是安全、幂等、可缓存的（除非有 Cache-ControlHeader的约束）,GET方法的报文主体没有任何语义。

POST的语义是根据请求负荷（报文主体）对指定的资源做出处理，具体的处理方式视资源类型而不同。

POST不安全，不幂等，（大部分实现）不可缓存。

# 拓展阅读

[Tomcat 系统架构](https://www.ibm.com/developerworks/cn/java/j-lo-tomcat1/#authorN10020)

[Tomcat 设计模式](https://www.ibm.com/developerworks/cn/java/j-lo-tomcat2/#ibm-pcon)

[Jetty 的工作原理以及与 Tomcat 的比较](https://www.ibm.com/developerworks/cn/java/j-lo-jetty/#ibm-pcon)

[Servlet 工作原理解析](https://www.ibm.com/developerworks/cn/java/j-lo-servlet/)

# 参考资料

- servlet

https://zh.wikipedia.org/wiki/Java_Servlet

https://www.oracle.com/technetwork/java/index-jsp-135475.html

https://www.cnblogs.com/whgk/p/6399262.html

- 工作原理

[servlet 详解](https://www.cnblogs.com/whgk/p/6399262.html)

[Servlet 工作原理解析](https://www.ibm.com/developerworks/cn/java/j-lo-servlet/index.html)

- 相关教程

https://www.tutorialspoint.com/servlets/servlets-first-example.htm

- 常见问题

[forward + redirect](https://www.cnblogs.com/selene/p/4518246.html)

- get/post

https://www.zhihu.com/question/28586791

https://www.jianshu.com/p/63158ec1f1f9

https://segmentfault.com/a/1190000004014583

* any list
{:toc}