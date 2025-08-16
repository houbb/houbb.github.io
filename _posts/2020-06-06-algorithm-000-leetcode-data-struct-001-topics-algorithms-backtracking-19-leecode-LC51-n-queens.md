---
layout: post
title: leetcode 算法篇专题之回溯 Backtracking 02-LC51. N 皇后 n-queens
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

# LC51. N 皇后 n-queens

按照国际象棋的规则，皇后可以攻击与之处在同一行或同一列或同一斜线上的棋子。

n 皇后问题 研究的是如何将 n 个皇后放置在 n×n 的棋盘上，并且使皇后彼此之间不能相互攻击。

给你一个整数 n ，返回所有不同的 n 皇后问题 的解决方案。

每一种解法包含一个不同的 n 皇后问题 的棋子放置方案，该方案中 'Q' 和 '.' 分别代表了皇后和空位。

 

示例 1：

![1](https://assets.leetcode.com/uploads/2020/11/13/queens.jpg)

输入：n = 4
输出：[[".Q..","...Q","Q...","..Q."],["..Q.","Q...","...Q",".Q.."]]
解释：如上图所示，4 皇后问题存在两个不同的解法。

示例 2：

输入：n = 1
输出：[["Q"]]
 

提示：

1 <= n <= 9

# v1-回溯

## 思路

每放置一个棋子之后，判断对应的行、列、斜是否满足。


## 实现

```java
public List<List<String>> solveNQueens(int n) {
        int[][] board = new int[n][n];

        //n 个位置
        List<List<String>> res = new ArrayList<>();
        List<String> path = new ArrayList<>();

        // 全部的开始位置
        for(int i = 0; i < n; i++) {
            // 每一列
            backtrack(board, res, path, 0, i, n);
        }
        

        return res;
    }


    //Q 0 #
    private void backtrack(int[][] board, List<List<String>> res, List<String> path, int x, int y, int n) {
        if(x < 0 || y < 0 || x >= n || y >= n || board[x][y] == 1) {
            return;
        }

        if(!isValid(board, x, y)) {
            return;
        }

        // 加入信息
        board[x][y] = 1;
        String line = getLine(board, x);
        path.add(line);

         // 放入元素，才判断是否满足
        if(path.size() == n) {
            res.add(new ArrayList<>(path));

            // 回溯
            path.remove(path.size()-1);
            board[x][y] = 0;
            
            return;
        }


        // 我们只能在下一行来判断
        for(int i = 0; i < n; i++) {
            backtrack(board, res, path, x+1, i, n);
        }

        path.remove(path.size()-1);
        board[x][y] = 0;
    }

    private String getLine(int[][] board, int curRow) {
        StringBuilder buffer = new StringBuilder();
        int[] chars = board[curRow];
        for(int c : chars) {
            if(c == 1) {
                buffer.append('Q');    
            } else {
                buffer.append('.');    
            }
        }

        return buffer.toString();
    }

    private boolean isValid(int[][] board, int x, int y) {
        int n = board.length;

        // 当前行
        // 当前列
        // 当前斜线
        for(int i = 0; i < n; i++) {
            if(board[x][i] == 1) {
                return false;
            }
            if(board[i][y] == 1) {
                return false;
            }              
        }

        // 斜线？
        for(int i = 0; i < n; i++) {
            for(int j = 0; j < n; j++) {
                // 在左上-右下斜线上
                if (x - y == i - j) {
                    if(board[i][j] == 1) {
                        return false;
                    }
                }  


                if (x + y == i + j) {
                    // 在右上-左下斜线上
                    if(board[i][j] == 1) {
                        return false;
                    }
                }
            }
        }
        

        return true;
    }
```

## 效果

6ms 击败 18.16%


## 写法优化1

我们在写 

```java
 // 放入元素，才判断是否满足
if(path.size() == n) {
    res.add(new ArrayList<>(path));
    // 回溯
    path.remove(path.size()-1);
    board[x][y] = 0;
    
    return;
}
```

还需要回溯，是因为我们后面的回溯对棋盘本身产生了影响，上一层会影响下一层。

如果不回溯（`path.remove 和 board[x][y] = 0`），递归返回上一层时，上一行的棋子仍然在 board 和 path 中。

那么继续尝试其他列就会导致 board 上有多余的 1，检查 isValid 时会失败。

换句话说，不回溯会污染下一轮尝试。

这很不清爽，我们改为统一回溯的方式：

```java
private void backtrack(int[][] board, List<List<String>> res, List<String> path, int x, int y, int n) {
        if(x < 0 || y < 0 || x >= n || y >= n || board[x][y] == 1) {
            return;
        }

        if(!isValid(board, x, y)) {
            return;
        }

        // 加入信息
        board[x][y] = 1;
        String line = getLine(board, x);
        path.add(line);

         // 放入元素，才判断是否满足
        if(path.size() == n) {
            res.add(new ArrayList<>(path));
        } else {
            // 我们只能在下一行来判断
            for(int i = 0; i < n; i++) {
                backtrack(board, res, path, x+1, i, n);
            }
        }

        // 统一回溯
        path.remove(path.size()-1);
        board[x][y] = 0;
    }
```

# v2-性能优化

## 思路

我们主要

1）慢在 isValid 对角线太慢了。

2）结果棋盘的输出，可以提前用 char 数组，直接构建。

## 实现

```java
class Solution {
    public List<List<String>> solveNQueens(int n) {
        char[][] board = new char[n][n];
        for(int i = 0; i < n; i++) {
            for(int j = 0; j < n; j++) {
                board[i][j] = '.';
            }
        }

        //n 个位置
        List<List<String>> res = new ArrayList<>();
        List<String> path = new ArrayList<>();

        // 全部的开始位置
        for(int i = 0; i < n; i++) {
            // 每一列
            backtrack(board, res, path, 0, i, n);
        }
        
        return res;
    }


    //Q 0 #
    private void backtrack(char[][] board, List<List<String>> res, List<String> path, int x, int y, int n) {
        if(x < 0 || y < 0 || x >= n || y >= n || board[x][y] == 'Q') {
            return;
        }

        if(!isValid(board, x, y)) {
            return;
        }

        // 加入信息
        board[x][y] = 'Q';
        String line = getLine(board, x);
        path.add(line);

         // 放入元素，才判断是否满足
        if(path.size() == n) {
            res.add(new ArrayList<>(path));
        } else {
            // 我们只能在下一行来判断
            for(int i = 0; i < n; i++) {
                backtrack(board, res, path, x+1, i, n);
            }
        }

        // 统一回溯
        path.remove(path.size()-1);
        board[x][y] = '.';
    }

    private String getLine(char[][] board, int curRow) {
        return new String(board[curRow]);
    }

   private boolean isValid(char[][] board, int x, int y) {
        int n = board.length;

        // 检查列
        for (int i = 0; i < x; i++) {
            if (board[i][y] == 'Q') return false;
        }

        // 检查左上对角线
        for (int i = x - 1, j = y - 1; i >= 0 && j >= 0; i--, j--) {
            if (board[i][j] == 'Q') return false;
        }

        // 检查右上对角线
        for (int i = x - 1, j = y + 1; i >= 0 && j < n; i--, j++) {
            if (board[i][j] == 'Q') return false;
        }

        return true;
    }
}
```

## 效果

3ms 击败 49.87%

## 反思

还能更快吗？


# v3-isValid 的进一步优化

## 思路

我们借助辅助数组，可以把检查耗时优化到 O(1)

```java
private boolean[] col;
private boolean[] diag1;
private boolean[] diag2;
```

## 实现

```java
class Solution {
    private List<List<String>> res = new ArrayList<>();
    private boolean[] col;
    private boolean[] diag1;
    private boolean[] diag2;

    public List<List<String>> solveNQueens(int n) {
        char[][] board = new char[n][n];
        for (char[] row : board) Arrays.fill(row, '.');

        col = new boolean[n];
        diag1 = new boolean[2 * n - 1];
        diag2 = new boolean[2 * n - 1];

        backtrack(board, 0);

        return res;
    }

    private void backtrack(char[][] board, int x) {
        int n = board.length;
        if (x == n) {
            res.add(construct(board));
            return;
        }

        for (int y = 0; y < n; y++) {
            if (isValid(x, y, n)) {
                board[x][y] = 'Q';
                col[y] = diag1[x - y + n - 1] = diag2[x + y] = true;

                backtrack(board, x + 1);

                board[x][y] = '.';
                col[y] = diag1[x - y + n - 1] = diag2[x + y] = false;
            }
        }
    }

    // O(1) 检查
    private boolean isValid(int x, int y, int n) {
        return !col[y] && !diag1[x - y + n - 1] && !diag2[x + y];
    }

    private List<String> construct(char[][] board) {
        List<String> path = new ArrayList<>();
        for (char[] row : board) path.add(new String(row));
        return path;
    }
}
```

* any list
{:toc}