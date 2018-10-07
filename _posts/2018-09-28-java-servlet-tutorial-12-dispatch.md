---
layout: post
title: Java Servlet 教程-12-请求分发 RequestDispatcher
date:  2018-10-05 15:11:45 +0800
categories: [Java]
tags: [web, servlet, java, sh]
published: true
excerpt: Java Servlet 教程-12-请求分发 RequestDispatcher
---

# 分发请求

构建 Web 应用时，把请求转发给另一个 servlet 处理、或在请求中包含另一个 servlet 的输出通常是很有用的。

RequestDispatcher 接口提供了一种机制来实现这种功能。

当请求启用异步处理时，AsyncContext 允许用户将这个请求转发到servlet 容器。

# 获取 RequestDispatcher

## ServletContext

实现了 RequestDispatcher 接口的对象，可以从 ServletContext 中的下面方法得到：

### getRequestDispatcher

getRequestDispatcher 方法需要一个 String 类型的参数描述在ServletContext 作用域内的路径。

这个路径必须是相对于 ServletContext 的根路径，或以`/`开头，或者为空。

该方法根据这个路径使用 servlet 路径匹配规则（见第12章，请求映射到 servlet）来查找 servlet，把它包装成 RequestDispatcher 对象并返回。

如果基于给定的路径没有找到相应的 servlet，那么返回这个路径内容提供的RequestDispatcher。

### getNamedDispatcher

getNamedDispatcher 方法使用一个 ServletContext 知道的 servlet 名称作为参数。

如果找到一个 servlet，则把它包装成 RequestDispatcher 对象，并返回该对象。如果没有与给定名字相关的servlet，该方法必须返回 null。

## ServletRequest

为了让 RequestDispatcher 对象使用相对于当前请求路径的相对路径（不是相对于 ServletContext 根路径）获得一个 servlet，在 ServletRequest 接口中提供了 getRequestDispatcher 方法。

此方法的行为与 ServletContext 中同名的方法相似。Servlet 容器根据request 对象中的信息把给定的相对路径转换成当前 servlet 的完整路径。

例如，在以`/`作为上下文根路径和请求路径 /garden/tools.html 中，通过 ServletRequest.getRequestDispatcher("header.html") 获得的请求调度器和通过调用 ServletContext.getRequestDispatcher("/garden/header.html") 获得的完全一样。

## 请求调度器路径中的查询字符串

ServletContext 和 ServletRequest 中创建 RequestDispatcher 对象的方法使用的路径信息中允许附加可选的查询字符串信息。

比如，开发人员可以通过下面的代码来获得一个 RequestDispatcher：

```java
String path = “/raisins.jsp?orderno=5”;
RequestDispatcher rd = context.getRequestDispatcher(path);
rd.include(request, response);
```

查询字符串中指定的用来创建 RequestDispatcher 的参数优先于传递给它包含的 servlet 中的其他同名参数。

与 RequestDispatcher 相关的参数作用域仅适用于包含（include）或转发（forward）调用期间。

# 使用请求调度器

要使用请求调度器，servlet 可调用 RequestDispatcher 接口的include 或 forward 方法。

这些方法的参数既可以是javax.servlet.Servlet 接口的 service 方法传来的请求和响应对象实例，也可以是请求和响应包装器类的子类对象实例。

对于后者，包装器实例必须包装容器传递到 service 方法中的请求和响应对象。

容器提供者应该保证分发到目标 servlet 的请求作为原始请求发生在的同一个 JVM 的同一个线程中。

# Include 方法

RequestDispatcher 接口的 include 方法可以随时被调用。

Include 方法的目标 servlet 能够访问请求对象的各个方法（all aspects），但是使用响应对象的方法会受到更多限制。

它只能把信息写到响应对象的 ServletOutputStream 或 Writer 中，或提交在最后写保留在响应缓冲区中的内容，或通过显式地调用ServletResponse 接口的 flushBuffer 方法。它不能设置响应头部信息或调用任何影响响应头部信息的方法，HttpServletRequest.getSession() 和 HttpServletRequest.getSession(boolean) 方法除外。

任何试图设置头部信息必须被忽略，任何调用 HttpServletRequest.getSession() 和 HttpServletRequest.getSession(boolean) 方法将需要添加一个Cookie 响应头部信息，如果响应已经提交，必须抛出一个IllegalStateException 异常。

如果默认的 servlet 是 RequestDispatch.include() 的目标servlet，而且请求的资源不存在，那么默认的 servlet 必须抛出FileNotFoundException 异常。

如果这个异常没有被捕获和处理，以及响应还未提交，则响应状态码必须被设置为 500。

## 内置请求参数

除了用 getNamedDispatcher 方法获得的 servlets 外，被别的servlet使用RequestDispatcher的include方法调用过的servlet，有权访问调用者的 servlet 的路径。 

以下的请求属性必须被设置：

```java
javax.servlet.include.request_uri
javax.servlet.include.context_path
javax.servlet.include.servlet_path
javax.servlet.include.path_info
javax.servlet.include.query_string
```

这些属性可以通过包含的 servlet 的请求对象的 getAttribute 方法访问，它们的值必须分别与被包含 servlet 的请求 URI、上下文路径、servlet 路径、路径信息、查询字符串相等。

如果随后的请求包含这些属性，那么这些属性会被后面包含的属性值替换。

如果包含的 servlet 通过 getNamedDispatcher 方法获得，那么这些属性不能被设置。

## 实战代码

- DispathCommonServlet.java

```java
@WebServlet("/dispatch/common")
public class DispathCommonServlet extends HttpServlet {

    private static final long serialVersionUID = 6480436935396214625L;

    @Override
    protected void doGet(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {
        req.setAttribute("hello", "hello dispatch");
        resp.getWriter().write("This is DispathCommonServlet");
    }

}
```

- DispatchIncludeServlet.java

```java
@WebServlet("/dispatch/include")
public class DispatchIncludeServlet extends HttpServlet {

    private static final long serialVersionUID = -536111384377737122L;

    @Override
    protected void doGet(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {
        final String info = (String) req.getAttribute("hello");
        RequestDispatcher dispatcher  = req.getRequestDispatcher("/dispatch/common");
        resp.getWriter().write("DispathIncludeServlet write info: " + info + "\n");
        dispatcher.include(req, resp);
    }

}
```

- 访问

浏览器访问页面 [http://localhost:8081/dispatch/include](http://localhost:8081/dispatch/include)

页面内容如下：

```
DispathIncludeServlet write info: null
This is DispathCommonServlet
```

- 简单分析

在调用当前 servlet 之后，可以将 `DispathCommonServlet` 的内容包含在当前页面之中。

# Forward 方法

RequestDispatcher 接口的 forward 方法，只有在没有输出提交到向客户端时，通过正在被调用的 servlet 调用。

如果响应缓冲区中存在尚未提交的输出数据，这些数据内容必须在目标 servlet 的 service 方法调用前清除。如果响应已经提交，必须抛出一个 IllegalStateException 异常。

请求对象暴露给目标 servlet 的路径元素（path elements）必须反映获得 RequestDispatcher 使用的路径。

唯一例外的是，如果 RequestDispatcher 是通过 getNamedDispatcher方法获得。这种情况下，请求对象的路径元素必须反映这些原始请求。 在 RequestDispatcher 接口的 forward 方法无异常返回之前，响应的内容必须被发送和提交，且由 Servlet 容器关闭，除非请求处于异步模式。如果 RequestDispatcher.forward() 的目标发生错误，异常信息会传回所有调用它经过的过滤器和 servlet，且最终传回给容器。

## 查询字符串

在转发或包含请求时请求调度机制负责聚集（aggregating）查询字符串参数。

## 转发的请求参数

除了可以用 getNamedDispatcher 方法获得 servlet 外，已经被另一个servlet 使用 RequestDispatcher 的 forward 方法调用过的servlet，有权访问被调用过的 servlet 的路径。 

以下的请求属性必须设置：

```java
javax.servlet.forward.request_uri
javax.servlet.forward.context_path
javax.servlet.forward.servlet_path
javax.servlet.forward.path_info
javax.servlet.forward.query_string
```

这些属性的值必须分别与 HttpServletRequest 的 getRequestURI、getContextPath、 getServletPath、getPathInfo、getQueryString 方法的返回值相等，这些方法在从客户端接收到的请求对象上调用，值传递给调用链中的第一个 servlet 对象。

这些属性通过转发 servlet 的请求对象的 getAttribut 方法访问。

请注意，即使在多个转发和相继的包含（subsequent includes）被调用的情况下，这些属性必须始终反映原始请求中的信息。

如果转发的 servlet 使用 getNamedDispatcher 方法获得，这些属性必须不能被设置。

## 实战

- DispatchForwardServlet.java

```java
@WebServlet("/dispatch/forward")
public class DispatchForwardServlet extends HttpServlet {

    private static final long serialVersionUID = -536111384377737122L;

    @Override
    protected void doGet(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {
        RequestDispatcher dispatcher  = req.getRequestDispatcher("/dispatch/common");
        resp.getWriter().write("DispatchForwardServlet write sth...\n");
        dispatcher.forward(req, resp);
    }

}
```

- 访问

浏览器访问 [http://localhost:8081/dispatch/forward](http://localhost:8081/dispatch/forward)

页面内容：

```
This is DispathCommonServlet
```

浏览器的 URL 保持不变。

- 简单分析

当前页面显示的内容，其实已经跳转到 `/dispatch/common`，但是 URL 并没有改变。

后面会提到重定向，此时的 URL 会发生变化。

# 错误处理

如果请求分发的目标 servlet 抛出运行时异常或受检查类型异常ServletException 或 IOException，异常应该传播到调用的 servlet。

所有其它的异常都应该被包装成 ServletExceptions，异常的根本原因设置成原来的异常，因为它不应该被传播。

# 获取 AsyncContext

实现了 AsyncContext 接口的对象可从 ServletRequest 的一个startAsync 方法中获得，一旦有了 AsyncContext 对象，你就能够使用它的 complete() 方法来完成请求处理，或使用下面描述的转发方法。


## Dispatch 方法

全部方法参见 [RequestDispatcher](https://docs.oracle.com/javaee/7/api/javax/servlet/RequestDispatcher.html)

可以使用 AsyncContext 中下面的方法来转发请求：

- dispatch(path)

这个 dispatch 方法的 String 参数描述了一个在 ServletContext 作用域中的路径。这个路径必须是相对于 ServletContext 的根路径并以 `/` 开头。

- dispatch(servletContext, path)

这个 dispatch 方法的 String 参数描述了一个在 ServletContext 指定作用域中的路径。这个路径必须是相对于 ServletContext 的根路径并以 `/` 开头。

- dispatch()

这个方法没有参数，它使用原来的URI路径。

如果 AsyncContext 已经通过 startAsync(ServletRequest, ServletResponse) 初始化，且传递过来的请求是 HttpServletRequest 的实例，那么这个请求分发到HttpServletRequest.getRequestURI() 返回的 URI。否则转发到容器最后一次转发的URI。

AsyncContext 接口中的 dispatch 方法可被等待异步事件发生的应用程序调用。

如果 AsyncContext 已经调用了 complete() 方法，必须抛出IllegalStateException 异常。所有不同的 dispatch 方法会立即返回并且不会提交响应。

请求对象暴露给目标 servlet 的路径元素（path elements）必须反映AsyncContext.dispatch 中指定的路径

# 参考资料

https://github.com/waylau/servlet-3.1-specification/tree/master/docs/Dispatching%20Requests

[oracle doc](https://docs.oracle.com/javaee/7/api/javax/servlet/RequestDispatcher.html)

[关于RequestDispatcher的用法（include()和forward()的区别）](http://aguang520.iteye.com/blog/755004)

https://blog.csdn.net/qfs_v/article/details/2551762

https://www.jianshu.com/p/521e60847c9c

[servlet 网页重定向](http://www.runoob.com/servlet/servlet-page-redirect.html)

* any list
{:toc}