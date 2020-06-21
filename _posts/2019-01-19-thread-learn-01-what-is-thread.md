---
layout: post
title: 轻松学习多线程 01-多线程是什么
date:  2019-1-19 11:21:15 +0800
categories: [Thread]
tags: [thread, java, sh]
published: true
---

### 线程的概念

**线程** 是程序中的执行线程。Java 虚拟机允许应用程序并发地运行多个执行线程。

每个线程都有一个优先级，高优先级线程的执行优先于低优先级线程。每个线程都可以或不可以标记为一个守护程序。当某个线程中运行的代码创建一个新 Thread 对象时，该新线程的初始优先级被设定为创建线程的优先级，并且当且仅当创建线程是守护线程时，新线程才是守护程序。
当 Java 虚拟机启动时，通常都会有单个非守护线程（它通常会调用某个指定类的 main 方法）。Java 虚拟机会继续执行线程，直到下列任一情况出现时为止：

调用了 Runtime 类的 exit 方法，并且安全管理器允许退出操作发生。
非守护线程的所有线程都已停止运行，无论是通过从对 run 方法的调用中返回，还是通过抛出一个传播到 run 方法之外的异常。*【1】*


### 线程的创建

创建新执行线程有两种方法。

一种方法是将类声明为 Thread 的子类。该子类应重写 Thread 类的run 方法。

**1.将类声明为 Thread 的子类**

 
```java
public class MyThread extends Thread {
    private String info;
    public MyThread(String info) {
        this.info = info;
    }

    @Override
    public void run() {
        for(int i = 0; i < 5; i++) {
            System.out.println(info+" == "+i);
        }
    }
}
```

测试类

```java
public class Main {
    public static void main(String[] args) {
        MyThread myThread = new MyThread("线程1");
        MyThread myThread2 = new MyThread("线程2");

        myThread.start();
        myThread2.start();
    }
}
```

结果

```
线程1 == 0
线程2 == 0
线程1 == 1
线程2 == 1
线程1 == 2
线程2 == 2
线程1 == 3
线程2 == 3
线程1 == 4
线程2 == 4
```

**2.创建线程的另一种方法是声明实现 Runnable 接口的类。**

> - 该类然后实现 run 方法。然后可以分配该类的实例，在创建Thread 时作为一个参数来传递并启动。

```java
public class RunnableDemo implements Runnable{
    private String name;

    public RunnableDemo(String name) {
        this.name = name;
    }

    @Override
    public void run() {
        for(int i = 0; i < 5; i++) {
            System.out.println(this.name + " " + i);
        }
    }
}
```

测试-01

```java
public class RunnableTest {
    public static void main(String[] args) {
        Runnable runnable = new RunnableDemo("张一");
        Runnable runnable2 = new RunnableDemo("张二");
//        runnable.run();
//        runnable2.run();

        Thread thread = new Thread(runnable);
        Thread thread1 = new Thread(runnable2);
        thread.start();
        thread1.start();
    }
}
```

结果-01

```
张二 0
张二 1
张一 0
张一 1
张一 2
张一 3
张一 4
张二 2
张二 3
张二 4
```

测试-02

```java
public class RunnableTest {
    public static void main(String[] args) {
        Runnable runnable = new RunnableDemo("张一");
        Runnable runnable2 = new RunnableDemo("张二");
        runnable.run();
        runnable2.run();

//        Thread thread = new Thread(runnable);
//        Thread thread1 = new Thread(runnable2);
//        thread.start();
//        thread1.start();
    }
}
```

结果-02

```
张一 0
张一 1
张一 2
张一 3
张一 4
张二 0
张二 1
张二 2
张二 3
张二 4
```

### 线程小结

#### 1.RunnableDemo中写了2个测试，是为了说明一个问题：

**启动线程的方式——Thread对象上调用start()方法，而非run()或者别的方法。run()方法并不启动新的线程。**

#### 2.拓展（以下内容可跳过）

```java
public class Thread
extends Object
implements Runnable
```

**Thread是Runnable接口的实现类。**查看Thread源码，实现run()方法如下：

```java
/**
 * If this thread was constructed using a separate
 * <code>Runnable</code> run object, then that
 * <code>Runnable</code> object's <code>run</code> method is called;
 * otherwise, this method does nothing and returns.
 * <p>
 * Subclasses of <code>Thread</code> should override this method.
 *
 * @see     #start()
 * @see     #stop()
 * @see     #Thread(ThreadGroup, Runnable, String)
 */
@Override
public void run() {
    if (target != null) {
        target.run();
    }
}
```


#### 1.target是什么？

```java
/* What will be run. */
private Runnable target;
```

#### 2.target的初始化？

```java
 /**
 * Allocates a new {@code Thread} object. This constructor has the same
 * effect as {@linkplain #Thread(ThreadGroup,Runnable,String) Thread}
 * {@code (null, null, gname)}, where {@code gname} is a newly generated
 * name. Automatically generated names are of the form
 * {@code "Thread-"+}<i>n</i>, where <i>n</i> is an integer.
 */
public Thread() {
    init(null, null, "Thread-" + nextThreadNum(), 0);
}
```
	

```java
/**
 * Allocates a new {@code Thread} object. This constructor has the same
 * effect as {@linkplain #Thread(ThreadGroup,Runnable,String) Thread}
 * {@code (null, target, gname)}, where {@code gname} is a newly generated
 * name. Automatically generated names are of the form
 * {@code "Thread-"+}<i>n</i>, where <i>n</i> is an integer.
 *
 * @param  target
 *         the object whose {@code run} method is invoked when this thread
 *         is started. If {@code null}, this classes {@code run} method does
 *         nothing.
 */
public Thread(Runnable target) {
    init(null, target, "Thread-" + nextThreadNum(), 0);
}
```

#### 3.init是什么？

```java
/**
 * Initializes a Thread.
 *
 * @param g the Thread group
 * @param target the object whose run() method gets called
 * @param name the name of the new Thread
 * @param stackSize the desired stack size for the new thread, or
 *        zero to indicate that this parameter is to be ignored.
 * @param acc the AccessControlContext to inherit, or
 *            AccessController.getContext() if null
 */
private void init(ThreadGroup g, Runnable target, String name,
                  long stackSize, AccessControlContext acc) {
    //...
}
```

#### 4.Thread的start()方法

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
public synchronized void start() {
//...
}
```

# 相关内容

[线程-001-线程简介](http://blog.csdn.net/ryo1060732496/article/details/51151809)

[线程-002-基本的线程机制](http://blog.csdn.net/ryo1060732496/article/details/51154746)

[线程-003-线程的同步与锁](http://blog.csdn.net/ryo1060732496/article/details/51184874)

[线程-004-线程间的协作及状态迁移](http://blog.csdn.net/ryo1060732496/article/details/79377105)

### 资料引用

- 出自 Java JDK 文档

* any list
{:toc}