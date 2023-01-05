---
layout: post
title: leetcode 131 Palindrome Partitioning 动态规划/回溯  DP/backtrack 
date:  2020-1-23 10:09:32 +0800 
categories: [Algorithm]
tags: [algorithm, leetcode, dp, backtrack, sh]
published: true
---

# 题目 131

## 描述

Given a string s, partition s such that every  substring of the partition is a  palindrome. 

Return all possible palindrome partitioning of s.

Example 1:

```
Input: s = "aab"
Output: [["a","a","b"],["aa","b"]]
```

Example 2:

```
Input: s = "a"
Output: [["a"]]
```


Constraints:

1 <= s.length <= 16

s contains only lowercase English letters.

# 思路

首先是否为回文，这个题目，以前应该是也是有的。

## 拓展阅读

> [009-palindrome-number](https://github.com/houbb/leetcode/blob/master/doc/001-100/009-palindrome-number.md)

> [125-valid-palindrome](https://github.com/houbb/leetcode/blob/master/doc/101-200/125-valid-palindrome.md)


## 核心解法

这一个问题的解法分为两个步骤：

（1）判断字符串是否为回文

最常见的思路，就是采用双指针法。

一个从前往后，一个从后往前，同时移动。

每次都相同，直到最后的 pointer 指针位置重合。

（2）把所有的回文子字符串都要找出来

这个一般使用回溯的方式实现。

# java 实现

## V1 基于回溯

第一个版本，最直观的思路。

```java
    public List<List<String>> partition(String s) {
        List<List<String>> results = new ArrayList<>();
        backtrack(results, new ArrayList<>(), s, 0);
        return results;
    }

    private void backtrack(List<List<String>> results, List<String> tempList,
                           String s, int startIndex) {
        // 终止的条件
        // 元素的長度等於 s
        if(startIndex == s.length()) {
            results.add(new ArrayList<>(tempList));
        } else {
            // 如何进行回溯处理呢？
            for(int i = 1; i <= s.length()-startIndex; i++) {
                int endIndex = startIndex + i;
                String subString = s.substring(startIndex, endIndex);

                if(isPalindrome(subString)) {
                    tempList.add(subString);
                    // 执行具体的逻辑
                    backtrack(results, tempList, s, endIndex);

                    // 回溯
                    tempList.remove(tempList.size()-1);
                }
            }
        }
    }


    private boolean isPalindrome(String s) {
        if(s.length() == 1) {
            return true;
        }

        char[] chars = s.toCharArray();
        int low = 0;
        int high = chars.length-1;
        while (low < high) {
            if(chars[low] != chars[high] ) {
                return false;
            }

            low++;
            high--;
        }

        return true;
    }
```

这个算法的性能：

速度 41%

内存 27%


## V2-引入 DP 优化性能

DP 的解法，本身自己并没有意识到。

但是在做后面的 132 题的时候，直接 GG 了。

所以此处我们先一起思考下性能的优化。

主要参考 [java-dp-dfs-solution](https://leetcode.com/problems/palindrome-partitioning/solutions/41982/java-dp-dfs-solution/)，思考过程如下：

### DP 的思路

```
The normal dfs backtracking will need to check each substring for palindrome, but a dp array can be used to record the possible break for palindrome before we start recursion.

Edit:
Sharing my thought process:
first, I ask myself that how to check if a string is palindrome or not, usually a two point solution scanning from front and back. Here if you want to get all the possible palindrome partition, first a nested for loop to get every possible partitions for a string, then a scanning for all the partitions. That's a O(n^2) for partition and O(n^2) for the scanning of string, totaling at O(n^4) just for the partition. However, if we use a 2d array to keep track of any string we have scanned so far, with an addition pair, we can determine whether it's palindrome or not by justing looking at that pair, which is this line if(s.charAt(i) == s.charAt(j) && (i - j <= 2 || dp[j+1][i-1])). This way, the 2d array dp contains the possible palindrome partition among all.

second, based on the prescanned palindrome partitions saved in dp array, a simple backtrack does the job.
```

正常的 dfs 回溯需要检查每个子串是否有回文，但是在我们开始递归之前可以使用 dp 数组记录回文可能的中断。

分享我的思考过程：

首先，我问自己如何检查一个字符串是否是回文，通常是前后扫描的两点解决方案。 

这里如果你想获得所有可能的回文分区，首先是一个嵌套的for循环来获取一个字符串的每个可能的分区，然后扫描所有的分区。 

这是分区的 O(n^2) 和字符串扫描的 O(n^2)，总计仅分区的 O(n^4)。 

然而，如果我们使用一个二维数组来跟踪我们到目前为止扫描过的任何字符串，加上一对，我们可以通过查看那对来确定它是否是回文，也就是这一行 `if(s.charAt( i) == s.charAt(j) && (i - j <= 2 || dp[j+1][i-1]))`.

这样，二维数组 dp 包含所有可能的回文分区。

其次，基于保存在 dp 数组中的预扫描回文分区，一个简单的回溯就可以完成这项工作。

这么思考的好处就是我们可以**复用已经计算过的部分**。

### 自己回文的理解

最核心的一句话是 `if(s.charAt( i) == s.charAt(j) && (i - j <= 2 || dp[j+1][i-1]))`

满足 `s.charAt( i) == s.charAt(j)`，后面的刚好对应 2 个场景

（1）场景 1

`i - j <= 2` 意味着两个字符的位置差为 0 1 2 

差距为2，中间有一个，对称 I_X_J

差距为1，二者相邻，对称：I_J

差距为0，二者重合。

（2）场景 2

以字符串 `abba` 为例。

我们可以把 i/j 理解为两个指针，如果 i-j 中间的字符串对应的内容。

如果 i' = 1, j' = 2，对应的字符串为 `bb` 是回文。

我们往外两边一个字符，i=0,i=3 的时候，两个字符 `a` 相等。那么 i-j 对应的字符串 `abba` 也是回文。

### java 实现

```java
    /**
     * 思路：通过 backtrack 本身并没有问题。
     *
     * 但是性能这一块其实可以通过 dp 优化，通过内存记录上一次的数据，然后减少计算。
     * @param s 字符串
     * @return 结果
     */
    public List<List<String>> partition(String s) {
        List<List<String>> results = new ArrayList<>();

        // 初始化 dp 数组
        boolean[][] dp = new boolean[s.length()][s.length()];
        // 初始化
        for(int i = 0; i < s.length(); i++) {
            for(int j = 0; j <= i; j++) {
                if(s.charAt(i) == s.charAt(j) && (i - j <= 2 || dp[j+1][i-1])) {
                    dp[j][i] = true;
                }
            }
        }

        backtrack(dp, results, new ArrayList<>(), s, 0);
        return results;
    }

    private void backtrack(boolean[][] dp,
                           List<List<String>> results,
                           List<String> tempList,
                           String s,
                           int startIndex) {
        // 终止的条件
        // 元素的長度等於 s
        if(startIndex == s.length()) {
            results.add(new ArrayList<>(tempList));
        } else {
            // 判断就会变得相对简单

            for(int i = startIndex; i < s.length(); i++) {
                // 是，则说明为回文
                if(dp[startIndex][i]) {
                    tempList.add(s.substring(startIndex, i+1));

                    // 执行具体的逻辑
                    backtrack(dp, results, tempList, s, i+1);

                    // 回溯
                    tempList.remove(tempList.size()-1);
                }
            }
        }
    }
```

这种算法的性能略有提升。但是不多。

## V3-性能还能优化吗？

看了一下最高速度的提交，发现一个问题。

```java
// 是，则说明为回文
if(dp[startIndex][i]) {
    tempList.add(s.substring(startIndex, i+1));
    
    //....
}
```

我们通过 dp 很快判断出是否为回文，但是每次放入 tempList 的时候，都需要做一次 subString。

那么，如果我们提前把数据使用 String[][] 保存好，会怎么样呢？

这个是空间换时间，提升到 70% 左右。

```java
    /**
     * 思路：通过 backtrack 本身并没有问题。
     *
     * 但是性能这一块其实可以通过 dp 优化，通过内存记录上一次的数据，然后减少计算。
     * @param s 字符串
     * @return 结果
     */
    public List<List<String>> partition(String s) {
        List<List<String>> results = new ArrayList<>();

        // 初始化 dp 数组
        boolean[][] dp = new boolean[s.length()][s.length()];
        String[][] mem = new String[s.length()+1][s.length()+1];

        // 初始化
        for(int i = 0; i < s.length(); i++) {
            for(int j = 0; j <= i; j++) {
                if(s.charAt(i) == s.charAt(j) && (i - j <= 2 || dp[j+1][i-1])) {
                    dp[j][i] = true;

                    // 提前存储字符串
                    mem[j][i] = s.substring(j, i+1);
                }
            }
        }

        backtrack(mem, results, new ArrayList<>(), s, 0);
        return results;
    }

    private void backtrack(String[][] mem,
                           List<List<String>> results,
                           List<String> tempList,
                           String s,
                           int startIndex) {
        // 终止的条件
        // 元素的長度等於 s
        if(startIndex == s.length()) {
            results.add(new ArrayList<>(tempList));
        } else {
            // 判断就会变得相对简单

            for(int i = startIndex; i < s.length(); i++) {
                // 是，则说明为回文
                String subString = mem[startIndex][i];
                if(subString != null) {
                    tempList.add(subString);

                    // 执行具体的逻辑
                    backtrack(mem, results, tempList, s, i+1);

                    // 回溯
                    tempList.remove(tempList.size()-1);
                }
            }
        }
    }
```


# 132. Palindrome Partitioning II

## 描述

Given a string s, partition s such that every  substring of the partition is a  palindrome.

Return the minimum cuts needed for a palindrome partitioning of s.
 
### EX

Example 1:

```
Input: s = "aab"
Output: 1
Explanation: The palindrome partitioning ["aa","b"] could be produced using 1 cut.
```

Example 2:

```
Input: s = "a"
Output: 0
```

Example 3:

```
Input: s = "ab"
Output: 1
```

### Constraints:

1 <= s.length <= 2000

s consists of lowercase English letters only.

## 思路

首先是最朴素的想法。

直接采用 131 的实现方法，得到所有的结果。然后找到长度最小的一个 list，那么最后的结果，就是 list.size()-1

一点优化：因为只需要返回最小需要切割几次，所以我们只需要定义一个变量，如果 backtrack 过程中发现有结果集的长度较大，直接剪枝。

## V1-基础实现

```java
    /**
     * 最小砍几刀
     */
    private int minCut = Integer.MAX_VALUE;

    /**
     * 整体思路：
     *
     * 1. 和原来划分的算法保持一致
     *
     * 2. 不过添加一个全局变量，保持 min，然后进行剪枝、
     *
     * @param s
     * @return
     */
    public int minCut(String s) {
        // 本身就是，则直接返回0
        if(isPalindrome(s)) {
            return 0;
        }
        
        // 初始化为最大长度-1
        minCut = s.length() - 1;

        List<List<String>> results = new ArrayList<>();
        backtrack(results, new ArrayList<>(), s, 0);

        // 最多是长度-1
        // 全部不同，然后拆分

        return minCut;
    }

    private void backtrack(List<List<String>> results,
                           List<String> tempList,
                           String s, int startIndex) {

        // 剪枝
        if(tempList.size() > minCut) {
            return;
        }


        // 终止的条件
        // 元素的長度等於 s
        if(startIndex == s.length()) {
            results.add(new ArrayList<>(tempList));

            // 更新最小值
            int curTime = results.get(results.size()-1).size()  -1;
            if(curTime < minCut) {
                minCut = curTime;
            }
        } else {
            // 如何进行回溯处理呢？
            for(int i = 1; i <= s.length()-startIndex; i++) {
                int endIndex = startIndex + i;
                String subString = s.substring(startIndex, endIndex);

                if(isPalindrome(subString)) {
                    tempList.add(subString);
                    // 执行具体的逻辑
                    backtrack(results, tempList, s, endIndex);

                    // 回溯
                    tempList.remove(tempList.size()-1);
                }
            }
        }
    }


    private boolean isPalindrome(String s) {
        if(s.length() == 1) {
            return true;
        }

        char[] chars = s.toCharArray();
        int low = 0;
        int high = chars.length-1;
        while (low < high) {
            if(chars[low] != chars[high] ) {
                return false;
            }

            low++;
            high--;
        }

        return true;
    }
```


当然了，如果当字符串较长时，直接超时。

## V2-DP 提升性能

这里就要采取 131 题目中的 DP 思想。

### 思路

This can be solved by two points:

```
1. cut[i] is the minimum of cut[j - 1] + 1 (j <= i), if [j, i] is palindrome.

2. If [j, i] is palindrome, [j + 1, i - 1] is palindrome, and c[j] == c[i].
```

The 2nd point reminds us of using dp (caching).

第2点，对于回文的判断，和上面一样，不再赘述。

第1点，最小的切的次数到底如何计算？其实也是递归，这一次比上一次的最小多1。最多就是每一次都切。

```
a   b   a   |   c  c
                j  i
       j-1  |  [j, i] is palindrome
   cut(j-1) +  1
```

### java 实现

```java
    /**
     * DP思想：
     *
     *
     * 1. 关于回文的判断，可以使用 dp
     * 2. 关于最小次数，也可以使用 dp 递归。
     *
     * 这是一道 dp 应用比较巧妙的一道题。
     *
     * @param s 字符串
     * @return 结果
     */
    public int minCut(String s) {
        // 最小砍几刀
        int[] minCuts = new int[s.length()];

        // 初始化 dp 数组
        boolean[][] dp = new boolean[s.length()][s.length()];
        // 初始化
        for(int i = 0; i < s.length(); i++) {
            // 最多就是和 i 一样，每个元素都拆分开。
            int min = i;

            // 回文判断
            for(int j = 0; j <= i; j++) {
                if(s.charAt(i) == s.charAt(j) && (i - j <= 2 || dp[j+1][i-1])) {
                    dp[j][i] = true;

                    // 如果 j 是 0，此时不需要切分。初始化的默认值
                    if(j == 0) {
                        min = 0;
                    } else {
                        // 最多切法，或者上一次最小的+1
                        min = Math.min(min, minCuts[j-1] + 1);
                    }
                }
            }

            // 更新
            minCuts[i] = min;
        }

        // 最后的值就是结果
        return minCuts[s.length()-1];
    }
```

性能方面还凑合，超过 66% 。


# 参考资料

https://leetcode.com/problems/palindrome-partitioning-ii/solutions/42214/java-o-n-2-dp-solution/

https://leetcode.com/problems/palindrome-partitioning/description/

https://leetcode.com/problems/palindrome-partitioning/solutions/41982/java-dp-dfs-solution/

https://leetcode.com/problems/palindrome-partitioning-ii/solutions/42213/easiest-java-dp-solution-97-36/

* any list
{:toc}