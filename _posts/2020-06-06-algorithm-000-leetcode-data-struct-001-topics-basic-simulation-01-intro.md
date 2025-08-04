---
layout: post
title: leetcode 基础篇专题之模拟 simulation 01-入门介绍
date:  2020-6-8 15:13:08 +0800
categories: [Algorithm]
tags: [algorithm, data-struct, topics, leetcode, simulation, sf]
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

## 详细介绍一下力扣基础之模拟 simulation

我们来系统讲解一下力扣（LeetCode）中的**基础技巧之一：模拟（Simulation）**，包括：

* 什么是模拟？
* 什么时候用模拟？
* 模拟题常见类型
* 解题模板与技巧
* 高频题推荐

---

## 一、什么是模拟（Simulation）？

**模拟**就是：

> **根据题目的描述，按步骤“模拟”整个过程，一步步实现题目中的操作逻辑。**

比如：

* 题目说“顺时针旋转矩阵” → 你就写代码一步步转
* 题目说“从左往右删除重复字符” → 你就模拟这个过程

### ✅ 本质就是：**把题目的“自然语言”变成“代码实现”**。

---

## 二、什么时候用模拟？

以下场景适合用模拟：

| 场景                  | 示例            |
| ------------------- | ------------- |
| 题目描述一个复杂的**操作流程**   | 生命游戏、矩阵旋转     |
| 需要按指定规则执行每一步        | 模拟扫雷、机器人移动、洗牌 |
| 操作太复杂，没办法用公式或抽象模型解决 | 字符串编辑、棋盘跳跃    |

---

## 三、模拟题常见类型

### 1. **数组/字符串模拟**

对数组、字符串做具体操作。

📌 题目例子：

* [66. 加一](https://leetcode.cn/problems/plus-one/)：模拟大整数加法
* [1672. 最富有客户的资产总量](https://leetcode.cn/problems/richest-customer-wealth/)
* [13. 罗马数字转整数](https://leetcode.cn/problems/roman-to-integer/)
* [58. 最后一个单词的长度](https://leetcode.cn/problems/length-of-last-word/)

---

### 2. **矩阵模拟**

矩阵类题目里模拟操作流程。

📌 题目例子：

* [48. 旋转图像](https://leetcode.cn/problems/rotate-image/)：原地旋转二维矩阵
* [59. 螺旋矩阵 II](https://leetcode.cn/problems/spiral-matrix-ii/)
* [73. 矩阵置零](https://leetcode.cn/problems/set-matrix-zeroes/)
* [289. 生命游戏](https://leetcode.cn/problems/game-of-life/)：模拟状态变化

---

### 3. **数独/棋盘类模拟**

在二维格子中执行一系列合法操作。

📌 题目例子：

* [36. 有效的数独](https://leetcode.cn/problems/valid-sudoku/)
* [37. 解数独](https://leetcode.cn/problems/sudoku-solver/)（+ 回溯）
* [1275. 找出井字棋的获胜者](https://leetcode.cn/problems/find-winner-on-a-tic-tac-toe-game/)

---

### 4. **模拟移动 / 机器人轨迹**

模拟物体移动、路径追踪。

📌 题目例子：

* [657. 机器人能否返回原点](https://leetcode.cn/problems/robot-return-to-origin/)
* [73. 螺旋矩阵](https://leetcode.cn/problems/spiral-matrix/)
* [1041. 困于环中的机器人](https://leetcode.cn/problems/robot-bounded-in-circle/)

---

### 5. **数据结构模拟题**

用数组/栈/队列/链表等手动实现一些逻辑。

📌 题目例子：

* [232. 用栈实现队列](https://leetcode.cn/problems/implement-queue-using-stacks/)
* [225. 用队列实现栈](https://leetcode.cn/problems/implement-stack-using-queues/)
* [155. 最小栈](https://leetcode.cn/problems/min-stack/)

---

## 四、解题思路 & 模板技巧

### ✅ 通用思路：

1. 理解题目中给的“步骤”
2. 写出伪代码或流程图
3. 照着模拟逻辑一步步写代码
4. 注意边界 & 状态更新

---

### 🔁 常见套路（比如旋转矩阵）：

```java
// 1. 先转置矩阵
for(int i = 0; i < n; i++) {
    for(int j = i; j < n; j++) {
        swap(matrix[i][j], matrix[j][i]);
    }
}
// 2. 再水平翻转
for(int i = 0; i < n; i++) {
    reverse(matrix[i]);
}
```

---

### ⬅ 方向数组（模拟移动）

```java
int[] dx = {0, 1, 0, -1}; // 右下左上
int[] dy = {1, 0, -1, 0};
int dir = 0; // 初始方向

int x = 0, y = 0;
for (int step = 0; step < k; step++) {
    int nx = x + dx[dir];
    int ny = y + dy[dir];
    // 判断是否越界
    if (合法) {
        x = nx;
        y = ny;
    } else {
        dir = (dir + 1) % 4; // 顺时针转向
    }
}
```

---

## 五、模拟题的注意事项

| 注意点               | 原因                 |
| ----------------- | ------------------ |
| 状态更新顺序不能错         | 有些题目要“先读旧状态，再写新状态” |
| 容易写出 bug 的细节要特别小心 | 比如边界判断、数组越界、方向数组   |
| 不要强行优化成 O(1)      | 模拟题核心是“过程”，不是性能    |

---

## 六、模拟题推荐刷题顺序（入门 → 提升）

### ✅ 入门级：

* [66. 加一](https://leetcode.cn/problems/plus-one/)
* [58. 最后一个单词长度](https://leetcode.cn/problems/length-of-last-word/)
* [657. 机器人能否返回原点](https://leetcode.cn/problems/robot-return-to-origin/)

### ✅ 中级：

* [48. 旋转图像](https://leetcode.cn/problems/rotate-image/)
* [289. 生命游戏](https://leetcode.cn/problems/game-of-life/)
* [73. 矩阵置零](https://leetcode.cn/problems/set-matrix-zeroes/)

### ✅ 进阶：

* [37. 解数独](https://leetcode.cn/problems/sudoku-solver/)
* [1228. 等差数列中缺失的数字](https://leetcode.cn/problems/missing-number-in-arithmetic-progression/)
* [1275. 找出井字棋的获胜者](https://leetcode.cn/problems/find-winner-on-a-tic-tac-toe-game/)


* any list
{:toc}