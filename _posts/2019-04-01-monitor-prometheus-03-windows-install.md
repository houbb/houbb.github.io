---
layout: post
title: Prometheus-监控 普罗米修斯 普米-03-prometheus windows 安装笔记
date:  2019-4-1 19:24:57 +0800
categories: [Monitor]
tags: [monitor, apm, time-series, sf]
published: true
---

# 序言

平时工作中用到很多次 prometheus，但是自己一直没有研究使用。

# 下载

进入[prometheus官网](https://prometheus.io/download/)，下载prometheus包prometheus官网

这里选择 [prometheus-3.3.0.windows-amd64.zip](https://github.com/prometheus/prometheus/releases/download/v3.3.0/prometheus-3.3.0.windows-amd64.zip)

下载后直接解压

解压后进入目录运行premetheus.exe，

## 访问

访问端口9090即可，需要查看监控的对象列表可以进入status>targets查看

> [http://localhost:9090/targets](http://localhost:9090/targets)

## 个人感受

部署真的很简单，有手就行。

软件就需要给用户这种简单的体验。

# exporter

若需要监控服务器资源、数据库、kafka等需要下载对应的exporter

windows_exporter可以监控windows的一些指标参数，下载地址为windows_exporter，下载msi文件直接运行即可成功安装，默认端口是9182，然后到prometheus安装目录修改配置文件prometheus.yml，修

> [https://github.com/prometheus-community/windows_exporter/releases](https://github.com/prometheus-community/windows_exporter/releases)

改配置文件后重启prometheus，然后就可以看到targets列表增加的项目，状态为up表示正常监控，状态为down表示未检测到

![config](https://i-blog.csdnimg.cn/blog_migrate/184177751414f478cf7110246b6e4674.png)

linux常用的有node_exporter：监控服务器资源

mysqld_exporter:监控数据库

下载后放到需要监控的机器，直接运行，然后到prometheus安装目录修改配置文件prometheus.yml,添加exporter对应的ip以及端口，node_exporter默认端口是9100，mysqld_exporter默认端口9104

## 个人感受

如果我们设计一套指标的采集，也可以用类似的思路。

定义标准的 exportor 接口，实现各种具体的指标采集。

然后再 conf 文件中配置处理。



# 参考资料

https://blog.csdn.net/qq_39566521/article/details/124300433

https://blog.csdn.net/qq_38362419/article/details/108527506

* any list
{:toc}