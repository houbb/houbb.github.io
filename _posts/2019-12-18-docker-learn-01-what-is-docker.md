---
layout: post
title:  Docker 入门介绍
date:  2019-12-18 11:34:23 +0800
categories: [Docker]
tags: [docker, container, sh]
published: true
excerpt: Docker 入门介绍
---

# 配置的难题

软件开发最大的麻烦事之一，就是环境配置。用户计算机的环境都不相同，你怎么知道自家的软件，能在那些机器跑起来？

环境配置如此麻烦，换一台机器，就要重来一次，旷日费时。很多人想到，能不能从根本上解决问题，软件可以带环境安装？也就是说，安装的时候，把原始环境一模一样地复制过来。

# 虚拟机

虚拟机（virtual machine）就是带环境安装的一种解决方案。它

可以在一种操作系统里面运行另一种操作系统，比如在 Windows 系统里面运行 Linux 系统。应用程序对此毫无感知，因为虚拟机看上去跟真实系统一模一样，而对于底层系统来说，虚拟机就是一个普通文件，不需要了就删掉，对其他部分毫无影响。

虽然用户可以通过虚拟机还原软件的原始环境。但是，这个方案有几个缺点。

## 资源占用多

虚拟机会独占一部分内存和硬盘空间。它运行的时候，其他程序就不能使用这些资源了。哪怕虚拟机里面的应用程序，真正使用的内存只有 1MB，虚拟机依然需要几百 MB 的内存才能运行。

## 冗余步骤多

虚拟机是完整的操作系统，一些系统级别的操作步骤，往往无法跳过，比如用户登录。

## 启动慢

启动操作系统需要多久，启动虚拟机就需要多久。可能要等几分钟，应用程序才能真正运行。


# Linux 容器

由于虚拟机存在这些缺点，Linux 发展出了另一种虚拟化技术：Linux 容器（Linux Containers，缩写为 LXC）。

Linux 容器不是模拟一个完整的操作系统，而是对进程进行隔离。或者说，在正常进程的外面套了一个保护层。对于容器里面的进程来说，它接触到的各种资源都是虚拟的，从而实现与底层系统的隔离。

由于容器是进程级别的，相比虚拟机有很多优势。

## 启动快

容器里面的应用，直接就是底层系统的一个进程，而不是虚拟机内部的进程。所以，启动容器相当于启动本机的一个进程，而不是启动一个操作系统，速度就快很多。

## 资源占用少

容器只占用需要的资源，不占用那些没有用到的资源；虚拟机由于是完整的操作系统，不可避免要占用所有资源。另外，多个容器可以共享资源，虚拟机都是独享资源。

## 体积小

容器只要包含用到的组件即可，而虚拟机是整个操作系统的打包，所以容器文件比虚拟机文件要小很多。

总之，容器有点像轻量级的虚拟机，能够提供虚拟化的环境，但是成本开销小得多。

# Docker 入门介绍

Docker 的主要用途，目前有三大类。

（1）提供一次性的环境。比如，本地测试他人的软件、持续集成的时候提供单元测试和构建的环境。

（2）提供弹性的云服务。因为 Docker 容器可以随开随关，很适合动态扩容和缩容。

（3）组建微服务架构。通过多个容器，一台机器可以跑多个服务，因此在本机就可以模拟出微服务架构。

# Docker 安装

## 安装

[Docker 安装](https://houbb.github.io/2016/10/15/docker)

## 测试

```
$ docker version
Client:
 Version:	18.03.0-ce
 API version:	1.37
 Go version:	go1.9.4
 Git commit:	0520e24
 Built:	Wed Mar 21 23:06:22 2018
 OS/Arch:	darwin/amd64
 Experimental:	false
 Orchestrator:	swarm

Server:
 Engine:
  Version:	18.03.0-ce
  API version:	1.37 (minimum version 1.12)
  Go version:	go1.9.4
  Git commit:	0520e24
  Built:	Wed Mar 21 23:14:32 2018
  OS/Arch:	linux/amd64
  Experimental:	false
```

## 服务的启动

Docker 是服务器----客户端架构。

命令行运行docker命令的时候，需要本机有 Docker 服务。

如果这项服务没有启动，可以用下面的命令启动

```sh
# service 命令的用法
$ sudo service docker start

# systemctl 命令的用法
$ sudo systemctl start docker
```

# image 文件

Docker 把应用程序及其依赖，打包在 image 文件里面。

只有通过这个文件，才能生成 Docker 容器。image 文件可以看作是容器的模板。Docker 根据 image 文件生成容器的实例。同一个 image 文件，可以生成多个同时运行的容器实例。

image 是二进制文件。实际开发中，一个 image 文件往往通过继承另一个 image 文件，加上一些个性化设置而生成。

举例来说，你可以在 Ubuntu 的 image 基础上，往里面加入 Apache 服务器，形成你的 image。

```
# 列出本机的所有 image 文件。
$ docker image ls

# 删除 image 文件
$ docker image rm [imageName]
```

image 文件是通用的，一台机器的 image 文件拷贝到另一台机器，照样可以使用。一般来说，为了节省时间，我们应该尽量使用别人制作好的 image 文件，而不是自己制作。即使要定制，也应该基于别人的 image 文件进行加工，而不是从零开始制作。

为了方便共享，image 文件制作完成后，可以上传到网上的仓库。

Docker 的官方仓库 [Docker Hub](https://hub.docker.com/) 是最重要、最常用的 image 仓库。

此外，出售自己制作的 image 文件也是可以的。

# Hello World

感受一下 docker 的魅力。

## 下载 image

首先，运行下面的命令，将 image 文件从仓库抓取到本地。

```
$   docker image pull library/hello-world
```

由于 Docker 官方提供的 image 文件，都放在library组里面，所以它的是默认组，可以省略。

因此，上面的命令可以写成下面这样。

```
$   docker image pull hello-world
```

## 查看 image 列表

```
$   docker image ls
```

## 运行 

```
$   docker container run hello-world
```

docker container run命令会从 image 文件，生成一个正在运行的容器实例。

- 注意

注意，docker container run命令具有自动抓取 image 文件的功能。

如果发现本地没有指定的 image 文件，就会从仓库自动抓取。因此，前面的docker image pull命令并不是必需的步骤。

- 日志

```
Hello from Docker!
This message shows that your installation appears to be working correctly.

...
```

输出这段提示以后，hello world就会停止运行，容器自动终止。

- 手动 kill

对于那些不会自动终止的容器，必须使用docker container kill 命令手动终止。

```
$ docker container kill [containID]
```

# 容器文件

image 文件生成的容器实例，本身也是一个文件，称为容器文件。

也就是说，一旦容器生成，就会同时存在两个文件： image 文件和容器文件。而且关闭容器并不会删除容器文件，只是容器停止运行而已。

```
# 列出本机正在运行的容器
$ docker container ls

# 列出本机所有容器，包括终止运行的容器
$ docker container ls --all
```

## 移除

终止运行的容器文件，依然会占据硬盘空间，可以使用 `docker container rm` 命令删除。

```
$ docker container rm [containerID]
```

运行上面的命令之后，再使用 `docker container ls --all` 命令，就会发现被删除的容器文件已经消失了。


# Dockerfile 文件

学会使用 image 文件以后，接下来的问题就是，如何可以生成 image 文件？

如果你要推广自己的软件，势必要自己制作 image 文件。

这就需要用到 Dockerfile 文件。它是一个文本文件，用来配置 image。Docker 根据 该文件生成二进制的 image 文件。

下面通过一个实例，演示如何编写 Dockerfile 文件。

# 常见命令

- 重启已经停止的 container

```
$ docker container restart ${container_id}
```

# docker search 列出 TAG


## 方案一

直接去 hub 上去查看

## 方案二

- docker-show-repo-tag.sh

```sh
#!/bin/sh
#
# Simple script that will display docker repository tags.
#
# Usage:
#   $ docker-show-repo-tags.sh ubuntu centos
for Repo in $* ; do
  curl -s -S "https://registry.hub.docker.com/v2/repositories/library/$Repo/tags/" | \
    sed -e 's/,/,\n/g' -e 's/\[/\[\n/g' | \
    grep '"name"' | \
    awk -F\" '{print $4;}' | \
    sort -fu | \
    sed -e "s/^/${Repo}:/"
done
```

- search 时使用命令

```
$ ./docker-show-repo-tags.sh ubuntu centos
ubuntu:14.04
ubuntu:16.04
ubuntu:17.04
ubuntu:latest
...
```

# 参考资料

[Docker 入门教程](http://www.ruanyifeng.com/blog/2018/02/docker-tutorial.html)

[Docker 微服务](http://www.ruanyifeng.com/blog/2018/02/docker-wordpress-tutorial.html)

- 自定义镜像

https://yeasy.gitbooks.io/docker_practice/image/build.html

- docker search 列出 TAG

http://suntus.github.io/2017/12/07/docker%20search%E6%97%B6%E5%88%97%E5%87%BAtag/

* any list
{:toc}