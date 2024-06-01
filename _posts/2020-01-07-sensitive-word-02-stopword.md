---
layout: post
title: sensitive-word 敏感词之 StopWord 停止词优化与特殊符号 
date:  2020-1-7 10:09:32 +0800
categories: [Java]
tags: [java, github, sensitive, sf]
published: true
---

# 敏感词系列

[sensitive-word-admin 敏感词控台 v1.2.0 版本开源](https://mp.weixin.qq.com/s/7wSy0PuJLTudEo9gTY5s5w)

[sensitive-word-admin v1.3.0 发布 如何支持分布式部署？](https://mp.weixin.qq.com/s/4wia8SlQQbLV5_OHplaWvg)

[01-开源敏感词工具入门使用](https://houbb.github.io/2020/01/07/sensitive-word-00-overview)

[02-如何实现一个敏感词工具？违禁词实现思路梳理](https://houbb.github.io/2020/01/07/sensitive-word-01-intro)

[03-敏感词之 StopWord 停止词优化与特殊符号](https://houbb.github.io/2020/01/07/sensitive-word-02-stopword)

[04-敏感词之字典瘦身](https://houbb.github.io/2020/01/07/sensitive-word-03-slim)

[05-敏感词之 DFA 算法(Trie Tree 算法)详解](https://houbb.github.io/2020/01/07/sensitive-word-04-dfa)

[06-敏感词(脏词) 如何忽略无意义的字符？达到更好的过滤效果](https://houbb.github.io/2020/01/07/sensitive-word-05-ignore-char)

[v0.10.0-脏词分类标签初步支持](https://juejin.cn/post/7308782855941292058?searchId=20231209140414C082B3CCF1E7B2316EF9)

[v0.11.0-敏感词新特性：忽略无意义的字符，词标签字典](https://mp.weixin.qq.com/s/m40ZnR6YF6WgPrArUSZ_0g)

[v0.12.0-敏感词/脏词词标签能力进一步增强](https://mp.weixin.qq.com/s/-wa-if7uAy2jWsZC13C0cQ)

[v0.13.0-敏感词特性版本发布 支持英文单词全词匹配](https://mp.weixin.qq.com/s/DXv5OUyOs0y2dAq8nFWJ9A)

# 开源地址

为了便于大家学习，项目开源地址如下，欢迎 fork+star 鼓励一下老马~

> [sensitive-word](https://github.com/houbb/sensitive-word)


# 背景

默认收集的敏感词字典，实际上有非常多的重复信息。

比如说：

```
兼职
兼!职
兼@职
兼#职
兼￥职
```

这种最核心的内容其实只有一个，如果将全部的停止词进行穷尽的话，将会使得敏感词构建的 Map 变得非常大，而且也没办法穷尽。

这种全部存储的方式非常的不灵活。

## 目的

所以这一节将停止词作为单独的内容，进行相关的处理。

核心目的如下：

（1）为敏感词库瘦身

（2）为后期 stop-word 支持做好准备工作。

# 优化思路

统一使用半角（默认的格式）处理。

## 停顿词的获取

1. 过滤出所有的中文。-zh

2. 持久化所有的符号 zchars 

3. 所有搜狗输入法对应的常见符号

停顿词可以不放在文件中，特殊符号直接定义为常亮即可，中文可以放在 txt 中。

特殊符号列表截断后直接放入进去，然后整体去重。

可以根据搜狗输入法，获取所有对应的信息。（常用的标点符号等等）

## 中文与符号的区分

- 中文

- 符号

初期主要使用的是符号相关。

## 停顿词中的数字独立出来

数字需要特殊处理。

数字提供一个类，单独处理。 （重要）

```java
public static String nums1 = "⓪０零º₀⓿○" +
        "１２３４５６７８９" +
        "一二三四五六七八九" +
        "壹贰叁肆伍陆柒捌玖" +
        "¹²³⁴⁵⁶⁷⁸⁹" +
        "₁₂₃₄₅₆₇₈₉" +
        "①②③④⑤⑥⑦⑧⑨" +
        "⑴⑵⑶⑷⑸⑹⑺⑻⑼" +
        "⒈⒉⒊⒋⒌⒍⒎⒏⒐" +
        "❶❷❸❹❺❻❼❽❾" +
        "➀➁➂➃➄➅➆➇➈" +
        "➊➋➌➍➎➏➐➑➒" +
        "㈠㈡㈢㈣㈤㈥㈦㈧㈨" +
        "⓵⓶⓷⓸⓹⓺⓻⓼⓽" +
        "㊀㊁㊂㊃㊄㊅㊆㊇㊈";

    public static String nums2 = "0000000"+
        "123456789" +
        "123456789" +
        "123456789" +
        "123456789" +
        "123456789" +
        "123456789" +
        "123456789" +
        "123456789" +
        "123456789" +
        "123456789" +
        "123456789" +
        "123456789" +
        "123456789" +
        "123456789" +
        "123456789" +
        "123456789" +
        "123456789" +
        "123456789" +
        "123456789";
```

## 对于敏感词库的简化

1. 清除所有停顿词（此处仅仅为特殊符号），第一次去重的结果

2. 移除所有纯数字

3. 移除所有纯网址

4. 移除乱码文字（编码错乱导致）

# 停止词获取

你可以直接下载对应的信息，后面会简单介绍整体的数据获取流程。

全量停止词是很多地方都可以下载的，我主要想通过其获取自己想要的停止词。

希望通过细化，便于后期使用。

## 获取全量

直接在 [stopword.txt](https://github.com/houbb/sensitive-word/releases/download/stopword_all/stopword.txt)

## 获取中文

直接编写代码，过滤出所有的中文，如下：

[stopword_zh.txt](https://github.com/houbb/sensitive-word/releases/download/stopword_all/stopword_zh.txt)

## 获取符号

# 参考资料

[ToolGood.Words](https://github.com/toolgood/ToolGood.Words)

[符号大全网站](http://www.fhdq.net/)

* any list
{:toc}