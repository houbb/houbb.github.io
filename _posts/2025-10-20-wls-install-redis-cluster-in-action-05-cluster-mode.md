---
layout: post
title: redis cluster 集群模式介绍
date: 2025-10-20 20:40:12 +0800
categories: [Redis]
tags: [redis, in-action, sh, spring]
published: true
---


# 目标

理解一下 redis 集群模式



# chat

## 在 cluster 模式搭建前 3台 redis 服务是独立的，为什么创建 cluster 集群后，就可以按照 slot 分了？这个是 redis 底层支持的吗

非常棒的问题 💡——你抓到了 Redis Cluster 的**关键设计点**：

> 为什么原来只是三台独立的 Redis 实例，一旦执行 `redis-cli --cluster create ...` 命令，它们就“神奇地”组成一个分槽的集群了？
> 究竟是谁在背后支持这个「按 slot 分布数据」的逻辑？

---

## ✅ 简单结论先说：

是的，这完全是 **Redis 底层原生支持的功能**。
Redis 在 3.0 版本开始，就在 **服务器内核（server.c / cluster.c）** 中内置了集群逻辑，
通过内置的 **Cluster 模块** 实现了：

* 槽（slot）的分配与持久化；
* 节点间的握手与 gossip 通信；
* MOVED / ASK 重定向；
* 主从复制与 failover。

也就是说，集群行为并不是客户端模拟的，而是 Redis 自己“变成了一个分布式系统”。

---

## 🧩 一、集群的核心机制在 Redis 内部实现

Redis 的可执行程序（`redis-server`）在启动时会检测配置：

```bash
cluster-enabled yes
cluster-config-file nodes.conf
cluster-node-timeout 5000
```

如果配置里启用了 `cluster-enabled yes`，
Redis 会在启动时：

1. 启动 Cluster 模块；
2. 加载 / 生成 `nodes.conf`；
3. 打开一个专门用于 **节点间通信** 的端口（通常是 `6379+10000` → `16379`）；
4. 等待集群握手。

---

## 🔗 二、创建集群时，Redis 节点之间会做什么？

当你执行：

```bash
redis-cli --cluster create 192.168.0.1:7001 192.168.0.2:7002 192.168.0.3:7003 --cluster-replicas 0
```

命令行工具会自动完成以下流程 👇

### 1️⃣ 向每个节点发送 `CLUSTER MEET`

让节点们互相认识（握手）：

```text
CLUSTER MEET 192.168.0.2 7002
CLUSTER MEET 192.168.0.3 7003
```

每个节点收到命令后，会保存对方的节点 ID、IP、端口，并通过 gossip 通知其他节点。
至此，三个节点就知道彼此存在。

---

### 2️⃣ 槽位（Slot）分配

接着工具会告诉每个节点分配的槽位范围：

```text
Node1: 0 - 5460
Node2: 5461 - 10922
Node3: 10923 - 16383
```

命令如下：

```text
CLUSTER ADDSLOTS 0 1 2 ... 5460
```

这一步告诉节点：“你负责这些 slot”。
槽位信息会保存在内存中，并持久化到 `nodes.conf` 文件中。

---

### 3️⃣ 节点握手成功 → 集群形成

节点们通过 gossip 互相同步状态，直到：

* 所有 16384 个槽都分配完；
* 各节点都知道彼此的状态。

此时集群状态为：

```
cluster_state: ok
```

---

## ⚙️ 三、从此之后，Redis 的行为发生了根本变化

一旦启用 Cluster 模式并形成集群：

### ✅ 数据分布方式改变

Redis 不再使用“单实例 key 空间”，
而是使用哈希槽路由机制：

```text
slot = CRC16(key) % 16384
```

* 当客户端发送命令时，Redis 先算出 key 对应的 slot；
* 如果 slot 属于当前节点 → 正常执行；
* 如果 slot 属于其他节点 → 返回 `MOVED` 重定向指令。

示例：

```bash
> GET user:1001
(error) MOVED 12539 192.168.0.2:7002
```

客户端看到这个响应后，就会自动重发请求到正确的节点。
👉 这就是「数据分槽」的底层原理。

---

### ✅ 节点间自动复制 + 故障检测

每个节点都会：

* 定时与其他节点交换 `ping/pong` 包；
* 若发现节点长时间无响应 → 标记为下线；
* 若是主节点，会通知其从节点进行 failover；
* Cluster 模块会重新分配槽位。

这些逻辑全在 Redis 内核的 `cluster.c` 中实现，不依赖外部组件。

---

## 🧱 四、`nodes.conf` 是关键配置文件

每个集群节点启动后都会生成一个 `nodes.conf` 文件，记录：

```text
d2d7b4e1f6e942b0b1887b3e8a2e43c91a6229a4 192.168.0.1:7001@17001 master - 0 1728187542000 1 connected 0-5460
c3f46c4b71c847d6b1ef9a2a9a59a9cb5415e6e2 192.168.0.2:7002@17002 master - 0 1728187542500 2 connected 5461-10922
f2d6f6c3b2a941b8a1e9b3a7a3a3a5b8c4c2a9a5 192.168.0.3:7003@17003 master - 0 1728187542600 3 connected 10923-16383
```

这文件相当于 Redis 节点的「集群拓扑图」。

---

## 🔍 五、重点理解：slot 分配并不是客户端决定的

很多人以为“slot 分配”是客户端控制的，其实不是。

| 层次            | 功能                                 |
| ------------- | ---------------------------------- |
| Redis Server  | 内部存储 slot → node 映射表               |
| Redis Cluster | 在节点间同步 slot 状态                     |
| Client        | 根据 server 返回的 MOVED/ASK 结果更新本地路由缓存 |

也就是说：

* **集群的数据分布由 Redis 服务端决定；**
* **客户端只是遵循它的路由规则。**

---

## 🧠 六、从源码视角（简要）

在 Redis 源码中：

* `cluster.c` 管理集群逻辑；
* `clusterNode` 结构体记录每个节点；
* `clusterState` 保存 slot → node 映射；
* 当执行命令时，Redis 会在：

  ```c
  clusterRedirectClient(client *c, clusterNode *n, int hashslot)
  ```

  判断 key 是否属于当前节点。

如果不是，就直接返回 `MOVED`。

---

## 🔚 七、总结一句话：

> Redis 集群并不是靠外部工具“拼接”出来的，而是 Redis Server 自己支持分布式的。
> “slot 分配”是 Redis 内核层原生实现的机制，
> 一旦开启 cluster 模式，Redis 就具备节点自治、槽位映射、故障转移、重定向等完整的分布式功能。

## 小结

理解为什么这样，反而比直接知道答案更加重要。

* any list
{:toc}