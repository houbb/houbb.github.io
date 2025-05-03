---
layout: post
title: 监控报警系统-15-报警中心系统设计实战之实时链路实现
date:  2021-06-20 16:52:15 +0800
categories: [APM]
tags: [apm, system-design, alarm-center]
published: true
---


# 系统拓扑

alarm-admin===>控台

alarm-executor===>核心实现====》goutong-center（依赖渠道中心）

==> cmdb 等基础数据信息

# 说明

做一下简单的核心实现。

# 申请系统表

## 说明

记录申请的系统表，以及对应的接口能力。

## 实现


接口可以选择是否控制，一般也可以不控制这么细致。

# 报警信息

## 核心表



## 事件表


# 收件人

初期可以简单些，直接根据用户传入的为准。

后续可以拓展。

## 类型

email 邮箱

phone 收集

userId 用户标识

userGroup 用户组标识

## 实现



# 实际通知+渠道

## 说明


## 实现



# 屏蔽

## 说明

针对各种条件的处理

## 实现



https://github.com/houbb/match

https://github.com/houbb/expression-integration

# 后置处理动作

## 说明

针对报警的后续操作处理

## 实现


# 处理闭环（优先级较低）

## 说明

相关的处理动作

记录对应的日志+审计

## 实现

控台实现，优先级不高

# 聚合、收敛

todo...

# 通知模板

todo...


# 参考资料




* any list
{:toc}
