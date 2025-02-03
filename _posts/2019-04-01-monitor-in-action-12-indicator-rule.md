---
layout: post
title: 监控系统实战-12-indicator 指标 + rule 规则
date: 2018-11-25 09:14:43 +0800
categories: [Devops]
tags: [devops, monitor, apm, zabbix, sh]
published: true
---

# 指标

所有的数据都可以认为是指标：sql / 日志 / prome / cat / net / ... 

## SQL 指标

basic: 业务域+应用名+名称+标签+remark

### 核心

数据源：初期可以配置，手动输入。

API: 后续可以考虑 cmdb 动态维护，比较难实现。

### 属性

调度时间：cron fixed

下次执行时间

执行时间 offset

### 预执行

提前执行，验证正确性。

耗时 开始/结束

SQL

结果

## 日志指标

完整的日志解决方案

### 日志可视化方案

日志：agent 采集

发送到 mq: 

ETL===> 核心处理逻辑 logstash

ES===> 分词

kibana===》可视化

### 核心属性

basic: 业务域+应用名+名称+标签+remark

calc: 

1) 匹配条件：黑/白

文本

regex

2) 值提取

value-extractor

json-path

aviator

value-label

3) 预验证

验证配置的效果

-----------------------

# rule 规则

## 属性

参数配置：参数 / 指标 / 查询条件

执行偏移： offset 

条件：根据条件+阈值====》level，表达式计算。

调度时间：cron fixed

通知人：谁接收 cmdb-固定指定 email/phone/sms

附加信息：通知内容 / 附加

抑制逻辑：避免报警太多 xxx 秒，最多 yyy 次

## Event（报警事件）

id status name time 

模拟==》避免配置错误

# alarm 报警

## 基本

name eventId level appName ip title content extraMap ruleId alertTime uid type env

## 闭环

关联事件

处理记录

通知列表

规则联动

## 处理

忽略

关闭

屏蔽===》规则 快捷/指定

自愈===》规则 联动作业

RCA 分析

## 可配置化

通知的内容

通知的群等

# 度量大盘

可视化大盘

datax


# CRUD

list

add

edit

remove

detail




# 参考资料


* any list
{:toc}