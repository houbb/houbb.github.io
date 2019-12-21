---
layout: post
title: Docker 在 Mac 环境安装教程
date:  2016-10-15 22:41:45 +0800
categories: [Devops]
tags: [docker, devops, ci, sh]
published: true
---

# Docker

[Docker](http://www.docker.com/) is the world’s leading software containerization platform

> [docker zh_CN](http://www.docker.org.cn/)

# Get Start

> DOCKER FOR MAC

An integrated, easy-to-deploy environment for building, assembling, and shipping applications from a Mac,
Docker for Mac is a native Mac application architected from scratch, with a native user interface and auto-update capability,
deeply integrated with OS X native virtualization, Hypervisor Framework, networking and file system, making it faster and more reliable
than previous ways of getting Docker on a Mac.


> Requirements

- Mac must be a 2010 or newer model, with Intel’s hardware support for memory management unit (MMU) virtualization; i.e., Extended Page Tables (EPT)

- OS X 10.10.3 Yosemite or newer

- At least 4GB of RAM

<uml>
    Download->Install:
    Install->Run Project:
</uml>


> Install and Run

After run the docker, you can see the [![whale](https://raw.githubusercontent.com/houbb/resource/master/img/docker/whale-x.png)] in top status bar.

Input ```docker info``` in terminal line.

```
houbinbindeMacBook-Pro:/ houbinbin$ docker info
Containers: 0
 Running: 0
 Paused: 0
 Stopped: 0
Images: 0
Server Version: 1.12.1
Storage Driver: aufs
 Root Dir: /var/lib/docker/aufs
 Backing Filesystem: extfs
 Dirs: 0
 Dirperm1 Supported: true
Logging Driver: json-file
Cgroup Driver: cgroupfs
Plugins:
 Volume: local
 Network: host bridge null overlay
Swarm: inactive
Runtimes: runc
Default Runtime: runc
Security Options: seccomp
Kernel Version: 4.4.20-moby
Operating System: Alpine Linux v3.4
OSType: linux
Architecture: x86_64
CPUs: 4
Total Memory: 1.952 GiB
Name: moby
ID: BZ32:YMHS:BPMD:JBDT:UABV:BG4J:7XDD:I6HO:6GZY:WDME:22DB:7ULC
Docker Root Dir: /var/lib/docker
Debug Mode (client): false
Debug Mode (server): true
 File Descriptors: 16
 Goroutines: 27
 System Time: 2016-10-15T15:21:07.932969294Z
 EventsListeners: 1
No Proxy: *.local, 169.254/16
Registry: https://index.docker.io/v1/
Insecure Registries:
 127.0.0.0/8
```

> Version of Docker Engine、Compose、Machine

```
houbinbindeMacBook-Pro:/ houbinbin$ docker --version
Docker version 1.12.1, build 6f9534c
houbinbindeMacBook-Pro:/ houbinbin$ docker-compose --version
docker-compose version 1.8.0, build f3628c7
houbinbindeMacBook-Pro:/ houbinbin$ docker-machine --version
docker-machine version 0.8.1, build 41b3b25
houbinbindeMacBook-Pro:/ houbinbin$
```


> Explore the application and run examples

1、Start a Dockerized web server

```docker run -d -p 80:80 --name webserver nginx```, If the image is not found locally, Docker will pull it from Docker Hub.

```
houbinbindeMacBook-Pro:bin houbinbin$ docker run -d -p 80:80 --name webserver nginx
Unable to find image 'nginx:latest' locally
latest: Pulling from library/nginx
6a5a5368e0c2: Pull complete
20a0fbbae148: Pull complete
2fbd37c8684b: Pull complete
Digest: sha256:e40499ca855c9edfb212e1c3ee1a6ba8b2d873a294d897b4840d49f94d20487c
Status: Downloaded newer image for nginx:latest
864d97edfc07a55a5202bf3a4e0b7dbc702cb9b0d8401c73b06e9b9f8225186c
```

input ```localhost``` in browser to visit it

![index](https://raw.githubusercontent.com/houbb/resource/master/img/docker/2016-10-16-index.png)

2、Run ```docker ps``` while your web server is running to see details on the webserver container.

```
houbinbindeMacBook-Pro:bin houbinbin$ docker ps
CONTAINER ID        IMAGE               COMMAND                  CREATED             STATUS              PORTS                         NAMES
864d97edfc07        nginx               "nginx -g 'daemon off"   4 minutes ago       Up 4 minutes        0.0.0.0:80->80/tcp, 443/tcp   webserver
```

3、Stop or remove containers and images

The **nginx** webserver will continue to run in the container on that port until you stop and/or remove the container.
If you want to stop the webserver, type: ```docker stop webserver``` and start it again with ```docker start webserver```

```
houbinbindeMacBook-Pro:bin houbinbin$ docker stop webserver
webserver
houbinbindeMacBook-Pro:bin houbinbin$ docker start  webserver
webserver
```

To stop and remove the running container with a single command, type: ```docker rm -f webserver```.
This will remove the container, but not the nginx image.
You can list local images with docker images.
You might want to keep some images around so that you don’t have to pull them again from Docker Hub.
To remove an image you no longer need, use ```docker rmi <imageID>|<imageName>```.

For example, ```docker rmi nginx```.

# More

Docker has **client** and **server**, the server is a daemon to manager all containers.

```
houbinbindeMacBook-Pro:~ houbinbin$ docker version
Client:
 Version:      1.12.1
 API version:  1.24
 Go version:   go1.7.1
 Git commit:   6f9534c
 Built:        Thu Sep  8 10:31:18 2016
 OS/Arch:      darwin/amd64

Server:
 Version:      1.12.1
 API version:  1.24
 Go version:   go1.6.3
 Git commit:   23cf638
 Built:        Thu Aug 18 17:52:38 2016
 OS/Arch:      linux/amd64
```

# Docker 常用命令 

## 查询当前运行容器

```
$   docker ps
```

## 暂停/重启容器

```
$   docker stop/restart ${container-name}
```

## 移除容器

```
$   docker rm ${container-name}
```

## 查看容器的 IP 信息

```
$   docker inspect  ${container-id} | grep IPAddress
```

* any list
{:toc}