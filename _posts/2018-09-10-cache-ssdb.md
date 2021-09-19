---
layout: post
title:  SSDB - 一个快速的 NoSQL 数据库，Redis 的替代品
date:  2018-09-10 10:28:57 +0800
categories: [Cache]
tags: [cache, middleware, docker, sh]
published: true
---

# SSDB

[SSDB](http://ssdb.io/zh_cn/) 是一个高性能的支持丰富数据结构的 NoSQL 数据库, 用于替代 Redis。

## 特性

- 替代 Redis 数据库, Redis 的 100 倍容量

- LevelDB 网络支持, 使用 C/C++ 开发

- Redis API 兼容, 支持 Redis 客户端

- 适合存储集合数据, 如 list, hash, zset...

- 客户端 API 支持的语言包括: C++, PHP, Python, Java, Go

- 持久化的队列服务

- 主从复制, 负载均衡

## 安装

```
wget --no-check-certificate https://github.com/ideawu/ssdb/archive/master.zip
unzip master
cd ssdb-master
make
# optional, install ssdb in /usr/local/ssdb
sudo make install
```

## 启动

```
# start master
./ssdb-server ssdb.conf

# or start as daemon
./ssdb-server -d ssdb.conf
```

## 性能

![perf](https://camo.githubusercontent.com/2f61d9b6acbfdb713c88791b474a99232bba1355/687474703a2f2f737364622e696f2f737364622d76732d72656469732e706e673f676974687562)

# SSDB vs Redis

[SSDB 和 Redis 的优缺点各有哪些？](https://www.zhihu.com/question/40733101)

## 优点

- 省钱

[swapdb](https://github.com/JingchengLi/swapdb) 也可以省钱。

[ledisdb](https://github.com/siddontang/ledisdb) 优点是对内存的需求小，是个较便宜的方案。

- 个人项目

ssdb貌似就是一个个人项目，但代码质量还是不错的，整个设计思想比较简洁。

- redis 兼容

和 redis 的 api 保持一致，不用动代码，就可以完成迁移。

## ssdb 缺点

- SSDB 还不是成熟的开源项目，社区不够活跃，贡献者不多；

- 存储原理

看了看ssdb存储引擎的原理，发现ssdb还是比较适合读取少写入多的场景的，底层用的levedb存储引擎，写入时候第一步记录到日志中，就可以保证数据不丢失，也可以算作写入成功，存储方式使用LSM树，以memtab为存储单位，内部使用skiplist的数据结构，在memtab达到条件进行落盘，落盘以数据写入新鲜度划分为level0，level1......越是新写入的数据查询越快，因为查询是先查询内存中的memtab，找不到查询level0，level1......顺序查询下去，在短时间内数据量很大情况下，很快会达到落盘要求，那么查询很可能就会去读取磁盘中数据，比较慢。

- 主从复制

ssdb的主从复制效率很低。binlog和数据是分开存储的，日志冗余较多，由于ssdb本身要在多线程条件下才能发挥出更好的性能，为了使多个线程在写入binlog时能保证操作顺序和原子性，ssdb的binlog数据结构上用了一把全局锁，可想而知，这里的锁竞争会很影响性能。

- 集群

ssdb默认也没有集群管理的支持。

# 快速开始

## Docker SSDB

- 安装镜像

```
docker pull cleardevice/ssdb
```

- 运行 image

```
$   sudo docker run -d --name="ssdb" -p 8888:8888 -v ${pwd}:/var/lib/ssdb cleardevice/ssdb
```

- 查看状态

```
$ docker ps
CONTAINER ID        IMAGE               COMMAND                  CREATED             STATUS              PORTS                    NAMES
38275e79a7c9        cleardevice/ssdb    "/bin/sh -c '/ssdb/s…"   4 seconds ago       Up 3 seconds        0.0.0.0:8888->8888/tcp   ssdb
```

## java client

- redis 客户端

SSDB 支持 Redis 网络协议, 所以你可以用 Redis 的客户端来连接 SSDB 服务器. 但是, 使用 SSDB 客户端是最高效的方式. 

所有的 SSDB 客户端 API 都是支持二进制数据的, 二进制数据即是字符串, 字符串就是二进制数据.

[java 客户端](http://ssdb.io/docs/zh_cn/clients.html#java)

- 个人选择

看了下官方的没有说明文档，暂时使用 [jedis](https://houbb.github.io/2018/09/06/cache-redis-jedis) 测试一下吧。

## 代码

- jar 引入

```xml
<dependencies>
    <dependency>
        <groupId>redis.clients</groupId>
        <artifactId>jedis</artifactId>
        <version>2.8.1</version>
    </dependency>
</dependencies>
```

- 测试代码

```java
public class SSDBTest {

    private Jedis jedis;

    @BeforeEach
    public void setUp() {
        jedis = new Jedis("127.0.0.1", 8888);
    }

    /**
     * 初始化测试
     */
    @Test
    public void initTest() {
        jedis.set("key", "test");
        System.out.println(jedis.get("key"));
    }

}
```

日志信息

```
test
```

# 参考资料

- 参考资料

[SSDB 和 Redis 的优缺点各有哪些？](https://www.zhihu.com/question/40733101)

- docker 安装问题

https://github.com/ideawu/ssdb/issues/985

* any list
{:toc}