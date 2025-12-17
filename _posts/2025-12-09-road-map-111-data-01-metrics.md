---
layout: post
title: 成熟企业级技术平台-111-Metrics（Prometheus）
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



# 指标


下面我**专门把 Metrics 体系单拎出来**，从**指标本体 → 数据模型 → 采集 → 存储 → 查询 → 治理 → 与稳定性工程的关系**，系统性展开；**不局限 Prometheus**，而是站在“企业级可观测平台”的角度。

---

# 一、Metrics 在 Observability 中的真实地位

一句话先定性：

> **Metrics 是可观测体系中“信噪比最高、成本最低、自动化友好度最高”的信号源。**

为什么？

* 连续时间序列 → 适合算法与告警
* 体量远小于日志
* 能直接映射到 SLI / SLO
* 是容量、稳定性、预测的基础

---

# 二、Metrics 的本体模型（不只是 Counter / Gauge）

## 1️⃣ 指标的数学类型（通用）

| 类型        | 含义   | 典型场景     |
| --------- | ---- | -------- |
| Counter   | 单调递增 | 请求数、错误数  |
| Gauge     | 瞬时值  | CPU、队列长度 |
| Histogram | 分布   | 延迟、大小    |
| Summary   | 分位数  | RT P95   |

⚠️ **企业级实践重点**

* 延迟 = Histogram + 服务端聚合
* 少用客户端 Summary（不可聚合）

---

## 2️⃣ 指标语义分类（比类型更重要）

### （1）资源指标（Infra）

* CPU / Memory / Disk / Network
* 容器 / Pod / Node
* JVM / GC / FD

👉 **面向容量与成本**

---

### （2）服务指标（Service / API）

* QPS / RPS
* Error Rate
* Latency（P90 / P95 / P99）

👉 **黄金指标核心**

---

### （3）业务指标（Business）

* 下单成功率
* 支付转化率
* 活跃用户数

👉 **真正的 SLA 驱动指标**

---

### （4）平台指标（Platform）

* 队列积压
* 消费延迟
* 重试次数

---

### （5）稳定性指标（Reliability）

* SLI 达标率
* Error Budget 消耗速率
* MTTR / MTBF

---

# 三、指标数据模型设计（决定你能走多远）

## 1️⃣ 时间序列模型（通用）

```
MetricName + Labels → TimeSeries
```

### 标签（Label / Tag）设计是成败关键

**推荐维度**

* service
* env
* region / az
* instance
* version

❌ **反模式**

* userId
* orderId
* traceId

> 高基数 = 系统性灾难

---

## 2️⃣ 维度分层（企业级必做）

| 层级   | 示例             |
| ---- | -------------- |
| 全局维度 | env / region   |
| 服务维度 | service / app  |
| 实例维度 | pod / instance |
| 业务维度 | biz_type       |

---

## 3️⃣ Metrics 与 CMDB / Service Catalog 绑定

指标不应“裸奔”：

* service ↔ 应用
* 应用 ↔ 团队
* 团队 ↔ Oncall

👉 这是告警可治理的前提。

---

# 四、采集体系（Prometheus 只是其中一种）

## 1️⃣ Pull vs Push 模式

| 模式   | 代表            | 适用            |
| ---- | ------------- | ------------- |
| Pull | Prometheus    | 云原生、K8s       |
| Push | StatsD / OTLP | 批量、Serverless |

---

## 2️⃣ 常见采集方式对比

### （1）Agent / Exporter

* Node Exporter
* JVM Exporter
* DB Exporter

✅ 标准化
❌ 覆盖不到业务语义

---

### （2）SDK / 埋点

* Micrometer
* OpenTelemetry Metrics SDK

✅ 业务语义强
❌ 侵入性

---

### （3）Sidecar / Service Mesh

* Envoy Stats
* Istio Telemetry

✅ 自动化
❌ 指标复杂度高

---

## 3️⃣ OpenTelemetry 的定位（重点）

> **OTel = 采集与语义标准，不是存储。**

* Metrics / Logs / Traces 统一模型
* OTLP 协议
* 面向多后端（Prom / Datadog / 云厂商）

👉 企业长期演进**强烈建议 OTel**。

---

# 五、存储引擎（不止 Prometheus）

## 1️⃣ 单机 / 本地 TSDB

* Prometheus
* InfluxDB

适合：

* 中小规模
* 单集群

---

## 2️⃣ 分布式时序数据库（企业主流）

| 产品              | 特点       |
| --------------- | -------- |
| VictoriaMetrics | 高压缩、低成本  |
| M3DB            | Uber 系   |
| Thanos          | Prom 扩展  |
| Cortex          | 多租户      |
| OpenTSDB        | HBase 生态 |

---

## 3️⃣ 云厂商 & 商业产品

* Datadog
* New Relic
* CloudWatch
* Azure Monitor

---

## 4️⃣ 关键能力对比维度

* 写入吞吐
* 查询延迟
* 多租户
* 长期存储
* 成本模型

---

# 六、查询 & 分析层（不止 PromQL）

## 1️⃣ 查询语言

* PromQL
* SQL（ClickHouse + Metrics）
* MQL（云厂商）

👉 企业趋势：**Metrics SQL 化**

---

## 2️⃣ 聚合能力

* Rate / Increase
* Downsampling
* Rollup

---

## 3️⃣ 多信号关联

* Metrics → Logs
* Metrics → Trace

---

# 七、告警体系中的 Metrics（正确用法）

## 1️⃣ 告警对象不是“指标”，而是“服务健康”

### 错误示例

```
CPU > 80%
```

### 正确示例

```
ErrorRate > 1% AND 持续 5 分钟
```

---

## 2️⃣ Burn Rate 告警（SRE 必备）

```
ErrorBudgetBurnRate > 2x
```

👉 比阈值告警**稳定得多**

---

## 3️⃣ 告警降噪

* 多维聚合
* 时间窗口
* 拓扑抑制

---

# 八、Metrics 与 Reliability 的强绑定

| 能力   | Metrics 作用 |
| ---- | ---------- |
| SLI  | 指标即定义      |
| SLO  | 基于指标计算     |
| 容量规划 | 趋势预测       |
| 自愈   | 触发条件       |
| RCA  | 变化源头       |

---

# 九、治理能力（90% 团队忽略）

## 1️⃣ 指标规范

* 命名规则
* 单位标准
* 维度约束

---

## 2️⃣ 生命周期管理

* 过期指标清理
* 冷热分层

---

## 3️⃣ 成本治理

* 高基数检测
* 高频写入限制

---

## 4️⃣ 指标目录（Metrics Catalog）

* 指标含义
* 负责人
* 关联服务

---

# 十、成熟度模型（Metrics 视角）

| 阶段 | 特征      |
| -- | ------- |
| L1 | 资源监控    |
| L2 | 服务黄金指标  |
| L3 | 业务指标    |
| L4 | SLO 驱动  |
| L5 | 预测 & 自愈 |


* any list
{:toc}