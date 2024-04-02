---
layout: post
title:  Spring Security Authentication session 管理
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


# 会话管理

与HTTP会话相关的功能由SessionManagementFilter和SessionAuthenticationStrategy接口的组合来处理，过滤器将其委托给该接口。 

典型的用法包括防止会话固定保护攻击，检测会话超时以及限制已认证用户可以同时打开多少个会话。

## 检测超时

您可以配置Spring Security来检测提交的无效会话ID，并将用户重定向到适当的URL。 

这是通过会话管理元素实现的：

```xml
<http>
...
<session-management invalid-session-url="/invalidSession.htm" />
</http>
```

请注意，如果使用此机制来检测会话超时，则在用户注销然后重新登录而不关闭浏览器的情况下，它可能会错误地报告错误。 

这是因为在使会话无效时不会清除会话cookie，即使用户已注销，会话cookie也会重新提交。 

您可能能够在注销时显式删除JSESSIONID cookie，例如通过在注销处理程序中使用以下语法：

```xml
<http>
<logout delete-cookies="JSESSIONID" />
</http>
```

不幸的是，不能保证它可以与每个servlet容器一起使用，因此您需要在您的环境中对其进行测试。

# 并发会话控制

如果您希望限制单个用户登录到您的应用程序的能力，Spring Security可以通过以下简单补充来支持此功能。 

首先，您需要将以下侦听器添加到您的web.xml文件中，以使Spring Security更新有关会话生命周期事件的信息：

```xml
<listener>
<listener-class>
    org.springframework.security.web.session.HttpSessionEventPublisher
</listener-class>
</listener>
```

然后将以下行添加到您的应用程序上下文：

```xml
<http>
...
<session-management>
    <concurrency-control max-sessions="1" />
</session-management>
</http>
```

这将防止用户多次登录-第二次登录将使第一次登录无效。 

通常，您希望避免再次登录，在这种情况下，您可以使用

```xml
<http>
...
<session-management>
    <concurrency-control max-sessions="1" error-if-maximum-exceeded="true" />
</session-management>
</http>
```

然后，第二次登录将被拒绝。 “拒绝”是指如果使用基于表单的登录，则会将用户发送到authentication-failure-url。 

如果第二次身份验证是通过另一个非交互机制（例如“ remember-me”）进行的，则“未授权”（401）错误将发送给客户端。 

相反，如果要使用错误页面，则可以将属性session-authentication-error-url添加到session-management元素中。

如果您使用定制的身份验证筛选器进行基于表单的登录，则必须显式配置并发会话控制支持。 

# 会话固定攻击防护

会话固定攻击是一种潜在的风险，恶意攻击者有可能通过访问站点来创建会话，然后诱使另一个用户以相同的会话登录（通过向他们发送包含会话标识符作为参数的链接，以便例）。 

Spring Security通过创建一个新会话或在用户登录时更改会话ID来自动防止这种情况的发生。

## 配置

如果您不需要此保护，或者与其他要求发生冲突，则可以使用 `<session-management>` 的 `session-fixation-protection` 属性，具有四个选项

- none 

不做任何事情。原始会话将保留。

- newSession

创建一个新的“干净”会话，而不复制现有的会话数据（仍将复制与Spring Security相关的属性）。

- migrateSession

创建一个新会话并将所有现有会话属性复制到新会话。这是Servlet 3.0或更早版本的容器中的默认值。

- changeSessionId

不创建新的会话。而是使用Servlet容器（HttpServletRequest＃changeSessionId（））提供的会话固定保护。此选项仅在Servlet 3.1（Java EE 7）和更高版本的容器中可用。在较旧的容器中指定它会导致异常。这是Servlet 3.1和更高版本容器中的默认设置。

发生会话固定保护时，它将导致SessionFixationProtectionEvent在应用程序上下文中发布。

如果使用changeSessionId，则此保护还将导致任何javax.servlet.http.HttpSessionIdListener收到通知，因此，如果您的代码侦听这两个事件，请务必谨慎。

# SessionManagementFilter

SessionManagementFilter根据SecurityContextHolder的当前内容检查SecurityContextRepository的内容，以确定用户是否在当前请求期间已通过典型的非交互式身份验证机制（例如，预身份验证或“记住我”）进行了身份验证。

如果存储库包含安全上下文，则过滤器不执行任何操作。如果不是，并且线程本地的SecurityContext包含（非匿名）身份验证对象，则过滤器将假定它们已由堆栈中的先前过滤器进行了身份验证。

然后它将调用配置的SessionAuthenticationStrategy。

如果用户当前未通过身份验证，则过滤器将检查是否已请求了无效的会话ID（例如，由于超时），并且将调用已配置的InvalidSessionStrategy（如果已设置）。

最常见的行为就是重定向到固定URL，并将其封装在标准实现SimpleRedirectInvalidSessionStrategy中。

如前所述，在通过名称空间配置无效的会话URL时，也会使用后者。

# SessionAuthenticationStrategy (会话认证策略)

SessionAuthenticationStrategy由SessionManagementFilter和AbstractAuthenticationProcessingFilter一起使用，因此，例如，如果您使用自定义的表单登录类，则需要将其注入到这两个类中。 

在这种情况下，将名称空间和自定义Bean相结合的典型配置如下所示：

```xml
<http>
<custom-filter position="FORM_LOGIN_FILTER" ref="myAuthFilter" />
<session-management session-authentication-strategy-ref="sas"/>
</http>

<beans:bean id="myAuthFilter" class=
"org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter">
    <beans:property name="sessionAuthenticationStrategy" ref="sas" />
    ...
</beans:bean>

<beans:bean id="sas" class=
"org.springframework.security.web.authentication.session.SessionFixationProtectionStrategy" />
```

请注意，如果您在实现HttpSessionBindingListener的会话中存储bean（包括Spring会话范围的bean），则使用默认的SessionFixationProtectionStrategy可能会引起问题。 

# 并发控制

Spring Security可以防止委托人同时向同一应用程序进行身份验证超过指定次数。

许多ISV都利用此功能来实施许可，而网络管理员喜欢此功能，因为它有助于防止人们共享登录名。

例如，您可以阻止用户“蝙蝠侠”从两个不同的会话登录到Web应用程序。您可以使他们的前一次登录到期，也可以在他们再次尝试登录时报告错误，从而阻止第二次登录。

请注意，如果您使用第二种方法，则未明确注销的用户（例如，刚刚关闭浏览器的用户）将无法再次登录，直到他们的原始会话期满为止。

名称空间支持并发控制，因此，请查阅前面的名称空间一章以获取最简单的配置。有时您需要自定义内容。

该实现使用SessionAuthenticationStrategy的专用版本，称为ConcurrentSessionControlAuthenticationStrategy。

以前，并发身份验证检查是由ProviderManager进行的，可以通过ConcurrentSessionController进行注入。 

后者将检查用户是否尝试超过允许的会话数。 

但是，这种方法要求预先创建HTTP会话，这是不希望的。 

在Spring Security 3中，首先通过AuthenticationManager对用户进行身份验证，一旦成功对用户进行身份验证，就会创建一个会话，并检查是否允许他们打开另一个会话。

要使用并发会话支持，您需要在web.xml中添加以下内容：

```xml
<listener>
    <listener-class>
    org.springframework.security.web.session.HttpSessionEventPublisher
    </listener-class>
</listener>
```

此外，您需要将ConcurrentSessionFilter添加到FilterChainProxy中。 

ConcurrentSessionFilter需要两个构造函数参数：sessionRegistry（通常指向SessionRegistryImpl的实例）和sessionInformationExpiredStrategy，用于定义会话过期时要应用的策略。 

使用名称空间创建FilterChainProxy和其他默认Bean的配置如下所示：

```xml
<http>
<custom-filter position="CONCURRENT_SESSION_FILTER" ref="concurrencyFilter" />
<custom-filter position="FORM_LOGIN_FILTER" ref="myAuthFilter" />

<session-management session-authentication-strategy-ref="sas"/>
</http>

<beans:bean id="redirectSessionInformationExpiredStrategy"
class="org.springframework.security.web.session.SimpleRedirectSessionInformationExpiredStrategy">
<beans:constructor-arg name="invalidSessionUrl" value="/session-expired.htm" />
</beans:bean>

<beans:bean id="concurrencyFilter"
class="org.springframework.security.web.session.ConcurrentSessionFilter">
<beans:constructor-arg name="sessionRegistry" ref="sessionRegistry" />
<beans:constructor-arg name="sessionInformationExpiredStrategy" ref="redirectSessionInformationExpiredStrategy" />
</beans:bean>

<beans:bean id="myAuthFilter" class=
"org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter">
<beans:property name="sessionAuthenticationStrategy" ref="sas" />
<beans:property name="authenticationManager" ref="authenticationManager" />
</beans:bean>

<beans:bean id="sas" class="org.springframework.security.web.authentication.session.CompositeSessionAuthenticationStrategy">
<beans:constructor-arg>
    <beans:list>
    <beans:bean class="org.springframework.security.web.authentication.session.ConcurrentSessionControlAuthenticationStrategy">
        <beans:constructor-arg ref="sessionRegistry"/>
        <beans:property name="maximumSessions" value="1" />
        <beans:property name="exceptionIfMaximumExceeded" value="true" />
    </beans:bean>
    <beans:bean class="org.springframework.security.web.authentication.session.SessionFixationProtectionStrategy">
    </beans:bean>
    <beans:bean class="org.springframework.security.web.authentication.session.RegisterSessionAuthenticationStrategy">
        <beans:constructor-arg ref="sessionRegistry"/>
    </beans:bean>
    </beans:list>
</beans:constructor-arg>
</beans:bean>

<beans:bean id="sessionRegistry"
    class="org.springframework.security.core.session.SessionRegistryImpl" />
```

将侦听器添加到web.xml时，每次HttpSession开始或结束时，都会将ApplicationEvent发布到Spring ApplicationContext。 

这很关键，因为它允许在会话结束时通知SessionRegistryImpl。 

如果没有它，即使用户退出另一个会话或超时，一旦超出会话允许量，用户将永远无法再次登录。

## 查询SessionRegistry中当前经过身份验证的用户及其会话

通过名称空间或使用普通bean设置并发控制具有有益的副作用，即为您提供对SessionRegistry的引用，您可以在应用程序中直接使用它，因此即使您不想限制它的数量。

用户可能拥有的会话，仍然值得建立基础架构。

您可以将maximumSession属性设置为-1，以允许无限制的会话。如果您使用的是名称空间，则可以使用session-registry-alias属性为内部创建的SessionRegistry设置别名，并提供一个可以注入到您自己的bean中的引用。

getAllPrincipals（）方法为您提供了当前已认证用户的列表。您可以通过调用getAllSessions（Object主体，boolean includeExpiredSessions）方法列出用户的会话，该方法返回SessionInformation对象的列表。您还可以通过在SessionInformation实例上调用expireNow（）来使用户会话失效。当用户返回到应用程序时，将阻止他们继续操作。

例如，您可能会发现这些方法在管理应用程序中很有用。

# 小结

希望本文对你有所帮助，如果喜欢，欢迎点赞收藏转发一波。

我是老马，期待与你的下次相遇。

# 参考资料

[https://docs.spring.io/spring-security/site/docs/5.4.2/reference/html5/#features](https://docs.spring.io/spring-security/site/docs/5.4.2/reference/html5/#features)

* any list
{:toc}