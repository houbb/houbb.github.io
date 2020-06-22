---
layout: post
title: 高可用之限流-05-slide window 滑动窗口
date: 2018-12-23 13:55:13 +0800
categories: [Distributed]
tags: [distributed, ha, limit, sh]
published: true
---


## 滑动日志-Sliding Log

滑动日志算法，利用记录下来的用户的请求时间，请求数，当该用户的一个新的请求进来时，比较这个用户在这个窗口内的请求数是否超过了限定值，超过的话就拒绝这个请求。

### 优点：

1. 避免了固定窗口算法在窗口边界可能出现的两倍流量问题

2. 由于是针对每个用户进行统计的，不会引发惊群效应

### 缺点：

1. 需要保存大量的请求日志

2. 每个请求都需要考虑该用户之前的请求情况，在分布式系统中尤其难做到

## 时间比例

滑动窗口算法，结合了固定窗口算法的低开销和滑动日志算法能够解决的边界情况。

1. 为每个窗口进行请求量的计数

2. 结合上一个窗口的请求量和这一个窗口已经经过的时间来计算出上限，以此平滑请求尖锋

举例来说，限流的上限是每分钟 10 个请求，窗口大小为 1 分钟，上一个窗口中总共处理了 6 个请求。

在假设这个新的窗口已经经过了 20 秒，那么 到目前为止允许的请求上限就是 10 - 6 * (1 - 20 / 60) = 8。

滑动窗口算法是这些算法中最实用的算法：

1. 有很好的性能

2. 避免了漏桶算法带来的饥饿问题

3. 避免了固定窗口算法的请求量突增的问题

ps: 这里是一种思路，但却不是正宗的滑动窗口算法。

## 滑动窗口

滑动窗口将固定窗口再等分为多个小的窗口。

![image](https://user-images.githubusercontent.com/18375710/85253949-c6fdc980-b491-11ea-803d-0dd8bf918fb1.png)

滑动窗口可以通过更细粒度对数据进行统计。

在限流算法里：假设我们将1s划分为4个窗口，则每个窗口对应250ms。

假设恶意用户还是在上一秒的最后一刻和下一秒的第一刻冲击服务，按照滑动窗口的原理，此时统计上一秒的最后750毫秒和下一秒的前250毫秒，这种方式能够判断出用户的访问依旧超过了1s的访问数量，因此依然会阻拦用户的访问。

### 特点

滑动窗口具有以下特点：

1、每个小窗口的大小可以均等，dubbo的默认负载均衡算法random就是通过滑动窗口设计的，可以调整每个每个窗口的大小，进行负载。

2、滑动窗口的个数及大小可以根据实际应用进行控制

### 滑动时间窗口

滑动时间窗口就是把一段时间片分为多个窗口，然后计算对应的时间落在那个窗口上，来对数据统计；

如上图其实就是即时的滑动时间窗口，随着时间流失，最开始的窗口将会失效，但是也会生成新的窗口；sentinel的就是通过这个原理来实时的限流数据统计。

关于滑动窗口，这里介绍还是比较简单，主要是大致的介绍滑动的原理以及时间窗口的设计；其实关于滑动窗口在我们学习的计算机网络中也涉及到。

## java 实现

### 伪代码

```java
全局数组 链表[]  counterList = new 链表[切分的滑动窗口数量];
//有一个定时器，在每一次统计时间段起点需要变化的时候就将索引0位置的元素移除，并在末端追加一个新元素。
int sum = counterList.Sum();
if(sum > 限流阈值) {
    return; //不继续处理请求。
}

int 当前索引 = 当前时间的秒数 % 切分的滑动窗口数量;
counterList[当前索引]++;
// do something...
```

### java 核心实现

该方法将时间直接切分为10分，然后慢慢处理。

暂时没有做更加细致的可配置化，后期考虑添加。

```java
/**
 * 全局的限制次数
 *
 * 固定时间窗口
 * @author houbinbin
 * Created by bbhou on 2017/9/20.
 * @since 0.0.5
 */
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
                this.latch = new CountDownLatch(1);
            } catch (InterruptedException e) {
                Thread.currentThread().interrupt();
                LOG.error("[Limit] fixed count is interrupt", e);
            }
        }

        // 结束
        int value = this.counter.incrementAndGet();
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

### 基于 queue 的解法

另外一种解法，个人也是比较喜欢的。

直接创建一个队列，队列大小等于限制的数量。

直接对比队首队尾的时间，从而保证固定当达到指定固定的次数时，时间一定是满足的。

ps: 这个后续在看看，不一定是滑动窗口的。

```java
public class LimitSlideWindowQueue extends LimitAdaptor {

    private static final Log LOG = LogFactory.getLog(LimitSlideWindowQueue.class);

    /**
     * 用于存放时间的队列
     * @since 0.0.3
     */
    private final BlockingQueue<Long> timeBlockQueue;

    /**
     * 当前时间
     * @since 0.0.5
     */
    private final ICurrentTime currentTime = Instances.singleton(CurrentTime.class);

    /**
     * 等待间隔时间
     * @since 0.0.5
     */
    private final long intervalInMills;

    /**
     * 构造器
     * @param context 上下文
     * @since 0.0.3
     */
    public LimitSlideWindowQueue(ILimitContext context) {
        this.timeBlockQueue = new ArrayBlockingQueue<>(context.count());
        this.intervalInMills = context.timeUnit().toMillis(context.interval());
    }

    @Override
    public synchronized void acquire() {
        long currentTimeInMills = currentTime.currentTimeInMills();

        //1. 将时间放入队列中 如果放得下，直接可以执行。反之，需要等待
        //2. 等待完成之后，将第一个元素剔除。将最新的时间加入队列中。
        boolean offerResult = timeBlockQueue.offer(currentTimeInMills);
        if(!offerResult) {
            //获取队列头的元素
            //1. 取出头节点，获取最初的时间
            //2. 将头结点移除
            long headTimeInMills = timeBlockQueue.poll();

            //当前时间和头的时间差
            long durationInMills = currentTimeInMills - headTimeInMills;
            if(intervalInMills > durationInMills) {
                //需要沉睡的时间
                long sleepInMills = intervalInMills - durationInMills;
                DateUtil.sleep(sleepInMills);
            }

            currentTimeInMills = currentTime.currentTimeInMills();
            boolean addResult = timeBlockQueue.offer(currentTimeInMills);
            LOG.debug("[Limit] acquire add result: " + addResult);
        }
    }

}
```

## 参考资料

[限流技术总结](https://blog.wangqi.love/articles/Java/%E9%99%90%E6%B5%81%E6%8A%80%E6%9C%AF%E6%80%BB%E7%BB%93.html)

[固定窗口和滑动窗口算法了解一下](https://cloud.tencent.com/developer/article/1359889)

[Sentinel之滑动时间窗口设计（二）](https://www.jianshu.com/p/05677381e155)

[限流滑动窗口](https://zhuanlan.zhihu.com/p/95794476)

[限流算法之固定窗口与滑动窗口](https://blog.csdn.net/weixin_41247920/article/details/100144184)

[限流--基于某个滑动时间窗口限流](https://blog.csdn.net/asdcls/article/details/96344783)

[【限流算法】java实现滑动时间窗口算法](https://blog.csdn.net/king0406/article/details/103129786)

[谈谈高并发系统的限流](https://www.cnblogs.com/haoxinyue/p/6792309.html)

[TCP协议的滑动窗口具体是怎样控制流量的？](https://www.zhihu.com/question/32255109)

### 漏铜令牌桶 

[漏桶算法&令牌桶算法理解及常用的算法](https://www.jianshu.com/p/c02899c30bbd)

[流量控制算法——漏桶算法和令牌桶算法](https://www.jianshu.com/p/36bca4ed6d17)

[Token Bucket 令牌桶算法](https://blog.csdn.net/wudaoshihun/article/details/83097341)

[华为-令牌桶算法](https://support.huawei.com/enterprise/zh/doc/EDOC1100055553/33f24bb0)

[简单分析Guava中RateLimiter中的令牌桶算法的实现](https://my.oschina.net/guanhe/blog/1921116)

* any list
{:toc}