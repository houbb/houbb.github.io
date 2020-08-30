---
layout: post
title:  jsp 学习笔记-13-response 响应
date:  2020-08-09 10:37:20 +0800
categories: [web]
tags: [web, http, jsp, sf]
published: true
---

# JSP 服务器响应

Response响应对象主要将JSP容器处理后的结果传回到客户端。

可以通过response变量设置HTTP的状态和向客户端发送数据，如Cookie、HTTP文件头信息等。

一个典型的响应看起来就像下面这样：

```
HTTP/1.1 200 OK
Content-Type: text/html
Header2: ...
...
HeaderN: ...
  (空行)
<!doctype ...>
<html>
<head>...</head>
<body>
...
</body>
</html>
```

状态行包含HTTP版本信息，比如HTTP/1.1，一个状态码，比如200，还有一个非常短的信息对应着状态码，比如OK。

## 响应头主要属性

下表摘要出了HTTP1.1响应头中最有用的部分，在网络编程中您将会经常见到它们：

| 响应头	            | 描述 |
|:---|:---|
| Allow	           | 指定服务器支持的request方法（GET，POST等等） |
| Cache-Control	   | 指定响应文档能够被安全缓存的情况。通常取值为 public，private 或no-cache 等等。 Public意味着文档可缓存，Private意味着文档只为单用户服务并且只能使用私有缓存。No-cache 意味着文档不被缓存。|
| Connection	        | 命令浏览器是否要使用持久的HTTP连接。close值 命令浏览器不使用持久HTTP连接，而keep-alive 意味着使用持久化连接。 |
| Content-Disposition	| 让浏览器要求用户将响应以给定的名称存储在磁盘中 |
| Content-Encoding	| 指定传输时页面的编码规则 |
| Content-Language	| 表述文档所使用的语言，比如en， en-us,，ru等等 |
| Content-Length	    | 表明响应的字节数。只有在浏览器使用持久化 (keep-alive) HTTP 连接时才有用 |
| Content-Type	    | 表明文档使用的MIME类型 |
| Expires	            | 指明啥时候过期并从缓存中移除 |
| Last-Modified	    | 指明文档最后修改时间。客户端可以 缓存文档并且在后续的请求中提供一个 If-Modified-Since请求头 |
| Location	        | 在300秒内，包含所有的有一个状态码的响应地址，浏览器会自动重连然后检索新文档 |
| Refresh	            | 指明浏览器每隔多久请求更新一次页面。 |
| Retry-After	        | 与503 (Service Unavailable)一起使用来告诉用户多久后请求将会得到响应 |
| Set-Cookie	        | 指明当前页面对应的cookie |

# HttpServletResponse类

response 对象是 javax.servlet.http.HttpServletResponse 类的一个实例。

就像服务器会创建request对象一样，它也会创建一个客户端响应。

response对象定义了处理创建HTTP信息头的接口。通过使用这个对象，开发者们可以添加新的cookie或时间戳，还有HTTP状态码等等。

下表列出了用来设置HTTP响应头的方法，这些方法由HttpServletResponse 类提供：

| 方法 | 描述 |
|:---|:---|
| String encodeRedirectURL(String url) | 对sendRedirect()方法使用的URL进行编码 |
| String encodeURL(String url) | 将URL编码，回传包含Session ID的URL |
| boolean containsHeader(String name) | 返回指定的响应头是否存在 |
| boolean isCommitted() | 返回响应是否已经提交到客户端 |
| void addCookie(Cookie cookie) | 添加指定的cookie至响应中 |
| void addDateHeader(String name, long date) | 添加指定名称的响应头和日期值 |
| void addHeader(String name, String value) | 添加指定名称的响应头和值 |
| void addIntHeader(String name, int value) | 添加指定名称的响应头和int值 |
| void flushBuffer() | 将任何缓存中的内容写入客户端 |
| void reset() | 清除任何缓存中的任何数据，包括状态码和各种响应头 |
| void resetBuffer() | 清除基本的缓存数据，不包括响应头和状态码 |
| void sendError(int sc) | 使用指定的状态码向客户端发送一个出错响应，然后清除缓存 |
| void sendError(int sc, String msg) | 使用指定的状态码和消息向客户端发送一个出错响应 |
| void sendRedirect(String location) | 使用指定的URL向客户端发送一个临时的间接响应 |
| void setBufferSize(int size) | 设置响应体的缓存区大小 |
| void setCharacterEncoding(String charset) | 指定响应的编码集（MIME字符集），例如UTF-8 |
| void setContentLength(int len) | 指定HTTP servlets中响应的内容的长度，此方法用来设置 HTTP Content-Length 信息头 |
| void setContentType(String type) | 设置响应的内容的类型，如果响应还未被提交的话 |
| void setDateHeader(String name, long date) | 使用指定名称和值设置响应头的名称和内容 |
| void setHeader(String name, String value) | 使用指定名称和值设置响应头的名称和内容 |
| void setIntHeader(String name, int value) | 指定 int 类型的值到 name 标头 |
| void setLocale(Locale loc) | 设置响应的语言环境，如果响应尚未被提交的话 |
| void setStatus(int sc) |设置响应的状态码 |

## HTTP响应头程序示例

### 前端

接下来的例子使用setIntHeader()方法和setRefreshHeader()方法来模拟一个数字时钟：

```jsp
<%@ page import="java.util.Enumeration" %>
<%@ page import="java.util.Date" %>
<!DOCTYPE html>
<%@page contentType="text/html; charset=UTF-8" language="java"%>
<html lang="zh">
<head>
    <title>JSP REQUEST</title>
</head>
<body>

<h2>自动刷新实例</h2>

<%
    //5s 自动刷新一次
    response.setIntHeader("Refresh", 5);

    // 显示当前时间
    out.println("当前时间: " + new Date().toLocaleString());
%>

</body>
</html>
```

### 后端

```java
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

@Controller
@RequestMapping("/response")
public class ResponseController {

    @RequestMapping("/auto")
    public String request(HttpServletRequest request,
                        HttpServletResponse response) {
        return "autoRefresh";
    }
}
```

### 效果

页面访问：http://localhost:8080/response/auto

```
自动刷新实例
当前时间: 2020-8-30 16:04:10
```

每 5S 钟会刷新一次时间。

# HTTP 状态码

HTTP请求与HTTP响应的格式相近，都有着如下结构：

## 结构

1. 以状态行+CRLF（回车换行）开始

2. 零行或多行头模块+CRLF

3. 一个空行，比如CRLF

4. 可选的消息体比如文件，查询数据，查询输出

## 例子

举例来说，一个服务器响应头看起来就像下面这样：

```
HTTP/1.1 200 OK
Content-Type: text/html
Header2: ...
...
HeaderN: ...
  (Blank Line)
<!doctype ...>
<html>
<head>...</head>
<body>
...
</body>
</html>
```

状态行包含HTTP版本，一个状态码，和状态码相对应的短消息。

## HTTP 状态码

下表列出了可能会从服务器返回的HTTP状态码和与之关联的消息：

```
状态码	消息	描述
100	Continue	只有一部分请求被服务器接收，但只要没被服务器拒绝，客户端就会延续这个请求
101	Switching Protocols	服务器交换机协议
200	OK	请求被确认
201	Created	请求时完整的，新的资源被创建
202	Accepted	请求被接受，但未处理完
203	Non-authoritative Information	 
204	No Content	 
205	Reset Content	 
206	Partial Content	 
300	Multiple Choices	一个超链接表，用户可以选择一个超链接并访问，最大支持5个超链接
301	Moved Permanently	被请求的页面已经移动到了新的URL下
302	Found	被请求的页面暂时性地移动到了新的URL下
303	See Other	被请求的页面可以在一个不同的URL下找到
304	Not Modified	 
305	Use Proxy	 
306	Unused	已经不再使用此状态码，但状态码被保留
307	Temporary Redirect	被请求的页面暂时性地移动到了新的URL下
400	Bad Request	服务器无法识别请求
401	Unauthorized	被请求的页面需要用户名和密码
402	Payment Required	目前还不能使用此状态码
403	Forbidden	禁止访问所请求的页面
404	Not Found	服务器无法找到所请求的页面
405	Method Not Allowed	请求中所指定的方法不被允许
406	Not Acceptable	服务器只能创建一个客户端无法接受的响应
407	Proxy Authentication Required	在请求被服务前必须认证一个代理服务器
408	Request Timeout	请求时间超过了服务器所能等待的时间，连接被断开
409	Conflict	请求有矛盾的地方
410	Gone	被请求的页面不再可用
411	Length Required	"Content-Length"没有被定义，服务器拒绝接受请求
412	Precondition Failed	请求的前提条件被服务器评估为false
413	Request Entity Too Large	因为请求的实体太大，服务器拒绝接受请求
414	Request-url Too Long	服务器拒绝接受请求，因为URL太长。多出现在把"POST"请求转换为"GET"请求时所附带的大量查询信息
415	Unsupported Media Type	服务器拒绝接受请求，因为媒体类型不被支持
417	Expectation Failed	 
500	Internal Server Error	请求不完整，服务器遇见了出乎意料的状况
501	Not Implemented	请求不完整，服务器不提供所需要的功能
502	Bad Gateway	请求不完整，服务器从上游服务器接受了一个无效的响应
503	Service Unavailable	请求不完整，服务器暂时重启或关闭
504	Gateway Timeout	网关超时
505	HTTP Version Not Supported	服务器不支持所指定的HTTP版本
```

# 设置HTTP状态码的方法

下表列出了HttpServletResponse 类中用来设置状态码的方法：

| 方法 |  描述 |
|:---|:---|
| public void setStatus (int statusCode) | 方法可以设置任意的状态码。如果您的响应包含一个特殊的状态码和一个文档，请确保在用PrintWriter返回任何内容前调用setStatus方法 |
| public void sendRedirect(String url) | 此方法产生302响应，同时产生一个 Location 头告诉URL 一个新的文档 |
| public void sendError(int code, String message) | 此方法将一个状态码(通常为 404)和一个短消息，自动插入HTML文档中并发回给客户端 |

# HTTP状态码程序示例

接下来的例子将会发送407错误码给浏览器，然后浏览器将会告诉您"Need authentication!!!"。

## 前端

```jsp
<html>
<head>
<title>Setting HTTP Status Code</title>
</head>
<body>
<%
   // 设置错误代码，并说明原因
   response.sendError(407, "Need authentication!!!" );
%>
</body>
</html>
```

## 访问效果

```
无法访问此网站网址为 http://localhost:8080/response/auth 的网页可能暂时无法连接，或者它已永久性地移动到了新网址。
ERR_UNEXPECTED_PROXY_AUTH
```

# 参考资料

https://www.runoob.com/jsp/jsp-server-response.html


https://www.runoob.com/jsp/jsp-http-status-codes.html

* any list
{:toc}