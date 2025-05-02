---
layout: post
title: 敏感词 v0.25.0 新特性之 wordCheck 策略支持用户自定义
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

敏感词一开始了内置了多种检验策略，但是很多用户在使用的过程中希望可以自定义策略。

所以 v0.25.0 开始，支持用户对部分策略进行自定义实现。

# 快速开始

## maven 引入

```xml
<dependency>
    <groupId>com.github.houbb</groupId>
    <artifactId>sensitive-word</artifactId>
    <version>0.25.0</version>
</dependency>
```

## 配置说明

v0.25.0 目前的几个策略，也支持用户引导类自定义。

所有的策略都是接口，支持用户自定义实现，自己在 

| 序号 | 方法                   | 说明                                         | 默认值   |
|:---|:---------------------|:-------------------------------------------|:------|
| 16 | wordCheckNum          | 数字检测策略(v0.25.0开始支持)                        | `WordChecks.num()`   |
| 17 | wordCheckEmail          | 邮箱检测策略(v0.25.0开始支持)                        | `WordChecks.email()`   |
| 18 | wordCheckUrl          | URL检测策略(v0.25.0开始支持)，内置还是实现了 `urlNoPrefix()` | `(WordChecks.url()`   |
| 19 | wordCheckIpv4          | ipv4检测策略(v0.25.0开始支持)                      | `WordChecks.ipv4()`   |
| 20 | wordCheckWord          | 敏感词检测策略(v0.25.0开始支持)                       | `WordChecks.word()`   |

内置实现：

a) `WordChecks.urlNoPrefix()` 作为 url 的额外实现，可以不需要 `https://` 和 `http://` 前缀。 

## 自定义使用的例子

下面是一个简单使用自定义策略的例子

```java
final String text = "点击链接 https://www.baidu.com 查看答案，当然也可以是 baidu.com、www.baidu.com";
final SensitiveWordBs sensitiveWordBs = SensitiveWordBs.newInstance()
        .enableUrlCheck(true) // 启用URL检测
        .wordCheckUrl(WordChecks.urlNoPrefix()) //指定检测的方式
        .init();
List<String> wordList = sensitiveWordBs.findAll(text);
Assert.assertEquals("[www.baidu.com, baidu.com, www.baidu.com]", wordList.toString());
Assert.assertEquals("点击链接 https://************* 查看答案，当然也可以是 *********、*************", sensitiveWordBs.replace(text));
```

wordCheckUrl 可以指定对应的策略，如果不满足业务可以自己实现。

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