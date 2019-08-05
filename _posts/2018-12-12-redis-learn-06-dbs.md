---
layout: post
title: Redis Learn-06-db 
date: 2018-12-12 11:35:23 +0800
categories: [Redis]
tags: [redis, cache, sh]
published: true
---

# db 

## 概念

redis 默认有 16 个 db，编号为 0-15

各个 db 之间的操作是互不影响的。

## 配置

当然也可以自行设置总数：

redis 配置文件中下面的参数来控制数据库总数：

/etc/redis/redis.conf 文件中，有个配置项 

```
databases = 16
```

## 切换

默认情况下，一个客户端连接到数据库0。

```
>   select 0
```

## 实例大小

不同的应用应该使用不同的Redis实例存储数据。

由于Redis非常轻量级，一个空Redis实例占用的内在只有1M左右，所以不用担心多个Redis实例会额外占用很多内存。

# 个人收获

个人理解这个 db 有些类似于一个命名空间。

可以让不同的 db 之间互不影响，是为了避免多个 redis 实例而设计的一种方案。

## 业务的设计

感觉实际使用中，没有必要。

正常的业务都应该有一个区分的标识：

```
系统号_业务号_XXX
```

# 参考资料

[Redis Select 命令 - 切换到指定的数据库](https://www.redis.net.cn/order/3653.html)

[Redis -02- Redis 中如何切换数据库 db + 常用使用命令](https://icode.blog.csdn.net/article/details/88942118)

* any list
{:toc}