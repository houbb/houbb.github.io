---
layout: post
title: leetcode 算法篇专题之图 graph 02-01-LC208. 实现 Trie (前缀树) implement-trie-prefix-tree
date:  2020-6-8 15:13:08 +0800
categories: [Algorithm]
tags: [algorithm, data-struct, topics, leetcode, graph, sf]
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

# LC208. 实现 Trie (前缀树) 

Trie（发音类似 "try"）或者说 前缀树 是一种树形数据结构，用于高效地存储和检索字符串数据集中的键。这一数据结构有相当多的应用情景，例如自动补全和拼写检查。

请你实现 Trie 类：

Trie() 初始化前缀树对象。
void insert(String word) 向前缀树中插入字符串 word 。
boolean search(String word) 如果字符串 word 在前缀树中，返回 true（即，在检索之前已经插入）；否则，返回 false 。
boolean startsWith(String prefix) 如果之前已经插入的字符串 word 的前缀之一为 prefix ，返回 true ；否则，返回 false 。
 

示例：

输入
["Trie", "insert", "search", "search", "startsWith", "insert", "search"]
[[], ["apple"], ["apple"], ["app"], ["app"], ["app"], ["app"]]
输出
[null, null, true, false, true, null, true]

解释
Trie trie = new Trie();
trie.insert("apple");
trie.search("apple");   // 返回 True
trie.search("app");     // 返回 False
trie.startsWith("app"); // 返回 True
trie.insert("app");
trie.search("app");     // 返回 True
 

提示：

1 <= word.length, prefix.length <= 2000
word 和 prefix 仅由小写英文字母组成
insert、search 和 startsWith 调用次数 总计 不超过 3 * 10^4 次



# v1-基本思路

## 思路

我们不考虑任何技巧，直接 Hash

## 实现

```java
class Trie {

    // 幽默解法
    private Set<String> wordSet = new HashSet<>();

    public Trie() {
        
    }
    
    public void insert(String word) {
        wordSet.add(word);
    }
    
    public boolean search(String word) {
        return wordSet.contains(word);
    }
    
    public boolean startsWith(String prefix) {
        for(String word: wordSet) {
            if(word.startsWith(prefix)) {
                return true;
            }
        }
        return false;
    }
}
```

## 效果

339ms 击败 5.00%

# v2-prefixSet

## 思路

我们 startWith 慢， 有没有办法改进呢？

有的，我们加一个 prefixSet

## 实现

```java
class Trie {

    // 幽默解法
    private Set<String> wordSet = new HashSet<>();
    private Set<String> prefixSet = new HashSet<>();

    public Trie() {
        
    }
    
    public void insert(String word) {
        wordSet.add(word);

        // 插入所有的前缀
        StringBuilder stringBuilder = new StringBuilder();
        for(int i = 0; i < word.length(); i++) {
            stringBuilder.append(word.charAt(i));
            prefixSet.add(stringBuilder.toString());
        }

    }
    
    public boolean search(String word) {
        return wordSet.contains(word);
    }
    
    public boolean startsWith(String prefix) {
        return prefixSet.contains(prefix);
    }
}
```

## 效果

155 ms 击败 5.00%

## 反思

略快，但是插入变慢了。

# v3-二分+有序列表

## 思路

我们用二分查找一个有序的数组

## 实现

```java
class Trie {


    private List<String> words = new ArrayList<>();

    public void insert(String word) {
        int idx = Collections.binarySearch(words, word);
        if (idx < 0) idx = -idx - 1;
        words.add(idx, word);
    }

    public boolean search(String word) {
        int idx = Collections.binarySearch(words, word);
        return idx >= 0;
    }

    public boolean startsWith(String prefix) {
        String next = prefix.substring(0, prefix.length() - 1)
                + (char)(prefix.charAt(prefix.length() - 1) + 1);

        int startIdx = Collections.binarySearch(words, prefix);
        if (startIdx < 0) startIdx = -startIdx - 1;

        int endIdx = Collections.binarySearch(words, next);
        if (endIdx < 0) endIdx = -endIdx - 1;

        return startIdx < endIdx;
    }
    
}
```

## 效果

80ms 击败 5.57%

## 复杂度

search：O(log n)

startsWith：O(log n + k)，k 为前缀匹配数量


# v4-前缀树

## 思路

题目本来的意思，其实就是构建一个拥有 26 个子节点的 N 叉树

char 本身甚至不用保存，因为 child[] 数组下标就可以代表数字本身。

## 例子

比如单词：cat, car, dog, door。


```
(root)
  |
  ├─ c
  |   |
  |   └─ a
  |       |
  |       ├─ t*  (cat)
  |       |
  |       └─ r*  (car)
  |
  └─ d
      |
      └─ o
          |
          ├─ g*  (dog)
          |
          └─ o
              |
              └─ r*  (door)
```


## 实现

```java
class TrieNode {
    TrieNode[] children = new TrieNode[26];
    boolean isEnd;
}

class Trie {
    private TrieNode root;

    public Trie() {
        root = new TrieNode();
    }

    public void insert(String word) {
        TrieNode node = root;
        char[] chars = word.toCharArray();
        for(char c : chars) {
            // 不存在？
            if(node.children[c-'a'] == null) {
                node.children[c-'a'] =  new TrieNode();
            } 
            node = node.children[c-'a'];
        }
        node.isEnd = true;
    }

    public boolean search(String word) {
        TrieNode node = find(word);
        return node != null && node.isEnd;
    }

    public boolean startsWith(String prefix) {
        return find(prefix) != null;
    }

    private TrieNode find(String word) {
        TrieNode node = root;
        char[] chars = word.toCharArray();
        for(char c : chars) {
            // 不存在？
            if(node.children[c-'a'] == null) {
                return null;
            } 
            node = node.children[c-'a'];
        }
        
        return node;
    }

}
```

## 效果

32ms 击败 90.33%

## 反思

实现起来不难，而且 find 和 插入过程类似。

* any list
{:toc}