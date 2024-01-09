---
layout: post
title:  test fuzz-04-模糊测试 jazzer Coverage-guided, in-process fuzzing for the JVM
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

# jazzer

Jazzer是由Code Intelligence开发的一款基于覆盖率引导的JVM平台内部模糊测试工具。

它基于libFuzzer，并将许多基于仪器的变异特性引入了JVM。

Jazzer目前支持以下平台：

- Linux x86_64
- macOS 12+ x86_64和arm64
- Windows x86_64

# 快速入门

您可以使用Docker尝试Jazzer的Autofuzz模式，在此模式下，它会自动生成要传递给给定Java函数的参数，并报告意外的异常和检测到的安全问题：

```bash
docker run -it cifuzz/jazzer-autofuzz \
   com.mikesamuel:json-sanitizer:1.2.0 \
   com.google.json.JsonSanitizer::sanitize \
   --autofuzz_ignore=java.lang.ArrayIndexOutOfBoundsException
```

这里，前两个参数是Java库的Maven坐标和要进行模糊测试的Java函数的完全限定名称，采用"方法引用"形式。

可选的--autofuzz_ignore标志接受一个要忽略的未捕获异常类的列表。

几秒钟后，Jazzer应该会触发一个AssertionError，复现它在此库中发现的一个已修复的错误。

# 使用

## 使用 Jazzer 通过 JUnit 5 进行...

假设您的项目已经设置了 JUnit 5.9.0 或更高版本，例如基于官方的 junit5-samples。

1. 添加依赖项 `com.code-intelligence:jazzer-junit:<latest version>`。所有 Jazzer Maven 构件都使用此密钥进行签名。
2. 在新的或现有测试类中添加一个新的模糊测试：一个使用 @FuzzTest 注释的方法，并至少一个参数。建议使用类型为 FuzzedDataProvider 的单个参数，该参数提供用于生成常用 Java 值的实用函数，或使用 byte[] 以获得最佳性能和发现的可重现性。
3. 假设您的测试类名为 com.example.MyFuzzTests，请创建 inputs 目录 src/test/resources/com/example/MyFuzzTestsInputs。
4. 运行一个模糊测试，将环境变量 JAZZER_FUZZ 设置为 1，以便模糊测试器快速尝试新的参数集。如果模糊测试器找到使您的模糊测试失败甚至触发安全问题的参数，它将将它们存储在 inputs 目录中。在此模式下，每次测试运行仅执行单个模糊测试（有关详细信息，请参见＃599）。
5. 在不设置 JAZZER_FUZZ 的情况下运行模糊测试，以仅对 inputs 目录中的输入执行测试。此模式的行为类似于传统的单元测试，确保模糊测试器先前发现的问题已被修复，并且还可以用于在单个输入上调试模糊测试。

一个简单的基于属性的模糊测试可能如下所示（不包括导入）：

```java
class ParserTests {
   @Test
   void unitTest() {
      assertEquals("foobar", SomeScheme.decode(SomeScheme.encode("foobar")));
   }

   @FuzzTest
   void fuzzTest(FuzzedDataProvider data) {
      String input = data.consumeRemainingAsString();
      assertEquals(input, SomeScheme.decode(SomeScheme.encode(input)));
   }
}
```

可以在 examples/junit 中找到一个完整的 Maven 示例项目。


# CI Fuzz

开源 CLI 工具 cifuzz 使得通过 Jazzer 为 Maven 和 Gradle 项目设置模糊测试变得轻松。它提供了一个命令行界面用于模糊测试运行，对发现进行去重和管理，并为模糊测试提供覆盖率报告。此外，您可以使用 CI Fuzz 在 CI App 中大规模运行您的模糊测试。

GitHub 发布
您还可以使用 GitHub 发布存档来运行一个独立的 Jazzer 二进制文件，该二进制文件启动了为模糊测试配置的自己的 JVM：

1. 从 GitHub 发布页面下载并提取最新版本。
2. 在您的项目中添加一个包含 public static void fuzzerTestOneInput(FuzzedDataProvider data) 方法的新类。
3. 使用 jazzer_standalone.jar 在类路径上编译您的模糊测试。
4. 运行 jazzer 二进制文件（在 Windows 上是 jazzer.exe），指定类路径和模糊测试类：
   ```bash
   ./jazzer --cp=<classpath> --target_class=<fuzz test class>
   ```
   如果看到 libjvm.so 未找到的错误，请确保 JAVA_HOME 指向 JDK。

examples 目录包含了模糊测试的玩具和实际示例。

## Docker

"distroless" Docker 镜像 cifuzz/jazzer 包含最新版本的 Jazzer 和 OpenJDK 17。

将包含已编译的模糊目标的目录挂载到容器中的 /fuzzing，然后像运行 GitHub 发布的二进制文件一样使用它：
```bash
docker run -v path/containing/the/application:/fuzzing cifuzz/jazzer --cp=<classpath> --target_class=<fuzz test class>
```
如果 Jazzer 生成了一个发现，触发它的输入将在相同的目录中可用。

## Bazel

Jazzer 在 rules_fuzzing 中得到支持，这是用于模糊测试的官方 Bazel 规则。

查看 README 以获取在 Java Bazel 项目中使用 Jazzer 的说明。

## OSS-Fuzz

Code Intelligence 和 Google 合作为 OSS-Fuzz 提供了对 Java、Kotlin 和其他基于 JVM 的语言的支持，这是 Google 用于对开源软件进行大规模模糊测试的项目。

阅读 OSS-Fuzz 指南以了解如何设置 Java 项目。



# chat

## 详细介绍下 CodeIntelligenceTesting/jazzer

CodeIntelligenceTesting/jazzer 是一款用于对 Java 程序进行模糊测试的工具。

Jazzer 是一个基于 LLVM 的模糊测试引擎，主要用于发现 Java 代码中的安全漏洞和其他潜在问题。

以下是关于 Jazzer 的一些详细介绍：

## Jazzer 的特点：

1. **基于 LLVM：** Jazzer 使用 LLVM 编译器基础设施，这使得它能够与 Java 代码进行集成并提供高效的模糊测试。

2. **安全漏洞检测：** Jazzer 主要用于检测 Java 代码中的安全漏洞。它能够在 Java 应用程序中模糊测试输入，以发现潜在的安全问题，如缓冲区溢出、代码注入等。

3. **结合 Java 虚拟机（JVM）：** Jazzer 可以与 Java 虚拟机协同工作，通过注入模糊测试输入来执行 Java 代码。这有助于更好地模拟真实世界的运行环境。

4. **灵活的配置：** Jazzer 允许用户配置不同的模糊测试参数，以适应不同的测试场景和需求。

5. **与现有工具集成：** Jazzer 可以与其他安全工具集成，例如静态分析工具、漏洞扫描工具等，以提高整体安全性。

## 使用 Jazzer 的基本步骤：

1. **安装 Jazzer：** 首先，你需要安装 Jazzer 工具。具体的安装步骤可以在 Jazzer 的官方文档或仓库中找到。

2. **编写目标程序：** 准备需要进行模糊测试的 Java 代码。这可以是你自己编写的代码，也可以是已有的项目或库。

3. **配置 Jazzer：** 配置 Jazzer，指定目标程序的执行方式、模糊测试的参数等。这可以通过命令行选项或配置文件完成。

4. **运行模糊测试：** 使用 Jazzer 执行模糊测试。Jazzer 将生成随机或半随机的输入，并注入到目标程序中执行。监控程序的执行，收集模糊测试的结果。

5. **分析结果：** 分析模糊测试的结果，查看是否发现了新的问题或漏洞。修复发现的问题，并迭代进行测试。

## 示例：

以下是一个简单的使用 Jazzer 进行模糊测试的命令行示例：

```bash
jazzer --target your_target.jar
```

在这个例子中，`--target` 参数指定了目标 Java 程序的 JAR 文件。Jazzer 将读取这个 JAR 文件，并对其中的代码进行模糊测试。

请注意，Jazzer 的使用可能会随着时间而有变化，建议查阅官方文档以获取最新的使用说明和配置选项。

# 参考资料

https://github.com/rohanpadhye/jqf

* any list
{:toc}