---
layout: post
title:  聊一聊如何进行防重复提交？
date:  2018-09-14 12:02:42 +0800
categories: [Web]
tags: [web, java, web-safe, in-action, sh]
published: true
---

# 限流系列

[01-面试官：你们项目中是怎么做防重复提交的？](https://houbb.github.io/2018/09/14/avoid-repeated-submit-01-interview)

[02-java 表单避免重复提交 resubmit 开源项目介绍](https://houbb.github.io/2018/09/14/avoid-repeated-submit-02-open-source-intro)

[03-idempotent 幂等性介绍+如何防止重复提交？](https://houbb.github.io/2018/09/14/avoid-repeated-submit-03-idempotent)

[04-简单聊一聊防重复提交](https://houbb.github.io/2018/09/14/avoid-repeated-submit-04-chat)

## 开源矩阵

下面是一些从防止重复提交相关，整个系列的开源矩阵规划。

截止目前，整体进度如下：

| 名称 | 介绍 | 状态  |
|:---|:---|:----|
| [resubmit](https://github.com/houbb/resubmit) | 防止重复提交核心库 | 已开源 |
| [rate-limit](https://github.com/houbb/rate-limit) | 限流核心库 | 已开源 |
| [cache](https://github.com/houbb/cache) | 手写渐进式 redis | 已开源 |
| [lock](https://github.com/houbb/lock) | 开箱即用的分布式锁 | 已开源 |
| [common-cache](https://github.com/houbb/common-cache) | 通用缓存标准定义 | 研发中 |
| [redis-config](https://github.com/houbb/redis-config) | 兼容各种常见的 redis 配置模式 | 研发中 |
| [quota-server](https://github.com/houbb/quota-server) | 限额限次核心服务 | 待开始 |
| [quota-admin](https://github.com/houbb/quota-admin) | 限额限次控台 | 待开始 |
| [flow-control-server](https://github.com/houbb/flow-control-server) | 流控核心服务 | 待开始 |
| [flow-control-admin](https://github.com/houbb/flow-control-admin) | 流控控台 | 待开始 |

# 防重复提交的全面解决方案

防重复提交是Web开发中确保数据一致性和系统稳定性的重要机制。

以下是结合多种技术手段和场景分析的详细解决方案：

## 一、常见重复提交场景
1. 用户操作类  
   - 多次点击提交按钮（网络延迟导致用户误操作）  
   - 使用浏览器后退或刷新按钮重复提交（如F5刷新、历史记录回退）  
2. 网络问题  
   - 请求未及时响应，用户重复触发提交  
3. 恶意行为  
   - 自动化工具或脚本发起高频重复请求  

## 二、前端防重复提交技术
1. 禁用提交按钮  
   - 实现：通过JavaScript在点击后禁用按钮，或添加加载状态提示。  
   - 代码示例：  
     ```javascript
     document.getElementById("submit-btn").addEventListener("click", function() {
       this.disabled = true;
       this.textContent = "提交中...";
     });  
     ```
  
   - 优点：简单易实现，即时反馈用户体验。  
   - 缺点：依赖JavaScript，禁用后可能无法恢复，需结合后端验证。  

2. 防抖（Debounce）与节流（Throttle）  
   - 防抖：延迟执行提交操作，若在等待期内再次触发则重置计时（例如设置500ms延迟）。  
   - 节流：固定时间内仅允许一次提交（如1秒内仅触发一次）。  
   - 适用场景：高频操作（如搜索框输入、抢购按钮）。  

3. 视觉反馈与浮层  
   - 提交后显示加载动画或遮罩层，阻止用户继续操作。  


## 三、后端防重复提交技术
1. Token验证机制  
   - 实现步骤：  
1. 生成唯一Token（如UUID）并存储在Session或Redis中。  
2. 将Token嵌入表单隐藏域或HTTP请求头。  
3. 提交时校验Token有效性，若匹配则处理请求并清除Token，否则拒绝。  
   - 代码示例（Java）：  
     ```java
     // 生成Token并存储到Session
     String token = UUID.randomUUID().toString();
     request.getSession().setAttribute("formToken", token);  
     // 表单中嵌入Token
     <input type="hidden" name="token" value="${token}">  
     // 后端验证
     if (!sessionToken.equals(request.getParameter("token"))) {
         throw new RepeatSubmitException();  
     }  
     ```
  
   - 优点：有效防止重复提交和CSRF攻击。  
   - 缺点：需维护Token状态，分布式环境下需依赖Redis等中间件。  

2. Post/Redirect/Get（PRG）模式  
   - 实现：表单提交后重定向至结果页，避免刷新导致重复提交。  
   - 适用场景：普通表单提交，但对异步请求不友好。  

3. 幂等性设计  
   - 原理：确保同一请求多次执行结果一致（如GET请求天然幂等）。  
   - 实现方式：  
- 使用唯一业务标识（如订单号）结合数据库唯一索引。  
- 分布式锁（如Redis的SETNX指令）控制并发。  



## 四、数据库层防重复策略
1. 唯一索引/约束  
   - 实现：为关键字段（如订单号、用户ID）添加唯一索引，插入重复数据时触发异常。  
   - 示例（MySQL）：  
     ```sql
     ALTER TABLE orders ADD UNIQUE INDEX idx_order_no (order_no);  
     ```
  
   - 优点：数据强一致性，最终防线。  
   - 缺点：索引影响写入性能，需结合业务逻辑处理异常。  

2. 乐观锁  
   - 实现：通过版本号或时间戳字段控制更新，仅当版本匹配时执行操作。  
   - 示例：  
     ```sql
     UPDATE products SET stock = stock - 1, version = version + 1 
     WHERE id = 100 AND version = 5;  
     ```
  
   - 适用场景：高并发更新操作。  

3. 提交日志记录  
   - 记录请求的唯一标识（如用户ID+时间戳），处理前检查日志是否存在重复。  


## 五、技术选型与优缺点对比

| 方法                | 优点                          | 缺点                          | 适用场景                  |
|:----|:----|:----|:----|
| 前端禁用按钮        | 简单、即时反馈                | 依赖JS，可绕过                | 低安全性要求的内部系统    |
| Token验证           | 高安全性，防CSRF              | 需维护Token状态               | 高安全性表单（如支付）    |
| 数据库唯一索引      | 数据强一致                    | 影响写入性能                  | 核心业务数据（如订单）    |
| 分布式锁            | 适合高并发                    | 增加系统复杂度                | 分布式环境下的抢购场景    |
| PRG模式             | 避免刷新重复提交              | 不适用AJAX请求                | 传统表单提交              |

## 六、综合建议

1. 分层防御：结合前端交互优化（如防抖）+ 后端Token验证 + 数据库唯一约束。  

2. 业务适配：根据场景选择策略，如抢购类高并发场景优先使用分布式锁+幂等性设计。  

3. 监控与日志：记录重复提交请求，分析异常模式（如恶意攻击）。  

通过多维度技术整合，可有效降低重复提交风险，提升系统健壮性与用户体验。

# 参考资料

[幂等性解决重复提交的方案](https://blog.csdn.net/weixin_45136579/article/details/106410497)

* any list
{:toc}