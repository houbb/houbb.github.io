---
layout: post
title:  JCIP-19-闭锁（如CountDownLatch），栅栏（如CyclicBarrier），信号量（如Semaphore）和阻塞队列（如LinkedBlockingQueue）
date:  2019-1-18 11:21:15 +0800
categories: [Concurrency]
tags: [thread, concurrency, thread, sh]
published: true
---

# 同步工具类

同步工具类主要包括闭锁（如CountDownLatch），栅栏（如CyclicBarrier），信号量（如Semaphore）和阻塞队列（如LinkedBlockingQueue）等；

FutureTask/Future 也可以达到同样的目的。

使用同步工具类可以协调线程的控制流；

同步工具类封装了一些状态，这些状态决定线程是继续执行还是等待，此外同步工具类还提供了修改状态的方法；

下面将简单介绍以上同步工具类；

# 常用同步工具类

## CountDownLatch（闭锁）

延迟线程的进度，直到其达到终止状态，所有线程将释放进度，当其到达结束状态后，将不会再改变状态

## FutureTask(也可以当做闭锁)

可以返回计算结果的任务

包括三种状态：等待运行（Waiting to run）、正在运行（Running）、运行完成（Completed）

执行完成表示计算的所有结束方式：正常结束、由与取消结束、由与异常结束；任务进入完成状态后将会停止在这个状态上

FutureTask表示的计算通过Callable接口来实现

Callable可以抛出受检查的或未受检查的异常，并且任何代码都可能抛出Error

无论任务代码抛出什么异常，都会被封装到一个ExecutionException中，并在Future.get中被重新抛出

上面两条将使get代码变得复杂，因为不仅需要处理可能出现的ExecutionException以及未受检查的CancellationException，而且还由于ExecutionException是做为一个Throwable类返回的

优点：提前启动计算，可以减少等待结果需要的时间

## Semaphore

对资源施加边界

## CyclicBarrier

与闭锁相同点：栅栏类似于闭锁，他能阻塞一组线程直到某个事件发生

与闭锁不同点：闭锁是一次性的，栅栏可多次使用；闭锁用于等待事件，而栅栏用于等待其他线程

## Exchanger

它是一种 Two-Party 栅栏，各方在栅栏位置上交换数据

# 闭锁

## 简介

可以让一个线程等待一组事件发生后（不一定要线程结束）继续执行；

闭锁是一种同步工具类，可以延迟线程的进度直到其达到终止状态。闭锁的作用相当于一扇门：在闭锁到达结束状态之前，这扇门一直是关闭的，并且没有任何线程能通过，当到达结束状态时，这扇门会打开并允许所有的线程通过。当闭锁到达结束状态后，将不会再改变状态，因此这扇门将永远保持打开状态。闭锁可以用来确保某些活动直到其它活动都完成后才继续执行，例如：

1、确保某个计算在其需要的所有资源都被初始化之后才继续执行。二元闭锁（包括两个状态）可以用来表示“资源R已经被初始化”，而所有需要R的操作都必须先在这个闭锁上等待。

2、确保某个服务在其依赖的所有其它服务都已经启动之后才启动。每个服务都有一个相关的二元闭锁。当启动服务S时，将首先在S依赖的其它服务的闭锁上等待，在所有依赖的服务都启动后会释放闭锁S，这样其他依赖S的服务才能继续执行。

3、等待直到某个操作的所有参与者（例如，在多玩家游戏中的所有玩家）都就绪再继续执行。在这种情况中，当所有玩家都准备就绪时，闭锁将到达结束状态。

CountDownLatch是一种灵活的闭锁实现，可以在上述各种情况中使用，它可以使一个或多个线程等待一组事件发生。闭锁状态包括一个计数器，该计数器被初始化为一个正数，表示需要等待的事件数量。countDown方法递减计数器，表示有一个事件已经发生了，而await方法等待计数器到达零，这表示所有需要等待的事件都已经发生。如果计数器的值非零，那么await会一直阻塞直到计数器为零，或者等待中的线程中断，或者等待超时。在下面的程序中给出了闭锁的两种常见用法。TestHarness创建一定数量的线程，利用他们并发地执行制定的任务。它使用两个闭锁，分别表示“起始门（Starting Gate）”和“结束门（Ending Gate）”。起始门计数器的初始值为1，而结束门计数器的初始值为工作线程的数量。每个工作线程首先要做的值就是在起始门上等待，从而确保所有线程都就绪后才开始执行。而每个线程要做的最后一件事情就是将调用结束门的countDown方法减去1，这能使主线程高效的等待直到所有工作线程都执行完成，因此可以统计所消耗的事件。

## 例子

举个例子如下，main 线程等待其它子线程的事件发生后继续执行 main 线程：

```java
public class TestHarness {
    public long timeTakes(int nThreads, final Runnable task) throws InterruptedException {
        final CountDownLatch startGate = new CountDownLatch(1);
        final CountDownLatch endGate = new CountDownLatch(nThreads);

        for (int i = 0; i < nThreads; i++) {
            Thread t = new Thread() {
                public void run() {
                    try {
                        startGate.await();
                        try {
                            task.run();
                        } finally {
                            endGate.countDown();
                        }
                    } catch (InterruptedException e) {
                        e.printStackTrace();
                    }

                }
            };
            t.start();
        }

        long start = System.nanoTime();
        startGate.countDown();
        endGate.await();
        long end = System.nanoTime();
        return end - start;
    }

    public static void main(String[] args) throws InterruptedException {
        TestHarness testHarness = new TestHarness();
        long nanoTime = testHarness.timeTakes(10, new Runnable() {
            public void run() {
                try {
                    Thread.sleep(1000);
                    System.out.println("Task is over!!!");
                } catch (InterruptedException e) {
                    e.printStackTrace();
                }
            }
        });
        System.out.println(nanoTime);
    }
}
```

# FutureTask

## 简介

FutureTask也可以做闭锁。FutureTask表示的计算是通过Callable来实现的，相当于一种可生成结果的Runnable，并且可以处于以下3种状态：等待运行（Waiting to run），正在运行（Running）和运行完成（Completed）。“执行完成”表示计算的所有可能结束方式，包括正常结束、由于取消而结束和由于异常而结束等。当FutureTask 进入完成状态后，它会永远停在这个状态上。

FutureTask.get的行为取决于任务的状态。如果任务已经完成，那么get会立即返回结果，否则get将阻塞直到任务进入完成状态，然后返回结果或者抛出异常。FutureTask将计算结果从执行计算的线程传递到获取这个结果的线程，而FutureTask的规范确保了这种传递过程能实现结果的安全发布。

## 代码示例

```java
public class Preloader {
    private final FutureTask<String> futureTask = new FutureTask<String>(new Callable<String>() {
        public String call() throws Exception {
            Thread.sleep(10000);
            return "Task is over";
        }
    });
    private final Thread thread = new Thread(futureTask);

    public void start() {
        thread.start();
    }

    public String get() throws ExecutionException, InterruptedException {
        return futureTask.get();
    }

    public static void main(String[] args) throws ExecutionException, InterruptedException {
        Preloader preloader = new Preloader();
        preloader.start();
        System.out.println(preloader.get());
    }
}
```

在Preloader中，当get方法抛出ExecutionException时，可能是以下三种情况之一：Callable抛出的受检查异常，RuntimeException，以及Error。

我们必须对每种情况单独处理。

# 信号量

## 简介

计数信号量（Counting Semaphore）用来控制同时访问的某个特定资源的操作数量，或者同时执行某个指定操作的数量[CPJ 3.4.1]。计算信号量还可以用来实现某种资源池，或者对容器施加边界。

Semaphore中管理着一组虚拟许可（permit），许可的初始量可通过构造函数来指定。在执行操作时可以首先获得许可（只要还有剩余的许可），并在使用以后释放许可。如果没有许可，那么acquire将阻塞直到有许可（或者直到被中断或者操作超时）。release方法将返回一个许可给信号量。计算信号量的一种简化形式是二值信号量，即初始化值为1的Semaphore。二值信号量可以用做互斥体（mutex），并具备不可重入的加锁语义：谁拥有这个唯一的许可，谁就拥有了互斥锁。

## 代码示例

```java
public class TestSemaphore {
    public static void main(String[] args) {
        // 线程池
        ExecutorService exec = Executors.newCachedThreadPool();
        // 只能5个线程同时访问
        final Semaphore semp = new Semaphore(5);
        // 模拟20个客户端访问
        for (int index = 0; index < 20; index++) {
            final int NO = index;
            Runnable run = new Runnable() {
                public void run() {
                    try {
                        // 获取许可
                        semp.acquire();
                        System.out.println("Accessing: " + NO);
                        Thread.sleep((long) (Math.random() * 10000));
                        // 访问完后，释放
                        semp.release();
                        System.out.println("-----------------" + semp.availablePermits());
                    } catch (InterruptedException e) {
                        e.printStackTrace();
                    }

                }

            };
            exec.execute(run);
        }
        // 退出线程池
        exec.shutdown();
    }
}
```

# 栅栏（Barrier）

## 简介

栅栏（Barrier）类似于闭锁，它能阻塞一组线程直到某个事件发生[CPJ 4.4.3]。闭锁是一次性对象，一旦进入最终状态，就不能被重置了。

**栅栏与闭锁的关键区别在于，所有线程必须同时达到栅栏位置，才能继续执行。闭锁用于等待事件，而栅栏用于等待其他线程。**

栅栏用于实现一些协议，例如几个家庭决定在某个地方集合：“所有人6：00在麦当劳碰头，到了以后要等其他人，之后再讨论下一步要做的事情。”

CyclicBarrer可以使一定数量的参与方反复地在栅栏位置汇集，它在并行迭代算法中非常有用：这种算法通常将一个问题拆分一些列互相独立的子问题。如果所有线程都达到了栅栏位置，那么栅栏将打开，为此所有线程都被释放，而栅栏将被重置以便下次使用。如果对await的调用超时，或者await阻塞的线程被中断，那么栅栏就认为是打破了，所有阻塞的await调用都将终止并抛出BrokenBarrerException。如果成功通过栅栏，那么await将为每个线程返回一个唯一的到达索引号，我们可以利用这些索引来“选举”产生一个领导线程，并在下一次迭代中由该领导线程执行一些特殊的工作。CyclicBarrer还可以使你将一个栅栏操作传递给构造函数,这是Runnable，当成功通过栅栏时会（在一个子任务线程中）执行它，但在阻塞线程被释放之前是不能被执行的。

在模拟程序中通常需要使用栅栏，例如某个步骤中的计算可以并行执行，但必须等到该步骤中的所有计算都执行完成才能进入下一个步骤。

## 代码示例

```java
public class TestCyclicBarrier {
    public static void main(String[] args) {
        int N = 4;
        CyclicBarrier barrier = new CyclicBarrier(N);

//        CyclicBarrier barrier  = new CyclicBarrier(N,new Runnable() {
//            @Override
//            public void run() {
//                System.out.println("当前线程"+Thread.currentThread().getName());
//            }
//        });

        for (int i = 0; i < N; i++) {
            new Writer(barrier).start();
        }

        try {
            Thread.sleep(25000);
        } catch (InterruptedException e) {
            e.printStackTrace();
        }

        System.out.println("CyclicBarrier重用");

        for (int i = 0; i < N; i++) {
            new Writer(barrier).start();
        }
    }

    static class Writer extends Thread {
        private CyclicBarrier cyclicBarrier;

        public Writer(CyclicBarrier cyclicBarrier) {
            this.cyclicBarrier = cyclicBarrier;
        }

        @Override
        public void run() {
            System.out.println("线程" + Thread.currentThread().getName() + "正在写入数据...");
            try {
                Thread.sleep(5000);      //以睡眠来模拟写入数据操作
                System.out.println("线程" + Thread.currentThread().getName() + "写入数据完毕，等待其他线程写入完毕");

                cyclicBarrier.await();
            } catch (InterruptedException e) {
                e.printStackTrace();
            } catch (BrokenBarrierException e) {
                e.printStackTrace();
            }
            System.out.println(Thread.currentThread().getName() + "所有线程写入完毕，继续处理其他任务...");
        }
    }
}
```

# Exchanger

## 简介

栅栏在Java同步工具包中的体现还有一个Exchanger，是一个双方栅栏，每一个在栅栏处交换数据。当双方执行的操作不对称的时候，Exchanger会很有用。当双方线程都到达栅栏的时候，将双方的数据进行交换，这个Exchanger对象可以使得两个线程生成的对象能够安全地交换。

### 空构造函数

这个类只提供了一个空构造函数，提供了两个方法：

```java
exchange(V x);//交换双方线程生成对象 交换成功或者被中断

exchange(V x,long timeout, TimeUnit unit);//交换双方线程生成对象 交换成功或者超时抛出超时异常或者被中断
```

## 代码示例

我们使用这个栅栏类模拟以下场景，两个线程，一个线程沉睡3000ms后交换字符串，一个线程直接交换字符串，互相输出接收到的字符串已经等待时间：

```java
import java.util.concurrent.Exchanger;
 
class Thread1 extends Thread{
    private Exchanger<String> exchanger;
    private String name;
    public Thread1(String name,Exchanger<String> exchanger){
        super(name);
        this.exchanger = exchanger;
    }
    @Override
    public void run(){
        try {
            long startTime = System.currentTimeMillis();
            Thread.sleep(3000);
            System.out.println(Thread.currentThread()+"获取到数据:"+exchanger.exchange("我是Thread1的实例"));
            System.out.println("等待了"+(System.currentTimeMillis()-startTime));
        } catch (InterruptedException e) {
            e.printStackTrace();
        }
    }
}
class Thread2 extends Thread{
    private Exchanger<String> exchanger;
    private String name;
    public Thread2(String name,Exchanger<String> exchanger){
        super(name);
        this.exchanger = exchanger;
    }
    @Override
    public void run(){
        try {
            long startTime = System.currentTimeMillis();
            System.out.println(Thread.currentThread()+"获取到数据:"+exchanger.exchange("我是Thread2的实例"));
            System.out.println("等待了"+(System.currentTimeMillis()-startTime));
        } catch (InterruptedException e) {
            e.printStackTrace();
        }
    }
}
public class Main {
    public static void main(String[] args) {
        Exchanger<String> exchanger = new Exchanger<String>();
        new Thread1("thread1",exchanger).start();
        new Thread2("thread2",exchanger).start();
    }
}
```

也就是交换双方先到栅栏处的会等待后到达栅栏处的，直到交换双方都到达栅栏然后开始交换数据。

# 阻塞队列

## 简介

阻塞队列提供了可阻塞的入队和出对操作，如果队列满了，入队操作将阻塞直到有空间可用，如果队列空了，出队操作将阻塞直到有元素可用；

队列可以为有界和无界队列，无界队列不会满，因此入队操作将不会阻塞；

下面将使用阻塞队列LinkedBlockingQueue举个生产者-消费者例子，生产者每隔1秒生产1个产品，然后有6个消费者在消费产品，可以发现，每隔1秒，只有一个消费者能够获取到产品消费，其它线程只能等待...

> 参见 [BlockingQueue](https://houbb.github.io/2019/01/18/jcip-09-blocking-queue)

## 代码示例

```java
import java.text.SimpleDateFormat;
import java.util.Date;
import java.util.concurrent.BlockingQueue;
import java.util.concurrent.LinkedBlockingQueue;
import java.util.concurrent.TimeUnit;

//生产者
public class Producer implements Runnable {
    private final BlockingQueue<String> fileQueue;

    public Producer(BlockingQueue<String> queue) {
        this.fileQueue = queue;

    }

    public void run() {
        try {
            while (true) {
                TimeUnit.MILLISECONDS.sleep(1000);
                String produce = this.produce();
                System.out.println(Thread.currentThread() + "生产：" + produce);
                fileQueue.put(produce);
            }

        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
        }
    }

    public String produce() {
        SimpleDateFormat dfdate = new SimpleDateFormat("HH:mm:ss");
        return dfdate.format(new Date());
    }

    public static void main(String[] args) {
        BlockingQueue<String> queue = new LinkedBlockingQueue<String>(10);

        for (int i = 0; i < 1; i++) {
            new Thread(new Producer(queue)).start();
        }
        for (int i = 0; i < 6; i++) {
            new Thread(new Consumer(queue)).start();
        }
    }
}

// 消费者
class Consumer implements Runnable {
    private final BlockingQueue<String> queue;

    public Consumer(BlockingQueue<String> queue) {
        this.queue = queue;
    }

    public void run() {
        try {
            while (true) {
                TimeUnit.MILLISECONDS.sleep(1000);
                System.out.println(Thread.currentThread() + "prepare 消费");
                System.out.println(Thread.currentThread() + "starting："
                        + queue.take());
                System.out.println(Thread.currentThread() + "end 消费");
            }
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
        }
    }
}
```

# 参考资料

[CountDownLatch  同步倒数计数器](https://www.cnblogs.com/shijiaqi1066/p/3412338.html)

[5同步工具类](https://www.jianshu.com/p/eda604aa2642)

[同步工具类--闭锁](https://blog.csdn.net/zjt1388/article/details/39560899)

[同步工具类](http://kangsimba.com/2017/01/05/synchronization-tool-class/)

[线程同步工具类](https://www.cnblogs.com/chenpi/p/5358579.html)

* any list
{:toc}

