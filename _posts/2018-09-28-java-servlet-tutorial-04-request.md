---
layout: post
title: Java Servlet 教程-04-请求 HttpServletRequest
date:  2018-09-28 14:43:52 +0800
categories: [Java]
tags: [web, servlet, java, sh]
published: true
excerpt: Java Servlet 教程之请求 HttpServletRequest
---

# 请求

请求对象封装了客户端请求的所有信息。

在 [HTTP 协议](https://houbb.github.io/2017/04/20/http)中，这些信息是从客户端发送到服务器请求的 HTTP 头部和消息体。

## 接口

全部接口参见 [接口 UML](接口-UML)

HttpServletRequest 在 ServletRequest 的基础之上添加了 HTTP 的相关方法。

- 这个接口的实现是 Servlet-API 吗？

不是。是容器实现的。

我们在使用的时候不用关心具体的实现，只需要知道这些方法即可。

## 本文阅读顺序

你可以简单理解下面的属性方法，然后直接去看 [实战例子](#实战例子)

# 常见方法

## HTTP 协议参数

servlet 的请求参数以字符串的形式作为请求的一部分从客户端发送到 servlet 容器。

### GET

这些 API 不会暴露 GET 请求（HTTP 1.1所定义的）的路径参数。他们必须从 getRequestURI 方法或 getPathInfo 方法返回的字符串值中解析。

### POST

当请求是一个 HttpServletRequest 对象，且符合“参数可用时”描述的条件时，容器从 URI 查询字符串和 POST 数据中填充参数。

参数以一系列的名-值对（name-value）的形式保存。任何给定的参数的名称可存在多个参数值。

- 方法列表

ServletRequest 接口的下列方法可访问这些参数：

| 序号 | 方法 | 说明 |
|:---|:---|:---|
| 1 | getParameter | 以字符串形式返回请求参数的值，或者如果参数不存在则返回 null。 |
| 2 | getParameterNames | 返回一个 String 对象的枚举，包含在该请求中包含的参数的名称。 |
| 3 | getParameterValues | 返回一个字符串对象的数组，包含所有给定的请求参数的值，如果参数不存在则返回 null。 |
| 4 | getParameterMap | 方法返回请求参数的一个 java.util.Map 对象，其中以参数名称作为 map 键，参数值作为 map 值 |

- 查询字符串

查询字符串和 POST 请求的数据被汇总到请求参数集合中。查询字符串数据放在 POST 数据之前。

例如，如果请求由查询字符串 a=hello 和 POST 数据 a=goodbye&a=world 组成，得到的参数集合顺序将是 a=(hello, goodbye, world)。

- 当参数可用时

Post 表单数据能填充到参数集（Paramter Set）前必须满足的条件：

1. 该请求是一个 HTTP 或 HTTPS 请求。

2. HTTP 方法是 POST。

3. 内容类型是 `application/x-www-form-urlencoded`。

4. 该 servlet 已经对请求对象的任意 getParameter 方法进行了初始调用。

如果不满足这些条件，而且参数集中不包括 post 表单数据，那么 servlet 必须可以通过请求对象的输入流得到 post 数据。

如果满足这些条件，那么从请求对象的输入流中直接读取 post 数据将不再有效。

## 属性

属性是与请求相关联的对象。属性可以由容器设置来表达信息，否则无法通过 API 表示，或者由 servlet 设置将信息传达给另一个 servlet（通过 RequestDispatcher）。

- 方法

属性通过 ServletRequest 接口中下面的方法来访问：

| 序号 | 方法 | 说明 |
|:---|:---|:---|
| 1 | getAttribute | 以对象形式返回已命名属性的值，如果没有给定名称的属性存在，则返回 null。 |
| 2 | getAttributeNames | 返回一个枚举，包含提供给该请求可用的属性名称。 |
| 3 | setAttribute | 设置属性 |

一个属性名称只能关联一个属性值。

- 保留定义

前缀 `java.` 和 `javax.` 开头的属性名称是本规范的保留定义。

同样地，前缀 `sun.` 和 `com.sun.`，`oracle` 和 `com.oracle` 开头的属性名是Oracle Corporation 的保留定义。

建议属性集中所有属性的命名与Java编程语言的规范为包命名建议的反向域名约定一致。

## 请求头

通过下面的 HttpServletRequest 接口方法，servlet 可以访问 HTTP 请求的头信息：

| 序号 | 方法 | 说明 | 
|:---|:---|:---|
| 1 | getHeader | 以字符串形式返回指定的请求头的值。多个头可以具有相同的名称，例如HTTP 请求中的 Cache-Control 头。如果多个头的名称相同，getHeader方法返回请求中的第一个头。 |
| 2 | getHeaders | getHeaders 方法允许访问所有与特定头名称相关的头值，返回一个 String 对象的 Enumeration（枚举）。  | 
| 3 | getHeaderNames | 返回一个枚举，包含在该请求中包含的所有的头名。| 
| 4 | getIntHeader | 返回指定的请求头的值为一个 int 值。 | 
| 5 | getDateHeader | 返回指定的请求头的值为一个 Date 值。 | 

如果 getIntHeader 方法不能转换为 int 的头值，则抛出 NumberFormatException 异常。

如果 getDateHeader 方法不能把头转换成一个 Date 对象，则抛出 IllegalArgumentException 异常。

## SSL 属性

如果请求已经是通过一个安全协议发送，如 HTTPS，必须通过ServletRequest 接口的 `isSecure()` 方法公开该信息。

Web 容器必须公开下列属性给 servlet 程序员：

| 属性 | 属性名称 | Java类型 | 
|:---|:---|:---|
| 密码套件 | javax.servlet.request.cipher_suite | String |
| 算法的位大小 | javax.servlet.request.key_size | Integer |
| SSL 会话 id | javax.servlet.request.ssl_session_id | String |

如果有一个与请求相关的 SSL 证书，它必须由 servlet 容器以 `java.security.cert.X509Certificate` 类型的对象数组暴露给 servlet 程序员并可通过一个javax.servlet.request.X509Certificate 类型的 ServletRequest属性访问。

这个数组的顺序是按照信任的升序顺序。

证书链中的第一个证书是由客户端设置的，第二个是用来验证第一个的，等等。

- 拓展阅读

更多参见：[ssl/tls](https://houbb.github.io/2018/09/26/ssl-tls)

## 请求路径元素

引导 servlet 服务请求的请求路径由许多重要部分组成。

以下元素从请求URI路径得到，并通过请求对象公开：

- Context Path

与 ServletContext 相关联的路径前缀是这个servlet 的一部分。如果这个上下文是基于 Web 服务器的 URL 命名空间基础上的“默认”上下文，那么这个路径将是一个空字符串。

否则，如果上下文不是基于服务器的命名空间，那么这个路径以 `/` 字符开始，但不以 `/` 字符结束。

- Servlet Path

路径部分直接与激活请求的映射对应。这个路径以 `/` 字符开头，如果请求与 `/*` 或 ` ` 模式匹配，在这种情况下，它是一个空字符串。

- PathInfo

请求路径的一部分，不属于 Context Path 或 Servlet Path。

如果没有额外的路径，它要么是null，要么是以 `/` 开头的字符串。 

重要的是要注意，除了请求 URI 和路径部分的 URL 编码差异外，下面的等式永远为真：

```java
requestURI = contextPath + servletPath + pathInfo
```

- 方法

使用 HttpServletRequest 接口中的下面方法来访问这些信息：

| 序号 | 方法 | 说明 | 
|:---|:---|:---|
| 1 | getContextPath | 返回指示请求上下文的请求 URI 部分 |
| 2 | getServletPath | 返回调用 JSP 的请求的 URL 的一部分 |
| 3 | getPathInfo | 当请求发出时，返回与客户端发送的 URL 相关的任何额外的路径信息 |

## 路径转换方法

在 API 中有两个方便的方法，允许开发者获得与某个特定的路径等价的文件系统路径。

这些方法是：

| 序号 | 方法 | 说明 | 
|:---|:---|:---|
| 1 | ServletContext.getRealPath | getRealPath 方法需要一个 String 参数，并返回一个 String 形式的路径，这个路径对应一个在本地文件系统上的文件 |
| 2 | HttpServletRequest.getPathTranslated | getPathTranslated方法推断出请求的 pathInfo 的实际路径 |

这些方法在 servlet 容器无法确定一个有效的文件路径 的情况下，如 Web应用程序从归档中，在不能访问本地的远程文件系统上，或在一个数据库中执行时，这些方法必须返回 null。

JAR 文件中 `META-INF/resources` 目录下的资源，只有当调用 getRealPath() 方法时才认为容器已经从包含它的 JAR 文件中解压，在这种情况下，必须返回解压缩后位置。

## 编码

目前，许多浏览器不随着 Content-Type 头一起发送字符编码限定符，而是根据读取 HTTP 请求确定字符编码。

如果客户端请求没有指定请求默认的字符编码，容器用来创建请求读取器和解析 POST 数据的编码必须是“ISO-8859-1”。

然而，为了向开发人员说明客户端没有指定请求默认的字符编码，在这种情况下，客户端发送字符编码失败，容器从 getCharacterEncoding 方法返回 null。

如果客户端没有设置字符编码，并使用不同的编码来编码请求数据，而不是使用上面描述的默认的字符编码，那么可能会发生问题。

为了弥补这种情况，ServletRequest 接口添加了一个新的方法 `setCharacterEncoding(String enc)`。

开发人员可以通过调用此方法来覆盖由容器提供的字符编码。

必须在解析任何 post 数据或从请求读取任何输入之前调用此方法。

此方法一旦调用，将不会影响已经读取的数据的编码。

# 端口信息

- 方法

| 序号 | 方法 | 说明 | 
|:---|:---|:---|
| 1 | getServerPort | 返回接收到这个请求的端口号 |
| 2 | getLocalPort | 返回调用 JSP 的请求的 URL 的一部分 |
| 3 | getRemotePort | 当请求发出时，返回与客户端发送的 URL 相关的任何额外的路径信息 |

getServerPort() 含义应该很清楚，不过，这有可能与 getLocalPort() 混淆。

所以我们先来解释相对容易的方法: getRemotePort()。  

首先，你可能会问“对谁而言是远程的?“  

在这种情况下，由于是服务器在问，所以客户是远程的。既然客户对服务器是远程的，所以getRemotePort()是指“ 得到客户的端口”。
也就是要得到发出请求的客户的端口号。

要记住: 对于一个 servlet ,远程就意味着客户。

getLocalPort() 和 getServerPort() 的差别很微妙

getServerPort() 说, “请求原来发送到哪个端口?”。  

getLocalPort() 则是说“请求最后发送到哪个端？”

不错，二.者确实有区别，因为尽管请求要发送到一个端口( 服务器所监听的端口)，但是服务器也就会为每个线程找一个不同的本地端口。

这样一来，一个应用就能同时处理多个客户了。

# 生命周期

每个请求对象只在一个 servlet 的 service 方法的作用域内，或过滤器的 doFilter 方法的作用域内有效，除非该组件启用了异步处理并且调用了请求对象的 startAsync 方法。

在发生异步处理的情况下，请求对象一直有效，直到调用 AsyncContext 的 complete 方法。

容器通常会重复利用请求对象，以避免创建请求对象而产生的性能开销。

开发人员必须注意的是，不建议在上述范围之外保持 startAsync 方法还没有被调用的请求对象的引用，因为这样可能产生不确定的结果。

# 实战例子

## 代码

```java
import java.io.IOException;
import java.io.PrintWriter;
import java.util.Enumeration;

import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

@WebServlet("/request/header")
public class RequestHeaderServlet extends HttpServlet {

    private static final long serialVersionUID = 29535446166538705L;

    @Override
    protected void doGet(HttpServletRequest req, HttpServletResponse resp)
            throws ServletException, IOException {
        // 设置响应内容类型为 HTML
        resp.setContentType("text/html;charset=UTF-8");

        PrintWriter out = resp.getWriter();
        String docType =
                "<!DOCTYPE html> \n";
        out.println(docType +
                "<html>\n" +
                "<head><meta charset=\"utf-8\"></head>\n" +
                "<body>\n" +
                "| Header 名称 | Header 值 |<br>" +
                "|:---|:---|<br>");

        Enumeration headerNames = req.getHeaderNames();

        while (headerNames.hasMoreElements()) {
            String paramName = (String) headerNames.nextElement();
            out.print("| " + paramName);
            String paramValue = req.getHeader(paramName);
            out.println(" | " + paramValue + " | <br>");
        }
        out.println("</body></html>");
    }
}
```
## 页面显示

浏览器访问 [http://localhost:8081/request/header](http://localhost:8081/request/header)

| Header 名称 | Header 值 |
|:---|:---|
| host | localhost:8081 | 
| connection | keep-alive | 
| cache-control | max-age=0 | 
| upgrade-insecure-requests | 1 | 
| user-agent | Mozilla/5.0 (Macintosh; Intel Mac OS X 10_13_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/69.0.3497.100 Safari/537.36 | 
| accept | text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8 | 
| accept-encoding | gzip, deflate, br | 
| accept-language | zh-CN,zh;q=0.9,en;q=0.8 | 
| cookie | Idea-4401a678=46e214a2-e649-459c-94d2-61f9b18edb64; sidebar_collapsed=false; Idea-4401adf8=ed913581-acee-42f2-b17a-323a575a3d66; _ga=GA1.1.1104403428.1526306331 | 

## 源码地址

源码参见[servlet 请求头](https://github.com/houbb/servlet-learn/tree/master/servlet-base/src/main/java/com/github/houbb/servlet/learn/base/request/RequestHeaderServlet.java)

# 接口 UML

![HttpServletRequest](https://raw.githubusercontent.com/houbb/resource/master/img/web/servlet/20180928-servlet-HttpServletRequest.png)

# 参考资料

[Servlet 客户端 HTTP 请求](http://www.runoob.com/servlet/servlet-client-request.html)

[Servlet 请求](https://waylau.gitbooks.io/servlet-3-1-specification/docs/The%20Request/3.%20The%20Request.html)

《Head First Servlets and Jsp》

* any list
{:toc}