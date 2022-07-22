---
layout: post
title: SOFADashboard 介绍-01-overview
date:  2022-07-09 09:22:02 +0800
categories: [SOFA]
tags: [sofa, SOFADashboard, sh]
published: true
---


# SOFADashboard 介绍

SOFADashboard 致力于对 SOFA 框架中组件进行统一管理，包括服务治理、SOFAArk 管控等。

SOFADashboard 本身所用技术栈均基于开源社区产品来开发构建，包括：Ant Design Pro、SOFABoot、Spring、MyBatis 等。

目前，SOFADashboard 中的服务治理、SOFAArk 管控等需要依赖于 Zookeeper，因此如果您需要使用 SOFADashboard 那么请确保 Zookeeper 服务可用；另外 SOFAArk 管控部署需要依赖 MySQL 进行资源数据存储，因此也需要保证 MySQL 可以正常使用。

# 架构简图

![架构简图](https://gw.alipayobjects.com/mdn/sofastack/afts/img/A*uVAiQKWS4G4AAAAAAAAAAABjARQnAQ)

SOFADashboard 目前服务治理与 SOFAArk 管控都是面向 Zookeeper 来编程实现的。

SOFADashboard backend : 对应 sofa-dashboard-backend 工程，是 SOFADashboard 的服务端工程，负责与 Zookeeper 和 MySQL 进行数据交互，并且为 SOFADashboard frontend 提供 rest 接口。

SOFADashboard frontend : 对应 sofa-dashboard-frontend 工程，是 SOFADashboard 的前端工程，用于提供与用户交互的 UI 界面。

app 应用

rpc provider : SOFARPC 的服务提供方，会将服务注册到 Zookeeper 上。

rpc consumer : SOFARPC 的服务消费方，会从 Zookeeper 上订阅服务。

client : SOFADashboard 客户端，引入 sofa-dashboard-client 包即可。目前仅提供将应用的健康检查状态及端口信息注册到 Zookeeper ，后面将会演化成 SOFABoot client，上报更丰富的应用数据。

ark-biz 宿主应用: 参考 SOFAArk 。

# 快速开始

这个快速开始可以帮您快速在您的电脑上，下载、安装并使用 SOFADashboard。

## 环境准备

sofa-dashboard-backend 依赖 Java 环境来运行。请确保是在以下运行环境可以正常使用:

JDK 1.8+；下载 & 配置。
Maven 3.2.5+；下载 & 配置。
sofa-dashboard-frontend 使用了 Ant Design Pro 脚手架，前端环境请参考 Ant Design

## 数据库初始化

Mysql 版本：5.6+

SOFAArk 管控需要依赖 MySQL 进行资源数据存储，工程目录下有一个 SofaDashboardDB.sql 脚本文件，可以通过执行这个脚本文件进行数据库表的初始化。

## Zookeeper 

ZooKeeper 3.4.x and ZooKeeper 3.5.x

SOFADashboard 中的服务治理、SOFAArk 管控依赖于 Zookeeper，需要本地启动 Zookeeper 服务： ZooKeeper Document。

## 后端运行

```
> git clone https://github.com/sofastack/sofa-dashboard.git
> cd sofa-dashboard
> mvn clean package -DskipTests
> cd sofa-dashboard-backend/sofa-dashboard-web/target/
> java -jar sofa-dashboard-web-1.0.0-SNAPSHOT.jar
```

## 前端运行

sofa-dashboard-front 是 SOFADashboard 的前端代码工程，基于蚂蚁金服开源的前端框架 antd 开发。

```
> cd sofa-dashboard-front
> npm i
> npm run dev
```




# 参考资料

https://www.sofastack.tech/projects/sofa-lookout/overview/

* any list
{:toc}