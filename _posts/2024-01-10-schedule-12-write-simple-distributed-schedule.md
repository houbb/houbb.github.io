---
layout: post
title: schedule-12-从零实现一个简单的分布式调度平台
date: 2024-01-10 21:01:55 +0800
categories: [Schedule]
tags: [schedule, apache, distribued, work-flow, sh]
published: true
---



# 需求

一个分布式调度系统在如今是非常常见的。

本来希望直接使用已有的一些分布式调度平台，但是又觉得太重。

于是，最后还是决定先自己实现。

# 如何设计配置的通知机制呢？

如果你把调度系统内嵌到业务系统，那么甚至可以感知到调度配置的变化，这样可能更加简单。

不过一般都是分开的。

1） 如果想设计成为推送的模式，那么就要引入 mq 或者 tcp 等通知机制。

2） 那么，能不能简单点呢？

最简单的就是定时拉取配置的方式，这种方式缺点是会存在一定时间的延迟，不过一般的系统都是支持的。

# 如何控制任务只被调度一次？

肯定要引入分布式锁。

如果系统有 redis，可以基于 redis 实现分布式锁。

## 分布式锁

这个话题以前讨论过，感兴趣的可以移步到

[分布式锁-01-基于 Zookeeper 实现分布式锁](https://houbb.github.io/2018/09/08/distributed-lock-01-zookeeper)

[分布式锁-02-SQL 数据库实现分布式锁](https://houbb.github.io/2018/09/08/distributed-lock-02-sql)

[分布式锁-03-基于 mysql 实现分布式锁](https://houbb.github.io/2018/09/08/distributed-lock-03-mysql)

[和 chatgpt 聊了一会儿分布式锁 redis/zookeeper distributed lock](https://houbb.github.io/2018/09/08/redis-learn-43-distributed-lock-with-chatgpt)

[Redis Learn-27-分布式锁进化史](https://houbb.github.io/2018/12/12/redis-learn-27-distributed-lock-history)

[redis 分布式锁设计 redis lock RedLock](https://houbb.github.io/2019/01/07/redis-learn-41-lock)

## 保持架构的简单性

如果你追求性能，且架构中存在 redis，可以优先考虑基于 redis 的锁。

我们对调度精度要求不是特别高，为了架构简单，暂时采用的是 mysql 锁。

无论是那种实现，我们只依赖抽象的锁接口，后续便于替换。

# 任务的触发与执行

任务要如何触发，又如何保证只被执行一次呢？

## 任务的触发

作为本篇文章的重点。

主要是 2 点：

1）如何保证唯一一台执行？

这里采用分布式锁，抢到锁的才能执行。

根据实现策略不同，可能会略有差异。

2）如何保证正确的触发？

也取决于实现策略，最经典的应该是时间轮算法。

当然也可以很简单的定时触发。

## 任务的执行

每次任务触发的时候，找到待执行的任务，然后加锁执行，保证每一次只有一个任务执行。

# 任务的触发策略

## v1-定时加载触发

核心代码，定时触发：

```java
protected void triggerTaskAtFixedRate() {
    triggerTaskExecutorService.scheduleAtFixedRate(new Runnable() {
        @Override
        public void run() {
            log.info("[Schedule] trigger start");
            triggerTask(TimeUnit.MILLISECONDS, triggerIntervalMills);
            log.info("[Schedule] trigger end");
        }
    }, triggerIntervalMills, triggerIntervalMills, TimeUnit.MILLISECONDS);
    log.info("[Schedule] trigger init done triggerIntervalMills={}", triggerIntervalMills);
}
```

加锁，并获取对应待执行的任务列表：

任务放在数据库中，根据待执行时间，查出需要执行的任务列表即可。

```java
/**
 * 执行任务调度
 * @param timeUnit 时间单位
 * @param lockInterval 锁的间隔
 */
protected void triggerTask(final TimeUnit timeUnit, final long lockInterval) {
    // 抢占锁
    final ILock lock = context.getLock();
    final String lockKey = ScheduleConst.LOCK_TRIGGER;
    try {
        // 锁占用多久？
        boolean lockFlag = lock.tryLock(lockKey, timeUnit, lockInterval);
        if(!lockFlag) {
            log.info("[Schedule] current machine triggerTask tryLock fail, return.");
            return;
        }

        final long currentTime = System.currentTimeMillis();
        //1. 查询所有的任务
        List<TDistributedScheduleTask> taskList = this.queryAllExecuteList(context, currentTime);
        if(CollectionUtil.isEmpty(taskList)) {
            log.warn("");
            return;
        }
        //2. 并行异步执行每一个任务
        final IScheduleExecutor scheduleExecutor = context.getScheduleExecutor();
        taskList.parallelStream()
                .forEach(new Consumer<TDistributedScheduleTask>() {
                    @Override
                    public void accept(TDistributedScheduleTask task) {
                        // 触发调度
                        executeTask(scheduleExecutor, task);
                    }
                });
    } catch (Exception e) {
        //trigger ex handler
        scheduleTriggerErrorHandler.error(context, e);
    } finally {
        // 这里应该不用释放锁，根据时间来判断。不然一个任务执行完，会导致下一次直接开始。
        lock.unlock(ScheduleConst.LOCK_TRIGGER);
    }
}
```

## v2-最简单的遍历

非常简单，性能也最差。

直接遍历所有的任务，找到待执行的任务。

```java
@Override
protected List<TDistributedScheduleTask> queryAllExecuteList(ScheduleContext context, long currentTime) {
    final long now = InnerScheduleUtil.now();
    // 找到执行时间小于等于当前时间的，加锁移除。因为时间是排序的，所以如果发现不满足，可以直接快速失败
    List<TDistributedScheduleTask> resultList = new ArrayList<>();
    // 加锁- 为什么要求字段为 final?
    // 暂时不加锁，直接处理会如何？ 会导致什么问题呢？
    taskDataMap.values().parallelStream().forEach(task -> {
        //信息
        if (now >= task.getScheduleNextTime()) {
            resultList.add(task);
        }
    });
    // 统一放入，而不是一遍处理一遍修改。
    resultList.parallelStream().forEach(ScheduleTriggerLoop.super::removeAndNext);
    return resultList;
}
```

## v3-基于排序的集合

思路：插入数据的时候，按照待执行时间排序。寻找的时候，只需要从前到后寻找，如果不满足，后面的可以跳过。

数据结构：选择 treeMap

核心实现：

```java
@Override
protected List<TDistributedScheduleTask> queryAllExecuteList(ScheduleContext context, long currentTime) {
    // 在内存中，自己判断除当前需要处理的任务
    long currentIndex = calcSlotIndex(currentTime);

    // 找到执行时间小于等于当前时间的，加锁移除。因为时间是排序的，所以如果发现不满足，可以直接快速失败
    List<TDistributedScheduleTask> resultList = new ArrayList<>();

    // 加锁- 为什么要求字段为 final?
    // 暂时不加锁，直接处理会如何？ 会导致什么问题呢？
    for(Map.Entry<Long, Set<TDistributedScheduleTask>> entry : taskTreeMap.entrySet())  {
        long time = entry.getKey();
        if(currentIndex < time) {
            break;
        }
        // 移除
        Set<TDistributedScheduleTask> taskSet = taskTreeMap.get(time);
        if(CollectionUtil.isNotEmpty(taskSet)) {
            resultList.addAll(taskSet);
        }
    }

    // 计算下一次的调度时间，重新加入到队列中
    // 好处是可以直接并行
    // 下一次时间
    resultList.parallelStream().forEach(this::removeAndNext);

    // 更新数据
    afterQueryAllExecuteList(resultList, context, currentTime);
    return resultList;
}
```

## v4-简单的时间轮

思路：基于时间轮算法。不过基于 map 做了点优化，可以理论上一直放入任务。

核心实现：

```java
@Override
protected List<TDistributedScheduleTask> queryAllExecuteList(ScheduleContext context, long currentTime) {
    // 拿到当前的 slot
    Set<TDistributedScheduleTask> taskSet = taskIndexSetMap.get(currentTimeIndex.get());

    // 更新时间
    currentTimeIndex.getAndAdd(calcSlotIndex(super.triggerIntervalMills));
    if(CollectionUtil.isEmpty(taskSet)) {
        return Collections.emptyList();
    }

    List<TDistributedScheduleTask> resultList = new ArrayList<>(taskSet);
    // 移除，更新时间
    resultList.parallelStream().forEach(this::removeAndNext);
    return resultList;
}
```

## v5-多维时间轮

这个是为了解决任务执行时候太靠后，避免内存浪费。

核心实现：

```java
@Override
protected List<TDistributedScheduleTask> queryAllExecuteList(ScheduleContext context, long currentTime) {
    // 拿到当前的 slot
    MultiIndexDto currentTriggerSlot = calcSlotIndex(currentTime);
    Set<TDistributedScheduleTask> taskSet = taskDataMap.get(currentTriggerSlot);
    // 更新时间
    this.currentTimeIndex = calcSlotIndex(currentTime + super.triggerIntervalMills);
    if(CollectionUtil.isEmpty(taskSet)) {
        return Collections.emptyList();
    }
    List<TDistributedScheduleTask> resultList = new ArrayList<>(taskSet);
    // 移除，更新时间
    resultList.parallelStream().forEach(this::removeAndNext);
    return resultList;
}
```

其实和一维度的逻辑很类似，只不过 Index 调整为了多维度。

slot 计算的方式：

```java
protected MultiIndexDto calcSlotIndex(final long time) {
    // 计算出每一层的信息
    long[] indexList = new long[sizes.length];
    // 剩余值
    long remain = time;
    for(int i = 0; i < sizes.length; i++) {
        // 当前层的长度
        long currentLen = sizes[i];
        // 其实有一些浪费，因为实际上的 trigger 一般不会设置为 1ms
        long lenWithWeight = currentLen * triggerIntervalMills;
        // 当前值
        long currentVal = remain / lenWithWeight;
        // 剩余的值
        remain %= lenWithWeight;
        indexList[i] = currentVal;
    }
    return MultiIndexDto.of(indexList);
}
```

# 小结

这种方式好处是足够简单，缺点是还是不够实时。

如果想实现一个强大的基于推模式的调度，我们就要费一些功夫了。

后续有机会，老马和大家一起讨论下如何实现一个基于推模式的分布式调度系统。

# 其他

调度的设计：参考时间轮等

简单的就是定时执行，复杂的可以参考时间轮等多种优秀的设计。

# 实现

已有实现，放在了 github，暂时不开源。

> [distributed-schedule](https://github.com/houbb/distributed-schedule)


* any list
{:toc}