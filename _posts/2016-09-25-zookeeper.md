---
layout: post
title: ZooKeeper
date:  2016-09-25 12:21:05 +0800
categories: [Apache]
tags: [zookeeper]
published: true
---



# Zookeeper

Apache ZooKeeper is an effort to develop and maintain an open-source server which enables highly reliable distributed coordination.

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

If you want to test Cluster manager in one PC, you can do it like this:

server2 is the same as server1.

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

* any list
{:toc}