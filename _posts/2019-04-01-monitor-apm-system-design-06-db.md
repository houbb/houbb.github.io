---
layout: post
title: 监控报警系统处理流程-06-database 数据库设计
date:  2021-06-20 16:52:15 +0800
categories: [APM]
tags: [apm, system-design]
published: true
---

# 组件

apache calcite 作为统一的组件

连接池

执行计划

执行成本

# 数据源

数据源管理：cmdb



# 数据库

jdbcUrl/username/password/drivername

password 数据库的密码管理，可以参考 druid

# 查询

orm

linq

mybatis


# 报警服务

基础指标==》VM 指标数据库

规则驱动==》规则引擎

报警中心

# 规则引擎的设计

核心的条件引擎

页面的设计？？

# 基础信息

cat 数据

日志

数据库

普米主机

# 报警中心

静默

抑制

限流

合并

升级：个人=》组=》值班==》

处理：事件+复盘

治理+规范

分级别：高级别实时+低级别聚合。

## 拓展邮件

拓展邮件的能力，把邮件当做报警的信息来处理。

## 渠道

im

sms

email

phone

# 核心的信息

离散度

异常堆栈

基本的日志

相关的变更

# 参考资料

https://forum.huawei.com/enterprise/zh/thread/580933924354408448



* any list
{:toc}