---
layout: post
title: leetcode 进阶数据结构篇专题之前缀树（Trie，又称字典树）01-入门介绍
date:  2020-6-8 15:13:08 +0800
categories: [Algorithm]
tags: [algorithm, data-struct, topics, leetcode, union-find-set, sf]
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

# 数据结构篇

## 通用基础

链表 

树

哈希表

stack 栈

queue 队列

ordered set 有序集合

heap  堆

graph 图


## 进阶

并查集

字典树

线段树

树状数组

后缀数组

# chat

https://leetcode.cn/studyplan/top-100-liked/

## 详细介绍一下力扣数据结构之前缀树

当然可以！在力扣（LeetCode）中，**前缀树（Trie，又称字典树）** 是一个非常重要且高效的字符串处理数据结构，广泛用于解决**前缀匹配、字符串集合判断、自动补全、敏感词过滤**等问题。

---

## 🧠 一、前缀树是什么？

前缀树是一种**多叉树结构**，用于**高效地存储和查找字符串集合中的前缀信息**。

> 它不是二叉树，而是一棵 "字母树"，每条边是一个字符，每个节点代表某个前缀。

### 举例：

假设你插入以下单词：`["apple", "app", "apt"]`

会形成一棵这样的树：

```
root
 └── a
      └── p
           └── p
                └── l
                     └── e
           └── t
```

---

## 📦 二、前缀树的基本操作

| 操作                   | 描述           |
| -------------------- | ------------ |
| `insert(word)`       | 插入一个单词       |
| `search(word)`       | 判断是否存在这个完整单词 |
| `startsWith(prefix)` | 判断是否有这个前缀的单词 |

---

## 🔧 三、Java 实现模板

```java
class TrieNode {
    TrieNode[] children = new TrieNode[26]; // a-z 共 26 个小写字母
    boolean isEnd = false; // 是否是一个完整单词的结束
}

class Trie {
    private TrieNode root;

    public Trie() {
        root = new TrieNode();
    }

    public void insert(String word) {
        TrieNode node = root;
        for (char c : word.toCharArray()) {
            int idx = c - 'a';
            if (node.children[idx] == null) {
                node.children[idx] = new TrieNode();
            }
            node = node.children[idx];
        }
        node.isEnd = true;
    }

    public boolean search(String word) {
        TrieNode node = searchPrefix(word);
        return node != null && node.isEnd;
    }

    public boolean startsWith(String prefix) {
        return searchPrefix(prefix) != null;
    }

    private TrieNode searchPrefix(String prefix) {
        TrieNode node = root;
        for (char c : prefix.toCharArray()) {
            int idx = c - 'a';
            if (node.children[idx] == null) return null;
            node = node.children[idx];
        }
        return node;
    }
}
```

---

## 🚀 四、时间复杂度分析

| 操作   | 时间复杂度        |
| ---- | ------------ |
| 插入单词 | O(L)，L 是单词长度 |
| 查询单词 | O(L)         |
| 查询前缀 | O(L)         |

> 比起哈希表（可能要比较字符串），前缀树能更快地实现前缀判断等功能，**避免字符串比较开销**。

---

## 💡 五、前缀树适合解决的问题

| 力扣题目                                                                                               | 类型        | 解法            |
| -------------------------------------------------------------------------------------------------- | --------- | ------------- |
| [208. 实现 Trie](https://leetcode.cn/problems/implement-trie-prefix-tree/)                           | Trie 基础操作 | 构建基本前缀树       |
| [720. 词典中最长的单词](https://leetcode.cn/problems/longest-word-in-dictionary/)                          | 词典构造      | 插入 + DFS      |
| [211. 添加与搜索单词（支持 . 通配符）](https://leetcode.cn/problems/design-add-and-search-words-data-structure/) | 支持模糊匹配    | Trie + 回溯搜索   |
| [212. 单词搜索 II](https://leetcode.cn/problems/word-search-ii/)                                       | 网格中找词     | Trie + DFS 剪枝 |
| [648. 单词替换](https://leetcode.cn/problems/replace-words/)                                           | 字符串替换     | Trie + 前缀匹配   |

---

## 📚 六、变种 Trie

| 类型                      | 说明                                                        |
| ----------------------- | --------------------------------------------------------- |
| **MapTrie**             | 使用 `Map<Character, TrieNode>` 代替数组，支持任意字符（适合 Unicode、多语言） |
| **压缩 Trie（Radix Tree）** | 合并公共前缀节点，节省空间                                             |
| **后缀树（Suffix Trie）**    | 插入的是所有后缀，用于模式匹配                                           |
| **Aho-Corasick 自动机**    | 支持同时匹配多个模式串（关键词过滤）                                        |

---

## ✨ 七、常见应用场景总结

| 应用         | 是否适合使用前缀树     |
| ---------- | ------------- |
| 单词前缀匹配     | ✅ 非常适合        |
| 判断某个单词是否存在 | ✅ 合适          |
| 模糊查找（带通配符） | ✅ 可扩展支持       |
| 最长公共前缀     | ✅ 结合 Trie 可解  |
| 排序 / 自动补全  | ✅ 可结合 DFS/BFS |
| 查询字符串频率    | ❌ 哈希表更合适      |

---

## 📌 八、和其他数据结构对比

| 操作目标            | HashSet | 前缀树 Trie |
| --------------- | ------- | -------- |
| 判断完整单词是否存在      | ✅       | ✅        |
| 判断前缀是否存在        | ❌       | ✅        |
| 查询某一类单词（如前缀为 a） | ❌       | ✅        |
| 支持模糊匹配（通配符）     | ❌       | ✅        |
| 查询频率、词频统计       | ✅       | ✅（需扩展）   |

---

## ✅ 九、总结

| 特性                 | 描述            |
| ------------------ | ------------- |
| 高效的字符串集合存储结构       | 避免重复存储前缀      |
| 查询时间与单词长度有关（O(L)）  | 比哈希更适合前缀匹配类问题 |
| 常用于搜索建议、自动补全、词典查询等 |               |

* any list
{:toc}