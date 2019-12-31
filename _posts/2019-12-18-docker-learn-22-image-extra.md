---
layout: post
title: Docker learn-22-image 镜像拓展知识
date:  2019-12-18 10:50:21 +0800
categories: [Devpos]
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
