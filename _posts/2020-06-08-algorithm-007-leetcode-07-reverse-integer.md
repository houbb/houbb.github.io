---
layout: post
title: 【leetcode】07-7. 整数反转 reverse integer 整数的位运算汇总
date:  2020-6-8 15:13:08 +0800
categories: [Algorithm]
tags: [algorithm, data-struct, leetcode, sf]
published: true
---

# 7. 整数反转

给你一个 32 位的有符号整数 x ，返回将 x 中的数字部分反转后的结果。

如果反转后整数超过 32 位的有符号整数的范围 [−2^31,  2^31 − 1] ，就返回 0。

假设环境不允许存储 64 位整数（有符号或无符号）。
 
## 例子

示例 1：

```
输入：x = 123
输出：321
```

示例 2：

```
输入：x = -123
输出：-321
```

示例 3：

```
输入：x = 120
输出：21
```

示例 4：

```
输入：x = 0
输出：0
```

## 提示：

-2^31 <= x <= 2^31 - 1

# v1-借助字符串

## 思路

比较偷懒的方式：

1）int 转字符串

2）字符串翻转

3）字符串转 int

不过需要考虑一下正负号的问题。

## java 实现

```java
public int reverseBasic(int x) {
    int abs = Math.abs(x);
    String string = String.valueOf(abs);
    String reverse = new StringBuilder(string).reverse().toString();
    int absReverse;
    try {
        absReverse = Integer.parseInt(reverse);
    } catch (NumberFormatException e) {
        return 0;
    }
    if(x >= 0) {
        return absReverse;
    }
    return -absReverse;
}
```

## 效果

[效果](https://leetcode.com/problems/reverse-integer/submissions/351541048/)

```
Runtime: 5 ms, faster than 11.06% of Java online submissions for Reverse Integer.
Memory Usage: 38.8 MB, less than 7.78% of Java online submissions for Reverse Integer.
```

# V2-数字的十进制

## 思路

实际上这一题的真正考核点，是对于 10 进制整数的理解。

任何一个 10 进制的数字：

```
abc = a * 10^2 + b * 10^1 + c * 10^0;
```

## 例子

为了便于理解，我们选择一个例子：

以整数 12345 进行下面的处理：

```java
int pop = x % 10; //余数
x = x / 10;     //处的结果 

// 反过来的结果计算
result = result * 10 + pop;
```

日志：

```
[pop]: 5, [x]: 1234, [result]: 5
[pop]: 4, [x]: 123, [result]: 54
[pop]: 3, [x]: 12, [result]: 543
[pop]: 2, [x]: 1, [result]: 5432
[pop]: 1, [x]: 0, [result]: 54321
```

## java 实现

```java
public int reverse(int x) {
    long result = 0;
    while (x != 0) {
        // 移除最后一位
        int pop = x % 10;
        x = x / 10;
        // 返回值
        result = result * 10 + pop;
    }
    // 越界判断
    if(result > Integer.MAX_VALUE || result < Integer.MIN_VALUE) {
        return 0;
    }
    return (int) result;
}
```

## 效果

[效果](https://leetcode.com/problems/reverse-integer/submissions/351581655/)

```
Runtime: 1 ms, faster than 100.00% of Java online submissions for Reverse Integer.
Memory Usage: 36.4 MB, less than 94.78% of Java online submissions for Reverse Integer.
```

为了加深对十进制的理解，我们继续看一下其他几个类似的题目。

# 9. 回文数 palindrome number

## 题目

给你一个整数 x ，如果 x 是一个回文整数，返回 true ；否则，返回 false 。

回文数是指正序（从左向右）和倒序（从右向左）读都是一样的整数。

例如，121 是回文，而 123 不是。

### 例子 

示例 1：

```
输入：x = 121
输出：true
```

示例 2：

```
输入：x = -121
输出：false
解释：从左向右读, 为 -121 。 从右向左读, 为 121- 。因此它不是一个回文数。
```

示例 3：

```
输入：x = 10
输出：false
解释：从右向左读, 为 01 。因此它不是一个回文数。
``` 

### 提示：

-2^31 <= x <= 2^31 - 1

### 进阶：

你能不将整数转为字符串来解决这个问题吗？

## V1-转换为字符串处理

### 思路

我们可以把 int 转换为 string，然后使用前面对于字符串回文判断方式，来解决。

### java 实现

```java
public boolean isPalindrome2(int x) {
    String string = String.valueOf(x);
    final int length = string.length();
    int mid = length >> 1;
    // 从中间往两边均摊
    for (int i = 0; i < mid; i++) {
        if (string.charAt(i) != string.charAt(length - i - 1)) {
            return false;
        }
    }
    return true;
}
```

### 效果

```
Runtime: 7 ms, faster than 76.19% of Java online submissions for Palindrome Number.
Memory Usage: 38.5 MB, less than 92.10% of Java online submissions for Palindrome Number.
```

## V2-借助整数逆序

### 思路

我们不转换 int 到 string，而是直接使用 7 的整数翻转，反转之后如果依然相同，则说明为回文。

### java 实现

```java
public boolean isPalindrome(int x) {
    if(x < 0) {
        return false;
    }
    // 反转
    int reverse = reverse(x);
    return x == reverse;
}

private int reverse(int x) {
    int result = 0;
    while (x != 0) {
        // 移除最后一位
        int pop = x % 10;
        x = x / 10;
        // 返回值
        result = result * 10 + pop;
    }
    return result;
}
```

或者写的更加紧凑些：

```java
    public boolean isPalindrome(int x) {
        int temp = x;
        int ds = 0;
        while (temp > 0) {
            // 直接反向操作，计算逆序的数值
            ds = ds * 10 + (temp % 10);

            // 保留的高位
            temp /= 10;
        }

        return (x - ds) == 0;
    }
```

### 效果

```
Runtime: 7 ms, faster than 96.19% of Java online submissions for Palindrome Number.
Memory Usage: 39.3 MB, less than 86.45% of Java online submissions for Palindrome Number.
```

# 12. 整数转罗马数字

## 题目

罗马数字包含以下七种字符： I， V， X， L，C，D 和 M。

```
字符          数值
I             1
V             5
X             10
L             50
C             100
D             500
M             1000
```

例如， 罗马数字 2 写做 II ，即为两个并列的 1。12 写做 XII ，即为 X + II 。 27 写做  XXVII, 即为 XX + V + II 。

通常情况下，罗马数字中小的数字在大的数字的右边。

但也存在特例，例如 4 不写做 IIII，而是 IV。数字 1 在数字 5 的左边，所表示的数等于大数 5 减小数 1 得到的数值 4 。同样地，数字 9 表示为 IX。这个特殊的规则只适用于以下六种情况：

I 可以放在 V (5) 和 X (10) 的左边，来表示 4 和 9。
X 可以放在 L (50) 和 C (100) 的左边，来表示 40 和 90。 
C 可以放在 D (500) 和 M (1000) 的左边，来表示 400 和 900。

给你一个整数，将其转为罗马数字。

### 例子 

示例 1:

```
输入: num = 3
输出: "III"
```

示例 2:

```
输入: num = 4
输出: "IV"
```

示例 3:

```
输入: num = 9
输出: "IX"
```

示例 4:

```
输入: num = 58
输出: "LVIII"
解释: L = 50, V = 5, III = 3.
```

示例 5:

```
输入: num = 1994
输出: "MCMXCIV"
解释: M = 1000, CM = 900, XC = 90, IV = 4.
```

### 提示：

1 <= num <= 3999

## V1-基本实现

### 思路

核心的部分依然不变，我们可以使用 stack 保存整数的每一位，然后把数据映射。

### java 实现

```java
    /**
     * 思路1：basic
     * 思路2：HashMap
     *
     * 1 I
     * 2 II
     * 3 III
     * 4 IV = 5-1
     * 5 V = 5
     * 6 VI = 5+1
     * 7 VII
     * 8 VIII
     * 9 IX = 10-1
     * 10 X = 10
     *
     * 考虑范围：1-3999
     *
     * 最多有 4 位
     *
     * 是否需要栈？
     * @param num 数字
     * @return 结果
     * @since v1
     */
    public String intToRoman(int num) {
        Stack<Integer> stack = new Stack<>();
        while (num > 0) {
            int mod = num % 10;
            // 剩余的部分
            num = num/10;

            // 余数
            stack.add(mod);
        }
        StringBuilder stringBuilder = new StringBuilder();
        while (!stack.isEmpty()) {
            // 第一个出来的是最高位
            int number = stack.pop();
            // 跳过
            if(number == 0) {
                continue;
            }
            if(stack.size() == 3) {
                stringBuilder.append(build(number,
                        "M", "", ""));
            } else if(stack.size() == 2) {
                stringBuilder.append(build(number,
                        "C", "D", "M"));
            } else if(stack.size() == 1) {
                stringBuilder.append(build(number,  "X", "L", "C"));
            } else if(stack.size() == 0) {
                stringBuilder.append(build(number,
                        "I", "V", "X"));
            }
        }

        return stringBuilder.toString();
    }

    /**
     * 核心实现
     * @param number 数字
     * @param currentChar  当前字符
     * @param fiveChar 中间
     * @param tenChar 最后
     * @return 结果
     * @since v1
     */
    private String build(final int number,
                         final String currentChar,
                         final String fiveChar,
                         final String tenChar) {
        if(number <= 3) {
            return repeat(number, currentChar);
        } else if(number == 4) {
            return currentChar + fiveChar;
        } else if(number == 5) {
            return fiveChar;
        } else if(number == 9) {
            return currentChar+tenChar;
        } else {
            return fiveChar +repeat(number-5, currentChar);
        }
    }

    /**
     * 重复构建多次
     * @param times 次数
     * @param c 字符
     * @return 结果
     * @since v1
     */
    private String repeat(final int times, final String c) {
        StringBuilder stringBuilder = new StringBuilder();

        for(int i = 0; i < times; i++) {
            stringBuilder.append(c);
        }
        return stringBuilder.toString();
    }
```

## 效果

```
Runtime: 14 ms, faster than 27.42% of Java online submissions for Palindrome Number.
Memory Usage: 44.3 MB, less than 23.25% of Java online submissions for Palindrome Number.
```

## V2-减法

### 思路

减法的运算量，而不是乘除。

### java 实现

```java
    /**
     * 利用减法替代除法+乘法
     *
     * @param num 数字
     * @return 结果
     * @since best
     */
    public String intToRoman(int num) {
        StringBuilder sb = new StringBuilder();
        while (num > 0) {
            if (num >= 1000) {
                num -= 1000;
                sb.append("M");
            } else if (num >= 900) {
                num -= 900;
                sb.append("CM");
            } else if (num >= 500) {
                num -= 500;
                sb.append("D");
            } else if (num >= 400) {
                num -= 400;
                sb.append("CD");
            } else if (num >= 100) {
                num -= 100;
                sb.append("C");
            } else if (num >= 90) {
                num -= 90;
                sb.append("XC");
            } else if (num >= 50) {
                num -= 50;
                sb.append("L");
            } else if (num >= 40) {
                num -= 40;
                sb.append("XL");
            } else if (num >= 10) {
                num -= 10;
                sb.append("X");
            } else if (num >= 9) {
                num -= 9;
                sb.append("IX");
            } else if (num >= 5) {
                num -= 5;
                sb.append("V");
            } else if (num >= 4) {
                num -= 4;
                sb.append("IV");
            } else {
                num -= 1;
                sb.append("I");
            }
        }

        return sb.toString();
    }
```

这个有很多的 if-else，当然也许可以写的紧凑些。

```java
class Solution {
    
    int[] nums = new int[]{1000, 900, 500, 400, 100, 90, 50, 40, 10, 9, 5, 4, 1};
    String[] strings = new String[]{"M", "CM", "D", "CD", "C", "XC", "L", "XL", "X", "IX", "V", "IV", "I"};

    /**
     * 利用减法替代除法+乘法
     *
     * @param num 数字
     * @return 结果
     * @since best
     */
    public String intToRoman(int num) {
        StringBuilder sb = new StringBuilder();
        while (num > 0) {
            for(int i = 0; i < nums.length; i++) {
                int curNum = nums[i];
                if(num >= curNum) {
                    num -= curNum;
                    sb.append(strings[i]);
                    break;
                }
            }
        }

        return sb.toString();
    }

}
```

### 效果

[效果如下](https://leetcode.com/problems/integer-to-roman/submissions/894547645/)

```
Runtime: 4 ms, faster than 99.96% of Java online submissions for Palindrome Number.
Memory Usage: 41.6 MB, less than 97.7% of Java online submissions for Palindrome Number.
```

# 开源地址

为了便于大家学习，所有实现均已开源。欢迎 fork + star~

> [https://github.com/houbb/leetcode](https://github.com/houbb/leetcode)

# 参考资料

https://leetcode.cn/problems/zigzag-conversion/

* any list
{:toc}