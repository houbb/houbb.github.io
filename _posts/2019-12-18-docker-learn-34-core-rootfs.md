---
layout: post
title: Docker learn-09-Docker 核心技术 CGROUP
date:  2019-12-18 11:34:23 +0800
categories: [Devpos]
tags: [docker, windows, devops, sh]
published: true
---

# rootfs

rootfs 代表一个 Docker 容器在启动时(而非运行后)其内部进程可见的文件系统视角，或者叫 Docker 容器的根目录。

先来看一下，Linux 操作系统内核启动时，内核会先挂载一个只读的 rootfs，当系统检测其完整性之后，决定是否将其切换到读写模式。

Docker 沿用这种思想，不同的是，挂载rootfs 完毕之后，没有像 Linux 那样将容器的文件系统切换到读写模式，而是利用联合挂载技术，在这个只读的 rootfs 上挂载一个读写的文件系统，挂载后该读写文件系统空空如也。

Docker 文件系统简单理解为：只读的 rootfs + 可读写的文件系统。

假设运行了一个 Ubuntu 镜像，其文件系统简略如下

![image](https://user-images.githubusercontent.com/18375710/71608888-53a08c80-2bbf-11ea-93a5-fb49c24c8021.png)

在容器中修改用户视角下文件时，Docker 借助 COW(copy-on-write) 机制节省不必要的内存分配。

# 容器中的层的概念

在rootfs的基础上，Docker公司创新的使用了多个增量rootfs联合挂载一个完整rootfs的方案

例如，C目录是由A和B挂载得到，拥有A和B的所有文件层分为三种，如下图

![image](https://user-images.githubusercontent.com/18375710/71608933-7df24a00-2bbf-11ea-8d44-f16617c7e6b2.png)

## 1.只读层

位于rootfs最下面，挂载方式是只读，这些层以增量的方式分别包含了操作系统的一部分

## 2.可读写层

挂载方式为 `rw`，比如，当删除只读的一个xx文件时，这个删除操作实际只是在可读写层创建了一个名叫.wh.xx的文件，当两个层联合挂载后，xx文件会被.wh.xx文件遮挡，相当于“消失了”

在容器中修改文件时，Docker会从上到下在各镜像层中查找文件。找到后会把此文件复制到容器层（可读写层），这就是Copy on Write

## 3. init层

以一个 `-init` 结尾的层，在只读和读写层之间，用来存放/etc/hosts、/etc/resolve.conf等信息，这此文件本来是属于操作系统层的一部分，但是用户往往需要在运行时指定hostname，所以就需要在可读写层修改，这些修改往往保对当前容器有效，我们并不想在docker commit的时候，把这些和读写层一起提交，于是就有了这一层

# 拓展阅读

[code shell docker 系列博客](https://coolshell.cn/tag/docker)

# 参考资料

[容器核心技术--Cgroup 与 Namespace](https://www.jianshu.com/p/ab423c3db59d)

[容器技术的核心](https://www.cnblogs.com/chenqionghe/p/11468451.html?utm_source=tuicool&utm_medium=referral)

[Docker基础技术-Linux Namespace](https://www.jianshu.com/p/353eb8d8eb05)

* any list
{:toc}