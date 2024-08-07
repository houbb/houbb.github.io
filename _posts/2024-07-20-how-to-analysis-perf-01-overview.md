---
layout: post
title: 如何进行程序的性能分析？
date: 2024-07-04 21:01:55 +0800
categories: [Tool]
tags: [tool, perf, sh]
published: true
---

# 场景

平时的程序，忽然升级一个版本之后，性能下降比较厉害。

为什么？

# STEP1: 确认是升级代理的问题吗？

控制变量法：其他不变，把代码回归到旧版本。

如果恢复就解决问题，那么说明就是代码带来的问题。

# STEP2: 是代码的哪里导致的？

如果上一个版本是好的，这一个版本不对。

可以看一些版本间的代码差异，这就需要我们最好保持每一个版本的分支，这样才方便对比。

## 如果没有版本分支怎么办？

可以把上一个版本的 war 包下载到本地解压，然后用 compare2 等工具对比二者的差异。

jd-gui 反编译工具。

## 本地复现

最好的方法是本地可以启动。

这个时候可以进行性能压测。

观察内存，cpu, io, net 等资源的消耗。

## 控制变量

代码 review

找到怀疑的部分，调整代码进行处理。



# 参考资料

* any list
{:toc}
