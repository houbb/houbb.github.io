---
layout: post
title:  Spring Security  Authorization 使用FilterSecurityInterceptor授权HttpServletRequest
date:  2017-12-19 22:29:09 +0800
categories: [Spring]
tags: [spring, spring-security, web-safe]
published: true
---


# 序言

前面我们学习了 [spring security 与 springmvc 的整合入门教程](https://www.toutiao.com/i6884852647480787459/)。

[spring secutity整合springboot入门](https://www.toutiao.com/item/6916894767628468747/)

[spring security 使用 maven 导入汇总](https://www.toutiao.com/item/6917240713151398403/)

[spring security 业界标准加密策略源码详解](https://www.toutiao.com/item/6917261378050982403/)

[Spring Security 如何预防CSRF跨域攻击？](https://www.toutiao.com/item/6917618373924995591/)

[Spring Security 安全响应头配置详解](https://www.toutiao.com/item/6918186604846842376/)

这一节我们来学习一下 spring security 的整体架构设计。

# Authorization 使用FilterSecurityInterceptor授权HttpServletRequest

本节通过深入研究授权在基于Servlet的应用程序中的工作方式，以Servlet体系结构和实现为基础。

FilterSecurityInterceptor为HttpServletRequests提供授权。 

它作为安全筛选器之一插入到FilterChainProxy中。

![Figure 13. Authorize HttpServletRequest](https://docs.spring.io/spring-security/site/docs/5.4.2/reference/html5/images/servlet/authorization/filtersecurityinterceptor.png)

（1）首先，FilterSecurityInterceptor从SecurityContextHolder获得身份验证。

（2）FilterSecurityInterceptor根据传递到FilterSecurityInterceptor中的HttpServletRequest，HttpServletResponse和FilterChain创建一个FilterInvocation。

（3）接下来，它将FilterInvocation传递给SecurityMetadataSource以获取ConfigAttributes。

（4）最后，它将Authentication，FilterInvocation和ConfigAttributes传递给AccessDecisionManager。

（5）如果拒绝授权，则会引发AccessDeniedException。 在这种情况下，ExceptionTranslationFilter处理AccessDeniedException。

（6）如果授予访问权限，FilterSecurityInterceptor继续执行FilterChain，该链接可允许应用程序正常处理。

默认情况下，Spring Security的授权将要求对所有请求进行身份验证。

## 配置

显式配置如下所示：

每一个请求必须都已经登录验证了。

```java
protected void configure(HttpSecurity http) throws Exception {
    http
        // ...
        .authorizeRequests(authorize -> authorize
            .anyRequest().authenticated()
        );
}
```

也可以针对不同的请求灵活配置：

```java
protected void configure(HttpSecurity http) throws Exception {
    http
        // ...
        .authorizeRequests(authorize -> authorize                                  
            .mvcMatchers("/resources/**", "/signup", "/about").permitAll()      // 资源、登路等都可以访问     
            .mvcMatchers("/admin/**").hasRole("ADMIN")                          // admin 相关必须要管理员    
            .mvcMatchers("/db/**").access("hasRole('ADMIN') and hasRole('DBA')")   // db 序列必须是 admin && DBA
            .anyRequest().denyAll()                                                  // 其他所有请求直接拒绝
        );
}
```

# 小结

希望本文对你有所帮助，如果喜欢，欢迎点赞收藏转发一波。

我是老马，期待与你的下次相遇。

# 参考资料

[https://docs.spring.io/spring-security/site/docs/5.4.2/reference/html5/#features](https://docs.spring.io/spring-security/site/docs/5.4.2/reference/html5/#features)

* any list
{:toc}