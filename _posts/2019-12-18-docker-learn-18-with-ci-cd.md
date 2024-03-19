---
layout: post
title: Docker learn-18-持续集成与 docker
date:  2019-12-18 11:34:23 +0800
categories: [Docker]
tags: [docker, windows, devops, ci, sh]
published: true
---

# Metrics（指标） in CI/CD

CI(Continuous Integration) 编码 —> 开发完成

CD(Continuous Delivery) 开发完成 —> 上线发布

- 衡量一个CI系统最重要的因素

⾃自动化程度如何？

时间（环境准备，测试运⾏行）够快？

- 衡量一个CD系统最重要的因素

能够实现快速并且可重复的发布？

# 传统 CI/CD 存在的问题

- CI的现状

手动测试 —> jenkins —> jenkins + 虚拟化

- CD的现状

手动运维部署 —> 开发自己部署工具或者发布平台

- Problems

如何做到完全的自动化

干净隔离的测试环境 vs 尽可能少的测试准备时间

如何解决"可是，为什么它在我的环境中跑的OK呢？"

# Docker 能解决什么问题？

## 问题

1. 如何做到完全的⾃自动化

2. 干净隔离的测试环境 vs 尽可能少的测试准备时间

3. ’为什么它在我的环境中跑的OK呢？’

# Docker 的设计架构

![image](https://user-images.githubusercontent.com/18375710/71231678-f63c4e00-2329-11ea-8093-c45ddd172683.png)

## CI/CD Componets

Controller：接受portal的api调⽤用，CI/CD的控制器

Scheduler：调度器，负责build job队列的调度

Builder：执⾏行build job，使⽤用docker作为sandbox

Hook: 接受github/bitbucket的web hook调⽤用，⽤用户对源代码的改动会触发github/bitbucket的web hook

Notification：负责job完成之后的通知，email，github status 设置

## CI/CD 架构

![image](https://user-images.githubusercontent.com/18375710/71231754-2ab00a00-232a-11ea-9c29-ea525fa4a500.png)

## Effective Docker

如果你需要⼀一个轻量级的sandbox⽅方案，请⾸首先考虑docker

如果你的项⺫⽬目花费不少⼈人⼒力在你的测试环境和⽣生产环境中部署开源软件，请考虑使⽤用docker，

获取直接部署好的docker image 

谨慎使⽤用docker in docker，network和volume的复杂性会急剧增加

提供多租户服务的场景中，同样谨慎使⽤用docker，docker在资源隔离⽅方⾯面做的并不完善

使⽤用DaoCloud的docker加速器，它将⼤大幅加速您访问dockerhub的速度

# 拓展阅读

[jenkins-持续集成](https://houbb.github.io/2016/10/14/jenkins)

[SCM 系统](https://houbb.github.io/2019/12/18/scm)



# 参考资料

《Docker 在生产环境的挑战和应对》

* any list
{:toc}
