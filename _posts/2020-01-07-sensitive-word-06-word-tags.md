---
layout: post
title: v0.12.0-敏感词/脏词词标签能力进一步增强
date:  2020-1-7 10:09:32 +0800
categories: [Java]
tags: [tree, data-struct, github, sensitive, sf]
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

# 敏感词标签

## 说明

有时候我们希望对敏感词加一个分类标签：比如社情、暴/力等等。

这样后续可以按照标签等进行更多特性操作，比如只处理某一类的标签。

我们在 v0.10.0 版本，开始初步支持敏感词的标签分类，不过这个方法没有和以前的方法进行整合。

让我们先做一下回顾：

## 入门例子

### 接口

这里只是一个抽象的接口，用户可以自行定义实现。比如从数据库查询等。

```java
public interface IWordTag {

    /**
     * 查询标签列表
     * @param word 脏词
     * @return 结果
     */
    Set<String> getTag(String word);

}
```

### 配置文件

我们可以自定义 dict 标签文件，通过 WordTags.file() 创建一个 WordTag 实现。

- dict_tag_test.txt

```
五星红旗 政-治,国家
```

格式如下：

```
敏感词 tag1,tag2
```

### 实现

具体的效果如下，在引导类设置一下即可。

默认的 wordTag 是空的。

```java
String filePath = "dict_tag_test.txt";
IWordTag wordTag = WordTags.file(filePath);

SensitiveWordBs sensitiveWordBs = SensitiveWordBs.newInstance()
        .wordTag(wordTag)
        .init();

Assert.assertEquals("[政-治, 国家]", sensitiveWordBs.tags("五星红旗").toString());;
```

后续会考虑引入一个内置的标签文件策略。

# IWordResultHandler 结果处理类

## 功能说明

IWordResultHandler 可以对敏感词的结果进行处理，允许用户自定义。

内置实现目前有如下几种：

- WordResultHandlers.word()

只保留敏感词单词本身。

- WordResultHandlers.raw()

保留敏感词相关信息，包含敏感词的开始和结束下标。

- WordResultHandlers.wordTags()

同时保留单词，和对应的词标签信息。

## 使用实例

1）基本例子

```java
final String text = "五星红旗迎风飘扬，毛主席的画像屹立在天安门前。";

List<String> wordList = SensitiveWordHelper.findAll(text);
Assert.assertEquals("[五星红旗, 毛主席, 天安门]", wordList.toString());
List<String> wordList2 = SensitiveWordHelper.findAll(text, WordResultHandlers.word());
Assert.assertEquals("[五星红旗, 毛主席, 天安门]", wordList2.toString());

List<IWordResult> wordList3 = SensitiveWordHelper.findAll(text, WordResultHandlers.raw());
Assert.assertEquals("[WordResult{startIndex=0, endIndex=4}, WordResult{startIndex=9, endIndex=12}, WordResult{startIndex=18, endIndex=21}]", wordList3.toString());
```

2) wordTags 例子

我们在 `dict_tag_test.txt` 文件中指定对应词的标签信息。

比如：

```
五星红旗 政治,国家
毛主席 政治,国家,伟人
天安门 政治,国家,地址
```

使用方法如下：

```java
final String text = "五星红旗迎风飘扬，毛主席的画像屹立在天安门前。";

// 默认敏感词标签为空
List<WordTagsDto> wordList1 = SensitiveWordHelper.findAll(text, WordResultHandlers.wordTags());
Assert.assertEquals("[WordTagsDto{word='五星红旗', tags=[]}, WordTagsDto{word='毛主席', tags=[]}, WordTagsDto{word='天安门', tags=[]}]", wordList1.toString());

List<WordTagsDto> wordList2 = SensitiveWordBs.newInstance()
        .wordTag(WordTags.file("dict_tag_test.txt"))
        .init()
        .findAll(text, WordResultHandlers.wordTags());
Assert.assertEquals("[WordTagsDto{word='五星红旗', tags=[政治, 国家]}, WordTagsDto{word='毛主席', tags=[政治, 伟人, 国家]}, WordTagsDto{word='天安门', tags=[政治, 国家, 地址]}]", wordList2.toString());
```

这样就可以把此标签和我们以前的能力进行整合。

# 小结

敏感词标签的功能作用还是很大的，可以让我们根据不同的类别，进行不同的后续处理操作。

当然，最核心的还是对于标签数据的处理工作，具体可以参考：

> [v0.11.0-敏感词新特性：忽略无意义的字符，词标签](https://mp.weixin.qq.com/s/m40ZnR6YF6WgPrArUSZ_0g)

# 开源地址

为了便于大家学习，项目开源地址如下，欢迎 fork+star 鼓励一下老马~

> [sensitive-word](https://github.com/houbb/sensitive-word)

* any list
{:toc}