---
layout: post
title: 敏感词性能优化-v0.31.0-基本类型的进一步优化
date: 2025-9-05 20:40:12 +0800
categories: [Java]
tags: [java, nlp, sensitive-word, sh]
published: true
---

# 背景

压测时发现 init 内部类，和默认的 for 循环迭代器其实还是会造成额外的性能开销。

所以进一步优化。

# 优化1-字符映射

# 格式映射

# 优化2-前缀树

## 说明 

java 基本类型的装箱+拆箱其实也是消耗性能的。

但是很多集合本身又不支持基本类型，比如 Map，而我们的 TrieTree 又是基于此实现的。

## 核心耗时

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

## 解决思路

我们可以给 jdk 研发写信，让其兼容基本类型。

当然了，或者自己实现。

这种事情，自然已经有人替我们做了。

比如 [fastutil](https://github.com/vigna/fastutil)

我们考虑放在下一期来优化。





* any list
{:toc}