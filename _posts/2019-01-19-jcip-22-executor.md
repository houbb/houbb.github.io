---
layout: post
title:  JCIP-22-Executor 框架, ExecutorService, AbstractExecutorService  
date:  2019-1-18 11:21:15 +0800
categories: [Concurrency]
tags: [thread, concurrency, thread, async, sh]
published: true
excerpt: JCIP-22-Executor 框架, ExecutorService  
---

# Q

是什么

为什么需要

有什么优缺点

如何使用

整个技术体系

为什么这么设计？如果是我，我怎么设计？

# 为什么需要 Executor 

## new Thread() 的缺点

1. 每次new Thread()耗费性能 

2. 调用new Thread()创建的线程缺乏管理，被称为野线程，而且可以无限制创建，之间相互竞争，会导致过多占用系统资源导致系统瘫痪。 

3. 不利于扩展，比如如定时执行、定期执行、线程中断

## 采用线程池的优点

1. 重用存在的线程，减少对象创建、消亡的开销，性能佳 

2. 可有效控制最大并发线程数，提高系统资源的使用率，同时避免过多资源竞争，避免堵塞 

3. 提供定时执行、定期执行、单线程、并发数控制等功能

# Executor

## 简介

在Java 5之后，并发编程引入了一堆新的启动、调度和管理线程的API。

Executor框架便是Java 5中引入的，

其内部使用了线程池机制，它在java.util.cocurrent 包下，通过该框架来控制线程的启动、执行和关闭，可以简化并发编程的操作。因此，在Java 5之后，通过Executor来启动线程比使用Thread的start方法更好，除了更易管理，效率更好（用线程池实现，节约开销）外，还有关键的一点：有助于避免this逃逸问题——如果我们在构造器中启动一个线程，因为另一个任务可能会在构造器结束之前开始执行，此时可能会访问到初始化了一半的对象用Executor在构造器中。

Executor框架包括：线程池，Executor，Executors，ExecutorService，CompletionService，Future，Callable等。

## Executor 框架的结构

### 1. 任务

包括被执行任务需要实现的接口：Runnable接口和Callable接口

Runnable和Callable接口的实现类，都可以被ThreadPoolExecutor 或 ScheduledThreadPoolExecutor 执行

### 2. 任务的执行

包括任务执行机制的核心接口Executor，以及继承自Executor的ExecutorService接口。

Executor框架有两个关键类实现了ExecutorService接口：ThreadPoolExecutor 和 ScheduledThreadPoolExecutor

Executor是一个接口，他是Executor框架的基础，它将任务的提交与任务的执行分离。

ThreadPoolExecutor是线程池的核心实现类，用来执行被提交的任务。

ScheduledThreadPoolExecutor是一个实现类，可以在给定的延迟后运行命令，或者定期执行命令。ScheduledThreadPoolExecutor 比 Timer 更灵活，功能更强大。

Executors 工具方法类对于线程池的创建等操作。

### 3. 异步计算的结果

包括Future和实现Future接口的FutureTask类。

Future接口和它的实现FutureTask类，代表异步计算的结果。

结果相关的实现：ExecutorCompletionService(使用 BlockingQueue+Executor)，避免 Future 的循环查询。

# 异步多线程处理的局限性

有时候异步对于程序的处理性能提升并没有那么明显，所以要选择合适的场景。

比如多个线程之间可以并行，且完全独立，使用异步提升就非常明显。

如果存在依赖，则性能永远以最慢的为基准。

# 执行策略

任务的提交和执行解耦。

执行策略中定义了：When How What Where 等执行的具体细节。

执行策略是一种资源的分配方案，使用 Executor 代替 Thread 可以帮助你更好的管理系统资源，提升性能和安全性。

# Executor 源码

## 源码定义

```java
public interface Executor {

    /**
     * Executes the given command at some time in the future.  The command
     * may execute in a new thread, in a pooled thread, or in the calling
     * thread, at the discretion of the {@code Executor} implementation.
     *
     * @param command the runnable task
     * @throws RejectedExecutionException if this task cannot be
     * accepted for execution
     * @throws NullPointerException if command is null
     */
    void execute(Runnable command);
}
```

虽然Executor是一个简单的接口，但它却为灵活且强大的异步任务执行框架提供了基础，该框架能够支持多种不同类型的任务执行策略，它提供了一种标准的方法将任务的提交过程与执行过程解耦开来。

Executor基于生产者-消费者模式，提交任务的操作相当于生产者（生成待完成的工作单元），执行任务的线程则相当于消费者（执行工作单元）。如果要在一个程序中实现一个生产者-消费者模式，那么最简单的方式就是使用Executor。

## 接口的优点

抽象，就是灵活。

Executor 又同时提供了大量的实现，线程池，生命周期等提供管理。

## 缺陷

使用执行的是 Runnable 接口。

Runnable 接口无法获取返回值。

# Executor 使用案例


## Executor执行Runnable任务

一旦Runnable任务传递到execute() 方法，该方法便会自动在一个线程上执行。下面是是Executor执行Runnable任务的示例代码：

- TestCachedThreadPool.java

测试代码

```java
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;

/**
 * @author binbin.hou
 * date 2019/2/20
 */
public class TestCachedThreadPool {

    static class TestRunnable implements Runnable {
        @Override
        public void run() {
            System.out.println(Thread.currentThread().getName() + "线程被调用了。");
        }
    }

    public static void main(String[] args) {
        ExecutorService executorService = Executors.newCachedThreadPool();
//      ExecutorService executorService = Executors.newFixedThreadPool(5);
//      ExecutorService executorService = Executors.newSingleThreadExecutor();
        for (int i = 0; i < 5; i++) {
            executorService.execute(new TestRunnable());
            System.out.println("************* a" + i + " *************");
        }
        executorService.shutdown();
    }
}
```

`Executors.newCachedThreadPool();` 创建线程池，详细内容将在下一节讲解。

- 测试日志

```
************* a0 *************
pool-1-thread-1线程被调用了。
************* a1 *************
************* a2 *************
************* a3 *************
pool-1-thread-2线程被调用了。
pool-1-thread-3线程被调用了。
pool-1-thread-1线程被调用了。
pool-1-thread-4线程被调用了。
************* a4 *************
```

## Executor执行Callable任务

在Java 5之后，任务分两类：一类是实现了Runnable接口的类，一类是实现了Callable接口的类。两者都可以被ExecutorService执行，但是Runnable任务没有返回值，而Callable任务有返回值。并且Callable的call()方法只能通过ExecutorService的submit(Callable task) 方法来执行，并且返回一个 Future，是表示任务等待完成的 Future。

下面给出一个Executor执行Callable任务的示例代码：

- 实现一个 Callable 接口 

```java
static class TaskWithResult implements Callable<String> {
    private int id;
    public TaskWithResult(int id) {
        this.id = id;
    }
    /**
     * 任务的具体过程，一旦任务传给ExecutorService的submit方法，
     * 则该方法自动在一个线程上执行
     */
    @Override
    public String call() throws Exception {
        System.out.println("call()方法被自动调用！！！    " + Thread.currentThread().getName());
        //该返回结果将被Future的get方法得到
        return "call()方法被自动调用，任务返回的结果是：" + id + "    " + Thread.currentThread().getName();
    }
}
```

- 测试代码

Future 可以用来获取 Callable 执行的内容，后续将会详细讲解。

```java
public static void main(String[] args) {
    ExecutorService executorService = Executors.newCachedThreadPool();
    List<Future<String>> resultList = new ArrayList<>();
    //创建10个任务并执行
    for (int i = 0; i < 10; i++) {
        //使用ExecutorService执行Callable类型的任务，并将结果保存在future变量中
        Future<String> future = executorService.submit(new TaskWithResult(i));
        //将任务执行结果存储到List中
        resultList.add(future);
    }
    //遍历任务的结果
    for (Future<String> fs : resultList) {
        try {
            // Future返回如果没有完成，则一直循环等待，直到Future返回完成
            while (!fs.isDone()) {
            }
            // 打印各个线程（任务）执行的结果
            System.out.println(fs.get());
        } catch (InterruptedException | ExecutionException e) {
            e.printStackTrace();
        } finally {
            //启动一次顺序关闭，执行以前提交的任务，但不接受新任务
            executorService.shutdown();
        }
    }
}
```

- 执行日志

```
call()方法被自动调用！！！    pool-1-thread-1
call()方法被自动调用！！！    pool-1-thread-3
call()方法被自动调用，任务返回的结果是：0    pool-1-thread-1
call()方法被自动调用！！！    pool-1-thread-2
call()方法被自动调用！！！    pool-1-thread-5
call()方法被自动调用，任务返回的结果是：1    pool-1-thread-2
call()方法被自动调用！！！    pool-1-thread-9
call()方法被自动调用！！！    pool-1-thread-4
call()方法被自动调用，任务返回的结果是：2    pool-1-thread-3
call()方法被自动调用，任务返回的结果是：3    pool-1-thread-4
call()方法被自动调用，任务返回的结果是：4    pool-1-thread-5
call()方法被自动调用！！！    pool-1-thread-7
call()方法被自动调用！！！    pool-1-thread-8
call()方法被自动调用！！！    pool-1-thread-10
call()方法被自动调用！！！    pool-1-thread-6
call()方法被自动调用，任务返回的结果是：5    pool-1-thread-6
call()方法被自动调用，任务返回的结果是：6    pool-1-thread-7
call()方法被自动调用，任务返回的结果是：7    pool-1-thread-8
call()方法被自动调用，任务返回的结果是：8    pool-1-thread-9
call()方法被自动调用，任务返回的结果是：9    pool-1-thread-10
```

# Executor 生命周期

ExecutorService 对于 Executor 生命周期的管理。

AbstractExecutorService: ExecutorService执行方法的默认实现

# ExecutorService

## 接口说明

ExecutorService接口继承自Executor接口，它提供了更丰富的实现多线程的方法，比如，ExecutorService提供了关闭自己的方法，以及可为跟踪一个或多个异步任务执行状况而生成 Future 的方法。 

可以调用ExecutorService的shutdown()方法来平滑地关闭 ExecutorService，调用该方法后，将导致ExecutorService停止接受任何新的任务且等待已经提交的任务执行完成(已经提交的任务会分两类：一类是已经在执行的，另一类是还没有开始执行的)，当所有已经提交的任务执行完毕后将会关闭ExecutorService。因此我们一般用该接口来实现和管理多线程。

ExecutorService的生命周期包括三种状态：运行、关闭、终止。

创建后便进入运行状态，当调用了 `shutdown()` 方法时，便进入关闭状态，此时意味着ExecutorService不再接受新的任务，但它还在执行已经提交了的任务，当素有已经提交了的任务执行完后，便到达终止状态。

如果不调用 `shutdown()` 方法，ExecutorService会一直处在运行状态，不断接收新的任务，执行新的任务，服务器端一般不需要关闭它，保持一直运行即可。

`shutdownNow()` 方法将强制终止所有运行中的任务并不再允许提交新任务

## 接口定义

```java
public interface ExecutorService extends Executor {

    void shutdown();//顺次地关闭ExecutorService,停止接收新的任务，等待所有已经提交的任务执行完毕之后，关闭ExecutorService

    List<Runnable> shutdownNow();//阻止等待任务启动并试图停止当前正在执行的任务，停止接收新的任务，返回处于等待的任务列表

    boolean isShutdown();//判断线程池是否已经关闭

    boolean isTerminated();//如果关闭后所有任务都已完成，则返回 true。注意，除非首先调用 shutdown 或 shutdownNow，否则 isTerminated 永不为 true。

    boolean awaitTermination(long timeout, TimeUnit unit)//等待（阻塞）直到关闭或最长等待时间或发生中断,timeout - 最长等待时间 ,unit - timeout 参数的时间单位  如果此执行程序终止，则返回 true；如果终止前超时期满，则返回 false 

    <T> Future<T> submit(Callable<T> task);//提交一个返回值的任务用于执行，返回一个表示任务的未决结果的 Future。该 Future 的 get 方法在成功完成时将会返回该任务的结果。

    <T> Future<T> submit(Runnable task, T result);//提交一个 Runnable 任务用于执行，并返回一个表示该任务的 Future。该 Future 的 get 方法在成功完成时将会返回给定的结果。

    Future<?> submit(Runnable task);//提交一个 Runnable 任务用于执行，并返回一个表示该任务的 Future。该 Future 的 get 方法在成功 完成时将会返回 null

    <T> List<Future<T>> invokeAll(Collection<? extends Callable<T>> tasks)//执行给定的任务，当所有任务完成时，返回保持任务状态和结果的 Future 列表。返回列表的所有元素的 Future.isDone() 为 true。
        throws InterruptedException;

    <T> List<Future<T>> invokeAll(Collection<? extends Callable<T>> tasks,
                                  long timeout, TimeUnit unit)//执行给定的任务，当所有任务完成时，返回保持任务状态和结果的 Future 列表。返回列表的所有元素的 Future.isDone() 为 true。
        throws InterruptedException;

    <T> T invokeAny(Collection<? extends Callable<T>> tasks)//执行给定的任务，如果在给定的超时期满前某个任务已成功完成（也就是未抛出异常），则返回其结果。一旦正常或异常返回后，则取消尚未完成的任务。
        throws InterruptedException, ExecutionException;

    <T> T invokeAny(Collection<? extends Callable<T>> tasks,
                    long timeout, TimeUnit unit)
        throws InterruptedException, ExecutionException, TimeoutException;
}
```


# 核心方法讲解

今天看别人的源码，发现使用到 shutdown() 这个方法和 `awaitTermination()` 方法，感觉还是需要整理一下区别。

以便加深理解。

## shutdown()

作用：停止接收新任务，原来的任务继续执行

与使用数据库连接池一样，每次使用完毕后，都要关闭线程池。

流程：

1、停止接收新的 submit 的任务；

2、已经提交的任务（包括正在跑的和队列中等待的）,会继续执行完成；

3、等到第2步完成后，才真正停止；

## shutdownNow()

作用：停止接收新任务，原来的任务停止执行

1、跟 shutdown() 一样，先停止接收新submit的任务；

2、忽略队列里等待的任务；

3、尝试将正在执行的任务interrupt中断；

4、返回未执行的任务列表；

说明：它试图终止线程的方法是通过调用 `Thread.interrupt()` 方法来实现的，这种方法的作用有限。

如果线程中没有sleep 、wait、Condition、定时锁等应用, interrupt() 方法是无法中断当前的线程的。

所以，shutdownNow() **并不代表线程池就一定立即就能退出，它也可能必须要等待所有正在执行的任务都执行完成了才能退出**。

但是大多数时候是能立即退出的。

## awaitTermination(long timeOut, TimeUnit unit)

作用：当前线程阻塞

当前线程阻塞，直到：

1. 等所有已提交的任务（包括正在跑的和队列中等待的）执行完；

2. 或者等超时时间到了（timeout 和 TimeUnit设定的时间）；

3. 或者线程被中断，抛出InterruptedException

然后会监测 ExecutorService 是否已经关闭，返回true（shutdown请求后所有任务执行完毕）或false（已超时）

## 区别

### 1、shutdown() 和 shutdownNow() 的区别

shutdown() 只是关闭了提交通道，用submit()是无效的；而内部该怎么跑还是怎么跑，跑完再停。

shutdownNow() 能立即停止线程池，正在跑的和正在等待的任务都停下了。

### 2、shutdown() 和 awaitTermination() 的区别

shutdown() 后，不能再提交新的任务进去；但是 awaitTermination() 后，可以继续提交。

awaitTermination()是阻塞的，返回结果是线程池是否已停止（true/false）；shutdown() 不阻塞。

# AbstractExecutorService

是对 ExecutorService 的默认抽象实现类。

# 拓展阅读

[多线程基础知识]()

[阻塞队列]()

# 参考资料

[为什么引入Executor线程池框架](https://www.cnblogs.com/fengsehng/p/6048610.html)

[ExecutorService 中 shutdown()、shutdownNow()、awaitTermination() 含义和区别](https://blog.csdn.net/xiaojin21cen/article/details/81778651)

《java 并发编程实战》P125

* any list
{:toc}


