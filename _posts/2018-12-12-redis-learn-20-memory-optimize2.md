---
layout: post
title: Redis Learn-20-Memory Optimize 内存优化续
date: 2018-12-12 11:35:23 +0800
categories: [Redis]
tags: [redis, cache, sh]
published: true
---


# 内存优化

Redis所有的数据都在内存中，而内存又是非常宝贵的资源。

如何优化内存的使用一直是Redis用户非常关注的问题。

本节深入到Redis细节中，探索内存优化的技巧。

# redisObject对象

Redis存储的所有值对象在内部定义为redisObject结构体。

Redis存储的数据都使用redisObject来封装，包括string、hash、list、set、zset在内的所有数据类型。

理解redisObject对内存优化非常有帮助，下面针对每个字段做详细说明：

- type字段：表示当前对象使用的数据类型，

Redis主要支持5种数据类型：string、hash、list、set、zset。可以使用type{key}命令查看对象所属类型，type命令返回的是值对象类型，键都是string类型。

- encoding字段：表示Redis内部编码类型，encoding在Redis内部使用，

代表当前对象内部采用哪种数据结构实现。理解Redis内部编码方式对于优化内存非常重要，同一个对象采用不同的编码实现内存占用存在明显差异。

- lru字段：记录对象最后一次被访问的时间，当配置了maxmemory和maxmemory-policy=volatile-lru或者allkeys-lru时，用于辅助LRU算法删除键数据。

可以使用 `object idletime{key}` 命令在不更新lru字段情况下查看当前键的空闲时间。


## 开发提示

可以使用 `scan+object idletime` 命令批量查询哪些键长时间未被访问，找出长时间不访问的键进行清理，可降低内存占用。

- refcount字段：记录当前对象被引用的次数，用于通过引用次数回收内存，当refcount=0时，可以安全回收当前对象空间。

使用object refcount{key}获取当前对象引用。

当对象为整数且范围在 `[0-9999]` 时，Redis可以使用共享对象的方式来节省内存。

具体细节见之后共享对象池部分。


- `*ptr` 字段：与对象的数据内容相关，如果是整数，直接存储数据；否则表示指向数据的指针。

Redis在3.0之后对值对象是字符串且长度<=39字节的数据，内部编码为embstr类型，字符串sds和redisObject一起分配，从而只要一次内存操作即可。

> Tips

高并发写入场景中，在条件允许的情况下，建议字符串长度控制在39字节以内，减少创建redisObject内存分配次数，从而提高性能。


# 缩减键值对象

降低Redis内存使用最直接的方式就是缩减键（key）和值（value）的长度。

## key长度：

如在设计键时，在完整描述业务情况下，键值越短越好。

如

```
user：{uid}：friends：notify：{fid}
```

可以简化为

```
u：{uid}：fs：nt：{fid}
```

## value长度：

值对象缩减比较复杂，常见需求是把业务对象序列化成二进制数组放入Redis。

首先应该在业务上精简业务对象，去掉不必要的属性避免存储无效数据。

其次在序列化工具选择上，应该选择更高效的序列化工具来降低字节数组大小。

以Java为例，内置的序列化方式无论从速度还是压缩比都不尽如人意，这时可以选择更高效的序列化工具。

### 其他格式

值对象除了存储二进制数据之外，通常还会使用通用格式存储数据比如：json、xml等作为字符串存储在Redis中。

这种方式优点是方便调试和跨语言，但是同样的数据相比字节数组所需的空间更大，在内存紧张的情况下，可以使用通用压缩算法压缩json、xml后再存入Redis，从而降低内存占用，例如使用GZIP压缩后的json可降低约60%的空间。

- 压缩建议

当频繁压缩解压json等文本数据时，开发人员需要考虑压缩速度和计算开销成本，这里推荐使用Google的Snappy压缩工具，在特定的压缩率情况下效率远远高于GZIP等传统压缩工具，且支持所有主流语言环境。

# 共享对象池

共享对象池是指Redis内部维护[0-9999]的整数对象池。

创建大量的整数类型redisObject存在内存开销，每个redisObject内部结构至少占16字节，甚至超过了整数自身空间消耗。

所以Redis内存维护一个[0-9999]的整数对象池，用于节约内存。

除了整数值对象，其他类型如list、hash、set、zset内部元素也可以使用整数对象池。

因此开发中在满足需求的前提下，尽量使用整数对象以节省内存。

## 池化

整数对象池在Redis中通过变量REDIS_SHARED_INTEGERS定义，不能通过配置修改。

可以通过object refcount命令查看对象引用数验证是否启用整数对象池技术，如下：

```
127.0.0.1:6379> set foo 100
OK
127.0.0.1:6379> object refcount foo
(integer) 2147483647
127.0.0.1:6379> set bar 100
OK
127.0.0.1:6379> object refcount bar
(integer) 2147483647
```

这个测试的结果应该是不准的。

本地的 docker 进行测试所得。

## 内存优化了多少

使用整数对象池究竟能降低多少内存？

使用共享对象池后，相同的数据内存使用降低30%以上。

可见当数据大量使用[0-9999]的整数时，共享对象池可以节约大量内存。

需要注意的是对象池并不是只要存储[0-9999]的整数就可以工作。

### 是否开启 LRU 淘汰策略

当设置maxmemory并启用LRU相关淘汰策略如：volatile-lru，allkeys-lru时，Redis禁止使用共享对象池，

测试命令如下：

```
redis> set key:1 99
OK // 设置key:1=99
redis> object refcount key:1
(integer) 2 // 使用了对象共享,引用数为2
redis> config set maxmemory-policy volatile-lru
OK // 开启LRU淘汰策略
redis> set key:2 99
OK // 设置key:2=99
redis> object refcount key:2
(integer) 3 // 使用了对象共享,引用数变为3
redis> config set maxmemory 1GB
OK // 设置最大可用内存
redis> set key:3 99
OK // 设置key:3=99
redis> object refcount key:3
(integer) 1 // 未使用对象共享,引用数为1
redis> config set maxmemory-policy volatile-ttl
OK // 设置非LRU淘汰策略
redis> set key:4 99
OK // 设置key:4=99
redis> object refcount key:4
(integer) 4 // 又可以使用对象共享,引用数变为4
```

## 为什么开启maxmemory和LRU淘汰策略后对象池无效？

LRU算法需要获取对象最后被访问时间，以便淘汰最长未访问数据，每个对象最后访问时间存储在redisObject对象的lru字段。

对象共享意味着多个引用共享同一个redisObject，这时lru字段也会被共享，导致无法获取每个对象的最后访问时间。

如果没有设置maxmemory，直到内存被用尽Redis也不会触发内存回收，所以共享对象池可以正常工作。

综上所述，**共享对象池与maxmemory+LRU策略冲突，使用时需要注意。**

对于ziplist编码的值对象，即使内部数据为整数也无法使用共享对象池，因为ziplist使用压缩且内存连续的结构，对象共享判断成本过高，ziplist
编码细节后面内容详细说明。

## 为什么只有整数对象池？

首先整数对象池复用的几率最大，其次对象共享的一个关键操作就是判断相等性，Redis之所以只有整数对象池，是因为整数比较算法时间复杂度为O（1），只保留一万个整数为了防止对象池浪费。

如果是字符串判断相等性，时间复杂度变为O（n），特别是长字符串更消耗性能（浮点数在Redis内部使用字符串存储）。

对于更复杂的数据结构如hash、list等，相等性判断需要O（n2）。

对于单线程的Redis来说，这样的开销显然不合理，因此Redis只保留整数共享对象池。

# 字符串优化

字符串对象是Redis内部最常用的数据类型。所有的键都是字符串类型，值对象数据除了整数之外都使用字符串存储。

## 实际过程

比如执行命令：`lpushcache：type"redis""memcache""tair""levelDB"`

Redis首先创建"cache：type"键字符串，然后创建链表对象，链表对象内再包含四个字符串对象，排除Redis内部用到的字符串对象之外至少创建5个字符串对象。

可见字符串对象在Redis内部使用非常广泛，因此深刻理解Redis字符串对于内存优化非常有帮助。

## 字符串结构

Redis没有采用原生C语言的字符串类型而是自己实现了字符串结构，内部简单动态字符串（simple dynamic string，SDS）。

Redis自身实现的字符串结构有如下特点：

- O(1) 时间复杂度获取：字符串长度、已用长度、未用长度。

- 可用于保存字节数组，支持安全的二进制数据存储。

- 内部实现空间预分配机制，降低内存再分配次数。

- 惰性删除机制，字符串缩减后的空间不释放，作为预分配空间保留。

## 预分配机制

因为字符串（SDS）存在预分配机制，日常开发中要小心预分配带来的内存浪费

追加操作后字符串对象预分配了一倍容量作为预留空间，而且大量追加操作需要内存重新分配，造成内存碎片率（mem_fragmentation_ratio）上升。

- 优点

字符串之所以采用预分配的方式是防止修改操作需要不断重分配内存和字节数据拷贝。

但同样也会造成内存的浪费。

- 分配规则

字符串预分配每次并不都是翻倍扩容，空间预分配规则如下：

1）第一次创建len属性等于数据实际大小，free等于0，不做预分配。

2）修改后如果已有free空间不够且数据小于1M，每次预分配一倍容量。

如原有len=60byte，free=0，再追加60byte，预分配120byte，总占用空间：60byte+60byte+120byte+1byte。

3）修改后如果已有free空间不够且数据大于1MB，每次预分配1MB数据。

如原有len=30MB，free=0，当再追加100byte，预分配1MB，总占用空间：1MB+100byte+1MB+1byte。

> TIPS

尽量减少字符串频繁修改操作如append、setrange，改为直接使用set修改字符串，降低预分配带来的内存浪费和内存碎片化。

## 字符串重构

字符串重构：指不一定把每份数据作为字符串整体存储，像json这样的数据可以使用hash结构，使用二级结构存储也能帮我们节省内存。

同时可以使用hmget、hmset命令支持字段的部分读取修改，而不用每次整体存取。

例如下面的json数据：

```json
{
"vid": "413368768",
"title": "搜狐屌丝男士",
"videoAlbumPic":"http://photocdn.sohu.com/60160518/vrsa_ver8400079_ae433_pic26.jpg",
"pid": "6494271",
"type": "1024",
"playlist": "6494271",
"playTime": "468"
}
```

根据测试结构，第一次默认配置下使用hash类型，内存消耗不但没有降低反而比字符串存储多出2倍，而调整hash-max-ziplist-value=66之后内存降低为535.60M。

因为json的videoAlbumPic属性长度是65，而hash-max-ziplistvalue默认值是64，Redis采用hashtable编码方式，反而消耗了大量内存。

调整配置后hash类型内部编码方式变为ziplist，相比字符串更省内存且支持属性的部分操作。

# 编码优化

## 1.了解编码

Redis对外提供了string、list、hash、set、zet等类型，但是Redis内部针对不同类型存在编码的概念，所谓编码就是具体使用哪种底层数据结构来实现。

编码不同将直接影响数据的内存占用和读写效率。

使用 `object encoding{key}` 命令获取编码类型。

如下所示：

```
redis> set str:1 hello
OK
redis> object encoding str:1
"embstr" // embstr编码字符串
redis> lpush list:1 1 2 3
(integer) 3
redis> object encoding list:1
"ziplist" // ziplist编码列表
```

Redis针对每种数据类型（type）可以采用至少两种编码方式来实现，表8-5表示type和encoding的对应关系。

## 为什么要有多种编码方式？

了解编码和类型对应关系之后，我们不禁疑惑Redis为什么对一种数据结构实现多种编码方式？

主要原因是Redis作者想通过不同编码实现效率和空间的平衡。

比如当我们的存储只有10个元素的列表，当使用双向链表数据结构时，必然需要维护大量的内部字段如每个元素需要：前置指针，后置指针，数据指针等，

造成空间浪费，如果采用连续内存结构的压缩列表（ziplist），将会节省大量内存，而由于数据长度较小，存取操作时间复杂度即使为O（n2）性能也可满足需求。

## 2.控制编码类型

编码类型转换在Redis写入数据时自动完成，这个转换过程是不可逆的，转换规则只能从小内存编码向大内存编码转换。

例如：

```
redis> lpush list:1 a b c d
(integer) 4 // 存储4个元素
redis> object encoding list:1
"ziplist" // 采用ziplist压缩列表编码
redis> config set list-max-ziplist-entries 4
OK // 设置列表类型ziplist编码最大允许4个元素
redis> lpush list:1 e
(integer) 5 // 写入第5个元素e
redis> object encoding list:1
"linkedlist" // 编码类型转换为链表
redis> rpop list:1
"a" // 弹出元素a
redis> llen list:1
(integer) 4 // 列表此时有4个元素
redis> object encoding list:1
"linkedlist" // 编码类型依然为链表，未做编码回退
```

以上命令体现了list类型编码的转换过程，其中Redis之所以不支持编码回退，主要是数据增删频繁时，数据向压缩编码转换非常消耗CPU，得不偿失。

以上示例用到了list-max-ziplist-entries参数，这个参数用来决定列表长度在多少范围内使用ziplist编码。

## ziplist

ziplist编码主要目的是为了节约内存，因此所有数据都是采用线性连续的内存结构。

ziplist编码是应用范围最广的一种，可以分别作为hash、list、zset类型的底层数据结构实现。

首先从ziplist编码结构开始分析，它的内部结构类似这样：`<zlbytes><zltail><zllen><entry-1><entry-2><....><entry-n><zlend>`。

一个ziplist可以包含多个entry（元素），每个entry保存具体的数据（整数或者字节数组），内部结构如图8-14所示。

> TIPS

针对性能要求较高的场景使用ziplist，建议长度不要超过1000，每个元素大小控制在512字节以内。

命令平均耗时使用info Commandstats命令获取，包含每个命令调用次数、总耗时、平均耗时，单位为微秒。

## intset

intset 编码是集合（set）类型编码的一种，内部表现为存储有序、不重复的整数集。

当集合只包含整数且长度不超过set-max-intset-entries配置时被启用。

> TIPS

使用intset编码的集合时，尽量保持整数范围一致，如都在int-16范围内。

防止个别大整数触发集合升级操作，产生内存浪费。

# 控制键的数量

当使用Redis存储大量数据时，通常会存在大量键，过多的键同样会消耗大量内存。

Redis本质是一个数据结构服务器，它为我们提供多种数据结构，如hash、list、set、zset等。

使用Redis时不要进入一个误区，大量使用get/set这样的API，把Redis当成Memcached使用。

对于存储相同的数据内容利用Redis的数据结构降低外层键的数量，也可以节省大量内存。

如图8-16所示，通过在客户端预估键规模，把大量键分组映射到多个hash结构中降低键的数量。

## Hash 方式

hash结构降低键数量分析：

根据键规模在客户端通过分组映射到一组hash对象中，如存在100万个键，可以映射到1000个hash中，每个hash保存1000个元素。

hash的field可用于记录原始key字符串，方便哈希查找。

hash的value保存原始值对象，确保不要超过hash-max-ziplist-value限
制。

ps: 这里应该注意，避免 bigkey。否则，删除等操作太慢，影响其他执行。

# 拓展阅读

## 数据结构

[SDS](https://houbb.github.io/2018/12/12/redis-learn-05-data-struct-str)

[List]()

[Hash]()

[HyperLogLog]()

[GEO]()

# 参考资料 

《Redis 开发与运维》

* any list
{:toc}