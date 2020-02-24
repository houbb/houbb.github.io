---
layout: post
title: Redis Learn-37-Redis 数据对比实现方案
date: 2018-12-12 11:35:23 +0800
categories: [Redis]
tags: [redis, cache, sh]
published: true
---

# 业务背景

阿里云的 DTS 提供了 redis 的数据传输，但是没有提供对应的数据对比功能。

[Redis 内存占用大小查看](https://houbb.github.io/2018/12/12/redis-learn-36-memory) 这个介绍了如何查看 keys 的数量。

## 对比方案1

直接查看总数，然后随机抽样对比。

这个缺点很明显，无法保证数据的准确性。

## 对比方案2

1. 通过 scan 获取所有的 keys。（注意，不要通过 keys 这个命令，会被直接开除的 ==！）

2. 根据 keys 获取对应的数据值信息。

3. 将对应的信息进行对比，使用 compare2 等工具，或者代码对比都可以。

本文主要介绍下 keys 的获取。

# 准备工作

## jedis 引入

为了演示方便，此处使用 jedis，不引入其他的包。

```xml
<dependency>
    <groupId>redis.clients</groupId>
    <artifactId>jedis</artifactId>
    <version>3.2.0</version>
</dependency>
```

## 连接实现

### redis 单点连接代码

```java
// 单点
Jedis jedis = new Jedis("ip", 6379);
jedis.auth("password");

// 连接测试
jedis.set("jedis_connect_test_20200220", "ok");
String value = jedis.get("jedis_connect_test_20200220");
System.out.println(value);
//系统关闭时关闭 jedisCluster
jedis.close();
```

单点连接比较简单

### redis 集群连接代码

```java
// 指定配置信息
JedisPoolConfig config = new JedisPoolConfig();
config.setMaxTotal(60000);//设置最大连接数
config.setMaxIdle(1000); //设置最大空闲数
config.setMaxWaitMillis(3000);//设置超时时间
config.setTestOnBorrow(true);

//创建一个 JedisCluster 对象
Set<HostAndPort> nodes = new HashSet<>();
nodes.add(new HostAndPort("ip1", 6379));
nodes.add(new HostAndPort("ip2", 6379));
nodes.add(new HostAndPort("ip3", 6379));

final String password = "password";
JedisCluster jedisCluster = new JedisCluster(nodes, 3000, 3000, 10, password, config);

jedisCluster.set("jedis_connect_test", "ok");
String value = jedisCluster.get("jedis_connect_test");
System.out.println(value);
//系统关闭时关闭 jedisCluster
jedisCluster.close();
```

## scan 代码实现

### 单点

```java
ScanParams scanParams = new ScanParams();
scanParams.match("*");  // 匹配所有
scanParams.count(100);

// 游标初始值为0
String cursor = ScanParams.SCAN_POINTER_START;
Set<String> keys = Guavas.newHashSet();

do{
    ScanResult<String> scanResult = jedis.scan(cursor, scanParams);
    List<String> partKeys = scanResult.getResult();
    keys.addAll(partKeys);
    System.out.println("partKeys: " + partKeys.size());
    cursor = scanResult.getCursor();
}while(!cursor.equals(ScanParams.SCAN_POINTER_START));
```

我们可以对 keys 信息进行相关处理，比如获取对应的值。

### 集群

```java
// 游标初始值为0
String cursor = ScanParams.SCAN_POINTER_START;
Set<String> keys = Guavas.newHashSet();

for(JedisPool jedisPool : jedisCluster.getClusterNodes().values()) {
    ScanParams scanParams = new ScanParams();
    scanParams.match("*");  // 匹配所有
    scanParams.count(100);
    do {
        try (Jedis jedis = jedisPool.getResource()) {
            ScanResult<String> scanResult = jedis.scan(cursor, scanParams);
            List<String> partKeys = scanResult.getResult();
            System.out.println("partKeys: " + partKeys.size());
            keys.addAll(partKeys);
            cursor = scanResult.getCursor();
            System.out.println("cursor: " + cursor);
            System.out.println("total: " + cursor);
        }
    } while (!cursor.equals(ScanParams.SCAN_POINTER_START));
}
```

# 参考资料

[查看redis占用内存大小的方法](https://www.jianshu.com/p/9358abbc8258)

[集群的 scan](https://www.xttblog.com/?p=3635)

[stackoverflow jedis-scan-doesnt-find-any-key](https://stackoverflow.com/questions/50017507/jedis-scan-doesnt-find-any-key)

[redis 用scan 代替keys](https://blog.csdn.net/w05980598/article/details/80264568?utm_source=distribute.pc_relevant.none-task)

* any list
{:toc}