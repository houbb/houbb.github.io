---
layout: post
title: 【leetcode】013-25. K 个一组翻转链表 Reverse Nodes in k-Group
date:  2020-6-8 15:13:08 +0800
categories: [Algorithm]
tags: [Algorithm, list, leetcode, sf]
published: true
---

# 25. K 个一组翻转链表

给你链表的头节点 head，每 k 个节点一组进行翻转，请你返回修改后的链表。

k 是一个正整数，它的值小于或等于链表的长度。

如果节点总数不是 k 的整数倍，那么请将最后剩余的节点保持原有顺序。

你不能只是单纯的改变节点内部的值，而是需要实际进行节点交换。

## 示例
 
示例 1：

```
输入：head = [1,2,3,4,5], k = 2
输出：[2,1,4,3,5]
```

示例 2：


```
输入：head = [1,2,3,4,5], k = 3
输出：[3,2,1,4,5]
``` 

## 提示：

链表中的节点数目为 n

1 <= k <= n <= 5000

0 <= Node.val <= 1000

进阶：你可以设计一个只用 O(1) 额外内存空间的算法解决此问题吗？



# 开源地址

为了便于大家学习，所有实现均已开源。欢迎 fork + star~

> [https://github.com/houbb/leetcode](https://github.com/houbb/leetcode)

# 参考资料

https://leetcode.cn/problems/reverse-nodes-in-k-group/

* any list
{:toc}