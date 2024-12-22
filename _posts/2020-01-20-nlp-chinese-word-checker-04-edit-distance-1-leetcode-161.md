---
layout: post
title:  单词拼写纠正-04-161.力扣 相隔为 1 的编辑距离 
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

给定两个字符串 s 和 t ，如果它们的编辑距离为 1 ，则返回 true ，否则返回 false 。

字符串 s 和字符串 t 之间满足编辑距离等于 1 有三种可能的情形：

- 往 s 中插入 恰好一个 字符得到 t

- 从 s 中删除 恰好一个 字符得到 t

- 在 s 中用 一个不同的字符 替换 恰好一个 字符得到 t
 
示例 1：

输入: s = "ab", t = "acb"
输出: true
解释: 可以将 'c' 插入字符串 s 来得到 t。
示例 2:

输入: s = "cab", t = "ad"
输出: false
解释: 无法通过 1 步操作使 s 变为 t。
 

提示:

0 <= s.length, t.length <= 104
s 和 t 由小写字母，大写字母和数字组成


## 方法模板

```java
public boolean isOneEditDistance(String s, String t) {
    // 模板        
}
```

# 基本思路

## 思路
拆分为3个场景：

1. 如果二者长度差大于1，直接不可能

2. 如果二者长度相同，那么只能有一个差异，则可以通过 replace 来实现。

3. 如果长度差为1，那么可以通过 delete/insert 来实现。

可以简化为，通过长的-1来实现。

具体方法是，比较 s 和 t，找到第一个不同的字符后，跳过其中一个字符，继续比较剩下的部分。如果剩下的部分相等，则返回 true，否则返回 false。


## 实现

```java
    public static boolean isOneEditDistance(String s, String t) {
        // 模板
        int sLen = s.length();
        int tLen = t.length();

        if(Math.abs(sLen - tLen) > 1) {
            return false;
        }

        // 如果长度相同
        char[] sChars = s.toCharArray();
        char[] tChars = t.toCharArray();
        if(sLen == tLen) {
            int diffCount = 0;
            for(int i = 0; i < sLen; i++) {
                if(sChars[i] != tChars[i]) {
                    diffCount++;
                }
            }

            return diffCount == 1;
        }

        // 如果长度差为 1，检查是否能通过插入或删除一个字符使两个字符串相等
        if (s.length() > t.length()) {
            // 确保 s 是较短的字符串
            String temp = s;
            s = t;
            t = temp;
        }
        // 尝试在 s 中插入一个字符变成 t
        for (int i = 0; i < s.length(); i++) {
            if (s.charAt(i) != t.charAt(i)) {
                // 跳过 t 中当前字符，继续比较
                return s.substring(i).equals(t.substring(i + 1));
            }
        }
        // 如果 s 完全是 t 的前缀，说明只差一个字符
        return s.length() + 1 == t.length();
    }    
```

# 小结

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