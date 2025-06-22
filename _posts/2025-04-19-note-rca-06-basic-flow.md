---
layout: post
title: RCA 根因分析推断-06-alarm 基本的分析流程
date: 2025-4-19 14:31:52 +0800
categories: [Note]
tags: [note, rca, sh]
published: true
---

# 思路

## 场景

我们需要分析报警，但是资源信息等很多，所以需要分级+剪枝过滤

## 基本的步骤

1）从 alarm==>app

从报警关联到所有的 app

2) 从 alarm 找到所有的关联报警的资源

app

phy / vm / redis / mysql / pod / ...

包括网络：

vm / phy ====> nginx

3) app 的进一步关联资源

app----> 上面的关联资源

app----> 应用之间的调用 Trace

4) 资源本身的物理机 / vm

进一步，从 i_app i_redis i_database i_nginx 等出发，看对应的 phy / vm


## 过滤的核心

找到资源之间的关系  看有异常的节点

根据权重排序，找到根因




# 参考资料


* any list
{:toc}