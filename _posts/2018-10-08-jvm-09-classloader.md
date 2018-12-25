---
layout: post
title:  JVM-09-classloader
date:  2018-10-08 16:04:16 +0800
categories: [JVM]
tags: [java, log, jvm, sf]
published: true
---

# ClassLoader

官方概念，看一下即可。

## 类定义

```java
public abstract class ClassLoader
extends Object
```

## 概念

类装入器是负责装入类的对象。类类装入器是一个抽象类。给定类的二进制名称，类装入器应该尝试定位或生成构成类定义的数据。

典型的策略是将名称转换为文件名，然后从文件系统中读取该名称的“类文件”。

每个类对象都包含对定义它的类加载器的引用。

数组类的类对象不是由类装入器创建的，而是按照Java运行时的要求自动创建的。 

Class.getClassLoader() 返回数组类的类装入器与其元素类型的类装入器相同; 如果元素类型是原始类型，那么数组类没有类装入器。

应用程序实现类装入器的子类，以便扩展Java虚拟机动态装入类的方式。

安全管理器通常使用类装入器来指示安全域。

ClassLoader 类使用委托模型来搜索类和资源。ClassLoader 的每个实例都有一个关联的父类装入器。

当请求查找类或资源时，类装入器实例将把对类或资源的搜索委托给它的父类装入器，然后再尝试查找类或资源本身。

虚拟机的内置类装入器(称为“引导类装入器”)本身没有父类，但可以作为类装入器实例的父类。

支持类并发加载的类装入器称为具有并行能力的类装入器，通过调用类装入器在类初始化时 ClassLoader.registerAsParallelCapable() 注册它们自己。

注意，ClassLoader类在默认情况下被注册为并行。但是，如果子类具有并行能力，那么它们仍然需要注册自己。

在委托模型没有严格分层的环境中，类装入器需要具有并行能力，否则类装入会导致死锁，因为装入器锁是在类装入过程期间持有的。

通常，Java虚拟机以平台依赖的方式从本地文件系统加载类。例如，在UNIX系统上，虚拟机从CLASSPATH环境变量定义的目录加载类。

但是，有些类可能不是来自文件; 它们可能来自其他来源，如网络，也可能由应用程序构建。

方法 defineClass 将字节数组转换为类的实例。这个新定义的类的实例可以使用 Class.newInstance 创建。

类装入器创建的对象的方法和构造函数可以引用其他类。为了确定所引用的类(es)， Java虚拟机调用最初创建类的类装入器的 loadClass 方法。

# 基本概念

## 作用

类加载器（class loader）用来加载 Java 类到 Java 虚拟机中。

一般来说，Java 虚拟机使用 Java 类的方式如下：

Java 源程序（`.java` 文件）在经过 Java 编译器编译之后就被转换成 Java 字节代码（`.class` 文件）。

类加载器负责读取 Java 字节代码，并转换成 java.lang.Class 类的一个实例。

每个这样的实例用来表示一个 Java 类。

通过此实例的 newInstance() 方法就可以创建出该类的一个对象。

实际的情况可能更加复杂，比如 Java 字节代码可能是通过工具动态生成的，也可能是通过网络下载的。

可以为 **java 应用程序提供高度的灵活性**。

## 方法

| 方法	| 说明 |
|:---|:---|
| `getParent()` | 返回该类加载器的父类加载器 |
| `loadClass(String name)` | 加载名称为 name 的类，返回的结果是 java.lang.Class 类的实例 |
| `findClass(String name)` | 查找名称为 name 的类，返回的结果是 java.lang.Class 类的实例 |
| `findLoadedClass(String name)` | 查找名称为 name 的已经被加载过的类，返回的结果是 java.lang.Class 类的实例 |
| `defineClass(String name, byte[] b, int off, int len)` | 把字节数组 b 中的内容转换成 Java 类，返回的结果是 java.lang.Class 类的实例 |
| `resolveClass(Class<?> c)` | 链接指定的 Java 类 |

# 类加载的过程

## 生命周期

类从被加载到虚拟机内存中开始，到卸载出内存为止。

它的生命周期包括了：

加载(Loading)、验证(Verification)、准备(Preparation)、解析(Resolution)、初始化(Initialization)、使用(Using)、卸载(Unloading)七个阶段，
其中验证、准备、解析三个部分统称链接。

## 顺序

加载(装载)、验证、准备、初始化和卸载这五个阶段顺序是固定的，类的加载过程必须按照这种顺序开始。

而解析阶段不一定，它在某些情况下可以在初始化之后再开始，这是为了**运行时动态绑定特性**（JIT例如接口只在调用的时候才知道具体实现的是哪个子类）。

值得注意的是：这些阶段通常都是互相交叉的混合式进行的，通常会在一个阶段执行的过程中调用或激活另外一个阶段。

## 阶段详解

### 加载 ✨✨

加载阶段是“类加载机制”中的一个阶段，这个阶段通常也被称作“装载”，主要完成：

1. 通过“类全名”来获取定义此类的二进制字节流

2. 将字节流所代表的静态存储结构转换为方法区的运行时数据结构

3. 在java堆中生成一个代表这个类的 java.lang.Class 对象，作为方法区这些数据的访问入口

相对于类加载过程的其他阶段，加载阶段(准备地说，是加载阶段中获取类的二进制字节流的动作)是开发期可控性最强的阶段，
因为加载阶段可以使用系统提供的类加载器(ClassLoader)来完成，也可以由用户自定义的类加载器完成，
开发人员可以通过定义自己的类加载器去控制字节流的获取方式。

加载阶段完成后，虚拟机外部的二进制字节流就按照虚拟机所需的格式存储在方法区之中，方法区中的数据存储格式有虚拟机实现自行定义，虚拟机并未规定此区域的具体数据结构。
然后在java堆中实例化一个java.lang.Class类的对象，这个对象作为程序访问方法区中的这些类型数据的外部接口。

### 验证 

验证是链接阶段的第一步，这一步主要的目的是确保class文件的字节流中包含的信息符合当前虚拟机的要求，并且不会危害虚拟机自身安全。
验证阶段主要包括四个检验过程：文件格式验证、元数据验证、字节码验证和符号引用验证。

- 文件格式验证

验证 class 文件格式规范。

例如：class 文件是否已魔术 `0xCAFEBABE` 开头 ， 主、次版本号是否在当前虚拟机处理范围之内等

- 元数据验证

这个阶段是对字节码描述的信息进行语义分析，以保证起描述的信息符合java语言规范要求。

验证点可能包括：这个类是否有父类(除了 `java.lang.Object` 之外，所有的类都应当有父类)、这个类是否继承了不允许被继承的类(被final修饰的)、
如果这个类的父类是抽象类，是否实现了起父类或接口中要求实现的所有方法。

- 字节码验证

进行数据流和控制流分析，这个阶段对类的方法体进行校验分析，这个阶段的任务是保证被校验类的方法在运行时不会做出危害虚拟机安全的行为。

如：保证访法体中的类型转换有效，例如可以把一个子类对象赋值给父类数据类型，这是安全的，
但不能把一个父类对象赋值给子类数据类型、保证跳转命令不会跳转到方法体以外的字节码命令上。

- 符号引用验证

符号引用中通过字符串描述的全限定名是否能找到对应的类、符号引用类中的类，字段和方法的访问性(private、protected、public、default)是否可被当前类访问。

### 准备

准备阶段是正式为类变量分配内存并设置类变量初始值的阶段，这些内存都将在方法区中进行分配。

这个阶段中有两个容易产生混淆的知识点，

首先是这时候进行内存分配的仅包括类变量(static 修饰的变量), 而不包括实例变量，实例变量将会在对象实例化时随着对象一起分配在java堆中。

其次是这里所说的初始值“通常情况”下是数据类型的零值，假设一个类变量定义为:

```java
public static int value  = 12;
```

那么变量 value 在准备阶段过后的初始值为 0 而不是 12，因为这时候尚未开始执行任何 java 方法，而把 value 赋值为 123 的 `putstatic` 指令是程序被编译后，
存放于类构造器 `<clinit>()` 方法之中，所以把 value 赋值为 12 的动作将在初始化阶段才会被执行。

上面所说的“通常情况”下初始值是零值，那相对于一些特殊的情况，如果类字段的字段属性表中存在 ConstantValue 属性，
那在准备阶段变量 value 就会被初始化为 ConstantValue 属性所指定的值，建设上面类变量 value 定义为：

```java
public static final int value = 123;
```

编译时 javac 将会为 value 生成 ConstantValue 属性，在准备阶段虚拟机就会根据 ConstantValue 的设置将 value 设置为 123。

### 解析

解析阶段是虚拟机常量池内的符号引用替换为直接引用的过程。

- 符号引用

符号引用是一组符号来描述所引用的目标对象，符号可以是任何形式的字面量，只要使用时能无歧义地定位到目标即可。

符号引用与虚拟机实现的内存布局无关，引用的目标对象并不一定已经加载到内存中。

- 直接引用

直接引用可以是直接指向目标对象的指针、相对偏移量或是一个能间接定位到目标的句柄。

直接引用是与虚拟机内存布局实现相关的，同一个符号引用在不同虚拟机实例上翻译出来的直接引用一般不会相同，如果有了直接引用，那引用的目标必定已经在内存中存在。

虚拟机规范并没有规定解析阶段发生的具体时间，只要求了在执行 anewarry、checkcast、getfield、instanceof、invokeinterface、invokespecial、invokestatic、invokevirtual、multianewarray、new、putfield 和 putstatic 这 13 个用于操作符号引用的字节码指令之前，先对它们使用的符号引用进行解析，所以虚拟机实现会根据需要来判断，到底是在类被加载器加载时就对常量池中的符号引用进行解析，还是等到一个符号引用将要被使用前才去解析它。

解析的动作主要针对类或接口、字段、类方法、接口方法四类符号引用进行。

分别对应编译后常量池内的 CONSTANT_Class_Info、CONSTANT_Fieldref_Info、CONSTANT_Methodef_Info、CONSTANT_InterfaceMethoder_Info 四种常量类型。

1. 类、接口的解析

2. 字段解析

3. 类方法解析

4. 接口方法解析

### 初始化

类的初始化阶段是类加载过程的最后一步。

在准备阶段，类变量已赋过一次系统要求的初始值，而在初始化阶段，则是根据程序员通过程序制定的主观计划去初始化类变量和其他资源，或者可以从另外一个角度来表达：

初始化阶段是执行类构造器 `<clinit>()` 方法的过程。

在以下四种情况下初始化过程会被触发执行：

1. 遇到 new、getstatic、putstatic 或 invokestatic 这 4 条字节码指令时，如果类没有进行过初始化，则需先触发其初始化。

生成这 4 条指令的最常见的 java 代码场景是：使用new关键字实例化对象、读取或设置一个类的静态字段(被 final 修饰、已在编译器把结果放入常量池的静态字段除外)的时候，以及调用类的静态方法的时候。

2. 使用 java.lang.reflect 包的方法对类进行反射调用的时候

3. 当初始化一个类的时候，如果发现其父类还没有进行过初始化、则需要先出发其父类的初始化

4. jvm 启动时，用户指定一个执行的主类(包含main方法的那个类)，虚拟机会先初始化这个类

在上面准备阶段 `public static int value  = 12;`  在准备阶段完成后 value 的值为 0，
而在初始化阶调用了类构造器 `<clinit>()` 方法，这个阶段完成后 value 的值为12。

> 类构造器方法

类构造器 `<clinit>()` 方法是由编译器自动收集类中的所有类变量的赋值动作和静态语句块(static块)中的语句合并产生的，
编译器收集的顺序是由语句在源文件中出现的顺序所决定的，静态语句块中只能访问到定义在静态语句块之前的变量，定义在它之后的变量，在前面的静态语句快可以赋值，但是不能访问。

类构造器 `<clinit>()` 方法与类的构造函数(实例构造函数 `<init>()` 方法)不同，它不需要显式调用父类构造，虚拟机会保证在子类 `<clinit>()` 方法执行之前，
父类的 `<clinit>()` 方法已经执行完毕。因此在虚拟机中的第一个执行的 `<clinit>()` 方法的类肯定是 java.lang.Object。

由于父类的 `<clinit>()` 方法先执行，也就意味着父类中定义的静态语句快要优先于子类的变量赋值操作。

`<clinit>()` 方法对于类或接口来说并不是必须的，如果一个类中没有静态语句，也没有变量赋值的操作，那么编译器可以不为这个类生成 `<clinit>()` 方法。

接口中不能使用静态语句块，但接口与类不太能够的是，执行接口的 `<clinit>()` 方法不需要先执行父接口的 `<clinit>()` 方法。
只有当父接口中定义的变量被使用时，父接口才会被初始化。另外，接口的实现类在初始化时也一样不会执行接口的 `<clinit>()` 方法。

虚拟机会保证一个类的 `<clinit>()` 方法在多线程环境中被正确加锁和同步，如果多个线程同时去初始化一个类，
那么只会有一个线程执行这个类的 `<clinit>()` 方法，其他线程都需要阻塞等待，直到活动线程执行 `<clinit>()` 方法完毕。
如果一个类的 `<clinit>()` 方法中有耗时很长的操作，那就可能造成多个进程阻塞。



# 类加载器的树状组织结构

## 分类

Java 中的类加载器大致可以分成两类，一类是系统提供的，另外一类则是由 Java 应用开发人员编写的。

系统提供的类加载器主要有下面三个：

- 引导类加载器（bootstrap class loader）

它用来加载 Java 的核心库，是用原生代码来实现的，并不继承自 java.lang.ClassLoader。

- 扩展类加载器（extensions class loader）

它用来加载 Java 的扩展库。Java 虚拟机的实现会提供一个扩展库目录。该类加载器在此目录里面查找并加载 Java 类。

- 系统类加载器（system class loader）

它根据 Java 应用的类路径（CLASSPATH）来加载 Java 类。一般来说，Java 应用的类都是由它来完成加载的。

可以通过 `ClassLoader.getSystemClassLoader()` 来获取它。

- 用户类加载器：

用户自定义的加载器，以类加载器为父类

除了系统提供的类加载器以外，开发人员可以通过继承 java.lang.ClassLoader 类的方式实现自己的类加载器，以满足一些特殊的需求。

## 父类加载器

除了引导类加载器之外，所有的类加载器都有一个父类加载器，通过 `getParent()` 方法可以得到。

对于系统提供的类加载器来说，系统类加载器的父类加载器是扩展类加载器，而扩展类加载器的父类加载器是引导类加载器；

对于开发人员编写的类加载器来说，其父类加载器是加载此类加载器 Java 类的类加载器。

因为类加载器 Java 类如同其它的 Java 类一样，也是要由类加载器来加载的。

一般来说，开发人员编写的类加载器的父类加载器是系统类加载器。

类加载器通过这种方式组织起来，形成树状结构。树的根节点就是引导类加载器。

## 结构示意图

如下给出了一个典型的类加载器树状组织结构示意图，其中的箭头指向的是父类加载器。

注意：类加载器之间的父子关系并不是继承关系，是**类加载器实例之间的关系**

```
用户类加载器=>系统类加载器=>拓展类加载器=>根类加载器
```

## 实例

- ClassLoaderTree.java

```java
package com.github.houbb.java.learn.jvm.base;

import java.io.IOException;
import java.net.URL;
import java.util.Enumeration;

public class ClassLoaderTree {

    public static void main(String[] args) throws IOException {
        ClassLoader systemLoader = ClassLoader.getSystemClassLoader();
        System.out.println("系统类加载: ");
        Enumeration<URL> em1 = systemLoader.getResources("");
        while (em1.hasMoreElements()) {
            System.out.println(em1.nextElement());
        }
        ClassLoader extensionLader = systemLoader.getParent();
        System.out.println("拓展类加载器: " + extensionLader);
        System.out.println("拓展类加载器的父: " + extensionLader.getParent());
    }

}
```

- 输出日志

```
系统类加载: 
file:/Users/houbinbin/code/_github/java-learn/java-learn-jvm/java-jvm-base/target/classes/
拓展类加载器: sun.misc.Launcher$ExtClassLoader@6ff3c5b5
拓展类加载器的父: null
```

### 疑问

- 为什么根类加载器为 null?

根类加载器并不是Java实现的，而且由于程序通常须访问根加载器，因此访问扩展类加载器的父类加载器时返回 null

# 加载类的方式

## 线程上下文类加载器

线程上下文类加载器（context class loader）是从 JDK 1.2 开始引入的。

类 java.lang.Thread 中的方法 `getContextClassLoader()` 和 `setContextClassLoader(ClassLoader cl)` 用来获取和设置线程的上下文类加载器。

如果没有通过 `setContextClassLoader(ClassLoader cl)` 方法进行设置的话，线程将继承其父线程的上下文类加载器。

Java 应用运行的初始线程的上下文类加载器是系统类加载器。在线程中运行的代码可以通过此类加载器来加载类和资源。

前面提到的类加载器的代理模式并不能解决 Java 应用开发中会遇到的类加载器的全部问题。

Java 提供了很多服务提供者接口（Service Provider Interface，SPI），允许第三方为这些接口提供实现。

常见的 SPI 有 JDBC、JCE、JNDI、JAXP 和 JBI 等。这些 SPI 的接口由 Java 核心库来提供，如 JAXP 的 SPI 接口定义包含在 javax.xml.parsers包中。

这些 SPI 的实现代码很可能是作为 Java 应用所依赖的 jar 包被包含进来，可以通过类路径（CLASSPATH）来找到，如实现了 JAXP SPI 的 Apache Xerces所包含的 jar 包。

SPI 接口中的代码经常需要加载具体的实现类。

如 JAXP 中的 `javax.xml.parsers.DocumentBuilderFactory` 类中的 newInstance() 方法用来生成一个新的 DocumentBuilderFactory的实例。

这里的实例的真正的类是继承自 javax.xml.parsers.DocumentBuilderFactory，由 SPI 的实现所提供的。

如在 Apache Xerces 中，实现的类是 org.apache.xerces.jaxp.DocumentBuilderFactoryImpl。

而问题在于，SPI 的接口是 Java 核心库的一部分，是由引导类加载器来加载的；SPI 实现的 Java 类一般是由系统类加载器来加载的。

引导类加载器是无法找到 SPI 的实现类的，因为它只加载 Java 的核心库。

它也不能代理给系统类加载器，因为它是系统类加载器的祖先类加载器。也就是说，类加载器的代理模式无法解决这个问题。

线程上下文类加载器正好解决了这个问题。如果不做任何的设置，Java 应用的线程的上下文类加载器默认就是系统上下文类加载器。

在 SPI 接口的代码中使用线程上下文类加载器，就可以成功的加载到 SPI 实现的类。线程上下文类加载器在很多 SPI 的实现中都会用到。

下面介绍另外一种加载类的方法：Class.forName。

## Class.forName()

*Class.forName()* 是一个静态方法，同样可以用来加载类。

该方法有两种形式：

`Class.forName(String name, boolean initialize, ClassLoader loader)` 和 `Class.forName(String className)`。

第一种形式的参数 name表示的是类的全名；initialize表示是否初始化类；loader表示加载时使用的类加载器。

第二种形式则相当于设置了参数 initialize 的值为 true，loader 的值为当前类的类加载器。

*Class.forName()* 的一个很常见的用法是在加载数据库驱动的时候。

如 `Class.forName("org.apache.derby.jdbc.EmbeddedDriver").newInstance()` 用来加载 Apache Derby 数据库的驱动。


# 双亲委派机制

## 概念

双亲委派模式要求除了顶层的启动类加载器外，其余的类加载器都应当有自己的父类加载器，

请注意双亲委派模式中的父子关系并非通常所说的类继承关系，

而是采用组合关系来复用父类加载器的相关代码，类加载器间的关系如下：

```
用户类加载器=>系统类加载器=>拓展类加载器=>根类加载器
```

双亲委派模式是在 Java 1.2 后引入的。

其工作原理的是，如果一个类加载器收到了类加载请求，它并不会自己先去加载，而是把这个请求委托给父类的加载器去执行，如果父类加载器还存在其父类加载器，则进一步向上委托，依次递归.

请求最终将到达顶层的启动类加载器，如果父类加载器可以完成类加载任务，就成功返回，倘若父类加载器无法完成此加载任务，子加载器才会尝试自己去加载，这就是双亲委派模式。

## 优势

为什么要这么设计？

### 层级关系

采用双亲委派模式的是好处是 Java 类随着它的类加载器一起具备了一种带有优先级的层次关系，通过这种层级关可以避免类的重复加载，当父亲已经加载了该类时，就没有必要子ClassLoader再加载一次。

### 安全

其次是考虑到安全因素，java核心api中定义类型不会被随意替换，假设通过网络传递一个名为 `java.lang.Integer` 的类，通过双亲委托模式传递到启动类加载器，而启动类加载器在核心Java API发现这个名字的类，发现该类已被加载，并不会重新加载网络传递的过来的java.lang.Integer，而直接返回已加载过的Integer.class，这样便可以防止核心API库被随意篡改。

可能你会想，如果我们在classpath路径下自定义一个名为java.lang.SingleInterge类(该类是胡编的)呢？该类并不存在java.lang中，经过双亲委托模式，传递到启动类加载器中，由于父类加载器路径下并没有该类，所以不会加载，将反向委托给子类加载器加载，最终会通过系统类加载器加载该类。

但是这样做是不允许，因为java.lang是核心API包，需要访问权限，强制加载将会报出如下异常

```
java.lang.SecurityException: Prohibited package name: java.lang
```

所以无论如何都无法加载成功的。

## 实现原理

下面我们从代码层面了解几个Java中定义的类加载器及其双亲委派模式的实现。

...

# ClassLoader 隔离

# 类加载器

JVM 设计者把类加载阶段中的通过**类全名来获取定义此类的二进制字节流**这个动作放到Java虚拟机外部去实现，
以便让应用程序自己决定如何去获取所需要的类。

实现这个动作的代码模块称为**类加载器**。

## 类与类加载器

对于任何一个类，都需要由**加载它的类加载器和这个类来确立其在 JVM 中的唯一性**。

也就是说，两个类来源于同一个 Class 文件，并且被同一个类加载器加载，这两个类才相等。

> 参见 [热部署类加载器](#热部署类加载器) 代码示例。

# 自定义类加载器

虽然在绝大多数情况下，系统默认提供的类加载器实现已经可以满足需求。

但是在某些情况下，您还是需要为应用开发出自己的类加载器。

比如您的应用通过网络来传输 Java 类的字节代码，为了保证安全性，这些字节代码经过了加密处理。

这个时候您就需要自己的类加载器来从某个网络地址上读取加密后的字节代码，接着进行解密和验证，最后定义出要在 Java 虚拟机中运行的类来。

下面将通过两个具体的实例来说明类加载器的开发。

## 文件系统类加载器

FileSysClassLoader 的 findClass() 方法首先根据类的全名在硬盘上查找类的字节代码文件（`.class` 文件），然后读取该文件内容。

最后通过 `defineClass()` 方法来把这些字节代码转换成 java.lang.Class 类的实例。

- FileSysClassLoader.java

```java
import java.io.ByteArrayOutputStream;
import java.io.File;
import java.io.FileInputStream;
import java.io.IOException;
import java.io.InputStream;
import java.net.URL;
import java.util.Enumeration;

public class FileSysClassLoader extends ClassLoader {

    private String rootDir;

    public FileSysClassLoader(String rootDir) {
        this.rootDir = rootDir;
    }

    @Override
    protected Class<?> findClass(String name) throws ClassNotFoundException {
        byte[] classData = getClassData(name);
        if (classData == null) {
            throw new ClassNotFoundException();
        } else {
            return defineClass(name, classData, 0, classData.length);
        }
    }

    private byte[] getClassData(String className) {
        String path = classNameToPath(className);
        try {
            InputStream ins = new FileInputStream(path);
            ByteArrayOutputStream baos = new ByteArrayOutputStream();
            int bufferSize = 4096;
            byte[] buffer = new byte[bufferSize];
            int bytesNumRead = 0;
            while ((bytesNumRead = ins.read(buffer)) != -1) {
                baos.write(buffer, 0, bytesNumRead);
            }
            return baos.toByteArray();
        } catch (IOException e) {
            e.printStackTrace();
        }
        return null;
    }

    private String classNameToPath(String className) {
        return rootDir + File.separatorChar
                + className.replace('.', File.separatorChar) + ".class";
    }
}
```

## 网络类加载器

Java 字节代码（`.class`）文件存放在服务器上，客户端通过网络的方式获取字节代码并执行。

当有版本更新的时候，只需要替换掉服务器上保存的文件即可。通过类加载器可以比较简单的实现这种需求。

- NetworkClassLoader.java

```java
import java.io.ByteArrayOutputStream;
import java.io.InputStream;
import java.net.URL;

public class NetworkClassLoader extends ClassLoader {

    private String rootUrl;

    public NetworkClassLoader(String rootUrl) {
        this.rootUrl = rootUrl;
    }

    @Override
    protected Class<?> findClass(String name) throws ClassNotFoundException {
        byte[] classData = getClassData(name);
        if (classData == null) {
            throw new ClassNotFoundException();
        } else {
            return defineClass(name, classData, 0, classData.length);
        }
    }

    private byte[] getClassData(String className) {
        String path = classNameToPath(className);
        try {
            URL url = new URL(path);
            InputStream ins = url.openStream();
            ByteArrayOutputStream baos = new ByteArrayOutputStream();
            int bufferSize = 4096;
            byte[] buffer = new byte[bufferSize];
            int bytesNumRead = 0;
            while ((bytesNumRead = ins.read(buffer)) != -1) {
                baos.write(buffer, 0, bytesNumRead);
            }
            return baos.toByteArray();
        } catch (Exception e) {
            e.printStackTrace();
        }
        return null;
    }

    private String classNameToPath(String className) {
        return rootUrl + "/"
                + className.replace('.', '/') + ".class";
    }
}
```

## 热部署类加载器

所谓的热部署就是利用同一个class文件不同的类加载器在内存创建出两个不同的class对象(关于这点的原因前面已分析过，即利用不同的类加载实例)，

由于 JVM 在加载类之前会检测请求的类是否已加载过(即在loadClass()方法中调用findLoadedClass()方法)，如果被加载过，则直接从缓存获取，不会重新加载。

注意同一个类加载器的实例和同一个class文件只能被加载器一次，多次加载将报错，

因此我们实现的热部署**必须让同一个class文件可以根据不同的类加载器重复加载，以实现所谓的热部署**。

实际上前面的实现的FileClassLoader和FileUrlClassLoader已具备这个功能，但前提是直接调用findClass()方法，而不是调用loadClass()方法，

因为ClassLoader中loadClass()方法体中调用findLoadedClass()方法进行了检测是否已被加载，因此我们直接调用findClass()方法就可以绕过这个问题，

当然也可以重新loadClass方法，但强烈不建议这么干。

利用 FileClassLoader 类测试代码如下：

- HotDeploy.java

```java
public static void main(String[] args) {
    String rootDir = "/Users/houbinbin/code/_github/java-learn/java-learn-jvm/java-jvm-base/target/classes";
    final String classPath = "com.github.houbb.java.learn.jvm.base.classloader.HotSwap";
    //创建自定义文件类加载器
    FileSysClassLoader loader = new FileSysClassLoader(rootDir);
    FileSysClassLoader loader2 = new FileSysClassLoader(rootDir);
    try {
        //加载指定的class文件,调用loadClass()
        Class<?> object1 = loader.loadClass(classPath);
        Class<?> object2 = loader2.loadClass(classPath);
        System.out.println("loadClass->obj1:" + object1.hashCode());
        System.out.println("loadClass->obj2:" + object2.hashCode());
        //加载指定的class文件,直接调用findClass(),绕过检测机制，创建不同class对象。
        Class<?> object3 = loader.findClass(classPath);
        Class<?> object4 = loader2.findClass(classPath);
        System.out.println("loadClass->obj3:" + object3.hashCode());
        System.out.println("loadClass->obj4:" + object4.hashCode());
    } catch (Exception e) {
        e.printStackTrace();
    }
}
```

- 输出日志

```
loadClass->obj1:856419764
loadClass->obj2:856419764
loadClass->obj3:1554874502
loadClass->obj4:1846274136
```

# Class 加密实现思路

ClassLoader 加载 `.class` 文件的方式不仅限于从jar包中读取，还可以从种地方读取，因为ClassLoader加载时需要的是 `byte[]` 数组.

ClassLoader 加载Class文件方式：

- 从本地系统中直接加载

- 通过网络下载 .class 文件

- 从 zip，jar 等归档文件中加载 .class 文件

- 从专有数据库中提取 .class 文件

- 将 Java 源文件动态编译为 .class 文件

加密实现思路：加载Class文件的方式灵活，我们可以自定义ClassLoader，把加密后的Class文件，在加载Class前先进行解密，然后在通过ClassLoader进行加载。


# 动态加载 jar & ClassLoader 隔离问题

## 动态加载 jar 

Java 中动态加载 Jar 比较简单，如下：

```java
URL[] urls = new URL[] {new URL("file:libs/jar1.jar")};  
URLClassLoader loader = new URLClassLoader(urls, parentLoader);  
```

表示加载 libs 下面的 jar1.jar，其中 parentLoader 就是上面 1 中的 parent，可以为当前的 ClassLoader。

## ClassLoader 隔离问题

大家觉得一个运行程序中有没有可能同时存在两个包名和类名完全一致的类？

JVM 及 Dalvik 对类唯一的识别是 ClassLoader id + PackageName + ClassName，所以一个运行程序中是有可能存在两个包名和类名完全一致的类的。

并且如果这两个”类”不是由一个 ClassLoader 加载，是无法将一个类的示例强转为另外一个类的，这就是 ClassLoader 隔离。

ps: 热部署就是利用了这一点。

## 加载不同 Jar 包中公共类

现在 Host 工程包含了 common.jar, jar1.jar, jar2.jar，并且 jar1.jar 和 jar2.jar 都包含了 common.jar，

我们通过 ClassLoader 将 jar1, jar2 动态加载进来，

这样在 Host 中实际是存在三份 common.jar，如下图：

![png](https://farm4.staticflickr.com/3872/14301963930_2f0f0fe8aa_o.png)

我们怎么保证 common.jar 只有一份而不会造成上面3中提到的 ClassLoader 隔离的问题呢，其实很简单，

在生成 jar1 和 jar2 时把 common.jar 去掉，只保留 host 中一份，

以 host ClassLoader 为 parentClassLoader 即可。

# 类加载器与 Web 容器

对于运行在 Java EE™ 容器中的 Web 应用来说，类加载器的实现方式与一般的 Java 应用有所不同。

不同的 Web 容器的实现方式也会有所不同。

以 Apache Tomcat 来说，每个 Web 应用都有一个对应的类加载器实例。

该类加载器也使用代理模式，所不同的是它是首先尝试去加载某个类，如果找不到再代理给父类加载器。这与一般类加载器的顺序是相反的。

这是 Java Servlet 规范中的推荐做法，其目的是使得 Web 应用自己的类的优先级高于 Web 容器提供的类。

这种代理模式的一个例外是：Java 核心库的类是不在查找范围之内的。这也是为了保证 Java 核心库的类型安全。

## 原则

绝大多数情况下，Web 应用的开发人员不需要考虑与类加载器相关的细节。下面给出几条简单的原则：

- 每个 Web 应用自己的 Java 类文件和使用的库的 jar 包，分别放在 `WEB-INF/classes` 和 `WEB-INF/lib` 目录下面。

- 多个应用共享的 Java 类文件和 jar 包，分别放在 Web 容器指定的由所有 Web 应用共享的目录下面。

- 当出现找不到类的错误时，检查当前类的类加载器和当前线程的上下文类加载器是否正确。

- 在介绍完类加载器与 Web 容器的关系之后，下面介绍它与 OSGi 的关系。

# 类加载器与 OSGi

OSGi™ 是 Java 上的动态模块系统。

它为开发人员提供了面向服务和基于组件的运行环境，并提供标准的方式用来管理软件的生命周期。

OSGi 已经被实现和部署在很多产品上，在开源社区也得到了广泛的支持。

Eclipse 就是基于 OSGi 技术来构建的。

OSGi 中的每个模块（bundle）都包含 Java 包和类。模块可以声明它所依赖的需要导入（import）的其它模块的 Java 包和类（通过 Import-Package），也可以声明导出（export）自己的包和类，供其它模块使用（通过 Export-Package）。

也就是说需要能够隐藏和共享一个模块中的某些 Java 包和类。这是通过 OSGi 特有的类加载器机制来实现的。OSGi 中的每个模块都有对应的一个类加载器。

它负责加载模块自己包含的 Java 包和类。当它需要加载 Java 核心库的类时（以 java开头的包和类），它会代理给父类加载器（通常是启动类加载器）来完成。

当它需要加载所导入的 Java 类时，它会代理给导出此 Java 类的模块来完成加载。

模块也可以显式的声明某些 Java 包和类，必须由父类加载器来加载。只需要设置系统属性 `org.osgi.framework.bootdelegation` 的值即可。

假设有两个模块 bundleA 和 bundleB，它们都有自己对应的类加载器 classLoaderA 和 classLoaderB。

在 bundleA 中包含类 com.bundleA.Sample，并且该类被声明为导出的，也就是说可以被其它模块所使用的。

bundleB 声明了导入 bundleA 提供的类 com.bundleA.Sample，并包含一个类 com.bundleB.NewSample 继承自 com.bundleA.Sample。

在 bundleB 启动的时候，其类加载器 classLoaderB 需要加载类 com.bundleB.NewSample，进而需要加载类 com.bundleA.Sample。

由于 bundleB 声明了类 com.bundleA.Sample 是导入的，classLoaderB 把加载类 com.bundleA.Sample 的工作代理给导出该类的 bundleA 的类加载器 classLoaderA。

classLoaderA 在其模块内部查找类 com.bundleA.Sample 并定义它，所得到的类 com.bundleA.Sample实例就可以被所有声明导入了此类的模块使用。

对于以 java 开头的类，都是由父类加载器来加载的。

如果声明了系统属性 `org.osgi.framework.bootdelegation=com.example.core.*`，那么对于包 com.example.core 中的类，都是由父类加载器来完成的。

OSGi 模块的这种类加载器结构，**使得一个类的不同版本可以共存在 Java 虚拟机中，带来了很大的灵活性**。

## 建议

不过它的这种不同，也会给开发人员带来一些麻烦，尤其当模块需要使用第三方提供的库的时候。下面提供几条比较好的建议：

- 如果一个类库只有一个模块使用，把该类库的 jar 包放在模块中，在 Bundle-ClassPath中指明即可。

- 如果一个类库被多个模块共用，可以为这个类库单独的创建一个模块，把其它模块需要用到的 Java 包声明为导出的。其它模块声明导入这些类。

- 如果类库提供了 SPI 接口，并且利用线程上下文类加载器来加载 SPI 实现的 Java 类，有可能会找不到 Java 类。

如果出现了 NoClassDefFoundError异常，首先检查当前线程的上下文类加载器是否正确。

通过 `Thread.currentThread().getContextClassLoader()` 就可以得到该类加载器。

该类加载器应该是该模块对应的类加载器。

如果不是的话，可以首先通过 class.getClassLoader() 来得到模块对应的类加载器，
再通过 Thread.currentThread().setContextClassLoader() 来设置当前线程的上下文类加载器。

# 单例

## 静态内部类模式

- SingleTon.java

```java
public class Singleton {
  private Singleton(){}
 
  private static class SingletonHoler {
     private static Singleton INSTANCE = new Singleton();
 }
 
  public static Singleton getInstance(){
    return SingletonHoler.INSTANCE;
  }
}
```

## 优缺点

- 优点

外部类加载时并不需要立即加载内部类，内部类不被加载则不去初始化 INSTANCE，故而不占内存。

即当 Singleton 第一次被加载时，并不需要去加载 SingletonHoler，只有当 getInstance() 方法第一次被调用时，
才会去初始化 INSTANCE, 第一次调用 getInstance() 方法会导致虚拟机加载 SingletonHoler 类，
这种方法**不仅能确保线程安全，也能保证单例的唯一性，同时也延迟了单例的实例化**。

- 缺点

无法外部传参数。可以使用 DCL。

## 实现的机制

那么，静态内部类又是如何实现线程安全的呢？

- 类加载时机

首先，我们先了解下类的加载时机。

类加载时机：JAVA 虚拟机在有且仅有的 5 种场景下会对类进行初始化。

1. 遇到 new、getstatic、setstatic 或者 invikestatic 这4个字节码指令时，对应的 java 代码场景为：new 一个关键字或者一个实例化对象时、读取或设置一个静态字段时(final 修饰、已在编译期把结果放入常量池的除外)、调用一个类的静态方法时。

2. 使用 java.lang.reflect 包的方法对类进行反射调用的时候，如果类没进行初始化，需要先调用其初始化方法进行初始化。

3. 当初始化一个类时，如果其父类还未进行初始化，会先触发其父类的初始化。

4. 当虚拟机启动时，用户需要指定一个要执行的主类(包含 main() 方法的类)，虚拟机会先初始化这个类。

5. 当使用 JDK 1.7 等动态语言支持时，如果一个 java.lang.invoke.MethodHandle 实例最后的解析结果 
REF_getStatic、REF_putStatic、REF_invokeStatic 的方法句柄，并且这个方法句柄所对应的类没有进行过初始化，则需要先触发其初始化。

这 5 种情况被称为是类的主动引用，注意，这里《虚拟机规范》中使用的限定词是**"有且仅有"**，
那么，除此之外的所有引用类都不会对类进行初始化，称为被动引用。

静态内部类就属于被动引用的行列。

我们再回头看下 getInstance() 方法，调用的是 SingletonHoler.INSTANCE，取的是 SingletonHoler 里的 INSTANCE 对象，
跟上面那个 DCL 方法不同的是，getInstance() 方法并没有多次去 new 对象，故不管多少个线程去调用 getInstance() 方法，取的都是同一个INSTANCE对象，而不用去重新创建。

当getInstance()方法被调用时，SingleTonHoler才在SingleTon的运行时常量池里，把符号引用替换为直接引用，这时静态对象INSTANCE也真正被创建，然后再被getInstance()方法返回出去，这点同饿汉模式。那么INSTANCE在创建过程中又是如何保证线程安全的呢？在《深入理解JAVA虚拟机》中，有这么一句话:

```
虚拟机会保证一个类的 <clinit>() 方法在多线程环境中被正确地加锁、同步，如果多个线程同时去初始化一个类。
那么只会有一个线程去执行这个类的 <clinit>() 方法，其他线程都需要阻塞等待，直到活动线程执行 <clinit>() 方法完毕。
如果在一个类的 <clinit>() 方法中有耗时很长的操作，就可能造成多个进程阻塞(需要注意的是，其他线程虽然会被阻塞，
但如果执行 <clinit>() 方法后，其他线程唤醒之后不会再次进入 <clinit>() 方法。同一个加载器下，一个类型只会初始化一次。

在实际应用中，这种阻塞往往是很隐蔽的。
```



故而，可以看出 INSTANCE 在创建过程中是线程安全的，所以说静态内部类形式的单例可保证线程安全，也能保证单例的唯一性，同时也延迟了单例的实例化。

# 参考资料

- oracle

[ClassLoader](https://docs.oracle.com/javase/7/docs/api/java/lang/ClassLoader.html)

- 类加载机制

https://www.ibm.com/developerworks/cn/java/j-lo-classloader/index.html

https://blog.csdn.net/jintao_ma/article/details/51353453

https://blog.csdn.net/qyp199312/article/details/65628283

https://blog.csdn.net/ns_code/article/details/17881581

https://www.jianshu.com/p/3cab74a189de

- 双亲委派机制

https://blog.csdn.net/javazejian/article/details/73413292

- 单例

https://blog.csdn.net/mnb65482/article/details/80458571

* any list
{:toc}