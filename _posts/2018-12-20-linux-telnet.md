---
layout: post
title: linux telnet
date: 2018-12-20 17:21:25 +0800
categories: [Linux]
tags: [linux, net, shell, sh]
published: true
excerpt: Linux Telnet
---

# telnet

用来判断网络是否通

## 访问本地某个端口

```
telnet localhost 1234
```

# telnet Escape character is '^]'.

这个要怎么退出呢？

## 步骤如下：

1. Crtl + ]

2. 输入 quit + 回车


# linux 如何 telnet 退出

在Linux终端中，使用Telnet连接到远程主机后，要退出Telnet会话，可以按照以下步骤：

1. **使用键盘快捷键：**

   - 在Telnet会话中，可以尝试使用组合键`Ctrl + ]`。这将激活Telnet命令提示符。
   - 在Telnet提示符中，输入`quit`或`exit`，然后按回车键。

2. **使用Telnet命令：**

   - 在Telnet会话中，可以直接输入`quit`或`exit`，然后按回车键。

3. **关闭终端窗口：**

   - 直接关闭终端窗口也会终止Telnet会话。

请注意，Telnet是一种不安全的远程登录协议，建议使用更安全的替代方案，如SSH。

SSH提供了加密通信，而Telnet在传输数据时是明文的，可能导致安全风险。

* any list
{:toc}