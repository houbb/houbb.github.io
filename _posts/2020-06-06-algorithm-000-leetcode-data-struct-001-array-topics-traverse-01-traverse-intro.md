---
layout: post
title: leetcode 数组专题之数组遍历-01-遍历介绍
date:  2020-6-8 15:13:08 +0800
categories: [Algorithm]
tags: [algorithm, data-struct, topics, leetcode, array, traverse, sf]
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

# chat

| 分类      | 代表技巧              |
| ------- | ----------------- |
| 遍历类     | 遍历、双指针、滑窗         |
| 前缀/差分类  | 前缀和、差分、后缀数组       |
| 查找类     | 二分、哈希、离散化         |
| 空间/状态优化 | 状压、滚动数组、差分压缩      |
| 排序/归并类  | 排序、归并逆序对、树状数组、线段树 |
| 子数组/序列  | 动规、中心扩展、单调栈       |
| 矩阵类     | 二维差分、DFS/BFS、旋转模拟 |
| 特殊技巧    | 快速幂、滚动哈希、模拟题技巧    |


# 介绍一下数组的遍历类知识点

数组的遍历是处理数组问题的**最基础**也是**最核心**的操作。虽然“遍历”听起来很简单，但在算法题中，不同的遍历方式往往决定了**解题效率**和**思路选择**。

---

## 🧠 一句话理解

“遍历”就是“挨个走一遍”，但不同的目标和限制条件下，遍历的方式、顺序和控制手段都会发生变化。

---

## 🧩 常见数组遍历方式总览

| 遍历方式  | 简介          | 常用场景             |
| ----- | ----------- | ---------------- |
| 单指针遍历 | 从左到右或从右到左   | 基本统计、查找          |
| 双指针   | 两个指针控制窗口或方向 | 滑动窗口、快慢指针        |
| 枚举子数组 | 枚举所有起点+终点   | 子数组问题            |
| 倒序遍历  | 从后往前        | 处理依赖未来的数据        |
| 多重嵌套  | 多层遍历（如所有组合） | 暴力、枚举            |
| 跳跃遍历  | 步长不为 1      | 跳跃类问题（比如斐波那契/螺旋） |
| 模拟类遍历 | 遵循题目规则      | 旋转数组、消除、重排等      |

---

## ✅ 一、最常见的基本遍历

```java
int[] nums = {1, 2, 3, 4, 5};

// 从左到右
for (int i = 0; i < nums.length; i++) {
    System.out.println(nums[i]);
}

// 从右到左
for (int i = nums.length - 1; i >= 0; i--) {
    System.out.println(nums[i]);
}

// for-each
for (int num : nums) {
    System.out.println(num);
}
```

---

## ✅ 二、双指针遍历（重点）

### 🔹 1. 快慢指针（常用于去重、链表）

```java
// 删除有序数组中的重复元素
int slow = 0;
for (int fast = 1; fast < nums.length; fast++) {
    if (nums[fast] != nums[slow]) {
        slow++;
        nums[slow] = nums[fast];
    }
}
```

* 时间复杂度：O(n)
* 作用：原地去重、合并、过滤元素

### 🔹 2. 左右夹逼（常用于排序数组）

```java
int left = 0, right = nums.length - 1;
while (left < right) {
    int sum = nums[left] + nums[right];
    if (sum == target) return true;
    else if (sum < target) left++;
    else right--;
}
```

* 场景：数组已排序，寻找符合条件的一对数（如 2Sum）

---

## ✅ 三、滑动窗口遍历

动态控制一个窗口 `[left, right]` 的范围，同时处理窗口内的元素。

```java
int left = 0, sum = 0, res = Integer.MAX_VALUE;
for (int right = 0; right < nums.length; right++) {
    sum += nums[right];
    while (sum >= target) {
        res = Math.min(res, right - left + 1);
        sum -= nums[left++];
    }
}
```

* 适合题目：最短子数组、最多k种数、最长不重复子串等

---

## ✅ 四、枚举所有子数组/子序列

### 🔹 所有子数组 O(n²)

```java
for (int i = 0; i < n; i++) {
    int sum = 0;
    for (int j = i; j < n; j++) {
        sum += nums[j];
        // 子数组 nums[i..j]
    }
}
```

### 🔹 所有子序列（用回溯）O(2^n)

```java
void dfs(int[] nums, int idx, List<Integer> path) {
    // 某个子序列 path
    for (int i = idx; i < nums.length; i++) {
        path.add(nums[i]);
        dfs(nums, i + 1, path);
        path.remove(path.size() - 1);
    }
}
```

---

## ✅ 五、倒序遍历（动态更新时避免污染）

```java
// 比如：从后往前依赖未来值的 dp
for (int i = n - 2; i >= 0; i--) {
    nums[i] += Math.max(nums[i + 1], nums[i + 2]);
}
```

* 适合场景：有“未来”依赖的数据变化，比如房屋打劫问题、股票交易

---

## ✅ 六、按规则模拟遍历

比如题目要求数组“旋转”、“跳跃”、“反转”，“模拟蛇形走位”等。

### 🔹 例：旋转数组

```java
// 将数组向右移动k步
Collections.reverse(nums, 0, n-1);
Collections.reverse(nums, 0, k-1);
Collections.reverse(nums, k, n-1);
```

或者按下标规律填充新数组（模拟移动）

---

## ✅ 七、其他：跳跃、螺旋、循环

### 🔹 LeetCode 54 螺旋矩阵

```java
// 控制方向：右、下、左、上，遍历顺序变化
int[][] dirs = {
    {0,1},{1,0},{0,-1},{-1,0}
    };
```

### 🔹 LeetCode 45 跳跃游戏 II

```java
// 控制每次能跳的范围 + 最远跳到哪
```

---

## 🎯 常见遍历技巧 + 力扣题目对照表

| 技巧    | 力扣题目         | 说明       |
| ----- | ------------ | -------- |
| 基础遍历  | 27.移除元素      | 直接遍历+判断  |
| 快慢指针  | 26. 删除重复项    | 原地去重     |
| 左右夹逼  | 167.两数之和 II  | 排序+夹逼    |
| 滑动窗口  | 209. 长度最小子数组 | 动态控制窗口   |
| 子数组枚举 | 560. 和为K的子数组 | 前缀和优化    |
| 子序列枚举 | 491. 递增子序列   | 回溯       |
| 倒序遍历  | 198. 打家劫舍    | 动态规划     |
| 规则模拟  | 54. 螺旋矩阵     | 控制方向循环遍历 |

---

## ✅ 总结一句话

> “数组遍历”不仅是循环走一遍，更是一种策略：你是在找目标？排除无效？更新最优？用滑动窗口？用状态压缩？还是模拟过程？搞清楚目的，才能选对遍历方式！

* any list
{:toc}