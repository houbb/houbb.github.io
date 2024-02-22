---
layout: post
title: Shiro-09-shiro 整合 spring 实战及源码详解
date:  2016-8-11 09:38:24 +0800
categories: [Web]
tags: [shiro, web, web-security]
published: true
---

# 序言

前面我们学习了如下内容：

[5 分钟入门 shiro 安全框架实战笔记](https://www.toutiao.com/i6910927630845919756/)

[shiro 整合 spring 实战及源码详解](https://houbb.github.io/2016/08/11/shiro-20-intergrations-spring)

相信大家对于 shiro 已经有了最基本的认识，这一节我们一起来学习写如何将 shiro 与 spring 进行整合。

# spring 整合

## maven 依赖

```xml
<dependencies>
    <dependency>
        <groupId>org.apache.shiro</groupId>
        <artifactId>shiro-spring</artifactId>
        <version>1.7.0</version>
    </dependency>
    <dependency>
        <groupId>org.springframework</groupId>
        <artifactId>spring-context</artifactId>
        <version>4.3.13.RELEASE</version>
    </dependency>
</dependencies>
```

## 服务类定义

定义一个简单的服务类，用于演示 `@RequiresPermissions` 注解的权限校验。

```java
package com.github.houbb.shiro.inaction02.springalone;

import org.apache.shiro.authz.annotation.RequiresPermissions;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;

/**
 * Simple Service with methods protected with annotations.
 */
@Component
public class SimpleService {

    private static Logger log = LoggerFactory.getLogger(SimpleService.class);

    @RequiresPermissions("write")
    public void writeRestrictedCall() {
        log.info("executing method that requires the 'write' permission");
    }

    @RequiresPermissions("read")
    public void readRestrictedCall() {
        log.info("executing method that requires the 'read' permission");
    }
}
```

## 快速开始

我们对原来的 Quick Start 进行改造如下：

```java
package com.github.houbb.shiro.inaction02.springalone;

import org.apache.shiro.SecurityUtils;
import org.apache.shiro.authc.UsernamePasswordToken;
import org.apache.shiro.authz.AuthorizationException;
import org.apache.shiro.mgt.SecurityManager;
import org.apache.shiro.subject.Subject;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import javax.annotation.PostConstruct;

/**
 * Simple Bean used to demonstrate subject usage.
 */
@Component
public class QuickStart {

    private static Logger log = LoggerFactory.getLogger(QuickStart.class);

    @Autowired
    private SecurityManager securityManager;

    @Autowired
    private SimpleService simpleService;

    /**
     * Sets the static instance of SecurityManager. This is NOT needed for web applications.
     */
    @PostConstruct
    private void initStaticSecurityManager() {
        SecurityUtils.setSecurityManager(securityManager);
    }

    public void run() {
        // get the current subject
        Subject subject = SecurityUtils.getSubject();

        // Subject is not authenticated yet
        System.out.println(!subject.isAuthenticated());

        // login the subject with a username / password
        UsernamePasswordToken token = new UsernamePasswordToken("joe.coder", "password");
        subject.login(token);

        // joe.coder has the "user" role
        subject.checkRole("user");

        // joe.coder does NOT have the admin role
        System.out.println(!subject.hasRole("admin"));

        // joe.coder has the "read" permission
        subject.checkPermission("read");

        // current user is allowed to execute this method.
        simpleService.readRestrictedCall();

        try {
            // but not this one!
            simpleService.writeRestrictedCall();
        }
        catch (AuthorizationException e) {
            log.info("Subject was NOT allowed to execute method 'writeRestrictedCall'");
        }

        // logout
        subject.logout();
        System.out.println(!subject.isAuthenticated());
    }

}
```

这里最核心的区别是 `SecurityManager` 是直接通过 `@Autowired` 注入得到的。

也没有看到我们以前初始化 SecurityManager 的 ini 文件，这些在下面的配置文件中。

## 配置类

```java
package com.github.houbb.shiro.inaction02.springalone;

import org.apache.shiro.realm.Realm;
import org.apache.shiro.realm.text.TextConfigurationRealm;
import org.apache.shiro.spring.config.ShiroAnnotationProcessorConfiguration;
import org.apache.shiro.spring.config.ShiroBeanConfiguration;
import org.apache.shiro.spring.config.ShiroConfiguration;
import org.springframework.context.annotation.*;

/**
 * Application bean definitions.
 */
@Configuration
@Import({ShiroBeanConfiguration.class,
         ShiroConfiguration.class,
         ShiroAnnotationProcessorConfiguration.class})
@ComponentScan("com.github.houbb.shiro.inaction02.springalone")
public class CliApp {

    /**
     * Example hard coded Realm bean.
     * @return hard coded Realm bean
     */
    @Bean
    public Realm realm() {
        TextConfigurationRealm realm = new TextConfigurationRealm();
        realm.setUserDefinitions("joe.coder=password,user\n" +
                                 "jill.coder=password,admin");

        realm.setRoleDefinitions("admin=read,write\n" +
                                 "user=read");
        realm.setCachingEnabled(true);
        return realm;
    }

}
```

这里通过 `@Bean` 的方式声明了用户角色等信息，可以简单理解为和 Ini 文件初始化是等价的。

`@Import` 导入了 3 个配置类，我们后面进行介绍。

## 启动

spring 应用的启动：

```java
public static void main(String[] args) {
    AnnotationConfigApplicationContext context = new AnnotationConfigApplicationContext(CliApp.class);
    context.getBean(QuickStart.class).run();
}
```

测试日志如下：

```java
十二月 31, 2020 10:33:02 上午 org.springframework.context.annotation.AnnotationConfigApplicationContext prepareRefresh
信息: Refreshing org.springframework.context.annotation.AnnotationConfigApplicationContext@6267c3bb: startup date [Thu Dec 31 10:33:02 CST 2020]; root of context hierarchy
十二月 31, 2020 10:33:03 上午 org.springframework.context.support.PostProcessorRegistrationDelegate$BeanPostProcessorChecker postProcessAfterInitialization
信息: Bean 'org.apache.shiro.spring.config.ShiroBeanConfiguration' of type [org.apache.shiro.spring.config.ShiroBeanConfiguration$$EnhancerBySpringCGLIB$$fbe016b3] is not eligible for getting processed by all BeanPostProcessors (for example: not eligible for auto-proxying)
...
信息: Bean 'org.apache.shiro.spring.config.ShiroAnnotationProcessorConfiguration' of type [org.apache.shiro.spring.config.ShiroAnnotationProcessorConfiguration$$EnhancerBySpringCGLIB$$f9d46e86] is not eligible for getting processed by all BeanPostProcessors (for example: not eligible for auto-proxying)
十二月 31, 2020 10:33:03 上午 org.springframework.context.support.PostProcessorRegistrationDelegate$BeanPostProcessorChecker postProcessAfterInitialization
信息: Bean 'eventBus' of type [org.apache.shiro.event.support.DefaultEventBus] is not eligible for getting processed by all BeanPostProcessors (for example: not eligible for auto-proxying)
十二月 31, 2020 10:33:03 上午 org.springframework.context.support.PostProcessorRegistrationDelegate$BeanPostProcessorChecker postProcessAfterInitialization
信息: Bean 'org.apache.shiro.spring.config.ShiroConfiguration' of type [org.apache.shiro.spring.config.ShiroConfiguration$$EnhancerBySpringCGLIB$$3db21503] is not eligible for getting processed by all BeanPostProcessors (for example: not eligible for auto-proxying)
...
true
true
true
```

# ShiroBeanConfiguration 配置类

`@Import` 共计导入了 3 个配置类，我们接下来逐一分析下这 3 个配置类。

## 源码

```java
@Configuration
public class ShiroBeanConfiguration extends AbstractShiroBeanConfiguration {

    @Bean
    @Override
    public LifecycleBeanPostProcessor lifecycleBeanPostProcessor() {
        return super.lifecycleBeanPostProcessor();
    }

    @Bean
    @Override
    protected EventBus eventBus() {
        return super.eventBus();
    }

    @Bean
    @Override
    public ShiroEventBusBeanPostProcessor shiroEventBusAwareBeanPostProcessor() {
        return super.shiroEventBusAwareBeanPostProcessor();
    }
}
```

这 3 个方法都是继承自父类，直接调用的父类方法。

- AbstractShiroBeanConfiguration.java

```java
public class AbstractShiroBeanConfiguration {

    protected LifecycleBeanPostProcessor lifecycleBeanPostProcessor() {
        return new LifecycleBeanPostProcessor();
    }

    protected EventBus eventBus() {
        return new DefaultEventBus();
    }

    protected ShiroEventBusBeanPostProcessor shiroEventBusAwareBeanPostProcessor() {
        return new ShiroEventBusBeanPostProcessor(eventBus());
    }
}
```

实际上这里初始化了 3 个对象：LifecycleBeanPostProcessor/DefaultEventBus/ShiroEventBusBeanPostProcessor。

## LifecycleBeanPostProcessor

这个类实际上比较简单，主要做了 2 件事情。

（1）执行 init() 和 destory()。

（2）指定对应的优先级，默认为最低。

核心部分如下：

- init 初始化

```java
public Object postProcessBeforeInitialization(Object object, String name) throws BeansException {
    if (object instanceof Initializable) {
        try {
            if (log.isDebugEnabled()) {
                log.debug("Initializing bean [" + name + "]...");
            }
            ((Initializable) object).init();
        } catch (Exception e) {
            throw new FatalBeanException("Error initializing bean [" + name + "]", e);
        }
    }
    return object;
}
```

- destory 销毁

```java
public void postProcessBeforeDestruction(Object object, String name) throws BeansException {
    if (object instanceof Destroyable) {
        try {
            if (log.isDebugEnabled()) {
                log.debug("Destroying bean [" + name + "]...");
            }
            ((Destroyable) object).destroy();
        } catch (Exception e) {
            throw new FatalBeanException("Error destroying bean [" + name + "]", e);
        }
    }
}
```

## DefaultEventBus

这个类如其名，就是默认的事件总线类。

接口的如下：

```java
public interface EventBus {
    void publish(Object var1);

    void register(Object var1);

    void unregister(Object var1);
}
```

分别对应的是事件的发布，注册和取消注册。

实现部分实际就是调用对应的 EventListener 类，并且通过读写锁保证并发安全，暂时不做展开。

## ShiroEventBusBeanPostProcessor

这个类实际上是配合 EventBus 使用的，核心实现如下：

```java
public class ShiroEventBusBeanPostProcessor implements BeanPostProcessor {

    final private EventBus eventBus;

    public ShiroEventBusBeanPostProcessor(EventBus eventBus) {
        this.eventBus = eventBus;
    }

    @Override
    public Object postProcessAfterInitialization(Object bean, String beanName) throws BeansException {
        //1. 如果实现了 EventBusAware 接口
        if (bean instanceof EventBusAware) {
            ((EventBusAware) bean).setEventBus(eventBus);
        }
        //2. 如果有 Subscribe 注解信息
        else if (isEventSubscriber(bean)) {
            eventBus.register(bean);
        }

        return bean;
    }

}
```

这里会把实现了 EventBusAware 接口，和指定了 `@Subscribe` 注解的对象，注解对应的 eventbus。


# ShiroConfiguration 配置

## 思考

我们 QuickStart 中自动注入了 `SecurityManager` 对象，这个对象是在哪里初始化的呢？

## 核心源码

核心部分如下：

```java
@Configuration
@Import({ShiroBeanConfiguration.class})
public class ShiroConfiguration extends AbstractShiroConfiguration {

    @Bean
    @Override
    protected SessionsSecurityManager securityManager(List<Realm> realms) {
        return super.securityManager(realms);
    }

    @Bean
    @Override
    protected SessionManager sessionManager() {
        return super.sessionManager();
    }

    //... 省略其他组件
}
```

这里可以发现实际上已经导入了 ShiroBeanConfiguration 配置类，所以官方的 demo 可以简化如下：

```java
@Configuration
@Import({ShiroConfiguration.class,
         ShiroAnnotationProcessorConfiguration.class})
@ComponentScan("com.github.houbb.shiro.inaction02.springalone")
public class CliApp{}
```

实际测试了一下，也是通过的。

## SecurityManager 初始化

我简单的看了下 SecurityManager 实现子类还是比较多得。断点可以发现默认的类型是 `DefaultSecurityManager`。

这些都可以在 `AbstractShiroConfiguration` 类中找到答案。

- AbstractShiroConfiguration.java

核心实现如下：

```java
public class AbstractShiroConfiguration {

    @Autowired
    protected EventBus eventBus;

    protected SessionsSecurityManager securityManager(List<Realm> realms) {
        SessionsSecurityManager securityManager = createSecurityManager();
        securityManager.setEventBus(eventBus);
        
        // 省略其他属性设置
        return securityManager;
    }

    protected SessionsSecurityManager createSecurityManager() {
        DefaultSecurityManager securityManager = new DefaultSecurityManager();
        securityManager.setSubjectDAO(subjectDAO());
        securityManager.setSubjectFactory(subjectFactory());

        RememberMeManager rememberMeManager = rememberMeManager();
        if (rememberMeManager != null) {
            securityManager.setRememberMeManager(rememberMeManager);
        }

        return securityManager;
    }

}
```

`securityManager(List<Realm> realms)` 方法会把我们 CliApp 中定义的 Realm 对象当作参数传入。

createSecurityManager() 方法就会初始化 `DefaultSecurityManager` 对象。

# ShiroAnnotationProcessorConfiguration 配置

## 思考

我们在 SampleService 中使用了注解 `@RequiresPermissions("write")`，就可以校验对应的权限了。

但是这一切是如何被自动实现的呢？

## 源码

```java
@Configuration
public class ShiroAnnotationProcessorConfiguration extends AbstractShiroAnnotationProcessorConfiguration{

    @Bean
    @DependsOn("lifecycleBeanPostProcessor")
    protected DefaultAdvisorAutoProxyCreator defaultAdvisorAutoProxyCreator() {
        return super.defaultAdvisorAutoProxyCreator();
    }

    @Bean
    protected AuthorizationAttributeSourceAdvisor authorizationAttributeSourceAdvisor(SecurityManager securityManager) {
        return super.authorizationAttributeSourceAdvisor(securityManager);
    }

}
```

本身没有什么源码，主要看下父类。

## AbstractShiroAnnotationProcessorConfiguration

```java
public class AbstractShiroAnnotationProcessorConfiguration {

    protected DefaultAdvisorAutoProxyCreator defaultAdvisorAutoProxyCreator() {
        return new DefaultAdvisorAutoProxyCreator();
    }

    protected AuthorizationAttributeSourceAdvisor authorizationAttributeSourceAdvisor(SecurityManager securityManager) {
        AuthorizationAttributeSourceAdvisor advisor = new AuthorizationAttributeSourceAdvisor();
        advisor.setSecurityManager(securityManager);
        return advisor;
    }

}
```

`DefaultAdvisorAutoProxyCreator` 是 spring 中的自动代理实现类，此处不做展开。

我们重点看一下 `AuthorizationAttributeSourceAdvisor` 对象：

### AuthorizationAttributeSourceAdvisor

这里主要做了两件事：

（1）设置对应的 securityManager

（2）处理有 `RequiresPermissions` 等 shiro 的内置注解的方法。

```java
@SuppressWarnings({"unchecked"})
public class AuthorizationAttributeSourceAdvisor extends StaticMethodMatcherPointcutAdvisor {

    private static final Logger log = LoggerFactory.getLogger(AuthorizationAttributeSourceAdvisor.class);

    private static final Class<? extends Annotation>[] AUTHZ_ANNOTATION_CLASSES =
            new Class[] {
                    RequiresPermissions.class, RequiresRoles.class,
                    RequiresUser.class, RequiresGuest.class, RequiresAuthentication.class
            };

    protected SecurityManager securityManager = null;

    /**
     * Create a new AuthorizationAttributeSourceAdvisor.
     */
    public AuthorizationAttributeSourceAdvisor() {
        setAdvice(new AopAllianceAnnotationsAuthorizingMethodInterceptor());
    }

    public SecurityManager getSecurityManager() {
        return securityManager;
    }

    public void setSecurityManager(org.apache.shiro.mgt.SecurityManager securityManager) {
        this.securityManager = securityManager;
    }

}
```

### AopAllianceAnnotationsAuthorizingMethodInterceptor

这个名字起的，好家伙，真长。

这里就是对于注解的响应方法 aop 拦截器实现。

```java
package org.apache.shiro.spring.security.interceptor;

import org.aopalliance.intercept.MethodInterceptor;
import org.aopalliance.intercept.MethodInvocation;
import org.apache.shiro.aop.AnnotationResolver;
import org.apache.shiro.authz.aop.*;
import org.apache.shiro.spring.aop.SpringAnnotationResolver;

import java.lang.reflect.Method;
import java.util.ArrayList;
import java.util.List;

/**
 * Allows Shiro Annotations to work in any <a href="http://aopalliance.sourceforge.net/">AOP Alliance</a>
 * specific implementation environment (for example, Spring).
 *
 * @since 0.2
 */
public class AopAllianceAnnotationsAuthorizingMethodInterceptor
        extends AnnotationsAuthorizingMethodInterceptor implements MethodInterceptor {

    public AopAllianceAnnotationsAuthorizingMethodInterceptor() {
        List<AuthorizingAnnotationMethodInterceptor> interceptors =
                new ArrayList<AuthorizingAnnotationMethodInterceptor>(5);

        //use a Spring-specific Annotation resolver - Spring's AnnotationUtils is nicer than the
        //raw JDK resolution process.
        AnnotationResolver resolver = new SpringAnnotationResolver();
        //we can re-use the same resolver instance - it does not retain state:
        interceptors.add(new RoleAnnotationMethodInterceptor(resolver));
        interceptors.add(new PermissionAnnotationMethodInterceptor(resolver));
        interceptors.add(new AuthenticatedAnnotationMethodInterceptor(resolver));
        interceptors.add(new UserAnnotationMethodInterceptor(resolver));
        interceptors.add(new GuestAnnotationMethodInterceptor(resolver));

        setMethodInterceptors(interceptors);
    }
    
    //省略 invoke 部分
}
```

到这里实际上就比较简单了，相信聪明如你一定已经知道整个 spring-shiro 面纱背后的秘密了。

我们直接看一下 `PermissionAnnotationMethodInterceptor` 的实现。

### PermissionAnnotationMethodInterceptor

```java
import org.apache.shiro.aop.AnnotationResolver;

public class PermissionAnnotationMethodInterceptor extends AuthorizingAnnotationMethodInterceptor {

    public PermissionAnnotationMethodInterceptor() {
        super( new PermissionAnnotationHandler() );
    }

    /**
     * @param resolver
     * @since 1.1
     */
    public PermissionAnnotationMethodInterceptor(AnnotationResolver resolver) {
        super( new PermissionAnnotationHandler(), resolver);
    }
}
```

处理类实现如下：

```java
package org.apache.shiro.authz.aop;

import org.apache.shiro.authz.AuthorizationException;
import org.apache.shiro.authz.annotation.Logical;
import org.apache.shiro.authz.annotation.RequiresPermissions;
import org.apache.shiro.authz.annotation.RequiresRoles;
import org.apache.shiro.subject.Subject;

import java.lang.annotation.Annotation;


public class PermissionAnnotationHandler extends AuthorizingAnnotationHandler {

    public PermissionAnnotationHandler() {
        super(RequiresPermissions.class);
    }

    
    // 获取对应的注解值
    protected String[] getAnnotationValue(Annotation a) {
        RequiresPermissions rpAnnotation = (RequiresPermissions) a;
        return rpAnnotation.value();
    }

    // 校验当前主题，是否拥有对应的权限。
    public void assertAuthorized(Annotation a) throws AuthorizationException {
        if (!(a instanceof RequiresPermissions)) return;

        RequiresPermissions rpAnnotation = (RequiresPermissions) a;
        String[] perms = getAnnotationValue(a);
        Subject subject = getSubject();

        if (perms.length == 1) {
            subject.checkPermission(perms[0]);
            return;
        }
        if (Logical.AND.equals(rpAnnotation.logical())) {
            getSubject().checkPermissions(perms);
            return;
        }
        if (Logical.OR.equals(rpAnnotation.logical())) {
            // Avoid processing exceptions unnecessarily - "delay" throwing the exception by calling hasRole first
            boolean hasAtLeastOnePermission = false;
            for (String permission : perms) if (getSubject().isPermitted(permission)) hasAtLeastOnePermission = true;
            // Cause the exception if none of the role match, note that the exception message will be a bit misleading
            if (!hasAtLeastOnePermission) getSubject().checkPermission(perms[0]);
            
        }
    }
}
```

# 小结

这一节我们讲解了如何整合 spring 与 shiro，下一节我们将实战整合 springboot 与 shiro，感兴趣的小伙伴可以关注一波不迷路。

为了便于大家学习，所有源码都已开源：

> [https://gitee.com/houbinbin/shiro-inaction/tree/master/shiro-inaction-02-springalone](https://gitee.com/houbinbin/shiro-inaction/tree/master/shiro-inaction-02-springalone)

希望本文对你有所帮助，如果喜欢，欢迎点赞收藏转发一波。

我是老马，期待与你的下次相遇。

# 参考资料

[10 Minute Tutorial on Apache Shiro](https://shiro.apache.org/10-minute-tutorial.html)

https://shiro.apache.org/reference.html

https://shiro.apache.org/session-management.html

* any list
{:toc}