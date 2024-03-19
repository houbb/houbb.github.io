---
layout: post
title:  Kubernetes-01-快速开始 k8s
date:  2019-12-18 11:34:23 +0800
categories: [Docker]
tags: [docker, k8, devops, overview, sh]
published: true
---

# Kubernetes

[Kubernetes](https://kubernetes.io/) is an open-source system for automating deployment, 
scaling, and management of containerized applications.

## 产品特性

- Automatic binpacking

根据资源需求和其他约束自动放置容器，同时不牺牲可用性。混合关键工作负载和最佳工作负载，以提高利用率并节省更多资源。

- Self-healing

重新启动失败的容器，在节点死亡时替换和重新安排容器，杀死不响应用户定义的健康检查的容器，在客户端准备好服务之前不向客户发布它们。

- Horizontal scaling

使用简单的命令、UI或基于CPU使用情况的自动缩放应用程序。

- Service discovery and load balancing

不需要修改应用程序以使用不熟悉的服务发现机制。

Kubernetes为容器提供了它们自己的IP地址和一组容器的一个DNS名称，并且可以在它们之间进行负载平衡。

- Automated rollouts and rollbacks

Kubernetes将逐步地对应用程序或其配置进行更改，同时监视应用程序的健康状况，以确保不会同时杀死所有实例。

如果出现问题，Kubernetes将为您回滚更改。利用日益增长的部署解决方案生态系统。

- Secret and configuration management

部署和更新秘密和应用程序配置，而无需重新构建映像，也无需在堆栈配置中公开秘密。

- Storage orchestration

自动挂载您选择的存储系统，无论是本地存储、公共云提供商(如GCP或AWS)，还是网络存储系统(如NFS、iSCSI、Gluster、Ceph、Cinder或Flocker)。

- Batch execution

除了服务之外，Kubernetes还可以管理批处理和CI工作负载，如果需要的话，可以替换失败的容器。

# 学习教程

[A Tutorial Introduction to Kubernetes](http://okigiveup.net/a-tutorial-introduction-to-kubernetes/)

* any list
{:toc}
