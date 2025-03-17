---
layout: post
title: Trace 应用间、方法间的关系 通过 CAT 实现
date:  2023-07-25 08:00:00 +0800
categories: [Trace]
tags: [trace, distributed, sh]
published: true
---

# 整体思路

如果每一个 tid 都绘制一个图，数据比较准确。但是数据量很大。

也可以根据 CAT 这种公司已经接入的技术栈，推进通过 kafka 采样解析处理。

数据全部放在 neo4j 之类的图数据库中。

## 性能

考虑 batch 批量入库处理，unwind 解析入库。

## 应用内

可以通过代码的静态扫描获取。

流水线+gitlab 之类的代码仓库静态调用扫描。


# 调用拓扑图

```
CAT
|
采样发送到 kafka
|
logstash4j 等解析处理
|
neo4j 等落库
|
页面可视化处理
```

## tid

用来处理唯一的标识

如果需要区分不同场景，可以使用这个字段。

## 范围

初期实现，可以直处理 URL/dubbo 这种方法调用。




# 参考资料

https://github.com/alibaba/transmittable-thread-local

* any list
{:toc}