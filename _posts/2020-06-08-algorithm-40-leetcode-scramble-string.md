---
layout: post
title: leetcode 87 Scramble String
date:  2020-1-23 10:09:32 +0800 
categories: [Algorithm]
tags: [algorithm, leetcode, dp, sh]
published: true
---

# 87. Scramble String

We can scramble a string s to get a string t using the following algorithm:

If the length of the string is 1, stop.

If the length of the string is > 1, do the following:

Split the string into two non-empty substrings at a random index, i.e., if the string is s, divide it to x and y where s = x + y.

Randomly decide to swap the two substrings or to keep them in the same order. i.e., after this step, s may become s = x + y or s = y + x.

Apply step 1 recursively on each of the two substrings x and y.

Given two strings s1 and s2 of the same length, return true if s2 is a scrambled string of s1, otherwise, return false.

## EX

Example 1:

```
Input: s1 = "great", s2 = "rgeat"
Output: true
Explanation: One possible scenario applied on s1 is:
"great" --> "gr/eat" // divide at random index.
"gr/eat" --> "gr/eat" // random decision is not to swap the two substrings and keep them in order.
"gr/eat" --> "g/r / e/at" // apply the same algorithm recursively on both substrings. divide at random index each of them.
"g/r / e/at" --> "r/g / e/at" // random decision was to swap the first substring and to keep the second substring in the same order.
"r/g / e/at" --> "r/g / e/ a/t" // again apply the algorithm recursively, divide "at" to "a/t".
"r/g / e/ a/t" --> "r/g / e/ a/t" // random decision is to keep both substrings in the same order.
The algorithm stops now, and the result string is "rgeat" which is s2.
As one possible scenario led s1 to be scrambled to s2, we return true.
```

Example 2:

```
Input: s1 = "abcde", s2 = "caebd"
Output: false
```

Example 3:

```
Input: s1 = "a", s2 = "a"
Output: true
```

## Constraints:

s1.length == s2.length

1 <= s1.length <= 30

s1 and s2 consist of lowercase English letters.

# V1-递归

## 思路

最直接的思路应该是递归。

1) 匹配条件：s1.equals(s2) 两个字符串相同

2）肯定不匹配

s1.length == s2.length，二者长度一样，不考虑长度不同的问题。

相同的字符，数量必须相同。

这里可以使用 HashMap 存储，或者使用 int[] 数组。

把 char 直接转为对应的 int 下标即可，这样实现起来比较优雅一点。

3）递归

从 0 开始，通过下标 i 遍历 s1

任何一个 i，可以把 s1 拆分为 (0, i) + (i, s.1ength); s2 拆分为 (0, i) + (i, s2.length)。

那么有两个情况都是满足的

```java
s1[0,i].equals(s2.[0,i]) && s1[i, s1.length].equals(s2[i, s2.length])

// 或者 

s1[0,i].equals(s2.[s2.length, length]) && s1[i, s1.length].equals(s2[0, s2.length-i])
```

## java 实现

代码实现也比较简单.

```java
class Solution {
    
public boolean isScramble(String s1, String s2) {
        if(s1.equals(s2)) {
            return true;
        }

        // 相同的字符，数量必须相同
        int[] charMap = new int[26];
        for(int i = 0; i < s1.length(); i++) {
            charMap[s1.charAt(i)-'a']++;
            charMap[s2.charAt(i)-'a']--;
        }
        // 比较，如果不是0，说明不匹配
        for(int i = 0; i < 26; i++) {
            if(charMap[i] != 0) {
                return false;
            }
        }

        // 分割+递归
        for(int i = 1; i < s1.length(); i++) {
            if(isScramble(s1.substring(0, i), s2.substring(0, i))
                    && isScramble(s1.substring(i), s2.substring(i))) {
                return true;
            }

            if(isScramble(s1.substring(0, i), s2.substring(s2.length()-i))
                    && isScramble(s1.substring(i), s2.substring(0, s2.length()-i))) {
                return true;
            }
        }

        return false;
    }

}
```


当然，这一题是 Hard，测试用例会在 286 / 288  TEL。

# V2-递归+MEM

## 思路

上面的方法之所以比较慢，是因为每一次都是从头开始比较 s1+s2 是否满足条件。

如果我们创建一个 cache 缓存，保存一下记录，可以提升性能。

```java
// key = s1+s2
// value = 是否匹配
Map<String, Boolean> cacheMap 
```

这里的 key 使用 s1+s2 比较简单，当然也可以换成 s 的下标。

## 实现

```java
import java.util.HashMap;
import java.util.Map;

public class T087_ScrambleStringV2 {

    public static void main(String[] args) {
        T087_ScrambleStringV2 scrambleString = new T087_ScrambleStringV2();

        scrambleString.isScramble("abcde", "caebd");
    }

    /**
     * 递归
     *
     * 添加缓存
     *
     * @param s1
     * @param s2
     * @return
     */
    public boolean isScramble(String s1, String s2) {
        // key = s1+s2
        // value = 是否匹配
        Map<String, Boolean> cache = new HashMap<>();

        return isScramble(s1, s2, cache);
    }
    public boolean isScramble(String s1, String s2,
                              Map<String, Boolean> cache) {
        // 首先判断缓存中是否存在
        String cacheKey = s1 + s2;
        if(cache.containsKey(cacheKey)) {
            return cache.get(cacheKey);
        }

        if(s1.equals(s2)) {
            cache.put(s1+s2, true);

            return true;
        }

        // 相同的字符，数量必须相同
        int[] charMap = new int[26];
        for(int i = 0; i < s1.length(); i++) {
            charMap[s1.charAt(i)-'a']++;
            charMap[s2.charAt(i)-'a']--;
        }
        // 比较，如果不是0，说明不匹配
        for(int i = 0; i < 26; i++) {
            if(charMap[i] != 0) {
                cache.put(s1+s2, false);

                return false;
            }
        }

        // 分割+递归
        for(int i = 1; i < s1.length(); i++) {
            if(isScramble(s1.substring(0, i), s2.substring(0, i), cache)
                    && isScramble(s1.substring(i), s2.substring(i), cache)) {
                cache.put(s1+s2, true);
                return true;
            }

            if(isScramble(s1.substring(0, i), s2.substring(s2.length()-i), cache)
                    && isScramble(s1.substring(i), s2.substring(0, s2.length()-i), cache)) {
                cache.put(s1+s2, true);

                return true;
            }
        }

        cache.put(s1+s2, false);
        return false;
    }

}
```

效果：耗时 6ms, Beats 94.83%

效果非常的显著。

# V3-DP

## 思路

当然，这一题也可以使用 DP 的方式解答。

但是 dp 的维度为比较多一点。

我们把面的递归改成 for 循环，其实发现需要 4 层迭代。

也就是我们需要定义一个 dp 的 4 多维度数组。

把 cache 调整为 dp，把递归改写成 dp 递推公式。

## java 实现

```java
    public boolean isScramble(String s1, String s2) {
        // 初始化 dp 数组
        int totalLen = s1.length();
        boolean[][][] dp = new boolean[totalLen +1][totalLen][totalLen];
        // 如果 i, j 位置的字符相同，则更新为 true。
        for(int i = 0; i < totalLen; i++) {
            for(int j = 0; j < totalLen; j++) {
                dp[1][i][j] = s1.charAt(i) == s2.charAt(j);
            }
        }


        // k 这一层，类似于之前的最外层
        for (int len = 2; len <= totalLen; len++) {
            for (int i = 0; i <= totalLen - len; i++) {
                for (int j = 0; j <= totalLen - len; j++) {
                    //???
                    dp[len][i][j] = false;

                    for (int k = 1; k < len && !dp[len][i][j]; k++) {
                        dp[len][i][j] = dp[len][i][j] || (dp[k][i][j] && dp[len-k][i+k][j+k]);
                        dp[len][i][j] = dp[len][i][j] || (dp[k][i+len-k][j] && dp[len-k][i][j+k]);
                    }
                }
            }
        }

        // 返回结果
        return dp[totalLen][0][0];
    }
```

效果：Runtime 15 ms Beats 59.4%

一般而言，递归+mem 和 dp 的性能差不多。

应该是这里没有引入 s1, s2 的字符是否相同的比较，会多一些对比的场景导致的。

# 参考资料

https://leetcode.com/problems/scramble-string/solutions/29387/accepted-java-solution/

* any list
{:toc}