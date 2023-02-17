---
layout: post
title:  Java Concurrency-09-synchronized
date:  2018-07-25 15:34:17 +0800
categories: [Java]
tags: [thread, concurrency, thread, lock]
published: true
---

# synchronized

## 问题

synchronized锁住的是代码还是对象。

答案是：

synchronized 锁住的是括号里的对象，而不是代码。

对于非 static 的 synchronized 方法，锁的就是对象本身也就是 this。

## 验证

### 案例 1

- SyncDemo.java

```java
public class SyncDemo {

    public synchronized void test() {
        System.out.println("test开始..");
        try {
            Thread.sleep(1000);
        } catch (InterruptedException e) {
            e.printStackTrace();
        }
        System.out.println("test结束..");
    }

    static class MyThread extends Thread {

        @Override
        public void run() {
            SyncDemo sync = new SyncDemo();
            sync.test();
        }
    }


    public static void main(String[] args) {
        for (int i = 0; i < 3; i++) {
            Thread thread = new MyThread();
            thread.start();
        }
    }
}
```

- 日志

```
test开始..
test开始..
test开始..
test结束..
test结束..
test结束..
```

此时的 SyncDemo 对象每次都是新建的，所以锁是无法生效的。

- 同理，修改成如下的样子依然不生效。

因为二者是等价的。

```java
public  void test() {
    synchronized(this) {
        System.out.println("test开始..");
        try {
            Thread.sleep(1000);
        } catch (InterruptedException e) {
            e.printStackTrace();
        }
        System.out.println("test结束..");
    }
}
```

### 案例 2

将代码进行如下调整，即可达到我们的目的。保证只有一个 `SyncDemo` 实例。

- SyncDemo3.java

```java
public class SyncDemo3 {

    public synchronized void test() {
        System.out.println("test开始..");
        try {
            Thread.sleep(1000);
        } catch (InterruptedException e) {
            e.printStackTrace();
        }
        System.out.println("test结束..");
    }

    static class MyThread extends Thread {

        private SyncDemo3 sync;

        public MyThread(SyncDemo3 sync) {
            this.sync = sync;
        }

        @Override
        public void run() {
            sync.test();
        }
    }

    public static void main(String[] args) {
        SyncDemo3 syncDemo3 = new SyncDemo3();

        for (int i = 0; i < 3; i++) {
            Thread thread = new MyThread(syncDemo3);
            thread.start();
        }
    }

}
```

- 日志

```
test开始..
test结束..
test开始..
test结束..
test开始..
test结束..
```

### 案例 3

如果想让每次创建的对象，也可以按照锁去执行，怎么做？

- SyncDemo4.java

```java
public class SyncDemo4 {

    public  void test() {
        synchronized(SyncDemo4.class) {
            System.out.println("test开始..");
            try {
                Thread.sleep(1000);
            } catch (InterruptedException e) {
                e.printStackTrace();
            }
            System.out.println("test结束..");
        }
    }

    static class MyThread extends Thread {

        @Override
        public void run() {
            SyncDemo4 sync = new SyncDemo4();
            sync.test();
        }

    }

    public static void main(String[] args) {
        for (int i = 0; i < 3; i++) {
            Thread thread = new MyThread();
            thread.start();
        }
    }
}
```

- 日志

```java
test开始..
test结束..
test开始..
test结束..
test开始..
test结束..
```

## static synchronized

上面代码用 `synchronized(Sync.class)` 实现了全局锁的效果。

最后说说 static synchronized 方法，static 方法可以直接类名加方法名调用，方法中无法使用 this，所以它锁的不是 this，而是类的 Class 对象，

所以，static synchronized 方法也相当于全局锁，相当于锁住了代码段。

# 原理

synchronized 用的锁是存在 Java 对象头里的。

JVM基于进入和退出 `Monitor` 对象来实现方法同步和代码块同步。

代码块同步是使用 `monitorenter` 和 `monitorexit 指令实现的，monitorenter指令是在编译后插入到同步代码块的开始位置，而monitorexit是插入到方法结束处和异常处。

任何对象都有一个 monitor 与之关联，当且一个monitor被持有后，它将处于锁定状态。

根据虚拟机规范的要求，在执行 monitorenter 指令时，首先要去尝试获取对象的锁，如果这个对象没被锁定，或者当前线程已经拥有了那个对象的锁，把锁的计数器加1；相应地，在执行monitorexit指令时会将锁计数器减1，当计数器被减到0时，锁就释放了。

如果获取对象锁失败了，那当前线程就要阻塞等待，直到对象锁被另一个线程释放为止。

注意两点：

1、synchronized同步快对同一条线程来说是可重入的，不会出现自己把自己锁死的问题；

2、同步块在已进入的线程执行完之前，会阻塞后面其他线程的进入。


## 反编译命令

- 编译

```sh
$   javac xxx.java
```

可以将 java 文件编译为 class 文件

- 反编译


```sh
$   javap -c xxx
```

可以将 class 文件 反编译

详细：

```sh
$ javap -help
用法: javap <options> <classes>
其中, 可能的选项包括:
  -help  --help  -?        输出此用法消息
  -version                 版本信息
  -v  -verbose             输出附加信息
  -l                       输出行号和本地变量表
  -public                  仅显示公共类和成员
  -protected               显示受保护的/公共类和成员
  -package                 显示程序包/受保护的/公共类
                           和成员 (默认)
  -p  -private             显示所有类和成员
  -c                       对代码进行反汇编
  -s                       输出内部类型签名
  -sysinfo                 显示正在处理的类的
                           系统信息 (路径, 大小, 日期, MD5 散列)
  -constants               显示最终常量
  -classpath <path>        指定查找用户类文件的位置
  -cp <path>               指定查找用户类文件的位置
  -bootclasspath <path>    覆盖引导类文件的位置
```


## 同步代码块

- Synchronized.java

```java
public class Synchronized {

    public void method() {
        synchronized (this) {
            System.out.println("Method one start");
        }
    }

}
```

- class 反编译

```sh
houbinbindeMacBook-Pro:sync houbinbin$ javap -c Synchronized
警告: 二进制文件Synchronized包含com.github.houbb.java.concurrency.sync.Synchronized
Compiled from "Synchronized.java"
public class com.github.houbb.java.concurrency.sync.Synchronized {
  public com.github.houbb.java.concurrency.sync.Synchronized();
    Code:
       0: aload_0
       1: invokespecial #1                  // Method java/lang/Object."<init>":()V
       4: return

  public void method();
    Code:
       0: aload_0
       1: dup
       2: astore_1
       3: monitorenter
       4: getstatic     #2                  // Field java/lang/System.out:Ljava/io/PrintStream;
       7: ldc           #3                  // String Method one start
       9: invokevirtual #4                  // Method java/io/PrintStream.println:(Ljava/lang/String;)V
      12: aload_1
      13: monitorexit
      14: goto          22
      17: astore_2
      18: aload_1
      19: monitorexit
      20: aload_2
      21: athrow
      22: return
    Exception table:
       from    to  target type
           4    14    17   any
          17    20    17   any
}
```

- monitorenter

根据 JVM 规范，

每个对象有一个监视器锁（monitor）。当monitor被占用时就会处于锁定状态，线程执行monitorenter指令时尝试获取monitor的所有权，过程如下：

1、如果monitor的进入数为0，则该线程进入monitor，然后将进入数设置为1，该线程即为monitor的所有者。

2、如果线程已经占有该monitor，只是重新进入，则进入monitor的进入数加1.

3、如果其他线程已经占用了monitor，则该线程进入阻塞状态，直到monitor的进入数为0，再重新尝试获取monitor的所有权。

- monitorexit

根据 JVM 规范，

执行monitorexit的线程必须是objectref所对应的monitor的所有者。

指令执行时，monitor的进入数减1，如果减1后进入数为0，那线程退出monitor，不再是这个monitor的所有者。其他被这个monitor阻塞的线程可以尝试去获取这个 monitor 的所有权。 
通过这两段描述，我们应该能很清楚的看出Synchronized的实现原理，Synchronized 的语义底层是通过一个monitor的对象来完成，
其实 `wait/notify` 等方法也依赖于monitor对象，
这就是为什么只有在同步的块或者方法中才能调用 `wait/notify` 等方法，否则会抛出 `java.lang.IllegalMonitorStateException` 的异常的原因。

## 同步方法

- SynchronizedMethod.java

```java
public class SynchronizedMethod {

    public synchronized void method() {
        System.out.println("Synchronized Method");
    }

}
```

- 反编译内容

```sh
$ javap -c -v SynchronizedMethod
...//省略其他信息
{
  public com.github.houbb.java.concurrency.sync.SynchronizedMethod();
    descriptor: ()V
    flags: ACC_PUBLIC
    Code:
      stack=1, locals=1, args_size=1
         0: aload_0
         1: invokespecial #1                  // Method java/lang/Object."<init>":()V
         4: return
      LineNumberTable:
        line 11: 0

  public synchronized void method();
    descriptor: ()V
    flags: ACC_PUBLIC, ACC_SYNCHRONIZED
    Code:
      stack=2, locals=1, args_size=1
         0: getstatic     #2                  // Field java/lang/System.out:Ljava/io/PrintStream;
         3: ldc           #3                  // String Synchronized Method
         5: invokevirtual #4                  // Method java/io/PrintStream.println:(Ljava/lang/String;)V
         8: return
      LineNumberTable:
        line 14: 0
        line 15: 8
}
SourceFile: "SynchronizedMethod.java"
```

- 说明 

从反编译的结果来看，方法的同步并没有通过指令monitorenter和monitorexit来完成（理论上其实也可以通过这两条指令来实现），
不过相对于普通方法，其常量池中多了 `ACC_SYNCHRONIZED` 标示符。

JVM就是根据该标示符来实现方法的同步的：当方法调用时，调用指令将会检查方法的 `ACC_SYNCHRONIZED` 访问标志是否被设置，如果设置了，执行线程将先获取 monitor，获取成功之后才能执行方法体，方法执行完后再释放monitor。

在方法执行期间，其他任何线程都无法再获得同一个monitor对象。 

其实本质上没有区别，只是方法的同步是一种隐式的方式来实现，无需通过字节码来完成。

## java 对象头

Hotspot 虚拟机的对象头主要包括两部分数据：Mark Word（标记字段）、Klass Pointer（类型指针）。

其中 Klass Point 是是对象指向它的类元数据的指针，虚拟机通过这个指针来确定这个对象是哪个类的实例，Mark Word用于存储对象自身的运行时数据，它是实现轻量级锁和偏向锁的关键，所以下面将重点阐述 Mark Word。

### Mark Word

Mark Word 用于存储对象自身的运行时数据，如哈希码（HashCode）、GC分代年龄、锁状态标志、线程持有的锁、偏向线程 ID、偏向时间戳等等。

Java 对象头一般占有两个机器码（在32位虚拟机中，1个机器码等于4字节，也就是32bit），但是如果对象是数组类型，则需要三个机器码，因为JVM虚拟机可以通过Java对象的元数据信息确定Java对象的大小，但是无法从数组的元数据来确认数组的大小，所以用一块来记录数组长度。

| 25Bit | 4Bit | 1Bit | 2Bit |
| 对象的 hashcode | 对象的分代年龄 | 是否为偏向锁 | 锁标志位 |

对象头信息是与对象自身定义的数据无关的额外存储成本，但是考虑到虚拟机的空间效率，Mark Word 被设计成一个非固定的数据结构以便在极小的空间内存存储尽量多的数据，
它会根据对象的状态复用自己的存储空间，也就是说，Mark Word会随着程序的运行发生变化，变化状态如下（32位虚拟机）： 

<table>
    <tr>
        <td rowspan="2" valign="middle">锁状态</td>
        <td colspan="2">25 bit</td>
        <td rowspan="2" valign="middle">4 bit</td>
        <td>1 bit</td>
        <td>2 bit</td>
    </tr>
    <tr>
        <td>23 bit</td>
        <td>2 bit</td>
        <td>是否是偏向锁</td>
        <td>锁标志位</td>
    </tr>
    <tr>
        <td>无锁状态</td>
        <td colspan="4">无锁状态</td>
        <td>01</td>
    </tr>
    <tr>
        <td>轻量级锁</td>
        <td colspan="4">指向锁记录的指针</td>
        <td>00</td>
    </tr>
    <tr>
        <td>重量级锁</td>
        <td colspan="4">指向重量级锁指针</td>
        <td>10</td>
    </tr>
    <tr>
        <td>GC 标记</td>
        <td colspan="4">空，无需记录信息</td>
        <td>11</td>
    </tr>
    <tr>
        <td>偏向锁</td>
        <td>线程 ID</td>
        <td>Epoch</td>
        <td>对象分代年龄</td>
        <td>1</td>
        <td>01</td>
    </tr>
</table>

## Monitor

什么是 Monitor？

我们可以把它理解为一个同步工具，也可以描述为一种同步机制，它通常被描述为一个对象。 

与一切皆对象一样，所有的Java对象是天生的 Monitor，每一个Java对象都有成为Monitor的潜质，
因为在Java的设计中 ，每一个Java对象自打娘胎里出来就带了一把看不见的锁，它叫做内部锁或者 Monitor 锁。 

Monitor 是线程私有的数据结构，每一个线程都有一个可用monitor record列表，同时还有一个全局的可用列表。

每一个被锁住的对象都会和一个monitor关联（对象头的MarkWord中的LockWord指向monitor的起始地址），
同时monitor中有一个Owner字段存放拥有该锁的线程的唯一标识，表示该锁被这个线程占用。其结构如下： 

### 数据结构

- 结构

| Owner |
| EntryQ |
| RcThis |
| Nest |
| HashCode |
| Candidate |

- 字段说明

Owner: 初始时为NULL表示当前没有任何线程拥有该monitor record，当线程成功拥有该锁后保存线程唯一标识，当锁被释放时又设置为NULL； 

EntryQ: 关联一个系统互斥锁（semaphore），阻塞所有试图锁住monitor record失败的线程。 

RcThis: 表示blocked或waiting在该monitor record上的所有线程的个数。 

Nest: 用来实现重入锁的计数。 

HashCode: 保存从对象头拷贝过来的HashCode值（可能还包含GC age）。 

Candidate: 用来避免不必要的阻塞或等待线程唤醒，因为每一次只有一个线程能够成功拥有锁，如果每次前一个释放锁的线程唤醒所有正在阻塞或等待的线程，会引起不必要的上下文切换（从阻塞到就绪然后因为竞争锁失败又被阻塞）从而导致性能严重下降。Candidate只有两种可能的值0表示没有需要唤醒的线程1表示要唤醒一个继任线程来竞争锁。 

我们知道 synchronized 是重量级锁，效率不怎么滴，同时这个观念也一直存在我们脑海里，不过在jdk 1.6中对synchronize的实现进行了各种优化，
使得它显得不是那么重了，那么JVM采用了那些优化手段呢？

# 锁优化

jdk1.6 对锁的实现引入了大量的优化，如自旋锁、适应性自旋锁、锁消除、锁粗化、偏向锁、轻量级锁等技术来减少锁操作的开销。 

锁主要存在四中状态，依次是：无锁状态、偏向锁状态、轻量级锁状态、重量级锁状态，他们会随着竞争的激烈而逐渐升级。

注意锁**可以升级不可降级，这种策略是为了提高获得锁和释放锁的效率**。

(以下内容建议查阅理解)

## 自旋锁

线程的阻塞和唤醒需要CPU从用户态转为核心态，频繁的阻塞和唤醒对CPU来说是一件负担很重的工作，势必会给系统的并发性能带来很大的压力。

同时我们发现在许多应用上面，对象锁的锁状态只会持续很短一段时间，为了这一段很短的时间频繁地阻塞和唤醒线程是非常不值得的。所以引入自旋锁。 

- 何谓自旋锁？ 

所谓自旋锁，就是让该线程等待一段时间，不会被立即挂起，看持有锁的线程是否会很快释放锁。

怎么等待呢？执行一段无意义的循环即可（自旋）。 

自旋等待不能替代阻塞，先不说对处理器数量的要求（多核，貌似现在没有单核的处理器了），虽然它可以避免线程切换带来的开销，但是它占用了处理器的时间。

如果持有锁的线程很快就释放了锁，那么自旋的效率就非常好，反之，自旋的线程就会白白消耗掉处理的资源，它不会做任何有意义的工作，典型的占着茅坑不拉屎，这样反而会带来性能上的浪费。所以说，自旋等待的时间（自旋的次数）必须要有一个限度，如果自旋超过了定义的时间仍然没有获取到锁，则应该被挂起。 

自旋锁在JDK 1.4.2中引入，默认关闭，但是可以使用 `-XX:+UseSpinning` 开开启，在JDK1.6中默认开启。

同时自旋的默认次数为10次，可以通过参数 `-XX:PreBlockSpin` 来调整； 

如果通过参数 `-XX:preBlockSpin` 来调整自旋锁的自旋次数，会带来诸多不便。

假如我将参数调整为10，但是系统很多线程都是等你刚刚退出的时候就释放了锁（假如你多自旋一两次就可以获取锁），你是不是很尴尬。

于是JDK1.6引入自适应的自旋锁，让虚拟机会变得越来越聪明。

## 适应自旋锁

JDK 1.6引入了更加聪明的自旋锁，即自适应自旋锁。

所谓自适应就意味着自旋的次数不再是固定的，它是由前一次在同一个锁上的自旋时间及锁的拥有者的状态来决定。

它怎么做呢？线程如果自旋成功了，那么下次自旋的次数会更加多，因为虚拟机认为既然上次成功了，那么此次自旋也很有可能会再次成功，那么它就会允许自旋等待持续的次数更多。

反之，如果对于某个锁，很少有自旋能够成功的，那么在以后要或者这个锁的时候自旋的次数会减少甚至省略掉自旋过程，以免浪费处理器资源。 

有了自适应自旋锁，随着程序运行和性能监控信息的不断完善，虚拟机对程序锁的状况预测会越来越准确，虚拟机会变得越来越聪明。

## 锁消除

为了保证数据的完整性，我们在进行操作时需要对这部分操作进行同步控制，但是在有些情况下，JVM检测到不可能存在共享数据竞争，这是JVM会对这些同步锁进行锁消除。
锁消除的依据是逃逸分析的数据支持。 

如果不存在竞争，为什么还需要加锁呢？所以锁消除可以节省毫无意义的请求锁的时间。

变量是否逃逸，对于虚拟机来说需要使用数据流分析来确定，但是对于我们程序员来说这还不清楚么？

我们会在明明知道不存在数据竞争的代码块前加上同步吗？但是有时候程序并不是我们所想的那样？

我们虽然没有显示使用锁，但是我们在使用一些JDK的内置API时，如StringBuffer、Vector、HashTable等，这个时候会存在隐形的加锁操作。

比如 StringBuffer 的 append() 方法，Vector 的 add() 方法：

```java
public void vectorTest(){
    Vector<String> vector = new Vector<String>();
    for(int i = 0 ; i < 10 ; i++){
        vector.add(i + "");
    }
    System.out.println(vector);
}
```

在运行这段代码时，JVM可以明显检测到变量 vector 没有逃逸出方法 vectorTest() 之外，所以JVM可以大胆地将vector内部的加锁操作消除。

## 锁粗化

我们知道在使用同步锁的时候，需要让同步块的作用**范围尽可能小**—仅在共享数据的实际作用域中才进行同步，这样做的目的是为了使需要同步的操作数量尽可能缩小，如果存在锁竞争，那么等待锁的线程也能尽快拿到锁。 

在大多数的情况下，上述观点是正确的，LZ也一直坚持着这个观点。

但是如果一系列的连续加锁解锁操作，可能会导致不必要的性能损耗，所以引入锁粗话的概念。 

锁粗话概念比较好理解，就是将多个连续的加锁、解锁操作连接在一起，扩展成一个范围更大的锁。

如上面实例：vector每次add的时候都需要加锁操作，JVM检测到对同一个对象（vector）连续加锁、解锁操作，会合并一个更大范围的加锁、解锁操作，即加锁解锁操作会移到for循环之外。


## 轻量级锁

引入轻量级锁的主要目的是在多没有多线程竞争的前提下，减少传统的重量级锁使用操作系统互斥量产生的性能消耗。

当关闭偏向锁功能或者多个线程竞争偏向锁导致偏向锁升级为轻量级锁，则会尝试获取轻量级锁，其步骤如下： 

### 获取锁 

1. 判断当前对象是否处于无锁状态（hashcode、0、01），若是，则JVM首先将在当前线程的栈帧中建立一个名为锁记录（Lock Record）的空间，用于存储锁对象目前的Mark Word的拷贝（官方把这份拷贝加了一个Displaced前缀，即Displaced Mark Word）；否则执行步骤（3）； 

2. JVM利用CAS操作尝试将对象的Mark Word更新为指向Lock Record的指正，如果成功表示竞争到锁，则将锁标志位变成00（表示此对象处于轻量级锁状态），执行同步操作；如果失败则执行步骤（3）； 

3. 判断当前对象的Mark Word是否指向当前线程的栈帧，如果是则表示当前线程已经持有当前对象的锁，则直接执行同步代码块；否则只能说明该锁对象已经被其他线程抢占了，这时轻量级锁需要膨胀为重量级锁，锁标志位变成10，后面等待的线程将会进入阻塞状态；

### 释放锁 

轻量级锁的释放也是通过CAS操作来进行的，主要步骤如下： 

1. 取出在获取轻量级锁保存在Displaced Mark Word中的数据； 

2. 用CAS操作将取出的数据替换当前对象的Mark Word中，如果成功，则说明释放锁成功，否则执行（3）； 

3. 如果CAS操作替换失败，说明有其他线程尝试获取该锁，则需要在释放锁的同时需要唤醒被挂起的线程。

对于轻量级锁，其性能提升的依据是`对于绝大部分的锁，在整个生命周期内都是不会存在竞争的`，
如果打破这个依据则除了互斥的开销外，还有额外的CAS操作，因此在有多线程竞争的情况下，轻量级锁比重量级锁更慢；


ps: 也就是资源竞争不激烈的时候，比较适合使用。

## 偏向锁

引入偏向锁主要目的是：为了在无多线程竞争的情况下尽量减少不必要的轻量级锁执行路径。

上面提到了轻量级锁的加锁解锁操作是需要依赖多次CAS原子指令的。

那么偏向锁是如何来减少不必要的CAS操作呢？



### 获取锁 

我们可以查看Mark work的结构就明白了。只需要检查是否为偏向锁、锁标识为以及ThreadID即可，

处理流程如下： 

1. 检测Mark Word是否为可偏向状态，即是否为偏向锁1，锁标识位为01； 

2. 若为可偏向状态，则测试线程ID是否为当前线程ID，如果是，则执行步骤（5），否则执行步骤（3）； 

3. 如果线程ID不为当前线程ID，则通过CAS操作竞争锁，竞争成功，则将Mark Word的线程ID替换为当前线程ID，否则执行线程（4）； 

4. 通过CAS竞争锁失败，证明当前存在多线程竞争情况，当到达全局安全点，获得偏向锁的线程被挂起，偏向锁升级为轻量级锁，然后被阻塞在安全点的线程继续往下执行同步代码块； 

5. 执行同步代码块



### 释放锁 

偏向锁的释放采用了一种只有竞争才会释放锁的机制，线程是不会主动去释放偏向锁，需要等待其他线程来竞争。
偏向锁的撤销需要等待全局安全点（这个时间点是上没有正在执行的代码）。

其步骤如下： 

1. 暂停拥有偏向锁的线程，判断锁对象是否还处于被锁定状态；

2. 撤销偏向锁，恢复到无锁状态（01）或者轻量级锁的状态；

## 重量级锁

重量级锁通过对象内部的监视器（monitor）实现，其中monitor的本质是依赖于底层操作系统的Mutex Lock实现，
操作系统实现线程之间的切换需要从用户态到内核态的切换，切换成本非常高。

# Mutex Lock

监视器锁（Monitor）本质是依赖于底层的操作系统的Mutex Lock（互斥锁）来实现的。

每个对象都对应于一个可称为" 互斥锁" 的标记，这个标记用来保证在任一时刻，只能有一个线程访问该对象。

- 互斥锁

用于保护临界区，确保同一时间只有一个线程访问数据。

对共享资源的访问，先对互斥量进行加锁，如果互斥量已经上锁，调用线程会阻塞，直到互斥量被解锁。

在完成了对共享资源的访问后，要对互斥量进行解锁。

## mutex的工作方式：

1) 申请mutex

2) 如果成功，则持有该mutex

3) 如果失败，则进行spin自旋. spin的过程就是在线等待mutex, 不断发起mutex gets, 直到获得mutex或者达到spin_count限制为止

4) 依据工作模式的不同选择yiled还是sleep

5) 若达到sleep限制或者被主动唤醒或者完成yield, 则重复1)~4)步，直到获得为止

# 内置锁

java 的每一个对象都有一个内置锁。

synchronized 提供的是一种互斥锁。互斥锁，即能到达到互斥访问目的的锁。

举个简单的例子，如果对临界资源加上互斥锁，当一个线程在访问该临界资源时，其他线程便只能等待。

在 Java 中，可以使用 synchronized 关键字来标记一个方法或者代码块，当某个线程调用该对象的synchronized方法或者访问synchronized代码块时，这个线程便获得了该对象的锁，其他线程暂时无法访问这个方法，只有等待这个方法执行完毕或者代码块执行完毕，这个线程才会释放该对象的锁，其他线程才能执行这个方法或者代码块。

# 可重入性

## 概念

若一个程序或子程序可以“在任意时刻被中断然后操作系统调度执行另外一段代码，这段代码又调用了该子程序不会出错”，则称其为可重入（reentrant或re-entrant）的。

即当该子程序正在运行时，执行线程可以再次进入并执行它，仍然获得符合设计时预期的结果。

与多线程并发执行的线程安全不同，可重入强调对单个线程执行时重新进入同一个子程序仍然是安全的。

## 可重入的条件

1. 不在函数内使用静态或全局数据。

2. 不返回静态或全局数据，所有数据都由函数的调用者提供。

3. 使用本地数据（工作内存），或者通过制作全局数据的本地拷贝来保护全局数据。

4. 不调用不可重入函数。

## 可重入与线程安全

一般而言，可重入的函数一定是线程安全的，反之则不一定成立。

在不加锁的前提下，如果一个函数用到了全局或静态变量，那么它不是线程安全的，也不是可重入的。

如果我们加以改进，对全局变量的访问加锁，此时它是线程安全的但不是可重入的，因为通常的枷锁方式是针对不同线程的访问（如Java的synchronized），当同一个线程多次访问就会出现问题。

只有当函数满足可重入的所有条件时，才是可重入的。

## synchronized 的可重入性

- synchronized 是可重入锁

如果一个获取锁的线程调用其它的synchronized修饰的方法，会发生什么？

从设计上讲，当一个线程请求一个由其他线程持有的对象锁时，该线程会阻塞。

当线程请求自己持有的对象锁时，如果该线程是重入锁，请求就会成功，否则阻塞。

我们回来看synchronized，synchronized拥有强制原子性的内部锁机制，是一个可重入锁。

因此，在一个线程使用synchronized方法时调用该对象另一个synchronized方法，即一个线程得到一个对象锁后再次请求该对象锁，是永远可以拿到锁的。

在Java内部，同一个线程调用自己类中其他synchronized方法/块时不会阻碍该线程的执行，同一个线程对同一个对象锁是可重入的，同一个线程可以获取同一把锁多次，也就是可以多次重入。

原因是Java中线程获得对象锁的操作是以线程为单位的，而不是以调用为单位的。

- synchronized 可重入锁的实现

之前谈到过，每个锁关联一个线程持有者和一个计数器。

当计数器为0时表示该锁没有被任何线程持有，那么任何线程都都可能获得该锁而调用相应方法。

当一个线程请求成功后，JVM会记下持有锁的线程，并将计数器计为1。此时其他线程请求该锁，则必须等待。

而该持有锁的线程如果再次请求这个锁，就可以再次拿到这个锁，同时计数器会递增。

当线程退出一个synchronized方法/块时，计数器会递减，如果计数器为0则释放该锁。

## 为什么要可重入

```java
class Father {
	public synchronized void doSomething() {
		System.out.println("father.doSomething()");
	}
}

public class Child extends Father {
	public static void main(String[] args) {
		Child child = new Child();
		child.doSomething();
	}

	public synchronized void doSomething() {
		System.out.println("child.doSomething()");
		doAnotherThing(); // 调用自己类中其他的synchronized方法
	}

	private synchronized void doAnotherThing() {
		super.doSomething(); // 调用父类的synchronized方法
		System.out.println("child.doAnotherThing()");
	}
}
```

运行结果：

```
child.doSomething()
father.doSomething()
child.doAnotherThing()
```

这里的对象锁只有一个,就是child对象的锁,当执行child.doSomething时，该线程获得child对象的锁，在doSomething方法内执行doAnotherThing时再次请求child对象的锁，因为synchronized是重入锁，所以可以得到该锁，继续在doAnotherThing里执行父类的doSomething方法时第三次请求child对象的锁，同理可得到，如果不是重入锁的话，那这后面这两次请求锁将会被一直阻塞，从而导致死锁。


## 可重入锁的意义

所以在java内部，同一线程在调用自己类中其他synchronized方法/块或调用父类的synchronized方法/块都不会阻碍该线程的执行，就是说同一线程对同一个对象锁是可重入的，而且同一个线程可以获取同一把锁多次，也就是可以多次重入。

因为java线程是基于“每线程（per-thread）”，而不是基于“每调用（per-invocation）”的（java中线程获得对象锁的操作是以每线程为粒度的，per-invocation互斥体获得对象锁的操作是以每调用作为粒度的）

# 总结

## synchronized 的功过

由于Java的线程是映射到操作系统的原生线程之上的，如果要阻塞或唤醒一条线程，都需要操作系统来帮忙完成，这就需要从用户态转换到核心态中，
因此状态转换需要耗费很多的处理器时间。所以synchronized是Java语言中的一个重量级操作。

在JDK1.6中，虚拟机进行了一些优化，譬如在通知操作系统阻塞线程之前加入一段自旋等待过程，避免频繁地切入到核心态中：

`synchronized` 与 `java.util.concurrent` 包中的 `ReentrantLock` 相比，由于JDK1.6中加入了针对锁的优化措施。

- synchronized 与 ReentrantLock 的性能基本持平

- ReentrantLock 提供了更加丰富的功能

- synchronized 使用起来更加方便

# 参考资料

https://zhuanlan.zhihu.com/p/29866981

https://www.cnblogs.com/paddix/p/5367116.html

https://blog.csdn.net/javazejian/article/details/72828483#synchronized%E5%BA%95%E5%B1%82%E8%AF%AD%E4%B9%89%E5%8E%9F%E7%90%86

https://blog.csdn.net/chenssy/article/details/54883355

https://blog.csdn.net/u012465296/article/details/53022317

https://github.com/waylau/java-virtual-machine-specification

- sync 的陷阱

[聊聊 synchronized 为什么无法锁住 Integer](http://gao-xianglong.iteye.com/blog/2396071)

- 可重入性

[Java多线程：synchronized的可重入性](https://www.cnblogs.com/cielosun/p/6684775.html)

[java synchronized内置锁的可重入性和分析总结](http://topmanopensource.iteye.com/blog/1736739)

[java内置锁synchronized的可重入性](https://my.oschina.net/leoson/blog/107642)

* any list
{:toc}