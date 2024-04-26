---
layout: post
title: java 变更日志-07-jdk12
date:  2017-06-28 23:15:43 +0800
categories: [Java]
tags: [jdk, java]
published: true
---

# 拓展阅读

[Java Functional java 函数式编程](https://houbb.github.io/2017/06/29/java-functional)

[Java Lambda](https://houbb.github.io/2017/06/28/java-lambda)

# jdk12 有哪些新特性

JDK 12 是 Java SE 12 的版本，发布于2019年3月，它包含了多项新的特性、改进和实验性功能。

以下是 JDK 12 中一些主要的新特性：

1. **Switch 表达式（JEP 325）**：引入了一种新的 switch 表达式，使得 switch 语句更加简洁和易用，支持在 switch 表达式中使用箭头（->）和 lambda 形式。

2. **微基准测试套件（JEP 230）**：引入了一个新的微基准测试套件，称为 JDK Microbenchmark Suite (JMH)。它提供了一种简单、可靠的方式来编写、运行和评估微基准测试。

3. **JVM 常量 API（JEP 334）**：引入了一组新的 API 来支持描述加载到 JVM 的常量值。

4. **Shenandoah 垃圾收集器（JEP 189）**：Shenandoah 是一个低延迟垃圾收集器，它在 JDK 12 中以实验性功能的形式引入，旨在减少垃圾收集的停顿时间。

5. **默认 CDS 归档（JEP 341）**：引入了一种新的类数据共享 (CDS) 归档格式，称为默认 CDS 归档，以提高类的加载时间和空间效率。

6. **Prompto 测试工具（JEP 341）**：引入了 Prompto，一个用于开发和执行测试的新的工具和框架。

7. **G1 垃圾收集器的增强（JEP 344）**：在 JDK 12 中，G1 垃圾收集器进行了一些优化和增强，以提高其性能和稳定性。

这些新特性和改进进一步完善了 Java 的功能性和性能，使得 Java 在现代应用程序开发中仍然保持着其强大的竞争力。

JDK 12 的发布体现了 Java 平台持续演进的承诺，不断地引入新的特性和技术，以满足不断变化的编程需求。

# 详细介绍 jdk12 Switch 表达式（JEP 325）

JDK 12 引入了一个新的特性：Switch 表达式，该特性旨在增强 Java 中的 switch 语句，使其更加简洁、灵活和易用。Switch 表达式允许你在 switch 语句中使用更现代、更函数式的语法，包括箭头（->）和 lambda 形式。

### Switch 表达式的基本语法

```java
int numLetters = switch (day) {
    case "MON", "WED", "FRI" -> 6;
    case "TUE", "THU", "SAT" -> 5;
    case "SUN" -> 7;
    default -> throw new IllegalArgumentException("Invalid day: " + day);
};
```

在这个示例中，我们使用 switch 表达式计算一周中每天的字母数量。

### 主要特点

1. **箭头（->）语法**：Switch 表达式使用箭头（->）来替代传统的冒号（:）。

2. **Lambda 形式**：你可以在 case 标签中使用 lambda 形式。

3. **多值 case 标签**：Switch 表达式支持多个值的 case 标签，用逗号分隔。

4. **局部变量类型推断**：你可以使用 var 关键字进行局部变量类型推断。

### 示例

#### 简单的 Switch 表达式

```java
String fruit = "apple";
int price = switch (fruit) {
    case "apple" -> 10;
    case "banana" -> 5;
    default -> throw new IllegalStateException("Unexpected value: " + fruit);
};
```

#### 使用 Lambda 形式

```java
int number = 42;
String evenOrOdd = switch (number % 2) {
    case 0 -> {
        yield "even";
    }
    case 1 -> {
        yield "odd";
    }
    default -> {
        yield "unknown";
    }
};
```

在这个示例中，我们使用 yield 关键字来返回一个值。

### 总结

Switch 表达式是 JDK 12 中引入的一个重要特性，它使得 switch 语句更加灵活和强大，提供了一种现代、清晰的方式来编写条件分支逻辑。

Switch 表达式的引入进一步提升了 Java 语言的表达能力和可读性，使得开发者能够更加高效地编写和维护代码。

# 详细介绍 jdk12 微基准测试套件（JEP 230）

JDK 12 引入了一个名为微基准测试套件（JEP 230）的新特性，这是一个重要的改进，旨在提供一种标准化和简化的方法来执行 Java 应用程序的微基准测试。微基准测试主要用于评估代码片段的性能，这些代码片段通常会被频繁地执行，因此性能优化对它们来说至关重要。

### 微基准测试套件（JMH）的主要特点：

1. **简化测试编写**：JMH 提供了简化的 API 和注解，使得编写和运行微基准测试变得更加容易。

2. **可靠的测量**：JMH 提供了准确的测量工具和统计信息，以确保测试结果的可靠性和一致性。

3. **多种测试模式**：JMH 支持多种测试模式，包括基准测试、测试迭代和测试尺寸。

4. **集成度高**：JMH 可以轻松地集成到现有的构建和测试工作流中，支持主流的构建工具和测试框架。

### JMH 测试的基本结构：

一个基本的 JMH 测试通常包括以下几个部分：

1. **状态对象**：定义需要测试的对象和数据。
  
2. **Benchmark 方法**：使用 @Benchmark 注解标记的方法，表示要进行性能测试的代码片段。

3. **运行测试**：使用 JMH 提供的 Runner 运行测试，并获取性能数据。

### 示例：

```java
import org.openjdk.jmh.annotations.*;

@State(Scope.Thread)
public class MyBenchmark {

    private int[] array;

    @Setup
    public void setup() {
        array = new int[1000000];
        for (int i = 0; i < array.length; i++) {
            array[i] = i;
        }
    }

    @Benchmark
    public int testMethod() {
        int sum = 0;
        for (int i : array) {
            sum += i;
        }
        return sum;
    }
}
```

在这个示例中，我们定义了一个名为 `MyBenchmark` 的类，其中包含一个 `testMethod` 方法，该方法使用 @Benchmark 注解标记。`@Setup` 注解用于初始化测试状态。

### 运行测试：

你可以使用 Maven 或 Gradle 来运行 JMH 测试。以下是使用 Maven 运行 JMH 测试的基本命令：

```shell
mvn clean install
java -jar target/benchmarks.jar
```

### 总结：

微基准测试套件（JMH）为 Java 开发者提供了一个强大、灵活和标准化的工具，用于评估和优化代码的性能。

它简化了性能测试的编写和运行，提供了准确和一致的性能测量，有助于开发者更有效地优化和调试他们的应用程序。

JMH 的引入进一步提升了 Java 平台在性能优化领域的竞争力，加强了 Java 在现代应用开发中的地位。

# 详细介绍 jdk12 JVM 常量 API（JEP 334）

JDK 12 引入了一个新的特性：JVM 常量 API（JEP 334）。这个特性旨在支持加载到 JVM 的常量值，并提供一组新的 API 来访问和操作这些常量。这些常量可以用于描述常见的数据类型，如 int、long、float、double 和 String，以及一些特定的常量，如动态调用点、字段和方法句柄。

### 主要特点：

1. **支持常见数据类型**：JVM 常量 API 支持加载到 JVM 的基本数据类型（如 int、long、float、double）和字符串常量。

2. **动态调用点常量**：引入了新的常量类型，用于表示动态调用点（DynamicCallSite）。

3. **字段和方法句柄常量**：支持加载到 JVM 的字段和方法句柄常量，这些常量可以在字节码中被引用。

4. **增强的反射和字节码操作**：提供了一组新的 API，使得在运行时可以更容易地访问和操作常量池中的常量。

### JVM 常量 API 示例：

#### 创建和访问常量：

```java
import java.lang.constant.*;

public class ConstantExample {

    public static void main(String[] args) {
        // 创建一个字符串常量
        ConstantDesc strConstant = ConstantDescs.ofString("Hello, World!");

        // 访问字符串常量的内容
        String value = strConstant.describeConstable().resolveConstantDesc(String.class).stringValue();

        System.out.println(value); // 输出：Hello, World!
    }
}
```

在这个示例中，我们使用 `ConstantDescs.ofString()` 方法创建了一个字符串常量，并使用 `resolveConstantDesc()` 方法访问了常量的值。

#### 动态调用点常量：

```java
import java.lang.invoke.*;

public class DynamicCallSiteExample {

    public static void main(String[] args) throws Throwable {
        MethodHandles.Lookup lookup = MethodHandles.lookup();
        MethodType mt = MethodType.methodType(void.class);
        CallSite cs = LambdaMetafactory.metafactory(lookup, "run",
            MethodType.methodType(Runnable.class), mt, lookup.findStatic(DynamicCallSiteExample.class, "sayHello", mt), mt);
        Runnable r = (Runnable) cs.getTarget().invokeExact();
        r.run(); // 输出：Hello, World!
    }

    public static void sayHello() {
        System.out.println("Hello, World!");
    }
}
```

在这个示例中，我们使用 `LambdaMetafactory.metafactory()` 方法创建了一个动态调用点常量，并使用 `invokeExact()` 方法调用了该动态调用点。

### 总结：

JVM 常量 API（JEP 334）是 JDK 12 中的一个重要特性，它引入了新的 API 和常量类型，使得在 JVM 中可以更加灵活地操作和访问常量。

这个特性不仅提供了对基本数据类型和字符串常量的支持，还支持动态调用点和方法句柄常量，进一步增强了 Java 在反射和动态语言特性方面的能力。

JVM 常量 API 的引入为 Java 语言和平台的发展提供了更多可能性，有助于提高代码的表达力和运行时的灵活性。

# 详细介绍 jdk12 Shenandoah 垃圾收集器（JEP 189）

JDK 12 引入了一个新的垃圾收集器：Shenandoah（JEP 189）。

Shenandoah 是一个可伸缩、低延迟的垃圾收集器，主要设计用于减少 GC 停顿时间，特别是对于大内存堆和大型应用程序。

它旨在提供高吞吐量和低延迟，同时不牺牲应用程序的整体性能。

### Shenandoah 垃圾收集器的主要特点：

1. **低停顿时间**：Shenandoah 通过并发标记、并发清理和并发压缩等技术，显著减少了垃圾收集的停顿时间。

2. **可伸缩性**：Shenandoah 被设计为可伸缩的，能够处理非常大的内存堆，并在多核处理器上进行高效并行处理。

3. **整理算法**：Shenandoah 使用了一种称为 Region-based 的内存布局策略，这有助于提高内存压缩的效率。

4. **与现有 GC 算法兼容**：Shenandoah 可以与现有的 HotSpot GC 算法（如 G1、Parallel 和 CMS）共同工作，使得应用程序可以选择合适的 GC 策略。

5. **适用于生产环境**：Shenandoah 已经被广泛测试，并在多个大型应用和生产环境中得到了验证。

### 如何启用 Shenandoah 垃圾收集器：

要在 JDK 12 中启用 Shenandoah 垃圾收集器，你可以使用以下 JVM 参数：

```shell
-XX:+UnlockExperimentalVMOptions -XX:+UseShenandoahGC
```

### 示例：

启用 Shenandoah GC 的示例：

```shell
java -XX:+UnlockExperimentalVMOptions -XX:+UseShenandoahGC -jar myApp.jar
```

### 总结：

Shenandoah 垃圾收集器是 JDK 12 中引入的一个重要特性，它为 Java 应用程序提供了一个高效、低延迟的垃圾收集解决方案。

通过并发标记、清理和压缩等技术，Shenandoah 显著减少了垃圾收集的停顿时间，有助于提高应用程序的整体性能和响应性。

# 详细介绍 jdk12 默认 CDS 归档（JEP 341）

JDK 12 引入了一个新特性：默认的类数据共享（CDS）归档（JEP 341）。

CDS 允许在 JVM 启动时预先加载和共享类元数据，以提高应用程序的启动时间和内存使用效率。

在 JDK 12 中，CDS 归档已经成为默认的选项，这意味着开发者无需手动设置就可以享受到 CDS 带来的性能优势。

### 默认 CDS 归档的主要特点：

1. **自动启用**：在 JDK 12 中，默认情况下，CDS 归档是启用的，无需任何额外的配置或命令行选项。

2. **提高启动时间**：通过预先加载和共享类元数据，CDS 可以显著减少 JVM 的启动时间，特别是对于大型应用程序和框架。

3. **减少内存使用**：共享的类元数据可以减少内存使用，因为每个 JVM 实例都可以共享相同的类数据。

4. **与先前版本的 CDS 兼容**：默认的 CDS 归档与 JDK 12 之前版本中的 CDS 归档兼容，这意味着使用先前版本的 CDS 归档的应用程序可以在 JDK 12 中无缝运行。

5. **简化配置**：由于默认启用，开发者不需要关心 CDS 的配置和管理，使得使用 CDS 更加简单和方便。

### 如何利用默认 CDS 归档：

由于默认 CDS 归档在 JDK 12 中自动启用，开发者无需进行任何额外的配置。只需使用 JDK 12 运行应用程序，即可享受到 CDS 带来的性能提升。

### 总结：

默认的类数据共享（CDS）归档（JEP 341）是 JDK 12 中的一个重要特性，它通过预先加载和共享类元数据来提高 JVM 的启动性能和内存使用效率。

由于 CDS 归档已经成为默认选项，这使得开发者可以更容易地利用 CDS 的优势，无需进行复杂的配置和管理。

这个改进进一步提升了 Java 应用程序的启动速度，特别是对于大型和复杂的应用程序，有助于提高用户体验和整体性能。

# 详细介绍 jdk12 G1 垃圾收集器的增强（JEP 344）

JEP 344 在 JDK 12 中介绍了对 G1 垃圾收集器的一系列增强。G1（Garbage-First）垃圾收集器是 JDK 9 引入的一种低延迟、高吞吐量的垃圾收集器。JEP 344 旨在进一步优化 G1 垃圾收集器的性能、稳定性和可预测性。

### G1 垃圾收集器增强的主要特点：

1. **并行 Full GC**：JEP 344 引入了并行 Full GC 功能，这允许在 Full GC 阶段使用多个线程进行垃圾回收，从而加速垃圾收集过程。

2. **堆区域划分优化**：优化了堆区域划分策略，改进了内存分配和回收的效率，特别是在大内存堆上。

3. **性能改进**：通过优化内部数据结构和算法，提高了 G1 垃圾收集器的整体性能。

4. **预测性垃圾回收**：通过更精细的垃圾收集策略，提高了垃圾收集的预测性和稳定性，减少了应用程序的停顿时间。

5. **Eager Reclamation**：增强了内存回收策略，加速了不再需要的内存区域的回收，有助于提高内存使用效率。

### 如何启用 G1 垃圾收集器：

要在 JDK 12 中使用 G1 垃圾收集器，可以通过以下 JVM 参数进行设置：

```shell
-XX:+UseG1GC
```

### 示例：

启用 G1 垃圾收集器的示例：

```shell
java -XX:+UseG1GC -jar myApp.jar
```

### 总结：

JEP 344 引入的 G1 垃圾收集器的增强旨在提高其性能、稳定性和可预测性。

通过引入并行 Full GC、优化堆区域划分、性能改进、预测性垃圾回收和 Eager Reclamation 等功能，JEP 344 有效地提升了 G1 垃圾收集器在大型应用和高并发环境中的垃圾回收效率和整体性能。

这些增强使得 G1 垃圾收集器成为 Java 平台中一款强大、高效和可靠的垃圾收集器选项。

# 总结一下 jdk12 的变化

JDK 12 作为 JDK 11 后的下一个长期支持版本，引入了一系列新特性、增强和优化，旨在进一步提升 Java 平台的性能、稳定性和开发者体验。

以下是 JDK 12 的主要变化：

1. **Switch 表达式（JEP 325）**：引入了新的 Switch 表达式，提供了更简洁、直观的语法来处理复杂的条件逻辑。

2. **微基准测试套件（JEP 230）**：提供了一个新的微基准测试套件，帮助开发者更准确地评估和优化 Java 程序的性能。

3. **JVM 常量 API（JEP 334）**：引入了新的 JVM 常量 API，提供了一种标准化的方式来描述类文件中的常量。

4. **Shenandoah 垃圾收集器（JEP 189）**：引入了 Shenandoah 垃圾收集器，旨在提供低延迟、可伸缩的垃圾收集解决方案。

5. **默认 CDS 归档（JEP 341）**：将类数据共享（CDS）归档作为默认选项，以提高 JVM 的启动性能和内存使用效率。

6. **G1 垃圾收集器的增强（JEP 344）**：对 G1 垃圾收集器进行了优化和增强，提高了其性能、稳定性和可预测性。

此外，JDK 12 还包括了许多其他的改进和更新，包括新的 API、库、工具和性能优化，以及对现有特性的修复和优化。

总体而言，JDK 12 为 Java 开发者提供了一系列有价值的新特性和增强，旨在进一步提升 Java 平台的功能性和竞争力，同时改善开发者的工作流程和用户体验。

* any list
{:toc}