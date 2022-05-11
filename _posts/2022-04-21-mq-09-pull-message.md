---
layout: post
title:  java 从零开始实现消息队列 mq-09-消费者拉取消息 pull message 
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

# 消息的推与拉

大家好，我是老马。

这一节我们来一起看一下 MQ 消息中的推和拉两种模式。

## 推

消息由 broker 直接推送给消费者，实时性比较好。

缺点是如果消费者处理不过来，就会造成大量问题。

## 拉

消息由消费者定时从 broker 拉取，优点是实现简单，可以根据消费者自己的处理能力来消费。

缺点是实时性相对较差。

实际业务中，需要结合具体的场景，选择合适的策略。

![mq-pull](https://img-blog.csdnimg.cn/243abfcab8ef4f468eb281a39664beb0.png#pic_center)

# 拉取策略实现

## push 策略

我们首先看一下 push 策略的简化核心实现：

```java
package com.github.houbb.mq.consumer.core;

/**
 * 推送消费策略
 *
 * @author binbin.hou
 * @since 1.0.0
 */
public class MqConsumerPush extends Thread implements IMqConsumer  {

    @Override
    public void run() {
        // 启动服务端
        log.info("MQ 消费者开始启动服务端 groupName: {}, brokerAddress: {}",
                groupName, brokerAddress);

        //1. 参数校验
        this.paramCheck();

        try {
            //0. 配置信息
            //1. 初始化
            //2. 连接到服务端
            //3. 标识为可用
            //4. 添加钩子函数

            //5. 启动完成以后的事件
            this.afterInit();

            log.info("MQ 消费者启动完成");
        } catch (Exception e) {
            log.error("MQ 消费者启动异常", e);
            throw new MqException(ConsumerRespCode.RPC_INIT_FAILED);
        }
    }

    /**
     * 初始化完成以后
     */
    protected void afterInit() {

    }

    // 其他方法

    /**
     * 获取消费策略类型
     * @return 类型
     * @since 0.0.9
     */
    protected String getConsumerType() {
        return ConsumerTypeConst.PUSH;
    }

}
```

我们在 push 中预留了一个 `afterInit` 方法，便于子类重载。

# pull 策略

## 消费者实现

```java
package com.github.houbb.mq.consumer.core;

/**
 * 拉取消费策略
 *
 * @author binbin.hou
 * @since 0.0.9
 */
public class MqConsumerPull extends MqConsumerPush  {

    private static final Log log = LogFactory.getLog(MqConsumerPull.class);

    /**
     * 拉取定时任务
     *
     * @since 0.0.9
     */
    private final ScheduledExecutorService scheduledExecutorService = Executors.newSingleThreadScheduledExecutor();

    /**
     * 单次拉取大小
     * @since 0.0.9
     */
    private int size = 10;

    /**
     * 初始化延迟毫秒数
     * @since 0.0.9
     */
    private int pullInitDelaySeconds = 5;

    /**
     * 拉取周期
     * @since 0.0.9
     */
    private int pullPeriodSeconds = 5;

    /**
     * 订阅列表
     * @since 0.0.9
     */
    private final List<MqTopicTagDto> subscribeList = new ArrayList<>();

    // 设置

    

    @Override
    protected String getConsumerType() {
        return ConsumerTypeConst.PULL;
    }

    @Override
    public synchronized void subscribe(String topicName, String tagRegex) {
        MqTopicTagDto tagDto = buildMqTopicTagDto(topicName, tagRegex);

        if(!subscribeList.contains(tagDto)) {
            subscribeList.add(tagDto);
        }
    }

    @Override
    public void unSubscribe(String topicName, String tagRegex) {
        MqTopicTagDto tagDto = buildMqTopicTagDto(topicName, tagRegex);

        subscribeList.remove(tagDto);
    }

    private MqTopicTagDto buildMqTopicTagDto(String topicName, String tagRegex) {
        MqTopicTagDto dto = new MqTopicTagDto();
        dto.setTagRegex(tagRegex);
        dto.setTopicName(topicName);
        return dto;
    }

}
```

### 订阅相关

pull 策略可以把订阅/取消订阅放在本地，避免与服务端的交互。

### 定时拉取

我们重载了 push 策略的 `afterInit` 方法。

```java
/**
 * 初始化拉取消息
 * @since 0.0.6
 */
@Override
public void afterInit() {
    //5S 发一次心跳
    scheduledExecutorService.scheduleAtFixedRate(new Runnable() {
        @Override
        public void run() {
            if(CollectionUtil.isEmpty(subscribeList)) {
                log.warn("订阅列表为空，忽略处理。");
                return;
            }
            for(MqTopicTagDto tagDto : subscribeList) {
                final String topicName = tagDto.getTopicName();
                final String tagRegex = tagDto.getTagRegex();
                MqConsumerPullResp resp = consumerBrokerService.pull(topicName, tagRegex, size);
                if(MqCommonRespCode.SUCCESS.getCode().equals(resp.getRespCode())) {
                    List<MqMessage> mqMessageList = resp.getList();
                    if(CollectionUtil.isNotEmpty(mqMessageList)) {
                        for(MqMessage mqMessage : mqMessageList) {
                            IMqConsumerListenerContext context = new MqConsumerListenerContext();
                            mqListenerService.consumer(mqMessage, context);
                        }
                    }
                } else {
                    log.error("拉取消息失败: {}", JSON.toJSON(resp));
                }
            }
        }
    }, pullInitDelaySeconds, pullPeriodSeconds, TimeUnit.SECONDS);
}
```

应用启动时，指定时间定时拉取消息并进行消费处理。


其中 `consumerBrokerService.pull(topicName, tagRegex, size);` 拉取实现如下：

```java
public MqConsumerPullResp pull(String topicName, String tagRegex, int fetchSize) {
    MqConsumerPullReq req = new MqConsumerPullReq();
    req.setSize(fetchSize);
    req.setGroupName(groupName);
    req.setTagRegex(tagRegex);
    req.setTopicName(topicName);
    final String traceId = IdHelper.uuid32();
    req.setTraceId(traceId);
    req.setMethodType(MethodType.C_MESSAGE_PULL);

    Channel channel = getChannel(null);
    return this.callServer(channel, req, MqConsumerPullResp.class);
}
```

## Borker 相关

### 消息分发

```java
// 消费者主动 pull
if(MethodType.C_MESSAGE_PULL.equals(methodType)) {
    MqConsumerPullReq req = JSON.parseObject(json, MqConsumerPullReq.class);
    return mqBrokerPersist.pull(req, channel);
}
```

### 实现

mqBrokerPersist 是一个接口，此处演示基于本地实现的，后续会实现基于数据库的持久化。

原理是类似的，此处仅作为演示。

```java
@Override
public MqConsumerPullResp pull(MqConsumerPullReq pullReq, Channel channel) {
    //1. 拉取匹配的信息
    //2. 状态更新为代理中
    //3. 如何更新对应的消费状态呢？
    // 获取状态为 W 的订单
    final int fetchSize = pullReq.getSize();
    final String topic = pullReq.getTopicName();
    final String tagRegex = pullReq.getTagRegex();
    List<MqMessage> resultList = new ArrayList<>(fetchSize);
    List<MqMessagePersistPut> putList = map.get(topic);
    // 性能比较差
    if(CollectionUtil.isNotEmpty(putList)) {
        for(MqMessagePersistPut put : putList) {
            final String status = put.getMessageStatus();
            if(!MessageStatusConst.WAIT_CONSUMER.equals(status)) {
                continue;
            }
            final MqMessage mqMessage = put.getMqMessage();
            List<String> tagList = mqMessage.getTags();
            if(InnerRegexUtils.hasMatch(tagList, tagRegex)) {
                // 设置为处理中
                // TODO： 消息的最终状态什么时候更新呢？
                // 可以给 broker 一个 ACK
                put.setMessageStatus(MessageStatusConst.PROCESS_CONSUMER);
                resultList.add(mqMessage);
            }
            if(resultList.size() >= fetchSize) {
                break;
            }
        }
    }
    MqConsumerPullResp resp = new MqConsumerPullResp();
    resp.setRespCode(MqCommonRespCode.SUCCESS.getCode());
    resp.setRespMessage(MqCommonRespCode.SUCCESS.getMsg());
    resp.setList(resultList);
    return resp;
}
```

我们遍历找到匹配的消息，将其状态更新为中间状态。

不过这里还是缺少了一个关键的步骤，那就是消息的 ACK。

我们将在下一小节进行实现。

# 小结

消息的推送和拉取各有自己的优缺点，需要我们结合自己的业务，进行选择。

一般而言，IM 更加适合消息的推送；一般的业务，为了削峰填谷，更加适合拉取的模式。

希望本文对你有所帮助，如果喜欢，欢迎点赞收藏转发一波。

我是老马，期待与你的下次重逢。

# 开源地址

> [The message queue in java.(java 简易版本 mq 实现) ](https://github.com/houbb/mq) https://github.com/houbb/mq

# 拓展阅读

[rpc-从零开始实现 rpc](https://github.com/houbb/rpc) https://github.com/houbb/rpc

* any list
{:toc}