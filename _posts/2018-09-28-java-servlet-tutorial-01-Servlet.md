---
layout: post
title: Java Servlet 教程-01- Servlet
date:  2016-07-12 21:09:35 +0800
categories: [Java]
tags: [servlet]
published: false
---

* any list
{:toc}

# Servlet

Java Servlet 是运行在 Web 服务器或应用服务器上的程序，它是作为来自 Web 浏览器或其他 HTTP 客户端的请求和 HTTP 服务器上的数据库或应用程序之间的中间层。

使用 Servlet，您可以收集来自网页表单的用户输入，呈现来自数据库或者其他源的记录，还可以动态创建网页。

- Servlet 在 Web 服务器的地址空间内执行。这样它就没有必要再创建一个单独的进程来处理每个客户端请求。

- Servlet 是独立于平台的，因为它们是用 Java 编写的。

- 服务器上的 Java 安全管理器执行了一系列限制，以保护服务器计算机上的资源。因此，Servlet 是可信的。

- Java 类库的全部功能对 Servlet 来说都是可用的。它可以通过 sockets 和 RMI 机制与 applets、数据库或其他软件进行交互。

<uml>
    Web Browser->Http Server: Http protocol
    Http Server->Servlets program:
    Servlets program->database:
</uml>


# Servlet 生命周期

Servlet 生命周期可被定义为从创建直到毁灭的整个过程。以下是 Servlet 遵循的过程：

- Servlet 通过调用 init () 方法进行初始化。
- Servlet 调用 service() 方法来处理客户端的请求。
- Servlet 通过调用 destroy() 方法终止（结束）。
- 最后，Servlet 是由 JVM 的垃圾回收器进行垃圾回收的。

> init()

init 方法被设计成只调用一次。它在第一次创建 Servlet 时被调用，在后续每次用户请求时不再调用。init() 方法简单地创建或加载一些数据，这些数据将被用于 Servlet 的整个生命周期。
Servlet 创建于**用户第一次调用对应于该 Servlet 的 URL 时**，但是您也可以指定 Servlet 在服务器第一次启动时被加载。
当用户调用一个 Servlet 时，就会创建一个 Servlet 实例，每一个用户请求都会产生一个新的线程，适当的时候移交给 doGet() 或 doPost() 方法。

```java
@Override
public void init() throws ServletException {
    super.init();
}
```

> service()

service() 方法是执行实际任务的主要方法。Servlet 容器（即 Web 服务器）调用 service() 方法来处理来自客户端（浏览器）的请求，并把格式化的响应写回给客户端。
每次服务器接收到一个 Servlet 请求时，服务器会产生一个新的线程并调用服务。service() 方法检查 HTTP 请求类型（GET、POST、PUT、DELETE 等），并在适当的时候调用 doGet、doPost、doPut，doDelete 等方法。

```java
@Override
public void service(ServletRequest req, ServletResponse res) throws ServletException, IOException {
    super.service(req, res);
}
```

> doGet()

GET 请求来自于一个 URL 的正常请求，或者来自于一个未指定 METHOD 的 HTML 表单，它由 doGet() 方法处理。

```java
@Override
protected void doGet(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {
    super.doGet(req, resp);
}
```

> doPost()

POST 请求来自于一个特别指定了 METHOD 为 POST 的 HTML 表单，它由 doPost() 方法处理。

```java
@Override
protected void doPost(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {
    super.doPost(req, resp);
}
```

> destroy()

destroy() 方法只会被调用一次，在 Servlet **生命周期结束时被调用**。destroy() 方法可以让您的 Servlet 关闭数据库连接、停止后台线程、把 Cookie 列表或点击计数器写入到磁盘，并执行其他类似的清理活动。
在调用 destroy() 方法之后，servlet 对象被标记为垃圾回收。destroy 方法定义如下所示：

```java
@Override
public void destroy() {
    super.destroy();
}
```


# Hello World

- maven jar,必须设置 ```<scope>provided</scope>```

```xml
<project xmlns="http://maven.apache.org/POM/4.0.0" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
         xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 http://maven.apache.org/maven-v4_0_0.xsd">
    <modelVersion>4.0.0</modelVersion>
    <groupId>com.ryo</groupId>
    <artifactId>servlet</artifactId>
    <packaging>war</packaging>
    <version>1.0-SNAPSHOT</version>
    <name>servlet Maven Webapp</name>
    <url>http://maven.apache.org</url>

    <properties>
        <project.build.sourceEncoding>UTF-8</project.build.sourceEncoding>
        <plugin.tomcat.version>2.2</plugin.tomcat.version>
    </properties>

    <dependencies>
        <dependency>
            <groupId>javax.servlet</groupId>
            <artifactId>servlet-api</artifactId>
            <version>2.5</version>
            <scope>provided</scope>
        </dependency>
    </dependencies>

    <build>
        <finalName>servlet</finalName>
        <plugins>
            <plugin>
                <groupId>org.apache.tomcat.maven</groupId>
                <artifactId>tomcat7-maven-plugin</artifactId>
                <version>${plugin.tomcat.version}</version>
                <configuration>
                    <port>8081</port>
                    <path>/</path>
                    <uriEncoding>${project.build.sourceEncoding}</uriEncoding>
                </configuration>
            </plugin>
        </plugins>
    </build>
</project>

```

- HelloWorld.java

```java
package com.ryo.servlet;


import javax.servlet.ServletException;
import javax.servlet.ServletRequest;
import javax.servlet.ServletResponse;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.io.PrintWriter;

/**
 * Created by houbinbin on 16/7/12.
 */
public class HelloWorld extends HttpServlet {
    private String message = null;

    @Override
    public void init() throws ServletException {
        message = "hello world";
    }

    @Override
    protected void doGet(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {
        // 设置响应内容类型
        resp.setContentType("text/html");
        resp.setContentType("text/html;charset=UTF-8");

        // 实际的逻辑是在这里
        PrintWriter out = resp.getWriter();
        out.println("<h1>" + message + "</h1>");
    }

    @Override
    protected void doPost(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {
        super.doPost(req, resp);
    }

    @Override
    public void service(ServletRequest req, ServletResponse res) throws ServletException, IOException {
        super.service(req, res);
    }

    @Override
    public void destroy() {
        super.destroy();
    }
}
```

- web.xml

```xml
<!DOCTYPE web-app PUBLIC
 "-//Sun Microsystems, Inc.//DTD Web Application 2.3//EN"
 "http://java.sun.com/dtd/web-app_2_3.dtd" >

<web-app>
  <display-name>Archetype Created Web Application</display-name>

  <servlet>
    <servlet-name>HelloWorld</servlet-name>
    <servlet-class>com.ryo.servlet.HelloWorld</servlet-class>
  </servlet>

  <servlet-mapping>
    <servlet-name>HelloWorld</servlet-name>
    <url-pattern>/HelloWorld</url-pattern>
  </servlet-mapping>

</web-app>
```

- visit

```
http://localhost:8081/HelloWorld
```

# Servlet 表单数据

> GET 方法

GET 方法向页面请求发送已编码的用户信息。页面和已编码的信息中间用 ```?``` 字符分隔，如下所示：

```
http://www.test.com/hello?key1=value1&key2=value2
```

GET 方法是默认的从浏览器向 Web 服务器传递信息的方法，它会产生一个很长的字符串，出现在浏览器的地址栏中。

- 如果您要向服务器传递的是密码或其他的敏感信息，请不要使用 GET 方法。
- GET 方法有大小限制：请求字符串中最多只能有 1024 个字符。

这些信息使用 QUERY_STRING 头传递，并可以通过 QUERY_STRING 环境变量访问，Servlet 使用 doGet() 方法处理这种类型的请求。

> POST 方法

另一个向后台程序传递信息的比较可靠的方法是 POST 方法。POST 方法打包信息的方式与 GET 方法基本相同，
但是 POST 方法不是把信息作为 URL 中 ? 字符后的文本字符串进行发送，而是把这些信息作为一个单独的消息。
消息以标准输出的形式传到后台程序，您可以解析和使用这些标准输出。Servlet 使用 doPost() 方法处理这种类型的请求。

> 使用 Servlet 读取表单数据

Servlet 处理表单数据，这些数据会根据不同的情况使用不同的方法自动解析：

- getParameter()：您可以调用 request.getParameter() 方法来获取表单参数的值。
- getParameterValues()：如果参数出现一次以上，则调用该方法，并返回多个值，例如复选框。
- getParameterNames()：如果您想要得到当前请求中的所有参数的完整列表，则调用该方法。

> GET Demo

- pom.xml

```xml
<dependency>
    <groupId>org.apache.tomcat</groupId>
    <artifactId>tomcat-servlet-api</artifactId>
    <version>9.0.0.M8</version>
    <scope>provided</scope>
</dependency>
```

- GetDemo.java

```java
package com.ryo.servlet;

import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.io.PrintWriter;

/**
 * Created by houbinbin on 16/7/12.
 */
@WebServlet(name = "GetDemo", urlPatterns = "/GetDemo")
public class GetDemo extends HttpServlet {
    @Override
    protected void doGet(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {
        // 设置响应内容类型
        resp.setContentType("text/html;charset=UTF-8");

        PrintWriter out = resp.getWriter();
        String title = "使用 GET 方法读取表单数据";
        String docType =  "<!DOCTYPE html>\n";
        out.println(docType +
                "<html>\n" +
                "<head><title>" + title + "</title></head>\n" +
                "<body bgcolor=\"#f0f0f0\">\n" +
                "<h1 align=\"center\">" + title + "</h1>\n" +
                "<ul>\n" +
                "  <li><b>名字</b>："
                + req.getParameter("name") + "\n" +
                "  <li><b>年龄</b>："
                + req.getParameter("age") + "\n" +
                "</ul>\n" +
                "</body></html>");
    }
}
```

- url

```
http://localhost:8081/GetDemo?name=ryo&age=23
```

> PostDemo

- add doPost() in GetDemo.java

```java
 @Override
protected void doPost(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {
    System.out.println("do post called...");
    doGet(req, resp);
}
```

- add welcome file index.html

```html
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>菜鸟教程(runoob.com)</title>
</head>
<body>
<form action="/GetDemo" method="POST">
    名字：<input type="text" name="name">
    <br />
    年龄：<input type="text" name="age"/>
    <input type="submit" value="提交" />
</form>
</body>
</html>
```

- change web.xml

```xml
<welcome-file-list>
    <welcome-file>index.html</welcome-file>
</welcome-file-list>
```


# Servlet 客户端 HTTP 请求

> 读取 HTTP 头的方法

下面的方法可用在 Servlet 程序中读取 HTTP 头。这些方法通过 ```HttpServletRequest``` 对象可用。

- 1	Cookie[] getCookies()
返回一个数组，包含客户端发送该请求的所有的 Cookie 对象。
- 2	Enumeration getAttributeNames()
返回一个枚举，包含提供给该请求可用的属性名称。
- 3	Enumeration getHeaderNames()
返回一个枚举，包含在该请求中包含的所有的头名。
- 4	Enumeration getParameterNames()
返回一个 String 对象的枚举，包含在该请求中包含的参数的名称。
- 5	HttpSession getSession()
返回与该请求关联的当前 session 会话，或者如果请求没有 session 会话，则创建一个。
- 6	HttpSession getSession(boolean create)
返回与该请求关联的当前 HttpSession，或者如果没有当前会话，且创建是真的，则返回一个新的 session 会话。
- 7	Locale getLocale()
基于 Accept-Language 头，返回客户端接受内容的首选的区域设置。
- 8	Object getAttribute(String name)
以对象形式返回已命名属性的值，如果没有给定名称的属性存在，则返回 null。
- 9	ServletInputStream getInputStream()
使用 ServletInputStream，以二进制数据形式检索请求的主体。
- 10	String getAuthType()
返回用于保护 Servlet 的身份验证方案的名称，例如，"BASIC" 或 "SSL"，如果JSP没有受到保护则返回 null。
- 11	String getCharacterEncoding()
返回请求主体中使用的字符编码的名称。
- 12	String getContentType()
返回请求主体的 MIME 类型，如果不知道类型则返回 null。
- 13	String getContextPath()
返回指示请求上下文的请求 URI 部分。
- 14	String getHeader(String name)
以字符串形式返回指定的请求头的值。
- 15	String getMethod()
返回请求的 HTTP 方法的名称，例如，GET、POST 或 PUT。
- 16	String getParameter(String name)
以字符串形式返回请求参数的值，或者如果参数不存在则返回 null。
- 17	String getPathInfo()
当请求发出时，返回与客户端发送的 URL 相关的任何额外的路径信息。
- 18	String getProtocol()
返回请求协议的名称和版本。
- 19	String getQueryString()
返回包含在路径后的请求 URL 中的查询字符串。
- 20	String getRemoteAddr()
返回发送请求的客户端的互联网协议（IP）地址。
- 21	String getRemoteHost()
返回发送请求的客户端的完全限定名称。
- 22	String getRemoteUser()
如果用户已通过身份验证，则返回发出请求的登录用户，或者如果用户未通过身份验证，则返回 null。
- 23	String getRequestURI()
从协议名称直到 HTTP 请求的第一行的查询字符串中，返回该请求的 URL 的一部分。
- 24	String getRequestedSessionId()
返回由客户端指定的 session 会话 ID。
- 25	String getServletPath()
返回调用 JSP 的请求的 URL 的一部分。
- 26	String[] getParameterValues(String name)
返回一个字符串对象的数组，包含所有给定的请求参数的值，如果参数不存在则返回 null。
- 27	boolean isSecure()
返回一个布尔值，指示请求是否使用安全通道，如 HTTPS。
- 28	int getContentLength()
以字节为单位返回请求主体的长度，并提供输入流，或者如果长度未知则返回 -1。
- 29	int getIntHeader(String name)
返回指定的请求头的值为一个 int 值。
- 30	int getServerPort()
返回接收到这个请求的端口号。

> Header request Demo

```java
package com.ryo.servlet;

import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.io.PrintWriter;
import java.util.Enumeration;

/**
 * Created by houbinbin on 16/7/12.
 */
@WebServlet(name = "displayHeader", urlPatterns = "/displayHeader")
public class DisplayHeaderServlet extends HttpServlet {
    @Override
    protected void doGet(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {
        // 设置响应内容类型
        resp.setContentType("text/html;charset=UTF-8");

        PrintWriter out = resp.getWriter();
        String title = "HTTP Header 请求实例";
        String docType = "<!DOCTYPE html>\n";
        out.println(docType +
                "<html>\n" +
                "<head><title>" + title + "</title></head>\n"+
                "<body bgcolor=\"#f0f0f0\">\n" +
                "<h1 align=\"center\">" + title + "</h1>\n" +
                "<table width=\"100%\" border=\"1\" align=\"center\">\n" +
                "<tr bgcolor=\"#949494\">\n" +
                "<th>Header 名称</th><th>Header 值</th>\n"+
                "</tr>\n");

        Enumeration headerNames = req.getHeaderNames();

        while(headerNames.hasMoreElements()) {
            String paramName = (String)headerNames.nextElement();
            out.print("<tr><td>" + paramName + "</td>\n");
            String paramValue = req.getHeader(paramName);
            out.println("<td> " + paramValue + "</td></tr>\n");
        }
        out.println("</table>\n</body></html>");
    }
}
```

# Servlet 服务器 HTTP 响应

正如前面的章节中讨论的那样，当一个 Web 服务器响应一个 HTTP 请求时，响应通常包括一个*状态行*、一些*响应报头*、一个*空行和文档*。一个典型的响应如下所示：

```html
HTTP/1.1 200 OK
Content-Type: text/html
Header2: ...
...
HeaderN: ...
  (Blank Line)
<!DOCTYPE html>
<html>
<head>...</head>
<body>
...
</body>
</html>
```

> 设置 HTTP 响应报头的方法

下面的方法可用于在 Servlet 程序中设置 HTTP 响应报头。这些方法通过 ```HttpServletResponse``` 对象可用。

- 1	String encodeRedirectURL(String url)
为 sendRedirect 方法中使用的指定的 URL 进行编码，或者如果编码不是必需的，则返回 URL 未改变。
- 2	String encodeURL(String url)
对包含 session 会话 ID 的指定 URL 进行编码，或者如果编码不是必需的，则返回 URL 未改变。
- 3	boolean containsHeader(String name)
返回一个布尔值，指示是否已经设置已命名的响应报头。
- 4	boolean isCommitted()
返回一个布尔值，指示响应是否已经提交。
- 5	void addCookie(Cookie cookie)
把指定的 cookie 添加到响应。
- 6	void addDateHeader(String name, long date)
添加一个带有给定的名称和日期值的响应报头。
- 7	void addHeader(String name, String value)
添加一个带有给定的名称和值的响应报头。
- 8	void addIntHeader(String name, int value)
添加一个带有给定的名称和整数值的响应报头。
- 9	void flushBuffer()
强制任何在缓冲区中的内容被写入到客户端。
- 10	void reset()
清除缓冲区中存在的任何数据，包括状态码和头。
- 11	void resetBuffer()
清除响应中基础缓冲区的内容，不清除状态码和头。
- 12	void sendError(int sc)
使用指定的状态码发送错误响应到客户端，并清除缓冲区。
- 13	void sendError(int sc, String msg)
使用指定的状态发送错误响应到客户端。
- 14	void sendRedirect(String location)
使用指定的重定向位置 URL 发送临时重定向响应到客户端。
- 15	void setBufferSize(int size)
为响应主体设置首选的缓冲区大小。
- 16	void setCharacterEncoding(String charset)
设置被发送到客户端的响应的字符编码（MIME 字符集）例如，UTF-8。
- 17	void setContentLength(int len)
设置在 HTTP Servlet 响应中的内容主体的长度，该方法设置 HTTP Content-Length 头。
- 18	void setContentType(String type)
如果响应还未被提交，设置被发送到客户端的响应的内容类型。
- 19	void setDateHeader(String name, long date)
设置一个带有给定的名称和日期值的响应报头。
- 20	void setHeader(String name, String value)
设置一个带有给定的名称和值的响应报头。
- 21	void setIntHeader(String name, int value)
设置一个带有给定的名称和整数值的响应报头。
- 22	void setLocale(Locale loc)
如果响应还未被提交，设置响应的区域。
- 23	void setStatus(int sc)
为该响应设置状态码。

> Header response Demo

```java
package com.ryo.servlet;

import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.io.PrintWriter;
import java.util.Calendar;
import java.util.GregorianCalendar;

/**
 * Created by houbinbin on 16/7/12.
 */
@WebServlet(name = "refresh", urlPatterns = "/refresh")
public class RefreshServlet extends HttpServlet {
    @Override
    protected void doGet(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {
        // 设置刷新自动加载时间为 5 秒
        resp.setIntHeader("Refresh", 5);
        // 设置响应内容类型
        resp.setContentType("text/html;charset=UTF-8");

        // Get current time
        Calendar calendar = new GregorianCalendar();
        int hour = calendar.get(Calendar.HOUR);
        int minute = calendar.get(Calendar.MINUTE);
        int second = calendar.get(Calendar.SECOND);
        String am_pm = calendar.get(Calendar.AM_PM) == 0 ? "AM" : "PM";
        String CT = hour+":"+ minute +":"+ second +" "+ am_pm;

        PrintWriter out = resp.getWriter();
        String title = "自动刷新 Header 设置";
        String docType = "<!DOCTYPE html>\n";

        out.println(docType +
                "<html>\n" +
                "<head><title>" + title + "</title></head>\n"+
                "<body bgcolor=\"#f0f0f0\">\n" +
                "<h1 align=\"center\">" + title + "</h1>\n" +
                "<p>当前时间是：" + CT + "</p>\n");
    }
}
```

# Servlet HTTP 状态码

> HTTP 请求和 HTTP 响应消息的格式是类似的，结构如下：

- 初始状态行 + 回车换行符（回车+换行）
- 零个或多个标题行+回车换行符
- 一个空白行，即回车换行符
- 一个可选的消息主体，比如文件、查询数据或查询输出

例如，服务器的响应头如下所示：

```html
HTTP/1.1 200 OK
Content-Type: text/html
Header2: ...
...
HeaderN: ...
  (Blank Line)
<!doctype html>
<html>
<head>...</head>
<body>
...
</body>
</html>
```

> 状态码

- 200	OK	请求成功。

- 300	Multiple Choices	链接列表。用户可以选择一个链接，进入到该位置。最多五个地址。

- 301	Moved Permanently	所请求的页面已经转移到一个新的 URL。

- 302	Found	所请求的页面已经临时转移到一个新的 URL。

- 303	See Other	所请求的页面可以在另一个不同的 URL 下被找到。

- 400	Bad Request	服务器不理解请求。

- 401	Unauthorized	所请求的页面需要用户名和密码。

- 402	Payment Required	您还不能使用该代码。

- 403	Forbidden	禁止访问所请求的页面。

- 404	Not Found	服务器无法找到所请求的页面。.

- 405	Method Not Allowed	在请求中指定的方法是不允许的。

- 500	Internal Server Error	未完成的请求。服务器遇到了一个意外的情况。

> 设置 HTTP 状态代码的方法

- 1	public void setStatus ( int statusCode )
该方法设置一个任意的状态码。setStatus 方法接受一个 int（状态码）作为参数。如果您的反应包含了一个特殊的状态码和文档，请确保在使用 PrintWriter 实际返回任何内容之前调用 setStatus。

- 2	public void sendRedirect(String url)
该方法生成一个 302 响应，连同一个带有新文档 URL 的 Location 头。

- 3	public void sendError(int code, String message)
该方法发送一个状态码（通常为 404），连同一个在 HTML 文档内部自动格式化并发送到客户端的短消息。







