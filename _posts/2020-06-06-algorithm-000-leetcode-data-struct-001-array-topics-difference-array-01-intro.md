---
layout: post
title:  【leetcode】58-什么是差分数组（Difference Array）
date:  2020-6-8 15:13:08 +0800
categories: [Algorithm]
tags: [algorithm, prefix-sum, difference-array, leetcode]
published: true
---

# 开源地址

为了便于大家学习，所有实现均已开源。欢迎 fork + star~

> [https://github.com/houbb/leetcode](https://github.com/houbb/leetcode)

好的，我们现在来系统讲解「差分数组（Difference Array）」，它是前缀和的“逆操作”，主要用于 **高效地进行区间修改**。

---

## 一、什么是差分数组？

差分数组是一种 **通过修改端点来影响一个区间的值** 的技巧，适用于这种场景：

> 「对一个数组 `nums` 的某个区间 `[l, r]`，整体加上一个值 `+k`，并且这样的操作会执行很多次，但我们不关心中间过程，只关心最终数组。」

---

### ✅ 举个例子：

假设有数组：

```
nums = [0, 0, 0, 0, 0]
```

我们希望执行这些操作：

1. 把区间 `[1, 3]` 所有数加上 2
2. 把区间 `[2, 4]` 所有数加上 3

最终数组应该是：

```
[0, 2, 5, 5, 3]
```

---

## 二、差分数组的原理

差分数组 `diff[]` 的含义是：

```java
diff[0] = nums[0];
diff[i] = nums[i] - nums[i - 1];  // 从第1位开始
```

那么还原 `nums[]` 的方法是前缀和：

```java
nums[i] = diff[0] + diff[1] + ... + diff[i];
```

---

## 三、区间加操作怎么做？

对于一次操作：
「将区间 `[l, r]` 全部加上 `k`」，在差分数组上，只需：

```java
diff[l] += k;
diff[r + 1] -= k;
```

之后，**只需要一次前缀和**，就能还原出所有累加后的最终数组。

---

## 四、完整代码实现（Java 示例）

```java
// 原始数组
int[] nums = new int[5]; // [0, 0, 0, 0, 0]

// 构造差分数组
int[] diff = new int[nums.length + 1]; // 多开一位防止越界

// 区间加操作函数
void rangeAdd(int l, int r, int k) {
    diff[l] += k;
    if (r + 1 < diff.length) {
        diff[r + 1] -= k;
    }
}

// 应用操作
rangeAdd(1, 3, 2);
rangeAdd(2, 4, 3);

// 恢复结果数组
int[] result = new int[nums.length];
result[0] = diff[0];
for (int i = 1; i < nums.length; i++) {
    result[i] = result[i - 1] + diff[i];
}
```

执行完后，`result = [0, 2, 5, 5, 3]` ✅

---

## 五、差分数组的应用场景

### ✅ 1. 多次区间修改

例如每次将某段区间加上/减去某个值，但不关心中间值，只关心最后的结果。

典型例题：

* Leetcode 370. [区间加法](https://leetcode.cn/problems/range-addition/)
* Leetcode 1109. [航班预订统计](https://leetcode.cn/problems/corporate-flight-bookings/)

---

### ✅ 2. 多次修改后判断某个位置是否满足条件

如：某个时间段人流量增加，最终判断某时刻人数是否超载。
这种常见于调度、航班、会议、事件模拟等问题。

---

## 六、差分 vs 前缀和 的对比

| 特性    | 前缀和             | 差分数组           |
| ----- | --------------- | -------------- |
| 适合场景  | 快速查询区间和         | 快速执行区间加操作      |
| 查询    | O(1) 查询任意区间和    | O(n) 重建原数组后再查询 |
| 修改    | O(n) 修改后需要重建前缀和 | O(1) 修改差分数组    |
| 构建复杂度 | O(n)            | O(n)           |

---

## 七、常见注意点

* `diff` 数组一般要开 `n+1`，避免 `r+1` 越界。
* 记得最后 **还原原数组时要做前缀和**。
* 仅适用于 **加法、减法类型的区间修改**，不支持区间乘、除、替换等。

---

## 八、例题推荐

当然可以，下面是补充了**题目难度**后的完整表格，每题都与差分数组相关：

| 题号      | 题目      | 技巧        | 难度    |
| ------- | ------- | --------- | ----- |
| LC 370  | 区间加法    | 差分数组      | 🔴 中等 |
| LC 1109 | 航班预订统计  | 差分数组      | 🟡 中等 |
| LC 1094 | 拼车      | 差分 + 容量判断 | 🔴 中等 |
| LC 1854 | 人口最多的年份 | 差分 + 扫描线  | 🟢 简单 |



# 参考资料

* any list
{:toc}