---
layout: post
title: java 变更日志-08-JDK8 
date:  2017-06-28 23:15:43 +0800
categories: [Java]
tags: [jdk, java]
published: true
---

# 拓展阅读

[Java Functional java 函数式编程](https://houbb.github.io/2017/06/29/java-functional)

[Java Lambda](https://houbb.github.io/2017/06/28/java-lambda)

# jdk8 有哪些新特性。

JDK 8 是 Java SE 平台的一个里程碑版本，引入了多项重要的新特性和改进。以下是 JDK 8 的主要新特性的概述：

1. **Lambda 表达式（JEP 126）**：引入了函数式编程的能力，使得 Java 可以更容易地编写简洁、高效的代码。

2. **Stream API（JEP 107）**：提供了一套全新的 Stream API，简化了集合操作和数据处理，支持函数式编程风格。

3. **新的日期和时间 API（JEP 150）**：引入了全新的日期和时间 API（java.time 包），提供了更好的日期和时间处理能力。

4. **默认方法（JEP 120）**：允许在接口中添加默认方法和静态方法，使得接口可以有更多的灵活性和功能性。

5. **方法引用（JEP 126）**：提供了一种新的语法，允许直接引用已有的方法或构造函数，简化了代码。

6. **新的 JavaScript 引擎（JEP 174）**：引入了 Nashorn JavaScript 引擎，使得 Java 可以更容易地与 JavaScript 交互。

7. **PermGen（永久代）的去除（JEP 122）**：移除了永久代内存区域，取而代之的是 Metaspace，提高了内存管理的效率。

8. **Parallel Array Sorting（JEP 103）**：提供了并行的数组排序能力，提高了数组排序的性能。

9. **Type Annotations（JEP 104）**：引入了类型注解，允许开发者在任何地方使用注解，增强了代码的可读性和可维护性。

10. **CompletableFuture API（JEP 155）**：提供了一个全新的 CompletableFuture 类，简化了异步编程和并发操作。

这些新特性不仅使得 Java 编程更加简洁和高效，还为开发者提供了更多的工具和选项，以满足各种应用程序的需求。

JDK 8 的发布标志着 Java 语言向更现代、更函数式的编程风格迈出了重要的一步。


# jdk8 Lambda 表达式（JEP 126）

JDK 8 引入的 Lambda 表达式（JEP 126）是这个版本中最重要和最引人注目的新特性之一。Lambda 表达式为 Java 引入了函数式编程的能力，这使得 Java 代码可以编写得更为简洁、灵活和易于理解。

### Lambda 表达式的基础

Lambda 表达式允许您定义简洁的匿名函数，并将其作为方法参数或变量值。Lambda 表达式基于数学中的 Lambda 演算，提供了一种紧凑的方法来表示匿名函数。

Lambda 表达式的语法如下：

```java
(parameters) -> expression
```

或

```java
(parameters) -> { statements; }
```

### Lambda 表达式的特性

1. **简洁性**：Lambda 表达式提供了一种简洁的语法来表示匿名函数，减少了冗余代码。

2. **函数式编程**：Lambda 表达式支持函数式编程风格，如函数组合、高阶函数和不可变性。

3. **局部变量**：Lambda 表达式可以访问外部的局部变量或成员变量，但这些变量必须是 final 或实际上的 final（即不可变）。

### Lambda 表达式的应用

#### 1. 集合操作

使用 Lambda 表达式可以更简洁地操作集合。例如：

```java
List<String> list = Arrays.asList("apple", "banana", "orange");
list.forEach(item -> System.out.println(item));
```

#### 2. 线程和并发

在多线程编程中，Lambda 表达式可以用来创建和启动线程：

```java
new Thread(() -> System.out.println("Hello from Lambda!")).start();
```

#### 3. 排序和过滤

Lambda 表达式可以与 Stream API 结合，实现复杂的数据处理操作：

```java
List<Integer> numbers = Arrays.asList(3, 1, 4, 1, 5, 9);
numbers.stream()
       .filter(n -> n > 3)
       .sorted()
       .forEach(System.out::println);
```

#### 4. GUI 事件处理

在图形用户界面（GUI）编程中，Lambda 表达式可以用来处理各种事件：

```java
button.setOnAction(event -> {
    System.out.println("Button clicked!");
});
```

### 注意事项

1. **变量访问**：Lambda 表达式可以访问外部的局部变量或成员变量，但这些变量必须是 final 或实际上的 final（即不可变）。

2. **类型推断**：在大多数情况下，编译器可以从上下文中推断 Lambda 表达式的参数类型，因此通常不需要显式指定类型。

3. **方法引用**：除了 Lambda 表达式外，JDK 8 还引入了方法引用（Method Reference），这提供了一种更简洁的方式来表示已有方法的引用。

总体而言，Lambda 表达式为 Java 引入了更为现代和灵活的编程风格，使得代码更为简洁、可读和可维护。它是 JDK 8 中的一个重大改进，极大地提高了 Java 编程的效率和表达能力。

# jdk8 Stream API（JEP 107）

JDK 8 引入的 Stream API（JEP 107）是 Java 集合框架的一个重大增强，它提供了一种高效且函数式的方法来处理数据集合。Stream API 允许开发者以声明式的方式处理数据，简化了集合的操作和数据处理。

### Stream 的基本概念

Stream 是 Java 8 中引入的一个新抽象，它允许你在集合上进行复杂的数据处理操作。Stream 不是一个数据结构，而是一个用于描述可计算元素序列的高阶概念。

### Stream 的特点

1. **不可变性**：Stream 不存储数据，它们仅仅描述了对数据的计算。
2. **惰性计算**：Stream 只有在终止操作（Terminal Operation）被调用时才执行计算。
3. **链式调用**：Stream 支持链式调用，使得代码更为紧凑和易读。

### Stream 的操作

Stream API 提供了两种基本类型的操作：

1. **中间操作（Intermediate Operations）**：这些操作允许你在数据集上进行一系列的转换和过滤，如 `filter()`, `map()`, `sorted()` 等。

2. **终止操作（Terminal Operations）**：这些操作触发 Stream 的计算并生成结果，如 `forEach()`, `collect()`, `reduce()` 等。

### 示例

#### 1. 筛选操作

```java
List<String> list = Arrays.asList("apple", "banana", "orange", "grape", "melon");

list.stream()
    .filter(fruit -> fruit.startsWith("a"))
    .forEach(System.out::println);
```

#### 2. 转换操作

```java
List<Integer> numbers = Arrays.asList(1, 2, 3, 4, 5);

List<Integer> squaredNumbers = numbers.stream()
                                     .map(n -> n * n)
                                     .collect(Collectors.toList());
```

#### 3. 排序操作

```java
List<String> names = Arrays.asList("John", "Alice", "Bob", "David");

List<String> sortedNames = names.stream()
                                .sorted()
                                .collect(Collectors.toList());
```

#### 4. 聚合操作

```java
List<Integer> numbers = Arrays.asList(1, 2, 3, 4, 5);

int sum = numbers.stream()
                 .reduce(0, Integer::sum);
```

### 使用注意事项

1. **惰性执行**：Stream 操作通常是惰性执行的，除非遇到终止操作，否则中间操作不会触发任何计算。

2. **只能使用一次**：一旦 Stream 被消费（例如通过终止操作），它就不能再被使用。

3. **状态**：由于 Stream 是惰性的，它不会修改底层数据集，也不会保存状态。

Stream API 提供了一种新的、更加高效和简洁的方式来处理集合数据，使得数据处理操作变得更为直观和易于维护。它是 JDK 8 中引入的一项重大改进，极大地提高了 Java 集合框架的功能性和表达能力。


# jdk8 默认方法（JEP 120）

JDK 8 引入的默认方法（Default Methods，JEP 120）是为了支持接口的逐步演进，特别是在 Java 8 之后引入的 lambda 表达式和函数式编程特性的背景下。默认方法允许在接口中定义具有默认实现的方法，这使得接口可以有更多的灵活性和可扩展性，同时也方便了现有的接口与新的特性的结合。

### 默认方法的特点

1. **默认实现**：接口中的默认方法有一个默认实现，这意味着实现该接口的类不需要实现这个方法。
2. **兼容性**：默认方法允许接口在不破坏现有实现的前提下添加新的方法。
3. **多重继承**：接口现在支持多重继承，因为一个类可以实现多个接口，这些接口可能有相同的默认方法。

### 示例

#### 1. 基本示例

```java
public interface Vehicle {
    default void drive() {
        System.out.println("Vehicle is driving");
    }
}

public class Car implements Vehicle {
    // 不需要实现 drive 方法，因为它已经在 Vehicle 接口中有了默认实现
}

public class Main {
    public static void main(String[] args) {
        Car car = new Car();
        car.drive();  // 输出：Vehicle is driving
    }
}
```

#### 2. 多重继承

```java
public interface FourWheeler {
    default void drive() {
        System.out.println("FourWheeler is driving");
    }
}

public class Car implements Vehicle, FourWheeler {
    // 不需要实现 drive 方法，因为它已经在 Vehicle 和 FourWheeler 接口中有了默认实现
}

public class Main {
    public static void main(String[] args) {
        Car car = new Car();
        car.drive();  // 输出：Vehicle is driving
                      // 如果 Car 类中没有覆盖 drive 方法，它将调用 Vehicle 接口的默认实现
    }
}
```

#### 3. 覆盖默认方法

如果一个类实现了多个接口，且这些接口都有相同的默认方法，那么必须在类中覆盖这个默认方法。

```java
public class Car implements Vehicle, FourWheeler {
    @Override
    public void drive() {
        System.out.println("Car is driving");
    }
}

public class Main {
    public static void main(String[] args) {
        Car car = new Car();
        car.drive();  // 输出：Car is driving
    }
}
```

### 注意事项

1. **冲突解决**：如果一个类实现了两个接口，而这两个接口都有相同的默认方法，那么类必须覆盖这个默认方法来解决冲突。
2. **不可用于 Object 类方法**：默认方法不能重写 `java.lang.Object` 类中的方法。

### 应用场景

1. **接口的逐步演进**：允许在已有接口中添加新的方法，而不会破坏现有的实现。
2. **库和框架的向后兼容性**：允许库和框架在不改变 API 签名的情况下添加新的方法。

默认方法是 JDK 8 中一个非常重要的特性，它为 Java 8 提供了一种方法来支持现代编程风格和更复杂的接口设计，同时也保持了与之前版本的向后兼容性。这一特性为 Java 8 带来了更大的灵活性和可维护性。

# jdk8 方法引用（JEP 126）

JDK 8 引入的方法引用（Method References，JEP 126）提供了一种简洁的语法来引用已经存在的方法，使得代码更为简洁和易读。方法引用允许你在不使用 lambda 表达式的情况下，直接通过方法的名称来引用该方法，从而简化代码并提高可读性。

### 方法引用的类型

在 JDK 8 中，方法引用主要分为以下几种类型：

1. **静态方法引用**：引用静态方法。
2. **实例方法引用**：引用特定对象的实例方法。
3. **构造方法引用**：引用构造方法，创建对象。

### 示例

#### 1. 静态方法引用

假设有一个静态方法 `Integer.parseInt`，可以使用方法引用来引用这个方法。

```java
// Lambda 表达式
Function<String, Integer> lambdaFunction = s -> Integer.parseInt(s);

// 方法引用
Function<String, Integer> methodReference = Integer::parseInt;
```

#### 2. 实例方法引用

假设有一个实例方法 `String.length()`，可以使用方法引用来引用该方法。

```java
// Lambda 表达式
Function<String, Integer> lambdaFunction = s -> s.length();

// 方法引用
Function<String, Integer> methodReference = String::length;
```

#### 3. 构造方法引用

假设有一个构造方法 `ArrayList()`，可以使用方法引用来引用该构造方法。

```java
// Lambda 表达式
Supplier<List<String>> lambdaSupplier = () -> new ArrayList<>();

// 方法引用
Supplier<List<String>> methodReference = ArrayList::new;
```

### 注意事项

1. **方法签名**：方法引用的目标方法必须与函数接口中的抽象方法具有相同的参数列表和返回类型（对于实例方法引用，第一个参数类型是隐式的，除非使用特定对象引用）。
2. **上下文类型推断**：编译器会根据上下文来推断方法引用的类型，这使得方法引用的使用更为灵活。
3. **代码清晰度**：方法引用可以使代码更加简洁和清晰，特别是当你需要引用已有方法时。

### 应用场景

1. **集合操作**：如排序、过滤等。
2. **函数式接口**：如 `java.util.function` 包中定义的函数式接口。
3. **构造对象**：使用构造方法引用来创建对象。

方法引用是 JDK 8 函数式编程特性的一个关键部分，它提供了一种简洁和直观的方式来引用现有的方法，从而使得函数式编程在 Java 中变得更为强大和易用。

它大大提高了代码的可读性和可维护性，特别是在处理复杂的函数式编程任务时。

# jdk8 新的日期和时间 API（JEP 150）

JDK 8 引入的新的日期和时间 API（JEP 150）是对旧的 `java.util.Date` 和 `java.util.Calendar` 类的改进和替代，旨在提供更为灵活、易用和线程安全的日期和时间处理能力。这个新的日期和时间 API 位于 `java.time` 包中，基于 JSR 310 规范，也就是 Java 社区的 Joda-Time 库的一个改编。

### 主要组件

新的日期和时间 API 主要由以下几个核心组件组成：

1. **LocalDate**：表示一个日期（不带时间和时区信息）。
2. **LocalTime**：表示一个时间（不带日期和时区信息）。
3. **LocalDateTime**：表示日期和时间（不带时区信息）。
4. **ZonedDateTime**：表示完整的日期和时间（包含时区信息）。
5. **Duration** 和 **Period**：分别表示时间段和日期段。
6. **DateTimeFormatter**：用于日期和时间的格式化和解析。

### 示例

#### 1. 创建和使用 LocalDate、LocalTime 和 LocalDateTime

```java
// 创建 LocalDate
LocalDate date = LocalDate.now();
System.out.println("Today's date: " + date);  // 例如：Today's date: 2022-04-25

// 创建 LocalTime
LocalTime time = LocalTime.now();
System.out.println("Current time: " + time);  // 例如：Current time: 15:30:45.123456789

// 创建 LocalDateTime
LocalDateTime dateTime = LocalDateTime.now();
System.out.println("Current date and time: " + dateTime);  // 例如：Current date and time: 2022-04-25T15:30:45.123456789
```

#### 2. 操作和计算日期

```java
LocalDate tomorrow = LocalDate.now().plusDays(1);
System.out.println("Tomorrow's date: " + tomorrow);  // 例如：Tomorrow's date: 2022-04-26

LocalDateTime nextHour = LocalDateTime.now().plusHours(1);
System.out.println("Next hour: " + nextHour);  // 例如：Next hour: 2022-04-25T16:30:45.123456789
```

#### 3. 格式化和解析日期

```java
DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");
String formattedDateTime = LocalDateTime.now().format(formatter);
System.out.println("Formatted date and time: " + formattedDateTime);  // 例如：Formatted date and time: 2022-04-25 15:30:45
```

#### 4. 时区处理

```java
ZoneId newYorkZone = ZoneId.of("America/New_York");
ZonedDateTime newYorkTime = ZonedDateTime.now(newYorkZone);
System.out.println("New York time: " + newYorkTime);  // 例如：New York time: 2022-04-25T15:30:45.123456789-04:00[America/New_York]
```

### 注意事项

1. **不可变性**：所有的日期和时间对象都是不可变的，任何修改操作都会返回一个新的对象。
2. **线程安全**：所有的日期和时间对象都是线程安全的，可以安全地在多线程环境中使用。
3. **清晰和简洁**：新的 API 设计更加清晰和简洁，避免了旧 API 中的许多问题和陷阱。

这个新的日期和时间 API 提供了一种现代化和更易用的方式来处理日期和时间，大大提高了 Java 在这方面的功能和效率，同时也减少了开发人员在处理日期和时间时遇到的问题。

它是 JDK 8 中一个非常受欢迎的特性，得到了广大开发者的认可和使用。


# jdk8 新的 JavaScript 引擎（JEP 174）

JDK 8 引入了一个新的 JavaScript 引擎 Nashorn（JEP 174），它是一个轻量级、高性能的 JavaScript 引擎，专为 Java 平台设计。Nashorn 是 JDK 8 中替代 Rhino 引擎的新一代 JavaScript 引擎，它提供了更好的性能、更高的兼容性和更广泛的 JavaScript 标准支持。

### Nashorn 的特点

1. **高性能**：Nashorn 通过直接将 JavaScript 代码编译成字节码来实现高性能执行，与传统的解释执行相比，它可以显著提高执行速度。

2. **兼容性**：Nashorn 提供了更广泛的 ECMAScript 5.1 标准支持，这意味着它可以更好地执行现代 JavaScript 应用程序。

3. **紧密集成**：Nashorn 可以无缝地集成到 Java 应用程序中，允许 Java 和 JavaScript 代码之间的互操作性。

4. **命令行工具**：Nashorn 提供了一个命令行工具 `jjs`，允许用户直接执行 JavaScript 脚本或与 Java 交互。

### 使用 Nashorn

#### 1. 执行 JavaScript

你可以使用 `jjs` 命令来直接执行 JavaScript 脚本。

```bash
$ jjs myscript.js
```

#### 2. Java 和 JavaScript 交互

Nashorn 允许你在 Java 代码中直接调用 JavaScript 函数和对象。

```java
import javax.script.ScriptEngine;
import javax.script.ScriptEngineManager;
import javax.script.ScriptException;

public class NashornExample {
    public static void main(String[] args) throws ScriptException {
        ScriptEngineManager manager = new ScriptEngineManager();
        ScriptEngine engine = manager.getEngineByName("nashorn");

        // 执行 JavaScript 代码
        engine.eval("print('Hello Nashorn!')");

        // 调用 JavaScript 函数
        engine.eval("function add(a, b) { return a + b; }");
        Double result = (Double) engine.eval("add(10, 20);");
        System.out.println("Result: " + result);
    }
}
```

#### 3. 嵌入式脚本

你也可以在 Java 代码中嵌入 JavaScript 脚本。

```java
import javax.script.ScriptEngine;
import javax.script.ScriptEngineManager;
import javax.script.ScriptException;

public class NashornEmbedExample {
    public static void main(String[] args) throws ScriptException {
        ScriptEngineManager manager = new ScriptEngineManager();
        ScriptEngine engine = manager.getEngineByName("nashorn");

        String script = "var greeting = 'Hello';" +
                        "var name = 'Nashorn';" +
                        "print(greeting + ', ' + name + '!');";

        engine.eval(script);
    }
}
```

### 性能比较

与 Rhino 相比，Nashorn 在执行一些 JavaScript 任务时通常会提供更好的性能。这主要归因于 Nashorn 的字节码生成和优化技术，它能够将 JavaScript 代码编译成更高效的字节码。

### 总结

Nashorn 是 JDK 8 中一个重要的增强特性，它提供了一个高性能、兼容性强、易于集成的 JavaScript 引擎，使得 Java 平台更加适合于开发和运行现代 JavaScript 应用程序。

通过 Nashorn，开发者可以更灵活地在 Java 应用程序中使用 JavaScript，从而实现更高效、更灵活的编程和互操作性。

# jdk8 PermGen（永久代）的去除（JEP 122）

在 JDK 8 中，JVM（Java 虚拟机）对内存模型进行了一些重大的改进，其中最显著的是移除了永久代（PermGen）。这一改变是通过 JEP（JDK Enhancement-Proposal）122 实现的，它的主要目标是解决永久代在 JVM 内存管理中可能导致的一系列问题和限制。

### PermGen（永久代）的问题

永久代是 JDK 7 及之前版本中的一个内存区域，用于存储类元数据（Class Metadata）、常量池、静态变量等。然而，永久代的管理和维护经常会遇到以下问题：

1. **内存泄漏**：在某些情况下，因为类加载器的生命周期和类的卸载策略，可能会导致永久代内存泄漏。
  
2. **性能问题**：频繁的 Full GC（全垃圾回收）会导致应用程序的停顿时间增加，这在永久代中尤为明显。
  
3. **固定内存大小**：永久代的大小是固定的，并且不容易调整，这可能会导致内存不足或浪费。

### Metaspace（元空间）的引入

为了解决永久代的这些问题，JDK 8 引入了一个新的内存区域称为 Metaspace（元空间）。Metaspace 是一块由 JVM 管理的本地内存，用于存储类元数据。与永久代不同，Metaspace 的大小是动态的，可以根据应用程序的需求进行扩展或收缩。

#### 主要特点：

1. **自适应大小**：Metaspace 的大小可以根据应用程序的需求进行动态调整，不再受限于永久代的固定大小。

2. **垃圾回收**：与永久代不同，Metaspace 会自动进行垃圾回收，当类不再被引用时，它们的内存会被释放。

3. **性能改进**：Metaspace 的管理和垃圾回收机制都经过优化，可以减少 Full GC 的频率，从而提高应用程序的性能。

### 使用 Metaspace

默认情况下，Metaspace 的大小是没有限制的，但你可以通过 JVM 参数来设置 Metaspace 的最大大小：

```bash
-XX:MaxMetaspaceSize=256m
```

这里，`-XX:MaxMetaspaceSize` 参数指定了 Metaspace 的最大大小为 256MB。

### 总结

通过移除永久代并引入 Metaspace，JDK 8 显著改进了 JVM 的内存管理和性能。Metaspace 提供了一个更加灵活、高效的方式来管理类元数据，避免了永久代中常见的内存问题和限制，从而使 Java 应用程序在内存管理方面更加健壮和可靠。这一改变是 JDK 8 内存模型重大改进的一部分，为 Java 应用程序提供了更高的性能和可伸缩性。

# jdk8 Parallel Array Sorting（JEP 103）

JDK 8 引入了一个名为 Parallel Array Sorting 的特性（JEP 103），它旨在提供一种高效的、可并行执行的数组排序方法，以便更有效地利用多核 CPU 的性能优势。在 JDK 8 之前，Java 提供的 `Arrays.sort()` 方法使用的是单线程进行排序，而 Parallel Array Sorting 允许排序任务在多个线程上并行执行，从而提高排序速度。

### Parallel Array Sorting 的特点

1. **并行执行**：Parallel Array Sorting 允许排序任务在多个线程上并行执行，利用多核 CPU 的性能优势，从而加速排序过程。

2. **工作分割**：在排序过程中，数组会被分割成多个小块，每个小块都在独立的线程上进行排序。一旦每个小块排序完成，它们将会被合并成一个有序的大数组。

3. **适应性**：Parallel Array Sorting 是自适应的，它会根据输入数据的大小和系统的可用 CPU 核心数来动态调整并行度，以实现最佳的性能。

4. **易于使用**：与传统的 `Arrays.sort()` 方法相比，使用 Parallel Array Sorting 并不需要开发者进行复杂的并行编程，因为所有的并行细节都是在底层自动处理的。

### 使用 Parallel Array Sorting

使用 Parallel Array Sorting 非常简单，你只需像使用传统的 `Arrays.sort()` 方法一样调用 `Arrays.parallelSort()` 方法即可。

```java
import java.util.Arrays;

public class ParallelArraySortingExample {
    public static void main(String[] args) {
        int[] arr = {9, 5, 8, 2, 1, 7, 3, 6, 4};

        // 使用 Parallel Array Sorting 进行排序
        Arrays.parallelSort(arr);

        // 打印排序后的数组
        System.out.println(Arrays.toString(arr));
    }
}
```

在上面的例子中，我们使用 `Arrays.parallelSort()` 方法对一个整数数组进行排序。这个方法会自动使用适当数量的线程来并行执行排序任务，从而提高排序速度。

### 性能考虑

尽管 Parallel Array Sorting 可以显著提高排序速度，但它并不总是比传统的 `Arrays.sort()` 方法更快。并行排序需要额外的线程管理和数据同步开销，这可能会在数据量较小或系统资源有限的情况下影响性能。因此，在使用 Parallel Array Sorting 时，应该根据实际情况进行性能测试，并根据测试结果来决定是否使用该特性。

### 总结

JDK 8 的 Parallel Array Sorting（JEP 103）是一个重要的性能优化特性，它为 Java 应用程序提供了一种高效的、可并行执行的数组排序方法。

通过并行化排序任务，Parallel Array Sorting 能够充分利用多核 CPU 的性能优势，从而显著提高排序速度。

然而，开发者在使用该特性时应注意性能考虑，并根据实际情况进行适当的优化和调整。

# jdk8 Type Annotations（JEP 104）

在 JDK 8 中，通过 JEP 104 引入了类型注解（Type Annotations）的概念，这是 Java 语言增强的一部分，旨在增强 Java 的类型系统，使得注解不仅可以用于声明、字段、方法等，还可以用于类型使用场景，如变量声明、类型转换、类型参数等。

### 什么是类型注解？

类型注解允许开发者在类型使用场景添加注解，这使得注解能够更加精确地应用于代码，并提供了一种强大的方式来描述和验证代码的行为。通过类型注解，开发者可以在编译时进行更多的类型检查和验证，从而提高代码的可读性、可维护性和安全性。

### 主要特点

1. **精确性**：类型注解可以应用于更具体的类型使用场景，如局部变量、lambda 表达式、类型转换等，从而提供更精确的信息和约束。

2. **可扩展性**：类型注解提供了一种扩展 Java 类型系统的机制，使得开发者可以定义自己的注解类型，并在需要的地方应用它们。

3. **代码清晰**：通过在类型使用场景添加注解，代码的意图和约束可以更加清晰地表达，从而提高代码的可读性和可维护性。

### 使用示例

#### 基本类型注解

```java
import java.lang.annotation.ElementType;
import java.lang.annotation.Target;

@Target(ElementType.TYPE_USE)
@interface NonEmpty {
}

public class TypeAnnotationsExample {

    public static void main(String[] args) {
        @NonEmpty String name = "Java";
        System.out.println(name);
    }
}
```

在上面的示例中，我们定义了一个名为 `NonEmpty` 的注解，并将其标记为 `ElementType.TYPE_USE`，这意味着它可以应用于任何类型使用场景。然后，我们在一个字符串变量 `name` 的声明处使用了这个注解。

#### 使用在更具体的类型场景

```java
import java.util.List;
import java.util.ArrayList;

public class TypeAnnotationsExample {

    public static void main(String[] args) {
        List<@NonEmpty String> names = new ArrayList<>();
        names.add("Java");
        names.add(""); // 编译时错误，因为 @NonEmpty 注解要求字符串不能为空
    }
}
```

在这个示例中，我们将 `@NonEmpty` 注解应用于 `List` 的类型参数，这意味着列表中的所有字符串都必须非空。如果尝试添加一个空字符串，编译器将会报错。

### 总结

JDK 8 的类型注解（Type Annotations，JEP 104）为 Java 增加了一个强大的类型系统增强特性。通过类型注解，开发者可以在更具体的类型使用场景上添加注解，从而提供更精确的类型检查和验证，增强代码的可读性、可维护性和安全性。这一特性为 Java 语言提供了更高的灵活性和表达能力，使得注解在类型系统中的应用更加丰富和广泛。

# jdk8 CompletableFuture API（JEP 155）

`CompletableFuture` API 是 JDK 8 引入的一个重要特性，旨在简化异步编程和并发编程。`CompletableFuture` 提供了一种灵活、强大的方式来处理异步计算结果，允许你以函数式编程的风格编写异步代码，而无需显式地管理线程和同步。

### 主要特点

1. **异步执行**：`CompletableFuture` 支持异步执行任务，允许你在一个或多个线程上并行地执行异步操作。

2. **组合和转换**：`CompletableFuture` 提供了一系列方法，如 `thenApply`, `thenAccept`, `thenCompose` 等，允许你组合、转换和处理异步计算结果。

3. **异常处理**：`CompletableFuture` 提供了异常处理机制，允许你在异步计算过程中捕获和处理异常。

4. **超时和阻塞**：`CompletableFuture` 允许你设置超时时间，并提供了一些方法来阻塞等待异步计算的完成。

### 使用示例

#### 基本异步任务

```java
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.ExecutionException;

public class CompletableFutureExample {

    public static void main(String[] args) throws ExecutionException, InterruptedException {
        // 创建一个异步任务
        CompletableFuture<String> future = CompletableFuture.supplyAsync(() -> {
            try {
                Thread.sleep(1000); // 模拟耗时操作
            } catch (InterruptedException e) {
                e.printStackTrace();
            }
            return "Hello, CompletableFuture!";
        });

        // 等待异步任务完成并获取结果
        String result = future.get();
        System.out.println(result);
    }
}
```

在上面的示例中，我们使用 `CompletableFuture.supplyAsync` 方法创建了一个异步任务，该任务会在一个新的线程上执行，并返回一个字符串 "Hello, CompletableFuture!"。然后，我们使用 `future.get()` 方法等待异步任务完成，并获取其结果。

#### 组合多个异步任务

```java
import java.util.concurrent.CompletableFuture;

public class CompletableFutureExample {

    public static void main(String[] args) throws Exception {
        CompletableFuture<String> future1 = CompletableFuture.supplyAsync(() -> "Hello");
        CompletableFuture<String> future2 = CompletableFuture.supplyAsync(() -> "CompletableFuture");

        CompletableFuture<String> combinedFuture = future1.thenCombine(future2, (result1, result2) -> result1 + " " + result2);

        System.out.println(combinedFuture.get());
    }
}
```

在这个示例中，我们创建了两个独立的异步任务 `future1` 和 `future2`，然后使用 `thenCombine` 方法组合这两个任务的结果，返回一个新的 `CompletableFuture` 对象 `combinedFuture`。

### 总结

`CompletableFuture` API 是 JDK 8 提供的一个强大的并发编程工具，它简化了异步编程的复杂性，允许你以更加直观和函数式的方式编写并发代码。通过 `CompletableFuture`，你可以轻松地创建、组合和转换异步任务，处理异常，设置超时等，从而更高效地利用多核 CPU，提高应用程序的性能和响应性。

# 总结一下 jdk8 的变化

JDK 8 是 Java 语言历史上一个里程碑式的版本，引入了许多重要的特性和改进，大大提升了 Java 的功能性、灵活性和表达能力。

以下是 JDK 8 主要的变化和特性：

1. **Lambda 表达式（JEP 126）**：引入了函数式编程特性，使得代码更为简洁、清晰。

2. **Stream API（JEP 107）**：提供了一套流式操作 API，简化了集合和数组的数据处理和操作。

3. **新的日期和时间 API（JEP 150）**：提供了全新的日期和时间处理 API，解决了旧 `Date` 和 `Calendar` 类的许多问题。

4. **默认方法（JEP 120）**：允许接口中包含具有默认实现的方法，这使得接口的演进更为灵活。

5. **方法引用（JEP 126）**：提供了方法引用的语法，简化了函数式接口的实现。

6. **新的 JavaScript 引擎（JEP 174）**：引入了 Nashorn JavaScript 引擎，提供了在 JVM 上运行 JavaScript 的能力。

7. **永久代（PermGen）的去除（JEP 122）**：移除了永久代（PermGen），并引入了 Metaspace，改善了类和元数据的存储。

8. **并行数组排序（JEP 103）**：提供了并行的数组排序功能，增加了排序效率。

9. **类型注解（JEP 104）**：增强了类型系统，允许在类型使用场景添加注解，提高了代码的可读性和安全性。

10. **CompletableFuture API（JEP 155）**：引入了 `CompletableFuture`，简化了异步编程和并发编程。

这些特性和改进大大提高了 Java 的编程效率和代码质量，使得 Java 语言在现代软件开发中仍然保持着强大的竞争力。

JDK 8 的发布标志着 Java 语言从面向对象编程向更加现代、多范式的编程语言转变的重要一步。

------------------------------------------------------------------------------------------------------------------------

# jdk8

当然，JDK 8 是 Java 平台的一个里程碑版本，引入了许多重要的新特性和改进。

以下是 JDK 8 中的一些主要新特性：

1. **Lambda 表达式**：Lambda 表达式是 JDK 8 中引入的一个核心特性，它提供了一种更简洁的语法来表示匿名函数。Lambda 表达式可以使代码更加简洁和可读，特别是在集合操作和函数式编程中。

   ```java
   // 使用 Lambda 表达式来替代匿名内部类
   List<String> list = Arrays.asList("apple", "banana", "orange");
   list.forEach(item -> System.out.println(item));
   ```

2. **Stream API**：Stream API 提供了一种新的抽象来处理集合数据。它使得开发者可以轻松地进行复杂的数据操作，如过滤、映射、排序等，而无需编写冗长的代码。

   ```java
   // 使用 Stream API 进行数据过滤和映射
   List<String> filteredList = list.stream()
                                   .filter(item -> item.startsWith("a"))
                                   .map(String::toUpperCase)
                                   .collect(Collectors.toList());
   ```

3. **接口的默认方法和静态方法**：JDK 8 允许在接口中定义默认方法和静态方法，这使得接口可以有一些实现，而不仅仅是抽象方法。

   ```java
   public interface MyInterface {
       default void defaultMethod() {
           System.out.println("Default method");
       }
       
       static void staticMethod() {
           System.out.println("Static method");
       }
   }
   ```

4. **新的日期和时间 API**：JDK 8 引入了一个全新的日期和时间 API，提供了更加灵活和强大的日期和时间处理能力。

   ```java
   LocalDate today = LocalDate.now();
   LocalTime now = LocalTime.now();
   LocalDateTime dateTime = LocalDateTime.now();
   ```

5. **Optional 类**：Optional 是一个容器对象，用于包装可能为 null 的值。它鼓励开发者更加注意处理 null 值，从而减少空指针异常的风险。

   ```java
   Optional<String> optional = Optional.ofNullable(null);
   String value = optional.orElse("default");
   ```

6. **新的 JavaScript 引擎 Nashorn**：JDK 8 引入了 Nashorn，一个基于 JVM 的新的 JavaScript 引擎，使得 Java 和 JavaScript 之间的交互更加容易。

7. **并行数组操作**：JDK 8 提供了新的方法来支持并行数组操作，可以提高数组处理的效率。

   ```java
   Arrays.parallelSort(array);
   ```

这些只是 JDK 8 中的一些主要新特性，还有其他许多小的改进和优化，这些新特性都为 Java 开发者提供了更加强大和灵活的工具。

# 官方笔记

https://www.oracle.com/java/technologies/javase/8all-relnotes.html

https://www.oracle.com/java/technologies/javase/8-whats-new.html

### Java编程语言

**Lambda表达式**  
在此版本中引入了Lambda表达式作为新的语言特性。它们使你能够将功能性视为方法参数，或将代码视为数据。Lambda表达式让你更紧凑地表示单方法接口（称为功能性接口）的实例。

**方法引用**  
为已有名称的方法提供了易于阅读的Lambda表达式。

**默认方法**  
允许在库的接口中添加新功能，并确保与旧版本的代码二进制兼容性。

**重复注解**  
提供了将同一注解类型应用到同一声明或类型使用上的能力。

**类型注解**  
允许在任何使用类型的地方应用注解，而不仅仅是在声明上。与可插拔类型系统一起使用，此功能可以改进代码的类型检查。

**改进的类型推断**  
**方法参数反射**

### 集合

**流API**  
新的`java.util.stream`包中的类提供了流API，支持对元素流进行功能性操作。流API集成到集合API中，使得可以对集合进行批量操作，如顺序或并行的映射-归约转换。

**HashMap性能改进**  
处理键冲突时的性能改进。

**紧凑配置文件**  
包含Java SE平台的预定义子集，使得不需要整个平台的应用程序可以在小型设备上部署和运行。

### 安全性

**默认启用客户端TLS 1.2**  
**AccessController.doPrivileged的新变体**  
**更强的基于密码的加密算法**  
**SSL/TLS Server Name Indication (SNI)扩展支持**  
**AEAD算法支持**  
**KeyStore增强**  
**SHA-224消息摘要**  
**增强的NSA Suite B加密支持**  
**更好的高熵随机数生成支持**  
**新的PKIXRevocationChecker类**  
**64位Windows的PKCS11**  
**Kerberos 5回放缓存中的新rcache类型**  
**Kerberos 5协议过渡和有限委派支持**  
**Kerberos 5弱加密类型默认禁用**  
**GSS-API/Kerberos 5机制的无绑定SASL**  
**多个主机名的SASL服务**  
**Mac OS X上的JNI桥接到本地JGSS**  
**在SunJSSE提供程序中支持更强的强度临时DH密钥**  
**JSSE中服务器端密码套件偏好自定义的支持**

### JavaFX

**新的Modena主题**  
**SwingNode类**  
**新的UI控件**  
**打印API**  
**3D图形功能**  
**WebView类的新特性和改进**  
**增强的文本支持**  
**支持Hi-DPI显示**  
**CSS Styleable*类已成为公共API**  
**新的ScheduledService类**  
**JavaFX现在适用于ARM平台**

### 工具

**jjs命令**  
**java命令**  
**java手册页重做**  
**jdeps命令行工具**  
**Java管理扩展（JMX）**  
**jarsigner工具**  

### Javac工具

**javac命令的-parameters选项**  
**javac命令的类型规则**  
**检查javadoc注释的内容**  
**生成本机头文件的能力**

### Javadoc工具

**支持新的DocTree API**  
**支持新的Javadoc Access API**  
**检查javadoc注释的内容**

### 国际化

**Unicode增强**  
**采用Unicode CLDR数据和java.locale.providers系统属性**  
**新的Calendar和Locale API**  
**能够安装自定义资源包作为扩展**

### 部署

**使用URLPermission允许连接回服务器**  
**JAR文件清单中的权限属性是必需的**  
**新的Date-Time包**

### 脚本

**Rhino JavaScript引擎已被Nashorn JavaScript引擎替换**

### Pack200

**Pack200支持常量池条目和JSR 292引入的新字节码**

### JDK8支持

**IO和NIO**

**java.lang和java.util包**

**JDBC**

**Java DB**

**网络**

**并发**

**Java XML - JAXP**

### HotSpot

**硬件内在增强**  
**PermGen的移除**  
**默认方法在Java编程语言中的支持**

### Java Mission Control 5.3发布说明

**JDK 8包括Java Mission Control 5.3**


* any list
{:toc}