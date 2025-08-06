---
layout: post
title:  【leetcode】力扣 数组 array-02-LC189 轮转数组 rotate-array
date:  2020-6-8 15:13:08 +0800
categories: [Algorithm]
tags: [algorithm, data-struct, array, leetcode]
published: true
---

# 开源地址

为了便于大家学习，所有实现均已开源。欢迎 fork + star~

> [https://github.com/houbb/leetcode](https://github.com/houbb/leetcode)

# LC189 轮转数组

给定一个整数数组 nums，将数组中的元素向右轮转 k 个位置，其中 k 是非负数。


示例 1:

输入: nums = [1,2,3,4,5,6,7], k = 3
输出: [5,6,7,1,2,3,4]
解释:
向右轮转 1 步: [7,1,2,3,4,5,6]
向右轮转 2 步: [6,7,1,2,3,4,5]
向右轮转 3 步: [5,6,7,1,2,3,4]

示例 2:

输入：nums = [-1,-100,3,99], k = 2
输出：[3,99,-1,-100]
解释: 
向右轮转 1 步: [99,-1,-100,3]
向右轮转 2 步: [3,99,-1,-100]
 

提示：

1 <= nums.length <= 10^5
-2^31 <= nums[i] <= 2^31 - 1
0 <= k <= 10^5
 

进阶：

尽可能想出更多的解决方案，至少有 三种 不同的方法可以解决这个问题。
你可以使用空间复杂度为 O(1) 的 原地 算法解决这个问题吗？

# 评价

这一题就很有趣，明确说明多种解法。

# v1-暴力

## 思路

按照题意，直接移动 k 个位置来实现。

但是也容易想到几个优化点：

1）实际上只需要移动 `mod = k % nums.length`

2) 如果 mod 是0，实际上不用移动。长度为1，也不用

3）也不用真的一次次移动，可以把原始的数组拆分为2个部分

[0,1,....,移动点,....]

`移动点 = nums.length-1-mod`

比如移动一次，只需要最后一个元素和前面的2个部分。

可以用临时数组之类的，最后 copy 返回。


## 实现

```java
    public void rotate(int[] nums, int k) {
        if(nums.length <= 1) {
            return;
        }

        int mod = k % nums.length;
        if(mod == 0) {
            return;
        }

        // 如何移动
        for(int i = 0; i < k; i++) {
            // 如何移动一位？
            int last = nums[nums.length-1];

            // 前面的向后移动一位
            System.arraycopy(nums, 0, nums, 1, nums.length-1);
            // 队尾放在开始
            nums[0] = last;
        }
    }
```

## 效果

超出时间限制

38 / 39 个通过的测试用例

TC O(n·k)

## 反思

因为我们移动了 k 次，比较笨的方式。

我们改成从分割的位置，直接移动。

# v2-借助临时数组

## 思路

我们改进下 v1，用下临时数组。

然后直接拷贝移动。

## 实现

```java
public static void rotate(int[] nums, int k) {
        int n = nums.length;
        if(n <= 1) {
            return;
        }

        int mod = k % n;
        if(mod == 0) {
            return;
        }

        // 如何移动
        int[] temp = new int[mod];
        System.arraycopy(nums, n-mod, temp, 0, mod);

        // 前面的向后移动k位
        System.arraycopy(nums, 0, nums, mod, n-mod);

        // temp 放在前面
        System.arraycopy(temp, 0, nums, 0, mod);
    }
```

## 效果 

0ms 100%

时间 O(n)，空间 O(k)


# v3-三次反转法

## 思路

我们可以把“右旋转 k 位”理解成：

- 把数组的**后 k 个元素**，挪到最前面
- 原本的前 n-k 个元素，往后挪 k 位

也就是说，把数组分成两部分：

```
前 n-k 个元素： [1,2,3,4]
后 k 个元素：   [5,6,7]

旋转后变成：    [5,6,7,1,2,3,4]
```

## 如何用 “反转” 实现这个操作？

反转的好处是可以实现原地，但是技巧性太强。

我们可以用**三次反转**来达到目的：

步骤一：反转整个数组

```
原数组：     [1,2,3,4,5,6,7]
整体翻转后： [7,6,5,4,3,2,1]
```

步骤二：反转前 k 个元素（此时是原数组的后 k 个元素）

```
前 k=3 个：   [7,6,5] -> 翻转 -> [5,6,7]

结果：       [5,6,7,4,3,2,1]
```

步骤三：反转后 n-k 个元素（此时是原数组的前 n-k 个元素）

```
后 n-k=4 个： [4,3,2,1] -> 翻转 -> [1,2,3,4]

最终结果：   [5,6,7,1,2,3,4]
```

## 实现

```java
    public void rotate(int[] nums, int k) {
        int n = nums.length;
        if(n <= 1) {
            return;
        }

        int mod = k % n;
        if(mod == 0) {
            return;
        }

        // 第一步：整体反转
        reverse(nums, 0, n - 1);

        // 第二步：反转前 k 个元素
        reverse(nums, 0, mod - 1);

        // 第三步：反转后 n-k 个元素
        reverse(nums, mod, n - 1);
    }

    private void reverse(int[] nums, int left, int right) {
        while (left < right) {
            int temp = nums[left];
            nums[left] = nums[right];
            nums[right] = temp;
            left++;
            right--;
        }
    }
```


## 效果

1ms 击败 50.93%

TC 	O(n)


# v4-环状替换法（Cyclic Replacements）

## 思路

我们之所以要借助临时数组，是因为直接替换会覆盖。

解法核心思想：模拟每个数“跳跃”的过程

## 举个例子快速理解

```java
nums = [1,2,3,4,5,6,7], k = 3
```

长度 `n = 7`

我们希望：

```
nums[0] → nums[3]
nums[3] → nums[6]
nums[6] → nums[2]
nums[2] → nums[5]
nums[5] → nums[1]
nums[1] → nums[4]
nums[4] → nums[0]
```

注意：这 7 个元素构成了 **一个“环”**，如果我们从 `0` 出发，跳 `k` 步，再从那继续跳 `k` 步…… 最终会回到起点。

为什么不会死循环？

因为我们有一个 `count` 变量，记录已经移动的元素总数，一旦达到 `n` 就退出循环，避免重复处理。

## 实现

```java
public void rotate(int[] nums, int k) {
    int n = nums.length;
    k = k % n;
    int count = 0;  // 记录被移动元素的总数

    for (int start = 0; count < n; start++) {
        int current = start;
        int prev = nums[start];

        do {
            int next = (current + k) % n;
            int temp = nums[next];

            nums[next] = prev;
            prev = temp;
            current = next;

            count++;
        } while (start != current); // 环结束
    }
}
```


## 效果

1ms 50.93%

# 小结

希望本文对你有帮助，如果有其他想法的话，也可以评论区和大家分享哦。

各位极客的点赞收藏转发，是老马持续写作的最大动力！

感兴趣的小伙伴可以关注一波，精彩内容，不容错过。

# 参考资料

* any list
{:toc}