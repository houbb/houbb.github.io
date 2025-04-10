---
layout: post
title: 监控系统实战-11-RCA 根本原因分析(Root Cause Analysis) 如何实现？如何快速定位异常？去哪儿网根因分析实践攻略
date: 2018-11-25 09:14:43 +0800
categories: [Devops]
tags: [devops, monitor, apm, zabbix, sh]
published: true
---



# 一、背景

随着去哪儿网业务的发展和微服务架构的普及，公司内微服务的拆分粒度越来越细，导致服务间的调用错综复杂。

比如机票和酒店的下单场景，就会涉及到成百上千个应用的调用，而当此类场景出现异常产生报警甚至产生故障时，对开学同学来说查找并定位问题是个很大的挑战。

去哪儿网构建了自己的 APM 系统，包括监控(metric)、日志(logging)和调用链路(Tracing)，帮助开发同学定位问题。

但在实际排查问题的过程中，开发同学需要排查是报警的应用本身还是下游依赖的问题，需要逐层去排查调用链路、异常日志、监控指标等，这样就会导致有时定位问题的时间比较长。而对于影响业务的故障而言，导致的后果便是恢复时间较长，造成的损失较大。

我们对2022年上半年公司主要技术团队的99个故障进行分析，发现处理超时故障占比48.5%(30分钟内未恢复的故障，认为是超时故障)。并将故障处理超时的原因，归纳为以下7类：

![超时原因](https://mmbiz.qpic.cn/sz_mmbiz_png/YE1dmj1Pw7mpsvGhGJibjGU2iatJ3MafsYYYUZrJvk40ONIdfiaLRp7EllEOcUPmn4WRRf1r4ky9W6VHXEprAwjoQ/640?wx_fmt=png&tp=webp&wxfrom=5&wx_lazy=1&wx_co=1)


由上图可以看出，在故障处理超时的原因中，链路分析不清晰、未定位到 DB 问题、未定位到单机问题、未关注到异常增长等占比57.57%。

如果能够在报警或者故障时，自动的分析相关指标的调用链路、异常日志、DB 等问题，并依据权重对分析结果进行汇总和剪枝，最终将分析结果推送给开发同学，那么将大大减少开发同学排查问题的时间，有效的降低故障超时率。

基于此，去哪儿网根因分析系统-horus 应用而生。

# 二、实践框架

## 1.基础能力建设

去哪儿网一直在构建并完善企业级的 apm 系统，包括链路追踪系统 qtracer、监控系统 watcher、异常统计分析系统 heimdall 以及公司事件平台。

其中qtracer是公司自研的链路追踪系统，可以用来快速获取系统间的调用信息。

为了能够在监控报警时，快速检索出指标相关联的trace，我们进行了metric和trace的结合。

如下图所示，不同于业界常用的label标签关联，我们使用了trace的context进行关联，达到的效果是在某个时间点，一个带着trace信息的请求从入口进来，经过了方法foo()，而foo()中记录了指标foo.access.time，那么通过指标foo.access.time以及对应时间段，便能够查询到此条trace信息。

并且在报警发生时，qtracer系统会自动提高trace的采样率。

![基础能力建设](https://mmbiz.qpic.cn/sz_mmbiz_png/YE1dmj1Pw7md0z7CDAKgrQmkpibJke7ISZu1Q8iak2NRwMOD4EK64x5fYkZ8FFwOXwkSEdQ1x93vhyhYJLdibFM2Q/640?wx_fmt=png&tp=webp&wxfrom=5&wx_lazy=1&wx_co=1)

watcher 是公司的一站式监控平台，可以很容易的获取报警信息、指标数据和指标单机数据、以及基础监控数据(CPU、网络等)、DB 数据等。heimdall 是公司的异常统计分析系统，能够支持分钟级别的异常统计以及某个时间段内的同比环比。公司事件平台收集了全司应用的各种类型事件和变更，比如发布、配置、压测、k8s 事件等。
公司 apm 系统的构建和完善，为根因分析系统的数据获取提供了坚实的保障。

## 2.整体框架设计

根因问题定位，业界有许多优秀的探索，比如eBay链路分析、腾讯决策树方法等思路。

下面我们进行简单介绍。

### eBay 链路分析

链路分析，是通过分析 Trace 数据中的断链和错链问题，以定位出故障根因的方法。

![eBay 链路分析](https://mmbiz.qpic.cn/sz_mmbiz_png/YE1dmj1Pw7mpsvGhGJibjGU2iatJ3MafsY5HB5hNBy2YOZLC5ooMO8PjDCpbakBdttBQibPNzT64cm3Jpg6ltnv6g/640?wx_fmt=png&tp=webp&wxfrom=5&wx_lazy=1&wx_co=1)

如上图所示，通过对图上面部分3个核心链路的归并，可以很清晰的看到，在 userCheckout 这个链路中 calculateMoney 的调用接口由"coupon" -> "couponV2"后，对于 createOrder 来说，调用量上升了20%，延迟降低了5%，因此，倾向于定位是 coupon 结点的问题。

### 腾讯决策树方法

决策树是具有强解释性的有监督分类模型，其本质是一颗由多个判断节点组成的树，如下图所示，就是一个典型的两层结构：基于天气判断是否要出去玩。

![腾讯决策树方法](https://mmbiz.qpic.cn/sz_mmbiz_png/YE1dmj1Pw7mpsvGhGJibjGU2iatJ3MafsYdJpfWmLoKrkUsJXaicBXmeQlibo3Mh8Gdyib3dxIXMY48TFuJZfeEnI2Q/640?wx_fmt=png&tp=webp&wxfrom=5&wx_lazy=1&wx_co=1)


决策树的生成，就是将一个数据集基于某个特征将其分成 N 类，循环划分子集，直到满足一定条件（子集数），或者子集中数据无法再继续拆分。决策树本质就是 if-else，也就是说，我们根据一定的条件来对数据集做了分类，当一个数据落入某个节点时，它是有原因的，其原因就是它的生成路径。

决策树来做根因分析的大体流程：

特征工程：选择合适的数据，并将数据数值化

模型训练：利用sklearn等工具训练决策树模型

基于训练结果做根因分析，或做新数据预测分析

针对分析的结果做校验和优化

以上两种方法，对于根因分析有很好的借鉴意义。

但根因分析系统的实现，必须要结合公司的具体实际，包括基建、技术栈、业务场景等，以打造出符合去哪儿网自身的根因分析平台。

去哪儿网根因分析的构建思路，主要是模拟人的思维。

如下图所示，通过调研机票、酒店、公共和服务的开发同学在问题排查时的经验，我们发现大多开发同学在收到报警时，会通过报警查看trace调用链路，以获取当前应用以及调用的下游应用，然后结合自身的经验，判定大概是哪几个应用的问题，然后针对这些应用，去查看日志、事件等，最终定位问题。

![rca](https://mmbiz.qpic.cn/sz_mmbiz_png/YE1dmj1Pw7md0z7CDAKgrQmkpibJke7ISqMjf0PKoWjZic9Ul1t4BDPEGW2PIzov4DkR6zviaFCpTGicT3S94lQMicA/640?wx_fmt=png&tp=webp&wxfrom=5&wx_lazy=1&wx_co=1)


我们基于调研结果，并结合业界的实践，抽象出了去哪儿网根因分析系统分析定位的核心思路，即是：

定位范围 → 异常断言 → 关联挖掘 → 剪枝排序 → 结果输出。

在具体实现上，是以报警/指标为入口，通过分析关联trace，获取异常应用，并对异常应用进行多维度分析，对结果汇总、剪枝、排序后输出。

![trace](https://mmbiz.qpic.cn/sz_mmbiz_png/YE1dmj1Pw7mpsvGhGJibjGU2iatJ3MafsYa83gHkfdkkcVdKXs9VJlWiajzy9ketrCmibOjicsgLaoZWBsRNOGOyeRQ/640?wx_fmt=png&tp=webp&wxfrom=5&wx_lazy=1&wx_co=1)

上图为根因分析系统的整体架构图，主要包括以下6个模块：
api/listener：服务入口层，支持api触发分析以及listener监听报警消息触发分析
orchestration：分析编排控制层，负责控制整个分析过程以及控制整合分析结果
analyzer：具体的分析器，包括链路trace、运行时runtime、事件event、日志log、中间件middleware、以及可扩展的extender
data processor：分析结果处理模块，对分析结果进行聚合、权重判定、剪枝、排序
feedback/learning：反馈及学习模块
base data：基础数据层，负责获取及聚合分析模块所需的各种数据，比如event事件、日志信息、报警信息、指标数据等


# 3.核心模块介绍

## 3.1 trace分析模块

![trace分析模块](https://mmbiz.qpic.cn/sz_mmbiz_png/YE1dmj1Pw7mpsvGhGJibjGU2iatJ3MafsYkaV5sQFbbicl1VO5dicFLlKbN8jfJ91lQABS5NicibXOHCpaG2oAeGTkxw/640?wx_fmt=png&tp=webp&wxfrom=5&wx_lazy=1&wx_co=1)


Trace 模块的作用是根据报警或者指标，查询出对应时间段内的 trace 信息，并根据 trace 是否异常、T 值(T 值是去哪儿网大客户端的一个概念，是为了区分各业务线服务的，在请求的时候，会带一个参数 qrt 称之为 T 值。

不同的 T 值，对应的业务也不同)、相似度等筛选策略进行漏斗式过滤，获得一定数目的 trace，之后根据筛选得到的 trace 定位出异常应用。

Trace模块是整个根因分析系统的核心，也是分析结果能否准确的前提。

### 难点分析：

#### 1.时间段的确定：

对于监听报警所触发的分析，trace 时间段的选择是个需要首先考虑的问题。时间段过短，有可能导致相关 trace 未查询到；时间段过长，就会包含过多的无用 trace。

我们的开发同学在配置报警时，都是对一段时间内指标数值进行阈值判定，比如3m>4(连续3分钟大于4)，2%5m>7(5分钟内有2个点大于7)。因此我们会根据当前报警所设报警规则的时间段，再加一个特定的时间窗口(比如3分钟，在第一个点满足报警阈值时，异常便已经产生了，向前推一小段时间，以防止 trace 遗漏)，作为查询时间段。

#### 2.trace的筛选：

在前文我们提到过，在报警发生时，qtracer 会提高 trace 的采样率。因此即使我们选定的时间段比较短，仍会查询到大量的 trace(几千甚至数万条)。而如果每次根因分析都对如此规模的trace数据逐条进行拓扑构建并详细分析，会造成巨大的计算成本浪费，并且会极大延长分析耗时，因此需要对查询到的 trace 进行筛选。

trace 筛选的核心思想是漏斗式的筛选，首先根据 trace 是否异常进行分类。qtracer 在记录链路的过程中，如果某次调用判断为超时，或者 http/dubbo 返回状态码异常，便会将此次调用标记为异常，并将 trace 标记为异常 trace。若筛选出的异常 trace 量级仍然很大(比如大于500)，那么我们继续根据 trace 的相似度进行进一步的筛选。

对于非异常 trace，首先根据T值进行筛选，因为不同的 T 值，对应的业务场景也不同，调用链路也不同。对T值相同的 trace，根据相似度筛选出 n 条数据，为了提升相似度的判定速度，我们将图进行降维，根据特定的规则将图构建为字符串，转换为字符串的相似度算法。

#### 3.异常应用的判定：

在排查问题的过程中，异常 trace 要比非异常 trace 的作用大的多。

对于筛选到的异常 trace，首先进行拓扑构建并标记异常应用，之后对构建的 trace 拓扑进行归并，某个异常应用出现次数越多，则越倾向于是此应用导致的此次问题，其权重也就越高。

如下图所示，在 traceA、traceB、traceC 三条调用链路中，应用 C 都出现了异常，那么我们倾向于认为是应用 C 导致的此次问题。

但 qtracer 当前只能标记出调用超时、调用状态码等异常，对于调用的返回结果中的业务状态码并不会进行判断。因此某些无异常的应用，也是有可能导致此次问题。

我们在重点关注异常 trace 的同时，也会以非异常 trace 作为辅助。

对于非异常 trace，我们对当前报警所属应用节点下钻 n 层拓扑，拿到拓扑应用后，根据应用的报警浓度等策略进行异常应用判定。

![trace](https://mmbiz.qpic.cn/sz_mmbiz_png/YE1dmj1Pw7mpsvGhGJibjGU2iatJ3MafsYTgMvgHkw5dhfQeHbdENbSj5VqjuibbV1wyiaQRS9P9SOtqQgJ0RahcQQ/640?wx_fmt=png&tp=webp&wxfrom=5&wx_lazy=1&wx_co=1)

## 3.2 应用纬度分析模块

![应用纬度分析模块](https://mmbiz.qpic.cn/sz_mmbiz_png/YE1dmj1Pw7mpsvGhGJibjGU2iatJ3MafsYticEkCJhamT5BQ41EWhnU30cRicric2WCxF9elYqbnS1w0jXCQRShWoibA/640?wx_fmt=png&tp=webp&wxfrom=5&wx_lazy=1&wx_co=1)

trace 分析模块负责定位出异常应用，而应用纬度分析模块则是对异常应用进行多维度分析。我们通过对业务线开发同学定位问题的过程以及公司故障数据进行调研分析，抽象出了应用分析的四个维度，分别是
runtime：运行时分析，主要包括应用的单机实例(kvm、容器、宿主机)分析、业务指标单实例分析、JVM 分析如 full gc 等
middleware：中间件分析，目前主要是应用相关的 mysql 和 redis 分析
event：事件/变更分析，目前主要分析的是发布、配置变更、压测等，事件分析支持按部门配置，每个部门都可以单独配置自己关注的事件类型
log：日志分析，通过 heimdall 的异常日志统计能力，筛选出一段时间内的同比环比超过配置阈值的异常类型；并以筛选出的 trace id，从 es 查询出的异常日志作为补充

下面我们将挑选 runtime 和 middleware 两个较复杂的模块进行介绍。

### runtime

![runtime](https://mmbiz.qpic.cn/sz_mmbiz_png/YE1dmj1Pw7md0z7CDAKgrQmkpibJke7ISxzfbmdlEaKx6UWgGZ53YAdDxL26pSURzspuAmPepydcePCibXujZ1KQ/640?wx_fmt=png&tp=webp&wxfrom=5&wx_lazy=1&wx_co=1)


runtime 是应用的运行时异常分析模块，目前主要分析单机实例、jvm 指标、单机业务指标三个部分。其中单机实例包括单机基础指标和宿主机指标两个部分，单机基础指标对于应用不同的实例类型会分析不同的指标，宿主机的健康状况也会影响到单机实例，因此我们找到应用的实例对应的宿主机，并分析宿主机的健康状态。

JVM 指标目前主要分析是 full gc 和 young gc 数据，我们根据专家经验，会对每个 java 应用添加 gc 报警，并支持应用 owner 修改阈值。当分析过程中发现有相关报警时，便会将报警汇总到分析结果。

业务线很多应用有大量的实例，很多达到了500以上。

某些报警或者故障是应用某个或者某几个实例导致的，我们报警系统配置的指标是所有实例聚合得到的一个总指标，因此我们会根据配置的业务指标，获取对应时间段内的单机指标数，纵向对比，使用离散度算法比如3西格玛算法，尝试定位出异常单机实例。

如下图所示，应用有五个实例，而实例4在对应时间段内都偏离其余四个实例，那么我们倾向于认为实例4有问题。

![4](https://mmbiz.qpic.cn/sz_mmbiz_png/YE1dmj1Pw7mpsvGhGJibjGU2iatJ3MafsYnTR6Q6wEG8eKzKRWNWTpdxL6mpYr0icOtDRicLibscupvCSrRmRWMkia1A/640?wx_fmt=png&tp=webp&wxfrom=5&wx_lazy=1&wx_co=1)

### middleware

![middleware](https://mmbiz.qpic.cn/sz_mmbiz_png/YE1dmj1Pw7mpsvGhGJibjGU2iatJ3MafsYzfZ4QSWPGUd8LEc6zDUrxAXVKriakaxfLnUD0PZtWEgxtBicCRV93lPg/640?wx_fmt=png&tp=webp&wxfrom=5&wx_lazy=1&wx_co=1)

middleware 是应用的中间件分析模块，目前主要分析应用的 mysql 和 redis 实例运行状况。

如上图所示，模块首先根据应用名，调用 tc 同学提供的接口，获取对应的 mysql 和 redis 的 namespace 及宿主信息，然后进行异常分析。

在 DBA 同学的帮助下，我们分别确认了 mysql 和 redis 相关的核心报警。

mysql：
pmp-check-mysql-status-pc：pxc 节点状态，告警说明 pxc 不可用
pmp-check-mysql-status-size：pxc 集群没有可用节点，业务无法访问
pmp-check-mysql-status-fc：pxc 集群触发流控，整个集群变慢甚至不可用
pmp-check-mysql-status-threads-running：mysql 线程异常，实例负载过高或者有慢查询导致堵塞
pmp-check-mysql-processlist：mysql 线程异常， 实例负载过高或者有慢查询导致堵塞
pmp-check-mysql-replication-delay：主从同步延迟
pmp-check-mysql-replication-running：主从同步失败
pmp-check-mysql-status-connect：连接数已满，无法连接
check_mmm：集群状态有问题，节点下线
pmp-check-mmm-vip：mmm 集群的 vip 连通性，告警说明 mmm 集群 vip 不通，业务无法访问数据库

redis：
q-check-redis-cpu-usage：redis cpu 告警
q-check-redis-memory-usage：redis 内存告警
q-check-redis-latency-port：redis 延迟告警，比如 redis 大 key 时有可能导致此报警

检测到对应的 mysql/redis 的 namespace 或者宿主有以上核心报警时，则直接将报警汇总到分析结果；若无报警，则分析慢查询指标数量，若增长趋势异常，则将异常信息汇总到分析结果。

## 3.3 权重体系模块

权重体系在整个根因分析过程的剪枝排序环节非常重要，直接决定最终推送结果的准确性。

目前根因分析系统主要抽象出了四类权重，以对分析模块分析出的结果进行综合计算。

主要包括应用权重、静态权重、动态权重和强弱依赖权重。

下面我们将从what(是什么)、why(为什么)、how(怎么做)。

三个方面来阐述四类权重。

### 应用权重：

what：应用权重表示在整个调用链路中，当前异常应用影响报警/故障的概率的大小。

why：比如我们对多条异常trace进行分析，发现应用B多次被标记为异常应用，那么我们倾向于认为，是应用B大概率导致此次问题，计算得到的应用B的权重就会很高。又或者对于一条调用链路A->B->C→D，如果当前报警的是应用A，那么根据专家经验，应用B对A的影响要比应用C对A的影响要大，因此我们认为应用B的权重要比应用C要高。

how：目前应用异常权重分两部分计算，异常trace的应用权重通过trace归并计算，比如每重复出现一次，权重增加0.1等，并且异常应用也要综合考虑和当前报警应用的拓扑联通性以及连通层级。而对于非异常trace，主要是根据应用距离当前报警应用的距离计算，类似于欧几里德距离，距离报警应用越近，权重越高。

### 静态权重：

what：静态权重也就是经验权重，我们总结了2022年上半年的故障原因分布占比，来设置根因分析每个维度的权重比。

why：其实这种静态权重代表了去哪儿网自身的业务特点，比如因发布或者配置变更导致的故障占比50%，说明在去哪儿网发布或配置变更是一个相对比较危险的动作，如果再次发生故障，且我们在事件分析中定位到了异常应用有发布或者变更，那么我们就会倾向于认为这次问题大概率是此次发布或者变更导致的。

how：人为统计故障原因分布占比，并配置到应用配置中。需要注意的是，这个静态权重不是一成不变的，需要每隔一段时间，就根据新的数据调整一次。我们的反馈和学习模块，也会自动根据故障原因分布和用户反馈结果，进行静态权重的调整。

### 动态权重：

what：动态权重，我们也称为root case权重，根据各个原因的严重级别来对自身进行升级，以避免真正的根因被淹没掉。

why：静态权重只能是一个大概的推测，并且已经归一化了，起到的更多是default设置的作用，提供一些参考意义。比如一个报警或故障，我们分析出链路中某个异常应用有一些调用超时日志，且同时有mysql/redis实例连接失败，那么按照专家经验来看，mysql/redis实例连接失败是一个严重级别很高的原因，因此mysql/redis实例连接失败这个case，便可以自身升权。

how：目前动态权重主要是依靠专家经验，以及case的严重程度，比如磁盘使用率100%，IO使用率100%，DB/redis挂掉，CPU使用率超过90%等，都可以动态升权。

### 强弱依赖权重：

what：强弱依赖权重其实有些类似应用权重，强弱依赖里明确标明了，A应用的 m1接口依赖B应用的 m2接口是强依赖还是弱依赖，根据此信息可以断定，B应用的异常尤其是m2接口的异常对A应用尤其是A应用的m1接口影响的概率。去哪儿网强弱依赖关系，是通过混沌工程进行强弱依赖演练得到的。

why：强弱依赖是已经人为或系统标记了 A 应用到B应用是否是强依赖或若依赖，这是一个非常重要的信息，比如 A 同时依赖 B、C两个应用，但是根据强弱依赖信息，我们知道B应用对A应用是强依赖关系，而C应用对A应用则是弱依赖关系，那么当A故障时，我们同时发现了B和C两个应用此时都有异常信息，那么此时可以倾向认为B的异常导致了A故障，B的权重大于C。

how：目前强弱依赖标记的是接口维度，在根因分析过程中，根据trace分析拿到当前异常的接口，则可以根据API搜索当前应用的此API的强依赖，如果没有被标记，那么可以回归聚合，将接口维度的强弱收敛到应用维度的强弱，比如A依赖了B的3个接口，2个弱依赖接口一个强依赖接口，那么我们就可以认为B是A的强依赖，按照这种该逻辑来收敛应用级的强弱依赖，强依赖的权重大于弱依赖。


# 三、效果展示

## 1.准确率

![准确率](https://mmbiz.qpic.cn/sz_mmbiz_png/YE1dmj1Pw7mpsvGhGJibjGU2iatJ3MafsYM7P3qqiaRcFQBwFibe3U4ndqXLLdVnVcqUUup97b33Yc5rBRWUicZDxeg/640?wx_fmt=png&tp=webp&wxfrom=5&wx_lazy=1&wx_co=1)

根因分析，是概率性的推荐，核心是缩小范围。

我们目前会推荐概率最大的前五条，若前五条异常信息包含根因，那么我们就认为此次分析是准确的。

但从实战来看，根因分析推荐结果中的根因，大多集中在前3条。

自从2022年12月根因分析系统上线之后，我们都会统计每月的故障数据和线上的真实报警准确率。

如上图所示，对于可分析的故障(有报警/监控指标)，根因分析系统的准确率平均在70%以上。

## 2.故障根因定位实战

根因分析系统上线以来，辅助业务线同学快速定位了很多线上故障，大大缩短了故障恢复的时间。

比如对于故障 ”机票国内往返包展示率从 X%下降到 Y%“，刚开始开发同学怀疑是国际压测导致，并发现 redis 耗时上涨，发现也和压测时间吻合，并准备重启相关应用的主机。

这时有开发同学看到了根因分析由报警触发的分析结果，发现有同学变更了应用配置，紧急回滚配置后，故障恢复。

![故障根因定位实战](https://mmbiz.qpic.cn/sz_mmbiz_png/YE1dmj1Pw7mpsvGhGJibjGU2iatJ3MafsYloHNoGBictibkibfn0Jz8N8hGCr6zVLFf7B8WruFA8WVI5uGJr460QPeA/640?wx_fmt=png&tp=webp&wxfrom=5&wx_lazy=1&wx_co=1)

在今年五一期间，对于报警“机票某业务自营展示率低于Z%”，值班同学及时查看根因分析推送结果，发现调用链路中有应用的 mysql 实例线程异常，及时联系了 DBA 同学处理，避免了更大故障的发生。

![故障根因定位实战](https://mmbiz.qpic.cn/sz_mmbiz_png/YE1dmj1Pw7mpsvGhGJibjGU2iatJ3MafsYyIPzurQpKzYiaruO3TVfvxeMPpch9nicF0lXT4jXH5YWpAYoLqWjk7Dw/640?wx_fmt=png&tp=webp&wxfrom=5&wx_lazy=1&wx_co=1)

## 3.其他应用场景

根因分析系统在支持监听报警自动触发的同时，也支持 api 多维度触发，包括报警/指标触发、单应用多维度触发(比如分析某个应用的各种维度，包括 runtime、middleware、log、event 等)、单应用单维度触发(比如只关注应用的某个维度，如 runtime)。目前已有多个场景通过 api 接入了根因分析系统。

应用监控面板

![应用监控面板](https://mmbiz.qpic.cn/sz_mmbiz_png/YE1dmj1Pw7mpsvGhGJibjGU2iatJ3MafsYadORTw360ic8ROurwwll799FuKd7OfKG6eqsicMAXyGAyU52tPMYKKZw/640?wx_fmt=png&tp=webp&wxfrom=5&wx_lazy=1&wx_co=1)

应用监控面板是监控系统 watcher 开发的应用级看板，主要反映当前应用的运行状况和健康状态，包括异常信息，异常日志、api 概览等，其中的应用异常信息，包括 runtime、log、middleware 等，便是通过调用根因分析系统的 api 接口实现。

线上智能验证

线上智能验证系统是以 java 应用为观测对象，通过静态分析识别变更的 java 方法，通过动态采集获取 Java 方法调用链路，然后基于代码知识库的方法匹配，精准分析变更影响的 Java 方法调用链路，并基于影响的链路推荐测试流量，评估测试覆盖率的测试体系。

在验证环节，线上智能验证通过调用根因分析系统的 api 接口，包括应用的 runtime、log、middleware 等多维度，分析应用的健康状态，以验证测试的完善度。

# 四、总结展望

当前根因分析系统已经涵盖了机票、酒店、公共、服务四个部门的所有核心报警，每周自动分析报警量在千次以上；对于非核心报警，业务线开发同学很多每周手动触发次数在百次左右。

很多开发同学已经养成了在线上有异常报警时，查看根因分析报告的习惯。

在根因分析系统上线的第一季度内，故障责任部门是业务研发所有故障共18个，处理超时故障个数7个，故障处理超时率由22年下半年60.9%降低至38.8%。

目前根因分析系统对应用的分析维度只有runtime、log、middleware、event四种，自根因分析系统上线以来，我们收到了业务线同学的大量建议，后续准备扩展更多的分析纬度，涵盖更广的范围，包括死锁分析、gc详情分析、线程池分析等。

随着去哪儿网业务的恢复和增长，未来根因分析将会发挥更大的价值。我们也会加大根因分析的领域覆盖范围和使用推广，进一步提升分析准确率，优化使用体验，为助力业务故障的快速恢复提供更大的助力。

# 参考资料

https://mp.weixin.qq.com/s?__biz=MzA3NDcyMTQyNQ==&mid=2649275712&idx=1&sn=ec32731043d53914e32ddbb7f0d5428c&chksm=8696a302c4041770e75ee195ef41ac41bc38337d6a06c2b1713b44d0105d06d93e45b790f92a&mpshare=1&scene=1&srcid=0402cB0Z7xyA6BrGq8DUuyvQ&sharer_shareinfo=fa4164d52c5a35d9eecc343e48ee431d&sharer_shareinfo_first=fa4164d52c5a35d9eecc343e48ee431d#rd


* any list
{:toc}