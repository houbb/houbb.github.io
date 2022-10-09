---
layout: post
title:  分布式注册中心-01-overview 演进历史
date:  2022-07-02 09:22:02 +0800
categories: [Distributed]
tags: [distributed, register-center, sh]
published: true
---


# 服务注册中心

服务注册中心（下称注册中心）是微服务架构非常重要的一个组件，在微服务架构里主要起到了协调者的一个作用。

因为各个公司的架构、规模、部署环境等等都不尽相同，所以在注册中心在业界有很多不同的实践，包括各种各样的技术选型、层出不穷的技术改进。

本文将从注册中心的功能实现、功能扩展、规模变大等实际情况出发，结合现有的技术框架以及一些国内外公司的技术实践，来介绍下 笔者了解的 注册中心的演进。

另外其它例如 DNS、组播等地址发现机制本文不展开讨论，只讨论注册中心。

阅读本文之前，我们先统一一下基本术语，对齐一下大家的理解。

| 名词	                           |  解释 |
|:----|:----|
| 注册中心(Registry)	               |  服务注册中心，本文主要解释的微服务组件。 |
| 注册中心客户端（Registry Client）	| 不管是服务提供者还是服务调用者，都算是注册中心的客户端，本文里简称客户端。 |
| 注册中心管理端（Registry Console）| 	注册中心数据的管理端，本文里简称管理端 。 |
| 服务(Service)	                   |  一般是指一个接口，可以包括多个方法。例如订单服务包含有查询订单、新增订单等方法 |
| 服务提供者(Provider)	           |  暴露一个监听端口，提供一到多个服务。 |
| 服务调用者(Consumer)	           |  连接服务提供者的端口，发起远程调用。 |

# 注册中心功能

## 注册中心与配置中心

很多人经常把注册中心和配置中心混为一谈，一般这么认为的因为服务注册的数据其实就是配置的一种，其实这样解释也不无道理，的确注册中心的数据是配置的一种。

但是注册中心之所以独立的存在，那是因为注册中心的数据有一定的业务独立性，一般都是为了描述微服务相关的。

所以本文的观点就是注册中心完全不依赖配置中心，而是一个独立的系统。

## 注册中心需求

注册中心一般包含如下几个功能：

（1）服务发现：

服务注册/反注册：保存服务提供者和服务调用者的信息

服务订阅/取消订阅：服务调用者订阅服务提供者的信息，最好有实时推送的功能

服务路由（可选）：具有筛选整合服务提供者的能力。

（2）服务配置（不包括其它无关配置）：

配置订阅：服务提供者和服务调用者订阅微服务相关的配置

配置下发（可选）：主动将配置推送给服务提供者和服务调用者

（3）服务健康检测

检测服务提供者的健康情况

## 一致性分歧

> [CAP 理论](https://houbb.github.io/2018/09/06/distributed-theory-cap)

这里不得不提一下，我们知道分布式里一个重要的理论，那就是 CAP。

在注册中心的发展上面，一直有两个分支：

一个就是 CP 系统，追求数据的强一致性。

还有一个是 AP 系统，追求高可用与最终一致。

## 为什么不用DNS

DNS 只是到 IP 级别，无法处理端口等信息。

DNS 携带的数据较少，例如节点权重、序列化方式等等，无法传递。

另外 DNS 没有节点状态管理功能，如果由外部系统刷新，那么将无法剔除死的节点。

#  注册中心发展阶段

注册中心的规模一定是随着业务的发展而发展的，在不同的阶段有不同的技术实现方案。

注册中心数据源一般会选择文件存储，数据库存储，KV存储等等。

## 小型注册中心

这个阶段的注册中心，一般最关心的肯定是服务发现这个特性，而且可能是一个很小的体量、很短的开发迭代周期、我们需要一个快速开发上手的环境。

具体情况：

1. 单数据中心

2. 服务规模较小：接口数在 5K 以下，注册中心客户端数量在 50K 以下。

## 中型注册中心

这个阶段的注册中心，架构已经非常复杂，涉及到跨机房容灾等特性。

一般会有专门的技术团队来做注册中心的日常运维。

具体情况：

1. 多数据中心

2. 服务规模较大：接口数在 20K 以下，注册中心客户端数量在200K以下。

## 大型注册中心

这个阶段的注册中心，数据量已经非常大，可能一个注册中心已经无法满足需求，必须拆为多个注册中心，甚至需要容量的无限扩展。具体情况：

1. 非常多的数据中心

2. 服务规模十分大，单节点无法满足全量存储。

# CP类注册中心演进

典型的有Zookeeper，Consul，etcd等。

## 阶段一：注册中心高可用

部署5个主节点（只是按经验值举例，3台或者7台都行），只要半数以上存活，其中一个会成为Leader。

客户端随机选择一台直接接入主节点。客户端拿注册中心的地址可以通过DNS或者其它地方动态发现。

管理端从主节点的其中一台读取数据。

![阶段一：注册中心高可用](https://upload-images.jianshu.io/upload_images/3994147-20c18727477b064f.png)

## 阶段二：注册中心提高性能

此时如果读取节点的数据量特别大的话，那么可能会影响性能，那么我们可以做一些读写分离的操作。

在5台主节点之外，部署多台Zookeeper Observer节点（可扩展），客户端接入Observer节点。

主节点不处理长连接请求。

管理端从某个Observer读取数据。

![注册中心提高性能](https://upload-images.jianshu.io/upload_images/3994147-bc07dbc4110643cc.png)

**Consul也有Consul Client节点，类似Zookeeper的Observer节点**

这样的架构作为小型注册中心基本没啥问题。

## 阶段三：服务高可用

通过Zookeeper的临时节点可以实现状态检测，但是一般不是很推荐。

因为注册中心和服务提供者断开连接的时候，注册中心其实是无法判断服务提供者是服务异常还是只是网络分区，最好是有额外的辅助进行判断。

例如提供一组状态检测服务，部署在机房的不同域（例如跨机架、跨交换机等，越分散越好），进行一定的投票，如果半数以上认为死了，则上报状态给注册中心。

![服务高可用](https://upload-images.jianshu.io/upload_images/3994147-8fcee218b4b1ca02.png)

## 阶段四：跨机房容灾

如果此时出现多个机房，还要做数据共享的话，那么一定需要三个及以上机房。

下面的图我就不画多个节点了，Zookeeper以集群的图展示。

每个机房部署相同的节点，当其中一个机房出现网络分区，那么剩下的两个机房继续可用。

状态检测服务只检查自己同机房的节点。

![图4：单注册中心跨机房容灾](https://upload-images.jianshu.io/upload_images/3994147-e6506380cb922e55.png)

## 阶段5：跨机房数据访问 

假如每个机房之间的数据是独立的，那么得部署独立的注册中心。

此时如果需要客户端做与多个注册中心连接，或者注册中心之间自己做数据同步。

图 5 展示的是，注册中心直接的节点是独立的不共享的，由客户端进行跨注册中心数据访问，在客户端做数据聚合。

![跨机房数据访问](https://upload-images.jianshu.io/upload_images/3994147-9a33cbcdda50e7ff.png)

图 6 展示的是，注册中心直接的节点是独立的，但是数据是共享的，由注册中心直接做数据同步合并，客户端无需处理。

![图6：多注册中心跨机房数据同步](https://upload-images.jianshu.io/upload_images/3994147-0bf88d8ee4a53471.png)

Consul 提供了个功能叫跨数据中心访问，但是其实数据是分开存放的。

例如 dc1 和 dc2，在网络正常的情况下，dc1 可以访问 dc2 的数据；但是网络断开的时候，dc1 是无法访问 dc2 的数据，dc1 本地并没有存放 dc2 的数据。

可以通过第三方实现做数据同步，参考：[consul-replicate](https://link.jianshu.com/?t=https://github.com/hashicorp/consul-replicate)

这样的架构作为中型注册中心基本没啥问题。

# AP类注册中心演进

我们会选用一些数据源，例如DB、文件、KV存储等，但是直接接入数据源的就不多见了，一般会有个自己实现的注册中心。

在下面的图中，DB、文件、KV存储我们统称“Datasouce（数据源）”。

## 阶段一：注册中心高可用

图 7 我们采用数据库主备或者是 Redis 集群作为一个统一的数据源，然后开发 Registry Proxy 程序（以下简称注册中心实例），这些注册中心实例之间并无数据交互，数据统一存在后端的数据源里，实现数据最终一致。

![图7：注册中心统一数据源](https://upload-images.jianshu.io/upload_images/3994147-1d9d5419d33137f6.png)

还有一种方案的变种是放在一个文件系统里，自己做数据同步，如图 8 所示。

![图8：注册中心数据源数据同步](https://upload-images.jianshu.io/upload_images/3994147-e9e6352b52173c6b.png)

Eureka 的设计就是图 8 的简化版本，它把 Data replicate 和 Registry Proxy 都放在 Eureka-Server 里。

## 阶段二：注册中心提高性能 

只有数据源扛得住，注册中心实例其实是可以无限扩展的。

这种代理模式的注册中心还有个好处就是：代理的业务逻辑可以自己编写。这个地方可以优化的地方非常的多。

例如服务节点推送，在CP系统里基本上都是推送全量的服务节点，而在代理里面可以做推送变化部分的服务节点。

假如一个服务有1000个服务提供者，5000个服务调用者；当增加了1个服务提供者的时候，原来的推送数量是1001x5000，而代理模式可以进行特殊处理变成1x5000，大大减少推送数据。

## 阶段三：服务高可用 

同 CP 注册中心高可用。

##  阶段四：跨机房容灾 

大部分依赖数据源的跨机房容灾。

当然可以做一些缓存，例如本地缓存等等。

以数据库为例。

![图9：注册中心只读缓存](https://upload-images.jianshu.io/upload_images/3994147-bd939bfcf11514eb.png)

注册中心的只读缓存，如果内存里放得下则可以放在注册中心实例的内存里，如果放不下则可以是单独的存储服务。

当主库机房挂了，其它机房切到新的主库。 切换期间只能从注册中心只读缓存里读数据，但是不能修改数据。

如果是基于文件系统的，那么只有保证网络分区的时候，保证可以脏读即可。

## 阶段5：跨机房数据访问 

和 CP 类注册中心类似，可能在多个机房都会部署独立的注册中心，而且服务数据是全局共享的。

一种方案就是多个注册中心直接做数据同步、聚合，图9 中的 DB 主从可以换成其它数据源。

![图9：注册中心数据源数据同步](https://upload-images.jianshu.io/upload_images/3994147-8a30b8e9abeb4f74.png)

另外一种是注册中心实例对数据源的数据多写，图10 中的 DB 主从可以换成其它数据源。这样做的话，每个数据源里的数据是最终一致的。

![图10：注册中心实例数据源多写](https://upload-images.jianshu.io/upload_images/3994147-29c4ba8008bf4892.png)

## 阶段6：数据无限水平扩展

当数据量大到单机无法承受，那么就需要进行数据分片了。

有了注册中心实例（Proxy）的存在，这个事情就很好处理了，只需要在这个注册中心实例上增加分片的逻辑，原则上数据是可以无限扩展的，而且也不用修改客户端的逻辑，实现真正的轻客户端。

## 小结

最后还是那句话，架构是演进来的，目前绝大部分使用者还属于小型注册中心阶段，真正需要考虑跨机房容灾的其实不多，不需要在一开始就考虑最终级的架构方案。

经常听见有的初级使用者就说 Zookeeper 这不好那不行有很多坑，很多时候都是场景没用好或者考虑不够，如果目前就百来个接口千来个客户端的服务注册中心，就没啥好纠结的了，随便哪个方案都能Hold住你的需求。

# 主流注册中心产品

<table>
<thead><tr><th>&nbsp;</th><th><strong>Nacos</strong></th><th><strong>Eureka</strong></th><th><strong>Consul</strong></th><th><strong>CoreDNS</strong></th><th><strong>Zookeeper</strong></th></tr></thead>
<tbody>
    <tr><td>一致性协议</td><td>CP+AP</td><td>AP</td><td>CP</td><td>—</td><td>CP</td></tr><tr><td>健康检查</td><td>TCP/HTTP/MYSQL/Client Beat</td><td>Client Beat</td><td>TCP/HTTP/gRPC/Cmd</td><td>—</td><td>Keep Alive</td></tr>
    <tr><td>负载均衡策略</td><td>权重/<br> metadata/Selector</td><td>Ribbon</td><td>Fabio</td><td>RoundRobin</td><td>—</td></tr><tr><td>雪崩保护</td><td>有</td><td>有</td><td>无</td><td>无</td><td>无</td></tr><tr><td>自动注销实例</td><td>支持</td><td>支持</td><td>支持</td><td>不支持</td><td>支持</td></tr>
    <tr><td>访问协议</td><td>HTTP/DNS</td><td>HTTP</td><td>HTTP/DNS</td><td>DNS</td><td>TCP</td></tr>
    <tr><td>监听支持</td><td>支持</td><td>支持</td><td>支持</td><td>不支持</td><td>支持</td></tr>
    <tr><td>多数据中心</td><td>支持</td><td>支持</td><td>支持</td><td>不支持</td><td>不支持</td></tr>
    <tr><td>跨注册中心同步</td><td>支持</td><td>不支持</td><td>支持</td><td>不支持</td><td>不支持</td></tr>
    <tr><td>SpringCloud集成</td><td>支持</td><td>支持</td><td>支持</td><td>不支持</td><td>支持</td></tr>
    <tr><td>Dubbo集成</td><td>支持</td><td>不支持</td><td>支持</td><td>不支持</td><td>支持</td></tr>
    <tr><td>K8S集成</td><td>支持</td><td>不支持</td><td>支持</td><td>支持</td><td>不支持</td></tr>
</tbody>
</table>

## SOFARegistry

[分布式注册中心-02-SOFARegistry](https://houbb.github.io/2022/07/02/register-center-02-sofaregister)

## Nacos

[分布式注册中心-03-NACOS](https://houbb.github.io/2022/07/02/register-center-03-nacos)

## Eureka

[eureka-用于弹性中间层负载平衡和故障转移的 AWS 服务注册表。](https://houbb.github.io/2021/09/06/erueka)

## Consul

[Consul 是一种服务网格解决方案，提供具有服务发现，配置和分段功能的全功能控制平面。](https://houbb.github.io/2018/10/31/consul)

## ZooKeeper

[ZooKeeper-01-overview](https://houbb.github.io/2016/09/25/zookeeper-01-overview)

## Kubernetes

[Kubernetes-01-快速开始 k8s](https://houbb.github.io/2018/08/18/docker-manager-k8-01-overview)

# 参考资料

[我们做出了一个分布式注册中心](https://www.sofastack.tech/blog/we-made-a-distributed-registry/)

[微服务：注册中心ZooKeeper、Eureka、Consul 、Nacos对比](https://blog.csdn.net/fly910905/article/details/100023415)

[5种微服务注册中心如何选型？这几个维度告诉你！](https://juejin.cn/post/7012084821224603656)

[微服务架构 3. 注册中心与服务发现](https://developer.aliyun.com/article/855737)

[服务注册中心 SRC](https://cloud.tencent.com/product/src)

[微服务注册中心：Consul——概念与基础操作](https://cloud.tencent.com/developer/article/1828346)

[服务注册发现与注册中心对比-Eureka,Consul,Zookeeper,Nacos对比](https://blog.51cto.com/lovebetterworld/2864302)

[服务注册中心架构演进](https://www.jianshu.com/p/5014bb302c7d)

[微服务架构中常见的注册中心](https://segmentfault.com/a/1190000023568313)

* any list
{:toc}