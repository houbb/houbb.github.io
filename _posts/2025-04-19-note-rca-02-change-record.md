---
layout: post
title: RCA 根因分析推断-02-变更事件笔记 appChangeRecord
date: 2025-4-19 14:31:52 +0800
categories: [Note]
tags: [note, rca, sh]
published: true
---


# 变更事件

## 说明

如果一个变更，可能会导致对应的异常。

## 标准化

首先要对报警的数据进行标准的格式化处理。

比如应用名，执行时间等等

## 变更的内容

ip + appName


# 时间范围

## 如果页面选择了一个时间范围

比如：18:00~18:30

那么，对应的变更事件应该怎么办呢？

1）create_time

事件的创建时间刚好介于 18:00~18:30

16:00 and 18:30 

都是这样来处理是不是比较合理？

2) 开始+没结束

可以把开始时间往前提 2H

比如 executeStartTime between 16:00 and 18:30 AND execute_END_TIME is null

3) 开始+结束

往前一段时间可以吗？

executeStartTime between 16:00 and 18:30 

AND execute_END_TIME between 16:00 and 18:30 

这样可能更加直观，简单一些？？



## 数量

这样可能不太准确，可以验证一下。


# 现状

特别精确的时间范围控制，会导致无法准确的命中。



# 参考资料


* any list
{:toc}