---
layout: post
title: 高可用之限流-02-如何设计限流框架
date: 2018-12-23 13:55:13 +0800
categories: [Distributed]
tags: [distributed, ha, limit, sh]
published: true
---

# 序言

如何设计一款限流框架？

# 核心组件

## 锁

这个锁可以是对象锁

全局锁

分布式锁

## 令牌

限制瞬时并发数

限制时间窗最大请求数

令牌桶

## 限流的维度

可以 1s 内

1min 内

1h 内

1D 内

这里应该是一个责任链，全部满足才能放行。

## 限制类型

次数

频率

## 编写方式

声明式

注解式

# 个人收获

## 服务平台的思想

所有的服务都可以使用类似的策略。

或者说这个可以抽离成为一个微服务，可以页面配置等等。

使用者只需要通过 client 简单的连接，就可以达到限流的目的。

这个适用于很多工具，而且不局限于 java 语言。服务暴露之后可以提供 RPC & Http 等常见协议。

## Redis 的底层化

如今很多工具的底层都是强依赖 redis 的，这说明 redis 的设计确实非常优秀。

但是我们在设计框架的时候应该警醒，redis 只是一种实现策略，而不是我们实现的基石。

这种 SPI 的思想非常重要。

## 兼容 spring(springBoot)

java 界的 spring 基本是如日中天。

所以可以考虑为框架添加对于 spring 的支持。

# 拓展阅读

# 参考资料

[spring-cloud-zuul-ratelimit](https://github.com/marcosbarbero/spring-cloud-zuul-ratelimit)

[主要用于开放平台的接口限流框架](https://github.com/iMouseWu/limiter)

[基于 redis 限流系统](https://github.com/lattebank/rate-limiter)

[RedisRateLimiter-Redis Based API Access Rate Limiter](https://github.com/tangaiyun/RedisRateLimiter)

[java-rate-limiter](https://github.com/cpthack/java-rate-limiter)

[neural](https://github.com/yu120/neural)

[rate-limiter](https://github.com/ZhuBaker/rate-limiter)

[QPS流量控制starter](https://github.com/gengu/rate-limiter-spring-boot-starter)

[基于redis的分布式限流方案](https://blog.wangqi.love/articles/Java/%E5%9F%BA%E4%BA%8Eredis%E7%9A%84%E5%88%86%E5%B8%83%E5%BC%8F%E9%99%90%E6%B5%81%E6%96%B9%E6%A1%88.html)

[A redis-backed rate limiter for dropwizard](https://github.com/nlap/dropwizard-ratelimit)

[应用级限流](https://github.com/liaokailin/rate-limiter)

* any list
{:toc}