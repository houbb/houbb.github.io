---
layout: post
title: java 变更日志-13-jdk13
date:  2017-06-28 23:15:43 +0800
categories: [Java]
tags: [jdk, java]
published: true
---

# 拓展阅读

[Java Functional java 函数式编程](https://houbb.github.io/2017/06/29/java-functional)

[Java Lambda](https://houbb.github.io/2017/06/28/java-lambda)

# jdk13 有哪些新特性

JDK 13 引入了一系列新特性和改进，以下是一些主要的新特性：

1. **Switch 表达式（JEP 354）**：扩展了 switch 语句，允许它作为表达式使用，并使用箭头语法 -> 来简化代码。

2. **文本块（JEP 355）**：允许字符串跨越多行，无需转义，提高了代码的可读性，特别是在处理 HTML、XML、SQL 或 JSON 等格式化字符串时。

3. **Dynamic CDS Archives（JEP 350）**：允许在 Java 应用程序执行结束后动态归档类，这可以提高应用程序的启动速度并优化内存占用。

4. **ZGC 增强（JEP 352）**：改进了 Z Garbage Collector（ZGC），增加了将未使用的堆内存返回给操作系统的功能。

5. **重新实现旧版 Socket API（JEP 356）**：用新的实现替换了 Java 1.0 时代的 Socket API，提高了性能和可靠性。

6. **其他 API 更新**：包括但不限于对 FileSystems 类的更新，增加了新的方法来简化文件系统操作，以及对垃圾回收器的改进等。

7. **预览特性**：JDK 13 还包含了一些预览特性，如文本块和 switch 表达式，它们可能会在未来的版本中进一步完善。

8. **JDK 13 发布周期**：JDK 13 是 Java 每半年发布周期的一部分，它不是长期支持（LTS）版本，因此企业用户可能会选择等待下一个 LTS 版本。

这些新特性和改进旨在提高 Java 开发人员的生产力，同时提升 Java 平台的性能和稳定性。

# jdk13 Switch 表达式（JEP 354）

JDK 13 中的 Switch 表达式（JEP 354）是对 Java 12 中引入的 Switch 表达式的增强，它允许 switch 不仅可以用作语句，还可以作为表达式使用，并且引入了新的语法特性来简化代码编写。

以下是 JDK 13 中 Switch 表达式的一些关键特性：

1. **箭头标签（Arrow Labels）**：Switch 表达式使用箭头（`->`）来代替传统的冒号（`:`），以明确表示紧跟在 case 后面的代码块或表达式是该 case 的结果。

2. **yield 关键字**：在 switch 表达式中，使用 `yield` 关键字来从一个 case 块中返回一个值。这与 `break` 语句不同，`break` 用于跳出 switch 语句，而 `yield` 仅用于返回 switch 表达式的值。

3. **穷尽性（Exhaustiveness）**：Switch 表达式必须穷尽所有可能的值，这意味着通常需要一个 `default` 语句。对于枚举类型，如果所有可能的值都已经被覆盖，则编译器会自动生成一个 `default` 语句。

4. **模式匹配（Pattern Matching）**：虽然 JEP 354 本身不直接引入模式匹配，但它为将来可能加入的模式匹配特性（如 JEP 305）提供了基础。

5. **表达式和语句的区分**：Switch 表达式和 switch 语句在使用上有一些区别。例如，switch 表达式不能作为 `break` 语句的目标，而 `yield` 语句只能用于 switch 表达式中。

6. **简化的语法**：Switch 表达式允许更简洁的语法，可以减少代码量并提高可读性。

7. **块和表达式的限制**：在 switch 表达式中，每个 case 后面跟的代码块或表达式必须能够产生一个值或者抛出异常。

8. **预览特性**：Switch 表达式在 JDK 12 中作为预览特性引入，在 JDK 13 中继续作为预览特性，这意味着它可能在未来的 JDK 版本中有所变化。

9. **实际使用示例**：在 JDK 13 中，你可以像下面这样使用 Switch 表达式：

```java
public static String getSeason(String month) {
    return switch (month.toLowerCase()) {
        case "march", "april", "may" -> "春天";
        case "june", "july", "august" -> "夏天";
        case "september", "october", "november" -> "秋天";
        case "december", "january", "february" -> "冬天";
        default -> "无效的月份";
    };
}
```

在这里，`->` 箭头用于指向每个 case 的结果，而 `default` 提供了一个通用的返回值。

JEP 354 的引入，为 Java 开发者提供了一种新的处理条件逻辑的方式，使得 switch 语句的使用更加灵活和功能丰富。

尽管它目前仍然是预览特性，但已经可以在 JDK 13 中尝试使用，以期待在未来的 JDK 版本中成为正式功能。

# jdk13 文本块（JEP 355）

JDK 13 中的文本块（Text Blocks，JEP 355）是一项预览特性，旨在简化在 Java 程序中编写多行字符串的过程。传统上，Java 中的字符串必须用双引号括起来，这使得直接在字符串中使用多行文本变得困难。为了实现多行字符串，开发者不得不依赖于换行符转义（如 `\n`）或行连接符，这不仅增加了编辑工作量，而且使得代码段难以阅读和维护。

文本块通过使用三个双引号（`"""`）来定义字符串的开始和结束，允许字符串跨越多行，而无需使用转义字符。在这两个标志之间的所有文本，包括换行符和空格，都将被包含在字符串中。

以下是 JDK 13 中文本块的一些关键特性：

1. **多行字符串**：文本块允许开发者在不使用转义字符的情况下，直接定义多行字符串。

2. **保持格式**：文本块保持了字符串中的格式，包括空格和换行符，这使得处理格式化文本（如 HTML、XML、JSON）变得更容易。

3. **语法简洁**：文本块的引入减少了编写和维护多行字符串所需的代码量，提高了代码的可读性。

4. **字符串插值**：文本块支持在字符串中插入表达式，这通过使用 `${expression}` 语法实现。

5. **预览特性**：尽管文本块在 JDK 13 中可用，但它是一项预览特性，这意味着它的语法和行为可能会在未来的 JDK 版本中发生变化。

6. **使用示例**：

```java
String html = """
    <html>
        <head>
            <title>示例</title>
        </head>
        <body>
            <p>这是一个示例段落。</p>
        </body>
    </html>
    """;
```

在这个例子中，`html` 变量包含了一个完整的 HTML 文档，它跨越了多行而无需转义字符。

7. **字符串插值示例**：

```java
String name = "World";
String greeting = """
    Hello, ${name}!
    How are you doing today?
    """;
```

在这个例子中，`${name}` 是一个字符串插值表达式，它将在文本块中被 `World` 替换。

文本块是 Java 语言发展中的一个重要补充，它使得处理多行字符串更加方便和直观。

尽管目前是预览特性，但开发者可以在 JDK 13 中尝试使用它，以便更好地适应未来可能的正式变更。

# jdk13 Dynamic CDS Archives（JEP 350）

JEP 350 引入了动态类数据共享档案（Dynamic Class-Data Sharing Archives）的支持，这是 JDK 13 中的一个优化特性，旨在减少 JVM 启动时间和内存占用。

### 什么是 CDS？

类数据共享（Class-Data Sharing，CDS）是一种用于提高 JVM 启动时间和减少内存占用的技术。它通过将 JVM 的核心类数据结构（如类元数据、字节码等）保存到共享档案中，然后在 JVM 启动时映射这些数据到内存中来实现。

### 动态 CDS 档案（Dynamic CDS Archives）

传统的 CDS 档案需要在运行时使用 ` -Xshare:dump` 选项预先生成，这在某些情况下可能不够灵活。动态 CDS 档案解决了这个问题，允许开发者在运行时动态地创建和使用 CDS 档案。

### 如何使用 Dynamic CDS Archives？

1. **生成动态 CDS 档案**

   使用 ` -XX:ArchiveClassesAtExit=<path_to_archive>` JVM 选项可以在 JVM 退出时生成动态 CDS 档案。

   ```bash
   java -XX:ArchiveClassesAtExit=myapp.jsa -cp myapp.jar MyApp
   ```

2. **使用动态 CDS 档案**

   使用 ` -XX:SharedArchiveFile=<path_to_archive>` JVM 选项可以指定使用哪个动态 CDS 档案。

   ```bash
   java -XX:SharedArchiveFile=myapp.jsa -cp myapp.jar MyApp
   ```

### 优势

- **减少启动时间**：由于预加载了核心类数据，JVM 启动时间得到显著缩短。
  
- **减少内存占用**：共享档案允许多个 JVM 实例共享同一份类数据，从而减少整体内存使用量。

### 注意事项

- **平台兼容性**：动态 CDS 档案可能受到平台或 JVM 版本的限制。

- **档案更新**：当应用程序更新时，可能需要重新生成动态 CDS 档案以反映新的类和代码变更。

- **性能影响**：虽然大多数应用程序都会受益于 CDS，但某些特定的应用程序或场景可能会有所不同。

总体而言，动态 CDS 档案是一个强大的工具，可以显著提高 Java 应用程序的性能和效率，特别是在需要快速启动和低内存占用的场景中。

# jdk13 ZGC 增强（JEP 352）

JEP 352 引入了对 Z Garbage Collector（ZGC）的增强，ZGC 是 JDK 中的一种低延迟垃圾回收器。在 JDK 11 中，ZGC 被引入作为一个实验性功能，而在 JDK 13 中，它进行了一系列的增强，提高了其稳定性和性能。

### ZGC 简介

ZGC 是为低延迟应用程序设计的，旨在处理大内存堆（数百 GB）的并发垃圾收集器。它的主要目标是减少 GC 停顿时间，从而使得大型内存应用程序能够在几毫秒内恢复正常操作。

### JDK 13 中的 ZGC 增强

1. **取消实验性标签**：在 JDK 13 中，ZGC 的实验性标签已被取消，表示其已经达到了生产就绪的稳定性。

2. **Concurrent Class Unloading**：增加了并发类卸载功能，这意味着无需停止应用程序就可以卸载未使用的类，从而进一步减少了垃圾收集停顿时间。

3. **并发线程引用处理**：改进了并发引用处理机制，使得应用程序在垃圾回收过程中能够继续运行，从而减少了应用程序的停顿时间。

4. **大型页支持**：在支持的平台上，ZGC 现在可以利用大型页面（例如 2MB 或 1GB 页面）来提高内存管理的效率。

5. **更好的 NUMA 支持**：提供了更好的非统一内存架构（NUMA）支持，特别是在多节点系统上。

6. **-XX:SoftMaxHeapSize Flag**：添加了 `-XX:SoftMaxHeapSize` 参数，该参数目前仅对 ZGC 有效，允许设置 Java 堆的软最大大小。

7. **ZGC 最大 heap 大小增加**：Z Garbage Collector (ZGC) 支持的最大 heap 大小增加到了 16TB，这使得 ZGC 能够更好地服务于需要处理大规模内存的应用程序。

### 如何使用 ZGC

要在 JDK 13 中使用 ZGC，你可以通过在启动时使用 `-XX:+UseZGC` 参数来启用它：

```bash
java -XX:+UseZGC -jar myapp.jar
```

### 总结

ZGC 是 JDK 提供的一个重要的垃圾回收器，特别适用于需要低延迟和高吞吐量的大内存应用程序。

在 JDK 13 中的增强进一步巩固了 ZGC 在生产环境中的地位，使其成为处理大型内存应用程序的首选垃圾回收解决方案之一。

# jdk13 重新实现旧版 Socket API（JEP 356）

JDK 13 引入了对旧版 Socket API 的重新实现，这一改进由 JEP 356 负责。

以下是关于 JDK 13 中重新实现旧版 Socket API 的详细介绍：

1. **历史背景**：Java 中的 `java.net.Socket` 和 `java.net.ServerSocket` API 及其实现类可以追溯到 JDK 1.0 时代。

随着时间的推移，这些老旧的实现在维护和调试上变得困难，并且存在一些并发问题。

2. **新实现的目标**：JEP 356 的目标是提供一个更简单、更现代的 Socket API 实现，它更易于维护，并且能够提供更好的性能和可靠性。

3. **NioSocketImpl**：在 JDK 13 中，引入了 `NioSocketImpl` 作为 `SocketImpl` 的新实现，用以替代老旧的 `PlainSocketImpl`。`NioSocketImpl` 与 NIO（New I/O）共享相同的 JDK 内部结构，这意味着它不需要使用系统本地代码，从而简化了维护工作。

4. **缓冲区和锁的改进**：新实现与现有的缓冲区高速缓存机制集成，不再需要为 I/O 操作使用线程栈。此外，它使用 `java.util.concurrent` 锁，代替了 `synchronized` 方法，这增强了 API 的并发能力。

5. **维护旧版本兼容性**：尽管引入了新的实现，JDK 13 仍然保留了旧的实现，以确保兼容性。开发者可以通过设置系统属性 `jdk.net.usePlainSocketImpl` 来选择使用旧版的 `PlainSocketImpl`。

6. **默认实现变更**：新的 `NioSocketImpl` 是 JDK 13 中的默认实现。这一变更意味着在没有明确指定使用旧实现的情况下，所有新的 Socket 和 ServerSocket 实例都将使用新的实现。

7. **调试和性能监控**：由于 `NioSocketImpl` 的引入，调试 Socket 相关的错误和性能问题变得更加容易。同时，新实现有望提供更好的性能，尤其是在高并发场景下。

8. **系统属性控制**：通过系统属性 `jdk.net.usePlainSocketImpl` 的设置，开发者可以控制是使用新的 `NioSocketImpl` 还是旧的 `PlainSocketImpl`。这为从旧实现向新实现迁移提供了灵活性。

9. **代码示例**：在 JDK 13 中，可以通过以下方式创建 Socket 实例，这将显示调试输出并使用默认的新实现：

```java
Socket socket = new Socket();
```

如果需要使用旧的实现，可以通过设置系统属性来实现：

```java
System.setProperty("jdk.net.usePlainSocketImpl", "true");
Socket socket = new Socket();
```

通过这些改进，JDK 13 的 Socket API 更加现代化，同时保留了向后兼容性，使得开发者可以根据需要选择最适合的实现。

这些变化有助于提升 Java 网络编程的整体体验。

# jdk13 Shenandoah GC 改进

JDK 13 中对 Shenandoah 垃圾收集器（GC）进行了一些改进，这些改进旨在提高性能和减少垃圾回收（GC）引起的应用停顿时间。

Shenandoah GC 的主要特点是它使用了一种并发标记-压缩（C2）算法，允许垃圾回收与应用程序线程并发执行，从而减少了 GC 停顿时间。

Shenandoah GC 是一种低延迟垃圾收集器，它的设计目标是最小化垃圾回收对用户代码造成的停顿。

以下是 JDK 13 中 Shenandoah GC 的一些主要改进：

1. **并发性增强**：Shenandoah 的核心特性之一是其并发性，它允许应用程序在 GC 运行的同时继续执行，从而减少了停顿时间。在 JDK 13 中，Shenandoah 进一步增强了其并发处理能力，提高了效率。

2. **改进的并发回收**：Shenandoah 通过并发标记和并发回收阶段减少了停顿时间。在 JDK 13 中，这些阶段的效率得到了提升，进一步减少了 GC 引起的延迟。

3. **Brooks指针**：Shenandoah 使用了 Brooks 指针技术来实现对象的并发重定位。这种技术允许在移动对象时，所有指向该对象的引用都被自动更新，而不需要停止应用程序的执行。JDK 13 中对 Brooks 指针的实现进行了优化。

4. **跨代处理**：Shenandoah 能够处理跨代对象引用，这是通过其连接矩阵实现的。JDK 13 可能对连接矩阵的处理进行了改进，以提高其准确性和效率。

5. **更好的停顿时间预测**：Shenandoah 在 JDK 13 中可能改进了对 GC 停顿时间的预测，这有助于更精确地调整 GC 参数，从而减少实际的停顿时间。

6. **适应性启发式**：Shenandoah 允许通过启发式参数来触发 GC，JDK 13 可能对这些启发式算法进行了调整，使其更适应不同的应用场景和工作负载。

7. **退化模式的改进**：当 Shenandoah 无法跟上垃圾生成速度时，它会进入退化模式，进行传统的 STW GC。JDK 13 可能对退化模式的处理进行了优化，减少了在这种情况下的停顿时间。

8. **性能调优**：JDK 13 可能提供了更好的工具和参数来调优 Shenandoah，使得开发者能够更精确地控制 GC 行为，以适应特定的应用需求。

9. **参考屏障的集成**：在 JDK 13 的开发中，Shenandoah 集成了加载引用屏障（Load reference barriers），这有助于更精确地追踪对象引用，从而提高 GC 的准确性。

10. **跨平台支持**：Shenandoah 继续扩展其跨平台支持，JDK 13 中可能包括了对更多操作系统的支持，如 Solaris。

请注意，具体的改进细节可能依赖于 JDK 13 的正式文档和发布说明。

上述信息基于搜索结果中提供的数据，并结合了 Shenandoah GC 的一般特性。开发者在迁移到 JDK 13 并使用 Shenandoah GC 时，应仔细阅读官方文档，以充分利用这些改进。

JDK 13 中对 Shenandoah 垃圾回收器（Garbage Collector，GC）进行了多项改进，以提高其性能、稳定性和可用性。Shenandoah 是一个旨在最小化 GC 停顿时间的垃圾回收器，特别适用于大内存堆和需要低延迟的应用程序。


### 如何使用 Shenandoah GC

要在 JDK 13 中使用 Shenandoah GC，你可以通过在启动时使用 `-XX:+UseShenandoahGC` JVM 选项来启用它：

```bash
java -XX:+UseShenandoahGC -jar myapp.jar
```

### 如何减少的？

Shenandoah GC 的设计理念是尽量减少 "Stop-the-World"（STW）停顿时间，但这并不意味着它完全不需要STW。

实际上，Shenandoah仍然会在某些关键点进行短暂的STW操作，例如在垃圾回收周期的初始标记阶段和最终标记阶段可能会有短暂的STW。

然而，Shenandoah的创新之处在于，它能够在大部分的垃圾回收阶段与应用程序并发运行，从而减少了总体的停顿时间。

为了保证数据的准确性，即使在并发阶段，Shenandoah 采用了一些先进的技术：

1. **Brooks指针**：Shenandoah 使用了一种称为 Brooks指针的技术，这是一种特殊的指针，用来指向对象的实际位置。当对象在堆中移动时，Brooks指针会更新为指向对象的新位置。这样，即使应用程序在对象移动期间继续运行，应用程序中的引用仍然可以准确地指向对象的新位置。

2. **读屏障和写屏障**：Shenandoah 利用了读屏障和写屏障技术来确保在并发阶段对对象的引用更新是安全的。当应用程序读取或写入一个对象引用时，如果该对象已经被移动，屏障会介入并更新引用为新的位置。

3. **并发标记**：在并发标记阶段，Shenandoah 会识别所有可达对象，并记录它们的位置。这个过程是与应用程序线程并发进行的，以减少对应用程序执行的影响。

4. **并发复制**：Shenandoah 在并发复制阶段会复制存活的对象到新的区域，同时更新所有相关引用，确保引用的准确性。

5. **步调调整（Pacing）**：如果应用程序生成垃圾的速度超过了GC的回收速度，Shenandoah 会采用步调调整技术，即让分配对象的线程稍作停顿，以降低垃圾生成的速度，从而避免进入完全的STW GC。

通过这些技术，Shenandoah GC 能够在尽量减少STW的同时，保持数据的准确性和GC过程的安全性。

这使得它非常适合对延迟敏感的应用程序，如实时服务和高并发系统。

### 总结

JDK 13 中对 Shenandoah GC 的改进进一步巩固了它在 Java 垃圾回收器中的地位，特别是在需要低延迟和高吞吐量的大内存应用程序中。

这些改进不仅提高了 GC 的性能和稳定性，还提供了更好的监控和管理工具，使得 Shenandoah GC 成为处理现代 Java 应用程序的强大选择。

# jdk13 其他 API 更新

JDK 13 引入了若干其他 API 更新，这些更新包括但不限于对现有 API 的改进、新方法的添加以及一些 API 的废弃。

以下是一些具体的 API 更新：

1. **FileSystems 新方法**：增加了 `FileSystems.newFileSystem(Path, Map<String, ?>)` 方法，允许在给定的 `Path` 和属性映射上创建一个新的文件系统。

2. **java.nio.ByteBuffer 新方法**：`java.nio.ByteBuffer` 类增加了新的 bulk get/put 方法，这些方法允许在不考虑缓冲区位置的情况下传输字节。

3. **支持 Unicode 12.1**：JDK 13 支持最新的 Unicode 12.1 标准，这通常涉及对 `java.lang` 和 `java.text` 包中相关类的更新。

4. **移除和废弃的 API**：JDK 13 中移除了一些 API，例如 `awt.toolkit` 系统属性、`Runtime Trace Methods`，以及一些根证书颁发机构证书。同时，也废弃了一些参数和工具，如 `-Xverify:none` 和 `-noverify`、`rmic` 工具以及 `javax.security.cert`。

9. **Shenandoah GC 改进**：Shenandoah 垃圾收集器也得到了改进，包括并发回收和暂停时间预测的优化，以支持低延迟应用。

10. **JVM Constants API**：引入了一个新的 API 来对关键类文件和运行时工件的名义描述进行建模，尤其是那些可以从常量池加载的常量。

这些 API 更新展示了 JDK 13 在性能、内存管理、网络通信和语言规范等方面的持续进步。开发者应注意这些变化，以确保他们的应用程序能够利用 JDK 13 引入的新特性和改进。同时，对于预览特性和实验性特性，开发者应在生产环境中谨慎使用，并进行充分的测试。

# 总结一下 jdk13 的变化

JDK 13 引入了一系列新特性、改进和性能优化，以下是一些主要的变化：

1. **Switch 表达式（JEP 354）**：增强了 switch 语句，允许它作为表达式使用，并引入了箭头语法 `->`。

2. **文本块（JEP 355）**：允许多行字符串文字，无需使用转义字符，提高了代码的可读性。

3. **Dynamic CDS Archives（JEP 350）**：允许在应用程序退出时动态创建类数据共享（CDS）归档，以提高启动速度和内存效率。

4. **重新实现旧版 Socket API（JEP 356）**：用新的实现替代了 Java 1.0 时代的 Socket API，提升性能和可靠性。

5. **ZGC 增强（JEP 352）**：改进了 Z Garbage Collector，增加了将未使用的堆内存返回给操作系统的功能。

6. **其他 API 更新**：包括对 `java.nio.ByteBuffer` 的新方法、对 `FileSystems` 的更新、对垃圾回收器的改进等。

7. **GC 改进**：除了 ZGC，Shenandoah GC 也得到了改进，包括更好的停顿时间预测和并发回收的优化。

8. **预览特性**：一些特性如文本块和 switch 表达式作为预览特性，可能在未来版本中进一步完善。

9. **性能和资源优化**：持续的 JVM 和垃圾收集器性能调优，以及对内存和CPU资源使用优化。

10. **安全性和维护性改进**：包括对 JDK 内部结构的改进，以提高安全性和简化维护工作。

11. **弃用和移除的 API**：一些过时的 API 被标记为弃用或完全移除，以保持 JDK 的现代化和精简。

12. **Unicode 12.1 支持**：更新了对 Unicode 12.1 的支持，这通常涉及对 `java.lang` 和 `java.text` 包中相关类的更新。

13. **JVM 常量 API**：引入了对关键类文件和运行时工件的名义描述进行建模的 API，尤其是那些可以从常量池加载的常量。

14. **扩展的最大堆大小**：ZGC 支持的最大 heap 大小增加到了 16TB。

15. **Socket API 的 NioSocketImpl**：新的 Socket API 实现，用以替代老旧的 PlainSocketImpl。

这些变化体现了 JDK 13 在性能、安全性、易用性和现代化方面的持续进步。开发者应当关注这些变化，以确保他们的应用程序能够利用 JDK 13 引入的新特性和改进。

同时，对于预览特性和实验性特性，开发者应在生产环境中谨慎使用，并进行充分的测试。

* any list
{:toc}