---
layout: post
title: JDK10 新特性详解，2018-03-20正式发布
date:  2019-2-27 15:48:49 +0800
categories: [Java]
tags: [java, sh]
published: true
---

# java 10 新特性

Java10是Java版本23年历史上最快的版本。Java因其缓慢的增长和进化而受到批评，但Java10打破了这一概念。

Java10是一个具有许多未来变化的版本，其范围和影响可能并不明显，但却很牵强。

在本文中，我们将讨论Java10发行版中添加的各种特性。


# java 发布模型

在此之前，让我们回顾一下java发布模型中引入的一些更改。

## 长期支持模式

从2017年开始，Oracle&Java社区宣布将向为期6个月的Java新节奏转变。

它转向了oracle javase产品的长期支持（LTS）模型。

LTS版本的产品将提供甲骨文卓越和持续的支持，并将每3年瞄准一次。

每个Java发行版都是以一个或两个主要特性为模型的，这些特性驱动发行版。任何障碍都会推迟发布和推迟上市。Jigsaw项目是Java9的一个主要特性，它将发布日期推迟了几次，发布时间推迟了1.5年以上。

6个月的cadence发布将遵循发布序列。放行列车每6个月有一个时间表。

使切口上车的特征；否则它们等待下一列预定的火车。

## Oracle JDK与Open JDK之比较

为了对开发人员更加友好，Oracle&Java社区现在将OpenJDK作为主要JDK来推广。

这与早些时候相比是一个很大的解脱，当时JDK是适当的，并由Oracle授权，Oracle对重新分发有各种限制。

不过，Oracle将继续生产JDK，但只针对长期支持版本。这是朝着更加云和容器友好的方向发展，因为开放的JDK库可以作为容器的一部分分发。

openjdk将每6个月发布一次，而Oracle JDK将每3年发布一次（LTS版本）。

## 将采用哪些JDK？

大型组织需要时间在不同的版本之间移动；他们会紧紧抓住版本直到他们能做到为止。

行业对Java6的采用超过了Java7，然后行业逐渐转向Java8。在我看来，LTS版本将是最受企业青睐的。

然而，究竟是oraclejdk的LTS版本还是openjdk还不清楚，部分原因是云计算领域正在进行大量工作。

Java9和Java10是非LTS版本。定于2018年9月发布的Java11将是LTS版本。

# Java10功能

让我们来看看Java10中可用的特性。

## 基于时间的版本控制（JEP 322）

随着基于时间的发布周期的采用，Oracle改变了javase平台和JDK的版本字符串方案，以及相关的版本控制信息，用于当前和未来基于时间的发布模型。

版本号的新模式是：

```
`$FEATURE.$INTERIM.$UPDATE.$PATCH`
```

$FEATURE:counter将每6个月递增一次，并且将基于功能发布版本，例如：JDK 10、JDK 11。

$INTERIM: counter 对于包含兼容的错误修复和增强但没有不兼容更改的非功能版本，计数器将增加。通常，这将是零，因为六个月内不会有临时发布。这是为了将来对发布模型进行修订而保留的。

$UPDATE:counter对于修复新特性中的安全问题、退化和bug的兼容更新版本将增加。此功能发布后一个月更新，以后每3个月更新一次。2018年4月的版本是JDK10.0.1，7月的版本是JDK10.0.2，以此类推

$PATCH:counter将在紧急版本中增加，以修复关键问题。

添加了新的API以编程方式获取这些计数器值。让我们看看；

```
`Version version = Runtime.version();`

`version.feature();`

`version.interim();`

`version.update();`

`version.patch();`
```

现在，让我们看看返回版本信息的Java launcher：

```
`$ java -version`

`java version` `"10"` `2018``-``03``-``20`

`Java(TM) SE Runtime Environment` `18.3` `(build` `10``+``46``)`

`Java HotSpot(TM)` `64``-Bit Server VM` `18.3` `(build` `10``+``46``, mixed mode)`
```

版本号格式是“10”，因为除了0之外没有其他计数器。添加发布日期。18.3可以理解为2018年和第3个月，版本10+46是版本10的第46个版本。对于JDK10.0.1的假设构建93，构建将是10.0.1+93

## 局部变量类型推断（JEP 286）

局部变量类型推断是Java10中为开发人员提供的最大的新特性。它将类型推断添加到带有初始值设定项的局部变量声明中。

局部类型推断只能在以下情况下使用：

1. 仅限于具有初始值设定项的局部变量

2. 增强for循环的索引

3. 在for循环中声明的本地

我们来看看它的用法：

```java

`var numbers = List.of(``1``,` `2``,` `3``,` `4``,` `5``);` `// inferred value ArrayList<String>`

`// Index of Enhanced For Loop`

`for` `(var number : numbers) {`

`System.out.println(number);`

`}`

`// Local variable declared in a loop`

`for` `(var i =` `0``; i < numbers.size(); i++) {`

`System.out.println(numbers.get(i));`

`}`
```

## 实验性基于Java的JIT编译器（JEP 317）

这个特性使基于Java的JIT编译器Graal能够在Linux/x64平台上作为一个实验性的JIT编译器使用。

到目前为止，这是Java10特性列表中最具未来感的内容。

Graal是在java9中引入的。它是我们已经习惯的JIT编译器的替代品。它是JVM的一个插件，这意味着JIT编译器没有绑定到JVM，它可以动态地插入JVMCI兼容的任何其他插件（Java级JVM编译器接口）。它还带来了java世界中的提前编译（AOT）。它还支持多语言翻译。

“一个用Java编写的基于Java的实时编译器，用于将Java字节码转换为机器码。”这让人困惑吗？如果JVM是用Java编写的，那么您不需要JVM来运行JVM吗？JVM可以通过AOT编译，然后JIT编译器可以在jvmit中使用，通过实时代码优化来提高性能。

Graal是用Java从头开始的对JIT编译器的完全重写。以前的JIT编译器是用c++编写的。它被认为是任何编程语言进化的最后阶段。

您可以使用以下jvm参数切换到Graal：

```
-XX:+UnlockExperimentalVMOptions -XX:+UseJVMCICompiler
```

## 应用程序级数据共享（JEP 310）

此功能有助于改善启动占用空间，扩展现有的类数据共享（“CDS”）功能，以允许将应用程序类放置在共享存档中。

JVM在启动时执行一些初步步骤，其中一个步骤是在内存中加载类。如果有几个jar有多个类，那么第一个请求中的延迟就很明显了。

这成为无服务器体系结构的一个问题，其中引导时间至关重要。为了缩短应用程序启动时间，可以使用应用程序类数据共享。

其思想是通过在不同的Java进程之间共享公共类元数据来减少占用空间。可通过以下3个步骤实现：

确定要存档的类：使用java启动器创建要存档的文件列表，这可以通过以下参数实现：

```
$java -Xshare:off -XX:+UseAppCDS -XX:DumpLoadedClassList=hello.lst -cp hello.jar HelloWorld
```

创建AppCDS存档：使用java launcher创建要用于应用程序cd的文件列表的存档，这可以通过以下参数实现：

```
$java -Xshare:dump -XX:+UseAppCDS -XX:SharedClassListFile=hello.lst -XX:SharedArchiveFile=hello.jsa -cp hello.jar
```

使用AppCDS存档：使用带有以下参数的Java启动器来使用应用程序cd。

```
$java -Xshare:on -XX:+UseAppCDS -XX:SharedArchiveFile=hello.jsa -cp hello.jar HelloWorld
```

## G1并行Full GC（JEP 307）

G1垃圾收集器在jdk9中是默认的。

G1垃圾收集器避免了任何完全的垃圾收集，但是当用于收集的并发线程不能足够快地恢复内存时，用户的体验就会受到影响。

此更改通过使完全GC并行来改善G1最坏情况下的延迟。

G1收集器的 `mark-sweep compact` 算法作为此更改的一部分被并行化，当用于收集的并发线程不能足够快地恢复内存时，它将被触发。

## 垃圾收集器接口（JEP 304）

这个JEP是未来的变化。

它通过引入一个通用的垃圾收集器接口来改进不同垃圾收集器的代码隔离。

此更改为内部GC代码提供了更好的模块化。它将有助于将来添加新的GC而不改变现有的代码基，也有助于删除或管理以前的GC。

## 附加Unicode语言标记扩展（JEP 314）

此功能增强了java.util.Locale语言环境以及相关的API来实现BCP 47语言标记的额外Unicode扩展。

从JavaSE9开始，支持的BCP47U语言标记扩展是“ca”和“nu”。

此JEP将添加对以下附加扩展的支持：

cu（货币类型）

fw（每周第一天）

rg（区域覆盖）

tz（时区）

为了支持这些附加扩展，对各种api进行了更改，以提供基于U或附加扩展的信息。

```java

`java.text.DateFormat::get*Instance`

`java.text.DateFormatSymbols::getInstance`

`java.text.DecimalFormatSymbols::getInstance`

`java.text.NumberFormat::get*Instance`

`java.time.format.DateTimeFormatter::localizedBy`

`java.time.format.DateTimeFormatterBuilder::getLocalizedDateTimePattern`

`java.time.format.DecimalStyle::of`

`java.time.temporal.WeekFields::of`

`java.util.Calendar::{getFirstDayOfWeek,getMinimalDaysInWeek}`

`java.util.Currency::getInstance`

`java.util.Locale::getDisplayName`

`java.util.spi.LocaleNameProvider`
```

## 根证书（JEP 319）

为了推广OpenJDK并使其对社区用户更具吸引力，此功能在JDK中提供了一组默认的根证书颁发机构（CA）证书。

这也意味着Oracle和openjdk二进制文件在功能上是相同的。

关键的安全组件（如TLS）将在OpenJDK构建中默认工作。

## Thread-Local 线程本地握手（JEP 312）

这是一个用于提高性能的内部JVM特性。

握手操作是在每个JavaThread处于safepoint状态时对其执行的回调。回调要么由线程本身执行，要么由VM线程执行，同时保持线程处于阻塞状态。

此功能提供了一种在线程上执行回调而不执行全局VM safepoint的方法。使停止单个线程，而不仅仅是停止所有线程或不停止任何线程既可能又便宜。

## 替代内存设备上的堆分配（JEP 316）

应用程序已经变得内存匮乏，云本地应用程序、内存数据库、流式应用程序都在增加。

为了满足这些服务，有各种可用的内存体系结构。

此功能增强了HotSpot VM在用户指定的备用内存设备（如NV-DIMM）上分配Java对象堆的能力。

此JEP针对具有与DRAM相同的语义（包括原子操作的语义）的替代内存设备，因此，可以在不更改现有应用程序代码的情况下代替DRAM用于对象堆。

## 删除Native-Header生成工具Javah（Jep313）

这是一个从JDK中删除javah工具的内务管理更改。

javac中添加的工具功能是jdk8的一部分，它提供了在编译时编写Native-Header文件的能力，从而使javah变得无用。

## 将JDK林整合到单个存储库中（JEP 296）

多年来，在JDK代码库中有各种Mercurial存储库。

不同的存储库确实提供了一些优势，但它们也有不同的操作缺点。

作为此更改的一部分，JDK的许多存储库被合并到一个存储库中，以简化开发。

## API更改

Java10已经添加和删除了API（是的，它不是一个拼写错误）。

Java9引入了增强的弃用，其中某些API被标记为在将来的版本中删除。

添加了API:Java10中添加了73个新API。

让我们看一些补充：

List、Map和Set接口是通过静态copyOf（Collection）方法添加的。它返回一个不可修改的列表、映射或集合，其中包含所提供的条目。对于列表，如果给定的列表随后被修改，则返回的列表将不会反映这些修改。

Optional&它的原语变体获取一个方法orelsetrow（）。这与get（）完全相同，但是javadoc声明它是get（）的首选替代方法

Collectors类获取用于收集不可修改集合（Set、List、Map）的各种方法

```java
`List<String> actors =` `new` `ArrayList<>();`

`actors.add(``"Jack Nicholson"``);`

`actors.add(``"Marlon Brando"``);`

`System.out.println(actors);` `// prints [Jack Nicholson, Marlon Brando]`

`// New API added - Creates an UnModifiable List from a List.`

`List<String> copyOfActors = List.copyOf(actors);`

`System.out.println(copyOfActors);` `// prints [Jack Nicholson, Marlon Brando]`

`// copyOfActors.add("Robert De Niro"); Will generate an`

`// UnsupportedOperationException`

`actors.add(``"Robert De Niro"``);`

`System.out.println(actors);``// prints [Jack Nicholson, Marlon Brando, Robert De Niro]`

`System.out.println(copyOfActors);` `// prints [Jack Nicholson, Marlon Brando]`

`String str =` `""``;`

`Optional<String> name = Optional.ofNullable(str);`

`// New API added - is preferred option then get() method`

`name.orElseThrow();` `// same as name.get()`

`// New API added - Collectors.toUnmodifiableList`

`List<String> collect = actors.stream().collect(Collectors.toUnmodifiableList());`

`// collect.add("Tom Hanks"); // Will generate an`

`// UnsupportedOperationException`
```

# 参考资料

[Java10 新特性解读](https://www.jianshu.com/p/00ae4aaf0cc2)

* any list
{:toc}