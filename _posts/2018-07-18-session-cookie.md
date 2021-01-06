---
layout: post
title:  web 会话机制之 session cookie 详解
date:  2018-07-18 13:47:39 +0800
categories: [Http]
tags: [http, net, session, cookie, web, sf]
published: true
---


# 老板的苦恼

假如你在繁华的街角开了一家店，每天客人络绎不绝。

不过你作为老板却有一些苦恼，你想知道自己的顾客上一次是什么时候来的？

在店里的时候买了什么商品，方便购物的时候进一步提升用户体验。

可是这些客人赤果果的来，无牵挂的走，店里一直没有留下客人的信息，聪明的你会怎么解决这个问题呢？

![输入图片说明](https://images.gitee.com/uploads/images/2021/0106/221934_e3c93818_508704.jpeg "街角的咖啡店.jpg")

# 互联网没有记忆

我们常说互联网没有记忆。互联网背后的 HTTP 协议也是如此，正因为它无状态，所以足够简单，便于拓展，得以发展到今天这种局面。

同时也正是因为 HTTP 协议无状态，所以对用户访问等缺乏识别记忆功能。

那怎么解决这个问题呢？

目前有两张最主流的方式：cookie 和 session。

## cookie

Cookie 是客户端保存用户信息的一种机制，用来记录用户的一些信息，也是实现 Session 的一种方式。

这个就好比我们把客户上次到店里的时间放在用户的口袋里，下次他们来的时候，我们拿出来看一下，就知道客户上次是什么时候来的了。

当然这些信息用户自己是可以修改的，比如各种浏览器的 cookies 可以被清空。

这让我想起来以前读的一个故事：

> 刚在路边摊准备买点小吃。我说：老板我经常来买，给我便宜点吧。老板说：我今天第一天摆摊。

![铁锅炖自己](https://images.gitee.com/uploads/images/2021/0106/210557_ea208bd4_508704.jpeg)

信息都放在用户的口袋里虽然方便，但是服务端也要记一些必要的信息，不然被忽悠了都不知道。

## session

Session 是在服务端保存的一个数据结构，用来跟踪用户的状态，这个数据可以保存在集群、数据库、文件中；

这个就类似于店里来客人了，服务员留心看一下，知道用户购物车里放了什么商品，是否需要帮助等等。

# Cookie 操作

为了让大家直观的感受到 cookie 的使用，我们来看一下 CRUD 的例子。

为了简单，此处使用 servlet 进行演示。

![Cookie](https://images.gitee.com/uploads/images/2021/0106/222136_e585c519_508704.png "屏幕截图.png")

## 说明 

Cookie是浏览器保存信息的一种方式，可以理解为一个文件，保存到客户端了啊，服务器可以通过响应浏览器的set-cookie的标头，得到Cookie的信息。

你可以给这个文件设置一个期限，这个期限呢，不会因为浏览器的关闭而消失。

## 添加

我们可以新建一个 cookie 返回给 resp。

```java
package com.github.houbb.simple.servlet;

import javax.servlet.annotation.WebServlet;
import javax.servlet.http.Cookie;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.io.PrintWriter;

/**
 * @author binbin.hou
 * @since 0.0.2
 */
@WebServlet("/cookie/add")
public class CookieAddServlet extends HttpServlet {

    private static final long serialVersionUID = 491287664925808862L;

    @Override
    protected void doGet(HttpServletRequest req, HttpServletResponse resp) throws IOException {
        //1. 创建 cookie 信息
        Cookie cookie = new Cookie("age", "10");
        //30min
        cookie.setMaxAge(30 * 60);
        //2. 返回给客户端，用于客户端保存
        resp.addCookie(cookie);

        //3. 页面输出
        resp.setCharacterEncoding("UTF-8");
        resp.setContentType("text/html;charset=utf-8");
        PrintWriter out = resp.getWriter();
        // 后端会根据页面是否禁用 cookie,选择是否将 sessionId 放在 url 后面
        String url = resp.encodeURL("/cookie/get");
        out.println("<a href='"+url+"'>获取 cookie</a>");
    }

}
```

## 获取 

获取 cookie 也比较简单，直接通过 `req.getCookies()` 就可以获取到整个 cookie 列表。

```java
package com.github.houbb.simple.servlet;

import javax.servlet.annotation.WebServlet;
import javax.servlet.http.Cookie;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.io.PrintWriter;

/**
 * @author binbin.hou
 * @since 0.0.2
 */
@WebServlet("/cookie/get")
public class CookieGetServlet extends HttpServlet {

    private static final long serialVersionUID = 491287664925808862L;

    @Override
    protected void doGet(HttpServletRequest req, HttpServletResponse resp) throws IOException {
        // 实际的逻辑是在这里
        PrintWriter out = resp.getWriter();

        Cookie[] cookies = req.getCookies();
        if(cookies != null) {
            for(Cookie cookie : cookies) {
                out.println(cookie.getName()+"="+cookie.getValue()+"");
            }
        }
    }

}
```

## 删除

cookie 是非法直接删除的，一般都是首先获取，然后设置 maxAge 为 0。

```java
package com.github.houbb.simple.servlet;

import javax.servlet.annotation.WebServlet;
import javax.servlet.http.Cookie;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.io.PrintWriter;

/**
 * 清空
 * @author binbin.hou
 * @since 0.0.2
 */
@WebServlet("/cookie/clear")
public class CookieClearServlet extends HttpServlet {

    private static final long serialVersionUID = 491287664925808862L;

    @Override
    protected void doGet(HttpServletRequest req, HttpServletResponse resp) throws IOException {
        for(Cookie cookie : req.getCookies()) {
            // 立刻失效
            cookie.setMaxAge(0);
            cookie.setPath("/");
            resp.addCookie(cookie);
        }

        resp.setContentType("text/html;charset=utf-8");
        resp.setCharacterEncoding("UTF-8");
        PrintWriter out = resp.getWriter();
        out.println("<a href='/cookie/add'>添加 cookie 信息</a>");
    }

}
```

# session

![session](https://images.gitee.com/uploads/images/2021/0106/222105_00f0ebd5_508704.png "屏幕截图.png")

## 说明

session的实现原理是建立在给浏览器回写cookie，并且是以 JSESSIONID 为键，但是这个cookie是没有时间的，也就是说，当你关闭浏览器时，代表一个会话结束了，也就是说你的session会被删除，当你再次访问服务器的时候，服务器会为你重新创建一个session。

## 添加

添加 session 属性的方式也比较简单，直接使用 `req.getSession().setAttribute("name", "session");` 即可。

```java
package com.github.houbb.simple.servlet;

import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.io.PrintWriter;

/**
 * @author binbin.hou
 * @since 0.0.2
 */
@WebServlet("/session/add")
public class SessionAddServlet extends HttpServlet {

    private static final long serialVersionUID = 491287664925808862L;

    @Override
    protected void doGet(HttpServletRequest req, HttpServletResponse resp) throws IOException {
        // 只有在 getSession 的时候，才会设置对应的 JSESSIONID
        req.getSession().setAttribute("name", "session");

        resp.setContentType("text/html;charset=utf-8");
        resp.setCharacterEncoding("UTF-8");
        PrintWriter out = resp.getWriter();

        // 后端会根据页面是否禁用 cookie,选择是否将 sessionId 放在 url 后面
        String url = resp.encodeURL("/session/get");
        out.println("<a href='"+url+"'>获取 session 信息</a>");
    }

}
```

## 获取

我们可以通过 `httpSession.getAttributeNames()` 获取到所有的 session 属性。

也可以通过 `req.getSession().getId()` 得到我们的 JSESSIONID 属性。

```java
package com.github.houbb.simple.servlet;

import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.servlet.http.HttpSession;
import java.io.IOException;
import java.io.PrintWriter;
import java.util.Enumeration;

/**
 * @author binbin.hou
 * @since 0.0.2
 */
@WebServlet("/session/get")
public class SessionGetServlet extends HttpServlet {

    private static final long serialVersionUID = 491287664925808862L;

    @Override
    protected void doGet(HttpServletRequest req, HttpServletResponse resp) throws IOException {
        // 实际的逻辑是在这里
        PrintWriter out = resp.getWriter();
        String jsessionId = req.getSession().getId();
        out.println("jsessionId: " + jsessionId);

        HttpSession httpSession = req.getSession();
        Enumeration attrs = httpSession.getAttributeNames();
        while (attrs.hasMoreElements()) {
            String key = (String) attrs.nextElement();
            Object value = httpSession.getAttribute(key);
            out.println("key: " + key +"; value: " + value);
        }
    }

}
```

## 清空

清空 session 的操作非常简单。

直接通过 `httpSession.removeAttribute(key)` 即可操作。

```java
package com.github.houbb.simple.servlet;

import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.servlet.http.HttpSession;
import java.io.IOException;
import java.io.PrintWriter;
import java.util.Enumeration;

/**
 * @author binbin.hou
 * @since 0.0.2
 */
@WebServlet("/session/clear")
public class SessionClearServlet extends HttpServlet {

    private static final long serialVersionUID = 491287664925808862L;

    @Override
    protected void doGet(HttpServletRequest req, HttpServletResponse resp) throws IOException {
        resp.setContentType("text/html;charset=utf-8");
        resp.setCharacterEncoding("UTF-8");
        PrintWriter out = resp.getWriter();

        HttpSession httpSession = req.getSession();
        Enumeration attrs = httpSession.getAttributeNames();
        while (attrs.hasMoreElements()) {
            String key = (String) attrs.nextElement();

            httpSession.removeAttribute(key);
            out.println("清空 key: " + key);
        }
    }

}
```

上面的代码，为了便于大家学习，已经全部开源：

> [https://gitee.com/houbinbin/simple-servlet](https://gitee.com/houbinbin/simple-servlet)


# session 的一些细节

相信很多小伙伴读到这里依然是意犹未尽的。

接下来我们一起考虑几个细节问题。

## 会话机制

session 创建于服务器端，保存于服务器，维护于服务器端,每创建一个新的Session,服务器端都会分配一个唯一的ID，并且把这个ID保存到客户端的Cookie中，保存形式是以 `JSESSIONID` 来保存的。

## 一点细节

![不要在意](https://images.gitee.com/uploads/images/2021/0106/222534_d3c83f5a_508704.png "屏幕截图.png")

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

## session 的创建时机

一个常见的误解是以为session在有客户端访问时就被创建，然而事实是直到某server端程序调用 `HttpServletRequest.getSession(true)` 这样的语句时才被创建。

## Session 何时被删除 

综合前面的讨论，session 在下列情况下被删除

1. 程序调用 HttpSession.invalidate();

2. 距离上一次收到客户端发送的 session id时 间间隔超过了session的超时设置;

3. 服务器进程被停止（非持久session） 

## JSESSIONID 的创建与获取

我们在 session 创建的时候，也就是第一次调用 `HttpServletRequest.getSession(true)` 时，会给客户端分配一个 JSESSIONID 用于唯一标识这个用户。

这个信息会被写回到客户端的 cookie 中，并且后续的请求都会携带。

比如我测试时的 JSESSIONID：

```
Cookie: JSESSIONID=8AE65FE9AEB0AA6053FADF9ED7AEE544
```

可以发现实际上 JSESSIONID 是非常依赖客户端 cookie 的，那么问题来了，如果用户禁用了 cookie 怎么办？

# 客户端禁用 cookie

cookie 是用户自己的口袋，如果用户有一天把口袋全部封死也是有可能的。

如果客户端禁用了 cookie，一般有两种解决方案。

### 隐藏域

我们将 JSESSIONID 的值传入到页面中，放入一个隐藏的 input 框中，每次请求带上这个参数。

```html
<form name="testform" action="/xxx"> 
　 <input type="hidden" name="jsessionid" value="8AE65FE9AEB0AA6053FADF9ED7AEE544"/>
 　<input type="text"> 
</form>
```

后端通过 `req.getParameter("jsessionid")` 的方式获取到这个 jsessionid 信息。

### URL 重写

URL地址重写的原理是将该用户Session的id信息重写到URL地址中。服务器能够解析重写后的URL获取Session的id。

这样即使客户端不支持Cookie，也可以使用Session来记录用户状态。

`encodeURL()` 方法在使用时，会首先判断Session是否启用，如果未启用，直接返回url。 

然后判断客户端是否启用Cookie，如果未启用，则将参数url中加入SessionID信息，然后返回修改的URL；如果启用，直接返回参数url。

就像老马前面代码写的一样：

```java
// 后端会根据页面是否禁用 cookie,选择是否将 sessionId 放在 url 后面
String url = resp.encodeURL("/session/get");
out.println("<a href='"+url+"'>获取 session 信息</a>");
```

如果我们禁用 cookie，链接的地址就会变成:

```
http://localhost:8080/session/get;jsessionid=3E2EEB9840F2566EDB3085BA392AE6CB
```

`;jsessionid=3E2EEB9840F2566EDB3085BA392AE6CB` 这个是 encodeURL 自己加上去的，这样我们就可以像原来一样处理 session id 了。

# 连锁店的机遇与挑战

当目前为止，你作为一家店的老板已经可以轻松的掌握客户的信息了。

哪怕用户把自己的口袋封死。

随着你的生意越来越好，你的店从一家门面，变成了多家连锁店。

新的问题又来了，一个用户去了其中的一家，当到另外一家店面的时候，如何得到用户对应的信息呢？

![连锁店](https://images.gitee.com/uploads/images/2021/0106/222911_7d5bfbc2_508704.jpeg "咖啡连锁.jpg")

这个就涉及到分布式系统的 session 共享问题。

其实解决问题的思路也是从两个角度出发：

（1）用户的角度

在用户的口袋中放着验证信息。

不过需要考虑信息被恶意修改等，这方面 JWT 做的比较优秀。

可以参考：

[分布式系统 session 共享解决方案 JWT 实战笔记](https://mp.toutiao.com/profile_v4/graphic/preview?pgc_id=6914648140029362691)

（2）服务者的角度

我们作为连锁店，只需要把各个店里的商户信息共享即可。

至于共享到哪里，可以是 redis 也可以是数据库。

这方面 spring session 设计的比较优秀，可以参考：

[springboot整合redis实现分布式session](https://www.toutiao.com/item/6905646805476753927/)

[spring session 结合拦截器实战](https://www.toutiao.com/item/6914623299200745992/)

# 小结

这一节老马和大家一起学习了 web 会话机制中的 session 和 cookie 机制。

我们知道问题的源头，自然就理解了一个技术产生需要解决的问题。

最后拓展到了分布式系统中的 session 共享问题，后续我们将重点介绍下 spring sesison 和 jwt，感兴趣的小伙伴可以关注一波不迷路。

希望本文对你有所帮助，如果喜欢，欢迎点赞收藏转发一波。

我是老马，期待与你的下次相遇。

# Session 的共享

[Session 共享](https://houbb.github.io/2018/09/26/session-sharing)




# 参考资料

http://www.allaboutcookies.org/cookies/session-cookies-used-for.html

http://www.allaboutcookies.org/manage-cookies/index.html

https://developer.mozilla.org/en-US/docs/Web/HTTP/Cookies

https://www.jianshu.com/p/25802021be63

https://www.zhihu.com/question/19786827

[Session 机制详解](http://justsee.iteye.com/blog/1570652)

[JavaWeb基于session和cookie的数据共享](https://www.cnblogs.com/nanyangke-cjz/p/7143799.html)

[Java Web(三) 会话机制，Cookie和Session详解 ](https://www.cnblogs.com/whgk/p/6422391.html)

[(JavaEE)JavaWeb中的Session与Cookie机制(案例-cookie验证)](https://blog.csdn.net/qq_39872652/article/details/80993092)

[JavaWeb使用Session和Cookie实现登录认证](https://www.jb51.net/article/108764.htm)

[Java Web之Cookie和Session详解](https://blog.csdn.net/yuzhiqiang_1993/article/details/81232914)

## 禁用 cookie

[禁用 cookie 之后的 jsessionid 问题](http://www.360doc.com/content/15/0123/16/18924983_443118801.shtml)

[cookie 被禁用，如何使用session](https://www.cnblogs.com/ceceliahappycoding/p/10544075.html)

[当浏览器禁用了cookie，java实现传递JSESSIONID](https://blog.csdn.net/qq_36244155/article/details/80083385)

* any list
{:toc}