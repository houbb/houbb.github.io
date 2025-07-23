---
layout: post
title: leetcode 002-leetcode.260 single-number-iii 力扣.260 只出现一次的数字III
date:  2020-6-8 15:13:08 +0800
categories: [Algorithm]
tags: [algorithm, data-struct, bit-operator, sf]
published: true
---

# 位运算专题

[Java Bit Operation-位运算基本概念介绍](https://houbb.github.io/2020/06/08/algorithm-000-leetcode-data-struct-002-bit-operator-00-base)

[Java Bit Operation-位运算类型转换](https://houbb.github.io/2020/06/08/algorithm-000-leetcode-data-struct-002-bit-operator-00-convert)

[leetcode bit operator 位运算入门介绍](https://houbb.github.io/2020/06/08/algorithm-000-leetcode-data-struct-002-bit-operator-00-intro)

[leetcode 002-leetcode.136 single-number 力扣.136 只出现一次的数字](https://houbb.github.io/2020/06/08/algorithm-000-leetcode-data-struct-002-bit-operator-01-136-single-number)

[leetcode 002-leetcode.137 single-number-ii 力扣.137 只出现一次的数字II](https://houbb.github.io/2020/06/08/algorithm-000-leetcode-data-struct-002-bit-operator-02-137-single-number-ii)

[leetcode 002-leetcode.260 single-number-iii 力扣.260 只出现一次的数字III](https://houbb.github.io/2020/06/08/algorithm-000-leetcode-data-struct-002-bit-operator-03-260-single-number-iii)

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

## 个人思路

假设是这样一个数组[a, b, xx, xx, ...]

只有 a, b 出现一次，其他都是重复 2 次。 

1）直接 xor 会得到什么？

这一套题，我们很自然的想到 T136，如果我们把所有的数直接都异或一遍，最后的结果 xorSum 其实两个只出现一次的数字 a^b。

因为 a,b 不同，所以 xorSum != 0。

2）如何可以转换为 T136 题。

136 题，是出现一次的数字只有一次，其他数字出现偶数次。

那么如何将本次的数据，a 和 b 分到2个组呢？

答案就是 xorSum，这个数字一定有一位二进制不是0，我们找到最低的不是0的位数作为 mask 掩码，然后将整个数组和这个 mask 值做 `&` 运算。

那么，a 与 b 必然被分配到 2 个组中。

3）分组后的处理

分组之后，我们就可以完全按照 136 的解法。


## 解法

```java
public int[] singleNumber(int[] nums) {
        // 找到整体的 xor
        int xor = 0;
        for (int num : nums) {
            xor ^= num;
        }

        // 找到最低位的 mask
        int mask = 1;
        for (int i = 0; i < 32; i++) {
            if ((xor & mask) != 0) {  // 检查当前位是否为1
                break;  // 找到最低位的1，停止循环
            }
            mask <<= 1;  // 左移1位，检查下一位
        }

        // 分成2个组

        int a = 0;
        int b = 0;
        for(int num : nums) {
            if((num & mask) == 0) {
                a ^= num;
            } else {
                b ^= num;
            }
        }

        int[] results = new int[]{a, b};
        return results;
    }
```

## 效果

1ms  击败 88.55%

还算不错，这种算是一种比较自然的解法。

这个有一个要求 就是我们必须要能想到这个异或的计算技巧。



* any list
{:toc}