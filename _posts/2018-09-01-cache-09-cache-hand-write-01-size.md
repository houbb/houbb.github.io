---
layout: post
title:  Cache Travel-09-从零手写 redis（一）FIFO 淘汰策略原理详解及实现
date:  2018-09-01 12:24:42 +0800
categories: [Cache]
tags: [cache, sh]
published: true
---

# 程序员的三高

前段时间有一位同事体检，体检医生说他三高。

我打趣道，程序员三高不是高性能、高并发、高可用吗？你是哪三高？

每一个追求性能的开发者，都对高性能孜孜不倦地追求着，而缓存是我们踏上这条高性能大道的必经之路。

小到 cpu 设计，大到服务分布式缓存，我们每时每刻都在接触缓存，今天我们就一起学习下缓存的发展之路，以及如何如何手写一个可以指定大小的 cache。


# cache 发展之路

## 古代社会 - HashMap

当我们应用有一定流量之后或者查询数据库特别频繁，这个时候就可以祭出我们的java中自带的HashMap或者ConcurrentHashMap。

我们可以在代码中这么写:

```java
public class CustomerService {
    private HashMap<String,String> hashMap = new HashMap<>();
    private CustomerMapper customerMapper;
    public String getCustomer(String name){
        String customer = hashMap.get(name);
        if ( customer == null){
            customer = customerMapper.get(name);
            hashMap.put(name,customer);
        }
        return customer;
    }
}
```

但是这样做就有个问题HashMap无法进行数据淘汰，内存会无限制的增长，所以hashMap很快也被淘汰了。

比如以前查询，查询 redis，但是希望可以本地缓存放一些热点数据，使用 HashMap 显然无法满足这种需求。

当然，此处可以使用弱引用解决内存一直增长的问题。

当然并不是说他完全就没用，就像我们古代社会也不是所有的东西都是过时的，比如我们中华名族的传统美德是永不过时的，

就像这个hashMap一样的可以在某些场景下作为缓存，当不需要淘汰机制的时候，比如我们利用反射，如果我们每次都通过反射去搜索 Method, Field，性能必定低效，这时我们用HashMap将其缓存起来，性能能提升很多。

## 近代社会 - LRUHashMap

在古代社会中难住我们的问题无法进行数据淘汰，这样会导致我们内存无限膨胀,显然我们是不可以接受的。

有人就说我把一些数据给淘汰掉呗，这样不就对了，但是怎么淘汰呢？随机淘汰吗？

当然不行，试想一下你刚把A装载进缓存，下一次要访问的时候就被淘汰了，那又会访问我们的数据库了，那我们要缓存干嘛呢？

所以聪明的人们就发明了几种淘汰算法，下面列举下常见的三种FIFO,LRU,LFU（还有一些ARC,MRU感兴趣的可以自行搜索）:

### FIFO

先进先出，在这种淘汰算法中，先进入缓存的会先被淘汰。这种可谓是最简单的了，但是会导致我们命中率很低。

试想一下我们如果有个访问频率很高的数据是所有数据第一个访问的，而那些不是很高的是后面再访问的，那这样就会把我们的首个数据但是他的访问频率很高给挤出。

### LRU

最近最少使用算法。

在这种算法中避免了上面的问题，每次访问数据都会将其放在我们的队尾，如果需要淘汰数据，就只需要淘汰队首即可。

但是这个依然有个问题，如果有个数据在1个小时的前59分钟访问了1万次(可见这是个热点数据),再后一分钟没有访问这个数据，但是有其他的数据访问，就导致了我们这个热点数据被淘汰。

### LFU

最近最少频率使用。

在这种算法中又对上面进行了优化，利用额外的空间记录每个数据的使用频率，然后选出频率最低进行淘汰。这样就避免了LRU不能处理时间段的问题。

上面列举了三种淘汰策略，对于这三种，实现成本是一个比一个高，同样的命中率也是一个比一个好。

而我们一般来说选择的方案居中即可，即实现成本不是太高，而命中率也还行的LRU,如何实现一个LRUMap呢？

我们可以通过继承 LinkedHashMap，重写 removeEldestEntry 方法，即可完成一个简单的 LRUMap。

```java
class LRUMap extends LinkedHashMap {
    private final int max;
    private Object lock;
    public LRUMap(int max, Object lock) {
        //无需扩容
        super((int) (max * 1.4f), 0.75f, true);
        this.max = max;
        this.lock = lock;
    }

    /**
     * 重写LinkedHashMap的removeEldestEntry方法即可
     * 在Put的时候判断，如果为true，就会删除最老的
     * @param eldest
     * @return
     */
    @Override
    protected boolean removeEldestEntry(Map.Entry eldest) {
        return size() > max;
    }
    public Object getValue(Object key) {
        synchronized (lock) {
            return get(key);
        }
    }
    public void putValue(Object key, Object value) {
        synchronized (lock) {
            put(key, value);
        }
    }
   
    public boolean removeValue(Object key) {
        synchronized (lock) {
            return remove(key) != null;
        }
    }
    public boolean removeAll(){
        clear();
        return true;
    }
}
```

在LinkedHashMap中维护了一个entry(用来放key和value的对象)链表。在每一次get或者put的时候都会把插入的新entry，或查询到的老entry放在我们链表末尾。

可以注意到我们在构造方法中，设置的大小特意设置到max*1.4，

在下面的removeEldestEntry方法中只需要size>max就淘汰，这样我们这个map永远也走不到扩容的逻辑了，

通过重写LinkedHashMap，几个简单的方法我们实现了我们的LruMap。

## 现代社会 - Guava cache

在近代社会中已经发明出来了LRUMap,用来进行缓存数据的淘汰，但是有几个问题:

- 锁竞争严重，可以看见我的代码中，Lock是全局锁，在方法级别上面的，当调用量较大时，性能必然会比较低。

- 不支持过期时间

- 不支持自动刷新

所以谷歌的大佬们对于这些问题，按捺不住了，发明了Guava cache，在Guava cache中你可以如下面的代码一样，轻松使用:

```java
public static void main(String[] args) throws ExecutionException {
    LoadingCache<String, String> cache = CacheBuilder.newBuilder()
            .maximumSize(100)
            //写之后30ms过期
            .expireAfterWrite(30L, TimeUnit.MILLISECONDS)
            //访问之后30ms过期
            .expireAfterAccess(30L, TimeUnit.MILLISECONDS)
            //20ms之后刷新
            .refreshAfterWrite(20L, TimeUnit.MILLISECONDS)
            //开启weakKey key 当启动垃圾回收时，该缓存也被回收
            .weakKeys()
            .build(createCacheLoader());
    System.out.println(cache.get("hello"));
    cache.put("hello1", "我是hello1");
    System.out.println(cache.get("hello1"));
    cache.put("hello1", "我是hello2");
    System.out.println(cache.get("hello1"));
}

public static com.google.common.cache.CacheLoader<String, String> createCacheLoader() {
    return new com.google.common.cache.CacheLoader<String, String>() {
        @Override
        public String load(String key) throws Exception {
            return key;
        }
    };
}
```

当然，对于性能的追求是无极限的。

还有：

> Caffeine: [https://houbb.github.io/2018/09/09/cache-caffeine](https://houbb.github.io/2018/09/09/cache-caffeine)

> LevelDB: [https://houbb.github.io/2018/09/06/cache-leveldb-01-start](https://houbb.github.io/2018/09/06/cache-leveldb-01-start)

这些性能更加优越的实现，我们后续可以做一下深入学习。

本文，我们来看一下，如何实现一个固定大小的缓存。

# 代码实现

## 接口定义

为了兼容 Map，我们定义缓存接口继承自 Map 接口。

```java
/**
 * 缓存接口
 * @author binbin.hou
 * @since 0.0.1
 */
public interface ICache<K, V> extends Map<K, V> {
}
```

## 核心实现

我们主要看一下 put 时的实现：

```java
@Override
public V put(K key, V value) {
    //1.1 尝试驱除
    CacheEvictContext<K,V> context = new CacheEvictContext<>();
    context.key(key).size(sizeLimit).cache(this);
    cacheEvict.evict(context);
    //2. 判断驱除后的信息
    if(isSizeLimit()) {
        throw new CacheRuntimeException("当前队列已满，数据添加失败！");
    }
    //3. 执行添加
    return map.put(key, value);
}
```

这里我们可以让用户动态指定大小，但是指定大小肯就要有对应的淘汰策略。

否则，固定大小的 map 肯定无法放入元素。

## 淘汰策略

淘汰策略可以有多种，比如 LRU/LFU/FIFO 等等，我们此处实现一个最基本的 FIFO。

所有实现以接口的方式实现，便于后期灵活替换。

```java
public class CacheEvictFIFO<K,V> implements ICacheEvict<K,V> {

    /**
     * queue 信息
     * @since 0.0.2
     */
    private Queue<K> queue = new LinkedList<>();

    @Override
    public void evict(ICacheEvictContext<K, V> context) {
        final ICache<K,V> cache = context.cache();
        // 超过限制，执行移除
        if(cache.size() >= context.size()) {
            K evictKey = queue.remove();
            // 移除最开始的元素
            cache.remove(evictKey);
        }

        // 将新加的元素放入队尾
        final K key = context.key();
        queue.add(key);
    }

}
```

FIFO 比较简单，我们使用一个队列，存储每一次放入的元素，当队列超过最大限制时，删除最早的元素。

## 引导类

为了便于用户使用，我们实现类似于 guava 的引导类。

所有参数都提供默认值，使用 fluent 流式写法，提升用户体验。

```java
/**
 * 缓存引导类
 * @author binbin.hou
 * @since 0.0.2
 */
public final class CacheBs<K,V> {

    private CacheBs(){}

    /**
     * 创建对象实例
     * @param <K> key
     * @param <V> value
     * @return this
     * @since 0.0.2
     */
    public static <K,V> CacheBs<K,V> newInstance() {
        return new CacheBs<>();
    }

    /**
     * map 实现
     * @since 0.0.2
     */
    private Map<K,V> map = new HashMap<>();

    /**
     * 大小限制
     * @since 0.0.2
     */
    private int size = Integer.MAX_VALUE;

    /**
     * 驱除策略
     * @since 0.0.2
     */
    private ICacheEvict<K,V> evict = CacheEvicts.fifo();

    /**
     * map 实现
     * @param map map
     * @return this
     * @since 0.0.2
     */
    public CacheBs<K, V> map(Map<K, V> map) {
        ArgUtil.notNull(map, "map");

        this.map = map;
        return this;
    }

    /**
     * 设置 size 信息
     * @param size size
     * @return this
     * @since 0.0.2
     */
    public CacheBs<K, V> size(int size) {
        ArgUtil.notNegative(size, "size");

        this.size = size;
        return this;
    }

    /**
     * 设置驱除策略
     * @param evict 驱除策略
     * @return this
     * @since 0.0.2
     */
    public CacheBs<K, V> evict(ICacheEvict<K, V> evict) {
        this.evict = evict;
        return this;
    }

    /**
     * 构建缓存信息
     * @return 缓存信息
     * @since 0.0.2
     */
    public ICache<K,V> build() {
        CacheContext<K,V> context = new CacheContext<>();
        context.cacheEvict(evict);
        context.map(map);
        context.size(size);

        return new Cache<>(context);
    }

}
```

## 测试使用

```java
ICache<String, String> cache = CacheBs.<String,String>newInstance()
        .size(2)
        .build();
cache.put("1", "1");
cache.put("2", "2");
cache.put("3", "3");
cache.put("4", "4");
Assert.assertEquals(2, cache.size());
System.out.println(cache.keySet());
```

默认为先进先出的策略，此时输出 keys，内容如下：

```
[3, 4]
```

# FIFO 淘汰策略的不足

## Belady现象

Belady现象：在采用FIFO算法时，有时会出现的物理页面数增加，缺页率反而提高的异常现象。

Belady现象原因：FIFO算法的置换特征与进程访问内存的动态特征是矛盾的，与置换算法的目标是不一致的（即替换较少使用的页面），因此，被它置换出去的页面不一定是进程不会访问的。

# 小结

到这里，一个简易版的可以指定大小的缓存就实现了。

完整代码暂时本项目还没开源，可以关注【老马啸西风】，后台回复缓存，获取源码。

目前为止，这个缓存实现是比较简单的，显然难以满足我们平时更加灵活的应用场景。

我们下一节将一起学习一下如何实现一个可以指定过期的缓存。

* any list
{:toc}