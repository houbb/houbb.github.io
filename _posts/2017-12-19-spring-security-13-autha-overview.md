---
layout: post
title:  Spring Security  Authorization 授权
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

# Authorization

Spring Security中的高级授权功能代表了其受欢迎程度的最令人信服的原因之一。 

无论选择哪种身份验证（使用Spring Security提供的机制和提供程序，还是与容器或其他非Spring Security身份验证机构集成），您都会发现可以在您的应用程序中一致且简单地使用授权服务。

在这一部分中，我们将探讨在第I部分中介绍的不同AbstractSecurityInterceptor实现。

然后，我们将继续探讨如何通过使用域访问控制列表来微调授权。

# Authorities

身份验证，讨论所有身份验证实现如何存储GrantedAuthority对象列表。 这些代表已授予委托人的权限。 

GrantedAuthority 对象由 AuthenticationManager 插入 Authentication 对象，并在以后做出授权决策时由AccessDecisionManager读取。

GrantedAuthority 是只有一种方法的接口：

```java
String getAuthority();
```

此方法使AccessDecisionManager可以获取GrantedAuthority的精确String表示形式。通过以字符串形式返回表示形式，大多数AccessDecisionManager都可以轻松地“读取” GrantedAuthority。

如果GrantedAuthority无法精确地表示为字符串，则GrantedAuthority被视为“复杂”，并且getAuthority（）必须返回null。

“复杂” GrantedAuthority的示例是一种实现，该实现存储适用于不同客户帐号的一系列操作和权限阈值。将这种复杂的GrantedAuthority表示为String会非常困难，因此getAuthority（）方法应返回null。这将向任何AccessDecisionManager指示它将需要专门支持GrantedAuthority实现，以便理解其内容。

Spring Security包含一个具体的GrantedAuthority实现，即SimpleGrantedAuthority。这允许将任何用户指定的String转换为GrantedAuthority。

安全体系结构中包含的所有AuthenticationProvider都使用SimpleGrantedAuthority来填充Authentication对象。

# 调用前处理

Spring Security提供了拦截器，用于控制对安全对象的访问，例如方法调用或Web请求。 

AccessDecisionManager会做出关于是否允许进行调用的预调用决定。

## AccessDecisionManager

AccessDecisionManager由AbstractSecurityInterceptor调用，并负责做出最终的访问控制决策。 

AccessDecisionManager接口包含三种方法：

```java
void decide(Authentication authentication, Object secureObject,
    Collection<ConfigAttribute> attrs) throws AccessDeniedException;

boolean supports(ConfigAttribute attribute);

boolean supports(Class clazz);
```

AccessDecisionManager的define方法被传递给它进行授权决策所需的所有相关信息。

特别是，通过传递安全对象，可以检查实际安全对象调用中包含的那些参数。

例如，假设安全对象是MethodInvocation。在MethodInvocation中查询任何Customer参数，然后在AccessDecisionManager中实现某种安全性逻辑以确保允许主体对该客户进行操作将很容易。

如果访问被拒绝，则预期实现将引发AccessDeniedException。

在启动时，AbstractSecurityInterceptor将调用support（ConfigAttribute）方法，以确定AccessDecisionManager是否可以处理传递的ConfigAttribute。

安全拦截器实现调用 support（Class） 方法，以确保配置的AccessDecisionManager支持安全拦截器将显示的安全对象的类型。

## 基于投票的访问决策

尽管用户可以实现自己的AccessDecisionManager来控制授权的各个方面，但是Spring Security包括几种基于投票的AccessDecisionManager实现。 

投票决策管理器说明了相关的类。

![Figure 11. Voting Decision Manager](https://docs.spring.io/spring-security/site/docs/5.4.2/reference/html5/images/access-decision-voting.png)

使用此方法，将根据授权决策轮询一系列AccessDecisionVoter实现。

然后，AccessDecisionManager根据对投票的评估来决定是否引发AccessDeniedException。

AccessDecisionVoter接口具有三种方法：

```java
int vote(Authentication authentication, Object object, Collection<ConfigAttribute> attrs);

boolean supports(ConfigAttribute attribute);

boolean supports(Class clazz);
```

具体的实现返回一个int，可能的值反映在AccessDecisionVoter静态字段ACCESS_ABSTAIN，ACCESS_DENIED和ACCESS_GRANTED中。

如果有投票权的实施对授权决策没有意见，则将返回ACCESS_ABSTAIN。如果确实有意见，则必须返回ACCESS_DENIED或ACCESS_GRANTED。

Spring Security提供了三个具体的AccessDecisionManager来对选票进行汇总。基于ConsensusBased的实现将基于非弃权票的共识来授予或拒绝访问权限。提供属性以控制在票数相等或所有票都弃权的情况下的行为。

如果收到一个或多个ACCESS_GRANTED投票，则AffirmativeBased实现将授予访问权限（即，如果至少有一个授予投票，则拒绝投票将被忽略）。

像基于ConsensusBased的实现一样，有一个参数可以控制所有选民的弃权行为。 

UnanimousBased提供程序希望获得一致的ACCESS_GRANTED投票才能授予访问权限，而忽略弃权。

如果有任何ACCESS_DENIED投票，它将拒绝访问。像其他实现一样，如果所有投票者都弃权，则有一个控制行为的参数。

可以实现一个自定义AccessDecisionManager来计算票数。

例如，来自特定AccessDecisionVoter的投票可能会获得其他权重，而来自特定选民的拒绝投票可能会产生否决权。

## RoleVoter

Spring Security提供的最常用的AccessDecisionVoter是简单的RoleVoter，它将配置属性视为简单的角色名称和投票，以在授予用户该角色后授予访问权限。

如果任何ConfigAttribute以前缀ROLE_开头，它将进行投票。如果存在GrantedAuthority可以返回一个字符串表示形式（通过getAuthority（）方法），该字符串表示形式完全等于一个或多个以前缀ROLE_开头的ConfigAttributes，则它将投票授予访问权限。如果没有任何与ROLE_开头的ConfigAttribute完全匹配的结果，则RoleVoter会投票拒绝访问。

如果没有ConfigAttribute以ROLE_开头，则投票者将弃权。

## AuthenticatedVoter

我们暗中看到的另一个投票者是AuthenticatedVoter，它可用于区分匿名，完全认证和记住我的认证用户。

许多站点允许使用“记住我”身份验证进行某些受限访问，但是要求用户通过登录以进行完全访问来确认其身份。

当我们使用属性IS_AUTHENTICATED_ANONYMOUSLY授予匿名访问权限时，此属性已由AuthenticatedVoter处理。

## 定制选民

显然，您还可以实现一个自定义的AccessDecisionVoter，并且可以在其中放入几乎任何所需的访问控制逻辑。

它可能特定于您的应用程序（与业务逻辑有关），也可能实现某些安全管理逻辑。

例如，您可以在Spring网站上找到一篇博客文章，其中描述了如何使用投票器实时拒绝帐户被暂停的用户的实时访问。


# 调用处理后

虽然在进行安全对象调用之前AbstractSecurityInterceptor会调用AccessDecisionManager，但某些应用程序需要一种方法来修改安全对象调用实际返回的对象。 

尽管您可以轻松实现自己的AOP问题来实现这一目标，但是Spring Security提供了一个方便的挂钩，该挂钩具有一些与其ACL功能集成的具体实现。

After Invocation Implementation说明了Spring Security的AfterInvocationManager及其具体实现。

![Figure 12. After Invocation Implementation](https://docs.spring.io/spring-security/site/docs/5.4.2/reference/html5/images/after-invocation.png)

像Spring Security的许多其他部分一样，AfterInvocationManager有一个具体的实现AfterInvocationProviderManager，它轮询AfterInvocationProvider的列表。

每个AfterInvocationProvider都可以修改返回对象或引发AccessDeniedException。

实际上，由于前一个提供程序的结果将传递到列表中的下一个，因此多个提供程序可以修改该对象。

请注意，如果您使用的是AfterInvocationManager，则仍然需要允许MethodSecurityInterceptor的AccessDecisionManager进行操作的配置属性。

如果您使用的是典型的Spring Security随附的AccessDecisionManager实现，则未为特定的安全方法调用定义配置属性，这将导致每个AccessDecisionVoter放弃投票。

反过来，如果AccessDecisionManager属性“ allowIfAllAbstainDecisions”为false，则将引发AccessDeniedException。

您可以通过（i）将“ allowIfAllAbstainDecisions”设置为true（尽管通常不建议这样做）或（ii）仅确保至少有一个配置属性可供AccessDecisionVoter投票批准授予访问权限来避免此潜在问题。

后一种（推荐）方法通常是通过ROLE_USER或ROLE_AUTHENTICATED配置属性来实现的。

# 层次角色

通常要求应用程序中的特定角色应自动“包括”其他角色。 

例如，在具有“管理员”和“用户”角色概念的应用程序中，您可能希望管理员能够执行普通用户可以执行的所有操作。 

为此，您可以确保还为所有管理员用户分配了“用户”角色。 

或者，您可以修改每个需要“用户”角色也要包括“管理员”角色的访问约束。 

如果您的应用程序中有很多不同的角色，这可能会变得非常复杂。

使用角色层次结构可让您配置哪些角色（或权限）应包括其他角色。 

Spring Security的RoleVoter的扩展版本RoleHierarchyVoter配置有RoleHierarchy，从中可以获取分配给用户的所有“可访问权限”。 

典型的配置可能如下所示：

```xml
<bean id="roleVoter" class="org.springframework.security.access.vote.RoleHierarchyVoter">
    <constructor-arg ref="roleHierarchy" />
</bean>
<bean id="roleHierarchy"
        class="org.springframework.security.access.hierarchicalroles.RoleHierarchyImpl">
    <property name="hierarchy">
        <value>
            ROLE_ADMIN > ROLE_STAFF
            ROLE_STAFF > ROLE_USER
            ROLE_USER > ROLE_GUEST
        </value>
    </property>
</bean>
```

在这里，我们在层次结构ROLE_ADMIN⇒ROLE_STAFF⇒ROLE_USER⇒ROLE_GUEST中具有四个角色。 

当对使用上述RoleHierarchyVoter配置的AccessDecisionManager评估安全约束时，使用ROLE_ADMIN进行身份验证的用户将表现为具有四个角色。 

可以将 `>` 符号视为“包含”。

角色层次结构为简化应用程序的访问控制配置数据和/或减少需要分配给用户的权限数量提供了一种方便的方法。 

对于更复杂的要求，您可能希望在应用程序需要的特定访问权限与分配给用户的角色之间定义逻辑映射，并在加载用户信息时在两者之间进行转换。

# 小结

希望本文对你有所帮助，如果喜欢，欢迎点赞收藏转发一波。

我是老马，期待与你的下次相遇。

# 参考资料

[https://docs.spring.io/spring-security/site/docs/5.4.2/reference/html5/#features](https://docs.spring.io/spring-security/site/docs/5.4.2/reference/html5/#features)

* any list
{:toc}