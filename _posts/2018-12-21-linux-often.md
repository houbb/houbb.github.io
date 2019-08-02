---
layout: post
title: linux often linux 常用命令
date: 2018-12-05 11:35:23 +0800
categories: [Linux]
tags: [linux, sh]
published: true
---

# 线上常用命令

## 查看端口占用

```
lsof -i:端口号
netstat  -anp  |grep   端口号
```

# 日志查看的方式

## 实时查看

```
tail -f XXX.log
```

## 完全打印

```
cat XXX.log
```

## vi 查看

[vi 常用命令]()

## 直接 grep 查看

```
grep -a 'XXXXX' application.log  
```

查询对应的信息

# grep 命令

grep指令用于查找内容包含指定的范本样式的文件，如果发现某文件的内容符合所指定的范本样式，预设grep指令会把含有范本样式的那一列显示出来。

若不指定任何文件名称，或是所给予的文件名为"-"，则grep指令会从标准输入设备读取数据。

## 排除对应的信息

```
$   less XXx.log | grep "keyword" | grep -v "excludes"
```

`-v` 可以指定排除的字段。

## 超时的查询

利用正则表达式查看相关的耗时

```
grep npay application.2019-06-27-0.log | egrep 'ELAPSED:[1-9][0-9][0-9][0-9]'
```

# Windows 可用命令行工具

[Xshell](https://www.netsarang.com/products/xsh_overview.html)

[Cmder](http://cmder.net/)

# 参考资料

[查看端口占用](https://www.cnblogs.com/hindy/p/7249234.html)


* any list
{:toc}