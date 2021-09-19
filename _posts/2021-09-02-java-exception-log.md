---
layout: post
title: Java 异常日志堆栈信息不全-只有 2 行
date: 2021-09-01 21:01:55 +0800
categories: [java]
tags: [java, sh]
published: true
---

# NPE 现象 

最近生产机器出现了NullPointException, 但是并没有给出详细的堆栈信息，这让大家很郁闷，一开始以为是日志工具配置有问题，结果同样的配置其他机器却是正常的，

在网上找了几篇文章这篇虽然尝试可以解决问题，但是没搞懂究竟为什么这样设置，改动JVM默认配置是需要很大的勇气的哦。。。

然后在stackoverflow上找到了[这个答案](http://stackoverflow.com/questions/2411487/nullpointerexception-in-java-with-no-stacktrace)，这个被采纳的答案里有个得票率最高的链接，[点这里](http://jawspeak.com/2010/05/26/hotspot-caused-exceptions-to-lose-their-stack-traces-in-production-and-the-fix/)

看了大半天终于搞明白了题主的意思了，

**不打印异常堆栈日志是因为JVM在多次遇到同一异常信息时，前几次会输出堆栈信息，后面就会主动优化掉，只反馈异常摘要信息**

所以说我们只要往上翻翻以前的日志就可以看到该异常的具体信息，无需再设置JVM参数： 

```
-XX:-OmitStackTraceInFastThrow 或 -Xint参数了
```

# 参考资料

https://github.com/puniverse/quasar

* any list
{:toc}