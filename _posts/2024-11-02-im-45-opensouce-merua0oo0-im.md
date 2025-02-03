---
layout: post
title: IM 即时通讯系统-45-merua0oo0 IM  分布式聊天系统
date: 2024-11-02 21:01:55 +0800
categories: [IM]
tags: [im, opensource, sh]
published: true
---

# IM 开源系列

[IM 即时通讯系统-41-开源 野火IM 专注于即时通讯实时音视频技术，提供优质可控的IM+RTC能力](https://houbb.github.io/2024/11/02/im-41-opensouce-yehuo-overview)

[IM 即时通讯系统-42-基于netty实现的IM服务端,提供客户端jar包,可集成自己的登录系统](https://houbb.github.io/2024/11/02/im-42-opensouce-yuanrw-im-intro)

[IM 即时通讯系统-43-简单的仿QQ聊天安卓APP](https://houbb.github.io/2024/11/02/im-43-opensouce-xiuweikang-im)

[IM 即时通讯系统-44-仿QQ即时通讯系统服务端](https://houbb.github.io/2024/11/02/im-44-opensouce-kingston-csj-im)

[IM 即时通讯系统-45-merua0oo0 IM 分布式聊天系统](https://houbb.github.io/2024/11/02/im-45-opensouce-merua0oo0-im)

[IM 即时通讯系统-46-OpenIM 提供了专为开发者设计的开源即时通讯解决方案](https://houbb.github.io/2024/11/02/im-46-opensouce-open-im-intro)

[IM 即时通讯系统-47-beardlessCat IM 使用netty开发分布式Im，提供分布netty集群解决方案](https://houbb.github.io/2024/11/02/im-47-opensouce-beardlessCat-im-intro)

[IM 即时通讯系统-48-aurora-imui 是个通用的即时通讯（IM）UI 库，不特定于任何 IM SDK](https://houbb.github.io/2024/11/02/im-48-opensouce-aurora-imui-intro)

[IM 即时通讯系统-49-云信 IM UIKit 是基于 NIM SDK（网易云信 IM SDK）开发的一款即时通讯 UI 组件库，包括聊天、会话、圈组、搜索、群管理等组件](https://houbb.github.io/2024/11/02/im-49-opensouce-nim-uikit-android-intro)

[IM 即时通讯系统-50-📲cim(cross IM) 适用于开发者的分布式即时通讯系统](https://houbb.github.io/2024/11/02/im-50-opensouce-cim-intro)

[IM 即时通讯系统-51-MPush开源实时消息推送系统](https://houbb.github.io/2024/11/02/im-51-opensouce-mpush-intro)

[IM 即时通讯系统-52-leo-im 服务端](https://houbb.github.io/2024/11/02/im-52-opensouce-leo-im-intro)

[IM 即时通讯系统-53-im system server](https://houbb.github.io/2024/11/02/im-53-opensouce-linyu-intro)


# IM

https://github.com/merua0oo0/im


#### 项目介绍
1. IM是一个分布式聊天系统，目前完全开源，仅用于学习和交流。
1. 支持私聊、群聊、离线消息、发送图片、文件、好友在线状态显示等功能。
1. 后端采用springboot+netty实现，前端使用vue。
1. 服务器支持集群化部署，每个im-server仅处理自身连接用户的消息



#### 项目结构
|  模块  |     功能 |
|-------------|------------|
| im-platform | 与页面进行交互，处理业务请求 |
| im-server   | 推送聊天消息|
| im-client   | 消息推送sdk|
| im-common   | 公共包  |

#### 消息推送方案（推方案）

![输入图片说明](https://github.com/merua0oo0/im/raw/master/pic/im_push.png)

- im通过长连接实现消息推送，单机情况下不同用户的channel是在同一台机器上可以找到并且投递，当场景转换为分布式后，不同的用户channel可能是不同的server在维护，我们需要考虑如何将消息跨server进行投递

- 利用了redis的list数据实现消息推送，其中key为im:unread:${serverid},每个key的数据可以看做一个messageQueue,每个server根据自身的serverId只消费属于自己的queue

- 同时使用一个中心化存储记录了每个用户的websocket连接的serverId,当用户发送消息时，platform将根据receId所连接的server的id,决定将消息推向哪个queue
- 每个server会维护本地的channel，收到messageQueue中的消息后找到对应的Queue进行投递

#### 热点群聊优化方案（推拉结合）

![输入图片说明](https://github.com/merua0oo0/im/raw/master/pic/im_pull.png)

- 在客户端会维护热点群聊的已读offset，用户发送热点群聊消息给server

- server统一将消息通过MQ与TS服务进行解耦，TS服务负责将消息进行入库，同时对比用户存在redis中的已读消息的存根是否有必要将message投递到receId对应的messageQueue

- 若投递到messageQueue后，server消费后投递给client无状态的可以拉取请求

- client收到请求后进行批量拉取，拉取是需要从DB中拉取，防止DB压力过大，用存根offset与group最新消息进行判断是否有必要拉取。

- 拉取操作务必使用异步，可以使用MQ，方便可以使用业务线程，防止单个拉取动作过慢导致work线程阻塞进而影响用户的心跳检测。



# 参考资料

* any list
{:toc}