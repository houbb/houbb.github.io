---
layout: post
title:  test Property-based Testing-02-jqwik Java的属性驱动测试框架入门介绍
date:  2016-04-26 14:10:52 +0800
categories: [Test]
tags: [java, test]
published: true
---

# 拓展阅读

[开源 Auto generate mock data for java test.(便于 Java 测试自动生成对象信息)](https://github.com/houbb/data-factory)

[开源 Junit performance rely on junit5 and jdk8+.(java 性能测试框架。性能测试。压测。测试报告生成。)](https://github.com/houbb/junitperf)

# jqwik

jqwik的发音类似于 "jay quick" [ˈdʒeɪkwɪk]。

jqwik的主要目的是将属性驱动测试（Property-Based Testing，PBT）引入JVM。

该库主要专注于Java和Kotlin，同时也支持Groovy。

属性驱动测试试图将微测试的直观性与随机生成的测试数据的有效性相结合。

最初受到对函数式编程的普遍热情的推动，PBT现在被认为是任何现代化测试方法的重要组成部分。

## 属性

属性旨在描述代码的通用不变性或后置条件，给定某些前提条件。

测试库jqwik将尝试生成许多满足前提条件的值集，希望生成的集合中的一个能够证明错误的假设。

以下属性涉及于（臭名昭著的）Fizz Buzz Kata的部分实现：

前提条件：考虑介于1和100之间可被3整除的数字。
后置条件：由fizzBuzz()返回的字符串以Fizz开头。

```java
import java.util.*;
import java.util.stream.*;

import net.jqwik.api.*;

class FizzBuzzTests {
	@Property
	boolean every_third_element_starts_with_Fizz(@ForAll("divisibleBy3") int i) {
		return fizzBuzz().get(i - 1).startsWith("Fizz");
	}

	@Provide
	Arbitrary<Integer> divisibleBy3() {
		return Arbitraries.integers().between(1, 100).filter(i -> i % 3 == 0);
	}

	private List<String> fizzBuzz() {
		return IntStream.range(1, 100).mapToObj((int i) -> {
			boolean divBy3 = i % 3 == 0;
			boolean divBy5 = i % 5 == 0;

			return divBy3 && divBy5 ? "FizzBuzz"
				: divBy3 ? "Fizz"
				: divBy5 ? "Buzz"
				: String.valueOf(i);
		}).collect(Collectors.toList());
	}
}
```

通过使用一些注解，jqwik 试图使程序员尽可能简单地编写和运行属性测试。

# Property-based Testing in Java: Introduction

这是2009年。在进行了大约两个十年的主要面向对象编程之后，对于函数式语言将极大简化编写正确并发程序的说法引起了我的兴趣，我开始研究Clojure、Erlang，最终是Haskell。

时至今日，2018年，我在并发方面的活动有些减弱，但对软件开发的函数式一面的好奇心一直伴随着我。

作为一个开发者，我一直在贯彻测试驱动开发的理念，因此当我试图了解“其他人”是如何工作和思考的时候，一个社区对测试的方法是我首先关注的事情之一。

这就是我了解到函数式编程人员非常喜欢属性测试，与我们面向对象的程序员所称的单元测试相对立。

这种视角的改变不仅在强类型语言（如Haskell）中可见，而且在动态类型语言（如Erlang）中也可见。

然而，当涉及赚钱时，Java、Groovy，以及在较小程度上的JavaScript仍然是我的主要工作工具。

因此，我开始思考属性驱动测试（PBT）是否也可以在这里帮助我。在DuckDuckGo上搜索“Java”和“Property-based Testing”会给你一些结果 - 有些可以追溯到JUnit的Theories-Runner仍然存在的时候 - 但在网上找到的信息远远少于我期望的。一些人，如Nat Price，尝试在Java中实验这种方法，但也仅此而已。

可以说是一个幸运的巧合，在两年前的这个时候，我离开了JUnit-5核心团队，但决定尝试JUnit平台。

这就是为什么我创建了一个名为jqwik的测试引擎，专注于属性驱动测试。

除了深入研究Java对反射的完全混乱的处理方式之外，这项任务还要求我尝试使用不同的方法编写属性，研究其他属性驱动测试库的工作原理，并找到一种将这种新类型的测试整合到我习惯的TDD风格中的方法。

在接下来的几周中，我将发布一系列博客文章，描述我在这个过程中学到的有关属性驱动测试的本质以及如何在Java中使用它。

到目前为止，我已经发布了八个部分：

1. 从示例到属性
2. Jqwik和其他工具
3. 收缩的重要性
4. 查找好属性的模式
5. 状态测试
6. PBT和测试驱动开发
7. 如何在Java中规定它！
8. 基于模型的测试
9. Kotlin中的PBT

希望在我的旅程中再次见到你！


# chat

## 详细介绍一下 jqwik 测试框架

jqwik 是一个用于Java的属性驱动测试框架。

属性驱动测试是一种测试方法，其中测试用例通过描述系统的属性来生成，而不是手动指定输入值。

这使得测试更加灵活，能够覆盖更广泛的输入空间。

以下是一些关于jqwik测试框架的详细介绍：

### 1. **属性驱动测试（Property-Based Testing）：**
   - jqwik基于属性驱动测试的理念，这是一种测试方法，它基于属性定义和生成输入值，然后验证这些属性是否在所有生成的输入上都成立。

### 2. **注解驱动的测试：**
   - jqwik 使用注解来标记测试方法和属性。例如，`@Property` 注解用于标记属性测试方法。

### 3. **随机输入生成：**
   - jqwik 通过内置的随机生成器为测试用例生成输入值。这使得测试可以涵盖更广泛的情况，而不仅仅是手动选择特定的输入。

### 4. **生成器（Generators）：**
   - jqwik 允许自定义生成器，以控制输入值的生成过程。这是在某些情况下非常有用的功能。

### 5. **收缩测试用例（Shrinking Test Cases）：**
   - 当测试失败时，jqwik 会尝试缩小失败的测试用例，以找到最小的输入集，使得测试仍然失败。这有助于定位问题的根本原因。

### 6. **参数化测试：**
   - jqwik 支持参数化测试，允许通过不同的输入组合运行相同的测试方法。

### 7. **断言和测试验证：**
   - jqwik 提供了丰富的断言和验证机制，以确保属性在生成的输入集上成立。

### 8. **集成JUnit 5：**
   - jqwik 集成了JUnit 5，因此它可以与现有的JUnit测试一起使用。

### 9. **丰富的文档和社区支持：**
   - jqwik 拥有详细的文档，以及一个活跃的社区，可以提供支持和解答问题。

### 10. **Maven 和 Gradle 支持：**
   - jqwik 可以通过 Maven 或 Gradle 进行集成，使其易于在Java项目中使用。

## 什么是 属性驱动测试（Property-Based Testing）？给出具体的例子

属性驱动测试是一种软件测试方法，其中测试用例的设计基于系统或组件的属性而不是具体的输入值。

测试框架通过生成大量的随机输入，检查这些属性是否对于所有生成的输入都成立，从而提高测试的覆盖范围。

这种方法通常与随机测试结合使用，以发现更广泛的边界情况和错误。

以下是一个简单的例子，使用属性驱动测试的方法，假设我们正在测试一个排序算法：

### 常规测试：

```java
@Test
void testSortAlgorithm() {
    int[] inputArray = {4, 2, 8, 1, 6};
    int[] expectedResult = {1, 2, 4, 6, 8};
    
    // 调用排序算法
    int[] result = SortingAlgorithm.sort(inputArray);
    
    // 断言结果是否符合预期
    assertArrayEquals(expectedResult, result);
}
```

### 属性驱动测试：

```java
import net.jqwik.api.*;

public class SortingPropertiesTest {

    @Property
    void testSortingProperty(@ForAll("randomIntArray") int[] inputArray) {
        int[] sortedArray = SortingAlgorithm.sort(inputArray);
        
        // 属性：排序后的数组应该是升序的
        for (int i = 0; i < sortedArray.length - 1; i++) {
            assertTrue(sortedArray[i] <= sortedArray[i + 1]);
        }
    }

    // 生成随机整数数组的生成器
    @Provide
    Arbitrary<int[]> randomIntArray() {
        return Arbitraries.intArrays().ofMinLength(1).ofMaxLength(100).toArray(int[]::new);
    }
}
```

在这个例子中，我们使用 jqwik 的 `@Property` 注解标记测试方法，该方法具有一个输入参数 `inputArray`，它是通过 `randomIntArray` 方法生成的随机整数数组。

我们定义了一个属性，即排序后的数组应该是升序的。通过这个属性，我们不再需要手动指定输入值，而是让测试框架生成大量的随机输入，以验证这个属性是否在所有情况下成立。

这样的**属性驱动测试方法能够更全面地检查排序算法的正确性，而不仅仅局限于手动选择的一组输入**。

## 属性驱动测试（Property-Based Testing）和常规测试对比，有什么优缺点？

属性驱动测试（Property-Based Testing）和常规测试方法之间存在一些显著的优缺点差异。以下是它们的比较：

### 属性驱动测试的优点：

1. **广泛覆盖：** 属性驱动测试可以生成大量的随机输入，从而更全面地覆盖输入空间，包括边界情况和边缘情况，帮助发现隐藏的错误。

2. **自动化：** 由于测试框架会自动生成和执行测试用例，因此减少了手动编写大量测试用例的工作，提高了测试的自动化水平。

3. **发现性测试：** 通过引入随机性，属性驱动测试可以发现开发者可能未考虑到的测试场景，帮助发现潜在的问题。

4. **灵活性：** 属性驱动测试更加灵活，因为测试用例是通过属性定义而不是具体的输入值，这使得测试更容易适应代码变更。

### 属性驱动测试的缺点：

1. **难以理解：** 对于初学者来说，属性驱动测试可能更难理解，因为它要求开发者定义和理解系统属性，这可能需要更多的学习和实践。

2. **不易调试：** 当测试失败时，属性驱动测试可能会给出一个使测试失败的最小输入，但这可能不容易理解，因为这个输入是通过缩小算法生成的。

3. **性能开销：** 生成大量的随机测试用例可能导致性能开销，特别是对于复杂的系统，可能需要更多的时间来执行测试。

### 常规测试的优点：

1. **直观和简单：** 常规测试方法相对来说更直观和简单，开发者只需为特定的输入编写测试用例。

2. **易于理解和调试：** 常规测试用例通常更容易理解和调试，因为它们是直接指定的输入和预期输出。

3. **定制性高：** 开发者可以根据需要编写特定的测试用例，以检查特定的功能或场景。

### 常规测试的缺点：

1. **覆盖范围有限：** 常规测试方法可能无法覆盖系统的所有可能情况，因为手动编写所有可能的测试用例可能很困难。

2. **维护成本高：** 随着系统的增长，手动维护大量的测试用例可能会变得繁琐，尤其是在代码变更时需要更新测试。

3. **无法发现隐藏问题：** 常规测试可能无法轻松发现一些隐藏的问题或未考虑到的场景，因为测试用例通常是基于开发者的直觉编写的。

在实际项目中，通常会综合使用这两种测试方法，以发挥它们各自的优势，提高测试的全面性和效率。


# 参考资料

https://jqwik.net/

https://blog.johanneslink.net/2018/03/24/property-based-testing-in-java-introduction/

https://jqwik.net/docs/current/user-guide.html

* any list
{:toc}