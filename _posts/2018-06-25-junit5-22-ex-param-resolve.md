---
layout: post
title:  Junit5-22-Ex Parameter Resolution
date:  2018-06-26 14:33:07 +0800
categories: [Test]
tags: [test, sh]
published: true
---

# ParameterResolver 

ParameterResolver 定义用于在运行时动态解析参数的扩展API。

如果测试构造函数或@Test、@RepeatedTest、@ParameterizedTest、@TestFactory、@BeforeEach、@BeforeAll或@AfterAll方法接受一个参数，那么参数必须在运行时由一个参数解析器解析。

参数解析器可以是内置的(参见[TestInfoParameterResolver](https://github.com/junit-team/junit5/blob/r5.2.0/junit-jupiter-engine/src/main/java/org/junit/jupiter/engine/extension/TestInfoParameterResolver.java))，也可以由用户注册。

一般来说，参数可以通过名称、类型、注释或其任何组合来解析。对于具体的示例，请参考
[CustomTypeParameterResolver](https://github.com/junit-team/junit5/blob/r5.2.0/junit-jupiter-engine/src/test/java/org/junit/jupiter/engine/execution/injection/sample/CustomTypeParameterResolver.java)  和 [CustomAnnotationParameterResolver](https://github.com/junit-team/junit5/blob/r5.2.0/junit-jupiter-engine/src/test/java/org/junit/jupiter/engine/execution/injection/sample/CustomAnnotationParameterResolver.java) 的源代码。

## 注意

由于在JDK 9之前的JDK版本上，javac生成的字节代码中有一个错误，因此可以通过核心 `java.lang.reflect.Parameter` 直接查找关于参数的注释对于内部类构造函数(例如，@嵌套测试类中的构造函数) API总是失败的。

因此，提供给参数解析器实现的ParameterContext API包含以下方便的方法，用于正确查找关于参数的注释。强烈建议扩展作者使用这些方法，而不是使用
`java.lang. reflection.Parameter` 中提供的方法。以避免JDK中的这个bug。

- boolean isAnnotated(Class<? extends Annotation> annotationType)

- Optional<A> findAnnotation(Class<A> annotationType)

- List<A> findRepeatableAnnotations(Class<A> annotationType)


* any list
{:toc}