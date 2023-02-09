---
layout: post
title: 【leetcode】08 - 10. Regular Expression Matching 正则表达式匹配 + 42.Wildcard Matching 通配符匹配
date:  2020-6-8 15:13:08 +0800
categories: [Algorithm]
tags: [algorithm, dp, leetcode, sf]
published: true
---

## 10. Regular Expression Matching 题目

给你一个字符串 s 和一个字符规律 p，请你来实现一个支持 '.' 和 '*' 的正则表达式匹配。

'.' 匹配任意单个字符

'*' 匹配零个或多个前面的那一个元素

所谓匹配，是要涵盖 整个 字符串 s的，而不是部分字符串。

说明:

s 可能为空，且只包含从 a-z 的小写字母。

p 可能为空，且只包含从 a-z 的小写字母，以及字符 . 和 *。

### 个人分析

拿到题目的第一反应就是这是一个 regex 表达式解析引擎，但是过于复杂。

于是可以按照一定的顺序去实现。

下面来逐步看一下这个题目的解答过程。

## v1 标准库实现版本

### 代码

```java
public boolean isMatch(String s, String p) {
    return s.matches(p);
}
```

### 性能

```
Runtime: 64 ms, faster than 24.57% of Java online submissions for Regular Expression Matching.
Memory Usage: 40.3 MB, less than 7.95% of Java online submissions for Regular Expression Matching.
```

虽然实现了，但是对于我们个人基本没有任何收益。

也没有体会到 regex 解析过程的快乐，而且性能也不怎么样。

## v2 递归实现

### 实现思路

如果 p 中没有任何 `*` 号，那么对比起来其实比较简单，就是文本 s 和 p 一一对应。

`.` 对应任意单个字符，也不难。

### 如果存在 * 号

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

### 效果

这个用到了递归，性能如下：

```
Runtime: 88 ms, faster than 8.51% of Java online submissions for Regular Expression Matching.
Memory Usage: 39.8 MB, less than 27.13% of Java online submissions for Regular Expression Matching.
```

一个字，惨~

## v3 动态规划

### 对于递归的思考

你也许发现了，原来的代码中

```java
isMatch(s.substring(1), p.substring(1))
```

这种类似的匹配结果，实际上是一次次的在重复的。

比如第一次我们匹配 [1, 10]，后续又匹配 [2, 10]

这样如果你学过 DP 那么会有一个想法，能否重复利用已经判断过的内容呢？

DP 无敌。

### 解题思路

我们用递归中同样的回溯方法，除此之外，因为函数 `match(text[i:], pattern[j:])` 只会被调用一次，我们用 dp(i, j) 来应对剩余相同参数的函数调用，这帮助我们节省了字符串建立操作所需要的时间，也让我们可以将中间结果进行保存。

### 自顶向下的方法

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

#### 效果

```
Runtime: 3 ms, faster than 83.97% of Java online submissions for Regular Expression Matching.
Memory Usage: 39.9 MB, less than 22.69% of Java online submissions for Regular Expression Matching.
```

性能还是不错的。

实际上这个性能是比实现一个 regex 引擎要好的，因为 regex 的编译构建 DFA/NFA 非常的耗时。


### 自上而下

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

#### 效果

还算比较优雅，性能还算满意。

```
Runtime: 2 ms, faster than 92.84% of Java online submissions for Regular Expression Matching.
Memory Usage: 38.3 MB, less than 73.31% of Java online submissions for Regular Expression Matching.
```

## 小结

虽然我们使用过很多次 Regex 正则表达式，但是实际上实现起来可能没有使用那么简单。

后续有机会我们可以讲述写如何实现一个相对完整的正则表达式引擎。

## 拓展阅读

[从零实现一个 regex 解析引擎](https://houbb.github.io/2020/01/07/regex-and-dfa-02)


# 44. Wildcard Matching 题目

44 这个题目，和 10 给人的感觉非常类似。

区别就是 10 正则中, `*` Matches zero or more of the preceding element。

而通配符匹配中：`*` Matches any sequence of characters (including the empty sequence).


## 描述

Given an input string (s) and a pattern (p), implement wildcard pattern matching with support for '?' and '*' where:

'?' Matches any single character.

'*' Matches any sequence of characters (including the empty sequence).

The matching should cover the entire input string (not partial).

## 例子

Example 1:

```
Input: s = "aa", p = "a"
Output: false
Explanation: "a" does not match the entire string "aa".
```

Example 2:

```
Input: s = "aa", p = "*"
Output: true
Explanation: '*' matches any sequence.
```

Example 3:

```
Input: s = "cb", p = "?a"
Output: false
Explanation: '?' matches 'c', but the second letter is 'a', which does not match 'b'.
```

## Constraints:

0 <= s.length, p.length <= 2000

s contains only lowercase English letters.

p contains only lowercase English letters, '?' or '*'.

# 和正则的区别

```
In that question（正则）

a* means it can be "" or "a" or "aa" or "aa.....". (i.e. Matches zero or more of the preceding element.)
a* cant be "ab" it can only have zero or more preceding element in this case will be 'a';
' * ' is not independent character consider (a*) as together.

In this case ,it is independent.（通配符）
Example: "aa*"
in this question it can be- "aa","aaa","aaa....a","aab","aabb","aaba"

And in that question it can be-（正则）
"a","aa","aaa","aaaa...aa"

(Notice in that question it can be "a" but here it can't be "aa" is the compulsary part.)
(Hope it help, was confused in both , sorry for my bad wording)
```


# V1-递归

先说最朴素的想法，就是使用递归。

## 思路

```
We can solve this problem using recursion. 

The basic conditions that we need to put here is when j reaches the end of pattern length, then we need to check if the i has also reached the end or not, if not then it will return false, otherwise true.

If the i reaches the end of the string i.e. i=s.length(), then only when p[j]=' * ' since * can be equal to the empty sequence as well.

We will now check if the current charcter of pattern and string are equal or not. They would be equal if either s[i]==p[j] or p[j]='?'.

if the current pattern character is ' * ' then we have two options either to move j forward and don't use it for matching or we can match and move the string index and keep the pattern index at j only.

if the current character is not ' * ', then we need to check only if the first_match is true and move both the i and j index by 1.
```

我们可以使用递归来解决这个问题。

我们需要放在这里的基本条件是当 j 到达模式长度的末尾时，我们需要检查 i 是否也到达末尾，如果没有则返回 false，否则返回 true。

如果 i 到达字符串的末尾，即 `i=s.length()`，则仅当 `p[j] == '*'` 因为 `*` 也可以等于空序列。

我们现在将检查模式和字符串的当前字符是否相等。 如果 `s[i]==p[j] || p[j]='?'`，它们将相等。

如果当前模式字符是 `*`，那么我们有两个选择，要么向前移动 j 并且不使用它进行匹配，要么我们可以匹配并移动字符串索引并仅将模式索引保持在 j。

如果当前字符不是 `*`，那么我们只需要检查 first_match 是否为真并将 i 和 j 索引都移动 1。

## java 实现

```java
/**
 * @author d
 * @since 1.0.0
 */
public class T044_WildcardMatchingRecursive {

    /**
     * 递归
     * @param str
     * @param pattern
     * @return
     */
    boolean isMatch(String str, String pattern) {
        return recursive(str.toCharArray(), pattern.toCharArray(), 0, 0);
    }

    private boolean recursive(char[] s, char[] p,
                              int i,
                              int j) {

        //p 结束，判断 s 是否结束
        if (j == p.length) {
            return i == s.length;
        }

        // s 结束，判断 p 当前是否为 *，且前面的都匹配
        if (i == s.length) {
            return (p[j] == '*' && recursive(s, p, i, j + 1));
        }

        if (p[j] == '*') {
            // p 为 * 的处理
            return recursive(s, p, i + 1, j) || recursive(s, p, i, j + 1);
        } else {
            // 其他 case, 二者相同。或者 p 为 ?
            if(i < s.length && (p[j] == s[i] || p[j] == '?')) {
                return recursive(s, p, i + 1, j + 1);
            }

            // 不匹配
            return false;
        }
    }

}
```

当然，这种暴力递归，会导致超时在  942 / 1811 

我们尝试引入一下内存化

# V2-递归+内存 top down

自上而下的 DP 解决方案：

我们多次解决相同的子问题，而不是我们可以保存这些问题并重新使用它们。 

我们可以用 -1 初始化 dp 数组，这样如果它变成正数就意味着它已经解决了 i 和 j。

```java
/**
 * @author d
 * @since 1.0.0
 */
public class T044_WildcardMatchingRecursiveMem {

        boolean isMatch(String s, String p) {
            if (p.length() == 0) {
                return (s.length() == 0);
            }
            boolean[][] mem = new boolean[s.length() + 1][p.length() + 1];
            return recursive(s.toCharArray(), p.toCharArray(), 0, 0, mem);
        }

        boolean recursive(char[] s, char[] p, int i, int j, boolean[][] mem) {
            if (j == p.length)
                return (i == s.length);

            // 为 false，没有处理过。
            if (!mem[i][j]) {
                if (i == s.length)
                    mem[i][j] = (p[j] == '*' && recursive(s, p, i, j + 1, mem));
                else if (i < s.length && (p[j] == s[i] || p[j] == '?')) {
                    mem[i][j] = recursive(s, p, i + 1, j + 1, mem);
                } else if (p[j] == '*') {
                    mem[i][j] = (recursive(s, p, i, j + 1, mem) || recursive(s, p, i + 1, j, mem));
                } else
                    mem[i][j] = false;
            }
            return mem[i][j];
        }

}
```

当然，这个依然会超时在 1616 / 1811

虽然有所提升，严格说，并没有解决这个问题。

# V3-DP 算法 bottom up

比较多的解法是采用 DP 的方式。

## DP 思路解析

> [c dp](https://leetcode.com/problems/wildcard-matching/solutions/1001130/c-clean-and-concise-bottom-up-dp-code-with-detailed-explanation-easy-to-understand/)

```
First, we need to create a 2d dp table dp. The size of this table is (s.size() + 1) * (p.size() + 1).

We introduce +1 here to better handle the edge cases where we have an empty string or an empty pattern. 

dp[i][j] means whether the substring from index 0 to i - 1 of the original string s matches with the subpattern from index 0 to j - 1 of the original pattern p.

Next, we initialize the base cases. 

There are three base cases:

1) When both the string and the pattern are empty.

Always match. dp[0][0] = true;

2) When only the string is empty.

Only if the subpattern only consists of *, we have a match.

3) When only the pattern is empty.
Always not match.
```

首先，我们需要初始化一个 dp[][] 二维数组。

```java
boolean dp[][] = new dp[s.length()+1][p.length()+1];
```

为什么需要 +1 呢？为了便于处理 s 或者 p 为空的场景。

`dp[i][j]` 的值，意味着 s[0, i-1] 对应的子字符串，是否匹配 p[0, j-1] 对应的子正则表达式。

然后就是 dp 数组的初始化，3 个场景需要考虑下：

1) s 和 p 都是空，匹配。

```java
dp[0][0] = true;
```

2) 只有 s 为空

此时，只有 p 的子串为 `*` 时，才匹配。

3）只有 p 为空

不匹配。

```
There are two special characters that we need to take special care in the pattern.

?
This is actually easy to deal with. Everytime when we encounter this, we can consider it matches with any character in the string. 

Say we are currently at dp[i][j], and we have p[j - 1] == '?', then we know it matches with s[i - 1], no matter what s[i - 1] actually is.

*
This is slightly hard to deal with. 

A small technique while dealing this kind of question is to actually draw out the dp table, and try to fill out the table manually, when the state transfer function is not very straightforward. 

Everything will become much clearer after you fill out one row or two.

When we encounter a * in the pattern, and assuming that we're currently trying to figure out what dp[i][j] is. Then we need to consider two cases if p[j - 1] == '*'.
Is dp[i - 1][j] true?

If yes, it means the current subpattern p[0...j - 1] we have matches the substring s[0... i - 2]. Then will p[0...j - 1] match with s[0... i - 1]? The answer is yes, because * can match any sequence of characters, so it's able to match one more character s[i - 1].

Is dp[i][j - 1] true?
If yes, it just means the current substring s[0...i - 1] matches with the subpattern p[0...j - 2]. Therefore, if we add one more * into the subpattern, it will also match as * can match empty subsequence.
```

p 中我们需要考虑 2 个特殊字符：? 和 *

1）`?` 时

其实和正则匹配类似。下面两个场景都是匹配的：当 p 为 ? 时；或者 p 和 s 的字符相同；

```java
s[i - 1] == p[j - 1] || p[j - 1] == '?'
```

2）`*` 时，稍微复杂点。

这有点难以处理。做这种题的一个小技巧就是实际画出dp表，在状态传递函数不是很直接的情况下尝试手动填表。填写一两行后，一切都会变得更加清晰。

我们在判断 `dp[i][j]` 时，如果 `p[j-1] == '*'`，那么要怎么考虑呢？

2.1）判断 `dp[i-1][j] == true` ?

如果为 true，说明 s(0, i-2) 匹配 p(0, i-1)

因为 `*` 可以匹配任意字符，所以可以推断出 s(0, i-1) 也匹配 p(0, i-1)

2.2）判断 `dp[i][j-1] == true`

如果为 true，说明 s(0, i-1) 匹配 p(0, i-2)

此时，我们在 p 通配符后面加一个匹配任意的 `*` 肯定也是满足的。

## java 实现

```java
public boolean isMatch(String s, String p) {
    boolean[][] dp = new boolean[s.length()+1][p.length()+1];
    dp[0][0] = true;
    //后续 p 只要是 *，肯定也是 true
    for(int j = 0; j < p.length(); j++) {
        if(p.charAt(j) == '*') {
            // s 为空，p == * 的场景
            dp[0][j+1] = true;
        } else {
            // 终止
            break;
        }
    }

    // 处理逻辑
    // 从1开始，0 在 dp 中代表的是空初始化位置。
    for(int i = 1; i <= s.length(); i++) {
        for(int j = 1; j <= p.length(); j++) {
            // 判断 *，两个场景满足一个皆可
            if(p.charAt(j-1) == '*') {
                dp[i][j] = dp[i-1][j] || dp[i][j-1];
            } else {
                // 此时就是普通的字符匹配，或者 p == ? 的 CASE
                dp[i][j] = dp[i-1][j-1] && (s.charAt(i-1) == p.charAt(j-1) || p.charAt(j-1) == '?');
            }
        }
    }
    // 最后一个存储结果
    return dp[s.length()][p.length()];
}
```

dp bottom up 是比较好的解法。

耗时：30ms，超过 70%

不过还有一种更快的算法，此处记一下，作为学习。

# V5-greedy + DFS 

## 解题思路

我从 http://yucoding.blogspot.com/2013/02/leetcode-question-123-wildcard-matching.html 找到了这个解决方案

基本思想是为字符串设置一个指针，为模式设置一个指针。 

该算法最多迭代length(string) + length(pattern)次，每次迭代至少有一个指针前进一步。

## 原始的 c++ 实现

```c++
bool isMatch(const char *s, const char *p) {
    const char* star=NULL;
    const char* ss=s;
    while (*s){
        //advancing both pointers when (both characters match) or ('?' found in pattern)
        //note that *p will not advance beyond its length 
        if ((*p=='?')||(*p==*s)){s++;p++;continue;} 
        // * found in pattern, track index of *, only advancing pattern pointer 
        if (*p=='*'){star=p++; ss=s;continue;} 
        //current characters didn't match, last pattern pointer was *, current pattern pointer is not *
        //only advancing pattern pointer
        if (star){ p = star+1; s=++ss;continue;} 
       //current pattern pointer is not star, last patter pointer was not *
       //characters do not match
        return false;
    }
   //check for remaining characters in pattern
    while (*p=='*'){p++;}
    return !*p;  
}
```

## java 实现

```java
boolean isMatch(String str, String pattern) {
        int s = 0, p = 0, match = 0, starIdx = -1;            
        while (s < str.length()){
            // advancing both pointers
            // p 如果是 ? 或者和 s 相同，则同时向后移动一位。
            if (p < pattern.length()  && (pattern.charAt(p) == '?' || str.charAt(s) == pattern.charAt(p))){
                s++;
                p++;
            }
            // * found, only advancing pattern pointer
            // 如果 p 这里是 *。记录下当前的 s 字符，和 p 的位置。然后 p 正则向后移动？为什么呢？
            else if (p < pattern.length() && pattern.charAt(p) == '*'){
                starIdx = p;
                match = s;
                p++;
            }
            // starIdx 在上一个条件中，被更新为 p 所在的位置。
            // 此时，可以匹配任意多的字符。
            // last pattern pointer was *, advancing string pointer
            else if (starIdx != -1){
                p = starIdx + 1;
                match++;
                s = match;
            }
           //current pattern pointer is not star, last patter pointer was not *
          //characters do not match
            else return false;
        }
        
        //check for remaining characters in pattern
        while (p < pattern.length() && pattern.charAt(p) == '*')
            p++;
        
        return p == pattern.length();
}
```

## 注释更加丰富的版本

最初我觉得这个解决方案很难理解，尤其是使用 * 和匹配（ss）。

在手动运行了一些测试用例之后，我得到了这个想法，所以我想把我的笔记贴出来给那些发现算法难以理解的人。 希望能帮助到你！

```java
// greedy solution with idea of DFS

// starj stores the position of last * in p
// last_match stores the position of the previous matched char in s after a *
// e.g. 
// s: a c d s c d
// p: * c d

// after the first match of the *, starj = 0 and last_match = 1
// when we come to i = 3 and j = 3, we know that the previous match of * is actually wrong, 
// (the first branch of DFS we take is wrong)
// then it resets j = starj + 1 
// since we already know i = last_match will give us the wrong answer
// so this time i = last_match+1 and we try to find a longer match of *
// then after another match we have starj = 0 and last_match = 4, which is the right solution
// since we don't know where the right match for * ends, we need to take a guess (one branch in DFS), 
// and store the information(starj and last_match) so we can always backup to the last correct place and take another guess.
bool isMatch(string s, string p) {
    int i = 0, j = 0;
    int m = s.length(), n = p.length();
    int last_match = -1, starj = -1;
    while (i < m){
        if (j < n && (s[i] == p[j] || p[j] == '?')){
            i++; j++;
        }
        else if (j < n && p[j] == '*'){
            starj = j;
            j++;
            last_match = i;
        }
        else if (starj != -1){
            j = starj + 1;
            last_match++;
            i = last_match;
        }
        else return false;
    }
    while (p[j] == '*' && j <n) j++;
    return j == n;
}
```

耗时：2ms，超过 100%

# 开源地址

为了便于大家学习，所有实现均已开源。欢迎 fork + star~

> [https://github.com/houbb/leetcode](https://github.com/houbb/leetcode)

# 参考资料

https://leetcode.com/problems/wildcard-matching/solutions/17810/linear-runtime-and-constant-space-solution/

[regular-expression-matching](https://leetcode.com/problems/regular-expression-matching/solution/)

https://leetcode-cn.com/problems/regular-expression-matching/

https://leetcode.com/problems/wildcard-matching/solutions/17812/my-java-dp-solution-using-2d-table/

https://leetcode.com/problems/wildcard-matching/solutions/752350/recursion-brute-force-to-top-down-dp-and-bottom-up/

* any list
{:toc}