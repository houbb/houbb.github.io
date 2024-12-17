---
layout: post
title: 分布式存储系统-17-SeaweedFS 是一个快速的分布式存储系统，适用于存储 blob、对象、文件和数据湖，支持数十亿个文件！
date:  2016-12-31 10:48:42 +0800
categories: [File]
tags: [distributed, dfs, file]
published: true
---

# SeaweedFS

SeaweedFS 是一个快速的分布式存储系统，适用于存储 blob、对象、文件和数据湖，支持数十亿个文件！

Blob 存储具有 O(1) 磁盘寻址和云分层功能。

Filer 支持云驱动、跨数据中心的主动-主动复制、Kubernetes、POSIX FUSE 挂载、S3 API、S3 网关、Hadoop、WebDAV、加密和纠删码。

### 通过 Patreon 支持 SeaweedFS

SeaweedFS 是一个独立的 Apache 许可开源项目，其持续的开发得益于这些了不起的 [资助者](https://github.com/seaweedfs/seaweedfs/blob/master/backers.md) 的支持。

如果您希望让 SeaweedFS 更加强大，请考虑加入我们的 [Patreon 资助者](https://www.patreon.com/seaweedfs)。

您的支持将受到我和其他支持者的热烈感谢！

- [下载适用于不同平台的二进制文件](https://github.com/seaweedfs/seaweedfs/releases/latest)
- [SeaweedFS Slack 群组](https://join.slack.com/t/seaweedfs/shared_invite/enQtMzI4MTMwMjU2MzA3LTEyYzZmZWYzOGQ3MDJlZWMzYmI0OTE4OTJiZjJjODBmMzUxNmYwODg0YjY3MTNlMjBmZDQ1NzQ5NDJhZWI2ZmY)
- [SeaweedFS Twitter](https://twitter.com/SeaweedFS)
- [SeaweedFS Telegram](https://t.me/Seaweedfs)
- [SeaweedFS Reddit](https://www.reddit.com/r/SeaweedFS/)
- [SeaweedFS 邮件列表](https://groups.google.com/d/forum/seaweedfs)
- [Wiki 文档](https://github.com/seaweedfs/seaweedfs/wiki)
- [SeaweedFS 白皮书](https://github.com/seaweedfs/seaweedfs/wiki/SeaweedFS_Architecture.pdf)
- [SeaweedFS 介绍幻灯片 2021.5](https://docs.google.com/presentation/d/1DcxKWlINc-HNCjhYeERkpGXXm6nTCES8mi2W5G0Z4Ts/edit?usp=sharing)
- [SeaweedFS 介绍幻灯片 2019.3](https://www.slideshare.net/chrislusf/seaweedfs-introduction)


# 快速开始

## Docker 上的 S3 API 快速开始

```
docker run -p 8333:8333 chrislusf/seaweedfs server -s3
```

## 使用单个二进制文件的快速开始

* 从 [SeaweedFS GitHub Releases 页面](https://github.com/seaweedfs/seaweedfs/releases) 下载最新的二进制文件并解压，得到 `weed` 或 `weed.exe` 文件。或者运行 `go install github.com/seaweedfs/seaweedfs/weed@latest`。
* 运行 `weed server -dir=/some/data/dir -s3` 启动一个 master、一个 volume 服务器、一个 filer 和一个 S3 网关。

另外，要增加容量，只需通过运行以下命令在本地或不同的机器上，甚至在数千台机器上添加更多的 volume 服务器：

```
weed volume -dir="/some/data/dir2" -mserver="<master_host>:9333" -port=8081
```

就这么简单！

## 在 AWS 上使用 SeaweedFS S3 快速开始

* 设置生产就绪的 [SeaweedFS S3 on AWS with cloudformation](https://aws.amazon.com/marketplace/pp/prodview-nzelz5gprlrjc)

# 介绍

SeaweedFS 是一个简单且高度可扩展的分布式文件系统。它有两个目标：

1. 存储数十亿个文件！
2. 快速提供文件！

SeaweedFS 最初作为一个对象存储来高效处理小文件。
它并不将所有文件元数据管理在中央 master 中，
而是将中央 master 仅用于管理 volume 服务器上的 volumes，
这些 volume 服务器负责管理文件及其元数据。
这种方式减轻了中央 master 的并发压力，将文件元数据分散到各个 volume 服务器中，
从而加速文件访问（O(1)，通常仅需要一次磁盘读取操作）。

每个文件的元数据仅占用 40 字节的磁盘存储空间。
其简单的 O(1) 磁盘读取性能足以满足您的实际使用场景，挑战其性能也是完全可以的。

SeaweedFS 基于 [Facebook 的 Haystack 设计论文](http://www.usenix.org/event/osdi10/tech/full_papers/Beaver.pdf) 开发。
此外，SeaweedFS 实现了纠删码，并借鉴了 [f4: Facebook 的 Warm BLOB 存储系统](https://www.usenix.org/system/files/conference/osdi14/osdi14-paper-muralidhar.pdf) 的思想，
并且与 [Facebook 的 Tectonic 文件系统](https://www.usenix.org/system/files/fast21-pan.pdf) 有许多相似之处。

在对象存储之上，可选的 [Filer] 可以支持目录和 POSIX 属性。
Filer 是一个独立的、线性可扩展的无状态服务器，支持可定制的元数据存储，
例如：MySql、Postgres、Redis、Cassandra、HBase、Mongodb、Elastic Search、LevelDB、RocksDB、Sqlite、MemSql、TiDB、Etcd、CockroachDB、YDB 等。

对于任何分布式键值存储，较大的值可以卸载到 SeaweedFS。
凭借其快速的访问速度和线性可扩展的容量，
SeaweedFS 可以作为分布式 [Key-Large-Value 存储][KeyLargeValueStore] 使用。

SeaweedFS 可以与云无缝集成。
通过在本地集群上存储热数据，在云中存储温数据，并保持 O(1) 的访问时间，
SeaweedFS 可以实现快速的本地访问时间和弹性的云存储容量。
更重要的是，云存储的访问 API 成本降到最低，
比直接使用云存储更快、更便宜！

# 功能 #

## 额外功能

* 可以选择不进行复制或使用不同的复制级别，支持机架和数据中心感知。
* 自动的主服务器故障转移 - 无单点故障（SPOF）。
* 根据文件的 MIME 类型自动进行 Gzip 压缩。
* 自动压缩，以回收删除或更新后的磁盘空间。
* [自动条目 TTL 过期][VolumeServerTTL]。
* 任何具有一定磁盘空间的服务器都可以加入到总存储空间中。
* 添加/移除服务器不会导致数据重新平衡，除非通过管理员命令触发。
* 可选的图片尺寸调整功能。
* 支持 ETag、Accept-Range、Last-Modified 等。
* 支持内存/leveldb/只读模式调优，以平衡内存和性能。
* 支持重新平衡可写和只读的 volumes。
* [可定制的多存储层][TieredStorage]：可定制存储磁盘类型，以平衡性能和成本。
* [透明云集成][CloudTier]：通过分层云存储为温数据提供无限容量。
* [温存储的纠删码][ErasureCoding]：Rack-Aware 10.4 纠删码减少存储成本并提高可用性。

[返回目录](#table-of-contents)

## Filer 功能

* [Filer 服务器][Filer] 通过 HTTP 提供“正常”的目录和文件。
* [文件 TTL][FilerTTL] 自动过期文件元数据和实际文件数据。
* [挂载 Filer][Mount] 通过 FUSE 将文件直接读写为本地目录。
* [Filer 存储复制][FilerStoreReplication] 为 filer 元数据存储提供高可用性。
* [主动-主动复制][ActiveActiveAsyncReplication] 启用异步单向或双向跨集群持续复制。
* [兼容 Amazon S3 的 API][AmazonS3API] 使用 S3 工具访问文件。
* [兼容 Hadoop 文件系统][Hadoop] 从 Hadoop/Spark/Flink 等访问文件，或运行 HBase。
* [云备份异步复制][BackupToCloud] 提供极快的本地访问并备份到 Amazon S3、Google Cloud Storage、Azure、BackBlaze 等。
* [WebDAV] 作为 Mac 和 Windows 上的映射驱动器访问，或从移动设备访问。
* [AES256-GCM 加密存储][FilerDataEncryption] 安全存储加密数据。
* [超大文件][SuperLargeFiles] 存储大文件或超大文件，容量可达数十 TB。
* [云驱动][CloudDrive] 将云存储挂载到本地集群，进行缓存以支持快速读写并进行异步回写。
* [远程对象存储网关][GatewayToRemoteObjectStore] 将桶操作镜像到远程对象存储，除了 [云驱动][CloudDrive]。

## Kubernetes

* [Kubernetes CSI 驱动][SeaweedFsCsiDriver] 容器存储接口（CSI）驱动。[![Docker Pulls](https://img.shields.io/docker/pulls/chrislusf/seaweedfs-csi-driver.svg?maxAge=4800)](https://hub.docker.com/r/chrislusf/seaweedfs-csi-driver/)
* [SeaweedFS Operator](https://github.com/seaweedfs/seaweedfs-operator)

[SeaweedFsCsiDriver]: https://github.com/seaweedfs/seaweedfs-csi-driver

[更多功能和文档链接]：

* [Filer](https://github.com/seaweedfs/seaweedfs/wiki/Directories-and-Files)
* [超大文件支持](https://github.com/seaweedfs/seaweedfs/wiki/Data-Structure-for-Large-Files)
* [FUSE 挂载](https://github.com/seaweedfs/seaweedfs/wiki/FUSE-Mount)
* [Amazon S3 兼容 API](https://github.com/seaweedfs/seaweedfs/wiki/Amazon-S3-API)
* [云备份异步复制](https://github.com/seaweedfs/seaweedfs/wiki/Async-Replication-to-Cloud)
* [Hadoop 兼容文件系统](https://github.com/seaweedfs/seaweedfs/wiki/Hadoop-Compatible-File-System)
* [WebDAV](https://github.com/seaweedfs/seaweedfs/wiki/WebDAV)
* [温存储的纠删码](https://github.com/seaweedfs/seaweedfs/wiki/Erasure-coding-for-warm-storage)
* [分层存储](https://github.com/seaweedfs/seaweedfs/wiki/Tiered-Storage)
* [云存储层](https://github.com/seaweedfs/seaweedfs/wiki/Cloud-Tier)
* [Filer 数据加密](https://github.com/seaweedfs/seaweedfs/wiki/Filer-Data-Encryption)
* [Filer TTL](https://github.com/seaweedfs/seaweedfs/wiki/Filer-Stores)
* [存储过期](https://github.com/seaweedfs/seaweedfs/wiki/Store-file-with-a-Time-To-Live)
* [活跃-活跃异步复制](https://github.com/seaweedfs/seaweedfs/wiki/Filer-Active-Active-cross-cluster-continuous-synchronization)
* [Filer 存储复制](https://github.com/seaweedfs/seaweedfs/wiki/Filer-Store-Replication)
* [Key-Large-Value 存储](https://github.com/seaweedfs/seaweedfs/wiki/Filer-as-a-Key-Large-Value-Store)
* [云驱动架构](https://github.com/seaweedfs/seaweedfs/wiki/Cloud-Drive-Architecture)
* [远程对象存储网关](https://github.com/seaweedfs/seaweedfs/wiki/Gateway-to-Remote-Object-Storage)


## 示例：使用 Seaweed 对象存储

默认情况下，主节点运行在端口 9333，卷节点运行在端口 8080。
我们将启动一个主节点，并在端口 8080 和 8081 上启动两个卷节点。理想情况下，这些节点应该在不同的机器上启动。我们将以 localhost 为例。

SeaweedFS 使用 HTTP REST 操作进行读写和删除。响应格式为 JSON 或 JSONP。

### 启动主服务器

```
> ./weed master
```

### 启动卷服务器

```
> weed volume -dir="/tmp/data1" -max=5  -mserver="localhost:9333" -port=8080 &
> weed volume -dir="/tmp/data2" -max=10 -mserver="localhost:9333" -port=8081 &
```

### 上传文件

上传文件的步骤：首先，发送一个 HTTP POST、PUT 或 GET 请求到 `/dir/assign` 获取 `fid` 和卷服务器的 URL：

```
> curl http://localhost:9333/dir/assign
{"count":1,"fid":"3,01637037d6","url":"127.0.0.1:8080","publicUrl":"localhost:8080"}
```

接下来，存储文件内容，发送一个 HTTP multi-part POST 请求到响应中的 `url + '/' + fid`：

```
> curl -F file=@/home/chris/myphoto.jpg http://127.0.0.1:8080/3,01637037d6
{"name":"myphoto.jpg","size":43234,"eTag":"1cc0118e"}
```

若要更新文件，发送另一个 POST 请求，上传更新后的文件内容。

要删除文件，发送 HTTP DELETE 请求到相同的 `url + '/' + fid`：

```
> curl -X DELETE http://127.0.0.1:8080/3,01637037d6
```

### 保存文件 ID

现在，您可以将 `fid`（例如 3,01637037d6）保存到数据库字段中。

数字 3 开头表示卷 ID。逗号后的部分是文件键（01）和文件 Cookie（637037d6）。

卷 ID 是无符号 32 位整数，文件键是无符号 64 位整数，文件 Cookie 是无符号 32 位整数，用于防止 URL 猜测。

文件键和文件 Cookie 都是以十六进制编码的。您可以按照自己的格式存储 <卷 ID, 文件键, 文件 Cookie> 元组，或者仅将 `fid` 作为字符串存储。

如果作为字符串存储，理论上您需要 8+1+16+8=33 字节。一个 `char(33)` 就足够了，除非您有 2^32 卷的需求。

如果空间确实是个问题，您可以按自己的格式存储文件 ID。您需要一个 4 字节的整数表示卷 ID，8 字节的长整数表示文件键，以及一个 4 字节的整数表示文件 Cookie。这样 16 字节就足够了。

### 读取文件

以下是如何渲染 URL 的示例。

首先，通过文件的 `volumeId` 查找卷服务器的 URL：

```
> curl http://localhost:9333/dir/lookup?volumeId=3
{"volumeId":"3","locations":[{"publicUrl":"localhost:8080","url":"localhost:8080"}]}
```

由于（通常）卷服务器数量不多，且卷的移动频率不高，您可以大部分时间缓存这些结果。根据复制策略，一个卷可以有多个副本位置。您可以随机选择一个位置进行读取。

现在，您可以获取公用 URL，通过 URL 渲染或者直接从卷服务器读取：

```
 http://localhost:8080/3,01637037d6.jpg
```

注意，这里我们加上了文件扩展名 ".jpg"。这是可选的，只是客户端指定文件内容类型的一种方式。

如果您希望有一个更友好的 URL，可以使用以下格式之一：

```
 http://localhost:8080/3/01637037d6/my_preferred_name.jpg
 http://localhost:8080/3/01637037d6.jpg
 http://localhost:8080/3,01637037d6.jpg
 http://localhost:8080/3/01637037d6
 http://localhost:8080/3,01637037d6
```

如果您希望获取缩放版的图片，可以添加一些参数：

```
http://localhost:8080/3/01637037d6.jpg?height=200&width=200
http://localhost:8080/3/01637037d6.jpg?height=200&width=200&mode=fit
http://localhost:8080/3/01637037d6.jpg?height=200&width=200&mode=fill
```

### 机架感知和数据中心感知的复制

SeaweedFS 在卷级别应用复制策略。因此，当您请求文件 ID 时，可以指定复制策略。例如：

```
curl http://localhost:9333/dir/assign?replication=001
```

复制参数的选项如下：

```
000: 不复制
001: 在同一机架上复制一次
010: 在不同机架但同一数据中心复制一次
100: 在不同数据中心复制一次
200: 在两个不同的数据中心复制两次
110: 在不同机架复制一次，在不同数据中心复制一次
```

有关复制的更多详细信息，请参见 [wiki][Replication]。

[Replication]: https://github.com/seaweedfs/seaweedfs/wiki/Replication

您还可以在启动主服务器时设置默认的复制策略。

### 在特定数据中心分配文件键

卷服务器可以启动时指定一个特定的数据中心名称：

```
 weed volume -dir=/tmp/1 -port=8080 -dataCenter=dc1
 weed volume -dir=/tmp/2 -port=8081 -dataCenter=dc2
```

在请求文件键时，可以使用一个可选的 `dataCenter` 参数，将分配的卷限制到特定数据中心。例如，指定分配的卷应该限制在 `dc1`：

```
 http://localhost:9333/dir/assign?dataCenter=dc1
```

### 其他功能

  * [无单点故障][feat-1]
  * [使用自定义键插入][feat-2]
  * [分块大文件][feat-3]
  * [将集合作为简单命名空间][feat-4]

[feat-1]: https://github.com/seaweedfs/seaweedfs/wiki/Failover-Master-Server
[feat-2]: https://github.com/seaweedfs/seaweedfs/wiki/Optimization#insert-with-your-own-keys
[feat-3]: https://github.com/seaweedfs/seaweedfs/wiki/Optimization#upload-large-files
[feat-4]: https://github.com/seaweedfs/seaweedfs/wiki/Optimization#collection-as-a-simple-name-space


## 对象存储架构

通常，分布式文件系统将每个文件分成多个块，一个中央主节点保持文件名、块索引与块句柄的映射关系，并记录每个块服务器拥有的块。

主要的缺点是，中央主节点无法高效处理许多小文件，并且由于所有读请求都需要通过块主节点，这样在并发用户较多时可能无法良好扩展。

与管理块不同，SeaweedFS 在主服务器中管理数据卷。每个数据卷的大小为 32GB，可以容纳大量文件。每个存储节点可以拥有多个数据卷。因此，主节点只需要存储有关数据卷的元数据，这些元数据量相对较小，且通常比较稳定。

实际的文件元数据存储在每个卷的卷服务器中。由于每个卷服务器只管理自己磁盘上的文件元数据，每个文件仅需 16 字节，因此所有文件访问可以仅从内存中读取文件元数据，且实际读取文件数据时只需要一次磁盘操作。

为了对比，考虑一下 Linux 中的 xfs inode 结构，它的大小为 536 字节。

### 主服务器和卷服务器

架构非常简单。实际数据存储在存储节点上的数据卷中。一个卷服务器可以拥有多个卷，并且可以同时支持读写操作，且提供基本的身份验证。

所有卷都由主服务器进行管理。主服务器包含卷 ID 到卷服务器的映射。该信息相对静态，且可以很容易地进行缓存。

在每个写请求时，主服务器还会生成一个文件键，这是一个递增的 64 位无符号整数。由于写请求的频率通常低于读请求，因此一个主服务器应该能够很好地处理并发请求。

### 写入和读取文件

当客户端发送写请求时，主服务器会返回文件的 (卷 ID, 文件键, 文件 Cookie, 卷节点 URL)。客户端随后联系卷节点并 POST 文件内容。

当客户端需要根据 (卷 ID, 文件键, 文件 Cookie) 读取文件时，它会根据卷 ID 向主服务器请求 (卷节点 URL, 卷节点公用 URL)，或者从缓存中获取。然后，客户端可以 GET 内容，或者仅在网页上渲染 URL，让浏览器获取内容。

请参阅示例以了解写读过程的详细信息。

### 存储大小

在当前实现中，每个卷的大小为 32 吉比字节（32GiB 或 8x2^32 字节）。这是因为我们将内容对齐到 8 字节。通过修改两行代码，我们可以轻松将其增加到 64GiB、128GiB 或更多，但代价是由于对齐可能浪费一些填充空间。

卷的总大小可以达到 4 吉比字节（4GiB 或 2^32 字节）。因此，整个系统的总容量为 8 x 4GiB x 4GiB，即 128 埃比字节（128EiB 或 2^67 字节）。

每个单独的文件大小受卷大小限制。

### 节省内存

存储在卷服务器上的所有文件元信息可以从内存中读取，而无需磁盘访问。每个文件仅占 16 字节的映射条目，包含 <64 位键, 32 位偏移, 32 位大小>。当然，每个映射条目在映射中有其自己的空间成本。但通常情况下，磁盘空间会先用完，而内存空间则不易耗尽。

### 分层存储到云端

本地卷服务器的速度更快，而云存储则具有弹性容量，并且如果不经常访问，其实际成本更具优势（通常上传免费，但访问相对昂贵）。通过追加结构和 O(1) 访问时间，SeaweedFS 可以通过将热数据卸载到云端，充分利用本地存储和云存储的优势。

通常，热数据是最新的数据，而冷数据则是较旧的数据。SeaweedFS 将新创建的卷存储在本地服务器上，并可选择将较旧的卷上传到云端。如果较旧的数据访问频率较低，这样您可以用有限的本地服务器获得几乎无限的存储容量，同时对于新数据仍然保持较高的访问速度。

通过 O(1) 访问时间，网络延迟的成本被保持在最低。

如果将热/冷数据比例划分为 20/80，且有 20 台服务器，您可以实现 100 台服务器的存储容量。这意味着节省了 80% 的成本！或者，您还可以将这 80 台服务器重新用于存储新数据，从而获得 5 倍的存储吞吐量。


## 与其他文件系统的比较

大多数其他分布式文件系统似乎比必要的更加复杂。

SeaweedFS 旨在实现快速和简单，既便于设置，也便于操作。如果您在阅读到此时还不了解它的工作原理，那么我们就失败了！如果有任何问题，请提出问题或更新此文件以进行澄清。

SeaweedFS 不断前进，其他系统也是如此。这些比较很快就会过时，请帮助保持它们的更新。

[返回目录](#table-of-contents)

### 与 HDFS 的比较

HDFS 使用每个文件的块方式，适合存储大文件。

SeaweedFS 则非常适合快速并发地提供相对较小的文件。

SeaweedFS 也可以通过将超大文件拆分为可管理的数据块来存储这些文件，并将数据块的文件 ID 存储在一个元块中。这是通过 "weed upload/download" 工具进行管理的，而 weed master 或卷服务器对此并不关心。

[返回目录](#table-of-contents)

### 与 GlusterFS、Ceph 的比较

这些架构大体相同。SeaweedFS 旨在快速存储和读取文件，具有简单的扁平架构。主要的区别如下：

* SeaweedFS 针对小文件进行了优化，确保 O(1) 的磁盘寻址操作，同时也可以处理大文件。
* SeaweedFS 为文件静态分配卷 ID。定位文件内容变成了查找卷 ID 的过程，这个过程可以很容易地进行缓存。
* SeaweedFS Filer 的元数据存储可以是任何著名且经过验证的数据存储系统，例如 Redis、Cassandra、HBase、Mongodb、Elastic Search、MySQL、Postgres、SQLite、MemSQL、TiDB、CockroachDB、Etcd、YDB 等，并且易于定制。
* SeaweedFS 卷服务器还通过 HTTP 直接与客户端通信，支持范围查询、直接上传等。

| 系统          | 文件元数据                    | 文件内容读取        | POSIX  | REST API | 优化大量小文件 |
| ------------  | -----------------------------  | ------------------- | ------ | -------- | --------------- |
| SeaweedFS     | 查找卷 ID，可缓存              | O(1) 磁盘寻址       |        | 是       | 是              |
| SeaweedFS Filer | 线性扩展，可定制             | O(1) 磁盘寻址       | FUSE   | 是       | 是              |
| GlusterFS     | 哈希                           |                     | FUSE, NFS |          |                 |
| Ceph          | 哈希 + 规则                    |                     | FUSE   | 是       |                 |
| MooseFS       | 内存                           |                     | FUSE   |          | 否              |
| MinIO         | 每个文件一个单独的元文件       |                     |        | 是       | 否              |

### 与 GlusterFS 的比较

GlusterFS 将文件（包括目录和内容）存储在可配置的卷（称为 "bricks"）中。

GlusterFS 会对路径和文件名进行哈希处理，生成 ID，并分配给虚拟卷，然后再映射到 "bricks"。

### 与 MooseFS 的比较

MooseFS 选择忽略小文件问题。

从 MooseFS 3.0 手册中可以看到，“即使是一个小文件，也会占用 64KiB 加上 4KiB 的校验和和 1KiB 的头部”，因为它“最初是为了存储大量（如几千个）非常大的文件而设计的。”

MooseFS 主服务器将所有元数据存储在内存中。

这和 HDFS 的 NameNode 面临同样的问题。

### 与 Ceph 的比较

Ceph 可以像 SeaweedFS 一样设置为键 -> 对象存储，但它更为复杂，需要在其上支持其他层级。 

[这里是更详细的比较](https://github.com/seaweedfs/seaweedfs/issues/120)

SeaweedFS 有一个集中式的主节点来查找空闲卷，而 Ceph 使用哈希和元数据服务器来定位对象。拥有一个集中式主节点使得编程和管理更加简单。

Ceph 和 SeaweedFS 一样，基于对象存储 RADOS。Ceph 比较复杂，评论两极化。

Ceph 使用 CRUSH 哈希来自动管理数据放置，这对于数据定位很高效。但数据必须按照 CRUSH 算法来放置。任何错误的配置可能导致数据丢失。拓扑变化（例如添加新服务器以增加容量）会导致数据迁移，并产生较高的 IO 成本以适应 CRUSH 算法。SeaweedFS 则通过将数据分配到任何可写的卷来放置数据。如果写入一个卷失败，只需选择另一个卷进行写入。增加更多卷也很简单。

SeaweedFS 针对小文件进行了优化。小文件作为连续数据块存储，每个文件之间最多只有 8 字节的空白。小文件访问时间为 O(1) 磁盘读取。

SeaweedFS Filer 使用现成的存储系统，如 MySQL、Postgres、SQLite、Mongodb、Redis、Elastic Search、Cassandra、HBase、MemSQL、TiDB、CockroachDB、Etcd、YDB 来管理文件目录。这些存储系统经过验证、可扩展且更易于管理。

| SeaweedFS     | 与 Ceph 相比         | 优势               |
| ------------- | ------------------- | ------------------ |
| 主节点        | MDS                 | 更简单             |
| 卷服务器      | OSD                 | 针对小文件优化     |
| Filer         | Ceph FS             | 线性扩展、可定制、O(1) 或 O(logN) |

### 与 MinIO 的比较

MinIO 密切遵循 AWS S3，非常适合用于测试 S3 API。

它有很好的 UI、策略、版本控制等。

SeaweedFS 也在努力追赶。

未来也有可能将 MinIO 作为 SeaweedFS 的网关。

MinIO 的元数据存储在简单的文件中。每次写入文件时都会额外写入相应的元文件。

MinIO 对大量小文件没有优化。文件只是简单地存储在本地磁盘上。再加上额外的元文件和用于纠删码的分片，这加剧了小文件问题。

MinIO 在读取一个文件时需要多次磁盘 IO，而 SeaweedFS 即便是纠删码的文件，也只需 O(1) 次磁盘读取。

MinIO 完全采用纠删码，而 SeaweedFS 对热数据使用复制以提高速度，且可选择对冷数据应用纠删码。

MinIO 不支持类似 POSIX 的 API。

MinIO 对存储布局有具体要求，调整容量不灵活。

而在 SeaweedFS，只需启动一个卷服务器并指向主节点，其他操作无需复杂配置。

## 开发计划

* 提供更多工具和文档，帮助管理和扩展系统。
* 支持读写流数据。
* 支持结构化数据。

这是一个非常令人兴奋的项目！我们需要更多的帮助和 [支持](https://www.patreon.com/seaweedfs)！

[返回目录](#table-of-contents)

## 安装指南

> 本安装指南适用于不熟悉 Golang 的用户

### 步骤 1：安装 Go 并设置环境

请按照以下说明安装 Go：

[Go 安装文档](https://golang.org/doc/install)

确保定义了 `$GOPATH` 环境变量。

### 步骤 2：克隆代码库

```bash
git clone https://github.com/seaweedfs/seaweedfs.git
```

### 步骤 3：下载、编译并安装项目

执行以下命令：

```bash
cd seaweedfs/weed && make install
```

完成后，您将在 `$GOPATH/bin` 目录下找到可执行文件 "weed"。

## 磁盘相关话题

### 硬盘性能

在测试 SeaweedFS 的读取性能时，基本上是在测试硬盘的随机读取速度。硬盘的读取速度通常在 100MB/s 到 200MB/s 之间。

### 固态硬盘 (SSD)

对于小文件的修改或删除，SSD 必须一次性删除整个块，并将现有块中的内容移动到新块中。SSD 在新时非常快速，但随着时间的推移会变得碎片化，并且需要进行垃圾回收和块的压缩。SeaweedFS 对 SSD 非常友好，因为它是追加写入的。删除和压缩在后台进行，仅在卷级别操作，不会影响读取，也不会造成碎片化。

## 基准测试

### 我的个人非科学单机测试结果（在配备 SSD 的 MacBook 上进行，CPU：1 个 Intel Core i7 2.6GHz）

#### 写入 100 万个 1KB 的文件：

```
并发级别: 16
测试所用时间: 66.753 秒
完成的请求数: 1048576
失败的请求数: 0
总传输数据量: 1106789009 字节
每秒请求数: 15708.23 [#/秒]
传输速率: 16191.69 [K字节/秒]

连接时间（毫秒）
              最小值    平均值    最大值   标准差
总计:         0.3      1.0      84.3     0.9

在特定时间内处理的请求百分比（毫秒）
   50%      0.8 ms
   66%      1.0 ms
   75%      1.1 ms
   80%      1.2 ms
   90%      1.4 ms
   95%      1.7 ms
   98%      2.1 ms
   99%      2.6 ms
  100%     84.3 ms
```

#### 随机读取 100 万个文件：

```
并发级别: 16
测试所用时间: 22.301 秒
完成的请求数: 1048576
失败的请求数: 0
总传输数据量: 1106812873 字节
每秒请求数: 47019.38 [#/秒]
传输速率: 48467.57 [K字节/秒]

连接时间（毫秒）
              最小值    平均值    最大值   标准差
总计:         0.0      0.3      54.1     0.2

在特定时间内处理的请求百分比（毫秒）
   50%      0.3 ms
   90%      0.4 ms
   98%      0.6 ms
   99%      0.7 ms
  100%     54.1 ms
```

### 运行 WARP 并启动混合基准测试：

```
make benchmark
warp: 基准数据已写入 "warp-mixed-2023-10-16[102354]-l70a.csv.zst"
混合操作。
操作: 删除 (DELETE)，占比 10%，并发 20，运行 4 分 59 秒。
 * 吞吐量: 6.19 obj/s

操作: 获取 (GET)，占比 45%，并发 20，运行 5 分钟。
 * 吞吐量: 279.85 MiB/s, 27.99 obj/s

操作: 写入 (PUT)，占比 15%，并发 20，运行 5 分钟。
 * 吞吐量: 89.86 MiB/s, 8.99 obj/s

操作: 状态查询 (STAT)，占比 30%，并发 20，运行 5 分钟。
 * 吞吐量: 18.63 obj/s

集群总计: 369.74 MiB/s, 61.79 obj/s, 0 错误，运行时间 5 分钟。
```

要查看分段请求统计信息，请使用 `--analyze.v` 参数。

```
warp analyze --analyze.v warp-mixed-2023-10-16[102354]-l70a.csv.zst
18642 个操作已加载... 完成！
混合操作。
----------------------------------------
操作: 删除 (DELETE) - 总计: 1854，10.0%，并发 20，运行 5 分钟，开始时间 2023-10-16 10:23:57.115 +0500 +05
 * 吞吐量: 6.19 obj/s

考虑的请求: 1855:
 * 平均: 104ms, 50%: 30ms, 90%: 207ms, 99%: 1.355s, 最快: 1ms, 最慢: 4.613s, 标准差: 320ms

----------------------------------------
操作: 获取 (GET) - 总计: 8388，45.3%，大小: 10485760 字节， 并发 20，运行 5 分钟，开始时间 2023-10-16 10:23:57.12 +0500 +05
 * 吞吐量: 279.77 MiB/s, 27.98 obj/s

考虑的请求: 8389:
 * 平均: 221ms, 50%: 106ms, 90%: 492ms, 99%: 1.739s, 最快: 8ms, 最慢: 8.633s, 标准差: 383ms
 * TTFB: 平均: 81ms, 最佳: 2ms, 25%: 24ms, 中位数: 39ms, 75%: 65ms, 90%: 171ms, 99%: 669ms, 最差: 4.783s 标准差: 163ms
 * 首次访问: 平均: 240ms, 50%: 105ms, 90%: 511ms, 99%: 2.08s, 最快: 12ms, 最慢: 8.633s, 标准差: 480ms
 * 首次访问 TTFB: 平均: 88ms, 最佳: 2ms, 25%: 24ms, 中位数: 38ms, 75%: 64ms, 90%: 179ms, 99%: 919ms, 最差: 4.783s 标准差: 199ms
 * 最后访问: 平均: 219ms, 50%: 106ms, 90%: 463ms, 99%: 1.782s, 最快: 9ms, 最慢: 8.633s, 标准差: 416ms
 * 最后访问 TTFB: 平均: 81ms, 最佳: 2ms, 25%: 24ms, 中位数: 39ms, 75%: 65ms, 90%: 161ms, 99%: 657ms, 最差: 4.783s 标准差: 176ms

----------------------------------------
操作: 写入 (PUT) - 总计: 2688，14.5%，大小: 10485760 字节， 并发 20，运行 5 分钟，开始时间 2023-10-16 10:23:57.115 +0500 +05
 * 吞吐量: 89.83 MiB/s, 8.98 obj/s

考虑的请求: 2689:
 * 平均: 1.165s, 50%: 878ms, 90%: 2.015s, 99%: 5.74s, 最快: 99ms, 最慢: 8.264s, 标准差: 968ms

----------------------------------------
操作: 状态查询 (STAT) - 总计: 5586，30.2%，并发 20，运行 5 分钟，开始时间 2023-10-16 10:23:57.113 +0500 +05
 * 吞吐量: 18.63 obj/s

考虑的请求: 5587:
 * 平均: 15ms, 50%: 11ms, 90%: 34ms, 99%: 80ms, 最快: 0s, 最慢: 245ms, 标准差: 17ms
 * 首次访问: 平均: 14ms, 50%: 10ms, 90%: 33ms, 99%: 69ms, 最快: 0s, 最慢: 203ms, 标准差: 16ms
 * 最后访问: 平均: 15ms, 50%: 11ms, 90%: 34ms, 99%: 74ms, 最快: 0s, 最慢: 203ms, 标准差: 17ms

集群总计: 369.64 MiB/s

, 61.77 obj/s, 0 错误，运行时间 5 分钟。
总错误: 0
```

## 许可证

该软件遵循 Apache 许可证 2.0 版本（"许可证"）；
除非符合许可证，否则您不得使用该文件。
您可以在以下位置获取许可证副本：

    http://www.apache.org/licenses/LICENSE-2.0

除非适用法律要求或以书面形式约定，否则根据许可证分发的软件是以“原样”基础分发的，且不提供任何明示或暗示的担保或条件。
有关具体条款，请参见许可证。

此页面的文本可根据 [创作共用 3.0 许可证](https://creativecommons.org/licenses/by-sa/3.0/) 和 [GNU 自由文档许可证](https://www.gnu.org/licenses/fdl-1.3.html) 进行修改和重用。

## Stargazers over time

[![Stargazers over time](https://starchart.cc/chrislusf/seaweedfs.svg)](https://starchart.cc/chrislusf/seaweedfs)


# 参考资料

https://github.com/owncloud/core/blob/master/README.md

* any list
{:toc}