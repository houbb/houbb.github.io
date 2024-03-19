---
layout: post
title: Docker learn-22-image 镜像拓展知识
date:  2019-12-18 11:34:23 +0800
categories: [Docker]
tags: [docker, windows, devops, ci, sh]
published: true
---

# Docker image 扩展知识

Cgroup和Namespace等容器相关技术已经存在很久，在VPS、PaaS等领域也有很广泛的应用，但是直到Docker的出现才真正把这些技术带入到大众的视野。

同样，Docker的出现才让我们发现原来可以这样管理镜像，可以这样糅合老技术以适应新的需求。

Docker引入联合挂载技术（Union mount）使镜像分层成为可能；而Git式的管理方式，使基础镜像的重用成为可能。

现在就了解一下相关的技术吧。

# 联合挂载

联合文件系统这种思想由来已久，这类文件系统会把多个目录（可能对应不同的文件系统）挂载到同一个目录，对外呈现这些目录的联合。

1993年Werner Almsberger实现的“Inheriting File System”可以看作是一个开端。

但是该项目最终废弃了，而后其他开发者又为Linux社区贡献了unionfs（2003年）、 aufs（2006年） 和Union mounts（2004年），但都因种种原因未合入社区。

直到OverlayFS在2014年合入Linux主线，才结束了Linux主线中无联合文件系统的历史。

这种联合文件系统早期是用在LiveCD领域。

在一些发行版中我们可以使用LiveCD快速地引导一个系统去初始化或检测磁盘等硬件资源。

**之所以速度很快，是因为我们不需要把CD中的信息拷贝到磁盘或内存等可读可写的介质中。**

而只需把CD只读挂载到特定目录，然后在其上附加一层可读可写的文件层，任何导致文件变动的修改都会被添加到新的文件层内。

这就是写时复制（copy-on-write）的概念。

# 写时复制

写时复制是Docker image之所以如此强大的一个重要原因。

## fork

写时复制在操作系统领域有很广泛的应用，fork就是一个经典的例子。

当父进程fork子进程时，内核并没有为子进程分配内存（当然基本的进程控制块、堆栈还是需要的），而是让父子进程共享内存。

当两者之一修改共享内存时，会触发一次缺页异常导致真正的内存分配。

这样做既加速了子进程的创建速度，又减少了内存的消耗（如图3-4所示）。

![image](https://user-images.githubusercontent.com/18375710/71612508-d9cacc00-2bdb-11ea-9bd3-bf3ab8f33799.png)

Docker image使用写时复制也是为了达到相同目的：快和节省空间。

我们以内核主线中的OverlayFS作为例子介绍一下写时复制。

OverlayFS会把一个“上层”的目录和“下层”的目录组合在一起：“上层”目录和“下层”目录或者组合，或者覆盖，或者一块呈现。当然“下层”目录也可以是联合文件系统的挂载点。

首先你需要有支持OverlayFS 的Linux环境（内核3.18以上）。

Ubuntu用户可以从Ubuntu维护的kernel版本中下载最新的内核安装包（比如vivid版本）。

当然也可以手工编译新版的kernel，但这不是本文的重点，所以暂不细说。

下面的测试为了突出变化，删除了无用的文件。

```
$ cat /proc/filesystems  | grep overlay
nodev  overlay
#利用上述命令可确定内核支持OverlayFS。下面以建楼的形式来描述联合文件系统的工作方式，首先需要有混凝土和钢筋等基础原料作为最底层依赖。示例如下：
$ mkdir material
$ echo "bad concrete" > material/concrete
$ echo  "rebar" > material/rebar
# 但是在建设之前，发现混凝土的质量有问题，所以运来了新的混凝土，同时运来了大理石用作地板砖。示例如下：
$ mkdir material2
$ echo "good concrete" > material2/concrete
$ echo  "marble" > material2/marble
# 现在已经准备好了建筑所需要的所有材料，下面创建build目录作为具体施工的层。另外每个OverlayFS挂载点还依赖一些必要的目录，包括merge（工作目录）、work（OverlayFS所必须的一个空目录）等，如下：
$ mkdir merge work build 
$ ls 
build  material  material2  merge  work
# 然后挂载OverlayFS，下面的命令指定了material目录为最底层，material2目录为次底层，build目录为上层。至此已经完成了建楼所需要的所有依赖。
# mount -t overlay overlay -olowerdir= material: material2,upperdir= build,workdir=work  merge
```

## 1. 覆盖

现在，在merge目录中可以看到混凝土、钢筋和大理石了。

并且混凝土是合格的，也就是说material2目录中的concrete覆盖了material目录的对应文件。

所以目录所处的层级是很重要的，上层的文件会覆盖同名的下层文件；另外现在的文件系统中会保存两份混凝土数据，所以不合理地修改一个大文件会使image的size大增。

示例如下：

```
$ ls -l */*
-rw-r--r-- 1 root root   19 Aug 31 15:19 material/concrete
-rw-r--r-- 1 root root   12 Aug 31 15:19 material/rebar
-rw-r--r-- 1 root root   20 Aug 31 15:19 material2/concrete
-rw-r--r-- 1 root root   13 Aug 31 16:03 material2/marble
-rw-r--r-- 1 root root   12 Aug 31 15:19 material2/rebar
-rw-r--r-- 1 root root   20 Aug 31 15:19 merge/concrete
-rw-r--r-- 1 root root   13 Aug 31 16:03 merge/marble
-rw-r--r-- 1 root root   12 Aug 31 15:19 merge/rebar 
$ cat merge/concrete
good concrete
```

## 新增

接下来要在merge目录下建立我们的建筑框架，此时可以看到frame文件出现在了build目录中。

示例如下：

```
# echo "main structure" >merge/frame
$ ls  */* -l 
-rw-r--r-- 1 root root   15 Aug 31 17:48 build/frame    
-rw-r--r-- 1 root root   19 Aug 31 15:19 material/concrete
-rw-r--r-- 1 root root   12 Aug 31 15:19 material/rebar
-rw-r--r-- 1 root root   20 Aug 31 15:19 material2/concrete
-rw-r--r-- 1 root root   13 Aug 31 16:03 material2/marble
-rw-r--r-- 1 root root   12 Aug 31 15:19 material2/rebar
-rw-r--r-- 1 root root   19 Aug 31 15:19 merge/concrete
-rw-r--r-- 1 root root   15 Aug 31 17:48 merge/frame
-rw-r--r-- 1 root root   13 Aug 31 16:03 merge/marble
```

## 删除

如果此时客户又提出了新的需求，他们不希望使用大理石地板了，那么我们就得在merge目录删掉大理石。

可以看到删除底层文件系统中的文件或目录时，会在上层建立一个同名的主次设备号都为0的字符设备，但并没有直接删掉marble文件。

所以删除并不一定能减小image的大小，并且要注意的是，如果制作image时使用到了一些关键的信息（用户名、密码等），则需要在同层删除，不然这些信息依然会存在于image中。

```
$ rm merge/marble 
$ ls -l
c--------- 1 root root 0, 0 Aug 31 18:00 build/marble
-rw-r--r-- 1 root root   19 Aug 31 15:19 merge/concrete
-rw-r--r-- 1 root root   15 Aug 31 17:48 merge/frame
```

联合文件系统是实现写时复制的基础。现在社区和操作系统厂家都维护着几种该类文件系统，比如Ubuntu系统自带aufs的支持，Redhat和Suse则采用的是devicemapper方案等。

一些文件系统比如btrfs也具有写时复制的能力，故也可以作为Docker的存储驱动。

这些存储驱动的存储结构和性能都有显著的差异，所以我们需要根据实际情况选用合理的后端存储驱动。

# Git式管理

Git是由Linux之父Linus Torvalds创立的一个开源项目，是一种代码的分布式版本控制工具。

因其具有强大的分支能力、便于协作开发等优点而取得了空前的成功，github.com作为托管代码的仓库也变得越来越流行。

两者的合力直接变革了传统的软件托管方案。

Docker作为新的开源项目，充分借鉴了Git的优点（利用分层）来管理镜像，使image layer的复用变成了可能，并且类比Github提出了Dockerhub的概念，一定程度上变革了软件发布流程。

# 拓展阅读

## docker 的安装

[Mac 安装 Docker](https://houbb.github.io/2016/10/15/docker-install-on-mac)

[Windows7 安装 Docker](https://houbb.github.io/2016/10/15/docker-install-on-windows7)

[Windows10 安装 Docker](https://houbb.github.io/2019/12/18/docker-install-on-windows10)

## docker 基本操作

[Container 的基本生命周期管理](https://houbb.github.io/2019/12/18/docker-learn-19-container-manager)

[Maven 代码发布到 maven 中央仓库](https://houbb.github.io/2017/09/28/jar-to-maven)

## 底层原理

[]()

# 参考资料

《Docker 进阶与实战》

## 镜像

[《Docker进阶与实战》——3.4节Docker image扩展知识](https://blog.csdn.net/weixin_33995481/article/details/90526518)

* any list
{:toc}
