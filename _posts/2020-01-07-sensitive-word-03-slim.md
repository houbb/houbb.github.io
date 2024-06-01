---
layout: post
title: java sensitive-word 敏感词之字典瘦身
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

## 格式统一化

1. 将所有的大写字母统一转换为小写

2. 将所有的全角转换为半角

3. 移除所有【空格】【符号】(这个就是各种符号的过滤了)

4. 繁体字统一转换为简体字

最后保证信息的去重。

## 移除大量的信息

1. 移除 QQ 号的类似数字

2. 移除所有网址（.com、cn、.org）

3. 移除纯英文

4. 移除乱码 `�`

备份相关信息。

## 停止词优化

移除文中的纯数字。

比如

```
12 岁
13 岁
14 岁
15 岁
```

只是数字的不同，最后的结果也可以同化为一个。

## 拼音优化

比如伊拉克

ylk

yilake

这些都可以直接规为一个中文即可。

## 数字优化

123456789

一二三四五六七

其他各种标记都可以归一为相同的。

## 词语翻转

比如：毒品=》【品毒】

这个对于 DFA 算法而言可能不那么友好。

最后可以考虑实现，或者在构建的时候就直接构建。

拼音同理。

## 重复词语

比如 fffuuuccckkk

# v0.0.3 效果

第一步将数字从 18W 降低到 6w

后续将对数字类的进行优化处理。

## 数据下载

[原始全量.txt](https://github.com/houbb/sensitive-word/releases/download/dict_slim/dict.txt)

[格式化去重.txt](https://github.com/houbb/sensitive-word/releases/download/dict_slim/dict_format.txt)

[移除优化.txt](https://github.com/houbb/sensitive-word/releases/download/dict_slim/dict_remove.txt)

## 下一步优化方案

基于数字的转换去重

# 数字相关优化

## 纯数字

### 映射关系

```java
private static final String NUM_ONE = "⓪０零º₀⓿○" +
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
            "㊀㊁㊂㊃㊄㊅㊆㊇㊈" +
            "ⅰⅱⅲⅳⅴⅵⅶⅷⅸ" +
            "ⅠⅡⅢⅣⅤⅥⅦⅧⅨ";

private static final String NUM_TWO = "0000000"+
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
        "123456789" +
        "123456789" +
        "123456789";
```

### 例子

常见的例子，如下：

```
155否132与7935
156九九一一05三七
157加2456加617
15②00⑧0③60⑧
15⑵00⑧0③⑹0⑧
```

这里涉及到中文的停顿词语，下个版本解决。

加、否、与、和

较为花哨的隔断词：

```
4字9不6要的5字9不2要1的9字不要5的
4个苹果9个苹果8个苹果q8个苹果2个苹果5个e苹果5个g苹果5个苹y果4个苹果a
koukou24i43巴巴263
kou聊i9i44巴巴久8o
qq③③②①④⑥⑧②③
qq⒈8⑤9⒋о8⒐8嶶ィ讠мрìn8⒏⑧8⒏⑧
w⑥③①⑨⑧⑥⑥③
w信36198046
```

- 谐音的

```
24i43巴巴263
24o865伞2伞4
28i449武26武
322伞4674思伞
322伞思674思伞
3i5酒225i8
3i932酒oii
3罒罒2ψψ8ヽノ47ĺ̯幺幺九零七
13797020693室
```

- 象形的

其中 o 对应的是0

- 比较神奇的

```
2⃣️1⃣️2⃣️9⃣️7⃣️3⃣️6⃣️2⃣️3⃣️
```

看的出来，这里用了很多的套路。

## 英文

感觉国内英文各种花里胡哨的很少。

ps: 当然某种程度而言，是我把纯英文全部移除导致的问题。

```java
private static final String LETTERS_ONE =
        "ⒶⒷⒸⒹⒺⒻⒼⒽⒾⒿⓀⓁⓂⓃⓄⓅⓆⓇⓈⓉⓊⓋⓌⓍⓎⓏ" +
                "ⓐⓑⓒⓓⓔⓕⓖⓗⓘⓙⓚⓛⓜⓝⓞⓟⓠⓡⓢⓣⓤⓥⓦⓧⓨⓩ" +
                "⒜⒝⒞⒟⒠⒡⒢⒣⒤⒥⒦⒧⒨⒩⒪⒫⒬⒭⒮⒯⒰⒱⒲⒳⒴⒵";
private static final String LETTERS_TWO =
        "ABCDEFGHIJKLMNOPQRSTUVWXYZ" +
                "abcdefghijklmnopqrstuvwxyz" +
                "abcdefghijklmnopqrstuvwxyz";
```


* any list
{:toc}