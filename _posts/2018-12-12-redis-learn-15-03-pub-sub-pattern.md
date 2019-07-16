---
layout: post
title: Redis Learn-15-03-模式的订阅与退订、查看订阅信息
date: 2018-12-12 11:35:23 +0800
categories: [Redis]
tags: [redis, cache, sh]
published: true
---

# 模式的订阅与退订

服务器将所有模式的订阅关系保存在服务器状态的 pubsub_patterns 属性里面

```c
struct redisServer {

    //保存所有模式订阅关系
    list *pubsub_patterns;
    //...
}
```

pubsub_patterns 属性是一个链表，链表中每一个节点都包含着一个 pubsub_pattern 结构，
这个结构的 pattern 属性记录了被订阅的模式，而 client 属性则记录了订阅模式的客户端：

```c
typedef struct pubsubPattern{
    //订阅模式的客户端
    redisClient *client;

    //被订阅的模式
    robj *pattern;
} piubsubPattern;
```

![pubsubPattern](https://img-blog.csdn.net/20180127155346099?watermark/2/text/aHR0cDovL2Jsb2cuY3Nkbi5uZXQvTEM5MDA3MzA=/font/5a6L5L2T/fontsize/400/fill/I0JBQkFCMA==/dissolve/70/gravity/SouthEast)


## 命令示例 

模式订阅： PSUBSCRIBE “example.*”

模式退订： PUNSUBSCRIBE "example.*"

## 是什么

个人感觉就是正则表达式去匹配对应的信息。

# 发送消息

当一个客户端执行 `Publish <channel> <message>` 命令将消息发送到频道channel时候，执行如下： 

1. 将消息 message 发送给 channel 频道的所有订阅者； 

2. 如果有一个或多个模式 pattern 与频道 channel 相匹配，那么消息 message 发送给 pattern 模式的订阅者。

# 将消息发送给频道订阅者

PUBLISH 命令要做的就是在 pubsub_channels 字典找到频道 channel 的订阅者名单(一个链表)，然后将消息发送到名单上的所有客户端。 

![pubsub_channels](https://img-blog.csdn.net/20180127204743561?watermark/2/text/aHR0cDovL2Jsb2cuY3Nkbi5uZXQvTEM5MDA3MzA=/font/5a6L5L2T/fontsize/400/fill/I0JBQkFCMA==/dissolve/70/gravity/SouthEast)

如果客户端执行PUBLISH “news.it” “hello” 

那么PUBLISH命令将在pubsub_channels字典中查找键为”news.it”对应的链表值，并且通过遍历链表将信息”hello”发送给订阅者。

# 查看订阅信息

PUBSUB 命令是 Redis 2. 8 新增加的命令之一， 客户端可以通过这个命令来查看频道或者模式的相关信息， 比如某个频道目前有多少订阅者， 又或者某个模式目前有多少订阅者， 诸如此类。

```
PUBSUB subcommand [argument [argument ...]]
```

## 命令

### PUBSUB CHANNELS [pattern] 

当没有 pattern 参数时，返回当前服务器被订阅的所有频道。 

如果给定 pattern 参数，返回服务器当前被订阅的频道中那些与 pattern 模式相匹配的频道。

```
127.0.0.1:6379> pubsub channels
1) "hello_redis"
2) "hello"
3) "liuxiao"
4) "hello_liuxiao"
```

### PUBSUB NUMSUB[ channel- 1 channel- 2... channel- n]

该子命令接受任意多个频道作为输入参数， 并返回这些频道的订阅者数量。

```
127.0.0.1:6379> pubsub numsub 'hello_redis'
1) "hello_redis"
2) (integer) 2
```

### PUBSUB NUMPAT

该子命令用于返回服务器当前被订阅模式的数量。

```
127.0.0.1:6379> pubsub numpat
(integer) 1
```

## PUBSUB 实现函数

本来感觉到此就没有什么功能了，没想到还有一个函数给漏掉了。

那就是PUBSUB命令的实现函数，一开始不怎么理解它，于是查看了一下源码。

有意思，这是个含有子命令的命令。

```c
/* 后面的参数是模式串，子命令channels的功能是返回所有符合该模式串的频道 */
PUBSUB CHANNELS [<pattern1>]
/* 后面的参数是频道，子命令NUMSUB的功能是返回收听该频道的客户端个数 */
PUBSUB NUMSUB [channel1 ... channeln]
/* 子命令NUMPAT的功能是返回服务器中所有模式串频道的个数，即pubsub_patterns链表的长度*/
PUBSUB NUMPAT 
```

其源码实现也很简单，这里列出来大家一起看看。

```c
/* PUBSUB命令源码实现 */
void pubsubCommand(client *c) {
    if (!strcasecmp(c->argv[1]->ptr,"channels") &&
        (c->argc == 2 || c->argc ==3))
    {
        // 子命令 PUBSUB CHANNELS [<pattern>]
        sds pat = (c->argc == 2) ? NULL : c->argv[2]->ptr;
        // 获取迭代器
        dictIterator *di = dictGetIterator(server.pubsub_channels);
        dictEntry *de;
        long mblen = 0;
        void *replylen;

        replylen = addDeferredMultiBulkLength(c);
        // 遍历并检查与模式串是否匹配
        while((de = dictNext(di)) != NULL) {
            robj *cobj = dictGetKey(de);
            sds channel = cobj->ptr;
            if (!pat || stringmatchlen(pat, sdslen(pat),
                                       channel, sdslen(channel),0))
            {
                // 如匹配，就返回该频道的名称
                addReplyBulk(c,cobj);
                mblen++;
            }
        }
        dictReleaseIterator(di);
        setDeferredMultiBulkLength(c,replylen,mblen);
    } else if (!strcasecmp(c->argv[1]->ptr,"numsub") && c->argc >= 2) {
        // 子命令PUBSUB NUMSUB [Channel_1 ... Channel_N]
        int j;

        addReplyMultiBulkLen(c,(c->argc-2)*2);
        for (j = 2; j < c->argc; j++) {
            list *l = dictFetchValue(server.pubsub_channels,c->argv[j]);

            addReplyBulk(c,c->argv[j]);
            addReplyLongLong(c,l ? listLength(l) : 0);
        }
    } else if (!strcasecmp(c->argv[1]->ptr,"numpat") && c->argc == 2) {
        // 子命令PUBSUB NUMPAT
        addReplyLongLong(c,listLength(server.pubsub_patterns));
    } else {
        // 其他不能识别的命令 直接报错
        addReplyErrorFormat(c,
            "Unknown PUBSUB subcommand or wrong number of arguments for '%s'",
            (char*)c->argv[1]->ptr);
    }
}
```

# 参考资料

[Redis 的发布与订阅](https://blog.csdn.net/LC900730/article/details/79180945)

[redis 订阅、发布](https://lanjingling.github.io/2015/11/20/redis-pub-sub/)

[Redis的Pub/Sub（发布/订阅）](https://www.jianshu.com/p/f05ff2afeeed)

## 官方

[订阅与发布](https://redisbook.readthedocs.io/en/latest/feature/pubsub.html)

[Redis 发布订阅](https://www.redis.net.cn/tutorial/3514.html)

[发布与订阅（pub/sub）](http://redisdoc.com/topic/pubsub.html)

* any list
{:toc}