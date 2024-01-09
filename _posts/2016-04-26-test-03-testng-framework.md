---
layout: post
title: test-03-java 单元测试框架 testNG 入门介绍
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

# 快速入门

TestNG是一个受到JUnit和NUnit启发的测试框架，引入了一些新功能，使其更强大且更易于使用，例如：

- 注解。
- 使用各种可用策略在任意大的线程池中运行测试（每个方法在自己的线程中，每个测试类一个线程等）。
- 测试代码的多线程安全性。
- 灵活的测试配置。
- 支持数据驱动测试（使用@DataProvider）。
- 支持参数。
- 强大的执行模型（不再需要TestSuite）。
- 受多种工具和插件支持（Eclipse、IDEA、Maven等）。
- 嵌入BeanShell以提供更大的灵活性。
- 运行时和日志记录的默认JDK函数（无依赖）。
- 用于应用服务器测试的依赖方法。
TestNG被设计用于涵盖所有测试类别：单元测试、功能测试、端到端测试、集成测试等...

我开始使用TestNG是因为我对JUnit的一些不足感到沮丧，我在我的博客中记录了其中的一些问题，可以在这里和这里阅读。

阅读这些条目可能会让您更好地了解我尝试通过TestNG实现的目标。

您还可以查看主要功能的快速概述以及描述一个非常具体的示例的文章，其中多个TestNG功能的组合提供了一个直观且易于维护的测试设计。

以下是一个非常简单的测试示例：

```java
package example1;

import org.testng.annotations.*;

public class SimpleTest {

  @BeforeClass
  public void setUp() {
    // 当此测试被实例化时将被调用的代码
  }

  @Test(groups = { "fast" })
  public void aFastTest() {
    System.out.println("快速测试");
  }

  @Test(groups = { "slow" })
  public void aSlowTest() {
    System.out.println("慢速测试");
  }

}
```

"setUp()" 方法将在构建测试类后、在运行任何测试方法之前被调用。

在这个例子中，我们将运行 "fast" 组，因此将调用 "aFastTest()" 方法，而 "aSlowTest()" 方法将被跳过。

需要注意的一些重要事项：

- 无需扩展类或实现接口。
- 即使上述示例使用了JUnit的约定，方法可以使用任何你喜欢的名称；关键是注解告诉TestNG它们的用途。
- 一个测试方法可以属于一个或多个组。

在将测试类编译到构建目录之后，可以使用命令行、Ant 任务（如下所示）或XML文件来调用测试：

```xml
<project default="test">
 
 <path id="cp">
   <pathelement location="lib/testng-testng-5.13.1.jar"/>
   <pathelement location="build"/>
 </path>
 
 <taskdef name="testng" classpathref="cp"
          classname="org.testng.TestNGAntTask" />
 
 <target name="test">
   <testng classpathref="cp" groups="fast">
     <classfileset dir="build" includes="example1/*.class"/>
   </testng>
 </target>
 
</project>
```

使用 Ant 来调用它：

```bash
c:> ant
```

然后，您可以浏览测试结果：

```bash
start test-output\index.html（在Windows上）
```

## 要求

TestNG 版本在v7.5及以下：JDK 8 或更高版本。

TestNG 版本在v7.6.0及以上：JDK 11 或更高版本。

## 邮件列表

用户邮件列表可以在 Google Groups 上找到。
如果您有兴趣参与TestNG的开发，请加入开发者邮件列表。
如果您只关注了解TestNG的新版本，可以加入低频的TestNG公告邮件列表。
项目位置
如果您有兴趣为TestNG或其中一个IDE插件做贡献，您将在以下位置找到它们：

- TestNG
- Eclipse插件
- IDEA IntelliJ插件
- Visual Studio Code插件

## Bug 报告
如果您认为发现了一个 bug，这是如何报告的方法：
1. 创建一个小项目，使我们能够重现此 bug。在大多数情况下，一个或两个Java源文件和一个testng.xml文件应该足够了。然后，您可以将其压缩并通过电子邮件发送到 testng-dev 邮件列表，或在开源托管站点（如 GitHub）上提供，然后通过电子邮件通知 testng-dev，以便我们知晓。请确保该项目是自包含的，以便我们可以立即构建它（删除对外部或专有框架的依赖等）。
2. 如果您观察到的 bug 是在 Eclipse 插件上，请确保您的示例项目包含 .project 和 .classpath 文件。
3. 提交 bug 报告。
有关更多信息，您可以下载 TestNG，阅读手册或浏览顶部的链接。

# testNG

TestNG是一个旨在简化各种测试需求的测试框架，从单元测试（在其他类的隔离环境中测试一个类）到集成测试（测试由多个类、多个包甚至多个外部框架（如应用服务器）组成的整个系统）。

编写测试通常是一个三步过程：

1. 编写测试的业务逻辑并在代码中插入TestNG注解。
2. 在testng.xml文件或build.xml文件中添加关于测试的信息（例如类名、希望运行的组等）。
3. 运行TestNG。

在欢迎页面上可以找到一个快速示例。
本文档中使用的概念如下：

- 一个Suite由一个XML文件表示。它可以包含一个或多个测试，并由`<suite>`标签定义。
- 一个Test由`<test>`表示，可以包含一个或多个TestNG类。
- 一个TestNG类是一个包含至少一个TestNG注解的Java类。它由`<class>`标签表示，可以包含一个或多个测试方法。
- 一个测试方法是在源代码中由`@Test`注解的Java方法。
- 通过`@BeforeXXX`和`@AfterXXX`注解可以配置TestNG测试，这允许在某个特定点之前和之后执行一些Java逻辑，这些点可以是上述任何项目。

本手册的其余部分将解释以下内容：

- 所有注解的列表及简要说明。这将让您了解TestNG提供的各种功能，但您可能想要查阅每个注解专用部分以了解详细信息。
- testng.xml文件的描述、语法及其中可以指定的内容。
- 各种功能的详细列表以及如何结合注解和testng.xml来使用它们。

# 注解

以下是TestNG中可用注解的快速概述，以及它们的属性。
  
配置TestNG类的注解：

- **@BeforeSuite：** 该注解的方法将在运行此套件中的所有测试之前运行。
- **@AfterSuite：** 该注解的方法将在运行此套件中的所有测试之后运行。
- **@BeforeTest：** 该注解的方法将在运行属于`<test>`标签内的类的任何测试方法之前运行。
- **@AfterTest：** 该注解的方法将在运行属于`<test>`标签内的类的所有测试方法之后运行。
- **@BeforeGroups：** 这个配置方法将在运行属于这些组中任何一个的第一个测试方法之前运行。保证在调用属于这些组中任何一个的第一个测试方法之前运行。
- **@AfterGroups：** 这个配置方法将在运行属于这些组中任何一个的最后一个测试方法之后运行。保证在调用属于这些组中任何一个的最后一个测试方法之后运行。
- **@BeforeClass：** 该注解的方法将在当前类中的第一个测试方法被调用之前运行。
- **@AfterClass：** 该注解的方法将在当前类中的所有测试方法被运行之后运行。
- **@BeforeMethod：** 该注解的方法将在每个测试方法之前运行。
- **@AfterMethod：** 该注解的方法将在每个测试方法之后运行。

在TestNG类的超类中的注解行为

将这些注解放在TestNG类的超类上时，这些注解也会被继承。这对于例如将多个测试类的测试设置集中在一个共同的超类中是有用的。

在这种情况下，TestNG保证在继承顺序中执行“@Before”方法（从最高超类开始，然后沿着继承链向下移动），并且“@After”方法以相反的顺序执行（沿着继承链向上移动）。

- **alwaysRun：** 对于@Before方法（beforeSuite、beforeTest、beforeTestClass和beforeTestMethod，但不是beforeGroups）：如果设置为true，无论它属于哪个组，都将运行此配置方法。对于@After方法（afterSuite、afterClass等）：如果设置为true，则即使先前调用的一个或多个方法失败或被跳过，也将运行此配置方法。
- **dependsOnGroups：** 该方法依赖的组的列表。
- **dependsOnMethods：** 该方法依赖的方法的列表。
- **enabled：** 是否启用此类/方法上的方法。
- **groups：** 此类/方法所属的组列表。
- **inheritGroups：** 如果为true，则此方法将属于@Test注解在类级别指定的组。
- **onlyForGroups：** 仅适用于@BeforeMethod和@AfterMethod。如果指定了，则只有在相应的测试方法属于列出的组之一时，才会调用此设置/拆卸方法。

- **@DataProvider：** 将方法标记为为测试方法提供数据。被标记的方法必须返回一个Object[]数组，其中每个Object[]可以分配给测试方法的参数列表。希望从此DataProvider接收数据的@Test方法需要使用一个dataProvider的名称，该名称等于此注解的名称。
  - **name：** 此数据提供程序的名称。如果未提供，将自动将此数据提供程序的名称设置为方法的名称。
  - **parallel：** 如果设置为true，使用此数据提供程序生成的测试将并行运行。默认值为false。

- **@Factory：** 将方法标记为一个工厂，该工厂返回将由TestNG用作测试类的对象。该方法必须返回Object[]。

- **@Listeners：** 定义测试类上的监听器。
  - **value：** 一个扩展org.testng.ITestNGListener的类数组。

- **@Parameters：** 描述如何将参数传递给@Test方法。
  - **value：** 用于填充此方法的参数的变量列表。

- **@Test：** 将类或方法标记为测试的一部分。
  - **alwaysRun：** 如果设置为true，此测试方法将始终运行，即使它依赖于失败的方法。
  - **dataProvider：** 此测试方法的数据提供程序的名称。
  - **dataProviderClass：** 查找数据提供程序的类。如果未指定，将在当前测试方法的类或其基类的类上查找数据提供程序。如果指定了此属性，则数据提供程序方法需要在指定的类上是静态的。
  - **dependsOnGroups：** 该方法依赖的组的列表。
  - **dependsOnMethods：** 该方法依赖的方法的列表。
  - **description：** 此方法的描述。
  - **enabled：** 是否启用此类/方法上的方法。
  - **expectedExceptions：** 测试方法预计引发的异常列表。如果引发的异常与此列表中的异常不同，或者未引发异常，则将标记此测试为失败。
  - **groups：** 此类/方法所属的组列表。
  - **invocationCount：** 应调用此方法的次数。
  - **invocationTimeOut：** 此测试的累积时间（以毫秒为单位）的最大时间。如果未指定invocationCount，则将忽略此属性。
  - **priority：** 此测试方法的优先级。较低的优先级将首先安排。
  - **successPercentage：** 期望从此方法获得成功的百分比。
  - **singleThreaded：** 如果设置为true，则保证此测试类的所有方法都将在同一线程中运行，即使使用parallel="methods"运行测试。此属性仅可在类级别使用，如果在方法级别使用，则将被忽略。
  - **timeOut：** 此测试应运行的最长时间（以毫秒为单位）。
  - **threadPoolSize：** 为此方法指定的线程池大小。将以invocationCount指定的次数从多个线程调用该方法。请注意：如果未指定invocationCount，则将忽略此属性。

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

## 给出 testNG 的学习资料，包含网址

TestNG 是一个流行的 Java 测试框架，用于编写和运行测试。

以下是一些学习 TestNG 的资源，包括网址：

1. **官方文档**:
   - [TestNG 官方文档](https://testng.org/doc/documentation-main.html) - TestNG 的官方文档是学习的首要资源，包含了详细的教程、示例和配置说明。

2. **教程和博客**:
   - [TestNG 教程](https://www.tutorialspoint.com/testng/index.htm) - Tutorialspoint 上的 TestNG 教程提供了简单易懂的指导。
   - [Mkyong 的 TestNG 教程](https://www.mkyong.com/tutorials/testng-tutorials/) - Mkyong 提供了一系列 TestNG 相关的教程和例子。
   - [TestNG 教程 - Guru99](https://www.guru99.com/all-about-testng-and-selenium.html) - Guru99 上的 TestNG 教程覆盖了与 Selenium 结合使用的方面。

3. **视频教程**:
   - [YouTube 上的 TestNG 教程](https://www.youtube.com/playlist?list=PLqq-6Pq4lTTZSKAFG6aCDVDP86Qx4lNas) - YouTube 上有许多 TestNG 的视频教程，这个播放列表是其中之一。

4. **GitHub 示例**:
   - [TestNG 示例项目](https://github.com/cbeust/testng) - TestNG 的官方 GitHub 存储库包含了示例项目和源代码，可以帮助你深入了解框架的使用。

5. **书籍**:
   - 《Java程序员面试宝典》 - 这本书中包含了有关 TestNG 的基础知识和示例。

请注意，网址和资源可能会随时间变化，建议使用最新版本的 TestNG，并检查相关资源的更新。

希望这些资源能帮助你更好地学习和使用 TestNG。

# 参考资料

https://testng.org/doc/documentation-main.html

* any list
{:toc}