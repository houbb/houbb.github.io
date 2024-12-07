---
layout: post
title: UMS sso-01-内网权限系统 sso 设计
date: 2024-08-04 21:01:55 +0800
categories: [Basic]
tags: [basic, user, ums, priviliage, sh]
published: true
---

# 项目

前后端合一:

[privilege-admin 权限管理](https://github.com/houbb/privilege-admin)

前后端分离：

> [ums-server](https://github.com/houbb/ums-server)

> [ums-server-h5](https://github.com/houbb/ums-server-h5)

# 内网-内部系统

我们将不同的用户系统拆分开。

让内部的用户系统尽可能的简单，可以作为一切系统的基石。

简单的系统，适用性也更强。

# 最核心的能力

## 核心模块管理

用户

角色

权限

## 管理员视角

信息修改 

用户失效？

数据的导入/导出/批量修改

### 组织结构

管理企业内部的组织结构，如部门、团队和职位

### 人员的变动

通过 TAG 支持，而不是麻烦的上下级树。

## 用户-用户视角

### 个人信息

修改个人信息？

修改个人认证方式？

### 登录鉴权

登录 、 鉴权

忘记密码？

修改密码？

账户自助解锁？

## 审计

所有的操作都有对应的日志记录

## 安全

密码长度校验+加盐

登录次数限制，错误次数限制，账户锁定。

密码加密安全 

数据库敏感信息脱敏

日志脱敏

登录双因子验证==》google

## 产品化

多租户

其他系统的联动+API



# 参考资料

* any list
{:toc}