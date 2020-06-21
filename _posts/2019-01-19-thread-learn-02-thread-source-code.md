---
layout: post
title: 轻松学习多线程 02-thread 源码分析
date:  2019-1-19 11:21:15 +0800
categories: [Thread]
tags: [thread, java, source-code, sh]
published: true
---

# 前言

最近想写一个多线程的程序，发现对于 java 的多线程理解还是不够深入。

所以看下源码，学习下基础知识。

# 接口

## 作用

接口作为绝对的抽象，非常便于后期拓展。

## 核心接口

- Runnable.java

```java
public
interface Runnable {
    /**
     * When an object implementing interface <code>Runnable</code> is used
     * to create a thread, starting the thread causes the object's
     * <code>run</code> method to be called in that separately executing
     * thread.
     * <p>
     * The general contract of the method <code>run</code> is that it may
     * take any action whatsoever.
     *
     * @see     java.lang.Thread#run()
     */
    public abstract void run();
}
```

- Callable.java

这个和 Runnable 的核心区别就是拥有返回值。

```java
public interface Callable<V> {
    /**
     * Computes a result, or throws an exception if unable to do so.
     *
     * @return computed result
     * @throws Exception if unable to compute a result
     */
    V call() throws Exception;
}
```

# 异常处理接口

## 说明

异步线程执行有一个非常令人困恼的事情，那就是异步出现问题了，有时候没有一点异常日志。

实际上就是很多人写代码不知道下面的接口。

## 接口

- UncaughtExceptionHandler.java

我们可以通过实现这个类，处理属于自己的异常信息。

不然异步执行时，一堆错误自己也发现不了。

```java
public interface UncaughtExceptionHandler {
    /**
     * Method invoked when the given thread terminates due to the
     * given uncaught exception.
     * <p>Any exception thrown by this method will be ignored by the
     * Java Virtual Machine.
     * @param t the thread
     * @param e the exception
     */
    void uncaughtException(Thread t, Throwable e);
}
```



# Thread 源码分析

## 声明

```java
public
class Thread implements Runnable {
```

当前类实现了前面提到的 Runnable 接口。

## 注册

```java
/* Make sure registerNatives is the first thing <clinit> does. */
private static native void registerNatives();
static {
    registerNatives();
}
```

`registerNatives` 是用来做什么的？

通过方法来看是注册 native 方法的，为什么要私有化？

## 私有变量

```java
    private char        name[];
    private int         priority;
    private Thread      threadQ;
    private long        eetop;

    /* Whether or not to single_step this thread. */
    private boolean     single_step;

    /* Whether or not the thread is a daemon thread. */
    private boolean     daemon = false;

    /* JVM state */
    private boolean     stillborn = false;

    /* What will be run. */
    private Runnable target;

    /* The group of this thread */
    private ThreadGroup group;

    /* The context ClassLoader for this thread */
    private ClassLoader contextClassLoader;

    /* The inherited AccessControlContext of this thread */
    private AccessControlContext inheritedAccessControlContext;

    /* For autonumbering anonymous threads. */
    private static int threadInitNumber;
    private static synchronized int nextThreadNum() {
        return threadInitNumber++;
    }

    /* ThreadLocal values pertaining to this thread. This map is maintained
     * by the ThreadLocal class. */
    ThreadLocal.ThreadLocalMap threadLocals = null;

    /*
     * InheritableThreadLocal values pertaining to this thread. This map is
     * maintained by the InheritableThreadLocal class.
     */
    ThreadLocal.ThreadLocalMap inheritableThreadLocals = null;

    /*
     * The requested stack size for this thread, or 0 if the creator did
     * not specify a stack size.  It is up to the VM to do whatever it
     * likes with this number; some VMs will ignore it.
     */
    private long stackSize;

    /*
     * JVM-private state that persists after native thread termination.
     */
    private long nativeParkEventPointer;

    /*
     * Thread ID
     */
    private long tid;

    /* For generating thread ID */
    private static long threadSeqNumber;

    /* Java thread status for tools,
     * initialized to indicate thread 'not yet started'
     */

    private volatile int threadStatus = 0;


    private static synchronized long nextThreadID() {
        return ++threadSeqNumber;
    }

    /**
     * The argument supplied to the current call to
     * java.util.concurrent.locks.LockSupport.park.
     * Set by (private) java.util.concurrent.locks.LockSupport.setBlocker
     * Accessed using java.util.concurrent.locks.LockSupport.getBlocker
     */
    volatile Object parkBlocker;

    /* The object in which this thread is blocked in an interruptible I/O
     * operation, if any.  The blocker's interrupt method should be invoked
     * after setting this thread's interrupt status.
     */
    private volatile Interruptible blocker;
    private final Object blockerLock = new Object();
```

- nextThreadNum() & nextThreadID()

这两个方法是类似的。

这里有个获取线程号的方法，可以看到使用了 `synchronized` 保证线程安全。

当然可以使用 AotmicXXX 系列进行性能优化。

## 优先级常量

```java
/**
  * The minimum priority that a thread can have.
  */
 public final static int MIN_PRIORITY = 1;

/**
  * The default priority that is assigned to a thread.
  */
 public final static int NORM_PRIORITY = 5;

 /**
  * The maximum priority that a thread can have.
  */
 public final static int MAX_PRIORITY = 10;
```

一些简单的常量定义。

## 状态常量

你会觉得这几个常量平淡无奇，实际上让你设计状态，你完全可以参考这里的状态设计。

经典值得反复学习和思考。

```java
    public enum State {
        /**
         * Thread state for a thread which has not yet started.
         */
        NEW,

        /**
         * Thread state for a runnable thread.  A thread in the runnable
         * state is executing in the Java virtual machine but it may
         * be waiting for other resources from the operating system
         * such as processor.
         */
        RUNNABLE,

        /**
         * Thread state for a thread blocked waiting for a monitor lock.
         * A thread in the blocked state is waiting for a monitor lock
         * to enter a synchronized block/method or
         * reenter a synchronized block/method after calling
         * {@link Object#wait() Object.wait}.
         */
        BLOCKED,

        /**
         * Thread state for a waiting thread.
         * A thread is in the waiting state due to calling one of the
         * following methods:
         * <ul>
         *   <li>{@link Object#wait() Object.wait} with no timeout</li>
         *   <li>{@link #join() Thread.join} with no timeout</li>
         *   <li>{@link LockSupport#park() LockSupport.park}</li>
         * </ul>
         *
         * <p>A thread in the waiting state is waiting for another thread to
         * perform a particular action.
         *
         * For example, a thread that has called <tt>Object.wait()</tt>
         * on an object is waiting for another thread to call
         * <tt>Object.notify()</tt> or <tt>Object.notifyAll()</tt> on
         * that object. A thread that has called <tt>Thread.join()</tt>
         * is waiting for a specified thread to terminate.
         */
        WAITING,

        /**
         * Thread state for a waiting thread with a specified waiting time.
         * A thread is in the timed waiting state due to calling one of
         * the following methods with a specified positive waiting time:
         * <ul>
         *   <li>{@link #sleep Thread.sleep}</li>
         *   <li>{@link Object#wait(long) Object.wait} with timeout</li>
         *   <li>{@link #join(long) Thread.join} with timeout</li>
         *   <li>{@link LockSupport#parkNanos LockSupport.parkNanos}</li>
         *   <li>{@link LockSupport#parkUntil LockSupport.parkUntil}</li>
         * </ul>
         */
        TIMED_WAITING,

        /**
         * Thread state for a terminated thread.
         * The thread has completed execution.
         */
        TERMINATED;
    }
```

## native 方法

一些 native 方法是直接调用的 OS 的方法，这部分源码一般是通过 C 写成的，我们暂时跳过。

```java
 /**
 * Returns a reference to the currently executing thread object.
 *
 * @return  the currently executing thread.
 */
public static native Thread currentThread();

public static native void yield();

public static native void sleep(long millis) throws InterruptedException;

public static void sleep(long millis, int nanos) {
    // 这个方法就是做了一些参数校验，难度不大。
}
```

## 初始化

所有的 Thread 构造，都是对 init 方法的封装，我们主要看下 init 方法。

```java
private void init(ThreadGroup g, Runnable target, String name,
                      long stackSize) {
        init(g, target, name, stackSize, null);
}
```

这个方法调用的是：

```java
private void init(ThreadGroup g, Runnable target, String name,
                  long stackSize, AccessControlContext acc) {
    if (name == null) {
        throw new NullPointerException("name cannot be null");
    }
    Thread parent = currentThread();
    SecurityManager security = System.getSecurityManager();
    if (g == null) {
        /* Determine if it's an applet or not */
        /* If there is a security manager, ask the security manager
           what to do. */
        if (security != null) {
            g = security.getThreadGroup();
        }
        /* If the security doesn't have a strong opinion of the matter
           use the parent thread group. */
        if (g == null) {
            g = parent.getThreadGroup();
        }
    }
    /* checkAccess regardless of whether or not threadgroup is
       explicitly passed in. */
    g.checkAccess();
    /*
     * Do we have the required permissions?
     */
    if (security != null) {
        if (isCCLOverridden(getClass())) {
            security.checkPermission(SUBCLASS_IMPLEMENTATION_PERMISSION);
        }
    }
    g.addUnstarted();
    this.group = g;
    this.daemon = parent.isDaemon();
    this.priority = parent.getPriority();
    this.name = name.toCharArray();
    if (security == null || isCCLOverridden(parent.getClass()))
        this.contextClassLoader = parent.getContextClassLoader();
    else
        this.contextClassLoader = parent.contextClassLoader;
    this.inheritedAccessControlContext =
            acc != null ? acc : AccessController.getContext();
    this.target = target;
    setPriority(priority);
    if (parent.inheritableThreadLocals != null)
        this.inheritableThreadLocals =
            ThreadLocal.createInheritedMap(parent.inheritableThreadLocals);
    /* Stash the specified stack size in case the VM cares */
    this.stackSize = stackSize;
    /* Set thread ID */
    tid = nextThreadID();
}
```

可以看到这里的优先级默认选取的是父类的优先级，当然 `setPriority(priority);` 也会有些返回判断之类的。

- setPriority(priority);

```java
public final void setPriority(int newPriority) {
    ThreadGroup g;
    checkAccess();
    if (newPriority > MAX_PRIORITY || newPriority < MIN_PRIORITY) {
        throw new IllegalArgumentException();
    }
    if((g = getThreadGroup()) != null) {
        if (newPriority > g.getMaxPriority()) {
            newPriority = g.getMaxPriority();
        }
        setPriority0(priority = newPriority);
    }
}
```

这里涉及到两个方法，`checkAccess();` 验证访问级别，`setPriority0(priority = newPriority);` 是真实的优先级实现。

setPriority0 是一个 native 方法，暂时不做深入。

- checkAccess();

```java
public final void checkAccess() {
    SecurityManager security = System.getSecurityManager();
    if (security != null) {
        security.checkAccess(this);
    }
}
```


# start() 启动方法

## 说明

首先看下文档的说明

```java
/**
 * Causes this thread to begin execution; the Java Virtual Machine
 * calls the <code>run</code> method of this thread.
 * <p>
 * The result is that two threads are running concurrently: the
 * current thread (which returns from the call to the
 * <code>start</code> method) and the other thread (which executes its
 * <code>run</code> method).
 * <p>
 * It is never legal to start a thread more than once.
 * In particular, a thread may not be restarted once it has completed
 * execution.
 *
 * @exception  IllegalThreadStateException  if the thread was already
 *               started.
 * @see        #run()
 * @see        #stop()
 */

```

其实这个就是以前常问的：start() 才是真正的启动一个 thread 的方法，而 run() 实际上不是。

这里也说明了启动 2 次是非法的，执行两次会怎么样？

其实文档中也提到了，会抛出异常：`IllegalThreadStateException`

## 代码

这个方法通过 `synchronized` 保证线程安全性。

```java
public synchronized void start() {
    /**
     * This method is not invoked for the main method thread or "system"
     * group threads created/set up by the VM. Any new functionality added
     * to this method in the future may have to also be added to the VM.
     *
     * A zero status value corresponds to state "NEW".
     */
    if (threadStatus != 0)
            throw new IllegalThreadStateException();
    // 这里就是上面提到的，启用 2 次，直接报错。

    /* Notify the group that this thread is about to be started
     * so that it can be added to the group's list of threads
     * and the group's unstarted count can be decremented. */
    group.add(this);
    // 这里是将当前的线程加入到线程组之中

    boolean started = false;
    try {
        start0();   // 这里是一个 native 的方法

        started = true;
    } finally {
        try {
            if (!started) {
                group.threadStartFailed(this);
            }
        } catch (Throwable ignore) {
            /* do nothing. If start0 threw a Throwable then
              it will be passed up the call stack */
        }
    }
}
```

看到这里觉得挺可惜的，如果只看 java 源码，实际很多东西还是看不到。

再往下看，涉及到更多的是 OS 底层的原理。

Windows 和 Linux 可能也有差异，最重要的大概是理解思想，并且学以致用吧。

# stop()

这个方法看了一下，发现 JDK 中都是废弃的。

我们一起看一下核心方法 `public final synchronized void stop(Throwable obj)`

## 文档

其实关闭之前，肯定要进行安全检查，不然乱关闭就彻底乱套了。

还可能出现一些异常，比如 `SecurityException` 和 `NullPointerException`。

这里也提到，是允许关闭一个还没有开始的线程的。当然这当做一道面试题，实际也没啥意义。浪费时间。

```java
    /**
     * Forces the thread to stop executing.
     * <p>
     * If there is a security manager installed, the <code>checkAccess</code>
     * method of this thread is called, which may result in a
     * <code>SecurityException</code> being raised (in the current thread).
     * <p>
     * If this thread is different from the current thread (that is, the current
     * thread is trying to stop a thread other than itself) or
     * <code>obj</code> is not an instance of <code>ThreadDeath</code>, the
     * security manager's <code>checkPermission</code> method (with the
     * <code>RuntimePermission("stopThread")</code> argument) is called in
     * addition.
     * Again, this may result in throwing a
     * <code>SecurityException</code> (in the current thread).
     * <p>
     * If the argument <code>obj</code> is null, a
     * <code>NullPointerException</code> is thrown (in the current thread).
     * <p>
     * The thread represented by this thread is forced to stop
     * whatever it is doing abnormally and to throw the
     * <code>Throwable</code> object <code>obj</code> as an exception. This
     * is an unusual action to take; normally, the <code>stop</code> method
     * that takes no arguments should be used.
     * <p>
     * It is permitted to stop a thread that has not yet been started.
     * If the thread is eventually started, it immediately terminates.
     *
     * @param      obj   the Throwable object to be thrown.
     * @exception  SecurityException  if the current thread cannot modify
     *               this thread.
     * @throws     NullPointerException if obj is <tt>null</tt>.
     * @see        #interrupt()
     * @see        #checkAccess()
     * @see        #run()
     * @see        #start()
     * @see        #stop()
     * @see        SecurityManager#checkAccess(Thread)
     * @see        SecurityManager#checkPermission
     * @deprecated This method is inherently unsafe.  See {@link #stop()}
     *        for details.  An additional danger of this
     *        method is that it may be used to generate exceptions that the
     *        target thread is unprepared to handle (including checked
     *        exceptions that the thread could not possibly throw, were it
     *        not for this method).
     *        For more information, see
     *        <a href="{@docRoot}/../technotes/guides/concurrency/threadPrimitiveDeprecation.html">Why
     *        are Thread.stop, Thread.suspend and Thread.resume Deprecated?</a>.
     */
```

- 方法为什么被废弃了

执行的时候可能导致一个不符合预期的异常，而且线程可能没有妥善处理。

## 源码

```java
public final synchronized void stop(Throwable obj) {
    // 空指针
    if (obj == null)
        throw new NullPointerException();

    //  安全检查
    SecurityManager security = System.getSecurityManager();
    if (security != null) {
        checkAccess();
        if ((this != Thread.currentThread()) ||
            (!(obj instanceof ThreadDeath))) {
            security.checkPermission(SecurityConstants.STOP_THREAD_PERMISSION);
        }
    }

    // A zero status value corresponds to "NEW", it can't change to
    // not-NEW because we hold the lock.
    if (threadStatus != 0) {
        resume(); // Wake up thread if it was suspended; no-op otherwise
    }

    // native 方法，暂不深入
    // The VM can handle all thread states
    stop0(obj);
}
```

- resume();

这里主要就做了 2 件事：

（1）安全检查

（2）调用 native 方法

ps: 感觉这里的各种验证太多，导致代码一点都不优雅。

```java
/**
 * Resumes a suspended thread.
 * <p>
 * First, the <code>checkAccess</code> method of this thread is called
 * with no arguments. This may result in throwing a
 * <code>SecurityException</code> (in the current thread).
 * <p>
 * If the thread is alive but suspended, it is resumed and is
 * permitted to make progress in its execution.
 *
 * @exception  SecurityException  if the current thread cannot modify this
 *               thread.
 * @see        #checkAccess
 * @see        #suspend()
 * @deprecated This method exists solely for use with {@link #suspend},
 *     which has been deprecated because it is deadlock-prone.
 *     For more information, see
 *     <a href="{@docRoot}/../technotes/guides/concurrency/threadPrimitiveDeprecation.html">Why
 *     are Thread.stop, Thread.suspend and Thread.resume Deprecated?</a>.
 */
@Deprecated
public final void resume() {
    checkAccess();
    resume0();
}
```

## exit()

这里提一下这个私有方法，使用者是无法直接调用的。

说白了就是退出之前做一下相关的清理动作。

```java
/**
 * This method is called by the system to give a Thread
 * a chance to clean up before it actually exits.
 */
private void exit() {
    if (group != null) {
        group.threadTerminated(this);
        group = null;
    }
    /* Aggressively null out all reference fields: see bug 4006245 */
    target = null;
    /* Speed the release of some of these resources */
    threadLocals = null;
    inheritableThreadLocals = null;
    inheritedAccessControlContext = null;
    blocker = null;
    uncaughtExceptionHandler = null;
}
```

简单粗暴，各种置空。

# interrupt() 打断

## 说明

这个方法我们平时遇到的还是很多的，至少经常看到一个异常：InterruptedException

## 说明

和其他方法一样，会做一些安全校验。

如果当前的方法被 sleep()/wait()/join() 等方法阻塞，那么就会清空打断状态，并且抛出 `InterruptedException` 异常。

如果被 IO 操作阻塞，将会被设置打断状态，并且抛出 `InterruptedException` 异常。

如果被 `Selector` 阻塞，则会直接返回选择操作的结果。

ps: 这样直接翻译感觉好无聊。

最好的情况就是没有遇到以上的任何一种情况，直接会设置打断状态。

```java
    /**
     * Interrupts this thread.
     *
     * <p> Unless the current thread is interrupting itself, which is
     * always permitted, the {@link #checkAccess() checkAccess} method
     * of this thread is invoked, which may cause a {@link
     * SecurityException} to be thrown.
     *
     * <p> If this thread is blocked in an invocation of the {@link
     * Object#wait() wait()}, {@link Object#wait(long) wait(long)}, or {@link
     * Object#wait(long, int) wait(long, int)} methods of the {@link Object}
     * class, or of the {@link #join()}, {@link #join(long)}, {@link
     * #join(long, int)}, {@link #sleep(long)}, or {@link #sleep(long, int)},
     * methods of this class, then its interrupt status will be cleared and it
     * will receive an {@link InterruptedException}.
     *
     * <p> If this thread is blocked in an I/O operation upon an {@link
     * java.nio.channels.InterruptibleChannel </code>interruptible
     * channel<code>} then the channel will be closed, the thread's interrupt
     * status will be set, and the thread will receive a {@link
     * java.nio.channels.ClosedByInterruptException}.
     *
     * <p> If this thread is blocked in a {@link java.nio.channels.Selector}
     * then the thread's interrupt status will be set and it will return
     * immediately from the selection operation, possibly with a non-zero
     * value, just as if the selector's {@link
     * java.nio.channels.Selector#wakeup wakeup} method were invoked.
     *
     * <p> If none of the previous conditions hold then this thread's interrupt
     * status will be set. </p>
     *
     * <p> Interrupting a thread that is not alive need not have any effect.
     *
     * @throws  SecurityException
     *          if the current thread cannot modify this thread
     *
     * @revised 6.0
     * @spec JSR-51
     */
```

## 源码

这里是在代码块中使用 `synchronized` 保证并发安全。

```java
public void interrupt() {
    if (this != Thread.currentThread())
        checkAccess();
    synchronized (blockerLock) {
        Interruptible b = blocker;
        if (b != null) {
            interrupt0();           // Just to set the interrupt flag
            b.interrupt(this);
            return;
        }
    }

    // native 方法，暂时不做深入学习。
    interrupt0();
}
```

## 是否被打断

```java
/**
 * Tests whether the current thread has been interrupted.  The
 * <i>interrupted status</i> of the thread is cleared by this method.  In
 * other words, if this method were to be called twice in succession, the
 * second call would return false (unless the current thread were
 * interrupted again, after the first call had cleared its interrupted
 * status and before the second call had examined it).
 *
 * <p>A thread interruption ignored because a thread was not alive
 * at the time of the interrupt will be reflected by this method
 * returning false.
 *
 * @return  <code>true</code> if the current thread has been interrupted;
 *          <code>false</code> otherwise.
 * @see #isInterrupted()
 * @revised 6.0
 */
public static boolean interrupted() {
    return currentThread().isInterrupted(true);
}
```

- 调用方法

依然是一个 native 方法。

```java
/**
 * Tests if some Thread has been interrupted.  The interrupted state
 * is reset or not based on the value of ClearInterrupted that is
 * passed.
 */
private native boolean isInterrupted(boolean ClearInterrupted);
```

# join() 方法

## 说明

这里提倡使用 notifyAll() 去唤醒等待的线程。

```java
/**
* Waits at most {@code millis} milliseconds for this thread to
* die. A timeout of {@code 0} means to wait forever.
*
* <p> This implementation uses a loop of {@code this.wait} calls
* conditioned on {@code this.isAlive}. As a thread terminates the
* {@code this.notifyAll} method is invoked. It is recommended that
* applications not use {@code wait}, {@code notify}, or
* {@code notifyAll} on {@code Thread} instances.
*
* @param  millis
*         the time to wait in milliseconds
*
* @throws  IllegalArgumentException
*          if the value of {@code millis} is negative
*
* @throws  InterruptedException
*          if any thread has interrupted the current thread. The
*          <i>interrupted status</i> of the current thread is
*          cleared when this exception is thrown.
*/
```

## 源码

看源码就是一个循环等待。

```java
public final synchronized void join(long millis) throws InterruptedException {
    long base = System.currentTimeMillis();
    long now = 0;
    if (millis < 0) {
        throw new IllegalArgumentException("timeout value is negative");
    }
    if (millis == 0) {
        while (isAlive()) {
            wait(0);
        }
    } else {
        while (isAlive()) {
            long delay = millis - now;
            if (delay <= 0) {
                break;
            }
            wait(delay);
            now = System.currentTimeMillis() - base;
        }
    }
}
```


## 其他方法

`public final synchronized void join(long millis, int nanos)` 这个方法是类似的。

就是对 nanos 进行了一些特殊的处理。


# 堆栈信息

## 常量

定义了一个异常堆栈的数组

```java
private static final StackTraceElement[] EMPTY_STACK_TRACE
        = new StackTraceElement[0];
```

## 打印堆栈

```java
/**
 * Prints a stack trace of the current thread to the standard error stream.
 * This method is used only for debugging.
 *
 * @see     Throwable#printStackTrace()
 */
public static void dumpStack() {
    new Exception("Stack trace").printStackTrace();
}
```

## 获取异常堆栈

```java
public StackTraceElement[] getStackTrace() {
    if (this != Thread.currentThread()) {
        // check for getStackTrace permission
        SecurityManager security = System.getSecurityManager();
        if (security != null) {
            security.checkPermission(
                SecurityConstants.GET_STACK_TRACE_PERMISSION);
        }
        // optimization so we do not call into the vm for threads that
        // have not yet started or have terminated
        if (!isAlive()) {
            return EMPTY_STACK_TRACE;
        }
        StackTraceElement[][] stackTraceArray = dumpThreads(new Thread[] {this});
        StackTraceElement[] stackTrace = stackTraceArray[0];
        // a thread that was alive during the previous isAlive call may have
        // since terminated, therefore not having a stacktrace.
        if (stackTrace == null) {
            stackTrace = EMPTY_STACK_TRACE;
        }
        return stackTrace;
    } else {
        // Don't need JVM help for current thread
        return (new Exception()).getStackTrace();
    }
}
```

## 获取所有的堆栈信息

```java
public static Map<Thread, StackTraceElement[]> getAllStackTraces() {
    // check for getStackTrace permission
    SecurityManager security = System.getSecurityManager();
    if (security != null) {
        security.checkPermission(
            SecurityConstants.GET_STACK_TRACE_PERMISSION);
        security.checkPermission(
            SecurityConstants.MODIFY_THREADGROUP_PERMISSION);
    }
    // Get a snapshot of the list of all threads
    Thread[] threads = getThreads();
    StackTraceElement[][] traces = dumpThreads(threads);
    Map<Thread, StackTraceElement[]> m = new HashMap<>(threads.length);
    for (int i = 0; i < threads.length; i++) {
        StackTraceElement[] stackTrace = traces[i];
        if (stackTrace != null) {
            m.put(threads[i], stackTrace);
        }
        // else terminated so we don't put it in the map
    }
    return m;
}
```

# 辅助方法

## 设置守护进程

```java
public final void setDaemon(boolean on) {
    checkAccess();
    if (isAlive()) {
        throw new IllegalThreadStateException();
    }

    daemon = on;
}
```

## 获取类加载器

```java
@CallerSensitive
public ClassLoader getContextClassLoader() {
    if (contextClassLoader == null)
        return null;

    SecurityManager sm = System.getSecurityManager();
    if (sm != null) {
        ClassLoader.checkClassLoaderPermission(contextClassLoader,
                                               Reflection.getCallerClass());
    }
    return contextClassLoader;
}
```

## 缓存

```java
 /** cache of subclass security audit results */
/* Replace with ConcurrentReferenceHashMap when/if it appears in a future
 * release */
private static class Caches {
    /** cache of subclass security audit results */
    static final ConcurrentMap<WeakClassKey,Boolean> subclassAudits =
        new ConcurrentHashMap<>();
    /** queue for WeakReferences to audited subclasses */
    static final ReferenceQueue<Class<?>> subclassAuditsQueue =
        new ReferenceQueue<>();
}
```

## isCCLOverridden

```java
/**
 * Verifies that this (possibly subclass) instance can be constructed
 * without violating security constraints: the subclass must not override
 * security-sensitive non-final methods, or else the
 * "enableContextClassLoaderOverride" RuntimePermission is checked.
 */
private static boolean isCCLOverridden(Class cl) {
    if (cl == Thread.class)
        return false;
    processQueue(Caches.subclassAuditsQueue, Caches.subclassAudits);
    WeakClassKey key = new WeakClassKey(cl, Caches.subclassAuditsQueue);
    Boolean result = Caches.subclassAudits.get(key);
    if (result == null) {
        result = Boolean.valueOf(auditSubclass(cl));
        Caches.subclassAudits.putIfAbsent(key, result);
    }
    return result.booleanValue();
}
```

## 添加子类方法

```java
/**
 * Performs reflective checks on given subclass to verify that it doesn't
 * override security-sensitive non-final methods.  Returns true if the
 * subclass overrides any of the methods, false otherwise.
 */
private static boolean auditSubclass(final Class subcl) {
    Boolean result = AccessController.doPrivileged(
        new PrivilegedAction<Boolean>() {
            public Boolean run() {
                for (Class cl = subcl;
                     cl != Thread.class;
                     cl = cl.getSuperclass())
                {
                    try {
                        cl.getDeclaredMethod("getContextClassLoader", new Class[0]);
                        return Boolean.TRUE;
                    } catch (NoSuchMethodException ex) {
                    }
                    try {
                        Class[] params = {ClassLoader.class};
                        cl.getDeclaredMethod("setContextClassLoader", params);
                        return Boolean.TRUE;
                    } catch (NoSuchMethodException ex) {
                    }
                }
                return Boolean.FALSE;
            }
        }
    );
    return result.booleanValue();
}
```

# 整体感受

感觉还是有一些收获的。

但是感觉有些地方，比如 native 的地方太多，收获就显得很不足。这就导致了看源码实际上只看了部分的尴尬。

很多方法（私有方法），平时一点也没接触过，只有在看源码的时候才会发现。

# 拓展阅读

[Executor 源码]()

[Executors 源码]()

# 参考资料

jdk8 源码

* any list
{:toc}