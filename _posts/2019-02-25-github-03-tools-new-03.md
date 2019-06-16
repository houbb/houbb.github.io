---
layout: post
title: Github 开源项目新的想法
date:  2019-2-25 14:33:11 +0800
categories: [Tool]
tags: [github, sh]
published: true
excerpt: Github 开源项目
---

# 编写中的框架

math-数学基础库

secret-加密算法库，放在【math】库之后实现。 

compress-可以指定是否生成文件。

# math

提供一个数学相关的工具库。

可以参考库：

1. apache-math

2. quant-math 

# 待重构框架

## gen-maven-plugin

这个框架拆分为两个框架：

1. 测试生成 (gen-test-plugin)   Done

2. 注释生成 (gen-comment-plugin)  Done

3. 文档生成 (idoc) Done

# 其他的想法

Babel 通天塔，用于语法翻译+i18N。

Sisyphus 重试模块 用于 rpc/mq 的重试。

结合 ===》Charming 生成格式化后的信息。

## 重试

重试模块应该添加缺失的入参信息。

文档的更新。

优化点：添加入参信息。

# 爬虫框架

## 命名

不同于原来的 crawl

新的名字，波塞冬（Poseidon）。寓意为广袤，黑暗，就像海里的章鱼一样。

行走在网络的海洋之中。

## 结合

尝试和 sisyphus 结合。

并且改良 sisyphus。

## 并行

尽可能保持线程安全。添加并发操作。

# csv

## 命名

就是用 csv

## 特性

csv 读取和生成框架。

默认不依赖注解。

（1）一期不支持 entry。后期可以考虑对象信息拉平。或者生成另外一个对象。

（2）支持生成排序。默认不排序，可以根据名称正序排列，倒叙排列。

（3）支持是否写入 utf-bom 

## 编写情况

v0.0.2 已完成。

# poseidon 

crawl 数据抓取框架。

v0.0.1 已完成。

* any list
{:toc}