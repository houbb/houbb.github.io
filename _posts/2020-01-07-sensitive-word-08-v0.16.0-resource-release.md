---
layout: post
title: sensitive-word 敏感词 v0.16.1 新特性之字典内存资源释放 
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

![view](https://img-blog.csdnimg.cn/direct/f8a37602c4ea40cb8eca06978ada1cd1.jpeg#pic_center)

# 业务背景

提出需求的为一位安卓开发小哥。

不同模块需要不同的过滤逻辑，比如D建相关需要的敏感词就会多点，其他地方可能不要那么多过滤，看了下标签应该满足不了。

所以希望不再使用时，释放掉对应的字典等内存资源。

> [https://github.com/houbb/sensitive-word/issues/53](https://github.com/houbb/sensitive-word/issues/53)

# 字典资源的释放

## 说明

支持版本：v0.16.1

我们在初始化引导类之后，如果不再使用，可以直接调用 destroy 释放掉字典资源。

## 释放方式

```java
SensitiveWordBs wordBs = SensitiveWordBs.newInstance()
                .init();

// 后续因为一些原因移除了对应信息，希望释放内存。
wordBs.destroy();
```

# 小结

一般 java web 后端不太有这种需求，但是安卓开发遇到几个都是希望把对应的内存资源释放掉。

## 开源代码

> [敏感词 https://github.com/houbb/sensitive-word](https://github.com/houbb/sensitive-word)

> [敏感词 https://github.com/houbb/sensitive-word-admin](https://github.com/houbb/sensitive-word-admin)

* any list
{:toc}