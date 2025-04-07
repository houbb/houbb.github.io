---
layout: post
title: 监控系统实战-11-RCA 根本原因分析(Root Cause Analysis) 如何实现？AIOps在小红书的探索与实践——故障定位与诊断
date: 2018-11-25 09:14:43 +0800
categories: [Devops]
tags: [devops, monitor, apm, zabbix, sh]
published: true
---

# 背景

## 1.1 AIOps是什么？

AIOps（Artificial Intelligence for IT Operations），是基于已有的可观测和运维数据(指标、Trace、变更、日志、告警等)，通过机器学习相关算法进行数据分析与决策，来解决运维工具没办法解决的问题，让运维相关工作从工具化过渡到智能化。

随着整个互联网业务急剧膨胀，以及服务类型的复杂多样，基于人为指定规则的专家系统逐渐变得力不从心，常规运维工具的不足日益凸显。

当前小红书在可观测和运维领域，DevOps相关工具初见雏形，也面临着同样的困境。 

![AIOPS](https://mmbiz.qpic.cn/sz_mmbiz_png/vxnkL2N86IuoxtYCzDkZaNW3GcD6pjEmOa8MgDtUbZsqr20VvXRAW02icygvhNn6HhwHhZMm1Fy0DR1B2LcZzRQ/640?wx_fmt=png&from=appmsg&tp=webp&wxfrom=5&wx_lazy=1&wx_co=1)

DevOps 的出现，部分解决了上述问题，其强调从价值交付的全局视角，但 DevOps 更强调横向融合及打通。

AIOps 是 DevOps 在运维（技术运营）侧的高阶实现，两者并不冲突。

AIOps 不依赖于人为指定规则，主张数据驱动，由机器学习算法自动地从海量运维数据（包括事件本身以及运维人员的人工处理日志）中不断地学习，不断提炼并总结规则，指挥监测系统采集大脑决策所需的数据，做出分析、决策。

综上看，DevOps 水平是 AIOps 的重要基石，而 AIOps 将基于 DevOps 将 AI 和研发体系很好的结合起来，这个过程需要三方面的知识：

1）行业、业务领域知识，跟业务特点相关的知识经验积累，熟悉生产实践中的难题；

2）运维领域知识，如指标监控、异常检测、故障发现、故障止损、成本优化、容量规划和性能调优等；

3）算法、机器学习知识，把实际问题转化为算法问题，常用算法包括如聚类、决策树、卷积神经网络等。

## 1.2 AIOps能带来什么？

AIOps的最终目标是无人值守，解放人力，让系统去帮助我们更好的进行业务的持续、高效、高质量的迭代。

1）稳定性保障领域，AIOps当前能帮助我们进行智能异常检测，监控告警不再需要阈值配置，逐步做到自动化，对告警进行收敛避免告警风暴；能进行故障根因定位，找到问题根源，并在特定场景进行止损操作，做到故障自愈；

2）成本管理领域，AIOps当前能帮助我们进行容量评估、预测和规划，从而更加合理的利用资源，制定预算和采购计划，更进一步甚至对资源进行合理调度，提高资源利用率。

3）效率提升领域，AIOps当前能帮我们进行变更检查，及时发现变更中的问题和回滚，成熟之后能做到智能变更，大大提升操作变更的质量和效率；

# 现状

## 2.1 行业产品AIOps能力分析

![行业产品AIOps能力分析](https://mmbiz.qpic.cn/sz_mmbiz_png/vxnkL2N86ItlyE0miaVGzhWWdVRXTwsPZncriciaRwicFaZuTHALxkO0TnXA151NjKAP0xdX6jG5UjQgVMu2Tj5jgw/640?wx_fmt=png&from=appmsg&tp=webp&wxfrom=5&wx_lazy=1&wx_co=1)

## 2.2 小红书AIOps现状

2022~2023年期间，小红书处于DevOps阶段，

在可观测领域有服务性能监控、链路追踪、Prometheus指标监控等工具，

在运维领域有流程平台、预案平台、混沌平台、告警配置、服务树等工具，

在研发效能领域有发布平台、代码仓库、云效平台等工具，


具备一定的自动化能力，各领域的需求都有相关工具来承接，各工具初步完成了数据化和流程化，在功能完备性和体验上仍有提升空间，智能化基本处于未开始或起步阶段。

![devops](https://mmbiz.qpic.cn/sz_mmbiz_png/vxnkL2N86ItlyE0miaVGzhWWdVRXTwsPZoo6SAiaKu3MIw6Yc0icFde6Gcnmr2Y5T7Xjz6JIjibtTk8hJf0dAL2jMQ/640?wx_fmt=png&from=appmsg&tp=webp&wxfrom=5&wx_lazy=1&wx_co=1)

# 演进路线规划

## 3.1 能力框架

（1）基础数据能力：为了能进行相关场景探索，基础数据需要提供Metric时序数据、Trace数据、Log数据、拓扑数据、事件数据、以及分析后的知识数据的快速存储和查询能力，为上游实时和离线计算提供数据支撑。

（2）算法能力：算法能力层，主要解决三个层面的问题，一是根据场景提供响应的基础算法支持，异常检测算法、时序预测算法、分类算法、特征提取算法、因果分析算法、根因分析算法等；在基础算法的基础上，提供样本管理、流程编排、模型训练、模型评估和参数调优等构架模型的能力；有构建模型能力之后，根据运维场景和数据，把场景数据化，数据模型化，对故障管理、变更管理、资源管理输出能力，除此之外，与IaaS和PaaS层合作，我们提供已有AIOps能力和经验，加上IasS/PaaS自有的专业领域知识和经验，助力IaaS/PasS层智能化。

（3）运维场景支撑：算法能力不是完全独立构建，而是根据运维场景和需求进行能力的扩展和补充。

在故障管理中，主要会有故障发现、故障定位、预案推荐、风险巡检、影响分析、相似故障推荐、告警收敛、故障定级、故障自愈、故障预测、告警抑制等场景，会用到异常检测、时序预测、关联分析、根因分析、相似故障分析、日志模式识别、多维指标分析等算法能力；

在变更管理中，主要会有变更检测、智能调度、智能变更、自动修复等场景，会用到单时序异常检测、多时序异常检测等，

在资源管理中，主要会有配置推荐、成本优化、容量规划、预算规划、资源调度、性能调优等场景，会用到时序预测、服务画像等。

（4）助力IasS/PasS：公司IaaS和PaaS层，支持着所有的业务线，而IaaS/PaaS层又包含着各自的专业领域知识和经验，要想整个AIOps体系较好的运转，需与IasS/PaaS层合作，提供已有AIOps能力和经验，加上IasS/PaaS自有的专业领域知识和经验，助力IaaS/PasS层智能化，从而达成整个服务生态的智能化。

![演进路线规划](https://mmbiz.qpic.cn/sz_mmbiz_jpg/vxnkL2N86ItlyE0miaVGzhWWdVRXTwsPZlv75L53Sx0C8cuic8XZxDsC0BGmsg4OBicARtB74oDLDXNkOmlFNQLcA/640?wx_fmt=other&from=appmsg&tp=webp&wxfrom=5&wx_lazy=1&wx_co=1)


## 3.2 演进策略

根据对标业界在AIOps领域的发展，建议在AIOps领域划分稳定性保障、成本管理、效率提升三个核心方向的演进策略。

稳定性保障：在稳定性保障部分，算法需要提供异常检测、多维指标分析、相似分析、时序预测、关联挖掘、因果分析、相识故障分析、日志模式识别、异常传播分析、异常聚类、异常节点排序等能力，主要支撑故障管理下的相关运维场景。

成本管理：在成本管理部分，算法需要提供时序预测、服务画像、性能调优能力，自动识别服务属于计算密集型、内存密集型、IO密集型，让预算、采购、交互、计费等环节的管理更加精准，更精确的进行成本管理。

效率提升：在效率提升部分，算法需要提供异常检测能力，助力变更管控，做到智能变更、智能调度，甚至是自动修复。

以上三个方向在整个AIOps体系中的演进顺序如下所示：

![演进策略](https://mmbiz.qpic.cn/sz_mmbiz_jpg/vxnkL2N86ItlyE0miaVGzhWWdVRXTwsPZ61Dq1anRMr4j5vkQXwyiaBckjxpF4wwib8UFqxvnPZtwE6uZmFbPuo8g/640?wx_fmt=other&from=appmsg&tp=webp&wxfrom=5&wx_lazy=1&wx_co=1)

## 3.3 关联团队建设

在AIOps团队中，通常可以将人员按职能划分为三个核心团队：

SRE团队、开发工程师团队（专注于稳定性保障）和算法工程师团队。

这三个团队在AIOps相关工作中各司其职，相互配合，缺一不可。

SRE团队的主要职责是从业务的技术运营中提炼需求。他们在开发实施前需要深入考虑需求方案，并在产品上线后持续对产品数据进行运营分析。

开发工程师团队负责平台相关功能和模块的开发。他们的目标是降低用户使用门槛，提高使用效率。根据企业AIOps的成熟度和能力，他们在运维自动化平台和运维数据平台的开发上会有不同的侧重。在工程实施过程中，他们需要考虑系统的健壮性、鲁棒性和扩展性，合理拆分任务以确保项目成功落地。

算法工程师团队则主要负责理解和梳理来自SRE的需求。他们需要调研业界方案、相关论文和算法，进行尝试和验证，最终输出可落地的算法方案。同时，他们还需要持续迭代和优化这些算法。

这三个团队通过紧密协作，共同推动AIOps的实施和发展，为企业带来更高效、更智能的IT运维管理，各团队之间的关系图如下图所示：

![SRE](https://mmbiz.qpic.cn/sz_mmbiz_png/vxnkL2N86IuoxtYCzDkZaNW3GcD6pjEmStbxMA40f3XyFoFyW6u4f4sGicrwcxvsJ2VeBS29jDsvD42DA6iaHpkw/640?wx_fmt=png&from=appmsg&tp=webp&wxfrom=5&wx_lazy=1&wx_co=1)

# AIPOS 故障定位与诊断

## 4.1 问题定义和抽象

微服务架构具有松散耦合，可独立部署，高度可拓展，可维护和易于测试等诸多优点，已经是当前云原生环境下软件开发主流的应用架构方式。但微服务架构同样带来了一些挑战，最显而易见的是复杂度的提升。

单个服务可能足够小和简单，但是成百上千这样的服务组合起来，它们之间存在错综复杂的调用关系，如果当中某个或某类服务出现问题，引发一条或多条链路异常，面对复杂的调用链路如何快速定位到故障节点和原因一直是业界难题。

复杂场景的调用拓扑包含的服务数甚至超过300个，关系和节点已经多到无法分辨，包含大量的节点和调用关系，再叠加上每个服务的系统指标、中间件指标、接口指标、变更和告警，巨量的信息需要确认和排查，这也是故障定位复杂的根本原因。

为了尽可能的缩小范围和简化问题，我们将故障定位定义为：当某个业务场景出现问题时，基于其调用链路拓扑寻找根因服务节点，并列举可能的根因（包括相流量陡增、网络异常、变更、存储、Exception、机器异常等影响业务可用性的问题）。

故障定位的范围限定在指定的调用拓扑下，且出现可用性问题，至于策略效果类故障不在诊断范围，该部分下文会提及。

业务场景的拓扑通过流量入口接口的trace链路串联得到，拓扑中有流量入口，有途径服务节点，有底层的计算推理或存储相关节点，目标是通过对该拓扑进行分析，进行根因节点推荐。

![简化&抽象后调用拓扑](https://mmbiz.qpic.cn/sz_mmbiz_png/vxnkL2N86IuoxtYCzDkZaNW3GcD6pjEmdf2QQcvRygEfodibHkCPial2J7fp2dlqdKicXpfTMcibPkHOq55NSkFKtw/640?wx_fmt=png&from=appmsg&tp=webp&wxfrom=5&wx_lazy=1&wx_co=1)

## 4.2 方案设计

### 4.2.1 方案调研

近些年学术界关于微服务根因定位的研究层出不穷，如表4.1所示。

基于随机游走的方法关键在于概率转移矩阵的设计，其出发点是推导出真实的故障传播路径，随机游走有很明显的缺陷，其排序结果对于处于拓扑中心（入度和出度较高）的节点有较高的权重，而对于叶子结点则通常权重较低。

基于监督学习的方法很难在实际中落地，一是故障类型太多，根本无法枚举；二是历史故障样本十分有限，通过故障注入方式扩充样本会导致类型集中和单一，对训练模型并不友好，部分故障的注入和演练对公司基建和业务高可用要求高，基建未到达一定成熟度无法演练。

基于trace异常检测的方法，需要公司基建完善，需要监控指标和trace覆盖度足够高，直接对trace实时数据进行异常分析成本较高。

![近些年根因分析相关研究](https://mmbiz.qpic.cn/sz_mmbiz_png/vxnkL2N86IuoxtYCzDkZaNW3GcD6pjEmGYLaSR9Zn2De4MLw6A97bicTmfZdFAxngot8ZCzdeo8snS5beTj9oFw/640?wx_fmt=png&from=appmsg&tp=webp&wxfrom=5&wx_lazy=1&wx_co=1)

在行业内，在根因分析领域主要有如表4.2的相关实践和分享，主流思路还是基于rpc或trace调用链路进行根因分析。

![业界公司的分享](https://mmbiz.qpic.cn/sz_mmbiz_png/vxnkL2N86IuoxtYCzDkZaNW3GcD6pjEmSDCtZBqABnkJSEibhG96eGfCZVXP2cnDJCntUx99ASfVNN2Mk8pvurw/640?wx_fmt=png&from=appmsg&tp=webp&wxfrom=5&wx_lazy=1&wx_co=1)

可以看出，根因定位是一个需要强领域知识介入的问题，和学术界研究中单纯依赖trace或指标或日志中的一项或某几项进行分析不同，工业界上更多地是将指标、日志、trace和event都结合起来，做异常检测和关联分析，并结合公司自身业务特点和基建架构，加入一些专家规则进行根因推断，具备一定的可解释性和灵活性，可以很方便地进行规则调整和优化。

### 4.2.2 定位方案设计

基于上述调研、对比分析，考虑到小红书的业务特点和架构，我们设计了如下根因定位系统，辅助业务发生故障时快速定位根因。

- 故障定位整体方案

![故障定位整体方案](https://mmbiz.qpic.cn/sz_mmbiz_png/vxnkL2N86IuoxtYCzDkZaNW3GcD6pjEmgPia2LCcibX1gV8y9yKutgiclFe5VNy0K3jAq6scPLlTibK3YpyAMo5XgA/640?wx_fmt=png&from=appmsg&tp=webp&wxfrom=5&wx_lazy=1&wx_co=1)


触发渠道：核心场景拉起故障，服务诊断，告警诊断，接口诊断，不同渠道差别在于获取的拓扑不同，底层诊断逻辑共享。

拓扑生成：根据触发输入信息，生成需要诊断的拓扑结构，对公司RPC、Trace拓扑等底层能力强依赖。

数据采集：拓扑结构中有节点和边，节点和边都有指标，节点本身的监控指标（Problem, Middleware, System等）及边的调用指标（QPS，RT，失败率等）数据，节点能关联告警和变更事件。

异常检测：对采集到的所有节点和边进行异常检测，识别节点高风险变更(发布变更，配置变更等），检测高等级告警量是否有突增。

异常拓扑提取：根据异常指标、风险变更、突增告警信息，对拓扑节点进行状态标记，裁剪正常节点保留异常拓扑。

根因分析：首先基于RCSF挖掘出异常最集中的区域，进行第一次TOPN根因排序，之后基于专家规则再次进行根因排序调整，同时进行网络、流量、影响范围、存储聚合等分析，输出诊断报告。

## 4.3 故障定位实现

### 4.3.1 拓扑生成

以核心场景为例，比如点开一篇笔记，会触发一个或多个接口请求，业务将这些高度相关的请求划分到一个分组，定义为核心场景。

简言之，核心场景就是一组相关接口请求的集合。

在公司高可用平台上，SRE及业务同学已经梳理出上百个核心场景，并梳理核心场景指标进行监控，核心指标异常产生的告警，自动拉起故障同时触发故障诊断流程，生成诊断报告并推送消息到故障群。

（1）Trace拓扑生成

核心场景的拓扑，强依赖公司Trace（分布式链路追踪[19]）能力的支持，公司可观测平台提供了Trace能力，并在核心场景进行大范围的覆盖，尤其是社区、电商等业务，服务的Trace覆盖率基本90%+。

通过获取多个接口的Trace链路，合并生成服务调用拓扑链路，具体思如如下图所示：

![Trace拓扑生成](https://mmbiz.qpic.cn/sz_mmbiz_png/vxnkL2N86IuoxtYCzDkZaNW3GcD6pjEmQ05hmh6c1MDqZhR3iaZXs70Xt9q5kzXSicabYTnZhqeNYz7icGwbdRT8Q/640?wx_fmt=png&from=appmsg&tp=webp&wxfrom=5&wx_lazy=1&wx_co=1)

（2）RPC拓扑生成

而对于Trace覆盖不全，或者链路存在中断的场景，则通过高可用平台设置核心服务，自动生成服务的RPC调用拓扑。

RPC调用拓扑节点和边的规模非常庞大，部分场景存在上千节点，其中一些调用和节点并非强依赖，对定位会产生较大的干扰。

而服务间强弱依赖是在业务高保障过程中不可缺少的元数据，SRE会针对核心场景进行强弱依赖标注、验证和保鲜。

针对庞大的RPC拓扑，会采用如下过滤裁剪方式确保拓扑中节点数<300个：

保留所有核心服务

保留所有强依赖服务

从叶子结点出发，递归剪除未知依赖的节点（节点数小于300停止）

从叶子结点出发，递归剪除弱依赖的节点（节点数小于300停止）

### 4.3.2 数据采集

针对节点和边，需要获取如下数据，其中指标获取故障拉起时刻近1h数据，告警和变更则是最近30分钟内数据，相关数据均采集自可观测平台。

表4.3  节点和边采集指标信息表

![数据采集](https://mmbiz.qpic.cn/sz_mmbiz_png/vxnkL2N86IuoxtYCzDkZaNW3GcD6pjEmgX2zz99zmWRr25UjibgpmbW7vd8ReiaSJibLiblhZ02ztiaVyHtibAUp2EmA/640?wx_fmt=png&from=appmsg&tp=webp&wxfrom=5&wx_lazy=1&wx_co=1)

数据采集之前，标准的基建体系很重要，监控体系需要完善（metric/trace/log等），服务需要能关联指标数据、变更数据、告警数据，所有数据尽可能关联到公司CMDB中的服务唯一标识，不能关联到服务的变更尽可能关联到场景、业务线。

否则所有的非标数据都需要特殊处理，或者无法关联，无法做到自动化，自动化的前提一定是标准化。

### 4.3.3 异常检测

通常一个场景会有几百个服务，按指标类型、可用区groupby之后检测指标数通常都是几万，对于故障定位过程中进行的异常检测，当前主要还是短时序的异常检测，部分指标会获取同环比数据进行降噪。

使用大量历史数据的监督模型不合适，获取和检测耗时都会大大增加。

在采集模块，获取了拓扑节点及边相关的指标，将指标划分为几个大类，并设计了各自的检测算法以提升检测效果。

![异常检测](https://mmbiz.qpic.cn/sz_mmbiz_png/vxnkL2N86IuoxtYCzDkZaNW3GcD6pjEmUj88Mupibn2IiaaZe8lR8IIVvl1EzcmYccSV5bB22DDiczt7PibPdY9ZpQ/640?wx_fmt=png&from=appmsg&tp=webp&wxfrom=5&wx_lazy=1&wx_co=1)

#### 变点检测算法

对于类QPS指标，通常具备趋势，直接使用孤立森林算法检测，在其上升期很难识别出异常下跌波动。

如下图所示，我们使用MSRA提出的SR-CNN[20]方法，对原始时间序列做一个频域变换，获得Spectral Residual(SR,谱残差)序列，放大这种波动，然后再基于孤立森林识别出这种变点。

图4.4  SR变点检测算法

![变点检测算法](https://mmbiz.qpic.cn/sz_mmbiz_png/vxnkL2N86IuoxtYCzDkZaNW3GcD6pjEmPrOkcRX9XRz6mR0WjKkk5KVhplg03nMKABs92iapLmZxsnlibG7FD7vw/640?wx_fmt=png&from=appmsg&tp=webp&wxfrom=5&wx_lazy=1&wx_co=1)

### 4.3.4 异常拓扑生成

对于拓扑图中的节点，通过异常检测模块后，将其划分为三种状态类型，状态定义分别如下：

表4.5  节点状态定义和判定条件

![](https://mmbiz.qpic.cn/sz_mmbiz_png/vxnkL2N86IuoxtYCzDkZaNW3GcD6pjEmMqRhnFric6ASOGSicgjsCSaIwS2GL16tnJfMaZdaicD7wgtUzGicTUlsug/640?wx_fmt=png&from=appmsg&tp=webp&wxfrom=5&wx_lazy=1&wx_co=1)


对核心链路拓扑的每个节点进行状态判别，之后从叶子结点出发，递归地进行剪枝(剪掉正常节点），直至拓扑节点数量不再变化，以下是剪枝过程的示意图

- 图4.5  异常拓扑提取过程

![异常拓扑提取过程](https://mmbiz.qpic.cn/sz_mmbiz_png/vxnkL2N86IuoxtYCzDkZaNW3GcD6pjEmbwnf2NB4FFBE1uAfKckCgyYTibgT0UnxGE1yziaQWZKFkg1oB6TbQH9w/640?wx_fmt=png&from=appmsg&tp=webp&wxfrom=5&wx_lazy=1&wx_co=1)

### 4.3.5 根因分析

根因分析环节，输入是异常拓扑，输出是TOPN根因。

整个过程会先经过RCSF进行初步排序，再通过多场景通用的专家规则进行排序调整，输出最终TOPN根因节点。

（1）RCSF(异常频繁项集挖掘）

RCSF[14]从告警出发，认为通过挖掘调用链路图上异常最集中的的部分可以找到根因，如下所示，从B1和B2节点出发，生成B1或B2到异常节点的调用路径，比如(B1, F1,F4,F6)是一条调用路径，然后从路径序列中挖掘频繁项集，通过支持度大小对根因节点进行排序

图4.6  异常频繁项集挖掘

![异常频繁项集挖掘](https://mmbiz.qpic.cn/sz_mmbiz_png/vxnkL2N86IuoxtYCzDkZaNW3GcD6pjEmNIeQrlQnn6YNRTqRp3aDJybyrzEkDeficVstiaOLDpIZj5byNMZ4TRCQ/640?wx_fmt=png&from=appmsg&tp=webp&wxfrom=5&wx_lazy=1&wx_co=1)


通过RCSF的确可以很容易找到异常最集中的区域，因此我们基于上述生成的异常拓扑并结合RCSF的思路实现了一个异常拓扑排序方法，和RCSF有所不同的是，在生成调用路径序列时，我们使用的是风险/异常节点到任意其他风险/异常节点的路径

（2）专家规则重排序

基于RCSF的排序方法并不总是奏效，根因分析是一个需要强领域知识介入的问题。

比如，因为流量上涨导致的容量问题，通常在入口层就可以识别，再或者由于单机异常导致的问题，通常需要对指标进行下钻分析。

因此，我们在RCSF排序的基础上使用一些先验的规则进行重排序，以下是一些用到的通用规则：

表4.6  专家规则和说明

![专家规则和说明](https://mmbiz.qpic.cn/sz_mmbiz_png/vxnkL2N86IuoxtYCzDkZaNW3GcD6pjEmRm8mQssTlCqjTqwly4xNBWH8PHjoz0N74zeke0vw8ygndCPfCK2icaA/640?wx_fmt=png&from=appmsg&tp=webp&wxfrom=5&wx_lazy=1&wx_co=1)

（3）影响面分析

余弦相似度分析：Exception 错误分布不均检测，如果一个异常不是单机/单机房引发的，那么其分布应该是均匀的。

如下，错误数应该和机房机器数成比例，反之，如果错误数和机器分布不成比例，那么则提示机房/机器问题。通过计算错误数向量和机器分布向量的余弦相似度可识别出这种单机/单机房问题。

比如某个Exception有5个可用区的错误数err_cnt = [e1,e2,e3,e4,e5], 各个可用区机器数host_cnt=[h1,h2,h3,h4,h5]，计算err_cnt和host_cnt的相似度sim，如果sim小于预设的阈值则认为存在单机/单机房问题。

特别地，如果判断单机问题，host_cnt向量直接定义为[1,1,...,1]，长度是机器数量，err_cnt则是各个机器的错误数。

图 4.7  余弦相似度分析

![机房分布均匀性](https://mmbiz.qpic.cn/sz_mmbiz_png/vxnkL2N86IuoxtYCzDkZaNW3GcD6pjEmSSuHe5CONvBuHicZmicaSfR6ehWXoBLe1M4nDow2sibyQiawDXpXORPtHQ/640?wx_fmt=png&from=appmsg&tp=webp&wxfrom=5&wx_lazy=1&wx_co=1)

时间序列离群分析：该方法针对系统指标异常，有些情况下的单机异常并不会在Exception上反应出来，比如单机CPU跑满，但是不存在相关的Exception。

使用DBSCAN聚类的方法对系统指标进行离群分析，提取出这种单机异常序列。

其中聚类过程中时间序列的距离度量使用DTW(Dynamic Time Warping)，通过自适应调整每个类别最小样本数min_samples和可达距离eps，使得DBSCAN的聚类结果为一类，聚类结果中label为-1的则表示离群序列，通过上述算法可以很容易识别出下图所示的指标S1为离群序列。

图 4.8  时间序列离群分析

![时间序列离群分析](https://mmbiz.qpic.cn/sz_mmbiz_png/vxnkL2N86IuoxtYCzDkZaNW3GcD6pjEmHz6pFe7rE4XhkS658CySlAaNI6cG9K97stHemn3vF9sibSVFclWyq9g/640?wx_fmt=png&from=appmsg&tp=webp&wxfrom=5&wx_lazy=1&wx_co=1)

（4）风险变更识别和排序

生产环境的变更非常频繁，当前接入公司变更事件的平台100+，同一时刻的变更多则上百个。

根据拉起故障的时刻，获取了和拓扑节点关联的最近30分钟的变更，以及一些全局的变更（如实验变更），变更数量通常非常庞大，在众多变更中找到最可能引起故障的变更极具挑战性。

考虑到故障拉起的故障时刻通常会有一些延迟，故障拉起时刻作为故障时刻，根据变更距离故障时刻远近对变更风险进行排序并不合理。

在异常检测模块，会对所有相关指标进行异常检测，检测范围是最近15分钟，如上图所示，我们将异常检测结果数量按时间汇总，寻找异常点数量突增的时刻，将其作为故障时刻，然后对所有关联变更进行排序，排序依据是距离故障时刻的远近，越接近故障时刻的变更越靠前。

图 4.9  故障时刻判定与风险变更排序

![风险变更识别和排序](https://mmbiz.qpic.cn/sz_mmbiz_png/vxnkL2N86IuoxtYCzDkZaNW3GcD6pjEmCOt6Rf0T1KNE4JJhyWoj273SRSW2yCW72EOdXnQGCOh9XOQgT4NJzQ/640?wx_fmt=png&from=appmsg&tp=webp&wxfrom=5&wx_lazy=1&wx_co=1)

## 4.4 业务落地与效果

### 4.4.1 产品化和业务落地

经过一段时间的持续迭代和优化，当前故障定位能力已覆盖公司所有业务线总共近百个核心场景，除了核心场景故障诊断，也已支持告警诊断、服务诊断能力，平均每天触发1000+次诊断。

图 4.10  故障诊断触发次数趋势

![故障诊断触发次数趋势](https://mmbiz.qpic.cn/sz_mmbiz_png/vxnkL2N86IuoxtYCzDkZaNW3GcD6pjEmIJVYiak4hjEaPcZTBnn72VlZa1x0sagAJ39EsRh602FwRH6icdmAjibIg/640?wx_fmt=png&from=appmsg&tp=webp&wxfrom=5&wx_lazy=1&wx_co=1)

故障定位后，会生成诊断报告，诊断报告能力已集成到公司故障响应平台，在故障触发后1min内，故障群可收到诊断结果消息通知，也可到平台查看该故障的诊断报告详情，包含拓扑展示、根因推荐、服务详情三部分。

下面以几个案例的拓扑部分介绍当前产品实际落地情况。

#### 单POD问题

下面案例为典型的单实例异常引发的故障，根因分析结论是存在异常陡增，且集中分布在单个实例。

根因节点：08:07 java.util.concurrent.RejectedExecutionException异常上涨 【分布不均】10.xx.xx.xx(100.0%)

![根因分析](https://mmbiz.qpic.cn/sz_mmbiz_png/vxnkL2N86IuoxtYCzDkZaNW3GcD6pjEmzhib1fVjkrUr9XibialXgTSiavxcocAMYciadoBULwgpymicObiaviahYkLaXw/640?wx_fmt=png&from=appmsg&tp=webp&wxfrom=5&wx_lazy=1&wx_co=1)

#### 单Node问题

下面案例为物理机Node故障，导致该Node上的所有Pod都异常，影响到多个业务服务的故障。

根因分析精准给出异常Node的IP，这种故障影响不一定大，但分散在不同服务，研发通常需要花费较长时间进行排查定位。

综合分析：Node异常, IP:【10.xx.xx.xx】受影响服务:xxxxx-service(10.xx.xx.xx),xxxxx-service(10.xx.xx.xx)

![单Node问题](https://mmbiz.qpic.cn/sz_mmbiz_png/vxnkL2N86IuoxtYCzDkZaNW3GcD6pjEmSO0tzVGRehiaJd6gDOQHS9zaXQMPgnvvJvUUIMytWvRLZCPWhtgX8gA/640?wx_fmt=png&from=appmsg&tp=webp&wxfrom=5&wx_lazy=1&wx_co=1)

#### DB异常问题

下面案例为db异常引发的故障，根因分析给出的结论是服务调用该存储存在异常陡增，以及多个查询方法均存在异常，且多个DB节点异常时会进行聚合分析。

存储分析：【MySql】异常, 存储节点: process_xxx, process_xxx_xxx, xxx_data_xxx_mysql, xxx_xxx_xxx存在调用异常；

![DB异常问题](https://mmbiz.qpic.cn/sz_mmbiz_png/vxnkL2N86IuoxtYCzDkZaNW3GcD6pjEm0icvBVRW4oic85ghHUXmhhEK8dJTZVFEdnnsnSpAVd5MTWYiaA1UKBwKA/640?wx_fmt=png&from=appmsg&tp=webp&wxfrom=5&wx_lazy=1&wx_co=1)

#### 网络专线问题

下面案例为网络专线问题导致的故障，网络问题，导致大量业务服务出现大量报错和告警，通过对网络质量数据进行检测分析，根因分析给出结论当时网络专线存在异常。

网络分析：10:04 【xxxx机房】网络异常, xxx机房 | xxx机房  等机房调用【xxx机房】专线均存在丢包率异常

![网络专线问题](https://mmbiz.qpic.cn/sz_mmbiz_png/vxnkL2N86IuoxtYCzDkZaNW3GcD6pjEmTibv3XXIJMkdUtlDn98CLepS0hqX3J73AnMoEkyetO0zTQ547Ge6X3w/640?wx_fmt=png&from=appmsg&tp=webp&wxfrom=5&wx_lazy=1&wx_co=1)

#### 变更导致问题

下面案例为限流操作变更，兼容性存在问题导致错误限流的故障。

根因分析给出结论，对应服务存在失败率等异常上涨，同时存在限流变更操作。

根因节点：15:17~16:40, xxx在xx系统对xxxx-xxxx-default进行配置发布

![变更导致问题](https://mmbiz.qpic.cn/sz_mmbiz_png/vxnkL2N86IuoxtYCzDkZaNW3GcD6pjEmibNutnuof8amTSfH8bzsye6dqboShJVyMTHFOKAxcLqnlLhe6TnWqtA/640?wx_fmt=png&from=appmsg&tp=webp&wxfrom=5&wx_lazy=1&wx_co=1)

除此之外，还有支持了流量分析、影响范围分析、存储分析、堆栈分析等诊断能力。

### 4.4.2 衡量指标和结果

在故障定位上，大家最关心的衡量指标是准确率。在学术界，根因分析通常使用以下公式进行准确率评估：



其中AC@K表示给出根因节点个数为k时的准确率，当前选择K为5进行评估，即在列出的TOP5节点中包含根因节点则认为定位准确。

以双月为周期进行复盘，通过不断地迭代优化，通过Trace链路进行智能诊断的核心场景中，最近一个双月可用性故障case准确率数据已经达到80%+。

此外，当前已经开始在进行故障定位采纳率的数据运营，准确率表示平台侧复盘标注的结果，采纳率为研发&SRE侧复盘标注是否对有用的结果。

随着TOP5的准确率提升，后续将提出更高的要求，由推荐TOP5转变为推荐TOP3，最终目标是推荐TOP1。

# 总结

上文详细阐述了当前小红书将AIOps应用在故障定位场景中的落地与实践，以及最终在业务侧的落地与效果，基于Trace调用链路的故障定位准确率从最初的40%+到近期的80%+。

一年多来，通过对每双月上百个故障进行复盘分析，我们深知故障定位其实任重道远，当前的诊断能力主要聚焦于后端，从端到端来看还有客户端、接入层、存储等其他环节；除了可用性问题，业务效果类、数据类问题的定位和排查也是重灾区。

后续在故障定位方向的优化主要会从以下几个方面去展开：

检测能力优化：整个诊断过程中，指标的异常检测无处不在，指标检测需要持续优化，减少噪声排除干扰；不同指标不历史数据范围，根据指标特点寻找合适的异常检测算法，甚至对数据进行标注，多种算法回归择优。

变更关联加强：变更当前任然是导致故障的主要原因，上面拓扑中的节点已经做了变更关联，但是当前还是存在不规范的无法准确关联的，甚至有些变更存在间接影响的，变更关联需要各平台的数据的规范化以及上报信息的规范化，需持续治理。

根因分析能力增强：提升Trace覆盖范围和观测能力覆盖，尽可能确保出问题的核心节点都在拓扑中&能够获取到监控数据；抽象提炼更多根因分析场景，并选择合适的 AIOps 算法形成更多诊断组件；利用混沌平台故障注入能力，在迭代优化的同时行故障的回归验证确保定位准确率，不断迭代优化专家规则；

扩大诊断范围：除了后端，客户端、接入层、存储均支持根因分析，并将诊断能力接入到公司故障诊断过程中；平台化&开放AIOps能力支持客户端、接入层、存储等进 PaaS/IaaS 层的检测和诊断。

业务自定义诊断：当前已经通过定义业务环节和关联业务核心指标，进行相关的业务自定义诊断，但整体定位准确率还远不及预期，后续会提供更多能提供业务进行链路定义和诊断规则定义，让业务研发参与到自定义诊断中来，将业务定位逻辑自动化。

预案推荐与自愈：当前对于单点问题已提供快速解决方案，后续会结合影响范围分析进行业务预案推荐，部分确定场景自动执行建设自愈能力。


在AIOps领域，当前除了对故障定位进行了深入的探索和落地，当前也在智能告警、变更检测、智能客服、容量评估等其他领域进行一些探索和落地。


# 参考资料

https://mp.weixin.qq.com/s?__biz=Mzg4OTc2MzczNg==&mid=2247491372&idx=1&sn=d61ad18a1a9e8d8e89079caf2f1587ca&chksm=ceff5928285e1c732b9e583bc92fd58eed7dbba2baecb299b1b55ce515b83b3903130417d620&mpshare=1&scene=1&srcid=0402hp2FfXy7MIGu77ohb6nn&sharer_shareinfo=904050e8c0966f457ec15969e654322c&sharer_shareinfo_first=904050e8c0966f457ec15969e654322c#rd

* any list
{:toc}