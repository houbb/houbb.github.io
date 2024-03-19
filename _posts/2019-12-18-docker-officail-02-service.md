---
layout: post
title: Docker 官方教程-02-Service
date:  2019-12-18 11:34:23 +0800
categories: [Docker]
tags: [docker, sh]
published: true
excerpt: Docker Service 入门学习
---

# 基础知识

[windows docker](https://houbb.github.io/2018/10/30/windows-docker) 介绍了安装和容器的入门知识。

建议掌握以上知识，阅读本篇。

# Docker Service

在分布式应用程序中，应用程序的不同部分称为“服务”。

例如，如果您想象一个视频共享站点，它可能包括一个用于将应用程序数据存储在数据库中的服务，一个用于在后台进行视频转码的服务。用户上传内容，前端服务等。

服务实际上只是“生产中的容器”。服务只运行一个映像，但它编码图像的运行方式 - 应该使用哪些端口，应该运行多少个容器副本，以便服务具有所需的容量，以及等等。扩展服务会更改运行该软件的容器实例的数量，从而为流程中的服务分配更多计算资源。

幸运的是，使用Docker平台定义，运行和扩展服务非常容易 - 只需编写一个 `docker-compose.yml` 文件即可。


# 第一个 `docker-compose.yml` 文件

- docker-compose.yml

image 处自行修改为自己的 image。

```yaml
version: "3"
services:
  web:
    # replace username/repo:tag with your name and image details
    image: houbinbin/get-started:part2
    deploy:
      replicas: 5
      resources:
        limits:
          cpus: "0.1"
          memory: 50M
      restart_policy:
        condition: on-failure
    ports:
      - "4000:80"
    networks:
      - webnet
networks:
  webnet:
```

这个docker-compose.yml文件告诉Docker执行以下操作：

1. 从注册表中提取我们上传的图像。

2. 将该映像的5个实例作为名为web的服务运行，限制每个实例使用，最多10％的CPU（跨所有核心）和50MB的RAM。

3. 如果一个失败，立即重启容器。

4. 将主机上的端口4000映射到Web的端口80。

5. 指示Web容器通过称为webnet的负载平衡网络共享端口80。 （在内部，容器本身在短暂的端口发布到web的端口80.）

6. 使用默认设置（负载平衡的覆盖网络）定义Webnet网络。

## 运行 app

### init

首先执行以下命令，后面解释这个命令。不执行会报错的。

```
docker swarm init
```

### deploy

- 部署

运行命令

```
docker stack deploy -c docker-compose.yml getstartedlab
```

我们的单个服务堆栈在一台主机上运行已部署映像的5个容器实例。我们来调查吧。

在我们的应用程序中获取一项服务的服务ID：

- 服务信息查看

```
docker service ls
```

信息如下：

```
ID                  NAME                MODE                REPLICAS            IMAGE                         PORTS
rfqzt5a4byit        getstartedlab_web   replicated          0/5                 houbinbin/get-started:part2   *:4000->80/tcp
```

- 列出服务对应的任务信息

```
docker service ps getstartedlab_web
```

日志如下：

```
ID                  NAME                  IMAGE                         NODE                DESIRED STATE       CURRENT STATE           ERROR                              PORTS
453xmyqfc56c        getstartedlab_web.1   houbinbin/get-started:part2                       Running             Pending 2 minutes ago   "no suitable node (unsupported…"
tcfvo23qh2aq        getstartedlab_web.2   houbinbin/get-started:part2                       Running             Pending 2 minutes ago   "no suitable node (unsupported…"
k07khp4r3gk6        getstartedlab_web.3   houbinbin/get-started:part2                       Running             Pending 2 minutes ago   "no suitable node (unsupported…"
0cgboieoyd3u        getstartedlab_web.4   houbinbin/get-started:part2                       Running             Pending 2 minutes ago   "no suitable node (unsupported…"
9fvnv6t83004        getstartedlab_web.5   houbinbin/get-started:part2                       Running             Pending 2 minutes ago   "no suitable node (unsupported…"
```

# 扩展应用程序

您可以通过更改docker-compose.yml中的副本值来保存更改，并重新运行docker stack deploy命令来扩展应用程序：

```
docker stack deploy -c docker-compose.yml getstartedlab
```

Docker执行就地更新，无需首先拆除堆栈或杀死任何容器。

现在，重新运行 `docker container ls -q` 以查看已重新配置的已部署实例。如果放大副本，则会启动更多任务，从而启动更多容器。

## 关闭服务

- 移除 app

```
docker stack rm getstartedlab
```

- 移除 swarm

```
docker swarm leave --force
```

使用Docker站起来扩展您的应用程序就像这一样简单。您已经朝着学习如何在生产中运行容器迈出了一大步。接下来，您将学习如何在Docker机器群集上运行此应用程序作为真正的群体。

注意：这样的撰写文件用于使用Docker定义应用程序，可以使用Docker Cloud或使用Docker Enterprise Edition选择的任何硬件或云提供程序上载到云提供程序。

# 拓展阅读

[k8s](https://houbb.github.io/2018/08/18/docker-k8-01-overview-01)

# 参考资料

https://docs.docker.com/get-started/part3/

* any list
{:toc}