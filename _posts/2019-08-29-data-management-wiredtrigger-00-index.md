---
layout: post
title: wiredtiger-00-数据管理引擎简介
date:  2019-5-10 11:08:59 +0800
categories: [Data-Management]
tags: [data-management, mongo, sh]
published: true
---

# wiredtiger

[WiredTiger](http://source.wiredtiger.com/) is an high performance, scalable, production quality, NoSQL, Open Source extensible platform for data management.

## 简介

WiredTiger是用于数据管理的高性能，可扩展，生产质量的NoSQL，开源可扩展平台。

WiredTiger支持面向行的存储（将一行的所有列存储在一起），面向列的存储（将列按组存储，从而可以更有效地访问和存储列子集）以及日志结构的合并树（LSM） ，以在随机插入工作负载下保持稳定的吞吐量。

WiredTiger包括ACID事务，该事务具有标准的隔离级别以及在检查点和细粒度下的持久性。

WiredTiger可以用作简单的键/值存储，但也具有完整的架构层，包括索引和投影。

WiredTiger通常应可移植到支持ANSI C99，POSIX 1003.1和POSIX 1003.1c（线程扩展）标准的任何64位系统中。

# 拓展阅读

## 索引

[LSM 索引](https://houbb.github.io/2018/09/06/index-lsm)

## 持久化引擎

[LevelDB](https://houbb.github.io/2018/09/06/cache-leveldb-01-start)

[RocksDB](https://houbb.github.io/2018/09/06/cache-rocksdb)

[mmap 零拷贝](https://houbb.github.io/2018/09/22/java-nio-09-zero-copy-mmap-11)

# 参考资料

[WiredTiger-官网](http://source.wiredtiger.com/)

* any list
{:toc}