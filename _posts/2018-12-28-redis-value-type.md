---
layout: post
title: Redis 存储值的类型
date: 2018-12-28 10:59:54 +0800
categories: [NoSQL]
tags: [nosql, redis, sh]
published: true
excerpt: Redis 存储值的类型
---

# Redis 提供的值存储类型

Redis为我们提供了5种数据类型，基本上我们使用频率最高的就是String，而对其他四种数据类型使用的频次稍弱于String。

原因在于：

- string 

String使用起来比较简单，可以方便存储复杂的对象，使用场景比较多；

- expire 

由于Redis expire time只能设置在key上，像List、Hash、Set、Zset属于集合类型，会管理一组item，我们无法在这些集合的item上设置过期时间，所以使用expiretime来处理集合的cache失效会变得稍微复杂些。但是String使用expire time来管理过期策略会比较简单，因为它包含的项少。这里说的集合是宽泛的类似集合。

- 其他的数据结构

从更深层次来看，我们对另外四种数据类型的使用和原理并不是太了解。所以这个时候往往会忽视在特定场景下使用某种数据类型会比String性能高出很多的可能性，比如使用Hash结构来提高某实体某个项的修改等。

这里我们不打算罗列这5种数据类型的使用方法，因为这些资料网上有很多。我们主要讨论这5种数据类型的功能特点，弄清楚它们分别适合用于处理哪些现实的业务场景，我们又该如何组合性使用这5种数据类型，找到解决复杂cache问题的最优方案。

# String 

String是Redis提供的字符串类型。可以针对String类型独立设置expire time，通常用来存储长字符串数据，比如某个对象的json字符串。

在使用上，String类型最巧妙的是可以动态拼接key。通常我们可以将一组id放在Set里，然后动态查找String还是否存在，如果不存在说明已经过期或者由于数据修改主动delete了，需要再做一次cache数据load。

虽然Set无法设置item的过期时间，但是我们可以将Set Item与String Key关联来达到相同的效果。

下图中的左边是一个key为Set:order:ids的Set集合，它可能是一个全量集合，也可能是某个查询条件获取出来的一个集合：

![string-type](https://img-blog.csdnimg.cn/20181225221801768)

有时候复杂点的场景需要多个Set集合来支撑计算，在Redis服务器里可能会有很多类似这样的集合。这些集合我们可以称为功能数据，这些数据是用来辅助cache计算的，当进行各种集合运算之后会得出当前查询需要返回的子集，最后我们才会去获取某个订单真正的数据。

这些 `String:order:{orderId}` 字符串key并不一定是为了服务一种场景，而是整个系统最底层的数据，各种场景最后都需要获取这些数据。那些Set集合可以认为是查询条件数据，用来辅助查询条件的计算。

Redis为我们提供了TYPE命令来查看某个key的数据类型，如String类型：

```
SET string:order:100 order-100

TYPE string:order:100

string
```

# List

List在提高throughput的场景中非常适用，因为它特有的LPUSH、RPUSH、LPOP、RPOP功能可以无缝的支持生产者、消费者架构模式。

这非常适合实现类似Java Concurrency Fork/Join框架中的work-stealing算法（工作窃取）。

注：Java Fork/Join框架使用并行来提高性能，但是会带来由于并发take task带来的race condition（竞态条件）问题，所以采用work-stealing算法来解决由于竞争问题带来的性能损耗。

下图中模拟了一个典型的支付callback峰值场景：

![type-list](https://img-blog.csdnimg.cn/20181225221801866)

在峰值出现的地方一般我们都会使用加buffer的方式来加快请求处理速度，这样才能提高并发处理能力，提高through put。

支付gateway收到callback之后不做任何处理直接交给分发器。

分发器是一个无状态的cluster，每个node通过向注册中心pull handler queue list，也就是获取下游处理器注册到注册中心里的消息通道。每一个分发器node会维护一个本地queue list，然后顺序推送消息到这些queue list即可。

这里会有点小问题，就是支付gateway调用分发器的时候，是如何做load balance？如果不是平均负载可能会有某个queue list高出其他queue list。

而分发器不需要做soft load balance，因为哪怕某个queue list比其他queue list多也无所谓，因为下游message handler会根据work-stealing算法来窃取其他消费慢的queue list。

Redis List的LPUSH、RPUSH、LPOP、RPOP特性确实可以在很多场景下提高这种横向扩展计算能力。

# Hash

Hash数据类型很明显是基于Hash算法的，对于项的查找时间复杂度是O(1)的，在极端情况下可能出现项Hash冲突问题，Redis内部是使用链表加key判断来解决的。具体Redis内部的数据结构我们在后面有介绍，这里就不展开了。

Hash数据类型的特点通常可以用来解决带有映射关系，同时又需要对某些项进行更新或者删除等操作。如果不是某个项需要维护，那么一般可以通过使用String来解决。

如果有需要对某个字段进行修改，使用String很明显会多出很多开销，需要读取出来反序列化成对象然后操作，然后再序列化写回Redis，这中间可能还有并发问题。

那我们可以使用Redis Hash提供的实体属性Hash存储特性，我们可以认为Hash Value是一个Hash Table，实体的每一个属性都是通过Hash得到属性的最终数据索引。

下图使用Hash数据类型来记录页面的a/bmetrics：

![type-hash](https://img-blog.csdnimg.cn/20181225221801882)


左边的是首页index的各个区域的统计，右边是营销marketing的各个区域统计。

在程序里我们可以很方便的使用Redis的atomic特性对Hash某个项进行累加操作。

```
HMSET hash:mall:page:ab:metrics:index topbanner 10 leftbanner 5 rightbanner 8 bottombanner 20 productmore 10 topshopping 8

OK

HGETALL hash:mall:page:ab:metrics:index

 1) "topbanner"

 2) "10"

 3) "leftbanner"

 4) "5"

 5) "rightbanner"

 6) "8"

 7) "bottombanner"

 8) "20"

 9) "productmore"

10) "10"

11) "topshopping"

12) "8"

HINCRBY hash:mall:page:ab:metrics:index topbanner 1

(integer) 11
```

使用Redis Hash Increment进行原子增加操作。HINCRBY命令可以原子增加任何给定的整数，也可以通过HINCRBYFLOAT来原子增加浮点类型数据。

# Set

Set集合数据类型可以支持集合运算，不能存储重复数据。

Set最大的特点就是集合的计算能力，inter交集、union并集、diff差集，这些特点可以用来做高性能的交叉计算或者剔除数据。

Set集合在使用场景上还是比较多和自由的。举个简单的例子，在应用系统中比较常见的就是商品、活动类场景。

用一个Set缓存有效商品集合，再用一个Set缓存活动商品集合。如果商品出现上下架操作只需要维护有效商品Set，每次获取活动商品的时候需要过滤下是否有下架商品，如果有就需要从活动商品中剔除。

当然，下架的时候可以直接删除缓存的活动商品，但是活动是从marketing系统中load出来的，就算我将cache里的活动商品删除，当下次再从marketing系统中load活动商品时候还是会有下架商品。

当然这只是举例，一个场景有不同的实现方法。

下图中左右两边是两个不同的集合：

![type-set](https://img-blog.csdnimg.cn/20181225221801897)

左边是营销域中的可用商品ids集合，右边是营销域中活动商品ids集合，中间计算出两个集合的交集。

```
SADD set:marketing:product:available:ids 1000100 1000120 1000130 1000140 1000150 1000160

SMEMBERS set:marketing:product:available:ids

1) "1000100"

2) "1000120"

3) "1000130"

4) "1000140"

5) "1000150"

6) "1000160"

SADD set:marketing:activity:product:ids 1000100 1000120 1000130 1000140 1000200 1000300

SMEMBERS set:marketing:activity:product:ids

1) "1000100"

2) "1000120"

3) "1000130"

4) "1000140"

5) "1000200"

6) "1000300"

SINTER set:marketing:product:available:ids set:marketing:activity:product:ids

1) "1000100"

2) "1000120"

3) "1000130"

4) "1000140"
```

在一些复杂的场景中，也可以使用SINTERSTORE命令将交集计算后的结果存储在一个目标集合中。这在使用pipeline命令管道中特别有用，将SINTERSTORE命令包裹在pipeline命令串中可以重复使用计算出来的结果集。

由于Redis是Signle-Thread单线程模型，基于这个特性我们就可以使用Redis提供的pipeline管道来提交一连串带有逻辑的命令集合，这些命令在处理期间不会被其他客户端的命令干扰。

# Zset

Zset排序集合与Set集合类似，但是Zset提供了排序的功能。在介绍Set集合的时候我们知道Set集合中的成员是无序的，Zset填补了集合可以排序的空隙。

Zset最强大的功能就是可以根据某个score比分值进行排序，这在很多业务场景中非常急需。比如，在促销活动里根据商品的销售数量来排序商品，在旅游景区里根据流入人数来排序热门景点等。基本上人们在做任何事情都需要根据某些条件进行排序。

其实Zset在我们应用系统中能用到地方到处都是，这里我们举一个简单的例子，在团购系统中我们通常需要根据参团人数来排序成团列表，大家都希望参加那些即将成团的团。

下图是一个根据团购code创建的Zset，score分值就是参团人数累加和：

![type-zset](https://img-blog.csdnimg.cn/20181225221801914)


## 案例

```
ZADD zset:marketing:groupon:group:codes 5 G_PXYJY9QQFA 8 G_4EXMT6NZJQ 20 G_W7BMF5QC2P 10 G_429DHBTGZX 8 G_KHZGH9U4PP



ZREVRANGEBYSCORE zset:marketing:groupon:group:codes 1000 0

1) "G_W7BMF5QC2P"

2) "G_ZMZ69HJUCB"

3) "G_429DHBTGZX"

4) "G_KHZGH9U4PP"

5) "G_4EXMT6NZJQ"

6) "G_PXYJY9QQFA"



ZREVRANGEBYSCORE zset:marketing:groupon:group:codes 1000 0 withscores

 1) "G_W7BMF5QC2P"

 2) "20"

 3) "G_ZMZ69HJUCB"

 4) "10"

 5) "G_429DHBTGZX"

 6) "10"

 7) "G_KHZGH9U4PP"

 8) "8"

 9) "G_4EXMT6NZJQ"

10) "8"

11) "G_PXYJY9QQFA"

12) "5"
```

Zset本身提供了很多方法用来进行集合的排序，如果需要score分值，可以使用withscore字句带出每一项的分值。

在一些比较特殊的场合可能需要组合排序，可能有多个Zset分别用来对同一个实体在不同维度的排序，按时间排序、按人数排序等。这个时候就可以组合使用Zset带来的便捷性，利用pipeline再结合多个Zset最终得出组合排序集合。

# 参考资料

[Redis存储总用String？](https://mp.weixin.qq.com/s/tG_IgWPm4j3SVzVxtjRthQ)

https://blog.csdn.net/gupao123456/article/details/85255100

* any list
{:toc}