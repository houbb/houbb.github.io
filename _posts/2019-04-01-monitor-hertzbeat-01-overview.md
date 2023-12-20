---
layout: post
title: 监控利器之 HertzBeat 赫兹跳动-01-入门介绍
date:  2019-4-1 19:24:57 +0800
categories: [Monitor]
tags: [monitor, apm, api, sf]
published: true
---

# HertzBeat 赫兹跳动

易用友好的开源实时监控告警系统，无需Agent，高性能集群，兼容Prometheus，强大自定义监控能力。

## 介绍

HertzBeat 赫兹跳动 是一个拥有强大自定义监控能力，高性能集群，兼容 Prometheus，无需 Agent 的开源实时监控告警系统。

## 特点

集 监控+告警+通知 为一体，支持对应用服务，应用程序，数据库，缓存，操作系统，大数据，中间件，Web服务器，云原生，网络，自定义等监控阈值告警通知一步到位。

易用友好，无需 Agent，全 WEB 页面操作，鼠标点一点就能监控告警，零上手学习成本。

将 Http, Jmx, Ssh, Snmp, Jdbc, Prometheus 等协议规范可配置化，只需在浏览器配置监控模版 YML 就能使用这些协议去自定义采集想要的指标。您相信只需配置下就能立刻适配一款 K8s 或 Docker 等新的监控类型吗？

兼容 Prometheus 的系统生态并且更多，只需页面操作就可以监控 Prometheus 所能监控的。

高性能，支持多采集器集群横向扩展，支持多隔离网络监控，云边协同。

自由的告警阈值规则，邮件 Discord Slack Telegram 钉钉 微信 飞书 短信 Webhook Server酱 等方式消息及时送达。

HertzBeat的强大自定义，多类型支持，高性能，易扩展，低耦合，希望能帮助用户快速搭建自有监控系统。

当然我们也提供了对应的 SAAS版本监控云服务，中小团队和个人无需再为监控自有资源而去部署一套监控系统，登录即可免费开始。

## 内置监控类型

一款监控类型对应一个YML监控模版

Website, Port Telnet, Http Api, Ping Connect, Jvm, SiteMap, Ssl Certificate, SpringBoot2, FTP Server, SpringBoot3

Mysql, PostgreSQL, MariaDB, Redis, ElasticSearch, SqlServer, Oracle, MongoDB, DM, OpenGauss, ClickHouse, IoTDB, Redis Cluster, Redis Sentinel

Linux, Ubuntu, CentOS, Windows, EulerOS

Tomcat, Nacos, Zookeeper, RabbitMQ, Flink, Kafka, ShenYu, DynamicTp, Jetty, ActiveMQ

Kubernetes, Docker

CiscoSwitch, HpeSwitch, HuaweiSwitch, TpLinkSwitch, H3cSwitch

和更多自定义监控模版。

通知支持 Discord Slack Telegram 邮件 钉钉 微信 飞书 短信 Webhook。

# 强大自定义功能

由前面的监控模版介绍，大概清楚了 HertzBeat 拥有的强大自定义功能。

我们将每个监控类型都视为一个监控模版，不管是官方内置的还是后期用户自定义新增的。用户都可以方便的通过修改监控模版来新增修改删除监控指标。

模版里面包含各个协议的使用，指标别名转换，指标计算，单位转换等一系列功能，帮助用户能采集到自己想要的监控指标。

![强大自定义功能](https://hertzbeat.dromara.org/zh-cn/assets/images/custom-arch-5a20603851a4ab356391ffcc75a743e9.png)

# 无需 Agent

对于使用过各种系统的用户来说，可能最麻烦头大的不过就是各种 agent 的安装部署调试了。

每台主机得装个 agent，为了监控不同应用中间件可能还得装几个对应的 agent，量上来了轻轻松松上千个，写个批量脚本可能会减轻点负担。

agent 的版本是否与主应用兼容, agent 与主应用的通讯调试, agent 的同步升级等等等等，这些全是头大的点。

**HertzBeat 的原理就是使用不同的协议去直连对端系统，采集 PULL 的形式去拉取采集数据，无需用户在对端主机上部署安装 Agent | Exporter等。**

比如监控 linux, 在 HertzBeat 端输入IP端口账户密码或密钥即可。

比如监控 mysql, 在 HertzBeat 端输入IP端口账户密码即可。

密码等敏感信息全链路加密

# 高性能集群

支持部署采集器集群，多采集器集群横向扩展，指数级提高可监控数量与采集性能。

监控任务在采集器集群中自调度，单采集器挂掉无感知故障迁移采集任务，新加入采集器节点自动调度分担采集压力。

单机模式与集群模式相互切换部署非常方便，无需额外组件部署。

![高性能集群](https://hertzbeat.dromara.org/zh-cn/assets/images/cluster-arch-d829b210ab749a048ff6bedef09260b9.png)

# 云边协同

支持部署边缘采集器集群，与主 HertzBeat 服务云边协同提升采集能力。

在多个网络不相通的隔离网络中，在以往的方案中我们需要在每个网络都部署一套监控系统，这导致数据不互通，管理部署维护都不方便。

HertzBeat 提供云边协同能力，可以在多个隔离网络部署边缘采集器，采集器在隔离网络内部进行监控任务采集，采集数据上报，由主 HertzBeat 服务统一调度管理展示。

# 易用友好

集 监控+告警+通知 All in one, 无需单独部署多个组件服务。

全UI界面操作，不管是新增监控，修改监控模版，还是告警阈值通知，都可在WEB界面操作完成，无需要修改文件或脚本或重启。
无需 Agent, 监控对端我们只需在WEB界面填写所需IP端口账户密码等参数即可。

自定义友好，只需一个监控模版YML，自动生成对应监控类型的监控管理页面，数据图表页面，阈值配置等。

阈值告警通知友好，基于表达式阈值配置，多种告警通知渠道，支持告警静默，时段标签告警级别过滤等。

# 即刻体验一波

Docker 环境下运行一条命令即可：

```
docker run -d -p 1157:1157 -p 1158:1158 --name hertzbeat tancloud/hertzbeat
```

浏览器访问 http://localhost:1157 默认账户密码 admin/hertzbeat

## 登陆页面

HertzBeat 的用户管理统一由配置文件 sureness.yml 维护，用户可以通过修改此文件来新增删除修改用户信息，用户角色权限等。

默认账户密码 admin/hertzbeat

## 概览页面

全局概览页面，分类展示了当前监控大类别数量分布，用户可直观查看当前的监控类型与数量并点击跳转至对应监控类型进行维护管理。

展示当前注册的采集器集群状态，包括采集器的上线状态，监控任务，启动时间，IP地址，名称等。

下发展示了最近告警信息列表，告警级别分布情况，告警处理率情况。

## 监控中心

监控入口，支持对应用服务，数据库，操作系统，中间件，网络，自定义等监控的管理。

以列表的形式展示当前已添加的监控，支持对监控的新增，修改，删除，取消监控，导入导出，批量管理等。

支持标签分组，查询过滤，查看监控详情入口等。

内置支持的监控类型包括：

Website, Port Telnet, Http Api, Ping Connect, Jvm, SiteMap, Ssl Certificate, SpringBoot2, FTP Server, SpringBoot3
Mysql, PostgreSQL, MariaDB, Redis, ElasticSearch, SqlServer, Oracle, MongoDB, DM, OpenGauss, ClickHouse, IoTDB, Redis Cluster, Redis Sentinel
Linux, Ubuntu, CentOS, Windows, EulerOS, Fedora CoreOS, OpenSUSE, Rocky Linux, Red Hat, FreeBSD, AlmaLinux, Debian Linux
Tomcat, Nacos, Zookeeper, RabbitMQ, Flink, Kafka, ShenYu, DynamicTp, Jetty, ActiveMQ
Kubernetes, Docker
CiscoSwitch, HpeSwitch, HuaweiSwitch, TpLinkSwitch, H3cSwitch


## 新增修改监控

新增或修改指定监控类型的监控实例，配置对端监控的IP，端口等参数，设置采集周期，采集任务调度方式，支持提前探测可用性等。

页面上配置的监控参数由对应监控类型的监控模版所定义，用户可以通过修改监控模版来修改页面配置参数。

支持关联标签，用标签来管理监控分组，告警匹配等。

## 监控详情

监控的数据详情页面，展示了当前监控的基本参数信息，监控指标数据信息。

监控实时数据报告，以小卡片列表的形式展示了当前监控的所有指标实时值，用户可根据实时值参考配置告警阈值规则。

监控历史数据报告，以趋势图表的形式展示了当前监控数值类型的指标的历史值，支持查询小时，天，月的历史数据，支持配置页面刷新时间。

⚠️注意监控历史图表需配置外置时序数据库才能获取完整功能，时序数据库支持: IOTDB, TDengine, InfluxDB, GreptimeDB

## 告警中心

已触发告警消息的管理展示页面，使用户有直观的展示当前告警情况。

支持告警处理，告警标记未处理，告警删除清空等批量操作。

## 阈值规则

对于监控的可用性状态设置阈值规则，特定指标的值超过我们预期范围时发出告警，这些都可以在阈值规则这里配置。

告警级别分为三级：通知告警，严重告警，紧急告警。

阈值规则支持可视化页面配置或表达式规则配置，灵活性更高。

支持配置触发次数，告警级别，通知模版，关联指定监控等。

## 告警收敛

当通过阈值规则判断触发告警后，会进入到告警收敛，告警收敛会根据规则对特定时间段的重复告警消息去重收敛，已避免大量重复性告警导致接收人告警麻木。

告警收敛规则支持重复告警生效时间段，标签匹配和告警级别匹配过滤。

## 告警静默

当通过阈值规则判断触发告警后，会进入到告警静默，告警静默会根据规则对特定一次性时间段或周期性时候段的告警消息屏蔽静默，此时间段不发送告警消息。

此应用场景如用户在系统维护中，无需发已知告警。用户在工作日时间才会接收告警消息，用户在晚上需避免打扰等。

告警静默规则支持一次性时间段或周期性时间段，支持标签匹配和告警级别匹配。

## 消息通知

消息通知功能是把告警消息通过不同媒体渠道通知给指定的接收人，告警消息及时触达。

功能包含接收人信息管理和通知策略管理，接收人管理维护接收人信息以其通知方式信息，通知策略管理维护把哪些告警信息通知给哪些接收人的策略规则。

通知方式支持 邮件 Discord Slack Telegram 钉钉 微信 飞书 短信 Webhook 等方式。

通知策略支持标签匹配和告警级别匹配，方便的使不同标签的告警和告警级别分派给不同的接收处理人。

## 监控模版

HertzBeat 将 Http, Jmx, Ssh, Snmp, Jdbc, Prometheus 等协议规范可配置化，只需在浏览器配置监控模版 YML 就能使用这些协议去自定义采集想要的指标。您相信只需配置下就能立刻适配一款 K8s 或 Docker 等新的监控类型吗？

同理我们内置的所有监控类型(mysql,website,jvm,k8s)也一一映射为对应的监控模版，用户可以新增修改监控模版来自定义监控功能。


# 参考资料

https://github.com/dromara/hertzbeat/blob/master/README_CN.md

* any list
{:toc}