---
layout: post
title: leecode 详解 04-regex match 正则表达式匹配
date:  2020-6-8 15:13:08 +0800
categories: [Algorithm]
tags: [Algorithm, data-struct, leetcode, sf]
published: true
---

# 题目

给你一个字符串 s 和一个字符规律 p，请你来实现一个支持 '.' 和 '*' 的正则表达式匹配。

'.' 匹配任意单个字符
'*' 匹配零个或多个前面的那一个元素
所谓匹配，是要涵盖 整个 字符串 s的，而不是部分字符串。

说明:

s 可能为空，且只包含从 a-z 的小写字母。

p 可能为空，且只包含从 a-z 的小写字母，以及字符 . 和 *。

## 个人分析

拿到题目的第一反应就是这是一个 regex 表达式解析引擎，但是过于复杂。

于是可以按照一定的顺序去实现。

下面来逐步看一下这个题目的解答过程。

# v1 标准库实现版本

## 代码

```java
public boolean isMatch(String s, String p) {
    return s.matches(p);
}
```

## 性能

```
Runtime: 64 ms, faster than 24.57% of Java online submissions for Regular Expression Matching.
Memory Usage: 40.3 MB, less than 7.95% of Java online submissions for Regular Expression Matching.
```

虽然实现了，但是对于我们个人基本没有任何收益。

也没有体会到 regex 解析过程的快乐，而且性能也不怎么样。

# v2 递归实现

## 实现思路

如果 p 中没有任何 `*` 号，那么对比起来其实比较简单，就是文本 s 和 p 一一对应。

`.` 对应任意单个字符，也不难。

## 如果存在 * 号

如果存在 `*`，这个问题就会难那么一些。

```java
public boolean isMatch(String s, String p) {
    // 如果 p 已经遍历结束，直接看 s 是否结束。
    if(p.isEmpty()) {
        return s.isEmpty();
    }

    // 第一位是否匹配判断
    boolean firstMatch = !s.isEmpty() && (s.charAt(0) == p.charAt(0) || p.charAt(0) == '.');

    if(p.length() >= 2 && p.charAt(1) == '*') {
        // 1. 第一位匹配 && 后续匹配 （* 一次或者多次）
        // 2. c* 出现零次，则直接全文本匹配。
        return (firstMatch && isMatch(s.substring(1), p)) || isMatch(s, p.substring(2));
    } else {
        // 第二位不是 *，则直接跳过第一位看后续的信息。
        return firstMatch && isMatch(s.substring(1), p.substring(1));
    }
}
```

## 效果

这个用到了递归，性能如下：

```
Runtime: 88 ms, faster than 8.51% of Java online submissions for Regular Expression Matching.
Memory Usage: 39.8 MB, less than 27.13% of Java online submissions for Regular Expression Matching.
```

一个字，惨~

# v3 动态规划

## 对于递归的思考

你也许发现了，原来的代码中

```java
isMatch(s.substring(1), p.substring(1))
```

这种类似的匹配结果，实际上是一次次的在重复的。

比如第一次我们匹配 [1, 10]，后续又匹配 [2, 10]

这样如果你学过 DP 那么会有一个想法，能否重复利用已经判断过的内容呢？

DP 无敌。

## 解题思路

我们用递归中同样的回溯方法，除此之外，因为函数 `match(text[i:], pattern[j:])` 只会被调用一次，我们用 dp(i, j) 来应对剩余相同参数的函数调用，这帮助我们节省了字符串建立操作所需要的时间，也让我们可以将中间结果进行保存。

## 自顶向下的方法

这里的核心区别就是不对 text/pattern 做 substring 的操作，而是从前往后处理。

```java
enum Result { 
    TRUE, FALSE
}

class Solution {

    Result[][] memo;

    public boolean isMatch(String text, String pattern) {
        memo = new Result[text.length() + 1][pattern.length() + 1];
        return dp(0, 0, text, pattern);
    }

    public boolean dp(int i, int j, String text, String pattern) {
        if (memo[i][j] != null) {
            return memo[i][j] == Result.TRUE;
        }
        boolean ans;
        if (j == pattern.length()){
            // 如果 pattern 已经遍历结束
            ans = i == text.length();
        } else{
            // 第一位的判断和原来类似
            boolean first_match = (i < text.length() &&
                                   (pattern.charAt(j) == text.charAt(i) ||
                                    pattern.charAt(j) == '.'));

            if (j + 1 < pattern.length() && pattern.charAt(j+1) == '*'){
                ans = (dp(i, j+2, text, pattern) || first_match && dp(i+1, j, text, pattern));
            } else {
                ans = first_match && dp(i+1, j+1, text, pattern);
            }
        }


        // 保存临时结果
        memo[i][j] = ans ? Result.TRUE : Result.FALSE;
        return ans;
    }
}
```

### 效果

```
Runtime: 3 ms, faster than 83.97% of Java online submissions for Regular Expression Matching.
Memory Usage: 39.9 MB, less than 22.69% of Java online submissions for Regular Expression Matching.
```

性能还是不错的。

实际上这个性能是比实现一个 regex 引擎要好的，因为 regex 的编译构建 DFA/NFA 非常的耗时。


## 自上而下

理解了上面的解法，下面的解法就比较简单了。

从后往前处理，这样就避免掉了默认值的问题，不需要像上面一样引入一个奇奇怪该的枚举值。

```java
public boolean isMatch(String s, String p) {
    //dp 存放的是后面处理的结果
   boolean[][] dp = new boolean[s.length()+1][p.length()+1];
   dp[s.length()][p.length()] = true;

   for(int i = s.length(); i >= 0; i--) {
        for(int j = p.length()-1; j >= 0; j--) {
            // 核心代码保持不变
            // 这里不用判断是否为 empty 的问题
            boolean firstMatch = i < s.length() && (s.charAt(i) == p.charAt(j) || p.charAt(j) == '.');
            // 判断星号
            if(j+1 < p.length() && p.charAt(j+1) == '*') {
                // 出现零次
                // 一次或者多次
                dp[i][j] = dp[i][j+2] || (firstMatch && dp[i+1][j]);
            } else {
                dp[i][j] = firstMatch && dp[i+1][j+1];
            }
        }
   }

   // 直接返回结果
   return dp[0][0];
}
```

### 效果

还算比较优雅，性能还算满意。

```
Runtime: 2 ms, faster than 92.84% of Java online submissions for Regular Expression Matching.
Memory Usage: 38.3 MB, less than 73.31% of Java online submissions for Regular Expression Matching.
```

# 拓展阅读

[从零实现一个 regex 解析引擎](https://houbb.github.io/2020/01/07/regex-and-dfa-02)

# 参考资料

[regular-expression-matching](https://leetcode.com/problems/regular-expression-matching/solution/)

https://leetcode-cn.com/problems/regular-expression-matching/

* any list
{:toc}