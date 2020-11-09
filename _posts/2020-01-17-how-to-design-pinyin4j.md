---
layout: post
title: 如何为 java 设计一款高性能的拼音转换工具 pinyin4j
date:  2020-1-9 10:09:32 +0800
categories: [Search]
tags: [nlp, java, pinyin, sh]
published: true
---

# 拼音转换工具

拼音转换工具的思路不难：

（1）词语分词

（2）基于词库进行拼音的映射

（3）拼接最后的结果

可以认为主要下面的部分值得留意

## 准确性

作为拼音转换算法，准确性优先级应该是在性能之前的。

如果我们能保证高准确性，应该尽可能的去提高准确性。

### 词库来源

这里的词库，不包括分词的词库，仅仅指拼音的词库。

指拼音的词库，收集可以在各种优秀词库的基础上，不应该在收集上耗费太多时间。

### 分词算法

分词有许多优秀的算法，其中的学问也比较多。

分词是很多 NLP 的基础，有以下框架可供选择：

[jieba](https://github.com/huaban/jieba-analysis)

[segment](https://github.com/houbb/segment)

## 性能

性能是很多开发者的追求，天下武功，唯快不破。

所以如何提升性能呢？

主要就是从上述的 3 个流程去优化

（1）提升分词性能

（2）提升分词映射的性能

（3）提升字符串拼接的功能

- 其他方面

（1）空间换时间，比如 cache。这里的 cache 主要可以针对分词+直接的拼音结果。

（2）池化技术，多线程去处理长文本，分段并行处理。

当然这些只是思路，具体还好看测试效果。

一切用数据说话。

## 特性

### 丰富

丰富的特性往往和高性能是相悖的，有时候不得不牺牲一些东西。

最好我们的特性都是可配置的，用户使用方便，也可以避免无用的字典载入和对用户无用的计算。

个人觉得主要要有以下几点：

- 转换为拼音

正确性，支持分词。

- 多样化拼音格式

只要首字母（拼音和首字母拼音，其实在中文检索都非常有用）

保留声调，声调也可以用数字，或者声母-韵母的形式标识。

不关心声调。

输入法模式等等

- 汉字转拼音，拼音转汉字

当然如果反转，准确性难以保证。

当然，这个也是可以根据概率推断出来的。

上下文推断感觉一直是传统概率+开发的痛点，有时间还是要学习下神经网络。

- 判断是否为拼音（汉字）

- 用户自定义分词/拼音词库/自定义返回模式

- 繁简体支持

### 优雅

api 作为开发者的接入点，应该设计的简洁优雅。

当然如何才算是优雅，可能每个人有不同的解读。

api 于开发者，就如同 ui 于用户，其中的设计哲学往往被忽略。

## 内存占用

基于 utf-8 格式 dict 的词库，优点是可读性非常高，也非常利用后期维护和用户自定义。

缺点也比较明显，占用的内存较多。

### 压缩词库

类似于 TinyPinyin 的做法，我们用字节的方式存储词库。

当然这里牺牲了可读性。

### 倒排索引

当然，我们也可以反过来思考，如果觉得内存占用过大，可以放弃将 dict 加载到内存。

而是通过建立倒排索引，然后根据 index 位置去文件检索，当然这种性能会降低。

因为直接访问内存永远是最快的。

### cache

再往深处一点想，os 访问磁盘，也会利用 cache。

就算同样是 cahce，也分为 L1 L2 L3。

所以，缓存这个东西由下到上，思想永远是一致的。

如果有时间差，那就可以通过 cache 来进行弥补。

当然，这里永远涉及到时间与空间的衡量（trade-off）问题。

# 字符串拼接性能篇

众所周知，StringBuilder/StringBuffer 更适合循环的字符串拼接。

那么，还能更快吗？

这个可以借鉴 FastJson 的思想。

主要有两大块：

## 自行编写类似StringBuilder的工具类SerializeWriter。 

把java对象序列化成json文本，是不可能使用字符串直接拼接的，因为这样性能很差。

比字符串拼接更好的办法是使用java.lang.StringBuilder。

StringBuilder虽然速度很好了，但还能够进一步提升性能的，fastjson中提供了一个类似StringBuilder的 com.alibaba.fastjson.serializer.SerializeWriter。 

**SerializeWriter提供一些针对性的方法减少数组越界检查。**

例如 `public void writeIntAndChar(int i, char c) {}`，这样的方法一次性把两个值写到buf中去，能够减少一次越界检查。

目前SerializeWriter还有一些关键的方法能够减少越界检查的，我还没实现。

也就是说，如果实现了，能够进一步提升 serialize 的性能。 

- 个人收获

这里其实涉及到比较底层的知识，除却 java 中字符串的基本常识，还有一些 StringBuilder 的底层实现原理。

以前学过 C 的同学应该很好理解，String 的底层还是一个 char[]，至于这个数组的构建，就看我们如何能尽可能的优化这个构建过程。

## 使用ThreadLocal来缓存buf。 

这个办法能够减少对象分配和gc，从而提升性能。

SerializeWriter 中包含了一个 `char[] buf`，每序列化一次，都要做一次分配，使用ThreadLocal优化，能够提升性能。 

- 个人收获

ThreadLocal 我们经常用来避免线程的资源争用，这里用来避免多个分配，是一个比较有趣的角度。

原来看过一点点 FastJson 的源码，默认好像是开辟了一个非常大的数组。

按照个人感受来说，我们 99% 的文本应该是少于 1w 字的。

当然，这里需要考虑一些扩容和内存之间的平衡。

# TinyPinyin  中的优化思想

以下内容全部来自 TinyPinyin

## 单字如何判断是否为中文

对于单字符转拼音来说，要解决两个问题：

1. 判断传入的字符是否为汉字

2. 如果是汉字，则返回它的拼音

在具体解决问题前，首先要深入了解问题本身。

最直观的单字符转拼音方案是维护一张巨大的映射表，存储每一个中文字符对应的拼音，如“中”对应“ZHONG”。

那么中文字符和拼音共多少个呢？

经过简单的统计分析，发现中文字符有如下特征：

1. 中文字符共有20378个

2. 中文字符除了12295外，均分布在 19968 ~ 40869 之间 (Unicode的4E00 ~ 9FA5)，并非连续分布，此范围内夹杂了524个非中文字符

3. 拼音共有407个（不包含声调）

根据中文字符和拼音的特征，便可以设计如下的字符转拼音方案：

预先构建19968 ~ 40869的映射表，将每一个char映射为一个拼音（是中文字符）或null（不是中文字符）

判断传入的字符是否为12295，是则返回其拼音

判断传入的字符是否处于19968 ~ 40869之间，不属于则判定不是中文字符；属于的话则查预先构建的映射表，根据查到的值判断是否为中文，并返回相应的结果。

上述方案采用了查表的方法转换拼音，因此速度很快。

然而，**映射表的构建往往占据较大的内存，因此需设法降低映射表的空间占用**

## 优化策略

下文将具体阐述TinyPinyin所做的优化。

### 拼音映射表原始方案

最naive的拼音映射表的结构是：

```
char --> String // 字符 --> 拼音，如 20013(中) --> "ZHONG"
```

此方案的劣势非常明显：中文字符共有两万多个，但拼音共有407个，为每个中文字符都分配一个String对象过于浪费空间。

因此，需加以优化。

### 拼音映射表初步优化

之前统计发现拼音共有407个，那么我们可以分配一个静态的数组保存这407个拼音：

```java
static final String[] PINYIN_TABLE = new String[]{"A", "AI", ...
```

然后以拼音在数组中的位置作为此拼音的编码，如"A"对应的编码为0，"AI"的编码为1。

拼音映射表便只需存储char对应的拼音编码即可，无需存储拼音本身，大幅降低了内存消耗。

ps: 这里其实是索引的思想应用。

需要注意的是，拼音共407个，因此至少需要9位来表示一个拼音。

Java中byte为8位，short为16位，可采用short来表示一个拼音。


优化后的映射表如下：

```
char --> short // 字符 --> 拼音编码
```

内存占用为：`short[21000]` 存储映射表，共占用42KB内存，存编码的方式比直接存拼音占用空间要小很多。

ps: Short.MAX_VALUE=32767，这句话不太懂什么意思，结合后面反过来推理以下。

然而，我们注意到，编码使用9位就足够了，使用short造成了较大的浪费，每个拼音编码浪费了16 - 9 = 7位，也就是说，理想情况下我们可以将存储所有汉字拼音的42KB内存优化到 42*9/16 = 24KB。

那么如何实现呢？

请见下一步优化。

### 拼音映射表终极优化

思路是使用 byte[21000] 存储每个汉字的低8位拼音编码，另外采用byte[21000/8]来存储每个汉字第9位（最高位）的编码，每个byte可存储8个汉字的第9位编码。

共耗用内存21KB + 3KB = 24KB，整整降低了42.8%的内存占用。

当然，由于每个编码分为两部分存储，因此解码过程稍微复杂一些，不过采用位运算即可快速的计算出真实的编码：

ps: 这里需要对位运算理解相对深入。

```java
// 计算出真实的编码
short decodeIndex(byte[] paddings, byte[] indexes, int offset) {
  int index1 = offset / 8;
  int index2 = offset % 8;
  short realIndex = (short) (indexes[offset] & 0xff);

  if ((paddings[index1] & PinyinData.BIT_MASKS[index2]) != 0) {
    realIndex = (short) (realIndex | PinyinData.PADDING_MASK);
  }
  return realIndex;
}
```

# 多音字快速处理方案概览

多音字处理是汉字转拼音库的一个重要特性。

多音字的识别是基于词典实现的，这是由于绝大部分情况下，一个多音字到底该取哪个拼音，是由其所处的词决定的。

例如，对于“重”字，在“重要”一词中应读“ZHONG”，在“重庆”一词中应读“CHONG”。

在TinyPinyin中，对多音字的处理也是基于词典实现的，步骤如下图所示：

![流程](https://github.com/promeG/promeg.github.io/raw/master/img/201703/TinyPinyin1.png)

向TinyPinyin添加词典

传入待转为拼音的字符串

根据词典，对字符串进行中文分词

单独将分词得到的各个词或字符转为拼音，拼接后返回结果

在整个过程中，最为核心的部分便是分词了。

下面具体介绍分词的处理。

## 分词方案

基于词典的分词，本质上可分解为两个问题：

一是多串匹配问题。即给定一些模式串（字典中的词），在一段正文中找到所有模式串出现的位置，注意匹配可能有重叠，如"中国人民"可匹配出：["中国", "中国人", "人民"]

二是从匹配到的所有模式串集合中，按照一定的规则挑选出相互没有重叠的模式串子集，以此来得到分词结果，如上例中可挑选出的两种分词结果为：["中国", "人民"]和["中国人", "民"]

### 多串匹配算法

TinyPinyin选用了Aho–Corasick算法实现了多串匹配。

Aho-Corasick算法简称AC算法，通过将模式串预处理为确定有限状态自动机，扫描文本一遍就能结束。其复杂度为O(n)，即与模式串的数量和长度无关，非常适合应用在基于词典的分词场景。

网上有很多对AC算法原理的介绍，这里不再展开，需要注意的是，AC算法的Java实现有两个流行的版本：AC算法Java实现 和 双数组Trie树(DoubleArrayTrie)Java实现。

后者声称在降低内存占用的情况下，速度能够提升很多，因此TinyPinyin首先集成了此库作为AC算法的实现。

然而，集成后实际使用JProfiler监测发现，双数组Trie树(DoubleArrayTrie)Java实现占用的内存很高，初步分析后发现，AhoCorasickDoubleArrayTrie.loseWeight()中有一些神奇的代码：

```java
/**
 * free the unnecessary memory
 */
private void loseWeight()
{
    int nbase[] = new int[size + 65535];
    System.arraycopy(base, 0, nbase, 0, size);
    base = nbase;

    int ncheck[] = new int[size + 65535];
    System.arraycopy(check, 0, ncheck, 0, size);
    check = ncheck;
}
```

从代码中可以看到，即使是一个空词典，也至少会分配两个 int[65535]，共512KB，内存占用实在太高，
因此TinyPinyin最终选用了 [Trie树(DoubleArrayTrie)](https://github.com/hankcs/AhoCorasickDoubleArrayTrie) Java实现。

- DoubleArrayTrie

关于 Trie 树，原来个人的分词实现中，使用的也是直接基于 Map 的，内存占用是相对较多。

感觉这个双数组的模式也不错，思想应该是类似于状态机用二维表标识，从而降低内存的消耗。

TreeMap 是用一颗树的形式去标识状态流转。

当然其实性能方面，树查询时间复杂度为 `O(lg(t))`，但是双数组时间复杂度为 `O(n)`。

作者解释如下：

```
But most implementation use a TreeMap<Character, State> to store the goto structure, which costs O(lg(t)) time, t is the largest amount of a word's common prefixes. The final complexity is O(n * lg(t)), absolutely t > 2, so n * lg(t) > n . The others used a HashMap, which wasted too much memory, and still remained slowly.

I improved it by replacing the XXXMap to a Double Array Trie, whose time complexity is just O(1), thus we get a total complexity of exactly O(n), and take a perfect balance of time and memory. 

Yes, its speed is not related to the length or language or common prefix of the words of a dictionary.
```

对于 Trie 前缀树数据结构的抽取，可以建立一个框架。

支持各种算法模式：

（1）二维数组

（2）Tree Map 

### 分词选择器

分词选择器的作用是，从匹配到的所有模式串集合中，按照一定的规则挑选出相互没有重叠的模式串子集，以此来得到分词结果。

如上例中可挑选出的两种分词结果为：["中国", "人民"]和["中国人", "民"]。

常见的分词选择算法包括：正向最大匹配算法、逆向最大匹配算法、双向最大匹配算法等。

TinyPinyin选择了正向最大匹配算法，其基本思路是：从句子左端开始，不断匹配最长的词（组不了词的单字则单独划开），直到把句子划分完。

算法的思想简单直接：人在阅读时是从左往右逐字读入的，正向最大匹配法是与人的习惯相符的。

算法的具体实现请见 ForwardLongestSelector。

算法的输入是匹配到的所有模式串集合（相互之间可能存在重叠），要求输出一个符合最大正向匹配原则的相互没有重叠的模式串子集。

ps: 其实看 nlp 的说法，词库较少，逆向的正确率高于正向。双向结合是最高的。

# 优秀的 api 设计

## 基本规则

优秀的API的设计应满足正交性和完备性。

正交性：功能不重叠。

完备性：具有所有用户需要的 api

```java
toPinyin(String original, PinyinMode mode)
```

这个应该作为核心方法，可以指定返回各种模式的拼音形式。

### 便捷性

这里提一个用户使用体验问题，我个人就是这种懒人。如果能一行代码搞定，我不想写两行。

如果一个参数可以，我不想传连个参数。

那上面的 api 可以简化，其中 PinyinMode 指定一种最常见的默认形式。

```java
toPinyin(String original, PinyinMode mode)
```

### 其他

其他的各种功能，其实不一定是核心。

## 词典的自定义

### 文件式

这种相对比较简单，指定用户存放的文件路径即可。

只需要约定好格式，用户甚至不需要关心你的各种 api 设计。

### 编程式

这种相对需要一定的编程能力，对 api 的设计也有一定要求。

灵活性较好。

如果时间允许，可以二者模式都支持。


# TinyPinyin 已经做到极致了吗？

个人认为显然没有。

## 功能的不完备性

虽然作者看到了大部分情况不需要声调，并且对拼音的内存做了很多优化。

这种思想很好，对于性能和内存的追求，值得每一个开源项目学习。

但作为一个普世的的 pinyin 工具，功能的完备性将大大折扣。

个人希望做一个框架，根据用户指定，获取尽可能高性能与低内存的体验。

如今的 cpu，词典就算加载 10M 对于 jvm 又算了什么？

但是如果用户想要声调功能，只能去换工具了，这显然代价比较大。

这里主要看个人的取舍。

## SPI 的可定制化

用过 dubbo 的同学都知道，除却不直接暴露的 api，每一步处理方法都可以认为是一个 spi。

比如：

（1）分词

可以细化为 Trie 的实现。

（2）字典映射

（3）结果拼接

（4）拼音模式处理

这些都应该提供对应的 spi，原因也很简单。

用户可以根据自己的喜好去自定义，因为不同的业务有不同的应用场景。

还有一点就是我们自己的实现往往不是最优的。

同样是分词，基于双数组时间复杂度为 O(n)，基于 TreeMap 为 O(log(n))，甚至有 paper 可以对这个过程继续优化。

所以如果对方追求极致的性能，这需要多个部分的协作。

个人比较推崇 spi 的可定制化。

## 性能

针对性能，TinyPinyin 也有一些可以优化的点。

就我个人而言，目前能看到两个地方：

（1）大文本并行处理

（2）结果 cache 处理

当然这里也是同样的问题，每一个地方都值得深入研究。

# 拓展阅读

[倒排索引原理与实现](https://houbb.github.io/2020/01/09/reverse-index)

[jieba 分词原理](https://houbb.github.io/2020/01/08/jieba-source)

[繁简体转换](https://houbb.github.io/2020/01/08/jieba-chinese-format)

[Cache 系列学习](https://houbb.github.io/2018/09/01/cache-01-talk)

## 关联框架 

[segment](https://github.com/houbb/segment)

[opencc4j](https://github.com/houbb/opencc4j)

trie 

cache

string-connector

executor

# 参考资料

[为什么Fastjson能够做到这么快?](https://blog.csdn.net/u012961566/article/details/76944982)

[2017-03-19-tinypinyin-part-1.markdown](https://github.com/promeG/promeg.github.io/blob/master/_posts/2017-03-19-tinypinyin-part-1.markdown)

[正向、逆向、双向最大匹配算法](https://my.oschina.net/butaixianran/blog/164042)

## 相关资料

[js 版本](https://github.com/hotoo/pinyin)

[相关资料](https://github.com/overtrue/pinyin-resources)

https://github.com/mozillazg/pinyin-data

https://github.com/mozillazg/phrase-pinyin-data

https://blog.csdn.net/sofeware333/article/details/91433540

TinyPinyin

pinyin4j

* any list
{:toc}