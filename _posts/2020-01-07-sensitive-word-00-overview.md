---
layout: post
title: 各大平台连敏感词库都没有的吗？sensitive-word java 开源敏感词工具入门使用
date:  2020-1-7 10:09:32 +0800
categories: [Java]
tags: [java, github, sensitive, sf]
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

# 敏感词都没有的平台

最近某加拿大籍贯的 rapper 被曝私生活不检点，且极有可能涉及诱X未成年少女，成为一个 raper。

![胖虎](https://img-blog.csdnimg.cn/20210719235556665.jpg?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3J5bzEwNjA3MzI0OTY=,size_16,color_FFFFFF,t_70#pic_center)

当然至于是否属实，其实一个人是否是海王，微信、QQ 聊天记录里面记得清清楚楚。再上升到刑事案件的时候，TX 完全可以审查所有的历史记录。腾讯视频和某电鳗解约，也不见得毫无根据，毕竟利益相关。

但是我在整个过程中却发现两个非常值得注意的地方：

（1）其绯闻女友小怡同学，被骂到清空所有社交平台。作为吃瓜大户的 X 博，难道只会服务器瘫痪，不知道敏感词过滤吗？

（2）举报者都美竹收到大量血|腥的照片，难道各大天天吹人工智能的平台，也没有过滤的功能吗？

当然了，对于人工智能我一无所知。

但是对于敏感词，最近写了一个小工具，如果各大平台需要的话，已经开源，欢迎自取。

> [https://github.com/houbb/sensitive-word](https://github.com/houbb/sensitive-word)

至少可以把美丽的中国话脱敏下面的样子：

```
你 XXX 的，我 XXX 你 XXX，你 XXXX，XXX！！XXX！
```

# 创作目的

基于 DFA 算法实现，目前敏感词库内容收录 6W+（源文件 18W+，经过一次删减）。

后期将进行持续优化和补充敏感词库，并进一步提升算法的性能。

希望可以细化敏感词的分类，感觉工作量比较大，暂时没有进行。

这里说一下愿景吧，愿景是成为第一好用的敏感词工具。

当然，第一总是空虚的。

![空虚公子](https://img-blog.csdnimg.cn/2021071923561766.jpg?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3J5bzEwNjA3MzI0OTY=,size_16,color_FFFFFF,t_70#pic_center)

## 特性

6W+ 词库，且不断优化更新

基于 DFA 算法，性能较好

基于 fluent-api 实现，使用优雅简洁

支持敏感词的判断、返回、脱敏等常见操作

支持全角半角互换

支持英文大小写互换

支持数字常见形式的互换

支持中文繁简体互换

支持英文常见形式的互换

支持用户自定义敏感词和白名单

支持数据的数据动态更新，实时生效


# 快速开始

## 准备

- JDK1.7+

- Maven 3.x+

## Maven 引入

```xml
<dependency>
    <groupId>com.github.houbb</groupId>
    <artifactId>sensitive-word</artifactId>
    <version>0.0.15</version>
</dependency>
```

## api 概览

`SensitiveWordHelper` 作为敏感词的工具类，核心方法如下：

| 方法 | 参数 | 返回值| 说明 |
|:---|:---|:---|:---|
| contains(String) | 待验证的字符串 | 布尔值 | 验证字符串是否包含敏感词 |
| findAll(String) | 待验证的字符串 | 字符串列表 | 返回字符串中所有敏感词 |
| replace(String, char) | 使用指定的 char 替换敏感词 | 字符串 | 返回脱敏后的字符串 |
| replace(String) | 使用 `*` 替换敏感词 | 字符串 | 返回脱敏后的字符串 |

## 使用实例

所有测试案例参见 [SensitiveWordHelperTest](https://github.com/houbb/sensitive-word/blob/master/src/test/java/com/github/houbb/sensitive/word/core/SensitiveWordHelperTest.java)

### 判断是否包含敏感词

```java
final String text = "五星红旗迎风飘扬，毛主席的画像屹立在天安门前。";

Assert.assertTrue(SensitiveWordHelper.contains(text));
```

### 返回第一个敏感词

```java
final String text = "五星红旗迎风飘扬，毛主席的画像屹立在天安门前。";

String word = SensitiveWordHelper.findFirst(text);
Assert.assertEquals("五星红旗", word);
```

### 返回所有敏感词

```java
final String text = "五星红旗迎风飘扬，毛主席的画像屹立在天安门前。";

List<String> wordList = SensitiveWordHelper.findAll(text);
Assert.assertEquals("[五星红旗, 毛主席, 天安门]", wordList.toString());
```

### 默认的替换策略

```java
final String text = "五星红旗迎风飘扬，毛主席的画像屹立在天安门前。";
String result = SensitiveWordHelper.replace(text);
Assert.assertEquals("****迎风飘扬，***的画像屹立在***前。", result);
```

### 指定替换的内容

```java
final String text = "五星红旗迎风飘扬，毛主席的画像屹立在天安门前。";
String result = SensitiveWordHelper.replace(text, '0');
Assert.assertEquals("0000迎风飘扬，000的画像屹立在000前。", result);
```

# 更多特性

后续的诸多特性，主要是针对各种针对各种情况的处理，尽可能的提升敏感词命中率。

这是一场漫长的攻防之战。

## 忽略大小写

```java
final String text = "fuCK the bad words.";

String word = SensitiveWordHelper.findFirst(text);
Assert.assertEquals("fuCK", word);
```

## 忽略半角圆角

```java
final String text = "ｆｕｃｋ the bad words.";

String word = SensitiveWordHelper.findFirst(text);
Assert.assertEquals("ｆｕｃｋ", word);
```

## 忽略数字的写法

这里实现了数字常见形式的转换。

```java
final String text = "这个是我的微信：9⓿二肆⁹₈③⑸⒋➃㈤㊄";

List<String> wordList = SensitiveWordHelper.findAll(text);
Assert.assertEquals("[9⓿二肆⁹₈③⑸⒋➃㈤㊄]", wordList.toString());
```

## 忽略繁简体

```java
final String text = "我爱我的祖国和五星紅旗。";

List<String> wordList = SensitiveWordHelper.findAll(text);
Assert.assertEquals("[五星紅旗]", wordList.toString());
```

## 忽略英文的书写格式

```java
final String text = "Ⓕⓤc⒦ the bad words";

List<String> wordList = SensitiveWordHelper.findAll(text);
Assert.assertEquals("[Ⓕⓤc⒦]", wordList.toString());
```

## 忽略重复词

```java
final String text = "ⒻⒻⒻfⓤuⓤ⒰cⓒ⒦ the bad words";

List<String> wordList = SensitiveWordHelper.findAll(text);
Assert.assertEquals("[ⒻⒻⒻfⓤuⓤ⒰cⓒ⒦]", wordList.toString());
```

## 邮箱检测

```java
final String text = "楼主好人，邮箱 sensitiveword@xx.com";

List<String> wordList = SensitiveWordHelper.findAll(text);
Assert.assertEquals("[sensitiveword@xx.com]", wordList.toString());
```

# 特性配置

## 说明

上面的特性默认都是开启的，有时业务需要灵活定义相关的配置特性。

所以 v0.0.14 开放了属性配置。

## 配置方法

为了让使用更加优雅，统一使用 fluent-api 的方式定义。

用户可以使用 `SensitiveWordBs` 进行如下定义：

```java
SensitiveWordBs wordBs = SensitiveWordBs.newInstance()
        .ignoreCase(true)
        .ignoreWidth(true)
        .ignoreNumStyle(true)
        .ignoreChineseStyle(true)
        .ignoreEnglishStyle(true)
        .ignoreRepeat(true)
        .enableNumCheck(true)
        .enableEmailCheck(true)
        .enableUrlCheck(true)
        .init();

final String text = "五星红旗迎风飘扬，毛主席的画像屹立在天安门前。";
Assert.assertTrue(wordBs.contains(text));
```
## 配置说明

其中各项配置的说明如下：

| 序号 | 方法 | 说明 |
|:---|:---|:---|
| 1 | ignoreCase | 忽略大小写 |
| 2 | ignoreWidth | 忽略半角圆角 |
| 3 | ignoreNumStyle | 忽略数字的写法 |
| 4 | ignoreChineseStyle | 忽略中文的书写格式 |
| 5 | ignoreEnglishStyle | 忽略英文的书写格式 |
| 6 | ignoreRepeat | 忽略重复词 |
| 7 | enableNumCheck | 是否启用数字检测。默认连续 8 位数字认为是敏感词 |
| 8 | enableEmailCheck | 是有启用邮箱检测 |
| 9 | enableUrlCheck | 是否启用链接检测 |

# 动态加载（用户自定义）

## 情景说明

有时候我们希望将敏感词的加载设计成动态的，比如控台修改，然后可以实时生效。

v0.0.13 支持了这种特性。

## 接口说明

为了实现这个特性，并且兼容以前的功能，我们定义了两个接口。

### IWordDeny

接口如下，可以自定义自己的实现。

返回的列表，表示这个词是一个敏感词。

```java
/**
 * 拒绝出现的数据-返回的内容被当做是敏感词
 * @author binbin.hou
 * @since 0.0.13
 */
public interface IWordDeny {

    /**
     * 获取结果
     * @return 结果
     * @since 0.0.13
     */
    List<String> deny();

}
```

比如：

```java
public class MyWordDeny implements IWordDeny {

    @Override
    public List<String> deny() {
        return Arrays.asList("我的自定义敏感词");
    }

}
```

### IWordAllow

接口如下，可以自定义自己的实现。

返回的列表，表示这个词不是一个敏感词。

```java
/**
 * 允许的内容-返回的内容不被当做敏感词
 * @author binbin.hou
 * @since 0.0.13
 */
public interface IWordAllow {

    /**
     * 获取结果
     * @return 结果
     * @since 0.0.13
     */
    List<String> allow();

}
```

如：

```java
public class MyWordAllow implements IWordAllow {

    @Override
    public List<String> allow() {
        return Arrays.asList("五星红旗");
    }

}
```

## 配置使用

**接口自定义之后，当然需要指定才能生效。**

为了让使用更加优雅，我们设计了引导类 `SensitiveWordBs`。

可以通过 wordDeny() 指定敏感词，wordAllow() 指定非敏感词，通过 init() 初始化敏感词字典。

### 系统的默认配置

```java
SensitiveWordBs wordBs = SensitiveWordBs.newInstance()
        .wordDeny(WordDenys.system())
        .wordAllow(WordAllows.system())
        .init();

final String text = "五星红旗迎风飘扬，毛主席的画像屹立在天安门前。";
Assert.assertTrue(wordBs.contains(text));
```

备注：init() 对于敏感词 DFA 的构建是比较耗时的，一般建议在应用初始化的时候**只初始化一次**。而不是重复初始化！

### 指定自己的实现

我们可以测试一下自定义的实现，如下:

```java
String text = "这是一个测试，我的自定义敏感词。";

SensitiveWordBs wordBs = SensitiveWordBs.newInstance()
        .wordDeny(new MyWordDeny())
        .wordAllow(new MyWordAllow())
        .init();

Assert.assertEquals("[我的自定义敏感词]", wordBs.findAll(text).toString());
```

这里只有 `我的自定义敏感词` 是敏感词，而 `测试` 不是敏感词。

当然，这里是全部使用我们自定义的实现，一般建议使用系统的默认配置+自定义配置。

可以使用下面的方式。

### 同时配置多个

- 多个敏感词

`WordDenys.chains()` 方法，将多个实现合并为同一个 IWordDeny。

- 多个白名单

`WordAllows.chains()` 方法，将多个实现合并为同一个 IWordAllow。

例子：

```java
String text = "这是一个测试。我的自定义敏感词。";

IWordDeny wordDeny = WordDenys.chains(WordDenys.system(), new MyWordDeny());
IWordAllow wordAllow = WordAllows.chains(WordAllows.system(), new MyWordAllow());

SensitiveWordBs wordBs = SensitiveWordBs.newInstance()
        .wordDeny(wordDeny)
        .wordAllow(wordAllow)
        .init();

Assert.assertEquals("[我的自定义敏感词]", wordBs.findAll(text).toString());
```

这里都是同时使用了系统默认配置，和自定义的配置。

# spring 整合

## 背景

实际使用中，比如可以在页面配置修改，然后实时生效。

数据存储在数据库中，下面是一个伪代码的例子，可以参考 [SpringSensitiveWordConfig.java](https://github.com/houbb/sensitive-word/blob/master/src/test/java/com/github/houbb/sensitive/word/spring/SpringSensitiveWordConfig.java)

要求，版本 v0.0.15 及其以上。

## 自定义数据源

简化伪代码如下，数据的源头为数据库。

MyDdWordAllow 和 MyDdWordDeny 是基于数据库为源头的自定义实现类。

```java
@Configuration
public class SpringSensitiveWordConfig {

    @Autowired
    private MyDdWordAllow myDdWordAllow;

    @Autowired
    private MyDdWordDeny myDdWordDeny;

    /**
     * 初始化引导类
     * @return 初始化引导类
     * @since 1.0.0
     */
    @Bean
    public SensitiveWordBs sensitiveWordBs() {
        SensitiveWordBs sensitiveWordBs = SensitiveWordBs.newInstance()
                .wordAllow(WordAllows.chains(WordAllows.system(), myDdWordAllow))
                .wordDeny(myDdWordDeny)
                // 各种其他配置
                .init();

        return sensitiveWordBs;
    }

}
```

敏感词库的初始化较为耗时，建议程序启动时做一次 init 初始化。

## 动态变更

为了保证敏感词修改可以实时生效且保证接口的尽可能简化，此处没有新增 add/remove 的方法。

而是在调用 `sensitiveWordBs.init()` 的时候，根据 IWordDeny+IWordAllow 重新构建敏感词库。

因为初始化可能耗时较长（秒级别），所有优化为 init 未完成时**不影响旧的词库功能，完成后以新的为准**。

```java
@Component
public class SensitiveWordService {

    @Autowired
    private SensitiveWordBs sensitiveWordBs;

    /**
     * 更新词库
     *
     * 每次数据库的信息发生变化之后，首先调用更新数据库敏感词库的方法。
     * 如果需要生效，则调用这个方法。
     *
     * 说明：重新初始化不影响旧的方法使用。初始化完成后，会以新的为准。
     */
    public void refresh() {
        // 每次数据库的信息发生变化之后，首先调用更新数据库敏感词库的方法，然后调用这个方法。
        sensitiveWordBs.init();
    }

}
```

如上，你可以在数据库词库发生变更时，需要词库生效，主动触发一次初始化 `sensitiveWordBs.init();`。

其他使用保持不变，无需重启应用。

冠希哥微微一笑，想做事，先做人。

![冠希哥](https://img-blog.csdnimg.cn/20210719235529678.jpg?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3J5bzEwNjA3MzI0OTY=,size_16,color_FFFFFF,t_70#pic_center)

# 拓展阅读

[敏感词工具实现思路](https://houbb.github.io/2020/01/07/sensitive-word)

[DFA 算法讲解](https://houbb.github.io/2020/01/07/sensitive-word-dfa)

[敏感词库优化流程](https://houbb.github.io/2020/01/07/sensitive-word-slim)

[停止词的思考记录](https://houbb.github.io/2020/01/07/sensitive-word-stopword)

# 小结

还是那句话，我们用法律捍卫自己，但是绝不允许有些人把所有的事情都娱乐化，以为钱可以买来一切。

值此百年之际，更不能让先辈的血白流。

何况是一个三无的加拿大戏子，建议依法处置，然后(ノ｀Д)ノ（优美的中国话）

* any list
{:toc}