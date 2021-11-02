---
layout: post
title: qiankun-01-微前端框架介绍
date: 2021-11-02 21:01:55 +0800
categories: [Web]
tags: [web, front-end, micro, sh]
published: true
---

# 介绍

qiankun 是一个基于 single-spa的微前端实现库，旨在帮助大家能更简单、无痛的构建一个生产可用微前端架构系统。

qiankun 孵化自蚂蚁金融科技基于微前端架构的云产品统一接入平台，在经过一批线上应用的充分检验及打磨后，我们将其微前端内核抽取出来并开源，希望能同时帮助社区有类似需求的系统更方便的构建自己的微前端系统，同时也希望通过社区的帮助将 qiankun 打磨的更加成熟完善。

目前 qiankun 已在蚂蚁内部服务了超过 200+ 线上应用，在易用性及完备性上，绝对是值得信赖的。

# 什么是微前端

> Techniques, strategies and recipes for building a modern web app with multiple teams that can ship features independently. -- Micro Frontends

微前端是一种多个团队通过独立发布功能的方式来共同构建现代化 web 应用的技术手段及方法策略。

微前端架构具备以下几个核心价值：

- 技术栈无关

主框架不限制接入应用的技术栈，微应用具备完全自主权

- 独立开发、独立部署

微应用仓库独立，前后端可独立开发，部署完成后主框架自动完成同步更新

- 增量升级

在面对各种复杂场景时，我们通常很难对一个已经存在的系统做全量的技术栈升级或重构，而微前端是一种非常好的实施渐进式重构的手段和策略

- 独立运行时

每个微应用之间状态隔离，运行时状态不共享


# 参考资料

https://qiankun.umijs.org/zh/guide

* any list
{:toc}