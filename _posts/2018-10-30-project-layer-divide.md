---
layout: post
title: Java Web Layer Divide
date:  2018-10-30 09:54:43 +0800
categories: [Security]
tags: [security, java, sh]
published: true
excerpt: Java 项目分层设计
---

# MVC

Model-View-Controller 是一种指导思想的分层。

实际上我们处理的比这个要详细的多。

# 禁止跨级调用

一定要边界明确。

比如 biz 禁止直接调用 dao，应该通过 service 去做对应处理。

# 参考资料

[如何合理的设计代码分层，论代码分层的设计之道](https://mp.weixin.qq.com/s/8pIsEiBLkl7FLTbNaz_JLA)

* any list
{:toc}