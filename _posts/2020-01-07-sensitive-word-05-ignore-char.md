---
layout: post
title: sensitive word 敏感词(脏词) 如何忽略无意义的字符？达到更好的过滤效果？
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

# 忽略字符

## 说明

我们的敏感词一般都是比较连续的，比如 傻帽

那就有大聪明发现，可以在中间加一些字符，比如【傻!@#$帽】跳过检测，但是骂人等攻击力不减。

那么，如何应对这些类似的场景呢？

我们可以指定特殊字符的跳过集合，忽略掉这些无意义的字符即可。

v0.11.0 开始支持

![忽略字符](https://img-blog.csdnimg.cn/direct/1fd8876512a24d1c92e73bb29dcbf1e3.jpeg#pic_center)

## 例子

其中 charIgnore 对应的字符策略，用户可以自行灵活定义。

```java
final String text = "傻@冒，狗+东西";

//默认因为有特殊字符分割，无法识别
List<String> wordList = SensitiveWordBs.newInstance().init().findAll(text);
Assert.assertEquals("[]", wordList.toString());

// 指定忽略的字符策略，可自行实现。
List<String> wordList2 = SensitiveWordBs.newInstance()
        .charIgnore(SensitiveWordCharIgnores.specialChars())
        .init()
        .findAll(text);

Assert.assertEquals("[傻@冒, 狗+东西]", wordList2.toString());
```

# 敏感词标签

## 说明

有时候我们希望对敏感词加一个分类标签：比如社情、暴/力等等。

这样后续可以按照标签等进行更多特性操作，比如只处理某一类的标签。

支持版本：v0.10.0

## 入门例子

### 接口

这里只是一个抽象的接口，用户可以自行定义实现。比如从数据库查询等。

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

### 配置文件

我们可以自定义 dict 标签文件，通过 WordTags.file() 创建一个 WordTag 实现。

- dict_tag_test.txt

```
五星红旗 政-治,国家
```

格式如下：

```
敏感词 tag1,tag2
```

### 实现

具体的效果如下，在引导类设置一下即可。

默认的 wordTag 是空的。

```java
String filePath = "dict_tag_test.txt";
IWordTag wordTag = WordTags.file(filePath);

SensitiveWordBs sensitiveWordBs = SensitiveWordBs.newInstance()
        .wordTag(wordTag)
        .init();

Assert.assertEquals("[政-治, 国家]", sensitiveWordBs.tags("五星红旗").toString());;
```

后续会考虑引入一个内置的标签文件策略。

# 更多资料

## 敏感词控台

有时候敏感词有一个控台，配置起来会更加灵活方便。

> [java 如何实现开箱即用的敏感词控台服务？](https://mp.weixin.qq.com/s/rQo75cfMU_OEbTJa0JGMGg)

## 敏感词标签文件

梳理了大量的敏感词标签文件，可以让我们的敏感词更加方便。

这两个资料阅读可在下方文章获取：

> [v0.11.0-敏感词新特性](https://mp.weixin.qq.com/s/m40ZnR6YF6WgPrArUSZ_0g)

# 拓展阅读

[敏感词工具实现思路](https://houbb.github.io/2020/01/07/sensitive-word)

[DFA 算法讲解](https://houbb.github.io/2020/01/07/sensitive-word-dfa)

[敏感词库优化流程](https://houbb.github.io/2020/01/07/sensitive-word-slim)

[java 如何实现开箱即用的敏感词控台服务？](https://mp.weixin.qq.com/s/rQo75cfMU_OEbTJa0JGMGg)

[各大平台连敏感词库都没有的吗？](https://mp.weixin.qq.com/s?__biz=MzUyNjE3OTAyMw==&mid=2247485308&idx=1&sn=8ebb39b0cecde7f2458769a79396b2d3&chksm=fa1388dccd6401cabd640c3e3f4de33262d4e68d049ca478d18a0cd2f10deecdd87e0060394e&token=617356039&lang=zh_CN#rd)

[sensitive-word 敏感词/脏词开源工具-v.0.10.0-脏词分类标签支持](https://juejin.cn/post/7308782855941292058?searchId=20231209140414C082B3CCF1E7B2316EF9)

# 开源框架

> [sensitive-word](https://github.com/houbb/sensitive-word)

# 参考资料

无

* any list
{:toc}