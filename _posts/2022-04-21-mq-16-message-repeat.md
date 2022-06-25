---
layout: post
title:  【mq】从零开始实现 mq-16-如何保证消息队列不重复消费 
date:  2022-04-15 09:22:02 +0800
categories: [MQ]
tags: [mq, netty, sh]
published: true
---

# 前景回顾

[【mq】从零开始实现 mq-01-生产者、消费者启动 ](https://mp.weixin.qq.com/s/moF528JiVG9dqCi5oFMbVg)

[【mq】从零开始实现 mq-02-如何实现生产者调用消费者？](https://mp.weixin.qq.com/s/_OF4hbh9llaxN27Cv_cToQ)

[【mq】从零开始实现 mq-03-引入 broker 中间人](https://mp.weixin.qq.com/s/BvEWsLp3_35yFVRqBOxS2w)

[【mq】从零开始实现 mq-04-启动检测与实现优化](https://mp.weixin.qq.com/s/BvEWsLp3_35yFVRqBOxS2w)

[【mq】从零开始实现 mq-05-实现优雅停机](https://mp.weixin.qq.com/s/BvEWsLp3_35yFVRqBOxS2w)

[【mq】从零开始实现 mq-06-消费者心跳检测 heartbeat](https://mp.weixin.qq.com/s/lsvm9UoQWK98Jy3kuS2aNg)

[【mq】从零开始实现 mq-07-负载均衡 load balance](https://mp.weixin.qq.com/s/ZNuecNeVJzIPCp252Hn4GQ)

[【mq】从零开始实现 mq-08-配置优化 fluent](https://mp.weixin.qq.com/s/_O20KKdGwxMcHc87rcuWug)

[【mq】从零开始实现 mq-09-消费者拉取消息 pull message](https://mp.weixin.qq.com/s/bAqOJ4fKWTAVet0Oqv8S0g)

[【mq】从零开始实现 mq-10-消费者拉取消息回执 pull message ack](https://mp.weixin.qq.com/s/OgcQI-Go1ZS9-pdLtYwkcg)

[【mq】从零开始实现 mq-11-消费者消息回执添加分组信息 pull message ack groupName](https://mp.weixin.qq.com/s/3RnB7KhZB3n8yGI6Z02-bw)

[【mq】从零开始实现 mq-12-消息的批量发送与回执](https://mp.weixin.qq.com/s/tg0gxwbGWd7cn_RGMiEWew)

[【mq】从零开始实现 mq-13-注册鉴权 auth](https://mp.weixin.qq.com/s/SzWAqyHpeTrDQyUTknsJGQ)

# 消息的重复消费

mq 是通过网络传输，因为网络的不稳定性，可能会导致失败。

为了保证消息抵达，一般都会进行重试。重试在消费侧如果不进行幂等，就会导致消息的重复消费。




# 小结

希望本文对你有所帮助，如果喜欢，欢迎点赞收藏转发一波。

我是老马，期待与你的下次重逢。

# 开源地址

> [The message queue in java.(java 简易版本 mq 实现) ](https://github.com/houbb/mq) https://github.com/houbb/mq

# 拓展阅读

[rpc-从零开始实现 rpc](https://github.com/houbb/rpc) https://github.com/houbb/rpc

[Kafka 为什么这么快](http://houbb.github.io/2018/09/19/kafka-fast-reason)

# 参考资料

[关于MQ的几件小事（三）如何保证消息不重复消费](https://juejin.cn/post/6844903849094807560)

* any list
{:toc}