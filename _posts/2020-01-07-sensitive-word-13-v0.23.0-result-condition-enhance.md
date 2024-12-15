---
layout: post
title: sensitive-word 敏感词 v0.23.0 结果条件拓展，内置支持链式+单词标签
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


# 开源项目

> [敏感词核心 https://github.com/houbb/sensitive-word](https://github.com/houbb/sensitive-word)

> [敏感词控台 https://github.com/houbb/sensitive-word-admin](https://github.com/houbb/sensitive-word-admin)

# 版本特性

大家好，我是老马。

有时候我们得到敏感词以后，想要进一步处理。比如只关心某些标签的敏感词，要如何实现呢?

V0.23.0 针对结果处理做了进一步增强。

结果条件拓展内置支持 wordTags（单词标签） 和 chains（链式调用）。

# 快速开始

## maven 引入

```xml
<dependency>
    <groupId>com.github.houbb</groupId>
    <artifactId>sensitive-word</artifactId>
    <version>0.23.0</version>
</dependency>
```

# wordResultCondition-针对匹配词进一步判断

## 说明

支持版本：v0.13.0

有时候我们可能希望对匹配的敏感词进一步限制，比如虽然我们定义了【av】作为敏感词，但是不希望【have】被匹配。

就可以自定义实现 wordResultCondition 接口，实现自己的策略。

系统内置的策略在 `WordResultConditions#alwaysTrue()` 恒为真，`WordResultConditions#englishWordMatch()` 则要求英文必须全词匹配。

## 内置策略

WordResultConditions 工具类可以获取匹配策略

| 实现                                         | 说明                  | 支持版本    |
|:-------------------------------------------|:--------------------|:--------|
| alwaysTrue                                 | 恒为真                 |         |
| englishWordMatch                           | 英文单词全词匹配            | v0.13.0 |
| englishWordNumMatch                        | 英文单词/数字全词匹配         | v0.20.0 |
| wordTags                                   | 满足特定标签的，比如只关注【广告】标签 | v0.23.0 |
| chains(IWordResultCondition ...conditions) | 支持指定多个条件，同时满足       | v0.23.0 |

## 使用例子

原始的默认情况：

```java
final String text = "I have a nice day。";

List<String> wordList = SensitiveWordBs.newInstance()
        .wordDeny(new IWordDeny() {
            @Override
            public List<String> deny() {
                return Collections.singletonList("av");
            }
        })
        .wordResultCondition(WordResultConditions.alwaysTrue())
        .init()
        .findAll(text);
Assert.assertEquals("[av]", wordList.toString());
```

我们可以指定为英文必须全词匹配。

```java
final String text = "I have a nice day。";

List<String> wordList = SensitiveWordBs.newInstance()
        .wordDeny(new IWordDeny() {
            @Override
            public List<String> deny() {
                return Collections.singletonList("av");
            }
        })
        .wordResultCondition(WordResultConditions.englishWordMatch())
        .init()
        .findAll(text);
Assert.assertEquals("[]", wordList.toString());
```

当然可以根据需要实现更加复杂的策略。

## wordTags 单词标签

支持版本： `v0.23.0`

我们可以只返回隶属于某一种标签的敏感词。

我们指定了两个敏感词：商品、AV

MyWordTag 是我们定义的一个敏感词标签实现：

```java
/**
 * 自定义单词标签
 * @since 0.23.0
 */
public class MyWordTag extends AbstractWordTag {

    private static Map<String, Set<String>> dataMap;

    static {
        dataMap = new HashMap<>();
        dataMap.put("商品", buildSet("广告", "中文"));
        dataMap.put("AV", buildSet("色情", "单词", "英文"));
    }

    private static Set<String> buildSet(String... tags) {
        Set<String> set = new HashSet<>();
        for(String tag : tags) {
            set.add(tag);
        }
        return set;
    }

    @Override
    protected Set<String> doGetTag(String word) {
        return dataMap.get(word);
    }

}
```

测试用例如下，我们模拟了两个不同的实现类，每一个关注的单词标签不同。

```java
// 只关心SE情
SensitiveWordBs sensitiveWordBsYellow = SensitiveWordBs.newInstance()
        .wordDeny(new IWordDeny() {
            @Override
            public List<String> deny() {
                return Arrays.asList("商品", "AV");
            }
        })
        .wordAllow(WordAllows.empty())
        .wordTag(new MyWordTag())
        .wordResultCondition(WordResultConditions.wordTags(Arrays.asList("色情")))
        .init();

// 只关心广告
SensitiveWordBs sensitiveWordBsAd = SensitiveWordBs.newInstance()
        .wordDeny(new IWordDeny() {
            @Override
            public List<String> deny() {
                return Arrays.asList("商品", "AV");
            }
        })
        .wordAllow(WordAllows.empty())
        .wordTag(new MyWordTag())
        .wordResultCondition(WordResultConditions.wordTags(Arrays.asList("广告")))
        .init();

final String text = "这些 AV 商品什么价格？";
Assert.assertEquals("[AV]", sensitiveWordBsYellow.findAll(text).toString());
Assert.assertEquals("[商品]", sensitiveWordBsAd.findAll(text).toString());
```

# 小结

希望本文对你有所帮助，如果喜欢，欢迎点赞收藏转发一波。

我是老马，期待与你的下次相遇。

* any list
{:toc}