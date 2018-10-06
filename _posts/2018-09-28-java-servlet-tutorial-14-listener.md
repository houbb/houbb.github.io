---
layout: post
title: Java Servlet 教程-14-监听器 listener
date:  2018-10-06 09:46:10 +0800
categories: [Java]
tags: [web, servlet, java, sh]
published: true
excerpt: Java Servlet 教程-14-监听器 listener
---

# 介绍

应用的事件机制给 Web 应用开发人员更好地控制 ServletContext、HttpSession 和 ServletRequest 的生命周期，
可以更好地代码分解，并在管理 Web 应用使用的资源上提高了效率。

# 事件监听器

应用事件监听器是实现一个或多个 Servlet 事件监听器接口的类。它们是在部署 Web 应用时，实例化并注册到 Web 容器中。它们由开发人员在WAR 包中提供。

Servlet 事件监听器支持在 ServletContext、HttpSession 和ServletRequest 状态改变时进行事件通知。

Servlet 上下文监听器是用来管理应用的资源或 JVM 级别持有的状态。

HTTP 会话监听器是用来管理从相同客户端或用户进入 web 应用的一系列请求关联的状态或资源。

Servlet 请求监听器是用来管理整个 Servlet 请求生命周期的状态。异步监听器是用来管理异步事件，例如超时和完成异步处理。

可以有多个监听器类监听每一个事件类型，且开发人员可以为每一个事件类型指定容器调用监听器 bean 的顺序。

## 事件类型和监听器接口

事件类型和监听器接口用于监控下表所示的：

- Servlet Context Events

| 事件类型	| 描述 | 监听器接口 |
|:---|:---|:---|
| 生命周期	| Servlet上下文刚刚创建并可用于服务它的第一个请求，或者Servlet上下文即将关闭 |	javax.servlet.ServletContextListener |
| 属性更改	| 在 Servlet 上下文的属性已添加、删除、或替换。	| javax.servlet.ServletContextAttributeListener |

- HTTP Session Events

| 事件类型	| 描述	| 监听器接口 | 
|:---|:---|:---|
| 生命周期 |会话已创建、销毁或超时。 | javax.servlet.http.HttpSessionListener |
| 属性更改 |已经在HttpSession上添加、移除、或替换属性	| javax.servlet.http.HttpSessionAttributeListener | 
| 改变ID  | HttpSession 的 ID 将被改变	| javax.servlet.http.HttpSessionIdListener |
| 会话迁移 |HttpSession 已被激活或钝化	| javax.servlet.http.HttpSessionActivationListener |
| 对象绑定 |对象已经从HttpSession绑定或解除绑定	| javax.servlet.http.HttpSessionBindingListener |

- Servlet Request Events

| 事件类型	| 描述	| 监听器接口| 
|:---|:---|:---|
| 生命周期	| 一个servlet请求已经开始由Web组件处理	| javax.servlet.ServletRequestListener |
| 更改属性	| 已经在ServletRequest上添加、移除、或替换属性。| javax.servlet.ServletRequestAttributeListener | 
| 异步事件	| 超时、连接终止或完成异步处理	| javax.servlet.AsyncListener | 

## 监听器使用的一个例子

为了说明事件使用方案，考虑一个包含一些使用数据库的 Servlet 的简单 Web 应用。开发人员提供了一个 Servlet 上下文监听器类用于管理数据库连接。

当应用启动时，监听器类得到通知。应用登录到数据库，并在 servlet 上下文中存储连接。
应用中的 Servlet 根据需要，在 Web 应用的活动期间访问连接。
当 Web 服务器关闭时，或应用从 Web 服务器移除时，监听器类得到通知且关闭数据库连接。

# 实战代码

为了代码的间接性，本例子做了许多简化。其他监听器也都类似，触类旁通即可。

## 代码

- Dog.java

定义的一个实体类

```java
public class Dog {

    private String name;

    public Dog(String name) {
        this.name = name;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }
}
```

- MyServletContextListener.java

自定义的简单监听器。在 context 初始化的时候，创建一个 dog 对象放进 context 中。

```java
@WebListener
public class MyServletContextListener implements ServletContextListener {

    public static final String LISTENER_CONTEXT_KEY = "LISTENER_CONTEXT_KEY";

    public void contextInitialized(ServletContextEvent sce) {
        ServletContext servletContext = sce.getServletContext();
        // 将 init param 设置到 context
        Dog dog = new Dog("ketty");
        servletContext.setAttribute(LISTENER_CONTEXT_KEY, dog);
    }

    public void contextDestroyed(ServletContextEvent sce) {

    }
}
```

- ListenerServlet.java

监听器 servlet，将 context 中的 dog 对象取出来。

```java
@WebServlet(value = "/listener")
public class ListenerServlet extends HttpServlet {

    private static final long serialVersionUID = -2781869151765443674L;

    @Override
    protected void doGet(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {
        ServletContext servletContext = getServletContext();
        Dog dog = (Dog) servletContext.getAttribute(MyServletContextListener.LISTENER_CONTEXT_KEY);
        resp.getWriter().write("Name: " + dog.getName());
    }

}
```

## 测试

浏览器访问页面 [http://localhost:8081/listener](http://localhost:8081/listener)

页面内容如下：

```
Name: ketty
```

# 线程安全问题

## 情景导入

```java
@WebServlet("/attr/error")
public class AttrErrorServlet extends HttpServlet {

    private static final long serialVersionUID = 5343176256615216338L;

    @Override
    protected void doGet(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {
        final String fooKey = "foo";
        final String barKey = "bar";
        getServletContext().setAttribute(fooKey, "22");
        getServletContext().setAttribute(barKey, "42");

        PrintWriter printWriter = resp.getWriter();
        printWriter.println(fooKey + ":    " + getServletContext().getAttribute(fooKey));
        printWriter.println(barKey + ":    " + getServletContext().getAttribute(barKey));
    }
}
```

正常我们使用 context 设置属性，正常情况下不止有一个 servlet，也就是有多个线程在操作我们的 context。

- 错误场景

```
时间线: ------------------------------------------------------------>
Servlet A:  foo=22;                 bar=42
Servlet B:              foo=11;
```

我们最后看到的可能是 

```
foo=11
bar=42
```

## 如何让 ServletContext 属性线程安全

- 错误的方式

```java
@Override
protected synchronized void doGet(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {}
```

直接方法上使用 `synchronized`，会导致方法的性能大大降低，一次只能处理一个请求。

而且，其他 servlet 还是可以操作 context。

- 正确的方式

对 servletContext 进行加锁即可。

```java
@Override
protected synchronized void doGet(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {
    final String fooKey = "foo";
    final String barKey = "bar";

    synchronized (getServletContext()) {
        getServletContext().setAttribute(fooKey, "22");
        getServletContext().setAttribute(barKey, "42");
        PrintWriter printWriter = resp.getWriter();
        printWriter.println(fooKey + ":    " + getServletContext().getAttribute(fooKey));
        printWriter.println(barKey + ":    " + getServletContext().getAttribute(barKey));
    }
}
```

# HttpSession 线程安全

## 不安全的场景

同一个用户，打开了一个新的浏览器窗口。

所以为了保证线程安全，必须对 HttpSession 进行同步。


## 如何保证

和 ServletContext 类似，在使用的时候。

```java
HttpSession httpSession = req.getSession(true);
synchronized (httpSession) {
    //..
}
```

ps: 这里的同步可能存在问题，我们必须保证每次的 HttpSession 获取的是同一个对象，这样加锁才有意义。


# SingleThreadModel 模式

## 说明

确保servlet每次只处理一个请求。这个接口没有方法。

如果servlet实现了这个接口，就可以保证servlet的服务方法中不会有两个线程并发执行。servlet容器可以通过同步对servlet的单个实例的访问，或者通过维护servlet实例池并将每个新请求分派给一个免费的servlet来保证这一点。

注意，SingleThreadModel不能解决所有的线程安全问题。

例如，即使使用了SingleThreadModel servlet，多个线程上的多个请求仍然可以同时访问会话属性和静态变量。

建议开发人员采取其他方法来解决这些问题，而不是实现这个接口，例如避免使用实例变量或同步访问这些资源的代码块。

Servlet API 2.4版本不支持此接口。

(以上内容节选自 [SingleThreadModel doc](https://tomcat.apache.org/tomcat-5.5-doc/servletapi/javax/servlet/SingleThreadModel.html))

## 使用方式

```java
public class AttrErrorServlet extends HttpServlet implements SingleThreadModel {}
```

`SingleThreadModel` 这个类已经被废弃了。

## 最佳实践

实际不要使用这种方式。

# 参考资料

[servlet 生命周期](https://github.com/waylau/servlet-3.1-specification/tree/master/docs/Application%20Lifecycle%20Events)

《Head First Servlet & JSP》

[Synchronized 作用于局部变量](http://linuxlsx.top/blog/2015/12/10/synchronized-local-variable-string/)

[【转载】最佳实践: 勿在 Servlet 中实现 SingleThreadModel](https://blog.csdn.net/u012485012/article/details/50782841)

* any list
{:toc}