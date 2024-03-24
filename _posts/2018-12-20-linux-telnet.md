---
layout: post
title: linux telnet 用来判断网络是否通
date: 2018-12-20 17:21:25 +0800
categories: [Linux]
tags: [linux, net, shell, sh]
published: true
excerpt: Linux Telnet
---

# linux 命令汇总

| 命令             | 描述                                   | 地址                                              |
|------------------|----------------------------------------|---------------------------------------------------|
| linux top        | 实时查看系统性能                       | [linux top-linux 内存](https://houbb.github.io/2018/12/21/linux-top)                 |
| linux tar gz     | 解压命令                               | [linux tar gz 解压命令](https://houbb.github.io/2018/12/21/linux-tar-gz)              |
| linux tail       | 显示文件末尾内容                       | [linux tail, linux head](https://houbb.github.io/2018/12/21/linux-tail)               |
| linux rm         | 删除文件或目录                         | [linux rm, mkdir](https://houbb.github.io/2018/12/21/linux-rm)                         |
| linux pwd        | 显示当前目录                           | [linux pwd](https://houbb.github.io/2018/12/21/linux-pwd)                               |
| linux ps         | 显示当前进程信息                       | [linux ps](https://houbb.github.io/2018/12/21/linux-ps)                                 |
| linux port       | 显示端口占用情况                       | [linux port 端口占用](https://houbb.github.io/2018/12/21/linux-port)                   |
| linux ping       | 测试网络连通性                         | [linux ping](https://houbb.github.io/2018/12/21/linux-ping)                             |
| linux mv         | 移动文件或目录                         | [linux mv](https://houbb.github.io/2018/12/21/linux-mv)                                 |
| linux ls         | 列出文件和目录                         | [linux ls](https://houbb.github.io/2018/12/21/linux-ls)                                 |
| linux less, more | 分页显示文件内容                       | [linux less, linux more](https://houbb.github.io/2018/12/21/linux-less)                 |
| linux grep       | 在文件中搜索指定字符串                 | [linux grep](https://houbb.github.io/2018/12/21/linux-grep)                               |
| linux file       | 确定文件类型                           | [linux file 命令](https://houbb.github.io/2018/12/21/linux-file)                         |
| linux diff       | 比较文件的不同                         | [linux diff](https://houbb.github.io/2018/12/21/linux-diff)                               |
| linux chmod      | 修改文件权限                           | [linux chmod](https://houbb.github.io/2018/12/21/linux-chmod)                             |
| linux cd         | 切换当前目录                           | [linux cd](https://houbb.github.io/2018/12/21/linux-cd)                                   |
| linux cat        | 显示文件内容                           | [linux cat](https://houbb.github.io/2018/12/21/linux-cat)                                 |
| linux telnet     | 远程登录                               | [linux telnet](https://houbb.github.io/2018/12/20/linux-telnet)                           |
| linux free       | 显示内存使用情况                       | [linux free-内存统计信息](https://houbb.github.io/2018/12/21/linux-free)                 |
| linux df         | 显示磁盘空间使用情况                   | [linux df-磁盘统计信息](https://houbb.github.io/2018/12/21/linux-df)                     |
| linux netstat   | 显示网络连接、路由表、接口统计等信息 | [linux netstat-显示系统网络连接、路由表、接口统计、masquerade 连接等信息](https://houbb.github.io/2018/12/20/linux-netstat) |
| linux top        | 实时查看系统性能                       | [linux top 实时查看系统性能](https://houbb.github.io/2018/12/20/linux-top)                 |


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