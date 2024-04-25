---
layout: post
title: ETL-34-apache SeaTunnel 实战 15 多次执行任务导致系统 OOM
date: 2024-01-05 21:01:55 +0800
categories: [ETL]
tags: [etl, sh]
published: true
---

# 现象

以前 seatunnel 运行比较正常，但是后来同事一直在测试，不停的启停任务，发现启动任务时报错 

```
java.lang.OutOfMemoryError: Metaspace
```

采用的是 3 个服务节点，集群部署。

启用了 checkpoint

# 原因分析

这个一看应该是 jvm 的 metaspace 空间分配太小了。

## 客户端 jvm 设置方式

所以开始的时候，以为客户端启动设置太小了。

尝试提升 seatunnel 中 jvm_client_options 参数，设置：

```
-XX:MetaspaceSize=512m -XX:MaxMetaspaceSize=1024m
```

发现没有效果，依然是启动就失败。

## 服务端 jvm 设置方式

难道是服务端的问题？

也是类似，不过是修改 jvm_options 参数，把 metaspace 调整的比较大，2g 还是不行。

尝试查看 

```
jps  # 找到服务端 pid
jstat -gcutil PID # 这里的PID是Java进程ID  查看内存的使用情况
```

发现 M 的空间占用 90%+，，非常不合理。

发现没啥数据可占用的，任务也不多。最大的可能性就是 checkpoint？

甚至删除了一台机器的 checkpoint 依然不行。

## 原因

猜测是 3 台机器，不停的任务启动导致 checkpoint 占用了大量的内存资源，metaspace 空间不足。

删除一台不够，可能另外 2 台资源不足。

## 解决方式

把 3 台机器的服务端 checkpoint 全部按需清空，只保留必要的。

然后服务端全部重启，问题解决。

# 参考资料

[jdk8 permgen OOM再见迎来metaspace](https://www.cnblogs.com/SunshineKimi/p/12932702.html)

[记一次JDK8的Metaspace区域的调优过程，及MetaspaceSize参数的误解](https://blog.csdn.net/caoyuanyenang/article/details/89714220)

* any list
{:toc}