---
layout: post
title: test framework-13-测试平台聊一聊如何设计实现
date:  2016-4-26 12:53:12 +0800
categories: [Test]
tags: [junit, framework, open-source, plateform, test]
published: true
---

# 前言

测试平台最强大的一个设计应该是流程控制。

测试平台的用户群体是测试，知道一些简单的判断，但是编程能力一般。

所以我们需要设计一个流程控制的系列组件，让测试拥有近似于开发的编程能力。

# chat

## 整体如何设计？

太好了，有了你的补充信息（**Java + Vue，一个人全栈开发 + 强大测试引擎诉求**），我会重新规划一套更贴合你场景的「轻量但强扩展、能跑全流程的自动化测试平台」。

---

## ✅ 一、目标明确

### ✅ 目标：

构建一个**模块化、插件化、灵活配置流程的测试平台**，能执行：

* 接口（HTTP/HTTPS）调用
* MQ 消息（如 RabbitMQ、Kafka）
* Dubbo 接口（或泛化调用）
* SQL 执行
* 自定义断言 + 多步依赖执行
* 自定义流程编排

---

## ✅ 二、整体架构概览

```text
[前端 Vue UI]  <==>  [后端 Spring Boot 服务]  <==>  [测试执行引擎（内嵌）]
                                │
                                └──> MySQL / Redis / MQ / etc.
```

你可以一个人维护这三个部分：

| 模块   | 技术栈                                    | 描述              |
| ---- | -------------------------------------- | --------------- |
| 前端   | Vue 3 + Element Plus                   | 页面配置任务流、查看日志/报告 |
| 后端   | Spring Boot + MyBatis + Redis + Quartz | 管理调度+存储+执行调用    |
| 测试引擎 | 自研 DSL + Groovy/JS 脚本支持（或 Java SPI 插件） | 流程控制 + 模块执行     |

---

## ✅ 三、核心功能模块拆分

### 1. **测试用例 & 流程配置模块**

* 支持「流程图式」或「JSON 配置」的方式组合步骤
* 每个步骤是：

  ```json
  {
    "type": "http", // 或 sql, dubbo, mq
    "name": "调用登录接口",
    "params": {...},
    "extract": {...},  // 提取响应中的数据，供后续步骤使用
    "assert": {...}    // 断言条件，例如 status == 200, json.data.token != null
  }
  ```

---

### 2. **内置步骤类型（基础支持）**

| 类型           | 描述                                                |
| ------------ | ------------------------------------------------- |
| `http`       | 支持 GET/POST/PUT/DELETE，header/token 传参，JSON 提取/断言 |
| `sql`        | MySQL/PG 执行查询/更新，支持断言查询结果                         |
| `dubbo`      | 支持泛化调用，或基于反射执行                                    |
| `mq`         | 发送消息、消费消息、验证是否被消费                                 |
| `sleep/wait` | 支持延迟等待                                            |
| `脚本执行`       | 可选 Groovy / JS 脚本步骤，用于复杂逻辑判断                      |
| `变量注入`       | 支持参数变量上下文，步骤间共享                                   |

---

### 3. **测试计划调度**

* 手动执行 / 定时任务（基于 Quartz）
* 支持并发控制：串行/并行/依赖
* 测试环境隔离（如 dev, qa）

---

### 4. **执行引擎核心能力**

* 按配置 JSON 构建执行链，逐步执行
* 异常捕获机制（断点不中断整个流程）
* 支持日志聚合、流程可视化追踪（每一步状态、输入输出）

---

### 5. **测试报告 & 可视化**

* 流程图展示步骤执行状态（成功 ✅ / 失败 ❌）
* 单步骤日志输出（请求、响应、SQL 执行语句等）
* 报告统计：通过率、运行耗时、失败详情

---

## ✅ 四、可扩展设计（你后续一定会用上）

### 插件化执行引擎（推荐 SPI）

你可以定义一个通用接口，例如：

```java
public interface StepExecutor {
    boolean supports(String type); // 支持类型 http/sql/mq/...
    StepResult execute(StepContext context);
}
```

每种类型的步骤，都通过注册插件来扩展。这样你后期加类型（如 Redis、gRPC）也很方便。

---

### 可配置 DSL 示例

你可以支持 JSON/YAML DSL 来定义用例：

```json
[
  {
    "type": "http",
    "name": "登录接口",
    "params": {
      "method": "POST",
      "url": "http://api.xxx.com/login",
      "body": {
        "user": "test",
        "pass": "1234"
      }
    },
    "extract": {
      "token": "$.data.token"
    },
    "assert": {
      "status": 200,
      "$.data.token": "notEmpty"
    }
  },
  {
    "type": "sql",
    "name": "验证登录后数据库状态",
    "params": {
      "sql": "SELECT status FROM users WHERE name='test'"
    },
    "assert": {
      "rows[0].status": "active"
    }
  }
]
```

---

## ✅ 五、数据库设计概要

### 表设计（部分）

| 表名                | 描述                 |
| ----------------- | ------------------ |
| `test_case`       | 用例元数据（名称、类型、描述）    |
| `test_case_steps` | 用例步骤（类型、执行配置 JSON） |
| `test_plan`       | 测试计划（定时、依赖用例）      |
| `test_run`        | 记录每次执行状态、报告、耗时     |
| `test_log`        | 步骤级别执行日志           |

---

## ✅ 六、开发顺序建议（适合你一个人迭代）

### 阶段一：基础平台搭建

* 后端 API + 前端 Vue 页面（创建用例、执行、查看报告）
* 支持最小执行类型（http/sql）
* 流程引擎实现

### 阶段二：引擎能力增强

* 加入变量、提取、断言支持
* 脚本执行、流程分支
* 多步骤依赖

### 阶段三：CI/CD + 报告系统

* 定时调度 / CI webhook 接入
* 流程图式报告、失败追踪、导出

### 阶段四：可视化流程配置器

* 支持拖拽配置步骤（类似 Postman/Newman + Flowable）

---

## ✅ 七、推荐可复用开源组件

| 需求         | 推荐方案                                    |
| ---------- | --------------------------------------- |
| 流程控制图      | `jsplumb`, `Drawflow`, `vue-flow`, `x6` |
| SQL 执行     | Druid + MyBatis                         |
| Dubbo 泛化调用 | Apache Dubbo API 泛化调用 API               |
| 脚本引擎       | Groovy、JSR-223 Nashorn                  |

---

## ✅ 最后建议

你可以把平台设计为：

* **低代码化 + 插件化**：用配置/界面完成 90% 工作，特殊的用脚本/插件解决
* **面向用例数据和流程表达**：核心是让测试用例可以表达业务流程
* **重执行引擎，轻测试框架绑定**：TestNG、JUnit 可以选配，不是主角



# 参考资料

https://github.com/metersphere/metersphere

* any list
{:toc}