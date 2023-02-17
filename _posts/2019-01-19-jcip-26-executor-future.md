---
layout: post
title:  JCIP-26-Executor Future FutureTask
date:  2019-1-18 11:21:15 +0800
categories: [Concurrency]
tags: [thread, concurrency, future, async, sh]
published: true
excerpt: JCIP-26-Executor Future FutureTask
---

# Future

在Java中，如果需要设定代码执行的最长时间，即超时，可以用Java线程池ExecutorService类配合Future接口来实现。 

Future接口是Java标准API的一部分，在java.util.concurrent包中。Future接口是Java线程Future模式的实现，可以来进行异步计算。

Future模式可以这样来描述：我有一个任务，提交给了Future，Future替我完成这个任务。期间我自己可以去做任何想做的事情。一段时间之后，我就便可以从Future那儿取出结果。就相当于下了一张订货单，一段时间后可以拿着提订单来提货，这期间可以干别的任何事情。其中Future 接口就是订货单，真正处理订单的是Executor类，它根据Future接口的要求来生产产品。

Future接口提供方法来检测任务是否被执行完，等待任务执行完获得结果，也可以设置任务执行的超时时间。这个设置超时的方法就是实现Java程序执行超时的关键。

# Future 接口方法

Future接口是一个泛型接口，严格的格式应该是Future<V>，其中V代表了Future执行的任务返回值的类型。 

Future接口的方法介绍如下：

boolean cancel (boolean mayInterruptIfRunning) 取消任务的执行。参数指定是否立即中断任务执行，或者等等任务结束

boolean isCancelled () 任务是否已经取消，任务正常完成前将其取消，则返回 true

boolean isDone () 任务是否已经完成。需要注意的是如果任务正常终止、异常或取消，都将返回true

V get () throws InterruptedException, ExecutionException  等待任务执行结束，然后获得V类型的结果。InterruptedException 线程被中断异常， ExecutionException任务执行异常，如果任务被取消，还会抛出CancellationException

V get (long timeout, TimeUnit unit) throws InterruptedException, ExecutionException, TimeoutException 同上面的get功能一样，多了设置超时时间。参数timeout指定超时时间，uint指定时间的单位，在枚举类TimeUnit中有相关的定义。如果计算超时，将抛出TimeoutException

# Future 应用场景

在并发编程中，我们经常用到非阻塞的模型，在之前的多线程的三种实现中，不管是继承thread类还是实现runnable接口，都无法保证获取到之前的执行结果。通过实现Callback接口，并用Future可以来接收多线程的执行结果。

Future表示一个可能还没有完成的异步任务的结果，针对这个结果可以添加Callback以便在任务执行成功或失败后作出相应的操作。

# Future 相关类

![Future 结构类图](https://img-blog.csdn.net/20180606202542500)

## RunnableFuture

这个接口同时继承Future接口和Runnable接口，在成功执行run（）方法后，可以通过Future访问执行结果。这个接口都实现类是FutureTask,一个可取消的异步计算，这个类提供了Future的基本实现，后面我们的demo也是用这个类实现，它实现了启动和取消一个计算，查询这个计算是否已完成，恢复计算结果。计算的结果只能在计算已经完成的情况下恢复。如果计算没有完成，get方法会阻塞，一旦计算完成，这个计算将不能被重启和取消，除非调用runAndReset方法。
        
### FutureTask

FutureTask能用来包装一个Callable或Runnable对象，因为它实现了Runnable接口，而且它能被传递到Executor进行执行。为了提供单例类，这个类在创建自

RunnableFuture接口继承了Runnable接口和Future接口，重点，继承了两个接口，然后FutureTask类是RunnableFuture的实现类。

FutureTask的构造方法有两个，一个接受Callable对象，另一个接受runnable对象，但是接受了runnable对象之后会调用Executors.callable（）方法，将这个runnable对象转化成callable对象，具体的转化就是通过一个RunnableAdapter类生成一个callabled对象，然后这个callable对象的call方法就是runnable的run方法。那就不用想也明白了，FutureTask中的实现的run方法一定是执行的直接传进来的callable对象或者转化来的call able对象的call方法。事实也是这样。

## SchedualFuture

这个接口表示一个延时的行为可以被取消。通常一个安排好的future是定时任务SchedualedExecutorService的结果

## CompleteFuture

一个Future类是显示的完成，而且能被用作一个完成等级，通过它的完成触发支持的依赖函数和行为。当两个或多个线程要执行完成或取消操作时，只有一个能够成功。

## ForkJoinTask

基于任务的抽象类，可以通过ForkJoinPool来执行。一个ForkJoinTask是类似于线程实体，但是相对于线程实体是轻量级的。大量的任务和子任务会被ForkJoinPool池中的真实线程挂起来，以某些使用限制为代价。

# Future 入门使用案例

## 简单例子

```java
public static void main(String[] args) throws ExecutionException, InterruptedException {
    FutureTask<String> futureTask = new FutureTask<>(new Callable<String>() {
        @Override
        public String call() throws Exception {
            return "结果";
        }
    });
    ExecutorService executorService = Executors.newSingleThreadExecutor();
    executorService.submit(futureTask);
    String futureResult = futureTask.get();
    System.out.println("执行结果：" + futureResult);
    executorService.shutdown();
}
```

## 最佳实践参考

```java
ExecutorService executor = Executors.newSingleThreadExecutor();  
FutureTask<String> future =  
    new FutureTask<String>(new Callable<String>() {//使用Callable接口作为构造参数  
     public String call() {  
      //真正的任务在这里执行，这里的返回值类型为String，可以为任意类型  
    }});  
executor.execute(future);  
//在这里可以做别的任何事情  
try {  
  result = future.get(5000, TimeUnit.MILLISECONDS); //取得结果，同时设置超时执行时间为5秒。同样可以用future.get()，不设置执行超时时间取得结果  
} catch (InterruptedException e) {  
  futureTask.cancel(true);  
} catch (ExecutionException e) {  
  futureTask.cancel(true);  
} catch (TimeoutException e) {  
  futureTask.cancel(true);  
} finally {  
  executor.shutdown();  
} 
```

# FutureTask 源码

基于 jdk 1.8

```
java version "1.8.0_191"
```

## 接口定义

```java
public class FutureTask<V> implements RunnableFuture<V> 
```

- RunnableFuture

```java
public interface RunnableFuture<V> extends Runnable, Future<V>
```

## 基础属性

```java
private volatile int state;
private static final int NEW          = 0;
private static final int COMPLETING   = 1;
private static final int NORMAL       = 2;
private static final int EXCEPTIONAL  = 3;
private static final int CANCELLED    = 4;
private static final int INTERRUPTING = 5;
private static final int INTERRUPTED  = 6;
/** The underlying callable; nulled out after running */
private Callable<V> callable;
/** The result to return or exception to throw from get() */
private Object outcome; // non-volatile, protected by state reads/writes
/** The thread running the callable; CASed during run() */
private volatile Thread runner;
/** Treiber stack of waiting threads */
private volatile WaitNode waiters;

//FutureTask的内部类，get方法的等待队列
static final class WaitNode {
    volatile Thread thread;
    volatile WaitNode next;
    WaitNode() { thread = Thread.currentThread(); }
}
```

## CAS 相关初始化

```java
// Unsafe mechanics
private static final sun.misc.Unsafe UNSAFE;
private static final long stateOffset;
private static final long runnerOffset;
private static final long waitersOffset;
static {
    try {
        UNSAFE = sun.misc.Unsafe.getUnsafe();
        Class<?> k = FutureTask.class;
        stateOffset = UNSAFE.objectFieldOffset
            (k.getDeclaredField("state"));
        runnerOffset = UNSAFE.objectFieldOffset
            (k.getDeclaredField("runner"));
        waitersOffset = UNSAFE.objectFieldOffset
            (k.getDeclaredField("waiters"));
    } catch (Exception e) {
        throw new Error(e);
    }
}
```

这段代码是为了后面使用CAS而准备的。

可以这么理解：

一个java对象可以看成是一段内存，各个字段都得按照一定的顺序放在这段内存里，同时考虑到对齐要求，可能这些字段不是连续放置的，用这个`UNSAFE.objectFieldOffset()`方法能准确地告诉你某个字段相对于对象的起始内存地址的字节偏移量，因为是相对偏移量，所以它其实跟某个具体对象又没什么太大关系，跟class的定义和虚拟机的内存模型的实现细节更相关。

## 构造器

- Callable

直接初始化 Callable

```java
public FutureTask(Callable<V> callable) {
    if (callable == null)
        throw new NullPointerException();
    this.callable = callable;
}
```

- Runale

根据返回值+Runnable，初始化 Callable

```java
public FutureTask(Runnable runnable, V result) {
    this.callable = Executors.callable(runnable, result);
    this.state = NEW;       // ensure visibility of callable
}
```

## 状态判断

直接根据状态去处理。

```java
public boolean isCancelled() {
    return state >= CANCELLED;
}
public boolean isDone() {
    return state != NEW;
}
```

## cancel 取消任务

```java
public boolean cancel(boolean mayInterruptIfRunning) {
    if (!(state == NEW &&
          UNSAFE.compareAndSwapInt(this, stateOffset, NEW,
              mayInterruptIfRunning ? INTERRUPTING : CANCELLED)))
        return false;
    try {    // in case call to interrupt throws exception
        if (mayInterruptIfRunning) {
            try {
                Thread t = runner;
                if (t != null)
                    t.interrupt();
            } finally { // final state
                UNSAFE.putOrderedInt(this, stateOffset, INTERRUPTED);
            }
        }
    } finally {
        finishCompletion();
    }
    return true;
}
```

### finishCompletion()

1. 移除并且通知所有等待的线程

2. 调用 done() 方法。FutureTask 中这是个空实现。

3. 设置 callable=null

```java
/**
 * Removes and signals all waiting threads, invokes done(), and
 * nulls out callable.
 */
private void finishCompletion() {
    // assert state > COMPLETING;
    for (WaitNode q; (q = waiters) != null;) {
        if (UNSAFE.compareAndSwapObject(this, waitersOffset, q, null)) {
            for (;;) {
                Thread t = q.thread;
                if (t != null) {
                    q.thread = null;
                    LockSupport.unpark(t);
                }
                WaitNode next = q.next;
                if (next == null)
                    break;
                q.next = null; // unlink to help gc
                q = next;
            }
            break;
        }
    }
    done();
    callable = null;        // to reduce footprint
}
```

## get() 

获取结果常用的 get()。

```java
/**
 * @throws CancellationException {@inheritDoc}
 */
public V get() throws InterruptedException, ExecutionException {
    int s = state;
    if (s <= COMPLETING)
        s = awaitDone(false, 0L);
    return report(s);
}

/**
 * @throws CancellationException {@inheritDoc}
 */
public V get(long timeout, TimeUnit unit)
    throws InterruptedException, ExecutionException, TimeoutException {
    if (unit == null)
        throw new NullPointerException();
    int s = state;
    if (s <= COMPLETING &&
        (s = awaitDone(true, unit.toNanos(timeout))) <= COMPLETING)
        throw new TimeoutException();
    return report(s);
}
```

### awaitDone()

获取的时候一致在循环等待任务执行完成。

ps: 比较消耗 CPU 性能。

```java
/**
 * Awaits completion or aborts on interrupt or timeout.
 *
 * @param timed true if use timed waits
 * @param nanos time to wait, if timed
 * @return state upon completion
 */
private int awaitDone(boolean timed, long nanos)
    throws InterruptedException {
    final long deadline = timed ? System.nanoTime() + nanos : 0L;
    WaitNode q = null;
    boolean queued = false;
    for (;;) {
        /**
         *  有优先级顺序
         *  1、如果线程已中断，则直接将当前节点q从waiters中移出
         *  2、如果state已经是最终状态了，则直接返回state
         *  3、如果state是中间状态(COMPLETING),意味很快将变更过成最终状态，让出cpu时间片即可
         *  4、如果发现尚未有节点，则创建节点
         *  5、如果当前节点尚未入队，则将当前节点放到waiters中的首节点，并替换旧的waiters
         *  6、线程被阻塞指定时间后再唤醒
         *  7、线程一直被阻塞直到被其他线程唤醒
         */
        if (Thread.interrupted()) {
            removeWaiter(q);
            throw new InterruptedException();
        }
        int s = state;
        if (s > COMPLETING) {
            if (q != null)
                q.thread = null;
            return s;
        }
        else if (s == COMPLETING) // cannot time out yet
            Thread.yield();
        else if (q == null)
            q = new WaitNode();
        else if (!queued)
            queued = UNSAFE.compareAndSwapObject(this, waitersOffset,
                                                 q.next = waiters, q);
        else if (timed) {
            nanos = deadline - System.nanoTime();
            if (nanos <= 0L) {
                removeWaiter(q);
                return state;
            }
            LockSupport.parkNanos(this, nanos);
        }
        else
            LockSupport.park(this);
    }
}
```

### removeWaiter()

接下来看下removeWaiter()移除等待节点的源码：

```java
/**
 * Tries to unlink a timed-out or interrupted wait node to avoid
 * accumulating garbage.  Internal nodes are simply unspliced
 * without CAS since it is harmless if they are traversed anyway
 * by releasers.  To avoid effects of unsplicing from already
 * removed nodes, the list is retraversed in case of an apparent
 * race.  This is slow when there are a lot of nodes, but we don't
 * expect lists to be long enough to outweigh higher-overhead
 * schemes.
 */
private void removeWaiter(WaitNode node) {
    if (node != null) {
        node.thread = null;
        retry:
        for (;;) {          // restart on removeWaiter race
            for (WaitNode pred = null, q = waiters, s; q != null; q = s) {
                s = q.next;
                if (q.thread != null)
                    pred = q;
                else if (pred != null) {
                    pred.next = s;
                    if (pred.thread == null) // check for race
                        continue retry;
                }
                else if (!UNSAFE.compareAndSwapObject(this, waitersOffset,
                                                      q, s))
                    continue retry;
            }
            break;
        }
    }
}
```

### report() 

获取最后的执行结果

```java
/**
 * Returns result or throws exception for completed task.
 *
 * @param s completed state value
 */
@SuppressWarnings("unchecked")
private V report(int s) throws ExecutionException {
    Object x = outcome;
    if (s == NORMAL)
        return (V)x;
    if (s >= CANCELLED)
        throw new CancellationException();
    throw new ExecutionException((Throwable)x);
}
```

# 感受

接口的定义非常重要，便于后期在这个基础之上，进行拓展。

UnSafe LockSupport 这两个类是需要深入学习的了，不然还是无法理解底层。

CAS 乐观锁使用的比较多。

# 参考资料

《java 并发编程实战》

[java Future 接口使用方法详解](https://www.jb51.net/article/107236.htm)

[java中的 Future详解（以及ExecutorService中的各种方法](https://blog.csdn.net/u010365819/article/details/80761332)

https://blog.csdn.net/u014209205/article/details/80598209

[Java的Future机制详解](https://zhuanlan.zhihu.com/p/54459770)

* any list
{:toc}