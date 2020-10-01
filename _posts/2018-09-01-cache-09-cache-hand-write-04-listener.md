---
layout: post
title:  Cache Travel-09-从零开始手写 redis（四）监听器的实现
date:  2018-09-01 12:24:42 +0800
categories: [Cache]
tags: [cache, sh]
published: true
---

# 前言

[java从零手写实现redis（一）如何实现固定大小的缓存？](https://mp.weixin.qq.com/s/6J2K2k4Db_20eGU6xGYVTw)

[java从零手写实现redis（三）redis expire 过期原理](https://mp.weixin.qq.com/s/BWfBc98oLqhAPLN2Hgkwow)

[java从零手写实现redis（三）内存数据如何重启不丢失？](https://mp.weixin.qq.com/s/G41SRZQm1_0uQXBAGHAYbw)

本节，让我们来一起学习一下如何实现类似 guava-cache 中的 removeListener 删除监听器，和类似 redis 中的慢日志监控的 slowListener。

# 删除监听器

## 说明

我们在两种场景下删除数据是对用户透明的：

（1）size 满了之后，进行数据淘汰。

（2）expire 过期时，清除数据。

这两个特性对用户本来应该是无感的，不过用户如果关心的话，也可以通过添加删除监听器来获取到相关的变更信息。

## 实现思路

为了实现删除的监听，我们需要找到删除的位置，然后调用监听器即可。

### evict 驱除的场景

每次 put 数据时，都会校验 size 是否达到最大的限制，如果达到，则进行 evict 淘汰。

### expire 过期的场景

用户指定 expire 时间之后，回后台异步执行刷新。

也存在惰性删除的场景。

## 接口定义

为了统一，我们将所有的删除都定义统一的接口：

```java
/**
 * 删除监听器接口
 *
 * @author binbin.hou
 * @since 0.0.6
 * @param <K> key
 * @param <V> value
 */
public interface ICacheRemoveListener<K,V> {

    /**
     * 监听
     * @param context 上下文
     * @since 0.0.6
     */
    void listen(final ICacheRemoveListenerContext<K,V> context);

}
```

## 内置实现

系统内置的实现如下：

```java
public class CacheRemoveListener<K,V> implements ICacheRemoveListener<K,V> {

    private static final Log log = LogFactory.getLog(CacheRemoveListener.class);

    @Override
    public void listen(ICacheRemoveListenerContext<K, V> context) {
        log.debug("Remove key: {}, value: {}, type: {}",
                context.key(), context.value(), context.type());
    }

}
```

这个监听器是默认开启的，暂时无法关闭。

## 自定义

用户可以自己的需要，进行自定义实现：

```java
public class MyRemoveListener<K,V> implements ICacheRemoveListener<K,V> {

    @Override
    public void listen(ICacheRemoveListenerContext<K, V> context) {
        System.out.println("【删除提示】可恶，我竟然被删除了！" + context.key());
    }

}
```

## 测试

```java
ICache<String, String> cache = CacheBs.<String,String>newInstance()
        .size(1)
        .addRemoveListener(new MyRemoveListener<String, String>())
        .build();

cache.put("1", "1");
cache.put("2", "2");
```

我们指定 cache 的大小为1，设置我们自定义的删除监听器。

这里的删除监听器可以添加多个。

### 日志

测试日志如下：

```
[DEBUG] [2020-09-30 19:32:54.617] [main] [c.g.h.c.c.s.l.r.CacheRemoveListener.listen] - Remove key: 2, value: 2, type: evict
【删除提示】可恶，我竟然被删除了！2
```

# 慢操作监听器

## 说明

redis 中会存储慢操作的相关日志信息，主要是由两个参数构成：

（1）slowlog-log-slower-than 预设阈值,它的单位是毫秒(1秒=1000000微秒)默认值是10000

（2）slowlog-max-len 最多存储多少条的慢日志记录

不过 redis 是直接存储到内存中，而且有长度限制。

根据实际工作体验，如果我们可以添加慢日志的监听，然后有对应的存储或者报警，这样更加方便问题的分析和快速反馈。

所以我们引入类似于删除的监听器。

## 实现思路

我们处理所有的 cache 操作，并且记录对应的操作耗时。

如果耗时操作用户设置的时间阈值，则调用慢操作监听器。

## 接口定义

为了保证接口的灵活性，每一个实现都可以定义自己的慢操作阈值，这样便于分级处理。

比如超过 100ms，用户可以选择输出 warn 日志；超过 1s，可能影响到业务了，可以直接接入报警系统。

```java
public interface ICacheSlowListener {

    /**
     * 监听
     * @param context 上下文
     * @since 0.0.6
     */
    void listen(final ICacheSlowListenerContext context);

    /**
     * 慢日志的阈值
     * @return 慢日志的阈值
     * @since 0.0.9
     */
    long slowerThanMills();

}
```

## 自定义监听器

实现接口 `ICacheSlowListener`

这里每一个监听器都可以指定自己的慢日志阈值，便于分级处理。

```java
public class MySlowListener implements ICacheSlowListener {

    @Override
    public void listen(ICacheSlowListenerContext context) {
        System.out.println("【慢日志】name: " + context.methodName());
    }

    @Override
    public long slowerThanMills() {
        return 0;
    }

}
```

## 使用

```java
ICache<String, String> cache = CacheBs.<String,String>newInstance()
        .addSlowListener(new MySlowListener())
        .build();

cache.put("1", "2");
cache.get("1");
```

- 测试效果

```
[DEBUG] [2020-09-30 17:40:11.547] [main] [c.g.h.c.c.s.i.c.CacheInterceptorCost.before] - Cost start, method: put
[DEBUG] [2020-09-30 17:40:11.551] [main] [c.g.h.c.c.s.i.c.CacheInterceptorCost.after] - Cost end, method: put, cost: 10ms
【慢日志】name: put
[DEBUG] [2020-09-30 17:40:11.554] [main] [c.g.h.c.c.s.i.c.CacheInterceptorCost.before] - Cost start, method: get
[DEBUG] [2020-09-30 17:40:11.554] [main] [c.g.h.c.c.s.i.c.CacheInterceptorCost.after] - Cost end, method: get, cost: 1ms
【慢日志】name: get
```

实际工作中，我们可以针对慢日志数据存储，便于后期分析。

也可以直接接入报警系统，及时反馈问题。

# 小结

监听器实现起来比较简单，但是对于使用者的作用是比较大的。

文中主要讲述了思路，实现部分因为篇幅限制，没有全部贴出来。

> 开源地址：[https://github.com/houbb/cache](https://github.com/houbb/cache)

觉得本文对你有帮助的话，欢迎点赞评论收藏关注一波~

你的鼓励，是我最大的动力~

* any list
{:toc}