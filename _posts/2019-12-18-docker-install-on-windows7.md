---
layout: post
title: Docker 在 Windows7 环境安装教程
date:  2019-12-18 11:34:23 +0800
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


# win7 安装 docker

## 背景介绍

这里是另外一次的 docker 安装记录。

遇到的情况会稍有不同，所以记录也不同，就将二者汇总在一起，便于以后整理查阅。

## Toolbox 介绍

Docker在Windows7（windows之前）系统下的安装需要使用Docker Toolbox。

Toolbox 包含以下Docker工具：

- Docker Machine for running docker-machine commands

- Docker Engine for running the docker commands

- Docker Compose for running the docker-compose commands

- Kitematic, the Docker GUI

- a shell preconfigured for a Docker command-line environment

- Oracle VirtualBox

## 下载

查看 [https://docs.docker.com/toolbox/overview/](https://docs.docker.com/toolbox/overview/) 了解相关信息。

在 [https://docs.docker.com/toolbox/toolbox_install_windows/](https://docs.docker.com/toolbox/toolbox_install_windows/) 可以看到不同的 windows 版本对应的准备工作等信息。

我们这里是 windows7 系统，选择在 [https://github.com/docker/toolbox/releases](https://github.com/docker/toolbox/releases) 选择最新的 release 版本下载。

### 下载报错

可能会在 github 中报错如下：

```
github-production-release-asset-2e65be.s3.amazonaws.com 意外终止了连接。
```

直接将下载地址，从 https 改为 http 即可。

## 安装

直接全部默认即可，组件选择可以根据自己的需要选择。

可以把所有的都勾选，这样比较方便。

等待安装完成。

安装完成后的，桌面上会有以下软件：

```
Oracle VM VirtualBox

Kitematic (Alpha)

Docker Quickstart Terminal
```

## 初始化

点击 Docker Quickstart Terminal 图标，从而打开一个Docker Toolbox terminal 

打开Terminal后，Terminal会自动进行一些设置，这个过程中会安装boot2docker，这部分需要点时间，全部完成之后，会出现如下的结果：

```
Error checking TLS connection: Error checking and/or regenerating the certs: The
re was an error validating certificates for host "192.168.99.100:2376": dial tcp
 192.168.99.100:2376: connectex: No connection could be made because the target
machine actively refused it.
You can attempt to regenerate them using 'docker-machine regenerate-certs [name]
'.
Be advised that this will trigger a Docker daemon restart which might stop runni
ng containers.

Error checking TLS connection: Error checking and/or regenerating the certs: The
re was an error validating certificates for host "192.168.99.100:2376": dial tcp
 192.168.99.100:2376: connectex: No connection could be made because the target
machine actively refused it.
You can attempt to regenerate them using 'docker-machine regenerate-certs [name]
'.
Be advised that this will trigger a Docker daemon restart which might stop runni
ng containers.




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

Administrator@PC-20120726SOTT MINGW64 /c/Program Files/Docker Toolbox
$ docker info
error during connect: Get http://%2F%2F.%2Fpipe%2Fdocker_engine/v1.39/info: open
 //./pipe/docker_engine: The system cannot find the file specified. In the defau
lt daemon configuration on Windows, the docker client must be run elevated to co
nnect. This error may also indicate that the docker daemon is not running.

Administrator@PC-20120726SOTT MINGW64 /c/Program Files/Docker Toolbox
$
```

这里的地址 `192.168.99.100` 就是针对 docker 的虚拟地址，我们可以直接访问。

### 重新生成

根据 `docker-machine regenerate-certs [name]` 提示重新生成，结果依然报错：

```
λ docker-machine regenerate-certs default
Regenerate TLS machine certs?  Warning: this is irreversible. (y/n): y
Regenerating TLS certificates
Waiting for SSH to be available...
Detecting the provisioner...
Unable to verify the Docker daemon is listening: Maximum number of retries (10) exceeded
```

重试10次依然报错。

### 重启

直接 `docker-machine ssh default` 进入内部。

```
docker@default:~$ docker ps
Cannot connect to the Docker daemon at unix:///var/run/docker.sock. Is the docker daemon running?
```

看的出来，守护进程一直没起来。

- 执行重启

```
λ docker-machine.exe restart default
Restarting "default"...
(default) Check network to re-create if needed...
(default) Windows might ask for the permission to configure a dhcp server. Sometimes, such confirmation window is minimized in the taskbar.
(default) Waiting for an IP...
Waiting for SSH to be available...
Detecting the provisioner...
Restarted machines may have new IP addresses. You may need to re-run the `docker-machine env` command.
```

依然报错。

```
λ docker-machine env
Error checking TLS connection: Error checking and/or regenerating the certs: There was an error validating certificates for host "192.168.99.100:2376": x509: certificate signed by unknown authority
You can attempt to regenerate them using 'docker-machine regenerate-certs [name]'.
Be advised that this will trigger a Docker daemon restart which might stop running containers.
```


### 按照 stackoverflow 的方式

依次执行以下的命令：

（1）重新生成证书

```
docker-machine --debug regenerate-certs -f default
```

去修复遇到的异常，我没遇到异常

（2）查看环境信息

```
docker-machine --debug env default
```

If it's failing on ssh, copy and paste that command into terminal to see what's the problem by adding extra `-vv`.

（3）查询 default 是否运行

```
λ docker-machine ls
NAME      ACTIVE   DRIVER       STATE     URL                         SWARM   DOCKER     ERRORS
default   -        virtualbox   Running   tcp://192.168.99.100:2376           v19.03.5
```

可见是启动的，如果未启动，你可以执行命令：

```
docker-machine start
```

（4）登录 default

```
docker-machine -D ssh default
```

（5）验证

```
docker@default:~$ docker version
Client: Docker Engine - Community
 Version:           19.03.5
 API version:       1.40
 Go version:        go1.12.12
 Git commit:        633a0ea838
 Built:             Wed Nov 13 07:22:05 2019
 OS/Arch:           linux/amd64
 Experimental:      false

Server: Docker Engine - Community
 Engine:
  Version:          19.03.5
  API version:      1.40 (minimum version 1.12)
  Go version:       go1.12.12
  Git commit:       633a0ea838
  Built:            Wed Nov 13 07:28:45 2019
  OS/Arch:          linux/amd64
  Experimental:     false
 containerd:
  Version:          v1.2.10
  GitCommit:        b34a5c8af56e510852c35414db4c1f4fa6172339
 runc:
  Version:          1.0.0-rc8+dev
  GitCommit:        3e425f80a8c931f88e6d94a8c831b9d5aa481657
 docker-init:
  Version:          0.18.0
  GitCommit:        fec3683
```

目前来看，大功告成。

# 参考资料

https://www.cnblogs.com/canger/p/9028723.html

## 关闭 hy-v

[关闭 hy-v](https://jingyan.baidu.com/article/1876c8524ef6d0890a137654.html)

[docker 出现 Error checking TLS connection 的解决方案 ](https://my.oschina.net/tridays/blog/810568)

[windows下 docker-machine 报错 Error checking TLS connection](https://segmentfault.com/a/1190000009508193)

[error-checking-tls-connection-error-checking-and-or-regenerating-the-certs](https://stackoverflow.com/questions/34641003/error-checking-tls-connection-error-checking-and-or-regenerating-the-certs)

* any list
{:toc}