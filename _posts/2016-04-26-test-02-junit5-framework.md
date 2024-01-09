---
layout: post
title: test-02-java 单元测试框架 junit5 入门介绍
date:  2016-4-26 12:53:12 +0800
categories: [Test]
tags: [junit, test]
published: true
---

# 拓展阅读

[junit5 系列](https://houbb.github.io/2018/06/24/junit5-01-hello)

[基于 junit5 实现 junitperf 源码分析](https://houbb.github.io/2021/07/23/junit-performance-junit5)

[Auto generate mock data for java test.(便于 Java 测试自动生成对象信息)](https://github.com/houbb/data-factory)

[Junit performance rely on junit5 and jdk8+.(java 性能测试框架。性能测试。压测。测试报告生成。)](https://github.com/houbb/junitperf)

# junit5 的入门例子

## maven 引入

```xml
<dependencies>
    <!-- 添加 JUnit 5 依赖项 -->
    <dependency>
        <groupId>org.junit.jupiter</groupId>
        <artifactId>junit-jupiter-api</artifactId>
        <version>5.8.2</version>
        <scope>test</scope>
    </dependency>
    <dependency>
        <groupId>org.junit.jupiter</groupId>
        <artifactId>junit-jupiter-engine</artifactId>
        <version>5.8.2</version>
        <scope>test</scope>
    </dependency>
</dependencies>
```

## 方法

```java
public class Calculator {
    public int add(int a, int b) {
        return a + b;
    }
}
```

## 测试类

```java
import org.junit.jupiter.api.Test;
import static org.junit.jupiter.api.Assertions.*;

public class CalculatorTest {

    @Test
    void testAdd() {
        // Arrange
        Calculator calculator = new Calculator();

        // Act
        int result = calculator.add(3, 7);

        // Assert
        assertEquals(10, result, "3 + 7 should equal 10");
    }
}
```

# 小结 

junit5 对比 junit4 可以说是划时代的提升。

这么多年过去了，就算是再顽固的系统，现在也开始使用 jdk1.8 了，这一点令人欣慰。

junit5 是新时代的单元测试，所以忘掉你的 junit4 吧。

# chat

## 详细介绍一下 junit5

JUnit 5 是 Java 中的下一代单元测试框架，与 JUnit 4 相比，它引入了许多新的特性和改进。

JUnit 5 由三个主要模块组成：JUnit Platform、JUnit Jupiter 和 JUnit Vintage。

以下是 JUnit 5 的一些主要特性和概念：

1. **JUnit Platform：** JUnit 5 的基础，提供了一个测试平台，用于运行不同测试框架的测试。它还支持通过插件机制扩展测试框架。

2. **JUnit Jupiter：** JUnit 5 的新测试引擎，支持最新的测试风格和功能。JUnit Jupiter 提供了注解驱动的测试、参数化测试、条件测试、嵌套测试等功能。

   - **注解驱动的测试：** 使用 `@Test`、`@BeforeEach`、`@AfterEach` 等注解进行测试方法的标记，相比 JUnit 4 更加灵活。
   
   - **参数化测试：** 使用 `@ParameterizedTest` 和 `@ValueSource` 等注解，支持在一个测试方法上运行多次，每次使用不同的参数。
   
   - **条件测试：** 使用 `@EnabledOnOs`、`@DisabledIf` 等条件注解，根据条件动态地启用或禁用测试。
   
   - **嵌套测试：** 使用 `@Nested` 注解，支持更好地组织测试类，使测试结构更清晰。

3. **JUnit Vintage：** 为了兼容 JUnit 3 和 JUnit 4 测试，JUnit 5 提供了 Vintage 引擎，使得旧有的测试可以在 JUnit 5 平台上运行。

4. **测试接口和默认方法：** JUnit 5 允许在测试接口中使用 `@Test` 和其他测试相关的注解，并且支持在接口中定义默认方法。这使得共享测试代码更为灵活。

5. **扩展模型：** JUnit 5 引入了扩展模型，通过编写自定义扩展，可以对测试执行过程中的各个阶段进行扩展和定制。这是一个强大的特性，用于实现更高级的测试控制和集成。

6. **动态测试注册：** JUnit 5 引入了 `TestFactory` 注解，使得测试可以在运行时动态生成。这对于根据运行时条件生成测试非常有用。

7. **条件测试：** JUnit 5 提供了 `@EnabledOn`、`@DisabledOn`、`@EnabledIf`、`@DisabledIf` 等注解，可以根据条件启用或禁用测试。

8. **JUnit Platform Launcher API：** 允许通过编程方式运行测试，支持集成到不同的构建工具和 IDE 中。

9. **并发测试支持：** JUnit 5 提供了 `@RepeatedTest` 注解，支持更方便地编写和执行并发测试。

10. **参数解析和转换：** JUnit 5 提供了强大的参数解析和转换功能，使得测试方法可以接受更复杂的参数类型，并支持自定义的参数解析器。

JUnit 5 的设计目标是提供更灵活、现代化、可扩展的测试框架，使得 Java 开发者能够更轻松地编写和维护高质量的单元测试。

## 为什么需要有 junit5? junit 还不够吗

JUnit 5 的引入主要是为了满足新的测试需求和应对现代化的软件开发环境，以提供更丰富、灵活、现代化的测试框架。

以下是一些推动 JUnit 5 发展的主要原因：

1. **支持新的语言特性：** JUnit 5 提供了对 Java 8 及以上版本的支持，包括使用 Lambdas 和其他新的语言特性。这使得测试代码更为简洁和易读。

2. **模块化的设计：** JUnit 5 采用了模块化的设计，分为三个主要组件：JUnit Jupiter（新的测试引擎）、JUnit Platform（测试平台）、JUnit Vintage（兼容旧版 JUnit）。这种设计使得 JUnit 5 更加灵活，可以适应不同的测试场景。

3. **新的测试注解和功能：** JUnit 5 引入了一系列新的测试注解和功能，例如 `@Test`、`@BeforeEach`、`@AfterEach` 等注解的改进，以及参数化测试、嵌套测试、条件测试等新的功能。这些功能使得测试更为灵活、易用，并提供更丰富的测试表达能力。

4. **扩展和插件机制：** JUnit 5 提供了更强大的扩展模型，允许开发者编写自定义扩展，以适应不同的测试需求。同时，JUnit 5 的插件机制使得集成到不同的构建工具和 IDE 中变得更为容易。

5. **并发测试支持：** JUnit 5 提供了对并发测试的原生支持，通过 `@RepeatedTest` 注解，可以更方便地编写和执行并发测试。

6. **条件测试：** JUnit 5 引入了条件测试，通过 `@EnabledOn`、`@DisabledOn`、`@EnabledIf`、`@DisabledIf` 等注解，可以根据条件动态地启用或禁用测试。

7. **测试接口和默认方法：** JUnit 5 允许在测试接口中使用 `@Test` 和其他测试相关的注解，并且支持在接口中定义默认方法。这使得共享测试代码更为灵活。

8. **清晰的命名规范：** JUnit 5 引入了一套清晰的命名规范，例如测试方法的命名规则 `test{MethodName}`、生命周期回调方法的命名规则 `beforeEach`、`afterEach` 等，使得测试代码的结构更为一致和易读。

总体而言，JUnit 5 的目标是提供一个现代化、灵活、可扩展的测试框架，以满足日益复杂和变化的软件开发环境中的测试需求。

虽然 JUnit 4 仍然是许多项目中使用的稳定框架，但随着时间的推移，Junit 5 的特性和优势使得它成为越来越受欢迎的选择。

## 如果让你深入学习 junit5，你会问哪10个问题？为什么

深入学习JUnit 5时，你可能会提出以下10个问题，以更全面地理解和掌握这个测试框架：

1. **JUnit 5的核心组件是什么？**
   - **为什么这个问题重要？** 了解JUnit 5的核心组件，包括JUnit Jupiter、JUnit Platform和JUnit Vintage，有助于理解JUnit 5的整体架构和设计目标。

2. **JUnit Jupiter的新特性有哪些？**
   - **为什么这个问题重要？** 了解JUnit Jupiter引入的新测试注解、扩展模型和功能，如参数化测试、嵌套测试等，可以更好地使用和组织测试。

3. **JUnit 5的测试生命周期是怎样的？**
   - **为什么这个问题重要？** 了解测试生命周期，包括`@BeforeAll`、`@BeforeEach`、`@AfterEach`等注解，有助于在测试中执行初始化和清理操作。

4. **JUnit 5的参数化测试是如何工作的？**
   - **为什么这个问题重要？** 了解如何使用`@ParameterizedTest`注解进行参数化测试，以及如何传递不同的参数集，有助于编写更灵活和复用性强的测试。

5. **JUnit 5的扩展模型是什么？**
   - **为什么这个问题重要？** 了解JUnit 5的扩展模型，包括编写自定义扩展和使用现有扩展，可以实现更高级的测试控制和集成。

6. **JUnit 5的条件测试是如何使用的？**
   - **为什么这个问题重要？** 了解条件测试，如`@EnabledOn`、`@DisabledOn`、`@EnabledIf`、`@DisabledIf`等注解，有助于根据运行时条件动态启用或禁用测试。

7. **JUnit 5如何支持并发测试？**
   - **为什么这个问题重要？** 了解如何使用`@RepeatedTest`注解支持并发测试，以及如何设置线程池，有助于编写更高效和可扩展的并发测试。

8. **JUnit 5的测试接口和默认方法有何特点？**
   - **为什么这个问题重要？** 了解如何在测试接口中使用`@Test`和其他测试相关的注解，以及如何使用默认方法实现共享测试代码，有助于测试代码的组织和结构。

9. **JUnit 5如何进行动态测试注册？**
   - **为什么这个问题重要？** 了解如何使用`TestFactory`注解进行动态测试注册，使得测试可以在运行时动态生成，有助于测试的灵活性和可扩展性。

10. **JUnit 5与其他测试框架的集成有何优势？**
    - **为什么这个问题重要？** 了解JUnit 5与其他测试框架（如Mockito）的集成优势，以及如何利用这些集成提高测试代码的质量和可维护性。

## junit5 的 核心组件

JUnit 5 的核心组件包括 JUnit Jupiter、JUnit Platform 和 JUnit Vintage。

这三个组件共同构成了JUnit 5的架构，各自承担着不同的角色和功能。

1. **JUnit Jupiter:**
   - **介绍：** JUnit Jupiter 是 JUnit 5 的测试引擎，它支持最新的测试风格和功能。引入了一系列新的测试注解和功能，使得测试更为灵活和现代化。
   - **主要特性：**
     - **新的测试注解：** 包括 `@Test`、`@BeforeEach`、`@AfterEach` 等，用于标记测试方法、生命周期回调方法等。
     - **参数化测试：** 引入了 `@ParameterizedTest` 注解，支持在一个测试方法上运行多次，每次使用不同的参数。
     - **嵌套测试：** 引入了 `@Nested` 注解，支持更好地组织测试类，使测试结构更清晰。
     - **条件测试：** 引入了 `@EnabledOn`、`@DisabledOn`、`@EnabledIf`、`@DisabledIf` 等注解，可以根据条件动态启用或禁用测试。

2. **JUnit Platform:**
   - **介绍：** JUnit Platform 是 JUnit 5 的测试平台，提供了一个通用的测试架构，可以运行不同测试框架的测试。它还支持通过插件机制扩展测试框架。
   - **主要特性：**
     - **测试引擎：** 定义了测试引擎 API，使得不同的测试引擎可以在JUnit Platform上运行。
     - **插件机制：** 支持通过插件机制扩展测试框架，以适应不同的测试需求。
     - **命令行工具：** 提供了用于运行测试的命令行工具，如 `junit-platform-console-standalone`。

3. **JUnit Vintage:**
   - **介绍：** JUnit Vintage 是 JUnit 5 中的一个模块，用于兼容旧版本的 JUnit 测试。它可以运行基于 JUnit 3 和 JUnit 4 的测试。
   - **主要特性：**
     - **兼容性：** 提供了兼容 JUnit 3 和 JUnit 4 的测试引擎，以便在 JUnit 5 中运行旧有的测试。
     - **无缝过渡：** 允许逐步迁移到 JUnit 5，保留和运行旧有的测试，而新的测试可以使用 JUnit Jupiter。

这三个核心组件共同协作，使得JUnit 5成为一个灵活、现代化的测试框架。

JUnit Jupiter提供了丰富的新特性，JUnit Platform提供了通用的测试平台，而JUnit Vintage确保了对旧有测试的兼容性。

这种模块化的设计使得JUnit 5更具适应性和可扩展性。



* any list
{:toc}