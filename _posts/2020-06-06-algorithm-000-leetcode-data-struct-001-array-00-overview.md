---
layout: post
title: leetcode 数组专题 力扣数据结构之数组-00-概览
date:  2020-6-8 15:13:08 +0800
categories: [Algorithm]
tags: [algorithm, data-struct, topics, leetcode, sf]
published: true
---


# 数组

数组需要拆分下面几个部分：

1. 理论介绍

2. 源码分析

3. 数据结构实现？

4. 题目练习

5. 应用实战

因为这个是 leetcode 系列，所以重点是 4。为了照顾没有基础的小伙伴，会简单介绍一下1的基础理论。

简单介绍1，重点为4。其他不是本系列的重点。

# chat

## 详细介绍一下数据结构之数组

好的，以下是用 Java 语言描述的数组数据结构的详细介绍。

### 1. 数组的基本概念

- **元素类型一致**：Java 中的数组是固定类型的，即数组中所有元素的数据类型必须一致。
- **连续内存**：数组元素在内存中是连续存储的，因此可以通过索引直接访问每个元素。
- **固定大小**：数组的大小在创建时确定，不能动态调整。如果需要更大的数组，需要创建一个新的数组并复制元素。

### 2. 数组的特点

- **访问速度快**：由于数组元素在内存中是连续存储的，可以通过数组的下标快速访问，时间复杂度为 O(1)。
- **插入和删除效率低**：数组的插入和删除操作需要移动大量元素，特别是插入或删除元素时，时间复杂度为 O(n)。
- **内存利用率**：由于数组的大小是固定的，可能会浪费内存（如果数组未填满）或者不足（如果需要更多空间）。

### 3. 数组的基本操作

#### 1. 创建数组

数组的创建可以通过以下两种方式：

- **指定元素初始化数组**：

  ```java
  int[] arr = {10, 20, 30, 40};
  ```

- **指定数组大小并初始化**：

  ```java
  int[] arr = new int[4];  // 初始化一个长度为4的整数数组，默认值为0
  arr[0] = 10;
  arr[1] = 20;
  arr[2] = 30;
  arr[3] = 40;
  ```

#### 2. 访问元素

可以通过数组的索引来访问数组中的元素，索引从 0 开始。

```java
int[] arr = {10, 20, 30, 40};
System.out.println(arr[2]);  // 输出 30
```

#### 3. 修改元素

可以通过索引修改数组中的元素。

```java
arr[2] = 50;  // 修改索引为 2 的元素
System.out.println(arr[2]);  // 输出 50
```

#### 4. 遍历数组

使用 `for` 循环或 `for-each` 循环遍历数组中的元素。

- **传统的 `for` 循环**：

  ```java
  for (int i = 0; i < arr.length; i++) {
      System.out.println(arr[i]);
  }
  ```

- **增强的 `for-each` 循环**：

  ```java
  for (int elem : arr) {
      System.out.println(elem);
  }
  ```

#### 5. 获取数组长度

数组的长度可以通过 `length` 属性获得。

```java
System.out.println(arr.length);  // 输出 4
```

### 4. 数组的优缺点

#### 优点
- **快速访问**：通过下标直接访问数组中的元素，时间复杂度为 O(1)。
- **节省空间**：数组元素在内存中是连续存储的，相比其他数据结构（如链表），内存开销较小。

#### 缺点
- **固定大小**：一旦创建，数组的大小就无法更改。如果元素超过数组的容量，必须重新分配更大的数组并复制数据，效率较低。
- **插入和删除效率低**：由于数组是连续存储的，插入或删除元素时可能需要移动其他元素，尤其是在数组中间进行插入或删除时，时间复杂度为 O(n)。

### 5. 数组的应用场景

- **常见数据存储**：数组广泛用于存储具有相同数据类型的元素，如整数、字符串、对象等。
- **实现其他数据结构**：栈（Stack）、队列（Queue）等数据结构可以通过数组来实现。
- **查找操作**：如果数组有序，可以使用二分查找来高效查找元素。

### 6. 多维数组

Java 中的数组不仅可以是单维数组，还可以是多维数组。多维数组通常用于表示矩阵或更复杂的数据结构。

#### 1. 二维数组

二维数组可以看作一个数组的数组，常用于表示矩阵。

```java
int[][] matrix = {
    {1, 2, 3},
    {4, 5, 6},
    {7, 8, 9}
};
System.out.println(matrix[1][2]);  // 输出 6
```

#### 2. 三维数组

三维数组可以看作是一个数组的数组的数组。

```java
int[][][] three_d_array = {
    {
        {1, 2}, 
        {3, 4}
    },
    {
        {5, 6}, 
        {7, 8}
    }
};
System.out.println(three_d_array[1][0][1]);  // 输出 6
```

### 7. 数组的时间复杂度总结

| 操作           | 时间复杂度  |
|----------------|-------------|
| 访问元素       | O(1)        |
| 修改元素       | O(1)        |
| 插入（尾部）   | O(1)        |
| 插入（中间）   | O(n)        |
| 删除（尾部）   | O(1)        |
| 删除（中间）   | O(n)        |
| 查找元素       | O(n)        |

### 8. 数组的实现与优化

- **动态数组**：Java 中的 `ArrayList` 实际上是基于数组实现的动态数组，当数组容量不足时，`ArrayList` 会自动扩展数组的大小。
  
- **内存管理**：Java 使用垃圾回收机制（GC）自动管理内存，因此数组的内存释放是自动的，无需程序员手动管理。

### 9. 结论

数组是最基础且高效的数据结构之一，特别适合于存储固定数量、类型一致的数据。它提供了快速的元素访问能力，适合用于访问频繁但插入和删除不频繁的场景。

对于动态变化的大小或频繁插入删除的情况，可能需要考虑其他数据结构，如 `ArrayList` 或链表。

## 从 leetcode 推荐最值得练习的 10 道数组题

LeetCode 上有许多经典的数组问题，它们涉及不同的技术点和技巧，以下是我推荐的最值得练习的 10 道数组题（按难度从易到难排序）：

### 1. **Two Sum (1)**
   - **题目链接**: [Two Sum](https://leetcode.com/problems/two-sum/)
   - **难度**: 简单
   - **重点**: 基本的哈希表技巧，快速查找已遍历过的元素。

### 2. **Best Time to Buy and Sell Stock (121)**
   - **题目链接**: [Best Time to Buy and Sell Stock](https://leetcode.com/problems/best-time-to-buy-and-sell-stock/)
   - **难度**: 简单
   - **重点**: 动态规划思想，遍历数组时维护最小值。

### 3. **Rotate Array (189)**
   - **题目链接**: [Rotate Array](https://leetcode.com/problems/rotate-array/)
   - **难度**: 中等
   - **重点**: 数组旋转，可以通过反转三次数组来解决。

### 4. **Move Zeroes (283)**
   - **题目链接**: [Move Zeroes](https://leetcode.com/problems/move-zeroes/)
   - **难度**: 简单
   - **重点**: 数组操作，双指针技巧。

### 5. **Container With Most Water (11)**
   - **题目链接**: [Container With Most Water](https://leetcode.com/problems/container-with-most-water/)
   - **难度**: 中等
   - **重点**: 双指针技巧，找出最大面积。

### 6. **3Sum (15)**
   - **题目链接**: [3Sum](https://leetcode.com/problems/3sum/)
   - **难度**: 中等
   - **重点**: 排序+双指针技巧，找到所有满足条件的三元组。

### 7. **Subarray Sum Equals K (560)**
   - **题目链接**: [Subarray Sum Equals K](https://leetcode.com/problems/subarray-sum-equals-k/)
   - **难度**: 中等
   - **重点**: 前缀和+哈希表，动态求解连续子数组和。

### 8. **Maximum Subarray (53)**
   - **题目链接**: [Maximum Subarray](https://leetcode.com/problems/maximum-subarray/)
   - **难度**: 中等
   - **重点**: 动态规划，寻找最大和子数组。

### 9. **Product of Array Except Self (238)**
   - **题目链接**: [Product of Array Except Self](https://leetcode.com/problems/product-of-array-except-self/)
   - **难度**: 中等
   - **重点**: 线性时间解决问题，使用前缀积和后缀积。

### 10. **Find Minimum in Rotated Sorted Array (153)**
   - **题目链接**: [Find Minimum in Rotated Sorted Array](https://leetcode.com/problems/find-minimum-in-rotated-sorted-array/)
   - **难度**: 中等
   - **重点**: 二分查找，处理旋转数组。

这些题目覆盖了数组操作的多种常见模式，掌握它们可以帮助你提高在数组处理上的能力，特别是对于面试中的数组问题。

* any list
{:toc}