---
layout: post
title: MapDB
date:  2018-09-07 07:44:19 +0800
categories: [Cache]
tags: [cache, middleware, in-memory cache, sh]
published: true
excerpt: MapDB 入门学习
---

# MapDB

[MapDB](http://www.mapdb.org) provides concurrent Maps, Sets and Queues backed by disk storage or off-heap-memory. 

It is a fast and easy to use embedded Java database engine.

## 功能

- 直接替换映射、列表、队列和其他集合。

- 不受垃圾收集器影响的堆外收集

- 带有过期和磁盘溢出的多级缓存。

- 用事务、MVCC、增量备份等替换RDBMs…

- 本地数据处理和过滤。MapDB拥有在合理时间内处理大量数据的实用工具。


# 快速开始

## jar

```xml
<dependency>
    <groupId>org.mapdb</groupId>
    <artifactId>mapdb</artifactId>
    <version>3.0.6</version>
</dependency>
```

## 简单例子

```java
import org.junit.Test;
import org.mapdb.DB;
import org.mapdb.DBMaker;

import java.util.concurrent.ConcurrentMap;

public class MapDBTest {

    @Test
    public void helloTest() {
        DB db = DBMaker.memoryDB().make();
        ConcurrentMap map = db.hashMap("map").make();
        map.put("something", "here");
    }

}
```

# 参考资料

https://github.com/jankotek/mapdb

# 参考资料

* any list
{:toc}