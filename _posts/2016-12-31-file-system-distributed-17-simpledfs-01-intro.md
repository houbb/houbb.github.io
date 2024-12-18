---
layout: post
title: 分布式存储系统-17-simpleDFS Simple Distributed File System in java
date:  2016-12-31 10:48:42 +0800
categories: [File]
tags: [distributed, dfs, file]
published: true
---

# 前言

这个项目 star 不多，不过我直觉还不错。足够简单，适合学习。

# Simple Distributed File System

Simple Distributed File System是使用Java语言实现的，类似于Apache Hadoop HDFS的分布式文件系统，整体架构是如下所示。

![image](https://user-images.githubusercontent.com/25652335/147176238-21f68465-2ac6-47b5-a83e-b8115b25ae7e.png)

### Master节点
Master是SDFS的主节点，存储整个文件系统的结构目录，以及各个存储文件的分块元数据信息

### Work节点
Work是SDFS的工作节点，主要用来做实际的文件存储工作

Quick Start
------------
目前构建脚本还不够完善，建议使用IntelliJ IDEA导入启动  
1、git clone https://github.com/linweisen/SimpleDFS.git  
2、导入IntelliJ IDEA  
3、Master的启动类为org.simpledfs.master.Master,需要在输入参数中配置master-config.xml路径  
4、Work的启动类为org.simpledfs.work.Work,需要在输入参数中配置work-config.xml路径

整体项目目录结构如下
------------
```
SimpleDFS
├── README.md 
├── bin
│   └── start.sh
├── build.sh
├── conf
│   ├── master-config.xml
│   └── work-config.xml
├── logs
├── pom.xml
├── simple-dfs-client 
├── simple-dfs-core
├── simple-dfs-master
├── simple-dfs-work
```

其他说明
------------
源码在编写的过程中也参考借鉴了github上面大量开源项目中的代码，如果其中开源项目的作者认为代码有抄袭嫌疑，欢迎指出，本人会纠正删除


# 参考资料

https://github.com/linweisen/SimpleDFS

* any list
{:toc}