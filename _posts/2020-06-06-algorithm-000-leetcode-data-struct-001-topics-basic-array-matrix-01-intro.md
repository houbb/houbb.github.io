---
layout: post
title: leetcode 基础篇专题数组矩阵 array matrix 01-入门介绍
date:  2020-6-8 15:13:08 +0800
categories: [Algorithm]
tags: [algorithm, data-struct, topics, leetcode, array, matrix, sf]
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

# 基础篇

数组-矩阵

字符串-字符串匹配

排序：计数+桶+基数

模拟

枚举

# chat

## 详细介绍一下力扣基础数据结构之矩阵

好的，我们来系统讲讲 LeetCode（力扣）中关于\*\*矩阵（Matrix）\*\*的常见知识点、题型分类、常用技巧以及典型题目。

---

## 一、矩阵基础知识

在 LeetCode 中，**矩阵 = 二维数组（二维列表）**，是非常常见的结构。它的特点：

* 行（row）和列（col）
* 下标通常从 (0, 0) 开始
* 常见数据结构是 `int[][] matrix`（Java）或 `int[][]`（C++）或 `List<List<Integer>>`（Python 中也常简化为 `List[List[int]]`）

---

## 二、常见题型分类

我们可以把矩阵类题目大致分为以下几类：

---

### 1. **遍历类**

目标是遍历矩阵的所有元素，有时是普通遍历，有时是特殊顺序。

#### ✅ 常见考点：

* 行优先 / 列优先遍历
* 螺旋顺序、Z字形遍历、对角线遍历等

#### 📌 典型题目：

* [54. 螺旋矩阵](https://leetcode.cn/problems/spiral-matrix/)
* [498. 对角线遍历](https://leetcode.cn/problems/diagonal-traverse/)
* [73. 矩阵置零](https://leetcode.cn/problems/set-matrix-zeroes/)

---

### 2. **搜索类（DFS / BFS）**

在矩阵中进行“从一个格子出发”的搜索。

#### ✅ 常见考点：

* DFS / BFS 搜索路径
* 连通区域染色
* flood fill（泛洪填充）

#### 📌 典型题目：

* [200. 岛屿数量](https://leetcode.cn/problems/number-of-islands/)
* [733. 图像渲染](https://leetcode.cn/problems/flood-fill/)
* [695. 岛屿的最大面积](https://leetcode.cn/problems/max-area-of-island/)

---

### 3. **前缀和类**

预处理出二维前缀和，用于快速求某一子矩阵的和。

#### ✅ 常见考点：

* 经典二维前缀和公式
* 枚举子矩阵 + 快速求和

#### 📌 典型题目：

* [304. 二维区域和检索 - 矩阵不可变](https://leetcode.cn/problems/range-sum-query-2d-immutable/)
* [1314. 矩阵区域和](https://leetcode.cn/problems/matrix-block-sum/)

---

### 4. **模拟类**

对矩阵执行某些操作或变换，完全靠代码逻辑去“手搓”模拟。

#### ✅ 常见考点：

* 旋转矩阵（顺时针 90 度）
* 填充矩阵（例如构造螺旋矩阵）
* 行列变换

#### 📌 典型题目：

* [48. 旋转图像](https://leetcode.cn/problems/rotate-image/)
* [59. 螺旋矩阵 II](https://leetcode.cn/problems/spiral-matrix-ii/)
* [36. 有效的数独](https://leetcode.cn/problems/valid-sudoku/)

---

### 5. **动态规划类（DP）**

在矩阵中状态转移，常用于路径、子问题优化等。

#### ✅ 常见考点：

* 最短路径/最大路径
* 子矩阵最大面积问题
* 状态转移方向（从上、左、对角线）

#### 📌 典型题目：

* [62. 不同路径](https://leetcode.cn/problems/unique-paths/)
* [64. 最小路径和](https://leetcode.cn/problems/minimum-path-sum/)
* [221. 最大正方形](https://leetcode.cn/problems/maximal-square/)
* [85. 最大矩形](https://leetcode.cn/problems/maximal-rectangle/)

---

### 6. **位运算 / 哈希辅助类**

矩阵中的元素可以当作坐标、位图，辅助做剪枝或去重。

#### 📌 典型题目：

* [36. 有效的数独](https://leetcode.cn/problems/valid-sudoku/)
* [289. 生命游戏](https://leetcode.cn/problems/game-of-life/)（原地处理 + 位操作）

---

## 三、矩阵常用技巧

| 技巧名        | 说明                                                  |
| ---------- | --------------------------------------------------- |
| 四方向数组      | `dx = [0, 1, 0, -1]`, `dy = [1, 0, -1, 0]` 用于上下左右移动 |
| 二维前缀和      | 用二维数组预处理每个子矩阵的快速求和                                  |
| visited 数组 | 记录访问过的位置，避免死循环                                      |
| 原地修改       | 有些题不允许使用额外空间，需要巧妙使用原矩阵改值                            |
| 状态压缩       | 处理数独、矩阵状态等时，压缩成位图提高效率                               |

---

## 四、面试中的高频矩阵题

| 题目                                                           | 难度 | 关键词       |
| ------------------------------------------------------------ | -- | --------- |
| [54. 螺旋矩阵](https://leetcode.cn/problems/spiral-matrix/)      | 中等 | 模拟        |
| [200. 岛屿数量](https://leetcode.cn/problems/number-of-islands/) | 中等 | DFS / BFS |
| [48. 旋转图像](https://leetcode.cn/problems/rotate-image/)       | 中等 | 旋转、模拟     |
| [64. 最小路径和](https://leetcode.cn/problems/minimum-path-sum/)  | 中等 | 动态规划      |
| [221. 最大正方形](https://leetcode.cn/problems/maximal-square/)   | 中等 | 动态规划      |

---

## 五、推荐刷题顺序（从简单到复杂）

1. 基础遍历：54 螺旋矩阵、498 对角线遍历
2. 模拟变化：48 旋转图像、73 矩阵置零
3. 搜索类题目：200 岛屿数量、695 最大面积
4. 前缀和技巧：304 二维前缀和
5. DP 应用：62 不同路径、221 最大正方形
6. 综合难题：85 最大矩形


* any list
{:toc}