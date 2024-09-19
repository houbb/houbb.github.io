---
layout: post
title: sensitive-word 敏感词 v0.19.0 新特性之敏感词单个编辑，不必重复初始化
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

[v0.16.1-敏感词新特性之字典内存资源释放](https://mp.weixin.qq.com/s/zbeJR-OkWjxashtjiopnMA)

[v0.19.0-敏感词新特性之敏感词单个编辑，不必重复初始化](https://houbb.github.io/2020/01/07/sensitive-word-10-v0.19.0-deny-word-edit)

[v0.20.0 敏感词新特性之数字全部匹配，而不是部分匹配](https://houbb.github.io/2020/01/07/sensitive-word-11-v0.20.0-num-match)

[v0.21.0 敏感词新特性之白名单支持单个编辑，修正白名单包含黑名单时的问题](https://houbb.github.io/2020/01/07/sensitive-word-12-v0.21.0-allow-word-edit)

![view](https://img-blog.csdnimg.cn/direct/f8a37602c4ea40cb8eca06978ada1cd1.jpeg#pic_center)

# 业务背景

[功能]建议增加敏感词的单个增删改，避免重复初始化，提升效率。

## 针对单个黑名单词的新增/删除，无需全量初始化

使用场景：在初始化之后，我们希望针对单个词的新增/删除，而不是完全重新初始化。这个特性就是为此准备的。

支持版本：v0.19.0

## 方法说明 

SensitiveWordBs 引导类新增如下 2 个方法：

`addWord(word)` 新增敏感词，支持单个词/集合

`removeWord(word)` 删除敏感词，支持单个词/集合

## 实例代码：

### maven 引入

```xml
<dependency>
    <groupId>com.github.houbb</groupId>
    <artifactId>sensitive-word</artifactId>
    <version>0.19.0</version>
</dependency>
```

### 测试代码

```java
final String text = "测试一下新增敏感词，验证一下删除和新增对不对";

SensitiveWordBs sensitiveWordBs =
SensitiveWordBs.newInstance()
        .wordAllow(WordAllows.empty())
        .wordDeny(WordDenys.empty())
        .init();

// 当前
Assert.assertEquals("[]", sensitiveWordBs.findAll(text).toString());

// 新增单个
sensitiveWordBs.addWord("测试");
sensitiveWordBs.addWord("新增");
Assert.assertEquals("[测试, 新增, 新增]", sensitiveWordBs.findAll(text).toString());

// 删除单个
sensitiveWordBs.removeWord("新增");
Assert.assertEquals("[测试]", sensitiveWordBs.findAll(text).toString());
sensitiveWordBs.removeWord("测试");
Assert.assertEquals("[]", sensitiveWordBs.findAll(text).toString());

// 新增集合
sensitiveWordBs.addWord(Arrays.asList("新增", "测试"));
Assert.assertEquals("[测试, 新增, 新增]", sensitiveWordBs.findAll(text).toString());
// 删除集合
sensitiveWordBs.removeWord(Arrays.asList("新增", "测试"));
Assert.assertEquals("[]", sensitiveWordBs.findAll(text).toString());

// 新增数组
sensitiveWordBs.addWord("新增", "测试");
Assert.assertEquals("[测试, 新增, 新增]", sensitiveWordBs.findAll(text).toString());
// 删除集合
sensitiveWordBs.removeWord("新增", "测试");
Assert.assertEquals("[]", sensitiveWordBs.findAll(text).toString());
```

# 小结

单个敏感词的调整可以大幅度提升性能，降低使用成本。

## 开源代码

> [敏感词 https://github.com/houbb/sensitive-word](https://github.com/houbb/sensitive-word)

> [敏感词 https://github.com/houbb/sensitive-word-admin](https://github.com/houbb/sensitive-word-admin)

* any list
{:toc}