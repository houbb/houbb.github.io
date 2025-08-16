---
layout: post
title: leetcode 算法篇专题之回溯 Backtracking 02-LC79 单词搜索 word-search 
date:  2020-6-8 15:13:08 +0800
categories: [Algorithm]
tags: [algorithm, data-struct, topics, leetcode, backtracking, sf]
published: true
---


# 数组

大家好，我是老马。

今天我们一起来学习一下数组这种数据结构。

## 主要知识

数组需要拆分下面几个部分：

1. 理论介绍

2. 源码分析

3. 数据结构实现？

4. 题目练习（按照算法思想分类）

5. 梳理对应的 sdk 包

6. 应用实战

因为这个是 leetcode 系列，所以重点是 4、5(对4再一次总结)。

为了照顾没有基础的小伙伴，会简单介绍一下1的基础理论。

简单介绍1，重点为4。其他不是本系列的重点。

# LC79 单词搜索 word-search 

给定一个 m x n 二维字符网格 board 和一个字符串单词 word 。如果 word 存在于网格中，返回 true ；否则，返回 false 。

单词必须按照字母顺序，通过相邻的单元格内的字母构成，其中“相邻”单元格是那些水平相邻或垂直相邻的单元格。

同一个单元格内的字母不允许被重复使用。

示例 1：

![1](https://assets.leetcode.com/uploads/2020/11/04/word2.jpg)

输入：board = [["A","B","C","E"],["S","F","C","S"],["A","D","E","E"]], word = "ABCCED"
输出：true

示例 2：

![2](https://assets.leetcode.com/uploads/2020/11/04/word2.jpg)

输入：board = [["A","B","C","E"],["S","F","C","S"],["A","D","E","E"]], word = "SEE"
输出：true

示例 3：

![3](https://assets.leetcode.com/uploads/2020/10/15/word3.jpg)

输入：board = [["A","B","C","E"],["S","F","C","S"],["A","D","E","E"]], word = "ABCB"
输出：false
 

提示：

m == board.length
n = board[i].length
1 <= m, n <= 6
1 <= word.length <= 15
board 和 word 仅由大小写英文字母组成
 
进阶：你可以使用搜索剪枝的技术来优化解决方案，使其在 board 更大的情况下可以更快解决问题？

# v1-回溯

## 思路

我们可以非常粗暴的，从任何一个位置开始，全组合。

但是这个组合是有一定的限制的，只能连续的位置？

循环的位置：`x,y` 作为开始的位置？

1）visied[x][y] 记录一个位置是否被访问，或者改写 `board[][]='#'`

2）从 x,y 进行下一步的时候，实际上是从 [{1,0}, {-1, 0}, {0,1}, {0,-1}] 4个方向中进一步选择。注意判断好边界

3）终止条件 `x < 0 || y < 0 || x >= m || y >= n`

4) 是否满足条件

如果长度达到目标 word，终止加入 set

5）简单剪枝：可用一个全局的 flag 标识，如果满足，则后面直接可以终止。

## 实现

```java
    private int[][] dirs = new int[][]{
        {1,0}, {-1, 0}, {0,1}, {0,-1}}
    ;

    public boolean exist(char[][] board, String word) {
        char firstChar = word.charAt(0);

        for(int i = 0; i < board.length; i++) {
            for(int j = 0; j < board[0].length; j++) {
                if(board[i][j] == firstChar) {
                    // 从这里开始回溯    
                    Set<String> set = new HashSet<>();
                    StringBuilder path = new StringBuilder();
                    backtrack(board, word, set, path, i, j);
                    if(set.contains(word)) {
                        return true;                            
                    }
                }
            }
        }

        return false;
    }


    private void backtrack(char[][] board, String word, Set<String> set, StringBuilder path, int x, int y) {
        int m = board.length;
        int n = board[0].length;
        if(x < 0 || y < 0 || x >= m || y >= n || board[x][y] == '#') {
            return;
        }

        if(path.length() == word.length()) {
            set.add(path.toString());
            return;
        }

        // 是否已经访问过
        char c = board[x][y];

        // 每次都是4种可能
        for(int i = 0; i < dirs.length; i++) {
            path.append(c);
            board[x][y] = '#';  // 也可以用访问数组替代

            int[] dir = dirs[i];
            backtrack(board, word, set, path, x+dir[0], y+dir[1]);

            // 撤销
            board[x][y] = c;
            path.deleteCharAt(path.length()-1);
        }    
    }
```

## 效果

解答错误 66 / 88 个通过的测试用例

输入

```
board =[["a"]]
word ="a"
```
输出 false
预期结果 true

why?

## 修正

```java
   private void backtrack(char[][] board, String word, Set<String> set, StringBuilder path, int x, int y) {
            int m = board.length;
            int n = board[0].length;

            // 越界和访问检查
            if(x < 0 || y < 0 || x >= m || y >= n || board[x][y] == '#') {
                return;
            }

            // 先 append 当前字符
            path.append(board[x][y]);

            // 如果长度达到 word，检查是否匹配
            if(path.length() == word.length()) {
                if(path.toString().equals(word)) {
                    set.add(path.toString());
                }
                path.deleteCharAt(path.length() - 1); // 回溯
                return;
            }

            // 标记访问
            char tmp = board[x][y];
            board[x][y] = '#';

            // 四个方向递归
            for(int i = 0; i < dirs.length; i++) {
                int[] dir = dirs[i];
                backtrack(board, word, set, path, x + dir[0], y + dir[1]);
            }

            // 撤销
            board[x][y] = tmp;
            path.deleteCharAt(path.length() - 1);
        }
```


## 效果

817ms 击败 5.02%

## 反思

为什么这么慢？


# v2-剪枝1

## 思路


因为我们并不是求全路径，其实只要符合，直接 return 即可。

同时最好是每次下一个字符都是我们需要的才遍历。

## 实现

```java
class Solution {

    private int[][] dirs = new int[][]{
        {1,0}, {-1, 0}, {0,1}, {0,-1}}
    ;

    public boolean exist(char[][] board, String word) {
        char firstChar = word.charAt(0);

        for(int i = 0; i < board.length; i++) {
            for(int j = 0; j < board[0].length; j++) {
                if(board[i][j] == firstChar) {
                    boolean flag = backtrack(board, word, i, j, 0);
                    if(flag) {
                        return true;                            
                    }
                }
            }
        }

        return false;
    }

    private boolean backtrack(char[][] board, String word, int x, int y, int index) {
            int m = board.length;
            int n = board[0].length;

            // 越界和访问检查
            if(x < 0 || y < 0 || x >= m || y >= n || board[x][y] == '#' || board[x][y] != word.charAt(index)) {
                return false;
            }

            // 如果长度达到 word，检查是否匹配
            if(index == word.length()-1) {
                return true;
            }

            // 标记访问
            char tmp = board[x][y];
            board[x][y] = '#';

            // 四个方向递归
            // 4 个方向找到一个就行
            boolean foundFlag = false;
            for(int[] dir : dirs) {
                foundFlag = backtrack(board, word, x + dir[0], y + dir[1], index+1);
                if(foundFlag) {
                    break;
                }
            }

            // 撤销
            board[x][y] = tmp;

            return foundFlag;
        }

}
```

## 效果

200ms 击败 25.48%

## 反思

有点进步，但是还是不够。

# v3-剪枝2

## 思路

其实上面的解法已经是标准解法了。

当然，我们可以做一些剪枝。

### 1、字符数量

在开始回溯前，可以先统计 board 中每个字符的数量，统计 word 中各字符的数量

如果 word 中某个字符数量 > board 中该字符数量 → 直接返回 false

## 实现

```java
        int[] boardCount = new int[128];
        for (char[] row : board) {
            for (char c : row) boardCount[c - 'A']++;
        }
        int[] wordCount = new int[128];
        for (char c : word.toCharArray()) wordCount[c - 'A']++;
        for (int i = 0; i < 26; i++) {
            if (wordCount[i] > boardCount[i]) return false;
        }
```

## 效果

102ms 击败 90.84%




* any list
{:toc}