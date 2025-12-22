---
layout: post
title: AI SDD 开发规范-08-阿里淘宝的 AI 编程最佳实现
date: 2025-11-20 14:12:33 +0800
categories: [AI]
tags: [ai, sdd, sh]
published: true
---

# SDD 的优缺点

## SDD带来的改进

### 一致性显著提升

代码层面：

- 所有代码都严格遵循规格说明，消除了理解偏差

- 不同开发者实现相同规格，代码风格完全一致

- 代码变更时，必须先更新规格，保证文档与代码同步

业务层面：

产品、开发、测试对需求的理解高度一致

减少了需求理解偏差导致的返工

### 可测试性大幅提升

测试覆盖：

自动生成的测试用例覆盖了所有正常和异常流程

测试用例与规格说明一一对应，确保完整性

边界条件和异常场景都有明确的测试用例

测试质量：

Mock方式规范统一，符合项目最佳实践

断言准确全面，不会遗漏关键验证点

测试代码可读性好，易于维护

### 可维护性显著改善

文档永不过期：

规格说明就是最准确的文档

任何变更都先更新规格，再同步代码

新人通过阅读规格说明就能快速理解功能

变更影响分析：

修改规格时，清晰知道影响哪些代码模块

依赖关系在规格中明确定义

重构时可以基于规格验证正确性

代码可读性：

代码结构清晰，层次分明

注释完整准确，与规格保持一致

命名规范统一，易于理解

### 团队协作效率提升

新人通过阅读规格说明快速上手

跨团队协作时，规格成为统一语言

历史需求回溯更容易，规格即完整记录

## SDD的问题与挑战

虽然SDD带来了价值，但在实践中也遇到了一些明显的问题：

### 问题1：规格编写门槛高

现象： 编写高质量的规格说明需要较强的抽象能力和文档编写能力
新手往往写不好规格，过于技术化或过于模糊
规格模板虽然有，但如何填写仍需要经验
不合格的规格对后面的代码实现影响
影响： 对于简单需求，写规格的时间甚至超过直接写代码

### 问题2：Spec Kit工具链不成熟

遇到的具体问题：
规格解析不准确
AI有时无法正确理解规格中的复杂逻辑
需要用非常精确的语言描述，稍有歧义就可能理解错误
代码生成质量不稳定
相同的规格，不同时间生成的代码质量差异大
有时生成的代码过于冗长，有时又过于简化
增量更新困难
规格修改后，很难做到只更新变化的部分
往往需要重新生成整个文件，导致手工修改的部分丢失

### 问题3：与现有代码库集成困难

现象： 我们的代码库已经有大量历史代码，SDD更适合从零开始的新项目

历史代码缺乏规格说明，无法纳入SDD体系

新老代码风格混杂，维护成本反而增加

团队一部分人用SDD，一部分人用传统方式，协作困难

### 问题4：学习成本高

数据：

写出合格的第一份规格说明，平均需要3-5次迭代

老员工接受度较低，认为"还不如直接写代码快"

## SDD适用场景分析

经过3个月的实践，我们总结出SDD的适用场景：

适合使用SDD：

✅ 全新的项目或模块

✅ 核心业务逻辑，需要长期维护

✅ 复杂度高，需要详细设计的功能

✅ 多人协作的大型需求

✅ 对质量要求极高的场景


不适合使用SDD：

❌ 简单的工具函数或配置修改

❌ 快速验证的实验性功能

❌ 一次性的临时需求

❌ 对现有代码的小修改

# 当前最佳实践 - Rules + Agentic Coding + AI文档汇总

## 融合各阶段优势

核心思路：

用Rules约束AI

用技术方案指导实现

用Agentic Coding快速迭代

用AI汇总文档保持同步

## 技术方案模板优化

我们优化了技术方案模板，更加轻量级：

```
# [需求名称]-技术方案
## 业务定义
[简要描述业务背景和目标，1-2句话]
## 业务领域对象
[如果需要新增/修改BO或DTO，在此说明]
## 模块领域对象
[需要新增/修改的VO对象]
| 对象含义 | 实现方案 | 属性及类型 |
|---------|---------|-----------|
| [对象名] | 新增/修改 | 1. 字段1：类型 - 说明<br>2. 字段2：类型 - 说明 |
## 数据服务层
[需要新增/修改的数据服务]
| 数据服务定义 | 实现方案 | execute逻辑 |
|------------|---------|-----------|
| [服务名] | 新增/复用 | 1. 步骤1<br>2. 步骤2 |
## 模块构建器
[需要新增/修改的模块构建器]
| 模块构建器定义 | 实现方案 | doBuild逻辑 |
|--------------|---------|-------------|
| [构建器名] | 新增/修改 | 1. 获取数据<br>2. 处理逻辑<br>3. 构建VO |
特点：
比SDD规格更轻量，编写时间从2小时降低到30分钟
比纯Agentic Coding更规范，有明确的结构约束
聚焦于"做什么"，而非"怎么做"（实现细节交给AI）
```

## AI文档汇总机制

即：让AI自动维护"整体架构与业务逻辑文档"

### 文档汇总流程

```
完成需求开发 → 提交AI："将本次代码逻辑汇总到汇总文档" → AI分析代码 → AI更新文档
```

Prompt示例：

```
我刚完成了NN红包模块的开发，请分析以下代码：
- NnRedPacketDataService.java
- NnRedPacketModuleBuilder.java
- NnRedPacketVO.java
然后将其业务逻辑汇总到"NN业务整体架构与逻辑文档.md"中，确保：
1. 描述模块的核心功能和业务价值
2. 说明数据流转过程
3. 列出关键的业务规则和判断逻辑
4. 保持与现有文档的风格一致
```

### 架构文档结构

```
# NN业务整体架构与逻辑文档
## 一、业务概述
[业务背景、目标、核心价值]
## 二、整体架构
### 2.1 技术架构
[分层架构图、技术栈]
### 2.2 模块组成
[各个模块的功能和关系]
## 三、核心模块详解
### 3.1 NN Feeds模块
#### 3.1.1 功能说明
[模块的核心功能]
#### 3.1.2 数据流转
[数据从哪里来，经过哪些处理，最终输出什么]
#### 3.1.3 关键逻辑
[重要的业务规则、计算逻辑、判断条件]
#### 3.1.4 代码位置
[对应的类和方法]
### 3.2 NN红包模块
[类似结构]
### 3.3 NN吊钩层模块
[类似结构]
## 四、数据服务层
[各个数据服务的功能和依赖]
## 五、关键流程
[重要的业务流程时序图]
## 六、配置说明
[配置项说明]
## 七、扩展点
[未来可能的扩展方向]
```

###  AI汇总效果示例

```
AI生成的文档片段：
### 3.2 NN红包模块
#### 3.2.1 功能说明
NN红包模块用于在NN频道页面展示用户可用的红包列表，帮助用户了解可以使用的优惠，提升转化率。
#### 3.2.2 数据流转
用户请求 → NnRedPacketDataService 
         → 调用FpProvider查询用户红包
         → 过滤可用红包（状态=2，未过期，门槛<=20元）
         → 返回红包列表
         ↓
NnRedPacketModuleBuilder
         → 获取红包数据
         → 红包排序（NN专属优先，门槛从小到大）
         → 构建NnRedPacketVO
         → 返回前端
#### 3.2.3 关键逻辑
**1. 红包过滤规则**
```java
// 只展示满足以下条件的红包：
// 1. 状态为可使用（payStatus = 2）
// 2. 未过期（当前时间在startTime和endTime之间）
// 3. 门槛 <= 配置的amountThreshold（默认20元）
if (fund.getPayStatus() != 2) return false;
if (fund.getStartTime() > now || now > fund.getEndTime()) return false;
if (fund.getAmountThreshold() > amountThreshold) return false;
**2. 红包排序规则**
```java
// 排序规则：
// 1. NN专属红包（配置的nnRedPacketPoolIds）优先
// 2. 其次按门槛从小到大排序
funds.stream()
    .sorted(Comparator
        .comparing(fund -> nnPoolIds.contains(fund.getFromFundId()) ? 0 : 1)
        .thenComparing(FundQueryDTO::getAmountThreshold))
**3. 总金额计算**
```java
// 计算所有可用红包的金额总和
String totalAmount = funds.stream()
    .map(FundQueryDTO::getAvailableAmount)
    .reduce(0L, Long::sum)
    .map(PriceUtils::getPriceFenToYuan)
    .orElse("0.00");
#### 3.2.4 代码位置
- 数据服务：`NnRedPacketDataService`
  - 位置：`dataservice/impl/nn/NnRedPacketDataService.java`
  - 核心方法：`execute(InvocationContext, JSONObject)`
- 模块构建器：`NnRedPacketModuleBuilder`
  - 位置：`module/nn/NnRedPacketModuleBuilder.java`
  - 核心方法：`doBuild(InvocationContext)`、`sortFunds(List<FundQueryDTO>)`
- 模块VO：`NnRedPacketVO`
  - 位置：`domain/module/nn/NnRedPacketVO.java`
#### 3.2.5 配置项

```json
{
  "nnRedPacketPoolIds": "1001,1002,1003",  // NN专属红包池ID
  "amountThreshold": 2000,                  // 红包门槛上限（分）
  "expandText": "展开查看更多"              // 展开文案
}
```

# 参考资料

[淘宝](https://mp.weixin.qq.com/s?__biz=MzAxNDEwNjk5OQ==&mid=2650542043&idx=1&sn=2da4173e8fc94e55f31ffd01f4f8f67a&chksm=82aea0a784dd9ef21d4d22e2fc382ae358228a1289f13854bc30d6c66fd67e8015d97ae2a0c0&mpshare=1&scene=1&srcid=122119vbY1El6izIit9nwjQe&sharer_shareinfo=7a5c59e9e93c09ae4f72302fff40ca1b&sharer_shareinfo_first=b990bae068a00c4ff27eedcc6a983cd7#rd)

* any list
{:toc}