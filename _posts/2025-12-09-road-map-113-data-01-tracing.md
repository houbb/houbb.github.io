---
layout: post
title: 成熟企业级技术平台-113-链路 Tracing（Jaeger / Zipkin）
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



# Tracing（Jaeger / Zipkin）

下面我把 **Tracing（分布式链路追踪）** 从**工程本质、数据模型、采集机制、存储分析、平台能力、治理与稳定性工程**几个层面**系统性拆解**。
目标不是“选 Jaeger 还是 Zipkin”，而是**搞清楚 Tracing 在现代系统中到底解决什么、怎么规模化、怎么长期可用**。

---

# 一、Tracing 的真实定位（先定性）

一句话定义：

> **Tracing 是用“一次请求的因果链”，解释 Metrics 无法解释的问题。**

对比三大信号：

| 信号      | 回答的问题          |
| ------- | -------------- |
| Metrics | 系统“有没有问题”      |
| Traces  | 问题“发生在哪里、怎么传递” |
| Logs    | 问题“最终细节证据”     |

👉 **Tracing 是 Metrics → Logs 之间的桥梁。**

---

# 二、Tracing 解决的“工程级问题”

Tracing 不是为了“好看”，而是解决以下问题：

1. **跨服务性能瓶颈**
2. **级联故障（雪崩）**
3. **慢请求定位**
4. **上下游责任界定**
5. **变更影响分析**

这些问题，**单靠日志或指标都很难系统解决**。

---

# 三、Tracing 的数据模型（核心中的核心）

## 1️⃣ Trace / Span / Context

### Trace

* 一次完整请求
* 全局唯一 TraceID

### Span

* Trace 中的一个操作
* 有开始 / 结束时间
* 可嵌套

### Context

* TraceID / SpanID
* 通过 RPC / MQ 传播

```
Trace
 ├── Span A（入口）
 │   ├── Span B（DB）
 │   └── Span C（RPC）
 │       └── Span D（下游）
```

---

## 2️⃣ Span 的标准字段（通用模型）

| 字段         | 说明         |
| ---------- | ---------- |
| trace_id   | 全局         |
| span_id    | 当前         |
| parent_id  | 父节点        |
| service    | 服务名        |
| name       | 操作名        |
| duration   | 耗时         |
| status     | OK / ERROR |
| attributes | KV         |

> **Span 的属性设计，决定 Tracing 是否“有业务价值”。**

---

# 四、采集方式（远不止 SDK 打点）

## 1️⃣ SDK / Agent（最常见）

* OpenTelemetry SDK
* SkyWalking Agent
* Pinpoint Agent

优点：

* 语义完整
* 可定制

缺点：

* 侵入性
* 版本维护成本

---

## 2️⃣ 自动化采集（趋势）

### Service Mesh / Proxy

* Envoy
* Istio

能力：

* 自动生成 RPC Span
* 无需改业务代码

限制：

* 业务语义弱
* DB / 内部逻辑不可见

---

## 3️⃣ 混合模式（企业主流）

> **自动采集 + 关键业务手工 Span**

例如：

* HTTP / RPC：自动
* 下单 / 支付：业务 Span

---

# 五、Context 传播（很多系统失败的原因）

## 1️⃣ 同步调用

* HTTP Header
* gRPC Metadata

## 2️⃣ 异步场景（难点）

* MQ Message Header
* 延迟队列
* 任务重试

> Trace 断裂，90% 出在这里。

---

## 3️⃣ 跨语言 / 跨团队

* 统一规范（W3C Trace Context）
* OTel 默认支持

---

# 六、采样策略（规模化的生死线）

## 1️⃣ 为什么必须采样

* 全量 Trace 成本不可控
* 高并发下写入雪崩

---

## 2️⃣ 采样类型

| 类型            | 特点       |
| ------------- | -------- |
| Head Sampling | 请求入口采样   |
| Tail Sampling | 事后决策（更准） |
| Rate          | 固定比例     |
| Adaptive      | 动态调整     |

---

## 3️⃣ 企业级推荐

* 错误 Trace：100%
* 慢请求：高采样
* 正常请求：低采样

---

# 七、存储与查询（不止 Jaeger）

## 1️⃣ 存储模式

| 模式  | 说明         |
| --- | ---------- |
| 索引型 | ES         |
| 块存储 | Tempo      |
| 列式  | ClickHouse |

---

## 2️⃣ 关键能力

* Trace 查询
* Span 过滤
* 服务依赖拓扑
* 时序趋势分析

---

# 八、分析能力（Tracing 的价值释放点）

## 1️⃣ 服务拓扑自动发现

* 调用依赖
* 延迟分布

---

## 2️⃣ 慢调用分析

* Critical Path
* 瀑布图

---

## 3️⃣ 异常传播路径

* Root Span 定位
* 上下游影响

---

## 4️⃣ Tracing → Metrics

* RED / USE
* 每个接口自动生成指标

---

# 九、Tracing 与 Reliability 的关系

| 稳定性能力 | Tracing 作用 |
| ----- | ---------- |
| SLO   | 请求级别 SLI   |
| RCA   | 传播路径       |
| 容量规划  | 热点识别       |
| 自愈    | 精确触发       |

---

# 十、治理能力（被严重低估）

## 1️⃣ Span 命名规范

* 语义一致
* 可聚合

## 2️⃣ Attribute 约束

* 避免高基数
* 统一字段名

## 3️⃣ 生命周期管理

* 热 / 冷 Trace
* 保留策略

---

# 十一、Tracing 成熟度模型

| 阶段 | 特征         |
| -- | ---------- |
| L1 | 手工打点       |
| L2 | 自动链路       |
| L3 | Metrics 关联 |
| L4 | SLO 驱动     |
| L5 | 智能 RCA     |


* any list
{:toc}