---
layout: post
title:  【mq】从零开始实现 mq-14-为什么使用 mq？不同 mq 的优缺点与适用场景
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

# 自己系统中应用的场景

## 异步

这里主要是**为了提升用户的操作体验**。

比如控台的数据导出，数据量较大时，如果同步等待，就会很慢，用户也做不了其他操作。

比较常见的方式就是导出等耗时较长的操作，自发自消一个 MQ，去异步处理，最后的结果提供一个统一查询下载的地方即可。

ps: 如果只是想异步，应用架构中没有引入 mq，使用 spring boot 的 `@Aysnc` 或者自己实现异步操作也相对简单。

## 削峰

削峰一般对于性能要求比较高的应用会用到，比如秒杀系统，交易核心链路等。

以交易链路为例，一般白天是高峰期，晚上是低谷期。

交易中需要调用风控等底层服务，风控需要对交易数据进行持久化，如果同步持久化，就会导致处理时间延长，一般是采用异步持久化的方式。

因为风控规则本身可以容忍数据就一定的延迟性，通过这个，来**换取系统的性能提升**。

使用MQ进行流量削峰，将用户的大量消息直接放到MQ里面，然后我们的系统去按自己的最大消费能力去消费这些消息，就可以**保证系统的稳定**，只是可能要跟进业务逻辑，给用户返回特定页面或者稍后通过其他方式通知其结果。

## 解耦

解耦：可以在多个系统之间进行解耦，将原本通过网络之间的调用的方式改为使用MQ进行消息的异步通讯，只要该操作不是需要同步的，就可以改为使用MQ进行不同系统之间的联系，这样项目之间不会存在耦合，系统之间不会产生太大的影响，就算一个系统挂了，也只是消息挤压在MQ里面没人进行消费而已，不会对其他的系统产生影响。

比如用户发生了一笔交易（交易核心），需要给用户发送一封短信通知（短信服务）。

就可以让交易核心发送一个 mq，短信服务监听消费即可。

当然，如果要保证二者实时同步获取结果，可以采用 rpc 的调用方式。但是这样就会让交易核心和短信服务耦合在一起，在业务上要做好考量。

# 消息队列有什么优点和缺点？

## 优点

1、对结构复杂、设计系统多的操作进行解耦操作，降低系统的操作复杂度、降低系统的维护成本。

2、对一个可以进行异步操作的一些系统操作进行异步，减小操作的响应时间，提供更好的用户体验。

3、可对高流量进行削峰，保证系统的平稳运行。

## 缺点

1、系统可用性降低。**引入的外部依赖越多，系统越脆弱**。

2、系统复杂度提高。需要考虑MQ的各种情况，比如：消息的重复消费、消息丢失、保证消费顺序、消息积压等

3、数据一致性问题。比如A系统已经给客户返回操作成功，这时候操作BC都成功了，操作D却失败了，导致数据不一致。

# kafka、activemq、rabbitmq、rocketmq 优缺点

| 特性 | ActiveMQ | RabbitMQ | RocketMQ | kafka |
|:---|:---|:---|:---|:---|
| 单机吞吐量 | 万级，吞吐量比RocketMQ和kafka要低一个数量级 | 万级，吞吐量比RocketMQ和kafka要低一个数量级 | 10万级，RocketMQ也是可以支撑高吞吐的一种MQ | 10万级别，kafka最大优点就是吞吐量大，一般配合大数据类的系统来进行实时数据计算、日志采集等场景。 |
| topic数量对吞吐量的影响 | - | - | topic可以达到几百、几千个的级别，吞吐量会有小幅度的下降。这是RocketMQ的一大优势，可在同等数量机器下支撑大量的topic | topic从几十个到几百个的时候，吞吐量会大幅下降。所以在同等机器数量下，kafka尽量保证topic数量不要过多。如果支撑大规模topic需要增加更多的机器 |
| 时效性 | ms级 | 微秒级，这是rabbitmq的一大特点，延迟是最低的 | ms级 | 延迟在ms级以内 |
| 可用性 | 高，基于主从架构实现可用性 | 高，基于主从架构实现可用性 | 非常高，分布式架构 | 非常高，kafka是分布式的，一个数据多个副本，少数机器宕机，不会丢失数据，不会导致不可用 |
| 消息可靠性 | 有较低的概率丢失数据 | - | 经过参数优化配置，可以做到0丢失 | 经过参数配置，消息可以做到0丢失 |
| 功能支持 | MQ领域的功能及其完备 | 基于erlang开发，所以并发性能极强，性能极好，延时低 | MQ功能较为完备，分布式扩展性好 | 功能较为简单，主要支持加单MQ功能 |
| 优势 | 非常成熟，功能强大，在业内大量公司和项目中都有应用 | erlang语言开发，性能极好、延时很低，吞吐量万级、MQ功能完备，管理界面非常好，社区活跃；互联网公司使用较多 | 接口简单易用，阿里出品有保障，吞吐量大，分布式扩展方便、社区比较活跃，支持大规模的topic、支持复杂的业务场景，可以基于源码进行定制开发 | 超高吞吐量，ms级的时延，极高的可用性和可靠性，分布式扩展方便 |
| 劣势 | 偶尔有较低概率丢失消息，社区活跃度不高 | 吞吐量较低，erlang语音开发不容易进行定制开发，集群动态扩展麻烦 | 接口不是按照标准JMS规范走的，有的系统迁移要修改大量的代码，技术有被抛弃的风险 | 有可能进行消息的重复消费 |
| 应用 | 主要用于解耦和异步，较少用在大规模吞吐的场景中 | 都有使用 | 用于大规模吞吐、复杂业务中 | 在大数据的实时计算和日志采集中被大规模使用，是业界的标准 |

## 自己的系统使用情况

一些比较早的系统，使用都是 apache 的 [activeMQ](https://houbb.github.io/2017/06/07/activemq)。目前遗留的就是一些基本没人维护的任务调度等系统。

后续系统业务上都基本换成了 ali 的 [rocketMQ](https://houbb.github.io/2022/03/18/01-rocketmq-01-concept)，当然后续在 rocketMQ 的基础上进行自研，使其更加便于业务使用。

数据分析、日志等基本使用的是 [kafka](https://houbb.github.io/2017/08/09/apacke-kafka-00-overview)。

# 小结

希望本文对你有所帮助，如果喜欢，欢迎点赞收藏转发一波。

我是老马，期待与你的下次重逢。

# 开源地址

> [The message queue in java.(java 简易版本 mq 实现) ](https://github.com/houbb/mq) https://github.com/houbb/mq

# 拓展阅读

[rpc-从零开始实现 rpc](https://github.com/houbb/rpc) https://github.com/houbb/rpc

# 参考资料

[关于MQ的几件小事（一）消息队列的用途、优缺点、技术选型](https://juejin.cn/post/6844903849086418957)

* any list
{:toc}