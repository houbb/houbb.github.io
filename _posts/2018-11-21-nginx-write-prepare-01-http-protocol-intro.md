---
layout: post
title:  从零手写实现 nginx 准备知识-01-http 协议介绍
date: 2018-11-22 8:01:55 +0800
categories: [Web]
tags: [nginx, nginx-in-action, sh]
published: true
---


# 前言

大家好，我是老马。很高兴遇到你。

我们希望实现最简单的 http 服务信息，可以处理静态文件。

如果你想知道 servlet 如何处理的，可以参考我的另一个项目：

> 手写从零实现简易版 tomcat [minicat](https://github.com/houbb/minicat) 

## netty 相关

如果你对 netty 不是很熟悉，可以读一下

[Netty 权威指南-01-BIO 案例](https://houbb.github.io/2019/05/10/netty-definitive-gudie-01-bio)

[Netty 权威指南-02-NIO 案例](https://houbb.github.io/2019/05/10/netty-definitive-gudie-02-nio)

[Netty 权威指南-03-AIO 案例](https://houbb.github.io/2019/05/10/netty-definitive-gudie-03-aio)

[Netty 权威指南-04-为什么选择 Netty？Netty 入门教程](https://houbb.github.io/2019/05/10/netty-definitive-gudie-04-why-netty)

# http 协议

应用层协议http，发展至今已经是http2.0了，拥有以下特点：

(1) CS模式的协议

(2) 简单 - 只需要服务URL，携带必要的请求参数或者消息体

(3) 灵活 - 任意类型，传输内容类型由HTTP消息头中的Content-Type加以标记

(4) 无状态 - 必须借助额外手段，比如session或者cookie来保持状态

## 1.1 HTTP请求消息(HttpRequest)

客户端发送一个HTTP请求到服务器的请求消息包括以下格式：请求行（request line）、请求头部（header）、空行和请求数据四个部分组成，下图给出了请求报文的一般格式。

![HTTP请求消息](https://images2015.cnblogs.com/blog/865216/201612/865216-20161215220751011-543243252.png)

举个例子：

```
GET /hello.txt HTTP/1.1
User-Agent: curl/7.16.3 libcurl/7.16.3 OpenSSL/0.9.7l zlib/1.2.3
Host: www.example.com
Accept-Language: en, mi
```

### 请求方法：

根据HTTP标准，HTTP请求可以使用多种请求方法。

HTTP1.0定义了三种请求方法： GET, POST 和 HEAD方法。

HTTP1.1新增了五种请求方法：OPTIONS, PUT, DELETE, TRACE 和 CONNECT 方法。

以下是以Markdown格式列出的HTTP请求方法及其描述：

| 序号 | 方法  | 描述                                                         |
| ---- | ----- | ------------------------------------------------------------ |
| 1    | GET   | 请求指定的页面信息，并返回实体主体。                         |
| 2    | HEAD  | 类似于get请求，只不过返回的响应中没有具体的内容，用于获取报头 |
| 3    | POST  | 向指定资源提交数据进行处理请求（例如提交表单或者上传文件）。数据被包含在请求体中。POST请求可能会导致新的资源的建立和/或已有资源的修改。 |
| 4    | PUT   | 从客户端向服务器传送的数据取代指定的文档的内容。             |
| 5    | DELETE| 请求服务器删除指定的页面。                                   |
| 6    | CONNECT| HTTP/1.1协议中预留给能够将连接改为管道方式的代理服务器。   |
| 7    | OPTIONS| 允许客户端查看服务器的性能。                                 |
| 8    | TRACE | 回显服务器收到的请求，主要用于测试或诊断。                 |

GET方法：参数在请求行，不安全且有一定限制

POST方法：要求在服务器接受后面的数据，常用于提交表单。

一般GET用于获取/查询信息，而POST一般用于创建，更新信息。二者主要区别如下：

(1) 根据HTTP规范，GET用于获取，应该是安全和幂等的，而POST则表示可能改变服务器上的资源；

(2) GET请求数据会附在URL上，即请求行中，以"?"分隔URL和传输数据，多个参数用&连接；而POST会把数据放在HTTP消息的报体中，地址栏中没有

(3) 传输数据的大小不同，特定浏览器有限制，例如IE对URL限制是2083字节，POST理论上没有限制

(4) POST更安全，使用GET还有可能受到Cross-site request forgery攻击等等。

### 部分请求头部说明：

以下是以Markdown格式列出的HTTP请求头和响应头的表格：

| Header             | 解释                                                         | 示例                             |
|--------------------|--------------------------------------------------------------|----------------------------------|
| Accept             | 指定客户端能够接收的内容类型                                 | Accept: text/plain, text/html    |
| Accept-Charset     | 浏览器可以接受的字符编码集。                                 | Accept-Charset: iso-8859-5       |
| Accept-Encoding   | 指定浏览器可以支持的web服务器返回内容压缩编码类型。       | Accept-Encoding: compress, gzip |
| Accept-Language    | 浏览器可接受的语言                                           | Accept-Language: en,zh          |
| Accept-Ranges      | 可以请求网页实体的一个或者多个子范围字段                   | Accept-Ranges: bytes            |
| Authorization      | HTTP授权的授权证书                                          | Authorization: Basic QWxhZGRpbjpvcGVuIHNlc2FtZQ== |
| Cache-Control      | 指定请求和响应遵循的缓存机制                                | Cache-Control: no-cache         |
| Connection         | 表示是否需要持久连接。（HTTP 1.1默认进行持久连接）           | Connection: close                |
| Cookie             | HTTP请求发送时，会把保存在该请求域名下的所有cookie值一起发送给web服务器。 | Cookie: $Version=1; Skin=new; |
| Content-Length     | 请求的内容长度                                               | Content-Length: 348              |
| Content-Type       | 请求的与实体对应的MIME信息                                    | Content-Type: application/x-www-form-urlencoded |
| Date               | 请求发送的日期和时间                                        | Date: Tue, 15 Nov 2010 08:12:31 GMT |
| Expect             | 请求的特定的服务器行为                                       | Expect: 100-continue            |
| From               | 发出请求的用户的Email                                        | From: user@email.com            |
| Host               | 指定请求的服务器的域名和端口号                               | Host: www.zcmhi.com             |
| If-Match           | 只有请求内容与实体相匹配才有效                             | If-Match: “737060cd8c284d8af7ad3082f209582d” |
| If-Modified-Since  | 如果请求的部分在指定时间之后被修改则请求成功，未被修改则返回304代码 | If-Modified-Since: Sat, 29 Oct 2010 19:43:31 GMT |
| If-None-Match      | 如果内容未改变返回304代码，参数为服务器先前发送的Etag，与服务器回应的Etag比较判断是否改变 | If-None-Match: “737060cd8c284d8af7ad3082f209582d” |
| If-Range           | 如果实体未改变，服务器发送客户端丢失的部分，否则发送整个实体。参数也为Etag | If-Range: “737060cd8c284d8af7ad3082f209582d” |
| If-Unmodified-Since| 只在实体在指定时间之后未被修改才请求成功                   | If-Unmodified-Since: Sat, 29 Oct 2010 19:43:31 GMT |
| Max-Forwards       | 限制信息通过代理和网关传送的时间                           | Max-Forwards: 10                 |
| Pragma             | 用来包含实现特定的指令                                      | Pragma: no-cache                |
| Proxy-Authorization| 连接到代理的授权证书                                        | Proxy-Authorization: Basic QWxhZGRpbjpvcGVuIHNlc2FtZQ== |
| Range              | 只请求实体的一部分，指定范围                                | Range: bytes=500-999             |
| Referer            | 先前网页的地址，当前请求网页紧随其后，即来路               | Referer: http://www.zcmhi.com/archives/71.html |
| TE                 | 客户端愿意接受的传输编码，并通知服务器接受接受尾加头信息   | TE: trailers,deflate;q=0.5       |
| Upgrade            | 向服务器指定某种传输协议以便服务器进行转换（如果支持）     | Upgrade: HTTP/2.0, SHTTP/1.3, IRC/6.9, RTA/x11 |
| User-Agent         | User-Agent的内容包含发出请求的用户信息                     | User-Agent: Mozilla/5.0 (Linux; X11) |
| Via                | 通知中间网关或代理服务器地址，通信协议                     | Via: 1.0 fred, 1.1 nowhere.com (Apache/1.1) |
| Warning            | 关于消息实体的警告信息                                      | Warn: 199 Miscellaneous warning   |


# 1.2 HTTP响应消息

HTTP响应也由四个部分组成，分别是：状态行、消息报头、空行和响应正文。

## 例子

当然，这里有一个简单的HTTP响应消息的例子：

```
HTTP/1.1 200 OK
Content-Type: text/html; charset=UTF-8
Content-Length: 92
Connection: close

<html>
<head><title>测试页面</title></head>
<body>
    <h1>你好，世界！</h1>
    <p>这是一个简单的HTTP响应示例。</p>
</body>
</html>
```

在这个例子中，我们可以明确地指出以下部分：

1. **状态行**：第一行是状态行，它包括HTTP版本、状态码和状态消息。
   - `HTTP/1.1 200 OK`

2. **消息报头**：紧接着状态行的是一系列的消息报头，每个报头都占一行。它们包含了关于响应的附加信息。
   - `Content-Type: text/html; charset=UTF-8`：指示返回的内容类型是HTML，字符编码是UTF-8。
   - `Content-Length: 92`：指示响应正文的长度是92字节。
   - `Connection: close`：指示服务器在发送完响应后关闭连接。

3. **空行**：消息报头之后是一个空行，表示消息报头部分的结束和响应正文的开始。
   - 空行表示为：`\n`（换行符）

4. **响应正文**：空行之后是响应正文，它包含了服务器返回的资源内容。
   - 这里是一段简单的HTML代码，包含了一个标题和一段文本。

请注意，这个例子是一个标准的HTTP响应消息，其中包含了一个状态行、几个消息报头、一个空行和一个HTML格式的响应正文。

在实际的HTTP通信中，响应正文的内容和长度会根据请求的资源和服务器的配置而有所不同。

# HTTP状态码

当浏览者访问一个网页时，浏览者的浏览器会向网页所在服务器发出请求。

当浏览器接收并显示网页前，此网页所在的服务器会返回一个包含HTTP状态码的信息头（server header）用以响应浏览器的请求。

HTTP状态码的英文为HTTP Status Code。

下面是常见的HTTP状态码：

200 - 请求成功
301 - 资源（网页等）被永久转移到其它URL
404 - 请求的资源（网页等）不存在
500 - 内部服务器错误

## HTTP状态码分类

HTTP状态码由三个十进制数字组成，第一个十进制数字定义了状态码的类型，后两个数字没有分类的作用。

HTTP状态码共分为5种类型：

## HTTP状态码分类

| 分类 | 分类描述                   |
|------|---------------------------|
| 1**  | 信息，服务器收到请求，需要请求者继续执行操作 |
| 2**  | 成功，操作被成功接收并处理 |
| 3**  | 重定向，需要进一步的操作以完成请求           |
| 4**  | 客户端错误，请求包含语法错误或无法完成请求     |
| 5**  | 服务器错误，服务器在处理请求的过程中发生了错误   |

## HTTP状态码列表:

| 状态码 | 状态码英文名称 | 中文描述                                                         |
|--------|--------------|------------------------------------------------------------------|
| 100    | Continue     | 继续。客户端应继续其请求。                                       |
| 101    | Switching Protocols | 切换协议。服务器根据客户端的请求切换协议。只能切换到更高级的协议，例如，切换到HTTP的新版本协议 |
| 200    | OK           | 请求成功。一般用于GET与POST请求。                               |
| 201    | Created      | 已创建。成功请求并创建了新的资源。                               |
| 202    | Accepted     | 已接受。已经接受请求，但未处理完成。                           |
| 203    | Non-Authoritative Information | 非授权信息。请求成功。但返回的meta信息不在原始的服务器，而是一个副本 |
| 204    | No Content    | 无内容。服务器成功处理，但未返回内容。在未更新网页的情况下，可确保浏览器继续显示当前文档 |
| 205    | Reset Content | 重置内容。服务器处理成功，用户终端（例如：浏览器）应重置文档视图。可通过此返回码清除浏览器的表单域 |
| 206    | Partial Content | 部分内容。服务器成功处理了部分GET请求。                   |
| 300    | Multiple Choices | 多种选择。请求的资源可包括多个位置，相应可返回一个资源特征与地址的列表用于用户终端（例如：浏览器）选择 |
| 301    | Moved Permanently | 永久移动。请求的资源已被永久的移动到新URI，返回信息会包括新的URI，浏览器会自动定向到新URI。今后任何新的请求都应使用新的URI代替 |
| 302    | Found         | 临时移动。与301类似。但资源只是临时被移动。客户端应继续使用原有URI |
| 303    | See Other     | 查看其它地址。与301类似。使用GET和POST请求查看。             |
| 304    | Not Modified  | 未修改。所请求的资源未修改，服务器返回此状态码时，不会返回任何资源。客户端通常会缓存访问过的资源，通过提供一个头信息指出客户端希望只返回在指定日期之后修改的资源 |
| 305    | Use Proxy     | 使用代理。所请求的资源必须通过代理访问。                       |
| 306    | Unused        | 已经被废弃的HTTP状态码。                                       |
| 307    | Temporary Redirect | 临时重定向。与302类似。使用GET请求重定向。             |
| 400    | Bad Request   | 客户端请求的语法错误，服务器无法理解。                         |
| 401    | Unauthorized  | 请求要求用户的身份认证。                                      |
| 402    | Payment Required | 保留，将来使用。                                             |
| 403    | Forbidden     | 服务器理解请求客户端的请求，但是拒绝执行此请求。               |
| 404    | Not Found     | 服务器无法根据客户端的请求找到资源（网页）。通过此代码，网站设计人员可设置"您所请求的资源无法找到"的个性页面 |
| 405    | Method Not Allowed | 客户端请求中的方法被禁止。                                 |
| 406    | Not Acceptable | 服务器无法根据客户端请求的内容特性完成请求。                     |
| 407    | Proxy Authentication Required | 请求要求代理的身份认证，与401类似，但请求者应当使用代理进行授权 |
| 408    | Request Time-out | 服务器等待客户端发送的请求时间过长，超时。                   |
| 409    | Conflict      | 服务器完成客户端的PUT请求是可能返回此代码，服务器处理请求时发生了冲突 |
| 410    | Gone          | 客户端请求的资源已经不存在。410不同于404，如果资源以前有现在被永久删除了可使用410代码，网站设计人员可通过301代码指定资源的新位置 |
| 411    | Length Required | 服务器无法处理客户端发送的不带Content-Length的请求信息。       |
| 412    | Precondition Failed | 客户端请求信息的先决条件错误。                             |
| 413    | Request Entity Too Large | 由于请求的实体过大，服务器无法处理，因此拒绝请求。为防止客户端的连续请求，服务器可能会关闭连接。如果只是服务器暂时无法处理，则会包含一个Retry-After的响应信息 |
| 414    | Request-URI Too Large | 请求的URI过长（URI通常为网址），服务器无法处理。         |
| 415    | Unsupported Media Type | 服务器无法处理请求附带的媒体格式。                         |
| 416    | Requested range not satisfiable | 客户端请求的范围无效。                             |
| 417    | Expectation Failed | 服务器无法满足Expect的请求头信息。                           |
| 500    | Internal Server Error | 服务器内部错误，无法完成请求。                               |
| 501    | Not Implemented | 服务器不支持请求的功能，无法完成请求。                         |
| 502    | Bad Gateway    | 充当网关或代理的服务器，从远端服务器接收到了一个无效的请求。   |
| 503    | Service Unavailable | 由于超载或系统维护，服务器暂时的无法处理客户端的请求。延时的长度可包含在服务器的Retry-After头信息中 |
| 504    | Gateway Time-out | 充当网关或代理的服务器，未及时从远端服务器获取请求。         |
| 505    | HTTP Version not supported | 服务器不支持请求的HTTP版本。                             |

## 响应头信息

| Header                 | 解释                                                         | 示例                                       |
|------------------------|--------------------------------------------------------------|-------------------------------------------|
| Accept-Ranges          | 表明服务器是否支持指定范围请求及哪种类型的分段请求           | Accept-Ranges: bytes                    |
| Age                    | 从原始服务器到代理缓存形成的估算时间（以秒计，非负）         | Age: 12                                   |
| Allow                  | 对某网络资源的有效的请求行为，不允许则返回405                 | Allow: GET, HEAD                         |
| Cache-Control          | 告诉所有的缓存机制是否可以缓存及哪种类型                       | Cache-Control: no-cache                   |
| Content-Encoding       | web服务器支持的返回内容压缩编码类型。                         | Content-Encoding: gzip                   |
| Content-Language       | 响应体的语言                                                 | Content-Language: en,zh                   |
| Content-Length         | 响应体的长度                                                 | Content-Length: 348                      |
| Content-Location       | 请求资源可替代的备用的另一地址                               | Content-Location: /index.htm              |
| Content-MD5            | 返回资源的MD5校验值                                          | Content-MD5: Q2hlY2sgSW50ZWdyaXR5IQ==      |
| Content-Range          | 在整个返回体中本部分的字节位置                               | Content-Range: bytes 21010-47021/47022    |
| Content-Type           | 返回内容的MIME类型                                            | Content-Type: text/html; charset=utf-8     |
| Date                   | 原始服务器消息发出的时间                                      | Date: Tue, 15 Nov 2010 08:12:31 GMT        |
| ETag                   | 请求变量的实体标签的当前值                                    | ETag: “737060cd8c284d8af7ad3082f209582d”    |
| Expires                | 响应过期的日期和时间                                          | Expires: Thu, 01 Dec 2010 16:00:00 GMT      |
| Last-Modified          | 请求资源的最后修改时间                                        | Last-Modified: Tue, 15 Nov 2010 12:45:26 GMT|
| Location               | 用来重定向接收方到非请求URL的位置来完成请求或标识新的资源     | Location: http://www.zcmhi.com/archives/94.html |
| Pragma                 | 包括实现特定的指令，它可应用到响应链上的任何接收方             | Pragma: no-cache                          |
| Proxy-Authenticate     | 它指出认证方案和可应用到代理的该URL上的参数                 | Proxy-Authenticate: Basic                 |
| Refresh                | 应用于重定向或一个新的资源被创造，在5秒之后重定向（由网景提出，被大部分浏览器支持） | Refresh: 5; url=http://www.zcmhi.com/archives/94.html |
| Retry-After            | 如果实体暂时不可取，通知客户端在指定时间之后再次尝试         | Retry-After: 120                          |
| Server                 | web服务器软件名称                                              | Server: Apache/1.3.27 (Unix) (Red-Hat/Linux)|
| Set-Cookie             | 设置Http Cookie                                               | Set-Cookie: UserID=JohnDoe; Max-Age=3600; Version=1 |
| Trailer                | 指出头域在分块传输编码的尾部存在                            | Trailer: Max-Forwards                      |
| Transfer-Encoding     | 文件传输编码                                                 | Transfer-Encoding:chunked                |
| Vary                   | 告诉下游代理是使用缓存响应还是从原始服务器请求               | Vary: *                                   |
| Via                    | 告知代理客户端响应是通过哪里发送的                             | Via: 1.0 fred, 1.1 nowhere.com (Apache/1.1) |
| Warning                | 警告实体可能存在的问题                                        | Warning: 199 Miscellaneous warning        |
| WWW-Authenticate       | 表明客户端请求实体应该使用的授权方案                         | WWW-Authenticate: Basic                   |


# 参考资料

https://www.cnblogs.com/luxiaoxun/p/3959450.html

https://www.cnblogs.com/carl10086/p/6185095.html

https://blog.csdn.net/suifeng3051/article/details/22800171

https://blog.csdn.net/sinat_34163739/article/details/108820355

* any list
{:toc}