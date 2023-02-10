---
layout: post
title:  【leetcode】019-36. 有效的数独 Valid Sudoku + 37. 解数独 sudoku solver
date:  2020-6-8 15:13:08 +0800
categories: [Algorithm]
tags: [algorithm, leetcode]
published: true
---

# 36. 有效的数独 Valid Sudoku

## 题目

请你判断一个 9 x 9 的数独是否有效。

只需要 根据以下规则 ，验证已经填入的数字是否有效即可。

1. 数字 1-9 在每一行只能出现一次。

2. 数字 1-9 在每一列只能出现一次。

3. 数字 1-9 在每一个以粗实线分隔的 3x3 宫内只能出现一次。（请参考示例图）
 
### 注意：

一个有效的数独（部分已被填充）不一定是可解的。

只需要根据以上规则，验证已经填入的数字是否有效即可。

空白格用 '.' 表示。

### 示例

示例 1：

![示例](https://assets.leetcode-cn.com/aliyun-lc-upload/uploads/2021/04/12/250px-sudoku-by-l2g-20050714svg.png)

```
输入：board = 
[["5","3",".",".","7",".",".",".","."]
,["6",".",".","1","9","5",".",".","."]
,[".","9","8",".",".",".",".","6","."]
,["8",".",".",".","6",".",".",".","3"]
,["4",".",".","8",".","3",".",".","1"]
,["7",".",".",".","2",".",".",".","6"]
,[".","6",".",".",".",".","2","8","."]
,[".",".",".","4","1","9",".",".","5"]
,[".",".",".",".","8",".",".","7","9"]]

输出：true
```

示例 2：

```
输入：board = 
[["8","3",".",".","7",".",".",".","."]
,["6",".",".","1","9","5",".",".","."]
,[".","9","8",".",".",".",".","6","."]
,["8",".",".",".","6",".",".",".","3"]
,["4",".",".","8",".","3",".",".","1"]
,["7",".",".",".","2",".",".",".","6"]
,[".","6",".",".",".",".","2","8","."]
,[".",".",".","4","1","9",".",".","5"]
,[".",".",".",".","8",".",".","7","9"]]

输出：false

解释：除了第一行的第一个数字从 5 改为 8 以外，空格内其他数字均与 示例1 相同。 但由于位于左上角的 3x3 宫内有两个 8 存在, 因此这个数独是无效的。
```

### 提示：

board.length == 9

board[i].length == 9

board[i][j] 是一位数字（1-9）或者 '.'

## 思路

其实就是验证满足上面的 3 个条件：

1）每一行

2）每一列

3）每一个小正方体

## java 实现

```java
    public boolean isValidSudoku(char[][] board) {
        //1. 每一行
        for(int i = 0; i < 9; i++) {
            char[] row = board[i];

            if(!isValid(row)) {
                return false;
            }
        }

        //2. 每一列
        for(int i = 0; i < 9; i++) {
            char[] columns = getColumns(board, i);
            if(!isValid(columns)) {
                return false;
            }
        }

        //3. 每一个小的 9 宫格
        for(int i = 0; i < 9; i++) {
            char[] box = getSubBox(board, i);
            if(!isValid(box)) {
                return false;
            }
        }


        return true;
    }

    /**
     * 获取小9宫格
     *
     * 规律：
     *
     * 0    00 01 02
     *      10 11 12
     *      20 21 22
     *
     * 2 （第二行，第一个九宫格）
     *
     * 根据 index 获取对应的行+列信息
     *
     * row:  0 1 2
     *       3 4 5
     *       6 7 8
     *
     * @param board
     * @param index
     * @return
     */
    private char[] getSubBox(char[][] board, int index) {
        char[] box = new char[9];
        int size = 0;

        int rowNum = index/3;
        int columnNum = index%3;

        for(int i = rowNum*3; i < rowNum*3+3; i++) {
            for(int j = columnNum*3; j < columnNum*3+3; j++) {
                box[size++] = board[i][j];
            }
        }
        return box;
    }

    /**
     * 获取指定的列
     * @param board
     * @param columnIndex
     * @return
     */
    private char[] getColumns(char[][] board, int columnIndex) {
        char[] columns = new char[9];
        int size = 0;
        for(int i = 0; i < 9; i++) {
            char[] rows = board[i];
            columns[size++] = rows[columnIndex];
        }
        return columns;
    }

    /**
     * 只能包含：. 1-9
     *
     * 不能重复  主要是这个
     * @param chars
     * @return
     */
    private boolean isValid(char[] chars) {
        char[] nums = new char[9];
        int numSize = 0;
        for(char c : chars) {
            if(!isValidChar(c)) {
                return false;
            }

            // 忽略处理 .
            if('.' == c) {
                continue;
            }

            // 数据重复
            if(contains(nums, c)) {
                return false;
            }

            nums[numSize++] = c;
        }

        // 合法
        return true;
    }

    /**
     * 合法的值：. 或者 1-9
     * @param c
     * @return
     */
    private boolean isValidChar(char c) {
        if('.' == c) {
            return true;
        }

        if('1' <= c && c <= '9') {
            return true;
        }

        return false;
    }

    /**
     * 是否包含
     * @param chars
     * @param target
     * @return
     */
    private boolean contains(char[] chars, char target) {
        for(char c : chars) {
            if(target == c) {
                return true;
            }
        }

        return false;
    }
```

# 37. 解数独

## 题目

编写一个程序，通过填充空格来解决数独问题。

数独的解法需 遵循如下规则：

数字 1-9 在每一行只能出现一次。

数字 1-9 在每一列只能出现一次。

数字 1-9 在每一个以粗实线分隔的 3x3 宫内只能出现一次。（请参考示例图）

数独部分空格内已填入了数字，空白格用 '.' 表示。

### 例子

示例 1：

![ex1](https://assets.leetcode-cn.com/aliyun-lc-upload/uploads/2021/04/12/250px-sudoku-by-l2g-20050714svg.png)

```
输入：board = [["5","3",".",".","7",".",".",".","."],["6",".",".","1","9","5",".",".","."],[".","9","8",".",".",".",".","6","."],["8",".",".",".","6",".",".",".","3"],["4",".",".","8",".","3",".",".","1"],["7",".",".",".","2",".",".",".","6"],[".","6",".",".",".",".","2","8","."],[".",".",".","4","1","9",".",".","5"],[".",".",".",".","8",".",".","7","9"]]
输出：[["5","3","4","6","7","8","9","1","2"],["6","7","2","1","9","5","3","4","8"],["1","9","8","3","4","2","5","6","7"],["8","5","9","7","6","1","4","2","3"],["4","2","6","8","5","3","7","9","1"],["7","1","3","9","2","4","8","5","6"],["9","6","1","5","3","7","2","8","4"],["2","8","7","4","1","9","6","3","5"],["3","4","5","2","8","6","1","7","9"]]
解释：输入的数独如上图所示，唯一有效的解决方案如下所示：
```

![示例](https://assets.leetcode-cn.com/aliyun-lc-upload/uploads/2021/04/12/250px-sudoku-by-l2g-20050714_solutionsvg.png)

### 提示

提示：

board.length == 9

board[i].length == 9

board[i][j] 是一位数字或者 '.'

题目数据 保证 输入数独仅有一个解

## V1-基本回溯版本

### 思路

我们可以遍历 [i,j] 位置，如果位置为 '.'，在位置上尝试添加 1-9 的数字，然后判断是否合法(T36 解法)。

如果合法，则递归判断是否为已解决。

如果已解决，则直接返回结果；如果没有，则回溯。

### java 实现

```java
    /**
     * 基本思路：
     *
     * 1. 这一题应该需要回溯？
     *
     * 2. i,j 位置的元素。首先通过 行、列、小九宫格，来把一个位置可行的元素过滤出来，放在 set 中。
     *
     * 3. 尝试在这个位置放入一个元素，然后依次放剩下的。如果可以，则可行，如果不行，则回溯重来。
     *
     * 3.1 完成的条件。放入的元素个数，刚好等于初始 . 的个数
     * @param board 棋盘
     */
    public void solveSudoku(char[][] board) {
        if(board == null || board.length == 0)
            return;
        solve(board);
    }

    public boolean solve(char[][] board){
        for(int i = 0; i < board.length; i++){
            for(int j = 0; j < board[0].length; j++){
                if(board[i][j] == '.'){
                    for(char c = '1'; c <= '9'; c++){//trial. Try 1 through 9
                        if(isValid(board, i, j, c)){
                            board[i][j] = c; //Put c for this cell

                            if(solve(board))
                                return true; //If it's the solution return true
                            else
                                board[i][j] = '.'; //Otherwise go back
                        }
                    }

                    return false;
                }
            }
        }

        return true;
    }

    private boolean isValid(char[][] board, int row, int col, char c){
        for(int i = 0; i < 9; i++) {
            if(board[i][col] != '.' && board[i][col] == c) return false; //check row
            if(board[row][i] != '.' && board[row][i] == c) return false; //check column
            if(board[3 * (row / 3) + i / 3][ 3 * (col / 3) + i % 3] != '.' &&
                    board[3 * (row / 3) + i / 3][3 * (col / 3) + i % 3] == c) return false; //check 3*3 block
        }
        return true;
    }
```

### 效果

这种比较暴力，性能也会差一些。

TC: 20ms, 27.43%

MC: 401MB, 35.96%

## V2-回溯版本优化

### 思路

我们可以通过数组模拟 isValid 方法，提升一下效率。

定义 3 个二维数组，根据 board 初始化数组。

```java
boolean[][] rowUsed = new boolean[9][10];
boolean[][] colUsed = new boolean[9][10];
boolean[][][] boxUsed = new boolean[3][3][10];

for(int i = 0; i < board.length; i++) {
    for(int j = 0; j < board[0].length; j++) {
        if(board[i][j] != '.') {
            int num = (int)(board[i][j] - '0');
            rowUsed[i][num] = true;
            colUsed[j][num] = true;
            boxUsed[i/3][j/3][num] = true;
        }
    }
}
```

然后直接回溯使用：

```java
    boolean backtracking(int row, int col) {
        // 列到达末尾，则换下一行进行处理。
        if(col == board[0].length) {
            col = 0;
            row++;

            // 最后结束，终止条件
            if(row == board.length) {
                return true;
            }
        }

        // 待填入的位置
        if(board[row][col] == '.') {
            // 尝试 9 种数字
            for(int i = 1; i <= 9; i++) {
                boolean canUse = !(rowUsed[row][i] || colUsed[col][i] || boxUsed[row/3][col/3][i]);

                // 在每行、列、小9宫格可以填写的数字。
                if(canUse) {
                    // 使用
                    board[row][col] = (char)(i + '0');
                    rowUsed[row][i] = true;
                    colUsed[col][i] = true;
                    boxUsed[row/3][col/3][i] = true;
                    // 回溯
                    if(backtracking(row, col + 1)) {
                        return true;
                    }

                    // 清空
                    board[row][col] = '.';
                    rowUsed[row][i] = false;
                    colUsed[col][i] = false;
                    boxUsed[row/3][col/3][i] = false;
                }
            }
        } else {
            // 继续下一列
            return backtracking(row, col + 1);
        }
        return false;
    }
```

### 效果

TC: 3ms, 96.67%

MC: 40mb, 42.8%

这个使用数组替代方法的好处是，很多数据可以复用，而不是每次都要从头开始计算。

# 小结

针对数独的合法性校验，本身并不难。

数独解法，在数独的合法性基础之上。一般需要逐个尝试的问题，都可以采用回溯来解决。

有时候使用数组等进行预处理，可以进一步提升算法的效率。

希望本文对你有帮助，如果有其他想法的话，也可以评论区和大家分享哦。

各位**极客**的点赞收藏转发，是老马持续写作的最大动力！

# 开源地址

为了便于大家学习，所有实现均已开源。欢迎 fork + star~

> [https://github.com/houbb/leetcode](https://github.com/houbb/leetcode)

# 参考资料

https://leetcode.com/problems/valid-sudoku/

https://leetcode.cn/problems/sudoku-solver/

* any list
{:toc}
