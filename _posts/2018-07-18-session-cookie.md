---
layout: post
title:  Session Cookie
date:  2018-07-18 13:47:39 +0800
categories: [Http]
tags: [http, net]
published: true
---
 

# Session Cookie

## 作用

网页没有记忆存储功能。

从一个页面到另一个页面的用户将被网站视为一个全新的访问者。会话cookie使您访问的网站能够跟踪您的移动从页面到页面，这样您就不会被要求获得您已经提供给站点的相同信息。Cookies允许您快速、轻松地浏览站点的许多页面，而无需对所访问的每个新区域进行身份验证或重新处理。

会话cookie允许用户在网站中被识别，所以你所做的**任何页面更改或项目或数据选择都会被记住**。

这个功能最常见的例子是任何电子商务网站的购物车特性。当您访问目录的一个页面并选择一些条目时，会话cookie会记住您的选择，这样您的购物车就会有您在准备结账时所选择的条目。

如果没有会话cookie，如果单击CHECKOUT，新页面将不认识您以前页面上的活动，您的购物车将永远是空的。

您可以通过浏览器的设置特性来调整会话cookie。

没有cookie，网站和服务器就没有内存。

一块饼干，就像一把钥匙，可以快速地从一个地方传到另一个地方。如果每次打开一个新web页面时都没有cookie，那么存储该页面的服务器就会将您视为一个全新的访问者。

网站通常使用会话cookie，以确保当您在一个站点内从一个页面移动到另一个页面时，您被识别，并且您输入的任何信息都将被记住。例如，如果电子商务网站不使用会话cookie，那么当您到达收银台时，放在购物篮中的物品将会消失。您可以通过更改浏览器中的设置来选择接受会话cookie。

## 总结

所以，总结一下：

Session 是在服务端保存的一个数据结构，用来跟踪用户的状态，这个数据可以保存在集群、数据库、文件中；

Cookie 是客户端保存用户信息的一种机制，用来记录用户的一些信息，也是实现 Session 的一种方式。


# Cookie

Cookie是浏览器保存信息的一种方式，可以理解为一个文件，保存到客户端了啊，服务器可以通过响应浏览器的set-cookie的标头，得到Cookie的信息。

你可以给这个文件设置一个期限，这个期限呢，不会因为浏览器的关闭而消失啊。

## 操作

- add

```js
Cookie cookie = new Cookie("user", "suntao");
cookie.setMaxAge(7*24*60*60);     // 一星期有效
response.addCookie(cookie);
```

- get

```js
// 因为取得的是整个网页作用域的Cookie的值，所以得到的是个数组
Cookie[] cookies = request.getCookies();

for(int i = 0 ; i < cookies.length ; i++) {
  String name = cookies[i].getName() ;
  String value = cookies[i].getValue() ;
}
```

# HttpSession 会话机制

Servlet的会话机制的实现。

创建于服务器端，保存于服务器，维护于服务器端,每创建一个新的Session,服务器端都会分配一个唯一的ID，并且把这个ID保存到客户端的Cookie中，保存形式是以 `JSESSIONID` 来保存的。

## 细节

通过HttpServletRequest.getSession 进行获得HttpSession对象，通过setAttribute()给会话赋值，可以通过invalidate()将其失效。

- 每一个HttpSession有一个唯一的标识SessionID，只要同一次打开的浏览器通过request获取到session都是同一个。

- WEB容器默认的是用Cookie机制保存SessionID到客户端，并将此Cookie设置为关闭浏览器失效，Cookie名称为：JSESSIONID

- 每次请求通过读取Cookie中的SessionID获取相对应的Session会话

- HttpSession的数据保存在服务器端，所以不要保存数据量耗资源很大的数据资源，必要时可以将属性移除或者设置为失效

- HttpSession可以通过 `setMaxInactiveInterval()` 设置失效时间(秒)或者在 web.xml 中配置

```xml
<session-config>
    <!--单位：分钟-->
    <session-timeout>30</session-timeout>
</session-config>
```

- HttpSession默认使用Cookie进行保存SessionID，当客户端禁用了Cookie之后，可以通过URL重写的方式进行实现。

    - 可以通过response.encodeURL(url) 进行实现

    - API对encodeURL的结束为，当浏览器支持Cookie时，url不做任何处理；当浏览器不支持Cookie的时候，将会重写URL将SessionID拼接到访问地址后。

# 参考资料

http://www.allaboutcookies.org/cookies/session-cookies-used-for.html

http://www.allaboutcookies.org/manage-cookies/index.html

https://developer.mozilla.org/en-US/docs/Web/HTTP/Cookies

https://www.jianshu.com/p/25802021be63

https://www.zhihu.com/question/19786827



* any list
{:toc}