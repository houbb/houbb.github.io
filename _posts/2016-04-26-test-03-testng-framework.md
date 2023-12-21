---
layout: post
title: test-02-java 单元测试框架 testNG 入门介绍
date:  2016-4-26 12:53:12 +0800
categories: [Test]
tags: [junit, test]
published: true
---

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


# Simple Demo

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

# JUnitGenerator

这个[插件](http://plugins.jetbrains.com/plugin/3064)允许在右键单击“Generate...”菜单时，针对一个Java类生成JUnit测试。

可以使用提供的Velocity模板自定义单元测试的输出代码，以根据源类格式化代码。

如果在已经存在的地方创建单元测试，用户将被提示选择覆盖或合并操作。

合并操作允许用户有选择地创建目标文件内容。

![JUnitGenerator](https://raw.githubusercontent.com/houbb/resource/master/img/junit/2016-08-30-junit.png)

- set the output path

```
${SOURCEPATH}/../../test/java/${PACKAGE}/${FILENAME}
```

- set the junit4 template

```java
########################################################################################
##
## Available variables:
##         $entryList.methodList - List of method composites
##         $entryList.privateMethodList - List of private method composites
##         $entryList.fieldList - ArrayList of class scope field names
##         $entryList.className - class name
##         $entryList.packageName - package name
##         $today - Todays date in MM/dd/yyyy format
##
##            MethodComposite variables:
##                $method.name - Method Name
##                $method.signature - Full method signature in String form
##                $method.reflectionCode - list of strings representing commented out reflection code to access method (Private Methods)
##                $method.paramNames - List of Strings representing the method's parameters' names
##                $method.paramClasses - List of Strings representing the method's parameters' classes
##
## You can configure the output class name using "testClass" variable below.
## Here are some examples:
## Test${entry.ClassName} - will produce TestSomeClass
## ${entry.className}Test - will produce SomeClassTest
##
########################################################################################
##
#macro (cap $strIn)$strIn.valueOf($strIn.charAt(0)).toUpperCase()$strIn.substring(1)#end
## Iterate through the list and generate testcase for every entry.
#foreach ($entry in $entryList)
#set( $testClass="${entry.className}Test")
##
package $entry.packageName;

import org.junit.Test;
import org.junit.Before;
import org.junit.After;

/**
* ${entry.className} Tester.
*
* @author houbinbin
* @since $today
* @version 1.0
*/
public class $testClass {

    @Before
    public void before() throws Exception {
    }

    @After
    public void after() throws Exception {
    }

    #foreach($method in $entry.methodList)
/**
    *
    * Method: $method.signature
    *
    */
    @Test
    public void ${method.name}Test() throws Exception {
    }

    #end

    #foreach($method in $entry.privateMethodList)
/**
    *
    * Method: $method.signature
    *
    */
    @Test
    public void ${method.name}Test() throws Exception {
    #foreach($string in $method.reflectionCode)
    $string
    #end
}

#end
}
#end
```

- test template with Mockito

```java
########################################################################################
##
## Available variables:
##         $entryList.methodList - List of method composites
##         $entryList.privateMethodList - List of private method composites
##         $entryList.fieldList - ArrayList of class scope field names
##         $entryList.className - class name
##         $entryList.packageName - package name
##         $today - Todays date in MM/dd/yyyy format
##
##            MethodComposite variables:
##                $method.name - Method Name
##                $method.signature - Full method signature in String form
##                $method.reflectionCode - list of strings representing commented out reflection code to access method (Private Methods)
##                $method.paramNames - List of Strings representing the method's parameters' names
##                $method.paramClasses - List of Strings representing the method's parameters' classes
##
## You can configure the output class name using "testClass" variable below.
## Here are some examples:
## Test${entry.ClassName} - will produce TestSomeClass
## ${entry.className}Test - will produce SomeClassTest
##
########################################################################################
##
#macro (cap $strIn)$strIn.valueOf($strIn.charAt(0)).toUpperCase()$strIn.substring(1)#end
#macro (uncap $strIn)$strIn.valueOf($strIn.charAt(0)).toLowerCase()$strIn.substring(1)#end
## Iterate through the list and generate testcase for every entry.
#foreach ($entry in $entryList)
#set( $testClass="${entry.className}Test")
##
package $entry.packageName;

import org.junit.Test;
import org.junit.Before;
import org.mockito.InjectMocks;
import org.mockito.MockitoAnnotations;

/**
* ${entry.className} Tester.
*
* @author houbinbin
* @since $today
* @version 1.0
*/
public class $testClass {

    @InjectMocks
    private ${entry.className} #uncap(${entry.className});

    @Before
    public void init() {
     MockitoAnnotations.initMocks(this);
    }

    #foreach($method in $entry.methodList)
/**
    *
    * Method: $method.signature
    *
    */
    @Test
    public void ${method.name}Test() throws Exception {
    }

    #end

    #foreach($method in $entry.privateMethodList)
/**
    *
    * Method: $method.signature
    *
    */
    @Test
    public void ${method.name}Test() throws Exception {
    #foreach($string in $method.reflectionCode)
    $string
    #end
}

#end
}
#end
```

# Mockito

[Mockito](http://site.mockito.org/) 是一个味道非常好的模拟框架。它允许您使用简洁清晰的 API 编写漂亮的测试。

Mockito 不会让您感到不适，因为测试非常可读，而且产生的验证错误也很清晰。

如果您想测试类 A，如下所示，您首先需要创建类 BCD。

<uml>
  classA->classB:
  classB->classC:
  classB->classD:
</uml>

如下的测试方式：classA->classBMock:


> Hello World

- maven jar

```xml
<dependency>
  <groupId>org.mockito</groupId>
  <artifactId>mockito-all</artifactId>
  <version>1.8.4</version>
</dependency>
```

- hello world

```java
@Test
public void testMock() {
  List<String> mockedList = mock(List.class);

  // stubbing appears before the actual execution
  when(mockedList.get(0)).thenReturn("hello");

  String result = mockedList.get(0);

  //verify has called get(0)
  verify(mockedList).get(0);

  assertEquals("hello", result);
}
```

- Mock demo

```java
public class UserServiceTest {
  @InjectMocks
  private UserService userService;

  @Mock
  private UserDao userDao;

  @Before
  public void init(){
      MockitoAnnotations.initMocks(this);

      //mock the method
      User user = new User();
      Mockito.when(this.UserDao.selectUser(Mockito.anyString()))
          .thenReturn(user);
  }

  @Test
  public void testGetUser() {

  }
}
```

# PowerMock

## 介绍

PowerMock 是一个用于 Java 单元测试的框架，它扩展了传统的单元测试框架，使得在测试过程中更容易处理一些复杂的场景，如静态方法、构造函数、私有方法等。

PowerMock 通过使用 Java 的字节码操纵技术，使得我们能够模拟和修改那些通常很难在传统单元测试中处理的代码结构。

## 主要特点

PowerMock 是一个用于 Java 单元测试的框架，它扩展了传统的单元测试框架，使得在测试过程中更容易处理一些复杂的场景，如静态方法、构造函数、私有方法等。

PowerMock 通过使用 Java 的字节码操纵技术，使得我们能够模拟和修改那些通常很难在传统单元测试中处理的代码结构。

以下是 PowerMock 的一些主要特点和用法：

1. **Mock 静态方法和构造函数：** PowerMock 允许模拟静态方法和构造函数，这在传统的单元测试框架中是很难做到的。通过 PowerMockito 类，可以使用 `mockStatic` 和 `when` 等方法模拟静态方法的行为。

    ```java
    PowerMockito.mockStatic(ClassName.class);
    when(ClassName.staticMethod()).thenReturn(mockedValue);
    ```

2. **Mock 私有方法：** PowerMock 允许模拟私有方法的行为。通过使用 `PowerMockito` 的 `when` 和 `method` 方法，可以模拟私有方法的返回值。

    ```java
    PowerMockito.when(instance, "privateMethod").thenReturn(mockedValue);
    ```

3. **Partial Mocking：** PowerMock 允许进行部分模拟，即在一个对象中模拟部分方法的行为，而保留其原始行为。这对于需要保留一些实际逻辑的情况很有用。

    ```java
    PowerMockito.when(instance, "methodToMock").thenReturn(mockedValue);
    ```

4. **Runner 支持：** 

PowerMock 提供了自己的 JUnit Runner，通过在测试类上使用 `@RunWith(PowerMockRunner.class)` 注解，可以启用 PowerMock 的功能。

    ```java
    @RunWith(PowerMockRunner.class)
    public class MyTest {
        // Test methods here
    }
    ```

5. **PowerMockito 和 Mockito 的结合：** 

PowerMockito 是 PowerMock 的 Mockito 扩展，因此可以在测试中使用 Mockito 的语法，并结合 PowerMock 的功能。

    ```java
    import static org.mockito.Mockito.*;

    // ...

    // 使用 Mockito 的语法
    when(mock.method()).thenReturn(mockedValue);

    // 使用 PowerMockito 的语法
    PowerMockito.mockStatic(ClassName.class);
    ```

PowerMock 是一个强大的工具，但在使用时需要注意，滥用它可能会导致测试变得复杂和难以理解。

通常情况下，应该首先考虑使用更传统的单元测试方法，只有在必要时才考虑使用 PowerMock。


# java 模拟框架除了 Mockito/PowerMock，还有什么?

除了 Mockito 和 PowerMock，还有一些其他流行的 Java 模拟框架，其中一些包括：

1. **EasyMock：** EasyMock 是一个简单易用的模拟框架，它允许创建模拟对象、设置预期行为以及验证方法的调用。与 Mockito 相似，EasyMock 也提供了一种相对简单的语法。

2. **JMockit：** JMockit 是一个功能强大的 Java 测试工具，它不仅支持模拟对象，还支持对真实对象进行测试。它的语法和功能相对丰富，可以用来进行各种类型的测试，包括模拟、预期和验证等。

3. **MockitoKotlin：** MockitoKotlin 是 Mockito 的 Kotlin 扩展，为 Kotlin 语言提供了更自然的语法。如果项目中使用了 Kotlin，MockitoKotlin 可能是一个不错的选择。

4. **JMock：** JMock 是另一个用于 Java 的模拟框架，它通过使用自己的 DSL（领域特定语言）来定义模拟对象的预期行为。JMock 在某些情况下可能更灵活，但学习曲线可能相对陡峭。

5. **Spock：** Spock 是一个基于 Groovy 的测试框架，它集成了模拟功能。虽然它不是纯粹的 Java 框架，但由于其强大的特性，也经常被 Java 开发者使用。

## 对比

以下是一些常见的 Java 模拟框架的对比表格。请注意，框架的发展可能导致一些变化，建议查阅官方文档以获取最新信息。

| 功能/特性                  | Mockito           | PowerMock          | EasyMock           | JMockit           | MockitoKotlin     | JMock             | Spock            |
|--------------------------|-------------------|--------------------|--------------------|-------------------|-------------------|-------------------|------------------|
| 模拟对象                 | ✔                 | ✔                  | ✔                  | ✔                 | ✔                 | ✔                 | ✔                |
| 部分模拟                 | ✘                 | ✔                  | ✘                  | ✔                 | ✘                 | ✘                 | ✔                |
| 模拟静态方法和构造函数    | ✘ (部分支持)      | ✔                  | ✘                  | ✔                 | ✘                 | ✘                 | ✔                |
| 模拟私有方法             | ✘ (部分支持)      | ✔                  | ✘                  | ✔                 | ✘                 | ✔                 | ✔                |
| 模拟 Final 类            | ✘ (部分支持)      | ✔                  | ✘                  | ✔                 | ✘                 | ✘                 | ✘ (需要 Spock)  |
| 支持的测试框架           | JUnit, TestNG      | JUnit, TestNG       | JUnit, TestNG       | JUnit, TestNG      | JUnit, TestNG      | JUnit, TestNG      | Spock            |
| 验证方法的调用次数        | ✔                 | ✔                  | ✔                  | ✔                 | ✔                 | ✔                 | ✔                |
| 验证方法的调用顺序        | ✘                 | ✘                  | ✘                  | ✔                 | ✘                 | ✘                 | ✔                |
| 预期和验证异常           | ✔                 | ✔                  | ✔                  | ✔                 | ✔                 | ✔                 | ✔                |
| 支持的语言               | Java              | Java               | Java               | Java, Kotlin      | Kotlin            | Java              | Groovy, Java     |
| 社区活跃度               | 高                | 中等               | 低                | 高                | 中等               | 低                | 中等             |
| 学习曲线                 | 低                | 中等               | 中等               | 中等               | 低                | 中等               | 低               |



> https://github.com/jayway/powermock


* any list
{:toc}