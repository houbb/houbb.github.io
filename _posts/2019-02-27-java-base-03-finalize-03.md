---
layout: post
title: java base-03-finalize 方法详解
date:  2019-2-27 09:48:47 +0800
categories: [Java]
tags: [static, java-base]
published: true
---

# JVM 的一些知识

在说明finalize()的用法之前要树立有关于java垃圾回收器几个观点:

- 对象可以不被垃圾回收

java的垃圾回收遵循一个特点, 就是能不回收就不会回收.只要程序的内存没有达到即将用完的地步, 对象占用的空间就不会被释放。

因为如果程序正常结束了,而且垃圾回收器没有释放申请的内存, 那么随着程序的正常退出, 申请的内存会自动交还给操作系统; 

而且垃圾回收本身就需要付出代价, 是有一定开销的, 如果不使用,就不会存在这一部分的开销。

- 垃圾回收只能回收内存

而且只能回收内存中由java创建对象方式(堆)创建的对象所占用的那一部分内存, 无法回收其他资源, 比如文件操作的句柄, 数据库的连接等等。

- 垃圾回收不是C++中的析构

两者不是对应关系, 因为第一点就指出了垃圾回收的发生是不确定的, 而C++中析构函数是由程序员控制(delete) 或者离开器作用域时自动调用发生, 是在确定的时间对对象进行销毁并释放其所占用的内存。

- 调用垃圾回收器(GC)不一定保证垃圾回收器的运行

# finalize的作用

finalize()是Object的protected方法，子类可以覆盖该方法以实现资源清理工作，GC在回收对象之前调用该方法。

finalize()与C++中的析构函数不是对应的。

C++中的析构函数调用的时机是确定的（对象离开作用域或delete掉），但Java中的finalize的调用具有不确定性。

finalize() 的功能: 一旦垃圾回收器准备释放对象所占的内存空间, 如果对象覆盖了finalize()并且函数体内不能是空的, 就会首先调用对象的finalize(),  然后在下一次垃圾回收动作发生的时候真正收回对象所占的空间。

finalize() 有一个特点就是: JVM始终只调用一次. 无论这个对象被垃圾回收器标记为什么状态, finalize()始终只调用一次. 但是程序员在代码中主动调用的不记录在这之内。

# finalize函数的调用机制

java虚拟机规范并没有硬性规定垃圾回收该不该搞，以及该如何搞。所以这里提到的调用机制不能保证适合所有jvm。

## 何时被调用？

finalize啥时候才会被调用捏？

一般来说，要等到JVM开始进行垃圾回收的时候，它才有可能被调用。

而JVM进行垃圾回收的时间点是非常不确定的，依赖于各种运行时的环境因素。

正是由于finalize函数调用时间点的不确定，导致了后面提到的某些缺点。

## 谁来调用？

常见的JVM会通过GC的垃圾回收线程来进行finalize函数的调用。

由于垃圾回收线程比较重要（人家好歹也是JVM的一个组成部分嘛），为了防止finalize函数抛出的异常影响到垃圾回收线程的运作，垃圾回收线程会在调用每一个finalize函数时进行try catch，如果捕获到异常，就直接丢弃，然后接着处理下一个失效对象的finalize函数。

# 使用场景

不建议用finalize方法完成“非内存资源”的清理工作

## 不建议使用的原因

### 一些问题

一些与finalize相关的方法，由于一些致命的缺陷，已经被废弃了，如System.runFinalizersOnExit()方法、Runtime.runFinalizersOnExit()方法

System.gc()与System.runFinalization()方法增加了finalize方法执行的机会，但不可盲目依赖它们

Java语言规范并不保证finalize方法会被及时地执行、而且根本不会保证它们会被执行

finalize方法可能会带来性能问题。因为JVM通常在单独的低优先级线程中完成finalize的执行

对象再生问题：finalize方法中，可将待回收对象赋值给GC Roots可达的对象引用，从而达到对象再生的目的

finalize方法至多由GC执行一次(用户当然可以手动调用对象的finalize方法，但并不影响GC对finalize的行为)

## 适合的场景

finalize()主要使用的方面:

根据垃圾回收器的第2点可知, java垃圾回收器只能回收创建在堆中的java对象, 而对于不是这种方式创建的对象则没有方法处理, 这就需要使用finalize()对这部分对象所占的资源进行释放. 使用到这一点的就是JNI本地对象, 通过JNI来调用本地方法创建的对象只能通过finalize()保证使用之后进行销毁,释放内存

充当保证使用之后释放资源的最后一道屏障, 比如使用数据库连接之后未断开,并且由于程序员的个人原因忘记了释放连接, 这时就只能依靠finalize()函数来释放资源.

《thinking in java》中所讲到的“终结条件”验证, 通过finalize()方法来试图找出程序的漏洞

尽管finalize()可以主动调用, 但是最好不要主动调用, 因为在代码中主动调用之后, 如果JVM再次调用, 由于之前的调用已经释放过资源了,所以二次释放资源就有可能出现导致出现空指针等异常, 而恰好这些异常是没有被捕获的, 那么就造成对象处于被破坏的状态, 导致该对象所占用的某一部分资源无法被回收而浪费.

## 尽量避免使用finalize():

finalize()不一定会被调用, 因为java的垃圾回收器的特性就决定了它不一定会被调用

就算finalize()函数被调用, 它被调用的时间充满了不确定性, 因为程序中其他线程的优先级远远高于执行 finalize() 函数线程的优先级。

也许等到finalize()被调用, 数据库的连接池或者文件句柄早就耗尽了。

如果一种未被捕获的异常在使用finalize方法时被抛出，这个异常不会被捕获，finalize方法的终结过程也会终止，造成对象出于破坏的状态。被破坏的对象又很可能导致部分资源无法被回收, 造成浪费。

finalize()和垃圾回收器的运行本身就要耗费资源, 也许会导致程序的暂时停止。

## 禁止使用的原因

### 1.调用时间不确定---有资源浪费的风险

前面已经介绍了调用机制。

同学们应该认清“finalize的调用时机是很不确定的”这样一个事实。

所以，假如你把某些稀缺资源放到finalize()中释放，可能会导致该稀缺资源等上很久很久很久以后才被释放。

这可是资源的浪费啊！另外，某些类对象所携带的资源（比如某些JDBC的类）可能本身就很耗费内存，这些资源的延迟释放会造成很大的性能问题。

### 2. 可能不被调用----有资源泄露的风险

很多同学以为finalize()总是会被调用，其实不然。

在某些情况下，finalize()压根儿不被调用。

比如在JVM退出的当口，内存中那些对象的finalize函数可能就不会被调用了。

估计有同学在打“runFinalizersOnExit”的主意，来确保所有的finalize在JVM退出前被调用。

很可惜也很遗憾，该方法从JDK 1.2开始，就已经被废弃了。即使该方法不被废弃，也是有很大的线程安全隐患滴！ 　　

从上述可以看出，一旦你依赖finalize()来帮你释放资源，那可是很不妙啊（有资源泄漏的危险）！

很多时候，资源泄露导致的性能问题更加严重，万万不可小看。

### 3. 对象可能在finalize函数调用时复活

本来，只有当某个对象已经失效（没有引用），垃圾回收器才会调用该对象的finalize函数。但是，万一碰上某个变态的程序员，在finalize()函数内部再把对象自身的引用（也就是this）重新保存在某处，也就相当于把自己复活了（因为这个对象重新有了引用，不再处于失效状态）。 为了防止发生这种诡异的事情，垃圾回收器只能在每次调用完finalize()之后再次去检查该对象是否还处于失效状态。这无形中又增加了JVM的开销。随便提一下。由于JDK的文档中规定了，JVM对于每一个类对象实例最多只会调用一次finalize()。所以，对于那些诈尸的实例，当它们真正死亡时，finalize()反而不会被调用了。这看起来是不是很奇怪？

### 4. 要记得自己做异常捕获

刚才在介绍finalize()调用机制时提到，一旦有异常抛出到finalize函数外面，会被垃圾回收线程捕获并丢弃。

也就是说，异常被忽略掉了（异常被忽略的危害，“这里”有提到）。

为了防止这种事儿，凡是finalize()中有可能抛出异常的代码，你都得写上try catch语句，自己进行捕获。

### 5. 小心线程安全

由于调用finalize()的是垃圾回收线程，和你自己代码的线程不是同一个线程；

甚至不同对象的finalize()可能会被不同的垃圾回收线程调用（比如使用“并行收集器”的时候）。

所以，当你在finalize()里面访问某些数据的时候，还得时刻留心线程安全的问题。

# finalize 的执行过程(生命周期)

## 大致流程

首先，大致描述一下finalize流程：当对象变成(GC Roots)不可达时，GC会判断该对象是否覆盖了finalize方法，若未覆盖，则直接将其回收。

否则，若对象未执行过finalize方法，将其放入F-Queue队列，由一低优先级线程执行该队列中对象的finalize方法。

执行finalize方法完毕后，GC会再次判断该对象是否可达，若不可达，则进行回收，否则，对象“复活”。

## 具体的finalize流程：

对象可由两种状态，涉及到两类状态空间。

一是终结状态空间 `F = {unfinalized, finalizable, finalized}`；

二是可达状态空间 `R = {reachable, finalizer-reachable, unreachable}`。

各状态含义如下：

unfinalized: 新建对象会先进入此状态，GC并未准备执行其finalize方法，因为该对象是可达的

finalizable: 表示GC可对该对象执行finalize方法，GC已检测到该对象不可达。

正如前面所述，GC通过F-Queue队列和一专用线程完成finalize的执行

finalized: 表示GC已经对该对象执行过finalize方法

reachable: 表示GC Roots引用可达

finalizer-reachable(f-reachable)：表示不是reachable，但可通过某个finalizable对象可达

unreachable：对象不可通过上面两种途径可达

- 状态变迁图

![状态变迁图](https://images0.cnblogs.com/blog/705813/201502/071653276729233.gif)

## 变迁说明

新建对象首先处于[reachable, unfinalized]状态(A)

随着程序的运行，一些引用关系会消失，导致状态变迁，从reachable状态变迁到f-reachable(B, C, D)或unreachable(E, F)状态

若JVM检测到处于unfinalized状态的对象变成f-reachable或unreachable，JVM会将其标记为finalizable状态(G,H)。若对象原处于[unreachable, unfinalized]状态，则同时将其标记为f-reachable(H)。

在某个时刻，JVM取出某个finalizable对象，将其标记为finalized并在某个线程中执行其finalize方法。由于是在活动线程中引用了该对象，该对象将变迁到(reachable, finalized)状态(K或J)。该动作将影响某些其他对象从f-reachable状态重新回到reachable状态(L, M, N)

处于finalizable状态的对象不能同时是unreahable的，由第4点可知，将对象finalizable对象标记为finalized时会由某个线程执行该对象的finalize方法，致使其变成reachable。这也是图中只有八个状态点的原因

程序员手动调用finalize方法并不会影响到上述内部标记的变化，因此JVM只会至多调用finalize一次，即使该对象“复活”也是如此。

程序员手动调用多少次不影响JVM的行为

若JVM检测到finalized状态的对象变成unreachable，回收其内存(I)

若对象并未覆盖finalize方法，JVM会进行优化，直接回收对象（O）

注：System.runFinalizersOnExit()等方法可以使对象即使处于reachable状态，JVM仍对其执行finalize方法

# 测试代码

## 对象复活

```java
public class GC {  
  
    public static GC SAVE_HOOK = null;  
  
    public static void main(String[] args) throws InterruptedException {  
        SAVE_HOOK = new GC();  
        SAVE_HOOK = null;  
        System.gc();  
        Thread.sleep(500);  
        if (null != SAVE_HOOK) { //此时对象应该处于(reachable, finalized)状态  
            System.out.println("Yes , I am still alive");  
        } else {  
            System.out.println("No , I am dead");  
        }  
        SAVE_HOOK = null;  
        System.gc();  
        Thread.sleep(500);  
        if (null != SAVE_HOOK) {  
            System.out.println("Yes , I am still alive");  
        } else {  
            System.out.println("No , I am dead");  
        }  
    }  
  
    @Override  
    protected void finalize() throws Throwable {  
        super.finalize();  
        System.out.println("execute method finalize()");  
        SAVE_HOOK = this;  
    }  
}  
```

## 测试案例2

```java
class C { 
    static A a; 
} 
   
class A { 
    B b; 
   
    public A(B b) { 
        this.b = b; 
    } 
   
    @Override 
    public void finalize() { 
        System.out.println("A finalize"); 
        C.a = this; 
    } 
} 
   
class B { 
    String name; 
    int age; 
   
    public B(String name, int age) { 
        this.name = name; 
        this.age = age; 
    } 
   
    @Override 
    public void finalize() { 
        System.out.println("B finalize"); 
    } 
   
    @Override 
    public String toString() { 
        return name + " is " + age; 
    } 
} 
   
public class Main { 
    public static void main(String[] args) throws Exception { 
        A a = new A(new B("allen", 20)); 
        a = null; 
   
        System.gc(); 
        Thread.sleep(5000); 
        System.out.println(C.a.b); 
    } 
} 
```

我的理解:为方便起见, 把a,b两个变量所指的内存空间就叫做a和b

```java
A a = new A(new B("allen" , 20)); //此时a和b都是reachable, unfinalized状态
a = null;
```

这之后, a和b的状态会在某一个时刻变成unreachable, unfinalized(但是b变成了unreachable还是f-reachable我不是很确定, 如果大家知道,欢迎补充^_^)
或者a和b直接变成f-reachable, unfianlized。

然后在某个时刻,GC检测到a和b处于unfinalized状态, 就将他们添加到F-queue,并将状态改为f-reachable finalizable.

之后分两种情况:
第一: GC从F-queue中首先取出a, 并被某个线程执行了finalize(), 也就相当于被某个活动的线程持有, a状态变成了reachable, finalized. 此时由于a被c对象所引用,所以之后不会变成unreachable finalized而被销毁(重生) 与此同时, b由于一直被a所引用, 所以b的状态变成了reachable, finalizable. 然后在某个时刻被从F-queue取出, 变成reachable, finalized状态

第二: GC从F-queue中首先取出b,并被某个线程执行了finalize(), 状态变成reachable finalized. 然后a也类似, 变成reachable finalized状态, 并被c引用, 重生

### 对象重生的代码2

```java
public class GC
{
    public static GC SAVE_HOOK = null;
 
    public static void main(String[] args) throws InterruptedException, Throwable
    {
        SAVE_HOOK = new GC();
        SAVE_HOOK = null;
        System.gc();
        Thread.sleep(500);
        if (null != SAVE_HOOK)   //此时对象应该处于(reachable, finalized)状态
        {
            System.out.println("Yes , I am still alive");
        }
        else
        {
            System.out.println("No , I am dead");
        }
        SAVE_HOOK = null;
        System.gc();
        Thread.sleep(500);
        if (null != SAVE_HOOK)
        {
            System.out.println("Yes , I am still alive");
        }
        else
        {
            System.out.println("No , I am dead");
        }
    }
 
    @Override
    protected void finalize() throws Throwable
    {
        super.finalize();
        System.out.println("execute method finalize()");
        SAVE_HOOK = this;
    }
}
```

# 拓展阅读

[GC](https://houbb.github.io/2018/10/08/jvm-27-gc-log)


# 个人收获

以前一直觉得 finalize() 类似于析构函数，甚至没有和 GC 联系起来。

自己读过《Thinking in Java》也没有什么印象，经典基础的知识是值得反复学习的。

# 参考资料

《Thinking in Java》

[when-is-the-finalize-method-called-in-java](https://stackoverflow.com/questions/2506488/when-is-the-finalize-method-called-in-java)

[java finalize方法总结、GC执行finalize的过程](https://www.cnblogs.com/Smina/p/7189427.html)

[Java禁止使用finalize方法](https://www.jb51.net/article/125728.htm)

* any list
{:toc}