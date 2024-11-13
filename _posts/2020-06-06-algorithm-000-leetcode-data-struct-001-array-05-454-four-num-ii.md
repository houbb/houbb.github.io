---
layout: post
title: leetcode 数组专题 05-leetcode.454 four-sum-ii 力扣.454 四数相加之和 II
date:  2020-6-8 15:13:08 +0800
categories: [Algorithm]
tags: [algorithm, data-struct, array, binary-search, sf]
published: true
---

# 数组系列

[力扣数据结构之数组-00-概览](https://houbb.github.io/2020/06/08/algorithm-000-leetcode-data-struct-001-array-00-overview)

[力扣.53 最大子数组和 maximum-subarray](https://houbb.github.io/2020/06/08/algorithm-000-leetcode-data-struct-001-array-01-51-maximum-subarray)

[力扣.128 最长连续序列 longest-consecutive-sequence](https://houbb.github.io/2020/06/08/algorithm-000-leetcode-data-struct-001-array-02-128-longest-consecutive-sequence)

[力扣.1 两数之和 N 种解法 two-sum](https://houbb.github.io/2020/06/08/algorithm-000-leetcode-data-struct-001-array-03-001-two-sum)

[力扣.167 两数之和 II two-sum-ii](https://houbb.github.io/2020/06/08/algorithm-000-leetcode-data-struct-001-array-03-001-two-sum-ii)

[力扣.170 两数之和 III two-sum-iii](https://houbb.github.io/2020/06/08/algorithm-000-leetcode-data-struct-001-array-03-001-two-sum-iii)

[力扣.653 两数之和 IV two-sum-IV](https://houbb.github.io/2020/06/08/algorithm-000-leetcode-data-struct-001-array-03-001-two-sum-iv)

[力扣.015 三数之和 three-sum](https://houbb.github.io/2020/06/08/algorithm-000-leetcode-data-struct-001-array-04-015-three-sum)

[力扣.016 最接近的三数之和 three-sum-closest](https://houbb.github.io/2020/06/08/algorithm-000-leetcode-data-struct-001-array-04-016-three-sum-closest)

[力扣.259 较小的三数之和 three-sum-smaller](https://houbb.github.io/2020/06/08/algorithm-000-leetcode-data-struct-001-array-04-259-three-sum-smaller)

[力扣.018 四数之和 four-sum](https://houbb.github.io/2020/06/08/algorithm-000-leetcode-data-struct-001-array-05-018-four-num)

[力扣.454 四数相加之和 II](https://houbb.github.io/2020/06/08/algorithm-000-leetcode-data-struct-001-array-05-454-four-num-ii)


# 题目

给你四个整数数组 nums1、nums2、nums3 和 nums4 ，数组长度都是 n ，请你计算有多少个元组 (i, j, k, l) 能满足：

0 <= i, j, k, l < n

nums1[i] + nums2[j] + nums3[k] + nums4[l] == 0
 
示例 1：

输入：nums1 = [1,2], nums2 = [-2,-1], nums3 = [-1,2], nums4 = [0,2]

输出：2

解释：
两个元组如下：

1. (0, 0, 0, 1) -> nums1[0] + nums2[0] + nums3[0] + nums4[1] = 1 + (-2) + (-1) + 2 = 0
2. (1, 1, 0, 0) -> nums1[1] + nums2[1] + nums3[0] + nums4[0] = 2 + (-1) + (-1) + 0 = 0

示例 2：

输入：nums1 = [0], nums2 = [0], nums3 = [0], nums4 = [0]
输出：1
 

提示：

n == nums1.length
n == nums2.length
n == nums3.length
n == nums4.length
1 <= n <= 200
-228 <= nums1[i], nums2[i], nums3[i], nums4[i] <= 228


# 整体思路

结合前面我们做 2sum 3sum 4sum 的经验，可能的方式：

1. 暴力

2. 排序+二分

3. 排序+双指针

4. Hash 优化（局限性比较大）

不过这一题比较特别，不是一个 nums 数组，而是 4 个。

实际上其实是降低了难度。

# v1-暴力

## 思路

直接 4 次 循环，虽然知道等待我们的一定是超时。

## 实现

```java
public int fourSumCount(int[] nums1, int[] nums2, int[] nums3, int[] nums4) {
    // 暴力
    int count = 0;
    for(int i = 0; i < nums1.length; i++) {
        for(int j = 0; j < nums2.length; j++) {
            for(int k = 0; k < nums3.length; k++) {
                for(int l = 0; l < nums4.length; l++) {
                    int sum = nums1[i] + nums2[j] + nums3[k] + nums4[l];
                    if(sum == 0) {
                        count++;
                    }
                }
            }
        }
    }
    return count;
}
```

## 效果

超出时间限制

45 / 132 个通过的测试用例

## 小结

4 次循环容易想到 n^4 实在是太慢了。

# v2-排序+二分法

## 思路

我们可以把 nums1+nums2 的结果放在一个数组 sum_12; nums3+nums4 的结果放在一个数组 sum_34;

结果就变成了我们在 sum_12 中的一个数，在 sum_34 找到对应的和为0的数，总次数就是满足条件的。

## 限制

当然，我们可以做有一个大前提：nums1、nums2、nums3 和 nums4 ，数组长度都是 n

但是暴力实际上没有这个限制。

## 二分法的注意点

假设在 nums_12 一个和为 3，如果我们直接找二分法的负数是否存在，会导致无法知道次数。

所以要改为通过二分法找到对应匹配数的上下界，中间的所有数都满足。

或者我们自己直接二分实现次数，也是一样的。

## 实现

```java
class Solution {
    
    public List<List<Integer>> fourSum(int[] nums, int target) {
        Arrays.sort(nums);

        List<List<Integer>> res = new ArrayList<>();

        final int n = nums.length;
        for(int i = 0; i < n-3; i++) {
            // 跳过重复的元素
            if(i > 0 && nums[i] == nums[i-1]) {
                continue;
            }
            for(int j = i+1; j < n-2; j++) {
                if(j > i+1 && nums[j] == nums[j-1]) {
                    continue;
                }

                // 双指针
                int left = j+1;
                int right = n-1;

                while (left < right) {
                    int sum = nums[i] + nums[j] + nums[left] + nums[right];

                    if(sum == target) {
                        // 跳过后续可能重复的数据
                        List<Integer> list = Arrays.asList(nums[i], nums[j], nums[left], nums[right]);
                        res.add(list);

                        // 考虑左边
                        while (left < right && nums[left] == nums[left+1]) {
                            left++;
                        }
                        // 右边
                        while (left < right && nums[right] == nums[right-1]) {
                            right--;
                        }
                    }

                    if(sum < target) {
                        left++;
                    } else {
                        right--;
                    }
                }
            }
        }

        return res;
    }
}
```

## 效果

1146ms 5.06%

# v3-HashMap 

## 思路

把 nums1+nums2 对应的数当做一个 key，出现的次数当做 value

然后循环在 nums3+nums4 的数组中对比。

## 实现

```java
public int fourSumCount(int[] nums1, int[] nums2, int[] nums3, int[] nums4) {
    final int n = nums1.length;
    Map<Integer, Integer> sum12Map = new HashMap<>();
    for(int i = 0; i < n; i++) {
        for(int j = 0; j < n; j++) {
            int sum = nums1[i] + nums2[j];
            sum12Map.put(sum, sum12Map.getOrDefault(sum, 0)+1);
        }
    }
    int count = 0;
    for(int i = 0; i < n; i++) {
        for(int j = 0; j < n; j++) {
            int sum34 = nums3[i] + nums4[j];
            if(sum12Map.containsKey(-sum34)) {
                count += sum12Map.get(-sum34);
            }
        }
    }
    return count;
}
```

## 效果

135ms 45.32% 提升了不少。

# v4-HashMap+范围压缩

## 思路

所谓山外有山，下面的算法就是这个意思。

## 注释版本1-极致版本

这个解法是目前最优，但是不太好阅读。

```java
class Solution {
    // 方法3: 手动排序数组后自制哈希数组法。用时6ms,基本是方法2的函数内联版本，能再节约1ms。也是和方法1大体相同，只有nums排序的处理不同。
    // 这个方法先对4个数组使用类似maxAndMin方法排序，创建记录数组record，记录nums1和nums2中所有可能的和（相对于min偏移后的）出现的次数，
    // 定下这个数组的范围为min 和max。之后遍历nums1和nums2的所有组合，计算它们的和 i + j，以偏移量 i + j - min
    // 作为索引记录次数。
    // 再次遍历nums3和nums4的所有组合，计算它们的和的相反数 -k - l，用-k - l - min作为索引在record数组中查找这个索引对应的计数
    // 累加这个次数result得到结果。
    public int fourSumCount(int[] nums1, int[] nums2, int[] nums3, int[] nums4) {
        // 1. 获取nums1的最大值和最小值
        int max1 = Integer.MIN_VALUE, min1 = Integer.MAX_VALUE;
        for (int i1 : nums1) {
            if (i1 > max1) {
                max1 = i1;
            }
            if (i1 < min1) {
                min1 = i1;
            }
        }
        int[] minMaxNums1 = new int[] { min1, max1 };

        // 2. 获取nums2的最大值和最小值
        int max2 = Integer.MIN_VALUE, min2 = Integer.MAX_VALUE;
        for (int i2 : nums2) {
            if (i2 > max2) {
                max2 = i2;
            }
            if (i2 < min2) {
                min2 = i2;
            }
        }
        int[] minMaxNums2 = new int[] { min2, max2 };

        // 3. 获取nums3的最大值和最小值
        int max3 = Integer.MIN_VALUE, min3 = Integer.MAX_VALUE;
        for (int i3 : nums3) {
            if (i3 > max3) {
                max3 = i3;
            }
            if (i3 < min3) {
                min3 = i3;
            }
        }
        int[] minMaxNums3 = new int[] { min3, max3 };

        // 4. 获取nums4的最大值和最小值
        int max4 = Integer.MIN_VALUE, min4 = Integer.MAX_VALUE;
        for (int i4 : nums4) {
            if (i4 > max4) {
                max4 = i4;
            }
            if (i4 < min4) {
                min4 = i4;
            }
        }
        int[] minMaxNums4 = new int[] { min4, max4 };

        // 5. 计算可能的最小和最大值，用于确定record数组的大小
        // 最小值 min 是nums1和nums2中两个最小元素之和与nums3和nums4中两个最大元素相反数之和的较小者
        // 最大值 max 是nums1和nums2中两个最大元素之和与nums3和nums4中两个最小元素相反数之和的较大者
        int max = Math.max(minMaxNums1[1] + minMaxNums2[1], -minMaxNums3[0] - minMaxNums4[0]);
        int min = Math.min(minMaxNums1[0] + minMaxNums2[0], -minMaxNums3[1] - minMaxNums4[1]);
        // 6. 初始化结果计数器
        int result = 0;
        // 7. 创建一个数组 record，用于存储 nums1 和 nums2 中所有两数之和的频率。数组大小为可能的和的范围（max - min + 1）
        int[] record = new int[max - min + 1];
        // 8. 遍历 nums1 和 nums2 的所有组合，计算两数之和，并在 record 数组中记录出现的次数 i + j 再使用索引减去 min 来确保非负
        for (int i : nums1)
            for (int j : nums2) {
                record[i + j - min]++; // 索引通过减去 min 来确保非负
            }
        // 9. 遍历 nums3 和 nums4 的所有组合，查找 -(nums3[i] + nums4[j]) 在 record
        // 数组中的记录次数，因为要找的是和为 0 的组合，
        // 所以相当于找nums1和nums2中两数之和的相反数在 nums3 和 nums4 中的出现次数，再使用 -i - j - min
        // 作为索引来查找相反数的频率
        for (int i : nums3)
            for (int j : nums4) {
                result = result + record[-i - j - min]; // 使用 -i - j - min 作为索引来查找相反数的频率
            }
        // 10. 返回结果，即满足条件的四元组的数量
        return result;
    }
}
```

## 相对好理解的版本

```java
    public int fourSumCount(int[] nums1, int[] nums2, int[] nums3, int[] nums4) {
        int[] n1 = getMaxMin(nums1);
        int[] n2 = getMaxMin(nums2);
        int[] n3 = getMaxMin(nums3);
        int[] n4 = getMaxMin(nums4);
        int maxSum = Math.max(n1[0] + n2[0], -n3[1] - n4[1]);
        int minSum = Math.min(n1[1] + n2[1], -n3[0] - n4[0]);
        int[] map = new int[maxSum - minSum + 1];
        for (int i : nums1) {
            for (int j : nums2) {
                map[i + j - minSum] ++ ;
            }
        }
        int count = 0;
        for (int i : nums3) {
            for (int j : nums4) {
                count += map[- i - j - minSum];
            }
        }
        return count;
    }
    public int[] getMaxMin (int[] nums) {
        int[] num = Arrays.copyOf(nums, nums.length);
        Arrays.sort(num);
        int min = num[0];
        int max = num[nums.length - 1];
        return new int[] {max, min};
    }
```

## 效果 

14ms 99.96%

## 为什么这个要比 HashMap 更快？二者核心理念其实差不多，只是实现的数据结构差异

这个解法之所以比使用 `HashMap` 更快，主要原因在于它使用了一个 **固定大小的数组 `map` 来替代哈希表**，从而减少了大量的空间和时间开销。

以下是更详细的解释：

### 1. 数组比 `HashMap` 更高效

- 数组的随机访问和修改操作（`map[index]`）在大多数情况下比 `HashMap` 的查找和更新操作更快。因为数组的访问时间复杂度是 \( O(1) \)，且没有哈希表需要的哈希计算、碰撞处理等额外开销。
- `HashMap` 的性能取决于其哈希函数、负载因子、扩容等因素，这些因素可能引入额外的时间开销。而数组的大小和索引完全固定，因此可以更高效地进行访问和更新。

### 2. 使用数组代替哈希表避免了哈希冲突

- `HashMap` 可能会遇到哈希冲突（尤其是当和的值集中在小范围内时），导致链表或树的处理，进一步拖慢查询效率。
- 数组 `map` 使用范围压缩，直接以偏移量（`i + j - minSum`）来定位目标和，因此避免了冲突的可能性，确保访问始终在 \( O(1) \) 内完成。

### 3. 减少内存管理开销

- `HashMap` 在插入大量数据时需要频繁扩容和重新散列，这会带来额外的内存管理和拷贝成本。
- 使用数组则预先根据已知范围分配了固定大小的空间，因此不会出现扩容或重分配操作，从而减少内存管理的开销。

### 4. 优化的空间复杂度

- `map` 数组的大小仅为 `maxSum - minSum + 1`，即 `nums1 + nums2` 的和范围。而 `HashMap` 的大小受插入数量的影响，可能比数组占用更多内存，尤其在值域较小的情况下，数组的空间利用率更高。
  
### 5. 简化代码和常数项优化

- `HashMap` 的性能通常会受到常数项的影响，而数组操作的实现更简单，也减少了大量额外的代码和操作，从而进一步加速了代码执行。

### 举例说明

假设 `nums1[i] + nums2[j]` 和 `nums3[k] + nums4[l]` 的和范围在 \([-10, 10]\) 之间：

- `HashMap` 会保存每个可能的和及其次数，理论上可以做到，但需要计算哈希值和存储哈希表结构的额外开销。
- 数组 `map` 则直接将范围压缩成一个长度为 `21` 的数组，利用偏移量快速定位和的次数。

这种方法极大地提升了时间和空间效率，尤其在和范围不大的情况下，通过数组实现的代码性能通常比哈希表更优。

## 小结

不得不说，用数组替代 map 的方法确实令人叹为观止。

那么，我们前面的 two-sum 是不是也可以这样优化？

# 参考资料

https://leetcode.cn/problems/4sum/

* any list
{:toc}