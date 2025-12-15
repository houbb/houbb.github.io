---
layout: post
title: 成熟企业级技术平台-078-搜索平台（Search Platform / Retrieval Platform）
date: 2025-12-09 21:01:55 +0800
categories: MVE]
tags: [mve, sh]
published: true
---

# 中间件体系（Middleware Platform）

> 目标：为业务系统提供统一、稳定、高可用、可治理的基础运行能力

```
P0（运行基础）
├── 网关（Kong / APISIX）
├── 配置中心（Nacos）
├── RPC 平台（Dubbo）
├── 数据存储（MySQL / PostgreSQL / Mongo）

P1（解耦与性能）
├── MQ（Kafka / RabbitMQ）
├── 缓存平台（Redis / Memcached）
├── 搜索（Elasticsearch）
├── 文件存储（MinIO）

P2（治理与稳定）
├── 缓存失效监控 & 一致性
├── 任务调度（Airflow / XXLJob）
├── 中间件监控与告警

P3（平台化）
├── 中间件统一管控台
├── 多租户 / 资源隔离
├── 成本 & 容量管理
```

中间件体系的本质不是“技术选型”，而是“运行能力抽象”：

# 搜索平台（Search Platform / Retrieval Platform）

下面我将从**企业级中间件与数据服务平台**的视角，**系统性、深入、可落地**地展开 **搜索平台（Search Platform / Retrieval Platform）**，内容**不局限于 Elasticsearch**，而是覆盖 **技术谱系、索引与查询模型、平台化能力、治理体系、与存储 / MQ / 缓存 / AI 的协同**。整体可直接作为**企业级搜索平台的架构设计蓝本**。

---

# 一、搜索平台的本质定位

**一句话定义**

> **搜索平台是“面向人和系统的高维数据检索与相关性计算引擎”，而不是简单的全文检索工具。**

在现代系统中，搜索平台承担的是：

* 数据的 **可发现性（Discoverability）**
* 业务的 **实时洞察与分析**
* 用户体验的 **低延迟检索**

---

# 二、搜索在整体技术架构中的位置

```
Data Source
│
├── OLTP（DB / KV）
├── Log / Event
├── Object / File
│
├── 数据采集 & 同步（CDC / MQ）
│
├── 搜索平台（Index + Query）
│
└── 应用 / BI / AI / 网关
```

---

# 三、搜索平台的核心能力拆解

1. **多模态数据索引**
2. **复杂查询表达**
3. **相关性与排序**
4. **实时与准实时**
5. **高可用与水平扩展**

---

# 四、搜索技术谱系（不局限 ES）

## 1️⃣ Lucene 系（全文搜索核心）

* Elasticsearch
* OpenSearch
* Solr

**特点**

* 倒排索引
* 成熟生态
* 强相关性模型（BM25）

---

## 2️⃣ 结构化 / 混合搜索引擎

### ClickHouse（搜索 + 分析）

* 面向列
* 极快聚合
* 日志 / 事件搜索

### Apache Doris / StarRocks

* OLAP + 搜索
* 实时报表 + 条件检索

---

## 3️⃣ 云原生搜索

* AWS OpenSearch
* Azure Cognitive Search
* GCP Vertex Search

---

## 4️⃣ 向量搜索（语义检索）

* Milvus
* Weaviate
* Qdrant
* Pinecone

**应用**

* 语义搜索
* RAG
* 相似度检索

---

## 5️⃣ 专用搜索引擎

* Meilisearch（极简）
* Typesense（低延迟）
* Vespa（大规模推荐 + 搜索）

---

# 五、索引模型（搜索的“物理基础”）

## 1️⃣ 倒排索引（Text）

```
Term → DocIDs
```

* 精确匹配
* 相关性排序

---

## 2️⃣ 正排 / 列式索引（Field）

* 过滤
* 排序
* 聚合

---

## 3️⃣ 向量索引

* HNSW
* IVF
* PQ

---

## 4️⃣ 混合索引（Hybrid Search）

```
Text Score + Vector Score + Business Score
```

---

# 六、查询能力体系

## 1️⃣ 查询类型

* Keyword
* Phrase
* Fuzzy
* Range
* Geo
* Vector

---

## 2️⃣ 查询 DSL 能力

* Bool Query
* Filter vs Query
* Function Score
* Script Score

---

## 3️⃣ 排序与相关性

* BM25 / TF-IDF
* 业务权重
* 时效性衰减

---

# 七、实时性与数据同步

## 1️⃣ 数据进入路径

* DB → CDC → MQ → Search
* Log → Agent → Search

---

## 2️⃣ 实时级别

| 模式             | 延迟  |
| -------------- | --- |
| Near Real Time | 秒级  |
| Streaming      | 亚秒  |
| Batch          | 分钟级 |

---

# 八、搜索平台治理（企业级重点）

## 1️⃣ 索引治理

* Index Template
* Mapping 冻结
* 分片 / 副本策略

---

## 2️⃣ 查询治理

* 慢查询
* Query 黑名单
* 超时 / 限流

---

## 3️⃣ 资源治理

* 节点角色（Hot / Warm / Cold）
* Index Lifecycle Management（ILM）

---

## 4️⃣ 成本治理

* 冷热分层
* 压缩
* 归档

---

# 九、搜索平台化设计

```
Search Platform
├── 数据接入（CDC / Log / File）
├── Index 管理
├── Query Gateway
├── 相关性配置
├── 监控 / 告警
├── 权限 / 审计
├── 生命周期管理
├── 成本管理
└── AI / 向量服务
```

---

# 十、典型业务场景

| 场景   | 技术组合         |
| ---- | ------------ |
| 商品搜索 | ES + Ranking |
| 日志搜索 | ClickHouse   |
| 运维检索 | OpenSearch   |
| 语义搜索 | Vector DB    |
| 推荐   | Vespa        |

---

# 十一、搜索与其他中间件协同

| 组件 | 协同                 |
| -- | ------------------ |
| DB | 反向索引               |
| MQ | 索引更新               |
| 缓存 | Query Cache        |
| 网关 | Search API         |
| AI | Embedding / Rerank |

---

# 十二、反模式与风险

* ❌ 把搜索当数据库
* ❌ Mapping 随意改
* ❌ 分片过多
* ❌ 查询不受控

---

# 十三、选型建议（实战）

| 需求    | 推荐              |
| ----- | --------------- |
| 通用全文  | ES / OpenSearch |
| 日志    | ClickHouse      |
| 语义    | Milvus / Qdrant |
| 简单搜索  | Meilisearch     |
| 大规模推荐 | Vespa           |

* any list
{:toc}