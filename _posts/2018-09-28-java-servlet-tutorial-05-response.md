---
layout: post
title: Java Servlet 教程-05-响应 HttpServletResponse
date:  2018-09-28 15:54:28 +0800
categories: [Java]
tags: [web, servlet, java, sh]
published: true
excerpt: Java Servlet 教程之响应 HttpServletResponse
---

# HttpServletResponse

响应对象封装了从服务器返回到客户端的所有信息。

在 HTTP 协议中，从服务器传输到客户端的信息通过 HTTP 头信息或响应的消息体。

# 缓冲

出于性能的考虑，servlet 容器允许（但不要求）缓存输出到客户端的内容。一般的，服务器是默认执行缓存，但应该允许 servlet 来指定缓存参数。

下面是 ServletResponse 接口允许 servlet 来访问和设置缓存信息的方法：

| 序号 | 方法 | 说明 |
|:---|:---|:---|
| 1 | getBufferSize |  方法返回使用的底层缓冲区大小。如果没有使用缓冲，该方法必须返回一个 int 值 0。 |
| 2 | setBufferSize |  设置一个最佳的缓冲大小。 |
| 3 | isCommitted |  方法返回一个表示是否有任何响应字节已经返回到客户端的boolean 值 |
| 4 | reset |  清除缓冲区中存在的任何数据，包括状态码和头。|
| 5 | resetBuffer |  清除响应中基础缓冲区的内容，不清除状态码和头。|
| 6 | flushBuffer |  强制刷出缓冲区的内容到客户端。|

不管 servlet 使用的是一个 ServletOutputStream 还是一个 Writer，ServletResponse 接口提供的这些方法允许执行缓冲操作。 

- setBufferSize

Servlet 可以请求 setBufferSize 方法设置一个最佳的缓冲大小。不一定分配 servlet 请求大小的缓冲区，但至少与请求的大小一样大。

这允许容器重用一组固定大小的缓冲区，如果合适，可以提供一个比请求时更大的缓冲区。

该方法必须在使用 ServletOutputStream 或 Writer 写任何内容之前调用。

如果已经写了内容或响应对象已经提交，则该方法必须抛出IllegalStateException。

# 响应头

servlet 可以通过下面 HttpServletResponse 接口的方法来设置 HTTP 响应头：

| 序号 | 方法 | 说明 |
|:---|:---|:---|
| 1 | setHeader |  setHeader 方法通过给定的名字和值来设置头。前面的头会被后来的新的头替换。如果已经存在同名的头集合的值，集合中的值会被清空并用新的值替换。 |
| 2 | addHeader | addHeader 方法使用给定的名字添加一个头值到集合。如果没有头与给定的名字关联，则创建一个新的集合。 |

## 类型

头可能包含表示 int 或 Date 对象的数据。

以下 HttpServletResponse 接口提供的便利方法允许 servlet 对适当的数据类型用正确的格式设置一个头：

| 序号 | 方法 | 说明 |
|:---|:---|:---|
| 1 | setIntHeader | 设置一个带有给定的名称和整数值的响应报头。 |
| 2 | setDateHeader | 设置一个带有给定的名称和日期值的响应报头。 |
| 3 | addIntHeader | 添加一个带有给定的名称和整数值的响应报头。 |
| 4 | addDateHeader | 添加一个带有给定的名称和日期值的响应报头。 |

为了成功的传回给客户端，头必须在响应提交前设置。响应提交后的头设置将被 servlet 容器忽略。

servlet 程序员负责保证为 servlet 生成的内容设置合适的响应对象的 `Content-Type` 头。

HTTP 1.1 规范中没有要求在 HTTP 响应中设置此头。

当 servlet 程序员没有设置该类型时，servlet 容器也不能设置默认的内容类型。

# 结束响应对象

当响应被关闭时，容器必须立即刷出响应缓冲区中的所有剩余的内容到客户端。

以下事件表明 servlet 满足了请求且响应对象即将关闭：

- servlet 的 service 方法终止。

- 响应的 setContentLength 或 setContentLengthLong 方法指定了大于零的内容量，且已经写入到响应。

- sendError 方法已调用。

- sendRedirect 方法已调用。

- AsyncContext 的 complete 方法已调用

# 响应对象的生命周期

每个响应对象是只有当在 servlet 的 service 方法的范围内或在 filter 的 doFilter 方法范围内是有效的，除非该组件关联的请求对象已经开启异步处理。

如果相关的请求已经启动异步处理，那么直到AsyncContext 的 complete 方法被调用，请求对象一直有效。

为了避免响应对象创建的性能开销，容器通常回收响应对象。

在相关的请求的 startAsync 还没有调用时，开发人员必须意识到保持到响应对象引用，超出之上描述的范围可能导致不确定的行为。

# 简便方法

HttpServletResponse 提供了如下简便方法：

| 序号 | 方法 | 说明 |
|:---|:---|:---|
| 1 | sendRedirect | 设置适当的头和内容体将客户端重定向到另一个地址。 |
| 2 | sendError | 设置适当的头和内容体用于返回给客户端返回错误消息。 |

- sendRedirect

sendRedirect 方法将设置适当的头和内容体将客户端重定向到另一个地址。

使用相对 URL 路径调用该方法是合法的，但是底层的容器必须将传回到客户端的相对地址转换为全路径 URL。

无论出于什么原因，如果给定的URL是不完整的，且不能转换为一个有效的URL，那么该方法必须抛出 IllegalArgumentException。

- sendError

sendError 方法将设置适当的头和内容体用于返回给客户端返回错误消息。

可以 sendError 方法提供一个可选的 String 参数用于指定错误的内容体。

如果响应已经提交并终止，这两个方法将对提交的响应产生负作用。

这两个方法调用后 servlet 将不会产生到客户端的后续的输出。这两个方法调用后如果有数据继续写到响应，这些数据被忽略。

如果数据已经写到响应的缓冲区，但没有返回到客户端（例如，响应没有提交），则响应缓冲区中的数据必须被清空并使用这两个方法设置的数据替换。

如果响应已提交，这两个方法必须抛出 IllegalStateException。

# 字节流/字符流

## 字符流

处理文本数据。

```java
PrintWriter writer = resp.getWrite();
write.println("some text content");
```

## 字节流 

处理一切字节流。

```java
ServletOutputStream outputStream = resp.getOutputStream();
out.write(byteArray);
```

## 实例

- RefreshResponseServlet.java

浏览器访问 [http://localhost:8081/refresh/response](http://localhost:8081/refresh/response)，
页面每 5S 刷新一次。

```java
import java.io.IOException;
import java.io.PrintWriter;

import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

@WebServlet("/refresh/response")
public class RefreshResponseServlet extends HttpServlet {
    private static final long serialVersionUID = 3434396917388573282L;

    @Override
    protected void doGet(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {
        // 设置刷新自动加载时间为 5 秒
        resp.setIntHeader("Refresh", 5);
        // 设置响应内容类型为纯文本，编码为 UTF8
        resp.setContentType("text/plain;charset=UTF-8");

        PrintWriter printWriter = resp.getWriter();
        long currentDate = System.currentTimeMillis();
        printWriter.println("当前时间：" + currentDate);
    }
}
```

# 内容类型

每一个 Response，都可以指定返回的文件类型。

指定方式，比如上面的 `resp.setContentType("text/plain;charset=UTF-8");`。

文件的类型繁多，通过 [MIME 类型](https://developer.mozilla.org/zh-CN/docs/Web/HTTP/Basics_of_HTTP/MIME_types/Complete_list_of_MIME_types) 来指定。

## 主要类型

两种主要的MIME类型在默认类型中扮演了重要的角色：
 
- `text/plain` 表示文本文件的默认值。

一个文本文件应当是人类可读的，并且不包含二进制数据。

- `application/octet-stream` 表示所有其他情况的默认值。

一种未知的文件类型应当使用此类型。浏览器在处理这些文件时会特别小心, 试图避免用户的危险行为.

## 为什么要指定内容类型？容器无法识别吗？

常见的静态文件，服务器可以知道对应的类型。

但是容器并不知道我们在读取什么文件，他只知道我们读取一些文件信息，然后将这些信息返回。

## 为什么不将返回结果直接指向资源本身？

1. 很多返回结果需要加工处理

2. 任何文件资源，我们都需要判断当前用户是否有下载当前文件的权限等。

# 重定向

如果你不想直接处理当前请求，你可以对返回的结果进行重定向。

## 代码实例

浏览器访问 [http://localhost:8081/response/redirect](http://localhost:8081/response/redirect)

```java
@WebServlet("/response/redirect")
public class ResponseRedirectServlet extends HttpServlet {

    private static final long serialVersionUID = 152429683757801800L;

    @Override
    protected void doGet(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {
        // 实际可以是权限校验，此处演示重定向写死
        boolean valid = false;
        if(valid) {
            PrintWriter printWriter = resp.getWriter();
            printWriter.write("校验通过!");
        } else {
            // 送你见 google
            resp.sendRedirect("http://google.com");
        }
    }
}
```

- 实际应用

你可以让用户登录验证，如果不通过，则跳转到登录界面。如果通过，则跳转到主页面。

ps: 此时，浏览器的 URL 会被改变。

# 请求分派 

- ResponseDispatchServlet.java

浏览器访问 [http://localhost:8081/response/dispatch](http://localhost:8081/response/dispatch) 的时候，
会被分派到 [http://localhost:8081/response/response](http://localhost:8081/response/response) 来处理。

但是此时浏览器仍然是不变的。

```java
@WebServlet("/response/dispatch")
public class ResponseDispatchServlet extends HttpServlet {

    private static final long serialVersionUID = -1402869967198142939L;

    @Override
    protected void doGet(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {
        // 实际可以是权限校验，此处演示重定向写死
        boolean valid = false;
        if(valid) {
            PrintWriter printWriter = resp.getWriter();
            printWriter.write("校验通过!");
        } else {
            // 送你见 google
            RequestDispatcher dispatcher = req.getRequestDispatcher("/refresh/response");
            dispatcher.forward(req, resp);
        }
    }

}
```

# 源码地址

源码参见 [servlet 响应](https://github.com/houbb/servlet-learn/tree/master/servlet-base/src/main/java/com/github/houbb/servlet/learn/base/response)

# 接口 UML

![HttpServletResponse](https://raw.githubusercontent.com/houbb/resource/master/img/web/servlet/20180928-servlet-HttpServletResponse.png)

# 参考资料

[HTTP 请求和响应格式](https://my.oschina.net/zhaoqian/blog/90315)

[resp](https://waylau.gitbooks.io/servlet-3-1-specification/docs/The%20Response/5%20The%20Response.html)


http://www.runoob.com/servlet/servlet-server-response.html

* any list
{:toc}