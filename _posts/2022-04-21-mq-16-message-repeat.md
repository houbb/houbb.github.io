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

[idempotent 幂等性防止重复提交](https://houbb.github.io/2020/07/16/idempotent-resubmit)

[面试官：你们项目中是怎么做防重复提交的？](https://houbb.github.io/2022/05/10/interview-10-repeat)

# 幂等性

幂等（idempotent、idempotence）是一个数学与计算机学概念，常见于抽象代数中。

在编程中一个幂等操作的特点是其任意多次执行所产生的影响均与一次执行的影响相同。

幂等函数，或幂等方法，是指可以使用相同参数重复执行，并能获得相同结果的函数。

这些函数不会影响系统状态，也不用担心重复执行会对系统造成改变。

例如，“setTrue()”函数就是一个幂等函数,无论多次执行，其结果都是一样的，更复杂的操作幂等保证是利用唯一交易号(流水号)实现.

简单来说，幂等性就是一个数据或者一个请求，给你重复来了多次，你得确保对应的数据是不会改变的，不能出错。

# 出现重复消费场景

（1）首先，比如rabbitmq、rocketmq、kafka，都有可能会出现消息重复消费的问题。因为这个问题通常不是由mq来保证的，而是消费方自己来保证的。

（2）举例kafka来说明重复消费问题

kafka有一个叫做offset的概念，就是每个消息写进去，都有一个offset代表他的序号，然后consumer消费了数据之后，每隔一段时间，会把自己消费过的消息的offset提交一下，代表我已经消费过了，下次就算重启，kafka就会让消费者从上次消费到的offset来继续消费。

但是万事总有例外，如果consumer消费了数据，还没来得及发送自己已经消费的消息的offset就挂了，那么重启之后就会收到重复的数据。

![出现重复消费场景](https://p1-jj.byteimg.com/tos-cn-i-t2oaga2asx/gold-user-assets/2019/5/22/16adff9dda4e5512~tplv-t2oaga2asx-zoom-in-crop-mark:3024:0:0:0.awebp)

# 保证幂等性(重复消费)

要保证消息的幂等性，这个要结合业务的类型来进行处理。下面提供几个思路供参考：

（1）可在内存中维护一个set，只要从消息队列里面获取到一个消息，先查询这个消息在不在set里面，如果在表示已消费过，直接丢弃；如果不在，则在消费后将其加入set当中。

（2）如何要写数据库，可以拿唯一键先去数据库查询一下，如果不存在在写，如果存在直接更新或者丢弃消息。

（3）如果是写redis那没有问题，每次都是set，天然的幂等性。

（4）让生产者发送消息时，每条消息加一个全局的唯一id，然后消费时，将该id保存到redis里面。消费时先去redis里面查一下有么有，没有再消费。

（5）数据库操作可以设置唯一键，防止重复数据的插入，这样插入只会报错而不会插入重复数据。

# 小结

希望本文对你有所帮助，如果喜欢，欢迎点赞收藏转发一波。

我是老马，期待与你的下次重逢。

# 开源地址

> [The message queue in java.(java 简易版本 mq 实现) ](https://github.com/houbb/mq) https://github.com/houbb/mq

# 拓展阅读

[rpc-从零开始实现 rpc](https://github.com/houbb/rpc) https://github.com/houbb/rpc

[Kafka 为什么这么快](https://houbb.github.io/2018/09/19/kafka-fast-reason)

# 参考资料

[关于MQ的几件小事（三）如何保证消息不重复消费](https://juejin.cn/post/6844903849094807560)

* any list
{:toc}