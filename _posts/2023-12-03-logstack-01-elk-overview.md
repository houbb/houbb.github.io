---
layout: post
title: logstack 日志技术栈-01-ELK/EFK 入门介绍
date: 2023-10-30 21:01:55 +0800
categories: [Log]
tags: [log, elk, sh]
published: true
---

# 常见日志收集方案

## 1.1、EFK

​在Kubernetes集群上运行多个服务和应用程序时，日志收集系统可以帮助你快速分类和分析由Pod生成的大量日志数据。

Kubernetes中比较流行的日志收集解决方案是Elasticsearch、Fluentd和Kibana（EFK）技术栈，也是官方推荐的一种方案。

1）Elasticsearch：是一个实时的，分布式的，可扩展的搜索引擎，它允许进行全文本和结构化搜索以及对日志进行分析。它通常用于索引和搜索大量日志数据，也可以用于搜索许多不同种类的文档。

2）Kibana：Elasticsearch通常与Kibana一起部署，kibana可以把Elasticsearch采集到的数据通过dashboard（仪表板）可视化展示出来。Kibana允许你通过Web界面浏览Elasticsearch日志数据，也可自定义查询条件快速检索出elasticccsearch中的日志数据。

3）Fluentd：是一个流行的开源数据收集器，我们在 Kubernetes 集群节点上安装 Fluentd，通过获取容器日志文件、过滤和转换日志数据，然后将数据传递到 Elasticsearch 集群，在该集群中对其进行索引和存储。

## 1.2、ELK Stack

1）Elasticsearch：日志存储和搜索引擎，它的特点有：分布式，零配置，自动发现，索引自动分片，索引副本机制，restful风格接口，多数据源，自动搜索负载等。

2）Logstash：是一个完全开源的工具，他可以对你的日志进行收集、过滤，并将其存储供以后使用（支持动态的从各种数据源搜集数据，并对数据进行过滤、分析、丰富、统一格式等操作。）。

3）Kibana ：是一个开源和免费的工具，Kibana可以为 Logstash 和 ElasticSearch 提供的日志分析友好的 Web 界面，可以帮助您汇总、分析和搜索重要数据日志。

![ELK](https://gitee.com/hujinzhong/blogimg/raw/master/image-20210713102305500.png)

考虑到聚合端（日志处理、清洗等）负载问题和采集端传输效率，一般在日志量比较大的时候在采集端和聚合端增加队列，以用来实现日志消峰。

## 1.3、ELK+filebeat

![ELK+filebeat](https://gitee.com/hujinzhong/blogimg/raw/master/image-20210713102444220.png)

Filebeat（采集）—> Logstash（聚合、处理）—> ElasticSearch （存储+检索）—>Kibana （展示）

## 1.4、其他方案

ELK日志流程可以有多种方案（不同组件可自由组合，根据自身业务配置），常见有以下：

1）Logstash（采集、处理）—> ElasticSearch （存储）—>Kibana （展示）
2）Logstash（采集）—> Logstash（聚合、处理）—> ElasticSearch （存储）—>Kibana （展示）
3）Filebeat（采集、处理）—> ElasticSearch （存储）—>Kibana （展示）
4）Filebeat（采集）—> Logstash（聚合、处理）—> ElasticSearch （存储）—>Kibana （展示）
5）Filebeat（采集）—> Kafka/Redis(消峰) —> Logstash（聚合、处理）—> ElasticSearch （存储）—>Kibana （展示）


# 二、相关组件介绍

## 2.1、elasticsearch组件介绍

Elasticsearch 是一个分布式的免费开源搜索和分析引擎，适用于包括文本、数字、地理空间、结构化和非结构化数据等在内的所有类型的数据。

Elasticsearch 在 Apache Lucene 的基础上开发而成，由 Elasticsearch N.V.（即现在的 Elastic）于 2010 年首次发布。

Elasticsearch 以其简单的 REST 风格 API、分布式特性、速度和可扩展性而闻名，是 Elastic Stack 的核心组件；Elastic Stack 是一套适用于数据采集、扩充、存储、分析和可视化的免费开源工具。

人们通常将 Elastic Stack 称为 ELK Stack（代指 Elasticsearch、Logstash 和 Kibana），目前 Elastic Stack 包括一系列丰富的轻量型数据采集代理，这些代理统称为 Beats，可用来向 Elasticsearch 发送数据。

## 2.2、filebeat组件介绍

### 2.2.1、filebeat和beat关系

filebeat是Beats中的一员。Beats是一个轻量级日志采集器，Beats家族有6个成员，早期的ELK架构中使用Logstash收集、解析日志，但是Logstash对内存、cpu、io等资源消耗比较高。

相比Logstash，Beats所占系统的CPU和内存几乎可以忽略不计。

目前Beats包含六种工具：

1、Packetbeat：网络数据（收集网络流量数据）
2、Metricbeat：指标（收集系统、进程和文件系统级别的CPU和内存使用情况等数据）
3、Filebeat：日志文件（收集文件数据）
4、Winlogbeat：windows事件日志（收集Windows事件日志数据）
5、Auditbeat：审计数据（收集审计日志）
6、Heartbeat：运行时间监控（收集系统运行时的数据）

### 2.2.2、filebeat 是什么

Filebeat是用于转发和收集日志数据的轻量级传送工具。

Filebeat监视你指定的日志文件或位置，收集日志事件，并将它们转发到Elasticsearch或 Logstash中。

Filebeat的工作方式如下：启动Filebeat时，它将启动一个或多个输入，这些输入将在为日志数据指定的位置中查找。对于Filebeat所找到的每个日志，Filebeat都会启动收集器。

每个收集器都读取单个日志以获取新内容，并将新日志数据发送到libbeat，libbeat将聚集事件，并将聚集的数据发送到为Filebeat配置的输出。

![filebeat 是什么](https://gitee.com/hujinzhong/blogimg/raw/master/image-20210713103325816.png)

Filebeat 有两个主要组件：

harvester：一个harvester负责读取一个单个文件的内容。

harvester逐行读取每个文件，并把这些内容发送到输出。

每个文件启动一个harvester。

Input：一个input负责管理harvesters，并找到所有要读取的源。

如果input类型是log，则input查找驱动器上与已定义的log日志路径匹配的所有文件，并为每个文件启动一个harvester。

### 2.2.3、Filebeat工作原理

1）在任何环境下，应用程序都有停机的可能性。 Filebeat 读取并转发日志行，如果中断，则会记住所有事件恢复联机状态时所在位置。

2）Filebeat带有内部模块（auditd，Apache，Nginx，System和MySQL），可通过一个指定命令来简化通用日志格式的收集，解析和可视化。

3）FileBeat 不会让你的管道超负荷。FileBeat 如果是向 Logstash 传输数据，当 Logstash 忙于处理数据，会通知 FileBeat 放慢读取速度。一旦拥塞得到解决，FileBeat将恢复到原来的速度并继续传播。

4）Filebeat保持每个文件的状态，并经常刷新注册表文件中的磁盘状态。状态用于记住harvester正在读取的最后偏移量，并确保发送所有日志行。Filebeat将每个事件的传递状态存储在注册表文件中。所以它能保证事件至少传递一次到配置的输出，没有数据丢失。

### 2.2.4、Filebeat传输方案

1）output.elasticsearch

如果你希望使用 filebeat 直接向 elasticsearch 输出数据，需要配置 output.elasticsearch

```
output.elasticsearch:
  hosts: ["192.168.40.180:9200"]
```

2）output.logstash

如果使用filebeat向 logstash输出数据，然后由 logstash 再向elasticsearch 输出数据，需要配置 output.logstash。 logstash 和 filebeat 一起工作时，如果 logstash 忙于处理数据，会通知FileBeat放慢读取速度。一旦拥塞得到解决，FileBeat 将恢复到原来的速度并继续传播。这样，可以减少管道超负荷的情况。

```
output.logstash:
  hosts: ["192.168.40.180:5044"] 
```

3）output.kafka

如果使用filebeat向kafka输出数据，然后由 logstash 作为消费者拉取kafka中的日志，并再向elasticsearch 输出数据，需要配置output.kafka

```
output.kafka:
  enabled: true
  hosts: ["192.168.40.180:9092"]
  topic: elfk8stest
```

## 2.3、logstash组件介绍

### 2.3.1、logstash是什么

Logstash是一个开源数据收集引擎，具有实时管道功能。

Logstash可以动态地将来自不同数据源的数据统一起来，并将数据标准化到你所选择的目的地。

Logstash 是一个应用程序日志、事件的传输、处理、管理和搜索的平台。你可以用它来统一对应用程序日志进行收集管理，提供 Web 接口用于查询和统计。

输入：采集各种样式、大小和来源的数据

数据往往以各种各样的形式，或分散或集中地存在于很多系统中。Logstash 支持各种输入选择 ，可以在同一时间从众多常用来源捕捉事件。能够以连续的流式传输方式，轻松地从你的日志、指标、Web 应用、数据存储以及各种 AWS 服务采集数据。

过滤器：实时解析和转换数据

数据从源传输到存储库的过程中，Logstash 过滤器能够解析各个事件，识别已命名的字段以构建结构，并将它们转换成通用格式，以便更轻松、更快速地分析和实现商业价值。

Logstash 能够动态地转换和解析数据，不受格式或复杂度的影响：

1、利用 Grok 从非结构化数据中派生出结构
2、从 IP 地址破译出地理坐标
3、将 PII 数据匿名化，完全排除敏感字段
4、整体处理不受数据源、格式或架构的影响

输出：选择你的存储，导出你的数据

尽管 Elasticsearch 是我们的首选输出方向，能够为我们的搜索和分析带来无限可能，但它并非唯一选择。

Logstash 提供众多输出选择，你可以将数据发送到你要指定的地方

### 2.3.2、Logstash工作原理

![logstash](https://gitee.com/hujinzhong/blogimg/raw/master/image-20210713104417933.png)

Logstash 有两个必要元素：input 和 output ，一个可选元素：filter。 

这三个元素，分别代表 Logstash 事件处理的三个阶段：输入 > 过滤器 > 输出

Input：负责从数据源采集数据。
filter ：将数据修改为你指定的格式或内容。
output：将数据传输到目的地。

在实际应用场景中，通常输入、输出、过滤器不止一个。

Logstash 的这三个元素都使用插件式管理方式，可以根据应用需要，灵活的选用各阶段需要的插件，并组合使用。

1）常用input模块

Logstash 支持各种输入选择 ，可以在同一时间从众多常用来源捕捉事件。能够以连续的流式传输方式，可从日志、指标、Web 应用、数据存储以及各种 AWS 服务采集数据。

file：从文件系统上的文件读取
syslog：在众所周知的端口514上侦听系统日志消息，并根据RFC3164格式进行解析
redis：从redis服务器读取，使用redis通道和redis列表。 Redis经常用作集中式Logstash安装中的“代理”，它将接收来自远程Logstash“托运人”的Logstash事件排队。
beats：处理由Filebeat发送的事件

2）常用的filter模块

过滤器是Logstash管道中的中间处理设备。可以将条件过滤器组合在一起，对事件执行操作。

grok：解析和结构任意文本。 Grok目前是Logstash中将非结构化日志数据解析为结构化和可查询的最佳方法。
mutate：对事件字段执行一般转换。可以重命名，删除，替换和修改事件中的字段。
drop：完全放弃一个事件，例如调试事件。
clone：制作一个事件的副本，可能会添加或删除字段。
geoip：添加有关IP地址的地理位置的信息

3）常用output模块

elasticsearch：将事件数据发送给 Elasticsearch（推荐模式）。
file：将事件数据写入文件或磁盘。
graphite：将事件数据发送给 graphite（一个流行的开源工具，存储和绘制指标， http://graphite.readthedocs.io/en/latest/）。
statsd：将事件数据发送到 statsd （这是一种侦听统计数据的服务，如计数器和定时器，通过UDP发送并将聚合发送到一个或多个可插入的后端服务）。

4）常用code插件

json：以JSON格式对数据进行编码或解码。
multiline：将多行文本事件（如java异常和堆栈跟踪消息）合并为单个事件。

```
# 示例
input {
      kafka {
        bootstrap_servers => "192.168.40.180:9092"
        auto_offset_reset => "latest"
        consumer_threads => 5
        decorate_events => true
        topics => ["elktest"]
      }
}
          
output { 
    elasticsearch { 
        hosts => ["192.168.40.180:9200"]
        index => "elkk8stest-%{+YYYY.MM.dd}"
        }
}
```

## 2.4、fluentd组件介绍

fluentd是一个针对日志的收集、处理、转发系统。

通过丰富的插件系统，可以收集来自于各种系统或应用的日志，转化为用户指定的格式后，转发到用户所指定的日志存储系统之中。

fluentd 常常被拿来和Logstash比较，我们常说ELK，L就是这个agent。fluentd 是随着Docker和es一起流行起来的agent。

fluentd 比 logstash 更省资源；

更轻量级的 fluent-bid 对应 filebeat，作为部署在结点上的日志收集器；

fluentd 有更多强大、开放的插件数量和社区。插件多，也非常灵活，规则也不复杂。

# 常用工具对比

常见的日志采集工具有Logstash、Filebeat、Fluentd、Logagent、rsyslog等等，那么他们之间有什么区别呢?什么情况下我们应该用哪一种工具?

## 3.1、Logstash
Logstash是一个开源数据收集引擎，具有实时管道功能。Logstash可以动态地将来自不同数据源的数据统一起来，并将数据标准化到你所选择的目的地。

1）优势
Logstash 主要的优点就是它的灵活性，主要因为它有很多插件，详细的文档以及直白的配置格式让它可以在多种场景下应用。我们基本上可以在网上找到很多资源，几乎可以处理任何问题。

2）劣势
Logstash 致命的问题是它的性能以及资源消耗(默认的堆大小是 1GB)。尽管它的性能在近几年已经有很大提升，与它的替代者们相比还是要慢很多的。这里有 Logstash 与 rsyslog 性能对比以及Logstash 与 filebeat 的性能对比。它在大数据量的情况下会是个问题。另一个问题是它目前不支持缓存，目前的典型替代方案是将 Redis 或 Kafka 作为中心缓冲池

3）典型应用场景

因为 Logstash 自身的灵活性以及网络上丰富的资料，Logstash 适用于原型验证阶段使用，或者解析非常的复杂的时候。在不考虑服务器资源的情况下，如果服务器的性能足够好，我们也可以为每台服务器安装 Logstash 。我们也不需要使用缓冲，因为文件自身就有缓冲的行为，而 Logstash 也会记住上次处理的位置。

如果服务器性能较差，并不推荐为每个服务器安装 Logstash ，这样就需要一个轻量的日志传输工具，将数据从服务器端经由一个或多个 Logstash 中心服务器传输到 Elasticsearch。

随着日志项目的推进，可能会因为性能或代价的问题，需要调整日志传输的方式(log shipper)。当判断 Logstash 的性能是否足够好时，重要的是对吞吐量的需求有着准确的估计，这也决定了需要为 Logstash 投入多少硬件资源。

## 3.2、Filebeat

作为 Beats 家族的一员，Filebeat 是一个轻量级的日志传输工具，它的存在正弥补了 Logstash 的缺点：Filebeat 作为一个轻量级的日志传输工具可以将日志推送到中心 Logstash。

在版本 5.x 中，Elasticsearch 具有解析的能力(像 Logstash 过滤器)— Ingest。这也就意味着可以将数据直接用 Filebeat 推送到 Elasticsearch，并让 Elasticsearch 既做解析的事情，又做存储的事情。也不需要使用缓冲，因为 Filebeat 也会和 Logstash 一样记住上次读取的偏移，如果需要缓冲(例如，不希望将日志服务器的文件系统填满)，可以使用 Redis/Kafka，因为 Filebeat 可以与它们进行通信。

1）优势

Filebeat 只是一个二进制文件没有任何依赖。它占用资源极少，尽管它还十分年轻，正式因为它简单，所以几乎没有什么可以出错的地方，所以它的可靠性还是很高的。它也为我们提供了很多可以调节的点，例如：它以何种方式搜索新的文件，以及当文件有一段时间没有发生变化时，何时选择关闭文件句柄。

2）劣势

Filebeat 的应用范围十分有限，所以在某些场景下我们会碰到问题。例如，如果使用 Logstash 作为下游管道，我们同样会遇到性能问题。正因为如此，Filebeat 的范围在扩大。开始时，它只能将日志发送到 Logstash 和 Elasticsearch，而现在它可以将日志发送给 Kafka 和 Redis，在 5.x 版本中，它还具备过滤的能力。

## 3.3、Fluentd

Fluentd 创建的初衷主要是尽可能的使用 JSON 作为日志输出，所以传输工具及其下游的传输线不需要猜测子字符串里面各个字段的类型。这样，它为几乎所有的语言都提供库，这也意味着，我们可以将它插入到我们自定义的程序中。

1）优势

和多数 Logstash 插件一样，Fluentd 插件是用 Ruby 语言开发的非常易于编写维护。所以它数量很多，几乎所有的源和目标存储都有插件(各个插件的成熟度也不太一样)。这也意味这我们可以用 Fluentd 来串联所有的东西。

2）劣势

因为在多数应用场景下，我们会通过 Fluentd 得到结构化的数据，它的灵活性并不好。但是我们仍然可以通过正则表达式，来解析非结构化的数据。尽管，性能在大多数场景下都很好，但它并不是最好的，和 syslog-ng 一样，它的缓冲只存在与输出端，单线程核心以及 Ruby GIL 实现的插件意味着它大的节点下性能是受限的，不过，它的资源消耗在大多数场景下是可以接受的。对于小的或者嵌入式的设备，可能需要看看 Fluent Bit，它和 Fluentd 的关系与 Filebeat 和 Logstash 之间的关系类似。

3）典型应用场景

Fluentd 在日志的数据源和目标存储各种各样时非常合适，因为它有很多插件。而且，如果大多数数据源都是自定义的应用，所以可以发现用 fluentd 的库要比将日志库与其他传输工具结合起来要容易很多。特别是在我们的应用是多种语言编写的时候，即我们使用了多种日志库，日志的行为也不太一样。

## 3.4、Logagent

Logagent 是 Sematext 提供的传输工具，它用来将日志传输到 Logsene(一个基于 SaaS 平台的 Elasticsearch API)，因为 Logsene 会暴露 Elasticsearch API，所以 Logagent 可以很容易将数据推送到 Elasticsearch 。

1）优势

可以获取 /var/log 下的所有信息，解析各种格式(Elasticsearch，Solr，MongoDB，Apache HTTPD等等)，它可以掩盖敏感的数据信息，例如，个人验证信息(PII)，出生年月日，信用卡号码，等等。它还可以基于 IP 做 GeoIP 丰富地理位置信息(例如，access logs)。同样，它轻量又快速，可以将其置入任何日志块中。在新的 2.0 版本中，它以第三方 node.js 模块化方式增加了支持对输入输出的处理插件。重要的是 Logagent 有本地缓冲，所以不像 Logstash ，在数据传输目的地不可用时会丢失日志。

2）劣势
尽管 Logagent 有些比较有意思的功能(例如，接收 Heroku 或 CloudFoundry 日志)，但是它并没有 Logstash 灵活。

3）典型应用场景

Logagent 作为一个可以做所有事情的传输工具是值得选择的(提取、解析、缓冲和传输)。

## 3.5、Logtail

阿里云日志服务的生产者，目前在阿里集团内部机器上运行，经过3年多时间的考验，目前为阿里公有云用户提供日志收集服务。采用C++语言实现，对稳定性、资源控制、管理等下过很大的功夫，性能良好。相比于logstash、fluentd的社区支持，logtail功能较为单一，专注日志收集功能。

1）优势
logtail占用机器cpu、内存资源最少，结合阿里云日志服务的E2E体验良好。

2）劣势
logtail目前对特定日志类型解析的支持较弱，后续需要把这一块补起来。

## 3.6、Rsyslog

绝大多数 Linux 发布版本默认的 syslog 守护进程，rsyslog 可以做的不仅仅是将日志从 syslog socket 读取并写入 /var/log/messages 。它可以提取文件、解析、缓冲(磁盘和内存)以及将它们传输到多个目的地，包括 Elasticsearch 。可以从此处找到如何处理 Apache 以及系统日志。

1）优势

rsyslog 是经测试过的最快的传输工具。如果只是将它作为一个简单的 router/shipper 使用，几乎所有的机器都会受带宽的限制，但是它非常擅长处理解析多个规则。它基于语法的模块(mmnormalize)无论规则数目如何增加，它的处理速度始终是线性增长的。这也就意味着，如果当规则在 20-30 条时，如解析 Cisco 日志时，它的性能可以大大超过基于正则式解析的 grok ，达到 100 倍(当然，这也取决于 grok 的实现以及 liblognorm 的版本)。
它同时也是我们能找到的最轻的解析器，当然这也取决于我们配置的缓冲。

2）劣势
rsyslog 的配置工作需要更大的代价(这里有一些例子)，这让两件事情非常困难：
文档难以搜索和阅读，特别是那些对术语比较陌生的开发者。
5.x 以上的版本格式不太一样(它扩展了 syslogd 的配置格式，同时也仍然支持旧的格式)，尽管新的格式可以兼容旧格式，但是新的特性(例如，Elasticsearch 的输出)只在新的配置下才有效，然后旧的插件(例如，Postgres 输出)只在旧格式下支持。
尽管在配置稳定的情况下，rsyslog 是可靠的(它自身也提供多种配置方式，最终都可以获得相同的结果)，它还是存在一些 bug 。

3）典型应用场景
rsyslog 适合那些非常轻的应用(应用，小VM，Docker容器)。如果需要在另一个传输工具(例如，Logstash)中进行处理，可以直接通过 TCP 转发 JSON ，或者连接 Kafka/Redis 缓冲。

rsyslog 还适合我们对性能有着非常严格的要求时，特别是在有多个解析规则时。那么这就值得为之投入更多的时间研究它的配置。


# 拓展学习

[ES 技术体系-ElasticSearch知识体系详解-01认知：ElasticSearch基础概念](https://houbb.github.io/2015/01/01/ElasticSearch%E7%9F%A5%E8%AF%86%E4%BD%93%E7%B3%BB%E8%AF%A6%E8%A7%A3-01%E8%AE%A4%E7%9F%A5-ElasticSearch%E5%9F%BA%E7%A1%80%E6%A6%82%E5%BF%B5)

[Kibana](https://houbb.github.io/2016/10/16/kibana#)

[Elasticsearch-01-快速入门](https://houbb.github.io/2016/10/16/elasticsearch-01-overview-01)

[Logstash](https://houbb.github.io/2016/10/16/logstash)

---------------

[ELK PDF](https://raw.githubusercontent.com/TIM168/technical_books/master/%E5%A4%A7%E6%95%B0%E6%8D%AE/%E5%AE%9E%E6%88%98Elasticsearch%E3%80%81Logstash%E3%80%81Kibana%2B%2B%E5%88%86%E5%B8%83%E5%BC%8F%E5%A4%A7%E6%95%B0%E6%8D%AE%E6%90%9C%E7%B4%A2%E4%B8%8E%E6%97%A5%E5%BF%97%E6%8C%96%E6%8E%98%E5%8F%8A%E5%8F%AF%E8%A7%86%E5%8C%96%E8%A7%A3%E5%86%B3%E6%96%B9%E6%A1%88.pdf)

## 底层

[Lucene-01-lucene 入门教程](https://houbb.github.io/2018/11/15/lucene-01-overview)


# chat

## 介绍一下 ELK 技术栈




# 参考资料

[常见日志收集方案及相关组件](https://www.cnblogs.com/hujinzhong/p/15005523.html)

[ELK日志分析系统介绍+安装](https://blog.csdn.net/Breeze_nebula/article/details/132851905)

https://www.datadoghq.com/dg/monitor/benefits/?utm_source=advertisement&utm_medium=search&utm_campaign=dg-google-competition-na-apm-kibana-alt&utm_keyword=kibana%20alternatives&utm_matchtype=p&utm_campaignid=15832880588&utm_adgroupid=134136164353&gad_source=1&gclid=Cj0KCQiA67CrBhC1ARIsACKAa8QsW8SaWJqcknQxdIrTFOlTHZ90vsdUWnnyL5tjYisFuzcs17kieQoaArQDEALw_wcB

https://dasydong.gitbook.io/interview/notes/monitor



* any list
{:toc}