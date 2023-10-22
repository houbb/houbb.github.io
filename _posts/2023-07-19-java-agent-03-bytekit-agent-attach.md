---
layout: post
title: java agent-03-Java Instrumentation 结合 bytekit 实战笔记 agent attach
date:  2023-07-12 +0800
categories: [Java]
tags: [java, sh]
published: true
---

# 拓展阅读

前面几篇文档，我们简单介绍了一下 java Instrumentation。

[java agent 介绍](https://houbb.github.io/2023/07/12/java-agent-01-intro)

[Java Instrumentation API](https://houbb.github.io/2023/07/12/java-agent-02-instrumentation-api)

本篇我们结合一下 [bytekit](https://houbb.github.io/2023/08/09/java-agent-02-bytekit) 进行实际的文件修改。





# 拓展阅读

## VirtualMachine 类不存在

添加jdk tools.jar解决com.sun.tools.attach.VirtualMachine 类找不到的问题

发现配置了 java_home 及相关信息还是不行，可以手动在项目中引入。

idea 就是 libs 种添加依赖。




# 参考资料

https://blog.51cto.com/zhangxueliang/5667216

https://www.cnblogs.com/756623607-zhang/p/12575509.html

* any list
{:toc}