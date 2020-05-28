---
layout: post
title: 配置增量加载设计方案
date:  2020-5-26 16:05:35 +0800
categories: [Design]
tags: [design, sf]
published: true
---

# 背景

我们经常需要去实现各种配置的加载，有时候需要处理一些变化。

最简单的策略就是定期全量加载，不过如果配置较多，可能会产生 GC，对实时链路影响较大。

# trade-off

配置的定期加载是【频率】与【耗时】之间的一个权衡。

实际业务中，我们都希望配置变更，立刻生效。但是实现上有些困难。

可行的方案主要有：

（1）mq 通知，内存同步更新

（2）存储到 redis 等共享的三方内存，实时查询。

对于（1），引入了技术的复杂度。

对于（2），也要考虑单次查询的时间是否能否接受。

## 数据量与内存

如果数据量不大，且对变更要求没有那么敏感。

那么直接定期加载问题不大。

本节主要解决一下定期加载，但是数据量较多的问题。

# 基本实现

## 定期加载

结合 spring 或者是有些定时 job。

此处演示 spring + java 定时任务。伪代码如下：

```java
@Component
public LoadConfig implements InitializingBean {

    @Override
    public void afterPropertiesSet() {
        new ScheduledThreadPoolExecutor(1, (ThreadFactory) Thread::new).scheduleAtFixedRate(() -> {
            try {
                //load config
            } catch (RuntimeException e) {
                //log
            }
        }, 0, 10, TimeUnit.MINUTES);
    }    
}
```

这里 10min 一次去加载配置。

为了简单，使用单线程加载。实际上配置的变更应该是一个低频的事情。

简单的时候就是每次都全量加载，不过这很容易引起 GC。

## 增量加载

这里直接使用一个 initialized 标识是否全量加载完成。

你可以根据业务添加一个是否启用增量的配置+单次增量的时间窗口

```java
// 是否初始化完成
private volatile boolean initialized = false;
```

- 时间

```java
String dateTime = LocalDateTime.now()
                .minus(timeWindowMins, ChronoUnit.MINUTES)
                .format(DateTimeFormatter.ofPattern("yyyyMMddHH:mm:ss"));
```

- sql 

你可以在待加载的配置表中设置一个 on update current_timestamp 的字段，然后根据这个字段判断是否有信息变更。

```sql
where DATE_FORMAT(update_time, '%Y%m%d%T')) >= #{dateTime}
```

## 异常情况的考虑

- 配置有问题，需要全量加载

- 时间窗口内数据库还没有恢复

针对上面的极端情况，你可以重启应用。也可以变更配置。

或者每天定期执行一次全量。

## 增量加载的问题

增量加载如果频率为 10min，时间窗口为 1h。

如果有一次导入了大量配置，可能导致这段时间多次加载，仍然出现 GC。

这里实际上是数据冗余和 GC 之间的一个平衡。

大量配置导入是小概率事件，数据缺失基本是不可忍受的，所以我们一般选择数据冗余加载。


# 性能优化

## 上述的不足

上面的查询其实存在一个性能问题。

因为 mysql 如果我们针对列使用 `DATE_FORMAT`，实际上会导致全表扫。

## 改进

1. 直接给 update_time 字段加一个索引。

2. 比较的语句调整。

- 时间

```java
String dateTime = LocalDateTime.now()
                .minus(timeWindowMins, ChronoUnit.MINUTES)
                .format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss"));
```

- sql 

你可以在待加载的配置表中设置一个 on update current_timestamp 的字段，然后根据这个字段判断是否有信息变更。

```sql
where update_time >= #{dateTime}
```

这样在 explain 的时候就可以发现走到索引了。

# 其他方案

## redis

redis/memcache 等作为存储介质，实时查询。

## 多级缓存

redis + 本地缓存

* any list
{:toc}