---
layout: post
title:  Cache Travel-09-java 从零开始手写 redis（六）redis AOF 持久化原理详解及实现
date:  2018-09-01 12:24:42 +0800
categories: [Cache]
tags: [cache, sh]
published: true
---

# 前言

[java从零手写实现redis（一）如何实现固定大小的缓存？](https://mp.weixin.qq.com/s/6J2K2k4Db_20eGU6xGYVTw)

[java从零手写实现redis（三）redis expire 过期原理](https://mp.weixin.qq.com/s/BWfBc98oLqhAPLN2Hgkwow)

[java从零手写实现redis（三）内存数据如何重启不丢失？](https://mp.weixin.qq.com/s/G41SRZQm1_0uQXBAGHAYbw)

[java从零手写实现redis（四）添加监听器](https://mp.weixin.qq.com/s/6pIG3l_wkXBwSuJvj_KwMA)

[java从零手写实现redis（五）过期策略的另一种实现思路](https://mp.weixin.qq.com/s/Atrd36UGds9_w_NFQDoEQg)

我们前面简单实现了 redis 的几个特性，[java从零手写实现redis（三）内存数据如何重启不丢失？](https://mp.weixin.qq.com/s/G41SRZQm1_0uQXBAGHAYbw) 中实现了类似 redis 的 RDB 模式。

# redis aof 基础

[Redis AOF 持久化详解](https://houbb.github.io/2018/12/12/redis-learn-08-aof-persist)

# AOF 的一些个人理解

## 为什么选择 AOF？

AOF 模式的**性能特别好**，有多好呢？

用过 kafka 的同学肯定知道，kafka 也用到了顺序写这个特性。

顺序写添加文件内容，避免了文件 IO 的随机写问题，性能基本可以和内存媲美。

AOF 的**实时性更好**，这个是相对于 RDB 模式而言的。

我们原来使用 RDB 模式，将缓存内容全部持久化，这个是比较耗时的动作，一般是几分钟持久化一次。

AOF 模式主要是针对修改内容的指令，然后将所有的指令顺序添加到文件中。这样的话，实时性会好很多，可以提升到秒级别，甚至秒级别。

## AOF 的吞吐量

AOF 模式可以每次操作都进行持久化，但是这样会导致吞吐量大大下降。

提升吞吐量最常用的方式就是**批量**，这个 kafka 中也是类似的，比如我们可以 1s 持久化一次，将 1s 内的操作全部放入 buffer 中。

这里其实就是一个 trade-off 问题，实时性与吞吐量的平衡艺术。

实际业务中，1s 的误差一般都是可以接受的，所以这个也是业界比较认可的方式。

## AOF 的异步+多线程

kafka 中所有的操作实际上都是异步+回调的方式实现的。

异步+多线程，确实可以提升操作的性能。

当然 redis 6 以前，其实一直是单线程的。那为什么性能依然这么好呢？

其实多线程也有代价，那就是线程上下文的切换是需要耗时的，保持并发的安全问题，也需要加锁，从而降低性能。

所以这里要考虑异步的收益，与付出的耗时是否成正比的问题。

## AOF 的落盘

我们 AOF 与 RDB 模式，归根结底都是基于操作系统的文件系统做持久化的。

对于开发者而言，可能就是调用一个 api 就实现了，但是实际持久化落盘的动作并不见得就是一步完成的。

文件系统为了提升吞吐量，也会采用类似 buffer 的方式。这忽然有一点俄罗斯套娃的味道。

但是优秀的设计总是相似的，比如说缓存从 cpu 的设计中就有 L1/L2 等等，思路是一致的。

阿里的很多开源技术，都会针对操作系统的落盘做进一步的优化，这个我们后续做深入学习。

## AOF 的缺陷

大道缺一，没有银弹。

AOF 千好万好，和 RDB 对比也存在一个缺陷，那就是指令

# java 实现

## 接口

接口和 rdb 的保持一致

```java
/**
 * 持久化缓存接口
 * @author binbin.hou
 * @since 0.0.7
 * @param <K> key
 * @param <V> value
 */
public interface ICachePersist<K, V> {

    /**
     * 持久化缓存信息
     * @param cache 缓存
     * @since 0.0.7
     */
    void persist(final ICache<K, V> cache);

}
```

## 注解定义

为了和耗时统计，刷新等特性保持一致，对于操作类的动作才添加到文件中（append to file）我们也基于注解属性来指定，而不是固定写死在代码中，便于后期拓展调整。

```java
/**
 * 缓存拦截器
 * @author binbin.hou
 * @since 0.0.5
 */
@Documented
@Inherited
@Target(ElementType.METHOD)
@Retention(RetentionPolicy.RUNTIME)
public @interface CacheInterceptor {

    /**
     * 操作是否需要 append to file，默认为 false
     * 主要针对 cache 内容有变更的操作，不包括查询操作。
     * 包括删除，添加，过期等操作。
     * @return 是否
     * @since 0.0.10
     */
    boolean aof() default false;

}
```

我们在原来的 `@CacheInterceptor` 注解中添加 aof 属性，用于指定是否对操作开启 aof 模式。

## 指定 aof 模式的方法

我们在会对数据造成变更的方法上指定这个注解属性：

### 过期操作

类似于 spring 的事务拦截器，我们使用代理类调用 expireAt。

expire 方法就不需要添加 aof 拦截了。

```java
/**
 * 设置过期时间
 * @param key         key
 * @param timeInMills 毫秒时间之后过期
 * @return this
 */
@Override
@CacheInterceptor
public ICache<K, V> expire(K key, long timeInMills) {
    long expireTime = System.currentTimeMillis() + timeInMills;
    // 使用代理调用
    Cache<K,V> cachePoxy = (Cache<K, V>) CacheProxy.getProxy(this);
    return cachePoxy.expireAt(key, expireTime);
}

/**
 * 指定过期信息
 * @param key key
 * @param timeInMills 时间戳
 * @return this
 */
@Override
@CacheInterceptor(aof = true)
public ICache<K, V> expireAt(K key, long timeInMills) {
    this.expire.expire(key, timeInMills);
    return this;
}
```

### 变更操作

```java
@Override
@CacheInterceptor(aof = true)
public V put(K key, V value) {
    //1.1 尝试驱除
    CacheEvictContext<K,V> context = new CacheEvictContext<>();
    context.key(key).size(sizeLimit).cache(this);
    boolean evictResult = evict.evict(context);
    if(evictResult) {
        // 执行淘汰监听器
        ICacheRemoveListenerContext<K,V> removeListenerContext = CacheRemoveListenerContext.<K,V>newInstance().key(key).value(value).type(CacheRemoveType.EVICT.code());
        for(ICacheRemoveListener<K,V> listener : this.removeListeners) {
            listener.listen(removeListenerContext);
        }
    }
    //2. 判断驱除后的信息
    if(isSizeLimit()) {
        throw new CacheRuntimeException("当前队列已满，数据添加失败！");
    }
    //3. 执行添加
    return map.put(key, value);
}

@Override
@CacheInterceptor(aof = true)
public V remove(Object key) {
    return map.remove(key);
}

@Override
@CacheInterceptor(aof = true)
public void putAll(Map<? extends K, ? extends V> m) {
    map.putAll(m);
}

@Override
@CacheInterceptor(refresh = true, aof = true)
public void clear() {
    map.clear();
}
```

## AOF 持久化拦截实现

### 持久化对象定义

```java
/**
 * AOF 持久化明细
 * @author binbin.hou
 * @since 0.0.10
 */
public class PersistAofEntry {

    /**
     * 参数信息
     * @since 0.0.10
     */
    private Object[] params;

    /**
     * 方法名称
     * @since 0.0.10
     */
    private String methodName;

    //getter & setter &toString
}
```

这里我们只需要方法名，和参数对象。

暂时实现的简单一些即可。

### 持久化拦截器

我们定义拦截器，当 cache 中定义的持久化类为 `CachePersistAof` 时，将操作的信息放入到 CachePersistAof 的 buffer 列表中。

```java
public class CacheInterceptorAof<K,V> implements ICacheInterceptor<K, V> {

    private static final Log log = LogFactory.getLog(CacheInterceptorAof.class);

    @Override
    public void before(ICacheInterceptorContext<K,V> context) {
    }

    @Override
    public void after(ICacheInterceptorContext<K,V> context) {
        // 持久化类
        ICache<K,V> cache = context.cache();
        ICachePersist<K,V> persist = cache.persist();

        if(persist instanceof CachePersistAof) {
            CachePersistAof<K,V> cachePersistAof = (CachePersistAof<K,V>) persist;

            String methodName = context.method().getName();
            PersistAofEntry aofEntry = PersistAofEntry.newInstance();
            aofEntry.setMethodName(methodName);
            aofEntry.setParams(context.params());

            String json = JSON.toJSONString(aofEntry);

            // 直接持久化
            log.debug("AOF 开始追加文件内容：{}", json);
            cachePersistAof.append(json);
            log.debug("AOF 完成追加文件内容：{}", json);
        }
    }

}
```

### 拦截器调用

当 AOF 的注解属性为 true 时，调用上述拦截器即可。

这里为了避免浪费，只有当持久化类为 AOF 模式时，才进行调用。

```java
//3. AOF 追加
final ICachePersist cachePersist = cache.persist();
if(cacheInterceptor.aof() && (cachePersist instanceof CachePersistAof)) {
    if(before) {
        persistInterceptors.before(interceptorContext);
    } else {
        persistInterceptors.after(interceptorContext);
    }
}
```

## AOF持久化实现

这里的 AOF 模式和以前的 RDB 持久化类只是不同的模式，实际上二者是相同的接口。

### 接口

这里我们统一定义了不同的持久化类的时间，便于 RDB 与 AOF 不同任务的不同时间间隔触发。

```java
public interface ICachePersist<K, V> {

    /**
     * 持久化缓存信息
     * @param cache 缓存
     * @since 0.0.7
     */
    void persist(final ICache<K, V> cache);

    /**
     * 延迟时间
     * @return 延迟
     * @since 0.0.10
     */
    long delay();

    /**
     * 时间间隔
     * @return 间隔
     * @since 0.0.10
     */
    long period();

    /**
     * 时间单位
     * @return 时间单位
     * @since 0.0.10
     */
    TimeUnit timeUnit();
}
```

### 持久化类实现

实现一个 Buffer 列表，用于每次拦截器直接顺序添加。

持久化的实现也比较简单，追加到文件之后，直接清空 buffer 列表即可。

```java
/**
 * 缓存持久化-AOF 持久化模式
 * @author binbin.hou
 * @since 0.0.10
 */
public class CachePersistAof<K,V> extends CachePersistAdaptor<K,V> {

    private static final Log log = LogFactory.getLog(CachePersistAof.class);

    /**
     * 缓存列表
     * @since 0.0.10
     */
    private final List<String> bufferList = new ArrayList<>();

    /**
     * 数据持久化路径
     * @since 0.0.10
     */
    private final String dbPath;

    public CachePersistAof(String dbPath) {
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
        log.info("开始 AOF 持久化到文件");
        // 1. 创建文件
        if(!FileUtil.exists(dbPath)) {
            FileUtil.createFile(dbPath);
        }
        // 2. 持久化追加到文件中
        FileUtil.append(dbPath, bufferList);

        // 3. 清空 buffer 列表
        bufferList.clear();
        log.info("完成 AOF 持久化到文件");
    }

    @Override
    public long delay() {
        return 1;
    }

    @Override
    public long period() {
        return 1;
    }

    @Override
    public TimeUnit timeUnit() {
        return TimeUnit.SECONDS;
    }

    /**
     * 添加文件内容到 buffer 列表中
     * @param json json 信息
     * @since 0.0.10
     */
    public void append(final String json) {
        if(StringUtil.isNotEmpty(json)) {
            bufferList.add(json);
        }
    }

}
```

## 持久化测试

### 测试代码

```java
ICache<String, String> cache = CacheBs.<String,String>newInstance()
        .persist(CachePersists.<String, String>aof("1.aof"))
        .build();
cache.put("1", "1");
cache.expire("1", 10);
cache.remove("2");
TimeUnit.SECONDS.sleep(1);
```

### 测试日志

expire 实际上调用的是 expireAt。

```
[DEBUG] [2020-10-02 12:20:41.979] [main] [c.g.h.c.c.s.i.a.CacheInterceptorAof.after] - AOF 开始追加文件内容：{"methodName":"put","params":["1","1"]}
[DEBUG] [2020-10-02 12:20:41.980] [main] [c.g.h.c.c.s.i.a.CacheInterceptorAof.after] - AOF 完成追加文件内容：{"methodName":"put","params":["1","1"]}
[DEBUG] [2020-10-02 12:20:41.982] [main] [c.g.h.c.c.s.i.a.CacheInterceptorAof.after] - AOF 开始追加文件内容：{"methodName":"expireAt","params":["1",1601612441990]}
[DEBUG] [2020-10-02 12:20:41.982] [main] [c.g.h.c.c.s.i.a.CacheInterceptorAof.after] - AOF 完成追加文件内容：{"methodName":"expireAt","params":["1",1601612441990]}
[DEBUG] [2020-10-02 12:20:41.984] [main] [c.g.h.c.c.s.i.a.CacheInterceptorAof.after] - AOF 开始追加文件内容：{"methodName":"remove","params":["2"]}
[DEBUG] [2020-10-02 12:20:41.984] [main] [c.g.h.c.c.s.i.a.CacheInterceptorAof.after] - AOF 完成追加文件内容：{"methodName":"remove","params":["2"]}
[DEBUG] [2020-10-02 12:20:42.088] [pool-1-thread-1] [c.g.h.c.c.s.l.r.CacheRemoveListener.listen] - Remove key: 1, value: 1, type: expire
[INFO] [2020-10-02 12:20:42.789] [pool-2-thread-1] [c.g.h.c.c.s.p.InnerCachePersist.run] - 开始持久化缓存信息
[INFO] [2020-10-02 12:20:42.789] [pool-2-thread-1] [c.g.h.c.c.s.p.CachePersistAof.persist] - 开始 AOF 持久化到文件
[INFO] [2020-10-02 12:20:42.798] [pool-2-thread-1] [c.g.h.c.c.s.p.CachePersistAof.persist] - 完成 AOF 持久化到文件
[INFO] [2020-10-02 12:20:42.799] [pool-2-thread-1] [c.g.h.c.c.s.p.InnerCachePersist.run] - 完成持久化缓存信息
```

### 文件内容

`1.aof` 的文件内容如下

```
{"methodName":"put","params":["1","1"]}
{"methodName":"expireAt","params":["1",1601612441990]}
{"methodName":"remove","params":["2"]}
```

将每一次的操作，简单的存储到文件中。

# AOF 加载实现

## 加载

类似于 RDB 的加载模式，aof 的加载模式也是类似的。

我们需要根据文件的内容，还原以前的缓存的内容。

实现思路：遍历文件内容，反射调用原来的方法。

## 代码实现

### 解析文件

```java
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
        PersistAofEntry entry = JSON.parseObject(line, PersistAofEntry.class);
        final String methodName = entry.getMethodName();
        final Object[] objects = entry.getParams();
        final Method method = METHOD_MAP.get(methodName);
        // 反射调用
        ReflectMethodUtil.invoke(cache, method, objects);
    }
}
```

### 方法映射的预加载

Method 反射是固定的，为了提升性能，我们做一下预处理。

```java
/**
 * 方法缓存
 *
 * 暂时比较简单，直接通过方法判断即可，不必引入参数类型增加复杂度。
 * @since 0.0.10
 */
private static final Map<String, Method> METHOD_MAP = new HashMap<>();
static {
    Method[] methods = Cache.class.getMethods();
    for(Method method : methods){
        CacheInterceptor cacheInterceptor = method.getAnnotation(CacheInterceptor.class);
        if(cacheInterceptor != null) {
            // 暂时
            if(cacheInterceptor.aof()) {
                String methodName = method.getName();
                METHOD_MAP.put(methodName, method);
            }
        }
    }
}
```

## 测试

### 文件内容

- default.aof

```
{"methodName":"put","params":["1","1"]}
```

### 测试

```java
ICache<String, String> cache = CacheBs.<String,String>newInstance()
        .load(CacheLoads.<String, String>aof("default.aof"))
        .build();

Assert.assertEquals(1, cache.size());
System.out.println(cache.keySet());
```

直接将 default.aof 文件加载到 cache 缓存中。

# 小结

redis 的文件持久化，实际上更加丰富。

可以支持 rdb 和 aof 两种模式混合使用。

aof 模式的文件体积会非常大，redis 为了解决这个问题，会定时对命令进行压缩处理。

可以理解为 aof 就是一个操作流水表，我们实际上关心的只是一个终态，不论中间经过了多少步骤，我们只关心最后的值。

文中主要讲述了思路，实现部分因为篇幅限制，没有全部贴出来。

> 开源地址：[https://github.com/houbb/cache](https://github.com/houbb/cache)

觉得本文对你有帮助的话，欢迎点赞评论收藏关注一波~

你的鼓励，是我最大的动力~

* any list
{:toc}