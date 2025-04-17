---
layout: post
title: 蓝鲸制品库平台(BlueKing REPO)
date:  2019-4-1 19:24:57 +0800
categories: [Monitor]
tags: [monitor, apm, api, monitor, devops, sf]
published: true
---


# repo

bk-repo是一个基于微服务架构设计的制品管理平台
- 架构层面使用spring boot+ spring cloud的技术栈，是一个kotlin作为主要的开发语言的gradle工程，微服务网关基于openresty。
- 功能层面提供各种类型的制品存储协议、制品代理、分发、晋级、扫描、包管理等。
- 存储层面制品库采用多级分层的策略去接收制品文件，使用对象存储去永久的存储制品文件，使用mongodb去存储节点信息与元数据信息，对外提供高于4个9的可用性。


## Overview
制品库架构图

![制品库架构图](https://github.com/TencentBlueKing/bk-repo/blob/master/docs/resource/bkrepo.png)

- 应用场景层
- oss(运营支撑)层
- 接入协议层
- 存储与调度层


## Features
- auth 统一账号、权限管理，对接bk-user、bk-iam等账号权限体系
- repository 项目、仓库、节点管理、元数据管理
- generic 通用制品管理
- git git code服务
- rpm rpm包管理
- docker image、helm chart、oci 云原生镜像仓库
- npm、composer、pypi、maven、nuget依赖源微服务
- opdata 制品库admin服务
- replication 制品分发服务
- webhook服务 webhook的订阅与推送
- analyst analyst-executor 制品分析

## Experience
- [bk-repo in docker](https://hub.docker.com/r/bkrepo/bkrepo)

## Getting started
* [下载与编译](docs/install/compile.md)
* [安装部署](docs/install/binary/README.md)
* [API使用说明见这里](docs/apidoc/)
* [使用Helm部署BKREPO到K8S环境](support-files/kubernetes/README.md)






# 参考资料

https://github.com/TencentBlueKing/bk-repo

* any list
{:toc}