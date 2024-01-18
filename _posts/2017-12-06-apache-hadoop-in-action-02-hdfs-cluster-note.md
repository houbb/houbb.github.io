---
layout: post
title:  Apache Hadoop v3.3.6 in action-02-cluster mode 集群部署实战
date:  2017-12-06 05:47:35 +0800
categories: [Apache]
tags: [apache, big-data, hadoop]
published: true
---

# hadoop 版本

> [https://cwiki.apache.org/confluence/display/HADOOP/Hadoop+Java+Versions](https://cwiki.apache.org/confluence/display/HADOOP/Hadoop+Java+Versions)

## Supported Java Versions

Apache Hadoop 3.3 and upper supports Java 8 and Java 11 (runtime only)
Please compile Hadoop with Java 8. Compiling Hadoop with Java 11 is not supported:  HADOOP-16795 - Java 11 compile support OPEN
Apache Hadoop from 3.0.x to 3.2.x now supports only Java 8
Apache Hadoop from 2.7.x to 2.10.x support both Java 7 and 8

需要 jdk 的环境为 jdk8。

# 安装实战

## 节点设计

我们可以选择 3台机器，1台 nameNode（master），2台 dataNode（slave）。

在这里，master充当着NameNode的角色，其他的salve充当着DataNode的角色，并且需要修改这 5 台虚拟机上的hosts文件，配置它们的主机名，以便它们可以通过主机名进行互相的访问。

##  下载

[https://www.oracle.com/java/technologies/downloads/#java8](https://www.oracle.com/java/technologies/downloads/#java8)

在 [https://dlcdn.apache.org/hadoop/common/hadoop-3.3.6/](https://dlcdn.apache.org/hadoop/common/hadoop-3.3.6/) 下载


选择：https://www.oracle.com/java/technologies/downloads/#license-lightbox




# 为什么需要免密登录？

安装hadoop一般有两种方法：

手动安装。手动在多台机器上安装master、slave
通过管理平台安装。通过CDH/HDP安装
手动安装时是需要配置免密登录的。有以下两点原因：

配置免密后，执行ssh或者scp时不需要输密码，方便快捷。这点不是必要的原因。

安装集群完成后，通常在master侧执行start-all.sh脚本来启动整个集群，脚本会ssh到各个slave来执行启动命令。如果没有配置免密，那么启停集群时要手动输入很多密码，这是致命的。

通过cdh安装hadoop集群，这个免密不是必须的。通常配置免密，也是为了便于传输文件和维护集群。启停集群的时候是通过对应的agent去执行的。


# Hadoop-3.3.6分布式集群搭建步骤

## 1.下载JDK8

[Linux 安装Openjdk](https://www.cnblogs.com/fanqisoft/p/16949738.html)

## 2.下载Hadoop3.3.6

[Hadoop 安装及环境变量配置](https://www.cnblogs.com/fanqisoft/p/17857272.html)

## 创建hadoop数据存储的目录

```bash
mkdir -p /opt/hadoop/tmp /opt/hadoop/hdfs/data /opt/hadoop/hdfs/name
```

## 4.配置hostname和host文件

```bash
hostnamectl set-hostname {hostName}
vim /etc/hosts
192.168.58.130  {hostName}
192.168.58.131  {hostName}
192.168.58.132  {hostName}
```

## 5.配置集群间免密登录

```bash
ssh-keygen -t rsa //生成密钥对
ssh-copy-id 192.168.58.131 //复制 SSH 公钥到远程计算机
```

## 6.关闭系统防火墙

```bash
sudo ufw enable //开启
sudo ufw disable //关闭
sudo ufw status //查看状态
```

# 7.分布式集群搭建

## 1.集群部署规划

注意：

NameNode和SecondaryNameNode不要安装在用一台服务器上

ResourceManager也很消耗内存，不要和NameNode、SecondaryNameNode配置在同一台服务器上。

Hadoop02(192.168.58.130)	Hadoop03(192.168.58.131)	Hadoop04(192.168.58.132)
HDFS	NameNode、DataNode	DataNode	SecondaryNameNode、DataNode
YARN	NodeManager	ResourceManager、NodeManager	NodeManager

## 2.配置文件说明

Hadoop配置文件分两类：默认配置文件和自定义配置文件，只有用户想修改某一默认配置值时，才需要修改自定义配置文件，更改相应属性值。

### 1.默认配置文件

要获取的默认文件	 文件存放在Hadoop的jar包中的位置
core-default.xml	hadoop-common-3.3.6.jar/core-default.xml
hdfs-default.xml	hadoop-hdfs-3.3.6.jar/hdfs-default.xml
yarn-default.xml	hadoop-yarn-common-3.3.6.jar/yarn-default.xml
mapred-default.xml	hadoop-mapreduce-client-core-3.3.6.jar/mapred-default.xml

### 2.自定义配置文件

core-site.xml、hdfs-site.xml、yarn-site.xml、mapred-site.xml 四个配置存放在$HADOOP_HOME/etc/hadoop这个路径上，用户可以根据项目需求重新进行修改配置。

1.core-site.xml

```xml
<?xml version="1.0" encoding="UTF-8"?>
<?xml-stylesheet type="text/xsl" href="configuration.xsl"?>
<configuration>
    <!-- 指定NameNode的地址,端口一般有8020、9000、9820 -->
    <property>
        <name>fs.defaultFS</name>
        <value>hdfs://192.168.58.130:8020</value>
    </property>
    <!-- 指定Hadoop临时数据的存储目录 -->
    <property>
        <name>hadoop.tmp.dir</name>
        <value>/opt/hadoop/tmp</value>
    </property>
    <!-- 设置HDFS网页登录使用的静态用户为root -->
    <property>
        <name>hadoop.http.staticuser.user</name>
        <value>root</value>
    </property>
</configuration>
```

2.hdfs-site.xml

说明：如果不修改hosts，而是直接指定 ip 地址。dataNode 注册可能会报错：

```
hadoop 使用ip配置导致hdfs启动失败 Datanode denied communication with namenode
```

原因：由于配置hadoop没有使用host+hostName的配置方式，导致了hadoop无法解析DataNode，对DataNode的注册失败。

解决方式：hdfs-site.xml中添加

```xml
<property>
  <name>dfs.namenode.datanode.registration.ip-hostname-check</name>
  <value>false</value>
</property>
```

常规配置：

```xml
<?xml version="1.0" encoding="UTF-8"?>
<?xml-stylesheet type="text/xsl" href="configuration.xsl"?>

<configuration>
	<!-- 设置NameNode Web端访问地址 -->
	<property>
		<name>dfs.namenode.http-address</name>
		<value>192.168.58.130:9870</value>
	</property>

	<!-- 设置SecondNameNode Web端访问地址 -->
	<property>
		<name>dfs.namenode.secondary.http-address</name>
		<value>192.168.58.132:9870</value>
	</property>

	<!-- 配置NameNode 元数据存放位置-->
	<property>
		<name>dfs.namenode.name.dir</name>
		<value>/opt/hadoop/hdfs/name</value>
	</property>

	<!-- 配置DataNode在本地磁盘存放block的位置-->
	<property>
		<name>dfs.datanode.data.dir</name>
		<value>/opt/hadoop/hdfs/data</value>
	</property>

	<!-- 配置数据块的副本数,配置默认是3,应小于DataNode机器数量-->
	<property>
		<name>dfs.replication</name>
		<value>3</value>
	</property>

	<!-- SecondNameNode CheckPoint 相关配置-->

	<!-- SecondNameNode每隔1小时(3600s)执行一次 -->
	<property>
		<name>dfs.namenode.checkpoint.period</name>
		<value>3600</value>
	</property>

	<!-- 当NameNode操作次数达到1百万时,SecondNameNode 执行一次-->
	<property>
		<name>dfs.namenode.checkpoint.txns</name>
		<value>1000000</value>
	</property>

	<!-- 每分钟(60s),SecondNameNode检查一次NameNode的操作次数 -->
	<property>
		<name>dfs.namenode.checkpoint.check.period</name>
		<value>60</value>
	</property>

	<!--DataNode向NameNode上报当前块信息的时间间隔,默认为6小时-->
	<property>
		<name>dfs.blockreport.intervalMsec</name>
		<value>21600000</value>
	</property>

	<!--DataNode扫描自身节点块信息列表的时间,默认为6小时-->
	<property>
		<name>dfs.datanode.directoryscan.interval</name>
		<value>21600</value>
	</property>

	<!--DataNode 心跳超时相关配置-->
	<!--TimeOut = 2 * (dfs.namenode.heartbeat.recheck-interval) + 10 * (dfs.heartbeat.interval)-->
	<!--毫秒单位，默认为5分钟-->
	<property>
		<name>dfs.namenode.heartbeat.recheck-interval</name>
		<value>300000</value>
	</property>
	<!--秒单位，默认为3秒-->
	<property>
		<name>dfs.heartbeat.interval</name>
		<value>3</value>
	</property>
</configuration>
```

3.mapred-site.xml

```xml
<?xml version="1.0"?>
<?xml-stylesheet type="text/xsl" href="configuration.xsl"?>

<configuration>
    <!-- 设置MapReduce程序默认运行模式： yarn集群模式 local本地模式 -->
    <property>
        <name>mapreduce.framework.name</name>
        <value>yarn</value>
    </property>

    <!-- 设置 MapReduce历史服务器端地址 -->
    <property>
        <name>mapreduce.jobhistory.address</name>
        <value>192.168.58.130:10020</value>
    </property>
    <!-- 设置 MapReduce 历史服务器web端地址 -->
    <property>
        <name>mapreduce.jobhistory.webapp.address</name>
        <value>192.168.58.130:19888</value>
    </property>

</configuration>
```

4.yarn-site.xml

```xml
<?xml version="1.0"?>

<configuration>
  <!-- 指定MR 使用那种协议,默认是空值,推荐使用 mapreduce_shuffle-->
  <property>
    <name>yarn.nodemanager.aux-services</name>
    <value>mapreduce_shuffle</value>
  </property>

  <!-- 指定ResourceManager的地址 -->
  <property>
    <name>yarn.resourcemanager.hostname</name>
    <value>192.168.58.131</value>
  </property>

  <!-- 环境变量的继承 -->
  <property>
    <name>yarn.nodemanager.env-whitelist</name>
    <value>JAVA_HOME,HADOOP_COMMON_HOME,HADOOP_HDFS_HOME,HADOOP_CONF_DIR,CLASSPATH_PREPEND_DISTCACHE,HADOOP_YARN_HOME,HADOOP_HOME,PATH,LANG,TZ,HADOOP_MAPRED_HOME</value>
  </property>

  <!-- 开启日志聚集功能 -->
  <property>
    <name>yarn.log-aggregation-enable</name>
    <value>true</value>
  </property>

  <!-- 设置日志聚集服务器地址 -->
  <property>
    <name>yarn.log.server.url</name>
    <value>http://192.168.58.130:19888/jobhistory/logs</value>
  </property>

  <!-- 设置日志保留时间为7天 -->
  <property>
    <name>yarn.log-aggregation.retain-seconds</name>
    <value>604800</value>
  </property>

</configuration>
```

## 3.配置workers

位于$HADOOP_HOME/etc/hadoop/workers

```
192.168.58.130
192.168.58.131
192.168.58.132
```

## 4.配置hadoop-env.sh

位于$HADOOP_HOME/etc/hadoop/hadoop-env.sh

添加如下内容

```sh
export JAVA_HOME=/usr/java/jdk8u392-b08
export HADOOP_HOME=/usr/hadoop/hadoop-3.3.6
export HDFS_NAMENODE_USER=root
export HDFS_DATANODE_USER=root
export HDFS_SECONDARYNAMENODE_USER=root
export YARN_RESOURCEMANAGER_USER=root
export YARN_NODEMANAGER_USER=root
```

# 4.启动集群

## 1.初始化NameNode[首次启动]

如果集群是第一次启动，需要在 nameNode 主节点格式化NameNode(在hadoop02节点上配置了NameNode)(注意：格式化NameNode，会产生新的集群id，导致NameNode和DataNode的集群id不一致，集群找不到以往数据。如果集群在运行过程中报错，需要重新格式化NameNode的话，一定要先停止NameNode和DataNode进程，并且要删除所有机器的data和logs目录，然后再进行格式化。)

```bash
hdfs namenode -format
```

## 2.启动HDFS

位于$HADOOP_HOME/sbin/start-dfs.sh

```bash
sbin/start-dfs.sh
```

日志：

```
Starting namenodes on [hadoop02]
Starting datanodes
192.168.58.132: WARNING: /usr/hadoop/hadoop-3.3.6/logs does not exist. Creating.
192.168.58.131: WARNING: /usr/hadoop/hadoop-3.3.6/logs does not exist. Creating.
Starting secondary namenodes [hadoop04]
```

## 3.查看启动效果

三台机器，分别执行 `jps`

hadoop02

```
2112 Jps
1761 NameNode
1866 DataNode
```

hadoop03

```
1235 DataNode
1311 Jps
```

hadoop04

```
1233 SecondaryNameNode
1173 DataNode
1322 Jps
```

### web端查看HDFS的NameNode

访问：http://192.168.58.130:9870/ 查看效果

## 4.在配置了ResourceManager的节点(hadoop03)启动YARN

位于 $HADOOP_HOME/sbin/start-yarn.sh

```sh
sbin/start-yarn.sh
```

日志：

```
Starting resourcemanager
Starting nodemanagers
```

### 效果查看

```
jps
```

如下：

```
1873 Jps
1235 DataNode
1428 ResourceManager
1526 NodeManager
```

# 参考资料

https://hadoop.apache.org/docs/stable/hadoop-project-dist/hadoop-common/registry/index.html

[安装hadoop集群是否需要免密以及为什么需要](https://blog.csdn.net/ifenggege/article/details/123176712)

[关于Hadoop集群启动免密登录ssh的操作命令](https://blog.csdn.net/weixin_45937909/article/details/126630422)

[快速搭建 HDFS 系统（超详细版）](https://blog.csdn.net/qq_35246620/article/details/88576800)

[Hadoop-3.3.6分布式集群搭建步骤](https://www.cnblogs.com/fanqisoft/p/17859086.html)

* any list
{:toc}