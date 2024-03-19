---
layout: post
title:  Docker learn-06-docker commands 命令
date:  2019-12-18 11:34:23 +0800
categories: [Docker]
tags: [devops, docker, learn-note, cloud, sh]
published: true
---

# Docker 操作参数解读

本节将有选择地介绍Docker命令行工具的部分功能，旨在帮助读者快速入门，对于Docker命令行工具的完整介绍，读者可以参考Docker官方网站相关内容。

本节主要讲解Docker命令的使用方法及其操作参数，命令内部的运行流程和原理将在第3章介绍。

## 流程

用户在使用Docker时，需要使用Docker命令行工具docker与Docker daemon建立通信。Dockerdaemon是Docker守护进程，负责接收并分发执行Docker命令。

为了了解Docker命令行工具的概况，我们可以使用docker命令或docker help命令来获取docker的命令清单。

## 通用 api

![image](https://user-images.githubusercontent.com/18375710/71147040-7d25f380-2262-11ea-92ed-de68c50ecedd.png)

## 查看命令

```
$ docker 

Usage:  docker [OPTIONS] COMMAND

A self-sufficient runtime for containers

Options:
      --config string      Location of client config files (default "/home/docker/.docker")
  -D, --debug              Enable debug mode
  -H, --host list          Daemon socket(s) to connect to
  -l, --log-level string   Set the logging level ("debug"|"info"|"warn"|"error"|"fatal") (default "info")
      --tls                Use TLS; implied by --tlsverify
      --tlscacert string   Trust certs signed only by this CA (default "/home/docker/.docker/ca.pem")
      --tlscert string     Path to TLS certificate file (default "/home/docker/.docker/cert.pem")
      --tlskey string      Path to TLS key file (default "/home/docker/.docker/key.pem")
      --tlsverify          Use TLS and verify the remote
  -v, --version            Print version information and quit

...
```

## 需要 root 权限

值得一提的是，docker命令的执行一般都需要获取root权限，因为Docker的命令行工具docker与Docker daemon是同一个二进制文件，而Docker daemon负责接收并执行来自docker的命令，它的运行需要root权限。

同时，从Docker 0.5.2版本开始，Docker daemon默认绑定一个Unix Socket来代替原有的TCP端口，该Unix Socket默认是属于root用户的。

因此，在执行docker命令时，需要使用sudo来获取root权限。

## 命令

随着Docker的不断发展，docker的子命令已经达到39个（如attach、build），其中核心子命令（如run、exec等）还有复杂的可选执行参数，用户可以使用相应的命令和参数实现丰富强大的功能。

对于每一个特定的子命令，用户可以使用 `docker COMMAND --help` 命令来查看该子命令的详细信息，包括子命令的使用方法及可用的操作参数。

此外，除了命令的操作参数外，用于管理容器的Docker daemon也有详细的参数配置，使用 docker命令或docker help命令来查看，读者可以自行尝试。

## 分类

| 分类 | 子命令 |
|:----|:----|
| Docker环境信息    | info、version |
| 容器生命周期管理  |  Create、exec、kill、pause、restart、rm、run、start、stop、unpause |
| 镜像仓库命令      | login、logout、pull、push、search |
| 镜像管理          | build、images、import、load、rmi、save、tag、commit |
| 容器运维操作      | attach、export、inspect、port、ps、rename、stats、top、wait、cp、diff |
| 系统日志信息      | events、history、logs |

## 命令执行流程

从docker命令使用出发，梳理出如图2-1所示的命令结构图，希望帮助读者更进一步了解Docker的命令行工具。

![image](https://user-images.githubusercontent.com/18375710/71082606-59b06980-21cc-11ea-9847-33227907cc10.png)

# 参考资料

《Docker：容器与容器云》

* any list
{:toc}