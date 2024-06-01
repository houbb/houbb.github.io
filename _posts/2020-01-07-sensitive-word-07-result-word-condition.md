---
layout: post
title: sensitive-word v0.13.1 特性版本发布 支持英文单词全词匹配
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

![view](https://img-blog.csdnimg.cn/direct/f8a37602c4ea40cb8eca06978ada1cd1.jpeg#pic_center)

# 业务背景

对于英文单词 Disburse 之类的，其中的 sb 字母会被替换，要怎么处理，能不能只有整个单词匹配的时候才替换。

# 针对匹配词进一步判断

## 说明

支持版本：v0.13.0

有时候我们可能希望对匹配的敏感词进一步限制，比如虽然我们定义了【av】作为敏感词，但是不希望【have】被匹配。

就可以自定义实现 wordResultCondition 接口，实现自己的策略。

系统内置的策略在 `WordResultConditions#alwaysTrue()` 恒为真，`WordResultConditions#englishWordMatch()` 则要求英文必须全词匹配。

## 入门例子

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

# 如何自定义自己的策略

可以参考 `WordResultConditions#englishWordMatch()` 实现类，只需要继承 AbstractWordResultCondition 实现对应的方法即可。

## 策略的定义

以 englishWordMatch 实现类为例：

```java
package com.github.houbb.sensitive.word.support.resultcondition;

import com.github.houbb.heaven.util.lang.CharUtil;
import com.github.houbb.heaven.util.util.CharsetUtil;
import com.github.houbb.sensitive.word.api.IWordContext;
import com.github.houbb.sensitive.word.api.IWordResult;
import com.github.houbb.sensitive.word.constant.enums.WordValidModeEnum;

/**
 * 英文单词必须要全词匹配
 *
 * https://github.com/houbb/sensitive-word/issues/45
 *
 * @since 0.13.0
 */
public class WordResultConditionEnglishWordMatch extends AbstractWordResultCondition {

    @Override
    protected boolean doMatch(IWordResult wordResult, String text, WordValidModeEnum modeEnum, IWordContext context) {
        final int startIndex = wordResult.startIndex();
        final int endIndex = wordResult.endIndex();
        // 判断当前是否为英文单词
        for(int i = startIndex; i < endIndex; i++) {
            char c = text.charAt(i);
            if(!CharUtil.isEnglish(c)) {
                return true;
            }
        }

        // 判断处理，判断前一个字符是否为英文。如果是，则不满足
        if(startIndex > 0) {
            char preC = text.charAt(startIndex-1);
            if(CharUtil.isEnglish(preC)) {
                return false;
            }
        }

        // 判断后一个字符是否为英文
        if(endIndex < text.length() - 1) {
            char afterC = text.charAt(endIndex+1);
            if(CharUtil.isEnglish(afterC)) {
                return false;
            }
        }

        return true;
    }

}
```

## 策略的指定

然后用引导类指定我们的策略即可：

```java
List<String> wordList = SensitiveWordBs.newInstance()
        .wordResultCondition(new WordResultConditionEnglishWordMatch())
        .init()
        .findAll(text);
```

# 小结

实际应用的场景会被预想的复杂，所以此处设计为接口，内置一些常见的实现策略。

同时支持用户自定义拓展。

## 开源代码

> [敏感词 sensitive-word](https://github.com/houbb/sensitive-word)

> [敏感词控台 sensitive-word-admin](https://github.com/houbb/sensitive-word-admin)

* any list
{:toc}