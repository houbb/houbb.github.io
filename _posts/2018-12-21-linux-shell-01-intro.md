---
layout: post
title: linux Shell 命令行-01-intro 入门介绍
date: 2018-12-21 11:28:06 +0800
categories: [Linux]
tags: [linux, shell, sh]
published: true
---

# 拓展阅读

[linux Shell 命令行-00-intro 入门介绍](https://houbb.github.io/2018/12/21/linux-shell-01-intro)

[linux Shell 命令行-02-var 变量](https://houbb.github.io/2018/12/21/linux-shell-02-var)

[linux Shell 命令行-03-array 数组](https://houbb.github.io/2018/12/21/linux-shell-03-array)

[linux Shell 命令行-04-operator 操作符](https://houbb.github.io/2018/12/21/linux-shell-04-operator)

[linux Shell 命令行-05-test 验证是否符合条件](https://houbb.github.io/2018/12/21/linux-shell-05-test)

[linux Shell 命令行-06-flow control 流程控制](https://houbb.github.io/2018/12/21/linux-shell-06-flow-control)

[linux Shell 命令行-07-func 函数](https://houbb.github.io/2018/12/21/linux-shell-07-func)

[linux Shell 命令行-08-file include 文件包含](https://houbb.github.io/2018/12/21/linux-shell-08-file-include)

[linux Shell 命令行-09-redirect 重定向](https://houbb.github.io/2018/12/21/linux-shell-09-redirect)

# shell

Shell 是一个用 C 语言编写的程序，它是用户使用 Linux 的桥梁。

Shell 既是一种命令语言，又是一种程序设计语言。

Shell 是指一种应用程序，这个应用程序提供了一个界面，用户通过这个界面访问操作系统内核的服务。

Ken Thompson 的 sh 是第一种 Unix Shell，Windows Explorer 是一个典型的图形界面 Shell。

# Shell 脚本

Shell 脚本（shell script），是一种为 shell 编写的脚本程序。

业界所说的 shell 通常都是指 shell 脚本，但读者朋友要知道，shell 和 shell script 是两个不同的概念。

由于习惯的原因，简洁起见，本文出现的 "shell编程" 都是指 shell 脚本编程，不是指开发 shell 自身。

# Shell类型

- Bourne Shell（/usr/bin/sh 或 /bin/sh）
- Bourne Again Shell（/bin/bash）
- C Shell（/usr/bin/csh）
- K Shell（/usr/bin/ksh）
- Root Shell（/sbin/sh）

通常，我们不区分 ```Bourne Shell``` 和 ```Bourne Again Shell```

# Shell 实战测试

## 创建 ```hello.sh```

```
houbinbindeMacBook-Pro:shell houbinbin$ pwd
/Users/houbinbin/code/shell
houbinbindeMacBook-Pro:shell houbinbin$ vi hello.sh
```

编辑 ```hello.sh``` 的内容

```
#!/bin/bash
echo "hello world!"
```

## 简单解释

 ```hello.sh``` 的含义

```#!``` 告诉操作系统要使用哪个解释器，```echo``` 用于在窗口中打印信息。

## 运行

- 运行 ```hello.sh```

```
houbinbindeMacBook-Pro:shell houbinbin$ /bin/sh hello.sh
hello world!
```

- 另一种运行方式

```
houbinbindeMacBook-Pro:shell houbinbin$ ./hello.sh
-bash: ./hello.sh: Permission denied
houbinbindeMacBook-Pro:shell houbinbin$ chmod +x ./hello.sh
houbinbindeMacBook-Pro:shell houbinbin$ ./hello.sh
hello world!
```

# 从输入读取

- ```hello_name.sh```

```sh
#!/bin/bash

# 作者：houbinbin

echo "请输入您的名字？"
read NAME
echo "您好，$NAME!"
```

- 运行

```
houbinbindeMacBook-Pro:shell houbinbin$ vi hello_name.sh
houbinbindeMacBook-Pro:shell houbinbin$ /bin/sh hello_name.sh
请输入您的名字？
houbinbin
您好，houbinbin!
houbinbindeMacBook-Pro:shell houbinbin$
```

# 参考资料

https://www.runoob.com/linux/linux-shell.html

> [Shell 中文教程](http://www.runoob.com/linux/linux-shell.html)

> [Shell 中文教程](http://c.biancheng.net/cpp/shell/)

* any list
{:toc}