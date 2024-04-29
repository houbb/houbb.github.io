---
layout: post
title: linux soft kill linux kill
date: 2018-12-05 20:04:07 +0800
categories: [Linux]
tags: [linux, sh]
published: true
excerpt: linux soft kill 软杀
---

# kill 时发现僵尸进程

kill 不掉。

```sh
ps -ef | grep defunct
```

这样可以找到对应的僵尸进程。

然后 kill 对应的父亲 id 即可。

```
ps -ef | grep java

~$ ps -ef | grep java
dh           545     435  0 19:15 pts/0    00:00:00 grep --color=auto java
```

id 后面那个就是父亲 id。

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

# kill

- kill 默认信号是 SIGTERM

15 终止信号

- kill -9

SIGKILL kill 信号

- kill -2

SIGINT interrupt 中断信号

同ctrl-c

- kill -1

SIGHUP hang up 挂起信号

- kill -3

SIGQUIT 可打印进程#线程堆栈

- kill -9

只有kill -9能够结束jvm进程，别的信号量只是发送给java进程处理，至于如何响应是程序代码决定的

SIGTERM是不带参数时kill发送的信号,意思是进程终止运行,但执行与否还得看进程是否支持.如果进程还没有终止，可以使用 kill -SIGKILL pid,这是由内核来终止进程，进程不能监听这个信号

Java程序如果添加了shutdownhook,则可以监听1/2/15

# linux

## SIGHUP与nohup

当用户启动一个进程的时候，这个进程是运行在前台，使用与相应控制终端相联系的标准输入、输出进行输入和输出。

即使将进程的输入输出重定向，并将进程放在后台执行，进程仍然和当前终端设备有关系。

正因为如此，在当前的登录会话结束时，控制终端设备将和登录进程相脱离，那么系统就向所有与这个终端相联系的进程发送SIGHUP的信号，通知进程线路已经挂起了，如果程序没有接管这个信号的处理，那么缺省的反应是进程结束。

因此普通的程序并不能真正脱离登录会话而运行进程，为了使得在系统登录后还可以正常执行，只有使用命令nohup来启动相应程序

# 个人感受

## 系统的学习 linux 知识

对于 linux 的学习，一直都是星星点点，流于一些简单的命令，时间长不用就完全忘记。

完全没有系统的学习过一遍 linux 的相关知识。

# 参考资料

[如何对 1 千万个整数进行快速排序](https://mp.weixin.qq.com/s/OM3DmT33BVkR2Gy2-1jkag)

* any list
{:toc}