---
layout: post
title: Redis Learn-06-03-设置键的生存时间和过期时间
date: 2018-12-12 11:35:23 +0800
categories: [Redis]
tags: [redis, cache, sh]
published: true
---

# EXPIRE key seconds

为给定 key 设置生存时间，当 key 过期时(生存时间为 0 )，它会被自动删除。

在 Redis 中，带有生存时间的 key 被称为『易失的』(volatile)。

生存时间可以通过使用 DEL 命令来删除整个 key 来移除，或者被 SET 和 GETSET 命令覆写(overwrite)，这意味着，如果一个命令只是修改(alter)一个带生存时间的 key 的值而不是用一个新的 key 值来代替(replace)它的话，那么生存时间不会被改变。

比如说，对一个 key 执行 INCR 命令，对一个列表进行 LPUSH 命令，或者对一个哈希表执行 HSET 命令，这类操作都不会修改 key 本身的生存时间。

另一方面，如果使用 RENAME 对一个 key 进行改名，那么改名后的 key 的生存时间和改名前一样。

RENAME 命令的另一种可能是，尝试将一个带生存时间的 key 改名成另一个带生存时间的 another_key ，这时旧的 another_key (以及它的生存时间)会被删除，然后旧的 key 会改名为 another_key ，因此，新的 another_key 的生存时间也和原本的 key 一样。

使用 PERSIST 命令可以在不删除 key 的情况下，移除 key 的生存时间，让 key 重新成为一个『持久的』(persistent) key 。

更新生存时间

可以对一个已经带有生存时间的 key 执行 EXPIRE 命令，新指定的生存时间会取代旧的生存时间。

过期时间的精确度

在 Redis 2.4 版本中，过期时间的延迟在 1 秒钟之内 —— 也即是，就算 key 已经过期，但它还是可能在过期之后一秒钟之内被访问到，而在新的 Redis 2.6 版本中，延迟被降低到 1 毫秒之内。

返回值：

设置成功返回 1 。

当 key 不存在或者不能为 key 设置生存时间时(比如在低于 2.1.3 版本的 Redis 中你尝试更新 key 的生存时间)，返回 0 。

```sh
redis> SET cache_page "www.google.com"
OK

redis> EXPIRE cache_page 30  # 设置过期时间为 30 秒
(integer) 1

redis> TTL cache_page    # 查看剩余生存时间
(integer) 23

redis> EXPIRE cache_page 30000   # 更新过期时间
(integer) 1

redis> TTL cache_page
(integer) 29996
```

# 模式：导航会话

假设你有一项 web 服务，打算根据用户最近访问的 N 个页面来进行物品推荐，并且假设用户停止阅览超过 60 秒，那么就清空阅览记录(为了减少物品推荐的计算量，并且保持推荐物品的新鲜度)。

这些最近访问的页面记录，我们称之为『导航会话』(Navigation session)，可以用 INCR 和 RPUSH 命令在 Redis 中实现它：每当用户阅览一个网页的时候，执行以下代码：

```
MULTI
    RPUSH pagewviews.user:<userid> http://.....
    EXPIRE pagewviews.user:<userid> 60
EXEC
```

如果用户停止阅览超过 60 秒，那么它的导航会话就会被清空，当用户重新开始阅览的时候，系统又会重新记录导航会话，继续进行物品推荐。

# 常见命令

## PEXPIRE key milliseconds

这个命令和 EXPIRE 命令的作用类似，但是它以毫秒为单位设置 key 的生存时间，而不像 EXPIRE 命令那样，以秒为单位。

## EXPIREAT key timestamp

EXPIREAT 的作用和 EXPIRE 类似，都用于为 key 设置生存时间。

不同在于 EXPIREAT 命令接受的时间参数是 UNIX 时间戳(unix timestamp)。

```sh
redis> SET cache www.google.com
OK

redis> EXPIREAT cache 1355292000     # 这个 key 将在 2012.12.12 过期
(integer) 1

redis> TTL cache
(integer) 45081860
```

## PEXPIREAT key milliseconds-timestamp

这个命令和 EXPIREAT 命令类似，但它以毫秒为单位设置 key 的过期 unix 时间戳。

## TTL key

以秒为单位，返回给定 key 的剩余生存时间(TTL, time to live)。

- 返回值：

当 key 不存在时，返回 -2 。

当 key 存在但没有设置剩余生存时间时，返回 -1 。

否则，以秒为单位，返回 key 的剩余生存时间。

## PTTL key

这个命令类似于 TTL 命令，但它以毫秒为单位返回 key 的剩余生存时间。

## PERSIST key

移除给定 key 的生存时间，将这个 key 从『易失的』(带生存时间 key )转换成『持久的』(一个不带生存时间、永不过期的 key )。

- 返回值：

当生存时间移除成功时，返回 1 .

如果 key 不存在或 key 没有设置生存时间，返回 0 。


# 设置过期时间

redis有四种命令可以用于设置键的生存时间和过期时间：

```
EXPIRE <KEY> <TTL> : 将键的生存时间设为 ttl 秒
PEXPIRE <KEY> <TTL> :将键的生存时间设为 ttl 毫秒
EXPIREAT <KEY> <timestamp> :将键的过期时间设为 timestamp 所指定的秒数时间戳
PEXPIREAT <KEY> <timestamp>: 将键的过期时间设为 timestamp 所指定的毫秒数时间戳.
```

# 保存过期时间

下图是一个带过期字典的数据库例子：

![数据库例子](https://upload-images.jianshu.io/upload_images/7361383-70062a36d419fc17.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/848/format/webp)

redisDb 结构的 expires 字典保存了数据库中所有键的过期时间。

我们称这个字典为过期字典：

过期字典的键是一个指针，这个指针指向键空间中的某个键对象。

过期字典的值是一个 long 类型的整数。

这个整数保存了键所指向的数据库键的过期时间：一个毫秒精度的UNIX时间戳。

```c
typedef struct redisDb{
    //...
    dict *expires;
    //...
} redisDb;
```

从以上结构中可以看到expire字典(过期字典)和dict字典（数据库键空间，保存着数据库中所有键值对）是并列的，由此可见expire字典的重要性。



# 移除过期时间

PERSIST 命令可以移除一个键的过期时间:

```
127.0.0.1:6379> set message "hello"
OK
127.0.0.1:6379> expire message 60
(integer) 1
127.0.0.1:6379> ttl message
(integer) 54
127.0.0.1:6379> persist message
(integer) 1
127.0.0.1:6379> ttl message
(integer) -1
```

persist命令就是expire命令的反命令，这个函数在过期字典中查找给定的键,并从过期字典中移除。

比如在数据库当前状态(如上图所示)，当给book这个key移除过期时间：

```
redis> persist book
(integer) 1
```

数据库将更新成如下状态：

![移除过期时间](https://upload-images.jianshu.io/upload_images/7361383-7938f4ced25e778a.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/636/format/webp)

可以从图中看到,当PERSIST book命令执行之后,过期字典中的 book 键消失了。

# 计算并返回剩余生存时间

ttl 命令以秒为单位返回指定键的剩余生存时间。

pttl以毫秒返回。两个命令都是通过计算当前时间和过期时间的差值得到剩余生存期的。

```
127.0.0.1:6379> set minping shuxin
OK
127.0.0.1:6379> expire minping 60
(integer) 1
127.0.0.1:6379> ttl minping
(integer) 57
127.0.0.1:6379> ttl minping
(integer) 27
127.0.0.1:6379> pttl minping
(integer) 23839
127.0.0.1:6379>
```

redis源码为：

```c
void ttlCommand(redisClient *c) {
    ttlGenericCommand(c, 0);
}
void pttlCommand(redisClient *c) {
    ttlGenericCommand(c, 1);
}
void ttlGenericCommand(redisClient *c, int output_ms) {
    long long expire, ttl = -1;
    /* 如果键不存在,返回-2 */
    if (lookupKeyRead(c->db,c->argv[1]) == NULL) {
        addReplyLongLong(c,-2);
        return;
    }
    
    /* 如果键存在*/
    /*如果没有设置生存时间,返回 -1, 否则返回实际剩余时间 */
    expire = getExpire(c->db,c->argv[1]);
    if (expire != -1) {
        /* 过期时间减去当前时间,就是键的剩余时间*/
        ttl = expire-mstime();
        if (ttl < 0) ttl = 0;
    }
    if (ttl == -1) {
        addReplyLongLong(c,-1);
    } else {
         /*将毫秒转化为秒*/
        addReplyLongLong(c,output_ms ? ttl : ((ttl+500)/1000));
    }
}
```

# 过期键删除策略

## 定时删除

定时删除是指在设置键的过期时间的同时，创建一个定时器，让定时器在键的过期时间来临时，立即执行对键的删除操作。

定时删除策略对内存是最友好的：通过使用定时器，定时删除策略可以保证过期键会尽可能快的被删除，并释放过期键所占用的内存。

定时删除策略的缺点是，他对CPU时间是最不友好的：再过期键比较多的情况下，删除过期键这一行为可能会占用相当一部分CPU时间。

除此之外，创建一个定时器需要用到Redis服务器中的时间事件。

而当前时间事件的实现方式----无序链表，查找一个事件的时间复杂度为O(N)----并不能高效地处理大量时间事件。

## 惰性删除

惰性删除是指放任键过期不管，但是每次从键空间中获取键时，都检查取得的键是否过期，如果过期的话就删除该键，如果没有过期就返回该键。

惰性删除策略对CPU时间来说是最友好的，但对内存是最不友好的。

如果数据库中有非常多的过期键，而这些过期键又恰好没有被访问到的话，那么他们也许永远也不会被删除。

举个例子，对于一些按时间点来更新的数据，比如log日志，过期后在很长的一段时间内可能都得不到访问，这样在这段时间内就要拜拜浪费这么多内存来存log。

这对于性能非常依赖于内存大小的redis来说，是比较致命的。

## 定期删除

定期删除是指每隔一段时间，程序就对数据库进行一次检查，删除里面的过期键。

定期删除策略是前两种策略的一种整合和折中:

定期删除策略每隔一段时间执行一次删除过期键操作，并通过限制删除操作执行的时长和频率来减少删除操作对CPU时间的影响。

除此之外，通过定期删除过期键，定期删除策略有效地减少了因为过期键带来的内存浪费。

定期删除策略的难点是确定删除操作执行的时长和频率：

如果删除操作执行的太频繁或者执行的时间太长，定期删除策略就会退化成定时删除策略，以至于将CPU时间过多的消耗在删除过期键上面。

如果删除操作执行的太少，或者执行的时间太短，定期删除策略又会和惰性删除策略一样，出现浪费内存的情况。

# Redis 的过期键删除策略

Redis 服务器实际使用的是惰性删除和定期删除两种策略：

通过配合使用这两种删除策略，服务器可以很好的在合理使用CPU时间和避免浪费内存空间之间取得平衡。

## 定期删除策略的实现

过期键的定期删除策略由函数redis.c/activeExpireCycle实现，每当Redis服务器周期性操作redis.c/serverCron函数执行时，activeExpireCycle函数就会被调用，它在规定的时间内分多次遍历服务器中的各个数据库，从数据库的expires字典中随机检查一部分键的过期时间，并删除其中的过期键。


# 个人收获

## trade-off

有时候很多设计都是一种 trade-off。

结合定期删除+惰性删除，是一种非常不错的方式。

# 参考资料

[redis 设置键的生存时间和过期时间](https://zhuanlan.zhihu.com/p/54758076)

[redis 设置键的生存时间或过期时间](https://www.cnblogs.com/zhangchao-letv/p/6114030.html)

[redis 的过期时间和过期删除机制](https://www.jianshu.com/p/9352d20fb2e0)

* any list
{:toc}