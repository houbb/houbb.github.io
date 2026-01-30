---
layout: post
title: 向量数据库 milvus 入门-11-多租户
date: 2026-01-16 21:01:55 +0800
categories: [Database]
tags: [ai, memgraph, sh]
published: true
---




# 实施多租户

在 Milvus 中，多租户意味着多个客户或团队（称为租户）共享同一个集群，同时保持隔离的数据环境。

Milvus 支持四种多租户策略，每种策略都在可扩展性、数据隔离和灵活性之间提供不同的权衡。本指南将向您介绍每种方案，帮助您选择最适合自己使用情况的策略。

## 多租户策略

Milvus 支持四个级别的多租户：数据库、Collection、Partition 和Partition Key。

### 数据库级多租户

使用数据库级多租户，每个租户都会收到一个相应的数据库，其中包含一个或多个 Collections。

![数据库级多租户](https://milvus.io/docs/v2.6.x/assets/database-level-multi-tenancy.png)

可扩展性：数据库级多租户策略默认最多支持 64 个租户。

数据隔离：每个数据库中的数据完全分离，提供企业级数据隔离，是受监管环境或有严格合规需求的客户的理想选择。

灵活性：每个数据库都可以拥有不同 Schema 的 Collections，从而提供高度灵活的数据组织，并允许每个租户拥有自己的数据模式。

其他该策略还支持 RBAC，可对每个租户的用户访问进行细粒度控制。此外，您还可以为特定租户灵活加载或释放数据，从而有效管理冷热数据。

### Collections 级多租户功能

有了 Collection 级多租户功能，每个租户都会被分配到一个Collection，从而提供强大的数据隔离功能。

![Collections 级多租户](https://milvus.io/docs/v2.6.x/assets/collection-level-multi-tenancy.png)

可扩展性：由于集群默认情况下最多可容纳 65,536 个 Collection，因此该策略可在集群内容纳相同数量的租户。

数据隔离：Collections 之间是物理隔离的。这种策略提供了强大的数据隔离功能。

灵活性：此策略允许每个 Collections 拥有自己的 Schema，以适应具有不同数据模式的租户。

其他：这种策略还支持 RBAC，允许对租户进行细粒度的访问控制。此外，您还可以为特定租户灵活加载或释放数据，从而有效管理冷热数据。

### 分区级多租户

在分区级多租户中，每个租户都被分配到共享 Collections 中手动创建的分区。

![分区级多租户](https://milvus.io/docs/v2.6.x/assets/partition-level-multi-tenancy.png)

可扩展性：每个 Collection 最多可容纳 1,024 个分区，允许其中的租户数量相同。

数据隔离：每个租户的数据都由分区物理隔离。

灵活性：这种策略要求所有租户共享相同的数据 Schema。分区需要手动创建。

其他：分区级别不支持 RBAC。租户既可以单独查询，也可以跨多个分区查询，因此这种方法非常适合涉及跨租户分区的聚合查询或分析的场景。此外，您还可以灵活加载或释放特定租户的数据，从而有效管理冷热数据。

### Partition Key 级多租户

采用这种策略，所有租户共享一个 Collections 和 Schema，但每个租户的数据会根据分区键值自动路由到 16 个物理隔离的分区中。虽然每个物理分区可以包含多个租户，但不同租户的数据在逻辑上是分开的。

![Partition Key 级别 多租户](https://milvus.io/docs/v2.6.x/assets/partition-key-level-multi-tenancy.png)

可扩展性：Partition Key 级策略提供了最具可扩展性的方法，可支持数百万个租户。

数据隔离：这种策略的数据隔离性相对较弱，因为多个租户可以共享一个物理分区。

灵活性：由于所有租户必须共享相同的数据 Schema，因此这种策略提供的数据灵活性有限。

其他：不支持分区 Key 级别的 RBAC。租户既可以单独查询，也可以跨多个分区查询，因此这种方法非常适合涉及跨租户分区的聚合查询或分析的场景。

## 选择正确的多租户策略

下表对四个级别的多租户策略进行了全面比较。

| 比较维度 | 数据库级 | Collections 级 | 分区级 | 分区 Key 级 |
| :--- | :--- | :--- | :--- | :--- |
| **数据隔离** | 物理 | 物理 | 物理 | 物理 + 逻辑 |
| **最大租户数** | 默认为 64 个。您可以通过修改 `Milvus.yaml` 配置文件中的 `maxDatabaseNum` 参数来增加租户数。 | 默认为 65,536。可以通过修改 `Milvus.yaml` 配置文件中的 `maxCollectionNum` 参数来增加。 | 每个 Collection 最多 1,024 个。 | 百万 |
| **数据 Schema 灵活性** | 高 | 中 | 低 | 低 |
| **RBAC 支持** | 支持 | 支持 | 支持 | 不支持 |
| **搜索性能** | 强 | 强 | 中等 | 中等 |
| **跨租户搜索支持** | 不支持 | 支持 | 支持 | 是 |
| **支持有效处理冷热数据** | 是 | 是 | 支持 | 否 (目前不支持 Partition Key 级策略) |

在选择 Milvus 的多租户策略时，有几个因素需要考虑。

**可扩展性：分区密钥 > 分区 > Collections > 数据库**
如果预计要支持非常多的租户（数百万或更多），请使用分区密钥级策略。

**强大的数据隔离要求：数据库 = Collection > 分区 > 分区密钥**
如果有严格的物理数据隔离要求，请选择数据库、Collection 或分区级策略。

**每个租户数据的灵活数据 Schema：Database > Collections > Partition = Partition Key**
数据库级和 Collections 级策略为数据 Schema 提供了充分的灵活性。如果租户的数据结构不同，请选择数据库级或 Collections 级多租户。

**其他**
**性能**：搜索性能由多种因素决定，包括索引、搜索参数和机器配置。Milvus 也支持性能调整。建议在选择多租户策略前测试实际性能。
**有效处理冷热数据**：目前，数据库级、 Collections 级和分区级策略都支持冷热数据处理。
**跨租户搜索**：只有分区级和 Partition Key 级策略支持跨租户查询。


# 参考资料

https://milvus.io/docs/zh/multi_tenancy.md


* any list
{:toc}