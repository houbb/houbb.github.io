---
layout: post
title: ZooKeeper-00-入门使用介绍 windows 安装 
date:  2016-09-25 12:21:05 +0800
categories: [Apache]
tags: [zookeeper, config-center]
published: true
---


# Zookeeper

Apache ZooKeeper 致力于开发和维护一个开源服务器，该服务器支持高度可靠的分布式协调。

> [zookeeper](http://zookeeper.apache.org/)

> [quick start](https://zookeeper.apache.org/doc/r3.4.10/zookeeperStarted.html)

## Download

[Download](http://apache.fayea.com/zookeeper) the zookeeper, unzip it.

or

```
$   wget http://apache.fayea.com/zookeeper/zookeeper-3.4.9/zookeeper-3.4.9.tar.gz
```

## Add Server1

- Add ```server1``` package

```
$   cd /Users/houbinbin/it/tools/zookeeper/server1
$   ls

data		logs		zookeeper-3.4.9
```

- Add file ```myid```

add file ```myid``` in **data** package, and it's content is

```
1
```

- Edit zookeeper-3.4.9/conf

```
$   /Users/houbinbin/it/tools/zookeeper/server1/zookeeper-3.4.9/conf
$   ls
configuration.xsl	log4j.properties	zoo_sample.cfg

$   cp zoo_sample.cfg zoo.cfg
```

- Edit the ```zoo.cfg```

add these content

```
# the data and log dir
dataDir=/Users/houbinbin/it/tools/zookeeper/server1/data
dataLogDir=/Users/houbinbin/it/tools/zookeeper/server1/logs

# the port at which the clients will connect
clientPort=2181
```

## Add server2

如果您想在一台PC上测试群集管理器，可以这样做：

服务器2与服务器1相同。

- Then, edit ```zoo.cfg```

```
# the data and log dir
dataDir=/Users/houbinbin/it/tools/zookeeper/server2/data
dataLogDir=/Users/houbinbin/it/tools/zookeeper/server2/logs

# the port at which the clients will connect
clientPort=2182
```

- Add file ```myid```

with the content of

```
2
```

## Start & Stop

- start

```
houbinbindeMacBook-Pro:bin houbinbin$ pwd
/Users/houbinbin/it/tools/zookeeper/server1/zookeeper-3.4.9/bin

houbinbindeMacBook-Pro:bin houbinbin$ ls
README.txt	zkCli.cmd	zkEnv.cmd	zkServer.cmd
zkCleanup.sh	zkCli.sh	zkEnv.sh	zkServer.sh

houbinbindeMacBook-Pro:bin houbinbin$ sh zkServer.sh start
ZooKeeper JMX enabled by default
Using config: /Users/houbinbin/it/tools/zookeeper/server1/zookeeper-3.4.9/bin/../conf/zoo.cfg
-n Starting zookeeper ...
STARTED
```

- status

If you see the ```QuorumPeerMain```, that's meaning you are success.

```
houbinbindeMacBook-Pro:bin houbinbin$ jps
1920 Jps
531
1913 QuorumPeerMain
```

- stop

```
houbinbindeMacBook-Pro:bin houbinbin$ sh zkServer.sh stop
ZooKeeper JMX enabled by default
Using config: /Users/houbinbin/it/tools/zookeeper/server1/zookeeper-3.4.9/bin/../conf/zoo.cfg
-n Stopping zookeeper ...
STOPPED
```


# In Windows

> [zookeeper 安装 windows环境](http://blog.csdn.net/morning99/article/details/40426133)

一、下载并解压

(win7)

当前解压路径为 `D:\Learn\apache\zookeeper\zookeeper-3.4.6\`


二、配置

在 **conf** 文件夹下添加配置文件，如果启动有报错提示cfg文件有错误，可以用 `zoo_sample.cfg` 内容替代 

- `zoo.cfg`

```properties
# The number of milliseconds of each tick  心跳间隔 毫秒每次
tickTime=2000

# The number of ticks that the initial
# synchronization phase can take
initLimit=10

# The number of ticks that can pass between
# sending a request and getting anacknowledgement
syncLimit=5

# the directory where the snapshot isstored.  //镜像数据位置
dataDir=D:\\Learn\\apache\\zookeeper\\data

#日志位置
dataLogDir=D:\\Learn\\apache\\zookeeper\\log

# the port at which the clients willconnect  客户端连接的端口
clientPort=2181
```

三、运行 

```
[D:\Learn\apache\zookeeper\zookeeper-3.4.6\bin]$ zkServer.cmd
...
```

- 另开一个窗口

```
[D:\Learn\apache\zookeeper\zookeeper-3.4.6\bin]$ jps
5200 RemoteJdbcServer
12068 RemoteMavenServer
11416 
13928 
9784 Jps
13036 QuorumPeerMain
6412 RemoteJdbcServer
```

- 启动客户端

```
[D:\Learn\apache\zookeeper\zookeeper-3.4.6\bin]$ zkCli.cmd -server 127.0.0.1:2181
...
```

# windows10 安装笔记

## 下载

从 [https://zookeeper.apache.org/releases.html](https://zookeeper.apache.org/releases.html) 选择你需要的版本。

我下载的是 [https://mirror.bit.edu.cn/apache/zookeeper/zookeeper-3.6.2/apache-zookeeper-3.6.2-bin.tar.gz](https://mirror.bit.edu.cn/apache/zookeeper/zookeeper-3.6.2/apache-zookeeper-3.6.2-bin.tar.gz)

这里有一个坑，一定要下载 bin.tar.gz 的，否则会报错找不到执行类。

## 解压

我把压缩文件直接解压到下面的路径：

```
D:\tool\zookeeper\apache-zookeeper-3.6.2-bin
```

## 配置

到 D:\tool\zookeeper\apache-zookeeper-3.6.2-bin\conf 路径下，复制 `zoo_sample.cfg` 为 `zoo.cfg`，内容如下：

```properties
# The number of milliseconds of each tick  心跳间隔 毫秒每次
tickTime=2000
# The number of ticks that the initial 
# synchronization phase can take
initLimit=10
# The number of ticks that can pass between 
# sending a request and getting an acknowledgement
syncLimit=5
# the directory where the snapshot is stored.
# do not use /tmp for storage, /tmp here is just 
# example sakes.
# 指定了日志和数据的路径
dataDir=D:\\tool\\zookeeper\\data
dataLogDir=D:\\tool\\zookeeper\\log

# the port at which the clients will connect  客户端连接的端口
clientPort=2181
# the maximum number of client connections.
# increase this if you need to handle more clients
#maxClientCnxns=60
#
# Be sure to read the maintenance section of the 
# administrator guide before turning on autopurge.
#
# http://zookeeper.apache.org/doc/current/zookeeperAdmin.html#sc_maintenance
#
# The number of snapshots to retain in dataDir
#autopurge.snapRetainCount=3
# Purge task interval in hours
# Set to "0" to disable auto purge feature
#autopurge.purgeInterval=1

## Metrics Providers
#
# https://prometheus.io Metrics Exporter
#metricsProvider.className=org.apache.zookeeper.metrics.prometheus.PrometheusMetricsProvider
#metricsProvider.httpPort=7000
#metricsProvider.exportJvmInfo=true
```

大部分配置保持原样即可，我们新增了数据和日志的路径，如下:

```
dataDir=D:\\tool\\zookeeper\\data
dataLogDir=D:\\tool\\zookeeper\\log
```

## 启动

到 D:\tool\zookeeper\apache-zookeeper-3.6.2-bin\bin 路径下，执行命令：

```
zkServer.cmd
```

## 查看

```
λ jps
6736
9360 QuorumPeerMain
13012 Jps
8828 RemoteMavenServer36
```

QuorumPeerMain 就是 zk 对应的类

# 参考资料

[zookeeper-3.5.5安装报错：找不到或无法加载主类 org.apache.zookeeper.server.quorum.QuorumPeerMain-新版本zookeeper易犯错误](https://blog.csdn.net/jiangxiulilinux/article/details/96433560)

* any list
{:toc}