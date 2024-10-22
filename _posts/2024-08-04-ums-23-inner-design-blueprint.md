---
layout: post
title: UMS 用户权限管理-23-内网权限系统蓝图/草案
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


# 为什么从 ums 开始？

人，作为万物的尺度。

人的关系，作为公司的基石。

## 拓展系统

sso 统一登录

passport 统一权限

ums 统一用户

cmdb 统一资源

事件平台

审批流：便于留痕+追溯==》标准化

度量


## 边界

系统之间的边界在哪里？

每一个系统的职责是什么？

如何更好的结合起来？发挥一个平台的力量？



# 参考资料

* any list
{:toc}  