---
layout: post
title: leetcode 002-leetcode.287 find-the-duplicate-number 力扣.287 寻找重复数
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

给定一个包含 n + 1 个整数的数组 nums ，其数字都在 [1, n] 范围内（包括 1 和 n），可知至少存在一个重复的整数。

假设 nums 只有 一个重复的整数 ，返回 这个重复的数 。

你设计的解决方案必须 不修改 数组 nums 且只用常量级 O(1) 的额外空间。


示例 1：

输入：nums = [1,3,4,2,2]
输出：2

示例 2：

输入：nums = [3,1,3,4,2]
输出：3

示例 3 :

输入：nums = [3,3,3,3,3]
输出：3
 


提示：

1 <= n <= 10^5

nums.length == n + 1

1 <= nums[i] <= n

nums 中 只有一个整数 出现 两次或多次 ，其余整数均只出现 一次
 

进阶：

如何证明 nums 中至少存在一个重复的数字?

你可以设计一个线性级时间复杂度 O(n) 的解决方案吗？

# 一些解法对比

| 解法                | 修改数组          | 空间复杂度  | 时间复杂度        | 满足题意？ | 备注       |
| ----------------- | ------------- | ------ | ------------ | ----- | -------- |
| 🏆 Floyd 判圈（快慢指针） | ✅不修改          | ✅ O(1) | ✅ O(n)       | ✅✅✅✅  | ✔️最推荐    |
| 二分查找（值域）          | ✅不修改          | ✅ O(1) | ✅ O(n log n) | ✅✅✅   | ✔️合理替代方案 |
| 哈希集合              | ✅不修改          | ❌ O(n) | ✅ O(n)       | ❌     | 空间超了     |
| 排序后找重复            | ❌or✅（看是否原地排序） | ✅      | ✅ O(n log n) | ❌     | 可能修改了数组  |
| 原地标记（负号）          | ✅修改           | ✅      | ✅            | ❌     | 不符合要求    |

# v1-HashMap/HashSet

## 思路

通过 Hash 判断元素是否已经存在过，和前面的题目类似。

## 实现

```java
public int findDuplicate(int[] nums) {
    Set<Integer> set = new HashSet<>();
    for(int i = 0; i < nums.length; i++){
        int num = nums[i];
        if(set.contains(num)) {
            return num;
        }
        set.add(num);
    }
    return -1;
}
```

## 效果

20ms 37.19%

效果一般

## 反思

不符合禁止使用额外空间

## 小结

思路不算难 Hash 在这个系列的适用性特别广。

其实这个复杂度就是 O(n)

# v2-排序的思路

## 思路

很自然的想到，比较我们应该先做一个排序。

然后再比较，和下一个相等就存在。

## 代码

```java
public int findDuplicate(int[] nums) {
    Arrays.sort(nums);
    for(int i = 0; i < nums.length-1; i++){
        if(nums[i] == nums[i+1]) {
             return nums[i];
        }
    }
    return -1;
}
```

## 效果

36ms  9.92%

效果竟然比较差，估计是用例的问题。

## 反思

这个复杂度不够，要求 O(n) 的话

# v3-负数标记法

## 思路

我们可以把一个数，访问后标记为原来的负数。

这样如果有一个数重复，我们就可以发现这个数。

## 实现

```java
public int findDuplicate(int[] nums) {
        for (int i = 0; i < nums.length; i++) {
            int val = Math.abs(nums[i]);
            if (nums[val] < 0) {
                return val;
            }
            nums[val] = -nums[val];
        }
        return -1;
}
```

## 效果

3ms 击败 97.58%

## 反思

不符合题意，不允许修改

# v4-二分

## 思路

这个二分也挺巧妙的，不做排序，我愿称之为二分的经典之作。

注意不是对数组下标二分，而是对 数值范围 [1, n] 进行二分。

中位数 mid = (left + right) / 2

统计小于等于 mid 的数有多少个：

如果个数 > mid，说明重复数在左边。

否则在右边。

## 实现

```java
    public int findDuplicate(int[] nums) {
        //对 数值范围 [1, n] 进行二分
        int left = 1;
        int right = nums.length;

        while (left < right) {
            int mid = left + (right-left) / 2;
            int count = 0;
            for (int num : nums) {
                if (num <= mid) count++;
            }

            // 如果个数 > mid，说明重复数在左边。
            if(count > mid) {
                right = mid;
            } else {
                left = mid+1;
            }
        }
        return left;
    }
```

## 效果

28ms 击败 10.05%

# v5-快慢指针

## 思路

还记得如何判断一个链表是否有环吗？

快慢指针。

可是和这一题有什么关系？

## 思维

将数组看成链表，值为 next 指针，查找环的入口。

nums[i] 是下一个节点的索引，因此整个数组可以看作一个链表。

数组中有重复元素 → 一定会成环。

用 Floyd 判圈法找重复数字（环的起点就是重复的数）。

我愿称之为天才！

## 实现

```java
    public int findDuplicate(int[] nums) {
        // 二者从开始一起走
        int slow = nums[0];
        int fast = nums[0];

        // 第一次相遇
        do {
            // 一步
            slow = nums[slow];
            // 走两步
            fast = nums[fast];
            fast = nums[fast];
        } while (slow != fast);


        // 第二步：从起点和相遇点出发，再次相遇就是“环的入口”==重复的数
        fast = nums[0];
        while (slow != fast) {
            slow = nums[slow];
            fast = nums[fast];
        }
        
        return slow;
    }
```

## 效果

4ms 击败 95.14%

# 小结

希望本文对你有帮助，如果有其他想法的话，也可以评论区和大家分享哦。

各位极客的点赞收藏转发，是老马持续写作的最大动力！

下一节我们将讲解力扣经典题目，感兴趣的小伙伴可以关注一波，精彩内容，不容错过。

* any list
{:toc}