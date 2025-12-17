---
layout: post
title: 成熟企业级技术平台-112-日志 Logging（ELK / Loki）
date: 2025-12-09 21:01:55 +0800
categories: MVE]
tags: [mve, sh]
published: true
---

# 监控体系（Observability / Reliability Platform）

> 目标：看到异常” → “定位问题” → “持续可靠性治理

```
P0（可观测基础）
├── Metrics（Prometheus）
├── Logging（ELK / Loki）
├── Tracing（Jaeger / Zipkin）
├── Error Tracking（Sentry）

P1（定位与响应）
├── 秒级大盘（Grafana）
├── 告警平台
├── 事件中心（Incident）

P2（可靠性治理）
├── SLA / SLO 评估平台
├── StatusPage
├── 变更 / 发布关联分析

P3（智能化）
├── RCA 根因分析系统
├── 拓扑感知 / 依赖图
├── 智能异常检测（AIOps）
```

看见信号 → 定位问题 → 控制影响 → 复盘改进 → 可靠性提升



# 日志

下面我把 **Logging（日志体系）** 按**企业级可观测平台**的标准，**彻底拆开讲清楚**：
不是“ELK 怎么搭”，而是**日志在 Observability / Reliability 里的工程定位、数据模型、平台能力与治理体系**。

---

# 一、重新定义 Logging 的角色

一句话定性：

> **Logging 是“最高信息密度、最低结构化、最昂贵”的可观测信号。**

对比 Metrics / Traces：

| 维度     | Metrics | Traces | Logs |
| ------ | ------- | ------ | ---- |
| 结构化    | 高       | 中      | 低    |
| 成本     | 低       | 中      | 高    |
| 自动化    | 强       | 中      | 弱    |
| 信息密度   | 低       | 中      | 高    |
| RCA 价值 | 辅助      | 关键     | 终极证据 |

👉 **日志不是用来“常态看”的，而是用来“最后定案”的。**

---

# 二、日志的本体模型（比工具重要 10 倍）

## 1️⃣ 日志的逻辑结构（企业必做）

### ❌ 反例（字符串日志）

```
order failed, user=123, cost=98
```

### ✅ 正确（结构化日志）

```json
{
  "timestamp": "2025-12-16T08:30:01Z",
  "level": "ERROR",
  "service": "order-service",
  "env": "prod",
  "trace_id": "abc123",
  "span_id": "def456",
  "event": "order_create_failed",
  "error_code": "PAY_TIMEOUT",
  "latency_ms": 1200
}
```

> **结构化日志，是 Logging 能否规模化的分水岭。**

---

## 2️⃣ 日志的四大语义类型

| 类型              | 核心用途    |
| --------------- | ------- |
| Access Log      | 流量 / 行为 |
| Application Log | 业务 / 异常 |
| Audit Log       | 合规 / 审计 |
| Security Log    | 风控 / 攻击 |

企业平台**必须物理或逻辑隔离**，否则必崩。

---

# 三、日志分层设计（不是一个 index 搞定）

## 1️⃣ 按“责任”分层

| 层级          | 示例              |
| ----------- | --------------- |
| Infra       | OS / K8s / Node |
| Middleware  | DB / MQ / Cache |
| Application | Service / API   |
| Business    | 关键业务事件          |
| Security    | 登录 / 鉴权 / 风控    |

---

## 2️⃣ 按“价值”分层（极其重要）

| 层    | 特点    | 策略      |
| ---- | ----- | ------- |
| Hot  | 高频、短期 | 快查      |
| Warm | 排障    | 标准保留    |
| Cold | 合规    | 压缩 / 归档 |

👉 日志成本控制的核心在这里。

---

# 四、采集体系（远不止 Filebeat）

## 1️⃣ 采集模式对比

| 模式      | 代表                    | 特点   |
| ------- | --------------------- | ---- |
| Agent   | Filebeat / Fluent Bit | 通用   |
| Sidecar | K8s                   | 解耦   |
| SDK     | Logback / Log4j       | 语义最强 |
| Proxy   | Envoy                 | 零侵入  |

---

## 2️⃣ 企业级推荐组合

* **应用日志**：SDK（结构化）
* **基础日志**：Agent
* **流量日志**：Proxy / Mesh

---

## 3️⃣ OpenTelemetry Logs（趋势）

> **OTel 正在统一 Logs / Metrics / Traces 的上下文模型。**

核心价值：

* trace_id/span_id 标准化
* 与 Metrics / Traces 原生关联
* 多后端可切换

---

# 五、日志管道（Pipeline）能力模型

```
采集 → 解析 → 过滤 → 脱敏 → 富化 → 路由 → 存储
```

## 关键节点能力

### 1️⃣ 解析（Parse）

* JSON
* Regex
* Grok

### 2️⃣ 富化（Enrichment）

* CMDB 应用信息
* 服务拓扑
* 环境 / 版本

### 3️⃣ 脱敏（必做）

* 手机号
* 身份证
* Token / Secret

---

# 六、存储引擎（ELK 只是一个流派）

## 1️⃣ 搜索型（全文检索）

* Elasticsearch / OpenSearch
* Solr

优点：灵活
缺点：贵

---

## 2️⃣ 列式分析型

* ClickHouse
* Doris

优点：便宜、适合分析
缺点：全文能力弱

---

## 3️⃣ 对象存储 + 索引

* Loki（Index + Chunk）
* S3 / OSS + 元数据

优点：极低成本
缺点：复杂查询慢

---

## 4️⃣ 企业级现实选择

> **多存储并存，而不是二选一**

* Hot：搜索引擎
* Warm：列存
* Cold：对象存储

---

# 七、查询与分析能力（不只是 grep）

## 1️⃣ 核心查询能力

* 时间范围
* 多条件组合
* 正则 / 模糊
* JSON 字段级查询

---

## 2️⃣ 高级分析

* Top N 错误
* 错误趋势
* 日志 → 指标

👉 **Logs 反向生成 Metrics** 是平台成熟标志。

---

## 3️⃣ Logs ↔ Traces ↔ Metrics 关联

| 从       | 到       | 价值    |
| ------- | ------- | ----- |
| Metrics | Logs    | 定位细节  |
| Traces  | Logs    | 代码级证据 |
| Logs    | Metrics | 异常聚合  |

---

# 八、日志告警（90% 用错）

## ❌ 错误方式

* 关键字匹配
* 单条日志即告警

## ✅ 正确方式

* 聚合 + 时间窗口
* 日志 → 指标 → 告警

例：

```
error_code=PAY_TIMEOUT
5分钟内 > 100 次
```

---

# 九、治理能力（日志平台的生死线）

## 1️⃣ 命名与字段规范

* level / service / env / event

## 2️⃣ 生命周期管理

* 保留策略
* 自动归档

## 3️⃣ 成本治理

* 采样
* 丢弃低价值日志
* 高频字段限制

## 4️⃣ 日志目录（Log Catalog）

* 含义
* 来源
* 负责人

---

# 十、日志与 Reliability 的关系

| 稳定性能力 | 日志作用  |
| ----- | ----- |
| RCA   | 最终证据  |
| 安全    | 审计与取证 |
| 变更分析  | 前后对比  |
| 自愈    | 触发信号  |

---

# 十一、成熟度模型（Logging）

| 阶段 | 特征         |
| -- | ---------- |
| L1 | 集中采集       |
| L2 | 结构化        |
| L3 | 关联 Trace   |
| L4 | 日志 → 指标    |
| L5 | 智能分析 / RCA |

* any list
{:toc}