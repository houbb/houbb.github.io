---
layout: post
title:  BI 可视化工具-03-dataease 系统架构
date:  2021-1-25 16:52:15 +0800
categories: [BI]
tags: [bi, apache, database, sh]
published: true
---
 
# 1 整体架构

![功能架构](https://dataease.io/docs/v2/newimg/product_acceptance/%E5%8A%9F%E8%83%BD%E6%9E%B6%E6%9E%84%E5%9B%BE.jpg)

# 2 组件说明

Frontend: DataEase 的前端工程, 基于 Vue.js 进行开发；
Backend: DataEase 的后端工程, 基于 Spring Boot 进行开发, 为 DataEase 的功能主体；
MySQL: DataEase 项目的主要数据均存储在 MySQL；
Apache Calcite: 用于对各个数据源做 SQL 方面的统一处理；
Apache Apisix: API 网关，用来处理路由、认证、IP 访问限制等。

各个组件间的关系可参考下图

![关系](https://dataease.io/docs/v2/newimg/product_acceptance/2.0%E7%BB%84%E4%BB%B6%E5%85%B3%E7%B3%BB%E5%9B%BE.png)

# 3 关键术语

DataEase 中有一些基本概念，下面是这些基本概念的说明：

数据源: 用来管理各类数据源连接信息，是后续数据分析操作中数据的来源；
数据集: 数据的集合，可以是数据表、Excel 表等具体的数据集合，是可视化图形展示的数据来源；
图表: 可视化展示的最小单元，是组成仪表板或数据大屏的基本元素，可以是折线图、柱状图、饼状图等可视化图形；
仪表板: 通过可视化效果展示具体数据常见的图形面板，倾向于快速创建及交互操作；
数据大屏: 通过可视化效果展示具体数据常见的图形面板，更倾向展示效果；
组件: 仪表板或数据大屏中各种元素的统称，例如图表组件、图片组件、筛选组件等。

# 4 技术栈¶

后端：Spring Boot
前端：Vue.js、Element
中间件：MySQL
数据处理：Apache Calcite
基础设施：Docker



# 参考资料

https://dataease.io/docs/v2/system_arch/

* any list
{:toc}