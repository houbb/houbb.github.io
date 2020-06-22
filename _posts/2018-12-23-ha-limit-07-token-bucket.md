---
layout: post
title: 高可用之限流-07-token bucket 令牌桶算法
date: 2018-12-23 13:55:13 +0800
categories: [Distributed]
tags: [distributed, ha, limit, sh]
published: true
---

# 令牌桶算法

令牌桶算法是网络流量整形（Traffic Shaping）和速率限制（Rate Limiting）中最常使用的一种算法。

典型情况下，令牌桶算法用来控制发送到网络上的数据的数目，并允许突发数据的发送。

令牌桶算法的原理是系统会以一个恒定的速度往桶里放入令牌，而如果请求需要被处理，则需要先从桶里获取一个令牌，当桶里没有令牌可取时，则拒绝服务。

从原理上看，令牌桶算法和漏桶算法是相反的，一个“进水”，一个是“漏水”。

Google的Guava包中的RateLimiter类就是令牌桶算法的解决方案。

# 漏桶算法和令牌桶算法的选择

漏桶算法与令牌桶算法在表面看起来类似，很容易将两者混淆。但事实上，这两者具有截然不同的特性，且为不同的目的而使用。

漏桶算法与令牌桶算法的区别在于，漏桶算法能够强行限制数据的传输速率，令牌桶算法能够在限制数据的平均传输速率的同时还允许某种程度的突发传输。

需要注意的是，在某些情况下，漏桶算法不能够有效地使用网络资源，因为漏桶的漏出速率是固定的，所以即使网络中没有发生拥塞，漏桶算法也不能使某一个单独的数据流达到端口速率。

因此，漏桶算法对于存在突发特性的流量来说缺乏效率。而令牌桶算法则能够满足这些具有突发特性的流量。

通常，漏桶算法与令牌桶算法结合起来为网络流量提供更高效的控制。


# 算法描述与实现

## 描述

假如用户配置的平均发送速率为r，则每隔1/r秒一个令牌被加入到桶中(每秒会有r个令牌放入桶中)；

假设桶中最多可以存放b个令牌。如果令牌到达时令牌桶已经满了，那么这个令牌会被丢弃；

当一个n个字节的数据包到达时，就从令牌桶中删除n个令牌(不同大小的数据包，消耗的令牌数量不一样)，并且数据包被发送到网络；

如果令牌桶中少于n个令牌，那么不会删除令牌，并且认为这个数据包在流量限制之外(n个字节，需要n个令牌。该数据包将被缓存或丢弃)；

算法允许最长b个字节的突发，但从长期运行结果看，数据包的速率被限制成常量r。

对于在流量限制外的数据包可以以不同的方式处理：

1)它们可以被丢弃；

2)它们可以排放在队列中以便当令牌桶中累积了足够多的令牌时再传输；

3)它们可以继续发送，但需要做特殊标记，网络过载的时候将这些特殊标记的包丢弃。

## 实现

### 添加令牌的时机

我们当然不用起一个定时任务不停的向桶中添加令牌，只要在访问时记下访问时间，下次访问时计算出两次访问时间的间隔，然后向桶中补充令牌，补充的令牌数为

```java
(long) (durationMs * rate * 1.0 / 1000)
```

其中rate是每秒补充令牌数。

这里可以前傻傻的一个任务不停的执行对比起来，还是比较巧妙的。

### 初步实现

```java
import com.github.houbb.log.integration.core.Log;
import com.github.houbb.log.integration.core.LogFactory;
import com.github.houbb.rate.limit.core.core.ILimitContext;
import com.github.houbb.rate.limit.core.util.ExecutorServiceUtil;
import org.apiguardian.api.API;

import java.util.concurrent.CountDownLatch;
import java.util.concurrent.TimeUnit;
import java.util.concurrent.atomic.AtomicLong;

/**
 * 令牌桶算法
 *
 * @author houbinbin
 * Created by bbhou on 2017/9/20.
 * @since 0.0.6
 */
public class LimitTokenBucket extends LimitAdaptor {

    private static final Log LOG = LogFactory.getLog(LimitTokenBucket.class);

    /**
     * 令牌的发放速率
     * <p>
     * 每一秒发放多少。
     *
     * @since 0.0.6
     */
    private final long rate;

    /**
     * 容量
     * <p>
     * 后期暴露为可以配置
     *
     * @since 0.0.6
     */
    private final long capacity;

    /**
     * 令牌数量
     *
     * @since 0.0.6
     */
    private volatile long tokenNum;

    /**
     * 上一次的更新时间
     *
     * @since 0.0.6
     */
    private volatile long lastUpdateTime;

    /**
     * 构造器
     *
     * @param context 上下文
     * @since 0.0.4
     */
    public LimitTokenBucket(final ILimitContext context) {
        // 暂不考虑特殊输入，比如 1s 令牌少于1 的场景
        long intervalSeconds = context.timeUnit().toSeconds(context.interval());
        this.rate = context.count() / intervalSeconds;

        // 8 的数据
        this.capacity = this.rate * 8;
        // 这里可以慢慢的加，初始化设置为0
        // 这样就有一个 warmUp 的过程
        this.tokenNum = 0;
        this.lastUpdateTime = System.currentTimeMillis();
    }

    /**
     * 获取锁
     *
     * @since 0.0.5
     */
    @Override
    public synchronized boolean acquire() {

        if (tokenNum < 1) {
            // 加入令牌
            long now = System.currentTimeMillis();
            long durationMs = now - lastUpdateTime;
            long newTokenNum = (long) (durationMs * 1.0 * rate / 1000);

            LOG.debug("[Limit] new token is " + newTokenNum);
            if (newTokenNum > 0) {
                // 超过的部分将舍弃
                this.tokenNum = Math.min(newTokenNum + this.tokenNum, capacity);
                lastUpdateTime = now;
            } else {
                // 时间不够
                return false;
            }
        }

        this.tokenNum--;
        return true;
    }

}
```

## 测试

- Test.java

```java
import com.github.houbb.heaven.util.util.TimeUtil;
import com.github.houbb.log.integration.core.Log;
import com.github.houbb.log.integration.core.LogFactory;
import com.github.houbb.rate.limit.core.bs.LimitBs;
import com.github.houbb.rate.limit.core.core.ILimit;
import com.github.houbb.rate.limit.core.core.impl.LimitTokenBucket;

/**
 * <p> project: rate-limit-LimitTokenBucketTest </p>
 * <p> create on 2020/6/22 22:38 </p>
 *
 * @author binbin.hou
 * @since 0.0.6
 */
public class LimitTokenBucketTest {

    private static final Log LOG = LogFactory.getLog(LimitTokenBucket.class);

    /**
     * 2S 内最多运行 5 次
     * @since 0.0.5
     */
    private static final ILimit LIMIT = LimitBs.newInstance()
            .interval(1)
            .count(10)
            .limit(LimitTokenBucket.class)
            .build();

    static class LimitRunnable implements Runnable {
        @Override
        public void run() {
            for(int i = 0; i < 6; i++) {
                while (!LIMIT.acquire()) {
                    // 等待令牌
                    TimeUtil.sleep(100);
                }

                LOG.info("{}-{}", Thread.currentThread().getName(), i);
            }
        }
    }

    public static void main(String[] args) {
        new Thread(new LimitRunnable()).start();
    }

}
```

- 日志

```
22:47:19.084 [Thread-1] INFO  com.github.houbb.rate.limit.core.core.impl.LimitTokenBucket - Thread-1-0
22:47:19.186 [Thread-1] INFO  com.github.houbb.rate.limit.core.core.impl.LimitTokenBucket - Thread-1-1
22:47:19.286 [Thread-1] INFO  com.github.houbb.rate.limit.core.core.impl.LimitTokenBucket - Thread-1-2
22:47:19.386 [Thread-1] INFO  com.github.houbb.rate.limit.core.core.impl.LimitTokenBucket - Thread-1-3
22:47:19.486 [Thread-1] INFO  com.github.houbb.rate.limit.core.core.impl.LimitTokenBucket - Thread-1-4
22:47:19.586 [Thread-1] INFO  com.github.houbb.rate.limit.core.core.impl.LimitTokenBucket - Thread-1-5
```

相对来说令牌桶还是比较平滑的。

## 小结

令牌桶算法是网络流量整形和速率限制中最常使用的一种算法。

典型情况下，令牌桶算法用来控制发送到网络上的数据的数目，并允许突发数据的发送。

大小固定的令牌桶可自行以恒定的速率源源不断地产生令牌。如果令牌不被消耗，或者被消耗的速度小于产生的速度，令牌就会不断地增多，直到把桶填满。后面再产生的令牌就会从桶中溢出。最后桶中可以保存的最大令牌数永远不会超过桶的大小。

传送到令牌桶的数据包需要消耗令牌。不同大小的数据包，消耗的令牌数量不一样。令牌桶这种控制机制基于令牌桶中是否存在令牌来指示什么时候可以发送流量。令牌桶中的每一个令牌都代表一个字节。如果令牌桶中存在令牌，则允许发送流量；而如果令牌桶中不存在令牌，则不允许发送流量。

因此，如果突发门限被合理地配置并且令牌桶中有足够的令牌，那么流量就可以以峰值速率发送。

# 原理

ps: 原理相对枯燥，理解即可。

令牌桶是网络设备的内部存储池，而令牌则是以给定速率填充令牌桶的虚拟信息包。每个到达的令牌都会从数据队列领出相应的数据包进行发送，发送完数据后令牌被删除。

请求注解（RFC）中定义了两种令牌桶算法——单速率三色标记算法和双速率三色标记算法，其评估结果都是为报文打上红、黄、绿三色标记。

QoS会根据报文的颜色，设置报文的丢弃优先级，其中单速率三色标记比较关心报文尺寸的突发，而双速率三色标记则关注速率上的突发，两种算法都可工作于色盲模式和非色盲模式。

以下结合这两种工作模式介绍一下RFC中所描述的这两种算法。

### 1）单速率三色标记算法

网络工程师任务小组（IETF）的RFC文件定义了单速率三色标记算法，评估依据以下3个参数：承诺访问速率(CIR)，即向令牌桶中填充令牌的速率；承诺突发尺寸(CBS)，即令牌桶的容量，每次突发所允许的最大流量尺寸（注：设置的突发尺寸必须大于最大报文长度）；超额突发尺寸(EBS)。

一般采用双桶结构：C桶和E桶。Tc表示C桶中的令牌数，Te表示E桶中令牌数，两桶的总容量分别为CBS和EBS。初始状态时两桶是满的，即Tc和Te初始值分别等于CBS和EBS。令牌的产生速率是CIR，通常是先往C桶中添加令牌，等C桶满了，再往E桶中添加令牌，当两桶都被填满时，新产生的令牌将会被丢弃。

色盲模式下，假设到达的报文长度为B。若报文长度B小于C桶中的令牌数Tc，则报文被标记为绿色，且C桶中的令牌数减少B；若 Tc < B < Te，则标记为黄色，E和C桶中的令牌数均减少B；若 `B > Te`，标记为红色，两桶总令牌数都不减少。

在非色盲模式下，若报文已被标记为绿色或 `B < Tc`，则报文被标记为绿色，Tc减少B；若报文已被标记为黄色或 `Tc < B < Te`，则标记为黄色，且Te减少B；若报文已被标记为红色或 `B > Te`，则标记为红色，Tc和Te都不减少。

### 2）双速率三色标记算法

IETF的RFC文件定义了双速率三色算法，主要是根据4种流量参数来评估：CIR、CBS、峰值信息速率(PIR)，峰值突发尺寸(PBS)。前两种参数与单速率三色算法中的含义相同，PIR这个参数只在交换机上才有，路由器没有这个参数。该值必须不小于CIR的设置值，如果大于CIR，则速率限制在CIR于PRI之间的一个值。

与单速率三色标记算法不同，双速率三色标记算法的两个令牌桶C桶和P桶填充令牌的速率不同，C桶填充速率为CIR，P桶为PIR；两桶的容量分别为CBS和PBS。用Tc和Tp表示两桶中的令牌数目，初始状态时两桶是满的，即Tc和Tp初始值分别等于CBS和PBS。

色盲模式下，如果到达的报文速率大于PIR，超过Tp+Tc部分无法得到令牌，报文被标记为红色，未超过Tp+Tc而从P桶中获取令牌的报文标记为黄色，从C桶中获取令牌的报文被标记为绿色；当报文速率小于PIR，大于CIR时，报文不会得不到令牌，但超过Tp部分报文将从P桶中获取令牌，被标记为黄色报文，从C桶中获取令牌的报文被标记为绿色；当报文速率小于CIR时，报文所需令牌数不会超过Tc，只从C桶中获取令牌，所以只会被标记为绿色报文。

在非色盲模式下，如果报文已被标记为红色或者超过Tp+Tc部分无法得到令牌的报文，被标记为红色；如果标记为黄色或者超过Tc未超过Tp部分报文记为黄色；如果报文被标记为绿或未超过Tc部分报文，被标记为绿色。


# 拓展阅读

guava 源码解析

漏桶算法实现

# 参考资料

[漏桶算法&令牌桶算法理解及常用的算法](https://www.jianshu.com/p/c02899c30bbd)

[流量控制算法——漏桶算法和令牌桶算法](https://www.jianshu.com/p/36bca4ed6d17)

[Token Bucket 令牌桶算法](https://blog.csdn.net/wudaoshihun/article/details/83097341)

[华为-令牌桶算法](https://support.huawei.com/enterprise/zh/doc/EDOC1100055553/33f24bb0)

[简单分析Guava中RateLimiter中的令牌桶算法的实现](https://my.oschina.net/guanhe/blog/1921116)

[网络拥塞及其对策](https://support.huawei.com/enterprise/zh/doc/EDOC1100055553/2d84bee8)

[令牌桶算法限流](https://www.cnblogs.com/cjsblog/p/9379516.html)

[程序员必会 | 限流限速RateLimiter](https://zhuanlan.zhihu.com/p/110596981)

[令牌桶（TokenBucket）限流 - Java实现](https://zhuanlan.zhihu.com/p/125020537)

* any list
{:toc}