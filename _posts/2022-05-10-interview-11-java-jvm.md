---
layout: post
title:  JVM 内存结构
date:  2022-05-10 09:22:02 +0800
categories: [Interview]
tags: [interview, jvm, sh]
published: true
---

# 系列目录

[spring 常见面试题](https://houbb.github.io/2022/05/10/interview-01-spring)

[spring-boot 常见面试题](https://houbb.github.io/2022/05/10/interview-02-springboot)

[redis 常见面试题](https://houbb.github.io/2022/05/10/interview-04-redis)

[mysql 常见面试题](https://houbb.github.io/2022/05/10/interview-05-mysql)

[mq 常见面试题](https://houbb.github.io/2022/05/10/interview-07-mq)

[rpc/dubbo 常见面试题](https://houbb.github.io/2022/05/10/interview-06-dubbo)

[ZooKeeper 面试题](https://houbb.github.io/2022/05/10/interview-08-zookeeper)

[JVM 常见面试题之双亲委派](https://houbb.github.io/2022/05/10/interview-09-jvm-classloader)

[JVM 常见面试题之 GC 垃圾回收](https://houbb.github.io/2022/05/10/interview-09-jvm-gc)

[JVM 常见面试题之 java 内存结构](https://houbb.github.io/2022/05/10/interview-09-jvm-struct)

[JVM 常见面试题之 java 内存结构2](https://houbb.github.io/2022/05/10/interview-11-java-jvm)

[【面试】mybatis 常见面试题汇总](https://houbb.github.io/2022/05/10/interview-03-mybatis)

[面试官：你们项目中是怎么做防重复提交的？](https://houbb.github.io/2022/05/10/interview-10-repeat)

[java 基础之 event 事件机制](https://houbb.github.io/2022/05/10/interview-11-java-basic-event)

[Reflection-01-java 反射机制](https://houbb.github.io/2018/07/01/reflection-01-overview)

[distributed 分布式相关专题汇总](https://houbb.github.io/2022/05/10/interview-11-java-distribute)

[web 常见面试题](https://houbb.github.io/2022/05/10/interview-11-java-web)

[其他常见面试题](https://houbb.github.io/2022/05/10/interview-12-other)

# JVM 内存结构

![内存结构](https://img.jbzj.com/file_images/article/202011/2020112617122083.jpg)

方法区和对是所有线程共享的内存区域；而java栈、本地方法栈和程序员计数器是运行是线程私有的内存区域。

Java堆（Heap）,是Java虚拟机所管理的内存中最大的一块。Java堆是被所有线程共享的一块内存区域，在虚拟机启动时创建。此内存区域的唯一目的就是存放对象实例，几乎所有的对象实例都在这里分配内存。

方法区（Method Area）,方法区（Method Area）与Java堆一样，是各个线程共享的内存区域，它用于存储已被虚拟机加载的类信息、常量、静态变量、即时编译器编译后的代码等数据。

程序计数器（Program Counter Register）,程序计数器（Program Counter Register）是一块较小的内存空间，它的作用可以看做是当前线程所执行的字节码的行号指示器。

JVM栈（JVM Stacks）,与程序计数器一样，Java虚拟机栈（Java Virtual Machine Stacks）也是线程私有的，它的生命周期与线程相同。虚拟机栈描述的是Java方法执行的内存模型：每个方法被执行的时候都会同时创建一个栈帧（Stack Frame）用于存储局部变量表、操作栈、动态链接、方法出口等信息。每一个方法被调用直至执行完成的过程，就对应着一个栈帧在虚拟机栈中从入栈到出栈的过程。

本地方法栈（Native Method Stacks）,本地方法栈（Native Method Stacks）与虚拟机栈所发挥的作用是非常相似的，其区别不过是虚拟机栈为虚拟机执行Java方法（也就是字节码）服务，而本地方法栈则是为虚拟机使用到的Native方法服务。


值大小则进行一次Full GC，如果小于检查HandlePromotionFailure设置，如果true则只进行Monitor GC,如果false则进行Full GC。

# 解释内存中的栈(stack)、堆(heap)和静态区(static area)的用法

通常我们定义一个基本数据类型的变量，一个对象的引用，还有就是函数调用的现场保存都使用内存中的栈空间；而通过 `new` 关键字和构造器创建的对象放在堆空间；

程序中的字面量（literal）如直接书写的100、"hello"和常量都是放在静态区中。

栈空间操作起来最快但是栈很小，通常大量的对象都是放在堆空间，理论上整个内存没有被其他进程使用的空间甚至硬盘上的虚拟内存都可以被当成堆空间来使用。

```java
String str = new String("hello");
```

上面的语句中变量str放在栈上，用new创建出来的字符串对象放在堆上，而"hello"这个字面量放在静态区。


# Perm Space中保存什么数据？会引起OutOfMemory吗？

Perm Space中保存的是加载class文件。

会引起OutOfMemory，出现异常可以设置 -XX:PermSize 的大小。

JDK 1.8后，字符串常量不存放在永久代，而是在堆内存中，**JDK8 以后没有永久代概念，而是用元空间替代，元空间不存在虚拟机中，而是使用本地内存**。

ps: 意味着什么？


## JDK 1.8之后Perm Space有哪些变动? MetaSpace⼤⼩默认是⽆限的么? 还是你们会通过什么⽅式来指定⼤⼩？

JDK 1.8后用元空间替代了 Perm Space；字符串常量存放到堆内存中。

MetaSpace大小默认没有限制，一般根据系统内存的大小。JVM会动态改变此值。

-XX:MetaspaceSize：分配给类元数据空间（以字节计）的初始大小（Oracle逻辑存储上的初始高水位，the initial high-water-mark）。

此值为估计值，MetaspaceSize的值设置的过大会延长垃圾回收时间。垃圾回收过后，引起下一次垃圾回收的类元数据空间的大小可能会变大。

-XX:MaxMetaspaceSize：分配给类元数据空间的最大值，超过此值就会触发Full GC，此值默认没有限制，但应取决于系统内存的大小。JVM会动态地改变此值。


# 什么是类的加载 ?

类的加载指的是将类的 `.class` 文件中的二进制数据读入到内存中，将其放在运行时数据区的方法区内，然后在堆区创建一个java.lang.Class对象，用来封装类在方法区内的数据结构。

类的加载的最终产品是位于堆区中的Class对象，Class对象封装了类在方法区内的数据结构，并且向Java程序员提供了访问方法区内的数据结构的接口。

## 类加载器

![类加载器](https://img.jbzj.com/file_images/article/202011/2020112617122184.jpg)

启动类加载器：Bootstrap ClassLoader，负责加载存放在JDK\jre\lib(JDK代表JDK的安装目录，下同)下，或被-Xbootclasspath参数指定的路径中的，并且能被虚拟机识别的类库

扩展类加载器：Extension ClassLoader，该加载器由sun.misc.Launcher$ExtClassLoader实现，它负责加载DK\jre\lib\ext目录中，或者由java.ext.dirs系统变量指定的路径中的所有类库（如javax.*开头的类），开发者可以直接使用扩展类加载器。

应用程序类加载器：Application ClassLoader，该类加载器由sun.misc.Launcher$AppClassLoader来实现，它负责加载用户类路径（ClassPath）所指定的类，开发者可以直接使用该类加载器

双亲委派机制：**类加载器收到类加载请求，自己不加载，向上委托给父类加载，父类加载不了，再自己加载。优势就是避免Java核心API篡改。**

## 如何⾃定义⼀个类加载器？

你使⽤过哪些或者你在什么场景下需要⼀个⾃定义的类加载器吗？

自定义类加载的意义：

1. 加载特定路径的 class 文件

2. 加载一个加密的网络 class 文件

3. 热部署加载 class 文件

## 描述一下JVM加载class文件的原理机制？

JVM中类的装载是由类加载器（ClassLoader）和它的子类来实现的，Java中的类加载器是一个重要的Java运行时系统组件，它负责在运行时查找和装入类文件中的类。

由于Java的跨平台性，经过编译的Java源程序并不是一个可执行程序，而是一个或多个类文件。

当Java程序需要使用某个类时，JVM会确保这个类已经被**加载、连接（验证、准备和解析）和初始化**。

类的加载是指把类的 .class 文件中的数据读入到内存中，通常是创建一个字节数组读入 .class 文件，然后产生与所加载类对应的 Class 对象。

加载完成后，Class对象还不完整，所以此时的类还不可用。

当类被加载后就进入连接阶段，这一阶段包括验证、准备（为静态变量分配内存并设置默认的初始值）和解析（将符号引用替换为直接引用）三个步骤。

最后JVM对类进行初始化，包括：

1)如果类存在直接的父类并且这个类还没有被初始化，那么就先初始化父类；

2)如果类中存在初始化语句，就依次执行这些初始化语句。类的加载是由类加载器完成的，类加载器包括：根加载器（BootStrap）、扩展加载器（Extension）、系统加载器（System）和用户自定义类加载器（java.lang.ClassLoader的子类）。

从Java 2（JDK 1.2）开始，类加载过程采取了父亲委托机制（PDM）。

**PDM更好的保证了Java平台的安全性，在该机制中，JVM自带的Bootstrap是根加载器，其他的加载器都有且仅有一个父类加载器。类的加载首先请求父类加载器加载，父类加载器无能为力时才由其子类加载器自行加载。**

JVM不会向Java程序提供对Bootstrap的引用。

下面是关于几个类加载器的说明：

bootstrap：一般用本地代码实现，负责加载JVM基础核心类库（rt.jar）；

Extension：从java.ext.dirs系统属性所指定的目录中加载类库，它的父加载器是Bootstrap；

System：又叫应用类加载器，其父类是Extension。它是应用最广泛的类加载器。它从环境变量classpath或者系统属性java.class.path所指定的目录中记载类，是用户自定义加载器的默认父加载器。



# Java对象创建过程

JVM遇到一条新建对象的指令时首先去检查这个指令的参数是否能在常量池中定义到一个类的符号引用。

然后加载这个类（类加载过程在后边讲）为对象分配内存。

一种办法"指针碰撞"、一种办法"空闲列表"，最终常用的办法"本地线程缓冲分配(TLAB)"

将除对象头外的对象内存空间初始化为0

对对象头进行必要设置

# 类的生命周期

类的生命周期包括这几个部分，加载、连接、初始化、使用和卸载，其中前三部是类的加载的过程,如下图:

![类的生命周期](https://img.jbzj.com/file_images/article/202011/2020112617122185.jpg)

加载，查找并加载类的二进制数据，在Java堆中也创建一个java.lang.Class类的对象

连接，连接又包含三块内容：验证、准备、初始化。 1）验证，文件格式、元数据、字节码、符号引用验证； 2）准备，为类的静态变量分配内存，并将其初始化为默认值； 3）解析，把类中的符号引用转换为直接引用

初始化，为类的静态变量赋予正确的初始值

使用，new 出对象程序中使用

卸载，执行垃圾回收

# 引起类加载操作的五个行为

- 遇到new、getstatic、putstatic或invokestatic这四条字节码指令

- 反射调用的时候，如果类没有进行过初始化，则需要先触发其初始化

- 子类初始化的时候，如果其父类还没初始化，则需先触发其父类的初始化

- 虚拟机执行主类的时候(有 main(string[] args))

- JDK1.7 动态语言支持

# Java对象创建时机

- 使用new关键字创建对象

- 使用Class类的newInstance方法(反射机制)

- 使用Constructor类的newInstance方法(反射机制)

- 使用Clone方法创建对象

- 使用(反)序列化机制创建对象

# Java 中会存在内存泄漏吗，请简单描述。

理论上Java因为有垃圾回收机制（GC）不会存在内存泄露问题（这也是Java被广泛使用于服务器端编程的一个重要原因）；

然而在实际开发中，可能会存在无用但可达的对象，这些对象不能被GC回收，因此也会导致内存泄露的发生。

例如hibernate的Session（一级缓存）中的对象属于持久态，垃圾回收器是不会回收这些对象的，然而这些对象中可能存在无用的垃圾对象，如果不及时关闭（close）或清空（flush）一级缓存就可能导致内存泄露。

下面例子中的代码也会导致内存泄露。

```java
import java.util.Arrays;
import java.util.EmptyStackException;

public class MyStack {
    private T[] elements;
    private int size = 0;
    private static final int INIT_CAPACITY = 16;
    public MyStack() {
        elements = (T[]) new Object[INIT_CAPACITY];
    }
    public void push(T elem) {
        ensureCapacity();
        elements[size++] = elem;
    }
    public T pop() {
        if(size == 0)
            throw new EmptyStackException();
        return elements[--size];
    }
    private void ensureCapacity() {
        if(elements.length == size) {
            elements = Arrays.copyOf(elements, 2 * size + 1);
        }
    }
}
```

上面的代码实现了一个栈（先进后出（FILO））结构，乍看之下似乎没有什么明显的问题，它甚至可以通过你编写的各种单元测试。

然而其中的pop方法却存在内存泄露的问题，当我们用pop方法弹出栈中的对象时，该对象不会被当作垃圾回收，即使使用栈的程序不再引用这些对象，因为栈内部维护着对这些对象的过期引用（obsolete reference）。

在支持垃圾回收的语言中，内存泄露是很隐蔽的，这种内存泄露其实就是无意识的对象保持。 

如果一个对象引用被无意识的保留起来了，那么垃圾回收器不会处理这个对象，也不会处理该对象引用的其他对象，即使这样的对象只有少数几个，也可能会导致很多的对象被排除在垃圾回收之外，从而对性能造成重大影响，极端情况下会引发Disk Paging（物理内存与硬盘的虚拟内存交换数据），甚至造成OutOfMemoryError。


# 对象分配规则

对象优先分配在Eden区，如果Eden区没有足够的空间时，虚拟机执行一次Minor GC。

大对象直接进入老年代（大对象是指需要大量连续内存空间的对象）。这样做的目的是避免在Eden区和两个Survivor区之间发生大量的内存拷贝（新生代采用复制算法收集内存）。

长期存活的对象进入老年代。虚拟机为每个对象定义了一个年龄计数器，如果对象经过了1次Minor GC那么对象会进入Survivor区，之后每经过一次Minor GC那么对象的年龄加1，知道达到阀值对象进入老年区。

动态判断对象的年龄。如果Survivor区中相同年龄的所有对象大小的总和大于Survivor空间的一半，年龄大于或等于该年龄的对象可以直接进入老年代。

空间分配担保。每次进行Minor GC时，JVM会计算Survivor区移至老年区的对象的平均大小，如果这个值大于老年区的剩余


# GC是什么？为什么要有GC？

GC是垃圾收集的意思，内存处理是编程人员容易出现问题的地方，忘记或者错误的内存回收会导致程序或系统的不稳定甚至崩溃，Java提供的GC功能可以自动监测对象是否超过作用域从而达到自动回收内存的目的，Java语言没有提供释放已分配内存的显示操作方法。 Java程序员不用担心内存管理，因为垃圾收集器会自动进行管理。

要请求垃圾收集，可以调用下面的方法之一：System.gc() 或Runtime.getRuntime().gc() ，但JVM可以屏蔽掉显示的垃圾回收调用。 

垃圾回收可以有效的防止内存泄露，有效的使用可以使用的内存。

垃圾回收器通常是作为一个单独的低优先级的线程运行，不可预知的情况下对内存堆中已经死亡的或者长时间没有使用的对象进行清除和回收，程序员不能实时的调用垃圾回收器对某个对象或所有对象进行垃圾回收。 

在Java诞生初期，垃圾回收是Java最大的亮点之一，因为服务器端的编程需要有效的防止内存泄露问题，然而时过境迁，如今Java的垃圾回收机制已经成为被诟病的东西。

移动智能终端用户通常觉得iOS的系统比Android系统有更好的用户体验，其中一个深层次的原因就在于Android系统中垃圾回收的不可预知性。

补充：垃圾回收机制有很多种，包括：分代复制垃圾回收、标记垃圾回收、增量垃圾回收等方式。标准的Java进程既有栈又有堆。栈保存了原始型局部变量，堆保存了要创建的对象。

Java平台对堆内存回收和再利用的基本算法被称为标记和清除，但是Java对其进行了改进，采用"分代式垃圾收集"。

这种方法会跟Java对象的生命周期将堆内存划分为不同的区域，在垃圾收集过程中，可能会将对象移动到不同区域：

伊甸园（Eden）：这是对象最初诞生的区域，并且对大多数对象来说，这里是它们唯一存在过的区域。

幸存者乐园（Survivor）：从伊甸园幸存下来的对象会被挪到这里。

终身颐养园（Tenured）：这是足够老的幸存对象的归宿。

年轻代收集（Minor-GC）过程是不会触及这个地方的。

当年轻代收集不能把对象放进终身颐养园时，就会触发一次完全收集（Major-GC），这里可能还会牵扯到压缩，以便为大对象腾出足够的空间。

与垃圾回收相关的JVM参数：

```
-Xms / -Xmx — 堆的初始大小 / 堆的最大大小
-Xmn — 堆中年轻代的大小
-XX:-DisableExplicitGC — 让System.gc()不产生任何作用
-XX:+PrintGCDetails — 打印GC的细节
-XX:+PrintGCDateStamps — 打印GC操作的时间戳
-XX:NewSize / XX:MaxNewSize — 设置新生代大小/新生代最大大小
-XX:NewRatio — 可以设置老生代和新生代的比例
-XX:PrintTenuringDistribution — 设置每次新生代GC后输出幸存者乐园中对象年龄的分布
-XX:InitialTenuringThreshold / -XX:MaxTenuringThreshold：设置老年代阀值的初始值和最大值
-XX:TargetSurvivorRatio：设置幸存区的目标使用率
```

## 垃圾回收器

Serial收集器，串行收集器是最古老，最稳定以及效率高的收集器，可能会产生较长的停顿，只使用一个线程去回收。

ParNew收集器，ParNew收集器其实就是Serial收集器的多线程版本。

Parallel收集器，Parallel Scavenge收集器类似ParNew收集器，Parallel收集器更关注系统的吞吐量。

Parallel Old 收集器，Parallel Old是Parallel Scavenge收集器的老年代版本，使用多线程和"标记－整理"算法

CMS收集器，CMS（Concurrent Mark Sweep）收集器是一种以获取最短回收停顿时间为目标的收集器。

G1收集器，G1 (Garbage-First)是一款面向服务器的垃圾收集器,主要针对配备多颗处理器及大容量内存的机器. 以极高概率满足GC停顿时间要求的同时,还具备高吞吐量性能特征


# 你知道哪些垃圾回收算法？

GC 最基础的算法有三种：标记 -清除算法、复制算法、标记-压缩算法，我们常用的垃圾回收器一般都采用分代收集算法。

标记-清除算法，"标记-清除"（Mark-Sweep）算法，如它的名字一样，算法分为"标记"和"清除"两个阶段：首先标记出所有需要回收的对象，在标记完成后统一回收掉所有被标记的对象。

复制算法，"复制"（Copying）的收集算法，它将可用内存按容量划分为大小相等的两块，每次只使用其中的一块。当这一块的内存用完了，就将还存活着的对象复制到另外一块上面，然后再把已使用过的内存空间一次清理掉。

标记-压缩算法，标记过程仍然与"标记-清除"算法一样，但后续步骤不是直接对可回收对象进行清理，而是让所有存活的对象都向一端移动，然后直接清理掉端边界以外的内存

分代收集算法，"分代收集"（Generational Collection）算法，把Java堆分为新生代和老年代，这样就可以根据各个年代的特点采用最适当的收集算法。

## 做GC时，⼀个对象在内存各个Space中被移动的顺序是什么？

标记清除法，复制算法，标记整理、分代算法。

新生代一般采用复制算法 GC，老年代使用标记整理算法。

垃圾收集器：串行新生代收集器、串行老生代收集器、并行新生代收集器、并行老年代收集器。

CMS（Current Mark Sweep）收集器是一种以获取最短回收停顿时间为目标的收集器，它是一种并发收集器，采用的是Mark-Sweep算法。

# 如何判断一个对象是否应该被回收

判断对象是否存活一般有两种方式：

## 引用计数

每个对象有一个引用计数属性，新增一个引用时计数加1，引用释放时计数减1，计数为0时可以回收。此方法简单，无法解决对象相互循环引用的问题。

## 可达性分析（Reachability Analysis）

从GC Roots开始向下搜索，搜索所走过的路径称为引用链。

当一个对象到GC Roots没有任何引用链相连时，则证明此对象是不可用的，不可达对象。

在Java语言里，可作为GC Roots的对象包括以下几种：

- 虚拟机栈（栈帧中的本地变量表）中的引用的对象

- 方法区中的类静态属性引用的对象

- 方法区中的常量引用的对象。

- 本地方法栈中JNI(即一般说的Native方法)的引用的对象。



# JVM的永久代中会发生垃圾回收么？

**垃圾回收不会发生在永久代，如果永久代满了或者是超过了临界值，会触发完全垃圾回收(Full GC)。**

如果你仔细查看垃圾收集器的输出信息，就会发现永久代也是被回收的。

这就是为什么正确的永久代大小对避免Full GC是非常重要的原因。

请参考下Java8：从永久代到元数据区 (注：Java8中已经移除了永久代，新加了一个叫做元数据区的native内存区)

# 引用的分类

强引用：GC时不会被回收

软引用：描述有用但不是必须的对象，在发生内存溢出异常之前被回收

弱引用：描述有用但不是必须的对象，在下一次GC时被回收

虚引用（幽灵引用/幻影引用）:无法通过虚引用获得对象，用PhantomReference实现虚引用，虚引用用来在GC时返回一个通知。


## Java四引用

- 强引用（StrongReference）

强引用是使用最普遍的引用。

如果一个对象具有强引用，那垃圾回收器绝不会回收它。当内存空间不足，Java虚拟机宁愿抛出OutOfMemoryError错误，使程序异常终止，也不会靠随意回收具有强引用的对象来解决内存不足的问题

- 软引用（SoftReference）

如果内存空间不足了，就会回收这些对象的内存。只要垃圾回收器没有回收它，软引用可以和一个引用队列（ReferenceQueue）联合使用，如果软引用所引用的对象被垃圾回收器回收，Java虚拟机就会把这个软引用加入到与之关联的引用队列中

- 弱引用（WeakReference）

弱引用与软引用的区别在于：只具有弱引用的对象拥有更短暂的生命周期。在垃圾回收器线程扫描它所管辖的内存区域的过程中，一旦发现了只具有弱引用的对象，不管当前内存空间足够与否，都会回收它的内存。

弱引用可以和一个引用队列（ReferenceQueue）联合使用，如果弱引用所引用的对象被垃圾回收，Java虚拟机就会把这个弱引用加入到与之关联的引用队列中

- 虚引用（PhantomReference）

虚引用在任何时候都可能被垃圾回收器回收，主要用来 跟踪对象被垃圾回收器回收的活动，被回收时会收到一个系统通知。

虚引用与软引用和弱引用的一个区别在于：虚引用 必须 和引用队列 （ReferenceQueue）联合使用。

当垃圾回收器准备回收一个对象时，如果发现它还有虚引用，就会在回收对象的内存之前，把这个虚引用加入到与之关联的引用队列中。

# JVM 调优

## 调优命令

Sun JDK监控和故障处理命令有jps jstat jmap jhat jstack jinfo

jps，JVM Process Status Tool,显示指定系统内所有的HotSpot虚拟机进程。

jstat，JVM statistics Monitoring是用于监视虚拟机运行时状态信息的命令，它可以显示出虚拟机进程中的类装载、内存、垃圾收集、JIT编译等运行数据。

jmap，JVM Memory Map命令用于生成heap dump文件

jhat，JVM Heap Analysis Tool命令是与jmap搭配使用，用来分析jmap生成的dump，jhat内置了一个微型的HTTP/HTML服务器，生成dump的分析结果后，可以在浏览器中查看

jstack，用于生成java虚拟机当前时刻的线程快照。

jinfo，JVM Configuration info 这个命令作用是实时查看和调整虚拟机运行参数。

## 调优工具

常用调优工具分为两类,jdk自带监控工具：jconsole和jvisualvm，第三方有：MAT(Memory Analyzer Tool)、GChisto。

jconsole，Java Monitoring and Management Console是从java5开始，在JDK中自带的java监控和管理控制台，用于对JVM中内存，线程和类等的监控

jvisualvm，jdk自带全能工具，可以分析内存快照、线程快照；监控内存变化、GC变化等。

MAT，Memory Analyzer Tool，一个基于Eclipse的内存分析工具，是一个快速、功能丰富的Java heap分析工具，它可以帮助我们查找内存泄漏和减少内存消耗

GChisto，一款专业分析gc日志的工具

## jstack 是⼲什么的? jstat 呢？

如果线上程序周期性地出现卡顿，你怀疑可 能是 GC 导致的，你会怎么来排查这个问题？线程⽇志⼀般你会看其中的什么部分？

jstack 用来查询 Java 进程的堆栈信息。

jvisualvm 监控内存泄露，跟踪垃圾回收、执行时内存、cpu分析、线程分析。

# Minor GC与Full GC分别在什么时候发生？

新生代内存不够用时候发生MGC也叫YGC，JVM内存不够的时候发生FGC

# 你有没有遇到过OutOfMemory问题？你是怎么来处理这个问题的？处理 过程中有哪些收获？

permgen space、heap space 错误。

常见的原因

- 内存加载的数据量太大：一次性从数据库取太多数据；

- 集合类中有对对象的引用，使用后未清空，GC不能进行回收；

- 代码中存在循环产生过多的重复对象；

- 启动参数堆内存值小。

# 24、StackOverflow异常有没有遇到过？⼀般你猜测会在什么情况下被触发？如何指定⼀个线程的堆栈⼤⼩？⼀般你们写多少？

栈内存溢出，一般由栈内存的局部变量过爆了，导致内存溢出。出现在递归方法，参数个数过多，递归过深，递归没有出口。

**递归调用导致，添加一个循环次数。解决。**






# 题目

21、什么是java虚拟机，我为什么要使用？

22、说说java虚拟机的生命周期及体系结构。

23、说一说java内存区域。

35、Java虚拟机中，数据类型可以分为哪几类？

36、怎么理解栈、堆？堆中存在什么？栈中存在什么？

37、为什么要把堆和栈区分出来呢？栈中不是也可以存储数据吗？

38、在java中，什么是栈的起始点，同时也是程序的起始点？

39、为什么不把基本类型放堆中呢？

40、Java中的参数传递时传值呢?还是传引用？

41、Java中有没有指针的概念？

42、Java中，栈的大小通过什么参数来设置？

43、一个空Object对象的占多大空间？

44、对象引用类型分为那几类？

45、讲一讲垃圾回收算法。

46、如何解决内存碎片的问题？

47、如何解决同时存在的对象创建和对象回收问题？

48、讲一讲内存分代及生命周期。

49、什么情况下触发垃圾回收？

50、如何选择合适的垃圾收集算法？

51、JVM中最大堆大小有没有限制？

52、堆大小通过什么参数设置？

53、JVM有哪三种垃圾回收器？

54、吞吐量优先选择什么垃圾回收器？响应时间优先呢？

55、如何进行JVM调优？有哪些方法？

56、如何理解内存泄漏问题？有哪些情况会导致内存泄漏？如何解决？

126、volatile 的原子性问题？为什么 i++ 这种不支持原子性？从计算机原理的设计来讲下不能保证原子性的原因

# 参考资料

https://maimai.cn/article/detail?fid=1724791732&efid=4a9eC-XwLGQzl4F09gPajA

[30道有趣的JVM面试题(小结)](https://www.jb51.net/it/753914.html)

* any list
{:toc}