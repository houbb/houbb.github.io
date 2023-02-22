---
layout: post
title:  JCIP-32-线程池的使用
date:  2019-1-18 11:21:15 +0800
categories: [Concurrency]
tags: [thread, thread-pool, concurrency, sh]
published: true
---

# 线程池调优的必要性

在标准的Executor实现中，当执行需求较低时将回收空闲线程，而当需求增加时将添加新的线程，并且如果从任务中抛出了未检查异常，那么将用一个新的工作者线程替代抛出异常的线程。

只有当线程本地值的生命周期受限于任务的生命周期时，在线程池中的线程使用ThreadLocal才有意义，而在线程池的线程中不应该使用ThreadLocal在任务之间传递值。

只有当任务都是同类型的并且相互独立时，线程池的性能才能达到最佳。如果将运行时间较长的与运行时间较短的任务混合在一起，那么除非线程池很大，否则将可能造成“阻塞”。

如果提交的任务依赖于其他任务，那么除非线程池无限大，否则可能造成死锁。幸运的是基于网络的典型服务器应用程序中 - 网页服务器、邮件服务器以及文件服务器等，它们的请求通常都是同类型的并且相互独立。

如果在线程池中总是充满了被阻塞的任务，那么说明线程池的规模太小。

# 任务与执行策略之间的隐形耦合

Executor可以将生产者和消费者解耦，但是不是所有的任务都适用所有的执行策略，有些类型的任务需要明确地指定执行策略。
  
1. 依赖性任务: 如果一个任务是独立的，改变线程池的大小和配置只会影响性能。如果需要以来其他的任务，那么必须小心的维持这些执行策略以避免产生活跃性问题。

2. 使用线程封闭机制的任务：单线程的Executor能对并发性做出更强的承诺。如果将Executor从单线程环境改为线程池环境，那么将会失去线程安全性。

3. 对相应时间敏感的task：比如说GUI处理用户操作的task。

4. 使用了ThreadLocal类的task：只有当线程本地值的生命周期受限于任务的生命周期时，在线程池的线程中使用ThreadLocal才有意义。ThreadLocal让每个线程都拥有某个变量的私有版本与线程池重用线程相矛盾。

只有当任务都是同类型，并且相互独立时，线程池的性能才能达到最佳。
  
如果运行时间较长和较短的任务混合在一起，可能造成“拥塞”

如果任务依赖于其他任务，可能造成“死锁”

# 线程饥饿死锁

所有正在执行的任务都由于等待其他人处于工作队列中的任务而阻塞，这种现象被称为线程饥饿死锁。

```java
public class ThreadDeadlock{
  //这里的newSingleThreadExecutor()方法返回的线程池只包含单个线程
  ExecutorService exec = Executors.newSingleThreadExecutor();
  
  public class RenderPageTask implement Callable<String>{
    public String call() throws Execptioin{
      Future<String> header, footer;
      headr = exec.submit(new loadFileTask("header.html"));
      footer = exec.submit(new loadFileTask("footer.html"));
      String page = renderBody();
      //这里的get将会死锁。
      return header.get()+page+footer.get();
    }
  }
}
```

除了显式的限制，还有一些情况也会发生死锁：

```java
public class StarvationDeadLock {  
    public static void main(String[] args) {  
        final ExecutorService executor = Executors.newFixedThreadPool(3);  
        // 设定await在Barrier对象上的线程数达到4个时, 其await方法才释放  
        final CyclicBarrier barrier = new CyclicBarrier(4);  
          
        // 重复提交4个task, 每个task都await在barrier对象上  
        // barrier的await方法将一直阻塞, 直到4个线程都到达await点.  
        // 但是线程池中只有3个线程, 不可能出现4个线程都达到await点的情形, 所以依然会发生死锁  
        for (int i = 0; i < 4; i++) {  
            executor.submit(new Runnable() {  
                @Override  
                public void run() {  
                    try {  
                        System.out.println("waiting for other tasks arriving at common point");  
                        barrier.await();  
                    } catch (InterruptedException e) {  
                        Thread.currentThread().interrupt();  
                    } catch (BrokenBarrierException e) {  
                        e.printStackTrace();  
                    }  
                }  
            });  
        }  
    }  
}
```

## 运行时长较长的任务

线程池中线程的数量应该多于稳定状态下执行较长时长任务的数量。
   
限定任务等待资源的时间：平台类库中的大多数可阻塞方法中，都同时定义了限时版本和无限时版本，

例如Thread.join,BlockingQueue.put.CountDownLatch.await,Selector.select等。

如果等待超时，可以把任务标识为失败，终止或者重新放回队列。

# 设置线程池的大小

计算环境：cpu

资源预算：内存

任务的特性：计算密集型还是IO密集型，是否需要JDBC连接这样的稀缺资源。

如果需要执行不同类别并且行为相差较大的任务，可以考虑使用多个线程池。
  
对于计算密集型task, 合适的size大约为CPU数量+1.
  
IO密集型task，size = CPU数量 CPU利用率 (1 + 等待时间和计算时间的比例)。
  
内存等：每个任务对该资源的需求量除资源总量，就是线程池大小的上限。

## 分析的维度

要想合理的配置线程池的大小，首先得分析任务的特性，可以从以下几个角度分析：

任务的性质：CPU密集型任务、IO密集型任务、混合型任务。

任务的优先级：高、中、低。

任务的执行时间：长、中、短。

任务的依赖性：是否依赖其他系统资源，如数据库连接等。

性质不同的任务可以交给不同规模的线程池执行。

## 不同性质任务的处理

对于不同性质的任务来说，CPU密集型任务应配置尽可能小的线程，
如配置CPU个数+1的线程数，IO密集型任务应配置尽可能多的线程，
因为IO操作不占用CPU，不要让CPU闲下来，应加大线程数量，
如配置两倍CPU个数+1，而对于混合型的任务，如果可以拆分，拆分成IO密集型和CPU密集型分别处理，
前提是两者运行的时间是差不多的，如果处理时间相差很大，则没必要拆分了。

若任务对其他系统资源有依赖，如某个任务依赖数据库的连接返回的结果，这时候等待的时间越长，则CPU空闲的时间越长，
那么线程数量应设置得越大，才能更好的利用CPU。 

当然具体合理线程池值大小，需要结合系统实际情况，在大量的尝试下比较才能得出，以上只是前人总结的规律。

## 线程数的大小

在这篇如何合理地估算线程池大小？文章中发现了一个估算合理值的公式

最佳线程数目 = （（线程等待时间+线程CPU时间）/线程CPU时间 ）* CPU数目

比如平均每个线程CPU运行时间为0.5s，而线程等待时间（非CPU运行时间，比如IO）为1.5s，CPU核心数为8，那么根据上面这个公式估算得到：((0.5+1.5)/0.5)*8=32。这个公式进一步转化为：

最佳线程数目 = （线程等待时间与线程CPU时间之比 + 1）* CPU数目

### 结论

可以得出一个结论：
 
线程等待时间所占比例越高，需要越多线程。线程CPU时间所占比例越高，需要越少线程。 

以上公式与之前的CPU和IO密集型任务设置线程数基本吻合。

## 并发编程网上的一个问题
 
高并发、任务执行时间短的业务怎样使用线程池？

并发不高、任务执行时间长的业务怎样使用线程池？

并发高、业务执行时间长的业务怎样使用线程池？ 

（1）高并发、任务执行时间短的业务，线程池线程数可以设置为CPU核数+1，减少线程上下文的切换 

（2）并发不高、任务执行时间长的业务要区分开看： 

a）假如是业务时间长集中在IO操作上，也就是IO密集型的任务，因为IO操作并不占用CPU，所以不要让所有的CPU闲下来，可以适当加大线程池中的线程数目，让CPU处理更多的业务
 
b）假如是业务时间长集中在计算操作上，也就是计算密集型任务，这个就没办法了，和（1）一样吧，线程池中的线程数设置得少一些，减少线程上下文的切换
 
（3）并发高、业务执行时间长，解决这种类型任务的关键不在于线程池而在于整体架构的设计，看看这些业务里面某些数据是否能做缓存是第一步，增加服务器是第二步，至于线程池的设置，设置参考（2）。
最后，业务执行时间长的问题，也可能需要分析一下，看看能不能使用中间件对任务进行拆分和解耦。

 ## 获取处理器的数量

我们可以通过如下代码来获取处理器的数量：

```java
//获取处理器的数量
System.out.println(Runtime.getRuntime().availableProcessors());
```

# 配置ThreadPoolExecutor

## 构造函数

ThreadPoolExecutor通用构造函数：

```java
public ThreadPoolExecutor(
                         //线程的基本大小，没有任务执行时的大小。
                         int corePoolSize,
                         int maximumPoolSize,//最大大小
						 //存活时间，超过标记为可回收。
                         long keepAliveTime,
                         TimeUnit unit,
                         BlockingQueue<Runnable> workQueue,
                         ThreadFactory threadFactory,
                         RejectedExecutionHandler handler){}
```

## 线程的创建和销毁

newCachedThreadPool 最大大小设定为Integer.Max_Value，基本大小为0，超时为1分钟

newFixedThreadPool 基本大小和最大大小设定为指定的值，而且创建的线程池不会超时

newScheduledThreadExecutor 核心线程数由调用方指定, 最大线程数为Integer.MAX_VALUE, 超时时间为0

## 管理队列任务

无界队列：newFixedThreadPool和newSingleThreadExecutor在默认情况下将使用一个无界的LinkedBlockingQueue。

有界队列：ArrayBlockingQueue，有界的LinkedBlockingQueue PriorityBlockingQueue。在队列填满后，使用饱和策略解决。队列的大小必须和线程池的大小一起调节，如果线程池小队列大，会限制吞吐量。

同步移交（Synchronous Handoff）： 对于非常大或者无界的线程池，使用SynchronousQueue来避免任务排队，直接将任务从生产者移交给消费者线程。线程池无界或者可以拒绝任务时，SynchronousQWueue才有实际价值，在newCachedThreadPool工厂方法就使用了SynchronousQueue。
  
## 核心和最大池大小

ThreadPoolExecutor 将根据 corePoolSize（参见 getCorePoolSize()）和 maximumPoolSize（参见 getMaximumPoolSize()）设置的边界自动调整池大小。当新任务在方法 execute(java.lang.Runnable) 中提交时，
如果运行的线程少于 corePoolSize，则创建新线程来处理请求，即使其他辅助线程是空闲的。

如果运行的线程多于 corePoolSize 而少于 maximumPoolSize，则仅当队列满时才创建新线程。

如果设置的 corePoolSize 和 maximumPoolSize 相同，则创建了固定大小的线程池。

如果将 maximumPoolSize 设置为基本的无界值（如 Integer.MAX_VALUE），则允许池适应任意数量的并发任务。

在大多数情况下，核心和最大池大小仅基于构造来设置，不过也可以使用 setCorePoolSize(int) 和 setMaximumPoolSize(int) 进行动态更改。
   
## 饱和策略

在有界队列填满之后，饱和策略开始发挥作用。

ThreadPoolExecutor的饱和策略通过setRejectedExecutionHandler来修改。
   
Abort Policy：抛出未检查的RejectedExecutionException，调用者可以捕获这个异常，然后根据需求编写处理代码。

Caller-Runs Policy：将某些任务回退到调用者，从而降低新任务的流量。在提交task的线程中执行task，从而提交task的线程就不能提交task，当这一层的请求队列被填满后，再向上蔓延，一直达到客户端，实现一种平缓的性能降低。

Discard policy：抛弃该任务

Discard Oldest Policy：抛弃下一个将被执行的任务，然后尝试重新提交新的任务。（如果使用优先队列，那么将抛弃优先级最高的）

## 线程工厂

每当线程池需要创建一个线程时，都是通过线程工厂方法来完成的。

默认的线程工厂将创建一个新的、非守护的线程，并且不包括特殊的配置信息。

通过指定一个线程工厂方法，可以定制线程池的配置信息。在ThreadFactory中只定义了一个方法newThread，每当线程池需要创建一个新线程时，都会调用这个方法。

在许多情况下都需要使用定制的线程工厂方法，例如为每个线程设置一个名字、设置一个UnCaughtExceptionHandler等，都可以通过自定义ThreadFactory来进行。

如果在应用程序中需要利用安全策略来控制对某些特殊代码库的访问权限，那么可以通过Executor中的privilegedThreadFactory工厂来定制自己的线程工厂。

如果不使用privilegedThreadFactory，线程池创建的线程将从在需要新线程时调用execute或submit的客户程序中继承访问权限，从而导致令人困惑的安全问题。

```java
public class MyThreadFactory implements ThreadFactory{
  private final String poolName;
  
  public MyThreadFactory(String poolName){
    this.poolName = poolName;
  }
  
  public Thread newThread(Runnable runnable){
    return new MyAppThread(runnable, pollName);
  }
}
```

```java
public class MyThreadFactory implements ThreadFactory {
	private final String poolName;
	public MyThreadFactory(String poolName) {
		this.poolName = poolName;
	}
	public Thread newThread(Runnable runnable) {
		return new MyAppThread(runnable, poolName);
	}
}
public class MyAppThread extends Thread {
	public static final String DEFAULT_NAME = "MyAppThread";
	private static volatile boolean debugLifecycle = false;
	private static final AtomicInteger created = new AtomicInteger();
	private static final AtomicInteger alive = new AtomicInteger();
	private static final Logger log = Logger.getAnonymousLogger();
	public MyAppThread(Runnable r) {
		this(r, DEFAULT_NAME);
	}
	public MyAppThread(Runnable runnable, String name) {
		// 为自定义的Thread类指定线程名称
		super(runnable, name + "-" + created.incrementAndGet());
		// 设置UncaughtExceptionHandler. UncaughtExceptionHandler的uncaughtException方法将在线程运行中抛出未捕获异常时由系统调用
		setUncaughtExceptionHandler(new Thread.UncaughtExceptionHandler() {
			public void uncaughtException(Thread t, Throwable e) {
				log.log(Level.SEVERE, "UNCAUGHT in thread " + t.getName(), e);
			}
		});
	}
	public void run() {
		// 复制debug标志以确保一致的值。。。？ 
		boolean debug = debugLifecycle;
		if (debug)
			log.log(Level.FINE, "Created " + getName());
		try {
			alive.incrementAndGet();
			super.run();
		} finally {
			alive.decrementAndGet();
			if (debug)
				log.log(Level.FINE, "Exiting " + getName());
		}
	}
	public static int getThreadsCreated() {
		return created.get();
	}
	public static int getThreadsAlive() {
		return alive.get();
	}
	public static boolean getDebug() {
		return debugLifecycle;
	}
	public static void setDebug(boolean b) {
		debugLifecycle = b;
	}
}
```

## 在调用构造函数后再设置ThreadPoolExecutor

在调用完ThreadPoolExecutor的构造函数之后，仍然可以通过设置函数（Setter）来修改大多数传递给它的构造函数的参数（例如线程池的大小、最大大小、存活时间、线程工厂以及拒绝执行处理器）。

如果Executor是通过Executors中的某个（newSingleThreadExecutor除外）工厂方法创建的，那么可以将结果的类型转换为ThreadPoolExecutor以访问设置器。

在Executors中包含一个unconfigurableExecutorService工厂方法，该方法对一个现有的ExecutorService进行包装，使其只暴露出ExecutorService的方法，因此不能对它进行配置。

newSingleThreadExecutor返回按这种方式封装的ExecutorService，而不是最初的ThreadPoolExecutor。

如果在代码中增加了单线程Executor的线程池大小，那么将破坏它的执行语义。

你可以在自己的Executor中使用这项技术以防止执行策略被修改。如果将ExecutorService暴露给不信任的代码，又不希望对其进行修改，就可以通过unconfigurableExecutorService来包装它。

```java
ExecutorService exec = Executors.newCachedThreadPool();
if(exec instanceof ThreadPoolExecutor)
  ((ThreadPoolExecutor)exec).setCorePoolSize(10);
else
  throw new AssertionError("Error");
```

# 扩展ThreadPoolExecutor

ThreadPoolExecutor类提供了多个”钩子”方法, 以供其子类实现, 比如beforeExecute, afterExecute, terminated等. 
所谓”钩子”是指基类预留的, 但是没有提供具体实现的方法, 其方法体为空. 子类可以根据需要为”钩子”提供具体实现。
  
beforeExecute和afterExecute方法分别在执行task前后调用beforeExecute和afterExecute方法可以用于记录日志, 统计数据等操作。
  
terminated方法在线程池被关闭后调用。 

terminated方法可以用于释放线程池申请的资源。

# 递归算法的并行化

如果循环中的迭代操作都是独立的，并且不需要等待所有的迭代操作都完成再继续执行，那么可以使用Executor将穿行循环转化为并行循环。
  
如果需要提交一个任务集，并等待他们完成，那么可以使用ExecutorService.invokeAll，并且在所有任务都执行完成后调用CompletionService来获取结果。
  
在递归中并行：将在节点上的计算与递归访问分开，将计算并行化。

```java
public<T> void parallelRecursive(final Executor exec,
                                 List<Node<T>> nodes,
                                 final Collection<t> results){
	for(final Node<T> n : nodes){
      exec.execute(new Runnable(){
        public void run(){
          results.add(n.compute());
        }
      });
      parallelRecursive(exec, n.getChildren(),results);
	}
}
```

使用shutdown和awaitTermination等方法等待所有的结果：
  
```java
public<T> Collection<T> getParallelResults(List<Node<T>> nodes)
  throws InterruptedExeception{
  ExectorService exec = Executors.newCachedThreadPool();
  Queue<T> resultQueue = new ConcurrentLinkedQueue<T>;
  parallelRecursive(exec, nodes, resultQueue);
  exec.shutdown();
  exec.awaitTermination(Long.MAX_VALUE,TimeUnit.SECONDS);
  return resultQueue;
}
```

shutdown方法：平滑的关闭ExecutorService，当此方法被调用时，ExecutorService停止接收新的任务并且等待已经提交的任务（包含提交正在执行和提交未执行）执行完成。当所有提交任务执行完毕，线程池即被关闭。

awaitTermination方法：接收人timeout和 TimeUnit两个参数，用于设定超时时间及单位。当等待超过设定时间时，会监测ExecutorService是否已经关闭，若关闭则返回true，否则返回false。一般情况下会和shutdown方法组合使用

## 实际例子

实际就是类似Number of Islands或者N-Queens等DFS问题的一种并行处理。

### 串行实现

```java
public class SequentialPuzzleSolver <P, M> {
    private final Puzzle<P, M> puzzle;
    private final Set<P> seen = new HashSet<P>();

    public SequentialPuzzleSolver(Puzzle<P, M> puzzle) {
        this.puzzle = puzzle;
    }

    public List<M> solve() {
        P pos = puzzle.initialPosition();
        return search(new PuzzleNode<P, M>(pos, null, null));
    }

    private List<M> search(PuzzleNode<P, M> node) {
        if (!seen.contains(node.pos)) {
            seen.add(node.pos);
            if (puzzle.isGoal(node.pos))
                return node.asMoveList();
            for (M move : puzzle.legalMoves(node.pos)) {
                P pos = puzzle.move(node.pos, move);
                PuzzleNode<P, M> child = new PuzzleNode<P, M>(pos, move, node);
                List<M> result = search(child);
                if (result != null)
                    return result;
            }
        }
        return null;
    }
}
```

### 并行实现

```java
public class ConcurrentPuzzleSolver <P, M> {
    private final Puzzle<P, M> puzzle;
    private final ExecutorService exec;
    private final ConcurrentMap<P, Boolean> seen;
    protected final ValueLatch<PuzzleNode<P, M>> solution = new ValueLatch<PuzzleNode<P, M>>();

    public ConcurrentPuzzleSolver(Puzzle<P, M> puzzle) {
        this.puzzle = puzzle;
        this.exec = initThreadPool();
        this.seen = new ConcurrentHashMap<P, Boolean>();
        if (exec instanceof ThreadPoolExecutor) {
            ThreadPoolExecutor tpe = (ThreadPoolExecutor) exec;
            tpe.setRejectedExecutionHandler(new ThreadPoolExecutor.DiscardPolicy());
        }
    }

    private ExecutorService initThreadPool() {
        return Executors.newCachedThreadPool();
    }

    public List<M> solve() throws InterruptedException {
        try {
            P p = puzzle.initialPosition();
            exec.execute(newTask(p, null, null));
            // block until solution found
            PuzzleNode<P, M> solnPuzzleNode = solution.getValue();
            return (solnPuzzleNode == null) ? null : solnPuzzleNode.asMoveList();
        } finally {
            exec.shutdown();
        }
    }

    protected Runnable newTask(P p, M m, PuzzleNode<P, M> n) {
        return new SolverTask(p, m, n);
    }

    protected class SolverTask extends PuzzleNode<P, M> implements Runnable {
        SolverTask(P pos, M move, PuzzleNode<P, M> prev) {
            super(pos, move, prev);
        }

        public void run() {
            if (solution.isSet()
                    || seen.putIfAbsent(pos, true) != null)
                return; // already solved or seen this position
            if (puzzle.isGoal(pos))
                solution.setValue(this);
            else
                for (M m : puzzle.legalMoves(pos))
                    exec.execute(newTask(puzzle.move(pos, m), m, this));
        }
    }
}
```
# 拓展阅读

[如何合理的估算线程数的大小](http://ifeve.com/how-to-calculate-threadpool-size/)

# 个人启发

对于阅读的精细认真真理。

查看多篇类似文档，让内容多次在不同场景复现，加深记忆。

## 手写线程池。

基于 Java 自己实现 Executor 框架。

## 线程池能否基于注解

线程池的执行很多地方和缓存很类似。

如果缓存可以和注解结合使用，那么线程池可以吗？

## AOP 切面

如何定义一个不依赖于 spring 的 AOP？

并且可以灵活的被 spring 使用。

## 并行框架

转化为并行。spring 应该有类似的框架。

[mykit-async之——异步并行框架正式开源](https://blog.csdn.net/l1028386804/article/details/82564153)

[alibaba 并行加载技术](https://github.com/alibaba/asyncload)

## 参数化测试框架。

junit 的参数化测试。

测试人员填写数据，断言结果。

# 参考资料

[《Java并发编程实战》读书笔记——线程池的使用](http://jlearning.cn/2017/05/03/Usage-of-ThreadPool/)

[Java并发编程实战系列8之线程池的使用](https://yq.aliyun.com/articles/636093)

[并发编程实战 - 线程池的使用](https://blog.csdn.net/json_it/article/details/79089829)

https://www.cnblogs.com/f91og/p/6917840.html

[如何优雅的使用和理解线程池](http://ifeve.com/%E5%A6%82%E4%BD%95%E4%BC%98%E9%9B%85%E7%9A%84%E4%BD%BF%E7%94%A8%E5%92%8C%E7%90%86%E8%A7%A3%E7%BA%BF%E7%A8%8B%E6%B1%A0/)

[Java并发编程实战 第8章 线程池的使用](http://www.makaidong.com/xiaolang8762400/2317_170790.html)

* any list
{:toc}