---
layout: post
title: memgraph-10-System replication 系统数据复制
date: 2026-01-16 21:01:55 +0800
categories: [Database]
tags: [ai, memgraph, sh]
published: true
---



**注意：该页面内容仅适用于 Memgraph Enterprise 版**。 

🔗 原文链接：
[https://memgraph.com/docs/clustering/replication/system-replication](https://memgraph.com/docs/clustering/replication/system-replication)

---

# **系统数据复制（System replication）**（Enterprise）

在 **Memgraph Enterprise** 中，复制不仅限于图数据。除了节点、关系、索引、约束和触发器之外，**系统级数据（system-level data）** 也会在集群中进行复制。

系统复制确保 REPLICA 实例不仅反映图中存储的数据，还包括在 MAIN 实例上执行的以下操作和配置：

* **身份验证设置（authentication setup）**
* **多租户配置（multi-tenant configuration）**
* **数据库生命周期操作（database lifecycle operations）**

这使得 REPLICA 可以作为 MAIN 的一致且完整可用的 **只读副本（fully usable read copies）**。 

---

## **审计日志（Audit logs）**

当前 **审计日志不会在 Memgraph 内部进行复制**。
这意味着审计日志只存在于生成它们的实例上，不会自动传输到其他副本。 

---

## **身份认证数据复制（Auth data replication）**（Enterprise）

如果你正在使用 **Memgraph Enterprise 授权**，那么所有与身份验证和权限相关的数据（如用户、角色及其权限）**将会被复制**至 REPLICA 实例。

💡 在 **Memgraph Community（社区版）** 中不会复制用户和角色。社区版只能复制图数据（节点、关系、索引、约束及其他图构造）。 

---

## **身份认证模块复制（Auth modules replication）**

**身份认证模块（authentication modules）本身不会被复制**。
这意味着管理员需要在每个实例上单独 **手动配置身份认证模块**，例如 SSO、LDAP 集成等。 

---

## **多租户数据复制（Multi-tenant data replication）**（Enterprise）

在启用了多租户功能的 **Memgraph Enterprise** 中，以下行为会被复制：

* 在 MAIN 上 **创建或删除数据库** 的操作会复制到所有 REPLICA 实例。
* REPLICA 实例可以**使用这些数据库（只读）**，但只有 MAIN 可以对其进行写操作。 

### **当删除数据库时（When a database is dropped）**

1. REPLICA 实例标记该数据库为 **隐藏状态（hidden）**。
2. 新的会话无法再使用该数据库。
3. 一旦所有活动会话释放该数据库，它将在 REPLICA 上被**完全删除**。

这种策略确保了跨集群安全且可预测的租户数据库移除流程。 


# 参考资料

https://memgraph.com/docs/clustering/replication/system-replication

* any list
{:toc}