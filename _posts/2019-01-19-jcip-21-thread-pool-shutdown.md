---
layout: post
title:  JCIP-21-thread pool shutdown 如何优雅的关闭线程池
date:  2019-1-18 11:21:15 +0800
categories: [Concurrency]
tags: [thread, concurrency, thread, sh]
published: true
---

# 背景

前几天在和同事聊一个需求，说是有个数据查询的功能，因为涉及到多个第三方接口调用，想用线程池并行来做。

很正常的一个方案，但是上线后发现，每次服务发布的时候，这个数据查询的功能就会挂掉，后来发现是线程池没有做好关闭，这里总结一下。

关键字：线程池、shutdown、shutdownNow、interrupt

# 一、线程中断 interrupt

先补一补基础的知识：线程中断。

线程中断的含义，并不是强制把运行中的线程给“咔嚓”中断，而是把线程的中断标志位置为true，这样等线程之后阻塞（wait、join、sleep）的时候，就会抛出 InterruptedException，程序通过捕获 InterruptedException 来做一定的善后处理，然后让线程退出。

来看个例子，下面这段代码是起一个线程，打印一百行文本，打印过程中，会把线程的中断标志位置为true

```java
public static void test02() throws InterruptedException {

    Thread t = new Thread(() -> {
    for (int i = 0; i < 100; i++) {
        System.out.println("process i=" + i + "，interrupted：" + Thread.currentThread().isInterrupted());
    }
    });
    t.start();
    Thread.sleep(1);
    t.interrupt();
}
```

看看控制台的输出，发现在打印到 57 的时候，中断标志位已经成功置为true了，但是线程任然在打印，说明只是设置了中断标志位，而不是直接粗暴的把线程中断。

```
...
process i=55，interrupted：false
process i=56，interrupted：false
process i=57，interrupted：true
process i=58，interrupted：true
process i=59，interrupted：true
...
```

再看看这个示例，同样是打印一百行文本，打印过程中会判断中断标志位，如果中断就自行退出。

```java
public static void test02() throws InterruptedException {

    Thread t = new Thread(() -> {
    for (int i = 0; i < 100; i++) {
        if (Thread.interrupted()) {
            System.out.println("线程已中断，退出执行");
            break;
        }
        System.out.println("process i=" + i + "，interrupted：" + Thread.currentThread().isInterrupted());
    }
    });
    t.start();
    Thread.sleep(1);
    t.interrupt();
}
```

控制台输出如下：

```
process i=49，interrupted：false
process i=50，interrupted：false
process i=51，interrupted：false
```

# 二、线程池的关闭 shutdown 方法

了解完线程中断，再来看看线程池的关闭方法。

可以参考这个类：java.util.concurrent.ThreadPoolExecutor

关闭线程池有两个方法 shutdown() 和 shutdownNow()，具体有什么区别？

我们先来看看 shutdown() 方法

```java
    /**
     * Initiates an orderly shutdown in which previously submitted
     * tasks are executed, but no new tasks will be accepted.
     * Invocation has no additional effect if already shut down.
     *
     * <p>This method does not wait for previously submitted tasks to
     * complete execution.  Use {@link #awaitTermination awaitTermination}
     * to do that.
     *
     * @throws SecurityException {@inheritDoc}
     */
    public void shutdown() {
        final ReentrantLock mainLock = this.mainLock;
        mainLock.lock();
        try {
            checkShutdownAccess();
            advanceRunState(SHUTDOWN); // 1. 把线程池的状态设置为 SHUTDOWN
            interruptIdleWorkers(); // 2. 把空闲的工作线程置为中断
            onShutdown(); // 3. 一个空实现，暂不用关注
        } finally {
            mainLock.unlock();
        }
        tryTerminate();
    }
```

源码先看注释，翻译下：

1. 启动有序关闭会执行以前提交的任务，但不接受任何新任务。

2. 如果已经关闭，则调用不会产生额外的影响。

3. 此方法不等待活动执行的任务终止。如果需要，可使用 awaitTermination() 做到这一点。

## 2.1、第一步：advanceRunState(SHUTDOWN) 把线程池置为 SHUTDOWN

线程池状态流转如下。

调用 shutdown() 方法会把线程池的状态置为 SHUTDOWN，后续再往线程池提交任务就会被拒绝（execute() 方法中做了判断）。

![状态](https://img-blog.csdnimg.cn/c7ea33b31c0d4d5aad5c00cf8c3123a7.png)

## 2.2、第二步：interruptIdleWorkers() 把空闲的工作线程置为中断

interruptIdleWorkers() 方法遍历所有的工作线程，如果 tryLock() 成功，就把线程置为中断。

这里，如果 tryLock() 成功，说明对应的 woker 是一个空闲的，没有在执行任务的线程，如果没成功，说明对应的 worker 正在执行任务。

也就是说，这里的中断，对正在执行中的任务并没有影响。

```java
private void interruptIdleWorkers(boolean onlyOne) {
    final ReentrantLock mainLock = this.mainLock;
    mainLock.lock();
    try {
        for (Worker w : workers) {
            Thread t = w.thread;
            if (!t.isInterrupted() && w.tryLock()) {
                try {
                    t.interrupt();
                } catch (SecurityException ignore) {
                } finally {
                    w.unlock();
                }
            }
            if (onlyOne)
                break;
        }
    } finally {
        mainLock.unlock();
    }
}
```

## 2.3、 第三步：onShutdown() 一个空实现，暂不用关注

这个没啥，就是个留空的方法。

```java
/**
 * Performs any further cleanup following run state transition on
 * invocation of shutdown.  A no-op here, but used by
 * ScheduledThreadPoolExecutor to cancel delayed tasks.
 */
void onShutdown() {
}
```

## 2.4、 小结

shutdown() 方法干两件事：

1. 把线程池状态置为 SHUTDOWN 状态

2. 中断空闲线程

# 三、线程池的关闭 shutdownNow 方式

```java
/**
 * Attempts to stop all actively executing tasks, halts the
 * processing of waiting tasks, and returns a list of the tasks
 * that were awaiting execution. These tasks are drained (removed)
 * from the task queue upon return from this method.
 *
 * <p>This method does not wait for actively executing tasks to
 * terminate.  Use {@link #awaitTermination awaitTermination} to
 * do that.
 *
 * <p>There are no guarantees beyond best-effort attempts to stop
 * processing actively executing tasks.  This implementation
 * cancels tasks via {@link Thread#interrupt}, so any task that
 * fails to respond to interrupts may never terminate.
 *
 * @throws SecurityException {@inheritDoc}
 */
public List<Runnable> shutdownNow() {
    List<Runnable> tasks;
    final ReentrantLock mainLock = this.mainLock;
    mainLock.lock();
    try {
        checkShutdownAccess();
        advanceRunState(STOP); // 1：把线程池设置为STOP
        interruptWorkers(); // 2.中断工作线程
        tasks = drainQueue(); // 3.把线程池中的任务都 drain 出来
    } finally {
        mainLock.unlock();
    }
    tryTerminate();
    return tasks;
}
```


注释的意思是：

尝试停止所有正在执行的任务，暂停正在等待的任务的处理，并返回等待执行的任务列表。从该方法返回时，这些任务将从任务队列中清空(移除)。

此方法不等待活动执行的任务终止。如果需要，可使用 awaitTermination() 做到这一点。

除了尽最大努力尝试停止处理主动执行的任务之外，没有其他保证。

此实现通过 Thread.Interrupt() 取消任务，因此任何无法响应中断的任务都可能永远不会终止。

## 3.1、第一步：advanceRunState() 把线程池设置为STOP

和 shutdown() 方法不同的是，shutdownNow() 方法会把线程池的状态设置为 STOP。

## 3.2、 第二步：interruptWorkers() 中断工作线程

interruptWorkers() 如下，可以看到，和 shutdown() 方法不同的是，所有的工作线程都调用了 interrupt() 方法

```java
/**
 * Interrupts all threads, even if active. Ignores SecurityExceptions
 * (in which case some threads may remain uninterrupted).
 */
private void interruptWorkers() {
    final ReentrantLock mainLock = this.mainLock;
    mainLock.lock();
    try {
        for (Worker w : workers)
            w.interruptIfStarted();
    } finally {
        mainLock.unlock();
    }
}
```

## 3.3、第三步：drainQueue() 把线程池中的任务都 drain 出来

drainQueue() 方法如下，把阻塞队列里面等待的任务都拿出来，并返回。

关闭线程池的时候，可以基于这个特性，把返回的任务都打印出来，做个记录。

```java
/**
 * Drains the task queue into a new list, normally using
 * drainTo. But if the queue is a DelayQueue or any other kind of
 * queue for which poll or drainTo may fail to remove some
 * elements, it deletes them one by one.
 */
private List<Runnable> drainQueue() {
    BlockingQueue<Runnable> q = workQueue;
    ArrayList<Runnable> taskList = new ArrayList<Runnable>();
    q.drainTo(taskList);
    if (!q.isEmpty()) {
        for (Runnable r : q.toArray(new Runnable[0])) {
            if (q.remove(r))
                taskList.add(r);
        }
    }
    return taskList;
}
```

## 3.4、小结

shutdownNow() 方法干三件事：

- 把线程池状态置为 STOP 状态

- 中断工作线程

- 把线程池中的任务都 drain 出来并返回

# 四、实战，与 JVM 钩子配合

实际工作中，我们一般是使用 shutdown() 方法，因为它比较“温和”，会等待我们把线程池中的任务都执行完，这里也已 shutdown() 方法为例。

我们回到最开头聊到的那个 case，机器重新发布，但是线程池中还有没执行完任务，机器一关，这些任务全部被kill，怎么办呢？有什么机制能够阻塞一下，等待这个任务执行完再关闭吗？

有的，用 JVM 的钩子！

实例代码如下，一个线程池，提交了三个任务去执行，执行完得半分钟。

然后增加一个JVM的钩子，这个钩子可以简单理解为监听器，注册后，JVM在关闭的时候就会调用这个方法，调用完才会正式关闭JVM。

```java
public static void test01() throws InterruptedException {
    ThreadPoolExecutor es = new ThreadPoolExecutor(1, 1,
            60L, TimeUnit.SECONDS,
            new LinkedBlockingQueue<>());
    es.execute(new Task());
    es.execute(new Task());
    es.execute(new Task());
    Thread shutdownHook = new Thread(() -> {
        es.shutdown();
        try {
            es.awaitTermination(3, TimeUnit.MINUTES);
        } catch (InterruptedException e) {
            e.printStackTrace();
            System.out.println("等待超时，直接关闭");
        }
    });
    Runtime.getRuntime().addShutdownHook(shutdownHook);
}
```

在机器上执行，会发现，我使用 ctrl + c （注意不是ctrl + z ）关闭进程，会发现进程并没有直接关闭，线程池任然执行，一直等到线程池的任务执行完，进程才会正式退出。

![exec](https://img-blog.csdnimg.cn/85d69ad5496e4896881a82e1ee268acd.png)

本文中涉及的 Task 的源码如下。这个任务是对 stackoverflow 网站发起 10 次请求，用来模拟跑的比较慢的任务，当然这不是重点，可以忽略，有兴趣动手试一下本文代码的同学可以参考下。

```java
 public static class Task implements Runnable {

        @Override
        public void run() {
            System.out.println("task start");
            for (int i = 0; i < 10; i++) {
                httpGet();
                System.out.println("task execute " + i);
            }
            System.out.println("task finish");
        }

        private void httpGet() {

            String url = "https://stackoverflow.com/";
            String result = "";
            BufferedReader in = null;
            try {
                String urlName = url;
                URL realUrl = new URL(urlName);
                // 打开和URL之间的连接
                URLConnection conn = realUrl.openConnection();
                // 设置通用的请求属性
                conn.setRequestProperty("accept", "*/*");
                conn.setRequestProperty("connection", "Keep-Alive");
                conn.setRequestProperty("user-agent",
                        "Mozilla/4.0 (compatible; MSIE 6.0; Windows NT 5.1; SV1)");
                // 建立实际的连接
                conn.connect();
                // 获取所有响应头字段
                Map<String, List<String>> map = conn.getHeaderFields();
//                 遍历所有的响应头字段
//                for (String key : map.keySet()) {
//                    System.out.println(key + "--->" + map.get(key));
//                }
                // 定义BufferedReader输入流来读取URL的响应
                in = new BufferedReader(
                        new InputStreamReader(conn.getInputStream()));
                String line;
                while ((line = in.readLine()) != null) {
                    result += "/n" + line;
                }
            } catch (Exception e) {
                e.printStackTrace();
            }
            // 使用finally块来关闭输入流
            finally {
                try {
                    if (in != null) {
                        in.close();
                    }
                } catch (Exception ex) {
                    ex.printStackTrace();
                }
            }
//            System.out.print(result);
        }
    }
```

# 五、总结

想要优雅的关闭线程池，首先要理解线程中断的含义。

其次，关闭线程池有两种方式：shutdown() 和 shutdownNow()，二者最大的区别是 shutdown() 只是把空闲的 woker 置为中断，不影响正在运行的woker，并且会继续把待执行的任务给处理完。

shutdonwNow() 则是把所有的 woker 都置为中断，待执行的任务全部抽出并返回，日常工作中更多是使用 shutdown()。

最后，单纯的使用 shutdown() 也不靠谱，还得使用 awaitTermination() 和 JVM 的钩子，才算优雅的关闭线程池。

# 参考资料

[如何优雅的关闭线程池](https://blog.csdn.net/u011397981/article/details/131325310)

* any list
{:toc}