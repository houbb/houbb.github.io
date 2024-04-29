---
layout: post
title: java -jar 基础介绍
date: 2018-10-08 23:36:46 +0800
categories: [Java]
tags: [jvm, gc, thread, sh]
published: true
---

# 拓展阅读

[JVM FULL GC 生产问题 I-多线程通用实现](https://houbb.github.io/2018/10/08/jvm-full-gc-37-inaction)

[JVM FULL GC 生产问题 II-如何定位内存泄露？ 线程通用实现](https://houbb.github.io/2018/10/08/jvm-full-gc-38-inaction2)

[JVM FULL GC 生产问题 III-多线程执行队列的封装实现，进一步抽象](https://houbb.github.io/2018/10/08/jvm-full-gc-38-inaction3)

[java 多线程实现通用方法 threadpool implement in java](https://houbb.github.io/2018/10/08/jvm-full-gc-39-inaction4)


# 业务说明

今天搭建一下测试环境，太久没搞了。

```sh
java -jar xxx.jar -DconfigrationFile=/xxx/log4j2.xml
```

发现配置文件一直没生效。

搞了半天，其实应该 -jar 放在最后，否则 -D 不生效。

```sh
java -DconfigrationFile=/xxx/log4j2.xml -jar xxx.jar 
```

# chat

## Q: java -jar 启动的 java 会因为 crtl+z 停止吗？

在大多数操作系统中，使用 `Ctrl+Z` 会发送一个 SIGTSTP (Signal to stop) 信号给当前的前台进程，这通常会导致该进程暂停执行。在 UNIX 和类 UNIX 系统（如 Linux 和 macOS）中，`Ctrl+Z` 会将前台进程放到后台，并暂停其执行，而不会终止进程。

如果你使用 `java -jar` 命令启动一个 Java 应用程序，并且该命令是在终端或命令行界面中执行的，那么当你按下 `Ctrl+Z` 时，Java 进程会被暂停。然而，这并不意味着 Java 应用程序会停止运行，它只是暂时停止了与终端的交互。

要恢复进程，可以使用 `fg` 命令将进程重新带到前台并继续执行，或者使用 `bg` 命令让它在后台继续运行。

在 Windows 系统中，`Ctrl+Z` 通常表示输入结束（EOF），这可能会使某些命令或程序停止运行，但对于启动的 Java 应用程序，它的行为可能与 UNIX 和类 UNIX 系统不同。

如果你想要停止一个 Java 应用程序，通常需要发送 SIGTERM (Signal to terminate) 信号，这可以通过 `kill` 命令（在 UNIX 和类 UNIX 系统）或任务管理器（在 Windows）来完成。



# 小结

希望本文对你有所帮助，如果喜欢，欢迎点赞收藏转发一波。

我是老马，期待与你的下次相遇。

* any list
{:toc}