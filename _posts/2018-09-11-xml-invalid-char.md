---
layout: post
title: XML 非法字符
date:  2018-09-11 10:44:26 +0800
categories: [XML]
tags: [xml, error, todo, sf]
published: true
excerpt: XML 非法字符,PCDATA invalid Char value 8,非法字符 0X0
---

# 错误场景

`feed.xml` 出现两个非法字符。导致 xml 解析失败。感觉 js 出发非法字符的能力还是有些弱。

# PCDATA invalid Char value 8

`<0x08>` 这种东西，普通编辑器还是看不见的。

在 sublime 中可以看到。

# 非法字符 0X0

`{?}` 一个实心的符号，xml 解析直接就跪了。

手动找到并且删除的。

# 暂时处理方式

直接删除

# 参考资料

https://github.com/jankotek/mapdb

[怎样去除 XML 中像 ^H 等无效字符？ PCDATA invalid Char value 8](http://ju.outofmemory.cn/entry/31232)

* any list
{:toc}