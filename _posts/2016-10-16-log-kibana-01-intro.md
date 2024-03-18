---
layout: post
title: 开源的数据可视化平台 Kibana-01-intro mac 安装笔记
date:  2016-10-16 09:07:21 +0800
categories: [Log]
tags: [kibana, log, search]
published: true
---


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