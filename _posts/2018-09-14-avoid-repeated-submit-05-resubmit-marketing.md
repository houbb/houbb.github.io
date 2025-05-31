---
layout: post
title: resubmit-05-还在深夜加班改Bug？雷军都点赞的防重提方案来了！
date: 2025-5-31 12:32:33 +0800
categories: [Marketing]
tags: [marketing, overview, sh]
published: true
---

# chat

## 前言

这是一个希望让每一位程序员按时下班的防止重复提交开源利器。

```
“那天凌晨2点，我因为重复提交漏洞被搞得半夜加班解决问题。  

现在，我只用一行代码 就解决了这个问题——  

这就是 resubmit ，一个普通程序员送给所有同行的防崩盘保险。”  
```

—— 一位不愿意透露姓名的 996 程序员

## 防重复提交

### 实现方式对比

实现方式对比

```java
// 方案1：手动if校验（新手最爱）
if(!cache.contains(requestId)) { // 漏判并发问题 → 资损事故
    doBusiness();
}

// 方案2：AOP切面（老鸟的选择）
@Around("execution(* com..*Controller.*(..))") // 几十行代码+调试验证 → 加班秃头
public Object checkRepeat(ProceedingJoinPoint joinPoint) { 
    // 复杂参数解析...
}

// 方案3：resubmit（今天起换种活法）
@Resubmit(5000) // ◾ 1行注解 → 下班约会
public void business(String id) {
    // 安心写核心逻辑
}
```

### 参数理性美：精准到毫秒的防御方程  

可以结合自己的实际业务，调整阈值。

| 防御场景         | resubmit方案          | 传统方案          |
|------------------|----------------------|------------------|
| 支付防连点       | `@Resubmit(3000)`    | 前端按钮禁用+后端校验 |
| 表单防重复提交   | `@Resubmit(10000)`   | Token机制+Session管理|
| 秒杀防超卖       | `@Resubmit(0)`       | Redis分布式锁     |

resubmit 适合 99% 中小项目，无缝整合 spring，纵享丝滑。

当然也支持分布式集群，支持灵活拓展。

### 🚀 三步接入，永久告别重复提交噩梦  

### STEP 1：加个注解（比写注释还简单）

```java
public class OrderService {
    @Resubmit(5000) // 5秒内相同订单ID拦截
    public void pay(String orderId) {
        // 你的核心业务逻辑
    }
}
```

### STEP 2：SpringBoot专属（自动防御模式）

```xml
<dependency>
    <groupId>com.github.houbb</groupId>
    <artifactId>resubmit-springboot-starter</artifactId>
    <version>1.1.1</version>
</dependency>
```

### STEP 3：分布式扩展（Redis集群护航）

```java
@EnableResubmit(cache = "redisCache") 

@Bean
public ICommonCacheService redisCache() {
    return new RedisCacheService("127.0.0.1:6379"); 
}
```

## 尾声

resubmit 只做一件事：用最优雅的方式，杀死重复提交  

这世界从不缺复杂的系统，缺的是让程序员 早点下班 的诚意  

👉 [马上体验 resubmit](https://github.com/houbb/resubmit)

“在重复提交的战场上，最好的防御是让用户感知不到防御的存在”  
“程序员写代码的时间应该省下来，多陪陪家人”

✋ P.S. 来自作者的坦白  

“这个项目没有融资、没有PR团队。如果你也被重复提交折磨过，点个Star就是对我最大的认可”  

[houbb @ GitHub](https://github.com/houbb)

# 拓展阅读

[01-面试官：你们项目中是怎么做防重复提交的？](https://houbb.github.io/2018/09/14/avoid-repeated-submit-01-interview)

[02-java 表单避免重复提交 resubmit 开源项目介绍](https://houbb.github.io/2018/09/14/avoid-repeated-submit-02-open-source-intro)

[03-idempotent 幂等性介绍+如何防止重复提交？](https://houbb.github.io/2018/09/14/avoid-repeated-submit-03-idempotent)

[04-简单聊一聊防重复提交](https://houbb.github.io/2018/09/14/avoid-repeated-submit-04-chat)

[05-还在深夜加班改Bug？雷军都点赞的防重提方案来了！](https://houbb.github.io/2018/09/14/avoid-repeated-submit-05-resubmit-marketing)

## 开源矩阵

下面是一些从防止重复提交相关，整个系列的开源矩阵规划。

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

# 参考资料


* any list
{:toc}