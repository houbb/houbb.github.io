---
layout: post
title:  【leetcode】58-差分数组（Difference Array） 1854. 人口最多的年份 maximum-population-year
date:  2020-6-8 15:13:08 +0800
categories: [Algorithm]
tags: [algorithm, prefix-sum, difference-array, leetcode]
published: true
---

# 开源地址

为了便于大家学习，所有实现均已开源。欢迎 fork + star~

> [https://github.com/houbb/leetcode](https://github.com/houbb/leetcode)

# 1854. 人口最多的年份 

给你一个二维整数数组 logs ，其中每个 logs[i] = [birthi, deathi] 表示第 i 个人的出生和死亡年份。

年份 x 的 人口 定义为这一年期间活着的人的数目。

第 i 个人被计入年份 x 的人口需要满足：x 在闭区间 [birthi, deathi - 1] 内。

注意，人不应当计入他们死亡当年的人口中。

返回 人口最多 且 最早 的年份。

示例 1：

输入：logs = [[1993,1999],[2000,2010]]
输出：1993
解释：人口最多为 1 ，而 1993 是人口为 1 的最早年份。

示例 2：

输入：logs = [[1950,1961],[1960,1971],[1970,1981]]
输出：1960
解释： 
人口最多为 2 ，分别出现在 1960 和 1970 。
其中最早年份是 1960 。
 

提示：

1 <= logs.length <= 100
1950 <= birthi < deathi <= 2050

# 这题什么意思

首先这题表达的不那么清晰，没有给出特别细的例子，可能有误解。

其实每一个位置 `[1993,1999]` 表示第 i 个人，1993 年生，1999 死。

那么他活着的年份，范围是 `[1993, 1998-1]`，第 1999 年人死了，不应该计入人口。

# v1-暴力

## 思路

我们用最笨的方法，计算每一年到底有多少人是活着的。

从 1950~2050 循环 100 次。

## 思路

```java
    public int maximumPopulation(int[][] logs) {
        int maxCount = 0;
        int maxYear = 0;

        for(int year = 1950; year <= 2050; year++) {
            int aliveCount = 0;
            // 判断一个人是否活着
            for(int i = 0; i < logs.length; i++) {
                int[] person = logs[i];

                // 在这一年 or 之前出生
                // 在这一年之后死亡
                if(person[0] <= year
                        && person[1] > year) {
                    aliveCount++;
                }
            }

            // 更新
            if(aliveCount > maxCount) {
                maxYear = year;
                maxCount = aliveCount;
            }
        }
        return maxYear;
    }
```

## 效果

1ms 击败 31.69%

## 反思

如何进一步优化？

# v2-差分

## 思路

诚然，我们可以直接使用差分数组来改进。

或者说用 HashMap 一样的。

就是记录每一年有多少人活着，

map 的适应性更强，array 的性能更好。

这里我们只演示差分数组。

## 说明

我们可以很简单的得到每一年生死的差异信息。

所以可以构建出差分数组，不过注意使用的时候要加回来。

## 实现

```java
    public int maximumPopulation(int[][] logs) {
        // 差异101年
        int[] differArray = new int[101];
        for(int[] ints : logs) {
            differArray[ints[0]-1950]++; //birth
            differArray[ints[1]-1950]--; //death
        }

        int maxCount = 0;
        int maxYear = 0;
        int currentNum = 0;
        for(int year = 0; year < 101; year++) {
            // 当前的人数
            currentNum += differArray[year];

            if(currentNum > maxCount) {
                maxYear = year+1950;
                maxCount = currentNum;
            }
        }
        return maxYear;
    }
```

## 效果

0ms 100%

复杂度也是 O(n) 级别，很优秀。或者说常数级别，这里只有 100 年。

人口再多，应该也是差异不大，伟大的算法！

# 小结

希望本文对你有帮助，如果有其他想法的话，也可以评论区和大家分享哦。

各位极客的点赞收藏转发，是老马持续写作的最大动力！

感兴趣的小伙伴可以关注一波，精彩内容，不容错过。

# 参考资料

* any list
{:toc}