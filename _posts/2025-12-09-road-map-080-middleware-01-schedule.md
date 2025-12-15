---
layout: post
title: 成熟企业级技术平台-080-企业级任务调度 / 工作流编排平台（Scheduler & Workflow Orchestration Platform）
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

# 企业级任务调度 / 工作流编排平台（Scheduler & Workflow Orchestration Platform）

下面我将从**企业级任务调度 / 工作流编排平台（Scheduler & Workflow Orchestration Platform）**的视角，**系统性、工程化、可落地**地详细展开 **任务调度体系**，**不局限于 Airflow / XXLJob**，覆盖 **技术谱系、调度模型、可靠性、一致性、平台化治理、与数据/中间件/AI 的协同**。

这套内容可以直接作为**企业级任务调度平台设计蓝本**。

# 一、任务调度的本质定位

## 1.1 一句话定义

> **任务调度平台是“时间 + 依赖 + 状态”的确定性执行系统。**

不是“定时器”，而是 **有状态的分布式执行引擎**。

---

## 1.2 调度平台解决的核心问题

| 问题 | 说明 |
|---|---|
| 何时执行 | 时间 / 事件 |
| 执行什么 | Task |
| 执行顺序 | DAG / 依赖 |
| 执行在哪 | Worker |
| 执行是否成功 | 状态 |
| 失败怎么办 | Retry / Compensation |

---

# 二、调度系统技术谱系（不局限 Airflow / XXLJob）

## 2.1 轻量级任务调度（业务定时）

- XXLJob
- ElasticJob
- Quartz

**特点**
- 简单
- 易用
- 低门槛

---

## 2.2 工作流编排（DAG）

- Apache Airflow
- Argo Workflows
- DolphinScheduler
- Azkaban

**特点**
- DAG
- 可视化
- 重依赖管理

---

## 2.3 云原生 / 事件驱动

- Argo Events
- Temporal
- Cadence
- Netflix Conductor

**特点**
- 长事务
- 强可靠
- 事件驱动

---

## 2.4 大数据调度

- Oozie
- DataWorks
- SchedulerX

---

# 三、调度模型拆解（非常重要）

## 3.1 时间触发（Time-based）

```
Cron / Fixed Rate / Fixed Delay
```

---

## 3.2 事件触发（Event-based）

```
MQ Message / Webhook / File Arrival
```

---

## 3.3 状态触发（State-based）

```
Task A SUCCESS → Task B
```

---

## 3.4 混合触发（企业常态）

```
Time + Event + Dependency
```

---

# 四、任务与工作流建模

## 4.1 Task 模型

| 属性 | 说明 |
|---|---|
| Type | Shell / HTTP / SQL / Script |
| Retry | 次数 / 间隔 |
| Timeout | 超时 |
| Resource | CPU / Memory |
| Idempotent | 是否幂等 |

---

## 4.2 DAG 模型

- 有向无环
- 条件分支
- 并行执行

---

## 4.3 参数与上下文

```json
{
  "execution_date": "2025-12-15",
  "env": "prod",
  "biz_date": "2025-12-14"
}
```

---

# 五、执行引擎设计（核心）

## 5.1 调度器 vs 执行器

```
Scheduler → Assign Task → Worker
```

**关键原则**

- 调度与执行解耦
- 执行节点无状态

---

## 5.2 执行可靠性

- ACK / Heartbeat
- 超时检测
- 幂等执行

---

## 5.3 Exactly Once 语义（近似）

- 去重
- 状态机
- 幂等 + 重试

---

# 六、失败处理与补偿（非常重要）

## 6.1 重试策略

- 立即
- 指数退避
- 最大次数

---

## 6.2 补偿机制

- 人工补跑
- 自动回滚
- SAGA

---

## 6.3 任务幂等设计（必做）

- 业务去重
- 结果检查
- 状态表

---

# 七、平台化治理（企业级重点）

```
Task Scheduler Platform
├── 作业管理
├── DAG 编排
├── 触发器管理
├── Worker 管理
├── 资源配额
├── 权限 / 审计
├── SLA / 失败率
├── 告警 / 监控
├── 补跑 / 回放
└── 多租户
```

---

# 八、监控与可观测性

## 8.1 核心指标

| 指标 | 含义 |
|---|---|
| Success Rate | 成功率 |
| Runtime | 执行时长 |
| Delay | 调度延迟 |
| Retry Count | 重试次数 |

---

## 8.2 可视化

- DAG 状态图
- Timeline
- 失败热力图

---

# 九、与其他中间件的协同

| 组件 | 协同 |
|---|---|
| MQ | 事件触发 |
| DB | 状态存储 |
| 缓存 | 分布式锁 |
| 对象存储 | 中间结果 |
| AI | 智能调度 |

---

# 十、典型业务场景

| 场景 | 推荐 |
|---|---|
| 业务定时 | XXLJob |
| 数据 ETL | Airflow |
| 微服务编排 | Temporal |
| 云原生 | Argo |
| 长事务 | Cadence |

---

# 十一、常见反模式

- ❌ 把调度当 cron
- ❌ 任务无幂等
- ❌ 无补跑能力
- ❌ 调度与执行耦合

---

# 十二、选型建议（一句话）

| 需求 | 选择 |
|---|---|
| 简单定时 | XXLJob |
| DAG | Airflow |
| 强一致 | Temporal |
| K8s 原生 | Argo |
| 大数据 | DolphinScheduler |


* any list
{:toc}