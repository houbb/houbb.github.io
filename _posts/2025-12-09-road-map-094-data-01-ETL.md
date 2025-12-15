---
layout: post
title: 成熟企业级技术平台-094-ETL / ELT 平台
date: 2025-12-09 21:01:55 +0800
categories: MVE]
tags: [mve, sh]
published: true
---

# 数据体系（Data Platform）

> 目标：让数据从“可采集”→“可信”→“可复用”→“可决策”

```
P0（数据基础）
├── 数据采集 / 埋点体系
├── 数据中台（数据湖 / 数据仓库）
├── ETL / ELT 平台（Airflow）

P1（数据可信）
├── 元数据平台（Data Catalog）
├── 指标平台
├── 数据质量平台（DQ）

P2（数据服务）
├── 数据 API 平台
├── 报表平台（BI）
├── 数据可视化平台

P3（数据资产化）
├── 数据资产管理
├── 数据权限与安全治理
├── 特征平台（Feature Store）
```

中间件体系的本质不是“技术选型”，而是“运行能力抽象”：


# 一、概念区分：ETL vs ELT

| 名称  | 含义                         | 数据处理顺序            | 特点                     | 典型场景                                        |
| --- | -------------------------- | ----------------- | ---------------------- | ------------------------------------------- |
| ETL | Extract → Transform → Load | 抽取 → 清洗/转换 → 写入目标 | 转换在计算层完成后再入仓；目标仓库相对干净  | 传统数仓、批处理、OLAP                               |
| ELT | Extract → Load → Transform | 抽取 → 入仓 → 再在仓库里转换 | 利用大数据仓库 / 数据湖计算能力；延迟更低 | 云数据仓库 / 大数据湖仓（Snowflake, BigQuery, Iceberg） |

> 结论：现代大数据中台趋势是 **ELT 为主 + ETL 补充**。

---

# 二、ETL / ELT 平台核心能力

无论是 Airflow 还是其他平台，企业级 ETL / ELT 平台需要提供的能力：

1. **任务调度和编排**

   * 支持 DAG（有向无环图）依赖关系
   * 支持定时调度、事件触发、手动触发
   * 支持重试策略、容错、并发控制

2. **数据抽取（Extract）**

   * 关系型数据库（MySQL、Oracle、PostgreSQL）
   * NoSQL 数据库（MongoDB、Cassandra）
   * 消息队列（Kafka、RocketMQ）
   * 日志、文件、API

3. **数据转换（Transform）**

   * SQL 转换（Hive SQL、Spark SQL、Trino）
   * 编程式转换（Python、Java、Scala）
   * 流式转换（Flink、Kafka Streams）
   * 支持 UDF / 自定义函数

4. **数据加载（Load）**

   * 数据仓库（Doris、ClickHouse、Hive、Iceberg）
   * 数据湖（MinIO + Iceberg/Hudi/Delta）
   * 数据服务（API、缓存）

5. **数据治理**

   * Schema 管理
   * 元数据管理
   * 血缘分析
   * 数据质量校验（完整率、唯一性、准确率）

6. **监控与告警**

   * 任务状态可视化
   * 异常告警（失败、延迟、数据量异常）
   * 自动重跑或人工干预

7. **运维管理**

   * 多租户隔离
   * 权限控制
   * 版本管理
   * 容错和灾备

---

# 三、典型架构设计

企业级 ETL / ELT 平台通常包含以下层次：

```
数据源层
   └─ MySQL / Kafka / API / 文件
        ↓ Extract
调度与编排层
   └─ DAG / 任务管理（Airflow / Azkaban / Dagster / 自研）
        ↓ Transform
计算层
   ├─ 批处理：Spark / Flink / Hive
   ├─ 流处理：Flink / Kafka Streams
        ↓ Load
目标存储层
   ├─ 数据仓库：Doris / ClickHouse / Hive
   ├─ 数据湖：Iceberg / Hudi / Delta Lake on S3/MinIO
治理与监控层
   ├─ 元数据 / 血缘 /质量
   ├─ 告警 / 审计 / SLA
```

> 核心思路：**解耦调度、计算、存储、治理**，保证灵活扩展和可复用能力。

---

# 四、常见 ETL / ELT 平台选型

| 类型      | 典型产品                           | 特点                      |
| ------- | ------------------------------ | ----------------------- |
| 开源调度编排  | Airflow、Azkaban、Luigi、Dagster  | DAG 调度、Python 扩展性强、社区活跃 |
| 流式 ETL  | Flink、Kafka Streams、Flink CDC  | 实时 / 准实时处理、状态管理         |
| 云原生 ELT | Snowflake、BigQuery、Databricks  | 内置仓库计算、免运维、强 SQL 支持     |
| 商用大数据管控 | StarRocks + Flink + Airflow 组合 | 离线 + 实时融合、性能优化、企业级支持    |

> 注意：Airflow 只是 **调度 + 编排工具**，真正的 ETL/ELT 计算还是依赖 Spark / Flink / SQL 引擎。

---

# 五、实现模式

### 1. 批量 ETL

* 场景：离线数据清洗、日报/周报指标
* 技术栈：

  * Airflow 调度
  * Spark 批处理
  * Hive / Doris / Iceberg 入仓
* 特点：延迟分钟到小时

### 2. 流式 ETL / ELT

* 场景：埋点事件处理、交易实时分析
* 技术栈：

  * Kafka/Flink CDC
  * Flink 流处理
  * Iceberg / Doris / ClickHouse 写入
* 特点：延迟秒级到分钟

### 3. 混合模式

* 批 + 流统一管理
* DAG 统一编排
* 统一治理层

---

# 六、数据治理与质量

企业级 ETL / ELT 平台 **必须内置治理能力**：

1. **元数据管理**

   * 数据源、表、字段、类型、血缘
2. **数据质量校验**

   * Completeness：完整率
   * Uniqueness：唯一性
   * Accuracy：准确性
3. **指标口径统一**

   * 计算逻辑、时间粒度、维度
4. **可追溯 / SLA**

   * 异常告警
   * 数据追踪与回滚

---

# 七、运维和多租户

企业数据平台往往有多个业务线同时使用：

* **多租户**：不同业务隔离 DAG、队列、数据权限
* **任务优先级**：关键业务任务优先调度
* **版本管理**：任务、SQL、脚本版本化
* **灾备**：作业失败自动重试，跨集群切换

---

# 八、常见企业痛点

1. **任务依赖复杂**：DAG 太大，调度难维护
2. **延迟不可控**：计算资源冲突或数据倾斜
3. **监控盲区**：失败、延迟、质量异常无法及时发现
4. **重复造轮子**：每条业务独立写 ETL
5. **治理缺失**：血缘、质量、指标不统一

> 企业级解决方案的关键在于：**平台化 + 可复用 + 可治理**。

---

# 九、实践落地建议

1. **调度**：

   * 开源：Airflow、Dagster
   * 商用/自研：企业统一 DAG + UI
2. **计算**：

   * 批：Spark / Hive / Presto
   * 流：Flink / Kafka Streams
3. **存储**：

   * OLAP：Doris / ClickHouse / Hive
   * 数据湖：Iceberg / Hudi / Delta on S3/MinIO
4. **治理**：

   * 元数据 + 血缘 + 质量监控
   * 指标口径字典
5. **监控告警**：

   * 任务状态、数据量异常、延迟告警
6. **安全 & 权限**：

   * 多租户隔离、敏感字段脱敏



* any list
{:toc}