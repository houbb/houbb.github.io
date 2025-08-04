---
layout: post
title: leetcode 算法篇专题之分治 divide-and-conquer 01-入门介绍
date:  2020-6-8 15:13:08 +0800
categories: [Algorithm]
tags: [algorithm, data-struct, topics, leetcode, divide-and-conquer, sf]
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

# 算法篇

动态规划-记忆化搜索

递归

二分查找

DFS 深度优先遍历

BFS 广度优先遍历

回溯

贪心

分治：快排、归并

# chat

## 详细介绍一下力扣算法之分治

下面是对 **LeetCode（力扣）算法基础中的分治算法（Divide and Conquer）** 的详细介绍，涵盖原理、常见场景、经典题型与注意事项，帮你掌握这一重要算法思想。

---

## 🧠 一、什么是分治算法？

> **分治法（Divide and Conquer）是一种把问题分解成子问题，分别解决后再合并答案的算法思想。**

整个过程包括三个步骤：

1. **Divide（分解）**：将问题划分为多个子问题（通常是原问题的子规模版本）；
2. **Conquer（解决）**：递归地解决这些子问题；
3. **Combine（合并）**：将子问题的解合并，得到原问题的解。

### 通俗类比：

就像“田忌赛马”——把整体任务切成若干小任务，各个击破，最后组合得出全局结果。

---

## 🧩 二、分治算法的特征

| 特征            | 说明                  |
| ------------- | ------------------- |
| 子问题彼此 **独立**  | 各子问题互不影响（和“动态规划”不同） |
| 子问题结构 **相同**  | 与原问题结构一致，只是规模更小     |
| 解决方式 **递归优先** | 子问题通常递归解决           |

> 分治强调结构相似、独立递归、合并结果，是递归思想的进阶应用。

---

## ⚙️ 三、经典应用场景

| 场景   | 示例            |
| ---- | ------------- |
| 排序   | 快速排序、归并排序     |
| 计算类  | 大数乘法、逆序对、求幂   |
| 查找类  | 最近点对、二分查找     |
| 树操作  | 求深度、判断平衡树、构造树 |
| 数组问题 | 最大子数组和（分治版）   |

---

## 💡 四、和其他算法的对比

| 方法   | 子问题是否重叠    | 是否使用记忆化   | 常用结构 |
| ---- | ---------- | --------- | ---- |
| 分治   | ❌ 通常独立     | ❌ 不需要     | 递归、栈 |
| 动态规划 | ✅ 有重叠      | ✅ 需记忆     | 数组、表 |
| 回溯   | ❌ 独立探索多个路径 | ❌ 不记忆，但回溯 | 树、图  |

---

## 🔨 五、力扣常见题型与模板

---

### ✅ 1. **归并排序**

#### 🔗 [912. 排序数组](https://leetcode.cn/problems/sort-an-array/)

```java
public int[] sortArray(int[] nums) {
    mergeSort(nums, 0, nums.length - 1);
    return nums;
}

void mergeSort(int[] nums, int left, int right) {
    if (left >= right) return;
    int mid = (left + right) / 2;
    mergeSort(nums, left, mid);
    mergeSort(nums, mid + 1, right);
    merge(nums, left, mid, right);
}

void merge(int[] nums, int left, int mid, int right) {
    int[] tmp = new int[right - left + 1];
    int i = left, j = mid + 1, k = 0;
    while (i <= mid && j <= right)
        tmp[k++] = nums[i] < nums[j] ? nums[i++] : nums[j++];
    while (i <= mid) tmp[k++] = nums[i++];
    while (j <= right) tmp[k++] = nums[j++];
    for (int p = 0; p < tmp.length; p++) nums[left + p] = tmp[p];
}
```

---

### ✅ 2. **求逆序对个数**

#### 🔗 [493. 翻转对](https://leetcode.cn/problems/reverse-pairs/)

> 在归并排序中，统计左侧比右侧大的数量。

---

### ✅ 3. **二分查找**

#### 🔗 [704. 二分查找](https://leetcode.cn/problems/binary-search/)

二分本质是分治的最基础变形（规模减半）：

```java
public int search(int[] nums, int target) {
    int left = 0, right = nums.length - 1;
    while (left <= right) {
        int mid = (left + right) / 2;
        if (nums[mid] == target) return mid;
        else if (nums[mid] < target) left = mid + 1;
        else right = mid - 1;
    }
    return -1;
}
```

---

### ✅ 4. **树结构的分治处理**

#### 🔗 [124. 二叉树中的最大路径和](https://leetcode.cn/problems/binary-tree-maximum-path-sum)

递归处理左右子树，然后合并信息：

```java
int max = Integer.MIN_VALUE;

public int maxPathSum(TreeNode root) {
    dfs(root);
    return max;
}

int dfs(TreeNode node) {
    if (node == null) return 0;
    int left = Math.max(0, dfs(node.left));
    int right = Math.max(0, dfs(node.right));
    max = Math.max(max, left + right + node.val); // 更新最大路径
    return node.val + Math.max(left, right);
}
```

---

### ✅ 5. **大数快速幂**

#### 🔗 [50. Pow(x, n)](https://leetcode.cn/problems/powx-n/)

```java
public double myPow(double x, int n) {
    long N = n;
    return N >= 0 ? quickPow(x, N) : 1.0 / quickPow(x, -N);
}

double quickPow(double x, long n) {
    if (n == 0) return 1;
    double half = quickPow(x, n / 2);
    return n % 2 == 0 ? half * half : half * half * x;
}
```

---

## 🧱 六、分治的模板（递归通用框架）

```java
// 分治通用模板
ReturnType divideConquer(Problem problem) {
    if (problem is small enough) {
        return solveDirectly(problem); // base case
    }

    // Divide
    Problem[] subproblems = split(problem);

    // Conquer
    Result[] subresults = new Result[subproblems.length];
    for (int i = 0; i < subproblems.length; i++) {
        subresults[i] = divideConquer(subproblems[i]);
    }

    // Combine
    return merge(subresults);
}
```

---

## ⚠️ 七、使用分治的注意事项

| 易错点           | 建议                     |
| ------------- | ---------------------- |
| 合并逻辑写错        | 要特别注意 merge 阶段的边界和合并逻辑 |
| 递归深度过深        | 注意加缓存/剪枝避免栈溢出          |
| 适用性不对         | 子问题间强耦合的场景更适合用动态规划     |
| 不判断 base case | 要写清楚递归结束条件             |

---

## 📘 八、推荐刷题顺序

| 难度    | 题目                                                                         | 类型   |
| ----- | -------------------------------------------------------------------------- | ---- |
| 🟢 简单 | [704. 二分查找](https://leetcode.cn/problems/binary-search)                    | 基础分治 |
| 🟡 中等 | [912. 排序数组](https://leetcode.cn/problems/sort-an-array)                    | 归并排序 |
| 🟡 中等 | [50. Pow(x, n)](https://leetcode.cn/problems/powx-n)                       | 快速幂  |
| 🟡 中等 | [98. 验证二叉搜索树](https://leetcode.cn/problems/validate-binary-search-tree)    | 树结构  |
| 🔴 困难 | [124. 二叉树最大路径和](https://leetcode.cn/problems/binary-tree-maximum-path-sum) | 树形分治 |
| 🔴 困难 | [493. 翻转对](https://leetcode.cn/problems/reverse-pairs)                     | 归并变形 |

---

## ✅ 九、总结一句话

> **分治是一种分而治之的递归策略，适用于问题能被拆解、解法结构重复、子问题间互不依赖的场景。**

* any list
{:toc}