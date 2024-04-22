---
layout: post
title: Caffeine 入门学习
date:  2018-09-10 07:44:19 +0800
categories: [Cache]
tags: [cache, middleware, in-memory cache, sh]
published: true
---

# Caffeine

[Caffeine](https://github.com/ben-manes/caffeine) is a high performance, near optimal caching library based on Java 8. 

## 特性

Caffeine 提供灵活的结构，以创建一个缓存与下列功能的组合:

- 自动将条目加载到缓存中，可选异步加载

- 当基于频率和最近度超过最大值时，基于尺寸的驱逐

- 基于时间的条目过期，从上次访问或上次写入开始计算

- 当出现第一个过时的条目请求时，异步刷新

- 自动封装在弱引用中的键

- 自动封装在弱引用或软引用中的值

- 退出(或以其他方式删除)条目的通知

- 传播到外部资源的写

- 缓存访问统计数据的积累

## 性能对比

![读取性能](https://raw.githubusercontent.com/ben-manes/caffeine/master/wiki/throughput/read.png) 

## 优秀之处

和 [guava-cache-api](https://houbb.github.io/2018/09/09/cache-guava-cache) 兼容。

ps: 这使我想起了 ssdb 替代 redis，也默认可以使用 redis 的 api 一样。

站在巨人的肩膀上。

# 快速开始

## maven 引入

```xml
<dependency>
    <groupId>com.github.ben-manes.caffeine</groupId>
    <artifactId>caffeine</artifactId>
    <version>2.5.5</version>
</dependency>
```

## 代码

- DataObject.java

用于演示的实体类。

```java
public class DataObject {

    private final String data;

    /**
     * 计数器
     */
    private volatile static AtomicInteger counter = new AtomicInteger(0);

    public DataObject(String data) {
        this.data = data;
    }

    public String getData() {
        return data;
    }

    public static int getCounter() {
        return counter.get();
    }

    public static DataObject get(final String key) {
        counter.getAndIncrement();
        return new DataObject(key);
    }

}
```

## 基础功能

- baseTest

```java
/**
 * 基础测试
 */
@Test
public void baseTest() {
    Cache<String, DataObject> cache = Caffeine.newBuilder()
            .expireAfterWrite(1, TimeUnit.MINUTES)
            .maximumSize(100)
            .build();
    // 1. getIfPresent
    String key = "A";
    DataObject dataObject = cache.getIfPresent(key);
    assertNull(dataObject);

    // 2. put
    cache.put(key, new DataObject(key));
    assertNotNull(cache.getIfPresent(key));

    // 3. get 方法可以原子方式执行计算。这意味着您只进行一次计算 — 即使多个线程同时请求该值。
    // 这就是为什么使用 get 优于 getIfPresent。
    final String newKey = "B";
    dataObject = cache.get(newKey, k -> DataObject.get("Data for B"));
    assertNotNull(dataObject);
    assertEquals("Data for B", dataObject.getData());

    // 4. 使得某个键失效
    cache.invalidate(key);
    dataObject = cache.getIfPresent(key);
    assertNull(dataObject);
}
```

## 同步加载

这种加载缓存的方法使用了与用于初始化值的 Function 相似的手动策略的 get 方法。让我们看看如何使用它。

- syncLoadTest()

```java
/**
 * 同步加载测试
 */
@Test
public void syncLoadTest() {
    LoadingCache<String, DataObject> cache = Caffeine.newBuilder()
            .maximumSize(100)
            .expireAfterWrite(1, TimeUnit.MINUTES)
            .build(k -> DataObject.get("Data for " + k));
    final String key = "A";

    //1. 这个获取的仍然为空
    DataObject dataObject = cache.getIfPresent(key);
    assertNull(dataObject);

    //2. get() 检索值
    dataObject = cache.get(key);
    assertNotNull(dataObject);
    assertEquals("Data for " + key, dataObject.getData());

    //3. getAll() 获取一组值
    Map<String, DataObject> dataObjectMap
            = cache.getAll(Arrays.asList("A", "B", "C"));
    assertEquals(3, dataObjectMap.size());
}
```

## 异步加载

- asyncLoadTest()

和同步加载类似。但返回值为 [CompletableFuture](https://www.baeldung.com/java-completablefuture)

```java
/**
 * 异步加载测试
 */
@Test
public void asyncLoadTest() {
    AsyncLoadingCache<String, DataObject> cache = Caffeine.newBuilder()
            .maximumSize(100)
            .expireAfterWrite(1, TimeUnit.MINUTES)
            .buildAsync(k -> DataObject.get("Data for " + k));
    String key = "A";
    cache.get(key).thenAccept(dataObject -> {
        assertNotNull(dataObject);
        assertEquals("Data for " + key, dataObject.getData());
    });
    cache.getAll(Arrays.asList("A", "B", "C"))
            .thenAccept(dataObjectMap -> assertEquals(3, dataObjectMap.size()));
}
```

# 值回收

Caffeine 有三个值回收策略：基于大小，基于时间和参考。

## 基于大小回收

- 基于大小删除元素

```java
/**
 * 基于大小删除元素
 */
@Test
public void maximumSizeTest() {
    LoadingCache<String, DataObject> cache = Caffeine.newBuilder()
            .maximumSize(1)
            .build(k -> DataObject.get("Data for " + k));
    // 1. 初始值为 0
    assertEquals(0, cache.estimatedSize());

    // 2. 添加元素之后，+1
    cache.get("A");
    assertEquals(1, cache.estimatedSize());

    // 3. 超出最大值之后，则会删除第一个元素
    cache.get("B");
    // 这是因为缓存回收被异步执行，这种方法有助于等待回收的完成。
    cache.cleanUp();
    assertEquals(1, cache.estimatedSize());
}
```

- 基于权重大小删除元素

```java
/**
 * 基于权重大小删除元素
 */
@Test
public void maximumWeightTest() {
    LoadingCache<String, DataObject> cache = Caffeine.newBuilder()
            .maximumWeight(5)
            .weigher((k,v)->5)
            .build(k -> DataObject.get("Data for " + k));
    // 1. 初始值为 0
    assertEquals(0, cache.estimatedSize());

    // 2. 添加元素之后，+1
    cache.get("A");
    assertEquals(1, cache.estimatedSize());

    // 3. 超出最大值之后，则会删除第一个元素
    cache.get("B");
    // 这是因为缓存回收被异步执行，这种方法有助于等待回收的完成。
    cache.cleanUp();
    assertEquals(1, cache.estimatedSize());
}
```

## 基于时间回收

这种回收策略是基于条目的到期时间，有三种类型：

1. 访问后到期 — 从上次读或写发生后，条目即过期。

2. 写入后到期 — 从上次写入发生之后，条目即过期。

3. 自定义策略 — 到期时间由 Expiry 实现独自计算。

### 访问后过期

```java
@Test
public void expireAfterAccessTest() throws InterruptedException {
    LoadingCache<String, DataObject> cache = Caffeine.newBuilder()
            .expireAfterAccess(2, TimeUnit.SECONDS)
            .build(k -> DataObject.get("Data for " + k));
            
    final String key = "A";
    cache.get(key);
    TimeUnit.SECONDS.sleep(2);
    assertNull(cache.getIfPresent(key));
}
```

### 写入后到期

```java
@Test
public void expireAfterWriteTest() throws InterruptedException {
    LoadingCache<String, DataObject> cache = Caffeine.newBuilder()
            .expireAfterWrite(2, TimeUnit.SECONDS)
            .build(k -> DataObject.get("Data for " + k));

    final String key = "A";
    cache.get(key);

    TimeUnit.SECONDS.sleep(2);
    assertNull(cache.getIfPresent(key));
}
```

### 自定义过期策略

```java
@Test
public void defineExpireTest() {
    LoadingCache<String, DataObject> cache = Caffeine.newBuilder().expireAfter(new Expiry<String, DataObject>() {
        @Override
        public long expireAfterCreate(
                String key, DataObject value, long currentTime) {
            return value.getData().length() * 1000;
        }
        @Override
        public long expireAfterUpdate(
                String key, DataObject value, long currentTime, long currentDuration) {
            return currentDuration;
        }
        @Override
        public long expireAfterRead(
                String key, DataObject value, long currentTime, long currentDuration) {
            return currentDuration;
        }
    }).build(k -> DataObject.get("Data for " + k));
}
```

## 基于引用回收

我们可以将缓存配置为启用缓存键值的垃圾回收。为此，我们将 key 和 value 配置为 弱引用，并且我们可以仅配置软引用以进行垃圾回收。

当没有任何对对象的强引用时，使用 WeakRefence 可以启用对象的垃圾收回收。

SoftReference 允许对象根据 JVM 的全局最近最少使用（Least-Recently-Used）的策略进行垃圾回收。

- 弱引用

```java
@Test
public void weakTest() {
    LoadingCache<String, DataObject> cache = Caffeine.newBuilder()
            .expireAfterWrite(10, TimeUnit.SECONDS)
            .weakKeys()
            .weakValues()
            .build(k -> DataObject.get("Data for " + k));
}
```

- 软引用

```java
@Test
public void softTest() {
    LoadingCache<String, DataObject> cache = Caffeine.newBuilder()
            .expireAfterWrite(10, TimeUnit.SECONDS)
            .softValues()
            .build(k -> DataObject.get("Data for " + k));
}
```

# 刷新策略

可以将缓存配置为在定义的时间段后自动刷新条目。

让我们看看如何使用 refreshAfterWrite 方法：

```java
@Test
public void refreshTest() {
    Caffeine.newBuilder()
            .refreshAfterWrite(1, TimeUnit.MINUTES)
            .build(k -> DataObject.get("Data for " + k));
}
```

这里我们应该要明白 expireAfter 和 refreshAfter 之间的区别。 

当请求过期条目时，执行将发生阻塞，直到 build Function 计算出新值为止。

但是，如果条目可以刷新，则缓存将返回一个旧值，并异步重新加载该值。

# 统计

Caffeine 有一种记录缓存使用情况的统计方式：

我们也可能会传入 recordStats supplier，创建一个 StatsCounter 的实现。每次与统计相关的更改将推送此对象。

```java
@Test
public void statsTest() {
    LoadingCache<String, DataObject> cache = Caffeine.newBuilder()
            .maximumSize(100)
            .recordStats()
            .build(k -> DataObject.get("Data for " + k));

    cache.get("A");
    cache.get("A");
    assertEquals(1, cache.stats().hitCount());
    assertEquals(1, cache.stats().missCount());
}
```
# 参考资料

- learn

https://www.baeldung.com/java-caching-caffeine

https://www.jianshu.com/p/ba2ac225836d

- article

https://www.voxxed.com/2015/12/add-a-boost-of-caffeine-to-your-java/

http://highscalability.com/blog/2016/1/25/design-of-a-modern-cache.html

- 淘汰算法

[TinyLFU: A Highly Efficient Cache Admission Policy](http://delivery.acm.org/10.1145/3150000/3149371/a35-einziger.pdf?ip=112.32.2.181&id=3149371&acc=AUTHOR-IZED&key=4D4702B0C3E38B35%2E4D4702B0C3E38B35%2E4D4702B0C3E38B35%2E7CF34BA1F19DEFD2&__acm__=1536671141_c7e5978d8e60db2ebfe3c1553f9610c1)

* any list
{:toc}