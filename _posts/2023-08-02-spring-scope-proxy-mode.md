---
layout: post
title: spring @Scope 注解与 ScopedProxyMode 入门介绍
date:  2023-08-02 +0800
categories: [Spring]
tags: [spring, aop, cglib, sh]
published: true
---

# 背景

今天看到了 `@Scope` 用来可以指定 spring 的代码模式，比如指定基于动态代理，这个挺不错的。

记录一下，以前学习过，但是没有注意过。

# 源码

## @Scope 注解

```java
@Target({ElementType.TYPE, ElementType.METHOD})
@Retention(RetentionPolicy.RUNTIME)
@Documented
public @interface Scope {
    @AliasFor("scopeName")
    String value() default "";

    @AliasFor("value")
    String scopeName() default "";

    ScopedProxyMode proxyMode() default ScopedProxyMode.DEFAULT;
}
```

## ScopedProxyMode

```java
public enum ScopedProxyMode {
    DEFAULT,
    NO,
    INTERFACES,
    TARGET_CLASS;

    private ScopedProxyMode() {
    }
}
```

# Q1-介绍一下 spring 的 Scope 注解

在Spring框架中，`@Scope`注解用于定义Spring容器中bean的作用域（scope）。

通过`@Scope`注解，我们可以指定bean是单例（Singleton）模式还是原型（Prototype）模式，或者使用其他自定义的作用域。

Spring提供了以下常见的作用域：

1. Singleton（默认）：当使用`@Scope("singleton")`或者省略`@Scope`注解时，Spring容器会保证在整个应用程序上下文中，只有一个bean实例。每次从容器中获取该bean时，都将得到同一个实例。

2. Prototype：当使用`@Scope("prototype")`时，每次从容器中获取该bean时，都会创建一个新的实例。每个依赖此bean的地方将得到不同的实例。

3. Request：当使用`@Scope("request")`时，每个HTTP请求将会有一个新的实例。这对于Web应用程序中需要在每个请求中维护状态的bean很有用。

4. Session：当使用`@Scope("session")`时，每个用户会话将会有一个新的实例。适用于Web应用程序中需要在每个用户会话中维护状态的bean。

5. Global Session：当使用`@Scope("globalSession")`时，全局会话将会有一个新的实例。这对于Portlet应用程序有用，Portlet规范定义了全局会话的概念。

除了上述内置的作用域之外，Spring还支持自定义作用域。你可以实现`org.springframework.beans.factory.config.Scope`接口，并将自定义的作用域注册到Spring容器中。

例如，假设我们有一个名为`MyCustomScope`的自定义作用域，我们可以将其注册到Spring容器中：

```java
import org.springframework.context.annotation.Scope;
import org.springframework.stereotype.Component;

@Component
@Scope("myCustomScope")
public class MyBean {
    // Bean的定义
}
```

然后，在配置类或XML配置文件中注册自定义作用域：

```java
import org.springframework.beans.factory.config.CustomScopeConfigurer;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class AppConfig {
    @Bean
    public static CustomScopeConfigurer customScopeConfigurer() {
        CustomScopeConfigurer configurer = new CustomScopeConfigurer();
        configurer.addScope("myCustomScope", new MyCustomScope());
        return configurer;
    }

    // 其他bean的定义
}
```

请注意，在使用自定义作用域之前，需要先实现`MyCustomScope`类来定义具体的作用域逻辑。

总结：`@Scope`注解用于指定Spring bean的作用域。

Spring提供了多种内置作用域，包括Singleton和Prototype，同时也支持自定义作用域。作用域的选择要根据应用程序的需求和性能要求来决定。

# Q2-介绍一下 ScopedProxyMode

在Spring框架中，`ScopedProxyMode`是一个枚举类型，用于在使用`@Scope`注解时控制bean的代理模式。

当bean被声明为Prototype（原型）作用域时，它的依赖可能导致一些问题，因为原型bean在被注入到其他Singleton（单例）bean时，会在依赖注入时创建一次，但在整个应用程序上下文中只有一个实例。
为了解决这个问题，Spring引入了ScopedProxyMode，通过使用代理来处理原型bean的依赖。

ScopedProxyMode提供了三种代理模式：

1. `NO`：这是默认值，表示不使用代理。如果将一个原型bean注入到单例bean中，那么这个原型bean将在注入时创建一次，后续的依赖注入都将使用同一个实例。

2. `INTERFACES`：使用JDK动态代理。当一个原型bean注入到单例bean中时，Spring将使用一个实现原型bean接口的代理对象。每次从单例bean中获取依赖时，代理对象都会创建一个新的原型bean实例并返回。

3. `TARGET_CLASS`：使用CGLIB代理。与`INTERFACES`类似，但是当原型bean没有实现接口时，Spring将使用CGLIB库创建一个原型bean的子类作为代理。

下面是示例代码，展示了如何在使用`@Scope`注解时指定代理模式：

```java
import org.springframework.context.annotation.Scope;
import org.springframework.context.annotation.ScopedProxyMode;
import org.springframework.stereotype.Component;

@Component
@Scope(value = "prototype", proxyMode = ScopedProxyMode.TARGET_CLASS)
public class PrototypeBean {
    // Bean的定义
}
```

在上述示例中，`PrototypeBean`被声明为原型作用域，并且使用`ScopedProxyMode.TARGET_CLASS`指定了代理模式。

这将确保在将`PrototypeBean`注入到其他Singleton bean时，Spring将使用CGLIB创建一个子类代理来处理原型bean的依赖。

使用代理模式可以有效地解决原型作用域bean在单例bean中的依赖注入问题，确保每次从单例bean中获取依赖时都会得到一个新的原型bean实例。

# Q3-定义一个接口，使用 @Scope 注解指定代理模式，实现这个接口的类就会被按照这种代理模式处理吗？

在Java中，接口本身并不是一个可以被实例化的类，因此它无法直接应用作用域和代理模式。`@Scope`注解和代理模式主要用于处理Spring管理的bean实例，而不是用于接口本身。

然而，你可以在Spring中定义一个接口，然后在实现这个接口的类上使用`@Scope`注解指定代理模式。

这样，当这些实现类作为bean被Spring管理时，代理模式将会生效。

下面是一个示例：

首先，定义一个接口：

```java
public interface MyService {
    void doSomething();
}
```

然后，实现这个接口的类：

```java
import org.springframework.context.annotation.Scope;
import org.springframework.context.annotation.ScopedProxyMode;
import org.springframework.stereotype.Service;

@Service
@Scope(value = "prototype", proxyMode = ScopedProxyMode.TARGET_CLASS)
public class MyServiceImpl implements MyService {
    public void doSomething() {
        System.out.println("Doing something...");
    }
}
```

在上面的示例中，`MyServiceImpl`实现了`MyService`接口，并且使用`@Scope`注解指定了代理模式为`ScopedProxyMode.TARGET_CLASS`。

这将确保当`MyServiceImpl`作为bean被Spring管理时，将会按照CGLIB代理模式来处理。

在其他类中，如果注入`MyService`的实例，那么实际上获取的是`MyServiceImpl`的代理对象。每次调用代理对象的方法时，都会触发代理逻辑，这会导致创建一个新的`MyServiceImpl`实例并调用其方法。

需要注意的是，`@Scope`注解和代理模式只有在bean被Spring容器管理时才会生效。如果直接通过`new`关键字来实例化对象，那么注解将不会起作用。因此，Spring框架通过IoC容器来管理bean的生命周期，从而能够有效地应用`@Scope`注解和代理模式。

# 小结

上一节中，[spring 增强之后无法获取自定义注解属性及解决方案](https://houbb.github.io/2023/08/02/spring-aop-enhance-annotation-cannot-find) 其实这里是另外一种解决方式。

# 参考资料

chat

* any list
{:toc}