---
layout: post
title: leetcode 算法篇专题之树 Tree 02-LC98. 验证二叉搜索树 validate-binary-search-tree
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

# 数据结构篇

## 通用基础

链表 

树

哈希表

stack 栈

graph 图

heap  堆

ordered set 有序集合

queue 队列

## 进阶

并查集

字典树

线段树

树状数组

后缀数组

# chat

https://leetcode.cn/studyplan/top-100-liked/


# LC98. 验证二叉搜索树

给你一个二叉树的根节点 root ，判断其是否是一个有效的二叉搜索树。

有效 二叉搜索树定义如下：

节点的左子树只包含 严格小于 当前节点的数。
节点的右子树只包含 严格大于 当前节点的数。
所有左子树和右子树自身必须也是二叉搜索树。
 

示例 1：

![1](https://assets.leetcode.com/uploads/2020/12/01/tree1.jpg)

输入：root = [2,1,3]
输出：true

示例 2：

![2](https://assets.leetcode.com/uploads/2020/12/01/tree2.jpg)

输入：root = [5,1,4,null,null,3,6]
输出：false
解释：根节点的值是 5 ，但是右子节点的值是 4 。
 

提示：

树中节点数目范围在[1, 10^4] 内
-2^31 <= Node.val <= 2^31 - 1

# 理解题意

二叉搜索树的中序遍历是升序序列，题目给定的数组是按照升序排序的有序数组，因此可以确保数组是二叉搜索树的中序遍历序列。

# v1-递归

## 思路

1）判断当前节点的 left right

2) 要求左右节点也满足

## 实现

```java
    public boolean isValidBST(TreeNode root) {
        if(root == null) {
            return true;
        }   

        int val = root.val;
        TreeNode left = root.left;     
        if(left != null) {
           if(left.val >= val) {
                return false;
           }     
        }
        TreeNode right = root.right;
        if(right != null) {
           if(right.val <= val) {
                return false;
           }     
        }

        // 递归判断左右
        return isValidBST(root.left) && isValidBST(root.right);
    }
```

## 效果

解答错误 77 / 86 个通过的测试用例

下面的场景是错误的

```
      5
     / \
    4   6
       / \
      3   7
```

这棵树在中是不是有效 BST，因为节点 3 在 6 的左子树，但 3 < 5，不满足 BST 规则（左子树所有节点 < 根节点）。

幽默的是发现多年前，也是错在了这个 CASE

> [面试算法力扣98-验证二叉搜索树](https://houbb.github.io/2020/06/08/algorithm-15-bst-valid)

圣斗士被一个招式打败了两次，可恶啊！

## 反思

这个要如何修正呢？

我们先定了上下界，不在范围内直接失败。

同时将以前的 min max 透传。

## 修正版本

```java
    public boolean isValidBST(TreeNode root) {
        return dfs(root, null, null);
    }

    private boolean dfs(TreeNode root, Integer min, Integer max) {
        if(root == null) {
            return true;
        }

        int val = root.val;

        // 必须小于 max
        if(max != null && val >= max) {
            return false;
        }

        // 必须大于 min
        if(min != null && val <= min) {
            return false;
        }

        // 递归判断左右
        return dfs(root.left, min, val) && dfs(root.right, val, max);
    }
```

### 效果

1ms 击败 23.73%

# v2-BFS 版本

## 思路

类似的，我们可以借助 queue 实现 BFS 版本

## 核心实现

```java
    public boolean isValidBST(TreeNode root) {
        if(root == null) {
            return true;
        }

        Queue<Tuple> queue = new LinkedList<>();
        queue.add(new Tuple(root, null, null));

        while (!queue.isEmpty()) {
            Tuple tuple = queue.poll();
            TreeNode node = tuple.node;
            Integer min = tuple.min;
            Integer max = tuple.max;

            int val = node.val;
            // 必须小于 max
            if(max != null && val >= max) {
                return false;
            }
            // 必须大于 min
            if(min != null && val <= min) {
                return false;
            }

            // 子节点继续判断
            if(node.left != null) {
                queue.offer(new Tuple(node.left, min, val));
            }
            if(node.right != null) {
                queue.offer(new Tuple(node.right, val, max));
            }
        }

        return true;
    }



    class Tuple {
        TreeNode node;
        Integer min;
        Integer max;

        public Tuple(TreeNode node, Integer min, Integer max) {
            this.node = node;
            this.min = min;
            this.max = max;
        }
    }
```


## 效果

3ms 击败 4.16%

# v3-中序遍历

## 思路

还记得 LC108 我们把升序数组转换为 BST 吗？

换言之，BST 的中序遍历一定是有序的，不然后不是合法的

## 实现

```java
    private Integer pre = null;
    public boolean isValidBST(TreeNode root) {
        if(root == null) {
            return true;
        }

        // 左
        boolean leftFlag  = isValidBST(root.left);

        // 中
        int val = root.val;
        if(pre != null && pre >= val) {
            return false;
        }
        pre = val;

        // 右边
        boolean rightFlag = isValidBST(root.right);

        return leftFlag && rightFlag;
    }
```

## 效果

0ms 100%

## 反思

这一题和 LC108 一起看，相得益彰。

# 在线可视化

> [二叉树遍历](https://houbb.github.io/leetcode-visual/binary-tree-travel.html)

* any list
{:toc} 