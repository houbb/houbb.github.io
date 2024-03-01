---
layout: post
title: Rocketmq 源码-00-为什么学习源码 
date: 2022-03-18 21:01:55 +0800
categories: [Apache]
tags: [mq, rocketmq, jms]
published: true
---

# 原因

其实接触 mq 已经多年了，但是一直停留在用的表面。

- 比如原理是什么？

两次 rpc + Broker 持久化 + 服务发现

- 如何保证不丢消息

- 如何提升性能

- 如何实现顺序消息？事务消息？

# 预测未来最好的方式

预测未来最好的方式就是去创造它。

无论是 active mq、kafka、pulsar。所有的 mq 原理其实是一样的，只是做了不同的优化。

## 基础

网络通信-TCP 

持久化落盘-DMA 零拷贝





# 参考资料

[]()

《Rocketmq 技术内幕》

* any list
{:toc}
