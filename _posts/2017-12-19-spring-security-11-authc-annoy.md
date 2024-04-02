---
layout: post
title:  Spring Security Authentication 匿名登录特性 & RunAS 以 xx 身份
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

# 匿名认证

通常，采取“默认拒绝”的做法被认为是一种良好的安全做法，您可以在其中明确指定允许的内容，并禁止其他所有内容。

定义未经身份验证的用户可以访问的内容的情况与此类似，尤其是对于Web应用程序。

许多站点要求用户必须通过身份验证才能使用少数几个URL（例如，主页和登录页面）。在这种情况下，最简单的是为这些特定的URL定义访问配置属性，而不是为每个受保护的资源都定义访问配置属性。

换句话说，有时很高兴地说默认情况下需要ROLE_SOMETHING，并且只允许该规则的某些例外，例如应用程序的登录，注销和主页。

您也可以从过滤器链中完全省略这些页面，从而绕过访问控制检查，但是由于其他原因，这可能是不希望的，尤其是对于经过身份验证的用户而言，这些页面的行为有所不同时。

这就是我们所说的匿名身份验证。

**注意，“匿名认证”的用户和未经认证的用户之间没有真正的概念差异。**

Spring Security的匿名身份验证只是为您提供了一种更便捷的方式来配置访问控制属性。

即使在SecurityContextHolder中实际上存在一个匿名身份验证对象，对诸如getCallerPrincipal之类的Servlet API调用的调用仍将返回null。

在其他情况下，匿名身份验证很有用，例如当审核拦截器查询SecurityContextHolder以确定哪个主体负责给定操作时。

如果类知道SecurityContextHolder始终包含Authentication对象并且从不为null，则可以更强大地编写类。

# 组态

使用HTTP配置Spring Security 3.0时会自动提供匿名身份验证支持，并且可以使用 `<anonymous>` 元素自定义（或禁用）匿名身份验证支持。 

除非您使用的是传统的Bean配置，否则无需配置此处描述的Bean。三个类共同提供了匿名身份验证功能。 

AnonymousAuthenticationToken是Authentication的实现，并存储适用于匿名主体的GrantedAuthority。 

有一个对应的AnonymousAuthenticationProvider，它已链接到ProviderManager中，因此可以接受AnonymousAuthenticationToken。 

最后，有一个AnonymousAuthenticationFilter，它在常规身份验证机制之后链接，并且如果那里没有现有的Authentication，则会自动将AnonymousAuthenticationToken添加到SecurityContextHolder。 

筛选器和身份验证提供程序的定义如下所示：

```xml
<bean id="anonymousAuthFilter"
    class="org.springframework.security.web.authentication.AnonymousAuthenticationFilter">
<property name="key" value="foobar"/>
<property name="userAttribute" value="anonymousUser,ROLE_ANONYMOUS"/>
</bean>

<bean id="anonymousAuthenticationProvider"
    class="org.springframework.security.authentication.AnonymousAuthenticationProvider">
<property name="key" value="foobar"/>
</bean>
```

密钥在过滤器和身份验证提供程序之间共享，以便前者创建的令牌被后者接受。 

userAttribute 以 `usernameInTheAuthenticationToken,grantedAuthority[,grantedAuthority]` 的形式表示。 

这与InMemoryDaoImpl的userMap属性的等号后使用的语法相同。

如前所述，匿名身份验证的好处是所有URI模式都可以应用安全性。 

例如：

```xml
<bean id="filterSecurityInterceptor"
    class="org.springframework.security.web.access.intercept.FilterSecurityInterceptor">
<property name="authenticationManager" ref="authenticationManager"/>
<property name="accessDecisionManager" ref="httpRequestAccessDecisionManager"/>
<property name="securityMetadata">
    <security:filter-security-metadata-source>
    <security:intercept-url pattern='/index.jsp' access='ROLE_ANONYMOUS,ROLE_USER'/>
    <security:intercept-url pattern='/hello.htm' access='ROLE_ANONYMOUS,ROLE_USER'/>
    <security:intercept-url pattern='/logoff.jsp' access='ROLE_ANONYMOUS,ROLE_USER'/>
    <security:intercept-url pattern='/login.jsp' access='ROLE_ANONYMOUS,ROLE_USER'/>
    <security:intercept-url pattern='/**' access='ROLE_USER'/>
    </security:filter-security-metadata-source>" +
</property>
</bean>
```

# AuthenticationTrustResolver

完善匿名身份验证讨论的是AuthenticationTrustResolver接口及其相应的AuthenticationTrustResolverImpl实现。

该接口提供了isAnonymous（Authentication）方法，该方法允许感兴趣的类将这种特殊类型的身份验证状态考虑在内。 

ExceptionTranslationFilter在处理AccessDeniedException时使用此接口。如果抛出AccessDeniedException且身份验证为匿名类型，则筛选器将开始AuthenticationEntryPoint，而不是引发403（禁止）响应，以便主体可以正确地进行身份验证。

这是一个必要的区别，否则主体将始终被视为“已认证”，并且永远不会获得通过表单，基本，摘要或某些其他常规认证机制登录的机会。

您经常会在上述拦截器配置中看到ROLE_ANONYMOUS属性被IS_AUTHENTICATED_ANONYMOUSLY替换，这在定义访问控制时实际上是相同的。

这是使用AuthenticatedVoter的示例，我们将在授权章节中看到。

它使用AuthenticationTrustResolver来处理此特定配置属性，并将访问权限授予匿名用户。 

AuthenticatedVoter方法功能更强大，因为它使您可以区分匿名用户，记住我的用户和经过完全认证的用户。

如果您不需要此功能，则可以坚持使用ROLE_ANONYMOUS，它将由Spring Security的标准RoleVoter处理。

# 运行身份验证替换

在安全对象回调阶段，AbstractSecurityInterceptor能够临时替换SecurityContext和SecurityContextHolder中的Authentication对象。

仅当原始Authentication对象已由AuthenticationManager和AccessDecisionManager成功处理时，才会发生这种情况。 

RunAsManager将指示在SecurityInterceptorCallback期间应使用的替换Authentication对象（如果有）。

通过在安全对象回调阶段临时替换Authentication对象，安全调用将能够调用需要不同身份验证和授权凭据的其他对象。

它还将能够对特定的GrantedAuthority对象执行任何内部安全检查。

由于Spring Security提供了许多帮助程序类，这些类根据SecurityContextHolder的内容自动配置远程协议，因此这些运行方式替换在调用远程Web服务时特别有用

## 配置

Spring Security提供了一个RunAsManager接口：

```java
Authentication buildRunAs(Authentication authentication, Object object,
    List<ConfigAttribute> config);

boolean supports(ConfigAttribute attribute);

boolean supports(Class clazz);
```

第一个方法返回Authentication对象，该对象应在方法调用期间替换现有的Authentication对象。如果该方法返回null，则表明不应进行任何替换。

第二种方法由AbstractSecurityInterceptor使用，作为其启动配置属性验证的一部分。安全拦截器实现调用support（Class）方法，以确保已配置的RunAsManager支持该安全拦截器将显示的安全对象的类型。

Spring Security提供了RunAsManager的一种具体实现。如果任何ConfigAttribute以RUN_AS_开头，则RunAsManagerImpl类将返回替换RunAsUserToken。如果找到任何这样的ConfigAttribute，则替换的RunAsUserToken将包含与原始Authentication对象相同的主体，凭据和授予的权限，以及每个RUN_AS_ ConfigAttribute的新SimpleGrantedAuthority。每个新的SimpleGrantedAuthority将以ROLE_为前缀，后跟RUN_AS ConfigAttribute。

例如，RUN_AS_SERVER将导致替换RunAsUserToken包含ROLE_RUN_AS_SERVER授予的权限。

替换的RunAsUserToken就像其他任何Authentication对象一样。它需要由AuthenticationManager进行身份验证，可能需要通过委派给合适的AuthenticationProvider来进行。 RunAsImplAuthenticationProvider执行此类身份验证。它只是简单地接受任何出现的RunAsUserToken。

为了确保恶意代码不会创建RunAsUserToken并将其提供给RunAsImplAuthenticationProvider保证接受，密钥的哈希存储在所有生成的令牌中。

使用相同的密钥在Bean上下文中创建RunAsManagerImpl和RunAsImplAuthenticationProvider：

```xml
<bean id="runAsManager"
    class="org.springframework.security.access.intercept.RunAsManagerImpl">
<property name="key" value="my_run_as_password"/>
</bean>

<bean id="runAsAuthenticationProvider"
    class="org.springframework.security.access.intercept.RunAsImplAuthenticationProvider">
<property name="key" value="my_run_as_password"/>
</bean>
```

通过使用相同的密钥，可以验证每个RunAsUserToken是否由批准的RunAsManagerImpl创建。 

出于安全原因，RunAsUserToken在创建后是不可变的。

# 小结

希望本文对你有所帮助，如果喜欢，欢迎点赞收藏转发一波。

我是老马，期待与你的下次相遇。

# 参考资料

[https://docs.spring.io/spring-security/site/docs/5.4.2/reference/html5/#features](https://docs.spring.io/spring-security/site/docs/5.4.2/reference/html5/#features)

* any list
{:toc}