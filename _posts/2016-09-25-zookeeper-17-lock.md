---
layout: post
title: ZooKeeper-17-通过ZooKeeper实现分布式锁
date:  2016-09-25 12:21:05 +0800
categories: [Apache]
tags: [zookeeper, config-center]
published: true
---

# 实现⼀个原语：通过ZooKeeper实现锁

关于ZooKeeper的功能，⼀个简单的例⼦就是通过锁来实现临界区域。

假设有⼀个应⽤由n个进程组成，这些进程尝试获取⼀个锁。再次强调，ZooKeeper并未直接暴露原语，因此我们使⽤ZooKeeper的接⼜来管理znode，以此来实现锁。为了获得⼀个锁，每个进程p尝试创建znode，名为/lock。如果进程p成功创建了znode，就表⽰它获得了锁并可以继续执⾏其临界区域的代码。不过⼀个潜在的问题是进程p可能崩溃，导致这个锁永远⽆法释放。在这种情况下，没有任何其他进程可以再次获得这个锁，整个系统可能因死锁⽽失灵。为了避免这种情况，我们不得不在创建这个节点时指定/lock为临时节点。

# TODO

使用 zk-cli 实现一个 zk 锁。

# 参考资料

《Zookeeper分布式过程协同技术详解》

* any list
{:toc}
