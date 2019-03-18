---
layout: post
title:  RocksDB-01-Start
date:  2018-09-07 07:44:19 +0800
categories: [Cache]
tags: [cache, middleware, in-memory cache, sh]
published: true
---

# RocksDB

[RocksDB](https://github.com/facebook/rocksdb) 是一个可嵌入的，持久性的 key-value存储。

基于Google的LevelDB，但提高了扩展性可以运行在多核处理器上，可以有效使用快速存储，支持IO绑定、内存和一次写负荷

## 特性

高性能：RocksDB使用一套日志结构的数据库引擎，为了更好的性能，这套引擎是用C++编写的。 Key和value是任意大小的字节流。

为快速存储而优化：RocksDB为快速而又低延迟的存储设备（例如闪存或者高速硬盘）而特殊优化处理。 RocksDB将最大限度的发挥闪存和RAM的高度率读写性能。

可适配性：RocksDB适合于多种不同工作量类型。从像MyRocks这样的数据存储引擎，到应用数据缓存,甚至是一些嵌入式工作量，RocksDB都可以从容面对这些不同的数据工作量需求。

基础和高级的数据库操作，RocksDB提供了一些基础的操作，例如打开和关闭数据库。对于合并和压缩过滤等高级操作，也提供了读写支持。

## 适用场景

1.对写性能要求很高，同时有较大内存来缓存SST块以提供快速读的场景；        

2.SSD等对写放大比较敏感以及磁盘等对随机写比较敏感的场景；       

3.需要变长kv存储的场景；         

4.小规模元数据的存取；

## 不适合场景        

1.大value的场景，需要做kv分离；         

2.大规模数据的存取

# 原子性

rocksdb从3.0开始支持ColumnFamily的概念。

每个columnfamilyl的meltable与sstable都是分开的，所以每一个column family都可以单独配置，所有column family共用同一个WA文件，可以保证跨column family写入时的原子性。

# 项目架构

![rocksdb-struct](https://upload-images.jianshu.io/upload_images/4304640-891400b1777c999d.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/916/format/webp)

上图就是Rocksdb的基础架构。Rocksdb中引入了ColumnFamily(列族, CF)的概念，所谓列族也就是一系列kv组成的数据集。

所有的读写操作都需要先指定列族。写操作先写WAL，再写memtable，memtable达到一定阈值后切换为Immutable Memtable，只能读不能写。后台Flush线程负责按照时间顺序将Immu Memtable刷盘，生成level0层的有序文件(SST)。后台合并线程负责将上层的SST合并生成下层的SST。Manifest负责记录系统某个时刻SST文件的视图，Current文件记录当前最新的Manifest文件名。  

每个ColumnFamily有自己的Memtable， SST文件，所有ColumnFamily共享WAL、Current、Manifest文件。

# 架构分析

## 优势

整个系统的设计思路很好理解，这种设计的优势很明显，主要有以下几点：       

1.所有的刷盘操作都采用append方式，这种方式对磁盘和SSD是相当有诱惑力的；       

2.写操作写完WAL和Memtable就立即返回，写效率非常高。          

3.由于最终的数据是存储在离散的SST中，SST文件的大小可以根据kv的大小自由配置，            

因此很适合做变长存储。       

## 缺点

但是这种设计也带来了很多其他的问题：        

1.为了支持批量和事务以及上电恢复操作，WAL是多个CF共享的，导致了WAL的单线程写模式，不能充分发挥高速设备的性能优势（这是相对介质讲，相对B树等其他结构还是有优势）；        

2.读写操作都需要对Memtable进行互斥访问，在多线程并发写及读写混合的场景下容易形成瓶颈。       

3.由于Level0层的文件是按照时间顺序刷盘的，而不是根据key的范围做划分，所以导致各个文件之间范围有重叠，再加上文件自上向下的合并，读的时候有可能需要查找level0层的多个文件及其他层的文件，这也造成了很大的读放大。尤其是当纯随机写入后，
读几乎是要查询level0层的所有文件，导致了读操作的低效。       

4.针对第三点问题，Rocksdb中依据level0层文件的个数来做前台写流控及后台合并触发，以此来平衡读写的性能。这又导致了性能抖动及不能发挥高速介质性能的问题。        

5.合并流程难以控制，容易造成性能抖动及写放大。尤其是写放大问题，在笔者的使用过程中实际测试的写放大经常达到二十倍左右。这是不可接受的，当前我们也没有找到合适的解决办法，只是暂时采用大value分离存储的方式来将写放大尽量控制在小数据。

# 对比 leveldb

RocksDB 对LevelDB的优化

1) 增加了column family，这样有利于多个不相关的数据集存储在同一个db中，因为不同column family的数据是存储在不同的sst和memtable中，所以一定程度上起到了隔离的作用。

2) 采用了多线程同时进行compaction的方法，优化了compact的速度。

3) 增加了merge operator，优化了modify的效率。

4) 将flush和compaction分开不同的线程池，能有效的加快flush，防止stall。

5) 增加了对write ahead log(WAL)的特殊管理机制，这样就能方便管理WAL文件，因为WAL是binlog文件。


# Java 快速入门

## maven 引入

```xml
<dependency>
    <groupId>org.rocksdb</groupId>
    <artifactId>rocksdbjni</artifactId>
    <version>5.9.2</version>
</dependency>
```

## 入门代码

```java
import org.rocksdb.*;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Paths;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

class RocksJavaTest {

    private static final String dbPath = "/Users/weiwei/Documents/rocksdb/java/data/";

    static {
        RocksDB.loadLibrary();
    }

    RocksDB rocksDB;

    //  RocksDB.DEFAULT_COLUMN_FAMILY
    public void testDefaultColumnFamily() throws RocksDBException, IOException {
        Options options = new Options();
        options.setCreateIfMissing(true);

        // 文件不存在，则先创建文件
        if (!Files.isSymbolicLink(Paths.get(dbPath))) Files.createDirectories(Paths.get(dbPath));
        rocksDB = RocksDB.open(options, dbPath);

        /**
         * 简单key-value
         */
        byte[] key = "Hello".getBytes();
        byte[] value = "World".getBytes();
        rocksDB.put(key, value);

        byte[] getValue = rocksDB.get(key);
        System.out.println(new String(getValue));

        /**
         * 通过List做主键查询
         */
        rocksDB.put("SecondKey".getBytes(), "SecondValue".getBytes());

        List<byte[]> keys = new ArrayList<>();
        keys.add(key);
        keys.add("SecondKey".getBytes());

        Map<byte[], byte[]> valueMap = rocksDB.multiGet(keys);
        for (Map.Entry<byte[], byte[]> entry : valueMap.entrySet()) {
            System.out.println(new String(entry.getKey()) + ":" + new String(entry.getValue()));
        }

        /**
         *  打印全部[key - value]
         */
        RocksIterator iter = rocksDB.newIterator();
        for (iter.seekToFirst(); iter.isValid(); iter.next()) {
            System.out.println("iter key:" + new String(iter.key()) + ", iter value:" + new String(iter.value()));
        }

        /**
         *  删除一个key
         */
        rocksDB.delete(key);
        System.out.println("after remove key:" + new String(key));

        iter = rocksDB.newIterator();
        for (iter.seekToFirst(); iter.isValid(); iter.next()) {
            System.out.println("iter key:" + new String(iter.key()) + ", iter value:" + new String(iter.value()));
        }
    }

    public void testCertainColumnFamily() throws RocksDBException {
        String table = "CertainColumnFamilyTest";
        String key = "certainKey";
        String value = "certainValue";

        List<ColumnFamilyDescriptor> columnFamilyDescriptors = new ArrayList<>();
        Options options = new Options();
        options.setCreateIfMissing(true);

        List<byte[]> cfs = RocksDB.listColumnFamilies(options, dbPath);
        if (cfs.size() > 0) {
            for (byte[] cf : cfs) {
                columnFamilyDescriptors.add(new ColumnFamilyDescriptor(cf, new ColumnFamilyOptions()));
            }
        } else {
            columnFamilyDescriptors.add(new ColumnFamilyDescriptor(RocksDB.DEFAULT_COLUMN_FAMILY, new ColumnFamilyOptions()));
        }

        List<ColumnFamilyHandle> columnFamilyHandles = new ArrayList<>();
        DBOptions dbOptions = new DBOptions();
        dbOptions.setCreateIfMissing(true);

        rocksDB = RocksDB.open(dbOptions, dbPath, columnFamilyDescriptors, columnFamilyHandles);
        for (int i = 0; i < columnFamilyDescriptors.size(); i++) {
            if (new String(columnFamilyDescriptors.get(i).columnFamilyName()).equals(table)) {
                rocksDB.dropColumnFamily(columnFamilyHandles.get(i));
            }
        }

        ColumnFamilyHandle columnFamilyHandle = rocksDB.createColumnFamily(new ColumnFamilyDescriptor(table.getBytes(), new ColumnFamilyOptions()));
        rocksDB.put(columnFamilyHandle, key.getBytes(), value.getBytes());

        byte[] getValue = rocksDB.get(columnFamilyHandle, key.getBytes());
        System.out.println("get Value : " + new String(getValue));

        rocksDB.put(columnFamilyHandle, "SecondKey".getBytes(), "SecondValue".getBytes());

        List<byte[]> keys = new ArrayList<byte[]>();
        keys.add(key.getBytes());
        keys.add("SecondKey".getBytes());

        List<ColumnFamilyHandle> handleList = new ArrayList<>();
        handleList.add(columnFamilyHandle);
        handleList.add(columnFamilyHandle);

        Map<byte[], byte[]> multiGet = rocksDB.multiGet(handleList, keys);
        for (Map.Entry<byte[], byte[]> entry : multiGet.entrySet()) {
            System.out.println(new String(entry.getKey()) + "--" + new String(entry.getValue()));
        }

        rocksDB.delete(columnFamilyHandle, key.getBytes());

        RocksIterator iter = rocksDB.newIterator(columnFamilyHandle);
        for (iter.seekToFirst(); iter.isValid(); iter.next()) {
            System.out.println(new String(iter.key()) + ":" + new String(iter.value()));
        }
    }

    public static void main(String[] args) throws Exception {
        RocksJavaTest test = new RocksJavaTest();
        test.testDefaultColumnFamily();
//        test.testCertainColumnFamily();
    }

}
```


# 参考资料

[Rocksdb的优劣及应用场景分析](https://www.jianshu.com/p/73fa1d4e4273)

[RocksDB 介绍](https://blog.csdn.net/qq_26222859/article/details/79645243)

[Java RocksDB简单入门](http://orchome.com/938)

[RocksDB系列一：RocksDB基础和入门](https://www.jianshu.com/p/061927761027)

* any list
{:toc}