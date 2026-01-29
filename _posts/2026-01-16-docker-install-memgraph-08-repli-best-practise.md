---
layout: post
title: memgraph-08-设置复制时的最佳实践（Best practices when setting up replication）
date: 2026-01-16 21:01:55 +0800
categories: [Database]
tags: [ai, memgraph, sh]
published: true
---

# **设置复制时的最佳实践（Best practices when setting up replication）**

本指南面向希望在多个实例之间设置数据复制的 **Memgraph Community 用户**。

如果你拥有 **Memgraph Enterprise 授权**，我们建议使用 **高可用性功能（high availability features）**，它提供自动故障切换、负载均衡以及更全面的集群管理能力。

---

## **选择复制模式（Choose replication mode）**

复制模式决定了集群是更强调**性能**还是**一致性**：

* 使用 **ASYNC** 模式，如果你希望获得最大性能和可用性，并且可以容忍**最终一致性**。在该模式下，MAIN 在提交事务后**不等待** REPLICA 确认。
* 使用 **STRICT_SYNC** 模式，如果你希望实现**零数据丢失**，该保证通过两阶段提交协议（two-phase commit protocol）实现。但这会牺牲吞吐量。
* **SYNC** 是最常见的选择，能够在安全性和性能之间取得平衡，但存在极小的数据丢失风险。

对于 **跨数据中心部署**，建议使用 **ASYNC** 模式，因为跨区域网络延迟通常使得同步模式（SYNC 或 STRICT_SYNC）不切实际。 

---

## **组合不同的复制模式（Combine different replication modes）**

在同一集群中可运行不同模式的 REPLICA。有效组合包括：

* `SYNC + ASYNC`
* `STRICT_SYNC + ASYNC`

以下组合无效：

* `SYNC + STRICT_SYNC`

原因是 SYNC 模式允许 MAIN 在 REPLICA 不可用时继续提交，而 STRICT_SYNC 模式要求所有副本在线才能提交，因此两者行为冲突。 

---

## **存储模式要求（Storage mode requirements）**

复制仅在 **内存事务性存储模式（in-memory transactional storage mode）** 下工作。

如果你使用的是 **内存分析模式（in-memory analytical mode）** 导入数据，则需要：

1. 先导入数据
2. 将实例切换到 **内存事务性模式**
3. 然后配置复制 

---

## **硬件要求（Hardware requirements）**

为了获得可预测的性能，所有实例（MAIN 和每个 REPLICA）应当具有：

* **相同的内存（RAM）容量**
* **相同的 CPU 配置**

这有助于确保工作负载分布一致，避免不预期的性能瓶颈。 

---

## **部署要求（Deployment requirements）**

当运行多个实例时，建议的部署方式如下：

* **生产环境**：将每个 Memgraph 实例部署在独立机器上。
* **本地开发**：可以使用 Docker 在单机上运行多个副本，但需注意以下几点：

  * 每个实例使用不同的端口
  * 每个实例的数据卷（volume）具有唯一的目录名称

你可以查看完整的 Docker 示例指南：
👉 [Set up replication cluster with Docker](https://memgraph.com/docs/clustering/replication/setup-replication-cluster-docker) 

---

## **推荐的命令行标志（Recommended command-line flags）**

以下是某些建议保持默认值或统一设定的标志：

### **启动时数据恢复（Data recovery on startup）**

默认情况下，Memgraph 设置：

```
--data_recovery_on_startup=true
```

该标志控制 Memgraph 是否在启动时恢复持久化数据。对于短暂停机后重新启动的实例，这个标志应保持为 `true`，以确保数据能够恢复。

**建议：保持默认值。** 

---

### **启动时恢复复制状态（Restoring replication state on startup）**

实例在重启后需要记住其复制集群中的角色和配置详情，默认由以下标志启用：

```
--replication-restore-state-on-startup=true
```

该标志应保持为 `true` 以确保复制正常工作。若将其设为 `false`，MAIN 将无法与 REPLICA 通信，因为每个 REPLICA 都保存了 MAIN 的唯一 UUID（此 UUID 在注册时设置）。
如果设为 `false`，则需要先在 MAIN 上取消注册该实例，然后重新注册。

**建议：保持默认值。** 

---

### **WAL 文件刷新（Storage WAL file flush）**

建议对以下配置标志使用相同的值：

```
--storage-wal-file-flush-every-n-txn
```

在 MAIN 和 **SYNC** REPLICA 上使用相同配置值，否则可能出现 REPLICA 将 WAL 刷写完成但 MAIN 尚未刷写的情况。如果此时 MAIN 崩溃，可能导致节点间出现冲突并需手动解决。

**建议：默认值已统一，不需更改；若确实调整，请对所有相关实例一致设置。** 

---

## **执行复制查询的权限（Permissions to run replication queries）**

从 Memgraph v3.5 起，复制相关的查询（如 `REGISTER REPLICA`、`SHOW REPLICAS`、`DROP REPLICA` 等）针对默认的 `memgraph` 数据库，并需要访问权限。建议将默认数据库 `memgraph` 作为管理员/系统数据库来执行这些操作，并将数据图放在其他数据库下。

在 **Community 版** 中，每个用户都是管理员角色，并且没有角色或权限限制，因此用户可以执行任何复制查询。 

---

### **Enterprise 版的复制权限要求（Requirements for replication queries — Enterprise）**

在 Enterprise 版中，用户必须满足以下权限方可执行复制查询：

1. 拥有 `REPLICATION` 权限
2. AND 有权访问默认的 `memgraph` 数据库

例如，可以按如下方式配置一个具有复制管理权限的用户：

```cypher
-- Create admin role with replication privileges
CREATE ROLE replication_admin;
GRANT REPLICATION TO replication_admin;
GRANT DATABASE memgraph TO replication_admin;

-- Create user with replication admin role
CREATE USER repl_admin IDENTIFIED BY 'admin_password';
SET ROLE FOR repl_admin TO replication_admin;
```

此时，用户 `repl_admin` 可以：

* 执行所有复制命令（如 `REGISTER REPLICA`、`SHOW REPLICAS` 等）
* 访问 `memgraph` 数据库进行管理操作 

---

## **在 Community 中管理复制（Manage replication in Memgraph community）**

### **手动故障切换（Manual failover）**

自动主节点选举 / 故障切换是 **Enterprise 版** 的特性。对于 Community 版，需要用户自行执行手动故障切换。

在复制集群中应始终只有 **一个 MAIN 实例**，以防止复制系统错误。如果原 MAIN 实例发生故障：

你可以将某个 REPLICA 实例提升为新的 MAIN：

```cypher
SET REPLICATION ROLE TO MAIN;
```

如果原 MAIN 此时仍然在线（但需被替代），则需要解决冲突并手动管理复制系统。

如果你降级了新 MAIN 为 REPLICA，它不会自动恢复到原始角色。需要在 MAIN 上取消注册并重新注册该实例。

若故障的 MAIN 再次上线并试图恢复其原角色，则需要清理并降级该实例为新的 MAIN 的 REPLICA。最糟的情况下需要重建该实例并使用全新存储，才能成功重新注册到新的 MAIN。 

---

如需翻译本节对应的 **命令参考**（Replication commands reference guide）或其他子页面链接，请直接发链接或页面名称，我会继续按你的格式完成翻译。

[1]: https://memgraph.com/docs/clustering/replication/best-practices?utm_source=chatgpt.com "Best practices when setting up replication"

# 参考资料

https://memgraph.com/docs/clustering/replication/best-practices

* any list
{:toc}