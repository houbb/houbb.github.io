---
layout: post
title:  JMM-06-happens before
date:  2018-07-29 12:14:02 +0800
categories: [JMM]
tags: [thread, concurrency, thread, sf]
published: true
---

# as-if-serial

不管怎么重排序（编译器和处理器为了提高并行度），（单线程）程序的执行结果不会改变。

编译器、runtime和处理器都必须遵守 `as-if-serial` 语义。

为了遵守 `as-if-serial` 语义，编译器和处理器不会对存在数据依赖关系的操作做重排序，因为这种重排序会改变执行结果。

但是，如果操作之间不存在数据依赖关系，这些操作就可能被编译器和处理器重排序。

# happens before

## 作用

JMM 可以通过 `happens-before` 关系向程序员提供**跨线程的内存可见性保证**。

（如果A线程的写操作a与B线程的读操作b之间存在 happens-before 关系，尽管 a 操作和 b 操作在不同的线程中执行，但 JMM 向程序员保证 a 操作将对 b 操作可见）

1. 如果一个操作 happens-before 另一个操作，那么第一个操作的执行结果将对第二个操作可见，而且第一个操作的执行顺序排在第二个操作之前。

2. 两个操作之间存在 happens-before 关系，并不意味着 Java 平台的具体实现必须要按照 happens-before 关系指定的顺序来执行。
如果重排序之后的执行结果，与按 happens-before 关系来执行的结果一致，那么这种重排序并不非法（也就是说，JMM 允许这种重排序）。

- 其中 1 是 JMM **对程序员的承诺**

从程序员的角度来说，可以这样理解 happens-before 关系：如果 A happens-before B，那么 Java 内存模型将向程序员保证——A 操作的结果将对B可见，且 A 的执行顺序排在B之前。注意，这只是 Java 内存模型向程序员做出的保证！

- 其中 2 是 JMM **对编译器和处理器重排序的约束原则**

正如前面所言，JMM 其实是在遵循一个基本原则：只要不改变程序的执行结果（指的是单线程程序和正确同步的多线程程序），编译器和处理器怎么优化都行。

JMM这么做的原因是：程序员对于这两个操作是否真的被重排序并不关心，程序员关心的是程序执行时的语义不能被改变（即执行结果不能被改变）。

因此，happens-before 关系本质上和 as-if-serial 语义是一回事。

## vs as-if-serial

1. as-if-serial 语义保证单线程内程序的执行结果不被改变，happens-before 关系保证正确同步的多线程程序的执行结果不被改变。

2. as-if-serial 语义给编写单线程程序的程序员创造了一个幻境：单线程程序是按程序的顺序来执行的。
happens-before 关系给编写正确同步的多线程程序的程序员创造了一个幻境：正确同步的多线程程序是按 happens-before 指定的顺序来执行的。

3. as-if-serial 语义和 happens-before 这么做的目的，都是为了在不改变程序执行结果的前提下，尽可能地提高程序执行的并行度。

## 概念

两个动作可以由 `happens-before` 的关系排序。

如果一个动作发生在另一个动作之前，那么第一个动作是可见的，并且在排序于第一个动作之前。

第二, 有许多方法可以诱导事件发生——在Java程序中排序之前，
包括:

- 线程中的每个操作都发生在该线程中的每个后续操作之前。

- 在监视器上的每次锁定之前，都会对其进行解锁。

- 在每次读取该挥发物之前，都要对该挥发物进行一次写入操作。

- 在启动线程中的任何操作之前，对线程执行 `start()` 调用。

- 线程中的所有操作都发生在其他线程成功从a返回之前 `join()` 线程。

- 如果动作 a 发生在动作 b 之前，而b发生在动作 c 之前，那么 a 之前 c。

当一个程序包含两个冲突访问，而这两个访问不是由 `happens-before` 排序的关系，据说包含一个数据竞争。

一个正确同步的程序是其中没有数据竞争(第3.4节包含一个微妙但重要的澄清)。

ps: 以上内容节选自 JSR-133

## 实例

假设存在如下三个线程，分别执行对应的操作:

```
线程A中执行如下操作：i=1

线程B中执行如下操作：j=i

线程C中执行如下操作：i=2
```

假设线程A中的操作”i=1“ happen—before线程B中的操作“j=i”，那么就可以保证在线程B的操作执行后，变量j的值一定为1，即线程B观察到了线程A中操作“i=1”所产生的影响；

现在，我们依然保持线程A和线程B之间的 happen—before 关系，同时线程C出现在了线程A和线程B的操作之间，但是C与B并没有happen—before关系，
那么j的值就不确定了，线程C对变量i的影响可能会被线程B观察到，也可能不会，这时线程B就存在读取到不是最新数据的风险，不具备线程安全性。

# synchronization

## 同步到底做了什么？

同步有几个方面。最容易理解的是互斥,只有一个线程可以举行一次监控,所以同步监测意味着一旦一个线程进入监视器保护的同步块,没有其他线程可以输入一个街区保护监测到第一个线程退出synchronized 块。

但是同步不仅仅是相互排斥。同步确保在同步块之前或期间由线程写入的内存以可预测的方式显示给在同一监视器上同步的其他线程。

在退出一个同步块之后，我们释放(`release`)监视器，它具有将缓存刷新到主内存的效果，因此这个线程所做的写入可以被其他线程看到。
在输入同步块之前，我们获取(`acquire`)监视器，它的作用是使本地处理器缓存失效，以便从主内存重新加载变量。
然后，我们将能够看到前一版本中可见的所有写操作。

从缓存的角度讨论这个问题，可能听起来这些问题只会影响多处理器机器。
但是，在单个处理器上可以很容易地看到重新排序的效果。
例如，编译器不可能在获取之前或发布之后移动代码。
当我们说获取和释放作用于缓存时，我们使用了一些可能的效果的简写。

新的内存模型语义在内存操作(读字段、写字段、锁、解锁)和其他线程操作(开始和连接)上创建了部分排序，在这些操作中，某些操作据说在其他操作之前发生(happen before)。

当一个动作先于另一个动作发生时，第一个动作被保证在第二个动作之前被排序并可见。

排序规则，见 [happens-before 规则](#规则)。


# 规则

## 8 大规则

下面是Java内存模型中的八条可保证happen—before的规则，它们无需任何同步器协助就已经存在，可以在编码中直接使用。

如果两个操作之间的关系不在此列，并且无法从下列规则推导出来的话，它们就没有顺序性保障，虚拟机可以对它们进行随机地重排序

- 单线程规则

在一个单独的线程中，按照程序代码的执行流顺序，（时间上）先执行的操作 happen—before 后执行的操作。

- 锁定规则

一个 unlock 操作 happen—before 后面对同一个锁的 lock 操作。

- volatile 变量规则

对一个 volatile 变量的写操作 happen—before 后面对该变量的读操作。

- 线程启动规则

Thread 对象的 `start()` happen—before此线程的每一个动作。

- 线程结束规则

线程的所有操作都 happen—before 对此线程的终止检测，
可以通过 `Thread.join()` 方法结束、`Thread.isAlive()` 的返回值等手段检测到线程已经终止执行。

- 中断规则

对线程 `interrupt()` 方法的调用 happen—before 发生于被中断线程的代码检测到中断时事件的发生。

- 终结器规则

一个对象的初始化完成（构造函数执行结束）happen—before它的 `finalize()` 方法的开始。

- 传递性规则

如果操作 A happen—before 操作 B，操作 B happen—before 操作 C，那么可以得出 A happen—before 操作 C。

## 单线程规则

在同一个线程中，书写在前面的操作happens-before后面的操作。

- 不可变

```java
int a = 3;      //1
int b = a + 1;  //2
```

b 的值存在对 a 的依赖关系，所以 JVM 禁止重排序。

从而保证 //1 的变化对于 //2 是可见的。

- 可变

```java
int a = 3;
int b = 4;
```

两个语句直接没有依赖关系，所以指令重排序可能发生，即对b的赋值可能先于对a的赋值。

## 锁定规则

同一个锁的unlock操作happen-beofre此锁的lock操作。

```java
public class A {
   public int var;

   private static A a = new A();

   private A(){}

   public static A getInstance(){
       return a;
   }

   public synchronized void method1(){
       var = 3;
   }

   public synchronized void method2(){
       int b = var;
   }

   public void method3(){
       synchronized(new A()){ //注意这里和method1 method2 用的可不是同一个锁哦
           var = 4;
       }
   }
}
```

执行不同线程的代码

```java
//线程1执行的代码：
A.getInstance().method1(); 

//线程2执行的代码：
A.getInstance().method2(); 

//线程3执行的代码：
A.getInstance().method3();
```

如果某个时刻执行完“线程1” 马上执行“线程2”，因为“线程1”执行A类的method1方法后肯定要释放锁，“线程2”在执行A类的method2方法前要先拿到锁，符合“锁的happens-before原则”，那么在“线程2”method2方法中的变量var一定是3，所以变量b的值也一定是3。

但是如果是“线程1”、“线程3”、“线程2”这个顺序，那么最后“线程2”method2方法中的b值是3，还是4呢？
其结果是可能是3，也可能是4。的确“线程3”在执行完method3方法后的确要unlock，然后“线程2”有个lock，
但是这**两个线程用的不是同一个锁**，所以JMM这个两个操作之间不符合八大 `happens-before` 中的任何一条，
所以JMM不能保证“线程3”对var变量的修改对“线程2”一定可见，虽然“线程3”先于“线程2”发生。

## volatile 变量规则

对一个 volatile 变量的写操作 happens-before 对此变量的任意操作：

```java
volatile int a;

a = 1; //1

b = a;  //2
```

如果线程1 执行//1，“线程2”执行了//2,并且“线程1”执行后,“线程2”再执行,那么符合“volatile的happens-before原则”所以“线程2”中的a值一定是1。

# happens-before 的真正含义

下面我们在深入思考一下，`happens-before` 原则到底是如何解决变量间可见性问题的。

我们已经知道，导致多线程间可见性问题的两个“罪魁祸首”是CPU缓存和重排序。

那么如果要保证多个线程间共享的变量对每个线程都及时可见，一种极端的做法就是禁止使用所有的重排序和CPU缓存。

即关闭所有的编译器、操作系统和处理器的优化，所有指令顺序全部按照程序代码书写的顺序执行。

去掉CPU高速缓存，让CPU的每次读写操作都直接与主存交互。

当然，上面的这种极端方案是绝对不可取的，因为这会极大影响处理器的计算性能，并且对于那些非多线程共享的变量是不公平的。

**重排序和CPU高速缓存有利于计算机性能的提高，但却对多CPU处理的一致性带来了影响**。

为了解决这个矛盾，我们可以采取一种折中的办法。

我们用分割线把整个程序划分成几个程序块，在每个程序块内部的指令是可以重排序的，但是分割线上的指令与程序块的其它指令之间是不可以重排序的。

在一个程序块内部，CPU不用每次都与主内存进行交互，只需要在CPU缓存中执行读写操作即可，但是当程序执行到分割线处，CPU必须将执行结果同步到主内存或从主内存读取最新的变量值。

那么，`happens-before` 规则就是定义了这些程序块的分割线。

下图展示了一个使用锁定原则作为分割线的例子：

- Thread A

```
----
(X)
----
    Lock M
----
    其他操作    (X)
----
    Unlock M
----
```

unlock 之前的所有操作，对于 lock 之后所有操作都是可见的

- Thread B

```
----
(X)
----
    Lock M
----
    其他操作    (X)
----
    Unlock M
----
```

如图所示，这里的unlock M和lock M就是划分程序的分割线。

在这里，`(X)` 区域的代码内部是可以进行重排序的，但是unlock和lock操作是不能与它们进行重排序的。

即第一个图中的 `(X)` 区域必须要在unlock M指令之前全部执行完，第二个图中的 `(X)` 区域必须全部在lock M指令之后执行。

并且在第一个图中的unlock M指令处，`(X)` 区域的执行结果要全部刷新到主存中，在第二个图中的lock M指令处，`(X)` 区域用到的变量都要从主存中重新读取。

在程序中加入分割线将其划分成多个程序块，虽然在程序块内部代码仍然可能被重排序，但是保证了程序代码在宏观上是有序的。

并且可以确保在分割线处，CPU一定会和主内存进行交互。

happens-before 原则就是定义了程序中什么样的代码可以作为分隔线。

并且无论是哪条 happens-before 原则，它们所产生分割线的作用都是相同的。

# DCL

下面是一个典型的在单例模式中使用 DCL 的例子：

```java
public class LazySingleton {
    private int someField;
    
    private static LazySingleton instance;
    
    private LazySingleton() {
        this.someField = new Random().nextInt(200)+1;         // (1)
    }
    
    public static LazySingleton getInstance() {
        if (instance == null) {                               // (2)
            synchronized(LazySingleton.class) {               // (3)
                if (instance == null) {                       // (4)
                    instance = new LazySingleton();           // (5)
                }
            }
        }
        return instance;                                      // (6)
    }
    
    public int getSomeField() {
        return this.someField;                                // (7)
    }
}
```

## 问题

这里得到单一的 instance 实例是没有问题的，问题的关键在于尽管得到了 Singleton 的正确引用，但是**却有可能访问到其成员变量的不正确值**。

具体来说 `Singleton.getInstance().getSomeField()` 有可能返回 someField 的默认值 0。

为也说明这种情况理论上有可能发生，我们只需要说明语句(1)和语句(7)并不存在 happens-before 关系。

## 分析

假设线程 1 是初次调用 `getInstance()` 方法，紧接着线程 2 也调用了 `getInstance()` 方法和 `getSomeField()` 方法，
我们要说明的是线程 1 的语句 (1) 并不 happens-before 线程 2 的语句(7)。

线程 2 在执行 `getInstance()` 方法的语句(2)时，由于对 instance 的访问并没有处于同步块中，
因此线程 2 可能观察到也可能观察不到线程 1 在语句(5)时对 instance 的写入，也就是说 instance 的值可能为空也可能为非空。

- instance 值非空

我们先假设instance的值非空，也就观察到了线程 1 对 instance 的写入。

对于线程2：首先执行(6)返回 instance，然后执行(7)。

注意，(7) 没有任何同步，根据以上 `happens-before` 的 8 条规则，无法保证线程 1-(1) 和线程 2-(7) 之间的 happpens-before 关系。

这就是 DCL 的问题所在。

- instance 值为空

线程 2 在执行语句(2)时也有可能观察空值。

如果是种情况，那么它需要进入同步块，并执行语句(4)。

在语句(4)处线程 2 还能够读到 instance 的空值吗？不可能。

这里为这时对 instance 的写和读都是发生在同一个锁确定的同步块中，这时读到的数据是最新的数据。

为也加深印象，我再用 happens-before 规则分析一遍。

线程 2 在语句(3)处会执行 `lock` 操作，而线程 1 在语句(5)后会执行一个 `unlock` 操作，这两个操作都是针对同一个锁(`Singleton.class`)，

因此根据第 2 条 happens-before 规则，线程 1 的 unlock 操作 happens-before 线程 2 的 lock 操作;

再利用单线程规则，线程 1 的语句(5) -> 线程 1 的 unlock 操作, 线程 2 的 lock 操作 -> 线程 2 的语句(4);

再根据传递规则，就有线程 1 的语句(5)-> 线程 2 的语句(4)，也就是说线程 2 在执行语句(4)时能够观测到线程Ⅰ在语句(5)时对 Singleton 的写入值。

接着对返回的 instance 调用 getSomeField() 方法时，我们也能得到线Ⅰ的语句(1) -> 线程Ⅱ的语句(7)（由于线程 2 有进入 synchronized 块，根据规则2可得），
这表明这时 getSomeField 能够得到正确的值。

## 解决方案

- 静态内部类

最简单而且安全的解决方法是使用 static 内部类的思想.

它利用的思想是：一个类直到被使用时才被初始化，而类初始化的过程是非并行的，这些都有 JLS 保证。

```java
public class Singleton {
 
  private Singleton() {}
 
  // Lazy initialization holder class idiom for static fields
  private static class InstanceHolder {
    private static final Singleton instance = new Singleton();
  }
 
  public static Singleton getSingleton() { 
    return InstanceHolder.instance; 
  }
}
```

- instance 声明为 volatile

```java
private volatile static LazySingleton instance; 
```

线程 1 的语句(5) -> 语线程 2 的句(2)，

根据单线程规则，线程 1 的语句(1) -> 线程 1 的语句(5)，语线程 2 的语句(2) -> 语线程 2 的语句(7)；

再根据传递规则就有线程 1 的语句(1) -> 语线程 2 的句(7)。

# 参考资料

- JSR 133

[JSR-133: JavaTM Memory Model and Thread Specification](http://www.cs.umd.edu/~pugh/java/memoryModel/CommunityReview.pdf)

http://www.cs.umd.edu/users/pugh/java/memoryModel/jsr-133-faq.html

- other

https://juejin.im/post/5ae6d309518825673123fd0e

https://segmentfault.com/a/1190000011458941

https://blog.csdn.net/ns_code/article/details/17348313

http://ifeve.com/easy-happens-before/

* any list
{:toc}