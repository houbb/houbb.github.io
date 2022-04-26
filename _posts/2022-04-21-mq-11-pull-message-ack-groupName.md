---
layout: post
title:  java 从零开始实现消息队列 mq-11-pull message ack groupName 消费者主动拉取消息消费状态回执添加 groupName 信息
date:  2022-04-15 09:22:02 +0800
categories: [MQ]
tags: [mq, netty, sh]
published: true
---

# 前景回顾

大家好，我是老马。

xxx

# 状态回执

上一节我们实现了消息的回执，但是存在一个问题。

同一个消息，可以被不同的 groupName 进行消费，所以回执是需要根据 groupName 进行分开的，这个上一节中遗漏了。

# Broker 推送消息的调整

以前推送消息是直接推送，但是缺少 groupName 信息。

## 订阅列表获取

获取订阅列表的实现调整如下：

```java
public List<ChannelGroupNameDto> getPushSubscribeList(MqMessage mqMessage) {
    final String topicName = mqMessage.getTopic();
    Set<ConsumerSubscribeBo> set = pushSubscribeMap.get(topicName);
    if(CollectionUtil.isEmpty(set)) {
        return Collections.emptyList();
    }

    //2. 获取匹配的 tag 列表
    final List<String> tagNameList = mqMessage.getTags();
    Map<String, List<ConsumerSubscribeBo>> groupMap = new HashMap<>();
    for(ConsumerSubscribeBo bo : set) {
        String tagRegex = bo.getTagRegex();
        if(RegexUtil.hasMatch(tagNameList, tagRegex)) {
            String groupName = bo.getGroupName();
            MapUtil.putToListMap(groupMap, groupName, bo);
        }
    }

    //3. 按照 groupName 分组之后，每一组只随机返回一个。最好应该调整为以 shardingkey 选择
    final String shardingKey = mqMessage.getShardingKey();
    List<ChannelGroupNameDto> channelGroupNameList = new ArrayList<>();
    for(Map.Entry<String, List<ConsumerSubscribeBo>> entry : groupMap.entrySet()) {
        List<ConsumerSubscribeBo> list = entry.getValue();
        ConsumerSubscribeBo bo = RandomUtils.loadBalance(loadBalance, list, shardingKey);
        final String channelId = bo.getChannelId();
        BrokerServiceEntryChannel entryChannel = registerMap.get(channelId);
        if(entryChannel == null) {
            log.warn("channelId: {} 对应的通道信息为空", channelId);
            continue;
        }
        final String groupName = entry.getKey();
        ChannelGroupNameDto channelGroupNameDto = ChannelGroupNameDto.of(groupName,
                entryChannel.getChannel());
        channelGroupNameList.add(channelGroupNameDto);
    }
    return channelGroupNameList;
}
```

ChannelGroupNameDto 的定义如下：

```java
public class ChannelGroupNameDto {

    /**
     * 分组名称
     */
    private String consumerGroupName;

    /**
     * 通道
     */
    private Channel channel;

    //get & set
}
```

## 消息主动推送

我们调整一下消息推送，每次推送完成，根据 groupName 进行状态的更新：

```java
for(final ChannelGroupNameDto channelGroupNameDto : channelList) {
    final Channel channel = channelGroupNameDto.getChannel();
    final String consumerGroupName =channelGroupNameDto.getConsumerGroupName();

    try {
        // 更新状态为消费处理中
        mqBrokerPersist.updateStatus(messageId, consumerGroupName, MessageStatusConst.TO_CONSUMER_PROCESS);

        String channelId = ChannelUtil.getChannelId(channel);
        log.info("开始处理 channelId: {}", channelId);
        //1. 调用
        mqMessage.setMethodType(MethodType.B_MESSAGE_PUSH);
        // 重试推送
        MqConsumerResultResp resultResp = Retryer.<MqConsumerResultResp>newInstance()
                .maxAttempt(pushMaxAttempt)
                .callable(new Callable<MqConsumerResultResp>() {
                    @Override
                    public MqConsumerResultResp call() throws Exception {
                        MqConsumerResultResp resp = callServer(channel, mqMessage,
                                MqConsumerResultResp.class, invokeService, responseTime);
                        // 失败校验
                        if(resp == null
                            || !ConsumerStatus.SUCCESS.getCode()
                                .equals(resp.getConsumerStatus())) {
                            throw new MqException(BrokerRespCode.MSG_PUSH_FAILED);
                        }
                        return resp;
                    }
                }).retryCall();

        //2. 更新状态
        //2.1 处理成功，取 push 消费状态
        if(MqCommonRespCode.SUCCESS.getCode().equals(resultResp.getRespCode())) {
            mqBrokerPersist.updateStatus(messageId, consumerGroupName, resultResp.getConsumerStatus());
        } else {
            // 2.2 处理失败
            log.error("消费失败：{}", JSON.toJSON(resultResp));
            mqBrokerPersist.updateStatus(messageId, consumerGroupName, MessageStatusConst.TO_CONSUMER_FAILED);
        }

        log.info("完成处理 channelId: {}", channelId);
    } catch (Exception exception) {
        log.error("处理异常");
        mqBrokerPersist.updateStatus(messageId, consumerGroupName, MessageStatusConst.TO_CONSUMER_FAILED);
    }

}
```

# 消息消费者状态回执

ps: 这里 V0.1.1 分支漏写了，不过后面 v0.1.2 分支修正了。

```java
public MqCommonResp consumerStatusAck(String messageId, ConsumerStatus consumerStatus) {
    final MqConsumerUpdateStatusReq req = new MqConsumerUpdateStatusReq();
    req.setMessageId(messageId);
    req.setMessageStatus(consumerStatus.getCode());
    final String traceId = IdHelper.uuid32();
    req.setTraceId(traceId);
    req.setMethodType(MethodType.C_CONSUMER_STATUS);

    // 添加 groupName
    req.setConsumerGroupName(groupName);

    // 重试
    return Retryer.<MqCommonResp>newInstance()
            .maxAttempt(consumerStatusMaxAttempt)
            .callable(new Callable<MqCommonResp>() {
                @Override
                public MqCommonResp call() throws Exception {
                    Channel channel = getChannel(null);
                    MqCommonResp resp = callServer(channel, req, MqCommonResp.class);
                    if(!MqCommonRespCode.SUCCESS.getCode().equals(resp.getRespCode())) {
                        throw new MqException(ConsumerRespCode.CONSUMER_STATUS_ACK_FAILED);
                    }
                    return resp;
                }
            }).retryCall();
}
```

消息状态回执时，` req.setConsumerGroupName(groupName);` 添加 groupName 信息。

# 小结

消息状态的回执精确到 groupName 之后，不同的 groupName 消费就可以相互独立，适用性更强更广。

希望本文对你有所帮助，如果喜欢，欢迎点赞收藏转发一波。

我是老马，期待与你的下次重逢。

# 开源地址

> [The message queue in java.(java 简易版本 mq 实现) ](https://github.com/houbb/mq) https://github.com/houbb/mq

# 拓展阅读

[rpc-从零开始实现 rpc](https://github.com/houbb/rpc) https://github.com/houbb/rpc

* any list
{:toc}