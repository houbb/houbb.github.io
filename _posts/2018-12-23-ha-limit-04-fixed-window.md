---
layout: post
title: 高可用之限流-04-fixed window 固定窗口
date: 2018-12-23 13:55:13 +0800
categories: [Distributed]
tags: [distributed, ha, limit, sh]
published: true
---

## 固定窗口

计数器的方案比较简单。比如限制1秒钟内请求数最多为10个，每当进来一个请求，则计数器+1。

当计数器达到上限时，则触发限流。

时间每经过1秒，则重置计数器。

## 核心代码

重置计数器可以通过 loop 循环，也可以通过 CountDownLatch 达到类似的效果。

此处演示一下 CountDownLatch 的实现版本

```java
public class LimitFixedWindow extends LimitAdaptor {

    /**
     * 日志
     * @since 0.0.4
     */
    private static final Log LOG = LogFactory.getLog(LimitFixedWindow.class);

    /**
     * 上下文
     * @since 0.0.4
     */
    private final ILimitContext context;

    /**
     * 计数器
     * @since 0.0.4
     */
    private AtomicInteger counter = new AtomicInteger(0);

    /**
     * 限制状态的工具
     *
     * 避免不同线程的 notify+wait 报错问题
     *
     * @since 0.0.4
     */
    private CountDownLatch latch = new CountDownLatch(1);

    /**
     * 构造器
     * @param context 上下文
     * @since 0.0.4
     */
    public LimitFixedWindow(ILimitContext context) {
        this.context = context;

        // 定时将 count 清零。
        final long interval = context.interval();
        final TimeUnit timeUnit = context.timeUnit();

        // 任务调度
        ExecutorServiceUtil.singleSchedule(new Runnable() {
            @Override
            public void run() {
                initCounter();
            }
        }, interval, timeUnit);
    }

    @Override
    public synchronized void acquire() {

        // 超过阈值，则进行等待
        if (counter.get() >= this.context.count()) {
            try {
                LOG.debug("[Limit] fixed count need wait for notify.");
                latch.await();
                LOG.debug("[Limit] fixed count need wait end ");
            } catch (InterruptedException e) {
                Thread.currentThread().interrupt();
                LOG.error("[Limit] fixed count is interrupt", e);
            }
        }

        // 结束
        int value = this.counter.incrementAndGet();
        this.latch = new CountDownLatch(1);
        LOG.debug("[Limit] fixed count is " + value);
    }

    /**
     * 初始化计数器
     * @since 0.0.4
     */
    private void initCounter() {
        LOG.debug("[Limit] fixed count init counter start");

        // 通知可以继续执行（这里不能无脑 notify）会卡主
        if(this.counter.get() >= this.context.count()) {
            this.counter = new AtomicInteger(0);

            LOG.debug("[Limit] fixed count notify all start");
            latch.countDown();
            LOG.debug("[Limit] fixed count notify all end");
        }  else {
            this.counter = new AtomicInteger(0);
        }

    }

}
```

## 测试验证

```java
public class LimitFixedWindowTest {

    private static final Log log = LogFactory.getLog(LimitFixedWindowTest.class);

    /**
     * 1S 内最多运行 1 次
     * @since 0.0.5
     */
    private static final ILimit LIMIT = LimitBs.newInstance()
            .interval(1)
            .count(1)
            .limit(LimitFixedWindow.class)
            .build();

    static class LimitRunnable implements Runnable {
        @Override
        public void run() {
            for(int i = 0; i < 3; i++) {
                LIMIT.acquire();
                log.info("{}-{}", Thread.currentThread().getName(), i);
            }
        }
    }

    public static void main(String[] args) {
        new Thread(new LimitRunnable()).start();
        new Thread(new LimitRunnable()).start();
    }

}
```

- 日志

```
13:57:54.845 [Thread-2] INFO  com.github.houbb.rate.limit.test.core.fixed.LimitFixedWindowTest - Thread-2-0
13:57:55.825 [Thread-3] INFO  com.github.houbb.rate.limit.test.core.fixed.LimitFixedWindowTest - Thread-3-0
13:57:56.826 [Thread-2] INFO  com.github.houbb.rate.limit.test.core.fixed.LimitFixedWindowTest - Thread-2-1
13:57:57.824 [Thread-3] INFO  com.github.houbb.rate.limit.test.core.fixed.LimitFixedWindowTest - Thread-3-1
13:57:58.826 [Thread-2] INFO  com.github.houbb.rate.limit.test.core.fixed.LimitFixedWindowTest - Thread-2-2
13:57:59.826 [Thread-3] INFO  com.github.houbb.rate.limit.test.core.fixed.LimitFixedWindowTest - Thread-3-2
```

## 存在的不足

这种简单的实现存在的一个问题，就是在两个周期的临界点的位置，可能会存在请求超过阈值的情况。比如有恶意攻击的人在一个周期即将结束的时刻，发起了等于阈值的请求（假设之前的请求数为0），并且在下一个周期开始的时刻也发起等于阈值个请求。

则相当于在这接近一秒的时间内系统受到了2倍阈值的冲击，有可能导致系统挂掉。

下一节将讲述滑动窗口，解决这个问题。

## 参考资料

[限流技术总结](https://blog.wangqi.love/articles/Java/%E9%99%90%E6%B5%81%E6%8A%80%E6%9C%AF%E6%80%BB%E7%BB%93.html)

[基于循环数组实现的带滑动窗口的计数器限流算法](http://ddrv.cn/a/648913)

* any list
{:toc}