---
layout: post
title: Redis Learn-29-bigkey hget 简介
date: 2018-12-12 11:35:23 +0800
categories: [Redis]
tags: [redis, cache, sh]
published: true
---

# hset 和 hget

## 基本使用

```sh
redis> HSET site redis redis.com
(integer) 1

redis> HGET site redis
"redis.com"

# 字段不存在

redis> HGET site mysql
(nil)
```

## 基本说明

Redis Hget 命令用于返回哈希表中指定字段的值。

实际上这就是一个 hashmap。

# keys 较多的情况

## keys 

```
hkeys xxx
```

可以看到所有对应的 keys

这个主要针对 Keys 不是特别多的常见。

## scan 

你可以通过 scan 的方式去查询

```
scan 0 match 20200525_SUPAY_TIME_TRADE
```

这个可以针对 Keys 较多的场景。

# 拓展阅读

[Redis中的Scan命令的使用](https://www.cnblogs.com/wy123/p/10955153.html)

[hget](https://redis.readthedocs.io/en/2.6/hash/hget.html)

[hget](https://www.runoob.com/redis/hashes-hget.html)

* any list
{:toc}