---
layout: post
title:  JCIP-28-Executor CompletableFuture
date:  2019-1-18 11:21:15 +0800
categories: [Concurrency]
tags: [thread, concurrency, future, async, TODO, sh]
published: true
excerpt: JCIP-28-Executor CompletableFuture
---

# Future 的不足

## 性能

虽然Future以及相关使用方法提供了异步执行任务的能力，但是对于结果的获取却是很不方便，只能通过阻塞或者轮询的方式得到任务的结果。

阻塞的方式显然和我们的异步编程的初衷相违背，轮询的方式又会耗费无谓的CPU资源，而且也不能及时地得到计算结果，为什么不能用观察者设计模式当计算结果完成及时通知监听者呢？

## 多个 Future 结果之间的依赖性

Future接口可以构建异步应用，但依然有其局限性。它很难直接表述多个 Future 结果之间的依赖性。

实际开发中，我们经常需要达成以下目的：

- 将两个异步计算合并为一个——这两个异步计算之间相互独立，同时第二个又依赖于第一个的结果。

- 等待 Future 集合中的所有任务都完成。

- 仅等待 Future集合中最快结束的任务完成（有可能因为它们试图通过不同的方式计算同一个值），并返回它的结果。

- 通过编程方式完成一个Future任务的执行（即以手工设定异步操作结果的方式）。

- 应对 Future 的完成事件（即当 Future 的完成事件发生时会收到通知，并能使用 Future 计算的结果进行下一步的操作，不只是简单地阻塞等待操作的结果）
新的CompletableFuture类将使得这些成为可能

# 其他语言的处理

## Node.js

很多语言，比如Node.js，采用回调的方式实现异步编程。Java的一些框架，比如Netty，自己扩展了Java的 Future接口，提供了addListener等多个扩展方法：

```java
ChannelFuture future = bootstrap.connect(new InetSocketAddress(host, port));
future.addListener(new ChannelFutureListener()
{
        @Override
        public void operationComplete(ChannelFuture future) throws Exception
        {
            if (future.isSuccess()) {
                // SUCCESS
            }
            else {
                // FAILURE
            }
        }
});
```

## Guava

Google guava也提供了通用的扩展Future:ListenableFuture、SettableFuture 以及辅助类Futures等,方便异步编程。

```java
final String name = ...;
inFlight.add(name);
ListenableFuture<Result> future = service.query(name);
future.addListener(new Runnable() {
  public void run() {
    processedCount.incrementAndGet();
    inFlight.remove(name);
    lastProcessed.set(name);
    logger.info("Done with {0}", name);
  }
}, executor);
```

作为正统的Java类库，是不是应该做点什么，加强一下自身库的功能呢？

## jdk8 以后的多线程处理

集合进行并行计算有两种方式：并行流和CompletableFutures。

### 并行流

计算密集型操作，并且没有I/O，推荐使用Stream接口。因为实现简单，同时效率也可能是最高的（如果所有的线程都是计算密集型的，那就没有必要创建比处理器核数更多的线程）；

### CompletableFutures

如果并行的工作单元还涉及等待I/O的操作（包括网络连接等待），那么使用CompletableFuture灵活性更好。这种情况下处理流的流水线中如果发生I/O等待，流的延迟特性会让我们很难判断到底什么时候触发了等待。

## CompletableFuture 类的引入

在Java 8中, 新增加了一个包含50个方法左右的类: CompletableFuture，提供了非常强大的Future的扩展功能，可以帮助我们简化异步编程的复杂性，提供了函数式编程的能力，可以通过回调的方式处理计算结果，并且提供了转换和组合CompletableFuture的方法。

下面我们就看一看它的功能吧。

# CompletableFuture

JDK1.8才新加入的一个实现类CompletableFuture，实现了 Future, CompletionStage 两个接口。

当一个Future可能需要显示地完成时，使用CompletionStage接口去支持完成时触发的函数和操作。

当两个及以上线程同时尝试完成、异常完成、取消一个CompletableFuture时，只有一个能成功。

## 实现了 CompletionStage 接口

CompletableFuture实现了CompletionStage接口的如下策略：

1. 为了完成当前的CompletableFuture接口或者其他完成方法的回调函数的线程，提供了非异步的完成操作。

2. 没有显式入参Executor的所有async方法都使用 ForkJoinPool.commonPool() 为了简化监视、调试和跟踪，所有生成的异步任务都是标记接口AsynchronousCompletionTask的实例。

3. 所有的CompletionStage方法都是独立于其他共有方法实现的，因此一个方法的行为不会受到子类中其他方法的覆盖。

## 实现了 Futurre 接口

CompletableFuture实现了Futurre接口的如下策略：

1. CompletableFuture无法直接控制完成，所以cancel操作被视为是另一种异常完成形式。方法isCompletedExceptionally可以用来确定一个CompletableFuture是否以任何异常的方式完成。

2. 以一个CompletionException为例，方法get()和get(long,TimeUnit)抛出一个ExecutionException，对应CompletionException。为了在大多数上下文中简化用法，这个类还定义了方法join()和getNow，而不是直接在这些情况中直接抛出CompletionException。

## 异步执行任务静态方法

CompletableFuture中4个异步执行任务静态方法：

### 接口定义

```java
public static <U> CompletableFuture<U> supplyAsync(Supplier<U> supplier) {
        return asyncSupplyStage(asyncPool, supplier);
    }

public static <U> CompletableFuture<U> supplyAsync(Supplier<U> supplier,Executor executor) {
    return asyncSupplyStage(screenExecutor(executor), supplier);
}

public static CompletableFuture<Void> runAsync(Runnable runnable) {
    return asyncRunStage(asyncPool, runnable);
}

public static CompletableFuture<Void> runAsync(Runnable runnable, Executor executor) {
    return asyncRunStage(screenExecutor(executor), runnable);
}
```

其中supplyAsync用于有返回值的任务，runAsync则用于没有返回值的任务。

Executor参数可以手动指定线程池，否则默认ForkJoinPool.commonPool()系统级公共线程池， 

注意：这些线程都是Daemon线程，主线程结束Daemon线程不结束，只有JVM关闭时，生命周期终止。

# 异常处理

CompletableFuture实现了Future接口，因此你可以像Future那样使用它。

## 不使用线程池的方式

其次，CompletableFuture并非一定要交给线程池执行才能实现异步，你可以像下面这样实现异步运行：

```java
@Test
public void test1() throws ExecutionException, InterruptedException {
    CompletableFuture<String> completableFuture = new CompletableFuture<>();
    new Thread(() -> {
        // 模拟执行耗时任务
        System.out.println("task doing...");
        try {
            Thread.sleep(3000);
        } catch (InterruptedException e) {
            e.printStackTrace();
        }
        // 告诉completableFuture任务已经完成
        completableFuture.complete("ok");
    }).start();
    // 获取任务结果，如果没有完成会一直阻塞等待
    String result = completableFuture.get();
    System.out.println("计算结果:" + result);
}
```

## 发生异常的情况

如果没有意外，上面发的代码工作得很正常。但是，如果任务执行过程中产生了异常会怎样呢？

非常不幸，这种情况下你会得到一个相当糟糕的结果：异常会被限制在执行任务的线程的范围内，最终会杀死该线程，而这会导致等待get方法返回结果的线程永久地被阻塞。

客户端可以使用重载版本的 get() 方法，它使用一个超时参数来避免发生这样的情况。

这是一种值得推荐的做法，你应该**尽量在你的代码中添加超时判断的逻辑，避免发生类似的问题**。

使用这种方法至少能防止程序永久地等待下去，超时发生时，程序会得到通知发生了TimeoutException。

不过，也因为如此，你不能确定执行任务的线程内到底发生了什么问题。


## 异常的处理

为了能获取任务线程内发生的异常，你需要使用 CompletableFuture.completeExceptionally() 方法将导致CompletableFuture内发生问题的异常抛出。

这样，当执行任务发生异常时，调用get()方法的线程将会收到一个 ExecutionException异常，该异常接收了一个包含失败原因的Exception 参数。

```java
try {
    Thread.sleep(3000);
    // 任务的处理
} catch (Exception e) {
    // 告诉completableFuture任务发生异常了
    completableFuture.completeExceptionally(e);
}
```

# 多任务组合

JDK CompletableFuture 自带多任务组合方法allOf和anyOf

allOf是等待所有任务完成，构造后CompletableFuture完成

anyOf是只要有一个任务完成，构造后CompletableFuture就完成

## 使用例子

```java
public class CompletableFutureDemo {

    public static void main(String[] args) {
        Long start = System.currentTimeMillis();
        // 结果集
        List<String> list = new ArrayList<>();

        ExecutorService executorService = Executors.newFixedThreadPool(10);

        List<Integer> taskList = Arrays.asList(2, 1, 3, 4, 5, 6, 7, 8, 9, 10);
        // 全流式处理转换成CompletableFuture[]+组装成一个无返回值CompletableFuture，join等待执行完毕。返回结果whenComplete获取
        CompletableFuture[] cfs = taskList.stream()
                .map(integer -> CompletableFuture.supplyAsync(() -> calc(integer), executorService)
                                .thenApply(h->Integer.toString(h))
                                .whenComplete((s, e) -> {
                                    System.out.println("任务"+s+"完成!result="+s+"，异常 e="+e+","+new Date());
                                    list.add(s);
                                })
                ).toArray(CompletableFuture[]::new);
        // 封装后无返回值，必须自己whenComplete()获取
        CompletableFuture.allOf(cfs).join();
        System.out.println("list="+list+",耗时="+(System.currentTimeMillis()-start));
    }

    public static Integer calc(Integer i) {
        try {
            if (i == 1) {
                Thread.sleep(3000);//任务1耗时3秒
            } else if (i == 5) {
                Thread.sleep(5000);//任务5耗时5秒
            } else {
                Thread.sleep(1000);//其它任务耗时1秒
            }
            System.out.println("task线程：" + Thread.currentThread().getName()
                    + "任务i=" + i + ",完成！+" + new Date());
        } catch (InterruptedException e) {
            e.printStackTrace();
        }
        return i;
    }
}
```

# CompletableFuture 源码

TODO...

# 参考资料

《java 并发编程实战》

[Java CompletableFuture 详解](https://www.bbsmax.com/A/ZOJPj02ydv/)

[Java 8 强大的函数式异步编程辅助类](https://colobu.com/2016/02/29/Java-CompletableFuture/)

[Java8新特性之：CompletableFuture](https://blog.51cto.com/turnsole/2120848)

[CompletableFuture 详解](https://www.jianshu.com/p/6f3ee90ab7d3)

http://developer.51cto.com/art/201712/561631.htm

https://www.cnblogs.com/cjsblog/p/9267163.html

https://blog.51cto.com/turnsole/2120848

[Java8新特性整理之CompletableFuture：组合式、异步编程（七）](https://blog.csdn.net/u011726984/article/details/79320004)

* any list
{:toc}