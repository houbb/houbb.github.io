---
layout: post
title:  Cache Travel-09-从零开始手写 redis（三）内存数据重启后如何不丢失？
date:  2018-09-01 12:24:42 +0800
categories: [Cache]
tags: [cache, sh]
published: true
---

# 前言

我们在 [从零手写 cache 框架（一）实现固定大小的缓存](https://houbb.github.io/2018/09/01/cache-09-cache-hand-write-01-size) 中已经初步实现了我们的 cache。

我们在 [从零手写 cache 框架（一）实现过期特性](https://houbb.github.io/2018/09/01/cache-09-cache-hand-write-02-expire) 中实现了 key 的过期特性。

本节，让我们来一起学习一下如何实现类似 redis 中的 rdb 的持久化模式。

## 持久化的目的

我们存储的信息都是直接放在内存中的，如果断电或者应用重启，那么内容就全部丢失了。

有时候我们希望这些信息重启之后还在，就像 redis 重启一样。

# load 加载

## 说明

在实现持久化之前，我们来看一下一个简单的需求：

如何在缓存启动的时候，指定初始化加载的信息。

## 实现思路

这个也不难，我们在 cache 初始化的时候，直接设置对应的信息即可。

## api 

为了便于后期拓展，定义 ICacheLoad 接口。

```java
public interface ICacheLoad<K, V> {

    /**
     * 加载缓存信息
     * @param cache 缓存
     * @since 0.0.7
     */
    void load(final ICache<K,V> cache);

}
```

## 自定义初始化策略

我们在初始化的时候，放入 2 个固定的信息。

```java
public class MyCacheLoad implements ICacheLoad<String,String> {

    @Override
    public void load(ICache<String, String> cache) {
        cache.put("1", "1");
        cache.put("2", "2");
    }

}
```

## 测试

只需要在缓存初始化的时候，指定对应的加载实现类即可。

```java
ICache<String, String> cache = CacheBs.<String,String>newInstance()
        .load(new MyCacheLoad())
        .build();

Assert.assertEquals(2, cache.size());
```

# 持久化

## 说明

上面先介绍初始化加载，其实已经完成了 cache 持久化的一半。

我们要做的另一件事，就是将 cache 的内容持久化到文件或者数据库，便于初始化的时候加载。

## 接口定义

为了便于灵活替换，我们定义一个持久化的接口。

```java
public interface ICachePersist<K, V> {

    /**
     * 持久化缓存信息
     * @param cache 缓存
     * @since 0.0.7
     */
    void persist(final ICache<K, V> cache);

}
```

## 简单实现

我们实现一个最简单的基于 json 的持久化，当然后期可以添加类似于 AOF 的持久化模式。

```java
public class CachePersistDbJson<K,V> implements ICachePersist<K,V> {

    /**
     * 数据库路径
     * @since 0.0.8
     */
    private final String dbPath;

    public CachePersistDbJson(String dbPath) {
        this.dbPath = dbPath;
    }

    /**
     * 持久化
     * key长度 key+value
     * 第一个空格，获取 key 的长度，然后截取
     * @param cache 缓存
     */
    @Override
    public void persist(ICache<K, V> cache) {
        Set<Map.Entry<K,V>> entrySet = cache.entrySet();

        // 创建文件
        FileUtil.createFile(dbPath);
        // 清空文件
        FileUtil.truncate(dbPath);

        for(Map.Entry<K,V> entry : entrySet) {
            K key = entry.getKey();
            Long expireTime = cache.expire().expireTime(key);
            PersistEntry<K,V> persistEntry = new PersistEntry<>();
            persistEntry.setKey(key);
            persistEntry.setValue(entry.getValue());
            persistEntry.setExpire(expireTime);

            String line = JSON.toJSONString(persistEntry);
            FileUtil.write(dbPath, line, StandardOpenOption.APPEND);
        }
    }

}
```

## 定时执行

上面定义好了一种持久化的策略，但是没有提供对应的触发方式。

我们就采用对用户透明的设计方式：定时执行。

```java
public class InnerCachePersist<K,V> {

    private static final Log log = LogFactory.getLog(InnerCachePersist.class);

    /**
     * 缓存信息
     * @since 0.0.8
     */
    private final ICache<K,V> cache;

    /**
     * 缓存持久化策略
     * @since 0.0.8
     */
    private final ICachePersist<K,V> persist;

    /**
     * 线程执行类
     * @since 0.0.3
     */
    private static final ScheduledExecutorService EXECUTOR_SERVICE = Executors.newSingleThreadScheduledExecutor();

    public InnerCachePersist(ICache<K, V> cache, ICachePersist<K, V> persist) {
        this.cache = cache;
        this.persist = persist;

        // 初始化
        this.init();
    }

    /**
     * 初始化
     * @since 0.0.8
     */
    private void init() {
        EXECUTOR_SERVICE.scheduleAtFixedRate(new Runnable() {
            @Override
            public void run() {
                try {
                    log.info("开始持久化缓存信息");
                    persist.persist(cache);
                    log.info("完成持久化缓存信息");
                } catch (Exception exception) {
                    log.error("文件持久化异常", exception);
                }
            }
        }, 0, 10, TimeUnit.MINUTES);
    }

}
```

定时执行的时间间隔为 10min。

## 测试

我们只需要在创建 cache 时，指定我们的持久化策略即可。

```java
ICache<String, String> cache = CacheBs.<String,String>newInstance()
        .load(new MyCacheLoad())
        .persist(CachePersists.<String, String>dbJson("1.rdb"))
        .build();
Assert.assertEquals(2, cache.size());
TimeUnit.SECONDS.sleep(5);
```

为了确保文件持久化完成，我们沉睡了一会儿。

### 文件效果

- 1.rdb

生成的文件内容如下：

```
{"key":"2","value":"2"}
{"key":"1","value":"1"}
```

## 对应的缓存加载

我们只需要实现以下对应的加载即可，解析文件，然后初始化 cache。

```java
/**
 * 加载策略-文件路径
 * @author binbin.hou
 * @since 0.0.8
 */
public class CacheLoadDbJson<K,V> implements ICacheLoad<K,V> {

    private static final Log log = LogFactory.getLog(CacheLoadDbJson.class);

    /**
     * 文件路径
     * @since 0.0.8
     */
    private final String dbPath;

    public CacheLoadDbJson(String dbPath) {
        this.dbPath = dbPath;
    }

    @Override
    public void load(ICache<K, V> cache) {
        List<String> lines = FileUtil.readAllLines(dbPath);
        log.info("[load] 开始处理 path: {}", dbPath);
        if(CollectionUtil.isEmpty(lines)) {
            log.info("[load] path: {} 文件内容为空，直接返回", dbPath);
            return;
        }

        for(String line : lines) {
            if(StringUtil.isEmpty(line)) {
                continue;
            }

            // 执行
            // 简单的类型还行，复杂的这种反序列化会失败
            PersistEntry<K,V> entry = JSON.parseObject(line, PersistEntry.class);

            K key = entry.getKey();
            V value = entry.getValue();
            Long expire = entry.getExpire();

            cache.put(key, value);
            if(ObjectUtil.isNotNull(expire)) {
                cache.expireAt(key, expire);
            }
        }
        //nothing...
    }
}
```

然后在初始化时使用即可。

# 小结

到这里，我们一个类似于 redis rdb 的持久化就简单模拟完成了。

但是对于 rdb 这里还有需要可优化点，比如 rdb 文件的压缩、格式的定义、CRC 校验等等。

redis 考虑到性能问题，还有 AOF 的持久化模式，二者相辅相成，才能达到企业级别的缓存效果。

我们后续将陆续引入这些特性。

对你有帮助的话，欢迎点赞评论收藏关注一波~

你的鼓励，是我最大的动力~

# 原文地址

[Cache Travel-09-从零手写 cache 之 redis rdb 持久化实现](https://houbb.github.io/2018/09/01/cache-09-cache-hand-write-03-persist)

* any list
{:toc}