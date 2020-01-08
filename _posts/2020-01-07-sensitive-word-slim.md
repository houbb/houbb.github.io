---
layout: post
title: java 敏感词之字典瘦身
date:  2020-1-7 10:09:32 +0800
categories: [Java]
tags: [java, github, sensitive, sf]
published: true
---

# 背景

默认收集的敏感词字典，实际上有非常多的重复信息。

比如说：

```
兼职
兼!职
兼@职
兼#职
兼￥职
```

这种最核心的内容其实只有一个，如果将全部的停止词进行穷尽的话，将会使得敏感词构建的 Map 变得非常大，而且也没办法穷尽。

这种全部存储的方式非常的不灵活。

## 目的

所以这一节将停止词作为单独的内容，进行相关的处理。

核心目的如下：

（1）为敏感词库瘦身

（2）为后期 stop-word 支持做好准备工作。

# 优化思路

## 格式统一化

1. 将所有的大写字母统一转换为小写

2. 将所有的全角转换为半角

3. 移除所有【空格】【符号】(这个就是各种符号的过滤了)

4. 繁体字统一转换为简体字

最后保证信息的去重。

## 移除大量的信息

1. 移除 QQ 号的类似数字

2. 移除所有网址（.com、cn、.org）

3. 移除纯英文

4. 移除乱码 `�`

备份相关信息。

## 停止词优化

移除文中的纯数字。

比如

```
12 岁
13 岁
14 岁
15 岁
```

只是数字的不同，最后的结果也可以同化为一个。

## 拼音优化

比如伊拉克

ylk

yilake

这些都可以直接规为一个中文即可。

## 数字优化

123456789

一二三四五六七

其他各种标记都可以归一为相同的。

## 词语翻转

比如：毒品=》【品毒】

这个对于 DFA 算法而言可能不那么友好。

最后可以考虑实现，或者在构建的时候就直接构建。

拼音同理。

## 重复词语

比如 fffuuuccckkk

# v0.0.3 效果

第一步将数字从 18W 降低到 6w

后续将对数字类的进行优化处理。

## 数据下载

[原始全量.txt](https://github.com/houbb/sensitive-word/releases/download/dict_slim/dict.txt)

[格式化去重.txt](https://github.com/houbb/sensitive-word/releases/download/dict_slim/dict_format.txt)

[移除优化.txt](https://github.com/houbb/sensitive-word/releases/download/dict_slim/dict_remove.txt)

## 下一步优化方案

基于数字的转换去重


* any list
{:toc}