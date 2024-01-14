---
layout: post
title:  Apache Hadoop v3.3.6-02-Hadoop setting up a Single Node Cluster.
date:  2017-12-06 05:47:35 +0800
categories: [Apache]
tags: [apache, big-data, hadoop]
published: true
---

# 目的

本文档描述了如何设置和配置单节点 Hadoop 安装，以便您可以快速执行使用 Hadoop MapReduce 和 Hadoop 分布式文件系统（HDFS）进行简单操作。

重要提示：所有生产环境中的 Hadoop 集群都使用 Kerberos 对呼叫方进行身份验证，并安全地访问 HDFS 数据，以及限制对计算服务（YARN 等）的访问。

这些说明不涵盖与任何 Kerberos 服务的集成，-每个启动生产集群的人都应该将连接到他们组织的 Kerberos 基础设施作为部署的关键部分。

有关如何保护集群的详细信息，请参阅安全性。

# 先决条件

## 支持的平台

GNU/Linux 被支持作为开发和生产平台。Hadoop 已经在具有 2000 个节点的 GNU/Linux 集群上进行了演示。

## 所需软件

Linux 的所需软件包括：

必须安装 Java™。[推荐的 Java 版本在 HadoopJavaVersions 中有描述](https://cwiki.apache.org/confluence/display/HADOOP/Hadoop+Java+Versions)。

必须安装 ssh，并且 sshd 必须运行，以便使用管理远程 Hadoop 守护程序的 Hadoop 脚本，如果要使用可选的启动和停止脚本。

此外，建议安装 pdsh 以获取更好的 ssh 资源管理。

## 安装软件

如果您的集群没有所需的软件，您需要安装它。

例如，在 Ubuntu Linux 上：

```bash
$ sudo apt-get install ssh
$ sudo apt-get install pdsh
```

# 下载

要获取 Hadoop 发行版，请从 [Apache 下载镜像之一下载最新的稳定版本](http://www.apache.org/dyn/closer.cgi/hadoop/common/)。

## 实战笔记

在 [https://dlcdn.apache.org/hadoop/common/hadoop-3.3.6/](https://dlcdn.apache.org/hadoop/common/hadoop-3.3.6/) 下载

```
[PARENTDIR] Parent Directory                                        -   
[TXT] CHANGELOG.md                       2023-06-25 23:35   22K  
[TXT] CHANGELOG.md.asc                   2023-06-25 23:35  833   
[TXT] CHANGELOG.md.sha512                2023-06-25 23:35  153   
[TXT] RELEASENOTES.md                    2023-06-25 23:35  1.4K  
[TXT] RELEASENOTES.md.asc                2023-06-25 23:35  833   
[TXT] RELEASENOTES.md.sha512             2023-06-25 23:35  156   
[   ] hadoop-3.3.6-aarch64.tar.gz        2023-06-25 23:35  710M  
[TXT] hadoop-3.3.6-aarch64.tar.gz.asc    2023-06-25 23:35  833   
[TXT] hadoop-3.3.6-aarch64.tar.gz.sha512 2023-06-25 23:35  164   
[TXT] hadoop-3.3.6-rat.txt               2023-06-25 23:35  2.0M  
[TXT] hadoop-3.3.6-rat.txt.asc           2023-06-25 23:35  833   
[TXT] hadoop-3.3.6-rat.txt.sha512        2023-06-25 23:35  165   
[   ] hadoop-3.3.6-site.tar.gz           2023-06-25 23:35   41M  
[TXT] hadoop-3.3.6-site.tar.gz.asc       2023-06-25 23:35  833   
[TXT] hadoop-3.3.6-site.tar.gz.sha512    2023-06-25 23:35  169   
[   ] hadoop-3.3.6-src.tar.gz            2023-06-25 23:35   36M  
[TXT] hadoop-3.3.6-src.tar.gz.asc        2023-06-25 23:35  833   
[TXT] hadoop-3.3.6-src.tar.gz.sha512     2023-06-25 23:35  168   
[   ] hadoop-3.3.6.tar.gz                2023-06-25 23:35  696M  
[TXT] hadoop-3.3.6.tar.gz.asc            2023-06-25 23:35  833   
[TXT] hadoop-3.3.6.tar.gz.sha512         2023-06-25 23:35  164   
```

下载命令：

```bash
wget https://dlcdn.apache.org/hadoop/common/hadoop-3.3.6/hadoop-3.3.6.tar.gz
```

解压

```bash
tar -zxvf hadoop-3.3.6.tar.gz
```

对应的路径：

```
/home/houbinbin/hadoop/hadoop-3.3.6

$ l
LICENSE-binary  LICENSE.txt  NOTICE-binary  NOTICE.txt  README.txt  bin/  etc/  include/  lib/  libexec/  licenses-binary/  sbin/  share/
```

# 准备启动 Hadoop 集群

解压下载的 Hadoop 发行版。

在发行版中，编辑文件 etc/hadoop/hadoop-env.sh，定义一些参数如下：

```bash
# 设置为您的 Java 安装的根目录
export JAVA_HOME=/usr/java/latest
```

尝试以下命令：

```bash
$ bin/hadoop
```

这将显示 hadoop 脚本的使用文档。

现在，您可以在三种支持的模式之一中启动 Hadoop 集群：

1. [本地（独立）模式 ](https://hadoop.apache.org/docs/stable/hadoop-project-dist/hadoop-common/SingleCluster.html#Standalone_Operation)
2. [伪分布式模式](https://hadoop.apache.org/docs/stable/hadoop-project-dist/hadoop-common/SingleCluster.html#Pseudo-Distributed_Operation)
3. [完全分布式模式](https://hadoop.apache.org/docs/stable/hadoop-project-dist/hadoop-common/SingleCluster.html#Fully-Distributed_Operation)


## WSL 实战笔记

- 编辑 etc/hadoop/hadoop-env.sh

```
$ echo $JAVA_HOME
/home/houbinbin/.sdkman/candidates/java/current
```

编辑文件 etc/hadoop/hadoop-env.sh，定义一些参数如下：

```bash
# 设置为您的 Java 安装的根目录
# The java implementation to use. By default, this environment
# variable is REQUIRED on ALL platforms except OS X!
export JAVA_HOME=/home/houbinbin/.sdkman/candidates/java/current
```

- 测试效果

```bash
$ cd /home/houbinbin/hadoop/hadoop-3.3.6
$ bin/hadoop

Usage: hadoop [OPTIONS] SUBCOMMAND [SUBCOMMAND OPTIONS]
 or    hadoop [OPTIONS] CLASSNAME [CLASSNAME OPTIONS]
  where CLASSNAME is a user-provided Java class

  OPTIONS is none or any of:

--config dir                     Hadoop config directory
--debug                          turn on shell script debug mode
--help                           usage information
buildpaths                       attempt to add class files from build tree
hostnames list[,of,host,names]   hosts to use in worker mode
hosts filename                   list of hosts to use in worker mode
loglevel level                   set the log4j level for this command
workers                          turn on worker mode
```

# 独立操作 Standalone Operation

默认情况下，Hadoop 配置为以非分布模式运行，作为一个单独的 Java 进程。

这对于调试很有用。

以下示例将解压缩的 conf 目录复制为输入，然后查找并显示给定正则表达式的每个匹配项。输出被写入给定的输出目录。

```bash
$ mkdir input
$ cp etc/hadoop/*.xml input
$ bin/hadoop jar share/hadoop/mapreduce/hadoop-mapreduce-examples-3.3.6.jar grep input output 'dfs[a-z.]+'
$ cat output/*
```

这将创建一个 input 目录，将 Hadoop 配置文件复制到该目录，然后运行一个 grep 任务来查找匹配正则表达式 'dfs[a-z.]+' 的内容，并将结果写入 output 目录。

最后，通过 `cat output/*` 命令来查看输出结果。

## 实战笔记

```bash
cd /home/houbinbin/hadoop/hadoop-3.3.6
mkdir input
cp etc/hadoop/*.xml input
bin/hadoop jar share/hadoop/mapreduce/hadoop-mapreduce-examples-3.3.6.jar grep input output 'dfs[a-z.]+'
cat output/*
```

结果如下：

```
1       dfsadmin
```

# **伪分布式操作**

Hadoop也可以在伪分布式模式下在单节点上运行，其中每个Hadoop守护程序在单独的Java进程中运行。

## **配置**

使用以下配置：

`etc/hadoop/core-site.xml`：

```xml
<configuration>
    <property>
        <name>fs.defaultFS</name>
        <value>hdfs://localhost:9000</value>
    </property>
</configuration>
```

`etc/hadoop/hdfs-site.xml`：

```xml
<configuration>
    <property>
        <name>dfs.replication</name>
        <value>1</value>
    </property>
</configuration>
```

## **设置免密登录**

现在检查是否可以在没有密码的情况下通过ssh连接到本地主机：

```bash
$ ssh localhost
```

如果无法在没有密码的情况下通过ssh连接到本地主机，请执行以下命令：

```bash
$ ssh-keygen -t rsa -P '' -f ~/.ssh/id_rsa
$ cat ~/.ssh/id_rsa.pub >> ~/.ssh/authorized_keys
$ chmod 0600 ~/.ssh/authorized_keys
```

这样，你就可以在伪分布式模式下配置Hadoop，并设置免密登录。

## **执行**

以下是在本地运行MapReduce作业的说明。如果你想在YARN上执行作业，请参阅单节点上的YARN。

格式化文件系统：

```bash
$ bin/hdfs namenode -format
```

启动NameNode守护程序和DataNode守护程序：

```bash
$ sbin/start-dfs.sh
```

Hadoop守护程序的日志输出被写入到$HADOOP_LOG_DIR目录（默认为$HADOOP_HOME/logs）。

浏览NameNode的Web界面；默认情况下，它位于：

NameNode - http://localhost:9870/

创建执行MapReduce作业所需的HDFS目录：

```bash
$ bin/hdfs dfs -mkdir -p /user/<username>
```

将输入文件复制到分布式文件系统：

```bash
$ bin/hdfs dfs -mkdir input
$ bin/hdfs dfs -put etc/hadoop/*.xml input
```

运行提供的一些示例：

```bash
$ bin/hadoop jar share/hadoop/mapreduce/hadoop-mapreduce-examples-3.3.6.jar grep input output 'dfs[a-z.]+'
```

检查输出文件：将输出文件从分布式文件系统复制到本地文件系统并查看它们：

```bash
$ bin/hdfs dfs -get output output
$ cat output/*
```

或者

在分布式文件系统上查看输出文件：

```bash
$ bin/hdfs dfs -cat output/*
```

完成后，使用以下命令停止守护程序：

```bash
$ sbin/stop-dfs.sh
```

# **在单节点上运行YARN**

你可以通过设置一些参数并运行ResourceManager守护程序和NodeManager守护程序，以伪分布式模式在YARN上运行MapReduce作业。

以下说明假设上述说明的1.到4.步骤已经执行。

配置参数如下：

`etc/hadoop/mapred-site.xml`：

```xml
<configuration>
    <property>
        <name>mapreduce.framework.name</name>
        <value>yarn</value>
    </property>
    <property>
        <name>mapreduce.application.classpath</name>
        <value>$HADOOP_MAPRED_HOME/share/hadoop/mapreduce/*:$HADOOP_MAPRED_HOME/share/hadoop/mapreduce/lib/*</value>
    </property>
</configuration>
```

`etc/hadoop/yarn-site.xml`：

```xml
<configuration>
    <property>
        <name>yarn.nodemanager.aux-services</name>
        <value>mapreduce_shuffle</value>
    </property>
    <property>
        <name>yarn.nodemanager.env-whitelist</name>
        <value>JAVA_HOME,HADOOP_COMMON_HOME,HADOOP_HDFS_HOME,HADOOP_CONF_DIR,CLASSPATH_PREPEND_DISTCACHE,HADOOP_YARN_HOME,HADOOP_HOME,PATH,LANG,TZ,HADOOP_MAPRED_HOME</value>
    </property>
</configuration>
```

启动ResourceManager守护程序和NodeManager守护程序：

```bash
$ sbin/start-yarn.sh
```

浏览ResourceManager的Web界面；默认情况下，它位于：

ResourceManager - http://localhost:8088/

运行一个MapReduce作业。

完成后，使用以下命令停止守护程序：

```bash
$ sbin/stop-yarn.sh
```

# **完全分布式操作**

有关设置完全分布式、非平凡集群的信息，请参阅 ["Cluster Setup"](https://hadoop.apache.org/docs/stable/hadoop-project-dist/hadoop-common/ClusterSetup.html)。

# 参考资料

https://hadoop.apache.org/docs/stable/hadoop-project-dist/hadoop-common/SingleCluster.html

* any list
{:toc}