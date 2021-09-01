---
layout: post
title: Redis Learn-33-HyperLogLog
date: 2018-12-12 11:35:23 +0800
categories: [Redis]
tags: [redis, cache, sh]
published: true
---

# Redis HyperLogLog

Redis 在 2.8.9 版本添加了 HyperLogLog 结构。

Redis HyperLogLog 是用来做基数统计的算法，HyperLogLog 的优点是，在输入元素的数量或者体积非常非常大时，计算基数所需的空间总是固定的、并且是很小的。

在 Redis 里面，每个 HyperLogLog 键只需要花费 12 KB 内存，就可以计算接近 2^64 个不同元素的基 数。这和计算基数时，元素越多耗费内存就越多的集合形成鲜明对比。

但是，因为 HyperLogLog 只会根据输入元素来计算基数，而不会储存输入元素本身，所以 HyperLogLog 不能像集合那样，返回输入的各个元素。

# 什么是基数?

比如数据集 {1, 3, 5, 7, 5, 7, 8}， 那么这个数据集的基数集为 {1, 3, 5 ,7, 8}, 基数(不重复元素)为5。 

基数估计就是在误差可接受的范围内，快速计算基数。

# 常见命令

- 添加元素

```
PFADD key element [element ...] 
```

添加指定元素到 HyperLogLog 中。

- 估值

```
FCOUNT key [key ...] 
```

返回给定 HyperLogLog 的基数估算值。

- 合并

```
PFMERGE destkey sourcekey [sourcekey ...] 
```

将多个 HyperLogLog 合并为一个 HyperLogLog

# 算法原理

基于统计学。

常见的，通过次数，推算概率。

反过来，根据概率，推算个数。

细节后期研究。

# 参考资料

《Redis 开发与运维》

[hyperloglog index](http://redisdoc.com/hyperloglog/index.html)

[Redis HyperLogLog](https://www.runoob.com/redis/redis-hyperloglog.html)

[神奇的HyperLogLog算法](https://blog.csdn.net/firenet1/article/details/77247649)

[探索HyperLogLog算法（含Java实现）](https://www.jianshu.com/p/55defda6dcd2)

* any list
{:toc}