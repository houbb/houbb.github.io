---
layout: post
title: java 变更日志-07-JDK7 核心变化
date:  2017-06-28 23:15:43 +0800
categories: [Java]
tags: [jdk, java]
published: true
---


# 官方笔记

[jdk7 更新日志](https://www.oracle.com/java/technologies/javase/jdk7-relnotes.html)


# 开发关心

nio 

并发工具  Fork/Join 框架/ThreadLocalRandom 类/Phaser 类

# JVM

## Java虚拟机对非Java语言的支持

## 引言
以下主题将被覆盖：

- 引言
- 静态和动态类型
- 编译动态类型语言的挑战
- invokedynamic指令
- 资源

### 引言
Java SE平台使得应用程序开发具有以下特性成为可能：

- 一次编写，到处运行
- 由于Java沙箱安全模型可以安全运行
- 容易打包和交付

Java SE平台还在以下方面（以及更多方面）提供强大的支持：

- 并发性
- 垃圾回收
- 反射访问类和对象
- JVM工具接口（JVM TI）：用于工具的本地编程接口。它提供了一种检查状态和控制在JVM中运行的应用程序的方式。
- Oracle的HotSpot JVM还提供以下工具和特性：

  - DTrace：一个全面的动态跟踪实用程序，监视应用程序以及操作系统本身的行为。
  - 性能优化
  - PrintAssembly：一个Java HotSpot选项，用于打印字节码和本地方法的汇编代码。

Java SE 7平台允许非Java语言利用JVM的基础设施和潜在性能优化。关键机制是invokedynamic指令，它简化了在JVM上实现动态类型语言的编译器和运行时系统。

### 静态和动态类型
如果编程语言在编译时执行类型检查，则为静态类型语言。类型检查是验证程序是否类型安全的过程。如果所有操作的参数都是正确的类型，则程序是类型安全的。

Java是一种静态类型语言。当程序编译时，为类和实例变量、方法参数、返回值和其他变量提供了所有类型信息。Java编程语言的编译器使用此类型信息生成强类型的字节码，然后可以由JVM在运行时高效地执行。

下面是一个Hello World程序的示例，展示了静态类型。类型用粗体显示。

```java
import java.util.Date;

public class HelloWorld {
    public static void main(String[] argv) {
        String hello = "Hello ";
        Date currDate = new Date();
        for (String a : argv) {
            System.out.println(hello + a);
            System.out.println("Today's date is: " + currDate);
        }
    }
}
```

如果编程语言在运行时执行类型检查，则为动态类型语言。JavaScript和Ruby是动态类型语言的例子。这些语言在运行时验证，而不是在编译时验证应用程序中的值是否符合预期的类型。这些语言通常在编译时没有任何类型信息。对象的类型只能在运行时确定。因此，在过去，很难在JVM上有效地实现它们。

下面是使用Ruby编程语言编写的Hello World程序的示例：

```ruby
#!/usr/bin/env ruby
require 'date'

hello = "Hello "
currDate = DateTime.now
ARGV.each do|a|
  puts hello + a
  puts "Date and time: " + currDate.to_s
end
```

注意，每个名称都没有类型声明。而且，主程序不位于一个持有者类型（Java类HelloWorld）内。Ruby的Java for循环等价物位于变量ARGV的动态类型内。循环的主体包含在一个闭包中，这是动态语言中的常见特性。

### 静态类型语言不一定是强类型语言
具有强类型特性的编程语言指定对其操作提供的值类型的限制。如果计算机语言实现了强类型，如果其操作的参数具有错误类型，它将阻止操作的执行。相反，具有弱类型特性的语言会隐式地转换（或转型）操作的参数，如果这些参数具有错误或不兼容的类型。

静态类型的编程语言可以采用强类型或弱类型。同样，动态类型的语言也可以应用强类型或弱类型。例如，Ruby编程语言是动态类型和强类型的。一旦变量已被初始化为某种类型的值，Ruby编程语言将不会隐式地将变量转换为另一种数据类型。Ruby编程语言不会允许以下内容：

```ruby
a = "40"
b = a + 2
```

在这个例子中，Ruby编程语言不会隐式地将数字2（具有Fixnum类型）转换为字符串。

### 编译动态类型语言的挑战
考虑以下动态类型方法addtwo，它添加任意两个数字（可以是任何数值类型）并返回总和：

```ruby
def addtwo(a, b)
       a + b;
end
```

假设您的组织正在为编程语言实现编译器和运行时系统，其中方法addtwo编写。在一个强类型语言中，无论是静态类型还是动态类型，+（加法运算符）的行为都取决于操作数的类型。静态类型语言的编译器根据a和b的静态类型选择适当的+实现。例如，如果a和b的类型是int，则Java编译器使用iadd JVM指令实现+。加法运算符将被编译为方法调用，因为JVM的iadd指令要求操作数类型是静态已知的。

相反，动态类型语言的编译器必须推迟选择，直到运行时。语句a + b被编译为方法调用+(a, b)，其中+是方法名称。（请注意，在JVM中允许命名为+的方法，但在Java编程语言中不允

许。）假设运行时系统能够识别a和b是整数类型的变量。运行时系统更喜欢调用专为整数类型而不是任意对象类型而专门设计的+实现。

编译动态类型语言的挑战是如何实现一个运行时系统，该系统可以在程序已被编译后选择最适当的方法或函数实现。将所有变量都视为Object类型的对象不会有效工作；Object类不包含名为+的方法。

Java SE 7引入了invokedynamic指令，使运行时系统能够自定义调用点与方法实现之间的链接。在这个例子中，invokedynamic调用点是+。通过引导方法（bootstrap method），也就是编译器指定的用于动态类型语言的方法，链接invokedynamic调用点。假设编译器发出一个invokedynamic指令来调用+，并假设运行时系统知道方法adder(Integer,Integer)，运行时可以将invokedynamic调用点链接到adder方法，如下所示：

```java
class IntegerOps {

  public static Integer adder(Integer x, Integer y) {
    return x + y;
  }
}

import java.util.*;
import java.lang.invoke.*;
import static java.lang.invoke.MethodType.*;
import static java.lang.invoke.MethodHandles.*;

class Example {

  public static CallSite mybsm(
    MethodHandles.Lookup callerClass, String dynMethodName, MethodType dynMethodType)
    throws Throwable {

    MethodHandle mh =
      callerClass.findStatic(
        Example.class,
        "IntegerOps.adder",
        MethodType.methodType(Integer.class, Integer.class, Integer.class));

    if (!dynMethodType.equals(mh.type())) {
      mh = mh.asType(dynMethodType);
    }

    return new ConstantCallSite(mh);
  }
}
```

在这个例子中，IntegerOps类属于附带动态语言运行时系统的库。

方法Example.mybsm是链接invokedynamic调用点与adder方法的引导方法。

对象callerClass是一个查找对象，它是在invokedynamic指令上下文中创建方法句柄的工厂。

方法MethodHandles.Lookup.findStatic（从callerClass查找对象调用）创建方法add

**注意：**这个引导方法只将invokedynamic调用点链接到adder方法，它假设给invokedynamic调用点的参数将是Integer对象。引导方法需要额外的代码来正确地将invokedynamic调用点链接到适当的代码以执行，如果引导方法的参数（在这个例子中是callerClass、dynMethodName和dynMethodType）变化。

**结论：**这是一个相当复杂的文档，涵盖了Java虚拟机如何支持非Java语言，特别是动态类型语言。如果你有任何特定的问题或需要进一步的澄清，请告诉我！

## 垃圾优先（G1）收集器

#### 简介

垃圾优先（G1）垃圾收集器在Oracle JDK 7更新4及更高版本中得到全面支持。G1收集器是一种面向多处理器机器和大内存的服务器风格的垃圾收集器。它能够高概率地满足垃圾收集（GC）暂停时间目标，并实现高吞吐量。整个堆操作，如全局标记，都与应用程序线程并行进行，这防止了与堆或活跃数据大小成比例的中断。

#### 技术描述

G1收集器通过几种技术实现高性能和暂停时间目标。

- 堆被分成一组大小相等的堆区域，每个区域是连续的虚拟内存范围。
- G1执行并发的全局标记阶段以确定整个堆中对象的存活性。
- G1知道哪些区域大部分是空的，因此首先在这些区域进行收集，通常可以获得大量的自由空间。
- G1使用暂停预测模型以满足用户定义的暂停时间目标，并基于指定的暂停时间目标选择要收集的区域数量。

#### 推荐G1的使用案例

G1的首要重点是为需要大堆和有限GC延迟的应用程序提供解决方案。这意味着堆大小约为6GB或更大，且稳定且可预测的暂停时间低于0.5秒。

如果应用程序具有以下一个或多个特点，则使用CMS或ParallelOld垃圾收集器运行的应用程序今天可以从切换到G1中受益：

- Java堆中超过50%的数据是活跃的。
- 对象分配率或提升率变化明显。
- 不希望长时间的垃圾收集或压缩暂停（长于0.5至1秒）。

#### 未来展望

G1计划作为并发标记-扫描收集器（CMS）的长期替代品。与CMS相比，G1有一些使其成为更好解决方案的差异。其中一个差异是G1是一个紧凑的收集器。G1进行了足够的压缩，完全避免了细粒度的空闲列表用于分配，而是依赖于区域。这大大简化了收集器的某些部分，并大部分消除了潜在的碎片问题。此外，G1提供比CMS收集器更可预测的垃圾收集暂停，并允许用户指定所需的暂停目标。

如果您有兴趣帮助改进G1，请尝试并通过OpenJDK和hotspot-gc-use@openjdk.java.net邮件列表提供反馈。

### Java HotSpot™ 虚拟机性能增强

#### 层次编译（Tiered Compilation）

层次编译在Java SE 7中引入，将客户端启动速度带到了服务器VM。通常，服务器VM使用解释器收集关于方法的性能分析信息，然后输入编译器。在层次方案中，除了解释器外，还使用客户端编译器生成收集自身性能分析信息的方法的编译版本。由于编译代码比解释器快得多，所以在性能分析阶段程序执行效率更高。在许多情况下，由于服务器编译器生成的最终代码在应用程序初始化的早期阶段可能已经可用，因此可以实现甚至比客户端VM更快的启动。层次方案还可以比常规服务器VM实现更好的峰值性能，因为更快的性能分析阶段允许更长时间的性能分析，这可能会产生更好的优化。

32位和64位模式都受支持，以及压缩oops（见下一节）。使用`-XX:+TieredCompilation`标志与`java`命令一起启用层次编译。

#### 压缩Oops（Compressed Oops）

在Java Hotspot中，"oop"或普通对象指针是一个管理对象的指针。oop通常与本机机器指针的大小相同，这意味着在LP64系统上为64位。在ILP32系统上，最大堆大小稍小于4吉字节，对许多应用程序来说是不足的。在LP64系统上，给定程序使用的堆可能比在ILP32系统上运行时要大约1.5倍。这一要求是由于管理指针的扩展大小。内存价格便宜，但是这些日子里带宽和缓存都很短缺，所以显著增加堆的大小并仅接近4吉字节的限制是不可取的。

Java堆中的管理指针指向在8字节地址边界上对齐的对象。压缩oops表示（在JVM软件的许多但不是所有地方）作为64位Java堆基地址的32位对象偏移量的管理指针。因为它们是对象偏移量而不是字节偏移量，所以它们可以用于寻址高达40亿的对象（而不是字节），或者最大约32吉字节的堆大小。要使用它们，必须将它们乘以8倍，并加上Java堆基地址以找到它们引用的对象。使用压缩oops的对象大小与ILP32模式中的对象大小相当。

术语“解码”用于表示32位压缩oop被转换为64位本机地址到管理堆的操作。逆操作被称为编码。

压缩oops在Java SE 6u23及更高版本中默认支持和启用。在Java SE 7中，当未指定`-Xmx`并且`-Xmx`值小于32吉字节时，压缩oops是64位JVM进程的默认值。对于JDK 6在6u23发布之前，使用`-XX:+UseCompressedOops`标志与`java`命令一起启用该功能。

#### 零基础压缩普通对象指针（oops）

当在64位Java虚拟机进程中使用压缩oops时，JVM软件要求操作系统从虚拟地址零开始为Java堆保留内存。如果操作系统支持这样的请求并能在虚拟地址零为Java堆保留内存，则使用零基础压缩oops。

使用零基础压缩oops意味着64位指针可以从32位对象偏移量中解码，而无需添加Java堆基地址。对于小于4吉字节的堆大小，JVM软件可以使用字节偏移量而不是对象偏移量，从而也避免将偏移量按8倍进行缩放。将64位地址编码为32位偏移量同样有效率。

对于大约26吉字节的Java堆大小，Solaris、Linux和Windows操作系统通常都能在虚拟地址零处分配Java堆。

#### 逃逸分析（Escape Analysis）

逃逸分析是Java Hotspot服务器编译器可以分析新对象使用范围并决定是否在Java堆上分配它的技术。

逃逸分析在Java SE 6u23及更高版本中默认支持和启用。

Java Hotspot服务器编译器实现了在以下描述的流不敏感逃逸分析算法：

 [Choi99] Jong-Deok Choi, Manish Gupta, Mauricio Seffano, Vugranam C. Sreedhar, Sam Midkiff, "Escape Analysis for Java", Procedings of ACM SIGPLAN OOPSLA Conference, November 1, 1999

基于逃逸分析，对象的逃逸状态可能是以下之一：

- GlobalEscape – 对象逃逸方法和线程。例如，存储在静态字段中的对象，或者存储在逃逸对象的字段中的对象，或者作为当前方法的结果返回。
- ArgEscape – 作为参数传递或由参数引用的对象，但在调用期间不会全局逃逸。这个状态是通过分析调用方法的字节码来确定的。
- NoEscape – 可替代的标量对象，意味着其分配可以从生成的代码中移除。

经过逃逸分析后，服务器编译器会消除可替代标量对象分

配和相关锁从生成的代码中。服务器编译器还消除所有非全局逃逸对象的锁。它不会将堆分配替换为非全局逃逸对象的堆栈分配。

一些逃逸分析的场景如下。

服务器编译器可能会消除某些对象分配。考虑一个方法做一个对象的防御性复制并将复制返回给调用者的例子。

```java
public class Person {
  private String name;
  private int age;
  public Person(String personName, int personAge) {
    name = personName;
    age = personAge;
  }
        
  public Person(Person p) { this(p.getName(), p.getAge()); }
  public int getName() { return name; }
  public int getAge() { return age; }
}

public class Employee {
  private Person person;
  
  // makes a defensive copy to protect against modifications by caller
  public Person getPerson() { return new Person(person); }
        
  public void printEmployeeDetail(Employee emp) {
    Person person = emp.getPerson();
    // this caller does not modify the object, so defensive copy was unnecessary
    System.out.println("Employee's name: " + person.getName() + "; age: " + person.getAge());     
  }
}
```

该方法进行了复制以防止调用者修改原始对象。如果编译器确定`getPerson`方法在循环中被调用，它将内联该方法。此外，通过逃逸分析，如果编译器确定原始对象从未被修改，它可能会优化并消除创建复制的调用。

服务器编译器可能会消除同步块（锁消除），如果它确定一个对象是线程本地的。例如，如`StringBuffer`和`Vector`类的方法是同步的，因为它们可以被不同的线程访问。然而，在大多数场景中，它们是以线程本地的方式使用的。在使用是线程本地的情况下，编译器可能会优化并删除同步块。

#### NUMA收集器增强（NUMA Collector Enhancements）

Parallel Scavenger垃圾收集器已经扩展以利用具有NUMA（非统一内存访问）架构的机器。大多数现代计算机都基于NUMA架构，其中访问内存的不同部分需要不同的时间。通常，系统中的每个处理器都有一个本地内存，提供低访问延迟和高带宽，以及访问速度较慢的远程内存。

在Java HotSpot虚拟机中，已经实现了NUMA感知分配器，以利用这样的系统，并为Java应用程序提供自动内存放置优化。分配器控制堆的young generation的eden space，在这里创建了大部分新对象。分配器将空间划分为每个都放在特定节点的内存的区域。分配器依赖于一个假设，即分配对象的线程最有可能使用该对象。为了确保最快访问新对象，分配器将其放在分配线程的本地区域。这些区域可以动态调整大小，以反映在不同节点上运行的应用程序线程的分配速率。这使得甚至单线程应用程序的性能也能得到提高。此外，“from”和“to”survivor spaces的young generation，old generation，和permanent generation为它们打开了页面交错。这确保所有线程平均地访问这些空间的延迟。

NUMA感知分配器在Solaris™操作系统上从Solaris 9 12/02开始，以及在Linux操作系统上从Linux kernel 2.6.19和glibc 2.6.1开始。

NUMA感知分配器可以与`-XX:+UseNUMA`标志一起打开，同时选择Parallel Scavenger垃圾收集器。Parallel Scavenger垃圾收集器是服务器级机器的默认值。Parallel Scavenger垃圾收集器也可以通过指定`-XX:+UseParallelGC`选项显式打开。

`-XX:+UseNUMA`标志在Java SE 6u2中添加。

注意：在Linux Kernel中有一个已知的bug，当使用`-XX:UseNUMA`运行JVM时可能导致崩溃。该错误在2012年修复，因此不应影响Linux Kernel的最新版本。要查看您的内核是否有此错误，您可以运行本机复现程序。

#### NUMA性能指标（NUMA Performance Metrics）

当在8芯Opteron机器上评估与SPEC JBB 2005基准测试时，NUMA感知系统显示了以下性能提升：

- 32位 - 使用NUMA感知分配器性能提高约30%
- 64位 - 使用NUMA感知分配器性能提高约40%

# jdbc

### Java™ JDBC API

#### 简介

Java Database Connectivity (JDBC) API 提供了从Java编程语言访问通用数据的能力。使用JDBC API，您可以访问几乎任何数据源，从关系数据库到电子表格和平面文件。JDBC 技术还提供了一个共同的基础，可以构建工具和替代接口。

#### JDBC API 的组成

JDBC API 由两个包组成：

- `java.sql`
- `javax.sql`

当您下载Java Platform Standard Edition (Java SE) 7时，您会自动获取这两个包。

#### 使用 JDBC API

要使用特定的数据库管理系统的 JDBC API，您需要一个基于 JDBC 技术的驱动程序来介于 JDBC 技术和数据库之间。根据各种因素，驱动程序可能纯粹由Java编程语言编写，或者是Java编程语言和Java Native Interface (JNI)本地方法的混合。要获取特定数据库管理系统的 JDBC 驱动程序，请参见 JDBC Data Access API。

#### Java SE 7 中的增强

**组件:** core-libs  
**子组件:** java.sql  
**简介:** JDBC 4.1 引入了以下功能：

- 可以使用 try-with-resources 语句自动关闭 Connection、ResultSet 和 Statement 类型的资源。
- RowSet 1.1: 引入了 RowSetFactory 接口和 RowSetProvider 类，使您可以创建您的 JDBC 驱动程序支持的所有类型的行集。

**RFE:** 6589685

**组件:** docs  
**子组件:** release_notes  
**简介:** 在 JDK 8 中将删除 JDBC-ODBC Bridge。

**RFE:** 8001747

#### 总结

JDBC API 为 Java 提供了一个强大的工具，使开发人员能够轻松地与各种数据源进行交互。通过 Java SE 7 中引入的增强功能，如 try-with-resources 语句和 RowSet 1.1，JDBC API 提供了更简洁、更强大的方式来管理数据库连接和查询。

同时，需要注意的是，在 JDK 8 中将不再支持 JDBC-ODBC Bridge，开发人员需要考虑其他替代方案来连接到 ODBC 数据源。

# 程序语言

## 二进制

当然，我会提供完整的翻译：

---

**二进制字面量**

在Java SE 7中，整数类型（byte、short、int和long）也可以使用二进制数字系统表示。要指定二进制字面量，你可以在数字前面加上前缀`0b`或`0B`。以下是一些示例：

```java
// 一个8位的 'byte' 值：
byte aByte = (byte)0b00100001;

// 一个16位的 'short' 值：
short aShort = (short)0b1010000101000101;

// 一些32位的 'int' 值：
int anInt1 = 0b10100001010001011010000101000101;
int anInt2 = 0b101;
int anInt3 = 0B101; // B 可以是大写或小写。

// 一个64位的 'long' 值。注意 "L" 后缀：
long aLong = 0b1010000101000101101000010100010110100001010001011010000101000101L;
```

二进制字面量可以使数据之间的关系更加明显，比在十六进制或八进制中更易于理解。例如，以下数组中的每个连续数字都旋转了一个比特：

```java
public static final int[] phases = {
  0b00110001,
  0b01100010,
  0b11000100,
  0b10001001,
  0b00010011,
  0b00100110,
  0b01001100,
  0b10011000
}
```

在十六进制中，数字之间的关系不容易看出：

```java
public static final int[] phases = {
    0x31, 0x62, 0xC4, 0x89, 0x13, 0x26, 0x4C, 0x98
}
```

你可以在代码中使用二进制整数常量来验证规范文档，例如模拟假设的8位微处理器：

```java
public State decodeInstruction(int instruction, State state) {
  if ((instruction & 0b11100000) == 0b00000000) {
    final int register = instruction & 0b00001111;
    switch (instruction & 0b11110000) {
      case 0b00000000: return state.nop();
      case 0b00010000: return state.copyAccumTo(register);
      case 0b00100000: return state.addToAccum(register);
      case 0b00110000: return state.subFromAccum(register);
      case 0b01000000: return state.multiplyAccumBy(register);
      case 0b01010000: return state.divideAccumBy(register);
      case 0b01100000: return state.setAccumFrom(register);
      case 0b01110000: return state.returnFromCall();
      default: throw new IllegalArgumentException();
    }
  } else {
    final int address = instruction & 0b00011111;
    switch (instruction & 0b11100000) {
      case 0b00100000: return state.jumpTo(address);
      case 0b01000000: return state.jumpIfAccumZeroTo(address);
      case 0b01000000: return state.jumpIfAccumNonzeroTo(address);
      case 0b01100000: return state.setAccumFromMemory(address);
      case 0b10100000: return state.writeAccumToMemory(address);
      case 0b11000000: return state.callTo(address);
      default: throw new IllegalArgumentException();
    }
  }
}
```

你还可以使用二进制字面量使位图更加可读：

```java
public static final short[] HAPPY_FACE = {
   (short)0b0000011111100000,
   (short)0b0000100000010000,
   // ...
}
```

通过使用二进制字面量，你可以更清晰地表示数据的位模式，使代码更加易于理解。

## Strings in switch Statements

**在switch语句中使用字符串**

在JDK 7发布中，你可以在switch语句的表达式中使用String对象：

```java
public String getTypeOfDayWithSwitchStatement(String dayOfWeekArg) {
     String typeOfDay;
     switch (dayOfWeekArg) {
         case "Monday":
             typeOfDay = "Start of work week";
             break;
         case "Tuesday":
         case "Wednesday":
         case "Thursday":
             typeOfDay = "Midweek";
             break;
         case "Friday":
             typeOfDay = "End of work week";
             break;
         case "Saturday":
         case "Sunday":
             typeOfDay = "Weekend";
             break;
         default:
             throw new IllegalArgumentException("Invalid day of the week: " + dayOfWeekArg);
     }
     return typeOfDay;
}
```

switch语句将其表达式中的String对象与每个case标签关联的表达式进行比较，就像使用String.equals方法一样；

因此，switch语句中的String对象比较是区分大小写的。与使用嵌套的if-then-else语句相比，使用String对象的switch语句通常会生成更有效的字节码。

## **使用try-with-resources语句**

try-with-resources语句是一个try语句，它声明一个或多个资源。资源是在程序完成后必须关闭的对象。try-with-resources语句确保每个资源在语句结束时都会被关闭。任何实现了java.lang.AutoCloseable接口的对象，包括所有实现了java.io.Closeable接口的对象，都可以用作资源。

以下示例从文件中读取第一行。它使用BufferedReader实例从文件中读取数据。BufferedReader是一个资源，程序在使用完它后必须关闭：

```java
static String readFirstLineFromFile(String path) throws IOException {
  try (BufferedReader br = new BufferedReader(new FileReader(path))) {
    return br.readLine();
  }
}
```

在这个例子中，try-with-resources语句中声明的资源是一个BufferedReader。声明语句出现在try关键字之后的括号内。在Java SE 7及更高版本中，BufferedReader类实现了java.lang.AutoCloseable接口。因为BufferedReader实例在try-with-resource语句中声明，所以无论try语句是否正常完成或突然中断（例如，由于BufferedReader.readLine方法抛出IOException），它都会被关闭。

在Java SE 7之前，你可以使用finally块来确保资源无论try语句是否正常完成或突然中断都会被关闭。以下示例使用finally块而不是try-with-resources语句：

```java
static String readFirstLineFromFileWithFinallyBlock(String path) throws IOException {
  BufferedReader br = new BufferedReader(new FileReader(path));
  try {
    return br.readLine();
  } finally {
    if (br != null) br.close();
  }
}
```

然而，在这个例子中，如果readLine和close两个方法都抛出异常，那么readFirstLineFromFileWithFinallyBlock方法会抛出finally块抛出的异常；try块抛出的异常会被抑制。相反，在readFirstLineFromFile示例中，如果try块和try-with-resources语句都抛出异常，那么readFirstLineFromFile方法会抛出try块抛出的异常；try-with-resources块抛出的异常会被抑制。在Java SE 7及更高版本中，你可以检索被抑制的异常；查看“抑制异常”部分以获取更多信息。

你可以在try-with-resources语句中声明一个或多个资源。以下示例从zip文件zipFileName中获取打包的文件名，并创建一个包含这些文件名的文本文件：

```java
public static void writeToFileZipFileContents(String zipFileName, String outputFileName)
    throws java.io.IOException {

    java.nio.charset.Charset charset = java.nio.charset.Charset.forName("US-ASCII");
    java.nio.file.Path outputFilePath = java.nio.file.Paths.get(outputFileName);

    // 使用try-with-resources语句打开zip文件并创建输出文件

    try (
      java.util.zip.ZipFile zf = new java.util.zip.ZipFile(zipFileName);
      java.io.BufferedWriter writer = java.nio.file.Files.newBufferedWriter(outputFilePath, charset)
    ) {

      // 枚举每个条目

      for (java.util.Enumeration entries = zf.entries(); entries.hasMoreElements();) {

        // 获取条目名并将其写入输出文件

        String newLine = System.getProperty("line.separator");
        String zipEntryName = ((java.util.zip.ZipEntry)entries.nextElement()).getName() + newLine;
        writer.write(zipEntryName, 0, zipEntryName.length());
      }
    }
}
```

在这个例子中，try-with-resources语句包含两个声明，它们由分号分隔：ZipFile和BufferedWriter。当直接跟随它的代码块终止时，无论是正常终止还是因为异常，BufferedWriter和ZipFile对象的close方法都会自动被调用，按照它们创建的相反顺序。注意，资源的close方法按照它们创建的相反顺序被调用。

以下示例使用try-with-resources语句自动关闭java.sql.Statement对象：

```java
public static void viewTable(Connection con) throws SQLException {

    String query = "select COF_NAME, SUP_ID, PRICE, SALES, TOTAL from COFFEES";

    try (Statement stmt = con.createStatement()) {

      ResultSet rs = stmt.executeQuery(query);

      while (rs.next()) {
        String coffeeName = rs.getString("COF_NAME");
        int supplierID = rs.getInt("SUP_ID");
        float price = rs.getFloat("PRICE");
        int sales = rs.getInt("SALES");
        int total = rs.getInt("TOTAL");
        System.out.println(coffeeName + ", " + supplierID + ", " + price +
                           ", " + sales + ", " + total);
      }

    } catch (SQLException e) {
      JDBCTutorialUtilities.printSQLException(e);
    }
}
```

在这个例子中使用的资源java.sql.Statement是JDBC 4.1及更高版本API的一部分。

注意：一个try-with-resources语句可以像普通try语句一样有catch和finally块。在try-with-resources语句中，任何catch或finally块在声明的资源被关闭后运行。

**抑制的异常**

与try-with-resources语句相关的代码块中可以抛出异常。在writeToFileZipFileContents示例中，try块可以抛出异常，当它尝试关闭ZipFile和BufferedWriter对象时，try-with-resources语句可以抛出最多两个异常。如果从try块抛出异常并且try-with-resources语句抛出一个或多个异常，那么从try块抛出的异常会被抑制，writeToFileZipFileContents方法抛出的是块抛出的异常。你可以通过调用由try块抛出的异常的Throwable.getSuppressed方法来检索这些被抑制的异常。

**实现AutoCloseable或Closeable接口的类**

参见AutoCloseable和Closeable接口的Javadoc，获取实现这些接口的类的列表。Closeable接口扩展了AutoCloseable接口。Closeable接口的close方法抛出IOException类型的异常，而AutoCloseable接口的close方法抛出Exception类型的异常。因此，AutoCloseable接口的子类可以重写close方法的这种行为，以抛出特

定的异常，例如IOException，或者根本不抛出异常。


## **捕获多种异常类型和使用改进的类型检查重新抛出异常**

**处理多种异常类型**

在Java SE 7及更高版本中，单个catch块可以处理多种异常类型。这个特性可以减少代码重复，并减少捕获过于宽泛异常的诱惑。

考虑以下示例，每个catch块中都包含重复的代码：

```java
catch (IOException ex) {
     logger.log(ex);
     throw ex;
catch (SQLException ex) {
     logger.log(ex);
     throw ex;
}
```

在Java SE 7之前的版本中，很难创建一个常见的方法来消除重复的代码，因为变量ex具有不同的类型。

在Java SE 7及更高版本中，以下示例消除了重复的代码：

```java
catch (IOException|SQLException ex) {
    logger.log(ex);
    throw ex;
}
```

catch子句指定了该块可以处理的异常类型，每种异常类型用竖线（|）分隔。

**注意**：如果一个catch块处理多种异常类型，那么catch参数会被隐式地声明为final。在这个例子中，catch参数ex是final的，因此你不能在catch块内给它赋值。

编译一个处理多种异常类型的catch块生成的字节码将比编译多个处理单一异常类型的catch块的字节码更小（因此更好）。处理多种异常类型的catch块在编译器生成的字节码中不会创建重复；字节码没有异常处理器的复制。

**使用更包容的类型检查重新抛出异常**

Java SE 7编译器对重新抛出的异常进行了比早期Java SE版本更精确的分析。这使你可以在方法声明的throws子句中指定更特定的异常类型。

考虑以下示例：

```java
static class FirstException extends Exception { }
static class SecondException extends Exception { }

public void rethrowException(String exceptionName) throws Exception {
    try {
      if (exceptionName.equals("First")) {
        throw new FirstException();
      } else {
        throw new SecondException();
      }
    } catch (Exception e) {
      throw e;
    }
}
```

这个例子的try块可以抛出FirstException或SecondException。假设你想在rethrowException方法声明的throws子句中指定这些异常类型。在Java SE 7之前的版本中，你不能这样做。因为catch子句的异常参数e是类型Exception，而catch块重新抛出异常参数e，所以你只能在rethrowException方法声明的throws子句中指定异常类型Exception。

然而，在Java SE 7中，你可以在rethrowException方法声明的throws子句中指定异常类型FirstException和SecondException。Java SE 7编译器可以确定try块抛出的异常必须来自于try块，而try块可以抛出的异常只能是FirstException和SecondException。尽管catch子句的异常参数e是类型Exception，编译器可以确定它是FirstException或SecondException的实例：

```java
public void rethrowException(String exceptionName)
throws FirstException, SecondException {
    try {
      // ...
    }
    catch (Exception e) {
      throw e;
    }
}
```

如果catch参数在catch块中被分配给另一个值，此分析将被禁用。然而，如果catch参数被分配给另一个值，你必须在方法声明的throws子句中指定异常类型Exception。

详细地说，在Java SE 7及更高版本中，当你在catch子句中声明一个或多个异常类型，并重新抛出这个catch块处理的异常时，编译器验证重新抛出的异常类型满足以下条件：

- try块能够抛出它。
- 没有其他的前置catch块可以处理它。
- 它是catch子句异常参数的子类型或超类型。

Java SE 7编译器允许你在rethrowException方法声明的throws子句中指定异常类型FirstException和SecondException，因为你可以重新抛出一个是throws声明中任何类型的超类型的异常。

在Java SE 7之前的版本中，你不能抛出一个是catch子句异常参数的超类型的异常。一个从Java SE 7之前的版本的编译器生成的错误是，“未报告的异常Exception；必须捕获或声明为要抛出”。在语句throw e处。编译器检查抛出的异常的类型是否可以分配给rethrowException方法声明的throws子句中的任何类型。然而，catch参数e的类型是Exception，它是FirstException和SecondException的超类型，而不是子类型。

## **数字文字中的下划线**

在Java SE 7及更高版本中，任何数量的下划线字符（_）都可以出现在数字文字的数字之间的任何位置。这个特性使你能够分隔数字文字中的数字组，例如，以改善代码的可读性。

例如，如果你的代码包含许多数字，你可以使用下划线字符将数字分隔成三位一组，就像你会使用逗号或空格作为分隔符一样。

以下示例展示了你可以如何在数字文字中使用下划线：

```java
long creditCardNumber = 1234_5678_9012_3456L;
long socialSecurityNumber = 999_99_9999L;
float pi = 3.14_15F;
long hexBytes = 0xFF_EC_DE_5E;
long hexWords = 0xCAFE_BABE;
long maxLong = 0x7fff_ffff_ffff_ffffL;
byte nybbles = 0b0010_0101;
long bytes = 0b11010010_01101001_10010100_10010010;
```

你只能在数字之间放置下划线；你不能在以下位置放置下划线：

- 在数字的开始或结束
- 在浮点文字中的小数点旁边
- 在F或L后缀之前
- 在期望数字串的位置

以下示例展示了数字文字中有效和无效的下划线放置（已高亮显示无效部分）：

```java
float pi1 = 3_.1415F;          // 无效；不能将下划线放在小数点旁边
float pi2 = 3._1415F;          // 无效；不能将下划线放在小数点旁边
long socialSecurityNumber1
  = 999_99_9999_L;             // 无效；不能将下划线放在L后缀之前

int x1 = _52;                  // 这是一个标识符，不是数字文字
int x2 = 5_2;                  // 正确（十进制文字）
int x3 = 52_;                  // 无效；不能将下划线放在文字的末尾
int x4 = 5_______2;            // 正确（十进制文字）

int x5 = 0_x52;                // 无效；不能在0x基数前缀中放置下划线
int x6 = 0x_52;                // 无效；不能将下划线放在数字的开始
int x7 = 0x5_2;                // 正确（十六进制文字）
int x8 = 0x52_;                // 无效；不能将下划线放在数字的末尾

int x9 = 0_52;                 // 正确（八进制文字）
int x10 = 05_2;                // 正确（八进制文字）
int x11 = 052_;                // 无效；不能将下划线放在数字的末尾
```

这样，你就可以在Java代码中更好地组织数字，提高代码的可读性。

**泛型实例创建的类型推断**

在Java中，你可以用一组空类型参数（<>）替换泛型类构造函数所需的类型参数，只要编译器能够从上下文中推断出类型参数。这一对尖括号在非正式地被称为“钻石”。

例如，考虑以下变量声明：

```java
Map<String, List<String>> myMap = new HashMap<String, List<String>>();
```

在Java SE 7中，你可以用空类型参数（<>）替换构造函数的参数化类型：

```java
Map<String, List<String>> myMap = new HashMap<>();
```

请注意，在泛型类实例化期间使用自动类型推断，你必须指定钻石。在以下示例中，编译器生成了一个未检查的转换警告，因为HashMap()构造函数引用了HashMap原始类型，而不是Map<String, List<String>>类型：

```java
Map<String, List<String>> myMap = new HashMap(); // unchecked conversion warning
```

Java SE 7支持有限的泛型实例创建类型推断；只有在构造函数的参数化类型从上下文中明显时，你才能使用类型推断。例如，以下示例不会编译：

```java
List<String> list = new ArrayList<>();
list.add("A");

// 以下语句应该失败，因为addAll期望
// Collection<? extends String>

list.addAll(new ArrayList<>());
```

请注意，钻石在方法调用中通常有效；然而，建议你主要用于变量声明。

相比之下，以下示例编译：

```java
// 以下语句编译：

List<? extends String> list2 = new ArrayList<>();
list.addAll(list2);
```

**泛型和非泛型类的泛型构造函数的类型推断**

请注意，构造函数可以是泛型（也就是声明它们自己的形式类型参数）在泛型和非泛型类中。考虑以下示例：

```java
class MyClass<X> {
  <T> MyClass(T t) {
    // ...
  }
}
```

考虑以下类MyClass的实例化，在Java SE 7和之前的版本中都是有效的：

```java
new MyClass<Integer>("")
```

这个语句创建了一个参数化类型 `MyClass<Integer>` 的实例；语句明确指定了泛型类 `MyClass<X>` 的形式类型参数X的类型为Integer。请注意，这个泛型类的构造函数包含一个形式类型参数T。因为这个构造函数的实际参数是一个String对象，编译器为这个泛型类的构造函数的形式类型参数T推断出String类型。

在Java SE 7之前的版本的编译器能够推断出泛型构造函数的实际类型参数，类似于泛型方法。然而，在Java SE 7中的编译器可以推断出被实例化的泛型类的实际类型参数，如果你使用钻石（<>）。考虑以下示例，在Java SE 7和以后的版本中都是有效的：

```java
MyClass<Integer> myObject = new MyClass<>("");
```

在这个示例中，编译器为泛型类 `MyClass<X>` 的形式类型参数X推断出类型Integer。它为这个泛型类的构造函数的形式类型参数T推断出类型String。

## var parmas

当然，以下是您提供内容的完整中文翻译：

### 在使用非可反射形式参数的可变参数方法时改进编译器警告和错误

#### 堆污染

大多数参数化类型，如 `ArrayList<Number>` 和 `List<String>`，都是非可反射类型。非可反射类型是运行时不完全可用的类型。在编译时，非可反射类型会经历一种称为类型擦除的过程，其中编译器删除与类型参数和类型参数有关的信息。这确保了与在泛型之前创建的Java库和应用的二进制兼容性。由于类型擦除在编译时删除了参数化类型的信息，这些类型是非可反射的。

堆污染发生在参数化类型的变量引用不是该参数化类型的对象时。这种情况只有在程序执行了一些操作并在编译时产生了未检查警告时才会发生。如果在编译时（在编译时类型检查规则的限制内）或运行时，无法验证涉及参数化类型的操作（例如，转换或方法调用）的正确性，就会生成未检查警告。

考虑以下示例：

```java
List l = new ArrayList<Number>();
List<String> ls = l;       // 未检查的警告
l.add(0, new Integer(42)); // 另一个未检查的警告
String s = ls.get(0);      // 抛出 ClassCastException
```

在类型擦除期间，类型 `ArrayList<Number>` 和 `List<String>` 分别变为 `ArrayList` 和 `List`。

变量 `ls` 具有参数化类型 `List<String>`。当将由 `l` 引用的 `List` 分配给 `ls` 时，编译器会生成未检查的警告；编译器无法确定在编译时，更不用说在运行时，`l` 是否引用了 `List<String>` 类型。因此，堆污染发生了。

因此，在编译时，编译器在添加语句处生成了另一个未检查的警告。编译器无法确定变量 `l` 是否引用了 `List<String>` 类型或 `List<Integer>` 类型（并且另一个堆污染情况发生了）。但是，编译器不会在获取语句处生成警告或错误。这个语句是有效的；它正在调用 `List<String>.get` 方法来检索 `String` 对象。然而，在运行时，获取语句抛出 `ClassCastException`。

#### 变量参数方法和非可反射形式参数

考虑以下示例中的 `ArrayBuilder.addToList` 方法。这是一个可变参数（也称为 varargs）方法，它将 `elements` 变量参数中的类型为 `T` 的对象添加到 `listArg` 中：

```java
public static <T> void addToList (List<T> listArg, T... elements) {
  for (T x : elements) {
    listArg.add(x);
  }
}
```

#### 可能的可变参数方法与非可反射形式参数的潜在漏洞

`ArrayBuilder.faultyMethod` 方法展示了编译器为何会对这些方法发出警告。此方法的第一个语句将变量参数 `l` 赋值给 `Object` 数组 `objectArray`：

```java
Object[] objectArray = l;
```

这个语句可能会引入堆污染。`objectArray` 的任何数组组件都可以被分配给 `l` 的参数化类型不匹配的值。但是，编译器在这个语句中不会生成未检查的警告。因为编译器在将变量参数 `List<String>... l` 转换为 `List[] l` 时已经生成了警告。这个语句是有效的；变量 `l` 有类型 `List[]`，它是 `Object[]` 的子类型。

#### 抑制非可反射形式参数的可变参数方法的警告

如果您声明了一个具有参数化参数的可变参数方法，并确保该方法的体不会由于对变量参数的不当处理（如 `ArrayBuilder.faultyMethod` 方法所示）而抛出 `ClassCastException` 或其他类似异常，您可以通过以下选项来抑制编译器为这些可变参数方法生成的警告：

1. 为静态和非构造方法声明添加以下注解：

```java
@SafeVarargs
```

2. 在方法声明中添加以下注解：

```java
@SuppressWarnings({"unchecked", "varargs"})
```

3. 使用

编译器选项 `-Xlint:varargs`。

这样，编译器会为这些方法生成警告，提醒您可能的堆污染风险。




# 多线程 classLoader

Java SE 7中的多线程自定义类加载器增强是一个重要的改进，旨在解决在之前Java版本中可能出现的死锁问题。以下是主要内容的概述：

### 背景
- `java.lang.ClassLoader`的主要功能是定位和转换字节码为可用的类。
- CLASSPATH环境变量指示运行时系统字节码的位置。
- 可以创建自定义类加载器来自定义类加载的行为。

### 死锁场景
- 在不遵循无环类加载器委托模型的多线程自定义类加载器中可能会发生死锁。
- 使用两个自定义类加载器CL1和CL2描述了死锁场景，其中线程1尝试锁定CL1同时需要锁定CL2，而线程2尝试锁定CL2同时需要锁定CL1。

### Java SE 7中的类加载器同步
- Java SE 7发布引入了并行可用类加载器的概念。
- 由并行可用类加载器加载类现在同步于类加载器和类名的对。
- 这个改变消除了先前描述的死锁场景。

### 多线程自定义类加载器的建议
- 遵循推荐的无环层次委托模型的现有自定义类加载器无需更改。
- 对于新的自定义类加载器，建议覆盖`findClass()`方法和可能的`loadClass()`方法。
- 有死锁风险的自定义类加载器应遵循特定的规则以确保多线程安全性，包括实现内部锁定方案和调用`registerAsParallelCapable()`。

### 故障排除
- 提供了一个新的VM标志`-XX:+AlwaysLockClassLoader`，以便在需要时回到以前的锁定行为。

### 参考
- OpenJDK上的类加载器API修改以解决死锁问题
- Bug数据库Bug 4670071详情
- Java类加载内部，Binildas Christudas，O'Reilly Media onJava.com
- 解密类加载问题，第4部分：死锁和约束，Simon Burns和Lakshmi Shankar，IBM developerWorks

这一增强确保了Java SE 7中自定义类加载器的更好的并发控制，减少了死锁的可能性，提高了使用自定义类加载的多线程应用程序的可靠性和性能。



# 官方

https://www.oracle.com/java/technologies/javase/jdk7-relnotes.html

### Java SE 7 中的 Swing 增强

#### JLayer 类
JLayer 类是 Swing 组件的一个灵活且强大的装饰器。它允许你在组件上绘制并响应组件事件，而无需直接修改底层组件。更多信息，请参阅 Java 教程中的“如何使用 JLayer 装饰组件”。

#### Nimbus 外观
Nimbus 外观（Look & Feel）已经从 `com.sun.java.swing` 移动到标准的 API 命名空间 `javax.swing`；详细信息请查看 `javax.swing.plaf.nimbus` 包。虽然它不是默认的外观，但你可以轻松使用它。在 Java 教程中的“Nimbus 外观”部分可以为你提供更多信息以及使用 Nimbus 的三种简单方法的示例。

#### 重量级和轻量级组件
历史上，在同一容器中混合使用重量级（AWT）和轻量级（Swing）组件一直是问题所在。然而，在 Java SE 7 中，混合使用重量级和轻量级组件变得容易。请查看“混合使用重量级和轻量级组件”文章了解更多信息。

#### 形状和半透明窗口
Java SE 7 支持带有透明度和非矩形形状的窗口。请参阅 Java 教程中的“如何创建半透明和形状窗口”部分。

#### 在 JColorChooser 类中使用色彩选择的 HSL 模型
JColorChooser 类中新增了一个 HSV 标签，允许用户使用色相-饱和度-亮度（HSL）色彩模型选择颜色。

### Java I/O 的增强

#### Java SE 7 中的增强
`java.nio.file` 包及其相关的 `java.nio.file.attribute` 包为文件 I/O 和访问文件系统提供了全面的支持。JDK 7 还提供了一个 zip 文件系统提供者。以下资源提供更多信息：

- 在 Java 教程中关于 NIO 2.0 的文件 I/O
- 开发自定义文件系统提供者
- Zip 文件系统提供者

目录 `<Java home>/sample/nio/chatserver/` 包含演示 `java.nio.file` 包中新 API 的示例。

目录 `<Java home>/demo/nio/zipfs/` 包含演示 NIO.2 NFS（网络文件系统）的示例。

此外，引入了以下增强：

**区域**: NIO  
**标准/平台**: JDK 7  
**简介**: 在 JDK 7 发布之前，使用 `java.nio.ByteBuffer.allocateDirect(int)` 分配的直接缓冲区在页面边界上对齐。在 JDK 7 中，实现已更改，直接缓冲区不再对齐于页面。这应该可以减少创建大量小缓冲区应用程序的内存需求。  
**RFE**: 4837564

#### Java SE 6 中的增强
**java.io**  
- 新增了一个类：`Console` - 包含访问基于字符的控制台设备的方法。`readPassword()` 方法禁用回显，因此适用于检索如密码等敏感数据。
- 新增了文件的几种方法，如 `getTotalSpace()`, `getFreeSpace()`, `getUsableSpace()` 以及与文件权限相关的方法。

**java.nio**  
- 新增了基于 Linux epoll 事件通知设施的 `SelectorProvider` 实现。

#### J2SE 5.0 中的增强
**java.nio**  
- 新增了 `javax.net.ssl.SSLEngine` 类，它为 `javax.net.ssl.SSLSocket` 提供了一个 I/O 模型的抽象。

#### Java 2 SDK v1.4 中的增强
**java.io**  
- 在 `FileInputStream` 和 `FileOutputStream` 类中，添加了 `getChannel` 方法以返回底层的 `FileChannel` 对象。

**java.nio**  
- nio 包被添加以补充 `java.io` 包提供的 I/O 功能。

### 先前的增强
- `java.io.File` 类的特性描述了对该类的更改。
- 其他更改描述了对 `java.io` 包的修改。
- 字符流讨论了对 `java.io` 类包进行早期更改以支持字符流。


### Java SE 7 中的网络增强

#### URLClassLoader.close 方法

新增了 `URLClassLoader.close` 方法。这个方法有效地解决了如何支持从特定代码库（尤其是从 JAR 文件）加载的类和资源的更新实现的问题。

#### Sockets Direct Protocol (SDP)

Sockets Direct Protocol（SDP）提供了对高性能网络连接的访问。

### Java SE 7 安全增强

#### Java SE 7 Update 4 中的增强
**区域**: JCE  
**简介**: 引入了 Apple 提供者，该提供者实现了一个 `java.security.KeyStore`，提供对 Mac OS X Keychain 的访问。这是 RFE JDK-7113349 的一部分，该 RFE 是针对 Mac OS X 的 JDK 移植。查看[Java Cryptography Architecture Oracle Providers 文档](#)中的“Apple 提供者”部分以获取更多信息。

#### Java SE 7 Update 2 中的增强
**区域**: Java Cryptography Extension  
**简介**: 在 Solaris 11 上，SunPKCS11 JCE 安全提供者现在可以正确地解析包含椭圆曲线密码学（ECC）密钥的公钥证书。查看 [7054637](#)。

#### Java SE 7 中的增强
Java SE 7 发布增加了以下功能：

- **椭圆曲线密码学 (ECC)**: 新增了一个本地提供者，提供了几个基于 ECC 的算法（ECDSA/ECDH）。
  
- **CertPath 算法禁用**: 弱加密算法现在可以被禁用。例如，MD2 摘要算法现在不再被视为安全的。

- **JSSE (SSL/TLS)**:
  - TLS 1.1 和 TLS 1.2 的支持。
  - 弱密码套件已被弃用。
  - 连接敏感的信任管理。
  - 端点验证。
  - TLS 重新协商。

- **其他增强**:
  - 定义了 Java SE 7 的安全算法要求。
  - `KeyManagerFactory` 的标准算法名为 "PKIX"。
  - 支持 TLS 1.2 的 SunJSSE 提供者。

这些只是 Java SE 7 安全增强的一部分。这些增强都是为了提高 Java 的安全性和可靠性，特别是在加密和网络通信方面。


### Java SE 7 中的并发工具增强

#### Fork/Join 框架
基于 `ForkJoinPool` 类的 fork/join 框架是 `Executor` 接口的实现。它旨在使用一个工作线程池高效地运行大量任务。采用工作窃取技术，确保所有工作线程都保持忙碌，充分利用多处理器。更多信息，请参阅[Java 教程中的 Fork/Join](#)。目录 `<Java home>/sample/forkjoin/` 包含展示 fork/join 框架的示例。

#### ThreadLocalRandom 类
`ThreadLocalRandom` 类使用伪随机数消除线程之间的争用。查看[并发随机数](#)。

#### Phaser 类
`Phaser` 类是一个新的同步屏障，类似于 `CyclicBarrier`。

### Java 丰富的互联网应用 - 开发、部署和运行时增强

这些文档页面已经不再是最新的。它们仍然可用于存档目的。请访问 [Oracle 的 Java SE 文档](https://docs.oracle.com/javase) 获取最新的文档。

#### Java 丰富的互联网应用指南 > 增强和其他功能 > Java 丰富的互联网应用 - 开发、部署和运行时增强

Java 丰富的互联网应用（RIA）技术正在变得越来越复杂。在每个 Java Runtime Environment（JRE）软件的发布中都会添加新的功能。这个快速参考帮助您跟上这个充满活力的技术，并实现在所有客户端 JRE 软件版本上都能优雅地运行的 RIA 解决方案。这个快速参考提供了从 Java SE 6 update 10 发布开始的每个 JRE 软件版本中添加的重要功能的信息。

#### JDK 7
**Java 丰富的互联网应用增强 - JDK 7**

#### Java SE 6 update 21
- **自定义加载进度指示器**: 自定义加载进度指示器可以访问 applet 上下文并在父网页中调用 JavaScript 代码。

#### Java SE 6 update 18
- **自定义加载进度指示器**: 自定义加载进度指示器可以在顶级窗口或 applet 容器中显示。默认的闪屏屏幕不再显示。从缓存加载时显示自定义闪屏屏幕。

#### Java SE 6 update 10
- **Java Network Launch Protocol (JNLP) 支持**: 下一代 Java 插件使可以使用 JNLP 部署并可以访问 JNLP API 的 applet 成为可能。
- **可拖拽的 applet**: 如果指定为“可拖拽”，applet 可以从浏览器拖出。
- **闪屏屏幕**: 如果指定，显示自定义闪屏屏幕。

https://docs.oracle.com/javase/tutorial/deployment/applet/draggableApplet.html#decoration


### Java SE 7 中的 Java 2D 增强

#### XRender-Based 渲染管线
为现代基于 X11 的桌面支持的新的基于 XRender 的 Java 2D 渲染管线提供了改进的图形性能。该管线默认禁用，但可以通过设置命令行属性 `-Dsun.java2d.xrender=true` 来启用。旧的 X11 配置可能无法支持 XRender。可以使用 `-Dsun.java2d.xrender=True` 的详细形式来启用一个消息，指示管线是否实际上已被启用。

此标志列在 Java 2D 技术页面的系统属性中。

#### 支持 OpenType/CFF 字体
JDK 现在通过诸如 `GraphicsEnvironment.getAvailableFontFamilyNames` 这样的方法枚举并显示已安装的 OpenType/CFF 字体；这些字体也被 `Font.createFont` 方法所识别。查看 [Java 教程中的选择字体](#)。

#### TextLayout 对藏文脚本的支持
`TextLayout` 类支持藏文脚本。

#### 支持 Linux 字体
对于 Solaris 和 Windows，JDK 的逻辑字体在 `fontconfig.properties` 文件中静态指定。在各种 Linux 实现中，不能保证特定字体支持特定语言环境。从 Java SE 7 开始，`libfontconfig` 被用来为 "未识别" 的 Linux 平台选择要使用的字体。查看 [Fontconfig](#) 获取更多信息。

### Java XML 技术增强

#### Java SE 7u45 中的增强
在 7u45 发布中，JAXP 添加了三个处理限制。更多信息，请参阅 Java 教程中的新处理限制课程。

#### Java SE 7u40 中的增强
7u40 发布包含了 Java API for XML Processing (JAXP) 1.5，该版本增加了限制可用于获取外部资源的网络协议的功能。更多信息，请参阅 [JEP 185: JAXP 1.5: 限制外部资源获取](#) 和 Java 教程中的新 JAXP 1.5 和新属性课程。

#### Java SE 7 中的增强
**JAXP**
Java SE 7 发布现在包含了 Java API for XML Processing (JAXP) 1.4.5。
与前一个版本相比，特别是在符合性、安全性和性能方面，已进行了许多错误修复和一些改进。
规范仍然是 JAXP 1.4，但根据 JSR 173 维护审查 3，StAX 已升级到 StAX 1.2。

**JAXB**
Java SE 7 发布支持 Java Architecture for XML Binding (JAXB) 2.2.3。更多信息，请参阅 JAXB RI 2.2 及以上的 [JAXB 变更日志](#)。

**JAX-WS**
Java SE 7 发布支持 Java API for XML Web Services (JAX-WS) 2.2.4。更多信息，请参阅 JAX-WS RI 2.2 及以上的 [JAX-WS 变更日志](#)。

### Java SE 7 中的国际化增强

#### Unicode 6.0.0 中的新脚本和字符
Java SE 7 的早期版本添加了对 Unicode 5.1.0 的支持。Java SE 7 最终版本支持 Unicode 6.0.0。Unicode 6.0.0 是 Unicode 标准的一个主要版本，增加了对 2000 多个额外字符的支持，以及对属性和数据文件的支持。

Java 教程有一个新部分讨论 Unicode。

#### ISO 4217 货币代码的可扩展支持
货币由其 ISO 4217 代码标识。这些代码由外部机构维护，并且独立于 Java SE 平台发布。从 Java SE 7 开始，可以在不需要 JDK 新版本的情况下适应新货币。

要在运行时替换默认货币，请创建一个名为 `<JAVA_HOME>/lib/currency.properties` 的属性文件。此文件包含 ISO 3166 国家代码和 ISO 4217 货币数据的键/值对。值部分包含三个逗号分隔的 ISO 4217 货币值：字母代码、数字代码和次单位。以井字符 `#` 开头的任何行都将视为注释行。例如：

```properties
# 日本的样本货币属性
JP=JPZ,999,0
```

此功能的新 API 包括以下方法，全部位于 `Currency` 类中：

- `getAvailableCurrencies` – 返回可用货币的集合。
- `getNumericCode` – 返回此货币的 ISO 4217 数字代码。
- `getDisplayName` – 获取适用于默认语言环境的此货币的名称。
- `getDisplayName(Locale)` – 获取适用于指定语言环境的此货币的名称。

#### 类别 Locale 支持
默认语言环境可以独立设置为两种类型的用途：格式设置用于格式化资源，显示设置用于菜单和对话框。新的 `getDefault(Locale.Category)` 方法接受一个 `Locale.Category` 参数。将 `FORMAT` 枚举传递给该方法返回用于格式化资源的默认语言环境。同样，传递 `DISPLAY` 枚举返回 UI 使用的默认语言环境。`setDefault(Locale.Category, Locale)` 方法用于设置指定类别的语言环境。无参数的 `getDefault` 方法返回 `DISPLAY` 默认值。

在 Microsoft Windows 上，这些默认值根据 Windows 控制面板中的 "标准和格式" 和 "显示语言" 设置进行初始化。

#### Locale 类支持 BCP47 和 UTR35
`Locale` 类已更新以实现与 BCP 47（IETF BCP 47，“用于标识语言的标签”）互换的标识符，支持 LDML（UTS#35，“Unicode 语言环境数据标记语言”）BCP 47 兼容扩展以进行语言环境数据交换。

在此版本中，`Locale` 类添加了以下嵌套类：

- `Locale.Builder` 可用于创建 `Locale` 实例并使用 setter 方法配置该实例。

以下方法已添加到 `Locale` 类：

- `getExtensionKeys()`
- `getExtension(char)`
- `getUnicodeLocaleType(String)`
- `getUnicodeLocaleKeys()`
- `getUnicodeLocaleAttributes()`
- `forLanguageTag(String)`
- `toLanguageTag()`
- `getScript()`
- `getDisplayScript()`
- `getDisplayScript(Locale)`

以下常量已添加到 `LOCALE` 类：

- `UNICODE_LOCALE_EXTENSION`
- `PRIVATE_USE_EXTENSION`

更多信息，请参阅 Java 教程中的创建 `Locale` 和 BCP 47 扩展课程。

#### 新的 `NumericShaper` 方法
`NumericShaper` 类用于将 Latin-1（欧洲）数字转换为其他 Unicode 十进制数字。对于 Java SE 7 发布，已添加了 `NumericShaper.Range` 枚举来表示具有自己十进制数字的脚本的 Unicode

 范围。使用 `NumericShaper.Range` 枚举的以下方法已添加到 Java SE 7 发布：

- `getShaper(NumericShaper.Range)` - 返回提供的 Unicode 范围的整形器。
- `getContextualShaper(Set<NumericShaper.Range>)` - 返回提供的 Unicode 范围的上下文整形器。整形器假设欧洲作为起始上下文。
- `getContextualShaper(Set<NumericShaper.Range> NumericShaper.Range)` - 返回提供的 Unicode 范围的上下文整形器。整形器使用默认上下文作为起始上下文。
- `shape(char[], int, int, NumericShaper.Range)` - 使用提供的上下文转换文本中在 start 和 start + count 之间出现的数字。

更多信息，请参阅 Java 教程中的将拉丁数字转换为其他 Unicode 数字课程。

#### 正则表达式 API 中的 Unicode 6.0 支持
正则表达式模式匹配功能已扩展以支持 Unicode 6.0。您可以使用 `\u` 或 `\x` 转义序列匹配 Unicode 代码点。

Java 教程中的 Unicode 支持页面有更多信息。

### 增强的 `java.lang.*` 和 `java.util.*` 包

#### Java SE 7 的增强
- **多线程自定义类加载器**：在 Java SE 7 中，对于多线程、非层次性委托的自定义类加载器消除了潜在的死锁问题。新的 API 已添加到 `java.lang.ClassLoader` 类中，以支持类的并行加载和更细粒度的锁定机制。

- **`MirroredTypeException` 和 `MirroredTypesException`**：在 `javax.lang.model.type` 包中，`MirroredTypeException` 现在是 `MirroredTypesException` 的子类，以修正与 `javac` 实现相关的问题。

- **`javax.lang.model.*` 更新**：为了模拟此版本中的语言更改，对 `javax.lang.model.*` 进行了几个更新，包括添加了一个方法到 `javax.lang.model.type.TypeVisitor` 接口。

- **`Runtime.exec` 方法**：在 Windows 操作系统上，由于白空格分割命令参数可能导致错误，特别是当命令参数包含带空格的可执行路径时。现在，可以通过设置系统属性 `jdk.lang.Process.allowAmbiguousCommands` 来解决这个问题。

- **`java.util.TreeMap` 修复**：由于 `java.util.TreeMap` 中的错误，之前可能在空 `TreeMaps` 和 `TreeSets` 中插入无效的 `null` 元素和不实现 `Comparable` 的元素。现在，这将引发 `NullPointerException`。

#### Java SE 6 的增强
- **ServiceLoader**：加载特定服务的实现。
- **集合框架增强**：对集合框架有许多增强。

#### Java SE 5 的增强
- **`ProcessBuilder`**：提供了比 `Runtime.exec` 更方便的子进程调用方式。
- **线程增强**：包括线程优先级处理、`Thread.State` 枚举类和新的 `getState()` API，以及 `uncaughtExceptionHandler` 机制。

#### Java SE 1.4 的增强
- **`Chained Exception Facility`**：提供了一个公共 API 来记录一个异常导致另一个异常的事实。
- **`String` 和 `StringBuffer`**：增加了 `subSequence` 方法。
- **`Thread`**：修改了 `interrupt` 方法以中断在通道 I/O 操作中阻塞的线程。
- **`java.util.logging`**：提供了日志记录 API。
- **`java.util.prefs`**：提供了偏好设置 API。

#### Java SE 1.3 的增强
- **`java.lang.Math` 和 `java.lang.StrictMath`**：提供了通用数值操作的 API。
- **`Timer API`**：提供了一个定时器设施的 API。
  
#### Java SE 1.2 的增强
- **增强的集合框架**：添加了 `Collections.singletonList`、`Collections.singletonMap` 和 `Collections.EMPTY_MAP`。
  
- **`java.util.jar` 和 `java.util.zip`**：增加了新的 URL JAR 文件缓存功能。

这些增强为 Java 平台带来了更多功能和灵活性，使得开发人员能够更有效地编写代码和解决问题。




------------------------------------------------------------------------------------------------------------------------------------------


# 核心变化

JDK 7（Java Development Kit 7）引入了一系列重要的特性和改进，以下是一些核心特性的概述：

1. **Project Coin**：这是一系列语言上的改进，包括支持String的switch语句、try-with-resources用于自动关闭资源、更简洁的泛型语法（钻石操作符）、数字字面量中使用下划线分隔等。

2. **多异常捕获**：允许在catch块中捕获多个异常类型，提高了代码的可读性和简洁性。

3. **二进制字面量和下划线分隔符**：支持在整数字面量中使用二进制前缀（如`0b1101`）和下划线分隔符，增强了代码的可读性。

4. **自动资源管理**：通过try-with-resources语句，可以自动关闭实现了`AutoCloseable`接口的资源，减少了资源泄露的风险。

5. **NIO.2**：引入了新的文件系统API，提供了对文件系统的更强大的操作能力，包括文件系统的访问、监控和操作。

6. **Fork/Join框架**：引入了一个用于并行计算的框架，支持多核处理器上的高效并发执行。

7. **G1垃圾收集器**：引入了一种新的低延迟、高吞吐量的垃圾收集器，旨在减少Full GC的暂停时间。

8. **类加载器的改进**：为了防止多线程自定义类加载时产生的死锁问题，`java.lang.ClassLoader`类增加了新的API。

9. **支持更多的动态语言**：通过JSR 292a（也称为“InvokeDynamic”），改进了Java与动态语言如Ruby和Python的兼容性。

10. **性能和安全性提升**：包括对JVM的多项性能优化和安全特性的增强。

11. **增强的Swing组件**：提供了更好的GUI组件支持，包括对Nimbus Look&Feel的支持和窗口形状与透明度的改进。

12. **Socket和文件的异步I/O**：完善了`SocketChannel`的功能，支持异步I/O操作。

13. **JDBC 4.1**：更新了数据库连接规范，支持了JDBC 4.1和Rowset 1.1。

14. **XML和加密更新**：包括对XML组件的更新和对加密算法的支持增强。

这些特性共同提升了Java平台的性能、可用性和开发者的生产力。

# 详细介绍一下 jdk7 中的 Fork/Join框架+具体例子

# 详细介绍一下 jdk7 中的 Fork/Join框架+具体例子

JDK 7 引入了 Fork/Join 框架，这是一个用于并行执行任务的框架，它利用了现代多核处理器的计算能力，通过将任务分割成更小的子任务并行执行来提高性能。Fork/Join 框架特别适合于可以被分解为多个子任务的递归算法，如归并排序、快速排序、树的遍历等。

### Fork/Join 框架的核心组件：

1. **RecursiveTask** - 一个抽象类，用于有返回值的任务。
2. **RecursiveAction** - 一个抽象类，用于无返回值的任务。
3. **ForkJoinTask** - 这两个类共同的基类，表示一个可以被分解的任务。
4. **ForkJoinPool** - 一个特殊的线程池，用于执行 ForkJoinTask 任务。

### 工作原理：

Fork/Join 框架的工作原理是将一个复杂的任务分解（fork）成多个小任务，这些小任务可以独立地并行执行。

当子任务足够小或者接近完成时，它们会被 join（合并）起来，以减少等待时间并提高效率。

### 具体例子：

以下是一个使用 Fork/Join 框架实现的简单归并排序的例子：

```java
import java.util.Arrays;
import java.util.concurrent.RecursiveAction;
import java.util.concurrent.ForkJoinTask;
import java.util.concurrent.Phaser;

public class ForkJoinMergeSort {

    static class MergeSortTask extends RecursiveAction {
        private int[] array; // 要排序的数组
        private int left;    // 子数组的起始索引
        private int right;   // 子数组的结束索引

        public MergeSortTask(int[] array, int left, int right) {
            this.array = array;
            this.left = left;
            this.right = right;
        }

        @Override
        protected void compute() {
            if (left < right) {
                int middle = (left + right) / 2;
                // 分解任务
                invokeAll(new MergeSortTask(array, left, middle), new MergeSortTask(array, middle + 1, right));

                // 合并任务
                merge(array, left, middle, right);
            }
        }

        private void merge(int[] array, int left, int middle, int right) {
            int[] leftArray = Arrays.copyOfRange(array, left, middle + 1);
            int[] rightArray = Arrays.copyOfRange(array, middle + 1, right + 1);

            System.arraycopy(leftArray, 0, array, left, leftArray.length);
            System.arraycopy(rightArray, 0, array, middle + 1, rightArray.length);

            // 合并两个有序数组
            for (int i = left, p = 0, q = middle + 1; i <= right; i++) {
                if (p < leftArray.length && (q > right || leftArray[p] <= array[q])) {
                    array[i] = leftArray[p++];
                } else {
                    array[i] = array[q++];
                }
            }
        }
    }

    public static void main(String[] args) {
        int[] array = {9, 5, 6, 2, 1, 9, 3, 6, 8, 7};
        new ForkJoinPool().invoke(new MergeSortTask(array, 0, array.length - 1));
        System.out.println("Sorted Array: " + Arrays.toString(array));
    }
}
```

在这个例子中，我们定义了一个 `MergeSortTask` 类，它继承自 `RecursiveAction`。在 `compute` 方法中，我们将原始的排序任务分解成两个子任务，然后并行地执行这些子任务。当子任务执行完毕后，我们调用 `merge` 方法来合并排序结果。

`ForkJoinPool` 是 Fork/Join 框架的执行器，它负责调度和执行 `ForkJoinTask`。在 `main` 方法中，我们创建了一个 `ForkJoinPool` 实例，并用它来执行我们的归并排序任务。

请注意，由于 Fork/Join 框架的内部实现细节和工作窃取算法，它在处理具有良好分割并行性的任务时效果最佳。此外，过度分解任务可能导致线程创建和管理的开销超过并行执行的收益。



# Project Coin 的详细介绍+具体例子

Project Coin 是 OpenJDK 中的一个项目，旨在收集对 Java 语言语法进行增强的建议。这个项目在 JDK 7 的开发过程中起到了重要作用，它通过社区的广泛讨论，收集并筛选了一系列语言上的改进提案。以下是 Project Coin 的详细介绍和具体例子：

### Project Coin 的目标和过程：
- Project Coin 的目标是决定哪些小的语言特性变更将被添加到 JDK 7 中。这个项目通过 JCP（Java Community Process）以 JSR 334（Small Enhancements to the Java Programming Language）的形式提交。
- 公开征求建议阶段从 2009 年 2 月 27 日至 2009 年 3 月 30 日，期间收到近 70 条提议。
- 最终，9 条提议被列入考虑，其中 6 条被采纳为 Java 7 的一部分，其余的在后续版本中考虑。

### Project Coin 引入的特性：

1. **switch语句中使用字符串**：在 Java 7 之前，switch 语句只支持整数类型和枚举类型。Project Coin 允许在 switch 语句中使用字符串。

   ```java
   public String getTypeOfDay(String day) {
       switch (day) {
           case "Monday": return "Start of work week";
           // ... other cases ...
           default: return "It's a day!";
       }
   }
   ```

2. **二进制整数字面量及数字字面量中的下划线**：允许在整数字面量中使用二进制前缀（如`0b1101`）和下划线分隔符，增强了代码的可读性。

   ```java
   long creditCardNumber = 1234_5678_9012_3456L;
   byte nybbles = 0b0010_0101;
   ```

3. **多异常捕获**：可以在一个 catch 块中捕获多个异常类型。

   ```java
   try {
       // code that may throw exceptions
   } catch (IOException | SQLException ex) {
       // handle the exception
   }
   ```

4. **泛型创建简化（钻石操作符）**：在创建泛型实例时，如果上下文已经提供了类型信息，则可以省略泛型类型参数。

   ```java
   List<String> list = new ArrayList<>();
   ```

5. **try-with-resources语句**：自动管理资源，确保在代码结束时自动关闭资源。

   ```java
   try (BufferedReader br = new BufferedReader(new FileReader("file.txt"))) {
       // read from br
   }
   ```

6. **简化的变长参数方法调用**：改进了可变参数方法的调用方式，减少了代码量。

   ```java
   public class ArrayBuilder {
       public static <T> void addToList(List<T> list, T... elements) {
           for (T element : elements) {
               list.add(element);
           }
       }
   }
   ```

Project Coin 的这些改进虽然单个看起来不大，但它们共同提升了 Java 语言的易用性和开发效率。通过这些改进，开发者能够编写更简洁、更易于维护的代码。

# 详细介绍一下 jdk7 中的 NIO.2+具体例子

JDK 7 引入了 NIO.2，这是一个对原有 NIO 包的扩展，它提供了一套新的文件系统API，使得文件I/O操作变得更加强大和灵活。NIO.2 的核心组件包括`java.nio.file`包，它定义了文件和文件系统的访问、监控和操作的类和接口。

### NIO.2 的主要特性：

1. **Path 接口**：表示文件系统中的一个路径，可以是绝对路径或相对路径。

2. **Files 类**：提供了大量静态方法用于文件操作，如创建、删除、移动、复制文件，以及检查文件是否存在等。

3. **WatchService API**：允许程序异步地监控文件系统中文件和目录的变化。

4. **FileVisitor**：用于遍历目录树的接口。

5. **FileStore**：表示一个文件存储池，如硬盘分区或内存卡。

6. **FileSystem**：表示一个文件系统，可以是本地文件系统，也可以是通过网络共享的文件系统。

### 具体例子：

#### 创建和写入文件：

```java
import java.nio.file.*;

public class NioExample {
    public static void main(String[] args) {
        try {
            Path path = Paths.get("example.txt");
            if (Files.notExists(path)) {
                // 创建文件
                Files.createFile(path);
            }
            
            // 写入文件
            String content = "Hello, World!";
            Files.write(path, content.getBytes());
            
            System.out.println("File created and written to.");
        } catch (Exception e) {
            e.printStackTrace();
        }
    }
}
```

#### 读取文件内容：

```java
import java.nio.file.*;

public class ReadFileExample {
    public static void main(String[] args) {
        Path path = Paths.get("example.txt");
        try {
            // 读取文件内容到字符串
            String content = new String(Files.readAllBytes(path));
            System.out.println(content);
        } catch (Exception e) {
            e.printStackTrace();
        }
    }
}
```

#### 监控文件变化：

```java
import java.nio.file.*;

public class WatchFileExample {
    public static void main(String[] args) {
        Path path = Paths.get("example.txt");
        try (WatchService watchService = FileSystems.getDefault().newWatchService()) {
            // 注册监控
            path.register(watchService, StandardWatchEventKinds.ENTRY_MODIFY);
            
            while (true) {
                // 等待事件发生
                WatchKey key = watchService.take();
                for (WatchEvent<?> event : key.pollEvents()) {
                    System.out.println("Event detected: " + event.kind());
                }
                key.reset();
            }
        } catch (Exception e) {
            e.printStackTrace();
        }
    }
}
```

#### 遍历目录：

```java
import java.nio.file.*;

public class DirectoryTraversal {
    public static void main(String[] args) {
        Path startPath = Paths.get("/path/to/directory");
        try {
            Files.walkFileTree(startPath, new SimpleFileVisitor<Path>() {
                @Override
                public FileVisitResult visitFile(Path file, BasicFileAttributes attrs) {
                    System.out.println("Visited file: " + file);
                    return FileVisitResult.CONTINUE;
                }

                @Override
                public FileVisitResult visitFileFailed(Path file, IOException exc) {
                    System.err.println("Failed to visit file: " + file);
                    return FileVisitResult.CONTINUE;
                }
            });
        } catch (IOException x) {
            x.printStackTrace();
        }
    }
}
```

NIO.2 通过提供这些API，极大地简化了文件I/O操作，并且支持异步操作，使得文件系统编程更加高效和灵活。

以上例子展示了 NIO.2 的基本用法，实际应用中可以根据需要进行更复杂的操作和组合使用。





# 官方笔记

[jdk7 更新日志](https://www.oracle.com/java/technologies/javase/jdk7-relnotes.html)






* any list
{:toc}