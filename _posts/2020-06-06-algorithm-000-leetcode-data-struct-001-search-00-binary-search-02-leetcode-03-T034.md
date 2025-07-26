---
layout: post
title:  二分查找法？binary-search-02-leetcode 34. 在排序数组中查找元素的第一个和最后一个位置
date:  2020-6-8 15:13:08 +0800
categories: [Algorithm]
tags: [algorithm, data-struct, topics, leetcode, binary-search, sf]
published: true
---


# 二分查找算法

大家好，我是老马。

今天我们一起来学习一下数组密切相关的二分查找算法力扣实战。

首先二分查找法的简单变化，查找某个值的“左边界”或“右边界”。

# 34. 在排序数组中查找元素的第一个和最后一个位置

给你一个按照非递减顺序排列的整数数组 nums，和一个目标值 target。

请你找出给定目标值在数组中的开始位置和结束位置。

如果数组中不存在目标值 target，返回 [-1, -1]。

你必须设计并实现时间复杂度为 O(log n) 的算法解决此问题。

示例 1：

输入：nums = [5,7,7,8,8,10], target = 8
输出：[3,4]

示例 2：

输入：nums = [5,7,7,8,8,10], target = 6
输出：[-1,-1]

示例 3：

输入：nums = [], target = 0
输出：[-1,-1]
 

提示：

0 <= nums.length <= 10^5
-10^9 <= nums[i] <= 10^9
nums 是一个非递减数组
-10^9 <= target <= 10^9

# v1-二分查找循环

## 思路

这一题当然是一眼二分查找法。

但是和 T704 的区别在哪里呢？

1) 如果 target 存在的时候，且只有一个值的时候，实际上是一样的。

直接返回 `[index, index]` 就是结果的值。

2) 如果不存在的时候呢？

返回 `[-1, -1]` 表示没找到。

3) 主要区别在于 target 存在，且有多个值的时候。

这里个人的思路是可以通过基础的二分查找法先找到一个 target 的 index

然后向左找到最左边的值，向右找到最右边的值。

## 实现

```java
    public int[] searchRange(int[] nums, int target) {
        int index = binarySearch(nums, target);
        if(index == -1) {
            return new int[]{-1, -1};
        }

        // 左右遍历，找到结果
        int left = index;
        int right = index;

        while (left > 0) {
            if(nums[left-1] == target) {
                left--;
            } else {
                break;
            }
        }
        while (right < nums.length-1) {
            if(nums[right+1] == target) {
                right++;
            } else {
                break;
            }
        }

        return new int[]{left, right};
    }


    public int binarySearch(int[] nums, int target) {
        // 二分查找
        int left = 0;
        int right = nums.length-1;

        while (left <= right) {
            // 中点
            int mid = left + (right - left) / 2;
            int midVal = nums[mid];
            if(target == midVal) {
                return mid;
            }

            // 小于，那么目标值应该在右边
            if(midVal < target) {
                left = mid+1;
            }
            // 大于，则目标值应该在左边
            if(midVal > target) {
                right = mid-1;
            }
        }

        // not found
        return -1;
    }
```

## 效果

直接击败 100%，效果拔群。

根绝这题也没有什么区分度。

# v2-二分查找递归版本

其实二分法，就是将问题拆分为更小的子问题。

那么，就可以使用递归直接来写。

和 T704 类似。

## 思路

和循环版本类似，我们定义查找的 left、right 指针

1）终止条件

left > right，没找到 left

left < right, `arr[mid] == target` 返回。

2）递归

对比大小

如果 `arr[mid] > target`，左侧递归 

如果 `arr[mid] < target`，右侧递归 

3) 根据结果，类似上面循环版本，处理一下结果即可。

## 解法

```java
    public int[] searchRange(int[] nums, int target) {
        int index = binarySearch(nums, target, 0, nums.length-1);
        if(index == -1) {
            return new int[]{-1, -1};
        }

        // 左右遍历，找到结果
        int left = index;
        int right = index;

        while (left > 0) {
            if(nums[left-1] == target) {
                left--;
            } else {
                break;
            }
        }
        while (right < nums.length-1) {
            if(nums[right+1] == target) {
                right++;
            } else {
                break;
            }
        }

        return new int[]{left, right};
    }


    public int binarySearch(int[] nums, int target, int left, int right) {
        if(left > right) {
            return -1;
        }

        int mid = left + (right-left) / 2;
        int midVal = nums[mid];
        if(midVal == target) {
            return mid;
        }

        // 小，去右边
        if(midVal < target) {
            return binarySearch(nums, target, mid+1, right);
        }
        return binarySearch(nums, target, left, mid-1);
    }
```

## 效果

执行用时分布 100%

# v3-纯二分的迭代版本

## 改进点

上面二种解法，先用二分找目标值，再向两边线性扫描确定左右边界，时间复杂度是 `O(log n + k)`，其中 k 是目标值出现的次数。

对于目标值重复很多的情况，比如 `[2,2,2,2,2]`，它会退化成线性时间。

所以这一题的测试用例其实区分度是不够的。

## 思路

我们可以把最大值、最小值改为两次二分法的查询。

一次找到最大值，一次找到最小值。

和经典二分的区别在于，在等于的时候不要直接返回。

而是继续迭代寻找，不过此时就需要一个临时变量记录一下，而不是像以前一样，直接返回 mid 索引。

提升度在哪里呢？

提升在左右寻找的时候，是通过二分的方式快速 skip 的，而不是向上面一步步移动。

## 实现

```java
    public int[] searchRange(int[] nums, int target) {
        // 左右遍历，找到结果
        int left = binarySearchFirst(nums, target);
        int right = binarySearchLast(nums, target);

        return new int[]{left, right};
    }


    public int binarySearchFirst(int[] nums, int target) {
        int res = -1;
        int left = 0;
        int right = nums.length-1;

        while (left <= right) {
            int mid = left + (right - left) / 2;

            // 第一个，那么大于等于的 target 时候，继续往左边
            // 这里等于，并不是直接返回
            if(nums[mid] >= target) {
                right = mid-1;
            } else {
                left = mid+1;
            }

            // 临时记录一下 res，避免往左找不到了
            if(nums[mid] == target) {
                res = mid;
            }
        }

        return res;
    }

    public int binarySearchLast(int[] nums, int target) {
        int res = -1;
        int left = 0;
        int right = nums.length-1;

        while (left <= right) {
            int mid = left + (right - left) / 2;

            // 第一个，那么小于等于的 target 时候，继续往右边
            // 这里等于，并不是直接返回
            if(nums[mid] <= target) {
                left = mid+1;
            } else {
                right = mid-1;
            }

            // 临时记录一下 res，避免往左找不到了
            if(nums[mid] == target) {
                res = mid;
            }
        }

        return res;
    }
```



# v4-纯二分的递归

## 思路

我们来对比经典版本的二分法来考虑如何改写。

1) 等于 target 值的时候不能直接返回，而是 findFirst 的时候，向左继续迭代。

如果找到了，继续迭代

如果没找到，则直接返回位置

2) 等于 target 值的时候不能直接返回，而是 findLast 的时候，向右继续迭代。

如果找到了，继续迭代

如果没找到，则直接返回位置

3）其他大于、小于的场景和原来一样

## 解法

```java
    public int[] searchRange(int[] nums, int target) {
        // 左右遍历，找到结果
        int left = binarySearchFirst(nums, target, 0, nums.length-1);
        int right = binarySearchLast(nums, target, 0, nums.length-1);

        return new int[]{left, right};
    }


    public int binarySearchFirst(int[] nums, int target, int left, int right) {
        // NOT FOUND
        if(left > right) {
            return -1;
        }

        int mid = left + (right - left) / 2;
        int midVal = nums[mid];

        // 小于，则在右边
        if(midVal < target) {
            return binarySearchFirst(nums, target, mid+1, right);
        }
        // 大于，则在左边
        if(midVal > target) {
            return binarySearchFirst(nums, target, left, mid-1);
        }

        // 等于的时候，需要进一步处理向左边寻找
        int temp = binarySearchFirst(nums, target, left, mid-1);
        // 存在重复值，则为左边的
        if(temp != -1) {
            return temp;
        }
        // 不存在重复，就是 mid 值
        return mid;
    }

    public int binarySearchLast(int[] nums, int target, int left, int right) {
        // NOT FOUND
        if(left > right) {
            return -1;
        }

        int mid = left + (right - left) / 2;
        int midVal = nums[mid];

        // 小于，则在右边
        if(midVal < target) {
            return binarySearchLast(nums, target, mid+1, right);
        }
        // 大于，则在左边
        if(midVal > target) {
            return binarySearchLast(nums, target, left, mid-1);
        }

        // 等于的时候，需要进一步处理向右边寻找
        int temp = binarySearchLast(nums, target, mid+1, right);
        // 存在重复值，则为左边的
        if(temp != -1) {
            return temp;
        }
        // 不存在重复，就是 mid 值
        return mid;
    }
```

## 效果

超过 100%

这里递归的时候，其实上边的逻辑非常干净。

我们只需要考虑清楚，重复的时候用递归在查询一次即可。

# 补充-可视化效果

> [可视化效果](https://houbb.github.io/leetcode-visual/T034-binary-search-range.html)

# 项目开源

> [技术博客](https://houbb.github.io/)

> [leetcode-visual 资源可视化](https://github.com/houbb/leetcode-visual)

> [leetcode 算法实现](https://github.com/houbb/leetcode)

# 小结

希望本文对你有帮助，如果有其他想法的话，也可以评论区和大家分享哦。

各位极客的点赞收藏转发，是老马持续写作的最大动力！

下一节我们将讲解二分的实战题目，感兴趣的小伙伴可以关注一波，精彩内容，不容错过。

# 参考资料

https://leetcode.cn/problems/binary-search/description/

* any list
{:toc}
