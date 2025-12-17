---
layout: post
title: 成熟企业级技术平台-114-Error Tracking（不局限于 Sentry）
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



# Error Tracking（不局限于 Sentry）

下面我把 **Error Tracking（错误追踪 / 异常管理）** 当作一个**独立的一等能力**来系统展开，而不是“日志里的 ERROR 多一个工具”。

重点会放在：**它和 Logs / Metrics / Traces 的边界、它解决的核心问题、它为什么在现代体系中不可替代，以及如何平台化**。

---

# 一、先给 Error Tracking 正名

一句话定义：

> **Error Tracking 是“以异常为中心”的可观测能力，用来回答：
> *到底有哪些错误在真实发生？影响多大？是否被修复？***

它关注的不是“系统状态”，而是**“失败事件本身”**。

---

## Error Tracking vs 其他信号

| 能力                 | 关注中心                     |
| ------------------ | ------------------------ |
| Metrics            | 数量 / 趋势                  |
| Logs               | 过程 / 细节                  |
| Traces             | 传播路径                     |
| **Error Tracking** | **失败实体（Error Instance）** |

👉 Error Tracking 的最小单位是 **“一个错误”**，不是一行日志。

---

# 二、Error Tracking 真正解决的 5 个问题

### 1️⃣ “到底有哪些错误在发生？”

* 去重（Fingerprint）
* 聚类（Same Root Cause）

### 2️⃣ “哪些错误最严重？”

* 影响用户数
* 出现频率
* 持续时间

### 3️⃣ “这个错误是不是新引入的？”

* Release / Version 对比
* 变更回归检测

### 4️⃣ “这个错误现在是否还在发生？”

* Open / Resolved / Regressed

### 5️⃣ “错误有没有被真正修掉？”

* 状态闭环
* 再出现检测

---

# 三、Error Tracking 的核心数据模型

这是和 Logging 最大的不同点。

---

## 1️⃣ Error Instance（错误实例）

> **一次真实发生的异常**

字段示例：

* timestamp
* service / env
* exception_type
* message
* stacktrace
* trace_id
* user_context

---

## 2️⃣ Error Issue（错误问题）

> **一类“本质相同”的错误集合**

关键能力：

* Fingerprint（指纹）
* 聚合规则
* 生命周期

```
Issue: NullPointerException in OrderService#createOrder
 ├── Instance #1
 ├── Instance #2
 └── Instance #3
```

👉 **这一步，日志做不到。**

---

## 3️⃣ Issue 生命周期（平台化必备）

```
New → Investigating → Resolved → Regressed
```

---

# 四、错误捕获机制（远不止 try-catch）

## 1️⃣ Runtime 自动捕获

* Uncaught Exception
* Panic / Fatal Error
* Promise Rejection

支持：

* Java / Go / JS / Python / Native

---

## 2️⃣ 手动捕获（业务语义）

```java
captureError(
  errorCode="PAY_TIMEOUT",
  context={orderId, amount}
)
```

👉 **关键业务失败一定要“显式上报”**。

---

## 3️⃣ 前端错误（非常重要）

* JS Runtime Error
* Resource Load Error
* API Error
* Web Vitals 关联

---

# 五、错误聚类与指纹（Error Tracking 的灵魂）

## 1️⃣ 指纹来源

* Exception Type
* Stacktrace Top Frames
* Error Code
* Service / Endpoint

---

## 2️⃣ 为什么这一步不可或缺？

如果没有指纹：

* 每次异常 = 一条日志
* 人工无法判断“是不是同一个问题”

Error Tracking 做的是：

> **把“海量异常实例”压缩成“有限的问题列表”。**

---

# 六、与 Release / 变更强绑定（价值爆发点）

## 1️⃣ Release Awareness

* 版本号
* Commit Hash
* 灰度标识

---

## 2️⃣ 典型场景

* 发版后错误数激增
* 某版本独有错误
* 回滚后是否消失

👉 这是 DevOps / CI-CD 的核心反馈回路。

---

# 七、与 Observability 三支柱的关系

## Error Tracking 在中间的位置

```
Metrics → Error Tracking → Traces → Logs
```

* Metrics：发现异常趋势
* Error Tracking：定位“哪类错误”
* Traces：看传播路径
* Logs：看细节证据

---

## Error → Trace → Logs（理想链路）

* 点击 Error Issue
* 跳转 Trace
* 查看相关 Logs

👉 一条龙排障。

---

# 八、告警与优先级（比 ERROR 日志靠谱）

## 错误告警正确姿势

不是：

```
ERROR 日志出现
```

而是：

* 新错误 Issue 出现
* 已解决 Issue 回归
* 高频错误影响用户

---

## 严重性分级

| 等级      | 含义    |
| ------- | ----- |
| Fatal   | 服务不可用 |
| Error   | 功能失败  |
| Warning | 可恢复   |
| Info    | 记录    |

---

# 九、治理能力（很多团队没做到）

## 1️⃣ Error Code 规范

* 全局唯一
* 可读
* 可文档化

---

## 2️⃣ 忽略 / 静默规则

* 第三方噪音
* 已知问题

---

## 3️⃣ Ownership

* Error → Service → Team

---

## 4️⃣ 成本控制

* 采样
* 限流
* 聚合

---

# 十、工具生态（不止 Sentry）

## 开源 / 商业方向

* Sentry（标杆）
* Bugsnag
* Rollbar
* Raygun
* 自研（基于 OTel + ES / ClickHouse）

---

## 自研的可行性判断

> **能采集不难，难的是：聚类、指纹、生命周期。**

---

# 十一、Error Tracking 成熟度模型

| 阶段 | 特征           |
| -- | ------------ |
| L1 | ERROR 日志     |
| L2 | 自动异常捕获       |
| L3 | Issue 聚类     |
| L4 | Release 关联   |
| L5 | SLO / RCA 驱动 |


* any list
{:toc}