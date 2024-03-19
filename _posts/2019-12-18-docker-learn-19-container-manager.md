---
layout: post
title: Docker learn-19-Docker 入门之容器的管理
date:  2019-12-18 11:34:23 +0800
categories: [Docker]
tags: [docker, windows, devops, ci, sh]
published: true
---

# 确保 Docker 已经就绪

本篇环境为 windows10 环境。

```
$ docker info

Containers: 8
 Running: 0
 Paused: 0
 Stopped: 8
Images: 4
Server Version: 18.09.6
Storage Driver: overlay2
 Backing Filesystem: extfs
 Supports d_type: true
 Native Overlay Diff: true
Logging Driver: json-file
Cgroup Driver: cgroupfs
...
```

说明已经可以了。

接下来我们进行相关的使用学习。

# 运行第一个容器

```
$ docker run -it ubuntu /bin/bash
```

日志如下：

```
Unable to find image 'ubuntu:latest' locally
latest: Pulling from library/ubuntu
2746a4a261c9: Pull complete 
4c1d20cdee96: Pull complete 
0d3160e1d0de: Pull complete 
c8e37668deea: Pull complete 
Digest: sha256:250cc6f3f3ffc5cdaa9d8f4946ac79821aafb4d3afc93928f0de9336eba21aa4
Status: Downloaded newer image for ubuntu:latest
```

首先回去本地找这个镜像，没有发现就会直接去仓库中心下载最新的镜像。

## 命令解释

`docker run` 代表运行某个镜像。

-i 表示保证容器的 STDIN 是开启的

-t 表示为容器开启一个伪的 tty 终端

这样新创建的容器才能提供一个交互式的终端。

# 使用第一个容器

我们已经默认进入到终端之中

```
root@83489077fd36:/#
```

这里是一个完整的 ubuntu 系统。

## 获取主机名

```
# hostname
83489077fd36
```

这里的主机名就是容器的 container ID。

## 查看 etc/hosts 文件

```
# cat /etc/hosts 
127.0.0.1       localhost
::1     localhost ip6-localhost ip6-loopback
fe00::0 ip6-localnet
ff00::0 ip6-mcastprefix
ff02::1 ip6-allnodes
ff02::2 ip6-allrouters
172.17.0.2      83489077fd36
```

## 查看 ip 网络配置信息

```
# ip a
bash: ip: command not found
```

这个命令没找到，略微尴尬。

## 查看容器进程

```
# ps -aux
USER       PID %CPU %MEM    VSZ   RSS TTY      STAT START   TIME COMMAND
root         1  0.0  0.3  18508  3424 pts/0    Ss   02:22   0:00 /bin/bash
root        13  0.0  0.2  34400  2932 pts/0    R+   02:27   0:00 ps -aux
```

## 安装软件

```
# apt-get update && apt-get install vim
```

我们首相更新 apt-get，然后安装我们需要的软件。

日志如下：

```
Ign:1 http://security.ubuntu.com/ubuntu bionic-security InRelease
Ign:2 http://archive.ubuntu.com/ubuntu bionic InRelease
Err:3 http://security.ubuntu.com/ubuntu bionic-security Release
  SECURITY: URL redirect target contains control characters, rejecting. [IP: 91.189.88.162 80]
Ign:4 http://archive.ubuntu.com/ubuntu bionic-updates InRelease
Ign:5 http://archive.ubuntu.com/ubuntu bionic-backports InRelease
Err:6 http://archive.ubuntu.com/ubuntu bionic Release
  SECURITY: URL redirect target contains control characters, rejecting. [IP: 91.189.88.24 80]
Err:7 http://archive.ubuntu.com/ubuntu bionic-updates Release
  SECURITY: URL redirect target contains control characters, rejecting. [IP: 91.189.88.24 80]
Err:8 http://archive.ubuntu.com/ubuntu bionic-backports Release
  SECURITY: URL redirect target contains control characters, rejecting. [IP: 91.189.88.24 80]
Reading package lists... Done
E: The repository 'http://security.ubuntu.com/ubuntu bionic-security Release' does not have a Release file.
N: Updating from such a repository can't be done securely, and is therefore disabled by default.
N: See apt-secure(8) manpage for repository creation and user configuration details.
E: The repository 'http://archive.ubuntu.com/ubuntu bionic Release' does not have a Release file.
N: Updating from such a repository can't be done securely, and is therefore disabled by default.
N: See apt-secure(8) manpage for repository creation and user configuration details.
E: The repository 'http://archive.ubuntu.com/ubuntu bionic-updates Release' does not have a Release file.
N: Updating from such a repository can't be done securely, and is therefore disabled by default.
N: See apt-secure(8) manpage for repository creation and user configuration details.
E: The repository 'http://archive.ubuntu.com/ubuntu bionic-backports Release' does not have a Release file.
N: Updating from such a repository can't be done securely, and is therefore disabled by default.
N: See apt-secure(8) manpage for repository creation and user configuration details.
```

## 退出运行

```
# exit
```

我们直接输入 exit 就可以退出当前容器。

## 查看容器运行状态

回到开始的地方，查看镜像信息。

### 查看运行容器

```
$ docker ps
```

发现列表是空的

### 查看所有容器

我们列出所有状态的容器，我们发现刚才的 ubuntu 进项已经退出了。

```
$ docker ps -a
CONTAINER ID        IMAGE               COMMAND                  CREATED             STATUS                       PORTS                                NAMES
83489077fd36        ubuntu              "/bin/bash"              9 minutes ago       Exited (100) 7 seconds ago                                        unruffled_wiles
```

### 查看最后一次运行的容器

```
$ docker ps -l

CONTAINER ID        IMAGE               COMMAND             CREATED             STATUS                       PORTS               NAMES
83489077fd36        ubuntu              "/bin/bash"         12 minutes ago      Exited (100) 3 minutes ago                       unruffled_wiles
```

## 容器的指定方式

每一个容器都有三种方式可以唯一指定：

（1）短 UUID

（2）长 UUID

（3）容器名称

# 给容器命名

## 启动时指定名称

这里我们通过 --name 来制定容器名称为 hello-ubuntu

```
$   docker run --name hello-ubuntu -it ubuntu /bin/bash
```

## 退出查看容器名称

我们退出重新查看容器名称：

```
root@09e662282e01:/# exit
exit
docker@default:~$ docker ps -l 
CONTAINER ID        IMAGE               COMMAND             CREATED             STATUS                     PORTS               NAMES
09e662282e01        ubuntu              "/bin/bash"         8 seconds ago       Exited (0) 5 seconds ago                       hello-ubuntu
```

可以发现这次容器名称变成了 hello-ubuntu

## 命名规范

容器的名称有一定的要求，确切的说需要符合正则表达式：

```
[a-zA-Z0-9_.-]
```

容器的名称必须唯一。

# 再次启动被停止的容器

## 启动

使用 docker start 命令可以启动一个容器，当然后面不仅可以是名称，也可以是 CONTAINER ID

可以自行测试。

```
docker@default:~$ docker start hello-ubuntu
hello-ubuntu
docker@default:~$ docker ps
CONTAINER ID        IMAGE               COMMAND             CREATED             STATUS              PORTS               NAMES
09e662282e01        ubuntu              "/bin/bash"         6 minutes ago       Up 4 seconds                            hello-ubuntu
```

## 重启

也可以使用 `docker restart` 来启动容器

```
docker@default:~$ docker restart 09e662282e01
09e662282e01
docker@default:~$ docker ps
CONTAINER ID        IMAGE               COMMAND             CREATED             STATUS              PORTS               NAMES
09e662282e01        ubuntu              "/bin/bash"         7 minutes ago       Up 4 seconds                            hello-ubuntu
```

# 附着到容器上

docker 容器重新启动的时候，会延续上次 docker run 的指定参数。

我们也可以使用 `docker attach` 命令，重新附着到该容器的会话上。

```
$   docker attach hello-ubuntu
root@09e662282e01:/# 
```

退出之后，直接容器也会随之退出。

# 创建守护式容器

除了刚才演示的交互式容器（interactive container），也可以建立以下守护式(daemonized container)

## 守护式进程创建例子

```
$ docker run --name  daemon_dave -d ubuntu /bin/sh -c "while true; do echo hello world; sleep 1; done"
395b9fadf0ea3ab97bc703fff8af162053c4d2f70a6214589d862f1fddfe7b8f
```

--name 指定名称

-d 指定守护进程运行

-c 指定了一个命令，每秒钟打印日志。

## 查看容器

```
$ docker ps
CONTAINER ID        IMAGE               COMMAND                  CREATED             STATUS              PORTS               NAMES
395b9fadf0ea        ubuntu              "/bin/sh -c 'while t…"   17 seconds ago      Up 16 seconds                           daemon_dave
```

## 查看容器在作什么

我们指定打印日志怎么才能看到呢？

```
$ docker logs daemon_dave
```

可以看到一大堆日志：

```
hello world
hello world
...
```

当然也可以实时查看，类似于 tail -f

```
$ docker logs -f daemon_dave
```

这里看起来都是一样的不够方便，可以指定时间

```
$ docker logs -ft daemon_dave
```

日志如下：

```
2019-12-23T03:42:02.541350368Z hello world
2019-12-23T03:42:03.545194889Z hello world
2019-12-23T03:42:04.549811173Z hello world
```

# 查看容器内的进程

通过 docker top 命令，我们可以查看容器内所有运行的进程。

```
$ docker top daemon_dave
UID                 PID                 PPID                C                   STIME               TTY                 TIME                CMD
root                3758                3736                0                   03:35               ?                   00:00:00            /bin/sh -c while true; do echo hello world; sleep 1; done
root                4719                3758                0                   03:46               ?                   00:00:00            sleep 1
```

# 在容器内部运行进程

我们可以 docker exec 额外启动新的进程。 

## 守护式

```
docker exec -d daemon_dave touch /etc/new_config
```

-d 指定为守护式运行

后面指定需要指定的命令，我们在容器内创建了一个空文件。

## 交互式


```
docker exec -it daemon_dave /bin/bash
```

这里使用交互的方式，打开一个新的命令终端。

这个交互式还是比较常用的命令，比如我们用 docker 部署应用，希望进入容器内查看日志等，都可以通过这种方式。

# 停止守护进程

docker stop 命令可以停止一个守护进程。

```
$ docker stop daemon_dave
daemon_dave
```

这个命令回向系统发送 SIGTERM 信号。，

如果你想快速停止，可以使用 `docker kill` 命令来发送一个 SIGKILL 信号。

## 查看已经停止的容器状态

```
$ docker ps -n 1 
CONTAINER ID        IMAGE               COMMAND                  CREATED             STATUS                       PORTS               NAMES
395b9fadf0ea        ubuntu              "/bin/sh -c 'while t…"   21 minutes ago      Exited (137) 2 minutes ago                       daemon_dave
```

-n 后面跟的是数量，你可以根据需要自行指定。

# 自动重启

有时候我们需要自动重启某些容器。

`--restart` 参数可以检测容器的退出代码，我们可以指定相关的信息，默认是不进行重启的。

## 一直重启

```
$ docker run --restart=always --name  daemon_dave -d ubuntu /bin/sh -c "while true; do echo hello world; sleep 1; done"
```

这里被设置为永远重启。

## 指定失败次数

有时候我们希望尝试一定次数之后就不再尝试了。

```
--restart=on-failure:5
```

这里是指失败五次之后就不再尝试了。

# 深入容器

`docker inspect` 可以获取更加详细的容器信息。

```
$ docker inspect hello-ubuntu
```

可以看到关于容器非常详细的信息。

# 容器的删除

如果一个容器不再需要，我们可以使用 `docker rm` 直接删除容器。

```
$ docker rm hello-ubuntu
hello-ubuntu
```

可以直接删除容器。

# 总结

本节主要以 ubuntu 这个镜像作为例子，讲述了对于 docker 容器的管理。

# 拓展阅读

## docker 的安装

[Mac 安装 Docker](https://houbb.github.io/2016/10/15/docker-install-on-mac)

[Windows7 安装 Docker](https://houbb.github.io/2016/10/15/docker-install-on-windows7)

[Windows10 安装 Docker](https://houbb.github.io/2019/12/18/docker-install-on-windows10)

## 更多学习



# 参考资料

《第一本 Docker 书》

* any list
{:toc}
