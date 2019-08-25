---
layout: post
title: 流式计算-ALI Blink-05
date:  2019-5-10 11:08:59 +0800
categories: [Stream]
tags: [stream, sh]
published: true
---

# Apache Flink

Apache Flink 是德国柏林工业大学的几个博士生和研究生从学校开始做起来的项目，早期叫做 Stratosphere。

2014 年，StratoSphere 项目中的核心成员从学校出来开发了 Flink，同时将 Flink 计算的主流方向定位为流计算，并在同年将 Flink 捐赠 Apache，后来快速孵化成为 Apache 的顶级项目。

# Ali Blink

阿里巴巴在 2015 年开始尝试使用 Flink。但是阿里的业务体量非常庞大，挑战也很多。

彼时的 Flink 不管是规模还是稳定性尚未经历实践，成熟度有待商榷。为了把这么大的业务体量支持好，我们不得不在 Flink 之上做了一系列的改进，所以阿里巴巴维护了一个内部版本的 Flink，它的名字叫做 Blink。

基于 Blink 的计算平台于 2016 年正式上线。截至目前，阿里绝大多数的技术部门都在使用 Blink。Blink 一直在阿里内部错综复杂的业务场景中锻炼成长着。对于内部用户反馈的各种性能、资源使用率、易用性等诸多方面的问题，Blink 都做了针对性的改进。

虽然现在 Blink 在阿里内部用的最多的场景主要还是流计算，但是在批计算场景也有不少业务上线使用了。

例如，搜索和推荐的算法业务平台就同时将 Blink 用于流计算和批处理。

Blink 被用来实现了流批一体化的样本生成和特征抽取流程，能够处理的特征数达到了数千亿，而且每秒钟能处理数亿条消息。

在这个场景的批处理中，我们单个作业处理的数据量已经超过 400T，并且为了节省资源，我们的批处理作业是和流计算作业以及搜索的在线引擎运行在同样的机器上。

流批一体化已经在阿里巴巴取得了极大的成功，我们希望这种成功以及阿里巴巴内部的经验都能够带回给社区。

# Blink 开源的背景

其实从我们选择 Flink 的第一天开始，我们就一直和社区紧密合作。过去的这几年我们也一直在把阿里对 Flink 的改进推回社区。

从 2016 年开始我们已经将流计算 SQL 的大部分功能、针对 runtime 的稳定性和性能优化做的若干重要设计都推回了社区。

但是 Blink 本身发展迭代的速度非常快，而社区有自己的步伐，很多时候可能无法把我们的变更及时推回去。

对于社区来说，一些大的功能和重构，需要达成共识后，才能被接受，这样才能更好地保证开源项目的质量，但是同时就会导致推入的速度变得相对较慢。

经过这几年的开发迭代，我们这边和社区之间的差距已经变得比较大了。

Blink 有一些很好的新功能，比如性能优越的批处理功能，在社区的版本是没有的。

在过去这段时间里，我们不断听到有人在询问 Blink 的各种新功能，期望 Blink 尽快开源的呼声越来越大。

我们一直在思考如何开源的问题。

一种方案就是和以前一样，继续把各种功能和优化分解，逐个和社区讨论，慢慢地推回 Flink，但这显然不是大家所期待的。

另一个方案，就是先完整地尽可能多地把代码开源，让社区的开发者能够尽快试用起来。 

第二个方案很快收到社区广大用户的支持。因此，从 2018 年年中开始我们就开始做开源的相关准备。经过半年的努力，我们终于把大部分 Blink 的功能梳理好，开源了出来。

# Blink 开源的方式

我们把代码贡献出来，是为了让大家能先尝试一些他们感兴趣的功能。

Blink 永远不会单独成为一个独立的开源项目来运作，它一定是 Flink 的一部分。

开源后我们期望能找到办法以最快的方式将 Blink merge 到 Flink 中去。

**Blink 开源只有一个目的，就是希望 Flink 做得更好。**

Apache Flink 是一个社区项目，Blink 以什么样的形式进入 Flink 是最合适的，怎么贡献是社区最希望的方式，我们都要和社区一起讨论。

在过去的一段时间内，我们在 Flink 社区征求了广泛的意见，大家一致认为将本次开源的 Blink 代码作为 Flink 的一个 branch 直接推回到 Apache Flink 项目中是最合适的方式。

并且我们和社区也一起讨论规划出一套能够快速 merge Blink 到 Flink master 中的方案（具体细节可以查看 Flink 社区正在讨论的 FLIP32）。

我们期望这个 merge 能够在很短的时间内完成。

这样我们之后的 Machine Learning 等其他新功能就可以直接推回到 Flink master。

相信用不了多久，Flink 和 Blink 就完全合二为一了。在那之后，阿里巴巴将直接使用 Flink 用于生产，并同时协助社区一起来维护 Flink。

# 本次开源的 Blink 的主要功能和优化点

本次开源的 Blink 代码在 Flink1.5.1 版本之上，加入了大量的新功能，以及在性能和稳定性上的各种优化。

主要贡献包括：阿里巴巴在流计算上积累的一些新功能和性能的优化，一套完整的（能够跑通全部 TPC-H/TPC-DS，能够读取 Hive meta 和 data）高性能 Batch SQL，以及一些以提升易用性为主的功能（包括支持更高效的 interactive programming，与 zeppelin 更紧密的结合，以及体验和性能更佳的 Flink web）。

未来我们还将继续给 Flink 贡献在 AI、IoT 以及其他新领域的功能和优化。

更多的关于这一版本 Blink release 的细节，请参考 Blink 代码根目录下的 README.md 文档。

下面，我来分模块介绍下 Blink 主要的新的功能和优化点。

## Runtime

为了更好地支持 batch processing，以及解决阿里巴巴大规模生产场景中遇到的各种挑战，Blink 对 Runtime 架构、效率、稳定性方面都做了大量改进。

在架构方面，首先 Blink 引入了 Pluggable Shuffle Architecture，开发者可以根据不同的计算模型或者新硬件的需要实现不同的 shuffle 策略进行适配。

此外 Blink 还引入新的调度架构，容许开发者根据计算模型自身的特点定制不同调度器。

为了优化性能，Blink 可以让算子更加灵活的 chain 在一起，避免了不必要的数据传输开销。

在 Pipeline Shuffle 模式中，使用了 ZeroCopy 减少了网络层内存消耗。

在 BroadCast Shuffle 模式中，Blink 优化掉了大量的不必要的序列化和反序列化开销。

此外，Blink 提供了全新的 JM FailOver 机制，JM 发生错误之后，新的 JM 会重新接管整个 JOB 而不是重启 JOB，从而大大减少了 JM FailOver 对 JOB 的影响。

最后，Blink 也开发了对 Kubernetes 的支持。

不同于 Standalone 模式在 Kubernetes 上的拉起方式，在基于 Flink FLIP6 的架构上基础之上，Blink 根据 job 的资源需求动态的申请 / 释放 Pod 来运行 TaskExecutor，实现了资源弹性，提升了资源的利用率。

## SQL/TableAPI

![SQL/TableAPI](https://oscimg.oschina.net/oscnet/6cf3638f6f3332c237683f46ee7349fb840.jpg)

SQL/TableAPI 架构上的重构和性能的优化是 Blink 本次开源版本的一个重大贡献。

首先，我们对 SQL engine 的架构做了较大的调整。

提出了全新的 Query Processor（QP）， 它包括了一个优化层（Query Optimizer）和一个算子层（Query Executor）。这样一来，流计算和批计算的在这两层大部分的设计工作就能做到尽可能地复用。

另外，SQL 和 TableAPI 的程序最终执行的时候将不会翻译到 DataStream 和 DataSet 这两个 API 上，而是直接构建到可运行的 DAG 上来，这样就使得物理执行算子的设计不完全依赖底层的 API，有了更大的灵活度，同时执行代码也能够被灵活的 codegen 出来。

唯一的一个影响就是这个版本的 SQL 和 TableAPI 不能和 DataSet 这个 API 进行互相转换，但仍然保留了和 DataStream API 互相转换的能力（将 DataStream 注册成表，或将 Table 转成 DataStream 后继续操作）。未来，我们计划把 dataset 的功能慢慢都在 DataStream 和 TableAPI 上面实现。到那时 DataStream 和 SQL 以及 tableAPI 一样，是一个可以同时描述 bounded 以及 unbounded processing 的 API。

除了架构上的重构，Blink 还在具体实现上做了较多比较大的重构。

首先，Blink 引入了二进制的数据结构 BinaryRow，极大的减少了数据存储上的开销以及数据在序列化和反序列化上计算的开销。

其次，在算子的实现层面，Blink 在更广范围内引入了 CodeGen 技术。由于预先知道算子需要处理的数据的类型，在 QP 层内部就可以直接生成更有针对性更高效的执行代码。Blink 的算子会动态的申请和使用资源，能够更好的利用资源，提升效率，更加重要的是这些算子对资源有着比较好的控制，不会发生 OutOfMemory 的问题。

此外，针对流计算场景，Blink 加入了 miniBatch 的执行模式，在 aggregate、join 等需要和 state 频繁交互且往往又能先做部分 reduce 的场景中，使用 miniBatch 能够极大的减少 IO，从而成数量级的提升性能。除了上面提到的这些重要的重构和功能点，Blink 还实现了完整的 SQL DDL，带 emit 策略的流计算 DML，若干重要的 SQL 功能，以及大量的性能优化策略。

有了上面提到的诸多架构和实现上的重构。Blink 的 SQL／tableAPI 在功能和性能方面都取得了脱胎换骨的变化。

在批计算方面，首先 Blink batch SQL 能够完整地跑通 TPC-H 和 TPC-DS，且性能上有了极大的提升。

![批计算方面](https://oscimg.oschina.net/oscnet/2ceece441c893a6c29fcb263021c97ff6c2.jpg)

如上图所示，是这次开源的 Blink 版本和 spark 2.3.1 的 TPC-DS 的 benchmark 性能对比。柱状图的高度代表了运行的总时间，高度越低说明性能越好。可以看出，Blink 在 TPC-DS 上和 Spark 相比有着非常明显的性能优势，而且这种性能优势随着数据量的增加而变得越来越大。在实际的场景这种优势已经超过 Spark 三倍，在流计算性能上我们也取得了类似的提升。我们线上的很多典型作业，性能是原来的 3 到 5 倍。在有数据倾斜的场景，以及若干比较有挑战的 TPC-H query，流计算性能甚至得到了数十倍的提升。

除了标准的 Relational SQL API。

TableAPI 在功能上是 SQL 的超集，因此在 SQL 上所有新加的功能，我们在 tableAPI 也添加了相对应的 API。

除此之外，我们还在 TableAPI 上引入了一些新的功能。

其中一个比较重要是 cache 功能。

在批计算场景下，用户可以根据需要来 cache 计算的中间结果，从而避免不必要的重复计算，它极大地增强了 interactive programming 体验。

我们后续会在 tableAPI 上添加更多有用的功能。

其实很多新功能已经在社区展开讨论并被社区接受，例如我们在 tableAPI 增加了对一整行操作的算子 map/flatMap/aggregate/flatAggregate (Flink FLIP29) 等等。

# Hive 的兼容性

我们这次开源的版本实现了在元数据（meta data）和数据层将 Flink 和 Hive 对接和打通。国内外很多公司都还在用 Hive 在做自己的批处理。

对于这些用户，现在使用这次 Blink 开源的版本，就可以直接用 Flink SQL 去查询 Hive 的数据，真正能够做到在 Hive 引擎和 Flink 引擎之间的自由切换。

为了打通元数据，我们重构了 Flink catalog 的实现，并且增加了两种 catalog，一个是基于内存存储的 FlinkInMemoryCatalog，另外一个是能够桥接 Hive metaStore 的 HiveCatalog。

有了这个 HiveCatalog，Flink 作业就能读取 Hive 的 metaData。

为了打通数据，我们实现了 HiveTableSource，使得 Flink job 可以直接读取 Hive 中普通表和分区表的数据。

因此，通过这个版本，用户可以使用 Flink SQL 读取已有的 Hive meta 和 data，做数据处理。

未来我们将在 Flink 上继续加大对 Hive 兼容性的支持，包括支持 Hive 特有的 query，data type，和 Hive UDF 等等。

# Zeppelin for Flink

为了提供更好的可视化和交互式体验，我们做了大量的工作让 Zeppelin 能够更好的支持 Flink。

这些改动有些是在 Flink 上的，有些是在 Zeppelin 上的。

在这些改动全部推回 Flink 和 Zeppelin 社区之前，大家可以使用这个 Zeppelin image (具体细节请参考 Blink 代码里的 docs/quickstart/zeppelin_quickstart.md) 来测试和使用这些功能。

这个用于测试的 Zeppelin 版本，首先很好地融合和集成了 Flink 的多种运行模式以及运维界面。

使用文本 SQL 和 tableAPI 可以自如的查询 Flink 的 static table 和 dynamic table。

此外，针对 Flink 的流计算的特点，这一版 Zeppelin 也很好地支持了 savepoint，用户可以在界面上暂停作业，然后再从 savepoint 恢复继续运行作业。

在数据展示方面，除了传统的数据分析界面，我们也添加了流计算的翻牌器和时间序列展示等等功能。

# Flink Web

我们对 Flink Web 的易用性与性能等多个方面做了大量的改进，从资源使用、作业调优、日志查询等维度新增了大量功能，使得用户可以更方便的对 Flink 作业进行运维。

在资源使用方面，新增了 Cluster、TaskManager 与 Job 三个级别的资源信息，使得资源的申请与使用情况一目了然。

作业的拓扑关系及数据流向可以追溯至 Operator 级别，Vertex 增加了 InQueue，OutQueue 等多项指标，可以方便的追踪数据的反压、过滤及倾斜情况。

TaskManager 和 JobManager 的日志功能得到大幅度加强，从 Job、Vertex、SubTask 等多个维度都可以关联至对应日志，提供多日志文件访问入口，以及分页展示查询和日志高亮功能。

另外，我们使用了较新的 Angular 7.0 对 Flink web 进行了全面重构，页面运行性能有了一倍以上的提升。 

在大数据量情况下也不会发生页面卡死或者卡顿情况。同时对页面的交互逻辑进行了整体优化，绝大部分关联信息在单个页面就可以完成查询和比对工作，减少了大量不必要的跳转。

# 未来的规划

Blink 迈出了全面开源的第一步，接下来我们会和社区合作，尽可能以最快的方式将 Blink 的功能和性能上的优化 merge 回 Flink。

本次的开源版本一方面贡献了 Blink 多年在流计算的积累，另一方面又重磅推出了在批处理上的成果。接下来，我们会持续给 Flink 社区贡献其他方面的功能。我们期望每过几个月就能看到技术上有一个比较大的亮点贡献到社区。下一个亮点应该是对机器学习的支持。

要把机器学习支持好，有一系列的工作要做，包括引擎的功能、性能和易用性。

这里面大部分的工作我们已经开发完成，并且很多功能都已经在阿里巴巴内部服务上线了。

除了技术上创新以及新功能之外，Flink 的易用性和外围生态也非常重要。

我们已经启动了若干这方面的项目，包括 Python 以及 Go 等多语言支持、Flink 集群管理、Notebook 以及机器学习平台等等。

这些项目有些会成为 Flink 自身的一部分贡献回社区，有些不是。

但它们都基于 Flink，是 Flink 生态的一个很好的补充。独立于 Flink 之外的那些项目，我们都也在认真的考虑开源出来。

总之，Blink 在开源的第一天起，就已经完全 all-in 的融入了 Flink 社区，我们希望所有的开发者看到我们的诚意和决心。

未来，无论是功能还是生态，我们都会在 Flink 社区加大投入，我们也将投入力量做 Flink 社区的运营，让 Flink 真正在中国、乃至全世界大规模地使用起来。

我们衷心的希望更多的人加入，一起把 Apache Flink 开源社区做的更好！

# 个人收获

生态很重要。

# 拓展阅读

[DAG]()

[Binary Row]()

[CodeGen 技术]()

# 参考资料

[阿里重磅开源Blink：为什么我们等了这么久？](https://www.jianshu.com/p/37a6acfc3124)

* any list
{:toc}