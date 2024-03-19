---
layout: post
title: Docker learn-20-Docker 基本组件介绍
date:  2019-12-18 11:34:23 +0800
categories: [Docker]
tags: [docker, windows, devops, ci, sh]
published: true
---

# Docker 基本架构

Docker 使用客户端-服务器 (C/S) 架构模式，使用远程API来管理和创建Docker容器。

Docker 容器通过 Docker 镜像来创建。

容器与镜像的关系类似于面向对象编程中的对象与类。

## 核心流程

![image](https://user-images.githubusercontent.com/18375710/71565622-6b0e4580-2aeb-11ea-8293-a15a6e2c6506.png)

由于docker是C/S架构，因此必然具有客户端及服务端。

在这里客户端即为docker command，也就是用户执行的各种命令，如docker pull、docker build、docker run等。执行命令后，服务端即为docker deamon，接收及响应来自各个客户端的命令。

这里以拉取镜像为例，分为两种情况，分别是本地存在需拉取镜像(红色流程)和本地不存在需拉取的镜像(黑色流程)。

对于本地存在所需拉取镜像时，直接使用镜像实例化为一个容器；对于本地不存在所需镜像时，就要从容器仓库里搜索，搜索到之后将其下载至本地，然后使用该镜像创建一个容器。

## 核心组件

| 模块	| 说明 |
|:---|:---|
| Docker 镜像(Images)	| Docker 镜像是用于创建 Docker 容器的模板。 |
| Docker 容器(Container) |  容器是独立运行的一个或一组应用。 |
| Docker daemon	    | Docker daemon 是服务器组件，是 Docker 最核心的后台进程，我们也把它称为守护进程。|
| Docker 客户端(Client)	| Docker 客户端通过命令行或者其他工具使用Docker API 与 Docker 的守护进程通信。|
| Docker 主机(Host)	| 一个物理或者虚拟的机器用于执行 Docker 守护进程和容器。|
| Docker 仓库(Registry)	| Docker 仓库用来保存镜像，可以理解为代码控制中的代码仓库。Docker Hub供了庞大的镜像集合供使用。|
| Docker Machine	| Docker Machine是一个简化Docker安装的命令行工具，通过一个简单的命令行即可在相应的平台上安装Docker。|

#  docker客户端与服务器

docker client向docker daemon发送请求，docker daemon完成相应的任务，并把结果返还给容器。

docker client是一个泛称，它可以是命令行docker，也可以是遵循了docker api规则的客户端，简单地说可以理解为一个用于交互/发送指令的接口。

![image](https://user-images.githubusercontent.com/18375710/71565903-f688d600-2aed-11ea-9042-0e1408aec9bb.png)

# Docker Deamon

它负责响应来自 Docker Client 的请求，然后将这些请求翻译成系统调用完成容器管理操作。

该进程会在后台启动一个 API Server ，负责接收由 Docker Client 发送的请求，接收到的请求将通过Docker daemon 内部的一个路由分发调度，由具体的函数来执行请求。

## 组成部分

我们大致可以将其分为以下三部分：

Docker Server

Engine

Job

![image](https://user-images.githubusercontent.com/18375710/71565680-377feb00-2aec-11ea-8929-33fb8c020aa7.png)

Docker Daemon 可以认为是通过 Docker Server 模块接受 Docker Client 的请求，并在 Engine 中处理请求，然后根据请求类型，创建出指定的 Job 并运行。 

Docker Daemon 运行在 Docker host 上，负责创建、运行、监控容器，构建、存储镜像。

# 镜像（Image）

## 什么是Docker镜像？

简单地理解，Docker镜像就是一个Linux的文件系统（Root FileSystem），这个文件系统里面包含可以运行在Linux内核的程序以及相应的数据。

## Linux 基本知识

谈到这里，我们可能需要先补充一点与Linux操作系统相关的知识：

一般而言， Linux分为两个部分：Linux内核（Linux Kernel）与用户空间，而真正的Linux操作系统，是指Linux内核，我们常用的Ubuntu、CentOS等操作系统其实是不同厂商在Linux内核基础上添加自己的软件与工具集（tools）形成的发布版本（Linux Distribution）。

因此，我们也可以把镜像看成是上面所说的用户空间，当Docker通过镜像创建一个容器时，就是将镜像定义好的用户空间作为独立隔离的进程运行在宿主机的Linux内核之上。

## 特征

这里要强调一下镜像的两个特征：

镜像是分层（Layer）的：即一个镜像可以多个中间层组成，多个镜像可以共享同一中间层，我们也可以通过在镜像添加多一层来生成一个新的镜像。

镜像是只读的（read-only）：镜像在构建完成之后，便不可以再修改，而上面我们所说的添加一层构建新的镜像，这中间实际是通过创建一个临时的容器，在容器上增加或删除文件，从而形成新的镜像，因为容器是可以动态改变的。

通过下面的示意图，我可以更好地理解Docker镜像与Linux的关系：

![image](https://user-images.githubusercontent.com/18375710/71565825-5468ee00-2aed-11ea-83f4-02c99287f747.png)

# 容器（Container）

容器与镜像的关系，就如同面向编程中对象与类之间的关系。

因为容器是通过镜像来创建的，所以必须先有镜像才能创建容器，而生成的容器是一个独立于宿主机的隔离进程，并且有属于容器自己的网络和命名空间。

我们前面介绍过，镜像由多个中间层（layer）组成，生成的镜像是只读的，但容器却是可读可写的，这是因为容器是在镜像上面添一层读写层（writer/read layer）来实现的，如下图所示：

![image](https://user-images.githubusercontent.com/18375710/71565839-7498ad00-2aed-11ea-8fa8-fd6231b22a8f.png)

# 仓库（Repository）

仓库（Repository）是集中存储镜像的地方，这里有个概念要区分一下，那就是仓库与仓库服务器(Registry)是两回事，像我们上面说的Docker Hub，就是Docker官方提供的一个仓库服务器，不过其实有时候我们不太需要太过区分这两个概念。

## 公共仓库

公共仓库一般是指Docker Hub，前面我们已经多次介绍如何从Docker Hub获取镜像，除了获取镜像外，我们也可以将自己构建的镜像存放到Docker Hub，这样，别人也可以使用我们构建的镜像。

不过要将镜像上传到Docker Hub，必须先在Docker的官方网站上注册一个账号。

## 私有仓库

有时候自己部门内部有一些镜像要共享时，如果直接导出镜像拿给别人又比较麻烦，使用像Docker Hub这样的公共仓库又不是很方便，这时候我们可以自己搭建属于自己的私有仓库服务，用于存储和分布我们的镜像。

Docker官方提供了registry这个镜像，可以用于搭建私有仓库服务，我们把镜像拉到本地之后，用下面命令创建该镜像的容器便可以搭建一个仓库服务


# 拓展阅读

## docker 的安装

[Mac 安装 Docker](https://houbb.github.io/2016/10/15/docker-install-on-mac)

[Windows7 安装 Docker](https://houbb.github.io/2016/10/15/docker-install-on-windows7)

[Windows10 安装 Docker](https://houbb.github.io/2019/12/18/docker-install-on-windows10)

## docker 基本操作

[Container 的基本生命周期管理](https://houbb.github.io/2019/12/18/docker-learn-19-container-manager)

## 更多学习



# 参考资料

《Docker 进阶与实战》

[Docker基本组件](https://blog.csdn.net/u010039418/article/details/87950947)

[Docker组件](https://www.jianshu.com/p/1ffe8c18dfd5)

[Docker的三大核心组件：镜像、容器与仓库](http://dockone.io/article/9249)

* any list
{:toc}
