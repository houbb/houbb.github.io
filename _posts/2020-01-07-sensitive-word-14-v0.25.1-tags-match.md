---
layout: post
title: 敏感词 v0.25.1 新特性之返回匹配词，修正 tags 标签
date:  2020-1-7 10:09:32 +0800
categories: [Java]
tags: [tree, data-struct, github, sensitive, sf]
published: true
---


# 开源项目

> [敏感词核心 https://github.com/houbb/sensitive-word](https://github.com/houbb/sensitive-word)

> [敏感词控台 https://github.com/houbb/sensitive-word-admin](https://github.com/houbb/sensitive-word-admin)

# 版本特性

大家好，我是老马。

敏感词以前在实现的时候，没有返回底层实际匹配的词，有时候问题排查非常耗费时间。

同时如果使用了一些字符的转换+跳过等，得到了一个匹配词，和定义的匹配词之间不同可能会比较奇怪。

所以 v0.25.1，

# 问题场景

> [issues/105](https://github.com/houbb/sensitive-word/issues/105)

```java
 final String text = "你好敏#!@感$!@词";
    List<WordTagsDto> wordList = wordBs.findAll(text, WordResultHandlers.wordTags());
[WordTagsDto{word='敏#!@感$!@词', tags=null}]

    final String text = "你好敏感词";
    List<WordTagsDto> wordList = wordBs.findAll(text, WordResultHandlers.wordTags());
[WordTagsDto{word='敏感词', tags=[0]}]
```

## PR 111

当然，有小伙伴提交 PR 来解决这个问题

> [pull/111](https://github.com/houbb/sensitive-word/pull/111/files)

但是实际上考虑的场景还是缺失了。


## 根本原因是什么

最根本的原因在于我们命中了一个词，但是以前只返回命中的文本，比如【敏#!@感$!@词】，但是我们只给【敏感词】定义标签。

如果想穷尽各种匹配后的枚举值，显然是不合理的。

所以我们需要知道匹配的黑名单词到底是什么。

# 解决方案

## 黑名单命中词

知道了这个述求，我们在原来的黑名单词处理时，额外返回对应的底层命中词。

## 内置 tags 调整

```java
public class WordResultHandlerWordTags extends AbstractWordResultHandler<WordTagsDto> {

    @Override
    protected WordTagsDto doHandle(IWordResult wordResult, IWordContext wordContext, String originalText) {
        WordTagsDto dto = new WordTagsDto();

        // 截取
        String word = InnerWordCharUtils.getString(originalText.toCharArray(), wordResult);

        // 获取 tags (使用清理后的单词查找标签)
        Set<String> wordTags = InnerWordTagUtils.tags(word, wordContext);

        // 如果为空，则尝试使用命中的敏感词匹配 v0.25.1 bug105
        if(CollectionUtil.isEmpty(wordTags)) {
            wordTags = InnerWordTagUtils.tags(wordResult.word(), wordContext);
        }

        dto.setWord(word);
        dto.setTags(wordTags);

        return dto;
    }

}
```

为了让结果更加符合直觉，我们最初依然使用匹配的 word 去查看 tags。

如果没有，再用底层命中的黑名单去查询。

## 测试效果

`敏感词` 为底层实际的黑名单。

`敏---感---词` 为忽略字符后命中的返回文本。

```java
@Test
public void testNoiseCharacterInTaggedWords() {
        Map<String, Set<String>> newHashMap = new HashMap<>();
        newHashMap.put("敏感词", new HashSet<>(Arrays.asList("政治", "领导人")));
        // 配置同时启用字符忽略和标签的实例
        SensitiveWordBs ignoreAndTagWordBs = SensitiveWordBs.newInstance()
                        .charIgnore(SensitiveWordCharIgnores.specialChars()) // 启用字符忽略
                        .wordTag(WordTags.map(newHashMap))
                        .init();

        // 包含噪音字符的敏感词文本
        final String noisyText = "你好敏---感---词";
        // 测试同时启用字符忽略和标签的实例（修复前会失败）
        List<WordTagsDto> fixedWord = ignoreAndTagWordBs.findAll(noisyText, WordResultHandlers.wordTags());
        Assert.assertEquals(1, fixedWord.size());
        Assert.assertEquals("敏---感---词", fixedWord.get(0).getWord());
        Assert.assertNotNull("标签不应为空", fixedWord.get(0).getTags());
        Assert.assertTrue("应包含'政治'标签", fixedWord.get(0).getTags().contains("政治"));
        Assert.assertTrue("应包含'领导人'标签", fixedWord.get(0).getTags().contains("领导人"));
}
```

# 小结

希望本文对你有所帮助，如果喜欢，欢迎点赞收藏转发一波。

我是老马，期待与你的下次相遇。

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

[v0.23.0 敏感词新特性之结果条件拓展，内置支持链式+单词标签](https://houbb.github.io/2020/01/07/sensitive-word-13-v0.23.0-result-condition-enhance)

[v0.24.0 新特性支持标签分类，内置实现多种策略](https://houbb.github.io/2020/01/07/sensitive-word-13-v0.24.0-word-tag-impl)

![view](https://img-blog.csdnimg.cn/direct/f8a37602c4ea40cb8eca06978ada1cd1.jpeg#pic_center)

* any list
{:toc}