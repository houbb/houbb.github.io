---
layout: post
title: 如何设计实现开发自助重启工具-05-聊一聊服务如何判断已经有请求了？
date: 2025-6-20 23:45:51 +0800
categories: [Tool]
tags: [tool, sh]
published: true
---

# 开发自助重启

说明：有时候研发产线需要重启，为了保证安全、或者说提升效率，最好有一个统一的研发自助重启页面。

这个功能可应用的发布有一些类似之处。那么这个功能具体应该如何实现呢？

# chat

# 健康和就绪URL

Q：

```
java 的应用在启动之后，如果已经启用流量。

又应该如何判断是否有请求正常进来？

最好可以自动化的这个过程，可以通过 api 之类的，方便和自助重启工具集成
```

非常好，这是**服务上线之后健康监控闭环的最后一步**：

> ✅ 应用重启 → ✅ 成功上线接流量 → ✅ 实际有请求进来（业务确认）

我们不能只靠「服务启动成功」或「就绪探针通过」，还应该确保：

> **服务真正开始处理实际流量了（例如 HTTP、RPC、消息等）**

---

## ✅ 目标：重启上线后，**检测是否有真实请求进来**

这个目标可以用于：

* 判断流量是否接入成功；
* 自动重启失败节点；
* 自助工具判断是否需要重试或报警。

---

## 🧠 实现方式总览（从易到难）

| 实现方案            | 检测方式                   | 自动化程度 | 说明        |
| --------------- | ---------------------- | ----- | --------- |
| ✅ **请求计数器 API** | 统计访问量                  | 高     | 推荐方式      |
| ✅ 访问日志监控        | 读取日志 / Prometheus      | 高     | 可接入现有监控体系 |
| ✅ 接入层/网关统计      | 通过 Nginx / Istio / SLB | 中     | 可查是否有流量进来 |
| ✅ APM 链路系统      | 接入 Skywalking / Zipkin | 中     | 业务粒度更高    |
| ⛔ 只靠探针          | 无法确认真实请求               | 不可用   | 就绪不代表被调用了 |

---

## ✅ 推荐方案：服务提供“请求监控 API”，供自助平台调用

### 🧩 步骤一：添加全局请求计数器（Spring Boot）

```java
@Component
public class TrafficMonitorInterceptor implements HandlerInterceptor {

    private final AtomicLong requestCount = new AtomicLong(0);

    @Override
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) {
        requestCount.incrementAndGet();
        return true;
    }

    public long getRequestCount() {
        return requestCount.get();
    }
}
```

> 注意：也可以统计每分钟请求数、每个接口访问量等

---

### 🧩 步骤二：暴露请求统计 API（或挂到 `/actuator`）

```java
@RestController
@RequestMapping("/internal")
public class RequestStatsController {

    @Autowired
    private TrafficMonitorInterceptor trafficMonitorInterceptor;

    @GetMapping("/request-stats")
    public Map<String, Object> stats() {
        return Map.of(
            "totalRequests", trafficMonitorInterceptor.getRequestCount(),
            "timestamp", System.currentTimeMillis()
        );
    }
}
```

---

### 🧩 步骤三：自助重启平台调用这个 API

```text
服务重启 → 等待就绪 → 加入流量 → 
延迟 10 秒 → 调用 /internal/request-stats →
若请求数 >= 1，说明有流量 → 标记上线成功 ✅
否则继续等待或告警 ❗
```

可设定：

* 超时判断（如 30 秒仍无请求数）
* 多次轮询，确定趋势（非 0）

---

## ✅ 高级方案：结合 Prometheus 或 APM

如果你已有监控系统，可以：

### 📊 方式一：Prometheus + Micrometer 监控请求数

```properties
management.metrics.export.prometheus.enabled=true
```

Spring Boot 自动暴露 `/actuator/prometheus`，可以抓取以下指标：

* `http_server_requests_seconds_count{method="GET",status="200",uri="/xxx"}`

你也可以做一个小程序定期拉 Prometheus 数据判断是否有流量。

---

### 🎯 方式二：日志分析（按日志判断请求）

日志中有：

```
[INFO] GET /api/user 200 123ms
```

可以用：

* ELK
* Fluentd + Loki
* 或自定义脚本读取 `/var/log/app.log` 检查最近是否有记录

---

## ✅ 总结：强烈建议实现一个简单的「请求数 API」

| 项目                           | 推荐状态  | 原因             |
| ---------------------------- | ----- | -------------- |
| 提供 `/internal/request-stats` | ✅ 必备  | 平台可轮询          |
| 初始请求计数为 0                    | ✅ 合理  | 判断上线后是否真的有流量进来 |
| 30 秒后仍为 0                    | ⚠️ 告警 | 说明服务未真正上线或接入失败 |
| 支持定时清零 / 最近窗口请求数             | ✅ 可选  | 更精准反映是否有“近期”请求 |

# 参考资料

* any list
{:toc}  