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

# 参考资料

chat

* any list
{:toc}