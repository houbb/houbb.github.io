---
layout: post
title:  Consistent Hash
date:  2018-08-13 17:41:51 +0800
categories: [Distributed]
tags: [sql, nosql, distributed, sf]
published: true
---

# 一致性 hash

分布式过程中我们将服务分散到若干的节点上，以此通过集体的力量提升服务的目的。然而，对于一个客户端来说，该由哪个节点服务呢？或者说对某个节点来说他分配到哪些任务呢？

# 强哈希

考虑到单服务器不能承载，因此使用了分布式架构，最初的算法为 hash() mod n, hash()通常取用户ID，n为节点数。此方法容易实现且能够满足运营要求。缺点是当单点发生故障时，系统无法自动恢复。同样不也不能进行动态增加节点。

# 弱哈希

为了解决单点故障，使用 `hash() mod (n/m)`, 

这样任意一个用户都有 m 个服务器备选，可由 client 随机选取。

由于不同服务器之间的用户需要彼此交互，所以所有的服务器需要确切的知道用户所在的位置。

因此用户位置被保存到 memcached 中。当一台发生故障，client 可以自动切换到对应 backup，由于切换前另外 1 台没有用户的 session，因此需要 client 自行重新登录。

- 好处

他比强哈希的好处是：解决了单点问题。

- 缺点

但存在以下问题：负载不均衡，尤其是单台发生故障后剩下一台会压力过大；不能动态增删节点；节点发生故障时需要 client 重新登录

# 一致性 hash 算法

一致性 hash 算法提出了在动态变化的 Cache 环境中，判定哈希算法好坏的四个定义：

## 平衡性(Balance)

平衡性是指哈希的结果能够尽可能分布到所有的缓冲中去，这样可以使得所有的缓冲空间都得到利用。很多哈希算法都能够满足这一条件。

## 单调性(Monotonicity)

单调性是指如果已经有一些内容通过哈希分派到了相应的缓冲中，又有新的缓冲加入到系统中。哈希的结果应能够保证原有已分配的内容可以被映射到原有的或者新的缓冲中去，而不会被映射到旧的缓冲集合中的其他缓冲区。

## 分散性(Spread)

在分布式环境中，终端有可能看不到所有的缓冲，而是只能看到其中的一部分。

当终端希望通过哈希过程将内容映射到缓冲上时，由于不同终端所见的缓冲范围有可能不同，从而导致哈希的结果不一致，最终的结果是相同的内容被不同的终端映射到不同的缓冲区中。

这种情况显然是应该避免的，因为它导致相同内容被存储到不同缓冲中去，降低了系统存储的效率。分散性的定义就是上述情况发生的严重程度。好的哈希算法应能够尽量避免不一致的情况发生，也就是尽量降低分散性。

## 负载(Load)

负载问题实际上是从另一个角度看待分散性问题。既然不同的终端可能将相同的内容映射到不同的缓冲区中，那么对于一个特定的缓冲区而言，也可能被不同的用户映射为不同的内容。

与分散性一样，这种情况也是应当避免的，因此好的哈希算法应能够尽量降低缓冲的负荷。

普通的哈希算法（也称硬哈希）采用简单取模的方式，将机器进行散列，这在cache环境不变的情况下能取得让人满意的结果，但是当cache环境动态变化时，
这种静态取模的方式显然就不满足单调性的要求（当增加或减少一台机子时，几乎所有的存储内容都要被重新散列到别的缓冲区中）。


# 代码实现

## 实现逻辑

一致性哈希算法有多种具体的实现，包括 [Chord 算法](https://en.wikipedia.org/wiki/Chord_(peer-to-peer))，[KAD 算法](https://en.wikipedia.org/wiki/Kademlia)等实现，以上的算法的实现都比较复杂。

这里介绍一种网上广为流传的一致性哈希算法的基本实现原理，感兴趣的同学可以根据上面的链接或者去网上查询更详细的资料。

一致性哈希算法的基本实现原理是将机器节点和key值都按照一样的hash算法映射到一个`0~2^32`的圆环上。

当有一个写入缓存的请求到来时，计算 Key 值 k 对应的哈希值 Hash(k)，如果该值正好对应之前某个机器节点的 Hash 值，则直接写入该机器节点，
如果没有对应的机器节点，则顺时针查找下一个节点，进行写入，如果超过 `2^32` 还没找到对应节点，则从0开始查找(因为是环状结构)。

如图 1 所示:

![hash](http://blog.huanghao.me/wp-content/uploads/2011/06/%E5%9B%BE1.png)

图 1 中 Key K 的哈希值在 A 与 B 之间，于是 K 就由节点B来处理。

另外具体机器映射时，还可以根据处理能力不同，将一个实体节点映射到多个虚拟节点。

经过一致性哈希算法散列之后，当有新的机器加入时，将只影响一台机器的存储情况，

例如新加入的节点H的散列在 B 与 C 之间，则原先由 C 处理的一些数据可能将移至 H 处理，
而其他所有节点的处理情况都将保持不变，因此表现出很好的单调性。

而如果删除一台机器，例如删除 C 节点，此时原来由 C 处理的数据将移至 D 节点，而其它节点的处理情况仍然不变。

而由于在机器节点散列和缓冲内容散列时都采用了同一种散列算法，因此也很好得降低了分散性和负载。

而通过引入虚拟节点的方式，也大大提高了平衡性。


## 实现代码

[consitent-hashing](https://github.com/houbb/consitent-hashing)

# 参考资料

https://blog.csdn.net/lihao21/article/details/54193868

https://yikun.github.io/2016/06/09/%E4%B8%80%E8%87%B4%E6%80%A7%E5%93%88%E5%B8%8C%E7%AE%97%E6%B3%95%E7%9A%84%E7%90%86%E8%A7%A3%E4%B8%8E%E5%AE%9E%E8%B7%B5/

http://afghl.github.io/2016/07/04/consistent-hashing.html

https://zh.wikipedia.org/wiki/%E4%B8%80%E8%87%B4%E5%93%88%E5%B8%8C

https://blog.csdn.net/sunxinhere/article/details/7981093

http://blog.huanghao.me/?p=14

- 代码实现

[Consistent-hashing C 语言实现](https://www.codeproject.com/Articles/56138/Consistent-hashing)

- chord

http://101.96.10.64/db.cs.duke.edu/courses/cps212/spring15/15-744/S07/papers/chord.pdf

https://github.com/ChuanXia/Chord

https://en.wikipedia.org/wiki/Chord_(peer-to-peer)

http://www.yeolar.com/note/2010/04/06/p2p-chord/

https://github.com/ChuanXia/Chord

https://github.com/netharis/Chord-Implementation/blob/master/Chord/Chord.java

https://github.com/TitasNandi/Chord-JAVA



- kademlia

http://www.yeolar.com/note/2010/03/21/kademlia/

https://en.wikipedia.org/wiki/Kademlia

* any list
{:toc}