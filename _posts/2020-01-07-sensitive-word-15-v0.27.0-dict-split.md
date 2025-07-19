---
layout: post
title: 敏感词 v0.27.0 新特性之敏感词库独立拆分
date:  2020-1-7 10:09:32 +0800
categories: [Java]
tags: [tree, data-struct, github, sensitive, sf]
published: true
---

# 创作背景

大家好，我是老马。

敏感词初期在实现的时候，为了用户开箱即用将词库与核心算法库放在一起。

有一些用户希望只用自己的词库，于是内置了各种自定义的策略方法。

但是还是不够，比如有些 andriod 研发希望内置包的信息是干净的，不要有任何敏感信息。

为了保障开箱即用+支持将文件排除，我们在将敏感词库独立为另外一个项目。

# 系统内置词库及如何排除

## 内置词库文件说明

v0.27.0 将词库和当前项目拆分开，词库可以在 [https://github.com/houbb/sensitive-word-data](https://github.com/houbb/sensitive-word-data) 项目查看。

对应的资源文件在 [https://github.com/houbb/sensitive-word-data/tree/main/src/main/resources](https://github.com/houbb/sensitive-word-data/tree/main/src/main/resources) 目录下

| 文件                           | 说明         | 默认加载类              
|:-----------------------------|:-----------|:-------------------|
| `sensitive_word_allow.txt`   | 内置自定义白名单词库 | `WordAllowSystem`  |
| `sensitive_word_deny.txt`    | 内置自定义黑名单词库 |  `WordDenySystem`                  |
| `sensitive_word_dict.txt`    | 内置黑名单词库    |   `WordDenySystem`                 |
| `sensitive_word_dict_en.txt` | 内置黑名单英文词库  |   `WordDenySystem`                 |
| `sensitive_word_tags.txt`    | 内置敏感词标签词库  |   `WordTagSystem`                 |

## 如何排除

比如一些 android app 引入时不希望包中内置敏感的信息，希望对词库加解密或者是放在服务端初始化加载。

系统的内置词库通过下面的 maven 依赖导入

```xml
<dependency>
    <groupId>com.github.houbb</groupId>
    <artifactId>sensitive-word-data</artifactId>
    <version>${sensitive-word-data.version}</version>
</dependency>
```

### 依赖排除

所以可以按照 maven 排除规范，如下将其排除

```xml
<dependency>
    <groupId>com.github.houbb</groupId>
    <artifactId>sensitive-word</artifactId>
    <version>${sensitive-word.version}</version>
    <exclusions>
        <exclusion>
            <groupId>com.github.houbb</groupId>
            <artifactId>sensitive-word-data</artifactId>
        </exclusion>
    </exclusions>
</dependency>
```

## 排除后自定义

不希望使用内置词库，那就需要将原来内置的词库依赖改为自己的依赖

默认配置项：

```java
SensitiveWordBs sensitiveWordBs = SensitiveWordBs.newInstance()
                .wordAllow(WordAllows.defaults())
                .wordDeny(WordDenys.defaults())
                .wordTag(WordTags.defaults())
                .init();
```

你可以将用到的这3个配置，改为自己的实现。

可以通过加解密，或者加载远程服务的文件信息都可以。

# 开源项目

> [敏感词核心 https://github.com/houbb/sensitive-word](https://github.com/houbb/sensitive-word)

> [敏感词控台 https://github.com/houbb/sensitive-word-admin](https://github.com/houbb/sensitive-word-admin)

> [敏感词词库 https://github.com/houbb/sensitive-word-dict](https://github.com/houbb/sensitive-word-dict)

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

[v0.25.0 新特性之 wordCheck 策略支持用户自定义](https://houbb.github.io/2020/01/07/sensitive-word-14-v0.25.0-url-define)

[v0.25.1 新特性之返回匹配词，修正 tags 标签](https://houbb.github.io/2020/01/07/sensitive-word-14-v0.25.1-tags-match)

[v0.27.0 敏感词库独立拆分](https://houbb.github.io/2020/01/07/sensitive-word-15-v0.27.0-dict-split)

![view](https://img-blog.csdnimg.cn/direct/f8a37602c4ea40cb8eca06978ada1cd1.jpeg#pic_center)

* any list
{:toc}