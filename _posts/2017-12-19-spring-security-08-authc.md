---
layout: post
title:  Spring Security Authentication 认证详解
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

# 认证方式

Spring Security为身份验证提供了全面的支持。

本节讨论：

## 架构组件

本部分描述了Servlet身份验证中使用的Spring Security的主要架构组件。

SecurityContextHolder-SecurityContextHolder是Spring Security存储进行身份验证的人员的详细信息的位置。

SecurityContext-从SecurityContextHolder获得，并包含当前已认证用户的Authentication。

Authentication-可以是AuthenticationManager的输入，以提供用户提供的用于身份验证的凭据或来自SecurityContext的当前用户。

GrantedAuthority-授予身份验证主体的权限（即角色，作用域等）

AuthenticationManager-定义Spring Security的过滤器如何执行身份验证的API。

ProviderManager-AuthenticationManager的最常见实现。

AuthenticationProvider-由ProviderManager用于执行特定类型的身份验证。

具有AuthenticationEntryPoint的请求凭证-用于从客户端请求凭证（即，重定向到登录页面，发送WWW身份验证响应等）

AbstractAuthenticationProcessingFilter-用于验证的基本过滤器。这也为高级别的身份验证流程以及各个部分如何协同工作提供了一个好主意。

## 认证机制

用户名和密码-如何使用用户名/密码进行身份验证

OAuth 2.0登录-使用OpenID Connect和非标准OAuth 2.0登录进行OAuth 2.0登录（即GitHub）

SAML 2.0登录-SAML 2.0登录

中央身份验证服务器（CAS）-中央身份验证服务器（CAS）支持

记住我-如何记住用户过期的会话

JAAS认证-使用JAAS进行认证

OpenID-OpenID身份验证（请勿与OpenID Connect混淆）

预先身份验证方案-使用诸如SiteMinder或Java EE安全性之类的外部机制进行身份验证，但仍使用Spring Security进行授权和防范常见漏洞。

X509验证-X509验证


ps: 还是要系统的学习，老马以前只知道用户名密码 + oath 2.0 这两种认证方式。

# SecurityContextHolder

Spring Security身份验证模型的核心是SecurityContextHolder。 

它包含SecurityContext。

![SecurityContextHolder](https://docs.spring.io/spring-security/site/docs/5.4.2/reference/html5/images/servlet/authentication/architecture/securitycontextholder.png)

Spring Security在其中存储SecurityContextHolder，用于存储通过身份验证的人员的详细信息。 

Spring Security并不关心如何填充SecurityContextHolder。

如果它包含一个值，那么它将用作当前经过身份验证的用户。

指示用户已通过身份验证的最简单方法是直接设置SecurityContextHolder。

```java
// 创建一个新的上下文
SecurityContext context = SecurityContextHolder.createEmptyContext(); 
// 构建认证信息
Authentication authentication =
    new TestingAuthenticationToken("username", "password", "ROLE_USER"); 
// 设置
context.setAuthentication(authentication);

SecurityContextHolder.setContext(context); 
```

默认情况下，SecurityContextHolder使用ThreadLocal存储这些详细信息，这意味着即使没有将SecurityContext作为这些方法的参数显式传递，SecurityContext始终可用于同一线程中的方法。

如果在处理当前委托人的请求后要清除线程，则以这种方式使用ThreadLocal是非常安全的。 

Spring Security的FilterChainProxy确保始终清除SecurityContext。

## 安全上下文

从SecurityContextHolder获得SecurityContext。 

SecurityContext包含一个 Authentication 对象。

# 认证方式

身份验证在Spring Security中有两个主要用途：

（1）AuthenticationManager的输入，用于提供用户提供的用于身份验证的凭据。

 在这种情况下使用时，isAuthenticated（）返回false。

（2）代表当前经过身份验证的用户。 

可以从SecurityContext获得当前的身份验证。

身份验证包含：

principal 主体-标识用户。 使用用户名/密码进行身份验证时，这通常是UserDetails的实例。

credentials 凭据-通常是密码。 在许多情况下，将在验证用户身份后清除此内容，以确保它不会泄漏。

authorities 权威-GrantedAuthority是授予用户的高级权限。

# 授予的权限

GrantedAuthoritys是授予用户的高级权限。

可以从 `Authentication.getAuthorities()` 方法获得GrantedAuthoritys。此方法提供了GrantedAuthority对象的集合。

毫不奇怪，GrantedAuthority是授予主体的权限。此类权限通常是“角色”，例如ROLE_ADMINISTRATOR或ROLE_HR_SUPERVISOR。稍后将这些角色配置为Web授权，方法授权和域对象授权。 

Spring Security的其他部分能够解释这些权限，并希望它们存在。使用基于用户名/密码的身份验证时，GrantedAuthoritys通常由UserDetailsS​​ervice加载。

通常，GrantedAuthority对象是应用程序范围的权限。它们不特定于给定的域对象。因此，您不太可能具有GrantedAuthority来表示对Employee对象编号54的许可，因为如果有成千上万个这样的权限，您将很快用光内存（或者至少导致应用程序花费很长时间）时间来认证用户）。

当然，Spring Security是专门为满足这一通用要求而设计的，但您可以为此目的使用项目的域对象安全功能。

# 认证管理器

AuthenticationManager是用于定义Spring Security的过滤器如何执行身份验证的API。 

然后由调用AuthenticationManager的控制器（即Spring Security的Filters）在SecurityContextHolder上设置返回的Authentication。 

如果您不与Spring Security的过滤器集成，则可以直接设置SecurityContextHolder，并且不需要使用AuthenticationManager。

虽然AuthenticationManager的实现可以是任何东西，但最常见的实现是ProviderManager。

# ProviderManager

ProviderManager是AuthenticationManager最常用的实现。 

ProviderManager委托给AuthenticationProviders列表。 

每个AuthenticationProvider都有机会指示认证应该成功，失败，或者表明它不能做出决定并允许下游AuthenticationProvider进行决定。 

如果没有一个已配置的AuthenticationProviders可以进行身份验证，则身份验证将失败，并显示ProviderNotFoundException，这是一个特殊的AuthenticationException，它指示ProviderManager未配置为支持传递给它的Authentication类型。

![ProviderManager](https://docs.spring.io/spring-security/site/docs/5.4.2/reference/html5/images/servlet/authentication/architecture/providermanager.png)

实际上，每个AuthenticationProvider都知道如何执行特定类型的身份验证。

例如，一个AuthenticationProvider可能能够验证用户名/密码，而另一个可能能够验证SAML断言。 

这允许每个AuthenticationProvider进行非常特定类型的身份验证，同时支持多种身份验证，并且仅公开一个AuthenticationManager bean。

ps: 优点是我们可以任意组合，比如一些涉及资金安全的操作，可以多重验证。

ProviderManager 还允许配置可选的父AuthenticationManager，如果没有AuthenticationProvider可以执行身份验证，请咨询该父对象。 

父级可以是任何类型的AuthenticationManager，但通常是ProviderManager的实例。

![ProviderManager 父类](https://docs.spring.io/spring-security/site/docs/5.4.2/reference/html5/images/servlet/authentication/architecture/providermanager-parent.png)

实际上，多个ProviderManager实例可能共享同一个父AuthenticationManager。 

在存在多个具有相同身份验证（共享父AuthenticationManager）但又具有不同身份验证机制（不同ProviderManager实例）的多个SecurityFilterChain实例的情况下，这种情况有些常见。

![共享父AuthenticationManager](https://docs.spring.io/spring-security/site/docs/5.4.2/reference/html5/images/servlet/authentication/architecture/providermanagers-parent.png)

默认情况下，ProviderManager会尝试从身份验证对象中清除由成功身份验证请求返回的所有敏感凭据信息。

这样可以防止将密码之类的信息保留在HttpSession中所需的时间。

例如，在使用用户对象的缓存来提高无状态应用程序的性能时，这可能会导致问题。如果身份验证包含对缓存中某个对象（例如UserDetails实例）的引用，并且已删除其凭据，则将无法再对缓存的值进行身份验证。如果使用缓存，则需要考虑到这一点。

一个明显的解决方案是首先在缓存实现中或在创建返回的Authentication对象的AuthenticationProvider中**创建对象的副本**。

ps: 创建副本是比较简单的解决方案，但是要考虑深度复制，不要互相影响。

或者，您可以在ProviderManager上禁用deleteCredentialsAfterAuthentication属性。

## 身份验证提供者

可以将多个AuthenticationProviders注入ProviderManager。 每个AuthenticationProvider执行特定的身份验证类型。 

例如，DaoAuthenticationProvider支持基于用户名/密码的身份验证，而JwtAuthenticationProvider支持对JWT令牌的身份验证。

# 使用AuthenticationEntryPoint请求凭据

AuthenticationEntryPoint用于发送HTTP响应，以从客户端请求凭据。

有时，客户端会主动包含凭据（例如用户名/密码）以请求资源。 

在这些情况下，Spring Security无需提供HTTP响应即可从客户端请求凭据，因为它们已经包含在内。

在其他情况下，客户端将对未经授权访问的资源发出未经身份验证的请求。 

在这种情况下，AuthenticationEntryPoint的实现用于从客户端请求凭据。 

AuthenticationEntryPoint实现可能会执行重定向到登录页面，使用WWW-Authenticate标头进行响应等。

# AbstractAuthenticationProcessingFilter

AbstractAuthenticationProcessingFilter用作基础过滤器，用于验证用户的凭据。 

在对凭证进行身份验证之前，Spring Security通常使用AuthenticationEntryPoint请求凭证。

接下来，AbstractAuthenticationProcessingFilter可以对提交给它的任何身份验证请求进行身份验证。

![AbstractAuthenticationProcessingFilter](https://docs.spring.io/spring-security/site/docs/5.4.2/reference/html5/images/servlet/authentication/architecture/abstractauthenticationprocessingfilter.png)

## 流程

（1）第一步

当用户提交其凭据时，AbstractAuthenticationProcessingFilter从要验证的HttpServletRequest创建一个Authentication。创建的身份验证类型取决于AbstractAuthenticationProcessingFilter的子类。

例如，UsernamePasswordAuthenticationFilter根据在HttpServletRequest中提交的用户名和密码创建UsernamePasswordAuthenticationToken。

（2）第二步

接下来，将身份验证传递到AuthenticationManager进行身份验证。

（3）第三步

如果身份验证失败，则失败

已清除SecurityContextHolder。

RememberMeServices.loginFail被调用。如果记得我没有配置，这是一个禁忌。

AuthenticationFailureHandler被调用。

（4）第四步

如果身份验证成功，则为成功。

新的登录通知SessionAuthenticationStrategy。

身份验证是在SecurityContextHolder上设置的。之后，SecurityContextPersistenceFilter将SecurityContext保存到HttpSession中。

RememberMeServices.loginSuccess被调用。如果记得我没有配置，这是一个禁忌。

ApplicationEventPublisher发布一个InteractiveAuthenticationSuccessEvent。

AuthenticationSuccessHandler被调用。

# 用户名/密码认证

验证用户身份的最常见方法之一是验证用户名和密码。 

这样，Spring Security为使用用户名和密码进行身份验证提供了全面的支持。

## 读取用户名和密码

Spring Security提供了以下内置机制，用于从HttpServletRequest中读取用户名和密码：

- form 表单登入

- 基本认证

- 摘要式身份验证

## 储存机制

用于读取用户名和密码的每种受支持的机制都可以利用任何受支持的存储机制：

- 具有内存内认证的简单存储

- 具有JDBC身份验证的关系数据库

- 使用UserDetailsService的自定义数据存储

- 具有LDAP认证的LDAP存储

官方文档中介绍的非常详细，这里我们重点介绍下 form 表单登入 + UserDetailsService 自定义数据存储。

# form 登入详解

Spring Security提供对通过html表单提供的用户名和密码的支持。 

本节详细介绍了基于表单的身份验证在Spring Security中的工作方式。

让我们看看Spring Security中基于表单的登录如何工作。 

## 如何重定向

首先，我们了解如何将用户重定向到登录表单。

- Figure 6. Redirecting to the Log In Page

![loginurlauthenticationentrypoint](https://docs.spring.io/spring-security/site/docs/5.4.2/reference/html5/images/servlet/authentication/unpwd/loginurlauthenticationentrypoint.png)

该图基于我们的SecurityFilterChain图。

（1）首先，用户对未经授权的资源/ private进行未经身份验证的请求。

（2）Spring Security的FilterSecurityInterceptor表示通过抛出AccessDeniedException拒绝了未经身份验证的请求。

（3）由于未对用户进行身份验证，因此ExceptionTranslationFilter会启动“开始身份验证”，并使用配置的AuthenticationEntryPoint将重定向发送到登录页面。在大多数情况下，AuthenticationEntryPoint是LoginUrlAuthenticationEntryPoint的实例。

（4）然后，浏览器将请求将其重定向到的登录页面。

（5）应用程序中的某些内容必须呈现登录页面。

## 账户信息认证

提交用户名和密码后，UsernamePasswordAuthenticationFilter会对用户名和密码进行身份验证。 

UsernamePasswordAuthenticationFilter扩展了AbstractAuthenticationProcessingFilter，因此该图看起来应该非常相似。

- Figure 7. Authenticating Username and Password

![Authenticating Username and Password](https://docs.spring.io/spring-security/site/docs/5.4.2/reference/html5/images/servlet/authentication/unpwd/usernamepasswordauthenticationfilter.png)

该图基于我们的SecurityFilterChain图。

（1）当用户提交其用户名和密码时，UsernamePasswordAuthenticationFilter通过从HttpServletRequest中提取用户名和密码来创建UsernamePasswordAuthenticationToken，这是一种身份验证类型。

（2）接下来，将UsernamePasswordAuthenticationToken传递到AuthenticationManager进行身份验证。 AuthenticationManager外观的详细信息取决于用户信息的存储方式。

（3）如果身份验证失败，则失败

已清除SecurityContextHolder。

RememberMeServices.loginFail被调用。如果记得我没有配置，这是一个禁忌。

AuthenticationFailureHandler被调用。

（4）如果身份验证成功，则为成功。

新的登录通知SessionAuthenticationStrategy。

身份验证是在SecurityContextHolder上设置的。

RememberMeServices.loginSuccess被调用。如果记得我没有配置，这是一个禁忌。

ApplicationEventPublisher发布一个InteractiveAuthenticationSuccessEvent。

AuthenticationSuccessHandler被调用。通常，这是一个SimpleUrlAuthenticationSuccessHandler，当我们重定向到登录页面时，它将重定向到ExceptionTranslationFilter保存的请求。

默认情况下，Spring Security表单登录处于启用状态。但是，一旦提供了任何基于servlet的配置，就必须显式提供基于表单的登录。

## java 实现

可以在下面找到最小的显式Java配置：

- 表单登录

```java
protected void configure(HttpSecurity http) {
    http
        // ...
        .formLogin(withDefaults());
}
```

在这种配置中，Spring Security将呈现一个默认的登录页面。 

大多数生产应用程序将需要自定义登录表单。

下面的配置演示了如何提供自定义登录表单。

- 自定义表单路径

```java
protected void configure(HttpSecurity http) throws Exception {
    http
        // ...
        .formLogin(form -> form
            .loginPage("/login")
            .permitAll()
        );
}
```

在Spring Security配置中指定登录页面后，您将负责呈现该页面。 

以下是Thymeleaf模板，该模板生成符合/login登录页面的HTML登录表单。

```html
<!DOCTYPE html>
<html xmlns="http://www.w3.org/1999/xhtml" xmlns:th="https://www.thymeleaf.org">
    <head>
        <title>Please Log In</title>
    </head>
    <body>
        <h1>Please Log In</h1>
        <div th:if="${param.error}">
            Invalid username and password.</div>
        <div th:if="${param.logout}">
            You have been logged out.</div>
        <form th:action="@{/login}" method="post">
            <div>
            <input type="text" name="username" placeholder="Username"/>
            </div>
            <div>
            <input type="password" name="password" placeholder="Password"/>
            </div>
            <input type="submit" value="Log in" />
        </form>
    </body>
</html>
```

除了自定义登录页面外，许多用户将不需要更多。 

但是，如果需要，可以使用其他配置自定义以上所有内容。

如果您使用的是Spring MVC，则需要一个将 GET/login 映射到我们创建的登录模板的控制器。 

下面是最小的LoginController示例：

```java
@Controller
class LoginController {
    @GetMapping("/login")
    String login() {
        return "login";
    }
}
```

# 使用UserDetailsService的自定义数据存储

## UserDetails

UserDetails由UserDetailsService返回。 

DaoAuthenticationProvider验证UserDetails，然后返回身份验证，该身份验证的主体是已配置的UserDetailsService返回的UserDetails。

## UserDetailsService

DaoAuthenticationProvider使用UserDetailsService检索用户名，密码和其他用于使用用户名和密码进行身份验证的属性。 

Spring Security提供UserDetailsService的内存中和JDBC实现。

您可以通过将自定义UserDetailsService公开为bean来定义自定义身份验证。 

例如，下面的示例将假定CustomUserDetailsService实现UserDetailsService来自定义身份验证：

```java
@Bean
CustomUserDetailsService customUserDetailsService() {
    return new CustomUserDetailsService();
}
```

## 密码编码器（PasswordEncoder）

Spring Security的servlet支持通过与PasswordEncoder集成来安全地存储密码。 

可以通过暴露一个PasswordEncoder Bean来定制Spring Security使用的PasswordEncoder实现。

## DaoAuthenticationProvider

DaoAuthenticationProvider是AuthenticationProvider实现，它利用UserDetailsService和PasswordEncoder来验证用户名和密码。

让我们看一下DaoAuthenticationProvider在Spring Security中的工作方式。 

该图详细说明了“读取用户名和密码”中的AuthenticationManager的工作方式。

- Figure 10. DaoAuthenticationProvider Usage

![DaoAuthenticationProvider](https://docs.spring.io/spring-security/site/docs/5.4.2/reference/html5/images/servlet/authentication/unpwd/daoauthenticationprovider.png)

（1）从读取用户名和密码的身份验证筛选器将UsernamePasswordAuthenticationToken传递给由ProviderManager实现的AuthenticationManager。

（2）ProviderManager配置为使用DaoAuthenticationProvider类型的AuthenticationProvider。

（3）DaoAuthenticationProvider从UserDetailsService查找UserDetails。

（4）DaoAuthenticationProvider然后使用PasswordEncoder来验证上一步中返回的UserDetails上的密码。

（5）身份验证成功后，返回的身份验证的类型为UsernamePasswordAuthenticationToken，其主体为已配置的UserDetailsService返回的UserDetails。 

最终，返回的UsernamePasswordAuthenticationToken将由身份验证筛选器在SecurityContextHolder上设置。

# 小结

希望本文对你有所帮助，如果喜欢，欢迎点赞收藏转发一波。

我是老马，期待与你的下次相遇。

# 参考资料

[https://docs.spring.io/spring-security/site/docs/5.4.2/reference/html5/#features](https://docs.spring.io/spring-security/site/docs/5.4.2/reference/html5/#features)

* any list
{:toc}