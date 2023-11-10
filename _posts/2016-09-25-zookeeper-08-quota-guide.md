---
layout: post
title: ZooKeeper-08-Quota's Guide
date:  2016-09-25 12:21:05 +0800
categories: [Apache]
tags: [zookeeper, config-center]
published: true
---

# 配额

ZooKeeper具有名称空间和字节配额。

您可以使用ZooKeeperMain类设置配额。 
 
如果用户超过分配给他们的配额，ZooKeeper会打印WARN消息。 
 
消息将打印在ZooKeeper的日志中。

注意：名称空间配额的含义是计数配额，该数量配额限制了路径（包括其自身）下的子代数。

```
$ bin/zkCli.sh -server host:port**
```

上面的命令为您提供了使用配额的命令行选项。

# 设定配额

您可以使用setquota在ZooKeeper节点上设置配额。

它具有使用-n（用于名称空间/计数）和-b（用于字节/数据长度）设置配额的选项。

ZooKeeper配额存储在/ Zookeeper / quota中的ZooKeeper中。要禁止其他人更改配额，用户可以为/ zookeeper / quota设置ACL，以便只有管理员才能对其进行读写。

如果配额在指定路径中不存在，请创建配额，否则更新配额。

配额用户设置的范围是指定路径（包括其自身）下的所有节点。

为了简化当前目录/层次结构中配额的计算，一个完整的树路径（从根节点到叶节点）只能设置一个配额。在其父节点或子节点已具有配额的路径中设置配额的情况下。 setquota将拒绝并告知指定的父路径或子路径，用户可以根据特定情况调整配额分配（删除/上移/下移配额）。

与Chroot结合使用时，配额将在不同应用程序之间具有更好的隔离效果，例如：

```
Chroot is:
192.168.0.1:2181,192.168.0.2:2181,192.168.0.3:2181/apps/app1 setquota -n 100000 /apps/app1
```

用户无法在 `/zookeeper/quota` 下的路径上设置配额

# 列出配额

您可以使用listquota列出ZooKeeper节点上的配额。

# 删除配额

您可以使用delquota删除ZooKeeper节点上的配额。


# 参考资料

https://zookeeper.apache.org/doc/r3.6.2/zookeeperTutorial.html

* any list
{:toc}