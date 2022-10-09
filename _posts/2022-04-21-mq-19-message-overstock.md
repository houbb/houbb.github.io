---
layout: post
title:  【mq】从零开始实现 mq-19-消息积压在消息队列里怎么办？
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

# 1.大量消息在mq里积压了几个小时了还没解决

场景： 几千万条数据在MQ里积压了七八个小时，从下午4点多，积压到了晚上很晚，10点多，11点多。

线上故障了，这个时候要不然就是修复consumer的问题，让他恢复消费速度，然后傻傻的等待几个小时消费完毕。

这个肯定不行。

一个消费者一秒是1000条，一秒3个消费者是3000条，一分钟是18万条，1000多万条。

所以如果你积压了几百万到上千万的数据，即使消费者恢复了，也需要大概1小时的时间才能恢复过来。

## 解决方案

这种时候只能操作临时扩容，以更快的速度去消费数据了。

具体操作步骤和思路如下：

①先修复consumer的问题，确保其恢复消费速度，然后将现有consumer都停掉。

②临时建立好原先10倍或者20倍的queue数量(新建一个topic，partition是原来的10倍)。

③然后写一个临时分发消息的consumer程序，这个程序部署上去消费积压的消息，消费之后不做耗时处理，直接均匀轮询写入临时建好分10数量的queue里面。

④紧接着征用10倍的机器来部署consumer，每一批consumer消费一个临时queue的消息。

⑤这种做法相当于临时将queue资源和consumer资源扩大10倍，以正常速度的10倍来消费消息。

⑥等快速消费完了之后，恢复原来的部署架构，重新用原来的consumer机器来消费消息。

![解决方案](https://p1-jj.byteimg.com/tos-cn-i-t2oaga2asx/gold-user-assets/2019/5/22/16ae001392a9584e~tplv-t2oaga2asx-zoom-in-crop-mark:3024:0:0:0.awebp)

# 2.消息设置了过期时间，过期就丢了怎么办

假设你用的是rabbitmq，rabbitmq是可以设置过期时间的，就是TTL，如果消息在queue中积压超过一定的时间就会被rabbitmq给清理掉，这个数据就没了。

那这就是第二个坑了。这就不是说数据会大量积压在mq里，而是大量的数据会直接搞丢。

## 解决方案：

这种情况下，实际上没有什么消息挤压，而是丢了大量的消息。所以第一种增加consumer肯定不适用。

这种情况可以采取 “批量重导” 的方案来进行解决。

在流量低峰期(比如夜深人静时)，写一个程序，手动去查询丢失的那部分数据，然后将消息重新发送到mq里面，把丢失的数据重新补回来。

# 3.积压消息长时间没有处理，mq放不下了怎么办

如果走的方式是消息积压在mq里，那么如果你很长时间都没处理掉，此时导致mq都快写满了，咋办？

这个还有别的办法吗？

## 解决方案：

这个就没有办法了，肯定是第一方案执行太慢，这种时候只好采用 “丢弃+批量重导” 的方式来解决了。

首先，临时写个程序，连接到mq里面消费数据，收到消息之后直接将其丢弃，快速消费掉积压的消息，降低MQ的压力，然后走第二种方案，在晚上夜深人静时去手动查询重导丢失的这部分数据。

# 小结

希望本文对你有所帮助，如果喜欢，欢迎点赞收藏转发一波。

我是老马，期待与你的下次重逢。

# 开源地址

> [The message queue in java.(java 简易版本 mq 实现) ](https://github.com/houbb/mq) https://github.com/houbb/mq

# 拓展阅读

[rpc-从零开始实现 rpc](https://github.com/houbb/rpc) https://github.com/houbb/rpc

[Kafka 为什么这么快](https://houbb.github.io/2018/09/19/kafka-fast-reason)

# 参考资料

[关于MQ的几件小事（五）如何保证消息按顺序执行](https://juejin.cn/post/6844903849103196173)

* any list
{:toc}