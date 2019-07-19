---
layout: post
title: linux port 端口占用
date: 2018-12-21 11:28:06 +0800
categories: [Linux]
tags: [linux, shell, sh]
published: true
---

# windows 端口占用

```
>netstat -ano | findstr "8226"
  TCP    0.0.0.0:8226           0.0.0.0:0              LISTENING       17064

>tasklist|findstr "17064"
winrdlv3.exe                 17064 Services                   0     34,664 K
```

- 【使用管理员启动命令行】

```
> taskkill /f /t /im "winrdlv3.exe"
```

# linux 端口占用

## 服务是否存活查看

```
ps -ef | grep "服务名称"
```

用来查看某一个服务的进程是否存在。

## lsof

lsof(list open files)是一个列出当前系统打开文件的工具。

lsof 查看端口占用语法格式：

```
lsof -i:端口号
```

# netstat

netstat -tunlp 用于显示 tcp，udp 的端口和进程等相关情况。

## 语法

netstat 查看端口占用语法格式：

netstat -tunlp | grep 端口号
-t (tcp) 仅显示tcp相关选项
-u (udp)仅显示udp相关选项
-n 拒绝显示别名，能显示数字的全部转化为数字
-l 仅列出在Listen(监听)的服务状态
-p 显示建立相关链接的程序名

### 例子

例如查看 8000 端口的情况，使用以下命令：

```
# netstat -tunlp | grep 8000
tcp        0      0 0.0.0.0:8000            0.0.0.0:*               LISTEN      26993/nodejs   
```

更多命令：

```
netstat -ntlp   //查看当前所有tcp端口
netstat -ntulp | grep 80   //查看所有80端口使用情况
netstat -ntulp | grep 3306   //查看所有3306端口使用情况
```

# kill

在查到端口占用的进程后，如果你要杀掉对应的进程可以使用 kill 命令：

```
kill -9 PID
```

# 参考资料

[Linux tail 命令详解](https://www.cnblogs.com/fps2tao/p/7698224.html)

* any list
{:toc}