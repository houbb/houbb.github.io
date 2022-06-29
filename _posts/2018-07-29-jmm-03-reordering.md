---
layout: post
title:  JMM-03-cache & reordering
date:  2018-07-26 23:14:31 +0800
categories: [JMM]
tags: [java, jmm, concurrency, sf]
published: true
---


# 缓存

为了提升性能，JVM 做了 2 件事情。

缓存+重排序

## 为什么会出现线程可见性问题

要想解释为什么会出现线程可见性问题，需要从计算机处理器结构谈起。

我们都知道计算机运算任务需要CPU和内存相互配合共同完成，其中CPU负责逻辑计算，内存负责数据存储。

CPU要与内存进行交互，如读取运算数据、存储运算结果等。

由于内存和CPU的计算速度有几个数量级的差距，为了提高CPU的利用率，现代处理器结构都加入了一层读写速度尽可能接近CPU运算速度的高速缓存来作为内存与CPU之间的缓冲：
将运算需要使用的数据复制到缓存中，让CPU运算可以快速进行，计算结束后再将计算结果从缓存同步到主内存中，这样处理器就无须等待缓慢的内存读写了。


高速缓存的引入解决了CPU和内存之间速度的矛盾，但是在多CPU系统中也带来了新的问题：**缓存一致性**。

在多CPU系统中，每个CPU都有自己的高速缓存，所有的CPU又共享同一个主内存。

如果多个CPU的运算任务都涉及到主内存中同一个变量时，那同步回主内存时以哪个CPU的缓存数据为准呢？

这就需要各个CPU在数据读写时都遵循同一个协议进行操作。

```
处理器=》高速缓存=》缓存一致性协议=》主内存
处理器=》高速缓存=》缓存一致性协议=》主内存
```

参考上图，假设有两个线程A、B分别在两个不同的CPU上运行，它们共享同一个变量X。

如果线程A对X进行修改后，并没有将 X 更新后的结果同步到主内存，则变量X的修改对B线程是不可见的。

所以CPU与内存之间的高速缓存就是导致线程可见性问题的一个原因。

另一个原因就是**重排序**。

# 重排序

## 目的

现在的CPU一般采用流水线来执行指令。

一个指令的执行被分成：取指、译码、访存、执行、写回、等若干个阶段。然后，多条指令可以同时存在于流水线中，同时被执行。

指令流水线并不是串行的，并不会因为一个耗时很长的指令在“执行”阶段呆很长时间，而导致后续的指令都卡在“执行”之前的阶段上。

重排序的目的是**为了性能**。

- Example

理想情况下：

```
过程A：cpu0—写入1—> bank0；
过程B：cpu0—写入2—> bank1；
```

如果bank0状态为busy, 则A过程需要等待

如果进行重排序，则直接可以先执行B过程。


## 类别

在执行程序时为了提高性能，编译器和处理器常常会对指令做重排序。重排序分三种类型：

- 编译器优化的重排序

编译器在不改变单线程程序语义的前提下，可以重新安排语句的执行顺序。

- 指令级并行的重排序

现代处理器采用了指令级并行技术（Instruction-Level Parallelism， ILP）来将多条指令重叠执行。
如果不存在数据依赖性，处理器可以改变语句对应机器指令的执行顺序。

- 内存系统的重排序

由于处理器使用缓存和读/写缓冲区，这使得加载和存储操作看上去可能是在乱序执行。

## 执行过程

从java源代码到最终实际执行的指令序列，会分别经历下面三种重排序：

```
{源代码 -> 编译器优化重排序(1) -> 指令级并行重排序(2) -> 内存系统重排序(3) -> 最终执行的指令顺序}
```

上述的1属于编译器重排序，2和3属于处理器重排序。这些重排序都可能会导致多线程程序出现内存可见性问题。

对于编译器，JMM的编译器重排序规则会禁止特定类型的编译器重排序（不是所有的编译器重排序都要禁止）。

对于处理器重排序，JMM的处理器重排序规则会要求java编译器在生成指令序列时，插入特定类型的内存屏障（memory barriers，intel称之为memory fence）指令，
通过`内存屏障`指令来禁止特定类型的处理器重排序（不是所有的处理器重排序都要禁止）。

JMM 属于语言级的内存模型，它确保在不同的编译器和不同的处理器平台之上，通过禁止特定类型的编译器重排序和处理器重排序，为程序员提供一致的内存可见性保证。


# 不进行重排序的场景

## 数据依赖性

如果两个操作访问同一个变量，且这两个操作中有一个为写操作，此时这两个操作之间就存在**数据依赖性**。

| 名称	   |    示例	           | 说明 |
| 写后读   | 	a = 1; b = a;	| 写一个变量后再读这个位置 |
| 写后写   | 	a = 1; a = 2;	| 写一个变量后再写这个变量 |
| 读后写   | 	a = b; b = 1;	| 读一个变量后再写这个变量 |

上面三种情况，只要重排序两个操作的执行顺序，程序的执行结果将会被改变。

所以有数据依赖性的语句**不能**进行重排序。

## as-if-serial

- 概念

as-if-serial语义就是: 不管怎么重排序(编译器和处理器为了提高并行度), 单线程程序的执行结果不能被改变。所以编译器和cpu进行指令重排序时候回遵守as-if-serial语义。

- 栗子



```java
public int add() {
  int x = 1;    //1
  int y = 1;    //2
  int ans = x + y;  //3
  return ans
}
```

上面三条指令, 指令1和指令2没有数据依赖关系, 指令3依赖指令1和指令2。

根据上面我们讲的重排序不会改变我们的数据依赖关系, 依据这个结论, 我们可以确信指令3是不会重排序于指令1和指令2的前面。

我们看一下上面上条指令编译成字节码文件之后

```class
public int add();
    Code:
       0: iconst_1     // 将int型数值1入操作数栈
       1: istore_1     // 将操作数栈顶数值写到局部变量表的第2个变量(因为非静态方法会传入this, this就是第一个变量)
       2: iconst_1     // 将int型数值1入操作数栈
       3: istore_2     // 将将操作数栈顶数值写到局部变量表的第3个变量
       4: iload_1      // 将第2个变量的值入操作数栈
       5: iload_2      // 将第三个变量的值入操作数栈
       6: iadd         // 操作数栈顶元素和栈顶下一个元素做int型add操作, 并将结果压入栈
       7: istore_3     // 将栈顶的数值存入第四个变量
       8: iload_3      // 将第四个变量入栈
       9: ireturn      // 返回
```

以上的字节码我们只关心0->7行, 以上8行指令我们可以分为:

1. 写x

2. 写y

3. 读x

4. 读y

5. 加法操作写回 ans


上面的5个操作, 1操作和2、4可能会重排序, 2操作和1、3ch重排序, 操作3可能和2、4重排序, 操作4可能和1、3重排序。

对应上面的赋值x和赋值y有可能会进行重排序, 对, 这并不难以理解, 因为写x和写y并没有明确的数据依赖关系。
但是操作1和3和5并不能重排序, 因为3依赖1, 5依赖3, 同理操作2、4、5也不能进行重排序。

所以为了保证数据依赖性不被破坏, 重排序要遵守 `as-if-serial` 语义。

## JIT 优化原则

```java
@Test
public void testReordering2() {
    int x = 1;
    try {
        x = 2;     //A
        y = 2 / 0;  //B
    } catch (Exception e) {
        e.printStackTrace();
    } finally {
        System.out.println(x);
    }
}
```

上面这段代码A和B是有可能重排序的, 因为x和y并没有数据依赖关系, 并且也没有特殊的语义做限制。

但是如果发生 `B happens-before A` 的话, 此时是不是就打印了错误的x的值, 其实不然。

为了保证 `as-if-serial` 语义, Java异常处理机制对重排序做了一种特殊的处理: 

JIT在重排序时会在catch语句中插入错误代偿代码(即重排序到B后面的A), 这样做虽然会导致catch里面的逻辑变得复杂。

但是JIT优化原则是: **尽可能地优化程序正常运行下的逻辑, 哪怕以catch块逻辑变得复杂为代价**。

## 程序顺序原则

1. 如果A happens-before B

2. 如果B happens-before C 那么

3. A happens-before C

这就是happens-before传递性

# happens-before

从JDK5开始，java使用新的 JSR-133 内存模型（本文除非特别说明，针对的都是 JSR-133 内存模型）。

JSR-133 提出了 happens-before 的概念，通过这个概念来阐述操作之间的内存可见性。

如果一个操作执行的结果需要对另一个操作可见，那么这两个操作之间必须存在 happens-before 关系。

这里提到的两个操作既可以是在一个线程之内，也可以是在不同线程之间。 与程序员密切相关的 happens-before 规则如下：

- 程序顺序规则：一个线程中的每个操作，happens-before 于该线程中的任意后续操作。

- 监视器锁规则：对一个监视器锁的解锁，happens-before 于随后对这个监视器锁的加锁。

- volatile变量规则：对一个volatile域的写，happens-before 于任意后续对这个 volatile 域的读。

- 传递性：如果A happens-before B，且B happens-before C，那么A happens-before C。

注意，两个操作之间具有happens-before关系，并不意味着前一个操作必须要在后一个操作之前执行！

happens-before 仅仅要求前一个操作（执行的结果）对后一个操作可见，
且前一个操作按顺序排在第二个操作之前（the first is visible to and ordered before the second）。

happens-before 的定义很微妙，后文会具体说明 happens-before 为什么要这么定义。

## 意义

一个happens-before规则通常对应于多个编译器重排序规则和处理器重排序规则。

对于java程序员来说，happens-before 规则简单易懂，它避免程序员为了理解JMM提供的内存可见性保证而去学习复杂的重排序规则以及这些规则的具体实现。


# 重排序与JMM

Java内存模型(Java Memory Model简称JMM)总结了以下8条规则, 保证符合以下8条规则, happens-before前后两个操作, 不会被重排序且后者对前者的内存可见。

- 程序次序法则: 线程中的每个动作A都happens-before于该线程中的每一个动作B, 其中, 在程序中, 所有的动作B都能出现在A之后。

- 监视器锁法则: 对一个监视器锁的解锁happens-before于每一个后续对同一监视器锁的加锁。

- volatile变量法则: 对volatile域的写入操作happens-before于每一个后续对同一个域的读写操作。

- 线程启动法则: 在一个线程里, 对Thread.start的调用会happens-before于每个启动线程的动作。

- 线程终结法则: 线程中的任何动作都happens-before于其他线程检测到这个线程已经终结、或者从Thread.join调用中成功返回, 或Thread.isAlive返回false。

- 中断法则: 一个线程调用另一个线程的interrupt happens-before于被中断的线程发现中断。

- 终结法则: 一个对象的构造函数的结束happens-before于这个对象finalizer的开始。

- 传递性: 如果A happens-before于B, 且B happens-before于C, 则A happens-before于C。

# double-check 单例模式

## 错误代码示例

指令重排序导致错误的double-check单例模式

```java
public class Singleton {
    private static Singleton instance;

    public static Singleton getInstance() {
        if (instance == null) {
            synchronized (Singleton.class) {
                if (instance == null) {
                    instance = new Singleton();
                }
            }
        }
        return instance;
    }
}
```

但是这种double-check加锁的单例是正常的吗? No.

### 错误原因

因为创建一个实例对象并不是一个原子性的操作, 而且还可能发生重排序, 具体如下:
假定创建一个对象需要:

1. 申请内存

2. 初始化

3. instance 指向分配的那块内存

上面的2和3操作是有可能重排序的, 如果3重排序到2的前面, 这时候2操作还没有执行, instance已经不是null了, 当然不是安全的。


## 调整

修改如下:

```java
public class Singleton {
    private static volatile Singleton instance;

    public static Singleton getInstance() {
        if (instance == null) {
            synchronized (Singleton.class) {
                if (instance == null) {
                    instance = new Singleton();
                }
            }
        }
        return instance;
    }
}
```

### volatile

volatile 关键字有两个语义:

其一`保证内存可见性`, 这个语义我们下次博客会讲到(其实就是一个线程修改会对另一个线程可见, 
如果不是volatile, 线程操作都是在TLAB有副本的, 修改了副本的值之后不即时刷新到主存, 其他线程是不可见的)

其二`禁止指令重排序`, 如果上面 new 的时候, 禁止了指令重排序, 所以能得到期望的情况。

# 怎么禁止指令重排序

我们之前一会允许重排序, 一会禁止重排序, 但是重排序禁止是怎么实现的呢？ 

是用内存屏障cpu指令来实现的, 顾名思义, 就是加个障碍, 不让你重排序。

内存屏障可以被分为以下几种类型:

- LoadLoad 屏障: 对于这样的语句Load1; LoadLoad; Load2, 在Load2及后续读取操作要读取的数据被访问前, 保证Load1要读取的数据被读取完毕。

- StoreStore 屏障: 对于这样的语句Store1; StoreStore; Store2, 在Store2及后续写入操作执行前, 保证Store1的写入操作对其它处理器可见。

- LoadStore 屏障: 对于这样的语句Load1; LoadStore; Store2, 在Store2及后续写入操作被刷出前, 保证Load1要读取的数据被读取完毕。

- StoreLoad 屏障: 对于这样的语句Store1; StoreLoad; Load2, 在Load2及后续所有读取操作执行前, 保证Store1的写入对所有处理器可见。
它的开销是四种屏障中最大的。在大多数处理器的实现中, 这个屏障是个万能屏障, 兼具其它三种内存屏障的功能。

# 内存屏障指令

现代的处理器使用写缓冲区来临时保存向内存写入的数据。

写缓冲区可以保证指令流水线持续运行，它可以避免由于处理器停顿下来等待向内存写入数据而产生的延迟。

同时，通过以批处理的方式刷新写缓冲区，以及合并写缓冲区中对同一内存地址的多次写，可以减少对内存总线的占用。

虽然写缓冲区有这么多好处，但每个处理器上的写缓冲区，仅仅对它所在的处理器可见。

这个特性会对内存操作的执行顺序产生重要的影响：处理器对内存的读/写操作的执行顺序，不一定与内存实际发生的读/写操作顺序一致！

## 实例

为了具体说明，请看下面示例：

| Thread 1 | Thread 2 |
| a = 1; x = b; | b = 2; y=a; |

初始状态：a = b = 0

处理器允许执行后得到结果：x = y = 0 

假设处理器A和处理器B按程序的顺序并行执行内存访问，最终却可能得到 `x = y = 0` 的结果。

![reordering](https://raw.githubusercontent.com/houbb/resource/master/img/java/jmm/2018-07-26-reordering.png)

这里处理器A和处理器B可以同时把共享变量写入自己的写缓冲区（A1，B1），然后从内存中读取另一个共享变量（A2，B2），最后才把自己写缓存区中保存的脏数据刷新到内存中（A3，B3）。当以这种时序执行时，程序就可以得到x = y = 0的结果。

从内存操作实际发生的顺序来看，直到处理器A执行A3来刷新自己的写缓存区，写操作A1才算真正执行了。

虽然处理器A执行内存操作的顺序为：A1->A2，

但内存操作实际发生的顺序却是：A2->A1。

此时，处理器A的内存操作顺序被重排序了（处理器B的情况和处理器A一样，这里就不赘述了）。

这里的关键是，由于写缓冲区仅对自己的处理器可见，它会导致处理器执行内存操作的顺序可能会与内存实际的操作执行顺序不一致。

由于现代的处理器都会使用写缓冲区，因此现代的处理器都会允许对写-读操做重排序。

## 常见处理器

下面是常见处理器允许的重排序类型的列表：


|  	         |  Load-Load	| Load-Store |	Store-Store	Store-Load	| 数据依赖 |
| sparc-TSO  | 	    N	    | N	       |   N	      |  Y	   |     N  |
| x86	     |      N	    | N	       |   N	      |  Y	   |     N  |
| ia64	     |      Y	    | Y	       |   Y	      |  Y	   |     N  |
| PowerPC	 |      Y	    | Y	       |   Y	      |  Y	   |     N  |


从上表我们可以看出：

常见的处理器都允许Store-Load重排序；

常见的处理器都不允许对存在数据依赖的操作做重排序。

sparc-TSO和x86拥有相对较强的处理器内存模型，它们仅允许对写-读操作做重排序（因为它们都使用了写缓冲区）。

# 参考资料

https://www.cs.umd.edu/~pugh/java/memoryModel/jsr-133-faq.html#jsr133

https://www.jianshu.com/p/b4d4506d3585

http://blog.stormma.me/2018/03/30/%E5%85%B3%E4%BA%8Ejava%E5%86%85%E5%AD%98%E8%AE%BF%E9%97%AE%E9%87%8D%E6%8E%92%E5%BA%8F%E7%9A%84%E6%80%9D%E8%80%83/#more

http://www.infoq.com/cn/articles/java-memory-model-2

* any list
{:toc}