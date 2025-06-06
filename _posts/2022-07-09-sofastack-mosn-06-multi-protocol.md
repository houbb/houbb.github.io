---
layout: post
title: MOSN（Modular Open Smart Network）-06-MOSN 多协议机制解析
date:  2022-07-09 09:22:02 +0800
categories: [SOFA]
tags: [sofa, test, sh]
published: true
---

## 前言

大家好，我是老马。

sofastack 其实出来很久了，第一次应该是在 2022 年左右开始关注，但是一直没有深入研究。

最近想学习一下 SOFA 对于生态的设计和思考。

## sofaboot 系列

[SOFAStack-00-sofa 技术栈概览](https://houbb.github.io/2022/07/09/sofastack-00-overview)

[MOSN（Modular Open Smart Network）-00-简单聊一聊](https://houbb.github.io/2022/07/09/sofastack-mosn-00-chat)

[MOSN（Modular Open Smart Network）-01-是一款主要使用 Go 语言开发的云原生网络代理平台](https://houbb.github.io/2022/07/09/sofastack-mosn-01-overview)

[MOSN（Modular Open Smart Network）-02-核心概念](https://houbb.github.io/2022/07/09/sofastack-mosn-02-core-components)

[MOSN（Modular Open Smart Network）-03-流量劫持](https://houbb.github.io/2022/07/09/sofastack-mosn-03-traffic-hijack)

[MOSN（Modular Open Smart Network）-04-TLS 安全链路](https://houbb.github.io/2022/07/09/sofastack-mosn-04-tls)

[MOSN（Modular Open Smart Network）-05-MOSN 平滑升级原理解析](https://houbb.github.io/2022/07/09/sofastack-mosn-05-soomth-upgrade)

[MOSN（Modular Open Smart Network）-06-MOSN 多协议机制解析](https://houbb.github.io/2022/07/09/sofastack-mosn-06-multi-protocol)

[MOSN（Modular Open Smart Network）-07-Sidecar 模式](https://houbb.github.io/2022/07/09/sofastack-mosn-07-sidecar)

[MOSN（Modular Open Smart Network）-08-MOSN 扩展机制解析](https://houbb.github.io/2022/07/09/sofastack-mosn-08-extension)

# 云原生网络代理 MOSN 多协议机制解析

> 本文根据 SOFAChannel#13 直播分享整理，主题：云原生网络代理 MOSN 多协议机制解析，[查看视频回顾](https://tech.antfin.com/community/live/1131)。  
> 作者：无钩，目前主要从事蚂蚁集团网络代理相关的研发工作，也是 MOSN 的 Committer。

今天我要和大家分享的是《云原生网络代理 MOSN 多协议机制解析》，并介绍对应的私有协议快速接入实践案例以及对 MOSN 实现多协议低成本接入的设计进行解读。

我们将按以下顺序进行介绍：

*   多协议机制产生的背景与实践痛点；
*   常见的协议扩展思路初探；
*   SOFABolt 协议接入实践；（重点）
*   MOSN 多协议机制设计解读；（重点）
*   后续规划及展望；

其中第三点「接入实践」是今天分享的重点，希望能给大家就「如何在 MOSN 中快速扩展私有协议接入」有一个具体的感受。另外「MOSN 如何实现多协议框架」也是很多人关心和问题，我们将摘选几个技术功能，对其背后的设计思考进行解读。

---

## MOSN 简介

![MOSN 简介](https://mosn.io/blog/posts/multi-protocol-deep-dive/1585209248453-cbf84b1b-6765-4f05-bd8e-44300b995266.png)

云原生网络代理 MOSN 定位是一个全栈的网络代理，支持包括网络接入层(Ingress)、API Gateway、Service Mesh 等场景，目前在蚂蚁集团内部的核心业务集群已经实现全面落地，并经受了 2019 年双十一大促的考验。今天要向大家介绍的是云原生网络代理 MOSN 核心特性之一的多协议扩展机制，目前已经支持了包括 SOFABolt、Dubbo、TARS 等多个协议的快速接入。

MOSN：[https://github.com/mosn/mosn](https://github.com/mosn/mosn)

---

## 多协议机制产生的背景与实践痛点

首先介绍一下多协议机制产生的背景。

![多协议机制](https://mosn.io/blog/posts/multi-protocol-deep-dive/1585209248463-b8b38ab0-09ed-4225-8d60-5bad3c2a372b.png)

前面提到，蚂蚁集团 2019 年双十一核心链路百分之百 Mesh 化，是业界当时已知的最大规模的 Service Mesh 落地，为什么我们敢这么做？因为我们具备能够让架构平滑迁移的方案。“兼容性"是任何架构演进升级都必然要面对的一个问题，这在早已实践微服务化架构的蚂蚁集团内部同样如此。为了实现架构的平滑迁移，需要让新老节点的外在行为尽可能的表现一致，从而让依赖方无感知，这其中很重要的一点就是保持协议兼容性。

因此，我们需要在 Service Mesh 架构下，兼容现有微服务体系中的通信协议——也就是说需要在 MOSN 内实现对目前蚂蚁集团内部通信协议的扩展支持。

![协议扩展支持](https://mosn.io/blog/posts/multi-protocol-deep-dive/1585209248513-3bf90371-3d7c-4a0f-a98a-db4538bb2271.png)

基于 MOSN 本身的扩展机制，我们完成了最初版本的协议扩展接入。但是在实践过程中，我们发现这并不是一件容易的事情：

*   相比编解码，协议自身的处理以及与框架集成才是其中最困难的环节，需要理解并实现包括请求生命周期、多路复用处理、链接池等等机制；
*   社区主流的 xDS 路由配置是面向 HTTP 协议的，无法直接支持私有协议，存在适配成本；

基于这些实践痛点，我们设计了 MOSN 多协议框架，希望可以降低私有协议的接入成本，加快普及 ServiceMesh 架构的落地推进。

---

## 常见的协议扩展思路初探

前面介绍了背景，那么具体协议扩展框架要怎么设计呢？我们先来看一下业界的思路与做法。

### 协议扩展框架 - Envoy

![Envoy 的协议扩展](https://mosn.io/blog/posts/multi-protocol-deep-dive/1585209248576-01797bba-8a94-4960-be17-1c87c725a75a.png)  
注：图片来自 Envoy 分享资料

第一个要介绍的是目前发展势头强劲的 Envoy。从图上可以看出，Envoy 支持四层的读写过滤器扩展、基于 HTTP 的七层读写过滤器扩展以及对应的 Router/Upstream 实现。如果想要基于 Envoy 的扩展框架实现 L7 协议接入，目前的普遍做法是基于 L4 filter 封装相应的 L7 codec，在此基础之上再实现对应的协议路由等能力，无法复用 HTTP L7 的扩展框架。

### 协议扩展框架 - Nginx

![Nginx 的协议扩展](https://mosn.io/blog/posts/multi-protocol-deep-dive/1585209248600-c47725ed-7d47-4c07-ad1b-f2e2ba4ea2c6.png)

第二个则是老牌的反向代理软件 Nginx，其核心模块是基于 Epoll/Kqueue 等 I/O 多路复用技术之上的离散事件框架，基于事件框架之上构建了 Mail、Http 等协议模块。与 Envoy 类似，如果要基于 Nginx 扩展私有协议，那么也需要自行对接事件框架，并完整实现包括编解码、协议处理等能力。

### 协议扩展框架 - MOSN

![MOSN 的协议扩展框架](https://mosn.io/blog/posts/multi-protocol-deep-dive/1585209248645-5d6eac2f-962e-4c3c-92f1-814d18db47cd.png)

最后回过头来，我们看一下 MOSN 是怎么做的。实际上，MOSN 的底层机制与 Envoy、Nginx 并没有核心差异，同样支持基于 I/O 多路复用的 L4 读写过滤器扩展，并在此基础之上再封装 L7 的处理。但是与前两者不同的是，MOSN 针对典型的微服务通信场景，抽象出了一套适用于基于多路复用 RPC 协议的扩展框架，屏蔽了 MOSN 内部复杂的协议处理及框架流程，开发者只需要关注协议本身，并实现对应的框架接口能力即可实现快速接入扩展。

### 三种框架成本对比

![三种框架成本对比](https://mosn.io/blog/posts/multi-protocol-deep-dive/1585209248614-5807d3b3-fb18-4a15-83ef-e05bb162f222.png)

最后对比一下，典型微服务通信框架协议接入的成本，由于 MOSN 针对此类场景进行了框架层面的封装支持，因此可以节省开发者大量的研发成本。

---

## SOFABolt 协议接入实践

初步了解多协议框架的设计思路之后，让我们以 SOFABolt 协议为例来实际体验一下协议接入的过程。

### SOFABolt 简介

![SOFABolt 简介](https://mosn.io/blog/posts/multi-protocol-deep-dive/1585209248663-0e25c95b-d711-4de2-9a42-f71d05b360df.png)

这里先对 SOFABolt 进行一个简单介绍，SOFABolt 是一个开源的轻量、易用、高性能、易扩展的 RPC 通信框架，广泛应用于蚂蚁集团内部。

SOFABolt：[https://github.com/sofastack/sofa-bolt](https://github.com/sofastack/sofa-bolt)

基于 MOSN 的多协议框架，实际编写了 7 个代码文件，一共 925 行代码(包括 liscence、comment 在内)就完成了接入。如果对于协议本身较为熟悉，且具备一定的 MOSN/Golang 开发经验，甚至可以在一天内就完成整个协议的扩展，可以说接入成本是非常之低。

![image.png](https://mosn.io/blog/posts/multi-protocol-deep-dive/1585209248669-1138c7d3-fc69-446c-99a9-65932aebca99.png)

Github: [https://github.com/mosn/mosn/tree/master/pkg/protocol/xprotocol/bolt](https://github.com/mosn/mosn/tree/master/pkg/protocol/xprotocol/bolt)

下面让我们进入正题，一步一步了解接入过程。

---

### Step1：确认协议格式

第一步，需要确认要接入的协议格式。为什么首先要做这个，因为协议格式是一个协议最基本的部分，有以下两个层面的考虑：

*   任何协议特性以及协议功能都能在上面得到一些体现，例如有无 requestId/streamId 就直接关联到协议是否支持连接多路复用；
*   协议格式与报文模型直接相关，两者可以构成逻辑上的映射关系；而这个映射关系也就是所谓的编解码逻辑；

![确认协议格式](https://mosn.io/blog/posts/multi-protocol-deep-dive/1585209248674-536ba7de-4f23-4797-a3db-cc085ec8a620.png)

以 SOFABolt 为例，其第一个字节是协议 magic，可以用于校验当前报文是否属于 SOFABolt 协议，并可以用于协议自动识别匹配的场景；第二个字节是 type，用于标识当前报文的传输类型，可以是 Request / RequestOneway / Response 中的一种；第三个字节则是当前报文的业务类型，可以是心跳帧，RPC 请求/响应等类型。后面的字段就不一一介绍了，可以发现，**理解了协议格式本身，其实对于协议的特性支持和模型编解码就理解了一大半，**因此第一步协议格式的确认了解是重中之重，是后续一切工作开展的前提。

---

### Step2：确认报文模型

![确认报文模型](https://mosn.io/blog/posts/multi-protocol-deep-dive/1585209248773-66c3234b-f805-4735-9e70-acf8abef294b.png)

顺应第一步，第二步的主要工作是确认报文编程模型。一般地，在第一步完成之后，应当可以很顺利的构建出相应的报文模型，SOFABolt 例子中可以看出，模型字段设计基本与协议格式中的 header / payload 两部分相对应。有了编程模型之后，就可以继续进行下一步——基于模型实现对应的框架扩展了。

---

### Step3：接口实现 - 协议

![接口实现-协议](https://mosn.io/blog/posts/multi-protocol-deep-dive/1585209248724-28eaa458-a928-4f19-bf16-96895808a5b8.png)

协议扩展，顾名思义，是指协议层面的扩展，描述的是协议自身的行为（区别于报文自身）。

目前多协议框架提供的接口包括以下五个：

*   Name：协议名称，需要具备唯一性；
*   Encoder：编码器，用于实现从报文模型到协议传输字节流的映射转换；
*   Decoder：解码器，用于实现从协议传输字节流到报文模型的映射转换；
*   Heartbeater：心跳处理，用于实现心跳保活报文的构造，包括探测发起与回复两个场景；
*   Hijacker：错误劫持，用于在特定错误场景下错误报文的构造；

---

### Step4：接口实现 - 报文

![接口实现-报文](https://mosn.io/blog/posts/multi-protocol-deep-dive/1585209248793-9cb8efd3-c12e-4da1-91f9-0901bcf36e16.png)

前面介绍了协议扩展，接下里则是报文扩展，这里关注的是单个请求报文需要实现的行为。

目前框架抽象的接口包括以下几个：

*   Basic：需要提供 GetStreamType、GetHeader、GetBody 几个基础方法，分别对应传输类型、头部信息、载荷信息；
*   Multiplexing：多路复用能力，需要实现 GetRequestId 及 SetRequestId；
*   HeartbeatPredicate：用于判断当前报文是否为心跳帧；
*   GoAwayPredicate：用于判断当前报文是否为优雅退出帧；
*   ServiceAware：用于从报文中获取 service、method 等服务信息；

---

### 举个例子

![案例](https://mosn.io/blog/posts/multi-protocol-deep-dive/1585209248756-4c3fce60-436b-4153-9372-b39fe80fc975.png)

这里举一个例子，来让大家对**框架如何基于接口封装处理流程**有一个体感：服务端心跳处理场景。当框架收到一个报文之后：

*   根据报文扩展中的 GetStreamType 来确定当前报文是请求还是响应。如果是请求则继续 2；
*   根据报文扩展中的 HeartbeatPredicate 来判断当前报文是否为心跳包，如果是则继续 3；
*   当前报文是心跳探测(request + heartbeat)，需要回复心跳响应，此时根据协议扩展中的 Heartbeater.Reply 方法构造对应的心跳响应报文；
*   再根据协议扩展的 Encoder 实现，将心跳响应报文转换为传输字节流；
*   最后调用 MOSN 网络层接口，将传输字节流回复给发起心跳探测的客户端；

当协议扩展与报文扩展都实现之后，MOSN 协议扩展接入也就完成了，框架可以依据协议扩展的实现来完成协议的处理，让我们实际演示一下 SOFABolt 接入的 example。

Demo 地址：[https://github.com/mosn/mosn/tree/master/examples/codes/sofarpc-with-xprotocol-sample](https://github.com/mosn/mosn/tree/master/examples/codes/sofarpc-with-xprotocol-sample)

---

## MOSN 多协议机制设计解读

通过 SOFABolt 协议接入的实践过程，大家对如何基于 MOSN 来做协议扩展应该有了一个初步的认知。那么 MOSN 多协议机制究竟封装了哪些逻辑，背后又是如何思考设计的？接下来将会挑选几个典型技术案例为大家进行解读。

---

### 协议扩展框架

**协议扩展框架 - 编解码**

![协议扩展框架-编解码](https://mosn.io/blog/posts/multi-protocol-deep-dive/1585227625966-1b00d83d-fff1-40f1-b6b1-3bda19db0afb.png)

最先介绍的是编解码机制，这个在前面 SOFABolt 接入实践中已经简单介绍过，MOSN 定义了编码器及解码器接口来屏蔽不同协议的编解码细节。协议接入时只需要实现编解码接口，而不用关心相应的接口调用上下文。

**协议扩展框架 - 多路复用**

![协议扩展看框架-多路复用](https://mosn.io/blog/posts/multi-protocol-deep-dive/1585209248762-c83706cd-b413-468c-80b1-151de9ae8f3c.png)

接下来是多路复用机制的解读，这也是流程中相对不太好理解的一部分。首先明确一下链接多路复用的定义：允许在单条链接上，并发处理多个请求/响应。那么支持多路复用有什么好处呢？

以 HTTP 协议演进为例，HTTP/1 虽然可以维持长连接，但是单条链接同一时间只能处理一个请求/相应，这意味着如果同时收到了 4 个请求，那么需要建立四条 TCP 链接，而建链的成本相对来说比较高昂；HTTP/2 引入了 stream/frame 的概念，支持了分帧多路复用能力，在逻辑上可以区分出成对的请求 stream 和响应 stream，从而可以在单条链接上并发处理多个请求/响应，解决了 HTTP/1 链接数与并发数成正比的问题。

类似的，典型的微服务框架通信协议，如 Dubbo、SOFABolt 等一般也都实现了链接多路复用能力，因此 MOSN 封装了相应的多路复用处理流程，来简化协议接入的成本。让我们跟随一个请求代理的过程，来进一步了解。

![上下游关联映射](https://mosn.io/blog/posts/multi-protocol-deep-dive/1585209248791-900751cb-c096-48d4-a5d5-d8247ef9d725.png)

1.  MOSN 从 downstream(conn=2) 接收了一个请求 request，依据报文扩展多路复用接口 GetRequestId 获取到请求在这条连接上的身份标识(requestId=1)，并记录到关联映射中待用；
2.  请求经过 MOSN 的路由、负载均衡处理，选择了一个 upstream(conn=5)，同时在这条链接上新建了一个请求流(requestId=30)，并调用文扩展多路复用接口 SetRequestId 封装新的身份标识，并记录到关联映射中与 downstream 信息组合；
3.  MOSN 从 upstream(conn=5) 接收了一个响应 response，依据报文扩展多路复用接口 GetRequestId 获取到请求在这条连接上的身份标识(requestId=30)。此时可以从上下游关联映射表中，根据 upstream 信息(connId=5, requestId=30) 找到对应的 downstream 信息(connId=2, requestId=1)；
4.  依据 downstream request 的信息，调用文扩展多路复用接口 SetRequestId 设置响应的 requestId，并回复给 downstream；

在整个过程中，框架流程依赖的报文扩展 Multiplexing 接口提供的能力，实现了上下游请求的多路复用关联处理，除此之外，框架还封装了很多细节的处理，例如上下游复用内存块合并处理等等，此处限于篇幅不再展开，有兴趣的同学可以参考源码进行阅读。

---

### 统一路由框架

![统一路由框架](https://mosn.io/blog/posts/multi-protocol-deep-dive/1585209248786-ff9c157a-5ff9-444b-8b0f-2da90ddb8392.png)

接下来要分析的是「统一路由框架」的设计，此方案主要解决的是非 HTTP 协议的路由适配问题。我们选取了以下三点进行具体分析：

*   通过基于属性匹配(attribute-based)的模式，与具体协议字段解耦；
*   引入层级路由的概念，解决属性扁平化后带来的线性匹配性能问题；
*   通过变量机制懒加载的特定，按需实现深/浅解包；

**统一路由框架 – 基于属性匹配**

![统一路由框架-基于属性匹配](https://mosn.io/blog/posts/multi-protocol-deep-dive/1585209248809-fe944cba-e8df-4497-8eff-c8d47131c918.png)

首先来看一下典型的 RDS 配置，可以看到其中的 domains、path 等字段，对应的是 HTTP 协议里的域名、路径概念，这就意味着其匹配条件只有 HTTP 协议才有字段能够满足，配置结构设计是与 HTTP 协议


# 参考资料

https://mosn.io/blog/posts/multi-protocol-deep-dive/

* any list
{:toc}