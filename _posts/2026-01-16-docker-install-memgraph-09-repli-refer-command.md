---
layout: post
title: memgraph-09-Replication commands reference 复制命令参考
date: 2026-01-16 21:01:55 +0800
categories: [Database]
tags: [ai, memgraph, sh]
published: true
---

# **复制命令参考（Replication commands reference）**

本参考指南列出了 Memgraph Community 版中所有与复制（Replication）相关的命令，用于角色管理、副本注册、监控等操作。

---

## **角色管理命令（Role management commands）**

### **SET REPLICATION ROLE TO REPLICA**

```cypher
SET REPLICATION ROLE TO REPLICA WITH PORT <port_number>;
```

**说明（Behavior）**：

* 将当前实例从 MAIN 降级为 REPLICA。
* 在指定的 `<port_number>` 上启动复制服务器以接受 MAIN 发送的数据。
* REPLICA 实例只能执行**只读查询**。

**什么时候使用（When to use）**：
在你希望某个实例成为复制集群的副本前，首先在对应实例上运行此命令。

---

### **SET REPLICATION ROLE TO MAIN**

```cypher
SET REPLICATION ROLE TO MAIN;
```

**说明（Behavior）**：

* 将当前 REPLICA 实例提升为 MAIN 实例。
* 若实例已经是 MAIN，则该命令将抛出异常。
* 在一个复制集群中应始终只有一个 MAIN 实例；因此在执行此命令时要小心，避免造成多个 MAIN。
* 若多个 MAIN 并存，则需手动解决冲突。

**什么时候使用（When to use）**：
一般情况下，在第一次启动 Memgraph 时无需运行该命令；只有在执行手动故障切换时才可能使用它。

---

### **SHOW REPLICATION ROLE**

```cypher
SHOW REPLICATION ROLE;
```

**说明（Returns）**：

* 显示当前实例的复制角色（`"main"` 或 `"replica"`）。

**示例输出**：

```
+------------------+
| replication role |
+------------------+
| "replica"        |
+------------------+
```

**什么时候使用（When to use）**：
在 Community 版中没有自动路由机制时，可用此命令判断哪个实例是 MAIN，从而决定在何处执行写操作。

---

## **副本注册命令（Replica registration commands）**

### **REGISTER REPLICA（SYNC 模式）**

```cypher
REGISTER REPLICA <name> SYNC TO "<socket_address>";
```

**参数说明（Parameters）**：

* `<name>` — 副本实例的唯一名称。
* `<socket_address>` — 格式为 `"IP_ADDRESS|DNS_NAME:PORT_NUMBER"` 或 `"IP_ADDRESS|DNS_NAME"`（默认端口为 `10000`）。

**说明（Behavior）**：

* 在 MAIN 上以 SYNC 模式注册一个 REPLICA。
* 注册后，MAIN 会将自身的数据与该副本同步。

**影响（Implications）**：

* 在提交事务时，MAIN 会等待 SYNC 副本确认。
* 若 SYNC 副本挂掉，MAIN 仍能继续提交（与 STRICT_SYNC 不同）。
* SYNC 模式可保证数据一致性，但写性能较低，并存在极小的数据丢失风险。

**示例**：

```cypher
REGISTER REPLICA REP1 SYNC TO "172.17.0.3:10000";
```

---

### **REGISTER REPLICA（ASYNC 模式）**

```cypher
REGISTER REPLICA <name> ASYNC TO "<socket_address>";
```

**参数说明**与 SYNC 相同。

**说明（Behavior）**：

* 以 ASYNC 模式在 MAIN 上注册一个 REPLICA。
* MAIN 会将当前数据发送给副本。

**影响（Implications）**：

* MAIN 提交事务时**不等待**副本确认。
* 数据复制在后台线程完成，具有更好性能和更高可用性（AP），但可能存在数据最终一致性和潜在数据丢失风险。

**示例**：

```cypher
REGISTER REPLICA REP2 ASYNC TO "172.17.0.4";
```

---

### **REGISTER REPLICA（STRICT_SYNC 模式）**

```cypher
REGISTER REPLICA <name> STRICT_SYNC TO "<socket_address>";
```

**参数说明**与 SYNC 相同。

**说明（Behavior）**：

* 以严格同步模式在 MAIN 上注册一个 REPLICA。
* 使用两阶段提交协议（2PC）来保证写入的强一致性。

**影响（Implications）**：

* 若 STRICT_SYNC 副本不可用，则 MAIN 无法提交事务。
* 适用于需要**零数据丢失**的高可用场景，但写性能会显著下降。

**示例**：

```cypher
REGISTER REPLICA REP3 STRICT_SYNC TO "172.17.0.5:10000";
```

---

### **DROP REPLICA**

```cypher
DROP REPLICA <name>;
```

**参数说明（Parameters）**：

* `<name>` — 要删除的 REPLICA 名称。

**说明（Behavior）**：

* 将指定 REPLICA 从 MAIN 的注册列表中移除。
* 副本实例仍保持为 REPLICA 角色，但不再参与复制集群。

**什么时候使用（When to use）**：
当某个副本无法恢复或需要重新创建时，可先执行 `DROP REPLICA`，再重新注册。

**示例**：

```cypher
DROP REPLICA REP1;
```

---

## **监控命令（Monitoring commands）**

### **SHOW REPLICAS**

```cypher
SHOW REPLICAS;
```

**说明（Returns）**：

列出所有已注册的 REPLICA 实例及其详细状态信息，包括：

* 副本名称
* 网络地址（IP/DNS + 复制端口）
* 复制模式（SYNC / ASYNC / STRICT_SYNC）
* 系统信息
* 每个数据库的数据状态（滞后 tick、状态、时间戳等）

**示例输出**：

```
+--------+--------------------+-----------+-------------+-------------------------------------------------+
| name   | socket_address     | sync_mode | system_info | data_info                                       |
+--------+--------------------+-----------+-------------+-------------------------------------------------+
| "REP1" | "172.17.0.3:10000" | "sync"    | Null        | {memgraph: {behind: 0, status: "ready", ts: 0}} |
| "REP2" | "172.17.0.4:10000" | "async"   | Null        | {memgraph: {behind: 0, status: "ready", ts: 0}} |
+--------+--------------------+-----------+-------------+-------------------------------------------------+
```

---

## **Socket 地址格式（Socket address formats）**

### **IP 地址格式**

```
"IP_ADDRESS|DNS_NAME:PORT_NUMBER"
```

示例：

```
"172.17.0.4:10050"
```

---

### **IP 地址（默认端口）**

```
"IP_ADDRESS"
```

示例：

```
"172.17.0.5"
```

*默认端口为 10000。*

---

### **DNS 名称格式**

```
"DNS_NAME:PORT_NUMBER"
```

示例：

```
"memgraph-replica.memgraph.net:10050"
```

---

### **DNS 名称（默认端口）**

```
"DNS_NAME"
```

示例：

```
"memgraph-replica.memgraph.net"
```




# 参考资料

https://memgraph.com/docs/clustering/replication/replication-commands-reference

* any list
{:toc}