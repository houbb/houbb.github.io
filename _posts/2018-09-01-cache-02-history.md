---
layout: post
title:  Cache Travel-02-history
date:  2018-09-01 12:24:42 +0800
categories: [Java]
tags: [java, cache, redis, sf]
published: true
---

# IQiyi 的缓存发展之路

## 数据同步加 redis

通过消息队列进行数据同步至redis，然后Java应用直接去取缓存 

- 优点

由于是使用的分布式缓存，所以数据更新快。

- 缺点

缺点也比较明显:依赖Redis的稳定性，一旦redis挂了，整个缓存系统不可用，造成缓存雪崩，所有请求打到 DB。

## JavaMap 到 Guava cache

这个阶段使用进程内缓存作为一级缓存，redis作为二级。

- 优点

不受外部系统影响，其他系统挂了，依然能使用。

- 缺点

进程内缓存无法像分布式缓存那样做到实时更新。

由于java内存有限，必定缓存得设置大小，然后有些缓存会被淘汰，就会有命中率的问题。

## Guava Cache 刷新

为了解决上面的问题，利用Guava Cache可以设置写后刷新时间，进行刷新。解决了一直不更新的问题，但是依然没有解决实时刷新。

## 外部缓存异步刷新

这个阶段扩展了 Guava Cache,利用redis作为消息队列通知机制，通知其他java应用程序进行刷新。
这里简单介绍一下爱奇艺缓存发展的五个阶段，当然还有一些其他的优化，比如GC调优，缓存穿透，缓存覆盖的一些优化等等。有兴趣的同学可以关注公众号，联系我进行交流。

# 原始社会 - 查库

直接查库。简单方便，可以满足最基本的业务需求。

# 古代社会 - HashMap

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

此处可以使用弱引用解决内存一直增长的问题。

当然并不是说他完全就没用，就像我们古代社会也不是所有的东西都是过时的，比如我们中华名族的传统美德是永不过时的，
就像这个hashMap一样的可以在某些场景下作为缓存，当不需要淘汰机制的时候，比如我们利用反射，
如果我们每次都通过反射去搜索 Method, Field，性能必定低效，这时我们用HashMap将其缓存起来，性能能提升很多。

# 近代社会 - LRUHashMap

在古代社会中难住我们的问题无法进行数据淘汰，这样会导致我们内存无限膨胀,显然我们是不可以接受的。

有人就说我把一些数据给淘汰掉呗，这样不就对了，但是怎么淘汰呢？随机淘汰吗？

当然不行，试想一下你刚把A装载进缓存，下一次要访问的时候就被淘汰了，那又会访问我们的数据库了，那我们要缓存干嘛呢？

所以聪明的人们就发明了几种淘汰算法，下面列举下常见的三种FIFO,LRU,LFU（还有一些ARC,MRU感兴趣的可以自行搜索）:

## FIFO

先进先出，在这种淘汰算法中，先进入缓存的会先被淘汰。这种可谓是最简单的了，但是会导致我们命中率很低。

试想一下我们如果有个访问频率很高的数据是所有数据第一个访问的，而那些不是很高的是后面再访问的，那这样就会把我们的首个数据但是他的访问频率很高给挤出。

## LRU

最近最少使用算法。

在这种算法中避免了上面的问题，每次访问数据都会将其放在我们的队尾，如果需要淘汰数据，就只需要淘汰队首即可。

但是这个依然有个问题，如果有个数据在1个小时的前59分钟访问了1万次(可见这是个热点数据),再后一分钟没有访问这个数据，但是有其他的数据访问，就导致了我们这个热点数据被淘汰。

## LFU

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

# 现代社会 - Guava cache

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

我将会从guava cache原理中，解释guava cache是如何解决LRUMap的几个问题的。

# Guava 原理

## 锁竞争

guava cache采用了类似ConcurrentHashMap的思想，分段加锁，在每个段里面各自负责自己的淘汰的事情。

在Guava根据一定的算法进行分段，这里要说明的是，如果段太少那竞争依然很严重，如果段太多会容易出现随机淘汰，
比如大小为100的，给他分100个段，那也就是让每个数据都独占一个段，而每个段会自己处理淘汰的过程，所以会出现随机淘汰。

在guava cache中通过如下代码，计算出应该如何分段。

```java
int segmentShift = 0;
int segmentCount = 1;
while (segmentCount < concurrencyLevel && (!evictsBySize() || segmentCount * 20 <= maxWeight)) {
  ++segmentShift;
  segmentCount <<= 1;
}
```

上面segmentCount就是我们最后的分段数，其保证了每个段至少10个Entry。

如果没有设置concurrencyLevel这个参数，那么默认就会是4，最后分段数也最多为4，例如我们size为100，会分为4段，每段最大的size是25。

在guava cache中对于写操作直接加锁，对于读操作，如果读取的数据没有过期，且已经加载就绪，不需要进行加锁，如果没有读到会再次加锁进行二次读，如果还没有需要进行缓存加载，也就是通过我们配置的CacheLoader，我这里配置的是直接返回Key，在业务中通常配置从数据库中查询。

如下图所示:

```
25
24
...
3
2
1
[Seg1] [Seg2] [Seg3] [Seg4]
```

比如执行代码 `map.put("hello", "hello");`，通过 hash 计算得到分段。lock Seg1。

## 过期时间

相比于LRUMap多了两种过期时间，一个是写后多久过期expireAfterWrite，一个是读后多久过期expireAfterAccess。

很有意思的事情是，在guava cache中对于过期的Entry并没有马上过期(也就是并没有后台线程一直在扫)，

而是通过进行读写操作的时候进行过期处理，这样做的好处是避免后台线程扫描的时候进行全局加锁。

看下面的代码:

```java
public static void main(String[] args) throws ExecutionException, InterruptedException {
    Cache<String, String> cache = CacheBuilder.newBuilder()
            .maximumSize(100)
            //写之后5s过期
            .expireAfterWrite(5, TimeUnit.MILLISECONDS)
            .concurrencyLevel(1)
            .build();
    cache.put("hello1", "我是hello1");
    cache.put("hello2", "我是hello2");
    cache.put("hello3", "我是hello3");
    cache.put("hello4", "我是hello4");
    //至少睡眠5ms
    Thread.sleep(5);
    System.out.println(cache.size());
    cache.put("hello5", "我是hello5");
    System.out.println(cache.size());
}
```

日志输出

```
4 
1
```

从这个结果中我们知道，在put的时候才进行的过期处理。

特别注意的是我上面concurrencyLevel(1)我这里将分段最大设置为1，不然不会出现这个实验效果的，在上面一节中已经说过，我们是以段位单位进行过期处理。

在每个Segment中维护了两个队列:

```java
final Queue<ReferenceEntry<K, V>> writeQueue;

final Queue<ReferenceEntry<K, V>> accessQueue;
```

writeQueue维护了写队列，队头代表着写得早的数据，队尾代表写得晚的数据。

accessQueue维护了访问队列,和LRU一样，用来我们进行访问时间的淘汰，如果当这个Segment超过最大容量，比如我们上面所说的25，超过之后，就会把accessQueue这个队列的第一个元素进行淘汰。

### 处理过期 entry

下面就是guava cache处理过期Entries的过程，会对两个队列一次进行peek操作，如果过期就进行删除。

一般处理过期Entries可以在我们的put操作的前后，或者读取数据时发现过期了，然后进行整个Segment的过期处理，又或者进行二次读lockedGetOrLoad操作的时候调用。


```java
void expireEntries(long now) {
  drainRecencyQueue();
  ReferenceEntry<K, V> e;
  while ((e = writeQueue.peek()) != null && map.isExpired(e, now)) {
    if (!removeEntry(e, e.getHash(), RemovalCause.EXPIRED)) {
      throw new AssertionError();
    }
  }
  while ((e = accessQueue.peek()) != null && map.isExpired(e, now)) {
    if (!removeEntry(e, e.getHash(), RemovalCause.EXPIRED)) {
      throw new AssertionError();
    }
  }
}
```

### 驱除 entry

下面是我们驱逐Entry的时候的代码，可以看见访问的是accessQueue对其队头进行驱逐。

而驱逐策略一般是在对segment中的元素发生变化时进行调用，比如插入操作，更新操作，加载数据操作。

```java
void evictEntries(ReferenceEntry<K, V> newest) {
  ///... 省略无用代码
  while (totalWeight > maxSegmentWeight) {
    ReferenceEntry<K, V> e = getNextEvictable();
    if (!removeEntry(e, e.getHash(), RemovalCause.SIZE)) {
      throw new AssertionError();
    }
  }
}
/**
**返回accessQueue的entry
**/
ReferenceEntry<K, V> getNextEvictable() {
  for (ReferenceEntry<K, V> e : accessQueue) {
    int weight = e.getValueReference().getWeight();
    if (weight > 0) {
      return e;
    }
  }
  throw new AssertionError();
}
```

## 自动刷新

自动刷新操作，在guava cache中实现相对比较简单，直接通过查询，判断其是否满足刷新条件，进行刷新。

## 其他特性

### 虚引用

在Guava cache中，key和value都能进行虚引用的设定，在Segment中的有两个引用队列:

```java
final @Nullable ReferenceQueue<K> keyReferenceQueue;

final @Nullable ReferenceQueue<V> valueReferenceQueue;
```

这两个队列用来记录被回收的引用，其中每个队列记录了每个被回收的Entry的hash，这样回收了之后通过这个队列中的hash值就能把以前的Entry进行删除。

### 删除监听器

在guava cache中，当有数据被淘汰时，但是你不知道他到底是过期，还是被驱逐，还是因为虚引用的对象被回收？

这个时候你可以调用这个方法 `removalListener(RemovalListener listener)` 添加监听器进行数据淘汰的监听，可以打日志或者一些其他处理，可以用来进行数据淘汰分析。

在RemovalCause记录了所有被淘汰的原因:被用户删除，被用户替代，过期，驱逐收集，由于大小淘汰。

# 走向未来-caffeine

guava cache的功能的确是很强大，满足了绝大多数的人的需求，但是其本质上还是LRU的一层封装,所以在众多其他较为优良的淘汰算法中就相形见绌了。

## 命中率

而caffeine cache实现了W-TinyLFU(LFU+LRU算法的变种)。

下面是不同算法的命中率的比较:

![efficiency](https://raw.githubusercontent.com/ben-manes/caffeine/master/wiki/efficiency/search.png)

其中Optimal是最理想的命中率，LRU和其他算法相比的确是个弟弟。

而我们的 W-TinyLFU 是最接近理想命中率的。

## 吞吐性能

当然不仅仅是命中率caffeine优于了guava cache，在读写吞吐量上面也是完爆guava cache。

![throughput](https://raw.githubusercontent.com/ben-manes/caffeine/master/wiki/throughput/compute.png)

# W-TinyLFU

上面已经说过了传统的LFU是怎么一回事。

在LFU中只要数据访问模式的概率分布随时间保持不变时，其命中率就能变得非常高。

这里我还是拿爱奇艺举例，比如有部新剧出来了，我们使用LFU给他缓存下来，这部新剧在这几天大概访问了几亿次，这个访问频率也在我们的LFU中记录了几亿次。

但是新剧总会过气的，比如一个月之后这个新剧的前几集其实已经过气了，但是他的访问量的确是太高了，其他的电视剧根本无法淘汰这个新剧，所以在这种模式下是有局限性。

所以各种LFU的变种出现了，基于时间周期进行衰减，或者在最近某个时间段内的频率。

同样的LFU也会使用额外空间记录每一个数据访问的频率，即使数据没有在缓存中也需要记录，所以需要维护的额外空间很大。

> 可以试想我们对这个维护空间建立一个hashMap，每个数据项都会存在这个hashMap中，当数据量特别大的时候，这个hashMap也会特别大。

再回到LRU，我们的LRU也不是那么一无是处，LRU可以很好的应对突发流量的情况，因为他不需要累计数据频率。

所以W-TinyLFU结合了LRU和LFU，以及其他的算法的一些特点。

[W-TinyLFU](https://github.com/ben-manes/caffeine/wiki/Efficiency#window-tinylfu)

## 频率记录

首先要说到的就是频率记录的问题，我们要实现的目标是利用有限的空间可以记录随时间变化的访问频率。

在W-TinyLFU中使用Count-Min Sketch记录我们的访问频率，而这个也是布隆过滤器的一种变种。

[设计一个现代的缓存](http://biaobiaoqi.github.io/blog/2017/03/19/design-of-a-modern-cache/)

## 读写性能

在guava cache中我们说过其读写操作中夹杂着过期时间的处理，也就是你在一次Put操作中有可能还会做淘汰操作，所以其读写性能会受到一定影响，可以看上面的图中，caffeine的确在读写操作上面完爆guava cache。

主要是因为在caffeine，对这些事件的操作是通过异步操作，他将事件提交至队列，这里的队列的数据结构是RingBuffer,
不清楚的可以看看这篇文章,你应该知道的高性能无锁队列 [Disruptor](https://juejin.im/post/5b5f10d65188251ad06b78e3)。

然后通过会通过默认的ForkJoinPool.commonPool()，或者自己配置线程池，进行取队列操作，然后在进行后续的淘汰，过期操作。

当然读写也是有不同的队列，在caffeine中认为缓存读比写多很多，所以对于写操作是所有线程共享一个Ringbuffer。

对于读操作比写操作更加频繁，进一步减少竞争，其为每个线程配备了一个RingBuffer：

## 数据淘汰策略

在caffeine所有的数据都在ConcurrentHashMap中，这个和guava cache不同，guava cache是自己实现了个类似ConcurrentHashMap的结构。

在caffeine中有三个记录引用的LRU队列:

- Eden队列

在caffeine中规定只能为缓存容量的%1,如果size=100,那这个队列的有效大小就等于1。

这个队列中记录的是新到的数据，防止突发流量由于之前没有访问频率，而导致被淘汰。

比如有一部新剧上线，在最开始其实是没有访问频率的，防止上线之后被其他缓存淘汰出去，而加入这个区域。

伊甸区，最舒服最安逸的区域，在这里很难被其他数据淘汰。

- Probation队列

叫做缓刑队列，在这个队列就代表你的数据相对比较冷，马上就要被淘汰了。

这个有效大小为size减去eden减去protected。

- Protected队列

在这个队列中，可以稍微放心一下了，你暂时不会被淘汰，但是别急，如果Probation队列没有数据了或者Protected数据满了，你也将会被面临淘汰的尴尬局面。

当然想要变成这个队列，需要把Probation访问一次之后，就会提升为Protected队列。这个有效大小为(size减去eden) X 80% 如果size =100，就会是79。

### 数据关系

1. 所有的新数据都会进入Eden。

2. Eden满了，淘汰进入Probation。

3. 如果在Probation中访问了其中某个数据，则这个数据升级为Protected。

4. 如果Protected满了又会继续降级为Probation。

### 数据淘汰

对于发生数据淘汰的时候，会从Probation中进行淘汰，会把这个队列中的数据队头称为受害者，这个队头肯定是最早进入的，按照LRU队列的算法的话那他其实他就应该被淘汰，但是在这里只能叫他受害者，这个队列是缓刑队列，代表马上要给他行刑了。这里会取出队尾叫候选者，也叫攻击者。这里受害者会和攻击者做PK，通过我们的Count-Min Sketch中的记录的频率数据有以下几个判断:

- 如果攻击者大于受害者，那么受害者就直接被淘汰。

- 如果攻击者<=5，那么直接淘汰攻击者。这个逻辑在他的注释中有解释:他认为设置一个预热的门槛会让整体命中率更高。

- 其他情况，随机淘汰。

## 如何使用

对于熟悉Guava的玩家来说如果担心有切换成本，那么你完全就多虑了，caffeine的api借鉴了Guava的api，可以发现其基本一模一样。

```java
public static void main(String[] args) {
    Cache<String, String> cache = Caffeine.newBuilder()
            .expireAfterWrite(1, TimeUnit.SECONDS)
            .expireAfterAccess(1,TimeUnit.SECONDS)
            .maximumSize(10)
            .build();
    cache.put("hello","hello");
}
```

顺便一提的是，越来越多的开源框架都放弃了Guava cache，比如Spring5。

在业务上我也自己曾经比较过Guava cache和caffeine最终选择了caffeine，在线上也有不错的效果。所以不用担心caffeine不成熟，没人使用。

# 参考资料

https://juejin.im/post/5b7593496fb9a009b62904fa

https://redis.io/

https://github.com/google/guava/wiki/CachesExplained

- 淘汰算法

https://en.wikipedia.org/wiki/FIFO_(computing_and_electronics)

https://en.wikipedia.org/wiki/Cache_replacement_policies#Least_recently_used_(LRU)

https://en.wikipedia.org/wiki/Least_frequently_used

[W-TinyLFU](http://highscalability.com/blog/2016/1/25/design-of-a-modern-cache.html)


- 数据结构

https://juejin.im/post/5b5f10d65188251ad06b78e3

各种 map

* any list
{:toc}