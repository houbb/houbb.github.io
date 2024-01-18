---
layout: post
title: 时序数据库-08-vm VictoriaMetrics 快速、经济高效的监控解决方案和时间序列数据库
date:  2019-4-1 19:24:57 +0800
categories: [Database]
tags: [database, dis-database, distributed, time-series, monitor, sf]
published: true
---

# VictoriaMetrics

VictoriaMetrics 是一款快速、经济高效且可扩展的监控解决方案和时间序列数据库。

VictoriaMetrics提供了二进制发布、Docker镜像、Snap包以及源代码的形式供用户使用。

VictoriaMetrics的集群版本可以在此处找到。

了解更多关于VictoriaMetrics的关键概念，并按照快速入门指南获得更好的体验。

此外，还有一个用于日志的用户友好型数据库 - VictoriaLogs。

如果您对VictoriaMetrics有任何疑问，请随时在VictoriaMetrics社区的Slack聊天中提问。

如果您需要针对VictoriaMetrics的企业支持，请与我们联系。查看企业套餐中提供的功能。企业版的二进制文件可以从发布页面免费下载和评估。您还可以申请免费试用许可证。

VictoriaMetrics正在以快速的速度进行开发，因此建议定期查看CHANGELOG并进行定期升级。

VictoriaMetrics已经获得了关于数据库软件开发和基于软件的监控服务的安全认证。

在我们的一切工作中，我们采取了严格的安全措施。有关更多详细信息，请参阅我们的安全页面。

# ## 显著特点

VictoriaMetrics具有以下显著特点：

* 它可作为Prometheus的长期存储使用。详细信息请参见[这些文档](#prometheus-setup)。
* 它可作为Grafana中Prometheus的替代品，因为它支持[Prometheus查询API](#prometheus-querying-api-usage)。
* 它可作为Grafana中Graphite的替代品，因为它支持[Graphite API](#graphite-api-usage)。VictoriaMetrics通过降低基础架构成本，相较于Graphite可减少超过10倍 - 请参阅[此案例研究](https://docs.victoriametrics.com/CaseStudies.html#grammarly)。

* 安装和操作都很简单：
  * VictoriaMetrics由单一的[小型可执行文件](https://medium.com/@valyala/stripping-dependency-bloat-in-victoriametrics-docker-image-983fb5912b0d)组成，无需外部依赖。
  * 所有配置都通过明确的命令行标志进行，具有合理的默认值。
  * 所有数据都存储在由`-storageDataPath`命令行标志指定的单个目录中。
  * 可以使用[vmbackup](https://docs.victoriametrics.com/vmbackup.html) / [vmrestore](https://docs.victoriametrics.com/vmrestore.html)工具从[即时快照](https://medium.com/@valyala/how-victoriametrics-makes-instant-snapshots-for-multi-terabyte-time-series-data-e1f3fb0e0282)中进行轻松且快速的备份，详情请参阅[此文章](https://medium.com/@valyala/speeding-up-backups-for-big-time-series-databases-533c1a927883)。
* 它实现了类似PromQL的查询语言 - [MetricsQL](https://docs.victoriametrics.com/MetricsQL.html)，提供了在PromQL基础上改进的功能。
* 它提供全局查询视图。多个Prometheus实例或任何其他数据源都可以将数据导入VictoriaMetrics。稍后，可以通过单个查询查询此数据。
* 它在[数据摄入](https://medium.com/@valyala/high-cardinality-tsdb-benchmarks-victoriametrics-vs-timescaledb-vs-influxdb-13e6ee64dd6b)和[数据查询](https://medium.com/@valyala/when-size-matters-benchmarking-victoriametrics-vs-timescale-and-influxdb-6035811952d4)方面提供高性能和良好的垂直和水平可伸缩性。它在[Google Cloud中超过InfluxDB和TimescaleDB最多20倍](https://medium.com/@valyala/measuring-vertical-scalability-for-time-series-databases-in-google-cloud-92550d78d8ae)。
* 在处理数百万个唯一时间序列（即[高基数](https://docs.victoriametrics.com/FAQ.html#what-is-high-cardinality)）时，[它比InfluxDB使用的RAM少10倍](https://medium.com/@valyala/insert-benchmarks-with-inch-influxdb-vs-victoriametrics-e31a41ae2893)，比Prometheus、Thanos或Cortex使用的RAM少7倍以上。* 它针对[高换序率](https://docs.victoriametrics.com/FAQ.html#what-is-high-churn-rate)的时间序列进行了优化。
* 它提供高数据压缩：根据[这些基准](https://medium.com/@valyala/when-size-matters-benchmarking-victoriametrics-vs-timescale-and-influxdb-6035811952d4)，与TimescaleDB相比，可以将多达70倍的数据点存储到有限的存储中，与Prometheus、Thanos或Cortex相比，所需的存储空间可以少7倍。* 它针对具有高延迟IO和低IOPS（AWS、Google Cloud、Microsoft Azure等的HDD和网络存储）进行了优化。请参阅[这些基准测试的磁盘IO图表](https://medium.com/@valyala/high-cardinality-tsdb-benchmarks-victoriametrics-vs-timescaledb-vs-influxdb-13e6ee64dd6b)。
* 单节点的VictoriaMetrics可以替代使用竞争解决方案（如Thanos、M3DB、Cortex、InfluxDB或TimescaleDB）构建的中等大小的集群。请参阅[垂直可伸缩性基准测试](https://medium.com/@valyala/measuring-vertical-scalability-for-time-series-databases-in-google-cloud-92550d78d8ae)、[比较Thanos与VictoriaMetrics集群](https://medium.com/@valyala/comparing-thanos-to-victoriametrics-cluster-b193bea1683)以及[PromCon 2019](https://promcon.io/2019-munich/talks/remote-write-storage-wars/)的[Remote Write Storage Wars](https://promcon.io/2019-munich/talks/remote-write-storage-wars/)演讲。
* 它通过[存储架构](https://medium.com/@valyala/how-victoriametrics-makes-instant-snapshots-for-multi-terabyte-time-series-data-e1f3fb0e0282)保护存储免受在不干净的关闭（即OOM、硬件重置或`kill -9`）时的数据损坏。
* 它通过以下协议支持指标抓取、摄入和[回填](#backfilling)：
  * [从Prometheus出口器抓取指标](#how-to-scrape-prometheus-exporters-such-as-node-exporter)。
  * [Prometheus远程写API](#prometheus-setup)。
  * [Prometheus出口格式](#how-to-import-data-in-prometheus-exposition-format)。
  * [InfluxDB行协议](#how-to-send-data-from-influxdb-compatible-agents-such-as-telegraf)通过HTTP、TCP和UDP。

## 案例研究和演讲

案例研究：

* [AbiosGaming](https://docs.victoriametrics.com/CaseStudies.html#abiosgaming)
* [adidas](https://docs.victoriametrics.com/CaseStudies.html#adidas)
* [Adsterra](https://docs.victoriametrics.com/CaseStudies.html#adsterra)
* [ARNES](https://docs.victoriametrics.com/CaseStudies.html#arnes)
* [Brandwatch](https://docs.victoriametrics.com/CaseStudies.html#brandwatch)
* [CERN](https://docs.victoriametrics.com/CaseStudies.html#cern)
* [COLOPL](https://docs.victoriametrics.com/CaseStudies.html#colopl)
* [Criteo](https://docs.victoriametrics.com/CaseStudies.html#criteo)
* [Dig Security](https://docs.victoriametrics.com/CaseStudies.html#dig-security)
* [Fly.io](https://docs.victoriametrics.com/CaseStudies.html#flyio)
* [German Research Center for Artificial Intelligence](https://docs.victoriametrics.com/CaseStudies.html#german-research-center-for-artificial-intelligence)
* [Grammarly](https://docs.victoriametrics.com/CaseStudies.html#grammarly)
* [Groove X](https://docs.victoriametrics.com/CaseStudies.html#groove-x)
* [Idealo.de](https://docs.victoriametrics.com/CaseStudies.html#idealode)
* [MHI Vestas Offshore Wind](https://docs.victoriametrics.com/CaseStudies.html#mhi-vestas-offshore-wind)
* [Naver](https://docs.victoriametrics.com/CaseStudies.html#naver)
* [Razorpay](https://docs.victoriametrics.com/CaseStudies.html#razorpay)
* [Percona](https://docs.victoriametrics.com/CaseStudies.html#percona)
* [Roblox](https://docs.victoriametrics.com/CaseStudies.html#roblox)
* [Sensedia](https://docs.victoriametrics.com/CaseStudies.html#sensedia)
* [Smarkets](https://docs.victoriametrics.com/CaseStudies.html#smarkets)
* [Synthesio](https://docs.victoriametrics.com/CaseStudies.html#synthesio)
* [Wedos.com](https://docs.victoriametrics.com/CaseStudies.html#wedoscom)
* [Wix.com](https://docs.victoriametrics.com/CaseStudies.html#wixcom)
* [Zerodha](https://docs.victoriametrics.com/CaseStudies.html#zerodha)
* [zhihu](https://docs.victoriametrics.com/CaseStudies.html#zhihu)

另请参阅[关于VictoriaMetrics的用户文章和演示文稿](https://docs.victoriametrics.com/Articles.html#third-party-articles-and-slides-about-victoriametrics)。

## 操作

### 安装

要快速尝试VictoriaMetrics，只需下载[VictoriaMetrics可执行文件](https://github.com/VictoriaMetrics/VictoriaMetrics/releases/latest)或[Docker镜像](https://hub.docker.com/r/victoriametrics/victoria-metrics/)，并使用所需的命令行标志启动它。详细信息请参见[快速入门指南](https://docs.victoriametrics.com/Quick-Start.html)。

VictoriaMetrics也可以通过以下安装方法安装：

* [用于单节点和集群版本的VictoriaMetrics的Helm图表](https://github.com/VictoriaMetrics/helm-charts)。
* [用于VictoriaMetrics的Kubernetes操作员](https://github.com/VictoriaMetrics/operator)。
* [由VictoriaMetrics提供的用于安装集群VictoriaMetrics的Ansible角色](https://github.com/VictoriaMetrics/ansible-playbooks)。
* [由社区提供的用于安装集群VictoriaMetrics的Ansible角色](https://github.com/Slapper/ansible-victoriametrics-cluster-role)。
* [由社区提供的用于安装单节点VictoriaMetrics的Ansible角色](https://github.com/dreamteam-gg/ansible-victoriametrics-role)。
* [VictoriaMetrics的Snap包](https://snapcraft.io/victoriametrics)。

### 如何启动VictoriaMetrics

以下命令行标志最常用：

* `-storageDataPath` - VictoriaMetrics将所有数据存储在此目录中。默认路径为当前工作目录中的`victoria-metrics-data`。
* `-retentionPeriod` - 存储数据的保留期。较旧的数据将自动删除。默认保留期为1个月（31天）。最小保留期为24小时或1天。有关详细信息，请参见[这些文档](#retention)。

其他标志具有足够好的默认值，因此只有在确实需要时才设置它们。传递`-help`以查看[所有可用标志及其描述和默认值](#list-of-command-line-flags)。

在初始设置VictoriaMetrics期间，以下文档可能会有帮助：
* [如何设置对Prometheus兼容目标的抓取](https://docs.victoriametrics.com/#how-to-scrape-prometheus-exporters-such-as-node-exporter)
* [如何将数据导入VictoriaMetrics](#how-to-import-time-series-data)
* [如何设置Prometheus将数据写入VictoriaMetrics](https://docs.victoriametrics.com/#prometheus-setup)
* [如何通过Grafana查询VictoriaMetrics](#grafana-setup)
* [如何通过Graphite API查询VictoriaMetrics](#graphite-api-usage)
* [如何处理警报](#alerting)

VictoriaMetrics默认在端口`8428`上接受[Prometheus查询API请求](#prometheus-querying-api-usage)。

建议为VictoriaMetrics设置[监控](#monitoring)。

### 环境变量

所有的VictoriaMetrics组件都允许在`yaml`配置文件（如`-promscrape.config`）中引用环境变量，
以及通过`%{ENV_VAR}`语法在命令行标志中引用环境变量。
例如，如果在VictoriaMetrics启动时存在`METRICS_AUTH_KEY=top-secret`环境变量，
则`-metricsAuthKey=%{METRICS_AUTH_KEY}`会自动扩展为`-metricsAuthKey=top-secret`。这个扩展是由VictoriaMetrics自己执行的。

VictoriaMetrics在启动时递归扩展环境变量中的`%{ENV_VAR}`引用。
例如，如果`BAR=a%{BAZ}`且`BAZ=bc`，则`FOO=%{BAR}`环境变量在启动时扩展为`FOO=abc`。

此外，所有的VictoriaMetrics组件都允许根据以下规则通过环境变量设置标志值：

* 必须设置`-envflag.enable`标志。
* 标志名称中的每个`.`字符都必须替换为`_`（例如，`-insert.maxQueueDuration <duration>`将转换为`insert_maxQueueDuration=<duration>`）。
* 对于重复的标志，可以使用将不同值使用`,`字符连接起来的替代语法作为分隔符（例如，`-storageNode <nodeA> -storageNode <nodeB>`将转换为`storageNode=<nodeA>,<nodeB>`）。
* 可以通过`-envflag.prefix`标志设置环境变量前缀。例如，如果`-envflag.prefix=VM_`，那么环境变量必须以`VM_`开头。

### 使用Snap包进行配置

VictoriaMetrics的Snap包可在[此处](https://snapcraft.io/victoriametrics)获取。

可以使用以下命令设置Snap包的命令行标志：

```text
echo 'FLAGS="-selfScrapeInterval=10s -search.logSlowQueryDuration=20s"' > $SNAP_DATA/var/snap/victor

iametrics/current/extra_flags
snap restart victoriametrics
```

请勿更改`-storageDataPath`标志的值，因为Snap包对主机文件系统的访问受到限制。

可以使用文本编辑器更改抓取配置：

```text
vi $SNAP_DATA/var/snap/victoriametrics/current/etc/victoriametrics-scrape-config.yaml
```

更改后，使用命令`curl 127.0.0.1:8428/-/reload`触发配置重新读取。

### 作为Windows服务运行

要将VictoriaMetrics作为Windows服务运行，需要为[WinSW](https://github.com/winsw/winsw)创建服务配置，然后根据以下指南安装服务：

1. 创建服务配置：

    ```xml
    <service>
      <id>VictoriaMetrics</id>
      <name>VictoriaMetrics</name>
      <description>VictoriaMetrics</description>
      <executable>%BASE%\victoria-metrics-windows-amd64-prod.exe"</executable>

      <onfailure action="restart" delay="10 sec"/>
      <onfailure action="restart" delay="20 sec"/>

      <resetfailure>1 hour</resetfailure>

      <arguments>-envflag.enable</arguments>

      <priority>Normal</priority>

      <stoptimeout>15 sec</stoptimeout>

      <stopparentprocessfirst>true</stopparentprocessfirst>
        <startmode>Automatic</startmode>
        <waithint>15 sec</waithint>
        <sleeptime>1 sec</sleeptime>

      <logpath>%BASE%\logs</logpath>
      <log mode="roll">
        <sizeThreshold>10240</sizeThreshold>
        <keepFiles>8</keepFiles>
      </log>

      <env name="loggerFormat" value="json" />
      <env name="loggerOutput" value="stderr" />
      <env name="promscrape_config" value="C:\Program Files\victoria-metrics\promscrape.yml" />

    </service>
    ```

1. 按照以下PowerShell中的指南以从提升的PowerShell中运行来安装WinSW：

    ```console
    winsw install VictoriaMetrics.xml
    Get-Service VictoriaMetrics | Start-Service
    ```

有关更多详细信息，请参见[此问题](https://github.com/VictoriaMetrics/VictoriaMetrics/issues/3781)。

# TODO

其他内容比较多，参考：

https://github.com/VictoriaMetrics/VictoriaMetrics


# chat

## 详细介绍一下 VictoriaMetrics

截至我知识截止日期（2022年1月），VictoriaMetrics是一个用于处理和存储时间序列数据的开源软件。

它专注于高性能、低资源消耗和易于扩展，特别适用于处理大规模的监控数据。

以下是关于VictoriaMetrics的一些详细介绍：

1. **时间序列数据库**：VictoriaMetrics是一个时间序列数据库，设计用于存储按时间顺序排列的数据，通常用于监控和度量方面的数据。这种数据库类型对于快速、高效地处理大量时间序列数据非常重要。

2. **高性能和低资源消耗**：VictoriaMetrics被设计为高性能、低资源消耗的解决方案。它在处理大量数据时表现出色，并具有较低的硬件和网络资源要求。

3. **支持Prometheus生态系统**：VictoriaMetrics是在Prometheus开源监控系统的基础上发展而来的，并提供对Prometheus的兼容性。这意味着可以无缝地将Prometheus中的数据迁移到VictoriaMetrics中，并利用VictoriaMetrics的性能和扩展性。

4. **易于部署和扩展**：VictoriaMetrics提供了简单的部署方式，可以很容易地与现有的基础架构集成。它支持水平扩展，可以通过添加更多的节点来增加系统的容量和性能。

5. **支持多种查询语言**：VictoriaMetrics支持PromQL（Prometheus查询语言），这是一个用于查询和分析Prometheus数据的功能强大的语言。这使得已经熟悉Prometheus的用户能够无缝过渡到VictoriaMetrics。

6. **持久性存储**：VictoriaMetrics通过使用高效的时间序列数据库技术，将时间序列数据持久地存储在磁盘上，以确保数据在系统重启或故障时不会丢失。

7. **云原生支持**：VictoriaMetrics可以轻松地集成到云原生环境中，例如Kubernetes。这使得它适用于现代化的容器化和微服务架构。

请注意，软件工具的更新和变化可能导致一些信息在我知识截止日期之后已经过时。因此，如果您对VictoriaMetrics的最新信息感兴趣，建议查阅官方文档或项目的最新资料。

## VictoriaMetrics 有哪些优缺点？

VictoriaMetrics作为一个时间序列数据库，具有一些优点和缺点，这些可能会根据具体的使用场景和需求而有所不同。

以下是一些常见的优缺点：

**优点：**

1. **高性能：** VictoriaMetrics被设计为高性能的时间序列数据库，能够快速处理大规模的监控数据，适用于需要快速响应的实时应用。

2. **低资源消耗：** 相对于一些其他时间序列数据库，VictoriaMetrics在处理相同量级的数据时通常需要较少的硬件资源，这使得它更适合于资源受限的环境。

3. **Prometheus兼容性：** 由于其与Prometheus的兼容性，用户可以无缝迁移现有的Prometheus数据到VictoriaMetrics，并继续使用PromQL进行查询，同时受益于VictoriaMetrics的性能和扩展性。

4. **易于部署和扩展：** VictoriaMetrics提供了简单的部署方式，可以轻松集成到各种环境中。它还支持水平扩展，通过添加更多的节点，可以提高系统的容量和性能。

5. **云原生支持：** 支持云原生环境，如Kubernetes，使得它适用于现代化的容器化和微服务架构。

**缺点：**

1. **社区规模：** 相对于一些较早或较知名的时间序列数据库，VictoriaMetrics 的社区规模可能相对较小。这可能导致相对较少的社区支持和文档资源。

2. **生态系统：** 尽管VictoriaMetrics兼容Prometheus，但一些其他时间序列数据库可能具有更丰富的生态系统和插件支持。

3. **最新性：** 如果您对最新特性和更新的需求较高，可能需要定期检查VictoriaMetrics的更新和发布情况，以确保使用的是最新版本。

4. **学习曲线：** 对于那些不熟悉Prometheus或时间序列数据库概念的用户来说，可能需要一些时间来学习和适应。

总体来说，选择使用VictoriaMetrics还是其他时间序列数据库应该基于具体的需求、环境和优先级考虑。

在做决定之前，最好进行实际的性能测试和评估，以确保它满足您的要求。

## VictoriaMetrics VS TDEngine 

VictoriaMetrics和TDEngine（TD时序数据库）都是用于处理和存储时间序列数据的数据库系统，但它们在设计、特性和用途上有一些不同。

以下是它们之间的一些比较：

**1. 设计理念和用途：**

   - **VictoriaMetrics：** 主要设计为一个高性能、低资源消耗的时间序列数据库，特别适用于大规模监控数据。它是Prometheus的后端存储，兼容Prometheus查询语言（PromQL）。
   - **TDEngine：** 是一个专注于高性能的时序数据库，适用于金融、物联网（IoT）、大数据分析等领域。它具有较好的数据压缩和查询性能。

**2. 兼容性：**
   - **VictoriaMetrics：** 兼容Prometheus，可以无缝集成Prometheus数据，并支持PromQL查询语言。
   - **TDEngine：** 提供SQL查询接口，支持SQL语言，使得用户可以使用熟悉的SQL语法进行查询。

**3. 查询语言：**
   - **VictoriaMetrics：** 使用PromQL，适用于监控和度量领域，支持Prometheus生态系统。
   - **TDEngine：** 使用SQL，更通用，适用于广泛的应用场景，使得它更容易被熟悉SQL的用户采用。

**4. 生态系统和插件：**
   - **VictoriaMetrics：** 兼容Prometheus生态系统，因此可以利用Prometheus的监控工具和插件。
   - **TDEngine：** 在SQL领域，可以受益于更广泛的SQL工具和生态系统。

**5. 部署和扩展：**
   - **VictoriaMetrics：** 提供简单的部署方式，支持水平扩展，可以通过添加更多的节点来提高性能和容量。
   - **TDEngine：** 也支持分布式部署，可以通过添加节点进行扩展。

**6. 社区和文档：**
   - **VictoriaMetrics：** 具有相对较小的社区规模，但有一定数量的文档和支持。
   - **TDEngine：** 在国内有较大的用户社区支持，提供了相应的文档和社区支持。

**7. 应用领域：**
   - **VictoriaMetrics：** 主要用于监控和度量，特别是在云原生环境中。
   - **TDEngine：** 适用于金融、物联网、大数据分析等领域。

选择使用VictoriaMetrics还是TDEngine应该根据具体的需求、技术栈和使用场景进行权衡。

对于监控和度量领域，以及需要Prometheus兼容性的情况下，VictoriaMetrics可能更合适。

对于需要通用的SQL查询和更广泛应用领域的场景，TDEngine可能是一个更好的选择。

# 参考资料

https://github.com/VictoriaMetrics/VictoriaMetrics

* any list
{:toc}