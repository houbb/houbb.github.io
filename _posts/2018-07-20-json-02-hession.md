---
layout: post
title:  Json 之 Hession
date:  2018-07-20 09:24:03 +0800
categories: [Java]
tags: [java, json, config, sf]
published: true
---

# Hessian

## 概念

Hessian是一个动态类型,二进制序列化,也是网络协议为了对象的定向传输。

## 优点

Hessian二进制的网络协议使不需要引入大型框架下就可以使用，并且不需要学习其它的入门的协议。

因为它是二进制协议，它更擅长于发送二进制数据，而不需要引入其它附件去扩展它的协议。

Hessian支持很多种语言，例如Java，Flash/Flex,python,c++,.net/c#,D,Erlang,PHP,Ruby,Object C等

## 设计目标

Hessian是一个动态类型，简洁的，可以移植到各个语言

Hessian协议有以下的设计目标：

- 它必须自我描述序列化的类型，即不需要外部架构和接口定义

- 它必须是语言语言独立的，要支持包括脚本语言

- 它必须是可读可写的在单一的途径

- 它要尽可能的简洁

- 它必须是简单的，它可以有效地测试和实施

- 尽可能的快

- 必须要支持Unicode编码

- 它必须支持八位二进制文件，而不是逃避或者用附件

- 它必须支持加密,压缩,签名,还有事务的上下文

# 拓展阅读


# 参考资料

- Hessian

[Hessian](http://hessian.caucho.com/doc/hessian-serialization.html)

https://www.jianshu.com/p/e800d8af4e22

* any list
{:toc}