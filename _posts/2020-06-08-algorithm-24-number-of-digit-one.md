---
layout: post
title: 面试算法：数字 1 的个数
date:  2020-1-23 10:09:32 +0800 
categories: [Data-Struct]
tags: [data-struct, binary-tree, leetcode, sh]
published: true
---

# 题目

给定一个整数 n，计算所有小于等于 n 的非负整数中数字 1 出现的个数。

- 示例 1：

```
输入：n = 13
输出：6
```

- 示例 2：

```
输入：n = 0
输出：0
```

提示：

0 <= n <= 2 * 10^9

# 暴力法

## 思路

直接遍历所有的数字，统计 1 出现的次数。

## java 实现

```java
/**
 * 最基本的思路：
 *
 * 直接统计各个位数的信息。
 * @param n
 * @return
 */
public static int countDigitOne(int n) {
    int sum = 0;
    for(int i = 1; i <= n; i++){
        sum += countOne(i);
    }
    return sum;
}

// 可以用除法，也可以转换为字符串处理。
private static int countOne(int n) {
    int count = 0;
    String string = n+"";
    char[] chars = string.toCharArray();
    for(char c : chars){
        if(c == '1') {
            count++;
        }
    }
    return count;
}
```

当然，很不幸的是，这个在测试的时候是直接超时的。

# 数字找规律

## 思路

最基本的方法行不通，我们只能找规律了。

以 [Java/Python one pass solution easy to understand](https://leetcode.com/problems/number-of-digit-one/discuss/64382/JavaPython-one-pass-solution-easy-to-understand) 为例。

假设我们有一个数  `xyzdabc`

如果我们考虑在 d（千位）上 1 出现的次数，只需要考虑下面 3 个场景：

```
(1) xyz * 1000                     if d == 0
(2) xyz * 1000 + abc + 1           if d == 1
(3) xyz * 1000 + 1000              if d > 1
```

然后把这些所有位 1 的个数加起来，就是我们的结果了。

## 3 个场景详解

很多人看了上面的解释，可能还是比较晕，我们详细介绍下为什么是上面 3 个场景。

（1）数字 4560000 千位有多少 1？

```
4551000 to 4551999 (1000)
4541000 to 4541999 (1000)
4531000 to 4531999 (1000)
...
1000 to 1999 (1000)
```

共计： 456 * 1000

（2）数字 4561234 千位有多少 1？

```
4561000-4561234 (1234+1)
4551000 to 4551999 (1000)
4541000 to 4541999 (1000)
4531000 to 4531999 (1000)
...
1000 to 1999 (1000)
```

共计：456 * 1000 + 1234 + 1

（3）数字 4562345 呢？

```
4561000-4561999 (1000)
4551000 to 4551999 (1000)
4541000 to 4541999 (1000)
4531000 to 4531999 (1000)
...
1000 to 1999 (1000)
```

共计：456*1000 + 1000

上面实际上就是对应了 3 个场景。

## java 实现

```java
int countDigitOne(int n) {
    if (n < 1) {
        return 0;
    }

    long digit = 1;
    int high = n / 10, current = n % 10, low = 0;
    int count = 0;

    while (high != 0 || current != 0) {
        if (current == 0) {
            count += high * digit;
        }
        else if (current == 1) {
            count += high * digit + low + 1;
        }
        else {
            count += (high + 1) * digit;
        }

        // 更新
        low += current * digit;
        current = high % 10;
        high /= 10;
        digit *= 10;
    }

    return count;
}
```

效果：

```
Runtime: 0 ms, faster than 100.00% of Java online submissions for Number of Digit One.
Memory Usage: 35.9 MB, less than 33.83% of Java online submissions for Number of Digit One.
```

# 拓展

这一题中 1 出现的次数，可以调整为任何 0-9 的数字 x。

解法整体是不变的：

```java
private static int count(int n, int x) {
    int cnt = 0;
    int mul =1;
    int left =n;
    int right =0;
    if(n==0) {
        return x<1?n:0;
    }

    while(left>0) {
        int digit = left%10;
        left/=10;
        if(digit == x) {
            cnt+=left*mul;
            cnt+=right+1;
        }
        else if(digit<x) {
            cnt+=left*mul;
        }
        else {
            cnt+=(left+1)*mul;
        }

        if(x == 0&&mul>1) {
            cnt-=mul;
        }

        right+=digit*mul;
        mul*=10;
    }

    return cnt;
}
```

# 反思

我虽然大概记得整体的思路，但是如果让我在分析实现的话，可能还是不能很好地实现。

所以，这个依然是存在问题的。

# 小结

希望本文对你有帮助，如果有其他想法的话，也可以评论区和大家分享哦。

各位**极客**的点赞收藏转发，是老马持续写作的最大动力！

# 参考资料

https://leetcode-cn.com/problems/number-of-digit-one/

* any list
{:toc}