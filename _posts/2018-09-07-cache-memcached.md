---
layout: post
title:  Memcached
date:  2018-09-07 07:44:19 +0800
categories: [Cache]
tags: [cache, redis, sh]
published: true
excerpt: Memcached 详解。
---

# Memcached

## 官方定义

[Memcached](https://memcached.org/) 是免费和开源、高性能、分布式内存对象缓存系统，本质上是通用的，但用于通过减轻数据库负载来加速动态web应用程序。

Memcached是内存中的一个键值存储，用于存储来自数据库调用、API调用或页面呈现结果的任意数据块(字符串、对象)。

Memcached简单而强大。其简单的设计促进了快速部署，易于开发，并解决了大型数据缓存所面临的许多问题。它的API适用于大多数流行的语言。

# Docker

## 拉取

```
$   docker pull memcached
```

## 运行

```
$   docker run --name memcached -d --rm -p 11211:11211 memcached
```

- 参数说明

```
-d 后台运行
--name memcached 指定名称
--rm 容器终止运行后，自动删除容器文件
-p 11211:11211 指定端口号
```

## 查看状态

```
$ docker ps
CONTAINER ID        IMAGE               COMMAND                  CREATED             STATUS              PORTS                      NAMES
a73c5ba9a78b        memcached           "docker-entrypoint.s…"   4 seconds ago       Up 3 seconds        0.0.0.0:11211->11211/tcp   memcached
```

# Memcached 测试

## telnet 

另开一个命令行

```
$   telnet 127.0.0.1 11211
```

日志

```
Trying 127.0.0.1...
Connected to localhost.
Escape character is '^]'.
```

## 设置

```
$   set foo 0 0 3
$   bar
```

日志

```
STORED
```

## 获取

```
$   get foo
```

日志

```
VALUE foo 0 3
bar
END
```

## 退出

```
$   quit
```

日志

```
Connection closed by foreign host.
```

# java 代码访问

跑去 github 看了下，还是使用 [java-memcached-client](https://github.com/dustin/java-memcached-client) 比较靠谱。

## 引入

本地 jdk1.8 版本。

```xml
<dependency>
  <groupId>net.spy</groupId>
  <artifactId>spymemcached</artifactId>
  <version>2.12.3</version>
</dependency>
```

## 实战代码

### 链接测试

```java
@Test
public void connectTest() throws IOException {
    MemcachedClient mcc = new MemcachedClient(new InetSocketAddress("127.0.0.1", 11211));    
    System.out.println("Connection to server sucessful.");

    // 关闭连接
    mcc.shutdown();
}
```

日志：

```
Connection to server sucessful.
```

为了后续测试方便，将此方法连接放在每个测试方法之前执行，关闭连接放在每个方法之后执行。

```java
public class MemcachedTest {

    private MemcachedClient mcc;

    @Before
    public void initConnection() throws IOException {
        // 本地连接 Memcached 服务
        mcc = new MemcachedClient(new InetSocketAddress("127.0.0.1", 11211));
        System.out.println("Connection to server sucessful.");
    }

    @After
    public void shutdownConnection() {
        // 关闭连接
        mcc.shutdown();
    }
}
```

### set

- 方法说明

Memcached set 命令用于将 value(数据值) 存储在指定的 key(键) 中。

如果set的key已经存在，该命令可以更新该key所对应的原来的数据，也就是实现更新的作用。

- 实例

```java
@Test
public void setTest() throws ExecutionException, InterruptedException {
    // 存储数据
    Future fo = mcc.set("runoob", 900, "Free Education");

    // 查看存储状态
    System.out.println("set status:" + fo.get());

    // 输出值
    System.out.println("runoob value in cache - " + mcc.get("runoob"));
}
```

日志

```
Connection to server sucessful.
set status:true
runoob value in cache - Free Education
```

### add

- 说明

Memcached add 命令用于将 value(数据值) 存储在指定的 key(键) 中。

如果 add 的 key 已经存在，则不会更新数据(过期的 key 会更新)，之前的值将仍然保持相同，并且您将获得响应 NOT_STORED。

- 实例

```java
@Test
public void addTest() throws ExecutionException, InterruptedException {
    // 添加数据
    Future fo = mcc.set("runoob", 900, "Free Education");
    // 打印状态
    System.out.println("set status:" + fo.get());
    // 输出
    System.out.println("runoob value in cache - " + mcc.get("runoob"));

    // 添加
    fo = mcc.add("runoob", 900, "memcached");
    // 打印状态
    System.out.println("add status:" + fo.get());

    // 添加新key
    fo = mcc.add("codingground", 900, "All Free Compilers");
    // 打印状态
    System.out.println("add status:" + fo.get());
    // 输出
    System.out.println("codingground value in cache - " + mcc.get("codingground"));
}
```

日志

```
Connection to server sucessful.
set status:true
runoob value in cache - Free Education
add status:false
add status:false
codingground value in cache - All Free Compilers
```

### replace

- 说明

Memcached replace 命令用于替换已存在的 key(键) 的 value(数据值)。

如果 key 不存在，则替换失败，并且您将获得响应 NOT_STORED。

- 实例

```java
@Test
public void replaceTest() throws ExecutionException, InterruptedException {
    // 添加第一个 key=》value 对
    Future fo = mcc.set("runoob", 900, "Free Education");
    // 输出执行 add 方法后的状态
    System.out.println("add status:" + fo.get());
    // 获取键对应的值
    System.out.println("runoob value in cache - " + mcc.get("runoob"));

    // 添加新的 key
    fo = mcc.replace("runoob", 900, "Largest Tutorials' Library");
    // 输出执行 set 方法后的状态
    System.out.println("replace status:" + fo.get());
    // 获取键对应的值
    System.out.println("runoob value in cache - " + mcc.get("runoob"));
}
```

日志

```
Connection to server sucessful.
add status:true
runoob value in cache - Free Education
replace status:true
runoob value in cache - Largest Tutorials' Library
```

### append

- 说明

Memcached append 命令用于向已存在 key(键) 的 value(数据值) 后面追加数据 。

- 实例

```java
@Test
public void appendTest() throws ExecutionException, InterruptedException {
    final String key = "runoob";
    // 添加数据
    Future fo = mcc.set(key, 900, "Free Education");

    // 输出执行 set 方法后的状态
    System.out.println("set status:" + fo.get());

    // 获取键对应的值
    System.out.println("runoob value in cache - " + mcc.get(key));

    // 对存在的key进行数据添加操作
    fo = mcc.append("runoob", " for All");

    // 输出执行 set 方法后的状态
    System.out.println("append status:" + fo.get());

    // 获取键对应的值
    System.out.println("runoob value in cache - " + mcc.get(key));
}
```

日志

```
Connection to server sucessful.
set status:true
runoob value in cache - Free Education
append status:true
runoob value in cache - Free Education for All
```

### prepend

- 说明

Memcached prepend 命令用于向已存在 key(键) 的 value(数据值) 前面追加数据 。

- 实例

```java
@Test
public void prependTest() throws ExecutionException, InterruptedException {
    final String key = "runoob";
    // 添加数据
    Future fo = mcc.set(key, 900, "Free Education");
    // 输出执行 set 方法后的状态
    System.out.println("set status:" + fo.get());
    // 获取键对应的值
    System.out.println("runoob value in cache - " + mcc.get(key));
    // 对存在的key进行数据添加操作
    fo = mcc.prepend("runoob", "For All ");
    // 输出执行 set 方法后的状态
    System.out.println("append status:" + fo.get());
    // 获取键对应的值
    System.out.println("runoob value in cache - " + mcc.get(key));
}
```

日志

```
Connection to server sucessful.
set status:true
runoob value in cache - Free Education
append status:true
runoob value in cache - For All Free Education
```

### CAS

- 说明

Memcached CAS（Check-And-Set 或 Compare-And-Swap） 命令用于执行一个"检查并设置"的操作

它仅在当前客户端最后一次取值后，该 key 对应的值没有被其他客户端修改的情况下，才能够将值写入。

检查是通过 cas_token 参数进行的，这个参数是Memcach指定给已经存在的元素的一个唯一的64位值。

- 实例

```java
@Test
public void casTest() throws ExecutionException, InterruptedException {
    // 添加数据
    Future fo = mcc.set("runoob", 900, "Free Education");
    // 输出执行 set 方法后的状态
    System.out.println("set status:" + fo.get());
    // 使用 get 方法获取数据
    System.out.println("runoob value in cache - " + mcc.get("runoob"));

    // 通过 gets 方法获取 CAS token（令牌）
    CASValue casValue = mcc.gets("runoob");
    // 输出 CAS token（令牌） 值
    System.out.println("CAS token - " + casValue);
    // 尝试使用cas方法来更新数据
    CASResponse casresp = mcc.cas("runoob", casValue.getCas(), 900, "Largest Tutorials-Library");
    // 输出 CAS 响应信息
    System.out.println("CAS Response - " + casresp);
    // 输出值
    System.out.println("runoob value in cache - " + mcc.get("runoob"));
}
```

日志

```
Connection to server sucessful.
set status:true
runoob value in cache - Free Education
CAS token - {CasValue 18/Free Education}
CAS Response - OK
runoob value in cache - Largest Tutorials-Library
```

## 查询相关

### get

- 说明

Memcached get 命令获取存储在 key(键) 中的 value(数据值) ，如果 key 不存在，则返回空。

- 实例

```java
@Test
public void getTest() throws ExecutionException, InterruptedException {
    // 添加数据
    Future fo = mcc.set("runoob", 900, "Free Education");
    // 输出执行 set 方法后的状态
    System.out.println("set status:" + fo.get());
    // 使用 get 方法获取数据
    System.out.println("runoob value in cache - " + mcc.get("runoob"));
}
```

日志

```
Connection to server sucessful.
set status:true
runoob value in cache - Free Education
```

### gets

- 说明

Memcached gets 命令获取带有 CAS 令牌存 的 value(数据值) ，如果 key 不存在，则返回空。

- 实例

```java
@Test
public void getsTest() throws ExecutionException, InterruptedException {
    // 添加数据
    Future fo = mcc.set("runoob", 900, "Free Education");
    // 输出执行 set 方法后的状态
    System.out.println("set status:" + fo.get());
    // 从缓存中获取键为 runoob 的值
    System.out.println("runoob value in cache - " + mcc.get("runoob"));

    // 通过 gets 方法获取 CAS token（令牌）
    CASValue casValue = mcc.gets("runoob");
    // 输出 CAS token（令牌） 值
    System.out.println("CAS value in cache - " + casValue);
}
```

日志

```
Connection to server sucessful.
set status:true
runoob value in cache - Free Education
CAS value in cache - {CasValue 21/Free Education}
```

### delete

- 说明

Memcached delete 命令用于删除已存在的 key(键)。

返回值：

DELETED：删除成功。

ERROR：语法错误或删除失败。

NOT_FOUND：key 不存在。

- 实例

```java
@Test
public void deleteTest() throws ExecutionException, InterruptedException {
    final String key = "runoob";
    // 添加数据
    Future fo = mcc.set(key, 900, "World's largest online tutorials library");
    // 输出执行 set 方法后的状态
    System.out.println("set status:" + fo.get());
    // 获取键对应的值
    System.out.println("runoob value in cache - " + mcc.get(key));

    // 对存在的key进行数据添加操作
    fo = mcc.delete(key);
    // 输出执行 delete 方法后的状态
    System.out.println("delete status:" + fo.get());
    // 获取键对应的值
    System.out.println("runoob value in cache - " + mcc.get(key));
}
```

日志信息

```
Connection to server sucessful.
set status:true
runoob value in cache - World's largest online tutorials library
delete status:true
runoob value in cache - null
```

### inc/decr

- 说明 

Memcached incr 与 decr 命令用于对已存在的 key(键) 的数字值进行自增或自减操作。

incr 与 decr 命令操作的数据必须是十进制的32位无符号整数。

如果 key 不存在返回 `NOT_FOUND`，如果键的值不为数字，则返回 `CLIENT_ERROR`，其他错误返回 `ERROR`。

- 实例

```java
@Test
public void decrIncrTest() throws ExecutionException, InterruptedException {
    final String key  = "number";
    // 添加数字值
    Future fo = mcc.set(key, 900, "1000");
    // 输出执行 set 方法后的状态
    System.out.println("set status:" + fo.get());
    // 获取键对应的值
    System.out.println("value in cache - " + mcc.get(key));

    // 自增并输出
    System.out.println("value in cache after increment - " + mcc.incr(key, 111));
    // 自减并输出
    System.out.println("value in cache after decrement - " + mcc.decr(key, 112));
}
```

日志信息

```
Connection to server sucessful.
set status:true
value in cache - 1000
value in cache after increment - 1111
value in cache after decrement - 999
```

## 状态相关

### stats

Memcached `stats` 命令用于返回统计信息例如 PID(进程号)、版本号、连接数等。

### stats items

Memcached `stats items` 命令用于显示各个 slab 中 item 的数目和存储时长(最后一次访问距离现在的秒数)。

### stats slabs

Memcached `stats slabs` 命令用于显示各个slab的信息，包括chunk的大小、数目、使用情况等。

### stats sizes

Memcached `stats sizes` 命令用于显示所有item的大小和个数。

该信息返回两列，第一列是 item 的大小，第二列是 item 的个数。

### flush_all

Memcached `flush_all` 命令用于清理缓存中的所有 key=>value(键=>值) 对。

该命令提供了一个可选参数 time，用于在制定的时间后执行清理缓存操作。

# 与 Redis 对比

## 数据结构

- Memcached

只支持最简单的 key-value


- Redis

支持较为复杂的数据结构。

Memcached单个key-value大小有限，一个value最大只支持1MB，而Redis最大支持512MB

## 多线程 vs 多线程

没有必要过多的关心性能，因为二者的性能都已经足够高了。

由于Redis只使用单核，而Memcached可以使用多核，所以在比较上，平均每一个核上Redis在存储小数据时比Memcached性能更高。

而在100k以上的数据中，Memcached性能要高于Redis，虽然Redis最近也在存储大数据的性能上进行优化，但是比起Memcached，还是稍有逊色。说了这么多，结论是，无论你使用哪一个，每秒处理请求的次数都不会成为瓶颈。（比如瓶颈可能会在网卡）

## 持久化

Memcached 不支持持久化，Redis 支持持久化。

### 不要把 redis 当数据库

千万不要把redis当作数据库用：

（1）redis的定期快照不能保证数据不丢失

（2）redis的AOF会降低效率，并且不能支持太大的数据量

不要期望redis做固化存储会比mysql做得好，不同的工具做各自擅长的事情，把redis当作数据库用，这样的设计八成是错误的。

### 持久化的利弊

- 优点

redis 挂了再重启，内存里能够快速恢复热数据，不会瞬时将压力压到数据库上，没有一个 cache 预热的过程。

- 缺点

在redis挂了的过程中，如果数据库中有数据的修改，可能导致redis重启后，数据库与redis的数据不一致。

## 高可用

redis 有比较成熟的高可用集成框架。

memcached 应该也是天然支持高可用的。官方定义就是这个噱头。(和 58 不同，58 认为还需要二次开发)

技术人，清楚用什么，清楚怎么用还不够，更重要的是明白为什么。

# 参考资料

- Memcached

https://memcached.org/

https://wiki.linuxchina.net/index.php?title=Docker_%E5%AE%89%E8%A3%85_Memcached

http://www.runoob.com/memcached/memcached-tutorial.html

- docker

https://hub.docker.com/r/_/memcached/

- vs redis

[选redis还是memcache，源码怎么说？](https://mp.weixin.qq.com/s/hOdwK2-7_S7_fi-KVu9_OQ)

[“选redis还是memcache”，面试官究竟想考察啥？](https://mp.weixin.qq.com/s/MsS3HwuA2fPqPNs0CHWS-Q)

* any list
{:toc}