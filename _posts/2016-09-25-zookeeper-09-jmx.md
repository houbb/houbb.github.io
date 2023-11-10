---
layout: post
title: ZooKeeper-09-JMX
date:  2016-09-25 12:21:05 +0800
categories: [Apache]
tags: [zookeeper, config-center]
published: true
---

# JMX

Apache ZooKeeper对JMX具有广泛的支持，使您可以查看和管理ZooKeeper服务集合。

本文档假定您具有JMX的基本知识。

有关设置VM实例的本地和远程管理的详细信息，请参见《JMX管理指南》。

默认情况下，随附的zkServer.sh仅支持本地管理-查看链接的文档以启用对远程管理的支持（超出本文档的范围）。

# 在启用JMX的情况下启动ZooKeeper

org.apache.zookeeper.server.quorum.QuorumPeerMain类将启动JMX可管理的ZooKeeper服务器。 

此类在初始化期间注册正确的MBean，以支持实例的JMX监视和管理。 

有关使用QuorumPeerMain启动ZooKeeper的示例，请参见bin/zkServer.sh。

# 运行JMX控制台

有许多JMX控制台可以连接到正在运行的服务器。在此示例中，我们将使用Sun的jconsole。

Java JDK附带了一个名为jconsole的简单JMX控制台，可用于连接到ZooKeeper并检查正在运行的服务器。使用QuorumPeerMain启动ZooKeeper之后，启动jconsole，通常驻留在JDK_HOME / bin / jconsole中

显示“新连接”窗口时，请连接到本地进程（如果jconsole与服务器在同一主机上启动）或使用远程进程连接。

默认情况下，将显示VM的“概述”选项卡（这是深入了解VM的好方法）。选择“ MBeans”选项卡。

现在，您应该在左侧看到org.apache.ZooKeeperService。展开此项，然后根据您启动服务器的方式，可以监视和管理与服务相关的各种功能。

还要注意，ZooKeeper还将注册log4j MBean。在左侧的同一部分，您将看到“ log4j”。扩展它以通过JMX管理log4j。特别令人感兴趣的是能够通过编辑附加程序和根阈值来动态更改使用的日志记录级别的功能。启动ZooKeeper时，可以通过将-Dzookeeper.jmx.log4j.disable = true传递给JVM来禁用Log4j MBean注册。另外，如果需要使用旧的MBean名称升级集成系统（log4j：hierarchy = default），则可以使用-Dzookeeper.jmx.log4j.mbean = log4j：hierarchy = default选项指定MBean的名称。 。

# ZooKeeper MBean参考

下表详细说明了参与复制的ZooKeeper集成（即非独立）的服务器的JMX。

 这是生产环境的典型情况。

```
MBean	MBean Object Name	Description
Quorum	ReplicatedServer_id<#>	Represents the Quorum, or Ensemble - parent of all cluster members. Note that the object name includes the "myid" of the server (name suffix) that your JMX agent has connected to.
LocalPeer/RemotePeer	replica.<#>	Represents a local or remote peer (ie server participating in the ensemble). Note that the object name includes the "myid" of the server (name suffix).
LeaderElection	LeaderElection	Represents a ZooKeeper cluster leader election which is in progress. Provides information about the election, such as when it started.
Leader	Leader	Indicates that the parent replica is the leader and provides attributes/operations for that server. Note that Leader is a subclass of ZooKeeperServer, so it provides all of the information normally associated with a ZooKeeperServer node.
Follower	Follower	Indicates that the parent replica is a follower and provides attributes/operations for that server. Note that Follower is a subclass of ZooKeeperServer, so it provides all of the information normally associated with a ZooKeeperServer node.
DataTree	InMemoryDataTree	Statistics on the in memory znode database, also operations to access finer (and more computationally intensive) statistics on the data (such as ephemeral count). InMemoryDataTrees are children of ZooKeeperServer nodes.
ServerCnxn	<session_id>	Statistics on each client connection, also operations on those connections (such as termination). Note the object name is the session id of the connection in hex form.
```

下表详细介绍了独立服务器的JMX。 

通常，独立版本仅在开发情况下使用。

MBeans, their names and description

```
MBean	MBean Object Name	Description
ZooKeeperServer	StandaloneServer_port<#>	Statistics on the running server, also operations to reset these attributes. Note that the object name includes the client port of the server (name suffix).
DataTree	InMemoryDataTree	Statistics on the in memory znode database, also operations to access finer (and more computationally intensive) statistics on the data (such as ephemeral count).
ServerCnxn	< session_id >	Statistics on each client connection, also operations on those connections (such as termination). Note the object name is the session id of the connection in hex form.
```

# 参考资料

https://zookeeper.apache.org/doc/r3.6.2/zookeeperJMX.html

* any list
{:toc}