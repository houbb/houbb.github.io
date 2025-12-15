---
layout: post
title: 成熟企业级技术平台-10-数据脱敏平台
date: 2025-12-09 21:01:55 +0800
categories: MVE]
tags: [mve, sh]
published: true
---

# 概览

[UMS 平台](https://houbb.github.io/2025/12/09/road-map-010-id-01-UMS)

[PASSPORT 平台](https://houbb.github.io/2025/12/09/road-map-010-id-02-passport)

[SSO 平台](https://houbb.github.io/2025/12/09/road-map-010-id-03-SSO)

[PERMISSION 平台](https://houbb.github.io/2025/12/09/road-map-010-id-04-PERMISSION)

[应用管理](https://houbb.github.io/2025/12/09/road-map-010-id-05-app-manage)

[审计中心](https://houbb.github.io/2025/12/09/road-map-010-id-06-audit)

[IGA（Identity Governance & Administration，身份治理与管理）平台](https://houbb.github.io/2025/12/09/road-map-010-id-07-IGA)

[跳板机 / 堡垒机（Jump Server / Bastion Host）](https://houbb.github.io/2025/12/09/road-map-010-id-08-jump-server)

---

[统一的特权访问控制平台（Privileged Access Management / PAM）](https://houbb.github.io/2025/12/09/road-map-09-boastin-host-plateform)

[KMSS（Key Management & Security Service）](https://houbb.github.io/2025/12/09/road-map-09-security-KMSS)

[安全平台 security plateform](https://houbb.github.io/2025/12/09/road-map-09-security-plateform)

[数据脱敏平台 Data Masking / Data Protection Platform](https://houbb.github.io/2025/12/09/road-map-09-sensitive-plateform)

# 相关开源项目

可以参考一下老马开源的项目：

敏感词核心库: https://github.com/houbb/sensitive-word

敏感词控台：https://github.com/houbb/sensitive-word-admin

日志脱敏：https://github.com/houbb/sensitive

加密工具：https://github.com/houbb/encryption-local

# 数据脱敏平台

以下内容对“数据脱敏平台（Data Masking / Data Protection Platform）”进行系统化、专业化、可落地的全景展开。内容包含平台定位、架构、核心能力、脱敏算法、策略体系、流程链路、产品模块、治理方法、落地 roadmap 等，风格对齐企业级安全平台设计标准。

---

# 一、平台定位（Positioning）

数据脱敏平台是企业数据安全体系的重要支柱，用于在数据使用全生命周期中实现：

* 数据最小可见原则（Least Visibility）
* 防止数据泄露（Data Leakage Prevention）
* 防止敏感信息滥用（Misuse Prevention）
* 支持开发、测试、分析、外包等多场景下的数据可控使用

核心目标：

1. 识别企业各类敏感数据（自动识别 + 人工标注）
2. 基于策略对敏感数据进行脱敏、伪造、置换、加密
3. 支持不同环境、不同角色查看不同形态的数据
4. 支持全链路脱敏：离线数据、实时数据、接口响应
5. 数据可用性与安全性平衡

---

# 二、平台总体架构（Top-Level Architecture）

```
数据脱敏平台（Data Masking Platform）
├── 数据识别中心（Sensitive Data Discovery）
│   ├── 规则识别（Regex）
│   ├── 模式识别（Pattern）
│   ├── AI/LLM 语义识别（Semantic Detection）
│   ├── 数据血缘与扫描引擎
│
├── 脱敏策略中心（Policy Center）
│   ├── 静态脱敏策略（批处理）
│   ├── 动态脱敏策略（实时）
│   ├── 角色/环境级策略（RBAC/ABAC）
│   ├── 场景策略（开发、测试、分析、外包）
│
├── 脱敏引擎（Masking Engine）
│   ├── 静态脱敏引擎（离线）
│   ├── 动态脱敏引擎（API/Gateway）
│   ├── 字段级脱敏算法库
│   ├── 高级伪造算法（平衡可用性）
│
├── 安全网关（Data Gateway）
│   ├── 接口动态脱敏
│   ├── BI/报表脱敏
│   ├── SQL 解析脱敏（SQL Proxy）
│
└── 管理与治理（Governance Layer）
    ├── 脱敏策略管理
    ├── 敏感数据目录
    ├── 审计（Audit）
    ├── 风险告警
    ├── 合规支持（GDPR、PIPL）
```

---

# 三、核心能力（Core Capabilities）

## 1. 敏感数据识别（Discovery）

支持数据库、对象存储、文件系统、日志等数据源扫描。

类型：

* 结构化数据：MySQL / PostgreSQL / Oracle / SQLServer
* 半结构化：JSON、Kafka、MQ
* 非结构化：表格、文档（OCR）

识别能力：

* 基于正则（身份证号、电话、邮箱、车牌号等）
* 基于规则（字段名、元数据）
* 基于 AI/LLM（语义识别“用户行为日志中的手机号”）
* 基于样本（检测无结构文本中的 PII）

可生成：

* 敏感数据资产地图
* 敏感字段级标签
* 数据血缘（Downstream/Upstream）

---

## 2. 脱敏策略体系（Policy System）

策略来自三类要素：

```
环境（Env） × 角色（Role） × 数据分类（Class）
```

策略形式：

* 全局策略（如：手机号对所有测试环境脱敏）
* 角色策略（如：开发只能访问 mask 后字段）
* 源系统策略（如：CRM 生产库严禁查看完整手机号）
* 行为策略（如：批量导出自动脱敏）

策略 DSL（示例）：

```
if env in ["dev", "test"] and data.class == "ID_CARD" then MASK_FULL
if role == "analyst" and data.class == "PHONE" then MASK_MID
if action == "export" and data.class in ["PHONE","ADDRESS"] then MASK_STRONG
```

支持策略生效链：

* 先静态再动态
* 先全局再业务策略
* 先强制再可选策略

---

## 3. 脱敏算法（Masking Algorithms）

常用算法分类如下：

### （1）遮盖类 Masking

* `mask_full()` 全遮盖
  示例：张三 → **
* `mask_mid()` 中间遮盖
  示例：138****5678

### （2）置换类 Substitution

* 字典置换（姓名、地址按规则替换）
* 保持值格式不变
  示例：北京 → 上海（同类型字段）

### （3）哈希类 Hash

* 单向不可逆（SHA256/SM3）
* 保持统计特性，用于聚合分析

### （4）加密类 Encrypt

* 可逆加密（AES/RSA/国密 SM4）
* 用于有解密需求的场景

### （5）伪造类 Synthetic Data

* 基于生成模型（生成合规范围内的假数据）
* 保持数据分布
* 用于测试数据集、模型训练

### （6）格式保留加密（FPE）

* 敏感数据长度不变（如手机号 11 位）
* 适用于有格式校验的旧系统

---

## 4. 静态脱敏（Static Masking）

主要用于：

* 测试数据库构建
* 跨部门共享数据
* 数据湖脱敏副本

流程：

```
原始库 → 识别 → 标签 → 脱敏 → 脱敏库（Test/Analytics）
```

特征：

* 批处理、离线
* 数据落地后不再包含敏感信息
* 支持 TB~PB 级脱敏任务（分布式调度）

---

## 5. 动态脱敏（Dynamic Masking）

适用于实时场景：

* 后台管理系统查看用户列表
* 外包人员查询数据
* API 响应自动脱敏
* BI 报表脱敏

逻辑：

```
请求 → 安全网关 → 解析 SQL 或 JSON → 根据策略替换字段 → 返回数据
```

三种模式：

### （1）API Gateway 动态脱敏（最通用）

* 对 REST/GraphQL 响应进行 JSON 字段级脱敏
* 接入最简单，不影响数据库层

### （2）SQL Proxy 动态脱敏

* 拦截 SQL → 解析字段 → 将 SELECT phone 转换为 SELECT mask(phone)

### （3）BI/报表动态脱敏

* 中间层数据集脱敏
* 快速适配 Tableau、PowerBI 等

---

# 四、平台产品模块（Product Modules）

```
产品模块
├── 1. 敏感数据识别中心
├── 2. 脱敏策略中心
├── 3. 字段分类与标签中心
├── 4. 脱敏算法管理
├── 5. 静态脱敏任务系统
├── 6. 动态脱敏网关
├── 7. SQL Proxy / API Adapter
├── 8. 数据使用审计（Audit）
├── 9. 报表与治理（Dashboard）
└── 10. 风险/合规告警（Alert & Compliance）
```

---

# 五、数据脱敏平台与其他系统关系

```
UMS（用户中心）      → 提供用户信息用于策略匹配（角色）
IAM（权限中心）      → ABAC 动态属性用于脱敏决策
审计中心（Audit）    → 接收脱敏使用记录和违规访问告警
安全平台（风控）      → 高风险用户访问自动加强脱敏
KMSS（密钥管理）     → 提供加密/解密密钥
```

---

# 六、关键治理（Governance）

五类核心治理机制：

1. **敏感数据分类分级（Classifying）**

   * P0：需强脱敏（身份证、银行卡号）
   * P1：中度脱敏（手机号、地址）
   * P2：轻度脱敏（订单号）
   * P3：非敏感（普通业务字段）

2. **权限 + 脱敏协同治理**

   * IAM 负责“是否可以访问”
   * 脱敏平台负责“访问到什么级别数据”

3. **异常访问告警**

   * 开发/测试环境访问原始数据直接告警
   * 后台批量导出敏感数据告警

4. **使用审计**

   * 记录谁访问了哪些敏感字段
   * 索引可回溯

5. **合规框架对齐**

   * GDPR
   * 中国个人信息保护法（PIPL）
   * ISO 27001

---

# 七、Data Masking 流程链路（Pipeline）

```
Step 1: 数据源扫描
Step 2: 识别敏感字段
Step 3: 自动打标签
Step 4: 配置策略
Step 5: 选择脱敏算法
Step 6: 执行静态脱敏 / 动态脱敏
Step 7: 审计记录
Step 8: 风险告警
Step 9: 报表治理
```

---

# 八、落地 Roadmap（1 年实施路线）

## Phase 1：建设基础能力（0～2 月）

* 敏感数据识别
* 字段标签体系
* 静态脱敏引擎

## Phase 2：接入核心系统（3～5 月）

* OpenAPI
* CRM
* 营销系统
* 用户后台系统

## Phase 3：动态脱敏上线（6～8 月）

* API Gateway 动态脱敏
* SQL Proxy 动态脱敏
* 与 IAM + 风控联动

## Phase 4：全面治理（9～12 月）

* 数据资产盘点
* 脱敏策略体系完善
* 审计和告警全量接入
* 合规体系建设

---

# 九、总结（可作为官方简介版）

数据脱敏平台是确保企业数据安全的关键基础设施，通过“识别—分类—策略—脱敏—审计”五位一体的体系，实现：

* 敏感数据的自动识别
* 灵活的脱敏策略编排
* 静态与动态脱敏双引擎
* 多场景适配（测试、BI、外包、API、批量导出）
* 全链路审计和告警
* 与 IAM、风控、审计中心协同

使企业在保证数据使用价值的前提下，实现数据最小可见和按需可控。

* any list
{:toc}