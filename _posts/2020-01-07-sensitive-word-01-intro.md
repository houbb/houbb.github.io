---
layout: post
title: sensitive-word java 如何实现一个敏感词工具？违禁词实现思路梳理
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

# 开源地址

为了便于大家学习，项目开源地址如下，欢迎 fork+star 鼓励一下老马~

> [sensitive-word](https://github.com/houbb/sensitive-word)

# 敏感词

我们只要是涉及到用户可以自由发表言论的网站，或者说收集对应的信息。

都会涉及到用户的输入词敏感问题。

## 敏感类别

类似于直接给敏感词打一个标签。(label)

- 内容安全

内容暴露个人信息。

身份证，密码，手机号。银行卡号。

用户名，出生年月，家庭住址。年龄。

- 暴力色情

- 反动违法

- 广告推广垃圾信息

qq

微信（公众号，等等）

地址，网址。

- 流言蜚语（造谣）

- 诈骗

- 其他

最好可以对敏感词进行分类。

## 敏感词的来源

- 内置常见的网站和开源项目词典

- 用户自定义

# api 设计

FindAll, Validate, Filter and Replace words.

## 是否包含

valid() 是否合法，这个和是否包含敏感词恰恰相反。

contains() 是否包含敏感词

findAll() 发现所有

findFirst() 发现第一个

## 返回的信息

可以是 (start, end, word, label)

也可以指定只返回 word，

## filter

filter("xxx") 默认直接移除

filter("xxx", "*") 全部使用指定的词语代替

不指定和指定字符串只是一种过滤策略的默认形式。

filter("xxx", FilterStrategy) 默认的替换策略。

### 拼音策略

直接使用拼音替代

这种功能应该放在拓展模块，引入特定的拓展包。不作为核心必须功能。

## 噪音模式

这里可以用【停顿词】替换，默认使用停顿词。

当然也可以用户自定义停顿词，进行文本信息的降噪处理。

比如：

```
你这个坏x人
```

我们如果认为 `x` 是噪音，就可以直接忽略这个词，进而将【坏人】合成一个新的词汇。

## 递归处理

如果一句话，替换以后也可能出现敏感词，这个就可以使用递归模式处理。

比如：

```
坏坏人人
```

`坏人` 直接移除，剩下的还是 `坏人`，所以如果直接使用移除策略，是比较麻烦的。

ps: 直接使用 DFA 算法试试。

# 相关优化

## 文件处理

将所有的敏感词直接处理为单个文件。（如果未作分类的话）

尽量西分开：

（1）广告

（2）停顿词等等

便于后期处理。

## 停顿词

停顿词的引入。

## 大小写，全角半角

忽略英文大小写

## 繁简体

忽略繁简体。（拓展）

直接将所有内容转换为统一的简体处理。

## 拼音

所有敏感词的拼音引入（拓展）

拼音首字母，或者任何一个变为拼音（或者首字母）

## 翻转

直接进行全拼的翻转。这里针对：

（1）政治类

（2）色情暴力类

提升级别。

## 提升准确率

可以考虑引入单词的频率。

# 相关技术

## DFA 算法

【停止维护】使用DFA算法实现的内容安全,反垃圾,智能鉴黄,敏感词过滤,不良信息检测，文本校验，敏感词检测，包括关键词提取，过滤html标签等。

使用DFA算法实现的敏感词过滤。主要用于实现数据文本的内容安全,反垃圾,智能鉴黄,敏感词过滤,不良信息检测，携带文本的关键词获取。

- 过滤SQL脚本

- 过滤script标签

- 过滤html标签

以上非法攻击类暂时不做优先处理。

- 过滤中文字符

- 过滤英文字符

- 过滤数字

- 过滤字母

- 过滤汉字

- 自定义过滤，可由后台自动删除添加。提供完善的API。

具体通过实现DFA算法实现对敏感词、广告词的过滤功能：

1、匹配大小写过滤

2、匹配全角半角过滤

3、匹配过滤停顿词过滤。

支持如下类型类型过滤检测：

```
fuck 全小写
FuCk 大小写
ｆｕｃｋ全角半角
f!!!u&c ###k 停顿词
fffuuuucccckkk 重复词
```

## AC 自动机

AC自动机

## Trie 树

提升性能。

又称单词查找树，trie树，是一种树形结构，是一种哈希树的变种。

典型应用是用于统计，排序和保存大量的字符串（但不仅限于字符串），所以经常被搜索引擎系统用于文本词频统计。

它的优点是：

**利用字符串的公共前缀来减少查询时间，最大限度地减少无谓的字符串比较，查询效率比哈希树高。**

关于trie树详细信息请自行baidu

## 其他框架-拓展功能

[opencc4j-繁简体转换框架](https://github.com/houbb/opencc4j)

pinyin 转换框架

全角半角之间的转换。

# 拓展阅读

[DFA 算法学习](https://houbb.github.io/2020/01/07/sensitive-word-dfa)

# 参考资料

## github 项目

https://github.com/hymer/sensitivewords

https://github.com/importcjj/sensitive

https://github.com/fanhua1994/DzFilter

https://github.com/lzxz1234/SensitiveWordFilter

https://github.com/NewbieGameCoder/IllegalWordsDetection

https://github.com/k5h9999/keywordfilter

https://github.com/hailin0/sensitive-word-filter

https://github.com/lining0806/TextFilter/

https://github.com/qloog/sensitive_words

[Golang基于DFA算法实现的敏感词过滤](https://github.com/antlinker/go-dirtyfilter)

[textfilter](https://github.com/observerss/textfilter)

[DFA-js](https://github.com/Ldundun/DFA/blob/master/dfa.js)

[互联网常用敏感词、停止词词库](https://github.com/fwwdn/sensitive-stop-words)

[敏感词过滤、广告词过滤、包含敏感词库，停顿词库。](https://github.com/andyzty/sensitivewd-filter)

* any list
{:toc}