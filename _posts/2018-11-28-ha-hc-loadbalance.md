---
layout: post
title: 高可用+高并发+负载均衡架构
date: 2018-11-28 19:30:44 +0800
categories: [Distributed]
tags: [distributed, design, sh]
published: true
excerpt: 高可用+高并发+负载均衡架构
---

# 前言

[《无限容量数据库架构设计》](https://mp.weixin.qq.com/s?__biz=MjM5ODYxMDA5OQ==&mid=2651960378&idx=1&sn=971a8db3251a232e3feeb7ff6235c96b&chksm=bd2d01e68a5a88f0f05c184340bcda81125ed1de772b35ef12b34c1f5f81c7b5a60cb8047f3c&scene=21#wechat_redirect)

[《MQ消息可达性+幂等性+延时性架构设计》](https://mp.weixin.qq.com/s?__biz=MjM5ODYxMDA5OQ==&mid=2651960382&idx=1&sn=72dae005c6662a936ea8fa80a4ed6001&chksm=bd2d01e28a5a88f400451195d2521ca668161364e3e62a9a42992299ce6baa5cbafa353d23d3&scene=21#wechat_redirect)

# 一、高可用

文章：[《究竟什么是互联网高可用架构设计》](http://mp.weixin.qq.com/s?__biz=MjM5ODYxMDA5OQ==&mid=2651959728&idx=1&sn=933227840ec8cdc35d3a33ae3fe97ec5&chksm=bd2d046c8a5a8d7a13551124af36bedf68f7a6e31f6f32828678d2adb108b86b7e08c678f22f&scene=21#wechat_redirect)

内容：

什么是高可用

高可用架构核心准则：冗余+故障转移

互联网分层架构，各层保证高可用的架构实践



# 二、高并发

文章：[《究竟什么是互联网高并发架构设计》](http://mp.weixin.qq.com/s?__biz=MjM5ODYxMDA5OQ==&mid=2651959830&idx=1&sn=ce1c5a58caed227d7dfdbc16d6e1cea4&chksm=bd2d07ca8a5a8edc45cc45c4787cc72cf4c8b96fb43d2840c7ccd44978036a7d39a03dd578b5&scene=21#wechat_redirect)

内容：

什么是高并发

高并发架构准则：垂直扩展，水平扩展

互联网分层架构，各层保证水平扩展的架构实践



# 三、反向代理

文章：[《究竟什么是互联网四层/七层反向代理》](http://mp.weixin.qq.com/s?__biz=MjM5ODYxMDA5OQ==&mid=2651960131&idx=1&sn=a3bbcbe03f9e12d32ba751ce6ffae067&chksm=bd2d069f8a5a8f895fed39cad842f6f5a390bb18493f964b910270128f19f0b8af1d1f30b5c7&scene=21#wechat_redirect)

内容：

什么是代理与反向代理

如何实施反向代理

什么是四层/七层，有没有二层/三层呢？



# 四、负载均衡

文章：[《究竟什么是互联网负载均衡架构设计》](https://mp.weixin.qq.com/s?__biz=MjM5ODYxMDA5OQ==&mid=2651959585&idx=1&sn=0a9222cbfeb62a662edffafb7f0b43ae&scene=21#wechat_redirect)

内容：

什么是负载均衡

高并发架构准则：均匀

互联网分层架构，各层保证负载均衡的架构实践

延伸阅读：[《LVS为何不能取代DNS轮询》](https://mp.weixin.qq.com/s?__biz=MjM5ODYxMDA5OQ==&mid=2651959595&idx=1&sn=5f0633afd24c547b895f29f6538baa99&scene=21#wechat_redirect)

内容：

什么是LVS，DNS轮询

LVS解决什么问题

DNS轮询解决什么问题

LVS为何不能取代DNS轮询


延伸阅读：[《异构服务器负载均衡及过载保护》](https://mp.weixin.qq.com/s?__biz=MjM5ODYxMDA5OQ==&mid=2651959601&idx=1&sn=5684c39676b1f6d9366d9d15a2cdcec3&scene=21#wechat_redirect)

内容：

如何动态标识服务的处理能力

如何实施异构服务器负载均衡

什么是过载保护

如何实施过载保护

# 参考资料

[高可用+高并发+负载均衡架构设计](https://mp.weixin.qq.com/s/_I2SNfcAF0kPsRkZLs0uZg)

[架构师之路16年精选50篇](https://mp.weixin.qq.com/s/OlFKpcnBOgcPZmjvdzCCiA)

* any list
{:toc}