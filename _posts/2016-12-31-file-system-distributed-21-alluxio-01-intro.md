---
layout: post
title: 分布式存储系统-21-Alluxio/Tachyon 是一个虚拟分布式存储系统。
date:  2016-12-31 10:48:42 +0800
categories: [File]
tags: [distributed, dfs, cloud-native, file]
published: true
---

# 什么是 Alluxio

[Alluxio](https://www.alluxio.io)（前身为 Tachyon）是一个虚拟分布式存储系统。

它弥合了计算框架与存储系统之间的差距，使得计算应用程序能够通过统一的接口连接到众多存储系统。

更多内容请查看 [Alluxio 概述](https://docs.alluxio.io/os/user/stable/en/Overview.html)。

Alluxio 项目源自于 UC 伯克利 AMPLab 的一个名为 Tachyon 的研究项目，它是伯克利数据分析堆栈（[BDAS](https://amplab.cs.berkeley.edu/bdas/)）的数据层。

更多详细信息请参考 Haoyuan Li 的博士论文 [Alluxio: A Virtual Distributed File System](https://www2.eecs.berkeley.edu/Pubs/TechRpts/2018/EECS-2018-29.html)。

## 谁在使用 Alluxio

Alluxio 已经被许多领先公司在生产环境中用于管理数千 PB 的数据，最大部署规模超过 3000 个节点。更多的使用案例请访问 [Powered by Alluxio](https://www.alluxio.io/powered-by-alluxio)，或者参见我们的首次社区会议 ([Data Orchestration Summit](https://www.alluxio.io/data-orchestration-summit-2019/))，向其他社区成员学习！

## 谁拥有并管理 Alluxio 项目

Alluxio 开源基金会是 Alluxio 项目的所有者。项目的运营由 Alluxio 项目管理委员会（PMC）负责。你可以在 [这里](https://github.com/Alluxio/alluxio/wiki/Alluxio-Project-Management-Committee-(PMC)) 查看其结构和如何加入 Alluxio PMC 的更多细节。

## 社区和活动
请使用以下途径与社区成员联系：

* [Alluxio 社区 Slack 频道](https://www.alluxio.io/slack)：如果你有一般性问题或在使用 Alluxio 时遇到问题，请在这里发布你的问题。
* [Alluxio 用户和开发者的特别兴趣小组（SIG）](#contributing)
* 社区活动：[即将举办的在线办公时间、聚会和网络研讨会](https://www.alluxio.io/events)
* Meetup 群组：[全球在线 Meetup](https://www.meetup.com/Alluxio-Global-Online-Meetup/)、[湾区 Meetup](http://www.meetup.com/Alluxio)、[纽约 Meetup](https://www.meetup.com/Alluxio-Open-Source-New-York-Meetup)、[北京 Alluxio Meetup](https://www.meetup.com/meetup-group-iLMBZGhS/)、[奥斯丁 Meetup](https://www.meetup.com/Cloud-Data-Orchestration-Austin/)
* [Alluxio Twitter](https://twitter.com/alluxio)；[Alluxio Youtube 频道](https://www.youtube.com/channel/UCpibQsajhwqYPLYhke4RigA)；[Alluxio 邮件列表](https://groups.google.com/forum/?fromgroups#!forum/alluxio-users)

## 下载 Alluxio

### 二进制下载

可以从 [https://www.alluxio.io/download](https://www.alluxio.io/download) 下载预构建的二进制文件。

### Docker

下载并启动一个 Alluxio 主节点和一个工作节点。更多细节可以在 [文档](https://docs.alluxio.io/os/user/stable/en/deploy/Running-Alluxio-On-Docker.html) 中找到。

```console
# 创建一个网络以连接 Alluxio 容器
$ docker network create alluxio_nw
# 创建一个用于存储 ufs 数据的卷
$ docker volume create ufs
# 启动 Alluxio 主节点
$ docker run -d --net=alluxio_nw \
    -p 19999:19999 \
    --name=alluxio-master \
    -v ufs:/opt/alluxio/underFSStorage \
    alluxio/alluxio master
# 启动 Alluxio 工作节点
$ export ALLUXIO_WORKER_RAMDISK_SIZE=1G
$ docker run -d --net=alluxio_nw \
    --shm-size=${ALLUXIO_WORKER_RAMDISK_SIZE} \
    --name=alluxio-worker \
    -v ufs:/opt/alluxio/underFSStorage \
    -e ALLUXIO_JAVA_OPTS="-Dalluxio.worker.ramdisk.size=${ALLUXIO_WORKER_RAMDISK_SIZE} -Dalluxio.master.hostname=alluxio-master" \
    alluxio/alluxio worker
```

### MacOS Homebrew

```console
$ brew install alluxio
```

## 快速开始

请遵循 [快速入门指南](https://docs.alluxio.io/os/user/stable/en/Getting-Started.html) 运行一个简单的 Alluxio 示例。

## 报告 Bug

如果要报告 bug、提出改进建议或创建新功能请求，请打开 [GitHub 问题](https://github.com/alluxio/alluxio/issues)。如果你不确定是否遇到了 bug，或只是有关于 Alluxio 的一般性问题，请在 [Alluxio Slack 频道](www.alluxio.io/slack) 上发布你的问题。

## 依赖于 Alluxio

Alluxio 项目提供了几个不同的客户端构件，供外部项目依赖 Alluxio 客户端：

- `alluxio-shaded-client` 构件通常推荐用于项目中使用 Alluxio 客户端。该构件的 jar 文件是自包含的（包括所有依赖项，以避开依赖冲突），因此比以下两个构件更大。
- `alluxio-core-client-fs` 构件提供了 [Alluxio Java 文件系统 API](https://docs.alluxio.io/os/user/stable/en/api/Java-API.html#alluxio-java-api)，用于访问 Alluxio 特有的功能。该构件包含在 `alluxio-shaded-client` 中。
- `alluxio-core-client-hdfs` 构件提供了 [HDFS 兼容文件系统 API](https://docs.alluxio.io/os/user/stable/en/api/Java-API.html#hadoop-compatible-java-client)。该构件也包含在 `alluxio-shaded-client` 中。

以下是使用 Maven 声明依赖 `alluxio-shaded-client` 的示例：

```xml
<dependency>
  <groupId>org.alluxio</groupId>
  <artifactId>alluxio-shaded-client</artifactId>
  <version>2.6.0</version>
</dependency>
```

## 贡献

欢迎通过 GitHub 拉取请求贡献代码。提交拉取请求时，请声明该贡献是你的原创工作，并且你将该工作授权给项目，按照项目的开源许可进行使用。无论是否明确声明，提交任何版权材料时，默认同意将其许可给项目，并保证你有合法权限这么做。  
详细的步骤请阅读 [如何贡献给 Alluxio](https://docs.alluxio.io/os/user/stable/en/contributor/Contributor-Getting-Started.html)。  
对于新贡献者，可以先完成两个 [新贡献者任务](https://github.com/Alluxio/new-contributor-tasks)。

对于高级功能请求和贡献，Alluxio 核心团队定期举行线上会议，与社区用户和开发者讨论项目迭代，讨论内容包括两个特别兴趣小组：

* Alluxio 与 AI 工作负载：例如，通过 POSIX API 在 Alluxio 上运行 Tensorflow、Pytorch。查看 [会议记录](https://docs.google.com/spreadsheets/d/1OlprIiUkGjMuZJ_6cLTJYVJpTGpnTWkFhHz

X16tYNDQ/)
* Alluxio 与 Presto 工作负载：例如，在 Alluxio 上运行 Presto。查看 [会议记录](https://docs.google.com/spreadsheets/d/1V-fxqfG_oj3B1ZWSgbRWVuTHFvjL3pq6uXgAL-xvFQA/)

订阅我们的 [公共日历](https://calendar.google.com/calendar/embed?src=alluxio.com_g9ec8agk27baqu2nu692ft1m3s%40group.calendar.google.com&ctz=America%2FLos_Angeles) 参与我们的会议。

## 有用链接

- [Alluxio 官网](https://www.alluxio.io/)
- [下载页面](https://www.alluxio.io/download)
- [发布和说明](https://www.alluxio.io/download/releases/)
- [文档](https://www.alluxio.io/docs/)


# 参考资料

https://docs.daos.io/v2.6/overview/architecture/

* any list
{:toc}