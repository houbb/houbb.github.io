---
layout: post
title: test-01-java 单元测试框架 junit 入门介绍
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

# JUnit

[JUnit](http://junit.org/junit4/) 是一个用于编写可重复测试的简单框架。

它是 xUnit 架构的一种实例，专门用于单元测试框架。

> What to test?

| Need           |   Desc        |
| :------------ |:----------    |
| Right |   结果是否正确          |
| B     |   边界条件是否满足       |
| I     |   能反向关联吗           |
| C     |   有其他手段交叉检查吗    |
| E     |   是否可以强制异常发生    |
| P     |   性能问题              |


# maven 入门例子

## maven 引入

```xml
<dependency>
    <groupId>junit</groupId>
    <artifactId>junit</artifactId>
    <version>4.13.2</version>
    <scope>test</scope>
</dependency>
```

## 方法

```java
public class Calculator {
    public int add(int a, int b) {
        return a + b;
    }
}
```

## 测试方法

```java
import org.junit.Test;
import static org.junit.Assert.*;

public class CalculatorTest {

    @Test
    public void testAdd() {
        // Arrange
        Calculator calculator = new Calculator();

        // Act
        int result = calculator.add(3, 7);

        // Assert
        assertEquals(10, result);
    }
}
```

CalculatorTest 类包含了一个测试方法 testAdd，用于测试 Calculator 类的 add 方法。

@Test 注解表示这是一个测试方法。

在测试方法中，我们首先创建了一个 Calculator 对象，然后调用 add 方法进行加法操作。

最后，使用 assertEquals 断言来验证计算的结果是否符合预期值。

## 运行测试类

在 IDE 中，通常有一个 "Run" 或 "Debug" 按钮，可以直接运行测试类。

也可以通过 

```
mvn test
```

统一执行测试用例

## 验证结果

测试运行后，IDE 会显示测试结果。

如果测试通过，你将看到一个绿色的标志；如果测试失败，将会显示红色的标志，并且会提供详细的失败信息。

# 我们自己的测试例子

- 我们创建一个用于学生的测试类；

```java
public class StudentTest extends TestCase {
    public void testCreate() {
        Student student =  new Student("Mike");
    }
}
```

- Student class

```java
public class Student {
    private String name;

    public Student(String name) {
        this.name = name;
    }

    public String getName() {
        return "ryo";
    }

    public void setName(String name) {
        this.name = name;
    }
}
```

当我们运行 `StudentTest` 时，

![success](https://raw.githubusercontent.com/houbb/resource/master/img/2016-04-27-success-junit.png)

接着，我们修改测试代码。

```java
public class StudentTest extends TestCase {
    public void testCreate() {
        Student student =  new Student("Mike");
        String name = student.getName();

        assertEquals("Mike", name);
    }
}
```

result

![failed](https://raw.githubusercontent.com/houbb/resource/master/img/2016-04-27-failed-junit.png)

# Usage

- Add jars in IDEA

```
File --> Project Structure  [crtl+alt+shift+s] --> Libraries --> "+"---> "Attach Files or Directories"
```
- setUp()

Now we add a new class Course.

```java
public class Course {
    private String name;
    private int num;

    public Course(String name, int num) {
        this.name = name;
        this.num = num;
    }

    public String getName() {
        return name;
    }

    public int getNum() {
        return num;
    }
}
```

test class like this...

```java
public class CourseTest extends TestCase {
    public void testCreateNum() {
        Course course = new Course("Math", 1);
        assertEquals(1, course.getNum());
    }

    public void testCreateName() {
        Course course = new Course("Math", 1);
        assertEquals("Helo", course.getName());
    }
}
```

```java
Course course = new Course("Math", 1);
```

我们已经写了两次，有没有更简单的方法？

现在，我们可以使用 ```setUp()``` 来帮助我们更轻松地进行测试；```setUp()``` 中的内容将在每个测试方法执行**之前**调用。

```java
public class CourseTest extends TestCase {
    private Course course;
    public void setUp() {
        course = new Course("Math", 1);
    }

    public void testCreateNum() {
        assertEquals(1, course.getNum());
    }

    public void testCreateName() {
        assertEquals("Helo", course.getName());
    }
}
```

- `tearDown()`

  此外，```tearDown()``` 将在每个测试方法执行**之后**调用。

- `@Before`

  用 `@Before` 注解的方法在每次测试之前执行；同样，`@After` 在每次测试之后执行。

- `@BeforeClass`

  只运行一次，并且是唯一的。


# chat

## 更深层的理解

JUnit 是一个广泛用于 Java 单元测试的框架，它在测试驱动开发（TDD）和行为驱动开发（BDD）等软件开发方法中起着关键的作用。

以下是对 JUnit 更深层次理解的一些要点：

1. **测试生命周期：** JUnit 测试生命周期由注解控制，例如 `@Before` 和 `@After` 用于在测试方法执行前后进行一些初始化和清理操作。此外，`@BeforeClass` 和 `@AfterClass` 用于在整个测试类的开始和结束时执行。

2. **断言和匹配器：** JUnit 提供了丰富的断言方法，例如 `assertEquals`、`assertTrue`、`assertNotNull` 等，用于验证实际结果与预期值是否一致。JUnit 还支持 Hamcrest 匹配器，允许更灵活和表达性强的断言。

3. **参数化测试：** JUnit 4 引入了参数化测试，通过 `@Parameterized` 和 `@RunWith(Parameterized.class)` 注解，可以让同一个测试方法多次运行，每次使用不同的参数。这对于测试多个输入情况非常有用。

4. **异常测试：** 使用 `@Test` 的 `expected` 属性或者更为灵活的 `@Rule` 和 `ExpectedException` 类，可以方便地测试代码是否抛出了预期的异常。

5. **测试套件：** JUnit 支持创建测试套件，可以将多个测试类组合在一起执行。这对于组织和执行一系列相关的测试非常有用。

6. **规则（Rules）：** JUnit 规则是在测试运行期间执行的附加操作，可以通过自定义规则实现更灵活的测试控制。例如，`TemporaryFolder` 规则用于创建临时文件夹，`Timeout` 规则用于设置测试方法的最大执行时间。

7. **扩展（Extensions）：** JUnit 5 引入了扩展模型，允许开发者编写自定义扩展，从而实现更多的测试控制和定制化。这对于与依赖注入框架集成、自定义测试运行器等场景非常有用。

8. **Mocking 和 Stubbing：** JUnit 通过其他库（如 Mockito）的集成，支持对代码中的依赖进行模拟（Mocking）和存根（Stubbing），从而在测试中隔离被测单元。

9. **测试运行器（Runners）：** JUnit 支持通过测试运行器扩展测试执行的行为。例如，`@RunWith` 注解允许指定一个自定义的测试运行器，用于修改测试执行的过程。

10. **并发测试：** JUnit 5 引入了对并发测试的支持，通过 `@RepeatedTest` 和 `@TestInstance` 注解，可以更方便地编写和执行并发测试。

深入理解 JUnit 不仅有助于编写更健壮、可维护的单元测试，还有助于更好地应用测试驱动开发和持续集成等软件开发实践。

# 小结

单元测试作为入门级别的测试工具，却非常的经典。

可以为我们的代码质量保驾护航。

* any list
{:toc}