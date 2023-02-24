---
layout: post
title:  JVM 常见面试题之 GC 垃圾回收
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

# 前言

大家好，我是老马。

GC 在面试中频率也比较高，对常见问题进行整理，便于平时查阅收藏。

# JVM体系结构

一、在理解GC之前，先了解下JVM体系结构

![struct](https://img-blog.csdnimg.cn/20190101173455138.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3dlaXhpbl80MjQxNTE1OA==,size_16,color_FFFFFF,t_70)

# JVM JRE JDK的关系

JVM（java虚拟机），将 .class 文件中的字节码指令进行识别并调用操作系统向上的 API 完成动作。JVM不仅可以运行java程序，只要是能编译成.class的文件都能运行。

JRE （Java 运行时环境），包含了jvm和core lib。

JDK （Java 开发工具包），它集成了jre和一些工具。比如javac.exe，java.exe，jar.exe等。大家都知道，要想执行java程序，需要安装jdk。

# JVM 初识

JVM其实是一种规范，它提供可以执行Java字节码的运行时环境。

不同的供应商提供这种规范的不同实现。

常见的JVM实现有

- Hotspot oracle官方提供

- TaobaoVM 阿里对hotspot深底定制版

- J9 ibm实现

- Jrockit 号称是世界上最快的JVM

- openJDK

- azul zing

- LiquidVm 直接针对硬件

- Microsoft JVM

# JVM的内存模型

虚拟机在执行文件的时候将内存分为不同的区域，它们各司其职。

- 程序计数器

- java虚拟机栈栈

- 堆

- 方法区

- 本地方法栈

## 程序计数器/行号指示器

可以看作是当前线程所执行的字节码的行号指示器。

字节码解释器工作时就是通过改变这个计数器的值来选取下一条需要执行的字节码指令，分支、循环、跳转、异常处理、线程恢复等基础功能都需要依赖这个计数器来完成。

java虚拟机的多线程是通过线程轮流切换并分配处理器执行时间的方式来实现的，任何一个确定的时刻，一个处理器都只执行一条线程中的指令。

因此，为了线程切换后能恢复到正确的执行位置，每条线程都需要有一个独立的程序计数器，各条线程之间的计数器互不影响，独立存储。

所以这类内存区域为“线程私有”的内存。---《深入理解java虚拟机》它是一块较小的空间，也是唯一一个在java虚拟机规范中没有定义任何OOM的区域。

正在执行java方法的话，计数器记录的是虚拟机字节码指令的地址(当前指令的地址)。

如果是Natice方法，则为空。

## java虚拟机栈

也为线程私有，生命周期与线程相同，它描述的是Java方法执行的内存模型。

每个方法在执行的时候都会创建一个栈，每一个方法被调用的过程就对应一个栈帧在虚拟机栈中从入栈到出栈的过程。

它存储局部变量表、操作数栈，方法出口等信息。局部变量表的大小在编辑期间完成，所以进入执行方法时，栈的大小是确定的。

如果线程请求的栈深度大于虚拟机所允许的深度，将抛出StackOverflowError 异常；

如果虚拟机栈可以动态扩展，当扩展时无法申请到足够的内存时会抛出OutOfMemoryError 异常。

更多信息可参考 Java虚拟机运行时栈帧结构

**本地方法栈**和java虚拟机栈类似，只不过它表示的是Native方法

## 堆

这是java虚拟机中最大的一块内存，是被所有线程共享的一块内存区域，在虚拟机启动的时候被创建。

几乎所有的对象实例的内存都在这里，这也是它存在目的。

Java堆还可以细分为新生代和老年代。

新生代有可以分为eden伊甸区、from servivor，to servivor。

根据虚拟机规范，Java堆可以存在物理上不连续的内存空间，就像磁盘空间只要逻辑是连续的即可。

它的内存大小可以设为固定大小，也可以扩展。当前主流的虚拟机如HotPot都能按扩展实现(通过设置 -Xmx和-Xms)，如果堆中没有内存内存完成实例分配，而且堆无法扩展将报OOM错误。

**方法区**这也是一块共享区。存储了已被虚拟机加载的类信息、常量、静态变量、即使编辑器编辑后的代码等数据。

在老版jdk，方法区也被称为永久代「HotSpot虚拟机以永久代来实现方法区」。jdk8真正开始废弃永久代，而使用元空间(Metaspace)。

**当然上面的区分是JVM规范，每个虚拟机实现可能有不同的划分。有时候，我们可以粗略的把区域分为堆区和栈区。这也是程序员最关心的2个部分。**

# java 内存模型，JMM（java memory model）

## JMM作用

Java虚拟机规范中定义了Java内存模型（Java Memory Model，JMM），用于屏蔽掉各种硬件和操作系统的内存访问差异，以实现让Java程序在各种平台下都能达到一致的并发效果，JMM规范了Java虚拟机与计算机内存是如何协同工作的：规定了一个线程如何和何时可以看到由其他线程修改过后的共享变量的值，以及在必须时如何同步的访问共享变量。

详情参考 Java内存模型（JMM）总结

# java中的引用

## 强引用(Strong Reference):

在代码中普遍存在的，类似”Object obj = new Object”这类引用，只要强引用还在，垃圾收集器永远不会回收掉被引用的对象

## 软引用(Sofe Reference):

有用但并非必须的对象，可用SoftReference类来实现软引用，在系统将要发生内存溢出异常之前，将会把这些对象列进回收范围之中进行二次回收。如果这次回收还没有足够的内存，才会抛出内存异常异常。

## 弱引用(Weak Reference):

被弱引用关联的对象只能生存到下一次垃圾收集发生之前，JDK提供了WeakReference类来实现弱引用。

## 虚引用(Phantom Reference):

也称为幽灵引用或幻影引用，是最弱的一种引用关系，JDK提供了PhantomReference类来实现虚引用。

# finalize 方法什么作用

对于一个对象来说，在被判断没有 GCroots 与其相关联时，被第一次标记，然后判断该对象是否应该执行finalize方法（判断依据：如果对象的finalize方法被复写，并且没有执行过，则可以被执行）。

如果允许执行那么这个对象将会被放到一个叫F-Query的队列中，等待被执行。

（注意：由于finalize的优先级比较低，所以该对象的的finalize方法不一定被执行，即使被执行了，也不保证finalize方法一定会执行完）

# 什么是GC

GC可以理解为在追踪仍然使用的所有对象，并将其余对象标记为垃圾然后进行回收，这样的一个过程称之为GC，所有的GC系统可以从如下几个方面进行实现

1. GC判断策略（例如引用计数，对象可达）

2. GC收集算法（标记清除法，标记清除整理法，标记复制清除法，分代法）

3. GC收集器（例如Serial，Parallel，CMS，G1）

# 手动 GC

什么是手动 GC 呢？

即是手动为对象分配内存并回收内存

如下这是一个简单的手动内存管理C编写的示例

```c
int send_request() {
    size_t n = read_size();
    int *elements = malloc(n * sizeof(int));
 
    if(read_elements(n, elements) < n) {
        // elements not freed!
        return -1;
    }
 
    // …
 
    free(elements)
    return 0;
}
```

手动GC忘记释放内存是常有的事情。

这样的话会直接导致内存泄露。

# 如何判断是垃圾？

什么是自动 GC 呢？

自动GC一般是由系统自动对内存进行管理

想要 GC，首先要解决什么是垃圾的问题？

## 引用计数法

![引用计数法](https://img-blog.csdnimg.cn/20190101174440833.png)

其中：

1、绿色云表示它们指向的对象仍然由程序员使用。

2、蓝色圆圈是内存中的活动对象，其中的数字表示其引用计数

3、灰色圆圈是未从任何明确使用的对象引用的对象

对于引用计数法，有一个很大的缺陷就是**循环引用**，例如：

![循环依赖](https://img-blog.csdnimg.cn/20190101174750862.png)

其中红色对象实际上是应用程序不使用的垃圾。

但是由于引用计数的限制，它们不符合垃圾回收原理，所以仍然存在内存中，导致内存泄露。

## 根可达 root searching

就是从“GC Roots”对象作为起点开始往下搜索，搜索所有的“叶子”。

那些没有根的叶子就是垃圾。

GC Roots 对象包括以下几种：

- 虚拟机栈中引用的对象

- 方法区中静态属性和常量引用的对象

- 本地方法栈中引用的对象

现在的GC算法基本都是要从标记可达对象开始（Marking Reachable Objects）

例如：

![根可达](https://img-blog.csdnimg.cn/20190101180849594.png)

GC一般会设置一些特定对象为GC的根对象，例如：

1.栈中的变量

2.常量池中的引用

.....

GC基于根对象标记可访问对象（蓝色表示），对于不可达对象GC会认为是垃圾回收对象。

这种方法就完美解决了对象之间循环依赖的问题，但是存在短时间的线程暂停。

# 垃圾回收的算法

找到垃圾如何清理？也就是垃圾回收的算法

## 标记-清除（Mark-Sweep）

就如同它的名字，分为2个阶段，先标记后清除。

这也是最基础的算法，其他算法都在它的基础上优化而来。

优点：

1.存活对象比较多的时候效率高（老生代）。

2.算法简单。

缺点：

2遍扫描，效率偏低。第1遍标记有用的，第2遍清除没用的。

容易产生碎片。

## 复制(Copying)

为了提高效率，复制算法出现了。它将内存分为2块，每次只使用其中的一块，这块用完了，就把其中存活的对象复制到另一块。

然后把这块内存的对象全部清掉。

优点：

适用于存活对象比较少的情况（新生代），只扫描一次，效率提高，没有碎片。

缺点：

1. 空间浪费;

2. 移动复制对象，需要调整对象引用。

## 标记-整理算法（Mark-Compact）

如果存活对象比较多，移动对象效率变低。

为了不浪费另一块内存。

程序在运行过程中，很难有100%对象存活的极端情况。引出了标记整理算法。就是在标记-清除算法的基础上多了一步整理。

先把垃圾对象标记出来，然后把所有存活的对象移到内存中一块连续的内存，然后把这块内存以外的部分清除掉。

优点：

不会产生碎片，方便对象分配，不会产生内存减半。

缺点：

扫描2次，需要移动对象。

## 分代收集算法：

在上边三种收集思想中加入了分代的思想。

# Hotspot实现垃圾回收细节

## 一致性：

在可达性分析期间整个系统看起来就像被冻结在某个时间点上，不可以出现分析过程中对象引用关系还在不断变化的情况。

一致性要求导致GC进行时必须停顿所有Java执行线程。

（Stop The World）即使在号称不会发生停顿的CMS收集器中，枚举根节点时也是必须停顿的。

HotSpot使用的是准确式GC，当执行系统停顿下来后，并不需要一个不漏地检查完所有执行上下文和全局的引用位置，这是通过一组称为OopMap的数据结构来达到的。

## 安全点（Safe Point）：

程序只有在到达安全点时才能暂停。安全点的选定标准是“是否具有让程序长时间执行的特征”。

“长时间执行”的最明显特征就是指令序列的复用，如方法调用、循环跳转等，具有这些功能的指令才会产生安全点。

让程序暂停的两种方式：

* 抢先式中断（Preemptive Suspension）：在GC发生时，主动中断所有线程，不需要线程执行的代码主动配合。如果发现有线程中断的地方不在安全点上，就恢复线程让它跑到安全点上。（不推荐）

* 主动式中断（Voluntary Suspension）：设一个标志，各个线程主动去轮询这个标志，遇到中断则暂停。轮询地方与安全点重合。


# JAVA中的GC分析
 
## 2.1、碎片与压缩

JVM在垃圾回收过程中可能会产生大量碎片，为了提供其读写性能，需要对碎片进行压缩

例如：

![压缩](https://img-blog.csdnimg.cn/20190101175642126.png)

## 分代设想

我们知道垃圾收集要停止应用程序的运行，那么如果这个收集过程需要的时间很长，就会对应用程序产生很大的性能问题，如何解决这个问题呢？

通过实验发现内存中的对象可以将其分为两大类：

1.存活时间较短（这样的对象比较大）

2.存活时间较长（这样的对象量比较小）

基于对如上问题的分析，通过了解科学家提出了分代回收思路（年轻代，老年代，永久代），同时缩小垃圾回收范围。

例如：

![分代](https://img-blog.csdnimg.cn/20190101180250535.png)

## GC模式分析

垃圾收集事件(Garbage Collection events)通常分为：

1.Minor GC (小型GC)：年轻代GC事件

2.Major GC（大型GC）：老年代GC事件

3.Full GC (完全GC)：整个堆的GC事件

# 分代思想

Java 中的堆是 JVM 所管理的最大的一块内存空间，主要用于存放各种类的实例对象。

## 分区

在 Java 中，堆被划分成两个不同的区域：新生代 ( Young )、老年代 ( Old )。其中新生代 ( Young ) 又被划分为三个区域：Eden、From Survivor、To Survivor。

这样划分的目的是为了使 JVM 能够更好的管理堆内存中的对象，包括内存的分配以及回收。

堆的内存模型大致为：

默认的，新生代 ( Young ) 与老年代 ( Old ) 的比例的值为 1:2 ( 该值可以通过参数 –XX:NewRatio 来指定 )，即：新生代 ( Young ) = 1/3 的堆空间大小。老年代 ( Old ) = 2/3 的堆空间大小。其中，新生代 ( Young ) 被细分为 Eden 和 两个 Survivor 区域，这两个 Survivor 区域分别被命名为 from 和 to，以示区分。

![分区模型](https://img2020.cnblogs.com/blog/1829052/202007/1829052-20200709110520302-1388497677.png)

默认的，Edem : from : to = 8 : 1 : 1 ( 可以通过参数 –XX:SurvivorRatio 来设定 )，即： Eden = 8/10 的新生代空间大小，from = to = 1/10 的新生代空间大小。

根据垃圾回收机制的不同，Java堆有可能拥有不同的结构，最为常见的就是将整个Java堆分为新生代和老年代。其中新生带存放新生的对象或者年龄不大的对象，老年代则存放老年对象。

新生代分为den区、s0区、s1区，s0和s1也被称为from和to区域，他们是两块大小相等并且可以互相角色的空间。

绝大多数情况下，对象首先分配在eden区，在新生代回收后，如果对象还存活，则进入s0或s1区，之后每经过一次

新生代回收，如果对象存活则它的年龄就加1，对象达到一定的年龄后（默认15），则进入老年代。

新生代：存放刚出生不久的对象

老年代：存放比较活跃、经常被引用的对象

垃圾回收机制在新生代比较频繁

## 年轻代

也叫新生代，顾名思义，主要是用来存放新生的对象。新生代又细分为 Eden区、SurvivorFrom区、SurvivorTo区。

新创建的对象都会被分配到Eden区(如果该对象占用内存非常大，则直接分配到老年代区), 当Eden区内存不够的时候就会触发MinorGC（Survivor满不会引发MinorGC，而是将对象移动到老年代中），

在Minor GC开始的时候，对象只会存在于Eden区和Survivor from区，Survivor to区是空的。

Minor GC操作后，Eden区如果仍然存活（判断的标准是被引用了，通过GC root进行可达性判断）的对象，将会被移到Survivor To区。而From区中，对象在Survivor区中每熬过一次Minor GC，年龄就会+1岁，当年龄达到一定值(年龄阈值，可以通过-XX:MaxTenuringThreshold来设置，默认是15)的对象会被移动到年老代中，否则对象会被复制到“To”区。经过这次GC后，Eden区和From区已经被清空。

“From”区和“To”区互换角色，原Survivor To成为下一次GC时的Survivor From区, 总之，GC后，都会保证Survivor To区是空的。

### 奇怪为什么有 From和To，2块区域？

这就要说到新生代Minor GC的算法了：复制算法

把内存区域分为两块，每次使用一块，GC的时候把一块中的内容移动到另一块中，原始内存中的对象就可以被回收了，

优点是**避免内存碎片**。

## 老年代

随着Minor GC的持续进行，老年代中对象也会持续增长，导致老年代的空间也会不够用，最终会执行Major GC（MajorGC 的速度比 Minor GC 慢很多很多，据说10倍左右）。

Major GC使用的算法是：标记清除（回收）算法或者标记压缩算法。

标记清除（回收）：

1. 首先会从GC root进行遍历，把可达对象（存过的对象）打标记

2. 再从GC root二次遍历，将没有被打上标记的对象清除掉。

优点：老年代对象一般是比较稳定的，相比复制算法，不需要复制大量对象。之所以将所有对象扫描2次，看似比较消耗时间，其实不然，是节省了时间。

举个栗子，数组 1,2,3,4,5,6。删除2,3,4，如果每次删除一个数字，那么5,6要移动3次，如果删除1次，那么5,6只需移动1次。

缺点：这种方式需要中断其他线程（STW），相比复制算法，可能产生内存碎片。

标记压缩：和标记清除算法基本相同，不同的就是，在清除完成之后，会把存活的对象向内存的一边进行压缩，这样就可以解决内存碎片问题。 

当老年代也满了装不下的时候，就会抛出OOM（Out of Memory）异常。

## 永久代（元空间）

在Java8中，永久代已经被移除，被一个称为“元数据区”（元空间，Metaspace）的区域所取代。

值得注意的是：元空间并不在虚拟机中，而是使用本地内存（之前，永久代是在jvm中）。

这样，解决了以前永久代的OOM问题，元数据和class对象存在永久代中，容易出现性能问题和内存溢出，毕竟是和老年代共享堆空间。

java8后，永久代升级为元空间独立后，也降低了老年代GC的复杂度。

## 有关年轻代的JVM参数

1)-XX:NewSize和-XX:MaxNewSize

      用于设置年轻代的大小，建议设为整个堆大小的1/3或者1/4,两个值设为一样大。

2)-XX:SurvivorRatio

      用于设置Eden和其中一个Survivor的比值，这个值也比较重要。

3)-XX:+PrintTenuringDistribution

      这个参数用于显示每次Minor GC时Survivor区中各个年龄段的对象的大小。

4).-XX:InitialTenuringThreshol和-XX:MaxTenuringThreshold

      用于设置晋升到老年代的对象年龄的最小值和最大值，每个对象在坚持过一次Minor GC之后，年龄就加1。


# FULL GC

面说到了minor gc 和major gc，那么看下full gc

## Full GC 概念

是清理整个堆空间—包括年轻代和老年代。

什么时候触发：

1. 调用 System.gc

2. 方法区空间不足

2. 老年代空间不足，包括：

新创建的对象都会被分配到Eden区，如果该对象占用内存非常大，则直接分配到老年代区，此时老年代空间不足

做minor gc操作前，发现要移动的空间（Eden区、From区向To区复制时，To区的内存空间不足）比老年代剩余空间要大，则触发full gc，而不是minor gc
等等

GC优化的本质，也是为什么分代的原因：**减少GC次数和GC时间，避免全区扫描**。



## 如何减少GC出现的次数（GC优化）

1.对象不用时最好显式置为 Null

一般而言,为 Null 的对象都会被作为垃圾处理,所以将不用的对象显式地设为 Null,有利于 GC 收集器判定垃圾,从而提高了 GC 的效率。

2.尽量少用 System.gc()

此函数建议JVM 进行主GC,虽然只是建议而非一定,但很多情况下它会触发主 GC,从而增加主 GC 的频率,也即增加了间歇性停顿的次数。

3.尽量少用静态变量

静态变量属于全局变量,不会被 GC 回收,它们会一直占用内存。

4.尽量使用 StringBuffer, 而不用String 来累加字符串。

由于 String 是固定长的字符串对象,累加 String 对象时,并非在一个 String对象中扩增,而是重新创建新的 String 对象,如 Str5=Str1+Str2+Str3+Str4,这条语句执行过程中会产生多个垃圾对象,因为对次作“+”操作时都必须创建新的 String 对象,但这些过渡对象对系统来说是没有实际意义的,只会增加更多的垃圾。

避免这种情况可以改用 StringBuffer 来累加字符串,因 StringBuffer是可变长的,它在原有基础上进行扩增,不会产生中间对象。

5.分散对象创建或删除的时间

集中在短时间内大量创建新对象,特别是大对象,会导致突然需要大量内存,JVM 在面临这种情况时,只能进行主 GC,以回收内存或整合内存碎片,从而增加主 GC 的频率。

集中删除对象,道理也是一样的。它使得突然出现了大量的垃圾对象,空闲空间必然减少,从而大大增加了下一次创建新对象时强制主 GC 的机会。

6.尽量少用 finalize 函数。

因为它会加大 GC 的工作量，因此尽量少用finalize 方式回收资源。

7.如果需要使用经常用到的图片，可以使用软引用类型，它可以尽可能将图片保存在内存中，供程序调用，而不引起 OutOfMemory。

8.能用基本类型如 int,long,就不用 Integer,Long 对象

基本类型变量占用的内存资源比相应包装类对象占用的少得多,如果没有必要,最好使用基本变量。

9.增大 -Xmx

# GC 日志

```java
public static void main(String[] args) {
    Object obj = new Object();
    System.gc();
    System.out.println();
    obj = new Object();
    obj = new Object();
    System.gc();
    System.out.println();
}
```

设置 JVM 参数为 `-XX:+PrintGCDetails`，使得控制台能够显示 GC 相关的日志信息，执行上面代码，下面是其中一次执行的结果。

![GC LOG](https://img-blog.csdnimg.cn/img_convert/7f0668a7b8aa32d8bb53baeeca521b1d.png)

![GC LOG2](https://img-blog.csdnimg.cn/img_convert/25d64f20154842546031edb24fb7d372.png)

Full GC 信息与 Minor GC 的信息是相似的，这里就不一个一个的画出来了。

从 Full GC 信息可知，新生代可用的内存大小约为 18M，则新生代实际分配得到的内存空间约为 20M(为什么是 20M? 请继续看下面...)。

老年代分得的内存大小约为 42M，堆的可用内存的大小约为 60M。可以计算出： 18432K ( 新生代可用空间 ) + 42112K ( 老年代空间 ) = 60544K ( 堆的可用空间 )

新生代约占堆大小的 1/3，老年代约占堆大小的 2/3。

也可以看出，GC 对新生代的回收比较乐观，而对老年代以及方法区的回收并不明显或者说不及新生代。

并且在这里 Full GC 耗时是 Minor GC 的 22.89 倍。


# GC算法基础

## 标记可达对象

现在的GC算法基本都是要从标记可达对象开始（Marking Reachable Objects）

例如：

![标记可达对象](https://img-blog.csdnimg.cn/20190101180849594.png)

GC一般会设置一些特定对象为GC的根对象，例如：

1.栈中的变量

2.常量池中的引用

.....

GC基于根对象标记可访问对象（蓝色表示），对于不可达对象GC会认为是垃圾回收对象。

## 移除不可达对象

移除不可达对象（Removing Unused Objects）时会因GC算法的不同而不同，但是所有的GC操作一般都可以分为三组：

清除（Sweep），压缩（Compact），复制（Copy）

- 清除（Sweep）

![sweep](https://img-blog.csdnimg.cn/20190101181540677.png)

- 压缩（Compact）

![Compact](https://img-blog.csdnimg.cn/20190101181606585.png)

- 复制（Copy）

![copy](https://img-blog.csdnimg.cn/20190101181633201.png)

复制算法会基于标记清除压缩算法，创建新的内存空间用于存储幸存对象，同时可以复制与标记同时并发执行。

这样可以较少GC时系统的暂停时间，提高系统性能

# GC 算法实现

现在对于JVM中的GC算法两大类：一类负责收集年轻代，一类负责收集老年代。

假如没有显式指定垃圾回收算法，一般会采用系统平台默认算法，当然也可以自己指定，下面是JDK8中的一些垃圾回收算法应用组合如下：


| Young |  Tenured | JVM options |
|:---|:---|:---|
| Serial | Serial | -XX:+UseSerialGC |
| Parallel Scavenge | Parallel Old | -XX:+UseParallelGC -XX:+UseParallelOldGC |
| Parallel New | CMS | -XX:+UseParNewGC -XX:+UseConcMarkSweepGC |
| G1 | G1 | -XX:+UseG1GC |

以上四种GC组合是现阶段最突出的几种方式。

## Serial GC

Serial GC(串行收集器)应用特点：

1. 内部只使用一个线程去回收（不能充分利用CPU的多核特性），无法并行化

2. GC过程可能会产生较长的时间停顿

### Serial GC（串行收集器）算法应用：

3.1  新生代复制算法（新生代存活对象较少）

3.2  老年代标记-压缩算法（老年代对象回收较少，容易产生碎片）

### Serial GC(串行收集器)场景应用：

a. 应用在具体几百兆字节大小的JVM

b. 应用在知有单个CPU的环境中

### Serial GC（串行收集器）应用参数实践：

```
java -xx:+UseSerialGC com.mypackages.MyExecutableClass
```

### Serial GC 模式分析：

1. Minor GC

![MINOR GC](https://img-blog.csdnimg.cn/20190101185350604.png)

2. Full GC

![FULL GC](https://img-blog.csdnimg.cn/20190101185358182.png)

## Parallel GC

并行收集器应用特点：

1.可利用cpu的多核特性，可并行化执行GC操作。

2.在GC期间，所有cpu内核都在并行清理垃圾，所以暂停时间较短。

Parallel GC (并行收集器)算法应用：

1.在年轻代使用 标记-复制（mark-copy）算法：

1.在老年代使用 标记清除整理（mark-sweep-compact）算法

Parallel GC（并行收集器）场景应用：

1.应用于多核处理器，执行并行收集提高吞吐量。

2.GC操作仍需暂停应用程序，所以不适合低延迟场景

Parallel GC（并行收集器）模式分析：（事件分析）

1.Minor GC

![Minor GC](https://img-blog.csdnimg.cn/20190101185414811.png)

2.Full GC

![Full GC](https://img-blog.csdnimg.cn/20190101185425957.png)

## Concurrent Mark and Sweep (CMS)

即 标记-清除-垃圾收集器

CMS收集器特点：（避免在老年代垃圾收集时出现长时间卡顿）

1. 使用空闲列表管理内存空间的回收，不对老年代进行整理

2. 在标记-清除阶段大部分工作和应用线程一起并发执行。

CMS 算法应用：

1. 年轻代采用并行STW方式的mark-copy（标记-复制）算法

2. 老年代主要使用并发 mark-sweep（标记-清除）算法。

CMS场景应用

1. 应用于多核处理器，目标降低延迟，缩短停顿时间

2. cpu受限场景下，会与应用线程竞争cpu，吞吐量会减少

CMS 关键阶段可以分为4个步骤：

1. 初始标记 （CMS initial mark）

2. 并发标记  ( CMS concurrent mark)

3. 重新标记  ( CMS remark)

4. 并发清除  (CMS concurrent sweep)

其中初始标记，重新标记这连个步骤仍然需要 "Stop The World" 初始标记仅仅只是标记GC Roots或yong gen能够直接关联到的对象，速度很快。

![初始标记](https://img-blog.csdnimg.cn/20190101185946833.png)

并发标记阶段就是进行GC Roots Tracin的过程，在此阶段，垃圾收集器遍历老年代，标记所有的存活对象，从前一阶段InitialMark找到的root根开始算起。

![并发标记阶段](https://img-blog.csdnimg.cn/2019010119014965.png)

并发预清理（重新标记）阶段则是为了修正并发标记期间，因用户程序继续运作而导致冰机产生变动的那一部分的标记记录，这个阶段的停顿时间一般会比初始标记阶段长一些，但远比并发标记时间短。

![并发预清理（重新标记）](https://img-blog.csdnimg.cn/20190101190436661.png)

预清理阶段，这些脏对象会被统计出来，从他们可达对象也被标记下来，此阶段完成后，用标记的card也就会被清空。

![预清理阶段](https://img-blog.csdnimg.cn/20190101190617444.png)

并发清除此阶段与应用程序并发执行，不需要STW停顿。

目的是删除未使用的对象，并回收他们占用的空间

![并发清除此阶段](https://img-blog.csdnimg.cn/20190101190726599.png)

由于整个过程中耗时最长的并发标记和并发清除过程中，收集器线程都可以与用户线程一起工作，所以总体上来说，CMS收集器的内存回收过程是与用户线程一起并发执行

# CMS 收集器

## 特性：

CMS（Concurrent Mark Sweep）收集器是一种以获取最短回收停顿时间为目标的收集器。

目前很大一部分的Java应用集中在互联网站或者B/S系统的服务端上，这类应用尤其重视服务的响应速度，希望系统停顿时间最短，以给用户带来较好的体验。

CMS收集器就非常符合这类应用的需求。

CMS收集器是基于“标记—清除”算法实现的，它的运作过程相对于前面几种收集器来说更复杂一些，整个过程分为4个步骤：

初始标记（CMS initial mark）：初始标记仅仅只是标记一下GC Roots能直接关联到的对象，速度很快，需要“Stop The World”。

并发标记（CMS concurrent mark）：并发标记阶段就是进行GC Roots Tracing的过程。

重新标记（CMS remark）：重新标记阶段是为了修正并发标记期间因用户程序继续运作而导致标记产生变动的那一部分对象的标记记录，这个阶段的停顿时间一般会比初始标记阶段稍长一些，但远比并发标记的时间短，仍然需要“Stop The World”。

并发清除（CMS concurrent sweep）：并发清除阶段会清除对象。

由于整个过程中耗时最长的并发标记和并发清除过程收集器线程都可以与用户线程一起工作，所以，从总体上来说，CMS收集器的内存回收过程是与用户线程一起并发执行的。

## 优点：

CMS是一款优秀的收集器，它的主要优点在名字上已经体现出来了：并发收集、低停顿。

## 缺点：

1）CMS收集器对CPU资源非常敏感

其实，面向并发设计的程序都对CPU资源比较敏感。在并发阶段，它虽然不会导致用户线程停顿，但是会因为占用了一部分线程（或者说CPU资源）而导致应用程序变慢，总吞吐量会降低。

CMS默认启动的回收线程数是（CPU数量+3）/ 4，也就是当CPU在4个以上时，并发回收时垃圾收集线程不少于25%的CPU资源，并且随着CPU数量的增加而下降。但是当CPU不足4个（譬如2个）时，CMS对用户程序的影响就可能变得很大。

2）CMS收集器无法处理浮动垃圾

CMS收集器无法处理浮动垃圾，可能出现“Concurrent Mode Failure”失败而导致另一次Full GC的产生。

由于CMS并发清理阶段用户线程还在运行着，伴随程序运行自然就还会有新的垃圾不断产生，这一部分垃圾出现在标记过程之后，CMS无法在当次收集中处理掉它们，只好留待下一次GC时再清理掉。这一部分垃圾就称为“浮动垃圾”。

也是由于在垃圾收集阶段用户线程还需要运行，那也就还需要预留有足够的内存空间给用户线程使用，因此CMS收集器不能像其他收集器那样等到老年代几乎完全被填满了再进行收集，需要预留一部分空间提供并发收集时的程序运作使用。

要是CMS运行期间预留的内存无法满足程序需要，就会出现一次“Concurrent Mode Failure”失败，这时虚拟机将启动后备预案：临时启用Serial Old收集器来重新进行老年代的垃圾收集，这样停顿时间就很长了。

3）CMS收集器会产生大量空间碎片

CMS是一款基于“标记—清除”算法实现的收集器，这意味着收集结束时会有大量空间碎片产生。空间碎片过多时，将会给大对象分配带来很大麻烦，往往会出现老年代还有很大空间剩余，但是无法找到足够大的连续空间来分配当前对象，不得不提前触发一次Full GC。

# G1 收集器

## 特性：

G1（Garbage-First）是一款面向服务端应用的垃圾收集器。

HotSpot开发团队赋予它的使命是未来可以替换掉JDK 1.5中发布的CMS收集器。

与其他GC收集器相比，G1具备如下特点。

1)并行与并发

G1能充分利用多CPU、多核环境下的硬件优势，使用多个CPU来缩短Stop-The-World停顿的时间，部分其他收集器原本需要停顿Java线程执行的GC动作，G1收集器仍然可以通过并发的方式让Java程序继续执行。

2)分代收集

与其他收集器一样，分代概念在G1中依然得以保留。虽然G1可以不需要其他收集器配合就能独立管理整个GC堆，但它能够采用不同的方式去处理新创建的对象和已经存活了一段时间、熬过多次GC的旧对象以获取更好的收集效果。

3)空间整合

与CMS的“标记—清理”算法不同，G1从整体来看是基于“标记—整理”算法实现的收集器，从局部（两个Region之间）上来看是基于“复制”算法实现的，但无论如何，这两种算法都意味着G1运作期间不会产生内存空间碎片，收集后能提供规整的可用内存。

这种特性有利于程序长时间运行，分配大对象时不会因为无法找到连续内存空间而提前触发下一次GC。

4)可预测的停顿

这是G1相对于CMS的另一大优势，降低停顿时间是G1和CMS共同的关注点，但G1除了追求低停顿外，还能建立可预测的停顿时间模型，能让使用者明确指定在一个长度为M毫秒的时间片段内，消耗在垃圾收集上的时间不得超过N毫秒。

在G1之前的其他收集器进行收集的范围都是整个新生代或者老年代，而G1不再是这样。

使用G1收集器时，Java堆的内存布局就与其他收集器有很大差别，它将整个Java堆划分为多个大小相等的独立区域（Region），虽然还保留有新生代和老年代的概念，但新生代和老年代不再是物理隔离的了，它们都是一部分Region（不需要连续）的集合。

G1收集器之所以能建立可预测的停顿时间模型，是因为它可以有计划地避免在整个Java堆中进行全区域的垃圾收集。

G1跟踪各个Region里面的垃圾堆积的价值大小（回收所获得的空间大小以及回收所需时间的经验值），在后台维护一个优先列表，每次根据允许的收集时间，优先回收价值最大的Region（这也就是Garbage-First名称的来由）。

这种使用Region划分内存空间以及有优先级的区域回收方式，保证了G1收集器在有限的时间内可以获取尽可能高的收集效率。

## 执行过程：

G1收集器的运作大致可划分为以下几个步骤：

1）初始标记（Initial Marking）：初始标记阶段仅仅只是标记一下GC Roots能直接关联到的对象，并且修改TAMS（Next Top at Mark Start）的值，让下一阶段用户程序并发运行时，能在正确可用的Region中创建新对象，这阶段需要停顿线程，但耗时很短。

2）并发标记（Concurrent Marking）：并发标记阶段是从GC Root开始对堆中对象进行可达性分析，找出存活的对象，这阶段耗时较长，但可与用户程序并发执行。

3）最终标记（Final Marking）：最终标记阶段是为了修正在并发标记期间因用户程序继续运作而导致标记产生变动的那一部分标记记录，虚拟机将这段时间对象变化记录在线程Remembered Set Logs里面，最终标记阶段需要把Remembered Set Logs的数据合并到Remembered Set中，这阶段需要停顿线程，但是可并行执行。

4）筛选回收（Live Data Counting and Evacuation）：筛选回收阶段首先对各个Region的回收价值和成本进行排序，根据用户所期望的GC停顿时间来制定回收计划，这个阶段其实也可以做到与用户程序一起并发执行，但是因为只回收一部分Region，时间是用户可控制的，而且停顿用户线程将大幅提高收集效率。


# 2.6 常用工具

工欲善其事，必先利其器，此处列出一些笔者常用的工具，具体情况大家可以自由选择，本文的问题都是使用这些工具来定位和分析的。

## 2.6.1 命令行终端

标准终端类：jps、jinfo、jstat、jstack、jmap

功能整合类：jcmd、vjtools、arthas、greys

## 2.6.2 可视化界面

简易：JConsole、JVisualvm、HA、GCHisto、GCViewer

进阶：MAT、JProfiler

命令行推荐 arthas ，可视化界面推荐 JProfiler，此外还有一些在线的平台 gceasy、heaphero、fastthread ，美团内部的 Scalpel（一款自研的 JVM 问题诊断工具，暂时未开源）也比较好用。


# JVM参数选项

jvm 可配置的参数选项可以参考 Oracle 官方网站给出的相关信息：

> [Java HotSpot VM Options](http://www.oracle.com/technetwork/java/javase/tech/vmoptions-jsp-140102.html)

下面只列举其中的几个常用和容易掌握的配置选项

![JVM OPTION](https://img-blog.csdnimg.cn/8974bf182ad1416fa1fb8ab90b1fa3f6.png?x-oss-process=image/watermark,type_ZHJvaWRzYW5zZmFsbGJhY2s,shadow_50,text_Q1NETiBA6ZqP6aOOZnJheWE=,size_20,color_FFFFFF,t_70,g_se,x_16)

代码：

```java
/**
  -Xms60m
  -Xmx60m
  -Xmn20m
  -XX:NewRatio=2 ( 若 Xms = Xmx, 并且设定了 Xmn, 那么该项配置就不需要配置了 )
  -XX:SurvivorRatio=8
  -XX:PermSize=30m
  -XX:MaxPermSize=30m
  -XX:+PrintGCDetails
 */
 public static void main(String[] args) {
     new Test().doTest();
 }
 
 public void doTest(){
     Integer M = new Integer(1024 * 1024 * 1);  //单位, 兆(M)
     byte[] bytes = new byte[1 * M]; //申请 1M 大小的内存空间
     bytes = null;  //断开引用链
     System.gc();   //通知 GC 收集垃圾
     System.out.println();
     bytes = new byte[1 * M];  //重新申请 1M 大小的内存空间
     bytes = new byte[1 * M];  //再次申请 1M 大小的内存空间
     System.gc();
     System.out.println();
 }
```

按上面代码中注释的信息设定 jvm 相关的参数项，并执行程序，下面是一次执行完成控制台打印的结果：

```
[ GC [ PSYoungGen:  1351K -> 288K (18432K) ]  1351K -> 288K (59392K), 0.0012389 secs ]  [ Times: user=0.00 sys=0.00, real=0.00 secs ] 
[ Full GC (System)  [ PSYoungGen:  288K -> 0K (18432K) ]  [ PSOldGen:  0K -> 160K (40960K) ]  288K -> 160K (59392K)  [ PSPermGen:  2942K -> 2942K (30720K) ],  0.0057649 secs ] [ Times:  user=0.00  sys=0.00,  real=0.01 secs ] 

[ GC [ PSYoungGen:  2703K -> 1056K (18432K) ]  2863K -> 1216K(59392K),  0.0008206 secs ]  [ Times: user=0.00 sys=0.00, real=0.00 secs ] 
[ Full GC (System)  [ PSYoungGen:  1056K -> 0K (18432K) ]  [ PSOldGen:  160K -> 1184K (40960K) ]  1216K -> 1184K (59392K)  [ PSPermGen:  2951K -> 2951K (30720K) ], 0.0052445 secs ]  [ Times: user=0.02 sys=0.00, real=0.01 secs ] 

Heap
 PSYoungGen      total 18432K, used 327K [0x00000000fec00000, 0x0000000100000000, 0x0000000100000000)
  eden space 16384K, 2% used [0x00000000fec00000,0x00000000fec51f58,0x00000000ffc00000)
  from space 2048K, 0% used [0x00000000ffe00000,0x00000000ffe00000,0x0000000100000000)
  to   space 2048K, 0% used [0x00000000ffc00000,0x00000000ffc00000,0x00000000ffe00000)
 PSOldGen        total 40960K, used 1184K [0x00000000fc400000, 0x00000000fec00000, 0x00000000fec00000)
  object space 40960K, 2% used [0x00000000fc400000,0x00000000fc5281f8,0x00000000fec00000)
 PSPermGen       total 30720K, used 2959K [0x00000000fa600000, 0x00000000fc400000, 0x00000000fc400000)
  object space 30720K, 9% used [0x00000000fa600000,0x00000000fa8e3ce0,0x00000000fc400000)
```

从打印结果可以看出，堆中新生代的内存空间为 18432K ( 约 18M )，eden 的内存空间为 16384K ( 约 16M)，from / to survivor 的内存空间为 2048K ( 约 2M)。

这里所配置的 Xmn 为 20M，也就是指定了新生代的内存空间为 20M，可是从打印的堆信息来看，新生代怎么就只有 18M 呢? 另外的 2M 哪里去了? 

别急，是这样的。新生代 = eden + from + to = 16 + 2 + 2 = 20M，可见新生代的内存空间确实是按 Xmn 参数分配得到的。

而且这里指定了 SurvivorRatio = 8，因此，eden = 8/10 的新生代空间 = 8/10 * 20 = 16M。from = to = 1/10 的新生代空间 = 1/10 * 20 = 2M。

堆信息中新生代的 total 18432K 是这样来的： eden + 1 个 survivor = 16384K + 2048K = 18432K，即约为 18M。

因为 jvm 每次只是用新生代中的 eden 和 一个 survivor，因此新生代实际的可用内存空间大小为所指定的 90%。

因此可以知道，这里新生代的内存空间指的是新生代可用的总的内存空间，而不是指整个新生代的空间大小。

另外，可以看出老年代的内存空间为 40960K ( 约 40M )，堆大小 = 新生代 + 老年代。因此在这里，老年代 = 堆大小 - 新生代 = 60 - 20 = 40M。

最后，这里还指定了 PermSize = 30m，PermGen 即永久代 ( 方法区 )，它还有一个名字，叫非堆，主要用来存储由 jvm 加载的类文件信息、常量、静态变量等

# 参考资料

[JVM中GC原理解析](https://blog.csdn.net/weixin_42415158/article/details/85548656)

https://www.jb51.net/article/214026.htm

https://segmentfault.com/a/1190000023017150

[JVM、GC 大串讲，面试够用了](https://baijiahao.baidu.com/s?id=1688977998648314205&wfr=spider&for=pc)

https://baijiahao.baidu.com/s?id=1700237878506043329&wfr=spider&for=pc

https://www.cnblogs.com/hongshaozi/p/14151742.html

https://blog.csdn.net/q8250356/article/details/122160133

https://blog.csdn.net/fraya1234/article/details/120550984

* any list
{:toc}