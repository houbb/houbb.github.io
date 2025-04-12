---
layout: post
title: 开源中文的繁简体转换 opencc4j-04-香港繁简体的支持
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

# 香港异体字的转换

对于中国台|湾的的转换支持很早就实现了，非常感谢一个湾湾的研发小伙伴。

但是香港地区的一直没有实现，不过还是会受到一些相关需求。

> [我看只有台湾，请问下有香港的繁体转化支持吗](https://github.com/houbb/opencc4j/issues/44)

虽然不太懂香港地区的用字习惯，但是还是硬着头皮上了。

# 实现流程

## opencc

opencc 支持的配置文件为：

s2hk.json Simplified Chinese to Traditional Chinese (Hong Kong variant) 簡體到香港繁體

hk2s.json Traditional Chinese (Hong Kong variant) to Simplified Chinese 香港繁體到簡體

t2hk.json Traditional Chinese (OpenCC Standard) to Hong Kong variant 繁體（OpenCC 標準）到香港繁體

## 核心流程

这里的簡體到香港繁體，实际上经历了两个步骤：

```
标准简体=》标准繁体==》香港异体字处理
```

所以转换这个不分，我们在繁体的基础上，拓展一下对应的处理。


# 中国香港繁体和大陆简体转换

## 说明

v1.12.0 版本支持。

为保证方法的一致性，引入 `ZhHkConverterUtil` 工具类，支持方法和 `ZhConverterUtil` 保持一致。

## 例子

```java
/**
 * 大陆简体==>香港正體
 * @since 1.12.0
 */
@Test
public void testHkTraditional() {
    String original = "千家万户瞳瞳日 总把新桃换旧符";
    String result = ZhHkConverterUtil.toTraditional(original);
    Assert.assertEquals("千家萬户瞳瞳日 總把新桃換舊符", result);
}

/**
 * 香港正體==>大陆简体
 */
@Test
public void testHkSimple() {
    String original = "千家萬户瞳瞳日 總把新桃換舊符";
    String result = ZhHkConverterUtil.toSimple(original);
    Assert.assertEquals("千家万户瞳瞳日 总把新桃换旧符", result);
}
```

# 小结

到这里，会发现以前自己的接口设计的不够优雅，拓展起来有些麻烦。

当然，这些都是后话，以后有时间再做对应的改造。

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