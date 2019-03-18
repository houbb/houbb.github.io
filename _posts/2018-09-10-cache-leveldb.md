---
layout: post
title:  LevelDB
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

# 为什么这么快

## 数据存储

leveldb 的数据存储在内存以及磁盘上，其中：

memtable：存储在内存中的数据，使用skiplist实现。

immutable memtable：与memtable一样，只不过这个memtable不能再进行修改，会将其中的数据落盘到level 0的sstable中。

多层sstable：leveldb使用多个层次来存储sstable文件，这些文件分布在磁盘上，这些文件都是根据键值有序排列的，其中0级的sstable的键值可能会重叠，而level 1及以上的sstable文件不会重叠。

在上面这个存储层次中，越靠上的数据越新，即同一个键值如果同时存在于memtable和immutable memtable中，则以memtable中的为准。

# Log文件

写入数据的时候，最开始会写入到log文件中，由于是顺序写入文件，所以写入速度很快，可以马上返回。

## 结构

来看Log文件的结构：

一个Log文件由多个Block组成，每个Block大小为32KB。

一个Block内部又有多个Record组成，Record分为四种类型：

Full：一个Record占满了整个Block存储空间。

First：一个Block的第一个Record。

Last：一个Block的最后一个Record。

Middle：其余的都是Middle类型的Record。

Record的结构如下：

32位长度的CRC Checksum：存储这个Record的数据校验值，用于检测Record合法性。

16位长度的Length：存储数据部分长度。

8位长度的Type：存储Record类型，就是上面说的四种类型。

Header部分

数据部分

![cache-leveldb](https://mmbiz.qpic.cn/mmbiz_png/8XkvNnTiapOM5w0H5iac26phnHLmzKDppVCWqhjjicOiah5pUWb4vNPmOHibolDNmgctrsobibn5CmecyQ30Dr1tR01A/640?wx_fmt=png&tp=webp&wxfrom=5&wx_lazy=1&wx_co=1)


## memtable

memtable 用于存储在内存中还未落盘到sstable中的数据，这部分使用跳表（skiplist）做为底层的数据结构，这里先简单描述一下跳表的工作原理。

如果数据存放在一个普通的有序链表中，那么查找数据的时间复杂度就是O(n)。

跳表的设计思想在于：链表中的每个元素，都有多个层次，查找某一个元素时，遍历该链表的时候，根据层次来跳过（skip）中间某些明显不满足需求的元素，以达到加快查找速度的目的，如下图所示：

> [跳跃表](https://houbb.github.io/2019/02/13/datastruct-skiplist)

## sstable 文件

大体结构

首先来看sstable文件的整体结构，如下图：

![大体结构](https://mmbiz.qpic.cn/mmbiz_png/8XkvNnTiapOM5w0H5iac26phnHLmzKDppVG8uFx1DaM8U1seBribu4PW3sCEmClZsyId7d2ribGZB0DobDcmXnNZ0g/640?wx_fmt=png&tp=webp&wxfrom=5&wx_lazy=1&wx_co=1)

sstable 文件中分为以下几个组成部分：

data block：存储数据的block，由于一个block大小固定，因此每个sstable文件中有多个data block。

filter block以及metaindex block：这两个block不一定存在于sstable，取决于Options中的filter_policy参数值，后面就不对这两部分进行讲解。

index block：存储的是索引数据，即可以根据index block中的数据快速定位到数据处于哪个data block的哪个位置。

footer：脚注数据，每个footer数据信息大小固定，存储一个sstable文件的元信息（meta data）。

可以看到，上面这几部分数据，从文件的组织来看自上而下，先有了数据再有索引数据，最后才是文件自身的元信息。

原因在于：索引数据是针对数据的索引信息，在数据没有写完毕之前，索引信息还会发生改变，所以索引数据要等数据写完；而元信息就是针对索引数据的索引，同样要依赖于索引信息写完毕才可以。



# 参考资料

[leveldb](https://github.com/dain/leveldb)

[经典开源代码分析——Leveldb高效存储实现](https://mp.weixin.qq.com/s/DfCO3RCjkDmYkkMlS3msDg)

* any list
{:toc}