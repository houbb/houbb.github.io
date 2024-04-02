---
layout: post
title:  Spring Security Authentication 记住我特性实现
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

# 记住我身份验证

## 总览

“记住我”或“持久登录”身份验证是指能够记住会话之间的主体身份的网站。 

通常，这是通过向浏览器发送一个cookie来实现的，该cookie在以后的会话中被检测到并导致自动登录。 

Spring Security提供了进行这些操作所需的钩子，并具有两个具体的“记住我”实现。 

一种使用散列来保留基于cookie的令牌的安全性，另一种使用数据库或其他持久性存储机制来存储生成的令牌。

请注意，这两种实现都需要UserDetailsService。 

如果您使用的身份验证提供程序不使用UserDetailsService（例如LDAP提供程序），那么它将不起作用，除非您在应用程序上下文中也有一个UserDetailsService Bean。

# 简单的基于哈希的令牌方法

这种方法使用哈希来实现有用的“记住我”策略。 

本质上，在成功进行交互式身份验证后，会将cookie发送到浏览器，该cookie的组成如下：

```
base64(username + ":" + expirationTime + ":" +
md5Hex(username + ":" + expirationTime + ":" password + ":" + key))

username:          As identifiable to the UserDetailsService
password:          That matches the one in the retrieved UserDetails
expirationTime:    The date and time when the remember-me token expires, expressed in milliseconds
key:               A private key to prevent modification of the remember-me token
```

因此，“记住我”令牌仅在指定的时间内有效，并且前提是用户名，密码和密钥不变。 

值得注意的是，这存在潜在的安全问题，因为捕获的“记住我”令牌将可从任何用户代理使用，直到令牌到期为止。 

这与摘要身份验证相同。 

如果委托人知道已捕获令牌，则他们可以轻松更改密码并立即使所有出现的“记住我”令牌失效。 

如果需要更重要的安全性，则应使用下一部分所述的方法。另外，根本不应该使用“记住我”服务。

ps: 记住我只应该用在一些不敏感额操作上，如果是重要的操作，则不应该使用记住我。

如果您熟悉名称空间配置一章中讨论的主题，则可以通过添加 `<remember-me>` 元素来启用“记住我”身份验证：

```xml
<http>
...
<remember-me key="myAppKey"/>
</http>
```

通常将自动选择UserDetailsService。 

如果您的应用程序上下文中有多个，则需要指定与user-service-ref属性一起使用的属性，其中值是UserDetailsService bean的名称。

# 持久令牌方法

这种方法是基于 http://jaspan.com/improved_persistent_login_cookie_best_practice 文章进行的一些细微修改[。 

要将这种方法与名称空间配置一起使用，您将提供一个数据源参考：

```xml
<http>
...
<remember-me data-source-ref="someDataSource"/>
</http>
```

数据库应包含一个使用以下SQL（或等效SQL）创建的persistent_logins表：

```sql
create table persistent_logins (username varchar(64) not null,
                                series varchar(64) primary key,
                                token varchar(64) not null,
                                last_used timestamp not null)
```


# 记住我的接口和实现

记住我与UsernamePasswordAuthenticationFilter一起使用，并通过AbstractAuthenticationProcessingFilter超类中的钩子实现。 

它还在BasicAuthenticationFilter中使用。 

挂钩将在适当的时间调用具体的RememberMeServices。 

## 接口

```java
Authentication autoLogin(HttpServletRequest request, HttpServletResponse response);

void loginFail(HttpServletRequest request, HttpServletResponse response);

void loginSuccess(HttpServletRequest request, HttpServletResponse response,
    Authentication successfulAuthentication);
```

在此阶段，AbstractAuthenticationProcessingFilter仅调用loginFail（）和loginSuccess（）方法。 

每当SecurityContextHolder不包含Authentication时，RememberMeAuthenticationFilter就会调用autoLogin（）方法。 

因此，此接口为底层的“记住我”实现提供了与身份验证相关的事件的充分通知，并在候选Web请求可能包含cookie并希望被记住时委托给该实现。 这

种设计允许使用任何数量的“记住我”实施策略。 

上面我们已经看到，Spring Security提供了两种实现。 

我们将依次介绍这些内容。

## TokenBasedRememberMeServices

此实现支持“基于简单哈希的令牌方法”中描述的更简单方法。 

TokenBasedRememberMeServices生成一个RememberMeAuthenticationToken，由RememberMeAuthenticationProvider处理。 

在此身份验证提供程序和TokenBasedRememberMeServices之间共享密钥。 

另外，TokenBasedRememberMeServices需要一个UserDetailsService，从中可以检索用户名和密码以进行签名比较，并生成RememberMeAuthenticationToken以包含正确的GrantedAuthority。 

**如果用户请求，则应用程序应提供某种注销命令，该命令会使cookie无效。**

TokenBasedRememberMeServices还实现了Spring Security的LogoutHandler接口，因此可以与LogoutFilter一起使用以自动清除cookie。

在应用程序上下文中启用“记住我”服务所需的bean如下：

```xml
<bean id="rememberMeFilter" class=
"org.springframework.security.web.authentication.rememberme.RememberMeAuthenticationFilter">
<property name="rememberMeServices" ref="rememberMeServices"/>
<property name="authenticationManager" ref="theAuthenticationManager" />
</bean>

<bean id="rememberMeServices" class=
"org.springframework.security.web.authentication.rememberme.TokenBasedRememberMeServices">
<property name="userDetailsService" ref="myUserDetailsService"/>
<property name="key" value="springRocks"/>
</bean>

<bean id="rememberMeAuthenticationProvider" class=
"org.springframework.security.authentication.RememberMeAuthenticationProvider">
<property name="key" value="springRocks"/>
</bean>
```

不要忘记将RememberMeServices实现添加到UsernamePasswordAuthenticationFilter.setRememberMeServices() 属性中，将RememberMeAuthenticationProvider包含在AuthenticationManager.setProviders（）列表中，并将RememberMeAuthenticationFilter添加到您的FilterChainProxy中（通常紧接在UsernamePasswordAuthenticationFilter之后）。

## PersistentTokenBasedRememberMeServices

可以使用与TokenBasedRememberMeServices相同的方式使用此类，但还需要使用PersistentTokenRepository配置该类来存储令牌。 

有两种标准实现。

- InMemoryTokenRepositoryImpl，仅用于测试。

- JdbcTokenRepositoryImpl 将令牌存储在数据库中。

上面的“持久令牌方法”中描述了数据库模式。

# 小结

希望本文对你有所帮助，如果喜欢，欢迎点赞收藏转发一波。

我是老马，期待与你的下次相遇。

# 参考资料

[https://docs.spring.io/spring-security/site/docs/5.4.2/reference/html5/#features](https://docs.spring.io/spring-security/site/docs/5.4.2/reference/html5/#features)

* any list
{:toc}