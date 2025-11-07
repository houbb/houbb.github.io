---
layout: post
title: NLP平台-03-API KEY 系统设计
date: 2025-11-06 14:12:33 +0800
categories: [Think]
tags: [think, sh]
published: true
---




# chat

## API key

```
建议设计 api_keys 表结构包含 scope / project_id / quota / expire_time 等字段。 

有必要设置这么复杂吗？

我看 deepseek 很多就是直接自动生成一个唯一标识。
```

我们可以从「**不同阶段（MVP → 产品级）」和「**不同业务需求（个人 vs 平台）」两个角度来看。

---

### 💡 一、MVP 阶段（最小可行产品）

如果你现在做的是 **个人项目、Demo、或早期内部使用**，确实没必要设计太复杂。
最简结构只要能唯一标识用户、支持基本鉴权即可，比如：

```sql
CREATE TABLE api_keys (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  api_key VARCHAR(64) UNIQUE NOT NULL,
  user_id BIGINT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

**解释：**

* `api_key` 生成随机唯一值（UUID / hash / snowflake 都行）
* 只需在中间件校验有效性
  ✅ 简单
  ✅ 够用
  ❌ 但无法做访问控制、计费或项目隔离

👉 这就是 DeepSeek、OpenAI、Anthropic 等模型在 **“个人控制台发放 key”** 场景下的做法。

---

### 🧩 二、进阶阶段（平台级设计）

如果你要构建的是一个 **可供他人调用的多租户系统**（比如 NLP 平台、测试平台、监控系统 API 等），那这些字段就非常有意义：

| 字段             | 用途      | 说明                |
| -------------- | ------- | ----------------- |
| `project_id`   | 区分项目空间  | 不同项目隔离 Key，方便权限分层 |
| `scope`        | 权限控制    | 限制某些 Key 只能调用特定接口 |
| `quota`        | 调用额度    | 用于限流、计费、流量监控      |
| `expire_time`  | 有效期控制   | 临时 Key、周期刷新       |
| `status`       | 启用/禁用状态 | 防止泄露后立即封禁         |
| `last_used_at` | 最近使用时间  | 方便清理、审计、安全追踪      |

一个比较成熟的表结构可以这样设计：

```sql
CREATE TABLE api_keys (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  api_key VARCHAR(64) UNIQUE NOT NULL,
  user_id BIGINT NOT NULL,
  project_id BIGINT DEFAULT NULL,
  scope VARCHAR(255) DEFAULT NULL,
  quota INT DEFAULT NULL,
  used_count INT DEFAULT 0,
  expire_time DATETIME DEFAULT NULL,
  status ENUM('active', 'disabled', 'expired') DEFAULT 'active',
  last_used_at DATETIME DEFAULT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

---

### 🧠 三、为什么像 DeepSeek 只要一个 key 就行？

因为：

* 它 **后端做了统一的限流、计费、风控**，而不是在表结构上直接体现；
* 它的 Key 多半与「账号计费系统」直接绑定；
* 每个用户通常就一个 Key，不需要 project 级隔离；
* 商业上，它们内部通过其他系统追踪用量，不一定直接在 `api_keys` 表体现。

换句话说：

> “简单表结构” ≠ “简单系统”。
> DeepSeek 看起来只有一个 key，但背后可能接了几层用户中心、计费中心、风控系统。

---

### ✅ 总结建议

| 场景                | 建议                                         |
| ----------------- | ------------------------------------------ |
| 个人项目 / MVP        | 只保留 `api_key` + `user_id` 即可               |
| 企业内部系统            | 加上 `expire_time`、`status`、`last_used_at`   |
| SaaS 平台 / 面向外部开发者 | 强烈建议加入 `scope`、`project_id`、`quota`，方便后续扩展 |


## MVP

```
给出简化版本的 api key 管理的功能点+交互+设计方案，不需要具体的代码实现
```

**MVP 阶段的 API Key 管理模块简化设计方案**，不涉及具体代码，但完整覆盖了功能点、前后端交互逻辑和设计思路。

## 🧩 一、功能目标

为平台用户提供一个简单的 API Key 管理界面，使用户能够：

1. **查看** 自己的 API Key
2. **生成**（首次创建）一个新的 Key
3. **重置**（废弃旧的、生成新的）API Key
4. **复制** Key 方便调用接口
5. **（可选）校验有效性**（用于测试）

---

## ⚙️ 二、系统角色与交互概览

| 角色   | 行为                   | 说明            |
| ---- | -------------------- | ------------- |
| 用户   | 查看/生成/重置 API Key     | 用户只能操作自己的 key |
| 系统后端 | 生成唯一 Key、保存数据库、验证合法性 | 负责安全和唯一性      |
| 前端   | 展示 Key、提供操作入口、调用接口   | 交互简洁为主        |

---

## 🧱 三、主要功能点设计

### 1️⃣ 查看 API Key

* **触发场景**：用户进入「个人中心」→「API Key 管理」页面。
* **前端行为**：请求 `/api/apikey/my`
* **后端逻辑**：

  * 若数据库存在该用户的 key → 返回 key 信息
  * 若不存在 → 自动创建一个新的 key 并返回
* **展示内容**：

  * Key 值（中间打码，如 `ab12****7890`）
  * 创建时间
  * 最近使用时间（可选）

---

### 2️⃣ 生成 / 重置 API Key

* **触发场景**：用户点击「重置 API Key」按钮
* **前端行为**：

  * 弹出确认框：“重置后旧 Key 将立即失效，确定继续吗？”
  * 确认后调用 `/api/apikey/reset`
* **后端逻辑**：

  * 生成新 key，替换旧记录（或插入新记录）
  * 返回新 key
* **安全策略**：

  * 新 key 生效，旧 key 同步失效
  * 旧 key 立即无法调用任何接口

---

### 3️⃣ 复制 Key

* **前端行为**：点击「复制」按钮，将 key 复制到剪贴板
* **用户体验**：

  * 弹出提示 “复制成功 ✅”
  * 视觉上展示 key 内容（支持打码 / 全显切换）

---

### 4️⃣ Key 校验（可选功能）

* **触发场景**：用户点击 “测试 Key 是否有效”
* **前端行为**：调用 `/api/apikey/validate?key=xxx`
* **后端逻辑**：

  * 检查数据库是否存在、状态是否有效
  * 更新 `last_used_at` 时间
* **结果展示**：

  * 有效 ✅ / 无效 ❌

---

## 🧭 四、前后端交互流程（简图）

```
用户打开“API Key 管理”页面
          ↓
前端调用 GET /api/apikey/my
          ↓
后端查询数据库：
    - 有 → 返回 { apiKey, createdAt, lastUsedAt }
    - 无 → 自动生成并返回新 key
          ↓
前端显示 Key + “复制”按钮 + “重置”按钮
          ↓
用户点击“重置”
          ↓
前端调用 POST /api/apikey/reset
          ↓
后端生成新 key、替换旧 key
          ↓
前端更新显示新 key
```

---

## 🧩 五、前端界面布局（Vue 思路）

**布局建议：**

* 模块位置：用户中心 → “API Key 管理”
* 风格简洁，功能一目了然

**页面结构草图：**

```
--------------------------------------
|          API Key 管理              |
--------------------------------------
| 我的 API Key      [复制] [重置]     |
| ab12****89ef                        |
|------------------------------------|
| 创建时间：2025-11-07               |
| 最近使用：2025-11-06               |
--------------------------------------
| [测试 Key 是否有效]                |
--------------------------------------
```

**交互建议：**

* 打码显示（默认隐藏中间几位）
* “复制”/“显示完整”操作有轻提示
* 重置操作需二次确认（防误触）

---

## 🔐 六、安全与设计要点

| 项目     | 说明                                      |
| ------ | --------------------------------------- |
| Key 生成 | UUID / 随机 32~64 位字符串                    |
| 唯一性    | 数据库唯一索引                                 |
| 存储     | 明文可行（MVP），后期可哈希存储                       |
| 权限     | 每个用户仅能查看/管理自己的 Key                      |
| 失效机制   | 重置时旧 Key 自动失效                           |
| 统计扩展   | 后续可加 `last_used_at`、`request_count` 等字段 |

---

## ✅ 七、MVP 版本的目标状态

| 模块            | 状态           |
| ------------- | ------------ |
| API Key 查看/生成 | ✅ 已实现        |
| 重置 Key        | ✅ 已实现        |
| 复制 Key        | ✅ 已实现        |
| 校验 Key        | ⚙️ 可选        |
| 权限控制          | ✅ 用户隔离       |
| 后台管理          | ❌ 暂不需要（后期扩展） |


# 参考资料

* any list
{:toc}