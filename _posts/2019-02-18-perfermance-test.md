---
layout: post
title: 性能测试
date:  2019-2-18 14:50:42 +0800
categories: [Test]
tags: [test, sh]
published: true
excerpt: 性能测试
---

# 性能测试

## 概念

软件压力测试是一种基本的质量保证行为，它是每个重要软件测试工作的一部分。

软件压力测试的基本思路很简单：不是在常规条件下运行手动或自动测试，而是在计算机数量较少或系统资源匮乏的条件下运行测试。通常要进行软件压力测试的资源包括内部内存、CPU 可用性、磁盘空间和网络带宽。

## 目的

需要了解AUT(被测应用程序)一般能够承受的压力，同时能够承受的用户访问量(容量)，最多支持有多少用户同时访问某个功能。

# 相关工具

Apache apacheBench

Apache webBench

[Apache JMeter](https://houbb.github.io/2018/07/19/jmeter)

[LoadRunner](https://houbb.github.io/2018/07/19/load-runner)

[Ali 性能测试 TPS](https://help.aliyun.com/product/29260.html)

[JunitPerf](https://github.com/houbb/junitperf)

# 全链路压测

## 标准化+自动化

节约后期人力成本

## 核心问题

基础流程如何自动化，提高人效；

如何自动做好压测验证，保障压测安全；

压测置信度量化如何计算，保证压测有效。

# 拓展阅读

[单元测试最佳实践](https://houbb.github.io/2019/01/23/unit-test-best-practise)

# 参考资料 

[软件压力测试-百度百科](https://baike.baidu.com/item/%E8%BD%AF%E4%BB%B6%E5%8E%8B%E5%8A%9B%E6%B5%8B%E8%AF%95/10364657)

[全链路压测自动化实践](https://mp.weixin.qq.com/s/uv2AfwnKzkSAMDjj9fs-UA)

[全链路压测平台（Quake）在美团中的实践](https://mp.weixin.qq.com/s?__biz=MjM5NjQ5MTI5OA==&mid=2651748852&idx=1&sn=71d24d5f4fe1575589d56d2bed040d7a&chksm=bd12a0b98a6529aff13987a8189205b21c832398add2b8443e953ba88be88a856c2ced2e4607&scene=21#wechat_redirect)

* any list
{:toc}