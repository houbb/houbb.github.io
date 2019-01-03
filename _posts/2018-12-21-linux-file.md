---
layout: post
title: linux file 命令
date: 2018-12-21 11:28:06 +0800
categories: [Linux]
tags: [linux, shell, sh]
published: true
excerpt: linux file 命令
---

# linux file

Linux file 命令用于辨识文件类型。

通过 file 指令，我们得以辨识该文件的类型。

## 语法

```
file [-bcLvz][-f <名称文件>][-m <魔法数字文件>...][文件或目录...]
```

## 参数解释

-b 列出辨识结果时，不显示文件名称。

-c 详细显示指令执行过程，便于排错或分析程序执行的情形。

`-f<名称文件>` 指定名称文件，其内容有一个或多个文件名称时，让file依序辨识这些文件，格式为每列一个文件名称。

-L 直接显示符号连接所指向的文件的类别。

`-m<魔法数字文件>` 指定魔法数字文件。

-v 显示版本信息。

-z 尝试去解读压缩文件的内容。

`[文件或目录...]` 要确定类型的文件列表，多个文件之间使用空格分开，可以使用shell通配符匹配多个文件。

# 案例

- file 

```
$ file application.2018-12-06-0.log 
application.2018-12-06-0.log: UTF-8 Unicode English text, with very long lines
```

# 参考资料

[Linux file 命令](https://www.cnblogs.com/fps2tao/p/7698224.html)

* any list
{:toc}