---
layout: post
title: Redis Learn-06-数据库
date: 2018-12-12 11:35:23 +0800
categories: [Redis]
tags: [redis, cache, sh]
published: true
---

# 服务器中得数据库

Redis服务器默认会创建16个数据库。

## 数据库结构

Redis 中的每个数据库，都由一个 redis.h/redisDb 结构表示：

```c
typedef struct redisDb {

    // 保存着数据库以整数表示的号码
    int id;

    // 保存着数据库中的所有键值对数据
    // 这个属性也被称为键空间（key space）
    dict *dict;

    // 保存着键的过期信息
    dict *expires;

    // 实现列表阻塞原语，如 BLPOP
    // 在列表类型一章有详细的讨论
    dict *blocking_keys;
    dict *ready_keys;

    // 用于实现 WATCH 命令
    // 在事务章节有详细的讨论
    dict *watched_keys;

} redisDb;
```

# 切换数据库
 
redisDb 结构的 id 域保存着数据库的号码。

这个号码很容易让人将它和切换数据库的 SELECT 命令联系在一起， 但是， 实际上， id 属性并不是用来实现 SELECT 命令， 而是给 Redis 内部程序使用的。

当 Redis 服务器初始化时， 它会创建出 redis.h/REDIS_DEFAULT_DBNUM 个数据库， 并将所有数据库保存到 redis.h/redisServer.db 数组中， 每个数据库的 id 为从 0 到 REDIS_DEFAULT_DBNUM - 1 的值。

当执行 SELECT number 命令时，程序直接使用 `redisServer.db[number]` 来切换数据库。

但是， 一些内部程序， 比如 AOF 程序、复制程序和 RDB 程序， 需要知道当前数据库的号码， 如果没有 id 域的话， 程序就只能在当前使用的数据库的指针， 和 redisServer.db 数组中所有数据库的指针进行对比， 以此来弄清楚自己正在使用的是那个数据库。

以下伪代码描述了这个对比过程：

```
def PSEUDO_GET_CURRENT_DB_NUMBER(current_db_pointer):
    i = 0
    for db_pointer in redisServer.db:
        if db_pointer == current_db_pointer:
            break
        i += 1
    return i
```

有了 id 域的话， 程序就可以通过读取 id 域来了解自己正在使用的是哪个数据库， 这样就不用对比指针那么麻烦了。


# 数据库键空间

键空间和用户所见得数据库是直接对应得：

键空间得键就是数据库得键，每个键都是一个字符串对象。

键空间得值也就是数据库的值，每个值可以是字符串对象、列表对象、哈希表对象、集合对象和有序集合对象中的任意一种Redis对象。

Redis 是一个键值对（key-value pair）数据库服务器， 服务器中的每个数据库都由一个 redis.h/redisDb 结构表示， 其中， redisDb 结构的 dict 字典保存了数据库中的所有键值对， 我们将这个字典称为键空间（key space）：

```c
typedef struct redisDb {

    // ...

    // 数据库键空间，保存着数据库中的所有键值对
    dict *dict;

    // ...

} redisDb;
```

键空间和用户所见的数据库是直接对应的：

1. 键空间的键也就是数据库的键，每个键都是一个字符串对象。

2. 键空间的值也就是数据库的值，每个值可以是字符串对象、列表对象、哈希表对象、集合对象和有序集合对象在内的任意一种 Redis 对象。

举个例子， 如果我们在空白的数据库中执行以下命令：

```c
redis> SET message "hello world"
OK

redis> RPUSH alphabet "a" "b" "c"
(integer) 3

redis> HSET book name "Redis in Action"
(integer) 1

redis> HSET book author "Josiah L. Carlson"
(integer) 1

redis> HSET book publisher "Manning"
(integer) 1
```

那么在这些命令执行之后， 数据库的键空间将会是图 IMAGE_DB_EXAMPLE 所展示的样子：

alphabet 是一个列表键， 键的名字是一个包含字符串 "alphabet" 的字符串对象， 键的值则是一个包含三个元素的列表对象。

book 是一个哈希表键， 键的名字是一个包含字符串 "book" 的字符串对象， 键的值则是一个包含三个键值对的哈希表对象。

message 是一个字符串键， 键的名字是一个包含字符串 "message" 的字符串对象， 键的值则是一个包含字符串 "hello world" 的字符串对象。

![IMAGE_DB_EXAMPLE](http://redisbook.com/_images/graphviz-e201646a2797e756d94777ea28a94cd2f7177806.png)

因为数据库的键空间是一个字典，所以所有针对数据库的操作 —— 比如添加一个键值对到数据库，或者从数据库中删除一个键值对，又或者在数据库中获取某个键值对， 等等，实际上都是通过对键空间字典进行操作来实现的， 

以下几个小节将分别介绍数据库的添加、删除、更新、取值等操作的实现原理。

## 添加新键
 
添加一个新键值对到数据库， 实际上就是将一个新键值对添加到键空间字典里面， 其中键为字符串对象， 而值则为任意一种类型的 Redis 对象。

举个例子， 如果键空间当前的状态如图 IMAGE_DB_EXAMPLE 所示， 那么在执行以下命令之后：

```
redis> SET date "2013.12.1"
OK
```

键空间将添加一个新的键值对， 这个新键值对的键是一个包含字符串 "date" 的字符串对象。

而键值对的值则是一个包含字符串 "2013.12.1" 的字符串对象， 如图 IMAGE_DB_AFTER_ADD_NEW_KEY 所示。

![IMAGE_DB_AFTER_ADD_NEW_KEY](http://redisbook.com/_images/graphviz-728e9110d9d2e97577f834549e3652fb153c2766.png)

## 删除键

删除数据库中的一个键， 实际上就是在键空间里面删除键所对应的键值对对象。

举个例子， 如果键空间当前的状态如图 IMAGE_DB_EXAMPLE 所示， 那么在执行以下命令之后：

```
redis> DEL book
(integer) 1
```

键 book 以及它的值将从键空间中被删除， 如图 IMAGE_DB_AFTER_DEL 所示。

![IMAGE_DB_AFTER_DEL](http://redisbook.com/_images/graphviz-d309bcb0237988addee508cd196b7095ed438a9f.png)

## 更新键

对一个数据库键进行更新， 实际上就是对键空间里面键所对应的值对象进行更新， 根据值对象的类型不同， 更新的具体方法也会有所不同。

举个例子， 如果键空间当前的状态如图 IMAGE_DB_EXAMPLE 所示， 那么在执行以下命令之后：

```
redis> SET message "blah blah"
OK
```

键 message 的值对象将从之前包含 "hello world" 字符串更新为包含 "blah blah" 字符串， 如图 IMAGE_DB_UPDATE_CAUSE_SET 所示。

![IMAGE_DB_UPDATE_CAUSE_SET](http://redisbook.com/_images/graphviz-8a479dcb13f6de7acd085c5cb275010854c5dfb2.png)

再举个例子， 如果我们继续执行以下命令：

```
redis> HSET book page 320
(integer) 1
```

那么键空间中 book 键的值对象（一个哈希对象）将被更新， 新的键值对 page 和 320 会被添加到值对象里面， 如图 IMAGE_UPDATE_BY_HSET 所示。

![IMAGE_UPDATE_BY_HSET](http://redisbook.com/_images/graphviz-7a759448cc7a93eccf726ea7f6cefb4bc4cd953f.png)

## 对键取值
 
对一个数据库键进行取值，实际上就是在键空间中取出键所对应的值对象，根据值对象的类型不同，具体的取值方法也会有所不同。

在数据库中取值实际上就是在字典空间中取值， 再加上一些额外的类型检查：

键不存在，返回空回复；

键存在，且类型正确，按照通讯协议返回值对象；

键存在，但类型不正确，返回类型错误。

### 例子

举个例子， 如果键空间当前的状态如图 IMAGE_DB_EXAMPLE 所示， 那么当执行以下命令时：

```
redis> GET message
"hello world"
```

GET 命令将首先在键空间中查找键 message ， 找到键之后接着取得该键所对应的字符串对象值， 之后再返回值对象所包含的字符串 "hello world" ， 取值过程如图 IMAGE_FETCH_VALUE_VIA_GET 所示。

![IMAGE_FETCH_VALUE_VIA_GET](http://redisbook.com/_images/graphviz-f8439d8d27095db06868a814903063c1564561f3.png)

再举一个例子， 当执行以下命令时：

```
redis> LRANGE alphabet 0 -1
1) "a"
2) "b"
3) "c"
```

LRANGE 命令将首先在键空间中查找键 alphabet ， 找到键之后接着取得该键所对应的列表对象值，之后再返回列表对象中包含的三个字符串对象的值， 取值过程如图 IMAGE_FETCH_VALUE_VIA_LRANGE 所示。

![IMAGE_FETCH_VALUE_VIA_LRANGE](http://redisbook.com/_images/graphviz-eb11c35fbf34f061592fc429e09a04f7a608639a.png)

## 其他键空间操作
 
除了上面展示的键值操作之外，还有很多针对数据库本身的命令，也是通过对键空间进行处理来完成的：

FLUSHDB 命令：删除键空间中的所有键值对。

RANDOMKEY 命令：从键空间中随机返回一个键。

DBSIZE 命令：返回键空间中键值对的数量。

EXISTS 命令：检查给定键是否存在于键空间中。

RENAME 命令：在键空间中，对给定键进行改名。

## 读写键空间时的维护操作
 
当使用Redis命令对数据库进行读写时，服务器不仅会对键空间执行指定的读写操作，还会执行一些额外的维护操作：

在读取一个键后，服务器会根据键是否存在来更新服务器的键空间命中次数或键空间不命中次数。

在读取一个键之后，服务器会更新键的LRU时间，这个值可以用于计算键的闲置时间，使用 `OBJECT IDLETIME <key>` 命令可以查看键key的闲置时间。

如果服务器在读取一个键时发现该键已经过期，那么服务器会先删除这个过期键，然后才执行余下的其他操作。

如果有客户端使用WATCH命令监视了某个键，那么服务器在对被监视的键进行修改后，会将这个键标记为脏（dirty），从而让事务程序注意到这个键已经被修改过。

服务器每次修改一个键之后，都会对脏（dirty）键计数器的值增1，这个计数器会出发服务器的持久化以及复制操作。

如果服务器开启了数据库通知功能，那么在对键进行修改之后，服务器将按照配置发送相应的数据库通知。

# 设置键的生存时间或过期时间
 
通过EXPIRE命令或者PEXPIRE命令，客户端可以以秒或者毫秒精度为数据库中的某个键设置生存时间（Time To Live， TTL），在经过指定的秒数或者毫秒数之后，服务器就会自动删除生存时间为0的键。

SETEX命令可以在设置一个字符串键的同时为键设置过期时间。

客户端可以通过EXPIREAT命令或PEXPIREAT命令，以秒或者毫秒精度给数据库中的某个键设置过期时间（expire time）。

TTL命令和PTTL命令接受一个带有生存时间或者过期时间的键，返回这个键的剩余生存时间。

## 设置过期时间

Redis 有四个不同的命令可以用于设置键的生存时间或过期时间：

`EXPIRE <key> <ttl>` 命令用于将键key的生存时间设置为ttl秒。

`PEXPIRE <key> <ttl>` 命令用于将键key的生存时间设置为ttl毫秒。

`EXPIREAT <key> <timestamp>` 命令用于将键key的过期时间设置为timestamp所指定的秒数时间戳。

`PEXPIREAT <key> <timestamp>` 命令用于将键key的过期时间设置为timestamp所指定的毫秒时间戳。

虽然有那么多种不同单位和不同形式的设置方式， 但是 expires 字典的值只保存“以毫秒为单位的过期 UNIX 时间戳”， 这就是说， 通过进行转换， 所有命令的效果最后都和 PEXPIREAT 命令的效果一样。

举个例子，从 EXPIRE 命令到 PEXPIREAT 命令的转换可以用伪代码表示如下：

```c
def EXPIRE(key, sec):

    # 将 TTL 从秒转换为毫秒
    ms = sec_to_ms(sec)

    # 获取以毫秒计算的当前 UNIX 时间戳
    ts_in_ms = get_current_unix_timestamp_in_ms()

    # 毫秒 TTL 加上毫秒时间戳，就是 key 到期的时间戳
    PEXPIREAT(ms + ts_in_ms, key)
```

其他函数的转换方式也是类似的。

## 保存过期时间
 
redisDb结构的expires字典保存了数据库中的所有键的过期时间，我们称这个字典为过期字典：

过期字典的键是一个指针，这个指针指向键空间中的某个键对象。

过期对象的值是一个long long类型的整数，这个整数保存了键所指向的数据库键的过期时间，一个毫秒精度的UNIX时间戳。

在数据库中， 所有键的过期时间都被保存在 redisDb 结构的 expires 字典里：

```c
typedef struct redisDb {

    // ...

    dict *expires;

    // ...

} redisDb;
```

expires 字典的键是一个指向 dict 字典（键空间）里某个键的指针， 而字典的值则是键所指向的数据库键的到期时间， 这个值以 long long 类型表示。

## 移除过期时间

PERSIST命令可以移除一个键的过期时间

## 计算并返回剩余生存时间
 
TTL命令以秒为单位返回键的剩余生存时间，而PTTL命令则以毫秒为单位返回键的剩余生存时间。

# 过期键删除策略

三种不同的删除策略：

定时删除：在设置键的过期时间的同时，创建一个定时器（timer），让定时器在键的过期时间来临时，立即执行对键的删除操作。

惰性删除：放任键过期不管，但是每次从键空间中获取键时，都检查取得的键是否过期，如果过期的话，就删除该键；如果没有过期，就返回该键。

定期删除：每隔一段时间，程序就对数据库进行一次检查，删除里面的过期键。至于要删除多少过期键，以及要检查多少个数据库，则由算法决定。

## 定时删除
 
定时删除策略对内存是最友好的：通过使用定时器，定时删除策略可以保证过期键会尽可能快地被删除，并释放出过期键所占用地内存。

定时删除策略地缺点是，它对CPU时间是最不友好地：在过期键比较多的情况下，删除过期键这一行为可能会占用相当一部分CPU时间，会对服务器的响应时间和吞吐量造成影响。

创建一个定时器需要用到Redis服务器中的时间事件，而当前时间的实现方式---无序链表，查找一个时间的时间复杂度为O(N)---并不能高效地处理大量时间事件。

## 惰性删除

惰性删除策略对CPU时间来说是最友好的，对内存是最不友好的。

## 定期删除

定期删除策略是前两种策略的一种整合和这种：

定期删除策略每隔一段时间执行一次删除过期键操作，并通过限制删除操作执行的时长和频率来减少删除操作对CPU时间的影响。

通过定期删除过期键，定期删除策略有效地减少了因为过期键而带来地内存浪费。

定期删除策略地难点是确定删除操作执行地时长和频率。


# 过期键的判定

通过 expires 字典， 可以用以下步骤检查某个键是否过期：

检查键是否存在于 expires 字典：如果存在，那么取出键的过期时间；

检查当前 UNIX 时间戳是否大于键的过期时间：如果是的话，那么键已经过期；否则，键未过期。

可以用伪代码来描述这一过程：

```c
def is_expired(key):

    # 取出键的过期时间
    key_expire_time = expires.get(key)

    # 如果过期时间不为空，并且当前时间戳大于过期时间，那么键已经过期
    if expire_time is not None and current_timestamp() > key_expire_time:
        return True

    # 否则，键未过期或没有设置过期时间
    return False
```

# Redis 的过期键删除策略

Redis服务器使用地是惰性删除和定期删除两种策略。

## 惰性删除策略的实现

过期键的惰性删除策略由 `db.c/expireIfNeeded` 函数实现，所有读写数据库的Redis命令在执行之前都会调用expireIfNeeded函数对输入键进行检查：

如果输入键已经过期，那么expireIfNeeded函数将输入键从数据库中删除。

如果输入键未过期，那么expireIfNeeded函数不做动作。

每个被访问的键都可能因为过期而被expireIfNeeded函数删除，所以每个命令的实现函数都必须能同时处理键存在以及键不存在这两种情况：

当键存在时，命令按照键存在的情况执行。

当键不存在或者键因为过期而被expireIfNeeded函数删除时，命令按照键不存在的情况执行。

```c
def expireIfNeeded(key):

    # 对过期键执行以下操作 。。。
    if key.is_expired():

        # 从键空间中删除键值对
        db.dict.remove(key)

        # 删除键的过期时间
        db.expires.remove(key)

        # 将删除命令传播到 AOF 文件和附属节点
        propagateDelKeyToAofAndReplication(key)
```

## 定期删除策略的实现

过期键的定期删除策略由 `redis.c/activeExpireCycle` 函数实现，每当Redis的服务器周期性操作 `redis.c/serverCron` 函数执行时，activeExpireCycle函数就会被调用，它在规定的时间内，分多次遍历服务器中的各个数据库，从数据库的expires字典中随机检查一部分键的过期时间，并删除其中的过期键。

activeExpireCycle 函数的工作模式可以总结如下：

函数每次运行时，都从一定数量的数据库中取出一定数量的随机键进行检查，并删除其中的过期键。

全局变量current_db会记录当前activeExpireCycle函数检查的进度，并在下一次activeExpireCycle函数调用时，接着上一次的进度执行处理。

随着activeExpireCycle函数的不断执行，服务器中的所有数据库都会被检查一遍，这时函数将current_db变量重置为0，然后再次开始新一轮的检查工作。

```c
def activeExpireCycle():

    # 遍历数据库（不一定能全部都遍历完，看时间是否足够）
    for db in server.db:

        # MAX_KEY_PER_DB 是一个 DB 最大能处理的 key 个数
        # 它保证时间不会全部用在个别的 DB 上（避免饥饿）
        i = 0
        while (i < MAX_KEY_PER_DB):

            # 数据库为空，跳出 while ，处理下个 DB
            if db.is_empty(): break

            # 随机取出一个带 TTL 的键
            key_with_ttl = db.expires.get_random_key()

            # 检查键是否过期，如果是的话，将它删除
            if is_expired(key_with_ttl):
                db.deleteExpiredKey(key_with_ttl)

            # 当执行时间到达上限，函数就返回，不再继续
            # 这确保删除操作不会占用太多的 CPU 时间
            if reach_time_limit(): return

            i += 1
```

# AOF、RDB和复制功能对过期键的处理
 
## 生存RDB文件

在执行SAVE命令或者BGSAVE命令创建一个新的RDB文件时，程序会对数据库的键进行检查，已过期的键不会被保存到新创建的RDB文件中。

数据库中包含过期键不会对生成新的RDB文件造成影响。

## 载入RDB文件

在启动 Redis 服务器时，如果服务器开启了RDB功能，那么服务器将对RDB文件进行载入：

如果服务器以主服务器模式运行，那么在载入RDB文件时，程序会对文件中保存的键进行检查，未过期的键会被载入到数据库中，而过期键则会被忽略，所以过期键对载入RDB文件的主服务器不会造成影响。

如果服务器以从服务器模式运行，那么在载入RDB文件时，文件中保存的所有键，都会被载入到数据库中。

## AOF文件写入

当服务器以AOF持久化模式运行时，如果数据库中的某个键已经过期，但它还没有被惰性删除或定期删除，那么AOF文件不会因为这个过期键而产生任何影响。

当过期键被惰性删除或者定期删除之后，程序会向AOF文件追加（append）一条DEL命令，来显示地记录键已被删除。

## AOF重写

在执行AOF重写的过程中，程序会对数据库中的键进行检查，已过期的键不会被保存到重写后的AOF文件中。

## 复制
 
当服务器带有附属节点时， 过期键的删除由主节点统一控制：

如果服务器是主节点，那么它在删除一个过期键之后，会显式地向所有附属节点发送一个 DEL 命令。

如果服务器是附属节点，那么当它碰到一个过期键的时候，它会向程序返回键已过期的回复，但并不真正的删除过期键。因为程序只根据键是否已经过期、而不是键是否已经被删除来决定执行流程，所以这种处理并不影响命令的正确执行结果。当接到从主节点发来的 DEL 命令之后，附属节点才会真正的将过期键删除掉。

附属节点不自主对键进行删除是为了和主节点的数据保持绝对一致， 因为这个原因， 当一个过期键还存在于主节点时，这个键在所有附属节点的副本也不会被删除。

这种处理机制对那些使用大量附属节点，并且带有大量过期键的应用来说，可能会造成一部分内存不能立即被释放，但是，因为过期键通常很快会被主节点发现并删除，所以这实际上也算不上什么大问题。

# 数据库通知

让客户端通过订阅给定的频道或者模式，来获知数据库中键的变化，以及数据库中命令的执行情况。

关注“某个键执行了什么命令”的通知成为键空间通知（key-space notification）

关注的是“某个命令被什么键执行了”的通知称为键事件通知（key-event notification）

服务器配置的notify-keyspace-events选项决定了服务器所发送通知的类型：

服务器发送所有类型的键空间通知和键事件通知，将选项的值设置为AKE。

服务器发送所有类型的键空间通知，将选项的值设置为AK。

服务器发送所有类型的键事件通知，将选项的值设置为AE。

服务器只发送和字符串键有关的键空间通知，将选项的值设置为K$。

服务器只发送和列表键有关的键事件通知，将选项的值设置为El。

# 数据库空间的收缩和扩展

因为数据库空间是由字典来实现的，所以数据库空间的扩展/收缩规则和字典的扩展/收缩规则完全一样，具体的信息可以参考《字典》章节。

因为对字典进行收缩的时机是由使用字典的程序决定的，所以 Redis 使用 redis.c/tryResizeHashTables 函数来检查数据库所使用的字典是否需要进行收缩： 

每次 redis.c/serverCron 函数运行的时候，这个函数都会被调用。

tryResizeHashTables 函数的完整定义如下：

```c
/*
 * 对服务器中的所有数据库键空间字典、以及过期时间字典进行检查，
 * 看是否需要对这些字典进行收缩。
 *
 * 如果字典的使用空间比率低于 REDIS_HT_MINFILL
 * 那么将字典的大小缩小，让 USED/BUCKETS 的比率 <= 1
 */
void tryResizeHashTables(void) {
    int j;

    for (j = 0; j < server.dbnum; j++) {

        // 缩小键空间字典
        if (htNeedsResize(server.db[j].dict))
            dictResize(server.db[j].dict);

        // 缩小过期时间字典
        if (htNeedsResize(server.db[j].expires))
            dictResize(server.db[j].expires);
    }
}
```

# 重点回顾

Redis服务器的所有数据库都保存在redisServer.db数组中，而数据库的数量则由redisServer.dbnum属性保存。

客户端通过修改目标数据库指针，让它指向redisServer.db数组中不同元素来切换不同的数据库。

数据库主要由dict和expire两个字典构成，其中dict字典负责保存键值对，而expires字典则负责保存键的过期时间。

因为数据库由字典构成，所以对数据库的操作都是建立在字典操作之上的。

数据库的键总是一个字符串对象，而值则可以是任意一种Redis对象类型。

expires 字典的键指向数据库中的某个键，而值则记录了数据库键的过期时间，过期时间是一个以毫秒为单位的UNIX时间戳。

Redis 使用惰性删除和定期删除两种策略来删除过期的键：惰性删除策略值在碰到过期的键时才进行删除操作，定期删除策略则每隔一段时间主动查找并删除过期键。

执行SAVE命令或者BGSAVE命令所产生的新RDB文件不会包含已经过期的键。

执行BGREWRITEAOF命令所产生的重写AOF文件不会包含已经过期的键。

当一个过期键被删除之后，服务器会追加一条DEL命令到现有AOF文件的末尾，显示地删除过期键。

当主服务器删除一个过期键之后，它会向所有从服务器发送一条DEL命令，显示地删除过期键。

从服务器即使发现过期键也不会自作主张地删除它，而是等待主节点发来DEL命令，这种统一、中心化地过期键删除策略可以保证主从服务器数据地一致性。

当Redis命令对数据库进行修改后，服务器会根据配置向客户端发送数据库通知。

# 参考资料

[学习笔记-Redis设计与实现-数据库](https://yq.aliyun.com/articles/544694)

[《Redis设计与实现》- 数据库](https://www.cnblogs.com/lanqiu5ge/p/9448185.html)

[数据库键空间](http://redisbook.com/preview/database/key_space.html)

[Redis设计与实现——单机数据库的实现](https://www.cnblogs.com/gaojy/p/7147127.html)

* any list
{:toc}