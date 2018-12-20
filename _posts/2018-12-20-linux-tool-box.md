---
layout: post
title: Linux Tool Box
date: 2018-12-20 17:21:25 +0800
categories: [Linux]
tags: [linux, java, tool, TODO, sh]
published: true
excerpt: Linux Tool Box 高可用的 java 工具箱
---

# 常见场景命令

| 序号	|  场景	 | 脚本 | 
|:---|:---|:---|
| 1	|     服务器负载高、服务超时、CPU利用率高	                                            |   show-busiest-java-threads |
| 2	| java.lang.NoClassDefFoundError、java.lang.ClassNotFoundException、程序未按照预期运行	|  find-in-jar |
| 3	| 程序未按照预期运行、上线后未执行新逻辑、查找某些关键字	                            |     grep-in-jar |
| 4	| Jar包版本冲突、程序未按照预期运行	                                                    |   jar-conflict-detect |
| 5	| HTTP调用后发现未按照预期输出结果	                                                    |   http-spy |
| 6	| 数据库负载高、SQL超时	                                                                |   show-mysql-qps |
| 7	| 没有源码的Jar包出了问题、破解别人的代码	                                            |    jad |
| 8	| 线上出问题还无法上线打点日志、线上调试、做切面	                                    |     btrace |
| 9	| 内存不足、OutOfMemoryError	                             |   jmap |
| 10	| 内存不足、OutOfMemoryError、GC频繁、服务超时、响应长尾 | 	jstat |
| 11	| 服务超时、线程死锁、服务器负载高	                     |     jstack |
| 12	| 查看或者修改Java进程环境变量和Java虚拟机变量	         |     jinfo |
| 13	| 使用JNI开发Java本地程序库	                             |   javah |
| 14	| 查找java进程ID	                                     |   jps |
| 15	| 分析jmap产生的java堆的快照	                         |   jhat |
| 16	| QA环境无法重现，需要在准生产线上远程调试	             |      jdb |
| 17	| 与jstat相同，但是可以在线下用客户端连接，可线下操作	 |       jstatd |
| 18	| 简单的有界面的内存分析工具，JDK自带	                 |      JConsole |
| 19	| 全面的有界面的内存分析工具，JDK自带	                 |     JVisualVM |
| 20	| 专业的Java进程性能分析和跟踪工具 	                     |     JMAT |
| 21	| 商业化的Java进程性能分析和跟踪工具	                 |     JProfiler |

# Linux 基础命令

## grep 

查看一个关键词

```
grep -a '${keyword}'  XXXX.log
```

### 多个关键词

```
grep -a '${keyword}'  XXXX.log | grep '${another_key}'
```

## find

通过文件名称查找文件的存在位置，名称查找支持模糊匹配。

## uptime

查看机器的启动时间、登录用户、平均负载等情况，通常用在线上应急或者技术攻关的时候来确定操作系统的重启时间。

## lsof

列出系统当前打开的文件句柄，在Linux文件系统中，任何资源都是以文件句柄的形式管理的，

例如：硬件设备、文件、网络套接字等，系统内部为每一种资源分配一个句柄，应用程序只能用操作系统分配的句柄来引用资源，因此，文件句柄为应用程序与基础操作系统之间的交互提供了通用的操作接口。

应用程序打开文件的描述符列表包含了大量的关于应用程序本身的运行信息，因此通过lsof工具查看这个文件句柄列表，对系统监控以及应急排错提供重要的帮助。

## ulimit

Linux系统对每个登录用户，都限制其最大进程数和打开的最大文件句柄数。

为提高性能，可以根据硬件资源的具体情况，设置各个用户的最大进程数和打开的最大文件句柄数。

可以用ulimit -a来显示当前的各种系统对用户使用资源的限制：

## curl

程序开发后，会使用junit, testng以及jmock, mockito进行单元测试，单元测试后需要进行集成测试，

由于当前的线上服务较多使用restful风格，那么集成测试的时候就需要进行HTTP调用，

查看返回的结果是否符合预期，curl命令当然是首选测试的方法。

## scp

scp命令是Linux系统中功能强大的文件传输命令，可以实现从本地到远程以及远程到本地的双向文件传输，用起来非常的方便。

常用来在线上定位问题时，将线上的一些文件下载到本地进行详查，或者将本地的修改上传到服务器上。

## vi & vim

vi和vim是Linux中最常用的命令行文本编辑工具，vim是vi的升级版本，在某些Linux版本下，vi实际上通过软连接指向vim。

## dos2unix&unix2dos

用于转换windows和unix的换行符，通常在windows上开发的脚本和配置，上传到unix上都需要转换。


# 查看进程

## 1、ps

显示系统内所有的进程。

## 2、top

查看活动进程的CPU和内存信息的工具命令，能够实时显示系统中各个进程的资源占用情况。

可以按CPU和内存的使用情况和执行时间对进程进行排序。

# 窥探内存的命令

## 1、free

此命令显示系统内存的使用情况，包括总体内存、已经使用的内存、以及系统核心使用的缓冲区，包括缓存(buffer)和缓冲(cache)等。

## 2、pmap

此命令用来报告进程占用内存的详细情况，可以用来查出某些内存瓶颈问题的根源原因。



# 参考资料

[保证高可用Java服务化系统高效运行的必备工具箱](https://mp.weixin.qq.com/s?__biz=MzAwNTQ4MTQ4NQ==&mid=2453561912&idx=1&sn=1e6141a1d0e94f7b5a3ecaaaa63e8e57&chksm=8cd1375abba6be4c5037a9c87f38ded8ebe8951dd216ac73d162eeaa75108f7715c43cc54a62&scene=21#wechat_redirect)

[史上最全的高可用服务系统线上问题排查工具单（一）](https://mp.weixin.qq.com/s?__biz=MzAwNTQ4MTQ4NQ==&mid=2453561951&idx=1&sn=e4e82598a1e536269ae7ecd9e44236a9&chksm=8cd1373dbba6be2b77c7e47db2fafe3e3e32f78486a134c712a7058e8e5348f7d4ff692922ee&scene=21#wechat_redirect)

[史上最全的高可用服务系统线上问题排查工具单（二）](https://mp.weixin.qq.com/s/6EBgu__zwkYbGDjnVsbDlQ)

* any list
{:toc}