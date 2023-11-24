---
layout: post
title:  Spring Boot-28-注入方式 @Autowired @Inject @Resource @Qualifier + 配置信息的读取
date:  2017-12-19 14:43:25 +0800
categories: [Spring]
tags: [spring, web, springboot]
published: true
---

# Q1-spring 注入一个类，除了 @Autowired 注解，还有什么注解

除了 `@Autowired` 注解，Spring还提供了其他一些注解来实现依赖注入：

1.  `@Inject` ： `@Inject` 注解是Java依赖注入规范（JSR-330）中定义的注解，它与 `@Autowired` 注解类似，可以用于实现依赖注入。与 `@Autowired` 不同的是， `@Inject` 注解是标准化的注解，可以在不同的依赖注入框架中使用。

2.  `@Resource` ： `@Resource` 注解是Java EE规范中定义的注解，它可以用于实现依赖注入。与 `@Autowired` 和 `@Inject` 不同的是， `@Resource` 注解可以通过名称（name）或者通过类型（type）来指定要注入的依赖。

3.  `@Qualifier` ： `@Qualifier` 注解用于解决依赖注入时的歧义性。当有多个相同类型的依赖对象时，可以使用 `@Qualifier` 注解配合 `@Autowired` 或 `@Inject` 注解来指定具体要注入的依赖对象。

4.  `@Value` ： `@Value` 注解用于注入配置属性的值。可以将 `@Value` 注解应用在字段、方法参数、构造函数参数上，Spring会自动将配置属性的值注入到对应的位置。

这些注解提供了不同的方式来实现依赖注入，您可以根据具体的需求选择合适的注解来注入类。

# Q2-spring 基于构造器的注入，代码怎么写？

在Spring中，基于构造器的注入可以通过在构造函数上使用 `@Autowired` 注解来实现。

以下是一个示例代码：

```java
@Component
public class MyClass {
    private MyDependency myDependency;

    @Autowired
    public MyClass(MyDependency myDependency) {
        this.myDependency = myDependency;
    }

    // 其他方法和逻辑
}
```

在上述示例中， `MyClass` 类使用了构造函数注入，通过在构造函数上添加 `@Autowired` 注解来告诉Spring要注入哪个依赖对象。 

`MyDependency` 是 `MyClass` 的一个依赖对象，它会被自动注入到构造函数中的 `myDependency` 字段。

需要注意的是，当类中只有一个构造函数时，可以省略 `@Autowired` 注解。

但是，如果类中有多个构造函数，那么需要在其中一个构造函数上添加 `@Autowired` 注解来指示Spring使用哪个构造函数进行注入。

使用基于构造器的注入可以增加代码的可读性和可测试性，推荐在Spring项目中使用。

# Q3-这个时候构造器注入，如何通过 @Qualifier 的方式注入？

在使用构造器注入时，如果存在多个相同类型的依赖对象，可以结合使用 `@Autowired` 和 `@Qualifier` 注解来指定具体要注入的依赖对象。

以下是一个示例代码：

```java
@Component
public class MyClass {
    private MyDependency myDependency;

    @Autowired
    public MyClass(@Qualifier("myDependencyImpl1") MyDependency myDependency) {
        this.myDependency = myDependency;
    }

    // 其他方法和逻辑
}
```

在上述示例中，假设存在多个实现了 `MyDependency` 接口的类，我们可以使用 `@Qualifier` 注解来明确指定要注入的依赖对象。 `@Qualifier` 注解的参数是对应依赖对象的名称或标识符。

在这个例子中，我们使用 `@Qualifier("myDependencyImpl1")` 来指定要注入的依赖对象为名为"myDependencyImpl1"的实现类。

需要确保在对应的实现类上使用 `@Qualifier` 注解来标识它们的名称或标识符，以便在构造函数注入时进行匹配。

通过结合使用 `@Autowired` 和 `@Qualifier` 注解，可以解决构造器注入中的歧义性问题，确保正确注入所需的依赖对象。

# Q1-springboot 项目代码中，如何获取 application.properties 的配置属性

在Spring Boot项目中，您可以使用 `@Value` 注解或 `Environment` 对象来获取 `application.properties` 配置文件中的属性。

1. 使用 `@Value` 注解：

在您的Spring Boot组件（例如Controller、Service等）中，可以使用 `@Value` 注解将配置属性注入到对应的变量中。

例如：

```java
@Value("${myapp.property}")
private String myProperty;
```

在上述示例中， `myapp.property` 是 `application.properties` 中的属性键，Spring Boot将自动将该属性的值注入到 `myProperty` 变量中。

2. 使用 `Environment` 对象：

您还可以通过 `Environment` 对象来获取 `application.properties` 中的属性值。
   
在您的Spring Boot组件中，可以通过依赖注入的方式获取 `Environment` 对象，并使用 `getProperty` 方法获取属性值。
   
例如：

```java
@Autowired
private Environment environment;

public void someMethod() {
    String myProperty = environment.getProperty("myapp.property");
    // 使用myProperty进行后续操作
}
```   

在上述示例中，通过 `environment.getProperty("myapp.property")` 方法获取 `myapp.property` 属性的值。

无论您选择使用 `@Value` 注解还是 `Environment` 对象，都可以方便地获取 `application.properties` 中的配置属性值。





# 参考资料

chat

* any list
{:toc}
