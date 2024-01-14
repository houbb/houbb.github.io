---
layout: post
title:  Apache Hadoop v3.3.6-17-Service Level Authorization Guide
date:  2017-12-06 05:47:35 +0800
categories: [Apache]
tags: [apache, big-data, hadoop]
published: true
---

# 目的

本文档描述如何为Hadoop配置和管理服务级别授权。

# 先决条件

确保已正确安装、配置和设置Hadoop。

有关更多信息，请参见：

- [首次用户的单节点设置](https://hadoop.apache.org/docs/stable/hadoop-project-dist/hadoop-common/SingleCluster.html)
- [大型分布式集群的集群设置](https://hadoop.apache.org/docs/stable/hadoop-project-dist/hadoop-common/ClusterSetup.html)

# 概述

服务级别授权是初始授权机制，用于确保连接到特定Hadoop服务的客户端具有必要的、预配置的权限，并被授权访问给定的服务。

例如，MapReduce集群可以使用此机制允许配置的用户/组列表提交作业。

`$HADOOP_CONF_DIR/hadoop-policy.xml` 配置文件用于定义各种Hadoop服务的访问控制列表。

服务级别授权是在其他访问控制检查之前执行的，如文件权限检查、作业队列上的访问控制等。

# 配置

本节描述如何通过配置文件 `$HADOOP_CONF_DIR/hadoop-policy.xml` 配置服务级别的授权。

## 启用服务级别授权

默认情况下，Hadoop的服务级别授权是禁用的。要启用它，请在 `$HADOOP_CONF_DIR/core-site.xml` 中将配置属性 `hadoop.security.authorization` 设置为 `true`。

## Hadoop服务和配置属性

此部分列出了各种Hadoop服务及其配置参数：

| 属性                                 | 服务                                                         |
| ------------------------------------ | ------------------------------------------------------------ |
| `security.client.protocol.acl`       | 用于用户代码通过DistributedFileSystem使用的ClientProtocol的ACL。 |
| `security.client.datanode.protocol.acl` | 用于块恢复的ClientDatanodeProtocol的ACL，即客户端到数据节点的协议。 |
| `security.datanode.protocol.acl`    | 用于数据节点与名称节点通信的DatanodeProtocol的ACL。           |
| `security.inter.datanode.protocol.acl` | 用于更新生成时间戳的InterDatanodeProtocol的ACL，即用于数据节点之间的协议。 |
| `security.namenode.protocol.acl`   | 用于Secondary Namenode与NameNode通信的NamenodeProtocol的ACL。 |
| `security.job.client.protocol.acl` | 用于JobSubmissionProtocol的ACL，即作业客户端与资源管理器通信，用于提交作业、查询作业状态等。 |
| `security.job.task.protocol.acl`   | 用于TaskUmbilicalProtocol的ACL，即用于Map和Reduce任务与父NodeManager通信的协议。 |
| `security.refresh.policy.protocol.acl` | 用于RefreshAuthorizationPolicyProtocol的ACL，即由dfsadmin和rmadmin命令使用，用于刷新生效中的安全策略。 |
| `security.ha.service.protocol.acl` | 用于由HAAdmin使用的HAService协议的ACL，用于管理NameNode的活动和备用状态。 |

## 访问控制列表

`$HADOOP_CONF_DIR/hadoop-policy.xml` 为每个Hadoop服务定义了一个访问控制列表。每个访问控制列表都有一个简单的格式：

- 用户和组的列表都是由逗号分隔的名称列表。两个列表之间由一个空格分隔。
  
  例如：`user1,user2 group1,group2`。

- 如果只提供组的列表，则在行的开头添加一个空格；同样，只有给定用户的逗号分隔列表后跟一个空格或无内容意味着只有一组给定的用户。

- 特殊值 `*` 表示允许所有用户访问服务。

如果未为服务定义访问控制列表，则将应用 `security.service.authorization.default.acl` 的值。如果未定义 `security.service.authorization.default.acl`，则应用 `*`。

## 阻止访问控制列表

在某些情况下，需要为服务指定阻止访问控制列表。这指定了未被授权访问服务的用户和组列表。阻止访问控制列表的格式与访问控制列表相同。可以通过 `$HADOOP_CONF_DIR/hadoop-policy.xml` 指定阻止访问控制列表。属性名称通过添加“blocked”后缀来派生。

例如：`security.client.protocol.acl` 的阻止访问控制列表的属性名称将是 `security.client.protocol.acl.blocked`。

对于一个服务，可以同时指定访问控制列表和阻止控制列表。如果用户在访问控制列表中且不在阻止访问控制列表中，则用户被授权访问服务。

如果未为服务定义阻止访问控制列表，则应用 `security.service.authorization.default.acl.blocked` 的值。如果未定义 `security.service.authorization.default.acl.blocked`，则应用空的阻止访问控制列表。

## 使用IP地址、主机名和IP范围列表的访问控制

可以基于访问服务的客户端的IP地址来控制对服务的访问。可以通过指定一组IP地址、主机名和IP范围来限制对服务的访问。每个服务的属性名称来自相应acl的属性名称。如果acl的属性名称是 `security.client.protocol.acl`，则主机列表的属性名称将是 `security.client.protocol.hosts`。

如果未为服务定义主机列表，则应用 `security.service.authorization.default.hosts` 的值。如果未定义 `security.service.authorization.default.hosts`，则应用 `*`。

可以指定一个被阻止的主机列表。只有在主机列表中但不在被阻止的主机列表中的机器将被授予对服务的访问权限。该属性名称通过添加“blocked”后缀派生。

例如：`security.client.protocol.hosts` 的被阻止主机列表的属性名称将是 `security.client.protocol.hosts.blocked`。

如果未为服务定义被阻止的主机列表，则应用 `security.service.authorization.default.hosts.blocked` 的值。如果未定义 `security.service.authorization.default.hosts.blocked`，则应用空的被阻止的主机列表。

## 刷新服务级别授权配置

可以在不重新启动Hadoop主daemon的情况下更改NameNode和ResourceManager的服务级别授权配置。集群管理员可以在主节点上更改 `$HADOOP_CONF_DIR/hadoop-policy.xml`，然后通过对应于dfsadmin和rmadmin命令的 `-refreshServiceAcl` 开关指示NameNode和ResourceManager重新加载其各自的配置。

刷新NameNode的服务级别授权配置：

```bash
$ bin/hdfs dfsadmin -refreshServiceAcl
```

刷新ResourceManager的服务级别授权配置：

```bash
$ bin/yarn rmadmin -refreshServiceAcl
```

当然，可以使用 `$HADOOP_CONF_DIR/hadoop-policy.xml` 中的 `security.refresh.policy.protocol.acl` 属性来限制刷新服务级别授权配置的访问权限，以某些用户/组。

## 示例

#### 仅允许用户 alice、bob 和 mapreduce 组的用户提交作业到 MapReduce 集群：

```xml
<property>
     <name>security.job.client.protocol.acl</name>
     <value>alice,bob mapreduce</value>
</property>
```

#### 仅允许属于 datanodes 组的用户运行的 DataNodes 与 NameNode 进行通信：

```xml
<property>
     <name>security.datanode.protocol.acl</name>
     <value>datanodes</value>
</property>
```

#### 允许任何用户作为 DFSClient 与 HDFS 集群通信：

```xml
<property>
     <name>security.client.protocol.acl</name>
     <value>*</value>
</property>
```

这些示例演示了如何配置服务级别授权，限制特定用户或组对不同服务的访问。

在这些示例中，你可以根据你的需求调整用户、组和服务名称。

# 参考资料

https://hadoop.apache.org/docs/stable/hadoop-project-dist/hadoop-common/ServiceLevelAuth.html

* any list
{:toc}