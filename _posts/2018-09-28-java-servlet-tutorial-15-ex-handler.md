---
layout: post
title: Java Servlet 教程-15-Servlet 异常处理
date:  2018-10-06 12:54:52 +0800
categories: [Java]
tags: [web, servlet, java, sh]
published: true
excerpt: Java Servlet 教程-15-Servlet 异常处理
---

# 异常处理

## 请求属性

在发生错误时，Web 应用程序必须能够详细说明，应用程序中的其他资源被用来提供错误响应的内容主体。这些资源的规定在部署描述文件中配置。

如果错误处理位于一个servlet或JSP页面：

原来打开的由容器创建的请求和响应对象被传递给servlet或JSP页面。

请求路径和属性被设置成如同 `RequestDispatcher.forward()` 跳转到已经完成的错误资源一样。
必须设置表10-1中的请求属性。

| 序号 | 属性 | 说明 |
|:---|:---|:---|
| 1 | javax.servlet.error.status_code | 该属性给出状态码，状态码可被存储，并在存储为 java.lang.Integer 数据类型后可被分析。 |
| 2 | javax.servlet.error.exception_type | 该属性给出异常类型的信息，异常类型可被存储，并在存储为 java.lang.Class 数据类型后可被分析。 |
| 3 | javax.servlet.error.message | 该属性给出确切错误消息的信息，信息可被存储，并在存储为 java.lang.String 数据类型后可被分析。 |
| 4 | javax.servlet.error.request_uri | 该属性给出有关 URL 调用 Servlet 的信息，信息可被存储，并在存储为 java.lang.String 数据类型后可被分析。 |
| 5 | javax.servlet.error.exception | 该属性给出异常产生的信息，信息可被存储，并在存储为 java.lang.Throwable 数据类型后可被分析。 |
| 6 | javax.servlet.error.servlet_name | 该属性给出 Servlet 的名称，名称可被存储，并在存储为 java.lang.String 数据类型后可被分析。 |


## 错误页面

为了使开发人员能够在 servlet 产生一个错误时自定义内容的外观返回到 Web 客户端，部署描述文件中定义了一组错误页面说明。

这种语法允许当 servlet 或过滤器调用响应对象的 sendError 方法指定状态码时，或如果 servlet 产生一个异常或错误传播给容器时，由容器返回资源配置。

如果调用应对象的 sendError 方法，容器参照为 Web 应用声明的错误页面列表，使用状态码语法并试图匹配一个错误页面。如果找到一个匹配的错误页面，容器返回这个位置条目指示的资源。

在处理请求的时候 servlet 或过滤器可能会抛出以下异常：

- 运行时异常或错误

- ServletException或它的子类异常

- IOException或它的子类异常

Web 应用程序可以使用 exception-type 元素声明错误页面。

在这种情况下，容器通过比较抛出的异常与使用 exception-type 元素定义的error-page 列表来匹配异常类型。

在容器中的匹配结果返回这个位置条目指示的资源。在类层次中最接近的匹配将被返回。

如果声明的 error-page 中没有包含 exception-type 适合使用的类层次结构的匹配，那么抛出一个 ServletException 异常或它的子类异常，容器通过 ServletException.getRootCause 方法提取包装的异常。

第二遍通过修改错误页面声明，使用包装的异常再次尝试匹配声明的错误页面。

使用 exception-type 元素声明的 error-page 在部署描述文件中必须唯一的，由 exception-type 的类名决定它的唯一性。

同样地， 使用status-code 元素声明的 error-page 在部署描述文件中必须是唯一的，由状态码决定它的唯一性。

如果部署描述中的一个 error-page 元素没包含一个 exception-type 或 error-code 元素，错误页面时默认的错误页面。

当错误发生时，错误页面机制不会干预调用使用 RequestDispatcher 或filter.doFilter 方法。用这种方法，过滤器或 Servlet 有机会使用RequestDispatcher 处理产生的错误。

如果上述错误页面机制没有处理 servlet 产生的错误，那么容器必须确保发送一个状态500的响应。

默认的 servlet 和容器将使用 sendError 方法，发送4xx和5xx状态的响应，这样错误机制才可能会被调用。默认的servlet和容器将使用setStatus 方法，设置2xx和3xx的响应，并不会调用错误页面机制。

如果应用程序使用“异步处理”中描述的异步操作，那么处理应用程序创建的线程的所有错误是应用程序的职责。

容器应该通过 AsyncContext.start() 方法注意线程发出的错误。

对于处理 AsyncContext.dispatch() 过程中发生的错误，请参照相关章节，“执行dispatch 方法的时候可能发生的错误或异常必须被容器按照如下的方式捕获并处理”。

## 错误过滤器

错误页面机制运行在由容器创建的原来未包装过的或未经过过滤的请求或响应对象上。

在第6.2.5节“过滤器和请求转发”中描述的机制可以在产生一个错误响应之前用来指定要应用的过滤器。

## 自定义错误信息

我们也可以自己定义错误信息

```java
response.sendError(403);
```

# 实战代码

## 代码

- ErrorHandlerServlet.java

定义一个处理异常的 servlet 

```java
@WebServlet("/error/handler")
public class ErrorHandlerServlet extends HttpServlet {

    private static final long serialVersionUID = 9088434758533380059L;

    @Override
    protected void doGet(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {
        PrintWriter printWriter = resp.getWriter();
        printWriter.println("servlet_name:   " + req.getAttribute("javax.servlet.error.servlet_name"));
        printWriter.println("status_code:   " + req.getAttribute("javax.servlet.error.status_code"));
        printWriter.println("exception_type:   " + req.getAttribute("javax.servlet.error.exception_type"));
        printWriter.println("message:   " + req.getAttribute("javax.servlet.error.message"));
        printWriter.println("request_uri:   " + req.getAttribute("javax.servlet.error.request_uri"));
        printWriter.println("exception:   " + req.getAttribute("javax.servlet.error.exception"));
    }

}
```

- web.xml

我们同时需要在 `web.xml` 中指定对应的错误页面映射关系。

可以根据错误编码，或者错误类型来指定。

```xml
<error-page>
    <error-code>404</error-code>
    <location>/error/handler</location>
</error-page>
<error-page>
    <exception-type>java.lang.Throwable</exception-type>
    <location>/error/handler</location>
</error-page>
```

## 测试

使用浏览器访问 [http://localhost:8081/error/handler/adfasdfasdf](http://localhost:8081/error/handler/adfasdfasdf)

(故意使用一个不存在页面)

页面内容

```
servlet_name:   default
status_code:   404
exception_type:   null
message:   /error/handler/adfasdfasdf
request_uri:   /error/handler/adfasdfasdf
exception:   null
```

# 参考资料

http://www.runoob.com/servlet/servlet-exception-handling.html

https://github.com/waylau/servlet-3.1-specification/blob/master/docs/Web%20Applications/10.9%20Error%20Handling.md

* any list
{:toc}