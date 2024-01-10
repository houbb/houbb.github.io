---
layout: post
title:  test fuzz-07-模糊测试 libfuzzer
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

# chat

## 详细介绍一下 libfuzzer

`libFuzzer`是Google开发的一种内存安全性测试工具，用于自动化地发现和调试C/C++程序中的内存错误。

它是一个基于覆盖率的模糊测试工具，被设计用于发现诸如缓冲区溢出、使用未初始化的内存和其它与内存相关的错误。

以下是一些关于`libFuzzer`的关键特点和用法：

1. **基于覆盖率的模糊测试：** `libFuzzer`使用基于覆盖率的反馈来引导测试用例的生成。它通过不断变异输入数据，以寻找能够触发不同代码路径的测试用例。

2. **轻量级且易于使用：** `libFuzzer`被设计成轻量级和易于使用。它可以与现有的构建系统和测试框架集成，只需简单地链接到目标程序中即可。

3. **无需修改源代码：** 与一些其他模糊测试工具不同，`libFuzzer`通常无需对目标程序进行源代码修改。这是通过使用LLVM的`Clang`编译器插桩特性实现的。

4. **快速生成最小化的测试用例：** 一旦发现导致问题的测试用例，`libFuzzer`可以自动生成最小化的输入，以帮助定位和修复问题。

5. **支持持久化模糊测试：** `libFuzzer`可以在发现问题后继续运行，以寻找更多的问题。这使得它非常适合用于持久化模糊测试。

6. **内置的过滤器和其他工具：** `libFuzzer`提供了一些有用的内置工具，例如输入过滤器，帮助用户筛选和定制测试用例。

在使用`libFuzzer`时，你需要按照以下步骤进行：

- **编写目标程序：** 编写一个C或C++程序，其中包含你想要测试的代码。

- **插桩编译：** 使用LLVM的Clang编译器插桩目标程序。这通常通过添加`-fsanitize=fuzzer`选项来完成。

- **链接`libFuzzer`：** 将`libFuzzer`链接到目标程序。

- **运行`libFuzzer`：** 运行目标程序，`libFuzzer`将自动生成和变异输入数据，以寻找潜在的内存错误。

`libFuzzer`与其他模糊测试工具（如AFL）相比，更注重内存错误和安全性问题的发现。

## libFuzzer 是如何实现快速生成最小化的测试用例的？ 

`libFuzzer`实现快速生成最小化的测试用例的关键在于其内建的最小化工具。

一旦发现导致问题的测试用例，`libFuzzer`会使用最小化工具来自动生成包含最小输入的版本，以帮助定位和修复问题。下面是它的一般工作流程：

1. **发现问题：** `libFuzzer`运行过程中，当某个测试用例导致程序崩溃或产生内存错误时，它会记录下该测试用例。

2. **生成最小化输入：** `libFuzzer`将使用内建的最小化工具对导致问题的测试用例进行最小化处理。该工具会尝试移除输入数据中的不必要部分，同时保留导致问题的关键信息。

3. **重新运行最小化的测试用例：** 生成的最小化测试用例会被重新运行，以确保它仍然能够触发相同的问题。这有助于验证最小化过程没有改变导致问题的核心特征。

4. **定位问题：** 得到最小输入后，开发者可以更容易地定位和修复问题，因为最小输入通常更易于理解和分析。

整个过程是自动化的，减轻了开发者手动进行最小化测试用例的繁琐工作。这有助于提高修复漏洞的效率，使开发者能够更快地响应和解决发现的问题。

## 详细介绍一下 libfuzzer 的核心概念

libFuzzer 是 Google 开发的一个用于进行模糊测试（fuzz testing）的库，主要用于 C/C++ 代码。

以下是 libFuzzer 的核心概念：

1. **目标函数（Target Function）**：
   - libFuzzer 需要用户定义一个被测试的目标函数，这个函数负责接收输入并执行相应的逻辑。这个目标函数应该返回一个整数，通常是 0 表示正常执行，非零表示异常或错误。
   - 目标函数的签名为 `int LLVMFuzzerTestOneInput(const uint8_t *Data, size_t Size)`。

2. **输入数据（Input Data）**：
   - libFuzzer 使用随机生成的输入数据进行测试。测试开始时，libFuzzer 会调用目标函数，将随机生成的输入数据传递给目标函数进行执行。
   - 输入数据是由一系列字节（`uint8_t` 数组）组成的，其大小由 libFuzzer 自动生成。

3. **变异策略（Mutation Strategies）**：
   - libFuzzer 使用变异策略对输入数据进行修改，以生成更多的测试用例。这些变异包括插入、删除、交换字节等操作。
   - 变异策略是 libFuzzer 的关键部分，它确保生成多样化的输入，以覆盖尽可能多的代码路径。

4. **覆盖率反馈（Coverage Feedback）**：
   - libFuzzer 使用覆盖率信息来指导测试过程，以便更好地发现代码中的潜在问题。
   - 覆盖率信息反映了程序执行期间经过的代码路径，帮助 libFuzzer 确定哪些输入更有可能导致新的代码路径。

5. **输入收缩（Input Minimization）**：
   - libFuzzer 提供输入最小化工具，用于在发现问题后缩小导致问题的输入，以便更容易进行调试和分析。

6. **无崩溃检测（Sanitizer）**：
   - libFuzzer 通常与内存无崩溃检测工具（如 AddressSanitizer）一起使用，以帮助检测内存错误、越界访问等问题。

7. **并行化（Parallelization）**：
   - libFuzzer 允许在多个核上并行运行测试，以提高测试效率。这对于处理大型代码库或长时间运行的测试非常有用。

8. **持续运行（Persistent Mode）**：
   - libFuzzer 支持持续运行模式，可以在测试过程中保留程序状态，以便更好地发现与状态相关的问题。

总体而言，libFuzzer 提供了一个灵活且强大的模糊测试框架，可以帮助发现各种软件中的潜在问题。

## 给出 libfuzzer 的入门例子

以下是一个简单的 libFuzzer 入门例子，用于模糊测试一个假设的目标函数。

请注意，这只是一个基本的演示，实际使用中需要根据被测试程序的特定需求进行更复杂的设置。

```c
#include <stdint.h>
#include <stddef.h>

// 目标函数，需要有特定的签名
extern "C" int LLVMFuzzerTestOneInput(const uint8_t *data, size_t size) {
    // 假设的目标函数逻辑
    int sum = 0;
    for (size_t i = 0; i < size; ++i) {
        sum += data[i];
    }

    // 模拟发现问题的情况
    if (sum == 42) {
        // 触发问题的情况，返回非零值表示发现问题
        return 1;
    }

    // 返回零表示正常执行
    return 0;
}
```

在上面的例子中，我们定义了一个假设的目标函数 `LLVMFuzzerTestOneInput`，该函数接收一个 `const uint8_t` 数组和其大小作为输入。在函数中，我们对输入数据进行简单的累加，并模拟了一个问题的发现情况。

为了使用 libFuzzer 进行测试，我们需要将这个目标函数与 libFuzzer 库链接起来。以下是一个简单的编译和运行 libFuzzer 的命令：

```bash
# 使用 Clang 编译目标函数和 libFuzzer
clang -fsanitize=fuzzer target_function.cpp -o target_function_fuzzer

# 运行 libFuzzer
./target_function_fuzzer
```

libFuzzer 将自动进行模糊测试，生成随机输入，并调用目标函数进行执行。

如果目标函数中的模拟问题条件被满足，libFuzzer 将输出相关信息，并继续进行测试。

这是一个简单的入门例子，实际应用中通常需要更复杂的目标函数和更全面的测试设置。

## 给出深入学习 libfuzzer 的资料，包含网址

深入学习 libFuzzer 的资料主要包括官方文档、示例代码以及一些相关的文章和博客。

以下是一些资源，您可以通过它们来深入了解 libFuzzer：

1. **libFuzzer GitHub 仓库：**
   - [libFuzzer GitHub](https://github.com/llvm/llvm-project/tree/main/compiler-rt/lib/fuzzer)

2. **libFuzzer 官方文档：**
   - [libFuzzer - LLVM](https://llvm.org/docs/LibFuzzer.html)

3. **libFuzzer 示例代码：**
   - [libFuzzer 示例](https://github.com/llvm/llvm-project/tree/main/compiler-rt/test/fuzzer)

4. **Google 开发者博客文章：**
   - ["A Tour of Google’s Fuzzer Test Infrastructure" by Abhishek Arya](https://developers.google.com/web/updates/2018/12/fuzzing-with-webidl)
   - ["Fuzzing Beyond Security" by Chrome Security Team](https://developers.google.com/web/updates/2018/10/fuzzing-beyond-security)

5. **LLVM 和 Clang 文档：**
   - [LLVM Documentation](https://llvm.org/docs/)
   - [Clang Static Analyzer and Fuzzer Integration](https://clang.llvm.org/docs/ClangStaticAnalyzerFuzzerIntegration.html)

请注意，libFuzzer 是 LLVM/Clang 生态系统的一部分，因此与 LLVM 和 Clang 相关的文档和资料也是学习 libFuzzer 的重要资源。通过仔细阅读官方文档、查看示例代码，并实际应用 libFuzzer 进行实验，您将能够更深入地理解和使用这个强大的模糊测试工具。

# 参考资料

https://github.com/rohanpadhye/jqf

* any list
{:toc}