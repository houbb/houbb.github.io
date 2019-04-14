---
layout: post
title: Python-39-splider Flidder 抓包工具
date:  2018-02-14 15:09:30 +0800
categories: [Lang]
tags: [python, python3, http, lang, sh]
published: true
---

# Flidder

## Fiddler基础知识

Fiddler是强大的抓包工具，它的原理是以web代理服务器的形式进行工作的，使用的代理地址是：127.0.0.1，端口默认为8888，我们也可以通过设置进行修改。

代理就是在客户端和服务器之间设置一道关卡，客户端先将请求数据发送出去后，代理服务器会将数据包进行拦截，代理服务器再冒充客户端发送数据到服务器；同理，服务器将响应数据返回，代理服务器也会将数据拦截，再返回给客户端。

Fiddler可以抓取支持http代理的任意程序的数据包，如果要抓取https会话，要先安装证书。

## 用途

有时候想抓取网站，各种 http 跳转会把自己搞的晕头转向，云里雾里。

# 参考资料

[Fiddler工具使用介绍一](https://www.cnblogs.com/miantest/p/7289694.html)

* any list
{:toc}