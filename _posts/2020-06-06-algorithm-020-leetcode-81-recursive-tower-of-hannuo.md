---
layout: post
title:  【leetcode】81-recursive 递归 汉诺塔（Tower of Hanoi）
date:  2020-6-8 15:13:08 +0800
categories: [Algorithm]
tags: [algorithm, greedy, leetcode]
published: true
---

# chat

## 题目

汉诺塔（Tower of Hanoi）是一个经典的递归问题。问题描述是，有三个柱子和若干个盘子，初始状态下所有盘子按大小从小到大叠在第一个柱子上。目标是将所有盘子从第一个柱子移动到第三个柱子，但每次只能移动一个盘子，且大盘子不能放在小盘子上面。

### 解题思路

1. **分解问题**：假设有 \( n \) 个盘子在柱子 A 上，要将它们移动到柱子 C 上，可以分解为两个步骤：
   - **步骤1**：将前 \( n-1 \) 个盘子从 A 移动到柱子 B，借助 C。
   - **步骤2**：将第 \( n \) 个盘子从 A 移动到柱子 C。
   - **步骤3**：将 \( n-1 \) 个盘子从 B 移动到 C，借助 A。
  
2. **递归实现**：将步骤 1 和步骤 3 递归调用，直到只剩下一个盘子为止。当只有一个盘子时，直接将它从起始柱子移动到目标柱子。

3. **基准条件**：如果只有一个盘子，则直接从 A 移动到 C，不再进行递归。

### 递归过程示例
假设有 3 个盘子，步骤如下：
1. 将前 2 个盘子从 A 移动到 B（借助 C）。
2. 将第 3 个盘子从 A 移动到 C。
3. 将前 2 个盘子从 B 移动到 C（借助 A）。

### Java 实现

以下是用递归方法实现汉诺塔的 Java 代码：

```java
public class HanoiTower {
    
    /**
     * 移动盘子的方法
     * @param n 盘子数量
     * @param from 起始柱子
     * @param to 目标柱子
     * @param aux 辅助柱子
     */
    public static void solveHanoi(int n, char from, char to, char aux) {
        // 基准条件：只有一个盘子，直接移动
        if (n == 1) {
            System.out.println("Move disk 1 from " + from + " to " + to);
            return;
        }

        // 步骤 1：将前 n-1 个盘子从 'from' 移到 'aux'，使用 'to' 作为辅助
        solveHanoi(n - 1, from, aux, to);

        // 步骤 2：将第 n 个盘子从 'from' 移动到 'to'
        System.out.println("Move disk " + n + " from " + from + " to " + to);

        // 步骤 3：将 n-1 个盘子从 'aux' 移动到 'to'，使用 'from' 作为辅助
        solveHanoi(n - 1, aux, to, from);
    }

    public static void main(String[] args) {
        int n = 3; // 定义盘子的数量
        solveHanoi(n, 'A', 'C', 'B'); // 从 A 移动到 C，借助 B
    }
}
```

### 运行过程示例
假设 `n = 3`，运行 `solveHanoi(3, 'A', 'C', 'B')` 的输出为：

```
Move disk 1 from A to C
Move disk 2 from A to B
Move disk 1 from C to B
Move disk 3 from A to C
Move disk 1 from B to A
Move disk 2 from B to C
Move disk 1 from A to C
```

### 解释
1. `solveHanoi(3, 'A', 'C', 'B')` 需要将第 3 个盘子从 A 移动到 C，因此调用 `solveHanoi(2, 'A', 'B', 'C')` 将前 2 个盘子移到 B。
2. 递归地继续调用，直到基准条件，直接移动最小的盘子，然后逐步回溯，每一步移动盘子。
3. 最终结果是盘子依次移动到目标柱子 C，完成汉诺塔问题。

### 复杂度分析
汉诺塔问题的递归次数为 \( 2^n - 1 \)，因此时间复杂度为 \( O(2^n) \)。




# 参考资料

https://leetcode.cn/problems/hanota-lcci/description/?envType=problem-list-v2&envId=recursion

* any list
{:toc}