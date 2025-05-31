---
layout: post
title: resubmit-06-resubmit v1.2.0 新特性支持类级别防止重复提交
date: 2025-5-31 12:32:33 +0800
categories: [Marketing]
tags: [marketing, overview, sh]
published: true
---

# 前言

[resubmit](https://github.com/houbb/resubmit) 是一款为 java 设计的渐进式防止重复提交框架。

## 创作目的

有时候手动加防止重复提交很麻烦，每次手动编写不利于复用。

所以希望从从简到繁实现一个工具，便于平时使用。

## 特性

- 渐进式实现，可独立 spring 使用

- 基于注解+字节码，配置灵活

- 支持编程式的调用

- 支持注解式，完美整合 spring

- 支持整合 spring-boot

- 支持方法级别、类级别注解

# 快速开始

## maven 引入

```xml
<dependency>
    <groupId>com.github.houbb</groupId>
    <artifactId>resubmit-springboot-starter</artifactId>
    <version>1.2.0</version>
</dependency>
```

## 测试代码

service 类

```java
@Service
@Resubmit(value = 5000, enable = true)
public class ClassLevelService {

    @Resubmit(enable = false)
    public void queryInfoNoLimit(final String id) {
        System.out.println("queryInfoNoLimit: " + id);
    }

    public void queryInfoLimit(final String id) {
        System.out.println("queryInfoLimit: " + id);
    }

}
```

测试类

```java
@ContextConfiguration(classes = SpringConfig.class)
@RunWith(SpringJUnit4ClassRunner.class)
public class ResubmitSpringClassLevelTest {

    @Autowired
    private ClassLevelService classLevelService;

    @Test(expected = ResubmitException.class)
    public void queryInfoLimitTest() {
        classLevelService.queryInfoLimit("1");
        classLevelService.queryInfoLimit("1");
    }

    @Test
    public void queryInfoNoLimitTest() {
        classLevelService.queryInfoNoLimit("1");
        classLevelService.queryInfoNoLimit("1");
    }

}
```

如此就可以完成一个类级别支持的防重复提交。

## 注解

注解 `@Resubmit` 对应的属性如下，可以在方法或者类上。方法的级别优先于类。

| 属性       | 说明               | 默认值  |
|:---------|:-----------------|:-----|
| value()  | 多久内禁止重复提交，单位为毫秒。 | 8000 |
| enable() | 是否启用   | true |

# 拓展阅读

[01-面试官：你们项目中是怎么做防重复提交的？](https://houbb.github.io/2018/09/14/avoid-repeated-submit-01-interview)

[02-java 表单避免重复提交 resubmit 开源项目介绍](https://houbb.github.io/2018/09/14/avoid-repeated-submit-02-open-source-intro)

[03-idempotent 幂等性介绍+如何防止重复提交？](https://houbb.github.io/2018/09/14/avoid-repeated-submit-03-idempotent)

[04-简单聊一聊防重复提交](https://houbb.github.io/2018/09/14/avoid-repeated-submit-04-chat)

[05-还在深夜加班改Bug？雷军都点赞的防重提方案来了！](https://houbb.github.io/2018/09/14/avoid-repeated-submit-05-resubmit-marketing)

[06-v1.2.0 新特性类级别防止重复提交](https://houbb.github.io/2018/09/14/avoid-repeated-submit-06-resubmit-class-level)

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