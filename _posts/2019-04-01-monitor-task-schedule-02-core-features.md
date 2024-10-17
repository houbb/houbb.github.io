---
layout: post
title: 作业调度-02-核心特性
date:  2019-4-1 19:24:57 +0800
categories: [Monitor]
tags: [monitor, apm, api, sf]
published: true
---

# 背景

一个作业平台

## 定时任务

核心能力应该是作业的定时执行。

定时任务

## 资源的管理

对于文件的上传分发管理

## 数据源的访问

数据库  / redis / vm / mongodb 等

## 远程调用能力

shell 脚本

程序 

http / rpc / mq 等

http 可以类似于 postman

## 断言

每一步的处理，都支持结果的断言。保证每一步执行的正确性。

## 机器管理

可以 ssh 到任意的机器  做对应的事情

秘钥管理

## 安全控制

权限控制

## 脚本组

支持 shell/groovy/python 等脚本的处理

## 数据的加工

可以对入参进行处理+结果的输出



# 参考资料

https://github.com/TencentBlueKing/bk-job

https://github.com/TencentBlueKing/bk-job/blob/master/docs/overview/architecture.md

* any list
{:toc}