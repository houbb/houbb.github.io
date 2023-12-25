---
layout: post
title: test assert-04-Java (and original) version of Hamcrest 断言
date:  2016-4-26 12:53:12 +0800
categories: [JS]
tags: [js, assert, sh]
published: true
---

# 什么是 Hamcrest？

Hamcrest 是一个匹配器库，它提供了一系列的匹配器（matchers），这些匹配器可以组合在一起，形成在测试中表达意图的灵活表达式。

它们也被用于其他目的。

# 介绍

Hamcrest 是一个用于编写匹配器对象的框架，允许以声明方式定义“匹配”规则。

有许多情况下匹配器非常有价值，例如 UI 验证或数据过滤，但在编写灵活测试的领域中，匹配器最常被使用。本教程将向您展示如何在单元测试中使用 Hamcrest。

在编写测试时，有时很难在过度指定测试（使其对变化变得脆弱）和不够指定测试（使测试在被测试的事物出现问题时仍然能够通过）之间找到平衡。

拥有一个工具，可以精确选择测试中的被测方面并描述它应该具有的值，以受控的精度级别，有助于编写“刚刚好”的测试。

这样的测试在被测试方面的行为偏离期望行为时会失败，但在对行为进行微小且无关的更改时仍然会通过。

## 我的第一个 Hamcrest 测试

我们将首先编写一个非常简单的 JUnit 5 测试，但是与其使用 JUnit 的 assertEquals 方法不同，我们使用 Hamcrest 的 assertThat 结构和标准的匹配器集合，它们都是通过静态导入导入的：

```java
import org.junit.jupiter.api.Test;
import static org.hamcrest.MatcherAssert.assertThat; 
import static org.hamcrest.Matchers.*;

public class BiscuitTest {
  @Test 
  public void testEquals() { 
    Biscuit theBiscuit = new Biscuit("Ginger"); 
    Biscuit myBiscuit = new Biscuit("Ginger"); 
    assertThat(theBiscuit, equalTo(myBiscuit)); 
  } 
} 
```

`assertThat` 方法是一个用于进行测试断言的风格化语句。在这个例子中，断言的主体是作为第一个方法参数的对象 `biscuit`。第二个方法参数是用于 Biscuit 对象的匹配器，这里使用的是一个匹配器，通过使用对象的 `equals` 方法检查一个对象是否等于另一个对象。由于 Biscuit 类定义了一个 `equals` 方法，所以测试通过。

如果在测试中有多个断言，您可以在断言中包含被测试值的标识符：

```java
assertThat("chocolate chips", theBiscuit.getChocolateChipCount(), equalTo(10)); 

assertThat("hazelnuts", theBiscuit.getHazelnutCount(), equalTo(3));
```

## 其他测试框架

Hamcrest 从一开始就被设计成与不同的单元测试框架集成。

例如，Hamcrest 可以与 JUnit（所有版本）和 TestNG 一起使用（有关详细信息，请查看随完整的 Hamcrest 发行版提供的示例）。

在现有的测试套件中迁移到使用 Hamcrest 风格的断言是相当容易的，因为其他断言风格可以与 Hamcrest 并存。

Hamcrest 还可以与模拟对象框架一起使用，通过使用适配器将模拟对象框架的匹配器概念桥接到 Hamcrest 匹配器。

例如，JMock 1 的约束就是 Hamcrest 的匹配器。

Hamcrest 提供了一个 JMock 1 适配器，允许您在 JMock 1 测试中使用 Hamcrest 匹配器。

JMock 2 不需要这样的适配器层，因为它被设计为使用 Hamcrest 作为其匹配库。

Hamcrest 还为 EasyMock 2 提供了适配器。同样，详细信息请参阅 Hamcrest 的示例。

## 常见匹配器一览

Hamcrest 提供了一个有用的匹配器库。

以下是其中一些最重要的匹配器。

核心（Core）
- `anything` - 总是匹配，如果您不关心被测试对象是什么，这很有用。
- `describedAs` - 用于添加自定义失败描述的修饰器。
- `is` - 用于提高可读性的修饰器 - 请参阅下面的“语法糖”。

逻辑（Logical）
- `allOf` - 如果所有匹配器都匹配则匹配，短路（类似于 Java 的 &&）。
- `anyOf` - 如果任何匹配器匹配则匹配，短路（类似于 Java 的 ||）。
- `not` - 如果包装的匹配器不匹配，则匹配，反之亦然。

对象（Object）
- `equalTo` - 使用 `Object.equals` 测试对象相等性。
- `hasToString` - 测试 `Object.toString`。
- `instanceOf`, `isCompatibleType` - 测试类型。
- `notNullValue`, `nullValue` - 测试是否为 null。
- `sameInstance` - 测试对象身份。

JavaBeans
- `hasProperty` - 测试 JavaBeans 属性。

集合（Collections）
- `array` - 使用一组匹配器测试数组的元素。
- `hasEntry`, `hasKey`, `hasValue` - 测试映射是否包含条目、键或值。
- `hasItem`, `hasItems` - 测试集合是否包含元素。
- `hasItemInArray` - 测试数组是否包含元素。

数字（Number）
- `closeTo` - 测试浮点数值是否接近给定值。
- `greaterThan`, `greaterThanOrEqualTo`, `lessThan`, `lessThanOrEqualTo` - 测试顺序。

文本（Text）
- `equalToIgnoringCase` - 忽略大小写测试字符串相等性。
- `equalToIgnoringWhiteSpace` - 忽略空白字符差异测试字符串相等性。
- `containsString`, `endsWith`, `startsWith` - 测试字符串匹配。

语法糖（Sugar）
Hamcrest 力求使您的测试尽可能易读。例如，`is` 匹配器是一个不对基础匹配器添加任何额外行为的包装器。以下断言都是等价的：

```java
assertThat(theBiscuit, equalTo(myBiscuit)); 
assertThat(theBiscuit, is(equalTo(myBiscuit))); 
assertThat(theBiscuit, is(myBiscuit));
```

最后一种形式是允许的，因为 `is(T value)` 被重载为返回 `is(equalTo(value))`。

## 编写自定义匹配器

Hamcrest 包含许多有用的匹配器，但您可能会发现，为了满足您的测试需求，有时需要不时地创建自己的匹配器。

这通常发生在您找到一段代码片段，该代码片段一遍又一遍地测试相同的一组属性（在不同的测试中），并且您想将该片段捆绑到单个断言中。

通过编写自己的匹配器，您将消除代码重复，使您的测试更易读！

让我们编写一个自己的匹配器，用于测试 double 值是否为 NaN（不是一个数字）。这是我们想要编写的测试：

```java
@Test
public void testSquareRootOfMinusOneIsNotANumber() { 
  assertThat(Math.sqrt(-1), is(notANumber())); 
}
```

以下是实现：

```java
package org.hamcrest.examples.tutorial;

import org.hamcrest.Description; 
import org.hamcrest.Matcher; 
import org.hamcrest.TypeSafeMatcher;

public class IsNotANumber extends TypeSafeMatcher<Double> {

  @Override 
  public boolean matchesSafely(Double number) { 
    return number.isNaN(); 
  }

  public void describeTo(Description description) { 
    description.appendText("not a number"); 
  }

  public static Matcher<Double> notANumber() { 
    return new IsNotANumber(); 
  }

} 
```

`assertThat` 方法是一个通用方法，它接受一个由断言主体类型参数化的 Matcher。

我们正在断言关于 Double 值的事情，所以我们知道我们需要一个 `Matcher<Double>`。对于我们的 Matcher 实现，最方便的方法是继承 `TypeSafeMatcher`，它为我们执行到 Double 的强制转换。

我们只需要实现 `matchesSafely` 方法 - 它简单地检查 Double 是否为 NaN - 以及 `describeTo` 方法 - 用于在测试失败时生成失败消息。

以下是测试失败消息的示例：

```java
assertThat(1.0, is(notANumber()));

// 失败，带有消息

java.lang.AssertionError: Expected: is not a number got : <1.0>
```

我们的匹配器中的第三个方法是一个方便的工厂方法。我们通过静态导入此方法在测试中使用匹配器：

```java
import org.junit.jupiter.api.Test;
import static org.hamcrest.MatcherAssert.assertThat; 
import static org.hamcrest.Matchers.*;
import static org.hamcrest.examples.tutorial.IsNotANumber.notANumber;

public class NumberTest {
  @Test
  public void testSquareRootOfMinusOneIsNotANumber() { 
    assertThat(Math.sqrt(-1), is(notANumber())); 
  } 
}
```

尽管 `notANumber` 方法每次调用都会创建一个新的匹配器，但您不应假设这是您的匹配器的唯一使用模式。

因此，您应确保您的匹配器是无状态的，以便可以在匹配之间重用单个实例。

# 参考资料

https://github.com/hamcrest/JavaHamcrest

https://hamcrest.org/JavaHamcrest/tutorial

* any list
{:toc}
