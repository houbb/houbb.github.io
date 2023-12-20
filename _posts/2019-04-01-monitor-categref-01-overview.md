---
layout: post
title: Categraf 致力于打造监控数据采集领域大一统的方案-01-overview
date:  2019-4-1 19:24:57 +0800
categories: [Monitor]
tags: [monitor, apm, api, sf]
published: true
---

# Categraf

Categraf 是一款 All-in-One 的开源的 telemetry 数据采集器，支持指标、日志采集；支持 Tracing 数据的收集；

支持物理机、虚拟机、交换机、容器、K8s、多种中间件/数据库的数据采集，支持混合云架构、云原生架构、多云架构。汇聚领域最佳实践，开箱即用。

![产品架构](https://flashcat.cloud/images/product/categraf/Categraf%e6%9e%b6%e6%9e%84%e5%9b%be.svg)

## 简介

Categraf 是一个监控采集 Agent，类似 Telegraf、Grafana-Agent、Datadog-Agent，希望对所有常见监控对象提供监控数据采集能力，采用 All-in-one 的设计，不但支持指标采集，也希望支持日志和调用链路的数据采集。

来自快猫研发团队，和 Open-Falcon、Nightingale 的研发是一拨人。

categraf 的代码托管在 github：https://github.com/flashcatcloud/categraf

## 对比

categraf 和 telegraf、exporters、grafana-agent、datadog-agent 等的关系是什么？

telegraf 是 influxdb 生态的产品，因为 influxdb 是支持字符串数据的，所以 telegraf 采集的很多 field 是字符串类型，另外 influxdb 的设计，允许 labels 是非稳态结构，比如 result_code 标签，有时其 value 是 0，有时其 value 是 1，在 influxdb 中都可以接受。但是上面两点，在类似 prometheus 的时序库中，处理起来就很麻烦。

prometheus 生态有各种 exporters，但是设计逻辑都是一个监控类型一个 exporter，甚至一个实例一个 exporter，生产环境可能会部署特别多的 exporters，管理起来略麻烦。

grafana-agent import 了大量 exporters 的代码，没有裁剪，没有优化，没有最佳实践在产品上的落地，有些中间件，仍然是一个 grafana-agent 一个目标实例，管理起来也很不方便。

datadog-agent确实是集大成者，但是大量代码是 python 的，整个发布包也比较大，有不少历史包袱，而且生态上是自成一派，和社区相对割裂。

categraf 确实又是一个轮子，categraf 希望：

- 支持 remote_write 写入协议，支持将数据写入 promethues、M3DB、VictoriaMetrics、InfluxDB

- 指标数据只采集数值，不采集字符串，标签维持稳态结构

- 采用 all-in-one 的设计，所有的采集工作用一个 agent 搞定，未来也可以把日志和 trace 的采集纳入 agent

- 纯 Go 代码编写，静态编译依赖少，容易分发，易于安装

- 尽可能落地最佳实践，不需要采集的数据无需采集，针对可能会对时序库造成高基数的问题在采集侧做出处理

- 常用的采集器，不但提供采集能力，还要整理出监控大盘和告警规则，用户可以直接导入使用

- 未来希望作为快猫 SaaS 产品的重要组成部分，引入快猫团队的研发力量持续迭代，当然，希望更多的公司、更多人研发人员参与共
建，做成国内最开放、最好用的采集器

# 安装

可以直接去 categraf releases 页面，下载编译好的二进制，也可自行编译，编译只需要一条命令：go build 当然，前提是机器上有 Go 环境。

如果是从老版本升级，也是建议大家查看 categraf releases 页面，每个版本改动了什么，升级时注意什么，都会在这里写清楚。

在目标机器部署，只需要 categraf 二进制、以及 conf 目录，conf 下有一个主配置文件：config.toml，定义机器名、全局采集频率、全局附加标签、remote write backend地址等；另外就是各种采集插件的配置目录，以input.打头，如果某个采集器 xx 不想启用，把 input.xx 改个其他前缀，比如 bak.input.xx，categraf 就会忽略这个采集器。

conf 目录下还提供了 categraf.service 文件样例，便于大家使用 systemd 托管 categraf。

如果对 systemd 不熟悉，建议学习一下课程：[Linux进阶知识](https://edu.51cto.com/course/31049.html)

# 测试

我们经常会需要测试某个采集器的行为，临时看一下这个采集器输出哪些监控指标，比如配置好了 conf/input.mysql/mysql.toml 想要看看采集了哪些 mysql 指标，可以执行命令：./categraf --test --inputs mysql

这个命令会去连接你配置的 mysql 实例，执行SQL收集输出，将输出的内容做格式转换，最终打印到 stdout，如果我们在 stdout 正常看到了 mysql 相关监控指标，则说明一切正常，否则就是哪里出了问题，大概率是 conf/input.mysql/mysql.toml 配置的有问题。

如果修改了某个采集器的配置，需要重启 categraf 或者给 categraf 进程发送HUP信号，发送HUP信号的命令，举例：

```
kill -HUP `pidof categraf`
```

另外，categraf 支持哪些命令行参数，可以通过 ./categraf --help 查看

# 插件说明

采集插件的代码，在代码的 inputs 目录，每个插件一个独立的目录，目录下是采集代码，以及相关的监控大盘JSON（如有）和告警规则JSON（如有），Linux相关的大盘和告警规则没有散在 cpu、mem、disk等采集器目录，而是一并放到了 system 目录下，方便使用。

插件的配置文件，放在conf目录，以input.打头，每个配置文件都有详尽的注释，如果整不明白，就直接去看 inputs 目录下的对应采集器的代码，Go 的代码非常易读，比如某个配置不知道是做什么的，去采集器代码里搜索相关配置项，很容易就可以找到答案。

# 配置说明

这里对 config.toml 的每项配置做出解释：

```ini
[global]
# 启动的时候是否在stdout中打印配置内容
print_configs = false

# 机器名，作为本机的唯一标识，会为时序数据自动附加一个 agent_hostname=$hostname 的标签
# hostname 配置如果为空，自动取本机的机器名
# hostname 配置如果不为空，就使用用户配置的内容作为hostname
# 用户配置的hostname字符串中，可以包含变量，目前支持两个变量，
# $hostname 和 $ip，如果字符串中出现这两个变量，就会自动替换
# $hostname 自动替换为本机机器名，$ip 自动替换为本机IP
# 建议大家使用 --test 做一下测试，看看输出的内容是否符合预期
hostname = ""

# 是否忽略主机名的标签，如果设置为true，时序数据中就不会自动附加agent_hostname=$hostname 的标签
omit_hostname = false

# 时序数据的时间戳使用ms还是s，默认是ms，是因为remote write协议使用ms作为时间戳的单位
precision = "ms"

# 全局采集频率，15秒采集一次
interval = 15

# 全局附加标签，一行一个，这些写的标签会自动附到时序数据上
# [global.labels]
# region = "shanghai"
# env = "localhost"

# 发给后端的时序数据，会先被扔到 categraf 内存队列里，每个采集插件一个队列
# chan_size 定义了队列最大长度
# batch 是每次从队列中取多少条，发送给后端backend
[writer_opt]
# default: 2000
batch = 2000
# channel(as queue) size
chan_size = 10000

# 后端backend配置，在toml中 [[]] 表示数组，所以可以配置多个writer
# 每个writer可以有不同的url，不同的basic auth信息
[[writers]]
url = "http://127.0.0.1:19000/prometheus/v1/write"

# Basic auth username
basic_auth_user = ""

# Basic auth password
basic_auth_pass = ""

# timeout settings, unit: ms
timeout = 5000
dial_timeout = 2500
max_idle_conns_per_host = 100
```




# 参考资料

https://flashcat.cloud/product/categraf/

* any list
{:toc}