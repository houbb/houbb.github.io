---
layout: post
title: linux nmap 端口扫描命令
date: 2018-12-05 11:35:23 +0800
categories: [Linux]
tags: [vim, linux, sh]
published: true
---

# nmap 命令

nmap 命令是一款开放源代码的网络探测和安全审核工具，它的设计目标是快速地扫描大型网络。

## 语法

```
nmap(选项)(参数)
```

## 选项

```
-O：激活操作探测；
-P0：值进行扫描，不ping主机；
-PT：是同TCP的ping；
-sV：探测服务版本信息；
-sP：ping扫描，仅发现目标主机是否存活；
-ps：发送同步（SYN）报文；
-PU：发送udp ping；
-PE：强制执行直接的ICMPping；
-PB：默认模式，可以使用ICMPping和TCPping；
-6：使用IPv6地址；
-v：得到更多选项信息；
-d：增加调试信息地输出；
-oN：以人们可阅读的格式输出；
-oX：以xml格式向指定文件输出信息；
-oM：以机器可阅读的格式输出；
-A：使用所有高级扫描选项；
--resume：继续上次执行完的扫描；
-P：指定要扫描的端口，可以是一个单独的端口，用逗号隔开多个端口，使用“-”表示端口范围；
-e：在多网络接口Linux系统中，指定扫描使用的网络接口；
-g：将指定的端口作为源端口进行扫描；
--ttl：指定发送的扫描报文的生存期；
--packet-trace：显示扫描过程中收发报文统计；
--scanflags：设置在扫描报文中的TCP标志。
```

## 参数

ip地址：指定待扫描报文中的TCP地址。

# 实际例子

## 安装

```
yum install nmap
```

## 调用

```
# nmap baidu.org
Starting Nmap 7.70 ( https://baidu.org ) at 2021-09-25 12:41 UTC
Nmap scan report for baidu.org (107.148.xxx.xxx)
Host is up (0.0018s latency).
Not shown: 996 filtered ports
PORT   STATE  SERVICE
20/tcp closed ftp-data
21/tcp closed ftp
22/tcp closed ssh
80/tcp open   http
```

可以看到对应的端口。

## 指定端口

```
nmap -p 80 baidu.org
```

## 扫描整个子网

```
nmap -p 3306 107.148.125.*
```

结果如下：

```
Nmap scan report for 107.148.125.129
Host is up (0.0016s latency).

PORT     STATE    SERVICE
3306/tcp filtered mysql
```

filtered 什么意思？

# Nmap对端口的扫描有以下几种状态。

## Open 端口开放状态

应用程序正在该端口接收TCP或UDP报文。这也是端口扫描的主要目标。它显示了网络上哪些服务可供使用。

## Closed 端口关闭状态

关闭的端口对于Nmap也是可以访问的，但没有应用程序在其上监听。它可以显示该IP地址上的主机是否在运行，对操作系统探测有帮助。

## Filtered 过滤的

由于包过滤阻止探测报文到达端口，Nmap无法确定该端口是否开放。过滤可能来自专业的防火墙设备、路由器规则或主机上的软件防火墙。几乎不提供任何信息。

过滤器只是丢弃探测帧，不做任何响应，这会迫使Nmap重试若干次以防止探测包由于网络阻塞而被丢弃。

从而使扫描速度变慢。

## Unfiltered 未被过滤的

未被过滤状态意味着端口可以访问，但Nmap不确定它是开放还是关闭。只有用于映射防火墙规则集的ACK扫描才会把端口分类到这种状态。

## Open|Filtered

这种状态是 当前无法确定这个端口是开放还是被过滤的，Nmap就会把端口划分为这种状态。

开放的端口不响应就是一个例子 。UDP IP FIN Null Xmas 扫描会把端口归入次类。

## Closed|Filtered

该状态用于Nmap不能确定该端口是关闭的还是被过滤的。它只可能出现在IPID Idle扫描中。

# 参考资料

[nmap命令](https://man.linuxde.net/nmap#:~:text=nmap%E5%91%BD%E4%BB%A4,%E6%98%AF%E4%B8%80%E6%AC%BE%E5%BC%80%E6%94%BE%E6%BA%90%E4%BB%A3%E7%A0%81%E7%9A%84%E7%BD%91%E7%BB%9C%E6%8E%A2%E6%B5%8B%E5%92%8C%E5%AE%89%E5%85%A8%E5%AE%A1%E6%A0%B8%E5%B7%A5%E5%85%B7%EF%BC%8C%E5%AE%83%E7%9A%84%E8%AE%BE%E8%AE%A1%E7%9B%AE%E6%A0%87%E6%98%AF%E5%BF%AB%E9%80%9F%E5%9C%B0%E6%89%AB%E6%8F%8F%E5%A4%A7%E5%9E%8B%E7%BD%91%E7%BB%9C%E3%80%82)

https://www.cnblogs.com/machangwei-8/p/10353004.html

[Nmap 端口扫描](https://blog.csdn.net/qq_46023525/article/details/112982178)

[Nmap scan what does STATE=filtered mean? [duplicate]](https://security.stackexchange.com/questions/227028/nmap-scan-what-does-state-filtered-mean)

* any list
{:toc}