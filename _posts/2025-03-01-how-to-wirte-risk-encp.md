---
layout: post
title: 为什么需要加密机服务？
date: 2025-3-1 23:38:19 +0800
categories: [Team]
tags: [team, doc, sh]
published: true
---


# 前言

大家好，我是老马。

以前我自己在写工具的时候，都是直接自己实现就完事了。

但是在大公司，或者说随着合规监管的要求，自己随手写的加解密之类的，严格说是不合规的。

作为一家技术性公司，特别是金融相关，一定要拥有自己的加解密、加密机服务。

# 思想

安全第一，加解密一定要统一管理，保证安全性。

# 风控

pos

收单

银联

加密机必须是采购的符合统一标准的。

# 加解密服务

可以提供统一的加解密服务，保证全公司的安全。

## 核心能力

秘钥托管

加密算法：对称/非对称

系统接入：key/password

调用审计

权限管理

## 特性

算法

安全合规

标准化 api/sdk

定制化  CA

监控与管理

接口：对称/非对称/HASH/random 

密钥：生成store / 轮换 / 销毁 / 备份+恢复

证书：生成签发 / 销毁 / 查询  / 验证

# 拓展阅读

## 项目推荐

下面是一些日志、加解密、脱敏安全相关的库推荐：

| 项目                                                                    | 介绍                    |
|:----------------------------------------------------------------------|:----------------------|
| [sensitive-word](https://github.com/houbb/sensitive-word)             | 高性能敏感词核心库             |
| [sensitive-word-admin](https://github.com/houbb/sensitive-word-admin) | 敏感词控台，前后端分离           |
| [sensitive](https://github.com/houbb/sensitive)                       | 高性能日志脱敏组件             |
| [auto-log](https://github.com/houbb/auto-log)                         | 统一日志切面组件，支持全链路traceId |
| [encryption-local](https://github.com/houbb/encryption-local)         | 离线加密机组件               |
| [encryption](https://mp.weixin.qq.com/s/2LQuKvll9EIn6pyFjhwacw)         | 加密机标准API+本地客户端        |
| [encryption-server](https://mp.weixin.qq.com/s/2LQuKvll9EIn6pyFjhwacw)        | 加密机服务                 |

## 拓展阅读

[【老马】离线版金融敏感信息加解密组件开源项目encryption-local](https://mp.weixin.qq.com/s/ba99l_NUHW6Zv8BCBAqfzg)

[【藏经阁】加密机服务完整解决方案，包含客户端+服务端](https://mp.weixin.qq.com/s/2LQuKvll9EIn6pyFjhwacw)

# 小结

成长就是不断认识到自己不足的过程。

希望项目可以帮助到你。喜欢的话，可以给原作者一个 star 鼓励一下！

我是老马，期待与你的下次重逢~

# 参考资料

* any list
{:toc}