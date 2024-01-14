---
layout: post
title:  Apache Hadoop v3.3.6-11-Hadoop CLI MiniCluster.
date:  2017-12-06 05:47:35 +0800
categories: [Apache]
tags: [apache, big-data, hadoop]
published: true
---

# 目的

通过使用CLI MiniCluster，用户可以通过单个命令启动和停止单节点Hadoop集群，而无需设置任何环境变量或管理配置文件。

CLI MiniCluster启动了YARN/MapReduce和HDFS集群。

这对于用户希望快速尝试真正的Hadoop集群或测试依赖于大量Hadoop功能的非Java程序的情况非常有用。

# Hadoop Tarball

您应该能够从发行版中获取Hadoop tarball。此外，您还可以直接从源代码创建一个tarball：

```bash
$ mvn clean install -DskipTests
$ mvn package -Pdist -Dtar -DskipTests -Dmaven.javadoc.skip
```

注意：您需要安装protoc 2.5.0。

tarball 应该在 hadoop-dist/target/ 目录中可用。

# 运行 MiniCluster

从解压缩的tarball的根目录中，您可以使用以下命令启动 CLI MiniCluster：

```bash
$ bin/mapred minicluster -rmport RM_PORT -jhsport JHS_PORT
```

在上面的示例命令中，RM_PORT 和 JHS_PORT 应该由用户选择这些端口号进行替换。

如果未指定，将使用随机的空闲端口。

用户可以使用一些命令行参数来控制要启动哪些服务，并传递其他配置属性。可用的命令行参数有：

```bash
$ -D <property=value>    传递到配置对象的选项
$ -datanodes <arg>       要启动的数据节点数（默认值为1）
$ -format                格式化DFS（默认为false）
$ -help                  打印选项帮助。
$ -jhsport <arg>         JobHistoryServer 端口（默认为0--我们选择）
$ -namenode <arg>        namenode 的 URL（默认为DFS集群或临时目录）
$ -nnport <arg>          NameNode 端口（默认为0--我们选择）
$ -nnhttpport <arg>      NameNode HTTP 端口（默认为0--我们选择）
$ -nodemanagers <arg>    要启动的 NodeManagers 数量（默认值为1）
$ -nodfs                 不要启动 Mini DFS 集群
$ -nomr                  不要启动 Mini MR 集群
$ -rmport <arg>          ResourceManager 端口（默认为0--我们选择）
$ -writeConfig <path>    将配置保存到此 XML 文件。
$ -writeDetails <path>   将基本信息写入此 JSON 文件。
```

要显示此可用参数的完整列表，用户可以将 -help 参数传递给上述命令。

# 参考资料

https://hadoop.apache.org/docs/stable/hadoop-project-dist/hadoop-common/CLIMiniCluster.html

* any list
{:toc}