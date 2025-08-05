---
layout: post
title: leetcode 数组专题之数组遍历-03-遍历滑动窗口 438. 找到字符串中所有字母异位词
date:  2020-6-8 15:13:08 +0800
categories: [Algorithm]
tags: [algorithm, data-struct, topics, leetcode, array, traverse, sliding-window, prefix-sum, top100, sf]
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


#  438. 找到字符串中所有字母异位词

给定两个字符串 s 和 p，找到 s 中所有 p 的 异位词 的子串，返回这些子串的起始索引。

不考虑答案输出的顺序。

示例 1:

输入: s = "cbaebabacd", p = "abc"
输出: [0,6]
解释:
起始索引等于 0 的子串是 "cba", 它是 "abc" 的异位词。
起始索引等于 6 的子串是 "bac", 它是 "abc" 的异位词。

 示例 2:

输入: s = "abab", p = "ab"
输出: [0,1,2]
解释:
起始索引等于 0 的子串是 "ab", 它是 "ab" 的异位词。
起始索引等于 1 的子串是 "ba", 它是 "ab" 的异位词。
起始索引等于 2 的子串是 "ab", 它是 "ab" 的异位词。
 

提示:

1 <= s.length, p.length <= 3 * 10^4
s 和 p 仅包含小写字母

# v1-暴力算法

## 思路

我们先用最朴素的塞思路，直接找到全部满足的数据。

## 实现

```java
    public static List<Integer> findAnagrams(String s, String p) {
        Map<Character, Integer> pCountMap = new HashMap<>();
        for(int i = 0; i < p.length(); i++) {
            char c = p.charAt(i);
            Integer count = pCountMap.getOrDefault(p.charAt(i), 0);
            count++;
            pCountMap.put(c, count);
        }

        List<Integer> resultList = new ArrayList<>();

        int pLen = p.length();
        for(int i = 0; i <= s.length()-pLen; i++) {
            // 找到符合条件的数据
            Map<Character, Integer> tempCountMap = new HashMap<>(pCountMap);

            for(int j=i; j < s.length(); j++) {
                char c = s.charAt(j);
                // 不包含此字符
                Integer count = tempCountMap.get(c);
                // 不存在，或者多了
                if(count == null
                    || count < 0) {
                    break;
                }

                count--;
                if(count > 0) {
                    tempCountMap.put(c, count);
                } else {
                    tempCountMap.remove(c);
                }

                // 是否满足
                if(tempCountMap.isEmpty()) {
                    resultList.add(i);
                    break;
                }
            }

        }

        return resultList;
    }
```

## 效果

超出时间限制 64 / 65 个通过的测试用例

## 反思

为什么慢？

因为我们遍历了两次，对于这种连续的，经典的滑动窗口是最好的。


# v2-滑动窗口

## 模板

我们看一下滑动窗口的模板

```java
int left = 0, right = 0;
while (right < s.length()) {
    // 扩大窗口
    char c = s.charAt(right);
    window.put(c, window.getOrDefault(c, 0) + 1);
    right++;

    // 判断是否需要收缩
    while (窗口需要收缩) {
        char d = s.charAt(left);
        window.put(d, window.get(d) - 1);
        left++;
    }

    // 更新结果（如果当前是一个合法解）
}
```

## 思路

1) s 和 p 仅包含小写字母，所以可以用 int[26] 数组来模拟哈希 

2) 我们初始化的时候，移动 right 的位置，让 `right-left + 1 == p.length()` 开始判断两个窗口是否相同

3）当满足两个数组相同时，更新结果到结果

## 实现

```java
    public static List<Integer> findAnagrams(String s, String p) {
        int[] targetWindows = new int[26];
        int[] sourceWindows = new int[26];

        for(char c : p.toCharArray()) {
            targetWindows[c-'a']++;
        }

        List<Integer> resultList = new ArrayList<>();

        int left = 0;
        for(int right = 0; right < s.length(); right++) {
            char c = s.charAt(right);
            sourceWindows[c-'a']++;

            // 满足初步收缩条件
            int len = right-left+1;
            if(len == p.length()) {
                // 满足
                if(Arrays.equals(sourceWindows, targetWindows)) {
                    resultList.add(left);
                }

                // left 向右移动
                char leftChar = s.charAt(left);
                sourceWindows[leftChar-'a']--;
                left++;
            }
        }

        return resultList;
    }
```

## 效果

10ms 击败 54.86%

已属于第一梯队的算法，估计都大同小异。

# v3-优化比较方式

## 思路

`Arrays.equals(sourceWindows, targetWindows)` 这种比较其实如果数据很多，比较耗时也是不容小觑的。

这种如果用 HashMap 实现思路也是类似。

我们维护一个变量，原始需要满足多少个数，目标有多少个数满足。

动态维护这个变量即可。

不过本地的差异化不大。

## 实现

```java
public static List<Integer> findAnagrams(String s, String p) {
        int[] targetWindows = new int[26];
        int[] sourceWindows = new int[26];

        for(char c : p.toCharArray()) {
            targetWindows[c-'a']++;
        }
        int targetCount = 0;
        for(int i : targetWindows) {
            if(i > 0) {
                targetCount++;
            }
        }


        List<Integer> resultList = new ArrayList<>();
        int sourceCount = 0;
        int left = 0;
        for(int right = 0; right < s.length(); right++) {
            char c = s.charAt(right);
            sourceWindows[c-'a']++;
            // 相等时+1
            if(targetWindows[c-'a'] == sourceWindows[c-'a']) {
                sourceCount++;
            }

            // 满足初步收缩条件
            int len = right-left+1;
            if(len == p.length()) {
                // 满足
                if(sourceCount == targetCount) {
                    resultList.add(left);
                }

                // left 向右移动
                char leftChar = s.charAt(left);
                if(targetWindows[leftChar-'a'] == sourceWindows[leftChar-'a']) {
                    sourceCount--;
                }
                sourceWindows[leftChar-'a']--;
                left++;
            }
        }

        return resultList;
    }
```

## 效果

9ms 61.05%

# 小结

希望本文对你有帮助，如果有其他想法的话，也可以评论区和大家分享哦。

各位极客的点赞收藏转发，是老马持续写作的最大动力！

感兴趣的小伙伴可以关注一波，精彩内容，不容错过。

* any list
{:toc}