---
layout: post
title: CSRF-web 安全
date:  2018-09-26 08:56:29 +0800
categories: [Web]
tags: [web, web-safe, sh]
published: true
excerpt: Cross Site Request Forgery (CSRF， 跨站请求伪造)
---

# CSRF

简单来说，CSRF 就是网站 A 对用户建立信任关系后，在网站 B 上利用这种信任关系，跨站点向网站 A 发起一些伪造的用户操作请求，以达到攻击的目的。

# 例子

举个例子。网站 A 是一家银行的网站，一个转账接口是 "http://www.bankA.com/transfer?toID=12345678&cash=1000"。toID 表示转账的目标账户，cash 表示转账数目。当然这个接口没法随便调用，只有在已经验证的情况下才能够被调用。

此时，攻击者建立了一个 B 网站，里面放了一段隐藏的代码，用来调用转账的接口。当受害者先成功登录了 A 网站，短时间内不需要再次验证，这个时候又访问了网站 B，B 里面隐藏的恶意代码就能够成功执行。

# 预防

那怎么预防 CSRF 攻击呢？

OWASP 推荐了两种检查方式来作为防御手段。

## 检查标准头部

检查标准头部，确认请求是否同源。检查 source origin 和 target origin，然后比较两个值是否匹配

## 检查 CSRF Token

主要有四种推荐的方式

- Synchronizer Tokens

在表单里隐藏一个随机变化的 token，每当用户提交表单时，将这个 token 提交到后台进行验证，如果验证通过则可以继续执行操作。这种情况有效的主要原因是网站 B 拿不到网站 A 表单里的 token;

- Double Cookie Defense

当向服务器发出请求时，生成一个随机值，将这个随机值既放在 cookie 中，也放在请求的参数中，服务器同时验证这两个值是否匹配；

- Encrypted Token Pattern

对 token 进行加密

- Custom Header

使用自定义请求头部，这个方式依赖于同源策略。其中最适合的自定义头部便是： "X-Requested-With: XMLHttpRequest"

# 参考资料

[防范CSRF跨站请求伪造](https://segmentfault.com/a/1190000008505616)

* any list
{:toc}