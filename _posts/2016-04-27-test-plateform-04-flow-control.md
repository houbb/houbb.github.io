---
layout: post
title: test framework-04-测试平台 flow control 流程控制
date:  2016-4-26 12:53:12 +0800
categories: [Test]
tags: [junit, framework, open-source, plateform, test]
published: true
---

# 前言

测试平台最强大的一个设计应该是流程控制。

测试平台的用户群体是测试，知道一些简单的判断，但是编程能力一般。

所以我们需要设计一个流程控制的系列组件，让测试拥有近似于开发的编程能力。


# 控制流

我们可以参考 java 的关键词设计。

这里只关注一些比较重要的流程控制。

## 控制流关键字

这些关键字用于控制程序的流程：

if
else
switch
case
default
for
while
do
break
continue
return

初期可以实现最核心的：if else loop

## 异常处理关键字

try
catch
finally
throw
throws

初期可以实现最核心的：throws catch

# 并行/串行

有些任务是可以并行的，有些串行。

支持用户自定义。

loop 的时候，定义是 concurrent-loop / serial-loop

# 能力组件

拥有了基本的流程控制，接下来我们要实现的就是一些基础的组件能力。

测试其实和编程类似，我们大概需要做几件事情：

1）基础环境准备

2）请求参数构建

3）执行调用

4）结果的参数提取+断言

5) 后置动作 如报告发送/报警等

覆盖率+成功率+分析处理 可以作为内置的能力。

## 外部请求

http

rpc

mq

## 数据库操作

mysql

redis

mongodb

neo4j

es

....

## 参数构建

全局变量

环境变量

提取变量

## 数据加工

可以提取为一个单独的模块

可以对入参统一处理，也可以对出参统一处理。

对数据进行各种转换等等。

## 资源管理

文件管理 上传/机器同步

## 脚本（组）

执行各种 shell / groovy 脚本等

## 报告模块

结果可以和其他通知渠道结合：

IM

EMAIL

SMS

PHONE

# 整体流程的串联

可以通过 tree 的方式，将上面的流程串联在一起

https://element.eleme.io/#/zh-CN/component/tree


# 参考资料

https://github.com/metersphere/metersphere

* any list
{:toc}