---
layout: post
title: Docker learn-17-生产环境的挑战 私有镜像
date:  2019-12-18 11:34:23 +0800
categories: [Docker]
tags: [docker, windows, devops, go-lang, sh]
published: true
---

# PaaS 困境

PasS(Platform as a service) 从万众瞩目到普遍质疑

- PaaS企业⽣生存艰难

- *AE等模式不被⼲⼴广泛接受

- PaaS⾛走向垂直化

# Docker 的优势

- 适应能⼒力强，可应⽤用到⾮非常多应⽤用场景

传统vm、快速开发环境提供、打包、隔离等

可⽆无痛运⾏行各种各样的中间件和应⽤用

- ⾃自包含self-contained

开发、测试、生产的一致性

跨不同基础设施的转移能⼒力

- Docker 已经在开发环境赢得了开发者的拥护

- 开发环境和⽣生产环境需求不同

| 开发环境 | 生产环境 |
|:---|:---|
| 单机 | 集群 |
| 功能 | 性能/稳定 |
| 调试 | 维护 |
| Dev  | Ops |

# 提纲

镜像管理

发布管理

⽇日志管理

配置管理

存储管理

⺴⽹网络管理

# 镜像管理

## 镜像存在的问题

编写Dockerfile构建镜像,调试⿇麻烦

代码发布频率⾼高，镜像更新频繁，升级⿇麻烦

Registry单点如何克服

Docker pull拉取镜像太慢如何解决

Registry如何做好权限管理

ps: 其实和 maven 包的管理非常相似。

## 镜像制作原则

坚持Dockerfile生产镜像的原则

镜像之间避免依赖过深，一般建议三层

基础OS镜像、中间件镜像、应⽤用镜像

坚持”所有镜像都应该有对应的Git仓库”

## 镜像制作⽅方法

Dockerfile调试⿇麻烦

运⾏行一个基础镜像并attach到bash

交互式进⾏行软件的安装、配置的修改

commit⽣生成镜像，指定CMD反复测试镜像

编制Dockerfile并build

运⾏行多进程，需要init进程且⽀支持SIGTERM转发

## 镜像更新

代码发布频率⾼高，导致镜像更新频繁

- 镜像的更新通过SCM和CI系统⾃自动触发实现⾃自动化

![image](https://user-images.githubusercontent.com/18375710/71223759-e7e13880-230f-11ea-86fa-366708cf6d54.png)

- 应⽤用镜像严格使⽤用Git SHA作为镜像的Tag

OS镜像和中间件镜像一般使⽤用软件版本作为tag，需要小心ImageID变化但Tag没有变化，可能会造成依赖它的应⽤用镜像故障

## 私有 Registry

### Registry单点问题

- 存储使⽤用本地硬盘可考虑drbd，主备模式

- 后端采⽤用分布式存储，⽐比如swift等

- 如果在云端，可考虑直接使⽤用对象存储，目前阿⾥里云的OSS和新浪云存储都可以作为Registry的后端

### Regitry性能问题

- http反向代理缓存可以加速Layer的下载

- Registry v1 Mirror 功能不⽀支持私有Registry，v2有望改进，Mirror功能可以解决⾼高可⽤用、pull性 能等问题 docker/distribution

### Registry⽤用户权限

- Docker Index是⽤用于解决Registry⽤用户管理和镜像索引的服务

- Nginx LUA可以提供一个简单快速的实现⽅方案

# 发布管理

## 常⻅见的发布流程

备份数据

依赖检查和确认

基于package或者代码的部署

检查升级是否正常，失败回滚

- 风险

漏掉某个依赖或依赖对象不匹配；回滚考虑的细节点太多，经常导致⽆无法回滚

## 基于 Docker 的发布

![image](https://user-images.githubusercontent.com/18375710/71224899-bec1a780-2311-11ea-9ad3-06a900144e37.png)

# 日志管理

## 日志管理的问题

- docker 作为虚拟机，日志管理没有问题

- docker 仅运行服务

⽇日志回滚、收集更加复杂

容器销毁⽇日志消失

## 日志收集方案

- 日志打印到stdout/stderr

通过logspout收集转发

比如阿里云就是借助 tail 工具收集的。

- ⽇日志打印到⽂文件

日志存储到外部volume下

在Host上收集转发,建议ELK⽅方案logstash+elasticsearch

例如 filebeta 之类的工具。

- docker1.6 ⽀支持⽇日志收集，syslog

## 日志回滚方案

- 业务连续性要求高

直接truncate日志⽂文件

- 日志数据完整性要求高

```
mv logfile logfile.1
docker restart      (业务瞬断)
```

- 日志写往/dev/log

通过syslog收集转存或转发

转存到本地需要回滚，但不需要重启容器

# 配置管理

## 配置管理的问题

- 容器里没有CM agent，无法接收CM指令

- CM运行到Host上⽆无法管理到容器里的⽂文件

- 手工修改容器内的配置，新创建的容器仍然是旧的

当作vm没有这样处理没有问题

丧失了动态扩展的特性

## 配置变更建议

传统上使⽤用CM管理⼯工具管理配置的分发并保证收敛

- 服务之间连接(connect)相关的配置

使⽤用服务发现系统⾃自动适配

通过传递环境变量协调在开发和⽣生产环境的配置差异

- 一般的配置⽂文件参数

配置⽂文件和Dockerfile一起存储到一个Git仓库，修改后⾃自动build更新镜像

# 存储管理

## 数据存储的挑战

体积大，若干G

不断被修改

转移难度高

## 各种存储方案的优缺点

![image](https://user-images.githubusercontent.com/18375710/71225319-32b07f80-2313-11ea-91c9-0426e99888a3.png)

## 存储使用的建议

优先使用内部已有的健壮的存储，比如SAN

否则使用本地存储，做好复制和备份策略

创建data-only容器，做好命名标志，避免误删除

# 网络管理

## Docker 支持的网络

- Host网络，一般不推荐

- NAT网络(默认)

- 物理网桥

- 网络虚拟化

## Host 网络问题

- 容器和主机共享网络命名空间

- 不同容器需要做好端口规划，防止端口冲突

- 无法针对容器统计网络流量

## Nat 网络问题

基于四层代理以及NAT技术

依赖Portmap

进出都需要转发，性能低

Host上需要做好端⼝口规划，容易搞混

## 物理网桥的问题

静态绑定IP到容器，不适合动态变化

动态dhcp分配IP到容器，需要管理好租期⻓长短，因为容器的生命周期比虚拟机短很多

docker build失效

不适合单主机运行超大量容器(比如1000)

## 网络虚拟化

基于隧道的overlay网络

目前有基于vxlan、gre、udp等不同的实现

开源方案

socketplane

weave

flannel

基于ovs的pipework

## 网络方案的建议

性能要求低，业务不复杂，规模不大，端口映射挺好

容器数量有限且相对静止，物理网桥方案很好

数量⼤大，动态创建销毁，建议采纳网络虚拟化

尽量固化IP和端口的分配，避免过于随机

避免使⽤用docker link，依赖陷阱，”自包含”好处失效

被依赖容器的ip和端口重启不发生变化，可以使用link

# 拓展阅读

[jenkins-持续集成](https://houbb.github.io/2016/10/14/jenkins)

[SCM 系统]()



# 参考资料

《Docker 在生产环境的挑战和应对》

* any list
{:toc}
