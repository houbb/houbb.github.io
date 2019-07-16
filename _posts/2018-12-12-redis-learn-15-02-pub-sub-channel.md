---
layout: post
title: Redis Learn-15-02-频道的订阅与退订
date: 2018-12-12 11:35:23 +0800
categories: [Redis]
tags: [redis, cache, sh]
published: true
---

# 频道的订阅与退订

当一个客户端执行 SUBSCRIBE 命令， 订阅某个或某些频道的时候， 这个客户端与被订阅频道之间就建立起了一种订阅关系。

Redis 将所有频道的订阅关系都保存在服务器状态的 pubsub_channels 字典里面， 这个字典的键是某个被订阅的频道， 而键的值则是一个链表， 链表里面记录了所有订阅这个频道的客户端：

```c
struct redisServer {

    // ...

    // 保存所有频道的订阅关系
    dict *pubsub_channels;

    // ...

};
```

比如说， 图 IMAGE_PUBSUB_CHANNELS 就展示了一个 pubsub_channels 字典示例， 这个字典记录了以下信息：

1. client-1 、 client-2 、 client-3 三个客户端正在订阅 "news.it" 频道。

2. 客户端 client-4 正在订阅 "news.sport" 频道。

3. client-5 和 client-6 两个客户端正在订阅 "news.business" 频道。

![IMAGE_PUBSUB_CHANNELS](http://redisbook.com/_images/graphviz-60f69aa701fb317304683d3d57a0156f348eb6f9.png)

# 订阅频道

## SUBSCRIBE 命令

每当客户端执行 `SUBSCRIBE` 命令， 订阅某个或某些频道的时候， 服务器都会将客户端与被订阅的频道在 pubsub_channels 字典中进行关联。

根据频道是否已经有其他订阅者， 关联操作分为两种情况执行：

如果频道已经有其他订阅者， 那么它在 pubsub_channels 字典中必然有相应的订阅者链表， 程序唯一要做的就是将客户端添加到订阅者链表的末尾。

如果频道还未有任何订阅者， 那么它必然不存在于 pubsub_channels 字典， 程序首先要在 pubsub_channels 字典中为频道创建一个键， 并将这个键的值设置为空链表， 然后再将客户端添加到链表， 成为链表的第一个元素。

## 例子

举个例子， 假设服务器 pubsub_channels 字典的当前状态如图 IMAGE_PUBSUB_CHANNELS 所示， 那么当客户端 client-10086 执行命令：

```
SUBSCRIBE "news.sport" "news.movie"
```

之后， pubsub_channels 字典将更新至图 IMAGE_AFTER_SUBSCRIBE 所示的状态， 其中用虚线包围的是新添加的节点：

更新后的 pubsub_channels 字典新增了 "news.movie" 键， 该键对应的链表值只包含一个 client-10086 节点， 表示目前只有 client-10086 一个客户端在订阅 "news.movie" 频道。

至于原本就已经有客户端在订阅的 "news.sport" 频道， client-10086 的节点放在了频道对应链表的末尾， 排在 client-4 节点的后面。

![IMAGE_PUBSUB_CHANNELS](http://redisbook.com/_images/graphviz-207f8a57fee57226f79ed84b96f8a35653ffa21c.png)

## 伪代码

SUBSCRIBE 命令的实现可以用以下伪代码来描述：

```c
def subscribe(*all_input_channels):

    # 遍历输入的所有频道
    for channel in all_input_channels:

        # 如果 channel 不存在于 pubsub_channels 字典（没有任何订阅者）
        # 那么在字典中添加 channel 键，并设置它的值为空链表
        if channel not in server.pubsub_channels:
            server.pubsub_channels[channel] = []

        # 将订阅者添加到频道所对应的链表的末尾
        server.pubsub_channels[channel].append(client)
```

## 源码

```c
/* 订阅模式命令的实现 */
void psubscribeCommand(client *c) {
    int j;
    // 遍历模式串
    for (j = 1; j < c->argc; j++)
        pubsubSubscribePattern(c,c->argv[j]);
    c->flags |= CLIENT_PUBSUB;
}
/* 订阅模式的底层实现 */
int pubsubSubscribePattern(client *c, robj *pattern) {
    int retval = 0;
	// 查看链表中该模式是否存在，如存在不做处理，反之则添加
    if (listSearchKey(c->pubsub_patterns,pattern) == NULL) {
        retval = 1;
        pubsubPattern *pat;
        // 添加模式串到client->pubsub_patterns链表的尾部
        listAddNodeTail(c->pubsub_patterns,pattern);
        incrRefCount(pattern);
        // 构造pubsubPattern结构体并赋值
        pat = zmalloc(sizeof(*pat));
        pat->pattern = getDecodedObject(pattern);
        pat->client = c;
        // 添加pubsubPattern结构体到链表尾部
        listAddNodeTail(server.pubsub_patterns,pat);
    }
    // 回复客户端
    addReply(c,shared.mbulkhdr[3]);
    addReply(c,shared.psubscribebulk);
    addReplyBulk(c,pattern);
    addReplyLongLong(c,clientSubscriptionsCount(c));
    return retval;
}
```

# 退订频道

## UNSUBSCRIBE 命令

UNSUBSCRIBE 命令的行为和 SUBSCRIBE 命令的行为正好相反 —— 当一个客户端退订某个或某些频道的时候， 服务器将从 pubsub_channels 中解除客户端与被退订频道之间的关联：

程序会根据被退订频道的名字， 在 pubsub_channels 字典中找到频道对应的订阅者链表， 然后从订阅者链表中删除退订客户端的信息。

如果删除退订客户端之后， 频道的订阅者链表变成了空链表， 那么说明这个频道已经没有任何订阅者了， 程序将从 pubsub_channels 字典中删除频道对应的键。

## 例子

举个例子， 假设 pubsub_channels 的当前状态如图 IMAGE_BEFORE_UNSUBSCRIBE 所示， 那么当客户端 client-10086 执行命令：

```
UNSUBSCRIBE "news.sport" "news.movie"
```

之后， 图中用虚线包围的两个节点将被删除， 如图 IMAGE_AFTER_UNSUBSCRIBE 所示：

在 pubsub_channels 字典更新之后， client-10086 的信息已经从 "news.sport" 频道和 "news.movie" 频道的订阅者链表中被删除了。

另外， 因为删除 client-10086 之后， 频道 "news.movie" 已经没有任何订阅者， 因此键 "news.movie" 也从字典中被删除了。

![IMAGE_AFTER_UNSUBSCRIBE](http://redisbook.com/_images/graphviz-cba75c1f54b514535fca656ef7f34abc3e5cd4cf.png)

![IMAGE_AFTER_UNSUBSCRIBE-2](http://redisbook.com/_images/graphviz-03cef4ebe29117e302241c2138412451686e6e78.png)

## 伪代码

UNSUBSCRIBE 命令的实现可以用以下伪代码来描述：

```c
def unsubscribe(*all_input_channels):

    # 遍历要退订的所有频道
    for channel in all_input_channels:

        # 在订阅者链表中删除退订的客户端
        server.pubsub_channels[channel].remove(client)

        # 如果频道已经没有任何订阅者了（订阅者链表为空）
        # 那么将频道从字典中删除
        if len(server.pubsub_channels[channel]) == 0:
            server.pubsub_channels.remove(channel)
```

## 源码

退订的操作就放在一节里面讲了，无非就是从结构体中删除一些节点，事实就是如此，以退订频道为例：

```c
/* 退订频道的命令实现 */
void unsubscribeCommand(client *c) {
    if (c->argc == 1) {
        // 退订所有频道
        pubsubUnsubscribeAllChannels(c,1);
    } else {
        int j;
        // 遍历频道，一一退订
        for (j = 1; j < c->argc; j++)
            // 退订频道
            pubsubUnsubscribeChannel(c,c->argv[j],1);
    }
    if (clientSubscriptionsCount(c) == 0) c->flags &= ~CLIENT_PUBSUB;
}

/* 退订频道的底层实现 */
int pubsubUnsubscribeChannel(client *c, robj *channel, int notify) {
    dictEntry *de;
    list *clients;
    listNode *ln;
    int retval = 0;
    // 该指针可能指向字典结构中的同一个对象，此处需要保护它
    incrRefCount(channel); 
    // 在客户端的pubsub_channels字典中删除
    if (dictDelete(c->pubsub_channels,channel) == DICT_OK) {
        retval = 1;
        // 在服务器的pubsub_channels中删除
        de = dictFind(server.pubsub_channels,channel);
        serverAssertWithInfo(c,NULL,de != NULL);
        clients = dictGetVal(de); // 获取客户端链表
        ln = listSearchKey(clients,c); // 找到该客户端对应的节点
        serverAssertWithInfo(c,NULL,ln != NULL);
        listDelNode(clients,ln); // 删除节点
        if (listLength(clients) == 0) {
            // 如果该频道下没有客户端了，就删除字典中的该频道节点
            dictDelete(server.pubsub_channels,channel);
        }
    }
    // 通知客户端
    if (notify) {
        addReply(c,shared.mbulkhdr[3]);
        addReply(c,shared.unsubscribebulk);
        addReplyBulk(c,channel);
        addReplyLongLong(c,dictSize(c->pubsub_channels)+
                       listLength(c->pubsub_patterns));

    }
    // 到了这里可以安全的删除了
    decrRefCount(channel);
    return retval;
}
```

其他的退订操作也是如此，下面仅罗列出它们的函数声明和功能，有兴趣的可以去源码中查看。

```c
/* 退订所有频道 */
pubsubUnsubscribeAllChannels(client *c, int notify);
/* 退订所有模式 */
pubsubUnsubscribeAllPatterns(client *c, int notify);
/* 退订一个或多个频道 */
pubsubUnsubscribeChannel(client *c, robj *channel, int notify);
/* 退订一个或多个模式 */
pubsubUnsubscribePattern(client *c, robj *pattern, int notify);
/* 退订模式的命令实现 */
punsubscribeCommand(client *c);
/* 退订频道的命令实现 */
subscribeCommand(client *c);
```

# 发布消息

当客户端调用发布消息的命令时，需要进行如下两个操作：

1. 查找服务器的pubsub_channels字典下该频道对应的客户端链表，然后遍历，一一发送

2. 查找服务器的pubsub_patterns链表，遍历模式串，如果匹配就发送，反之不作处理

## publishCommand

发布消息的命令由 publishCommand 函数实现，其源码如下：

```c
/* 发布消息命令的实现 */
void publishCommand(client *c) {
    int receivers = pubsubPublishMessage(c->argv[1],c->argv[2]);
    // 如果开启了集群，需要向集群中的客户端发送消息
    // 现阶段不讨论集群
  	if (server.cluster_enabled)
        clusterPropagatePublish(c->argv[1],c->argv[2]);
    else
        forceCommandPropagation(c,PROPAGATE_REPL);
    addReplyLongLong(c,receivers);
}
/* 发布消息的底层实现 */
int pubsubPublishMessage(robj *channel, robj *message) {
    int receivers = 0;
    dictEntry *de;
    listNode *ln;
    listIter li;

    // 发送到订阅该频道的所有客户端
    de = dictFind(server.pubsub_channels,channel);
    if (de) {
        // 如果存在该频道，则获取客户端链表
        list *list = dictGetVal(de);
        listNode *ln;
        listIter li;
		// 获取迭代器
        listRewind(list,&li);
        // 遍历，发送消息
        while ((ln = listNext(&li)) != NULL) {
            client *c = ln->value;
			// 发送消息
            addReply(c,shared.mbulkhdr[3]);
            addReply(c,shared.messagebulk);
            addReplyBulk(c,channel);
            addReplyBulk(c,message);
            receivers++;
        }
    }
    // 发送到所有模式能与该频道匹配上的客户端
    if (listLength(server.pubsub_patterns)) {
        // 获取迭代器
        listRewind(server.pubsub_patterns,&li);
        // 解码频道
        channel = getDecodedObject(channel);
        // 遍历该链表
        while ((ln = listNext(&li)) != NULL) {
            pubsubPattern *pat = ln->value;
            // 判断是否能匹配上
            if (stringmatchlen((char*)pat->pattern->ptr,
                                sdslen(pat->pattern->ptr),
                                (char*)channel->ptr,
                                sdslen(channel->ptr),0)) {
                // 能匹配上，发送消息
                addReply(pat->client,shared.mbulkhdr[4]);
                addReply(pat->client,shared.pmessagebulk);
                addReplyBulk(pat->client,pat->pattern);
                addReplyBulk(pat->client,channel);
                addReplyBulk(pat->client,message);
                receivers++;
            }
        }
        // 执行完之后，引用计数减1
        decrRefCount(channel);
    }
    // 返回收到消息的客户端个数
    return receivers;
}
```




# 参考资料

[频道的订阅与退订](http://redisbook.com/preview/pubsub/channel.html)

[Redis源码剖析--发布与订阅Pubsub](https://zcheng.ren/redis/theannotatedredissourcepubsub/)

* any list
{:toc}