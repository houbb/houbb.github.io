---
layout: post
title: Java Servlet 教程-08-Cookie
date:  2018-09-28 15:54:28 +0800
categories: [Java]
tags: [web, servlet, java, sh]
published: true
excerpt: Java Servlet 教程-08-Cookie
---

# 会话跟踪机制

# Cookie

通过 [HTTP cookie](https://houbb.github.io/2018/07/18/session-cookie) 的会话跟踪是最常用的会话跟踪机制，且所有 servlet 容器都应该支持。

容器向客户端发送一个 cookie，客户端后续到服务器的请求都将返回该cookie，明确地将请求与会话关联。

会话跟踪 cookie 的标准名字必须是 `JSESSIONID`，容器也允许通过容器指定的配置自定义会话跟踪cookie的名字。

所有 servlet 容器必须提供能够配置容器是否标记会话跟踪 cookie 为 HttpOnly 的能力。

已建立的配置必须应用到所有上下文中还没有建立特定的配置。

如果 web 应用为其会话跟踪 cookie 配置了一个自定义的名字，则如果会话 id 编码到 URL 中那么相同的自定义名字也将用于 URI 参数的名字（假如 URL 重写已开启）。

## SSL会话

安全套接字层(Secure Sockets Layer)，在 HTTPS 使用的加密技术，有一种内置机制允许多个来自客户端的请求被明确识别为同一会话。

Servlet容器可以很容易地使用该数据来定义会话。

## URL 重写

URL 重写是会话跟踪的最低标准。当客户端不接受 cookie 时，服务器可使用 URL 重写作为会话跟踪的基础。URL 重写涉及添加数据、会话 ID、容器解析 URL 路径从而请求与会话相关联。

会话 ID 必须被编码为 URL 字符串中的一个路径参数。参数的名字必须是 `jsessionid`。

下面是一个 URL 包含编码的路径信息的例子：

```
http://www.myserver.com/catalog/index.html;jsessionid=1234
```

URL 重写在日志、书签、referer header、缓存的 HTML、URL工具条中暴露会话标识。

在支持 cookie 或 SSL 会话的情况下，不应该使用 URL 重写作为会话跟踪机制。

## 会话完整性

当服务的来自客户端的请求不支持使用 cookie 时，Web 容器必须能够支持 HTTP 会话。 

为了满足这个要求， Web 容器通常支持 URL 重写机制。

# Servlet Cookie 处理

Cookie 是存储在客户端计算机上的文本文件，并保留了各种跟踪信息。Java Servlet 显然支持 HTTP Cookie。

识别返回用户包括三个步骤：

1. 服务器脚本向浏览器发送一组 Cookie。例如：姓名、年龄或识别号码等。

2. 浏览器将这些信息存储在本地计算机上，以备将来使用。

3. 当下一次浏览器向 Web 服务器发送任何请求时，浏览器会把这些 Cookie 信息发送到服务器，服务器将使用这些信息来识别用户。

本章将向您讲解如何设置或重置 Cookie，如何访问它们，以及如何将它们删除。

# Cookie 剖析

Cookie 通常设置在 HTTP 头信息中（虽然 JavaScript 也可以直接在浏览器上设置一个 Cookie）。

设置 Cookie 的 Servlet 会发送如下的头信息：

```
HTTP/1.1 200 OK
Date: Fri, 04 Feb 2000 21:03:38 GMT
Server: Apache/1.3.9 (UNIX) PHP/4.0b3
Set-Cookie: name=xyz; expires=Friday, 04-Feb-07 22:03:38 GMT; 
                 path=/; domain=runoob.com
Connection: close
Content-Type: text/html
```

正如您所看到的，Set-Cookie 头包含了一个名称值对、一个 GMT 日期、一个路径和一个域。名称和值会被 URL 编码。

expires 字段是一个指令，告诉浏览器在给定的时间和日期之后"忘记"该 Cookie。

如果浏览器被配置为存储 Cookie，它将会保留此信息直到到期日期。如果用户的浏览器指向任何匹配该 Cookie 的路径和域的页面，它会重新发送 Cookie 到服务器。

浏览器的头信息可能如下所示：

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

# Servlet Cookie 方法

| 序号 | 方法 | 说明 |
|:---|:---|:---|
| 1 | setDomain(String pattern) | 该方法设置 cookie 适用的域 |
| 2 | getDomain | 该方法获取 cookie 适用的域 |
| 3 | setMaxAge(int expiry) | 该方法设置 cookie 过期的时间（以秒为单位）。如果不这样设置，cookie 只会在当前 session 会话中持续有效。 |
| 4 | getMaxAge() | 该方法返回 cookie 的最大生存周期（以秒为单位），默认情况下，-1 表示 cookie 将持续下去，直到浏览器关闭。 |
| 5 | getName() | 该方法返回 cookie 的名称。名称在创建后不能改变。 |
| 6 | setValue(String newValue) | 该方法设置与 cookie 关联的值。 |
| 7 | getValue() | 该方法获取与 cookie 关联的值。 |
| 8 | setPath(String uri) | 该方法设置 cookie 适用的路径。如果您不指定路径，与当前页面相同目录下的（包括子目录下的）所有 URL 都会返回 cookie。 |
| 9 | getPath() | 该方法获取 cookie 适用的路径。|
| 10 | setSecure(boolean flag) | 该方法设置布尔值，表示 cookie 是否应该只在加密的（即 SSL）连接上发送。 |
| 11 | setComment(String purpose) | 设置cookie的注释。该注释在浏览器向用户呈现 cookie 时非常有用。 |
| 12 | getComment() | 获取 cookie 的注释，如果 cookie 没有注释则返回 null。 |

# Servlet 设置 Cookie

## 步骤

通过 Servlet 设置 Cookie 包括三个步骤：

(1) 创建一个 Cookie 对象

您可以调用带有 cookie 名称和 cookie 值的 Cookie 构造函数，cookie 名称和 cookie 值都是字符串。

```java
Cookie cookie = new Cookie("key", "value");
```

请记住，无论是名字还是值，都不应该包含空格或以下任何字符：

`[ ] ( ) = , " / ? @ : ;`

(2) 设置最大生存周期：您可以使用 setMaxAge() 方法来指定 cookie 能够保持有效的时间（以秒为单位）。

下面将设置一个最长有效期为 24 小时的 cookie。

```java
cookie.setMaxAge(60*60*24); 
```

(3) 发送 Cookie 到 HTTP 响应头

您可以使用 response.addCookie() 来添加 HTTP 响应头中的 Cookie，如下所示：

```java
response.addCookie(cookie);
```

## 实例

- CookieAddServlet.java

```java
@WebServlet("/cookie/add")
public class CookieAddServlet extends HttpServlet {
    private static final long serialVersionUID = -5792497821455934158L;

    @Override
    protected void doGet(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {
        final String name = req.getParameter("name");
        final String age = req.getParameter("age");

        Cookie cookieName = new Cookie("name", name);
        cookieName.setMaxAge(-1);
        Cookie cookieAge = new Cookie("age", age);
        cookieAge.setMaxAge(-1);

        resp.addCookie(cookieName);
        resp.addCookie(cookieAge);

        resp.setContentType("text/plain;charset=UTF-8");
        PrintWriter printWriter = resp.getWriter();
        printWriter.println("设置完成 name: " + name + ", age: " + age);
    }
}
```

- 访问请求

[http://localhost:8081/cookie/add?name=good&age=12](http://localhost:8081/cookie/add?name=good&age=12)

chrome 浏览器直接查看请求的响应，cookie 如下：

```
age	    12			
name	good			
```

## Servlet 读取 Cookie

要读取 Cookie，您需要通过调用 HttpServletRequest 的 getCookies() 方法创建一个 javax.servlet.http.Cookie 对象的数组。

然后循环遍历数组，并使用 getName() 和 getValue() 方法来访问每个 cookie 和关联的值。

- CookieGetServlet.java

```java
@WebServlet("/cookie/get")
public class CookieGetServlet extends HttpServlet {
    private static final long serialVersionUID = -5792497821455934158L;

    @Override
    protected void doGet(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {
        PrintWriter printWriter = resp.getWriter();

        Cookie[] cookies = req.getCookies();
        if(cookies.length > 0) {
            for(Cookie cookie : cookies) {
                printWriter.println("Name: " + cookie.getName() +"; Value: " + cookie.getValue());
            }
        } else {
            printWriter.println("Cookie 内容为空");
        }
    }
}
```

- 访问

浏览器访问 [http://localhost:8081/cookie/get](http://localhost:8081/cookie/get)

```
Name: name; Value: good
Name: age; Value: 12
...
```

## 删除 Cookie

- CookieDeleteServlet.java

```java
@WebServlet("/cookie/delete")
public class CookieDeleteServlet extends HttpServlet {
    private static final long serialVersionUID = -5792497821455934158L;

    @Override
    protected void doGet(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {
        // 编码的设置一定要放在 resp.getXXX(), resp.setXXX() 之前
        resp.setContentType("text/plain;charset=UTF-8");
        resp.setCharacterEncoding("UTF-8");

        PrintWriter printWriter = resp.getWriter();
        Cookie[] cookies = req.getCookies();
        if (cookies.length > 0) {
            for (Cookie cookie : cookies) {
                printWriter.println("已删除 Name: " + cookie.getName() + "; Value: " + cookie.getValue());
                // 设置为0，等同于删除
                cookie.setMaxAge(0);
                resp.addCookie(cookie);
            }
        } else {
            printWriter.println("Cookie 内容为空");
        }
    }
}
```

- 访问

浏览器访问 [http://localhost:8081/cookie/delete](http://localhost:8081/cookie/delete)

```
已删除 Name: name; Value: good
已删除 Name: age; Value: 12
...
```

# 参考资料

http://www.runoob.com/servlet/servlet-cookies-handling.html

[会话跟踪机制](https://waylau.gitbooks.io/servlet-3-1-specification/docs/Sessions/7.1%20Session%20Tracking%20Mechanisms.html)

- 中文乱码

[Servlet不能设置编码,设置编码无效!?](https://blog.csdn.net/gogcc/article/details/55270928)

[Servlet 中文乱码问题及解决方案剖析](https://blog.csdn.net/xiazdong/article/details/7217022)

* any list
{:toc}