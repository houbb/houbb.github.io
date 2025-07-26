---
layout: post
title:  二分查找法？binary-search-02-leetcode 1011. 在 D 天内送达包裹的能力
date:  2020-6-8 15:13:08 +0800
categories: [Algorithm]
tags: [algorithm, data-struct, topics, leetcode, binary-search, sf]
published: true
---


# 二分查找算法

大家好，我是老马。

今天我们一起来学习一下数组密切相关的二分查找算法力扣实战。

我们来看一下二分法在某个值的范围内，寻找**最小/最大满足条件的值**的场景。

# 1011. 在 D 天内送达包裹的能力

传送带上的包裹必须在 days 天内从一个港口运送到另一个港口。

传送带上的第 i 个包裹的重量为 weights[i]。

每一天，我们都会按给出重量（weights）的顺序往传送带上装载包裹。我们装载的重量不会超过船的最大运载重量。

返回能在 days 天内将传送带上的所有包裹送达的船的最低运载能力。

示例 1：

输入：weights = [1,2,3,4,5,6,7,8,9,10], days = 5
输出：15
解释：
船舶最低载重 15 就能够在 5 天内送达所有包裹，如下所示：
第 1 天：1, 2, 3, 4, 5
第 2 天：6, 7
第 3 天：8
第 4 天：9
第 5 天：10

请注意，货物必须按照给定的顺序装运，因此使用载重能力为 14 的船舶并将包装分成 (2, 3, 4, 5), (1, 6, 7), (8), (9), (10) 是不允许的。 

示例 2：

输入：weights = [3,2,2,4,1,4], days = 3
输出：6
解释：
船舶最低载重 6 就能够在 3 天内送达所有包裹，如下所示：
第 1 天：3, 2
第 2 天：2, 4
第 3 天：1, 4

示例 3：

输入：weights = [1,2,3,1,1], days = 4
输出：3
解释：
第 1 天：1
第 2 天：2
第 3 天：3
第 4 天：1, 1
 

提示：

1 <= days <= weights.length <= 5 * 10^4
1 <= weights[i] <= 500

# v1-暴力循环

## 思路

最朴素的暴力循环的方式

我们首先想办法，确定船的承受重量上下限。

但是这一题和 T875 爱吃香蕉的珂珂还是不同的。这个货物的重量不允许排序，必须按照给出的顺序来处理。

最朴素的思想，然后才考虑优化问题

1）最小值

必须要能放下最大的货物？不然一个就会运不了

`min = max(weights[i])`

2) 最大值

最多其实到把所有的货物一次性装完？

`max = sum(weights[i])`

因为我们是从 min 到 max 逐步处理的，上限主要会影响到二分法。

那么，对于 days 的作用呢？

## 解法

暴力的话其实没有什么技巧，全是对结题的渴望。

```java
    public int shipWithinDays(int[] weights, int days) {
        // 最小
        long left = 0;
        // 最大
        long right = 0;

        for(int weight : weights) {
            left = Math.max(weight, left);

            // 会不会越界？
            right += weight;
        }

        // force
        for(long weightLimit = left; weightLimit <= right; weightLimit++) {
            // 计算的是天数？

            long totalDays = 0;
            long tempWeight = 0;
            for(int weight : weights) {
                // 超出+1 清空
                if(tempWeight + weight > weightLimit) {
                    totalDays++;
                    tempWeight = 0;

                    // 快速失败
                    if(totalDays > days) {
                        break;
                    }
                }

                // 继续增加
                tempWeight += weight;

                // 快速失败
            }

            // 剩余的
            if(tempWeight > 0) {
                totalDays++;
            }

            // 满足
            if(totalDays <= days) {
                return Math.toIntExact(weightLimit);
            }
        }

        return -1;
    }
```


## 效果

超出时间限制 85 / 88 个通过的测试用例

超时意料之中。

我们先不对上限做任何优化，尝试一下二分法。

# v2-二分法迭代

## 思路

我们知道了范围之后，一步步的迭代，自然是最慢的。

那么有没有更快的方法？

相信大家会自然的联想到二分法来解决。

这里有一个注意点：

1）要求的是 days 内的最小值，所以返回条件不是等于。和 T853 类似。

## 解法

```java
    public int shipWithinDays(int[] weights, int days) {
        // 最小
        long left = 0;
        // 最大
        long right = 0;

        for(int weight : weights) {
            left = Math.max(weight, left);

            // 会不会越界？
            right += weight;
        }

        while (left <= right) {
            int mid = Math.toIntExact(left + (right - left) / 2);

            int totalDays = calcTotalDays(weights, days, mid);
            // 满足条件的最小值 继续向左边去
            if(totalDays <= days) {
                right = mid-1;
            } else {
                left = mid+1;
            }
        }

        return Math.toIntExact(left);
    }

    private int calcTotalDays(int[] weights, int days, int weightLimit) {
        long totalDays = 0;
        long tempWeight = 0;
        for(int weight : weights) {
            // 超出+1 清空
            if(tempWeight + weight > weightLimit) {
                totalDays++;
                tempWeight = 0;

                // 快速失败
                if(totalDays > days) {
                    break;
                }
            }

            // 继续增加
            tempWeight += weight;
        }

        // 剩余的
        if(tempWeight > 0) {
            totalDays++;
        }

        return Math.toIntExact(totalDays);
    }
```

## 效果

13ms 击败 46.08%

## 这个上限要如何优化呢？

看了下别人的优化策略，主要是 right 的区别。

```java
int n = weights.length;
int max = 0;
for(int x : weights){
    max = Math.max(max,x);
}
int left = max,right = ((n + days - 1)/days) * max;
```

这种估算的优势问题还是在于测试用例不平均导致的。

比如场景：

```
weights = [1, 1, 1, 1000]
days = 2
```

用我们 sum=1003

但是用 `((n + days - 1)/days) * max = ((4+2-1) / 2) * 1000` = 2000

实际上并不会比我们的 sum 有多少优势。

个人理解没必要因为测试用例的不均匀，而调整算法本身。

如果货物均匀，这种优化则是有必要的。

或者我们将其整合起来。

### 实现

```java
public int shipWithinDays(int[] weights, int days) {
        int n = weights.length;
        int max = 0;
        int sum = 0;
        for(int x : weights){
            max = Math.max(max,x);
            sum += x;
        }
        // 比较均匀时
        int avgRight = ((n + days - 1)/days) * max;
        int left = max;
        // 取二者最小值
        int right = Math.min(avgRight, sum);

        while (left <= right) {
            int mid = Math.toIntExact(left + (right - left) / 2);

            int totalDays = calcTotalDays(weights, days, mid);
            // 满足条件的最小值 继续向左边去
            if(totalDays <= days) {
                right = mid-1;
            } else {
                left = mid+1;
            }
        }

        return Math.toIntExact(left);
    }

    private int calcTotalDays(int[] weights, int days, int weightLimit) {
        long totalDays = 0;
        long tempWeight = 0;
        for(int weight : weights) {
            // 超出+1 清空
            if(tempWeight + weight > weightLimit) {
                totalDays++;
                tempWeight = 0;

                // 快速失败
                if(totalDays > days) {
                    break;
                }
            }

            // 继续增加
            tempWeight += weight;
        }

        // 剩余的
        if(tempWeight > 0) {
            totalDays++;
        }

        return Math.toIntExact(totalDays);
    }
```

### 效果

8ms 击败 96.79%

# v3-递归

按照老马的个人惯例，我们先把递归补全。

## 思路

类似的，我们可以给出递归版本

## 实现

```java
    public int shipWithinDays(int[] weights, int days) {
        // 最小
        int left = 0;
        // 最大
        int right = 0;

        for(int weight : weights) {
            left = Math.max(weight, left);
            // 会不会越界？
            right += weight;
        }

        return shipWithinDaysRecursive(weights, days, left, right);
    }

    private int shipWithinDaysRecursive(int[] weights, int days, int left, int right) {
        // end
        if(left > right) {
            return left;
        }

        int mid = Math.toIntExact(left + (right - left) / 2);

        int totalDays = calcTotalDays(weights, days, mid);
        // 满足条件的最小值 继续向左边去
        if(totalDays <= days) {
            return shipWithinDaysRecursive(weights, days, left, mid-1);
        } else {
            return shipWithinDaysRecursive(weights, days, mid+1, right);
        }
    }

    private int calcTotalDays(int[] weights, int days, int weightLimit) {
        long totalDays = 0;
        long tempWeight = 0;
        for(int weight : weights) {
            // 超出+1 清空
            if(tempWeight + weight > weightLimit) {
                totalDays++;
                tempWeight = 0;

                // 快速失败
                if(totalDays > days) {
                    break;
                }
            }

            // 继续增加
            tempWeight += weight;
        }

        // 剩余的
        if(tempWeight > 0) {
            totalDays++;
        }

        return Math.toIntExact(totalDays);
    }
```

## 效果

13 ms 击败 46.08%

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
