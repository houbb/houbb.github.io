---
layout: post
title:  SSO-03-单点登出实现流程
date:  2018-07-16 19:19:52 +0800
categories: [Auth]
tags: [java, auth]
published: true
---

# 单点登出

单点登录自然也要单点注销，在一个子系统中注销，所有子系统的会话都将被销毁，

# 流程图

用下面的图来说明:

![sso-logout](https://upload-images.jianshu.io/upload_images/5815733-827fea6934257777.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/825/format/webp)

## 流程

步骤分析:

1.用户在CRM系统中点击注销按钮.会重定向到统一认证中心的注销方法

2.统一认证中心接受到注销请求之后,会销毁全局的会话.

3.统一认证中心会拿到之前在该系统中注册的子系统集合.

4.依次的调用子系统的登出方法,销毁局部会话.

5.每个系统中的会话都已经销毁之后,跳转到登陆页面.

* any list
{:toc}