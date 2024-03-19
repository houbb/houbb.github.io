---
layout: post
title: Docker learn-11-码市实战
date:  2019-12-18 11:34:23 +0800
categories: [Docker]
tags: [docker, windows, devops, sh]
published: true
---

# 前言

对于一项新技术，人们总是觉得如何赞。

但现实实际是残酷的，没有任何技术时完美无缺的。

我们总是为了解决一个问题而引入新的工具，从而带来新的问题。

# Docker Image 并没有那么好

# DOCKERFILE 真的有用吗

## FROM 的问题

- 基础镜像没有一个靠谱的

- Debian, Ubuntu, 还有Centos/Fedora 基于什么的都有

- Hub上到处是雷和Abandon-ware

- 新一代的copy & paste 大法

## RUN 的问题

- apt-get update –y && apt-get upgrade –y

- 每句加一个layer, 轻松来个十几G的镜像

- 没完没了的等，继续等，使劲等

# DOCKERFILE 有卵用吗

## CMD / ENTRYPOINT 的问题

- 这俩居然也占layer, 服了.

- 编译产生的垃圾谁负责？代码谁负责清理?

- 有必要把运行命令写死在镜像里吗.

# BUILD & PACKAGE

接口比实现重要一万倍

## BUILD

- 所有主流编程语言都已然实现了编译和打包工具

- 依赖管理就不是个问题

Vendoring, 自包含镜像，等等，除非姿势不正确。

- 接口统一

实现自己写去

## PACKAGE

- 暂时还是先用Docker Image

随时也可以改

- 正确的Dockerfile 只有三行

```
FROM base20151030:jre8.20u
ADD app.jar /app
CMD [ “java” , “-jar”, “app.jar” ]
```

其实也可以只有两行

# 废柴的 DOCKER REGISTRY

勉强凑活用，因为实在不重要

## REGISTRY 的作用

Over-engineering 的FTP

API, 客户端library 也不那么完善

实在排不上优先级去折腾，先凑活用吧

# 坑爹的DOCKER RUNTIME

小姐的身子，丫鬟的命

## DOCKER DAEMON 大坑实录

docker container 在stdout/stderr 有大量数据传输会导致内存泄露，直至docker daemon OOM

docker daemon 在频繁创建container 后，会在文件系统中遗留很多垃圾文件不清理，导致磁盘inode 被耗尽

docker 里面没有init, daemon也没有reap子进程fork 很多进程，会在系统中出现很多僵尸进程，最终导致docker daemon 出现问题。

# 去其糟粕，取其精华

没有卵用的花哨、前沿功能，一律不用

## CODING 的容器配置

- 单进程, 微服务，没必要那么多限制

trust-cooperative 环境，我们不是IAAS

- Host 网络模式

不趟SDN, proxy这样的浑水/雷区，性能也不受影响

- host上数据持久化

未来可能可以考虑data container, 但是然并卵

直接mount Host locale, timezone, passwd 等配置.

## 不存在的 DOCKER 编排系统

Swarm, K8s, Mesos

### 神仙打架，百姓遭殃

- Swarm, kubernetes, Mesos

都处于早期，步子迈的太大。

- 动态伸缩的需求有，但是没那么大

静态、手动的资源分配

IAAS 也降低了对这个的需求。

- 对docker 容器的直接接管能力都不行.

需要的功能都没有，没用的烂事一堆

# 工具、实用、半自动

把有限的精力花在最需要的功能上

## 代码化的生产环境

- 记录什么东西跑在什么机器上

- 常用属性的的管理

- Jobs/Tasks 抽象层

- 集群可复制

## 半自动化操作

- `./coding-job up coding-mart`

自动使用标准配置启动一个容器

- `./coding-job down coding-mart`

自动干掉这个容器

- `./coding-job status coding-mart`

监控容器的状态，内存等

## 高级自动化操作

- 执行update 操作，会列出当前的image 列表，选择后就可以进行全自动更新。

# 实践总结

## 三个关注点

- 软件架构的升级

微服务、无状态、数据执行分离

- 研发体系、环境管理理念的升级

容器化、代码化、自动化

- 资源管理理念的升级

Pet Vs Cattle

多留点富余量，迁移能力比压榨能力更重要

![image](https://user-images.githubusercontent.com/18375710/71149830-be220600-226a-11ea-909b-9a018e9354a2.png)

# 参考资料

《Coding容器化实践分享：Docker理念解析与技术填坑》

* any list
{:toc}