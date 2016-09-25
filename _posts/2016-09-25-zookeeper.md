---
layout: post
title: ZooKeeper
date:  2016-09-25 12:21:05 +0800
categories: [Apache]
tags: [zookeeper]
published: true
---

* any list
{:toc}


# Zookeeper

Apache ZooKeeper is an effort to develop and maintain an open-source server which enables highly reliable distributed coordination.

> [zookeeper](http://zookeeper.apache.org/)

## Download

[Download](http://apache.fayea.com/zookeeper) the zookeeper, unzip it.

## Add Server1

- Add ```server1``` package

```
$   cd /Users/houbinbin/it/tools/zookeeper/server1
$   ls

data		logs		zookeeper-3.4.9
```

- Add file ```myid```

add file ```myid``` in data package, and it's content is

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
