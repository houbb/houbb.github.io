---
layout: post
title: Docker learn-15-Swarm Mode
date:  2019-12-18 11:34:23 +0800
categories: [Docker]
tags: [docker, windows, devops, go-lang, sh]
published: true
---

# SWARM MODE 服务

- 服务（Service）作为集群的操作对象，服务由任务（task）来实现，容器作为实现任务的一个执行方式

- 服务可以指定任务数量，也可以是全局任务（每个节点运行一个）

- 调度器管理任务的目标状态（desired state），分配资源给任务，选择节点来执行任务

- 节点支持将任务的状态推动到目标状态，反馈状态给管理节点

- 支持服务配置更新，滚动更新，回滚

- 内置overlay网络，DNS服务发现，负载均衡

![swarm mode](https://user-images.githubusercontent.com/18375710/71187209-93ab6980-22b9-11ea-8cf5-369aaa8b00e1.png)

# SWARM 功能模块

![image](https://user-images.githubusercontent.com/18375710/71187465-1af8dd00-22ba-11ea-8294-80aa48250499.png)

# ROLLING  UPDATE

- 迭代（更新一个新版本）

- 业务连续性

- 风险的规避方式

## ROLLING  UPDATE  &  ORCHESTRATION

```
$ docker service update -‐-‐image redis:3.0.7 redis
redis
```

- 停止相应的任务

- 更新停止任务的信息

- 为更新后的任务启动新容器

- 若容器启动成功，进行下一次更新

- 若容器启动失败，中止更新

# 个人收获

swarm 是一种对于 docker 的编排管理。

类似的实现还有很多，要理解其中的思想。

# 拓展阅读

[k8s](https://houbb.github.io/2018/08/18/docker-k8-01-overview-01)



# 参考资料

《rolling_update_还看Docker原生支持》

* any list
{:toc}