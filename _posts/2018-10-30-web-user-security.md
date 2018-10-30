---
layout: post
title: User Security
date:  2018-10-30 09:41:12 +0800
categories: [Security]
tags: [security, java, sh]
published: true
excerpt:  用户安全保密解决方案
---

# 用户隐私

## 加密

用户密码应该使用 随机salt + Md5(等安全的不可逆加密)

通讯层的加密，应该使用 RSA 等非对称加密算法。

敏感信息，比如卡号等信息，建议使用可逆加密到数据库。加密的密匙对于开发人员不可见。

## 脱敏

日志输出等。

建议在框架层处理，不然每个项目都处理起来非常痛苦，且实现各不相同。后期如果想统一调整，非常之麻烦。

# 参考资料

[网络数据隐私保护，阿里工程师怎么做？](https://mp.weixin.qq.com/s/4Eqh4p0j3cDj_0M4VAG-aA)

* any list
{:toc}