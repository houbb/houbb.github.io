---
layout: post
title: docker-00-docker hello world 入门例子
date:  2019-12-18 11:34:23 +0800
categories: [Docker]
tags: [docker, container, sh]
published: true
---

# 1. 检查下docker是否正确安装。

```
docker info     
```

如果安装正确就会有很多docker的信息，如下图：

```
PS C:\Users\dh> docker info
Client:
 Version:    24.0.6
 Context:    default
 Debug Mode: false
 Plugins:
  buildx: Docker Buildx (Docker Inc.)
    Version:  v0.11.2-desktop.4
    Path:     C:\Program Files\Docker\cli-plugins\docker-buildx.exe
  compose: Docker Compose (Docker Inc.)
    Version:  v2.21.0-desktop.1
    Path:     C:\Program Files\Docker\cli-plugins\docker-compose.exe
  dev: Docker Dev Environments (Docker Inc.)
    Version:  v0.1.0
    Path:     C:\Program Files\Docker\cli-plugins\docker-dev.exe
  extension: Manages Docker extensions (Docker Inc.)
    Version:  v0.2.20
    Path:     C:\Program Files\Docker\cli-plugins\docker-extension.exe
  init: Creates Docker-related starter files for your project (Docker Inc.)
    Version:  v0.1.0-beta.7
    Path:     C:\Program Files\Docker\cli-plugins\docker-init.exe
  sbom: View the packaged-based Software Bill Of Materials (SBOM) for an image (Anchore Inc.)
    Version:  0.6.0
    Path:     C:\Program Files\Docker\cli-plugins\docker-sbom.exe
  scan: Docker Scan (Docker Inc.)
    Version:  v0.26.0
    Path:     C:\Program Files\Docker\cli-plugins\docker-scan.exe
  scout: Command line tool for Docker Scout (Docker Inc.)
    Version:  0.24.1
    Path:     C:\Program Files\Docker\cli-plugins\docker-scout.exe

...
```

# hello word

```
docker run hello-world
```

如下：

```
Hello from Docker!
This message shows that your installation appears to be working correctly.

To generate this message, Docker took the following steps:
 1. The Docker client contacted the Docker daemon.
 2. The Docker daemon pulled the "hello-world" image from the Docker Hub.
    (amd64)
 3. The Docker daemon created a new container from that image which runs the
    executable that produces the output you are currently reading.
 4. The Docker daemon streamed that output to the Docker client, which sent it
    to your terminal.

To try something more ambitious, you can run an Ubuntu container with:
 $ docker run -it ubuntu bash

Share images, automate workflows, and more with a free Docker ID:
 https://hub.docker.com/

For more examples and ideas, visit:
 https://docs.docker.com/get-started/
```

# hello-world 2

## 运行

```sh
docker run busybox /bin/echo hello world 
```

日志：

```
PS C:\Users\dh> docker run busybox /bin/echo hello world
Unable to find image 'busybox:latest' locally
latest: Pulling from library/busybox
3f4d90098f5b: Pull complete
Digest: sha256:3fbc632167424a6d997e74f52b878d7cc478225cffac6bc977eedfe51c7f4e79
Status: Downloaded newer image for busybox:latest
hello world
```

## 参数说明

各个参数语意说明：

docker：Docker的二进制执行文件。

run：和docker组合成一个运行容器的命令。

busybox：busybox被称为嵌入式linux的瑞士军刀，busybox整合了很多小的unix下的通用功能到一个小的可执行文件之中，就是一个阉割版的Linux系统。

/bin/echo hello world：这是在容器中运行的命令。

## 通过后台模式输出hello world

```sh
docker run -d busybox /bin/sh -c "while true; do echo hello world; sleep 10; done"
```

这句话的意思是在容器中会一直输出hello world 。

但是你执行完后会看到一个字符串。

```
docker run -d busybox /bin/sh -c "while true; do echo hello world; sleep 10; done"

41ffdfdaa39ef4c8db0098d4d344c18ded7fb496df76b7a0226f1d434e8d0bae
```

## 查看容器运行情况

```
docker ps

PS C:\Users\dh> docker ps
CONTAINER ID   IMAGE     COMMAND                   CREATED          STATUS          PORTS     NAMES
0c14bf145e3a   busybox   "/bin/sh -c 'while t…"   3 seconds ago    Up 2 seconds              heuristic_kapitsa
```

我们可以看到我们运行的容器，每个参数含义如下：

CONTAINER ID: 容器 ID。
IMAGE: 使用的镜像。
COMMAND: 启动容器时运行的命令。
CREATED: 容器的创建时间。
STATUS: 容器状态。有7种：created（已创建），restarting（重启中），running（运行中）， removing（迁移中），paused（暂停），exited（停止），dead（死亡）。
PORTS: 容器的端口信息和使用的连接类型（tcp\udp）。
NAMES: 自动分配的容器名称。


## 使用docker logs 命令查看容器内输出

### 使用容器id

```
docker logs 0c14bf145e3a
```

结果：

```
PS C:\Users\dh> docker logs 0c14bf145e3a
hello world
hello world
hello world
hello world
hello world
hello world
hello world
hello world
```

### 使用容器name

```
docker logs  heuristic_kapitsa
```

日志：

```
PS C:\Users\dh> docker logs  heuristic_kapitsa
hello world
hello world
hello world
hello world
hello world
hello world
hello world
hello world
hello world
hello world
hello world
hello world
hello world
```

## 停止容器

```
docker stop 0c14bf145e3a
```

也可以使用名称停止。最后可以通过 `docker ps` 确认效果。

# 参考资料

[Docker 入门之hello world](https://blog.csdn.net/wzs535131/article/details/108188599)

* any list
{:toc}