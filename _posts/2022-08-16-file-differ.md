---
layout: post
title:  文件差异对比 diff sort uniq  java-diff-utils 文件差异对比
date:  2022-08-12 09:22:02 +0800
categories: [Tool]
tags: [compare, differ, sh]
published: true
---

# 业务需求

为每一个实体标注信息，其他部门提供一个全量的文件。

# V1 基本思路

直接遍历全量的文件。

发现性能比较差，要跑很久才能完成。

# V2 多线程

使用多线程

性能基本可以接受，但是数据库压力还是比较大的。

# V3 文件差异

结合业务，其实一般情况下，实体的标准信息，并不会轻易的变化。

那么，只处理差异的部分显然性能会更好。

## 差异文件如何获取？

可以让文件的提供者对比文件差异。

如果对方不允许的话，那么可以自行对比。

## linux 

最简单的思路，可以通过 linux 的命令对比差异。

java 可以通过 command 命令调用 linux 的命令。

sort

diff

uniq

可以把两个文件中差异的部分输出到指定的文件。

## java 程序

后端程序当然也可以实现文件差异。

但是这里存在一个问题：

如果文件特别大，比如 1000W 对比 1000W。

如何对比？

如何保证性能？


# java diff 实现

java 的文件差异对比。

差异策略：文本 A/B 进行对比。





# 小结

多思考。

# 参考资料

[Java 文本内容差异对比实现介绍](https://blog.csdn.net/qq_33697094/article/details/121681707)

* any list
{:toc}