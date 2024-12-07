---
layout: post
title: SSO open-source 开源项目-03-xxl sso A distributed single-sign-on framework.（分布式单点登录框架XXL-SSO）
date: 2024-08-04 21:01:55 +0800
categories: [SSO]
tags: [sso, open-source, ums, priviliage, sh]
published: true
---


# 前言

大家好，我是老马。

今天我们来一起介绍一些常见的 sso 开源项目。

# 项目

前后端合一:

[privilege-admin 权限管理](https://github.com/houbb/privilege-admin)

前后端分离：

> [ums-server](https://github.com/houbb/ums-server)

> [ums-server-h5](https://github.com/houbb/ums-server-h5)

# XXL-SSO

## Introduction

XXL-SSO 是一个分布式单点登录框架。

只需要登录一次就可以访问所有相互信任的应用系统。

拥有"轻量级、分布式、跨域、Cookie+Token均支持、Web+APP均支持"等特性。现已开放源代码，开箱即用。

## Documentation

- [中文文档](https://www.xuxueli.com/xxl-sso/)

## Communication    

- [社区交流](https://www.xuxueli.com/page/community.html)

## Features

1. 简洁：API直观简洁，可快速上手
2. 轻量级：环境依赖小，部署与接入成本较低
3. 单点登录：只需要登录一次就可以访问所有相互信任的应用系统
4. 分布式：接入SSO认证中心的应用，支持分布式部署
5. HA：Server端与Client端，均支持集群部署，提高系统可用性
6. 跨域：支持跨域应用接入SSO认证中心
7. Cookie+Token均支持：支持基于Cookie和基于Token两种接入方式，并均提供Sample项目
8. Web+APP均支持：支持Web和APP接入
9. 实时性：系统登陆、注销状态，全部Server与Client端实时共享
10. CS结构：基于CS结构，包括Server"认证中心"与Client"受保护应用"
11. 记住密码：未记住密码时，关闭浏览器则登录态失效；记住密码时，支持登录态自动延期，在自定义延期时间的基础上，原则上可以无限延期
12. 路径排除：支持自定义多个排除路径，支持Ant表达式。用于排除SSO客户端不需要过滤的路径

## Development

于2018年初，我在github上创建XXL-SSO项目仓库并提交第一个commit，随之进行系统结构设计，UI选型，交互设计……

于2018-12-05，XXL-SSO参与"[2018年度最受欢迎中国开源软件](https://www.oschina.net/project/top_cn_2018?sort=1)"评比，在当时已录入的一万多个国产开源项目中角逐，最终排名第55名。

于2019-01-23，XXL-SSO被评选上榜"[2018年度新增开源软件排行榜之国产 TOP 50](https://www.oschina.net/news/103857/2018-osc-new-opensource-software-cn-top50)"评比，排名第8名。

至今，XXL-SSO已接入多家公司的线上产品线，接入场景如电商业务，O2O业务和核心中间件配置动态化等，截止2018-03-15为止，XXL-SSO已接入的公司包括不限于：

    1. 湖南创发科技
    2. 深圳龙华科技有限公司
    3. 摩根国际
    4. 印记云

> 更多接入的公司，欢迎在 [登记地址](https://github.com/xuxueli/xxl-sso/issues/1 ) 登记，登记仅仅为了产品推广。

欢迎大家的关注和使用，XXL-SSO也将拥抱变化，持续发展。

## Contributing

欢迎参与项目贡献！比如提交PR修复一个bug，或者新建 [Issue](https://github.com/xuxueli/xxl-sso/issues/) 讨论新特性或者变更。

## Copyright and License

产品开源免费，并且将持续提供免费的社区技术支持。个人或企业内部可自由的接入和使用。

# 参考资料

https://github.com/xuxueli/xxl-sso

* any list
{:toc}  