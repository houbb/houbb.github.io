---
layout: post
title: 【leetcode】05-5. 最长回文子串 Longest Palindromic Substring
date:  2020-6-8 15:13:08 +0800
categories: [Algorithm]
tags: [algorithm, data-struct, leetcode, sf]
published: true
---

# 5. 最长回文子串

给你一个字符串 s，找到 s 中最长的回文子串。

如果字符串的反序与原始字符串相同，则该字符串称为回文字符串。

## 例子

示例 1：

```
输入：s = "babad"
输出："bab"
解释："aba" 同样是符合题意的答案。
```

示例 2：

```
输入：s = "cbbd"
输出："bb"
``` 

## 提示：

1 <= s.length <= 1000

s 仅由数字和英文字母组成

# V1-暴力算法

## 思路

我们可以双重遍历所有的子串，然后判断字串是否为回文。

当然，这种复杂度基本为 O(N^3)，会超时。

## java 实现

```java
/**
 * 最长回文子串

 * ps: 这一题最大的问题是有执行耗时的限制
 *
 * @author binbin.hou
 * @since 1.0.0
 */
public class T005_LongestPalindromicSubstring {

    /**
     * 粗暴解法

     * 执行效果：63/113 执行超时
     *
     * @param s 字符串
     * @return 结果
     * @date 2020-6-9 20:18:59
     * @since v1
     */
    @Deprecated
    public String longestPalindrome(String s) {
        // 单个字符
        if (s.length() <= 1) {
            return s;
        }

        // sum 最长开始统计
        final int length = s.length();
        for (int sum = length; sum > 1; sum--) {
            // 这里导致有重复的信息
            int startOffset = 0;
            for (int i = startOffset; i < length; i++) {
                //0, length
                for (int j = length; j > 0; j--) {
                    if (j - i == sum) {
                        String subString = s.substring(i, j);
                        if (isPalindrome(subString)) {
                            return subString;
                        }
                    }
                    // 跳出当前循环
                    if (j - i < sum) {
                        startOffset++;
                        break;
                    }
                }
            }
        }

        return s.substring(0, 1);
    }

    /**
     * 是否为回文
     * <p>
     * aba
     * bb
     *
     * @param string 字符串
     * @return 是否
     * @since v1
     */
    public static boolean isPalindrome(final String string) {
        if (string.length() == 1) {
            return false;
        }

        final int length = string.length();
        int mid = length >> 1;

        for (int i = 0; i < mid; i++) {
            if (string.charAt(i) != string.charAt(length - i - 1)) {
                return false;
            }
        }

        return true;
    }

}
```


# V2-Expand Around Center

## 思路

展开的话有两个场景：

```
// abba
// aba
```

当前位置时中间，奇数和偶数两个场景。

我们遍历整个字符串，然后在每一个位置 i ，向左右两边展开。

所有 [l, r] 需要考虑 [i, i] 处扩展和 [i, i+1] 扩展 2 种场景。

## java 实现

```java
    /**
     * 比较容易理解的思路：

     * 从1个元素中间开始往2边平摊，类似于我判断是否为回文的方式
     *
     * @param s 字符串
     * @return 结果
     * @since v2
     */
    public String longestPalindrome(String s) {
        // 单个字符
        if (s.length() <= 1) {
            return s;
        }

        // 从一个元素开始往外均摊
        int start = 0;
        int end = 0;
        for(int i = 0; i < s.length(); i++) {
            // abba
            // aba
            int len1 = expendFromCenter(i, i, s);
            int len2 = expendFromCenter(i, i+1, s);

            int len = Math.max(len1, len2);

            // 更新 offset
            if(len > end-start) {
                start = i - ((len-1) >> 1);
                end = i + (len >> 1);
            }
        }

        // 没有合适的，返回第一个元素
        return s.substring(start, end+1);
    }

    /**
     * 从中间往外边扩散
     *
     * @param left  左边
     * @param right 右边
     * @param s     字符串
     * @return 结果
     * @since v2
     */
    private int expendFromCenter(int left,
                                 int right,
                                 String s) {
        while (left >= 0 && right < s.length() && s.charAt(left) == s.charAt(right)) {
            left--;
            right++;
        }

        return right - left - 1;
    }
```

## 效果

[效果如下](https://leetcode.com/problems/longest-palindromic-substring/submissions/351280144/)

```
Runtime: 23 ms, faster than 80.86% of Java online submissions for Longest Palindromic Substring.
Memory Usage: 37.8 MB, less than 84.50% of Java online submissions for Longest Palindromic Substring.
```

# v3-马拉车算法

## 思路

对于这种回文的判断，还有一种非常强的算法 [Manacher Algorithm 马拉车算法](https://houbb.github.io/2020/06/08/algorithm-03-Manacher-Algorithm)

这里不做具体展开，可自行学习。

马拉车算法 Manacher‘s Algorithm 是用来查找一个字符串的最长回文子串的线性方法，由一个叫Manacher的人在1975年发明的，这个方法的最大贡献是在于将时间复杂度提升到了线性。

## java 实现

```java
    /**
     * 字符串预处理
     * @param s 原始字符串
     * @return 结果
     * @since v2
     */
    private String preProcess(String s) {
        int n = s.length();

        StringBuilder ret = new StringBuilder("^");
        for (int i = 0; i < n; i++) {
            ret.append("#").append(s.charAt(i));
        }
        ret.append("#$");
        return ret.toString();
    }

    // 马拉车算法

    /**
     * 马拉车算法
     * @param s 原始字符串
     * @return 结果
     * @since v2
     */
    public String longestPalindrome(String s) {
        if(s.length() <= 1) {
            return s;
        }

        String T = preProcess(s);
        int n = T.length();
        int[] P = new int[n];
        int C = 0, R = 0;

        // 保留结果
        int maxLen = 0;
        int centerIndex = 0;

        for (int i = 1; i < n - 1; i++) {
            int iMirror = (C << 1) - i;
            if (R > i) {
                // 防止超出 R
                P[i] = Math.min(R - i, P[iMirror]);
            } else {
                // 等于 R 的情况
                P[i] = 0;
            }

            // 碰到之前讲的三种情况时候，需要利用中心扩展法
            while (T.charAt(i + 1 + P[i]) == T.charAt(i - 1 - P[i])) {
                P[i]++;
            }

            // 判断是否需要更新 R
            if (i + P[i] > R) {
                C = i;
                R = i + P[i];
            }


            // 找出最大的 P 值
            if (P[i] > maxLen) {
                maxLen = P[i];
                centerIndex = i;
            }
        }

        //最开始讲的求原字符串下标
        int start = (centerIndex - maxLen) >> 1;
        return s.substring(start, start + maxLen);
    }
```

## 效果

[效果如下](https://leetcode.com/problems/longest-palindromic-substring/submissions/351295056/)

```
Runtime: 8 ms, faster than 96.20% of Java online submissions for Longest Palindromic Substring.
Memory Usage: 39.1 MB, less than 62.76% of Java online submissions for Longest Palindromic Substring.
```

# 小结

我们在实际使用中，能够想到第二种算法就已经够用了。

马拉车算法也值得学习，后续题目也可以采用此算法求解。

# 开源地址

为了便于大家学习，所有实现均已开源。欢迎 fork + star~

> [https://github.com/houbb/leetcode](https://github.com/houbb/leetcode)

## 参考资料

[leetcode median-of-two-sorted-arrays](https://leetcode-cn.com/problems/median-of-two-sorted-arrays)

[LeetCode#4. 寻找两个有序数组的中位数](https://zhuanlan.zhihu.com/p/70654378)

* any list
{:toc}