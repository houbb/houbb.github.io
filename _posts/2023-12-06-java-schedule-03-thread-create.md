---
layout: post
title: java 原生方式线程池创建的正确方式？
date: 2023-12-06 21:01:55 +0800
categories: [Log]
tags: [log, elk, sh]
published: true
---

# 需求

我们希望指定线程池的数量，比如固定一个线程，然后往里面不断添加任务。

## 实现 1

最简单的，我们通过下面的方式

```java
ExecutorService executorService = Executors.newSingleThreadExecutor();
executorService.submit(new Runnable() {
    @Override
    public void run() {
        //todo
    }
});
```

### 坑在哪里

这个在 jdk 中的工具方法，实际上存在一个大坑。

那就是默认的创建是一个无界队列，如果任务执行的很慢，每个任务又比较占用内存，可能把内存打爆。

```java
public static ExecutorService newSingleThreadExecutor() {
    return new FinalizableDelegatedExecutorService
        (new ThreadPoolExecutor(1, 1,
                                0L, TimeUnit.MILLISECONDS,
                                new LinkedBlockingQueue<Runnable>()));
}
```

默认的队列，大小就是：

```java
/**
 * Creates a {@code LinkedBlockingQueue} with a capacity of
 * {@link Integer#MAX_VALUE}.
 */
public LinkedBlockingQueue() {
    this(Integer.MAX_VALUE);
}
```

## 改进版 V1

### 实现

吐槽一下，这种写法真的非常不优雅，写了一大堆。

但是这样才能保证队列不会一直扩大。

```java
    public static void main(String[] args) {
        int corePoolSize = 1; // 核心线程数
        int maxPoolSize = 1;  // 最大线程数
        long keepAliveTime = 0L; // 线程空闲时间
        int queueSize = 2; // 队列大小

        // 自定义线程池名字
        ThreadFactory threadFactory = new ThreadFactory() {
            @Override
            public Thread newThread(Runnable r) {
                Thread t = new Thread(r);
                t.setName("prefix-" + t.getId());
                return t;
            }
        };

        // 使用有界队列 LinkedBlockingQueue
        BlockingQueue<Runnable> queue = new LinkedBlockingQueue<>(queueSize);

        // 创建线程池
        ExecutorService executorService = new ThreadPoolExecutor(
                corePoolSize,
                maxPoolSize,
                keepAliveTime,
                TimeUnit.MILLISECONDS,
                queue,
                threadFactory
        );

        // 使用 executorService 执行任务
        for(int i = 0; i < 10; i++) {
            final int val = i;
            executorService.submit(new Runnable() {
                @Override
                public void run() {
                    System.out.println(Thread.currentThread().getName() + "-" + val);
                    try {
                        TimeUnit.MILLISECONDS.sleep(100);
                    } catch (Exception e) {
                        e.printStackTrace();
                    }
                }
            });
        }

        // 关闭线程池
//        executorService.shutdown();
    }
```

测试日志：

```
prefix-20-0
Exception in thread "main" java.util.concurrent.RejectedExecutionException: Task java.util.concurrent.FutureTask@677327b6 rejected from java.util.concurrent.ThreadPoolExecutor@14ae5a5[Running, pool size = 1, active threads = 1, queued tasks = 2, completed tasks = 0]
	at java.util.concurrent.ThreadPoolExecutor$AbortPolicy.rejectedExecution(ThreadPoolExecutor.java:2063)
	at java.util.concurrent.ThreadPoolExecutor.reject(ThreadPoolExecutor.java:830)
	at java.util.concurrent.ThreadPoolExecutor.execute(ThreadPoolExecutor.java:1379)
	at java.util.concurrent.AbstractExecutorService.submit(AbstractExecutorService.java:112)
	at org.example.CreateThreadDefineTest.main(CreateThreadDefineTest.java:39)
prefix-20-1
prefix-20-2
```

这样，当队列满的时候会直接进行拒绝。

# 定时任务

## 需求

如果一个定时执行的任务，会怎么样？

## 实现 v1

```java
public static void main(String[] args) {
    ScheduledExecutorService executorService = Executors.newSingleThreadScheduledExecutor();
    executorService.scheduleAtFixedRate(new Runnable() {
        @Override
        public void run() {
            System.out.println(System.currentTimeMillis());
            try {
                TimeUnit.SECONDS.sleep(5);
            } catch (InterruptedException e) {
                throw new RuntimeException(e);
            }
        }
    }, 1, 1, TimeUnit.MILLISECONDS);
}
```

我们本意事项 1mS 触发一次任务，不过任务执行比较慢。

这个时候，任务是直接 1ms 一次，还是等任务执行完成？

### 测试日志

测试发现，会等任务执行完成。

```
1704208560633
1704208565640
1704208570640
```

这种还好，不会导致内存爆炸。


# 拒绝时的内容进一步优化？

## 场景

上面的拒绝策略，我们可以发现并不知道什么内容被拒绝了。

## 如何自定义线程池？

在 Java 中，自定义线程池可以通过使用 `ThreadPoolExecutor` 类来实现。

`ThreadPoolExecutor` 提供了丰富的配置选项，使得你可以根据具体需求定制线程池的行为。

以下是一些关键步骤和示例代码，帮助你创建自定义的线程池：

### 1. 定义线程池参数

线程池的关键参数包括核心线程数、最大线程数、线程空闲时间、时间单位、任务队列、线程工厂和拒绝策略。

### 2. 创建线程池

使用 `ThreadPoolExecutor` 类来创建线程池。下面是一个示例代码：

```java
import java.util.concurrent.*;
import java.util.concurrent.atomic.AtomicInteger;

public class CustomThreadPool {
    public static void main(String[] args) {
        // 核心线程数
        int corePoolSize = 5;
        // 最大线程数
        int maximumPoolSize = 10;
        // 线程空闲保持时间
        long keepAliveTime = 60;
        // 时间单位
        TimeUnit unit = TimeUnit.SECONDS;
        // 任务队列
        BlockingQueue<Runnable> workQueue = new LinkedBlockingQueue<>(100);
        // 线程工厂
        ThreadFactory threadFactory = new CustomThreadFactory();
        // 拒绝策略
        RejectedExecutionHandler handler = new ThreadPoolExecutor.CallerRunsPolicy();

        // 创建线程池
        ThreadPoolExecutor threadPoolExecutor = new ThreadPoolExecutor(
                corePoolSize,
                maximumPoolSize,
                keepAliveTime,
                unit,
                workQueue,
                threadFactory,
                handler
        );

        // 提交任务
        for (int i = 0; i < 20; i++) {
            threadPoolExecutor.execute(new Task());
        }

        // 关闭线程池
        threadPoolExecutor.shutdown();
    }

    // 自定义线程工厂
    static class CustomThreadFactory implements ThreadFactory {
        private final AtomicInteger threadNumber = new AtomicInteger(1);
        private final String namePrefix = "custom-pool-thread-";

        @Override
        public Thread newThread(Runnable r) {
            Thread t = new Thread(r, namePrefix + threadNumber.getAndIncrement());
            if (t.isDaemon()) {
                t.setDaemon(false);
            }
            if (t.getPriority() != Thread.NORM_PRIORITY) {
                t.setPriority(Thread.NORM_PRIORITY);
            }
            return t;
        }
    }

    // 任务
    static class Task implements Runnable {
        @Override
        public void run() {
            System.out.println(Thread.currentThread().getName() + " is executing task.");
            try {
                // 模拟任务执行时间
                Thread.sleep(2000);
            } catch (InterruptedException e) {
                Thread.currentThread().interrupt();
            }
        }
    }
}
```

### 3. 参数解释

- **核心线程数（corePoolSize）**: 线程池中始终保持的线程数，即使线程处于空闲状态。
- **最大线程数（maximumPoolSize）**: 线程池中允许的最大线程数。
- **线程空闲保持时间（keepAliveTime）**: 超过核心线程数的空闲线程在终止前等待新任务的最长时间。
- **时间单位（unit）**: `keepAliveTime` 参数的时间单位。
- **任务队列（workQueue）**: 用于保存等待执行的任务的队列。
- **线程工厂（threadFactory）**: 用于创建新线程的工厂。
- **拒绝策略（handler）**: 当任务无法提交时的处理策略。常用策略包括：
  - `AbortPolicy`: 抛出 `RejectedExecutionException`。
  - `CallerRunsPolicy`: 由提交任务的线程处理该任务。
  - `DiscardPolicy`: 丢弃任务，不予处理。
  - `DiscardOldestPolicy`: 丢弃队列中最老的任务，然后重新提交被拒绝的任务。

### 4. 关闭线程池

调用 `shutdown()` 方法来关闭线程池，以确保所有已提交的任务执行完毕后线程池才会终止。

如果需要立即终止，可以调用 `shutdownNow()`。

通过以上步骤，你可以创建一个功能强大的自定义线程池，并根据需要调整其行为和参数配置。

## 丢弃时，如何看到丢弃的内容呢？

要具体识别被拒绝的任务，你需要在任务中重写 `toString` 方法，以便在拒绝策略中可以输出有意义的信息。

以下是一个具体实现的示例，展示如何在任务被拒绝时输出详细信息：

### 1. 自定义任务类

首先，定义一个自定义的任务类，并重写 `toString` 方法：

```java
    // 自定义任务
    static class Task implements Runnable {
        private final int taskId;

        public Task(int taskId) {
            this.taskId = taskId;
        }

        @Override
        public void run() {
            System.out.println(Thread.currentThread().getName() + " is executing task " + taskId);
            try {
                // 模拟任务执行时间
                Thread.sleep(2000);
            } catch (InterruptedException e) {
                Thread.currentThread().interrupt();
            }
        }

        @Override
        public String toString() {
            return "Task{" + "taskId=" + taskId + '}';
        }
    }

    // 自定义拒绝策略
    static class CustomDiscardPolicy implements RejectedExecutionHandler {
        @Override
        public void rejectedExecution(Runnable r, ThreadPoolExecutor executor) {
            System.out.println("Task " + r.toString() + " is rejected.");
        }
    }
}
```

### 2. 解释

- **自定义任务类**:
  - `Task` 类实现了 `Runnable` 接口，并添加了一个 `taskId` 字段来标识每个任务。
  - 重写了 `toString` 方法，返回任务的详细信息，包括 `taskId`。

- **自定义拒绝策略**:
  - `CustomDiscardPolicy` 类实现了 `RejectedExecutionHandler` 接口。
  - 在 `rejectedExecution` 方法中，使用 `r.toString()` 打印被拒绝任务的信息。

- **示例代码说明**:
  - 创建一个线程池，核心线程数为 2，最大线程数为 4，任务队列容量为 2。
  - 提交 10 个任务到线程池，每个任务都有一个唯一的 `taskId`。
  - 由于任务数量超过了线程池和任务队列的容量，多余的任务将会被拒绝，并触发自定义的拒绝策略，输出被拒绝任务的详细信息。

这样，当任务被拒绝时，你可以在控制台看到具体是哪个任务被拒绝了，通过输出的信息可以识别每个被拒绝的任务。

# 参考资料

chat

* any list
{:toc}