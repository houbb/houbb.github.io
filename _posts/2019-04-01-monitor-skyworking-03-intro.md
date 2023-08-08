---
layout: post
title: 监控-skywalking-03-深入浅出介绍全链路跟踪
date:  2019-4-1 19:24:57 +0800
categories: [APM]
tags: [monitor, apm, sf]
published: true
---


# 全链路监控

## 什么是全链路监控，为什么我们需要全链路监控？

![call](https://ask.qcloudimg.com/http-save/yehe-8907256/323ba5c0b6233f3d7b49daf24f91cc6f.png)

1、全链路监控：对请求源头到底层服务的调用链路中间的所有环节进行监控。

2、为什么需要：对于单体应用，我们可以很容易地监控和分析它的性能。对于微服务，编程语言不同、服务器数量庞大、可能跨多个服务/区域，那么面对复杂的请求调用链路，就会有一系列问题，只有全链路监控才能处理，例如：

- 如何快速发现有问题的服务？

- 如何判断故障影响范围？

- 如何梳理服务间依赖关系？

- 如何分析链路性能问题？

- 对于一次慢请求，如何找到慢请求的来源？

3、和其他监控组件的定位区别：

![区别](https://ask.qcloudimg.com/http-save/yehe-8907256/376e8670b0a4347c1d0d315e608a1144.png)

## 监控、追踪和日志是可观测性（observability）的基石：

和日志监控Logs区别：日志监控侧重于单个业务的代码bug分析。虽然利用MDC可以追踪一个请求，但不能追踪跨线程、跨服务、跨区的情况，且对中间件、数据库的请求无法追踪，当然也可以手动传递MDC，本质上也就是实现了全链路监控的追踪功能。

和Prometheus监控Metrics区别：Prometheus监控侧重于报警和业务指标监控。对于接口间的延迟等不能很好地处理，当然也可以在接口出入口计时，本质上也就是实现了一个全链路监控的性能分析功能。

MDC：Mapped Diagnostic Context，映射调试上下文，log4j 和 logback 提供的一种方便在多线程条件下记录日志的功能。

# OpenTracing

## OpenTracing 定位

微服务架构普及，分布式追踪系统大量涌现，但API互不兼容，难以整合和切换，因此OpenTracing提出了统一的平台无关、厂商无关的API，不同的分布式追踪系统去实现。

这种作用与“JDBC”类似。

![OpenTracing](https://ask.qcloudimg.com/http-save/yehe-8907256/f17e80ebf84e32329ca201bc754df578.png)

 OpenTracing是一个轻量级的标准化层，位于“应用程序/类库”和“日志/追踪程序”之间。

应用程序/类库层示例：开发者在开发应用代码想要加入追踪数据、ORM类库想要加入ORM和SQL的关系、HTTP负载均衡器使用OpenTracing标准来设置请求、跨进程的任务（gRPC等）使用OpenTracing的标准格式注入追踪数据。

所有这些，都只需要对接OpenTracing API，而无需关心后面的追踪、监控、日志等如何采集和实现。

## OpenTracing重要概念

场景：购买资源

![buy](https://ask.qcloudimg.com/http-save/yehe-8907256/f5042c7fc5dbaf92e262aa72e3e04930.png)

**Span（跨度）**指代系统中具有“操作名称”、“开始时间”和“执行时长”的逻辑运行单元。

![span](https://ask.qcloudimg.com/http-save/yehe-8907256/717f3b37e02dcb0da88802bc7b0a94e3.png)

**Trace（追踪）**指代一个分布式的、可能存在并行数据和轨迹的系统，直观上看就是一次请求在分布式系统中行进的生命周期，本质上是多个span组成的有向无环图（DAG）。

![trace](https://ask.qcloudimg.com/http-save/yehe-8907256/0113a93521db84b56f38ccefcc6a096f.png)

**Operation Names（操作名称）**：

每个span都有一个操作名称，操作名称应该是一个抽象的、通用的标识，具备统计意义的名称。

以数据库插入动作为例：

**Inter-Span References（内部跨度引用关系）**：

1个span可以和1个或多个span存在因果关系，目前只支持父子节点之间的直接因果关系ChildOf和FollowsFrom。

ChildOf：父span依赖子span，如RPC调用服务器和客户端、ORM的save和mysql的insert、countdownlatch。

Follows From：父span不以任何形式依赖子span结果。

示例：（ChildOf是官方示例，Follows From的示例不太确定，是个人理解，如有想法欢迎指正）。

![child](https://ask.qcloudimg.com/http-save/yehe-8907256/a815ec313bf8646f2cb836132fd1f66b.png)

**Logs（日志）** 每个span可以进行多次logs操作，logs反映了瞬间的状态，带有一个时间戳，以及至少一个k-v对。

例如msyql访问失败，可能出现这样的信息：

```
message=can't connect to mysql server on 127.0.0.1:3306
```

**Tags（标签）**，每个span可以携带多个标签，标签存在于span的整个生命周期里，能够提供很多有效信息。注意tags是不会传递给子span的。

例如mysql可能出现这样的信息：

```
db.instances:customers
db.statement:"insert into myTable values(1, 1)"
``` 

**SpanContexts（跨度上下文）**，当需要跨越进程进行传递时（例如RPC调用），需要使用到跨度上下文来延续请求调用链：

```
parent span ===> child span
```

包含了两部分：

区分span和trace的信息：通常是TraceId和SpanId。
 
baggage（随行数据）：k-v集合，在Trace的所有span内全局传输，可以用来存储业务数据（如customerID等）。存储数量量太大或元素太多，可能降低吞吐量、增加RPC延迟。

## OpenTracing API相关概念

Tracer的Inject/Extract

我们跨进程调用的方式有很多，HTTP、gRPC、Dubbo、Kafka等，为了抽象出统一的概念，OpenTracing提出了Tracer的API（io.opentracing.Tracer）通过carrier去操作spanContext，有两个方法：

```java
inject(spanContext, format, carrier)
extract(format, carrier)
```

ormat有几个选项：

TEXT_MAP：k-v集合 。

BINARY：字节数组。

HTTP_HEADERS：和k-v类似，但保证了HTTP Header的安全性（保证了key、value的格式合法）。

```java
HTTP Headers 安全性见源码注释 io.opentracing.propagation.ForMat.BuiltIn：
 /** 
* The HTTP_HEADERS format allows for HTTP-header-compatible String->String map encoding of SpanContext state
* for Tracer.inject and Tracer.extract. 
* 
* I.e., keys written to the TextMap MUST be suitable for HTTP header keys (which are poorly defined but * certainly restricted); and similarly for values (i.e., URL-escaped and "not too long"). 
* 
* @see io.opentracing.Tracer#inject(SpanContext, Format, Object) 
* @see io.opentracing.Tracer#extract(Format, Object) 
* @see Format
* @see Builtin#TEXT_MAP
*/ 
public final static Format<TextMap> HTTP_HEADERS = new Builtin<TextMap>("HTTP_HEADERS"); 
```

具体后面怎么注入和提取数据，各自实现即可，本质上这里类似于序列化反序列化。

## ActiveSpan（活跃跨度）

activeSpan（io.opentracing.ActiveSpan），当前运行点附近的跨度。当创建新跨度时，这个活跃跨度默认会被当做父节点（Parent Span），每个线程有且只有1个活跃跨度。

为了避免方法之间把ActiveSpan当做参数传递，用Scope作为ActiveSpan的容器，通过ThreadLocal将Scope存储下来，通过ScopeManager进行管理，就能够在任何地方获取该线程的ActiveSpan了。

这里并没有直接存储ActiveSpan到ThreadLocal，因为当当前span结束（close）时，需要弹栈上一个span，因此通过Scope存储上一个Scope的引用组成链表进行弹栈。

（Skywalking采用了栈指针的形式进行弹栈，并采用ContextManager管理整个TraceSegement的周期，后面会提到。）

 https://wu-sheng.gitbooks.io/opentracing-io/content/pages/api/cross-process-tracing.html https://opentracing.io/docs/overview/scopes-and-threading/ https://opentracing.io/docs/overview/tracers/ https://opentracing.io/docs/supported-tracers/ https://blog.csdn.net/shuai_wy/article/details/107744631 https://github.com/yurishkuro/opentracing-tutorial/tree/master/java/src/main/java/

# OpenTelemetry

OpenTelemetry合并了Goole的OpenCensus和CNCF（Cloud Native Computing Foundation，云原生计算基金会）的OpenTracing，并统一由CNCF管理。

OpenTelemetry的终极目标是做Logging、Metrics、Tracing的融合，作为CNCF可观察性（Observability）的最终解决方案，包含了：

- 规范的指定和统一

- SDK实现和集成

- 采集系统的实现


目前官方推荐的是Logging→Fluentd，Metrics→Prometheus，Tracing→Jaeger。

但现在OpenTelemetry还处于沙盒状态，且Jaeger比Skywalking的使用体验差了非常多，侵入性强，功能缺失，还出过生产事故（因为数据加载耗费太多内存导致节点崩溃），因此目前用skywalking是没有什么问题的。

skywalking本身支持OpenTracing，因此OpenTelemetry的支持也是OK的。

# 1. skywalking 是什么？

SkyWalking 是一个开源 APM 系统，包括针对 Cloud Native 体系结构中的分布式系统的监视，跟踪，诊断功能。

核心功能如下：

- 服务、服务实例、端点指标分析

- 根本原因分析，在运行时分析代码

- 服务拓扑图分析

- 服务，服务实例和端点依赖性分析

- 检测到慢速服务和端点

- 性能优化

- 分布式跟踪和上下文传播

- 数据库访问指标。检测慢速数据库访问语句（包括 SQL 语句）

- 报警

SkyWalking 目前是 Apache 顶级项目，作为这么优秀的开源项目，它的架构设计理念肯定会有很多值得我们借鉴。

# span 

要理解分布式的调用链的设计，有一个概念是必不可少的，那就是Span。

Span是具有操作名称、时长的一个运行单元。

- 每个span都可以有各自的tags

- logs

- 还有有父子关系

## 进程内

在同一个进程内，Span的表现如下图：

![in-thread](https://p9-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/0347cdede5a94b71a7252b1fd2cf316f~tplv-k3u1fbpfcp-zoom-in-crop-mark:1512:0:0:0.awebp?)

parent Span包含了child Span的时长。

但是各自的tags、logs是相互独立的。

## 跨越进程

当需要跨越进程进行传递的时候我没需要使用到SpanContexts。

然而跨进程调用的方式有很多，比如http/grpc/kafka等。

为了抽象出统一的概念，OpenTracing提出了Tracer的API（io.opentracing.Tracer）通过carrier去操作spanContext

### skywalking 的 carrier 处理

- 将请求带上contextCarrier

```java
final ContextCarrier contextCarrier = new ContextCarrier();
String remotePeer = meta.getCallInfo().getCallee();
AbstractSpan span = ContextManager.createExitSpan(invocation.getFunc(), contextCarrier, remotePeer);

...
CarrierItem next = contextCarrier.items();
while (next.hasNext()) {
    next = next.next();
    request.getAttachments().put(next.getHeadKey(), next.getHeadValue());
}
```

这段代码将ContextCarrier作为Attachments塞给请求传递给被调用方。

- 被调用方将请求的getAttachment设置给CarrierItem

```java
CarrierItem next = contextCarrier.items();
while (next.hasNext()) {
    next = next.next();
    String headKey = next.getHeadKey();
    next.setHeadValue(new String((byte[]) request.getAttachment(headKey)));
}
```

这段代码Attachments放到ContextCarrier。这样就保证调用方和被调用方有相同的carrier，被连接在一起。

如下图，他们就会在UI界面上放在一起。如下图：

![called](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/18cb63c792884fbdb97679f44b0f8bf2~tplv-k3u1fbpfcp-zoom-in-crop-mark:1512:0:0:0.awebp?)

span3调用服务端的服务

蓝色的服务端处理，span4变成了span3的child。

## 几种不同类型的span

在编程的时候，要注意这几个概念。

- ExitSpan:一般用于客户端

- EntrySpan:一般用于服务起点

- LocalSpan：local的相关调用

# 2. 应用架构

SkyWalking 的整体架构设计，官方是有比较粗的架构图，那个我在这里就不展示了，如果是熟悉 SkyWalking，看那个就很清晰，但是如果不熟悉，就很难知道整体工程是如何构架的，那么我会从整体工程的角度去剖析整体架构设计。

植入到宿主应用的功能模块包括：apm-agent、apm-agent-core、apm-sdk-plugin、bootstrap-plugins 和 optional-plugins。

探针通过字节码框架 bytebuddy，在运行期间植入到业务的静态类、实例类的静态方法和静态方法中，完成链路追踪。

探针生态是全链路监控的一个很重要的指标，那么 Skywalking 又具备哪些探针。

Skywalking 正式通过比较全面的探针覆盖率来完成对业务应用的全量侵入，达到对性能指标可观察的目的，这个也是 Skywalking 的最大亮点之一。

在 Skywalking 中，探针是指集成到目标系统中的代理或 SDK 库，负责收集包括跟踪和度量在内的遥测数据。

基于目标系统技术堆栈，探针可以使用非常不同的方式来实现此目的。

但最终它们是相同的，**只是收集和重新格式化数据，然后发送到 OAP 平台**。

## 功能分解

从整体架构图可以看出。Skywalking功能明晰、解耦性强。

- 数据收集：Tracing依赖探针（Agent），Metrics依赖Prometheus或者新版的Open Telemetry，日志通过ES或者Fluentd。

- 数据传输：通过kafka、Grpc、HTTP传输到Skywalking Reveiver

- 数据解析和分析：OAP系统进行数据解析和分析。

- 数据存储：后端接口支持多种存储实现，例如ES。

- UI模块：通过GraphQL进行查询，然后通过VUE搭建的前端进行展示。

- 告警：可以对接多种告警，最新版已经支持钉钉。

微服务想要使用监控追踪，只要加上对应的agent就可以了。

## 其他

### 采样率

skywalking agent调整采样率，减少数据上传

通过agent.sample_n_per_3_secs设置3秒内采样的数量，一般500~2000是合适的值。默认-1全采样。 

在设置agent采样率后，如果调用链上游进行了采样，那么下游会忽略采样率进行强制采样，保证Trace调用链完整

### 性能

性能损耗控制 由于操作的是生产环境，不能对现有代码产生严重影响，所以需要控制性能损耗。

相比于侵入性地编写log打印，skywalking的性能剖析不需要埋点，也就不会增加额外的日志打印开销。

异步批量的传送日志。

## 跟踪信息

Span Model(新的跨度模型)和Context Mode(上下文模型)

跟踪系统的传统范围包括以下字段。

Trace ID，代表整个跟踪。
Span ID,代表当前span。
一个operation name，描述此span执行的操作。
start timestamp(开始时间戳)。
finish timestamp(完成时间戳)。
当前Span的Service和Service Instance名称。
一组零个或多个键值对组成的的span tag。
一组零个或多个span日志，每个span日志本身就是与时间戳配对的key：value映射。
引用零个或多个因果相关的span。参考包括parent span id和trace id。

# 探针

探针总共分为三类：

1. 基于语言的本地代理

这种代理运行在目标服务用户空间中，就像用户代码的一部分。例如 SkyWalking Java agent。

2. 服务网格探针

服务网格探针从服务网格或代理中的侧车、控制面板收集数据。在过去，proxy 只被用作整个集群的入口，但是有了 Service Mesh 和 sidecar，现在我们可以在此基础上进行观察。

3. 第三方工具库

SkyWalking 可以融合其他分布式链路追踪的存储数据结构（只要是符合 opentracing 规范的）。它对数据进行分析，将其转换为 trace、度量或两者兼用的格式。目前能够兼容 Zipkin span 的全链路数据。

OAP（可观测分析平台），是 SkyWalking 对整个后端的一个简称，注意 SkyWalking 是把自己定义为为一个可观察性的应用平台和解决业务业务性能问题的一个工具，所以才有了 OAP 平台的概念。

OAP 平台接受来自更多来源的数据，大致分为两大领域能力：

Trace。包括 SkyWalking 原生数据格式。Zipkin v1、v2 数据格式和 Jaeger 数据格式。

Metrics。与 Istio、Envoy、Linkerd 等服务网格平台集成，提供数据面板或控制面板的可观测性。另外，SkyWalking 本机代理可以以度量模式运行，这可以极大地提高性能。

SkyWalking 官方 UI 为 SkyWalking 观察分布式集群提供了默认的、强大的可视化功能。

Dashboard 提供服务、服务实例和端点的度量，具体提供吞吐量 CPM，表示每分钟的调用。

响应时间百分位数，包括 p99、p95、p90、p75、p50。

在维基上阅读百分位数 SLA 表示成功率。对于 HTTP，它意味着 200 个响应码的速率。

# SkyWalking 存储端架构设计

存储端架构设计，我们就从 SkyWalking 的存储领域模型来分析。

存储领域的边界，在 SkyWalking 中式通过插件模块来隔离的，具体是通过选择器来实现组件隔离，什么是选择器，其实在 SkyWalking 中就是在配置文件中，业务可以通过一个配置参数来控制平台是启用哪一个插件来完成存储，这样是不是很方便。

在配置文件 application.yml 中，通过 selector 属性来控制 OAP 平台启动的存储插件。

```yml
storage:
  selector: ${SW_STORAGE:h2}
```

1. 启动加载配置 loadConfig，判断功能模块是否开启了 SELECTOR。

2. 开启了 SELECTOR，就会在配置加载的过程中剔除掉多余的插件模块，比如存储端配置了 selector 为 h2，那么就会剔除其他的存储插件的配置。

配置文件中就剩下我们需要的模块了，然后通过 ModuleManager，按需加载和初始化模块。这样存储模块之间在代码启动阶段就做到了依据配置文件来实现启动隔离的目的。

ModuleDefine 和 ModuleProvider 根据配置完成映射，并通过通用模块加载功能，完成按需加载。

## common 模块：

Es7DAO：功能的作用域-elasticSearch 的 DAO 的适配类。
StorageModuleElasticsearch7Provider：功能的作用域，继承 org.apache.skywalking.oap.server.library.module.ModuleProvider，这个类两个核心方法是 prepare() 和 start()。prepare() 方法会初始化 ElasticSearch7Client 客户端，向模块注册 elasticSearch 的 DAO 服务，服务会存储在 ModuleProvider.services 中，services 是一个 HashMap。
StorageModuleElasticsearch7Config：功能的作用域，执行 StorageModuleElasticsearch7Provider.prepare() 和 start() 方法时，需要很多关于 elasticSearch 存储的全局配置，配置信息就会从 StorageModuleElasticsearch7Config 中获取。

## client 模块：

ElasticSearch7Client：功能作用域，适配了旧版本的 ElasticSearchClient，封装了能力 connect()、createIndex()、deleteIndex()、retrievalIndexByAliases()、createTemplate()、search()、prepareInsert()、prepareUpdate()、forceUpdate() 等，这些方法基本覆盖了基于 elasticSearch 存储的 CRUD 操作。
ElasticSearch7InsertRequest：功能作用域-继承 org.elasticsearch.action.index.IndexRequest，这个是 elasticSearch 的一个公共 API，在 ElasticSearch7Client 的 prepareInsert 方法中会返回 ElasticSearch7InsertRequest.source() 构造的 InsertRequest 对象，其实了就是包装针对 ES 的索引操作。
ElasticSearch7UpdateRequest：功能作用域，继承 org.elasticsearch.action.update.UpdateRequest，也会在 ElasticSearch7Client 的 prepareUpdate() 方法会构造 UpdateRequest 对象，来连接 elasticSearch 底层。

## base 模块：

StorageEs7Installer：功能作用域，继承 StorageEsInstaller 类，这个是低版本的一个 API，当然也是会了做适配。这个类的主要领域功能是：连接 ElasticSearch7InsertRequest 和存储，主要是用于 createMapping、createTable、createSetting 等，这些其实都是与索引相关。

## dao 模块：

MetricsEs7DAO：功能作用域，适配 MetricsEsDAO，主要封装基于度量指标的 DAO 类，multiGet、prepareBatchInsert、prepareBatchUpdate。
StorageEs7DAO：功能作用域，主要封装基于存储的 DAO 类，包括：newMetricsDao、newRegisterDao、newRecordDao 和 newNoneStreamDao。

## query 模块：

AggregationQueryEs7DAO：功能作用域，适配 AggregationQueryEsDAO，这个是聚合器查询的 DAO 模块。
AlarmQueryEs7DAO：功能作用域-适配 IAlarmQueryDAO，这个是告警查询的 DAO 模块。
LogQueryEs7DAO 功能作用域-适配 ILogQueryDAO，这个是日志查询的 DAO 模块。
MetadataQueryEs7DAO：功能作用域，适配 MetadataQueryEsDAO，这个是元数据查询的 DAO 模块。
MetricsQueryEs7DAO：功能作用域，适配 MetricsQueryEsDAO，这个是度量指标查询的 DAO 模块。
ProfileThreadSnapshotQueryEs7DAO：功能作用域，适配 ProfileThreadSnapshotQueryEsDAO，这个是线程快照查询的 DAO 模块。
TraceQueryEs7DAO：功能作用域，适配 TraceQueryEsDAO，这个是链路数据查询的 DAO 模块。

## cache 模块：

EndpointInventoryCacheEs7DAO：功能作用域，适配 EndpointInventoryCacheEsDAO，基于 Endpoint 的资产缓存 DAO。
NetworkAddressInventoryCacheEs7DAO：功能作用域，适配 NetworkAddressInventoryCacheEsDAO，基于 NetworkAddress 的资产缓存 DAO。
ServiceInstanceInventoryCacheEs7DAO：功能作用域，适配 ServiceInstanceInventoryCacheDAO，基于 ServiceInstance 的资产缓存 DAO。
ServiceInventoryCacheEs7DAO：功能作用域，适配 ServiceInventoryCacheEsDAO，基于 Service 的资产缓存 DAO。



# 记一次完整的 SkyWalking 落地业务的实战

## 业务痛点

共享业务中心已经成型，微服务化改造已经按照规划，从 0-1 在拆分，但是服务之间解耦之后，很多调用关系就很难维护，并且服务拆分之后，服务之间调用由以前的一次 RPC 到微服务化之后的多次 RPC，这样服务之间的可观察性和性能监控非常重要，这样就需要有这么一套分布式链路追踪系统来为共享业务中心服务，以及为后续的业务中台做准备。

## 全链路监控考虑因素

我们对全链路监控有如下要求：

- 低侵入性：代码低侵入，容易切换，且开发工作量小。

- 低性能影响：对业务本身机器资源使用和响应延迟影响较小。

- 操作简便、接入灵活。

- 时效性高：实时或近实时展示数据和报警。

## 技术选型

技术选型是一个非常艰难的过程，记得是在 2018 年，那个时候阿里的鹰眼平台才刚在云栖大会上公布，所有人都对分布式链路追踪非常陌生，当然也有很多前沿的技术人，在实践这款，那个时候开源的分布式链路追踪技术还不是那么的成熟。

目前技术选型的框架如下：

- Appdash

- Lightstep

- Jaeger

- Skywalking

- Openzipkin

- Pinpoint

- Spring Cloud Sleuth

- Cat

- 阿里的鹰眼

- sofa-tracer

## 为什么不用Istio做追踪？

![why not](https://ask.qcloudimg.com/http-save/yehe-8907256/e9d7f77a4a22cd7d7692defe5a3941b6.png)

请求经过sidecar，sidecar创建span，sidecar直接上报trace信息（如envoyAcessLogService）给trace系统（如jaeger、skywalking）。 

旧版本是通过Mixer的Adapter对接的，这里不再提及。

存在问题：

- 业务需要侵入性地为HTTP等协议添加Header，因为跨进程了，类似于SpanContexts的传递。

- 裸机业务无法追踪。

提醒：对于skywalking，只能在istio的tracing和普通agent形式任选其一，否则数据会重复，数据量会翻倍。

## 选择 skywalking 的原因

因为本文不是一篇技术选型的文章，但是为什么我们会选择 SkyWalking？

这里就简单地分析下：

- 遵守 OpenTracing 规范

- 开源社区非常活跃

- Apache 顶级项目

- 探针覆盖率非常高

- 插件化架构

- 丰富的 UI 拓扑资源

- 适配其他的分布式链路追踪系统，比如 Jaeger 和 Openzipkin

- 链路追踪性能损耗非常低

## 落地过程描述

1. 版本确认

因为要使用开源的框架，我们第一步就要确认稳定版本，然后开始 review 代码，这个阶段主要聚焦在整体的架构以及服务模块的边界上。

2. 测试环境采坑

测试环境接入一批边缘业务，验证链路的完整性以及一些不熟悉的功能，然后反馈社区，

社区的力量来完善框架，比如那个时候我们就通过这种方式，间接推动了 UI 的升级，才有了现在的比较高大尚的 UI 界面。

3. 预发布环境的引流

SkyWalking 接入到预发布环境之后，这样就能借助这个平台去监控准线上环境的流量，并且还可以通过这个平台去布道和宣讲，让业务负责人，有兴趣去接入这个系统，从而扩散它的优势。

4. 线上环境接入

接入线上环境之后，那么 SkyWalking 就在公司落地了，但是光落地肯定是不行的，因为我们要能维护，并且能够最大化的利用这个平台的价值，并为业务提效。

5. 充分利用 SkyWalking，并工具化

基于 SkyWalking 的告警平台设计、基于 SkyWalking 的服务等级协议设计、基于 SkyWalking 的业务链路依赖关系的设计等等，这个都是能够快速的为业务提效的能力，并且也都是 SkyWalking 能够工具化之后带来的能力。

6. 反哺社区

因为利用了开源来微公司的业务服务，我们也要反哺社区，这样这个生态就会更加丰富。

## 总结

SkyWalking 是一款非常优秀的分布式链路追踪系统，具备极强的分布式能力和代码诊断能力，并且对业务是零侵入，非常灵活。

在这里，我强烈地推荐大家布道这款国产的 Apache 顶级项目，并逐步完善这个生态体系，丰富它在 CNCF 体系中的角色能力。

本文是作者 review 源码之后结合自己落地之后的一些心得，也许会有些不完善，但也是作者的心血，欢迎支持原创。

# 参考资料

[分布式链路追踪Skywalking Skywalking 存储客户端设计](https://cloud.tencent.com/developer/article/1681266)

[可以用于云原生中Skywalking框架原理你真的懂吗](https://cloud.tencent.com/developer/article/1989637)

https://juejin.cn/post/7070293280147111966

https://blog.51cto.com/jackl/3313088

* any list
{:toc}