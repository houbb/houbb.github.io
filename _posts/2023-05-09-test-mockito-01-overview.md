---
layout: post
title: mockito-01-overview mockito 简介及入门使用
date:  2023-05-09 +0800
categories: [Test]
tags: [junit, test, sh]
published: true
---

# 拓展阅读

[jmockit-01-jmockit 入门使用案例](https://houbb.github.io/2023/05/09/test-jmockit-00-intro)

[jmockit-02-概览](https://houbb.github.io/2023/05/09/test-jmockit-01-overview)

[jmockit-03-Mocking 模拟](https://houbb.github.io/2023/05/09/test-jmockit-03-mocking)

[jmockit-04-Faking 伪造](https://houbb.github.io/2023/05/09/test-jmockit-04-faking)

[jmockit-05-代码覆盖率](https://houbb.github.io/2023/05/09/test-jmockit-05-code-converate)

[mockito-01-入门介绍](https://houbb.github.io/2023/05/09/test-mockito-01-overivew)

[mockito-02-springaop 整合遇到的问题，失效](https://houbb.github.io/2023/05/09/test-mockito-02-springaop)


# mockito

Mockito 是一个非常好用的模拟框架，它让你能够使用清晰简洁的 API 编写出优雅的测试代码。

Mockito 不会让你头疼，因为它生成的测试代码非常易读，并且能够提供清晰的验证错误信息。了解更多关于它的特性和动机。

庞大的 StackOverflow 社区将 Mockito 评选为 Java 最佳的模拟框架。尽管 StackOverflow 不鼓励那些可能引发情绪争议的问题，但事实是 Mockito 获得了最多的支持票数。

在所有 Java 库中，不仅仅是测试工具，Mockito 位列前十。在 2013 年底，有人对 30,000 个 GitHub 项目进行了分析。虽然 Mockito 在主要报告中排名第九，但 mockito-core 和 mockito-all 是同一个工具，因此 Mockito 的实际位置是第四，超过了像 Guava 或者 Spring 这样的知名工具。将这个研究视为 Mockito 每天对 Java 单元测试产生的巨大影响的一个指标。

Dan North，行为驱动开发的创始人，在 2008 年曾这样写道：

“在主要会议期间，我们决定使用 JUnit 4 和 Mockito，因为我们认为它们是 Java 中测试驱动开发和模拟的未来。”

考虑到 Mockito 当前的受欢迎程度，Dan 的预测完全正确。

在选择测试框架时，请根据自己的判断力来做决定。Mockito 团队始终尊重您的选择。每天继续编写出优秀的测试代码！


# How do I drink it?

获取 Mockito 的推荐方法是在您喜欢的构建系统中声明对“mockito-core”库的依赖。

使用 Gradle，您可以这样做：

```
repositories { mavenCentral() }
dependencies { testImplementation "org.mockito:mockito-core:3.+" }
```

Maven 用户可以声明对 mockito-core 的依赖。Mockito 将每个更改都发布为一个 -SNAPSHOT 版本，可在公共 Sonatype 存储库中获取。

手动管理依赖的用户可以直接从 Maven Central 下载 JAR 包。

使用手动依赖管理的传统构建可以使用 1.* 版本的 "mockito-all" 发行版。需要注意的是，在 Mockito 2.* 中，这个发行版已经被停止使用。

## now you can verify interactions

```java
import static org.mockito.Mockito.*;

// mock creation
List mockedList = mock(List.class);
// or even simpler with Mockito 4.10.0+
// List mockedList = mock();

// using mock object - it does not throw any "unexpected interaction" exception
mockedList.add("one");
mockedList.clear();

// selective, explicit, highly readable verification
verify(mockedList).add("one");
verify(mockedList).clear();
```

## and stub method calls

```java
// you can mock concrete classes, not only interfaces
LinkedList mockedList = mock(LinkedList.class);
// or even simpler with Mockito 4.10.0+
// LinkedList mockedList = mock();

// stubbing appears before the actual execution
when(mockedList.get(0)).thenReturn("first");

// the following prints "first"
System.out.println(mockedList.get(0));

// the following prints "null" because get(999) was not stubbed
System.out.println(mockedList.get(999));
```

## 主要特性

主要参考文档特性如下：

- **mock()/@Mock：** 创建模拟对象，可以选择通过 Answer/MockSettings 指定其行为。
- **when()/given()：** 指定模拟对象的行为。
- **如果提供的答案不符合需求，可以自定义答案，扩展 Answer 接口。**
- **spy()/@Spy：** 部分模拟，真实方法会被调用但仍然可以进行验证和存根。
- **@InjectMocks：** 自动注入带有 @Spy 或 @Mock 注解的字段。
- **verify()：** 用于检查方法是否以给定的参数被调用。
- **可以使用灵活的参数匹配，例如使用 any() 表达式，或者使用 @Captor 捕获调用的参数。**
- **尝试使用行为驱动开发（BDD）语法，使用 BDDMockito。**
- **在 Android 上使用 Mockito，这要感谢 Dexmaker 团队的工作。**

以上是 Mockito 的主要参考文档特性。

Mockito 提供了广泛的功能，使得在单元测试中模拟对象和验证方法调用变得非常方便。

## 记住：

- **不要对你不拥有的类型进行模拟。**
- **不要对值对象进行模拟。**
- **不要将所有东西都模拟。**
- **用你的测试表达爱意！**

点击这里获取更多文档和示例。所有文档都在 Java 文档中，所以你不需要经常访问那个页面。还有一张 RefCard（参考卡）。

如果您有建议，发现文档不清晰，或者发现了 bug，请写信给我们的邮件列表。

您可以在 GitHub 上报告功能请求和 bug。

# 什么是 Mock 测试

Mock通常是指，在测试一个对象A时，我们构造一些假的对象来模拟与A之间的交互，而这些Mock对象的行为是我们事先设定且符合预期。

通过这些Mock对象来测试A在正常逻辑，异常逻辑或压力情况下工作是否正常

Mock 测试就是在测试过程中，对于某些不容易构造（如 HttpServletRequest 必须在Servlet 容器中才能构造出来）或者不容易获取比较复杂的对象（如 JDBC 中的ResultSet 对象），用一个虚拟的对象（Mock 对象）来创建以便测试的测试方法。

**Mock 最大的功能是帮你把单元测试的耦合分解开，如果你的代码对另一个类或者接口有依赖，它能够帮你模拟这些依赖，并帮你验证所调用的依赖的行为**。

先来看看下面这个示例：

![mock](https://pdai.tech/images/develop/ut/ut-dev-mock-4.png)

从上图可以看出如果我们要对A进行测试，那么就要先把整个依赖树构建出来，也就是BCDE的实例。

一种替代方案就是使用mocks

![mock](https://pdai.tech/images/develop/ut/ut-dev-mock-5.png)

从图中可以清晰的看出, mock对象就是在调试期间用来作为真实对象的替代品。

mock测试就是在测试过程中，对那些不容易构建的对象用一个虚拟对象来代替测试的方法就叫mock测试。

# Mock 适用在什么场景

在使用Mock的过程中，发现Mock是有一些通用性的，对于一些应用场景，是非常适合使用Mock的：

- 真实对象具有不可确定的行为(产生不可预测的结果，如股票的行情)

- 真实对象很难被创建(比如具体的web容器)

- 真实对象的某些行为很难触发(比如网络错误)

- 真实情况令程序的运行速度很慢

- 真实对象有用户界面

- 测试需要询问真实对象它是如何被调用的(比如测试可能需要验证某个回调函数是否被调用了)

- 真实对象实际上并不存在(当需要和其他开发小组，或者新的硬件系统打交道的时候，这是一个普遍的问题)

当然，也有一些不得不Mock的场景：

1) 一些比较难构造的Object：这类Object通常有很多依赖，在单元测试中构造出这样类通常花费的成本太大。

2) 执行操作的时间较长Object：有一些Object的操作费时，而被测对象依赖于这一个操作的执行结果，例如大文件写操作，数据的更新等等，出于测试的需求，通常将这类操作进行Mock。

3) 异常逻辑：一些异常的逻辑往往在正常测试中是很难触发的，通过Mock可以人为的控制触发异常逻辑。在一些压力测试的场景下，也不得不使用Mock，例如在分布式系统测试中，通常需要测试一些单点（如namenode，jobtracker）在压力场景下的工作是否正常。而通常测试集群在正常逻辑下无法提供足够的压力（主要原因是受限于机器数量），这时候就需要应用Mock去满足。

# Mockito

## 官方资料

[Mockito 官方网站](https://site.mockito.org/)

[PowerMockito Github](https://github.com/powermock/powermock/)

## Maven 包引入

```xml
<dependencies>
    <dependency>
        <groupId>junit</groupId>
        <artifactId>junit</artifactId>
        <version>4.12</version>
        <scope>test</scope>
    </dependency>

    <!-- https://mvnrepository.com/artifact/org.mockito/mockito-core -->
    <dependency>
        <groupId>org.mockito</groupId>
        <artifactId>mockito-core</artifactId>
        <version>3.7.7</version>
        <scope>test</scope>
    </dependency>
</dependencies>
```

## 测试代码

- DemoService.java

```java
package org.example.mockito.learn.service;

import org.example.mockito.learn.dao.DemoDao;

public class DemoService {

    private DemoDao demoDao;

    public DemoService(DemoDao demoDao) {
        this.demoDao = demoDao;
    }

    public int getDemoStatus(){
        return demoDao.getDemoStatus();
    }

}
```

- DemoDao.java

```java
package org.example.mockito.learn.dao;

import java.util.Random;

public class DemoDao {

    public int getDemoStatus(){
        return new Random().nextInt();
    }

}
```

- 测试类

```java
package org.example.mockito.learn.service;

import org.example.mockito.learn.dao.DemoDao;
import org.junit.Assert;
import org.junit.Test;
import org.mockito.Mockito;

public class HelloWorldTest {

    @Test
    public void helloWorldTest() {
        // mock DemoDao instance
        DemoDao mockDemoDao = Mockito.mock(DemoDao.class);

        // 使用 mockito 对 getDemoStatus 方法打桩
        Mockito.when(mockDemoDao.getDemoStatus()).thenReturn(1);

        // 调用 mock 对象的 getDemoStatus 方法，结果永远是 1
        Assert.assertEquals(1, mockDemoDao.getDemoStatus());

        // mock DemoService
        DemoService mockDemoService = new DemoService(mockDemoDao);
        Assert.assertEquals(1, mockDemoService.getDemoStatus() );
    }

}
```

## 测试:使用mock方法

包含两块测试：一个是类测试，一个接口测试，具体如下：

```java
package org.example.mockito.learn.service;

import org.junit.Assert;
import org.junit.Test;

import java.util.List;
import java.util.Random;

import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;


public class MockClassTest {

    @Test
    public void mockClassTest() {
        Random mockRandom = mock(Random.class);

        // 默认值: mock 对象的方法的返回值默认都是返回类型的默认值
        System.out.println(mockRandom.nextBoolean()); // false
        System.out.println(mockRandom.nextInt()); // 0
        System.out.println(mockRandom.nextDouble()); // 0.0

        // mock: 指定调用 nextInt 方法时，永远返回 100
        when(mockRandom.nextInt()).thenReturn(100);
        Assert.assertEquals(100, mockRandom.nextInt());
        Assert.assertEquals(100, mockRandom.nextInt());
    }

    @Test
    public void mockInterfaceTest() {
        List mockList = mock(List.class);

        // 接口的默认值：和类方法一致，都是默认返回值
        Assert.assertEquals(0, mockList.size());
        Assert.assertEquals(null, mockList.get(0));

        // 注意：调用 mock 对象的写方法，是没有效果的
        mockList.add("a");
        Assert.assertEquals(0, mockList.size());      // 没有指定 size() 方法返回值，这里结果是默认值
        Assert.assertEquals(null, mockList.get(0));   // 没有指定 get(0) 返回值，这里结果是默认值

        // mock值测试
        when(mockList.get(0)).thenReturn("a");          // 指定 get(0)时返回 a
        Assert.assertEquals(0, mockList.size());        // 没有指定 size() 方法返回值，这里结果是默认值
        Assert.assertEquals("a", mockList.get(0));      // 因为上面指定了 get(0) 返回 a，所以这里会返回 a
        Assert.assertEquals(null, mockList.get(1));     // 没有指定 get(1) 返回值，这里结果是默认值
    }

}
```

## 测试:适用@Mock注解

@Mock 注解可以理解为对 mock 方法的一个替代。

使用该注解时，要使用 MockitoAnnotations.initMocks 方法，让注解生效, 比如放在@Before方法中初始化。

比较优雅优雅的写法是用 MockitoJUnitRunner，它可以自动执行 MockitoAnnotations.initMocks 方法。

```java
package org.example.mockito.learn.service;

import org.junit.Assert;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.mockito.Mock;
import org.mockito.junit.MockitoJUnitRunner;

import java.util.Random;

import static org.mockito.Mockito.when;

@RunWith(MockitoJUnitRunner.class)
public class MockAnnotationTest {

    @Mock
    private Random random;

    @Test
    public void test() {
        when(random.nextInt()).thenReturn(100);
        Assert.assertEquals(100, random.nextInt());
    }

}
```

## 测试:参数匹配

如果参数匹配既申明了精确匹配，也声明了模糊匹配；又或者同一个值的精确匹配出现了两次，使用时会匹配符合匹配条件的最新声明的匹配。


```java
package org.example.mockito.learn.service;

import org.junit.Assert;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.mockito.Mock;
import org.mockito.junit.MockitoJUnitRunner;

import java.util.List;

import static org.mockito.ArgumentMatchers.anyInt;
import static org.mockito.Mockito.when;

@RunWith(MockitoJUnitRunner.class)
public class ParameterTest {

    @Mock
    private List<String> testList;

    @Test
    public void test01() {
        // 精确匹配 0
        when(testList.get(0)).thenReturn("a");
        Assert.assertEquals("a", testList.get(0));

        // 精确匹配 0
        when(testList.get(0)).thenReturn("b");
        Assert.assertEquals("b", testList.get(0));

        // 模糊匹配
        when(testList.get(anyInt())).thenReturn("c");
        Assert.assertEquals("c", testList.get(0));
        Assert.assertEquals("c", testList.get(1));
    }

}
```

### 参数匹配

anyInt 只是用来匹配参数的工具之一，目前 mockito 有多种匹配函数，部分如下：

```
函数名	匹配类型
any()	所有对象类型
anyInt()	基本类型 int、非 null 的 Integer 类型
anyChar()	基本类型 char、非 null 的 Character 类型
anyShort()	基本类型 short、非 null 的 Short 类型
anyBoolean()	基本类型 boolean、非 null 的 Boolean 类型
anyDouble()	基本类型 double、非 null 的 Double 类型
anyFloat()	基本类型 float、非 null 的 Float 类型
anyLong()	基本类型 long、非 null 的 Long 类型
anyByte()	基本类型 byte、非 null 的 Byte 类型
anyString()	String 类型(不能是 null)
anyList()	List<T> 类型(不能是 null)
anyMap()	Map<K, V>类型(不能是 null)
anyCollection()	Collection<T>类型(不能是 null)
anySet()	Set<T>类型(不能是 null)
any(Class<T> type)	type类型的对象(不能是 null)
isNull()	null
notNull()	非 null
isNotNull()	非 null
```

## 测试: Mock异常

Mockito 使用 thenThrow 让方法抛出异常

如下代码中，包含两个例子：一个是单个异常，一个是多个异常。

```java
package org.example.mockito.learn.service;

import org.junit.Assert;
import org.junit.Test;

import java.util.Random;

import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

public class ThrowTest {

    /**
     * 例子1： thenThrow 用来让函数调用抛出异常.
     */
    @Test
    public void throwTest1() {

        Random mockRandom = mock(Random.class);
        when(mockRandom.nextInt()).thenThrow(new RuntimeException("异常"));

        try {
            mockRandom.nextInt();
            Assert.fail();  // 上面会抛出异常，所以不会走到这里
        } catch (Exception ex) {
            Assert.assertTrue(ex instanceof RuntimeException);
            Assert.assertEquals("异常", ex.getMessage());
        }
    }

    /**
     * thenThrow 中可以指定多个异常。在调用时异常依次出现。若调用次数超过异常的数量，再次调用时抛出最后一个异常。
     */
    @Test
    public void throwTest2() {

        Random mockRandom = mock(Random.class);
        when(mockRandom.nextInt()).thenThrow(new RuntimeException("异常1"), new RuntimeException("异常2"));

        try {
            mockRandom.nextInt();
            Assert.fail();
        } catch (Exception ex) {
            Assert.assertTrue(ex instanceof RuntimeException);
            Assert.assertEquals("异常1", ex.getMessage());
        }

        try {
            mockRandom.nextInt();
            Assert.fail();
        } catch (Exception ex) {
            Assert.assertTrue(ex instanceof RuntimeException);
            Assert.assertEquals("异常2", ex.getMessage());
        }
    }

}
```

对应返回类型是 void 的函数，thenThrow 是无效的，要使用 doThrow。

```java
package org.example.mockito.learn.service;

import org.junit.Assert;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.mockito.Mock;
import org.mockito.junit.MockitoJUnitRunner;

import static org.mockito.Mockito.doThrow;

/**
 * Do Throw for void return.
 */
@RunWith(MockitoJUnitRunner.class)
public class DoThrowTest {

    static class ExampleService {

        public void hello() {
            System.out.println("Hello");
        }

    }

    @Mock
    private ExampleService exampleService;

    @Test
    public void test() {
        // 这种写法可以达到效果
        doThrow(new RuntimeException("异常")).when(exampleService).hello();

        try {
            exampleService.hello();
            Assert.fail();
        } catch (RuntimeException ex) {
            Assert.assertEquals("异常", ex.getMessage());
        }

    }

}
```

此外还有，可以查看官方文档

doAnswer(Answer)
doNothing()
doCallRealMethod()

# 测试:spy 和 @Spy 注解

spy 和 mock不同，不同点是：spy 的参数是对象示例，mock 的参数是 class。

被 spy 的对象，调用其方法时默认会走真实方法。mock 对象不会。

下面是一个对比：

```java
package org.example.mockito.learn.service;

public class ExampleService {

    int add(int a, int b) {
        return a+b;
    }

}
```

测试代码：

```java
package org.example.mockito.learn.service;

import org.junit.Assert;
import org.junit.Test;

import static org.mockito.Mockito.*;

public class MockitoDemo {

    // 测试 spy
    @Test
    public void test_spy() {

        ExampleService spyExampleService = spy(new ExampleService());

        // 默认会走真实方法
        Assert.assertEquals(3, spyExampleService.add(1, 2));

        // 打桩后，不会走了
        when(spyExampleService.add(1, 2)).thenReturn(10);
        Assert.assertEquals(10, spyExampleService.add(1, 2));

        // 但是参数比匹配的调用，依然走真实方法
        Assert.assertEquals(3, spyExampleService.add(2, 1));

    }

    // 测试 mock
    @Test
    public void test_mock() {

        ExampleService mockExampleService = mock(ExampleService.class);

        // 默认返回结果是返回类型int的默认值
        Assert.assertEquals(0, mockExampleService.add(1, 2));

    }

}
```

spy 对应注解 @Spy，和 @Mock 是一样用的。

```java
@Spy
private ExampleService spyExampleService;

@Test
public void test_spy2() {
    MockitoAnnotations.initMocks(this);
    Assert.assertEquals(3, spyExampleService.add(1, 2));
    when(spyExampleService.add(1, 2)).thenReturn(10);
    Assert.assertEquals(10, spyExampleService.add(1, 2));
}
```

对于@Spy，如果发现修饰的变量是 null，会自动调用类的无参构造函数来初始化。

所以下面两种写法是等价的：

```java
// 写法1
@Spy
private ExampleService spyExampleService;

// 写法2
@Spy
private ExampleService spyExampleService = new ExampleService();
```

如果没有无参构造函数，必须使用写法2。例子：

```java
import org.junit.Assert;
import org.junit.Test;
import org.mockito.MockitoAnnotations;
import org.mockito.Spy;

class ExampleService {

    private int a;

    public ExampleService(int a) {
        this.a = a;
    }

    int add(int b) {
        return a+b;
    }

}

public class MockitoDemo {

    @Spy
    private ExampleService spyExampleService = new ExampleService(1);

    @Test
    public void test_spy() {

        MockitoAnnotations.initMocks(this);

        Assert.assertEquals(3, spyExampleService.add(2));

    }

}
```

## 测试:测试隔离

根据 JUnit 单测隔离 ，当 Mockito 和 JUnit 配合使用时，也会将非static变量或者非单例隔离开。

比如使用 @Mock 修饰的 mock 对象在不同的单测中会被隔离开。

示例：

```java
import org.junit.Test;
import org.junit.runner.RunWith;
import org.mockito.Mock;
import org.mockito.junit.MockitoJUnitRunner;

import static org.mockito.Mockito.*;

@RunWith(MockitoJUnitRunner.class)
public class MockitoDemo {

    static class ExampleService {

        public int add(int a, int b) {
            return a+b;
        }

    }

    @Mock
    private ExampleService exampleService;

    @Test
    public void test01() {
        System.out.println("---call test01---");

        System.out.println("打桩前: " + exampleService.add(1, 2));

        when(exampleService.add(1, 2)).thenReturn(100);

        System.out.println("打桩后: " + exampleService.add(1, 2));
    }

    @Test
    public void test02() {
        System.out.println("---call test02---");

        System.out.println("打桩前: " + exampleService.add(1, 2));

        when(exampleService.add(1, 2)).thenReturn(100);

        System.out.println("打桩后: " + exampleService.add(1, 2));
    }

}
```

将两个单测一起运行，运行结果是：

```
---call test01---
打桩前: 0
打桩后: 100
---call test02---
打桩前: 0
打桩后: 100
```

test01 先被执行，打桩前调用add(1, 2)的结果是0，打桩后是 100。

然后 test02 被执行，打桩前调用add(1, 2)的结果是0，而非 100，这证明了我们上面的说法。

# 测试:结合PowerMock支持静态方法

PowerMock 是一个增强库，用来增加 Mockito 、EasyMock 等测试库的功能。

## Mockito为什么不能mock静态方法?

因为Mockito使用继承的方式实现mock的，用CGLIB生成mock对象代替真实的对象进行执行，为了mock实例的方法，你可以在subclass中覆盖它，而static方法是不能被子类覆盖的，所以Mockito不能mock静态方法。

但PowerMock可以mock静态方法，因为它直接在bytecode上工作。

## Mockito 默认是不支持静态方法

比如我们在 ExampleService 类中定义静态方法 add：

```java
public class ExampleService {

    public static int add(int a, int b) {
        return a+b;
    }

}
```

尝试给静态方法打桩，会报错：

```java
import org.junit.Test;
import org.junit.runner.RunWith;
import org.mockito.Mock;
import org.mockito.junit.MockitoJUnitRunner;

import static org.mockito.Mockito.*;

@RunWith(MockitoJUnitRunner.class)
public class MockitoDemo {

    @Test
    public void test() {

        // 会报错
        when(ExampleService.add(1, 2)).thenReturn(100);

    }

}
```

## 可以用 Powermock 弥补 Mockito 缺失的静态方法 mock 功能

在 pom.xml 中配置以下依赖：(版本的匹配问题可以参考：https://github.com/powermock/powermock/wiki/Mockito)

```xml
<properties>
    <powermock.version>2.0.2</powermock.version>
</properties>

<dependencies>
   <dependency>
      <groupId>org.powermock</groupId>
      <artifactId>powermock-module-junit4</artifactId>
      <version>${powermock.version}</version>
      <scope>test</scope>
   </dependency>
   <dependency>
      <groupId>org.powermock</groupId>
      <artifactId>powermock-api-mockito2</artifactId>
      <version>${powermock.version}</version>
      <scope>test</scope>
   </dependency>
</dependencies>
```

```java
import org.junit.Assert;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.powermock.api.mockito.PowerMockito;
import org.powermock.core.classloader.annotations.PrepareForTest;
import org.powermock.modules.junit4.PowerMockRunner;

import static org.mockito.Mockito.*;

@RunWith(PowerMockRunner.class)     // 这是必须的
@PrepareForTest(ExampleService.class)  // 声明要处理 ExampleService
public class MockitoDemo {
    @Test
    public void test() {

        PowerMockito.mockStatic(ExampleService.class);  // 这也是必须的

        when(ExampleService.add(1, 2)).thenReturn(100);

        Assert.assertEquals(100, ExampleService.add(1, 2));
        Assert.assertEquals(0, ExampleService.add(2, 2));

    }
}
```


## PowerMockRunner 支持 Mockito 的 @Mock 等注解

上面我们用了 PowerMockRunner ，MockitoJUnitRunner 就不能用了。

但不要担心， @Mock 等注解还能用。

```java
import org.junit.Assert;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.mockito.Mock;
import org.powermock.modules.junit4.PowerMockRunner;

import java.util.Random;

import static org.mockito.Mockito.*;

@RunWith(PowerMockRunner.class)
public class MockitoDemo {

    @Mock
    private Random random;

    @Test
    public void test() {

        when(random.nextInt()).thenReturn(1);
        Assert.assertEquals(1,  random.nextInt());

    }
}
```

# 参考资料

http://jmockit.github.io/tutorial/Faking.html

https://site.mockito.org/

https://pdai.tech/md/develop/ut/dev-ut-x-mockito.html#%E4%BB%80%E4%B9%88%E6%98%AF-mock-%E6%B5%8B%E8%AF%95

* any list
{:toc}