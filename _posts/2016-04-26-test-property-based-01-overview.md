---
layout: post
title:  test Property-based Testing-01-基于属性的测试介绍 
date:  2016-04-26 14:10:52 +0800
categories: [Test]
tags: [java, test]
published: true
---

# 拓展阅读

[便于 Java 测试自动生成对象信息](https://github.com/houbb/data-factory)

# 拓展的开源工具

1. [JUnit-quickcheck](http://pholser.github.io/junit-quickcheck)：与 JUnit 紧密集成，使用注解配置生成器。
   - 从版本0.6开始，junit-quickcheck 也支持缩小。

2. [JCheck](http://www.jcheck.org/)：与 JUnit 紧密集成。似乎没有维护。

3. [QuickCheck](https://bitbucket.org/blob79/quickcheck)：不绑定到测试框架 - 提供用于测试的随机值的生成器。

4. [FunctionalJava](http://www.functionaljava.org/)：据说包含一个属性驱动测试系统，但似乎完全没有文档。

5. [ScalaCheck](https://scalacheck.org/)：成熟的属性驱动测试系统，支持缩小，但需要 Scala 而不是 Java。对缩小工作方式存在设计级别的问题。

6. [jqwik](https://jqwik.net/)：基于 JUnit 5 实现，使用注解。支持缩小。

# chat

## 详细介绍一下 Property-based Testing

属性驱动测试（Property-Based Testing）是一种软件测试方法，它的主要思想是通过定义属性和约束，测试系统的行为是否符合预期的规范。

与传统的例子驱动测试不同，属性驱动测试使用随机生成的输入数据来执行测试。

以下是属性驱动测试的一些关键概念和特点：

1. **属性（Properties）：** 属性是描述系统行为的断言，其应该对于任何输入都是真实的。属性是针对系统的通用规范，而不是具体的例子。例如，对于排序算法，属性可以是“对于任何输入数组，排序后的数组应该是升序的”。

2. **生成器（Generators）：** 为了执行属性驱动测试，需要生成随机的输入数据。生成器是用于生成这些输入数据的组件，它可以生成各种类型的数据，包括整数、字符串、对象等。生成器负责在测试执行时提供随机输入，以测试系统的不同方面。

3. **收缩（Shrinking）：** 当测试失败时，属性驱动测试框架会尝试缩小导致失败的输入，以找到最小的能够触发错误的输入。这使得调试和修复问题更加容易，因为开发人员可以更容易地理解失败的测试用例。

4. **随机性：** 属性驱动测试引入了随机性，通过在大量的随机输入上执行测试，可以更全面地探索系统的行为。这有助于发现边缘情况和潜在的错误，而不仅仅是依赖于手工选择的示例。

5. **独立于测试框架：** 属性驱动测试框架通常是独立于特定的测试框架的，这意味着它们可以与多种测试框架（如JUnit、TestNG等）结合使用。

6. **迭代测试：** 属性驱动测试是一个迭代的过程。开发人员可以从定义最基本的属性开始，然后逐步添加更多的属性，以提高测试的覆盖范围。

一些流行的属性驱动测试框架包括 QuickCheck、ScalaCheck、jqwik 等。

这些框架为开发人员提供了强大的工具，用于编写、执行和维护属性驱动测试。

## Property-based Testing 和 fuzz testing 感觉差不多，二者有什么区别吗？

尽管 Property-Based Testing（属性驱动测试）和 Fuzz Testing（模糊测试）都是测试中的自动化方法，它们在设计目标和执行方式上存在一些区别。

以下是它们的主要区别：

1. **测试方法：**
   - **Property-Based Testing：** 该方法通过定义属性和约束，以一般性的方式描述系统行为，然后使用随机生成的输入数据来验证这些属性。测试用例的设计是基于属性，而不是特定的输入值。
   - **Fuzz Testing：** 这种方法通过提供大量的随机、无效或异常输入来测试系统。Fuzz Testing的目标是发现系统对于不正常输入的处理方式，而不一定关注系统的通用性质或特定属性。

2. **输入生成：**
   - **Property-Based Testing：** 使用生成器生成满足属性的随机输入。这些输入是通过定义属性和约束后，由测试框架生成的，以覆盖系统可能的输入空间。
   - **Fuzz Testing：** 通过随机生成或变异输入数据，强调在输入中引入无效或不寻常的情况，例如不正确的格式、过大或过小的值等。

3. **目标：**
   - **Property-Based Testing：** 主要关注验证系统是否满足一般性质和属性，通常用于测试系统的核心逻辑和规范。
   - **Fuzz Testing：** 主要关注发现系统在异常或非预期输入下的行为，以检测潜在的漏洞、崩溃或安全问题。

4. **执行方式：**
   - **Property-Based Testing：** 通过在属性定义中描述期望的系统行为，然后使用生成器创建输入数据进行验证。
   - **Fuzz Testing：** 通过生成大量的随机或变异的输入来进行测试，强调对系统的边缘和异常情况进行探测。

5. **适用领域：**
   - **Property-Based Testing：** 更适用于测试系统的核心逻辑、算法或具有明确定义规范的组件。
   - **Fuzz Testing：** 更适用于发现系统中的漏洞、安全问题或处理异常情况的能力。

总体而言，Property-Based Testing和Fuzz Testing有一些相似之处，都使用随机性来测试系统，但它们的设计目标和方法上存在差异，使得它们在不同的测试场景中发挥作用。

## Property-based Testing 开源实现有哪些？

有许多开源实现的 Property-Based Testing 框架，其中一些较为知名的包括：

1. **QuickCheck：** 最早由 Haskell 社区引入，后来也有了其他语言的实现，如 Erlang、Scala、Python 等。这是 Property-Based Testing 的先驱框架，为多种编程语言提供了支持。

2. **ScalaCheck：** 是针对 Scala 编程语言的 Property-Based Testing 框架，它的设计灵感来自于 QuickCheck。ScalaCheck 提供了生成器（Generator）和属性（Property）的概念，支持对 Scala 代码进行属性驱动测试。

3. **Hypothesis：** 是 Python 编程语言的 Property-Based Testing 框架，灵感同样来自 QuickCheck。Hypothesis 在 Python 生态系统中相当流行，它提供了强大的生成器和缩小机制。

4. **jqwik：** 是基于 JUnit 5 的 Java Property-Based Testing 框架。它在 Java 平台上提供了类似于 QuickCheck 的功能，通过注解和生成器来定义属性和生成输入数据。

5. **test.check：** 是 Clojure 编程语言的 Property-Based Testing 框架，同样受到 QuickCheck 的影响。它为 Clojure 提供了生成器和检查性质的能力。

6. **PropEr：** 是 Erlang 编程语言的 Property-Based Testing 框架，允许测试复杂的并发和分布式系统。它着重于在 Erlang/OTP 环境中测试属性。

7. **RapidCheck：** 是 C++ 编程语言的 Property-Based Testing 框架，灵感同样来自 QuickCheck。RapidCheck 支持在 C++ 11 及更高版本的环境中进行属性驱动测试。

8. **GoCheck：** 是针对 Go 编程语言的 Property-Based Testing 框架。它为 Go 提供了属性驱动测试的功能，通过 QuickCheck 风格的 API 进行使用。

请注意，这些框架可能在不同语言和环境中具有不同的特性和语法，但它们都共享属性驱动测试的核心思想。选择框架时，应考虑语言的适用性、社区支持、文档质量以及是否满足项目的需求。

### 上面几种，支持 java 语言的有？

在上面提到的几种 Property-Based Testing 框架中，以下框架支持 Java 语言：

1. **jqwik：** jqwik 是基于 JUnit 5 的 Java Property-Based Testing 框架。它的设计受到 QuickCheck 的启发，提供了在 Java 环境中进行属性驱动测试的功能。jqwik 使用注解和生成器来定义属性，并能够生成满足属性的输入数据。

2. **QuickTheories：** QuickTheories 也是专注于 Java 的 Property-Based Testing 框架。它通过在 JUnit 或 TestNG 中使用注解和 DSL（领域特定语言）来提供属性驱动测试的能力。QuickTheories 的目标是提供随机性和可重复性的平衡，同时保持简单易用。

这两个框架都为 Java 开发者提供了在测试中应用属性驱动测试的方式。你可以根据项目需求和个人偏好选择其中之一。



# 参考资料

* any list
{:toc}