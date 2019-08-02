---
layout: post
title: linux uniq 去重统计
date: 2018-12-05 11:35:23 +0800
categories: [Linux]
tags: [vim, linux, sh]
published: true
---

# uniq 

## 作用

Linux uniq 命令用于检查及删除文本文件中重复出现的行列，一般与 sort 命令结合使用。

uniq 可检查文本文件中重复出现的行列。

## 语法

```
uniq [-cdu][-f<栏位>][-s<字符位置>][-w<字符位置>][--help][--version][输入文件][输出文件]
```

## 参数

```
-c或--count 在每列旁边显示该行重复出现的次数。
-d或--repeated 仅显示重复出现的行列。
-f<栏位>或--skip-fields=<栏位> 忽略比较指定的栏位。
-s<字符位置>或--skip-chars=<字符位置> 忽略比较指定的字符。
-u或--unique 仅显示出一次的行列。
-w<字符位置>或--check-chars=<字符位置> 指定要比较的字符。
--help 显示帮助。
--version 显示版本信息。
[输入文件] 指定已排序好的文本文件。如果不指定此项，则从标准读取数据；
[输出文件] 指定输出的文件。如果不指定此选项，则将内容显示到标准输出设备（显示终端）。
```

## 注意

若域中为先空字符(通常包括空格以及制表符)，然后非空字符，域中字符前的空字符将被跳过。
 
提示：uniq 不会检查重复的行，除非它们是相邻的行。

如果您想先对输入排序，使用没有uniq 的"sort -u"。


# 案例

## 统计异常信息

- 命令

```
egrep -o  'Exception.*' application.2019-08-02-*.log | sort | uniq -c
```

- 异常信息统计

```
      1 Exception: No connection for service: xxx
      3 Exception: null
      5 ExceptionProcessFilter.invoke(ExceptionProcessFilter.java:26) [pegasus-server-1.0.2.jar:na]
      5 ExceptionProcessFilter.invoke(ExceptionProcessFilter.java:38) [pegasus-server-1.0.2.jar:na]
    631 Exception redis.clients.jedis.exceptions.JedisException: Could not get a resource from the pool
     80 Exception...redis.clients.jedis.exceptions.JedisException: Could not get a resource from the pool
      1 Exception: **********remote service call timeout::: host:172.31.14.221:8438***********
```

# 参考资料

[Linux uniq命令详解](https://www.cnblogs.com/ftl1012/p/uniq.html)


* any list
{:toc}