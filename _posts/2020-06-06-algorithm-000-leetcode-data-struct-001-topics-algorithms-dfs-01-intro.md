---
layout: post
title: leetcode 算法篇专题之深度优先遍历 DFS Depth-First Search 01-入门介绍
date:  2020-6-8 15:13:08 +0800
categories: [Algorithm]
tags: [algorithm, data-struct, topics, leetcode, dfs, sf]
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

## 详细介绍一下力扣算法之深度优先遍历

下面是 LeetCode（力扣）中\*\*深度优先遍历（DFS, Depth-First Search）\*\*的详细介绍。

我们从基础定义、模板写法、常见题型，到技巧总结和高频题推荐全面讲解，帮助你吃透 DFS 算法。

---

## 🧠 一、什么是深度优先遍历（DFS）？

> DFS 是一种优先“往深处探索”，直到无法继续后才“回溯”的搜索策略。

就像**走迷宫**：你先一直往一个方向走到底，撞墙了再回退换条路。

---

## 🧩 二、DFS 的核心特性

| 特性           | 说明                         |
| ------------ | -------------------------- |
| **递归实现**     | DFS 通常使用递归实现，也可以用栈模拟       |
| **走到黑到底**    | 优先沿着某一条路径走到底               |
| **适合搜索结构**   | 图、树、网格、排列组合等结构             |
| **可配合剪枝、回溯** | 用于构造所有合法解的情况（回溯算法本质就是 DFS） |

---

## 🔁 三、DFS 模板写法

### ✅ 1. 图/网格搜索（二维方向）

```java
void dfs(int[][] grid, int x, int y, boolean[][] visited) {
    if (超出边界 || visited[x][y] || grid[x][y] 不合法) return;

    visited[x][y] = true;

    for (方向 dir : 上下左右) {
        dfs(grid, newX, newY, visited);
    }
}
```

### ✅ 2. 回溯型 DFS（如排列、组合、子集）

```java
void dfs(List<Integer> path, int index) {
    if (满足条件) {
        res.add(new ArrayList<>(path));
        return;
    }
    for (int i = index; i < n; i++) {
        path.add(候选值);
        dfs(path, i + 1);      // 递归
        path.remove(path.size()-1); // 回溯
    }
}
```

---

## 🧰 四、DFS 应用场景总结

| 场景      | 说明              | 高频题目                                                                      |
| ------- | --------------- | ------------------------------------------------------------------------- |
| ✅ 二叉树遍历 | DFS 是最自然的遍历方式   | [104. 二叉树最大深度](https://leetcode.cn/problems/maximum-depth-of-binary-tree) |
| ✅ 图遍历   | 判断连通分量、拓扑排序     | [200. 岛屿数量](https://leetcode.cn/problems/number-of-islands)               |
| ✅ 网格走迷宫 | 搜索路径、区域大小、封闭岛屿  | [130. 被围绕的区域](https://leetcode.cn/problems/surrounded-regions)            |
| ✅ 回溯搜索  | 组合、子集、全排列、N皇后等  | [46. 全排列](https://leetcode.cn/problems/permutations)                      |
| ✅ 构造解空间 | 分割回文串、加减符号、括号匹配 | [131. 分割回文串](https://leetcode.cn/problems/palindrome-partitioning)        |

---

## 🌈 五、DFS 与其他算法的关系

| 算法/结构     | 与 DFS 的关系              |
| --------- | ---------------------- |
| 树结构遍历     | DFS 就是前中后序遍历           |
| 回溯法       | 是一种“构造所有解”的 DFS        |
| 分治        | 通常用 DFS + 合并逻辑         |
| 动态规划（记忆化） | DFS + 缓存子结果，就是记忆化搜索    |
| 图算法       | DFS 可用于拓扑排序、环检测、强连通分量等 |

---

## 🎯 六、力扣经典 DFS 题型总结

### ✅ 1. 树型 DFS

| 题目                                                                        | 说明         |
| ------------------------------------------------------------------------- | ---------- |
| [104. 二叉树最大深度](https://leetcode.cn/problems/maximum-depth-of-binary-tree) | 递归求最大深度    |
| [226. 翻转二叉树](https://leetcode.cn/problems/invert-binary-tree)             | 后序递归交换左右   |
| [112. 路径总和](https://leetcode.cn/problems/path-sum)                        | 判断是否存在某条路径 |

---

### ✅ 2. 网格 DFS

| 题目                                                              | 说明           |
| --------------------------------------------------------------- | ------------ |
| [200. 岛屿数量](https://leetcode.cn/problems/number-of-islands)     | 统计连通块数目      |
| [695. 岛屿的最大面积](https://leetcode.cn/problems/max-area-of-island) | 搜索最大连通面积     |
| [130. 被围绕的区域](https://leetcode.cn/problems/surrounded-regions)  | 边界 DFS 防止被围绕 |

---

### ✅ 3. 回溯（DFS + 回退）

| 题目                                                                                  | 说明             |
| ----------------------------------------------------------------------------------- | -------------- |
| [46. 全排列](https://leetcode.cn/problems/permutations)                                | used 数组标记是否被使用 |
| [77. 组合](https://leetcode.cn/problems/combinations)                                 | 递归 + 回溯构造所有组合  |
| [17. 电话号码的字母组合](https://leetcode.cn/problems/letter-combinations-of-a-phone-number) | 递归构造所有结果       |

---

### ✅ 4. 构造类 DFS

| 题目                                                                 | 说明          |
| ------------------------------------------------------------------ | ----------- |
| [22. 括号生成](https://leetcode.cn/problems/generate-parentheses)      | 左右括号平衡构造    |
| [93. 复原 IP 地址](https://leetcode.cn/problems/restore-ip-addresses)  | 分割 + 剪枝     |
| [131. 分割回文串](https://leetcode.cn/problems/palindrome-partitioning) | 子串判回文 + DFS |

---

## 🧪 七、DFS 技巧总结

| 技巧              | 说明                             |
| --------------- | ------------------------------ |
| ✅ 剪枝            | 对不可能成功的路径提前 return，提高效率        |
| ✅ 回溯撤销          | 构造型 DFS 要记得撤销状态（如 path.remove） |
| ✅ used\[] 标记    | 用于排列等避免重复使用                    |
| ✅ visited\[]\[] | 图/网格防止走重复路径                    |
| ✅ 递归返回值         | 有些 DFS 需要返回路径/结果而不是 void       |

---

## 🚫 八、常见错误

| 错误类型 | 说明                    |
| ---- | --------------------- |
| 无限递归 | 忘记终止条件或 visited 标记    |
| 回溯出错 | 没有正确撤销 path / 状态      |
| 参数传错 | dfs(i + 1) 写成了 i++ 等  |
| 重复结果 | 缺少剪枝 or visited 逻辑不严谨 |

---

## 📌 九、DFS 和 BFS 对比

| 特性   | DFS           | BFS       |
| ---- | ------------- | --------- |
| 搜索顺序 | 一直向下          | 一层层推进     |
| 实现方式 | 递归或栈          | 队列        |
| 适合场景 | 构造类、连通性、构造所有解 | 最短路径、层次遍历 |
| 常用结构 | 树、图、网格        | 图、网格      |

---

## 📚 十、DFS 练习路线推荐（递进式）

1. 🌱 树类：104, 226, 112
2. 🌿 网格：200, 695, 130
3. 🌼 回溯：46, 77, 22, 17
4. 🌸 构造：93, 131, 241
5. 🌺 图类：785, 886（染色）、207（拓扑）

---

## ✅ 总结一句话

> DFS 是处理「结构复杂」和「解空间大」问题的万能工具，配合回溯、剪枝、记忆化更加强大，是 LeetCode 中必须掌握的核心算法。



* any list
{:toc}