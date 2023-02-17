---
layout: post
title: JCIP-04-可见性，发布与溢出，线程安全对象的构建
date:  2019-1-18 11:21:15 +0800
categories: [Concurrency]
tags: [thread, concurrency, sh]
published: true
excerpt: JCIP-04-可见性，发布与溢出，线程安全对象的构建
---

# 1 可见性

说到底并发还是离不开 JMM 的原理。可以看下我以前整理的 [JMM 主内存和工作内存](https://houbb.github.io/2018/07/26/jmm-02-data-struct#%E4%B8%BB%E5%86%85%E5%AD%98%E5%92%8C%E5%B7%A5%E4%BD%9C%E5%86%85%E5%AD%98) 以及后面的可见性，原子性，有序性。

## 1.1 内存模型

主内存：所有线程都可以访问

本地内存：每个线程私有的内存

- java 的所有变量都存储在主内存中

- 每个线程有自己独的工作内存，保存了该线程使用到的变量副本，是对主内存中变量的一份拷贝

- 每个线程不能访问其他线程的工作内存，线程间变量传递需要通过主内存来完成

- 每个线程不能直接操作主存，只能把主存的内容拷贝到本地内存后再做操作（这是线程不安全的本质），然后写回主存

ps: 为了提升性能，所以使用了缓存。代价就是会出现数据不一致的问题，也就是可见性。

## 1.2 基础概念

### 1.2.1 可见性

一个线程对共享变量做了修改之后，其他的线程立即能够看到（感知到）该变量这种修改（变化）。

Java内存模型是通过将在工作内存中的变量修改后的值同步到主内存，在读取变量前从主内存刷新最新值到工作内存中，这种依赖主内存的方式来实现可见性的。

无论是普通变量还是 volatile 变量都是如此。

下面是 Doug Lea 的 详细版本，可以跳过:

只有在下列情况时，一个线程对字段的修改才能确保对另一个线程可见：

一个写线程释放一个锁之后，另一个读线程随后获取了同一个锁。本质上，线程释放锁时会将强制刷新工作内存中的脏数据到主内存中，获取一个锁将强制线程装载（或重新装载）字段的值。锁提供对一个同步方法或块的互斥性执行，线程执行获取锁和释放锁时，所有对字段的访问的内存效果都是已定义的。

注意同步的双重含义：锁提供高级同步协议，同时在线程执行同步方法或块时，内存系统（有时通过内存屏障指令）保证值的一致性。这说明，与顺序程序设计相比较，并发程序设计与分布式程序设计更加类似。同步的第二个特性可以视为一种机制：一个线程在运行已同步方法时，它将发送和/或接收其他线程在同步方法中对变量所做的修改。从这一点来说，使用锁和发送消息仅仅是语法不同而已。

如果把一个字段声明为volatile型，线程对这个字段写入后，在执行后续的内存访问之前，线程必须刷新这个字段且让这个字段对其他线程可见（即该字段立即刷新）。每次对volatile字段的读访问，都要重新装载字段的值。

一个线程首次访问一个对象的字段，它将读到这个字段的初始值或被某个线程写入后的值。
此外，把还未构造完成的对象的引用暴露给某个线程，这是一个错误的做法 (see ?.1.2)。在构造函数内部开始一个新线程也是危险的，特别是这个类可能被子类化时。Thread.start有如下的内存效果：调用start方法的线程释放了锁，随后开始执行的新线程获取了这个锁。如果在子类构造函数执行之前，可运行的超类调用了new Thread(this).start()，当run方法执行时，对象很可能还没有完全初始化。同样，如果你创建且开始一个新线程T，这个线程使用了在执行start之后才创建的一个对象X。你不能确信X的字段值将能对线程T可见。除非你把所有用到X的引用的方法都同步。如果可行的话，你可以在开始T线程之前创建X。

线程终止时，所有写过的变量值都要刷新到主内存中。比如，一个线程使用Thread.join来终止另一个线程，那么第一个线程肯定能看到第二个线程对变量值得修改。

注意，在同一个线程的不同方法之间传递对象的引用，永远也不会出现内存可见性问题。
内存模型确保上述操作最终会发生，一个线程对一个特定字段的特定更新，最终将会对其他线程可见，但这个“最终”可能是很长一段时间。线程之间没有同步时，很难保证对字段的值能在多线程之间保持一致（指写线程对字段的写入立即能对读线程可见）。特别是，如果字段不是volatile或没有通过同步来访问这个字段，在一个循环中等待其他线程对这个字段的写入，这种情况总是错误的(see ?.2.6)。

在缺乏同步的情况下，模型还允许不一致的可见性。比如，得到一个对象的一个字段的最新值，同时得到这个对象的其他字段的过期的值。同样，可能读到一个引用变量的最新值，但读取到这个引用变量引用的对象的字段的过期值。
不管怎样，线程之间的可见性并不总是失效（指线程即使没有使用同步，仍然有可能读取到字段的最新值），内存模型仅仅是允许这种失效发生而已。因此，即使多个线程之间没有使用同步，也不保证一定会发生内存可见性问题（指线程读取到过期的值），java内存模型仅仅是允许内存可见性问题发生而已。在很多当前的JVM实现和java执行平台中，甚至是在那些使用多处理器的JVM和平台中，也很少出现内存可见性问题。共享同一个CPU的多个线程使用公共的缓存，缺少强大的编译器优化，以及存在强缓存一致性的硬件，这些都会使线程更新后的值能够立即在多线程之间传递。这使得测试基于内存可见性的错误是不切实际的，因为这样的错误极难发生。或者这种错误仅仅在某个你没有使用过的平台上发生，或仅在未来的某个平台上发生。这些类似的解释对于多线程之间的内存可见性问题来说非常普遍。没有同步的并发程序会出现很多问题，包括内存一致性问题。

### 1.2.2 原子性

原子是世界上的最小单位，具有不可分割性。

比如 a=0；（a非long和double类型） 这个操作是不可分割的，那么我们说这个操作时原子操作。

再比如：a++； 这个操作实际是a = a + 1；是可分割的，所以他不是一个原子操作。非原子操作都会存在线程安全问题，需要我们使用同步技术（sychronized）来让它变成一个原子操作。一个操作是原子操作，那么我们称它具有原子性。

java的concurrent包下提供了一些原子类，我们可以通过阅读API来了解这些原子类的用法。

比如：AtomicInteger、AtomicLong、AtomicReference等。

### 1.2.3 有序性

有序性即程序执行的顺序按照代码的先后顺序执行。 

在Java内存模型中，允许编译器和处理器对指令进行重排序，但是重排序过程不会影响到单线程程序的执行，却会影响到多线程并发执行的正确性。（例如：重排的时候某些赋值会被提前） 

在Java里面，可以通过volatile关键字来保证一定的“有序性”（具体原理在下一节讲述）。另外可以通过synchronized和Lock来保证有序性，很显然，synchronized和Lock保证每个时刻是有一个线程执行同步代码，相当于是让线程顺序执行同步代码，自然就保证了有序性

> 参见 [jmm-06-happens-before](https://houbb.github.io/2018/07/29/jmm-06-happens-before)

## 1.3 加锁与可见性

在 Java 内存模型中，`synchronized` 规定，线程在加锁时，先清空工作内存 → 在主内存中拷贝最新变量的副本到工作内存 → 执行完代码 → 将更改后的共享变量的值刷新到主内存中 → 释放互斥锁。

所以如果无法用 volatile 做可见性，则可以考虑用 synchronized 可以做可见性的保证

> 参见 [java-concurrency-09-synchronized](https://houbb.github.io/2018/07/25/java-concurrency-09-sync)
与 [jmm-07-lock](https://houbb.github.io/2018/07/29/jmm-07-lock)

## 1.4 volatile 与可见性

这种方式可以保证每次取数直接从主存取

它只能保证内存的可见性，无法保证原子性

它不需要加锁，比 synchronized 更轻量级，不会阻塞线程

不会被编译器优化

然而要求对这个变量做原子操作，否则还是会有问题

虽然 volatile 是轻量级，但是它也需要保证读写的顺序不乱序，所以可以有优化点，比如在单例实现方式中的双重校验中，使用 临时变量 降低 volatile 变量的访问。

> 具体参见 [volatile 详解](https://houbb.github.io/2018/07/27/jmm-05-volatile)

## 1.5 CAS 乐观锁 + 系统内置原子操作类
 
## AtomicXXX

jdk 提供了很多原子类型，这种类型的基本原理总结起来，volatile + unsafe 的 Compare and Swap，这种 Unsafe 操作并不推荐在自己的代码中使用，因为各 JDK 版本在这里变化较大，有可能升级 JDK 时造成各种问题。而且也要保证自己能够用好。

## LongAdder

JDK1.8 之后新增的一个类，性能比 AtomicLong 还要好。

> CAS 乐观锁参考 [java-concurrency-06-cas](https://houbb.github.io/2018/07/24/java-concurrency-06-cas)

# 2. 发布与溢出

## 2.1 基础概念

发布：将对象发布出去，使其他对象或者线程能访问到，比如存储到一个static的静态引用，或者使用其他方式使各线程能够访问到即可；

逸出：当对象未创建完成时发布对象，比如在构造函数中发布对象，即使是构造函数的最后一行发布，该对象仍旧处于未创建完成状态。

## 2.2 发布的方式

1. 将对象的引用存到共有的静态变量中

2. 对象被间接的发布：如，对象保存在集合类中，而这个集合类被发布出去，那么，所有可以遍历此集合的地方都嫩访问集合中的对象。

3. 从非私有方法返回一个对象引用

4. 非私有属性会被发布

5. 将对象当作参数传递给外部方法。外部方法包括，其他类中的方法或者类中可以被改写的方法（既不是 private 也不是 final 修饰的方法，因为此方法可能被重写），无法保证传递给外部方法的对象如何被使用，有“逸出”的风险

6. 发布一个内部类的实例。因为内部类实例中包含了对外部类实例的引用

## 2.3 溢出

### 2.3.1 内部可变状态逸出

```java
Class UnsafeStates{
     private String[] states = new String[]{
         "AK","AL"……
     };
     public String[] getStates(){ return states};
}
```

上述方式发布states，使得任何调用者都可以修改这个数组的内容，因为在get方法中返回了states的引用，数组states已经逸出了它所在的作用域，这个私有变量被发布了。

### 2.3.2 this 引用逸出

```java
public class ThisEscape{
    public ThisEscape(EventSource source){
        source.registerListener(
            new EventListener(){//在new这里，就新建了一个内部类的对象，持有ThisEscape类的引用
                public void onEvent(Event e){
                    doSomething(e);
                }
            }
    );
    }
}
```

上述代码在发布EventListener时，也隐含的发布了ThisEscape实例本身，因为EventListener是一个非静态内部类，一个非静态内部类在编译完成后会隐含的保存一个它外围类的引用“ThisEacape.this”，然而在上述代码中，构造函数还没有完成，也就是说，ThisEscape本身还没有构造好，但是其发布的对象就已经持有了一个ThisEscape的引用。

在构造过程中使this引用逸出的一个常见的错误是，在构造函数中启动一个线程。当对象在其构造函数中创建一个线程时，无论是显式创建还是隐式创建，this引用都会被新创建的线程共享，在对象没有完全构造之前，新的线程就可以看见它。

- 修正方式

如果想要避免不正确的构造过程，可以采用工厂方法来防止this引用在构造过程中逸出。

```java
public class SafeListener(){
    private final EventListener listener;
    private SafeListener(){
        listener = new EventListener(){
            public void onEvent(Event e){
                doSonmething(e);            
            }
        };
    }
    public static SafeListener newInstance(EventSource source){
        SafeListener safe = new SafeListener();
        source.registerListener(safe.listener);
        return safe;
    }
}
```

# 3. 线程安全对象构建的方式

## 3.1 无状态类

[不可变对象](https://houbb.github.io/2018/10/08/pattern-stateless)

## 3.2 不可变对象

[不可变对象](https://houbb.github.io/2018/10/08/pattern-immutable)

## 3.3 悲观锁

[synchronized](https://houbb.github.io/2018/07/25/java-concurrency-09-sync)

& [lock](https://houbb.github.io/2018/07/29/jmm-07-lock)

## 3.4 乐观锁

[CAS](https://houbb.github.io/2018/07/24/java-concurrency-06-cas)
& [volatile](https://houbb.github.io/2018/07/27/jmm-05-volatile)

## 3.5 ThreadLocal

[ThreadLocal](https://houbb.github.io/2018/10/08/java-threadlocal)

# 4 线程封闭

当访问共享的可变数据时，通常需要使用同步。一种避免使用同步的方式就是不共享数据。如果仅在单线程内访问数据，就不需要同步。这种技术被称为线程封闭（Thread Confinement），它是实现线程安全型的最简单方式之一。当某个对象封闭在一个线程中时，这种用法将自动实现线程安全性，即使被封闭的对象本身不是线程安全的。

线程封闭的一种常见的应用是 JDBC 的 Connection 对象。JDBC 规范并不要求 Connection 对象必须是线程安全的。在典型的服务器应用程序中，线程从连接池中获得一个 Connection 对象，并且用该对象来处理请求，使用完之后再将对象返还给连接池。由于大多数请求（例如 Servlet 请求或 EJB 调用等）都是由单个线程采用同步的方式来处理，并且在 Connection 对象返回之前，连接池都不会将它分配给其它线程，因此，这种连接管理模式在处理请求时隐含的将 Connection 对象封闭在线程中。

Java 语言及其核心库提供了一些机制来帮助维持线程封闭性，例如局部变量和 ThreadLocal 类，即便如此，程序员仍然需要确保封闭在线程中的对象不会从线程中逸出。

## Ad-hoc 线程封闭

Ad-hoc线程封闭是指，维护线程封闭性的职责完全由程序实现来承担。Ad-hoc线程封闭是非常脆弱的，因为没有任何一种语言特性，例如可见性修饰符或局部变量，能将对象封闭到目标线程上。事实上，对线程封闭对象（例如，GUI应用程序中的可视化组件或数据模型等）的引用通常保存在公有变量中。

当决定使用线程封闭技术时，通常是因为要将某个特定的子系统实现为一个单线程子系统。在某些情况下，单线程子系统提供的简便性要胜过Ad-hoc线程封闭技术的脆弱性。

在volatile变量上存在一种特殊的线程封闭。只要你能确保只有单个线程对共享的volatile变量执行写入操作，那么就可以安全地在这些共享的volatile变量上执行“读取-修改-写入”的操作。在这种情况下，相当于将修改操作封闭在单个线程中以防止发生竞态条件，并且volatile变量的可见性保证还确保了其他线程能看到最新的值。

由于Ad-hoc线程封闭技术的脆弱性，因此在程序中尽量少用它，在可能的情况下，应该使用更强的线程封闭技术（例如，栈封闭或ThreadLocal类）。

## 栈封闭

栈封闭是线程封闭的一种特例，在栈封闭中，只能通过局部变量才能访问对象。正如封装能使代码更容易维持不变性条件那样，同步变量也能使对象更易于封闭在线程中。

对于基本类型的局部变量，例如下面 loadTheArk 方法的 numPairs ，无论如何都不会破坏栈封闭性。由于任何方法都不发获得对基本类型的引用，因此 Java 语言的这种语义确保了基本类型的局部变量始终封闭在线程内。

```java
public int loadTheArk(Collection candidates) {
    SortedSet animals;
    int numPairs = 0;
    Animal candidate = null;
 
    // animals被封闭在方法中，不要使它们逸出！
    animals = new TreeSet(new SpeciesGenderComparator());
    animals.addAll(candidates);
    for (Animal a : animals) {
        if (candidate == null || !candidate.isPotentialMate(a))
            candidate = a;
        else {
            ark.load(new AnimalPair(candidate, a));
            ++numPairs;
            candidate = null;
        }
    }
    return numPairs;
}
```

在维持对象引用的栈封闭性时，程序员需要多做一些工作以确保被引用的对象不会逸出。在loadTheArk中实例化一个TreeSet对象，并将指向该对象的一个引用保存到animals中。此时,只有一个引用指向集合animals，这个引用被封闭在局部变量中，因此也被封闭在执行线程中。然而，如果发布了对集合animals（或者该对象中的任何内部数据）的引用，那么封闭性将被破坏，并导致对象animals的逸出。

如果在线程内部（Within-Thread）上下文中使用非线程安全的对象，那么该对象仍然是线程安全的。然而，要小心的是，只有编写代码的开发人员才知道哪些对象需要被封闭到执行线程中，以及被封闭的对象是否是线程安全的。如果没有明确地说明这些需求，那么后续的维护人员很容易错误地使对象逸出。

# 参考资料

- 可见性

[java 可见性简单总结](https://www.cnblogs.com/43726581Gavin/p/9066080.html)

http://ifeve.com/syn-jmm-visibility/

https://blog.csdn.net/wohaqiyi/article/details/67635010

https://blog.csdn.net/u011479200/article/details/64128532

- 发布与溢出

https://www.zhihu.com/question/23618683

https://hacpai.com/article/1459651285599

https://blog.csdn.net/u010963948/article/details/77672429

[【多线程与并发】：发布与逸出](https://blog.csdn.net/qq_37711672/article/details/79784809)

[Java并发编程实战（chapter_2）（对象发布、不变性、设计线程安全类）](http://www.cnblogs.com/1024Community/p/8685396.html)

* any list
{:toc}