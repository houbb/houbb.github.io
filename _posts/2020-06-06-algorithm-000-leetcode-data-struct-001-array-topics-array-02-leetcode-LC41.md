---
layout: post
title:  【leetcode】力扣 数组 array-02-LC41 缺失的第一个正数 first-missing-positive
date:  2020-6-8 15:13:08 +0800
categories: [Algorithm]
tags: [algorithm, data-struct, array, top100, leetcode]
published: true
---

# 开源地址

为了便于大家学习，所有实现均已开源。欢迎 fork + star~

> [https://github.com/houbb/leetcode](https://github.com/houbb/leetcode)

# LC41 缺失的第一个正数

给你一个未排序的整数数组 nums ，请你找出其中没有出现的最小的正整数。

请你实现时间复杂度为 O(n) 并且只使用常数级别额外空间的解决方案。
 
示例 1：

输入：nums = [1,2,0]
输出：3
解释：范围 [1,2] 中的数字都在数组中。
示例 2：

输入：nums = [3,4,-1,1]
输出：2
解释：1 在数组中，但 2 没有。
示例 3：

输入：nums = [7,8,9,11,12]
输出：1
解释：最小的正数 1 没有出现。
 

提示：

1 <= nums.length <= 10^5
-2^31 <= nums[i] <= 2^31 - 1


# v1-HashMap

## 思路

比较容易想到的是 HashMap 统计一下每个数存在的次数。

然后从 [1, max] 范围统计一遍即可。

## 实现

```java
public static int firstMissingPositive(int[] nums) {
        // 不排序
        int min = Integer.MAX_VALUE;
        int max = Integer.MIN_VALUE;

        Map<Integer, Integer> numsMap = new HashMap<>();
        for(int n : nums) {
            int count = numsMap.getOrDefault(n, 0);
            numsMap.put(n, count+1);

            min = Math.min(n, min);
            max = Math.max(n, max);
        }

        // 如何判断呢？
        for(int i = 1; i <= max; i++) {
            if(!numsMap.containsKey(i)) {
                return i;
            }
        }

        // 结果
        return Math.max(1, max+1);
}
```

## 效果

18ms 击败 5.76%

## 反思

HashMap 可以用 int[] 数组替代。

# v2-swap

## 思想

这个思想非常巧妙，抛开本题的限制不谈，这种巧思值得反复体会。

核心只有一句话：希望把每个正整数 x 放到数组中正确的位置 —— 也就是放到 nums[x - 1] 的位置。

目标状态：

```
nums[0] == 1
nums[1] == 2
nums[2] == 3
...
nums[n-1] == n
```

好处就是我们可以直接后面再判断一遍，直接可以找到缺失的数字。

## 核心流程

1）我们 0...n 遍历数字

2）如果存在 `nums[i] > 0 && nums[i] <= n && nums[nums[i] - 1] != nums[i] `

则交换 `swap(nums, i, nums[i] - 1)`

3) 遍历一次，如果 `nums[i] != i + 1` 返回 i+1

4) 最后返回 n+1

## 实现

```java
public static int firstMissingPositive(int[] nums) {
        int n = nums.length;

        // 把数字放在合适的位置上
        for(int i = 0; i < n; i++) {
            // 不断的交换，直到满足为止
            while (nums[i] > 0 && nums[i] <= n && nums[nums[i] - 1] != nums[i]) {
                int temp = nums[nums[i] - 1];
                nums[nums[i] - 1] = nums[i];
                nums[i] = temp;
            }
        }
        
        // 再次判断一次
        for(int i = 0; i < n; i++) {
            // 不在合适的位置上
            if(nums[i] != i+1) {
                return i+1;
            }
        }

        return n+1;
    }
```

## 效果

1ms 击败 100.00%

TC: O(N)

SC: O(1)

很优秀的解法

## 反思

还有其他解法吗？

有的，虽然我们很难想到一个，但是有人一个又一个。


# v3-负值标记法

## 思路

其实，和上面整体是类似的。

我们标记为负数，是为了在原地、无额外空间的前提下，记录“某个正整数是否出现过”，方便后续判断。

为什么要用负数？

负数就能安全地表示“我标记过了”，因为我们提前把所有不在 [1, n] 的都替换掉了，确保它们不会干扰判断。

## 核心流程

1）`nums[i] <= 0 || nums[i] > n`，直接将 `nums[i] = n+1` 不关注

2）将出现过的数 nums[i] 标记为负值（如果它在 [1, n] 范围）

这里其实和 v2 一样，也要把这个数放在合适的位置上

3）遍历找到结果

## 举个例子

以 `nums = [3, 4, -1, 1]` 为例子

1) 处理掉不再范围内的数

```
nums = [3, 4, 5, 1]   // -1 被替换成 5（因为不是 [1, 4] 范围）
```

2)  标记过程表格

| i | nums\[i] | val = abs(nums\[i]) | 是否在 \[1, n] | 要标记的位置（val-1） | 标记前 nums\[val-1] | 标记后 nums\[val-1] | nums 数组状态            |
| - | -------- | ------------------- | ----------- | ------------- | ---------------- | ---------------- | -------------------- |
| 0 | 3        | 3                   | ✅ 是         | 2             | 5                | -5               | `[3, 4, -5, 1]`      |
| 1 | 4        | 4                   | ✅ 是         | 3             | 1                | -1               | `[3, 4, -5, -1]`     |
| 2 | -5       | 5                   | ❌ 否         | -             | -                | -                | `[3, 4, -5, -1]`（不变） |
| 3 | -1       | 1                   | ✅ 是         | 0             | 3                | -3               | `[-3, 4, -5, -1]`    |

最终 Step 2 执行后的结果数组：[-3, 4, -5, -1]

## 实现

```java
    public static int firstMissingPositive(int[] nums) {
        int n = nums.length;

        // 1. 忽略掉过大、过小的数
        for(int i = 0; i < n; i++) {
            if(nums[i] <= 0 || nums[i] > n) {
                nums[i] = n+1;
            }
        }

        //2. 利用负号标记 1 ~ n 是否出现过
        for (int i = 0; i < n; i++) {
            int val = Math.abs(nums[i]);
            if (val <= n) {
                nums[val - 1] = -Math.abs(nums[val - 1]);
            }
        }
        
        //3. 再次判断一次
        for(int i = 0; i < n; i++) {
            if(nums[i] > 0) {
                return i+1;
            }
        }

        return n+1;
    }
```





# 小结

希望本文对你有帮助，如果有其他想法的话，也可以评论区和大家分享哦。

各位极客的点赞收藏转发，是老马持续写作的最大动力！

感兴趣的小伙伴可以关注一波，精彩内容，不容错过。

# 参考资料

* any list
{:toc}