---
layout: post
title: wiredtiger-00-index
date:  2019-5-10 11:08:59 +0800
categories: [Data-Management]
tags: [data-management, mongo, sh]
published: true
---

# wiredtiger

[WiredTiger](http://source.wiredtiger.com/) is an high performance, scalable, production quality, NoSQL, Open Source extensible platform for data management.

# 是什么

WiredTiger is an high performance, scalable, production quality, NoSQL, Open Source extensible platform for data management.

WiredTiger supports row-oriented storage (where all columns of a row are stored together), column-oriented storage (where columns are stored in groups, allowing for more efficient access and storage of column subsets) and log-structured merge trees (LSM), for sustained throughput under random insert workloads.

WiredTiger includes ACID transactions with standard isolation levels and durability at both checkpoint and fine-grained granularity.

WiredTiger can be used as a simple key/value store, but also has a complete schema layer, including indices and projections.

WiredTiger should be generally portable to any 64-bit system supporting the ANSI C99, POSIX 1003.1 and POSIX 1003.1c (threads extension) standards.

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