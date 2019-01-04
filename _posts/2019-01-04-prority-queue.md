---
layout: post
title: 优先级队列与堆排序
date: 2019-1-4 15:24:22 +0800
categories: [Althgorim]
tags: [althgorim, sh]
published: true
excerpt: 优先级队列与堆排序
---

# 优先级队列

不同于先进先出队列，其对每一个元素指定了优先级，一般情况下，出队时，优先级越高的元素越先出队。


# 问题

## 题目

实现一个优先级队列，此队列具有enqueue（val，prior）和dequeue（）两种操作，分别代表入队和出队。

其中enqueue（val，prior）第一个参数val为值，第二个参数prior为优先级（prior越大，优先级越高），优先级越高越先出队

dequeue（）出队操作，每调用一次从队列中找到一个优先级最高的元素出队，并返回此元素的值（val）

要求：在O（logn）时间复杂度内完成两种操作

## 初步思路

最简单的思路，直接使用数组或者链表，存储数据，顺序遍历整个列表。

这种查询时间复杂度为 O(n)，也是最容器想到的。

## 进一步优化

看到 O(logn) 其实我们的第一感觉应该是**树**。

当然这个问题考察的说白了就是二叉树。






# 参考资料

[优先级队列](https://mp.weixin.qq.com/s/bDZmhx2LtXFI03vjEAPeAA)

* any list
{:toc}