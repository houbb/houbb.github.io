---
layout: post
title:  单词拼写纠正-03-72.力扣编辑距离 4 种解法 leetcode edit-distance 
date:  2020-1-20 10:09:32 +0800
categories: [Data-Struct]
tags: [edit-distance, chinese, nlp, algorithm, sh]
published: true
---

# 拼写纠正系列

[NLP 中文拼写检测实现思路](https://houbb.github.io/2020/01/20/nlp-chinese-spelling-correct-01-intro)

[NLP 中文拼写检测纠正算法整理](https://houbb.github.io/2020/01/20/nlp-chinese-spelling-correct-02)

[NLP 英文拼写算法，如果提升 100W 倍的性能？](https://houbb.github.io/2020/01/20/nlp-chinese-spelling-correct-03-100w-faster)

[NLP 中文拼写检测纠正 Paper](https://houbb.github.io/2020/01/20/nlp-chinese-spelling-correct-paper)

[java 实现中英文拼写检查和错误纠正？可我只会写 CRUD 啊！](https://houbb.github.io/2020/01/20/nlp-chinese-word-checker-01-intro)

[一个提升英文单词拼写检测性能 1000 倍的算法？](https://houbb.github.io/2020/01/20/nlp-chinese-word-checker-02-1000x)

[单词拼写纠正-03-leetcode edit-distance 72.力扣编辑距离](https://houbb.github.io/2020/01/20/nlp-chinese-word-checker-03-edit-distance-intro)

## 开源项目

[nlp-hanzi-similar 汉字相似度](https://github.com/houbb/nlp-hanzi-similar)

[word-checker 拼写检测](https://github.com/houbb/word-checker)

[sensitive-word 敏感词](https://github.com/houbb/sensitive-word)

# 题目

给你两个单词 word1 和 word2， 请返回将 word1 转换成 word2 所使用的最少操作数  。

你可以对一个单词进行如下三种操作：

插入一个字符
删除一个字符
替换一个字符
 

示例 1：

```
输入：word1 = "horse", word2 = "ros"
输出：3
解释：
horse -> rorse (将 'h' 替换为 'r')
rorse -> rose (删除 'r')
rose -> ros (删除 'e')
```

示例 2：

```
输入：word1 = "intention", word2 = "execution"
输出：5
解释：
intention -> inention (删除 't')
inention -> enention (将 'i' 替换为 'e')
enention -> exention (将 'n' 替换为 'x')
exention -> exection (将 'n' 替换为 'c')
exection -> execution (插入 'u')
``` 

提示：

0 <= word1.length, word2.length <= 500
word1 和 word2 由小写英文字母组成


## 方法模板

```java
class Solution {
    public int minDistance(String word1, String word2) {
        
    }
}
```

# v1-暴力算法

## 思路

最简单的暴力算法思路。

在递归过程中，对于每个字符都尝试三种操作：插入、删除和替换。

1. 递归定义：我们可以递归地定义 `minDistance(i, j)` 为将 `word1` 的前 `i` 个字符转换为 `word2` 的前 `j` 个字符的最少操作数。
   
2. 操作：
    - 插入：如果 `word1[i]` 和 `word2[j]` 不相等，我们可以插入 `word2[j]`，使 `word1[i]` 和 `word2[j]` 对齐。
    - 删除：删除 `word1[i]`，即减少 `word1` 的字符。
    - 替换：如果 `word1[i]` 和 `word2[j]` 不相等，我们可以替换 `word1[i]` 为 `word2[j]`。

3. 递归的终止条件：
    - 如果 `word1` 已经为空，返回 `j`，即只需要插入 `word2[j]` 中的所有字符。
    - 如果 `word2` 已经为空，返回 `i`，即只需要删除 `word1[i]` 中的所有字符。

4. 时间复杂度：由于每个字符可能会进行插入、删除或替换，因此暴力解法的时间复杂度是指数级的，具体为 `O(3^max(i, j))`，但由于没有记忆化，效率较低。

## 实现

```java
class Solution {
    public int minDistance(String word1, String word2) {
        return helper(word1, word2, word1.length(), word2.length());
    }

    // 递归函数，计算word1[0..i]到word2[0..j]的最小编辑距离
    private int helper(String word1, String word2, int i, int j) {
        // 如果 word1 为空，则需要插入所有 word2 的字符
        if (i == 0) return j;
        
        // 如果 word2 为空，则需要删除所有 word1 的字符
        if (j == 0) return i;
        
        // 如果字符相等，则不需要任何操作，直接比较剩下的子串
        if (word1.charAt(i - 1) == word2.charAt(j - 1)) {
            return helper(word1, word2, i - 1, j - 1);
        }
        
        // 如果字符不相等，则考虑三种操作
        int insert = helper(word1, word2, i, j - 1);  // 插入
        int delete = helper(word1, word2, i - 1, j);  // 删除
        int replace = helper(word1, word2, i - 1, j - 1);  // 替换
        
        // 返回三种操作中的最小值 + 1（表示进行了一次操作）
        return 1 + Math.min(Math.min(insert, delete), replace);
    }
}
```

## 效果

超出时间限制

26 / 1147 个通过的测试用例

## 复杂度

时间复杂度：由于没有使用记忆化，递归会多次计算相同的子问题，因此时间复杂度为 `O(3^max(i, j))`，是指数级的，效率较低。

空间复杂度：递归调用栈的深度为 `O(i + j)`，即最多为两个字符串的长度之和。

# v2-记忆化递归 (Memoization)

记忆化递归是暴力递归的一种优化，通过在递归过程中记录已经计算过的子问题的结果，避免了重复计算。

这样，我们仍然采用递归的方式，但是每次递归计算的结果都被存储在一个哈希表或二维数组中，以供以后直接使用。

## 思路

递归之所以慢，是因为结果没有被缓存下来。

- 和暴力递归类似，我们通过递归解决子问题，并使用一个 `memo` 数组（或者 `Map`）来记录每个子问题的解。

- 在每次递归计算之前，先检查是否已经计算过该子问题。如果已经计算过，直接返回存储的结果，否则继续递归计算并存储结果。

## 实现：

```java
class Solution {
    public int minDistance(String word1, String word2) {
        int m = word1.length();
        int n = word2.length();
        Integer[][] memo = new Integer[m + 1][n + 1];
        return helper(word1, word2, m, n, memo);
    }

    private int helper(String word1, String word2, int i, int j, Integer[][] memo) {
        // 递归终止条件
        if (i == 0) return j;  // 将空字符串转换成 word2[0..j-1]
        if (j == 0) return i;  // 将 word1[0..i-1] 转换成空字符串

        // 如果已经计算过该子问题，直接返回结果
        if (memo[i][j] != null) return memo[i][j];

        // 计算当前子问题的解
        if (word1.charAt(i - 1) == word2.charAt(j - 1)) {
            memo[i][j] = helper(word1, word2, i - 1, j - 1, memo);  // 字符相等，不需要任何操作
        } else {
            // 否则，考虑三种操作
            int insert = helper(word1, word2, i, j - 1, memo);  // 插入
            int delete = helper(word1, word2, i - 1, j, memo);  // 删除
            int replace = helper(word1, word2, i - 1, j - 1, memo);  // 替换
            memo[i][j] = Math.min(Math.min(insert, delete), replace) + 1;
        }
        
        return memo[i][j];
    }
}
```

## 效果

3ms

击败98.10%

## 复杂度

- 时间复杂度：`O(m * n)`，其中 `m` 和 `n` 是 `word1` 和 `word2` 的长度，因为我们每个子问题只计算一次。

- 空间复杂度：`O(m * n)`，用于存储 `memo` 数组。

通过记忆化递归，避免了暴力递归中的重复计算，显著提升了性能。

## 小结

其实个人觉得如果你擅长递归，那么递归+记忆化其实是一种非常好的实现方式。

相对实现比较自然，而且性能也非常好。

# v3-DP 动态规划

## 思路

之所以特别慢，是因为我们递归的时候存在大量的计算。

要改进这个算法，可以通过 DP 来避免重复计算，从而显著提升效率。

通过使用一个二维数组 `dp` 来记录子问题的结果，动态规划能够从底向上计算出最小操作数。

## 核心流程

1. 状态定义：
   - 定义 `dp[i][j]` 为将 `word1[0..i-1]` 转换为 `word2[0..j-1]` 的最小操作数。
   
2. 状态转移：
   - 如果 `word1[i-1] == word2[j-1]`，那么不需要操作，`dp[i][j] = dp[i-1][j-1]`。
   - 如果 `word1[i-1] != word2[j-1]`，则有三种操作：
     1. 插入：将 `word2[j-1]` 插入到 `word1[i-1]` 后，`dp[i][j] = dp[i][j-1] + 1`。
     2. 删除：将 `word1[i-1]` 删除，`dp[i][j] = dp[i-1][j] + 1`。
     3. 替换：将 `word1[i-1]` 替换为 `word2[j-1]`，`dp[i][j] = dp[i-1][j-1] + 1`。

   其中，选择这三种操作中的最小值。

3. 初始化：
   - `dp[0][j] = j`：表示将空的 `word1` 转换为 `word2[0..j-1]` 需要 `j` 次插入操作。
   - `dp[i][0] = i`：表示将 `word1[0..i-1]` 转换为空的 `word2` 需要 `i` 次删除操作。

4. 最终结果：`dp[m][n]`，其中 `m` 和 `n` 分别是 `word1` 和 `word2` 的长度，表示将整个 `word1` 转换为 `word2` 的最小操作数。


## 状态转移

### 插入操作：

当我们考虑插入操作时，假设我们已经知道将 `word1[0..i-1]` 转换成 `word2[0..j-2]` 的最小操作数 `dp[i][j-1]`。

如果我们想通过插入一个字符来将 `word1[0..i-1]` 转换成 `word2[0..j-1]`，我们需要做的操作就是将 `word2[j-1]` 插入到 `word1[i-1]` 后面。

例如，如果 `word1 = "horse"`，`word2 = "ros"`，当我们比较到 `word1[0..4]` 和 `word2[0..2]` 时，发现 `word1` 和 `word2` 的最后一个字符不一样。我们可以插入 `word2[j-1]`（即 's'）到 `word1` 的末尾，变成 `"horses"`。

因此，操作数就是 `dp[i][j-1] + 1`，即 `dp[i][j] = dp[i][j-1] + 1`。

### 删除操作：

当我们考虑删除操作时，假设我们已经知道将 `word1[0..i-2]` 转换为 `word2[0..j-1]` 的最小操作数 `dp[i-1][j]`。

如果我们想通过删除一个字符来将 `word1[0..i-1]` 转换成 `word2[0..j-1]`，我们可以删除 `word1[i-1]` 这个字符。

例如，如果 `word1 = "horse"`，`word2 = "ros"`，当我们比较到 `word1[0..4]` 和 `word2[0..2]` 时，发现 `word1` 的最后一个字符 'e' 没有出现在 `word2` 中。我们可以删除 'e'，使 `word1` 变成 `"hors"`。

因此，操作数就是 `dp[i-1][j] + 1`，即 `dp[i][j] = dp[i-1][j] + 1`。

### 替换操作：

当我们考虑替换操作时，假设我们已经知道将 `word1[0..i-2]` 转换为 `word2[0..j-2]` 的最小操作数 `dp[i-1][j-1]`。

如果我们想通过替换一个字符来将 `word1[0..i-1]` 转换成 `word2[0..j-1]`，我们需要将 `word1[i-1]` 替换为 `word2[j-1]`。

例如，如果 `word1 = "horse"`，`word2 = "ros"`，我们比较到 `word1[0..4]` 和 `word2[0..2]` 时，发现 `word1` 和 `word2` 的最后一个字符不一样。

我们可以将 `word1` 中的 'h' 替换成 'r'，得到 `"rorse"`。

因此，操作数就是 `dp[i-1][j-1] + 1`，即 `dp[i][j] = dp[i-1][j-1] + 1`。

## 实现

```java
class Solution {
    public int minDistance(String word1, String word2) {
        int m = word1.length();
        int n = word2.length();
        
        // 创建dp数组，dp[i][j]表示word1[0..i-1]转换为word2[0..j-1]的最小操作数
        int[][] dp = new int[m + 1][n + 1];
        
        // 初始化第一列和第一行
        for (int i = 0; i <= m; i++) {
            dp[i][0] = i;  // 从word1[0..i-1]变为空字符串需要i次删除
        }
        
        for (int j = 0; j <= n; j++) {
            dp[0][j] = j;  // 从空字符串变成word2[0..j-1]需要j次插入
        }
        
        // 填充dp表
        for (int i = 1; i <= m; i++) {
            for (int j = 1; j <= n; j++) {
                if (word1.charAt(i - 1) == word2.charAt(j - 1)) {
                    dp[i][j] = dp[i - 1][j - 1];  // 如果字符相等，不需要任何操作
                } else {
                    dp[i][j] = Math.min(Math.min(dp[i - 1][j], dp[i][j - 1]), dp[i - 1][j - 1]) + 1;
                    // 三种操作：删除、插入、替换
                }
            }
        }
        
        // 最终结果是将word1完全转为word2
        return dp[m][n];
    }
}
```

## 效果

4ms

击败86.86%

## 复杂度：

- 时间复杂度：`O(m * n)`，其中 `m` 和 `n` 分别是 `word1` 和 `word2` 的长度。需要遍历整个 `dp` 数组，填充每个位置。
  
- 空间复杂度：`O(m * n)`，需要一个二维数组 `dp` 来保存所有子问题的结果。

# v4-空间优化的动态规划

在标准的动态规划解法中，我们需要一个 `m * n` 的二维数组来存储所有的子问题结果。

但是，由于动态规划中的每个状态只依赖于上一行和当前行的数据，因此可以将空间优化为一维数组，从而减少空间复杂度。

PS: 这种一般用于竞赛中，正常情况下不需要这么卷。

## 思路

动态规划表 `dp[i][j]` 的值只依赖于前一行和当前行的数据，因此可以用两个一维数组来交替存储上一行和当前行的结果，从而节省空间。

## 实现：

```java
class Solution {
    public int minDistance(String word1, String word2) {
        int m = word1.length();
        int n = word2.length();
        
        // 用两个一维数组代替二维数组
        int[] prev = new int[n + 1];
        int[] curr = new int[n + 1];
        
        // 初始化第一行
        for (int j = 0; j <= n; j++) {
            prev[j] = j;
        }
        
        // 填充动态规划表
        for (int i = 1; i <= m; i++) {
            curr[0] = i;  // 第i行的第0列，表示将word1[0..i-1]转换为空字符串，需要i次删除
            for (int j = 1; j <= n; j++) {
                if (word1.charAt(i - 1) == word2.charAt(j - 1)) {
                    curr[j] = prev[j - 1];  // 字符相等，无需操作
                } else {
                    curr[j] = Math.min(Math.min(prev[j], curr[j - 1]), prev[j - 1]) + 1;  // 三种操作的最小值
                }
            }
            // 更新prev和curr
            int[] temp = prev;
            prev = curr;
            curr = temp;
        }
        
        return prev[n];  // 返回最后的结果
    }
}
```

## 效果 

3ms

98.10%

## 复杂度

- 时间复杂度：`O(m * n)`，与原始动态规划算法相同。

- 空间复杂度：`O(n)`，只需要两个一维数组，节省了空间。

# 其他算法

## BFS（广度优先搜索）

对于一些特殊的编辑距离问题，广度优先搜索 (BFS) 也可以用来求解，尤其是当问题中涉及到多种操作（比如字典中的单词转换、多个操作等）时。BFS 可以通过逐步扩展可能的操作来找到最短路径，适用于状态图的遍历。

不过，对于单纯的插入、删除、替换操作，BFS 相比于动态规划并不常见，也不一定比 DP 更高效。BFS 在处理更复杂的编辑问题时可能更具优势，特别是当编辑操作不止插入、删除和替换时。

## A*搜索算法（适用于启发式搜索）

如果问题变得更复杂，例如目标字符串是一个大字典中的单词，并且需要用最少的操作将一个单词转化为目标字典中的某个单词时，可以使用 A* 搜索算法。

A* 使用启发式函数（例如当前词和目标词之间的差异）来引导搜索路径，通常比简单的 BFS 更高效，尤其在状态空间巨大时。

不过，A* 在本问题中的应用较少，因为它需要定义一个启发式函数，并且在大多数情况下，动态规划已经足够高效。


# 拓展

## 要求

我们把题目返回值调整一下，要求返回整个最短编辑路径的变换过程。

比如

```
输入：word1 = "horse", word2 = "ros"
输出：["horse", "rorse", "rose", "ros"]
解释：
horse -> rorse (将 'h' 替换为 'r')
rorse -> rose (删除 'r')
rose -> ros (删除 'e')
```

方法模板

```java
public List<String> minDistance(String word1, String word2) {
}
```

如何实现呢？

## 实现

整体实现的大概如下：

```java
    public List<String> minDistance(String word1, String word2) {
        int m = word1.length();
        int n = word2.length();

        // DP数组，记录最小操作数
        int[][] dp = new int[m + 1][n + 1];
        // 操作类型数组，记录操作类型："" = no-op, "insert", "delete", "replace"
        String[][] operation = new String[m + 1][n + 1];

        // 初始化
        for (int i = 0; i <= m; i++) {
            dp[i][0] = i;
            operation[i][0] = "delete";
        }
        for (int j = 0; j <= n; j++) {
            dp[0][j] = j;
            operation[0][j] = "insert";
        }

        // 填充DP表和操作类型表
        for (int i = 1; i <= m; i++) {
            for (int j = 1; j <= n; j++) {
                if (word1.charAt(i - 1) == word2.charAt(j - 1)) {
                    dp[i][j] = dp[i - 1][j - 1];
                    operation[i][j] = ""; // 字符相等，不需要操作
                } else {
                    int insert = dp[i][j - 1] + 1;
                    int delete = dp[i - 1][j] + 1;
                    int replace = dp[i - 1][j - 1] + 1;

                    // 选择最小的操作
                    dp[i][j] = Math.min(Math.min(insert, delete), replace);

                    // 记录操作类型
                    if (dp[i][j] == insert) {
                        operation[i][j] = "insert";
                    } else if (dp[i][j] == delete) {
                        operation[i][j] = "delete";
                    } else {
                        operation[i][j] = "replace";
                    }
                }
            }
        }

        // 回溯操作路径，生成变换过程
        List<String> result = new ArrayList<>();
        int i = m, j = n;
        StringBuilder currentWord = new StringBuilder(word1);

        // 回溯路径
        while (i > 0 || j > 0) {
            addNewWord(result, currentWord.toString());
            if (operation[i][j].equals("")) {
                i--;
                j--;
            } else if (operation[i][j].equals("insert")) {
                currentWord.insert(i, word2.charAt(j - 1));
                j--;
            } else if (operation[i][j].equals("delete")) {
                currentWord.deleteCharAt(i - 1);
                i--;
            } else if (operation[i][j].equals("replace")) {
                currentWord.setCharAt(i - 1, word2.charAt(j - 1));
                i--;
                j--;
            }
        }

        // 添加初始单词到变换过程
        addNewWord(result, currentWord.toString());

        // 由于回溯是从后往前的，因此需要反转结果
//        Collections.reverse(result);
        return result;
    }

    // 避免数据重复
    private void addNewWord(List<String> list, String word) {
        if(list.size() > 0 && word.equals(list.get(list.size()-1))) {
            return;
        }

        list.add(word);
    }
```


## 测试效果

horse->ros

如下：

```
[horse, hors, hos, ros]
```

# 小结

好的算法，对程序的提升是非常显著的。

以后还是要持续学习。

文中的代码为了便于大家理解，做了大量精简，感兴趣的小伙伴可以自己去看源码：

> [https://github.com/houbb/word-checker](https://github.com/houbb/word-checker/blob/master/README_ZH.md)

我是老马，期待与你的下次重逢。

# 参考资料

[edit-distance-1.html](https://nlp.stanford.edu/IR-book/html/htmledition/edit-distance-1.html)

[Peter Norvig: How to Write a Spelling Corrector.](http://norvig.com/spell-correct.html)

* any list
{:toc}