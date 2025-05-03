---
layout: post
title: 监控报警系统-13-报警中心系统设计实战接口定义
date:  2021-06-20 16:52:15 +0800
categories: [APM]
tags: [apm, system-design, alarm-center]
published: true
---

# 前言

## 说明

好的接口设计，不要有任何的歧义。

用户送的尽可能的少。

保证安全性、拓展性。方便问题的排查等等。

# 安全性

所有的系统，必须有对应的申请记录。方能调用，不然后续会非常乱。

## 系统的申请

appKey
appSecret

这个一般可以和审批系统结合，或者初期管理员人工添加。

频率不高，但是比较重要。

## 鉴权

提供对应的 client 包，初期可以实现 java 等。

启动启动时，做一次统一的鉴权。

返回 token，后续根据 token 鉴权。

## 验签

可以考虑添加 checksum，保证安全性。

优先级较低。

# 接口

## 核心能力

核心接口：

1） 报警的核心接口

2） 查询报警状态的接口

其他的很多接口不那么重要。

## 报警接口

核心字段

```
token 令牌
traceId 跟踪号
requestTime 时间
requestSystem 请求系统（可选？）

outAlarmId 外部报警标识
type 报警类型
eventId 事件标识
title 标题
content 内容
ip IP
appName 应用
time 时间
status 状态
level 级别
value 报警值
dataMap 数据信息
extraMap 附加属性
remark 报警备注
receiverList=[{ 
    收件人信息
type: "", value: ""    
}]
```

## 查询接口

```
token 令牌
traceId 跟踪号
requestTime 时间
requestSystem 请求系统（可选？）

outAlarmId 外部报警标识
```

# 参考资料




* any list
{:toc}