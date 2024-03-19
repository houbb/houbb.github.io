---
layout: post
title: Docker learn-21-Docker 镜像构建
date:  2019-12-18 11:34:23 +0800
categories: [Docker]
tags: [docker, windows, devops, ci, sh]
published: true
---

# 构建镜像

上面我们看到如何拉取并且构建好带有定制内容的 Docker 镜像，那么我们如何修改自己的镜像，并且管理和更新这些镜像呢？

- 使用 docker commit 命令

- 使用 docker build 命令和 Dockerfile 文件

现在我们不推荐使用 docker commit 命令，相反应该使用更灵活更强大的 Dockerfile 来构建镜像。

不过，为了对 Docker 又一个更深的了解，我们还是会先介绍一下 docker commit 构建镜像。

之后，我们重点介绍 Docker 所推荐的构建方法：编写 Dockerfile 之后使用 docker build 命令。

# 创建 Docker Hub 账号

构建镜像中很重要的一环就是如何共享和发布镜像。可以将镜像推送到 Docker Hub中或者自己的私有 Registry 中。为了完成这项工作，需要在 Docker Hub上创建一个账号

如果你还没有Docker 通行证，在 [hub.docker.com](https://hub.docker.com/) 注册一个，记下你的用户名，登录本地计算机上的Docker公共注册表。

## 登录

使用 docker login，输入用户名和密码进行登录

比如我的，用户名：houbinbin

```
$ docker login
Login with your Docker ID to push and pull images from Docker Hub. If you don't have a Docker ID, head over to https://hub.docker.com to create one.
Username: houbinbin
Password: 
WARNING! Your password will be stored unencrypted in /home/docker/.docker/config.json.
Configure a credential helper to remove this warning. See
https://docs.docker.com/engine/reference/commandline/login/#credentials-store
```

这里我们的密码还会被明文保存在本地 `/home/docker/.docker/config.json.`，这个还是需要我们注意下的。

# 使用 docker commit 

创建 Docker镜像的第一种方式是使用 docker commit 命令。

可以将此想象为我们是在版本控制系统里面提交变更，毕竟这和 git commit 命令真是太像了。

我们先从创建一个容器开始，这个容器基于我们前面见过的 ubuntu 镜像。

## 镜像构建

- 运行 ubuntu 系统

```
$ docker run -it ubuntu /bin/bash
```

- 安装 apache 服务器

```
# apt-get update && apt-get install apache2
```

我们启动了一个容器，并安装了 Apache 服务器，我们会将这个服务器作为 Web 服务器运行，所以我们想把它当前状态保存起来。

这样下次启动就不用重新安装了。

## 提交镜像

- 提交当前镜像

为了完成这项工作，需要先使用 exit 从 ubuntu 中退出，之后再运行 docker commit 命令。

查看最后一次的镜像内容：

```
$ docker ps -l 
CONTAINER ID        IMAGE               COMMAND             CREATED             STATUS                        PORTS               NAMES
e4f5e7b52739        ubuntu              "/bin/bash"         2 minutes ago       Exited (100) 17 seconds ago                       elated_ellis
```

我们看到，在下所示的 docker commit 命令中，指定了要提交修改过的容器ID(可以通过 docker ps -l -q 命令得到刚刚创建的容器 ID)，以及一个镜像仓库和镜像名，这里是 houbinbin/ubuntu-apache-test

```
$   docker commit e4f5e7b52739 houbinbin/ubuntu-apache-test

sha256:972923a332eb03c3f2fee22899e09d2961423f66bff8c6a5d5b20025c04a7a3f
```

- 查看提交镜像

```
$   docker images houbinbin/ubuntu-apache-test

REPOSITORY                     TAG                 IMAGE ID            CREATED              SIZE
houbinbin/ubuntu-apache-test   latest              972923a332eb        About a minute ago   64.2M
```

## 指定更多信息

- 提交命令

可以在提交时指定更多的数据，就和 git 的命令是一样的，使用 `docker commit -m` 命令

ps: 这个底层估计就是对 git 进行了一次封装。

```
$ docker commit -m "image for test" -authotr="houbinbin" e4f5e7b52739 houbinbin/ubuntu-apache-test:comment
```

类似 git 的参数说明：

-m "image for test" 指定提交的备注信息

-authotr="houbinbin" 指定作者信息

houbinbin/ubuntu-apache-test:comment 指定 tag 为 comment

- 信息查看

```
$ docker images houbinbin/ubuntu-apache-test
REPOSITORY                     TAG                 IMAGE ID            CREATED             SIZE
houbinbin/ubuntu-apache-test   comment             61bc6bed07f9        8 seconds ago       64.2MB
houbinbin/ubuntu-apache-test   latest              972923a332eb        7 minutes ago       64.2MB
```

- 详细信息查看

```
$   docker inspect houbinbin/ubuntu-apache-test:comment
```

详情如下：

```
[
    {
        "Id": "sha256:61bc6bed07f9e0be36886f970217770cfc514b5a12d6ee0b028507a9e248307e",
        "RepoTags": [
            "houbinbin/ubuntu-apache-test:comment"
        ],
        "RepoDigests": [],
        "Parent": "sha256:549b9b86cb8d75a2b668c21c50ee092716d070f129fd1493f95ab7e43767eab8",
        "Comment": "image for test",
        "Created": "2019-12-24T02:21:30.716214139Z",
        "Container": "e4f5e7b52739b94348fc5f5664d1c7ca2be3be4a7a92683e7c41a9897e584810",
        "ContainerConfig": {
            "Hostname": "e4f5e7b52739",
            "Domainname": "",
            "User": "",
            "AttachStdin": true,
            "AttachStdout": true,
            "AttachStderr": true,
            "Tty": true,
            "OpenStdin": true,
            "StdinOnce": true,
            "Env": [
                "PATH=/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin"
            ],
            "Cmd": [
                "/bin/bash"
            ],
            "Image": "ubuntu",
            "Volumes": null,
            "WorkingDir": "",
            "Entrypoint": null,
            "OnBuild": null,
            "Labels": {}
        },
        "DockerVersion": "18.09.6",
        "Author": "uthotr=houbinbin",
        "Config": {
            "Hostname": "e4f5e7b52739",
            "Domainname": "",
            "User": "",
            "AttachStdin": true,
            "AttachStdout": true,
            "AttachStderr": true,
            "Tty": true,
            "OpenStdin": true,
            "StdinOnce": true,
            "Env": [
                "PATH=/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin"
            ],
            "Cmd": [
                "/bin/bash"
            ],
            "Image": "ubuntu",
            "Volumes": null,
            "WorkingDir": "",
            "Entrypoint": null,
            "OnBuild": null,
            "Labels": {}
        },
        "Architecture": "amd64",
        "Os": "linux",
        "Size": 64194775,
        "VirtualSize": 64194775,
        "GraphDriver": {
            "Data": {
                "LowerDir": "/mnt/sda1/var/lib/docker/overlay2/5350d35e79b6f36cf97da5e683a0cdb6c110bf17f0ebc0ee92fec55e3576b6c0/diff:/mnt/sda1/var/lib/docker/overlay2/5656d695fe244b393a12c25987342697314010579b2f76d3a817de9e4db50975/diff:/mnt/sda1/var/lib/docker/overlay2/bb61ea2208fefb01badac1bee1a0bf22505799c13dba09f10cfd041352a115ac/diff:/mnt/sda1/var/lib/docker/overlay2/2802f5211183c0af6d29776bb3472588ec4c939a66bc79f0ea78e02bfd298b7b/diff",
                "MergedDir": "/mnt/sda1/var/lib/docker/overlay2/65c34501730f2b2249dc501fc01761289101ed7c1f6a03007f624546681bb563/merged",
                "UpperDir": "/mnt/sda1/var/lib/docker/overlay2/65c34501730f2b2249dc501fc01761289101ed7c1f6a03007f624546681bb563/diff",
                "WorkDir": "/mnt/sda1/var/lib/docker/overlay2/65c34501730f2b2249dc501fc01761289101ed7c1f6a03007f624546681bb563/work"
            },
            "Name": "overlay2"
        },
        "RootFS": {
            "Type": "layers",
            "Layers": [
                "sha256:2dc9f76fb25b31e0ae9d36adce713364c682ba0d2fa70756486e5cedfaf40012",
                "sha256:9f3bfcc4a1a8a676da07287a1aa6f2dcc8e869ea6f054c337593481a5bb1345e",
                "sha256:27dd43ea46a831c39d224e7426794145fba953cd7309feccf4d5ea628072f6a2",
                "sha256:918efb8f161b4cbfa560e00e8e0efb737d7a8b00bf91bb77976257cd0014b765",
                "sha256:c6d3a3b5f397a6df89d143052d4758c9087c5e03b7dc262cf43ab37b5ade09c7"
            ]
        },
        "Metadata": {
            "LastTagTime": "2019-12-24T02:21:30.748709599Z"
        }
    }
]
```

# 使用 Dockerfile 构建镜像

我们并不推荐使用 docker commit 方法来构建镜像。

相反，我们推荐使用 Dockerfile 和 docker build 的命令来构建镜像。

Dockerfile 使用基于 DSL 语法的指令来构建一个 Docker 镜像，之后使用 docker build 命令基于 Dockerfile 中的指令构建一个新的镜像。

## 我们的第一个 Dockerfile

下面我们创建一个目录并初始化 Dockerfile，我们创建一个包含简单web服务器的Docker镜像

```
$ pwd
/home/docker

$ mkdir static-web
$ cd static-web
$ touch Dockerfile
```

我们在 docker 的默认路径下创建一个文件夹 **static-web**，并在其中创建一个文件 `Dockerfile`

static-web 目录就是我们的构建环境。

Docker 称此环境为上下文(context)或者 构建上下文(build context)，Docker 会在构建镜像时将构建上下文和该上下文中的文件和目录上传到 Docker 守护进程。

这样 Docker 守护进程就可以直接访问你镜像中的代码、文件和数据。

## 指定 Dockerfile 内容

```
# Version: 0.0.1
FROM ubuntu:14.04
MAINTAINER houbinbin "houbinbin.echo@gmail.com"
RUN apt-get update
RUN apt-get install -y nginx
RUN echo 'Hi, I am in your container' \
        >/usr/share/nginx/html/index.html
EXPOSE 80
```

该 Dockerfile 由一系列指令和参数组成。

每条指令，如FROM，都必须为大写字母，而且后面要跟随一个参数: FROM ubuntu:14.04。

Dockerfile 中的指令会按照顺序由上向下执行，所以编写 Dockerfile 时，请注意它的顺序。

- 注释

Dockerfile 也支持中文注释，以 `#` 开头的行都会被认为是注释。Dockerfile 中的第一行就是注释的例子

### 流程

每条指令都会创建一个新的镜像层并对镜像进行提交。

Docker 大体按照如下流程执行 Dockerfile 指令

1. Docker 从基础镜像运行一个容器

2. 执行一条指令，对容器作出修改

3. 执行类似docker commit 操作，提交一个新的镜像层

4. Docker 再基于刚提交的镜像运行一个新容器

5. 执行 Dockerfile 中的下一条指令，直到所有指令都执行完毕

从上面可以看出，如果你的 Dockerfile 由于某些原因(例如指令失败了)没有正常结束，那么你将得到了一个可以使用的镜像。

这对调试很有帮助：可以基于镜像运行一个具备交互功能的容器，使用最后创建的镜像对你最后失败的指令做出调试

### 内容说明

在上面的示例中，我们使用了 ubuntu:14.04 作为新镜像基础镜像。

基于这个 Dockerfile 构建的新镜像以 Ubuntu 14.04 操作系统为基础。

再运行一个容器时，必须要指明基于哪个基础镜像进行构建。

接着指定了 MAINTAINER 指令，这条指令会告诉 Docker 该镜像的作者是谁，以及作者的电子邮件地址，这有助于标示镜像的所有者以及联系方式。

在这些指令之后，我们指定了三条 RUN 指令，RUN指令会在当前的镜像中运行指定的命令。

在这个例子中，我们通过 RUN 指令更新了已经安装的 APT 仓库，安装了 nginx 包，之后创建了 `/usr/share/nginx/html/index.html` 文件，该文件有一些简单的示例文本。

像前面说的那样，每条RUN指令都会创建一个新的镜像层，如果该命令执行成功，就会将此镜像提交，继续执行下一条指令。

默认情况下，RUN指令会在shell里使用命令包装器 `/bin/sh -c` 来执行。

如果是在一个不支持 shell 的平台上运行或者不希望在 shell 中运行，也可以使用 exec 格式的 RUN 指令

如下: 

```
RUN["apt-get", "install", "-y", "nginx"]
```

在这种方式中，我们使用数组的方式来指定要运行的命令和要传递的参数。

接着设置了 EXPOSE 命令，这条执行告诉 Docker 容器内的应用程序将会使用容器的指定接口。

这并不意味着可以自动访问任意容器运行中的服务端口，可以指定多个 EXPOSE 指令向外公开多个端口。

## 基于 Dockerfile 构建新镜像

执行 docker build 命令时，Dockerfile 中的所有指令都会被执行并且提交，并且在命令成功结束后返回一个新镜像，下面就来看看如何构建一个新镜像。

```
$ pwd
/home/docker/static-web

$ docker build -t="houbinbin/static-web" .
```

注意最后的空格，和 `.`，表示当前路径。

- 指定标签

和前面类似，你也可以指定标签，如下：

```
docker build -t="houbinbin/static-web:v1" .
```

表示这是我们的第一个版本。

加载的过程可能会比较慢，需要耐心等待。

## 构建异常

备注：正常网络应该不会有类似内容，可以完全跳过。

### 异常

在公司测试，异常如下：

```
W: Failed to fetch http://archive.ubuntu.com/ubuntu/dists/trusty/main/binary-amd64/Packages  SECURITY: URL redirect target contains control characters, rejecting. [IP: 91.189.88.31 80]

W: Failed to fetch http://archive.ubuntu.com/ubuntu/dists/trusty/restricted/binary-amd64/Packages  SECURITY: URL redirect target contains control characters, rejecting. [IP: 91.189.88.31 80]

E: Some index files failed to download. They have been ignored, or old ones used instead.
The command '/bin/sh -c apt-get update' returned a non-zero code: 100
```

### 修改 dns 方案

`cat /etc/resolv.conf` 查看里面的domain, search和nameserver配置是否正确。

直接 `sudo vi /etc/resolv.conf` 修改，尝试将 nameserver 修改成 8.8.8.8 后进行验证，修改后发现不行。

后来想了下这些在家里测试都是可以的，猜想被公司软件限制了。

### 数据源调整

既然被公司的软件截流了，还是换个数据源吧。

- 清华大学的 ubuntu 列表

打开清华大学的 ubuntu 列表 [https://mirror.tuna.tsinghua.edu.cn/help/ubuntu/](https://mirror.tuna.tsinghua.edu.cn/help/ubuntu/)

此处我们选择 14.04 作为测试版本。

```
# 默认注释了源码镜像以提高 apt update 速度，如有需要可自行取消注释
deb https://mirrors.tuna.tsinghua.edu.cn/ubuntu/ trusty main restricted universe multiverse
# deb-src https://mirrors.tuna.tsinghua.edu.cn/ubuntu/ trusty main restricted universe multiverse
deb https://mirrors.tuna.tsinghua.edu.cn/ubuntu/ trusty-updates main restricted universe multiverse
# deb-src https://mirrors.tuna.tsinghua.edu.cn/ubuntu/ trusty-updates main restricted universe multiverse
deb https://mirrors.tuna.tsinghua.edu.cn/ubuntu/ trusty-backports main restricted universe multiverse
# deb-src https://mirrors.tuna.tsinghua.edu.cn/ubuntu/ trusty-backports main restricted universe multiverse
deb https://mirrors.tuna.tsinghua.edu.cn/ubuntu/ trusty-security main restricted universe multiverse
# deb-src https://mirrors.tuna.tsinghua.edu.cn/ubuntu/ trusty-security main restricted universe multiverse

# 预发布软件源，不建议启用
# deb https://mirrors.tuna.tsinghua.edu.cn/ubuntu/ trusty-proposed main restricted universe multiverse
# deb-src https://mirrors.tuna.tsinghua.edu.cn/ubuntu/ trusty-proposed main restricted universe multiverse
```

- 构建自己的镜像

这里需要更新的是 ubuntu 数据源，我们这里活学活用一下刚才学习的 docker commit，构建一个被修改过数据源的 ubuntu 为自己所用。

运行镜像：

```
$   docker run -it ubuntu:14.04 /bin/bash
```

- 更新仓库配置文件 /etc/apt/sources.list。

```
$   mv /etc/apt/sources.list /etc/apt/sources.list_bak
$   vi /etc/apt/sources.list
```

第一行将原始的列表进行备份，第二行直接进入文件列表进行修改。

直接将修改内容改为上面的【清华大学的 ubuntu 列表】，不再赘述。

- 提交被修改后的 ubuntu:14.04 镜像

```
$ docker ps -l
CONTAINER ID        IMAGE               COMMAND             CREATED             STATUS                          PORTS               NAMES
7364b998356f        ubuntu:14.04        "/bin/bash"         3 minutes ago       Exited (0) About a minute ago
```

提交镜像到本地

```
docker commit -m "ubuntu:14.04 with china source list" -authotr="houbinbin" 7364b998356f houbinbin/ubuntu:14.04
```

查看镜像

```
$ docker images houbinbin/ubuntu
REPOSITORY          TAG                 IMAGE ID            CREATED             SIZE
houbinbin/ubuntu    14.04               483804e7467a        11 seconds ago      197MB
```

- 修改 Dockfile

我们将原来直接使用官方的 ubuntu 调整为我们刚才发布的 ubuntu:

```
# Version: 0.0.1
FROM houbinbin/ubuntu:14.04
MAINTAINER houbinbin "houbinbin.echo@gmail.com"
RUN apt-get update
RUN apt-get install -y nginx
RUN echo 'Hi, I am in your container' \
        >/usr/share/nginx/html/index.html
EXPOSE 80
```

- 直接再次执行

```
$   docker build -t="houbinbin/static-web" .
```

构建日志节选如下：

```
Sending build context to Docker daemon  2.048kB
Step 1/6 : FROM houbinbin/ubuntu:14.04
 ---> 483804e7467a
Step 2/6 : MAINTAINER houbinbin "houbinbin.echo@gmail.com"
 ---> Running in 156b128315b7
Removing intermediate container 156b128315b7
 ---> 9c1392253980
Step 3/6 : RUN apt-get update
 ---> Running in 586e1cda3e36
 ....
Successfully built 7684763833be
Successfully tagged houbinbin/static-web:latest
```

可以看到最后的提示吗，我们已经构建成功了属于自己的镜像。

## 查看镜像信息

### docker images

```
$ docker images houbinbin/static-web

REPOSITORY             TAG                 IMAGE ID            CREATED             SIZE
houbinbin/static-web   latest              7684763833be        3 minutes ago       231MB
```

### docker history

如果想查看这个镜像的构建历史，可以使用 docker history

```
$ docker history houbinbin/static-web

IMAGE               CREATED             CREATED BY                                      SIZE                COMMENT
7684763833be        4 minutes ago       /bin/sh -c #(nop)  EXPOSE 80                    0B                  
0142ee876d9c        4 minutes ago       /bin/sh -c echo 'Hi, I am in your container'…   27B                 
3bd31e6596eb        4 minutes ago       /bin/sh -c apt-get install -y nginx             21.1MB              
287be6df4959        5 minutes ago       /bin/sh -c apt-get update                       13.7MB              
9c1392253980        6 minutes ago       /bin/sh -c #(nop)  MAINTAINER houbinbin "hou…   0B                  
483804e7467a        9 minutes ago       /bin/bash                                       4kB                 ubuntu:14.04 with china source list
6e4f1fe62ff1        5 days ago          /bin/sh -c #(nop)  CMD ["/bin/bash"]            0B                  
<missing>           5 days ago          /bin/sh -c mkdir -p /run/systemd && echo 'do…   7B                  
<missing>           5 days ago          /bin/sh -c set -xe   && echo '#!/bin/sh' > /…   195kB               
<missing>           5 days ago          /bin/sh -c [ -z "$(apt-get indextargets)" ]     0B                  
<missing>           5 days ago          /bin/sh -c #(nop) ADD file:276b5d943a4d284f8…   196MB
```

这里包含了很多历史的信息，你可以倒过来看。

以前的一些操作已经记不太清楚了，

## 指令失败时呢？

之前大致介绍了一下指令失败时的执行过程。

下面来看一个例子： 假设我们在上面的 Dockerfile 中把 nginx 拼成了 ngnx ，再来构建一遍

- Docker 的设计巧妙

我觉得 docker 的这一点设计非常巧妙，你可以认为每一层都是一个新的 layer。

哪怕有一步错误了，但是前面的成功的可以作为一个可用的镜像。

我们可以运行这个进行，然后执行出错的命令，方便我们调试。

- 刚才的例子

其实刚才的失败案例可以作为参考。

我们也可以结合自己的需要，在一个已经存在的镜像上进行修改，以符合我们的目标。

## 在新镜像中启动

我们可以基于新构建的镜像启动新容器，来检查我们的构建工作是否正常

```
$ docker run -d -p 80 --name static-web houbinbin/static-web nginx -g "daemon off;"
fd44681b3ff57a30d31f7d921fe3561692df6f5b2a08c7de279c7db6cb3804a0
```

在这里，我们使用 docker run 命令，启动一个 static-web 的容器。

`-d` 表示的是以分离(detached) 的方式在后台运行，这种方式适合 nginx 守护进程这种需要长时间运行的进程。

我们也指定了需要在 容器中运行的命令： `nginx -g "daemon off;"`，将以前台方式运行 nginx 作为我们的服务器。

我们这里也使用了一个新的 `-p` 标志，用来控制 Docker 再运行时应该给外部开放哪些端口

（1）Docker 可以在宿主机上随机选择 49153~65535 之间的一个比较大的端口映射到 80 端口上 可以在 Docker 宿主机指定一个具体的端口来映射到 80 端口上
使用 docker ps查看一下端口分配情况

（2）可以在 Docker 宿主机指定一个具体的端口来映射到 80 端口上

- 查看端口分配情况

`docker ps` 可以查看具体的信息，此处我们可以看到 32769 映射到 80 端口。

```
$ docker ps
CONTAINER ID        IMAGE                  COMMAND                  CREATED             STATUS              PORTS                   NAMES
fd44681b3ff5        houbinbin/static-web   "nginx -g 'daemon of…"   52 seconds ago      Up 51 seconds       0.0.0.0:32769->80/tcp   static-web
```

也可以通过 `docker port` 来查看。

```
$   docker port fd44681b3ff5
80/tcp -> 0.0.0.0:32769
```

# Dockerfile 相关整理

这里的信息也比较多，此处暂时讲解一些简单的知识。

## Dockerfile 和构建缓存

由于每一步的结果都会作为下一步的基础镜像，所以 Docker 构建镜像的过程非常聪明，它会将之前的镜像层作为缓存。

正如上面 Dockerfile 来举例，比如，在我们调试过程中，不需要在第一步和第三步之间做任何修改，因此 Docker 会将之前构建时创建的镜像当作缓存并作为新的开始点。

再次构建时，Docker 会直接从第四步开始。

当之前的构建步骤没有变化时，这会节省大量的时间。

如果第一步到第三步之间有什么变化，则回到第一步开始。

然而，有的时候不希望有缓存的功能，这个时候你需要使用 apt-get update，那么 Docker 将不会刷新 APT 包的缓存，要想略过缓存，可以使用 docker build 的 --no-cache 标志。

## 基于构建缓存的 Dockerfile 模版

构建缓存的一个好处就是，我们可以实现简单的 Dockerfile 模版，一般会在 Dockerfile 文件顶部使用相同的指令集模版，比如对 ubuntu，使用下面的模版

```
FROM ubuntu:14.04
MAINTAINER houbinbin "houbinbin.echo@gmail.com"
ENV REFRESHED_AT 2019-08-15
RUN apt-get -qq update
```

我们来分析一下这个新的 Dockerfile :

首先，通过 FROM 指令为新镜像设置了一个基础镜像 ubuntu:14.04。

接着，使用 MAINTAINER 指令添加了自己的详细信息

然后，通过 ENV 指令设置了一个名为 REFRESHED_AT 的环境变量，用来表示最后一次的更新时间

最后，使用 RUN 指令运行 `apt-get -qq update` 命令，该指令会刷新 APT 包的缓存，用来确保每个安装的软件包都在最新版本。

# 总结

本节主要介绍了两种构建镜像的方式，体会到了 docker 进行的设计巧妙之处。

唯一遇到的问题可能是镜像在公司的网络被禁止访问了，所以花费了一些时间解决这个问题。

整体感觉其实和 git 的版本管理方式非常类似，那么机智的你应该发现了。

commit 只是提交到本地，push 才会将 images 提交到中央仓库。

我们下一节就一起来学习下如何将镜像提交到 hub 仓库。

## Dockerfile 命令

相关的命令较多，本节直接暂时省略。

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

## 报错

[Failed to fetch http://archive.ubuntu.com/ubuntu/pool/main/n/nginx/nginx_1.4.6](https://blog.51cto.com/11374450/1918392)

[两种方法修改Linux下的DNS后立即生效](https://www.ipdrivers.com/linux-dns.html)

[docker配置dns](https://blog.csdn.net/wylfengyujiancheng/article/details/90181910)

[Apt/apt-get 远程代码执行 （CVE-2019-3462)](https://blog.csdn.net/Bonnie978/article/details/86614451)

[ubuntu apt update 报错：无法安全地用该源进行更新，所以默认禁用该源](https://blog.csdn.net/shangyexin/article/details/102657776)

* any list
{:toc}
