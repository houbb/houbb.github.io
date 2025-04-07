---
layout: post
title: 监控系统实战-11-RCA 根本原因分析(Root Cause Analysis) 如何实现？阿里本地生活EMonitor根因分析大揭秘
date: 2018-11-25 09:14:43 +0800
categories: [Devops]
tags: [devops, monitor, apm, zabbix, sh]
published: true
---

# 阿里本地生活EMonitor根因分析大揭秘

阿里集团针对故障处理提出了“1/5/10”的目标-- 1 分钟发现、5 分钟定位、10 分钟恢复，这对我们的定位能力提出了更高的要求。

EMonitor 是一款集成 Tracing 和 Metrics、服务于饿了么所有技术部门的一站式监控系统，其覆盖了

前端监控、接入层监控；

业务 Trace 和 Metric 监控；

所有的中间件监控；

容器监控、物理机监控、机房网络监控。

每日处理总数据量近 PB，每日写入指标数据量几百 T，日均几千万的指标查询量，内含上万个图表、数千个指标看板，并且已经将所有层的监控数据打通并串联了起来。

但是在故障来临时，用户仍然需要花费大量时间来查看和分析 EMonitor 上的数据。

比如阿里本地生活的下单业务，涉及到诸多应用，每个应用诸多 SOA 服务之间错综复杂的调用关系，每个应用还依赖 DB、Redis、MQ 等等资源，在下单成功率下跌时，这些应用的负责人都要在 EMonitor 上查看指标曲线以及链路信息来进行人肉排障以自证清白，耗时耗力，所以自动化的根因分析必不可少。

# 根因分析建模

业界已经有好多在做根因分析的了，但是大都准确率不高，大部分还在 40% 到 70% 之间，从侧面说明根因分析确实是一个难啃的骨头。

根因分析看起来很庞大，很抽象，无从下手，从不同的角度（可能是表象）去看它，就可能走向不同的路。

那如何才能透过表象来看到本质呢？

我这里并不会一开始就给你列出高大上的算法解决方案，而是要带你重新认知根因分析要解决的问题到底是什么。

其实好多人对要解决的问题都模糊不清，你只有对问题理解清楚了，才能有更好的方案来解决它。

## 要解决什么样的问题

举个例子：现有一个应用，拥有一堆容器资源，对外提供了诸多 SOA 服务或者 Http 服务，同时它也依赖了其他应用提供的服务，以及 DB 资源、Redis 资源、MQ 资源等等，具体见下图；那我们如何才能够全面的掌控这个应用的健康状况呢？

![要解决什么样的问题](https://mmbiz.qpic.cn/mmbiz_png/tMJtfgIIibWIebHWv02zLBtDL8xynFic8rzrvczE5qTnO1JkDOBMN6hCmofwN1soMic2xQaaRTlYYKe4rf0cHvEibQ/640?wx_fmt=png&tp=webp&wxfrom=5&wx_lazy=1&wx_co=1)

我们需要掌控：

掌控这个应用的所有入口服务的「耗时」和「状态」

掌控每个入口服务之后每种操作的「耗时」和「状态」

### 应用入口

一个应用都有哪些入口？

SOA 服务入口；

Http 服务入口；

MQ 消费消息入口；

定时 job 入口；

其他的一些入口。

### 操作和行为

进入每个入口之后，都可能会有一系列的如下 5 种操作和 1 种行为

（下面的操作属性都是以阿里本地生活的实际情况为例，并且都包含所在机房的属性）：

DB 远程操作：有 dal group、table、operation（比如select、update、insert等）、sql 的操作属性；

Redis 远程操作：有 command 的操作属性；

MQ 远程操作（向MQ中写消息）：有 exchange、routingKey、vhost 的操作属性；

RPC 远程操作：有 远程依赖的 appId、远程 method 的操作属性；

Local 操作（即除了上述4种远程操作之外的本地操作）: 暂无属性；

抛出异常的行为：有异常 name 的属性。

那我们其实就是要去统计每个入口之后的 5 种操作的耗时情况以及状态情况，以及抛出异常的统计情况。

针对远程操作其实还要明细化，上述远程操作的每一次耗时是包含如下 3 大部分：

客户端建立连接、发送请求和接收响应的耗时；

网络的耗时；

服务器端执行的耗时。

有了上述三要素，才能去确定远程操作到底是哪出了问题，不过实际情况可能并没有上述三要素。

我们的实际情况也是没有的，只能找简单的替换方案，通过判断每个应用的tcp重传是否抖动上升来简易判断是否存在网络问题。

# 故障的结论

针对故障的结论，我们并不是只给出一个最终的根因，而是需要能够详细呈现整个故障链路，以及每个链路节点中故障的详细信息

有了上述数据的全面掌控，当一个故障来临的时候，我们可以给出什么样的结论？

哪些入口受到影响了？

受影响的入口的本地操作受到影响了？

受影响的入口的哪些远程操作受到影响了？

1、具体是哪些远程操作属性受到影响了？

2、是客户端到服务器端的网络受到影响了？

3、是服务器端出了问题吗？

受影响的入口都抛出了哪些异常？

上述的这些结论是可以做到非常高的准确性的，因为他们都是可以用数据来证明的。

然而第二类根因，却是无法证明的：GC 问题；/ 容器问题。

他们一旦出问题，更多的表现是让上述 5 种操作耗时变长，并且是没法给出数据来明确证明他们和 5 种操作之间的关联，只是以一种推测的方式来怀疑，从理论上来说这里就会存在误定位的情况。

还有第三类更加无法证明的根因：变更问题


# 我们的特点

针对链路拓扑，我们并不会使用所谓的高大上的知识图谱的方案，我们只需要将调用关系存放在相关指标的tag上即可，我们就可以通过实时的指标数据来获取实时的链路拓扑，比如指标 appId1.rpc中包含如下tag组合


```
method:metho1-1, serviceApp:appId2，
serviceMethod:method2-1
method:metho1-1, serviceApp:appId3，
serviceMethod:method3-1
```

比如我们查询 appId1.rpc指标，过滤条件为

method=method1-1，group by serviceApp，serviceMethod，从查询结果中我们就自然得知appId1依赖了appId2、appId3以及依赖的方法。

类似的，从调用指标上{appId}.soa_provider，我们也可以看到是哪些client appId在调用当前appId的服务的哪些method服务

针对因果关系，我们并不会去采用所谓的曲线相似性检测来识别相关的指标，而是通过更加严谨的逻辑关系来证明而不是所谓的推测。

上帝从来都没有告诉你曲线相似的指标是有关联的，曲线不相似的指标是没有关联的，比如某个appId的SOA method1曲线抖动了，它的DB也抖动了，难道是DB抖动引起了SOA method1的抖动？

这2者到底有没有关联？（有可能是别的SOA服务调用DB抖动引起DB抖动，而当前SOA服务抖动可能是因为依赖的RPC调用抖动），我们不是靠曲线相似性检测而是通过实实在在的数据来证明他们的关联性。

我们会记录每个SOA服务的各个环节的耗时，比如指标appId1.soa_span，包含如下tag组合

```
method:metho1,spanType=DB
method:metho1,spanType=Redis
method:metho1,spanType=RPC
```

那么我们只需要查询appId.soa_span指标，过滤条件method=method1，group by spanType，就是可以从中看得到method1服务抖动的根因到底是不是DB类型的抖动引起的


# 根因分析实现

在明确了我们要解决的问题以及要求的故障结论之后，我们要采取什么样的方案来解决呢？

下面首先会介绍一个基本功能「指标下钻分析」。

## 指标下钻分析

一个指标，有多个 tag，当该指标总体波动时，指标下钻分析能够帮你分析出是哪些 tag 组合导致的波动。

比如客户端的 DB 操作抖动了，利用指标下钻分析就可以分析出

哪个机房抖动了？

哪个 dal group 抖动了？

哪张表抖动了？

哪种操作抖动了？

哪个 sql 抖动了？

再比如远程 RPC 操作抖动了，利用指标下钻分析就可以分析出

哪个机房抖动了？

哪个远程 appId 抖动了？

哪个远程 method 抖动了？

其实这个就是去年 AIOPS 竞赛的题目，详细见：

http://iops.ai/competition_detail/?competition_id=8&flag=1

## 解决方案

我们的方案：

什么叫抖动？某个SOA服务耗时500ms，某个RPC环节耗时250ms，那么这个RPC环节一定是有问题的吗？不一定，必须要跟它正常情况进行一个对比才能知道它的这个耗时是否正常。所以需要先去学习一个正常水准，然后基于正常水准的对比才能确定某个环节是否抖动了

我们的要求：在圈定的曲线范围内，前一半时间范围要正常，异常抖动存在于后一半时间范围内

通过对前一半正常时间范围的学习，然后基于学习的水准来判定识别后一半时间范围的异常抖动

### 步骤1 对整体的曲线确定波动范围

#### 关键点1.1

对前一半时间范围提取数据抖动特征，运用二阶指数平滑算法进行数据预测，根据预测值和实际值的波动信息，提取如下3个信息

原始数据的最大值

原始数据的最小值

原始数据和预测数据之间的波动方差

问题1：为什么不对原始数据求波动方差？

要对一些趋势性的曲线能够适应，比如临近高峰期，平均响应时间也是在正常范围内缓慢上升的

#### 关键点1.2

对后一半数据仍然使用二阶指数平滑算法进行数据预测，根据预测值和实际值的波动，验证波动是否超过上述标准波动方差的3倍，如果超过则为波动点，并提取如下6个信息：

第一次波动点：第一次波动的点

最大的波动点：波动值最大的点

最后一次波动点：波动值最大的点

初始点：它和波动值最大的点关于第一次波动点对称

最后一次波动点

向上波动还是向下波动

那么初始点~第一次波动点之间的数据是正常范围，第一次波动点~最大的波动点是异常范围


### 步骤2 在计算范围内算出每根时间线的波动值

#### 关键点2.1

对每根时间线，先求出正常范围下的平均值，然后基于这个正常的平均值来计算该时间线在0到最大波动点的波动方差（加上权重比例，越靠后的点权重比例越大），并且方差要除以该时间线在正常范围内的平均值的开方

问题2：为什么要除以平均值的开方？

方差针对场景是：各个时间线都在统一的平均值下，可以使用方差来判定各个时间线的抖动情况。然而真实情况下，各个时间线的平均值都不一样，这就会造成时间线1在某个时刻从1抖动到100，然而时间线2在哪个时刻从1000抖动到1200，明显时间线1抖动更大，然而方差却是时间线2比较大。

所以对方差除以平均值，但是为什么又选择了平均值的开方而不是平均值？

其实是否除以平均值，不管除不除都是2个极端，假如除以那么也会将一些抖动小的案例的波动值提高了，所以应该是取一个权衡

#### 关键点2.2

对于每个时间线的第一次波动点、最大波动点、最后一次波动点减去正常范围的平均值，然后再除以正常范围的平均值求出3个波动比率

### 步骤3 对所有时间曲线进行一些过滤

#### 关键点3.1

假如整体是向上波动，那么对于上述3个波动比率均<0则过滤掉

假如整体是向下波动，那么对于上述3个波动比率均>0则过滤掉

#### 关键点3.2

求出top10的波动比率，然后在top10中去掉一个最大值和一个最小值，求出一个平均波动比率，再按照一定比率比如1/10，算出一个基准波动比率，对于小于该基准波动比率的都可以过滤掉

同时判断0到第一个异常点之前的数据，都要小于第一个异常点，同时容忍一定比例的大于第一个异常点，假如不符合的话，都可以过滤掉


### 步骤4 对过滤后的时间曲线按照波动值进行 KMeans 聚类

对于过滤后的所有时间线按照波动方差进行KMeans聚类，目前N的选择是根据数据量的大小来进行选择的

比如时间线个数小于等于10则聚3类

### 步骤5 从排名靠前的分类中挑选出方案，为每个方案计算方案分数

然后从对聚类靠前的时间线提取公共特征，公共特征其实就是一个方案

将前2个聚类划分为一个集群A，将所有聚类划分成一个集群B

遍历上述所有方案，计算每个方案在上述集群A、B中的表现行为打分，打分项有如下几点：

每个方案在目标集群A中的占比

每个方案在目标集群A中满足的个数与在目标集群B中满足的个数占比

每个方案的大小分数，每个方案包含的内容越多，分数越小，也就是说倾向于用最简单的方案

每个方案，波动比率的满足率，高于基准波动率的组合满足，否则不满足，从而计算出该方案的一个满足率

综上所有项的乘积结果算出来的分数即为方案的分数

分数最高的方案即为我们最终求解的方案

# 根因分析流程

有了指标下钻分析功能之后，我们来看如何进行根因分析：

![根因分析流程](https://mmbiz.qpic.cn/mmbiz_png/tMJtfgIIibWIebHWv02zLBtDL8xynFic8ribMtHduic4f3KGO5AVlqxWvn44aC9cy1VYG1Q8M3OYvnLMbpKEOiapv3Q/640?wx_fmt=png&tp=webp&wxfrom=5&wx_lazy=1&wx_co=1)

假如QPS下跌但是成功率并未下跌，那么就需要上钻分析，通过指标下钻分析算法{appId}.soa_provider分析出QPS下降的clientApp，继续递归去分析这个clientApp的SOA服务状况

执行下钻分析，对指标{appId}.soa_span执行指标下钻分析算法，得到异常抖动的ezone、spanType属性，比如WG机房的DB操作抖动了，比如WG机房的RPC操作抖动

然后到对应操作类型的指标中再次进行指标下钻分析，比如DB操作抖动则分析{appId}.db，比如RPC抖动则分析{appId}.rpc，得出该操作下：

哪些入口受到该操作的波动影响了？

哪些操作属性异常波动了？

假如该操作是远程操作，还要继续深入服务器端进行分析

假如是DB操作，那么可以继续到远程服务器端再深入分析，比如我们的远程服务器端是DAL中间件代理层，可以继续分析它相关的指标，可以分析出相关的抖动属性，比如

某个 table 的所有操作耗时抖动？

某条sql操作耗时抖动？

某台具体DB实例抖动？

SQL的停留时间 or 执行时间抖动？

假如是RPC操作，那么可以继续到远程appId端再递归分析

针对受影响的这些入口使用指标下钻分析{appId}.soa_exception，哪些异常也抖动了（有些异常一直在抛，但是跟本次故障无关）；

再次查看上述抖动的操作是否是由 GC 问题、容器问题、变更问题等引起的。

比如对指标{appId}.soa_provider进行指标下钻分析，分析其抖动是不是仅仅由于某个hostName导致的，假如是某个hostName导致，则可以继续分析是不是GC抖动导致的

# 落地情况

阿里本地生活的根因分析能力，1 个月内从产生根因分析的想法到实现方案上线到生产（不包括指标下钻分析的实现，这个是之前就已经实现好的了），2个月内在生产上实验和优化并推广开来，总共 3 个月内实现了从 0 到 1 并取得了如下成绩

85 个详细记载的案例中准确定位 81 次，准确率 95%；

最高一天执行定位 700 多次；

平均定位耗时 1 秒；

详细的定位结果展示。

下图即为从4月1号到6月23号每天根因分析次数的统计情况

![根因](https://mmbiz.qpic.cn/mmbiz_png/tMJtfgIIibWIebHWv02zLBtDL8xynFic8rBjWVbuU0mFecnKf2QgSf0fia3c7tGjXQoHrgLSGmRVL9lIswicUwC0fA/640?wx_fmt=png&tp=webp&wxfrom=5&wx_lazy=1&wx_co=1)

## 准确性

我们对定位准确性的要求如下：

要明确给出受到影响的入口服务有哪些；

每个受到影响的入口服务抖动的操作根因以及操作属性都要正确；

每个入口服务抖动的根因很可能不一样的，比如当前应用的 SOA1 是由于 Redis 操作抖动，当前应用的 SOA2 是由于远程 RPC 依赖的其他 SOA3 抖动导致，SOA3 是由于 Redis 操作抖动导致；

客户端操作耗时抖动到底是客户端原因还是服务器端原因要保证正确；

容器问题时，要保证不能定位到错误的容器上。


# 准确率为什么这么高？

我认为主要是以下 3 个方面：

## 数据的完整度

假如是基于采样链路去分析，必然会存在因为漏采导致误判的问题。

我们分析的数据是全量链路数据转化成的指标数据，不存在采样的问题，同时在分析时可以直接基于指标进行快速分析，临时查采样的方式分析速度也是跟不上的。

## 建模的准确性

你的建模方案能回答出每个 SOA 服务抖动的根因分别是什么吗？

绝大部分的建模方案可能都给不出严谨的数据证明，以 DB 是根因为例，他们的建模可能是 SOA 服务是一个指标，DB 操作耗时是一个指标，2 者之间是没有任何关联的，没有数据关联你就给不出严谨的证明，即没法证明 DB 的这点抖动跟那个 SOA 服务之间到底有没有关联，然后就只能处于瞎推测的状态，这里就必然存在误判的情况。

而我们上述的建模是建立了相关的关联，我们会统计每个入口后的每种操作的耗时，是可以给到严谨的数据证明。

## 异常判定的自适应性

比如 1 次 SOA 服务整体耗时 1s，远程调用 RPC1 耗时 200ms，远程调用 RPC2 耗时 500ms，到底是哪个 RPC 调用耗时抖动呢？耗时最长的吗？超过一定阈值的 RPC 吗？

假如你有阈值、同环比的限制，那么准确率一定不高的。

我们的指标下钻分析在解决此类问题的时候，是通过当前情况下的波动贡献度的方式来计算，即使你耗时比较高，但是和之前正常情况波动不大，那么就不是波动的根因。

# 速度为什么这么快？

我认为主要是以下 2 方面的原因：

## 业内领先的时序数据库 LinDB

根因分析需要对诸多指标的全量维度数据进行 group by 查询，因此背后就需要依靠一个强大的分布式时序数据库来提供实时的数据查询能力。

LinDB 时序数据库是我们阿里本地生活监控系统 E-Monitor 上一阶段的自研产物，在查询方面：

强悍的数据压缩：时序数据原始数据量和实际存储量之比达到 58:1，相同 PageCache 的内存可以比别的系统容纳更多的数据；

高效的索引设计：索引的预过滤，改造版的 RoaringBitmap 之间的 and or 操作来进行高效的索引过滤；

单机内充分并行化的查询机制：利用 akka 框架对整个查询流程异步化。

整体查询效率是 InfluxDB 的几倍到几百倍，详细见文章

[分布式时序数据库 - LinDB ](https://zhuanlan.zhihu.com/p/35998778)

## 指标下钻分析算法的高效

我们不需要每个时间线都进行预测；

实际要计算的方案个数非常之少；

方案算分上可以适应于任何加减乘除之类的指标计算上，比如根因定位中的 `平均响应时间 = 总时间 / 总次数`

SOA1 的平均响应时间 t1 和 SOA2 的平均响应时间 t2，SOA1 和 SOA2 的总体平均响应时间并不是 t1 和 t2 的算术平均而是加权平均，如果是加权平均，那么久需要多存储一些额外的信息，并且需要进行额外的加权计算


# 实际案例

## 案例1-Redis抖动

故障现场如下，某个核心应用的 SOA 服务抖动上升：

![up](https://mmbiz.qpic.cn/mmbiz_png/tMJtfgIIibWIebHWv02zLBtDL8xynFic8r4Kr2gewBVicXduibYburGar3iaP9xPqoHPMk6zPjuiaaVAeTib4gFxYibRhA/640?wx_fmt=png&tp=webp&wxfrom=5&wx_lazy=1&wx_co=1)


直接点击根因分析，就可以分析到如下结果

![根因分析](https://mmbiz.qpic.cn/mmbiz_png/tMJtfgIIibWIebHWv02zLBtDL8xynFic8rUuxQiajibiaffAOUAaYFowTIIVotBge6EQHI4S9GyYyLGFLP56O35CkWQ/640?wx_fmt=png&tp=webp&wxfrom=5&wx_lazy=1&wx_co=1)

AppId1 的 SOA 服务在某个机房下抖动了

```
依赖的 AppId2 的 SOA 服务抖动
依赖的 AppId5 的本地处理和 Redis 操作耗时抖动
依赖的 AppId6 的本地处理和 Redis 操作耗时抖动
依赖的 AppId3 的 SOA 服务抖动
依赖的 AppId4 的本地处理和 Redis 操作耗时抖动
```

这里的本地处理包含获取 Redis 连接对象 Jedis 的耗时，这一块没有耗时打点就导致划分到本地处理上了，后续会进行优化。

这里没有给出详细的 Redis 集群或者机器跟我们的实际情况有关，可以暂时忽略这一点。

点击上面的每个应用，下面的表格都会列出所点击应用的详细故障信息

受影响的 SOA 服务有哪些，比如 AppId1 的 3 个 SOA 服务受到影响；
每个 SOA 服务抖动的根因，比如 AppId1 的 3 个 SOA 服务都受到 AppId2 的 1 个 SOA 服务的抖动影响；

表格中每一个链接都可以跳转到对应的指标曲线监控面板上。

再比如点击 AppId4，显示如下：

![appid4](https://mmbiz.qpic.cn/mmbiz_png/tMJtfgIIibWIebHWv02zLBtDL8xynFic8rO9foXQecpxXicKrMBnFphOlmtyXcicCiat7AsgEhl4bySSYaFsiciaaVibIg/640?wx_fmt=png&tp=webp&wxfrom=5&wx_lazy=1&wx_co=1)

AppId4 的 1 个 SOA 方法抖动

该方法的本地处理抖动（实际是获取 Redis 连接对象 Jedis 的耗时抖动）；
该方法依赖的 Redis 操作抖动；
该方法抛出 Redis 连接异常；

## 案例2-DB实例抖动

故障现场如下，某个核心应用的 SOA 服务抖动上升

![DB实例抖动](https://mmbiz.qpic.cn/mmbiz_png/tMJtfgIIibWIebHWv02zLBtDL8xynFic8rV0zUKMatbAk5jRqoTbor0ibH5zM8HOyXic3nRNCHbWHPMl4COib3URnvg/640?wx_fmt=png&tp=webp&wxfrom=5&wx_lazy=1&wx_co=1)

点击根因分析，就可以帮你分析到如下结果

![根因分析](https://mmbiz.qpic.cn/mmbiz_png/tMJtfgIIibWIebHWv02zLBtDL8xynFic8rgHvhJsBjuD0dQCHicJVtnUAuBEDtMK8QG4LMosapFFkRTWfMsejytdg/640?wx_fmt=png&tp=webp&wxfrom=5&wx_lazy=1&wx_co=1)

AppId1 的 SOA 服务在某个机房下抖动了

```
依赖的 AppId2 的 SOA 服务抖动
依赖的 DB 服务抖动
依赖的 AppId3 的 SOA 服务抖动
依赖的 DB 服务抖动
依赖的 AppId2 的 SOA 服务抖动
```

点击 AppId2，可以看下详细情况，如下所示：

![appid2](https://mmbiz.qpic.cn/mmbiz_png/tMJtfgIIibWIebHWv02zLBtDL8xynFic8rCyOUB5fZyplGBRQoX44QmpbVBVMA3richjOtl8OmfzOvtN0ktOAJVAg/640?wx_fmt=png&tp=webp&wxfrom=5&wx_lazy=1&wx_co=1)

从表格中就可以看到，根因是 DB 的一台实例抖动导致这个 dal group 所有操作抖动。

## 案例3-上钻分析案例

故障现场如下，某个核心应用的 SOA 服务调用量下降，成功率并未变化

![上钻分析案例](https://mmbiz.qpic.cn/mmbiz_png/tMJtfgIIibWIebHWv02zLBtDL8xynFic8rHGUHFZgeQK8zojiczCSWDm6sXhz714yV5DSzvkkFRAicY93Z2sbc22ibg/640?wx_fmt=png&tp=webp&wxfrom=5&wx_lazy=1&wx_co=1)

点击根因分析，就可以帮你分析到如下结果

![rca](https://mmbiz.qpic.cn/mmbiz_png/tMJtfgIIibWIebHWv02zLBtDL8xynFic8rxdu0TxHD6uic0Pr1GJtfOU6c3n8WrzItcjed9rNJkFAQMbISTib91xKA/640?wx_fmt=png&tp=webp&wxfrom=5&wx_lazy=1&wx_co=1)

就是这个appId的上游的上游操作了相关的变更导致调用量下跌

## 案例4-共同依赖抖动

故障现场如下，某个核心应用的 SOA 服务相应时间抖动

![共同依赖抖动](https://mmbiz.qpic.cn/mmbiz_png/tMJtfgIIibWIebHWv02zLBtDL8xynFic8rojHOLnJlBjRP3HStgWoEs3YL7e0sYqMn3QYyhBHUq4xT4gttiaK4lqA/640?wx_fmt=png&tp=webp&wxfrom=5&wx_lazy=1&wx_co=1)

点击根因分析，就可以帮你分析到如下结果

![本地](https://mmbiz.qpic.cn/mmbiz_png/tMJtfgIIibWIebHWv02zLBtDL8xynFic8rKHn8PD6ojhHENBM4J9elqjwrIfCFaR9wAmSQFRibzBPh6l9fhktOp9g/640?wx_fmt=png&tp=webp&wxfrom=5&wx_lazy=1&wx_co=1)

均是因为依赖图中标出的appId1而导致抖动

## 案例5-整体机房网络抖动

故障现场如下，某个核心应用SOA服务相应时间抖动、成功率抖动

![整体机房网络抖动](https://mmbiz.qpic.cn/mmbiz_png/tMJtfgIIibWIebHWv02zLBtDL8xynFic8r2F1m2Bac0BcjVXYFa2WKfOicnhnnVQ64sd8IpPDvalzBqaVFQtxukZA/640?wx_fmt=png&tp=webp&wxfrom=5&wx_lazy=1&wx_co=1)

点击根因分析，就可以帮你分析到如下结果

![根因分析](https://mmbiz.qpic.cn/mmbiz_png/tMJtfgIIibWIebHWv02zLBtDL8xynFic8rwYVWBPV1xTKxBxmicZia9KrKABbxCWUdaB5TmTiaiagKAaficAGwlLl3uFg/640?wx_fmt=png&tp=webp&wxfrom=5&wx_lazy=1&wx_co=1)

## 案例6-单容器抖动

故障现场如下，某个核心应用SOA服务相应时间抖动

![单容器抖动](https://mmbiz.qpic.cn/mmbiz_png/tMJtfgIIibWIebHWv02zLBtDL8xynFic8rBQWib5n8YAAblx1Y7N33XTlROyic3DWlFIHp64mFMCkQGGUPXYStQ8WA/640?wx_fmt=png&tp=webp&wxfrom=5&wx_lazy=1&wx_co=1)

点击根因分析，可以分析到如下结果

![根因分析](https://mmbiz.qpic.cn/mmbiz_png/tMJtfgIIibWIebHWv02zLBtDL8xynFic8rHcfZOEC8ON2Pqico2lSaRC4RM4SVQAE8BVxcwzHY5qdfN5neSGqOS6g/640?wx_fmt=png&tp=webp&wxfrom=5&wx_lazy=1&wx_co=1)

当前appId远程依赖的另一个appId的容器抖动导致的

# 参考资料

https://mp.weixin.qq.com/s?__biz=MzI0NTE4NjA0OQ==&mid=2658366990&idx=3&sn=ed1e137643fe951e0b8ba27f40efda77&chksm=f311fb08b7cc67c9216d08e88473f74d4ba73c659210a600ad3e7d946193116a2c120156a6eb&mpshare=1&scene=1&srcid=0402wvPD6ETH401jXLnly4kw&sharer_shareinfo=ef97b805ac69fb55970da2a1badb26bf&sharer_shareinfo_first=ef97b805ac69fb55970da2a1badb26bf#rd


* any list
{:toc}