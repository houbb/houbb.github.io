---
layout: post
title: Binary Tree
date:  2018-11-7 19:19:25 +0800
categories: [Data Struct]
tags: [data-struct, sh]
published: true
excerpt: 数据结构之二叉树
---

# 二叉树

二叉树是树的一种，每个节点最多可具有两个子树，即结点的度最大为2（结点度：结点拥有的子树数）。


# 常见的二叉树

## 斜树

所有结点都只有左子树，或者右子树。

## 满二叉树

所有的分支节点都具有左右节点。

## 完全二叉树

若设二叉树的深度为h，除第 h 层外，其它各层 (1～h-1) 的结点数都达到最大个数，第 h 层所有的结点都连续集中在最左边，这就是完全二叉树。


# 二叉树的性质

1. 二叉树第i层上的结点数目最多为 2^(i-1) (i≥1)

2. 深度为h的二叉树至多有2^h-1个结点(h≥1)

3. 包含n个结点的二叉树的高度至少为log2 (n+1)

4. 在任意一棵二叉树中，若终端结点的个数为n0，度为2的结点数为n2，则n0=n2+1


# 代码实现

# 遍历方式

## 前序遍历

## 中序遍历

## 后序遍历

## 层级遍历

# 想法

打印输出一个 ASCII 的树。

# 参考资料

https://zh.wikipedia.org/wiki/%E4%BA%8C%E5%8F%89%E6%A0%91

[二叉树的基本概念和实现](http://ccc013.github.io/2016/08/18/%E4%BA%8C%E5%8F%89%E6%A0%91%E7%9A%84%E5%9F%BA%E6%9C%AC%E6%A6%82%E5%BF%B5%E5%92%8C%E5%AE%9E%E7%8E%B0/)

[数据结构与算法](https://blog.csdn.net/google19890102/article/details/53926704)

[二叉树及其拓展可以解决什么问题？](https://www.zhihu.com/question/37381035)

[算法 10：二叉树](http://wiki.jikexueyuan.com/project/easy-learn-algorithm/binary-tree.html)

[二叉树操作（面试必备）](https://segmentfault.com/a/1190000008850005)

[完美二叉树, 完全二叉树和完满二叉树](https://www.cnblogs.com/idorax/p/6441043.html)

* any list
{:toc}