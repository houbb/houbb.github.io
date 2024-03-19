---
layout: post
title: Docker-03-Swarm
date:  2019-12-18 11:34:23 +0800
categories: [Docker]
tags: [docker, sh]
published: true
excerpt: Docker Swarm 集群介绍
---

# 了解 Swarm 集群

群集是一组运行Docker并加入群集的计算机。在此之后，您继续运行您习惯使用的Docker命令，但现在它们由群集管理器在群集上执行。

群中的机器可以是物理的或虚拟的。加入群组后，它们被称为节点。

Swarm管理器可以使用多种策略来运行容器，例如“最节点的节点” - 它使用容器填充利用率最低的机器。或“全局”，它确保每台机器只获得指定容器的一个实例。您指示swarm管理器在Compose文件中使用这些策略，就像您已经使用的那样。

群集管理器是群中唯一可以执行命令的机器，或授权其他机器作为工作者加入群集。工人只是在那里提供能力，并且没有权力告诉任何其他机器它能做什么和不能做什么。

到目前为止，您一直在本地计算机上以单主机模式使用Docker。

但是Docker也可以切换到swarm模式，这就是使用群集的能力。立即启用群集模式使当前计算机成为群集管理器。

从那时起，Docker就会运行您在管理的swarm上执行的命令，而不仅仅是在当前机器上。


# 设置你的集群

群由多个节点组成，可以是物理或虚拟机。

基本概念很简单：运行 `docker swarm init` 以启用swarm模式并使当前计算机成为一个swarm管理器，

然后在其他计算机上运行 `docker swarm join` 以使它们作为worker加入swarm。

选择下面的标签，了解它在各种情况下的表现。

我们使用VM快速创建一个双机群集并将其转换为群集。

## win10 创建一个 cluster


首先，快速创建虚拟交换机以供虚拟机（VM）共享，以便它们可以相互连接。

1. 启动Hyper-V Manager   【启用或关闭Windows功能】

2. 单击右侧菜单中的Virtual Switch Manager

3. 单击“外部”类型的“Create Virtual Switch”

4. 将其命名为myswitch，并选中该框以共享主机的活动网络适配器

现在，使用我们的节点管理工具docker-machine创建几个VM：

暂停。。。。

# 参考资料

https://docs.docker.com/get-started/part4/

https://www.altaro.com/hyper-v/create-hyper-v-virtual-switch/

* any list
{:toc}