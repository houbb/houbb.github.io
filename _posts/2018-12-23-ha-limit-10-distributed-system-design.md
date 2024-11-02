---
layout: post
title: 高可用之限流 10-distributed rate-limit system 分布式限流系统设计
date: 2018-12-23 13:55:13 +0800
categories: [Distributed]
tags: [distributed, ha, limit, sh]
published: true
---

# 限流系列

[开源组件 rate-limit: 限流](https://github.com/houbb/rate-limit/)

[高可用之限流-01-入门介绍](https://houbb.github.io/2018/12/23/ha-limit-01-basic)

[高可用之限流-02-如何设计限流框架](https://houbb.github.io/2018/12/23/ha-limit-02-how-to-design)

[高可用之限流-03-Semaphore 信号量做限流](https://houbb.github.io/2018/12/23/ha-limit-03-semaphore-in-java)

[高可用之限流-04-fixed window 固定窗口](https://houbb.github.io/2018/12/23/ha-limit-04-fixed-window)

[高可用之限流-05-slide window 滑动窗口](https://houbb.github.io/2018/12/23/ha-limit-05-slide-window)

[高可用之限流-06-slide window 滑动窗口 sentinel 源码](https://houbb.github.io/2018/12/23/ha-limit-06-slide-window-sources)

[高可用之限流-07-token bucket 令牌桶算法](https://houbb.github.io/2018/12/23/ha-limit-07-token-bucket)

[高可用之限流 08-leaky bucket漏桶算法](https://houbb.github.io/2018/12/23/ha-limit-08-leaky-bucket)

[高可用之限流 09-guava RateLimiter 入门使用简介 & 源码分析](https://houbb.github.io/2018/12/23/ha-limit-09-guava)

# 分布式系统的设计

在当前的分布式体系中，单机的限流有时候是不准确的，因为它无法准确的反应全局的情况。

防刷/限流+风控+度量+报警 系统都可以简单的抽象为两个部分：

1）指标的采集处理，数据存储的集中式的存储服务(redis/mysql/vm 等)

2) 规则引擎计算是否满足条件

```
左值的计算 OPERATOR  右值的计算
```

通过规则引擎，满足条件后再做后续的动作。

# 整体的流程设计

![整体的流程设计](https://gitee.com/houbinbin/imgbed/raw/master/img/%E6%95%B4%E4%BD%93%E6%9E%B6%E6%9E%84.drawio.png)

## 说明

1）MQ 的作用主要是异步化，可选。比如采用类似于 CAT 这种，client 直接上送到服务端处理。不过在拓展性的角度而言，还是后续引入比较好。

2）分布式系统中，需要一个集中式的存储服务，比如 redis / 时序数据库

3) 不同系统的规则处理后，后置不同。

比如风控系统会有对应的卡拉黑，账户冻结等。

报警系统会有对应的报警信息发送。

度量系统需要有对应的页面展示，开会+处理等等。

限流系统就是限制对应的 ip 等操作

4) 处理的结果和配置应该形成闭环，反馈优化。


# 参考资料

[限流限速 RateLimiter](https://zhuanlan.zhihu.com/p/110596981)

[Guava RateLimiter](https://www.jianshu.com/p/5d4fe4b2a726)

* any list
{:toc}