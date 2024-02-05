---
layout: post
title: Java Servlet 教程-03-生命周期
date:  2018-09-28 14:43:52 +0800
categories: [Java]
tags: [web, servlet, java, sh]
published: true
excerpt: Java Servlet 教程之生命周期
---

# 生命周期

![tomcat-servlet](https://raw.githubusercontent.com/houbb/resource/master/img/web/servlet/20180927-servlet-lifecycle.png)

## 整体流程

Servlet 生命周期可被定义为从创建直到毁灭的整个过程。

以下是 Servlet 遵循的过程：

1. Servlet 通过调用 init() 方法进行初始化。

2. Servlet 调用 service() 方法来处理客户端的请求。

3. Servlet 通过调用 destroy() 方法终止（结束）。

最后，Servlet 是由 JVM 的垃圾回收器进行垃圾回收的。

## init()

init 方法被设计成只调用一次。

它在第一次创建 Servlet 时被调用，在后续每次用户请求时不再调用。

Servlet 创建于用户第一次调用对应于该 Servlet 的 URL 时，但是您也可以指定 Servlet 在服务器第一次启动时被加载。

当用户调用一个 Servlet 时，就会创建一个 Servlet 实例，每一个用户请求都会产生一个新的线程，适当的时候移交给 doGet 或 doPost 方法。

init() 方法简单地创建或加载一些数据，这些数据将被用于 Servlet 的整个生命周期。

## service()

service() 方法是执行实际任务的主要方法。Servlet 容器（即 Web 服务器）调用 service() 方法来处理来自客户端（浏览器）的请求，并把格式化的响应写回给客户端。

每次服务器接收到一个 Servlet 请求时，服务器会产生一个新的线程并调用服务。

service() 方法检查 HTTP 请求类型（GET、POST、PUT、DELETE 等），并在适当的时候调用 doGet、doPost、doPut，doDelete 等方法。

service() 方法由容器调用，service 方法在适当的时候调用 doGet、doPost、doPut、doDelete 等方法。所以，

您不用对 service() 方法做任何动作，您只需要根据来自客户端的请求类型来重写 doGet() 或 doPost() 等方法即可。

ps: 即我们不需要覆写这个方法。

## destroy()

destroy() 方法只会被调用一次，在 Servlet 生命周期结束时被调用。

destroy() 方法可以让您的 Servlet 关闭数据库连接、停止后台线程、把 Cookie 列表或点击计数器写入到磁盘，并执行其他类似的清理活动。

在调用 destroy() 方法之后，servlet 对象被标记为垃圾回收。destroy 方法定义如下所示：

# Servlet 会被多次创建吗？

不会。

同一个 Servlet 只会被创建一次。

但是每次服务器接收到一个 Servlet 请求时，服务器会产生一个新的线程并调用 service()。

# 源码分析

## Servlet 接口
 
- Servlet.java

我们直接看最核心的类 `Servlet`，即可知道对应的几个核心方法。

与上面提到的生命周期一一对应。

```java
public interface Servlet {
    public void init(ServletConfig config) throws ServletException;
    
    public ServletConfig getServletConfig();
    
    public void service(ServletRequest req, ServletResponse res) throws ServletException, IOException;

    public String getServletInfo();
    
    public void destroy();
}
```

## service()

Servlet 的实现类我们最常用的 HttpServlet。

此方法的核心实现如下:

```java
protected void service(HttpServletRequest req, HttpServletResponse resp)
	throws ServletException, IOException
    {
	String method = req.getMethod();

	if (method.equals(METHOD_GET)) {
	    long lastModified = getLastModified(req);
	    if (lastModified == -1) {
		// servlet doesn't support if-modified-since, no reason
		// to go through further expensive logic
		doGet(req, resp);
	    } else {
		long ifModifiedSince = req.getDateHeader(HEADER_IFMODSINCE);
		if (ifModifiedSince < (lastModified / 1000 * 1000)) {
		    // If the servlet mod time is later, call doGet()
                    // Round down to the nearest second for a proper compare
                    // A ifModifiedSince of -1 will always be less
		    maybeSetLastModified(resp, lastModified);
		    doGet(req, resp);
		} else {
		    resp.setStatus(HttpServletResponse.SC_NOT_MODIFIED);
		}
	    }

	} else if (method.equals(METHOD_HEAD)) {
        //...
    }
    //...
}
```

说白了，就是按照不同的 HTTP 请求类型，调用 Servlet 中对应的 doGet(), doPost()... 等方法。


# 更多的思考

## Servlet 的加载

### 发现

TODO...

### 加载

1. 容器启动时加载完成

2. 用户调用时启动完成

对于一个 Servlet 而言，init() 方法执行完成之后，才会调用 service() 方法。

## Servlet 初始化

容器会调用 Servlet.init() 方法，使其成为一个真正的 servlet。

真正的 servlet 具有下面的两个特性：

- ServletConfig

1. 每个 Servlet 程序都对应一个 ServletConfig 对象

2. ServletConfig 配置初始化数据，只能在配置Servlet获得，其他Servlet无法获得 

- ServletContext

1. 每个 web 应用都有一个  ServletContext(叫做 AppContext 更加适合)

2. 每一个工程对应创建单独 ServletContext 对象，这个对象代表当前 web 工程

3. 操作 ServletContext 必须通过 ServletConfig 获得对象

## Servlet 真正的任务

暂时不对 ServletConfig、ServletContext 做过于深入的研究。

二者的存在，也只是为了一个目的：**更好的处理请求**。

# ServletRequest & ServletResponse

`service(ServletRequest req, ServletResponse res)` 方法中，我们可以看到两个非常关键的类。

## ServletRequest

代表一个HTTP请求，请求在内存中是一个对象，这个对象是一个容器，可以存放请求参数和属性。
 
1、请求对象何时被创建，当通过URL访问一个JSP或者Servlet的时候，也就是当调用Servlet的service()、doPut()、doPost()、doXxx()方法时候的时候，执行Servlet的web服服务器就自动创建一个ServletRequest和ServletResponse的对象，传递给服务方法作为参数。
 
2、请求对象由Servlet容器自动产生，这个对象中自动封装了请求中get和post方式提交的参数，以及请求容器中的属性值，还有http头等等。当Servlet或者JSP得到这个请求对象的时候，就知道这个请求时从哪里发出的，请求什么资源，带什么参数等等。
 
3、ServletRequest的层次结构

```java
javax.servlet.ServletRequest 
  javax.servlet.http.HttpServletRequest
```
 
4、通过请求对象，可以获得Session对象和客户端的Cookie。
 
5、请求需要指定URL，浏览器根据URL生成HTTP请求并发送给服务器，请求的URL有一定的规范。

## ServletResponse

相应对象有以下功能：

1、向客户端写入 Cookie

2、重写 URL

3、获取输出流对象，向客户端写入文本或者二进制数据

4、设置响应客户端浏览器的字符编码类型

5、设置客户端浏览器的MIME类型。


# 请求处理方法

看了上面的源码分析，我们知道 service 会根据请求的不同进行相应的方法路由。

最核心的方法是 `doGet()` 和 `doPost()`。

## doGet()

doGet 处理 HTTP GET 请求

## doPost()

处理 HTTP POST 请求

## 其他

- doPut 处理 HTTP PUT 请求

- doDelete 处理 HTTP DELETE 请求

- doHead 处理 HTTP HEAD 请求

- doOptions 处理 HTTP OPTIONS 请求

- doTrace 处理 HTTP TRACE 请求

## 拓展阅读

[HTTP Get 和 Post的区别](https://houbb.github.io/2018/09/27/http-get-post)

# 参考资料

http://www.runoob.com/servlet/servlet-life-cycle.html

https://waylau.gitbooks.io/servlet-3-1-specification/docs/The%20Servlet%20Interface/2.3%20Servlet%20Life%20Cycle.html

- ServletContext

[ServletContext & ServletConfig](https://www.cnblogs.com/smyhvae/p/4140877.html)

[深入理解ServletRequest与ServletResponse](http://blog.51cto.com/lavasoft/275586)

* any list
{:toc}