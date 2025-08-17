---
layout: post
title: leetcode 算法篇专题之动态规划 dynamic-programming 11-LC139. 单词拆分 word-break
date:  2020-6-8 15:13:08 +0800
categories: [Algorithm]
tags: [algorithm, data-struct, topics, leetcode, dynamic-programming, dp, sf]
published: true
---


# 数组

大家好，我是老马。

今天我们一起来学习一下单词拆分

# LC139. 单词拆分 word-break

给你一个字符串 s 和一个字符串列表 wordDict 作为字典。如果可以利用字典中出现的一个或多个单词拼接出 s 则返回 true。

注意：不要求字典中出现的单词全部都使用，并且字典中的单词可以重复使用。

示例 1：

输入: s = "leetcode", wordDict = ["leet", "code"]
输出: true
解释: 返回 true 因为 "leetcode" 可以由 "leet" 和 "code" 拼接成。

示例 2：

输入: s = "applepenapple", wordDict = ["apple", "pen"]
输出: true
解释: 返回 true 因为 "applepenapple" 可以由 "apple" "pen" "apple" 拼接成。
     注意，你可以重复使用字典中的单词。

示例 3：

输入: s = "catsandog", wordDict = ["cats", "dog", "sand", "and", "cat"]
输出: false
 

提示：

1 <= s.length <= 300
1 <= wordDict.length <= 1000
1 <= wordDict[i].length <= 20
s 和 wordDict[i] 仅由小写英文字母组成
wordDict 中的所有字符串 互不相同


# v1-dp 

## 和 dp 的关系

首先，这一题和 dp 的关系是什么？

已知字符串 [0,...,i] 可以被拼接，如果 [i+1,...,j] 存在，则 [0,...,j]就可以被拼接出来。

## 思路

分为5 步：

1）定义好状态

dp[i] 代表 [0,...,i] 前 i 个字符能否被完整的拼接出来。

2）状态转移方程（Transition）

```java
for i = 1..n:

    // 找到一个符合的位置即可
    for j = 0..i-1:
        if dp[j] == true && s[j..i-1] in wordDict:
            dp[i] = true
            break
```

3) 初始化（Initialization）

```java
dp[0] = true;   // 默认是支持的
```

4) 计算顺序（Order）

通常是从小到大递推，也可能需要倒序（如背包问题）。

外层循环 i = 1...n

内层循环 j = 0...i-1

5) 返回结果（Answer）

返回 dp[str.length-1]，代表位置 n-1 的能否被拼接完成

6) 优化(可选)

是否要滚动数组优化空间？

## 实现

```java
public boolean wordBreak(String s, List<String> wordDict) {
        int n = s.length();

        
        boolean[] dp = new boolean[n+1];    
        dp[0] = true;   // 空字符串

        for (int i = 1; i <= n; i++) {
            for (int j = 0; j < i; j++) {
                // 子串改为 s.substring(j, i)，i 不包含
                String text = s.substring(j, i);

                if (dp[j] && wordDict.contains(text)) {
                    dp[i] = true;
                    break;
                }
            }
        }

        return dp[n];
}
```

## 效果

9ms 击败 29.15%

## 反思

如果我们把 list 用 set 代替如何？

### 思路

set 查询复杂度 O(1)

### 实现

```java
    public boolean wordBreak(String s, List<String> wordDict) {
        int n = s.length();

        Set<String> wordSet = new HashSet<>(wordDict);    

        boolean[] dp = new boolean[n+1];    
        dp[0] = true;   // 空字符串

        for (int i = 1; i <= n; i++) {
            for (int j = 0; j < i; j++) {
                // 子串改为 s.substring(j, i)，i 不包含
                String text = s.substring(j, i);

                if (dp[j] && wordSet.contains(text)) {
                    dp[i] = true;
                    break;
                }
            }
        }

        return dp[n];
    }
```

### 效果

8ms 57.63%

区别不是特别大。


# v2-BFS

## 思路

类似 LC323 和 LC279

这种题目我们也可以用 BFS 的方式来解决。

## 核心流程

1. 队列存 起点索引，初始 `0`
2. 用 `visited` 数组记录访问过的起点，避免重复遍历
3. 每次从队列取一个起点 `start`：

   * 遍历字典单词 `word`
   * 如果 `s` 从 `start` 开始的子串等于 `word`，加入队列 `start + word.length()`
   * 如果能到达字符串末尾 → 返回 true
   * 如果超过了，快速失败

4. 队列耗尽 → 返回 false

## 实现

```java
 public boolean wordBreak(String s, List<String> wordDict) {
        int n = s.length();

        Queue<Integer> queue = new LinkedList<>();
        boolean[] visited = new boolean[n+1];
        queue.offer(0);

        while(!queue.isEmpty()) {
            // 避免重复
            Integer cur = queue.poll();
            if(visited[cur]) {
                continue;
            }
            visited[cur] = true;

            for(String dict : wordDict) {
                int end = cur + dict.length();
                if(end > n) {
                    continue;
                }

                String substrig = s.substring(cur, end);                
                if(substrig.equals(dict)) {
                    // 满足条件
                    if(end == n) {
                        return true;
                    }

                    // 入队列
                    queue.offer(end);
                }
            }
        }

        return false;
    }
```

## 效果

3ms 击败 84.71%

# 开源项目

为方便大家学习，所有相关文档和代码均已开源。

[leetcode-visual 资源可视化](https://github.com/houbb/leetcode-visual)

[leetcode 算法实现源码](https://github.com/houbb/leetcode)

[leetcode 刷题学习笔记](https://github.com/houbb/leetcode-notes)

[老马技术博客](https://houbb.github.io/)

# 小结

希望本文对你有帮助，如果有其他想法的话，也可以评论区和大家分享哦。

各位极客的点赞收藏转发，是老马持续写作的最大动力！

下一节我们将讲解力扣经典，感兴趣的小伙伴可以关注一波，精彩内容，不容错过。

* any list
{:toc}