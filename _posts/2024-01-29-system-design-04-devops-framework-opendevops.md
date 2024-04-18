---
layout: post
title: CODO是一款为用户提供企业多混合云、一站式DevOps、自动化运维、完全开源的云管理平台、自动化运维平台
date: 2024-01-29 21:01:55 +0800
categories: [Design]
tags: [system-design, trade, sh]
published: true
---



# 是什么？

CODO是一款为用户提供企业多混合云、自动化运维、完全开源的云管理平台。

CODO前端基于Vue iview开发、为用户提供友好的操作界面，增强用户体验。

CODO后端基于Python Tornado开发，其优势为轻量、简洁清晰、异步非阻塞。

CODO开源多云管理平台为用户提供多功能：ITSM、基于RBAC权限系统、Web Terminnal登陆日志审计、录像回放、强大的作业调度系统、CMDB、监控报警系统等

同时也希望你能给我们项目一个star，为贡献者加油⛽️！为运维干杯🍻！

# Architecture

Apigateway代理前端文件

ApigateWay依赖DNS服务，需要安装Dnsmasq

微服务部署完成后，需在Apigateway进行注册

一台MySQL Master示例，不同的微服务使用单独的库

![Architecture](https://docs.opendevops.cn/architecture.png)

## 产品架构

![产品架构](https://img.opendevops.cn/framework.png)

## 为什么选择CoDo?

权限系统
用户权限基于RBAC角色管理访问控制，用户登陆鉴权，支持开启用户MFA认证

跳板审计
授权用户对具体资源的使用权限，会话及命令记录。支持操作回放

作业平台
强大的作业调度系统支持自定义模板、脚本、自由编排，且任务可干预，可定时、可重做

任务系统
强大的任务系统：基础发布，K8S发布、代码检查、SQL审核、SQL优化等

资源申请
支持AWS、阿里云、腾讯云等多家云厂商一键购买资源(EC2、RDS、S3等)

资产管理
资产的自动发现、录入、分类、标签、管理。 事件的提醒、记录。

监控系统
自定义脚本，自动发现录入报警。支持邮件短信报警。

API网关
系统模板化，前后端分离，自由开发新模板注册即可快速接入

* any list
{:toc}
