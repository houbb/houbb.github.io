---
layout: post
title: memgraph-06-使用 Docker 设置复制集群（Set up replication cluster with Docker）
date: 2026-01-16 21:01:55 +0800
categories: [Database]
tags: [ai, memgraph, sh]
published: true
---


# **使用 Docker 设置复制集群（Set up replication cluster with Docker）**

本指南适用于希望在多个 Memgraph 实例之间设置数据复制的 **Memgraph Community 用户**。

如果你拥有 **Memgraph Enterprise 授权**，我们建议使用 **高可用性（high availability features）** 来替代，它提供自动故障切换、负载均衡和更全面的集群管理能力。

链接：[https://memgraph.com/docs/clustering/replication/setup-replication-cluster-docker](https://memgraph.com/docs/clustering/replication/setup-replication-cluster-docker)

本示例展示如何使用 Docker 启动一个 MAIN 和两个 REPLICA 实例，以及如何使用不同的复制模式注册每个副本。

---

## **集群拓扑结构（Cluster topology）**

我们将在本地运行一个简单的三节点集群：

* **MAIN** — 包含将要复制到 REPLICA 实例的数据
* **REPLICA 1** — 使用 SYNC 模式进行复制
* **REPLICA 2** — 使用 ASYNC 模式进行复制

💡 本示例在本地服务器上运行，如果服务器宕机则存在单点故障。在生产环境中，建议将每个 Memgraph 实例部署在独立的服务器上，以提高鲁棒性。

---

## **运行多个实例（Run multiple instances）**

由于所有容器都运行在同一个主机上，因此每个实例必须暴露不同的 Bolt 端口。

**MAIN 实例：**

```bash
docker run -p 7687:7687 memgraph/memgraph-mage --also-log-to-stderr=true
```

**REPLICA 实例 1：**

```bash
docker run -p 7688:7687 memgraph/memgraph-mage --also-log-to-stderr=true
```

**REPLICA 实例 2：**

```bash
docker run -p 7689:7687 memgraph/memgraph-mage --also-log-to-stderr=true
```

Memgraph 会自动设置所有运行复制所需的标志，因此启动时无需额外配置。

你可以使用 Memgraph Lab、mgconsole 或数据库驱动连接到每个实例，只需更改端口：

* MAIN 实例 — `localhost:7687`
* REPLICA 实例 1 — `localhost:7688`
* REPLICA 实例 2 — `localhost:7689`

如果需要定义卷（volumes），则每个卷名称必须不同。

---

## **将实例降级为 REPLICA 角色（Demote an instance to a REPLICA role）**

在两个 REPLICA 实例中运行以下查询，将它们降级为 REPLICA 角色：

```cypher
SET REPLICATION ROLE TO REPLICA WITH PORT 10000;
```

此命令执行以下两件事：

* 该实例现在被识别为 REPLICA，并且不再允许执行写查询
* 在端口 `10000` 上启动一个复制服务器，用于接收发送至该 REPLICA 的数据

端口 `10000` 是某些复制命令的默认端口，因此最佳做法是使用此端口进行复制服务器设置。

当然你也可以使用 **1000 到 10000 之间的任意未分配端口**。

---

## **在 MAIN 实例上注册 REPLICA（Register REPLICAs on the MAIN）**

要注册 REPLICA 实例，你需要获取每个容器的 IP 地址。可以使用以下命令读取容器的 IP 地址：

```bash
docker inspect -f '{{range .NetworkSettings.Networks}}{{.IPAddress}}{{end}}' <container_name_or_id>
```

这些 IP 地址可能如下所示：

* MAIN 实例 — `172.17.0.2`
* REPLICA 实例 1 — `172.17.0.3`
* REPLICA 实例 2 — `172.17.0.4`

如果不是以上地址，请在下面的查询中将 IP 地址替换为你的实际集群地址。

然后，在 MAIN 实例中运行以下查询以注册 REPLICA 实例：

1. 注册 REPLICA 实例 1（位于 `172.17.0.3`）

```cypher
REGISTER REPLICA REP1 SYNC TO "172.17.0.3";
```

该命令含义如下：

* 将 REPLICA 实例 1 命名为 `REP1`
* 使用 **SYNC** 复制模式注册该副本
* 副本位于 IP 地址 `172.17.0.3`
* REP1 的复制服务器端口为默认值 `10000`

一旦 MAIN 提交事务，它将把更改发送给所有处于 SYNC 模式的 REPLICA，并等待收到所有副本确认已应用更改或超时。

如果你在降级 REPLICA 时未使用默认端口 `10000`（例如用了 `5000`），则需要按如下形式指定端口：
`"172.17.0.3:5000"`

2. 注册 REPLICA 实例 2（位于 `172.17.0.4`）

```cypher
REGISTER REPLICA REP2 ASYNC TO "172.17.0.4";
```

* 将 REPLICA 实例 2 命名为 `REP2`
* 复制模式为 **ASYNC**
* 副本位于 IP 地址 `172.17.0.4`，端口 `10000`

当 REPLICA 以 ASYNC 模式运行时，MAIN 提交事务不会等待 REPLICA 确认接收到该事务。ASYNC 模式能保证系统的可用性和分区容忍性。

如果使用了非默认端口（如 `5000`）来降级 REPLICA，则需要这样指定：
`"172.17.0.4:5000"`

---

## **检查已注册的 REPLICA 信息（Check info about registered REPLICA instances）**

在 MAIN 实例中运行以下查询来检查 REPLICA 实例状态：

```cypher
SHOW REPLICAS;
```

示例输出：

```
+--------+--------------------+-----------+-------------+-------------------------------------------------+
| name   | socket_address     | sync_mode | system_info | data_info                                       |
+--------+--------------------+-----------+-------------+-------------------------------------------------+
| "REP1" | "172.17.0.3:10000" | "sync"    | Null        | {memgraph: {behind: 0, status: "ready", ts: 0}} |
| "REP2" | "172.17.0.4:10000" | "async"   | Null        | {memgraph: {behind: 0, status: "ready", ts: 0}} |
+--------+--------------------+-----------+-------------+-------------------------------------------------+
```

该结果提供了每个副本的以下信息：

1. 副本名称
2. REPLICA 可访问的 IP 地址和复制服务器端口
3. 复制模式（sync / async / strict_sync）
4. 系统信息
5. 数据信息（针对每个数据库，包含当前时间戳、落后版本 tick 数以及当前状态）

---

## **在 MAIN 上创建节点（Create a node on MAIN）**

在 MAIN 实例中执行写查询：

```cypher
CREATE (:Node);
```

## **观察已复制的数据（Observe the replicated data）**

再次运行 `SHOW REPLICAS;` 可以看到数据库 `memgraph` 的时间戳信息已更改。

副本不再落后（`behind` 为 0）且状态为 `ready`，这意味着数据已经成功复制。

示例输出：

```
+--------+--------------------+-----------+-------------+-------------------------------------------------+
| name   | socket_address     | sync_mode | system_info | data_info                                       |
+--------+--------------------+-----------+-------------+-------------------------------------------------+
| "REP1" | "172.17.0.3:10000" | "sync"    | Null        | {memgraph: {behind: 0, status: "ready", ts: 2}} |
| "REP2" | "172.17.0.4:10000" | "async"   | Null        | {memgraph: {behind: 0, status: "ready", ts: 2}} |
+--------+--------------------+-----------+-------------+-------------------------------------------------+
```

如果现在登录到 REPLICA 并执行：

```cypher
MATCH (n) RETURN n;
```

将返回已复制的数据：

```
+---------+
| n       |
+---------+
| (:Node) |
+---------+
```

---

## **下一步（Next steps）**

建议你查看 Memgraph 社区版支持的复制查询，这样可以更熟练地管理一个被复制的 Memgraph 集群。

# 参考资料

https://memgraph.com/docs/clustering/replication/setup-replication-cluster-docker

* any list
{:toc}