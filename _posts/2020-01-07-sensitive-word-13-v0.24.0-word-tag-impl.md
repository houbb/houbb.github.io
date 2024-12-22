---
layout: post
title: 敏感词 v0.24.0 新特性支持标签分类，内置实现多种策略
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

敏感词标签分类一直是大家比较想要的一个功能特性，v0.24.0 了开始内置支持标签分类，同时实现了多种策略。

# 快速开始

## maven 引入

```xml
<dependency>
    <groupId>com.github.houbb</groupId>
    <artifactId>sensitive-word</artifactId>
    <version>0.24.0</version>
</dependency>
```

# 敏感词标签

## 说明

有时候我们希望对敏感词加一个分类标签：比如社情、暴/力等等。

这样后续可以按照标签等进行更多特性操作，比如只处理某一类的标签。

主要特性支持版本：v0.24.0

## 标签接口

这里只是一个抽象的接口，用户可以自行定义实现。比如从数据库查询、文件读取、api 调用等。

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

## 内置实现

### 方法列表

为了方便大部分情况使用，内置实现一些场景策略在 `WordTags` 类中

| 实现方法                                                              | 说明                   | 备注         |
|:------------------------------------------------------------------|:---------------------|:-----------|
| none()                                                            | 空实现                  | v0.10.0 支持 |
| file(String filePath)                                             | 指定文件路径               | v0.10.0 支持 |
| file(String filePath, String wordSplit, String tagSplit)          | 指定文件路径，以及单词分隔符、标签分隔符 | v0.10.0 支持 |
| map(final Map<String, Set<String>> wordTagMap)                    | 根据 map初始化            | v0.24.0 支持 |
| lines(Collection<String> lines)                                   | 字符串列表                | v0.24.0 支持 |
| lines(Collection<String> lines, String wordSplit, String tagSpli) | 字符串列表，以及单词分隔符、标签分隔符  | v0.24.0 支持 |
| system()                                                          | 系件文件内置实现，整合网络分类      | v0.24.0 支持 |
| defaults()                                                        | 默认策略，目前为 system      | v0.24.0 支持 |
| chains(IWordTag... others)                 | 链式方法，支持用户整合实现多个策略    | v0.24.0 支持 |

### 格式约定

敏感词标签的格式我们默认约定如下 `敏感词 tag1,tag2`，代表这 `敏感词` 的标签为 tag1 和 tag2

比如 

```
五星红旗 政治,国家
```

所有的文件行内容，和指定的字符串行内容也建议用这种方式。如果不满足，自定义实现即可。

## 系统内置实现（默认效果）

v0.24.0 版本开始，默认的单词标签为 `WordTags.system()`。

说明：目前数据统计自网络，存在不少疏漏。也欢迎大家指正，持续改进中...

```java
SensitiveWordBs sensitiveWordBs = SensitiveWordBs.newInstance()
.wordTag(WordTags.system())
.init();
Set<String> tagSet = sensitiveWordBs.tags("博彩");
Assert.assertEquals("[3]", tagSet.toString());
```

这里为了压缩大小优化，对应的类别用数字表示。

数字的含义列表如下：

```
0 政治
1 毒品
2 色情
3 赌博
4 违法
```

## 文件入门例子

这里以文件为例子，演示一下如何使用。

```java
final String path = "~\\test\\resources\\dict_tag_test.txt";

// 演示默认方法
IWordTag wordTag = WordTags.file(path);
SensitiveWordBs sensitiveWordBs = SensitiveWordBs.newInstance()
        .wordTag(wordTag)
        .init();

Set<String> tagSet = sensitiveWordBs.tags("零售");
        Assert.assertEquals("[广告, 网络]", tagSet.toString());


// 演示指定分隔符
IWordTag wordTag2 = WordTags.file(path, " ", ",");
SensitiveWordBs sensitiveWordBs2 = SensitiveWordBs.newInstance()
        .wordTag(wordTag2)
        .init();
Set<String> tagSet2 = sensitiveWordBs2.tags("零售");
        Assert.assertEquals("[广告, 网络]", tagSet2.toString());
```

其中 `dict_tag_test.txt` 我们自定义的内容如下：

```
零售 广告,网络
```

## 单词标签和敏感词发现的联动

我们在获取敏感词的时候，是可以设置对应的结果处理策略，从而获取对应的敏感词标签信息

```java
// 自定义测试标签类
IWordTag wordTag = WordTags.lines(Arrays.asList("天安门 政治,国家,地址"));

// 指定初始化
SensitiveWordBs sensitiveWordBs = SensitiveWordBs.newInstance()
        .wordTag(wordTag)
        .init()
        ;

List<WordTagsDto> wordTagsDtoList1 = sensitiveWordBs.findAll("天安门", WordResultHandlers.wordTags());
Assert.assertEquals("[WordTagsDto{word='天安门', tags=[政治, 国家, 地址]}]", wordTagsDtoList1.toString());
```

我们自定义了 `天安门` 关键词的标签，然后通过指定 findAll 的结果处理策略为 `WordResultHandlers.wordTags()`，就可以在获取敏感词的同时，获取对应的标签列表。

## 单词标签与结果匹配联动

有时候我们可能希望对匹配的敏感词进一步限制，比如虽然我们定义了【av】作为敏感词，但是不希望【have】被匹配。

标签分类也可以和结果匹配联动。支持版本： `v0.23.0`

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