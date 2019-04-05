---
layout: post
title: Redis Learn-02-Redis 性能为什么这么好
date: 2018-12-12 11:35:23 +0800
categories: [Redis]
tags: [redis, cache, why-so-fast, sh]
published: true
---

# Redis 的性能为何如此好？

无论是为了面试，还是为了更好的使用 Redis，我们都应该对 Redis 为什么性能这么好进行学习。

我以前的理解：

1. Redis 采用 C++ 编写，语言层面具有优势。

2. Redis 使用单线程，避免了线程切换带来的开销。

3. 相比于数据库的数据存储在硬盘，Redis 的数据都是加载到内存中的，速度非常快。

## 更进一步的学习

以前对于 Redis 的学习一直是故步自封的，其中很多东西都没有去深究。

今天，让我们一起对 Redis 进行更进一步的学习。


## Redis 的性能优势

- 内存

- C 编写

- 单线程

- 高效的数据结构

- 合理的数据编码

- 其他方面的优化

# 高效的数据结构

可以参见 [Redis 存储值的类型](https://houbb.github.io/2018/12/28/redis-value-type)

# SDS

Redis是用C语言开发完成的，但在Redis字符串中，并没有使用C语言中的字符串，而是用一种称为SDS（simple dynamic string）的结构体来保存字符串，SDS的结构如下

## 数据结构

```c
struct sdshdr {
 
    int len;
 
    int free;
 
    char buf[];
};
```

len：用于记录buf中已使用空间的长度

free：buf中空闲空间的长度

buf[]：存储实际内容

例如：执行命令set key value，key和value都是一个SDS类型的结构存储在内存中

## SDS与C字符串的区别

### 1、常数时间内获得字符串长度

C字符串本身不记录长度信息，每次获取长度信息都需要遍历整个字符串，复杂度为O(n)

C字符串遍历时遇到'\0'时结束

SDS中len字段保存着字符串的长度，所以总能在常数时间内获取字符串长度，复杂度是O(1)

### 2、避免缓冲区溢出

假设在内存中有两个紧挨着的两个字符串，s1=“xxxxx”和s2=“yyyyy”，由于在内存上紧紧相连，当我们对s1进行扩充的时候，将s1=“xxxxxzzzzz”后，由于没有进行相应的内存重新分配，导致s1把s2覆盖掉，导致s2被莫名其妙的修改

但SDS的API对zfc修改时首先会检查空间是否足够，若不充足则会分分配新空间，避免了缓冲区溢出问题。

### 3、减少字符串修改时带来的内存重新分配的次数

在C中，当我们频繁的对一个字符串进行修改（append或trim）操作的时候，需要频繁的进行内存重新分配的操作，十分影响性能。

如果不小心忘记，有可能会导致内存溢出或内存泄漏，对于Redis来说，本身就会很频繁的修改字符串，所以使用C字符串并不合适。

而SDS实现了空间预分配和惰性空间释放两种优化策略

- 空间预分配

当SDS的API对一个SDS修改后，并且对SDS空间扩充时，程序不仅会为SDS分配所需要的必须空间，还会分配额外的未使用空间，分配规则如下：

如果对SDS修改后，len的长度小于1M，那么程序将分配和len相同长度的未使用空间。举个例子，如果len=10，重新分配后，buf的实际长度会变为10(已使用空间)+10(额外空间)+1(空字符)=21。

如果对SDS修改后len长度大于1M，那么程序将分配1M的未使用空间

- 惰性空间释放

当对SDS进行缩短操作时，程序并不会回收多余的内存空间，而是使用free字段将这些字节数量记录下来不释放，后面如果需要append操作，则直接使用free中未使用的空间，减少了内存的分配。

### 4、二进制安全

在Redis中不仅可以存储String类型的数据，也可能存储一些二进制数据。

二进制数据并不是规则的字符串格式，其中会包含一些特殊的字符如'\0'，在C中遇到'\0'则表示字符串的结束，但在SDS中，标志字符串结束的是len属性。

# 字典

与JAVA中的HashMap类似，Redis中的Hash比JAVA中的更高级一些。

## 数据结构

Redis本身就是KV服务器，除了Redis本身数据库之外，字典也是哈希键的底层实现，字典的数据结构如下所示

- dict

```c
typedef struct dict{
    dictType *type;
    void *privdata;
    dictht ht[2];
    int trehashidx;
}
```

- dictht

```c
typedef struct dictht{
    //哈希表数组
    dectEntrt **table;
    //哈希表大小
    unsigned long size;
    //
    unsigned long sizemask;
    //哈希表已有节点数量
    unsigned long used;
}
```

重要的两个字段是dictht和trehashidx，这两个字段与rehash有关，下面重点介绍rehash。

## Rehash

学过JAVA的朋友都应该知道HashMap是如何rehash的，在此处我就不过多赘述，下面介绍redis中Rehash的过程。

由上段代码，我们可知dict中存储了一个dictht的数组，长度为2，表名这个数据结构中实际存储着两个哈希表`ht[0]`和`ht[1]`，为什么要存储两张hash表呢？？

当然是为了rehash，rehash的过程如下：

1）为ht[1]分配空间

如果是扩容操作，ht[1]的大小为第一个大于等于ht[0].used*2的2^n；

如果是缩容操作，ht[1]的大小为第一个大于等于ht[0].used的2^n；

2）将ht[0]中的键值rehash到ht[1]中

3）当ht[0]全部迁移到ht[1]中后，释放ht[0]，将ht[1]置为ht[0]，并为ht[1]创建一张新表，为下次rehash做准备

## 渐进式 Rehash

由于Redis是的rehash操作是将ht[0]中的键值全部迁移到ht[1]，如果数据量小，则迁移过程很快，但如果数据量很大，一个hash表中存储了几万甚至几百万几千万的键值时，迁移过程很慢并会影响到其他用户的使用，为了避免rehash对服务器性能造成影响，Redis采用了一种渐进式Rehash的策略，分多次、渐进的将ht[0]中的数据迁移到ht[1]中，前一过程如下：

为ht[1]分配空间，让字典同时拥有ht[0]和ht[1]两个哈希表

字典中维护一个rehashidx，并将它置为0，表示rehash开始

在rehash期间，每次对字典操作时，程序还顺便将ht[0]在rehashidx索引上的所有键值对rehash到ht[1]中，当rehash完成后，将rehashidx属性增一

当全部rehash完成后，将rehashidx置为-1，表示rehash完成

注意，由于维护了两张hash表，所以在rehash的过程中内存会增长。

另外，在rehash过程中，字典会同时使用ht[0] 和ht[1]，所以在删除、查找、更新时会在两张表中操作，在查询时会现在第一张表中查询，如果第一张表中没有，则会在第二张表中查询。

但新增时一律会在ht[1]中进行，确保ht[0]中的数据只会减少不会增加。

# 跳跃表

zset是一个有序的链表结构，其底层的数据结构是跳跃表skiplist,其结构如下：

## 数据结构

```c
typedef struct zskiplistNode {
//成员对象
robj *obj;
//分值
double score;
//后退指针
struct zskiplistNode *backward;
//层
    struct zskiplistLevel {
        struct zskiplistNode *forward;//前进指针
        unsigned int span;//跨度
    } level[];
} zskiplistNode;
```

```c
typedef struct zskiplist {
//表头节点和表尾节点
struct zskiplistNode *header, *tail;
//表中节点的的数量
unsigned long length;
//表中层数最大的节点层数
int level;
} zskiplist;
```

![skiplist](https://img-blog.csdnimg.cn/20190128133601455.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L251b1dlaV9TZW5MaW4=,size_16,color_FFFFFF,t_70)

## 和普通链表的区别

和普通链表的区别是：普通列表遍历时只能顺序遍历，而跳跃表的结构决定了其查询和速度很快，因为有前进指针、后退指针和跨度。

前进指针：用于从表头向表尾方向遍历。

后退指针：用于从表尾向表头方向回退一个节点，和前进指针不同的是，前进指针可以一次性跳跃多个节点，后退指针每次只能后退到上一个节点。

跨度：表示当前节点和下一个节点的距离，跨度越大，两个节点中间相隔的元素越多。

在查询过程中跳跃着前进。由于存在后退指针，如果查询时超出了范围，通过后退指针回退到上一个节点后仍可以继续向前遍历。

# 压缩列表

压缩列表ziplist是为Redis节约内存而开发的，是列表键和字典键的底层实现之一。

当元素个数较少时，Redis用ziplist来存储数据，当元素个数超过某个值时，链表键中会把ziplist转化为linkedlist，字典键中会把ziplist转化为hashtable。 

ziplist是由一系列特殊编码的连续内存块组成的顺序型的数据结构，ziplist中可以包含多个entry节点，每个节点可以存放整数或者字符串。

![压缩链表](https://img-blog.csdnimg.cn/20190128135419477.png)

由于**内存是连续分配的，所以遍历速度很快。**

# 编码转化

Redis使用对象（redisObject）来表示数据库中的键值，当我们在Redis中创建一个键值对时，至少创建两个对象，一个对象是用做键值对的键对象，另一个是键值对的值对象。

例如我们执行 `SET MSG XXX` 时，键值对的键是一个包含了字符串“MSG“的对象，键值对的值对象是包含字符串"XXX"的对象, 

## 数据结构

redisObject 的结构如下：

```c
typedef struct redisObject{
    //类型
    unsigned type:4;
 
    //编码
    unsigned encoding:4;
 
    //指向底层数据结构的指针
    void *ptr;
 
    //...
}robj;
```

其中：

type字段记录了对象的类型，包含字符串对象、列表对象、哈希对象、集合对象、有序集合对象。

## 测试例子

当我们执行 type key 命令时返回的结果如下

```
127.0.0.1:6379> set str aaa
OK
127.0.0.1:6379> type str
string

127.0.0.1:6379> lpush list a b c
(integer) 3
127.0.0.1:6379> type list
list

127.0.0.1:6379> hset hash name aaa
(integer) 1
127.0.0.1:6379> type hash
hash

127.0.0.1:6379> ZADD zset 10 value
(integer) 1
127.0.0.1:6379> type zset
zset

127.0.0.1:6379> sadd set a b c
(integer) 3
127.0.0.1:6379> type set
set
```

ptr指针字段指向对象底层实现的数据结构，而这些数据结构是由encoding字段决定的，每种对象至少有两种数据编码

![数据结构](https://img-blog.csdnimg.cn/20190130103059698.png)


## 查看编码

可以通过 `object encoding key` 来查看对象所使用的编码

```
127.0.0.1:6379> keys *
1) "set"
2) "hash"
3) "zset"
4) "list"
5) "str"
127.0.0.1:6379> object encoding str
"embstr"
127.0.0.1:6379> object encoding list
"quicklist"
127.0.0.1:6379> object encoding set
"hashtable"
127.0.0.1:6379> object encoding zset
"ziplist"
127.0.0.1:6379> object encoding hash
"ziplist"
```

面介绍到，ziplist是一种结构紧凑的数据结构，当某一键值中所包含的元素较少时，会优先存储在ziplist中，当元素个数超过某一值后，才将ziplist转化为标准存储结构，而这一值是可配置的。

## 一、String对象的编码转化

String对象的编码可以是int或raw，对于String类型的键值，如果我们存储的是纯数字，Redis底层采用的是int类型的编码，如果其中包括非数字，则会立即转为raw编码

```
127.0.0.1:6379> set str 1
OK
127.0.0.1:6379> object encoding str
"int"
127.0.0.1:6379> set str 1a
OK
127.0.0.1:6379> object encoding str
"raw"
127.0.0.1:6379>
```

## 二、List对象的编码转化

List对象的编码可以是ziplist或linkedlist，对于List类型的键值，当列表对象同时满足一下两个条件时采用ziplist编码

1. 列表对象保存的所有字符串元素的长度都小于64字节

2. 列表对象保存的元素个数小于512个

如果不满足这两个条件的任意一个，就会转化为linkedlist编码

注意：这两个条件是可以修改的，在redis.conf中

```
list-max-ziplist-entries 512
list-max-ziplist-value 64
```

## 三、Set类型的编码转化

Set对象的编码可以是intset或hashtable，intset编码的结婚对象使用整数集合作为底层实现，把所有元素都保存在一个整数集合里面。

```
127.0.0.1:6379> sadd set 1 2 3
(integer) 3
127.0.0.1:6379> object encoding set
"intset"
```

如果set集合中保存了非整数类型的数据时，Redis会将intset转化为hashtable

```
127.0.0.1:6379> sadd set 1 2 3
(integer) 3
127.0.0.1:6379> object encoding set
"intset"
127.0.0.1:6379> sadd set a
(integer) 1
127.0.0.1:6379> object encoding set
"hashtable"
```

当Set对象同时满足一下两个条件时，对象采用intset编码

1. 保存的所有元素都是整数值（小数不行）

2. Set对象保存的所有元素个数小于512个

不能满足这两个条件的任意一个，Set都会采用hashtable存储

注意：第两个条件是可以修改的，在redis.conf中

```
set-max-intset-entries 512
```

## Hash对象的编码转化

Hash对象的编码可以是ziplist或hashtable，当Hash以ziplist编码存储的时候，保存同一键值对的两个节点总是紧挨在一起，键节点在前，值节点在后

```
zlbytes	zltail	zllen	name	tom	age	25	career	programmer	zlend
```
 
当Hash对象同时满足一下两个条件时，Hash对象采用ziplist编码

1. Hash对象保存的所有键值对的键和值的字符串长度均小于64字节

2. Hash对象保存的键值对数量小于512个

如果不满足以上条件的任意一个，ziplist就会转化为hashtable编码

注意：这两个条件是可以修改的，在redis.conf中

```
hash-max-ziplist-entries 512
hash-max-ziplist-value 64
```

## 五、Zset对象的编码转化

Zset对象的编码可以是ziplist或zkiplist，当采用ziplist编码存储时，每个集合元素使用两个紧挨在一起的压缩列表来存储。第一个节点存储元素的成员，第二个节点存储元素的分值，并且按分值大小从小到大有序排列。

```
zlbytes	zltail	zllen	java	5.0	python	6.0	html	7.0	zlend
```
 

当Zset对象同时满足一下两个条件时采用ziplist编码

1. Zset保存的元素个数小于128

2. Zset元素的成员长度都小于64字节

如果不满足以上条件的任意一个，ziplist就会转化为zkiplist编码

注意：这两个条件是可以修改的，在redis.conf中

```
zset-max-ziplist-entries 128
zset-max-ziplist-value 64
```

- 思考：Zset如何做到O(1)复杂度内定位元素并且快速进行范围操作？

Zset采用skiplist编码时使用zset结构作为底层实现，该数据结构同时包含了一个跳跃表和一个字典，其结构如下：

```c
typedef struct zset{
    zskiplist *zsl;
    dict *dict;
}
```

Zset中的dict字典为集合创建了一个从成员到分值之间的映射，字典中的键保存了成员，字典中的值保存了成员的分值，这样定位元素时时间复杂度是O(1)

Zset中的zsl跳跃表适合范围操作，比如ZRANK、ZRANGE等，程序使用zkiplist。

另外，虽然zset中使用了dict和skiplist存储数据，但这两种数据结构都会通过指针来共享相同的内存，所以没有必要担心内心的浪费。


# 过期数据的删除对Redis性能影响

当我们对某些key设置了expire时，数据到了时间会自动删除。如果一个键过期了，它会在什么时候删除呢？

## 删除策略

下面介绍三中删除策略

定时删除：在这是键的过期时间的同时，创建一个定时器Timer，让定时器在键过期时间来临时立即执行对过期键的删除。

惰性删除：键过期后不管，每次读取该键时，判断该键是否过期，如果过期删除该键返回空。

定期删除：每隔一段时间对数据库中的过期键进行一次检查。

定时删除：对内存友好，对CPU不友好。如果过期删除的键比较多的时候，删除键这一行为会占用相当一部分CPU性能，会对Redis的吞吐量造成一定影响。

惰性删除：对CPU友好，内存不友好。如果很多键过期了，但在将来很长一段时间内没有很合客户端访问该键导致过期键不会被删除，占用大量内存空间。

定期删除：是定时删除和惰性删除的一种折中。每隔一段时间执行一次删除过期键的操作，并且限制删除操作执行的时长和频率，具体的操作如下：

## Redis 删除方式

redis会将每一个设置了expire的键存储在一个独立的字典中，以后会定时遍历这个字典来删除过期的key。

除了定时遍历外，它还会使用惰性删除策略来删除过期的key。

redis默认每秒进行十次过期扫描，过期扫描不会扫描所有过期字典中的key，而是采用了一种简单的贪心策略。

1. 从过期字典中随机选择20个key

2. 删除这20个key中已过期的key

3. 如果过期key比例超过1/4，那就重复步骤1

同时，为了保证在过期扫描期间不会出现过度循环，导致线程卡死，算法还增加了扫描时间上限，默认不会超过25ms

# Redis 的缺点

- 所有中间件的通病

增加开发者的学习成本，增加运维人员的运维成本，增加架构的复杂性。

如无必要，勿增实体。

- Redis 是 Web-Server 模式

底层原理还是使用 Socket 进行网络通信，比起内存型缓存，速度还是要慢很多。

- Redis 单线程的问题

Redis 使用单线程，避免了线程切换的开销。但是同时也存在另外一个问题，即使是在 Redis 缓存中，网络抖动对于业务的影响是比较大的。

任何一处的访问导致 Redis 变慢，会影响到所有的业务变慢。

# 拓展阅读

[Redis 存储值的类型](https://houbb.github.io/2018/12/28/redis-value-type)

[HashMap ReHash](https://houbb.github.io/2018/09/12/java-hashmap#%E6%89%A9%E5%AE%B9%E6%9C%BA%E5%88%B6)

[SkipList-跳跃表详解](https://houbb.github.io/2019/02/13/datastruct-skiplist)

# 参考资料

[从数据存储角度分析Redis性能为何如此高](https://blog.csdn.net/nuoWei_SenLin/article/details/86673053)

* any list
{:toc}