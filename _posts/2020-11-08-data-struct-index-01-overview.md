---
layout: post
title:  索引数据结构（1）概览篇
date:  2020-10-17 16:15:55 +0800
categories: [Index]
tags: [index, overview, data-struct, topics, sf]
published: true
---


# 基础知识

## 排序

【Exchange sorts】

[冒泡排序 BubbleSort]()

[快速排序 Quicksort]()

【Selection sorts】

Selection sort

Heapsort

【Insertion sorts】

Insertion sort

Shellsort

Tree sort

【Merge sorts】

Merge sort

【Distribution sorts】

Bucket sort

Counting sort


## 查找

二分法

# 索引数据结构

索引可以大幅度的提升查询速度。

常见的索引数据结构有以下几种：

## Hash

[Hash 完美 hash](https://houbb.github.io/2018/05/30/hash-perfect)

[常见 hash 算法](https://houbb.github.io/2018/05/30/hash-impl)

[consistent hash algorithm-一致性哈希算法 java 实现](https://houbb.github.io/2020/06/19/load-balance-03-consistent-hash-in-java)

> [hash 开源工具](https://github.com/houbb/hash.git)

[Bloom Filter-布隆过滤器](https://houbb.github.io/2018/12/05/bloom-filter)

> [Bloom-Filter 开源工具](https://github.com/houbb/bloom-filter)

## Tree

[binary Tree-二叉树](https://houbb.github.io/2018/11/07/data-struct-binary-tree)

[B Tree](https://houbb.github.io/2018/09/12/b-tree)

[B+ Tree]()

mongodb 为什么使用 B Tree?

[Red Black Tree-红黑树](https://houbb.github.io/2018/09/12/data-struct-red-black-tree)

[Slim 战胜 Btree 索引](https://houbb.github.io/2018/09/06/index-slimtrie)

[LSM 索引](https://houbb.github.io/2018/09/06/index-lsm)

[java 敏感词之 DFA 算法(Trie Tree 算法)详解](https://houbb.github.io/2020/01/07/sensitive-word-dfa)

> [sensitive-word 工具](https://github.com/houbb/sensitive-word)

## list

[skiplist-跳表](https://houbb.github.io/2019/02/13/datastruct-skiplist)

# 搜索引擎

## 数据库索引

[倒排索引原理与实现](https://houbb.github.io/2020/01/09/reverse-index)

[数据库索引-02-secondary index 二级索引](https://houbb.github.io/2019/01/02/db-index-02-secondary-index)

[数据库索引-03-cluster index 聚集索引](https://houbb.github.io/2019/01/02/db-index-03-cluster-index)

[数据库索引-04-Apache Phoenix](https://houbb.github.io/2019/01/02/db-index-04-hbase-phoenix)

[数据库索引-05-倒排索引](https://houbb.github.io/2019/01/02/db-index-05-inverted-index)

[数据库索引-06-索引效果不好的场景](https://houbb.github.io/2019/01/02/db-index-06-index-not-work-well)

[数据库索引-07-联合索引](https://houbb.github.io/2019/01/02/db-index-07-combine-index)

[数据库索引-08-MySQL Index Tips](https://houbb.github.io/2019/01/02/db-index-08-mysql-index-tips)

[数据库索引-09-MySQL Index Merge 索引合并](https://houbb.github.io/2019/01/02/db-index-09-mysql-index-merge)

## Lucene

[Lucene-01-Lucene 入门教程](https://houbb.github.io/2018/11/15/lucene-01-overview)

[Lucene-02-lucene 基础知识](https://houbb.github.io/2018/11/15/lucene-02-base)

[Lucene-03-lucene 索引原理](https://houbb.github.io/2018/11/15/lucene-03-theory)

# slor

[Apache Solr 入门](https://houbb.github.io/2017/08/22/apacke-solr)

## ES

[Elasticsearch-01-快速入门](https://houbb.github.io/2016/10/16/elasticsearch-01-overview-01)

[Elasticsearch-02-核心概念介绍](https://houbb.github.io/2018/11/15/elasticsearch-02-intro-02)

## 理论

[搜索引擎-01-Overview](https://houbb.github.io/2017/02/24/search-engine-01-overview-01)

[搜索引擎-02-分词与全文索引](https://houbb.github.io/2017/02/24/search-engine-02-fenci-fulltext-02)

[搜索引擎-03-搜索引擎原理](https://houbb.github.io/2017/02/24/search-engine-03-theory-03)

# 拓展工具

排序

查找

# 小结

希望本文对你有帮助，如果有其他想法的话，也可以评论区和大家分享哦。

各位**极客**的点赞收藏转发，是老马持续写作的最大动力！

# 参考资料

[常用的数据索引数据结构](https://www.jianshu.com/p/2f562c7f10a0)

* any list
{:toc}