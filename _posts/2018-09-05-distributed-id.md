---
layout: post
title:  Distributed ID
date:  2018-09-05 08:53:10 +0800
categories: [Distributed]
tags: [id, sql, distributed, design, sh]
published: true
excerpt: 分布式 ID 生成策略
---

# 需求

几乎所有的业务系统，都有生成一个唯一记录标识的需求。

这就引出了记录标识生成（也就是上文提到的三个XXX-id）的两大核心需求：

1. 全局唯一

2. 趋势有序

这也是本文要讨论的核心问题：如何高效生成趋势有序的全局唯一ID。

# UUID

## 策略

UUID/GUID 生成的唯一标识。

## 优缺点

- 优点

本地调用，全局唯一。

- 缺点

无法保证趋势有序，太长。

不利于阅读。

## 优化

- 太长

UUID 可以移除掉所有 `-`，变为 32 位。

- 可读性

```c#
/// <summary>
/// 根据GUID获取唯一数字序列
/// </summary>
public static long GuidToInt64()
{
    byte[] bytes = Guid.NewGuid().ToByteArray();
    return BitConverter.ToInt64(bytes, 0);
}
```

- 无序性

为了解决UUID无序的问题，NHibernate在其主键生成方式中提供了Comb算法（combined guid/timestamp）。

保留GUID的10个字节，用另6个字节表示GUID生成的时间（DateTime）。

```c#
/// <summary> 
/// Generate a new <see cref="Guid"/> using the comb algorithm. 
/// </summary> 
private Guid GenerateComb()
{
    byte[] guidArray = Guid.NewGuid().ToByteArray();
 
    DateTime baseDate = new DateTime(1900, 1, 1);
    DateTime now = DateTime.Now;
 
    // Get the days and milliseconds which will be used to build    
    //the byte string    
    TimeSpan days = new TimeSpan(now.Ticks - baseDate.Ticks);
    TimeSpan msecs = now.TimeOfDay;
 
    // Convert to a byte array        
    // Note that SQL Server is accurate to 1/300th of a    
    // millisecond so we divide by 3.333333    
    byte[] daysArray = BitConverter.GetBytes(days.Days);
    byte[] msecsArray = BitConverter.GetBytes((long)
      (msecs.TotalMilliseconds / 3.333333));
 
    // Reverse the bytes to match SQL Servers ordering    
    Array.Reverse(daysArray);
    Array.Reverse(msecsArray);
 
    // Copy the bytes into the guid    
    Array.Copy(daysArray, daysArray.Length - 2, guidArray,
      guidArray.Length - 6, 2);
    Array.Copy(msecsArray, msecsArray.Length - 4, guidArray,
      guidArray.Length - 4, 4);
 
    return new Guid(guidArray);
}
```

# 当前时间

## 策略

取当前毫秒数 `yyyyMMddHHmmssSSS` 17 位

## 优缺点

- 优点

本地调用，趋势有序。

- 缺点

无法保证唯一性。

## 优化

17 位 + 15 位随机数字。基本保证不会冲突。

时间可以精确到 java.nanoTime() 之类的，可以很精确+随机数。只是不太利于阅读。

# 数据库

## auto_increment 来生成全局唯一递增ID

- 优点

简单，使用数据库已有的功能

能够保证唯一性

能够保证递增性

步长固定

- 缺点：

可用性难以保证：数据库常见架构是一主多从+读写分离，生成自增ID是写请求，主库挂了就玩不转了

扩展性差，性能有上限：因为写入是单点，数据库主库的写性能决定ID的生成性能上限，并且难以扩展

## 冗余主库，避免写入单点

数据水平切分，保证各主库生成的ID不重复

由1个写库变成3个写库，每个写库设置不同的auto_increment初始值，以及相同的增长步长，以保证每个数据库生成的ID是不同的
（库0生成0,3,6,9…，库1生成1,4,7,10，库2生成2,5,8,11…）

改进后的架构保证了可用性。

- 缺点

丧失了ID生成的“绝对递增性”：先访问库0生成0,3，再访问库1生成1，可能导致在非常短的时间内，ID生成不是绝对递增的（这个问题不大，目标是趋势递增，不是绝对递增）

数据库的写压力依然很大，每次生成ID都要访问数据库

## 单点批量 ID 生成服务

分布式系统之所以难，很重要的原因之一是“没有一个全局时钟，难以保证绝对的时序”，要想保证绝对的时序，还是只能使用单点服务，用本地时钟保证“绝对时序”。

数据库写压力大，是因为每次生成ID都访问了数据库，可以使用批量的方式降低数据库写压力。

如上图所述，数据库使用双master保证可用性，数据库中只存储当前ID的最大值，例如0。

ID生成服务假设每次批量拉取6个ID，服务访问数据库，将当前ID的最大值修改为5，这样应用访问ID生成服务索要ID，ID生成服务不需要每次访问数据库，就能依次派发0,1,2,3,4,5这些ID了。

当ID发完后，再将ID的最大值修改为11，就能再次派发6,7,8,9,10,11这些ID了，于是数据库的压力就降低到原来的1/6。

### 优点

保证了ID生成的绝对递增有序

大大的降低了数据库的压力，ID生成可以做到每秒生成几万几十万个

### 缺点

服务仍然是单点

如果服务挂了，服务重启起来之后，继续生成ID可能会不连续，中间出现空洞（服务内存是保存着0,1,2,3,4,5，数据库中max-id是5，分配到3时，服务重启了，下次会从6开始分配，4和5就成了空洞，不过这个问题也不大）

虽然每秒可以生成几万几十万个ID，但毕竟还是有性能上限，无法进行水平扩展

## 备用服务

单点服务的常用高可用优化方案是“备用服务”，也叫“影子服务”。

对外提供的服务是主服务，有一个影子服务时刻处于备用状态，当主服务挂了的时候影子服务顶上。

这个切换的过程对调用方是透明的，可以自动完成，常用的技术是 vip+keepalived，具体就不在这里展开。

# redis

使用时间戳 + Redis 的形式。

比如一天为周期，或者一个小时为周期。

实现较为简单，基本可以满足常见的业务需求。

## 优点

实现简单

性能较好

## 缺点

依赖于 redis 服务。

# snowflake

[官方源码](https://github.com/twitter/snowflake)

## 思想

使用41bit作为毫秒数，10bit作为机器的ID（5个bit是数据中心，5个bit的机器ID），12bit作为毫秒内的流水号（意味着每个节点在每毫秒可以产生 4096 个 ID），最后还有一个符号位，永远是 0。

![snowflak-id](https://user-gold-cdn.xitu.io/2018/2/11/16182507bcefae54?imageView2/0/w/1280/h/960/format/webp/ignore-error/1)

## 实现

TODO:

# 时间回拨问题

由于存在时间回拨问题，但是他又是那么快和简单，我们思考下是否可以解决呢？ 

## 美团解决时钟问题

[Leaf——美团点评分布式ID生成系统](https://tech.meituan.com/MT_Leaf.html) 非常优秀，但是并没有对应的解决方案。

![解决时钟问题](https://tech.meituan.com/img/leaf/snowflake.flow.png)

## 时间回拨的原因

第一：人物操作，在真实环境一般不会有那个傻逼干这种事情，所以基本可以排除。 

第二：由于有些业务等需要，机器需要同步时间服务器（在这个过程中可能会存在时间回拨，查了下我们服务器一般在10ms以内（2小时同步一次））。

## 解决方法

由于是分布在各各机器自己上面，如果要几台集中的机器（并且不做时间同步），那么就基本上就不存在回拨可能性了（曲线救国也是救国，哈哈），但是也的确带来了新问题，各各结点需要访问集中机器，要保证性能，百度的 [uid-generator](https://github.com/baidu/uid-generator) 产生就是基于这种情况做的（每次取一批回来，很好的思想，性能也非常不错）。

## 时间问题回拨的解决方法：

当回拨时间小于15ms，就等时间追上来之后继续生成。

当时间大于15ms时间我们通过更换 workid 来产生之前都没有产生过的来解决回拨问题。

### 调整 workid 段位

Snowflake 算法稍微调整下位段：

- sign(1bit)

固定1bit符号标识，即生成的畅途分布式唯一id为正数。

- delta seconds (38 bits)

当前时间，相对于时间基点"2017-12-21"的增量值，单位：毫秒，最多可支持约8.716年

- worker id (15 bits)

机器id，最多可支持约3.28万个节点。

- sequence (10 bits)

每秒下的并发序列，10 bits，这个算法单机每秒内理论上最多可以生成1000*(2^10)，也就是100W的ID，完全能满足业务的需求。

### 关键

下面到了关键了：

现在我把3万多个workid放到一个队列中（基于redis），由于需要一个集中的地方来管理workId，每当节点启动时候，（先在本地某个地方看看是否有 借鉴弱依赖zk 本地先保存），如果有那么值就作为workid，如果不存在，就在队列中取一个当workid来使用（队列取走了就没了 ），当发现时间回拨太多的时候，我们就再去队列取一个来当新的workid使用，把刚刚那个使用回拨的情况的workid存到队列里面（队列我们每次都是从头取，从尾部进行插入，这样避免刚刚a机器使用又被b机器获取的可能性）。

### 思考

如果引入了redis为啥不用redis下发id？（查看分布式系统唯一ID生成方案汇总会获得答案，我们这里仅仅是用来一致性队列的，能做一致性队列的基本都可以)。

引入redis就意味着引入其他第三方的架构，做基础框架最好是不要引用（越简单越好，目前还在学习提高）。

redis一致性怎么保证？（redis挂了怎么办，怎么同步，的确值得商榷。可能会引入会引入很多新的小问题）。

# MongoDB ObjectId

[MongoDB ObjectId](https://docs.mongodb.com/manual/reference/method/ObjectId/) 和snowflake算法类似。

它设计成轻量型的，不同的机器都能用全局唯一的同种方法方便地生成它。MongoDB 从一开始就设计用来作为分布式数据库，处理多个节点是一个核心要求。

使其在分片环境中要容易生成得多。

## 思路

前 4 个字节是从标准纪元开始的时间戳，单位为秒。时间戳，与随后的5 个字节组合起来，提供了秒级别的唯一性。

由于时间戳在前，这意味着ObjectId 大致会按照插入的顺序排列。这对于某些方面很有用，如将其作为索引提高效率。

这 4 个字节也隐含了文档创建的时间。绝大多数客户端类库都会公开一个方法从 ObjectId 获取这个信息。 

接下来的 3 字节是所在主机的唯一标识符。通常是机器主机名的散列值。这样就可以确保不同主机生成不同的 ObjectId，不产生冲突。 

为
了确保在同一台机器上并发的多个进程产生的ObjectId 是唯一的，接下来的两字节来自产生ObjectId 的进程标识符（PID）。 

前 9 字节保证了同一秒钟不同机器不同进程产生的 ObjectId 是唯一的。

后 3 字节就是一个自动增加的计数器，确保相同进程同一秒产生的 ObjectId 也是不一样的。

同一秒钟最多允许每个进程拥有 2563（16 777 216）个不同的ObjectId。

# Zookeeper

zookeeper主要通过其znode数据版本来生成序列号，可以生成32位和64位的数据版本号，客户端可以使用这个版本号来作为唯一的序列号。

很少会使用 Zookeeper 来生成唯一ID。主要是由于需要依赖zookeeper，并且是多步调用API，如果在竞争较大的情况下，需要考虑使用分布式锁。

因此，性能在高并发的分布式环境下，也不甚理想。

# 拓展阅读

## 二进制

[java 二进制学习](https://houbb.github.io/2018/09/05/java-binary)

# 参考资料

[Leaf——美团点评分布式ID生成系统](https://tech.meituan.com/MT_Leaf.html)

[分布式系统唯一ID生成方案汇总](http://www.cnblogs.com/haoxinyue/p/5208136.html)

[浅谈CAS在分布式ID生成方案上的应用](https://mp.weixin.qq.com/s/QtjpUpl2FF0DKPPHh6HDGg)

[CAS下ABA问题及优化方案](https://mp.weixin.qq.com/s/xMoQk99N2gyz7ftBfcTLGQ)

[分布式ID生成器](https://mp.weixin.qq.com/s/AHRCYOjnXAgcy2j6vziukQ)

- snowflake

https://juejin.im/post/5a7f9176f265da4e721c73a8

[原理讲解](https://segmentfault.com/a/1190000011282426)

- snowflake 源码实现

https://www.cnblogs.com/relucent/p/4955340.html

[Twitter的雪花算法SnowFlake，使用Java语言实现](https://github.com/beyondfengyu/SnowFlake)

[UidGenerator：百度出品的基于 Snowflake 算法的唯一 ID 生成器（Java）](https://toutiao.io/posts/p5nyut/preview)

[UC 实现版本](https://github.com/sumory/uc/blob/master/src/com/sumory/uc/id/IdWorker.java)

- uuid

[guid-uuid-timebased](https://www.famkruithof.net/guid-uuid-timebased.html)

* any list
{:toc}