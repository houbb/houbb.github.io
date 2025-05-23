---
layout: post
title: 开源监控利器之 netdata-02-聊一聊 netdata
date:  2019-4-1 19:24:57 +0800
categories: [Monitor]
tags: [monitor, apm, api, opensource, sf]
published: true
---


# chat

## 详细介绍一下 netdata

Netdata 是一个开源的、实时的系统监控工具，旨在提供对系统、应用程序和服务的全面监控。

它具有直观的Web界面，能够实时显示各种系统指标，如CPU使用率、内存使用情况、磁盘活动、网络流量等。

以下是对 Netdata 的详细介绍：

### 1. 主要特点
   - 实时监控：Netdata 提供毫秒级别的数据更新，能实时展示系统的运行状态。它能够处理高频率的数据源，保证无延迟地显示各种监控指标。
   - 低资源占用：Netdata 设计上非常轻量，占用的系统资源非常少。它可以在大多数系统上运行而不会显著影响性能。
   - 易于安装和配置：Netdata 的安装过程非常简单，支持通过官方脚本、包管理工具（如 `apt`、`yum` 等）或 Docker 容器进行快速安装。
   - 全面的指标支持：它支持系统、网络、磁盘、内存、进程、应用程序等多个监控维度。包括常见的服务如 Web 服务器、数据库、容器和云基础设施等的监控。
   - 直观的 Web 界面：提供一个漂亮且互动性强的 Web 界面，用户可以通过浏览器实时查看不同的监控图表。界面支持多种视图，包括实时图表、历史数据视图、趋势图等。
   - 告警功能：Netdata 支持设置自定义告警，可以根据预设阈值或条件触发告警，支持发送通知邮件、Slack 消息等。

### 2. 架构与设计
   - 分布式监控：Netdata 可以作为单机实例运行，也可以集成到分布式环境中，进行跨节点的集群监控。通过 “Cloud” 服务，Netdata 还可以将多个节点的数据汇总至一个中心控制台，便于集中管理。
   - 插件化架构：Netdata 支持插件机制，几乎所有的系统指标都是通过插件采集的。可以通过自定义或第三方插件来扩展其功能。
   - 数据存储：Netdata 并不依赖传统的数据库存储历史数据，而是以时间序列数据的形式实时处理和展示。默认情况下，它将历史数据保存在本地磁盘上，但可以配置为将数据发送到其他后端存储系统。
   - 实时数据处理：数据采集和展示是通过高效的实时处理引擎进行的，能够轻松应对高频率的数据更新需求。

### 3. 支持的监控项目
   Netdata 能够监控的项目非常广泛，包括但不限于：
   - 系统监控：CPU、内存、磁盘、网络、文件系统、交换分区、负载等。
   - 应用监控：包括 Web 服务器（如 Nginx、Apache）、数据库（如 MySQL、PostgreSQL）、缓存系统（如 Redis、Memcached）、应用容器（如 Docker、Kubernetes）等。
   - 网络监控：包括网络接口、连接数、延迟、丢包等指标。
   - 容器监控：对 Docker 和 Kubernetes 集群的监控也很强大，支持容器级别的资源监控。
   - 日志监控：Netdata 还支持日志文件监控，可以分析日志文件中的特定模式或错误。

### 5. Web 界面
   Web 界面是 Netdata 的亮点之一。它提供了以下功能：
   - 实时监控图表：展示各种系统和应用的实时图表，包括 CPU 使用率、内存占用、磁盘 I/O、网络流量等。
   - 告警历史：查看系统告警的历史记录，可以按时间或告警类型筛选。
   - 详细的指标展示：通过交互式的图表，用户可以深入查看每个指标的详细数据、变化趋势等。
   - 多主机支持：通过 Netdata Cloud 功能，可以在 Web 界面中统一查看多个主机的数据。

### 6. 集成与扩展
   - Cloud 服务：Netdata 提供了一个云平台 Netdata Cloud，用户可以将多个监控节点的数据集中到一个统一的控制台上进行查看、分析和告警管理。支持跨地域、跨环境的监控。
   - 告警与通知：Netdata 支持通过多种渠道发送告警通知，如电子邮件、Slack、Webhook、PagerDuty 等。
   - API 支持：Netdata 提供了丰富的 REST API，允许用户在自己的应用程序中集成监控数据，或自动化监控管理任务。

### 7. 优缺点
   优点：
   - 实时性能非常优秀，适用于对性能要求高的系统监控。
   - 简单易用，安装和配置非常简单。
   - 界面直观，数据展示清晰，支持深度分析。
   - 支持多种插件和扩展，能够监控多种不同的系统和服务。
   - 低资源占用，适合用于生产环境。

   缺点：
   - 不支持存储长期的历史数据，适合于实时监控，但对于长时间的数据分析可能不如专门的监控工具（如 Prometheus）。
   - 对于非常复杂的监控需求，可能需要较多的自定义插件或配置。

### 8. 使用场景
   - 开发与运维监控：可以用于开发阶段和生产环境中，实时监控应用程序的性能和健康状态。
   - 小型到中型企业：对于不需要复杂、庞大监控平台的公司，Netdata 是一个非常适合的解决方案。
   - 容器化和云环境：在容器化和微服务架构中，Netdata 能够方便地集成到 Docker 和 Kubernetes 环境中，进行细粒度的监控。


## netdata 性能为什么这么快？

Netdata 的性能之所以非常快，主要归功于其高效的设计和优化。

它能够在保持低系统资源占用的情况下，提供毫秒级的实时数据更新。

以下是 Netdata 实现高性能的几个关键因素：

### 1. 实时数据采集与展示
   - 高效的数据处理引擎：Netdata 使用一个高效的时间序列数据引擎，能够处理每秒数千次的指标更新，并且实时将这些数据转化为可视化图表。它避免了大量计算和数据汇总操作，直接从源头实时收集数据并展示。
   - 异步数据收集：Netdata 使用了异步数据采集机制，这意味着它不会阻塞其他操作。数据收集的任务是并行处理的，这大大提高了系统的响应速度。
   
### 2. 内存中的实时计算
   - 内存优先：Netdata 将大部分数据缓存和处理放在内存中。它只会将数据存储在硬盘中作为短期存储，这避免了磁盘 I/O 对性能的影响。所有的实时数据处理、图表绘制等操作都发生在内存中，减少了访问延迟。
   - 高效的内存管理：Netdata 对内存的使用进行了优化，确保即便在监控高频数据的情况下，也不会造成内存泄漏或内存过度消耗。

### 3. 轻量级设计
   - 低资源消耗：Netdata 设计时非常注重性能优化，它不依赖于传统的数据库或持久化存储系统，而是直接在内存中处理和展示数据。这种轻量级的设计使得 Netdata 能够在大多数硬件上运行而不会显著影响系统性能。
   - 最小化的外部依赖：Netdata 没有依赖大型数据库系统来存储历史数据，这避免了磁盘 I/O、查询和索引等操作对性能的拖累。

### 4. 高效的插件架构
   - 插件式架构：Netdata 提供了丰富的插件支持，它通过插件来收集不同类型的监控数据（如 CPU、内存、数据库、容器等）。每个插件都是单独运行的进程，负责收集相关指标。这种插件架构使得 Netdata 能够独立、高效地获取不同数据源的实时数据，减少了系统内部的耦合。
   - 数据采集与展示分离：Netdata 采用数据采集和展示解耦的方式。数据采集是通过插件完成的，而数据展示是通过前端界面展示实时图表。数据展示并不依赖于数据库，而是通过实时计算的数据直接生成图表。

### 5. 高效的数据传输与展示
   - 压缩和优化数据传输：Netdata 在将数据从采集端传输到 Web 界面时，进行了优化，使用压缩和其他技术来减少数据传输的带宽消耗，从而提高了性能。
   - 动态图表与图形优化：Web 界面中的图表展示非常轻量，通过使用 WebSockets 和 JavaScript 技术，图表的实时刷新非常流畅，且能够适应不同的屏幕和设备。

### 6. 多线程与并发处理
   - 并行计算：Netdata 内部使用了多线程机制，尤其是在数据采集和处理过程中，能够充分利用多核处理器的优势，进行并行计算，从而提高处理能力和响应速度。
   - 非阻塞设计：Netdata 在多任务执行时采用非阻塞的设计，避免了单个任务的执行阻塞整个监控流程。例如，在收集磁盘、网络等指标时，它可以并行进行，而不是等待每个指标收集完后再进行下一个。

### 7. 分布式架构与云支持
   - 分布式监控：Netdata 的设计允许它在多个节点间分布式监控。通过 Netdata Cloud，多个节点的数据能够汇总在一起进行展示，同时每个节点仍然保持高效的数据采集和展示能力。这样，即使在大规模集群环境中，Netdata 也能够保持高性能。

### 8. 动态调整与智能优化
   - 自动调整数据采集频率：Netdata 会根据系统负载和资源使用情况，智能调整数据采集的频率。如果系统负载较低，它将以更高频率收集数据；如果负载过高，则会降低数据收集频率，从而确保系统不会因监控任务而变得更加繁忙。
   - 历史数据存储与压缩：Netdata 对历史数据采用压缩算法，减少存储占用，同时只保留重要的统计数据，以减轻存储和读取压力。历史数据的展示一般使用离线缓存，而不是频繁查询和计算，进一步减少了性能开销。

### 9. Web前端优化
   - 轻量级前端：Netdata 使用了高度优化的前端技术，包括现代的 JavaScript 和 WebSocket 技术。其前端能够高效地处理大量实时数据，并且只更新用户当前查看的部分，避免了频繁的全局刷新。
   - 图表绘制优化：图表采用了高效的图形库（如 D3.js、Chart.js 等），这些图形库本身非常优化，能够处理大量实时数据并且减少页面渲染的开销。

### 总结
Netdata 的快速性能源于其高效的设计理念，包括实时数据采集、内存优先的数据处理、轻量级架构、并行处理、智能优化等因素。通过将数据存储和展示从传统的数据库中解耦，采用内存中的实时计算和高效的前端展示，Netdata 能够在极低的资源消耗下提供毫秒级别的实时监控体验。

## 类似 netdata 的开源监控工具还有哪些？

除了 Netdata，还有许多其他优秀的开源监控工具可以用于系统和应用程序监控。这些工具通常具有不同的特性和优点，适用于不同的使用场景。以下是一些常见的类似于 Netdata 的开源监控工具：

### 1. Prometheus
   - 概述：Prometheus 是一个功能强大的开源监控系统和时间序列数据库（TSDB），广泛应用于云原生环境，尤其是在微服务和容器化应用中。
   - 特点：
     - 强大的查询语言（PromQL），适合复杂的数据分析。
     - 多维度数据模型，支持多种导出器（Exporter）来采集各种系统和应用的监控数据。
     - 与 Kubernetes、Docker 等平台集成良好。
     - 数据存储为时间序列数据，支持长期存储和查询。
   - 缺点：默认的图形界面不如 Netdata 直观，需要与 Grafana 等工具配合使用来进行图形化展示。

### 2. Grafana
   - 概述：Grafana 本身是一个开源的数据可视化和分析平台，通常与 Prometheus 等监控系统配合使用，用于显示和分析时间序列数据。
   - 特点：
     - 支持多种数据源（如 Prometheus、InfluxDB、Elasticsearch 等）。
     - 强大的仪表板和图表创建功能，支持实时数据展示。
     - 支持警报功能，可以与各种通知系统（如 Slack、PagerDuty）集成。
     - 强调美观和交互性。
   - 缺点：作为一个可视化工具，它本身不收集数据，需要配合其他工具（如 Prometheus）一起使用。

### 3. Zabbix
   - 概述：Zabbix 是一个企业级的开源监控解决方案，适用于监控网络、服务器、虚拟机和云资源等。
   - 特点：
     - 支持自动发现和分布式监控。
     - 强大的告警机制，支持多种通知方式（邮件、短信、Webhook 等）。
     - 支持自定义监控项，可以扩展性强。
     - 适用于大规模的生产环境监控。
   - 缺点：安装和配置较为复杂，需要更多的学习成本。相较于 Prometheus，它的数据存储和查询功能没有那么灵活。

### 4. InfluxDB + Telegraf + Chronograf
   - 概述：InfluxDB 是一个开源的时间序列数据库，Telegraf 是数据采集工具，Chronograf 提供了一个可视化界面。这个组合是 InfluxData 提供的监控解决方案。
   - 特点：
     - 专注于时间序列数据的存储、查询和可视化。
     - Telegraf 提供了众多插件来收集系统、数据库、容器等的数据。
     - 支持告警和自动化任务。
     - 可以与 Grafana 配合使用，提供强大的可视化能力。
   - 缺点：配置和管理可能相对较复杂，尤其是需要处理多组件的集成。

### 5. Nagios
   - 概述：Nagios 是一个历史悠久的开源监控系统，专注于网络、服务器和应用程序的监控。
   - 特点：
     - 支持广泛的插件，几乎可以监控任何网络服务。
     - 强大的告警功能，支持各种通知和自动化响应。
     - 支持分布式监控。
   - 缺点：Nagios 的界面相对较为过时，用户体验不如现代的监控工具（如 Netdata 或 Grafana）。需要较多的手动配置。

### 6. Cacti
   - 概述：Cacti 是一个网络监控工具，主要用于收集、存储、分析和展示网络设备（如路由器、交换机等）的性能数据。
   - 特点：
     - 基于 RRDTool 用于存储和处理数据。
     - 提供图形化界面，便于查看和分析收集的数据。
     - 支持 SNMP 和自定义插件收集监控数据。
   - 缺点：虽然功能强大，但配置较为复杂，且界面较为简陋，比较适合于网络设备监控。

### 7. Collectd
   - 概述：Collectd 是一个开源的系统性能监控工具，广泛用于收集系统和应用的各种指标。
   - 特点：
     - 轻量级，低资源消耗。
     - 支持多种插件和扩展，能够收集各种性能数据。
     - 可以将数据发送到其他系统（如 InfluxDB、Graphite、Prometheus）进行存储和分析。
   - 缺点：界面本身较为简单，通常需要配合其他工具（如 Grafana）进行数据可视化。

### 8. Sensu
   - 概述：Sensu 是一个开源的监控和告警工具，专注于自动化和动态监控。它适合大规模和分布式系统的监控。
   - 特点：
     - 灵活的插件架构，支持广泛的监控项目。
     - 强大的事件处理和告警功能。
     - 支持多云环境和容器化环境。
   - 缺点：配置和部署可能需要一定的学习成本。

### 9. Graphite
   - 概述：Graphite 是一个开源的时间序列数据库，专注于存储和展示度量数据，通常与其他监控工具（如 Collectd、Telegraf）一起使用。
   - 特点：
     - 高效的时间序列数据存储。
     - 易于与其他工具集成。
     - 提供强大的图表功能，便于数据可视化。
   - 缺点：功能相对简单，缺少内置的告警和自动化机制，通常需要与其他系统结合使用。

### 10. Docker + cAdvisor + Prometheus
   - 概述：这是一个专为容器化环境设计的监控方案。`cAdvisor` 用于收集容器的指标数据，`Prometheus` 用于存储和查询这些数据，`Grafana` 用于可视化。
   - 特点：
     - 专注于容器的监控，能够获取容器的 CPU、内存、网络等实时指标。
     - 可以无缝集成到 Docker 和 Kubernetes 中。
   - 缺点：适用于容器化环境，对传统应用的支持不如其他监控工具。

---

### 总结

这些工具中，Prometheus + Grafana 是当前最流行的开源监控解决方案，尤其适用于云原生、容器化和微服务架构。

Zabbix 和 Nagios 适合于更传统的、企业级的监控需求。

InfluxDB + Telegraf + Chronograf 适合用于时间序列数据的监控，适合各种基础设施和应用程序。

对于简单、轻量的实时监控，Netdata 是一个非常好的选择。根据你的需求，可以选择合适的工具进行系统监控。

# netdata 在 linux 上安装，是不是就是监控的 linux 的相关信息？

是的，Netdata 在 Linux 上安装后，默认情况下会监控和收集与 Linux 系统相关的各种性能数据，如 CPU、内存、磁盘、网络、进程、文件系统、负载等信息。

然而，Netdata 的功能不仅仅局限于监控 Linux 系统的硬件和操作系统资源，它还支持监控其他服务、应用程序和容器化环境（如 Docker、Kubernetes）等。

### 1. Linux 系统监控

安装 Netdata 后，它会默认收集以下系统级的监控信息：

- CPU 使用情况：
  - 核心使用率、负载均衡、上下文切换等。
  
- 内存和交换分区：
  - 总内存、已用内存、空闲内存、缓存、交换空间使用等。
  
- 磁盘使用情况：
  - 各个磁盘分区的读写速率、I/O 延迟、磁盘空间使用情况等。
  
- 网络流量：
  - 网络接口的接收和发送字节数、包数、错误等信息。
  
- 负载和进程：
  - 系统负载、进程数、进程状态（运行、睡眠、僵尸进程等）。
  
- 系统负载：
  - 1分钟、5分钟、15分钟的系统负载。
  
- 文件系统：
  - 文件系统的挂载、使用情况以及各分区的空间利用率。
  
- 硬盘 I/O：
  - 每秒读取和写入的字节数，以及磁盘的延迟。

### 2. 应用和服务监控

除了 Linux 系统的基本监控外，Netdata 还可以通过插件和扩展来监控其他应用程序和服务。这些服务包括：

- Web 服务器：如 Apache、Nginx、LiteSpeed 等。
- 数据库服务：如 MySQL、PostgreSQL、MariaDB、Redis、MongoDB 等。
- 缓存系统：如 Memcached。
- 应用监控：如 Java 应用程序、Node.js 应用等。
- 虚拟化和容器化环境：如 Docker、Kubernetes、LXC 等。

Netdata 提供了丰富的插件和集成，允许用户在一个统一的仪表板上查看多种服务和应用的实时性能数据。

### 3. 容器监控

Netdata 对于容器化环境也有很好的支持，尤其是 Docker 和 Kubernetes：

- Docker：Netdata 可以自动检测和监控所有运行中的 Docker 容器，收集容器的 CPU、内存、网络、磁盘等数据。
- Kubernetes：Netdata 提供了 Kubernetes 集群的监控，支持集群节点、Pod、容器的资源使用情况监控。

### 4. 网络设备监控

Netdata 还可以监控网络设备的状态和流量，支持：
- 路由器、交换机、网络接口等设备的监控。
- 可以收集 SNMP 信息并将其展示在 Netdata 仪表板中。

### 5. 自定义监控（用户插件）

Netdata 支持通过自定义插件来监控任何自定义应用程序或服务。你可以编写自己的插件，或者通过 Netdata 提供的扩展和 API 来集成更多的监控数据源。

### 6. 分布式监控

Netdata 还支持分布式监控架构，你可以通过以下方式构建多节点的监控系统：

- Centralized Monitoring：将多个 Netdata 节点汇聚到一个中心节点进行集中监控。每个节点收集自身的数据并将其传输到中央节点进行显示。
  
- Cloud Monitoring：通过 Netdata Cloud 可以实现跨多个服务器和系统的集中监控。

### 总结

Netdata 在 Linux 上安装后，默认是监控系统的硬件资源（如 CPU、内存、磁盘、网络等），但是它的功能远不止于此。

通过插件和扩展，Netdata 还可以监控各种服务、应用程序、容器化环境以及网络设备，提供一个完整的实时性能监控解决方案。

如果你需要监控其他系统服务或应用程序，只需要安装适当的插件或扩展即可。

# 那如果我有多台 linux 机器，是不是每一台都要有一个控台？查起来不是很麻烦？

是的，如果你有多台 Linux 机器，并且每一台都单独运行 Netdata，那么你将会在每台机器上访问一个独立的控制台，这可能会导致查找和管理变得相对麻烦。

不过，Netdata 提供了一些方法来简化多机器监控和集中化管理，特别是通过 Netdata Cloud 和 集中式监控架构。

### 1. Netdata Cloud（集中式云监控）

Netdata Cloud 是 Netdata 提供的一项集中化监控解决方案，它允许你将所有 Netdata 节点（即你的多台 Linux 机器）连接到一个中央云平台，从而可以在一个统一的仪表板上查看所有机器的性能数据。

- 自动化收集：Netdata Cloud 可以自动发现和收集来自你所有机器的数据。
- 统一视图：你可以在 Netdata Cloud 上创建一个集中的仪表板，展示你所有机器的监控信息。
- 跨机器警报：通过 Netdata Cloud，你还可以设置跨机器的警报规则，确保对系统健康状况的全面掌控。
- 轻松扩展：随着新的机器加入，你可以快速将它们连接到 Netdata Cloud，享受集中化的监控体验。

#### 设置步骤：
1. 在每台 Linux 机器上安装 Netdata。
2. 在 Netdata 的配置文件中启用 Cloud 连接：
   ```bash
   sudo netdata-claim.sh -token YOUR_NETDATA_CLOUD_TOKEN
   ```
   你需要在 Netdata Cloud 中注册一个帐户，并生成一个 cloud token。
3. 访问 Netdata Cloud Dashboard，查看所有机器的性能数据。

### 2. 集中式监控架构（Local Centralized Monitoring）

如果你不想使用 Netdata Cloud，还可以设置一个 集中式监控架构。这种方式是将所有 Netdata 节点的数据集中到一个服务器上进行监控，而不需要访问每一台机器的单独控制台。

Netdata 允许你将多个节点的数据汇聚到一个中央节点，并在该节点上展示所有机器的性能数据。通过这种方式，你只需要访问一个控制台即可查看所有节点的信息。

#### 设置步骤：
1. 配置集群节点：每台 Netdata 节点都会收集并上传数据到一个集中节点。
2. 在每台机器的 `/etc/netdata/netdata.conf` 配置文件中启用 `stream` 功能。配置每台机器以将数据流式传输到中央 Netdata 节点。
   ```bash
   [stream]
   enabled = yes
   destination = CENTRAL_NETDATA_NODE_IP:19999
   ```
   你需要将 `CENTRAL_NETDATA_NODE_IP` 替换为你的集中式监控节点的 IP 地址。
   
3. 在中央节点上，配置 Netdata 以接收来自其他节点的流式数据，并显示所有机器的性能数据。

   - 在中央节点上配置 `stream.conf`，启用接收其他机器的数据流。

### 3. 使用第三方工具进行统一视图

如果你不想使用 Netdata 的云或集中式架构，还可以考虑使用其他第三方工具来集成多个 Netdata 实例，例如 Grafana 和 Prometheus。

- Prometheus：可以用来从多个 Netdata 实例中抓取数据，并将数据存储在一个统一的数据库中。
- Grafana：作为一个可视化工具，Grafana 可以用来展示从 Prometheus 收集到的所有监控数据，从而在一个仪表板上集中显示多个机器的状态。

这种方法适用于那些需要更定制化监控和可视化的场景，尤其是当你已经使用了 Prometheus 和 Grafana 来监控其他系统时。

### 4. 统一的告警系统

无论是使用 Netdata Cloud、集中式监控架构，还是通过 Prometheus + Grafana，你都可以通过集中的告警系统来设置跨机器的告警规则。Netdata 允许你基于不同的阈值和条件设置告警，并可以通过多种方式发送通知（如电子邮件、Slack、Webhooks 等）。

### 总结

如果你有多台 Linux 机器，并希望简化管理，Netdata Cloud 是一个非常合适的解决方案，它允许你在一个控制台中查看和管理所有机器的性能数据。另一种方式是使用 集中式监控架构，将所有机器的数据集中到一台服务器上，避免频繁切换控制台。

如果你需要更多定制化的监控和展示，可以考虑将 Netdata 与 Prometheus 和 Grafana 集成。

通过这些方法，你可以大大简化多台机器的监控管理，避免查找每台机器的控制台。

# netdata web 控台支持中文吗？

暂时不支持。

# netdata 监控数据存储在哪里？能存储多久？对于机器的内存/磁盘等消耗如何？

Netdata 的监控数据默认存储在本地，并且它的存储方式和数据保留策略有一些特点。下面我将详细介绍 Netdata 的数据存储位置、数据存储时长以及它对机器内存和磁盘的消耗。

### 1. Netdata 数据存储位置

Netdata 的监控数据存储在本地机器的文件系统中，具体位置如下：

- 默认存储位置：`/var/lib/netdata/`
  
  该目录中包含了 Netdata 的所有监控数据、数据库文件和缓存文件。具体的文件夹结构如下：

  - `/var/lib/netdata/dbengine/`：存储 Netdata 的监控数据。
  - `/var/lib/netdata/health/`：存储健康检查（告警）相关的数据。
  - `/var/lib/netdata/cache/`：存储缓存的数据，如图表缓存、最近的度量数据等。

### 2. Netdata 数据存储时长

Netdata 使用 内存数据库 存储监控数据（称为 `dbengine`），并使用 环形缓冲区 来控制数据的保留时间。具体来说：

- 环形缓冲区：Netdata 会不断收集新的监控数据，并在缓冲区满时覆盖最旧的数据。通过这种方式，Netdata 实现了无缝的数据存储，但同时限制了存储的总量。
  
- 数据保留时间：默认情况下，Netdata 会保留大约 7 天的详细数据（基于环形缓冲区）。具体保留的时间长度取决于系统的负载、数据收集的频率以及硬盘容量。如果系统收集的数据量较大（例如，多个插件或高频率的度量数据），数据保留的时长可能会较短。

  - 详细数据（高精度数据）通常保留几天（例如 7 天）。而对历史数据的压缩存储和降采样可以延长数据存储时长，但会以较低的分辨率存储。
  - 降采样数据：Netdata 会将历史数据按小时、天、周进行降采样，并将这些较低精度的数据存储得更长时间（例如 1 个月、3 个月，甚至更长时间）。

### 3. 内存/磁盘消耗

Netdata 对机器的内存和磁盘消耗是相对较低的，但具体消耗会根据以下几个因素而变化：

#### 1. 内存消耗

Netdata 使用内存数据库来存储和处理监控数据，消耗的内存与以下因素相关：

- 监控项数量：你正在监控的系统项越多（例如 CPU、内存、磁盘、网络等），所需的内存也会相应增加。
- 数据采样频率：Netdata 默认每秒采集一次数据（即 1Hz）。采集频率越高，数据量越大，内存消耗也会增加。
  
在一般的环境下，Netdata 的内存消耗通常在 几十 MB 到几百 MB 之间。例如，默认配置下，Netdata 会消耗约 50MB 到 200MB 的内存，具体取决于监控的项和数据采样的频率。

#### 2. 磁盘消耗

Netdata 在磁盘上存储的数据主要来自 监控数据文件 和 健康检查文件。磁盘消耗会受到以下因素影响：

- 数据存储的时间：默认情况下，Netdata 会保留 7 天的详细数据以及更长时间的压缩数据。如果你希望存储更多数据（例如更长时间的历史数据），你需要更多的磁盘空间。
- 监控项数量和数据采集频率：如前所述，监控项和数据采集频率越高，Netdata 所需的磁盘空间也越大。

在默认情况下，Netdata 会消耗 约 1GB 到 5GB 的磁盘空间，具体取决于你的监控项和历史数据保留设置。你可以通过调整 Netdata 配置来控制磁盘空间的消耗。

### 4. 如何减少内存/磁盘消耗

如果你发现 Netdata 对内存或磁盘的消耗过高，可以通过以下几种方式进行优化：

- 减少监控项：禁用不必要的插件或监控项，减少需要收集的数据量。
- 降低数据采样频率：将数据采集频率调整为较低的值（例如 30 秒或 1 分钟），从而减少内存和磁盘消耗。
  
  可以通过修改 Netdata 配置文件中的 `update every` 参数来调整数据采集频率：
  ```bash
  [global]
    update every = 60  # 每分钟采集一次数据
  ```
  
- 调整数据保留时间：通过修改 `dbengine` 配置来减少存储的数据保留时间，或者调整环形缓冲区的大小。

  可以在 `/etc/netdata/netdata.conf` 文件中配置：
  ```bash
  [global]
    # 减少详细数据存储的时长
    history = 86400  # 保留数据的秒数，例如 86400秒（即1天）
  ```

### 总结

- 存储位置：Netdata 的监控数据默认存储在 `/var/lib/netdata/` 目录下。
- 存储时长：Netdata 会保留 7 天的详细数据，并通过降采样存储更长时间的历史数据（如一个月、三个月等）。
- 内存消耗：Netdata 的内存消耗通常在几十 MB 到几百 MB 之间，具体取决于监控项和数据采集频率。
- 磁盘消耗：磁盘消耗通常在 1GB 到 5GB 之间，具体取决于监控项、数据采集频率和保留时长。

通过调整配置，你可以控制内存和磁盘的消耗，以适应你的需求。如果你需要更长时间的历史数据存储，可以增加磁盘空间或调整数据采样和存储策略。


# 参考资料

https://github.com/dromara/hertzbeat/blob/master/README_CN.md

* any list
{:toc}