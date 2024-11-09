---
layout: post
title: leetcode 002-leetcode.260 single-number-iii 力扣.260 只出现一次的数字III
date:  2020-6-8 15:13:08 +0800
categories: [Algorithm]
tags: [algorithm, data-struct, bit-operator, sf]
published: true
---


# 题目

给你一个整数数组 nums，其中恰好有两个元素只出现一次，其余所有元素均出现两次。 

找出只出现一次的那两个元素。你可以按 任意顺序 返回答案。

你必须设计并实现线性时间复杂度的算法且仅使用常量额外空间来解决此问题。

示例 1：

输入：nums = [1,2,1,3,2,5]
输出：[3,5]

解释：[5, 3] 也是有效的答案。

示例 2：

输入：nums = [-1,0]
输出：[-1,0]

示例 3：

输入：nums = [0,1]
输出：[1,0]
 

提示：

2 <= nums.length <= 3 * 10^4

-2^31 <= nums[i] <= 2^31 - 1

除两个只出现一次的整数外，nums 中的其他数字都出现两次

# v1-基本解法

## 思路

通过 HashMap 记录每一个元素出现的次数，然后找到为1的。

## 实现

```java
class Solution {
    public int[] singleNumber(int[] nums) {
        // 需要存储对应的历史数据
        // 如果不是位运算这种技巧 那么使用 HashMap 最方便

        int[] result = new int[2];
        int count = 0;

        Map<Integer, Integer> countMap = new HashMap<>();
        for(int num : nums){
            countMap.put(num, countMap.getOrDefault(num, 0) +1);
        }

        // 找到 values 为1 的数据
        for(Map.Entry<Integer, Integer> entry : countMap.entrySet()) {
            if(entry.getValue() == 1) {
                result[count++] = entry.getKey();
            }
        }

        return result;
    }
}
```

## 效果

```
7ms 7.94%
```

效果比较差。

# v2-排序

## 思路

数字排序，出现一次的下一个元素和当前元素一定不同。

## 实现

```java
public int[] singleNumber(int[] nums) {
    // Step 1: 排序
    Arrays.sort(nums);

    // Step 2: 遍历，找出不成对的元素
    int[] result = new int[2];
    int index = 0;
    for (int i = 0; i < nums.length; i++) {
        if (i == nums.length - 1 || nums[i] != nums[i + 1]) {
            result[index++] = nums[i];
            if (index == 2) break;  // 找到两个不成对的元素，提前结束
        } else {
            i++;  // 跳过成对的元素
        }
    }

    return result;
}
```

## 效果 

2ms 17.99%

## 小结

其实也是不错的解法。

# v3-位运算

位运算，我们看别人写的比较好的思路

> [采用分治的思想将问题降维](https://leetcode.cn/problems/single-number-iii/solutions/6620/cai-yong-fen-zhi-de-si-xiang-jiang-wen-ti-jiang-we/?envType=problem-list-v2&envId=bit-manipulation)

## 解题思路

第一步：

把所有的元素进行异或操作，最终得到一个异或值。

因为是不同的两个数字，所以这个值必定不为 0；

```java
int xor = 0;
for (int num : nums) {
      xor ^= num;
} 
```

第二步：

取异或值最后一个二进制位为 1 的数字作为 mask，如果是 1 则表示两个数字在这一位上不同。

```java
int mask = xor & (-xor);
```

第三步：

通过与这个 mask 进行与操作，如果为 0 的分为一个数组，为 1 的分为另一个数组。

这样就把问题降低成了：“有一个数组每个数字都出现两次，有一个数字只出现了一次，求出该数字”。

对这两个子问题分别进行全异或就可以得到两个解。也就是最终的数组了。

```java
int[] ans = new int[2];
for (int num : nums) {
    if ( (num & mask) == 0) {
        ans[0] ^= num;
    } else {
        ans[1] ^= num;
    }
}
```

## 小结

这个有一个要求 就是我们必须要能想到这个异或的计算技巧。

* any list
{:toc}