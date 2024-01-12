---
layout: post
title: ETL-20-apache SeaTunnel Dev local 本地开发 Scala 2.11.12 windows10 安装笔记
date: 2024-01-05 21:01:55 +0800
categories: [ETL]
tags: [etl, sh]
published: true
---

# 如何在 windows10 安装 Scala 2.11.12

## jdk 环境准备

```
>echo %JAVA_HOME%
D:\tool\jdk\jdk-1.8

>java -version
java version "1.8.0_371"
Java(TM) SE Runtime Environment (build 1.8.0_371-b11)
Java HotSpot(TM) 64-Bit Server VM (build 25.371-b11, mixed mode)
```

## **下载并解压 Scala：**

   - 前往 [Scala 下载页面](https://www.scala-lang.org/download/)，找到 Scala 2.11.12 的版本并下载 Windows 安装包（通常是.zip文件）。
   > [https://www.scala-lang.org/download/2.11.12.html](https://www.scala-lang.org/download/2.11.12.html)


可以选择直接下载安装包：[https://downloads.lightbend.com/scala/2.11.12/scala-2.11.12.msi](https://downloads.lightbend.com/scala/2.11.12/scala-2.11.12.msi)

或者 zip 包：[https://downloads.lightbend.com/scala/2.11.12/scala-2.11.12.zip](https://downloads.lightbend.com/scala/2.11.12/scala-2.11.12.zip)


为了简单，我们下载安装 scala msi 安装包。

## 版本

```
>scala -version
Scala code runner version 2.11.12 -- Copyright 2002-2017, LAMP/EPFL
```


# 入门例子

在 `D:\code\scala` 下创建文件：HelloWorld.scala

内容如下：

```scala
object HelloWorld {
  def main(args: Array[String]): Unit = {
    println("Hello, World!")
  }
}
```

编译：

```
scalac HelloWorld.scala
```

运行：

```
scala HelloWorld
```

输出效果：

```
Hello, World!
```

# chat

## 详细介绍一下 scala

Scala（意为"Scalable Language"，可扩展语言）是一种多范式编程语言，结合了面向对象编程和函数式编程的特性。

以下是Scala的一些主要特点和概念：

1. **面向对象编程（OOP）：** Scala是一种纯粹的面向对象语言，每个值都是对象。它支持类和对象的概念，允许创建类和实例，并通过继承、多态等方式实现面向对象的编程风格。

2. **函数式编程（FP）：** Scala也是一种函数式编程语言，它支持高阶函数、匿名函数、不可变数据等函数式编程的概念。函数在Scala中是一等公民，可以作为参数传递和返回值。

3. **静态类型系统：** Scala具有强大的静态类型系统，但也具有类型推断功能，使得在编写代码时无需显式指定所有类型。这既提供了类型安全，又减少了代码冗余。

4. **表达力：** Scala设计的目标之一是提供高度的表达力，使得程序员可以使用简洁而清晰的语法编写复杂的逻辑。

5. **并发支持：** Scala提供了丰富的并发库，其中包括`Actor`模型，使得编写并发和并行程序更为容易。Scala还充分利用了Java虚拟机（JVM）的并发支持。

6. **集合库：** Scala具有丰富的集合库，提供了各种不可变和可变的集合类型。这些集合库允许开发人员以一种函数式的风格处理数据。

7. **与Java的互操作性：** Scala代码可以与Java代码无缝集成，可以直接调用Java类和使用Java库。这使得现有的Java代码可以逐步迁移到Scala，而不需要从头开始。

8. **模式匹配：** Scala引入了强大的模式匹配机制，使得对数据结构进行匹配和提取变得更加简单和灵活。

9. **闭包和高阶函数：** Scala支持闭包（closures）和高阶函数，允许将函数作为参数传递给其他函数，以及从函数返回函数。

10. **类型参数化和抽象类型：** Scala允许在类、特征和函数中使用类型参数，以实现更高层次的抽象和泛化。

总体而言，Scala是一门强大而灵活的编程语言，适用于各种应用场景，从命令行工具到大规模分布式系统。

其混合了面向对象和函数式编程的特性，为程序员提供了丰富的工具和范式，以更轻松地编写可维护和可扩展的代码。

## scala 和 java 语言之间的异同

Scala 和 Java 是两种在Java虚拟机（JVM）上运行的编程语言，它们有一些相似之处，也有一些显著的不同点。以下是它们之间的一些主要异同点：

### 相同之处：

1. **运行在JVM上：** Scala 和 Java 都是基于JVM的编程语言，这意味着它们可以利用JVM的跨平台性和广泛的生态系统。

2. **互操作性：** Scala 和 Java 可以相互调用，直接使用对方的库和代码。这使得在项目中逐步引入 Scala 或 Java 变得相对容易。

3. **面向对象：** 两者都是面向对象的语言，支持类、继承、多态等面向对象的编程概念。

4. **静态类型系统：** Scala 和 Java 都具有强大的静态类型系统，提供类型安全和编译时检查。

### 不同之处：

1. **语法和表达力：** Scala 的语法更为灵活和表达力强大，允许使用更简洁的代码实现相同的功能。它引入了许多函数式编程的概念，使得代码更为紧凑。

2. **函数式编程：** Scala 是一门混合了函数式编程和面向对象编程的语言，而 Java 更偏向于面向对象。Scala 支持高阶函数、不可变性等函数式编程的特性。

3. **并发编程：** Scala 在并发编程方面提供了更先进的工具，引入了 Actor 模型等机制，使得编写并发代码更加容易。

4. **类型推断：** Scala 具有更强大的类型推断机制，允许开发人员省略某些类型声明，从而使代码更为简洁。

5. **模式匹配：** Scala 引入了强大的模式匹配机制，使得对数据结构进行匹配和提取变得更加简单和灵活。

6. **可变性：** 在 Scala 中，不可变性是鼓励的，而 Java 中更常见的是可变性。Scala 的集合类默认是不可变的。

7. **类型参数化：** Scala 对于泛型的支持更加灵活，引入了更强大的类型参数化和抽象类型。

8. **类和对象的定义：** 在 Scala 中，类和对象的定义更为紧凑，可以在同一个文件中定义多个类和对象。

总体而言，Scala 和 Java 在某些方面有相似性，但 Scala 引入了许多新的概念和语法，使其更适合于某些场景，尤其是在大规模、并发、函数式编程等方面。选择使用哪种语言通常取决于项目的需求、团队的经验以及个人偏好。

## 给出 scala groovy java 语言的对比表格

下面是 Scala、Groovy 和 Java 三种编程语言的一些对比，涵盖了语法、特性、使用场景等方面的差异。请注意，这只是一个简要的对比，实际选择语言应根据具体的项目需求和团队背景做出。

| 特性/方面              | Scala                               | Groovy                              | Java                                 |
|-----------------------|-------------------------------------|-------------------------------------|--------------------------------------|
| **类型系统**            | 静态类型，类型推断强大                | 动态类型，类型推断                   | 静态类型，显式声明类型                  |
| **语法**                | 复杂，功能强大，支持函数式编程          | 简单，易读易写，支持动态语法           | 相对繁琐，面向对象主导，较为正统        |
| **函数式编程支持**      | 强大，高阶函数，不可变性等            | 有限的函数式支持                      | 有限，Java 8及以上引入了一些函数式特性   |
| **并发编程**            | 强大的并发和并行支持，Actor 模型等    | 有并发支持，但不如 Scala 强大          | 有限，Java 提供了线程和并发包           |
| **模式匹配**            | 强大的模式匹配机制                   | 有限的支持                           | 无                                   |
| **闭包**                | 支持                               | 支持                               | Java 8 引入了 Lambda 表达式支持闭包     |
| **类型推断**            | 强大                               | 强大                               | 无                                   |
| **集合操作**            | 丰富，支持不可变和可变集合              | 丰富，支持 Groovy 的集合操作           | 有限，Java 8及以上引入了一些新的集合操作   |
| **DSL（领域特定语言）** | 支持                               | 支持                               | 无                                   |
| **互操作性**            | 能够与 Java 无缝互操作                | 能够与 Java 无缝互操作                | 可以相互调用，但互操作性相对较强        |
| **适用场景**            | 大规模、并发、函数式编程、DSL 等项目   | 脚本、快速开发、测试脚本等            | 通用，企业级应用，Android 开发等        |

这个表格仅提供了一些主要方面的对比，实际上每种语言都有其独特的优势和适用场景。

选择使用哪种语言通常取决于项目需求、团队经验、性能要求等因素。

## 给出 scala 的学习资料，包含网址

以下是一些学习 Scala 的资料和网址，它们包含了入门教程、文档、在线课程和社区资源等，帮助您更好地学习和掌握 Scala：

1. **官方文档：**
   - [Scala 官方文档](https://docs.scala-lang.org/): Scala 的官方文档是学习的首要资源，包含了语法、标准库和相关工具的详细信息。

2. **在线教程：**
   - [Scala School](https://twitter.github.io/scala_school/): 由 Twitter 出品的 Scala 在线教程，适用于初学者。
   - [Scala Exercises](https://www.scala-exercises.org/): 提供在线学习 Scala 的交互式实践环境。

3. **书籍：**
   - 《Scala 编程》（Programming in Scala）：由 Scala 的创始人之一编写，是一本权威的 Scala 书籍。
   - 《Scala 函数式编程》（Functional Programming in Scala）：介绍 Scala 中的函数式编程概念，适合有一定 Scala 基础的读者。

4. **在线课程：**
   - [Coursera - Functional Programming Principles in Scala](https://www.coursera.org/learn/functional-programming-in-scala): 由 Martin Odersky 教授主持的 Scala 函数式编程课程。
   - [Udemy - Scala and Spark for Big Data and Machine Learning](https://www.udemy.com/course/scala-and-spark-for-big-data-and-machine-learning/): 面向大数据和机器学习的 Scala 和 Spark 课程。

5. **社区和论坛：**
   - [Scala 中文社区](https://www.scala-lang.org/zh/): Scala 的中文社区，提供丰富的学习资源和讨论区。
   - [Stack Overflow - Scala](https://stackoverflow.com/questions/tagged/scala): Stack Overflow 上的 Scala 标签，可以在这里提问问题并获取解答。

6. **项目实践：**
   - 尝试参与开源项目或构建自己的项目，实际项目经验对学习编程语言非常重要。可以在 GitHub 上搜索 Scala 相关的项目，了解实际应用。

记得不断实践和应用所学的知识，通过项目和编码练习来加深理解。

希望这些资源能够帮助您在 Scala 的学习过程中取得成功。

## 如何安装 scala

在 Windows 10 上安装 Scala 2.11.12，您可以按照以下步骤进行操作：

1. **安装 Java：**
   - Scala 运行在 Java 虚拟机上，因此首先需要安装 Java。
   - 前往 [Oracle JDK 下载页面](https://www.oracle.com/java/technologies/javase-downloads.html) 或 [OpenJDK 下载页面](https://adoptopenjdk.net/) 下载并安装适用于 Windows 的 Java JDK。建议选择 JDK 8 或 JDK 11。

2. **设置 JAVA_HOME 环境变量：**
   - 安装 Java 后，设置 `JAVA_HOME` 环境变量，指向您安装的 Java JDK 的路径。
   - 在 Windows 10 上，您可以按 Win + X，选择 "系统"，然后选择 "高级系统设置"，进入 "高级" 选项卡，点击 "环境变量" 按钮，然后在系统变量中添加新的变量名为 `JAVA_HOME`，值为 Java JDK 的安装路径。

3. **下载并解压 Scala：**
   - 前往 [Scala 下载页面](https://www.scala-lang.org/download/)，找到 Scala 2.11.12 的版本并下载 Windows 安装包（通常是.zip文件）。
   - 解压下载的文件到您选择的目录。

4. **设置 PATH 环境变量：**
   - 将 Scala 的 `bin` 目录路径添加到系统的 `PATH` 环境变量中，以便在命令行中直接运行 Scala 相关命令。
   - 在环境变量中添加 `%SCALA_HOME%\bin`，其中 `%SCALA_HOME%` 是 Scala 解压目录的路径。

5. **验证安装：**
   - 打开命令提示符（Command Prompt）或 PowerShell，输入以下命令验证 Scala 是否成功安装：
     ```bash
     scala -version
     ```
   - 如果成功安装，将显示 Scala 的版本信息。

现在，您已经在 Windows 10 上成功安装了 Scala 2.11.12。您可以开始编写和运行 Scala 代码了。请注意，由于 Scala 2.11.12 较为老旧，推荐考虑使用更新的 Scala 版本，例如 Scala 2.13.x。

## 入门例子

当然，下面是一个简单的 Scala "Hello, World!" 例子：

```scala
object HelloWorld {
  def main(args: Array[String]): Unit = {
    println("Hello, World!")
  }
}
```

这个例子中包含了一个名为 `HelloWorld` 的单例对象，它有一个名为 `main` 的方法，该方法接受一个字符串数组作为参数。在 `main` 方法中，使用 `println` 函数输出了 "Hello, World!"。

您可以将这段代码保存为文件（例如 `HelloWorld.scala`），然后使用 Scala 编译器（`scalac`）进行编译，最后使用 Scala 解释器（`scala`）运行生成的字节码文件：

1. 编译：
   ```bash
   scalac HelloWorld.scala
   ```

2. 运行：
   ```bash
   scala HelloWorld
   ```

执行这两个步骤后，您应该在控制台上看到输出的 "Hello, World!"。这是一个非常简单的 Scala 入门示例。

# 参考资料

https://seatunnel.apache.org/docs/2.3.3/contribution/setup

* any list
{:toc}