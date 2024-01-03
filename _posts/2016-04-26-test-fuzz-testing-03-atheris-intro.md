---
layout: post
title:  test fuzz-03-模糊测试 Atheris A Coverage-Guided, Native Python Fuzzer 
date:  2016-04-26 14:10:52 +0800
categories: [Test]
tags: [java, test]
published: true
---

# 拓展阅读

[便于 Java 测试自动生成对象信息](https://github.com/houbb/data-factory)

# 

# chat

## 详细介绍下 Atheris

[Atheris](https://github.com/google/atheris) 是由 Google 开发的 Python Fuzzing Engine。

它是一个用于模糊测试（fuzz testing）的工具，旨在发现 Python 代码中的漏洞和安全问题。

以下是关于 Atheris 的详细介绍：

## 特点：

1. **无需修改源代码：** Atheris 可以在不修改源代码的情况下对 Python 模块进行模糊测试。这使得对现有项目进行快速测试成为可能，而无需修改其源代码。

2. **基于 LLVM libFuzzer：** Atheris 构建在 LLVM libFuzzer 上，这是一个强大的二进制模糊测试引擎。通过利用 LLVM 的功能，Atheris 能够高效地执行模糊测试。

3. **Python C API 支持：** Atheris 支持 Python C API，因此可以测试 C 扩展模块以及纯 Python 代码。这对于涉及混合语言开发的项目非常有用。

4. **自动输入生成：** Atheris 可以生成输入，以便测试 Python 代码的各种路径和分支。这有助于检测可能导致安全问题的不同代码路径。

5. **无副作用：** Atheris 设计为在执行测试时不产生副作用。这意味着在测试期间，它不会更改文件系统或网络状态。

## 使用示例：

以下是使用 Atheris 进行模糊测试的简单示例：

```python
import atheris

# 定义要测试的函数
def TestOneInput(data):
    if data.startswith(b"Hello"):
        raise RuntimeError("Input starts with 'Hello'")

# 注册测试函数并运行 Atheris
atheris.Setup(sys.argv, TestOneInput)
atheris.Fuzz()
```

在这个例子中，`TestOneInput` 函数是我们希望进行模糊测试的 Python 函数。Atheris 会自动生成输入并执行该函数，以寻找潜在的漏洞。

## 安装：

要安装 Atheris，可以使用以下 pip 命令：

```bash
pip install atheris
```

然后，可以按照上述示例编写 Python 脚本，并使用 Atheris 进行模糊测试。

请注意，Atheris 的使用可能需要一些配置，具体取决于您的测试环境和项目。详细信息可以在 [Atheris GitHub 仓库](https://github.com/google/atheris) 上找到。

## 详细介绍一下 LLVM libFuzzer

LLVM libFuzzer 是 LLVM 编译器基础设施的一部分，是一个用于模糊测试的强大引擎。模糊测试是一种自动化测试技术，它通过向程序输入注入随机或半随机的数据（称为"模糊"输入），然后监控程序的执行，以发现潜在的错误、漏洞和安全问题。

以下是 LLVM libFuzzer 的一些关键特点和工作原理：

## 特点：

1. **基于 LLVM：** libFuzzer 是 LLVM（Low Level Virtual Machine）的一部分，是 LLVM 的一种插件。因此，它可以与 LLVM 兼容，并直接集成到 LLVM 编译器中。

2. **快速且高效：** libFuzzer 被设计为高效执行大规模模糊测试。它使用一种称为"基于覆盖率的反馈"（coverage-guided feedback）的方法，通过监视程序的代码覆盖率来引导模糊测试的输入生成。这使得 libFuzzer 能够快速探索程序的不同执行路径。

3. **无需源代码更改：** libFuzzer 可以直接用于未修改的二进制程序，而无需对其源代码进行任何更改。这对于测试封闭源代码的程序或对现有代码进行快速测试非常有用。

4. **支持多种语言：** libFuzzer 不仅支持 C/C++，还支持其他编程语言，例如 Rust、Swift 等。这使得它成为一个通用的模糊测试工具。

5. **内嵌的输入生成器：** libFuzzer 包含一个内置的输入生成器，可以自动生成具有高覆盖率的输入。这减轻了用户编写自定义输入生成器的负担。

## 工作原理：

1. **初始化：** libFuzzer 在程序执行之前进行初始化，配置运行时环境以捕获覆盖率信息。

2. **输入生成：** libFuzzer 使用内置的输入生成器或用户提供的输入生成器生成模糊输入。生成的输入是随机或半随机的。

3. **执行：** 使用生成的输入运行目标程序，并监控其执行路径的覆盖率。覆盖率信息被记录下来，用于指导下一轮输入生成。

4. **反馈：** 根据覆盖率信息，libFuzzer 调整输入生成策略，以便更有可能发现新的执行路径和潜在问题。这个过程迭代进行，直到达到预定的测试时间或测试次数。

5. **报告：** libFuzzer 在测试结束时生成报告，其中包含覆盖率信息、发现的错误等。这有助于用户分析测试结果。

## 使用 libFuzzer：

使用 libFuzzer 进行模糊测试的一般步骤如下：

1. 编写目标程序或选择现有程序作为目标。
2. 配置编译器，以便使用 libFuzzer 插件。
3. 使用 libFuzzer 运行目标程序，指定输入生成器等参数。
4. 分析测试结果，修复发现的问题，并迭代测试。

libFuzzer 的详细文档和示例可以在 LLVM 官方网站上找到。

## Atheris 支持 java 吗？如何支持的？给出具体的使用例子

Atheris 是一个基于 Python 的模糊测试引擎，专注于对 Python 代码进行模糊测试。

截至我截取的知识（截至2022年1月），Atheris 并不直接支持 Java。

Atheris 主要用于测试 Python 代码，而对于其他编程语言，需要使用相应的模糊测试工具。

如果你希望对 Java 代码进行模糊测试，可以考虑使用与 Java 相关的模糊测试工具，比如前面提到的 JQF（Java QuickCheck Fuzzing）等。

这些工具专门为 Java 语言提供了支持，并能够更好地集成到 Java 生态系统中。

以下是一个使用 JQF 进行 Java 模糊测试的简单例子：

```java
import edu.berkeley.cs.jqf.fuzz.Fuzz;
import edu.berkeley.cs.jqf.fuzz.JQF;

import static org.junit.Assert.assertTrue;

import org.junit.runner.RunWith;

@RunWith(JQF.class)
public class SimpleFuzzTest {

    @Fuzz
    public void testFuzz(String input) {
        // Your fuzzing logic here
        assertTrue(input.length() < 100);
    }
}
```

在这个例子中，`@Fuzz` 注解标记的 `testFuzz` 方法是一个由 JQF 运行的模糊测试方法。

JQF 将自动为 `input` 参数生成随机的字符串，并执行测试逻辑。这只是一个简单的示例，你可以根据需要编写更复杂的测试逻辑。

请注意，Atheris 与 Python 相关，而 JQF 适用于 Java。在选择模糊测试引擎时，请确保选择与目标编程语言兼容的工具。

# 参考资料

https://github.com/rohanpadhye/jqf

* any list
{:toc}