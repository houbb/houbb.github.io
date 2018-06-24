---
layout: post
title:  Junit5-02-Annotation
date:  2018-06-25 06:53:36 +0800
categories: [Test]
tags: [test, sh]
published: true
---

# Junit5 注解 

所有支持的注解都在包 `org.junit.jupiter.api` 下;

使用@Test、@TestTemplate、@RepeatedTest、@BeforeAll、@AfterAll、@BeforeEach或@AfterEach注释的方法**不能返回值**。

## @Test

表示方法是测试方法。与JUnit 4的@Test注释不同，这个注释不声明任何属性，因为JUnit Jupiter中的测试扩展基于它们自己的专用注释进行操作。
这些方法是继承的，除非它们被重写。

## @ParameterizedTest

表示方法是参数化测试。这些方法是继承的，除非它们被重写。

## @RepeatedTest

表示方法是重复测试的测试模板。这些方法是继承的，除非它们被重写。

## @TestFactory

表示方法是动态测试的测试工厂。这些方法是继承的，除非它们被重写。

## @TestInstance

用于为带注释的测试类配置测试实例生命周期。这些方法是继承的，除非它们被重写。

## @TestTemplate

表示方法是为测试用例设计的模板，根据注册提供程序返回的调用上下文的数量进行多次调用。这些方法是继承的，除非它们被重写。

## @DisplayName

声明测试类或测试方法的自定义显示名称。这样的注解**不是继承来的**。

## @BeforeEach

表示在当前类中每个@Test、@RepeatedTest、@ParameterizedTest或@TestFactory方法之前执行注释的方法;类似于JUnit 4的@Before。

这些方法是继承的，除非它们被重写。

## @AfterEach

表示在当前类中的每个@Test、@RepeatedTest、@ParameterizedTest或@TestFactory方法之后，都应该执行带注释的方法;类似于JUnit 4的@After。

这些方法是继承的，除非它们被重写。

## @BeforeAll

表示应在当前类中的所有@Test、@RepeatedTest、@ParameterizedTest和@TestFactory方法之前执行带注释的方法;类似于JUnit 4的@BeforeClass。

这些方法是继承的(除非它们被隐藏或覆盖)，并且必须是静态的(除非使用“每个类”测试实例生命周期)。

## @AfterAll

表示在当前类中，所有@Test、@RepeatedTest、@ParameterizedTest和@TestFactory方法都应该执行注释的方法;类似于JUnit 4的@AfterClass。

这些方法是继承的(除非它们被隐藏或覆盖)，并且必须是静态的(除非使用“每个类”测试实例生命周期)。

## @Nested

表示带注释的类是一个嵌套的、非静态的测试类。@BeforeAll和@AfterAll方法不能直接在 @Nested 测试类中使用，除非使用“每个类”测试实例生命周期。

这样的注解不是继承来的。

## @Tag

用于在类或方法级别声明过滤测试的标记;类似于TestNG中的测试组或JUnit 4中的类别。

此类注释在类级别继承，但在方法级别继承。

## @Disabled

用于禁用测试类或测试方法;类似于JUnit 4的@Ignore。

这样的注解不是继承来的。

## @ExtendWith

用于注册自定义扩展。这些注释是继承。

# 元注释,注释

JUnit Jupiter注解可以用作元注解。这意味着您可以定义自己的组合注释，它将自动继承其元注释的语义。

例如，您可以创建一个名为 `@Fast` 的自定义组合注释，
如下所示，而不是在整个代码库中复制和粘贴@Tag(“fast”)(请参阅标记和过滤)。然后可以使用@Fast作为@Tag(“fast”)的drop-in替代。

```java
import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;

import org.junit.jupiter.api.Tag;

@Target({ ElementType.TYPE, ElementType.METHOD })
@Retention(RetentionPolicy.RUNTIME)
@Tag("fast")
public @interface Fast {
}
```

* any list
{:toc}







