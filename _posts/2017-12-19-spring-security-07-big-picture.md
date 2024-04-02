---
layout: post
title:  Spring Security 整体架构概览
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

# Filters 

Spring Security的Servlet支持基于Servlet过滤器，因此通常首先了解过滤器的作用会很有帮助。 

下图显示了单个HTTP请求的处理程序的典型分层。

![过滤器](https://docs.spring.io/spring-security/site/docs/5.4.2/reference/html5/images/servlet/architecture/filterchain.png)

客户端向应用程序发送请求，然后容器创建一个FilterChain，其中包含应该根据请求URI的路径处理HttpServletRequest的过滤器和Servlet。 

在Spring MVC应用程序中，Servlet是DispatcherServlet的实例。 

一个Servlet最多只能处理一个HttpServletRequest和HttpServletResponse。 

但是，可以使用多个过滤器来：

- 防止下游过滤器或Servlet被调用。 在这种情况下，过滤器通常将编写HttpServletResponse。

- 修改下游过滤器和Servlet使用的HttpServletRequest或HttpServletResponse

过滤器的功能来自传递给它的FilterChain。

## 使用例子

```java
public void doFilter(ServletRequest request, ServletResponse response, FilterChain chain) {
    // do something before the rest of the application
    chain.doFilter(request, response); // invoke the rest of the application
    // do something after the rest of the application
}
```

# DelegatingFilterProxy

Spring提供了一个名为DelegatingFilterProxy的Filter实现，可以在Servlet容器的生命周期和Spring的ApplicationContext之间进行桥接。 

Servlet容器允许使用其自己的标准注册Filters，但是它不知道Spring定义的Bean。 

DelegatingFilterProxy 可以通过标准的Servlet容器机制进行注册，但是可以将所有工作委托给实现Filter的Spring Bean。

![DelegatingFilterProxy](https://docs.spring.io/spring-security/site/docs/5.4.2/reference/html5/images/servlet/architecture/delegatingfilterproxy.png)

DelegatingFilterProxy从ApplicationContext查找Bean Filter0，然后调用Bean Filter0。 

DelegatingFilterProxy的伪代码可以在下面看到。

```java
public void doFilter(ServletRequest request, ServletResponse response, FilterChain chain) {
    // Lazily get Filter that was registered as a Spring Bean
    // For the example in DelegatingFilterProxy delegate is an instance of Bean Filter0
    Filter delegate = getFilterBean(someBeanName);
    // delegate work to the Spring Bean
    delegate.doFilter(request, response);
}
```

DelegatingFilterProxy的另一个好处是，它可以延迟查找Filter bean实例。 

这很重要，因为容器需要在启动容器之前注册Filter实例。

但是，Spring通常使用ContextLoaderListener加载Spring Bean，直到需要注册Filter实例之后才可以加载。

# FilterChainProxy

Spring Security的Servlet支持包含在FilterChainProxy中。 

FilterChainProxy是Spring Security提供的特殊过滤器，允许通过SecurityFilterChain委派许多过滤器实例。 

由于FilterChainProxy是Bean，因此通常将其包装在DelegatingFilterProxy中。

![FilterChainProxy](https://docs.spring.io/spring-security/site/docs/5.4.2/reference/html5/images/servlet/architecture/filterchainproxy.png)

# SecurityFilterChain

FilterChainProxy使用SecurityFilterChain确定应对此请求调用哪些Spring Security过滤器。

![SecurityFilterChain](https://docs.spring.io/spring-security/site/docs/5.4.2/reference/html5/images/servlet/architecture/securityfilterchain.png)

SecurityFilterChain中的安全过滤器通常是Bean，但是它们是使用FilterChainProxy而不是DelegatingFilterProxy注册的。 

FilterChainProxy为直接向Servlet容器或DelegatingFilterProxy注册提供了许多优势。

首先，它为Spring Security的所有Servlet支持提供了一个起点。

因此，如果您想对Spring Security的Servlet支持进行故障排除，那么在FilterChainProxy中添加调试点是一个很好的起点。

其次，由于FilterChainProxy对于Spring Security的使用至关重要，因此它可以执行不被视为可选任务的任务。

例如，它清除SecurityContext以避免内存泄漏。它还使用Spring Security的HttpFirewall来保护应用程序免受某些类型的攻击。

此外，它在确定何时调用SecurityFilterChain时提供了更大的灵活性。在Servlet容器中，仅根据URL调用过滤器。

但是，FilterChainProxy可以利用RequestMatcher接口，根据HttpServletRequest中的任何内容确定调用。

实际上，FilterChainProxy可用于确定应使用哪个SecurityFilterChain。这允许为您的应用程序的不同部分提供完全独立的配置。

![SecurityFilterChain2](https://docs.spring.io/spring-security/site/docs/5.4.2/reference/html5/images/servlet/architecture/multi-securityfilterchain.png)

在“多个SecurityFilterChain”图中，FilterChainProxy决定应使用哪个SecurityFilterChain。

仅匹配的第一个SecurityFilterChain将被调用。

如果请求的URL是 `/api/messages/`，则将首先在SecurityFilterChain0的 `/api/**` 模式下进行匹配，因此即使在SecurityFilterChainn上也进行了匹配，也只会调用SecurityFilterChain0。

如果请求的URL是 `/messages/`，则在SecurityFilterChain0的 `/api/**` 模式下将不匹配，因此FilterChainProxy将继续尝试每个SecurityFilterChain。

假设没有其他匹配SecurityFilterChainn的SecurityFilterChain实例将被调用。

请注意，SecurityFilterChain0仅配置了三个安全筛选器实例。

但是，SecurityFilterChainn配置了四个安全筛选器。

重要的是要注意，每个SecurityFilterChain可以是唯一的，并且可以独立配置。

实际上，如果应用程序希望Spring Security忽略某些请求，则SecurityFilterChain可能具有零个安全过滤器。

# 安全过滤器

安全筛选器通过SecurityFilterChain API插入到FilterChainProxy中。 

过滤器的顺序很重要。 

通常不必知道Spring Security的过滤器的顺序。 

但是，有时候了解订购是有益的

以下是Spring Security过滤器订购的完整列表：

```
ChannelProcessingFilter

WebAsyncManagerIntegrationFilter

SecurityContextPersistenceFilter

HeaderWriterFilter

CorsFilter

CsrfFilter

LogoutFilter

OAuth2AuthorizationRequestRedirectFilter

Saml2WebSsoAuthenticationRequestFilter

X509AuthenticationFilter

AbstractPreAuthenticatedProcessingFilter

CasAuthenticationFilter

OAuth2LoginAuthenticationFilter

Saml2WebSsoAuthenticationFilter

UsernamePasswordAuthenticationFilter

OpenIDAuthenticationFilter

DefaultLoginPageGeneratingFilter

DefaultLogoutPageGeneratingFilter

ConcurrentSessionFilter

DigestAuthenticationFilter

BearerTokenAuthenticationFilter

BasicAuthenticationFilter

RequestCacheAwareFilter

SecurityContextHolderAwareRequestFilter

JaasApiIntegrationFilter

RememberMeAuthenticationFilter

AnonymousAuthenticationFilter

OAuth2AuthorizationCodeGrantFilter

SessionManagementFilter

ExceptionTranslationFilter

FilterSecurityInterceptor

SwitchUserFilter
```

# 处理安全异常

ExceptionTranslationFilter 允许将AccessDeniedException和AuthenticationException转换为HTTP响应。

ExceptionTranslationFilter作为安全过滤器之一插入到FilterChainProxy中。

![ExceptionTranslationFilter](https://docs.spring.io/spring-security/site/docs/5.4.2/reference/html5/images/servlet/architecture/exceptiontranslationfilter.png)

数字1首先，ExceptionTranslationFilter调用FilterChain.doFilter（request，response）来调用应用程序的其余部分。

数字2如果用户未通过身份验证或它是AuthenticationException，则启动身份验证。

已清除SecurityContextHolder

HttpServletRequest保存在RequestCache中。 用户成功进行身份验证后，将使用RequestCache重播原始请求。

AuthenticationEntryPoint用于从客户端请求凭据。 例如，它可能重定向到登录页面或发送WWW-Authenticate标头。

数字3否则，如果它是AccessDeniedException，则拒绝访问。 调用AccessDeniedHandler以处理拒绝的访问。

## 例子

```java
try {
    filterChain.doFilter(request, response); 
} catch (AccessDeniedException | AuthenticationException ex) {
    if (!authenticated || ex instanceof AuthenticationException) {
        startAuthentication(); 
    } else {
        accessDenied(); 
    }
}
```

# 小结

希望本文对你有所帮助，如果喜欢，欢迎点赞收藏转发一波。

我是老马，期待与你的下次相遇。

# 参考资料

[https://docs.spring.io/spring-security/site/docs/5.4.2/reference/html5/#features](https://docs.spring.io/spring-security/site/docs/5.4.2/reference/html5/#features)

* any list
{:toc}