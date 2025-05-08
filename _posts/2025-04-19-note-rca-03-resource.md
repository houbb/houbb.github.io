---
layout: post
title: RCA 根因分析推断-03-变更事件的内因+依赖资源的异常
date: 2025-4-19 14:31:52 +0800
categories: [Note]
tags: [note, rca, sh]
published: true
---


# 变更事件

## 说明

要考虑哪些异常的内因呢？

同时考虑一些依赖资源的异常。

# 现状

特别精确的时间范围控制，会导致无法准确的命中。

# 内因

磁盘 一般 A2 以及以下可以忽略

mem 内存 A2 以及以下可以忽略?

disk ?

cpu ?

可以看一下 A2 以及以下的是不是没什么用？

GC 

服务不可用

# 依赖资源

## 公共资源

app

vm

phy

redis

mysql

schedule





# 参考资料


* any list
{:toc}