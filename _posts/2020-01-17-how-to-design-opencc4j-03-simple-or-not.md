---
layout: post
title: 开源中文的繁简体转换 opencc4j-03-简体还是繁体，你说了算!
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

# 这么着，还是那么着

繁简体转换，最初的设计希望让用户简单的判断一个字符串时简体、还是繁体。

但是后来不断有小伙伴提需求说不准，误判率太高。

无可奈何，为了方便解释，就像判断方法改为全部匹配。

好景不长，还是有小伙伴说一个文本中，有一些其他字符，但是希望判断是繁体之类的。

总之，众口难调。

# 让用户可以选择

虽然我一直秉持着，让用户无需选择，是最好的选择。

但是世界是复杂的，业务也是如此，我们总要学会处理各种场景。

还是决定让用户可以自己指定策略：比如全匹配、任一匹配、过半等。

接下来，就是编码工作。

# 接口与内置策略

## match 接口

接口保持最高的间接性：

```java
/**
 * 匹配策略
 *
 * @since 1.11.0
 */
public interface ZhMatch {

    /**
     * 匹配结果
     * @param text 文本
     * @param context 上下文
     * @return 结果
     */
    boolean match(final String text,
                  final ZhConvertCoreContext context);

}
```

用户只需要实现这个接口，就可以定义自己的匹配策略。

## 内置策略

当然，只有接口还是不够的。

还要为用户提供一些内置的能力，这里按照繁简体分类，共计内置了 6 种实现:

内置策略见 `ZhMatches` 工具方法。

| 策略                    | 说明       | 备注                     |
|:----------------------|:---------|:-----------------------|
| simpleAll()           | 满足全部简体   | isSimple 判断时，默认策略      |
| simpleAny()           | 满足任一简体   | -                      |
| simpleOverHalf()      | 满足超过一半简体 | -                      |
| traditionalAll()      | 满足全部繁体   | isTraditional 判断时，默认策略 |
| traditionalAny()      | 满足任一繁体   | -                      |
| traditionalOverHalf() | 满足超过一半繁体 | -                      |

当然，如果你觉得不够，可以实现属于自己的匹配策略。

# 测试验证

下面是一些如何使用的例子。

## 简体

```java
// 全部
ZhConvertBootstrap bs = ZhConvertBootstrap.newInstance()
        .isSimpleMatch(ZhMatches.simpleAll())
        .init();
String text = "123我456";
Assert.assertFalse(bs.isSimple(text));

// 任一
bs.isSimpleMatch(ZhMatches.simpleAny()).init();
Assert.assertTrue(bs.isSimple(text));
```

## 繁体

```java
// 全部
ZhConvertBootstrap bs = ZhConvertBootstrap.newInstance()
        .isTraditionalMatch(ZhMatches.traditionalAll())
        .init();
String text = "123俺們456";
Assert.assertFalse(bs.isTraditional(text));

// 任一
bs.isTraditionalMatch(ZhMatches.traditionalAny()).init();
Assert.assertTrue(bs.isTraditional(text));;
```

# 小结

用户的需求和使用场景总是复杂的，需要保持足够的灵活性。

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