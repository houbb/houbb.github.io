---
layout: post
title: An Efficient Implementation of Trie Structures 双数组实现 Trie 论文翻译
date:  2020-1-7 10:09:32 +0800
categories: [Java]
tags: [java, github, sensitive, paper, sf]
published: true
---

# summary

提出了一种新的内部数组结构，称为双数组，实现了 trie 结构。

双数组结合了矩阵形式的快速访问和列表形式的紧凑性。

通过实例介绍检索、插入和删除的算法。

虽然插入比较慢，但还是很实用的，删除和检索的时间都比列表形式有所提升。

通过与各种大key集合列表的比较，双数组的大小可以比列表小17%左右，双数组的检索速度可以从 比列表快3·1到5·1倍。

# 介绍

在很多信息检索应用中，需要能够采用trie搜索，逐字查找输入。

示例包括编译器的词法分析器、书目搜索、拼写检查器和自然语言处理中的词法词典等。

trie 的每个节点都是一个由下一个“项目”索引的数组。

索引的元素是一个最终状态标志，加上一个指向新节点或空指针的指针。

trie 的检索、删除和插入速度非常快，但需要占用大量空间，因为空间复杂度与节点数和字符数的乘积成正比。

一个众所周知的压缩 trie 的策略是列出弧每个节点的，空指针在列表的末尾。

列表结构的 trie 使我们能够通过使用数组结构的 trie 的空指针来节省空间，但是如果离开每个节点的弧很多，则检索会变慢。

本文提出了一种将 trie 压缩为两个一维数组 BASE 和 CHECK 的技术，称为双数组。

在双数组中，节点 n 的非空位置通过数组 BASE 映射到数组 CHECK 中，使得每个节点中没有两个非空位置映射到 CHECK 中的相同位置。

trie 的每个弧都可以在 0 (1) 时间内从双数组中检索出来，也就是说，对于该键的长度 k，检索键的最坏情况时间复杂度变为 0 ( k )。

trie 有很多节点用于大量键，因此使双数组紧凑很重要。 

为了为大量键实现 trie，双数组仅在 trie 中存储消除键歧义所需的前缀，而不需要进一步消除歧义的键的尾部存储在 字符串数组，记为 TAIL。

- Figure 1. An array-structured trie for bachelor, baby, badge, jar

![Figure 1. An array-structured trie for bachelor, baby, badge, jar](https://img-blog.csdnimg.cn/ebefdce192454fa19424260c8e7783fc.png)

- Figure 2. A list-structured trie for bachelor, baby, badge, jar

![F2-A list-structured trie for bachelor, baby, badge, jar](https://img-blog.csdnimg.cn/7a8ac51dd91f47d6b323169d5e2d9af9.png)

# TRIE 的表示

trie 是一种树结构，其中从根到叶子的每条路径对应于表示集中的一个键。

trie 中的路径对应于集合中键的字符。

为避免将“the”和“then”等词混淆，在集合中每个词的末尾使用了一个特殊的结束标记符号 `#`。

以下定义将用于以下解释。

K 是由 trie 表示的键集。

trie 由节点和弧组成。 弧标签由称为字符的符号组成。 从节点 n 到 m 标记为 a 的弧由符号 g(n, a)=m 表示。

对于 K 中的键，如果 a 是足以将该键与 K 中的所有其他键区分开来的字符（或弧标签），则具有 g(n,a)=m 的节点 m 是一个单独的节点。

从单独节点 m 到终端节点的弧标签的串联称为 m 的单个字符串，表示为 STR[ m ]。

从 K 中删除单个字符串后剩下的键 K 的字符称为 K 的尾部。

仅由从根到 K 中所有键的单独节点的弧构成的树称为缩减特里树。

图 3 显示了集合 K= {baby#, bachelor#, badge#, jar#} 的简化 trie 示例。

图 3 中也显示了相同的简化 trie 表示，使用双数组和字符数组进行尾部存储。

TAIL中的问号（`？`）表示垃圾； 它们的用途将在分析插入和删除算法时进行解释。

简化的 trie 和图 3 所示的双数组之间存在以下关系：

- Figure 3. The reduced trie and the double-array for K

![Figure 3. The reduced trie and the double-array for K](https://img-blog.csdnimg.cn/43fd392b216f4fb7be601c37b9657d6b.png)

# 参考资料

http://www.co-ding.com/assets/pdf/dat.pdf

* any list
{:toc}