---
layout: post
title: 开源分布式系统追踪-03-CNCF jaeger-02-快速开始
date:  2023-07-25 08:00:00 +0800
categories: [Trace]
tags: [trace, distributed, opensource, apm, sh]
published: true
---

# 分布式跟踪系列

## CAT

[cat monitor 分布式监控 CAT-是什么？](https://houbb.github.io/2023/09/19/cat-monitor-01-overview)

[cat monitor-02-分布式监控 CAT埋点](https://houbb.github.io/2023/09/19/cat-monitor-02-event-tracking)

[cat monitor-03-深度剖析开源分布式监控CAT](https://houbb.github.io/2023/09/19/cat-monitor-03-depth)

[cat monitor-04-cat 服务端部署实战](https://houbb.github.io/2023/09/19/cat-monitor-04-server-deploy-in-action)

[cat monitor-05-cat 客户端集成实战](https://houbb.github.io/2023/09/19/cat-monitor-05-client-intergration-in-action)

[cat monitor-06-cat 消息存储](https://houbb.github.io/2023/09/19/cat-monitor-06-message-store)

## skywalking

[监控-skywalking-01-APM 监控入门介绍](https://houbb.github.io/2019/04/01/monitor-skyworking-01-overview)

[监控-skywalking-02-深入学习 skywalking 的实现原理的一些问题](https://houbb.github.io/2019/04/01/monitor-skyworking-02-chat)

[监控-skywalking-03-深入浅出介绍全链路跟踪](https://houbb.github.io/2019/04/01/monitor-skyworking-03-intro)

[监控-skywalking-04-字节码增强原理](https://houbb.github.io/2019/04/01/monitor-skyworking-04-why)

[监控-skywalking-05-in action 实战笔记](https://houbb.github.io/2019/04/01/monitor-skyworking-05-in-action)

[监控-skywalking-06-SkyWalking on the way 全链路追踪系统的建设与实践](https://houbb.github.io/2019/04/01/monitor-skyworking-06-summary)

## 其他

[开源分布式系统追踪-00-overview](https://houbb.github.io/2023/07/25/distributed-trace-opensource-00-overview)

[开源分布式系统追踪-01-Zipkin-01-入门介绍](https://houbb.github.io/2023/07/25/distributed-trace-opensource-01-zipkin-01-intro)

[开源分布式系统追踪 02-pinpoint-01-入门介绍](https://houbb.github.io/2023/07/25/distributed-trace-opensource-02-pinpoint-01-intro)

[开源分布式系统追踪-03-CNCF jaeger-01-入门介绍](https://houbb.github.io/2023/07/25/distributed-trace-opensource-03-cncf-jaeger)


# windows10 docker

```
$ docker -version
Command 'docker' not found, but can be installed with:
sudo snap install docker         # version 27.2.0, or
sudo apt  install docker.io      # version 24.0.7-0ubuntu2~22.04.1
sudo apt  install podman-docker  # version 3.4.4+ds1-1ubuntu1.22.04.2
See 'snap info docker' for additional versions.
```

执行安装

```sh
sudo snap install docker 
```

验证

```sh
$ docker --version
Docker version 27.2.0, build 3ab4256
```



# 一体化配置

运行 Jaeger 最简单的方法是通过容器启动：

```bash
sudo docker run --rm --name jaeger \
  -p 16686:16686 \
  -p 4317:4317 \
  -p 4318:4318 \
  -p 5778:5778 \
  -p 9411:9411 \
  jaegertracing/jaeger:2.1.0
```

发现下载不到，特别慢。



这将运行 Jaeger 的一体化配置（参见[架构](#)），该配置将收集器和查询组件合并在一个进程中，并使用短暂的内存存储来存储追踪数据。

您可以访问 http://localhost:16686 来访问 Jaeger UI。有关完整的端口列表，请参见[API页面](#)。

在应用程序向 Jaeger 发送追踪数据之前，必须先进行仪器化。我们推荐使用 OpenTelemetry 仪器化和 SDK。

### 🚗 HotROD 演示

HotROD（Rides on Demand）是一个示例应用程序，由多个微服务组成，演示了如何使用 OpenTelemetry 和分布式追踪。

您可以在博客文章中找到详细的教程：[Take Jaeger for a HotROD ride](#)。

通过使用这个应用程序，您可以：

- 通过数据驱动的依赖关系图发现整个系统的架构。
- 查看请求时间线和错误，理解应用程序的工作原理。
- 查找延迟和并发性不足的源头。
- 探索高度上下文化的日志。
- 使用行李传播来诊断请求间的竞争（排队）和在服务中消耗的时间。
- 使用来自 opentelemetry-contrib 的开源库，免费获取供应商中立的仪器化。

我们推荐通过 Docker Compose 一起运行 Jaeger 和 HotROD：

```bash
git clone https://github.com/jaegertracing/jaeger.git jaeger
cd jaeger/examples/hotrod
docker compose -f docker-compose-v2.yml up
# 按 Ctrl-C 退出
```

然后访问 http://localhost:8080。有关其他运行演示的方法，请参见 README 文件。

### 服务性能监控（SPM）

服务性能监控（SPM）页面有一个快速入门，展示了如何探索 Jaeger 中的这一功能。

# 参考资料

https://www.jaegertracing.io/docs/2.1/

* any list
{:toc}