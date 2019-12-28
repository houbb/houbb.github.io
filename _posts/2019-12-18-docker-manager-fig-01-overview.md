---
layout: post
title:  Docker 编排管理-Fig
date:  2018-08-18 10:30:43 +0800
categories: [Docker]
tags: [docker, k8, sh]
published: true
---

# 什么是编排？

编排（译者注：Orchestration，翻译为编排）是指同时管理多个容器的行为。

当你刚开始玩Docker的时候，你只需要操作一个容器。

紧接着你学习了网络并得知把所有进程都放入同一个容器中并不合适，然后不知不觉你就发现自己已经建立了多容器的基础架构。

你第一次尝试可能不会感到复杂，但是当使用两个或者三个容器的时候，你就会觉得很麻烦。

手动连接容器、管理卷，很快你就乱了，应该有更好更实用的工具来做这件事。

这个更实用的工具称为Fig。

# FIG

Fig 是Orchard的一个产品并很快成为自动化Docker容器编排一个事实标准，目前Fig已经被Docker公司收购并成为官方支持的解决方案。

Fig 是一个基于Docker的用于快速搭建开发环境的工具，目前Fig团队已经加入Docker公司。

Fig 通过一个配置文件来管理多个Docker容器，非常适合组合使用多个容器进行开发的场景。

Fig 可以和Docker一起来构建基于Docker的复杂应用。

本文详细介绍了Fig的安装以及使用。

## 安装

fig 只能运行在 liunx 系统。

目前在 windows 环境下无法使用。

直接使用 ubuntu 镜像先安装一下。

```
docker run -it a679032e6a0e /bin/bash
```

a679032e6a0e 是我本地的一个


# 其他编排工具

K8x

Swarm

Mesos

# 拓展阅读

[K8S 入门学习](https://houbb.github.io/2018/08/18/docker-manager-k8-01-overview)

## 更多学习

关注公众号：老马啸西风

![image](https://user-images.githubusercontent.com/18375710/71187778-b427f380-22ba-11ea-8b72-cab863753533.png)

# 参考资料

《第一本 Docker 书》

* any list
{:toc}
