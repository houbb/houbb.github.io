---
layout: post
title: 轻松学习多线程三高系列-03-Thread pool 线程池
date:  2019-1-19 11:21:15 +0800
categories: [Thread]
tags: [thread, java, sh]
published: true
---

## 什么是线程池

为了避免重复的创建线程 

线程池的出现可以让**线程复用** 通俗的讲 当有任务来的时候 就会像线程池里面拿一个线程 当工作完成后 不是关闭线程 而是归还线程到线程池中

这样避免了重复开销 这样就会节省性能和时间



# 多次创建线程的劣势

服务器需要接受并处理请求所以会为一个请求来分配一个线程来进行处理 

如果每次请求都新创建一个线程的话

十分方便但是会存在一些问题：

1. 如果并发的数量大那么每个线程的执行时间很短相应的创建和销毁线程就会很频繁

2. 当很频繁的创建和销毁线程会大大降低系统的效率 可能出现服务器在为每个请求创建新线程和销毁线程上花费的时间

和消耗的系统资源要比实际用户处理的时间都要多

## 什么时候使用线程池

并发量大需要处理的任务量比较大

单个任务处理的时间段

## 线程池的优势

1. 重用存在的线程减少线程的创建，销毁的开销，能够减少cpu切换提高性能
  
2. 提高响应速度当任务到达的时候任务可以不需要等待线程创建就能立即执行
  
3. 提高线程的管理线程是稀缺资源如果无限制的创建，不仅会消耗资源还会降低系统的稳定性，使用线程池进行统一分配调优和监控

# 关系

线程池各类的关系：

Executors -- new ThreadPoolExecutor

ThreadPoolExecutor extends AbstractExecutorService

AbstractExecutorService(抽象类) implements ExecutorService

interface ExecutorService extends Executor



## 线程池的核心讲解

核心参数

corePoolsize : 线程中允许的核心线程数

maximumPoolsize : 该线程所允许的最大线程数

keepAliveTime : 空余线程的存活时间并不会对所有的线程起作用 如果线程数大于corePoolsize 那么这些线程就不会因为被空闲太久而关闭 

除非你调用 allowcorethreadtimeout 方法 这个方法可以使核心线程数也被回收

只有当线程池中的线程数大于corePoolSize时keepAliveTime才会起作用,知道线程中的线程数不大于corepoolSIze,

unit : 时间单位

workQueue : 阻塞队列 在此的作用就是用来存放线程

threadFatory: 线程工厂 可以为线程池创建新线程

defaultHnadler: 拒绝策略 当线程失败等 如何处理方式

## 常见的四种线程池

1. FixedThreadPool 有固定的线程池 其中corePoolSize = maxinumPoolSize 且keepalivetime 为0 适合线程稳定的场所

2. singleThreadPool 固定数量的线程池且数量为1 corePoolSize = maxinumPoolSize= 1 keepaliveTime =0

3. cachedThreadPool corePoolSize=0 maxiumPoolSize 不停的创建线程

4. ScheduledThreadPool 具有定期执行任务功能的线程池



## 阻塞队列一览 workQueue

### 1) 数组阻塞队列 ArrayBlockingQueue

FIFO（先进先出）原则对元素进行排序。队列的头部是在队列中存在时间最长的元素。队列的尾部是在队列中存在时间最短的元素。新元素插入到队列的屋部，队列取操作则是从队列头部开始获得元素

对应线程池队列：

有界的任务队列可以使用ArrayBlockingQueue实现。当使用有界队列时，若有新的任务需要执行，如果线程池的实际线程数小于corePoolSize， 则会优先创建新的线程，若大于corePoolSize，则会将新任务假如等待队列。 

若等待队列已满，无法加入，在总线程数，不大于maximumPoolSize的前提下，创建新的进程执行任务。若大于maximumPoolSize，则执行拒绝策略。

### 2) 延迟队列 DelayQueue

Workqueue-阻塞队列DelayedDelayed元素的一个无界阻塞队列，只有在延迟期满时才能从中提取元素。

该队列的头部是延迟期满后保存时间最长的Delayed元素。如果延迟都还没有期满，则队列没有头部，并且 poll 将返回null。

当一个元素的getDelay(TimeUnit.NANOSECONDS)方法返回一个小于等于（的值时，将发生到期。即使无法使用take或pol1移除未到期的元素，也不会将这些元素作为正常元素对待。

例如，size方法同时返回到期和未到期元泰的计数。此队列不允许使用null元素

### 3) 链阻塞队列 LinkedBlockingQueue

Workqueue-阻塞队列LirkedBlockingQueleLinkedBlockingQueue内部以一个链式结构(链按节点）对其元素进行存储。

如果需要的话，这一链式结构可以选择一个上限。

如果没有定义上限，将使用Integez.MAX_VALUE作为上限

对应线程池队列：

无界的任务队列可以通过LinkedBlockingQueue类实现。

与有界队列相反，除非系统资源耗尽，否则无界的任务队列不存在任务入队失败的情况。 

当有新的任务到来，系统的线程数小于corePoolSize时，线程池会产生新的线程执行任务，但当系统的线程数达到corePoolSize后，就会继续增加。 

若后续仍有新的任务假如，而又没有空闲的线程资源，则任务直接进入对列等待。若任务创建和处理的速度差异很大，无界队列会保持快速增长，直到耗尽系统内存。

### 4) 同步队列 SynchronousQueue

Workqueue-阻塞队列SyhchronousQueue同步Queue，属于线程安全的BlockingQueve的一种，此队列设计的理念类似于”单工模式，对于每个put/offer操作，必须等待一个take/poll操作，类似于我们的现实生活中的“火把传递〞：一个火把传递地他人，需要2个人”般手可及〞才行．

因为这 pipleline 思路的基于 queue 的”操作传递”

SynchronousQueue经常用来,一端或者双端严格遵守"单工"(单工作者)模式的场景,队列的两个操作端分别是productor和consumer.常用于一个productor多个consumer的场景。

在ThreadPoolExecutor中,通过Executors创建的cachedThreadPool就是使用此类型队列.已确保,如果现有线程无法接收任务(offer失败),将会创建新的线程来执行.

## 拒绝策略

等待队列也已经排满了,再也塞不下新的任务了同时,

线程池的max也到达了,无法接续为新任务服务

这时我们需要拒绝策略机制合理的处理这个问题.

AbortPolicy: 直接抛出异常组织系统正常工作

CallerRunPolicy：只要线程池未关闭，该策略直接在调用者线程中，运行当前被丢弃的任务

DiscardOldestPolicy：丢弃最老的一个请隶，尝试再次提交当前任务

DiscardPolicy: 直接丢弃任务不予处理也不抛出异常，这是最好的拒绝策略

如果需要自定义拒绝簽略可以实现RejectdExceutionHandler接口

已上的内置策略均实现了rejectExcutionHandler接口

## 线程池运行流程

![线程池运行](https://raw.githubusercontent.com/qiurunze123/imageall/master/threadpool101.png)

1) 在创建线程池后 等待提交过来的任务请求

2) 当调用execute()方法添加一个请求任务时线程池会做如下判断：

- 如果正在运行线程数量小于corePoolSize 那么马上创建线程运行这个任务

- 如果正在运行的线程数量大于或者等于corePoolSize 那么将任务放入队列

- 如果这时候队列满了且正在运行的线程数量还小于maximumPoolSize 那么还是要创建非核心线程来立刻运行这个任务

- 如果队列满了且正在运行的线程数量大于或者等于maximumPoolSize 那么线程池会启动饱和拒绝策略来执行
   
3) 当一个线程完成任务时 他会从队列中取下一个任务

4) 当一个线程无事可做超过一定时间 keepAliveTime 时 线程池会判断： 如果当前运行的线程大于corePoolSize那么这个线程就会被停掉

## 线程池在生产中选择哪种

1) 在生产中我们JDK自带的线程池 一个不用 我们需要自己创建线程资源必须通过线程池提供，不允许在应用中自行显式创建线程。

说明：使用线程池的好处是减少在创建和销毁线程上所消耗的时间以及系统资源的开销，

解决资源不足的问题。如果不使用线程池，有可能造成系统创建大量同类线程而导致消耗完内存或者“过度切换”的问题

2) 线程池不允许使用Executors去创建，而是通过ThreadPoolExecutor的方式，这样的处理方式让写的同学更加明确线程池的运行规则，规避资源耗尽的风险。

说明：Executors返回的线程池对象的弊端如下：

- FixedThreadPool和SingleThreadPool:允许的请求队列长度为Integer.MAX_VALUE，可能会堆积大量的请求，从而导致OOM。

- CachedThreadPool和ScheduledThreadPool:允许的创建线程数量为Integer.MAX_VALUE，可能会创建大量的线程，从而导致OOM。

## 如何合理的配置线程池

分为 cpu 密集型和 io 密集型

### cpu 密集

cpu密集型的意思就是该任务需要大量的计算 

而没有阻塞 cpu一直全速运行 CPU密集型任务只有在真正的多核CPU上才能得到加速

而在真正的cpu上 无论你开你个线程模拟该任务都不可能得到加速 因为cpu运算能力就那些

cpu 密集型任务配置尽可能少的线程数量 一般公式

cpu+1个线程的线程池

### io密集型

由于io密集型任务线程并不是一直在执行 则应配置尽可能多的线程 如cpu*2

io密集型 即该任务需要大量io 及大量的阻塞

在单线程上运行IO密集型的任务会导致大量的cpu运算能力浪费在等待

所以在IO密集型任务中使用多线程可以大大的加速程序运行 即使在单核CPU上 这种加速主要是为了利用被浪费掉阻塞时间

IO密集型 大部分线程都阻塞 故需要多配置线程

参考公式 CPU核数/1 -阻塞系数 阻塞系数在0。8-0.9之间

比如 8核cpu: 8/1-0.9 = 80个线程数



--------------------------

corePoolSize在很多地方被翻译成核心池大小，其实我的理解这个就是线程池的大小。

举个简单的例子：

```
假如有一个工厂，工厂里面有10个工人，每个工人同时只能做一件任务。
因此只要当10个工人中有工人是空闲的，来了任务就分配给空闲的工人做；
当10个工人都有任务在做时，如果还来了任务，就把任务进行排队等待；
如果说新任务数目增长的速度远远大于工人做任务的速度，那么此时工厂主管可能会想补救措施，比如重新招4个临时工人进来；
然后就将任务也分配给这4个临时工人做；
如果说着14个工人做任务的速度还是不够，此时工厂主管可能就要考虑不再接收新的任务或者抛弃前面的一些任务了。
当这14个工人当中有人空闲时，而新任务增长的速度又比较缓慢，工厂主管可能就考虑辞掉4个临时工了，只保持原来的10个工人，毕竟请额外的工人是要花钱的。
```

这个例子中的corePoolSize就是10，而maximumPoolSize就是14（10+4）。

也就是说corePoolSize就是线程池大小，maximumPoolSize在我看来是线程池的一种补救措施，即任务量突然过大时的一种补救措施。

不过为了方便理解，在本文后面还是将corePoolSize翻译成核心池大小。

largestPoolSize只是一个用来起记录作用的变量，用来记录线程池中曾经有过的最大线程数目，跟线程池的容量没有任何关系


# Executor 框架

## 线程池的重点属性

```java
private final AtomicInteger ctl = new AtomicInteger(ctlOf(RUNNING, 0));
private static final int COUNT_BITS = Integer.SIZE - 3;
private static final int CAPACITY   = (1 << COUNT_BITS) - 1;
```

ctl是对线程池的运行状态+++++线程池中有效线程的数量进行控制的一个字段

他包含俩部分的信息  

1. 线程池运行状态 runstate 

2. 线程内的有效线程数量 workerCount 

可以看到使用了Integer类型来保存高三位保存runstate 低29位保存workcount 

COUNT_BITS 就是29，CAPACITY就是1左移29位减1（29个1），这个常量表示workerCount的上限值，大约是5亿

## ctl 相关方法

```
private static int runStateOf(int c) { return c & ~CAPACITY; }
private static int workerCountOf(int c) { return c & CAPACITY; }
private static int ctlOf(int rs, int wc) { return rs | wc; }
```

runStateOf：获取运行状态；
workerCountOf：获取活动线程数；
ctlOf：获取运行状态和活动线程数的值

线程池存在5种状态
RUNNING = -1<< COUNT_BITS; //高3位为111
SHUTDOWN = 0 << COUNT_BITS; //高3位为000
STOP = 1 << COUNT_BITS; //高3位为001
TIDYING = 2 << COUNT_BITS; //高3位为010
TERMINATED = 3 << COUNT_BITS; //高3位为011

--------------------------状态说明--------------------------------

1、RUNNING
(1) 状态说明：线程池处在RUNNING状态时，能够接收新任务，以及对已添加的任务进行
处理。
(02) 状态切换：线程池的初始化状态是RUNNING。换句话说，线程池被一旦被创建，就处
于RUNNING状态，并且线程池中的任务数为0！

2、 SHUTDOWN
(1) 状态说明：线程池处在SHUTDOWN状态时，不接收新任务，但能处理已添加的任务。
(2) 状态切换：调用线程池的shutdown()接口时，线程池由RUNNING -> SHUTDOWN。

3、STOP
(1) 状态说明：线程池处在STOP状态时，不接收新任务，不处理已添加的任务，并且会中
断正在处理的任务。
(2) 状态切换：调用线程池的shutdownNow()接口时，线程池由(RUNNING or
SHUTDOWN ) -> STOP。

4、TIDYING
(1) 状态说明：当所有的任务已终止，ctl记录的”任务数量”为0，线程池会变为TIDYING
状态。当线程池变为TIDYING状态时，会执行钩子函数terminated()。terminated()在
ThreadPoolExecutor类中是空的，若用户想在线程池变为TIDYING时，进行相应的处理；
可以通过重载terminated()函数来实现。
(2) 状态切换：当线程池在SHUTDOWN状态下，阻塞队列为空并且线程池中执行的任务也
为空时，就会由 SHUTDOWN -> TIDYING。 当线程池在STOP状态下，线程池中执行的
任务为空时，就会由STOP -> TIDYING。

5、 TERMINATED
(1) 状态说明：线程池彻底终止，就变成TERMINATED状态。
(2) 状态切换：线程池处在TIDYING状态时，执行完terminated()之后，就会由 TIDYING -
> TERMINATED。
进入TERMINATED的条件如下：
线程池不是RUNNING状态；
线程池状态不是TIDYING状态或TERMINATED状态；
如果线程池状态是SHUTDOWN并且workerQueue为空；
workerCount为0；
设置TIDYING状态成功

![状态流转](https://raw.githubusercontent.com/qiurunze123/imageall/master/pool3.png)

## 线程池的具体实现

ThreadPoolExecutor 默认线程池
ScheduledThreadPoolExecutor 定时线程池

```java
//newFixedThreadPool
return new ThreadPoolExecutor(nThreads, nThreads,0L, TimeUnit.MILLISECONDS,new LinkedBlockingQueue<Runnable>());

//newSingleThreadExecutor
new ThreadPoolExecutor(1, 1,0L, TimeUnit.MILLISECONDS, new LinkedBlockingQueue<Runnable>()));

//newCachedThreadPool
new ThreadPoolExecutor(0, Integer.MAX_VALUE, 60L, TimeUnit.SECONDS, new SynchronousQueue<Runnable>());

//newWorkStealingPool
new ForkJoinPool(Runtime.getRuntime().availableProcessors(),ForkJoinPool.defaultForkJoinWorkerThreadFactory,null, true);
```

## 如何使用钩子函数来进行线程池操作

com.executor.PauseableThreadPool 如何在使用线程池前后添加钩子函数来进行数据监控

## 线程池的具体创建

```java
public ThreadPoolExecutor(int corePoolSize,
                          int maximumPoolSize,
                          long keepAliveTime,
                          TimeUnit unit,
                          BlockingQueue<Runnable> workQueue,
                          ThreadFactory threadFactory,
                          RejectedExecutionHandler handler) {
    if (corePoolSize < 0 ||
        maximumPoolSize <= 0 ||
        maximumPoolSize < corePoolSize ||
        keepAliveTime < 0)
        throw new IllegalArgumentException();
    if (workQueue == null || threadFactory == null || handler == null)
        throw new NullPointerException();
    this.corePoolSize = corePoolSize;
    this.maximumPoolSize = maximumPoolSize;
    this.workQueue = workQueue;
    this.keepAliveTime = unit.toNanos(keepAliveTime);
    this.threadFactory = threadFactory;
    this.handler = handler;
}
```

任务提交 

```java
1. public void execute() //提交任务无返回值
2. public Future<?> submit() // 任务执行后有返回值
```

## 线程任务操作流程

![线程任务操作流程](https://raw.githubusercontent.com/qiurunze123/imageall/master/pool4.png)

## 线程池参数解释

```
1.corePoolSize 线程池中的核心线程数，当提交一个任务时，线程池创建一个新线程执行任务，直到当前线程数等于corePoolSize 
如果当前线程数等于corePoolSize 继续提交的任务被保存到阻塞队列中等待被执行 如果执行到了prestartAllCoreThreads()方法
线程池会提前创建并启动当前线程

2.maximumPoolSize 线程池中允许的最大线程数如果阻塞队列满了则需要创建新的线程执行任务 前提是当前线程小于maximumPoolSize

3.keepAliveTime 线程池维护线程所允许的空闲时间 当线程池的线程大于corePoolSize 的时候 这个时候如果没有新的任务提交 核心线程
外的线程不会销毁而是会等待直到等待的时间超过了keepAliveTime

4.unit keepAliveTime单位

5.workQueue 用来保存被执行等待任务的队列 且任务必须实现了 runnable接口 在JDK中提供了如下阻塞队列：
   1、ArrayBlockingQueue：基于数组结构的有界阻塞队列，按FIFO排序任务；
   2、LinkedBlockingQuene：基于链表结构的阻塞队列，按FIFO排序任务，吞
   吐量通常要高于ArrayBlockingQuene；
   3、SynchronousQuene：一个不存储元素的阻塞队列，每个插入操作必须等到
   另一个线程调用移除操作，否则插入操作一直处于阻塞状态，吞吐量通常要高于
   LinkedBlockingQuene；
   4、priorityBlockingQuene：具有优先级的无界阻塞队列

6.threadFactory  它是ThreadFactory类型的变量，用来创建新线程。默认使用
                 Executors.defaultThreadFactory() 来创建线程。使用默认的ThreadFactory来创建线程
                 时，会使新创建的线程具有相同的NORM_PRIORITY优先级并且是非守护线程，同时也设
                 置了线程的名称
7.handler
  线程池的饱和策略，当阻塞队列满了，且没有空闲的工作线程，如果继续提交任务，必
  须采取一种策略处理该任务，线程池提供了4种策略：
  1、AbortPolicy：直接抛出异常，默认策略；
  2、CallerRunsPolicy：用调用者所在的线程来执行任务；
  3、DiscardOldestPolicy：丢弃阻塞队列中靠最前的任务，并执行当前任务；
  4、DiscardPolicy：直接丢弃任务；
  上面的4种策略都是ThreadPoolExecutor的内部类。
  当然也可以根据应用场景实现RejectedExecutionHandler接口，自定义饱和策略，如
  记录日志或持久化存储不能处理的任务
```

## 线程池监控

```java
public long getTaskCount() //线程池已执行与未执行的任务总数
public long getCompletedTaskCount() //已完成的任务数
public int getPoolSize() //线程池当前的线程数
public int getActiveCount() //线程池中正在执行任务的线程数量
```

# 参考资料

https://github.com/qiurunze123/threadandjuc/blob/master/docs/thread-base-9.md

* any list
{:toc}