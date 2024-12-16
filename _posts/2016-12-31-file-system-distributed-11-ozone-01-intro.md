---
layout: post
title: 分布式存储系统-10-OZone-01-intro 入门介绍
date:  2016-12-31 10:48:42 +0800
categories: [File]
tags: [distributed, dfs, file]
published: true
---




Apache Ozone
===

Ozone是一个可扩展、冗余且分布式的对象存储系统，适用于Hadoop和云原生环境。

除了能够扩展到数十亿个大小不一的对象，Ozone还能在Kubernetes和YARN等容器化环境中有效运行。

* 多协议支持：Ozone支持不同的协议，如S3和Hadoop文件系统API。
* 可扩展性：Ozone旨在扩展到数十亿个文件和块，未来甚至更多。
* 一致性：Ozone是一个强一致性的对象存储系统。通过使用如RAFT这样的协议来实现一致性。
* 云原生：Ozone旨在在YARN和Kubernetes等容器化环境中良好工作。
* 安全性：Ozone与Kerberos基础设施集成进行身份验证，支持原生ACL，并与Ranger集成以进行访问控制，支持TDE和在线加密。
* 高可用性：Ozone是一个完全复制的系统，旨在承受多次故障。

## 文档

最新文档与版本一同生成，并托管在Apache网站上。

请查看[文档页面](https://ozone.apache.org/docs/)以获取更多信息。

## 联系方式

Ozone是[Apache软件基金会](https://apache.org)的一个顶级项目

* Ozone [网页](https://ozone.apache.org) 
* 邮件列表
    * 如有任何问题请使用：[dev@ozone.apache.org](https://lists.apache.org/list.html?dev@ozone.apache.org) 
* 聊天：有几种方式可以与社区互动
    * 你可以在官方ASF Slack上找到#ozone频道。邀请链接[在此](http://s.apache.org/slack-invite)。 
    * 你可以使用[GitHub Discussions](https://github.com/apache/ozone/discussions)发布问题或关注社区同步。
* 有开放的[每周电话会议](https://cwiki.apache.org/confluence/display/OZONE/Ozone+Community+Calls)，你可以在会议上询问任何关于Ozone的问题。
    * 过去会议记录也可从wiki获取。
* 报告安全问题：请参考[SECURITY.md](./SECURITY.md)了解如何报告安全漏洞和问题。

## 下载

最新发布的软件包（源代码发布和二进制包）可以在Ozone网页上[获取](https://ozone.apache.org/downloads/)。

## 快速开始

### 从发布的Docker镜像运行Ozone

使用docker启动集群的最简单方式是：

```
docker run -p 9878:9878 apache/ozone
```

你可以使用AWS S3 cli：

```
aws s3api --endpoint http://localhost:9878/ create-bucket --bucket=wordcount
aws s3 --endpoint http://localhost:9878 cp --storage-class REDUCED_REDUNDANCY  /tmp/testfile  s3://wordcount/testfile
```

### 从发布的软件包运行Ozone

如果你需要一个更真实的集群，你可以[下载](https://ozone.apache.org/downloads/)最新的（二进制）发布包，并在docker-compose的帮助下启动集群：

解压缩二进制包后：

```
cd compose/ozone
docker-compose up -d --scale datanode=3
```

`compose`文件夹包含不同配置集群（安全、高可用性、mapreduce示例），你可以检查各个子文件夹以获取更多示例。

### 在Kubernetes上运行

Ozone是云原生环境的一等公民。二进制包包含多套K8s资源文件，展示如何部署。

## 从源代码构建

Ozone可以使用[Apache Maven](https://maven.apache.org)构建：

```
mvn clean install -DskipTests
```

并可以在Docker的帮助下启动：

```
cd hadoop-ozone/dist/target/ozone-*/compose/ozone
docker-compose up -d --scale datanode=3
```

更多信息，你可以查看[贡献指南](./CONTRIBUTING.md)

## 贡献

欢迎所有贡献。

 1. 请开启一个[Jira](https://issues.apache.org/jira/projects/HDDS/issues)问题
 2. 并创建一个拉取请求

更多信息，你可以查看[贡献指南](./CONTRIBUTING.md)

## 许可证

Apache Ozone项目在Apache 2.0许可证下授权。详见[LICENSE](./LICENSE.txt)文件。


# 参考资料

https://github.com/ThinkParQ/beegfs

* any list
{:toc}