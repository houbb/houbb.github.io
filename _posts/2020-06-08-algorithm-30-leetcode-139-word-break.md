---
layout: post
title: leetcode 139 word break 回溯 backtrack 
date:  2020-1-23 10:09:32 +0800 
categories: [Algorithm]
tags: [algorithm, leetcode, dp, backtrack, sh]
published: true
---

# 题目

Given a string s and a dictionary of strings wordDict, return true if s can be segmented into a space-separated sequence of one or more dictionary words.

Note that the same word in the dictionary may be reused multiple times in the segmentation.

## Ex

Example 1:

```
Input: s = "leetcode", wordDict = ["leet","code"]
Output: true
Explanation: Return true because "leetcode" can be segmented as "leet code".
```

Example 2:

```
Input: s = "applepenapple", wordDict = ["apple","pen"]
Output: true
Explanation: Return true because "applepenapple" can be segmented as "apple pen apple".
Note that you are allowed to reuse a dictionary word.
```

Example 3:

```
Input: s = "catsandog", wordDict = ["cats","dog","sand","and","cat"]
Output: false
```

## Constraints:

- 1 <= s.length <= 300

- 1 <= wordDict.length <= 1000

- 1 <= wordDict[i].length <= 20

- s and wordDict[i] consist of only lowercase English letters.

- All the strings of wordDict are unique.

# 思路

对于单词 s 的分割，是否都可以在 wordDict 中。

可以有两个入手的角度。

## 切割 s

第一种方式，我们可以把单词 s 不断的进行切割。

然后把所有的结果，找到一种全部的子字符串都在 wordDict 中。

## wordDict 拼接

也可以反过来思考。

我们可以从 wordDict 中重复取出单词，去拼接对应的字符串，如果匹配，则说明完成，直接返回。

# 算法实现

## V1-backtrack 回溯算法

我们这里使用 wordDict 拼接，采用回溯的算法。

```java
class Solution {
    

    public boolean wordBreak(String s, List<String> wordDict) {
        List<String> resultList = new ArrayList<>();

        // 存放字符串的子集
        List<String> tempList = new ArrayList<>();

        // 回溯問題？
        backtrack(s, wordDict, tempList, resultList);

        // 全部使用到了
        return resultList.size() > 0;
    }

    private void backtrack(String target, List<String> wordDict,
                           List<String> tempList,
                           List<String> resultList) {
        // 终止条件
        String tempString = buildString(tempList);
        // 剪枝
        if(tempString.length() > target.length()) {
            return;
        } else if(tempString.equals(target)) {
            resultList.addAll(new ArrayList<>(tempList));
            return;
        } else {
            // 剪枝
            if(resultList.size() > 0) {
                return;
            }

            // 拼接，可以从字典中任意取一个。可以重复使用
            for(String word : wordDict) {
                tempList.add(word);

                // 回溯
                backtrack(target, wordDict, tempList,  resultList);

                // 移除最后一个
                tempList.remove(tempList.size()-1);
            }
        }
    }

    private String buildString(List<String> tempList) {
        StringBuilder stringBuilder = new StringBuilder();
        for(String temp : tempList) {
            stringBuilder.append(temp);
        }

        return stringBuilder.toString();
    }

}
```

不过，这个方法会在 32/45 的时候，直接超时。

## V2.1 剪枝优化

发现少考虑了一个剪枝的算法。

那就是拼接的 tempString 其实必须是 target 目标字符串的开头。

```java
// 剪枝
if(tempString.length() > target.length()
    || !target.startsWith(tempString)) {
    return;
} 
```

此时可以把测试用例到 

```
s =
"aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaab"
wordDict =
["a","aa","aaa","aaaa","aaaaa","aaaaaa","aaaaaaa","aaaaaaaa","aaaaaaaaa","aaaaaaaaaa"]
```

看到这个用例，最大的想法，感觉就是贪心。

我们如果先对 wordDict 进行排序，把长度最长的排在前面呢？

## V2.2 调整 wordDict 的顺序

优先把 wordDict 中的单词顺序放在前面，或者加一个多的字符的去重。进行快速失败

```java
package com.github.houbb.leetcode.F100T200;

import java.util.*;

/**
 * @author binbin.hou
 * @since 1.0.0
 */
public class T139_WordBreakV2 {

    /**
     *
     * 1 <= wordDict.length <= 1000
     * 1 <= wordDict[i].length <= 20
     *
     * 单词的长度可能比较长，单词词库的数量有限。
     *
     * 感觉可以反过来思考：
     *
     * 1. 从词典中选择一个词，构建字符串
     * 2. 从词典中继续选择一个词（单词可以复用，不需要移除）， 构建字符串剩余的部分
     * 3. 使用 backtrack
     *
     * @param s 目标
     * @param wordDict 单词库
     * @return 结果
     */
    public boolean wordBreak(String s, List<String> wordDict) {
        List<String> resultList = new ArrayList<>();


        //2. 第二个问题，如果很长的一个字符串，最后一个却不存在。
        // 那么可否把 s 进行拆分去重？
        // 但是感觉这样也是指标不治本
        boolean fastFailed = fastFailed(s, wordDict);
        if(!fastFailed) {
            return false;
        }

        // 调整 wordDict 的顺序，把长度较长的放在前面。便于 greedy。
        Collections.sort(wordDict, new Comparator<String>() {
            @Override
            public int compare(String o1, String o2) {
                return o2.length() - o1.length();
            }
        });

        // 存放字符串的子集
        List<String> tempList = new ArrayList<>();

        // 回溯問題？
        backtrack(s, wordDict, tempList, resultList);

        // 全部使用到了
        return resultList.size() > 0;
    }

    private boolean fastFailed(String s, List<String> wordDict) {
        Set<Character> targetSet = getCharSet(s);
        Set<Character> wordSet = getCharSet(buildString(wordDict));

        for(Character character : targetSet) {
            if(!wordSet.contains(character)) {
                return false;
            }
        }

        return true;
    }

    private Set<Character> getCharSet(String text) {
        char[] chars = text.toCharArray();

        Set<Character> set = new HashSet<>();
        for(char c : chars) {
            set.add(c);
        }
        return set;
    }

    private void backtrack(String target, List<String> wordDict,
                           List<String> tempList,
                           List<String> resultList) {
        // 终止条件
        String tempString = buildString(tempList);
        // 剪枝
        if(tempString.length() > target.length()
            || !target.startsWith(tempString)) {
            return;
        } else if(tempString.equals(target)) {
            // 后来发现，并不需要用完所有的单词。
            // 这里不需要返回结果，只需要是否即可。
            resultList.addAll(new ArrayList<>(tempList));
            return;
        } else {
            // 剪枝
            if(resultList.size() > 0) {
                return;
            }

            // 拼接，可以从字典中任意取一个。可以重复使用
            for(String word : wordDict) {
                tempList.add(word);

                // 回溯
                backtrack(target, wordDict, tempList,  resultList);

                // 移除最后一个
                tempList.remove(tempList.size()-1);
            }
        }
    }

    private String buildString(List<String> tempList) {
        StringBuilder stringBuilder = new StringBuilder();
        for(String temp : tempList) {
            stringBuilder.append(temp);
        }

        return stringBuilder.toString();
    }

}
```

但是执行到 38/45

```
s =
"aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaabaabaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa"
wordDict =
["aa","aaa","aaaa","aaaaa","aaaaaa","aaaaaaa","aaaaaaaa","aaaaaaaaa","aaaaaaaaaa","ba"]
```

依然会失败。

说明上面的优化没什么大的进步，没有抓住关键。

## V3-从字符串切分的角度思考

重新看了一下约束条件，发现其实是 s 的长度比 wordDict 短。

当然了，上面的 case 实际上 wordDict 也没多长。

```
- 1 <= s.length <= 300

- 1 <= wordDict.length <= 1000
```

### V3.1 字符串切分的回溯实现

这里的一个技巧就是把 wordDict 从 list 转换为 set，将判断 subString 是否存在时间复杂度从 O(N) => O(1)。

```java
public boolean wordBreak(String s, List<String> wordDict) {
    // assume s and wordDict are non-empty
    return backtracking(0, s, new HashSet<>(wordDict));
}

private boolean backtracking(int depth, String s, Set<String> wordSet) {
    int n = s.length();
    // accept
    if (depth == n) {
        return true;
    }
    for (int i = depth; i < n; ++i) {
        // substring[depth, i]
        String str = s.substring(depth, i + 1);
        //O(1) 判断 str 是否存在
        if (wordSet.contains(str)) {
            if (backtracking(i + 1, s, wordSet)) {
                return true;
            }
        }
    }
    return false;
}
```

### V3.2 引入内存化 Backtracking (Memoization)

下面我们用一个例子来看看我们是否可以优化上面的方法。

```
// String: "abcde" | wordDict: ["a", ...]

depth = 0 ('a')
we have substrings: "a", "ab", "abc", "abcd", "abcde"
```

对于第一个子字符串“a”，它在 wordDict 中，因此深度变为 1，我们将检查“bcde”是否可破解。

在检查“bcde”是否可破解的过程中，我们可能会检查“cde”、“de”、“e”是否可破解。 

一旦我们知道答案，我们就可以缓存它们以供将来使用，无论它们是真还是假。

将来当我们处理完第一个子字符串“a”时，我们将检查“b”，你会看到“cde”、“de”、“e”可能会有很多重复计算。

困难：在回溯式递归函数中使用记忆与其他 DP 记忆相比并不常见。 这是我学到的新形式。 我们需要设置和获取 memo[] 的三个地方。

注意：我们使用布尔值是因为最初我们希望值为空。

实现起来也不难，我们在上面的例子中改一下。

```java
import java.util.Arrays;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

/**
 * @author binbin.hou
 * @since 1.0.0
 */
public class T139_WordBreakV4 {

    public boolean wordBreak(String s, List<String> wordDict) {
        // memo[i] --> S[i...] is breakable or not
        Boolean[] mem = new Boolean[s.length()];

        // assume s and wordDict are non-empty
        return backtracking(mem, 0, s, new HashSet<>(wordDict));
    }

    private boolean backtracking(Boolean[] mem,
                                 int depth, String s, Set<String> wordSet) {
        int n = s.length();
        // accept
        if (depth == n) {
            return true;
        }

        // 内存化复用
        if(mem[depth] != null) {
            return mem[depth];
        }

        for (int i = depth; i < n; ++i) {
            // substring[depth, i]
            String str = s.substring(depth, i + 1);

            //O(1) 判断 str 是否存在
            if (wordSet.contains(str)) {
                if (backtracking(mem, i + 1, s, wordSet)) {
                    // 可以，存储
                    mem[depth] = true;

                    return true;
                }
            }
        }

        // 不可，存储
        mem[depth] = false;
        return false;
    }

}
```

### V3.3 DP

一个字符窜 S 能否拆分为对应的2个子问题 s1 + s2。

如果 s1、s2 本身都可以在 dict 中，那么说明 s 本身就是可以拆分的（满足题目的条件）。

我们定义一个 dp[] 记录 i 的位置是否可以拆分，如果 `s(0, i - 1)` 或者 `s.substring(0, i)` 可拆分，则设置为 true，否则为 false。

why?

```
// String: a b c d e f
In the final round, we are looking into the whole string. We would examine the follow pair of two substrings:

a     bcdef
ab    cdef
abc   def
abcd  ef
abcde f
```

java 实现：

```java
public boolean wordBreak(String s, List<String> wordDict) {
    // 初始化 dp[]
    boolean[] dp = new boolean[s.length()+1];
    dp[0] = true;
    Set<String> wordSet = new HashSet<>(wordDict);
    for(int i = 1; i <= s.length(); i++) {
        for(int j = 0; j < i; j++) {
            // s1 = substring(0, j) = dp[j]
            // s2 = substring(j, i) = s[j, i - 1]
            // 对前面的的每一个 subString 进行比较
            String subString = s.substring(j, i);
            if(dp[j] && wordSet.contains(subString)) {
                // 这个位置断开，是可行的。
                dp[i] = true;
                break;
            }
        }
    }
    return dp[s.length()];
}
```

比较神奇的是，发现性能竟然中规中矩。

TC: O(N^3)，这里需要把 substring 的复杂度也考虑进来。

有办法进一步优化 substring，或者说不适用 substring 也能达到目的吗？

## V4-backtrack 的优化

其实是可以的。就是一开始我使用的通过 wordDict 中的单词拼接。

虽然 wordDict 的长度可能比 string 多一点，但是和 O(N) 的复杂度对比，基本忽略。

PS: 这里甚至可以下一个判断。根据二者的长度，可以选择对应的算法。

### java 实现

这个算法的性能非常高，为什么呢？

```java
    public boolean wordBreak(String s, List<String> wordDict) {
        // 记录一个位置，是否被问过
        boolean[] mem = new boolean[s.length() + 1];

        return helper(mem, 0, s, wordDict);
    }

    /**
     *
     * @param mem 内存优化
     * @param length 字符串长度
     * @param target 目标字符串长度
     * @param wordList 字典
     * @return 结果
     */
    private boolean helper(boolean[] mem,
                           int length,
                           String target,
                           List<String> wordList) {
        // 终止条件
        if(length == target.length()) {
            return true;
        }

        // 已经访问过，说明不可行，直接 false
        if(mem[length]) {
            return false;
        }

        // 更新当前位置
        mem[length] = true;

        for(String word : wordList) {
            // 感觉和 substring 差不多，只不过是变成了 startWith
            if(target.startsWith(word, length)
                && helper(mem, length + word.length(), target, wordList)) {
                return true;
            }
        }

        return false;
    }
```

### 对比

我们对比一下前面的一个实现 V3.2：

1） 一样的内存记录 mem 数组。

2）这里慢，应该就是慢在这个位置被问过以后，没有立刻返回失败。

```java
public boolean wordBreak(String s, List<String> wordDict) {
        // memo[i] --> S[i...] is breakable or not
        Boolean[] mem = new Boolean[s.length()];

        // assume s and wordDict are non-empty
        return backtracking(mem, 0, s, new HashSet<>(wordDict));
    }

    private boolean backtracking(Boolean[] mem,
                                 int depth, String s, Set<String> wordSet) {
        int n = s.length();
        // accept
        if (depth == n) {
            return true;
        }

        // 内存化复用
        if(mem[depth] != null) {
            return mem[depth];
        }

        for (int i = depth; i < n; ++i) {
            // substring[depth, i]
            String str = s.substring(depth, i + 1);

            //O(1) 判断 str 是否存在
            if (wordSet.contains(str)) {
                if (backtracking(mem, i + 1, s, wordSet)) {
                    // 可以，存储
                    mem[depth] = true;

                    return true;
                }
            }
        }

        // 不可，存储
        mem[depth] = false;
        return false;
    }

```


# 140. Word Break II

## 题目

Given a string s and a dictionary of strings wordDict, add spaces in s to construct a sentence where each word is a valid dictionary word. Return all such possible sentences in any order.

Note that the same word in the dictionary may be reused multiple times in the segmentation.

### EX 

Example 1:

```
Input: s = "catsanddog", wordDict = ["cat","cats","and","sand","dog"]
Output: ["cats and dog","cat sand dog"]
```

Example 2:

```
Input: s = "pineapplepenapple", wordDict = ["apple","pen","applepen","pine","pineapple"]
Output: ["pine apple pen apple","pineapple pen apple","pine applepen apple"]
Explanation: Note that you are allowed to reuse a dictionary word.
```

Example 3:

```
Input: s = "catsandog", wordDict = ["cats","dog","sand","and","cat"]
Output: []
```
 
### Constraints:

    1 <= s.length <= 20
    1 <= wordDict.length <= 1000
    1 <= wordDict[i].length <= 10
    s and wordDict[i] consist of only lowercase English letters.
    All the strings of wordDict are unique.

## 思路

这个在上面的题目基础上其实非常简单，采用字典中选择字符串，拼接结果的方式。

## java 实现

```java
    public List<String> wordBreak(String s, List<String> wordDict) {
        List<String> resultList = new ArrayList<>();

        // 存放字符串的子集
        List<String> tempList = new ArrayList<>();

        backtrack(s, wordDict, tempList, resultList);

        return resultList;
    }

    private void backtrack(String target,
                           List<String> wordDict,
                           List<String> tempList,
                           List<String> resultList) {
        // 终止条件
        String tempString = join(tempList, "");

        // 剪枝
        if(tempString.length() > target.length()) {
            return;
        } else if(tempString.equals(target)) {
            // 后来发现，并不需要用完所有的单词。
            // 这里不需要返回结果，只需要是否即可。
            resultList.add(join(tempList, " "));
            return;
        } else {
            // 拼接，可以从字典中任意取一个。可以重复使用
            for(String word : wordDict) {
                // 这里只选择匹配的字符串
                if(target.startsWith(word, tempString.length())) {
                    tempList.add(word);

                    // 回溯
                    backtrack(target, wordDict, tempList,  resultList);

                    // 移除最后一个
                    tempList.remove(tempList.size()-1);
                }
            }
        }
    }

    private String join(List<String> tempList,
                        String splitter) {
        if(tempList.size() <= 0) {
            return "";
        }

        StringBuilder stringBuilder = new StringBuilder();
        for(int i = 0; i < tempList.size()-1; i++) {
            stringBuilder.append(tempList.get(i))
                    .append(splitter);
        }
        stringBuilder.append(tempList.get(tempList.size()-1));

        return stringBuilder.toString();
    }
```

# 参考资料

https://leetcode.com/problems/word-break

https://leetcode.com/problems/word-break-ii/description/

https://leetcode.com/problems/word-break/solutions/434582/java-solutions-backtracking-memoization-dp-with-detailed-exp/

https://leetcode.com/problems/word-break/solutions/43970/concise-dfs-backtracking-solution/

* any list
{:toc}