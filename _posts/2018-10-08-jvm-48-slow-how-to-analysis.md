---
layout: post
title: jvm-48-java 变更导致压测应用性能下降，如何分析定位原因？
date: 2018-10-08 23:36:46 +0800
categories: [Java]
tags: [jvm, gc, thread, sh]
published: true
---

# 拓展阅读

[JVM FULL GC 生产问题 I-多线程通用实现](https://houbb.github.io/2018/10/08/jvm-full-gc-37-inaction)

[JVM FULL GC 生产问题 II-如何定位内存泄露？ 线程通用实现](https://houbb.github.io/2018/10/08/jvm-full-gc-38-inaction2)

[JVM FULL GC 生产问题 III-多线程执行队列的封装实现，进一步抽象](https://houbb.github.io/2018/10/08/jvm-full-gc-38-inaction3)

[jvisualvm java 性能分析工具](https://houbb.github.io/2018/11/12/jvisualvm)

[jvm-44-jvm 内存性能分析工具 Eclipse Memory Analyzer Tool (MAT) / 内存分析器 (MAT)](https://houbb.github.io/2018/10/08/jvm-44-dump-file-analysis-mat)

[jvm-45-jvm dump 文件内存介绍+获取方式+堆内存可视分析化工具](https://houbb.github.io/2018/10/08/jvm-45-dump-file-analysis-visual)

[jvm-46-jvm Thread Dump 线程的堆栈跟踪信息+获取方式+可视分析化工具 FastThread](https://houbb.github.io/2018/10/08/jvm-46-dump-thread-file-analysis-visual)

[jvm-47-jvm GC 日志获取方式+可视分析化工具 GcViewer](https://houbb.github.io/2018/10/08/jvm-47-gc-file-analysis-visual)

[jvm-48-java 变更导致压测应用性能下降，如何分析定位原因？](https://houbb.github.io/2018/10/08/jvm-48-slow-how-to-analysis)

[jvm-49-linux 服务器使用率升高应该如何排查分析？](https://houbb.github.io/2018/10/08/jvm-49-cpu-high-how-to-analysis)

# 前言

大家好，我是老马。

java 的性能下降，相信每一位小伙伴都遇到过。

测试在压测环境，发现因为了升级了一下日志包组件，导致性能下降厉害（30%）。

如何分析原因？

# 思路

## 代码是否真的存在问题

是否所有的性能都下降?

如果全部下降，则针对升级的部分做代码分析+本地结合 jvisual 分析慢在哪里即可。

发现不是，那么就针对这一个应用具体分析。

这里发现就是特定应用的一个压测变慢了。

## QPS 下降初步判断

整体看是压测的 QPS 下降。

随便抽取几笔日志查看，大部分的耗时在 10ms 左右，但是整体压测的平均耗时却是 60ms 左右。

每一次都是相同的请求参数，除了订单号差异。

我们要看为什么慢，就去找比较慢的操作才行。

目前的很多 ELK 等日志体系，对于耗时的模糊匹配支持不友好。

## 找到慢日志

如果有比较好的工具，直接统计出来。

如果日志分析工具不够强大，比如我想找耗时 200-299ms 之间的日志。

可以使用如下的命令

```
grep "业务关键词" xxx.log | grep "日志关键词2" | egrep 'cost=[2][0-9][0-9]' | tail 
```

主要是 `egrep 'cost=[2][0-9][0-9]'` 正则 grep 可以把耗时 200-299 的日志找出来，

然后结合日志，分析整个调用链路。

## 慢日志区间定位

找了几笔慢的操作，都发现在 log1 和 log2 间隔非常久。

查代码，找到 log1 和 log2 的位置，发现是一个 mq 调用。

## 是否是 GC？

发现 CAT 上这个时间存在 young GC，但是 gc 耗时只有 60ms 左右。

但是慢操作的耗时介于 60~400ms 的都有。

所以可以排除是 gc 的问题，而且每一次都是这个位置，gc 不可能每一次都这么巧。

就算是 gc，那么慢的时间长度应该一致，而不是波动这么大。

## 耗时操作的确认

所以怀疑就是 mq 的问题。

比如 database/cache/rpc/http 这些都值得怀疑。

不过在怀疑之前，我们可以做一些其他因素的排除，比如把本次新增的功能，比如日志 aop 切面/脱敏等功能全部关闭，排除新的因素影响。

发现关闭之后压测无变化，所以最后只剩下一个资源问题。

# 小结

希望本文对你有所帮助，如果喜欢，欢迎点赞收藏转发一波。

我是老马，期待与你的下次相遇。


* any list
{:toc}