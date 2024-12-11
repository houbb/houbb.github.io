---
layout: post
title: grafana stack loki-01-overview Loki like Prometheus, but for logs.
date:  2021-06-20 16:52:15 +0800
categories: [APM]
tags: [apm, grafana]
published: true
---

# Loki：像 Prometheus，但用于日志

Loki 是一个水平可扩展、高可用的多租户日志聚合系统，灵感来源于 [Prometheus](https://prometheus.io/)。  
它的设计目标是具有较高的性价比且易于操作。  
它不对日志内容进行索引，而是对每个日志流的标签集合进行索引。

与其他日志聚合系统相比，Loki：

- 不对日志进行全文索引。通过存储压缩的、非结构化的日志并仅索引元数据，Loki 更容易操作，运行成本也较低。
- 使用与 Prometheus 中相同的标签来索引和分组日志流，使您能够无缝地在指标和日志之间切换，且无需更改已经在 Prometheus 中使用的标签。
- 特别适合存储 [Kubernetes](https://kubernetes.io/) Pod 日志。诸如 Pod 标签等元数据会被自动抓取并进行索引。
- 在 Grafana 中原生支持（需要 Grafana v6.0）。

基于 Loki 的日志栈由三个组件组成：

- `promtail` 是代理，负责收集日志并将其发送到 Loki。
- `loki` 是主服务器，负责存储日志和处理查询。
- [Grafana](https://github.com/grafana/grafana) 用于查询和显示日志。

**注意，Promtail 被认为已完成特性开发，未来的日志收集开发将在 [Grafana Alloy](https://github.com/grafana/alloy) 中进行**

Loki 像 Prometheus，但用于日志：我们更倾向于使用基于多维标签的方法进行索引，并且希望拥有一个单一的二进制文件，易于操作且没有依赖。  
Loki 与 Prometheus 的不同之处在于，它专注于日志而非指标，并且通过推送方式传递日志，而非拉取方式。

## 入门

* [安装 Loki](https://grafana.com/docs/loki/latest/installation/)
* [安装 Promtail](https://grafana.com/docs/loki/latest/clients/promtail/installation/)
* [入门指南](https://grafana.com/docs/loki/latest/get-started/)

## 升级

* [升级 Loki](https://grafana.com/docs/loki/latest/upgrading/)

## 文档

* [最新版本](https://grafana.com/docs/loki/latest/)
* [即将发布的版本](https://grafana.com/docs/loki/next/)，位于主分支的最新版本

常用部分：

- [API 文档](https://grafana.com/docs/loki/latest/api/) 用于将日志导入 Loki。
- [标签](https://grafana.com/docs/loki/latest/getting-started/labels/)
- [操作](https://grafana.com/docs/loki/latest/operations/)
- [Promtail](https://grafana.com/docs/loki/latest/clients/promtail/) 是一个代理，用于跟踪日志文件并将其推送到 Loki。
- [管道](https://grafana.com/docs/loki/latest/clients/promtail/pipelines/) 介绍了日志处理管道。
- [Docker 驱动程序客户端](https://grafana.com/docs/loki/latest/clients/docker-driver/) 是一个 Docker 插件，用于直接从 Docker 容器将日志发送到 Loki。
- [LogCLI](https://grafana.com/docs/loki/latest/query/logcli/) 提供了一个命令行接口来查询日志。
- [Loki Canary](https://grafana.com/docs/loki/latest/operations/loki-canary/) 用于监控 Loki 安装是否丢失日志。
- [故障排除](https://grafana.com/docs/loki/latest/operations/troubleshooting/) 提供了解决错误消息的帮助。
- [Grafana 中的 Loki](https://grafana.com/docs/loki/latest/operations/grafana/) 介绍了如何在 Grafana 中设置 Loki 数据源。

## 获取帮助

如果您有任何关于 Loki 的问题或反馈：

- 在 Grafana Labs 社区论坛中搜索关于 Loki 的现有讨论：[https://community.grafana.com](https://community.grafana.com/c/grafana-loki/)
- 在 Loki Slack 频道上提问。若要邀请自己加入 Grafana Slack，请访问 [https://slack.grafana.com/](https://slack.grafana.com/) 并加入 #loki 频道。
- [提交问题](https://github.com/grafana/loki/issues/new) 报告错误、问题和功能建议。
- 发送电子邮件至 [lokiproject@googlegroups.com](mailto:lokiproject@googlegroups.com)，或使用 [Web 界面](https://groups.google.com/forum/#!forum/lokiproject)。
- UI 问题请直接在 [Grafana](https://github.com/grafana/grafana/issues/new) 提交。

我们欢迎您的反馈。

## 进一步阅读

- 原始的 [设计文档](https://docs.google.com/document/d/11tjK_lvp1-SVsFZjgOTr1vV3-q6vBAsZYIQ5ZeYBkyM/view) 是讨论动机和设计决策的一个好来源。
- Callum Styan 2019 年 3 月 DevOpsDays Vancouver 演讲 "[Grafana Loki: Log Aggregation for Incident Investigations][devopsdays19-talk]"。
- Grafana Labs 博客文章 "[How We Designed Loki to Work Easily Both as Microservices and as Monoliths][architecture-blog]"。
- Tom Wilkie 2019 年早期 CNCF Paris/FOSDEM 演讲 "[Grafana Loki: like Prometheus, but for logs][fosdem19-talk]" ([幻灯片][fosdem19-slides], [视频][fosdem19-video])。
- David Kaltschmidt 2018 年 KubeCon 演讲 "[On the OSS Path to Full Observability with Grafana][kccna18-event]" ([幻灯片][kccna18-slides], [视频][kccna18-video]) 讲解了 Loki 如何适应云原生环境。
- Goutham Veeramachaneni 的博客文章 "[Loki: Prometheus-inspired, open source logging for cloud natives](https://grafana.com/blog/2018/12/12/loki-prometheus-inspired-open-source-logging-for-cloud-natives/)" 详细介绍了 Loki 的架构。
- David Kaltschmidt 的博客文章 "[Closer look at Grafana's user interface for Loki](https://grafana.com/blog/2019/01/02/closer-look-at-grafanas-user-interface-for-loki/)" 讲解了 Grafana 的日志界面设计理念。

[devopsdays19-talk]: https://grafana.com/blog/2019/05/06/how-loki-correlates-metrics-and-logs--and-saves-you-money/
[architecture-blog]: https://grafana.com/blog/2019/04/15/how-we-designed-loki-to-work-easily-both-as-microservices-and-as-monoliths/
[fosdem19-talk]: https://fosdem.org/2019/schedule/event/loki_prometheus_for_logs/
[fosdem19-slides]: https://speakerdeck.com/grafana/grafana-loki-like-prometheus-but-for-logs
[fosdem19-video]: https://mirror.as35701.net/video.fosdem.org/2019/UB2.252A/loki_prometheus_for_logs.mp4
[kccna18-event]: https://kccna18.sched.com/event/GrXC/on-the-oss-path-to-full-observability-with-grafana-david-kaltschmidt-grafana-labs
[kccna18-slides]: https://speakerdeck.com/davkal/on-the-path-to-full-observability-with-oss-and-launch-of-loki
[kccna18-video]: https://www.youtube.com/watch?v=U7C5SpRtK74&list=PLj6h78yzYM2PZf9eA7bhWnIh_mK1vyOfU&index=346

## 贡献

请参考 [CONTRIBUTING.md](CONTRIBUTING.md)

### 从源代码构建

Loki 可以在单个主机、无依赖模式下运行，使用以下命令：

您需要安装 `go`，

推荐使用 [我们的构建 Dockerfile](https://github.com/grafana/loki/blob/main/loki-build-image/Dockerfile) 中的版本。

```bash
$ go get github.com/grafana/loki
$ cd $GOPATH/src/github.com/grafana/loki # 默认情况下 GOPATH 为 $HOME/go

$ go build ./cmd/loki
$ ./loki -config.file=./cmd/loki/loki-local-config.yaml
...
```

要在非 Linux 平台上构建 Promtail，使用以下命令：

```bash
$ go build ./clients/cmd/promtail
```

在 Linux 上，如果启用了 Journal 支持，Promtail 需要安装 systemd 头文件。  
要启用 Journal 支持，应该使用 Go 构建标志 `promtail_journal_enabled`。

在 Ubuntu 上启用 Journal 支持，运行以下命令：

```bash
$ sudo apt install -y libsystemd-dev
$ go build --tags=promtail_journal_enabled ./clients/cmd/promtail
```

在 CentOS 上启用 Journal 支持，运行以下命令：

```bash
$ sudo yum install -y systemd-devel
$ go build --tags=promtail_journal_enabled ./clients/cmd/promtail
```

否则，要在没有 Journal 支持的情况下构建 Promtail，运行 `go build` 并禁用 CGO：

```bash
$ CGO_ENABLED=0 go build ./clients/cmd/promtail
```

## 采用者

请参阅 [ADOPTERS.md](ADOPTERS.md) 了解当前使用 Loki 的一些组织。  
如果您希望将您的组织添加到此列表，请打开 PR 将其添加。

## 许可证

Grafana Loki 采用 [AGPL-3.0-only](LICENSE) 许可证发布。如需了解 Apache-2.0 的例外，请参阅 [LICENSING.md](LICENSING.md)。

# 参考资料

chat

https://github.com/grafana/loki


* any list
{:toc}