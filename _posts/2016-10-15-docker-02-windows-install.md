---
layout: post
title: Docker-02-windows7 安装 
date:  2016-10-15 22:41:45 +0800
categories: [Docker]
tags: [docker, windows, sf]
published: true
---


# 为什么使用Docker Toolbox

Docker在Windows上使用有两种方式，一是利用VirtualBox建立linux虚拟机，在linux虚拟机中安装docker服务端和客户端。

二是利用Windows的Hyper-v虚拟化技术，直接在Windows上安装docker服务端和客户端。

WIndows7不支持Hyper-v，所以只能采用Docker Toolbox的方式使用Docker。

## 下载地址

下载地址：[https://docs.docker.com/toolbox/overview/](https://docs.docker.com/toolbox/overview/)

## 安装

双击运行下载得文件。

- 全属性安全

GIT 我本机已经安装了，可以跳过。

## 安装后

桌面会多出三个图标。

【Oracle VM VirtualBox】- 提供了linux虚拟机的运行环境

【Kitematic (Alpha)】-是docker GUI很少用到。

【Docker Quickstart Terminal】- 用于快速介入linux虚拟机，提供命令行交互

# 启动

第一次运行Docker Quickstart Terminal时会进行Docker环境的初始化，会在VirtualBox中自动创建名字为【default】的linux虚拟机，再此过程中会用到boot2docker.iso镜像文件。

默认情况下，启动程序会从GitHub上下载此文件的最新版，但由于文件相对较大且速度不给力，多数情况下会下载失败，造成Docker环境无法启动，如下图：

## 冲突报错

```
Creating CA: C:\Users\binbin.hou\.docker\machine\certs\ca.pem
Creating client certificate: C:\Users\binbin.hou\.docker\machine\certs\cert.pem
Running pre-create checks...
Error with pre-create check: "This computer is running Hyper-V. VirtualBox won't boot a 64bits VM when Hyper-V is activated. Either use Hyper-V as a driver, or disable the Hyper-V hypervisor. (To skip this check, use --virtualbox-no-vtx-check)"
Looks like something went wrong in step ´Checking if machine default exists´... Press any key to continue...
```

## 关闭 Hyper-V

query【控制面板】【卸载】【打开或者关闭windows功能”】

把 【Hyper-V】勾掉。

点击【确定】

然后需要重启电脑，重启。

## 重新尝试启动

双击再次进入。

- 日志

```
Running pre-create checks...
(default) Image cache directory does not exist, creating it at C:\Users\binbin.hou\.docker\machine\cache...
(default) No default Boot2Docker ISO found locally, downloading the latest release...
(default) Latest release for github.com/boot2docker/boot2docker is v18.09.6
(default) Downloading C:\Users\binbin.hou\.docker\machine\cache\boot2docker.iso from https://github.com/boot2docker/boot2docker/releases/download/v18.09.6/boot2docker.iso...
```

### 实际做了什么

第一次运行Docker Quickstart Terminal时会进行Docker环境的初始化，会在VirtualBox中自动创建名字为【default】的linux虚拟机，再此过程中会用到boot2docker.iso镜像文件。

默认情况下，启动程序会从GitHub上下载此文件的最新版，但由于文件相对较大且速度不给力，多数情况下会下载失败，造成Docker环境无法启动.



### 解决办法

解决方法：

其实DockerToolbox安装文件自带了boot2docker.iso镜像文件，位于安装目录下（如 `C:\Program Files\Docker Toolbox`），

将此文件拷至 `C:\Users\binbin.hou\.docker\machine\cache\boot2docker.iso` 目录下，然后在网络断开的情况下重新启动，便可初始化成功。

如下图：

### 正常流程

网络还不错，顺利下载完成。

```
(default) 0%....10%....20%....30%....40%....50%....60%....70%....80%....90%....100%
Creating machine...
(default) Copying C:\Users\binbin.hou\.docker\machine\cache\boot2docker.iso to C:\Users\binbin.hou\.docker\machine\machines\default\boot2docker.iso...
(default) Creating VirtualBox VM...
(default) Creating SSH key...
(default) Starting the VM...
(default) Check network to re-create if needed...
(default) Windows might ask for the permission to create a network adapter. Sometimes, such confirmation window is minimized in the taskbar.
(default) Found a new host-only adapter: "VirtualBox Host-Only Ethernet Adapter #2"
(default) Windows might ask for the permission to configure a network adapter. Sometimes, such confirmation window is minimized in the taskbar.
(default) Windows might ask for the permission to configure a dhcp server. Sometimes, such confirmation window is minimized in the taskbar.
(default) Waiting for an IP...
```

- 成功启动

```
                        ##         .
                  ## ## ##        ==
               ## ## ## ## ##    ===
           /"""""""""""""""""\___/ ===
      ~~~ {~~ ~~~~ ~~~ ~~~~ ~~~ ~ /  ===- ~~~
           \______ o           __/
             \    \         __/
              \____\_______/

docker is configured to use the default machine with IP 192.168.99.100
For help getting started, check out the docs at https://docs.docker.com


Start interactive shell
```

其中【192.168.99.100】是VirtualBox中名字为【default】虚拟机的ip地址。

# 利用 Xshell 等工具登录

Docker Quickstart Terminal 使用起来不方便，可以使用XShell进行SSH登录Docker环境（其实就是远程访问default linux虚拟机）。

通过在PowerShell或cmd终端中执行【docker-machine ls】命令，可以看到虚拟机的地址，本机是192.168.99.100。

## 执行命令

```
$ docker-machine ls
NAME      ACTIVE   DRIVER       STATE     URL                         SWARM   DOCKER     ERRORS
default   *        virtualbox   Running   tcp://192.168.99.100:2376           v18.09.6
```

## 账户信息

default虚拟机的默认用户名和密码

用户名：docker 
密码： tcuser

## 个人使用 SecureCRT 登录

直接输入信息

ip: 192.168.99.100

port: 22

用户名：docker 

密码： tcuser

# 参考资料

https://www.cnblogs.com/canger/p/9028723.html

## 关闭 hy-v

[关闭 hy-v](https://jingyan.baidu.com/article/1876c8524ef6d0890a137654.html)

* any list
{:toc}