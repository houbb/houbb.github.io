---
layout: post
title: 开源的数据可视化平台 Kibana 日志可视化 mac 安装笔记
date:  2016-10-16 09:07:21 +0800
categories: [Log]
tags: [kibana, log, search]
published: true
---

# 拓展阅读

[日志开源组件（一）java 注解结合 spring aop 实现自动输出日志](https://houbb.github.io/2023/08/06/auto-log-01-overview)

[日志开源组件（二）java 注解结合 spring aop 实现日志traceId唯一标识](https://houbb.github.io/2023/08/06/auto-log-02-trace-id)

[日志开源组件（三）java 注解结合 spring aop 自动输出日志新增拦截器与过滤器](https://houbb.github.io/2023/08/06/auto-log-03-filter)

[日志开源组件（四）如何动态修改 spring aop 切面信息？让自动日志输出框架更好用](https://houbb.github.io/2023/08/06/auto-log-04-dynamic-aop)

[日志开源组件（五）如何将 dubbo filter 拦截器原理运用到日志拦截器中？](https://houbb.github.io/2023/08/06/auto-log-05-dubbo-interceptor)

[日志开源组件（六）Adaptive Sampling 自适应采样](https://mp.weixin.qq.com/s/9JH3WfR6Y474LCbY2mZxZQ)

[高性能日志脱敏组件（一）java 日志脱敏框架 sensitive，优雅的打印脱敏日志](https://mp.weixin.qq.com/s/xzQNDF7s705iurk7N0uheQ)

[高性能日志脱敏组件（二）金融用户敏感数据如何优雅地实现脱敏？](https://mp.weixin.qq.com/s/ljChFiNLzV6GLaUDjehA0Q)

[高性能日志脱敏组件（三）日志脱敏之后，无法根据信息快速定位怎么办？](https://mp.weixin.qq.com/s/tZqOH_8QTKrD1oaclNoewg)

[高性能日志脱敏组件（四）基于 log4j2 插件实现统一日志脱敏，性能远超正则替换](https://mp.weixin.qq.com/s/ZlWRqT7S92aXFuy-l9Uh3Q)

[高性能日志脱敏组件（五）已支持 log4j2 和 logback 插件](https://mp.weixin.qq.com/s/3ARK6PW7pyUhAbO2ctnndg)

# Kibana

Kibana 是一个开源的数据可视化平台，允许您通过令人惊叹和强大的图形与数据进行交互，这些图形可以组合成自定义的仪表板，帮助您从数据中分享洞见。

> [Kibana](https://www.elastic.co/products/kibana)

> [用户指南](https://www.elastic.co/guide/en/kibana/current/index.html)

> [中文博客](http://www.cnblogs.com/hanyifeng/p/5857875.html)

# 在 Mac 上安装

## 下载

[下载](https://www.elastic.co/downloads/kibana) 并解压缩它

```
$   tar -zxf kibana-4.6.1-darwin-x86_64.tar.gz
```

将其移动到工具包中

```
mv kibana-4.6.1-darwin-x86_64 ~/it/tools/kibana
```

注意: Kibana 4.6.x 需要 [Elasticsearch](https://www.elastic.co/products/elasticsearch) 2.4.x

## 配置

编辑 ```config/kibana.yml```，将 ```elasticsearch.url``` 设置为您的 Elasticsearch 实例

```
# 用于所有查询的 Elasticsearch 实例。
elasticsearch.url: "http://localhost:9200"
```

## 运行

运行 ```/bin/kibana```

```
houbinbindeMacBook-Pro:bin houbinbin$ ./kibana
  log   [09:44:48.294] [info][status][plugin:kibana@1.0.0] 状态从未初始化更改为绿色 - 已准备就绪
  log   [09:44:48.320] [info][status][plugin:elasticsearch@1.0.0] 状态从未初始化更改为黄色 - 等待 Elasticsearch
  log   [09:44:48.348] [info][status][plugin:kbn_vislib_vis_types@1.0.0] 状态从未初始化更改为绿色 - 已准备就绪
  log   [09:44:48.351] [info][status][plugin:markdown_vis@1.0.0] 状态从未初始化更改为绿色 - 已准备就绪
  log   [09:44:48.354] [info][status][plugin:metric_vis@1.0.0] 状态从未初始化更改为绿色 - 已准备就绪
  log   [09:44:48.359] [info][status][plugin:spyModes@1.0.0] 状态从未初始化更改为绿色 - 已准备就绪
  log   [09:44:48.369] [info][status][plugin:statusPage@1.0.0] 状态从未初始化更改为绿色 - 已准备就绪
  log   [09:44:48.372] [info][status][plugin:table_vis@1.0.0] 状态从未初始化更改为绿色 - 已准备就绪
  log   [09:44:48.386] [info][listening] 服务器正在运行，地址为 http://0.0.0.0:5601
  log   [09:44:53.402] [info][status][plugin:elasticsearch@1.0.0] 状态从黄色更改为黄色 - 找不到现有的 Kibana 索引
  log   [09:44:56.305] [info][status][plugin:elasticsearch@1.0.0] 状态从黄色更改为绿色 - Kibana 索引就绪
```

## 访问

在浏览器中输入 [localhost:5601](localhost:5601)，您可以看到 kibana 首页。

* any list
{:toc}