---
layout: post
title:  MQ Design-00-overview
date:  2019-12-11 10:50:21 +0800
categories: [Design]
tags: [mq, sql, design, rpc, sh]
published: true
---

# 常见问题

消息如何保证不丢？

消息如何保证顺序？

消息如何提升性能?

消息的分布式事务？

内部保证消息幂等（比如 msg.hash）

# 学习目的

深入学习 mq，实现属于自己的 mq。

# 学习对象

基于 rocketmq，进行举一反三的相关性学习。

# 拓展阅读

《RocketMQ技术内幕.pdf》

# 参考资料

[到底什么时候该使用MQ？](https://mp.weixin.qq.com/s/Brd-j3IcljcY7BV01r712Q)

[消息总线真的能保证幂等？](https://mp.weixin.qq.com/s/h74d6LtGB5M8VF0oLrXdCA)

[消息总线能否实现消息必达？](https://mp.weixin.qq.com/s/x9IRp4-1N4otIVBEEIE-og)

[高并发场景下，如何保证生产者投递到消息中间件的消息不丢失？](https://mp.weixin.qq.com/s/YVcee7R7SWLqicJtVPLaUw)

[面试大杀器：消息中间件如何实现消费吞吐量的百倍优化？【石杉的架构笔记】](https://mp.weixin.qq.com/s?__biz=MzU0OTk3ODQ3Ng==&mid=2247484372&idx=1&sn=2bfa84b2e26569d60db15a82cb684a56&chksm=fba6ebd7ccd162c13771c5345d45d40658e3815d5ed3104490a19bb4bf20fec6060a690e305b&scene=21#wechat_redirect)

[IM服务器设计-如何解决消息的乱序](https://mp.weixin.qq.com/s/6fMO7ru-sV_eEAPu2UFUYQ)

* any list
{:toc}