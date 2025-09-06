---
layout: post
title: v0.29.2 敏感词性能优化之基本类型拆箱、装箱的进一步优化的尝试
date: 2025-9-05 20:40:12 +0800
categories: [Java]
tags: [java, nlp, sensitive-word, sh]
published: true
---

# 敏感词性能调优系列

[v0.29.0 敏感词性能优化提升 14 倍全过程](https://houbb.github.io/2025/08/29/sensitive-word-why-so-slow)

[v0.29.1 敏感词性能优化之内部类+迭代器内部类](https://houbb.github.io/2025/09/05/sensitive-word-v0.29.1-opt-init-iter)

[v0.29.2 敏感词性能优化之基本类型拆箱、装箱的进一步优化的尝试](https://houbb.github.io/2025/09/05/sensitive-word-v0.29.2-basic-type-opt)

[v0.29.3 敏感词性能优化之繁简体转换 opencc4j 优化](https://houbb.github.io/2025/08/29/sensitive-word-v0.29.3-opencc4j-opt)

# 背景

## java 的装箱、拆箱

自动装箱/拆箱大家应该都知道，这个一般而言不是什么大问题。

不过作为一个底层框架，有时候就需要稍微考虑一下这个问题。

# 优化1-全半角

## 原始写法

```java
CharUtil.toHalfWidth(c);
```

具体

```java
    public static char toHalfWidth(final char c) {
        char resultChar = c;
        // 全角空格
        if (resultChar == 12288) {
            resultChar = (char) 32;
        // 其他全角字符
        } else if (resultChar > 65280 && resultChar < 65375) {
            resultChar = (char) (resultChar - 65248);
        }

        return resultChar;
    }
```

## 优化思路

更少的局部变量赋值、更精确的范围判断、更扁平的分支结构。

```java
public static char toHalfWidth(char original) {
        // 全角空格
        if (original == '\u3000') return ' ';
        // 其他可转换全角字符
        if (original >= '\uFF01' && original <= '\uFF5E') {
            return (char) (original - 0xFEE0);
        }
        // 其他字符保持不变
        return original;
    }
```

## 效果

10W 次，大概6ms->4ms

聊胜于无

# 优化2-char 的装箱、拆箱

java 基本类型的装箱+拆箱其实也是消耗性能的。

但是很多集合本身又不支持基本类型，比如 Map，而我们的 TrieTree 又是基于此实现的。

WordDataTree#getNowMap 方法

```java
// 这里的 char 已经是统一格式化之后的，所以可以不用再次格式化。
char mappingChar = stringBuilder.charAt(index);

// 这里做一次重复词的处理
WordDataTreeNode currentMap = nowNode.getSubNode(mappingChar);
```

其中获取 node

```java
public WordDataTreeNode getSubNode(final Character c) {
    if(subNodeMap == null) {
        return null;
    }

    return subNodeMap.get(c);
}
```

会导致不可避免的一次 char 和 Character 的转换。

修改范围：

1）所有的字符处理映射

2）trie map

## 实现

基于开源的 `Char2CharOpenHashMap` 和 `Char2ObjectOpenHashMap` 替代掉 HashMap 即可。

其他都是接口级别兼容的。

## 效果

全是测试 3 次，5W 次

1) v0.29.1 基线

```
5843
5525
5894
```

2) 改造后

实际测试发现效果不好。

先回滚下 trie map 试一下。

发现效果还是一般

```
6225
6080
5373
```

开始效果并不好，猜测是 JIT 前期发力不够，char2char 的优势发挥不出来。

感觉这个方向意义不大。很奇怪，按理说应该性能很高才对。


# 改造方案2-自己实现

## 现状

目前先不动 trie，针对数字+英文的转换本身实现比较简单。

我们暂时不引用这个包，自己实现一个精简版本的。

## char2charMap 实现

想达到 jdk 的性能还是很难的，这个主要在于简化+取巧。

```java
package com.github.houbb.sensitive.word.collection;

/**
 * 原生无装箱、拆箱的实现
 *
 * @since 0.29.2
 * @author 老马啸西风
 */
public final class Char2CharMap {

    private static final char EMPTY_KEY = '\0'; // 特殊标记，表示空槽
    private static final float LOAD_FACTOR = 0.5f;

    private char[] keys;
    private char[] values;
    private int size;
    private int mask;   // capacity-1，用于快速取模
    private int maxSize;

    public Char2CharMap(int expectedSize) {
        int capacity = tableSizeFor((int) (expectedSize / LOAD_FACTOR) + 1);
        this.keys = new char[capacity];
        this.values = new char[capacity];
        this.mask = capacity - 1;
        this.maxSize = (int) (capacity * LOAD_FACTOR);
        this.size = 0;
    }

    /** 2 的幂次方容量 */
    private static int tableSizeFor(int cap) {
        int n = cap - 1;
        n |= n >>> 1;
        n |= n >>> 2;
        n |= n >>> 4;
        n |= n >>> 8;
        n |= n >>> 16;
        return (n < 2) ? 2 : (n >= (1 << 30) ? (1 << 30) : n + 1);
    }

    private int hash(char k) {
        return (k * 0x9E3779B9) & mask; // 乘法哈希 + mask
    }

    /** 插入或覆盖 */
    public void put(char key, char value) {
        if (key == EMPTY_KEY) {
            throw new IllegalArgumentException("Key '\0' is reserved as EMPTY_KEY.");
        }
        int idx = hash(key);
        while (true) {
            if (keys[idx] == EMPTY_KEY) {
                keys[idx] = key;
                values[idx] = value;
                if (++size >= maxSize) {
                    resize();
                }
                return;
            } else if (keys[idx] == key) {
                values[idx] = value;
                return;
            }
            idx = (idx + 1) & mask;
        }
    }

    /** 查询，不存在时返回 defaultValue */
    public char get(char key, char defaultValue) {
        if (key == EMPTY_KEY) return defaultValue;
        int idx = hash(key);
        while (true) {
            char k = keys[idx];
            if (k == EMPTY_KEY) return defaultValue;
            if (k == key) return values[idx];
            idx = (idx + 1) & mask;
        }
    }

    public char get(char key) {
        char defaultVal = 0;
        return get(key, defaultVal);
    }

    private void resize() {
        int newCap = keys.length << 1;
        char[] oldKeys = keys;
        char[] oldVals = values;

        keys = new char[newCap];
        values = new char[newCap];
        mask = newCap - 1;
        maxSize = (int) (newCap * LOAD_FACTOR);
        size = 0;

        for (int i = 0; i < oldKeys.length; i++) {
            char k = oldKeys[i];
            if (k != EMPTY_KEY) {
                put(k, oldVals[i]);
            }
        }
    }

    public int size() {
        return size;
    }
}
```

## 性能对比 

10w 次，原生 HashMap 7ms，c2c 4ms

聊胜于无。

# 小结

本次主要是一次尝试，对于底层的理解反而有一些助益。

实际上这种装箱、拆箱也会被 JVM 优化。

# 开源地址

> [https://github.com/houbb/sensitive-word](https://github.com/houbb/sensitive-word)

* any list
{:toc}