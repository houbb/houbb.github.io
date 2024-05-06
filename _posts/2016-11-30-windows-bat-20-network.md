---
layout: post
title: windows bat 脚本教程-20-network 网络
date:  2016-11-30 14:14:36 +0800
categories: [Windows]
tags: [windows, shell, bat]
published: true
---

# 网络

下面是关于网络设置中使用的NET命令以及它们的描述：

**1. NET ACCOUNTS**
查看计算机当前的密码和登录限制。

**2. NET CONFIG**
显示当前服务器或工作组的设置。

**3. NET COMPUTER**
添加或移除连接到Windows域控制器的计算机。

**4. NET USER**
此命令可用于以下目的：

- 查看特定用户帐户的详细信息。

**5. NET STOP/START**
此命令用于停止和启动特定服务。

**6. NET STATISTICS**
显示工作站或服务器的网络统计信息。

**7. NET USE**
连接或断开计算机与共享资源的连接，或显示有关您的连接的信息。

# chat

## Q: 详细介绍一下 bat 的 网络

在批处理（.bat）脚本中，可以使用各种命令来管理和配置网络设置。这些命令可以帮助用户连接到网络资源、查看网络状态、配置网络参数等。以下是一些常用的网络相关命令及其功能：

**1. NET ACCOUNTS**
这个命令用于查看计算机当前的密码和登录限制。通过它可以查看密码策略和账户策略的设置。

**2. NET CONFIG**
显示当前服务器或工作组的设置。可以用来查看当前网络配置的基本信息，如域名、工作组等。

**3. NET COMPUTER**
这个命令用于向Windows域控制器添加或删除连接到网络上的计算机。它可以管理计算机在网络中的身份和权限。

**4. NET USER**
这个命令用于管理用户账户。可以用来查看特定用户账户的详细信息，如用户名、全名、描述等。

**5. NET STOP/START**
这两个命令分别用于停止和启动特定的服务。通过这些命令可以管理系统中运行的各种网络服务。

**6. NET STATISTICS**
显示工作站或服务器的网络统计信息。可以查看网络流量、连接数、数据包传输等相关信息。

**7. NET USE**
这个命令用于连接或断开计算机与共享资源的连接，或显示有关当前连接的信息。可以用来管理网络驱动器映射和网络共享连接。

通过这些网络相关命令，批处理脚本可以实现对网络设置和连接的管理和配置。这对于自动化网络操作、网络资源管理和网络故障排除非常有用。

## 给出对应的语法+例子

下面是每个网络相关命令的语法和示例：

**1. NET ACCOUNTS**
```batch
NET ACCOUNTS
```
这个命令没有额外的参数，用于查看当前计算机的密码和登录限制。

**2. NET CONFIG**
```batch
NET CONFIG [/server] [/workstation]
```
这个命令用于显示当前服务器或工作组的设置。
```batch
NET CONFIG
```
显示当前计算机的配置信息。

**3. NET COMPUTER**
```batch
NET COMPUTER \\ComputerName [/ADD | /DEL]
```
这个命令用于添加或删除连接到Windows域控制器的计算机。
```batch
NET COMPUTER \\Workstation1 /ADD
```
将名为Workstation1的计算机添加到域。

**4. NET USER**
```batch
NET USER [username [/DOMAIN] | *] [/DELETE]
```
这个命令用于管理用户账户。
```batch
NET USER John
```
显示用户名为John的用户账户的详细信息。

**5. NET STOP/START**
```batch
NET STOP servicename
NET START servicename
```
这两个命令分别用于停止和启动特定的服务。
```batch
NET STOP Spooler
```
停止打印池服务。

**6. NET STATISTICS**
```batch
NET STATISTICS [workstation | server]
```
这个命令用于显示工作站或服务器的网络统计信息。
```batch
NET STATISTICS WORKSTATION
```
显示工作站的网络统计信息。

**7. NET USE**
```batch
NET USE [devicename | *] [\\computername\sharename[\volume] [password | *]]
NET USE [devicename [/HOME | /PERSISTENT:{YES | NO}] [password | *]]
NET USE [/PERSISTENT:{YES | NO}]
```
这个命令用于连接或断开计算机与共享资源的连接，或显示有关当前连接的信息。
```batch
NET USE X: \\Server\Share /PERSISTENT:YES
```
将网络共享连接到X:驱动器，并在重新启动后保留此连接。

# 参考资料

https://www.tutorialspoint.com/batch_script/batch_script_network.htm

* any list
{:toc}