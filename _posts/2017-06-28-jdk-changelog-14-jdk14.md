---
layout: post
title: java 变更日志-14-jdk14
date:  2017-06-28 23:15:43 +0800
categories: [Java]
tags: [jdk, java]
published: true
---

# 拓展阅读

[Java Functional java 函数式编程](https://houbb.github.io/2017/06/29/java-functional)

[Java Lambda](https://houbb.github.io/2017/06/28/java-lambda)

# jdk14 有哪些新特性

JDK 14 引入了多项新特性和改进，以下是一些主要的更新：

1. **instanceof 的模式匹配（JEP 305）**：这是一个预览特性，它增强了 Java 编程语言，允许通过模式匹配来检查类型，并从对象中提取组件。

2. **打包工具（JEP 343）**：这是一个孵化特性，旨在创建一个用于打包独立 Java 应用程序的工具，使得应用程序可以被打包成特定于平台的软件包格式。

3. **JFR 事件流（JEP 349）**：这个特性提供了一种使用事件流的方式来处理事件，允许应用注册处理器到事件流上，当事件发生时，处理器会被调用。

4. **非易失性映射字节缓冲区（JEP 352）**：这个特性增加了新的特定于 JDK 的文件映射模式，允许使用 FileChannel API 创建引用非易失性内存（NVM）的 MappedByteBuffer 实例。

5. **文本块（JEP 368）**：这是文本块功能的第二个预览版本，它允许使用三个引号分隔的多行字符串，自动格式化字符串以避免转义，并提供了新的 String 类方法来支持文本块。

6. **弃用 Solaris 和 SPARC 端口（JEP 362）**：这个 JEP 声明了 Solaris/SPARC、Solaris/x64 和 Linux/SPARC 平台上的 OpenJDK 移植为废弃的，并计划在未来版本中移除。

7. **删除 CMS 垃圾回收器（JEP 363）**：在 JDK 9 中已被声明为废弃的 CMS 垃圾回收器，在 JDK 14 中被完全移除。

8. **ZGC 的 macOS 和 Windows 支持（JEP 364 和 JEP 365）**：将 Z Garbage Collector 移植到 macOS 和 Windows 平台。

9. **废弃 ParallelScavenge + SerialOld 的 GC 组合（JEP 366）**：这个 JEP 声明了使用 ParallelScavenge 加 SerialOld 的垃圾回收器组合为废弃的。

10. **删除 Pack200 工具和 API（JEP 367）**：Pack200 工具和 API 在 Java 11 中已被声明为废弃，在 JDK 14 中被移除。

11. **外部内存访问 API（JEP 370）**：这是一个孵化特性，提供了一种安全高效的方式来访问 Java 堆内存之外的外部内存。

12. **改进的 NullPointerExceptions（JEP 358）**：这个特性增强了对 NullPointerException 异常的处理，可以显示详细的信息，帮助开发者更准确地定位问题所在。

13. **记录类型（JEP 359）**：这是记录类型的第二个预览版本，它是一种新的类，用于不可变数据的封装，类似于 Kotlin 中的数据类或 Scala 中的 case class。

14. **Switch 表达式（JEP 361）**：在 JDK 12 和 JDK 13 中作为预览特性引入后，Switch 表达式在 JDK 14 中已成为稳定特性。

这些特性和改进体现了 JDK 14 在语言增强、性能优化、内存管理、安全性和工具链方面的持续进步。

开发者应当关注这些变化，以确保他们的应用程序能够利用 JDK 14 引入的新特性和改进。

# jdk14 instanceof 的模式匹配（JEP 305）

在 JDK 14 中，通过 JEP 305，Java 引入了一个新的特性，即 `instanceof` 的模式匹配。

这是一项很有意义的改进，使得在使用 `instanceof` 运算符进行类型检查时更为方便和简洁。

### 传统的 `instanceof` 使用

在 JDK 14 之前，我们使用 `instanceof` 运算符来检查对象是否是特定类的实例，然后再进行类型转换：

```java
if (obj instanceof String) {
    String str = (String) obj;
    System.out.println(str.length());
}
```

这种方式需要进行两步操作：首先是检查对象类型，然后是类型转换。

### JDK 14 中的模式匹配

在 JDK 14 中，你可以将类型检查和类型转换合并为一步操作，这就是模式匹配的概念：

```java
if (obj instanceof String str) {
    System.out.println(str.length());
}
```

在这个新的语法中，`instanceof` 运算符后面跟着一个变量名（在这个例子中是 `str`）。如果 `obj` 是 `String` 类型的实例，那么 `str` 就会被赋值为该实例，从而避免了显式的类型转换。

### 模式匹配的优点

1. **简洁性**：模式匹配提供了一种更简洁的方式来进行类型检查和转换，使得代码更易读、更少错误。

2. **安全性**：由于类型检查和转换是原子操作，因此减少了由于手动类型转换而可能导致的运行时错误。

3. **可读性**：通过将相关的操作组合在一起，模式匹配可以使代码的意图更加清晰，更容易理解。

### 注意事项

- **作用域**：在模式匹配中声明的变量只在 `if` 语句的主体中可见。
  
- **复杂情况**：虽然模式匹配在许多情况下都很有用，但在处理更复杂的类型结构时可能不如传统的 `instanceof` 和类型转换方式灵活。

总的来说，JDK 14 中引入的 `instanceof` 模式匹配是一个有力的新特性，为 Java 代码的类型检查和类型转换提供了一种更简洁、更安全和更可读的方法。

# jdk14 打包工具（JEP 343）

JEP 343 引入了一个新的打包工具，目标是提供一种新的方式来创建自定义运行时图像，包括非标准模块、资源和解释器特定配置，这些都可以直接编译到一个运行时图像中。

### 新的打包工具：`jpackage`

`jpackage` 工具允许开发者从一个 Java 应用程序创建自定义的运行时镜像。这个工具可以将 Java 应用程序打包成一个本地安装程序，包括所有依赖项和运行时。

#### 主要功能：

1. **自定义运行时图像**：`jpackage` 允许开发者创建一个包含所需 JRE、应用程序和所有依赖项的自定义运行时镜像。

2. **多平台支持**：`jpackage` 支持在不同的操作系统上生成本地安装程序，包括 Windows、macOS 和 Linux。

3. **安装程序生成**：生成的安装程序可以包括各种功能，如创建桌面快捷方式、安装卸载脚本等。

4. **模块和非模块应用程序**：`jpackage` 支持打包标准的 Java 9 模块和传统的类路径应用程序。

#### 使用示例：

以下是使用 `jpackage` 工具创建一个基本安装程序的示例：

```bash
jpackage --input target/myapp.jar \
         --name MyApp \
         --main-jar myapp.jar \
         --main-class com.example.MyApp \
         --type exe \
         --output dist \
         --icon src/main/resources/myapp.ico
```

这个命令将打包名为 `myapp.jar` 的应用程序，并生成一个名为 `MyApp` 的安装程序。安装程序的类型为 `exe`（适用于 Windows 平台），并将其输出到 `dist` 目录。

此外，还指定了应用程序的主类和图标。

#### 注意事项：

- **依赖性和模块路径**：确保所有依赖项和模块路径都已正确配置，以确保应用程序可以正常运行。

- **安装程序大小**：由于 `jpackage` 打包了整个 JRE，生成的安装程序可能会相对较大。

- **平台特定的选项**：`jpackage` 的某些选项可能只在特定的操作系统上受支持。

总体而言，`jpackage` 工具为 Java 开发者提供了一种方便的方式来打包和分发他们的应用程序，同时也提供了一些高级功能，如自定义安装程序和图像，使得打包过程更加灵活和可定制。

# jdk14 JFR 事件流（JEP 349）

JEP 349 引入了 JFR（Java Flight Recorder）的事件流特性。Java Flight Recorder 是 JDK 提供的一个功能强大的诊断工具，用于监控和分析生产环境中的 Java 应用程序性能。事件流是对 JFR 功能的一个重要扩展，允许开发者以编程方式处理和分析 JFR 生成的事件数据。

### JFR 事件流简介

事件流提供了一种流式 API，允许开发者订阅和处理 JFR 生成的事件。

通过事件流，开发者可以更灵活地处理和分析应用程序的性能数据，例如创建自定义的报告、日志或集成其他监控工具。

### 主要特性：

1. **流式 API**：事件流引入了一种新的 API，允许开发者以流的形式访问 JFR 事件。

2. **自定义处理**：开发者可以使用 Java 流 API、Lambda 表达式或其他流式处理技术来处理事件数据。

3. **动态订阅**：事件流支持动态订阅，允许开发者在运行时添加或删除事件处理器。

4. **低延迟**：事件流设计以低延迟为目标，不会显著影响应用程序的性能。

### 使用 JFR 事件流：

以下是使用 JFR 事件流的基本步骤：

1. **创建事件流订阅**：使用 `EventStream` 类创建一个新的事件流订阅。

    ```java
    EventStream stream = EventStream.getEventStream();
    ```

2. **添加事件处理器**：为特定类型的事件添加处理器。

    ```java
    stream.onEvent("jdk.ThreadStart", event -> {
        System.out.println("Thread started: " + event.getThread().getJavaName());
    });
    ```

3. **启动事件流**：启动事件流以开始接收事件。

    ```java
    stream.start();
    ```

4. **关闭事件流**：在不需要时关闭事件流。

    ```java
    stream.close();
    ```

### 示例：

```java
import jdk.jfr.consumer.EventStream;

public class JfrEventStreamExample {
    public static void main(String[] args) {
        try (EventStream stream = EventStream.getEventStream()) {
            stream.onEvent("jdk.ThreadStart", event -> {
                System.out.println("Thread started: " + event.getThread().getJavaName());
            });

            stream.start();
            Thread.sleep(10000); // Sleep for 10 seconds
        } catch (InterruptedException e) {
            e.printStackTrace();
        }
    }
}
```

这个示例创建了一个简单的事件流订阅，监听线程启动事件，并在控制台上输出线程的名称。

### 总结：

JEP 349 的 JFR 事件流为 Java 开发者提供了一个强大的工具，用于以编程方式访问和处理 Java Flight Recorder 生成的事件数据。

这一特性增强了 Java 诊断和性能监控的能力，使得开发者可以更灵活地分析和优化他们的应用程序。

# jdk14 非易失性映射字节缓冲区（JEP 352）

JEP 352 引入了 JDK 14 中的非易失性映射字节缓冲区（Non-Volatile Mapped Byte Buffers），这是 Java NIO（New I/O）库的一个新特性，旨在支持对持久性内存（如 Intel Optane DC Persistent Memory）的更有效利用。

### 非易失性映射字节缓冲区简介

传统的 Java 映射字节缓冲区（MappedByteBuffer）是对文件或其他数据源的内存映射，通常存储在 RAM 中。

而非易失性映射字节缓冲区允许数据被持久化到非易失性存储介质，如持久性内存或特殊的 SSD。

### 主要特性：

1. **持久化存储**：数据在写入非易失性映射字节缓冲区后，即使在系统重启或应用程序退出后，数据仍然保持持久化。

2. **低延迟写入**：与传统的 I/O 操作相比，非易失性映射字节缓冲区提供了更低的写入延迟。

3. **高吞吐量**：由于数据可以直接从应用程序的内存缓冲区写入非易失性存储，因此可以实现更高的写入吞吐量。

4. **与 NIO 兼容**：非易失性映射字节缓冲区与 Java NIO 库完全兼容，可以与现有的 NIO API 无缝集成。

### 使用非易失性映射字节缓冲区：

以下是一个简单的示例，展示如何使用非易失性映射字节缓冲区：

```java
import java.nio.MappedByteBuffer;
import java.nio.channels.FileChannel;
import java.nio.file.Paths;
import java.nio.file.StandardOpenOption;

public class NonVolatileMappedByteBufferExample {
    public static void main(String[] args) {
        try (FileChannel channel = FileChannel.open(Paths.get("data.txt"),
                StandardOpenOption.READ, StandardOpenOption.WRITE, StandardOpenOption.CREATE)) {

            MappedByteBuffer buffer = channel.map(FileChannel.MapMode.READ_WRITE, 0, 1024);
            
            // 写入数据到映射的缓冲区
            buffer.put("Hello, World!".getBytes());
            
            // 刷新缓冲区，确保数据持久化到磁盘
            buffer.force();

        } catch (Exception e) {
            e.printStackTrace();
        }
    }
}
```

在这个示例中，我们打开一个文件通道，并创建一个非易失性映射字节缓冲区。然后，我们将数据写入缓冲区，并使用 `force()` 方法刷新缓冲区，以确保数据被持久化到磁盘。

### 注意事项：

- **适用性**：非易失性映射字节缓冲区主要用于需要持久化数据的应用场景，如数据库、缓存和日志记录等。

- **兼容性**：确保你的硬件和操作系统支持持久性内存，以便利用非易失性映射字节缓冲区的优势。

- **数据一致性**：由于数据是异步写入的，因此在数据持久化到磁盘之前，可能存在一定的数据不一致性风险。

总的来说，JEP 352 的非易失性映射字节缓冲区为 Java NIO 提供了一个重要的新特性，允许 Java 应用程序更有效地利用持久性内存和其他非易失性存储介质，以实现更高的性能和可靠性。

# jdk14 文本块（JEP 368）

JEP 368 引入了 JDK 14 中的文本块（Text Blocks）特性，这是一个旨在提高多行字符串的可读性和可维护性的语言改进。通过文本块，Java 开发者可以更容易地编写和阅读多行字符串，而无需使用传统的字符串连接操作符（`+`）或多行字符串字面量（`\n`）。

### 文本块简介

文本块是一种新的字符串字面量，它使用三个双引号 `"""` 包围，允许开发者在其中包含多行文本，同时保持代码的可读性。

### 主要特性：

1. **可读性**：文本块提供了一种清晰、直观的方式来编写多行字符串，使得代码更易于理解和维护。

2. **格式化**：文本块允许开发者在代码中保留原始的文本格式，包括缩进、空格和换行符。

3. **无需转义**：与传统的字符串字面量不同，文本块中的特殊字符和转义序列（如 `\n`、`\t` 等）不再需要转义。

### 使用文本块：

以下是使用文本块的基本示例：

```java
String html = """
              <html>
                  <body>
                      <p>Hello, Java 14!</p>
                  </body>
              </html>
              """;
```

在这个示例中，我们使用文本块创建了一个包含 HTML 内容的字符串，而无需使用传统的字符串连接或转义。

### 与传统字符串字面量的比较：

```java
// 使用传统的字符串连接
String htmlConcatenated = "<html>" +
                           "    <body>" +
                           "        <p>Hello, Java 14!</p>" +
                           "    </body>" +
                           "</html>";

// 使用文本块
String htmlBlock = """
                   <html>
                       <body>
                           <p>Hello, Java 14!</p>
                       </body>
                   </html>
                   """;
```

如上所示，使用文本块可以大大简化包含多行文本的字符串的编写，使得代码更加清晰和易读。

### 注意事项：

- **空白字符**：文本块会保留文本中的所有空白字符，包括缩进和换行符。这意味着如果你不小心添加了额外的空格或换行符，可能会影响生成的字符串内容。

- **尾随空白**：由于文本块会保留每一行的结尾空白，因此可能需要使用 `trim()` 方法或其他字符串处理方法来移除不需要的空白字符。

总的来说，JEP 368 的文本块特性为 Java 提供了一种更简洁、更易读的方式来处理多行字符串，这对于需要嵌入大量文本（如 HTML、SQL 或 JSON）的应用程序特别有用。这一改进不仅提高了代码的可读性和可维护性，而且还减少了编写和维护多行字符串时的复杂性。

# jdk14 弃用 Solaris 和 SPARC 端口（JEP 362）

JEP 362 引入了 JDK 14 中对 Solaris 和 SPARC 端口的弃用。这一决策是基于现实世界中的硬件和操作系统的变化，使得这些平台在 Java 开发者社区中的使用逐渐减少。

### 背景：

- **Solaris**：Solaris 是由 Sun Microsystems 开发的 Unix 操作系统，后来被 Oracle Corporation 收购。尽管 Solaris 曾经是主流的企业级 Unix 系统，但其市场份额在过去几年中已经大幅下降。

- **SPARC**：SPARC（Scalable Processor Architecture）是由 Sun Microsystems 开发的 RISC 指令集架构，用于生产 SPARC 微处理器。与 Solaris 一样，SPARC 处理器的市场份额也在逐年减少。

### 主要原因：

1. **市场趋势**：随着企业对云计算和其他现代平台的依赖增加，Solaris 和 SPARC 硬件的需求逐渐减少。

2. **维护成本**：维护 Solaris 和 SPARC 的支持需要专门的资源和努力，这对于 Oracle 来说可能不再具有经济效益。

3. **技术演进**：现代硬件和操作系统提供了更好的性能、可靠性和安全性，使得 Solaris 和 SPARC 在技术上已经不再具有竞争力。

### 弃用行为：

1. **不再推荐使用**：JDK 14 开始，Oracle 不再推荐开发者在 Solaris 和 SPARC 平台上使用 JDK。

2. **警告信息**：在 JDK 14 中，如果在 Solaris 或 SPARC 平台上尝试运行 Java 应用程序，将会收到一个警告信息，提示用户该平台已被弃用。

### 后续计划：

- **完全移除**：未来的 JDK 版本可能会完全移除 Solaris 和 SPARC 的支持。

- **迁移建议**：Oracle 可能会提供迁移指南和建议，帮助使用这些平台的开发者平滑过渡到其他支持的平台。

### 结论：

JEP 362 的目的是清晰地表达 Oracle 的未来计划，并鼓励开发者在可能的情况下考虑迁移到更现代、更受支持的硬件和操作系统平台。

尽管 Solaris 和 SPARC 在过去曾经是主流选择，但随着技术的演进和市场趋势的变化，这些平台的重要性已经在逐渐减少。

因此，对于仍在使用 Solaris 和 SPARC 的开发者来说，考虑迁移到其他平台是一个值得考虑的长期策略。

# jdk14 删除 CMS 垃圾回收器（JEP 363）

JEP 363 引入了 JDK 14 中对 CMS（Concurrent Mark Sweep）垃圾回收器的删除。这一决策是基于 CMS 垃圾回收器在现代 Java 虚拟机中的边缘地位以及它与更现代和高效的垃圾回收器（如 G1 和 ZGC）的相对比较。

### 背景：

- **CMS 垃圾回收器**：CMS 是一个以低延迟为目标的垃圾回收器，设计用于减少应用程序暂停时间。尽管 CMS 在一些特定的应用场景中表现得很好，但它在处理大内存堆和碎片化问题方面可能会遇到挑战。

- **现代垃圾回收器**：与 CMS 相比，G1（Garbage-First）和 ZGC（Z Garbage Collector）等现代垃圾回收器提供了更高的吞吐量、更低的延迟以及更好的内存管理能力。

### 主要原因：

1. **性能和稳定性**：现代垃圾回收器在多数情况下都优于 CMS，提供更好的整体性能和稳定性。

2. **简化维护**：移除 CMS 可以简化 JVM 的维护和开发过程，减少了代码复杂性和潜在的错误源。

3. **专注资源**：集中开发资源和精力于更有前景和现代化的垃圾回收器，有助于进一步提升 JVM 的整体性能和功能。

### 弃用行为：

1. **不再推荐使用**：JDK 14 开始，Oracle 不再推荐开发者在 CMS 垃圾回收器上运行生产环境的应用程序。

2. **警告信息**：在 JDK 14 中，如果尝试使用 CMS 垃圾回收器，将会收到一个警告信息，提示用户该回收器已被删除。

### 后续计划：

- **替代方案**：对于仍在使用 CMS 的开发者，推荐迁移到 G1 或 ZGC 等现代垃圾回收器。

- **迁移指南**：Oracle 可能会提供迁移指南和建议，帮助开发者顺利地从 CMS 切换到其他回收器。

### 结论：

JEP 363 的目的是清晰地表达 Oracle 的未来计划，并鼓励开发者在可能的情况下考虑迁移到更现代和高效的垃圾回收器。

尽管 CMS 在过去对于某些特定的应用场景是有益的，但它在现代 JVM 中的重要性已经逐渐降低。

因此，对于仍在使用 CMS 的开发者来说，考虑迁移到现代垃圾回收器是一个明智的选择，以确保应用程序的性能和稳定性。

# jdk14 ZGC 的 macOS 和 Windows 支持（JEP 364 和 JEP 365）

JDK 14 引入了对 ZGC（Z Garbage Collector）在 macOS 和 Windows 平台的支持，这两项工作分别由 JEP 364 和 JEP 365 负责。以下是对这两项 JEP 的详细介绍：

### JEP 364: ZGC on macOS (Experimental)

1. **目标**：JEP 364 的目标是在 macOS 上提供 ZGC 支持，使其成为实验性特性。

2. **ZGC 简介**：ZGC 是一种低延迟、可扩展的垃圾回收器，专为大堆内存和低暂停时间设计。

3. **macOS 支持**：在 JDK 14 之前，ZGC 主要支持 Linux 平台。通过 JEP 364，macOS 实现了对 ZGC 的支持，使得 macOS 用户也能利用这一高效的垃圾回收器。

4. **实验性特性**：尽管 ZGC 在 macOS 上得到支持，但它被标记为实验性特性，意味着可能在未来版本中会有所变化或改进。

5. **多映射内存支持**：ZGC 在 macOS 上的设计利用了多映射内存技术，这是其核心机制之一，允许在不同的虚拟地址空间中映射同一块物理内存。

### JEP 365: ZGC on Windows (Experimental)

1. **目标**：JEP 365 的目标是在 Windows 平台上提供 ZGC 支持，同样作为实验性特性。

2. **Windows 平台支持**：通过 JEP 365，ZGC 被扩展到了 Windows 平台，增加了 ZGC 在更多操作系统上的可用性。

3. **性能测试**：在引入 Windows 支持后，ZGC 在 Windows 平台的性能表现也得到了测试和验证，以确保其低延迟特性得到保持。

4. **实验性标记**：与 macOS 支持一样，Windows 上的 ZGC 支持也是实验性的，开发者在生产环境中使用时需要谨慎。

5. **跨平台一致性**：JEP 365 的实现使得 ZGC 在 Linux、macOS 和 Windows 平台上都得到了支持，增加了其跨平台的一致性和可用性。

### 通用特性

- **64位系统支持**：ZGC 仅支持 64位系统，因为它需要利用大量的内存地址空间来实现其高效的垃圾回收策略。
  
- **内存管理**：ZGC 通过使用不同的地址空间（如 M0、M1 和 Remapped）来管理对象的内存，这些空间在同一时间只有一个是有效的，这是 ZGC 实现低延迟的关键技术之一。

- **调优参数**：ZGC 提供了一系列调优参数，如 `-XX:ZAllocationSpikeTolerance`、`-XX:ZCollectionInterval` 等，允许开发者根据应用的特定需求调整垃圾回收行为。

- **日志记录**：ZGC 支持详细的 GC 日志记录，通过 `-Xlog` 参数可以配置日志的详细程度和输出格式，这对于性能分析和调优非常有用。

通过 JEP 364 和 JEP 365，JDK 14 扩展了 ZGC 的平台支持范围，使得在 macOS 和 Windows 上也能体验到 ZGC 带来的低延迟垃圾回收优势。尽管这些支持在 JDK 14 中还是实验性的，但它们为未来的稳定支持和进一步优化奠定了基础。

### 如何使用

启用 ZGC 只需在启动 Java 应用程序时添加 -XX:+UseZGC 参数即可，例如：

```sh
java -XX:+UseZGC -jar myapp.jar
```

注意：虽然 ZGC 在 macOS 和 Windows 上都可用，但在某些情况下，可能仍需要进行特定的配置或调整以达到最佳性能和稳定性。

# jdk14 废弃 ParallelScavenge + SerialOld 的 GC 组合（JEP 366）

JEP 366 引入了 JDK 14 中废弃 ParallelScavenge + SerialOld（PS + SO）垃圾回收组合的决策。这一决策是基于这种组合在现代 Java 应用程序中的使用情况和性能表现相对较差。

### 背景

- **ParallelScavenge（PS）**：ParallelScavenge 是一个以吞吐量为目标的垃圾回收器，适用于需要最大化吞吐量的大规模数据处理应用。

- **SerialOld（SO）**：SerialOld 是一个单线程、单区域的老年代垃圾回收器，与 ParallelScavenge 结合使用时，它用于处理老年代对象。

### 主要原因

1. **性能问题**：PS + SO 组合在大多数场景中可能不如其他更现代的垃圾回收器组合（如 G1、ZGC 或 Shenandoah）提供的性能和稳定性。

2. **简化维护**：废弃不常用的垃圾回收器组合可以简化 JVM 的维护和开发过程，减少代码复杂性和潜在的错误源。

3. **推动创新**：集中资源和精力于更有前景的垃圾回收器，有助于进一步推动 JVM 技术的创新和发展。

### 废弃行为

1. **不再推荐使用**：JDK 14 开始，Oracle 不再推荐开发者在生产环境中使用 PS + SO 垃圾回收组合。

2. **警告信息**：如果尝试使用 PS + SO 组合，将会收到一个警告信息，提示用户该组合已被废弃。

### 后续计划

- **替代方案**：对于仍在使用 PS + SO 的开发者，推荐考虑迁移到其他更现代和高效的垃圾回收器组合。

- **迁移指南**：Oracle 可能会提供迁移指南和建议，帮助开发者顺利地从 PS + SO 切换到其他回收器组合。

### 结论

JEP 366 的目的是为了提醒开发者关于 PS + SO 垃圾回收组合的废弃状态，并鼓励他们考虑使用更现代和高效的垃圾回收器。

尽管 PS + SO 在某些特定场景中可能仍有其用途，但考虑到其在整体性能和稳定性方面的局限性，迁移到更先进的垃圾回收器组合是一个明智的选择，以确保应用程序的最佳性能和稳定性。

# jdk14 删除 Pack200 工具和 API（JEP 367）

JEP 367 引入了 JDK 14 中删除 Pack200 工具和 API 的决策。Pack200 是一个用于 Java JAR 文件压缩和优化的工具，它可以显著减小 JAR 文件的大小，从而加速应用程序的下载和部署。

### 背景

- **Pack200 工具**：Pack200 是一个用于 JAR 文件压缩的工具，它可以将 JAR 文件压缩为更小的 Pack200 格式，这有助于减少下载时间和网络带宽使用。

- **Pack200 API**：除了工具本身，Java 也提供了 Pack200 API，允许开发者在程序中直接使用 Pack200 压缩和解压缩功能。

### 主要原因

1. **使用率低**：Pack200 的使用率相对较低，许多现代的构建和部署工具提供了更有效的压缩和优化选项。

2. **简化维护**：删除不常用的组件可以简化 JDK 的维护和开发过程，减少代码复杂性和潜在的错误源。

3. **推动创新**：通过删除过时和不常用的组件，可以为新技术和功能腾出空间，进一步推动 JDK 的创新和发展。

### 删除行为

1. **不再包含在 JDK 中**：JDK 14 开始，Pack200 工具和 API 将不再包含在 JDK 发行版中。

2. **警告信息**：如果尝试使用 Pack200 工具或 API，将会收到一个警告信息，提示用户该组件已被删除。

### 后续计划

- **替代方案**：对于仍在使用 Pack200 的开发者，建议考虑使用其他现代的压缩和优化工具或技术。

- **迁移指南**：Oracle 可能会提供迁移指南和建议，帮助开发者平滑地从 Pack200 迁移到其他替代方案。

### 结论

JEP 367 的目的是为了清晰地表达 Oracle 对 Pack200 工具和 API 的未来计划，并鼓励开发者考虑使用更现代和高效的压缩和优化解决方案。

尽管 Pack200 曾经是 Java 部署过程中的一个有用工具，但由于现代工具和技术的发展，它的重要性和使用率已经逐渐降低。

因此，对于仍在使用 Pack200 的开发者来说，考虑迁移到更先进的压缩和优化解决方案是一个明智的选择，以确保应用程序的最佳性能和效率。

# jdk14 外部内存访问 API（JEP 370）

JEP 370 引入了 JDK 14 中的外部内存访问 API。这一特性旨在提供一种方式，让 Java 程序能够直接与外部内存进行交互，而无需通过 Java 堆内存。这可以提高性能，特别是在处理大量数据时，同时也为开发者提供了更灵活的内存管理选项。

### 外部内存访问 API 简介

外部内存通常指的是位于 JVM 堆外的内存，例如直接内存（通过 `ByteBuffer.allocateDirect()` 创建）。外部内存通常由操作系统管理，并且对于某些应用场景（如大数据处理、网络数据传输等）具有重要意义。

### 主要特性：

1. **直接内存访问**：提供了一种直接从 Java 程序访问外部内存的方式，无需复制数据到 Java 堆内存。

2. **性能优化**：通过避免不必要的数据复制和 GC（垃圾回收）活动，可以提高数据处理和内存管理的性能。

3. **灵活性**：开发者可以更精细地控制内存分配、使用和释放，以满足特定应用程序的需求。

### 使用外部内存访问 API

以下是使用外部内存访问 API 的基本步骤：

1. **创建外部内存区域**：使用 `MemorySegment` 类创建外部内存段。

    ```java
    MemorySegment segment = MemorySegment.allocateNative(1024);  // 分配1KB外部内存
    ```

2. **访问外部内存**：使用 `MemoryAccess` 类提供的方法读写外部内存。

    ```java
    MemoryAccess.putInt(segment, 0, 123);  // 在偏移量0写入整数123
    int value = MemoryAccess.getInt(segment, 0);  // 从偏移量0读取整数
    ```

3. **释放外部内存**：使用 `MemorySegment` 的 `close()` 方法释放外部内存。

    ```java
    segment.close();
    ```

### 注意事项

- **内存安全性**：由于外部内存没有受到 Java 堆内存管理的保护，因此需要开发者自行确保内存的正确和安全使用。

- **资源管理**：使用外部内存后，必须确保适当地释放资源，避免内存泄漏。

### 结论

JEP 370 的外部内存访问 API 为 Java 开发者提供了一种直接和高效地与外部内存交互的方式。

这一特性不仅可以显著提高数据处理性能，而且还为开发者提供了更灵活和细粒度的内存管理选项。

尽管使用外部内存需要开发者具备额外的内存管理知识和技能，但对于需要最大化性能和资源利用率的应用场景，这是一个非常有价值的补充。

# jdk14 改进的 NullPointerExceptions（JEP 358）

JEP 358 引入了 JDK 14 中对 NullPointerException（NPE）错误消息的改进。这一改进旨在提供更明确、更有用的错误消息，以帮助开发者更容易地诊断和修复空指针异常。

### 背景

NullPointerException 是 Java 编程中常见的运行时异常，经常发生在尝试访问 null 对象的方法或字段时。尽管这个异常在 Java 开发中是非常常见的，但通常提供的错误消息很少包含有关导致异常的具体原因的信息，这可能导致诊断问题变得更加困难。

### 改进内容

1. **详细错误信息**：改进后的 NullPointerException 错误消息现在将包含有关试图访问 null 引用的具体位置的信息，例如类名、方法名和行号。

    例如，以前可能看到的错误消息：
    ```
    Exception in thread "main" java.lang.NullPointerException
        at MyClass.myMethod(MyClass.java:10)
    ```

    改进后的错误消息可能如下：
    ```
    Exception in thread "main" java.lang.NullPointerException: Cannot invoke "String.length()" because the return value of "MyClass.myMethod()" is null
        at MyClass.myMethod(MyClass.java:10)
    ```

    在这个示例中，新的错误消息提供了更多关于问题所在的上下文信息，特别是在哪里和为什么出现了 null 值。

2. **更易于诊断**：通过提供更多的上下文信息，开发者可以更容易地定位和修复导致 NullPointerException 的问题。

3. **提高开发效率**：明确的错误消息有助于减少调试时间和提高开发效率，特别是在处理复杂的代码和大型代码库时。

### 使用示例

考虑以下示例代码：

```java
public class Example {
    public static void main(String[] args) {
        String text = null;
        int length = text.length(); // NullPointerException
    }
}
```

在 JDK 14 之前，错误消息可能只会告诉你出现了 NullPointerException，而不提供更多的上下文信息。

在 JDK 14 及之后的版本中，错误消息会更明确，帮助你更快地找到问题所在：

```
Exception in thread "main" java.lang.NullPointerException: Cannot invoke "String.length()" because "text" is null
    at Example.main(Example.java:4)
```

### 结论

JEP 358 的改进为开发者提供了更加明确和有用的 NullPointerException 错误消息，这有助于更快地诊断和修复代码中的问题。

通过提供更多的上下文信息，开发者现在可以更容易地确定 null 值是从哪里引入的，以及如何修复相关的代码问题。

这一改进不仅提高了 Java 开发的效率，而且还增强了代码质量和可维护性。

# jdk14 记录类型（JEP 359）

JEP 359 引入了 JDK 14 中的记录类型（Records）。

记录类型是一种新的语言特性，旨在简化不可变数据聚合的创建和管理。

通过使用记录类型，开发者可以更容易地定义和使用简单的数据传输对象（DTOs）和值对象，从而提高代码的清晰度、可读性和可维护性。

### 记录类型简介

记录类型是一种不可变的、透明的、编译时 final 类型，它提供了一种紧凑和直观的方式来定义类似于数据的类。

与传统的类相比，记录类型自动为其属性生成合适的构造函数、访问器方法、`equals()`、`hashCode()` 和 `toString()` 方法。

### 主要特点

1. **简化声明**：通过使用 `record` 关键字，可以更简洁地声明一个记录类型。

    ```java
    public record Point(int x, int y) {}
    ```

2. **自动生成方法**：记录类型自动生成以下方法：

    - 构造函数：用于初始化记录类型的属性。
    - 访问器方法：用于获取记录类型的属性。
    - `equals()` 和 `hashCode()`：基于记录类型的属性生成的方法，用于对象比较。
    - `toString()`：生成一个描述性的字符串表示，包含记录类型的属性。

3. **不可变性**：记录类型是不可变的，确保其实例的属性在创建后不能被修改。

### 使用记录类型

以下是使用记录类型的基本示例：

```java
public record Point(int x, int y) {}

public class RecordExample {
    public static void main(String[] args) {
        Point p1 = new Point(10, 20);
        Point p2 = new Point(10, 20);

        System.out.println(p1);         // Output: Point[x=10, y=20]
        System.out.println(p1.equals(p2)); // Output: true
        System.out.println(p1.x());     // Output: 10
        System.out.println(p1.y());     // Output: 20
    }
}
```

### 注意事项

- **不可变性**：由于记录类型是不可变的，因此其属性在创建后不能被修改。如果需要更改记录类型的属性值，必须创建一个新的记录实例。

- **扩展性**：记录类型是 `final` 的，不能被继承。如果需要添加新的行为或属性，可能需要使用传统的类来替代。

### 结论

JEP 359 的记录类型为 Java 引入了一个简洁而强大的新特性，使得定义和使用简单的数据聚合变得更加容易和直观。

通过自动生成常见的方法和确保不可变性，记录类型提供了一种简化数据模型的有效方式。

对于那些需要频繁创建和使用数据对象的应用程序，记录类型无疑是一个非常有价值的补充，可以显著提高代码的清晰度和可维护性。

# jdk14 Switch 表达式（JEP 361）

JDK 14 引入了 JEP 361：Switch 表达式（Standard），这是对之前在 JDK 12 和 JDK 13 中作为预览特性引入的 Switch 表达式的最终确定版。

以下是 JDK 14 中 Switch 表达式（JEP 361）的详细介绍：

1. **从预览到标准**：Switch 表达式在 JDK 12 中作为预览特性引入（JEP 325），随后在 JDK 13 中继续作为预览特性（JEP 354），最终在 JDK 14 中成为正式的标准特性。

2. **语法改进**：Switch 表达式允许更简洁的语法，不再需要显式的 `break` 语句来防止代码块间的贯穿（fall-through）。使用 `case L ->` 语法，可以指定当 `case` 匹配时只执行箭头后的代码块。

3. **多常量匹配**：允许在单个 `case` 中匹配多个常量，用逗号分隔，这使得代码更加简洁。

4. **表达式和语句**：Switch 现在既可以作为语句也可以作为表达式使用。作为表达式时，可以直接将结果赋值给变量。

5. **yield 关键字**：引入了 `yield` 关键字，用于从一个 `switch` 表达式中返回一个值。

6. **模式匹配准备**：Switch 表达式的改进为将来引入模式匹配（如 JEP 305）提供了基础。

7. **控制流改进**：Switch 表达式改进了控制流，使得开发者可以更自然地表达多路选择逻辑。

8. **简化日常编码**：Switch 表达式的这些变化简化了日常编码工作，减少了出错的可能性。

9. **风险和假设**：JEP 361 考虑了引入 `case L ->` 标签的必要性，并认为通过将具有副作用但通常仍然是“一个标签一个动作”的 switch 语句纳入新式标签，可以使语句更直接、更少出错。

10. **历史背景**：JEP 361 的提出是为了解决 Java switch 语句长期以来的问题，如 fall-through 行为、switch 块中的默认作用域以及 switch 仅作为语句使用的限制。

11. **OpenJDK 社区反馈**：在 JDK 12 和 JDK 13 的预览阶段，社区对 Switch 表达式的反馈促成了它的改进和最终确定。

12. **官方文档**：JEP 361 的官方文档提供了关于 Switch 表达式如何工作的详细信息，包括语法和示例代码。

通过这些改进，JDK 14 的 Switch 表达式提供了一种更现代、更强大的方式，来处理多条件分支逻辑，同时为将来可能的语言特性（如模式匹配）奠定了基础。

# 总结一下 jdk14 的变化

JDK 14 作为 Java 语言和平台的一次更新，带来了一系列新特性、改进和弃用声明，以下是 JDK 14 的主要变化总结：

1. **文本块（JEP 368）**：作为第二次预览版，文本块改进了多行字符串的处理，提供了更清晰的代码格式。

2. **Switch 表达式（JEP 361）**：在 JDK 14 中，Switch 表达式成为正式特性，允许更灵活和更简洁的代码编写方式。

3. **打包工具（JEP 343）**：引入了 `jpackage` 工具，帮助开发者打包 Java 应用程序，支持多种平台特定的包格式。

4. **JFR 事件流（JEP 349）**：允许应用程序在运行时以流的形式访问 Java Flight Recorder 事件。

5. **弃用 Solaris 和 SPARC 端口（JEP 362）**：Oracle 宣布弃用 Solaris/SPARC、Solaris/x64 和 Linux/SPARC 端口。

6. **删除 CMS 垃圾回收器（JEP 363）**：由于性能和维护成本的考虑，CMS 垃圾回收器在 JDK 14 中被移除。

7. **废弃 ParallelScavenge + SerialOld 的 GC 组合（JEP 366）**：推荐使用并行 GC 算法代替这一组合。

8. **删除 Pack200 工具和 API（JEP 367）**：随着时间的推移和技术的发展，Pack200 工具和 API 被移除。

9. **外部内存访问 API（JEP 370）**：作为孵化特性，提供了一种安全、高效的方式来访问 Java 堆之外的外部内存。

10. **改进的 NullPointerExceptions（JEP 358）**：增强了空指针异常的信息，帮助开发者更快定位问题。

11. **ZGC 的 macOS 和 Windows 支持（JEP 364 和 JEP 365）**：将 Z Garbage Collector 移植到 macOS 和 Windows 平台，增加了其跨平台的一致性和可用性。

12. **记录类型（JEP 359）**：作为第二次预览版，记录类型提供了一种新的类，用于不可变数据的封装。

这些变化体现了 JDK 14 在性能、安全性、易用性和现代化方面的持续进步。开发者应当关注这些变化，以确保他们的应用程序能够利用 JDK 14 引入的新特性和改进。

同时，对于预览特性和实验性特性，开发者应在生产环境中谨慎使用，并进行充分的测试。

* any list
{:toc}