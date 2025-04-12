---
layout: post
title: 开源中文的繁简体转换 opencc4j-04-日文繁简体的支持
date:  2020-1-9 10:09:32 +0800
categories: [Search]
tags: [nlp, java, pinyin, sh]
published: true
---

# Opencc4j

[Opencc4j](https://github.com/houbb/opencc4j) 支持中文繁简体转换，考虑到词组级别。

[开源中文的繁简体转换 opencc4j-01-使用入门概览](https://houbb.github.io/2020/01/09/how-to-design-opencc4j-01-overview)

[开源中文的繁简体转换 opencc4j-02-一个汉字竟然对应两个 char？](https://houbb.github.io/2020/01/09/how-to-design-opencc4j-02-two-char)

[开源中文的繁简体转换 opencc4j-03-简体还是繁体，你说了算!](https://houbb.github.io/2020/01/09/how-to-design-opencc4j-03-simple-or-not)

[开源中文的繁简体转换 opencc4j-04-香港繁简体的支持](https://houbb.github.io/2020/01/09/how-to-design-opencc4j-04-hk)

[开源中文的繁简体转换 opencc4j-05-日文转换支持](https://houbb.github.io/2020/01/09/how-to-design-opencc4j-05-jp)


## Features 特点

- 严格区分「一简对多繁」和「一简对多异」。

- 完全兼容异体字，可以实现动态替换。

- 严格审校一简对多繁词条，原则为「能分则不合」。

- 词库和函数库完全分离，可以自由修改、导入、扩展。

- 兼容 Windows、Linux、Mac 平台。

- 支持自定义分词

- 支持判断单个字（词）是否为简体/繁体

- 支持返回字符串中简体/繁体的列表信息 

- 支持中国台湾、香港地区繁简体转换

- 支持与日文字的转换

# 日文转换

前不久，opencc4j 收到小伙伴的新需求。

> [能否增加日式汉字的转换](https://github.com/houbb/opencc4j/issues/52)

虽然不懂日文，但是看了下 opencc 默认是支持的。

人可以偷懒，如果没被发现的话。

# 实现流程

opencc 支持的配置文件为：

t2jp.json Traditional Chinese Characters (Kyūjitai) to New Japanese Kanji (Shinjitai) 繁體（OpenCC 標準，舊字體）到日文新字體

jp2t.json New Japanese Kanji (Shinjitai) to Traditional Chinese Characters (Kyūjitai) 日文新字體到繁體（OpenCC 標準，舊字體）

## t2jp.json

通过 JPVariants.ocd2 转换处理

## jp2t.json

通过 JPShinjitaiPhrases.ocd2=》JPShinjitaiCharacters.ocd2=》JPVariantsRev.ocd2 顺序处理。


## 简单的拓展

为了保证和以前的接口一致性，我们增加一层。保证国内小伙伴使用的丝滑体验。

```
标准简体=》标准繁体==》日文
```

整体实现逻辑保持不变。

# 功能说明

## 说明

v1.13.0 版本支持。

为保证方法的一致性，引入 `ZhJpConverterUtil` 工具类，支持方法和 `ZhConverterUtil` 保持一致。

实际流程：简体==》标准繁体==》日文新字

## 测试效果

```java
/**
 * 大陆简体==>标准繁体=》日文
 */
@Test
public void testJpTraditional() {
    String original = "我在日本学习音乐，并学习了龙的字。";
    String result = ZhJpConverterUtil.toTraditional(original);
    Assert.assertEquals("我在日本学習音楽，並学習了竜的字。", result);
}
/**
 * 日文=>标准繁体=>简体
 */
@Test
public void testJpSimple() {
    String original = "我在日本学習音楽，並学習了竜的字。";
    String result = ZhJpConverterUtil.toSimple(original);
    Assert.assertEquals("我在日本学习音乐，并学习了龙的字。", result);
}
```

# 小结

不过由于对日文不熟悉，错误的话也不太容易发现。

我是老马，期待与你的下次重逢。

## 拓展阅读

[pinyin 汉字转拼音](https://github.com/houbb/pinyin)

[pinyin2hanzi 拼音转汉字](https://github.com/houbb/pinyin2hanzi)

[segment 高性能中文分词](https://github.com/houbb/segment)

[opencc4j 中文繁简体转换](https://github.com/houbb/opencc4j)

[nlp-hanzi-similar 汉字相似度](https://github.com/houbb/nlp-hanzi-similar)

[word-checker 拼写检测](https://github.com/houbb/word-checker)

[sensitive-word 敏感词](https://github.com/houbb/sensitive-word)


* any list
{:toc}