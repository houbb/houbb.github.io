---
layout: post
title: java 中文标点符号判断
date:  2019-12-25 16:57:12 +0800
categories: [Java]
tags: [java, sf]
published: true
---

# 背景

最近需要处理一些文本，发现想细化一些分类，以前的知识短板就暴露出来了。

这一篇主要是针对网上的资料收集整理。

偏于以后学习查阅。

# 中文标点符号判断

Java Character 实现Unicode字符集介绍  CJK中文字符和中文标点判断

主要内容：

1. Java Character 类介绍；

2. Unicode 简介及 UnicodeBlock 与 UnicodeScript区别和联系

3. 如何判断汉字及中文标点符号

## 需求背景

做中文信息处理，经常会遇到如何判断一个字是否是中文，或者是否是中文的标点符号等。

在Java中，主要使用 Character 类处理字符有关功能，而JDK 1.7中Character是按照Unicode 6.0版本实现的，所以这个要先学习下常用的 Unicode编码。

具体的定义、历史等请见 [wikiwikipedia](http://zh.wikipedia.org/zh-cn/Unicode)

# Character

## 静态内部类

Character 类中有3个静态内部类，

![image](https://user-images.githubusercontent.com/18375710/71974368-4e40e300-324c-11ea-9106-4d7e4865c3c5.png)

其中的 UnicodeBlock 和 UnicodeScript 类可以帮助我们判断字符类型，

### Block

UnicodeBlock是Unicode标准协会组织unicode码的一个基本单位，实际上一个 UnicodeBlock代表一片连续的Unicode号码段，UnicodeBlock之间不重叠。

例如，通常我们利用Unicode编码是否在 0x4E00–0x9FCC 来判断某字符是否为汉字，就是因为，有个UnicodeBlock 专门划分为存储汉字 (准确的说是 CJK统一汉字)，这个UnicodeBlock叫做 CJK Unified Ideographs，总共定义了 74,617 个汉字。

当然还有其他很多UnicodeBlock，例如，对于汉字还有4个扩展 UnicodeBlock，CJK Unified Ideographs Extension A, B, C, D 分别都扩展了一些我们平时见都没见过的汉字(如果不是专门的古籍数字化，Unicode字符集中的汉字普通交流够了)

### Script

Unicode 中一种 Script 通常就是一个字符或者其他书写符号的集合，代表着一种或多种writing systems （这里暂且翻译为文书类型，文书类型细分可以分成不同语言)。

有些Script仅支持一种文字类型，有些可以支持多种，例如 Latin Script 支持 supports English, French, German, Italian, Vietnamese, Latin 等等，具体可见 [wikipedia](http://en.wikipedia.org/wiki/Scripts_in_Unicode)，

### UnicodeBlock 与 UnicodeScript 关系：

所以UnicodeScript 是从语言书写规则层次对Unicode字符的分类，这是用使用角度划分，而UnicodeBlock是从硬的编码角度划分。

1. UnicodeBlock是简单的数值范围 (其中可能有些Block中会有一些尚未分配字符的“空号”)。

2. 在一个UnicodeScript中的字符可能分散在多个UnicodeBlock中；

3. 一个UnicodeBlock中的字符可能会被划进多个UnicodeScript中。

另外需要注意的是UnicodeScript实现是在Java 7中新引入的。

## 编码实现

### Block 版本

```java
public boolean isChineseByBlock(char c) {
    Character.UnicodeBlock ub = Character.UnicodeBlock.of(c);
    if (ub == Character.UnicodeBlock.CJK_UNIFIED_IDEOGRAPHS
            || ub == Character.UnicodeBlock.CJK_UNIFIED_IDEOGRAPHS_EXTENSION_A
            || ub == Character.UnicodeBlock.CJK_UNIFIED_IDEOGRAPHS_EXTENSION_B
            || ub == Character.UnicodeBlock.CJK_UNIFIED_IDEOGRAPHS_EXTENSION_C
            || ub == Character.UnicodeBlock.CJK_UNIFIED_IDEOGRAPHS_EXTENSION_D
            || ub == Character.UnicodeBlock.CJK_COMPATIBILITY_IDEOGRAPHS
            || ub == Character.UnicodeBlock.CJK_COMPATIBILITY_IDEOGRAPHS_SUPPLEMENT) {
        return true;
    } else {
        return false;
    }
}
```

### UnicodeScript

使用UnicodeScript方法判断，显然这个方法要简洁许多。

```java
 public boolean isChineseByScript(char c) {
     Character.UnicodeScript sc = Character.UnicodeScript.of(c);
     if (sc == Character.UnicodeScript.HAN) {
         return true;
     }
     return false;
}
```

# 判别中文标点符号

类似的，扩展开去还可以判别中文标点符号。

因为中文的标点符号主要存在于以下5个UnicodeBlock中，

U2000-General Punctuation (百分号，千分号，单引号，双引号等)

U3000-CJK Symbols and Punctuation ( 顿号，句号，书名号，〸，〹，〺 等；PS: 后面三个字符你知道什么意思吗？)

UFF00-Halfwidth and Fullwidth Forms ( 大于，小于，等于，括号，感叹号，加，减，冒号，分号等等)

UFE30-CJK Compatibility Forms  (主要是给竖写方式使用的括号，以及间断线﹉，波浪线﹌等)

UFE10-Vertical Forms (主要是一些竖着写的标点符号，    等等)


## 根据 Block 判断

- 根据UnicodeBlock方法判断中文标点符号

```java
public boolean isChinesePunctuation(char c) {
    Character.UnicodeBlock ub = Character.UnicodeBlock.of(c);
    if (ub == Character.UnicodeBlock.GENERAL_PUNCTUATION
            || ub == Character.UnicodeBlock.CJK_SYMBOLS_AND_PUNCTUATION
            || ub == Character.UnicodeBlock.HALFWIDTH_AND_FULLWIDTH_FORMS
            || ub == Character.UnicodeBlock.CJK_COMPATIBILITY_FORMS
            || ub == Character.UnicodeBlock.VERTICAL_FORMS) {
        return true;
    } else {
        return false;
    }
}
```

## 根据字符范围判断

```java
static boolean isSymbol(char ch) {
    if (isCnSymbol(ch)) return true;
    if (isEnSymbol(ch)) return true;
    if (0x2010 <= ch && ch <= 0x2017) return true;
    if (0x2020 <= ch && ch <= 0x2027) return true;
    if (0x2B00 <= ch && ch <= 0x2BFF) return true;
    if (0xFF03 <= ch && ch <= 0xFF06) return true;
    if (0xFF08 <= ch && ch <= 0xFF0B) return true;
    if (ch == 0xFF0D || ch == 0xFF0F) return true;
    if (0xFF1C <= ch && ch <= 0xFF1E) return true;
    if (ch == 0xFF20 || ch == 0xFF65) return true;
    if (0xFF3B <= ch && ch <= 0xFF40) return true;
    if (0xFF5B <= ch && ch <= 0xFF60) return true;
    if (ch == 0xFF62 || ch == 0xFF63) return true;
    if (ch == 0x0020 || ch == 0x3000) return true;
    return false;
}

static boolean isCnSymbol(char ch) {
    if (0x3004 <= ch && ch <= 0x301C) return true;
    if (0x3020 <= ch && ch <= 0x303F) return true;
    return false;
}

static boolean isEnSymbol(char ch) {
    if (ch == 0x40) return true;
    if (ch == 0x2D || ch == 0x2F) return true;
    if (0x23 <= ch && ch <= 0x26) return true;
    if (0x28 <= ch && ch <= 0x2B) return true;
    if (0x3C <= ch && ch <= 0x3E) return true;
    if (0x5B <= ch && ch <= 0x60) return true;
    if (0x7B <= ch && ch <= 0x7E) return true;
    return false;
}

static boolean isPunctuation(char ch) {
    if (isCjkPunc(ch)) return true;
    if (isEnPunc(ch)) return true;
    if (0x2018 <= ch && ch <= 0x201F) return true;
    if (ch == 0xFF01 || ch == 0xFF02) return true;
    if (ch == 0xFF07 || ch == 0xFF0C) return true;
    if (ch == 0xFF1A || ch == 0xFF1B) return true;
    if (ch == 0xFF1F || ch == 0xFF61) return true;
    if (ch == 0xFF0E) return true;
    if (ch == 0xFF65) return true;
    return false;
}

static boolean isEnPunc(char ch) {
    if (0x21 <= ch && ch <= 0x22) return true;
    if (ch == 0x27 || ch == 0x2C) return true;
    if (ch == 0x2E || ch == 0x3A) return true;
    if (ch == 0x3B || ch == 0x3F) return true;
    return false;
}

static boolean isCjkPunc(char ch) {
    if (0x3001 <= ch && ch <= 0x3003) return true;
    if (0x301D <= ch && ch <= 0x301F) return true;
    return false;
}
```

# 参考资料

[Java 中文字符判断 中文标点符号判断](https://www.cnblogs.com/zztt/p/3427452.html)


* any list
{:toc}