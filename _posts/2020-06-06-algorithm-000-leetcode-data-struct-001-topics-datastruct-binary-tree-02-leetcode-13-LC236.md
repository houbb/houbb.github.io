---
layout: post
title: leetcode 算法篇专题之树 Tree 02-LC236. 二叉树的最近公共祖先 lowest-common-ancestor-of-a-binary-tree
date:  2020-6-8 15:13:08 +0800
categories: [Algorithm]
tags: [algorithm, data-struct, topics, leetcode, tree, binary-tree, sf]
published: true
---


# 数组

大家好，我是老马。

今天我们一起来学习一下数组这种数据结构。

## 主要知识

数组需要拆分下面几个部分：

1. 理论介绍

2. 源码分析

3. 数据结构实现？

4. 题目练习（按照算法思想分类）

5. 梳理对应的 sdk 包

6. 应用实战

因为这个是 leetcode 系列，所以重点是 4、5(对4再一次总结)。

为了照顾没有基础的小伙伴，会简单介绍一下1的基础理论。

简单介绍1，重点为4。其他不是本系列的重点。

# LC236. 二叉树的最近公共祖先 lowest-common-ancestor-of-a-binary-tree

给定一个二叉树, 找到该树中两个指定节点的最近公共祖先。

百度百科中最近公共祖先的定义为：“对于有根树 T 的两个节点 p、q，最近公共祖先表示为一个节点 x，满足 x 是 p、q 的祖先且 x 的深度尽可能大（一个节点也可以是它自己的祖先）。”

示例 1：

![1](https://assets.leetcode.com/uploads/2018/12/14/binarytree.png)

输入：root = [3,5,1,6,2,0,8,null,null,7,4], p = 5, q = 1
输出：3
解释：节点 5 和节点 1 的最近公共祖先是节点 3 。

示例 2：

![2](https://assets.leetcode.com/uploads/2018/12/14/binarytree.png)

输入：root = [3,5,1,6,2,0,8,null,null,7,4], p = 5, q = 4
输出：5
解释：节点 5 和节点 4 的最近公共祖先是节点 5 。因为根据定义最近公共祖先节点可以为节点本身。


示例 3：

输入：root = [1,2], p = 1, q = 2
输出：1
 

提示：

树中节点数目在范围 [2, 10^5] 内。
-10^9 <= Node.val <= 10^9
所有 Node.val 互不相同 。
p != q
p 和 q 均存在于给定的二叉树中。

# v1-递归


## 核心流程

1. 终止条件：

   * 如果当前节点 `root` 是 `null`，说明到达叶子节点的下一层，返回 `null`，表示没找到。
   * 如果当前节点就是 `p` 或 `q`，说明找到了其中一个节点，直接返回该节点。

2. 递归遍历左右子树：

   * 递归调用左子树，寻找 `p` 或 `q`。
   * 递归调用右子树，寻找 `p` 或 `q`。

3. 判断返回结果：

   * 如果左右子树都返回非空（`leftNode != null && rightNode != null`），说明 `p` 和 `q` 分别位于当前节点的两边，当前节点 `root` 就是它们的最近公共祖先。
   * 如果只有一边非空，说明两个节点都在这一边，返回非空那边的结果。
   * 如果两边都是空，返回空。

算法通过递归的方式从下往上找，当左右子树各自找到一个目标节点时，当前节点即为最近公共祖先。如果两个节点都在一侧，就沿着该侧继续向上返回找到的节点。

## 实现

```java
    public TreeNode lowestCommonAncestor(TreeNode root, TreeNode p, TreeNode q) {
        if(root == null) {
            return null;
        }

        // 如果二者就是 root
        if(root == p || root == q) {
            return root;
        }

        // 递归找最近的子树
        TreeNode leftNode = lowestCommonAncestor(root.left, p, q);
        TreeNode rightNode = lowestCommonAncestor(root.right, p, q);

        //看二者的位置
        // 两边
        if(leftNode != null && rightNode != null) {
            return root;
        }

        // 单边
        if(leftNode != null) {
            return leftNode;
        }
        return rightNode;
    }
```

## 效果

7ms 99.72%

## 为什么这么做是对的？

### 为什么递归向下找，最终返回的就是最近公共祖先？

我们来看这个递归过程的核心逻辑：

#### 1. 递归从根节点开始往下走：

* 在每个节点，递归去左右子树找 `p` 或 `q`。
* 返回值是“在当前子树里找到的 `p` 或 `q` 节点”或者`null`（没找到）。

#### 2. 三种可能的返回情况：

最核心的其实就下面的 3 个场景：

* 都没找到（左、右子树都返回null）：说明当前子树里没有 `p` 和 `q`，返回 `null`。
* 只在一边找到（左或右返回非空）：说明 `p` 和 `q` 都在该子树中（或者其中一个刚好是当前节点），返回找到的那个节点。
* 两边都找到（左右都返回非空）：说明 `p`、`q` 分别在当前节点的两边，当前节点正是它们的最近公共祖先。

#### 3. 为什么“两个节点分别在左右子树”时，当前节点就是最近公共祖先？

* 公共祖先定义： 最近公共祖先是路径上离两个节点最近的那个公共节点。
* 如果 `p`、`q` 分别在左右子树，那么它们的路径必定通过当前节点，且当前节点是最靠近它们的公共节点了。
* 因为如果更低层有公共祖先，两个节点不会分开在左右子树，而会都在同一侧。

#### 4. 为什么返回 `p` 或 `q` 节点本身？

* 如果当前节点是 `p` 或 `q`，说明至少找到了一个目标节点，可以把它往上返回。
* 这样父节点知道“我这边找到了一个目标节点”。
* 递归最终会找到两个目标节点的位置。

# 参考资料

https://leetcode.cn/studyplan/top-100-liked/

* any list
{:toc} 
