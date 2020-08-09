---
layout: post
title:  web 安全系列-03-CRLF 注入 & HRS 漏洞
date:  2020-08-09 10:37:20 +0800
categories: [web]
tags: [web, web-safe, sf]
published: true
---

# CRLF 注入

CRLF 注入是一类漏洞，在用户设法向应用插入 CRLF 时出现。在多种互联网协议中，包括 HTML，CRLF 字符表示了行的末尾，通常表示为 `\r\n`，编码后是`%0D%0A`。

所以，一旦我们能够控制HTTP 消息头中的字符，注入一些恶意的换行，这样我们就能注入一些会话Cookie或者HTML代码，所以CRLF Injection又叫HTTP Response Splitting，简称HRS。

在和 HTTP 请求或响应头组合时，这可以用于表示一行的结束，并且可能导致不同的漏洞，包括 HTTP 请求走私和 HTTP 响应分割。

对 HTTP 请求走私而言，它通常在 HTTP 请求传给服务器，服务器处理它并传给另一个服务器时发生，例如代理或者防火墙。

## 危害

这一类型的漏洞可以导致：

缓存污染，它是一种场景，攻击者可以修改缓冲中的条目，并托管恶意页面（即包含 JavaScript）而不是合理的页面。

防火墙绕过，它是一种场景，请求被构造，用于避免安全检查，通常涉及 CRLF 和过大的请求正文。

请求劫持：它是一种场景，攻击者恶意盗取 HTTPOnly 的 Cookie，以及 HTTP 验证信息。这类似于 XSS，但是不需要攻击者和客户端之间的交互。

现在，虽然这些漏洞是存在的，它们难以实现。我在这里引用了它们，所以你对如何实现请求走私有了更好的了解。

而对于 HTTP 响应分割来说，攻击者可以设置任意的响应头，控制响应正文，或者完全分割响应来提供两个响应而不是一个。

# 例子

举个例子，一般网站会在HTTP头中用 `Location: http://baidu.com` 这种方式来进行302跳转，所以我们能控制的内容就是Location:后面的XXX某个网址。

所以一个正常的302跳转包是这样：

```
HTTP/1.1 302 Moved Temporarily 
Date: Fri, 27 Jun 2014 17:52:17 GMT 
Content-Type: text/html 
Content-Length: 154 
Connection: close 
Location: http://www.sina.com.cn
```

但如果我们输入的是

```
http://www.sina.com.cn%0aSet-cookie:JSPSESSID%3Dwooyun
```

注入了一个换行，此时的返回包就会变成这样： 

```
HTTP/1.1 302 Moved Temporarily 
Date: Fri, 27 Jun 2014 17:52:17 GMT 
Content-Type: text/html 
Content-Length: 154 
Connection: close 
Location: http://www.sina.com.cn 
Set-cookie: JSPSESSID=wooyun
```

这个时候这样我们就给访问者设置了一个SESSION，造成一个“会话固定漏洞”。

当然，HRS并不仅限于会话固定，通过注入两个CRLF就能造成一个无视浏览器Filter的反射型XSS。

比如一个网站接受url参数 `http://test.sina.com.cn/?url=xxx`，xxx放在Location后面作为一个跳转。

如果我们输入的是

```
http://test.sina.com.cn/?url=%0d%0a%0d%0a<img src=1 onerror=alert(/xss/)>
```

我们的返回包就会变成这样：

```
HTTP/1.1 302 Moved Temporarily 
Date: Fri, 27 Jun 2014 17:52:17 GMT 
Content-Type: text/html 
Content-Length: 154 
Connection: close 
Location:
<img src=1 onerror=alert(/xss/)>
```

之前说了浏览器会根据第一个CRLF把HTTP包分成头和体，然后将体显示出来。于是我们这里这个标签就会显示出来，造成一个XSS。

为什么说是无视浏览器filter的，这里涉及到另一个问题。

浏览器的Filter是浏览器应对一些反射型XSS做的保护策略，当url中含有XSS相关特征的时候就会过滤掉不显示在页面中，所以不能触发XSS。

怎样才能关掉filter？

一般来说用户这边是不行的，只有数据包中http头含有X-XSS-Protection并且值为0的时候，浏览器才不会开启filter。

说到这里应该就很清楚了，HRS不正是注入HTTP头的一个漏洞吗，我们可以将X-XSS-Protection:0注入到数据包中，再用两个CRLF来注入XSS代码，这样就成功地绕过了浏览器filter，并且执行我们的反射型XSS。

所以说**HRS的危害大于XSS，因为它能绕过一般XSS所绕不过的filter，并能产生会话固定漏洞**。

# 如何预防？

如何修复HRS漏洞，当然是过滤 `\r` 、`\n`之类的换行符，避免输入的数据污染到其他HTTP头。

ps: 所以这个过滤也应该添加到 XSS FILTER 中。

# 拓展阅读 

[web 安全系列](https://houbb.github.io/2020/08/09/web-safe-00-overview)

# 参考资料

[CRLF 注入原理](https://www.cnblogs.com/mysticbinary/p/12560080.html)

[CRLF 漏洞分析](https://wooyun.js.org/drops/CRLF%20Injection%E6%BC%8F%E6%B4%9E%E7%9A%84%E5%88%A9%E7%94%A8%E4%B8%8E%E5%AE%9E%E4%BE%8B%E5%88%86%E6%9E%90.html)

[科普 | 什么是CRLF注入攻击？](https://zhuanlan.zhihu.com/p/22953209)

[CRLF 注入](https://wizardforcel.gitbooks.io/web-hacking-101/content/7.html)

《白帽子讲web安全》

* any list
{:toc}