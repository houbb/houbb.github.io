---
layout: post
title: Java Servlet 教程-06-ServletConfig
date:  2018-09-28 15:54:28 +0800
categories: [Java]
tags: [web, servlet, java, sh]
published: true
excerpt: Java Servlet 教程-06-ServletConfig
---

# ServletConfig

servlet容器用于在初始化期间向servlet传递信息的servlet配置对象。

## 方法列表

| 序号 | 方法 | 说明 |
|:---|:---|:---|
| 1 | getInitParameter(String) | 设置适当的头和内容体将客户端重定向到另一个地址。 |
| 2 | getInitParameterNames() | 获取所有初始化参数的 |
| 3 | getServletContext() | 获取 ServletContext |
| 4 | getServletName() | 获取 servlet 实例的名称 |

## 调用的时机

1. Servlet初始化前（比如构造函数中）不能使用Servlet的初始化参数（通过ServletConfig）。

2. Servlet的初始化参数只会（也只能）读一次，就是在容器初始化Servlet的时候。

## 获取方式

1. 通过重载的 init() 初始化方法参数中直接获取。

2. 直接调用 getServletConfig() 方法（继承自GenericServlet）。

# 初始化参数

## 应用场景

我们需要获取开发者的邮箱地址，但是又不想 hard-code 在代码中，应该怎么办呢？

这里就可让我们的 ServletConfig 出马，让代码变得灵活且便于管理。

## web.xml 

我们可以在 `<init-param>` 中指定初始化参数，然后代码中直接使用即可。

```xml
<servlet>
    <init-param>
        <param-name>email</param-name>
        <param-value>www.google.com</param-value>
    </init-param>
    <servlet-name>config</servlet-name>
    <servlet-class>com.github.houbb.servlet.learn.base.config.ConfigInitParamServlet</servlet-class>
</servlet>
<servlet-mapping>
    <servlet-name>config</servlet-name>
    <url-pattern>/config</url-pattern>
</servlet-mapping>
```

- ConfigInitParamServlet.java

```java
public class ConfigInitParamServlet extends HttpServlet {

    private static final long serialVersionUID = 6283727909711929057L;

    @Override
    protected void doGet(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {
        PrintWriter printWriter = resp.getWriter();

        // 获取配置的参数
        final String email = getServletConfig().getInitParameter("email");
        printWriter.write("Email: " + email);
        printWriter.write("\nServletName: " + getServletName());
        printWriter.write("\nInitParameters: " + getInitParameterNames().toString());
    }

}
```

- 访问

浏览器直接访问 [http://localhost:8081/config](http://localhost:8081/config)，内容如下：

```
Email: www.google.com
ServletName: config
InitParameters: java.util.Collections$3@77765d3c
```

## 基于注解

如果你觉得上面的配置太麻烦，也可以基于注解来实现。

- ConfigInitParamAtServlet.java

```java
@WebServlet(value = "/config/at",
            initParams = {
                    @WebInitParam(name = EMAIL_NAME, value = "www.google.com")
            })
public class ConfigInitParamAtServlet extends HttpServlet {

    private static final long serialVersionUID = 2484741863334695739L;

    static final String EMAIL_NAME = "at-email";

    @Override
    protected void doGet(HttpServletRequest req, HttpServletResponse resp)
            throws ServletException, IOException {
        PrintWriter printWriter = resp.getWriter();

        // 获取配置的参数
        printWriter.write("Email: " + getServletConfig().getInitParameter(EMAIL_NAME));
    }
}
```

- 个人感受

这里的 `@WebInitParam` 和注解 `@WebServlet` 耦合在一起，导致这个初始化参数只能当前 servlet 使用，那如果我想让整个项目都可以使用怎么办？

欢迎看下一章，《Web 与 ServletContext 之间不得不说的小秘密》

# 参考资料

《Head First Servlets and Jsp》

https://tomcat.apache.org/tomcat-5.5-doc/servletapi/javax/servlet/ServletConfig.html

[Servlet简介及ServletConfig、ServletContext](https://www.cnblogs.com/EvanLiu/p/3345609.html)

[ServletConfig获取配置信息、ServletContext的应用](https://www.cnblogs.com/smyhvae/p/4140877.html)

[ServletConfig和ServletContext的区别及应用](http://jokerlinisty.iteye.com/blog/2194190)

* any list
{:toc}