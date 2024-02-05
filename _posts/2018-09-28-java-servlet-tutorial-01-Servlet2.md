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

# Servlet 编写过滤器

Servlet 过滤器是可用于 Servlet 编程的 Java 类，有以下目的：

- 在客户端的请求访问后端资源之前，拦截这些请求。

- 在服务器的响应发送回客户端之前，处理这些响应。

> Servlet 过滤器方法

过滤器是一个实现了 ```javax.servlet.Filter``` 接口的 Java 类。javax.servlet.Filter 接口定义了三个方法：

- 1	public void doFilter (ServletRequest, ServletResponse, FilterChain)
该方法在每次一个请求/响应对因客户端在链的末端请求资源而通过链传递时由容器调用。

- 2	public void init(FilterConfig filterConfig)
该方法由 Web 容器调用，指示一个过滤器被放入服务。

- 3	public void destroy()
该方法由 Web 容器调用，指示一个过滤器被取出服务。

> demo

- LogFilter.java

```java
package com.ryo.filter;

import javax.servlet.*;
import java.io.IOException;
import java.util.Date;

public class LogFilter implements Filter{
    public void init(FilterConfig filterConfig) throws ServletException {
        String testParam = filterConfig.getInitParameter("test-param");
        System.out.println("Test param: " + testParam);
    }

    public void doFilter(ServletRequest servletRequest, ServletResponse servletResponse, FilterChain filterChain) throws IOException, ServletException {
        System.out.println("IP: " + servletRequest.getRemoteAddr() + "  ; Time: " + new Date().toString());

        filterChain.doFilter(servletRequest, servletResponse);
    }

    public void destroy() {

    }
}
```

- web.xml

```xml
<?xml version="1.0" encoding="UTF-8"?>
<web-app version="2.4"
         xmlns="http://java.sun.com/xml/ns/j2ee"
         xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
         xsi:schemaLocation="http://java.sun.com/xml/ns/j2ee http://java.sun.com/xml/ns/j2ee/web-app_2_4.xsd">

    <filter>
        <filter-name>LogFilter</filter-name>
        <filter-class>com.ryo.filter.LogFilter</filter-class>
        <init-param>
            <param-name>test-param</param-name>
            <param-value>Just for test</param-value>
        </init-param>
    </filter>
    <filter>
        <filter-name>AuthFilter</filter-name>
        <filter-class>com.ryo.filter.AuthFilter</filter-class>
    </filter>
    
    <filter-mapping>
        <filter-name>LogFilter</filter-name>
        <url-pattern>/*</url-pattern>
    </filter-mapping>
    <filter-mapping>
        <filter-name>AuthFilter</filter-name>
        <url-pattern>/*</url-pattern>
    </filter-mapping>

</web-app>
```

> Tips

- 其中```/```和```/*```的区别：
< url-pattern > / </ url-pattern >   不会匹配到*.jsp，即：*.jsp不会进入spring的 DispatcherServlet类 。
< url-pattern > /* </ url-pattern > 会匹配*.jsp，会出现返回jsp视图时再次进入spring的DispatcherServlet 类，导致找不到对应的controller所以报404错。

总之，关于web.xml的url映射的小知识:
< url-pattern>/</url-pattern>  会匹配到/login这样的路径型url，不会匹配到模式为*.jsp这样的后缀型url
< url-pattern>/*</url-pattern> 会匹配所有url：路径型的和后缀型的url(包括/login,*.jsp,*.js和*.html等)

- 过滤器的应用顺序

web.xml 中的 **filter-mapping 元素的顺序**决定了 Web 容器应用过滤器到 Servlet 的顺序。若要反转过滤器的顺序，您只需要在 web.xml 文件中反转 filter-mapping 元素即可。


# Servlet 异常处理

当一个 Servlet 抛出一个异常时，Web 容器在使用了 **exception-type** 元素的 web.xml 中搜索与抛出异常类型相匹配的配置。
您必须在 web.xml 中使用 error-page 元素来指定对特定异常 或 HTTP 状态码 作出相应的 Servlet 调用。

> 请求属性 - 错误/异常

- 1	javax.servlet.error.status_code
该属性给出状态码，状态码可被存储，并在存储为 java.lang.Integer 数据类型后可被分析。
- 2	javax.servlet.error.exception_type
该属性给出异常类型的信息，异常类型可被存储，并在存储为 java.lang.Class 数据类型后可被分析。
- 3	javax.servlet.error.message
该属性给出确切错误消息的信息，信息可被存储，并在存储为 java.lang.String 数据类型后可被分析。
- 4	javax.servlet.error.request_uri
该属性给出有关 URL 调用 Servlet 的信息，信息可被存储，并在存储为 java.lang.String 数据类型后可被分析。
- 5	javax.servlet.error.exception
该属性给出异常产生的信息，信息可被存储，并在存储为 java.lang.Throwable 数据类型后可被分析。
- 6	javax.servlet.error.servlet_name
该属性给出 Servlet 的名称，名称可被存储，并在存储为 java.lang.String 数据类型后可被分析。

> Demo ErrorHandlerServlet.java

```java
@WebServlet(name = "ErrorHandler", urlPatterns ="/ErrorHandler" )
public class ErrorHandlerServlet extends HttpServlet {
    @Override
    protected void doGet(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
        // 分析 Servlet 异常
        Throwable throwable = (Throwable)
                request.getAttribute("javax.servlet.error.exception");
        Integer statusCode = (Integer)
                request.getAttribute("javax.servlet.error.status_code");
        String servletName = (String)
                request.getAttribute("javax.servlet.error.servlet_name");
        if (servletName == null){
            servletName = "Unknown";
        }
        String requestUri = (String)
                request.getAttribute("javax.servlet.error.request_uri");
        if (requestUri == null){
            requestUri = "Unknown";
        }

        // 设置响应内容类型
        response.setContentType("text/html;charset=UTF-8");

        PrintWriter out = response.getWriter();
        String title = "Error/Exception Information";
        String docType = "<!DOCTYPE html>";

        out.println(docType +
                "<html>\n" +
                "<head><title>" + title + "</title></head>\n" +
                "<body bgcolor=\"#f0f0f0\">\n");

        if (throwable == null && statusCode == null){
            out.println("<h2>Error information is missing</h2>");
            out.println("Please return to the <a href=\"" +
                    response.encodeURL("http://localhost:8080/") +
                    "\">Home Page</a>.");
        }else if (statusCode != null){
            out.println("The status code : " + statusCode);
        }else{
            out.println("<h2>Error information</h2>");
            out.println("Servlet Name : " + servletName +
                    "</br></br>");
            out.println("Exception Type : " +
                    throwable.getClass( ).getName( ) +
                    "</br></br>");
            out.println("The request URI: " + requestUri +
                    "<br><br>");
            out.println("The exception message: " +
                    throwable.getMessage( ));
        }
        out.println("</body>");
        out.println("</html>");
    }
    
    // 处理 POST 方法请求的方法
    public void doPost(HttpServletRequest request,
                       HttpServletResponse response)
            throws ServletException, IOException {
        doGet(request, response);
    }
}
```

> web.xml

```xml
<!-- error-code 相关的错误页面 -->
<error-page>
    <error-code>404</error-code>
    <location>/ErrorHandler</location>
</error-page>
<error-page>
    <error-code>403</error-code>
    <location>/ErrorHandler</location>
</error-page>

<!-- exception-type 相关的错误页面 -->
<error-page>
    <exception-type>javax.servlet.ServletException</exception-type>
    <location>/ErrorHandler</location>
</error-page>
<error-page>
    <exception-type>java.io.IOException</exception-type>
    <location>/ErrorHandler</location>
</error-page>
```

# Servlet Cookies 处理

## Cookies 是存储在客户端计算机上的文本文件，并保留了各种跟踪信息。Java Servlet 显然支持 HTTP Cookies。
识别返回用户包括三个步骤：

- 服务器脚本向浏览器发送一组 Cookies。例如：姓名、年龄或识别号码等。

- 浏览器将这些信息存储在本地计算机上，以备将来使用。

- 当下一次浏览器向 Web 服务器发送任何请求时，浏览器会把这些 Cookies 信息发送到服务器，服务器将使用这些信息来识别用户。

## Cookies 通常设置在 HTTP 头信息中（虽然 JavaScript 也可以直接在浏览器上设置一个 Cookie）。设置 Cookie 的 Servlet 会发送如下的头信息：

````
HTTP/1.1 200 OK
Date: Fri, 04 Feb 2000 21:03:38 GMT
Server: Apache/1.3.9 (UNIX) PHP/4.0b3
Set-Cookie: name=xyz; expires=Friday, 04-Feb-07 22:03:38 GMT; 
                 path=/; domain=w3cschool.cc
Connection: close
Content-Type: text/html
```

正如您所看到的，Set-Cookie 头包含了一个**名称值对**、一个 GMT 日期、一个路径和一个域。名称和值会被 URL 编码。expires 字段是一个指令，告诉浏览器在给定的时间和日期之后"忘记"该 Cookie。
如果浏览器被配置为存储 Cookies，它将会保留此信息直到到期日期。如果用户的浏览器指向任何匹配该 Cookie 的路径和域的页面，它会重新发送 Cookie 到服务器。浏览器的头信息可能如下所示：

```
GET / HTTP/1.0
Connection: Keep-Alive
User-Agent: Mozilla/4.6 (X11; I; Linux 2.2.6-15apmac ppc)
Host: zink.demon.co.uk:1126
Accept: image/gif, */*
Accept-Encoding: gzip
Accept-Language: en
Accept-Charset: iso-8859-1,*,utf-8
Cookie: name=xyz
```

## Servlet Cookies 方法
```
1	public void setDomain(String pattern)
该方法设置 cookie 适用的域，例如 w3cschool.cc。
2	public String getDomain()
该方法获取 cookie 适用的域，例如 w3cschool.cc。
3	public void setMaxAge(int expiry)
该方法设置 cookie 过期的时间（以秒为单位）。如果不这样设置，cookie 只会在当前 session 会话中持续有效。
4	public int getMaxAge()
该方法返回 cookie 的最大生存周期（以秒为单位），默认情况下，-1 表示 cookie 将持续下去，直到浏览器关闭。
5	public String getName()
该方法返回 cookie 的名称。名称在创建后不能改变。
6	public void setValue(String newValue)
该方法设置与 cookie 关联的值。
7	public String getValue()
该方法获取与 cookie 关联的值。
8	public void setPath(String uri)
该方法设置 cookie 适用的路径。如果您不指定路径，与当前页面相同目录下的（包括子目录下的）所有 URL 都会返回 cookie。
9	public String getPath()
该方法获取 cookie 适用的路径。
10	public void setSecure(boolean flag)
该方法设置布尔值，表示 cookie 是否应该只在加密的（即 SSL）连接上发送。
11	public void setComment(String purpose)
该方法规定了描述 cookie 目的的注释。该注释在浏览器向用户呈现 cookie 时非常有用。
12	public String getComment()
该方法返回了描述 cookie 目的的注释，如果 cookie 没有注释则返回 null。
```

