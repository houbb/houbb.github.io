---
layout: post
title:  Apache Hadoop HDFS 快速搭建 HDFS 系统（超详细版） hdfs inaction
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


# 参考资料

## 节点介绍
首先，准备 5 台虚拟机，其中 1 台虚拟机作为NameNode，4 台虚拟机作为DataNode，分别为：

IP	Hosts（主机名）
192.168.56.101	master
192.168.56.102	slave1
192.168.56.103	slave2
192.168.56.104	slave3
192.168.56.105	slave4

在这里，master充当着NameNode的角色，其他的salve充当着DataNode的角色，并且需要修改这 5 台虚拟机上的hosts文件，配置它们的主机名，以便它们可以通过主机名进行互相的访问。

## 开始搭建 HDFS 系统

在前面，我们已经准备好了虚拟机；在此，我们还需要准备两个资源，分别为 Hadoop 和 JDK 安装包，可通过以下链接到官方获取：

JDK： [Java SE Development Kit 8u201](https://www.oracle.com/technetwork/java/javase/downloads/jdk8-downloads-2133151.html)
Hadoop：[Apache Hadoop Download](https://hadoop.apache.org/releases.html)

当上述两个安装包下载完成之后，可通过 Linux 命令，将两个安装包上传到虚拟机，例如

```
scp -r /Users/bin.guo/Downloads/hadoop-2.7.7.tar.gz root@192.168.56.101:/home/hdfs-cg
scp -r /Users/bin.guo/Downloads/jdk-8u201-linux-x64.tar.gz root@192.168.56.101:/home/hdfs-cg
```

## 基础环境变量配置

第 1 步：解压 Hadoop 安装包

```bash
tar -zxvf hadoop-2.7.7.tar.gz
```

第 2 步：配置 Hadoop 的 Java 运行环境

在当前目录解压完成后，进入/hadoop-2.7.3/etc/hadoop目录，这个目录里存放的都是 Hadoop 配置文件，当然，我们需要修改的配置文件也在这个目录中。接下来，编辑hadoop-env.sh文件，配置 Java 环境变量。

执行命令：vim hadoop-env.sh

指定其中的 JAVA_HOME

```
export JAVA_HOME=/home/hdfs-cg/jdk1.8.0_131
```

第 3 步：在 Linux 中配置 Hadoop 环境变量

编辑/etc/profile文件，配置 Hadoop 环境变量。

执行命令：vim /etc/profile

```bash
JAVA_HOME=/home/hdfs-cg/jdk1.8.0_131
PATH=$JAVA_HOME/bin:$PATH
CLASSPATH=.:$JAVA_HOME/lib/dt.jar:$JAVA_HOME/lib/tools.jar

export PATH
export JAVA_HOME
export CLASSPTH

export PATH=$PATH:/home/hdfs-cg/hadoop-2.7.3/bin:/home/hdfs-cg/hadoop-2.7.3/sbin
```

配置完 Hadoop 的环境变量之后，保存文件，并输入以下命令让profile文件立即生效。

执行命令：

```bash
source /etc/profile
```

正常情况下，输入source /etc/profile命令不会有任何提示；我们可以输入命令hadoop进行验证，如果出现以下内容，则说明 Hadoop 环境配置成功了。

```bash
hadoop version
```

## 免密登录

这个暂时不设置，手动处理。

## 配置 HDFS

在所有机器上的/hadoop-2.7.3/etc/hadoop目录中，修改core-site.xml和hdfs-site.xml文件，以完成 HDFS 的配置。

修改core-site.xml，在configuration标签内加入以下配置：

master 改为对应的机器节点。

```xml
<configuration>
<property>
  <name>fs.defaultFS</name>
  <value>hdfs://master:9000</value>
  <description>HDFS 的 URI，文件系统://namenode标识:端口</description>
</property>

<property>
  <name>hadoop.tmp.dir</name>
  <value>/home/hadoopData</value>
  <description>namenode 上传到 hadoop 的临时文件夹</description>
</property>

<property>
    <name>fs.trash.interval</name>
    <value>4320</value>
</property>
</configuration>
```

修改hdfs-site.xml，在configuration标签内加入以下配置：

```xml
<configuration>
<property>
   <name>dfs.namenode.name.dir</name>
   <value>/home/hadoopData/dfs/name</value>
   <description>datanode 上存储 hdfs 名字空间元数据</description>
 </property>
 
 <property>
   <name>dfs.datanode.data.dir</name>
   <value>/home/hadoopData/dfs/data</value>
   <description>datanode 上数据块的物理存储位置</description>
 </property>
 
 <property>
   <name>dfs.replication</name>
   <value>3</value>
   <description>副本个数，默认配置是 3，应小于 datanode 机器数量</description>
 </property>
 
 <property>
   <name>dfs.webhdfs.enabled</name>
   <value>true</value>
 </property>
 
 <property>
   <name>dfs.permissions.superusergroup</name>
   <value>staff</value>
 </property>
 
 <property>
   <name>dfs.permissions.enabled</name>
   <value>false</value>
 </property>
</configuration>
```

在这里，我们需要创建 Hadoop 存放数据的文件夹，为了与配置文件中的路径匹配，我们将在home目录下，创建名为hadoopData的文件夹。

执行命令：

```
mkdir /home/hadoopData
```

PS: 这里建议使用 /userPath/hadoop/data

当然，我们可以调整此文件夹的位置，只要保证其与配置文件的路径匹配即可。

## 配置 NameNode 节点

因为master机器是集群中的NameNode节点，因此我们在master机器上进行操作，也就是192.168.56.101这台主机。

在master机器的/hadoop-2.7.3/etc/hadoop目录下，修改slaves文件，加入DataNode节点。

特别注意，由于我们之前修改了hosts文件，各虚拟机的 IP 已经与主机名绑定，因此在这里，我们之前配置主机名即可。 

执行命令：


```bash
vim slaves
```

```vim
#把所有的 salve ip 放在这里。

#因为我们没有修改 hosts 文件，这个因为有些机器不让修改。

slave1-ip
slave2-ip
```

其中，slave1、slave2、slave3和slave4都是DataNode节点，我们把它们加入到NameNode节点中，这样我们就可以用一个命令启动整个集群。

### 格式化 NameNode 以及启动 HDFS 系统

在master这台机器上，输入命令 HDFS 格式化命令。

执行命令：

```bash
hdfs namenode -format
```

![view](https://img-blog.csdnimg.cn/20190315171019579.png)

格式化完成之后，输入 HDFS 系统启动命令。

执行命令：start-dfs.sh

![start](https://img-blog.csdnimg.cn/20190315171149493.png)

接下来，检查 HDFS 是否启动成功。

在游览器中输入http://192.168.56.101:50070/，默认为NameNode的IP + 50070端口，当你见到以下界面的时候，就说明你的集群已经起来了。

![HDFS](https://img-blog.csdnimg.cn/20190315171318244.png)

最后，再检查一下DataNode节点的启动情况：

![data-info](https://img-blog.csdnimg.cn/2019031517155142.png)

如上图所示，我们配置的 4 个DataNode也起来了，这说明整个 HDFS 集群搭建完成啦！

# 参考资料

https://hadoop.apache.org/docs/stable/hadoop-project-dist/hadoop-common/registry/index.html

[安装hadoop集群是否需要免密以及为什么需要](https://blog.csdn.net/ifenggege/article/details/123176712)

[关于Hadoop集群启动免密登录ssh的操作命令](https://blog.csdn.net/weixin_45937909/article/details/126630422)

[快速搭建 HDFS 系统（超详细版）](https://blog.csdn.net/qq_35246620/article/details/88576800)

* any list
{:toc}