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

# 参考资料

[leveldb](https://github.com/dain/leveldb)

* any list
{:toc}