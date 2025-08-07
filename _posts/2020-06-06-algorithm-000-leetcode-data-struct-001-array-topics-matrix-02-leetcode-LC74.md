---
layout: post
title:  【leetcode】力扣矩阵 matrix -01-LC74. 搜索二维矩阵 search-a-2d-matrix
date:  2020-6-8 15:13:08 +0800
categories: [Algorithm]
tags: [algorithm, data-struct, matrix, binary-search, leetcode]
published: true
---

# 开源地址

为了便于大家学习，所有实现均已开源。欢迎 fork + star~

> [https://github.com/houbb/leetcode](https://github.com/houbb/leetcode)

# 74. 搜索二维矩阵

给你一个满足下述两条属性的 m x n 整数矩阵：

每行中的整数从左到右按非严格递增顺序排列。
每行的第一个整数大于前一行的最后一个整数。
给你一个整数 target ，如果 target 在矩阵中，返回 true ；否则，返回 false 。

示例 1：

![1](https://assets.leetcode.com/uploads/2020/10/05/mat.jpg)

输入：matrix = [[1,3,5,7],[10,11,16,20],[23,30,34,60]], target = 3
输出：true

示例 2：

![2](https://assets.leetcode-cn.com/aliyun-lc-upload/uploads/2020/11/25/mat2.jpg)

输入：matrix = [[1,3,5,7],[10,11,16,20],[23,30,34,60]], target = 13
输出：false
 

提示：

m == matrix.length
n == matrix[i].length
1 <= m, n <= 100
-10^4 <= matrix[i][j], target <= 10^4


# 类似题目

因为我是先做的 LC240，所以是直接copy过来的。

[【leetcode】力扣矩阵 matrix -01-LC240. 搜索二维矩阵 II search-a-2d-matrix-ii](https://houbb.github.io/2020/06/08/algorithm-000-leetcode-data-struct-001-array-topics-matrix-02-leetcode-LC240)

# v1-暴力

## 思路

直接全遍历

## 实现

```java
public boolean searchMatrix(int[][] matrix, int target) {
        for(int i = 0; i < matrix.length; i++) {
            for(int j = 0; j < matrix.length; j++) {
                if(matrix[i][j] == target) {
                    return true;
                }
            }
        }
        
        return false;
    }
```

## 效果

0ms 击败 100.00%

## 复杂度

TC O(m*n)

这一题的测试用例没有区分度。

## 反思

看到有序，看到查找，应该想到二分法。

# v2-单边的二分法

## 思路

我们最容易想到的是，是在某一行、某一列加一下对应的二分查找信息。

## 实现

```java
    public boolean searchMatrix(int[][] matrix, int target) {
        for(int i = 0; i < matrix.length; i++) {
            int[] nums = matrix[i];
            int index = binarySearch(nums, target);
            if(index > -1) {
                return true;
            }
        }

        return false;
    }


    // 返回对应的位置
    private int binarySearch(int[] nums, int target) {
        // 提前判断这一行是否可能存在
        if(target < nums[0] || target > nums[nums.length-1]) {
            return -1;
        }

        int left = 0;
        int right = nums.length-1;

        // 要等于吗？
        while (left <= right) {
            int mid = left + (right-left) / 2;
            if(nums[mid] == target) {
                return mid;
            } else if(nums[mid] > target ) {
                // 太大，那么就去左边
                right = mid-1;
            } else {
                // 太小，在右边
                left = mid+1;
            }
        }

        return -1;
    }
```

## 效果

0ms 100%

## 复杂度

TC: O(m * log n)

略有提升。

## 反思

但是因为行+列都是有序的。

有没有办法可以同时加速呢？

# v3-z字抖动

## 思路

对于一位有序，我们左右移动，来找到合适的位置。因为有序二分可以尽可能的排除掉不合适的数字。

那么推广到二维呢？

其实和二分类似，只不过我们一次移动一步。

## 例子

以一个示例矩阵举例：

```
matrix = [
  [ 1,  4,  7, 11],
  [ 2,  5,  8, 12],
  [ 3,  6,  9, 16],
  [10, 13, 14, 17]
]
```

### 想法推导思路：

1. **观察二维有序性** → 行和列都是递增的
2. **尝试从某个“边界角落”开始**：

   * 左上角？两个方向都增大 → 无法决策 ❌
   * 右下角？两个方向都减小 → 也不适合 ❌
   * 左下角？上是减小，右是增大 → 可行 ✅
   * 右上角？左是减小，下是增大 → 最直观 ✅✅
3. **每次移动能排除一行或一列**，复杂度降到 O(m+n)


### 右上角出发

假设我们从 **右上角 `matrix[0][n-1]` = 11** 开始，看看四周的数据如何变化：

🎯 如何根据比较结果移动？

假设 `target = 9`，从 `11` 开始：

* 11 > 9，太大了 → 往左（列--）
* 到了 7，7 < 9，太小了 → 往下（行++）
* 到了 8，还是小 → 行++
* 到了 9，找到了 ✅

✅ 总结出策略：

从右上角开始，每次根据当前值和 `target` 的比较，**只需要做一个决策**：

* 如果当前值 > target → 往左（col--）
* 如果当前值 < target → 往下（row++）
* 如果相等 → 找到了！


## 实现

我们把二分，改成了从右上角来一步步移动

```java
public boolean searchMatrix(int[][] matrix, int target) {
        int m = matrix.length;
        int n = matrix[0].length;

        // 从右上角开始
        int row = 0;
        int col = n - 1;
        // 往左走，变小   往下走，变大
        // 要求：左边 >= 0   下边 < m

        while (row < m && col >= 0) {
            int cur = matrix[row][col];
            if(cur == target) {
                return true;
            }
            if(cur > target) {
                col--;
            }
            if(cur < target) {
                row++;
            }
        }

        return false;
    }
```

## 效果

0ms 100%

## 复杂度

O(m + n)	最优，空间 O(1)，适合面试

## 反思

这种很多都是借助以前的空间，牺牲了可读性。

作为思维训练勉强可用。

# v4-二分法

## 思路

其实这一题的用例应该设计的更加复杂一些。

不然很多解法体现不出任何优势。

这一题和 TC240 不同的是完全有序。所以直接可以使用二分法

问题是，必须要放在一维数组中才能二分吗？

答案肯定是否定的。

我们直接可以将二维转换为一维

```java
left = 0;
right = m*n - 1;
mid = left + (right-left) / 2;
```

如何映射回二维呢？

```
matrix[mid / n][mid % n];
```

其他的全部按照二分法来实现

## 实现

```java
public boolean searchMatrix(int[][] matrix, int target) {
        int m = matrix.length;
        int n = matrix[0].length;

        int left = 0;
        int right = m*n-1;
        while (left <= right) {
            int mid = left + (right-left) / 2;
            int midVal = matrix[mid / n][mid % n];

            if(midVal == target) {
                return true;
            } else if(midVal < target) {
                // 小 去右边
                left = mid+1;
            } else {
                right = mid-1;
            }
        }

        return false;
    }
```

## 效果

0ms 100%

## 复杂度

TC: O(lg(m*n))

## 反思

这种二分是这一题的最佳解法。

同时学会计算复杂度也比较重要。

# 小结

希望本文对你有帮助，如果有其他想法的话，也可以评论区和大家分享哦。

各位极客的点赞收藏转发，是老马持续写作的最大动力！

感兴趣的小伙伴可以关注一波，精彩内容，不容错过。

# 参考资料

* any list
{:toc}