---
layout: post
title: Open-Falcon
date: 2018-11-25 09:14:43 +0800
categories: [Devops]
tags: [devops, monitor, sh]
published: true
excerpt: Open-Falcon 分布式监控系统
---

# Open-Falcon

[Open-Falcon](http://open-falcon.org/) is a Distributed and High-Performance Monitoring System.

# 特性

## 可扩展性

可扩展的监控系统是支持快速业务增长所必需的。 Open-Falcon的每个模块都非常容易水平扩展。

## 性能

使用RRA（Round Robin Archive）机制，可以在一秒钟内返回100多个指标的一年历史数据。

## 高可用性

没有关键的单点故障，易于操作和部署。

## 灵活性

Falcon-agent已有400多个内置服务器指标。用户可以通过编写插件来收集他们的自定义指标，或者只是简单地运行脚本/程序来将指标中继到falcon-agent。

## 效率

为了更轻松地管理警报规则，Open-Falcon支持策略模板，继承和多重警报方法，以及恢复回调。

## 用户友好的仪表板

Open-Falcon可以呈现多维图形，包括用户定义的仪表板/屏幕。


# 快速开始

[快速开始](https://github.com/open-falcon/falcon-plus/blob/master/README.md)

[中文文档](http://book.open-falcon.org/zh/intro/index.html)

* any list
{:toc}