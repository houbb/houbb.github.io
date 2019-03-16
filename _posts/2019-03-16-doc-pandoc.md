---
layout: post
title: PanDoc-文档类型转换神器
date:  2019-3-16 12:15:10 +0800
categories: [Doc]
tags: [doc, markdown, tool, sh]
published: true
---

# 情景引入

手写了一个生成 markdown 格式文档的工具。

但是公司有时候需要 word 类型的文档，有时候我们又需要 pdf 格式的文档。

## 方式一：自己造轮子

为每一种转换都写一种实现，但是很消耗时间。

而且看了 word 的相关生成，也不是很友好。

会导致迭代周期变得非常长。

## 方式二：让专业的人做专业的事

以前使用过 Typora 等 md 编辑器，知道 markdown 可以导出各种类型的文件。

我就没必要再重复一次。

# PanDoc

Typora 等诸多文件的转换，底层都是使用了 PanDoc

## 简介

[PanDoc](https://github.com/jgm/pandoc) is a Haskell library for converting from one markup format to another, and a command-line tool that uses this library.

# 入门使用

## 安装

直接 [Github](https://github.com/jgm/pandoc/releases) 上下载对应的 release 版本。

或者去官网下载。

安装比较简答，不赘述。

## 测试

```
$   pandoc -i XXX.md -o XXX.docx
```

-i 表示输入文件

-o 表示输出文件

# 其他

## Typora

如果你不想使用命令行，可以尝试 [Typora](https://www.typora.io/)

## Writage

[writage](http://www.writage.com/) 是一款 office word 插件。

用于 word 和 markdown 之间的转换比较方便。

# 思考

## 不忘初心

本来想写一个文档，总是被各种技术和眼界限制。

觉得最初的目的不要忘记了。

## 核心竞争力

自己把各种都实现，其实是 ROI 很低的一件事情。

专业的事情已经有人做了，我们只需要使用即可。

社会分工协作，方能完成大事。

* any list
{:toc}