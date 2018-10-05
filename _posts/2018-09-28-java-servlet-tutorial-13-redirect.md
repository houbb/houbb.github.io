---
layout: post
title: Java Servlet 教程-13-网页重定向 sendRedirect
date:  2018-10-05 15:11:45 +0800
categories: [Java]
tags: [web, servlet, java, sh]
published: true
excerpt: Java Servlet 教程-13-网页重定向 sendRedirect；也可以通过把 setStatus() 和 setHeader() 方法一起使用来达到同样的效果。
---

# 网页重定向

当文档移动到新的位置，我们需要向客户端发送这个新位置时，我们需要用到网页重定向。

当然，也可能是为了负载均衡，或者只是为了简单的随机，这些情况都有可能用到网页重定向。

有两种实现方式：

- sendRedirect()

- setStatus() + setHeader()

# sendRedirect()

重定向请求到另一个网页的最简单的方式是使用 response 对象的 sendRedirect() 方法。

该方法把响应连同状态码和新的网页位置发送回浏览器。

## 实战代码

- SendRedirectServlet.java

sendRedirect() 方式实现

```java
@WebServlet("/send/redirect")
public class SendRedirectServlet extends HttpServlet {

    private static final long serialVersionUID = 2254842514230440653L;

    @Override
    protected void doGet(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {
        // 可以跳转到其他 servlet 或者页面
        resp.sendRedirect("https://www.google.com/");
    }
}
```

# setStatus() + setHeader()

您也可以通过把 setStatus() 和 setHeader() 方法一起使用来达到同样的效果：

## 实战代码

- StatusHeaderServlet.java

```java
@WebServlet("/redirect/status/header")
public class StatusHeaderServlet extends HttpServlet {

    private static final long serialVersionUID = 2254842514230440653L;

    @Override
    protected void doGet(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {
        resp.setStatus(HttpServletResponse.SC_MOVED_TEMPORARILY);
        resp.setHeader("Location", "https://www.google.com/");
    }
}
```

# 请求转发对比

## 重定向过程

客户浏览器发送http请求——》web服务器接受后发送302状态码响应及对应新的location给客户浏览器——》客户浏览器发现是302响应，则自动再发送一个新的http请求，请求url是新的location地址——》服务器根据此请求寻找资源并发送给客户。

在这里location可以重定向到任意URL，既然是浏览器重新发出了请求，则就没有什么request传递的概念了。

在客户浏览器路径栏显示的是其重定向的路径，客户可以观察到地址的变化的。重定向行为是浏览器做了至少两次的访问请求的。

## 内部跳转过程

客户浏览器发送http请求——》web服务器接受此请求——》调用内部的一个方法在容器内部完成请求处理和转发动作——》将目标资源发送给客户；

在这里，转发的路径必须是同一个web容器下的url，其不能转向到其他的web路径上去，中间传递的是自己的容器内的request。

在客户浏览器路径栏显示的仍然是其第一次访问的路径，也就是说客户是感觉不到服务器做了转发的。内部跳转行为是浏览器只做了一次访问请求。

# 参考资料

[Servlet 网页重定向](http://www.runoob.com/servlet/servlet-page-redirect.html)

[servlet中请求转发（forword）与重定向（sendredirect）的区别](https://www.cnblogs.com/CodeGuy/archive/2012/02/13/2349970.html)

[servlet重定向](http://akalius.iteye.com/blog/185889)

* any list
{:toc}