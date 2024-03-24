---
layout: post
title: linux 环境变量配置  linux /etc/profile .bashrc .bash_profile 的区别
date: 2018-12-20 17:21:25 +0800 
categories: [Linux]
tags: [linux, net, shell, sh]
published: true
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




# chat

## 3 个区别

在Linux系统中，环境变量的配置通常是通过修改用户的配置文件来实现的。

以下是`/etc/profile`、`.bashrc`和`.bash_profile`这三个文件的区别：

1. **/etc/profile:**
   - 该文件是系统范围内的全局配置文件，对所有用户都生效。
   - 在用户登录时执行，为用户设置全局环境变量和初始路径等信息。
   - 通常包含一些全局的配置信息，对系统的所有用户都生效。

2. **.bashrc:**
   - 该文件是每个用户的个性化配置文件，针对每个用户的bash shell。
   - 在用户每次启动一个新的bash shell时执行，通常用于定义个性化的环境变量、别名和函数等。
   - 由于是用户级别的配置文件，对每个用户的配置都可以有所不同。

3. **.bash_profile:**
   - 该文件同样是每个用户的个性化配置文件，也是与bash shell相关的。
   - 在用户登录时执行，与`/etc/profile`类似，但仅对当前用户生效。
   - 通常包含用户特定的环境变量和其他配置信息。
   - 如果存在`.bash_profile`，bash会首先执行该文件，如果不存在，才会查找`.bash_login`和`.profile`。

一般来说，用户的个性化配置信息应该存放在`~/.bashrc`或`~/.bash_profile`中。

用户可以根据自己的需求选择在哪个文件中进行配置。

在实际使用中，如果`.bash_profile`存在，它会被优先执行；否则，`.bashrc`将会被执行。


# 参考资料

https://www.cnblogs.com/jiu0821/p/7994838.html

[Linux netstat命令](http://www.runoob.com/linux/linux-comm-netstat.html)

* any list
{:toc}