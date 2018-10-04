---
layout: post
title: Java Servlet 教程-10-过滤器 Filter
date:  2018-10-04 19:30:35 +0800
categories: [Java]
tags: [web, servlet, java, sh]
published: true
excerpt: Java Servlet 教程-10-过滤器 Filter
---

# 过滤器

## 概念

Filter（过滤器）是 Java 组件，允许运行过程中改变进入资源的请求和资源返回的响应中的有效负载和头信息。

Java Servlet API 类和方法提供了一种轻量级的框架用于过滤动态和静态内容。

还描述了如何在 Web 应用配置 filter，以及它们实现的约定和语义。

## 什么是过滤器

过滤器是一种代码重用的技术，它可以转换 HTTP 请求的内容，响应，及头信息。

过滤器通常不产生响应或像 servlet 那样对请求作出响应，而是修改或调整到资源的请求，修改或调整来自资源的响应。

过滤器可以作用于动态或静态内容。

这章说的动态和静态内容指的是 Web 资源。

供开发人员使用的过滤器功能有如下几种类型：

- 在执行请求之前访问资源。

- 在执行请求之前处理资源的请求。

- 用请求对象的自定义版本包装请求对请求的header和数据进行修改。

- 用响应对象的自定义版本包装响应对响应的header和数据进行修改。

- 拦截资源调用之后的调用。

- 作用在一个Servlet，一组Servlet，或静态内容上的零个，一个或多个拦截器按指定的顺序执行

## 常见过滤器组件

Authentication filters //用户身份验证过滤器

Logging and auditing filters //日志记录与审计过滤器

Image conversion filters //图片转换过滤器

Data compression filters //数据压缩过滤器

Encryption filters //加密过滤器

Tokenizing filters //分词过滤

Filters that trigger resource access events //触发资源访问事件过滤

XSL/T filters that transform XML content

MIME-type chain filters //MIME-TYPE 链过滤器

Caching filters //缓存过滤器

# 实战例子

## 问题需求

想对所有的 servlet 进行拦截。

比如打印响应的日志信息，编码的过滤处理。

## 代码

- FilterCharsetServlet.java

输出一句中文在页面

```java
@WebServlet("/filter/charset")
public class FilterCharsetServlet extends HttpServlet {

    private static final long serialVersionUID = -670379553788197281L;

    @Override
    protected void doGet(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {
        resp.getWriter().println("中文描述");
    }

}
```

- 日志过滤器

```java
public class LogFilter implements Filter {

    public void init(FilterConfig filterConfig) throws ServletException {
        System.out.println("LogFilter start");
    }

    public void doFilter(ServletRequest request, ServletResponse response, FilterChain chain) throws IOException, ServletException {
        System.out.println("打印一些日志信息...");
        chain.doFilter(request, response);
    }

    public void destroy() {
    }
}
```

ps: `chain.doFilter(request, response);` 这句话其实应该交给框架本身去调用，而不是开发者去手动调用。

开发者应该更加专注于过滤器的编写。

## 配置

- web.xml

```xml
<filter>
    <filter-name>LogFilter</filter-name>
    <filter-class>com.github.houbb.servlet.learn.base.filter.LogFilter</filter-class>
</filter>
<filter-mapping>
    <filter-name>LogFilter</filter-name>
    <url-pattern>/filter/*</url-pattern>
</filter-mapping>
```

## 运行访问

浏览器直接访问 [http://localhost:8081/filter/charset](http://localhost:8081/filter/charset)

- 页面显示

```
????
```

- 命令行日志

```
LogFilter start
打印一些日志信息...
```

可见我们的日志拦截器是执行了，但是编码的问题还没有解决。

在每一个 servlet 中都处理编码问题太笨了，还是交给过滤器处理吧。

# 多个过滤器

## 编码过滤器

- CharsetFilter.java

这一次我们演示基于注解 `@WebFilter` 的实现方式。

```java
@WebFilter(filterName = "CharsetFilter",
           urlPatterns = {"/filter/*"},
           initParams = {@WebInitParam(name = TEST_INIT_PARAM, value = "CharsetFilterParam")})
public class CharsetFilter implements Filter {

    static final String TEST_INIT_PARAM = "test";

    /**
     * web 应用程序启动时，web 服务器将创建Filter 的实例对象，并调用其init方法，读取web.xml配置，完成对象的初始化功能，
     * 从而为后续的用户请求作好拦截的准备工作（filter对象只会创建一次，init方法也只会执行一次）。
     * 开发人员通过init方法的参数，可获得代表当前filter配置信息的FilterConfig对象。
     */
    public void init(FilterConfig filterConfig) throws ServletException {
        System.out.println("初始化参数：" + filterConfig.getInitParameter(TEST_INIT_PARAM));
    }

    /**
     * 该方法完成实际的过滤操作，当客户端请求方法与过滤器设置匹配的URL时，Servlet容器将先调用过滤器的doFilter方法。
     * FilterChain用户访问后续过滤器。
     */
    public void doFilter(ServletRequest request, ServletResponse response, FilterChain chain) throws IOException, ServletException {
        // 编码的设置一定要放在 resp.getXXX(), resp.setXXX() 之前
        response.setContentType("text/plain;charset=UTF-8");
        response.setCharacterEncoding("UTF-8");

        // 把请求传回过滤链
        chain.doFilter(request, response);
    }

    /**
     * Servlet容器在销毁过滤器实例前调用该方法，在该方法中释放Servlet过滤器占用的资源。
     */
    public void destroy() {
    }
}
```

## 访问

浏览器直接访问 [http://localhost:8081/filter/charset](http://localhost:8081/filter/charset)

- 页面显示

```
????
```

- 命令行日志

```
LogFilter start
打印一些日志信息...
```

# Filter 主要概念

- 页面显示

```
中文描述
```

- 命令行日志

```
初始化参数：CharsetFilterParam
LogFilter start
打印一些日志信息...
```

# 过滤器核心概念

应用开发人员通过实现 javax.servlet.Filter 接口并提供一个公共的空参构造器来创建过滤器。

该类及构建Web应用的静态资源和 servlet 打包在 Web 应用归档文件中。

Filter 在部署描述符中通过 `<filter>` 元素声明。

一个过滤器或一组过滤器可以通过在部署描述符中定义 `<filter-mapping>` 来为调用配置。

可以使用 servlet 的逻辑视图名把过滤器映射到一个特定的 servlet，或者使用 URL 模式把一组 servlet 和静态内容资源映射到过滤器。

## 过滤器生命周期

在 Web 应用部署之后，在请求导致容器访问 Web 资源之前，容器必须找到过滤器列表并按照如上所述的应用到 Web 资源。

容器必须确保它为过滤器列表中的每一个都实例化了一个适当类的过滤器, 并调用其 init(FilterConfig config) 方法。

过滤器可能会抛出一个异常,以表明它不能正常运转。如果异常的类型是 UnavailableException，容器可以检查异常的 isPermanent 属性并可以选择稍候重试过滤器。

在部署描述符中声明的每个 `<filter>` 在每个 JVM 的容器中仅实例化一个实例。

容器提供了声明在过滤器的部署描述符的过滤器config（译者注：FilterConfig），对 Web 应用的 ServletContext 的引用，和一组初始化参数。

当容器接收到传入的请求时，它将获取列表中的第一个过滤器并调用doFilter 方法，传入 ServletRequest 和 ServletResponse，和一个它将使用的 FilterChain 对象的引用。 

- 实现形式

过滤器的 doFilter 方法通常会被实现为如下或如下形式的子集：

1. 该方法检查请求的头。

2. 该方法可以用自定义的 ServletRequest 或 HttpServletRequest 实现包装请求对象为了修改请求的头或数据。

3. 该方法可以用自定义的 ServletResponse 或 HttpServletResponse实现包装传入 doFilter 方法的响应对象用于修改响应的头或数据。

4. 该过滤器可以调用过滤器链中的下一个实体。下一个实体可能是另一个过滤器，或者如果当前调用的过滤器是该过滤器链配置在部署描述符中的最后一个过滤器，下一个实体是目标Web资源。调用FilterChain对象的doFilter方法将影响下一个实体的调用，且传入的它被调用时请求和响应，或传入它可能已经创建的包装版本。 由容器提供的过滤器链的doFilter方法的实现，必须找出过滤器链中的下一个实体并调用它的doFilter方法，传入适当的请求和响应对象。另外，过滤器链可以通过不调用下一个实体来阻止请求，离开过滤器负责填充响应对象。 service 方法必须和应用到 servlet 的所有过滤器运行在同一个线程中。

5. 过滤器链中的下一个过滤器调用之后，过滤器可能检查响应的头。

6. 另外，过滤器可能抛出一个异常以表示处理过程中出错了。如果过滤器在 doFilter 处理过程中抛出 UnavailableException，容器必须停止处理剩下的过滤器链。 如果异常没有标识为永久的，它或许选择稍候重试整个链。

7. 当链中的最后的过滤器被调用，下一个实体访问的是链最后的目标 servlet 或资源。

8. 在容器能把服务中的过滤器实例移除之前，容器必须先调用过滤器的 destroy 方法以便过滤器释放资源并执行其他的清理工作。

## 包装请求和响应

过滤器的核心概念是包装请求或响应，以便它可以覆盖行为执行过滤任务。

在这个模型中，开发人员不仅可以覆盖请求和响应对象上已有的方法，也能提供新的 API 以适用于对过滤器链中剩下的过滤器或目标 web 资源做特殊的过滤任务。

例如，开发人员可能希望用更高级别的输出对象如 output stream 或 writer 来扩展响应对象，如允许 DOM 对象写回客户端的API。

为了支持这种风格的过滤器，容器必须支持如下要求。当过滤器调用容器的过滤器链实现的 doFilter 方法时，容器必须确保请求和响应对象传到过滤器链中的下一个实体，或如果过滤器是链中最后一个，将传入目标 web 资源，且与调用过滤器传入 doFilter 方法的对象是一样的。

当调用者包装请求或响应对象时，对包装对象的要求同样适用于从 servlet 或过滤器到 `RequestDispatcher.forward` 或 `RequestDispatcher.include` 的调用。

在这种情况下，调用 servlet 看到的请求和响应对象与调用 servlet 或过滤器传入的包装对象必须是一样的。

## 过滤器环境

可以使用部署描述符中的 `<init-params>` 元素把一组初始化参数关联到过滤器。

这些参数的名字和值在过滤器运行期间可以使用过滤器的FilterConfig 对象的 getInitParameter 和 getInitParameterNames 方法得到。

另外，FilterConfig 提供访问 Web 应用的 ServletContext用于加载资源，记录日志，在 ServletContext 的属性列表存储状态。

链中最后的过滤器和目标 servlet 或资源必须执行在同一个调用线程。


# 在 Web 应用中配置过滤器

过滤器可以通过 `@WebFilter` 注解定义或者在部署描述符中使用 `<filter>` 元素定义。

## filter

在这个元素中，程序员可以声明如下内容：

- filter-name: 用于映射过滤器到 servlet 或 URL

- filter-class: 由容器用于表示过滤器类型

- init-params: 过滤器的初始化参数

程序员可以选择性的指定 icon 图标，文字说明，和工具操作显示的名字。

容器必须为部署描述符中定义的每个过滤器声明实例化一个 Java 类实例。

因此，如果开发人员对同一个过滤器类声明了两次，则容器将实例化两个相同的过滤器类的实例。

下面是一个过滤器声明的例子：

```xml
<filter>
    <filter-name>Image Filter</filter-name>
    <filter-class>com.acme.ImageServlet</filter-class>
</filter>
```

## filter-mapping

filter-mapping 元素用于设置一个 Filter 所负责拦截的资源。

一个Filter拦截的资源可通过两种方式来指定：Servlet 名称和资源访问的请求路径

filter-name 子元素用于设置 filter 的注册名称。该值必须是在 `<filter>` 元素中声明过的过滤器的名字

url-pattern 设置 filter 所拦截的请求路径(过滤器关联的URL样式)

## servlet-name

指定过滤器所拦截的 Servlet 名称

# 过滤器和 RequestDispatcher

## dispatcher

`<dispatcher>` 指定过滤器所拦截的资源被 Servlet 容器调用的方式，可以是REQUEST,INCLUDE,FORWARD和ERROR之一，默认REQUEST。

用户可以设置多个 `<dispatcher>` 子元素用来指定 Filter 对资源的多种调用方式进行拦截。

### 子元素可以设置的值及其意义

- REQUEST：当用户直接访问页面时，Web容器将会调用过滤器。如果目标资源是通过RequestDispatcher的include()或forward()方法访问时，那么该过滤器就不会被调用。

- INCLUDE：如果目标资源是通过RequestDispatcher的include()方法访问时，那么该过滤器将被调用。除此之外，该过滤器不会被调用。

- FORWARD：如果目标资源是通过RequestDispatcher的forward()方法访问时，那么该过滤器将被调用，除此之外，该过滤器不会被调用。

- ERROR：如果目标资源是通过声明式异常处理机制调用时，那么该过滤器将被调用。除此之外，过滤器不会被调用。

# 思考

## Filter 执行顺序

- web.xml 

按照写的顺序执行。如果想调整，直接调整顺序即可。

- 基于注解

没有看到可以指定 order 顺序。猜测是代码直接扫描注解。

- 混合

同上。

## 责任链模式

这里是责任链模式一种非常经典的引用。

ps: mybatis 拦截器也是类似的道理。

我们在写自己的框架时候，也可以参考这种方式。

# 参考资料

https://github.com/waylau/servlet-3.1-specification/tree/master/docs/Filtering

http://www.runoob.com/servlet/servlet-writing-filters.html

《Head First Servlet & JSP》

* any list
{:toc}