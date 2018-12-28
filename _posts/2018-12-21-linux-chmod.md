---
layout: post
title: linux chmod
date: 2018-12-21 11:28:06 +0800
categories: [Linux]
tags: [linux, shell, sh]
published: true
excerpt: linux chmod 权限赋值
---

# linux chmod

Linux/Unix 的文件调用权限分为三级 : 文件拥有者、群组、其他。利用 chmod 可以藉以控制文件如何被他人所调用。

使用权限 : 所有使用者

## 语法

```
chmod [-cfvR] [--help] [--version] mode file...
```

## 参数

其中：

```
u 表示该文件的拥有者，g 表示与该文件的拥有者属于同一个群体(group)者，o 表示其他以外的人，a 表示这三者皆是。
+ 表示增加权限、- 表示取消权限、= 表示唯一设定权限。
r 表示可读取，w 表示可写入，x 表示可执行，X 表示只有当该文件是个子目录或者该文件已经被设定过为可执行。
```

其他参数说明：

```
-c : 若该文件权限确实已经更改，才显示其更改动作
-f : 若该文件权限无法被更改也不要显示错误讯息
-v : 显示权限变更的详细资料
-R : 对目前目录下的所有文件与子目录进行相同的权限变更(即以递回的方式逐个变更)
--help : 显示辅助说明
--version : 显示版本
```

# 实际使用场景

一般我们创建一个 shell 脚本之后，需要执行首先要赋予其权限。

一般有两种方式：

```
chmod +x xxx.sh
``` 

```
chmod 777 xxx.sh
```

# 参考资料

[linux chmod](http://www.runoob.com/linux/linux-comm-chmod.html)

* any list
{:toc}