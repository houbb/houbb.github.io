---
layout: post
title: Java Servlet3.1 规范-07-session 会话
date:  2021-09-09 14:49:58 +0800
categories: [Java]
tags: [web, servlet, servlet3, sh]
published: true
---

# 会话

超文本传输协议（HTTP）被设计为一种无状态协议。为构建有效的 Web 应用，使来自一个特定的客户端的请求彼此相关联是必要的。

随时间的推移，演变了许多会话跟踪机制，这些机制直接使用对程序员而言是困难或麻烦的。

该规范定义了一个简单的 HttpSession 接口，允许 servlet 容器使用几种方法来跟踪用户会话，而不会使应用开发人员陷入到这些方法的细节中。

# 会话跟踪机制

### Cookie

通过 HTTP cookie 的会话跟踪是最常用的会话跟踪机制，且所有 servlet 容器都应该支持。

容器向客户端发送一个 cookie，客户端后续到服务器的请求都将返回该cookie，明确地将请求与会话关联。会话跟踪 cookie 的标准名字必须是JSESSIONID。容器也允许通过容器指定的配置自定义会话跟踪cookie的名字。

所有 servlet 容器必须提供能够配置容器是否标记会话跟踪 cookie 为HttpOnly的能力。已建立的配置必须应用到所有上下文中还没有建立特定的配置(见 SessionCookieConfig javadoc 获取更多细节)。

如果 web 应用为其会话跟踪 cookie 配置了一个自定义的名字，则如果会话 id 编码到 URL 中那么相同的自定义名字也将用于 URI 参数的名字（假如 URL 重写已开启）。

### SSL会话

安全套接字层(Secure Sockets Layer)，在 HTTPS 使用的加密技术，有一种内置机制允许多个来自客户端的请求被明确识别为同一会话。Servlet容器可以很容易地使用该数据来定义会话。

### URL 重写

URL 重写是会话跟踪的最低标准。当客户端不接受 cookie 时，服务器可使用 URL 重写作为会话跟踪的基础。URL 重写涉及添加数据、会话 ID、容器解析 URL 路径从而请求与会话相关联。

会话 ID 必须被编码为 URL 字符串中的一个路径参数。参数的名字必须是jsessionid。下面是一个 URL 包含编码的路径信息的例子：

```html
<http://www.myserver.com/catalog/index.html;jsessionid=1234>
```

URL 重写在日志、书签、referer header、缓存的 HTML、URL工具条中暴露会话标识。在支持 cookie 或 SSL 会话的情况下，不应该使用 URL 重写作为会话跟踪机制。

### 会话完整性

当服务的来自客户端的请求不支持使用 cookie 时，Web 容器必须能够支持 HTTP 会话。 为了满足这个要求， Web 容器通常支持 URL 重写机制。

# 创建会话

当会话仅是一个未来的且还没有被建立的会话时被认为是“新”的。

因为 HTTP是一种基于请求-响应的协议，直到客户端“加入”到 HTTP 会话之前它都被认为是新的。

当会话跟踪信息返回到服务器指示会话已经建立时客户端加入到会话。直到客户端加入到会话，否则不能假定下一个来自客户端的请求被识别为同一会话。

如果以下之一是 true，会话被认为是“新”的：

* 客户端还不知道会话

* 客户端选择不加入会话。

这些条件定义了 servlet 容器没有机制能把一个请求与之前的请求相关联的情况。

`servlet`开发人员必须设计他的应用以便处理客户端没有，不能，或不会加入会话的情况。

与每个会话相关联是一个包含唯一标识符的字符串，也被称为会话ID。会话 ID 的值能通过调用`javax.servlet.http.HttpSession.getId()` 获取，且能在创建后通过调用`javax.servlet.http.HttpServletRequest.changeSessionId()` 改变。

# 会话范围

HttpSession 对象必须被限定在应用（或 servlet 上下文）级别。底层的机制，如使用 cookie 建立会话，不同的上下文可以是相同，但所引用的对象，包括该对象中的属性，决不能在容器上下文之间共享。

用一个例子来说明该要求： 如果 servlet 使用 RequestDispatcher 来调用另一个 Web 应用的 servlet，任何创建的会话和被调用 servlet 所见的必须不同于来自调用会话所见的。

此外，一个上下文的会话在请求进入那个上下文时必须是可恢复的，不管是直接访问它们关联的上下文还是在请求目标分派时创建的会话。

# 绑定属性到会话

servlet 可以按名称绑定对象属性到 HttpSession 实现，任何绑定到会话的对象可用于任意其他的 servlet，其属于同一个 ServletContext 且处理属于相同会话中的请求。

一些对象可能需要在它们被放进会话或从会话中移除时得到通知。这些信息可以从 HttpSessionBindingListener 接口实现的对象中获取。

这个接口定义了以下方法，用于标识一个对象被绑定到会话或从会话解除绑定时。

* valueBound

* valueUnbound

在对象对 HttpSession 接口的 getAttribute 方法可用之前 valueBound 方法必须被调用。

在对象对 HttpSession 接口的 getAttribute 方法不可用之后 valueUnbound 方法必须被调用。

# 会话超时

在 HTTP 协议中，当客户端不再处于活动状态时没有显示的终止信号。这意味着当客户端不再处于活跃状态时可以使用的唯一机制是超时时间。

Servlet 容器定义了默认的会话超时时间，且可以通过 HttpSession 接口的 getMaxInactiveInterval 方法获取。开发人员可以使用HttpSession 接口的 setMaxInactiveInterval 方法改变超时时间。

这些方法的超时时间以秒为单位。

根据定义，如果超时时间设置为 0 或更小的值，会话将永不过期。会话不会失效，直到所有 servlet 使用的会话已经退出其 service 方法。一旦会话已失效,新的请求必须不能看到该会话。

# 最后访问时间

HttpSession 接口的 getLastAccessedTime 方法允许 servlet 确定在当前请求之前的会话的最后访问时间。

当会话中的请求是 servlet 容器第一个处理时该会话被认为是访问了。

# 重要会话语义

### 多线程问题

在同一时间多个 servlet 执行请求的线程可能都有到同一会话的活跃访问。

容器必须确保，以一种线程安全的方式维护表示会话属性的内部数据结构。

开发人员负责线程安全的访问属性对象本身。

这样将防止并发访问HttpSession对象内的属性集合，消除了应用程序导致破坏集合的机会。

### 分布式环境

在一个标识为分布式的应用程序中，会话中的所有请求在同一时间必须仅被一个 JVM 处理。

容器必须能够使用适当的 setAttribute 或 putValue 方法把所有对象放入到 HttpSession 类实例。

以下限制被强加来满足这些条件：

* 容器必须接受实现了 Serializable 接口的对象。

* 容器可以选择支持其他指定对象存储在 HttpSession 中，如Enterprise JavaBeans 组件和事务的引用。

* 由特定容器的设施处理会话迁移。

当分布式 servlet 容器不支持必需的会话迁移存储对象机制时容器必须抛出 IllegalArgumentException。

分布式 servlet 容器必须支持迁移的对象实现 Serializable 的必要机制。

这些限制意味着开发人员确保除在非分布式容器中遇到的问题没有额外的并发问题。

容器供应商可以确保可扩展性和服务质量的功能，如负载平衡和故障转移通过把会话对象和它的内容从分布式系统的任意一个活跃节点移动到系统的一个不同的节点上。

如果分布式容器持久化或迁移会话提供服务质量特性，它们不限制使用原生的 JVM 序列化机制用于序列化 HttpSession 和它们的属性。

如果开发人员实现 session 属性上的 readObject 和 writeObject 方法，他们也不能保证容器将调用这些方法，但保证 Serializable 结束它们的属性将被保存。

容器必须在迁移会话时通知实现了 HttpSessionActivationListener 的所有会话属性。它们必须在序列化会话之前通知钝化监听器，在反序列化之后通知激活监听器。

写分布式应用的开发人员应该意识到容器可能运行在多个 Java 虚拟机中，开发人员不能依赖静态变量存储应用状态。他们应该用企业 Bean 或数据库存储这种状态。

### 客户端语义

由于 cookie 或 SSL 证书通常由 Web 浏览器进程控制，且不与浏览器的任意特定窗口关联，从客户端应用程序发起的到 servlet 容器的请求可能在同一会话。

为了最大的可移植性，开发人员应该假定客户端所有窗口参与同一会话。


# 参考地址

https://download.oracle.com/otn-pub/jcp/servlet-3_1-fr-eval-spec/servlet-3_1-final.pdf

* any list
{:toc}