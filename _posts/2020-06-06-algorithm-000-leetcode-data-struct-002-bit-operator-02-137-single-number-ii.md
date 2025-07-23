---
layout: post
title: leetcode 002-leetcode.137 single-number-ii 力扣.137 只出现一次的数字II 位运算
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

给你一个整数数组 nums ，除某个元素仅出现 一次 外，其余每个元素都恰出现 三次 。

请你找出并返回那个只出现了一次的元素。

你必须设计并实现线性时间复杂度的算法且使用常数级空间来解决此问题。

示例 1：

输入：nums = [2,2,3,2]
输出：3
示例 2：

输入：nums = [0,1,0,1,0,1,99]
输出：99
 
提示：

1 <= nums.length <= 3 * 10^4

-2^31 <= nums[i] <= 2^31 - 1

nums 中，除某个元素仅出现 一次 外，其余每个元素都恰出现 三次

# v1-基本解法

## 思路

通过 HashMap 记录每一个元素出现的次数，然后找到为1的。

## 实现

```java
class Solution {
    public int singleNumber(int[] nums) {
        // 需要存储对应的历史数据
        // 如果不是位运算这种技巧 那么使用 HashMap 最方便

        Map<Integer, Integer> countMap = new HashMap<>();
        for(int num : nums){
            countMap.put(num, countMap.getOrDefault(num, 0) +1);
        }

        // 找到 values 为1 的数据
        for(Map.Entry<Integer, Integer> entry : countMap.entrySet()) {
            int count = entry.getValue();
            if(count == 1) {
                return entry.getKey();
            }
        }

        return 0;
    }
}
```

## 效果

```
5ms 26.25%
```

效果比较差。

# v2-排序

## 思路

数字排序，出现一次的下一个元素和当前元素一定不同。

## 实现

```java
public int singleNumber(int[] nums) {
        Arrays.sort(nums);  // 对数组进行排序
        for (int i = 0; i < nums.length; i += 3) {
            // 如果当前数字与下一个和下下个不同，说明该数字出现次数为 1
            if (i + 1 >= nums.length || nums[i] != nums[i + 1]) {
                return nums[i];
            }
        }
        return -1; // 不会执行到，防止编译器报错
    }
```

## 效果 

3ms 39.66%

## 小结

其实也是不错的解法。

# V3-位运算，能想到的版本

## 思路

因为数组是 int 类型，所以位数一定是 32 位以内。

我们可以记录每个数字二进制每一位的个数累加起来，那么如果这个位置的个数是 3 的倍数，那么说明是出现了3次的数字，可以忽略。

如果不是 3 的倍数，说明一定是只出现了一次，则为我们要寻找的数字。

如果这个位是 0，本身就可以忽略。

分成两步：

1）累加每一位 1 的个数，用 `&` 计算每一位是否为 1

```
1 0 1 1 = 1*2^3 + 0*2^2 + 1*2^1 + 1*2^0 = 11
0 0 0 1 = 1
```

如果希望统计每一位1的数字，只需要右移即可。

2）找到不是 3 的倍数的位，用 `|` 位运算推出原来的数字。

1 1 0 1

然后左移计算原来的值。

## 算法实现

```java
  public int singleNumber(int[] nums) {
        int[] bits = new int[32];

        // 统计1的个数
        for(int num : nums) {
            for(int i = 0; i < 32; i++) {
                // 这里如果希望获取每一位的是否为1，应该右移
                int bit = (num >> i) & 1;
                // 增加1的个数
                if(bit != 0) {
                    bits[i] = bits[i] + 1;
                }
            }
        }

        // 反推出这个数
        int result = 0;
        for(int i = 0; i < 32; i++) {
            if(bits[i] % 3 != 0) {
                // 左移反向复现原来的数字
                result |= (1 << i);
            }
        }

        return result;
    }
```


# v4-位运算别人家的

想到使用位运算，但是没想到怎么用，但是这个很不实用，完全记不住。

说实在的 这个算法能理解的一般是搞硬件电路的吧。

不然谁天天记这个。

## 实现

```java
public int singleNumber(int[] nums) {
    int ones = 0, twos = 0;
    
    for (int num : nums) {
        // 更新 twos 和 ones
        ones = (ones ^ num) & ~twos;
        twos = (twos ^ num) & ~ones;
    }
    
    return ones; // ones 中的数字就是只出现一次的数字
}
```

## 效果

0ms 100%

效果拔群

## 解释一下

这个解法使用了两个变量 `ones` 和 `twos` 来追踪数组中每个数字的出现次数，并通过位运算来有效地找出那个只出现一次的数字。

关键在于如何利用异或运算（^）和按位与运算（&）来控制数字出现的次数，并最终过滤掉出现三次的数字。

### 问题回顾

题目要求在一个数组中找到那个只出现一次的数字，其他所有数字都恰好出现三次。

你不能使用额外的空间来存储频率（例如哈希表），也要求时间复杂度为 O(n)，空间复杂度为 O(1)。

### 解法思路

**核心思路**：

- 使用两个变量 `ones` 和 `twos` 来分别记录每个数字在数组中出现次数的不同阶段：`ones` 记录出现次数为 1 的位，`twos` 记录出现次数为 2 的位。

- 通过按位运算（异或和按位与），我们可以把出现次数为 3 的数字从 `ones` 和 `twos` 中移除，最终 `ones` 中只剩下那个出现一次的数字。

### 位运算的作用

#### 异或（^）运算：

- **异或的基本特性**：

  - `a ^ a = 0`（相同的数异或结果为 0）
  - `a ^ 0 = a`（任何数与 0 异或结果是它自己）
  - 异或是交换律和结合律的：`a ^ b ^ c = a ^ c ^ b`

  因此，`ones ^ num` 的作用就是当数字 `num` 在 `ones` 中已经出现过一次时，它将从 `ones` 中去除（因为 `a ^ a = 0`），如果 `num` 是第一次出现，它将被添加到 `ones`。

#### 按位与（&）运算：

- `&` 运算符用于判断某些位是否为 1。如果位是 1，则保留，否则清除。

- 我们用 `~twos` 和 `~ones` 来清除掉已经在 `twos` 或 `ones` 中出现过的位。

### 步骤解析

1) 初始化：`int ones = 0, twos = 0;`

- `ones` 和 `twos` 分别用来记录出现次数为 1 和 2 的位。初始化为 0。

2) 更新 `ones`：`ones = (ones ^ num) & ~twos;`

- **异或操作**：`ones ^ num` 会翻转 `ones` 中与 `num` 对应的位。

如果该位是 0，则变成 1；如果该位是 1，则变成 0。也就是说，这一步会更新 `ones` 中的值，记录哪些数字出现过一次。

- **按位与操作**：`& ~twos` 保证 `ones` 中的位不会受到那些已经出现两次的数字的影响。

`twos` 中的 1 表示某个位已经出现了两次，因此 `~twos` 会把该位清零，确保 `ones` 中那些已出现两次的位不会被设置为 1。
  
简单来说：这一步操作确保只有那些只出现一次的数字保留在 `ones` 中，出现三次的数字会被排除掉。

3) 更新 `twos`：`twos = (twos ^ num) & ~ones;`

- **异或操作**：`twos ^ num` 会翻转 `twos` 中与 `num` 对应的位。如果 `num` 出现过一次，就将该位设置为 1。如果 `num` 出现过两次，就将该位设置为 0。

- **按位与操作**：`& ~ones` 保证 `twos` 中的位不会受到那些已经在 `ones` 中出现过一次的数字的影响。如果某个位已经在 `ones` 中设置为 1，说明该数字已经出现过一次，我们就不希望将其计入 `twos` 中。

简单来说：这一步操作确保只有那些出现两次的数字的位会出现在 `twos` 中，出现三次的数字会被排除掉。

4) 返回结果：`return ones;`

- 最终，`ones` 中会存储那个只出现一次的数字，因为它没有被 `twos` 中的逻辑清除。

出现三次的数字会在 `ones` 和 `twos` 中都被清除，最终只剩下那个只出现一次的数字。

## 举个例子

假设输入数组是 `[2, 2, 3, 2, 3, 3, 4]`。

- **初始化**：`ones = 0, twos = 0`
- 第 1 个数字 `2`：
  - `ones = (0 ^ 2) & ~0 = 2 & ~0 = 2`
  - `twos = (0 ^ 2) & ~2 = 2 & ~2 = 0`
- 第 2 个数字 `2`：
  - `ones = (2 ^ 2) & ~0 = 0 & ~0 = 0`
  - `twos = (0 ^ 2) & ~0 = 2 & ~0 = 2`
- 第 3 个数字 `3`：
  - `ones = (0 ^ 3) & ~2 = 3 & ~2 = 1`
  - `twos = (2 ^ 3) & ~1 = 1 & ~1 = 0`
- 第 4 个数字 `2`：
  - `ones = (1 ^ 2) & ~0 = 3 & ~0 = 3`
  - `twos = (0 ^ 2) & ~3 = 2 & ~3 = 0`
- 第 5 个数字 `3`：
  - `ones = (3 ^ 3) & ~0 = 0 & ~0 = 0`
  - `twos = (0 ^ 3) & ~0 = 3 & ~0 = 3`
- 第 6 个数字 `3`：
  - `ones = (0 ^ 3) & ~3 = 3 & ~3 = 0`
  - `twos = (3 ^ 3) & ~0 = 0 & ~0 = 0`
- 第 7 个数字 `4`：
  - `ones = (0 ^ 4) & ~0 = 4 & ~0 = 4`
  - `twos = (0 ^ 4) & ~4 = 0 & ~4 = 0`

最终，`ones = 4`，`twos = 0`，所以返回 `4`，即那个只出现一次的数字。

### 总结

- **位运算的核心思想**：通过 `ones` 和 `twos` 来追踪每个数字出现的次数。

利用异或（^）和按位与（&）操作，确保每个数字的出现次数正确地记录下来，最终留下只出现一次的数字。

- 这个解法非常高效，能够在 O(n) 时间复杂度和 O(1) 空间复杂度下完成，适用于大规模数据。

## 小结

这个有一个要求 就是我们必须要能想到这个异或的计算技巧。

* any list
{:toc}