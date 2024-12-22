---
layout: post
title:  单词拼写纠正-05-2452.力扣 距离字典两次编辑距离以内的单词
date:  2020-1-20 10:09:32 +0800
categories: [Data-Struct]
tags: [edit-distance, chinese, nlp, algorithm, sh]
published: true
---

# 拼写纠正系列

[NLP 中文拼写检测实现思路](https://houbb.github.io/2020/01/20/nlp-chinese-spelling-correct-01-intro)

[NLP 中文拼写检测纠正算法整理](https://houbb.github.io/2020/01/20/nlp-chinese-spelling-correct-02)

[NLP 英文拼写算法，如果提升 100W 倍的性能？](https://houbb.github.io/2020/01/20/nlp-chinese-spelling-correct-03-100w-faster)

[NLP 中文拼写检测纠正 Paper](https://houbb.github.io/2020/01/20/nlp-chinese-spelling-correct-paper)

[java 实现中英文拼写检查和错误纠正？可我只会写 CRUD 啊！](https://houbb.github.io/2020/01/20/nlp-chinese-word-checker-01-intro)

[一个提升英文单词拼写检测性能 1000 倍的算法？](https://houbb.github.io/2020/01/20/nlp-chinese-word-checker-02-1000x)

[单词拼写纠正-03-leetcode edit-distance 72.力扣编辑距离](https://houbb.github.io/2020/01/20/nlp-chinese-word-checker-03-edit-distance-intro)

## 开源项目

[nlp-hanzi-similar 汉字相似度](https://github.com/houbb/nlp-hanzi-similar)

[word-checker 拼写检测](https://github.com/houbb/word-checker)

[sensitive-word 敏感词](https://github.com/houbb/sensitive-word)

# 题目

给你两个字符串数组 queries 和 dictionary 。

数组中所有单词都只包含小写英文字母，且长度都相同。

一次 编辑 中，你可以从 queries 中选择一个单词，将任意一个字母修改成任何其他字母。

从 queries 中找到所有满足以下条件的字符串：不超过 两次编辑内，字符串与 dictionary 中某个字符串相同。

请你返回 queries 中的单词列表，这些单词距离 dictionary 中的单词 编辑次数 不超过 两次 。

单词返回的顺序需要与 queries 中原本顺序相同。

示例 1：

```
输入：queries = ["word","note","ants","wood"], dictionary = ["wood","joke","moat"]
输出：["word","note","wood"]
解释：
- 将 "word" 中的 'r' 换成 'o' ，得到 dictionary 中的单词 "wood" 。
- 将 "note" 中的 'n' 换成 'j' 且将 't' 换成 'k' ，得到 "joke" 。
- "ants" 需要超过 2 次编辑才能得到 dictionary 中的单词。
- "wood" 不需要修改（0 次编辑），就得到 dictionary 中相同的单词。
所以我们返回 ["word","note","wood"] 。
```

示例 2：

```
输入：queries = ["yes"], dictionary = ["not"]
输出：[]
解释：
"yes" 需要超过 2 次编辑才能得到 "not" 。
所以我们返回空数组。
```


提示：

1 <= queries.length, dictionary.length <= 100

n == queries[i].length == dictionary[j].length

1 <= n <= 100

所有 queries[i] 和 dictionary[j] 都只包含小写英文字母。

## 方法模板

```java
public List<String> twoEditWords(String[] queries, String[] dictionary) {
    //...
}
```

# v1-暴力算法

## 思路

我们不做任何优化，首先实现判断一个单词是否可以通过 2 次编辑调整为结果中的值。

这一题其实题目的难度进行了一定长度的降低。

可以参考 T161 和 T72，是 T161 的简化版本，因为我们只需要考虑替换的场景。

## 核心思路

这里只允许 replace，所以长度必须相同。

然后遍历，发现不同的长度为小于等于 2 即可。

## 实现

```java
public List<String> twoEditWords(String[] queries, String[] dictionary) {
    List<String> list = new ArrayList<>();
    for(String query : queries) {
        if(isTwoEditWords(query, dictionary)) {
            list.add(query);
        }
    }
    return list;
}

private boolean isTwoEditWords(final String query,
                               String[] dictionary) {
    for(String dict : dictionary) {
        if(isTwoEditWords(query, dict)) {
            return true;
        }
    }
    return false;
}

private boolean isTwoEditWords(String word, String dict) {
    if(word.length() != dict.length()) {
        return false;
    }
    int differCount = 0;
    char[] ss = word.toCharArray();
    char[] ts = dict.toCharArray();
    for(int i = 0; i < ss.length; i++) {
        if(ss[i] != ts[i]) {
            differCount++;
        }
    }
    return differCount <= 2;
}
```

## 效果

17ms 击败 8.70%

# v2-改进版本

## 思路

针对两个单词的判断，加一个快速失败。

## 实现

```java
private boolean isTwoEditWords(String word, String dict) {
    if(word.length() != dict.length()) {
        return false;
    }
    int differCount = 0;
    char[] ss = word.toCharArray();
    char[] ts = dict.toCharArray();
    for(int i = 0; i < ss.length; i++) {
        if(ss[i] != ts[i]) {
            differCount++;
        }
        if(differCount > 2) {
            return false;
        }
    }
    return true;
}
```

## 效果

10ms 击败34.78%


# 小结

看了一下这一题的测试用例设计不是很长，所以区分度不高。

排名比较高的也是这个算法，暂时不做深入研究。

这一题个人理解其实可以作为 T72 的铺垫，因为比 T72 简单多了。

我是老马，期待与你的下次重逢。

# 开源项目

单词拼写对应的开源项目如下，欢迎 fork + star!

[https://github.com/houbb/word-checker](https://github.com/houbb/word-checker)

# 参考资料

[edit-distance-1.html](https://nlp.stanford.edu/IR-book/html/htmledition/edit-distance-1.html)

[Peter Norvig: How to Write a Spelling Corrector.](http://norvig.com/spell-correct.html)

* any list
{:toc}