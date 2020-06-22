---
layout: post
title: 高可用之限流 07-leaky bucket漏桶算法
date: 2018-12-23 13:55:13 +0800
categories: [Distributed]
tags: [distributed, ha, limit, sh]
published: true
---


# 漏桶算法

漏桶算法，又称 leaky bucket。

为了理解漏桶算法，我们看一下对于该算法的示意图：

![image](https://user-images.githubusercontent.com/18375710/85304809-c2abcd80-b4de-11ea-8d9d-2adb50e3d2fd.png)

从图中我们可以看到，整个算法其实十分简单。首先，我们有一个固定容量的桶，有水流进来，也有水流出去。

对于流进来的水来说，我们无法预计一共有多少水会流进来，也无法预计水流的速度。但是对于流出去的水来说，这个桶可以固定水流出的速率。而且，当桶满了之后，多余的水将会溢出。

我们将算法中的水换成实际应用中的请求，我们可以看到漏桶算法天生就限制了请求的速度。当使用了漏桶算法，我们可以保证接口会以一个常速速率来处理请求。

所以漏桶算法天生**不会出现临界问题**。

漏桶算法可以粗略的认为就是注水漏水过程，往桶中以一定速率流出水，以任意速率流入水，当水超过桶流量则丢弃，因为桶容量是不变的，保证了整体的速率。

### java 实现

```java
/*
 * Copyright (c)  2018. houbinbin Inc.
 * rate-acquire All rights reserved.
 */

package com.github.houbb.rate.limit.core.core.impl;

import com.github.houbb.log.integration.core.Log;
import com.github.houbb.log.integration.core.LogFactory;
import com.github.houbb.rate.limit.core.core.ILimitContext;
import org.apiguardian.api.API;

/**
 * 漏桶算法
 *
 * @author houbinbin
 * Created by bbhou on 2017/9/20.
 * @since 0.0.7
 */
@API(status = API.Status.EXPERIMENTAL)
public class LimitLeakyBucket extends LimitAdaptor {

    private static final Log LOG = LogFactory.getLog(LimitLeakyBucket.class);

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
     * 水量
     *
     * @since 0.0.6
     */
    private volatile long water;

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
    public LimitLeakyBucket(final ILimitContext context) {
        // 暂不考虑特殊输入，比如 1s 令牌少于1 的场景
        long intervalSeconds = context.timeUnit().toSeconds(context.interval());
        this.rate = context.count() / intervalSeconds;

        // 8 的数据
        this.capacity = this.rate * 8;
        // 这里可以慢慢的加，初始化设置为0
        // 这样就有一个 warmUp 的过程
        this.water = 0;
        this.lastUpdateTime = System.currentTimeMillis();
    }

    /**
     * 获取锁
     *
     * （1）未满加水：通过代码 water +=1进行不停加水的动作。
     * （2）漏水：通过时间差来计算漏水量。
     * （3）剩余水量：总水量-漏水量。
     *
     * @since 0.0.5
     */
    @Override
    public synchronized boolean acquire() {
        long now = System.currentTimeMillis();
        // 先执行漏水，计算剩余水量
        long durationMs = now - lastUpdateTime;
        long leakyWater = (long) (durationMs * 1.0 * rate / 1000);
        LOG.debug("[Limit] leaky water is " + leakyWater);
        water = Math.max(0, water - leakyWater);


        // 这里应该加一个判断，如果漏水量较小，直接返回。避免开始时，大量流量通过
        if(leakyWater < 1) {
            LOG.debug("[Limit] leaky water is too small!");
            return false;
        }

        if ((water + 1) < capacity) {
            // 尝试加水,并且水还未满
            water++;

            lastUpdateTime = now;
            return true;
        } else {
            // 水满，拒绝加水
            LOG.debug("[Limit] leaky water is has been full!");
            return false;
        }
    }

}
```

和令牌桶核心的不同，是出的速度实际上是固定的。

不会像令牌同时可以消费多个的情况。

当水桶满时，和令牌满是类似的，直接返回 false。

### 测试

```java
public class LimitLeakyBucketTest {

    private static final Log LOG = LogFactory.getLog(LimitTokenBucket.class);

    /**
     * 2S 内最多运行 5 次
     * @since 0.0.5
     */
    private static final ILimit LIMIT = LimitBs.newInstance()
            .interval(1)
            .count(5)
            .limit(LimitLeakyBucket.class)
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
23:55:54.911 [Thread-1] INFO  com.github.houbb.rate.limit.core.core.impl.LimitTokenBucket - Thread-1-0
23:55:55.113 [Thread-1] INFO  com.github.houbb.rate.limit.core.core.impl.LimitTokenBucket - Thread-1-1
23:55:55.313 [Thread-1] INFO  com.github.houbb.rate.limit.core.core.impl.LimitTokenBucket - Thread-1-2
23:55:55.513 [Thread-1] INFO  com.github.houbb.rate.limit.core.core.impl.LimitTokenBucket - Thread-1-3
23:55:55.713 [Thread-1] INFO  com.github.houbb.rate.limit.core.core.impl.LimitTokenBucket - Thread-1-4
23:55:55.913 [Thread-1] INFO  com.github.houbb.rate.limit.core.core.impl.LimitTokenBucket - Thread-1-5
```

## 主要问题

因为漏桶的漏出速率是固定的，因此它对于存在突发特性的流量来说缺乏效率。

# 算法对比

## 计数器 VS 滑动窗口：

计数器算法是最简单的算法，可以看成是滑动窗口的低精度实现。

滑动窗口由于需要存储多份的计数器（每一个格子存一份），所以滑动窗口在实现上需要更多的存储空间。也就是说，如果滑动窗口的精度越高，需要的存储空间就越大。

## 漏桶算法 VS 令牌桶算法：

漏桶算法和令牌桶算法最明显的区别是令牌桶算法允许流量一定程度的突发。

因为默认的令牌桶算法，取走token是不需要耗费时间的，也就是说，假设桶内有100个token时，那么可以瞬间允许100个请求通过。

令牌桶算法由于实现简单，且允许某些流量的突发，对用户友好，所以被业界采用地较多。

当然我们需要具体情况具体分析，只有最合适的算法，没有最优的算法。

# 单点应用限流 vs 分布式集群限流

单点应用下，对应用进行限流，既能满足本服务的需求，又可以很好的保护好下游资源。

在选型上，可以采用Google Guava的RateLimiter即可。

而在多机部署场景下，对单点的限流，则不能达到最好效果，需要引入分布式限流。分布式限流的算法，依然可以采用令牌桶算法，只不过将令牌桶的发放、存储改为全局的模型。

真正实现中，可以采用redis+lua的方式，通过把逻辑放在redis端，来减少调用次数。

## lua的逻辑如下：

1，redis中存储剩余令牌的数量cur_token，和上次获取令牌的时间last_time。

2，在每次申请令牌时，可以根据(当前时间cur_time - last_time)的时间差 乘以 令牌发放速率，算出当前可用令牌数。

3，如果有剩余令牌，则准许请求通过；否则不通过。

# 拓展阅读

guava RateLimiter 源码

常见的限流组件：

Sentinel

Hystrix

resilience4j

# 参考资料

[「限流算法第四把法器：漏桶算法」](https://zhuanlan.zhihu.com/p/135889557)

[限流限速RateLimiter](https://zhuanlan.zhihu.com/p/110596981)

* any list
{:toc}