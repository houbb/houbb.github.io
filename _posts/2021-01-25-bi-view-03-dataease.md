---
layout: post
title:  BI 可视化工具-03-数据可视化分析工具 dataease 人人可用的开源数据可视化分析工具
date:  2021-1-25 16:52:15 +0800
categories: [BI]
tags: [bi, apache, database, sh]
published: true
---
 
# 什么是 DataEase？

DataEase 是开源的数据可视化分析工具，帮助用户快速分析数据并洞察业务趋势，从而实现业务的改进与优化。

DataEase 支持丰富的数据源连接，能够通过拖拉拽方式快速制作图表，并可以方便的与他人分享。

![DataEase](https://private-user-images.githubusercontent.com/41712985/287496081-f951e258-a328-43a9-aa37-ee470d37ed63.png?jwt=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJnaXRodWIuY29tIiwiYXVkIjoicmF3LmdpdGh1YnVzZXJjb250ZW50LmNvbSIsImtleSI6ImtleTUiLCJleHAiOjE3MDQ3Mjc4MjEsIm5iZiI6MTcwNDcyNzUyMSwicGF0aCI6Ii80MTcxMjk4NS8yODc0OTYwODEtZjk1MWUyNTgtYTMyOC00M2E5LWFhMzctZWU0NzBkMzdlZDYzLnBuZz9YLUFtei1BbGdvcml0aG09QVdTNC1ITUFDLVNIQTI1NiZYLUFtei1DcmVkZW50aWFsPUFLSUFWQ09EWUxTQTUzUFFLNFpBJTJGMjAyNDAxMDglMkZ1cy1lYXN0LTElMkZzMyUyRmF3czRfcmVxdWVzdCZYLUFtei1EYXRlPTIwMjQwMTA4VDE1MjUyMVomWC1BbXotRXhwaXJlcz0zMDAmWC1BbXotU2lnbmF0dXJlPTkyNzIwZWZiZjhkNjY0MjRhODMyYzQ0NGM0ODMzMWQ0ZGE3YmJjZmZhNTI4Zjg1ZWZiZjEyYTk5YjdhNTA3NjcmWC1BbXotU2lnbmVkSGVhZGVycz1ob3N0JmFjdG9yX2lkPTAma2V5X2lkPTAmcmVwb19pZD0wIn0.EVOHdYIo5Lq7yU3AUVoRaf3aSlb_iLJYWgPMyh-HfDM)

## DataEase 的优势：

开源开放：零门槛，线上快速获取和安装，按月迭代；
简单易用：极易上手，通过鼠标点击和拖拽即可完成分析；
全场景支持：多平台安装和多样化嵌入支持；
安全分享：支持多种数据分享方式，确保数据安全。

## DataEase 支持的数据源：

EXCEL

mysql

oracle

## DataEase 的技术栈：

前端：Vue.js、Element
图库：AntV
后端：Spring Boot
中间件：MySQL
数据处理：Apache Calcite
基础设施：Docker

## 主要功能

图表展示: 支持 PC 端仪表板及数据大屏；
图表制作: 支持丰富的图表类型、支持拖拉拽方式快速制作仪表板；
数据引擎: 基于 Apache Calcite，实现统一的 SQL 解析、验证、优化和执行；
数据连接: 支持关系型数据库、数据文件、数据仓库等各种数据源。

# 快速入门

## 1 快速部署

按照部署服务器要求准备好部署环境后，可通过 DataEase 安装脚本快速部署。
部署服务器要求：

操作系统: CentOS/RHEL 7 及以上 64 位系统
CPU/内存: 4核8G
磁盘空间: 200G
可访问互联网
将上传至服务器的安装包解压好，在安装包目录里执行以下脚本进行快速安装：

/bin/bash install.sh
DataEase 服务器版是一款 B/S 架构的产品，即浏览器/服务器结构，在服务器安装完成后，客户端通过浏览器访问以下地址，即可开始使用。
http://服务器 IP 地址：服务运行端口（若没有修改则默认为 8100）
使用默认用户名 admin 密码 DataEase@123456 进行登录。

## 2 界面介绍

进入 DataEase 主界面后可以看到界面上方导航栏，有【工作台】【仪表板】【数据大屏】【数据准备】四大模块。

![界面介绍](https://dataease.io/docs/v2/newimg/product_acceptance/%E9%A6%96%E9%A1%B5.png)

### 工作台
【工作台】模块界面主要分为资源概览、快速创建和近期动态三个区域。

资源概览：可以查看用户在当前组织下的拥有权限的资源统计；
快速创建：不用切换界面即可快捷创建仪表板、数据大屏、数据集或数据源；
近期动态：可以查看最近使用、我的收藏、我的分享的最新操作使用记录。

### 仪表板
【仪表板】模块界面主要分为目录区域与预览区域，业务人员可在此创建图表进行可视化分析，更倾向于快速创建及交互操作。

目录区域：添加目录/仪表板，对仪表板进行编辑、分享等；
预览区域：预览、收藏、导出仪表板等。
详细功能请参考本文档功能手册仪表板。

### 数据大屏
【数据大屏】模块界面主要分为目录区域与预览区域，业务人员可在此创建图表进行可视化分析，更倾向展示效果。

目录区域：添加目录/数据大屏，对数据大屏进行编辑、分享等；
预览区域：预览、收藏、导出数据大屏等。
详细功能请参考本文档功能手册数据大屏。

### 数据准备
【数据准备】模块分为数据源和数据集，进行相关的数据准备.

数据源：添此界面是用来管理各类数据连接信息，是后续数据分析操作中数据的来源。详细功能请参考本文档功能手册数据源。
数据集：为数据分析或可视化分析进行相关的数据准备。详细功能请参考本文档功能手册数据集。
详细功能请参考本文档功能手册【数据准备】。

# 参考资料

https://github.com/dataease/dataease

https://dataease.io/docs/v2/

https://dataease.io/docs/v2/quick_start/

* any list
{:toc}