---
layout: post
title:  JCIP-24-Timer 实现定时调度 
date:  2019-1-18 11:21:15 +0800
categories: [Concurrency]
tags: [thread, concurrency, thread, async, schedule, job, sh]
published: true
excerpt: JCIP-24-Timer 
---

# Timer

如果我们想定时执行一个任务，应该怎么做呢？

Timer 就是一个 Java 提供的类。

# 入门例子

## 测试代码

```java
import java.text.SimpleDateFormat;
import java.util.Date;
import java.util.Timer;
import java.util.TimerTask;

public class TimerTest {

    public static void main(String[] args) {
        Timer timer = new Timer();
        timer.schedule(new TimerTask() {
            @Override
            public void run() {
                SimpleDateFormat simpleDateFormat = new SimpleDateFormat("yyyy-MM-dd HH:mm:ss.SSS");
                String dateStr = simpleDateFormat.format(new Date());
                System.out.println(dateStr);
            }
        }, 1000, 2000);
    }

}
```

1S 钟后，每 2S 执行 TimerTask。

TimerTask 就是一个实现了 Runnable 接口的类。

## 日志

```
2019-02-20 14:35:29.753
2019-02-20 14:35:31.712
2019-02-20 14:35:33.713
2019-02-20 14:35:35.713
2019-02-20 14:35:37.714
```

# Timer 应该使用吗？

## 答案

在正式的生产环境，不应该使用 Timer。

## 原因

- Timer和TimerTask的简单组合是多线程的嘛？

不是，一个Timer内部包装了“一个Thread”和“一个Task”队列，这个队列按照一定的方式将任务排队处理，包含的线程在Timer的构造方法调用时被启动，这个Thread的run方法无限循环这个Task队列，若队列为空且没发生cancel操作，此时会一直等待，如果等待完成后，队列还是为空，则认为发生了cancel从而跳出死循环，结束任务；循环中如果发现任务需要执行的时间小于系统时间，则需要执行，那么根据任务的时间片从新计算下次执行时间，若时间片为0代表只执行一次，则直接移除队列即可。

- 但是是否能实现多线程呢？

可以，任何东西是否是多线程完全看个人意愿，多个Timer自然就是多线程的，每个Timer都有自己的线程处理逻辑，当然Timer从这里来看并不是很适合很多任务在短时间内的快速调度，至少不是很适合同一个timer上挂很多任务，在多线程的领域中我们更多是使用多线程中的：

## 任务调度的正确方式

```java
Executors.newScheduledThreadPool
```

来完成对调度队列中的线程池的处理，内部通过new ScheduledThreadPoolExecutor来创建线程池的Executor的创建，当然也可以调用：

```java
Executors.unconfigurableScheduledExecutorService
```

方法来创建一个DelegatedScheduledExecutorService其实这个类就是包装了下下scheduleExecutor，也就是这只是一个壳，英文理解就是被委派的意思，被托管的意思。

# Timer 源码

TODO...

# 拓展阅读

[quartz](https://github.com/quartz-scheduler/quartz)

# 参考资料

《java 并发编程实战》

[Java中Timer的用法](https://blog.csdn.net/imzoer/article/details/8500670)

[Java并发编程：Timer和TimerTask（转载）](https://www.cnblogs.com/dolphin0520/p/3938991.html)

[Java中使用Timer和TimerTask实现多线程](http://www.bdqn.cn/news/201305/9303.shtml)

* any list
{:toc}


