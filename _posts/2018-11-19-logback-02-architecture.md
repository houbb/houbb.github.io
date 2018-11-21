---
layout: post
title: Logback-02-architecture
date: 2018-11-19 08:11:55 +0800
categories: [Log]
tags: [log, sh]
published: true
excerpt: Logback 模块介绍
---

# Logback的架构

Logback的基本架构足够通用，以便在不同情况下应用。

目前，logback分为三个模块：logback-core，logback-classic和logback-access。

核心模块为其他两个模块奠定了基础。经典模块扩展了核心。经典模块对应于log4j的显着改进版本。 

Logback-classic本身实现了SLF4J API，因此您可以在logback和其他日志记录系统（如JDK 1.4中引入的log4j或java.util.logging（JUL））之间来回切换。

第三个名为access的模块与Servlet容器集成，以提供HTTP访问日志功能。单独的文档包含访问模块文档。

在本文档的其余部分中，我们将编写“logback”来引用logback-classic模块。

# Logger，Appender 和 Layout

Logback基于三个主要类：Logger，Appender和Layout。

这三种类型的组件协同工作，使开发人员能够根据消息类型和级别记录消息，并在运行时控制这些消息的格式以及报告的位置。

Logger类是logback-classic模块的一部分。

另一方面，Appender和Layout接口是logback-core的一部分。作为通用模块，logback-core没有 Logger 的概念。

## 记录器上下文

任何日志API优于普通 `System.out.println` 的第一个也是最重要的优势在于它能够禁用某些日志语句，同时允许其他人不受阻碍地打印。

此功能假定日志记录空间（即所有可能的日志记录语句的空间）根据开发人员选择的某些条件进行分类。

在logback-classic中，这种分类是记录器的固有部分。

每个记录器都附加到LoggerContext，后者负责制造记录器以及将它们排列在树状层次结构中。

记录器是命名实体。它们的名称区分大小写，它们遵循分层命名规则：

> 命名层次结构

如果记录器的名称后跟一个点是后代记录器名称的前缀，则称该记录器是另一个记录器的祖先。如果记录器本身与后代记录器之间没有祖先，则称记录器是子记录器的父节点。

例如，名为“com.foo”的记录器是名为“com.foo.Bar”的记录器的父级。

类似地，“java”是“java.util”的父级和“java.util.Vector”的祖先。大多数开发人员都应该熟悉这种命名方案。

根记录器位于记录器层次结构的顶部。它的特殊之处在于它是每个层次结构的一部分。

像每个记录器一样，它可以通过其名称检索，如下所示：

```java
Logger rootLogger = LoggerFactory.getLogger(org.slf4j.Logger.ROOT_LOGGER_NAME);
```

还可以使用org.slf4j.LoggerFactory类中的类静态getLogger方法检索所有其他记录器。

此方法将所需记录器的名称作为参数。

下面列出了Logger界面中的一些基本方法。

```java
package org.slf4j; 
public interface Logger {

  // Printing methods: 
  public void trace(String message);
  public void debug(String message);
  public void info(String message); 
  public void warn(String message); 
  public void error(String message); 
}
```

## 有效级别又是级别继承

可以为记录器分配级别。

可能的级别集（TRACE，DEBUG，INFO，WARN和ERROR）在ch.qos.logback.classic.Level类中定义。

请注意，在logback中，Level类是final类，不能是子类，因为以Marker对象的形式存在更灵活的方法。

如果给定的记录器没有分配级别，那么它将从具有指定级别的最近祖先继承一个级别。

更正式地说：

**给定记录器L的有效水平等于其层次结构中的第一个非空水平，从L本身开始并在层次结构中朝向根记录器继续向上。**

为确保所有记录器最终都能继承一个级别，根记录器始终具有指定的级别。默认情况下，此级别为DEBUG。

下面是四个示例，其中包含各种已分配的级别值以及根据级别继承规则生成的有效（继承）级别。

- Example 1

| Logger name	|  Assigned level	|  Effective level | 
|:---|:---|:---|
| root	| DEBUG	    | DEBUG |
| X	    |  none 	| DEBUG |
| X.Y	|    none	| DEBUG |
| X.Y.Z | 	none	| DEBUG |


在上面的示例1中，仅为根记录器分配了级别。

此级别值DEBUG由其他记录器X，X.Y和X.Y.Z继承

- Example 2

| Logger name	|  Assigned level	|  Effective level | 
|:---|:---|:---|
| root	| ERROR   | 	ERROR |
| X	    | INFO	   | INFO |
| X.Y	| DEBUG   | 	DEBUG |
| X.Y.Z	| WARN	   | WARN |

在上面的示例2中，所有记录器都具有指定的级别值。

级别继承不起作用。

- Example 3

| Logger name	|  Assigned level	|  Effective level | 
|:---|:---|:---|
| root	| DEBUG  | 	DEBUG |
| X	    | INFO	  | INFO |
| X.Y	    | none	  | INFO |
| X.Y.Z	| ERROR  | 	ERROR |

在上面的示例3中，记录器root，X和X.Y.Z分别被分配了DEBUG，INFO和ERROR级别。 

Logger X.Y从其父X继承其级别值。

- Example 4

| Logger name	|  Assigned level	|  Effective level | 
|:---|:---|:---|
| X	        | INFO	| INFO |
| X.Y	    | none	| INFO |
| X.Y.Z	    | none	| INFO |

在上面的示例4中，记录器root和X分别被分配了DEBUG和INFO级别。记录器X.Y和X.Y.Z从其最近的父X继承其级别值，该父级具有指定的级别。

- 个人总结

**自己有就用自己的，自己没有就用最近的父类的。**

## print 方法和基本选择规则

根据定义，打印方法确定日志记录请求的级别。

例如，如果L是记录器实例，则语句 `L.info（“..”）` 是级别INFO的记录语句。

如果日志记录请求的级别高于或等于其记录器的有效级别，则称其已启用。否则，该请求被称为禁用。

如前所述，没有指定级别的记录器将从其最近的祖先继承一个。该规则总结如下。

- 基本选择规则

**如果 p >= q，则启用向具有有效级别q的记录器发出的级别p的日志请求。**

此规则是logback的核心。它假定级别按如下顺序排序：TRACE <DEBUG <INFO <WARN <ERROR。

## 实际测试代码

- LevelTest.java

```java
package com.github.houbb.logback.learn.architecture;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import ch.qos.logback.classic.Level;

/**
 * @author binbin.hou
 * @date 2018/11/19 14:32
 */
public class LevelTest {

    public static void main(String[] args) {
// get a logger instance named "com.github.houbb". Let us further assume that the
// logger is of type  ch.qos.logback.classic.Logger so that we can
// set its level
        ch.qos.logback.classic.Logger logger =
                (ch.qos.logback.classic.Logger) LoggerFactory.getLogger("com.github.houbb");


        Logger barlogger = LoggerFactory.getLogger("com.github.houbb.logback");

//set its Level to INFO. The setLevel() method requires a logback logger
        logger.setLevel(Level.INFO);

// This request is enabled, because WARN >= INFO
        logger.warn("Low fuel level.");

// This request is disabled, because DEBUG < INFO.
        logger.debug("Starting search for nearest gas station.");

// The logger instance barlogger, named "com.github.houbb.logback",
// will inherit its level from the logger named
// "com.github.houbb" Thus, the following request is enabled
// because INFO >= INFO.
        barlogger.info("Located nearest gas station.");

// This request is disabled, because DEBUG < INFO.
        barlogger.debug("Exiting gas station search");
    }

}
```

日志信息

```
14:40:40.071 [main] WARN  com.github.houbb - Low fuel level.
14:40:40.075 [main] INFO  com.github.houbb.logback - Located nearest gas station.
```

## 检索记录器

调用具有相同名称的LoggerFactory.getLogger方法将始终返回对完全相同的logger对象的引用。


```java
Logger x = LoggerFactory.getLogger("wombat"); 
Logger y = LoggerFactory.getLogger("wombat");
```

x、y 二者返回的是同一个引用。

因此，可以配置记录器，然后在代码中的其他位置检索相同的实例，而不传递引用。

与生父母一样，父母总是先于孩子的基本矛盾，可以按任何顺序创建和配置logback记录器。特别是，“父”记录器将查找并链接到其后代，即使它们在它们之后被实例化。

通常在应用程序初始化时完成对logback环境的配置。首选方法是读取配置文件。这种方法将很快讨论。

Logback可以轻松地按软件组件命名记录器。这可以通过在每个类中实例化记录器来完成，记录器名称等于类的完全限定名称。这是定义记录器的有用且直接的方法。由于日志输出带有生成记录器的名称，因此该命名策略可以轻松识别日志消息的来源。但是，这只是命名记录器的一种可能的策略，尽管很常见。 

Logback不会限制可能的记录器集。作为开发人员，您可以根据需要自由命名记录器。

尽管如此，在它们所在的类之后命名记录器似乎是目前已知的最佳通用策略。

# Appenders 和布局

基于其记录器选择性地启用或禁用记录请求的能力仅是图片的一部分。 

Logback允许将记录请求打印到多个目标。在logback中，输出目标称为appender。

目前，控制台，文件，远程套接字服务器，MySQL，PostgreSQL，Oracle和其他数据库，JMS和远程UNIX Syslog守护程序都存在appender。

可以将多个appender连接到记录器。

addAppender方法将appender添加到给定的记录器。给定记录器的每个启用的日志记录请求都将转发到该记录器中的所有appender以及层次结构中较高的appender。换句话说，appender是从记录器层次结构中附加地继承的。

例如，如果将控制台appender添加到根记录器，则所有启用的日志记录请求将至少在控制台上打印。如果另外将文件追加器添加到记录器（例如L），则对L和L'子项启用的记录请求将打印在文件和控制台上。通过将记录器的additivity标志设置为false，可以覆盖此默认行为，以便不再添加appender累积。

> 有关appender可加性的规则总结如下。

记录器L的日志语句的输出将转到L及其祖先中的所有appender。这就是术语“appender additivity”的含义。

但是，如果记录器L的祖先，比如说P，将additivity标志设置为false，那么L's输出将被定向到L中的所有appender及其祖先，包括P，但不包括任何祖先中的appenders。

记录器默认情况下将其可加性标志设置为true。

## 例子

| Logger Name	    | Attached Appenders	| Additivity Flag	| Output Targets	| Comment |
|:----|:----|:----|:----|:----|
root	A1	not applicable	A1	Since the root logger stands at the top of the logger hierarchy, the additivity flag does not apply to it.
x	    A-x1, A-x2	true	A1, A-x1, A-x2	Appenders of "x" and of root.
x.y	    none	true	A1, A-x1, A-x2	Appenders of "x" and of root.
x.y.z	A-xyz1	true	A1, A-x1, A-x2, A-xyz1	Appenders of "x.y.z", "x" and of root.
security	A-sec	false	A-sec	No appender accumulation since the additivity flag is set to false. Only appender A-sec will be used.
security.access	none	true	A-sec	Only appenders of "security" because the additivity flag in "security" is set to false.

## 格式化输出

用户通常不仅要定制输出目的地，还要定制输出格式。

这是通过将布局与appender相关联来实现的。布局负责根据用户的意愿格式化日志记录请求，而appender负责将格式化的输出发送到其目的地。 

PatternLayout是标准logback分发的一部分，它允许用户根据类似于C语言printf函数的转换模式指定输出格式。

比如 PatternLayout 为 `%-4relative [%thread] %-5level %logger{32} - %msg%n`，输出如下：

```
176  [main] DEBUG manual.architecture.HelloWorld2 - Hello world.
```

第一个字段是自程序启动以来经过的毫秒数。第二个字段是发出日志请求的线程。第三个字段是日志请求的级别。第四个字段是与日志请求关联的记录器的名称。 

`-` 后面的文本是请求的消息。

# 参数化日志记录

鉴于logback-classic中的记录器实现了SLF4J的Logger接口，某些打印方法允许多个参数。

这些打印方法变体主要用于提高性能，同时最小化对代码可读性的影响。

对于一些Logger记录器，写作，

```java
logger.debug("Entry number: " + i + " is " + String.valueOf(entry[i]));
```

导致构造消息参数的成本，即将整数 i 和 `entry[i]` 转换为String，并连接中间字符串。

无论是否记录消息，都是如此。

避免参数构造成本的一种可能方法是使用测试包围日志语句。这是一个例子。

```java
if(logger.isDebugEnabled()) { 
  logger.debug("Entry number: " + i + " is " + String.valueOf(entry[i]));
}
```

这样，如果对记录器禁用调试，则不会产生参数构造的成本。

另一方面，如果为DEBUG级别启用了记录器，则会产生评估记录器是否启用的成本，两次：一次在debugEnabled中，一次在debug中。

实际上，这种开销是微不足道的，因为评估记录器所需的时间不到实际记录请求所需时间的1％。

# 更好的选择

存在基于消息格式的便利替代方案。假设entry是一个对象，你可以写：

```java
Object entry = new SomeObject(); 
logger.debug("The entry is {}.", entry);
```

- 个人感觉

这种写法和传统的 log4j 对比，使用起来是真的很方便。

1. 可以使你编写的时候代码更加优雅，阅读的时候也不至于被字符串拼接打断。

2. 性能也更加优异

只有在评估是否记录之后，并且只有在决策是肯定的情况下，记录器实现才会格式化消息并将 `{}` 对替换为条目的字符串值。

换句话说，当禁用日志语句时，此表单不会产生参数构造的成本。

以下两行将产生完全相同的输出。但是，在禁用日志记录语句的情况下，第二个变体将比第一个变体优于至少30倍。

```java
logger.debug("The new entry is "+entry+".");
logger.debug("The new entry is {}.", entry);
```

两个参数：

```java
logger.debug("The new entry is {}. It replaces {}.", entry, oldEntry);
```

- 更多参数

你可以使用数组，来实现格式化输出。

```java
Object[] paramArray = {newVal, below, above};
logger.debug("Value {} was inserted between {} and {}.", paramArray);
```

# 在引擎盖下偷看

在我们介绍了基本的logback组件之后，我们现在准备描述当用户调用记录器的打印方法时logback框架所采取的步骤。

现在让我们分析当用户调用名为 com.wombat 的记录器的 info() 方法时的logback步骤。

## 1.获取过滤器链决定

如果存在，则调用 TurboFilter 链。 

Turbo过滤器可以设置上下文范围的阈值，或者根据与每个日志记录请求关联的标记，级别，记录器，消息或Throwable等信息过滤掉某些事件。

如果过滤器链的回复是FilterReply.DENY，则删除日志记录请求。

如果是FilterReply.NEUTRAL，那么我们继续下一步，即步骤2.如果回复是FilterReply.ACCEPT，我们跳过下一步并直接跳到第3步。

## 2.应用基本选择规则

在此步骤中，logback会将记录器的有效级别与请求级别进行比较。如果根据此测试禁用了日志记录请求，则logback将丢弃请求而不进行进一步处理。否则，它将继续进行下一步。

## 3.创建LoggingEvent对象

如果请求在前面的过滤器中存活，则logback将创建一个ch.qos.logback.classic.LoggingEvent对象，其中包含请求的所有相关参数，例如请求的记录器，请求级别，消息本身，异常可能已与请求，当前时间，当前线程，发出日志记录请求的类和MDC的各种数据一起传递。

请注意，其中一些字段是懒惰地初始化的，只有在实际需要时才会这样。 

MDC用于使用其他上下文信息来装饰日志记录请求。 

MDC将在后续章节中讨论。

- 个人笔记

MDC 非常适合不同系统调用的链路追踪，可以不同的线程指定不同的 traceId。非常强大好用。

## 4.调用appender

在创建LoggingEvent对象之后，logback将调用所有适用的appender的doAppend（）方法，即从记录器上下文继承的appender。

带有logback发行版的所有appender都扩展了AppenderBase抽象类，该类在同步块中实现了doAppend方法，从而确保了线程安全性。如果存在任何此类过滤器，AppenderBase的doAppend（）方法还会调用附加到appender的自定义过滤器。可以动态附加到任何appender的自定义过滤器将在单独的章节中介绍。

## 5.格式化输出

调用的appender负责格式化日志记录事件。但是，某些（但不是全部）appender将将日志记录事件格式化的任务委派给布局。布局格式化LoggingEvent实例并将结果作为String返回。请注意，某些appender（如SocketAppender）不会将日志记录事件转换为字符串，而是将其序列化。因此，他们没有也不需要布局。

## 6.发送LoggingEvent

记录事件完全格式化后，每个appender将其发送到目标。

这是一个序列UML图，显示一切是如何工作的。您可能需要单击图像以显示其更大的版本。

![underTheHoodSequence2_small](https://logback.qos.ch/manual/images/chapters/architecture/underTheHoodSequence2_small.gif)

# 性能

经常引用的反对日志记录的一个论点就是它的计算成本。这是一个合理的问题，因为即使是中等规模的应用程序也可以生成数千个日志请求。我们的大部分开发工作都花在测量和调整logback的性能上。与这些努力无关，用户仍应了解以下性能问题。

## 1.完全关闭日志记录时的记录性能

您可以通过将根记录器的级别设置为Level.OFF（可能的最高级别）来完全关闭日志记录。完全关闭日志记录时，日志请求的成本包括方法调用和整数比较。在3.2Ghz Pentium D机器上，此成本通常约为20纳秒。

但是，任何方法调用都涉及参数构造的“隐藏”成本。

例如，对于某些记录器x写入，

```java
x.debug("Entry number: " + i + "is " + entry[i]);
```

导致构造消息参数的成本，即将整数i和entry [i]都转换为字符串，并连接中间字符串，而不管是否记录消息。

参数构造的成本可能非常高，并且取决于所涉及的参数的大小。

为了避免参数构造的成本，您可以利用SLF4J的参数化日志记录：

```java
x.debug("Entry number: {} is {}", i, entry[i]);
```

该变体不会产生参数构造的成本。与之前调用debug()方法相比，它的速度更快。

仅当要将记录请求发送到附加的appender时，才会格式化该消息。此外，格式化消息的组件也得到了高度优化。

尽管上述将紧密循环中的日志语句（即非常频繁调用的代码）放置在一起，但却是一种双输的提议，可能会导致性能下降。

即使关闭日志记录，登录紧密循环也会降低应用程序的速度，如果打开日志记录，则会产生大量（因而无用的）输出。

## 2.打开日志记录时决定是否记录日志的性能。

在logback中，不需要遍历记录器层次结构。记录器在创建时知道其有效级别（即，其级别，一旦考虑了级别继承）。

如果更改了父记录器的级别，则会联系所有子记录器以注意更改。

因此，在基于有效水平接受或拒绝请求之前，记录器可以做出准瞬时决定，而无需咨询其祖先。

## 3.实际记录（格式化和写入输出设备）

这是格式化日志输出并将其发送到目标目标的成本。

在这里，我们再次努力使布局（格式化程序）尽可能快地执行。 

appender也是如此。记录到本地计算机上的文件时，实际记录的典型成本约为9到12微秒。登录到远程服务器上的数据库时，它会持续几毫秒。

虽然功能丰富，但是logback最重要的设计目标之一是执行速度，这是仅次于可靠性的要求。

一些logback组件已被重写几次以提高性能。

# 参考资料

https://logback.qos.ch/manual/architecture.html

* any list
{:toc}