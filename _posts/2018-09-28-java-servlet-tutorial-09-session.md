---
layout: post
title: Java Servlet 教程-09-session
date:  2018-10-04 15:41:59 +0800
categories: [Java]
tags: [web, servlet, java, sh]
published: true
excerpt: Java Servlet 教程-09-session
---

# Servlet Session 跟踪

HTTP 是一种"无状态"协议，这意味着每次客户端检索网页时，客户端打开一个单独的连接到 Web 服务器，服务器会自动不保留之前客户端请求的任何记录。

但是仍然有以下三种方式来维持 Web 客户端和 Web 服务器之间的 session 会话：

## Cookies

一个 Web 服务器可以分配一个唯一的 session 会话 ID 作为每个 Web 客户端的 cookie，对于客户端的后续请求可以使用接收到的 cookie 来识别。

这可能不是一个有效的方法，因为很多浏览器不支持 cookie，所以我们建议不要使用这种方式来维持 session 会话。

## 隐藏的表单字段

一个 Web 服务器可以发送一个隐藏的 HTML 表单字段，以及一个唯一的 session 会话 ID，如下所示：

```html
<input type="hidden" name="sessionid" value="12345">
```

该条目意味着，当表单被提交时，指定的名称和值会被自动包含在 GET 或 POST 数据中。

每次当 Web 浏览器发送回请求时，session_id 值可以用于保持不同的 Web 浏览器的跟踪。

这可能是一种保持 session 会话跟踪的有效方式，但是点击常规的超文本链接（`<A HREF...>`）不会导致表单提交，因此隐藏的表单字段也不支持常规的 session 会话跟踪。

## URL 重写

您可以在每个 URL 末尾追加一些额外的数据来标识 session 会话，服务器会把该 session 会话标识符与已存储的有关 session 会话的数据相关联。

例如，`http://w3cschool.cc/file.htm;sessionid=12345`，session 会话标识符被附加为 sessionid=12345，标识符可被 Web 服务器访问以识别客户端。

URL 重写是一种更好的维持 session 会话的方式，它在浏览器不支持 cookie 时能够很好地工作，但是它的缺点是会动态生成每个 URL 来为页面分配一个 session 会话 ID，即使是在很简单的静态 HTML 页面中也会如此。

- 容器怎么知道 cookie 被禁用了的？

当容器看到 `HttpSession session = request.getSession();` 就知道我们需要开启一个会话，此时容器并不关心是否 cookie 被禁用，
而是想客户端返回响应时，同时尝试 cookie 和 URL 重写。

- 生效的实际方式

必须是你对 URL 进行了编码。

encodeURL() 或者 encodeDirectURL()，其他的事情都会交给容器去完成。

# HttpSession 对象

除了上述的三种方式，Servlet 还提供了 HttpSession 接口，该接口提供了一种跨多个页面请求或访问网站时识别用户以及存储有关用户信息的方式。

Servlet 容器使用这个接口来创建一个 HTTP 客户端和 HTTP 服务器之间的 session 会话。

会话持续一个指定的时间段，跨多个连接或页面请求。

您会通过调用 HttpServletRequest 的公共方法 getSession() 来获取 HttpSession 对象，如下所示：

```java
HttpSession session = request.getSession();
```

## 创建一个 session

当会话仅是一个未来的且还没有被建立时会话被认为是新的。

因为 HTTP是一种基于请求-响应的协议，直到客户端“加入”到 HTTP 会话之前它都被认为是新的。

当会话跟踪信息返回到服务器指示会话已经建立时客户端加入到会话。直到客户端加入到会话，不能假定下一个来自客户端的请求被识别为同一会话。

如果以下之一是 true，会话被认为是新的：

1. 客户端还不知道会话

2. 客户端选择不加入会话。

这些条件定义了 servlet 容器没有机制能把一个请求与之前的请求相关联的情况。

servlet开发人员必须设计他的应用以便处理客户端没有，不能，或不会加入会话的情况。

与每个会话相关联是一个包含唯一标识符的字符串，也被称为会话ID。

会话 ID 的值能通过调用 `javax.servlet.http.HttpSession.getId()` 获取，
且能在创建后通过调用 `javax.servlet.http.HttpServletRequest.changeSessionId()` 改变。

## 会话范围

HttpSession 对象必须被限定在应用级别。

底层的机制，如使用 cookie 建立会话，不同的上下文可以是相同，但所引用的对象，包括包括该对象中的属性，决不能在容器上下文之间共享。

用一个例子来说明该要求： 如果 servlet 使用 RequestDispatcher 来调用另一个 Web 应用的 servlet，任何创建的会话和被调用 servlet 所见的必须不同于来自调用会话所见的。

此外，一个上下文的会话在请求进入那个上下文时必须是可恢复的，不管是直接访问它们关联的上下文还是在请求目标分派时创建的会话。

## 绑定属性到会话

servlet 可以按名称绑定对象属性到 HttpSession 实现，任何绑定到会话的对象可用于任意其他的 servlet，其属于同一个 ServletContext 且处理属于相同会话中的请求。 

一些对象可能需要在它们被放进会话或从会话中移除时得到通知。

这些信息可以从 `HttpSessionBindingListener` 接口实现的对象中获取。

这个接口定义了以下方法，用于标识一个对象被绑定到会话或从会话解除绑定时。

1. valueBound

2. valueUnbound

在对象对 HttpSession 接口的 getAttribute 方法可用之前 valueBound 方法必须被调用。

在对象对 HttpSession 接口的 getAttribute 方法不可用之后 valueUnbound 方法必须被调用。

## 会话超时

在 HTTP 协议中，当客户端不再处于活动状态时没有显示的终止信号。

这意味着当客户端不再处于活跃状态时可以使用的唯一机制是超时时间。

Servlet 容器定义了默认的会话超时时间，且可以通过 HttpSession 接口的 getMaxInactiveInterval 方法获取。

开发人员可以使用 HttpSession 接口的 `setMaxInactiveInterval()` 改变超时时间。

这些方法的超时时间以秒为单位。根据定义，如果超时时间设置为 0 或更小的值，会话将永不过期。会话不会失效，直到所有 servlet 使用的会话已经退出其 service 方法。一旦会话已失效,新的请求必须不能看到该会话。

## 最后访问时间

HttpSession 接口的 getLastAccessedTime() 方法允许 servlet 确定在当前请求之前的会话的最后访问时间。

当会话中的请求是 servlet 容器第一个处理时该会话被认为是访问了。

## HttpSession 方法

[HttpSession 文档](https://tomcat.apache.org/tomcat-5.5-doc/servletapi/javax/servlet/http/HttpSession.html)

# 重要会话语义

## 多线程问题

在同一时间多个 servlet 执行请求的线程可能都有到同一会话的活跃访问。容器必须确保，以一种线程安全的方式维护表示会话属性的内部数据结构。开发人员负责线程安全的访问属性对象本身。这样将防止并发访问HttpSession对象内的属性集合，消除了应用程序导致破坏集合的机会。

## 客户端语义

由于 cookie 或 SSL 证书通常由 Web 浏览器进程控制，且不与浏览器的任意特定窗口关联，从客户端应用程序发起的到 servlet 容器的请求可能在同一会话。

为了最大的可移植性，开发人员应该假定客户端所有窗口参与同一会话。

## 分布式环境

在一个标识为分布式的应用程序中，会话中的所有请求在同一时间必须仅被一个 JVM 处理。

容器必须能够使用适当的 setAttribute 或 putValue 方法把所有对象放入到 HttpSession 类实例。

以下限制被强加来满足这些条件：

1. 容器必须接受实现了 Serializable 接口的对象。

2. 容器可以选择支持其他指定对象存储在 HttpSession 中，如Enterprise JavaBeans 组件和事务的引用。

3. 由特定容器的设施处理会话迁移。

当分布式 servlet 容器不支持必需的会话迁移存储对象机制时容器必须抛出 IllegalArgumentException。

分布式 servlet 容器必须支持迁移的对象实现 Serializable 的必要机制。

这些限制意味着开发人员确保除在非分布式容器中遇到的问题没有额外的并发问题。

容器供应商可以确保可扩展性和服务质量的功能，如负载平衡和故障转移通过把会话对象和它的内容从分布式系统的任意一个活跃节点移动到系统的一个不同的节点上。

如果分布式容器持久化或迁移会话提供服务质量特性，它们不限制使用原生的 JVM 序列化机制用于序列化 HttpSession 和它们的属性。

如果开发人员实现 session 属性上的 readObject 和 writeObject 方法，他们也不能保证容器将调用这些方法，但保证 Serializable 结束它们的属性将被保存。

容器必须在迁移会话时通知实现了 HttpSessionActivationListener 的所有会话属性。它们必须在序列化会话之前通知钝化监听器，在反序列化之后通知激活监听器。

写分布式应用的开发人员应该意识到容器可能运行在多个 Java 虚拟机中，开发人员不能依赖静态变量存储应用状态。他们应该用企业 Bean 或数据库存储这种状态。

# 代码实战

## 代码

- SessionTrack.java

```java
import java.io.IOException;
import java.io.PrintWriter;

import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.servlet.http.HttpSession;

@WebServlet("/session/track")
public class SessionTrack extends HttpServlet {

    private static final long serialVersionUID = -604801085378034646L;

    @Override
    protected void doGet(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {
        // 编码的设置一定要放在 resp.getXXX(), resp.setXXX() 之前
        resp.setContentType("text/plain;charset=UTF-8");
        resp.setCharacterEncoding("UTF-8");

        // 如果不存在 session 会话，则创建一个 session 对象
        HttpSession httpSession = req.getSession(true);
        // 获取 session 创建时间
        long createdTime = httpSession.getCreationTime();
        // 获取该网页的最后一次访问时间
        long lastAccessedTime = httpSession.getLastAccessedTime();

        // 检查网页上是否有新的访问者
        if (httpSession.isNew()){
            httpSession.setAttribute(SessionKey.VISIT_COUNT, 1);
        } else {
            int visitCount = (Integer)httpSession.getAttribute(SessionKey.VISIT_COUNT);
            visitCount++;
            httpSession.setAttribute(SessionKey.VISIT_COUNT, visitCount);
        }

        PrintWriter printWriter = resp.getWriter();
        printWriter.println("sessionId：" + httpSession.getId());
        printWriter.println("创建时间：" + createdTime);
        printWriter.println("最后访问时间：" + lastAccessedTime);
        printWriter.println("访问总数：" + httpSession.getAttribute(SessionKey.VISIT_COUNT));
    }

    private interface SessionKey {
        /**
         * 访问总计
         */
        String VISIT_COUNT = "visitCount";
    }
}
```

## 访问

浏览器打开 [http://localhost:8081/session/track](http://localhost:8081/session/track)，内容如下：

```
sessionId：B9F7ADD0900C9057485DDDB13DBCAAE6
创建时间：1538641292767
最后访问时间：1538641321823
访问总数：1
```

再次访问，访问总数会依次递增

# 删除会话

当您完成了一个用户的 session 会话数据，您有以下几种选择：

## 移除一个特定的属性

您可以调用 `removeAttribute(String name)` 方法来删除与特定的键相关联的值。

## 删除整个 session 会话：

您可以调用 `invalidate()` 方法来丢弃整个 session 会话。

## 设置 session 会话过期时间

您可以调用 `setMaxInactiveInterval(int interval)` 方法来单独设置 session 会话超时。

## 注销用户

如果使用的是支持 servlet 2.4 的服务器，您可以调用 `logout()` 来注销 Web 服务器的客户端，并把属于所有用户的所有 session 会话设置为无效。

## web.xml 配置

如果您使用的是 Tomcat，除了上述方法，您还可以在 web.xml 文件中配置 session 会话超时，如下所示：

```xml
<session-config>
  <session-timeout>15</session-timeout>
</session-config>
```

上面实例中的超时时间是以分钟为单位，将覆盖 Tomcat 中默认的 30 分钟超时时间。

在一个 Servlet 中的 getMaxInactiveInterval() 方法会返回 session 会话的超时时间，以秒为单位。

所以，如果在 web.xml 中配置 session 会话超时时间为 15 分钟，那么 getMaxInactiveInterval() 会返回 900。

## 代码示例

- SessionInvalid.java

直接访问，会报错说 session 已经无效。

```java
import java.io.IOException;
import java.io.PrintWriter;

import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.servlet.http.HttpSession;

@WebServlet("/session/invalid")
public class SessionInvalid extends HttpServlet {

    private static final long serialVersionUID = 7165264630729082806L;

    @Override
    protected void doGet(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {
        // 编码的设置一定要放在 resp.getXXX(), resp.setXXX() 之前
        resp.setContentType("text/plain;charset=UTF-8");
        resp.setCharacterEncoding("UTF-8");

        // 如果不存在 session 会话，则创建一个 session 对象
        HttpSession httpSession = req.getSession(true);
        httpSession.setAttribute(SessionKey.VISIT_COUNT, 1);
        // 销毁当前会话
        httpSession.invalidate();

        PrintWriter printWriter = resp.getWriter();
        // 再次回去将会报错：java.lang.IllegalStateException: getAttribute: Session already invalidated
        printWriter.println("访问总数：" + httpSession.getAttribute(SessionKey.VISIT_COUNT));
    }

    private interface SessionKey {
        /**
         * 访问总计
         */
        String VISIT_COUNT = "visitCount";
    }
}
```

# 参考资料

http://www.runoob.com/servlet/servlet-session-tracking.html

https://github.com/waylau/servlet-3.1-specification/blob/master/docs/Sessions

* any list
{:toc}