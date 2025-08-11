---
layout: post
title: leetcode 算法篇专题之树 Tree 02-LC437. 路径总和 III path-sum-iii
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

# LC437. 路径总和 III path-sum-iii

给定一个二叉树的根节点 root ，和一个整数 targetSum ，求该二叉树里节点值之和等于 targetSum 的 路径 的数目。

路径 不需要从根节点开始，也不需要在叶子节点结束，但是路径方向必须是向下的（只能从父节点到子节点）。

示例 1：

![示例 1](https://assets.leetcode.com/uploads/2021/04/09/pathsum3-1-tree.jpg)

输入：root = [10,5,-3,3,2,null,11,3,-2,null,1], targetSum = 8
输出：3
解释：和等于 8 的路径有 3 条，如图所示。

示例 2：

输入：root = [5,4,8,11,null,13,4,7,2,null,null,5,1], targetSum = 22
输出：3
 
提示:

二叉树的节点个数的范围是 [0,1000]
-10^9 <= Node.val <= 10^9 
-1000 <= targetSum <= 1000 


# v1-递归

## 思路

如果这一题要求必须从根节点出发（而且路径方向向下），那么实现会变成什么样？

最经典的思路如下：

1) 终止条件 root==null

2) 业务逻辑

count 代表符合条件的数量

```java
count = 0;
if(root.val == targetSum) {
    count++;
}
```

3) 子节点递归

```java
// 累加左+右
count += pathSum(root.left, targetSum-root.val);
count += pathSum(root.right, targetSum-root.val);
```

### 核心代码

```java
public int pathSum(TreeNode root, int targetSum) {
        if(root == null) {
            return 0;
        }
        int count = 0;
        if(root.val == targetSum) {
            count++;
        }

        // 累加左+右
        count += pathSum(root.left, targetSum-root.val);
        count += pathSum(root.right, targetSum-root.val);

        return count;
}
```

## 调整

因为本题要求可以从任意节点出发，所以我们可以调整下，加上 root.left, root.right 作为出发点，也就是任意节点。

### 实现

dfs 计算以节点作为根的全部路径

pathSum 是任意节点，左右的任意。

```java
    public int pathSum(TreeNode root, int targetSum) {
        if(root == null) {
           return 0;     
        }

        return dfs(root, targetSum) + pathSum(root.left, targetSum) + pathSum(root.right, targetSum);
    }

    public int dfs(TreeNode root, int targetSum) {
        if(root == null) {
            return 0;
        }
        int count = 0;
        if(root.val == targetSum) {
            count++;
        }

        // 累加左+右
        count += dfs(root.left, targetSum-root.val);
        count += dfs(root.right, targetSum-root.val);

        return count;
    }
```

### 效果

解答错误 129 / 130 个通过的测试用例

```
输入
root = [1000000000,1000000000,null,294967296,null,1000000000,null,1000000000,null,1000000000]
targetSum = 0

输出 2
预期结果 0
```

为什么？

数字特别大，1000000000（10^9）级别的节点值，在路径求和的时候，多个节点相加会超过 int 的范围（Java int 最大值是 2,147,483,647），
一旦溢出，就会变成负数或者乱值，导致判断出错。

服了这个 CASE，我们把类型改为 long 来判断

### 修正

`dfs(TreeNode root, long targetSum)` 第二个参数改为 long 即可，其他不变

36ms 击败 35.29%

复杂度最差 O(n^2)，退化成为链表。

# v2-前缀和

## 思路

LC124 求得是任意两个节点中间的和是否等于 target，我虽然想到了前缀和，但是前缀和数组如何构建呢?

这一题还涉及到回溯，某种角度而言，过于全面了。

* 在遍历过程中，维护一个 当前路径和 currSum。
* 用 `Map<sum, count>` 记录当前路径上 前缀和 sum 出现的次数。
* 对于每个节点：

  1. 计算 `currSum`。
  2. 要找的目标区间和是 `currSum - targetSum`，如果这个值在 map 里，说明存在从某个祖先到当前节点的路径和为 target。
  3. 把当前 `currSum` 放入 map。
  4. 递归左右子树。
  5. 回溯时，把当前 `currSum` 在 map 中的计数减一。

## 实现

```java
    public int pathSum(TreeNode root, int targetSum) {
        Map<Long, Integer> prefixSumCount = new HashMap<>();
        // 标记着从 直接从起点累积到目标这种 CASE
        prefixSumCount.put(0L, 1);

        return dfs(root, 0, targetSum, prefixSumCount);
    }

    public int dfs(TreeNode root, long curSum, long targetSum, Map<Long, Integer> prefixSumCount) {
        if(root == null) {
            return 0;
        }

        // 更新
        curSum += root.val;

        // 从 map 中查找对应的值
        // 找到前面符合的路径有多少，直接+就行
        int res = prefixSumCount.getOrDefault(curSum - targetSum, 0);

        // 更新前缀和: 说明符合这个数据的路径+1
        prefixSumCount.put(curSum, prefixSumCount.getOrDefault(curSum, 0) + 1);

        // 累加左+右
        res += dfs(root.left, curSum, targetSum, prefixSumCount);
        res += dfs(root.right, curSum, targetSum, prefixSumCount);

        // 回溯 curSum 这个总数-1
        prefixSumCount.put(curSum, prefixSumCount.get(curSum)-1);

        return res;
    }
```

## 效果

3ms 击败 99.96%

## 反思

前缀和这个性能好很多，复杂度 O(n)。



# 参考资料

https://leetcode.cn/studyplan/top-100-liked/

* any list
{:toc} 
