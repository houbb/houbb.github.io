---
layout: post
title: leetcode 算法篇专题之树 Tree 02-LC124. 二叉树中的最大路径和 binary-tree-maximum-path-sum
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

# LC124 二叉树中的最大路径和

二叉树中的 路径 被定义为一条节点序列，序列中每对相邻节点之间都存在一条边。

同一个节点在一条路径序列中 至多出现一次 。该路径 至少包含一个 节点，且不一定经过根节点。

路径和 是路径中各节点值的总和。

给你一个二叉树的根节点 root ，返回其 最大路径和 。

示例 1：

![1](https://assets.leetcode.com/uploads/2020/10/13/exx1.jpg)

输入：root = [1,2,3]
输出：6
解释：最优路径是 2 -> 1 -> 3 ，路径和为 2 + 1 + 3 = 6

示例 2：

![2](https://assets.leetcode.com/uploads/2020/10/13/exx2.jpg)

输入：root = [-10,9,20,null,null,15,7]
输出：42
解释：最优路径是 15 -> 20 -> 7 ，路径和为 15 + 20 + 7 = 42
 

提示：

树中节点数目范围是 [1, 3 * 10^4]
-1000 <= Node.val <= 1000


# v1-递归

## 思路

1) 全局 max 记录最大值

2）终止条件 node == null

3) 核心逻辑

函数：dfs 返回以节点出发时，单边的最大值。

最大值=val + maxLeft + maxRight

最后返回 val + max(left, right) 单边的值

## 实现

```java
    private long max = Long.MIN_VALUE;

    public int maxPathSum(TreeNode root) {
        dfs(root);
        return (int)max;
    }

    // 以当前节点作为根节点的单边最大值
    public long dfs(TreeNode root) {
        if(root == null) {
            return 0;
        }

        // 左边最大
        long leftMax = Math.max(dfs(root.left), 0);
        // 右边最大
        long rightMax = Math.max(dfs(root.right), 0);

        // 当前节点最大值
        long curMax = root.val + leftMax + rightMax;
        if(max < curMax) {
            max = curMax;
        }

        // 返回时，只能返回单边的最大值 避免递归混乱
        return root.val + Math.max(leftMax, rightMax);
    }
```

## 效果

1ms 击败 48.62%

# v2-双栈模拟

## 思路

1. 目标：实现后序遍历「先访问左右子节点，最后访问根节点」的顺序

   * 递归中后序遍历是自然实现，但迭代中单栈模拟后序遍历较复杂。
   * 使用两个栈，可以简洁高效地实现后序遍历顺序。

2. 使用两个栈：

   * 第一个栈（stack1）用于遍历树节点

     * 初始时把根节点压入 stack1。
     * 取出栈顶节点，将其压入第二个栈（stack2）。
     * 先将左子节点压入 stack1，再将右子节点压入 stack1。
     * 这样 stack2 中节点的顺序即为后序遍历顺序（左右根）。

   * 第二个栈（stack2）保存后序遍历的节点顺序

     * 等第一个栈遍历完成后，stack2 中的节点顺序是后序遍历顺序（从根到叶的逆序）。
     * 通过弹出 stack2 中的节点，可以按后序遍历顺序处理每个节点。

3. 利用后序遍历顺序计算最大路径和

   * 从 stack2 中依次弹出节点。
   * 利用哈希表存储每个节点的「单边最大路径和」（即递归返回值）。
   * 计算当前节点的最大路径和时，需要左右子节点的单边最大路径和（从哈希表获得）。
   * 更新全局最大路径和变量。
   * 将当前节点的单边最大路径和（当前节点值 + 左右单边路径最大值中较大者）存入哈希表，供父节点使用。

## 实现

```java
public int maxPathSum(TreeNode root) {
        if (root == null) return 0;

        // stack1 用于遍历树，模拟后序遍历的顺序
        Stack<TreeNode> stack1 = new Stack<>();
        // stack2 用于存储后序遍历节点的顺序，方便后续倒序处理
        Stack<TreeNode> stack2 = new Stack<>();
        stack1.push(root);

        // 1. 第一次遍历，把节点按后序遍历顺序存到 stack2
        while (!stack1.isEmpty()) {
            TreeNode node = stack1.pop();
            stack2.push(node);
            // 先压左节点，后压右节点，保证 stack2 是后序顺序
            if (node.left != null) stack1.push(node.left);
            if (node.right != null) stack1.push(node.right);
        }

        // 用哈希表存储每个节点的单边最大路径和（向下延伸）
        Map<TreeNode, Long> singlePathSum = new HashMap<>();
        long max = Long.MIN_VALUE;

        // 2. 倒序处理 stack2，真正从叶子节点向上计算
        while (!stack2.isEmpty()) {
            TreeNode node = stack2.pop();

            // 左子节点最大单边路径和，负数则视为0（不选取）
            long leftMax = node.left == null ? 0 : Math.max(singlePathSum.get(node.left), 0);
            // 右子节点最大单边路径和，负数则视为0
            long rightMax = node.right == null ? 0 : Math.max(singlePathSum.get(node.right), 0);

            // 当前节点为根的最大路径和（包括左右子树）
            long currMax = node.val + leftMax + rightMax;
            max = Math.max(max, currMax);

            // 返回给父节点的最大单边路径和（只能选择左边或右边）
            singlePathSum.put(node, node.val + Math.max(leftMax, rightMax));
        }

        return (int) max;
    }
```

## 效果

21ms 击败 2.94%

## 反思

整体而言，本地递归是最佳解法。

更容易理解+记忆。

# 参考资料

https://leetcode.cn/studyplan/top-100-liked/

* any list
{:toc} 
