---
layout: post
title: leetcode 72 Edit Distance 编辑距离 DP 
date:  2020-1-23 10:09:32 +0800 
categories: [Algorithm]
tags: [algorithm, leetcode, backtrack, sh]
published: true
---

# 72. Edit Distance

Given two strings word1 and word2, return the minimum number of operations required to convert word1 to word2.

You have the following three operations permitted on a word:

- Insert a character

- Delete a character

- Replace a character

Example 1:

```
Input: word1 = "horse", word2 = "ros"
Output: 3
Explanation: 
horse -> rorse (replace 'h' with 'r')
rorse -> rose (remove 'r')
rose -> ros (remove 'e')
```

Example 2:

```
Input: word1 = "intention", word2 = "execution"
Output: 5
Explanation: 
intention -> inention (remove 't')
inention -> enention (replace 'i' with 'e')
enention -> exention (replace 'n' with 'x')
exention -> exection (replace 'n' with 'c')
exection -> execution (insert 'u')
```

## Constraints:

0 <= word1.length, word2.length <= 500

word1 and word2 consist of lowercase English letters.

# V1-递归

## 思路

```
Recursive solution.

For each poisition, check three subproblem:
1. insert
2. delete
3. replace

We only modify the first string since no matter which one we choose, the result is the same. 
Got TLE since we recursively solve the same subproblem several times.
Appromixately O(len1 ^ 3) time in the worst case.
Need to optimize it using cache, which is the idea of dynamic programming. 
The key point is to find out the subproblem we have solved duplicately and cache the recursion.
Noticed that each subproblem is specificed by i and j pointer, so we can cache the result of these subproblems. 
```



通过 i, j 两个指针，去遍历处理。

（1）s1 s2 二者任意一个遍历结束。则返回另一个 s 的长度。

递归完结条件：

需要全部 insert，或者 delete。编辑距离是相同的。

（2）如果 s1[i] == s2[j]，二者相同

所以不需要做额外的处理。

i++, j++ 处理下一位

（3）如果 s1[i] != s2[j]

此时，有多重处理方式。我们选择其中最短的一种方式。

下面的每一个操作选择最小的


3.1) insert

s1 对应 i 插入一个 `*` 字符，对应的结果为递归：

插入时，s1 的指针位置不变，加入一个；s2 向后 1 位

```java
int insert = match(s1, s2, i, j+1);
```

3.2) delete

删除时，s1 的指针向后移动一位，删除 i 的元素。s2 不变

```java
int delete = match(s1, s2, i+1, j)
```

3.3) replace

替换之后，可以让当前位置相同，然后向后看 i+1, j+1

```java
int replace = match(s1, s2, i=1， j+1)
```

最后的最小编辑距离就是：

```java
min(insert, delete, replace) + 1
```

PS: 每一次操作消耗 1 次，所以需要额外加 1 

## Java 实现

```java
public class T071_EditDistance {

    /**
     * 这是一个回溯题目吗？
     *
     * 还是说其实根本不需要？
     *
     * 直接根据一个位置的变化，来处理。其实增加/删除是可以忽略的。
     *
     * （1）如果位数不同，那么我们直接通过 add/del 加一个位数，且为了保证最少，直接变化需要的即可。
     *
     * 如果保证变化的，刚好就是需要的呢？
     *
     * （2）如果位数上对应的字母不同，那么直接一次替换即可。
     *
     * 直接一次 O(n) 的遍历，统计出不同的字母即可。
     *
     * https://web.stanford.edu/class/cs124/lec/med.pdf
     *
     * @param word1 原始单词
     * @param word2 目标单词
     */
    public int minDistance(String word1, String word2) {
        if(isEmpty(word1)) {
            return word2.length();
        }
        if(isEmpty(word2)) {
            return word1.length();
        }

        return match(word1, word2, 0, 0);
    }

    /**
     * 是否匹配
     * @param s1 字符串1
     * @param s2 字符串2
     * @param i s1 指针
     * @param j s2 指针
     * @return 结果
     */
    private int match(String s1, String s2, int i, int j) {
        //如果其中一个字符串到达终点
        if(s1.length() == i) {
            return s2.length() - j;
        }
        if(s2.length() == j) {
            return s1.length() - i;
        }

        // 匹配
        int res;
        if(s1.charAt(i) == s2.charAt(j)) {
            res = match(s1, s2, i+1, j+1);
        } else {
            // 3 种转换种最小的
            int insert = match(s1, s2, i, j+1);

            int delete = match(s1, s2, i+1, j);

            int replace = match(s1, s2, i+1, j+1);

            // 选择三种操作中最小的一个
            res = min(insert, delete, replace) + 1;
        }

        return res;
    }

    /**
     * 返回最小的数字
     * @param nums 数字
     * @return 结果
     */
    private static int min(int ... nums) {
        int min = nums[0];

        for(int i = 1; i < nums.length; i++) {
            if(min > nums[i]) {
                min = nums[i];
            }
        }
        return min;
    }

    private static boolean isEmpty(String word) {
        return word == null || word.length() <= 0;
    }

}
```

这种算法在字符串较长时，会 GG。

TEL 在 24 / 1146 


# V2-递归 + 内存化

我们引入 mem 缓存对应的长度。其他流程不变，其实不难。

```java
public class T071_EditDistanceV2 {

    /**
     * 引入 mem[][] 提升性能
     *
     * @param word1 原始单词
     * @param word2 目标单词
     */
    public int minDistance(String word1, String word2) {
        int[][] mem = new int[word1.length()+1][word2.length()+1];
        return match(word1, word2, 0, 0, mem);
    }

    /**
     * 是否匹配
     * @param s1 字符串1
     * @param s2 字符串2
     * @param i s1 指针
     * @param j s2 指针
     * @param mem 缓存
     * @return 结果
     */
    private int match(String s1, String s2, int i, int j,
                      int[][] mem) {
        // 命中缓存
        if(mem[i][j] > 0) {
            return mem[i][j];
        }


        int res;
        //如果其中一个字符串到达终点
        if(s1.length() == i) {
            res = s2.length() - j;
        } else if(s2.length() == j) {
            res = s1.length() - i;
        } else {
            // 匹配
            if(s1.charAt(i) == s2.charAt(j)) {
                res = match(s1, s2, i+1, j+1, mem);
            } else {
                // 3 种转换种最小的
                int insert = match(s1, s2, i, j+1, mem);

                int delete = match(s1, s2, i+1, j, mem);

                int replace = match(s1, s2, i+1, j+1, mem);

                // 选择三种操作中最小的一个
                res = min(insert, delete, replace) + 1;
            }
        }

        // 缓存数据
        mem[i][j] = res;
        return res;
    }

    /**
     * 返回最小的数字
     * @param nums 数字
     * @return 结果
     */
    private static int min(int ... nums) {
        int min = nums[0];

        for(int i = 1; i < nums.length; i++) {
            if(min > nums[i]) {
                min = nums[i];
            }
        }
        return min;
    }

}
```

PS: 发现用例里面不判断 string 是否为空，也是可以的，就移除了。

性能 4ms, 超越 94%。提升非常之大。

# V3-DP

我们如果想把上面的改成 dp，就是要把递归去掉，改成遍历，并且找到递推公式。

## 思路

1) DP 初始化

我们可以定义一个 dp[][] 数字

```java
int dp[][] = new int[s1.length+1][s2.length+1];
```

dp 存放的是 s1, s2 在 i,j 位置时，对应的编辑距离。

初始化，如果 i 和 j 其中一个为 0, 则另一个编辑距离是可以知道的，就是对应的 j 对应的长度。

PS: 全部通过 insert/delete 才能匹配。

```java
for(int i = 0; i <= s1.length; i++) {
    dp[i][0] = i;
}

for(int j = 0; j <= s2.length; j++) {
    dp[0][j] = j;
}
```

2）把递归变成遍历

移除递归，我们就用最简单的双层遍历。

```java
for(int i = 0; i < s1.length; i++) {
    for(int j = 0; j < s2.length; j++) {
         // 处理逻辑
        if(s1[i] == s2[j]) {
            // 相同，和上一个相同。不要额外操作
            dp[i+1][j+1] = dp[i][j];    
        } else {
            // 对应 3 种变换
            dp[i+1][j+1] = min(dp[i+1][j], dp[i][j+1], dp[i][j]) + 1;
        }
    }
}
```

3) 结果

最后的结果，就放在 `dp[s1.length][s2.length]` 中

## java 实现

```java
public class T071_EditDistanceV3 {

    /**
     * 引入 mem[][] 提升性能
     *
     * @param word1 原始单词
     * @param word2 目标单词
     */
    public int minDistance(String word1, String word2) {
        // 初始化 dp
        int[][] dp = new int[word1.length()+1][word2.length()+1];
        for(int i = 0; i <= word1.length(); i++) {
            dp[i][0] = i;
        }
        for(int j = 0; j <= word2.length(); j++) {
            dp[0][j] = j;
        }

        // 遍历
        for(int i = 0; i < word1.length(); i++) {
            for(int j = 0; j < word2.length(); j++) {
                if(word1.charAt(i) == word2.charAt(j)) {
                    dp[i+1][j+1] = dp[i][j];
                } else {
                    dp[i+1][j+1] = min(dp[i+1][j], dp[i][j+1], dp[i][j]) + 1;
                }
            }
        }

        // 结果
        return dp[word1.length()][word2.length()];
    }

    /**
     * 返回最小的数字
     * @param nums 数字
     * @return 结果
     */
    private static int min(int ... nums) {
        int min = nums[0];

        for(int i = 1; i < nums.length; i++) {
            if(min > nums[i]) {
                min = nums[i];
            }
        }
        return min;
    }

}
```

这个耗时 8ms, 超过 60%。性能反而下降了。

# 参考资料

https://leetcode.com/problems/edit-distance/description/

https://en.wikipedia.org/wiki/Levenshtein_distance

https://web.stanford.edu/class/cs124/lec/med.pdf

* any list
{:toc}