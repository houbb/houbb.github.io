---
layout: post
title: leetcode 算法篇专题之贪心 Greedy 01-入门介绍
date:  2020-6-8 15:13:08 +0800
categories: [Algorithm]
tags: [algorithm, data-struct, topics, leetcode, greedy, sf]
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

## 详细介绍一下力扣算法之贪心

下面是对 LeetCode（力扣）中\*\*贪心算法（Greedy Algorithm）\*\*的详细讲解，帮助你全面理解它的核心思想、常见模型、题目套路与易错点。

## 🧠 一、什么是贪心算法？

> **贪心算法是一种在每一步都选择当前状态下最优解的方法**，希望通过一系列局部最优，达到全局最优或近似最优。

它不回溯、不穷举，而是「眼前利益优先」。

---

## 📌 二、贪心算法的核心思想

1. **局部最优 -> 全局最优**：每次都做当前看来最好的选择；
2. **不可回退**：一旦做出选择，不能后悔；
3. **适用前提**：问题必须满足**贪心选择性质**和**最优子结构**。

> 不像动态规划那样保留历史状态，贪心走的是轻装上阵的思路。

---

## ⚙️ 三、贪心常见应用模型

| 模型类型  | 说明                 | 示例题目                                                                         |
| ----- | ------------------ | ---------------------------------------------------------------------------- |
| 区间调度  | 按结束时间排序来选不重叠的区间    | [435. 无重叠区间](https://leetcode.cn/problems/non-overlapping-intervals)         |
| 最少操作  | 优先消除最重的/影响最大的部分    | [621. 任务调度器](https://leetcode.cn/problems/task-scheduler)                    |
| 字符串构造 | 按字典序、频率等贪心取值       | [406. 根据身高重建队列](https://leetcode.cn/problems/queue-reconstruction-by-height) |
| 钱币找零  | 优先用面值大的硬币（前提满足最优性） | [322. 零钱兑换（需DP）](https://leetcode.cn/problems/coin-change)                   |
| 跳跃问题  | 尽可能跳得远             | [55. 跳跃游戏](https://leetcode.cn/problems/jump-game)                           |
| 区间合并  | 按起点/终点排序，合并重叠区间    | [56. 合并区间](https://leetcode.cn/problems/merge-intervals)                     |
| 分配问题  | 优先满足最小需求者          | [455. 分发饼干](https://leetcode.cn/problems/assign-cookies)                     |

---

## ✨ 四、贪心算法常用套路

### 1️⃣ 按关键属性排序

排序是贪心的标配，常见排序规则：

* 按结束时间从小到大（区间选择）
* 按字典序从大到小（构造字符串）
* 按容量/需求从小到大（分配资源）

示例：

```java
// 以区间右端点升序
Arrays.sort(intervals, (a, b) -> a[1] - b[1]);
```

---

### 2️⃣ 贪心选取或跳过

* 不需要记录所有状态，只要一步步“抢”；
* 选中后无需考虑回溯，继续下一步。

---

## 💡 五、LeetCode 高频题型分类讲解

### ✅ 1. 跳跃问题

#### [55. 跳跃游戏](https://leetcode.cn/problems/jump-game/)

判断能否跳到最后一个位置。

**贪心策略**：维护当前能跳的最远距离。

```java
public boolean canJump(int[] nums) {
    int farthest = 0;
    for (int i = 0; i < nums.length; i++) {
        if (i > farthest) return false;
        farthest = Math.max(farthest, i + nums[i]);
    }
    return true;
}
```

---

### ✅ 2. 区间问题

#### [435. 无重叠区间](https://leetcode.cn/problems/non-overlapping-intervals/)

**贪心策略**：选择**结束时间最早**的区间。

```java
Arrays.sort(intervals, (a, b) -> a[1] - b[1]);
int end = Integer.MIN_VALUE, count = 0;
for (int[] interval : intervals) {
    if (interval[0] >= end) {
        end = interval[1];
    } else {
        count++; // 需要移除
    }
}
return count;
```

---

### ✅ 3. 分配问题

#### [455. 分发饼干](https://leetcode.cn/problems/assign-cookies/)

**贪心策略**：优先满足最小胃口的孩子。

```java
Arrays.sort(g);
Arrays.sort(s);
int i = 0, j = 0;
while (i < g.length && j < s.length) {
    if (s[j] >= g[i]) i++; // 满足一个
    j++;
}
return i;
```

---

### ✅ 4. 构造类问题

#### [406. 根据身高重建队列](https://leetcode.cn/problems/queue-reconstruction-by-height)

**贪心策略**：身高高的先插入，位置是比它高的人的数量。

```java
Arrays.sort(people, (a, b) -> a[0] == b[0] ?
    a[1] - b[1] : b[0] - a[0]);

List<int[]> res = new ArrayList<>();
for (int[] person : people) {
    res.add(person[1], person);
}
return res.toArray(new int[people.length][]);
```

---

## ⚠️ 六、贪心算法使用时的注意事项

| 易错点          | 建议                    |
| ------------ | --------------------- |
| 不一定最优        | 不满足贪心性质时需改用 DP（如零钱兑换） |
| 排序规则错误       | 排序不当可能导致非最优           |
| 回溯问题误用贪心     | 比如子集、排列，不适合贪心         |
| 需要举反例验证贪心正确性 | 没有数学证明时需测试多个边界用例      |

---

## 🎯 七、总结一句话

> **贪心算法是非常高效的思维方式，但它不是万金油，适用前需确保“局部最优能推导出全局最优”。**

---

## 📘 八、推荐刷题顺序（由浅入深）

| 难度    | 题目                                                                           | 分类         |
| ----- | ---------------------------------------------------------------------------- | ---------- |
| 🟢 简单 | [455. 分发饼干](https://leetcode.cn/problems/assign-cookies)                     | 分配问题       |
| 🟢 简单 | [392. 判断子序列](https://leetcode.cn/problems/is-subsequence)                    | 双指针        |
| 🟡 中等 | [406. 根据身高重建队列](https://leetcode.cn/problems/queue-reconstruction-by-height) | 贪心构造       |
| 🟡 中等 | [55. 跳跃游戏](https://leetcode.cn/problems/jump-game)                           | 跳跃问题       |
| 🟡 中等 | [435. 无重叠区间](https://leetcode.cn/problems/non-overlapping-intervals)         | 区间调度       |
| 🔴 困难 | [968. 监控二叉树](https://leetcode.cn/problems/binary-tree-cameras)               | 树形 DP + 贪心 |
| 🔴 困难 | [630. 课程表 III](https://leetcode.cn/problems/course-schedule-iii)             | 优先队列贪心     |





* any list
{:toc}