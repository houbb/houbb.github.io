---
layout: post
title:  test fuzz-05-模糊测试 kelinci AFL-based fuzzing for Java
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


# kelinci

Kelinci 是一个在 Java 程序上运行 AFL（American Fuzzy Lop）的接口。

"Kelinci" 在印尼语中意为兔子（印尼语是爪哇岛上的语言）。

此 README 假设 AFL 已经被预先安装。关于如何安装和使用 AFL 的信息，请参阅 http://lcamtuf.coredump.cx/afl/。

Kelinci 已经成功测试过与 AFL 版本 2.44 及更高版本的兼容性。README 解释了如何使用这个工具。

有关技术背景，请参阅 'docs' 目录中的 CCS'17 论文。

在 'examples' 目录中提供了几个示例，每个示例都附有一个 README，详细说明了重复实验的确切步骤。

Kelinci 已经发现了与 OpenJDK（版本 6-9）和 Apache Commons Imaging 1.0 RC7 中 JPEG 解析相关的错误。这些是 bug 报告：

- OpenJDK：http://bugs.java.com/bugdatabase/view_bug.do?bug_id=JDK-8188756
- Apache Commons Imaging：https://issues.apache.org/jira/browse/IMAGING-203

# 安装

该应用有两个组件。首先，有一个充当 AFL 目标应用程序的 C 应用程序。

它的行为与使用 afl-gcc / afl-g++ 构建的应用程序相同；AFL 无法区分它们。这个 C 应用程序位于子目录 'fuzzerside' 中。

它通过 TCP 连接将由 AFL 生成的输入文件发送到 JAVA 端。然后，它接收结果并以期望的格式将其转发给 AFL。要构建，请在 'fuzzerside' 子目录中运行 make。

第二个组件位于 JAVA 端。它位于 'instrumentor' 子目录中。

该组件使用 AFL 风格的管理工具，以及与 C 端通信的组件对目标应用程序进行插装。稍后执行插装程序时，它会设置一个 TCP 服务器，并为每个传入的请求在单独的线程中运行目标应用程序。它会发送回一个退出代码（成功、超时、崩溃或队列已满），以及收集到的路径信息。

任何从主函数中逃逸的异常都被视为崩溃。

要构建，请在 'instrumentor' 子目录中运行 gradle build。

# 使用说明

以下是如何在目标应用程序上运行 Kelinci 的说明。这假设 AFL 和 Kelinci 的两个组件都已经构建。

1. 可选：构建驱动程序 AFL/Kelinci 期望一个接受指定文件位置参数的程序。它会对该程序的文件进行随机变异以进行模糊测试。如果您的目标应用程序不是这样工作的，就需要构建一个驱动程序，该驱动程序解析输入文件并基于此模拟正常交互。在构建驱动程序时，请记住输入文件将被随机变异。程序在文件中期望的结构和凝聚性越少，模糊测试效果就越好。即使程序接受输入文件，也可能构建一个接受不同格式的驱动程序，以最大化有效和无效输入文件的比率。

在构建驱动程序时还需要考虑的一件事是，目标程序将在主方法中被不断调用的虚拟机中运行。所有运行必须是独立和确定性的。例如，如果程序从输入中存储信息到数据库或静态内存位置，请确保重置它，使其不能影响未来的运行。

2. 插装 我们将假设目标应用程序和驱动程序已经构建，输出目录为 'bin'。我们的下一步是为在 Kelinci 中使用而插装这些类。该工具提供了 edu.cmu.sv.kelinci.instrumentor.Instrumentor 类用于此目的。它在 -i 标志之后（这里是 'bin'）和 -o 标志之后（这里是 'bin-instrumented'）需要一个输入目录。我们需要确保 kelinci JAR 在类路径上，以及目标应用程序的所有依赖项。假设目标应用程序依赖的 JAR 文件在 /path/to/libs/ 中，插装的命令如下：

```bash
java -cp /path/to/kelinci/instrumentor/build/libs/kelinci.jar:/path/to/libs/* edu.cmu.sv.kelinci.instrumentor.Instrumentor -i bin -o bin-instrumented
```

请注意，如果项目依赖于与 Kelinci Instrumentor 也依赖于的库的不同版本，可能会出现问题。目前，这些版本是 args4j 版本 2.32、ASM 5.2 和 Apache Commons IO 2.4。在大多数情况下，可以通过将 Kelinci 构建的 'classes' 目录放在类路径上而不是 Fat JAR，然后在类路径上添加与 Kelinci 和目标都可以使用的库 JAR 版本。

3. 创建示例输入 我们想要测试插装后的 Java 应用程序是否正常工作。为此，请创建一个用于示例输入文件的目录：`mkdir in_dir`

AFL 稍后将使用此目录来获取它将进行变异的输入文件。因此，有在其中具有代表性的输入文件非常重要。将代表性文件复制到其中，或者创建它们。

4. 可选：测试 Java 应用程序 查看插装后的 Java 应用程序是否与提供的/创建的输入文件一起正常工作：

```bash
java -cp bin-instrumented:/path/to/libs/* <driver-classname> in_dir/<filename>
```

5. 启动 Kelinci 服务器 现在我们可以启动 Kelinci 服务器了。我们将简单地编辑上一条命令，该命令运行了 Java 应用程序。Kelinci 期望目标应用程序的主类作为第一个参数，因此我们现在只需在其前面添加 Kelinci 主类。我们还需要将具体文件名替换为 @@，Kelinci 将用实际路径替换它。其他参数是可以的，并将在运行过程中被固定。

```bash
java -cp bin-instrumented:/path/to/libs/* edu.cmu.sv.kelinci.Kelinci <driver-classname> @@
```

可选地，我们可以指定一个端口号（默认为 7007）：

```bash
java -cp bin-instrumented:/path/to/libs/* edu.cmu.sv.kelinci.Kelinci -port 6666 <driver-classname> @@
```

6. 可选：测试接口 在我们开始模糊测试之前，让我们确保与 Java 端的连接是否按预期工作。interface.c 程序有一个在 AFL 之外运行的模式，因此我们可以通过以下方式测试它：

```bash
/path/to/kelinci/fuzzerside/interface in_dir/<filename>
```

如果我们在步骤 6 中创建了服务器列表，可以按如下方式将其添加：

```bash
/path/to/kelinci/fuzzerside/interface -s servers.txt in_dir/<filename>
```

可选地，我们可以使用 -s 标志指定服务器（例如 -s 192.168.1.1 或 "sv.cmu.edu"，默认为 "localhost"），并使用 -p 标志指定端口号（默认为 7007）。

7. 开始模糊测试！ 如果一切正常，我们现在可以启动 AFL 了！与 Kelinci 服务器端类似，AFL 期望一个二进制文件，该文件接受一个输入文件作为参数，由 @@ 指定。在我们的情况下，这始终是 interface 二进制文件。它还期望一个包含要开始模糊测试的输入文件的目录，以及一个输出目录。

```bash
/path/to/afl/afl-fuzz -i in_dir -o out_dir /path/to/kelinci/fuzzerside/interface [-s servers.txt] @@
```

如果一切正常，AFL 接口将在短时间内启动，并且您会注意到新路径的发现。对于额外的监控，请查看输出目录。'queue' 子目录中的输入文件触发了不同的程序行为。还有 'crashes' 和 '


# 关于并行化的注意事项

Java 端自然是可以并行化的。只需为要在其上执行 Java 运行的每个核心启动一个实例。

这可以在同一台机器上进行（但端口不同！）或在多台机器上进行。

有关如何并行运行 AFL 的详细信息，请参阅随附的 parallel_fuzzing.txt 文档。您将希望运行与 Java 端 Kelinci 组件数量相同的 afl-fuzz 进程，其中每个 afl-fuzz 进程连接到不同的 Kelinci 服务器。

要连接的 Kelinci 服务器可以使用 `interface.c 的 -s <server>` 和 `-p <port>` 标志指定。

# chat

## 详细介绍下 kelinci

Kelinci 是一个基于 Java 的模糊测试工具，专门用于测试 Java 程序中的网络服务。

它与 AFL（American Fuzzy Lop）结合使用，使得对基于网络通信的程序进行模糊测试变得更加容易。

以下是关于 Kelinci 的详细介绍：

## 主要特点：

1. **基于 AFL：** Kelinci 构建在 AFL 模糊测试引擎之上，利用 AFL 引擎的强大模糊测试能力。

2. **网络服务测试：** Kelinci 的设计目标是测试 Java 程序中的网络服务。它允许模糊测试网络通信协议，例如 HTTP、TCP、UDP 等。

3. **自动化：** Kelinci 可以自动分析并模糊测试网络服务的输入，以寻找潜在的安全漏洞或程序错误。

4. **基于字节的模糊：** 类似于 AFL，Kelinci 是一个基于字节的模糊测试工具，通过修改输入字节流来测试程序。

5. **多语言支持：** 由于 Kelinci 主要关注网络服务，因此它可以与使用不同编程语言编写的服务进行交互，只要这些服务遵循一定的输入输出规范。

## 使用步骤：

1. **Instrumentation：** 在使用 Kelinci 进行模糊测试之前，需要对目标 Java 程序进行仪器化（Instrumentation）。这一步通过修改字节码，使程序能够与 AFL 一起使用。

2. **启动 Kelinci Server：** 运行 Kelinci Server，它会监听来自 AFL 的输入，并将其传递给目标程序。

3. **运行 AFL：** 启动 AFL 模糊测试引擎，它将生成的输入发送到 Kelinci Server。

4. **分析结果：** Kelinci Server 将目标程序的输出结果返回给 AFL 进行分析。AFL 根据目标程序的执行情况来调整模糊测试的输入，以寻找新的测试用例。

5. **重复测试：** 通过不断重复运行 AFL 和 Kelinci Server 的过程，模糊测试将尽可能地覆盖目标程序的输入空间，发现潜在的问题。

## 使用示例：

```bash
# 编译被测程序并进行仪器化
$ ./instrument.sh target/classes com.example.MyServer

# 启动 Kelinci Server
$ java -cp kelinci.jar edu.cmu.sv.kelinci.Kelinci -port 8080 -host localhost

# 启动 AFL 模糊测试引擎
$ afl-fuzz -i afl_in -o afl_out -f input -t 99999 -- java -cp target/classes:/path/to/kelinci/KelinciDriver.class com.example.MyServer @@
```

上述示例中，`com.example.MyServer` 是被测程序，Kelinci Server 监听在本地的 8080 端口。AFL 将生成的输入发送到 Kelinci Server，Kelinci Server 将输入传递给被测程序。整个流程由 AFL 控制。

请注意，这只是一个简单的示例，具体的步骤和命令可能会因目标程序和测试环境而异。

总体来说，Kelinci 是一个为模糊测试网络服务设计的工具，通过与 AFL 结合，提供了一种有效的测试方法，帮助发现网络服务中的潜在问题。

## 为什么要设计成基于字节的模糊？有什么优缺点？

设计成基于字节的模糊测试有其优点和缺点。

以下是一些主要的考虑因素：

### 优点：

1. **通用性：** 基于字节的模糊测试是一种通用的方法，适用于各种编程语言和应用类型。字节是程序处理的基本数据单元，因此这种模糊测试方法可以应用于几乎任何类型的程序。

2. **无需源代码：** 基于字节的模糊测试通常无需访问程序的源代码。这对于测试闭源或无法轻松获取源代码的程序来说是一个优势。

3. **低侵入性：** 对程序进行字节级的修改通常比源代码级的修改更为简单和低侵入性。这可以减小对目标程序本身执行性能和行为的影响。

4. **灵活性：** 字节级的模糊测试更加灵活，可以对程序的任何部分进行模糊，而不仅仅局限于输入。

### 缺点：

1. **语义理解：** 基于字节的模糊测试通常缺乏对语义的理解。测试生成的输入可能是无效的、不合理的或者在实际使用中不太可能出现的。这可能导致测试集中一些不太有意义的输入，而错过一些真正可能导致问题的输入。

2. **输入格式：** 如果目标程序期望特定格式的输入（例如结构化数据、协议消息等），基于字节的模糊测试可能生成无效的输入。这就需要确保生成的字节流仍然符合目标程序的预期输入格式。

3. **复杂性：** 对于某些复杂的数据结构，基于字节的模糊测试可能需要更复杂的算法来确保生成的输入是有效的。这可能会增加工具的实现难度。

总体而言，基于字节的模糊测试是一种广泛应用的测试方法，特别适用于需要测试多种编程语言和应用类型的情况。

然而，它可能需要在工具和测试设置中增加一些额外的步骤，以解决语义理解和输入格式等方面的挑战。







# 参考资料

https://github.com/rohanpadhye/jqf

* any list
{:toc}