---
layout: post
title: SMS 短信发送梳理 
date: 2022-03-18 21:01:55 +0800 
categories: [TOOL]
tags: [tool, sh]
published: true
---

# 整体需求

短信发送是一个非常常见的功能。

比如：

（1）注册

（2）修改密码/忘记密码/登录

（3）交易等敏感操作验证

（4）其他验证

# 个人规划

## 邮箱

邮箱的验证。

这个优点是比较省钱，缺点是无法直接获取注册人的身份信息。

## 短信

（1）sms-core  核心发送服务

sms-api 接口定义

sms-core 核心实现

对 sms 进行重构。

（2）sms-server 发送微服务

包含发送记录+状态

消息模板-功能模板划分。

子系统划分。

子系统的管理

常见的渠道对接

计费统计：便于优化通道成本

（3）新的平台

作为 sms 的服务，对外开放。


# 开源工具

## 短信发送

[设备管理器+发送短信](https://github.com/Javen205/DeviceMange)

[短信群发，支持单卡/双卡，发送短信，Excel导入](https://github.com/GHBlade/Msgs)

[消息系统（短信，推送，邮件）等统一发送管理](https://github.com/xushaomin/apple-message)

[消息推送平台📝 推送下发【邮件】【短信】【微信服务号】【微信小程序】【企业微信】【钉钉】等消息类型。所使用的技术栈包括：SpringBoot、SpringDataJPA、MySQL、Docker、docker-compose、Kafka、Redis、Apollo、prometheus、Grafana、GrayLog、Flink、Xxl-job、Echarts等等](https://github.com/ZhongFuCheng3y/austin)

[短信发送平台-任务调度+SpringSecurity+Netty+多平台接入+CMPP](https://github.com/BrightStarry/SMS-Sender)

[通过微信、短信发送告警信息](https://github.com/wangyuheng/pharos)

[将手机接收到的短信以邮件的形式发送至指定邮箱](https://github.com/jiang111/ReSend-SMS)

[智能快速拨号，联系人APP，查看通话记录，查看联系人，打电话，发送短信……](https://github.com/NashLegend/QuicKid)

这个写的还行：

[基于SMGP3.4协议、CMPP协议的短信发送框架](https://github.com/otary/sms-integration)

比较成熟的原理：

[这是一个在netty4框架下实现的三网合一短信网关核心框架，支持(cmpp/smpp3.4/sgip1.2/smgp3) 短信协议解析，支持长短信合并和拆分，也支持wap短信和闪信。](https://github.com/Lihuanghe/SMSGate)

[短信转发器——监控Android手机短信、来电、APP通知，并根据指定规则转发到其他手机：钉钉机器人、企业微信群机器人、飞书机器人、企业微信应用消息、邮箱、bark、webhook、Telegram机器人、Server酱、PushPlus、手机短信等。PS.这个APK主要是学习与自用，如有BUG请提ISSUE，同时欢迎大家提PR指正](https://github.com/pppscn/SmsForwarder)

[云通讯、国际短信、短信API、短信SDK，短信平台，短信验证码，短信接口，短信源码](https://github.com/yunpian/sms)

[高可用短信微服务](https://github.com/cbwleft/sms)

[RestComm SMS Gateway (SMSC) to send/receive SMS from/to Operators Network (GSM)](https://github.com/RestComm/smscgateway)

[中国移动CMPP、联通SGIP、电信SMGP三网合一企业短信网关 (Java)](https://github.com/clonalman/SMS-China)

[短信轰炸机](https://github.com/xuwt/SMSBomb)

[SMS Sending and Receiving app (Android studio + MySQL + PHP)](https://github.com/anajetli/SMSGateway)

* any list
{:toc}