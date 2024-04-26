---
layout: post
title: java 变更日志-11-jdk11
date:  2017-06-28 23:15:43 +0800
categories: [Java]
tags: [jdk, java]
published: true
---

# 拓展阅读

[Java Functional java 函数式编程](https://houbb.github.io/2017/06/29/java-functional)

[Java Lambda](https://houbb.github.io/2017/06/28/java-lambda)

# jdk11 有哪些新特性

JDK 11 引入了一系列新特性和改进，以下是 JDK 11 的一些主要新特性：

1. **字符串 API 增强**：
   - 新增 `isBlank()` 方法，用来判断字符串是否为空或者只包含空白字符。
   - 新增 `lines()` 方法，将字符串按照行终止符进行分割，返回一个 `Stream`。
   - 新增 `strip()`、`stripLeading()` 和 `stripTrailing()` 方法，用于去除字符串两端的空白字符。

2. **HTTP Client 标准化**（JEP 321）：
   - Java 11 对 Java 9 中引入的 Http Client API 进行了标准化，提供了非阻塞请求和响应语义，包名从 `jdk.incubator.http` 改为 `java.net.http`。

3. **ZGC - 可伸缩低延迟垃圾收集器**（JEP 333）：
   - 引入了 Z Garbage Collector，一个可伸缩的、低延迟的垃圾收集器，目标是 GC 停顿时间不超过 10ms，同时处理小至几百 MB 到大至几个 TB 的堆。

4. **Lambda 参数的局部变量语法**（JEP 323）：
   - 允许在 Lambda 表达式中使用 `var` 关键字进行参数声明，增强了 Java 10 中引入的局部变量类型推断特性。

5. **启动单文件源代码程序**（JEP 330）：
   - 允许直接运行单一文件的 Java 源代码，源代码在内存中编译和执行，无需生成 `.class` 文件。

6. **新的垃圾回收器 Epsilon**：
   - 引入了一个完全消极的 GC 实现，适用于具有严格延迟要求的场景，如嵌入式系统和实时系统。

7. **支持 TLS 1.3 协议**：
   - JDK 11 支持了传输层安全性（TLS）1.3 规范，提升了安全性和性能。

8. **Java Flight Recorder (JFR) 开源**：
   - JFR 之前是商业功能，JDK 11 将其开源，并成为 JDK 的一部分，用于监控和诊断 Java 应用程序的性能问题。

9. **动态类文件常量**（JEP 309）：
   - 允许在运行时将常量动态地存储在类文件中，提高了系统的灵活性和可维护性。

10. **废弃 CMS 垃圾收集器**：
    - JDK 11 废弃了 CMS（Concurrent Mark Sweep）垃圾收集器，计划在未来版本中删除。

11. **Nest-Based Access Control**（JEP 181）：
    - 引入了基于嵌套的访问控制，简化了在同一包内不同类间的访问权限控制。

12. **Dynamic Class-File Constants**（JEP 309）：
    - 允许在类文件中动态地添加常量，这在某些动态生成类文件的场景下非常有用。

13. **改进的 AArch64 Intrinsics**（JEP 315）：
    - 对 AArch64（ARM 64位）架构的 Java 代码进行了优化，提高了性能。

这些新特性和改进展示了 JDK 11 在性能、安全性、易用性等方面的持续进步，为 Java 开发者提供了更多的工具和更好的编程体验。

# 详细介绍下 jdk11 字符串 API 增强

JDK 11 对字符串处理能力进行了增强，引入了一些新的字符串操作方法，使得处理字符串更加方便和直观。以下是 JDK 11 中字符串 API 的一些增强：

1. **isBlank() 方法**：
   该方法用来判断一个字符串是否为空（""）或者只包含空白字符（如空格、制表符等）。如果字符串为 `null` 或者满足上述条件，方法返回 `true`，否则返回 `false`。

   ```java
   String blankStr = " ";
   boolean isBlank = blankStr.isBlank(); // true
   ```

2. **strip() 方法**：
   `strip()` 方法用于去除字符串两端的空白字符，包括全角和半角的空格、制表符、换行符等。与 `trim()` 方法相比，`strip()` 能够去除更多的空白字符。

   ```java
   String text = "  Hello Java!  ";
   String stripped = text.strip(); // "Hello Java!"
   ```

3. **stripLeading() 和 stripTrailing() 方法**：
   这两个方法分别用于去除字符串开头和结尾的空白字符。`stripLeading()` 去除字符串开头的空白字符，而 `stripTrailing()` 去除结尾的空白字符。

   ```java
   String text = "  Hello Java!  ";
   String strippedLeading = text.stripLeading(); // "Hello Java!  "
   String strippedTrailing = text.stripTrailing(); // "  Hello Java!"
   ```

4. **repeat(int count) 方法**：
   `repeat()` 方法允许将字符串重复指定次数。这为创建重复字符串提供了一种简洁的方法，避免了使用循环或者多次字符串连接。

   ```java
   String repeatedStr = "Java".repeat(3); // "JavaJavaJava"
   ```

5. **transform() 方法**：
   `transform()` 方法允许对字符串进行函数式转换，传入一个 `Function<? super String, ? extends String>` 函数作为参数，返回一个经过转换的新字符串。

   ```java
   String text = "Hello Java!";
   String transformed = text.transform(s -> new StringBuilder(s).reverse().toString());
   // "!avaH olleJ"
   ```

6. **indent() 方法**：
   `indent()` 方法可以添加或删除字符串中每一行的空格，用于格式化字符串。

这些增强的字符串操作方法提供了更多的便利性，使得字符串处理在 Java 11 中变得更加高效和易于表达。开发者可以利用这些新特性编写更简洁、更易读的代码。

# 详细介绍下 jdk11 HTTP Client 标准化

在 JDK 11 中，Java 引入了一个全新的 HTTP 客户端 API，这个 API 被设计为一个标准的、非阻塞的 HTTP 客户端，旨在替代过时的 `HttpURLConnection` 和 Apache HttpClient API。这个新的 HTTP 客户端提供了一种现代化、灵活且强大的方式来处理 HTTP 请求和响应。

### 主要特点：

1. **非阻塞和响应式**：新的 HTTP 客户端 API 是基于流的，支持异步和事件驱动的编程模型，允许开发者并行处理多个 HTTP 请求和响应。

2. **建立连接和重用**：新的 HTTP 客户端能够有效地管理 HTTP 连接，包括连接的建立、重用和关闭，从而提高资源利用率和性能。

3. **流处理和响应解析**：HTTP 客户端提供了一种简单的方式来处理请求和响应的数据流，包括文本、JSON、XML 和其他自定义格式的数据。

4. **代理支持**：新的 HTTP 客户端支持 HTTP 和 SOCKS 代理，允许在复杂的网络环境中灵活地配置和管理 HTTP 请求。

5. **认证和安全性**：HTTP 客户端提供了对基本、摘要和自定义认证机制的支持，以及 SSL/TLS 安全连接的配置。

### 示例：

下面是使用 JDK 11 HTTP 客户端发送 HTTP GET 请求的简单示例：

```java
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.util.concurrent.CompletableFuture;

public class HttpClientExample {

    public static void main(String[] args) {
        HttpClient httpClient = HttpClient.newHttpClient();

        HttpRequest request = HttpRequest.newBuilder()
                .uri(URI.create("https://jsonplaceholder.typicode.com/posts/1"))
                .GET()
                .build();

        CompletableFuture<HttpResponse<String>> responseFuture = httpClient.sendAsync(request, HttpResponse.BodyHandlers.ofString());

        responseFuture.thenApply(HttpResponse::body)
                      .thenAccept(System.out::println)
                      .join();
    }
}
```

### 总结：

JDK 11 的标准 HTTP 客户端 API 提供了一个现代化、灵活和高效的方式来处理 HTTP 请求和响应。

通过支持非阻塞、响应式编程模型、连接管理、流处理和各种安全特性，这个新的 HTTP 客户端 API 为 Java 开发者提供了一个强大和易于使用的工具，适用于各种网络应用程序和服务。

# 详细介绍下 jdk11 ZGC - 可伸缩低延迟垃圾收集器

Java 11 引入了 Z Garbage Collector（ZGC），这是一个专为低延迟（Low-Latency）应用程序设计的垃圾收集器。ZGC 的设计目标是几乎无感知地执行大量的垃圾收集操作，以便应用程序能够以低延迟运行。

### 主要特点：

1. **低延迟**：ZGC 的一个主要特点是其低延迟性能。它旨在限制垃圾收集操作的暂停时间，使其几乎不受堆大小的影响，从而适用于需要高度可预测的低延迟的应用程序。

2. **可伸缩性**：ZGC 旨在支持大内存容量，并且随着堆大小的增加而保持稳定的性能，这使得它非常适合于大规模数据处理和内存密集型应用。

3. **全堆操作**：ZGC 可以处理全堆的并发操作，包括对象分配、内存重分配和栈扫描等，这有助于减少暂停时间。

4. **透明的GC**：ZGC 提供了一种几乎无感知的垃圾收集机制，大部分垃圾收集操作都是在后台并发执行的，对应用程序几乎没有明显的暂停。

5. **分代无关**：与其他垃圾收集器不同，ZGC 不需要特定的堆结构或分代机制，它可以适用于各种应用程序和堆配置。

### 使用 ZGC：

要使用 ZGC，您可以在启动 Java 应用程序时使用 `-XX:+UseZGC` 选项。例如：

```bash
java -XX:+UseZGC -jar your-application.jar
```

### 性能考虑：

尽管 ZGC 提供了出色的低延迟性能和可伸缩性，但在某些情况下，它可能不如其他垃圾收集器（如 G1）在吞吐量上表现得那么出色。因此，在选择垃圾收集器时，应根据应用程序的特定需求和性能目标进行权衡。

### 总结：

Z Garbage Collector（ZGC）是 JDK 11 中引入的一个重要的垃圾收集器，专为提供低延迟和高可伸缩性而设计。它通过几乎无感知的并发操作和全堆管理来实现低延迟，适用于需要高度可预测响应时间和大内存容量的应用程序。然而，为了实现最佳性能，应根据应用程序的特性和需求来选择合适的垃圾收集器。

# 详细介绍下 jdk11 Lambda 参数的局部变量语法

在 JDK 10 中，引入了局部变量类型推断的 `var` 关键字，允许开发者在声明局部变量时不必显式指定类型，而是由编译器根据变量的初始化程序自动推断其类型。

JDK 11 进一步扩展了这一特性，允许在 Lambda 表达式中使用 `var` 关键字声明参数，这是通过 JEP 323 实现的。

以下是 Lambda 参数的局部变量语法的一些要点：

1. **参数类型推断**：
   在 Lambda 表达式中，可以使用 `var` 关键字声明参数，编译器会根据 Lambda 体中使用的参数来推断其类型。

2. **简洁性**：
   使用 `var` 可以减少代码的冗余，特别是在参数类型较为复杂时，可以使代码更加简洁易读。

3. **限制**：
   `var` 关键字只能用于声明局部变量，不能用于方法参数、构造函数参数、返回类型、字段声明等。

4. **Lambda 表达式中的使用**：
   在 Lambda 表达式中，`var` 用于声明参数，使得 Lambda 表达式更加灵活，尤其是在参数类型较为复杂或不常见时。

5. **示例代码**：
   ```java
   List<String> list = Arrays.asList("a", "b", "c");
   list.forEach(var s -> System.out.println(s)); // 使用 var 声明 Lambda 参数
   ```

6. **与 Java 8 的区别**：
   在 Java 8 及之前的版本中，Lambda 参数总是推断为 `final` 和确切的类型，而不能使用 `var`。从 JDK 10 开始，局部变量可以使用 `var`，到了 JDK 11，这一特性被扩展到了 Lambda 表达式中。

7. **代码可读性**：
   虽然 `var` 提供了类型推断的便利性，但过度使用 `var` 可能会降低代码的可读性。因此，建议在变量类型明显或简单推断的情况下使用 `var`。

8. **与其他语言特性的关系**：
   `var` 在 Lambda 表达式中的应用与 Java 8 引入的 Lambda 表达式、方法引用以及后续 Java 版本中对 Lambda 的改进协同工作。

9. **性能影响**：
   使用 `var` 不会对程序性能产生影响，因为它只是一个在编译时进行类型推断的语法糖。

10. **向后兼容性**：
    `var` 的引入保持了 Java 的向后兼容性，使用 `var` 的代码在没有 `var` 的旧版本 Java 中，只需将 `var` 替换为具体的类型即可。

通过这些改进，JDK 11 使得 Lambda 表达式的使用更加灵活和方便，进一步推动了 Java 语言的现代化进程。

开发者可以利用这些特性编写更简洁、更易读的代码。

# 详细介绍下 jdk11 启动单文件源代码程序

在 JDK 11 中，Java 引入了一个新的特性，允许开发者使用单个源代码文件运行简单的 Java 程序，无需编译。这个特性旨在简化 Java 应用程序的启动和运行过程，特别是对于小型或简单的应用程序。

### 如何使用：

要使用这个特性，您可以直接使用 `java` 命令运行一个单文件的 Java 源代码程序，无需先编译成 `.class` 文件。以下是一个简单的示例：

```java
// HelloWorld.java
public class HelloWorld {
    public static void main(String[] args) {
        System.out.println("Hello, World!");
    }
}
```

您可以使用以下命令直接运行该程序：

```bash
java HelloWorld.java
```

### 如何工作：

当您运行一个单文件的源代码程序时，Java 运行时会自动进行以下步骤：

1. **编译**：Java 运行时会自动地在内存中编译该源代码文件，生成相应的字节码。
  
2. **运行**：一旦编译完成，Java 运行时会直接运行生成的字节码，执行程序的 `main` 方法。

### 注意事项：

1. **限制**：这个特性主要适用于简单的应用程序，对于复杂的项目或依赖多个源代码文件的项目，您仍然需要使用传统的编译和运行方式。

2. **编译器选项**：虽然这个特性简化了启动过程，但编译选项（如 `-classpath`、`-cp`、`-sourcepath` 等）不适用于单文件运行。

3. **性能**：由于单文件源代码程序的编译是即时进行的，可能会导致稍微延迟的启动时间，尤其是在首次运行时。

### 示例：

除了基本的 `HelloWorld` 示例外，您还可以运行包含多个类或依赖的单文件源代码程序。例如，如果您的单文件程序依赖其他库或 JAR 文件，您可以使用 `-cp` 选项指定类路径：

```bash
java -cp .:lib/* MySingleFileProgram.java
```

### 总结：

JDK 11 的单文件源代码程序特性提供了一个简单和直接的方式来运行 Java 程序，无需先进行编译。这对于编写和运行小型或简单的应用程序非常有用，可以减少开发和测试的复杂性。然而，由于其局限性，这个特性更适合于快速原型开发和教学示例，对于生产环境或复杂项目，传统的编译和构建流程仍然是首选。

# 详细介绍下 jdk11 新的垃圾回收器 Epsilon

在 JDK 11 中，Java 引入了一个名为 Epsilon 的新的垃圾回收器。

Epsilon 垃圾回收器是一个实验性的、无操作的、完全被动的垃圾回收器，它并不真正地回收任何内存，而是允许 Java 应用程序运行无 GC（垃圾回收）的模式。

这意味着 Epsilon 回收器不会进行任何垃圾收集操作，即不会进行对象的回收，也不会进行内存的整理。

### 主要特点：

1. **无操作**：Epsilon 回收器在应用程序运行时完全不执行任何垃圾回收操作，这有助于减少应用程序的暂停时间和吞吐量。

2. **低开销**：由于 Epsilon 回收器没有垃圾回收操作，因此它的开销非常低，几乎没有额外的 CPU 或内存使用。

3. **适用性**：Epsilon 回收器适用于那些不需要垃圾回收的特定应用场景，如性能基准测试、短暂的工具和调试应用程序等。

### 如何启用 Epsilon 回收器：

您可以使用 `-XX:+UseEpsilonGC` JVM 参数来启用 Epsilon 回收器。例如：

```bash
java -XX:+UseEpsilonGC YourApplication
```

### 使用场景：

Epsilon 回收器主要适用于以下几种场景：

1. **性能基准测试**：当您需要精确测量应用程序的性能指标时，Epsilon 回收器可以确保垃圾回收的影响被排除在外。

2. **短暂的工具和调试应用程序**：对于那些执行短暂任务或仅用于调试目的的工具，Epsilon 回收器可以提供更稳定和可预测的性能。

3. **内存压力测试**：在模拟高内存使用和压力测试时，Epsilon 回收器可以帮助您集中精力观察和分析应用程序的内存行为。

### 注意事项：

1. **无垃圾收集**：由于 Epsilon 回收器不执行任何垃圾回收操作，因此应用程序的内存使用会逐渐增加，可能会导致内存耗尽和应用程序崩溃。

2. **实验性质**：Epsilon 回收器是一个实验性的功能，可能在未来的 JDK 版本中发生变化或被删除。建议仅在合适的场景中使用 Epsilon 回收器，并在生产环境之前进行充分的测试。

### 总结：

JDK 11 的 Epsilon 垃圾回收器是一个实验性的、无操作的垃圾回收器，它为特定的应用场景提供了一种不进行垃圾回收的模式。

通过减少垃圾回收的影响，Epsilon 回收器可以提供更稳定、可预测和高效的应用程序性能。

然而，由于其实验性质和不回收内存的特性，Epsilon 回收器并不适用于所有的应用程序，应谨慎选择合适的场景使用。

# 详细介绍下 jdk11 TLS 1.3 协议

在 JDK 11 中，Java 引入了对 TLS 1.3（传输层安全协议的第 1.3 版）的支持。TLS 1.3 是一种安全的通信协议，旨在提供更快、更安全的加密连接。它是 TLS 1.2 的后续版本，经过多次改进和优化，以提供更好的安全性和性能。

### 主要特点：

1. **更快的握手**：TLS 1.3 改进了握手过程，减少了连接建立的延迟，这有助于提高网络应用程序的性能和响应速度。

2. **更强的安全性**：TLS 1.3 移除了一些较旧和不安全的密码套件，只保留了最强大和最安全的加密算法和协议。

3. **简化和优化**：TLS 1.3 简化了协议，去除了一些不必要的特性和步骤，以提供更清晰、更可靠的安全连接。

4. **前向保密**：TLS 1.3 强化了前向保密性，确保过去的会话数据即使在长时间之后也不会被破解。

### 如何使用：

在 JDK 11 中，默认情况下，TLS 1.3 是启用的，但可能需要通过特定的系统属性进行配置。您可以通过设置 `-Djdk.tls.client.protocols=TLSv1.3` 系统属性来强制使用 TLS 1.3 协议。

```bash
java -Djdk.tls.client.protocols=TLSv1.3 YourApplication
```

### 注意事项：

1. **兼容性**：尽管 TLS 1.3 提供了许多优势，但可能会与某些较旧的系统或服务不兼容。在启用 TLS 1.3 之前，建议进行充分的兼容性测试。

2. **配置和调试**：由于 TLS 1.3 是一个相对较新的协议，可能需要特定的配置和调试，以确保安全和性能。

3. **更新和维护**：由于 TLS 1.3 是一个不断发展的标准，可能会有新的修订版或改进。建议定期更新 JDK 和相关的安全库，以获取最新的安全修复和功能。

### 总结：

JDK 11 的 TLS 1.3 支持为 Java 应用程序提供了一个先进、安全和高效的加密通信协议。通过提供更快的握手、更强的安全性和简化的协议，TLS 1.3 可以改进网络应用程序的性能和安全性。然而，由于其较新的特性和不断发展的标准，建议在生产环境之前进行充分的测试和评估，以确保兼容性和稳定性。

# 详细介绍下 jdk11 Java Flight Recorder (JFR)

在 JDK 11 中，Java Flight Recorder（JFR）被集成为一个开箱即用的特性，不再需要额外的商业许可证。Java Flight Recorder 是一个事件记录框架，用于监控和分析 Java 应用程序在生产环境中的性能、资源使用和行为。它提供了细粒度的时间序列数据，以便开发者可以深入了解应用程序的运行状态，从而进行性能调优和故障排查。

### 主要特点：

1. **低开销监控**：JFR 通过事件记录机制进行轻量级的应用程序监控，对应用程序性能影响非常小。

2. **实时数据收集**：JFR 可以在应用程序运行时实时收集和记录事件数据，无需停止应用程序或进行代码修改。

3. **丰富的事件数据**：JFR 提供了丰富的事件数据，包括 CPU 使用、内存分配、垃圾回收、线程活动等，可以全面、准确地分析应用程序性能。

4. **低延迟和高精度**：JFR 提供了低延迟和高精度的事件记录，可用于捕获微秒级别的性能指标。

### 如何使用：

在 JDK 11 及更高版本中，JFR 默认已启用，并且集成在 JDK 中。

您可以使用以下命令行工具启动 JFR：

```bash
java -XX:+UnlockCommercialFeatures -XX:+FlightRecorder -XX:StartFlightRecording=duration=60s,filename=myrecording.jfr YourApplication
```

在此命令中：

- `-XX:+UnlockCommercialFeatures`：解锁商业功能，允许使用 JFR。
  
- `-XX:+FlightRecorder`：启用 JFR。

- `-XX:StartFlightRecording=duration=60s,filename=myrecording.jfr`：配置 JFR，设置记录的持续时间和输出文件名。

### JFR 命令行工具：

JDK 11 提供了一套命令行工具，用于管理和分析 JFR 输出文件：

- **jfr**：用于启动、停止和检查 JFR recording。

- **jfr-dump**：用于导出和分析 JFR 输出文件。

- **jfr-stacks**：用于生成和分析线程 dump 和堆栈跟踪。

### 注意事项：

1. **默认启用**：在 JDK 11 中，JFR 默认启用，并且不再需要商业许可证。

2. **性能影响**：尽管 JFR 的性能开销很小，但在生产环境中启用 JFR 仍可能对应用程序性能产生轻微影响。

3. **配置和优化**：为了最大化 JFR 的效益，可能需要根据应用程序的特性和需求进行适当的配置和优化。

### 总结：

JDK 11 中的 Java Flight Recorder（JFR）为 Java 开发者提供了一个强大、高效和实时的性能监控工具。

通过提供细粒度的事件数据和丰富的分析工具，JFR 可以帮助开发者深入了解应用程序的运行状况，从而进行性能优化、故障排查和系统调整。

作为 JDK 的一部分，JFR 现在更加易于使用和集成，无需额外的许可证或配置，为 Java 应用程序提供了更高效、更可靠的监控和分析功能。

# 详细介绍下 jdk11 废弃 CMS 垃圾收集器

在 JDK 11 中，Concurrent Mark-Sweep（CMS）垃圾收集器被标记为“废弃”（deprecated）。

这意味着 CMS 在 JDK 11 中仍然可用，但已被标记为不建议使用，并且可能会在将来的 JDK 版本中移除。

这是 JDK 开发团队为了简化和优化垃圾收集器架构，提高整体性能和可维护性所做的决定。

### CMS 垃圾收集器的特点：

1. **并发收集**：CMS 垃圾收集器是一个并发垃圾收集器，它在大部分的垃圾回收工作中与应用程序线程并发执行，以减少停顿时间。

2. **低延迟**：由于 CMS 收集器是并发执行的，所以它通常具有较低的垃圾收集停顿时间，适用于那些对低延迟有严格要求的应用场景。

3. **不适合大堆**：CMS 收集器在大堆内存环境下可能会遇到碎片化问题，导致性能下降和不稳定的垃圾收集。

### 为什么废弃 CMS 垃圾收集器？

1. **简化架构**：JDK 开发团队希望简化垃圾收集器架构，减少不必要的复杂性和维护成本。

2. **提高性能**：通过集中资源和优化更先进的垃圾收集器，JDK 可以提高整体性能和吞吐量。

3. **推荐使用 G1 GC**：随着 JDK 的发展，G1 垃圾收集器已经被推荐为更先进、更高效的替代方案，它提供了高吞吐量和低延迟的垃圾收集能力，适用于各种应用场景。

### 应对策略：

如果您的应用程序目前正在使用 CMS 垃圾收集器，建议您考虑迁移到 G1 垃圾收集器或其他推荐的垃圾收集器，以确保未来的 JDK 版本兼容性和性能优化。

### 总结：

在 JDK 11 中，CMS 垃圾收集器被标记为“废弃”，并不再是推荐的垃圾收集器选择。

JDK 开发团队推荐使用更先进、更高效的垃圾收集器，如 G1 垃圾收集器，以提高整体性能和可维护性。

对于仍在使用 CMS 垃圾收集器的应用程序，建议进行迁移和优化，以适应 JDK 的变化和未来的垃圾收集器架构。

# 详细介绍下 jdk11 Nest-Based Access Control

在 JDK 11 中，引入了嵌套基于访问控制（Nest-Based Access Control，JEP 181）的特性，这是一个重要的 JVM 语言改进，旨在优化和简化 JVM 字节码和访问控制模型。

这项特性的目标是提高 JVM 的性能，同时允许更为灵活和安全的字节码验证。

### 主要特点：

1. **嵌套类访问**：Nest-Based Access Control 允许嵌套类之间的互相访问，无需额外的访问检查或桥接方法。

2. **简化字节码**：通过优化嵌套类的访问控制，可以减少生成的字节码数量，从而提高 JVM 执行效率。

3. **增强安全性**：通过更加精细的访问控制，Nest-Based Access Control 可以提供更高的安全性和可靠性，防止未授权的访问和恶意代码执行。

### 工作原理：

在 JVM 内部，Nest-Based Access Control 将嵌套类组织为一个逻辑上的“嵌套类组”（Nest），每个组都有一个主类作为代表。在字节码级别，这种组织方式允许嵌套类之间的互相访问，同时保持访问控制的安全性。

例如，如果一个嵌套类需要访问其外部类的私有成员或方法，Nest-Based Access Control 可以直接允许这种访问，而无需生成额外的桥接方法或访问检查。

### 使用示例：

考虑以下 Java 代码片段：

```java
public class OuterClass {
    private int privateVar = 10;

    public class InnerClass {
        public void accessPrivateVar() {
            System.out.println(privateVar);
        }
    }
}
```

在 JDK 11 中，由于引入了嵌套基于访问控制，InnerClass 可以直接访问 OuterClass 的 privateVar，如上述代码所示，无需任何额外的访问控制调整或桥接方法。

### 注意事项：

1. **字节码兼容性**：尽管 Nest-Based Access Control 提供了一种更为灵活和高效的访问控制机制，但可能会影响一些依赖于旧访问控制模型的库或框架。

2. **安全性考虑**：虽然该特性有助于提高代码的可读性和执行效率，但在实际应用中，仍然需要考虑安全性问题，确保仅允许必要和合适的访问。

### 总结：

JDK 11 的嵌套基于访问控制（Nest-Based Access Control）特性为 JVM 引入了一种新的、更为灵活和高效的访问控制机制。

通过优化嵌套类的访问和组织，该特性旨在提高 JVM 的性能，同时提供更高的安全性和可维护性。

尽管这是一个内部的 JVM 改进，但它为 Java 开发者提供了更好的编程体验和更高的执行效率。

# 详细介绍下 jdk11 Dynamic Class-File Constants

在 JDK 11 中，引入了动态类文件常量（Dynamic Class-File Constants，JEP 309）的特性，这是一个旨在提高 JVM 字节码的灵活性和性能的重要改进。动态类文件常量允许 Java 字节码在运行时加载和解析常量值，而无需在编译时硬编码。

### 主要特点：

1. **灵活性**：动态类文件常量允许 JVM 在运行时加载和解析常量值，从而提供更大的灵活性和可扩展性。

2. **性能优化**：通过动态解析常量，JVM 可以避免在编译时硬编码常量值，从而减少字节码大小和加载时间。

3. **增强安全性**：动态类文件常量提供了一种更加灵活和安全的常量加载机制，有助于防止代码注入和恶意攻击。

### 工作原理：

在传统的 Java 字节码中，常量通常是硬编码在字节码文件中的，这意味着常量值在编译时已经确定，并且在运行时不可更改。而动态类文件常量允许 JVM 在运行时动态加载和解析常量值。

例如，可以在字节码中引用一个常量池索引，然后在运行时使用 `ldc` 指令加载常量值。这种方法允许常量值在运行时由 JVM 动态确定，而不是在编译时硬编码。

### 使用示例：

考虑以下 Java 代码片段：

```java
public class DynamicConstantsExample {
    public static void main(String[] args) {
        String dynamicString = "Hello, World!";
        System.out.println(dynamicString);
    }
}
```

在 JDK 11 中，编译上述代码将生成一个包含动态常量引用的字节码。然后，JVM 在运行时动态解析这个常量，从而加载和显示正确的字符串值。

### 注意事项：

1. **字节码兼容性**：虽然动态类文件常量提供了更大的灵活性和性能优化，但可能会影响依赖于旧常量加载机制的库或框架。

2. **安全性考虑**：在使用动态类文件常量时，需要确保只加载信任的和验证的常量值，以防止恶意代码注入和安全漏洞。

### 总结：

JDK 11 的动态类文件常量（Dynamic Class-File Constants）特性为 JVM 引入了一种新的、更为灵活和高效的常量加载机制。通过允许在运行时动态加载和解析常量值，该特性不仅提高了 JVM 的性能，还增强了其灵活性和安全性。尽管这是一个底层的 JVM 改进，但它为 Java 开发者提供了更好的编程体验和更高的执行效率。

# 详细介绍下 jdk11 改进的 AArch64 Intrinsics

在 JDK 11 中，为了优化 ARM 64 体系结构（AArch64）的性能，引入了改进的 AArch64 Intrinsics（JEP 315）。这是一个针对 ARM 64 平台的底层优化，旨在提高 Java 应用程序在 ARM 64 架构上的性能。

### 主要特点：

1. **针对 ARM 64 优化**：改进的 AArch64 Intrinsics 专为 ARM 64 架构设计，充分利用 AArch64 的硬件特性和指令集。

2. **性能提升**：通过使用 Intrinsics，JVM 可以直接利用底层硬件功能，从而实现更高效的代码执行和更低的运行时开销。

3. **扩展功能**：JDK 11 通过引入新的 Intrinsics 支持更多的 ARM 64 指令，从而扩展了 Java 在 ARM 64 平台上的功能和性能。

### 工作原理：

Intrinsics 是一种在 Java 代码中嵌入底层硬件指令的方法，允许 JVM 直接调用底层硬件功能，而无需通过 JNI（Java Native Interface）进行间接调用。这种直接调用能够提供更高效的性能，因为它避免了 JNI 调用的开销。

例如，针对 ARM 64 平台的某个特定操作，JVM 可以使用 Intrinsics 直接调用相应的底层指令，从而实现更快速和更有效的代码执行。

### 使用示例：

考虑以下 Java 代码片段，该代码在 ARM 64 架构上利用改进的 Intrinsics 进行优化：

```java
public class AArch64IntrinsicsExample {
    public static void main(String[] args) {
        long[] array = new long[1024];
        // 使用改进的 AArch64 Intrinsics 进行数组复制
        System.arraycopy(array, 0, array, 512, 512);
    }
}
```

在 JDK 11 中，`System.arraycopy` 方法可能会直接利用改进的 AArch64 Intrinsics 进行优化，从而实现更快速和更有效的数组复制操作。

### 注意事项：

1. **平台兼容性**：改进的 AArch64 Intrinsics 专为 ARM 64 架构设计，因此只适用于支持 AArch64 的硬件平台。

2. **版本依赖**：为了充分利用这些改进，需要在支持 JDK 11 或更高版本的环境中运行应用程序。

### 总结：

JDK 11 的改进的 AArch64 Intrinsics（JEP 315）为 ARM 64 架构提供了专门优化的底层指令集，旨在提高 Java 应用程序在 ARM 64 平台上的性能和效率。

通过直接调用底层硬件功能，该特性能够实现更高效、更低延迟的代码执行，为 ARM 64 平台的 Java 开发提供了更多的灵活性和性能优化。

# 总结一下 jdk11 的变化

JDK 11 是 Java SE 平台的一个重要版本，引入了多项关键特性、性能改进和安全性增强。

以下是 JDK 11 的主要变化的总结：

1. **ZGC - 可伸缩低延迟垃圾收集器（JEP 333）**：引入了 ZGC，一个针对大内存堆和低延迟应用程序优化的垃圾收集器。

2. **HTTP Client 标准化（JEP 321）**：提供了一个标准化的 HTTP Client API，支持 HTTP/1.1 和 HTTP/2 协议，简化了 HTTP 客户端的使用。

3. **Lambda 参数的局部变量语法（JEP 323）**：扩展了 Lambda 表达式的语法，允许在 Lambda 表达式中使用 `var` 关键字声明局部变量。

4. **启动单文件源代码程序（JEP 330）**：引入了一种新的命令行工具，允许直接运行单个源代码文件，无需编译和打包。

5. **Epsilon 垃圾回收器（JEP 318）**：提供了一个无操作的垃圾回收器，用于性能测试和资源受限环境。

6. **TLS 1.3 协议支持（JEP 332）**：增加了对 TLS 1.3 协议的支持，提供更安全和高效的加密通信。

7. **Java Flight Recorder (JFR)（JEP 328）**：将 JFR（Java Flight Recorder）作为开源功能添加到 JDK，提供了丰富的诊断和性能分析工具。

8. **废弃 CMS 垃圾收集器（JEP 333）**：决定废弃 CMS（Concurrent Mark-Sweep）垃圾收集器，推荐使用 G1 或其他垃圾收集器。

9. **Nest-Based Access Control（JEP 181）**：引入了嵌套基于访问控制，优化了 JVM 的访问控制模型。

10. **动态类文件常量（JEP 309）**：允许 JVM 在运行时加载和解析常量值，提高了字节码的灵活性和性能。

11. **改进的 AArch64 Intrinsics（JEP 315）**：优化了 ARM 64 架构上的性能，提供了专门优化的底层指令集。

这些变化不仅增强了 Java 的性能、安全性和功能性，还为开发者提供了更多的工具和选项，以满足各种应用程序的需求。

* any list
{:toc}