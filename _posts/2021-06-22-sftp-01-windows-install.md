---
layout: post
title:  SFTP 服务器 windows10 安装笔记
date:  2021-06-20 16:52:15 +0800
categories: [Tool]
tags: [tool, sftp, sh]
published: true
---

# 背景

近期因工作需要，需要使用 SFTP。

所以想先自己安装体验一下，这里以 windows10 操作系统为例，做一下简单的记录。

# SFTP 服务端

SFTP 的服务端种类也比较多，此处选择使用比较广泛的 freeSSHd。

## freeSSHd 简介

[freeSSHd](http://www.freesshd.com/) 是一个SFTP服务器。

它用来支持使用密码或SSH免密登录的方式进行上传文件或远程操作系统。

freeSSHd 是提供给windows的一个免费的SFTP服务器，搭建简单，使用效果也比较好。

相对的我们搭建后需要在另一台机子上要搭建SFTP的客户端，来验证搭建是否成功，我们这边采用Putty客户端。


# 安装

## 下载

直接 [http://www.freesshd.com/index.php?ctt=download](http://www.freesshd.com/index.php?ctt=download) 下载。

```
name	  version	  size
freeSSHd.exe	  1.3.1	  856 KB
freeFTPd.exe	  1.0.13	  878 KB
freeUserImport.exe	  1.0.0	  180 KB
```

我们直接点击下载 [freeSSHd.exe](http://www.freesshd.com/freeSSHd.exe) 安装包。

## 安装

双击安装，直接全部按照默认即可。

安装完成会有两个提示：

（1）Private Keys should be created, should I do it now?

这个是私钥的初始化，选择是。

（2）Do you want to run FreeSSHd as a system service?

这个是把服务当做系统服务运行，选择否。

freeSSHd是可以以不同的端口启动多个服务，第一次如果启动的话会占用22端口，后面22端口就无法使用了。

而且第一次启动的服务由于没有进行配置启动了也没什么实际用。如果不小心点是，去服务里面关掉freeSSHd Server服务即可。

## 配置

运行桌面【FreeSSHd】快捷方式，会在右下角启动对应服务。

右键点击，选择 setting 进行配置。

### 配置用户

配置远程访问是以什么用户登录到该系统进行操作

【Users】=>【Add】，输入对应的账户和密码。此处个人选择以最基本的验证方式。

![输入图片说明](https://images.gitee.com/uploads/images/2021/0622/202125_4971dcef_508704.png "sftp-01-user-add.png")

### 配置 SSH

Linsten address 监听地址选择本机IP

SSH 使用的Prot 端口，默认是22，建议修改为其他的，并配置防火墙权限。

此处修改为 33。

Max number of connections ：最大连接数默认是0，至少也要改为1，否则不可连接

![输入图片说明](https://images.gitee.com/uploads/images/2021/0622/202422_acc828b7_508704.png "sftp-02-ssh.png")

### 配置 Authentication 验证规则

钥地址建议在安装目录下建一个Keys目录单独存放

下面的是是否使用密码验证与秘钥验证方式，有禁用，允许，必须使用三种方式。

我暂时保持默认，使用传统的账户密码方式。

### 日志配置

Logging 中可以配置打开日志信息，便于问题调试。

默认路径如下，可以自行调整：

```
C:\Program Files (x86)\freeSSHdfreesshd.log
```

### SFTP 路径

我们如果上传文件，那么 SFTP 会有一个对应的文件夹。

默认为 `$HOME\`，此处我们调整为 `D:\sftp`。

## 重启服务

如果修改了配置文件，点击【应用】。

个人建议unload退出系统后，再执行第一步以管理员重启服务，否则可能配置会不生效。

【Server Status】 中可以查看状态，如果如下说明一切正常。

![输入图片说明](https://images.gitee.com/uploads/images/2021/0622/202940_3b049af5_508704.png "sftp-03-status.png")

# 客户端连接验证

使用 putty/SecureCRT 等连接工具。

直接登录：

```
机器：127.0.0.1
端口号：33
密码：设置的密码
```

访问可以进入命令行：

```
C:\Users\USERNAME\Desktop>
```

# 小结

FreeSSHd 的配置还是非常简单的，或许这就是他流行的原因。

下一节我们将一起学习如何使用 java 连接 SFTP 服务端。

# 参考资料

[windows服务器安装sftp 教程及注意事项](https://blog.csdn.net/shutingwang/article/details/52981751)

[Windows搭建SFTP服务器](https://www.cnblogs.com/wangjunguang/p/9453611.html)

[用于Windows系统的免费SFTP服务器-Free SFTP Servers](https://www.cnblogs.com/tomahawk/p/10779346.html)


* any list
{:toc}