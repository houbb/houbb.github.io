---
layout: post
title: leetcode 数组专题之数组遍历-01-遍历 T27 移除元素
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


# T27 移除元素

给你一个数组 nums 和一个值 val，你需要 原地 移除所有数值等于 val 的元素。

元素的顺序可能发生改变。

然后返回 nums 中与 val 不同的元素的数量。

假设 nums 中不等于 val 的元素数量为 k，要通过此题，您需要执行以下操作：

更改 nums 数组，使 nums 的前 k 个元素包含不等于 val 的元素。

nums 的其余元素和 nums 的大小并不重要。

返回 k。

用户评测：

评测机将使用以下代码测试您的解决方案：

```c
int[] nums = [...]; // 输入数组
int val = ...; // 要移除的值
int[] expectedNums = [...]; // 长度正确的预期答案。
                            // 它以不等于 val 的值排序。

int k = removeElement(nums, val); // 调用你的实现

assert k == expectedNums.length;
sort(nums, 0, k); // 排序 nums 的前 k 个元素
for (int i = 0; i < actualLength; i++) {
    assert nums[i] == expectedNums[i];
}
```

如果所有的断言都通过，你的解决方案将会 通过。
 
示例 1：

输入：nums = [3,2,2,3], val = 3
输出：2, nums = [2,2,_,_]
解释：你的函数函数应该返回 k = 2, 并且 nums 中的前两个元素均为 2。
你在返回的 k 个元素之外留下了什么并不重要（因此它们并不计入评测）。

示例 2：

输入：nums = [0,1,2,2,3,0,4,2], val = 2
输出：5, nums = [0,1,4,0,3,_,_,_]
解释：你的函数应该返回 k = 5，并且 nums 中的前五个元素为 0,0,1,3,4。
注意这五个元素可以任意顺序返回。
你在返回的 k 个元素之外留下了什么并不重要（因此它们并不计入评测）。

提示：

0 <= nums.length <= 100
0 <= nums[i] <= 50
0 <= val <= 100


# v1-临时数组

## 思路

最简单的思路，我们用一个临时数组，遍历一遍，然后拷贝到新的数组

## 实现

```java
    public int removeElement(int[] nums, int val) {
        int count = 0;
        int[] temp =  new int[nums.length];
        for(int num : nums) {
            if(num != val) {
                temp[count++] = num;
            }
        }
        
        // copy
        System.arraycopy(temp, 0, nums, 0, count);
        return count;
    }
```

## 效果

0ms 击败100.00%

41.27MB 击败 27.83%

空间浪费了些

## 问题

但是这个符合题目中的 `原地` 移除吗？

大概率是不行的，有更加简单的方法吗？


# v2-删除后swap

## 原地删除的意思

“原地移除”（in-place removal）的意思是：

```
不另外申请一块新的内存空间来存放结果，而是直接在原来的数组 nums 上操作，把不等于 val 的元素覆盖到数组的前面部分。
```

## 思路

如果我们不借助任何的临时数组，删除后移动元素其实也可以实现。

从前往后，和从后往前，应该是类似的。不过似乎比较慢？

或者用交换，也是类似的思路。交换整体的位置变化还好，往后找不等于 val 的数字交换。

## 实现

```java
    // 直接循环一遍，找到匹配的元素
    // 前 k 个满足即可，其他的不重要
    // 移动的代价比较大，还是交换比较合适一些
    public int removeElement(int[] nums, int val) {
        int count = 0;
        int n = nums.length;
        for(int i = 0; i < n; i++) {
            if(nums[i] != val) {
                count++;
            } else {
                // 找到下一个不等于
                int nextIndex = findNotEqualValIndex(nums, val, i+1);
                if(nextIndex == -1) {
                    return count;
                }

                // 交换
                swap(nums, i, nextIndex);
                count++;
            }
        }

        return count;
    }

    private void swap(int[] nums, int i, int j) {
        int temp = nums[i];
        nums[i] = nums[j];
        nums[j] = temp;
    }

    private int findNotEqualValIndex(int[] nums, int val, int startIx) {
        // 越界
        if(startIx >= nums.length) {
            return -1;
        }

        for(int i = startIx; i < nums.length; i++) {
            if(nums[i] != val) {
                return i;
            }
        }

        return -1;
    }
```

## 效果

0ms 100%

40.98MB 击败 99.30%

## 反思

这个解法实际上复杂度是有问题的，因为每次都要向后找，实际上复杂度差的话可能是 O(n^2)

只不过这个用例不够严谨而已。

# v3-尾部覆盖法

## 思路

我们其实最核心的是做2件事：

1. 统计出不等于 val 的总数，返回 k

2. 前 k 个元素中，将 val 移除掉

那么有没有更加简洁的方法呢？

老马非常喜欢尾部覆盖这个方法。

1）直接将尾部的元素覆盖到当前位置，n-1

2）等于 val 时，指针不动，继续重复; 不等于时 i++

## 实现

```java
public int removeElement(int[] nums, int val) {
        int n = nums.length;

        int i = 0;
        while (i < n) {
            if(nums[i] == val) {
                // 尾部覆盖当前位置
                nums[i] = nums[n-1];
                n--;
            } else {
                // 向后移动
                i++;
            }
        }
        
        return n;
}
```


## 效果

0ms 击败 100.00%

41.40MB 击败 5.20%

这个其实应该是双A才对。

## 反思

这个方法唯一的不足，就是移动了原来元素的位置。

不过题目并没有严格限制位置。


# v4-最佳写法双指针

## 双指针

双指针的写法和 v3 的对比：

| 特性           | 快慢指针法（保持顺序）     | 尾部覆盖法（不保顺序）     |
| ------------ | --------------- | --------------- |
| **是否保持原始顺序** | ✅ 是             | ❌ 否             |
| **是否移动所有元素** | ✅ 是（非 `val` 元素） | ❌ 否，只动 `val` 元素 |
| **是否适合频繁删除** | ❌ 否，大量移动        | ✅ 是，只关心当前位置和尾部  |
| **时间复杂度**    | O(n)            | O(n)            |
| **写法复杂度**    | ⭐⭐⭐（容易）         | ⭐⭐（稍 tricky）    |
| **空间复杂度**    | O(1)            | O(1)            |
| **用途**       | 顺序很重要时          | 顺序不重要，追求性能时     |

## 举个例子对比下结果

输入：

```java
int[] nums = {3, 1, 2, 3, 4, 3};
int val = 3;
```

### 📌 快慢指针（保顺序）

遍历后：

```java
nums = {1, 2, 4, ?, ?, ?}
return 3
```

输出长度为 3，且元素顺序保持为 `{1, 2, 4}`

---

### 📌 尾部覆盖（不保顺序）

遍历后可能是：

```java
nums = {4, 1, 2, ?, ?, ?}
return 3
```

因为用尾部的数替换了位置，**顺序被打乱**


## 实现

```java
public int removeElement(int[] nums, int val) {
        // 左边的指针，用于只保留不等于 val 的值
        int left = 0;
        // right 用于正常遍历
        int right = 0;

        for(right = 0; right < nums.length; right++) {
            // 将符合条件元素，放在 left 的位置
            if(nums[right] != val) {
                nums[left] = nums[right];
                left++;
            }
        }

        return left;
}
```

## 效果

0ms 100.00%
41.20MB 击败 46.63%

## 反思

这个适用性更强，值得深刻记忆。

每次做双指针，都会觉得非常巧妙。

----------------------------------------------------------------


# 小结

希望本文对你有帮助，如果有其他想法的话，也可以评论区和大家分享哦。

各位极客的点赞收藏转发，是老马持续写作的最大动力！

下一节我们将讲解 Top100 经典题目，感兴趣的小伙伴可以关注一波，精彩内容，不容错过。

* any list
{:toc}