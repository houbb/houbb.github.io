---
layout: post
title: Redis Learn-30-Keys 正则表达式的问题
date: 2018-12-12 11:35:23 +0800
categories: [Redis]
tags: [redis, cache, in-action, sh]
published: true
---


# 悲剧

新闻内容如下：php工程师执行 `redis keys *` 导致数据库宕机！

某公司技术部发生2起本年度PO级特大事故，造成公司资金损失400万，原因如下：

由于php工程师直接操作上线redis，执行：

```
keys * wxdb（此处省略）cf8*
```

这样的命令，导致redis锁住，导致CPU飙升，引起所有支付链路卡住，等十几秒结束后，所有的请求流量全部挤压到了rds数据库中，使数据库产生了雪崩效应，发生了数据库宕机事件。

该公司表示，如再犯类似事故，将直接开除，并表示之后会逐步收回运维部各项权限！

# 一条铁律

在业内，redis开发规范中有一条铁律如下所示：

**线上 Redis 禁止使用Keys正则匹配操作！**

然而大家都知道，却一直忘记，所以事故会不断的发生。

下面讲一讲在线上执行正则匹配操作，引起缓存雪崩，最终数据库宕机的原因。

# 分析原因

## 背景

1、redis是单线程的，其所有操作都是原子的，不会因并发产生数据异常；

2、使用高耗时的Redis命令是很危险的，会占用唯一的一个线程的大量处理时间，导致所有的请求都被拖慢。（例如时间复杂度为O(N)的KEYS命令，严格禁止在生产环境中使用）；

## 原因

有上面两句作铺垫，原因就显而易见了！

运维人员进行keys *操作，该操作比较耗时，又因为redis是单线程的，所以redis被锁住；

此时QPS比较高，又来了几万个对redis的读写请求，因为redis被锁住，所以全部Hang在那；

因为太多线程Hang在那，CPU严重飙升，造成redis所在的服务器宕机；

所有的线程在redis那取不到数据，一瞬间全去数据库取数据，数据库就宕机了；

# 改良建议

业内建议使用scan命令来改良keys和SMEMBERS命令：

Redis2.8版本以后有了一个新命令scan，可以用来分批次扫描redis记录，这样肯定会导致整个查询消耗的总时间变大，但不会影响redis服务卡顿，影响服务使用。

具体使用，大家详情可以自己查阅下面这份文档：

[http://doc.redisfans.com/key/scan.html](http://doc.redisfans.com/key/scan.html)

# 同样危险的命令

需要注意的是，同样危险的命令不仅有keys *，还有以下几组：

```
flushdb     清空所有的 key
flushall    清空所有的数据
CONIFG      修改配置
```

因此，一个合格的redis运维或者开发，应该懂得如何禁用上面的命令。

所以我一直觉得出现新闻中那种情况的原因，一般是人员的水平问题。

## 如何禁用

就是在 redis.conf 中，在 SECURITY 这一项中，我们新增以下命令：

```
rename-command FLASHALL ""
```

另外，对于FLUSHALL命令，需要设置配置文件中appendonly no，否则服务器是无法启动。

注意了，上面的这些命令可能有遗漏，大家可以查官方文档。

除了Flushdb这类和redis安全隐患有关的命令意外，但凡发现时间复杂度为O(N)的命令，都要慎重，不要在生产上随便使用。

例如hgetall、lrange、smembers、zrange、sinter等命令，它们并非不能使用，但这些命令的时间复杂度都为O(N)，使用这些命令需要明确N的值，否则也会出现缓存宕机。

# 参考资料

[Redis敢在线上做Keys正则匹配操作！你可以离职了！](https://mp.weixin.qq.com/s/PKuo-RIDHxquUPofGqgcVA)

* any list
{:toc}