---
layout: post
title: 交易系统设计 Jeepay 计全支付系统架构图
date: 2024-01-29 21:01:55 +0800
categories: [Design]
tags: [system-design, trade, sh]
published: true
---

# Jeepay 计全支付系统架构图

![struct](https://mmbiz.qpic.cn/mmbiz_png/hjxWRAdYLUzZ2puOPx3rgU2so8qONnMEPYw3eic8xeiacTXIKBCibiaZAOnL181hUCpYG5jJibpgCU3Rhq0haNQlIFQ/640?wx_fmt=png&from=appmsg&wxfrom=5&wx_lazy=1&wx_co=1)

## Jeepay 计全支付聚合码支付流程图

![全流程](https://mmbiz.qpic.cn/mmbiz_png/hjxWRAdYLUzZ2puOPx3rgU2so8qONnMEnicoQqyLl5UUxsKgWn1ANTBp415ibZFbWBfbfk6o8MsiaiaO63FPrpIDfA/640?wx_fmt=png&from=appmsg&wxfrom=5&wx_lazy=1&wx_co=1)

## 核心技术栈

| 软件名称            | 描述                                | 版本               |
|---------------------|-------------------------------------|--------------------|
| Jdk                 | Java 环境                           | 1.8                |
| Spring Boot         | 开发框架                             | 2.4.5              |
| Redis               | 分布式缓存                           | 3.2.8 或 高版本   |
| MySQL               | 数据库                               | 5.7.X 或 8.0 高版本 |
| MQ                  | 消息中间件                           | ActiveMQ 或 RabbitMQ 或 RocketMQ |
| Ant Design Vue      | Ant Design 的 Vue 实现，前端开发使用 | 2.1.2              |
| MyBatis-Plus        | MyBatis 增强工具                    | 3.4.2              |
| WxJava              | 微信开发 Java SDK                    | 4.1.0              |
| Hutool              | Java 工具类库                       | 5.6.6              |

## 功能模块

![功能模块](https://mmbiz.qpic.cn/mmbiz_png/hjxWRAdYLUzZ2puOPx3rgU2so8qONnMEXL2acVX2m01UToLJkjFlAOHrn6M3w1eO4JW016U7MnRFFPQTeicpnOw/640?wx_fmt=png&from=appmsg&wxfrom=5&wx_lazy=1&wx_co=1)

## Jeepay 商户系统功能

![商户系统功能](https://mmbiz.qpic.cn/mmbiz_png/hjxWRAdYLUzZ2puOPx3rgU2so8qONnMEboEVBBxEr9KVfGoZtX5Mz1TEWG58anYLGA64expO2Bhviap4hfXEheQ/640?wx_fmt=png&from=appmsg&wxfrom=5&wx_lazy=1&wx_co=1)

# 愿景

https://mp.weixin.qq.com/s/KfdOG8MssE6jpmt-YoHJBQ

* any list
{:toc}
