---
layout: post
title:  Codis 基于代理的 Redis 集群解决方案，支持管道和动态扩展
date:  2018-09-07 07:44:19 +0800
categories: [Cache]
tags: [cache, redis, TODO, sh]
published: true
---

# Codis

[Codis](https://github.com/CodisLabs/codis) is a proxy based high performance Redis cluster solution written in Go. 

It is production-ready and widely used at wandoujia.com and many companies.

## 使用的好处

Redis获得动态扩容/缩容的能力，增减redis实例对client完全透明、不需要重启服务，不需要业务方担心 Redis 内存爆掉的问题。 

也不用担心申请太大, 造成浪费。 业务方也不需要自己维护 Redis。

Codis支持水平扩容/缩容，扩容可以直接界面的 "Auto Rebalance" 按钮，缩容只需要将要下线的实例拥有的slot迁移到其它实例，然后在界面上删除下线的group即可。



## 项目架构

![项目架构](https://github.com/CodisLabs/codis/raw/release3.2/doc/pictures/architecture.png)

# 拓展阅读

[jodis](https://github.com/CodisLabs/jodis)

[nedis](https://github.com/CodisLabs/nedis)

# 快速开始

[快速开始](https://github.com/CodisLabs/codis/blob/release3.2/doc/tutorial_zh.md)

TODO...

# 参考资料

[codis FAQ](https://github.com/CodisLabs/codis/blob/release3.2/doc/FAQ_zh.md)

[codis 使用教程](https://github.com/CodisLabs/codis/blob/release3.2/doc/tutorial_zh.md)

[codis 入门与实战](http://lihaoquan.me/2016/10/2/codis-in-action-1-basic-demo.html)

* any list
{:toc}