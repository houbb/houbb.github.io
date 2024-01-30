---
layout: post
title: ETL-19-apache SeaTunnel Engine rest-api 一种基于 api 调用的方式
date: 2024-01-05 21:01:55 +0800
categories: [ETL]
tags: [etl, sh]
published: true
---

# REST API

SeaTunnel 具有一个监控 API，可用于查询正在运行的作业的状态和统计信息，以及最近完成的作业。

监控 API 是一个支持 HTTP 请求并以 JSON 数据响应的 RESTful API。

# 概述

监控 API 由作为节点一部分运行的 Web 服务器支持，每个节点成员都可以提供 REST API 的功能。

默认情况下，此服务器在端口 5801 上监听，可以在 hazelcast.yaml 中进行配置，例如：

```yaml
network:
    rest-api:
      enabled: true
      endpoint-groups:
        CLUSTER_WRITE:
          enabled: true
        DATA:
          enabled: true
    join:
      tcp-ip:
        enabled: true
        member-list:
          - localhost
    port:
      auto-increment: true
      port-count: 100
      port: 5801
```

# API 参考

## 获取所有作业及其当前状态的概述。

GET
/hazelcast/rest/maps/running-jobs
(返回所有作业及其当前状态的概述。)

## 返回作业的详细信息。

GET
/hazelcast/rest/maps/running-job/:jobId
(返回作业的详细信息。)

## 返回系统监控信息。

GET
/hazelcast/rest/maps/system-monitoring-information
(返回系统监控信息。)

## 提交作业。

POST
/hazelcast/rest/maps/submit-job
(如果成功提交作业，返回 jobId 和 jobName。)

## 停止作业。

POST
/hazelcast/rest/maps/stop-job
(如果成功停止作业，返回 jobId。)

# 说明

这种方式可以用来基于 api 的方式管理任务的调用。

# 参考资料

https://seatunnel.apache.org/docs/2.3.3/seatunnel-engine/rest-api

* any list
{:toc}