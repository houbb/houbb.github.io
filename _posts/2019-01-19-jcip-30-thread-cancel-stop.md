---
layout: post
title:  JCIP-30-任务的关闭与取消
date:  2019-1-18 11:21:15 +0800
categories: [Concurrency]
tags: [thread, concurrency, sh]
published: true
---

# java 对于终止线程的考虑

Java没有提供任何机制来安全地（抢占式方法）终止线程，

虽然Thread.stop和suspend等方法提供了这样的机制，但是由于存在着一些严重的缺陷，因此应该避免使用。

但它提供了中断Interruption机制，这是一种协作机制，能够使一个线程终止另一个线程的当前工作。

# 一、取消

## 取消操作的原因

- 用户请求取消

- 有时间限制的操作

- 应用程序事件

- 错误

- 关闭

## 结束任务的四种方式：

- run方法执行结束

- 使用请求关闭标记（例如boolean开关）

- 使用中断机制

- 使用Future退出方法


## 使用请求关闭标记

变量需要volatile确保变量多线程环境下的可见性。

一般run()方法执行完，线程就会正常结束，然而，常常有些线程是伺服线程。

它们需要长时间的运行，只有在外部某些条件满足的情况下，才能关闭这些线程。

使用一个变量来控制循环，例如：最直接的方法就是设一个boolean类型的标志，并通过设置这个标志为true或false来控制while循环是否退出，

代码示例：

```java
package com.cocurrent.demo;
 
import java.math.BigInteger;
import java.util.ArrayList;
import java.util.List;
 
import static java.util.concurrent.TimeUnit.SECONDS;
 
/**
 * @Author: nanJunYu
 * @Description: 一个仅运行一秒的素数生成器
 * 线程的取消与关闭  通过cancel方法将设置标志 并且主循环会检车这个标志，
 * 为了使这个过程可靠的工作  标志cancelled必须为  volatile
 * @Date: Create in  2018/9/11 15:21
 */
public class CancelVolatile implements Runnable {
 
    private final List<BigInteger> pri = new ArrayList<BigInteger>();
 
    private volatile boolean cancelled;
 
    public void run() {
        BigInteger p = BigInteger.ONE;
        while (!cancelled) {
            p = p.nextProbablePrime();
            synchronized (this) {
                pri.add(p);
            }
        }
    }
 
    private void cancel() {
        cancelled = true;
    }
 
    private synchronized List<BigInteger> get() {
        return new ArrayList<BigInteger>(pri);
    }
 
    public static void main(String[] args) {
        CancelVolatile cancelVolatile = new CancelVolatile();
        new Thread(cancelVolatile).start();
        try {
            SECONDS.sleep(1);
        } catch (InterruptedException e) {
            e.printStackTrace();
        } finally {
            cancelVolatile.cancel();
        }
        System.out.println(cancelVolatile.get());
    }
}
```

CancelVolatile中的取消机制最终会使得搜索的素数任务退出，但是退出过程中需要花费一定的时间，然而，如果任务调度了一些阻塞方法，（BlockingQueue.put）那么可能产生一个问题——任务可能永远不会检查取消标示，永远不会结束。为取保线程能退出，我们通常使用中断，当我们调用interrupt，并不意味着立即停止目标线程正在运行的线程，而只是传递了一个请求中断的信息，它会在线程下一个合适的的时刻中断自己。wait、sleep、join、将严格处理这种请求，当他们收到一个中断请求，或饿着开始执行时发现中断状态时，将抛出异常。


## 使用中断机制

优点是相对“请求关闭标记”相应更快一些，但也不是立即关闭线程。

# 中断

线程中断是一种协作机制，线程可以通过这种机制来通知另外一个线程，告诉它在合适的或者可能的情况下停止当前工作，并转而执行其他的工作
 
在Java的API或者语言规范中，并没有将中断与任何取消语义关联起来，但实际上，如果在取消之外的其他操作中使用中断，那么都是不合适的，并且很难支撑起更大的应用。

每个线程都有一个boolean类型的中断状态，interrupt方法能中断目标线程，isInterrupt方法能够返回目标线程的中断状态，静态的interrupted方法将清除当前线程的中断状态并返回它之前的值。

阻塞库方法，例如Thread.sleep和Object.wait等都会检查线程何时中断，并且发现中断时提前返回。

阻塞方法响应中断时执行的操作包括：清除中断状态，抛出InterruptedException。

调用Interrupt并不意味着立即停止目标线程正在进行的工作，而只是传递了请求中断的消息，然后由线程再下一个合适的时刻中断自己。并且如果不触发InterruptException，那么中断状态将一直保持，直到有明确地清除中断状态，

wait，sleep和join等方法，将严格地处理中断请求，当它们收到中断请求或者在开始执行时发现某个已被设置好的中断状态是，将抛出异常。

良好的设计可以忽略中断请求，但要能使调用代码对中断请求进行某种处理。糟糕的设计可能会屏蔽中断请求，从而导致调用栈中其他代码无法对中断请求做出响应。

使用静态的interrupted方法时应该小心，因为它会清除当前线程的中断状态，如果调用返回true，那么除非你想屏蔽这个中断，否则必须对他进行处理（可以抛出InterruptedException），或者再次调用interrupt恢复中断状态。

## 取消线程的合理方式

通常情况下，中断是实现取消（结束线程）的最合理的方式。

## 中断策略

中断策略规定了线程如何解释某个中断请求，即当发生中断请求是，应该做哪些工作，哪些工作单元对于中断来说是原子操作，以及以多块的速度来响应中断。

最合理的中断策略是：尽快退出，在必要时进行清理，通知某个所有者该线程已经退出。

当检测到中断请求时，任务不需要放弃所有的操作，只需要记住该中断，并且一个合适的点（比如完成了数据的备份）之后抛出InterruptedException或者表示已收到中断请求。

如果在除了将InterruptedException传递给调用者外还需要执行其他操作，那么应该在捕获InterruptedException之后恢复中断状态：Thread.currentThread().interrupt();

由于每个线程拥有各自的中断策略，因此除非你知道中断对该线程的含义，否则就不应该中断这个线程。


## 响应中断

当调用可中断的阻塞函数时，例如Thread.sleep或者BlockingQueue.put等，有两种策略可以处理：传递异常，恢复中断状态。

恢复中断应该首先在本地保存中断状态，并在返回前恢复状态，而不是在捕获后立即恢复。

```java
public Task getNextTask(BlockingQueue<Task> queue) {
	boolean interrupted = false;
	try {
		while (true) {
			try {
				return queue.take();
			} catch (InterruptedException e) {
				interrupted = true;
				// 重新尝试
			}
			
		}
	} finally {
		if (interrupted) {
			Thread.currentThread().interrupt();
		}
	}
}
```


## 通过 Future 来实现取消

在中断线程之前，应该了解他的中断策略，除非你清楚线程的中断策略，否则不要中断线程。

当尝试取消某个任务时，不宜直接中断线程池，因为你不知道当中断请求到达时正在运行什么任务，只能通过任务的Future来实现取消。

Future拥有一个cancel方法，在以下情况下可以调用该函数将参数置为true：

执行任务的线程是由标准的Executor创建的

它实现了一种中断策略使得任务可以通过中断被取消

### 使用Future退出方法

boolean cancel(boolean mayInterruptIfRunning)  

试图取消对此任务的执行。 

boolean isCancelled()

如果在任务正常完成前将其取消，则返回 true。 

# 处理不可中断的阻塞

并非所有的可阻塞方法或者阻塞机制都能够响应中断：

一个线程由于执行同步的SocketI/O，或者等待获得内置锁而阻塞。

对于某些阻塞操作，只是设置了中断状态

## 同步 Socket IO
 
Java.io包中的同步Socket I/O。

虽然InputStream和OutputStream中的read和write等方法都不会响应中断，但通过关闭底层的套接字，可以使得由于执行read或write等方法而被阻塞的线程抛出一个SocketException。

## 同步 IO

Java.io包中的同步I/O。当中断一个正在InterruptibleChannel上等待的线程时，将抛出ClosedByInterruptedException）并关闭链路（这还会使得其他在这条链路上阻塞的线程同样抛出ClosedByInterruptException）。当关闭一个InterruptibleChannel时，将导致所有在链路操作上阻塞的线程抛出AsynchronousCloseException。大多数标准的Channel都实现了InterruptibleChannel。

## 异步 IO

Selector的异步I/O。如果一个线程在调用Selector.select方法（在java.nio.channels中）时阻塞了，那么调用close或wakeup方法会使线程抛出ClosedSelectorException并提前返回。

获取某个锁。

如果一个线程由于等待某个内置锁而被阻塞，那么将无法响应中断，因为线程认为它肯定获得锁，所以将不会理会中断请求。

但是，在Lock类中提供了 lockInterruptibly() 方法，该方法允许在等待一个锁的同时仍能响应中断。

## 例子

改写interrupt方法发出中断请求   

```java
@Override
public void interrupt() {
    try {
        socket.close(); //中断前关闭socket
    } catch (IOException e) {
        
    } finally{
        super.interrupt();
    }
}
```

## 采用newTaskFor来封装费标准的取消

# 二、停止基于线程的服务

## 生命周期

应用程序通常会创建基于线程的服务，如线程池。这些服务的时间一般比创建它的方法更长。

服务退出 -> 线程需要结束  无法通过抢占式的方法来停止线程，因此它们需要自行结束

除非拥有某个线程，否则不能对该线程进行操控。

例如，中断线程或者修改线程的优先级等

线程池是其工作者线程的所有者，如果要中断这些线程，那么应该使用线程池

应用程序可以拥有服务，服务也可以拥有工作者线程，但应用程序不能拥有工作者线程，因此应用程序不能直接停止工作者线程。

服务应该提供生命周期的方法来关闭他自己以及他所拥有的线程

对于持有线程的服务，只要服务的存在时间大于创建线程的方法的存在时间，那么就应该提供生命周期方法

ExecutorService提供的shutdown(), shutdownNow()

## shutdown()

将线程池状态置为SHUTDOWN,并不会立即停止：

1. 停止接收外部submit的任务

2. 内部正在跑的任务和队列里等待的任务，会执行完

3. 等到第二步完成后，才真正停止

## shutdownNow()

将线程池状态置为STOP。企图立即停止，事实上不一定：
   
1. 跟shutdown()一样，先停止接收外部提交的任务

2. 忽略队列里等待的任务

3. 尝试将正在跑的任务interrupt中断

4. 返回未执行的任务列表

## 使用线程池统一管理

之前的任务取消，主要是涉及如何关闭单个线程并且都是由创建单个线程的对象来进行关闭操作，
但是如果线程不是由对象自己而是由线程池统一创建的线程该如何处理呢？

1. 使用线程的对象进行关闭 - 当前即使不在对象中创建线程而由线程池创建，这个对象依然可以关闭线程，这点一定要相信程序员的破坏能力，只是使用第2种方式更符合封装原则。

2. 使用线程池统一管理 - 如果是使用ExecutorService创建就交由其进行关闭操作。

- void shutdown()

启动一次顺序关闭，执行以前提交的任务，但不接受新任务。如果已经关闭，则调用没有其他作用。 

安全关闭方式。

- List<Runnable> shutdownNow()

试图停止所有正在执行的活动任务，暂停处理正在等待的任务，并返回等待执行的任务列表。 

无法保证能够停止正在处理的活动执行任务，但是会尽力尝试。

例如，通过 Thread.interrupt() 来取消典型的实现，所以任何任务无法响应中断都可能永远无法终止。 

shutdownNow方法的局限性，强制关闭方式。

boolean isShutdown()

boolean isShutdown()如果此执行程序已关闭，则返回 true。 



## 1、示例：日志服务

```java
// LogWriter就是一个基于线程的服务，但不是一个完成的服务
public class LogWriter {
    //日志缓存
    private final BlockingQueue<String> queue;
    private final LoggerThread logger;//日志写线程
private static final int CAPACITY = 1000;

    public LogWriter(Writer writer) {
        this.queue = new LinkedBlockingQueue<String>(CAPACITY);
        this.logger = new LoggerThread(writer);
    }

public void start() { logger.start(); }

    //应用程序向日志缓存中放入要记录的日志
    public void log(String msg) throws InterruptedException {
        queue.put(msg);
}

    //日志写入线程，这是一个多生产者，单消费者的设计
    private class LoggerThread extends Thread {
        private final PrintWriter writer;
        public LoggerThread(Writer writer) {
            this.writer = new PrintWriter(writer, true); // autoflush
        }
        public void run() {
            try {
                while (true)
                   writer.println(queue.take());
            } catch(InterruptedException ignored) {
            } finally {
                writer.close();
            }
        }
    }
}
```

注意：可以中断阻塞的take()方法停止日志线程（消费者线程），但生产者没有专门的线程，没办法取消

```java
//日志服务，提供记录日志的服务，并有管理服务生命周期的相关方法
public class LogService {
       private final BlockingQueue<String> queue;
       private final LoggerThread loggerThread;// 日志写线程
       private final PrintWriter writer;
       private boolean isShutdown;// 服务关闭标示
       // 队列中的日志消息存储数量。我们不是可以通过queue.size()来获取吗？
       // 为什么还需要这个？请看后面
       private int reservations;

       public LogService(Writer writer) {
              this.queue = new LinkedBlockingQueue<String>();
              this.loggerThread = new LoggerThread();
              this.writer = new PrintWriter(writer);

       }

       //启动日志服务
       public void start() {
              loggerThread.start();
       }

       //关闭日志服务
       public void stop() {
              synchronized (this) {
                     /*
                      * 为了线程可见性，这里一定要加上同步，当然volatile也可，
                      * 但下面方法还需要原子性，所以这里就直接使用了synchronized，
                      * 但不是将isShutdown定义为volatile
                      */
                     isShutdown = true;
              }
              //向日志线程发出中断请求
              loggerThread.interrupt();
       }

       //供应用程序调用，用来向日志缓存存放要记录的日志信息
       public void log(String msg) throws InterruptedException {
              synchronized (this) {
                     /*
                      * 如果应用程序发出了服务关闭请求，则不存在接受日志，而是直接
                      * 抛出异常，让应用程序知道
                      */
                     if (isShutdown)
                            throw new IllegalStateException(/*日志服务已关闭*/);
                     /*
                      * 由于queue是线程安全的阻塞队列，所以不需要同步（同步也可
                      * 但并发效率会下降，所以将它放到了同步块外）。但是这里是的
                      * 操作序列是由两个操作组成的：即先判断isShutdown，再向缓存
                      * 中放入消息，如果将queue.put(msg)放在同步外，则在多线程环
                      * 境中，LoggerThread中的  queue.size() == 0 将会不准确，所
                      * 以又要想queue.put不同步，又要想queue.size()计算准确，所
                      * 以就使用了一个变量reservations专用来记录缓存中日志条数，
                      * 这样就即解决了同步queue效率低的问题，又解决了安全性问题，
                      * 这真是两全其美
                      */
                     //queue.put(msg);
                     ++reservations;//存储量加1
              }
              queue.put(msg);
       }

       private class LoggerThread extends Thread {
              public void run() {
                     try {
                            while (true) {
                                   try {
                                          synchronized (LogService.this) {
                                                 // 由于 queue 未同步，所以这里不能使用queue.size
                                                 //if (isShutdown && queue.size() == 0)

                                                 // 如果已关闭，且缓存中的日志信息都已写入，则退出日志线程
                                                 if (isShutdown && reservations == 0)
                                                        break;
                                          }
                                          String msg = queue.take();
                                          synchronized (LogService.this) {
                                                 --reservations;
                                          }
                                          writer.println(msg);
                                   } catch (InterruptedException e) { /* 重试 */
                                   }
                            }
                     } finally {
                            writer.close();
                     }
              }
       }
}
```

注意：通过原子方式来检查关闭请求，并且有条件地递增一个计数器来“保持”提提交消息的权利

## 2、关闭ExecutorService
   
shutdown()：启动一次顺序关闭，执行完以前提交的任务，没有执行完的任务继续执行完
   
shutdownNow()：试图停止所有正在执行的任务（向它们发出interrupt操作语法，无法保证能够停止正在处理的任务线程，但是会尽力尝试），并暂停处理正在等待的任务，并返回等待执行的任务列表。
   
ExecutorService已关闭，再向它提交任务时会抛RejectedExecutionException异常 

## 3、毒丸对象

一种关闭生产者消费者服务的方式就是使用“毒丸”对象：“

毒丸”是指一个放在队列上的对象，其含义是：“当得到这个对象时，立即停止”，

当生产者在提交了“毒丸”对象之后，将不会再提交任何工作；消费者在获取到“毒丸”后关闭任务。

“毒丸”只适用于FIFO队列，且生产者和消费者数量是已知的。

## 4、只执行一次的服务
   
如果某个方法需要处理一批任务，并且当所有任务都处理完成后才返回，

那么可以通过一次私有的Executor来简化服务的生命周期管理，其中该Executor的生命周期是由这个方法来控制的。

```java
boolean checkMail(Set<String> hosts, long timeout, TimeUnit unit)
        throws InterruptedException {
ExecutorService exec = Executors.newCachedThreadPool();
//这里不能使用 volatile hasNewMail，因为还需要在匿名内中修改
    final AtomicBoolean hasNewMail = new AtomicBoolean(false);
    try {
        for (final String host : hosts)//循环检索每台主机
            exec.execute(new Runnable() {//执行任务
                public void run() {
                   if (checkMail(host))
                       hasNewMail.set(true);
                }
            });
    } finally {
        exec.shutdown();//因为ExecutorService只在这个方法中服务，所以完成后即可关闭
        exec.awaitTermination(timeout, unit);//等待任务的完成，如果超时还未完成也会返回
    }
    return hasNewMail.get();
}
```

## 5、shutdownNow 的局限性

ExecutorService中有两个关闭方法，shutdown和shutdownNow

1. shutdown方法正常关闭

2. shutdownNow关闭时会返回还未执行的任务清单，但是对于正在执行的任务可能会丢失数据，
然而我们无法通过常规的方法找出哪些任务被丢失了，这是需要任务本身执行某些检查，并找出未完整执行的任务：

如下：

```java
public class TrackingExecutor extends AbstractExecutorService {
    private final ExecutorService exec;
    private final Set<Runnable> tasksCancelledAtShutdown =
            Collections.synchronizedSet(new HashSet<Runnable>());

    public TrackingExecutor(ExecutorService exec) {
        this.exec = exec;
    }

    public List<Runnable> getCancelledTasks() {//返回被取消的任务
        if (!exec.isTerminated())//如果shutdownNow未调用或调用未完成时
            throw new IllegalStateException(/*...*/);
        return new ArrayList<Runnable>(tasksCancelledAtShutdown);
    }

    public void execute(final Runnable runnable) {
        exec.execute(new Runnable() {
            public void run() {
                try {
                    runnable.run();
                            /*参考：http://blog.csdn.net/coslay/article/details/48038795
                             * 实质上在这里会有线程安全性问题，存在着竞争条件，比如程序刚
                             * 好运行到这里，即任务任务（run方法）刚好运行完，这时外界调用
                             * 了shutdownNow()，这时下面finally块中的判断会有出错，明显示
                             * 任务已执行完成，但判断给出的是被取消了。如果要想安全，就不
                             * 应该让shutdownNow在run方法运行完成与下面判断前调用。我们要
                             * 将runnable.run()与下面的if放在一个同步块、而且还要将
                             *  shutdownNow的调用也放同步块里并且与前面要是同一个监视器锁，
                             *  这样好像就可以解决了，不知道对不能。书上也没有说能不能解决，
                             *  只是说有这个问题！但反过来想，如果真的这样同步了，那又会带
                             *  性能上的问题，因为什么所有的任务都会串形执行，这样还要
                             *  ExecutorService线程池干嘛呢？我想这就是后面作者为什么所说
                             *  这是“不可避免的竞争条件”
                             */
                } finally {
                                   //如果调用了shutdownNow且运行的任务被中断
                    if (isShutdown()
                            && Thread.currentThread().isInterrupted())
                        tasksCancelledAtShutdown.add(runnable);//记录被取消的任务
                }
            }
        });
}
// 将ExecutorService 中的其他方法委托到exec
}
```

## 6、使用stop方法终止线程 

程序中可以直接使用thread.stop()来强行终止线程，但是stop方法是很危险的，就象突然关闭计算机电源，

而不是按正常程序关机一样，可能会产生不可预料的结果，

不安全主要是：thread.stop()调用之后，创建子线程的线程就会抛出ThreadDeatherror的错误，并且会释放子线程所持有的所有锁。

一般任何进行加锁的代码块，都是为了保护数据的一致性，如果在调用thread.stop()后导致了该线程所持有的所有锁的突然释放(不可控制)，那么被保护数据就有可能呈现不一致性，
其他线程在使用这些被破坏的数据时，有可能导致一些很奇怪的应用程序错误。因此，并不推荐使用stop方法来终止线程

# 三、处理非正常线程终止

## 异常无处不在

在一个线程中启动另一个线程，另一个线程中抛出异常，如果没有捕获它，这个异常也不会传递到父线程中

任何代码都可能抛出一个RuntimeException。每当调用另一个方法时，都要对它的行为保持怀疑，不要盲目地认为它一定会正常返回，或者一定会抛出在方法原型中声明的某个已检查异常

```java
//如果任务抛出了一个运行时异常，它将允许线程终结，但是会首先通知框架：线程已经终结
public void run() {//工作者线程的实现
    Throwable thrown = null;
    try {
        while (!isInterrupted())
            runTask(getTaskFromWorkQueue());
    } catch (Throwable e) {//为了安全，捕获的所有异常
        thrown = e;//保留异常信息
    } finally {
        threadExited(this, thrown);// 重新将异常抛给框架后终结工作线程
    }
}
```


## 未捕获异常的线程

在Thread API中提供了UncaughtExceptionHandler，它能检测出某个线程由于未捕获的异常而终结的情况
   
在运行时间较长的应用程序中，通常会为所有的未捕获异常指定同一个异常处理器，并且该处理器至少会将异常信息记录到日志中。

导致线程提前死亡的主要原因是RuntimeException。它们不会在调用栈中逐层传递，而是默认地在控制台中输出堆栈追踪信息，并终止线程。

在任务处理线程的生命周期中，将通过某种抽象机制来调用许多未知代码，我们应该对这些线程中执行的代码能否表现出正确的行为保持怀疑，
应该在try-catch快或者try-finally快中调用这些任务，确保框架能够知道线程的非正常退出情况

在运行时间较长的应用程序中，通常会为所有线程的未捕获异常指定同一个异常处理器，并且该处理器至少会将异常信息记录到日志中。

要为线程池中的所有线程设计一个UncaughtExceptionHandler，需要为ThreadPoolExecutor的构造函数提供一个ThreadFactory。
与所有的线程操控一样，只有线程的所有者能够改变线程的UncaughtExceptionHandle。

只有通过execute提交的任务，才能将它抛出的异常交给未捕获异常处理器，但是通过submit提交的任务，却只能将异常作为任务返回状态的一部分。
如果一个由submit提交的任务由于抛出异常而结束，那么这个异常将被Future.get封装在ExecutionException中重新抛出。

```java
public class UEHLogger implements Thread.UncaughtExceptionHandler {
    public void uncaughtException(Thread t, Throwable e) {
        Logger logger = Logger.getAnonymousLogger();
        logger.log(Level.SEVERE, "Thread terminated with exception: " + t.getName(), e);
    }
}
```

# 四、处理 JVM 关闭

## JVM关闭

Jvm既可以正常关闭，也可以强行关闭。

关闭钩子是指通过Runtime.addShutdownHook注册的但尚未开始的线程。

关闭钩子可以用来实现服务或者应用程序清理工作

应该对所有服务使用同一个关闭钩子（而不是为每个服务使用一个不同的钩子），并且在该关闭钩子中执行一系列的关闭操作，
这样确保关闭操作在单个线程中串行工作，避免因为相互依赖导致的死锁或其他意想不到的异常

## 关闭钩子

关闭钩子是指通过Runnable.addShutdownHook注册的但尚未开始的线程

JVM并不能保证关闭钩子的调用顺序

当所有的关闭钩子都执行结束时，如果runFinalizersOnExit为true，那么JVM将运行终结器（finalize），然后再停止

JVM并不会停止或中断任何在关闭时仍然运行的应用程序线程。

当JVM最终结束时，这些线程将被强行结束。如果关闭钩子或终结器没有执行完成，那么正常关闭进程“挂起”并且JVM必须被强行关闭。

当被强行关闭时，只是关闭JVM，而不会运行关闭钩子

### 钩子的本质

关闭钩子本质上是一个线程（也称为Hook线程），用来监听JVM的关闭。

通过使用Runtime的addShutdownHook(Thread hook)可以向JVM注册一个关闭钩子。

Hook线程在JVM正常关闭才会执行，在强制关闭时不会执行。

对于一个JVM中注册的多个关闭钩子它们将会并发执行，所以JVM并不能保证它的执行顺行。

当所有的Hook线程执行完毕后，如果此时runFinalizersOnExit为true，那么JVM将先运行终结器，然后停止。

### 钩子的编写要求

Hook线程会延迟JVM的关闭时间，这就要求在编写钩子过程中必须要尽可能的减少Hook线程的执行时间。

另外由于多个钩子是并发执行的，那么很可能因为代码不当导致出现竞态条件或死锁等问题，为了避免该问题，强烈建议在一个钩子中执行一系列操作。

关闭钩子应该是线程安全的

关闭钩子必须尽快退出，因为它们会延迟JVM的结束时间

```java
public void start()//通过注册关闭钩子，停止日志服务
{
    Runnable.getRuntime().addShutdownHook(new Thread(){
        public void run()
        {
            try{LogService.this.stop();}
            catch(InterruptedException ignored){}
        }
    });
}
```

### 使用场景

明白了其原理之后，也需要知道其使用场景： 

- 1、内存管理 

在某些情况下，我们需要根据当前内存的使用情况，人为的调用System.gc()来尝试回收堆内存中失效的对象。

此时就可以用到Runtime中的totalMemory()、freeMemory()等方法。

示例如下：

```java
public static void autoClean() {
    Runtime runtime = Runtime.getRuntime();
    if ((runtime.totalMemory() - runtime.freeMemory()) / (double) runtime.maxMemory() > 0.90) {
        System.out.println("执行清理工作");
    } else {
        System.out.println(runtime.freeMemory());
    }
}
```

- 2、执行命令

```java
class Test { 
   public static void main(String args[]){ 
           Runtime r = Runtime.getRuntime(); 
           Process p = null; 
           try{ 
                   p = r.exec("notepad"); 
           } catch (Exception e) { 
  
           } 
   } 
}
```

注意：通过exec（）方式执行命令时，该命令在单独的进程（Process）中。

- 3、通过Hook实现临时文件清理

```java
public void clearTemporaryFile() {
    Runtime runtime = Runtime.getRuntime();
    try {
        Thread.sleep(2000);
    } catch (InterruptedException e) {
        e.printStackTrace();
    }
    Runtime.getRuntime().addShutdownHook(new Thread(new Runnable() {
        public void run() {
            System.out.println("auto clean temporary file");
        }
    }));
}
```

## 守护线程

线程可分为两种：普通线程和守护线程。

在JVM启动时创建的所有线程中，除了主线程以外，其他的线程都是守护线程

普通线程与守护线程之间的差异仅在于当线程退出时发生的操作。当一个线程退出时，JVM会检查其他正在运行的线程，如果这些线程都是守护线程，那么JVM会正常退出操作。

当JVM停止时，所有仍然存在的守护线程都将被抛弃——既不会执行finally代码块，也不会执行回卷栈，而JVM只是直接退出

## 终结器（清理文件句柄或套接字句柄等）——避免使用
   
垃圾回收器对那些定义了finalize方法的对象会进行特殊处理：在回收器释放它们后，调用它们的finalize方法，从而确保一些持久化的资源被释放。
   
通过使用finally代码块和显式的close方法，能够比使用终结器更好地管理资源
   
例外：当需要管理对象时，并且该对象持有的资源是通过本地方法获得的

finalize方法。尽量避免使用终结器，尽可能使用finally代码块完成资源清理

# 总结

在任务，线程，服务以及应用程序等模块中的生命周期结束问题，可能会增加他们在设计和实现时的复杂性。

Java并没有提供某种抢占式的机制来取消操作或者终结线程。

而是提供了一种协作式的中断机制来实现取消操作，这要依赖于如何构建取消操作的协议，以及能否遵循这些协议。

通过使用FutureTask和Executor框架，可以帮助我们构建可以取消的任务和服务。

# 参考资料

《JCIP-125》

https://blog.csdn.net/tidu2chengfo/article/details/74906265

https://blog.csdn.net/tidu2chengfo/article/details/75042208

https://blog.csdn.net/tidu2chengfo/article/details/75093290

https://blog.csdn.net/androiddevelop/article/details/27299357

[第七章：取消与关闭——Java并发编程实战](https://www.cnblogs.com/HectorHou/p/6034274.html)

[并发编程 10—— 任务取消 之 关闭 ExecutorService](https://www.cnblogs.com/xingele0917/p/4055037.html)

[java并发编程（六）取消与关闭](http://www.aichengxu.com/java/9023393.htm)

https://blog.csdn.net/u010199866/article/details/82668417

* any list
{:toc}