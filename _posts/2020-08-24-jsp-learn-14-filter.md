---
layout: post
title:  jsp 学习笔记-14-response 响应
date:  2020-08-09 10:37:20 +0800
categories: [web]
tags: [web, http, jsp, sf]
published: true
---

# JSP 过滤器

JSP 和 Servlet 中的过滤器都是 Java 类。

过滤器可以动态地拦截请求和响应，以变换或使用包含在请求或响应中的信息。

可以将一个或多个过滤器附加到一个 Servlet 或一组 Servlet。

过滤器也可以附加到 JavaServer Pages (JSP) 文件和 HTML 页面。

## 作用

过滤器是可用于 Servlet 编程的 Java 类，可以实现以下目的：

1. 在客户端的请求访问后端资源之前，拦截这些请求。

2. 在服务器的响应发送回客户端之前，处理这些响应。

## 常见过滤器

根据规范建议的各种类型的过滤器：

```
身份验证过滤器（Authentication Filters）。
数据压缩过滤器（Data compression Filters）。
加密过滤器（Encryption Filters）。
触发资源访问事件过滤器。
图像转换过滤器（Image Conversion Filters）。
日志记录和审核过滤器（Logging and Auditing Filters）。
MIME-TYPE 链过滤器（MIME-TYPE Chain Filters）。
标记化过滤器（Tokenizing Filters）。
XSL/T 过滤器（XSL/T Filters），转换 XML 内容。
```

过滤器通过 Web 部署描述符（web.xml）中的 XML 标签来声明，然后映射到您的应用程序的部署描述符中的 Servlet 名称或 URL 模式。

当 Web 容器启动 Web 应用程序时，它会为您在部署描述符中声明的每一个过滤器创建一个实例。

Filter 的执行顺序与在 web.xml 配置文件中的配置顺序一致，一般把 Filter 配置在所有的 Servlet 之前。

![输入图片说明](https://images.gitee.com/uploads/images/2020/0830/161945_1591388e_508704.png)

# Servlet 过滤器方法

过滤器是一个实现了 javax.servlet.Filter 接口的 Java 类。

javax.servlet.Filter 接口定义了三个方法：

- public void doFilter (ServletRequest, ServletResponse, FilterChain)

该方法完成实际的过滤操作，当客户端的请求与过滤器设置的 URL 匹配时，Servlet 容器将先调用过滤器的 doFilter 方法。FilterChain 用于访问后续过滤器。

- public void init(FilterConfig filterConfig)

web 应用程序启动时，web 服务器将创建Filter 的实例对象，并调用其init方法，读取web.xml配置，完成对象的初始化功能，从而为后续的用户请求作好拦截的准备工作（filter对象只会创建一次，init方法也只会执行一次）。

开发人员通过init方法的参数，可获得代表当前filter配置信息的FilterConfig对象。

- public void destroy()

Servlet容器在销毁过滤器实例前调用该方法，在该方法中释放Servlet过滤器占用的资源。

# FilterConfig 使用

Filter 的 init 方法中提供了一个 FilterConfig 对象。

如 web.xml 文件配置如下：

```xml
<filter>
<filter-name>LogFilter</filter-name>
<filter-class>com.github.houbb.filter.LogFilter</filter-class>
<init-param>
    <param-name>Site</param-name>
    <param-value>老马啸西风</param-value>
</init-param>
</filter>
```

在 init 方法使用 FilterConfig 对象获取参数：

```java
public void  init(FilterConfig config) throws ServletException {
    // 获取初始化参数
    String site = config.getInitParameter("Site"); 
    // 输出初始化参数
    System.out.println("网站名称: " + site); 
}
```

# JSP 过滤器实例

以下是 Servlet 过滤器的实例，将输出网站名称和地址。

本实例让您对 Servlet 过滤器有基本的了解，您可以使用相同的概念编写更复杂的过滤器应用程序：

## 传统的实现方式

- LogFilter.java

过滤器定义

```java
import javax.servlet.*;
import java.io.IOException;

public class LogFilter implements Filter {
    @Override
    public void init(FilterConfig filterConfig) throws ServletException {

    }

    @Override
    public void doFilter(ServletRequest servletRequest, ServletResponse servletResponse, FilterChain filterChain) throws IOException, ServletException {
        // 输出站点名称
        System.out.println("老马啸西风");

        // 把请求传回过滤链
        filterChain.doFilter(servletRequest, servletResponse);
    }

    @Override
    public void destroy() {

    }
}
```

- web.xml

```xml
<filter>
  <filter-name>logFilter</filter-name>
  <filter-class>com.github.houbb.jsp.learn.hello.filter.LogFilter</filter-class>
</filter>
<filter-mapping>
   <filter-name>logFilter</filter-name>
   <url-pattern>/*</url-pattern>
</filter-mapping>
```

在web.xml中配置,什么情况下需要进行过滤

如果请求匹配到多个过滤器,则执行的顺序按照在xml中的配置的顺序来.所以如果需要考虑filter的执行顺序,按顺序配置

### web.xml 各节点属性说明

- filter 定义

`<filter>` 指定一个过滤器。

`<filter-name>` 用于为过滤器指定一个名字，该元素的内容不能为空。

`<filter-class>` 元素用于指定过滤器的完整的限定类名。

`<init-param>` 元素用于为过滤器指定初始化参数，它的子元素 `<param-name>` 指定参数的名字，`<param-value>`指定参数的值。
在过滤器中，可以使用FilterConfig接口对象来访问初始化参数。

- filter 映射

`<filter-mapping>` 元素用于设置一个 Filter 所负责拦截的资源。一个Filter拦截的资源可通过两种方式来指定：Servlet 名称和资源访问的请求路径

`<filter-name>` 子元素用于设置filter的注册名称。该值必须是在`<filter>`元素中声明过的过滤器的名字

`<url-pattern>` 设置 filter 所拦截的请求路径(过滤器关联的URL样式)

- servlet 信息

`<servlet-name>` 指定过滤器所拦截的Servlet名称。

- dispatcher 

`<dispatcher>` 指定过滤器所拦截的资源被 Servlet 容器调用的方式，可以是REQUEST,INCLUDE,FORWARD和ERROR之一，默认REQUEST。

用户可以设置多个 `<dispatcher>` 子元素用来指定 Filter 对资源的多种调用方式进行拦截。

dispatcher子元素可以设置的值及其意义

REQUEST：当用户直接访问页面时，Web容器将会调用过滤器。如果目标资源是通过RequestDispatcher的include()或forward()方法访问时，那么该过滤器就不会被调用。

INCLUDE：如果目标资源是通过RequestDispatcher的include()方法访问时，那么该过滤器将被调用。除此之外，该过滤器不会被调用。

FORWARD：如果目标资源是通过RequestDispatcher的forward()方法访问时，那么该过滤器将被调用，除此之外，该过滤器不会被调用。

ERROR：如果目标资源是通过声明式异常处理机制调用时，那么该过滤器将被调用。除此之外，过滤器不会被调用。

## springboot 实现方式

在springboot项目中,省去了springmvc的xml配置代码,直接一个类上加上几个注解即可实现自定义的过滤器

```java
import org.springframework.boot.web.servlet.ServletComponentScan;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;

import javax.servlet.*;
import javax.servlet.annotation.WebFilter;
import java.io.IOException;

/**
 * @author binbin.hou
 * @since 1.0.0
 */
@ServletComponentScan
@WebFilter(filterName = "logFilter", urlPatterns = "/*")
@Component
@Order(1)
public class LogFilter implements Filter {

    @Override
    public void init(FilterConfig filterConfig) throws ServletException {

    }

    @Override
    public void doFilter(ServletRequest servletRequest, ServletResponse servletResponse, FilterChain filterChain) throws IOException, ServletException {
        // 输出站点名称
        System.out.println("老马啸西风");

        // 把请求传回过滤链
        filterChain.doFilter(servletRequest, servletResponse);
    }

    @Override
    public void destroy() {

    }
}
```

@Component 这个注解的目的是将LoginFilter交给容器来处理,也就是让loginFilter起作用

@ServletComponentScan 这个是用来扫描@WebFilter的,让@WebFilter起作用

@WebFilter 是用来配置针对于什么链接做过滤,filter的名称是什么

@Order是用来定义过滤器的执行顺序,多个过滤器的情况下,值越小,过滤器越先被执行.

### 实战效果

我们添加这个过滤器以后，依然访问以前的页面。

比如请求：http://localhost:8080/response/auto

后台会输出日志：老马啸西风

# 参考资料

[springboot自定义过滤器与SpringMVC过滤器的区别](https://blog.csdn.net/weixin_42754008/article/details/102857076)

* any list
{:toc}