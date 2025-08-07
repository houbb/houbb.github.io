---
layout: post
title: leetcode 数组专题之数组遍历-01-遍历 T31 下一个排列 next-permutation
date:  2020-6-8 15:13:08 +0800
categories: [Algorithm]
tags: [algorithm, data-struct, topics, leetcode, array, traverse, two-pointer, sf]
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

# T31 下一个排列 next-permutation

整数数组的一个 排列  就是将其所有成员以序列或线性顺序排列。

例如，arr = [1,2,3] ，以下这些都可以视作 arr 的排列：[1,2,3]、[1,3,2]、[3,1,2]、[2,3,1] 。

整数数组的 下一个排列 是指其整数的下一个字典序更大的排列。

更正式地，如果数组的所有排列根据其字典顺序从小到大排列在一个容器中，那么数组的 下一个排列 就是在这个有序容器中排在它后面的那个排列。

如果不存在下一个更大的排列，那么这个数组必须重排为字典序最小的排列（即，其元素按升序排列）。

例如，arr = [1,2,3] 的下一个排列是 [1,3,2] 。

类似地，arr = [2,3,1] 的下一个排列是 [3,1,2] 。

而 arr = [3,2,1] 的下一个排列是 [1,2,3] ，因为 [3,2,1] 不存在一个字典序更大的排列。

给你一个整数数组 nums ，找出 nums 的下一个排列。

必须 原地 修改，只允许使用额外常数空间。

示例 1：

输入：nums = [1,2,3]
输出：[1,3,2]

示例 2：

输入：nums = [3,2,1]
输出：[1,2,3]

示例 3：

输入：nums = [1,1,5]
输出：[1,5,1]
 
提示：

1 <= nums.length <= 100
0 <= nums[i] <= 100

----------------------------------------------------------------

# 历史回顾

[【leetcode】016-31.下一个排列 next permutation + 46. 全排列 permutations + 47. 全排列 II permutations-ii + 60. 排列序列 permutation sequence](https://houbb.github.io/2020/06/08/algorithm-016-leetcode-31-next-permutation)

[leetcode 31+46+60 Next Permutation/Permutations/Permutation Sequence backtrack](https://houbb.github.io/2020/01/23/algorithm-34-leetcode-permutation)


# 前言

这一题，属于很强的技巧题。

对于 java 而言，是没有这个内置函数的。

那么解法就剩下 3 种可能：

1）生成全排列+排序+找到结果

生成全排列如果不会回溯，可能更难

2）实现技巧解法 nextPermutation

# v1-技巧性解法

## 思路

这一题可以说是纯技巧题，不会就是不会。

对任意 `nums`，我们按如下步骤实现 nextPermutation：

1. **从右向左找到第一个 `i`，使得 `nums[i] < nums[i + 1]`**；
2. 如果找不到，说明整个数组是降序的，直接反转即可；
3. 否则，从右向左找第一个 `j`，使得 `nums[j] > nums[i]`；
4. 交换 `nums[i]` 和 `nums[j]`；
5. 反转 `nums[i + 1:]` 这段（后缀升序化）；

## 例子

### Step 1：从后往前找到第一个“下降点”

> 在数组中，从右往左，哪一位是第一个 `nums[i] < nums[i+1]` 的？

这说明：

* 在 `i` 之后的部分是**递减序列**（说明已经最大了）；
* `i` 是我们可以“做变动”的地方。

假设输入为：`[1, 2, 3, 6, 5, 4]`

请你试着从右往左找第一个 `nums[i] < nums[i + 1]`，你认为 `i` 应该是多少？

* 从右往左扫描：

  * `5 > 4` ❌
  * `6 > 5` ❌
  * `3 < 6` → 找到 `i = 2`

说明：

* 下标 2（元素 `3`）是我们要“动”的起点；
* 它后面的 `[6, 5, 4]` 已经是**字典序最大排列**了。

### Step 2：在右边找**比 `nums[i]` 大的最小的数**

我们现在想从 `nums[i+1:]` 这段中，**找一个比 `nums[i]` 大的数，并且尽可能小**，换过去让整体变大，但又是“下一个”。

思考问题：

> 从 `nums[3] = 6`, `nums[4] = 5`, `nums[5] = 4` 中，哪个是第一个大于 `3` 的数（从右往左找）？

我们从右往左扫描，发现：

* `nums[5] = 4 > 3` 
* 这是第一个比 `nums[2] = 3` 大的数，所以我们找到 `j = 5`

现在我们有了两个关键点：

* `i = 2`（值为 3）
* `j = 5`（值为 4）

### Step 3：交换 `nums[i]` 和 `nums[j]`

现在我们要做什么？

> **交换它们，让整体变得更大一点，但尽可能小**（字典序紧接着）

原数组：

```
[1, 2, 3, 6, 5, 4]
       ↑     ↑
       i     j
```

交换之后变成：

```
[1, 2, 4, 6, 5, 3]
```

### Step 4：反转 `i+1` 到末尾的那一段

目前 `nums` 是：

```
[1, 2, 4, 6, 5, 3]
             ↑
           这一段是递减序
```

为了变成**最小的后缀（升序）**，我们要 **把 `i+1` 到末尾那段反转**。

没错！👏

你把 `[6, 5, 3]` 反转之后变成了 `[3, 5, 6]`。

所以我们最终的数组就是：

```
[1, 2, 4, 3, 5, 6]
```

这就是 `[1, 2, 3, 6, 5, 4]` 的 **字典序下一个排列**

## 实现

```java
    public void nextPermutation(int[] nums) {
        int n = nums.length;
        int i = -1;

        //1. 从右向左找到第一个 `i`，使得 `nums[i] < nums[i + 1]`；
        for(i = n-2; i >=0; i--) {
            if(nums[i] < nums[i + 1]){
                break;
            }
        }
        // 未找到，说明是最大顺序 reverse
        if(i == -1) {
            reverse(nums, 0, n-1);
            return;
        }

        // 3.否则，从右向左找第一个 `j`，使得 `nums[j] > nums[i]`；
        // 因为 i 找到的条件，必然存在 j
        int j = n-1;
        for(j = n-1; j > i; j--) {
            if(nums[j] > nums[i]) {
                break;
            }
        }

        //4. swap
        swap(nums, i, j);

        //5. reverse
        reverse(nums, i+1, n-1);
    }

    /**
     * 逆序
     * @param nums 数组
     * @param startIndex 开始
     * @param endIndex 结束
     */
    private void reverse(int[] nums, int startIndex, int endIndex) {
        while (startIndex < endIndex) {
            swap(nums, startIndex++, endIndex--);
        }
    }

    private void swap(int[] nums, int startIndex, int endIndex) {
        int temp = nums[startIndex];
        nums[startIndex] = nums[endIndex];
        nums[endIndex] = temp;
    }
```

## 解法

0ms 击败 100.00%

## 复杂度

TC： O(n)
SC:  O(1)

## 反思

这种题目，一个月估计又忘记了。

# v2-娱乐全排列

## 思路

我们来一个娱乐解法。

1）构建全排序

2）排序

3）按照顺序找，然后找一下。返回结果


下面的解法，如果我们熟练学会回溯，还是容易记忆的。

## 实现

```java
public void nextPermutation(int[] nums) {
        // 保存原始数组
        int[] original = Arrays.copyOf(nums, nums.length);

        // Step 1: 排序，准备生成所有排列
        Arrays.sort(nums);

        // Step 2: 生成所有不重复排列
        List<List<Integer>> allPermutations = new ArrayList<>();
        boolean[] used = new boolean[nums.length];
        backtrack(nums, new ArrayList<>(), used, allPermutations);

        // Step 3: 找原始排列的位置
        int index = -1;
        for (int i = 0; i < allPermutations.size(); i++) {
            if (equalList(allPermutations.get(i), original)) {
                index = i;
                break;
            }
        }

        // Step 4: 如果找到，则取下一个排列（若没有下一个，则回到第一个）
        List<Integer> next;
        if (index == -1 || index == allPermutations.size() - 1) {
            next = allPermutations.get(0);
        } else {
            next = allPermutations.get(index + 1);
        }

        // Step 5: 把结果写回原数组
        for (int i = 0; i < nums.length; i++) {
            nums[i] = next.get(i);
        }
    }

    // 回溯生成所有不重复排列
    private void backtrack(int[] nums, List<Integer> path, boolean[] used, List<List<Integer>> res) {
        if (path.size() == nums.length) {
            res.add(new ArrayList<>(path));
            return;
        }

        for (int i = 0; i < nums.length; i++) {
            // 跳过重复元素
            if (used[i]) continue;
            if (i > 0 && nums[i] == nums[i - 1] && !used[i - 1]) continue;

            used[i] = true;
            path.add(nums[i]);
            backtrack(nums, path, used, res);
            path.remove(path.size() - 1);
            used[i] = false;
        }
    }

    // 判断两个 List 是否内容相同
    private boolean equalList(List<Integer> list, int[] nums) {
        if (list.size() != nums.length) return false;
        for (int i = 0; i < nums.length; i++) {
            if (list.get(i) != nums[i]) return false;
        }
        return true;
    }
```

## 效果

超出内存限制
64 / 266 个通过的测试用例


# 小结

希望本文对你有帮助，如果有其他想法的话，也可以评论区和大家分享哦。

各位极客的点赞收藏转发，是老马持续写作的最大动力！

下一节我们将讲解 Top100 经典题目，感兴趣的小伙伴可以关注一波，精彩内容，不容错过。

* any list
{:toc}