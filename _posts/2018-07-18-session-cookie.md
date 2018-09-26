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

# Session

session是服务端的技术，当浏览器第1次访问web资源的时候，服务器会自动为其创建一个session，并保存在服务器，当需要保存用户数据的时候，可以将数据写入session中。

当用户访问其他程序的时候，就可以直接从session中取值。值得一提的是sesion是建立在cookie的基础上创建的。


## Session 实现原理

session的实现原理是建立在给浏览器回写cookie，并且是以JSESSIONID为键，但是这个cookie是没有时间的，也就是说，当你关闭浏览器时，代表一个会话结束了，也就是说你的session会被删除，当你再次访问服务器的时候，服务器会为你重新创建一个session。

## Session 的使用

### 客户端不禁用 cookie

```java
HttpSession session = request.getSession();//客户端访问服务器的时候，服务器会自动创建一个session,如果客户端没有禁用cookie的话。
String sessionId = session.getId();
Cookie cookie = new Cookie("JSESSIONID",sessionId);
cookie.setPath("/");
cookie.setMaxAge(30*60);//注意在tomcat的web.xml文件中，设置了session的生命周期最长为30分钟。
response.addCookie(cookie);
session.setAttribute("key","value");
```

### 客户端禁用 cookie

如果客户端禁用cookie，那么需要调用response的encodeURL("转发的地址")

```java
HttpSession session = request.getSession();
// 注意，调用这个方法之前，必须要先获取session,（在该方法的API描述得很清楚）
String url1 = response.encodeURL("xxxx");
PrintWriter pw = response.getWriter();
pw.write(url1);
```

- URL 重写

URL地址重写的原理是将该用户Session的id信息重写到URL地址中。服务器能够解析重写后的URL获取Session的id。

这样即使客户端不支持Cookie，也可以使用Session来记录用户状态。

`encodeURL()` 方法在使用时，会首先判断Session是否启用，如果未启用，直接返回url。 

然后判断客户端是否启用Cookie，如果未启用，则将参数url中加入SessionID信息，然后返回修改的URL；如果启用，直接返回参数url。

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

# HttpSession 的常见问题

## Session 的创建时机

一个常见的误解是以为session在有客户端访问时就被创建，然而事实是直到某server端程序调用 `HttpServletRequest.getSession(true)` 这样的语句时才被创建。

注意如果JSP没有显示的使用 `<%@page session="false"%>` 关闭session，则JSP文件在编译成Servlet时将会自动加上这样一条语句

`HttpSession session = HttpServletRequest.getSession(true);` 这也是JSP中隐含的session对象的来历。 

由于session会消耗内存资源，因此，如果不打算使用session，应该在所有的JSP中关闭它。 

## Session 何时被删除 

综合前面的讨论，session 在下列情况下被删除

1. 程序调用 HttpSession.invalidate();

2. 距离上一次收到客户端发送的 session id时 间间隔超过了session的超时设置;

3. 服务器进程被停止（非持久session） 

## 如何做到在浏览器关闭时删除 Session 

严格的讲，做不到这一点。

可以做一点努力的办法是在所有的客户端页面里使用 javascript 代码 window.onclose() 来监视浏览器的关闭动作，然后向服务器发送一个请求来删除session。

但是对于浏览器崩溃或者强行杀死进程这些非常规手段仍然无能为力。 

## 有个 HttpSessionListener 是怎么回事 

你可以创建这样的listener去监控session的创建和销毁事件，使得在发生这样的事件时你可以做一些相应的工作。

注意是session的创建和销毁动作触发listener，而不是相反。

类似的与HttpSession有关的listener还有HttpSessionBindingListener，HttpSessionActivationListener和HttpSessionAttributeListener。 

## 存放在 Session 中的对象必须是可序列化的吗 

不是必需的。

要求对象可序列化只是为了session能够在集群中被复制或者能够持久保存或者在必要时server能够暂时把session交换出内存。

在Weblogic Server的session中放置一个不可序列化的对象在控制台上会收到一个警告。

我所用过的某个iPlanet版本如果session中有不可序列化的对象，在session销毁时会有一个Exception，很奇怪。 

## 如何才能正确的应付客户端禁止cookie的可能性 

对所有的URL使用URL重写，包括超链接，form的action，和重定向的URL。

## 开两个浏览器窗口访问应用程序会使用同一个session还是不同的session 

参见第三小节对cookie的讨论，对session来说是只认id不认人，因此不同的浏览器，不同的窗口打开方式以及不同的cookie存储方式都会对这个问题的答案有影响。 

## 如何防止用户打开两个浏览器窗口操作导致的session混乱 

这个问题与防止表单多次提交是类似的，可以通过设置客户端的令牌来解决。

就是在服务器每次生成一个不同的id返回给客户端，同时保存在session里，客户端提交表单时必须把这个id也返回服务器，程序首先比较返回的id与保存在session里的值是否一致，如果不一致则说明本次操作已经被提交过了。

可以参看《J2EE核心模式》关于表示层模式的部分。需要注意的是对于使用javascript window.open打开的窗口，一般不设置这个id，或者使用单独的id，以防主窗口无法操作，建议不要再window.open打开的窗口里做修改操作，这样就可以不用设置。 

## 为什么在Weblogic Server中改变session的值后要重新调用一次session.setValue 
    
做这个动作主要是为了在集群环境中提示Weblogic Server session中的值发生了改变，需要向其他服务器进程复制新的session值。 

## 为什么session不见了 

排除session正常失效的因素之外，服务器本身的可能性应该是微乎其微的，虽然笔者在iPlanet6SP1加若干补丁的Solaris版本上倒也遇到过；

浏览器插件的可能性次之，笔者也遇到过3721插件造成的问题；理论上防火墙或者代理服务器在cookie处理上也有可能会出现问题。 

出现这一问题的大部分原因都是程序的错误，最常见的就是在一个应用程序中去访问另外一个应用程序。

# Session 的共享

[Session 共享](https://houbb.github.io/2018/09/26/session-sharing)

# 参考资料

http://www.allaboutcookies.org/cookies/session-cookies-used-for.html

http://www.allaboutcookies.org/manage-cookies/index.html

https://developer.mozilla.org/en-US/docs/Web/HTTP/Cookies

https://www.jianshu.com/p/25802021be63

https://www.zhihu.com/question/19786827

[Session 机制详解](http://justsee.iteye.com/blog/1570652)

* any list
{:toc}