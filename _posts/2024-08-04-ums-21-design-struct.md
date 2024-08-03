---
layout: post
title: UMS 用户权限管理-02-整体架构设计
date: 2024-08-04 21:01:55 +0800
categories: [Basic]
tags: [basic, user, ums, priviliage, sh]
published: true
---

# 整体架构

![应用拓扑](https://gitee.com/houbinbin/imgbed/raw/master/img/%E5%AF%B9%E5%A4%96%E6%8E%A5%E5%8F%A3_V1.png)

控台分为内外控部署，用户数据库独立。

外控-公网。

内控-内网。

## 优点

内外控隔离，内外安全性相对较好。

## 缺点

外控的菜单权限等，内控无法直接管控。

如果让内控人员在外控也登陆，会很麻烦。

当然针对这个问题，可以有 2 种解决方案。

（1）公用数据库

内外控使用同一个数据库。

用户表分开。

外控：out_user

内控：inner_user

（2）服务调用

内控添加一个针对外控用户的权限管理。

ums-ser 可以访问 ums-ser（外）提供的服务，从而控制外控的权限。

# 一刀流

## 设计理念

内外兼修，使用同一套系统。

通过权限不同，进行权限的限制。

## 应用拓扑

![对外接口2](https://gitee.com/houbinbin/imgbed/raw/master/img/%E5%AF%B9%E5%A4%96%E6%8E%A5%E5%8F%A32.png)

## 优缺点

- 优点

同一个项目，同一个数据源。

交互会简单一些。

- 缺点

内外控如果需求不同，实现起来就会变得比较麻烦。

给数据校验，安全等带来比较大的隐患。




# 参考资料

* any list
{:toc}