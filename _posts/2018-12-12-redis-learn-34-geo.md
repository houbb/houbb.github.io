---
layout: post
title: Redis Learn-34-GEO
date: 2018-12-12 11:35:23 +0800
categories: [Redis]
tags: [redis, cache, sh]
published: true
---


# GEO

Redis3.2版本提供了GEO（地理信息定位）功能，支持存储地理位置信息用来实现诸如附近位置、摇一摇这类依赖于地理位置信息的功能，对于需要实现这些功能的开发者来说是一大福音。

GEO功能是Redis的另一位作者Matt Stancliff借鉴NoSQL数据库Ardb实现的，Ardb的作者来自中国，它提供了优秀的GEO功能。



# 拓展阅读

[ardb](https://github.com/yinqiwen/ardb)

# 参考资料

《Redis 开发与运维》

* any list
{:toc}