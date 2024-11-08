---
layout: post
title:  【leetcode】57-1371. find-the-longest-substring-containing-vowels-in-even-counts  力扣 1371. 每个元音包含偶数次的最长子字符串
date:  2020-6-8 15:13:08 +0800
categories: [Algorithm]
tags: [algorithm, backtrack, leetcode]
published: true
---

# 开源地址

为了便于大家学习，所有实现均已开源。欢迎 fork + star~

> [https://github.com/houbb/leetcode](https://github.com/houbb/leetcode)

# 题目

题目描述
给你一个字符串 s ，请你返回满足以下条件的最长子字符串的长度：每个元音字母，即 'a'，'e'，'i'，'o'，'u' ，在子字符串中都恰好出现了偶数次。

 

示例 1：

输入：s = "eleetminicoworoep"
输出：13
解释：最长子字符串是 "leetminicowor" ，它包含 e，i，o 各 2 个，以及 0 个 a，u 。
示例 2：

输入：s = "leetcodeisgreat"
输出：5
解释：最长子字符串是 "leetc" ，其中包含 2 个 e 。
示例 3：

输入：s = "bcbcbc"
输出：6
解释：这个示例中，字符串 "bcbcbc" 本身就是最长的，因为所有的元音 a，e，i，o，u 都出现了 0 次。
 

提示：

1 <= s.length <= 5 x 10^5
s 只包含小写英文字母。

# v1-基本前缀和+HashMap-错误的思路

## 思路

1) 构建好前缀好，方便计算子数组的和，是否为 k

2）如何能做到让元音字母相同呢？

一开始的思考是非元音字母直接为0，以 a 为例子，奇数和偶数分别对应 1 -1

但是缺点是不同的元音会冲突。

所以想到了拆分为 5 个数组，当然会导致代码特别冗余。

## 初步实现

```java
    /**
     * 构建对应的数组
     *
     * 子数组：所以使用前缀和来解决？
     * @param s
     * @return
     */
    public int findTheLongestSubstring(String s) {
        // 如果是拆分为5个数组呢？
        final int len = s.length();
        char[] chars = s.toCharArray();

        int[] aSum = initPrefixSum(chars, 'a');
        int[] eSum = initPrefixSum(chars, 'e');
        int[] iSum = initPrefixSum(chars, 'i');
        int[] oSum = initPrefixSum(chars, 'o');
        int[] uSum = initPrefixSum(chars, 'u');

        // 找到最长的为0的数组
        Map<Integer, Integer> countMapA = new HashMap<>();
        Map<Integer, Integer> countMapE = new HashMap<>();
        Map<Integer, Integer> countMapI = new HashMap<>();
        Map<Integer, Integer> countMapO = new HashMap<>();
        Map<Integer, Integer> countMapU = new HashMap<>();
        // 兼容从零开始的情况
        countMapA.put(0, -1);
        countMapE.put(0, -1);
        countMapI.put(0, -1);
        countMapO.put(0, -1);
        countMapU.put(0, -1);

        int maxLen = 0;

        for(int i = 0; i < len; i++) {
            int sumA = aSum[i];
            int sumE = eSum[i];
            int sumI = iSum[i];
            int sumO = oSum[i];
            int sumU = uSum[i];

            if(countMapA.containsKey(sumA)
                    && countMapE.containsKey(sumE)
                    && countMapI.containsKey(sumI)
                    && countMapO.containsKey(sumO)
                    && countMapU.containsKey(sumU)
            ) {
                // 必须对应的前缀相同？
                int startIxA = countMapA.get(sumA);
                int startIxE = countMapE.get(sumE);
                int startIxI = countMapI.get(sumI);
                int startIxO = countMapO.get(sumO);
                int startIxU = countMapU.get(sumU);

                if (startIxA == startIxE
                        && startIxE == startIxI
                        && startIxI == startIxO
                        && startIxO == startIxU
                ) {
                    maxLen = Math.max(maxLen, i - startIxA);
                }
            }

            // 更新下
            countMapA.put(sumA, i);
            countMapE.put(sumE, i);
            countMapI.put(sumI, i);
            countMapO.put(sumO, i);
            countMapU.put(sumU, i);
        }

        return maxLen;
    }

    private int[] initPrefixSum(char[] chars,
                               char targetChar) {
        final int n = chars.length;
        int[] prefixSum = new int[n];
        Map<Character, Integer> charCount = new HashMap<>();
        prefixSum[0] = getCharVal(chars[0], targetChar, charCount);
        for(int i = 1; i < n; i++) {
            prefixSum[i] = prefixSum[i-1] + getCharVal(chars[i], targetChar, charCount);
        }
        return prefixSum;
    }

    private int getCharVal(char c,
                           char targetChar,
                           Map<Character, Integer> charCount) {
        int count = charCount.getOrDefault(c, 0);
        count++;
        charCount.put(c, count);

        if(c != targetChar) {
            return 0;
        }

        // 让元音字母成对出现
        if(count % 2 == 0) {
            return 1;
        }
        return -1;
    }
```

## 效果

这个是错误的，以后有时间，做一下处理优化。

TBC

# V2-问题出在哪里了？

## 思路

最大的问题在于5个元素的压缩不能这么做。

比如很多答案中有位运算，个人不是很喜欢这种。平时不太常用，很难想到。

这一题最大的难点就在于属性压缩。

## 方便理解的思路

因为一共 5 个元音，出现的次数分为奇偶两个状态。所以需要 2^5=32 位的状态来标识。

有很多种方式，说两种方便理解的：

1）"00000" 5位的字符串

2）int[] 5 位的数组。

0 标识偶数次，1代表奇数次。

## 实现

```java
class Solution {
    

    private void toggleState(int[] states, int index) {
        states[index] = states[index] == 1 ? 0 : 1;
    }

    /**
     * 构建对应的数组
     *
     * 子数组：所以使用前缀和来解决？
     * @param s
     * @return
     */
    public int findTheLongestSubstring(String s) {
        // 如果是拆分为5个数组呢？
        final int len = s.length();
        char[] chars = s.toCharArray();

        // 状态数组
        int[] states = new int[5];
        Map<String, Integer> map = new HashMap<>();

        // 初始化 从零开始的场景
        map.put(Arrays.toString(states), -1);

        int maxLen = 0;
        for(int i = 0; i < len; i++) {
            char c = chars[i];

            if(c == 'a') {
                toggleState(states, 0);
            }else if(c == 'e') {
                toggleState(states, 1);
            }else if(c == 'i') {
                toggleState(states, 2);
            }else if(c == 'o') {
                toggleState(states, 3);
            }else if(c == 'u') {
                toggleState(states, 4);
            }

            // 如果已经有 说明差值相同
            String stateString = Arrays.toString(states);
            if(map.containsKey(stateString)) {
                maxLen = Math.max(maxLen, i - map.get(stateString));
            } else {
                // 记录状态
                map.put(stateString, i);
            }

            
        }

        return maxLen;
    }

}
```

## 效果

```
338ms  6.67%
```

性能比较差，为什么比较差呢？

# v3-性能优化

## 思路

下面的方法比较难想到一些，就是借助位运算提升性能。

直接用一下官方解法。

## 代码

```java
public int findTheLongestSubstring(String s) {
        int n = s.length();
        int[] pos = new int[1 << 5];
        Arrays.fill(pos, -1);
        int ans = 0, status = 0;
        pos[0] = 0;
        for (int i = 0; i < n; i++) {

            // 直接通过位运算，更新对应的数据。
            char ch = s.charAt(i);
            if (ch == 'a') {
                status ^= (1 << 0);
            } else if (ch == 'e') {
                status ^= (1 << 1);
            } else if (ch == 'i') {
                status ^= (1 << 2);
            } else if (ch == 'o') {
                status ^= (1 << 3);
            } else if (ch == 'u') {
                status ^= (1 << 4);
            }

            if (pos[status] >= 0) {
                ans = Math.max(ans, i + 1 - pos[status]);
            } else {
                pos[status] = i + 1;
            }
        }
        return ans;
    }
```

## 效果

11ms 97.87%

# 参考资料

https://leetcode.cn/problems/find-the-longest-substring-containing-vowels-in-even-counts/submissions/579064348/?envType=problem-list-v2&envId=prefix-sum

* any list
{:toc}