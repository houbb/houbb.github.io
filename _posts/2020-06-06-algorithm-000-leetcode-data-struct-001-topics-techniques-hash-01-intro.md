---
layout: post
title: leetcode 技巧篇专题之哈希 Hashing 01-入门介绍
date:  2020-6-8 15:13:08 +0800
categories: [Algorithm]
tags: [algorithm, data-struct, topics, leetcode, hashing, sf]
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

# 技巧篇

双指针

滑动窗口

位运算--状态压缩

扫描线

前缀和

哈希哈数--滚动哈希

计数

# chat

## 详细介绍一下力扣技巧之哈希

力扣上的“哈希技巧”是算法题中非常核心的技巧之一，几乎各类题型（数组、字符串、树、图、动态规划等）中都能看到它的身影。我们可以从以下几个方面来系统地理解哈希技巧在力扣中的应用：

---

## 一、哈希的基本概念

哈希（Hash）是一种**映射关系**，通常用于**快速查找、去重、统计、存储**等操作。

常用的数据结构有：

| 类型   | Java 示例                             | 时间复杂度（查找/插入） |
| ---- | ----------------------------------- | ------------ |
| 哈希表  | `HashMap<K, V>`                     | O(1)         |
| 哈希集合 | `HashSet<E>`                        | O(1)         |
| 计数数组 | `int[] count = new int[26]`（用于小写字母） | O(1)（定长）     |

---

## 二、哈希技巧常见用途

### 1. **统计频率**

用于计数、统计元素出现次数：

```java
Map<Integer, Integer> countMap = new HashMap<>();
for (int num : nums) {
    countMap.put(num, countMap.getOrDefault(num, 0) + 1);
}
```

常见题目：

* LC 169. 多数元素
* LC 387. 字符串中的第一个唯一字符
* LC 242. 有效的字母异位词

---

### 2. **哈希去重**

快速判断是否出现过（比如找重复元素）：

```java
Set<Integer> seen = new HashSet<>();
for (int num : nums) {
    if (seen.contains(num)) return true;
    seen.add(num);
}
```

常见题目：

* LC 217. 存在重复元素
* LC 219. 存在重复元素 II（窗口 + 哈希）

---

### 3. **前缀和 + 哈希**

用哈希保存前缀和，寻找满足条件的子数组。

```java
Map<Integer, Integer> map = new HashMap<>();
map.put(0, 1); // 初始化
int preSum = 0, count = 0;
for (int num : nums) {
    preSum += num;
    count += map.getOrDefault(preSum - k, 0);
    map.put(preSum, map.getOrDefault(preSum, 0) + 1);
}
```

典型题目：

* LC 560. 和为 K 的子数组
* LC 974. 和可被 K 整除的子数组

---

### 4. **差值哈希 / 补数哈希**

哈希表记录补数或差值，快速查找满足某条件的配对。

```java
Map<Integer, Integer> map = new HashMap<>();
for (int num : nums) {
    if (map.containsKey(target - num)) {
        return new int[]{map.get(target - num), i};
    }
    map.put(num, i);
}
```

典型题目：

* LC 1. 两数之和
* LC 454. 四数相加 II（嵌套两层哈希）

---

### 5. **字符串哈希**

将字符串转换成哈希值用于快速比较、匹配。

常用方法：

* 滚动哈希（如 Rabin-Karp）
* 哈希码比较（Java：`str.hashCode()`）
* 自定义哈希（如 `str.charAt(i) - 'a'`）

常见题目：

* LC 187. 重复的DNA序列
* LC 1044. 最长重复子串（高级）

---

### 6. **哈希 + 滑动窗口**

维护一个哈希表 + 窗口两个指针（left, right），快速判断窗口内是否满足条件。

```java
int[] need = new int[128], window = new int[128];
for (char c : t.toCharArray()) need[c]++;
int left = 0, right = 0, valid = 0;
while (right < s.length()) {
    // 扩大窗口，更新window
    // 判断是否需要收缩窗口
}
```

典型题目：

* LC 76. 最小覆盖子串
* LC 3. 无重复字符的最长子串
* LC 567. 字符串的排列

---

### 7. **哈希映射（值 -> 下标）**

记录值的位置，在需要找元素下标时非常有用。

```java
Map<Integer, Integer> indexMap = new HashMap<>();
for (int i = 0; i < nums.length; i++) {
    indexMap.put(nums[i], i);
}
```

常见题目：

* LC 1. 两数之和
* LC 290. 单词规律
* LC 205. 同构字符串

---

## 三、哈希题型总结

| 类型         | 典型题目            | 技巧总结              |
| ---------- | --------------- | ----------------- |
| 频率统计       | 242、383、387、389 | 用数组或 `HashMap` 计数 |
| 去重 / 存在性判断 | 217、219、128     | `HashSet`         |
| 前缀和 + 哈希   | 560、974         | 记录前缀和出现次数         |
| 补数/差值      | 1、167、15、18、454 | 哈希查找 target - x   |
| 字符串哈希      | 187、1044        | 滚动哈希 / hashcode   |
| 滑动窗口 + 哈希  | 3、76、567、438    | 窗口内动态哈希表          |
| 哈希映射位置     | 1、205、290、697   | 记录值出现的下标          |

---

## 四、哈希使用注意事项

1. **哈希冲突：** Java 的 `hashCode` 会存在冲突，字符串比较时不要只比较哈希值。
2. **哈希表大小：** 空间复杂度为 O(N)，要注意数据规模，避免内存爆炸。
3. **避免重复遍历：** 哈希计数后常常避免再次遍历数组，提升效率。
4. **组合哈希 key：** 可以用 `x + "," + y` 作为哈希表 key，例如处理二维坐标问题。

---

## 五、推荐刷题顺序（递进式）

1. 基础频率统计：LC 242、387、383、389
2. 去重判断：LC 217、219
3. 经典补数：LC 1、167、15
4. 前缀和 + 哈希：LC 560、974
5. 滑动窗口 + 哈希：LC 3、76、567、438
6. 多层哈希 / 高阶技巧：LC 454、187、1044


* any list
{:toc}