---
layout: post
title:  Apache Hadoop HDFS 快速搭建 HDFS 系统（超详细版）
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

https://hadoop.apache.org/docs/stable/hadoop-project-dist/hadoop-common/registry/index.html

[安装hadoop集群是否需要免密以及为什么需要](https://blog.csdn.net/ifenggege/article/details/123176712)

[关于Hadoop集群启动免密登录ssh的操作命令](https://blog.csdn.net/weixin_45937909/article/details/126630422)

[快速搭建 HDFS 系统（超详细版）](https://blog.csdn.net/qq_35246620/article/details/88576800)

* any list
{:toc}