---
layout: post
title: Spring Web MVC-03-Filters 过滤器
date:  2019-12-25 16:57:12 +0800
categories: [Spring]
tags: [spring mvc]
published: true
---

# Filters 过滤器

spring-web模块提供了一些有用的过滤器：

Form Data

Forwarded Headers

Shallow ETag

CORS

# 表格数据

浏览器只能通过HTTP GET或HTTP POST提交表单数据，但非浏览器客户端也可以使用HTTP PUT，PATCH和DELETE。 

Servlet API需要 `ServletRequest.getParameter*() ` 方法来仅支持HTTP POST的表单字段访问。

spring-web 模块提供 FormContentFilter 来拦截内容类型为 `application/x-www-form-urlencoded` 的HTTP PUT，PATCH和DELETE请求，从请求主体中读取表单数据，并包装ServletRequest以使表单数据可通过 ServletRequest.getParameter*（）方法族获得。

# Forwarded Headers

当请求通过代理（例如负载平衡器）进行处理时，主机，端口和方案可能会更改，这使得从客户端角度创建指向正确的主机，端口和方案的链接带来了挑战。

[RFC 7239](https://tools.ietf.org/html/rfc7239) 定义了代理可以用来提供有关原始请求的信息的HTTP转发头。 

还有其他非标准标头，包括X-Forwarded-Host，X-Forwarded-Port，X-Forwarded-Proto，X-Forwarded-Ssl和X-Forwarded-Prefix。

ForwardedHeaderFilter是一个Servlet筛选器，用于修改请求，以便

a）基于Forw​​arded头更改主机，端口和方案，

b）删除这些头以消除进一步的影响。

该过滤器依赖于包装请求，因此必须先于其他过滤器（例如RequestContextFilter）进行排序，其他过滤器应与修改后的请求一起使用，而不是与原始请求一起使用。

对于转发的标头，**出于安全方面的考虑，因为应用程序无法知道标头是由代理添加的，还是由恶意客户端添加的**。这

就是为什么应配置位于信任边界的代理以删除来自外部的不受信任的转发标头的原因。您也可以使用removeOnly = true配置ForwardedHeaderFilter，在这种情况下，它会删除但不使用标头。

为了支持异步请求和错误调度，此过滤器应与DispatcherType.ASYNC以及DispatcherType.ERROR映射。

如果使用Spring Framework的AbstractAnnotationConfigDispatcherServletInitializer（请参阅Servlet Config），则会为所有调度类型自动注册所有过滤器。

但是，如果通过web.xml或在Spring Boot中通过FilterRegistrationBean注册过滤器，请确保除了DispatcherType.REQUEST之外，还包括DispatcherType.ASYNC和DispatcherType.ERROR。

# Shallow Etag

ShallowEtagHeaderFilter 过滤器通过缓存写入响应的内容并从中计算MD5哈希值来创建“浅” ETag。

客户端下次发送时，将执行相同的操作，但还会将计算值与If-None-Match请求标头进行比较，如果两者相等，则返回304（NOT_MODIFIED）。

**此策略可节省网络带宽，但不会节省CPU，因为必须为每个请求计算完整响应。**

ps: 这里是返回的内容变少了，至于避免计算，就是下文说的，引入缓存。

如前所述，控制器级别的其他策略可以避免计算。请参阅HTTP缓存。

该过滤器具有writeWeakETag参数，该参数将过滤器配置为写入弱ETag，类似于以下内容：`W/"02a2d595e6ed9a0b24f027f2b63b134d6"` (在 [RFC 7232第2.3节中定义](https://tools.ietf.org/html/rfc7232#section-2.3)）。

为了支持异步请求，此过滤器必须与DispatcherType.ASYNC映射，以便过滤器可以延迟并成功生成ETag到最后一个异步调度的末尾。

如果使用Spring Framework的AbstractAnnotationConfigDispatcherServletInitializer（请参阅Servlet Config），则会为所有调度类型自动注册所有过滤器。

但是，如果通过web.xml注册过滤器，或者在Spring Boot中通过FilterRegistrationBean注册过滤器，请确保包括DispatcherType.ASYNC。

# CORS

Spring MVC通过控制器上的注释为CORS配置提供了细粒度的支持。 

但是，当与Spring Security一起使用时，我们建议您依赖内置的CorsFilter，该CorsFilter必须在Spring Security的过滤器链之前订购。

有关更多详细信息，请参见有关CORS和CORS过滤器的部分。

# 拓展阅读

## 一点想法

自己的 FTL（文件+反射+转换）

MVC

手写 Jetty

手写 Netty

## 常见前端工具

安全框架 

[shiro](https://houbb.github.io/2016/08/11/shiro)  

[spring-security](https://houbb.github.io/2017/12/19/spring-security-hello)

user-role-menu 经典控制

# 参考资料

[spring-filters](https://docs.spring.io/spring/docs/current/spring-framework-reference/web.html#filters)

* any list
{:toc}