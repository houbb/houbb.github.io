---
layout: post
title: Java Servlet3.1 规范-06-filter 过滤器
date:  2021-09-09 14:49:58 +0800
categories: [Java]
tags: [web, servlet, servlet3, sh]
published: true
---

# 过滤器

Filter（过滤器）是 Java 组件，允许运行过程中改变进入资源的请求和资源返回的响应中的有效负载和头信息。

Java Servlet API 类和方法提供了一种轻量级的框架用于过滤动态和静态内容。还描述了如何在 Web 应用配置 filter，以及它们实现的约定和语义。

网上提供了 servlet 过滤器的 API 文档。

过滤器的配置语法在第14章的“部署描述符”中的部署描述符模式部分给出。当阅读本章时，读者应该是将这些资源作为参考。


# 什么是过滤器

过滤器是一种代码重用的技术，它可以转换 HTTP 请求的内容，响应，及头信息。

过滤器通常不产生响应或像 servlet 那样对请求作出响应，而是修改或调整到资源的请求，修改或调整来自资源的响应。

过滤器可以作用于动态或静态内容。这章说的动态和静态内容指的是 Web 资源。

供开发人员使用的过滤器功能有如下几种类型：

* 在执行请求之前访问资源。

* 在执行请求之前处理资源的请求。

* 用请求对象的自定义版本包装请求对请求的header和数据进行修改。

* 用响应对象的自定义版本包装响应对响应的header和数据进行修改。

* 拦截资源调用之后的调用。

* 作用在一个Servlet，一组Servlet，或静态内容上的零个，一个或多个拦截器按指定的顺序执行

### 过滤器组件示例

* Authentication filters  //用户身份验证过滤器

* Logging and auditing filters   //日志记录与审计过滤器

* Image conversion filters  //图片转换过滤器

* Data compression filters  //数据压缩过滤器

* Encryption filters  //加密过滤器

* Tokenizing filters  //分词过滤

* Filters that trigger resource access events  //触发资源访问事件过滤

* XSL/T filters that transform XML content

* MIME-type chain filters  //MIME-TYPE 链过滤器

* Caching filters //缓存过滤器

# 主要概念

本章描述了过滤器模型的主要概念。

应用开发人员通过实现 javax.servlet.Filter 接口并提供一个公共的空参构造器来创建过滤器。该类及构建Web应用的静态资源和 servlet 打包在 Web 应用归档文件中。

Filter 在部署描述符中通过 `<filter> `元素声明。一个过滤器或一组过滤器可以通过在部署描述符中定义`<filter-mapping>`来为调用配置。

可以使用 servlet 的逻辑视图名把过滤器映射到一个特定的 servlet，或者使用 URL 模式把一组 servlet 和静态内容资源映射到过滤器。

### 过滤器生命周期

在 Web 应用部署之后，在请求导致容器访问 Web 资源之前，容器必须找到过滤器列表并按照如上所述的应用到 Web 资源。

容器必须确保它为过滤器列表中的每一个都实例化了一个适当类的过滤器,并调用其 init(FilterConfig config) 方法。

过滤器可能会抛出一个异常,以表明它不能正常运转。如果异常的类型是 UnavailableException，容器可以检查异常的 isPermanent 属性并可以选择稍候重试过滤器。

在部署描述符中声明的每个`<filter>`在每个 JVM 的容器中仅实例化一个实例。容器提供了声明在过滤器的部署描述符的过滤器config（译者注：FilterConfig），对 Web 应用的 ServletContext 的引用，和一组初始化参数。

当容器接收到传入的请求时，它将获取列表中的第一个过滤器并调用doFilter 方法，传入 ServletRequest 和 ServletResponse，和一个它将使用的 FilterChain 对象的引用。

过滤器的 doFilter 方法通常会被实现为如下或如下形式的子集：

1. 该方法检查请求的头。

2. 该方法可以用自定义的 ServletRequest 或 HttpServletRequest 实现包装请求对象为了修改请求的头或数据。

3. 该方法可以用自定义的 ServletResponse 或 HttpServletResponse实现包装传入 doFilter 方法的响应对象用于修改响应的头或数据。

4. 该过滤器可以调用过滤器链中的下一个实体。下一个实体可能是另一个过滤器，或者如果当前调用的过滤器是该过滤器链配置在部署描述符中的最后一个过滤器，下一个实体是目标Web资源。调用FilterChain对象的doFilter方法将影响下一个实体的调用，且传入它被调用时的请求和响应，或传入它可能已经创建的包装版本。

由容器提供的过滤器链的doFilter方法的实现，必须找出过滤器链中的下一个实体并调用它的doFilter方法，传入适当的请求和响应对象。另外，过滤器链可以通过不调用下一个实体来阻止请求，离开过滤器负责填充响应对象。

service 方法必须和应用到 servlet 的所有过滤器运行在同一个线程中。

5. 过滤器链中的下一个过滤器调用之后，过滤器可能检查响应的头。

6. 另外，过滤器可能抛出一个异常以表示处理过程中出错了。如果过滤器在 doFilter 处理过程中抛出 UnavailableException，容器必须停止处理剩下的过滤器链。 如果异常没有标识为永久的，它或许选择稍候重试整个链。

7. 当链中的最后的过滤器被调用，下一个实体访问的是链最后的目标servlet 或资源。

8. 在容器能把服务中的过滤器实例移除之前，容器必须先调用过滤器的destroy 方法以便过滤器释放资源并执行其他的清理工作。

### 包装请求和响应

过滤器的核心概念是包装请求或响应，以便它可以覆盖行为执行过滤任务。在这个模型中，开发人员不仅可以覆盖请求和响应对象上已有的方法，也能提供新的 API 以适用于对过滤器链中剩下的过滤器或目标 web 资源做特殊的过滤任务。例如，开发人员可能希望用更高级别的输出对象如 output stream 或 writer 来扩展响应对象，如允许 DOM 对象写回客户端的API。

为了支持这种风格的过滤器，容器必须支持如下要求。当过滤器调用容器的过滤器链实现的 doFilter 方法时，容器必须确保请求和响应对象传到过滤器链中的下一个实体，或如果过滤器是链中最后一个，将传入目标 web 资源，且与调用过滤器传入 doFilter 方法的对象是一样的。

当调用者包装请求或响应对象时，对包装对象的要求同样适用于从 servlet 或过滤器到 RequestDispatcher.forward 或 RequestDispatcher.include 的调用。在这种情况下，调用 servlet 看到的请求和响应对象与调用 servlet 或过滤器传入的包装对象必须是一样的。

### 过滤器环境

可以使用部署描述符中的`<init-param>`元素把一组初始化参数关联到过滤器。这些参数的名字和值在过滤器运行期间可以使用过滤器的FilterConfig 对象的 getInitParameter 和 getInitParameterNames 方法得到。另外，FilterConfig 提供访问 Web 应用的 ServletContext用于加载资源，记录日志，在 ServletContext 的属性列表存储状态。链中最后的过滤器和目标 servlet 或资源必须执行在同一个调用线程。

### 在 Web 应用中配置过滤器

过滤器可以通过规范的第8.1.2节“@WebFilter”的 @WebFilter 注解定义或者在部署描述符中使用`<filter>`元素定义。在这个元素中，程序员可以声明如下内容：

* filter-name: 用于映射过滤器到servlet或URL
* filter-class: 由容器用于表示过滤器类型
* init-param: 过滤器的初始化参数

程序员可以选择性的指定 icon 图标，文字说明，和工具操作显示的名字。容器必须为部署描述符中定义的每个过滤器声明实例化一个 Java 类实例。因此，如果开发人员对同一个过滤器类声明了两次，则容器将实例化两个相同的过滤器类的实例。

下面是一个过滤器声明的例子：

```xml
    <filter>
        <filter-name>Image Filter</filter-name>
        <filter-class>com.acme.ImageServlet</filter-class>
    </filter>
```

一旦在部署描述符中声明了过滤器，装配人员使用`<filter-mapping>`定义 Web 应用中的 servlet 和静态资源到过滤器的应用。过滤器可以使用`<servlet-name>`元素关联到一个 Servlet。例如，以下示例代码映射 Image Filter

过滤器到 ImageServlet servlet：

```xml
    <filter-mapping>
        <filter-name>Image Filter</filter-name>
        <servlet-name>ImageServlet</servlet-name>
    </filter-mapping>
```

过滤器可以使用`<url-pattern>`风格的过滤器映射关联到一组 servlet和静态内容：

```xml
    <filter-mapping>
        <filter-name>Logging Filter</filter-name>
        <url-pattern>/*</url-pattern>
    </filter-mapping>
```

在这里， Logging 过滤器应用到 Web 应用中的所有 servlet 和静态资源，因为每一个请求的URI匹配‘/*’ URL 模式。

当使用`<url-pattern>`风格配置`<filter-mapping>`元素，容器必须使用定义在12章“映射请求到Servlet”中的路径映射规则决定`<url-pattern>`是否匹配请求URI。

容器使用的用于构建应用到一个特定请求URI的过滤器链的顺序如下所示：

1. 首先， `<url-pattern>`按照在部署描述符中的出现顺序匹配过滤器映射。
2. 接下来，`<servlet-name>`按照在部署描述符中的出现顺序匹配过滤器映射。

如果过滤器映射同时包含了`<servlet-name>` 和 `<url-pattern>`，容器必须展开过滤器映射为多个过滤器映射（每一个`<servlet-name>` 和 `<url-pattern>`一个），保持`<servlet-name>`和`<url-pattern>`元素顺序。

例如，以下过滤器映射：

```xml
    <filter-mapping>
        <filter-name>Multipe Mappings Filter</filter-name>
        <url-pattern>/foo/*</url-pattern>
        <servlet-name>Servlet1</servlet-name>
        <servlet-name>Servlet2</servlet-name>
        <url-pattern>/bar/*</url-pattern>
    </filter-mapping>
```

等价于

```xml
    <filter-mapping>
        <filter-name>Multipe Mappings Filter</filter-name>
        <url-pattern>/foo/*</url-pattern>
    </filter-mapping>
    <filter-mapping>
        <filter-name>Multipe Mappings Filter</filter-name>
        <servlet-name>Servlet1</servlet-name>
    </filter-mapping>
    <filter-mapping>
        <filter-name>Multipe Mappings Filter</filter-name>
        <servlet-name>Servlet2</servlet-name>
    </filter-mapping>
    <filter-mapping>
        <filter-name>Multipe Mappings Filter</filter-name>
        <url-pattern>/bar/*</url-pattern>
    </filter-mapping>
```

关于过滤器链顺序的要求意味着容器，当接收到传入的请求，按照如下方式处理请求：

* 按“映射规则”识别目标 Web 资源。
* 如果有过滤器使用 servlet name 匹配到具有`<servlet-name>`的 Web 资源，容器以声明在部署描述符中的顺序构建过滤器链。该链中的最后一个过滤器，即最后一个`<servlet-name>` 匹配的过滤器将调用目标Web资源。
* 如果有过滤器使用`<url-pattern>`匹配且该`<url-pattern>`按照第12.2节“映射规则”中的规则匹配请求的 URI，容器容器以声明在部署描述符中的顺序构建`<url-pattern>`匹配到的过滤器链。该链中的最后一个过滤器是在部署描述符中对当前请求 URI 最后一个`<url-pattern>`匹配的过滤器。链中的最后一个过滤器将调用`<servlet-name>`匹配的链中的第一个过滤器，或如果没有，则调用目标 Web 资源。

Web 容器要有高性能表现，必须缓存过滤器链从而不需要根据每个请求重新计算它们。

### 过滤器和 RequestDispatcher

Java Servlet 规范自从 2.4 新版本以来，能够在请求分派器 forward() 和 include() 调用情况下配置可被调用的过滤器。

通过在部署描述符中使用新的`<dispatcher>`元素，开发人员可以为filter-mapping 指定是否想要过滤器应用到请求，当：

1. 请求直接来自客户端。
   可以由一个带有 REQUEST 值的`<dispatcher>`元素，或者没有任何`<dispatcher>`元素来表示。
2. 使用表示匹配`<url-pattern>` 或 `<servlet-name>`的 Web 组件的请求分派器的 forward() 调用情况下处理请求。
   可以由一个带有 FORWARD 值的`<dispatcher>`元素表示。
3. 使用表示匹配`<url-pattern>`或 `<servlet-name>`的 Web 组件的请求分派器的 include() 调用情况下处理请求。
   可以由一个带有 INCLUDE 值的`<dispatcher>`元素表示。
4. 使用“错误处理”指定的错误页面机制处理匹配`<url-pattern>`的错误资源的请求。
   可以由一个带有 ERROR 值的`<dispatcher>`元素表示。
5. 使用指定的“异步处理”中的异步上下文分派机制对 web 组件使用dispatch 调用处理请求。
   可以由一个带有 ASYNC 值的`<dispatcher>`元素表示。
6. 或之上1，2，3，4或5的任何组合。

如：

```xml
    <filter-mapping>
        <filter-name>Logging Filter</filter-name>
        <url-pattern>/products/*</url-pattern>
    </filter-mapping>
```

客户端以`/products/...`开始的请求将导致 Logging Filter 被调用，但不是在以路径`/products/...`开始的请求分派器调用情况下。LoggingFilter 将在初始请求分派和恢复请求时被调用。如下代码：

```xml
    <filter-mapping>
        <filter-name>Logging Filter</filter-name>
        <servlet-name>ProductServlet</servlet-name>
        <dispatcher>INCLUDE</dispatcher>
    </filter-mapping>
```

客户端到 ProductServlet 的请求将不会导致 Logging Filter 被调用，且也不会在请求分派器 forward() 调用到 ProductServlet 情况时，仅在以 ProductServlet 名字开头的请求分派器 include() 调用时被调用。如下代码：

```xml
    <filter-mapping>
        <filter-name>Logging Filter</filter-name>
        <url-pattern>/products/*</url-pattern>
        <dispatcher>FORWARD</dispatcher>
        <dispatcher>REQUEST</dispatcher>
    </filter-mapping>
```

客户端以`/products/...`开始的请求，或在以路径`/products/...`开始的请求分派器 forward() 调用情况时，将导致 Logging Filter 被调用。

最后，如下代码使用特殊的 servlet 名字 “*”：

```xml
    <filter-mapping>
        <filter-name>All Dispatch Filter</filter-name>
        <servlet-name>*</servlet-name>
        <dispatcher>FORWARD</dispatcher>
    </filter-mapping>
```

在按名字或按路径获取的所有请求分派器 forward() 调用时该代码将导致All Dispatch Filter 被调用。

# 参考地址

https://download.oracle.com/otn-pub/jcp/servlet-3_1-fr-eval-spec/servlet-3_1-final.pdf

* any list
{:toc}