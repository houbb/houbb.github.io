---
layout: post
title:  轻松学习多线程 01-多线程入门基础知识
date:  2019-1-19 11:21:15 +0800
categories: [Thread]
tags: [thread, java, sh]
published: true
---

# Thread

In concurrent programming, there are two basic units of execution: *processes* and *threads*.
A process has a self-contained execution environment. Threads are sometimes called lightweight processes. Both processes and threads provide an execution environment, but creating a new thread requires fewer resources than creating a new process.


> [Oracle](https://docs.oracle.com/javase/tutorial/essential/concurrency/procthread.html)

> [JavaWorld](http://www.javaworld.com/article/2074217/java-concurrency/java-101--understanding-java-threads--part-1--introducing-threads-and-runnables.html)


![thread](https://raw.githubusercontent.com/houbb/resource/master/img/2016-07-02-Thread.png)

# Thread Objects

Each thread is associated with an instance of the class Thread.


## Define and Start a Thread

- Provide a **Runnable** object. The Runnable interface defines a single method, run, meant to contain the code executed in the thread.

```java
public class HelloRunnable implements Runnable {
    public void run() {
        System.out.println("Hello from a thread!");
    }

    public static void main(String args[]) {
        (new Thread(new HelloRunnable())).start();
    }
}
```

- Subclass Thread. The Thread class itself implements Runnable, though its run method does nothing.

```java
public class HelloThread extends Thread {
    public void run() {
        System.out.println("Hello from a thread!");
    }

    public static void main(String args[]) {
        (new HelloThread()).start();
    }
}
```

## Pausing Execution

Thread.sleep() causes the current thread to suspend execution for a specified period.

```java
public class SleepMessage {
    public static void main(String args[])
            throws InterruptedException {
        String importantInfo[] = {
                "Mares eat oats",
                "Does eat oats",
                "Little lambs eat ivy",
                "A kid will eat ivy too"
        };

        for (int i = 0; i < importantInfo.length; i++) {
            //Pause for 1 second
            Thread.sleep(1000);
            //Print a message
            System.out.println(importantInfo[i]);
        }
    }
}
```

- InterruptedException

Notice that main declares that it throws InterruptedException. This is an exception that sleep throws when another thread interrupts the current thread while sleep is active.

## Interrupts

An interrupt is an indication to a thread that it should stop what it is doing and do something else.

- Supporting Interruption

If the thread is frequently invoking methods that throw InterruptedException, it simply returns from the run method after it catches that exception.

```java
public class SleepMessage {
    public static void main(String args[]) {
        String importantInfo[] = {
                "Mares eat oats",
                "Does eat oats",
                "Little lambs eat ivy",
                "A kid will eat ivy too"
        };

        for (int i = 0; i < importantInfo.length; i++) {
            try {
                Thread.sleep(1000);
            } catch (InterruptedException e) {
                e.printStackTrace();
                return;
            }

            System.out.println(importantInfo[i]);
        }
    }
}
```

- The Interrupt Status Flag

The interrupt mechanism is implemented using an internal flag known as the interrupt status. Invoking Thread.interrupt sets this flag.

When a thread checks for an interrupt by invoking the static method ```Thread.interrupted()```, interrupt status is cleared.

The non-static ```isInterrupted()``` method, which is used by one thread to query the interrupt status of another, does not change the interrupt status flag.


## Join

The join method allows one thread to wait for the completion of another. If t is a Thread object whose thread is currently executing.

```java
t.join();
```

causes the current thread to pause execution until t's thread terminates.

> Simple thread demo

```java
public class SimpleThread {
    // Display a message, preceded by
    // the name of the current thread
    static void threadMessage(String message) {
        String threadName =
                Thread.currentThread().getName();
        System.out.format("%s: %s\n",
                threadName,
                message);
    }


    private static class MessageLoop
            implements Runnable {
        public void run() {
            String importantInfo[] = {
                    "Mares eat oats",
                    "Does eat oats",
                    "Little lambs eat ivy",
                    "A kid will eat ivy too"
            };
            try {
                for (String anImportantInfo : importantInfo) {
                    // Pause for 2 seconds
                    Thread.sleep(2000);
                    // Print a message
                    threadMessage(anImportantInfo);
                }
            } catch (InterruptedException e) {
                threadMessage("I wasn't done!");
            }
        }
    }


    public static void main(String args[])
            throws InterruptedException {
        // Delay, in milliseconds before
        // we interrupt MessageLoop
        // thread (default 1 minute).
        final long PATIENCE = 1000 * 60;


        threadMessage("Starting MessageLoop thread");

        long startTime = System.currentTimeMillis();
        Thread t = new Thread(new MessageLoop());
        t.start();

        threadMessage("Waiting for MessageLoop thread to finish");

        // loop until MessageLoop
        // thread exits
        while (t.isAlive()) {
            threadMessage("Still waiting...");
            // Wait maximum of 1 second
            // for MessageLoop thread
            // to finish.
            t.join(1000);

            if (((System.currentTimeMillis() - startTime) > PATIENCE)
                    && t.isAlive()) {
                threadMessage("Tired of waiting!");
                t.interrupt();
                // Shouldn't be long now
                // -- wait indefinitely
                t.join();
            }
        }

        threadMessage("Finally!");
    }

}
```

result

```
main: Starting MessageLoop thread
main: Waiting for MessageLoop thread to finish
main: Still waiting...
main: Still waiting...
Thread-0: Mares eat oats
main: Still waiting...
main: Still waiting...
Thread-0: Does eat oats
main: Still waiting...
main: Still waiting...
Thread-0: Little lambs eat ivy
main: Still waiting...
main: Still waiting...
Thread-0: A kid will eat ivy too
main: Finally!

Process finished with exit code 0
```


- Now, let's we change the **PATIENCE** of main thread wait to one second.

result

```
main: Starting MessageLoop thread
main: Waiting for MessageLoop thread to finish
main: Still waiting...
main: Tired of waiting!
Thread-0: I wasn't done!
main: Finally!

Process finished with exit code 0
```


# Synchronization

Threads communicate primarily by sharing access to fields and the objects reference fields refer to.
This form of communication is extremely efficient, but makes two kinds of errors possible: thread interference and memory consistency errors.

However, ```synchronization``` can introduce thread contention, which occurs when two or more threads try to access the same resource simultaneously
and cause the Java runtime to execute one or more threads more slowly, or even suspend their execution.


## Memory Consistency Errors

Memory consistency errors occur when different threads have inconsistent views of what should be the same data.
The causes of memory consistency errors are complex and beyond the scope of this tutorial. Fortunately, the programmer does not need a detailed understanding of these causes.

- Counter.java

```java
public class Counter {
    private int value = 0;

    public void increment() {
        value += 10;
    }

    @Override
    public String toString() {
        return "Counter{" +
                "value=" + value +
                '}';
    }
}
```

- CounterRunnable.java

```java
public class CounterRunnable implements Runnable {
    private Counter counter = new Counter();

    @Override
    public void run() {
        for(int i = 0; i < 5; i++) {
            counter.increment();
            try {
                Thread.sleep(1000);
                System.out.println(Thread.currentThread().getName()+",  " + counter);
            } catch (InterruptedException e) {
                e.printStackTrace();
            }
        }
    }
}
```

- test

```java
public static void main(String[] args) {
    Runnable runnable = new CounterRunnable();
    Thread thread = new Thread(runnable, "thread-01");
    Thread thread2 = new Thread(runnable, "thread-02");

    thread.start();
    thread2.start();
}
```

- result

```
thread-02,  Counter{value=20}
thread-01,  Counter{value=20}
thread-02,  Counter{value=40}
thread-01,  Counter{value=40}
thread-02,  Counter{value=60}
thread-01,  Counter{value=60}
thread-01,  Counter{value=80}
thread-02,  Counter{value=80}
thread-01,  Counter{value=100}
thread-02,  Counter{value=100}

Process finished with exit code 0
```

## Synchronized Methods

The Java programming language provides two basic synchronization idioms: *synchronized methods* and *synchronized statements*.
The more complex of the two, synchronized statements, are described in the next section.

- First, it is not possible for two invocations of synchronized methods on the same object to interleave.
When one thread is executing a synchronized method for an object, all other threads that invoke synchronized methods for the same object block (suspend execution)
until the first thread is done with the object.

- Second, when a synchronized method exits, it automatically establishes a happens-before relationship with any subsequent
invocation of a synchronized method for the same object. This guarantees that changes to the state of the object are visible to all threads.


- SyncCounterRunnable.java

```java
public class SyncCounterRunnable implements Runnable{
    private Counter counter = new Counter();

    @Override
    public synchronized void run() {
        for(int i = 0; i < 5; i++) {
            counter.increment();
            try {
                Thread.sleep(1000);
                System.out.println(Thread.currentThread().getName()+",  " + counter);
            } catch (InterruptedException e) {
                e.printStackTrace();
            }
        }
    }
}
```

- result

```
thread-01,  Counter{value=10}
thread-01,  Counter{value=20}
thread-01,  Counter{value=30}
thread-01,  Counter{value=40}
thread-01,  Counter{value=50}
thread-02,  Counter{value=60}
thread-02,  Counter{value=70}
thread-02,  Counter{value=80}
thread-02,  Counter{value=90}
thread-02,  Counter{value=100}

Process finished with exit code 0
```

## Synchronized Statements

Another way to create synchronized code is with synchronized statements. Unlike synchronized methods, synchronized statements must
specify the object that provides the intrinsic lock.

```
@Override
public void run() {
    for(int i = 0; i < 5; i++) {
        try {
            synchronized (this) {
                counter.increment();
                Thread.sleep(1000);
                System.out.println(Thread.currentThread().getName()+",  " + counter);
            }
        } catch (InterruptedException e) {
            e.printStackTrace();
        }
    }
}
```

- Improving concurrency

Suppose, for example, class MsLunch has two instance fields, c1 and c2, that are never used together.
All updates of these fields must be synchronized, but there's no reason to prevent an update of c1 from being interleaved
with an update of c2 — and doing so reduces concurrency by creating unnecessary blocking.
Instead of using synchronized methods or otherwise using the lock associated with this, we create two objects solely to provide locks.

```java
public class MsLunch {
    private long c1 = 0;
    private long c2 = 0;
    private Object lock1 = new Object();
    private Object lock2 = new Object();

    public void inc1() {
        synchronized(lock1) {
            c1++;
        }
    }

    public void inc2() {
        synchronized(lock2) {
            c2++;
        }
    }
}
```

## Atomic Access

In programming, an atomic action is one that effectively happens all at once. An atomic action cannot stop in the middle: it either happens completely,
or it doesn't happen at all. No side effects of an atomic action are visible until the action is complete.

There are actions you can specify that are atomic:

- Reads and writes are atomic for reference variables and for most primitive variables (all types except long and double).
- Reads and writes are atomic for all variables declared volatile (including long and double variables).


# Liveness

A concurrent application's ability to execute in a timely manner is known as its *liveness*.

## Deadlock

Deadlock describes a situation where two or more threads are blocked forever, waiting for each other. Here's an example

```java
public class DeadLock {
    static class Friend {
        private final String name;
        public Friend(String name) {
            this.name = name;
        }
        public String getName() {
            return this.name;
        }
        public synchronized void bow(Friend bower) {
            System.out.format("%s: %s"
                            + "  has bowed to me!%n",
                    this.name, bower.getName());
            bower.bowBack(this);
        }
        public synchronized void bowBack(Friend bower) {
            System.out.format("%s: %s"
                            + " has bowed back to me!%n",
                    this.name, bower.getName());
        }
    }

    public static void main(String[] args) {
        final Friend alphonse =
                new Friend("Alphonse");
        final Friend gaston =
                new Friend("Gaston");
        new Thread(new Runnable() {
            public void run() { alphonse.bow(gaston); }
        }).start();
        new Thread(new Runnable() {
            public void run() { gaston.bow(alphonse); }
        }).start();
    }
}
```

When Deadlock runs, it's extremely likely that both threads will block when they attempt to invoke bowBack. Neither block will ever end,
because each thread is waiting for the other to exit bow.

## Starvation and Livelock

- Starvation

Starvation describes a situation where a thread is unable to gain regular access to shared resources and is unable to make progress.
This happens when shared resources are made unavailable for long periods by "greedy" threads.

- Livelock

A thread often acts in response to the action of another thread. If the other thread's action is also a response to the action of another thread,
then livelock may result. As with deadlock, livelocked threads are unable to make further progress.

# 拓展阅读

> [Java实现定时任务的三种方法](http://www.360doc.com/content/14/0410/08/7823806_367676309.shtml)

> [使用java自带的定时任务ScheduledThreadPoolExecutor](http://www.cnblogs.com/yaoyuan23/p/5584058.html)

TBC...

> [多线程实战](http://ifeve.com/java-active-object/)

# Thread pool

> [Java线程池的分析和使用](http://ifeve.com/java-threadpool/)

一、线程池的必要

- 降低资源消耗。

通过重复利用已创建的线程降低线程创建和销毁造成的消耗。

- 提高响应速度。

当任务到达时，任务可以不需要的等到线程创建就能立即执行。

- 提高线程的可管理性。

线程是稀缺资源，如果无限制的创建，不仅会消耗系统资源，还会降低系统的稳定性，使用线程池可以进行统一的分配，调优和监控。

* any list
{:toc}




