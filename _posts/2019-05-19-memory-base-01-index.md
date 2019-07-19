---
layout: post
title: Memory 内存知识-01-index
date:  2019-5-10 11:08:59 +0800
categories: [Memory]
tags: [memory, cache, sh]
published: true
---

# 为什么学习

所以的知识，比如 cache，database。

学到后面有几个高山是必须要跨过去的。

- 网络通信

- 操作系统

- 编译原理

- 数据结构与算法

- 内存知识（磁盘硬件）

# 前言

As CPU cores become both faster and more numerous, the limiting factor for most programs isnow, 
and will be for some time, memory access. 

Hardware designers have come up with ever more sophisticated（精密的） memory handling and acceleration（加速） techniques–such as CPU caches–but these cannot work optimally（最佳） without some help from the programmer. 

Unfortunately, neither the structure nor the cost of using the memory subsystem of a computer or the caches on CPUs is well understood by most programmers. 

This paper explains the structure of memory subsystems in use on modern commodity（有价值的） hardware, illustrating（解释说明） why CPU caches were developed, how they work, and what programs should do to achieve optimal performance by utilizing（应用） them。

# 目录



# 持久化相关

[LevelDB](https://houbb.github.io/2018/09/06/cache-leveldb-01-start)

[rocksdb](https://houbb.github.io/2018/09/06/cache-rocksdb)

[MapDB](https://houbb.github.io/2018/09/06/cache-mapdb)

- 其他

levelDb，rocksDB 其实都是师出一脉的。都是出自 google 的 XXXTable。

# 相关缓存框架

[Redis](https://houbb.github.io/2018/12/12/redis-learn-01-overview-01)

[Guava Cache]()

[EhCache]()

[Coffine]()

# 参考资料

[What Every Programmer Should Know About Memory](https://people.freebsd.org/~lstewart/articles/cpumemory.pdf)

* any list
{:toc}