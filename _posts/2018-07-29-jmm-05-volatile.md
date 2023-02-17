---
layout: post
title:  JMM-05-volatile
date:  2018-07-27 11:31:20 +0800
categories: [JMM]
tags: [thread, concurrency, thread]
published: true
---

“工作 5 年了，竟然不知道 volatile 关键字！”

听着刚面试完的架构师一顿吐槽，其他几个同事也都参与这次吐槽之中。

都说国内的面试是“面试造航母，工作拧螺丝”，不得不说这也是一件很悲哀的事情。

但是面试官的职责就是要知道面试人员的水平高低，这是工资的决定性过程。

你工作几年了？知道 volatile 关键字吗？

今天就让我们一起来学习一下 volatile 关键字，做一个在可以面试中造航母的螺丝工！

![volatile+介绍](https://images.gitee.com/uploads/images/2020/1020/204046_a194e015_508704.png)

# volatile

Java语言规范第三版中对 volatile 的定义如下： 

java编程语言允许线程访问共享变量，为了确保共享变量能被准确和一致的更新，线程应该确保通过排他锁单独获得这个变量。

Java语言提供了 volatile，在某些情况下比锁更加方便。

如果一个字段被声明成 volatile，java线程内存模型确保所有线程看到这个变量的值是一致的。

## 语义

一旦一个共享变量（类的成员变量、类的静态成员变量）被 volatile 修饰之后，那么就具备了两层语义：

1. 保证了不同线程对这个变量进行操作时的可见性，即一个线程修改了某个变量的值，这新值对其他线程来说是立即可见的。

2. 禁止进行指令重排序。

- 注意

如果 final 变量也被声明为 volatile，那么这就是编译时错误。

ps: 一个意思是变化可见，一个是永不变化。自然水火不容。

# 问题引入

- Error.java

```java
//线程1
boolean stop = false;
while(!stop){
    doSomething();
}
 
//线程2
stop = true;
```

这段代码是很典型的一段代码，很多人在中断线程时可能都会采用这种标记办法。

## 问题分析

但是事实上，这段代码会完全运行正确么？即一定会将线程中断么？

不一定，也许在大多数时候，这个代码能够把线程中断，但是也有可能会导致无法中断线程（虽然这个可能性很小，但是只要一旦发生这种情况就会造成死循环了）。

下面解释一下这段代码为何有可能导致无法中断线程。

在前面已经解释过，每个线程在运行过程中都有自己的工作内存，那么线程1在运行的时候，会将stop变量的值拷贝一份放在自己的工作内存当中。

那么当线程 2 更改了 stop 变量的值之后，但是还没来得及写入主存当中，线程 2 转去做其他事情了，

那么线程 1 由于不知道线程 2 对 stop 变量的更改，因此还会一直循环下去。

## 使用 volatile 

第一：使用 volatile 关键字会强制将修改的值立即写入主存；

第二：使用 volatile 关键字的话，当线程2进行修改时，会导致线程1的工作内存中缓存变量stop的缓存行无效（反映到硬件层的话，就是CPU的L1或者L2缓存中对应的缓存行无效）；

第三：由于线程1的工作内存中缓存变量 stop 的缓存行无效，所以线程 1 再次读取变量 stop 的值时会去主存读取。

那么在线程 2 修改 stop 值时（当然这里包括 2 个操作，修改线程 2 工作内存中的值，然后将修改后的值写入内存），
会使得线程 1 的工作内存中缓存变量 stop 的缓存行无效，然后线程 1 读取时，
发现自己的缓存行无效，它会等待缓存行对应的主存地址被更新之后，然后去对应的主存读取最新的值。

那么线程 1 读取到的就是最新的正确的值。

# volatile 保证原子性吗

从上面知道 volatile 关键字保证了操作的可见性，但是 volatile 能保证对变量的操作是原子性吗？

## 问题引入

```java
public class VolatileAtomicTest {

    public volatile int inc = 0;

    public void increase() {
        inc++;
    }

    public static void main(String[] args) {
        final VolatileAtomicTest test = new VolatileAtomicTest();
        for (int i = 0; i < 10; i++) {
            new Thread(() -> {
                for (int j = 0; j < 1000; j++) {
                    test.increase();
                }
            }).start();
        }

        //保证前面的线程都执行完
        while (Thread.activeCount() > 1) {
            Thread.yield();
        }
        System.out.println(test.inc);
    }
}
```

- 计算结果是多少？

你可能觉得是 10000，但是实际是比这个数要小。

## 原因

可能有的朋友就会有疑问，不对啊，上面是对变量 inc 进行自增操作，由于 volatile 保证了可见性，
那么在每个线程中对inc自增完之后，在其他线程中都能看到修改后的值啊，所以有10个线程分别进行了 1000 次操作，那么最终inc的值应该是 1000*10=10000。

这里面就有一个误区了，volatile 关键字能保证可见性没有错，但是上面的程序错在没能保证原子性。

可见性只能保证每次读取的是最新的值，但是 volatile 没办法保证对变量的操作的原子性。

- 解决方式

使用 Lock synchronized 或者 AtomicInteger 

# volatile 能保证有序性吗

volatile关键字禁止指令重排序有两层意思：

1. 当程序执行到 volatile 变量的读操作或者写操作时，在其前面的操作的更改肯定全部已经进行，且结果已经对后面的操作可见；在其后面的操作肯定还没有进行；

2. 在进行指令优化时，不能将在对 volatile 变量访问的语句放在其后面执行，也不能把 volatile 变量后面的语句放到其前面执行。

## 实例

- 实例一

```java
//x、y为非volatile变量
//flag为volatile变量
 
x = 2;        //语句1
y = 0;        //语句2
flag = true;  //语句3
x = 4;        //语句4
y = -1;       //语句5
```

由于 flag 变量为 volatile 变量，那么在进行指令重排序的过程的时候，不会将语句3放到语句1、语句2前面，也不会讲语句3放到语句4、语句5后面。

但是要注意语句1和语句2的顺序、语句4和语句5的顺序是不作任何保证的。

并且 volatile 关键字能保证，执行到语句3时，语句1和语句2必定是执行完毕了的，且语句1和语句2的执行结果对语句3、语句4、语句5是可见的。


- 实例二

```java
//线程1:
context = loadContext();   //语句1
inited = true;             //语句2
 
//线程2:
while(!inited ){
  sleep()
}
doSomethingwithconfig(context);
```

前面举这个例子的时候，提到有可能语句2会在语句1之前执行，那么久可能导致 context 还没被初始化，而线程2中就使用未初始化的context去进行操作，导致程序出错。

这里如果用 volatile 关键字对 inited 变量进行修饰，就不会出现这种问题了，因为当执行到语句2时，必定能保证 context 已经初始化完毕。

# 常见使用场景

而 volatile 关键字在某些情况下性能要优于 synchronized，

但是要注意 volatile 关键字是无法替代 synchronized 关键字的，因为 volatile 关键字无法保证操作的原子性。

通常来说，使用 volatile 必须具备以下2个条件：

1. 对变量的写操作不依赖于当前值

2. 该变量没有包含在具有其他变量的不变式中

实际上，这些条件表明，可以被写入 volatile 变量的这些有效值独立于任何程序的状态，包括变量的当前状态。

事实上，我的理解就是上面的2个条件需要保证操作是原子性操作，才能保证使用volatile关键字的程序在并发时能够正确执行。

## 常见场景

- 状态标记量

```java
volatile boolean flag = false;
 
while(!flag){
    doSomething();
}
 
public void setFlag() {
    flag = true;
}
```

- 单例 double check

```java
public class Singleton{
    private volatile static Singleton instance = null;
     
    private Singleton() {
         
    }
     
    public static Singleton getInstance() {
        if(instance==null) {
            synchronized (Singleton.class) {
                if(instance==null)
                    instance = new Singleton();
            }
        }
        return instance;
    }
}
```

# JSR-133 的增强

在 JSR-133 之前的旧 Java 内存模型中，虽然不允许 volatile 变量之间重排序，但旧的 Java 内存模型允许 volatile 变量与普通变量之间重排序。

在旧的内存模型中，VolatileExample 示例程序可能被重排序成下列时序来执行：

```java
class VolatileExample {
    int a = 0;
    volatile boolean flag = false;

    public void writer() {
        a = 1;                      //1
        flag = true;                //2
    }

    public void reader() {
        if (flag) {                //3
            int i =  a;            //4
        }
    }
}
```

- 时间线

```
时间线：----------------------------------------------------------------->
线程 A：(2)写 volatile 变量;                                  (1)修改共享变量 
线程 B：                    (3)读取 volatile 变量; (4)读共享变量
```

在旧的内存模型中，当1和2之间没有数据依赖关系时，1和2之间就可能被重排序（3和4类似）。

其结果就是：读线程B执行4时，不一定能看到写线程A在执行1时对共享变量的修改。

因此在旧的内存模型中 ，volatile 的写-读没有监视器的释放-获所具有的内存语义。

为了提供一种比监视器锁更轻量级的线程之间通信的机制，

JSR-133专家组决定增强 volatile 的内存语义：

严格限制编译器和处理器对 volatile 变量与普通变量的重排序，确保 volatile 的写-读和监视器的释放-获取一样，具有相同的内存语义。

从编译器重排序规则和处理器内存屏障插入策略来看，只要 volatile 变量与普通变量之间的重排序可能会破坏 volatile 的内存语意，
这种重排序就会被编译器重排序规则和处理器内存屏障插入策略禁止。

# volatile 实现原理

## 术语定义

| 术语 | 英文单词 | 描述 |
|:---|:---|:---|
| 共享变量 | Shared variables | 在多个线程之间能够被共享的变量被称为共享变量。共享变量包括所有的实例变量，静态变量和数组元素。他们都被存放在堆内存中，volatile 只作用于共享变量 |
| 内存屏障 | Memory Barriers | 是一组处理器指令，用于实现对内存操作的顺序限制 |
| 缓冲行 | Cache line | 缓存中可以分配的最小存储单位。处理器填写缓存线时会加载整个缓存线，需要使用多个主内存读周期 |
| 原子操作 | Atomic operations | 不可中断的一个或一系列操作 |
| 缓存行填充 | cache line fill | 当处理器识别到从内存中读取操作数是可缓存的，处理器读取整个缓存行到适当的缓存（L1，L2，L3的或所有） |
| 缓存命中 | cache hit | 如果进行高速缓存行填充操作的内存位置仍然是下次处理器访问的地址时，处理器从缓存中读取操作数，而不是从内存 |
| 写命中 | write hit | 当处理器将操作数写回到一个内存缓存的区域时，它首先会检查这个缓存的内存地址是否在缓存行中，如果存在一个有效的缓存行，则处理器将这个操作数写回到缓存，而不是写回到内存，这个操作被称为写命中 |
| 写缺失 | write misses the cache | 一个有效的缓存行被写入到不存在的内存区域 |

## 原理

那么 volatile 是如何来保证可见性的呢？

在 x86 处理器下通过工具获取 JIT 编译器生成的汇编指令来看看对 volatile 进行写操作 CPU 会做什么事情。

- java 

```java
instance = new Singleton();//instance是volatile变量
```

对应汇编

```
0x01a3de1d: movb $0x0,0x1104800(%esi);
0x01a3de24: lock addl $0x0,(%esp);
```

有 volatile 变量修饰的共享变量进行写操作的时候会多第二行汇编代码，
通过查 [IA-32 架构软件开发者手册](https://www.intel.cn/content/www/cn/zh/architecture-and-technology/64-ia-32-architectures-software-developer-manual-325462.html)可知，`lock` 前缀的指令在多核处理器下会引发了两件事情。

- 将当前处理器缓存行的数据会写回到系统内存。

- 这个写回内存的操作会引起在其他 CPU 里缓存了该内存地址的数据无效。

处理器为了提高处理速度，不直接和内存进行通讯，而是先将系统内存的数据读到内部缓存（L1,L2或其他）后再进行操作，但操作完之后不知道何时会写到内存，

如果对声明了 volatile 变量进行写操作，JVM就会向处理器发送一条Lock前缀的指令，将这个变量所在缓存行的数据写回到系统内存。

但是就算写回到内存，如果其他处理器缓存的值还是旧的，再执行计算操作就会有问题。

所以在多处理器下，为了保证各个处理器的缓存是一致的，就会实现缓存一致性协议，每个处理器通过嗅探在总线上传播的数据来检查自己缓存的值是不是过期了，
当处理器发现自己缓存行对应的内存地址被修改，就会将当前处理器的缓存行设置成无效状态，当处理器要对这个数据进行修改操作的时候，会强制重新从系统内存里把数据读到处理器缓存里。

![可见性](https://images.gitee.com/uploads/images/2020/1020/204526_b794cfa1_508704.png)

这两件事情在IA-32软件开发者架构手册的第三册的多处理器管理章节（第八章）中有详细阐述

### Lock 前缀指令会引起处理器缓存回写到内存

Lock 前缀指令导致在执行指令期间，声言处理器的 LOCK# 信号。

在多处理器环境中，LOCK# 信号确保在声言该信号期间，处理器可以独占使用任何共享内存。（因为它会锁住总线，导致其他CPU不能访问总线，不能访问总线就意味着不能访问系统内存），但是在最近的处理器里，LOCK＃信号一般不锁总线，而是锁缓存，毕竟锁总线开销比较大。

在8.1.4章节有详细说明锁定操作对处理器缓存的影响，对于Intel486和Pentium处理器，在锁操作时，总是在总线上声言LOCK#信号。

但在P6和最近的处理器中，如果访问的内存区域已经缓存在处理器内部，则不会声言LOCK#信号。

相反地，它会锁定这块内存区域的缓存并回写到内存，并使用缓存一致性机制来确保修改的原子性，此操作被称为“缓存锁定”，
缓存一致性机制会阻止同时修改被两个以上处理器缓存的内存区域数据。

### 一个处理器的缓存回写到内存会导致其他处理器的缓存无效

IA-32处理器和Intel 64处理器使用MESI（修改，独占，共享，无效）控制协议去维护内部缓存和其他处理器缓存的一致性。

在多核处理器系统中进行操作的时候，IA-32 和Intel 64处理器能嗅探其他处理器访问系统内存和它们的内部缓存。

它们使用嗅探技术保证它的内部缓存，系统内存和其他处理器的缓存的数据在总线上保持一致。

例如在Pentium和P6 family处理器中，如果通过嗅探一个处理器来检测其他处理器打算写内存地址，而这个地址当前处理共享状态，
那么正在嗅探的处理器将无效它的缓存行，在下次访问相同内存地址时，强制执行缓存行填充。

# volatile 的使用优化

著名的 Java 并发编程大师 Doug lea 在 JDK7 的并发包里新增一个队列集合类 `LinkedTransferQueue`，
他在使用 volatile 变量时，用一种追加字节的方式来优化队列出队和入队的性能。

追加字节能优化性能？这种方式看起来很神奇，但如果深入理解处理器架构就能理解其中的奥秘。

让我们先来看看 `LinkedTransferQueue` 这个类，
它使用一个内部类类型来定义队列的头队列（Head）和尾节点（tail），
而这个内部类 PaddedAtomicReference 相对于父类 AtomicReference 只做了一件事情，就**将共享变量追加到 64 字节**。

我们可以来计算下，一个对象的引用占4个字节，它追加了15个变量共占60个字节，再加上父类的Value变量，一共64个字节。

- LinkedTransferQueue.java

```java
/** head of the queue */
private transient final PaddedAtomicReference < QNode > head;

/** tail of the queue */

private transient final PaddedAtomicReference < QNode > tail;


static final class PaddedAtomicReference < T > extends AtomicReference < T > {

    // enough padding for 64bytes with 4byte refs 
    Object p0, p1, p2, p3, p4, p5, p6, p7, p8, p9, pa, pb, pc, pd, pe;

    PaddedAtomicReference(T r) {

        super(r);

    }

}

public class AtomicReference < V > implements java.io.Serializable {

    private volatile V value;

    //省略其他代码 
｝
```

## 为什么追加64字节能够提高并发编程的效率呢？

因为对于英特尔酷睿i7，酷睿， Atom和NetBurst， Core Solo和Pentium M处理器的L1，L2或L3缓存的高速缓存行是64个字节宽，不支持部分填充缓存行，这意味着如果队列的头节点和尾节点都不足64字节的话，处理器会将它们都读到同一个高速缓存行中，在多处理器下每个处理器都会缓存同样的头尾节点，当一个处理器试图修改头接点时会将整个缓存行锁定，那么在缓存一致性机制的作用下，会导致其他处理器不能访问自己高速缓存中的尾节点，而队列的入队和出队操作是需要不停修改头接点和尾节点，所以在多处理器的情况下将会严重影响到队列的入队和出队效率。

Doug lea使用追加到64字节的方式来填满高速缓冲区的缓存行，**避免头接点和尾节点加载到同一个缓存行，使得头尾节点在修改时不会互相锁定**。

- 那么是不是在使用Volatile变量时都应该追加到64字节呢？

不是的。

在两种场景下不应该使用这种方式。

第一：缓存行非64字节宽的处理器，如P6系列和奔腾处理器，它们的L1和L2高速缓存行是32个字节宽。

第二：共享变量不会被频繁的写。

因为使用追加字节的方式需要处理器读取更多的字节到高速缓冲区，这本身就会带来一定的性能消耗，共享变量如果不被频繁写的话，锁的几率也非常小，就没必要通过追加字节的方式来避免相互锁定。

ps: 忽然觉得术业想专攻，博学与睿智缺一不可。

# double/long 线程不安全

Java虚拟机规范定义的许多规则中的一条：所有对基本类型的操作，除了某些对long类型和double类型的操作之外，都是原子级的。

目前的JVM（java虚拟机）都是将32位作为原子操作，并非64位。

当线程把主存中的 long/double类型的值读到线程内存中时，可能是两次32位值的写操作，显而易见，如果几个线程同时操作，那么就可能会出现高低2个32位值出错的情况发生。

要在线程间共享long与double字段时，必须在synchronized中操作，或是声明为volatile。

# 小结 

volatile 作为 JMM 中非常重要的一个关键字，基本也是面试高并发必问的知识点。

希望本文对你的工作学习面试有所帮助，如果有其他想法的话，也可以评论区和大家分享哦。

各位**极客**的点赞收藏转发，是老马写作的最大动力！

# 参考资料

[se8-jls-8.3.1.4](https://docs.oracle.com/javase/specs/jls/se8/html/jls-8.html#jls-8.3.1.4)

https://www.cnblogs.com/dolphin0520/p/3920373.html

https://www.ibm.com/developerworks/cn/java/j-jtp06197.html

http://www.importnew.com/23520.html

http://sakyone.iteye.com/blog/668091

http://www.techug.com/post/java-volatile-keyword.html

http://www.infoq.com/cn/articles/ftf-java-volatile

http://www.infoq.com/cn/articles/java-memory-model-4

- jit

https://www.jianshu.com/p/20066472d85b

https://www.ibm.com/developerworks/cn/java/j-lo-just-in-time/index.html

- intel

https://www.intel.cn/content/www/cn/zh/architecture-and-technology/64-ia-32-architectures-software-developer-manual-325462.html

* any list
{:toc}