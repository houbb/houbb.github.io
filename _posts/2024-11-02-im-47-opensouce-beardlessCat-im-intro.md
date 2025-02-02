---
layout: post
title: IM 即时通讯系统-47-beardlessCat IM 使用netty开发分布式Im，提供分布netty集群解决方案
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

https://github.com/beardlessCat/im

# 分布式IM

## 一、概述

使用netty开发分布式Im，提供分布netty集群解决方案。服务端通过负载均衡策略与服务集群建立连接，消息发送通过服务间集群的通信进行消息转发。

## 二、自定义协议

### 1.自定义协议要素

- 魔数，用来在第一时间判定是否是无效数据包
- 版本号，可以支持协议的升级
- 序列化算法，消息正文到底采用哪种序列化反序列化方式，可以由此扩展，例如：json、protobuf、hessian、jdk
- 指令类型，是登录、注册、单聊、群聊… 跟业务相关
- 请求序号，为了双工通信，提供异步能力
- 正文长度
- 消息正文

## 三、集群架构

![架构图](https://img-blog.csdnimg.cn/27c34099715546f2945239a4688708d5.png)

### 1.客户端
用户聊天客户端，客户端连接IM服务需要进行用户认证。用户认证成功之后，开始连接上线。
### 2.服务路由
服务路由负责将客户端的连接请求按照不同的负载均衡策略路由到不同的IM服务，建立长链接。负载均衡策略分为以下四种：
- 一致性HASH负载均衡策略
- 最少活跃数负载均衡策略
- 随机调用负载均衡策略
- 轮询调用负载均衡策略
### 3.IM服务集群
为了避免单节点故障，IM服务采用集群模式。集群内各个IM服务又互为对方的客户端，用于转发远程消息（消息接收客户端连接其他IM服务节点）。
### 4.ZK集群
ZK集群作为IM服务的注册中心，用户IM服务的注册与发现以及服务上线、下线的事件监听通知。通过node事件，控制IM服务之间连接的建立与断开。
### 5.消息队列
消息队列用户发送离线消息、聊天消息。
### 6.MongoDB集群
存储离线消息及聊天消息。
### 7.Redis集群
存储客户端的连接session信息（客户端与服务端连接的信息）

## 四、netty集群方案
首先需要明确一个问题，netty的channel是无法存储到redis里面的。netty的channel是一个连接，是和机器的硬件绑定的，无法序列化，计算存到redis里面，取出来也无法使用。

### 1.ZK作为注册中心实现

**（1）channel无法存储的问题**

channel是无法存储到redis里面的，但是客户端和服务端的连接信息（例如：127.0.0.1:8080的服务端是127.0.0.1:9090）是可以存储到redis里面的，因此可以通过redis存储连接信息。key为客户端标识，value为服务端地址信息，获取客户端的连接时，直接通过客户端信息即可获取其服务信息。

![channel存储](https://img-blog.csdnimg.cn/74d482dbd4cc49db8520e50630bb8dd6.png)

**（2）服务端连接的问题**

客户端连接服务端时，客户端如何知道当前服务端有哪些，需要要连接哪个？这个问题可以通过ZK解决。使用ZK作为注册中心，服务端上线后在ZK中创建node，连接服务端时，从ZK获取在线节点信息，根据负载均衡策略选择服务端连接。

![ZK注册中心](https://img-blog.csdnimg.cn/b2534128090a462bb9217e104de27996.png)

**（3）消息转发的问题**

连接相同服务的客户端，可以直接通过获连接当前服取客户端信息进行消息的转发，那连接不同服务端消息如何转发？我们可以通过监听ZK中node的事件（node创建代表新的服务上线，node销毁代表服务下线），通过不同的事件方法，实现服务端之间的互相连接。

![消息转发](https://img-blog.csdnimg.cn/22951f45d82a41a39fb00065239fd5d6.png)

### 2.redis订阅与广播实现（可替换为消息队列进行处理）

redis支持消息订阅与发布机制机制（消息队列），可以使用该机制实现不同服务间的消息转发。在广播消息时，需要携带能唯一标识接收者身份的字段（例如clientId）。消息广播结束后，所有服务端会
收到该消息，服务端仅仅需要判断该消息接收者的是否是连接的自己作为服务端。若发现该接收者正是连接的自己，则直接将消息转发到该客户端即可。

![消息转发](https://img-blog.csdnimg.cn/c822e0feb72f4a37b89735ccab2826ff.png)

## 五、核心功能
### 1.netty服务节点的注册与发现
### 2.netty服务节点的负载均衡策略
### 2.netty服务节点的消息转发

# 参考资料

* any list
{:toc}