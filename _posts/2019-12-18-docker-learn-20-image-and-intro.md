---
layout: post
title: Docker learn-20-Docker 镜像详解
date:  2019-12-18 11:34:23 +0800
categories: [Docker]
tags: [docker, windows, devops, ci, sh]
published: true
---

# 前言

对于 docker 我们不要把他简单的看做是容器，就像是 Maven 一样，我们也不能简单的只认为是一个管理 jar 包的工具。

确切的说，二者都是平台，在不断进化着属于自己的完整生态。

有着对管理信息的完整生命周期控制，对于管理信息的版本控制，简单易用的 api 标准。

# 什么是 Docker 镜像

上一张 Docker 命令导图：

![image](https://user-images.githubusercontent.com/18375710/71366177-3d516a00-25dc-11ea-8eab-2e366dc0e900.png)

从中可以看出，Docker 包含三个基本概念，分别是镜像（Image）、容器（Container）和仓库（Repository）。

## 概念

镜像是 Docker 运行容器的前提，仓库是存放镜像的场所，可见镜像更是Docker的核心。

回到正题，Docker 镜像可以看作是一个特殊的文件系统，除了提供容器运行时所需的程序、库、资源、配置等文件外，还包含了一些为运行时准备的一些配置参数（如匿名卷、环境变量、用户等）。

镜像不包含任何动态数据，其内容在构建之后也不会被改变。

要想更深入的了解 Docker 镜像，镜像的原理也必不可少，而这其中最重要的概念就是镜像层(Layers)（如下图）。

镜像层依赖于一系列的底层技术，比如文件系统(filesystems)、写时复制(copy-on-write)、联合挂载(union mounts)等，幸运的是你可以在很多地方学习到这些技术，这里就不再赘述技术细节。

![image](https://user-images.githubusercontent.com/18375710/71366233-6c67db80-25dc-11ea-8ed9-af3cc6819b2f.png)

总的来说，你最需要记住这点：

**在 Dockerfile 中， 每一条指令都会创建一个镜像层，继而会增加整体镜像的大小。**

镜像作为 Docker 最突出的创新之一，它变革了软件交付标准。

理解镜像，对理解整个 Docker 的生命周期非常重要。

## 分层结构

镜像的分层结构：DockerHub中绝大多数的镜像都是通过在base镜像中安装和配置需要的软件构建出来的。

base镜像是from scratch开始，新镜像是直接在base镜像上构建from centos

新镜像是从base镜像一层一层叠加生成的，每安装一个软件就等于在现有的镜像上增加一层。

Docker镜像采用分层结构的**好处就是共享资源。**

可写的容器层：当容器启动时，一个新的可写层被加载到镜像的顶部，这一层就叫容器层，容器层之下都叫镜像层。

只有容器层是可写的，容器层下面的所有镜像层都是只读的。对容器的任何改动都只会发生在容器层中。

这里，所有的镜像层联合一起组成一个统一的文件系统，用户在容器层看到的就是一个叠加之后的文件系统。镜

像层内部是有上下之分的：

 - 添加文件：在容器中创建文件时，新文件被添加到容器层中。

 - 读取文件：当在容器中读取某个文件时，Docker会从上往下依次在各镜像层中查找此文件，一旦找到打开并读入内存。

 - 修改文件：在容器中修改已存在的文件时，Docker会从上往下依次在各个镜像层中查找此文件，一旦找到立即将其复制到容器层中，然后才修改。（copy-on-write特性）

 - 删除文件：在容器中删除文件时，Docker会从上往下依次在镜像层中找，找到后，会在容器层记录下此删除操作。

copy-on-write 特性说明容器层保存的是镜像变化的部分，不会对镜像本身进行任何修改。所以镜像可以被多个容器共享。

## 镜像与容器的关系

docker 镜像是一个只读的 docker 容器模板，含有启动 docker 容器所需的文件系统结构及其内容，因此是启动一个 docker 容器的基础。

docker 镜像的文件内容以及一些运行 docker 容器的配置文件组成了 docker 容器的静态文件系统运行环境：rootfs。

可以这么理解，docker 镜像是 docker 容器的静态视角，docker 容器是 docker 镜像的运行状态。

我们可以通过下图来理解 docker daemon、docker 镜像以及 docker 容器三者的关系(此图来自互联网)

![image](https://user-images.githubusercontent.com/18375710/71367251-76d7a480-25df-11ea-8170-83ccc12ac438.png)

从上图中我们可以看到，当由 ubuntu:14.04 镜像启动容器时，ubuntu:14.04 镜像的镜像层内容将作为容器的 rootfs；

而 ubuntu:14.04 镜像的 json 文件，会由 docker daemon 解析，并提取出其中的容器执行入口 CMD 信息，以及容器进程的环境变量 ENV 信息，最终初始化容器进程。

当然，容器进程的执行入口来源于镜像提供的 rootfs。

### rootfs

rootfs 是 docker 容器在启动时内部进程可见的文件系统，即 docker 容器的根目录。

rootfs 通常包含一个操作系统运行所需的文件系统，例如可能包含典型的类 Unix 操作系统中的目录系统，如 /dev、/proc、/bin、/etc、/lib、/usr、/tmp 及运行 docker 容器所需的配置文件、工具等。

在传统的 Linux 操作系统内核启动时，首先挂载一个只读的 rootfs，当系统检测其完整性之后，再将其切换为读写模式。

而在 docker 架构中，当 docker daemon 为 docker 容器挂载 rootfs 时，沿用了 Linux 内核启动时的做法，即将 rootfs 设为只读模式。

在挂载完毕之后，利用联合挂载(union mount)技术在已有的只读 rootfs 上再挂载一个读写层。

这样，可读写的层处于 docker 容器文件系统的最顶层，其下可能联合挂载了多个只读的层，只有在 docker 容器运行过程中文件系统发生变化时，才会把变化的文件内容写到可读写层，并隐藏只读层中的旧版本文件。

# 列出所有的镜像

## docker images

```
$ docker images

REPOSITORY          TAG                 IMAGE ID            CREATED             SIZE
```

可以看到，我们已经获取了一个镜像列表。那么，这些镜像是从哪来的呢？

我们执行 docker run 命令时，同时进行了镜像下载

镜像从仓库下载下来。

镜像保存在仓库中，而仓库存在于 Registry 中。

默认的 Registry 是由 Docker 公司运行的公共 Registry 服务，即 Docker Hub。

需要进行ID的注册

ps: 非常类似于 maven 的中央仓库。

## tag 标签

为了区分同一个仓库中的不同镜像，Docker 为我们提供了 tag 这个标签，每个镜像在列出来的时候都带有一个标签，如12.10、 12.04等，这种标签机制使得一个仓库中允许存储多个镜像。

我们可以在仓库后面加一个 `冒号:标签名` 的方式来指定该仓库中的某一个镜像，

例如 `docker run -t -i --name new_container ubuntu:12.04 /bin/bash`

Docker 会自动帮我们切换到 Ubuntu 的环境下，当然，这种方式创建了一个交互式任务。

在构建容器时指定仓库的标签也是一个好习惯，这样便可以准确的指定容器来源于哪里。

ps: 不指定默认会拉取最新的版本。

## Docker Hub

Docker Hub 有两种仓库，一种是用户仓库，一种是顶层仓库。用户仓库是由开发人员自己创建的，顶层仓库是由Docker Hub 内部人员管理。

用户仓库的命名由两部分构成，如 admin/ubuntu

用户名 例如 : admin

仓库名 例如 : ubuntu

相对的，顶层仓库的命名就比较严谨，如 ubuntu 仓库。

顶层仓库由 Docker 公司和选定的优质基础镜像厂商来管理，用户可以基于这些镜像构建自己的镜像。

用户镜像都是由爱好者社区自己提供的，没有经过 Docker 公司的认证，所以需要自己承担相应的风险。

# 拉取镜像

还记得docker run 的启动过程吗？

再来一下这张图回顾一下

![image](https://user-images.githubusercontent.com/18375710/71367701-c8ccfa00-25e0-11ea-9dfd-41da92272f97.png)

其实也可以通过 docker pull 命令先预先拉取镜像到本地，使用 docker pull 命令可以节省从一个新镜像启动一个容器所需要的时间。

## 拉取案例

我们直接以 ubuntu 作为例子：

```
$ docker pull ubuntu

Using default tag: latest
latest: Pulling from library/ubuntu
2746a4a261c9: Pull complete
4c1d20cdee96: Pull complete
0d3160e1d0de: Pull complete
c8e37668deea: Pull complete
Digest: sha256:250cc6f3f3ffc5cdaa9d8f4946ac79821aafb4d3afc93928f0de9336eba21aa4
Status: Downloaded newer image for ubuntu:latest
```

默认会拉取官方镜像 `library`

## 查看拉取的镜像

```
$ docker images

REPOSITORY          TAG                 IMAGE ID            CREATED             SIZE
ubuntu              latest              549b9b86cb8d        4 days ago          64.2MB
```

# 查找镜像

## 命令

我们可以通过 `docker search` 命令来查找所有 Docker Hub 上公共可用的镜像，如下

```
$ docker search ubuntu
NAME                                                      DESCRIPTION                                     STARS               OFFICIAL            AUTOMATED
ubuntu                                                    Ubuntu is a Debian-based Linux operating sys…   10294               [OK]                
dorowu/ubuntu-desktop-lxde-vnc                            Docker image to provide HTML5 VNC interface …   375                                     [OK]
rastasheep/ubuntu-sshd                                    Dockerized SSH service, built on top of offi…   237                                     [OK]
consol/ubuntu-xfce-vnc                                    Ubuntu container with "headless" VNC session…   199                                     [OK]
ubuntu-upstart                                            Upstart is an event-based replacement for th…   102                 [OK]                
ansible/ubuntu14.04-ansible                               Ubuntu 14.04 LTS with ansible                   98                                      [OK]
neurodebian                                               NeuroDebian provides neuroscience research s…   63                  [OK]                
1and1internet/ubuntu-16-nginx-php-phpmyadmin-mysql-5      ubuntu-16-nginx-php-phpmyadmin-mysql-5          50                                      [OK]
ubuntu-debootstrap                                        debootstrap --variant=minbase --components=m…   41                  [OK]                
nuagebec/ubuntu                                           Simple always updated Ubuntu docker images w…   24                                      [OK]
i386/ubuntu                                               Ubuntu is a Debian-based Linux operating sys…   18                                      
1and1internet/ubuntu-16-apache-php-5.6                    ubuntu-16-apache-php-5.6                        14                                      [OK]
1and1internet/ubuntu-16-apache-php-7.0                    ubuntu-16-apache-php-7.0                        13                                      [OK]
eclipse/ubuntu_jdk8                                       Ubuntu, JDK8, Maven 3, git, curl, nmap, mc, …   12                                      [OK]
1and1internet/ubuntu-16-nginx-php-phpmyadmin-mariadb-10   ubuntu-16-nginx-php-phpmyadmin-mariadb-10       11                                      [OK]
1and1internet/ubuntu-16-nginx-php-5.6                     ubuntu-16-nginx-php-5.6                         8                                       [OK]
1and1internet/ubuntu-16-nginx-php-5.6-wordpress-4         ubuntu-16-nginx-php-5.6-wordpress-4             7                                       [OK]
1and1internet/ubuntu-16-apache-php-7.1                    ubuntu-16-apache-php-7.1                        6                                       [OK]
darksheer/ubuntu                                          Base Ubuntu Image -- Updated hourly             5                                       [OK]
1and1internet/ubuntu-16-nginx-php-7.0                     ubuntu-16-nginx-php-7.0                         4                                       [OK]
pivotaldata/ubuntu                                        A quick freshening-up of the base Ubuntu doc…   2                                       
smartentry/ubuntu                                         ubuntu with smartentry                          1                                       [OK]
1and1internet/ubuntu-16-sshd                              ubuntu-16-sshd                                  1                                       [OK]
pivotaldata/ubuntu-gpdb-dev                               Ubuntu images for GPDB development              1                                       
1and1internet/ubuntu-16-php-7.1                           ubuntu-16-php-7.1                               1                                       [OK]
```

## 返回字段说明


我们主要看一下每条镜像都返回了哪些内容

| 字段 | 说明 |
|:---|:---|
| NAME | 仓库名称 |
| DESCRIPTION | 镜像描述 |
| STARS | 反应一个镜像的受欢迎程度 |
| OFFICIAL | 是否由 Docker 公司及其指定厂商开发的镜像 |
| AUTOMATED | 表示这个镜像是由 Docker Hub 自动构建的 |

这里也有个类似 github 的 STARS 标识，一般越高的越好。建议使用官方镜像。

# 拓展阅读

## docker 的安装

[Mac 安装 Docker](https://houbb.github.io/2016/10/15/docker-install-on-mac)

[Windows7 安装 Docker](https://houbb.github.io/2016/10/15/docker-install-on-windows7)

[Windows10 安装 Docker](https://houbb.github.io/2019/12/18/docker-install-on-windows10)

## docker 基本操作

[Container 的基本生命周期管理](https://houbb.github.io/2019/12/18/docker-learn-19-container-manager)

## 更多学习



# 参考资料

[Orientation and setup](https://docs.docker.com/get-started/)

《第一本 Docker 书》

## 镜像

[什么是docker镜像？](https://www.zhihu.com/question/27561972)

[Docker镜像是什么、包含什么、能做什么](https://blog.csdn.net/xfyimengweima1314/article/details/79046873)

[Docker之使用 Docker 镜像和仓库](https://www.cnblogs.com/cxuanBlog/p/11370739.html)

[Docker 镜像进阶篇](https://www.cnblogs.com/sparkdev/p/9092082.html)

* any list
{:toc}
