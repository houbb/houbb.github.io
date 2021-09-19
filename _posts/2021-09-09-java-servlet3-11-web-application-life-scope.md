---
layout: post
title: Java Servlet3.1 规范-11-应用生命周期事件
date:  2021-09-09 14:49:58 +0800
categories: [Java]
tags: [web, servlet, servlet3, sh]
published: true
---

# 介绍

应用的事件机制给 Web 应用开发人员更好地控制 ServletContext、HttpSession 和 ServletRequest 的生命周期，可以更好地代码分解，并在管理 Web 应用使用的资源上提高了效率。

# 事件监听器

应用事件监听器是实现一个或多个 Servlet 事件监听器接口的类。它们是在部署 Web 应用时，实例化并注册到 Web 容器中。它们由开发人员在WAR 包中提供。

Servlet 事件监听器支持在 ServletContext、HttpSession 和ServletRequest 状态改变时进行事件通知。Servlet 上下文监听器是用来管理应用的资源或 JVM 级别持有的状态。HTTP 会话监听器是用来管理从相同客户端或用户进入 web 应用的一系列请求关联的状态或资源。Servlet 请求监听器是用来管理整个 Servlet 请求生命周期的状态。异步监听器是用来管理异步事件，例如超时和完成异步处理。

可以有多个监听器类监听每一个事件类型，且开发人员可以为每一个事件类型指定容器调用监听器 bean 的顺序。

### 事件类型和监听器接口

事件类型和监听器接口用于监控下表所示的：

TABLE 11-1 Servlet Context Events

事件类型  | 描述 | 监听器接口
---- | ---- | ----
生命周期 | Servlet上下文刚刚创建并可用于服务它的第一个请求，或者Servlet上下文即将关闭|javax.servlet.ServletContextListener
属性更改 | 在 Servlet 上下文的属性已添加、删除、或替换。| javax.servlet.ServletContextAttributeListener

TABLE 11-2 HTTP Session Events

事件类型  | 描述 | 监听器接口
---- | ---- | ----
生命周期 | 会话已创建、销毁或超时。| javax.servlet.http.HttpSessionListener
属性更改 | 已经在HttpSession上添加、移除、或替换属性 |javax.servlet.http.HttpSessionAttributeListener
改变ID | HttpSession 的 ID 将被改变 | javax.servlet.http.HttpSessionIdListener
会话迁移 | HttpSession 已被激活或钝化 | javax.servlet.http.HttpSessionActivationListener
对象绑定 | 对象已经从HttpSession绑定或解除绑定 | javax.servlet.http.HttpSessionBindingListener


TABLE 11-3 Servlet Request Events

事件类型  | 描述 | 监听器接口
---- | ---- | ----
生命周期 | 一个servlet请求已经开始由Web组件处理 | javax.servlet.ServletRequestListener
更改属性 | 已经在ServletRequest上添加、移除、或替换属性。|javax.servlet.ServletRequestAttributeListener
异步事件 | 超时、连接终止或完成异步处理 |javax.servlet.AsyncListener

### 监听器使用的一个例子

为了说明事件使用方案，考虑一个包含一些使用数据库的 Servlet 的简单 Web 应用。开发人员提供了一个 Servlet 上下文监听器类用于管理数据库连接。

1. 当应用启动时，监听器类得到通知。应用登录到数据库，并在 servlet 上下文中存储连接。
2. 应用中的 Servlet 根据需要，在 Web 应用的活动期间访问连接。
3. 当 Web 服务器关闭时，或应用从 Web 服务器移除时，监听器类得到通知且关闭数据库连接。

# 监听器类的配置

### 提供监听器类

Web 应用的开发人员提供实现了一个或多个在 javax.servlet API中的监听器接口的监听器类。每一个监听器类必须有一个无参构造器。

监听器类打包到 WAR 包中，或者在 WEB-INF/classes 归档项下，或者在 WEB-INF/lib 目录的一个 JAR 内部。

### 部署声明

监听器类在 Web 应用部署描述符中使用 listener 元素声明。它们根据类名列出的顺序就是它们被调用的顺序。

与其他监听器不同，AsyncListener 类型的监听器可能仅通过编程式注册（使用一个ServletRequest）。

### 监听器注册

Web 容器创建每一个监听器类的一个实例，并在应用处理第一个请求之前为事件通知注册它。Web容器根据他们实现的接口注册监听器实例，且按照它们出现在部署描述符中的顺序。

在 Web 应用执行期间，监听器按照它们注册的顺序被调用，但也有例外，例如，HttpSessionListener.destroy 按照相反的顺序调用。参考 8.2.3节 “装配 web.xml、web-fragment.xml 描述符和注解”。

### 关闭时通知

在应用关闭时，监听器以它们声明时相反的顺序得到通知，且通知会话监听器在通知上下文监听器之前。通知会话监听器 session  失效必须在通知上下文监听器关闭之前。 

# 部署描述符示例

以下示例是注册两个 Servlet 上下文生命周期监听器和一个HttpSession 监听器的部署语法。

假设 com.acme.MyConnectionManager 和 com.acme.MyLoggingModule两个都实现了 javax.servlet.ServletContextListener，且com.acme.MyLoggingModule 又实现了javax.servlet.http.HttpSessionListener。

此外，开发人员希望com.acme.MyConnectionManager 在 com.acme.MyLoggingModule 得到Servlet 上下文生命周期事件的通知。

下面是这个应用的部署描述符：

```xml
    <web-app>
        <display-name>MyListeningApplication</display-name>
        <listener>
            <listener-class>com.acme.MyConnectionManager</listenerclass>
        </listener>
        <listener>
            <listener-class>com.acme.MyLoggingModule</listener-class>
        </listener>
        <servlet>
            <display-name>RegistrationServlet</display-name>
        ...etc
        </servlet>
    </web-app>
```

# 监听器实例和线程

容器需要在开始执行进入应用的第一个请求之前完成 Web 应用中的监听器类的实例化。容器必须保持到每一个监听器的引用直到为 Web 应用最后一个请求提供服务。

ServletContext 和 HttpSession 对象的属性改变可能会同时发生。不要求容器同步到属性监听器类产生的通知。维护状态的监听器类负责数据的完整性且应明确处理这种情况。

# 监听器异常

一个监听器里面的应用代码在运行期间可能会抛出异常。一些监听器通知发生在应用中的另一个组件调用树过程中。

这方面的一个例子是一个Servlet 设置了会话属性，该会话监听器抛出未处理异常。容器必须允许未处理的异常由描述在10.9节“错误处理”的错误页面机制处理。

如果没有为这些异常指定错误页面，容器必须确保返回一个状态码为500的响应。这种情况下，不再有监听器根据事件被调用。

有些异常不会发生在应用中的另一个组件调用栈过程中。这方面的一个例子 SessionListener 接收通知的会话已经超时并抛出未处理的异常，或者 ServletContextListener 在 Servlet 上下文初始化通知期间抛出未处理异常，或者 ServletRequestListener 在初始化或销毁请求对象的通知期间抛出未处理异常。

这种情况下，开发人员没有机会处理这种异常。容器可以以 HTTP 状态码 500 来响应所有后续的到 Web 应用的请求，表示应用出错了。

开发人员希望发生在监听器产生一个异常且在通知方法里面必须处理它们自己的异常之后的正常处理。

# 分布式容器

在分布式 Web 容器中，HttpSession 实例被限到特定的 JVM 服务会话请求，且 ServletContext 对象被限定到 Web 容器所在的 JVM。分布式容器不需要传播 Servlet 上下文事件或 HttpSession 事件到其他 JVM。

监听器类实例被限定到每个 JVM 的每个部署描述符声明一个。

# 会话事件

监听器类提供给开发人员一种跟踪 Web 应用内会话的方式。它通常是有用的，在跟踪会话知道一个会话是否变为失效，因为容器超时会话，或因为应用内的一个 Web 组件调用了 invalidate 方法。

该区别可能会间接地决定使用监听器和 HttpSession API方法。

# 参考地址

https://download.oracle.com/otn-pub/jcp/servlet-3_1-fr-eval-spec/servlet-3_1-final.pdf

* any list
{:toc}