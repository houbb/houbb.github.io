---
layout: post
title: 监控利器之夜莺监控-Nightingale-01-入门介绍
date:  2019-4-1 19:24:57 +0800
categories: [Monitor]
tags: [monitor, apm, api, sf]
published: true
---

# 夜莺 Nightingale

夜莺Nightingale是中国计算机学会托管的开源云原生可观测工具，最早由滴滴于 2020 年孵化并开源，并于 2022 年正式捐赠予中国计算机学会。

夜莺采用 All-in-One 的设计理念，集数据采集、可视化、监控告警、数据分析于一体，与云原生生态紧密集成，融入了顶级互联网公司可观测性最佳实践，沉淀了众多社区专家经验，开箱即用。

# 功能和特点

统一接入各种时序库：支持对接 Prometheus、VictoriaMetrics、Thanos、Mimir、M3DB 等多种时序库，实现统一告警管理

专业告警能力：内置支持多种告警规则，可以扩展支持所有通知媒介，支持告警屏蔽、告警抑制、告警自愈、告警事件管理

高性能可视化引擎：支持多种图表样式，内置众多Dashboard模版，也可导入Grafana模版，开箱即用，开源协议商业友好

无缝搭配 Flashduty：实现告警聚合收敛、认领、升级、排班、IM集成，确保告警处理不遗漏，减少打扰，更好协同

支持所有常见采集器：支持 Categraf、telegraf、grafana-agent、datadog-agent、各种 exporter 作为采集器，没有什么数据是不能监控的

一体化观测平台：从 v6 版本开始，支持接入 ElasticSearch、Jaeger 数据源，实现日志、链路、指标多维度的统一可观测

# 对比 Prometheus

这是经常被问到的问题。

如果您当前使用的是 Prometheus，而且没有痛点，那么就不需要考虑夜莺了，用好现在的体系就可以了。

如果您用了多个时序库，比如 Prometheus、VictoriaMetrics、Thanos 等等，需要一个统一的平台来管理告警、看图，夜莺是一个选择。如果您想把监控的能力开放给公司所有研发团队，让研发团队自助服务，Prometheus 使用配置文件的告警规则管理方式不方便，夜莺是一个选择。

如果您需要更为灵活的告警策略配置，比如控制生效时间、一套规则生效多个集群，夜莺是一个选择。

如果您需要告警自愈能力，告警之后自动执行个脚本啥的，夜莺是一个选择。如果您需要一个统一的事件 OnCall 中心，聚合各个监控系统的告警，做统一的告警聚合降噪、排班认领升级、灵活的分发和协同，FlashDuty 是一个选择。

另外，相比 Grafana，夜莺的看图能力还是差一些，因为 Grafana 是 agpl 协议，我们也没法封装 Grafana 进夜莺，所以夜莺的看图是自研的，和 Grafana 没法 100% 兼容，当然，夜莺支持导入 Grafana 的仪表盘 JSON，基础的图表都是兼容的。另外，夜莺设计了内置告警规则和内置仪表盘，方便用户开箱即用，现在覆盖了常用组件，后面随着时间推移，这个体验也会越来越好，期待大家一起共建。

以笔者观察来看，很多公司是一套组合方案（成年人的世界，没有非黑即白，都要）：

- 数据采集：组合使用了各种 agent 和 exporter

- 存储：时序库主要使用 VictoriaMetrics，因为 VictoriaMetrics 兼容 Prometheus，而且性能更好且有集群版本

- 告警引擎：使用夜莺，方便不同的团队管理协作，内置了一些规则开箱即用

- 看图可视化：使用 Grafana，图表更为炫酷，社区非常庞大

- 告警事件OnCall分发：使用 FlashDuty，聚合了 Zabbix、Prometheus、夜莺、Open-Falcon、云监控、Elastalert 等各类告警事
件，统一聚合降噪、排班、认领升级等


# 中心机房部署架构

![中心机房部署架构](https://download.flashcat.cloud/ulric/20230531103435.png)

首先上图中间的飞鸟代表夜莺的核心进程 n9e （下文以 n9e 代替），它的集群方式非常简单只需部署多节点即可实现。

对于 n9e 来说，它本身依赖的存储有两个

Mysql : 存放配置类别信息，如用户，监控大盘，告警规则等
Redis : 存放访问令牌(JWT Token)，心跳信息，如机器列表中CPU、内存、时间偏移、核数、操作系统、CPU架构等
从 v6 版本开始，夜莺尝试转型为统一可观测性平台，n9e 不再仅支持接入时序数据源(Prometheus、Victoriametrics、M3DB、Thanos)，也可以接入日志类数据源（Elasticsearch，Loki【预】），链路追踪数据源（Jaeger）。

左侧就是 n9e 的数据来源，n9e 可以支持多种采集器 agent，比如 Datadog-Agent，Telegraf，Grafana-Agent，OpenTSDB agent，Node-Exporter，vmagent 都可以对接，不过最推荐的还是 Categraf。比如在 n9e 中机器列表页面的心跳信息都是 Categraf 才会去采集并上报的，所以为了更丝滑使用更推荐使用 Categraf，并且 Categraf 采用 All-In-One 的设计，采集日志，指标，链路追踪，所有的采集工作使用一个 agent 来解决。

介绍完中心部署架构，我们再来描述一下它的数据流：假设是时序指标数据的采集，agent 把采集到的数据推送给 n9e （端口:17000），然后经由 n9e 加工（自动添加附加标签）转发给对应的时序数据库保存。另外在 n9e 把数据的转发给时序数据库之前，会先从监控数据中提取出 ident 标签写入 mysql 的 target 表（机器列表）中，同时如果 agent 用的是 Categraf 并且配置了心跳(heartbeat=true)，则会把心跳上报的 metadata 存入 Redis（就是那些核数、操作系统、CPU架构等）。

具体在生产环境部署的话，建议在 n9e 前面架设负载均衡，可以是 4 层的，也可以是 7 层的。让 agent 通过负载均衡上报监控数据，上层访问 n9e 也通过负载均衡，这样 n9e 任何一个实例挂掉，不会影响到整个服务可用性，从而做到高可用。而且集群中多个 n9e 实例会均分告警规则，分片处理，从而可以处理更大量的告警规则。

那么在多机房的场景下推荐的架构是怎么样的？简单来说，在边缘机房在和中心机房网络连接比较好的情况下，目标机器只需部署 Categraf，直连中心机房即可（公网一定要注意添加好安全相关配置）。

可是当边缘机房和中心机房网络链路不是很好的情况下，除了目标机器部署 Categraf 外，还推荐把告警引擎（n9e-alert）和时序数据库一起下沉部署。n9e-alert 是 n9e 的一个只保留告警引擎模块的独立可执行程序。

# 边缘下沉式混杂部署方案

![边缘下沉式混杂部署方案](https://download.flashcat.cloud/ulric/20230724100252.png)

从 v6.0.0.ga.9 开始，合并了 n9e-alert、n9e-pushgw 模块为 n9e-edge，应对边缘机房的场景。

n9e-edge 不依赖 mysql、redis，只依赖中心端的 n9e，所以 edge.toml 配置文件里，需要配置中心端 n9e 的地址。

```ini
[CenterApi]
Addrs = ["http://127.0.0.1:17000"]
BasicAuthUser = "user001"
BasicAuthPass = "ccc26da7b9aba533cbb263a36c07dcc5"
# unit: ms
Timeout = 9000
```

认证信息（BasicAuthUser、BasicAuthPass）对应中心端 n9e 的 HTTP.APIForService.BasicAuth 配置段。

可以通过如下命令启动 n9e-edge：

```sh
nohup ./n9e-edge --configs etc/edge &> edge.log &
```


如果机房之间网络链路很好，就让所有的 categraf 和中心端的 n9e 通信即可，如果某个机房和中心端网络链路不好，就让 categraf 和 n9e-edge 通信，n9e-edge 和中心端的 n9e 通信。

边缘机房的 n9e-edge 默认的引擎名字是 edge，与中心端 n9e 的引擎名字（default）相区分。

注意：边缘机房的时序库在夜莺里添加数据源的时候，要选择边缘机房的告警引擎（edge）。

如果你有两个边缘机房，注意两个边缘机房的 n9e-edge 的引擎名字要不一样。下图是配置数据源的时候，选择告警引擎的地方：

![alarm](https://download.flashcat.cloud/ulric/20230531105059.png)

图中 region02 的机房中采集器使用的是 vmagent，并把采集的数据直接写入时序数据库，通过 n9e-edge 对监控数据做告警判断。这种架构比较简洁，但是会有一点点小问题，由于采集数据没有流经 n9e-edge，就没法从数据流中解析出机器信息，也就没法把机器信息写入数据库 target 表，也就导致页面上机器列表页面看不到相关的机器。这不影响告警，看图这些核心功能，只是用不了机器分组，自定义标签，告警自愈之类的功能。

更推荐使用 Categraf + n9e-edge 的方式来采集数据，其架构如图 region01 所示。当 Categraf 采集的数据上报给 n9e-edge 后，n9e-edge 就可以从监控数据中解析出机器信息，然后通过中心端的 n9e 写入数据库 target 表，这样就可以在页面上看到机器列表了。就可以使用机器分组，自定义标签，告警自愈之类的功能。





# 参考资料

https://github.com/dromara/hertzbeat/blob/master/README_CN.md

https://flashcat.cloud/docs/content/flashcat-monitor/nightingale-v6/introduction/

https://flashcat.cloud/docs/content/flashcat-monitor/nightingale-v6/arch/

* any list
{:toc}