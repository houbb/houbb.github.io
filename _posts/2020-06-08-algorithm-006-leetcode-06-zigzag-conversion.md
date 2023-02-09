---
layout: post
title: 【leetcode】06-6. N 字形变换 zigzag conversion
date:  2020-6-8 15:13:08 +0800
categories: [Algorithm]
tags: [algorithm, data-struct, leetcode, sf]
published: true
---

# 6. N 字形变换

将一个给定字符串 s 根据给定的行数 numRows ，以从上往下、从左到右进行 Z 字形排列。

比如输入字符串为 "PAYPALISHIRING" 行数为 3 时，排列如下：

```
P   A   H   N
A P L S I I G
Y   I   R
```

之后，你的输出需要从左往右逐行读取，产生出一个新的字符串，比如："PAHNAPLSIIGYIR"。

请你实现这个将字符串进行指定行数变换的函数：

`string convert(string s, int numRows);`
 
## 例子

示例 1：

```
输入：s = "PAYPALISHIRING", numRows = 3
输出："PAHNAPLSIIGYIR"
```

示例 2：

```
输入：s = "PAYPALISHIRING", numRows = 4
输出："PINALSIGYAHRPI"
解释：
P     I    N
A   L S  I G
Y A   H R
P     I
```

示例 3：

```
输入：s = "A", numRows = 1
输出："A"
```

## 提示：

1 <= s.length <= 1000

s 由英文字母（小写和大写）、',' 和 '.' 组成

1 <= numRows <= 1000


# V1-简单思路

## 思路

将其看做一个二维数组。

什么是 Z 字型？

ABCDEFGHI

三个：

```
1 2 3 4 5
A   E   I
B D F H J
C   G   K
```

四个：

```
1 2 3  4  5
A      G
B   F  H
C E    I  K
D      J
```

## java 实现

```java
public String convertBasic(String s, int numRows) {
        if(s.length() <= 1 || numRows <= 1) {
            return s;
        }

        // 这里的多少列是个技术活，需要思考一下。
        final int length = s.length();
        char[][] zChars = new char[numRows][length];

        char[] chars = s.toCharArray();

        int rowIndex = 0;
        int colIndex = 0;
        boolean isDown = true;

        // 第一个位置
        zChars[rowIndex][colIndex] = chars[0];
        for(int i = 1; i < length; i++) {
            char c = s.charAt(i);
            // 第一行时，从上到下
            if(rowIndex == 0) {
                isDown = true;
            } else if(rowIndex == numRows-1) {
                isDown = false;
            }

            // 处于向下的过程
            if(isDown) {
                rowIndex++;
            } else {
                // 处于向上的过程
                // 最后一行时，从下到上，从左到右
                colIndex++;
                rowIndex--;
            }
            zChars[rowIndex][colIndex] = c;
        }

        // 空元素 '\0'
        // 从左到右，从上到下遍历。
        StringBuilder stringBuilder = new StringBuilder(length);
        for(int i = 0; i < numRows; i++) {
            for(int j = 0; j < length; j++) {
                char currentChar = zChars[i][j];
                if(currentChar != '\0') {
                    stringBuilder.append(currentChar);
                }
            }
        }

        return stringBuilder.toString();
    }
```

## 效果

[效果](https://leetcode.com/problems/zigzag-conversion/submissions/351513822/)

```
Runtime: 49 ms, faster than 9.25% of Java online submissions for ZigZag Conversion.
Memory Usage: 41.7 MB, less than 19.65% of Java online submissions for ZigZag Conversion.
```

性能一般，怎么优化呢？

## 列的改进

我们上面实现列的时候

```java
// 这里的多少列是个技术活，需要思考一下。
final int length = s.length();
char[][] zChars = new char[numRows][length];
```

实际上没必要和 s 长度一样，因为要 Z 字形，可以调整为：

```java
// 这里的多少列是个技术活，需要思考一下。
final int numCols = (length+1) >> 1;
char[][] zChars = new char[numRows][numCols];
```

不过这个优化效果一般。

# V2-拼接优化

## 思路

拼接的时候其实在同一行的可以直接添加，没必要 O(N^2) 次遍历。

这就涉及到如何**在插入的时候完成拼接**。

优化点：数组替代LIST，append String 替代 buffer

## java 实现

```java
public String convert(String s, int numRows) {
        //fast-return
        final int length = s.length();
        if(s.length() <= 1 || numRows <= 1 || numRows >= length) {
            return s;
        }

        // 这里使用 buffer 替代。
        StringBuilder[] stringBuilderList = new StringBuilder[numRows];
        for(int i = 0; i < numRows; i++) {
            StringBuilder builder = new StringBuilder(length);
            stringBuilderList[i] =builder;
        }

        int rowIndex = 0;
        boolean isDown = true;

        // 第一个位置
        stringBuilderList[0].append(s.charAt(0));
        for(int i = 1; i < length; i++) {
            char c = s.charAt(i);
            // 第一行时，从上到下
            if(rowIndex == 0) {
                isDown = true;
            } else if(rowIndex == numRows-1) {
                isDown = false;
            }

            // 处于向下的过程
            if(isDown) {
                rowIndex++;
            } else {
                // 处于向上的过程
                // 最后一行时，从下到上，从左到右
                rowIndex--;
            }

            // 只需要关心属于对应的行即可
            // 行在变化，但是列肯定是在增长的。
            stringBuilderList[rowIndex].append(c);
        }

        // 按照行拼接
        StringBuilder stringBuilder = new StringBuilder(length);
        for(StringBuilder part : stringBuilderList) {
            // 这里直接拼接字符串其实更快。
            stringBuilder.append(part.toString());
        }

        return stringBuilder.toString();
}
```

## 效果

[提交效果](https://leetcode.com/problems/zigzag-conversion/submissions/351524886/)

```
Runtime: 9 ms, faster than 43.72% of Java online submissions for ZigZag Conversion.
Memory Usage: 40.5 MB, less than 24.44% of Java online submissions for ZigZag Conversion.
```

# V3-实现策略优化

## 思路

```
Visit all characters in row 0 first, then row 1, then row 2, and so on...

For all whole numbers kk,

Characters in row 0 are located at indexes k(2⋅numRows−2)

Characters in row numRows−1 are located at indexes k(2⋅numRows−2)+numRows−1

Characters in inner row i are located at indexes k(2⋅numRows−2)+i and (k+1)(2⋅numRows−2)−i.
```

这种一般比较难想到，相当于找到每一个规律。

## java 实现

```java
public String convert(String s, int numRows) {
    if (numRows == 1) {
        return s;
    }

    int n = s.length();
    StringBuilder ret = new StringBuilder(n);
    // 每一行的循环长度（这是一个规律）  k(2⋅numRows−2)
    int cycleLen = (numRows << 1) - 2;
    for (int i = 0; i < numRows; i++) {
        for (int j = 0; j + i < n; j += cycleLen) {
            // 所有行都符合
            ret.append(s.charAt(j + i));
            // 非第一行 && 非最后一行
            if (i != 0 && i != numRows - 1 && j + cycleLen - i < n) {
                ret.append(s.charAt(j + cycleLen - i));
            }
        }
    }
    return ret.toString();
}
```

当然，我们也可以把 StringBuilder 改为 char[]，不过性能差别不大。

```java
public String convert(String s, int numRows) {
    if (numRows == 1) {
        return s;
    }

    int n = s.length();
    char[] chars = new char[n];
    int cycleLen = (numRows << 1) - 2;
    int charIndex = 0;
    for (int i = 0; i < numRows; i++) {
        for (int j = 0; j + i < n; j += cycleLen) {
            chars[charIndex++] = s.charAt(j + i);
            if (i != 0 && i != numRows - 1 && j + cycleLen - i < n) {
                chars[charIndex++] = s.charAt(j + cycleLen - i);
            }
        }
    }

    return new String(chars);
}
```

## 效果

[效果](https://leetcode.com/problems/zigzag-conversion/submissions/351562904/)

```
Runtime: 2 ms, faster than 99.85% of Java online submissions for ZigZag Conversion.
Memory Usage: 39.1 MB, less than 99.38% of Java online submissions for ZigZag Conversion.
```

# 小结

这一题的第二种算法并不算难理解，第 3 种的话，就需要对 Z 字形元素排列有很强的的规律认识。

本质上而言，已经变成了一个数学问题。

# 开源地址

为了便于大家学习，所有实现均已开源。欢迎 fork + star~

> [https://github.com/houbb/leetcode](https://github.com/houbb/leetcode)

# 参考资料

https://leetcode.cn/problems/zigzag-conversion/

* any list
{:toc}