---
layout: post
title: 高可用之限流-03-Semaphore 信号量做限流
date: 2018-12-23 13:55:13 +0800
categories: [Distributed]
tags: [distributed, ha, limit, sh]
published: true
---

## 主流的限流方式

目前主要有以下几种限流方式：

- 信号量

- 计数器

- 滑动窗口

- 漏桶算法

- 令牌桶算法

- 分布式限流

## 信号量

信号量实际上就是限制系统的并发量，来达到限流的目的。

常见的用法是：创建Semaphore，指定permit的数量。

在方法开始时，调用 Semaphore.acquire() 或者 Semaphore.tryAcquire() 来获取permit，并在方法返回前，调用Semaphore.release()来返还permit。

## 核心代码实现

```java
public class LimitSemaphore extends LimitAdaptor {

    /**
     * 日志
     *
     * @since 0.0.5
     */
    private static final Log LOG = LogFactory.getLog(LimitSemaphore.class);

    /**
     * 信号量
     *
     * @since 0.0.5
     */
    private final Semaphore semaphore;

    /**
     * 构造器
     *
     * @param context 上下文
     * @since 0.0.5
     */
    public LimitSemaphore(final ILimitContext context) {
        this.semaphore = new Semaphore(context.count());
    }

    @Override
    public synchronized void acquire() {
        try {
            LOG.debug("[Limit] start acquire");
            this.semaphore.acquire(1);
            LOG.debug("[Limit] end acquire");
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
            LOG.error("[Limit] semaphore meet ex: ", e);
        }
    }

    @Override
    public void release() {
        LOG.debug("[Limit] start release");
        this.semaphore.release(1);
        LOG.debug("[Limit] end release");
    }

}
```

## 测试

我们限定每次只有一个线程可以执行核心方法，如下：

```java
public class LimitSemaphoreTest {

    private static final Log LOG = LogFactory.getLog(LimitSemaphoreTest.class);

    private static final ILimit LIMIT = LimitBs.newInstance(LimitSemaphore.class)
            .count(1)
            .build();

    static class LimitRunnable implements Runnable {
        @Override
        public void run() {
            for(int i = 0; i < 2; i++) {
                try {
                    LIMIT.acquire();
                    LOG.info("{}-{}", Thread.currentThread().getName(), i);
                    TimeUnit.SECONDS.sleep(1);
                } catch (InterruptedException e) {
                    e.printStackTrace();
                } finally {
                    LIMIT.release();
                }
            }
        }
    }

    public static void main(String[] args) {
        new Thread(new LimitRunnable()).start();
        new Thread(new LimitRunnable()).start();
    }

}
```

- 日志输出

```
13:35:37.501 [Thread-1] INFO  com.github.houbb.rate.limit.test.semaphore.LimitSemaphoreTest - Thread-1-0
13:35:38.501 [Thread-2] INFO  com.github.houbb.rate.limit.test.semaphore.LimitSemaphoreTest - Thread-2-0
13:35:39.502 [Thread-1] INFO  com.github.houbb.rate.limit.test.semaphore.LimitSemaphoreTest - Thread-1-1
13:35:40.503 [Thread-2] INFO  com.github.houbb.rate.limit.test.semaphore.LimitSemaphoreTest - Thread-2-1
```

可以看到每次只有一个线程可以执行方法。

## 小结

这种方法最为简单，但是存在很多问题。

并入并发量问题，比如控制的力度不够灵活细致等。

后续我们来看下其他的实现方式。

## 参考资料

[限流技术总结](https://blog.wangqi.love/articles/Java/%E9%99%90%E6%B5%81%E6%8A%80%E6%9C%AF%E6%80%BB%E7%BB%93.html)

* any list
{:toc}