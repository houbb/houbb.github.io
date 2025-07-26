---
layout: post
title:  二分查找法？binary-search-02-leetcode 875.  
date:  2020-6-8 15:13:08 +0800
categories: [Algorithm]
tags: [algorithm, data-struct, topics, leetcode, binary-search, sf]
published: true
---


# 二分查找算法

大家好，我是老马。

今天我们一起来学习一下数组密切相关的二分查找算法力扣实战。

我们来看一下二分法在某个值的范围内，寻找**最小/最大满足条件的值**的场景。

# 875. 爱吃香蕉的珂珂

珂珂喜欢吃香蕉。这里有 n 堆香蕉，第 i 堆中有 piles[i] 根香蕉。

警卫已经离开了，将在 h 小时后回来。

珂珂可以决定她吃香蕉的速度 k （单位：根/小时）。

每个小时，她将会选择一堆香蕉，从中吃掉 k 根。如果这堆香蕉少于 k 根，她将吃掉这堆的所有香蕉，然后这一小时内不会再吃更多的香蕉。  

珂珂喜欢慢慢吃，但仍然想在警卫回来前吃掉所有的香蕉。

返回她可以在 h 小时内吃掉所有香蕉的最小速度 k（k 为整数）。

示例 1：

输入：piles = [3,6,7,11], h = 8
输出：4

示例 2：

输入：piles = [30,11,23,4,20], h = 5
输出：30

示例 3：

输入：piles = [30,11,23,4,20], h = 6
输出：23
 

提示：

1 <= piles.length <= 10^4
piles.length <= h <= 10^9
1 <= piles[i] <= 10^9

# v1-暴力循环

## 思路

最朴素的暴力循环的方式

从1开始循环，大于则中断？

当然，这个特别慢。

这里最主要的是要考虑出暴力中的上下界。

每小时的速度：

```
最小=1     因为int是整数，不能返回0
最大=piles 中的最大值，因为一个小时最多吃一堆
```

所以，暴力解法成为了在 [1, maxPileVal] 中找到一个最小值，满足条件。

## 实现

```java
public int minEatingSpeed(int[] piles, int h) {
    Arrays.sort(piles);
    int minVal = 1;
    int maxVal = piles[piles.length-1];
    for(int speed = minVal; speed <= maxVal; speed++) {
        // 总的耗时
        int totalCost = 0;
        for(int pile : piles) {
            int num = pile / speed;
            // 不整除
            if(pile % speed != 0) {
                num++;
            }
            totalCost += num;
        }
        if(totalCost <= h) {
            return speed;
        }
    }
    return -1;
}
```

这里唯一要注意的就是考虑整除的场景，不整除要多加1。

## 效果

解答错误 8 / 126 个通过的测试用例

输入

```
piles =
[332484035,524908576,855865114,632922376,222257295,690155293,112677673,679580077,337406589,290818316,877337160,901728858,679284947,688210097,692137887,718203285,629455728,941802184]

h =
823855818
```

输出 1
预期结果 14

## 为什么错了？

这个案例的累计值太大了，我们可能会溢出。

这考虑的也太早了，这么早的案例就搞一个溢出。

## 修正

我们用 long 来替代 int

```java
public int minEatingSpeed(int[] piles, int h) {
        Arrays.sort(piles);
        int minVal = 1;
        int maxVal = piles[piles.length-1];
        for(int speed = minVal; speed <= maxVal; speed++) {
            // 总的耗时
            long totalCost = 0;
            for(int pile : piles) {
                long num = pile / speed;
                // 不整除
                if(pile % speed != 0) {
                    num++;
                }
                totalCost += num;
            }
            if(totalCost <= h) {
                return speed;
            }
        }
        return -1;
    }
```

### 效果

超出时间限制 108 / 126 个通过的测试用例

预料之中，不过已经很接近了。


# v2-二分法迭代

## 思路

我们知道了范围之后，一步步的迭代，自然是最慢的。

那么有没有更快的方法？

相信大家会自然的联想到二分法来解决。

这里有一个注意点：

1）要求的是 h 小时内的最小值，所以返回条件不是等于。

## 解法

```java
    public int minEatingSpeed(int[] piles, int h) {
        Arrays.sort(piles);
        int left = 1;
        int right = piles[piles.length-1];

        while (left <= right) {
            // 避免越界
            int mid = left + (right-left) / 2 ;

            // 计算总的耗时
            // 总的耗时
            long totalCost = 0;
            for(int pile : piles) {
                long num = pile / mid;
                // 不整除
                if(pile % mid != 0) {
                    num++;
                }
                totalCost += num;
            }

            // 要求的 h 内的最小值，所以不应该是 ==h
            if(totalCost <= h) {
                right = mid-1;
            } else {
                // 慢了
                left = mid+1;
            }
        }

        // 最后的值？
        return left;
    }
```

## 效果

18ms 击败 17.87%

为什么？还有高手？

## v2-的一些优化

依然认为是 v2 方法

### 思路

就算是二分，我们依然可以有 3 点可以优化：

1）totalCost 计算超过 h 之后，快速失败。后续不需要再计算

2）num 的除法向上取整优化

这个影响也挺大的，但是不太好记得住。

二者在数学上的相等，是可以严格证明的。

3）排序过于耗时，实际上我们只需要一个最大值

排序我们知道，比较好的也是 O(nlogn)，但是最大值只需要 O(N)

实际测试这个影响比较大。

不改的话击败 27.7%，改的话 67.66%。

### 代码如下

```java
public int minEatingSpeed(int[] piles, int h) {
    // 替代排序
    int right = 0;
    for(int pile : piles) {
        right = Math.max(pile, right);
    }

    int left = 1;
    while (left <= right) {
        int mid = left + (right-left) / 2 ;
        // 计算总的耗时
        // 总的耗时
        long totalCost = 0;
        for(int pile : piles) {
            // 替代 ceil
            long num = (pile + mid - 1) / mid;

            totalCost += num;

            // 快速失败
            if (totalCost > h) break; 
        }
        // 要求的 h 内的最小值，所以不应该是 ==h
        if(totalCost <= h) {
            right = mid-1;
        } else {
            // 慢了
            left = mid+1;
        }
    }
    // 最后的值？
    return left;
}
```

### 效果

7ms 击败 67.66%

依然不是最优。

## 其他优化思路

看了一下比较好的解法，其实是对上下界的进一步优化。

没必要从 1 到 max 不是吗？

### 实现

这里只摘抄一下 left right 的定界部分，其他解法是一样的。

```java
int n = piles.length;
int max = 0;
long sum = 0;
for (int pile : piles) {
    if (pile > max) {
        max = pile;
    }
    sum += pile;
}

int left = (int) ((sum + h - 1) / h);  // 平均值向上取整
int right = (int) Math.min(max, (sum - n + 1) / (h - n + 1) + 1);
```

但是这个计算挺难想到的，可以作为一直思路，笔试的过程中写的话会容易出错。


# v3-递归


## 思路

类似的，我们可以给出递归版本

## 实现

```java
    public int minEatingSpeed(int[] piles, int h) {
        int right = 0;
        for(int pile : piles) {
            right = Math.max(pile, right);
        }
        int left = 1;

        return minEatingSpeedRecursive(piles, h, left, right);
    }

    public int minEatingSpeedRecursive(int[] piles, int h, int left, int right) {
        // 终止条件？
        if(left > right) {
            return left;
        }

        // 避免越界
        int mid = left + (right-left) / 2;

        // 计算总的耗时
        long totalCost = 0;
        for(int pile : piles) {
            long num = (pile + mid - 1) / mid;
            totalCost += num;

            if (totalCost > h) break; // 剪枝
        }

        // 要求的 h 内的最小值，所以不应该是 ==h
        if(totalCost <= h) {
            // 在左侧
            return minEatingSpeedRecursive(piles, h, left, mid-1);
        } else {
            // 慢了 去速度的右侧
            return minEatingSpeedRecursive(piles, h, mid+1, right);
        }
    }
```

## 效果

6ms 击败 99.06%

总体耗时类似，差了 1ms，比例差了很多。

# 补充-可视化效果

> [可视化效果](https://houbb.github.io/leetcode-visual/T875-binary-search-eat-banana.html)

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
