---
layout: post
title:  jsp 学习笔记-15-cookie
date:  2020-08-09 10:37:20 +0800
categories: [web]
tags: [web, http, jsp, sf]
published: true
---

# JSP Cookie 处理

Cookie 是存储在客户机的文本文件，它们保存了大量轨迹信息。在 Servlet 技术基础上，JSP 显然能够提供对 HTTP cookie 的支持。

## 识别步骤

通常有三个步骤来识别回头客：

1. 服务器脚本发送一系列 cookie 至浏览器。比如名字，年龄，ID 号码等等。

2. 浏览器在本地机中存储这些信息，以备不时之需。

3. 当下一次浏览器发送任何请求至服务器时，它会同时将这些 cookie 信息发送给服务器，然后服务器使用这些信息来识别用户或者干些其它事情。

本章节将会传授您如何去设置或重设 cookie 的方法，还有如何访问它们及如何删除它们。

## 中文编解码

JSP Cookie 处理需要对中文进行编码与解码，方法如下：

```java
String str = java.net.URLEncoder.encode("中文", "UTF-8");            //编码
String str = java.net.URLDecoder.decode("编码后的字符串","UTF-8");   // 解码
```

# Cookie 剖析

Cookie 通常在 HTTP 信息头中设置（虽然 JavaScript 能够直接在浏览器中设置 cookie）。

在 JSP 中，设置一个 cookie 需要发送如下的信息头给服务器：

```
HTTP/1.1 200 OK
Date: Fri, 04 Feb 2015 21:03:38 GMT
Server: Apache/1.3.9 (UNIX) PHP/4.0b3
Set-Cookie: name=ryo; expires=Friday, 04-Feb-17 22:03:38 GMT; 
                 path=/; domain=github.com
Connection: close
Content-Type: text/html
```

正如您所见，Set-Cookie 信息头包含一个键值对，一个 GMT（格林尼治标准）时间，一个路径，一个域名。键值对会被编码为URL。

有效期域是个指令，告诉浏览器在什么时候之后就可以清除这个 cookie。

如果浏览器被配置成可存储 cookie，那么它将会保存这些信息直到过期。

如果用户访问的任何页面匹配了 cookie 中的路径和域名，那么浏览器将会重新将这个 cookie 发回给服务器。

浏览器端的信息头长得就像下面这样：

```
GET / HTTP/1.0
Connection: Keep-Alive
User-Agent: Mozilla/4.6 (X11; I; Linux 2.2.6-15apmac ppc)
Host: localhost:8080
Accept: image/gif, */*
Accept-Encoding: gzip
Accept-Language: en
Accept-Charset: iso-8859-1,*,utf-8
Cookie: name=ryo
```

JSP 脚本通过 request 对象中的 getCookies() 方法来访问这些 cookie，这个方法会返回一个 Cookie 对象的数组。

# Servlet Cookie 方法

下表列出了 Cookie 对象中常用的方法：

| 方法 |  描述 |
|:----|:----|
| public void setDomain(String pattern) | 设置 cookie 的域名，比如 github.com |
| public String getDomain() | 获取 cookie 的域名，比如 github.com |
| public void setMaxAge(int expiry) | 设置 cookie 有效期，以秒为单位，默认有效期为当前session的存活时间 |
| public int getMaxAge() | 获取 cookie 有效期，以秒为单位，默认为-1 ，表明cookie会活到浏览器关闭为止 |
| public String getName() | 返回 cookie 的名称，名称创建后将不能被修改 |
| public void setValue(String newValue) | 设置 cookie 的值 |
| public String getValue() | 获取cookie的值 |
| public void setPath(String uri) | 设置 cookie 的路径，默认为当前页面目录下的所有 URL，还有此目录下的所有子目录 |
| public String getPath() | 获取 cookie 的路径 |
| public void setSecure(boolean flag) | 指明 cookie 是否要加密传输 |
| public void setComment(String purpose) | 设置注释描述 cookie 的目的。当浏览器将 cookie 展现给用户时，注释将会变得非常有用 |
| public String getComment() | 返回描述 cookie 目的的注释，若没有则返回 null |

# 使用 JSP 设置 cookie

使用 JSP 设置 cookie 包含三个步骤：

(1) 创建一个 cookie 对象： 调用 cookie 的构造函数，使用一个 cookie 名称和值做参数，它们都是字符串。

```java
Cookie cookie = new Cookie("key","value");
```

请务必牢记，名称和值中都不能包含空格或者如下的字符：

```
[ ] ( ) = , " / ? @ : ;
```

(2) 设置有效期：调用 setMaxAge() 函数表明 cookie 在多长时间（以秒为单位）内有效。下面的操作将有效期设为了 24 小时。

```java
cookie.setMaxAge(60*60*24); 
```

(3) 将 cookie 发送至 HTTP 响应头中：调用 response.addCookie() 函数来向 HTTP 响应头中添加 cookie。

```
response.addCookie(cookie);
```

# 设置 cookie 实战

## 后端

```java
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

/**
 * @author binbin.hou
 * @since 1.0.0
 */
@Controller
@RequestMapping("/cookie")
public class CookieController {

    @GetMapping("/set")
    public String setCookie(HttpServletRequest request,
                        HttpServletResponse response) {
        return "cookie/setCookie";
    }


}
```


## 前端

- cookie/setCookie.jsp

```jsp
<%@ page import="java.net.URLEncoder" %>
<!DOCTYPE html>
<%@page contentType="text/html; charset=UTF-8" language="java"%>
<html lang="zh">
<head>
    <title>JSP 设置 Cookie</title>
</head>
<body>

<%
    //编码中文
    String name = URLEncoder.encode(request.getParameter("name"), "UTF-8");

    Cookie nameCookie = new Cookie("name", name);
    // 设置过期时间为 60min
    nameCookie.setMaxAge(60*60);

    // 添加到响应头
    response.addCookie(nameCookie);

%>

<h2>设置 cookie</h2>

用户名：<%=request.getParameter("name")%>

</body>
</html>
```

这里，我们直接获取请求的参数，并通过编码，然后设置到 cookie 中。

## 测试

我们为了简单，直接页面请求连接发起请求：

[http://localhost:8080/cookie/set?name=你好](http://localhost:8080/cookie/set?name=%E4%BD%A0%E5%A5%BD)

返回页面内容：

```
设置 cookie
用户名：你好
```

此时我们去看浏览器的 cookies 信息，是可以看到我们设置的信息的。

下面我们就来学习下，展现 cookies 信息。

# cookies 信息的展现

## 后端

```java
@GetMapping("/get")
public String getCookie(HttpServletRequest request,
                        HttpServletResponse response) {
    return "cookie/getCookie";
}
```

## 前端

- getCookie.jsp

```jsp
<%@ page import="java.net.URLEncoder" %>
<!DOCTYPE html>
<%@page contentType="text/html; charset=UTF-8" language="java"%>
<html lang="zh">
<head>
    <title>JSP 获取 Cookie</title>
</head>
<body>

<h2>获取 cookie</h2>

<%
    Cookie[] cookies = request.getCookies();

    for(Cookie cookie : cookies){
        String line = cookie.getName() + ": " + cookie.getValue();
        out.println(line+"<br/>");
    }
%>

</body>
</html>
```

## 测试效果

```
获取 cookie
name: %E4%BD%A0%E5%A5%BD
```

返现显示的不符合我们的预期，这个就需要做下解码。

- getCookie.jsp 

核心代码做下调整：

```java
for(Cookie cookie : cookies){
    String line = cookie.getName() + ": " + URLDecoder.decode(cookie.getValue(), "UTF-8");
    out.println(line+"<br/>");
}
```

- 重新请求

```
获取 cookie
name: 你好
```

ok，符合我们的预期。

# cookie 的移除

## 删除步骤

删除 cookie 非常简单。如果您想要删除一个 cookie，按照下面给的步骤来做就行了：

1. 获取一个已经存在的 cookie 然后存储在 Cookie 对象中。

2. 将 cookie 的有效期设置为 0。

3. 将这个 cookie 重新添加进响应头中。

## 后端

```java
@GetMapping("/remove")
public String removeCookie(HttpServletRequest request,
                        HttpServletResponse response) {
    return "cookie/removeCookie";
}
```

## 前端

```jsp
<%@ page import="java.net.URLEncoder" %>
<!DOCTYPE html>
<%@page contentType="text/html; charset=UTF-8" language="java"%>
<html lang="zh">
<head>
    <title>JSP 设置 Cookie</title>
</head>
<body>

<%
    Cookie[] cookies = request.getCookies();
    for(Cookie cookie : cookies) {
        String name = cookie.getName();
        // 删除名称为 name 的 cookie
        if("name".equals(name)) {
            cookie.setMaxAge(0);
            response.addCookie(cookie);
        }
    }
%>

<h2>删除 cookie</h2>

</body>
</html>
```

## 测试

页面请求：http://localhost:8080/cookie/remove

然后再次访问查看页面：http://localhost:8080/cookie/get

发现刚才的 name 属性已经不见了。

# 参考资料

https://www.runoob.com/jsp/jsp-cookies.html

* any list
{:toc}