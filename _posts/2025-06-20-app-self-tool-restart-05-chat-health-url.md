---
layout: post
title: 如何设计实现开发自助重启工具-05-聊一聊服务的健康URL和就绪URL
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
java 的应用在启动之后，如何知道服务时可用的？
以 springboot 为例，一般都是有健康URL和就绪URL的，详细介绍一下
```

这是**服务治理和容器编排中非常关键的概念**。

以 Spring Boot 应用为例，服务在\*\*“刚启动”并不等于“可用”\*\*，我们需要更细粒度地控制 **何时开始接流量、何时认为健康**。

---

## 🌱 核心概念：健康检查 vs 就绪检查

| 类型                  | 含义               | 作用               | Spring Boot 中的常见路径           |
| ------------------- | ---------------- | ---------------- | ---------------------------- |
| **健康检查（Liveness）**  | 服务“活着”吗？程序有没有挂？  | 用于判断是否需要**重启服务** | `/actuator/health`           |
| **就绪检查（Readiness）** | 服务“准备好”了吗？能接请求吗？ | 控制是否**允许接收外部流量** | `/actuator/health/readiness` |

---

## ☘️ Spring Boot 中的具体实现（以 Spring Boot 2.3+ 为例）

Spring Boot 2.3 之后内置了对 **Liveness / Readiness** 的支持：

```properties
# 开启健康端点
management.endpoint.health.probes.enabled=true

# 对外暴露 health 接口
management.endpoints.web.exposure.include=health,info

# 设置是否细分 Liveness/Readiness
management.health.livenessState.enabled=true
management.health.readinessState.enabled=true
```

### 🔎 对应的 URL（默认）

| 类型        | URL 路径                       |
| --------- | ---------------------------- |
| 健康检查      | `/actuator/health`           |
| Liveness  | `/actuator/health/liveness`  |
| Readiness | `/actuator/health/readiness` |

---

## 📦 应用状态生命周期（Spring Boot 内部状态）

Spring Boot 会自动根据 bean 初始化、依赖注入等过程设置内部状态：

| 状态阶段                               | 描述          |
| ---------------------------------- | ----------- |
| `LivenessState.CORRECT`            | 应用存活（正常）    |
| `ReadinessState.ACCEPTING_TRAFFIC` | 应用就绪，可以处理请求 |
| `ReadinessState.REFUSING_TRAFFIC`  | 应用启动中或不可接流量 |

---

## ✨ 示例：手动控制 Readiness 状态

Spring Boot 提供了接口让你**手动控制是否“准备好”**

```java
@Component
public class MyInitListener {

    @Autowired
    private ApplicationAvailability availability;

    @PostConstruct
    public void init() throws InterruptedException {
        // 模拟启动加载任务
        Thread.sleep(3000); // 假设加载缓存、DB连接等耗时任务

        // 标记服务已准备好
        availability.setReadinessState(ReadinessState.ACCEPTING_TRAFFIC);
    }
}
```

---

## 🛡️ Kubernetes 中使用方式（集成探针）

你可以将 Spring Boot 的健康/就绪接口，**作为 K8s 容器探针配置的目标**：

```yaml
livenessProbe:
  httpGet:
    path: /actuator/health/liveness
    port: 8080
  initialDelaySeconds: 10
  periodSeconds: 15

readinessProbe:
  httpGet:
    path: /actuator/health/readiness
    port: 8080
  initialDelaySeconds: 20
  periodSeconds: 10
```

**作用：**

* Liveness 失败时，Pod 会被 K8s 自动重启；
* Readiness 失败时，Pod 不会接收流量（不会被加入 Service 的 endpoints）；

---

## 🧩 附加：自定义健康检查项（HealthIndicator）

你可以添加业务层级的健康检查，比如 Redis、数据库、外部服务等：

```java
@Component
public class RedisHealthIndicator implements HealthIndicator {
    @Override
    public Health health() {
        try {
            // 执行 ping 或 get
            return Health.up().withDetail("Redis", "OK").build();
        } catch (Exception e) {
            return Health.down().withDetail("Redis", "ERROR").build();
        }
    }
}
```

加入后，访问 `/actuator/health` 会看到：

```json
{
  "status": "UP",
  "components": {
    "redis": {
      "status": "UP",
      "details": { "Redis": "OK" }
    }
  }
}
```

---

## ✅ 总结

| 检查项                | 说明                  |
| ------------------ | ------------------- |
| 🧠 健康检查（Liveness）  | 判断程序是否挂掉，控制是否需要重启   |
| 🚦 就绪检查（Readiness） | 判断服务是否准备好接流量        |
| 🛠 集成探针            | 可以通过 K8s 探针进行自动流量控制 |
| 🧩 支持自定义检查         | 可结合数据库、缓存等业务状态做判断   |
| 🔧 可编程控制           | 应用可以根据自己的业务逻辑手动切换状态 |







# 参考资料

* any list
{:toc}  