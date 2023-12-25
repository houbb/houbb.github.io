---
layout: post
title: test-03-java 单元测试框架 testNG 入门介绍
date:  2016-4-26 12:53:12 +0800
categories: [Test]
tags: [junit, test]
published: true
---


# 拓展阅读

[test 系统学习-03-TestNG Spock testng 入门使用教程](https://houbb.github.io/2018/06/23/test-03-testNG)

# chat

## Q: 详细介绍一下 testNG

TestNG（Test Next Generation）是一个用于测试Java程序的测试框架。

它设计用于简化不同种类测试（单元测试、集成测试等）的编写和执行过程。

以下是关于TestNG的详细介绍：

### 1. **注解支持：**
   - TestNG 使用注解来标识测试方法，例如 `@Test` 标注用于标识测试方法，`@BeforeTest` 和 `@AfterTest` 标注用于在测试之前和之后执行的方法。

### 2. **测试套件（Test Suites）：**
   - TestNG 允许你将测试方法组织成测试套件，这是一种逻辑上的组织方式，用于执行一系列相关的测试。

### 3. **测试参数化：**
   - TestNG 支持测试方法的参数化，通过 `@Parameters` 注解可以为测试方法提供不同的输入参数。

### 4. **依赖测试：**
   - TestNG 允许通过 `dependsOnMethods` 或 `dependsOnGroups` 属性指定测试方法之间的依赖关系，确保测试方法按照指定的顺序执行。

### 5. **测试分组：**
   - 可以使用 `@Test(groups = "groupname")` 将测试方法分组，以便在测试套件中选择性地执行特定组的测试。

### 6. **并发测试：**
   - TestNG 支持并发测试，你可以配置测试套件中的测试以并行执行，提高测试执行效率。

### 7. **丰富的监听器支持：**
   - TestNG 提供了许多监听器接口，你可以实现这些接口以定制测试执行期间的行为，例如，在测试开始或结束时执行一些操作。

### 8. **报告生成：**
   - TestNG 生成详细的测试报告，包括测试运行的概要、通过和失败的测试用例、执行时间等信息。

### 9. **支持数据驱动测试：**
   - TestNG 支持数据驱动测试，通过 `@DataProvider` 注解，可以从外部数据源（例如Excel、XML）提供测试数据。

### 10. **集成容易：**
   - TestNG 易于集成到各种构建工具（如Maven、Gradle）和持续集成系统（如Jenkins）中，方便与其他工具协同使用。

### 11. **灵活的测试配置：**
   - TestNG 提供了灵活的配置选项，可以通过XML配置文件或通过注解进行配置。

### 12. **支持并行和分布式测试：**
   - TestNG 支持在多个线程中并行执行测试，也支持分布式测试执行。

总体来说，TestNG 是一个功能强大、灵活且易于使用的测试框架，广泛用于Java应用程序的单元测试和集成测试。

其强大的功能使得开发人员能够更轻松地组织、执行和分析测试，从而提高测试的效率和质量。

## testNG 的入门案例，包含 maven 引入

maven 依赖

```xml
<dependencies>
    <!-- TestNG -->
    <dependency>
        <groupId>org.testng</groupId>
        <artifactId>testng</artifactId>
        <version>7.3.0</version> <!-- 检查 TestNG 最新版本 -->
        <scope>test</scope>
    </dependency>
</dependencies>
```

测试类，和 junit 差不多：

```java
import org.testng.Assert;
import org.testng.annotations.Test;

public class TestNGExampleTest {

    @Test
    public void testAddition() {
        // 测试相加方法
        int result = add(2, 3);

        // 使用断言验证结果
        Assert.assertEquals(result, 5, "Addition failed: Expected 5, but got " + result);
    }

    @Test
    public void testSubtraction() {
        // 测试相减方法
        int result = subtract(5, 3);

        // 使用断言验证结果
        Assert.assertTrue(result > 0, "Subtraction failed: Expected result to be greater than 0");
    }

    private int add(int a, int b) {
        // 实际的相加方法
        return a + b;
    }

    private int subtract(int a, int b) {
        // 实际的相减方法
        return a - b;
    }
}
```

## 为什么已经有 junit4 了，还会有 testNG 呢？

JUnit 4 和 TestNG 都是用于Java应用程序测试的流行测试框架，它们有一些相似之处，但也有一些不同之处，导致在某些情况下选择使用 TestNG。

以下是一些原因：

1. **更灵活的测试配置：** TestNG 提供了更灵活的测试配置选项，可以通过 XML 文件进行配置，允许开发人员更细粒度地控制测试的执行方式，包括并发测试、测试组、测试套件等。

2. **注解的丰富性：** TestNG 提供了更多的注解，例如 `@BeforeSuite`、`@AfterSuite`、`@BeforeTest`、`@AfterTest` 等，使测试方法的组织更加灵活。TestNG 的注解支持更丰富的测试生命周期管理。

3. **参数化测试：** TestNG 提供了更强大的参数化测试支持，通过 `@DataProvider` 注解，可以更轻松地实现数据驱动测试。

4. **依赖测试：** TestNG 具有更强大的依赖测试支持，可以通过 `dependsOnMethods` 或 `dependsOnGroups` 属性指定测试方法之间的依赖关系，确保测试方法按照指定的顺序执行。

5. **测试分组和套件：** TestNG 提供了更灵活的测试分组和测试套件功能，可以按照不同的维度组织测试，更容易管理和执行特定组的测试。

6. **并发测试：** TestNG 内置支持并发测试，可以配置测试套件中的测试以并行执行，提高测试效率。

7. **监听器支持：** TestNG 提供了丰富的监听器接口，可以通过实现这些接口定制测试执行期间的行为，例如，在测试开始或结束时执行一些操作。

8. **软断言（Soft Assertions）：** TestNG 支持软断言，即使在断言失败时，测试方法仍然会继续执行，方便查看所有断言失败的情况。

9. **跳过测试：** TestNG 允许在测试方法上使用 `@Test(enabled = false)` 来标记测试方法为禁用状态，而不需要注释掉整个方法。

虽然JUnit 4也是一个强大而成熟的测试框架，但在一些特定场景下，开发人员可能会更喜欢 TestNG 的一些特性和灵活性。

## java 除了 junit/junit5/testNG 还有其他测试框架吗？

除了 JUnit、JUnit 5 和 TestNG 之外，Java 中还有一些其他测试框架，每个框架都有其独特的特性和优势。

以下是一些其他常见的 Java 测试框架：

1. **Spock:**
   - 基于 Groovy 语言的测试框架，结合了灵活的语法和强大的功能，支持行为驱动开发（BDD）风格的测试。

2. **TestNG 2:**
   - TestNG 的后续版本，进一步增强了 TestNG 的功能和灵活性。

3. **JUnit Pioneer:**
   - 一个基于 JUnit 5 平台的扩展，提供一些额外的功能和工具。

4. **AssertJ:**
   - 不是一个测试框架，而是一个断言库。它提供了丰富而直观的断言，用于提高测试代码的可读性。

5. **TestFX:**
   - 用于测试 JavaFX 应用程序的框架，支持图形用户界面（GUI）测试。

6. **Mockito:**
   - 虽然不是完整的测试框架，但是 Mockito 用于模拟对象，是一个非常流行的单元测试工具。它可以与 JUnit 或 TestNG 一起使用。

7. **Arquillian:**
   - 主要用于企业级 Java 应用程序的集成测试，支持在容器中运行测试，例如在 Java EE 容器中进行测试。

8. **RestAssured:**
   - 专注于测试 RESTful API 的库，提供了简单而强大的 API 以进行 HTTP 请求和验证响应。

9. **Cucumber:**
   - 用于支持行为驱动开发（BDD）的框架，采用自然语言编写测试场景。

10. **Karate:**
   - 结合了 API 测试、UI 测试和性能测试的框架，具有自己的领域特定语言（DSL）。

## 谈一谈你对 testNG 更加深入的理解？

更深入的关于 TestNG 的信息：

1. **Suite 和 Test：** TestNG 中的测试被组织成测试套件（Suite），而测试套件由一个或多个测试（Test）组成。测试套件和测试的组织结构可以在 XML 配置文件中进行定义。

2. **参数化测试：** TestNG 提供了强大的参数化测试功能，可以使用 `@Parameters` 注解将不同的参数传递给测试方法。这使得同一测试方法可以多次运行，每次使用不同的输入参数。

3. **数据驱动测试：** TestNG 支持数据驱动测试，可以通过数据提供者（DataProvider）或者通过 `@Factory` 注解来实现。这使得测试方法可以使用来自不同数据源的输入进行多次执行。

4. **监听器和报告：** TestNG 具有丰富的监听器接口，可以通过实现这些接口来监听测试执行过程中的不同事件。同时，TestNG 自动生成详细的测试报告，这些报告包含了测试执行的结果、用时、失败原因等信息。

5. **测试分组和依赖：** TestNG 允许测试方法分组，方便按照功能或业务逻辑进行组织。通过 `dependsOnMethods` 或 `dependsOnGroups` 属性，可以指定测试方法之间的依赖关系，确保测试方法按照指定的顺序执行。

6. **并发测试：** TestNG 具有内置的并发测试支持，可以通过在测试套件或测试方法上设置 `parallel` 属性来实现并行执行测试，提高测试效率。

7. **软断言：** TestNG 支持软断言，这允许在测试方法中执行多个断言，即使一个断言失败，仍然继续执行余下的测试，并在所有断言完成后一次性报告失败。

8. **Factory 和监听器的结合使用：** TestNG 中的 `@Factory` 注解和监听器的结合使用，可以动态生成测试类实例，使测试更加灵活。

## 给出 junit/junit5/testNG 等常见 java 测试框架的对比表格，越详细越好

以下是JUnit、JUnit 5和TestNG等常见Java测试框架的对比表格。

| 功能/特性                | JUnit 4               | JUnit 5                | TestNG                 |
|-------------------------|-----------------------|------------------------|------------------------|
| **注解**                  | `@Test`, `@Before`, `@After`, `@Ignore`, etc. | `@Test`, `@BeforeEach`, `@AfterEach`, `@BeforeAll`, `@AfterAll`, etc. | `@Test`, `@BeforeSuite`, `@AfterSuite`, `@BeforeTest`, `@AfterTest`, etc. |
| **参数化测试**             | 使用 `@Parameters` 注解 | 支持参数化测试方法，通过 `@ParameterizedTest` 和 `@ValueSource` 等注解 | 支持参数化测试方法，通过 `@Parameters` 注解 |
| **断言**                  | 使用 JUnit 提供的 `Assert` 类 | 使用 JUnit 5 提供的 `Assertions` 类 | 使用 TestNG 提供的 `Assert` 类 |
| **测试生命周期**            | 单一测试生命周期（`@Before`和`@After`在每个测试方法前后执行） | 更灵活的测试生命周期，可以使用 `@BeforeEach`、`@AfterEach`、`@BeforeAll`、`@AfterAll` | 更灵活的测试生命周期，支持 `@BeforeSuite`、`@AfterSuite`、`@BeforeTest`、`@AfterTest` 等 |
| **依赖测试**               | 通过方法名指定依赖关系 | 使用 `dependsOnMethods` 属性指定测试方法的依赖关系 | 使用 `dependsOnMethods` 或 `dependsOnGroups` 属性指定测试方法或测试组之间的依赖关系 |
| **并发测试**               | 不直接支持并发测试         | 支持并发测试，可以配置测试类或测试方法并发执行 | 支持并发测试，可以在测试套件或测试方法级别设置并发数 |
| **测试分组**               | 通过命名规则或自定义注解进行分组 | 使用 `@Tag` 注解进行分组 | 使用 `@Test(groups = "groupname")` 进行分组 |
| **测试套件**               | 不直接支持测试套件         | 使用 `@RunWith` 注解和 `@Suite` 注解支持测试套件 | 支持通过 XML 文件配置测试套件 |
| **数据驱动测试**            | 通常通过参数化测试实现       | 支持参数化测试和动态测试（通过 `@TestFactory` 实现） | 支持数据驱动测试，通过 `@DataProvider` 注解提供测试数据 |
| **监听器**                 | 通过实现 `TestWatcher` 接口等实现 | 支持扩展 `TestExecutionListener` 接口和 `@ExtendWith` 注解 | 提供了丰富的监听器接口，通过实现这些接口实现监听功能 |
| **报告生成**               | 需要依赖第三方插件，如 Ant 或 Maven 插件 | 支持通过插件生成报告，如 Maven Surefire 插件 | 自动生成详细的 HTML 报告 |
| **软断言**                | 不支持软断言              | 不支持软断言，但可以通过异常处理实现类似的效果 | 支持软断言，即使在断言失败时，测试方法仍然会继续执行 |
| **开发者社区**              | 巨大且成熟               | 正在逐渐增长，对于新项目可能还没有 JUnit 4 大 | 成熟且广泛使用，拥有强大的社区支持 |

* any list
{:toc}