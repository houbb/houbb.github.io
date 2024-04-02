---
layout: post
title:  Spring Security  Authorization 基于表达式的访问控制
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

# 基于表达式的访问控制

除了以前简单地使用配置属性和访问决定投票器外，Spring Security 3.0还引入了使用Spring EL表达式作为授权机制的功能。 

基于表达式的访问控制基于相同的体系结构，但允许将复杂的布尔逻辑封装在单个表达式中。

Spring Security使用Spring EL来支持表达，如果您想更深入地理解该主题，则应该查看它的工作方式。 

使用“根对象”评估表达式作为评估上下文的一部分。 

Spring Security 使用特定的类将Web和方法安全性用作根对象，以提供内置表达式和对诸如当前主体的值的访问。

ps: expression 更加灵活强大

# 常见的内置表达式

表达式根对象的基类是SecurityExpressionRoot。 

这提供了一些在Web和方法安全性中都可用的通用表达式。

## hasRole(String role)

如果当前主体具有指定角色，则返回true。

例如，hasRole（'admin'）

默认情况下，如果提供的角色不是以“ ROLE_”开头，则会添加该角色。 

可以通过修改DefaultWebSecurityExpressionHandler上的defaultRolePrefix进行自定义。

## hasAnyRole(String…​ roles)

如果当前主体具有提供的任何角色（以逗号分隔的字符串列表形式），则返回true。

例如，hasAnyRole（'admin'，'user'）

默认情况下，如果提供的角色不是以“ ROLE_”开头，则会添加该角色。 

可以通过修改DefaultWebSecurityExpressionHandler上的defaultRolePrefix进行自定义。

## hasAuthority(String authority)

如果当前主体具有指定的权限，则返回true。

例如，hasAuthority（'read'）

## hasAnyAuthority(String…​ authorities)

如果当前委托人具有任何提供的授权（以逗号分隔的字符串列表形式），则返回true

例如，hasAnyAuthority（'read'，'write'）

## principal

允许直接访问代表当前用户的主体对象

## authentication

允许直接访问从SecurityContext获得的当前Authentication对象

## permitAll

始终评估为真

## denyAll

永远返回 false

## isAnonymous()

如果当前主体是匿名用户，则返回true

## isRememberMe()

如果当前主体是“记住我”用户，则返回true

## isAuthenticated()

如果用户不是匿名的，则返回true

## isFullyAuthenticated()

如果用户不是匿名用户或“记住我”用户，则返回true

## hasPermission(Object target, Object permission)

如果用户可以访问给定权限的给定目标，则返回true。 

例如，hasPermission（domainObject，'read'）

## hasPermission(Object targetId, String targetType, Object permission)

如果用户可以访问给定权限的给定目标，则返回true。 

例如，hasPermission（1，'com.example.domain.Message'，'read'）


# web 安全表达式

要使用表达式保护单个URL，首先需要将 `<http>` 元素中的use-expressions属性设置为true。 

然后，Spring Security将期望 `<intercept-url>` 元素的访问属性包含Spring EL表达式。 

表达式的计算结果应为布尔值，以定义是否应允许访问。 

例如：

```xml
<http>
    <intercept-url pattern="/admin*"
        access="hasRole('admin') and hasIpAddress('192.168.1.0/24')"/>
    ...
</http>
```

在这里，我们定义了应用程序的“ admin”区域（由URL模式定义）仅对拥有授予权限“ admin”且其IP地址与本地子网匹配的用户可用。 

在上一节中，我们已经看到了内置的hasRole表达式。 表达式hasIpAddress是特定于Web安全性的附加内置表达式。 

它由WebSecurityExpressionRoot类定义，在评估Web访问表达式时，将其实例用作表达式根对象。 

该对象还直接在名称请求下公开HttpServletRequest对象，因此您可以直接在表达式中调用该请求。 

如果使用表达式，则将WebExpressionVoter添加到名称空间使用的AccessDecisionManager中。 

因此，如果您不使用名称空间而想使用表达式，则必须在配置中添加其中之一。

## 在Web安全表达式中引用Bean

如果您希望扩展可用的表达式，则可以轻松地引用您公开的任何Spring Bean。 

例如，假设您有一个名称为webSecurity的Bean，其中包含以下方法签名：

```java
public class WebSecurity {
        public boolean check(Authentication authentication, HttpServletRequest request) {
                ...
        }
}
```

你可以用如下的方式指定：

```java
http
    .authorizeRequests(authorize -> authorize
        .antMatchers("/user/**").access("@webSecurity.check(authentication,request)")
        ...
    )
```

## Web安全表达式中的路径变量

有时能够引用URL中的路径变量是很好的。 

例如，考虑一个RESTful应用程序，该应用程序通过URL路径 `/user/{userId}` ID通过ID查找用户。

您可以通过将路径变量放在模式中来轻松引用它。 

例如，如果您有一个名称为webSecurity的Bean，其中包含以下方法签名：

```java
public class WebSecurity {
        public boolean checkUserId(Authentication authentication, int id) {
                ...
        }
}
```

可以通过如下的方式指定：

```java
http
    .authorizeRequests(authorize -> authorize
        .antMatchers("/user/{userId}/**").access("@webSecurity.checkUserId(authentication,#userId)")
        ...
    );
```

在此配置中，匹配的URL将路径变量传递（并将其转换）为checkUserId方法。 

例如，如果URL是 `/user/123/resource`，则传入的ID为123。

# 方法安全性表达式

方法安全性比简单的允许或拒绝规则要复杂一些。 

Spring Security 3.0引入了一些新的注释，以便为表达式的使用提供全面的支持。

## @Pre 和 @Post 批注

有四个注释支持表达式属性，以允许调用前和调用后的授权检查，还支持过滤提交的集合参数或返回值。 

它们是 `@PreAuthorize`，`@PreFilter`，`@PostAuthorize` 和 `@PostFilter`。 

通过global-method-security名称空间元素启用它们的使用：

```xml
<global-method-security pre-post-annotations="enabled"/>
```

## 使用@PreAuthorize和@PostAuthorize的访问控制

最明显有用的注释是@PreAuthorize，它决定是否可以实际调用方法。

例如（来自“联系人”示例应用程序）

```java
@PreAuthorize("hasRole('USER')")
public void create(Contact contact);
```

这意味着只有角色为“ ROLE_USER”的用户才能访问。 

显然，使用传统配置和所需角色的简单配置属性可以轻松实现同一目标。 

但是关于：

```java
@PreAuthorize("hasPermission(#contact, 'admin')")
public void deletePermission(Contact contact, Sid recipient, Permission permission);
```

在这里，我们实际上是使用方法参数作为表达式的一部分，以确定当前用户是否具有给定联系人的“管理员”权限。 

内置的hasPermission（）表达式通过应用程序上下文链接到Spring Security ACL模块，如下所示。 

您可以按名称作为表达式变量访问任何方法参数。

Spring Security可以通过多种方式来解析方法参数。 

Spring Security使用DefaultSecurityParameterNameDiscoverer来发现参数名称。 

默认情况下，整体上尝试使用以下选项。

如果Spring Security的 `@P` 注释出现在该方法的单个参数上，则将使用该值。 

这对于使用JDK 8之前的JDK编译的接口非常有用，该接口不包含有关参数名称的任何信息。 

例如：

```java
import org.springframework.security.access.method.P;

...

@PreAuthorize("#c.name == authentication.name")
public void doSomething(@P("c") Contact contact);
```

在后台，这是使用AnnotationParameterNameDiscoverer实现的，可以对其进行自定义以支持任何指定注释的value属性。

如果该方法的至少一个参数上存在Spring Data的 `@Param` 批注，则将使用该值。 

这对于使用JDK 8之前的JDK编译的接口非常有用，该接口不包含有关参数名称的任何信息。 

例如：

```java
import org.springframework.data.repository.query.Param;

...

@PreAuthorize("#n == authentication.name")
Contact findContactByName(@Param("n") String name);
```

在后台，这是使用AnnotationParameterNameDiscoverer实现的，可以对其进行自定义以支持任何指定注释的value属性。

如果使用JDK 8和-parameters参数来编译源代码，并且使用Spring 4+，那么将使用标准JDK反射API来发现参数名称。 这适用于类和接口。

最后，如果代码是使用调试符号编译的，则将使用调试符号发现参数名称。 这对于接口不起作用，因为它们没有有关参数名称的调试信息。 对于接口，必须使用注释或JDK 8方法。

表达式中提供了任何Spring-EL功能，因此您也可以访问参数的属性。 

例如，如果您想要一种特定的方法仅允许访问其用户名与联系人的用户名匹配的用户，则可以编写

```java
@PreAuthorize("#contact.name == authentication.name")
public void doSomething(Contact contact);
```

在这里，我们将访问另一个内置表达式身份验证，这是存储在安全上下文中的身份验证。

您也可以使用表达式主体直接访问其“主要”属性。 

该值通常是UserDetails实例，因此您可以使用诸如principal.username或principal.enabled之类的表达式。

不太常见的是，您可能希望在调用方法之后执行访问控制检查。 

这可以使用 `@PostAuthorize` 批注来实现。 

要从方法访问返回值，请在表达式中使用内置名称returnObject。

## 使用@PreFilter和@PostFilter进行过滤

Spring Security支持使用表达式过滤集合，数组，映射和流。 这通常在方法的返回值上执行。 

例如：

```java
@PreAuthorize("hasRole('USER')")
@PostFilter("hasPermission(filterObject, 'read') or hasPermission(filterObject, 'admin')")
public List<Contact> getAll();
```

当使用@PostFilter注释时，Spring Security迭代返回的集合或映射，并删除提供的表达式为false的所有元素。 

对于数组，将返回一个包含过滤元素的新数组实例。 名称filterObject引用集合中的当前对象。 

如果使用地图，它将引用当前的Map.Entry对象，该对象允许在表达式中使用filterObject.key或filterObject.value。 

您也可以使用@PreFilter进行方法调用之前的过滤，尽管这是一个不太常见的要求。 

语法是一样的，但是如果有多个参数是集合类型，则必须使用此批注的filterTarget属性按名称选择一个。

请注意，筛选显然不能替代调整数据检索查询。 

如果要过滤大型集合并删除许多条目，则效率可能很低。

# 内置表达式

有一些特定于方法安全性的内置表达式，我们已经在上面的使用中看到过。 

filterTarget和returnValue值很简单，但是使用hasPermission（）表达式需要仔细观察。

## PermissionEvaluator界面

hasPermission（）表达式委托给PermissionEvaluator的实例。 

它旨在在表达式系统和Spring Security的ACL系统之间架起桥梁，使您可以基于抽象权限在域对象上指定授权约束。 

它对ACL模块没有明确的依赖关系，因此如果需要，您可以将其换成其他实现。 

该接口有两种方法：

```java
boolean hasPermission(Authentication authentication, Object targetDomainObject,
                            Object permission);

boolean hasPermission(Authentication authentication, Serializable targetId,
                            String targetType, Object permission);
```

它直接映射到表达式的可用版本，但不提供第一个参数（Authentication对象）。 

第一种方法用于已经控制访问的域对象已经加载的情况。 

如果当前用户对该对象具有给定的权限，则expression将返回true。 

第二种版本用于未加载对象但已知其标识符的情况。 

还需要域对象的抽象“类型”说明符，以允许加载正确的ACL权限。 

传统上，它是对象的Java类，但是不必与对象的权限加载方式一致。

要使用hasPermission（）表达式，必须在应用程序上下文中显式配置PermissionEvaluator。 

看起来像这样：

```xml
<security:global-method-security pre-post-annotations="enabled">
<security:expression-handler ref="expressionHandler"/>
</security:global-method-security>

<bean id="expressionHandler" class=
"org.springframework.security.access.expression.method.DefaultMethodSecurityExpressionHandler">
    <property name="permissionEvaluator" ref="myPermissionEvaluator"/>
</bean>
```

其中myPermissionEvaluator是实现PermissionEvaluator的bean。 

通常，这将是来自ACL模块（称为AclPermissionEvaluator）的实现。 

## 方法安全性元注释

您可以使用元注释来保证方法的安全性，以使代码更具可读性。 

如果发现在整个代码库中重复相同的复杂表达式，这将特别方便。 

例如，考虑以下内容：

```java
@PreAuthorize("#contact.name == authentication.name")
```

不必在所有地方重复此操作，我们可以创建一个可以用作替代的元注释。

```java
@Retention(RetentionPolicy.RUNTIME)
@PreAuthorize("#contact.name == authentication.name")
public @interface ContactPermission {}
```

元注释可以用于任何Spring Security方法安全注释。 

为了保持符合规范，JSR-250注释不支持元注释。

# 小结

希望本文对你有所帮助，如果喜欢，欢迎点赞收藏转发一波。

我是老马，期待与你的下次相遇。

# 参考资料

[https://docs.spring.io/spring-security/site/docs/5.4.2/reference/html5/#features](https://docs.spring.io/spring-security/site/docs/5.4.2/reference/html5/#features)

* any list
{:toc}