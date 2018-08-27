---
layout: post
title:  CFETS Biz Note 20180827
date:  2018-08-27 09:37:32 +0800
categories: [Biz]
tags: [biz, cfets, note, sh]
published: true
---


# Client & API

client（前台交易机） api 这两种权限的切换。

- client 端操作的记录

客户端参考编号不符合正常的 clOrdId 标识。

ps: 都可以进行修改，调整用户的权限。


# 页面的设计

新增、修改只需要使用相同的页面即可。


# 方向

量化、风控、程序化交易

# 冒烟测试

意义

# 流程

页面枚举=》数据库的枚举信息=》tca 需要的值=》tca

## mock

如何 mock 掉外部的服务

# 测试

## junit5

## junitNG

# 前端

## axios

类似于 ajax 的前后端请求。

# imix 协议

quick-fix 协议

# 开发的循序渐进性

## 回调

## mq

## 查询接口

# 异步转同步

不需要什么都存储在数据库中。

## async-sync

实现方式：

- CountDownLatch

- redis.key + 轮训

- spring 事件机制 + 轮训

# 主从机构

## 概念

## 影响

## 区分

本方、关联方

我方发起还是接收？

参考恒生接口。

# DateUtil

线程安全 + 性能？

# 学习的方式

- 知道是什么？

- 开始使用

- 边用边学

- 系统回顾

- 反馈实战

# splitter

splitter => | | => 

三层分发。

## 新技术

ai

bigdata

cloud

block-chain

# 业务

## 恒生 032

优秀=》标准

## 转托管

银行间=》交易所

# 重试

spring-retry

guava-retry



* any list
{:toc}