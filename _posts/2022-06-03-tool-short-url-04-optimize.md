---
layout: post
title: 如何实现短链服务 short url-04-优化思路及 JS 实现复制
date:  2022-06-02 09:22:02 +0800
categories: [WEB]
tags: [web, sh]
published: true
---

# 实现拆分

## 新增

如果我们把新增和访问放在一个应用，就无法像 dwz 那样很好的实现一个 `https://dwz.cn/xxx` 就可以直接访问。

所以新增可以是一个单独的应用。

对于连接的访问重定向尽可能的域名短，直接访问即可。

# 复制优化

实现一个 JS 复制功能。

## 主动复制

## 直接复制

生成之后，直接 js 设置到用户的粘贴板。

# 性能优化

## 短链是否存在

BITMAP？

BloomFilter？

以前通过 mysql 查询访问，也可以通过 redis 等缓存提升性能。

## 短链映射

通过 redis 查询。

# 参考资料

[springboot 中重定向方式](https://blog.csdn.net/m0_54861649/article/details/124441884)

[Spring Boot重定向](https://blog.csdn.net/weixin_38106322/article/details/122974124)

* any list
{:toc}