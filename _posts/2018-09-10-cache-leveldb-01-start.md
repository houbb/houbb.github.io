---
layout: post
title:  LevelDB-01-入门
date:  2018-09-07 07:44:19 +0800
categories: [Cache]
tags: [cache, google, middleware, in-memory cache, sh]
published: true
excerpt: LevelDB 入门学习
---

# LevelDB

[LevelDB](https://github.com/google/leveldb) is a fast key-value storage library written at Google that provides an ordered mapping from string keys to string values.

## Features

- 键和值是任意的字节数组。

- 数据按键存储。

- 调用者可以提供一个定制的比较函数来覆盖排序顺序。

- 基本操作是Put(key,value)， Get(key)， Delete(key)。

- 在一个原子批处理中可以进行多个更改。

- 用户可以创建一个瞬态快照来获得数据的一致视图。

- 数据支持向前和向后迭代。

- 使用Snappy compression库自动压缩数据。

- 外部活动(文件系统操作等)通过虚拟接口中继，以便用户可以自定义操作系统交互。

# 适用场景

LevelDB是Google开源的持久化KV单机数据库，具有很高的随机写，顺序读/写性能，但是随机读的性能很一般，也就是说，LevelDB很适合应用在查询较少，而写很多的场景。

LevelDB应用了LSM (Log Structured Merge) 策略，lsm_tree对索引变更进行延迟及批量处理，并通过一种类似于归并排序的方式高效地将更新迁移到磁盘，降低索引插入开销，关于LSM，本文在后面也会简单提及。

LevelDB是一个基于本地文件的存储引擎，非分布式存储引擎，原理基于BigTable（LSM文件树），无索引机制，存储条目为Key-value。适用于保存数据缓存、日志存储、高速缓存等应用，主要是避免RPC请求带来的延迟问题。在存取模型上，顺序读取性能极高，但是对于随机读取的情况延迟较大（但性能也不是特别低），比较适合顺序写入（key），随机的key写入也不会带来问题。数据存量通常为物理内存的3~5倍，不建议存储过大的数据，在这个数据量级上，leveldb的性能比那些“分布式存储”要高（即本地磁盘存取延迟小于RPC网络延迟）。

1）如果你的log日志或者视频片段需要暂存在本地，稍后再批量发给远端的数据中心，那么这种需求非常适合使用leveldb做数据缓冲。（这些缓存的数据被切分成多个小的chunks，以key-value的方式保存在leveldb中）

2）如果你希望构建一个本地cache组件，但是cache的数据可能比内存容量要大，此时我们就可以使用leveldb做支撑，leveldb将一部分热区数据保存在内存，其他数据保存在磁盘上，可以并发的、随机读取key-value。但是数据不能太大，否则磁盘读取的延迟将很大，此时应该使用分布式缓存。（当然，分布式缓存是用于解决分布式环境中数据同步、一致性的问题，不仅仅是数据量过大的问题）

## 特性

leveldb为一个本地化的K-V存储数据库，设计思想类似于Bigtable，将key按照顺序在底层文件中存储，同时为了加快读取操作，内存中有一个memtable来缓存数据。

根据leveldb官网的性能基准测试，我们大概得出其特性：

1）leveldb的顺序读（遍历）的效率极高，几乎接近文件系统的文件顺序读。比BTree数据库要快多倍。

2）其随机读性能较高，但和顺序读仍有几个量级上的差距。leveldb的随机读，和基于BTree的数据库仍有较大差距。（个人亲测，其随机读的效率并不像官网所说如此之
高，可能与cache的配置有关）随机读，要比BTree慢上一倍左右。

3）顺序写，性能极高（无强制sync），受限于磁盘速率；随机写，性能稍差，不过性能相对于其他DB而言，仍有极大的优势。无论是顺序写还是随机写，性能都BTree要快
多倍。

4）leveldb为K-V存储结构，字节存储。属于NoSql数据库的一种，不支持事务，只能通过KEY查询数据；支持批量读写操作。

5）leveldb中key和value数据尺寸不能太大，在KB级别，如果存储较大的key或者value，将对leveld的读写性能都有较大的影响。

6）leveldb本身没有提供索引机制，所以随机读性能稍差。它存储的key、value可以为任意字节数组。

因为leveldb本身尚不具备“分布式”集群架构能力，所以，我们将有限的数据基于leveldb存储（受限于本地磁盘）。

## 限制

1、非关系型数据模型（NoSQL），不支持sql语句，也不支持索引；

2、一次只允许一个进程访问一个特定的数据库；

3、没有内置的C/S架构，但开发者可以使用LevelDB库自己封装一个server；

ps: TIDB 就是基于 k-v 来映射 SQL，所以技术的本质是相通的。

## 案例推演

1）leveldb具备“cache + 磁盘持久存储”特性，且不支持RPC调用，那么leveldb需要和application部署在同一宿主机器上。

类似于“嵌入式”K-V存储系统。

2）如果存储数据较少，3~5G，且“读写比”（R:W）较高，我们可以让leveldb作为本地cache来使用，比如Guava cache + leveldb，这种结合，可以实现类似于轻量级redis。即作为本地缓存使用。通常LevelDB存储的数据是内存大小的3~5倍（现代的操作系统配置），不建议用leveldb存储过大的数据，否则性能将下降很大。

3）如果数据较多，通常为“顺序读”或者“顺序写”，我们可以将leveldb作为Hadoop HDFS的“微缩版”，可以用来缓存高峰期的消息、日志存储的缓冲区。比如我们将用户操作日志暂且存储在leveldb中，而不是直接将日志发送给remote端的Hadoop（因为每次都直接调用RPC，将会对系统的吞吐能力带来极大的影响），而是将这些频繁写入的日志数据存储在本地的leveldb中，然后使用后台线程以“均衡”的速度发送出去。起到了“Flow Control”（流量控制）的作用。

其中ActiveMQ即采用leveldb作为底层的消息数据存储，性能和容错能力很强。

在很多情况下，leveldb可以作为本地log、IO缓冲文件的存储方案。

## 其他方案

LevelDB是google的实现，官方只提供了C++版的客户端，java客户端比如上述的iq80（还有fusesource 项目的leveldbjni）是来自社区的。

不过BigTable的设计思想和LevelDB的特性被社区延续了下去，比如相对比较完善和性能更加优秀的RocksDB，我们建议在实际的开发工作中采用它。

# 快速开始

## jar

```xml
<dependency>
    <groupId>org.iq80.leveldb</groupId>
    <artifactId>leveldb</artifactId>
    <version>0.10</version>
</dependency>
<dependency>
    <groupId>org.iq80.leveldb</groupId>
    <artifactId>leveldb-api</artifactId>
    <version>0.10</version>
</dependency>
```

还有 junit4

## 测试代码

```java
import org.iq80.leveldb.DB;
import org.iq80.leveldb.DBFactory;
import org.iq80.leveldb.Options;
import org.iq80.leveldb.WriteOptions;
import org.iq80.leveldb.impl.Iq80DBFactory;
import org.junit.After;
import org.junit.Before;
import org.junit.Test;

import java.io.File;
import java.io.IOException;

import static org.iq80.leveldb.impl.Iq80DBFactory.asString;
import static org.iq80.leveldb.impl.Iq80DBFactory.bytes;

public class LevelDbTest {

    private DB db;

    @Before
    public void before() throws IOException {
        String path = "/Users/houbinbin/cache/data/leveldb";
        DBFactory factory = new Iq80DBFactory();
        Options options = new Options();
        options.createIfMissing(true);
        db = factory.open(new File(path), options);
    }

    @After
    public void after() throws IOException {
        db.close();
    }

    @Test
    public void operateTest() {
        db.put(bytes("Tampa"), bytes("rocks"));
        String value = asString(db.get(bytes("Tampa")));
        System.out.println(value);

        // 这里的 sync 其实也就是在写入的时候，不只是写入到内存中，同时也会同步写入到文件中持久化存储。
        WriteOptions writeOptions = new WriteOptions().sync(true);
        db.delete(bytes("Tampa"), writeOptions);
    }
}
```

# 参考资料

[leveldb](https://github.com/dain/leveldb)

* any list
{:toc}