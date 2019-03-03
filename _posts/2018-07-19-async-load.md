---
layout: post 
title:  asyncload 异步并行框架
date:  2018-07-19 17:29:38 +0800
categories: [Java]
tags: [java, thread, sh]
published: true
---

# asyncload

[asyncload](https://github.com/alibaba/asyncload) 阿里巴巴异步并行加载工具(依赖字节码技术)。

## 定位

业务层异步并行加载工具包，减少页面响应时间

## 原理描述：

1. 针对方法调用，基于字节码增强技术，运行时生成代理类，快速返回mock对象，后台异步进行调用

2. 通过管理和调度线程池，将后台异步调用进行加速处理，达到一个平衡点

3. 业务执行过程需要获取mock对象的真实数据时，阻塞等待原始结果返回，整个过程透明完成

很明显，经过异步并行加载后，一次 request 请求总的响应时间就等于最长的依赖关系请求链的相应时间。

# 异步并行框架

定义一个基于注解+spring整合的框架。

原理是 java 的线程池，这样所有的处理信息都是同步的，调用的时候对代码无侵入。

基于 AOP。

参考 mykit-async 框架。

# 参考资料

[mykit-async之——异步并行框架正式开源](https://blog.csdn.net/l1028386804/article/details/82564153)

[Spring中@Async注解执行异步任务](https://segmentfault.com/a/1190000015190901)

* any list
{:toc}