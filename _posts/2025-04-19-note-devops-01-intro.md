---
layout: post
title: devops 开发流水线笔记 pipeline 流水线
date: 2025-4-19 14:31:52 +0800
categories: [Note]
tags: [note, devops, sh]
published: true
---


# 一般的研发流程


```
用户痛点===》业务需求===》研发实现===》测试验证（功能/性能）===》QA（安全性、代码质量、依赖冲突等）===》上线发布===》日常运维===》（可观测）
```


# 可观测

Trace

日志

Metric

变更 Event

CMDB 拓扑

知识库（SOP 预案）

影响面分析

## Trace

skywalking

普米、zabbix

CAT

切面日志


## 巡检

测试

# RCA

alarm--vm--nginx--app

推荐，自身+依赖。

GC 服务 down 机器

# pipeline 流水线

devops CI 流水线

## 基础

cmdb（资源）

ums+passport+sso（人）

审批流（流程）

事件管理平台（闭环）

## 技术选型

自主研发

二次开发（推荐这个）

商用


实现一个开箱就用的实现----------









# 参考资料


* any list
{:toc}