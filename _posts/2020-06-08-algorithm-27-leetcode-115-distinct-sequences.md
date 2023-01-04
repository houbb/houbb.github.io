---
layout: post
title: leetcode 115 Distinct Subsequences 动态规划
date:  2020-1-23 10:09:32 +0800 
categories: [Algorithm]
tags: [algorithm, leetcode, dp, sh]
published: true
---

# 题目

Given two strings s and t, return the number of distinct subsequences of s which equals t.

The test cases are generated so that the answer fits on a 32-bit signed integer.

## 例子

Example 1:

```
Input: s = "rabbbit", t = "rabbit"
Output: 3
Explanation:
As shown below, there are 3 ways you can generate "rabbit" from s.
rabbbit
rabbbit
rabbbit
```

Example 2:

```
Input: s = "babgbag", t = "bag"
Output: 5
Explanation:
As shown below, there are 5 ways you can generate "bag" from s.
babgbag
babgbag
babgbag
babgbag
babgbag
```

## Constraints:

1 <= s.length, t.length <= 1000

s and t consist of English letters.


# 解题思路

看到这个题目之后的第一想法：

```

思路：

1. 最简单的，t.len > s.len, 0
2. t.len = s.len 对比二者是否相同
3. t.len > s.len，怎么处理比较简单？

3.1 首先找到第一个相同的字符。
3.2 然后寻找第二个相同的字符
。。。
3.n 到 s 的结尾则终止，长度一致，则符合。


【问题的拆分】

1. 发现第一个相同的字符
2. 剩下的就是一个子串，然后再前面的部分中，问题同1.

所以，这个问题可以用递归处理。

【性能改良】

这里存在的问题：就是 DP？要可以复用以前的结果，不然数量一多，直接爆炸。

采用 BIT 运算加速？

一共只有 26 个字母，还是 52 个字母?

【赖皮算法】
1. s+t 作为 key, 结果作为 value

不过这个没有实际意义。
```


# 算法实现

## 递归

最直观的思路，应该是使用递归。

```java
class Solution {
    public int numDistinct(String s, String t) {
       return function(s,t,s.length() -1, t.length() -1); 
    }

    private int function(String s, String t, int i, int j) {
        // 终止条件
        if (i < 0 || j < 0 || i < j) return 0;

        if (s.charAt(i) == t.charAt(j)) {
            // 全部匹配
            if (j == 0) return  1 + function(s,t,i-1,j);
            else return function(s,t,i-1,j-1) + function(s,t,i-1,j);
        }


        return function(s,t,i-1,j);
    }
}
```

## DP: top to bottom

```java
class Solution {
    public int numDistinct(String s, String t) {
        int[][] memo = new int[s.length() + 1][t.length()+1];
        for (int i = 0; i < s.length()+1; i++) {
            Arrays.fill(memo[i], -1);
        }
       return topTobottom(memo,s,t,s.length(), t.length()); 
    }

    private int topTobottom(int[][] memo, String s, String t, int i, int j) {
        if (memo[i][j] != -1) return memo[i][j];
        if (j==0)  memo[i][j] = 1;
        else if (i == 0) memo[i][j] = 0;
        else {
            int sol1 = topTobottom(memo, s, t,i-1, j);
            int sol2 = 0;
            if (s.charAt(i-1) == t.charAt(j-1)) sol2 = topTobottom(memo, s, t, i-1, j-1);
            memo[i][j]= sol1 + sol2;
        }
        return memo[i][j];
    }
}
```

## DP: bottom to top

"A good dp solution don't have recursive part so let's move to next part" - using tabulation (bottom to up)

```java
class Solution {
    public int numDistinct(String s, String t) {
        int[][] dp = new int[s.length() + 1][t.length() + 1];
        for (int i = 0; i <= s.length(); i++) {
            dp[i][0] = 1;
        }
        for (int i = 1; i <= s.length(); i++) {
            for (int j = 1; j <= t.length(); j++) {
                dp[i][j] = dp[i-1][j];
                if (s.charAt(i-1) == t.charAt(j-1)) {
                    dp[i][j] += dp[i-1][j-1];
                }
            }
        }
        return dp[s.length()][t.length()];
    }
}
```

内存优化：

"every dp question has a diffrent formula, let's find out using above solution" (space optimise)

```java
class Solution {
    public int numDistinct(String s, String t){
        int[] dp = new int[t.length() + 1];
        dp[0] = 1;
        for (int i = 1; i <= s.length(); i++) {
            for (int j = t.length(); j >= 1; j--) {
                if (s.charAt(i-1) == t.charAt(j-1))
                    dp[j] += dp[j-1];
            }
        }
        return dp[t.length()];
    }
}
```

NOTE :- if you are a beginner in dp so don't mind if you didn't get that formula just you need to do more questions and another thing is always solve dp from recursion to top to bottom dp and then bottom to top dp and just take your time because once you master dp then you will not take time get any job.

# DP 的思路

The idea is the following:

1. we will build an array mem where mem[i+1][j+1] means that S[0..j] contains T[0..i] that many times as distinct subsequences. Therefor the result will be mem[T.length()][S.length()].

2. we can build this array rows-by-rows:

3. the first row must be filled with 1. That's because the empty string is a subsequence of any string but only 1 time. So mem[0][j] = 1 for every j. So with this we not only make our lives easier, but we also return correct value if T is an empty string.

4. the first column of every rows except the first must be 0. This is because an empty string cannot contain a non-empty string as a substring -- the very first item of the array: mem[0][0] = 1, because an empty string contains the empty string 1 time.

So the matrix looks like this:

```
  S 0123....j
T +----------+
  |1111111111|
0 |0         |
1 |0         |
2 |0         |
. |0         |
. |0         |
i |0         |
```

From here we can easily fill the whole grid: for each (x, y), we check if S[x] == T[y] we add the previous item and the previous item in the previous row, otherwise we copy the previous item in the same row. 

The reason is simple:

1. if the current character in S doesn't equal to current character T, then we have the same number of distinct subsequences as we had without the new character.

2. if the current character in S equal to the current character T, then the distinct number of subsequences: the number we had before plus the distinct number of subsequences we had with less longer T and less longer S.

## 例子

An example:

S: [acdabefbc] and T: [ab]

first we check with a:

```
           *  *
      S = [acdabefbc]
mem[1] = [0111222222]
```

then we check with ab:

```
               *  * ]
      S = [acdabefbc]
mem[1] = [0111222222]
mem[2] = [0000022244]
```

And the result is 4, as the distinct subsequences are:

```
      S = [a   b    ]
      S = [a      b ]
      S = [   ab    ]
      S = [   a   b ]
```

## java 实现

```java
public int numDistinct(String S, String T) {
    // array creation
    int[][] mem = new int[T.length()+1][S.length()+1];

    // filling the first row: with 1s
    for(int j=0; j<=S.length(); j++) {
        mem[0][j] = 1;
    }
    
    // the first column is 0 by default in every other rows but the first, which we need.
    
    for(int i=0; i<T.length(); i++) {
        for(int j=0; j<S.length(); j++) {
            if(T.charAt(i) == S.charAt(j)) {
                mem[i+1][j+1] = mem[i][j] + mem[i+1][j];
            } else {
                mem[i+1][j+1] = mem[i+1][j];
            }
        }
    }
    
    return mem[T.length()][S.length()];
}
```

# 参考资料

https://leetcode.com/problems/distinct-subsequences/

https://leetcode.com/problems/distinct-subsequences/solutions/37327/easy-to-understand-dp-in-java/

https://leetcode.com/problems/distinct-subsequences/solutions/37327/easy-to-understand-dp-in-java/

https://leetcode.com/problems/distinct-subsequences/solutions/37387/a-dp-solution-with-clarification-and-explanation/

https://leetcode.com/problems/distinct-subsequences/solutions/37328/c-dp-3ms-3-lines-short-solution/

https://leetcode.com/problems/distinct-subsequences/solutions/2738744/recursion-to-dp-optimise-easy-understanding/

* any list
{:toc}