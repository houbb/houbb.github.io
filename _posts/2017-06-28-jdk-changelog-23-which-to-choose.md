---
layout: post
title: java 变更日志-23-jdk 最新的版本
date:  2017-06-28 23:15:43 +0800
categories: [Java]
tags: [jdk, java]
published: true
---

# 拓展阅读

[Java Functional java 函数式编程](https://houbb.github.io/2017/06/29/java-functional)

[Java Lambda](https://houbb.github.io/2017/06/28/java-lambda)

# chat

## jdk8 以后得 jdk 版本，目前比较稳定的版本是？

目前（截至 2024 年），Java 17 是最稳定、广泛推荐的版本，也是 长期支持（LTS）版本之一。选择 LTS 版本通常是大多数企业和开发者的首选，因为它提供了长时间的安全更新和性能支持。

### 各版本稳定性概述

1. Java 8：
   - 发布年份：2014 年 3 月
   - 支持状态：Java 8 是一个非常稳定的版本，许多企业仍然使用它，尤其是在没有计划快速迁移到新版本的情况下。然而，Java 8 已经进入了 非 LTS 支持阶段，如果你没有强烈的理由继续使用它，可以考虑升级到 LTS 版本。
   
2. Java 11 (LTS)：
   - 发布年份：2018 年 9 月
   - 支持状态：Java 11 是一个 LTS 版本，提供了长期支持和安全更新，适合生产环境使用。它在性能、模块化（Jigsaw）和垃圾回收等方面做了很多改进。如果你仍在使用 Java 8，并考虑迁移，Java 11 是一个理想的目标。

3. Java 17 (LTS)：
   - 发布年份：2021 年 9 月
   - 支持状态：Java 17 是当前的 LTS 版本，许多企业开始考虑从 Java 8 或 Java 11 迁移到 Java 17。它包含了许多性能改进、语言特性增强和新的 API。它将得到长期的安全支持，适用于需要稳定、长期维护的企业环境。

4. Java 18、19、20（非 LTS）：
   - 发布年份：2022-2023 年
   - 支持状态：这些版本是非 LTS 版本，每个版本的支持期为 6 个月，通常用于尝试新特性和实验性功能，不建议在生产环境中长期使用。它们主要提供了一些新特性，但没有像 LTS 版本那样的长期支持。

5. Java 21 (LTS)：
   - 发布年份：2023 年 9 月
   - 支持状态：Java 21 是最新的 LTS 版本，继 Java 17 之后，它继续加强了语言特性、安全性和性能的改进。对于企业和开发者而言，Java 21 是一个很好的选择，尤其是希望利用最新特性的同时又能获得长期支持的用户。

### 选择稳定版本的建议

- 生产环境：如果你的目标是稳定性和长期支持，Java 17 或 Java 21 是最佳选择。它们都是 LTS 版本，将获得长达 8 年的官方支持，适合长期维护。
  
- 过渡版本：如果你已经使用 Java 8，并计划逐步迁移到更高版本，建议先考虑升级到 Java 11，然后可以平滑过渡到 Java 17 或 Java 21。

- 实验和新特性：如果你希望快速体验新特性，可以尝试 Java 18、19、20 等版本，但请注意，它们没有长期支持，不适合长期生产使用。

### 总结

- Java 17 和 Java 21 是当前最稳定的 LTS 版本，推荐用于生产环境。

- Java 11 是另一个稳定的 LTS 版本，适合从 Java 8 升级过渡。

- Java 8 仍然被许多公司使用，但考虑到未来的安全和性能提升，建议向 LTS 版本（Java 17 或 Java 21）迁移。

## jdk21 和 jdk8 对比，多了哪些核心能力？

Java 21（JDK 21）相比 Java 8（JDK 8），引入了许多核心能力和特性，涵盖了语言功能、性能优化、API 增强和其他重要改进。下面是 JDK 8 和 JDK 21 之间的主要区别和新增功能：

### 1. 语言特性增强

#### Java 8：
- Lambda 表达式：允许以函数式编程的方式编写代码，简化了代码的可读性和可维护性。
- Stream API：提供了一种处理集合（如 `List`、`Set`）的高级方式，支持过滤、映射、排序等操作。
- 默认方法（Default Methods）：允许在接口中定义带有实现的方法，避免破坏已有实现的兼容性。
- 新的日期和时间 API（`java.time`）：替代了原来的 `Date` 和 `Calendar` 类，提供了更强大的日期和时间操作功能。
- Optional 类：用于避免空指针异常，提供了更优雅的方式处理可能为空的值。

#### Java 21：
- 增强的模式匹配（Pattern Matching）：
  - 模式匹配 for `switch`（JEP 433）：增强了 `switch` 语句的功能，使得它可以更容易地匹配不同的类型和结构，支持更复杂的模式。
  - 类型匹配：简化了 `instanceof` 操作符的使用，减少了冗余代码。
  
  示例：
  ```java
  if (obj instanceof String s) {
      // 可以直接使用变量 s
  }
  ```

- 记录类型（Record Types）（JEP 395）：提供了一种简洁的方式来创建数据传输对象（DTO）。`Record` 是一种特殊的类，可以自动生成构造器、`getter` 方法、`toString`、`equals` 和 `hashCode` 方法。

  示例：
  ```java
  record Point(int x, int y) { }
  ```

- 虚拟线程（Virtual Threads）（JEP 425）：通过引入虚拟线程，Java 可以轻松处理大量并发任务，降低线程上下文切换的开销，显著提高吞吐量，适用于高并发应用。
  - 虚拟线程是轻量级的线程，与平台线程相比，创建和管理成本更低，可以在一个进程中创建数百万个虚拟线程。
  - 适用于微服务、网络服务器等高并发场景。

- 结构化并发（Structured Concurrency）（JEP 428）：简化多线程编程，使得并发任务的管理和调度更加易于理解和实现。

### 2. 性能提升

#### Java 8：
- Java 8 引入了 新垃圾回收器（G1 GC），提供了更好的暂停时间控制和内存回收的优化。
- 在 Stream API 中，采用了延迟计算和并行处理的机制，改进了对大规模数据集的处理。

#### Java 21：
- 垃圾回收器的进一步优化：
  - ZGC（Z Garbage Collector） 和 Shenandoah GC 在 Java 21 中得到了进一步的优化，尤其是在大堆内存的低延迟要求下表现得更好。
  - JEP 444 - ZGC 和 Shenandoah GC 共享资源：提升了 GC 的效率和资源利用率，减少了垃圾回收的停顿时间。
  
- JIT（即时编译器）优化：
  - AOT（Ahead-of-Time）编译：允许将 Java 应用提前编译为本地机器代码，从而减少启动时间并优化性能。
  - JEP 422 - 外部 JVM 运行时支持：增强了 JDK 与操作系统的集成能力，提升了性能。

- 更多的性能调优选项：
  - Java 21 进一步提升了对 `java.util` 类库的性能优化，特别是对集合操作的改进，增强了并行计算的支持。

### 3. 新 API 和功能增强

#### Java 8：
- Streams API：对集合和数组提供了一套声明式操作方式。
- 新时间 API：`java.time` 包改进了日期、时间的处理。

#### Java 21：
- 增强的 `java.util` API：
  - 增强的集合 API：Java 21 提供了更多内置的集合操作方法，优化了流的处理。
  - JEP 423 - Foreign Function & Memory API（增强版）：简化了与本地代码和外部内存的交互，帮助开发者编写更高效的代码，避免直接操作 `JNI`。
  
- 新的 `Foreign Memory` API：
  - 使得 Java 可以安全高效地操作外部内存（即非 Java 堆内存），提高了性能，特别是在需要与本地代码交互时。

### 4. 平台支持与跨平台能力

#### Java 8：
- 作为长期支持版本，Java 8 支持广泛的操作系统和平台，但在跨平台能力上仍然局限于传统的 Java 运行时模型。
  
#### Java 21：
- 增强的跨平台支持：Java 21 继续加强了跨平台支持，特别是通过引入虚拟线程、结构化并发等特性，使得 Java 更适合现代的微服务架构和云原生应用。
- 增强的 `JPackage` 工具：可以生成包含自定义 JDK 模块的本地安装包，使得 Java 应用可以在没有 Java 安装的机器上运行。

### 5. 安全性增强

#### Java 8：
- Java 8 引入了许多安全性的改进，例如更强的加密算法（如 AES），并改进了对证书和密钥库的管理。

#### Java 21：
- 增强的密钥管理和证书验证：Java 21 引入了更多安全性的增强，特别是在密码学 API、TLS 协议和证书验证方面进行了优化。
- JEP 436 - Strongly Encapsulate JDK Internals by Default：这项改进对 JDK 内部 API 做了更强的封装，增强了系统的安全性，减少了对未公开内部 API 的依赖。

### 6. 模块化系统

#### Java 8：
- Java 8 没有内建的模块化系统，开发者通常使用传统的类路径来组织项目。

#### Java 21：
- Jigsaw（Java 模块化系统）：在 Java 9 引入后，Java 21 继续改进了模块化系统，提供了更多的模块支持和性能优化，增强了开发和运行时的模块化管理，帮助开发者更好地组织和管理大型应用。

---

### 总结对比：

| 特性                        | Java 8                               | Java 21                           |
|---------------------------------|------------------------------------------|---------------------------------------|
| Lambda 表达式               | 引入                                      | 改进                                   |
| Stream API                  | 引入                                      | 增强                                   |
| 模式匹配                    | 无                                        | 增强（`switch`、`instanceof` 等）      |
| 记录类型                    | 无                                        | 引入（简化 DTO 创建）                  |
| 虚拟线程                    | 无                                        | 引入（大规模并发任务处理）             |
| 结构化并发                  | 无                                        | 引入（简化并发编程）                   |
| 垃圾回收器优化              | G1 GC                                      | ZGC 和 Shenandoah GC 优化              |
| JEP 422（AOT 编译）         | 无                                        | 引入                                   |
| Foreign Memory API          | 无                                        | 引入                                   |
| JPackage 工具               | 无                                        | 引入                                   |

Java 21 引入了大量的新特性，特别是在性能、并发编程和语言简化方面。

这使得 Java 21 更适合现代应用需求，尤其是对于高并发、微服务、云原生应用等场景。

相比之下，Java 8 仍然是一个非常稳定的版本，但它缺乏现代应用程序所需要的一些关键特性和性能优化。

因此，Java 8 的用户如果考虑长期维护和现代化应用，建议迁移到 Java 17 或 Java 21。

## jdk21 比 jdk8 上面差异每一个核心特性，给一个具体的例子

下面是 JDK 8 和 JDK 21 在核心特性上的差异，并附上每个特性的具体示例：

### 1. Lambda 表达式

Java 8 引入 Lambda 表达式，允许以函数式编程的方式编写代码，简化了接口的实现。

#### JDK 8 示例：
```java
import java.util.Arrays;
import java.util.List;

public class LambdaExample {
    public static void main(String[] args) {
        List<String> names = Arrays.asList("Alice", "Bob", "Charlie");

        // 使用 lambda 表达式打印每个名字
        names.forEach(name -> System.out.println(name));
    }
}
```

#### JDK 21 新特性：Lambda 表达式本身没有重大改变，但是可以和模式匹配结合使用。

### 2. Stream API

Java 8 引入了 Stream API，提供了一种声明式处理集合的方式，支持对数据流的操作（如过滤、排序、映射等）。

#### JDK 8 示例：
```java
import java.util.Arrays;
import java.util.List;

public class StreamExample {
    public static void main(String[] args) {
        List<String> names = Arrays.asList("Alice", "Bob", "Charlie", "David");

        // 使用 Stream API 过滤和排序
        names.stream()
             .filter(name -> name.startsWith("A"))
             .sorted()
             .forEach(System.out::println);
    }
}
```

#### JDK 21 新特性：Stream API 本身没有重大变化，但通过与 模式匹配 结合使用，可以进一步简化代码。比如在 `switch` 语句中使用模式匹配来替代传统的 `if` 语句来处理流数据。

### 3. 模式匹配 for `instanceof`

Java 16 引入了模式匹配 for `instanceof`，使得类型检查更加简洁。

#### JDK 8 示例：
```java
Object obj = "Hello";
if (obj instanceof String) {
    String str = (String) obj;
    System.out.println(str);
}
```

#### JDK 21 新特性：简化了 `instanceof` 使用方式，允许直接在条件语句中进行类型转换。

#### JDK 21 示例：
```java
Object obj = "Hello";
if (obj instanceof String str) {
    System.out.println(str); // 无需显式强制转换
}
```

### 4. 模式匹配 for `switch`

Java 21 引入了模式匹配 for `switch`，使得 `switch` 语句更加灵活，能够进行类型匹配，简化了代码。

#### JDK 8 示例：
```java
Object obj = "Hello";
switch (obj.getClass().getSimpleName()) {
    case "String":
        System.out.println("String object");
        break;
    case "Integer":
        System.out.println("Integer object");
        break;
    default:
        System.out.println("Unknown type");
        break;
}
```

#### JDK 21 示例：使用模式匹配可以更加简洁地编写 `switch` 语句。
```java
Object obj = "Hello";
switch (obj) {
    case String s -> System.out.println("String object: " + s);
    case Integer i -> System.out.println("Integer object: " + i);
    default -> System.out.println("Unknown type");
}
```

### 5. 记录类型（Record Types）

Java 14 引入了记录类型（`record`），它简化了 DTO 类的创建，自动生成构造器、`toString`、`hashCode` 和 `equals` 方法。

#### JDK 8 示例：
```java
public class Point {
    private final int x;
    private final int y;

    public Point(int x, int y) {
        this.x = x;
        this.y = y;
    }

    // Getter 和其他方法...
}
```

#### JDK 21 示例：使用 `record` 来简化类的定义，自动生成方法。
```java
public record Point(int x, int y) { }
```

### 6. 虚拟线程（Virtual Threads）

Java 21 引入了虚拟线程，极大地简化了高并发编程，能够创建数百万个虚拟线程，适用于微服务、高并发等场景。

#### JDK 8 示例：传统的线程模型创建线程时开销较大。
```java
public class ThreadExample {
    public static void main(String[] args) throws InterruptedException {
        Runnable task = () -> System.out.println("Task executed by thread: " + Thread.currentThread().getName());

        // 创建一个传统的线程
        Thread thread = new Thread(task);
        thread.start();
        thread.join();
    }
}
```

#### JDK 21 示例：虚拟线程创建非常轻量，适用于大规模并发任务。
```java
public class VirtualThreadExample {
    public static void main(String[] args) throws InterruptedException {
        Runnable task = () -> System.out.println("Task executed by virtual thread: " + Thread.currentThread().getName());

        // 创建一个虚拟线程
        Thread.ofVirtual().start(task);
    }
}
```

### 7. 结构化并发（Structured Concurrency）

Java 21 引入了结构化并发，让并发任务的管理更加简洁。你可以将多个线程任务作为一个“结构”来管理，确保任务的生命周期得到正确控制。

#### JDK 8 示例：需要手动管理线程生命周期。
```java
public class StructuredConcurrencyExample {
    public static void main(String[] args) throws InterruptedException {
        Runnable task1 = () -> System.out.println("Task 1");
        Runnable task2 = () -> System.out.println("Task 2");

        // 手动管理线程
        Thread thread1 = new Thread(task1);
        Thread thread2 = new Thread(task2);

        thread1.start();
        thread2.start();

        thread1.join();
        thread2.join();
    }
}
```

#### JDK 21 示例：结构化并发让线程的管理更简洁。
```java
import java.util.concurrent.*;

public class StructuredConcurrencyExample {
    public static void main(String[] args) throws InterruptedException, ExecutionException {
        var executor = Executors.newVirtualThreadPerTaskExecutor();

        // 使用结构化并发，提交多个任务
        var task1 = executor.submit(() -> System.out.println("Task 1"));
        var task2 = executor.submit(() -> System.out.println("Task 2"));

        task1.get();
        task2.get();
    }
}
```

### 8. 垃圾回收器优化（G1 GC, ZGC, Shenandoah GC）

Java 8 默认使用 G1 GC（引入于 JDK 7），虽然有性能优化，但仍然存在较长的停顿时间，尤其是当堆内存较大时。

#### JDK 8 示例：默认 G1 GC 的配置。
```bash
java -XX:+UseG1GC -jar app.jar
```

#### JDK 21 示例：Java 21 引入了 ZGC 和 Shenandoah GC，提供了低延迟、高吞吐量的垃圾回收选项，特别适合大规模并发的应用。
```bash
java -XX:+UseZGC -jar app.jar
```

### 9. Foreign Memory API

Java 21 引入了 Foreign Memory API，使得 Java 可以安全且高效地操作非堆内存（即本地内存）。这对于处理大型数据结构或者与本地代码交互的应用非常有用。

#### JDK 8 示例：使用 `ByteBuffer` 直接操作堆外内存。
```java
import java.nio.ByteBuffer;

public class ForeignMemoryExample {
    public static void main(String[] args) {
        ByteBuffer buffer = ByteBuffer.allocateDirect(1024);  // 分配直接内存

        buffer.put((byte) 42);
        System.out.println(buffer.get(0));  // 读取直接内存
    }
}
```

#### JDK 21 示例：使用 Foreign Memory API 管理和操作本地内存。
```java
import jdk.incubator.foreign.*;

public class ForeignMemoryExample {
    public static void main(String[] args) {
        var arena = MemorySegment.allocateNative(1024); // 分配本地内存
        var byteView = arena.asByteBuffer();
        byteView.put(0, (byte) 42);
        System.out.println(byteView.get(0));  // 读取本地内存
    }
}
```

---

### 总结

在 JDK 8 到 JDK 21 的演进中，Java 引入了许多重要的特性和功能改进。

特别是模式匹配、虚拟线程、结构化并发、记录类型以及垃圾回收器的优化，都大大提升了 Java 的灵活性、性能和易用性。

如果你正在使用 JDK 8，升级到 JDK 21 可以获得显著的性能提升和更现代的编程体验。

# 参考资料

https://blogs.oracle.com/java/post/the-arrival-of-java-22


* any list
{:toc}