---
layout: post
title: redis cluster 集群时为什么不支持 pipeline?
date: 2025-10-20 20:40:12 +0800
categories: [Redis]
tags: [redis, in-action, sh, spring]
published: true
---


# 背景

记录一下 springboot 访问 redis 集群的例子。

发现 multiGet 比较慢，于是想通过 pipeline 的方式来优化，但是也发现不支持。

为什么？

我们首先要理解 pipeline 解决了什么问题，原理是什么。

# pipeline 介绍

## 一、什么是 Redis Pipeline？

### 定义

Redis Pipeline（流水线） 是一种在 同一条 TCP 连接 上，连续发送多条命令而不等待前一个命令返回的机制。

---

### 举个例子（非 Pipeline 模式）

假设你要依次执行 3 条命令：

```text
SET a 1
SET b 2
SET c 3
```

普通模式下的通信过程是：

```text
[客户端] → SET a 1
[服务端] ← OK
[客户端] → SET b 2
[服务端] ← OK
[客户端] → SET c 3
[服务端] ← OK
```

每条命令都要往返一次（RTT），假设一次往返是 1ms，总共就是 3ms+。

---

### Pipeline 模式下

客户端直接把三条命令一起发：

```text
[客户端] → SET a 1; SET b 2; SET c 3
[服务端] ← OK, OK, OK
```

整个过程只有一次往返（RTT），省去了多次等待时间，尤其在高延迟网络下效果非常显著。

## 二、Pipeline 的工作原理

### 核心机制

* 客户端在内存中维护一个「发送缓冲区」。
* 当你执行 pipeline 时，命令被序列化后全部放进这个缓冲区，一次性发送。
* 服务端顺序执行命令，依次写入响应缓冲区。
* 最后客户端一次性读取全部响应结果。

### 🧩 伪代码示例（Jedis 实现）

```java
try (Jedis jedis = new Jedis("localhost")) {
    Pipeline pipeline = jedis.pipelined();
    pipeline.set("a", "1");
    pipeline.set("b", "2");
    pipeline.incr("a");
    List<Object> results = pipeline.syncAndReturnAll();
}
```

内部执行流程是：

1. `pipeline.set()` 只是写入本地命令队列；
2. `pipeline.syncAndReturnAll()` 才把命令队列一次性发给 Redis；
3. Redis 顺序执行所有命令；
4. 客户端一次性读取所有响应并返回 `List<Object>`。

### 协议层面（Redis RESP 协议）

以 `SET a 1` 为例，协议数据如下：

```
*3\r\n$3\r\nSET\r\n$1\r\na\r\n$1\r\n1\r\n
```

Pipeline 其实就是把多条这样的命令 拼接起来连续发送，例如：

```
*3\r\n$3\r\nSET\r\n$1\r\na\r\n$1\r\n1\r\n
*3\r\n$3\r\nSET\r\n$1\r\nb\r\n$1\r\n2\r\n
```

Redis 会依次解析并执行。

## 三、Pipeline 能带来的性能提升

### 网络延迟是主要瓶颈

在 Redis 中，大部分命令本身执行速度极快（通常 <1μs），真正的耗时是网络往返。

| 模式       | 命令数  | 往返次数 | 总耗时（假设 RTT=1ms） |
| -------- | ---- | ---- | --------------- |
| 普通       | 1000 | 1000 | ≈ 1000ms        |
| Pipeline | 1000 | 1    | ≈ 1ms + 批量执行时间  |

所以在批量写入、初始化缓存、大量计数操作时，Pipeline 提升非常明显。

---

## 四、Pipeline 的限制与注意事项

### 1. 不保证事务

虽然命令是连续发的，但 Redis 不会回滚某条失败的命令。→ 如果需要原子性，请用 `MULTI/EXEC`（事务）。

### 2. 内存占用风险

Pipeline 会把请求与响应都暂存在内存中。

* 如果你一次发几万条命令，客户端和服务端都会占用大量内存；
* 极端情况下甚至会把连接挤爆。

一般建议：

* 单次 pipeline 不超过几千条命令；
* 分批提交（比如每 1000 条 `sync()` 一次）。

---

### 3. 结果顺序固定

Redis 返回结果的顺序严格和命令顺序一致。
但如果命令之间有依赖（比如先写后读），在 pipeline 内不能直接拿到中间结果。

---

### 4. Cluster 模式不支持跨节点 pipeline

如前面你问到的那样：

* Pipeline 必须同一条连接；
* Redis Cluster 的 key 分布在不同节点；
* 所以只有 所有 key 在同一 slot 的情况，才能 pipeline。

---

## 五、Spring Data Redis 的 Pipeline 实现（底层机制）

以 Lettuce 客户端为例（Spring 默认推荐）：

```java
List<Object> results = redisTemplate.executePipelined((RedisOperations ops) -> {
    ops.opsForValue().set("a", "1");
    ops.opsForValue().set("b", "2");
    ops.opsForValue().get("a");
    return null;
});
```

流程如下：

1. `executePipelined` 会：

   * 暂时切换 `RedisConnection` 到 pipeline 模式；
   * 将命令写入到 Lettuce 的命令缓冲队列；
   * 调用 `sync()` 一次性发送；
   * 收集所有响应并返回 `List<Object>`。

源码入口：

```
org.springframework.data.redis.core.RedisTemplate.executePipelined
org.springframework.data.redis.connection.lettuce.LettuceConnection.pipelined
```

---

## 六、Pipeline vs Multi vs Batch

| 特性         | Pipeline | Transaction (MULTI/EXEC) | Batch（客户端批处理） |
| ---------- | -------- | ------------------------ | ------------- |
| 是否原子       | 否        | ✅ 是                      | 否             |
| 是否减少 RTT   | ✅ 是      | ✅ 是（一次执行）                | ✅ 是           |
| 是否可并行执行    | 否        | 否                        | ✅（多线程）        |
| 是否跨 key 支持 | ✅        | ✅                        | ✅             |



# 为什么 cluster模式，springd-data-redis 不支持 pipeline

看到原理之后，我们也就理解了为什么 cluster 模式不支持 pipeline 的原因了。

## Redis 集群的机制：key slot 决定路由节点

Redis Cluster 把整个 key 空间分为 16384 个槽位（hash slots），每个槽位分配到不同节点上。

当你执行一个命令（比如 GET key），客户端需要：

根据 key 算出槽位：`slot = CRC16(key) % 16384`

查路由表，看这个槽在哪个节点；

向那个节点发命令。

所以在 Cluster 模式下，一个 key 对应一个固定节点。不同 key 可能落在不同节点。

## Pipeline 的原理与问题

pipeline 的本质是：

在同一个 TCP 连接上，连续发送多条命令，不等待上一个返回再发下一个，从而减少网络 RTT。

但是！pipeline 的前提是：**所有命令必须走同一条连接**。

而在 Redis Cluster 下：如果多个 key 不在同一节点，就需要多条连接。

那 pipeline 就必须拆成多个 pipeline，每个节点单独发。

## JedisClusterConnection

版本：spring-data-redis V1.8.23.RELEASE 中 JedisClusterConnection 不支持

```
throw new UnsupportedOperationException("Pipelining is not supported for cluster connections");
```

## 小结

所以还是不能想当然。要知其然，知其所以然。

* any list
{:toc}