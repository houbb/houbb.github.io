---
layout: post
title: Docker learn-22-image 镜像的组织结构
date:  2019-12-18 11:34:23 +0800
categories: [Docker]
tags: [docker, windows, devops, ci, sh]
published: true
---

# docker image 到底是什么

image 里面是一层层文件系统，叫做 Union FS（联合文件系统）。

联合文件系统，可以将几层目录挂载到一起，形成一个虚拟文件系统。

虚拟文件系统的目录结构就像普通 linux 的目录结构一样，docker 通过这些文件再加上宿主机的内核提供了一个 linux 的虚拟环境。

每一层文件系统我们叫做一层 layer，联合文件系统可以对每一层文件系统设置三种权限，只读（readonly）、读写（readwrite）和写出（whiteout-able），但是 docker 镜像中每一层文件系统都是只读的。

构建镜像的时候，从一个最基本的操作系统开始，每个构建的操作都相当于做一层的修改，增加了一层文件系统。

一层层往上叠加，上层的修改会覆盖底层该位置的可见性，这也很容易理解，就像上层把底层遮住了一样。

当你使用的时候，你只会看到一个完全的整体，你不知道里面有几层，也不清楚每一层所做的修改是什么。

ps: 让人想到了 ps 的图层。

## 结构

类似这样：

![image](https://user-images.githubusercontent.com/18375710/71611178-e21e0980-2bd1-11ea-83ca-f717bb8cac35.png)

## 基本结构

从基本的看起，一个典型的 Linux 文件系统由 bootfs 和 rootfs 两部分组成。

bootfs(boot file system) 主要包含bootloader 和 kernel，bootloader 主要用于引导加载 kernel，当 kernel 被加载到内存中后 bootfs 会被 umount 掉。

rootfs (root file system) 包含的就是典型 Linux 系统中的/dev，/proc，/bin，/etc 等标准目录和文件。

下图就是 docker image 中最基础的两层结构，不同的 linux 发行版（如 ubuntu 和 CentOS ) 在 rootfs 这一层会有所区别，体现发行版本的差异性。

![image](https://user-images.githubusercontent.com/18375710/71611156-c9155880-2bd1-11ea-9a2f-cd23df4d118f.png)

## 对比 linux 加载流程

传统的 Linux 加载 bootfs 时会先将 rootfs 设为 read-only，然后在系统自检之后将 rootfs 从 read-only 改为 read-write，然后我们就可以在 rootfs 上进行读写操作了。

但 Docker 在 bootfs 自检完毕之后并不会把 rootfs 的 read-only 改为 read-write，而是利用 union mount（UnionFS 的一种挂载机制）将 image 中的其他的 layer 加载到之前的 read-only 的 rootfs层之上，每一层 layer 都是 rootfs 的结构，并且是read-only 的。

所以，我们是无法修改一个已有镜像里面的 layer 的！只

有当我们创建一个容器，也就是将 Docker 镜像进行实例化，系统会分配一层空的 read-write 的 rootfs ，用于保存我们做的修改。

一层 layer 所保存的修改是增量式的，就像 git 一样。

![image](https://user-images.githubusercontent.com/18375710/71611197-04b02280-2bd2-11ea-9416-bdff019389be.png)

综上，image其实就是一个文件系统，它与宿主机的内核一起为程序提供一个虚拟的linux环境。

在启动docker container时，依据image，docker会为container构建出一个虚拟的linux环境。

# Docker image的组织结构

上节讲到Docker image是用来启动容器的只读模板，提供容器启动所需要的rootfs，那么Docker是怎么组织这些数据的呢？

## 数据的内容

Docker image包含着数据及必要的元数据。

数据由一层层的image layer组成，元数据则是一些JSON文件，用来描述数据（image layer）之间的关系以及容器的一些配置信息。

下面使用overlay存储驱动对Docker image的组织结构进行分析，首先需要启动Docker daemon，命令如下：

```
# docker daemon -D –s overlay –g /var/lib/docker
```

### busybox 的例子

这里从官方镜像库下载busybox镜像用作分析。

由于前面已经下载过该镜像，所以这里并没有重新下载，而只是做了简单的校验。

可以看到Docker对镜像进行了完整性校验，这种完整性的凭证是由镜像仓库提供的。

相关内容会在后面的章节提到，这里不再展开介绍。

- 拉取镜像

```
$ docker pull busybox                                                                                                                       
Using default tag: latest
latest: Pulling from library/busybox
bdbbaa22dec6: Pull complete 
Digest: sha256:6915be4043561d64e0ab0f8f098dc2ac48e077fe23f488ac24b665166898115a
Status: Downloaded newer image for busybox:latest
docker.io/library/busybox:latest
```

- 展现历史

```
$ docker history busybox                                                                                                                    
IMAGE               CREATED             CREATED BY                                      SIZE                COMMENT
6d5fcfe5ff17        4 days ago          /bin/sh -c #(nop)  CMD ["sh"]                   0B                  
<missing>           4 days ago          /bin/sh -c #(nop) ADD file:45da761e1c56c548b…   1.22MB
```

ps: 我这边本地验证似乎和书上有所不同，无法复现。

### 总体信息

```
# ls  -l /var/lib/docker
total 44
drwx------ 2 root root 4096 Jul 24 18:41 containers           #存放容器运行相关信息
drwx------ 3 root root 4096 Apr 13 14:32 execdriver 
drwx------ 6 root root 4096 Jul 24 18:43 graph                #Image各层的元数据
drwx------ 2 root root 4096 Jul 24 18:41 init
-rw-r--r-- 1 root root 5120 Jul 24 18:41 linkgraph.db
drwxr-xr-x 5 root root 4096 Jul 24 18:43 overlay              #Image各层数据
-rw------- 1 root root  106 Jul 24 18:43 repositories-overlay #Image总体信息
drwx------ 2 root root 4096 Jul 24 18:43 tmp
drwx------ 2 root root 4096 Jul 24 19:09 trust                #验证相关信息
drwx------ 2 root root 4096 Jul 24 18:41 volumes              #数据卷相关信息
```

从 repositories-overlay 文件可以看到该存储目录下的所有image以及其对应的layer ID。

为了减少干扰，实验环境之中只包含一个镜像，其ID为8c2e06607696bd4af，如下。

```
# cat repositories-overlay  |python -m json.tool
{
"Repositories": {
    "busybox": {
        "latest": "8c2e06607696bd4afb3d03b687e361cc43cf8ec1a4a725bc96e39f05ba97dd55"
            }
        }
}
```

### 数据和元数据

graph目录和overlay目录包含本地镜像库中的所有元数据和数据信息。

对于不同的存储驱动，数据的存储位置和存储结构是不同的，本章不做深入的讨论。可以通过下面的命令观察数据和元数据中的具体内容。

元数据包含json和layersize两个文件，其中json文件包含了必要的层次和配置信息，layersize文件则包含了该层的大小。

```
# ls -l graph/8c2e06607696bd4afb3d03b687e361cc43cf8ec1a4a725bc96e39f05ba97dd55/
total 8
-rw------- 1 root root 1446 Jul 24 18:43 json       
-rw------- 1 root root    1 Jul 24 18:43 layersize  
# ls -l overlay/8c2e06607696bd4afb3d03b687e361cc43cf8ec1a4a725bc96e39f05ba97dd55/
total 4
drwxr-xr-x 17 root root 4096 Jul 24 18:43 root
```

可以看到Docker镜像存储路径下已经存储了足够的信息。

Docker daemon可以通过这些信息还原出Docker image：

先通过repositories-overlay获得image对应的layer ID；

再根据layer对应的元数据梳理出image包含的所有层，以及层与层之间的关系；

然后使用联合挂载技术还原出容器启动所需要的 rootfs 和一些基本的配置信息。


# 数据的组织

从上节看到，通过repositories-overlay可以找到某个镜像的最上层layer ID，进而找到对应的元数据，那么元数据都存了哪些信息呢？可以通过docker inspect得到该层的元数据。

为了简单起见，下面的命令输出中删除了一些与讨论无关的层次信息。

注意 docker inspect并不是直接输出磁盘中的元数据文件，而是对元数据文件进行了整理，使其更易读，比如标记镜像创建时间的条目由created改成了Created；

标记容器配置的条目由container_config改成了ContainerConfig，但是两者的数据是完全一致的。

```
$ docker inspect busybox:latest  
```

结果如下：

```json
[
    {
        "Id": "sha256:6d5fcfe5ff170471fcc3c8b47631d6d71202a1fd44cf3c147e50c8de21cf0648",
        "RepoTags": [
            "busybox:latest"
        ],
        "RepoDigests": [
            "busybox@sha256:6915be4043561d64e0ab0f8f098dc2ac48e077fe23f488ac24b665166898115a"
        ],
        "Parent": "",
        "Comment": "",
        "Created": "2019-12-26T21:20:11.581830492Z",
        "Container": "5fd9b79f6aa666515be39ca8e79731094d7db277650d0271346eaa37ea1e3252",
        "ContainerConfig": {
            "Hostname": "5fd9b79f6aa6",
            "Domainname": "",
            "User": "",
            "AttachStdin": false,
            "AttachStdout": false,
            "AttachStderr": false,
            "Tty": false,
            "OpenStdin": false,
            "StdinOnce": false,
            "Env": [
                "PATH=/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin"
            ],
            "Cmd": [
                "/bin/sh",
                "-c",
                "#(nop) ",
                "CMD [\"sh\"]"
            ],
            "ArgsEscaped": true,
            "Image": "sha256:eedc135aa40055799748875f21cbfa13704fb1e1675c6eb3b997ea25a4bf10c4",
            "Volumes": null,
            "WorkingDir": "",
            "Entrypoint": null,
            "OnBuild": null,
            "Labels": {}
        },
        "DockerVersion": "18.06.1-ce",
        "Author": "",
        "Config": {
            "Hostname": "",
            "Domainname": "",
            "User": "",
            "AttachStdin": false,
            "AttachStdout": false,
            "AttachStderr": false,
            "Tty": false,
            "OpenStdin": false,
            "StdinOnce": false,
            "Env": [
                "PATH=/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin"
            ],
            "Cmd": [
                "sh"
            ],
            "ArgsEscaped": true,
            "Image": "sha256:eedc135aa40055799748875f21cbfa13704fb1e1675c6eb3b997ea25a4bf10c4",
            "Volumes": null,
            "WorkingDir": "",
            "Entrypoint": null,
            "OnBuild": null,
            "Labels": null
        },
        "Architecture": "amd64",
        "Os": "linux",
        "Size": 1219782,
        "VirtualSize": 1219782,
        "GraphDriver": {
            "Data": {
                "MergedDir": "/mnt/sda1/var/lib/docker/overlay2/dd417b6aa7cc90ff104081c1736d911bf2651d699b318c515edc75b1ddf0e7d5/merged",
                "UpperDir": "/mnt/sda1/var/lib/docker/overlay2/dd417b6aa7cc90ff104081c1736d911bf2651d699b318c515edc75b1ddf0e7d5/diff",
                "WorkDir": "/mnt/sda1/var/lib/docker/overlay2/dd417b6aa7cc90ff104081c1736d911bf2651d699b318c515edc75b1ddf0e7d5/work"
            },
            "Name": "overlay2"
        },
        "RootFS": {
            "Type": "layers",
            "Layers": [
                "sha256:195be5f8be1df6709dafbba7ce48f2eee785ab7775b88e0c115d8205407265c5"
            ]
        },
        "Metadata": {
            "LastTagTime": "0001-01-01T00:00:00Z"
        }
    }
]
```

对于上面的输出，有几项需要重点说明一下：

Id：Image的ID。通过上面的讨论，可以看到image ID实际上只是最上层的layer ID，所以docker inspect也适用于任意一层layer。

Parent：该layer的父层，可以递归地获得某个image的所有layer信息。

Comment：非常类似于Git的commit message，可以为该层做一些历史记录，方便其他人理解。

Container：这个条目比较有意思，其中包含哲学的味道。比如前面提到容器的启动需要以image为模板。但又可以把该容器保存为镜像，所以一般来说image的每个layer都保存自一个容器，所以该容器可以说是image layer的“模板”。

Config：包含了该image的一些配置信息，其中比较重要的是：“env”容器启动时会作为容器的环境变量；“Cmd”作为容器启动时的默认命令；“Labels”参数可以用于docker images命令过滤。

Architecture：该image对应的CPU体系结构。现在Docker官方支持amd64，对其他体系架构的支持也在进行中。

通过这些元数据信息，可以得到某个image包含的所有layer，进而组合出容器的rootfs，再加上元数据中的配置信息（环境变量、启动参数、体系架构等）作为容器启动时的参数。至此已经具备启动容器必需的所有信息。

ps: 这些参数的信息应该根据官方学习。

# 拓展阅读

## docker 的安装

[Mac 安装 Docker](https://houbb.github.io/2016/10/15/docker-install-on-mac)

[Windows7 安装 Docker](https://houbb.github.io/2016/10/15/docker-install-on-windows7)

[Windows10 安装 Docker](https://houbb.github.io/2019/12/18/docker-install-on-windows10)

## docker 基本操作

[Container 的基本生命周期管理](https://houbb.github.io/2019/12/18/docker-learn-19-container-manager)

[Maven 代码发布到 maven 中央仓库](https://houbb.github.io/2017/09/28/jar-to-maven)

## 更多学习



# 参考资料

《Docker 进阶与实战》

## 镜像

[《Docker进阶与实战》——3.3节Docker image的组织结构](https://blog.csdn.net/weixin_34194087/article/details/90526912)

[docker image 到底是什么](https://www.jianshu.com/p/274af1c0163e)

[Docker镜像（image）详解](http://c.biancheng.net/view/3143.html)

* any list
{:toc}
