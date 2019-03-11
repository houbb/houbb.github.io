---
layout: post
title: 字符串匹配-01-BF 暴力匹配算法
date:  2019-3-1 17:23:40 +0800
categories: [Althgorim]
tags: [algorithm, sf]
published: true
---

# 问题 

假设现在我们面临这样一个问题：有一个文本串S，和一个模式串P，现在要查找P在S中的位置，怎么查找呢？

# 暴力匹配算法

首先，先理清楚了暴力匹配算法的流程及内在的逻辑：

如果用暴力匹配的思路，并假设现在文本串S匹配到 i 位置，模式串P匹配到 j 位置，则有：

```
1. 如果当前字符匹配成功（即S[i] == P[j]），则i++，j++，继续匹配下一个字符；

2. 如果失配（即S[i]! = P[j]），令i = i - (j - 1)，j = 0。相当于每次匹配失败时，i 回溯，j 被置为0。
```

## 简单描述

暴力搜索算法由文本串中从0到n-m所有位置的比较组成，无论是否从模式串的起始位置开始，每次匹配过后，模式串向右移动一位。

暴力搜索算法没有预处理阶段，文本串和模式串需要常量额外空间，在搜索阶段的文本串的字符可以按照任意顺序进行比较，匹配的时间复杂度为O(mn)，

# 代码实现

## 统一接口定义

```java
/**
 * 字符串匹配
 * @author binbin.hou
 * @date 2019/3/11
 * @since 0.0.1
 */
public interface IStringMatch {

    /**
     * 匹配
     * @param text 全部的字符串
     * @param pattern 目标字符串
     * @return 对应的索引 -1 标识不存在
     */
    int indexOf(final String text, final String pattern);

}
```

## BF 算法实现

```java
/**
 * 暴力匹配算法
 *
 * @author binbin.hou
 * @date 2019/3/11
 * @since 0.0.1
 */
public class BFStringMatch implements IStringMatch {

    /**
     * @param text    全部的字符串
     * @param pattern 目标字符串
     * @return 0.0.1
     * @see String#indexOf(char[], int, int, String, int)
     */
    @Override
    public int indexOf(String text, String pattern) {
        if (null == text
                || pattern == null) {
            return -1;
        }

        int textLen = text.length();
        int patternLen = pattern.length();
        if (textLen < patternLen) {
            return -1;
        }

        // 核心算法
        char[] textChars = text.toCharArray();
        char[] patternChars = pattern.toCharArray();

        // text[i] 对应的下标信息
        for (int i = 0; i <= textLen - patternLen; i++) {
            // pattern 的下标
            for (int j = 0; j < patternLen; j++) {
                if (textChars[i + j] == patternChars[j]) {
                    // 遍历完了 pattern 模式
                    if (j == patternLen - 1) {
                        return i;
                    }
                }
            }
        }

        return -1;
    }

}
```

# 改进版本算法

这个版本有没有什么缺陷呢？

明知道部分已经不再错误了，下次再次循环其实都是无效的，这就造成了不必需的循环。

## KMP

那有没有一种算法，让i 不往回退，只需要移动j 即可呢？

答案是肯定的。这种算法就是KMP算法，它利用之前已经部分匹配这个有效信息，保持i 不回溯，通过修改j 的位置，让模式串尽量地移动到有效的位置。

# 参考资料 

[字符串匹配---暴力匹配算法](http://www.cnblogs.com/Kevin-mao/p/5764726.html)

[字符串匹配--暴力搜索算法](https://www.cnblogs.com/wuyudong/p/brute-force-algorithm.html)

* any list
{:toc}