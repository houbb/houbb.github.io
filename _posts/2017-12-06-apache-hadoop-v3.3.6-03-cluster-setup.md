---
layout: post
title:  Apache Hadoop v3.3.6-03-Hadoop Cluster Setup 集群部署模式
date:  2017-12-06 05:47:35 +0800
categories: [Apache]
tags: [apache, big-data, hadoop]
published: true
---

# **目的**

本文档描述了如何安装和配置Hadoop集群，从包含几个节点的小集群到包含数千个节点的极大集群。为了体验Hadoop，您可能首先想在单台机器上安装它（请参见单节点设置）。

本文档不涵盖高级主题，如高可用性。

重要提示：所有生产Hadoop集群都使用Kerberos对调用者进行身份验证，并安全访问HDFS数据，以及限制对计算服务（YARN等）的访问。

这些说明不涵盖与任何Kerberos服务的集成，每个启动生产集群的人都应将连接到其组织的Kerberos基础设施作为部署的关键部分。

请参阅安全性以获取有关如何保护集群的详细信息。

# **先决条件**

- 安装Java。请参阅Hadoop Wiki以获取已知的良好版本。
- 从Apache镜像下载稳定版本的Hadoop。

# **安装**

安装Hadoop集群通常涉及在集群中的所有机器上解压软件，或根据操作系统的适用情况通过包装系统进行安装。重要的是将硬件划分为不同的功能。

通常，集群中的一台机器被指定为NameNode，另一台机器被指定为ResourceManager，分别是主节点。

其他服务（如Web App代理服务器和MapReduce作业历史服务器）通常在专用硬件上运行，或者根据负载情况在共享基础设施上运行。

集群中的其余机器既充当DataNode又充当NodeManager，它们是工作节点。

# **在非安全模式下配置Hadoop**

Hadoop的Java配置由两种重要的配置文件驱动：

1. 只读的默认配置 - core-default.xml、hdfs-default.xml、yarn-default.xml 和 mapred-default.xml。
2. 站点特定配置 - etc/hadoop/core-site.xml、etc/hadoop/hdfs-site.xml、etc/hadoop/yarn-site.xml 和 etc/hadoop/mapred-site.xml。

此外，通过在分发的 bin/ 目录中设置站点特定值，您还可以控制在Hadoop脚本中找到的脚本，通过 etc/hadoop/hadoop-env.sh 和 etc/hadoop/yarn-env.sh。

要配置Hadoop集群，您需要配置Hadoop守护程序执行的环境以及Hadoop守护程序的配置参数。

HDFS守护程序包括NameNode、SecondaryNameNode和DataNode。

YARN守护程序包括ResourceManager、NodeManager和WebAppProxy。

如果要使用MapReduce，则还将运行MapReduce Job History Server。对于大型安装，通常它们在单独的主机上运行。

## **配置Hadoop守护程序的环境**

管理员应使用 etc/hadoop/hadoop-env.sh，以及可选的 etc/hadoop/mapred-env.sh 和 etc/hadoop/yarn-env.sh 脚本进行Hadoop守护程序的进程环境的站点特定定制。

至少，必须指定JAVA_HOME，以便在每个远程节点上正确定义它。

管理员可以使用下表中显示的配置选项配置各个守护程序：

| 守护程序                   | 环境变量                     |
|-------------------------|--------------------------|
| NameNode                | HDFS_NAMENODE_OPTS       |
| DataNode                | HDFS_DATANODE_OPTS       |
| Secondary NameNode      | HDFS_SECONDARYNAMENODE_OPTS |
| ResourceManager        | YARN_RESOURCEMANAGER_OPTS   |
| NodeManager             | YARN_NODEMANAGER_OPTS      |
| WebAppProxy             | YARN_PROXYSERVER_OPTS      |
| Map Reduce Job History Server | MAPRED_HISTORYSERVER_OPTS |

例如，要配置NameNode使用ParallelGC和4GB的Java Heap，应在hadoop-env.sh中添加以下语句：

```bash
export HDFS_NAMENODE_OPTS="-XX:+UseParallelGC -Xmx4g"
```

在 etc/hadoop/hadoop-env.sh 中查看其他示例。

您还可以自定义的其他有用的配置参数包括：

- HADOOP_PID_DIR - 存储守护程序进程ID文件的目录。
- HADOOP_LOG_DIR - 存储守护程序日志文件的目录。如果文件不存在，日志文件将被自动创建。
- HADOOP_HEAPSIZE_MAX - 用于Java堆大小的最大内存量。JVM支持的单位在这里也受支持。如果没有单位，将假定数字以兆字节为单位。

默认情况下，Hadoop将让JVM确定使用多少内存。

可以使用上面列出的适当的 _OPTS 变量对每个守护程序进行覆盖。

例如，设置 HADOOP_HEAPSIZE_MAX=1g 和 HADOOP_NAMENODE_OPTS="-Xmx5g" 将配置NameNode为5GB堆。

在大多数情况下，您应该指定 HADOOP_PID_DIR 和 HADOOP_LOG_DIR 目录，以便它们只能由将运行hadoop守护程序的用户写入。否则，可能存在符号链接攻击的风险。

配置HADOOP_HOME也是在系统范围的shell环境配置中的传统做法。

例如，在 /etc/profile.d/ 中的一个简单脚本：

```bash
HADOOP_HOME=/path/to/hadoop
export HADOOP_HOME
```

## **配置Hadoop守护程序**

本节介绍在给定的配置文件中要指定的重要参数：

**`etc/hadoop/core-site.xml`**

| 参数                  | 值                | 说明                               |
|---------------------|------------------|----------------------------------|
| fs.defaultFS        | NameNode URI     | hdfs://host:port/                 |
| io.file.buffer.size | 131072           | SequenceFiles中使用的读/写缓冲区大小。    |

**`etc/hadoop/hdfs-site.xml`**

配置NameNode：

| 参数                       | 值                | 说明                                                                                                  |
|--------------------------|------------------|-----------------------------------------------------------------------------------------------------|
| dfs.namenode.name.dir     | 本地文件系统上NameNode存储命名空间和事务日志的路径。如果这是逗号分隔的目录列表，则名称表会在所有目录中复制，以提高冗余性。 | 
| dfs.hosts / dfs.hosts.exclude | 允许/排除DataNode的列表。如有必要，使用这些文件来控制允许的数据节点列表。                                       |
| dfs.blocksize             | 268435456        | 大型文件系统的HDFS块大小为256MB。                                                                      |
| dfs.namenode.handler.count | 100              | 用于处理来自大量DataNode的RPC的更多NameNode服务器线程。                                               |

配置DataNode：

| 参数                   | 值                                       | 说明                                                                                                          |
|----------------------|-----------------------------------------|-------------------------------------------------------------------------------------------------------------|
| dfs.datanode.data.dir | 本地文件系统上DataNode存储其块的路径的逗号分隔列表。如果这是逗号分隔的目录列表，则数据将存储在所有命名目录中，通常在不同设备上。 |


**`etc/hadoop/yarn-site.xml`**

配置ResourceManager和NodeManager：

| 参数                  | 值                | 说明                                                                                                        |
|---------------------|------------------|-----------------------------------------------------------------------------------------------------------|
| yarn.acl.enable     | true / false     | 启用ACL？默认为false。                                                                                        |
| yarn.admin.acl      | Admin ACL        | 在集群上设置管理员的ACL。ACL为逗号分隔的用户空间逗号分隔的组。默认为特殊值*，表示任何人。只有空格的特殊值表示没有人有权限。            |
| yarn.log-aggregation-enable | false       | 启用或禁用日志聚合的配置。                                                                                    |

配置ResourceManager：

| 参数                                    | 值                              | 说明                                                                                                                |
|---------------------------------------|--------------------------------|---------------------------------------------------------------------------------------------------------------------|
| yarn.resourcemanager.address           | ResourceManager主机：端口，用于客户端提交作业。               | 主机：端口。如果设置，将覆盖在yarn.resourcemanager.hostname中设置的主机名。                                              |
| yarn.resourcemanager.scheduler.address | ResourceManager主机：端口，ApplicationMasters用于与Scheduler通信以获取资源。 | 主机：端口。如果设置，将覆盖在yarn.resourcemanager.hostname中设置的主机名。                                              |
| yarn.resourcemanager.resource-tracker.address | ResourceManager主机：端口，NodeManagers用于通信。           | 主机：端口。如果设置，将覆盖在yarn.resourcemanager.hostname中设置的主机名。                                              |
| yarn.resourcemanager.admin.address      | ResourceManager主机：端口，用于管理命令。                   | 主机：端口。如果设置，将覆盖在yarn.resourcemanager.hostname中设置的主机名。                                              |
| yarn.resourcemanager.webapp.address     | ResourceManager web-ui主机：端口。                      | 主机：端口。如果设置，将覆盖在yarn.resourcemanager.hostname中设置的主机名。                                              |
| yarn.resourcemanager.hostname           | ResourceManager主机。               | 主机。单一主机名，可代替设置所有yarn.resourcemanager*address资源。导致ResourceManager组件的默认端口。            |
| yarn.resourcemanager.scheduler.class   | ResourceManager Scheduler类。     | CapacityScheduler（推荐），FairScheduler（也推荐）或FifoScheduler。使用完全限定的类名，例如，org.apache.hadoop.yarn.server.resourcemanager.scheduler.fair.FairScheduler。 |
| yarn.scheduler.minimum-allocation-mb   | Resource Manager每个容器请求分配的最小内存限制。               | 以MB为单位。                                                                                                          |
| yarn.scheduler.maximum-allocation-mb   | Resource Manager每个容器请求分配的最大内存限制。               | 以MB为单位。                                                                                                          |
| yarn.resourcemanager.nodes.include-path / yarn.resourcemanager.nodes.exclude-path | 允许/排除NodeManagers的列表。如有必要，使用这些文件来控制允许的NodeManagers列表。                                   |

这些是一些重要的配置，你可以根据你的需求进行调整和进一步定制。

**NodeManager的配置:**

| 参数                                | 值                                      | 说明                                                                                                                                      |
|-----------------------------------|----------------------------------------|------------------------------------------------------------------------------------------------------------------------------------------|
| yarn.nodemanager.resource.memory-mb | NodeManager可用的物理内存，以MB为单位。            | 定义NodeManager上总共可用于运行容器的资源。                                                                                               |
| yarn.nodemanager.vmem-pmem-ratio   | 任务虚拟内存使用量可能超过物理内存的最大比率。          | 每个任务的虚拟内存使用量可以超过其物理内存限制的这个比率。NodeManager上任务使用的虚拟内存总量可以超过其物理内存使用量的这个比率。                    |
| yarn.nodemanager.local-dirs        | 本地文件系统上写入中间数据的逗号分隔路径列表。          | 多个路径有助于分散磁盘I/O。                                                                                                               |
| yarn.nodemanager.log-dirs          | 本地文件系统上写入日志的逗号分隔路径列表。           | 多个路径有助于分散磁盘I/O。                                                                                                               |
| yarn.nodemanager.log.retain-seconds | 10800                                  | 在NodeManager上保留日志文件的默认时间（以秒为单位）。仅在禁用日志聚合时适用。                                                          |
| yarn.nodemanager.remote-app-log-dir | /logs                                  | 应用程序完成时移动应用程序日志的HDFS目录。需要设置适当的权限。仅在启用日志聚合时适用。                                                     |
| yarn.nodemanager.remote-app-log-dir-suffix | logs                           | 追加到远程日志目录的后缀。日志将聚合到${yarn.nodemanager.remote-app-log-dir}/${user}/${thisParam}。仅在启用日志聚合时适用。                       |
| yarn.nodemanager.aux-services       | mapreduce_shuffle                     | 为Map Reduce应用程序设置的Shuffle服务。                                                                                                  |
| yarn.nodemanager.env-whitelist      | 从NodeManagers继承的容器的环境属性。                | 对于mapreduce应用程序，除了默认值之外，应添加HADOOP_MAPRED_HOME。属性值应为JAVA_HOME,HADOOP_COMMON_HOME,HADOOP_HDFS_HOME,HADOOP_CONF_DIR,CLASSPATH_PREPEND_DISTCACHE,HADOOP_YARN_HOME,HADOOP_HOME,PATH,LANG,TZ,HADOOP_MAPRED_HOME。 |

**History Server的配置（需要移动到其他地方）:**

| 参数                                              | 值       | 说明                                                                         |
|-------------------------------------------------|---------|------------------------------------------------------------------------------|
| yarn.log-aggregation.retain-seconds               | -1      | 保留汇总日志多长时间，-1表示禁用。小心，设置得太小会导致NameNode受到垃圾邮件。                                                           |
| yarn.log-aggregation.retain-check-interval-seconds | -1      | 检查聚合日志保留的时间间隔。如果设置为0或负值，则该值被计算为聚合日志保留时间的十分之一。小心，设置得太小会导致NameNode受到垃圾邮件。 |

**`etc/hadoop/mapred-site.xml`**

MapReduce应用程序的配置：

| 参数                          | 值             | 说明                                                   |
|-----------------------------|---------------|------------------------------------------------------|
| mapreduce.framework.name     | yarn          | 执行框架设置为Hadoop YARN。                                |
| mapreduce.map.memory.mb      | 1536          | Maps的更大资源限制。                                       |
| mapreduce.map.java.opts      | -Xmx1024M     | Maps的子JVM的更大堆大小。                                   |
| mapreduce.reduce.memory.mb   | 3072          | Reduces的更大资源限制。                                     |
| mapreduce.reduce.java.opts   | -Xmx2560M     | Reduces的子JVM的更大堆大小。                                 |
| mapreduce.task.io.sort.mb    | 512           | 在排序数据时使用的更大内存限制，以提高效率。                    |
| mapreduce.task.io.sort.factor | 100           | 同时合并文件时使用的更多流。                                 |
| mapreduce.reduce.shuffle.parallelcopies | 50  | Reduces运行的并行复制数，用于从大量Map中获取输出。               |

**MapReduce JobHistory Server的配置：**

| 参数                                       | 值         | 说明                                      |
|------------------------------------------|-----------|-----------------------------------------|
| mapreduce.jobhistory.address              | 地址：端

口  | MapReduce JobHistory Server主机：端口。    |
| mapreduce.jobhistory.webapp.address       | 地址：端口  | MapReduce JobHistory Server Web UI主机：端口。 |
| mapreduce.jobhistory.intermediate-done-dir | /mr-history/tmp | MapReduce作业写入历史文件的目录。            |
| mapreduce.jobhistory.done-dir             | /mr-history/done | MR JobHistory Server管理历史文件的目录。   |

这些是一些重要的配置，您可以根据需要进行调整和进一步定制。

## **监控NodeManagers的健康状况**

Hadoop提供了一种机制，使管理员能够配置NodeManager定期运行由管理员提供的脚本，以确定节点是否健康。

管理员可以通过在脚本中执行他们选择的任何检查来确定节点是否处于健康状态。

如果脚本检测到节点处于不健康状态，它必须打印一行以字符串ERROR开头的内容到标准输出。NodeManager周期性地生成并检查脚本的输出。如果脚本的输出包含如上所述的字符串ERROR，则报告节点状态为不健康，并由ResourceManager列入黑名单。不会再分配任务给此节点。

然而，NodeManager继续运行脚本，因此如果节点再次变得健康，它将自动从ResourceManager的黑名单中移除。管理员可以在ResourceManager的Web界面中查看节点的健康状况以及脚本的输出（如果节点不健康）。Web界面还显示自节点变为健康状态以来的时间。

以下参数可用于在`etc/hadoop/yarn-site.xml`中控制节点健康监控脚本。

| 参数                                       | 值            | 说明                                      |
|------------------------------------------|--------------|-----------------------------------------|
| yarn.nodemanager.health-checker.script.path | Node健康脚本的路径 | 用于检查节点健康状态的脚本。                        |
| yarn.nodemanager.health-checker.script.opts | Node健康脚本的选项 | 用于检查节点健康状态的脚本的选项。                    |
| yarn.nodemanager.health-checker.interval-ms | Node健康脚本的时间间隔 | 运行健康脚本的时间间隔。                            |
| yarn.nodemanager.health-checker.script.timeout-ms | Node健康脚本的超时时间 | 健康脚本执行的超时时间。                           |

健康检查脚本不应在只有一些本地磁盘变坏的情况下返回ERROR。

NodeManager有能力定期检查本地磁盘的健康状况（具体来说是检查nodemanager-local-dirs和nodemanager-log-dirs），在达到根据配置属性yarn.nodemanager.disk-health-checker.min-healthy-disks设置的坏目录数量的阈值之后，整个节点将被标记为不健康，并将此信息发送到资源管理器。引导磁盘要么是RAID，要么通过健康检查脚本识别引导磁盘故障。

## **Slaves文件**

在`etc/hadoop/workers`文件中列出所有工作节点的主机名或IP地址，每行一个。辅助脚本（下文有描述）将使用`etc/hadoop/workers`文件同时在多个主机上运行命令。它不用于任何基于Java的Hadoop配置。为了使用这个功能，必须为用于运行Hadoop的帐户建立ssh信任（通过无密码ssh或其他手段，比如Kerberos）。

## **Hadoop机架感知**

许多Hadoop组件都具有机架感知功能，并利用网络拓扑来提高性能和安全性。Hadoop守护程序通过调用管理员配置的模块获取集群中工作节点的机架信息。详细信息请参阅机架感知文档。

强烈建议在启动HDFS之前配置机架感知。

## **日志记录**

Hadoop使用Apache log4j通过Apache Commons Logging框架进行日志记录。

编辑`etc/hadoop/log4j.properties`文件以自定义Hadoop守护程序的日志配置（日志格式等）。

# **操作Hadoop集群**

一旦所有必要的配置完成，将文件分发到所有机器上的`HADOOP_CONF_DIR`目录。

这应该是所有机器上相同的目录。

一般来说，建议HDFS和YARN以不同的用户身份运行。在大多数安装中，HDFS进程以'hdfs'用户执行，而YARN通常使用'yarn'帐户。

## **启动Hadoop**

要启动Hadoop集群，您需要同时启动HDFS和YARN集群。

第一次启动HDFS时，必须进行格式化。将新的分布式文件系统格式化为hdfs：

```bash
[hdfs]$ $HADOOP_HOME/bin/hdfs namenode -format
```

在指定的节点上以hdfs身份启动HDFS NameNode：

```bash
[hdfs]$ $HADOOP_HOME/bin/hdfs --daemon start namenode
```

在每个指定的节点上以hdfs身份启动HDFS DataNode：

```bash
[hdfs]$ $HADOOP_HOME/bin/hdfs --daemon start datanode
```

如果配置了`etc/hadoop/workers`和ssh信任访问（参见单节点设置），则可以使用实用程序脚本启动所有HDFS进程。以hdfs身份：

```bash
[hdfs]$ $HADOOP_HOME/sbin/start-dfs.sh
```

使用以下命令在指定的ResourceManager上以yarn身份启动YARN：

```bash
[yarn]$ $HADOOP_HOME/bin/yarn --daemon start resourcemanager
```

运行一个脚本，在每个指定的主机上以yarn身份启动NodeManager：

```bash
[yarn]$ $HADOOP_HOME/bin/yarn --daemon start nodemanager
```

启动一个独立的WebAppProxy服务器。在WebAppProxy服务器上以yarn身份运行。如果使用负载平衡的多个服务器，则应在每个服务器上运行：

```bash
[yarn]$ $HADOOP_HOME/bin/yarn --daemon start proxyserver
```

如果配置了`etc/hadoop/workers`和ssh信任访问（参见单节点设置），则可以使用实用程序脚本启动所有YARN进程。以yarn身份：

```bash
[yarn]$ $HADOOP_HOME/sbin/start-yarn.sh
```

使用以下命令在指定的服务器上以mapred身份启动MapReduce JobHistory Server：

```bash
[mapred]$ $HADOOP_HOME/bin/mapred --daemon start historyserver
```

这样，您的Hadoop集群就已经启动了。

## **关闭Hadoop**

使用以下命令在指定的NameNode上以hdfs身份停止NameNode：

```bash
[hdfs]$ $HADOOP_HOME/bin/hdfs --daemon stop namenode
```

运行一个脚本以hdfs身份停止DataNode：

```bash
[hdfs]$ $HADOOP_HOME/bin/hdfs --daemon stop datanode
```

如果配置了`etc/hadoop/workers`和ssh信任访问（参见单节点设置），则可以使用实用程序脚本停止所有HDFS进程。以hdfs身份：

```bash
[hdfs]$ $HADOOP_HOME/sbin/stop-dfs.sh
```

使用以下命令在指定的ResourceManager上以yarn身份停止ResourceManager：

```bash
[yarn]$ $HADOOP_HOME/bin/yarn --daemon stop resourcemanager
```

运行一个脚本以yarn身份停止worker上的NodeManager：

```bash
[yarn]$ $HADOOP_HOME/bin/yarn --daemon stop nodemanager
```

如果配置了`etc/hadoop/workers`和ssh信任访问（参见单节点设置），则可以使用实用程序脚本停止所有YARN进程。以yarn身份：

```bash
[yarn]$ $HADOOP_HOME/sbin/stop-yarn.sh
```

停止WebAppProxy服务器。在WebAppProxy服务器上以yarn身份运行。如果使用负载平衡的多个服务器，则应在每个服务器上运行：

```bash
[yarn]$ $HADOOP_HOME/bin/yarn stop proxyserver
```

使用以下命令在指定的服务器上以mapred身份停止MapReduce JobHistory Server：

```bash
[mapred]$ $HADOOP_HOME/bin/mapred --daemon stop historyserver
```

以上步骤将关闭您的Hadoop集群。

## **Web界面**

一旦Hadoop集群启动运行，可以通过以下方式检查组件的Web界面：

| 守护进程 | Web界面 | 说明 |
| --- | --- | --- |
| NameNode | [http://nn_host:port/](http://nn_host:port/) | 默认HTTP端口为9870。 |
| ResourceManager | [http://rm_host:port/](http://rm_host:port/) | 默认HTTP端口为8088。 |
| MapReduce JobHistory Server | [http://jhs_host:port/](http://jhs_host:port/) | 默认HTTP端口为19888。 |

在这些Web界面上，您可以查看有关Hadoop集群状态、任务执行情况等的详细信息。

# 参考资料

https://hadoop.apache.org/docs/stable/hadoop-project-dist/hadoop-common/ClusterSetup.html

* any list
{:toc}