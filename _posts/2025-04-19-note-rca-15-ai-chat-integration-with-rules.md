---
layout: post
title: RCA 根因分析推断-15-AI 推断如何与专家规则算法整合
date: 2025-4-19 14:31:52 +0800
categories: [Note]
tags: [note, rca, ai, devops, alarm, sh]
published: true
---

# 背景

系统已经打造了一款基于专家算法规则的RCA根因分析策略。

算法规则很快，每次大面积异常时，基本可以秒级推断获得结果。

但是算法的信息不够人性化，所以希望结合 AI 大模型，将异常的 cmdb/Trace 关系，报警信息+变更事件+指标+日志上下文丢给大模型分析，但是这个过程非常慢。

所以每次页面请求专家算法推断之后，希望异步调用AI解析。后续如果解析完成，可以查库填充相关信息。

问题：AI 分析的特别慢，一般5分钟以上，如何避免重复解析？给一套完整的解决方案

技术选型：后端 java(springboot) + mysql 数据库

# chat

## 基本方案

明白，你的场景是：**专家规则算法秒级响应，但是 AI 模型分析慢（5 分钟以上）**，你希望异步调用 AI 分析，并且避免重复解析。

下面我帮你梳理一套完整、可落地的方案。

---

## 1️⃣ 核心思路

1. **秒级响应**：前端请求直接调用专家算法规则，立即返回 RCA 初步结果。
2. **异步 AI 分析**：

   * 提交任务给后台异步队列（任务ID + 数据）
   * 后台调用 AI 模型解析
   * AI 解析结果落库
3. **去重策略**：

   * 对同一异常事件生成唯一标识（hash 或 UUID）
   * 查询数据库，如果已有解析记录且状态完成，则直接返回
4. **前端展示策略**：

   * 初次返回专家规则结果
   * 页面轮询/推送（WebSocket / SSE）获取 AI 分析状态
   * AI 分析完成后填充界面

---

## 2️⃣ 数据库设计示例（MySQL）

```sql
CREATE TABLE rca_ai_analysis (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    incident_id VARCHAR(128) NOT NULL, -- 异常事件唯一标识
    status ENUM('PENDING','PROCESSING','DONE','FAILED') NOT NULL DEFAULT 'PENDING',
    input_data JSON NOT NULL,           -- cmdb/trace/日志/指标/报警上下文
    result_data JSON,                   -- AI 解析结果
    create_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    update_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY uk_incident (incident_id) -- 避免重复解析
);
```

* `status` 表示 AI 分析状态
* `input_data` 保存传给 AI 的上下文
* `result_data` 保存 AI 返回的结构化结果
* `incident_id` 保证同一异常只解析一次

---

## 3️⃣ 后端 Java(SpringBoot) 异步处理方案

### 3.1 使用队列异步处理

推荐使用 **Spring Boot + RabbitMQ / Kafka / 内存队列**：

```java
@Service
public class RcaAiService {

    @Autowired
    private RcaAiRepository repository;

    @Async
    public void submitAiAnalysis(String incidentId, String inputDataJson) {
        // 先写入数据库，状态为 PENDING
        RcaAiEntity entity = new RcaAiEntity();
        entity.setIncidentId(incidentId);
        entity.setStatus("PENDING");
        entity.setInputData(inputDataJson);
        try {
            repository.save(entity);
        } catch (DataIntegrityViolationException e) {
            // 已存在，直接跳过重复提交
            return;
        }

        // 异步执行
        processAiAnalysis(entity);
    }

    @Async
    public void processAiAnalysis(RcaAiEntity entity) {
        entity.setStatus("PROCESSING");
        repository.save(entity);

        try {
            String result = callAiModel(entity.getInputData());
            entity.setResultData(result);
            entity.setStatus("DONE");
        } catch (Exception e) {
            entity.setStatus("FAILED");
        } finally {
            repository.save(entity);
        }
    }

    private String callAiModel(String inputDataJson) {
        // 调用外部慢速 AI 模型接口，可能 5 分钟以上
        // 返回 JSON 结果
    }
}
```

* 利用 `@Async` 或消息队列异步执行
* `DataIntegrityViolationException` 避免重复解析
* 记录状态，便于前端查询

---

### 3.2 前端轮询 / 推送

1. **轮询**：

```javascript
async function fetchAiResult(incidentId) {
    const res = await fetch(`/rca/ai-result/${incidentId}`);
    const data = await res.json();
    if(data.status !== 'DONE') {
        setTimeout(() => fetchAiResult(incidentId), 5000);
    } else {
        updateUiWithAiResult(data.result);
    }
}
```

2. **WebSocket/SSE 推送**（推荐）：

   * 当 AI 分析完成时，服务端推送消息到前端，前端直接填充界面
   * 减少轮询压力

---

## 4️⃣ 避免重复解析策略

1. **唯一键去重**：

   * 数据库表 `incident_id` 唯一约束
   * 第一次提交解析，如果重复提交直接跳过
2. **缓存优化**：

   * 可以用 Redis 缓存 `incidentId -> status`，避免每次查询数据库
3. **幂等操作**：

   * AI 任务提交操作设计为幂等，不会重复触发模型调用

---

## 5️⃣ 异常容错与超时

* AI 分析超时 → 标记 `FAILED`，可重新触发
* 可以设置任务最大执行时间（例如 10 分钟），超过自动失败
* 日志记录 AI 异常，便于运维

---

## 6️⃣ 流程总结图（文字版）

```
前端请求
    ↓
专家算法推断（秒级返回）
    ↓
异步提交 AI 解析任务
    ↓
数据库记录状态 PENDING → PROCESSING
    ↓
AI 分析完成 → 更新数据库 DONE
    ↓
前端轮询/推送获取结果 → 更新 UI
```

---

✅ **关键点总结**：

1. 专家算法秒级返回，保证用户体验。
2. AI 分析异步执行，避免阻塞。
3. 数据库唯一键 + 状态字段 + 幂等提交，避免重复解析。
4. 前端轮询或 WebSocket/SSE 获取 AI 结果。
5. 可扩展为分布式队列 + 多 AI worker，提高吞吐。

# 参考资料


* any list
{:toc}