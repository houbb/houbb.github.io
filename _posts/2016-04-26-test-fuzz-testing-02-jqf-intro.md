---
layout: post
title:  test fuzz-02-模糊测试 JQF + Zest Semantic Fuzzing for Java
date:  2016-04-26 14:10:52 +0800
categories: [Test]
tags: [java, test]
published: true
---

# 拓展阅读

[开源 Auto generate mock data for java test.(便于 Java 测试自动生成对象信息)](https://github.com/houbb/data-factory)

[开源 Junit performance rely on junit5 and jdk8+.(java 性能测试框架。性能测试。压测。测试报告生成。)](https://github.com/houbb/junitperf)

[test fuzz-01-模糊测试（Fuzz Testing）](https://houbb.github.io/2016/04/26/test-fuzz-testing-01-overview)

[test fuzz-02-模糊测试 JQF + Zest Semantic Fuzzing for Java](https://houbb.github.io/2016/04/26/test-fuzz-testing-02-jqf-intro)

[test fuzz-03-模糊测试 Atheris A Coverage-Guided, Native Python Fuzzer](https://houbb.github.io/2016/04/26/test-fuzz-testing-03-atheris-intro)

[test fuzz-04-模糊测试 jazzer Coverage-guided, in-process fuzzing for the JVM](https://houbb.github.io/2016/04/26/test-fuzz-testing-04-jazzer-intro)

[test fuzz-05-模糊测试 kelinci AFL-based fuzzing for Java](https://houbb.github.io/2016/04/26/test-fuzz-testing-05-kelinci-intro)

[test fuzz-06-模糊测试 AFL american fuzzy lop - a security-oriented fuzzer](https://houbb.github.io/2016/04/26/test-fuzz-testing-06-AFL)

[test fuzz-07-模糊测试 libfuzzer](https://houbb.github.io/2016/04/26/test-fuzz-testing-07-libfuzzer)


# JQF

JQF是Java的一种反馈导向的模糊测试平台（类似于AFL/LibFuzzer，但针对JVM字节码）。

JQF使用*基于属性的测试*的抽象，使得编写模糊驱动程序作为参数化JUnit测试方法变得很容易。

JQF建立在[junit-quickcheck](https://github.com/pholser/junit-quickcheck)之上。

JQF通过使用**Zest**等**基于覆盖引导的**模糊算法，使运行junit-quickcheck风格的参数化单元测试具有强大的能力。

[Zest][ISSTA'19 paper]是一种算法，通过偏向于生成*语义有效*的输入来引导覆盖引导的模糊测试；即，在最大化代码覆盖的同时满足结构和语义属性的输入。

Zest的目标是发现传统模糊测试工具无法发现的深层语义错误，这些工具主要只强调错误处理逻辑。

默认情况下，JQF通过简单的命令运行Zest：`mvn jqf:fuzz`。

JQF是一个模块化的框架，支持以下可插拔的模糊测试前端，称为*引导*：
* 使用[AFL](http://lcamtuf.coredump.cx/afl)进行二进制模糊测试 ([教程](https://github.com/rohanpadhye/jqf/wiki/Fuzzing-with-AFL))
* 使用**[Zest](http://arxiv.org/abs/1812.00078)**进行语义模糊测试 [[ISSTA'19 paper]] ([教程 1](https://github.com/rohanpadhye/jqf/wiki/Fuzzing-with-Zest)) ([教程 2](https://github.com/rohanpadhye/jqf/wiki/Fuzzing-a-Compiler))
* 使用**[PerfFuzz](https://github.com/carolemieux/perffuzz)**进行复杂性模糊测试 [[ISSTA'18 paper]]
* 使用**[RLCheck](https://github.com/sameerreddy13/rlcheck)**进行强化学习（基于JQF的一个分支） [[ICSE'20 paper]]
* 使用**[Mu2](https://github.com/cmu-pasta/mu2)**进行突变分析引导的模糊测试 [[ISSTA'23 paper]]

JQF在[发现许多广泛使用的开源软件中的错误](#trophies)方面取得了成功，如OpenJDK、Apache Maven和Google Closure Compiler。

### Zest 研究论文

在您的研究中引用Zest时，请引用我们的[ISSTA'19论文]：

> Rohan Padhye, Caroline Lemieux, Koushik Sen, Mike Papadakis, and Yves Le Traon. 2019. **Semantic Fuzzing with Zest**. In Proceedings of the 28th ACM SIGSOFT International Symposium on Software Testing and Analysis (ISSTA’19), July 15–19, 2019, Beijing, China. ACM, New York, NY, USA, 12 pages. https://doi.org/10.1145/3293882.3330576

#### JQF 工具论文

如果您正在使用JQF框架构建新的模糊测试工具，请引用我们的[ISSTA'19工具论文]如下：

> Rohan Padhye, Caroline Lemieux, and Koushik Sen. 2019. **JQF: Coverage-Guided Property-Based Testing in Java**. In Proceedings of the 28th ACM SIGSOFT International Symposium on Software Testing and Analysis (ISSTA ’19), July 15–19, 2019, Beijing, China. ACM, New York, NY, USA, 4 pages. https://doi.org/10.1145/3293882.3339002

## 概述

### 什么是*结构感知模糊测试*？

像[AFL](http://lcamtuf.coredump.cx/afl)和[libFuzzer](https://llvm.org/docs/LibFuzzer.html)这样的二进制模糊测试工具将输入视为字节序列。如果测试程序期望高度结构化的输入，例如XML文档或JavaScript程序，则对字节数组进行变异通常会导致语法无效的输入；测试程序的核心部分保持未经测试。

**结构感知模糊测试**工具利用对输入格式的领域特定知识，通过构造产生*语法有效*的输入。有一些关于使用libFuzzer进行[C++](https://github.com/google/fuzzing/blob/master/docs/structure-aware-fuzzing.md)和[Rust](https://rust-fuzz.github.io/book/cargo-fuzz/structure-aware-fuzzing.html)程序结构感知模糊测试的很好的文章。

### 什么是*基于生成器的*模糊测试（QuickCheck）？

结构感知模糊测试工具需要一种理解输入结构的方法。其他一些工具使用输入格式的声明性规范，例如[上下文无关文法](https://embed.cs.utah.edu/csmith/)或[协议缓冲区](https://github.com/google/libprotobuf-mutator)。**JQF**使用QuickCheck的命令式方法来指定输入空间：任意的***生成器***程序，其任务是生成单个随机输入。

`Generator<T>`提供了生成类型为`T`的随机实例的方法。例如，对于类型为`Calendar`的生成器，它返回随机生成的`Calendar`对象。可以轻松编写更复杂类型的生成器，比如
[XML文档](examples/src/main/java/edu/berkeley/cs/jqf/examples/xml/XmlDocumentGenerator.java)，
[JavaScript程序](examples/src/main/java/edu/berkeley/cs/jqf/examples/js/JavaScriptCodeGenerator.java)，
[JVM类文件](examples/src/main/java/edu/berkeley/cs/jqf/examples/bcel/JavaClassGenerator.java)，SQL查询，HTTP请求等[等等](https://github.com/pholser/junit-quickcheck/tree/master/examples/src/test/java/com/pholser/junit/quickcheck/examples) - 这就是**基于生成器的模糊测试**。然而，仅仅对类型为`T`的随机输入进行采样通常不是很有效，因为生成器不知道它产生的输入是否有效。

### 什么是*语义模糊测试*（Zest）？

JQF支持**[*Zest算法*][ISSTA'19 paper]，该算法使用代码覆盖和输入有效性反馈来偏向于生成结构化输入，从而揭示深层次的语义错误。

JQF使用字节码插装提取代码覆盖，使用JUnit的[`Assume`](https://junit.org/junit4/javadoc/4.12/org/junit/Assume.html) API提取输入有效性。

如果没有违反假设，输入就是有效的。

## 示例

以下是用于检查[Apache Commons Collections](https://commons.apache.org/proper/commons-collections/)中[PatriciaTrie](https://commons.apache.org/proper/commons-collections/apidocs/org/apache/commons/collections4/trie/PatriciaTrie.html)类属性的JUnit-Quickcheck测试。该属性测试如果`PatriciaTrie`使用输入的JDK `Map`初始化，并且如果输入映射已经包含一个键，则新构建的`PatriciaTrie`中也应存在该键。

```java
@RunWith(JQF.class)
public class PatriciaTrieTest {

    @Fuzz  /* 此方法的参数将由JQF自动生成 */
    public void testMap2Trie(Map<String, Integer> map, String key) {
        // 键应存在于映射中
        assumeTrue(map.containsKey(key));   // 如果这个谓词不为真，测试无效

        // 使用输入`map`创建新的trie
        Trie trie = new PatriciaTrie(map);

        // 该键也应存在于trie中
        assertTrue(trie.containsKey(key));  // 当map = {"x": 1, "x\0": 2}和key = "x"时失败
    }
}
```

运行`mvn jqf:fuzz`将导致JQF重复调用`testMap2Trie()`方法，并自动生成`map`和`key`的值。大约在平均5秒后（~5,000个输入），JQF将报告断言违规。它发现了[在`PatriciaTrie`的实现中的一个bug](https://issues.apache.org/jira/browse/COLLECTIONS-714)，截至v4.4尚未解决。对`map`和`key`值的随机抽样不太可能找到失败的测试用例，这是一个非常特殊的极端情况（请参阅上述代码中断言旁边的注释）。JQF使用名为[**Zest**][ISSTA'19 paper]的覆盖引导调用很容易找到此违规。要将此示例作为独立的Maven项目运行，请查看[jqf-zest-example存储库](https://github.com/rohanpadhye/jqf-zest-example)。

在上面的示例中，`Map`和`String`的生成器是由JUnitQuickCheck自动生成的。也可以手动为结构化输入指定生成器。请参阅下面的[教程](#教程)。

## 文档

* [JQF Maven插件](https://github.com/rohanpadhye/JQF/wiki/JQF-Maven-Plugin)文档展示了如何运行`mvn jqf:fuzz`和`mvn jqf:repro`。
* [编写JQF测试](https://github.com/rohanpadhye/JQF/wiki/Writing-a-JQF-test)演示了为JQF创建基于JUnit的参数化测试方法的过程。
* [The Guidance interface](https://github.com/rohanpadhye/jqf/wiki/The-Guidance-interface)  文档展示了JQF内部的工作原理，对于希望在JQF之上构建自定义引导算法的研究人员很有用。
* [API文档](https://rohanpadhye.github.io/JQF/apidocs)在每个主要版本发布时都会发布，对于希望扩展JQF的研究人员也很有用。

### 教程

* [Zest 101](https://github.com/rohanpadhye/jqf/wiki/Fuzzing-with-Zest): 一个使用命令行脚本模糊测试独立的玩具程序的基础教程。演示了为`Calendar`对象编写测试驱动程序和结构化输入生成器的过程。
* [使用Zest模糊测试编译器](https://github.com/rohanpadhye/jqf/wiki/Fuzzing-a-Compiler): 一个模糊测试一个非常复杂程序的教程，即[Google Closure Compiler](https://github.com/google/closure-compiler)，使用JavaScript程序的生成器。本教程使用[JQF Maven插件](https://github.com/rohanpadhye/jqf/wiki/JQF-Maven-Plugin)。
* [使用AFL进行模糊测试](https://github.com/rohanpadhye/jqf/wiki/Fuzzing-with-AFL): 一个使用AFL二进制模糊测试引擎模糊测试解析二进制数据（如PNG图像文件）的Java程序的教程。
* [使用ZestCLI进行模糊测试](https://gitlab.com/gitlab-org/security-products/demos/coverage-fuzzing/java-fuzzing-example): 使用ZestCLI进行Java程序的模糊测试教程。

### 持续模糊测试

[GitLab](https://docs.gitlab.com/ee/user/application_security/coverage_fuzzing/)支持在CI/CD中运行JQF（[教程](https://gitlab.com/gitlab-org/security-products/demos/coverage-fuzzing/java-fuzzing-example)），尽管他们最近推出了自己的定制Java模糊测试工具。

## 基于JQF的研究和工具

* **[Zest](https://github.com/rohanpadhye/jqf-zest-example)** 🍝 [[ISSTA'19 paper]] - 语义模糊测试
* **[BigFuzz](https://github.com/UCLA-SEAL/BigFuzz)** 🍝 [[ASE'20 paper]] - Spark模糊测试
* **[MoFuzz](https://github.com/hub-se/MoFuzz)** [[ASE'20 paper](https://doi.org/10.1145/3324884.3416668)] - 基于模型的软件测试
* **[RLCheck](https://github.com/sameerreddy13/rlcheck)** 🍝 [[ICSE'20 paper]] - 强化学习
* **[Bonsai](https://github.com/vasumv/bonsai-fuzzing)** 🍝 [[ICSE'21 paper]] - 简明测试生成
* **[Confetti](https://github.com/neu-se/CONFETTI)** [[ICSE'22 paper](https://doi.org/10.1145/3510003.3510628)] - 具有全局提示的混合/污点跟踪
* **[BeDivFuzz](https://github.com/hub-se/BeDivFuzz)**  [[ICSE'22 paper](https://doi.org/10.1145/3510003.3510182)]- 行为多样性
* **[ODDFuzz](https://github.com/ODDFuzz/ODDFuzz)** [[IEEE S&P'23 paper](https://arxiv.org/pdf/2304.04233.pdf)]  - 反序列化漏洞
* **[GCMiner](https://github.com/GCMiner/GCMiner)** [[ICSE'23 paper](https://arxiv.org/pdf/2303.07593.pdf)] - Gadget链挖掘
* **[Intender](https://github.com/purseclab/intender)** [[USENIX Security'23 paper](https://www.usenix.org/system/files/sec23fall-prepub-285_kim-jiwon.pdf)] - 基于意图的网络
* **[Mu2](https://github.com/cmu-pasta/mu2)** 🍝 [[ISSTA'23 paper]] - 作为引导的变异测试
* **[TOAST](http://dx.doi.org/10.1007/s11390-021-1693-1)** [[JCST'22 paper](https://link.springer.com/article/10.1007/s11390-021-1693-1)] - 测试动态软件更新
* **[Poracle](https://github.com/PLaSE-UNIST/poracle-tool)** [[TOSEM'23 paper](http://www.jooyongyi.com/papers/TOSEM23.pdf)] - 使用差异模糊测试进行补丁测试
* **[SPIDER](https://arxiv.org/abs/2209.04026)** 🍝 [[arxiv preprint](https://arxiv.org/abs/2209.04026)] - SDN中的有状态性能问题
* **[FuzzDiff](https://github.com/akashpatil7/FuzzDiff)** [[Dissertation](https://www.scss.tcd.ie/publications/theses/diss/2022/TCD-SCSS-DISSERTATION-2022-134.pdf)] - 动态程序等效性检查

🍝 = 涉及至少一个原始JQF作者。

## 联系开发人员

如果您在JQF中发现了错误，或在使用JQF时遇到问题，请在[问题跟踪器](https://github.com/rohanpadhye/jqf/issues)上打开问题。您还可以使用此平台发布功能请求。

如果是某种模糊测试紧急情况，您随时可以发送电子邮件给主要开发者：[Rohan Padhye](https://rohan.padhye.org)。

# chat

## 详细介绍下 JQF

Java QuickCheck Fuzzing（JQF）是一种用于Java程序的模糊测试工具。

模糊测试是一种软件测试方法，通过向程序输入随机或半随机的数据来检测程序中的错误和漏洞。

JQF是基于Java的QuickCheck库的一个扩展，它专门用于模糊测试Java程序。

以下是JQF的一些关键特性和概念：

1. **基于QuickCheck：** JQF构建在QuickCheck理念之上，QuickCheck是一种属性驱动测试（Property-Based Testing）框架，最初是Haskell编程语言的一部分。QuickCheck允许开发人员通过定义属性和生成器来描述程序的预期行为，并生成大量的测试用例进行测试。

2. **模糊测试：** JQF使用模糊测试技术，通过生成具有随机或半随机输入的测试用例来探索程序的行为。这有助于发现潜在的边界情况和错误，提高程序的鲁棒性。

3. **生成器：** JQF使用生成器来生成随机输入。生成器是一种描述输入空间的代码，可以生成各种可能的输入。开发人员可以根据他们的需求自定义生成器，以便更好地测试程序的不同路径。

4. **状态空间探索：** JQF支持状态空间的探索，以找到程序中可能的问题。这有助于发现潜在的漏洞和错误，即使它们位于非常大的状态空间中。

5. **支持JUnit：** JQF可以与JUnit测试框架集成，使得将模糊测试集成到现有的测试套件中变得更加容易。开发人员可以使用JUnit的断言来定义属性，然后由JQF生成测试用例并执行。

6. **高度可定制：** JQF是一个灵活的工具，允许用户根据他们的需求进行定制。开发人员可以定义自己的生成器、属性和测试策略，以适应他们的具体应用场景。

在使用JQF时，开发人员通常会定义一些属性，描述程序的预期行为。

然后，JQF将生成大量的输入，并检查这些属性是否满足。

如果发现不满足的情况，JQF将生成包含有问题的输入的最小化版本，以帮助开发人员更容易地诊断和修复问题。

## 详细介绍一下 状态空间探索

状态空间探索是一种软件测试和验证方法，旨在检查程序或系统在不同输入组合下的各种状态和路径。

它通常用于发现潜在的错误、漏洞或未经测试的程序行为。

在软件开发中，程序的状态空间是指所有可能的状态组合，包括程序内部变量、外部输入和环境变量。

状态空间探索的目标是尽可能广泛地覆盖这个状态空间，以确保程序在各种情况下的正确性和鲁棒性。

下面是关于状态空间探索的一些关键概念和方法：

1. **状态：** 程序的状态是指在某一时间点上所有相关的内部和外部变量的值。状态可以包括变量的当前值、数据结构的内容以及其他相关信息。

2. **状态空间：** 程序的状态空间是所有可能的状态组合的集合。这包括程序内部的状态和外部环境的状态。状态空间通常是庞大而复杂的，因为它考虑了所有可能的输入、执行路径和环境条件。

3. **路径：** 在程序执行期间，从一个状态到另一个状态的转变构成了一个路径。路径包括了程序的执行流程和可能的决策点。

4. **状态空间探索方法：**

   - **随机测试：** 随机测试是一种简单的状态空间探索方法，通过使用随机生成的输入来测试程序。这通常是一种快速发现错误的方法，但覆盖状态空间可能有限。

   - **符号执行：** 符号执行是一种静态分析方法，通过符号值代替实际输入值来探索程序路径。这允许在没有实际运行程序的情况下分析所有可能的路径。

   - **模糊测试：** 模糊测试是一种动态测试方法，通过使用随机或半随机生成的输入来测试程序。它可以帮助发现程序在不同输入组合下的不稳定或错误行为。

   - **模型检测：** 模型检测使用有限状态机或时序逻辑来描述系统规范，并在这些规范下检查状态空间。它可以自动验证系统是否满足指定的属性。

5. **最小化和简化：** 一旦发现了状态空间中的错误，测试工程师通常会尝试最小化或简化导致错误的输入和路径，以便更容易理解、报告和修复问题。

状态空间探索的挑战在于，状态空间通常是无限的，而测试资源是有限的。

因此，有效的状态空间探索方法需要使用智能的技术和算法来提高测试效率，并优先考虑可能导致错误的关键路径和状态。

## JQF 有哪些核心概念？

Java QuickCheck Fuzzing (JQF) 的核心概念主要基于 QuickCheck 和模糊测试的思想，同时结合了适用于 Java 程序的特定实现。

以下是 JQF 的一些核心概念：

1. **QuickCheck：** QuickCheck 是一个属性驱动的测试框架，最初为 Haskell 开发。其核心思想是通过属性描述程序的期望行为，然后生成大量的随机测试用例来验证这些属性。JQF 借鉴了 QuickCheck 的思想，使得 Java 开发者能够利用这种属性驱动的测试方法。

2. **生成器（Generators）：** 生成器是 JQF 中的关键概念之一。它们用于生成随机输入数据，这些数据将用于测试程序。开发者可以定义自己的生成器，以确保测试能够覆盖程序的各种输入情况。

3. **属性（Properties）：** 属性是描述程序行为的断言，用于验证程序是否满足特定的规范。在 JQF 中，开发者可以使用 JUnit 样式的注解来定义属性，然后 JQF 将利用模糊测试生成输入，验证这些属性是否被满足。

4. **状态空间探索：** JQF 支持对程序状态空间的探索。通过生成大量的随机测试用例，JQF 尝试覆盖尽可能多的程序路径和状态，以帮助发现潜在的错误。

5. **策略（Strategies）：** 策略是 JQF 中的控制生成器和输入的方式。开发者可以定义策略来指导 JQF 如何生成测试用例。这包括如何选择生成器以及如何调整生成器的参数。

6. **Shrinking：** 当发现测试失败时，JQF 将会执行收缩操作（shrinking），以找到导致测试失败的最小输入。这有助于开发者更容易地理解和修复问题。

7. **JUnit 集成：** JQF 可以与 JUnit 测试框架集成。这意味着开发者可以使用熟悉的 JUnit 注解来定义属性，并将 JQF 的模糊测试集成到他们的测试套件中。

总体而言，JQF 提供了一种结合属性驱动测试和模糊测试的方式，以帮助发现 Java 程序中的潜在错误。

通过生成大量的随机测试用例，并在属性验证中使用它们，JQF 提供了一种高效的测试方法，有助于提高程序的鲁棒性和质量。

## 详细介绍一下 JQF 中的 Shrinking，以及具体的例子

在 JQF（Java QuickCheck Fuzzing）中，Shrinking 是一种用于最小化失败的测试用例的技术。当属性验证失败时，Shrinking 尝试找到导致失败的最小输入，以便开发者更容易地理解和修复问题。Shrinking 通过缩小测试用例的规模，移除对失败的属性来实现。

以下是 JQF 中 Shrinking 的概述和一个简单的例子：

### JQF 中 Shrinking 的概述：

1. **最小化失败的测试用例：** 当属性验证失败时，JQF 将尝试最小化导致失败的测试用例。这意味着 JQF 将会逐步减小输入的规模，直到找到导致失败的最小输入。

2. **Shrinking 过程：** Shrinking 过程是一个迭代过程，每一步都会尝试去除一个或多个输入值，以检查属性是否仍然失败。如果属性仍然失败，Shrinking 将继续缩小输入，直到找到最小的导致失败的输入。

3. **帮助调试：** Shrinking 的目标是帮助开发者更容易地理解失败的属性。通过提供最小输入，开发者可以更轻松地诊断和修复问题。

### JQF Shrinking 的例子：

假设我们有一个简单的整数除法函数，但是它在除数为零时会失败：

```java
public class IntegerDivider {
    public static int divide(int dividend, int divisor) {
        if (divisor == 0) {
            throw new IllegalArgumentException("Divisor cannot be zero");
        }
        return dividend / divisor;
    }
}
```

我们希望测试这个函数，确保它在除数不为零的情况下正常工作。我们可以使用 JQF 进行模糊测试，同时观察 Shrinking 过程：

```java
import net.jqwik.api.*;

public class IntegerDividerTest {

    @Property
    boolean divisionWorksForNonZeroDivisor(@ForAll int dividend, @ForAll int divisor) {
        Assume.that(divisor != 0); // 排除除数为零的情况
        int result = IntegerDivider.divide(dividend, divisor);

        // 断言：对于非零除数，除法应该正常工作
        return true;
    }
}
```

在这个例子中，我们使用 `Assume.that(divisor != 0)` 来排除除数为零的情况。

如果属性验证失败，JQF 将开始 Shrinking 过程，尝试找到最小的输入，以满足属性的失败条件。

通过运行这个测试，我们可以观察到 Shrinking 过程。

JQF 将在失败的情况下尝试最小化输入，逐步减小 `dividend` 和 `divisor` 的值，直到找到最小的导致失败的输入。

Shrinking 的过程在 JQF 中是自动的，这有助于提高测试用例的可读性和可维护性。

开发者可以更轻松地理解和修复测试失败，而无需手动调整输入。

## 详细介绍一下 JQF 中的 策略（Strategies），以及具体的例子

在 JQF（Java QuickCheck Fuzzing）中，策略（Strategies）是一种用于指导生成器（Generators）和输入的方式的概念。

使用策略，开发者可以定制模糊测试的行为，控制生成测试用例的方式，以适应特定的测试场景或需求。

以下是 JQF 中策略的概述和一个简单的例子：

### JQF 中策略的概述：

1. **QuickTheories 库中的 Strategies：** JQF 使用 QuickTheories 库，该库提供了一组强大的策略，用于控制生成器的行为。策略可以包括生成器的组合、过滤、映射等操作，以及其他指导模糊测试的方法。

2. **自定义策略：** JQF 允许开发者定义自己的策略，以适应特定的测试需求。这可以通过实现 QuickTheories 中相应的接口或使用提供的工厂方法来实现。

3. **影响生成器的行为：** 策略可以影响生成器的行为，包括生成器的选择、生成器的参数设置等。通过使用策略，开发者可以更精确地控制测试用例的生成过程。

### JQF 策略的例子：

假设我们有一个需要测试的简单的字符串处理函数，它将字符串的每个字符转换为大写：

```java
public class StringProcessor {
    public static String toUpperCase(String input) {
        if (input == null) {
            return null;
        }
        return input.toUpperCase();
    }
}
```

我们希望测试这个函数的性能，确保它对于任意非空字符串都能正常工作。我们可以使用 JQF 的策略来生成非空字符串：

```java
import net.jqwik.api.*;
import org.quicktheories.core.Gen;
import org.quicktheories.generators.Generate;
import org.quicktheories.generators.SourceDSL;

public class StringProcessorTest {

    @Property
    boolean toUpperCaseWorksForNonNullStrings(@ForAll("nonNullStrings") String input) {
        String result = StringProcessor.toUpperCase(input);

        // 断言：对于任意非空字符串，转换为大写后应该不为空
        return result != null && result.equals(input.toUpperCase());
    }

    @Provide
    Arbitrary<String> nonNullStrings() {
        // 使用 QuickTheories 的策略生成非空字符串
        return Arbitraries.strings().alpha().ofMinLength(1);
    }
}
```

在这个例子中，我们使用了 `nonNullStrings` 方法来定义一个生成非空字符串的策略。`Arbitraries.strings().alpha().ofMinLength(1)` 是一个策略，它表示生成包含字母字符的字符串，最小长度为 1。

`@ForAll("nonNullStrings")` 注解标识了属性方法参数，表示该参数将由名为 `nonNullStrings` 的策略生成。这样，JQF 将使用定义的策略生成大量的非空字符串，用于测试 `toUpperCase` 方法。

通过使用策略，我们可以更灵活地控制生成器的行为，确保测试用例的覆盖范围和质量。

在实际应用中，策略可以根据测试需求进行更复杂的定制。

## 详细介绍一下 JQF 中的 属性（Properties），以及具体的例子

在 JQF（Java QuickCheck Fuzzing）中，属性（Properties）是一种用于描述程序行为的断言。

属性是测试的核心，它定义了程序在某个输入或输入集合上应该满足的特定规范。

通过定义属性，JQF 可以使用模糊测试生成大量的随机测试用例，并验证这些属性是否为真。

以下是 JQF 中属性的概述和一个简单的例子：

### JQF 中属性的概述：

1. **JUnit Annotations：** 在 JQF 中，属性通常使用 JUnit 的注解来定义。常用的注解包括 `@Property`、`@ForAll` 等，这些注解用于标识属性方法和定义输入。

2. **属性方法：** 属性是一个带有 `@Property` 注解的方法，该方法包含了对程序行为的断言。属性方法的返回类型通常是布尔值，表示属性是否为真。

3. **生成器注解：** `@ForAll` 注解用于标识属性方法的参数，并指定输入的生成器。JQF 将使用这些生成器生成随机测试用例，传递给属性方法进行验证。

4. **断言：** 属性方法中包含断言语句，用于检查程序的行为是否符合预期。如果断言失败，JQF 将记录失败的测试用例，并在需要时进行最小化，以找到导致问题的最小输入。

### JQF 属性的例子：

假设我们有一个简单的整数加法器类：

```java
public class SimpleAdder {
    public static int add(int a, int b) {
        return a + b;
    }
}
```

我们希望测试这个加法器，确保它满足加法的交换性质。

我们可以使用 JQF 的属性来实现这个测试：

```java
import net.jqwik.api.*;

public class SimpleAdderTest {

    @Property
    boolean additionIsCommutative(@ForAll int a, @ForAll int b) {
        int result1 = SimpleAdder.add(a, b);
        int result2 = SimpleAdder.add(b, a);

        // 断言：加法应该满足交换性质
        return result1 == result2;
    }
}
```

在这个例子中，`additionIsCommutative` 方法是一个属性方法，使用 `@Property` 注解标识。

该方法接受两个整数参数，由 `@ForAll` 注解标识，表示这两个参数是由 JQF 自动生成的随机整数。

属性方法内部执行了加法操作，并使用断言验证加法的交换性质。

如果属性为真，测试通过；否则，JQF 将记录失败的测试用例，并在需要时进行最小化，以找到导致问题的最小输入。

通过这种方式，JQF 可以在大量的随机测试用例中验证程序的属性，从而发现可能的错误或不一致性。

在实际应用中，属性可以更加复杂，以涵盖程序的更多方面和规范。






## 详细介绍一下 JQF 中的 生成器（Generators），以及具体的例子

在 JQF（Java QuickCheck Fuzzing）中，生成器（Generators）是用于生成随机输入数据的关键组件。这些生成器负责产生测试用例，以便覆盖程序的各种可能输入。在 JQF 中，使用了 QuickTheories 库，它是 QuickCheck 风格的生成器库，提供了强大的生成器功能。

以下是 JQF 中生成器的概述和一个简单的例子：

### JQF 中的生成器概述：

1. **QuickTheories 库：** JQF 使用 QuickTheories 作为其生成器库。QuickTheories 提供了丰富的 API，允许开发者创建各种类型的生成器，包括基本数据类型、集合、自定义对象等。

2. **基本生成器：** QuickTheories 提供了一系列用于生成基本数据类型（如整数、浮点数、字符等）的生成器。这些生成器能够生成不同范围和分布的随机值。

3. **组合生成器：** 开发者可以使用 QuickTheories 的组合生成器来创建更复杂的输入。这包括生成器的组合、映射、过滤等操作，使得生成器能够生成复合结构的数据。

4. **自定义生成器：** JQF 允许开发者定义自己的生成器，以适应特定的测试需求。这通过实现 QuickTheories 的 `Gen` 接口或使用提供的工厂方法来实现。

### JQF 生成器的例子：

假设我们有一个简单的类，代表一个二维坐标点：

```java
public class Point {
    private int x;
    private int y;

    public Point(int x, int y) {
        this.x = x;
        this.y = y;
    }

    // Getters and setters...
}
```

我们想要测试一个函数，该函数接受两个坐标点并计算它们之间的欧氏距离：

```java
public class DistanceCalculator {
    public static double calculateDistance(Point p1, Point p2) {
        int dx = p2.getX() - p1.getX();
        int dy = p2.getY() - p1.getY();
        return Math.sqrt(dx * dx + dy * dy);
    }
}
```

我们可以使用 JQF 生成器来生成测试用例：

```java
import net.jqwik.api.*;

public class DistanceCalculatorTest {

    @Property
    boolean distanceCalculationIsAlwaysNonNegative(@ForAll("generatePoints") Point p1, @ForAll("generatePoints") Point p2) {
        double distance = DistanceCalculator.calculateDistance(p1, p2);
        return distance >= 0;
    }

    @Provide
    Arbitrary<Point> generatePoints() {
        // 使用 QuickTheories 的生成器创建坐标点
        return Arbitraries.integers().all().zip(Arbitraries.integers().all(), Point::new);
    }
}
```

在这个例子中，`generatePoints` 方法是一个自定义生成器，它使用 QuickTheories 提供的生成器 `Arbitraries.integers().all()` 来生成两个整数，然后使用这两个整数创建一个 `Point` 对象。`@ForAll("generatePoints")` 注解表示这两个点是由 `generatePoints` 方法生成的。

通过这样的方式，JQF 将生成大量的随机坐标点对，用于测试 `DistanceCalculator` 类的 `calculateDistance` 方法，并验证其欧氏距离始终是非负的。

这是一个简单的例子，演示了如何使用 JQF 的生成器来生成随机测试用例。在实际应用中，生成器可以更复杂，以涵盖程序的更多可能输入。



## 详细介绍一下 JQF 中的 QuickCheck 的思想，以及具体的例子

QuickCheck 是一种属性驱动测试（Property-Based Testing）的框架，最初是由 Haskell 社区引入的。

其核心思想是通过属性（Properties）描述程序的期望行为，然后生成大量的随机测试用例来验证这些属性。QuickCheck 的目标是使测试更全面、更自动化，以帮助发现代码中的潜在错误。

以下是 QuickCheck 的核心思想和其在 JQF 中的应用：

1. **属性描述程序行为：** 在 QuickCheck 中，开发者通过编写属性来描述程序的行为。属性是一种断言，它定义了程序在某个输入下应该具备的特定性质。例如，一个属性可能是一个关于排序算法的断言，指明排序后的结果应该是有序的。

2. **生成随机测试用例：** QuickCheck 使用生成器（Generators）来生成大量的随机测试用例。生成器负责创建输入数据，确保测试用例覆盖了程序的各种可能输入。这样，开发者无需手动编写大量的测试用例，而是通过定义生成器和属性，QuickCheck 将自动生成并运行测试。

3. **自动化测试过程：** QuickCheck 的测试过程是自动化的。开发者定义属性和生成器后，框架负责生成大量输入，运行测试，并报告属性是否被满足。这种自动化的方法有助于更全面地覆盖程序的状态空间。

4. **发现边界情况：** 由于测试用例是随机生成的，QuickCheck 有助于发现程序中的边界情况和边缘情况。这包括输入的极端值，可能导致程序行为异常的情况。

在 JQF 中，QuickCheck 的思想得到了继承和扩展。JQF 提供了对 Java 程序的支持，使得开发者能够利用 QuickCheck 的属性驱动测试方法来模糊测试他们的 Java 代码。

以下是一个简单的 JQF QuickCheck 示例，假设我们有一个排序函数：

```java
import org.quicktheories.core.Gen;
import org.quicktheories.generators.Generate;
import org.quicktheories.generators.SourceDSL;

public class SortingExample {
    public static int[] sort(int[] array) {
        // 实现排序算法，这里简单起见使用 Arrays.sort
        Arrays.sort(array);
        return array;
    }
}
```

然后我们可以编写一个 JQF QuickCheck 属性：

```java
import net.jqwik.api.*;
import org.quicktheories.core.Gen;
import org.quicktheories.generators.Generate;
import org.quicktheories.generators.SourceDSL;

import java.util.Arrays;

public class SortingExampleQuickCheck {

    @Property
    boolean sortedArrayShouldBeSorted(@ForAll int[] inputArray) {
        // 使用排序函数进行排序
        int[] sortedArray = SortingExample.sort(inputArray);
        
        // 验证排序后的数组是否是有序的
        for (int i = 1; i < sortedArray.length; i++) {
            if (sortedArray[i - 1] > sortedArray[i]) {
                return false;
            }
        }
        return true;
    }
}
```

在这个例子中，`sortedArrayShouldBeSorted` 方法是一个属性，它验证排序后的数组是否是有序的。

`@ForAll` 注解表示该属性对所有生成的输入都适用。

JQF 将使用 QuickCheck 的思想，自动生成大量的随机测试用例，并验证这个属性是否始终成立。

如果属性在某个测试用例中失败，JQF 还会尝试最小化输入，以找到导致问题的最小输入。

这有助于开发者更容易地理解和修复问题。


# 参考资料

https://github.com/rohanpadhye/jqf

* any list
{:toc}