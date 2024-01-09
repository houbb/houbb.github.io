---
layout: post
title: test-03-test case generate 测试用例生成 Randoop 快速开始入门例子
date:  2016-4-26 12:53:12 +0800
categories: [Test]
tags: [junit, test, generate]
published: true
---

# 拓展阅读

> [junit5 系列](https://houbb.github.io/2018/06/24/junit5-01-hello)

> [基于 junit5 实现 junitperf 源码分析](https://houbb.github.io/2021/07/23/junit-performance-junit5)

[Auto generate mock data for java test.(便于 Java 测试自动生成对象信息)](https://github.com/houbb/data-factory)

[Junit performance rely on junit5 and jdk8+.(java 性能测试框架。性能测试。压测。测试报告生成。)](https://github.com/houbb/junitperf)

# 拓展阅读

[自动生成测试用例](https://github.com/houbb/evosuite-learn)

# Randoop

Randoop是用于Java的单元测试生成器，它可以自动为你的类创建JUnit格式的单元测试。

Randoop手册详细说明了如何安装和运行Randoop。

Randoop的工作原理是通过反馈导向的随机测试生成。

这种技术会为被测试类伪随机但智能地生成一系列方法/构造函数调用序列。Randoop执行生成的序列，并利用执行结果创建捕获程序行为的断言。Randoop从代码序列和断言中创建测试用例。

Randoop可用于两个目的：发现程序中的错误以及创建回归测试，以在将来警告您更改程序行为。

Randoop将测试生成和测试执行相结合，形成一种高效的测试生成技术。Randoop甚至在广泛使用的库中发现了以前未知的错误，包括Sun和IBM的JDKs以及核心.NET组件。Randoop在工业界仍在使用，例如在ABB公司。

## 文档：

- Randoop用户手册

对于Randoop的开发者/贡献者：

- Randoop开发者手册
- Randoop API文档
- 项目创意页面（供贡献者/研究者使用）
- 有关Randoop的科学论文

## Randoop的.NET版本：

使用Microsoft的.NET平台的Randoop版本可在https://github.com/abb-iss/Randoop.NET找到。Randoop.NET是一种从头开始重新实现的反馈导向的测试生成工具。与Microsoft Research的原始版本相比，上述链接是ABB公司更新的Randoop.NET版本：

- 修复了一些错误。
- 添加了新功能，尤其是用于更有效的回归测试的回归断言，用于删除或替换程序集中特定方法调用的方法转换器，以及更丰富的调试信息收集。
- 添加了一个GUI，作为VS2010插件。

# 简介

编写测试是重要的，但也是困难且耗时的任务。Randoop可以自动生成Java类的单元测试。

Randoop在许多应用场景中取得了成功，特别是在库类（例如java.util）中。Randoop在ABB和Microsoft等公司以及开源项目中都得到了使用。

以下是Randoop生成的一个JUnit测试用例，该测试用例揭示了OpenJDK中的一个错误（手动添加了注释）：

```java
// 此测试表明JDK集合类可以创建一个与自身不相等的对象。
@Test
public static void test1() {
    LinkedList list = new LinkedList();
    Object o1 = new Object();
    list.addFirst(o1);

    // TreeSet是一个有序集合。根据API文档，此构造函数调用应该引发
    // ClassCastException，因为列表元素不可比较。但是构造函数却默默地（且问题地）接受了列表。
    TreeSet t1 = new TreeSet(list);

    Set s1 = Collections.synchronizedSet(t1);

    // 到这一步，我们成功地创建了一个违反相等性自反性的集合（s1）：
    // 它与自身不相等！这个断言在OpenJDK上运行时失败。
    org.junit.Assert.assertEquals(s1, s1);
}
```

Randoop生成两种类型的测试：

1. 发现错误的错误揭示测试，用于检测当前代码中的缺陷。
2. 用于检测未来错误的回归测试。

# Randoop的典型使用方式如下：

1. 如果Randoop输出了任何发现错误的测试，首先修复底层的缺陷，然后重新运行Randoop，重复这个过程，直到Randoop不再输出发现错误的测试。

2. 将回归测试添加到项目的测试套件中。

3. 每当更改项目时运行回归测试。这些测试将通知您程序行为的更改。

4. 如果有任何测试失败，将测试用例最小化，然后调查失败原因。

5. 如果测试失败指示您引入了代码缺陷，请修复该缺陷。

6. 如果测试失败指示测试过于脆弱或具体（例如，某个方法的输出值已更改，但新值与旧值一样可接受），则忽略该测试。

7. 如果忽略了任何测试（或者如果添加了新代码需要测试），那么重新运行Randoop以生成新的回归测试套件，以替换旧的套件。

论文《Scaling up automated test generation: Automatically generating maintainable regression unit tests for programs》提供了有关如何在项目的整个生命周期内使用Randoop生成的测试的其他建议。

一个典型的程序员只会检查很少量的Randoop测试，仅当它们失败并且显示了缺陷或回归失败时，而且通常只会检查它们的最小化版本。

典型的程序员永远不会手动修改Randoop测试。

# 安装Randoop的步骤如下：

1. Randoop支持Java 8、Java 11、Java 17或Java 19的JVM。

2. 下载并解压文件 `randoop-4.3.2.zip`。本手册使用 `${RANDOOP_PATH}` 表示解压后的存档路径，使用 `${RANDOOP_JAR}` 表示在解压存档中 `randoop-all-4.3.2.jar` 的位置。

3. 或者，如果您想查看或使用源代码，请按照Randoop开发者手册的“入门”部分的说明进行操作。

4. 您可能希望加入 `randoop-discuss@googlegroups.com` 邮件列表，以便收到有关新发布的通知。

# 运行Randoop

可以通过调用其主类 `randoop.main.Main` 来实现：

```bash
java randoop.main.Main command args...
```

Randoop支持三个命令：

1. `gentests` 生成单元测试。详细信息请参见[生成测试](https://randoop.github.io/randoop/manual/#running-randoop-generating-tests)。示例用法：

    ```bash
    java -Xmx3000m -classpath myclasspath:${RANDOOP_JAR} randoop.main.Main gentests --testclass=java.util.TreeSet --output-limit=100
    ```

    （但请注意，使用 `--testclass` 命令行参数仅指定一个被测试的类是非常不寻常的。）

2. `minimize` 最小化失败的JUnit测试套件。详细信息请参见[最小化失败的JUnit测试套件](https://randoop.github.io/randoop/manual/#running-randoop-minimizing-tests). 示例用法：

    ```bash
    java -cp ${RANDOOP_JAR} randoop.main.Main minimize --suitepath=ErrorTest0.java --suiteclasspath=myclasspath
    ```

3. `help` 打印使用消息。详细信息请参见[获取帮助](https://randoop.github.io/randoop/manual/#running-randoop-getting-help)。示例用法：

    ```bash
    java -classpath ${RANDOOP_JAR} randoop.main.Main help
    java -classpath ${RANDOOP_JAR} randoop.main.Main help gentests
    java -classpath ${RANDOOP_JAR} randoop.main.Main help minimize
    ```

   （在Windows上，调整classpath，例如使用分号而不是冒号作为分隔符。）


# 参考资料

https://github.com/EvoSuite/evosuite

https://www.evosuite.org/documentation/maven-plugin/

https://randoop.github.io/randoop/manual/index.html

* any list
{:toc}