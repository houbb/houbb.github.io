---
layout: post
title:  JCIP-39-Fork/Join 框架、工作窃取算法 
date:  2019-1-18 11:21:15 +0800
categories: [Concurrency]
tags: [thread, concurrency, sh]
published: true
---

# 工作窃取算法 

工作窃取（work-stealing）算法是指某个线程从其他队列里窃取任务来执行。

那么为什么需要使用工作窃取算法呢？

假如我们需要做一个比较大的任务，我们可以把这个任务分割为若干互不依赖的子任务，为了减少线程间的竞争，于是把这些子任务分别放到不同的队列里，并为每个队列创建一个单独的线程来执行队列里的任务，线程和队列一一对应，比如A线程负责处理A队列里的任务。

但是有的线程会先把自己队列里的任务干完，而其他线程对应的队列里还有任务等待处理。

干完活的线程与其等着，不如去帮其他线程干活，于是它就去其他线程的队列里窃取一个任务来执行。

而在这时它们会访问同一个队列，所以为了减少窃取任务线程和被窃取任务线程之间的竞争，通常会使用双端队列，被窃取任务线程永远从双端队列的头部拿任务执行，而窃取任务的线程永远从双端队列的尾部拿任务执行。

工作窃取算法的优点是充分利用线程进行并行计算，并减少了线程间的竞争，其缺点是在某些情况下还是存在竞争，比如双端队列里只有一个任务时。

并且消耗了更多的系统资源，比如创建多个线程和多个双端队列。

> [双端队列与工作密取](https://houbb.github.io/2019/01/18/jcip-14-deque-workstealing)

# Fork/Join框架

Fork/Join 框架是Java 7提供的一个用于并行执行任务的框架，是一个把大任务分割成若干个小任务，最终汇总每个小任务结果后得到大任务结果的框架。

在一个任务中，先检查要解决问题的大小，如果大于设定，那就将问题拆分成可以通过框架来执行的小任务，如果问题的大小比设定的大小要小就直接在任务里解决这个问题，然后根据需要返回结果

## 诞生的背景

多核处理器已广泛应用要提高应用程序在多核处理器上的执行效率，只能想办法提高应用程序的本身的并行能力。

常规的做法就是使用多线程，让更多的任务同时处理，或者让一部分操作异步执行，这种简单的多线程处理方式在处理器核心数比较少的情况下能够有效地利用处理资源，因为在处理器核心比较少的情况下，让不多的几个任务并行执行即可。

但是当处理器核心数发展很大的数目，上百上千的时候，这种按任务的并发处理方法也不能充分利用处理资源，因为一般的应用程序没有那么多的并发处理任务（服务器程序是个例外）。

所以，只能考虑把一个任务拆分为多个单元，每个单元分别得执行最后合并每个单元的结果，而fork/join框架就是为这而生的，java7中才认识到了这个问题。

处理并发(并行)程序，一向都是比较困难的，因为你必须处理线程同步和共享数据的问题。对于java平台在语言级别上对并发编程的支持就很强大，这已经在Groovy(GPars)， Scala和Clojure的社区的努力下得以证明。这些社区都尽量提供全面的编程模型和有效的实现来掩饰多线程和分布式应用带来的痛苦。Java语言本身在这方面不应该被认为是不行的。Java平台标准版（Java SE） 5 ，和Java SE 6引入了一组包提供强大的并发模块。Java SE 7中通过加入了对并行支持又进一步增强它们。

接下来的文章将以Java中一个简短的并发程序作为开始，以一个在早期版本中存在的底层机制开始。在展示由Java SE7中的fork/join框架提供的fork/join任务之前，将看到java.util.concurrent包提供的丰富的原语操作。然后就是使用新API的例子。最后，将对上面总结的方法进行讨论。

在下文中，我们假定读者具有Java SE5或Java SE6的背景，我们会一路呈现一些Java SE7带来的一些实用的语言演变。

## 核心思想

是一个分而治之的任务框架，如一个任务需要多线程执行，分割成很多块计算的时候，可以采用这种方法。

动态规范：和分而治之不同的是，每个小任务之间互相联系。

工作密取：分而治之分割了每个任务之后，某个线程提前完成了任务，就会去其他线程偷取任务来完成，加快执行效率。同时，第一个分配的线程是从队列中的头部拿任务，当完成任务的线程去其他队列拿任务的时候是从尾部拿任务，所以这样就避免了竞争。

## 完成的事情

Fork/Join框架要完成两件事情：

1.任务分割：首先Fork/Join框架需要把大的任务分割成足够小的子任务，如果子任务比较大的话还要对子任务进行继续分割

2.执行任务并合并结果：分割的子任务分别放到**双端队列**里，然后几个启动线程分别从双端队列里获取任务执行。子任务执行完的结果都放在另外一个队列里，启动一个线程从队列里取数据，然后合并这些数据。

## 限制

1、 任务只能使用 fork() 和 join() 操作当前同步机制，如果使用其它同步机制，工作者线程就不能执行其他任务，当然这些任务是在同步操作里时。

比如，如果在 Fork/Join 框架中将一个任务休眠，正在执行这个任务的工作者线程在休眠期内不能执行另外一个任务

2、 任务不能执行 I/O 操作，比如文件数据的读取与写入 

3、 任务不能抛出非运行时异常，必须在代码中处理掉这些异常

## 使用场景

- 适合场景

Fork/Join框架适合能够进行拆分再合并的计算密集型（CPU密集型）任务。

ForkJoin框架是一个并行框架，因此要求服务器拥有多CPU、多核，用以提高计算能力。

- 不适合场景

如果是单核、单CPU，不建议使用该框架，会带来额外的性能开销，反而比单线程的执行效率低。

当然不是因为并行的任务会进行频繁的线程切换，因为Fork/Join框架在进行线程池初始化的时候默认线程数量为Runtime.getRuntime().availableProcessors()，单CPU单核的情况下只会产生一个线程，并不会造成线程切换，而是会增加Fork/Join框架的一些队列、池化的开销。

比如：数据迁移到数据库，解析excel等等可以拆分完成的任务都可以使用到forkjoin。

# 多线程编写的演进之路

## 常规多线程

首先从历史上来看，java并发编程中通过java.lang.Thread类和java.lang.Runnable接口来编写多线程程序，然后确保代码对于共享的可变对象表现出的正确性和一致性，并且避免不正确的读／写操作，同时不会由于竞争条件上的锁争用而产生死锁。

这里是一个基本的线程操作的例子：

```java
Thread thread = new Thread() {
     @Override
     public void run() {
          System.out.println("I am running in a separate thread!");
     }
};
thread.start();
thread.join();
```

例子中的代码创建了一个线程，并且打印一个字符串到标准输出。

通过调用join()方法，主线程将等待创建的(子)线程执行完成。

对于简单的例子，直接操作线程这种方式是可以的，但对于并发编程，这样的代码很快变得容易出错，特别是好几个线程需要协作来完成一个更大的任务的时候。

这种情况下，它们的控制流需要被协调。

例如，一个线程的执行完成可能依赖于其他将要执行完成的线程。通常熟悉的例子就是生产者/消费者的例子，因为如果消费者队列是空的，那么生产者应该等待消费者，并且如果生产者队列是空的，那么消费者也应该等待生产者。该需求可能通过共享状态和条件队列来实现，但是你仍然必须通过使用共享对象上的java.lang.Object.nofity()和java.lang.Object.wait()来实现同步，这很容易出错。

最终，一个常见的错误就是在大段代码甚至整个方法上使用synchronize进行互斥。虽然这种方法能实现线程安全的代码，但是通常由于排斥时间太长而限制了并行性，从而造成性能低下。

在通常的计算过程中，操作低级原语来实现复杂的操作，这是对错误敞开大门。

因此，开发者应该寻求有效地封装复杂性为更高级的库。Java SE5提供了那样的能力。

## java.util.concurrent 包中丰富的原语

Java SE5引入了一个叫java.util.concurrent的包家族，在Java SE6中得到进一步增强。

### 特性

该包家族提供了下面这些并发编程的原语，集合以及特性：

Executors，增强了普通的线程，因为它们(线程)从线程池管理中被抽象出来。它们执行任务类似于传递线程(实际上，是实现了java.util.Runnable的实例被封装了)。好几种实现都提供了线程池和调度策略。而且，执行结果既可以同步也可以异步的方式来获取。

线程安全的队列允许在并发任务中传递数据。一组丰富的实现通过基本的数据结构(如数组链表，链接链表，或双端队列)和并发行为(如阻塞，支持优先级，或延迟)得以提供。

细粒度的超时延迟规范，因为大部分java.util.concurrent包中的类都支持超时延迟。比如一个任务如果没有在有限之间内完成，就会被executor中断。

丰富的同步模式超越了java提供的互斥同步块。这些同步模式包含了常见的俗语，如信号量或同步栅栏。

高效的并发数据集合(maps, lists和sets)通过写时复制和细粒度锁的使用，使得在多线程上下文中表现出卓越的性能。

原子变量屏蔽开发者访问它们时执行同步操作。这些变量包装了通用的基本类型，比如Integers或Booleans，和对象引用。

大量锁超越了内部锁提供的加锁/通知功能，比如，支持重入，读写锁，超时，或者基于轮询的加锁尝试。

### 例子

作为一个例子，让我们想想下面的程序：

注意：由于Java SE7引入了新的整数字面值，下划线可以在任何地方插入以提高可读性(比如，1_000_000)。

```java
import java.util.*;
import java.util.concurrent.*;
import static java.util.Arrays.asList;

public class Sums {

  static class Sum implements Callable<Long> {
     private final long from;
     private final long to;
     Sum(long from, long to) {
         this.from = from;
         this.to = to;
     }

     @Override
     public Long call() {
         long acc = 0;
         for (long i = from; i <= to; i++) {
             acc = acc + i;
         }
         return acc;
     }
  }

  public static void main(String[] args) throws Exception {
     ExecutorService executor = Executors.newFixedThreadPool(2);
     List<Future<Long>> results = executor.invokeAll(asList(
         new Sum(0, 10), new Sum(100, 1_000), new Sum(10_000, 1_000_000)
     ));
     executor.shutdown();

     for (Future<Long> result : results) {
         System.out.println(result.get());
     }
  }
}
```

这个例子程序利用executor来计算长整形数值的和。

内部的Sum类实现了Callable接口，并被excutors用来执行结果计算，而并发工作则放在call方法中执行。

java.util.concurrent.Executors类提供了好几个工具方法，比如提供预先配置的Executors和包装普通的java.util.Runnable对象为Callable实例。使用Callable比Runnable更优势的地方在于Callable可以有确切的返回值。

该例子使用executor分发工作给2个线程。

ExecutorService.invokeAll()方法放入Callable实例的集合，并且等待直到它们都返回。其返回Future对象列表，代表了计算的“未来”结果。

如果我们想以异步的方式执行，我们可以检测每个Future对象对应的Callable是否完成了它的工作和是否抛出了异常，甚至我们可以取消它。

相比当使用普通的线程时，你必须通过一个共享可变的布尔值来编码取消逻辑，并且通过定期检查该布尔值来破坏该代码。

因为invokeAll()是阻塞的，我们可以直接迭代Future实例来获取它们的计算和。

另外要注意executor服务必须被关闭。

如果它没有被关闭，主方法执行完后JVM就不会退出，因为仍然有激活线程存在。

## Fork/Join 任务阶段

Executors相对于普通的线程已经是一个很大的进步，因为executors很容易管理并发任务。

有些类型的算法存在需要创建子任务，并且让它们彼此通信来完成任务。

这些都是”分而治之”的算法，也被称为”map and reduce”，这是参考函数式编程的同名函数。

想法是将数据区通过算法处理分隔为更小切独立的块，这是”map”阶段。反过来，一旦这些块被处理完成了，各部分的结果就可以收集起来形成最终的结果，这就是”reduce”阶段。

一个简单的例子想要计算出一个庞大的整形数组的和(如图1)。由于加法是可交换的，可以拆分数组分更小的部分，并且用并发线程计算各部分和。各部分和可以被加来从而计算出总和。

因为线程可以独立对一个数组的不同区域使用这种算法操作。相比于单线程算法(迭代数组中每个整形)，你将看到在多核架构中有了明显的性能提升。

![fork-join-array](http://ifeve.com/wp-content/uploads/2014/07/fork_join1.png)

通过executors解决上面的问题是很容易的：将数组分为n(可用的物理处理单元)部分，创建Callable实例来计算每一部分的和，提交它们到一个管理了n个线程的池中，并且收集结果计算出最终结果。

然而，对其他类型的算法和数据结构，其执行计划并不是那么简单。

特别是，识别出要以有效的方式被独立处理的“足够小”的数据块的”map”阶段并不能提前知道到数据空间的拓扑结构。基于图和基于树的数据结构尤为如此。在这些情况下，算法应该创建层级”划分”，即在部分结果返回之前等待子任务完成，虽然在像图1中的数组性能较差，但有好几个并发部分和的计算的级别可以使用(比如，在双核处理器上将数组分为4个子任务)。

为了实现分而治之算法的executors的问题是创建不相关的子任务，因为一个Callable是无限制的提交一个新的子任务给它的executors，并且以同步或异步的方式等待它的结果。

问题是并行：当一个Callable等待另一个Callable的结果时，它就处于等待状态，从而浪费了一个机会来处理队列中等待执行的另一个Callable。

通过Doug Lea努力填补了这一缺陷，在Java SE7中，fork/join框架被加到了java.util.concurrent包中。

java.util.concurrent的Java SE5和Java SE6版本帮助处理并发，并且Java SE7的添加则帮助处理并行。

# 核心类

在Java的Fork/Join框架中，使用两个类完成上述操作

## ForkJoinTask

我们要使用Fork/Join框架，首先需要创建一个ForkJoin任务。

该类提供了在任务中执行fork和join的机制。通常情况下我们不需要直接集成ForkJoinTask类，只需要继承它的子类，Fork/Join框架提供了两个子类：

a. RecursiveAction：用于没有返回结果的任务

b. RecursiveTask: 用于有返回结果的任务

## ForkJoinPool

ForkJoinTask需要通过ForkJoinPool来执行

任务分割出的子任务会添加到当前工作线程所维护的双端队列中，进入队列的头部。

当一个工作线程的队列里暂时没有任务时，它会随机从其他工作线程的队列的尾部获取一个任务(工作窃取算法)。

## 同步或者异步

在 ForkJoinPool 中执行 ForkJoinTask 时，可以采用同步或者异步。

采用同步方法执行时，发送任务给 Fork/Join 线程池的方法直接到任务执行完成后才会返回结果。

而采用异步方法执行时，发送任务给执行器的方法将立即返回结果，但任务仍能继续执行。



# 使用入门例子

## 需求

我们通过一个简单的例子来介绍一下Fork/Join框架的使用。

需求是求1+2+3+4的结果

使用Fork/Join框架首先要考虑到的是如何分割任务，如果希望每个子任务最多执行两个数的相加，那么我们设置分割的阈值是2，由于是4个数字相加。

所以Fork/Join框架会把这个任务fork成两个子任务，子任务一负责计算1+2，子任务二负责计算3+4，然后再join两个子任务的结果。

## 实例代码

因为是有结果的任务，所以必须继承RecursiveTask，实现代码如下：

```java
public class CountTask extends RecursiveTask<Integer>{

    private static final int THREAD_HOLD = 2;

    private int start;
    private int end;

    public CountTask(int start,int end){
        this.start = start;
        this.end = end;
    }

    @Override
    protected Integer compute() {
        int sum = 0;
        //如果任务足够小就计算
        boolean canCompute = (end - start) <= THREAD_HOLD;
        if(canCompute){
            for(int i=start;i<=end;i++){
                sum += i;
            }
        }else{
            int middle = (start + end) / 2;
            CountTask left = new CountTask(start,middle);
            CountTask right = new CountTask(middle+1,end);
            //执行子任务
            left.fork();
            right.fork();
            //获取子任务结果
            int lResult = left.join();
            int rResult = right.join();
            sum = lResult + rResult;
        }
        return sum;
    }

    public static void main(String[] args){
        ForkJoinPool pool = new ForkJoinPool();
        CountTask task = new CountTask(1,4);
        Future<Integer> result = pool.submit(task);
        try {
            System.out.println(result.get());
        } catch (InterruptedException e) {
            e.printStackTrace();
        } catch (ExecutionException e) {
            e.printStackTrace();
        }
    }
}
```

通过这个例子，我们进一步了解ForkJoinTask，ForkJoinTask与一般任务的主要区别在于它需要实现compute方法，在这个方法里，首先需要判断任务是否足够小，如果足够小就直接执行任务。

如果不足够小，就必须分割成两个子任务，每个子任务在调用fork方法时，又会进入compute方法，看看当前子任务是否需要继续分割成子任务，如果不需要继续分割，则执行当前子任务并返回结果。

使用join方法会等待子任务执行完并得到其结果。

# Fork/Join框架的实现原理

ForkJoinPool由ForkJoinTask数组和ForkJoinWorkerThread数组组成，ForkJoinTask数组负责将存放程序提交给ForkJoinPool，而ForkJoinWorkerThread负责执行这些任务。

## ForkJoinTask的Fork方法的实现原理：

当我们调用ForkJoinTask的fork方法时，程序会把任务放在ForkJoinWorkerThread的pushTask的workQueue中，异步地执行这个任务，然后立即返回结果，代码如下：

```java
public final ForkJoinTask<V> fork() {
    Thread t;
    if ((t = Thread.currentThread()) instanceof ForkJoinWorkerThread)
        ((ForkJoinWorkerThread)t).workQueue.push(this);
    else
        ForkJoinPool.common.externalPush(this);
    return this;
}
```

pushTask方法把当前任务存放在ForkJoinTask数组队列里。

然后再调用ForkJoinPool的signalWork()方法唤醒或创建一个工作线程来执行任务。

代码如下：

```java
final void push(ForkJoinTask<?> task) {
    ForkJoinTask<?>[] a; ForkJoinPool p;
    int b = base, s = top, n;
    if ((a = array) != null) {    // ignore if queue removed
        int m = a.length - 1;     // fenced write for task visibility
        U.putOrderedObject(a, ((m & s) << ASHIFT) + ABASE, task);
        U.putOrderedInt(this, QTOP, s + 1);
        if ((n = s - b) <= 1) {
            if ((p = pool) != null)
                p.signalWork(p.workQueues, this);
        }
        else if (n >= m)
            growArray();
    }
}
```

## ForkJoinTask的join方法实现原理

Join方法的主要作用是阻塞当前线程并等待获取结果。

让我们一起看看ForkJoinTask的join方法的实现，代码如下：

```java
public final V join() {
    int s;
    if ((s = doJoin() & DONE_MASK) != NORMAL)
        reportException(s);
    return getRawResult();
}
```

它首先调用doJoin方法，通过doJoin()方法得到当前任务的状态来判断返回什么结果，任务状态有4种：已完成（NORMAL）、被取消（CANCELLED）、信号（SIGNAL）和出现异常（EXCEPTIONAL）。

如果任务状态是已完成，则直接返回任务结果。

如果任务状态是被取消，则直接抛出CancellationException

如果任务状态是抛出异常，则直接抛出对应的异常

### doJoin()

让我们分析一下doJoin方法的实现

```java
private int doJoin() {
    int s; Thread t; ForkJoinWorkerThread wt; ForkJoinPool.WorkQueue w;
    return (s = status) < 0 ? s :
        ((t = Thread.currentThread()) instanceof ForkJoinWorkerThread) ?
        (w = (wt = (ForkJoinWorkerThread)t).workQueue).
        tryUnpush(this) && (s = doExec()) < 0 ? s :
        wt.pool.awaitJoin(w, this, 0L) :
        externalAwaitDone();
}
```

- doExec()

```java
final int doExec() {
    int s; boolean completed;
    if ((s = status) >= 0) {
        try {
            completed = exec();
        } catch (Throwable rex) {
            return setExceptionalCompletion(rex);
        }
        if (completed)
            s = setCompletion(NORMAL);
    }
    return s;
}
```

在doJoin()方法里，首先通过查看任务的状态，看任务是否已经执行完成，如果执行完成，则直接返回任务状态；

如果没有执行完，则从任务数组里取出任务并执行。

如果任务顺利执行完成，则设置任务状态为NORMAL，如果出现异常，则记录异常，并将任务状态设置为EXCEPTIONAL。

# Fork/Join框架的异常处理

ForkJoinTask在执行的时候可能会抛出异常，但是我们没办法在主线程里直接捕获异常，所以ForkJoinTask提供了isCompletedAbnormally()方法来检查任务是否已经抛出异常或已经被取消了，并且可以通过ForkJoinTask的getException方法获取异常。

使用如下代码：

```java
if(task.isCompletedAbnormally()){
    System.out.println(task.getException());
}
```

getException方法返回Throwable对象，如果任务被取消了则返回CancellationException。

如果任务没有完成或者没有抛出异常则返回null。

```java
public final Throwable getException() {
        int s = status & DONE_MASK;
        return ((s >= NORMAL)    ? null :
                (s == CANCELLED) ? new CancellationException() :
                getThrowableException());
}
```

# 总结

这种思想类似于分治，或者说 map-reduce。

是在大量计算时，一种提升性能很好的方式。

# 拓展阅读

[JCIP-14-双端队列与工作密取](https://houbb.github.io/2019/01/18/jcip-14-deque-workstealing)

# 参考资料

《JCIP》

《java 并发编程的艺术》

[Fork/Join 框架详解](https://www.cnblogs.com/senlinyang/p/7885964.html)

[Fork/Join 框架详解](https://blog.csdn.net/chenshun123/article/details/77972609)

[ForkJoin详解](https://blog.csdn.net/qq_28822933/article/details/83273817)

[聊聊并发（八）——Fork/Join框架介绍](http://ifeve.com/talk-concurrency-forkjoin/)

[Fork and Join: Java也可以轻松地编写并发程序](http://ifeve.com/fork-and-join-java/)

[Java的Fork/Join任务，你写对了吗？](https://www.liaoxuefeng.com/article/001493522711597674607c7f4f346628a76145477e2ff82000)

https://www.jutuilian.com/article-17977-1.html

* any list
{:toc}