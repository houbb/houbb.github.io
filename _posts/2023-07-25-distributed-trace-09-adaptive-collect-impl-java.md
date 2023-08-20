---
layout: post
title: 分布式链路追踪-09-adaptive collect 自适应采样算法 java 实现
date:  2023-07-25 +0800
categories: [Trace]
tags: [trace, distributed, sh]
published: true
---

# Q1: 详细说明日志中的自适应采样

自适应采样（Adaptive Sampling）是一种日志记录技术，用于在应用程序或系统中收集和记录日志信息，以便更有效地管理和分析日志数据。传统的日志记录方法通常会导致大量的日志数据被生成，这可能会对存储资源和日志分析过程造成不必要的压力。

自适应采样旨在通过智能地选择要记录的日志事件，从而减少生成的日志数量，同时保留对系统行为和问题的关键洞察。

下面是自适应采样的详细说明：

1. **目标设定**：自适应采样的目标是在尽可能减少日志数据量的前提下，仍然捕获足够的信息以监测系统的状态、性能和问题。

2. **数据收集策略**：自适应采样系统会根据一些预定义的策略或规则来决定是否记录某个特定的日志事件。这些策略可以基于时间、事件频率、事件类型、关键字匹配等因素进行设置。例如，一个简单的策略可能是，只记录发生频率高于某个阈值的异常事件。

3. **实时分析和调整**：自适应采样通常需要实时地监测日志事件的发生情况并进行动态调整。如果某个特定类型的事件开始增加，采样系统可以自动提高记录该类型事件的概率，以便更好地掌握问题的发展。

4. **采样率调整**：系统可以根据需要调整采样率，即记录日志事件的频率。在低负载期间，可以降低采样率，以减少不必要的日志数据生成。在高负载或异常情况下，可以增加采样率，以便更全面地了解问题。

5. **自适应算法**：自适应采样可能使用机器学习、统计学和算法来根据历史数据和当前情况来预测哪些事件可能对系统的状态产生影响，然后根据这些预测调整采样策略。

6. **关键指标**：在自适应采样中，关键是要选择合适的指标来衡量采样效果。这可能包括已记录事件与实际问题之间的关联性、系统性能指标以及生成的日志数据量。

7. **灵活性和可配置性**：自适应采样系统通常应该具有灵活的配置选项，以便管理员可以根据实际情况进行调整。这可以包括不同类型事件的采样率、调整采样策略的频率等。

总之，自适应采样是一种使日志记录更为智能和高效的方法，可以帮助系统管理员和开发人员更好地理解系统行为，并更快地识别和解决问题。

# Q2: 自适应算法，给一个 java 实现的例子。

当然，我会很乐意为您解释每一行代码，并将解释放在注释中重新呈现给您。

```java
import java.util.HashMap;
import java.util.Map;

public class AdaptiveSampling {
    private static final int WINDOW_SIZE = 100; // 滑动窗口大小
    private static final double THRESHOLD = 0.1; // 阈值，超过该阈值则增加采样率
    private static double samplingRate = 0.1; // 初始采样率

    private static Map<String, Integer> eventCounts = new HashMap<>(); // 存储事件计数
    private static int totalCount = 0; // 总事件计数

    // 记录特定事件并根据采样率决定是否记录
    public static void logEvent(String eventName) {
        totalCount++;

        // 更新事件计数
        eventCounts.put(eventName, eventCounts.getOrDefault(eventName, 0) + 1);

        // 每当滑动窗口满了，计算事件频率
        if (totalCount % WINDOW_SIZE == 0) {
            adjustSamplingRate();
        }

        // 根据采样率决定是否记录事件
        if (Math.random() < samplingRate) {
            System.out.println("Logging event: " + eventName);
        }
    }

    // 根据事件频率调整采样率
    private static void adjustSamplingRate() {
        for (Map.Entry<String, Integer> entry : eventCounts.entrySet()) {
            double eventFrequency = (double) entry.getValue() / WINDOW_SIZE;
            if (eventFrequency > THRESHOLD) {
                samplingRate *= 2; // 增加采样率
                System.out.println("Increased sampling rate for event " + entry.getKey());
                break; // 只处理第一个超过阈值的事件
            }
        }
        // 重置事件计数
        eventCounts.clear();
    }

    public static void main(String[] args) {
        // 模拟记录事件
        for (int i = 0; i < 1000; i++) {
            logEvent("EventA");
            logEvent("EventB");
        }
    }
}
```

这个代码示例演示了一个简单的自适应采样过程，基于滑动窗口和阈值。

代码中的注释解释了每一行代码的功能和作用。

# 自己的实现

我们稍微调整一下上面的实现。

## 基于 QPS 次数的

```java
package com.github.houbb.auto.log.core.support.sample;

import com.github.houbb.auto.log.api.IAutoLogContext;
import com.github.houbb.auto.log.api.IAutoLogSampleCondition;

import java.util.concurrent.ThreadLocalRandom;
import java.util.concurrent.atomic.AtomicInteger;

/**
 * 自适应采样
 *
 * 1. 初始化采样率为 100%，全部采样
 *
 * 2. QPS 如果越来越高，那么采样率应该越来越低。这样避免 cpu 等资源的损耗。最低为 1%
 * 如果 QPS 越来越低，采样率应该越来越高。增加样本，最高为 100%
 *
 * 3. QPS 如何计算问题
 *
 * 直接设置大小为 100 的队列，每一次在里面放入时间戳。
 * 当大小等于 100 的时候，计算首尾的时间差，currentQps = 100 / (endTime - startTime) * 1000
 *
 * 触发 rate 重新计算。
 *
 * 3.1 rate 计算逻辑
 *
 * 这里我们存储一下 preRate = 100, preQPS = ?
 *
 * newRate = (preQps / currentQps) * rate
 *
 * 范围限制：
 * newRate = Math.min(100, newRate);
 * newRate = Math.max(1, newRate);
 *
 * 3.2 时间队列的清空
 *
 * 更新完 rate 之后，对应的队列可以清空？
 *
 * 如果额外使用一个 count，好像也可以。
 * 可以调整为 atomicLong 的计算器，和 preTime。
 *
 * @author d
 * @since 0.5.0
 */
public class AutoLogSampleConditionAdaptive implements IAutoLogSampleCondition {

    private static final AutoLogSampleConditionAdaptive INSTANCE = new AutoLogSampleConditionAdaptive();

    /**
     * 单例的方式获取实例
     * @return 结果
     */
    public static AutoLogSampleConditionAdaptive getInstance() {
        return INSTANCE;
    }

    /**
     * 次数大小限制，即接收到多少次请求更新一次 adaptive 计算
     *
     * TODO: 这个如何可以让用户可以自定义呢？后续考虑配置从默认的配置文件中读取。
     */
    private static final int COUNT_LIMIT = 1000;

    /**
     * 自适应比率，初始化为 100.全部采集
     */
    private volatile int adaptiveRate = 100;

    /**
     * 上一次的 QPS
     *
     * TODO: 这个如何可以让用户可以自定义呢？后续考虑配置从默认的配置文件中读取。
     */
    private volatile double preQps = 100.0;

    /**
     * 上一次的时间
     */
    private volatile long preTime;

    /**
     * 总数，请求计数器
     */
    private final AtomicInteger counter;

    public AutoLogSampleConditionAdaptive() {
        preTime = System.currentTimeMillis();
        counter = new AtomicInteger(0);
    }

    @Override
    public boolean sampleCondition(IAutoLogContext context) {
        int count = counter.incrementAndGet();

        // 触发一次重新计算
        if(count >= COUNT_LIMIT) {
            updateAdaptiveRate();
        }

        // 直接计算是否满足
        return InnerRandomUtil.randomRateCondition(adaptiveRate);
    }

    /**
     * 更新自适应的概率
     *
     * 100 计算一次，其实还好。实际应该可以适当调大这个阈值，本身不会经常变化的东西。
     */
    private synchronized void updateAdaptiveRate() {
        //消耗的毫秒数
        long costTimeMs = System.currentTimeMillis() - preTime;
        //qps 的计算，时间差是毫秒。所以次数需要乘以 1000
        double currentQps = COUNT_LIMIT*1000.0 / costTimeMs;
        // preRate * preQps = currentRate * currentQps; 保障采样均衡，服务器压力均衡
        // currentRate = (preRate * preQps) / currentQps;
        // 更新比率
        adaptiveRate = (int) ((adaptiveRate * preQps) / currentQps);

        adaptiveRate = Math.min(100, adaptiveRate);
        adaptiveRate = Math.max(1, adaptiveRate);

        // 更新 QPS
        preQps = currentQps;
        // 更新上一次的时间内戳
        preTime = System.currentTimeMillis();
        // 归零
        counter.set(0);
    }

}
```

## 基于时间窗口的定时任务

个人理解：上面的策略有一个很大的问题。

比如白天我们的 QPS 很高，直接满了，但是夜晚的流量非常低，那么可能一直无法让累加次数更新到 1000。

所以基于时间窗口定时更新也是一个不错的方法。

下面进行实现：

```java
package com.github.houbb.auto.log.core.support.sample;

import com.github.houbb.auto.log.api.IAutoLogContext;
import com.github.houbb.auto.log.api.IAutoLogSampleCondition;

import java.util.concurrent.Executors;
import java.util.concurrent.ScheduledExecutorService;
import java.util.concurrent.TimeUnit;
import java.util.concurrent.atomic.AtomicInteger;
import java.util.concurrent.atomic.AtomicLong;

/**
 * 自适应采样-时间窗口
 *
 * 1. 初始化采样率为 100%，全部采样
 *
 * 2. QPS 如果越来越高，那么采样率应该越来越低。这样避免 cpu 等资源的损耗。最低为 1%
 * 如果 QPS 越来越低，采样率应该越来越高。增加样本，最高为 100%
 *
 * 3. QPS 如何计算问题
 *
 * 直接设置大小为 100 的队列，每一次在里面放入时间戳。
 * 当大小等于 100 的时候，计算首尾的时间差，currentQps = 100 / (endTime - startTime) * 1000
 *
 * 触发 rate 重新计算。
 *
 * 3.1 rate 计算逻辑
 *
 * 这里我们存储一下 preRate = 100, preQPS = ?
 *
 * newRate = (preQps / currentQps) * rate
 *
 * 范围限制：
 * newRate = Math.min(100, newRate);
 * newRate = Math.max(1, newRate);
 *
 * 3.2 时间队列的清空
 *
 * 更新完 rate 之后，对应的队列可以清空？
 *
 * 如果额外使用一个 count，好像也可以。
 * 可以调整为 atomicLong 的计算器，和 preTime。
 *
 * @author d
 * @since 0.5.0
 */
public class AutoLogSampleConditionAdaptiveSchedule implements IAutoLogSampleCondition {

    private static final AutoLogSampleConditionAdaptiveSchedule INSTANCE = new AutoLogSampleConditionAdaptiveSchedule();

    /**
     * 单例的方式获取实例
     * @return 结果
     */
    public static AutoLogSampleConditionAdaptiveSchedule getInstance() {
        return INSTANCE;
    }

    private static final ScheduledExecutorService EXECUTOR_SERVICE = Executors.newSingleThreadScheduledExecutor();

    /**
     * 时间分钟间隔
     */
    private static final int TIME_INTERVAL_MINUTES = 5;

    /**
     * 自适应比率，初始化为 100.全部采集
     */
    private volatile int adaptiveRate = 100;

    /**
     * 上一次的总数
     *
     * TODO: 这个如何可以让用户可以自定义呢？后续考虑配置从默认的配置文件中读取。
     */
    private volatile long preCount;

    /**
     * 总数，请求计数器
     */
    private final AtomicLong counter;

    public AutoLogSampleConditionAdaptiveSchedule() {
        counter = new AtomicLong(0);
        preCount = TIME_INTERVAL_MINUTES * 60 * 100;

        //1. 1min 后开始执行
        //2. 中间默认 5 分钟更新一次
        EXECUTOR_SERVICE.scheduleAtFixedRate(new Runnable() {
            @Override
            public void run() {
                updateAdaptiveRate();
            }
        }, 60, TIME_INTERVAL_MINUTES * 60, TimeUnit.SECONDS);
    }

    @Override
    public boolean sampleCondition(IAutoLogContext context) {
        counter.incrementAndGet();

        // 直接计算是否满足
        return InnerRandomUtil.randomRateCondition(adaptiveRate);
    }

    /**
     * 更新自适应的概率
     *
     * QPS = count / time_interval
     *
     * 其中时间维度是固定的，所以可以不用考虑时间。
     */
    private synchronized void updateAdaptiveRate() {
        // preRate * preCount = currentRate * currentCount; 保障采样均衡，服务器压力均衡
        // currentRate = (preRate * preCount) / currentCount;
        // 更新比率
        long currentCount = counter.get();
        int newRate = 100;
        if(currentCount != 0) {
            newRate = (int) ((adaptiveRate * preCount) / currentCount);
            newRate = Math.min(100, newRate);
            newRate = Math.max(1, newRate);
        }

        // 更新自适应频率
        adaptiveRate = newRate;

        // 更新 QPS
        preCount = currentCount;
        // 归零
        counter.set(0);
    }

}
```

# QPS-采样数-采样率函数

首先，我们拟根据应用qps作为变量来构建qps-每秒采样数函数，从而可算出采样率，即每秒采样数/qps。 

接着，我们需要确定一些目标值，根据对这些值的逼近来得出我们的最终函数。

1. 最小阈值。为了对低流量的应用尽可能公平，保证样本的充分，我们约定小于等于最小阈值qps的时候，采样率为百分百。假定最小阈值为10，即qps<10时，每秒采样数即为qps，采样率为百分百。

2. 业务目标值。一般在Metrics系统中，例如Prometheus，都会有记录业务应用的日常qps均值。假定业务应用的单机qps均值为200，并且希望在上线自适应采样后存储成本能够降低百分之四十，那么就是在qps为200的时候，需要对应的每秒采样数为120。

3. 极大值。在qps很大的情况下，其实只需保证一个较大的固定每秒采样数就可以满足保留足够请求样本的初衷了，而不需要随着qps的增加无限制的增加每秒采样数，这样的话对机器IO的压力也会较大。那么在qps达到极大值的情况下，qps-每秒采样数的函数导数应为0，而大于极大值的时候保持每秒采样数不变。例如可假定qps极大值为2000。

如果我们基于以上这些值，并且设定qps-每秒采样数为一段二次函数，即`每秒采样数=a*qps^2+b*qps+c`，可以得到以下关系：

```
100a+10b+c=10
40000a+200b+c=120
4000a+b=0
```

最终得到函数为`每秒采样数= -0.00015qps^2+0.611qps+3.905`。

在实际应用中，可以根据业务的具体情况对参数做相应的调整。 

那么qps-每秒采样数的函数大致如下：相应的qps-采样率的函数如下：

## 计算QPS

考虑到之前我们的固定采样率算法使用的是蓄水池算法，简单来说是利用了一个100大小的BitSet，根据采样概率为之填充了相应的0或1，并每过一百次请求后进行循环复用。

那么其实计算QPS也可以直接复用该BitSet而不用额外构造数据结构了。

每当请求来到第一百次的时候都会记录一个值time，每100个请求循环末time值与前次循环的time值之差作为时间间隔interval。那么显而易见QPS即为100/interval。

## 应用采样率

根据上述分析，在每次循环BitSet，当计数来到99的时候，都会为下一次100请求循环生成一个新的采样率。根据每秒采样数-qps函数计算出对应采样率后，需要将其应用到BitSet中，即生成一个新的100大小的BitSet。

在实际应用过程中，有一些需要问题仍需关注

## 预热

所谓预热，其实是假"预热"。对于当前情况来说，最初的BitSet生成时并不知应该采用什么采样率，因为这时候qps值也没有算出来。

**目前策略是刚开始生成的BitSet统一设置采样率为1，即最初的100个请求会被百分比采样。其实这样，也更方便了记录开发或者测试的调试请求**。

## QPS滞后

当前计算QPS的方式是固定了样本数，通过消耗完样本数的时间来计算。而一般计算QPS的方式往往是固定间隔时间，通过间隔时间内记录的请求数进行计算。前者比较大的问题是QPS滞后的问题会更严重一些。

按照我们当前的计算方式，新的100大小的BitSet的采样率是根据前面100个样本的消耗时间计算出来的，也就是有所谓100个样本的QPS滞后。

而相比固定间隔时间计算方式来说，这种情况会更严重一些。举个栗子说，当晚高峰过后，实际qps从1000骤降到0(忽略不计，100个样本延续了一晚)，但后100个样本的采样率还是根据1000qps算出来的，并且如果这100个样本延续了一晚，那么其实QPS滞后了一晚。而对于固定间隔时间的计算方式来说，QPS最多只会滞后其间隔时间。

但好在计算QPS的应用场景是用于进行采样，那么滞后问题就不是问题了。不论是骤降还是骤升，对于采样的影响可以忽略不计，因为采样关注的是样本数而不是时间，100个样本的滞后对于整体的影响并不大。

## 并发问题

显然，在每次100个请求结束开始新的循环的时候，都需要做一些操作，计算采样率，创建BitSet，记录time值等。

而这些操作为了防止并发问题都是需要加锁的，性能上来讲，每过100个请求才会加锁一次，并不用过于担心，何况从JDK6开始synchronized就已经在被不断优化了。

## 相关源码

相关的代码模拟如下：

```java
public class AdvancedAdaptiveSampler extends Sampler {

    private volatile AtomicInteger counter = new AtomicInteger(0);
    private static BitSet sampleDecisions;
    private long prevTime;
    private static final int MIN_SAMPLE_LIMIT = 10;
    private static final int MAX_SAMPLE_LIMIT = 2000;


    public AdvancedAdaptiveSampler() {
        int outOf100 = (int) (1 * 100.0f);
        //蓄水池算法 见https://www.fredal.xin/reservoir-sampling
        sampleDecisions = RandomBitSet.genBitSet(100, outOf100, new Random());
        prevTime = System.currentTimeMillis();
    }

    @Override
    protected boolean doSampled() {
        boolean res = true;
        int i;
        do {
            i = this.counter.getAndIncrement();
            if (i < 99) {
                res = sampleDecisions.get(i);
            } else {
                synchronized (this) {
                    if (i == 99) {
                        res = sampleDecisions.get(99);
                        int outOf100 = calAdaptiveRateInHundred(System.currentTimeMillis() - prevTime);
                        sampleDecisions = RandomBitSet.genBitSet(100, outOf100, new Random());
                        prevTime = System.currentTimeMillis();
                        this.counter.set(0);
                    }
                }
            }
        } while (i > 99);
        return res;
    }

    private int calAdaptiveRateInHundred(long interval) {
        double qps = (double) (100 * 1000) / interval;
        if (qps <= MIN_SAMPLE_LIMIT) {
            return (int) (1 * 100.0f);
        } else {
            if (qps > MAX_SAMPLE_LIMIT) {
                qps = MAX_SAMPLE_LIMIT;
            }
            double num = -0.00015 * Math.pow(qps, 2) + 0.611 * qps + 3.905;
            return (int) Math.round((num / qps) * 100.0f);
        }
    }
}
```

代码解释如下：

```java
public class AdvancedAdaptiveSampler extends Sampler {

    // 声明一个 volatile 的 AtomicInteger 变量用于计数
    private volatile AtomicInteger counter = new AtomicInteger(0);

    // 声明一个静态的 BitSet 变量用于存储采样决策
    private static BitSet sampleDecisions;

    // 存储上一次采样的时间戳
    private long prevTime;

    // 定义最小和最大采样率的限制
    private static final int MIN_SAMPLE_LIMIT = 10;
    private static final int MAX_SAMPLE_LIMIT = 2000;

    // 构造方法
    public AdvancedAdaptiveSampler() {
        int outOf100 = (int) (1 * 100.0f);
        // 使用蓄水池算法生成随机位集，设置采样决策
        sampleDecisions = RandomBitSet.genBitSet(100, outOf100, new Random());
        // 初始化上一次采样时间戳
        prevTime = System.currentTimeMillis();
    }

    // 重写 doSampled 方法
    @Override
    protected boolean doSampled() {
        boolean res = true;
        int i;
        do {
            // 获取当前计数值
            i = this.counter.getAndIncrement();

            // 判断是否需要进行采样
            if (i < 99) {
                res = sampleDecisions.get(i);
            } else {
                synchronized (this) {
                    if (i == 99) {
                        // 更新采样决策，计算自适应采样率，并重置计数器和时间戳
                        res = sampleDecisions.get(99);
                        int outOf100 = calAdaptiveRateInHundred(System.currentTimeMillis() - prevTime);
                        sampleDecisions = RandomBitSet.genBitSet(100, outOf100, new Random());
                        prevTime = System.currentTimeMillis();
                        this.counter.set(0);
                    }
                }
            }
        } while (i > 99);
        return res;
    }

    // 计算自适应采样率
    private int calAdaptiveRateInHundred(long interval) {
        double qps = (double) (100 * 1000) / interval;

        // 根据 QPS 计算自适应采样率的百分比
        if (qps <= MIN_SAMPLE_LIMIT) {
            return (int) (1 * 100.0f);
        } else {
            if (qps > MAX_SAMPLE_LIMIT) {
                qps = MAX_SAMPLE_LIMIT;
            }
            double num = -0.00015 * Math.pow(qps, 2) + 0.611 * qps + 3.905;
            return (int) Math.round((num / qps) * 100.0f);
        }
    }
}
```

# 参考资料


* any list
{:toc}