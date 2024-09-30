---
layout: post
title: leetcode 219 Contains Duplicate II
date:  2020-1-23 10:09:32 +0800 
categories: [Algorithm]
tags: [algorithm, leetcode, hash, bit, sort, sh]
published: true
---

# 题目


给你一个整数数组 nums 和一个整数 k ，判断数组中是否存在两个 不同的索引 i 和 j ，满足 nums[i] == nums[j] 且 abs(i - j) <= k 。如果存在，返回 true ；否则，返回 false 。

 

示例 1：

输入：nums = [1,2,3,1], k = 3
输出：true
示例 2：

输入：nums = [1,0,1,1], k = 1
输出：true
示例 3：

输入：nums = [1,2,3,1,2,3], k = 2
输出：false
 

 

提示：

1 <= nums.length <= 105
-109 <= nums[i] <= 109
0 <= k <= 105


# V1-基础解法

```java
package com.github.houbb.leetcode.F200T300;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * 给你一个整数数组 nums 和一个整数 k ，判断数组中是否存在两个 不同的索引 i 和 j ，满足 nums[i] == nums[j] 且 abs(i - j) <= k 。如果存在，返回 true ；否则，返回 false 。
 *
 *
 *
 * 示例 1：
 *
 * 输入：nums = [1,2,3,1], k = 3
 * 输出：true
 * 示例 2：
 *
 * 输入：nums = [1,0,1,1], k = 1
 * 输出：true
 * 示例 3：
 *
 * 输入：nums = [1,2,3,1,2,3], k = 2
 * 输出：false
 *
 *
 *
 *
 * 提示：
 *
 * 1 <= nums.length <= 10^5
 * -10^9 <= nums[i] <= 10^9
 * 0 <= k <= 10^5
 */
public class T219_ContainsDuplicateII_V1 {

    public static void main(String[] args) {
        T219_ContainsDuplicateII_V1 v1 = new T219_ContainsDuplicateII_V1();
        int[] nums = new int[]{1,2,3,1,2,3};
        System.out.println(v1.containsNearbyDuplicate(nums, 2));
    }


    /**
     * 思路1：暴力算法。
     *
     * 首先需要找到全部相同的元素？
     * 1. 通过 HashMap 将值，和 index 放入 list?
     * 2. abs 如何计算？直接结算就行？
     * 3. 如果存在多个元素怎么办？怎么找到最小的两个元素的差值？
     *
     *
     * @param nums 数组
     * @param k 最小距离
     * @return 结果
     */
    public boolean containsNearbyDuplicate(int[] nums, int k) {
        //1. 数据处理
        Map<Integer, List<Integer>> dataMap = new HashMap<>();

        for(int i = 0; i < nums.length; i++) {
            int num = nums[i];

            List<Integer> indexList = dataMap.getOrDefault(num, new ArrayList<>());
            indexList.add(i);

            // 判断距离
            if(indexList.size() > 1) {
                // 开始计算
                int min = getMinDistance(indexList);
                if(min <= k) {
                    return true;
                }
            }

            dataMap.put(num, indexList);
        }

        return false;
    }

    /**
     * 正常获取最小值，需要先排序。
     * 但是这里其实是天然的排序的。
     * 只需要计算2个之间的距离就行
     *
     *
     * 这里多次计算，可以使用 dp 优化？
     * @param otherNums 数字
     * @return 结果
     */
    private int getMinDistance(List<Integer> otherNums) {
        int result = Integer.MAX_VALUE;
        for(int i = 0; i < otherNums.size()-1; i++) {
            int distance = otherNums.get(i+1) - otherNums.get(i);
            if(distance < result) {
                result = distance;
            }
        }
        return result;
    }

}
```


# V2-改进最小距离

天然排序，直接2个之间即可。

```java
    /**
     * 正常获取最小值，需要先排序。
     * 但是这里其实是天然的排序的。
     * 只需要计算2个之间的距离就行
     *
     *
     * 这里多次计算，可以使用 dp 优化？
     * @param otherNums 数字
     * @return 结果
     */
    private int getMinDistance(List<Integer> otherNums) {
        int result = Integer.MAX_VALUE;
        for(int i = 0; i < otherNums.size()-1; i++) {
            int distance = otherNums.get(i+1) - otherNums.get(i);
            if(distance < result) {
                result = distance;
            }
        }
        return result;
    }
```




# 参考资料

https://leetcode.com/problems/contains-duplicate/submissions/

* any list
{:toc}