---
layout: post
title: linux soft kill 
date: 2019-1-3 20:04:07 +0800
categories: [Linux]
tags: [linux, sh]
published: true
excerpt: linux soft kill 软杀
---

# 为什么需要软杀

我们平时习惯性的使用 `kill -9 PID` 直接杀死一个进程。

这会导致一个问题，正常线程可能运行到一半，被你直接 kill 掉了，无法保证这一刻程序的正确性。

我们可以根据 spring 等容器管理的线程，进行软杀。

linux 下如何软杀？

# 在linux/unix下，你会怎么中止一个java进程？

你可能会回答 kill -9 pid，这是一种在多数情况下正确的做法。

不过，这种方式过于暴力，如果用户对环境不熟悉，很容易造成致命的后果。

本文将分析kill -9产生问题的原因，并给出另一种标准的kill方式。

## 标准中断信号

在Linux信号机制中，存在多种进程中断信号（Linux信号列表）。

其中比较典型的有 SIGNKILL（9） 和 SIGNTERM（15）.

SIGNKILL（9） 和 SIGNTERM（15） 的区别在于：

SIGNKILL（9） 的效果是立即杀死进程. 该信号不能被阻塞, 处理和忽略。

SIGNTERM（15） 的效果是正常退出进程，退出前可以被阻塞或回调处理。并且它是Linux缺省的程序中断信号。

由此可见，SIGNTERM（15） 才是理论上标准的kill进程信号。

那使用 SIGNKILL（9） 又有什么错呢？

## SIGNKILL（9） 带来的问题

先看一段程序

```java
/**
 * Shutdown Hook Presentation
 *
 * @author Ken Wu
 */
public class ShutdownHookTest {

 private static final void shutdownCallback() {
  System.out.println("Shutdown callback is invoked.");
 }

 public static void main(String[] args) throws InterruptedException {
  Runtime.getRuntime().addShutdownHook(new Thread() {

   @Override
   public void run() {
    shutdownCallback();
   }

  });
  Thread.sleep(10000);
 }

}
```

在上面这段程序中，我使用Runtime为当前java进程添加了一个ShutdownHook，它的作用是在java正常退出时，执行shutdownCallback()这个回调方法。

此时，如果你试验过在java进程未自动退出前，执行 kill -9 pid，即发送 SIGNKILL 信号，会发现这个回调接口是不会被执行的。

这是SIGNKILL信号起的作用。

对于我这个简单的测试用例来说，不被执行也无大碍。

但是，如果你的真实系统中有需要在java进程退出后，释放某些资源。

而这个释放动作，因为SIGNKILL被忽略了，那就可能造成一些问题。

## 最佳实践

所以，推荐大家使用标准的kill进程方式，即 `kill -15 pid`。

# 参考资料

[如何对 1 千万个整数进行快速排序](https://mp.weixin.qq.com/s/OM3DmT33BVkR2Gy2-1jkag)

* any list
{:toc}