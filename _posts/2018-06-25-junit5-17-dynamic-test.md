---
layout: post
title:  Junit5-17-Dynamic Tests
date:  2018-06-25 19:33:12 +0800
categories: [Test]
tags: [test, sh]
published: true
---

# 动态测试

在标注中描述的JUnit Jupiter中的标准@Test注释与JUnit 4中的@Test注释非常相似。两者都描述了实现测试用例的方法。这些测试用例是静态的，因为它们是在编译时完全指定的，并且它们的行为不能被运行时发生的任何事情所改变。假设提供了一种基本的动态行为形式，但在其表达性上却被故意限制。

除了这些标准测试之外，JUnit Jupiter还引入了一种全新的测试编程模型。
这种新类型的测试是一种动态测试，它是由一个工厂方法在运行时生成的，该方法用@TestFactory注释。

与@Test方法相反，@TestFactory方法本身不是测试用例，而是测试用例的工厂。因此，动态测试是工厂的产品。从技术上讲，@TestFactory方法必须返回DynamicNode实例的流、集合、可迭代或迭代器。
DynamicNode的可实例化子类是DynamicContainer和DynamicTest。DynamicContainer实例由显示名和动态子节点列表组成，允许创建动态节点的任意嵌套层次结构。然后，动态测试实例将被延迟执行，从而支持动态甚至不确定的测试用例生成。

@TestFactory返回的任何流都将通过调用stream.close()来适当地关闭，从而使使用诸如fil. lines()之类的资源变得安全。

与@Test方法一样，@TestFactory方法不能是私有的或静态的，并且可以选择性地声明参数解析器解析的参数。

动态测试是在运行时生成的测试用例。它由显示名和可执行文件组成。可执行文件是一个@FunctionalInterface，这意味着动态测试的实现可以作为lambda表达式或方法引用提供。

## 生命周期

动态测试的执行生命周期与标准的@测试用例的执行生命周期完全不同。特别地，对于单个动态测试没有生命周期回调。
这意味着@BeforeEach和@AfterEach方法及其对应的扩展回调对于@TestFactory方法执行，而不是对每个动态测试执行。
换句话说，如果在动态测试的lambda表达式中访问测试实例中的字段，那么这些字段不会在执行由相同的@TestFactory方法生成的单个动态测试之间通过回调方法或扩展来重置。

从JUnit Jupiter 5.2.0开始，动态测试必须始终由工厂方法创建;然而，这可能会在稍后的版本中得到注册设施的补充。

> 注意 

这是一个实验特性。

## 测试案例

下面的DynamicTestsDemo类演示了几个测试工厂和动态测试的例子。

第一个方法返回无效的返回类型。由于在编译时无法检测到无效的返回类型，所以在运行时检测到JUnitException时将抛出。

接下来的五个方法是非常简单的示例，它们演示了动态测试实例的集合、可迭代、迭代器或流的生成。这些示例中的大多数并没有真正显示动态行为，只是在原则上演示了受支持的返回类型。然而，dynamicTestsFromStream()和dynamicTestsFromIntStream()演示了为给定的一组字符串或一组输入数字生成动态测试是多么容易。

下一种方法实际上是动态的。generateRandomNumberOfTests()实现了一个迭代器，它生成随机数、一个显示名称生成器和一个测试执行器，然后提供所有3个到DynamicTest.stream()。尽管generateRandomNumberOfTests()的非确定性行为当然与测试可重复性存在冲突，因此应该谨慎使用，但它可以展示动态测试的表现力和威力。

最后一种方法使用DynamicContainer生成嵌套的动态测试层次结构。

- DynamicTestsDemo.java

```java
import org.junit.jupiter.api.DynamicNode;
import org.junit.jupiter.api.DynamicTest;
import org.junit.jupiter.api.TestFactory;
import org.junit.jupiter.api.function.ThrowingConsumer;

import java.util.Arrays;
import java.util.Collection;
import java.util.Iterator;
import java.util.List;
import java.util.Random;
import java.util.function.Function;
import java.util.stream.IntStream;
import java.util.stream.Stream;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.junit.jupiter.api.DynamicContainer.dynamicContainer;
import static org.junit.jupiter.api.DynamicTest.dynamicTest;

public class DynamicTestsDemo {
    // This will result in a JUnitException!
    @TestFactory
    List<String> dynamicTestsWithInvalidReturnType() {
        return Arrays.asList("Hello");
    }

    @TestFactory
    Collection<DynamicTest> dynamicTestsFromCollection() {
        return Arrays.asList(
                dynamicTest("1st dynamic test", () -> assertTrue(true)),
                dynamicTest("2nd dynamic test", () -> assertEquals(4, 2 * 2))
        );
    }

    @TestFactory
    Iterable<DynamicTest> dynamicTestsFromIterable() {
        return Arrays.asList(
                dynamicTest("3rd dynamic test", () -> assertTrue(true)),
                dynamicTest("4th dynamic test", () -> assertEquals(4, 2 * 2))
        );
    }

    @TestFactory
    Iterator<DynamicTest> dynamicTestsFromIterator() {
        return Arrays.asList(
                dynamicTest("5th dynamic test", () -> assertTrue(true)),
                dynamicTest("6th dynamic test", () -> assertEquals(4, 2 * 2))
        ).iterator();
    }

    @TestFactory
    Stream<DynamicTest> dynamicTestsFromStream() {
        return Stream.of("A", "B", "C")
                .map(str -> dynamicTest("test" + str, () -> { /* ... */ }));
    }

    @TestFactory
    Stream<DynamicTest> dynamicTestsFromIntStream() {
        // Generates tests for the first 10 even integers.
        return IntStream.iterate(0, n -> n + 2).limit(10)
                .mapToObj(n -> dynamicTest("test" + n, () -> assertTrue(n % 2 == 0)));
    }

    @TestFactory
    Stream<DynamicTest> generateRandomNumberOfTests() {

        // Generates random positive integers between 0 and 100 until
        // a number evenly divisible by 7 is encountered.
        Iterator<Integer> inputGenerator = new Iterator<Integer>() {

            Random random = new Random();
            int current;

            @Override
            public boolean hasNext() {
                current = random.nextInt(100);
                return current % 7 != 0;
            }

            @Override
            public Integer next() {
                return current;
            }
        };

        // Generates display names like: input:5, input:37, input:85, etc.
        Function<Integer, String> displayNameGenerator = (input) -> "input:" + input;

        // Executes tests based on the current input value.
        ThrowingConsumer<Integer> testExecutor = (input) -> assertTrue(input % 7 != 0);

        // Returns a stream of dynamic tests.
        return DynamicTest.stream(inputGenerator, displayNameGenerator, testExecutor);
    }

    @TestFactory
    Stream<DynamicNode> dynamicTestsWithContainers() {
        return Stream.of("A", "B", "C")
                .map(input -> dynamicContainer("Container " + input, Stream.of(
                        dynamicTest("not null", () -> assertNotNull(input)),
                        dynamicContainer("properties", Stream.of(
                                dynamicTest("length > 0", () -> assertTrue(input.length() > 0)),
                                dynamicTest("not empty", () -> assertFalse(input.isEmpty()))
                        ))
                )));
    }
}
```



* any list
{:toc}