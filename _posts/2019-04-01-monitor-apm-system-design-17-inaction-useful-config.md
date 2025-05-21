---
layout: post
title: 监控报警系统-16-报警规则配置之简单有效的配置 异常数（Anomaly Count）/ 同比（Year-over-Year, YoY）/ 环比（Month-over-Month/Week-over-Week, MoM/WoW）
date:  2021-06-20 16:52:15 +0800
categories: [APM]
tags: [apm, system-design, alarm-center]
published: true
---


# 前言

大家好，我是老马。

本文为大家介绍一些简单有效的配置指标。

# chat

## 介绍软件监控中简单的配置，比如异常数，同比，环比

### 一、核心指标定义
1. 异常数（Anomaly Count）  
   - 定义：单位时间内超出预设阈值（如固定值、标准差、箱线图Whisker线）的数据点数量。
   - 用途：快速定位系统异常波动（如API错误率激增、CPU使用率突增）。

2. 同比（Year-over-Year, YoY）  
   - 定义：当前时间段与去年同期同一时间段的数值对比。  
   - 公式：`(当前值 - 去年同期值) / 去年同期值 × 100%`  
   - 用途：消除季节性影响（如电商大促期间流量对比）。

3. 环比（Month-over-Month/Week-over-Week, MoM/WoW）  
   - 定义：当前时间段与上一个连续周期（如上周、上月）的数值对比。  
   - 公式：`(当前值 - 上周期值) / 上周期值 × 100%`  
   - 用途：检测短期趋势变化（如用户活跃度周环比下跌）。

---

### 二、配置方法（以 Prometheus + Grafana 为例）
#### 1. 异常数配置
- 阈值定义：基于历史数据动态计算（如箱线图Whisker线的上下限）。  
  ```promql
  # 示例：统计过去5分钟内HTTP 500错误率超过10%的次数
  sum_over_time(
    (rate(http_requests_total{status="500"}[5m]) / rate(http_requests_total[5m]) > 0.1)[1h:]
  )
  ```

- 告警规则（Prometheus Alertmanager）：  
  ```yaml
  - alert: HighErrorRate
    expr: rate(http_requests_total{status="500"}[5m]) / rate(http_requests_total[5m]) > 0.1
    for: 5m
    annotations:
      summary: "HTTP 500错误率超过10%"
  ```


#### 2. 同比/环比配置
- 同比计算：  
  ```promql
  # 当前CPU使用率 vs 一年前同一时间
  (
    avg_over_time(node_cpu_usage[1h]) 
    - avg_over_time(node_cpu_usage offset 1y[1h])
  ) / avg_over_time(node_cpu_usage offset 1y[1h]) * 100
  ```

- 环比计算：  
  ```promql
  # 本周平均响应时间 vs 上周
  (
    avg_over_time(api_response_time_seconds{path="/login"}[7d]) 
    - avg_over_time(api_response_time_seconds{path="/login"} offset 7d[7d])
  ) / avg_over_time(api_response_time_seconds{path="/login"} offset 7d[7d]) * 100
  ```

- Grafana 面板：  
  - 使用 Time Series 图表展示原始值与同比/环比曲线。  
  - 添加 Stat 面板显示百分比变化，并设置颜色标记（如环比>5%标红）。

---

### 三、典型应用场景

| 场景               | 配置示例                              | 工具         |
|-------------------------|------------------------------------------|------------------|
| 电商大促流量监控        | 实时流量同比去年大促，检测是否达到预期    | Grafana + 同比查询 |
| 微服务错误率突增告警    | 统计过去10分钟异常数，超过阈值触发Slack通知 | Prometheus Alertmanager |
| 用户留存率周环比分析    | 计算本周留存率环比变化，生成自动报告      | SQL窗口函数（LAG） |

---

### 四、注意事项
1. 数据间隔对齐：同比/环比需确保时间窗口完全对齐（如自然周/月），避免偏差。
2. 基线稳定性：若历史数据波动大（如新业务），建议使用滚动基线（如过去4周均值）。
3. 异常检测优化：结合机器学习（如Prophet算法）动态调整阈值，减少误报。

## 除了这些 还有哪些比较有效果的指标

### 一、系统性能指标

#### 1. 成功率（Success Rate）
   - 定义：成功请求数占总请求数的比例（如HTTP 2xx/3xx占比）。
   - 配置示例：
     ```promql
     sum(rate(http_requests_total{status=~"2..|3.."}[5m])) / sum(rate(http_requests_total[5m]))
     ```

   - 场景：API服务可用性监控，低于99.9%触发告警。

#### 2. 延迟（Latency）
   - 关键分位点：P50（中位数）、P95、P99（长尾延迟）。
   - 配置示例：
     ```promql
     histogram_quantile(0.95, sum(rate(http_request_duration_seconds_bucket[5m])) by (le))
     ```

   - 场景：检测慢查询或网络拥塞，如P99延迟突增可能暗示数据库索引失效。

#### 3. 吞吐量（Throughput）
   - 定义：单位时间处理的请求数（QPS/RPS）。
   - 配置示例：
     ```promql
     rate(http_requests_total[5m])
     ```

   - 场景：流量洪峰预警，配合自动扩缩容策略（如Kubernetes HPA）。

---

### 二、资源健康度指标
#### 1. 资源利用率（Utilization）
   - 维度：CPU、内存、磁盘IO、网络带宽。
   - 配置示例（CPU）：
     ```promql
     1 - avg(rate(node_cpu_seconds_total{mode="idle"}[5m]))
     ```

   - 场景：长期高利用率（>80%）预示资源瓶颈。

#### 2. 饱和度（Saturation）
   - 定义：资源排队等待的严重程度（如CPU负载、磁盘IO等待队列）。
   - 配置示例（CPU负载）：
     ```promql
     node_load5 / count(node_cpu_seconds_total{mode="system"})
     ```

   - 场景：负载值持续>1.0时，表明系统过载。

#### 3. 错误预算（Error Budget）
   - 定义：基于SLO（服务等级目标）的允许错误时间比例。
   - 公式：`错误预算 = 1 - (实际可用性 / SLO目标)`  
   - 场景：当预算耗尽时冻结非关键部署，保障核心服务。

---

### 三、业务与用户体验指标
#### 1. 黄金信号（Golden Signals）
   - 四大核心：  
- 流量（Traffic） ：用户活跃度（DAU/WAU/MAU）。  
- 错误率（Errors） ：业务逻辑错误（如支付失败次数）。  
- 延迟（Latency） ：用户端感知延迟（前端性能指标）。  
- 饱和度（Saturation） ：业务容量限制（如并发用户数上限）。

#### 2. 转化漏斗（Conversion Funnel）
   - 定义：关键用户路径的转化率（如注册→激活→付费）。  
   - 配置示例：
     ```sql
     SELECT 
       COUNT(register) / COUNT(visit) AS visit_to_register,
       COUNT(payment) / COUNT(register) AS register_to_pay
     FROM user_events
     ```

   - 场景：某步骤转化率骤降时，定位前端BUG或流程设计问题。

#### 3. 用户会话分析（Session Analysis）
   - 指标：  
- 会话时长（Session Duration）  
- 跳出率（Bounce Rate）  
- 交互深度（Pages per Session）  
   - 工具：Elasticsearch + Kibana日志分析，或前端埋点工具（如Sentry）。

---

### 四、安全与合规指标
#### 1. 异常登录（Suspicious Logins）
   - 检测规则：  
- 单IP高频登录尝试（>5次/分钟）。  
- 异地登录（地理距离>1000公里且时间间隔<1小时）。  
   - 工具：ELK + 自定义告警规则。

#### 2. 数据一致性（Data Integrity）
   - 检测方法：  
- 主从数据库延迟（如MySQL `Seconds_Behind_Master`）。  
- 关键业务表哈希校验（如每日对比订单总金额）。  
   - 场景：主从延迟>60秒时触发切换检查。

---

### 五、高级监控策略
#### 1. 关联指标分析
   - 示例：  
- 高错误率 + 低延迟 → 可能服务快速失败（熔断生效）。  
- 低吞吐量 + 高CPU → 可能代码死锁或GC过载。

#### 2. 合成监控（Synthetic Monitoring）
   - 定义：模拟用户行为检测核心链路（如定时触发支付流程）。  
   - 工具：Playwright脚本 + CronJob定期执行。

#### 3. RED方法  
   - 核心指标：  
- Rate（请求速率）  
- Errors（错误率）  
- Duration（延迟）  
   - 适用场景：微服务接口健康度评估。

---

### 六、总结

| 指标类型       | 典型工具链                     | 核心价值                     |
|--------------------|----------------------------------|---------------------------------|
| 系统性能           | Prometheus + Grafana            | 保障基础设施稳定性               |
| 业务健康度         | ELK + 自定义埋点                 | 驱动产品优化与增长               |
| 用户体验           | Sentry + 前端性能监控（RUM）     | 提升用户留存与满意度             |
| 安全与合规         | WAF + SIEM系统                  | 防御攻击与满足审计要求           |

实施建议：优先覆盖 RED黄金信号 和 资源四率（使用率/错误率/饱和度/吞吐量） ，再逐步扩展业务与安全指标，形成立体监控体系。


# 参考资料

* any list
{:toc}
