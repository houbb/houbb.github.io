---
layout: post
title: java 变更日志-09-jdk9
date:  2017-06-28 23:15:43 +0800
categories: [Java]
tags: [jdk, java]
published: true
---

# 拓展阅读

[Java Functional java 函数式编程](https://houbb.github.io/2017/06/29/java-functional)

[Java Lambda](https://houbb.github.io/2017/06/28/java-lambda)

# jdk9 有哪些新特性

Java 9 是一个里程碑式的版本，带来了许多重要的改进和新特性。以下是 JDK 9 中一些主要的新特性：

### 1. 模块系统（Java Platform Module System）

- **模块化系统**：引入了一种新的 Java 平台模块系统，称为 **JPMS（Java Platform Module System）**，使得 Java 应用程序可以被模块化，提供更好的封装和代码组织。
- **模块路径**：引入了一个新的模块路径来代替类路径，使得模块之间的依赖关系更加清晰和可控。
  
### 2. JShell：交互式编程环境

- **JShell**：引入了一个新的交互式编程环境，允许开发者直接在命令行中编写和执行 Java 代码片段，无需创建或编译完整的 Java 程序。

### 3. 集合工厂方法

- **集合工厂方法**：为集合框架添加了一系列新的静态工厂方法，使得创建和初始化不可变集合变得更加简单和直观。

### 4. 接口的私有方法

- **接口的私有方法**：允许在接口中定义私有方法，这些方法只能在接口内部被调用，增强了接口的封装性和可维护性。

### 5. HTTP/2 客户端

- **HTTP/2 客户端**：引入了一个新的 HTTP 客户端 API，支持 HTTP/2 协议，提供了更高效和更灵活的方式来进行网络通信。

### 6. 增强的 Stream API

- **增强的 Stream API**：Stream API 得到了进一步的增强，引入了多个新的方法和改进，使得数据处理更加高效和灵活。

### 7. 多版本兼容 JARs

- **多版本兼容 JARs**：支持在同一个 JAR 文件中包含多个版本的 Java 类，这有助于提供向后兼容性和简化依赖管理。

### 8. 并行完全 GC（G1 GC）

- **并行完全 GC（G1 GC）**：G1 垃圾收集器在 Java 9 中成为了默认的垃圾收集器，提供了更高效的垃圾收集性能和更可预测的停顿时间。

### 9. 私有接口方法

- **私有接口方法**：允许在接口中定义私有方法，提供了一种更好的代码组织和重用代码的方式。

### 10. 改进的安全性

- **改进的安全性**：对 Java 平台的安全性进行了多项改进，包括对加密和安全传输层（TLS）的增强支持。

这些只是 JDK 9 中的一些主要特性和改进，Java 9 还包括许多其他的增强和优化，以提高性能、稳定性和安全性。

总的来说，Java 9 引入了许多重要的新特性，为 Java 开发者提供了更多的工具和功能，以应对现代软件开发的挑战。

##  jdk9 模块系统（Java Platform Module System）

Java Platform Module System（JPMS），也称为 Java 9 的模块系统，是 Java 9 中引入的一项重大特性，它旨在提供一种更加模块化和可维护的方式来组织和部署 Java 应用程序。

以下是 JDK 9 模块系统的详细介绍：

### 1. 为什么需要模块系统？

在 Java 9 之前，Java 应用程序主要使用类路径（classpath）来加载类和资源，这种方式存在一些问题，例如：

- **命名冲突**：多个 JAR 包中可能存在相同的类名，导致命名冲突。
- **封装不足**：公共类和方法可能被不应该访问它们的代码访问。
- **复杂的依赖管理**：手动管理复杂的依赖关系和版本冲突。

模块系统旨在解决这些问题，通过引入一种新的模块路径（module path）和模块描述文件（module-info.java）来更好地管理模块化的应用程序。

### 2. 模块路径

模块路径是一个指向模块化 JAR 文件或目录的路径，与传统的类路径不同。模块路径提供了一种明确、可管理的方式来定义和解析模块依赖关系。

### 3. 模块描述文件（module-info.java）

每个模块都需要一个名为 `module-info.java` 的模块描述文件，该文件定义了模块的名称、依赖关系和导出的包。

以下是一个简单的 `module-info.java` 文件示例：

```java
module com.example.module {
    requires java.base; // 指定该模块依赖于 java.base 模块
    exports com.example.module.api; // 导出 com.example.module.api 包
}
```

### 4. 模块命令

Java 9 引入了一些新的命令行选项，用于支持模块化应用程序的构建和运行，例如：

- `--module-path`：指定模块路径。
- `--module`：指定主要模块来运行。

### 5. 模块化 JDK

Java 9 自身也被模块化，将 JDK 的核心功能分解为一系列模块，例如：

- `java.base`：基础模块，包含 Java 核心 API。
- `java.sql`：包含 JDBC API。
- `java.xml`：包含 XML 处理 API。
  
### 6. 模块之间的依赖管理

模块系统允许开发者明确地指定模块之间的依赖关系，从而减少了运行时的依赖性问题和版本冲突。

### 7. 命名模块和自动模块

- **命名模块**：拥有 `module-info.java` 的正式模块。
- **自动模块**：没有 `module-info.java` 的传统 JAR 文件，它们被视为具有隐式依赖于类路径上其他模块的模块。

### 8. 弃用的类路径

虽然模块系统引入了模块路径，但 Java 9 仍然保留了类路径的支持，以确保向后兼容性。

总结：Java 9 的模块系统提供了一种新的、可管理的方式来组织和部署 Java 应用程序，它通过明确的依赖关系和封装来提高应用程序的安全性、可维护性和性能。

虽然模块系统可能需要一些时间来适应，但它为构建和维护复杂的 Java 应用程序提供了更好的工具和结构。

##  jdk9 新增的集合工厂方法

在 Java 9 中，为了更加方便地创建不可变集合（Immutable Collections），引入了一系列新的静态工厂方法。

这些新方法被添加到 `List`、`Set` 和 `Map` 接口及其实现类，使得创建不可变集合变得更加简单、直观和类型安全。

以下是 JDK 9 新增的集合工厂方法的详细介绍：

### 1. List 工厂方法

在 `List` 接口中引入了 `of` 和 `copyOf` 两个静态工厂方法：

- **`of` 方法**：创建一个包含指定元素的不可变列表。

  ```java
  List<String> list = List.of("A", "B", "C");
  ```

- **`copyOf` 方法**：从现有集合创建一个不可变列表。

  ```java
  List<String> originalList = Arrays.asList("A", "B", "C");
  List<String> copyList = List.copyOf(originalList);
  ```

### 2. Set 工厂方法

在 `Set` 接口中引入了 `of` 和 `copyOf` 两个静态工厂方法：

- **`of` 方法**：创建一个包含指定元素的不可变集合。

  ```java
  Set<String> set = Set.of("A", "B", "C");
  ```

- **`copyOf` 方法**：从现有集合创建一个不可变集合。

  ```java
  Set<String> originalSet = new HashSet<>(Arrays.asList("A", "B", "C"));
  Set<String> copySet = Set.copyOf(originalSet);
  ```

### 3. Map 工厂方法

在 `Map` 接口中引入了 `ofEntries` 和 `copyOf` 两个静态工厂方法：

- **`ofEntries` 方法**：创建一个包含指定键值对的不可变映射。

  ```java
  Map<String, Integer> map = Map.ofEntries(
      Map.entry("A", 1),
      Map.entry("B", 2),
      Map.entry("C", 3)
  );
  ```

- **`copyOf` 方法**：从现有映射创建一个不可变映射。

  ```java
  Map<String, Integer> originalMap = new HashMap<>();
  originalMap.put("A", 1);
  originalMap.put("B", 2);
  originalMap.put("C", 3);
  
  Map<String, Integer> copyMap = Map.copyOf(originalMap);
  ```

### 注意事项：

- 所有这些工厂方法创建的集合都是不可变的（Immutable），尝试修改这些集合将会抛出 `UnsupportedOperationException`。
- 如果尝试向这些不可变集合中添加重复的元素或者 `null` 值，将会抛出 `IllegalArgumentException`。

这些新的集合工厂方法提供了一种更简单、更安全的方式来创建不可变集合，有助于编写更加健壮和可维护的代码。

通过使用不可变集合，可以减少由于共享可变状态而引起的并发问题，并提高代码的可读性和可维护性。

##  jdk9 新增的接口的私有方法

在 Java 9 中，引入了一种新的特性，即接口中的私有方法。

这一特性旨在使接口更加灵活和可维护，允许接口定义者在接口内部使用私有方法来重用代码，而不会影响接口的实现类或接口的使用者。

以下是 JDK 9 新增的接口私有方法的详细介绍：

### 1. 接口私有方法的定义

在接口中，可以使用 `private` 关键字来定义私有方法。这些私有方法只能在接口内部访问，不可以被接口的实现类或其他类访问。

```java
public interface MyInterface {
    
    default void publicMethod() {
        // 调用私有方法
        privateMethod();
    }

    private void privateMethod() {
        System.out.println("This is a private method.");
    }
}
```

### 2. 默认方法和私有方法的组合

私有方法可以与默认方法和静态方法结合使用，以提供通用的实现逻辑。

```java
public interface Calculation {
    
    default int add(int a, int b) {
        return a + b + applyBonus();
    }

    default int subtract(int a, int b) {
        return a - b - applyBonus();
    }

    private int applyBonus() {
        return 10; // 一个通用的私有方法
    }
}
```

### 3. 静态方法和私有方法

私有方法也可以是静态的。

```java
public interface MyInterface {
    
    static void staticMethod() {
        // 调用私有静态方法
        privateStaticMethod();
    }

    private static void privateStaticMethod() {
        System.out.println("This is a private static method.");
    }
}
```

### 4. 接口私有方法的用途

- **代码重用**：避免在多个默认方法中复制相同的代码。
- **增强可读性和可维护性**：将复杂的逻辑封装在私有方法中，使接口的实现更加清晰和易于维护。
- **提高安全性**：限制访问范围，确保只有接口内部可以访问。

### 注意事项：

- 私有方法只能在定义它们的接口内部使用，无法从接口的实现类或其他类中访问。
- 私有方法不可被继承或覆盖，因为它们不属于接口的 API 的一部分。

总结：JDK 9 引入的接口私有方法是一种有用的特性，它允许在接口内部重用代码，提高代码的可读性和可维护性，同时增强了接口的灵活性。

通过使用接口私有方法，可以更加高效地组织和管理接口的实现代码，从而使得 Java 程序设计更加优雅和健壮。

##  jdk9 新增的HTTP/2 客户端

在 JDK 9 中，Java 引入了一个新的 HTTP 客户端 API，支持 HTTP/2 协议，这是一项重要的网络协议，旨在提高网页加载速度和性能。

这个新的 HTTP 客户端 API 提供了一种现代化的方式来进行 HTTP 请求和响应处理，与传统的 `HttpURLConnection` 相比，它更加灵活、高效并且易于使用。

以下是 JDK 9 新增的 HTTP/2 客户端的详细介绍：

### 1. 创建 HTTP/2 客户端

使用 `HttpClient` 类创建 HTTP/2 客户端：

```java
HttpClient httpClient = HttpClient.newHttpClient();
```

### 2. 发送 HTTP 请求

通过 `HttpRequest` 类来构建 HTTP 请求，并通过 `HttpClient` 来发送请求：

```java
HttpRequest request = HttpRequest.newBuilder()
        .uri(new URI("https://example.com"))
        .GET()
        .build();

HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());

System.out.println("Response Status Code: " + response.statusCode());
System.out.println("Response Body: " + response.body());
```

### 3. HTTP/2 特性支持

新的 `HttpClient` API 默认支持 HTTP/2，不需要额外的配置。此外，它还支持以下特性：

- **流复用（Stream Multiplexing）**：多个请求可以在同一个连接上并发进行。
- **服务器推送（Server Push）**：服务器可以主动推送资源到客户端，提高加载速度。
- **头部压缩（Header Compression）**：减少传输数据量，提高性能。

### 4. 异步和同步请求

`HttpClient` API 支持异步和同步请求：

- **异步请求**：使用 `sendAsync` 方法发送异步请求。

  ```java
  httpClient.sendAsync(request, HttpResponse.BodyHandlers.ofString())
      .thenApply(HttpResponse::body)
      .thenAccept(System.out::println);
  ```

- **同步请求**：使用 `send` 方法发送同步请求。

  ```java
  HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());
  ```

### 5. 配置和定制

`HttpClient` 提供了丰富的配置选项和定制能力，例如超时设置、代理设置、SSL/TLS 定制等。

```java
HttpClient httpClient = HttpClient.newBuilder()
        .connectTimeout(Duration.ofSeconds(10))
        .proxy(ProxySelector.of(new InetSocketAddress("proxy.example.com", 8080)))
        .build();
```

### 6. 处理响应

`HttpResponse` 类提供了丰富的方法来处理 HTTP 响应，例如获取状态码、响应头、响应体等。

```java
System.out.println("Response Status Code: " + response.statusCode());
System.out.println("Response Headers: " + response.headers().map());
System.out.println("Response Body: " + response.body());
```

### 7. 关闭客户端

当不再需要 `HttpClient` 时，应该关闭它以释放资源。

```java
httpClient.close();
```

总结：JDK 9 引入的 HTTP/2 客户端 API 提供了一种现代化、高效和灵活的方式来进行 HTTP 请求和响应处理。

它支持 HTTP/2 协议的主要特性，如流复用、服务器推送和头部压缩，提供了异步和同步请求的选项，并且具有丰富的配置和定制能力。

这使得 Java 开发者能够利用 HTTP/2 的优势，更加高效地构建网络应用和服务。

##  jdk9 增强的 Stream API

JDK 9 对 Stream API 进行了增强，引入了一些新特性和改进，使得流的操作更加强大和灵活。

以下是 JDK 9 中 Stream API 的一些主要增强：

1. **新的流操作**：
   - `takeWhile` 和 `dropWhile`：这两个操作允许根据条件对流进行切片。`takeWhile` 会从流的开始处一直取元素，直到给定的谓词第一次不满足为止。`dropWhile` 则相反，它会跳过流开始处满足谓词的元素，直到谓词不满足时停止。

```java
List<Integer> numbers = Arrays.asList(1, 2, 3, 4, 5);
numbers.stream()
       .takeWhile(n -> n < 3) // 取流中小于3的元素
       .forEach(System.out::println); // 输出1和2

numbers.stream()
       .dropWhile(n -> n < 4) // 跳过流中小3的元素
       .forEach(System.out::println); // 输出4和5
```

2. **流的封闭操作**（Terminal Operations）：
   - `collect` 操作现在支持一个新的方式 `toMap`，它允许用户在流中直接收集元素到一个 Map 中。此外，`toMap` 允许处理潜在的键值冲突，通过提供合并函数来解决。

```java
Map<String, Integer> map = Stream.of("one", "two", "three")
                                   .collect(Collectors.toMap(
                                       String::toString,
                                       s -> s.length(),
                                       (existing, replacement) -> existing
                                   ));
System.out.println(map); // 输出：{one=3, two=3, three=5}
```

3. **流的中间操作**（Intermediate Operations）：
   - `filter` 操作现在支持一个 `filterNot` 的变体，它允许过滤掉满足某个谓词的所有元素，即只保留不满足谓词的元素。

```java
List<Integer> numbers = Arrays.asList(1, 2, 3, 4, 5);
numbers.stream()
       .filterNot(n -> n % 2 == 0) // 过滤掉偶数
       .forEach(System.out::println); // 输出1, 3, 5
```

4. **流的并行性**：

   - JDK 9 改进了并行流的性能，通过减少不必要的同步操作，提高了并行流的效率。

5. **流的构造器**：
   - 新增了 `Stream.ofNullable` 方法，允许创建包含一个或多个可能为 `null` 的元素的流。

```java
Stream<String> stream = Stream.ofNullable("test");
// stream: ["test"]

Stream<String> emptyStream = Stream.ofNullable(null);
// emptyStream: []
```

6. **流的非中断性**：
   - 新增了 `forEachOrdered` 方法，它与 `forEach` 类似，但是保证按照元素在流中的顺序进行迭代。

```java
List<String> strings = Arrays.asList("apple", "banana", "cherry");
strings.stream()
       .sorted() // 先对流进行排序
       .forEachOrdered(System.out::println); // 保证按照排序后的顺序输出
```

7. **流的查找操作**：
   - 新增了 `anyMatch` 和 `noneMatch` 的变体 `findFirst` 和 `findLast`，允许找到第一个或最后一个匹配条件的元素，而不是仅仅返回一个布尔值。

```java
List<Integer> numbers = Arrays.asList(1, 2, 3, 4, 5);
Optional<Integer> first = numbers.stream()
                                   .filter(n -> n % 2 == 0) // 找到第一个偶数
                                   .findFirst();
Optional<Integer> last = numbers.stream()
                                   .filter(n -> n % 2 == 0) // 找到最后一个偶数
                                   .findLast();
System.out.println(first.get()); // 输出2
System.out.println(last.get()); // 输出4
```

8. **流的映射操作**：
   - 新增了 `mapToObj` 等方法，允许将流中的元素映射到另一种类型，这些方法现在更加通用和灵活。

```java
IntStream intStream = IntStream.range(0, 5);
Stream<String> stringStream = intStream.mapToObj(Integer::toString);
stringStream.forEach(System.out::println); // 输出从"0"到"4"的字符串
```

9. **流的扁平化**：
   - 新增了 `flatMap` 的替代方法，允许将一个流中的每个元素替换为另一个流，然后将这些流连接起来形成一个流。

```java
List<String> words = Arrays.asList("hello", "world");
IntStream lengths = words.stream()
                         .flatMapToInt(word -> IntStream.of(word.length()));
lengths.forEach(System.out::println); // 输出每个单词的长度：5 5
```

10. **流的其他改进**：

iterate 方法的重载

Stream.iterate 方法现在有一个新的重载版本，允许提供一个 Predicate 来定义何时停止迭代。

```java
Stream.iterate(1, n -> n < 10, n -> n + 1)
      .forEach(System.out::println);
// 输出：1 2 3 4 5 6 7 8 9
```

11. **Collectors 类的新方法**

Collectors 类增加了一些新的方法，如 Collectors.flatMapping 和 Collectors.teeing，提供了更多的收集器组合和定制的选项。

flatMapping 方法：允许在收集之前进行扁平化操作。

```java
Map<String, List<String>> map = List.of("apple", "banana", "cherry")
                                   .stream()
                                   .collect(Collectors.groupingBy(
                                       s -> s.substring(0, 1),
                                       Collectors.flatMapping(
                                           s -> Stream.of(s),
                                           Collectors.toList())));
```

teeing 方法：允许在一个收集操作中应用两个收集器，并将它们的结果组合起来。

```java
double result = List.of(1.0, 2.0, 3.0)
                    .stream()
                    .collect(Collectors.teeing(
                        Collectors.summingDouble(d -> d),
                        Collectors.counting(),
                        (sum, count) -> sum / count));
```

JDK 9 中的这些增强进一步扩展了 Stream API 的能力，使得流的操作更加直观和高效，同时也提高了流处理的性能。

这些改进对于处理集合数据、执行并行计算以及简化代码逻辑都具有重要意义。

请注意，以上信息是基于 JDK 9 的 Stream API 增强的概述，具体的 API 使用和示例可能需要参考 JDK 9 的官方文档或相关教程。

##  jdk9 多版本兼容 JARs

在 JDK 9 中，引入了一种新的特性，即多版本兼容 JAR（Multi-Release JARs），这是为了解决 Java 平台的版本升级问题。

这项特性允许开发者为不同版本的 Java 环境提供不同的类版本，使得相同的 JAR 文件可以在不同版本的 Java 环境中运行，从而简化了版本管理和兼容性问题。

以下是关于 JDK 9 多版本兼容 JARs 的详细介绍：

### 1. 结构

多版本兼容 JAR 文件的结构基本上与普通的 JAR 文件相同，但在 `META-INF` 目录下添加了一个特殊的 `versions` 目录，其中包含了多个子目录，每个子目录代表一个 Java 平台版本。

```
MyLibrary.jar
├── META-INF
│   └── versions
│       ├── 9
│       │   └── com
│       │       └── example
│       │           └── MyClass.class
│       └── 10
│           └── com
│               └── example
│                   └── MyClass.class
└── com
    └── example
        └── MyClass.class
```

在上面的示例中，`MyLibrary.jar` 包含了两个版本（Java 9 和 Java 10）的 `MyClass.class` 文件。

### 2. 如何工作

当在 Java 9 或更高版本的环境中运行该 JAR 文件时，JVM 会根据当前运行的 Java 版本自动选择相应版本的类文件。例如，如果在 Java 10 环境中运行上述 JAR 文件，JVM 会选择 `versions/10/com/example/MyClass.class`；如果在 Java 9 环境中运行，则选择 `versions/9/com/example/MyClass.class`。

### 3. 使用场景

多版本兼容 JARs 特别适用于那些需要支持多个 Java 版本的库或应用程序。通过使用这种机制，开发者可以更容易地为不同版本的 Java 提供兼容的代码，同时减少了版本管理和兼容性测试的复杂性。

### 4. 注意事项

- 要创建多版本兼容 JAR 文件，开发者需要使用支持这一特性的构建工具，例如 Maven 或 Gradle，并按照相应的规范进行配置。
  
- 由于多版本兼容 JARs 依赖于 `META-INF/versions` 结构，因此它只适用于普通 JAR 文件，不适用于 WAR、EAR 或其他类型的打包文件。

### 5. 示例

以 Maven 为例，使用 `maven-jar-plugin` 可以创建多版本兼容 JAR 文件：

```xml
<build>
    <plugins>
        <plugin>
            <groupId>org.apache.maven.plugins</groupId>
            <artifactId>maven-jar-plugin</artifactId>
            <version>3.1.0</version>
            <configuration>
                <archive>
                    <manifestEntries>
                        <Multi-Release>true</Multi-Release>
                    </manifestEntries>
                </archive>
            </configuration>
        </plugin>
    </plugins>
</build>
```

### 总结

JDK 9 引入的多版本兼容 JARs 特性为 Java 开发者提供了一种简化版本管理和兼容性问题的方法。

它允许在同一个 JAR 文件中包含针对不同 Java 版本的类文件，从而使得相同的库或应用程序可以在多个 Java 版本中无缝运行。

这一特性对于那些需要支持多个 Java 版本的开发者来说是非常有价值的，它简化了开发和测试的复杂性，同时提高了代码的灵活性和可维护性。

##  jdk9 并行完全 GC（G1 GC）

在 JDK 9 中，G1 (Garbage-First) 垃圾收集器得到了进一步的改进和优化，特别是在并行性方面。

G1 GC 是一个并行的、分代的垃圾收集器，旨在提供更高的吞吐量和更可预测的停顿时间。

### G1 GC 的主要特性

1. **分区并行处理**：G1 将堆划分为多个大小相等的区域（Region），在并行处理时，可以同时回收多个区域，提高垃圾收集的效率。

2. **并行标记**：G1 GC 使用多线程并行地进行标记过程，从而减少标记阶段的停顿时间。

3. **并行清除**：在清除阶段，G1 GC 也使用多线程并行地进行垃圾清除，进一步提高垃圾收集的效率。

4. **可预测的停顿时间**：G1 GC 通过控制每次垃圾收集的区域数量，以及优先级队列来控制回收的顺序，从而达到更加可预测的停顿时间。

### JDK 9 中的并行完全 GC

在 JDK 9 中，G1 GC 也被称为“并行完全 GC”，这是因为它的并行处理能力得到了进一步的提升。

#### 1. 并行标记阶段的优化

- **并行标记开始**：在并行标记开始时，多个 GC 线程会同时扫描堆中的对象，并标记它们。
  
- **并行标记周期**：标记周期会多次进行，每次处理一部分对象，直到所有的对象都被标记。

#### 2. 并行清除阶段的优化

- **并行清除开始**：在并行清除阶段，多个 GC 线程会同时清除被标记为垃圾的对象。

- **并行清除完成**：清除完成后，堆空间会被重新整理，以便为后续的对象分配做好准备。

#### 3. 其他优化

- **控制并行度**：通过 JVM 参数，可以控制并行 GC 线程的数量，以适应不同的硬件和应用需求。

- **自适应 GC 线程**：G1 GC 还引入了自适应的 GC 线程调整机制，可以动态地调整 GC 线程的数量，以优化垃圾收集的性能。

### 总结

JDK 9 中的 G1 GC（并行完全 GC）通过进一步的并行优化，提高了垃圾收集的效率和性能。它通过并行标记和清除来减少停顿时间，同时提供了更高的吞吐量。新的优化和特性使得 G1 GC 更加适应现代应用程序的需求，特别是那些需要高吞吐量和可预测停顿时间的应用程序。这使得 G1 GC 成为 Java 平台上一个强大而高效的垃圾收集器选项。

##  jdk9 改进的安全性

JDK 9 在安全性方面进行了多项增强，这些改进主要集中在以下几个方面：

1. **模块化系统**：
   JDK 9 引入了模块系统（Jigsaw），它允许更细粒度的控制对 Java 运行时内部 API 的访问。这意味着可以更好地限制不安全或敏感的 API，从而提高整体安全性。

2. **改进的证书和密钥管理**：
   JDK 9 对证书和密钥管理进行了改进，包括对 PKCS#11（公钥加密标准#11）的支持，这使得与硬件安全模块（HSM）的集成更加容易。

3. **更强的加密算法**：
   JDK 9 增加了对一些新的加密算法的支持，并改进了现有算法的实现。这包括对 AES-GCM（高级加密标准 - Galois/Counter模式）的增强，以及对 ChaCha20 和 Poly1305 的支持。

4. **更新的安全协议**：
   JDK 9 更新了包括 TLS（传输层安全性协议）在内的多种安全协议的实现，以支持最新的协议版本和加密套件。

5. **默认的安全增强**：
   JDK 9 增强了默认的安全配置，例如禁用了一些已知不安全的 SSL/TLS 协议和密码套件。它还提供了更强的默认加密参数，例如，默认的 Diffie-Hellman（DH）密钥参数大小增加到 2048 位。

6. **安全相关的 API 改进**：
   JDK 9 对 java.security 包中的类和接口进行了改进，以提供更好的功能和性能。

7. **安全审计**：
   JDK 9 提供了更详细的安全审计日志，帮助开发人员和系统管理员监控和诊断安全相关的事件。

8. **对不安全配置的警告**：
   JDK 9 会在检测到不安全的配置或用法时提供警告，鼓励用户采用更安全的做法。

9. **Java Flight Recorder（JFR）的安全事件记录**：
   JDK 9 增强了 JFR，使其能够记录安全相关的事件，有助于监控和分析潜在的安全问题。

10. **Java 命令行工具的增强**：
    JDK 9 通过 JEP 222 增强了 Java 命令行工具，提供了更丰富的功能和更好的用户体验。

11. **移除不安全的 API**：
    JDK 9 开始弃用和移除一些不安全的 API，鼓励开发者使用更安全的方法替代。

12. **TLS 1.3 支持**：
    JDK 9 包含了对 TLS 1.3 的初步支持，这是 TLS 协议的最新版本，提供了更好的安全性和性能。

13. **SHA-3 哈希算法的实现**：
     JDK 9 新增了 4 个 SHA-3 哈希算法，增强了哈希函数的安全性。

这些改进共同提升了 JDK 9 的安全性，使其更加适合于需要高安全性环境的企业级应用。开发者可以利用这些新特性和改进，编写更安全、更可靠的 Java 应用程序。

##  jdk9 JShell：交互式编程环境

JShell 是 Java 9 引入的一个新特性，它是一个交互式的 Java 编程环境，允许开发者直接在命令行中编写和执行 Java 代码片段，无需创建或编译完整的 Java 程序。

JShell 为开发者提供了一个快速、轻量级的方式来测试代码、探索 API 和解决问题。以下是关于 JShell 的详细介绍：

### 1. 启动 JShell

要启动 JShell，只需在命令行中输入 `jshell` 命令，然后按 Enter 键即可。

这将打开一个 JShell 会话，您可以在其中输入和执行 Java 代码。

```bash
$ jshell
```

### 2. 基本用法

一旦 JShell 启动，您可以直接在命令行中输入 Java 代码片段，并立即看到执行结果。

```java
jshell> System.out.println("Hello, JShell!");
Hello, JShell!
```

### 3. 变量和表达式

您可以在 JShell 中定义变量并计算表达式，所有变量都是动态类型的。

```java
jshell> int x = 10;
x ==> 10

jshell> int y = 20;
y ==> 20

jshell> int sum = x + y;
sum ==> 30
```

### 4. 方法和类

除了基本的表达式和变量，您还可以定义方法和类，并在 JShell 中使用它们。

```java
jshell> void greet(String name) {
   ...>     System.out.println("Hello, " + name + "!");
   ...> }
|  created method greet(String)

jshell> greet("JShell");
Hello, JShell!
```

### 5. 导入和编辑

您可以使用 `import` 命令导入其他类或包，并使用 `/edit` 命令编辑以前输入的代码。

```java
jshell> import java.util.ArrayList;

jshell> ArrayList<String> list = new ArrayList<>();
list ==> []

jshell> /edit 1
```

### 6. 多行输入

对于多行代码，您可以使用 `{}` 括号来组织代码块。

```java
jshell> for (int i = 0; i < 5; i++) {
   ...>     System.out.println(i);
   ...> }
0
1
2
3
4
```

### 7. 保存和加载

JShell 允许您保存当前会话的状态到文件，并在需要时重新加载。

```java
jshell> /save mysession.jsh
```

```java
jshell> /open mysession.jsh
```

### 8. 命令帮助

您可以使用 `/help` 命令获取 JShell 的命令列表和帮助信息。

```java
jshell> /help
```

总结：JShell 是 Java 9 引入的一个有用的工具，它提供了一个快速、交互式的编程环境，使开发者可以方便地测试和探索 Java 代码。

JShell 的简单和直观的界面使得它成为学习 Java、尝试新 API 或解决编程问题的理想选择。







* any list
{:toc}