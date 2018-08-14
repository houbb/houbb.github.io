---
layout: post
title:  Ubuntu Zookeeper
date:  2018-08-14 13:46:27 +0800
categories: [Ubuntu]
tags: [ubuntu, zookeeper]
published: true
---

* any list
{:toc}

- Download

```
wget http://apache.fayea.com/zookeeper/zookeeper-3.4.9/zookeeper-3.4.9.tar.gz
```

- Create ```server1```

```
mkdir server1
```

- Unzip

```
$ tar -zxf zookeeper-3.4.9.tar.gz -C /home/hbb/tool/zookeeper/server1/
```

```
$   cd /home/hbb/tool/zookeeper/server1
$   ls
zookeeper-3.4.9
```

- create **data** and **logs**

```
$ pwd
/home/hbb/tool/zookeeper/server1
$ mkdir data
$ mkdir logs
$ ls
data  logs  zookeeper-3.4.9
```

- create ```myid``` in **data** content is ```1```

```
vi data/myid
```

- Edit ```zookeeper-3.4.9/conf```

```
$ pwd
/home/hbb/tool/zookeeper/server1/zookeeper-3.4.9/conf
$ ls
configuration.xsl  log4j.properties  zoo_sample.cfg
```

copy ```zoo_sample.cfg```

```
$   cp zoo_sample.cfg zoo.cfg
$   vi zoo.cfg
```

add content like this in ```zoo.cfg```:

```
# the data and log dir
dataDir=/home/hbb/tool/zookeeper/server1/data
dataLogDir=/home/hbb/tool/zookeeper/server1/logs
```

- Start

```
$   pwd
/home/hbb/tool/zookeeper/server1/zookeeper-3.4.9/bin

$   ./zkServer.sh start
ZooKeeper JMX enabled by default
Using config: /home/hbb/tool/zookeeper/server1/zookeeper-3.4.9/bin/../conf/zoo.cfg
Starting zookeeper ... STARTED
```


you may success if you see ```QuorumPeerMain```

```
$ jps
7792 QuorumPeerMain
6993 Bootstrap
2050 JswLauncher
7811 Jps
```