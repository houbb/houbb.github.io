---
layout: post
title: sensitive word 敏感词(脏词) 如何忽略无意义的字符？达到更好的过滤效果？
date:  2020-1-7 10:09:32 +0800
categories: [Java]
tags: [tree, data-struct, github, sensitive, sf]
published: true
---


# 拓展阅读

[敏感词工具实现思路](https://houbb.github.io/2020/01/07/sensitive-word)

[DFA 算法讲解](https://houbb.github.io/2020/01/07/sensitive-word-dfa)

[敏感词库优化流程](https://houbb.github.io/2020/01/07/sensitive-word-slim)

[java 如何实现开箱即用的敏感词控台服务？](https://mp.weixin.qq.com/s/rQo75cfMU_OEbTJa0JGMGg)

# 忽略字符

## 说明

我们的敏感词一般都是比较连续的，比如【傻帽】

那就有大聪明发现，可以在中间加一些字符，比如【傻!@#$帽】跳过检测，但是骂人等攻击力不减。

那么，如何应对这些类似的场景呢？

我们可以指定特殊字符的跳过集合，忽略掉这些无意义的字符即可。

v0.11.0 开始支持

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

关注【老马啸西风】gzh，回复【敏感词】即可获取。

# 开源框架

> [sensitive-word](https://github.com/houbb/sensitive-word)

# 参考资料

无

* any list
{:toc}