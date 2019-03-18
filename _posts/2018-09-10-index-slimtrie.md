---
layout: post
title:  Slim 战胜Btree索引 
date:  2018-09-07 07:44:19 +0800
categories: [Data-Struct]
tags: [index, data-struct, sh]
published: true
---

# Slim

[Slim](https://github.com/openacid/slim) Slim is collection of surprisingly space efficient data types, with corresponding serialisation APIs to persisting them on-disk or for transport.

# 索引的一点背景知识

索引可以被认为是业务数据（用户文件）之外的一些"额外"的数据, 在这些额外的数据帮助下, 可以在大量的数据中快速找到自己想要的内容. 就像一本数学课本的2个"索引": 一个是目录, 一个是关键词索引.

## 索引的要求

现实系统中，存储系统中的索引需要做到：

足够小 : 一般实现为将索引信息全部存储在内存中可以达到比较好的性能。访问索引的过程中不能访问磁盘, 否则延迟变得不可控(这也是为什么leveldb或其他db在我们的设计中没有作为索引的实现来考虑).

足够准确 : 对较小的文件, 访问一个文件开销为1次磁盘IO操作。

## hash vs tree

分析下已有的2种索引类型, hash-map类型的和tree类型的,Hash map类索引利用hash函数的计算来定位一个文件：

优势 ：快速，一次检索定位数据。非常适合用来做 单条 数据的定位。

劣势 ：无序。不支持范围查询。必须是等值匹配的，不支持“>”、“<”的操作。

内存开销: O(k * n)。

查询效率: O(k)。

## Tree 

而基于Tree 的索引中代表性的有: B+tree, RBTree, SkipList, LSM Tree, 排序数组 :

优势 : 它对保存的key是排序的；

劣势 : 跟Hash map一样, 用Tree做索引的时候, map.set(key = key, value = (offset, size)) 内存中必须保存完整的key, 内存开销也很大: O(k * n)；

内存开销: O(k * n)；

查询效率: O(k * log(n))；

以上是两种经典的索引都存在一个无法避免的问题： key的数量很大时，它们对内存空间的需求会变的非常巨大：O(k * n) 。

如果100亿个key（文件名）长度为1KB的文件。那么仅这些key的索引就是 1KB * 100亿 = 10,000GB。导致以上的经典数据结构无法将索引缓存在内存中。而索引又必须避免访问磁盘IO，基于这些原因我们实现了一套专为存储系统设计的SlimTrie索引.

# 索引数据大小的理论极限

如果要索引n个key, 那每条索引至少需要 log 2 (n) 个bit的信息, 才能区分出n个不同的key. 因此理论上所需的内存空间最低是log 2 (n) * n * n, 这个就是我们空间优化的目标. 

在这里,空间开销仅仅依赖于key的数量，而不会受key的长度的影响!

我们在实现时将所有要索引的key拆分成多组，来限制了单个索引数据结构中 n的大小, 这样有2个好处:

n 和  log 2 (n)  都比较确定, 容易进行优化；

占用空间更小, 因为: a * log(a) + b * log(b) <(a+b) * log(a+b)；

# SlimTrie索引结构的设计

我们最终达到每个文件的索引平均内存开销与key的长度无关， 每条索引一共10 byte, 其中:

6 byte是key的信息;

4 byte是value: (offset, size); // value的这个设定是参考通常的存储实现举的一个例子，不一定是真实生产环境的配置。

# 实现思路：从Trie开始

在研究Trie索引的时候, 我们发现它的空间复杂度(的量级)、顺序性、查询效率(的量级)都可以满足预期, 虽然实现的存储空间开销仍然很大，但有很大的优化空间。

Trie 就是一个前缀树, 例如，保存了8个key（"A", "to", "tea", "ted", "ten", "i", "in", and "inn"）的Trie的结构如下：

Trie的特点在于原生的前缀压缩, 而Trie上的节点数最少是O(n), 这在量级上跟我们的预期一致。

但Trie仍然需要每个节点都要保存若干个指针(指针在目前普遍使用的64位系统上单独要占8字节)。

# limTrie的设计目标
  
## 功能要求：

  SlimTrie能正确的定位存在的key，但不需要保证定位不存在的key。
  
  SlimTrie支持范围定位key。
  
  SlimTrie的内存开销只与key的个数n相关，不依赖于key的长度k 。
  
  SlimTrie查询速度要快。

## 限制：
  
  SlimTrie只索引静态数据。 数据生成之后在使用阶段不修改, 依赖于这个假设我们可以对索引进行更多的优化。
  
  SlimTrie支持最大16KB的key 。
  
  SlimTrie在内存中不保存完整的key的信息。
  
最终性能目标对比其他几种常见的数据结构应是：

## SlimTrie的术语定义
   
   key：某个用户的文件名，一般是一个字符串。
   
   value: 要索引的用户数据, 这里value是一组(offset, size)。
   
   n: key的总数: <=  2 15 。
   
   k: key的平均长度 < 2 16  。
   
   Leaf 节点: SlimTrie中的叶子节点, 每个Leaf对应一个存在的key。
   
   LeafParent 节点：带有1个Leaf节点的节点。 SlimTrie中最终Leaf节点会删掉，只留下LeafParent节点。
   
   Inner 节点: SlimTrie中的Leaf和LeafParent节点之外的节点。
  

# 总结

SlimTrie 为未来而生。当下信息爆炸增长，陈旧的索引模式已无法适应海量数据新环境，存储系统海量数据的元信息管理面临巨大挑战，而SlimTrie 提供了一个全新的解决方法，为海量存储系统带来一丝曙光，为云存储拥抱海量数据时代注入了强大动力，让我们看到了未来的无限可能。

作为索引，SlimTrie 的优势巨大，可以在10GB内存中建立1PB数据量的索引，空间节约惊人，令以往的索引结构望尘莫及；时间消耗上，SlimTrie 的查找性能与 sorted Array 接近，超过经典的B-Tree。

抛下索引这个身份，SlimTrie 在各项性能方面表现依旧不俗，作为一个通用 Key-Value 的数据结构，内存额外开销仍远远小于经典的 map 和 Btree 。

SlimTrie 不仅为我们解决了眼前的困境，也让我们看到了未来的可能。它的成功不会停下我们开拓的脚步，这只是个开始，还远没有结束。

# 参考资料

[SlimTrie：战胜Btree单机百亿文件的极致索引-实现篇](https://mp.weixin.qq.com/s/QSnKJCtbZCbW0ymsvY8IFQ)

[SlimTrie: 单机百亿文件的极致索引-设计篇](https://openacid.github.io/tech/algorithm/slimtrie-design)

* any list
{:toc}