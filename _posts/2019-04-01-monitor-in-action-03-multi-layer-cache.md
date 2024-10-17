---
layout: post
title: 监控系统实战-03-实时链路配置加载与2层缓存
date: 2018-11-25 09:14:43 +0800
categories: [Devops]
tags: [devops, monitor, apm, zabbix, sh]
published: true
---

# 背景

我们一般的控台系统，实时查询接口/数据库，返回对应的配置信息等，一般时间上都是可以接受的。

但是如果是一个实时链路，那么就必须尽可能的降低这种耗时的远程访问。比如查询数据库

比较自然的思考方式就是引入 redis 之类的缓存。

不过真的只有这一种方式吗？redis 有什么缺点？

# redis/memcache 远程缓存的缺点

## 网络耗时真的快吗？

redis 快，那也只是相对于数据库这种查询比较快。

但是网络耗时实际上是不能忽略的，几毫秒有时候相对内存访问，还是比较慢的。

## 网络抖动

网络访问，最怕的就是抖动。

有时候抖一下，问题就要查询好久。

# 内存的不足

如果配置不多，加载到内存不失为一个比较好的方式。

内存的缺点是存储大小有限制，而且定时加载存在一定的延迟性。


# 二者结合

那么，有没有一种方式可以把二者结合起来呢？

答案是有的：多级缓存。

优先读取本地，然后是远程缓存，最后才是数据库。

可参考：

[Cache Travel-10-多层缓存概览](https://houbb.github.io/2018/09/01/cache-10-multi-cache-01-overview)

[Cache Travel-10-02-layering-cache 是一个支持分布式环境的多级缓存框架](https://houbb.github.io/2018/09/01/cache-10-multi-cache-02-multi-layer)

[Cache Travel-10-03-L2Cache 是一个基于 Caffeine + Redis 的二级缓存框架。让缓存的使用在业务开发中更加简单、高效](https://houbb.github.io/2018/09/01/cache-10-multi-cache-03-l2cache)

[Cache Travel-10-04-JetCache是一个基于Java的缓存系统封装，提供统一的API和注解来简化缓存的使用](https://houbb.github.io/2018/09/01/cache-10-multi-cache-04-jetcache)

[Cache Travel-10-05-j2cache Java 两级缓存框架，可以让应用支持两级缓存框架 ehcache(Caffeine) + redis](https://houbb.github.io/2018/09/01/cache-10-multi-cache-05-j2cache)

# 小结

尺有所长，寸有所短。

我们要学会取长补短，结合具体的场景，而不是一味的依赖某一种方案。



# 参考资料

无

* any list
{:toc}