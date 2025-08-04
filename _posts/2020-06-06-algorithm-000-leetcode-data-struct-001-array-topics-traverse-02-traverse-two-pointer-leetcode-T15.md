---
layout: post
title: leetcode 数组专题之数组遍历-01-遍历 15-三数之和
date:  2020-6-8 15:13:08 +0800
categories: [Algorithm]
tags: [algorithm, data-struct, topics, leetcode, array, traverse, two-pointer, top100, sf]
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


# 15. 三数之和

给你一个整数数组 nums ，判断是否存在三元组 [nums[i], nums[j], nums[k]] 满足 i != j、i != k 且 j != k ，同时还满足 `nums[i] + nums[j] + nums[k] == 0` 。

请你返回所有和为 0 且不重复的三元组。

注意：答案中不可以包含重复的三元组。


示例 1：

输入：nums = [-1,0,1,2,-1,-4]
输出：[[-1,-1,2],[-1,0,1]]
解释：
nums[0] + nums[1] + nums[2] = (-1) + 0 + 1 = 0 。
nums[1] + nums[2] + nums[4] = 0 + 1 + (-1) = 0 。
nums[0] + nums[3] + nums[4] = (-1) + 2 + (-1) = 0 。
不同的三元组是 [-1,0,1] 和 [-1,-1,2] 。
注意，输出的顺序和三元组的顺序并不重要。

示例 2：

输入：nums = [0,1,1]
输出：[]
解释：唯一可能的三元组和不为 0 。

示例 3：

输入：nums = [0,0,0]
输出：[[0,0,0]]
解释：唯一可能的三元组和为 0 。
 

提示：

3 <= nums.length <= 3000

-10^ <= nums[i] <= 10^5


# 历史回顾

[leetcode 数组专题 04-leetcode.15 three-sum 力扣.15 三数之和](https://houbb.github.io/2020/06/08/algorithm-000-leetcode-data-struct-001-array-04-015-three-sum)

[leetcode 数组专题 04-leetcode.16 three-sum-closest 力扣.16 最接近的三数之和](https://houbb.github.io/2020/06/08/algorithm-000-leetcode-data-struct-001-array-04-016-three-sum-closest)

[leetcode 数组专题 04-leetcode.259 three-sum-smaller 力扣.259 较小的三数之和](https://houbb.github.io/2020/06/08/algorithm-000-leetcode-data-struct-001-array-04-259-three-sum-smaller)

# v1-暴力

## 思路

我们先用暴力。

1) 遍历

遍历所有的 i, j, k 3 个位置，找到所有等于的结果。

2）去重

我们用 set 做一下去重，虽然性能不好。

## 实现

```java
public List<List<Integer>> threeSum(int[] nums) {
        List<List<Integer>> resultList = new ArrayList<>();
        // 去重
        Set<String> stringSet = new HashSet<>();

        // 3 层循环
        for(int i = 0; i < nums.length-2; i++) {
            for(int j = i+1; j < nums.length-1; j++) {
                for(int k = j+1; k < nums.length; k++) {
                    if(nums[i] + nums[j] + nums[k] == 0) {
                        List<Integer> tempList = Arrays.asList(nums[i], nums[j], nums[k]);
                        // 排序
                        Collections.sort(tempList);
                        String key = tempList.toString();
                        if(stringSet.contains(key)) {
                            continue;
                        }
                        stringSet.add(key);
                        
                        resultList.add(tempList);
                    }
                }
            }
        }
        return resultList;
    }
```


## 效果

超出时间限制

309 / 314 个通过的测试用例

## 反思

我们如何可以让计算更快？

# v2-HashMap 改进

## 思路

我们固定一个数，那么另外两个数就变成了两数之和。

一些重点：

1） `nums[k] = (nums[i] + nums[j] ) * -1;`

2） 利用 hashmap 提升两数之和的计算速度

3） k 的位置必须在 i, j 的后面

4）如何更快的排除重复数据

我们可以对数组整体排序，然后再迭代中过滤掉重复的元素。

本来用 tempList 排序，toString 性能比较差。

## 实现

```java
public List<List<Integer>> threeSum(int[] nums) {
        // 提前一次排序，保证整体有序
        Arrays.sort(nums);

        Map<Integer, Set<Integer>> numIndexSetMap = new HashMap<>();
        for(int i = 0; i < nums.length; i++) {
            int num = nums[i];
            Set<Integer> indexSet = numIndexSetMap.getOrDefault(num, new HashSet<>());
            indexSet.add(i);
            numIndexSetMap.put(num, indexSet);
        }

        List<List<Integer>> resultList = new ArrayList<>();

        // 3 层循环
        for(int i = 0; i < nums.length-2; i++) {
            for(int j = i+1; j < nums.length-1; j++) {
                // nums[k] = (nums[i] + nums[j] ) * -1;
                int target = (nums[i] + nums[j] ) * -1;
                Set<Integer> indexSet = numIndexSetMap.get(target);
                if(isValidIndexSet(indexSet, i, j)) {
                    List<Integer> tempList = Arrays.asList(nums[i], nums[j], target);
                    resultList.add(tempList);
                }

                while (nums[j+1] == nums[j] && j < nums.length-2) {
                    j++;
                }
            }

            // 如何跳过相同的数字
            while (nums[i+1] == nums[i] && i < nums.length-3) {
                i++;
            }
        }
        return resultList;
    }

    private boolean isValidIndexSet(Set<Integer> indexSet,
                                    int i,
                                    int j) {
        if(indexSet == null) {
            return false;
        }

        // index 包含 i, j 之外的即可
        for(Integer index : indexSet) {
            if(index == i
                    || index == j) {
                continue;
            }
            // 比二者都大
            if(index > i && index > j) {
                return true;
            }
        }

        return false;
    }
```

## 效果

197ms 击败 7.04%

## 反思

勉强 AC，如何进一步优化呢？

## 优化1-k 位置判断优化

### 思路

我们没必要记录每一个位置

只需要记录最新的一个位置，保障不等于 i,j 就行。

### 实现

```java
    public List<List<Integer>> threeSum(int[] nums) {
        // 提前一次排序，保证整体有序
        Arrays.sort(nums);

        Map<Integer, Integer> numAndLastIndexMap = new HashMap<>();
        for(int i = 0; i < nums.length; i++) {
            int num = nums[i];
            numAndLastIndexMap.put(num, i);
        }

        List<List<Integer>> resultList = new ArrayList<>();

        // 3 层循环
        for(int i = 0; i < nums.length-2; i++) {
            for(int j = i+1; j < nums.length-1; j++) {
                // nums[k] = (nums[i] + nums[j] ) * -1;
                int target = (nums[i] + nums[j] ) * -1;

                Integer k = numAndLastIndexMap.get(target);
                if(k != null && k > j) {
                    resultList.add(Arrays.asList(nums[i], nums[j], target));
                }

                while (nums[j+1] == nums[j] && j < nums.length-2) {
                    j++;
                }
            }

            // 如何跳过相同的数字
            while (nums[i+1] == nums[i] && i < nums.length-3) {
                i++;
            }
        }
        return resultList;
    }
```

### 效果

162ms 击败 7.33%

变化不大。


# v3-双指针优化

## 思路

固定一个数，类似于我们上边。

另外两个数，在有序的数组中，另外2个数直接通过双指针来实现。

节省了 map 的空间

## 实现

```java
public List<List<Integer>> threeSum(int[] nums) {
        // 提前一次排序，保证整体有序
        Arrays.sort(nums);
        List<List<Integer>> resultList = new ArrayList<>();

        // 快速失败 最小值大于0，不可能等于0
        if (nums[0] > 0) {
            return resultList;
        }

        // 3 层循环
        for (int i = 0; i < nums.length - 2; i++) {
            // nums[i] + nums[i+1] + nums[i+2] > 0 时提前 break
            if (nums[i] + nums[i + 1] + nums[i + 2] > 0) {
                break;
            }

            // 跳过重复的 nums[i]
            if (i > 0 && nums[i] == nums[i - 1]) {
                continue;
            }

            // 双指针
            int left = i + 1;
            int right = nums.length - 1;
            while (left < right) {
                int sum = nums[i] + nums[left] + nums[right];
                if (sum == 0) {
                    resultList.add(Arrays.asList(nums[i], nums[left], nums[right]));

                    // 跳过重复的数据
                    while (left < right && nums[left + 1] == nums[left]) {
                        left++;
                    }
                    while (left < right && nums[right - 1] == nums[right]) {
                        right--;
                    }

                    // 移动指针
                    left++;
                    right--;
                } else if (sum < 0) {
                    // 太小 left->
                    left++;
                } else {
                    // 太大 right<-
                    right--;
                }
            }
        }
        return resultList;
    }
```

## 效果

31ms 击败 74.29%

# 小结

希望本文对你有帮助，如果有其他想法的话，也可以评论区和大家分享哦。

各位极客的点赞收藏转发，是老马持续写作的最大动力！

下一节我们将讲解 Top100 经典题目，感兴趣的小伙伴可以关注一波，精彩内容，不容错过。

* any list
{:toc}