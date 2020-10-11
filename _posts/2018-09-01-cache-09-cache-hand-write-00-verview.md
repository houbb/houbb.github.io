---
layout: post
title:  Cache Travel-09-从零手写 redis（零）为什么手写 redis
date:  2018-09-01 12:24:42 +0800
categories: [Cache]
tags: [cache, sh]
published: true
---

# redis 的重要性

做 java 的，天天喊着高性能，高并发，高可用。

高性能之中，基本上都离不开 redis。

特别是在当今对于性能要求越来越高的时代，mysql 等传统数据库越来越需要与 redis 结合，这样才能更好的适应我们的业务。

以前手写过一次 hades，觉得不满意，就废弃了。

本次重新再写一次。

开源地址：

> [https://github.com/houbb/cache](https://github.com/houbb/cache)

# 目录

![image](https://upload-images.jianshu.io/upload_images/5874675-c8c9e3a106d9d880?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

[​java从零手写实现redis（一）如何实现固定大小的缓存？](https://mp.weixin.qq.com/s?__biz=MzUyNjE3OTAyMw==&mid=2247484380&idx=1&sn=be0f6c3df5cf186e43012ba2a322bced&scene=21#wechat_redirect)

[java从零手写实现redis（二）redis expire 过期原理](https://mp.weixin.qq.com/s?__biz=MzUyNjE3OTAyMw==&mid=2247484388&idx=1&sn=941a70323a03ecc836b3d8b58b312c2d&scene=21#wechat_redirect)

[java从零手写实现redis（三）内存数据如何重启不丢失？](https://mp.weixin.qq.com/s?__biz=MzUyNjE3OTAyMw==&mid=2247484394&idx=1&sn=b28bab43fbcbb716b1962a91eafaaddb&scene=21#wechat_redirect)

[java从零手写实现redis（四）添加监听器](https://mp.weixin.qq.com/s?__biz=MzUyNjE3OTAyMw==&mid=2247484401&idx=1&sn=6df09b2e7519b2e2c3119ef993249e4e&scene=21#wechat_redirect)

[java从零手写实现redis（五）过期策略的另一种实现思路](https://mp.weixin.qq.com/s?__biz=MzUyNjE3OTAyMw==&mid=2247484408&idx=1&sn=c6a5af5727f36aeb9a469b048a04607f&scene=21#wechat_redirect)

[java从零手写实现redis（六）AOF 持久化原理详解及实现](https://mp.weixin.qq.com/s?__biz=MzUyNjE3OTAyMw==&mid=2247484415&idx=1&sn=3fb59bc10039f7f419a96d282ede3d7d&scene=21#wechat_redirect)

[java从零开始手写redis（七）LRU 缓存淘汰策略详解](https://mp.weixin.qq.com/s?__biz=MzUyNjE3OTAyMw==&mid=2247484421&idx=1&sn=d98eac57115eeaf02cbbf68047403da3&scene=21#wechat_redirect)

[java从零开始手写redis（八）朴素 LRU 淘汰算法性能优化](https://mp.weixin.qq.com/s?__biz=MzUyNjE3OTAyMw==&mid=2247484433&idx=1&sn=f65dbaa07abfec1fe8a39a85a0ab3fbe&scene=21#wechat_redirect)

[java 从零开始手写 redis（九）LRU 缓存淘汰算法如何避免缓存污染](https://mp.weixin.qq.com/s?__biz=MzUyNjE3OTAyMw==&mid=2247484435&idx=1&sn=7c80a9f958601db1b5c6ae2079b8b81c&scene=21#wechat_redirect)

[java 从零开始手写 redis（十）缓存淘汰算法 LFU 最少使用频次](https://mp.weixin.qq.com/s?__biz=MzUyNjE3OTAyMw==&mid=2247484461&idx=4&sn=99d6324a148e13576c6875f1de8e3ad9&scene=21#wechat_redirect)

[java 从零开始手写 redis（11）clock时钟淘汰算法详解及实](https://mp.weixin.qq.com/s?__biz=MzUyNjE3OTAyMw==&mid=2247484461&idx=3&sn=75bd11ca2e6821ad9a431cd2b1a7694a&scene=21#wechat_redirect)

[java 从零开始手写 redis（12）redis expire 过期如何实现随机获取keys？](https://mp.weixin.qq.com/s?__biz=MzUyNjE3OTAyMw==&mid=2247484461&idx=2&sn=7ce06fc226901d96ad66b1f5733cb2b9&scene=21#wechat_redirect)


# redis 学习目录



* any list
{:toc}