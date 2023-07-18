---
layout: post
title: Benchmark 性能测试框架 JMH 
date: 2021-07-23 21:01:55 +0800
categories: [Test]
tags: [test, junit, sh]
published: true
---

# 介绍一下 java 性能测试框架 JMH

Java Microbenchmark Harness (JMH) 是一种专门用于进行 Java 代码性能测试的框架。

它是由 OpenJDK 社区开发并维护的，旨在提供准确、一致和可靠的性能测试结果。

JMH 可以帮助开发人员在微秒级别对代码的性能进行精细的测量和分析。

以下是 JMH 的一些主要特点和优势：

1. 自动优化：JMH 会自动解决许多可能影响测试结果的因素，例如 JVM 的热身效应、即时编译（JIT）优化等。这确保了测试的准确性和可重复性。

2. 严格控制：JMH 提供了多种参数配置和统计选项，使得用户可以精确地控制测试的细节，从而获得更加全面的性能分析。

3. 防止优化：JMH 会通过“黑洞”和“白洞”技术，防止 JVM 在测试中进行过度优化或移除没有实际作用的代码。

4. 轻量级：JMH 是一个相对轻量级的库，不会对被测代码产生过多干扰，从而确保测量结果较为准确。

5. 易于使用：虽然性能测试本身是复杂的任务，但是 JMH 提供了一组简洁且易于使用的注解和API，使得开发人员可以轻松地编写性能测试代码。

JMH 测试的基本步骤如下：

1. 编写被测的 Java 方法或代码段。

2. 使用 JMH 提供的注解（如 `@Benchmark`）来标记需要进行性能测试的方法。

3. 配置测试参数，例如执行次数、线程数等。

4. 运行 JMH 测试，它会自动运行多次测试，并生成详细的性能报告。

JMH 的安装和使用需要一定的 Java 和性能测试的知识，但它是一个非常强大和可靠的工具，可以帮助开发人员进行高质量的性能分析和优化。

由于 JMH 是由 OpenJDK 社区维护，因此它与 Java 生态系统紧密集成，并且经过了广泛的测试和验证。

# 给一个入门例子

当使用 JMH 进行性能测试时，一个常见的入门例子是比较两个字符串连接的方式的性能：使用字符串连接操作符（+）和使用 StringBuilder。我们将测试这两种方法的执行时间以比较它们的性能差异。

首先，确保已经正确安装了 JDK 和 Maven。然后，按照以下步骤来编写和运行 JMH 测试。

步骤1：创建 Maven 项目
首先，创建一个 Maven 项目并在 `pom.xml` 文件中添加以下依赖：

```xml
<dependencies>
    <dependency>
        <groupId>org.openjdk.jmh</groupId>
        <artifactId>jmh-core</artifactId>
        <version>1.33</version>
    </dependency>
    <dependency>
        <groupId>org.openjdk.jmh</groupId>
        <artifactId>jmh-generator-annprocess</artifactId>
        <version>1.33</version>
        <scope>provided</scope>
    </dependency>
</dependencies>
```

步骤2：编写性能测试代码

创建一个 Java 类，例如 `StringConcatenationBenchmark`，并编写以下性能测试代码：

```java
import org.openjdk.jmh.annotations.*;

import java.util.concurrent.TimeUnit;

@State(Scope.Thread)
@BenchmarkMode(Mode.AverageTime)
@OutputTimeUnit(TimeUnit.NANOSECONDS)
public class StringConcatenationBenchmark {

    private String str1 = "Hello";
    private String str2 = "World";

    @Benchmark
    public String testStringConcatenation() {
        return str1 + " " + str2;
    }

    @Benchmark
    public String testStringBuilder() {
        StringBuilder sb = new StringBuilder();
        sb.append(str1);
        sb.append(" ");
        sb.append(str2);
        return sb.toString();
    }

    public static void main(String[] args) throws Exception {
        org.openjdk.jmh.Main.main(args);
    }
}
```

在这个例子中，我们使用了 JMH 提供的注解来标记两个被测方法 `testStringConcatenation()` 和 `testStringBuilder()`。

`@Benchmark` 注解表示这些方法是要进行性能测试的方法。`@BenchmarkMode` 注解定义了测试模式（平均时间）。`@OutputTimeUnit` 注解指定了测试结果的时间单位。

步骤3：运行性能测试

在命令行中，进入到项目根目录，并运行以下命令：

```bash
mvn clean install
java -jar target/benchmarks.jar
```

JMH 将运行多次测试，并在控制台输出性能测试结果，包括每个测试方法的平均执行时间等信息。

请注意，由于性能测试的结果可能受到多种因素的影响，因此最好在稳定的环境中运行测试，并运行多次测试以获得更准确的结果。

# idea 编辑器对应的 jmh 插件

对于 IntelliJ IDEA 编辑器，有一个名为 "JMH Plugin" 的插件，它提供了对 Java Microbenchmark Harness (JMH) 框架的支持。该插件使得在 IDEA 中编写和运行 JMH 测试变得更加方便。

以下是安装和使用 JMH Plugin 的步骤：

步骤1：打开 IntelliJ IDEA

确保已经打开了你的 IntelliJ IDEA 编辑器。

步骤2：打开插件设置

点击顶部菜单栏的 "File"（文件），然后选择 "Settings"（设置）。

步骤3：选择插件

在 "Settings" 窗口中，选择 "Plugins"（插件）选项，然后点击 "Marketplace"（插件商店）选项卡。

步骤4：搜索插件

在 "Marketplace" 搜索框中输入 "JMH" 并点击搜索按钮。

步骤5：安装插件

在搜索结果中找到 "JMH Plugin"，然后点击右侧的 "Install"（安装）按钮，跟随提示完成插件安装。

步骤6：重启 IDEA

安装完成后，IntelliJ IDEA 会提示你重启编辑器以激活新安装的插件。请点击 "Restart IDE"（重启编辑器）来重启 IDEA。

步骤7：创建 JMH 测试类

在 IDEA 中创建一个新的 Java 类，然后在类中编写 JMH 测试方法，并使用 JMH 注解标记这些方法。

步骤8：运行 JMH 测试

在编辑器的测试类中右键点击，选择 "Run 'All Benchmarks'"，或者点击测试方法的左侧小绿箭头运行单个测试方法。

IDEA 会使用 JMH 插件来运行你的 JMH 测试，并在运行完成后提供详细的性能测试结果和报告。

通过安装 JMH Plugin，你可以在 IntelliJ IDEA 中轻松编写、运行和分析 JMH 性能测试，帮助你更好地优化和评估你的 Java 代码性能。

# 参考资料

chat

https://plugins.jetbrains.com/plugin/7529-jmh-java-microbenchmark-harness

https://github.com/openjdk/jmh/tree/master

* any list
{:toc}