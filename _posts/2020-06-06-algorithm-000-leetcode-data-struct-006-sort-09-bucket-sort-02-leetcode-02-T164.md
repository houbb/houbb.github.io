---
layout: post
title: leetcode sort 排序-09-bucket sort 164. 最大间距 
date:  2020-6-8 15:13:08 +0800
categories: [Algorithm]
tags: [algorithm, sort, sf]
published: true
---

# 排序系列

[sort-00-排序算法汇总](https://houbb.github.io/2016/07/14/sort-00-overview-sort)

[sort-01-bubble sort 冒泡排序算法详解](https://houbb.github.io/2016/07/14/sort-01-bubble-sort)

[sort-02-QuickSort 快速排序到底快在哪里？](https://houbb.github.io/2016/07/14/sort-02-quick-sort)

[sort-03-SelectSort 选择排序算法详解](https://houbb.github.io/2016/07/14/sort-03-select-sort)

[sort-04-heap sort 堆排序算法详解](https://houbb.github.io/2016/07/14/sort-04-heap-sort)

[sort-05-insert sort 插入排序算法详解](https://houbb.github.io/2016/07/14/sort-05-insert-sort)

[sort-06-shell sort 希尔排序算法详解](https://houbb.github.io/2016/07/14/sort-06-shell-sort)

[sort-07-merge sort 归并排序](https://houbb.github.io/2016/07/14/sort-07-merge-sort)

[sort-08-counting sort 计数排序](https://houbb.github.io/2016/07/14/sort-08-counting-sort)

[sort-09-bucket sort 桶排序](https://houbb.github.io/2016/07/14/sort-09-bucket-sort)

[sort-10-bigfile 大文件外部排序](https://houbb.github.io/2016/07/14/sort-10-bigfile-sort)

# 前言

大家好，我是老马。

以前从工程的角度，已经梳理过一次排序算法。

这里从力扣算法的角度，重新梳理一遍。

核心内容包含：

1）常见排序算法介绍

2）背后的核心思想

3）leetcode 经典题目练习+讲解

4）应用场景、优缺点等对比总结

5）工程 sdk 包，这个已经完成。

6) 可视化

# 164. 最大间距

给定一个无序的数组 nums，返回 数组在排序之后，相邻元素之间最大的差值 。

如果数组元素个数小于 2，则返回 0 。

您必须编写一个在「线性时间」内运行并使用「线性额外空间」的算法。

示例 1:

输入: nums = [3,6,9,1]
输出: 3
解释: 排序后的数组是 [1,3,6,9], 其中相邻元素 (3,6) 和 (6,9) 之间都存在最大差值 3。
示例 2:

输入: nums = [10]
输出: 0
解释: 数组元素个数小于 2，因此返回 0。
 

提示:

1 <= nums.length <= 10^5
0 <= nums[i] <= 10^9


# v1-排序+判断

## 思路

我们按照题意来实现，先排序，然后判断最大的 gap 即可。

## 实现

```java
    public int maximumGap(int[] nums) {
        Arrays.sort(nums);

        int maxGap = 0;
        
        for(int i = 1; i < nums.length; i++) {
            maxGap = Math.max(nums[i]-nums[i-1], maxGap);
        }
        
        return maxGap;
    }
```

## 效果

44ms 击败 57.97%

很直观，不过不符合题意。

# v2-桶排序

## 思路

直接用间距为1的桶，进行桶排序。

## 实现

```java
public static int maximumGap(int[] nums) {
        int min = Integer.MAX_VALUE;
        int max = Integer.MIN_VALUE;

        for(int i = 0; i < nums.length; i++) {
            int num = nums[i];
            if(num > max) {
                max = num;
            }
            if(num < min) {
                min = num;
            }
        }

        // 最大值和最小值相同
        if(min == max) {
            return 0;
        }

        // 创建桶
        int[] buckets = new int[max-min+1];

        for(int i = 0; i < nums.length; i++) {
            int num = nums[i];
            buckets[num-min]++;
        }

        // 问题就变成了寻找连续为0的桶的个数？
        int maxZeroCount = 0;
        int zeroCount = 0;
        for(int i = 0; i < buckets.length; i++) {
            if(buckets[i] != 0) {
                maxZeroCount = Math.max(zeroCount, maxZeroCount);
                // 清空
                zeroCount = 0;
            } else {
                zeroCount++;
            }
        }
        return maxZeroCount+1;
    }
```

## 效果

超出内存限制 3 / 44 个通过的测试用例

看的出来，步长不应该为1。

# v2-桶排序步长版本

## 思路

频率有上限，所以我们用频率作为桶来分割。

如果有一个针对的用例，这个算法就G了。

个人理解这个，优化的核心应该是空间换时间。

通过超长的 bucket 桶，避免了排序的耗时。

我们直接在 v1 的基础上修改一下。

核心三步走：

1）计数排序统计次数

2）桶排序用次数作为下标，对应的 chars 作为 value，避免排序

3）从桶的后往前拼接结果

## 实现

```java
    public static String frequencySort(String s) {
        if (s.length() <= 1) {
            return s;
        }

        // 数字是字母和数字，可以用技术来直接统计
        int[] counts = new int[128];
        char[] chars = s.toCharArray();
        for(char c : chars) {
            counts[c]++;
        }

        // 然后我们用桶排序的思想，来避免排序
        // 如果想节省空间，可以再一次遍历，找到最大的 freq
        // 可以对比一下二者的区别
        // 为什么+1？
        List<Character>[] charsList = new List[s.length()+1];
        for(int i = 0; i < counts.length; i++) {
            char c = (char) i;
            int freq = counts[i];

            //  直接根据次数频率，设置到对应的数组上
            List<Character> characters = charsList[freq];
            if(characters == null) {
                characters = new ArrayList<>();
            }

            characters.add(c);

            //直接根据次数设置，避免排序
            charsList[freq]= characters;
        }


        // 从后往前，直接拼接
        StringBuffer stringBuffer = new StringBuffer();
        for(int i = charsList.length-1; i >=0 ; i--) {
            List<Character> characters = charsList[i];
            if(characters != null) {
                // 拼接
                for(Character c : characters) {
                    for(int j = 0; j < i; j++) {
                        stringBuffer.append(c);
                    }
                }
            }
        }
        return stringBuffer.toString();
    }
```


## 效果

12ms 击败 81.14%

看的出来，不排序优势很大。

## 优化思路

我们尝试一下，把频率的最大限制加一下

因为只需要一个额外的 O(n)，看看效果如何。

### 实现

```java
    public static String frequencySort(String s) {
        if (s.length() <= 1) {
            return s;
        }

        // 数字是字母和数字，可以用技术来直接统计
        int maxFreq = 0;
        int[] counts = new int[128];
        char[] chars = s.toCharArray();
        for(char c : chars) {
            counts[c]++;

            maxFreq = Math.max(maxFreq, counts[c]);
        }

        // 然后我们用桶排序的思想，来避免排序
        // 如果想节省空间，可以再一次遍历，找到最大的 freq
        // 可以对比一下二者的区别
        // 为什么+1？  freq 代表的是次数，比下标会多1.如果全部相同的话。
        List<Character>[] charsList = new List[maxFreq+1];
        for(int i = 0; i < counts.length; i++) {
            char c = (char) i;
            int freq = counts[i];

            //  直接根据次数频率，设置到对应的数组上
            List<Character> characters = charsList[freq];
            if(characters == null) {
                characters = new ArrayList<>();
            }

            characters.add(c);

            //直接根据次数设置，避免排序
            charsList[freq]= characters;
        }


        // 从后往前，直接拼接
        StringBuffer stringBuffer = new StringBuffer();
        for(int i = charsList.length-1; i >=0 ; i--) {
            List<Character> characters = charsList[i];
            if(characters != null) {
                // 拼接
                for(Character c : characters) {
                    for(int j = 0; j < i; j++) {
                        stringBuffer.append(c);
                    }
                }
            }
        }
        return stringBuffer.toString();
    }
```

### 效果

10ms 击败 86.41%

但是依然不是最快，为什么？


# v4-最快的方法

## 思路

我们还是来学习一下目前的最优解法

优化思路：

1）尽量使用原生类型

2）因为 chars 只有 128 种，实际上是 26+26+10=62 种。

其实可以不用桶排序，直接循环一遍找最大次数就行。

3) 我们用 chars 数组，自己处理字符串的拼接

## 实现

```java
    public String frequencySort(String s) {
        if (s.length() <= 1) {
            return s;
        }

        // 数字是字母和数字，可以用技术来直接统计
        int[] counts = new int[128];
        char[] chars = s.toCharArray();
        for (char c : chars) {
            counts[c]++;
        }

        // 结果 模拟实现 stringBuilder
        int index = 0;
        char[] results = new char[s.length()];

        // 直接拼接
        while (index < s.length()) {
            // 找到最大的 c + 次数
            char c = 0;
            int n = 0;
            for (int i = 0; i < 128; i++) {
                if (counts[i] > n) {
                    n = counts[i];
                    c = (char) i;
                }
            }

            // 循环构建结果
            while (counts[c]-- > 0) {
                results[index++] = c;
            }
        }

        return String.valueOf(results);
    }
```

## 效果

2ms 击败 99.80%

这种解法其实已经非常精简了，很赞！

## JIT

可以达到 1ms 100%

# 小结

希望本文对你有帮助，如果有其他想法的话，也可以评论区和大家分享哦。

各位极客的点赞收藏转发，是老马持续写作的最大动力！

感兴趣的小伙伴可以关注一波，精彩内容，不容错过。


* any list
{:toc}