---
layout: post
title:  Spring Security  Authorization 方法安全
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

# 方法安全性

从2.0版开始，Spring Security大大改善了对为服务层方法增加安全性的支持。 

它提供对JSR-250注释安全性以及框架原始 `@Secured` 注释的支持。 

从3.0开始，您还可以使用新的基于表达式的注释。 

您可以使用Intercept-methods元素装饰Bean声明，从而对单个Bean应用安全性，或者可以使用AspectJ样式切入点在整个服务层中保护多个Bean。

## EnableGlobalMethodSecurity

我们可以在任何@Configuration实例上使用@EnableGlobalMethodSecurity批注启用基于批注的安全性。 

例如，以下将启用Spring Security的 `@Secured` 注释。

```java
@EnableGlobalMethodSecurity(securedEnabled = true)
public class MethodSecurityConfig {
// ...
}
```

向方法（在类或接口上）添加注释将相应地限制对该方法的访问。 

Spring Security的本机注释支持为该方法定义了一组属性。 

这些将被传递给AccessDecisionManager使其做出实际决定：

```java
public interface BankService {

    @Secured("IS_AUTHENTICATED_ANONYMOUSLY")
    public Account readAccount(Long id);

    @Secured("IS_AUTHENTICATED_ANONYMOUSLY")
    public Account[] findAccounts();

    @Secured("ROLE_TELLER")
    public Account post(Account account, double amount);
}
```

可以使用以下命令启用对JSR-250批注的支持

```java
@EnableGlobalMethodSecurity(jsr250Enabled = true)
public class MethodSecurityConfig {
// ...
}
```

这些是基于标准的，并允许应用基于角色的简单约束，但是没有Spring Security的本机注释的强大功能。 

要使用新的基于表达式的语法，可以使用

```java
@EnableGlobalMethodSecurity(prePostEnabled = true)
public class MethodSecurityConfig {
// ...
}
```

等价于：

```java
public interface BankService {

    @PreAuthorize("isAnonymous()")
    public Account readAccount(Long id);

    @PreAuthorize("isAnonymous()")
    public Account[] findAccounts();

    @PreAuthorize("hasAuthority('ROLE_TELLER')")
    public Account post(Account account, double amount);

}
```

# GlobalMethodSecurityConfiguration

有时您可能需要执行比@EnableGlobalMethodSecurity批注允许的操作更复杂的操作。 

对于这些实例，可以扩展GlobalMethodSecurityConfiguration，以确保@EnableGlobalMethodSecurity批注出现在子类中。 

例如，如果您想提供一个自定义的MethodSecurityExpressionHandler，则可以使用以下配置：

```java
@EnableGlobalMethodSecurity(prePostEnabled = true)
public class MethodSecurityConfig extends GlobalMethodSecurityConfiguration {
    @Override
    protected MethodSecurityExpressionHandler createExpressionHandler() {
        // ... create and return custom MethodSecurityExpressionHandler ...
        return expressionHandler;
    }
}
```

## `<global-method-security>` 元素

此元素用于在应用程序中启用基于注释的安全性（通过在元素上设置适当的属性），并将用于整个应用程序上下文的安全性切入点声明组合在一起。 

您只应声明一个 `<global-method-security>` 元素。 

以下声明将启用对Spring Security的 `@Secured` 的支持：

```xml
<global-method-security secured-annotations="enabled" />
```

向方法（在类或接口上）添加注释将相应地限制对该方法的访问。 

Spring Security的本机注释支持为该方法定义了一组属性。

这些将被传递给AccessDecisionManager使其做出实际决定：

```java
public interface BankService {

    @Secured("IS_AUTHENTICATED_ANONYMOUSLY")
    public Account readAccount(Long id);

    @Secured("IS_AUTHENTICATED_ANONYMOUSLY")
    public Account[] findAccounts();

    @Secured("ROLE_TELLER")
    public Account post(Account account, double amount);

}
```

可以使用以下命令启用对JSR-250批注的支持

```xml
<global-method-security jsr250-annotations="enabled" />
```

这些是基于标准的，并允许应用基于角色的简单约束，但是没有Spring Security的本机注释的强大功能。

要使用新的基于表达式的语法，可以使用

```xml
<global-method-security pre-post-annotations="enabled" />
```

等价于：

```java
public interface BankService {

    @PreAuthorize("isAnonymous()")
    public Account readAccount(Long id);

    @PreAuthorize("isAnonymous()")
    public Account[] findAccounts();

    @PreAuthorize("hasAuthority('ROLE_TELLER')")
    public Account post(Account account, double amount);

}
```

如果您需要定义简单的规则，而不仅仅是根据用户的权限列表检查角色名称，则基于表达式的注释是一个不错的选择。

带注释的方法仅对于定义为Spring Bean的实例（在启用方法安全性的同一应用程序上下文中）是安全的。 

如果要保护不是由Spring创建的实例（例如，使用new运算符），则需要使用AspectJ。

您可以在同一应用程序中启用多种类型的注释，但是对于任何接口或类，只能使用一种类型的注释，否则将无法很好地定义行为。

如果找到两个适用于特定方法的注释，则将仅应用其中一个。

# 使用保护切入点添加安全切入点

保护切入点的使用特别强大，因为它允许您仅通过简单的声明就可以将安全性应用于许多bean。 

考虑以下示例：

```xml
<global-method-security>
<protect-pointcut expression="execution(* com.mycompany.*Service.*(..))"
    access="ROLE_USER"/>
</global-method-security>
```

这将保护在应用程序上下文中声明的bean（其类位于com.mycompany包中且其类名以“ Service”结尾）上的所有方法。 

只有具有ROLE_USER角色的用户才能调用这些方法。 

与URL匹配一样，最具体的匹配项必须在切入点列表中排在第一位，因为将使用第一个匹配表达式。 

安全注释优先于切入点。


# 小结

希望本文对你有所帮助，如果喜欢，欢迎点赞收藏转发一波。

我是老马，期待与你的下次相遇。

# 参考资料

[https://docs.spring.io/spring-security/site/docs/5.4.2/reference/html5/#features](https://docs.spring.io/spring-security/site/docs/5.4.2/reference/html5/#features)

* any list
{:toc}