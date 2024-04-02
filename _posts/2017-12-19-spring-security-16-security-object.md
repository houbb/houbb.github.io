---
layout: post
title:  Spring Security  Authorization 安全对象实施
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

# 安全对象实施

## AOP联盟（方法调用）安全拦截器

在Spring Security 2.0之前，确保MethodInvocation的安全需要大量样板配置。

现在，推荐的方法安全性方法是使用名称空间配置。

这样，方法安全性基础结构bean会自动为您配置，因此您实际上不需要了解实施类。我们将仅简要介绍此处涉及的课程。

方法安全性是使用MethodSecurityInterceptor实施的，该方法可以保护MethodInvocation。

根据配置方法，拦截器可能特定于单个bean，也可能在多个bean之间共享。

拦截器使用MethodSecurityMetadataSource实例获取适用于特定方法调用的配置属性。 

MapBasedMethodSecurityMetadataSource用于存储以方法名称作为键的配置属性（可以使用通配符），当使用 `<intercept-methods>` 或 `<protect-point>` 元素在应用程序上下文中定义属性时，将在内部使用该属性。

其他实现将用于处理基于注释的配置。


## 显式方法SecurityInterceptor配置

当然，您可以直接在应用程序上下文中配置MethodSecurityInterceptor，以与Spring AOP的代理机制之一配合使用：

```xml
<bean id="bankManagerSecurity" class=
    "org.springframework.security.access.intercept.aopalliance.MethodSecurityInterceptor">
<property name="authenticationManager" ref="authenticationManager"/>
<property name="accessDecisionManager" ref="accessDecisionManager"/>
<property name="afterInvocationManager" ref="afterInvocationManager"/>
<property name="securityMetadataSource">
    <sec:method-security-metadata-source>
    <sec:protect method="com.mycompany.BankManager.delete*" access="ROLE_SUPERVISOR"/>
    <sec:protect method="com.mycompany.BankManager.getBalance" access="ROLE_TELLER,ROLE_SUPERVISOR"/>
    </sec:method-security-metadata-source>
</property>
</bean>
```

# AspectJ（JoinPoint）安全拦截器

AspectJ安全拦截器与上一节中讨论的AOP Alliance安全拦截器非常相似。 

实际上，我们将仅讨论本节中的区别。

AspectJ拦截器被命名为AspectJSecurityInterceptor。

与依赖于Spring应用程序上下文通过代理编织在安全拦截器中的AOP Alliance安全拦截器不同，AspectJSecurityInterceptor通过AspectJ编译器进行编织。 

在同一个应用程序中同时使用两种类型的安全拦截器并不少见，其中AspectJSecurityInterceptor用于域对象实例安全，而AOP Alliance MethodSecurityInterceptor用于服务层安全。

首先，让我们考虑如何在Spring应用程序上下文中配置AspectJSecurityInterceptor：

```xml
<bean id="bankManagerSecurity" class=
    "org.springframework.security.access.intercept.aspectj.AspectJMethodSecurityInterceptor">
<property name="authenticationManager" ref="authenticationManager"/>
<property name="accessDecisionManager" ref="accessDecisionManager"/>
<property name="afterInvocationManager" ref="afterInvocationManager"/>
<property name="securityMetadataSource">
    <sec:method-security-metadata-source>
    <sec:protect method="com.mycompany.BankManager.delete*" access="ROLE_SUPERVISOR"/>
    <sec:protect method="com.mycompany.BankManager.getBalance" access="ROLE_TELLER,ROLE_SUPERVISOR"/>
    </sec:method-security-metadata-source>
</property>
</bean>
```

如您所见，除了类名外，AspectJSecurityInterceptor与AOP Alliance安全拦截器完全相同。 

确实，这两个拦截器可以共享相同的securityMetadataSource，因为SecurityMetadataSource与java.lang.reflect.Method一起使用，而不是与AOP库特定的类一起使用。 

当然，您的访问决策可以访问特定于AOP库的相关调用（即MethodInvocation或JoinPoint），因此在制定访问决策（例如方法参数）时可以考虑一系列附加条件。

接下来，您需要定义AspectJ方面。 

例如：


```java
package org.springframework.security.samples.aspectj;

import org.springframework.security.access.intercept.aspectj.AspectJSecurityInterceptor;
import org.springframework.security.access.intercept.aspectj.AspectJCallback;
import org.springframework.beans.factory.InitializingBean;

public aspect DomainObjectInstanceSecurityAspect implements InitializingBean {

    private AspectJSecurityInterceptor securityInterceptor;

    pointcut domainObjectInstanceExecution(): target(PersistableEntity)
        && execution(public * *(..)) && !within(DomainObjectInstanceSecurityAspect);

    Object around(): domainObjectInstanceExecution() {
        if (this.securityInterceptor == null) {
            return proceed();
        }

        AspectJCallback callback = new AspectJCallback() {
            public Object proceedWithObject() {
                return proceed();
            }
        };

        return this.securityInterceptor.invoke(thisJoinPoint, callback);
    }

    public AspectJSecurityInterceptor getSecurityInterceptor() {
        return securityInterceptor;
    }

    public void setSecurityInterceptor(AspectJSecurityInterceptor securityInterceptor) {
        this.securityInterceptor = securityInterceptor;
    }

    public void afterPropertiesSet() throws Exception {
        if (this.securityInterceptor == null)
            throw new IllegalArgumentException("securityInterceptor required");
        }
    }
}
```

在上面的示例中，安全拦截器将应用于PersistableEntity的每个实例，这是一个未显示的抽象类（您可以使用喜欢的任何其他类或切入点表达式）。 

对于那些好奇的人，需要使用AspectJCallback，因为proced（）; 语句仅在around（）主体内具有特殊含义。 

当希望目标对象继续时，AspectJSecurityInterceptor会调用此匿名AspectJCallback类。

您将需要配置Spring以加载方面并将其与AspectJSecurityInterceptor关联。 

实现此目的的bean声明如下所示：

```xml
<bean id="domainObjectInstanceSecurityAspect"
    class="security.samples.aspectj.DomainObjectInstanceSecurityAspect"
    factory-method="aspectOf">
<property name="securityInterceptor" ref="bankManagerSecurity"/>
</bean>
```

就是如此简单！

现在，您可以使用自己认为合适的任何方式（例如new Person（）;）从应用程序中的任何位置创建bean，并且将应用安全拦截器。


# 小结

希望本文对你有所帮助，如果喜欢，欢迎点赞收藏转发一波。

我是老马，期待与你的下次相遇。

# 参考资料

[https://docs.spring.io/spring-security/site/docs/5.4.2/reference/html5/#features](https://docs.spring.io/spring-security/site/docs/5.4.2/reference/html5/#features)

* any list
{:toc}